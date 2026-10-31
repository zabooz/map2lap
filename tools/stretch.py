"""A stretch of a track, fast: built again with the current code (tiles and OBJ parts only: generator.build
upto="obj", no distant view, no kn5, nothing goes into AC) and the driving surface measured along the route; compared
with the last run of the same stretch (out/stretch/<track>_<from>_<to>.json): before and after a fix.

The route metres are the debug app's (data/map2lap_route.txt: the route from its first pin).

    .venv\\Scripts\\python.exe tools\\stretch.py <track> <from m> <to m>      (a track built before: its points, width)
    .venv\\Scripts\\python.exe tools\\stretch.py <track> 20 60 --step 0.5
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
from app import settings  # noqa: E402
from track import obj_to_kn5  # noqa: E402

WORK = "stretch_work"   # out/tracks/<WORK> (deleted after)
SURFACES = ("1ROAD", "1GRAVEL", "1KERB", "1GRASS")      # (what a wheel can stand on; walls are not)


def track_points(name):
    """(points, width) of a track built before (its data/map2lap.json in AC)."""
    with open(os.path.join(settings.ac_path(), "content", "tracks", name, "data", "map2lap.json"),
              encoding="utf-8") as f:
        d = json.load(f)
    if d.get("area"):
        raise SystemExit("an area has no route to measure along")
    return d["points"], d.get("width") or 100.0


def build(points, width):
    """Tiles and OBJ parts in out/tracks/WORK, in a process of its own (the generator's worker pool needs a main
    module)."""
    code = ("import sys, os; sys.path.insert(0, os.path.join(sys.argv[1], 'src')); os.chdir(sys.argv[1]);"
            "import json, generator; a = json.loads(sys.argv[2]);"
            "generator.build(a['points'], a['width'], a['name'], log=lambda *x: None, upto='obj')")
    r = subprocess.run([sys.executable, "-c", code, HERE, json.dumps({"points": points, "width": width, "name": WORK})],
                       capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f"build failed:\n{r.stderr[-2000:]}")


def profile(m0, m1, step):
    """(metres, heights of the highest drivable surface along the route there: NaN where none)."""
    root = os.path.join(HERE, "out", "tracks", WORK)
    with open(os.path.join(root, "tiles", "anchor.json"), encoding="utf-8") as f:
        xy = np.asarray(json.load(f)["route"], np.float64)
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    m = np.arange(m0, m1 + 1e-6, step)
    px, pz = np.interp(m, s, xy[:, 0]), -np.interp(m, s, xy[:, 1])          # (AC: z = -north)
    lo, hi = np.array([px.min(), pz.min()]) - 20, np.array([px.max(), pz.max()]) + 20
    tris = []
    for p in glob.glob(os.path.join(root, "obj", "parts", "t_*.obj")):
        for name, (_m, P, _uv, T) in obj_to_kn5.read_obj(p).items():
            if name.startswith(SURFACES):
                c = P[T].mean(1)
                sel = (c[:, 0] > lo[0]) & (c[:, 0] < hi[0]) & (c[:, 2] > lo[1]) & (c[:, 2] < hi[1])
                tris.append(P[T[sel]])
    TR = np.concatenate(tris) if tris else np.zeros((0, 3, 3))
    a, b, c = TR[:, 0], TR[:, 1], TR[:, 2]
    v0, v1 = c[:, [0, 2]] - a[:, [0, 2]], b[:, [0, 2]] - a[:, [0, 2]]
    d00, d01, d11 = (v0 * v0).sum(1), (v0 * v1).sum(1), (v1 * v1).sum(1)
    den = d00 * d11 - d01 * d01
    good = np.abs(den) > 1e-9           # (vertical faces have no height to stand on)
    out = np.full(len(m), np.nan)
    for k, (x, z) in enumerate(zip(px, pz)):
        v2 = np.array([x, z]) - a[:, [0, 2]]
        d20, d21 = (v2 * v0).sum(1), (v2 * v1).sum(1)
        dd = np.where(good, den, 1.0)
        u, v = (d11 * d20 - d01 * d21) / dd, (d00 * d21 - d01 * d20) / dd
        ok = good & (u >= -1e-6) & (v >= -1e-6) & (u + v <= 1 + 1e-6)
        if ok.any():
            out[k] = float((a[ok, 1] + u[ok] * (c[ok, 1] - a[ok, 1]) + v[ok] * (b[ok, 1] - a[ok, 1])).max())
    return m, out


def bumpiness(z, step):
    """(largest height change between two samples, largest change of grade in % between neighbouring samples)."""
    dz = np.diff(z)
    return float(np.nanmax(np.abs(dz))), float(np.nanmax(np.abs(np.diff(dz / step)))) * 100.0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("track", help="a track built before (its folder name in AC)")
    ap.add_argument("m0", type=float, help="from this route metre")
    ap.add_argument("m1", type=float, help="to this one")
    ap.add_argument("--step", type=float, default=1.0, help="m between samples")
    a = ap.parse_args()
    points, width = track_points(a.track)
    os.makedirs(os.path.join(HERE, "out", "stretch"), exist_ok=True)
    last = os.path.join(HERE, "out", "stretch", f"{a.track}_{a.m0:g}_{a.m1:g}_{a.step:g}.json")
    before = None
    if os.path.exists(last):
        with open(last, encoding="utf-8") as f:
            before = np.array([np.nan if v is None else v for v in json.load(f)["z"]], np.float64)
    print("building ...", flush=True)
    try:
        build(points, width)
        m, z = profile(a.m0, a.m1, a.step)
    finally:
        shutil.rmtree(os.path.join(HERE, "out", "tracks", WORK), ignore_errors=True)
    if before is not None and len(before) != len(z):
        before = None
    print("\n     m      now" + ("   before   change" if before is not None else ""))
    for k in range(len(m)):
        row = f"{m[k]:6.1f}  {z[k]:7.2f}"
        if before is not None:
            row += f"  {before[k]:7.2f}  {z[k] - before[k]:+7.2f}"
        print(row)
    dz, dg = bumpiness(z, a.step)
    print(f"\nnow:    largest step {dz:.2f} m, largest grade change {dg:.1f} %")
    if before is not None:
        dz, dg = bumpiness(before, a.step)
        print(f"before: largest step {dz:.2f} m, largest grade change {dg:.1f} %")
    with open(last, "w", encoding="utf-8") as f:
        json.dump({"m": m.tolist(), "z": [None if np.isnan(v) else round(float(v), 3) for v in z]}, f)


if __name__ == "__main__":
    main()
