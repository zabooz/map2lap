"""What a placement is: the numbers a draft can hold, and where it puts the object list's places."""
import os
import sys
import unittest

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

from app import placement as placements  # noqa: E402


def placement(id_="t_0_0#0", x=0.0, y=0.0, z=0.0, turn=0.0, scale=1.0):
    return {"id": id_, "x": x, "y": y, "z": z, "turn": turn, "scale": scale}


def house_list(at=(10.0, 100.0, 10.0)):
    """A house of one triangle in mesh 0, its sign in the same mesh, another house beside it."""
    return {"t_0_0": {"kinds": ["house", "house sign", "house"], "at": [list(at), [10.0, 101.0, 10.0], [50.0, 100.0, 50.0]],
                      "parents": [-1, 0, -1], "faces": [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]], "with": {}}}


class ProblemTest(unittest.TestCase):
    def test_a_good_one_has_no_problem(self):
        self.assertIsNone(placements.problem(placement(x=3, y=-1.5, turn=90, scale=2)))

    def test_what_a_draft_can_not_hold(self):
        for wrong, why in (({"id": ""}, "id"), ({"id": "t_0_0"}, "id"), ({"x": "1"}, "numbers"), ({"y": True}, "numbers"),
                           ({"turn": float("nan")}, "numbers"), ({"x": 900.0, "z": 900.0}, "far"), ({"y": 101.0}, "far"),
                           ({"turn": 361.0}, "turn"), ({"scale": 0.0}, "size"), ({"scale": 11.0}, "size")):
            self.assertIn(why, placements.problem({**placement(), **wrong}), wrong)
        self.assertIsNotNone(placements.problem("x"))

    def test_a_list_of_them(self):
        self.assertIsNone(placements.problems([placement(), placement("t_0_0#1")]))
        self.assertIn("twice", placements.problems([placement(), placement(x=1.0)]))
        self.assertIn("no list", placements.problems({}))


class ListTest(unittest.TestCase):
    def test_the_list_says_where_objects_stand_now(self):
        out = placements.list_placed(house_list(), [placement(x=1.0, turn=180.0)])
        self.assertEqual([[11.0, 100.0, 10.0], [11.0, 101.0, 10.0], [50.0, 100.0, 50.0]], out["t_0_0"]["at"])
        self.assertEqual([10.0, 100.0, 10.0], house_list()["t_0_0"]["at"][0])


if __name__ == "__main__":
    unittest.main()
