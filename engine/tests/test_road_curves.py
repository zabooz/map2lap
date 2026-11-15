"""Shared road curves: smooth bends without moving junctions or level boundaries."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import roads
from test_roads import features, M_LAT, M_LON


class RoadCurveTest(unittest.TestCase):
    def test_ground_bend_is_curved_and_bounded(self):
        f = features([[(0, 0), (20, 0), (40, 10)]], ["secondary"], widths=[(0, 6)])
        raw = f.parts(0)[0][0]
        line = roads.ground_parts(f, 0)[0]
        self.assertGreater(len(line), len(raw), "the shared road line must contain the spline")
        np.testing.assert_array_equal(line[[0, -1]], raw[[0, -1]])
        xy = (line - raw[0]) * [M_LON, M_LAT]
        d = np.diff(xy, axis=0)
        headings = np.unwrap(np.arctan2(d[:, 1], d[:, 0]))
        self.assertLess(np.max(np.abs(np.diff(headings))), np.radians(6))
        # A width-limited curve stays within 10% of the carriageway width of the mapped line.
        import fast
        dist = fast._ef.polyline_dist((raw - raw[0]) * [M_LON, M_LAT], xy)
        self.assertLessEqual(float(np.max(dist)), 0.6 + 1e-6)
        np.testing.assert_array_equal(f.parts(0)[0][0], raw, "raw map data stays intact")

    def test_junction_vertex_stays_at_its_mapped_position(self):
        f = features([[(0, 0), (20, 0), (40, 10)], [(20, 0), (20, -20)]], ["secondary"] * 2)
        join = f.parts(1)[0][0][0]
        self.assertTrue(np.any(np.all(roads.ground_parts(f, 0)[0] == join, axis=1)))

    def test_level_boundaries_stay_at_the_original_fraction(self):
        f = features([[(0, 0), (20, 0), (40, 10), (60, 10)]], ["secondary"],
                     flags=[(0, "is_bridge", 0.3, 0.7)])
        raw = f.parts(0)[0][0]
        ground = roads.ground_parts(f, 0)
        bridge = roads.bridge_parts(f, 0)[0]
        a, b, _ = roads.level_ranges(f, 0)[0]
        expected = roads.sub_polyline(raw, a, b)
        np.testing.assert_array_equal(bridge[[0, -1]], expected[[0, -1]])
        np.testing.assert_array_equal(ground[0][-1], bridge[0])
        np.testing.assert_array_equal(ground[-1][0], bridge[-1])
        self.assertGreater(len(bridge), len(expected))

    def test_straights_and_rail_geometry_are_unchanged(self):
        for pts, subtype in [([(0, 0), (20, 0), (40, 0)], "road"),
                             ([(0, 0), (20, 0), (40, 10)], "rail")]:
            f = features([pts], ["secondary"], subtypes=[subtype])
            np.testing.assert_array_equal(roads.ground_parts(f, 0)[0], f.parts(0)[0][0])

    def test_rendered_paint_keeps_the_curve(self):
        import fast
        import roadmesh
        f = features([[(0, 0), (20, 0), (40, 10)]], ["secondary"])
        raw = roads.ground_parts(f, 0)[0]
        xy = (raw - raw[0]) * [M_LON, M_LAT]
        pts = roads.simplify(np.c_[xy, np.zeros(len(xy))])
        left, right, *_ = roadmesh.ribbons([{"n": pts, "w": 0.12, "m": "line_white"}])[0]
        mid = np.ascontiguousarray((left + right) / 2)
        self.assertLess(np.max(fast._ef.polyline_dist(mid, xy)), 0.02,
                        "simplification and mesh sampling must not put the corners back into narrow paint")

    def test_native_curve_is_reversible_and_inside_the_map_bounds(self):
        import fast
        xy = np.array([[0., 0.], [20., 0.], [40., 10.], [60., 0.]])
        pins = np.zeros(len(xy), np.uint8)
        for deviation in (0.2, 0.75):
            curve = fast._ef.road_curve(xy, pins, deviation)
            back = fast._ef.road_curve(xy[::-1].copy(), pins, deviation)[::-1]
            np.testing.assert_allclose(curve, back, atol=1e-12)
            self.assertTrue(np.all(curve >= xy.min(0) - 1e-12))
            self.assertTrue(np.all(curve <= xy.max(0) + 1e-12))
            self.assertLessEqual(float(np.max(fast._ef.polyline_dist(xy, curve))), deviation)

    def test_native_degenerate_and_sharp_lines_stay_safe(self):
        import fast
        for points in ([], [[0., 0.]], [[0., 0.], [0., 0.]],
                       [[0., 0.], [20., 0.], [20., 20.]],
                       [[0., 0.], [20., 0.], [0., 0.]]):
            xy = np.array(points, np.float64).reshape(-1, 2)
            curve = fast._ef.road_curve(xy, np.zeros(len(xy), np.uint8), 0.5)
            self.assertTrue(np.isfinite(curve).all())
            if len(xy):
                np.testing.assert_array_equal(curve[[0, -1]], xy[[0, -1]])
            self.assertLessEqual(len(curve), len(xy))
        with self.assertRaises(ValueError):
            fast._ef.road_curve(np.zeros((3, 2)), np.zeros(2, np.uint8), 0.5)


if __name__ == "__main__":
    unittest.main()
