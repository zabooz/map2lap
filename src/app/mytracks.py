"""The tracks this program built in the AC folder (generator page, tab "My tracks").

Every build stores its settings as data/map2lap.json in the track folder (generator.build), so "Rebuild" can build it
again with the current release, even after the temporary data is gone. Tracks from before map2lap.json existed don't
have the file: while their work folder is still there (out/tracks/<name>/tiles/anchor.json), it is filled in from it.

    {"version" (the app, version.VERSION), "track_version" (version.TRACK_VERSION; before 0.3.3 only "version", which
     was the same; both missing on filled-in ones), "title", "points": [[lat, lon], ...] (route; area: []),
     "width": m or None, "area": [S, W, N, E] or None, "length_m", "area_m": [east, north] or None, "tiles",
     "built": Unix time, "line": [[lat, lon], ...] or None}
"""
import json
import os

from app import version
from app.paths import ROOT

FILE = os.path.join("data", "map2lap.json")
AUTHORS = ("Map2Lap", "ac-export")      # (ui_track.json; ac-export: the project's earlier name)
LINE_MAX = 2000                         # points of the route shown on the map, at most


def thin(latlon, n=LINE_MAX):
    """At most about n points of the line (the end always included), to 6 decimals."""
    pts = [list(p) for p in latlon]
    if not pts:
        return []
    out = pts[::max(1, -(-len(pts) // n))]
    if out[-1] != pts[-1]:
        out.append(pts[-1])
    return [[round(a, 6), round(b, 6)] for a, b in out]


def save(root, info):
    with open(os.path.join(root, FILE), "w", encoding="utf-8") as f:
        json.dump(info, f, ensure_ascii=False)


def load(track_dir):
    """The track's saved settings (or filled in from its work folder); None: none."""
    try:
        with open(os.path.join(track_dir, FILE), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        pass
    info = _from_work(track_dir)
    if info is not None:
        try:
            save(track_dir, info)
        except OSError:
            pass
    return info


def _from_work(track_dir):
    name = os.path.basename(track_dir)
    try:
        with open(os.path.join(ROOT, "out", "tracks", name, "tiles", "anchor.json"), encoding="utf-8") as f:
            anc = json.load(f)
        with open(os.path.join(track_dir, "ui", "ui_track.json"), encoding="utf-8") as f:
            ui = json.load(f)
    except (OSError, ValueError):
        return None
    if ui.get("author") not in AUTHORS or "points" not in anc or not os.path.isdir(os.path.join(track_dir, "data")):
        return None
    import numpy as np
    import generator            # (BeamNG.Earth's geodesy)
    frame = generator.geodesy.EnuFrame(anc["lat"], anc["lon"])
    area, area_m, line = anc.get("area"), None, None
    if area:
        s, w, n, e = area
        ce, cn, _ = frame.geodetic_to_enu(np.array([s, n]), np.array([w, e]), np.zeros(2))
        area_m = [float(ce[1] - ce[0]), float(cn[1] - cn[0])]
    elif anc.get("route"):
        xy = np.asarray(anc["route"], float)
        la, lo, _ = frame.enu_to_geodetic(xy[:, 0], xy[:, 1], np.zeros(len(xy)))
        line = thin(zip(np.asarray(la).tolist(), np.asarray(lo).tolist()))
    kn5 = os.path.join(track_dir, name + ".kn5")
    return {"title": ui.get("name") or name, "points": anc["points"] or [], "width": None if area else anc.get("width"),
            "area": area, "length_m": anc.get("length_m", 0.0), "area_m": area_m, "tiles": len(anc["tiles"]),
            "built": os.path.getmtime(kn5) if os.path.exists(kn5) else None, "line": line}


def copy_name(ac_path, name, title):
    """Name and title for "Build as copy": name_2, "Title (2)" (the next free number, no work folder either)."""
    k = 2
    while (os.path.exists(os.path.join(ac_path, "content", "tracks", f"{name}_{k}")) or
           os.path.exists(os.path.join(ROOT, "out", "tracks", f"{name}_{k}"))):
        k += 1
    return f"{name}_{k}", f"{title} ({k})"


def _same(info):
    """Key for "the same track" (route with width, or area; copies and originals share it)."""
    if info.get("area"):
        return ("area",) + tuple(round(float(v), 5) for v in info["area"])
    return ("route", round(float(info.get("width") or 0), 1)) + tuple((round(a, 5), round(b, 5)) for a, b in info["points"])


def listing(ac_path):
    """The tracks with settings, most recently built first: each {name, kn5_bytes, outdated, current_copy, ...the
    settings}. outdated: older track version than this release's and no copy of the same track is current (an old build next to a new
    copy no longer counts as old, it only shows its version); current_copy: that copy's title."""
    tracks = os.path.join(ac_path, "content", "tracks")
    out = []
    for name in os.listdir(tracks) if os.path.isdir(tracks) else []:
        d = os.path.join(tracks, name)
        if not (os.path.exists(os.path.join(d, FILE)) or
                os.path.exists(os.path.join(ROOT, "out", "tracks", name, "tiles", "anchor.json"))):
            continue
        info = load(d)
        if info is None:
            continue
        kn5 = os.path.join(d, name + ".kn5")
        out.append({**info, "name": name, "kn5_bytes": os.path.getsize(kn5) if os.path.exists(kn5) else None})
    current = {}
    for t in out:
        t["track_version"] = t.get("track_version", t.get("version"))
    for t in out:
        if not version.outdated(t["track_version"]) and t["kn5_bytes"]:
            current.setdefault(_same(t), t["title"])
    for t in out:
        old = version.outdated(t["track_version"])
        t["current_copy"] = current.get(_same(t)) if old else None
        t["outdated"] = old and t["current_copy"] is None
    return sorted(out, key=lambda t: -(t.get("built") or 0))
