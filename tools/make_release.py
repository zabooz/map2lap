"""Build the Windows release zip: dist/Map2Lap-<version>-win64.zip (one folder "Map2Lap" inside: a new version can be
unzipped over an old one and keeps its map data cache and settings)

Contents: Map2Lap's files (from git, without the developer tools), BeamNG.Earth (what its server reads at runtime), the
CC0 textures (colour maps only) and an embedded Python with the packages from requirements.txt. Users unzip it and
double-click "Start Map2Lap.bat"; nothing gets installed.

    .venv\\Scripts\\python.exe tools\\make_release.py

The embedded Python has the same version as the one running this script: vendor/beamng_earth/server/earthfast.pyd is
built for it.
"""
import glob
import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
from app import version  # noqa: E402

PY_VERSION = "%d.%d.%d" % sys.version_info[:3]
PY_URL = f"https://www.python.org/ftp/python/{PY_VERSION}/python-{PY_VERSION}-embed-amd64.zip"
DIST = os.path.join(HERE, "dist")
NAME = "Map2Lap"
ZIP = f"Map2Lap-{version.VERSION}-win64"
# developer-only parts (in the repository, not in the release)
SKIP = ("tools/", ".gitignore", ".gitattributes", "AGENTS.md", "CLAUDE.md",
        "vendor/beamng_earth/server/tests/", "vendor/beamng_earth/server/earthfast.abi3.so",
        "vendor/beamng_earth/native/", "vendor/beamng_earth/docs/", "vendor/beamng_earth/probes/",
        "vendor/beamng_earth/mod/",     # (the BeamNG mod: the server only reads it in its own developer tools)
        "vendor/beamng_earth/tools/", "vendor/beamng_earth/beammp/")
# what Map2Lap reads from inside SKIP (the road signs' materials and lettering: make_obj.ROADSIDE)
KEEP = ("vendor/beamng_earth/mod/beamng_earth/levels/beamng_earth/art/shapes/beamngEarth/roadside/",)
TEXTURES = os.path.join("assets", "textures")


def files():
    """The project's files: tracked and new ones git doesn't ignore, without SKIP (but with KEEP)."""
    out = subprocess.run(["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"], cwd=HERE,
                         capture_output=True, check=True).stdout.decode("utf-8").split("\0")
    return sorted(f for f in set(out) if f and (f.startswith(KEEP) or not f.startswith(SKIP))
                  and os.path.isfile(os.path.join(HERE, f)))


def embedded_python(dst):
    """Python's embeddable package into dst/python, site-packages and src/ on its path, the packages."""
    os.makedirs(DIST, exist_ok=True)
    cached = os.path.join(DIST, os.path.basename(PY_URL))
    if not os.path.exists(cached):
        print(f"Downloading {PY_URL} ...", flush=True)
        with urllib.request.urlopen(urllib.request.Request(PY_URL, headers={"User-Agent": version.USER_AGENT}),
                                    timeout=300) as r, open(cached + ".part", "wb") as f:
            shutil.copyfileobj(r, f)
        os.replace(cached + ".part", cached)
    py = os.path.join(dst, "python")
    with zipfile.ZipFile(cached) as z:
        z.extractall(py)
    pth = glob.glob(os.path.join(py, "python*._pth"))[0]
    stdlib = os.path.basename(glob.glob(os.path.join(py, "python*.zip"))[0])
    with open(pth, "w", encoding="utf-8") as f:     # (..\src: Map2Lap's code; a ._pth adds no script folder)
        f.write(f"{stdlib}\n.\nLib\\site-packages\n..\\src\nimport site\n")
    print("Installing the packages ...", flush=True)
    subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "--disable-pip-version-check",
                    "--target", os.path.join(py, "Lib", "site-packages"), "-r", os.path.join(HERE, "requirements.txt")],
                   check=True)


def main():
    dst = os.path.join(DIST, NAME)
    shutil.rmtree(dst, ignore_errors=True)
    fs = files()
    print(f"{ZIP}: {len(fs)} files", flush=True)
    for f in fs:
        os.makedirs(os.path.dirname(os.path.join(dst, f)) or dst, exist_ok=True)
        shutil.copy2(os.path.join(HERE, f), os.path.join(dst, f))
    colour = glob.glob(os.path.join(HERE, TEXTURES, "*", "*_Color.jpg"))
    if len(colour) < 10:
        raise SystemExit("Textures missing: run tools\\get_textures.py first")
    for p in colour:
        out = os.path.join(dst, TEXTURES, os.path.basename(os.path.dirname(p)), os.path.basename(p))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        shutil.copy2(p, out)
    embedded_python(dst)
    print("Zipping ...", flush=True)
    archive = shutil.make_archive(os.path.join(DIST, ZIP), "zip", root_dir=DIST, base_dir=NAME)
    longest = max((len(os.path.relpath(os.path.join(r, f), DIST)) for r, _, fs_ in os.walk(dst) for f in fs_))
    print(f"longest path in the zip: {longest} characters (Windows: 260 in all)")
    print(f"{archive}: {os.path.getsize(archive) / 1e6:.0f} MB")


if __name__ == "__main__":
    main()
