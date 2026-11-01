"""Drivability check: drive the track's route every 2 m and find holes and jumps in the road surface.

Per route point, road heights (1ROAD_road_, 1ROAD_deck_, 1GRAVEL_) are looked up across the driving direction at
several offsets (the route often lies on the seam between two carriageways). Along the route the height closest to the
previous one is taken (an overpass above doesn't count). In several processes, one per tile part file (obj/parts).

Where a road is drawn as its own mesh over the ground (the visual nocol_road_asphalt, a road or deck mesh), the
ground (every *_ground_ part, the road-painted 1ROAD_ground too) has to lie clearly below it, or it shows through
the street: the zigzag figures.

    .venv\\Scripts\\python.exe check_drive.py wien [--csv out\\wien_drive.csv]
"""
import argparse
import glob
import json
import os
from collections import defaultdict

import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
sys.path.insert(0, os.path.join(HERE, "src"))
from track import obj_to_kn5, parallel  # noqa: E402

STEP = 2.0                              # m between route points
OFFSETS = (-6.0, -4.0, -2.0, 0.0, 2.0, 4.0, 6.0)   # m across the route (the OSRM line is sometimes > 3 m off)
TILE = 256.0
JUMP_M = 0.8                            # height jump from point to point (2 m) that jolts or crashes
GAP_M = 4.0                             # m without road surface that count as a hole
FOLLOW_M = 3.0                          # m: surfaces further away don't belong to our own road
REACQUIRE_M = 10.0                      # m without our own road, after that the closest one counts again
SURF = ("1ROAD_", "1GRAVEL_")             # (terrain under roads, bridges)
VISIBLE_ROAD = "nocol_road_asphalt"     # (the road's own visual mesh, drawn over the ground: you drive on the ground)
# m: ground closer under a road mesh than this shows through it (AC's depth buffer can't keep two surfaces a few cm
# apart in order at 50 m and more: the grass flickers through the asphalt; make_obj lays roads 4 cm above the ground)
SHOW_M = 0.02


def _is_ground(name):
    """True for the terrain mesh's parts (1GRASS_ground_, 1GRAVEL_ground_, the road-painted 1ROAD_ground_ ...)."""
    return "_ground_" in name and not name.startswith("nocol")


def _is_road_mesh(name):
    """True for a road drawn as its own mesh over the ground (visual asphalt, road and deck meshes, gravel roads)."""
    return name.startswith(VISIBLE_ROAD) or (name.startswith(SURF) and not _is_ground(name))


def _tile_heights(part, xy):
    """Per point xy (n, 2, ENU) of a part file: (all driving surface heights, all ground heights, all road mesh
    heights)."""
    out = [([], [], []) for _ in range(len(xy))]
    if not os.path.exists(part):
        return out
    x, z = xy[:, 0], -xy[:, 1]                          # ENU -> AC
    for name, (_, P, _, T) in obj_to_kn5.read_obj(part).items():
        slots = ([0] if name.startswith(SURF) else []) + ([1] if _is_ground(name) else []) \
            + ([2] if _is_road_mesh(name) else [])
        if not slots:
            continue
        a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
        lo, hi = np.minimum(np.minimum(a, b), c), np.maximum(np.maximum(a, b), c)
        for i in np.flatnonzero((x >= lo[:, 0].min()) & (x <= hi[:, 0].max()) & (z >= lo[:, 2].min())
                                & (z <= hi[:, 2].max())):
            m = (lo[:, 0] <= x[i]) & (hi[:, 0] >= x[i]) & (lo[:, 2] <= z[i]) & (hi[:, 2] >= z[i])
            if not m.any():
                continue
            A, B, C = a[m], b[m], c[m]
            den = (B[:, 2] - C[:, 2]) * (A[:, 0] - C[:, 0]) + (C[:, 0] - B[:, 0]) * (A[:, 2] - C[:, 2])
            ok = np.abs(den) > 1e-12
            den = np.where(ok, den, 1.0)
            w1 = ((B[:, 2] - C[:, 2]) * (x[i] - C[:, 0]) + (C[:, 0] - B[:, 0]) * (z[i] - C[:, 2])) / den
            w2 = ((C[:, 2] - A[:, 2]) * (x[i] - C[:, 0]) + (A[:, 0] - C[:, 0]) * (z[i] - C[:, 2])) / den
            w3 = 1 - w1 - w2
            hit = ok & (w1 >= -1e-6) & (w2 >= -1e-6) & (w3 >= -1e-6)
            hs = (w1 * A[:, 1] + w2 * B[:, 1] + w3 * C[:, 1])[hit].tolist()
            for slot in slots:
                out[i][slot].extend(hs)
    return out


def heights_along(work, log=print):
    """(s, height per route point or nan, points (n, 2) ENU) of the route in work/tiles/anchor.json."""
    with open(os.path.join(work, "tiles", "anchor.json"), encoding="utf-8") as f:
        route = np.asarray(json.load(f)["route"], float)
    s_r = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(route, axis=0), axis=1))]
    s = np.arange(0.0, s_r[-1], STEP)
    p = np.c_[np.interp(s, s_r, route[:, 0]), np.interp(s, s_r, route[:, 1])]
    t = np.gradient(p, axis=0)
    t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-9)
    nrm = np.c_[-t[:, 1], t[:, 0]]
    samples = np.concatenate([p + o * nrm for o in OFFSETS])           # (len(OFFSETS) * n, 2)
    owner = np.tile(np.arange(len(p)), len(OFFSETS))
    groups = defaultdict(list)
    for k, (x, y) in enumerate(samples):
        groups[(int(np.floor(x / TILE)), int(np.floor(y / TILE)))].append(k)
    keys = list(groups)
    parts = [os.path.join(work, "obj", "parts", f"t_{tx}_{ty}.obj") for tx, ty in keys]
    n = parallel.workers(len(keys))
    log(f"Drive check: {len(s)} points, {len(keys)} tiles, {n} processes ...")
    cand = [[] for _ in range(len(p))]
    shown = [[] for _ in range(len(p))]           # (per point: (road mesh height, highest ground) at its offsets)
    with parallel.pool(n) as ex:
        for key, res in zip(keys, ex.map(_tile_heights, parts, [samples[groups[k]] for k in keys],
                                         chunksize=max(1, len(keys) // (4 * n)))):
            for k, (hs, gs, ms) in zip(groups[key], res):
                cand[owner[k]] += hs
                if gs:
                    shown[owner[k]] += [(m, max(gs)) for m in ms]
    h = np.full(len(p), np.nan)
    prev, last = None, -1e9
    for i, c in enumerate(cand):
        if not c:
            continue
        c = np.asarray(c)
        if prev is None:
            h[i] = c.min()          # (start: the lowest, an overpass above is not ours)
        else:
            j = np.argmin(np.abs(c - prev))
            if abs(c[j] - prev) <= FOLLOW_M or s[i] - last > REACQUIRE_M:
                h[i] = c[j]         # (after REACQUIRE_M without our road: the closest one is ours again)
            else:
                continue            # (only other surfaces nearby, like an overpass: like a hole, prev stays)
        prev, last = h[i], s[i]
    # m by which the ground lies above our own road's mesh; nan where the road is only painted into the ground
    poke = np.full(len(p), np.nan)
    for i in np.flatnonzero(np.isfinite(h)):
        g = [gg - m for m, gg in shown[i] if abs(m - h[i]) <= FOLLOW_M]
        if g:
            poke[i] = max(g)
    return s, h, p, poke


def _tile_poke(part):
    """All road mesh vertices of a part file: (count, of those with the ground showing through (SHOW_M), > 10 cm
    above, > 50 cm above)."""
    objs = obj_to_kn5.read_obj(part)
    pts = [P for name, (_, P, _, _) in objs.items() if _is_road_mesh(name)]
    if not pts:
        return 0, 0, 0, 0
    Q = np.concatenate(pts)
    x, z, y = Q[:, 0], Q[:, 2], Q[:, 1]
    g = np.full(len(Q), -np.inf)
    for name, (_, P, _, T) in objs.items():
        if not _is_ground(name):
            continue
        a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
        # (terrain: a regular 2 m grid, so per point only check the triangles of its cell)
        cx = np.floor((x - P[:, 0].min()) / 2.0).astype(int)
        cz = np.floor((z - P[:, 2].min()) / 2.0).astype(int)
        tcx = np.floor((np.minimum(np.minimum(a[:, 0], b[:, 0]), c[:, 0]) - P[:, 0].min() + 1e-6) / 2.0).astype(int)
        tcz = np.floor((np.minimum(np.minimum(a[:, 2], b[:, 2]), c[:, 2]) - P[:, 2].min() + 1e-6) / 2.0).astype(int)
        cell = defaultdict(list)
        for k, key in enumerate(zip(tcx, tcz)):
            cell[key].append(k)
        for i in range(len(Q)):
            ks = cell.get((cx[i], cz[i]))
            if not ks:
                continue
            A, B, C = a[ks], b[ks], c[ks]
            den = (B[:, 2] - C[:, 2]) * (A[:, 0] - C[:, 0]) + (C[:, 0] - B[:, 0]) * (A[:, 2] - C[:, 2])
            ok = np.abs(den) > 1e-12
            den = np.where(ok, den, 1.0)
            w1 = ((B[:, 2] - C[:, 2]) * (x[i] - C[:, 0]) + (C[:, 0] - B[:, 0]) * (z[i] - C[:, 2])) / den
            w2 = ((C[:, 2] - A[:, 2]) * (x[i] - C[:, 0]) + (A[:, 0] - C[:, 0]) * (z[i] - C[:, 2])) / den
            w3 = 1 - w1 - w2
            hit = ok & (w1 >= -1e-6) & (w2 >= -1e-6) & (w3 >= -1e-6)
            if hit.any():
                g[i] = max(g[i], (w1 * A[:, 1] + w2 * B[:, 1] + w3 * C[:, 1])[hit].max())
    d = g - y
    return len(Q), int((d > -SHOW_M).sum()), int((d > 0.1).sum()), int((d > 0.5).sum())


def all_roads_poke(work):
    """Zigzag over all roads of all tiles (not only the route): sums of _tile_poke."""
    parts = sorted(glob.glob(os.path.join(work, "obj", "parts", "t_*.obj")))
    n = parallel.workers(len(parts))
    with parallel.pool(n) as ex:
        r = np.array(list(ex.map(_tile_poke, parts, chunksize=max(1, len(parts) // (4 * n)))))
    return r.sum(axis=0)


def problems(s, h):
    """[(from m, to m, kind, size)]: holes (> GAP_M without road) and jumps (> JUMP_M over STEP)."""
    out = []
    i, n = 0, len(h)
    while i < n:
        if np.isnan(h[i]):
            j = i
            while j < n and np.isnan(h[j]):
                j += 1
            if (j - i) * STEP >= GAP_M and i > 0 and j < n:
                out.append((s[i], s[j - 1], "hole", (j - i) * STEP))
            i = j
            continue
        if i + 1 < n and not np.isnan(h[i + 1]) and abs(h[i + 1] - h[i]) > JUMP_M:
            out.append((s[i], s[i + 1], "jump", h[i + 1] - h[i]))
        i += 1
    return out


def _runs(s, mask):
    """[(from m, to m)] of the stretches where mask holds (gaps up to GAP_M bridged). Pure."""
    out = []
    for i in np.flatnonzero(mask):
        if out and s[i] - out[-1][1] <= GAP_M:
            out[-1][1] = s[i]
        else:
            out.append([s[i], s[i]])
    return [tuple(r) for r in out]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("track")
    ap.add_argument("--csv")
    ap.add_argument("--all-roads", action="store_true", help="measure the zigzag over all roads of the tiles")
    a = ap.parse_args()
    work = os.path.join(HERE, "out", "tracks", a.track)
    s, h, p, poke = heights_along(work)
    probs = problems(s, h)
    holes = [q for q in probs if q[2] == "hole"]
    jumps = [q for q in probs if q[2] == "jump"]
    print(f"Route {s[-1] / 1000:.1f} km: {len(holes)} holes, {len(jumps)} jumps "
          f"(> {JUMP_M} m per {STEP:.0f} m), road found at {np.isfinite(h).mean() * 100:.1f} % of the points")
    k = np.isfinite(poke)
    show = k & (poke > -SHOW_M)
    print(f"Ground showing through the road mesh (zigzag): {show.sum()} of {k.sum()} points with a road mesh, "
          f"> 10 cm above: {(poke[k] > 0.1).sum()}, > 50 cm above: {(poke[k] > 0.5).sum()}")
    for a0, a1 in _runs(s, show):
        print(f"  {a0:9.0f} m  ground through the road to {a1:.0f} m")
    for a0, a1, kind, v in probs[:60]:
        print(f"  {a0:9.0f} m  {kind:4}  " + (f"{v:4.0f} m long" if kind == "hole" else f"{v:+5.2f} m"))
    if len(probs) > 60:
        print(f"  ... {len(probs) - 60} more")
    if a.all_roads:
        n, above, d10, d50 = all_roads_poke(work)
        print(f"All roads: {n:,} road mesh vertices, ground showing through {above:,} "
              f"({above / max(n, 1) * 100:.2f} %), > 10 cm above: {d10:,}, > 50 cm above: {d50:,}")
    if a.csv:
        with open(a.csv, "w", encoding="utf-8") as f:
            f.write("s_m,east,north,height\n")
            for si, (x, y), hi in zip(s, p, h):
                f.write(f"{si:.1f},{x:.2f},{y:.2f},{'' if np.isnan(hi) else f'{hi:.3f}'}\n")


if __name__ == "__main__":
    main()
