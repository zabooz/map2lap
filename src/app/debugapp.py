"""The CSP app "Track Debug" (src/acapp/TrackDebug): in AC's apps/lua while Settings → "Track Debug app" is on.

It shows the metre along the route (data/map2lap_route.txt, written by every route build), marks a spot (F10) and
records a drive into Documents/Assetto Corsa/map2lap_debug. Switched on: copied into AC (again on every build, so it
stays the release's version); switched off: our copy removed again, an app of the same name by someone else is left.
"""
import os
import shutil

from app.paths import SRC

APP = os.path.join(SRC, "acapp", "TrackDebug")


def folder(ac):
    return os.path.join(ac, "apps", "lua", "TrackDebug")


def ours(path):
    """Our app: its manifest says AUTHOR = Map2Lap."""
    try:
        with open(os.path.join(path, "manifest.ini"), encoding="utf-8") as f:
            return any(line.replace(" ", "").strip() == "AUTHOR=Map2Lap" for line in f)
    except OSError:
        return False


def sync(ac, on):
    """Install (on) or remove (off) the app in the AC folder ac; OSError if AC's folder can't be written."""
    dst = folder(ac)
    if on:
        shutil.copytree(APP, dst, dirs_exist_ok=True)
    elif os.path.isdir(dst) and ours(dst):
        shutil.rmtree(dst)
