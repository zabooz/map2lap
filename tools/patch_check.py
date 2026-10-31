"""Is a bump ours or BeamNG.Earth's? Builds a track's stretch with and without our patches (src/track/patches.py) and
compares the driving surface along the route; where they differ, finds the patch by halving the set.

Fast builds: tiles and OBJ parts only (generator.build upto="obj": no distant view, no kn5, nothing goes into AC),
each in a fresh process with its switches set, in out/tracks/patchcheck_<n> (deleted after). The route metres are the debug
app's (data/map2lap_route.txt, generator: the route from its first pin).

    .venv\\Scripts\\python.exe tools\\patch_check.py <track> <from m> <to m>      (a track built before: its points)
    .venv\\Scripts\\python.exe tools\\patch_check.py <track> 20 60 --each         (every patch off on its own too)
    .venv\\Scripts\\python.exe tools\\patch_check.py <track> 20 60 --off P5,P8     (one more variant)
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
from track import obj_to_kn5, patches  # noqa: E402

SAME_M = 0.01           # m: two profiles this close everywhere are the same
SURFACES = ("1ROAD", "1GRAVEL", "1KERB", "1GRASS")      # (what a wheel can stand on; walls are not)


def track_points(name):
    """(points, width) of a track built before (its data/map2lap.json in AC)."""
    with open(os.path.join(settings.ac_path(), "content", "tracks", name, "data", "map2lap.json"),
              encoding="utf-8") as f:
        d = json.load(f)
    if d.get("area"):
        raise SystemExit("an area has no route to measure along")
    return d["points"], d.get("width") or 100.0


def build(points, width, work, env):
    """Tiles and OBJ parts in out/tracks/<work> in a fresh process with env's switches (they are read at import)."""
    code = ("import sys, os; sys.path.insert(0, os.path.join(sys.argv[1], 'src')); os.chdir(sys.argv[1]);"
            "import json, generator; a = json.loads(sys.argv[2]);"
            "generator.build(a['points'], a['width'], a['name'], log=lambda *x: None, upto='obj')")
    arg = json.dumps({"points": points, "width": width, "name": work})
    r = subprocess.run([sys.executable, "-c", code, HERE, arg], env={**os.environ, **env}, capture_output=True,
                       text=True)
    if r.returncode:
        raise SystemExit(f"build {work} failed:\n{r.stderr[-2000:]}")


def profile(work, m0, m1, step):
    """Heights of the highest drivable surface along the route from m0 to m1 every step m (NaN: none)."""
    root = os.path.join(HERE, "out", "tracks", work)
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
    ap.add_argument("--each", action="store_true", help="also every patch off on its own")
    ap.add_argument("--off", action="append", default=[], help="another variant: these patches off (P1,P5,...)")
    ap.add_argument("--keep", action="store_true", help="keep the work folders (out/tracks/patchcheck_*)")
    a = ap.parse_args()
    points, width = track_points(a.track)
    variants = [("ours", []), ("BeamNG.Earth", list(patches.PATCHES))]
    variants += [("off " + v, [p.strip().upper() for p in v.split(",")]) for v in a.off]
    if a.each:
        variants += [(f"{p} off", [p]) for p in patches.PATCHES]
    results, works = {}, []

    def run(label, ids):
        if label not in results:
            work = f"patchcheck_{len(works)}"
            works.append(work)
            print(f"building {label} ...", flush=True)
            build(points, width, work, patches.off_env(ids))
            results[label] = profile(work, a.m0, a.m1, a.step)[1]
        return results[label]

    try:
        for label, ids in variants:
            run(label, ids)
        ours = results["ours"]
        # where ours and BeamNG.Earth's differ: halve the patches until one is left (a pair working together shows as
        # the half that changes it)
        cand = list(patches.PATCHES)
        if np.nanmax(np.abs(ours - results["BeamNG.Earth"])) > SAME_M:
            while len(cand) > 1:
                half = cand[:len(cand) // 2]
                z = run("off " + ",".join(half), half)
                cand = half if np.nanmax(np.abs(ours - z)) > SAME_M else cand[len(cand) // 2:]
        m = np.arange(a.m0, a.m1 + 1e-6, a.step)
        labels = list(results)
        print("\n     m  " + "  ".join(f"{lab[:12]:>12s}" for lab in labels))
        for k in range(len(m)):
            print(f"{m[k]:6.1f}  " + "  ".join(f"{results[lab][k]:12.2f}" for lab in labels))
        print()
        for lab in labels:
            dz, dg = bumpiness(results[lab], a.step)
            diff = np.nanmax(np.abs(results[lab] - ours))
            print(f"{lab:28s} largest step {dz:5.2f} m, largest grade change {dg:5.1f} %, differs from ours by "
                  f"up to {diff:.2f} m")
        if np.nanmax(np.abs(ours - results["BeamNG.Earth"])) <= SAME_M:
            print("\nThe same with and without our patches: BeamNG.Earth's own behaviour.")
        else:
            print(f"\nOurs differs from BeamNG.Earth's: {cand[0]} ({patches.PATCHES[cand[0]][0]}) changes it "
                  f"(found by halving; check pairs with --off).")
    finally:
        if not a.keep:
            for w in works:
                shutil.rmtree(os.path.join(HERE, "out", "tracks", w), ignore_errors=True)


if __name__ == "__main__":
    main()
