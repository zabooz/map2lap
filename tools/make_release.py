"""Build the release archives: dist/Map2Lap-<version>-win64.zip and dist/Map2Lap-<version>-linux-x64.tar.gz (one folder
"Map2Lap" inside: a new version can be unpacked over an old one and keeps its map data cache and settings)

Contents: Map2Lap's files (from git, without the developer tools and the other system's start files and Rust module),
BeamNG.Earth (what its server reads at runtime), the CC0 textures (colour maps only) and a Python of its own with the
packages from requirements.txt. Users unpack it and double-click "Start Map2Lap.bat" (Windows) or Map2Lap.desktop
(Linux, or run start.sh); nothing gets installed.

    .venv\\Scripts\\python.exe tools\\make_release.py [--win | --linux]

Both are built on Windows. The Python has the same version as the one running this script: Windows python.org's
embeddable package (vendor/beamng_earth/server/earthfast.pyd is built for it), Linux python-build-standalone with the
packages' manylinux wheels (earthfast.abi3.so needs any Python >= 3.10). The Linux archive is written by tarfile
itself: the Windows folder can't hold its symlinks and execute bits.
"""
import argparse
import glob
import hashlib
import io
import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
from app import version  # noqa: E402

PY_VERSION = "%d.%d.%d" % sys.version_info[:3]
PY_URL = f"https://www.python.org/ftp/python/{PY_VERSION}/python-{PY_VERSION}-embed-amd64.zip"
# Linux' Python: python-build-standalone (astral-sh), the last build of PY_VERSION, checked against its SHA256SUMS;
# the stripped one (with debug symbols libpython and python3.12 alone are 310 MB)
PBS_TAG = "20250529"
PBS_URL = (f"https://github.com/astral-sh/python-build-standalone/releases/download/{PBS_TAG}/"
           f"cpython-{PY_VERSION}+{PBS_TAG}-x86_64-unknown-linux-gnu-install_only_stripped.tar.gz")
PBS_SHA256 = {"3.12.10": "f50d08e0304b15d752b22932047135c1dc02f81977b284e51288be9d90627bca"}
# the packages' wheels for Linux: glibc 2.17 up to 2.35, earthfast.abi3.so's (pip doesn't count down from the
# newest itself: with only manylinux_2_35 it finds no numpy, whose wheels are manylinux_2_27/2_28)
LINUX_WHEELS = (*(a for i in range(17, 36) for a in ("--platform", f"manylinux_2_{i}_x86_64")),
                "--python-version", "%d.%d" % sys.version_info[:2], "--implementation", "cp", "--only-binary=:all:")
DIST = os.path.join(HERE, "dist")
NAME = "Map2Lap"
# developer-only parts (in the repository, not in the release)
SKIP = ("tools/", ".gitignore", ".gitattributes", "AGENTS.md", "CLAUDE.md",
        "vendor/beamng_earth/server/tests/",
        "vendor/beamng_earth/native/", "vendor/beamng_earth/docs/", "vendor/beamng_earth/probes/",
        "vendor/beamng_earth/mod/",     # (the BeamNG mod: the server only reads it in its own developer tools)
        "vendor/beamng_earth/tools/", "vendor/beamng_earth/beammp/")
# what only the other system needs
ONLY = {"win": ("Start Map2Lap.bat", "vendor/beamng_earth/server/earthfast.pyd"),
        "linux": ("start.sh", "Map2Lap.desktop", "vendor/beamng_earth/server/earthfast.abi3.so")}
EXECUTABLE = ("start.sh", "Map2Lap.desktop")     # (Linux: started by a double-click)
# what Map2Lap reads from inside SKIP (the road signs' materials and lettering: make_obj.ROADSIDE)
KEEP = ("vendor/beamng_earth/mod/beamng_earth/levels/beamng_earth/art/shapes/beamngEarth/roadside/",)
TEXTURES = os.path.join("assets", "textures")


def files(system):
    """The project's files for system ("win", "linux"): tracked and new ones git doesn't ignore, without SKIP (but
    with KEEP) and without the other system's ONLY."""
    out = subprocess.run(["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"], cwd=HERE,
                         capture_output=True, check=True).stdout.decode("utf-8").split("\0")
    other = tuple(f for s, fs in ONLY.items() if s != system for f in fs)
    return sorted(f for f in set(out) if f and (f.startswith(KEEP) or not f.startswith(SKIP)) and f not in other
                  and os.path.isfile(os.path.join(HERE, f)))


def textures():
    """The colour maps: [(path, path in the release)]."""
    colour = glob.glob(os.path.join(HERE, TEXTURES, "*", "*_Color.jpg"))
    if len(colour) < 10:
        raise SystemExit("Textures missing: run tools\\get_textures.py first")
    return [(p, "/".join(("assets", "textures", os.path.basename(os.path.dirname(p)), os.path.basename(p))))
            for p in colour]


def fetch(url, sha256=None):
    """url downloaded once into dist/ (checked against sha256 when given); its path."""
    os.makedirs(DIST, exist_ok=True)
    cached = os.path.join(DIST, os.path.basename(url).replace("+", "_"))
    if not os.path.exists(cached):
        print(f"Downloading {url} ...", flush=True)
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": version.USER_AGENT}),
                                    timeout=300) as r, open(cached + ".part", "wb") as f:
            shutil.copyfileobj(r, f)
        os.replace(cached + ".part", cached)
    if sha256:
        with open(cached, "rb") as f:
            if hashlib.file_digest(f, "sha256").hexdigest() != sha256:
                os.remove(cached)
                raise SystemExit(f"{os.path.basename(cached)}: wrong SHA-256, deleted (run again)")
    return cached


def pip_install(target, *extra):
    print("Installing the packages ...", flush=True)
    subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "--disable-pip-version-check",
                    "--target", target, *extra, "-r", os.path.join(HERE, "requirements.txt")], check=True)


def embedded_python(dst):
    """Python's embeddable package into dst/python, site-packages and src/ on its path, the packages."""
    py = os.path.join(dst, "python")
    with zipfile.ZipFile(fetch(PY_URL)) as z:
        z.extractall(py)
    pth = glob.glob(os.path.join(py, "python*._pth"))[0]
    stdlib = os.path.basename(glob.glob(os.path.join(py, "python*.zip"))[0])
    with open(pth, "w", encoding="utf-8") as f:     # (..\src: Map2Lap's code; a ._pth adds no script folder)
        f.write(f"{stdlib}\n.\nLib\\site-packages\n..\\src\nimport site\n")
    pip_install(os.path.join(py, "Lib", "site-packages"))


def build_win():
    zname = f"Map2Lap-{version.VERSION}-win64"
    dst = os.path.join(DIST, NAME)
    shutil.rmtree(dst, ignore_errors=True)
    fs = files("win")
    print(f"{zname}: {len(fs)} files", flush=True)
    for f in fs:
        os.makedirs(os.path.dirname(os.path.join(dst, f)) or dst, exist_ok=True)
        shutil.copy2(os.path.join(HERE, f), os.path.join(dst, f))
    for p, rel in textures():
        out = os.path.join(dst, rel)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        shutil.copy2(p, out)
    embedded_python(dst)
    print("Zipping ...", flush=True)
    archive = shutil.make_archive(os.path.join(DIST, zname), "zip", root_dir=DIST, base_dir=NAME)
    longest = max((len(os.path.relpath(os.path.join(r, f), DIST)) for r, _, fs_ in os.walk(dst) for f in fs_))
    print(f"longest path in the zip: {longest} characters (Windows: 260 in all)")
    print(f"{archive}: {os.path.getsize(archive) / 1e6:.0f} MB")


def _add(tar, path, name, mode):
    """One file from disk into tar as name, owned by nobody in particular (root 0/0), with mode."""
    info = tar.gettarinfo(path, name)
    info.mode, info.uid, info.gid, info.uname, info.gname = mode, 0, 0, "", ""
    with open(path, "rb") as f:
        tar.addfile(info, f)


def build_linux():
    tname = f"Map2Lap-{version.VERSION}-linux-x64"
    if PY_VERSION not in PBS_SHA256:
        raise SystemExit(f"No python-build-standalone checksum for {PY_VERSION}: set PBS_TAG and PBS_SHA256")
    pbs = fetch(PBS_URL, PBS_SHA256[PY_VERSION])
    site = "python/lib/python%d.%d/site-packages" % sys.version_info[:2]
    fs = files("linux")
    print(f"{tname}: {len(fs)} files", flush=True)
    archive = os.path.join(DIST, tname + ".tar.gz")
    with tempfile.TemporaryDirectory(dir=DIST) as tmp:
        pip_install(tmp, *LINUX_WHEELS)
        with tarfile.open(archive + ".part", "w:gz", format=tarfile.PAX_FORMAT) as tar:
            for f in fs:
                _add(tar, os.path.join(HERE, f), f"{NAME}/{f}", 0o755 if f in EXECUTABLE else 0o644)
            for p, rel in textures():
                _add(tar, p, f"{NAME}/{rel}", 0o644)
            with tarfile.open(pbs) as src:          # (python/...: bin, lib with its symlinks and modes as built)
                for m in src.getmembers():
                    data = src.extractfile(m) if m.isfile() else None
                    m.name = f"{NAME}/{m.name}"
                    if m.islnk():
                        m.linkname = f"{NAME}/{m.linkname}"
                    m.uid, m.gid, m.uname, m.gname = 0, 0, "", ""
                    tar.addfile(m, data)
            for root, _, names in os.walk(tmp):
                for n in names:
                    p = os.path.join(root, n)
                    rel = os.path.relpath(p, tmp).replace(os.sep, "/")
                    if "/__pycache__/" not in f"/{rel}" and not rel.startswith("bin/"):   # (no console scripts)
                        _add(tar, p, f"{NAME}/{site}/{rel}", 0o644)
    os.replace(archive + ".part", archive)
    print(f"{archive}: {os.path.getsize(archive) / 1e6:.0f} MB")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--win", action="store_true", help="only the Windows zip")
    ap.add_argument("--linux", action="store_true", help="only the Linux archive")
    a = ap.parse_args()
    if a.win or not a.linux:
        build_win()
    if a.linux or not a.win:
        build_linux()


if __name__ == "__main__":
    main()
