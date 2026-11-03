"""Why the ground at a spot drives as road, grass or gravel: the map's roads there and the ground's material at the spot
after each painting step of scenery/ground.build (land cover, paths, roads, car parks, forecourts), built again from
the track's tiles (out/tracks/<track>: a build with its files kept) and today's map data cache.

    .venv\\Scripts\\python.exe tools\\ground_paint.py <track> <AC x> <AC z>
    .venv\\Scripts\\python.exe tools\\ground_paint.py <track> --route <m>      # a route metre (the Track Debug app's count)

The ground's object takes its physics prefix (1ROAD, 1GRASS, 1GRAVEL) from the material of each 2 m cell's south-west
sample (ground.SURF_AC): a road missing at "roads" was not painted in (its map data, its spec, or the painting's own
tests). A material that changes at a later step was painted over; a step not listed did not run (nothing of it on the
tile). Per road near the spot: its class, kind and width
(roads.road_specs), its level ranges (bridge, tunnel) and whether a ground part of it passes within its half width.
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
from track import make_obj  # noqa: E402

import blockworker  # noqa: E402
import roads as roadsmod  # noqa: E402
import surface as surfacemod  # noqa: E402
from scenery import ground, groundcover, roadtex, water  # noqa: E402

NEAR_M = 30.0           # m around the spot a road counts as near
STEPS = (("land cover", surfacemod, "classify"), ("paths", ground, "_paint_paths"), ("roads", surfacemod, "paint_roads"),
         ("car parks", surfacemod, "paint_lots"), ("forecourts", surfacemod, "paint_pads"))


def material_names():
    """{material number: name} of surface.py's materials. Pure."""
    return {v: k for k, v in vars(surfacemod).items() if k.isupper() and isinstance(v, int) and not isinstance(v, bool)
            and k in ("GRASS", "LAWN", "ASPHALT", "COBBLE", "DUSTY", "LOOSE", "ROCK", "MUD", "SNOW", "DIRT", "VERGE")}


def sample_of(x, z, tile_box):
    """The [row, col] of the ground sample whose cell holds AC point (x, z), rows northwards from the tile's south edge
    (ground.build's grid; the cell takes the material of its south-west sample). Pure."""
    x0, y0 = tile_box[0], tile_box[1]
    return int((-z - y0) // ground.CELL), int((x - x0) // ground.CELL)


def tile_of(x, z):
    """The tile (tx, ty) of AC point (x, z): 256 m tiles, ty northwards. Pure."""
    return int(np.floor(x / 256.0)), int(np.floor(-z / 256.0))


def route_point(track, m):
    """AC (x, z) of route metre m of track (its tiles' anchor.json)."""
    with open(os.path.join(HERE, "out", "tracks", track, "tiles", "anchor.json"), encoding="utf-8") as f:
        xy = np.asarray(json.load(f)["route"], np.float64)
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    return float(np.interp(m, s, xy[:, 0])), -float(np.interp(m, s, xy[:, 1]))


def _distance(fr, ring, px, py):
    """m from ENU (px, py) to the lon/lat polyline ring."""
    e, n, _ = fr.geodetic_to_enu(ring[:, 1], ring[:, 0], np.zeros(len(ring)))
    e, n = np.asarray(e), np.asarray(n)
    if len(e) < 2:
        return float(np.hypot(e - px, n - py).min()) if len(e) else np.inf
    ax, ay, bx, by = e[:-1], n[:-1], e[1:], n[1:]
    t = np.clip(((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / np.maximum((bx - ax) ** 2 + (by - ay) ** 2, 1e-9), 0, 1)
    return float(np.hypot(ax + t * (bx - ax) - px, ay + t * (by - ay) - py).min())


def report_roads(fr, s, x, z):
    """The map's roads within NEAR_M of AC (x, z)."""
    px, py = x, -z
    la, lo = (np.asarray(v) for v in fr.enu_to_geodetic(np.array([px]), np.array([py]), 0.0)[:2])
    feats_list, complete = s.surface.roads(la, lo)
    print(f"AC ({x:.1f}, {z:.1f}) = lat {float(la[0]):.6f}, lon {float(lo[0]):.6f}"
          + ("" if complete else "   (map data of a cell missing from the cache)"))
    print(f"roads within {NEAR_M:.0f} m (map data: Overture / OpenStreetMap):")
    shown = False
    for feats in feats_list:
        if feats is None or not len(feats):
            continue
        specs = roadsmod.road_specs(feats, s.surface.urban, s.widths)
        for i in range(len(feats)):
            if specs[i] is None:
                continue
            d = min((_distance(fr, ring, px, py) for part in feats.parts(i) for ring in part if len(ring)), default=np.inf)
            if d > NEAR_M:
                continue
            sp = specs[i]
            levels = {k: [(round(float(t.start[j]), 3), round(float(t.end[j]), 3), str(t.value[j])) for j in t.rows(i)]
                      for k, t in feats.rules.items() if k in ("flags", "level")}
            on = min((_distance(fr, ring, px, py) for ring in roadsmod.ground_parts(feats, i)), default=np.inf)
            print(f"  {feats.ids[i]}  {d:5.1f} m off: {sp.cls}, {sp.kind}, {sp.width:.1f} m wide"
                  f"{', one-way' if sp.oneway else ''}; levels {levels or 'none'}; "
                  + (f"a ground part {on:.1f} m off: inside its half width" if on <= sp.width / 2
                     else f"no ground part within its half width ({on:.1f} m)"))
            shown = True
    if not shown:
        print("  none")


def report_steps(track, x, z):
    """The ground's material at AC (x, z) after each painting step, by building its tile's ground again."""
    tx, ty = tile_of(x, z)
    box = roadsmod.tile_bbox(tx, ty)
    r, c = sample_of(x, z, box)
    names = material_names()
    print(f"\nthe ground of tile ({tx},{ty}) built again, the material of the cell under the spot (sample row {r}, col {c}):")
    originals = {(mod, fname): getattr(mod, fname) for _label, mod, fname in STEPS}
    for label, mod, fname in STEPS:
        fn = originals[(mod, fname)]

        def wrapped(*a, _fn=fn, _label=label, **k):
            out = _fn(*a, **k)
            v = int(np.asarray(out)[r, c])
            print(f"  after {_label:11} {names.get(v, v)}")
            return out
        setattr(mod, fname, wrapped)
    try:
        ctx, s = make_obj._ctx, blockworker._s
        depth, _w, _f = water.water_tile(ctx["frame"], s.md, ctx["raw"], tx, ty, make_obj.CELL)
        _P, _UV, groups, _t = ground.build(ctx["frame"], ctx["anc"]["aid"], tx, ty, ctx["g"], s.dem, ctx["anc"]["dem_zoom"],
                                           depth, s.md, make_obj.TEX_SRC, ctx["tex_dir"],
                                           os.path.join(ctx["tex_dir"], "ground.jpg"), print)
    finally:
        for (mod, fname), fn in originals.items():
            setattr(mod, fname, fn)
    print("  physics of the tile's ground: " + ", ".join(f"{k} {len(v) // 2:,} cells" for k, v in sorted(groups.items())))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("x", nargs="?", type=float, help="AC x")
    ap.add_argument("z", nargs="?", type=float, help="AC z")
    ap.add_argument("--route", type=float, help="a route metre instead of x and z")
    a = ap.parse_args()
    tiles = os.path.join(HERE, "out", "tracks", a.track, "tiles")
    if not os.path.exists(os.path.join(tiles, "anchor.json")):
        sys.exit(f"no build of {a.track} in out/tracks (keep the build files, or tools\\from_debug.py)")
    if a.route is not None:
        x, z = route_point(a.track, a.route)
    elif a.x is not None and a.z is not None:
        x, z = a.x, a.z
    else:
        ap.error("AC x and z, or --route")
    with tempfile.TemporaryDirectory() as tex:
        groundcover.make_textures(tex)          # (ground.build paints its texture with them, as make_obj.main)
        roadtex.make_surfaces(tex)
        water.make_textures(os.path.join(tex, "water.png"), os.path.join(tex, "foam.png"))
        make_obj._init_scenery(tiles, tex)
        report_roads(make_obj._ctx["frame"], blockworker._s, x, z)
        report_steps(a.track, x, z)


if __name__ == "__main__":
    main()
