"""A debug stretch: the part of a built track that holds a bug, built into AC with today's code on the same route (no OSRM),
fast to rebuild and to drive, named so it can't be taken for a test track: <track>_<route metre>_debug.

    .venv\\Scripts\\python.exe tools\\debug_stretch.py heiligenblut_test 13100 13300     # heiligenblut_test_13200_debug
    ... --upto obj      only up to the OBJ parts in out\\tracks\\<name> (measure.py, heights.py read them), nothing into AC

Its route metres start at 0: the line it prints says what to subtract. Road tiles come from the stretch's own corridor, so a chain
reaching far past its ends can solve differently from the whole track: if the bug is gone there, take a longer stretch. No test
track and no reference: delete it from AC when the fix is in.
"""
import argparse
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
RUN_OFF_M = 80.0        # m of the route kept past the end pin: the finish line and the run-off behind it (generator.extend)


def stretch_name(track, m0, m1):
    """The folder name in AC of the stretch m0..m1 of track. Pure."""
    return f"{track}_{(m0 + m1) / 2:.0f}_debug"


def cut_line(xy, line, m0, m1, run_off=RUN_OFF_M):
    """(the route [[lat, lon], ...] from metre m0 on, the index of the pin at m1 in it, up to run_off past it) of a build's route xy
    (n, 2) and its line (n, 2; lat, lon: anchor.json's). Pure."""
    xy, line = np.asarray(xy, np.float64), np.asarray(line, np.float64)
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    if not 0.0 <= m0 < m1 <= s[-1]:
        raise SystemExit(f"from {m0:.0f} to {m1:.0f} m isn't on its route of {s[-1]:.0f} m")
    last = min(m1 + run_off, float(s[-1]))
    inner = s[(s > m0) & (s < m1)]
    after = s[(s > m1) & (s < last)]
    at = np.r_[m0, inner, m1, after, last] if last > m1 else np.r_[m0, inner, m1]
    return np.c_[np.interp(at, s, line[:, 0]), np.interp(at, s, line[:, 1])].tolist(), len(inner) + 1


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track", help="a track with its build in out/tracks")
    ap.add_argument("start", type=float, help="from this route metre")
    ap.add_argument("end", type=float, help="to this one")
    ap.add_argument("--upto", choices=["obj"], help="stop after the OBJ parts (nothing into AC)")
    a = ap.parse_args()
    path = os.path.join(HERE, "out", "tracks", a.track, "tiles", "anchor.json")
    if not os.path.exists(path):
        raise SystemExit(f"no build of {a.track} in out/tracks")
    with open(path, encoding="utf-8") as f:
        anc = json.load(f)
    if not anc.get("route"):
        raise SystemExit(f"{a.track}: its build keeps no route to cut")
    import generator
    xy = np.asarray(anc["route"], np.float64)
    lat, lon, _ = generator.geodesy.EnuFrame(anc["lat"], anc["lon"]).enu_to_geodetic(xy[:, 0], xy[:, 1], np.zeros(len(xy)))
    line, end = cut_line(xy, np.c_[np.asarray(lat), np.asarray(lon)], a.start, a.end)
    name = stretch_name(a.track, a.start, a.end)
    res = generator.build([line[0], line[end]], anc.get("width") or 100.0, name, f"{anc.get('title') or a.track} {name.split('_')[-2]} debug",
                          upto=a.upto, line=(line, end))
    print(f"{name}: {res.get('track') or res.get('work')}")
    print(f"its route metre = {a.track}'s route metre - {a.start:.0f}")


if __name__ == "__main__":
    main()
