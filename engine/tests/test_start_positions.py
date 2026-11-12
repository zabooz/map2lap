"""Native AC grid, pit and hotlap spawns follow the actual point-to-point start gate."""
import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src")))
import generator  # noqa: E402,F401  (sets the engine's import path)
from track import obj_to_kn5  # noqa: E402


def road():
    """A sloping drivable plane covering east- and north-going test routes. Pure."""
    p = np.array([[0, 10, 0], [400, 30, 0], [400, 30, -400], [0, 10, -400]], float)
    return {"1ROAD_ground_0_0": ("road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}


def positions(nodes):
    """AC matrix-node positions by name. Pure."""
    return {n.name: np.asarray(n.matrix[12:15]) for n in nodes}


class StartPositionsTest(unittest.TestCase):
    def test_grid_pits_and_hotlap_are_just_before_native_start(self):
        anchor = {"route": [[0, 0], [400, 0]], "timing": {"start_m": 100, "finish_m": 350}}
        nodes, base = obj_to_kn5.start_empties(road(), anchor)
        p = positions(nodes)
        for k in range(4):
            expected = [97 - 8 * k, 10 + .05 * (97 - 8 * k) + obj_to_kn5.START_LIFT, 0]
            np.testing.assert_allclose(p[f"AC_START_{k}"], expected)
            np.testing.assert_allclose(p[f"AC_PIT_{k}"], expected)
        np.testing.assert_allclose(p["AC_HOTLAP_START_0"], p["AC_START_0"])
        np.testing.assert_allclose(base, p["AC_START_0"])
        self.assertAlmostEqual((p["AC_AB_START_L"][0] + p["AC_AB_START_R"][0]) / 2, 100)
        self.assertAlmostEqual((p["AC_AB_FINISH_L"][0] + p["AC_AB_FINISH_R"][0]) / 2, 350)
        self.assertNotIn("AC_TIME_0_L", p)

    def test_actual_visible_gate_wins_over_original_start_distance(self):
        timing = {"start_m": 100, "finish_m": 350, "gates": {
            "start": {"pos": [130, 16.5, 0], "fwd": [1, 0, 0], "left": 6, "right": 4},
            "finish": {"pos": [350, 27.5, 0], "fwd": [1, 0, 0], "left": 6, "right": 4}}}
        nodes, _ = obj_to_kn5.start_empties(road(), {"route": [[0, 0], [400, 0]], "timing": timing})
        self.assertAlmostEqual(positions(nodes)["AC_START_0"][0], 127)

    def test_grid_follows_a_bend_before_the_start(self):
        anchor = {"route": [[0, 0], [60, 0], [60, 300]], "timing": {"start_m": 70, "finish_m": 300}}
        nodes, _ = obj_to_kn5.start_empties(road(), anchor)
        p = positions(nodes)
        for k, (x, z) in enumerate([(60, -7), (59, 0), (51, 0), (43, 0)]):
            np.testing.assert_allclose(p[f"AC_START_{k}"][[0, 2]], [x, z])

    def test_grid_cannot_be_placed_beyond_start_when_road_is_missing(self):
        p = np.array([[95, 10, -5], [400, 10, -5], [400, 10, 5], [95, 10, 5]], float)
        objs = {"1ROAD_ground_0_0": ("road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}
        anchor = {"route": [[0, 0], [400, 0]], "timing": {"start_m": 100, "finish_m": 350}}
        with self.assertRaisesRegex(RuntimeError, "before.*start"):
            obj_to_kn5.start_empties(objs, anchor)

    def test_route_without_stage_timing_keeps_its_original_grid(self):
        nodes, base = obj_to_kn5.start_empties(road(), {"route": [[0, 0], [400, 0]]})
        self.assertAlmostEqual(base[0], 26)
        self.assertIn("AC_TIME_0_L", positions(nodes))


if __name__ == "__main__":
    unittest.main()
