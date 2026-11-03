"""What a mark from AC says: the drive around each mark of a Track Debug session (docs/ac-reports.md), by route metre.

    .venv\\Scripts\\python.exe tools\\mark.py                        # the newest session with a mark
    .venv\\Scripts\\python.exe tools\\mark.py rechberg               # ... of a track whose name holds this
    .venv\\Scripts\\python.exe tools\\mark.py "<session folder>"     # that session
    .venv\\Scripts\\python.exe tools\\mark.py rechberg --mark 2 --from 80 --to 120

Per mark: its place and screenshot, the passes (a drive one way along the route), the hits (vertical G with the wheels'
travel) and where an axle hung unloaded, each with the measure.py command for that stretch. A hit far off the line is
marked: the car was beside the road there, so it says nothing about the road.
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


def sessions_dir():
    """Where AC's Track Debug app writes its sessions."""
    return os.path.join(system.documents(settings.ac_path()), "Assetto Corsa", "map2lap_debug")


def find_session(what=None, root=None):
    """The session folder: what itself if it is one, else the newest under root with a mark whose name holds what (any
    with None), or None."""
    if what and os.path.isdir(what):
        return what
    root = root or sessions_dir()
    got = [d for d in glob.glob(os.path.join(root, "*")) if os.path.isdir(d)
           and (not what or what.lower() in os.path.basename(d).lower()) and glob.glob(os.path.join(d, "mark_*.csv"))]
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
    got = [r for r in hits(rows, SOFT_G) if abs(r["acc_vert_g"]) < HIT_G and r["off_m"] <= BESIDE_M]
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


def _where(r):
    beside = "  BESIDE THE ROAD" if r["off_m"] > BESIDE_M else ""
    return f"route {r['route_m']:8.1f} m, {r['off_m']:4.1f} m off the line, {r['speed_kmh']:5.1f} km/h{beside}"


def report_mark(track, path, marks, start=None, end=None):
    """Print one mark: path its csv, marks its row of marks.csv or None."""
    rows = read_rows(path)
    print(f"\n{os.path.basename(path)}" + (f": marked at route {float(marks['route_m']):.1f} m, AC {marks['x']}, {marks['z']}, "
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
    on_road = [r for r in got + soft if r["off_m"] <= BESIDE_M] + [a for _x, a, _b in hung if a["off_m"] <= BESIDE_M]
    if on_road:
        s = [r["route_m"] for r in on_road]
        print(f"  built there: tools\\measure.py {track} --profile --from {min(s) - AROUND_M:.0f} --to {max(s) + AROUND_M:.0f}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("session", nargs="?", help="a session folder, or part of a track's name (default: the newest)")
    ap.add_argument("--mark", type=int, help="only this mark")
    ap.add_argument("--from", dest="start", type=float, help="hits and hanging axles from this route metre")
    ap.add_argument("--to", dest="end", type=float, help="... to this one")
    a = ap.parse_args()
    folder = find_session(a.session)
    if folder is None:
        sys.exit(f"no session with a mark for {a.session!r} in {sessions_dir()}")
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


if __name__ == "__main__":
    main()
