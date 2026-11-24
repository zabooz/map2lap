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
from track import editorinfo, kn5  # noqa: E402


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


class ExistingCorrectionTest(unittest.TestCase):
    def test_same_crossing_collects_stacked_corrections_but_leaves_next_bridge_alone(self):
        upper, lower, above, below, crossings = networks()
        upper['segments'][0]['road'] = 'bridge-a'
        old_points = [[0., 0., 0.], [20., 0., 0.]]
        heights = [
            {'id': 'first', 'separation': {'points': old_points}},
            {'id': 'second', 'separation': {'points': old_points, 'road_ids': ['bridge-a'], 'crossings': [[10., 0.]]}},
            {'id': 'next', 'separation': {'road_ids': ['bridge-a'], 'crossings': [[30., 0.]]}},
            {'id': 'rail', 'separation': {'kind': 'rail', 'road_ids': ['bridge-a'], 'crossings': [[10., 0.]]}},
        ]
        describe = mock.Mock(return_value=(upper, lower, above, below, crossings))
        found = roadseparation.matching('unused', {}, None, heights, upper, crossings, describe, 'road')
        self.assertEqual(['first', 'second'], [op['id'] for op in found])
        describe.assert_called_once_with('unused', {}, None, old_points)

class DeletedRailTest(unittest.TestCase):
    def test_deleted_ballast_no_longer_blocks_but_remaining_ballast_does(self):
        vertices = np.zeros(6, dtype=kn5.VERTEX)
        vertices["pos"][:3] = [[4., 0., 0.], [5., 0., 0.], [6., 0., 0.]]
        vertices["pos"][3:] = [[99., 0., 0.], [100., 0., 0.], [101., 0., 0.]]
        faces = np.array([[0, 1, 2], [3, 4, 5]], np.uint16)
        scan = {"meshes": [{"name": "nocol_rail_ballast_0_0", "center": [5., 0., 0.], "radius": 100.}]}
        upper, lower, above, below, _crossings = networks()
        with tempfile.NamedTemporaryFile(delete_on_close=False) as source, mock.patch.object(kn5, "mesh_arrays", return_value=(vertices, faces)):
            args = (source.name, scan, None, above, below, upper, lower, [(10., 1.)], [])
            with self.assertRaisesRegex(ValueError, "nocol_rail_ballast_0_0"):
                roadseparation._offsets(*args)
            self.assertEqual({}, roadseparation._offsets(*args, {0: np.array([True, False])}))
            with self.assertRaisesRegex(ValueError, "nocol_rail_ballast_0_0"):
                roadseparation._offsets(*args, {0: np.array([False, True])})


def _part(points, faces):
    """Source vertices at points and their faces, as kn5.mesh_arrays gives them. Pure."""
    vertices = np.zeros(len(points), dtype=kn5.VERTEX)
    vertices["pos"] = points
    return vertices, np.asarray(faces, np.uint16)


# A bridge "up" along x over a ground road "low" along z: its deck (with a face of another road), the ground road's skin,
# a guardrail with a module on each road and two pieces of ground, one beside the lower road and one far away.
SCENE = {
    "1ROAD_deck_0_0": (_part([[2, 5, -4], [18, 5, -4], [2, 5, 4], [18, 5, 4], [2, 5, 6], [18, 5, 6]],
                             [[0, 2, 1], [1, 2, 3], [2, 4, 3]]), ["up", "up", "other"]),
    "nocol_road_asphalt_0_0": (_part([[6, 0, -10], [14, 0, -10], [6, 0, 10], [14, 0, 10]], [[0, 2, 1], [1, 2, 3]]), ["low", "low"]),
    "1WALL_guardrail_0_0": (_part([[2, 5, 4.5], [10, 5, 4.5], [18, 5.5, 4.5], [8, 0, -6], [12, 0, -6], [10, 0.5, -6]],
                                  [[0, 1, 2], [3, 4, 5]]), None),
    "1GRASS_ground_0_0": (_part([[10, 0, -12], [14, 0, -12], [10, 0, -16], [30, 0, 30], [34, 0, 30], [30, 0, 34]],
                                [[0, 1, 2], [3, 4, 5]]), None),
}


class SharedOwnershipTest(unittest.TestCase):
    def offsets(self, *args, **kwargs):
        scan = {"meshes": [{"name": n, "center": [10., 0., 0.], "radius": 100.} for n in SCENE]}
        above, below = np.array([[0., 0.], [20., 0.]]), np.array([[10., -20.], [10., 20.]])
        upper = {"segments": [{"a": [0., 0.], "b": [20., 0.], "width": 8., "structure": "bridge", "road": "up"}],
                 "held_junctions": [], "unselected": []}
        lower = {"segments": [{"a": [10., -20.], "b": [10., 20.], "width": 8., "structure": "", "road": "low"}],
                 "held_junctions": [], "unselected": []}
        with (tempfile.NamedTemporaryFile(delete_on_close=False) as source,
              mock.patch.object(kn5, "mesh_arrays", side_effect=lambda _f, m: SCENE[m["name"]][0]),
              mock.patch.object(editorinfo, "surface_face_owners", side_effect=lambda _p, n: np.array(SCENE[n][1])),
              mock.patch.object(roadseparation, "_guardrail_owner", return_value=np.array([1, 1, 1, 2, 2, 2], np.uint8))):
            return roadseparation._offsets(source.name, scan, None, above, below, upper, lower, *args, **kwargs)

    def test_bend_offsets_are_unchanged_on_a_deck_skin_guardrail_and_ground(self):
        self.assertEqual({
            "0": [[0, 104, 0.095875, 0.0], [1, 104, -0.095875, 0.0], [2, 104, 0.095875, 0.0], [3, 104, -0.095875, 0.0]],
            "1": [[0, -500, -0.0008241, -0.0749844], [1, -500, 0.0008241, -0.0749844], [2, -500, -0.0008241, 0.0749844],
                  [3, -500, 0.0008241, 0.0749844]],
            "2": [[0, 104, 0.0955625, -0.0013366], [1, 997, 0.0, -0.0128519], [2, 104, -0.0955625, -0.0013366],
                  [3, -784, 0.0, -0.0629844], [4, -784, 0.0, -0.0629844], [5, -784, 0.0, -0.0629844]],
            "3": [[0, -352, 0.0, -0.0719844], [1, -352, 0.0005801, -0.0719844], [2, -104, 0.0, -0.0479844]],
        }, self.offsets([(10., 1.)], [(20., -1.)]))

    def test_injected_fields_move_only_the_marked_roads_faces(self):
        tilt = lambda xy: np.asarray(xy)[:, 1] * -.1          # (10 % across the bridge: its -z side up)
        found = self.offsets([(10., 1.)], [], fields=roadseparation.Fields(up=tilt, down=None, deck=tilt, ground=None))
        self.assertEqual({"0", "2"}, set(found))               # (the deck and the bridge's guardrail module, no ground)
        self.assertEqual([[0, 400], [1, 400], [2, -400], [3, -400]], [row[:2] for row in found["0"]])
        self.assertEqual([0, 1, 2], [row[0] for row in found["2"]])


if __name__ == "__main__":
    unittest.main()
