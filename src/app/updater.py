"""Install a newer release from GitHub (Settings → Version, "Install update").

Map2Lap can't replace its own files while it runs (Windows locks python.exe, python312.dll and the .pyd modules), so
the work is split: download() fetches the release zip, checks it against the size and SHA-256 GitHub states for it
and unpacks it into update/Map2Lap; the server then ends with RESTART, and "Start Map2Lap.bat" moves the new files
in before it starts Python again. settings.json, cache/ and out/ aren't in the zip and stay.
"""
import hashlib
import os
import shutil
import urllib.request
import zipfile

from app import version
from app.paths import ROOT

DIR = os.path.join(ROOT, "update")
NEW = os.path.join(DIR, "Map2Lap")     # (unpacked where it is, not via a folder of its own: paths stay short of 260)
READY = os.path.join(DIR, "ready")     # (written last: "Start Map2Lap.bat" installs NEW only when it's there)
RESTART = 75                           # (exit code: "Start Map2Lap.bat" installs NEW and starts the server again)
# idle downloading restarting error; done/total: bytes of the zip
state = {"state": "idle", "done": 0, "total": 0, "error": None}


def possible():
    """Whether this folder updates itself: a release, with its bundled Python and no git checkout (a developer's
    folder gets new code through git)."""
    return os.path.isfile(os.path.join(ROOT, "python", "python.exe")) and not os.path.isdir(os.path.join(ROOT, ".git"))


def download(rel):
    """Fetch rel["zip"] (version.latest(): url, size, digest "sha256:..."), check it and unpack it into NEW.
    Raises with a message for the page when the download or the check fails."""
    z = rel["zip"]
    shutil.rmtree(DIR, ignore_errors=True)
    os.makedirs(DIR)
    path, sha = os.path.join(DIR, "release.zip"), hashlib.sha256()
    state.update(done=0, total=z["size"])
    req = urllib.request.Request(z["url"], headers={"User-Agent": version.USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
            sha.update(chunk)
            state["done"] += len(chunk)
    if state["done"] != z["size"] or z.get("digest") not in (None, "sha256:" + sha.hexdigest()):
        raise ValueError("The download is damaged (try again)")
    with zipfile.ZipFile(path) as zf:
        if not {"Map2Lap/src/server.py", "Map2Lap/python/python.exe"} <= set(zf.namelist()):
            raise ValueError("The release zip has no Map2Lap folder")
        zf.extractall(DIR)
    os.remove(path)
    open(READY, "w").close()
