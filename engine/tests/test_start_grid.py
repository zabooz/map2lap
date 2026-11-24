"""Adaptive road grids on the same geometry used by the builder and AI line."""
import unittest

import numpy as np

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_start_positions import circuit_roads, positions, strip
from track import fastlane, obj_to_kn5


def stage(half, *, rear=0, widen=False):
    road = {"1ROAD_centre": strip(50 - half, 50 + half)}
    if widen:
        mat, p, uv, faces = strip(46, 54)
        p[:2, 0] = [100, 700]
        p[2:, 0] = [700, 100]
        road["1ROAD_wide"] = mat, p, uv, faces
    route = [[rear, 50], [400, 50]]
    anchor = {"route": route, "timing": {"start_m": 170-rear, "finish_m": 350-rear}}
    messages = []
    nodes, _ = obj_to_kn5.start_empties(road, anchor, messages.append)
    return positions(nodes), messages, {n.name:n.matrix for n in nodes}


class AdaptiveGridTest(unittest.TestCase):
    def test_wide_road_two_columns_with_central_ai_approach(self):
        p, _, markers = stage(4)
        self.assertEqual(sum(k.startswith("AC_START_") for k in p), 20)
        self.assertGreater(abs(p["AC_START_0"][2]-p["AC_START_1"][2]), 2)
        self.assertGreater(p["AC_START_0"][0], p["AC_START_1"][0])
        self.assertTrue(np.allclose(fastlane._grid(markers)[:, 14], -50))
        road = fastlane._local_roads({"1ROAD_centre": strip(46, 54)})
        _, path, _ = fastlane._sample([[170, -50], [400, -50]], markers, False, road)
        grid_zone = path[path[:, 0] <= 170]
        self.assertLess(grid_zone[0, 0], p["AC_START_19"][0])
        np.testing.assert_allclose(grid_zone[:, 1], -50)
        for i in range(20):
            np.testing.assert_array_equal(p[f"AC_PIT_{i}"],p[f"AC_START_{i}"])

    def test_circuit_grid_behind_a_junction_stays_locked_to_its_actual_rear(self):
        path = np.array([[250, -50], [400, -50], [400, -70], [10, -70], [10, -50], [250, -50]])
        road = fastlane._local_roads({"1ROAD_test": strip(40, 80)})
        markers = {name: obj_to_kn5.empty(name, position, [1, 0, 0]).matrix for name, position in (
            ("AC_TIME_0_L", [250, 4, -55]), ("AC_TIME_0_R", [250, 4, -45]),
            ("M2_GRID_0", [55, 4, -50]), ("M2_GRID_1", [47, 4, -50]))}
        _, xz, _, ribbon = fastlane._sample(path, markers, True, road, ownership=True)
        approach = (xz[:, 1] == -50) & (xz[:, 0] > 60) & (xz[:, 0] < 245)
        self.assertTrue(approach.any())
        self.assertTrue(ribbon.hard[approach].all())

    def test_narrow_road_keeps_single_file(self):
        p, _, _ = stage(2)
        self.assertEqual([v[2] for k,v in p.items() if k.startswith("AC_START_")], [-50]*20)

    def test_width_change_uses_both_layouts(self):
        p, _, _ = stage(2, widen=True)
        z = [v[2] for k,v in p.items() if k.startswith("AC_START_")]
        self.assertEqual(len(z), 20)
        self.assertNotEqual(z[0], -50)
        self.assertEqual(z[-1], -50)

    def test_end_of_approach_limits_grid_without_moving_start(self):
        p, messages, _ = stage(2, rear=125)
        self.assertEqual(p["AC_AB_START_L"][0],170)
        self.assertEqual(sum(k.startswith("AC_START_") for k in p), 6)
        self.assertRegex(" ".join(messages), r"6 slots.*end of approach")

    def test_short_circuit_uses_available_lap(self):
        angles = np.linspace(0, 2*np.pi, 65)
        circle = np.column_stack((15*np.cos(angles), 15*np.sin(angles)))
        circle[-1] = circle[0]
        anchor = {"route":circle.tolist(),
                  "timing":{"start_m":0, "twice":[]}}
        messages=[]
        nodes, _, _ = obj_to_kn5.circuit_empties(circuit_roads(anchor,width=4),anchor,messages.append)
        count=sum(n.name.startswith("AC_START_") for n in nodes)
        self.assertGreaterEqual(count,6)
        self.assertLess(count,20)
        self.assertIn("lap length"," ".join(messages))
