"""Measure built tracks: what a car feels along the driving line, compared with the reference values of the test tracks.

Measured is the top driving surface (terrain `*_ground_*` or bridge deck `1ROAD_deck*`) every 1 m along the route,
on the line and across at -2..+2 m (per lane the surface closest to the previous one: a bridge above doesn't count):
- G: vertical acceleration at 100 km/h (x 6.25 for 250 km/h); metres above 0.5 G on the line and in any of the lanes
  (a 10 cm step along the road gives ~2 G).
- Transitions: terrain <-> bridge deck on the line, with the step and the G there.
- Edges across: where the surface deviates from its cross slope by more than EDGE_M from one metre to the next
  (second difference: a slope doesn't count, a step does), -2..+2 m.
- Across the carriageway: its whole width (the visible asphalt or deck around the line, up to WIDTH_MAX_M each side),
  where the driving surface under it lies more than EDGE_M off a straight line across (one side sunk or raised).
- Ground over a deck: terrain points standing more than OVER_DECK_M above a deck over them, anywhere along the route: the
  car rides the terrain there, a bump the deck's own shape doesn't show.
- Not road under the line: metres where the surface under the line is not a 1ROAD_ object (grip and sound come from
  its prefix: the asphalt seen on the ground is only its texture). A dirt road's 1GRAVEL is right; a paved road's
  1GRASS is a fault (Auckland's motorway once drove as grass under its painted asphalt).

--surface prints a stretch's physics: per run of metres the object under the line and the prefixes across it.

--profile prints a stretch's surfaces apart: deck and ground per lane against the stretch's straight grade, and the line
as ridden with its slope per metre. Above, "terrain 3.1 G" says only which surface was on top.

The test tracks (test_tracks.json, named "<Place> Test") are short routes, each around the spots worth driving after a
change to the driving surface (a junction, a bridge end, an underpass): their pins lie along the route, so OSRM routes
it the same way again; "spots" names the route metres to look at (the Track Debug app's count). A few long ones
("long": true: a whole motorway stretch, a mountain road) are built only with --long, their builds take minutes. Each is
shown with its track code (app/trackcode.py: the same inputs, for the generator page). --build builds them up to the OBJ
parts only (out/tracks/<name>: no distant view, no kn5, nothing goes into AC); --install builds them into AC to drive
them, and measures the same build's OBJ parts. The short ones are built BUILD_JOBS at a time, each with that share of
the cores (one has a handful of tiles: alone it kept most cores idle); the long ones one after another, with all of
them. A build's log: out/build_<name>.log.

    .venv\\Scripts\\python.exe tools\\measure.py --all --build                      # the short test tracks built again
    .venv\\Scripts\\python.exe tools\\measure.py --long --build                     # ... the long ones
    .venv\\Scripts\\python.exe tools\\measure.py rechberg_test --build              # one of them
    .venv\\Scripts\\python.exe tools\\measure.py rechberg_test --from 70 --to 120   # a section, every spot
    .venv\\Scripts\\python.exe tools\\measure.py rechberg_test --profile --from 78 --to 118    # its surfaces apart
    .venv\\Scripts\\python.exe tools\\measure.py rechberg_test --surface --from 78 --to 118    # its physics (1ROAD, 1GRASS)
    .venv\\Scripts\\python.exe tools\\measure.py rechberg_test --install            # into AC, to drive it
    .venv\\Scripts\\python.exe tools\\measure.py a2_test                            # any track built before
    ... --reference    save the values as the new reference in test_tracks.json (the state a change is compared with)
    .venv\\Scripts\\python.exe tools\\measure.py griffen_bruecke_test --holes       # the gaps in the ground, whole corridor

--holes looks at every 2 m terrain cell of the built area, not only along the route, for gaps with nothing facing up to
stand on, and sorts each gap by whether a car gets there:
- lane: drivable surface on two opposite sides, the gap lies in the road: a car falls in.
- edge: drivable surface on one side, no wall in the gap: at the road's edge (a car leaving the road falls in).
- walled: beside the road, but a wall stands in it (a tunnel's): seen through at most.
- reachable: not at a road, but over ground a car can climb (CLIMB_M per cell) from one.
- unreachable: up a slope or behind walls: seen through at most.
"""
import argparse
import glob
import json
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
sys.path.insert(0, os.path.join(HERE, "src"))
from app import named, settings, trackcode, version  # noqa: E402
from track import obj_to_kn5  # noqa: E402

TEST_TRACKS = os.path.join(HERE, "tools", "test_tracks.json")
BUILD_JOBS = 3          # short test tracks built at a time
ROUTE_FILES = ("map2lap_route.txt", "ac_export_route.txt")     # (data/ of the track; the second: older builds)
CELL_M = 20.0           # m: grid the triangles are sorted into for the lookup
ACROSS_M = (-2, -1, 0, 1, 2)   # m across the route: the two lanes around the line (wider would hit kerbs)
EDGE_M = 0.10           # m step against the cross slope between neighbouring points 1 m apart
WIDTH_MAX_M = 15.0      # m each side of the line the carriageway is looked for
WIDTH_STEP_M = 0.5      # m between the points across it
PAINT = ("nocol_road_asphalt", "1ROAD_deck")    # (the visible carriageway: road asphalt, bridge decks)
FLOOR = "1WALL_deck_con"    # a tunnel's floor slab (its top: the surface a car drives on in the tube)
G_LIMIT = 0.5           # G at 100 km/h
V = 100 / 3.6
HOLE_CELL_M = 2.0       # m: the terrain's grid
CLIMB_M = 0.6           # m between neighbouring cells a car drives over (30 %): past that a slope stops it (--holes)
STAND_ON = ("1ROAD", "1GRASS", "1GRAVEL", "1KERB", FLOOR, "1WALL_tunnel", "1WALL_railcol", "nocol_road_asphalt")
OVER_DECK_M = 0.02      # m a terrain point may stand over the deck over it: at a joint both lie on one height, within this
OVER_DECK_NEAR_M = 1.0  # m: further above, it's a hillside beside a deck's other level, not this deck's ground
OVER_DECK_GAP_M = 10.0  # m along the route between two bridges' points
PROFILE_LANES = (-3.0, -2.0, 0.0, 2.0, 3.0)     # m across the route: a deck's whole carriageway
PROFILE_RUN_UP_M = 150.0    # m of road before a stretch to start the line on: longer than the bridges a stretch starts on
TILE_M = 256.0          # m: a tile's side (roads.tile_bbox): t_<tx>_<ty>.obj covers x tx*256.., north ty*256.. (z = -north)
TILE_REACH_M = 60.0     # m an object reaches past its tile: driving surfaces ~6, a building's collision wall 53 (Weblinger)
ROAD = "1ROAD"          # the physics prefix of a road (AC's surfaces.ini; docs/ac-rules.md)


def tile_touches(name, box):
    """Whether the tile of OBJ part file name (t_<tx>_<ty>.obj) can hold objects in box (x0, z0, x1, z1). Pure."""
    tx, ty = map(int, os.path.basename(name)[2:-4].split("_"))
    x0, x1, z0, z1 = tx * TILE_M, (tx + 1) * TILE_M, -(ty + 1) * TILE_M, -ty * TILE_M
    r = TILE_REACH_M
    return not (x1 + r < box[0] or x0 - r > box[2] or z1 + r < box[1] or z0 - r > box[3])


def tile_files(track, box=None):
    """track's OBJ part files of the tiles (t_*.obj), only those that can hold objects in box when given."""
    got = glob.glob(os.path.join(HERE, "out", "tracks", track, "obj", "parts", "t_*.obj"))
    return [p for p in got if box is None or tile_touches(p, box)]


def unsplit(name):
    """An object's name without the number a split adds (a mesh over 65,535 vertices): 1GRASS_ground_-22_14_1 ->
    1GRASS_ground_-22_14. Pure."""
    m = re.match(r"^(.*_-?\d+_-?\d+)_\d+$", name)
    return m.group(1) if m else name


def physics(name):
    """An object's physics prefix: 1ROAD_ground_-22_15 -> 1ROAD. Pure."""
    return name.split("_", 1)[0]


def _surfaces(track, box):
    """Triangles (n, 3, 3) of the driving surfaces in box (x0, z0, x1, z1), per triangle: is it a bridge deck, and its
    object's name. (A tunnel's floor slab counts by its top faces: without it the lane in a tube read the hill over it,
    30 G spikes.)"""
    tris, deck, names = [], [], []
    for p in tile_files(track, box):
        for name, (_m, P, _UV, T) in obj_to_kn5.read_obj(p).items():
            d = name.startswith("1ROAD_deck")
            floor = name.startswith(FLOOR)
            if "_ground_" not in name and not d and not floor:
                continue
            t = P[T]
            c = t.mean(1)
            keep = (c[:, 0] >= box[0]) & (c[:, 0] <= box[2]) & (c[:, 2] >= box[1]) & (c[:, 2] <= box[3])
            if floor:               # (the slab's top: faces looking up, not its sides or underside)
                n = np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0])
                keep &= n[:, 1] > 0.7 * np.linalg.norm(n, axis=1)
            tris.append(t[keep])
            deck.append(np.full(int(keep.sum()), d))
            names.append(np.full(int(keep.sum()), name, object))
    if not tris:
        return np.zeros((0, 3, 3)), np.zeros(0, bool), np.zeros(0, object)
    return np.concatenate(tris), np.concatenate(deck), np.concatenate(names)


def _paint(track, box):
    """Triangles (n, 3, 3) of the visible carriageway (PAINT) in box (x0, z0, x1, z1)."""
    tris = []
    for p in tile_files(track, box):
        for name, (_m, P, _UV, T) in obj_to_kn5.read_obj(p).items():
            if not name.startswith(PAINT):
                continue
            t = P[T]
            c = t.mean(1)
            tris.append(t[(c[:, 0] >= box[0]) & (c[:, 0] <= box[2]) & (c[:, 2] >= box[1]) & (c[:, 2] <= box[3])])
    return np.concatenate(tris) if tris else np.zeros((0, 3, 3))


def _across(T3, D, P3, px, pz, nx, nz, h):
    """Per metre the carriageway's surface off a straight line across it (m, the largest) and its width (m): the
    visible carriageway's points around the line (a gap of one point bridged), the driving surface under each (the
    one closest to the visible one), a least-squares line through them."""
    offs = np.arange(-WIDTH_MAX_M, WIDTH_MAX_M + 1e-9, WIDTH_STEP_M)
    c = int(np.flatnonzero(np.abs(offs) < 1e-9)[0])
    qx = (px[:, None] + nx[:, None] * offs[None]).ravel()
    qz = (pz[:, None] + nz[:, None] * offs[None]).ravel()
    vis = _heights(P3, np.zeros(len(P3), bool), qx, qz) if len(P3) else [(np.zeros(0), None)] * len(qx)
    drv = _heights(T3, D, qx, qz)
    n, m = len(px), len(offs)
    warp, width = np.zeros(n), np.zeros(n)
    for i in range(n):
        if np.isnan(h[i]):
            continue
        z = np.full(m, np.nan)
        for j in range(m):
            v, (d, _) = vis[i * m + j][0], drv[i * m + j]
            if len(v) and len(d):
                ref = v[np.argmin(np.abs(v - h[i]))]       # (the visible carriageway nearest the line's height)
                if abs(ref - h[i]) < 3.0:
                    z[j] = d[np.argmin(np.abs(d - ref))]
        ok = ~np.isnan(z)
        if not ok[c]:
            continue
        a = b = c
        while a > 0 and (ok[a - 1] or (a > 1 and ok[a - 2])):
            a -= 1
        while b < m - 1 and (ok[b + 1] or (b < m - 2 and ok[b + 2])):
            b += 1
        k = np.arange(a, b + 1)[ok[a:b + 1]]
        if offs[b] - offs[a] < 2.0:
            continue
        fit = np.polyval(np.polyfit(offs[k], z[k], 1), offs[k])
        warp[i] = float(np.abs(z[k] - fit).max())
        width[i] = float(offs[b] - offs[a])
    return warp, width


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


def over_deck(points, T3):
    """The terrain points (n, 3: x, height, z) standing over a deck of triangles T3 (m, 3, 3): (k, 4) rows x, z, height
    above the deck (m), height of the point, for those more than OVER_DECK_M and at most OVER_DECK_NEAR_M over the deck
    nearest in height. Pure."""
    if not len(points) or not len(T3):
        return np.zeros((0, 4))
    cells = {(int(a), int(b)) for a, b in np.floor(T3[:, :, [0, 2]].reshape(-1, 2) / CELL_M)}
    near = {(a + i, b + j) for a, b in cells for i in (-1, 0, 1) for j in (-1, 0, 1)}
    pk = np.floor(points[:, [0, 2]] / CELL_M).astype(np.int64)
    points = points[[(int(a), int(b)) in near for a, b in pk]]
    if not len(points):
        return np.zeros((0, 4))
    out = []
    for q, (z, _d) in zip(points, _heights(T3, np.ones(len(T3), bool), points[:, 0], points[:, 2])):
        if len(z):
            over = q[1] - z
            d = over[int(np.argmin(np.abs(over)))]
            if OVER_DECK_M < d <= OVER_DECK_NEAR_M:
                out.append((q[0], q[2], d, q[1]))
    return np.array(out, np.float64).reshape(-1, 4)


def over_deck_spots(rows, rx, rz, ss, s0=None, s1=None, gap=OVER_DECK_GAP_M):
    """over_deck's rows by place on the route (points (rx, rz) at metres ss): [{"from", "to", "n", "over", "at", "off"}], a
    spot per run of points with less than gap m between them, within s0..s1. "over": its highest (m), at "at" m, "off" m
    off the line. Pure."""
    if not len(rows):
        return []
    d = np.hypot(rows[:, 0, None] - rx[None], rows[:, 1, None] - rz[None])
    k = d.argmin(1)
    s, off = ss[k], d[np.arange(len(rows)), k]
    keep = (s >= (-np.inf if s0 is None else s0)) & (s <= (np.inf if s1 is None else s1)) & (off <= WIDTH_MAX_M)
    s, off, over = s[keep], off[keep], rows[keep, 2]
    order = np.argsort(s)
    s, off, over = s[order], off[order], over[order]
    out = []
    for run in np.split(np.arange(len(s)), np.flatnonzero(np.diff(s) >= gap) + 1) if len(s) else []:
        i = run[int(over[run].argmax())]
        out.append({"from": float(s[run[0]]), "to": float(s[run[-1]]), "n": len(run), "over": float(over[i]),
                    "at": float(s[i]), "off": float(off[i])})
    return out


def _terrain_points(track, box):
    """The terrain's vertices (n, 3) in box (x0, z0, x1, z1): its `*_ground_*` objects' alone (a bridge's parapets count
    among the driving surfaces too, 80 cm over its deck)."""
    out = []
    for p in tile_files(track, box):
        for name, (_m, P, _UV, T) in obj_to_kn5.read_obj(p).items():
            if "_ground_" in name and len(T):
                v = P[np.unique(T)]
                out.append(v[(v[:, 0] >= box[0]) & (v[:, 0] <= box[2]) & (v[:, 2] >= box[1]) & (v[:, 2] <= box[3])])
    return np.unique(np.concatenate(out), axis=0) if out else np.zeros((0, 3))


def _ground_over_deck(track, box, T3, D, route, S, s0, s1):
    """over_deck_spots of track's terrain over the decks among the surfaces T3 (deck flags D) along route (metres S)."""
    if not D.any():
        return []
    points = _terrain_points(track, box)
    ss = np.arange(0.0, S[-1], 0.5)
    return over_deck_spots(over_deck(points, T3[D]), np.interp(ss, S, route[:, 0]), np.interp(ss, S, route[:, 1]), ss,
                           s0, s1)


def names_at(T3, N, qx, qz, near):
    """Per point (qx, qz) the name of the surface among T3 (names N) nearest in height to near (NaN: the top one), ""
    where there is none."""
    out = np.full(len(qx), "", object)
    if not len(T3):
        return out
    for i, (z, k) in enumerate(_heights(T3, N, qx, qz)):
        if len(z):
            out[i] = k[int(np.argmax(z))] if np.isnan(near[i]) else k[int(np.argmin(np.abs(z - near[i])))]
    return out


def runs(ss, values):
    """Runs of equal values along metres ss: [(from, to, value)]. Pure."""
    out = []
    for s, v in zip(ss, values):
        if out and out[-1][2] == v:
            out[-1][1] = s
        else:
            out.append([s, s, v])
    return [tuple(r) for r in out]


def pick_surface(hit, deck, near):
    """Of a point's surfaces (_heights: heights, is deck) the deck's or the ground's nearest in height to near, or NaN. Pure."""
    z, d = hit
    z = z[d == deck]
    return float(z[np.argmin(np.abs(z - near))]) if len(z) else float("nan")


def report_profile(track, start, end, step=1.0):
    """A stretch's surfaces apart: per lane deck and ground in cm against the straight grade between its ends (">": the
    ground over the deck), then the line as ridden: its height, slope per metre, surface."""
    route = _route(track)
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(route, axis=0).T))]
    start, end = start or 0.0, min(end or S[-1], S[-1])
    ss = np.arange(start, end + 1e-6, step)
    px, pz = np.interp(ss, S, route[:, 0]), np.interp(ss, S, route[:, 1])
    tx = np.interp(ss + 1, S, route[:, 0]) - np.interp(ss - 1, S, route[:, 0])
    tz = np.interp(ss + 1, S, route[:, 1]) - np.interp(ss - 1, S, route[:, 1])
    tn = np.maximum(np.hypot(tx, tz), 1e-9)
    nx, nz = -tz / tn, tx / tn
    # (the line ridden from a run-up: started on a deck, _lane would take what lies under it)
    up = np.arange(max(start - PROFILE_RUN_UP_M, 0.0), start, step)
    ux, uz = np.interp(up, S, route[:, 0]), np.interp(up, S, route[:, 1])
    T3, D, _N = _surfaces(track, (min(px.min(), ux.min(initial=px.min())) - 30, min(pz.min(), uz.min(initial=pz.min())) - 30,
                              max(px.max(), ux.max(initial=px.max())) + 30, max(pz.max(), uz.max(initial=pz.max())) + 30))
    hits = {w: _heights(T3, D, px + nx * w, pz + nz * w) for w in PROFILE_LANES}
    line, is_deck = _lane(_heights(T3, D, ux, uz) + hits[0.0])
    line, is_deck = line[len(up):], is_deck[len(up):]
    ok = np.flatnonzero(np.isfinite(line))
    if len(ok) < 2:
        print(f"{track}: no surface along {start:.0f}-{end:.0f} m")
        return
    a, b = ok[0], ok[-1]
    grade = line[a] + (line[b] - line[a]) * (ss - ss[a]) / (ss[b] - ss[a])
    print(f"{track}, {start:.0f}-{end:.0f} m: grade {100 * (line[b] - line[a]) / (ss[b] - ss[a]):+.2f} %. Heights in cm "
          f"against it, deck / ground per lane (m across the line; >: the ground over the deck by {OVER_DECK_M * 100:.0f} cm "
          f"or more):")
    print("       m " + "".join(f"{w:+16.0f}" for w in PROFILE_LANES))
    for i, s in enumerate(ss):
        cols = []
        for w in PROFILE_LANES:
            dk, gd = (pick_surface(hits[w][i], flag, grade[i]) for flag in (True, False))
            over = np.isfinite(dk) and gd - dk > OVER_DECK_M and gd - dk <= OVER_DECK_NEAR_M
            cols.append((f"{(dk - grade[i]) * 100:7.1f}" if np.isfinite(dk) else f"{'.':>7}")
                        + (" >" if over else " /") + (f"{(gd - grade[i]) * 100:7.1f}" if np.isfinite(gd) else f"{'.':>7}"))
        print(f"{s:8.1f} " + "".join(cols))
    print("\nthe line as ridden: m, height against the grade (cm), slope (%), its change (%), surface")
    last = None
    for i in range(1, len(ss)):
        if np.isnan(line[i]) or np.isnan(line[i - 1]):
            continue
        slope = 100 * (line[i] - line[i - 1]) / step
        print(f"{ss[i]:8.1f} {(line[i] - grade[i]) * 100:7.1f} {slope:7.1f} "
              + (f"{slope - last:+7.1f}" if last is not None else f"{'':7}")
              + f"  {'deck' if is_deck[i] else 'ground'}")
        last = slope


def report_surface(track, start, end, step=1.0):
    """A stretch's physics: per run of metres the object under the line (on the surface the line rides) and the
    prefixes across it at PROFILE_LANES."""
    route = _route(track)
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(route, axis=0).T))]
    start, end = start or 0.0, min(end or S[-1], S[-1])
    ss = np.arange(start, end + 1e-6, step)
    px, pz = np.interp(ss, S, route[:, 0]), np.interp(ss, S, route[:, 1])
    tx = np.interp(ss + 1, S, route[:, 0]) - np.interp(ss - 1, S, route[:, 0])
    tz = np.interp(ss + 1, S, route[:, 1]) - np.interp(ss - 1, S, route[:, 1])
    tn = np.maximum(np.hypot(tx, tz), 1e-9)
    nx, nz = -tz / tn, tx / tn
    T3, D, N = _surfaces(track, (px.min() - 30, pz.min() - 30, px.max() + 30, pz.max() + 30))
    line, _d = _lane(_heights(T3, D, px, pz))
    rows = [names_at(T3, N, px + nx * w, pz + nz * w, line) for w in PROFILE_LANES]
    print(f"{track}, {start:.0f}-{end:.0f} m: the object under the line, the physics across it at "
          + " ".join(f"{w:+.0f}" for w in PROFILE_LANES) + " m")
    across = [(unsplit(rows[PROFILE_LANES.index(0.0)][i]),) + tuple(physics(r[i]) or "-" for r in rows) for i in range(len(ss))]
    for a, b, v in runs(ss, across):
        flag = "" if physics(v[0]) == ROAD else "   <-- not road"
        print(f"  {a:8.0f}-{b:<8.0f} {v[0] or 'nothing':28} " + " ".join(f"{k:7}" for k in v[1:]) + flag)


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
    T3, D, N = _surfaces(track, box)
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
    warp, width = _across(T3, D, _paint(track, box), px, pz, nx, nz, h)
    worst = sorted(np.flatnonzero(ga > G_LIMIT), key=lambda k: -ga[k])
    spots = _ground_over_deck(track, box, T3, D, route, S, start, end)
    kind = [physics(k) for k in names_at(T3, N, px, pz, h)]
    return {"off_road_m": sum(1 for k in kind if k and k != ROAD),
            "_off_road": [(a, b, v) for a, b, v in runs(ss, kind) if v and v != ROAD],"over_deck_spots": len(spots), "max_over_deck": round(max((u["over"] for u in spots), default=0.0), 3),
            "_over_deck": spots,
            "length_m": round(float(S[-1])), "over_05g_m": int((ga > G_LIMIT).sum()),
            "lanes_over_05g_m": int((gs > G_LIMIT).sum()),
            "max_g": round(float(ga.max()), 2), "max_g_at_m": float(ss[int(ga.argmax())]),
            "edges_m": int(edge.sum()), "transitions": len(trans),
            "max_g_transition": max((u["g"] for u in trans), default=0.0),
            "warp_m": int((warp > EDGE_M).sum()), "max_warp": round(float(warp.max()), 2),
            "max_warp_at_m": float(ss[int(warp.argmax())]),
            "_worst": [(float(ss[k]), round(float(g[k]), 2), bool(isd[k])) for k in worst],
            "_edges": ss[edge], "_trans": trans, "_warp": ss[warp > EDGE_M],
            "_width": round(float(np.median(width[width > 0])), 1) if (width > 0).any() else 0.0}


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
    print(f"  carriageway (~{r['_width']} m wide) off straight across above {EDGE_M * 100:.0f} cm: {r['warp_m']} m"
          + cmp("warp_m") + f", most {r['max_warp']} m at {r['max_warp_at_m']:.0f} m" + cmp("max_warp"))
    rw = _ranges(r["_warp"])
    if rw:
        n = None if everything else 8
        print("     at: " + ", ".join(f"{a:.0f}" if a == b else f"{a:.0f}-{b:.0f}" for a, b in rw[:n]) + " m"
              + (f" (+{len(rw) - n} more)" if n and len(rw) > n else ""))
    print(f"  bridge transitions: {r['transitions']}, strongest {r['max_g_transition']} G" + cmp("max_g_transition"))
    print(f"  ground over a deck by more than {OVER_DECK_M * 100:.0f} cm: {r['over_deck_spots']} spots"
          + cmp("over_deck_spots") + (f", most {r['max_over_deck'] * 100:.1f} cm" if r["over_deck_spots"] else ""))
    print(f"  not road ({ROAD}) under the line: {r['off_road_m']} m" + cmp("off_road_m"))
    for a, b, v in r["_off_road"][:None if everything else 8]:
        print(f"     {a:7.0f}-{b:.0f} m  {v}")
    for u in r["_over_deck"]:           # (always a fault: the deck's height is meant to be the surface there)
        print(f"     {u['from']:7.0f}-{u['to']:.0f} m  GROUND OVER DECK: {u['n']} points, most {u['over'] * 100:.1f} cm at "
              f"{u['at']:.0f} m, {u['off']:.1f} m off the line")
    n = None if everything else 8
    for s, gg, d in r["_worst"][:n]:
        print(f"     {s:7.0f} m  {gg:+6.2f} G  ({gg * 6.25:+6.1f} G at 250)  {'deck' if d else 'terrain'}")
    rg = _ranges(r["_edges"])
    if rg:
        print("  edges at: " + ", ".join(f"{a:.0f}" if a == b else f"{a:.0f}-{b:.0f}" for a, b in rg[:n]) + " m"
              + (f" (+{len(rg) - n} more)" if n and len(rg) > n else ""))
    for u in r["_trans"]:              # (the bridges' ends: a test track has a few)
        print(f"     {u['m']:7.0f} m  {'onto' if u['onto'] else 'off '}  {u['g']:5.2f} G, step {u['step']:+.3f} m")


def _hole_cells(track):
    """The terrain's cells of a built track, by what is on them: (cells: {(i, j): height of what stands there, None for
    nothing}, road: the cells with drivable surface on them, wall: the cells with an upright collision face). Cell (i, j)
    is x in 2i .. 2i + 2, z likewise."""
    ground, stand, road, wall = [], [], [], []
    for p in glob.glob(os.path.join(HERE, "out", "tracks", track, "obj", "parts", "t_*.obj")):
        for name, (_m, P, _UV, T) in obj_to_kn5.read_obj(p).items():
            if not name.startswith("1") and name != "nocol_road_asphalt" and not name.startswith("nocol_road_asphalt"):
                continue
            t = P[T]
            n = np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0])
            up = n[:, 1] / np.maximum(np.linalg.norm(n, axis=1), 1e-12)
            if "_ground_" in name:
                ground.append(t)
                if name.startswith("1ROAD"):
                    road.append(t)
                continue
            if name.startswith("1"):
                wall.append(t[np.abs(up) < 0.3])
            if name.startswith(STAND_ON):
                stand.append(t[up > 0.5])
                if name.startswith(("1ROAD_deck", "nocol_road_asphalt")):
                    road.append(t[up > 0.5])
    ground = np.concatenate(ground)
    lo, hi = ground.reshape(-1, 3).min(0), ground.reshape(-1, 3).max(0)
    # (the cells the terrain's tiles cover: a cell with a triangle, and every cell inside a tile's rows of them)
    i0, j0 = np.floor(ground[:, :, [0, 2]].mean(1) / HOLE_CELL_M).astype(np.int64).T
    have = set(zip(i0.tolist(), j0.tolist()))
    near = {(i + a, j + b) for i, j in have for a in (-1, 0, 1) for b in (-1, 0, 1)}
    near = [c for c in near if lo[0] <= c[0] * HOLE_CELL_M and (c[0] + 1) * HOLE_CELL_M <= hi[0]
            and lo[2] <= c[1] * HOLE_CELL_M and (c[1] + 1) * HOLE_CELL_M <= hi[2]]
    q = np.array(near, np.int64)
    qx, qz = (q[:, 0] + 0.5) * HOLE_CELL_M, (q[:, 1] + 0.5) * HOLE_CELL_M

    def hits(tris):
        tris = np.concatenate(tris) if tris else np.zeros((0, 3, 3))
        if not len(tris):
            return [np.zeros(0)] * len(q)
        return [z for z, _d in _heights(tris, np.zeros(len(tris), bool), qx, qz)]
    hg, hs, hr = hits([ground]), hits(stand), hits(road)
    cells = {}
    for c, g, s in zip(near, hg, hs):
        cells[c] = float(g.max()) if len(g) else float(s.max()) if len(s) else None
    on_road = {c for c, r in zip(near, hr) if len(r)}
    w = np.concatenate(wall) if wall else np.zeros((0, 3, 3))
    walls = set()
    if len(w):        # (a face's own extent: an upright face has no area seen from above)
        a, b = np.floor(w[:, :, [0, 2]].min(1) / HOLE_CELL_M).astype(np.int64), np.floor(w[:, :, [0, 2]].max(1) / HOLE_CELL_M).astype(np.int64)
        for (i0_, j0_), (i1_, j1_) in zip(a.tolist(), b.tolist()):
            if (i1_ - i0_ + 1) * (j1_ - j0_ + 1) <= 64:
                walls.update((i, j) for i in range(i0_, i1_ + 1) for j in range(j0_, j1_ + 1))
    return cells, on_road, walls


def classify_holes(cells, road, walls):
    """The gaps among cells ({(i, j): height or None for nothing}), road and walls as _hole_cells': [(kind, [cells])],
    kinds as in the module doc. Pure."""
    around = [(a, b) for a in (-1, 0, 1) for b in (-1, 0, 1) if a or b]
    reached = set(road)
    todo = list(road)
    while todo:             # (from the roads over ground a car can climb, not through walls)
        i, j = todo.pop()
        h = cells.get((i, j))
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c = (i + a, j + b)
            if c in reached or c in walls or cells.get(c) is None or h is None:
                continue
            if abs(cells[c] - h) <= CLIMB_M:
                reached.add(c)
                todo.append(c)
    gaps = {c for c, h in cells.items() if h is None}
    out = []
    while gaps:
        comp, todo = [], [gaps.pop()]
        while todo:
            c = todo.pop()
            comp.append(c)
            for a, b in around:
                n = (c[0] + a, c[1] + b)
                if n in gaps:
                    gaps.remove(n)
                    todo.append(n)
        members = set(comp)
        # (open to the outside: the built area's own edge, no gap in it)
        if any((c[0] + a, c[1] + b) not in cells for c in comp for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            continue

        def lands(c, a, b):
            while c in members:
                c = (c[0] + a, c[1] + b)
            return c in road
        open_ = [c for c in comp if c not in walls]
        at_road = [c for c in comp if any((c[0] + a, c[1] + b) in road for a, b in around)]
        if any(lands(c, a, b) and lands(c, -a, -b) for c in open_ for a, b in ((1, 0), (0, 1), (1, 1), (1, -1))):
            kind = "lane"
        elif at_road:
            kind = "edge" if any(c not in walls for c in at_road) else "walled"
        elif any((c[0] + a, c[1] + b) in reached for c in open_ for a, b in around):
            kind = "reachable"
        else:
            kind = "unreachable"
        out.append((kind, sorted(comp)))
    order = ("lane", "edge", "reachable", "walled", "unreachable")
    return sorted(out, key=lambda g: (order.index(g[0]), -len(g[1])))


def report_holes(track):
    """The gaps in a built track's ground, with where they are on the route."""
    route = _route(track)
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(route, axis=0).T))]
    t = np.arange(0.0, S[-1], 0.5)
    rx, rz = np.interp(t, S, route[:, 0]), np.interp(t, S, route[:, 1])
    gaps = classify_holes(*_hole_cells(track))
    kinds = {}
    for kind, comp in gaps:
        kinds[kind] = kinds.get(kind, 0) + 1
    print(f"{track}: gaps in the ground: {kinds or 'none'}")
    for kind, comp in gaps:
        c = (np.array(comp, np.float64) + 0.5) * HOLE_CELL_M
        d = np.hypot(rx[:, None] - c[:, 0], rz[:, None] - c[:, 1])
        k = int(d.min(1).argmin())
        print(f"  {kind:11} {len(comp) * HOLE_CELL_M ** 2:6.0f} m2 at x {c[:, 0].mean():8.1f} z {c[:, 1].mean():8.1f}, "
              f"route {t[k]:7.0f} m, {float(d[k].min()):5.1f} m off the line")


def code(entry):
    """The track code of a test track (a test_tracks.json entry) at this track version."""
    return trackcode.encode({"points": entry["points"], "width": entry["width"], "title": entry["title"],
                             "track_version": version.TRACK_VERSION})


def build_one(test, t, install, share):
    """Build test track t (into AC with install, else up to the OBJ parts) with share of the cores."""
    import generator
    from track import parallel
    parallel.SHARE = share
    if install:
        generator.build(test[t]["points"], test[t]["width"], t, test[t]["title"])
    else:
        generator.build(test[t]["points"], test[t]["width"], t, upto="obj")


def build_all(tracks, install, jobs):
    """Build the test tracks, jobs at a time, each in its own process (BeamNG.Earth's state is global) with its share
    of the cores, its log in out/build_<name>.log; exits when one fails."""
    import subprocess
    import time
    run, todo, failed = {}, list(tracks), []
    while todo or run:
        while todo and len(run) < jobs:
            t = todo.pop(0)
            print(f"building {t} ...", flush=True)
            log = open(os.path.join(HERE, "out", f"build_{t}.log"), "w", encoding="utf-8")
            cmd = [named.exe("build"), os.path.abspath(__file__), "--build-one", t, "--share", str(1.0 / jobs)]
            run[t] = (subprocess.Popen(cmd + (["--install"] if install else []), stdout=log, stderr=subprocess.STDOUT,
                                       cwd=HERE, env={**named.child_env(), "PYTHONIOENCODING": "utf-8",
                                                      "PYTHONUNBUFFERED": "1"}), log)     # (the log live: watch_build.py)
        time.sleep(1.0)
        for t, (proc, log) in list(run.items()):
            if proc.poll() is not None:
                log.close()
                del run[t]
                if proc.returncode:
                    failed.append(t)
    if failed:
        sys.exit(f"build failed: {', '.join(failed)} (out/build_<name>.log)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tracks", nargs="*")
    ap.add_argument("--all", action="store_true", help="all short test tracks from test_tracks.json")
    ap.add_argument("--long", action="store_true", help="all long test tracks (\"long\": true) from test_tracks.json")
    ap.add_argument("--build", action="store_true", help="build them again first, up to the OBJ parts (test tracks only)")
    ap.add_argument("--install", action="store_true", help="build them into AC instead, to drive them (test tracks only)")
    ap.add_argument("--from", dest="start", type=float)
    ap.add_argument("--to", dest="end", type=float)
    ap.add_argument("--reference", action="store_true", help="save the values as the new reference")
    ap.add_argument("--holes", action="store_true", help="only the gaps in the ground over the whole built area")
    ap.add_argument("--profile", action="store_true", help="only the surfaces of --from..--to apart: deck and ground per lane")
    ap.add_argument("--surface", action="store_true", help="only the physics of --from..--to: 1ROAD, 1GRASS, ... per run")
    ap.add_argument("--build-one", help=argparse.SUPPRESS)      # (a child process: build this track, nothing else)
    ap.add_argument("--share", type=float, default=1.0, help=argparse.SUPPRESS)
    a = ap.parse_args()
    with open(TEST_TRACKS, encoding="utf-8") as f:
        test = json.load(f)
    if a.build_one:
        build_one(test, a.build_one, a.install, a.share)
        return
    tracks = list(a.tracks) + [t for t, v in test.items()
                               if (a.all and not v.get("long")) or (a.long and v.get("long"))]
    if not tracks:
        ap.error("a track, --all or --long")
    if a.build or a.install:
        for t in tracks:
            if t not in test:
                ap.error(f"{t} is not a test track (test_tracks.json)")
        short = [t for t in tracks if not test[t].get("long")]
        build_all(short, a.install, min(BUILD_JOBS, len(short)))
        build_all([t for t in tracks if test[t].get("long")], a.install, 1)
    if a.holes:
        for t in tracks:
            report_holes(t)
        return
    if a.profile:
        if a.start is None or a.end is None:
            ap.error("--profile needs --from and --to")
        for t in tracks:
            report_profile(t, a.start, a.end)
        return
    if a.surface:
        for t in tracks:
            report_surface(t, a.start, a.end)
        return
    part = a.start is not None or a.end is not None
    refs = {}
    for t in tracks:
        r = measure(t, a.start, a.end)
        if t in test:
            print(f"\n{test[t]['about']}\n  code {code(test[t])}", end="")
            for m, what in test[t].get("spots", ()):
                print(f"\n  spot {m} m: {what}", end="")
        report(t, r, None if part else test.get(t, {}).get("reference"), everything=part)
        if a.reference and t in test and not part:
            refs[t] = {k: v for k, v in r.items() if not k.startswith("_")}
    if refs:
        # (read again: a long track's build takes a while, and the list may have changed meanwhile; only the measured
        # tracks' references are written)
        with open(TEST_TRACKS, encoding="utf-8") as f:
            test = json.load(f)
        for t, ref in refs.items():
            if t in test:
                test[t]["reference"] = ref
        with open(TEST_TRACKS, "w", encoding="utf-8") as f:
            json.dump(test, f, indent=1, ensure_ascii=False)
            f.write("\n")
        print("\nReference saved.")


if __name__ == "__main__":
    main()
