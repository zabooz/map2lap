"""What grows at a spot on a built track and why it looks so: the climate zone, the land cover, the ground painted, the map's areas with
their tags, the trees and bushes by group and by look, and how many of them the tile's cap leaves out. From the track's tiles
(out/tracks/<track>: a build with its files kept) and today's map data cache; the TreeFX trees built from its OBJ part's list.

    .venv\\Scripts\\python.exe tools\\plants.py <track> --route <m>
    .venv\\Scripts\\python.exe tools\\plants.py <track> <AC x> <AC z>

Every share is of all that was counted, its total beside it. WorldCover and the painted ground: the spot's 256 m tile and 50 m around
the spot. OpenStreetMap's own tags (leaf_type, species ...) come only with land_use: Overture's land layer as we keep it has none.
"""
import argparse
import collections
import os
import sys
import tempfile

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
from ground_paint import route_point, tile_of  # noqa: E402  (sets the import paths too)
from track import make_obj, objectlist  # noqa: E402

import blockworker  # noqa: E402
import climate  # noqa: E402
import roads as roadsmod  # noqa: E402
import vegetation  # noqa: E402
from scenery import groundcover, roadtex, trees, water  # noqa: E402

NEAR_CELLS = 25         # cells of 2 m either side: 50 m around the spot
LAND_COVER = {0: "no data", 10: "trees", 20: "shrub", 30: "grass", 40: "crop", 50: "built", 60: "bare", 70: "snow", 80: "water",
              90: "wetland", 95: "mangrove", 100: "moss"}
OSM_TAGS = ("natural", "landuse", "leaf_type", "leaf_cycle", "wood", "trees", "species", "genus", "produce", "crop")


def shares(counts):
    """Text of a Counter: each key's share of all counted, most first, the total at its end. Pure."""
    total = sum(counts.values())
    if not total:
        return "nothing"
    return ", ".join(f"{k} {100 * v / total:.0f} %" for k, v in counts.most_common()) + f" (of {total:,})"


def built_trees(listed):
    """Counter of the TreeFX trees by model a tile's list holds (its OBJ part's side file: objectlist.TileList). Pure."""
    return collections.Counter(tree["model"] for tree in listed.get("treefx", ()))


def areas(frame, md, tx, ty):
    """(Counter of the tile's map areas by layer and class, Counter of their OSM tags)."""
    kinds, tags, seen = collections.Counter(), collections.Counter(), set()
    for key in roadsmod.cells_of_tile(frame, tx, ty, 2.0):
        for layer in ("land_use", "land"):
            f = md.cell(key, layers=(layer,), kind="demand").layers.get(layer)
            if f is None or not len(f) or f.attrs.get("class") is None:
                continue
            for i in range(len(f)):
                if (layer, str(f.ids[i])) in seen:
                    continue
                seen.add((layer, str(f.ids[i])))
                kinds[f"{layer} {f.attrs['class'][i]}"] += 1
                t = groundcover._tags(f.attrs, i)
                tags.update(f"{k}={t[k]}" for k in OSM_TAGS if k in t)
    return kinds, tags


def report(track, x, z):
    """The report for AC (x, z), after make_obj._init_scenery."""
    frame, md, veg = make_obj._ctx["frame"], blockworker._s.md, make_obj._ctx["veg"]
    tx, ty = tile_of(x, z)
    x0, y0 = roadsmod.tile_bbox(tx, ty)[:2]
    la, lo, _ = frame.enu_to_geodetic(np.array([x]), np.array([-z]), 0.0)
    la, lo = float(np.ravel(la)[0]), float(np.ravel(lo)[0])
    print(f"AC ({x:.1f}, {z:.1f}) = lat {la:.6f}, lon {lo:.6f}, tile {tx},{ty}; Koppen class {climate.koppen_at(la, lo)}, "
          f"zone {trees.zone(la, lo)}")
    cover = groundcover.classes(frame, md, tx, ty, 2.0)
    painted = groundcover.materials(frame, md, tx, ty, 2.0)
    j, i = int((-z - y0) // 2), int((x - x0) // 2)
    lo_j, lo_i = max(j - NEAR_CELLS, 0), max(i - NEAR_CELLS, 0)
    for label, grid, name in (("WorldCover", cover, lambda v: LAND_COVER.get(int(v), str(v))), ("ground painted", painted, str)):
        print(f"{label}:")
        print(f"  the tile: {shares(collections.Counter(name(v) for v in grid.ravel()))}")
        print(f"  50 m around: {shares(collections.Counter(name(v) for v in grid[lo_j:j + NEAR_CELLS, lo_i:i + NEAR_CELLS].ravel()))}")
    kinds, tags = areas(frame, md, tx, ty)
    print(f"the map's areas on the tile: {shares(kinds)}")
    print(f"their OSM tags (land_use only): {dict(tags.most_common()) or 'none'}")
    cap = vegetation.TILE_ROWS_MAX
    elev = make_obj._ctx["elev"]        # (the build's heights: high up a conifer can be a larch)
    kept = trees.tile_items(frame, tx, ty, veg, elev)
    vegetation.TILE_ROWS_MAX = 10 ** 9
    try:
        whole = trees.tile_items(frame, tx, ty, veg, elev)
    finally:
        vegetation.TILE_ROWS_MAX = cap
    print(f"the canopy data's items on the tile: {len(kept):,} of {len(whole):,} kept by the cap of {cap:,}")
    print(f"  groups: {shares(collections.Counter(t[0] for t in kept))}")
    if kept:
        h = [t[5] for t in kept]
        print(f"  height p50 / p90: {np.percentile(h, 50):.1f} / {np.percentile(h, 90):.1f} m")
    zone = trees.tile_zone(frame, kept)
    style = {**trees.STYLE, **trees.ZONE_STYLE.get(zone, {})}
    print(f"  sprites in zone {zone}: "
          + shares(collections.Counter(trees.look_of(style, n, zone, zc, r)[0] for n, _x, _y, zc, _yaw, _h, r in kept if n not in trees.SKIP)))
    part = os.path.join(HERE, "out", "tracks", track, "obj", "parts", f"t_{tx}_{ty}.obj")
    if os.path.exists(part):
        print(f"built on the tile: {shares(built_trees(objectlist.load_side(part)))}")
    else:
        print("built on the tile: no OBJ part")


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
        groundcover.make_textures(tex)
        roadtex.make_surfaces(tex)
        water.make_textures(os.path.join(tex, "water.png"), os.path.join(tex, "foam.png"))
        make_obj._init_scenery(tiles, tex)
        report(a.track, x, z)


if __name__ == "__main__":
    main()
