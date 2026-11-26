"""Adaptive road grids on the same geometry used by the builder and AI line."""
import tempfile
import unittest
from unittest.mock import patch

import numpy as np

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_start_positions import circuit, circuit_roads, positions, strip
from track import aicorridor, editorinfo, fastlane, obj_to_kn5, startgrid


def stage(half, *, rear=0, widen=False, centre=50, extra=None, junctions=None):
    road = {"1ROAD_centre": strip(centre - half, centre + half), **(extra or {})}
    if widen:
        mat, p, uv, faces = strip(46, 54)
        p[:2, 0] = [100, 700]
        p[2:, 0] = [700, 100]
        road["1ROAD_wide"] = mat, p, uv, faces
    route = [[rear, 50], [400, 50]]
    anchor = {"route": route, "timing": {"start_m": 170-rear, "finish_m": 350-rear}}
    messages = []
    nodes, _ = obj_to_kn5.start_empties(road, anchor, messages.append, junctions=junctions)
    return positions(nodes), messages, {n.name:n.matrix for n in nodes}


class AdaptiveGridTest(unittest.TestCase):
    def test_wide_road_two_columns_with_central_ai_approach(self):
        p, messages, markers = stage(4)
        self.assertEqual(sum(k.startswith("AC_START_") for k in p), 20)
        self.assertIn("Starting grid: 20 slots", messages)
        starts = np.array([p[f"AC_START_{i}"] for i in range(20)])
        np.testing.assert_allclose(starts[:, 0], 170 - 4 - 8 * np.arange(20))
        np.testing.assert_allclose(fastlane._grid(markers)[:, 12], starts[::-1, 0])
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

    def test_width_sets_alternating_offsets_at_every_station(self):
        for width, offset in [(12, 2.433333), (8, 1.766667), (6, 1.433333), (5, 1.2),
                              (4, .7), (2.6, 0), (2.5, 0)]:
            with self.subTest(width=width):
                points, _, _ = stage(width / 2)
                for i in range(20):
                    x, _, z = points[f"AC_START_{i}"]
                    self.assertAlmostEqual(x, 166 - 8 * i)
                    self.assertAlmostEqual(z, -50 - (-1)**i * offset, places=5)

    def test_off_centre_route_uses_built_midpoint_and_keeps_the_ai_guide(self):
        p, _, _ = stage(4, centre=52)
        for i in (0, 1):
            self.assertAlmostEqual(p[f"AC_START_{i}"][2], -52 - (-1)**i * 10.6 / 6)
            self.assertEqual(p[f"M2_GRID_{i}"][2], -50)

    def test_width_change_is_measured_at_each_slot(self):
        p, _, _ = stage(2, widen=True)
        self.assertAlmostEqual(p["AC_START_0"][2], -50 - 10.6 / 6)
        self.assertAlmostEqual(p["AC_START_19"][2], -50 + .7)

    def test_wall_moves_only_the_blocked_side_to_the_road_midpoint(self):
        wall = np.array([[0, 4, -54], [400, 4, -54], [400, 6, -54], [0, 6, -54]])
        p, _, _ = stage(4, centre=52, extra={"1WALL_side": (None, wall, None, strip(0, 1)[3])})
        for i in range(20):
            self.assertAlmostEqual(p[f"AC_START_{i}"][2], -52 + (10.6 / 6 if i % 2 else 0))

    def test_deck_edges_bound_slots_over_wider_coplanar_ground(self):
        p, _, _ = stage(12, extra={"1ROAD_deck_a": strip(48, 54)})
        self.assertAlmostEqual(p["AC_START_0"][2], -51 - 8.6 / 6)

    def test_ground_paint_bounds_the_road_across_tiles_on_a_wider_collision_floor(self):
        with tempfile.TemporaryDirectory() as folder:
            parts = []
            for ty in (0, 1):
                part = Path(folder) / f"t_0_{ty}.obj"
                paint = editorinfo.Paint(str(part), 0, ty, 256)
                # The carriageway covers northings 253..261, crossing the tile boundary at 256.
                mask = np.zeros((256, 256), np.uint8)
                if ty == 0:
                    mask[:3] = 255
                else:
                    mask[-5:] = 255
                paint.layer("road_asphalt", mask, road_class="main")
                paint.finish()
                parts.append(part)
            road = {"1ROAD_ground_0_0": strip(240, 280), "1ROAD_deck_nearby": strip(278, 280)}
            points, _ = obj_to_kn5.start_empties(road, {"route": [[0, 255], [400, 255]],
                                 "timing": {"start_m": 170, "finish_m": 350}}, parts=parts)
            p = positions(points)
            for i in (0, 1):
                self.assertAlmostEqual(p[f"AC_START_{i}"][2], -257 - (-1)**i * 10.6 / 6, delta=.07)

    def test_paint_just_inside_negative_tile_edge_uses_its_last_pixel(self):
        with tempfile.TemporaryDirectory() as folder:
            part = Path(folder) / "t_-1_-1.obj"
            paint = editorinfo.Paint(str(part), -1, -1, 4)
            mask = np.zeros((4, 4), np.uint8)
            mask[0, -1] = 255
            paint.layer("road_gravel", mask, road_class="gravel")
            paint.finish()
            sample = editorinfo.road_paint([part], self.fail)
            np.testing.assert_array_equal(sample(np.array([[-1.e-15, 1.e-15]])), [1])

    def test_cross_section_through_a_second_junction_arm_uses_the_route_line(self):
        road = np.array([[0., -50.], [159., -50.], [400., -50.]])
        branch = np.array([[159., -50.], [180., -100.]])
        junctions = obj_to_kn5._junction_geometry([(road, 8.), (branch, 8.)])
        grid_road = fastlane._local_roads({"1ROAD_test": strip(10, 90)})
        xy = np.array([[0., 50.], [400., 50.]])
        slots, _, _ = startgrid.layout(grid_road, xy, [0., 400.], 170., 0., junctions=junctions)
        # At x=166 the transverse slice continues down the branch, beyond the actual road edge.
        np.testing.assert_allclose(slots[0][0], [166., 4., -50.])

    def test_open_deck_span_keeps_spawn_on_route(self):
        with patch.object(aicorridor, "built_span", return_value=(-np.inf, 4)):
            p, _, _ = stage(4, centre=52, extra={"1ROAD_deck_a": strip(48, 54)})
        self.assertEqual(p["AC_START_0"][2], -50)

    def test_junction_near_pole_leaves_a_contiguous_grid_behind_it(self):
        junctions = np.array([[150., -50., 4.**2]]), np.empty((0, 6))
        p, _, _ = stage(4, junctions=junctions)
        self.assertEqual(p["AC_AB_START_L"][0], 170)
        self.assertEqual(p["AC_START_0"][0], 142)
        self.assertAlmostEqual(p["AC_START_0"][2], -50 - 10.6 / 6)
        self.assertEqual(p["AC_START_1"][0], 134)

    def test_end_of_approach_limits_grid_without_moving_start(self):
        p, messages, _ = stage(2, rear=125)
        self.assertEqual(p["AC_AB_START_L"][0],170)
        self.assertEqual(sum(k.startswith("AC_START_") for k in p), 6)
        self.assertRegex(" ".join(messages), r"6 slots.*end of approach")

    def test_saved_circuit_line_survives_a_shorter_grid_before_a_junction(self):
        anchor = circuit(line_m=0.)
        junctions = np.array([[119., -50., 7.**2]]), np.empty((0, 6))
        nodes, _, line = obj_to_kn5.circuit_empties(circuit_roads(anchor, width=8), anchor, junctions=junctions)
        self.assertEqual(line, 0.)
        self.assertEqual(sum(n.name.startswith("AC_START_") for n in nodes), 3)

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
