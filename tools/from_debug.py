"""The track of a Track Debug session folder, built here: the same inputs and the route exactly as it was built there
(the folder's map2lap.json and map2lap_route.txt, which the app copies in; no OSRM), installed into AC under its own
name. Says where this Map2Lap or its map data differ from the sender's: the build then differs where the code or the
map changed since.

    .venv\\Scripts\\python.exe tools\\from_debug.py "<Documents>\\Assetto Corsa\\map2lap_debug\\<track>_<time>"
    ... --name my_copy        the track's folder name in AC (default: <track>_debug)
    ... --upto obj            only up to the OBJ parts in out\\tracks\\<name> (measure.py, check_drive.py read them)
"""
import argparse
import csv
import json
import os
import sys
import time

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
import generator  # noqa: E402
from app import version  # noqa: E402


def route_latlon(path):
    """(anchor (lat, lon), the route [(lat, lon), ...]) of a map2lap_route.txt ("anchor <lat> <lon>", then "<x> <z>" in
    AC coordinates: x east, z = -north)."""
    anchor, xz = None, []
    with open(path, encoding="utf-8") as f:
        for line in f:
            p = line.split()
            if len(p) == 3 and p[0] == "anchor":
                anchor = (float(p[1]), float(p[2]))
            elif len(p) == 2:
                xz.append((float(p[0]), float(p[1])))
    if anchor is None or len(xz) < 2:
        raise SystemExit(f"{path}: no anchor or route")
    xz = np.asarray(xz)
    lat, lon, _ = generator.geodesy.EnuFrame(*anchor).enu_to_geodetic(xz[:, 0], -xz[:, 1], np.zeros(len(xz)))
    return anchor, [[float(a), float(b)] for a, b in zip(np.asarray(lat), np.asarray(lon))]


def differences(info):
    """Lines on what differs between the sender's build and a build here."""
    out = []
    if info.get("track_version") != version.TRACK_VERSION:
        out.append(f"track version: theirs {info.get('track_version')}, here {version.TRACK_VERSION} "
                   "(built with this code: what was changed since shows)")
    theirs, here = info.get("data") or {}, generator.data_versions()
    for k, what in (("overture", "Overture release"), ("osm", "OpenStreetMap tags")):
        if theirs.get(k) != here.get(k):
            out.append(f"{what}: theirs {theirs.get(k) or 'unknown'}, here {here.get(k) or 'not fetched yet'}"
                       + (" (edits to the map since may show)" if k == "osm" else ""))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("folder", help="a Track Debug session folder")
    ap.add_argument("--name", help="the track's folder name in AC (default: <track>_debug)")
    ap.add_argument("--upto", choices=["obj"], help="stop after the OBJ parts (nothing into AC)")
    a = ap.parse_args()
    js = os.path.join(a.folder, "map2lap.json")
    if not os.path.exists(js):
        raise SystemExit(f"{js} is missing: the session was recorded with a Track Debug app before 1.3, or the track "
                         "was not built by Map2Lap")
    with open(js, encoding="utf-8") as f:
        info = json.load(f)
    track = os.path.basename(os.path.normpath(a.folder)).rsplit("_", 2)[0]
    name = a.name or f"{track}_debug"
    title = f"{info.get('title') or track} (debug)"
    print(f"{info.get('title')}: built {info.get('built') and time.ctime(info['built'])} with Map2Lap "
          f"{info.get('version')}, code {info.get('code') or '-'}")
    for line in differences(info) or ["same track version and map data as the sender"]:
        print("  " + line)
    marks = os.path.join(a.folder, "marks.csv")
    if os.path.exists(marks):
        with open(marks, encoding="utf-8") as f:
            for m in csv.DictReader(f):
                print(f"  mark {m['mark']}: {float(m['route_m']):.0f} m along the route, {float(m['off_m']):.1f} m off "
                      f"it, {float(m['speed_kmh']):.0f} km/h")
    if info.get("area"):
        res = generator.build([], None, name, title, area=info["area"], upto=a.upto)
    else:
        route = os.path.join(a.folder, "map2lap_route.txt")
        if info.get("route_end") is None or not os.path.exists(route):
            print("  no route as built in the folder: routed again from the pins (OSRM, today's map)")
            res = generator.build(info["points"], info["width"], name, title, upto=a.upto)
        else:
            _anchor, line = route_latlon(route)
            res = generator.build(info["points"], info["width"], name, title, upto=a.upto,
                                  line=(line, int(info["route_end"])))
    print(f"done: {res.get('track') or res.get('work')}")


if __name__ == "__main__":
    main()
