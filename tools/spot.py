"""All the data there is about a spot on a built track, gathered at once into out/spot/<track>_<m>: nothing built, the tools run side
by side with their outputs kept to read.

    .venv\\Scripts\\python.exe tools\\spot.py <track> --route <m>               # 40 m either side
    .venv\\Scripts\\python.exe tools\\spot.py <track> --route <m> --reach 80

In the folder: map.png (map_spot.py: read it first), heights.txt (heights.py --plans: elevation, grading, water, the map's roads with
their tags, each plan's share), decks.txt (--decks), walls.txt (--walls), surface.txt, profile.txt and measure.txt (measure.py), and per
road near the spot road_<id>.txt (--road: its profile, the ground across it) and steps_<id>.txt (--road --steps: its pins and each
step of the planner against the elevation). Printed: the folder, each road and how far its plan leaves the elevation there.
One point of the ground goes on from there: heights.py <track> --at <AC x>,<AC z>.
"""
import argparse
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS = 4                # tools at once: each plans the map cells it reads
ROAD_LINE = re.compile(r"^ +road (\S+) +([\d.]+) m off: (.*)$", re.M)
STEP_ROW = re.compile(r"^ +(\d+) +[\d.-]+(?: +[\d.-]+)+ +([+-]\d+\.\d+)$", re.M)
PINS_LINE = re.compile(r"pins \(.*?\): (.*)$", re.M)


def roads_in(text):
    """[(id, m off the line, its class and width)] of heights.py's "the map there", nearest first. Pure."""
    got = [(m[1], float(m[2]), m[3].split("; levels")[0]) for m in ROAD_LINE.finditer(text)]
    return sorted(got, key=lambda r: r[1])


def off_elevation(text):
    """(the largest height of a plan over or under the elevation, m; at how many m from its last point; its pins as printed) from
    heights.py --steps' tables; (None, None, pins) without a table. Pure."""
    rows = [(float(m[2]), int(m[1])) for m in STEP_ROW.finditer(text)]
    pins = PINS_LINE.search(text)
    pins = pins[1] if pins else ""
    if not rows:
        return None, None, pins
    worst = max(rows, key=lambda r: abs(r[0]))
    return worst[0], worst[1], pins


def tool(out, name, *cmd):
    """Runs a tool of tools/ with its output into out/name; its text."""
    r = subprocess.run([sys.executable, os.path.join(HERE, "tools", cmd[0]), *cmd[1:]], cwd=HERE, capture_output=True,
                       encoding="utf-8", errors="replace", env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    text = r.stdout + (f"\n{cmd[0]} failed, exit {r.returncode}:\n{r.stderr[-2000:]}" if r.returncode else "")
    with open(os.path.join(out, name), "w", encoding="utf-8") as f:
        f.write(text)
    return text


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("--route", type=float, required=True, help="the route metre (mark.py gives it)")
    ap.add_argument("--reach", type=float, default=40.0, help="m either side along the route (default 40)")
    a = ap.parse_args()
    t, m0, m1 = a.track, str(max(a.route - a.reach, 0.0)), str(a.route + a.reach)
    out = os.path.join(HERE, "out", "spot", f"{t}_{a.route:.0f}")
    os.makedirs(out, exist_ok=True)
    stretch = ("--from", m0, "--to", m1)
    first = tool(out, "heights.txt", "heights.py", t, *stretch, "--step", "2", "--plans")
    roads = roads_in(first)
    jobs = [("map.txt", "map_spot.py", t, "--route", str(a.route), "--output", os.path.join(out, "map.png")),
            ("decks.txt", "heights.py", t, *stretch, "--decks"), ("walls.txt", "heights.py", t, *stretch, "--walls"),
            ("measure.txt", "measure.py", t, *stretch), ("surface.txt", "measure.py", t, *stretch, "--surface"),
            ("profile.txt", "measure.py", t, *stretch, "--profile")]
    for rid, _off, _what in roads:
        jobs += [(f"road_{rid}.txt", "heights.py", t, *stretch, "--road", rid), (f"steps_{rid}.txt", "heights.py", t, *stretch, "--road", rid, "--steps")]
    with ThreadPoolExecutor(JOBS) as ex:
        got = dict(zip((j[0] for j in jobs), ex.map(lambda j: tool(out, *j), jobs)))
    print(f"{os.path.relpath(out, HERE)}: read map.png first; {len(jobs) + 1} files")
    for name, text in got.items():
        if " failed, exit " in text:
            print(f"  {name}: the tool failed, see the file")
    for rid, off, what in roads:
        worst, at, pins = off_elevation(got[f"steps_{rid}.txt"])
        far = "no plan near" if worst is None else f"plan {worst:+.2f} m off the elevation at {at} m from its last point"
        print(f"  {rid}  {off:4.1f} m off the line: {what}; {far}; pins {pins or 'none'}")


if __name__ == "__main__":
    main()
