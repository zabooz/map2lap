"""Update BeamNG.Earth (vendored): the new version unmodified onto the branch "upstream", then merge it into the main
branch and build the reference track again.

    .venv\\Scripts\\python.exe update_beamng_earth.py                 # download the main branch from GitHub
    .venv\\Scripts\\python.exe update_beamng_earth.py <file.zip>      # or a downloaded ZIP
    ... --no-merge      only update upstream (see the changes: git diff main upstream -- vendor)
    ... --no-check      without the reference build
    ... --build-native  only rebuild earthfast (after resolving conflicts by hand)

Our changes to BeamNG.Earth are commits of their own on the main branch (or live in our own files, e.g.
build_tiles.py); git keeps them when merging. Git reports conflicts, resolve them by hand then.
After the merge the Rust module earthfast is rebuilt with our patches (else their .pyd without them would be used);
conflicts only in the .pyd/.so are resolved by the script itself (theirs, then rebuilt).
Don't run it while a build is running (the generator reads vendor/beamng_earth).
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile

import version

HERE = os.path.dirname(os.path.abspath(__file__))
VENDOR = "vendor/beamng_earth"
URL = "https://github.com/TecnaGamer/BeamNG.Earth/archive/refs/heads/main.zip"
GIT = shutil.which("git") or r"C:\Program Files\Git\cmd\git.exe"
REF = os.path.join(HERE, "out", "reference.json")      # figures of the last reference build
REF_ROUTE = dict(points=[(46.66, 14.63), (46.647, 14.623)], width=120.0, name="stausee_test", title="Stausee Test")
NATIVE = os.path.join(HERE, *VENDOR.split("/"), "native", "earthfast")
PYD = f"{VENDOR}/server/earthfast.pyd"
BINARIES = (PYD, f"{VENDOR}/server/earthfast.abi3.so")     # (conflicts in them: theirs, the .pyd is rebuilt)
CARGO_BIN = os.path.join(os.path.expanduser("~"), ".cargo", "bin")
DLLTOOL = os.path.join(os.path.expanduser("~"), ".cargo", "dlltool-llvm")     # (copy of llvm-ar.exe, docs/DEVELOPMENT.md)


def git(*args, cwd=HERE, check=True):
    r = subprocess.run([GIT, *args], cwd=cwd, capture_output=True, text=True, encoding="utf-8")
    if check and r.returncode:
        raise SystemExit(f"git {' '.join(args)}:\n{r.stdout}{r.stderr}")
    return r.stdout.strip()


def fetch(src, tmp):
    """Unpack the ZIP (path or GitHub); returns the folder with the repo contents."""
    if src is None:
        src = os.path.join(tmp, "upstream.zip")
        print(f"Downloading {URL} ...", flush=True)
        req = urllib.request.Request(URL, headers={"User-Agent": version.USER_AGENT})
        with urllib.request.urlopen(req, timeout=120) as r, open(src, "wb") as f:
            shutil.copyfileobj(r, f)
    out = os.path.join(tmp, "x")
    with zipfile.ZipFile(src) as z:     # (only unpack, run nothing from it)
        z.extractall(out)
    tops = os.listdir(out)
    return os.path.join(out, tops[0]) if len(tops) == 1 else out


def commit_upstream(repo_dir, tmp):
    """The contents of repo_dir unmodified as a new commit on "upstream"; returns (version, changed?)."""
    wt = os.path.join(tmp, "wt")
    git("worktree", "add", wt, "upstream")
    try:
        dst = os.path.join(wt, *VENDOR.split("/"))
        shutil.rmtree(dst, ignore_errors=True)
        shutil.copytree(repo_dir, dst, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
        with open(os.path.join(dst, "VERSION"), encoding="utf-8") as f:
            version = f.read().strip()
        git("-c", "core.autocrlf=false", "add", "-A", cwd=wt)
        if not git("status", "--porcelain", cwd=wt):
            return version, False
        git("-c", "core.autocrlf=false", "commit", "-q", "-m", f"BeamNG.Earth {version}, unmodified", cwd=wt)
        return version, True
    finally:
        git("worktree", "remove", "--force", wt, check=False)


def reference_build():
    """Build the reference track and compare it with the last run (triangles per kind, start)."""
    import generator
    res = generator.build(REF_ROUTE["points"], REF_ROUTE["width"], REF_ROUTE["name"], REF_ROUTE["title"])
    now = {"tris": res["tris"], "tiles": res["tiles"]}
    if os.path.exists(REF):
        with open(REF, encoding="utf-8") as f:
            old = json.load(f)
        print("\nCompared with the last reference build (triangles):")
        for k in sorted(set(old["tris"]) | set(now["tris"])):
            a, b = old["tris"].get(k, 0), now["tris"].get(k, 0)
            d = (b - a) / a * 100 if a else float("inf")
            print(f"  {k:8} {a:>10,} -> {b:>10,}  ({d:+.1f} %)" + ("   <-- check" if abs(d) > 5 else ""))
    with open(REF, "w", encoding="utf-8") as f:
        json.dump(now, f, indent=1)


def build_native():
    """Build earthfast with our patches (Rust stable-x86_64-pc-windows-gnu) and put it in place as
    server/earthfast.pyd; checks that the new module has our patches (AC_EXPORT_YIELD)."""
    env = dict(os.environ, PATH=os.pathsep.join([DLLTOOL, CARGO_BIN, os.environ.get("PATH", "")]))
    print("Building earthfast (Rust) ...", flush=True)
    cargo = os.path.join(CARGO_BIN, "cargo.exe")
    r = subprocess.run([cargo if os.path.exists(cargo) else "cargo", "build", "--release"], cwd=NATIVE, env=env,
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        raise SystemExit(f"cargo build failed:\n{r.stdout[-3000:]}{r.stderr[-3000:]}")
    shutil.copyfile(os.path.join(NATIVE, "target", "release", "earthfast.dll"), os.path.join(HERE, *PYD.split("/")))
    server = os.path.join(HERE, *VENDOR.split("/"), "server")
    r = subprocess.run([sys.executable, "-c", "import earthfast; print(earthfast.VERSION, "
                        "getattr(earthfast, 'AC_EXPORT_YIELD', 0))"], cwd=server, capture_output=True, text=True)
    got = r.stdout.split()
    if r.returncode or len(got) != 2 or got[1] == "0":
        raise SystemExit(f"The new earthfast.pyd lacks our patch (AC_EXPORT_YIELD):\n{r.stdout}{r.stderr}")
    print(f"earthfast {got[0]} built with the Map2Lap patches.")


def commit_native(msg):
    """Commit the rebuilt .pyd if it changed."""
    git("add", PYD)
    if git("diff", "--cached", "--name-only"):
        git("commit", "-q", "-m", msg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("zip", nargs="?")
    ap.add_argument("--no-merge", action="store_true")
    ap.add_argument("--no-check", action="store_true")
    ap.add_argument("--build-native", action="store_true")
    a = ap.parse_args()
    if a.build_native:
        build_native()
        commit_native("earthfast.pyd rebuilt with the Map2Lap patches")
        return
    if git("status", "--porcelain", "--untracked-files=no"):
        raise SystemExit("Commit your own changes first (git status is not clean).")
    old = git("show", f"upstream:{VENDOR}/VERSION")
    with tempfile.TemporaryDirectory() as tmp:
        version, changed = commit_upstream(fetch(a.zip, tmp), tmp)
    if not changed:
        print(f"No changes (version {version}).")
        return
    print(f"upstream: {old} -> {version}")
    print(git("diff", "--stat", "HEAD", "upstream", "--", VENDOR).splitlines()[-1])
    if a.no_merge:
        print("Not merged. See: git diff main upstream -- vendor;  take it: git merge upstream")
        return
    r = subprocess.run([GIT, "merge", "upstream", "--no-edit", "-m", f"BeamNG.Earth {version} merged"],
                       cwd=HERE, capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        bad = git("diff", "--name-only", "--diff-filter=U", check=False).splitlines()
        if not bad or any(f not in BINARIES for f in bad):
            print(r.stdout + r.stderr)
            raise SystemExit("Conflicts while merging: resolve them by hand, git commit, then update_beamng_earth.py "
                             "--build-native (or git merge --abort).")
        for f in bad:                   # (only the built modules: theirs, the .pyd is rebuilt right away)
            git("checkout", "--theirs", "--", f)
            git("add", f)
        build_native()
        git("add", PYD)
        git("commit", "-q", "--no-edit")
    else:
        build_native()
        commit_native(f"earthfast.pyd for BeamNG.Earth {version} rebuilt with the Map2Lap patches")
    print(f"BeamNG.Earth {version} merged.")
    if not a.no_check:
        reference_build()


if __name__ == "__main__":
    sys.exit(main())
