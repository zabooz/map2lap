"""What the last measure.py build of a track did (engine/buildtrace.py, out/trace/<track>): workers and their tiles in order,
cells planned, read and kept, a cell with two plans, each fault. For when two builds of the same code differ.

    .venv\\Scripts\\python.exe tools\\build_trace.py <track>
    .venv\\Scripts\\python.exe tools\\build_trace.py <track> --tile 7,5     # who built that tile, and what that worker built before it
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "engine"))
import buildtrace  # noqa: E402

TRACE = os.path.join(HERE, "out", "trace")


def lines(s):
    """The lines saying what a summary holds. Pure."""
    counts = {}
    for hashes in s["plans"].values():
        for events in hashes.values():
            for event, n in events.items():
                counts[event] = counts.get(event, 0) + n
    out = [f"{len(s['tiles'])} workers, {sum(len(v) for v in s['tiles'].values())} tiles; {len(s['plans'])} cells: "
           f"planned {counts.get('plan_made', 0)}, read from this build {counts.get('plan_read', 0)}, "
           f"from the revisit cache {counts.get('plan_kept', 0)}"]
    for cell, hashes in sorted(s["plans"].items()):
        if len(hashes) > 1:
            out.append(f"  TWO PLANS for cell {cell}: " + ", ".join(f"{h}: {sum(e.values())}x" for h, e in sorted(hashes.items())))
    for who, n in sorted(s["faults"].items(), key=lambda kv: -kv[1]):
        out.append(f"  fault {n}x: {who}")
    return out


def tile_lines(s, tile):
    """The workers that built tile ("x, y") and what each built before it. Pure."""
    want = "(" + ", ".join(v.strip() for v in tile.split(",")) + ")"
    out = [f"  worker {proc}: {' '.join(seq[:seq.index(want)])} -> {want}" for proc, seq in sorted(s["tiles"].items()) if want in seq]
    return out or [f"  tile {want}: not in this trace"]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("track")
    ap.add_argument("--tile", help="x,y: who built it and after which tiles")
    a = ap.parse_args()
    rows = buildtrace.read(os.path.join(TRACE, a.track))
    if not rows:
        print(f"no trace of {a.track}: build it with tools/measure.py {a.track} --build")
        return 1
    s = buildtrace.summary(rows)
    print("\n".join(tile_lines(s, a.tile) if a.tile else lines(s)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
