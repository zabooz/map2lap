"""The tools in tools/ an agent reads a report with: what they conclude from their numbers. Every tool is named in AGENTS.md,
the list an agent looks in first."""
import glob
import os
import sys
import unittest

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(ENGINE)
sys.path.insert(0, os.path.join(ROOT, "tools"))

import mark  # noqa: E402
import measure  # noqa: E402


def row(t, s=100.0, kmh=50.0, vert=0.0, off=0.0, susp=(0.01, 0.01, 0.03, 0.03)):
    """One sample of a mark's csv."""
    return {"time_s": t, "route_m": s, "off_m": off, "x": s, "y": 0.0, "z": 0.0, "speed_kmh": kmh, "acc_vert_g": vert,
            "acc_side_g": 0.0, "acc_long_g": 0.0, "susp_fl": susp[0], "susp_fr": susp[1], "susp_rl": susp[2],
            "susp_rr": susp[3]}


class MarkTest(unittest.TestCase):
    def test_a_pause_repeats_a_sample_and_is_dropped(self):
        rows = [row(1.0), row(1.02), row(1.04, vert=0.5), row(1.06, vert=0.5), row(1.08, s=101.0)]
        self.assertEqual([r["time_s"] for r in mark.drop_frozen(rows)], [1.0, 1.04, 1.08])

    def test_peaks_close_together_are_one_hit_at_the_strongest(self):
        rows = [row(0.0), row(1.0, vert=1.0), row(1.1, vert=-2.0), row(1.2, vert=0.9), row(2.0, vert=1.5), row(3.0)]
        self.assertEqual([r["acc_vert_g"] for r in mark.hits(rows)], [-2.0, 1.5])

    def test_a_soft_bump_on_the_road_is_shown_one_beside_it_not(self):
        rows = [row(0.0), row(1.0, vert=-0.42, s=112.0), row(2.0, vert=0.5, s=90.0, off=11.0), row(3.0, vert=1.5), row(4.0)]
        self.assertEqual([r["route_m"] for r in mark.soft_hits(rows)], [112.0])

    def test_a_turn_back_ends_a_pass(self):
        rows = [row(float(i), s=100.0 - 2 * i) for i in range(10)] + [row(10.0 + i, s=82.0 + 2 * i) for i in range(10)]
        got = mark.passes(rows)
        self.assertEqual(len(got), 2)
        self.assertLess(got[0][1]["route_m"], got[0][0]["route_m"])
        self.assertGreater(got[1][1]["route_m"], got[1][0]["route_m"])

    def test_standing_ends_a_pass(self):
        rows = [row(float(i), s=100.0 + 2 * i) for i in range(5)] + [row(5.0, s=108.0, kmh=0.0)] + \
               [row(6.0 + i, s=108.0 + 2 * i) for i in range(5)]
        self.assertEqual(len(mark.passes(rows)), 2)

    def test_an_axle_hangs_when_both_its_wheels_are_low_for_it_is_the_axle_named(self):
        low = (0.001, 0.002, 0.03, 0.03)
        rows = [row(i * 0.02) for i in range(20)] + [row(0.4 + i * 0.02, s=120.0, susp=low) for i in range(5)] + \
               [row(0.5 + i * 0.02) for i in range(20)]
        got = mark.unloaded(rows)
        self.assertEqual([u[0] for u in got], ["front"])
        self.assertEqual(got[0][1]["route_m"], 120.0)

    def test_one_low_wheel_or_one_sample_is_no_hanging_axle(self):
        one_wheel = [row(i * 0.02) for i in range(20)] + [row(0.4 + i * 0.02, susp=(0.001, 0.01, 0.03, 0.03)) for i in range(5)]
        self.assertEqual(mark.unloaded(one_wheel), [])
        one_sample = [row(i * 0.02) for i in range(20)] + [row(0.4, susp=(0.001, 0.001, 0.03, 0.03))] + \
                     [row(0.42 + i * 0.02) for i in range(5)]
        self.assertEqual(mark.unloaded(one_sample), [])

    def test_the_newest_session_of_a_track_with_a_mark_is_found(self):
        import tempfile
        with tempfile.TemporaryDirectory() as root:
            for name, has_mark in (("rechberg_test_20261101_115118", True), ("rechberg_test_20261103_083656", True),
                                   ("rechberg_test_20261103_090000", False), ("griffen_test_20261104_100000", True)):
                os.makedirs(os.path.join(root, name))
                if has_mark:
                    open(os.path.join(root, name, "mark_01.csv"), "w").close()
            self.assertEqual(os.path.basename(mark.find_session("rechberg", root)), "rechberg_test_20261103_083656")
            self.assertEqual(os.path.basename(mark.find_session(None, root)), "griffen_test_20261104_100000")
            self.assertIsNone(mark.find_session("stausee", root))


class OverDeckTest(unittest.TestCase):
    # a deck 10 m long, 8 m wide, at height 100 (x along it)
    DECK = np.array([[[0, 100, -4], [10, 100, 4], [10, 100, -4]], [[0, 100, -4], [0, 100, 4], [10, 100, 4]]], np.float64)

    def test_a_terrain_point_above_the_deck_is_found(self):
        got = measure.over_deck(np.array([[5.0, 100.08, 0.0]]), self.DECK)
        self.assertEqual(len(got), 1)
        self.assertAlmostEqual(got[0, 2], 0.08)

    def test_the_ground_under_a_deck_or_beside_it_is_none(self):
        pts = np.array([[5.0, 99.0, 0.0], [5.0, 100.01, 1.0], [30.0, 105.0, 0.0]])    # under, at a joint, beside it
        self.assertEqual(len(measure.over_deck(pts, self.DECK)), 0)

    def test_a_hillside_far_over_a_deck_is_none(self):
        self.assertEqual(len(measure.over_deck(np.array([[5.0, 103.0, 0.0]]), self.DECK)), 0)

    def test_spots_are_placed_on_the_route_each_bridge_its_own(self):
        rows = np.array([[100.0, 1.0, 0.05, 0.0], [102.0, 0.0, 0.08, 0.0], [300.0, 2.0, 0.03, 0.0]])
        ss = np.arange(0.0, 400.0, 0.5)
        got = measure.over_deck_spots(rows, ss, np.zeros(len(ss)), ss)
        self.assertEqual([(u["from"], u["to"], u["n"]) for u in got], [(100.0, 102.0, 2), (300.0, 300.0, 1)])
        self.assertAlmostEqual(got[0]["over"], 0.08)
        self.assertEqual(got[0]["at"], 102.0)
        self.assertEqual(got[1]["off"], 2.0)

    def test_a_section_keeps_its_own_spots(self):
        rows = np.array([[100.0, 0.0, 0.05, 0.0], [300.0, 0.0, 0.03, 0.0]])
        ss = np.arange(0.0, 400.0, 0.5)
        self.assertEqual([u["from"] for u in measure.over_deck_spots(rows, ss, np.zeros(len(ss)), ss, 250.0, 350.0)], [300.0])


class AgentsListTest(unittest.TestCase):
    def test_every_tool_is_named_in_agents_md(self):
        with open(os.path.join(ROOT, "AGENTS.md"), encoding="utf-8") as f:
            text = f.read()
        missing = [os.path.basename(p) for p in glob.glob(os.path.join(ROOT, "tools", "*.py"))
                   if os.path.basename(p) not in text]
        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()
