"""Horizon mode (docs/V1_4_SPEC.md §3.6 "Radius: the real line-of-sight horizon", milestone M1h;
earthd --horizon, off by default): the horizon distances with refraction, the per-anchor zmax grid
(a coarse DEM pass, never below the DEM's pixels), RADIUS = clamp(sqrt(2R'h_eye) + sqrt(2R'zmax_region),
80 km, 1500 km), the disc selection with L10 roots and the per-tile horizon cull (the selection tiles
the disc minus the culled nodes exactly once), the scratchpad viewshed numbers (Whitney summit, eye
4417 m: San Gorgonio, 306 km away, stays; sea-level ground past the horizon goes), the number of
extra tiles, the near field (< 80 km) and its demand unchanged, and the server's eye, textures,
zooms and flags.

The synthetic terrain is sea level with cones at Mount Whitney (the anchor, 4415 m) and San
Gorgonio (3342 m, the scratchpad `viewshed.py` z7 value), or the real DEM's numbers checked
offline (2026-10-10, z6, Whitney summit: radius 503 km, zmax 4217 m, 83 tiles beyond 80 km; Central
Valley floor 289 km; open ocean 80 km; recorded in docs/V1_4_SPEC.md §3.6 implementation notes).
"""
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import dem as demmod  # noqa: E402
import farfield as ff  # noqa: E402
import geodesy as g  # noqa: E402

WHITNEY = (36.5785, -118.2923)          # the anchor (the mod's default start)
SAN_GORGONIO = (34.0991, -116.8250)     # 3506 m summit; 3342 m in the z7 DEM the viewshed used
EYE_WHITNEY = 4417.0                    # summit + 1.7 m (spec §3.6)
FRAME = g.EnuFrame(*WHITNEY)
SG_XY = tuple(float(v) for v in FRAME.geodetic_to_enu(*SAN_GORGONIO, 0.0)[:2])
LAY64 = ff.Layout(64)






WHITNEY_CONE = ((0.0, 0.0), 4415.0, 20000.0)
SG_CONE = (SG_XY, 3342.0, 15000.0)
_GRIDS = {}















class HorizonGridTest(unittest.TestCase):




    def test_dem_block_max(self):
        """dem.Dem.block_max: the max of each block x block pixel square of a tile (row 0 north)."""
        with tempfile.TemporaryDirectory() as tmp:
            d = demmod.Dem(tmp)
            try:
                tile = np.arange(512 * 512, dtype=np.float32).reshape(512, 512)
                d._lru[(6, 10, 20)] = tile              # in memory: no download
                bm = d.block_max(6, 10, 20, 8)
                self.assertEqual(bm.shape, (64, 64))
                self.assertEqual(bm[0, 0], tile[7, 7])
                self.assertEqual(bm[63, 63], tile[511, 511])
                self.assertEqual(bm[2, 5], tile[23, 47])
            finally:
                d.pool.shutdown()



class DiscSelectionTest(unittest.TestCase):


    def test_square_default_is_unchanged(self):
        """disc / horizon off: the v1.3.1 square (the arguments' defaults change nothing)."""
        a = ff.select(1234.0, -777.0, (), frozenset(), min_level=-2)
        b = ff.select(1234.0, -777.0, (), frozenset(), min_level=-2, disc=False, horizon=None)
        self.assertEqual(a, b)
        corner = [t for t in a[0].values() if t.distance(1234.0, -777.0) > ff.RADIUS]
        self.assertTrue(corner)                         # the square's corners (a disc has none)
        self.assertTrue(all(t.level <= ff.MAX_LEVEL for t in a[0].values()))






if __name__ == "__main__":
    unittest.main()
