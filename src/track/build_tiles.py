"""Step 1: build road, sidewalk, bridge and building tiles with BeamNG.Earth's own code.

Uses blockworker._roads_tile without the game and without the earthd server. Output: per 256 m tile a
roads_<aid>_<tx>_<ty>.json plus the .cdae meshes in OUT_DIR.

    python -m track.build_tiles --lat 46.6624 --lon 14.6345 --radius 256
"""
import argparse
import json
import os
import sys
import time

from app.paths import ROOT, SERVER, SRC
sys.path.insert(0, SERVER)
if SRC not in sys.path:         # (after the chdir Python would no longer find our packages through "")
    sys.path.insert(1, SRC)
os.chdir(SERVER)                # (earthfast.pyd and the server's relative paths)

import blockworker          # noqa: E402
import roads as roadsmod    # noqa: E402

AID = 1
DEM_ZOOM = 16               # lidar up to z16 (~0.8 m)

# BeamNG.Earth's default: roads painted into the terrain (roads.ROADS_IN_GROUND, terrain_paint), the terrain is built
# by ground.py like BeamNG.Earth's terrain block. (Until 29.10. switched off here with asphalt as a mesh: BeamNG.Earth's
# old mode with asphalt walls on steep slopes, GitHub #135, zigzags and holes at the seams.)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lat", type=float, required=True)
    ap.add_argument("--lon", type=float, required=True)
    ap.add_argument("--radius", type=float, default=256.0, help="m around the centre (square)")
    ap.add_argument("--out", default=os.path.join(ROOT, "out", "tiles"))
    ap.add_argument("--cache", default=os.path.join(ROOT, "cache"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    blockworker._s = blockworker._State(a.cache, offline=False, roads=True, grading=True, road_widths=True,
                                        surface=True)
    tiles = sorted(roadsmod.tiles_near(0.0, 0.0, a.radius - 1e-6))
    print(f"{len(tiles)} tiles, anchor {a.lat}, {a.lon}", flush=True)
    done = []
    for i, (tx, ty) in enumerate(tiles, 1):
        t0 = time.perf_counter()
        blockworker._roads_tile(AID, a.lat, a.lon, DEM_ZOOM, tx, ty, a.out, "tiles", sidewalks=True, lift=0.0,
                                buildings=True, left_hand=False, mph=False, q=None, gas_stations=False)
        done.append([tx, ty])
        print(f"[{i}/{len(tiles)}] tile {tx},{ty}: {time.perf_counter() - t0:.1f} s", flush=True)
    with open(os.path.join(a.out, "anchor.json"), "w", encoding="utf-8") as f:
        json.dump({"lat": a.lat, "lon": a.lon, "aid": AID, "dem_zoom": DEM_ZOOM, "radius": a.radius,
                   "tiles": done}, f, indent=1)


if __name__ == "__main__":
    main()
