"""A road crossing water with no bridge stays drivable: the terrain under it isn't lowered (scenery.water.off_roads)."""
import os
import sys
import unittest
from types import SimpleNamespace

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.join(ENGINE, "..", "src"))

from scenery import water  # noqa: E402


def plan(xy, half=8.0, road_half=3.0, tunnel=False, under=(False, False)):
    return SimpleNamespace(xy=np.asarray(xy, np.float64), half=half, road_half=road_half, tunnel=tunnel, under=under)


class OffRoadsTest(unittest.TestCase):
    def setUp(self):
        # 2 m vertices over 40 m, all under water, 6 m lowered; the road runs along y = 20
        self.gx, self.gy = np.meshgrid(np.arange(0.0, 41.0, 2.0), np.arange(0.0, 41.0, 2.0))
        self.depth = np.full(self.gx.shape, 6.0)
        self.road = [[-10.0, 20.0], [50.0, 20.0]]

    def at(self, out, x, y):
        return out[int(y / 2), int(x / 2)]

    def test_a_road_across_water_keeps_its_carriageway_and_one_cell(self):
        out = water.off_roads(self.depth, self.gx, self.gy, [plan(self.road)])
        self.assertEqual(self.at(out, 20, 20), 0.0)     # on the line
        self.assertEqual(self.at(out, 20, 24), 0.0)     # (3 m of carriageway, 2 m of cell: 5 m)
        self.assertEqual(self.at(out, 20, 26), 6.0)     # the water beside it

    def test_the_verge_a_plan_blends_over_is_lowered(self):
        self.assertEqual(self.at(water.off_roads(self.depth, self.gx, self.gy, [plan(self.road, half=12.0)]), 20, 28), 6.0)

    def test_the_water_under_a_bridge_stays_lowered(self):
        ends = [plan([[-10.0, 20.0], [10.0, 20.0]]), plan([[30.0, 20.0], [50.0, 20.0]])]    # (no plan over the span)
        out = water.off_roads(self.depth, self.gx, self.gy, ends)
        self.assertEqual(self.at(out, 20, 20), 6.0)
        self.assertEqual(self.at(out, 8, 20), 0.0)

    def test_a_plans_way_on_under_its_deck_is_not_the_road(self):
        p = plan([[-10.0, 20.0], [10.0, 20.0], [16.0, 20.0]], under=(False, True))
        out = water.off_roads(self.depth, self.gx, self.gy, [p])
        self.assertEqual(self.at(out, 16, 20), 6.0)
        self.assertEqual(self.at(out, 8, 20), 0.0)

    def test_a_tunnel_under_the_water_is_not_kept(self):
        out = water.off_roads(self.depth, self.gx, self.gy, [plan(self.road, tunnel=True)])
        self.assertEqual(self.at(out, 20, 20), 6.0)

    def test_dry_ground_and_no_roads_change_nothing(self):
        dry = np.zeros(self.gx.shape)
        np.testing.assert_array_equal(water.off_roads(dry, self.gx, self.gy, [plan(self.road)]), dry)
        np.testing.assert_array_equal(water.off_roads(self.depth, self.gx, self.gy, []), self.depth)

    def test_the_input_is_left_as_it_was(self):
        water.off_roads(self.depth, self.gx, self.gy, [plan(self.road)])
        self.assertEqual(self.at(self.depth, 20, 20), 6.0)


if __name__ == "__main__":
    unittest.main()
