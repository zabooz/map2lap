"""Surfaces left out by their triangles (the road verge): what a draft may hold, and which triangles go."""
import os
import sys
import unittest

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

from app import tracksurfaces  # noqa: E402

VERGE = "nocol_road_edge_dirt_0_0"


def scan(*meshes):
    """A scan's meshes: (name, triangles). Pure."""
    return {"meshes": [{"name": name, "indices": 3 * faces} for name, faces in meshes]}


class ProblemsTest(unittest.TestCase):
    def test_a_list_of_meshes_with_their_ranges_is_one(self):
        self.assertIsNone(tracksurfaces.problems([]))
        self.assertIsNone(tracksurfaces.problems([{"mesh": VERGE, "faces": [[0, 2], [5, 1]]}]))

    def test_anything_else_is_not(self):
        for wrong in (None, {}, [{"mesh": VERGE}], [{"mesh": 3, "faces": []}], [{"mesh": VERGE, "faces": [[0]]}],
                      [{"mesh": VERGE, "faces": [[-1, 2]]}], [{"mesh": VERGE, "faces": [[0, 0]]}],
                      [{"mesh": VERGE, "faces": [[0.5, 2]]}], [{"mesh": VERGE, "faces": [[True, 2]]}],
                      [{"mesh": VERGE, "faces": [[0, 2]], "more": 1}]):
            self.assertIsNotNone(tracksurfaces.problems(wrong), wrong)


class CheckedTest(unittest.TestCase):
    def test_ranges_are_sorted_and_joined_and_a_mesh_named_once(self):
        s = scan(("1ROAD_ground_0_0", 4), (VERGE, 10))
        got = tracksurfaces.checked([{"mesh": VERGE, "faces": [[6, 2], [0, 2]]}, {"mesh": VERGE, "faces": [[1, 3], [8, 2]]}], s)
        self.assertEqual([{"mesh": VERGE, "faces": [[0, 4], [6, 4]]}], got)

    def test_only_a_verge_can_go_by_its_triangles(self):
        with self.assertRaisesRegex(ValueError, "1ROAD_ground_0_0"):
            tracksurfaces.checked([{"mesh": "1ROAD_ground_0_0", "faces": [[0, 1]]}], scan(("1ROAD_ground_0_0", 4)))

    def test_a_mesh_not_there_or_triangles_beyond_its_end_are_refused(self):
        s = scan((VERGE, 10))
        for wrong in ([{"mesh": "nocol_road_edge_dirt_9_9", "faces": [[0, 1]]}], [{"mesh": VERGE, "faces": [[8, 3]]}]):
            with self.assertRaises(ValueError):
                tracksurfaces.checked(wrong, s)

    def test_a_name_two_meshes_share_is_refused(self):
        with self.assertRaisesRegex(ValueError, "Two meshes"):
            tracksurfaces.checked([{"mesh": VERGE, "faces": [[0, 1]]}], scan((VERGE, 2), (VERGE, 2)))


class GoingTest(unittest.TestCase):
    def test_the_triangles_named_go_in_their_mesh_by_its_number(self):
        going = tracksurfaces.going(scan(("1ROAD_ground_0_0", 4), (VERGE, 5)), [{"mesh": VERGE, "faces": [[1, 2], [4, 1]]}])
        self.assertEqual([1], list(going))
        self.assertEqual([False, True, True, False, True], going[1].tolist())


if __name__ == "__main__":
    unittest.main()
