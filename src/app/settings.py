"""Settings of the generator page: settings.json next to this script (not in git).

    ac_path  Assetto Corsa folder the tracks go into; None: found through Steam (find_ac)
    clean    delete the temporary build data afterwards (generator.clean_up; on the page the inverse checkbox
             "Keep build files", off by default)
    cores    % of the logical cores used for a build (parallel.SHARE)
    cache_gb size limit of the map data cache in GB, 0: none (mapcache.trim)
    car      car for "Play" (folder under content/cars); None: the one driven last (race.ini, server.play_car)
    debug_app the CSP app "Track Debug" in AC (debugapp)
"""
import json
import os

from app import system
from app.paths import ROOT

FILE = os.path.join(ROOT, "settings.json")
DEFAULTS = {"ac_path": None, "clean": True, "cores": 50, "cache_gb": 20,     # (20 GB: BeamNG.Earth's default)
            "car": None, "debug_app": False}


def load():
    try:
        with open(FILE, encoding="utf-8") as f:
            return {**DEFAULTS, **json.load(f)}
    except (OSError, ValueError):
        return dict(DEFAULTS)


def save(values):
    s = {**load(), **{k: v for k, v in values.items() if k in DEFAULTS}}
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(s, f, ensure_ascii=False, indent=1)
    return s


def is_ac(path):
    """An AC folder: has content/tracks."""
    return bool(path) and os.path.isdir(os.path.join(path, "content", "tracks"))


def find_ac():
    """AC in the Steam libraries (system.steam_libraries); else None."""
    for lib in system.steam_libraries():
        p = os.path.join(lib, "steamapps", "common", "assettocorsa")
        if is_ac(p):
            return p
    return None


def ac_path():
    """The AC folder: the one set, else the one found, else Steam's default location."""
    return (load()["ac_path"] or find_ac()
            or os.path.join(system.STEAM_DEFAULT, "steamapps", "common", "assettocorsa"))
