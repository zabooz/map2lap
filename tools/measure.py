"""Measure built tracks: what a car feels along the driving line, compared with the reference values of the test tracks.

Measured is the top driving surface (terrain `*_ground_*` or bridge deck `1ROAD_deck*`) every 1 m along the route,
on the line and across at -2..+2 m (per lane the surface closest to the previous one: a bridge above doesn't count):
- G: vertical acceleration at 100 km/h (x 6.25 for 250 km/h); metres above 0.5 G on the line and in any of the lanes
  (a 10 cm step along the road gives ~2 G).
- Transitions: terrain <-> bridge deck on the line, with the step and the G there.
- Edges across: where the surface deviates from its cross slope by more than EDGE_M from one metre to the next
  (second difference: a slope doesn't count, a step does), -2..+2 m.

The test tracks (test_tracks.json) are short routes, one per bridge or underpass worth checking. --build builds them
up to the OBJ parts only (out/tracks/<name>: no distant view, no kn5, nothing goes into AC); --install builds one into
AC to drive it.

    .venv\\Scripts\\python.exe tools\\measure.py --all --build                      # build all test tracks again, measure
    .venv\\Scripts\\python.exe tools\\measure.py bruecke_eisenkappel --build        # one of them
    .venv\\Scripts\\python.exe tools\\measure.py bruecke_eisenkappel --from 180 --to 260   # a section, every spot
    .venv\\Scripts\\python.exe tools\\measure.py bruecke_eisenkappel --install      # into AC, to drive it
    .venv\\Scripts\\python.exe tools\\measure.py a2_test                            # any track built before
    ... --reference    save the values as the new reference in test_tracks.json (the state a change is compared with)
"""
import argparse
import glob
import json
import os

import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
sys.path.insert(0, os.path.join(HERE, "src"))
from app import settings  # noqa: E402
from track import obj_to_kn5  # noqa: E402

TEST_TRACKS = os.path.join(HERE, "tools", "test_tracks.json")
ROUTE_FILES = ("map2lap_route.txt", "ac_export_route.txt")     # (data/ of the track; the second: older builds)
CELL_M = 20.0           # m: grid the triangles are sorted into for the lookup
ACROSS_M = (-2, -1, 0, 1, 2)   # m across the route: the two lanes around the line (wider would hit kerbs)
EDGE_M = 0.10           # m step against the cross slope between neighbouring points 1 m apart
G_LIMIT = 0.5           # G at 100 km/h
V = 100 / 3.6


def _surfaces(track, box):
    """Triangles (n, 3, 3) of the driving surfaces in box (x0, z0, x1, z1) and per triangle: is it a bridge deck."""
    tris, deck = [], []
    for p in glob.glob(os.path.join(HERE, "out", "tracks", track, "obj", "parts", "t_*.obj")):
        for name, (_m, P, _UV, T) in obj_to_kn5.read_obj(p).items():
            d = name.startswith("1ROAD_deck")
            if "_ground_" not in name and not d:
                continue
            t = P[T]
            c = t.mean(1)
            keep = (c[:, 0] >= box[0]) & (c[:, 0] <= box[2]) & (c[:, 2] >= box[1]) & (c[:, 2] <= box[3])
            tris.append(t[keep])
            deck.append(np.full(int(keep.sum()), d))
    return np.concatenate(tris), np.concatenate(deck)


def _heights(T3, D, qx, qz):
    """Per query point every driving surface below it: a list of (heights, is deck)."""
    cx, cz = T3[:, :, 0].mean(1), T3[:, :, 2].mean(1)
    key = np.floor(cx / CELL_M) * 1e6 + np.floor(cz / CELL_M)
    order = np.argsort(key)
    cell = key[order]
    qk = np.floor(qx / CELL_M) * 1e6 + np.floor(qz / CELL_M)
    out = [None] * len(qx)
    for k in np.unique(qk):
        qi = np.flatnonzero(qk == k)
        kx, kz = np.floor(k / 1e6 + 0.5e-6), k - np.floor(k / 1e6 + 0.5e-6) * 1e6
        idx = np.concatenate([order[np.searchsorted(cell, c):np.searchsorted(cell, c, "right")]
                              for c in ((kx + dx) * 1e6 + kz + dz for dx in (-1, 0, 1) for dz in (-1, 0, 1))])
        if not len(idx):
            for i in qi:
                out[i] = (np.zeros(0), np.zeros(0, bool))
            continue
        A, B, C = T3[idx, 0], T3[idx, 1], T3[idx, 2]
        v0 = (B - A)[:, [0, 2]]
        v1 = (C - A)[:, [0, 2]]
        d = v0[:, 0] * v1[:, 1] - v1[:, 0] * v0[:, 1]
        d = np.where(np.abs(d) < 1e-12, 1e-12, d)
        px = qx[qi][:, None] - A[None, :, 0]
        pz = qz[qi][:, None] - A[None, :, 2]
        u = (px * v1[None, :, 1] - v1[None, :, 0] * pz) / d[None]
        v = (v0[None, :, 0] * pz - px * v0[None, :, 1]) / d[None]
        ins = (u >= -1e-6) & (v >= -1e-6) & (u + v <= 1 + 1e-6)
        y = A[None, :, 1] + u * (B - A)[None, :, 1] + v * (C - A)[None, :, 1]
        for j, i in enumerate(qi):
            out[i] = (y[j, ins[j]], D[idx[ins[j]]])
    return out


def _lane(hits):
    """The surface along a lane: per point the one closest to the previous (at first the lowest; more than 0.5 m
    higher only counts if nothing lies below). (heights, is deck), NaN where there is none."""
    h = np.full(len(hits), np.nan)
    dk = np.zeros(len(hits), bool)
    last = None
    for k, (z, d) in enumerate(hits):
        if not len(z):
            continue
        if last is None:
            i = int(np.argmin(z))
        else:
            under = np.flatnonzero(z <= last + 0.5)
            i = int(under[np.argmax(z[under])]) if len(under) else int(np.argmin(np.abs(z - last)))
        h[k] = last = float(z[i])
        dk[k] = bool(d[i])
    return h, dk


def _route(track):
    """The route in AC coordinates (x east, z = -north): from the build's anchor.json, else the track folder in AC."""
    anchor = os.path.join(HERE, "out", "tracks", track, "tiles", "anchor.json")
    if os.path.exists(anchor):
        with open(anchor, encoding="utf-8") as f:
            xy = np.asarray(json.load(f).get("route") or [], np.float64)
        if len(xy):
            return np.c_[xy[:, 0], -xy[:, 1]]
    data = os.path.join(settings.ac_path(), "content", "tracks", track, "data")
    path = next((os.path.join(data, n) for n in ROUTE_FILES if os.path.exists(os.path.join(data, n))),
                os.path.join(data, ROUTE_FILES[0]))
    return np.loadtxt(path, skiprows=1)


def measure(track, start=None, end=None):
    route = _route(track)
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(route, axis=0).T))]
    s0, s1 = (start or 0.0), min(end or S[-1], S[-1])
    ss = np.arange(s0, s1, 1.0)
    px, pz = np.interp(ss, S, route[:, 0]), np.interp(ss, S, route[:, 1])
    tx = np.interp(ss + 1, S, route[:, 0]) - np.interp(ss - 1, S, route[:, 0])
    tz = np.interp(ss + 1, S, route[:, 1]) - np.interp(ss - 1, S, route[:, 1])
    tn = np.maximum(np.hypot(tx, tz), 1e-9)
    nx, nz = -tz / tn, tx / tn
    box = (px.min() - 30, pz.min() - 30, px.max() + 30, pz.max() + 30)
    T3, D = _surfaces(track, box)
    qx = np.concatenate([px + nx * w for w in ACROSS_M])
    qz = np.concatenate([pz + nz * w for w in ACROSS_M])
    hits = _heights(T3, D, qx, qz)
    n = len(ss)
    lanes = [_lane(hits[j * n:(j + 1) * n]) for j in range(len(ACROSS_M))]
    H = np.array([h for h, _ in lanes])                # (lanes, metres)
    h, isd = lanes[ACROSS_M.index(0)]
    g = np.full(n, np.nan)
    g[2:-2] = (h[4:] - 2 * h[2:-2] + h[:-4]) / 4.0 * V ** 2 / 9.81
    ga = np.abs(np.nan_to_num(g))
    trans = []
    for e in np.flatnonzero(np.diff(isd.astype(int)) != 0):
        w = slice(max(e - 12, 0), e + 13)
        trans.append({"m": float(ss[e]), "onto": bool(isd[e + 1]), "g": round(float(np.nanmax(ga[w])), 2),
                      "step": round(float(h[e + 1] - h[e]), 3)})
    gs = np.zeros(n)                                    # per metre the strongest G of the lanes
    gs[2:-2] = np.nan_to_num(np.abs(H[:, 4:] - 2 * H[:, 2:-2] + H[:, :-4])).max(0) / 4.0 * V ** 2 / 9.81
    edge = np.nan_to_num(np.abs(np.diff(H, 2, axis=0))).max(0) > EDGE_M
    worst = sorted(np.flatnonzero(ga > G_LIMIT), key=lambda k: -ga[k])
    return {"length_m": round(float(S[-1])), "over_05g_m": int((ga > G_LIMIT).sum()),
            "lanes_over_05g_m": int((gs > G_LIMIT).sum()),
            "max_g": round(float(ga.max()), 2), "max_g_at_m": float(ss[int(ga.argmax())]),
            "edges_m": int(edge.sum()), "transitions": len(trans),
            "max_g_transition": max((u["g"] for u in trans), default=0.0),
            "_worst": [(float(ss[k]), round(float(g[k]), 2), bool(isd[k])) for k in worst],
            "_edges": ss[edge], "_trans": trans}


def _ranges(m):
    """Metre values as ranges: [(from, to)]."""
    if not len(m):
        return []
    br = np.flatnonzero(np.diff(m) > 3) + 1
    return [(float(a[0]), float(a[-1])) for a in np.split(m, br)]


def report(track, r, ref=None, everything=False):
    def cmp(k, worse_if_more=True):
        if not ref or k not in ref:
            return ""
        a, b = ref[k], r[k]
        if b == a:
            return "  (same as reference)"
        worse = (b > a) == worse_if_more
        return f"  (reference {a}{'  <-- WORSE' if worse else ', better'})"
    print(f"\n{track}: {r['length_m']} m")
    print(f"  above {G_LIMIT} G at 100 km/h on the line: {r['over_05g_m']} m" + cmp("over_05g_m"))
    print(f"  ... in any lane (-2..+2 m): {r['lanes_over_05g_m']} m" + cmp("lanes_over_05g_m"))
    print(f"  worst spot: {r['max_g']} G at {r['max_g_at_m']:.0f} m ({r['max_g'] * 6.25:.1f} G at 250 km/h)"
          + cmp("max_g"))
    print(f"  edges across above {EDGE_M * 100:.0f} cm (-2..+2 m): {r['edges_m']} m" + cmp("edges_m"))
    print(f"  bridge transitions: {r['transitions']}, strongest {r['max_g_transition']} G" + cmp("max_g_transition"))
    n = None if everything else 8
    for s, gg, d in r["_worst"][:n]:
        print(f"     {s:7.0f} m  {gg:+6.2f} G  ({gg * 6.25:+6.1f} G at 250)  {'deck' if d else 'terrain'}")
    rg = _ranges(r["_edges"])
    if rg:
        print("  edges at: " + ", ".join(f"{a:.0f}" if a == b else f"{a:.0f}-{b:.0f}" for a, b in rg[:n]) + " m"
              + (f" (+{len(rg) - n} more)" if n and len(rg) > n else ""))
    for u in r["_trans"]:              # (the bridges' ends: a test track has a few)
        print(f"     {u['m']:7.0f} m  {'onto' if u['onto'] else 'off '}  {u['g']:5.2f} G, step {u['step']:+.3f} m")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tracks", nargs="*")
    ap.add_argument("--all", action="store_true", help="all test tracks from test_tracks.json")
    ap.add_argument("--build", action="store_true", help="build them again first, up to the OBJ parts (test tracks only)")
    ap.add_argument("--install", action="store_true", help="build them into AC instead, to drive them (test tracks only)")
    ap.add_argument("--from", dest="start", type=float)
    ap.add_argument("--to", dest="end", type=float)
    ap.add_argument("--reference", action="store_true", help="save the values as the new reference")
    a = ap.parse_args()
    with open(TEST_TRACKS, encoding="utf-8") as f:
        test = json.load(f)
    tracks = list(test) if a.all else a.tracks
    if not tracks:
        ap.error("a track or --all")
    if a.build or a.install:
        import generator
        for t in tracks:
            if t not in test:
                ap.error(f"{t} is not a test track (test_tracks.json)")
            print(f"building {t} ...", flush=True)
            if a.install:
                generator.build(test[t]["points"], test[t]["width"], t, test[t]["title"])
            else:
                generator.build(test[t]["points"], test[t]["width"], t, log=lambda *x: None, upto="obj")
    part = a.start is not None or a.end is not None
    for t in tracks:
        r = measure(t, a.start, a.end)
        if t in test:
            print(f"\n{test[t]['about']}", end="")
        report(t, r, None if part else test.get(t, {}).get("reference"), everything=part)
        if a.reference and t in test and not part:
            test[t]["reference"] = {k: v for k, v in r.items() if not k.startswith("_")}
    if a.reference:
        with open(TEST_TRACKS, "w", encoding="utf-8") as f:
            json.dump(test, f, indent=1, ensure_ascii=False)
        print("\nReference saved.")


if __name__ == "__main__":
    main()
