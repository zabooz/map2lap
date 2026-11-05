"""Why the ground along a route stretch lies at its height: the code that decides it, called again on the track's
kept tiles (out/tracks/<track>) and today's map data cache. Nothing is built.

    .venv\\Scripts\\python.exe tools\\heights.py <track> --from <m> --to <m>             # heights along the line
    .venv\\Scripts\\python.exe tools\\heights.py <track> --from <m> --to <m> --plans     # ... each plan's share in them
    .venv\\Scripts\\python.exe tools\\heights.py <track> --from <m> --to <m> --decks     # ... the decks and their ground

Along the line, per metre (heights in m, the track's frame, as the OBJ parts' y):
- elevation: the terrain model (blockworker.ground), before anything;
- graded: after the grading (the roads' plans, + grading.ROAD_LIFT: the ground the car drives on, ground.build);
- water: the terrain's lowering at the nearest ground vertex (water.water_tile, less water.off_roads as ground.build);
- built: the terrain as built (the OBJ parts' `*_ground_*` there, nearest to graded - water), and built minus graded;
  under a deck that is the deck's ground, laid apart (roads.under_deck_ground: lowered for a stream, at most the
  deck's top at its ends): --decks shows it.
Then the map's water and roads near the stretch (Overture / OpenStreetMap).

--plans: per plan near the line (a road the grading lays, grading.Plan) how many cm the graded height changes without
it (grade_points and regrade_past_ends without that plan): who pulls the ground where. Slow where many plans meet.
--decks: the deck parts the bridges make there (bridges.parts): their tilt or why they lie level; what meets at each end,
at what angle, and whether a junction pad is paved there (roads.deck_pads); and each terrain vertex within 3 m of the
line: graded, built, the deck's top over it, its arc from each deck's two ends (under_deck_ground treats the end zones
apart).
--walls: per segment of a road near the stretch why a wall between two roads stands or not, each of its tests (the road
tiles' parts built again in a temporary folder, the shared caches may fill), and whether the ground is cut there.
--road <part of a name, or the start of an id>: a road other than the route: its plan's height, the ground built across
it, its grade and lean, and the plans it lies on.
--steps, with --road: that road's heights after each step of the planner against the elevation, and its pins (planned afresh,
nothing read from or kept in the revisit cache): how a plan comes to lie off the ground.
--at <AC x>,<AC z>, without --from and --to: one point of the ground: its elevation, what the grading makes of it, the same with a
road's end's or a narrower road's giving way off (yl, bw), and per plan in reach its height there, the way to its carriageway, what
it gives way by, its cut on that side, and the point's height without it.
"""
import argparse
import json
import os
import sys
import tempfile

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder: make_obj moves the cwd)
sys.path.insert(0, os.path.join(HERE, "src"))
sys.path.insert(0, os.path.join(HERE, "engine"))
sys.path.insert(0, os.path.join(HERE, "tools"))
import measure  # noqa: E402

CELL_M = 2.0            # m between the ground's vertices (ground.CELL)
TILE_M = measure.TILE_M
ROAD_NEAR_M = 12.0      # m off the line a road counts as one of the stretch's
WATER_NEAR_M = 40.0     # m around the stretch water counts (a river's area may lie beside it)
PLAN_NEAR_M = 6.0       # m past a plan's half width it counts as near the line
DECK_NEAR_M = 15.0      # m off the line a deck part counts
VERTEX_NEAR_M = 3.0     # m off the line a terrain vertex is listed (--decks)
ROAD_OVER_M = 0.3       # m the ground across a road may stand over its middle unlisted (--road): over a crown or a lean, under a kerb's step
WALL_NEAR_M = 30.0      # m off the stretch a road's segment is listed (--walls)
ROAD_STEP_M = 2.0       # m along a road between its rows (--road): the terrain's cell
STEPS_STEP_M = 4.0      # m along a road between its rows (--steps): a plan's vertices
STEPS_SAME_M = 0.005    # m a step must change a plan's height to get a column (--steps): the table's last digit


def stretch(route, start, end, step):
    """Metres ss from start to end and their points (px east, py north) on route (AC x, z rows). Pure."""
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(route, axis=0).T))]
    end = min(end, S[-1])
    ss = np.arange(start, end + 1e-6, step)
    return ss, np.interp(ss, S, route[:, 0]), -np.interp(ss, S, route[:, 1])


def tile_of(px, py):
    """The tile (tx, ty) of a point east px, north py. Pure."""
    return int(np.floor(px / TILE_M)), int(np.floor(py / TILE_M))


def vertex_of(px, py, tx, ty):
    """[row north, col east] of the ground vertex nearest (px, py) in tile (tx, ty) (ground.build's grid). Pure."""
    return int(round((py - ty * TILE_M) / CELL_M)), int(round((px - tx * TILE_M) / CELL_M))


def arcs_from_ends(xy, q):
    """(m along polyline xy from its start, m to its end) of the point on it nearest q. Pure."""
    a, ab = xy[:-1], np.diff(xy, axis=0)
    seg = np.hypot(*ab.T)
    cum = np.r_[0.0, np.cumsum(seg)]
    t = np.clip(((q - a) * ab).sum(1) / np.maximum((ab ** 2).sum(1), 1e-12), 0, 1)
    j = int(np.argmin(np.hypot(*(q - (a + t[:, None] * ab)).T)))
    s = cum[j] + t[j] * seg[j]
    return float(s), float(cum[-1] - s)


class Spot:
    """The engine set up for a track's kept tiles, as a scenery worker (make_obj._init_scenery; that also sets make_obj's
    texture folder to tex, for this process: a later make_obj call in it reads and writes there)."""

    def __init__(self, track, tex):
        from track import make_obj
        import blockworker
        self.track = track
        tiles = os.path.join(HERE, "out", "tracks", track, "tiles")
        with open(os.path.join(tiles, "anchor.json"), encoding="utf-8") as f:
            self.anc = json.load(f)
        make_obj._init_scenery(tiles, tex)
        self.frame, self.g, self.s = make_obj._ctx["frame"], make_obj._ctx["g"], blockworker._s
        self._depth = {}

    def lalo(self, px, py):
        la, lo, _ = self.frame.enu_to_geodetic(np.asarray(px, np.float64), np.asarray(py, np.float64), 0.0)
        return np.asarray(la, np.float64), np.asarray(lo, np.float64)

    def elevation(self, la, lo):
        """The terrain model's height (geodetic) at the points."""
        import blockworker
        return np.asarray(blockworker.ground(self.frame, la, lo, self.s.dem.sample(la, lo, self.anc["dem_zoom"])),
                          np.float64)

    def graded(self, la, lo, lift):
        """The height after the grading (geodetic), lift on the plans (grading.ROAD_LIFT: the physics' ground)."""
        z = self.elevation(la, lo)
        return np.asarray(self.g.apply(la, lo, z, lift), np.float64) if self.g is not None else z

    def planner_at(self, la, lo):
        """(the planner of the points (la, lo), its plans there, their PlanPack, the points in its frame e, n): as _Planner.apply
        has them. Its own plans: the copies of Grader.plans have no Plan.free."""
        pl = self.g.store.planners_of(la, lo)[0][0]
        plans, pack = pl._plan_set(pl._keys(la, lo), False)
        e, n, _ = pl.frame.geodetic_to_enu(la, lo, 0.0)
        return pl, plans, pack, np.asarray(e, np.float64), np.asarray(n, np.float64)

    def with_free(self, plans, la, lo):
        """The copies plans (Grader.plans') with their Plan.free, from the planners' own (a free end gives way: grade_points). In place."""
        free = {}
        for pl, idx in self.g.store.planners_of(la, lo):
            for p in pl._plan_set(pl._keys(la[idx], lo[idx]), False)[0]:
                free[(p.rid, len(p.z), float(p.z[0]), float(p.z[-1]))] = getattr(p, "free", (False, False))
        for p in plans:
            p.free = free.get((p.rid, len(p.z), float(p.z[0]), float(p.z[-1])), (False, False))
        return plans

    def up(self, la, lo, h):
        """Geodetic heights h as the frame's up (the OBJ parts' y)."""
        return np.asarray(self.frame.geodetic_to_enu(la, lo, np.asarray(h, np.float64))[2], np.float64)

    def depth(self, tx, ty):
        """Water's lowering per ground vertex of tile (tx, ty), as ground.build applies it, or None."""
        from scenery import water
        if (tx, ty) not in self._depth:
            d = water.water_tile(self.frame, self.s.md, self.elevation, tx, ty, CELL_M)[0]
            if d is not None and self.g is not None and (d > 0.0).any():
                n = d.shape[0]
                gx, gy = np.meshgrid(tx * TILE_M + np.arange(n) * CELL_M, ty * TILE_M + np.arange(n) * CELL_M)
                la, lo = self.lalo(gx.ravel(), gy.ravel())
                wet = d.ravel() > 0.0
                d = water.off_roads(d, gx, gy, self.g.plans(la[wet], lo[wet]), CELL_M)
            self._depth[(tx, ty)] = d
        return self._depth[(tx, ty)]

    def cells(self, px, py):
        """The map cells' keys of the tiles under the points."""
        import roads
        tiles = {tile_of(x, y) for x, y in zip(px, py)}
        return sorted({k for t in tiles for k in roads.cells_of_tile(self.frame, *t)})

    def bridges(self):
        """The bridge chains as a road tile sees them (blockworker.build_tile), deck tilts too."""
        import blockworker
        import grading
        if not hasattr(self, "_bridges"):
            def elev(la, lo):           # (as ground.build: the graded ground with ROAD_LIFT)
                return self.graded(np.asarray(la, np.float64), np.asarray(lo, np.float64), grading.ROAD_LIFT)
            self._bridges = blockworker._bridges(self.anc["aid"], self.frame, elev)
            self._bridges.plans_at = lambda xy: self.g.plans(*self.lalo(xy[:, 0], xy[:, 1]))
            self._bridges.cs.set_road_end(grading.road_end_reader(self.g))
        return self._bridges

    def road_cells(self, tx, ty):
        """The map's road layer of each cell of tile (tx, ty)."""
        import roads
        return [self.s.md.cell(k, layers=("roads",), kind="demand").layers.get("roads")
                for k in roads.cells_of_tile(self.frame, tx, ty)]

    def ground_roads(self, tx, ty):
        """The ground carriageways of tile (tx, ty)'s cells: [(fid, spec, line (k, 2), None)], as roads.deck_pads wants."""
        import mapgeom
        import roads
        out, seen = [], set()
        urban = self.s.surface.urban if self.s.surface else None
        for f in self.road_cells(tx, ty):
            if f is None:
                continue
            for i, spec in enumerate(roads.road_specs(f, urban, self.s.widths)):
                fid = str(f.ids[i])
                if spec is not None and fid not in seen:
                    seen.add(fid)
                    out += [(fid, spec, np.c_[mapgeom.enu_xy(f, self.frame, r)], None) for r in roads.ground_parts(f, i)]
        return out

    def decks_and_pads(self, tx, ty):
        """Round tile (tx, ty), as build_tile: the deck parts [(fid, spec, xy (k, 2), z)] and their pads (roads.deck_pads)."""
        import roads
        box = roads.tile_bbox(tx, ty)
        br = self.bridges()
        got = br.parts(self.road_cells(tx, ty), (box[0] - 40, box[1] - 40, box[2] + 40, box[3] + 40))
        parts = [(f, s, np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64)) for f, s, xy, z, _l in got]
        return parts, roads.deck_pads(parts, self.ground_roads(tx, ty), box, br._ground, own=False, bridges=br)


def report_line(sp, ss, px, py):
    """The heights along the line, per metre."""
    import grading
    la, lo = sp.lalo(px, py)
    el = sp.up(la, lo, sp.elevation(la, lo))
    gr = sp.up(la, lo, sp.graded(la, lo, grading.ROAD_LIFT))
    wd = np.full(len(ss), np.nan)
    for i in range(len(ss)):
        tx, ty = tile_of(px[i], py[i])
        d = sp.depth(tx, ty)
        if d is not None:
            r, c = vertex_of(px[i], py[i], tx, ty)
            wd[i] = d[min(r, d.shape[0] - 1), min(c, d.shape[1] - 1)]
    box = (px.min() - 5, -py.max() - 5, px.max() + 5, -py.min() + 5)
    T3, _D, N = measure._surfaces(sp.track, box)
    ground = np.array(["_ground_" in n for n in N], bool)
    built = np.full(len(ss), np.nan)
    if ground.any():
        want = gr - np.nan_to_num(wd)
        for i, (z, _d) in enumerate(measure._heights(T3[ground], N[ground], px, -py)):
            if len(z):
                built[i] = float(z[np.argmin(np.abs(z - want[i]))])
    tiles = sorted({tile_of(x, y) for x, y in zip(px, py)})
    print(f"{sp.track}, {ss[0]:.0f}-{ss[-1]:.0f} m (tiles {tiles}): heights in m; differences in cm")
    print("       m  elevation     graded  graded-elev   water     built  built-graded")
    for i in range(len(ss)):
        w = f"{wd[i]:7.2f}" if np.isfinite(wd[i]) else f"{'-':>7}"
        b = f"{built[i]:9.3f} {(built[i] - gr[i]) * 100:+13.1f}" if np.isfinite(built[i]) else f"{'none':>9}"
        print(f"{ss[i]:8.1f} {el[i]:10.3f} {gr[i]:10.3f} {(gr[i] - el[i]) * 100:+12.1f} {w}  {b}")


def report_map(sp, px, py):
    """The map's water near the stretch and its roads near the line."""
    import mapgeom
    import roads
    mx, my = px.mean(), py.mean()
    reach = WATER_NEAR_M + float(np.hypot(px[-1] - px[0], py[-1] - py[0])) / 2
    seen, water, ways = set(), [], []
    for key in sp.cells(px, py):
        layers = sp.s.md.cell(key, layers=("water", "roads"), kind="demand").layers
        f = layers.get("water")
        for i in range(len(f.kind) if f is not None else 0):
            for part in f.parts(i):
                if not part or not len(part[0]) or str(f.ids[i]) in seen:
                    continue
                e, n = mapgeom.enu_xy(f, sp.frame, part[0])
                d = float(np.hypot(e - mx, n - my).min())
                if d <= reach:
                    seen.add(str(f.ids[i]))
                    attrs = {k: str(v[i]) for k, v in f.attrs.items() if str(v[i]) not in ("", "None", "nan", "False")}
                    water.append(f"  water {'area' if f.kind[i] == mapgeom.POLYGON else 'line'} {d:.0f} m from the "
                                 f"stretch's middle: {attrs}")
        f = layers.get("roads")
        if f is None or not len(f.kind):
            continue
        specs = roads.road_specs(f, sp.s.surface.urban if sp.s.surface else None, sp.s.widths)
        for i in range(len(f.kind)):
            if specs[i] is None or str(f.ids[i]) in seen:
                continue
            d = min((float(np.hypot(e[:, None] - px[None], n[:, None] - py[None]).min())
                     for part in f.parts(i) if part and len(part[0]) for e, n in [mapgeom.enu_xy(f, sp.frame, part[0])]),
                    default=np.inf)
            if d <= ROAD_NEAR_M:
                seen.add(str(f.ids[i]))
                levels = [(round(float(t.start[j]), 3), round(float(t.end[j]), 3), str(t.value[j]))
                          for k, t in f.rules.items() if k in ("flags", "level") for j in t.rows(i)]
                ways.append(f"  road {str(f.ids[i])[:13]} {d:4.1f} m off: {specs[i].cls}, {specs[i].kind}, "
                            f"{specs[i].width:.1f} m wide; levels {levels or 'none'}")
                ways.append("    " + str({k: str(v[i]) for k, v in f.attrs.items() if str(v[i]) not in ("", "None", "nan", "False")}))
    print("\nthe map there (Overture / OpenStreetMap):")
    print("\n".join(water + ways) if water or ways else "  no water, no road")


def report_plans(sp, ss, px, py):
    """Each near plan's share in the graded height along the line: without it minus with it, cm."""
    import grading
    import roads
    la, lo = sp.lalo(px, py)
    base = sp.elevation(la, lo)
    plans = sp.with_free(sp.g.plans(la, lo), la, lo) if sp.g is not None else []

    def grade(ps):
        z = np.asarray(grading.grade_points(px, py, base, ps, 0.0), np.float64)
        return np.asarray(grading.regrade_past_ends(px, py, base, ps, z, 0.0), np.float64)
    full = grade(plans)
    near = []
    print(f"\n{len(plans)} plans near the stretch; those within their half width + {PLAN_NEAR_M:.0f} m of the line:")
    for k, p in enumerate(plans):
        gap = float(np.min(roads._line_gap(np.c_[px, py], p.xy)[0]))
        if gap > p.half + PLAN_NEAR_M:
            continue
        near.append(k)
        length = float(np.hypot(*np.diff(p.xy, axis=0).T).sum())
        print(f"  #{k} rid {p.rid}: {length:.0f} m, half {p.half:.2f} m, {gap:.1f} m off the line; abut {p.abut}, "
              f"under {getattr(p, 'under', None)}, tunnel {p.tunnel}; ends AC ({p.xy[0, 0]:.1f}, {-p.xy[0, 1]:.1f}) "
              f"z {p.z[0]:.2f} and ({p.xy[-1, 0]:.1f}, {-p.xy[-1, 1]:.1f}) z {p.z[-1]:.2f}")
    if not near:
        return
    cols = [(grade([p for j, p in enumerate(plans) if j != k]) - full) * 100 for k in near]
    print("       m  graded (no lift)" + "".join(f"  w/o #{k:<4}" for k in near))
    for i in range(len(ss)):
        print(f"{ss[i]:8.1f} {sp.up(la[i:i + 1], lo[i:i + 1], full[i:i + 1])[0]:16.3f}"
              + "".join(f"{c[i]:+11.1f}" for c in cols))


def joint_of(q, parts, grounds, join_m, ground_m):
    """What meets at a deck's end q (2,): the decks' ids ending within join_m (parts: decks_and_pads') and per ground road
    ending within ground_m of it (grounds: ground_roads') its id and its angle in degrees off straight on from the first
    deck (0: it goes on in line with it). Pure."""
    def leaving(line):
        line = line if np.hypot(*(line[0] - q)) <= np.hypot(*(line[-1] - q)) else line[::-1]
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]
        at = min(12.0, float(s[-1]))        # (the pad's reach: roads.deck_pads reads the angle so)
        v = np.array([np.interp(at, s, line[:, 0]), np.interp(at, s, line[:, 1])]) - line[0]
        return v / max(float(np.hypot(*v)), 1e-9)
    near = lambda ln, m: min(np.hypot(*(ln[0] - q)), np.hypot(*(ln[-1] - q))) < m       # noqa: E731
    on = [(f, xy) for f, _s, xy, _z in parts if near(xy, join_m)]
    around = []
    for f, _s, ln, _n in grounds:
        if near(ln, ground_m):
            a = float(np.degrees(np.arccos(np.clip(-leaving(on[0][1]) @ leaving(ln), -1.0, 1.0)))) if on else float("nan")
            around.append((f, a))
    return [f for f, _xy in on], around


def report_decks(sp, ss, px, py):
    """The deck parts near the line with their tilt, their ends' joints and the pads there, and the terrain vertices near
    it against the decks' tops."""
    import grading
    import roads
    from roads import deckmesh

    def elev(la, lo):           # (as ground.build: the graded ground with ROAD_LIFT)
        return sp.graded(np.asarray(la, np.float64), np.asarray(lo, np.float64), grading.ROAD_LIFT)
    bridges = sp.bridges()
    decks = []
    pads = []
    print("\ndeck parts within {:.0f} m of the line (bridges.parts):".format(DECK_NEAR_M))
    for tx, ty in sorted({tile_of(x, y) for x, y in zip(px, py)}):
        parts, tile_pads = sp.decks_and_pads(tx, ty)
        grounds = sp.ground_roads(tx, ty)
        pads += [p for p in tile_pads if not any(np.allclose(p[1], q[1]) for q in pads)]
        for fid, spec, xy, zd in parts:
            if float(np.hypot(xy[:, 0, None] - px[None], xy[:, 1, None] - py[None]).min()) > DECK_NEAR_M:
                continue
            if any(fid == d[0] and np.allclose(xy[0], d[1][0]) for d in decks):
                continue        # (a part reaching into two tiles)
            length = float(np.hypot(*np.diff(xy, axis=0).T).sum())
            bank = bridges.deck_bank(xy, zd)
            tilt = f"cross slope {bank[0] * 100:+.1f} to {bank[-1] * 100:+.1f} % (toward its left)" if bank is not None else \
                ("level across: no road's slope at its ends" if roads._is_simple(sp.frame, xy)
                 else "level across: one surface with another part (roads._tilting_parts)")
            print(f"  {fid} ({spec.cls}, {spec.width:.1f} m wide): {length:.1f} m, AC ({xy[0, 0]:.1f}, {-xy[0, 1]:.1f}) "
                  f"z {zd[0]:.3f} to ({xy[-1, 0]:.1f}, {-xy[-1, 1]:.1f}) z {zd[-1]:.3f}; {tilt}")
            for at, name in ((0, "start"), (-1, "end")):
                on, around = joint_of(xy[at], parts, grounds, deckmesh.PAD_JOIN_M, deckmesh.PAD_GROUND_M)
                has = any(np.hypot(*(np.asarray(p[1])[:2] - xy[at])) < deckmesh.PAD_JOIN_M for p in pads)
                print(f"      {name}: decks {[str(f)[:8] for f in on]}, ground roads "
                      f"{[(str(f)[:8], round(a, 1)) for f, a in around]} (degrees off straight on); pad {'YES' if has else 'no'}")
            decks.append((fid, xy))
    if not decks:
        print("  none")
    for ring, centre, walls in pads:
        ring = np.asarray(ring, np.float64)
        if float(np.hypot(ring[:, 0, None] - px[None], ring[:, 1, None] - py[None]).min()) <= DECK_NEAR_M:
            d = np.hypot(px - centre[0], py - centre[1])
            print(f"  pad at the joint AC ({centre[0]:.1f}, {-centre[1]:.1f}), route {ss[int(d.argmin())]:.0f} m: {len(ring)} ring "
                  f"points, z {ring[:, 2].min():.2f}-{ring[:, 2].max():.2f}, {len(walls)} rails")
    box = (px.min() - 10, -py.max() - 10, px.max() + 10, -py.min() + 10)
    T3, D, N = measure._surfaces(sp.track, box)
    ground = np.array(["_ground_" in n for n in N], bool)
    if not ground.any():
        return
    V = np.unique(T3[ground].reshape(-1, 3), axis=0)
    d = np.hypot(V[:, 0, None] - px[None], -V[:, 2, None] - py[None])
    keep = d.min(1) <= VERTEX_NEAR_M
    V, k, off = V[keep], d[keep].argmin(1), d[keep].min(1)
    tops = T3[D]
    if len(tops):
        nrm = np.cross(tops[:, 1] - tops[:, 0], tops[:, 2] - tops[:, 0])
        tops = tops[nrm[:, 1] > 0.7 * np.linalg.norm(nrm, axis=1)]
    la, lo = sp.lalo(V[:, 0], -V[:, 2])
    gr = sp.up(la, lo, elev(la, lo))
    hits = measure._heights(tops, np.ones(len(tops), bool), V[:, 0], V[:, 2]) if len(tops) else [(np.zeros(0), None)] * len(V)
    print(f"\nterrain vertices within {VERTEX_NEAR_M:.0f} m of the line: heights in m, differences in cm; per deck its arc from "
          "its start / to its end")
    print("   route   off      AC x      AC z     graded      built  built-graded  deck top  built-deck  arcs")
    for i in np.argsort(ss[k]):
        z, _ = hits[i]
        top = float(z[np.argmin(np.abs(z - V[i, 1]))]) if len(z) else float("nan")
        arcs = " ".join("{:5.1f}/{:5.1f}".format(*arcs_from_ends(xy, np.array([V[i, 0], -V[i, 2]]))) for _f, xy in decks)
        deck = f"{top:9.3f} {(V[i, 1] - top) * 100:+11.1f}" if np.isfinite(top) else f"{'-':>9} {'':>11}"
        print(f"{ss[k[i]]:8.2f} {off[i]:5.2f} {V[i, 0]:9.2f} {V[i, 2]:9.2f} {gr[i]:10.3f} {V[i, 1]:10.3f} "
              f"{(V[i, 1] - gr[i]) * 100:+13.1f} {deck}  {arcs}")


def wall_answer(t, k):
    """What became of segment k of a road's side (roads.walls._step_side's t): "wall" (its run passed: a tile still draws only
    its own piece of two points or more), or all that refused it, the step's own tests first. Pure."""
    if t.run[k]:
        return "wall"
    if not t.there[k]:
        return "no step of two roads: a cutting's" if np.isfinite(t.off[k]) else "no step"
    why = [f"lower than the room: {t.h[k]:.2f} under {t.room[k]:.1f} m"] if not t.stands[k] else []
    why += [what for no, what in ((t.on_deck[k], "under a deck"), (t.on_road[k], "on a carriageway"), (t.bends[k], "tight bend"),
                                  (t.near_wall[k], "a cutting's wall near"), (t.no_depth[k], "no room for its depth")) if no]
    return "; ".join(why) or "too low or short a run (_wall_runs)"


def report_walls(sp, px, py):
    """Each wall test per segment near the stretch (roads.walls._step_side as a road tile calls it): the tiles' road parts built
    again into a temporary folder (the map and plan caches are the shared ones: they may fill, data may be fetched)."""
    import blockworker
    from roads import walls
    real, rows = walls._between_walls, {}
    tiles = sorted({tile_of(x, y) for x, y in zip(px, py)})

    def wrapped(frame, plans, roads_, ground, exact, others, decks, made, cut_lines=None):
        import grading
        road_of = {grading.road_id(fid): (fid, spec) for fid, spec, _p, _x in roads_}
        faces = [np.asarray(w["base"], np.float64) for w in made if not w.get("parapet")]
        faces = np.concatenate(faces) if faces else np.zeros((0, 2))
        for rid, xy, z, cut in walls._joined_plans(plans):
            if rid not in road_of:
                continue
            fid, spec = road_of[rid]
            if spec.kind not in walls.BUILT:
                continue
            mid = (xy[:-1] + xy[1:]) / 2
            d = np.diff(xy, axis=0)
            d /= np.maximum(np.hypot(*d.T), 1e-9)[:, None]
            bends = grading.bend_zone(mid)
            la, lo, _ = frame.enu_to_geodetic(mid[:, 0], mid[:, 1], np.zeros(len(mid)))
            road_z = np.asarray(frame.geodetic_to_enu(la, lo, (z[:-1] + z[1:]) / 2)[2], np.float64)
            for side, c0, label in ((1.0, 0, "left"), (-1.0, 3, "right")):
                t = walls._step_side(mid, d, np.c_[-d[:, 1], d[:, 0]] * side, cut[:, c0], cut[:, c0 + 1], spec.width / 2, plans, rid, fid,
                                     ground, others, decks, road_z, bends, faces)
                if t is None:
                    continue
                # (a wall only where this tile draws it: its own piece, two points or more; a neighbour's answer may be the wall)
                x0, y0, x1, y1 = exact
                inside = (t.base[:, 0] >= x0 - 2) & (t.base[:, 0] < x1 + 2) & (t.base[:, 1] >= y0 - 2) & (t.base[:, 1] < y1 + 2)
                drawn = np.zeros(len(mid), bool)
                for sl in walls._spans(t.run & inside):
                    drawn[sl] = True
                for k in np.flatnonzero(np.isfinite(t.off) & (np.hypot(px[:, None] - mid[:, 0], py[:, None] - mid[:, 1]).min(axis=0) < WALL_NEAR_M)):
                    answer = wall_answer(t, k)
                    if answer == "wall" and not drawn[k]:
                        answer = "no wall in this tile: passed, but off its box or a lone point"
                    key = (str(rid)[-8:], label, *np.round(mid[k], 1))
                    if key not in rows or answer == "wall":
                        rows[key] = (t.base[k], t.off[k], t.low[k], t.high[k], answer, t.cut[k])
        return real(frame, plans, roads_, ground, exact, others, decks, made, cut_lines)

    rules = sp.anc["rules"]
    walls._between_walls = wrapped
    try:
        with tempfile.TemporaryDirectory() as out:
            for tx, ty in tiles:
                blockworker._roads_tile(sp.anc["aid"], sp.anc["lat"], sp.anc["lon"], sp.anc["dem_zoom"], tx, ty, out, "tiles", sidewalks=True,
                                        lift=0.0, buildings=True, left_hand=rules["left_hand"], mph=rules["mph"], q=None, gas_stations=True,
                                        buried=rules["buried"], lamp_region=rules["lamp_region"], country=rules["country"])
    finally:
        walls._between_walls = real
    print("\nWalls between two roads near the stretch: per segment, a road's plan and side (AC x, z of the step)")
    print("  road      side    AC x     AC z    off    low    high   cut  answer")
    for (rid, label, _x, _y), (b, off, low, high, answer, cutting) in sorted(rows.items()):
        print(f"  {rid} {label:5} {b[0]:8.1f} {-b[1]:8.1f} {off:5.2f} {low:7.2f} {high:7.2f}  {'cut' if cutting else '   '}  {answer}")
    if not rows:
        print("  none: no road has such a step here")


def _chained(plans):
    """A road's plan pieces (grading.trim_plan cuts them per map cell) joined end to end, each one's end to the next one's start, a
    road running on one way: [(xy (n, 2), z (n,))]. Pure."""
    rows = [(np.asarray(p.xy, np.float64)[:, :2], np.asarray(p.z, np.float64)) for p in plans if len(p.xy) >= 2]
    out = []
    while rows:
        xy, z = rows.pop()
        grew = True
        while grew:
            grew = False
            for i, (x2, z2) in enumerate(rows):
                if np.hypot(*(xy[-1] - x2[0])) < 0.5:
                    xy, z, grew = np.r_[xy, x2[1:]], np.r_[z, z2[1:]], True
                elif np.hypot(*(x2[-1] - xy[0])) < 0.5:
                    xy, z, grew = np.r_[x2, xy[1:]], np.r_[z2, z[1:]], True
                if grew:
                    rows.pop(i)
                    break
        out.append((xy, z))
    return out


def road_ids(sp, text, px, py):
    """{plan rid: label} of the roads in the map cells of the stretch's tiles whose name holds text or whose id starts with it."""
    import grading
    import roads
    out = {}
    for key in sp.cells(px, py):
        f = sp.s.md.cell(key, layers=("roads",), kind="demand").layers.get("roads")
        if f is None or not len(f.kind):
            continue
        names = f.attrs.get("name")
        for i, fid in enumerate(f.ids):
            nm = str(names[i]) if names is not None and str(names[i]) not in ("", "None") else ""
            if str(fid).lower().startswith(text.lower()) or (nm and text.lower() in nm.lower()):
                out[grading.road_id(str(fid))] = f"{nm} {str(fid)[:8]}".strip()
    return out


def report_road(sp, text, px, py):
    """A road other than the route near the stretch: per ROAD_STEP_M along it its plan's height, the ground built across it, its
    grade and lean, and the other plans on it (their carriageways' edge: + past it, - on it; their height); then where the ground
    across it stands over its middle (_over_middle), with the places: the table's AC x, z are its line's."""
    ids = road_ids(sp, text, px, py)
    if not ids:
        print(f"\nno road holding {text!r} near the stretch")
        return
    la, lo = sp.lalo(px, py)
    plans = [p for p in sp.g.plans(la, lo)]
    box = (px.min() - ROAD_NEAR_M * 4, -py.max() - ROAD_NEAR_M * 4, px.max() + ROAD_NEAR_M * 4, -py.min() + ROAD_NEAR_M * 4)
    T3, _d, names = measure._surfaces(sp.track, box)
    T3 = T3[np.array(["_ground_" in n for n in names], bool)]
    offs = (-4, -3, -2, -1, 0, 1, 2, 3, 4)
    for rid, label in ids.items():
        for xy, z in _chained([p for p in plans if p.rid == rid]):
            if np.hypot(px[:, None] - xy[:, 0], py[:, None] - xy[:, 1]).min() > ROAD_NEAR_M * 3:
                continue                    # (another road of that name, in the map cells around)
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            print(f"\n{label}, plan half {[float(getattr(p, 'road_half', p.half)) for p in plans if p.rid == rid][0]:.1f} m, from AC {xy[0, 0]:.1f}, "
                  f"{-xy[0, 1]:.1f}; + left of its way (m, the ground built)")
            print("  along    AC x     AC z    plan " + " ".join(f"{o:+7d}" for o in offs) + "  grade%  lean%  other plans")
            prev, over = None, []
            for m in np.arange(0.0, s[-1], ROAD_STEP_M):
                k = min(int(np.searchsorted(s, m, side="right")) - 1, len(xy) - 2)
                t = (m - s[k]) / max(s[k + 1] - s[k], 1e-9)
                q = xy[k] + t * (xy[k + 1] - xy[k])
                if np.hypot(px - q[0], py - q[1]).min() > ROAD_NEAR_M * 3:
                    prev = None
                    continue
                u = (xy[k + 1] - xy[k]) / max(float(np.hypot(*(xy[k + 1] - xy[k]))), 1e-9)
                n = np.array([-u[1], u[0]])

                def up(h, at=q):            # (a plan's heights are the raw elevation's, the parts' the frame's)
                    return float(sp.up(*sp.lalo(np.array([at[0]]), np.array([at[1]])), np.array([h]))[0])
                built = [measure.highest_over(T3, *((q + n * o)[0], -(q + n * o)[1])) for o in offs]
                grade = "" if prev is None else f"{(built[4] - prev) / ROAD_STEP_M * 100:.0f}"
                prev = built[4]
                print(f"  {m:5.0f} {q[0]:8.1f} {-q[1]:8.1f} {up(z[k] + t * (z[k + 1] - z[k])):7.2f} " + " ".join(f"{b:7.2f}" for b in built)
                      + f"  {grade:>6} {(built[6] - built[2]) / 4 * 100:6.0f}  " + _others_on(q, plans, rid, up))
                over += _over_middle(m, q, n, offs, built)
            if over:
                print(f"  the ground over its middle by more than {ROAD_OVER_M * 100:.0f} cm:")
                print("\n".join(over))


def _over_middle(m, q, n, offs, built):
    """A line per point across a road standing over the road's middle by more than ROAD_OVER_M: m along it, its offset, its AC
    x, z, by how much. q, n (2,): the middle and the unit left, in the frame; built: the ground at offs, 0 the middle. Pure."""
    mid = built[list(offs).index(0)]
    return [f"    along {m:.0f} {o:+d} at AC {(q + n * o)[0]:.2f}, {-(q + n * o)[1]:.2f}: {(b - mid) * 100:+.0f} cm"
            for o, b in zip(offs, built) if b - mid > ROAD_OVER_M]


def _others_on(q, plans, rid, up=float):
    """The other plans a point q (2,) lies near: their id's end, the way to their carriageway's edge, their height (through up).
    Pure but for up."""
    out = []
    for p in plans:
        if p.rid == rid:
            continue
        xy, z = np.asarray(p.xy, np.float64)[:, :2], np.asarray(p.z, np.float64)
        ab = np.diff(xy, axis=0)
        t = np.clip(((q - xy[:-1]) * ab).sum(1) / np.maximum((ab * ab).sum(1), 1e-12), 0.0, 1.0)
        d = np.hypot(*(xy[:-1] + t[:, None] * ab - q).T)
        k = int(d.argmin())
        gap = d[k] - float(getattr(p, "road_half", p.half))
        if gap < ROAD_NEAR_M / 2:
            out.append(f"{str(p.rid)[-4:]} {gap:+.1f} z{up(z[k] + t[k] * (z[k + 1] - z[k])):.2f}")
    return " | ".join(out)


def plan_at(p, s0, q, pack):
    """What plan p (its first segment s0 in pack, a PlanPack) has to do with point q (2,): its nearest segment k, the way d to its
    line, its height there, on which side of its way q lies, that segment's yl and bw (0-255) and cut on that side. Pure."""
    xy = np.asarray(p.xy, np.float64)[:, :2]
    a, ab = xy[:-1], np.diff(xy, axis=0)
    t = np.clip(((q - a) * ab).sum(1) / np.maximum((ab * ab).sum(1), 1e-12), 0.0, 1.0)
    d = np.hypot(*(a + t[:, None] * ab - q).T)
    k = int(d.argmin())
    z = np.asarray(p.z, np.float64)
    left = float(ab[k, 0] * (q[1] - a[k, 1]) - ab[k, 1] * (q[0] - a[k, 0])) > 0.0
    cut = getattr(p, "cut", None)
    cut = np.full(3, np.nan) if cut is None else np.asarray(cut, np.float64)[k, :3] if left else np.asarray(cut, np.float64)[k, 3:6]
    return {"k": k, "d": float(d[k]), "z": float(z[k] + t[k] * (z[k + 1] - z[k])), "left": left,
            "yl": int(pack.yl[s0 + k]), "bw": int(pack.bw[s0 + k]), "cut": cut}


def report_at(sp, x, z):
    """One ground point at AC (x, z): the steps of its grading, then per plan in reach what it has to do with the point."""
    import grading
    from grading import points
    la, lo = sp.lalo(np.array([x]), np.array([-z]))
    _pl, plans, pack, e, n = sp.planner_at(la, lo)
    base = sp.elevation(la, lo)
    off = float(sp.up(la, lo, np.array([0.0]))[0])      # (a plan's heights are geodetic, the parts' the frame's)
    rows = [p for p in plans if len(p.xy) >= 2]
    s0 = np.r_[0, np.cumsum([len(p.xy) - 1 for p in rows])]

    def grade():
        return float(grading.grade_points(e, n, base, pack, 0.0)[0]) + off
    now = grade()
    yl, bw = pack.yl, pack.bw
    try:
        pack.yl = np.zeros_like(yl)
        no_yl = grade()
        pack.yl, pack.bw = yl, np.zeros_like(bw)
        no_bw = grade()
        pack.yl = np.zeros_like(yl)
        no_both = grade()
    finally:
        pack.yl, pack.bw = yl, bw
    print(f"AC {x:.1f}, {z:.1f}: elevation {float(base[0]) + off:.2f}, graded {now:.2f}, as the track gets it "
          f"{float(sp.graded(la, lo, 0.0)[0]) + off:.2f} (past a road's stopped end, a racetrack, over a tunnel it differs)")
    print(f"  with giving way off: a road's end's (yl) {no_yl:.2f}, a narrower road's (bw) {no_bw:.2f}, both {no_both:.2f}")
    print(f"  {'plan':>8} {'half':>5} {'carr.':>5} {'way':>6} {'edge':>6} {'height':>8} {'side':>5} {'yl':>4} {'bw':>4} "
          f"{'free':>14}  {'cut wall, top':>16}  without it")
    q = np.array([float(e[0]), float(n[0])])
    near = [(p, plan_at(p, s0[i], q, pack)) for i, p in enumerate(rows)]
    for p, got in sorted((r for r in near if r[1]["d"] - r[0].half < grading.T_MAX), key=lambda r: r[1]["d"]):
        rh = float(getattr(p, "road_half", p.half))
        without = float(points.grade_points(e, n, base, [o for o in plans if o is not p], 0.0)[0]) + off
        free = tuple(bool(v) for v in getattr(p, "free", (False, False)))
        wall, top = got["cut"][:2]
        print(f"  {str(p.rid)[-8:]:>8} {p.half:5.2f} {rh:5.2f} {got['d']:6.2f} {got['d'] - rh:+6.2f} {got['z'] + off:8.2f} "
              f"{'left' if got['left'] else 'right':>5} {got['yl']:4d} {got['bw']:4d} {str(free):>14}  {wall:7.2f} {top + off:8.2f}  {without:.2f}")


class PlanSteps:
    """A plan's heights after each step of the planner: wraps the steps of grading.planner, rows kept per part (its road, its
    first point), and the pins handed to plan_roads."""

    def __init__(self):
        self.rows, self.pins = {}, {}

    def keep(self, tag, plans):
        for p in plans:
            p = p[1] if isinstance(p, tuple) else p
            rid = getattr(p, "rid", None)
            if rid is None:
                continue
            xy = np.asarray(p.xy, np.float64)[:, :2]
            steps = self.rows.setdefault((rid, round(float(xy[0, 0]), 1), round(float(xy[0, 1]), 1)), [])
            z = np.asarray(p.z, np.float64)
            if not steps or len(steps[-1][2]) != len(z) or np.abs(steps[-1][2] - z).max() >= STEPS_SAME_M:
                steps.append((tag, xy.copy(), z.copy()))

    def install(self):
        import revisit
        from grading import ends, planner
        revisit.ON = False                  # (a kept plan would skip the steps; nothing of this run is kept either)
        os.environ.pop("BNGE_PLAN_RUN", None)
        snap = planner.snap_junctions

        def snapped(plans, specs):
            self.keep("profile", plans)     # (each road's own, with its pins; the second call: changed by the steps between)
            snap(plans, specs)
            self.keep("snap", plans)
        planner.snap_junctions = snapped
        for name in ("_ease_coarse", "_lift_approaches", "_lower_underpasses"):
            def step(me, key, plans, *a, _f=getattr(planner._Planner, name), _tag=name.strip("_"), **k):
                got = _f(me, key, plans, *a, **k)
                self.keep(_tag, plans)
                return got
            setattr(planner._Planner, name, step)
        pins = ends._Ends._pins

        def pinned(me, parts, ids, ext):
            got = pins(me, parts, ids, ext)
            for j, fid in enumerate(ids):
                if got is not None and any(v is not None for v in got[j]):
                    self.pins.setdefault(planner.road_id(fid), set()).add(tuple(None if v is None else round(float(v), 2) for v in got[j]))
            return got
        planner._Planner._pins = pinned


def report_steps(sp, steps, text, px, py):
    """Per part of the road near the stretch (steps: PlanSteps, installed before anything was planned): the elevation at its line
    and its heights after each step that changed them, from its last point back, as a road's end usually is what a step moves."""
    ids = road_ids(sp, text, px, py)
    if not ids:
        print(f"\nno road holding {text!r} near the stretch")
        return
    la, lo = sp.lalo(px, py)
    pl, plans, _pack, e, n = sp.planner_at(la, lo)
    off = float(sp.up(la[:1], lo[:1], np.array([0.0]))[0])
    for rid, label in ids.items():
        kept = [p for p in plans if p.rid == rid and np.hypot(e[:, None] - p.xy[:, 0], n[:, None] - p.xy[:, 1]).min() < ROAD_NEAR_M * 3]
        print(f"\n{label}: pins (first end, last end; the stronger road's height there): {sorted(steps.pins.get(rid, []), key=str) or 'none'}")
        for p in kept:
            xy = np.asarray(p.xy, np.float64)[:, :2]
            rows = [r for k, r in steps.rows.items()
                    if k[0] == rid and np.hypot(xy[:, None, 0] - r[0][1][:, 0], xy[:, None, 1] - r[0][1][:, 1]).min() < 1.0]
            if not rows:
                print(f"  (no steps kept for its part from {np.round(xy[0], 1)}: planned by another region)")
                continue
            got = max(rows, key=lambda r: len(r[0][1]))
            line = got[0][1]
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]
            a, b, _ = pl.frame.enu_to_geodetic(line[:, 0], line[:, 1], 0.0)
            elev = np.asarray(pl.elev(np.asarray(a), np.asarray(b)), np.float64)
            print(f"  part of {s[-1]:.0f} m, free {tuple(bool(v) for v in getattr(p, 'free', (False, False)))}; m from its last point")
            print("      m elevation " + " ".join(f"{g[0][:10]:>10}" for g in got) + "  over elevation")
            for m in np.arange(0.0, s[-1], STEPS_STEP_M):
                at = s[-1] - m
                zs = [float(np.interp(at, s, g[2])) for g in got]
                z0 = float(np.interp(at, s, elev))
                print(f"  {m:5.0f} {z0 + off:9.2f} " + " ".join(f"{v + off:10.2f}" for v in zs) + f"  {zs[-1] - z0:+7.2f}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("--from", dest="start", type=float)
    ap.add_argument("--to", dest="end", type=float)
    ap.add_argument("--at", help="one ground point instead of a stretch: AC x,z")
    ap.add_argument("--steps", action="store_true", help="with --road: its heights after each step of the planner, its pins")
    ap.add_argument("--step", type=float, default=1.0, help="m between the points along the line (default 1)")
    ap.add_argument("--plans", action="store_true", help="also each plan's share in the graded height")
    ap.add_argument("--decks", action="store_true", help="also the deck parts and the terrain vertices under them")
    ap.add_argument("--walls", action="store_true", help="also why a wall between two roads stands or not, per segment")
    ap.add_argument("--road", help="also this road near the stretch (part of its name, or the start of its id): profile and across")
    a = ap.parse_args()
    if a.at is None and (a.start is None or a.end is None):
        ap.error("--from and --to, or --at")
    if a.steps and not a.road:
        ap.error("--steps goes with --road")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")     # (map names: Māori, Norwegian, ... on a cp1252 console)
    if not os.path.exists(os.path.join(HERE, "out", "tracks", a.track, "tiles", "anchor.json")):
        sys.exit(f"no build of {a.track} in out/tracks (keep the build files, or tools\\from_debug.py)")
    if a.at is not None:
        with tempfile.TemporaryDirectory() as tex:
            report_at(Spot(a.track, tex), *(float(v) for v in a.at.split(",")))
        return
    ss, px, py = stretch(measure._route(a.track), a.start, a.end, a.step)
    steps = PlanSteps() if a.steps else None
    if steps is not None:
        steps.install()
    with tempfile.TemporaryDirectory() as tex:
        sp = Spot(a.track, tex)
        if steps is not None:
            report_steps(sp, steps, a.road, px, py)
            return
        report_line(sp, ss, px, py)
        report_map(sp, px, py)
        if a.plans:
            report_plans(sp, ss, px, py)
        if a.decks:
            report_decks(sp, ss, px, py)
        if a.road:
            report_road(sp, a.road, px, py)
        if a.walls:
            report_walls(sp, px, py)


if __name__ == "__main__":
    main()
