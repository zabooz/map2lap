"""The 'detail' near-visual mode: the mesh layout (64 cells, the 512² block) with the
physics block drawn as the near ground. The server forces L-1 tiles under the block (their 128 m edges
meet the block's 128 m-grid edges), gives them sinks, and writes the block's aerial photo (BASE_PX²,
the block's footprint) next to its heightmap; terrain messages name it (base, baseSize)."""
import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import farfield as ff  # noqa: E402
import geodesy  # noqa: E402

LAT, LON = 36.5785, -118.2923
LAYOUT = ff.Layout(64, 512, True)


class FakeDem:
    def sample(self, lat, lon, zoom, progress=None):
        if progress:
            progress(1, 1)
        return 1500 + 300 * np.sin(np.asarray(lat) * 90) * np.cos(np.asarray(lon) * 70)

    def stats_snapshot(self):
        return {}


class SelectTest(unittest.TestCase):
    def test_forced_level_minus_one(self):
        """A 512² block centred off the 256 m grid: with forced_level -1 no tile coarser than L-1 overlaps it,
        so every tile under it lies wholly inside (covered) or wholly outside."""
        block = ff.Block(128.0, -128.0, 512).bbox                       # [-384, -640, 640, 384]
        tiles, _ = ff.select(2000.0, 2000.0, [block], min_level=LAYOUT.min_level, layout=LAYOUT, forced_level=-1)
        under = [t for t in tiles.values() if ff.overlaps(t.bbox, block)]
        self.assertTrue(under)
        self.assertEqual({t.level for t in under}, {-1})
        for t in under:
            x0, y0, x1, y1 = t.bbox
            self.assertTrue(x0 >= block[0] and y0 >= block[1] and x1 <= block[2] and y1 <= block[3]
                            or x1 <= block[0] or x0 >= block[2] or y1 <= block[1] or y0 >= block[3])
        # L0 forcing (terrain mode) leaves 256 m tiles straddling this block's edges
        tiles0, _ = ff.select(2000.0, 2000.0, [block], min_level=LAYOUT.min_level, layout=LAYOUT)
        self.assertTrue(any(ff.overlaps(t.bbox, block) and t.level == 0 for t in tiles0.values()))

    def test_sink_on_l_minus_one(self):
        frame = geodesy.EnuFrame(LAT, LON)
        b = ff.build_tile(frame, FakeDem(), ff.Tile(-1, 0, 0), 15, 1 / 64, with_sink=True, layout=LAYOUT)
        self.assertIsNotNone(b.sink)
        self.assertGreaterEqual(b.sink, ff.SINK_MARGIN)     # the exact level: its vertices are the lattice
        self.assertLess(b.sink, ff.SINK_MARGIN + 0.05)
        b2 = ff.build_tile(frame, FakeDem(), ff.Tile(-1, 0, 0), 15, 1 / 64, with_sink=False, layout=LAYOUT)
        self.assertIsNone(b2.sink)













if __name__ == "__main__":
    unittest.main()
