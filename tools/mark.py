"""What a mark or a recorded drive from AC says: the drive around each mark of a Track Debug session, and its
recorded drive (drive.csv), by route metre (docs/ac-reports.md).

    .venv\\Scripts\\python.exe tools\\mark.py                        # the newest session with a mark or a drive
    .venv\\Scripts\\python.exe tools\\mark.py rechberg               # ... of a track whose name holds this
    .venv\\Scripts\\python.exe tools\\mark.py "<session folder>"     # that session
    .venv\\Scripts\\python.exe tools\\mark.py rechberg --mark 2 --from 80 --to 120

Per mark and for the drive: its place and screenshot, the passes (a drive one way along the route), the hits (vertical
G with the wheels' travel, each with its route metre and AC x, z), where an axle hung unloaded, each with the measure.py command for that stretch, and the
physics under the car (1ROAD, 1GRASS, ...: from the track's OBJ parts in out/tracks/<track>, when that build is there).
Each place's metres off the line have their side, + right of the route's direction (the track's route, from its data).
A hit off the road is marked: the car was beside the road there, so it says nothing about the road (past 6 m off the
line and not on road physics all the way across to the car; with no build in out/tracks, just past the 6 m).
"""
import argparse
import csv
import glob
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
sys.path.insert(0, os.path.join(HERE, "src"))
from app import settings, system  # noqa: E402
import measure  # noqa: E402

HIT_G = 0.75            # G vertical against the smooth ride: a 1 G landing is felt, a road's waves stay under this
SOFT_G = 0.3            # G: a bump felt as a soft one: a 1.7 % kink at 90 km/h gave 0.42 G (a short bridge's joint)
SOFT_SHOWN = 5          # the strongest of those shown
HIT_GAP_S = 0.3         # s: peaks nearer than this are one hit (a spring's ringing)
BESIDE_M = 6.0          # m off the line: past the lanes of an ordinary road (a motorway's other carriageway reads so too)
UNLOADED_SHARE = 0.3    # a wheel below this share of its usual travel carries little load (travel follows load)
UNLOADED_MIN_S = 0.04   # s an axle stays so to count: two samples at 50 Hz
TURN_M = 5.0            # m back along the route that end a pass (the route metre wobbles when the car stands or slides)
STAND_KMH = 1.0         # km/h: below this the car stands, which ends a pass too
AROUND_M = 12.0         # m around a stretch for measure.py: the road before and after it
WHEELS = ("susp_fl", "susp_fr", "susp_rl", "susp_rr")
DRIVE = "drive.csv"     # a session's recorded drive ("Start recording" in the Track Debug app)
REBUILT_S = 60.0        # s the OBJ parts may be newer than the session's build: past it the track was built again since


def sessions_dir():
    """Where AC's Track Debug app writes its sessions."""
    return os.path.join(system.documents(settings.ac_path()), "Assetto Corsa", "map2lap_debug")


def find_session(what=None, root=None):
    """The session folder: what itself if it is one, else the newest under root with a mark or a recorded drive whose
    name holds what (any with None), or None."""
    if what and os.path.isdir(what):
        return what
    root = root or sessions_dir()
    got = [d for d in glob.glob(os.path.join(root, "*")) if os.path.isdir(d)
           and (not what or what.lower() in os.path.basename(d).lower())
           and (glob.glob(os.path.join(d, "mark_*.csv")) or os.path.exists(os.path.join(d, DRIVE)))]
    return max(got, key=lambda d: os.path.basename(d).rsplit("_", 2)[-2:]) if got else None


def drop_frozen(rows):
    """rows without those that repeat the one before in everything but the time: the game paused. Pure."""
    out = []
    for r in rows:
        if not out or any(r[k] != out[-1][k] for k in r if k != "time_s"):
            out.append(r)
    return out


def read_rows(path):
    """A mark's csv as [{column: number}], the pauses left out."""
    with open(path, encoding="utf-8", newline="") as f:
        return drop_frozen([{k: float(v) for k, v in r.items()} for r in csv.DictReader(f)])


def passes(rows):
    """The drives one way along the route: [(first row, last row)], ended by a turn back of TURN_M or by standing. Pure."""
    out, a = [], None
    far = sign = None       # (the farthest point so far of this pass, its direction)
    for i, r in enumerate(rows):
        if r["speed_kmh"] < STAND_KMH:
            if a is not None:
                out.append((a, i - 1))
                a = None
            continue
        if a is None:
            a, far, sign = i, r["route_m"], 0
            continue
        d = r["route_m"] - far
        if sign == 0:
            if abs(d) >= TURN_M:
                sign, far = (1 if d > 0 else -1), r["route_m"]
        elif d * sign > 0:
            far = r["route_m"]
        elif -d * sign >= TURN_M:
            out.append((a, i - 1))
            a, far, sign = i, r["route_m"], 0
    if a is not None:
        out.append((a, len(rows) - 1))
    return [(rows[i], rows[j]) for i, j in out if j > i]


def beside(r):
    """Was the car of row r beside the road: what read_place found, else past BESIDE_M. Pure."""
    return r.get("beside", r["off_m"] > BESIDE_M)


def hits(rows, limit=HIT_G, gap=HIT_GAP_S):
    """The rows of the vertical peaks above limit G: per run of peaks (nearer than gap s) its strongest. Pure."""
    out = []
    for r in rows:
        if abs(r["acc_vert_g"]) < limit:
            continue
        if out and r["time_s"] - out[-1]["last"] <= gap:
            out[-1]["last"] = r["time_s"]
            if abs(r["acc_vert_g"]) > abs(out[-1]["row"]["acc_vert_g"]):
                out[-1]["row"] = r
        else:
            out.append({"row": r, "last": r["time_s"]})
    return [o["row"] for o in out]


def soft_hits(rows):
    """The SOFT_SHOWN strongest hits between SOFT_G and HIT_G on the road, by route order of time. Pure."""
    got = [r for r in hits(rows, SOFT_G) if abs(r["acc_vert_g"]) < HIT_G and not beside(r)]
    top = sorted(got, key=lambda r: -abs(r["acc_vert_g"]))[:SOFT_SHOWN]
    return sorted(top, key=lambda r: r["time_s"])


def unloaded(rows):
    """Where an axle hung: [(axle, first row, last row)], both its wheels below UNLOADED_SHARE of their median travel for
    UNLOADED_MIN_S at least, in time order. Pure."""
    if not rows:
        return []
    out = []
    for axle, (w0, w1) in (("front", WHEELS[:2]), ("rear", WHEELS[2:])):
        rest = [UNLOADED_SHARE * float(np.median([r[w] for r in rows])) for w in (w0, w1)]
        first = None
        for r, nxt in zip(rows, rows[1:] + [None]):
            low = r[w0] <= rest[0] and r[w1] <= rest[1]
            if low and first is None:
                first = r
            if first is not None and (not low or nxt is None):
                last = r if low else prev
                if last["time_s"] - first["time_s"] >= UNLOADED_MIN_S:
                    out.append((axle, first, last))
                first = None
            prev = r
    return sorted(out, key=lambda u: u[1]["time_s"])


def stretch(rows, start=None, end=None):
    """rows within route metres start..end (None: open). Pure."""
    return [r for r in rows if (start is None or r["route_m"] >= start) and (end is None or r["route_m"] <= end)]


def _foot(r, route):
    """(AC x, z, direction x, z) of the line (route (n, 2) AC x, z) where row r is nearest it, within 10 m of its route_m,
    a metre apart. Pure."""
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(route, axis=0).T))]
    s = np.arange(max(r["route_m"] - 10.0, 0.0), min(r["route_m"] + 10.0, S[-1]) + 0.5, 1.0)
    px, pz = np.interp(s, S, route[:, 0]), np.interp(s, S, route[:, 1])
    j = int(np.argmin(np.hypot(px - r["x"], pz - r["z"])))
    a, b = max(j - 1, 0), min(j + 1, len(s) - 1)
    tx, tz = px[b] - px[a], pz[b] - pz[a]
    tn = max(float(np.hypot(tx, tz)), 1e-9)
    return float(px[j]), float(pz[j]), float(tx / tn), float(tz / tn)


def sides(rows, route):
    """Per row m off the line (route (n, 2) AC x, z), + right of its direction: the recorded off_m has no side. Pure."""
    out = np.zeros(len(rows))
    for i, r in enumerate(rows):
        fx, fz, tx, tz = _foot(r, route)
        out[i] = (r["x"] - fx) * (-tz) + (r["z"] - fz) * tx     # (AC x east, z south: right is (-tz, tx))
    return out


def on_one_road(names):
    """Do the object names across from the line to the car (names_at's, from the line out) all have road physics, so the car
    is on the road the line follows and not on another beside it (a median between them breaks it)? Pure."""
    return all(measure.physics(n) == measure.ROAD for n in names)


def same_road(r, foot, T3, names):
    """Is the car of row r on the road the line follows: on_one_road every metre of the whole way from the line (foot:
    _foot's) to it, a median in a road's first metres too, on the surfaces nearest the car's height (a flyover over the
    lanes is not what it drives on; T3, names: measure._surfaces')? Pure."""
    n = max(int(np.ceil(r["off_m"])) + 1, 2)
    t = np.linspace(0.0, 1.0, n)
    return on_one_road(measure.names_at(T3, names, foot[0] + t * (r["x"] - foot[0]), foot[1] + t * (r["z"] - foot[1]),
                                        np.full(n, r["y"])))


def track_of(folder):
    """The track's name from the session's info.txt, else from the folder's name."""
    try:
        with open(os.path.join(folder, "info.txt"), encoding="utf-8") as f:
            for line in f:
                if line.startswith("track "):
                    return line.split(None, 1)[1].strip()
    except OSError:
        pass
    return os.path.basename(folder).rsplit("_", 2)[0]


def under_car(track, rows):
    """Per row the name of the object the car stands on in track's OBJ parts (the surface nearest the car's height), or
    None when that build is not in out/tracks."""
    if not rows or not measure.tile_files(track):
        return None
    x, z, y = (np.array([r[k] for r in rows]) for k in ("x", "z", "y"))
    T3, _d, names = measure._surfaces(track, (x.min() - 5, z.min() - 5, x.max() + 5, z.max() + 5))
    return measure.names_at(T3, names, x, z, y)


def surface_runs(rows, names):
    """The physics under the car along rows (names: under_car's): [(first row, last row, object)] per run of one object
    (split parts as one), rows beside the road (off_m > BESIDE_M) left out: they end a run. Pure."""
    out, last = [], None
    for r, n in zip(rows, names):
        n = measure.unsplit(n) if n else "nothing"
        if beside(r):
            last = None
            continue
        if last is not None and out[-1][2] == n:
            out[-1][1] = r
        else:
            out.append([r, r, n])
        last = n
    return [tuple(u) for u in out]


def rebuilt_since(track, folder):
    """Whether track's OBJ parts are newer than the build the session drove (map2lap.json's "built"), by REBUILT_S."""
    import json
    try:
        with open(os.path.join(folder, "map2lap.json"), encoding="utf-8") as f:
            built = float(json.load(f)["built"])
    except (OSError, KeyError, ValueError):
        return False
    return max(os.path.getmtime(p) for p in measure.tile_files(track)) > built + REBUILT_S


def _where(r):
    flag = "  BESIDE THE ROAD" if beside(r) else ""
    off = f"{r['side_m']:+5.1f} m off the line" if "side_m" in r else f"{r['off_m']:4.1f} m off the line"
    # (AC x, z: a route metre doesn't say which of two teeth 10 m apart a hit was; heights.py and the map read them)
    return f"route {r['route_m']:8.1f} m, AC {r['x']:.1f}, {r['z']:.1f}, {off}, {r['speed_kmh']:5.1f} km/h{flag}"


def read_place(track, rows):
    """Each of rows gets side_m (sides: + right of the route) and beside (past BESIDE_M, and not on the road the line
    follows: on_one_road across to the car, up to measure.WIDTH_MAX_M, in track's OBJ parts: a motorway's lanes reach
    past BESIDE_M, its other carriageway lies beyond a median). As they were when the track has no route or no build here."""
    try:
        route = measure._route(track)
    except (OSError, ValueError, IndexError):
        return rows
    if route is None or not len(route) or not rows:
        return rows
    for r, side in zip(rows, sides(rows, route)):
        r["side_m"] = float(side)
    if not measure.tile_files(track):
        return rows
    far = [r for r in rows if r["off_m"] > BESIDE_M]
    for r in far:
        r["beside"] = True
    near = [r for r in far if r["off_m"] <= measure.WIDTH_MAX_M]
    if not near:
        return rows
    x, z = np.array([r["x"] for r in near]), np.array([r["z"] for r in near])
    T3, _d, names = measure._surfaces(track, (x.min() - 20, z.min() - 20, x.max() + 20, z.max() + 20))
    for r in near:
        r["beside"] = not same_road(r, _foot(r, route), T3, names)
    for r in rows:
        r.setdefault("beside", False)
    return rows


def report_mark(track, path, marks, start=None, end=None):
    """Print one mark: path its csv, marks its row of marks.csv or None."""
    rows = read_place(track, read_rows(path))
    print(f"\n{os.path.basename(path)}" +(f": marked at route {float(marks['route_m']):.1f} m, AC {marks['x']}, {marks['z']}, "
                                           f"{float(marks['speed_kmh']):.0f} km/h" if marks else ""))
    jpg = path[:-4] + ".jpg"
    if os.path.exists(jpg):
        print(f"  screenshot: {jpg}")
    print("  passes:")
    for a, b in passes(rows):
        print(f"    {a['time_s']:7.2f}-{b['time_s']:7.2f} s  route {a['route_m']:8.1f} -> {b['route_m']:8.1f} m, "
              f"{a['speed_kmh']:.0f} -> {b['speed_kmh']:.0f} km/h")
    rows = stretch(rows, start, end)
    print(f"  hits above {HIT_G} G vertical (wheels' travel in cm: FL FR RL RR):")
    got = hits(rows)
    for r in got:
        print(f"    {r['time_s']:7.2f} s  {r['acc_vert_g']:+5.2f} G  side {r['acc_side_g']:+5.2f}  long {r['acc_long_g']:+5.2f}  "
              f"{_where(r)}  " + " ".join(f"{r[w] * 100:4.1f}" for w in WHEELS))
    if not got:
        print("    none")
    soft = soft_hits(rows)
    print(f"  softer bumps on the road ({SOFT_G}-{HIT_G} G, the {SOFT_SHOWN} strongest):")
    for r in soft:
        print(f"    {r['time_s']:7.2f} s  {r['acc_vert_g']:+5.2f} G  {_where(r)}")
    if not soft:
        print("    none")
    print(f"  an axle hanging (both wheels under {UNLOADED_SHARE:.0%} of their usual travel; hard braking or accelerating "
          "lifts one too, so its long G is shown):")
    hung = unloaded(rows)
    for axle, a, b in hung:
        print(f"    {a['time_s']:7.2f}-{b['time_s']:7.2f} s  {axle:5}  long {a['acc_long_g']:+5.2f}  {_where(a)}")
    if not hung:
        print("    none")
    on_road = [r for r in got + soft if not beside(r)] + [a for _x, a, _b in hung if not beside(a)]
    if on_road:
        s = [r["route_m"] for r in on_road]
        print(f"  built there: tools\\measure.py {track} --profile --from {min(s) - AROUND_M:.0f} --to {max(s) + AROUND_M:.0f}")
    report_surface(track, rows)


def report_surface(track, rows):
    """The physics under the car along rows, from track's OBJ parts."""
    names = under_car(track, rows)
    if names is None:
        print(f"  under the car: no build of {track} in out/tracks (keep the build files, or tools\\from_debug.py)")
        return
    print("  under the car (the OBJ parts in out/tracks; beside the road left out):")
    for a, b, n in surface_runs(rows, names):
        flag = "" if measure.physics(n) == measure.ROAD else "   <-- not road"
        print(f"    route {a['route_m']:8.1f} -> {b['route_m']:8.1f} m  {n}{flag}")
    off = [(a, b) for a, b, n in surface_runs(rows, names) if measure.physics(n) != measure.ROAD]
    if off:
        print(f"  the physics along it: tools\\measure.py {track} --surface --from {min(a['route_m'] for a, _ in off) - AROUND_M:.0f} "
              f"--to {max(b['route_m'] for _, b in off) + AROUND_M:.0f}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("session", nargs="?", help="a session folder, or part of a track's name (default: the newest)")
    ap.add_argument("--mark", type=int, help="only this mark")
    ap.add_argument("--from", dest="start", type=float, help="hits and hanging axles from this route metre")
    ap.add_argument("--to", dest="end", type=float, help="... to this one")
    a = ap.parse_args()
    folder = find_session(a.session)
    if folder is None:
        sys.exit(f"no session with a mark or a drive for {a.session!r} in {sessions_dir()}")
    track = track_of(folder)
    print(f"session: {folder}")
    with open(os.path.join(folder, "info.txt"), encoding="utf-8") as f:
        print("  " + "  ".join(f.read().splitlines()[1:2]))
    table = {}
    path = os.path.join(folder, "marks.csv")
    if os.path.exists(path):
        with open(path, encoding="utf-8", newline="") as f:
            table = {int(r["mark"]): r for r in csv.DictReader(f)}
    for csv_path in sorted(glob.glob(os.path.join(folder, "mark_*.csv"))):
        n = int(os.path.basename(csv_path)[5:-4])
        if a.mark is None or a.mark == n:
            report_mark(track, csv_path, table.get(n), a.start, a.end)
    drive = os.path.join(folder, DRIVE)
    if a.mark is None and os.path.exists(drive):
        report_mark(track, drive, None, a.start, a.end)
    if measure.tile_files(track) and rebuilt_since(track, folder):
        print(f"\nNOTE: out/tracks/{track} was built again after this session's build: it may differ from what was driven")


if __name__ == "__main__":
    main()
