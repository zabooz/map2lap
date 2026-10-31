"""townsigns: a place's name where a road enters its built-up area, the end on the back."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import exitsigns  # noqa: E402
import townsigns as ts  # noqa: E402


def strip(*parts):
    """Bools at STEP_M samples: (built-up?, metres) pieces in a row."""
    return np.concatenate([np.full(int(m / ts.STEP_M), u) for u, m in parts])


class RunsTest(unittest.TestCase):
    def test_gaps_between_houses_are_one_place(self):
        u = strip((False, 300), (True, 100), (False, 100), (True, 200), (False, 300))
        self.assertEqual(len(ts.runs(u)), 1, "gardens between the houses: one village")
        u = strip((False, 300), (True, 100), (False, 400), (True, 200), (False, 300))
        self.assertEqual(len(ts.runs(u)), 1, "a field longer than GAP_M: two places, the short one dropped")

    def test_a_farmstead_is_no_place(self):
        self.assertEqual(ts.runs(strip((False, 300), (True, 60), (False, 300))), [])

    def test_entries_both_ways_and_one_way(self):
        u = strip((False, 300), (True, 400), (False, 300))
        got = ts.entries(u)
        self.assertEqual([(s, i) for i, s, _ in got], [(1, 30), (-1, 69)], "in from each side")
        self.assertEqual([s for _, s, _ in ts.entries(u, oneway=1)], [1], "a one-way road: its direction only")

    def test_no_sign_where_the_place_goes_on_past_the_road(self):
        u = strip((False, 300), (True, 60))             # a road ending at a junction inside the village
        self.assertEqual([s for _, s, _ in ts.entries(u, ends=(ts.OPEN, ts.BUILT))], [1],
                         "entered from the fields, short but going on: a sign; none at the junction end")
        self.assertEqual(ts.entries(strip((True, 200)), ends=(ts.BUILT, ts.BUILT)), [], "all inside the place")

    def test_a_park_inside_the_town_is_no_entry(self):
        u = strip((True, 300), (False, 200), (True, 300))       # sports grounds between two streets of houses
        self.assertEqual(ts.entries(u, ends=(ts.BUILT, ts.BUILT)), [])

    def test_a_road_ending_in_the_fields_brings_no_one_in(self):
        u = strip((True, 300), (False, 150))
        self.assertEqual(ts.entries(u, ends=(ts.BUILT, ts.DEAD)), [], "a dead end 150 m out of the village")
        self.assertEqual([s for _, s, _ in ts.entries(u, ends=(ts.BUILT, ts.OPEN))], [-1],
                         "a road going on into open country: its sign")


class NameTest(unittest.TestCase):
    def test_nearest_place_within_its_reach(self):
        run = np.array([(0.0, 0.0), (100.0, 0.0)])
        places = [(900.0, 0.0, "hamlet", "Far Hamlet"), (1500.0, 0.0, "town", "Town"),
                  (50.0, 300.0, "village", "Village"), (60.0, 10.0, "suburb", "Quarter")]
        self.assertEqual(ts.nearest_place(run, places), "Village")
        self.assertEqual(ts.nearest_place(run, places[:2]), "Town", "a hamlet out of its reach, a town within")
        self.assertIsNone(ts.nearest_place(run, places[3:]), "a suburb has no sign of its own")

    def test_sign_lines(self):
        self.assertEqual(ts.sign_lines("Grabelsdorf/Grabalja vas"), ("Grabelsdorf", "Grabalja vas"))
        self.assertEqual(ts.sign_lines("Eberndorf"), ("Eberndorf",))
        self.assertEqual(ts.sign_lines("長和町"), (), "another script: no sign")
        self.assertEqual(ts.sign_lines(None), ())


class MeshTest(unittest.TestCase):
    def test_front_faces_the_coming_traffic(self):
        m = ts._Mesh((0.0, 0.0, 0.0))
        ts.sign_mesh(m, exitsigns.lettering(), 0.0, 0.0, 10.0, 1.0, 0.0, ("Eberndorf",))     # traffic going +x
        P, T, UV, mats, M = m.arrays()
        self.assertEqual(mats, ts.MATERIALS)
        letters = T[M == ts.LETTERS]
        self.assertEqual(len(letters), 2 * 2 * len("Eberndorf"), "the name on both faces")
        n = np.cross(P[letters[:, 1]] - P[letters[:, 0]], P[letters[:, 2]] - P[letters[:, 0]])
        front = letters[n[:, 0] < 0]
        self.assertEqual(len(front), len(letters) // 2)
        self.assertTrue((P[front.ravel(), 0] < 0).all(), "the front's letters face -x, towards the coming cars")
        red = T[M == ts.RED]
        self.assertTrue((P[red.ravel(), 0] > 0).all(), "the red bar on the back only")
        z = P[letters.ravel(), 2]
        self.assertGreater(z.min(), 10.0 + ts.PLATE_BOTTOM_M)
        self.assertLess(z.max(), 10.0 + ts.PLATE_BOTTOM_M + ts.PLATE_H[0])


if __name__ == "__main__":
    unittest.main()
