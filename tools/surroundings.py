"""Does the land away from the roads lie where the terrain model and the map say? The whole built area of a kept build
(out/tracks/<track>), against the elevation and the map's water. Nothing is built.

    .venv\\Scripts\\python.exe tools\\surroundings.py <track>                 # the numbers, the worst tiles, a map picture
    .venv\\Scripts\\python.exe tools\\surroundings.py <track> --tiles 3,14 4,14   # only these tiles

Per ground vertex (2 m) of every tile, heights in the OBJ parts' frame:
- lowered / raised: the built ground against the elevation (blockworker.ground), farther than NEAR_ROAD_M from a road's
  plan: the grading has no business there (a hillside gone, ground in the air).
- water off the land: a water surface more than WET_M from the elevation under it (a lake on a hillside; the terrain model
  shows water's surface flat, so real water lies on it).
- water walls: steep triangles of the water and foam meshes, by the ground they stand on (m2; a straight wall over two
  cells: 4 m2 per metre of it).
- ground steps: neighbouring vertices further apart in height than the elevation by STEP_M, in metres of length, away from
  roads; and the ground of two tiles apart on the border they share.

The map's water areas: per area (subtype/class, name) its size and the elevation inside it. A standing water's inside is flat
on a terrain model; an area spanning more than FLAT_M (p10..p90) is flagged "not flat": land filed under water (a cape), or a
river mapped as a lake.

The picture (out/surroundings_<track>.png, north up, MAP_M per pixel): grey = fine, blue = lowered, red = raised, cyan = water
off the land, magenta = water walls, yellow = ground steps, white line = the route.
"""
import argparse
import os
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
sys.path.insert(0, os.path.join(HERE, "src"))
sys.path.insert(0, os.path.join(HERE, "engine"))
sys.path.insert(0, os.path.join(HERE, "tools"))
import heights  # noqa: E402
import mapgeom  # noqa: E402
import measure  # noqa: E402
from track import obj_to_kn5  # noqa: E402

CELL_M = heights.CELL_M
TILE_M = heights.TILE_M
N = int(TILE_M / CELL_M) + 1    # vertices per tile edge
OFF_M = 3.0                     # m the ground may lie off the elevation away from roads (a terrain model's own noise is less)
# m from a plan's edge: past this the grading shouldn't reach. A cut into a 45 degree slope reaches as far as it is deep, so
# a cut deeper than this is flagged though it is right; the picture tells it apart (six healthy test tracks: at most 1.2 %)
NEAR_ROAD_M = 30.0
WET_M = 2.0                     # m: water further than this from the elevation under it isn't lying on the land
STEP_M = 3.0                    # m between two vertices (2 m) beyond the elevation's own step: a slope past 60 degrees
STEEP_UP = 0.5                  # a triangle's normal's up share below this is a wall (past 60 degrees)
FLAT_M = 3.0                    # m: p10..p90 of the elevation inside a standing water: more isn't flat. A terrain model older than
                                # its reservoir shows the valley there: that one is flagged though it is water
AREA_MIN_M2 = 400.0             # m2: smaller areas say nothing (a garden pond on 8 m samples)
AREA_STEP_M = 8.0               # m between the samples inside an area
FLOWING = ("river", "stream", "canal", "drain", "ditch", "waterfall")   # (their surface runs downhill: no flatness test)
MAP_M = 4.0                     # m per pixel of the picture
FINE, LOW, HIGH, WET, WALL, STEP = range(6)     # the picture's classes, in the order they paint over each other
COLOURS = np.array([(70, 70, 70), (50, 90, 230), (230, 60, 50), (0, 220, 230), (240, 40, 240), (250, 220, 40)], np.uint8)


def ground_and_water(objs, tx, ty):
    """From a tile's objects (obj_to_kn5.read_obj): the ground's height per vertex (N, N) [row north, col east], NaN where
    there is none, the water's likewise, the middles (k, 2: east, north) of the water's steep triangles and the ground
    under them in m2. Pure."""
    built, wsum, wnum = np.full((N, N), np.nan), np.zeros((N, N)), np.zeros((N, N))
    steep = []
    for name, (_m, P, _uv, T) in objs.items():
        is_water = name.startswith(("nocol_water", "nocol_foam"))
        if not is_water and ("_ground_" not in name or name.startswith("nocol")):
            continue
        c = np.rint((P[:, 0] - tx * TILE_M) / CELL_M).astype(np.int64)
        r = np.rint((-P[:, 2] - ty * TILE_M) / CELL_M).astype(np.int64)
        ok = (c >= 0) & (c < N) & (r >= 0) & (r < N)
        if not is_water:
            # (the lattice's vertices alone: a cell cut along a wall has more, on the step's two levels, scenery.wallcut)
            on = (np.abs(P[:, 0] - tx * TILE_M - c * CELL_M) < 1e-2) & (np.abs(-P[:, 2] - ty * TILE_M - r * CELL_M) < 1e-2)
            built[r[ok & on], c[ok & on]] = P[ok & on, 1]
            continue
        np.add.at(wsum, (r[ok], c[ok]), P[ok, 1])
        np.add.at(wnum, (r[ok], c[ok]), 1.0)
        t = P[T]
        nrm = np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0])
        wall = np.abs(nrm[:, 1]) < STEEP_UP * np.maximum(np.linalg.norm(nrm, axis=1), 1e-9)
        if wall.any():
            mid = t[wall].mean(1)
            steep.append(np.c_[mid[:, 0], -mid[:, 2]])
    water = np.where(wnum > 0, wsum / np.maximum(wnum, 1.0), np.nan)
    walls = np.concatenate(steep) if steep else np.zeros((0, 2))
    return built, water, walls, len(walls) * CELL_M * CELL_M / 2        # (two triangles a cell)


def classes(built, elev, water, near_road):
    """Per vertex its class (FINE ... STEP, later ones win) and (off the elevation, water off it, steps). All (N, N). Pure."""
    off = built - elev
    wet = water - elev
    far = ~near_road
    cls = np.full(built.shape, FINE, np.int64)
    cls[far & (off < -OFF_M)] = LOW
    cls[far & (off > OFF_M)] = HIGH
    cls[np.abs(wet) > WET_M] = WET
    steps = np.zeros(built.shape, bool)
    edges = 0
    for axis in (0, 1):
        d = np.abs(np.diff(built, axis=axis)) - np.abs(np.diff(elev, axis=axis))
        big = np.nan_to_num(d, nan=0.0) > STEP_M
        # (an edge away from roads when both its ends are: per edge, or two at one vertex would count as one)
        if axis == 0:
            big &= far[:-1, :] & far[1:, :]
            steps[:-1, :] |= big
            steps[1:, :] |= big
        else:
            big &= far[:, :-1] & far[:, 1:]
            steps[:, :-1] |= big
            steps[:, 1:] |= big
        edges += int(big.sum())
    cls[steps] = STEP
    return cls, off, wet, edges


def seam_steps(rows, step_m=STEP_M):
    """Edges of tile borders where two tiles' ground lies apart by more than step_m on the vertices they share: rows {(tx, ty):
    built (N, N)}. A tile's last row and column are its neighbour's first. Pure."""
    edges = 0
    for (tx, ty), built in rows.items():
        for other, mine, theirs in (((tx + 1, ty), built[:, -1], lambda b: b[:, 0]), ((tx, ty + 1), built[-1, :], lambda b: b[0, :])):
            if other in rows:
                gap = np.nan_to_num(np.abs(mine - theirs(rows[other])), nan=0.0)
                edges += int((gap[:-1] + gap[1:] > 2 * step_m).sum())
    return edges


def ring_area(ring):
    """m2 inside a closed ring (k, 2) (shoelace). Pure."""
    x, y = ring[:, 0], ring[:, 1]
    return 0.5 * abs(float(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1))))


def part_area(rings):
    """m2 of a polygon part: its outer ring less its holes (islands). Pure."""
    return ring_area(rings[0]) - sum(ring_area(h) for h in rings[1:])


def near_plans(sp, gx, gy, la, lo):
    """Per vertex of a tile whether a road's plan lies within NEAR_ROAD_M of its edge."""
    import roads
    n = gx.shape[0]
    out = np.zeros(gx.size, bool)
    if sp.g is None:
        return out.reshape(n, n)
    q = np.c_[gx.ravel(), gy.ravel()]
    for p in sp.g.plans(la, lo):
        out |= roads._line_gap(q, np.asarray(p.xy, np.float64))[0] <= p.half + NEAR_ROAD_M
    return out.reshape(n, n)


def not_flat(cls, sub, span, flowing=FLOWING):
    """Whether a map water area is no standing water: p10..p90 of its elevation (span m) past FLAT_M. A river's surface runs
    downhill; the sea's reads as flat where the terrain model has it. Pure."""
    return span > FLAT_M and str(cls) not in flowing and str(sub) not in flowing


def inside(rings, x0, y0, step, nx, ny):
    """Which samples of the grid x0 + i * step, y0 + j * step (ny, nx) lie in a part's rings (first the outer, then the
    holes). Pure."""
    img = Image.new("1", (nx, ny), 0)
    d = ImageDraw.Draw(img)
    for k, ring in enumerate(rings):
        d.polygon([(float(x - x0) / step, float(y - y0) / step) for x, y in ring], fill=0 if k else 1)
    return np.asarray(img, bool)


def map_areas(sp, tiles):
    """The map's water areas under the tiles: [(subtype/class, name, m2 in total, p10, p90 of the elevation inside)], one row
    per subtype/class and name over its pieces per map cell."""
    import mapgeom
    import roads
    got = {}
    for key in sorted({k for t in tiles for k in roads.cells_of_tile(sp.frame, *t)}):
        f = sp.s.md.cell(key, layers=("water",), kind="demand").layers.get("water")
        if f is None:
            continue
        names = f.attrs.get("name")
        for i in np.flatnonzero(f.kind == 3):
            for part in f.parts(i):
                if not part or len(part[0]) < 4:
                    continue
                rings = [np.c_[mapgeom.enu_xy(f, sp.frame, r)] for r in part if len(r) >= 4]
                e, n = rings[0][:, 0], rings[0][:, 1]
                area = part_area(rings)
                if area < AREA_MIN_M2:
                    continue
                step = max(AREA_STEP_M, float(np.sqrt(area / 4000.0)))     # (at most some thousand samples an area)
                xs, ys = np.arange(e.min(), e.max(), step), np.arange(n.min(), n.max(), step)
                hit = inside(rings, e.min(), n.min(), step, len(xs), len(ys))
                if not hit.any():
                    continue
                gx, gy = np.meshgrid(xs, ys)
                la, lo = sp.lalo(gx[hit], gy[hit])
                z = sp.elevation(la, lo)
                k = (str(f.attrs["subtype"][i]), str(f.attrs["class"][i]), str(names[i]) if names is not None else "")
                row = got.setdefault(k, [0.0, []])
                row[0] += area
                row[1].append(z)
    return [(k, a, *np.percentile(np.concatenate(zs), (10, 90))) for k, (a, zs) in sorted(got.items(), key=lambda v: -v[1][0])]


def picture(track, tiles, per_tile, route):
    """The map picture of the tiles to out/surroundings_<track>.png; returns its path."""
    txs, tys = [t[0] for t in tiles], [t[1] for t in tiles]
    x0, x1, y0, y1 = min(txs), max(txs) + 1, min(tys), max(tys) + 1
    step = int(MAP_M / CELL_M)
    px = int(TILE_M / MAP_M)
    img = np.full(((y1 - y0) * px, (x1 - x0) * px, 3), 16, np.uint8)
    for (tx, ty), (cls, _built) in per_tile.items():
        # (per pixel its worst vertex: a narrow wall must show at any scale)
        worst = np.zeros((px, px), np.int64)
        for r in range(px):
            for c in range(px):
                worst[r, c] = cls[r * step:(r + 1) * step + 1, c * step:(c + 1) * step + 1].max()
        rows = (y1 - 1 - ty) * px
        cols = (tx - x0) * px
        img[rows:rows + px, cols:cols + px] = COLOURS[worst[::-1]]
    im = Image.fromarray(img)
    d = ImageDraw.Draw(im)
    if len(route):
        pts = [((x / MAP_M - x0 * px), ((y1 * TILE_M + z) / MAP_M)) for x, z in route]
        d.line(pts, fill=(255, 255, 255), width=1)
    path = os.path.join(HERE, "out", f"surroundings_{track}.png")
    im.save(path)
    return path


def report_tile(sp, tx, ty):
    """A tile's numbers: {cls, counts, ...} (reads its OBJ part)."""
    part = os.path.join(HERE, "out", "tracks", sp.track, "obj", "parts", f"t_{tx}_{ty}.obj")
    built, water, walls, wall_m2 = ground_and_water(obj_to_kn5.read_obj(part), tx, ty)
    gx, gy = np.meshgrid(tx * TILE_M + np.arange(N) * CELL_M, ty * TILE_M + np.arange(N) * CELL_M)
    la, lo = sp.lalo(gx.ravel(), gy.ravel())
    elev = sp.up(la, lo, sp.elevation(la, lo)).reshape(N, N)
    near = near_plans(sp, gx, gy, la, lo)
    cls, off, wet, steps = classes(built, elev, water, near)
    if len(walls):
        c = np.clip(np.rint((walls[:, 0] - tx * TILE_M) / CELL_M).astype(np.int64), 0, N - 1)
        r = np.clip(np.rint((walls[:, 1] - ty * TILE_M) / CELL_M).astype(np.int64), 0, N - 1)
        cls[r, c] = WALL
    far = ~near
    own = np.zeros(far.shape, bool)
    own[:-1, :-1] = True            # (a tile's last row and column are its neighbour's: each vertex counts once, one cell)
    return {"cls": cls, "built": built, "low": int((own & far & (off < -OFF_M)).sum()), "high": int((own & far & (off > OFF_M)).sum()),
            "wet": int((own & (np.abs(wet) > WET_M)).sum()), "wall_m2": wall_m2, "steps": steps,
            "low_max": float(np.nanmin(off[far])) if far.any() else 0.0, "high_max": float(np.nanmax(off[far])) if far.any() else 0.0,
            "wet_max": float(np.nanmax(np.abs(wet))) if np.isfinite(wet).any() else 0.0}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("--tiles", nargs="*", help="only these tiles: tx,ty ...")
    ap.add_argument("--worst", type=int, default=12, help="how many tiles to list (default 12)")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")      # (map names)
    if not os.path.exists(os.path.join(HERE, "out", "tracks", a.track, "tiles", "anchor.json")):
        sys.exit(f"no build of {a.track} in out/tracks (keep the build files, or tools\\from_debug.py)")
    with tempfile.TemporaryDirectory() as tex:
        sp = heights.Spot(a.track, tex)
        tiles = [tuple(int(v) for v in t.split(",")) for t in a.tiles] if a.tiles else [tuple(t) for t in sp.anc["tiles"]]
        rows = {t: report_tile(sp, *t) for t in tiles}
        vertex_m2 = CELL_M * CELL_M
        total = len(tiles) * TILE_M * TILE_M
        sums = {k: sum(r[k] for r in rows.values()) for k in ("low", "high", "wet", "steps", "wall_m2")}
        seams = seam_steps({t: r["built"] for t, r in rows.items()})
        print(f"{a.track}: {len(tiles)} tiles, {total / 1e6:.2f} km2")
        print(f"  lowered past {OFF_M:.0f} m, away from roads: {sums['low'] * vertex_m2 / 1e6:6.2f} km2 "
              f"({sums['low'] * vertex_m2 / total:6.1%}), deepest {min(r['low_max'] for r in rows.values()):.1f} m")
        print(f"  raised past {OFF_M:.0f} m, away from roads:  {sums['high'] * vertex_m2 / 1e6:6.2f} km2 "
              f"({sums['high'] * vertex_m2 / total:6.1%}), highest {max(r['high_max'] for r in rows.values()):.1f} m")
        print(f"  water off the land past {WET_M:.0f} m:          {sums['wet'] * vertex_m2 / 1e6:6.2f} km2 "
              f"({sums['wet'] * vertex_m2 / total:6.1%}), furthest {max(r['wet_max'] for r in rows.values()):.1f} m")
        print(f"  water walls: {sums['wall_m2']:.0f} m2; ground steps away from roads: {sums['steps'] * CELL_M:.0f} m; "
              f"ground apart at tile borders: {seams * CELL_M:.0f} m")
        print(f"\nthe {a.worst} worst tiles (share of the tile lowered, water off the land; walls in m2, steps in m):")
        worst = sorted(rows.items(), key=lambda kv: -(kv[1]["low"] + kv[1]["wet"] + kv[1]["wall_m2"] + kv[1]["steps"]))
        cells = (N - 1) * (N - 1)
        for (tx, ty), r in worst[:a.worst]:
            print(f"  {tx:4d},{ty:4d}: {r['low'] / cells:4.0%} lowered (to {r['low_max']:7.1f} m), {r['wet'] / cells:4.0%} water off "
                  f"(to {r['wet_max']:6.1f} m), walls {r['wall_m2']:5.0f}, steps {r['steps'] * CELL_M:5.0f}")
        print("\nthe map's water areas (Overture / OpenStreetMap), by size; the elevation inside, p10..p90:")
        for (sub, cls, name), m2, p10, p90 in map_areas(sp, tiles):
            flag = "  land: left out of the water" if cls in mapgeom.LAND_CLASSES else \
                "  <-- NOT FLAT: is this water?" if not_flat(cls, sub, p90 - p10) else ""
            print(f"  {sub}/{cls} {name!r}: {m2 / 1e6:7.3f} km2, {p10:6.1f}..{p90:6.1f} m{flag}")
        path = picture(a.track, tiles, {t: (r["cls"], r["built"]) for t, r in rows.items()}, measure._route(a.track))
        print(f"\npicture: {path}")


if __name__ == "__main__":
    main()
