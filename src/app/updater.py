"""Install a newer release from GitHub (Settings → Version, "Install update").

Map2Lap can't replace its own files while it runs (Windows locks python.exe, python3x.dll and the .pyd modules), so
the work is split: download() fetches this system's release archive (Windows' zip, Linux' tar.gz), checks it against
the size and SHA-256 GitHub states for it and unpacks it into update/Map2Lap; the server then ends with RESTART, and
"Start Map2Lap.bat" (start.sh) moves the new files in before it starts Python again. Linux would allow replacing them
in place, but the same steps on both systems keep one way to test. settings.json, cache/ and out/ aren't in the
archive and stay. User-imported library/ is never part of a release; an archive containing it is refused.
"""
import hashlib
import os
from pathlib import PurePosixPath
import shutil
import tarfile
import urllib.request
import zipfile

from app import version
from app.paths import ROOT

DIR = os.path.join(ROOT, "update")
NEW = os.path.join(DIR, "Map2Lap")     # (unpacked where it is, not via a folder of its own: paths stay short of 260)
READY = os.path.join(DIR, "ready")     # (written last: the start script installs NEW only when it's there)
RESTART = 75                           # (exit code: the start script installs NEW and starts the server again)
# the bundled Python of a release (tools/make_release.py): python.org's embeddable package, python-build-standalone
PYTHON = "python/python.exe" if os.name == "nt" else "python/bin/python3"
OLD_FOLDERS = (("vendor", "engine"),)     # (an older release's folder, the one that replaced it: drop_old)
# idle downloading restarting error; done/total: bytes of the archive
state = {"state": "idle", "done": 0, "total": 0, "error": None}


def _check_library(names):
    """Refuse an update that would make either start script mirror over the user's own library. Pure."""
    for name in names:
        parts = PurePosixPath(name.replace("\\", "/").strip("/")).parts
        if len(parts) >= 2 and parts[0].casefold() == "map2lap" and parts[1].casefold() == "library":
            raise ValueError("The update contains a user library folder; it cannot be installed")


def possible(root=ROOT):
    """Whether this folder updates itself: a release, with its bundled Python and no git checkout (a developer's
    folder gets new code through git)."""
    return os.path.isfile(os.path.join(root, PYTHON)) and not os.path.isdir(os.path.join(root, ".git"))


def drop_old(root=ROOT):
    """On server start, in a release folder: remove the folders an older release had that this one replaced (the
    install step replaces only the folders the new release has, so they stayed). Each goes only when its successor is
    there: vendor/ (0.5.5 and before) is engine/ now. The names of the folders removed."""
    if not possible(root):
        return []
    gone = []
    for old, new in OLD_FOLDERS:
        if os.path.isdir(os.path.join(root, old)) and os.path.isdir(os.path.join(root, new)):
            shutil.rmtree(os.path.join(root, old), ignore_errors=True)
            gone.append(old)
    return gone


def download(rel):
    """Fetch rel["archive"] (version.latest(): name, url, size, digest "sha256:..."), check it and unpack it into NEW.
    Raises with a message for the page when the download or the check fails."""
    try:
        _download(rel)
    except BaseException:
        # No partial archive or extracted files should survive a failed download/check.
        shutil.rmtree(DIR, ignore_errors=True)
        raise


def _download(rel):
    """Download and stage rel's archive, writing READY only after all checks and extraction succeed."""
    a = rel["archive"]
    shutil.rmtree(DIR, ignore_errors=True)
    os.makedirs(DIR)
    path, sha = os.path.join(DIR, a["name"]), hashlib.sha256()
    state.update(done=0, total=a["size"])
    req = urllib.request.Request(a["url"], headers={"User-Agent": version.USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
            sha.update(chunk)
            state["done"] += len(chunk)
    if state["done"] != a["size"] or a.get("digest") not in (None, "sha256:" + sha.hexdigest()):
        raise ValueError("The download is damaged (try again)")
    need = {"Map2Lap/src/server.py", "Map2Lap/" + PYTHON}
    if path.endswith(".zip"):
        with zipfile.ZipFile(path) as zf:
            _check_library(zf.namelist())
            if not need <= set(zf.namelist()):
                raise ValueError("The release archive has no Map2Lap folder")
            zf.extractall(DIR)
    else:
        with tarfile.open(path) as tf:
            _check_library(tf.getnames())
            if not need <= set(tf.getnames()):
                raise ValueError("The release archive has no Map2Lap folder")
            tf.extractall(DIR, filter="data")       # (keeps the execute bits; nothing outside DIR)
    os.remove(path)
    open(READY, "w").close()
