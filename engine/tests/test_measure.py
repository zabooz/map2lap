"""Height probes must not turn collapsed OBJ triangles into driving surfaces."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
import measure
import check


class HeightProbe(unittest.TestCase):
    def test_collapsed_triangle_covers_no_area(self):
        tri = np.array([[[0., 8., 0.], [0., 8., 0.], [0., 8., 0.]]])
        hits = measure._heights(tri, np.array([True]), np.array([2.]), np.array([3.]))
        self.assertEqual(len(hits[0][0]), 0)

    def test_vertical_face_is_not_a_floor(self):
        tri = np.array([[[0., 0., 0.], [1., 0., 0.], [1., 8., 0.]]])
        hits = measure._heights(tri, np.array([True]), np.array([.5]), np.array([0.]))
        self.assertEqual(len(hits[0][0]), 0)

    def test_valid_floor_is_kept_among_collapsed_faces(self):
        tri = np.array([[[0., 8., 0.]] * 3, [[0., 2., 0.], [4., 2., 0.], [0., 2., 4.]]])
        hits = measure._heights(tri, np.array([False, True]), np.array([1.]), np.array([1.]))
        np.testing.assert_array_equal(hits[0][0], [2.])
        np.testing.assert_array_equal(hits[0][1], [True])


class AreaReference(unittest.TestCase):
    def test_counts_bridge_decks_and_building_faces_without_a_route(self):
        parts = [('1ROAD_deck_asphalt_0_0', 12), ('1WALL_deck_con_0_0', 8),
                 ('nocol_bld_fac_01_0_0', 25), ('nocol_bld_roof_0_0', 10),
                 ('1ROAD_ground_0_0', 100)]
        self.assertEqual(measure.area_part_counts(parts),
                         {'bridge_triangles': 20, 'building_triangles': 35})

    def test_the_check_build_accepts_area_tests(self):
        self.assertEqual(check.build_inputs({'area': [1, 2, 3, 4], 'width': 100}),
                         ([], 100, {'area': [1, 2, 3, 4]}))
        self.assertEqual(check.build_inputs({'points': [[1, 2], [3, 4]], 'width': 80}),
                         ([[1, 2], [3, 4]], 80, {}))


if __name__ == '__main__':
    unittest.main()
