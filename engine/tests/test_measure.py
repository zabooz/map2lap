"""Height probes must not turn collapsed OBJ triangles into driving surfaces."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
import measure


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


if __name__ == '__main__':
    unittest.main()
