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
    """The engine set up for a track's kept tiles, as a scenery worker (make_obj._init_scenery)."""

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
    print("\nthe map there (Overture / OpenStreetMap):")
    print("\n".join(water + ways) if water or ways else "  no water, no road")


def report_plans(sp, ss, px, py):
    """Each near plan's share in the graded height along the line: without it minus with it, cm."""
    import grading
    import roads
    la, lo = sp.lalo(px, py)
    base = sp.elevation(la, lo)
    plans = sp.g.plans(la, lo) if sp.g is not None else []

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


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("--from", dest="start", type=float, required=True)
    ap.add_argument("--to", dest="end", type=float, required=True)
    ap.add_argument("--step", type=float, default=1.0, help="m between the points along the line (default 1)")
    ap.add_argument("--plans", action="store_true", help="also each plan's share in the graded height")
    ap.add_argument("--decks", action="store_true", help="also the deck parts and the terrain vertices under them")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")     # (map names: Māori, Norwegian, ... on a cp1252 console)
    if not os.path.exists(os.path.join(HERE, "out", "tracks", a.track, "tiles", "anchor.json")):
        sys.exit(f"no build of {a.track} in out/tracks (keep the build files, or tools\\from_debug.py)")
    ss, px, py = stretch(measure._route(a.track), a.start, a.end, a.step)
    with tempfile.TemporaryDirectory() as tex:
        sp = Spot(a.track, tex)
        report_line(sp, ss, px, py)
        report_map(sp, px, py)
        if a.plans:
            report_plans(sp, ss, px, py)
        if a.decks:
            report_decks(sp, ss, px, py)


if __name__ == "__main__":
    main()
