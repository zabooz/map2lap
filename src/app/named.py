"""Python under names of its own on Windows: "Map2Lap Server", "Map2Lap Build" and "Map2Lap Worker" in the Task Manager's
Details tab, not a row of python.exe. Its Processes tab shows the file's description, "Python", whatever the name: changing
that would break the file's signature.

A named one is a copy of python.exe: ~100 KB, the interpreter is its DLL, the signature stays valid. A release's copies lie
beside its python.exe in python/ (an update replaces that folder, the next start makes them again). Any other Python (a
developer's venv) isn't ours to write into: out/python/ holds the copies with the DLLs they load, and PYTHONHOME and
PYTHONPATH find the rest. Whatever goes wrong leaves plain python: a name isn't worth a failed build. On Linux nothing
changes.
"""
import glob
import os
import shutil
import subprocess
import sys

from app.paths import ROOT

WIN = os.name == "nt"
NAMES = {"server": "Map2Lap Server", "build": "Map2Lap Build", "worker": "Map2Lap Worker"}
LAUNCHER_VAR = "__PYVENV_LAUNCHER__"    # (a venv's python.exe sets it: a copy would take itself for that venv's)
CHECK_TIMEOUT_S = 60.0
_made = {}


def is_named(path):
    """Whether the program at path is one of ours. Pure."""
    return os.path.splitext(os.path.basename(path))[0] in NAMES.values()


def where(base, root):
    """(the folder for the copies of the Python at base, whether they lie apart from it) with the project at root: beside
    a release's own, else out/python. Pure."""
    home = os.path.dirname(base)
    if os.path.normcase(os.path.normpath(home)) == os.path.normcase(os.path.normpath(os.path.join(root, "python"))):
        return home, False
    return os.path.join(root, "out", "python"), True


def _fresh(src, dst):
    """Whether dst is the copy of src (copy2 keeps the time; a new Python has another)."""
    if not os.path.exists(dst):
        return False
    a, b = os.stat(src), os.stat(dst)
    return a.st_size == b.st_size and int(a.st_mtime) == int(b.st_mtime)


def _copy(src, dst):
    """src to dst, whole or not at all: builds run side by side."""
    tmp = f"{dst}.{os.getpid()}.tmp"
    shutil.copy2(src, tmp)
    try:
        os.replace(tmp, dst)
    except OSError:
        os.remove(tmp)
        raise


def child_env(apart=None):
    """The environment for a named copy, as a new dict. apart: its folder lies apart from Python (default: as made)."""
    env = dict(os.environ)
    if apart is None:
        apart = _made.get("apart", False)
    if apart and not is_named(sys.executable):
        env.pop(LAUNCHER_VAR, None)
        env["PYTHONHOME"] = sys.base_prefix
        if sys.prefix != sys.base_prefix:       # (a venv's packages)
            site = os.path.join(sys.prefix, "Lib", "site-packages")
            env["PYTHONPATH"] = os.pathsep.join(p for p in (site, env.get("PYTHONPATH")) if p)
    return env


def _check(path, apart):
    """Whether the copy at path starts and finds our packages (a virus scanner may stop it)."""
    r = subprocess.run([path, "-c", "import numpy"], env=child_env(apart), capture_output=True, timeout=CHECK_TIMEOUT_S)
    return r.returncode == 0


def make(base, root):
    """The named copies of the Python at base made as far as needed: (their folder, whether apart from it), (None, False)
    when they don't run."""
    folder, apart = where(base, root)
    home = os.path.dirname(base)
    want = {os.path.join(folder, n + ".exe"): base for n in NAMES.values()}
    if apart:
        for dll in glob.glob(os.path.join(home, "python3*.dll")) + glob.glob(os.path.join(home, "vcruntime*.dll")):
            want[os.path.join(folder, os.path.basename(dll))] = dll
    new = [dst for dst, src in want.items() if not _fresh(src, dst)]
    if not new:
        return folder, apart
    os.makedirs(folder, exist_ok=True)
    for dst in new:
        _copy(want[dst], dst)
    first = os.path.join(folder, NAMES["worker"] + ".exe")
    if _check(first, apart):
        return folder, apart
    for n in NAMES.values():
        os.remove(os.path.join(folder, n + ".exe"))
    return None, False


def _prepare():
    """_made's folder and apart, once per process."""
    if "folder" in _made:
        return
    folder, apart = None, False
    if WIN:
        if is_named(sys.executable):
            folder = os.path.dirname(sys.executable)
        else:
            try:
                folder, apart = make(os.path.realpath(getattr(sys, "_base_executable", sys.executable)), ROOT)
            except (OSError, subprocess.SubprocessError):
                pass
    _made.update(folder=folder, apart=apart)


def exe(role):
    """The program for role ("server", "build", "worker"): its named copy, else this Python."""
    _prepare()
    return os.path.join(_made["folder"], NAMES[role] + ".exe") if _made["folder"] else sys.executable


def use_for_workers(ctx):
    """Make the spawn context ctx start its processes as "worker", which then inherit this process's environment."""
    path = exe("worker")
    if path != sys.executable:
        env = child_env()
        os.environ.pop(LAUNCHER_VAR, None)
        os.environ.update(env)
        ctx.set_executable(path)


def restart_as(role):
    """This program again under role's name, and end with its exit code (Start Map2Lap.bat reads it: an update's 75). Returns
    where that can't be: this one goes on. The one started here stays, waiting: a small python.exe in the Task Manager."""
    if not WIN or is_named(sys.executable):
        return
    path = exe(role)
    if path == sys.executable:
        return
    try:
        code = subprocess.call([path, *sys.orig_argv[1:]], env=child_env())
    except OSError:
        return
    except KeyboardInterrupt:
        code = 130
    sys.exit(code)
