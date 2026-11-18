"""Editor Stitch road's range union and generated driving surface."""
import os
import sys
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))
from app import builtroad, trackstitch


def stitch(name, start, end, road="main"):
    """A level stitch descriptor between two points on a straight road. Pure."""
    return {"id": name, "road_ids": [road], "rows": [[start, 0], [end, 0]],
            "width": [8, 8], "heights": [[2] * trackstitch.COLUMNS for _ in range(2)], "marks": []}


class StitchTest(unittest.TestCase):
    def test_nearby_ranges_on_one_road_merge_but_other_roads_do_not(self):
        existing = stitch("old", 0, 10)
        self.assertTrue(trackstitch.meets(stitch("new", 11, 20), existing))
        self.assertFalse(trackstitch.meets(stitch("new", 13, 20), existing))
        self.assertFalse(trackstitch.meets(stitch("new", 8, 20, "crossing"), existing))

    def test_a_new_range_inside_an_old_one_grows_to_both_outer_ends(self):
        old = stitch("old", 0, 20)
        calls = []

        def prepare(_path, _scan, net, _width):
            calls.append(net["pins"])
            result = stitch("proposal", net["pins"][0][0], net["pins"][1][0])
            return result, {"rows": len(result["rows"])}

        def pick(_path, _scan, pins, join_near=False):
            self.assertTrue(join_near)
            return {"pins": pins}

        with mock.patch.object(trackstitch, "prepare", side_effect=prepare), mock.patch.object(builtroad, "pick", side_effect=pick):
            result, info = trackstitch.union(None, {}, {"pins": [[8, 0, 2], [12, 0, 2]]}, None, [old])
        self.assertEqual(["old"], info["replaces"])
        self.assertEqual([[0, 0], [20, 0]], result["rows"])
        self.assertEqual(2, len(calls))

    def test_surface_is_upward_collision_geometry_across_the_chosen_width(self):
        vertices, faces = trackstitch.surface_mesh(stitch("one", 0, 10))[0]
        self.assertEqual(2 * trackstitch.COLUMNS, len(vertices))
        self.assertEqual(2 * (trackstitch.COLUMNS - 1), len(faces))
        self.assertAlmostEqual(8, float(np.ptp(vertices["pos"][:, 2])))
        self.assertTrue(np.all(vertices["normal"][:, 1] > 0.99))
        self.assertLess(faces.max(), len(vertices))


if __name__ == "__main__":
    unittest.main()
