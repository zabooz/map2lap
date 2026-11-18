"""The Editor's shared road query: one mapped split per road, click levels and heights from the road's own faces."""
import sys
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import builtroad, roadregion
from test_roadregion import road


def _deck(owner, x0, x1, z0, z1, y):
    """One flat two-triangle deck entry of builtroad.decks() with a single owner. Pure."""
    a, b, c, d = [x0, y, z0], [x1, y, z0], [x0, y, z1], [x1, y, z1]
    triangles = np.array([[a, c, b], [b, c, d]], np.float64)
    return triangles, triangles[:, :, [0, 2]].min(axis=1), triangles[:, :, [0, 2]].max(axis=1), np.array([owner, owner])


class TileRangesTest(unittest.TestCase):
    def test_disagreeing_tile_ranges_make_one_split_from_the_tile_holding_the_bridge(self):
        # A2 Völkermarkt: a far tile reckoned a shorter bridge than the tile that built it. Both splits
        # together forked the motorway at the far tile's bridge end ("A side road joins inside this bend").
        built, far = road("m", [[0, 0], [100, 0], [200, 0]]), road("m", [[0, 0], [100, 0], [200, 0]])
        built["level_ranges"] = [[.30, .70, "bridge"]]   # middle x=100, z=0: tile 0_0
        far["level_ranges"] = [[.35, .65, "bridge"]]
        features = roadregion.merged_roads({"0_0": [built], "5_5": [far]})
        self.assertEqual([[.30, .70, "bridge"]], [f["level_ranges"] for f in features][0])
        net = roadregion.network(features, [[10, 0], [190, 0]])
        self.assertEqual([], net["held_junctions"])
        self.assertAlmostEqual(180, net["length"])


class ClickLevelTest(unittest.TestCase):
    def _level(self, y, deck_y=27.14, ground_y=27.07):
        # Perth: without elevation data a deck lies 7 cm over the road it crosses.
        upper = road("upper", [[0, -20], [0, 20]])
        upper["tags"]["bridge"] = "yes"
        data = roadregion._graph([upper, road("lower", [[-20, 0], [20, 0]])])
        found = [_deck("upper", -4, 4, -20, 20, deck_y)]
        with (mock.patch.object(builtroad, "decks", return_value=found),
              mock.patch.object(builtroad.trackband, "_ground", return_value=(np.full((3, 3), ground_y), -1, -1))):
            return builtroad._click_level(None, {"meshes": []}, data, [1, 1, y])

    def test_a_click_on_a_flat_deck_picks_its_own_road(self):
        self.assertEqual((("upper",), True), self._level(27.15))

    def test_a_click_beside_the_deck_picks_the_ground_roads(self):
        self.assertEqual((("lower",), False), self._level(27.11, deck_y=40.0))

    def test_a_click_matching_no_built_level_falls_back_to_distance(self):
        self.assertIsNone(self._level(35.0))


class HeightsTest(unittest.TestCase):
    def _heights(self, points, found, ground=446.4):
        net = {"segments": [{"a": [0, 0], "b": [40, 0], "width": 10, "road": "mine", "structure": "bridge"}]}
        with (mock.patch.object(builtroad, "decks", return_value=found),
              mock.patch.object(builtroad.trackband, "_ground", return_value=(np.full((60, 60), ground), -10, -10))):
            return builtroad.heights(None, {"meshes": []}, None, net, np.asarray(points, np.float64))

    def test_a_point_beside_a_skewed_deck_end_reads_its_own_deck(self):
        # The deck reaches 0.3 m past the point's mapped side; the terrain under it is 8 m lower.
        y, on_deck = self._heights([[5, 4.8]], [_deck("mine", 0, 40, -4.5, 4.5, 454.0)])
        self.assertTrue(on_deck[0])
        self.assertAlmostEqual(454.01, float(y[0]), places=3)

    def test_another_roads_deck_never_gives_this_road_its_height(self):
        y, on_deck = self._heights([[5, 0]], [_deck("other", 0, 40, -5, 5, 454.0)])
        self.assertFalse(on_deck[0])
        self.assertAlmostEqual(446.4, float(y[0]))

    def test_a_long_stretch_without_surface_is_refused(self):
        points = np.c_[np.arange(0, 12.0), np.zeros(12)]
        values = np.r_[1.0, np.full(10, np.nan), 1.0]
        with self.assertRaisesRegex(builtroad.trackband.Refused, "no surface"):
            builtroad.filled(points, values)
        np.testing.assert_allclose(builtroad.filled(points[:5], [1, np.nan, np.nan, np.nan, 2]), [1, 1.25, 1.5, 1.75, 2])


if __name__ == "__main__":
    unittest.main()
