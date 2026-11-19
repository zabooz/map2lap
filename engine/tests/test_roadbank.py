"""Bank road: a signed absolute cross slope between A and B, tilted about the mapped centreline, with checked transitions."""
import os
import sys
import unittest

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

from app import roadbank  # noqa: E402

LENGTH = 400.0


def flat(value):
    """An existing cross slope that is the same everywhere. Pure."""
    return lambda station: np.full(np.shape(station), value, np.float64)


class CrossFieldTest(unittest.TestCase):
    def at(self, d, station, target, e0=flat(0.0), ramp=100.0):
        return float(roadbank.change(np.array([d], float), np.array([station], float), LENGTH, ramp, target, e0)[0])

    def test_the_centreline_stays(self):
        self.assertEqual(0.0, self.at(0.0, 200.0, 0.08))

    def test_left_is_up_for_a_positive_target(self):
        self.assertAlmostEqual(0.32, self.at(4.0, 200.0, 0.08))
        self.assertAlmostEqual(-0.32, self.at(-4.0, 200.0, 0.08))

    def test_ends_stay(self):
        self.assertEqual(0.0, self.at(4.0, 0.0, 0.08))
        self.assertEqual(0.0, self.at(4.0, LENGTH, 0.08))

    def test_an_already_banked_road_gets_only_the_difference(self):
        self.assertAlmostEqual(0.08, self.at(4.0, 200.0, 0.08, flat(0.06)))

    def test_target_equal_to_a_constant_current_changes_nothing(self):
        station = np.linspace(0, LENGTH, 41)
        moved = roadbank.change(np.full(41, 4.0), station, LENGTH, 100.0, 0.06, flat(0.06))
        np.testing.assert_allclose(moved, 0.0, atol=1e-12)

    def test_a_varying_current_is_evened_by_a_constant_target(self):
        e0 = lambda s: 0.02 + 0.04 * np.asarray(s) / LENGTH          # (the builder's runoff inside A-B)
        core = np.linspace(110, 290, 19)
        result = roadbank.change(np.full(19, 4.0), core, LENGTH, 100.0, 0.08, e0) / 4.0 + e0(core)
        np.testing.assert_allclose(result, 0.08)
        self.assertGreater(float(np.ptp(roadbank.change(np.full(19, 4.0), core, LENGTH, 100.0, 0.08, e0))), 0.05)


class TransitionTest(unittest.TestCase):
    def test_constant_zero_to_eight_percent_needs_96_m_per_ramp_at_8_m(self):
        # (smoothstep's steepest slope is 1.5 times the mean: 1.5 x 4 m x 0.08 / 0.005)
        self.assertAlmostEqual(96, roadbank.needed_ramp(LENGTH, 0.08, flat(0.0), 4.0), delta=1)

    def test_width_scales_the_edge_lift(self):
        narrow = roadbank.needed_ramp(LENGTH, 0.08, flat(0.0), 2.0)
        wide = roadbank.needed_ramp(LENGTH, 0.08, flat(0.0), 6.0)
        self.assertAlmostEqual(3.0, wide / narrow, delta=0.1)
        self.assertAlmostEqual(0.48, 6.0 * 0.08)

    def test_a_changing_existing_slope_is_judged_on_the_resulting_edges(self):
        # An S-bend banked by the builder: +6 % at A turning to -6 % within the first 60 m. The formula on the slope at
        # A (6 % to 8 %) asks only 24 m; on the resulting edges the change to -6 % needs far more.
        e0 = lambda s: 0.06 - 0.12 * np.clip(np.asarray(s) / 60.0, 0, 1)
        formula = 1.5 * 4.0 * abs(0.08 - 0.06) / roadbank.EDGE_RAMP
        self.assertGreater(roadbank.edge_ramp(np.arange(0, LENGTH + 1.0), LENGTH, formula, 0.08, e0, 4.0), roadbank.EDGE_RAMP)
        self.assertGreater(roadbank.needed_ramp(LENGTH, 0.08, e0, 4.0), formula)

    def test_an_existing_steep_edge_that_is_not_made_steeper_is_no_refusal(self):
        # A step the build left (4 % edge ramp over 4 m) inside the first transition; the target only nears its far side.
        e0 = lambda s: 0.06 - 0.04 * np.clip((np.asarray(s) - 40.0) / 4.0, 0, 1)
        self.assertIsNone(roadbank.refusal(LENGTH, 0.021, e0, 4.0))
        # A step in the core is evened out: the result is flat there.
        core_step = lambda s: 0.06 - 0.04 * np.clip((np.asarray(s) - 200.0) / 4.0, 0, 1)
        self.assertIsNone(roadbank.refusal(LENGTH, 0.04, core_step, 4.0))

    def test_a_short_stretch_says_how_long_it_must_be(self):
        message = roadbank.refusal(60.0, 0.08, flat(0.0), 4.0)
        self.assertRegex(message, r"60 m available, 19\d m needed; mark A and B farther apart")
        self.assertIsNone(roadbank.refusal(LENGTH, 0.08, flat(0.0), 4.0))

    def test_out_of_range_target_is_refused(self):
        self.assertRegex(roadbank.refusal(LENGTH, 0.125, flat(0.0), 4.0), "between -12 and 12 percent")


if __name__ == "__main__":
    unittest.main()
