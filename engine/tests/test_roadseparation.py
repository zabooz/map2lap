"""Editor bridge corrections: chosen ramp limits and railway faces left after Delete."""
import os
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

from app import railbridges, roadseparation  # noqa: E402
from track import kn5  # noqa: E402


def networks():
    """One 20 m bridge route and a road below it. Pure."""
    above = np.array([[0., 0.], [20., 0.]])
    below = np.array([[10., -10.], [10., 10.]])
    upper = {"segments": [{"a": above[0].tolist(), "b": above[1].tolist(), "width": 8., "structure": "bridge"}],
             "held_junctions": [], "unselected": []}
    lower = {"segments": [{"a": below[0].tolist(), "b": below[1].tolist(), "width": 8., "structure": ""}],
             "held_junctions": [], "unselected": []}
    crossings = [{"x": 10., "z": 0., "upper_s": 10., "lower_s": 10., "upper_y": 1., "gap": 0.}]
    return upper, lower, above, below, crossings


class RampLimitTest(unittest.TestCase):
    def test_road_limit_rejects_steep_correction_and_is_saved_with_accepted_one(self):
        # A 1 m lift over 10 m has a 15% peak correction slope with the cubic ramp profile.
        points = [[0., 0., 0.], [20., 0., 0.]]
        with mock.patch.object(roadseparation, "describe", return_value=networks()), \
             mock.patch.object(roadseparation, "_offsets", return_value={"0": [[0, 1000, 0., 0.]]}):
            with self.assertRaisesRegex(ValueError, "15.0%.*maximum 10%"):
                roadseparation.change_of("unused", {}, None, points, 1., 100, "a", max_grade_percent=10)
            op, _crossings = roadseparation.change_of("unused", {}, None, points, 1., 100, "b", max_grade_percent=20)
        self.assertEqual(20, op["separation"]["max_grade_percent"])

    def test_rail_limit_starts_at_two_percent_but_can_be_raised(self):
        points = [[0., 0., 0.], [20., 0., 0.]]
        with mock.patch.object(railbridges, "describe", return_value=networks()), \
             mock.patch.object(railbridges, "_offsets", return_value={"0": [[0, 1000, 0., 0.]]}):
            with self.assertRaisesRegex(ValueError, "15.0%.*maximum 2%"):
                railbridges.change_of("unused", {}, None, points, 1., "a")
            op, _crossings = railbridges.change_of("unused", {}, None, points, 1., "b", max_grade_percent=20)
        self.assertEqual(20, op["separation"]["max_grade_percent"])


class DeletedRailTest(unittest.TestCase):
    def test_deleted_ballast_no_longer_blocks_but_remaining_ballast_does(self):
        vertices = np.zeros(6, dtype=kn5.VERTEX)
        vertices["pos"][:3] = [[4., 0., 0.], [5., 0., 0.], [6., 0., 0.]]
        vertices["pos"][3:] = [[99., 0., 0.], [100., 0., 0.], [101., 0., 0.]]
        faces = np.array([[0, 1, 2], [3, 4, 5]], np.uint16)
        scan = {"meshes": [{"name": "nocol_rail_ballast_0_0", "center": [5., 0., 0.], "radius": 100.}]}
        upper, lower, above, below, _crossings = networks()
        with tempfile.NamedTemporaryFile() as source, mock.patch.object(kn5, "mesh_arrays", return_value=(vertices, faces)):
            args = (source.name, scan, None, above, below, upper, lower, [(10., 1.)], [])
            with self.assertRaisesRegex(ValueError, "nocol_rail_ballast_0_0"):
                roadseparation._offsets(*args)
            self.assertEqual({}, roadseparation._offsets(*args, {0: np.array([True, False])}))
            with self.assertRaisesRegex(ValueError, "nocol_rail_ballast_0_0"):
                roadseparation._offsets(*args, {0: np.array([False, True])})


if __name__ == "__main__":
    unittest.main()
