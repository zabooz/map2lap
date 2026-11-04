"""Ground graded under roads (grading.py): the profile smoothing, flat across the core, untouched away from
roads, junctions blended, the plans made once per cell, and GradedDem as a drop-in DEM."""
import os
import sys
import unittest
import unittest.mock

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import grading  # noqa: E402
import mapcells  # noqa: E402
import roads  # noqa: E402
from grading import points  # noqa: E402
from test_roads import features, rules, LAT, LON, FRAME  # noqa: E402


class ProfileTest(unittest.TestCase):
    def test_smoothing_keeps_grades_removes_bumps(self):
        s = np.arange(0, 400, 2.0)
        ramp = 0.05 * s
        self.assertTrue(np.allclose(grading.smooth_profile(ramp, 2.0, 12.0)[20:-20], ramp[20:-20], atol=1e-6),
                        "a constant grade stays")
        bumpy = ramp + 0.3 * np.sin(s / 3.0)
        sm = grading.smooth_profile(bumpy, 2.0, 12.0)
        self.assertLess(np.abs(sm - ramp)[20:-20].max(), 0.02, "short bumps smoothed away")
        self.assertEqual(len(sm), len(s))

    def test_a_bridge_deck_in_the_data_is_no_hump(self):
        # GitHub #271: the elevation data had a bridge deck 8.5 m up in 3 samples (6 m) where it crosses over the road
        s = np.arange(0, 300, 2.0)
        ground = 50.0 + 0.01 * s
        spiked = ground.copy()
        spiked[74:77] += 8.5
        xy = np.stack([s, np.zeros(len(s))], axis=1)
        plan = grading._plan(xy, spiked, roads.Spec(7.0, "paved", False, "residential"))
        self.assertLess(float(np.max(plan.z - np.interp(plan.xy[:, 0], s, ground))), 0.2)
        steps = grading.median_profile(ground, 2.0, grading.MEDIAN_M)
        self.assertTrue(np.allclose(steps, ground), "a constant grade stays, ends included")

    def test_the_parts_of_a_road_meet_at_one_height(self):
        # a road on a 20 % grade split in two at a junction (BR-381): each part's smoothed profile keeps
        # the grade to its end and ends at the ground's height there, so the two meet without a step (mirrored at the
        # ends, one ended 1.3 m under the ground and the next began 0.8 m over it)
        s = np.arange(0, 400, 2.0)
        ground = 0.20 * s + 0.3 * np.sin(s / 9.0)
        a, b = grading.smooth_profile(ground[:101], 2.0, 12.0), grading.smooth_profile(ground[100:], 2.0, 12.0)
        self.assertAlmostEqual(a[-1], ground[100], places=9)
        self.assertAlmostEqual(b[0], ground[100], places=9)
        ramp = 0.20 * s
        self.assertTrue(np.allclose(grading.smooth_profile(ramp, 2.0, 12.0), ramp, atol=1e-9), "the grade to the ends")
        short = 0.1 * np.arange(6) * 2.0        # shorter than the kernel: the line through its ends
        self.assertTrue(np.allclose(grading.smooth_profile(short, 2.0, 12.0), short, atol=1e-9))


class BankTest(unittest.TestCase):
    """A motorway's curve leans into its turn (grading.bank, grade_points): its inside lower, a straight level."""

    def arc(self, r, ang, step=2.0):
        th = np.arange(0.0, ang, step / r)
        return np.stack([r * np.sin(th), r - r * np.cos(th)], axis=1)       # a left turn from (0, 0) heading +x

    def test_left_curve_banked_inside_lower(self):
        xy = self.arc(400.0, 1.2)
        sp = roads.Spec(11.0, "paved", False, "motorway")
        b = grading.bank(xy, sp, ext=(1, 1))
        self.assertIsNotNone(b)
        mid = b[len(b) // 2]
        v, f = grading.BANK_DESIGN["motorway"]
        r_min = v * v / (127.0 * (grading.BANK_E_MAX + f))
        self.assertAlmostEqual(mid, -grading.BANK_E_MAX * min(1.0, r_min / 400.0), places=2)   # left (inside) lower
        plan = grading._plan(xy, np.full(len(xy), 50.0), sp)
        # graded across the carriageway at the middle: the outside (right) higher than the inside (left)
        i = len(xy) // 2
        p = xy[i]
        th = np.arctan2(xy[i + 1, 1] - xy[i - 1, 1], xy[i + 1, 0] - xy[i - 1, 0])
        n = np.array([-np.sin(th), np.cos(th)])          # left
        pts = np.array([p + n * 4.0, p - n * 4.0])
        z = grading.grade_points(pts[:, 0], pts[:, 1], np.full(2, 50.0), [plan])
        self.assertAlmostEqual(float(z[1] - z[0]), -mid * 8.0, places=1)

    def test_a_curve_of_long_chords_is_banked_evenly(self):
        # a map line draws a curve as straight pieces turning at vertices ~100 m apart (I-80 in Wyoming, Discord
        # 2026-10-28: "a series of bumps where the bank would be"): the bank holds through the curve, not one per vertex
        r = 600.0
        th = np.arange(0.0, 1.2, 100.0 / r)
        verts = np.stack([r * np.sin(th), r - r * np.cos(th)], axis=1)
        xy = [verts[0]]
        for a, b in zip(verts[:-1], verts[1:]):        # (resampled every 2 m, as the plans are)
            k = max(1, int(np.hypot(*(b - a)) // 2.0))
            xy.extend(a + (b - a) * (t / k) for t in range(1, k + 1))
        xy = np.asarray(xy)
        b = grading.bank(xy, roads.Spec(11.0, "paved", False, "motorway"), ext=(1, 1))
        arc = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        body = b[(arc > 150.0) & (arc < arc[-1] - 150.0)]
        self.assertGreater(len(body), 50)
        self.assertLess(float(body.max() - body.min()), 0.012)       # (it was 0 % between vertices, 8 % at them)
        self.assertLess(float(body.max()), -0.05)

    def test_straight_and_city_streets_level(self):
        xy = np.stack([np.arange(0, 300, 2.0), np.zeros(150)], axis=1)
        self.assertIsNone(grading.bank(xy, roads.Spec(11.0, "paved", False, "motorway"), ext=(1, 1)))
        self.assertIsNone(grading.bank(self.arc(150.0, 1.0), roads.Spec(7.0, "paved", False, "residential")))

    def test_faded_to_level_at_a_bridge(self):
        xy = self.arc(300.0, 1.0)
        b = grading.bank(xy, roads.Spec(11.0, "paved", False, "motorway"), abut=(True, False), ext=(0, 1))
        self.assertEqual(float(b[0]), 0.0)
        self.assertLess(abs(float(b[len(b) // 2])), 0.09)
        self.assertGreater(abs(float(b[len(b) // 2])), 0.03)


class LidarBankTest(unittest.TestCase):
    """On lidar a motorway takes the elevation's cross slope; elsewhere the design-speed rule."""

    def test_a_straight_motorway_on_a_4_percent_slope_leans_with_it(self):
        x = np.arange(-300.0, 300.1, 20.0)
        la, lo, _ = FRAME.enu_to_geodetic(x, np.zeros(len(x)), 0.0)
        part = (np.c_[lo, la], roads.Spec(11.0, "paved", False, "motorway"))

        def elev(la_, lo_):     # rising 4 % to the north: the left of a road heading east
            _e, n, _ = FRAME.geodetic_to_enu(np.asarray(la_), np.asarray(lo_), np.zeros(np.shape(la_)))
            return 100.0 + 0.04 * np.asarray(n)
        p = grading.plan_roads(FRAME, [part], elev, fine=True)[0]
        self.assertIsNotNone(p.bank)
        self.assertAlmostEqual(float(p.bank[len(p.bank) // 2]), 0.04, delta=0.003)
        self.assertLess(abs(float(p.bank[0])), 0.005, "faded to level at a loose end")
        self.assertIsNone(grading.plan_roads(FRAME, [part], elev)[0].bank, "coarse: a straight stays level")


class EndBankTest(unittest.TestCase):
    """A deck's end takes the cross slope of the road ending there, whatever the road's grade."""

    def plan(self, x, bank=None, under=(False, False)):
        x = np.asarray(x, np.float64)
        p = grading.Plan(np.c_[x, np.zeros(len(x))], 100.0 + 0.08 * x, 5.0, (False, False))
        p.bank, p.under = None if bank is None else np.asarray(bank, np.float64), under
        return p

    def test_the_end_s_own_slope(self):
        p = self.plan([-8.0, -4.0, 0.0], [0.01, 0.02, 0.03])
        self.assertAlmostEqual(grading.end_bank([p], (0.0, 0.0), (1.0, 0.0)), 0.03)

    def test_a_road_with_no_bank_is_level(self):
        self.assertEqual(grading.end_bank([self.plan([-8.0, -4.0, 0.0])], (0.0, 0.0), (1.0, 0.0)), 0.0)

    def test_a_road_drawn_the_other_way_leans_the_other_way_in_the_deck_s_sense(self):
        p = self.plan([0.0, -4.0, -8.0], [0.03, 0.02, 0.01])
        self.assertAlmostEqual(grading.end_bank([p], (0.0, 0.0), (1.0, 0.0)), -0.03)

    def test_the_end_before_its_way_on_under_the_deck(self):
        p = self.plan([-8.0, -4.0, 0.0, 6.0], [0.01, 0.02, 0.03, 0.09], under=(False, True))
        self.assertAlmostEqual(grading.end_bank([p], (0.0, 0.0), (1.0, 0.0)), 0.03)

    def test_no_road_ends_there(self):
        self.assertIsNone(grading.end_bank([self.plan([-8.0, -4.0, 0.0])], (20.0, 0.0), (1.0, 0.0)))

    def test_of_two_roads_ending_there_the_one_running_along_the_deck(self):
        side = grading.Plan(np.array([[0.0, -8.0], [0.0, -4.0], [0.0, 0.0]]), np.full(3, 100.0), 5.0, (False, False))
        road = self.plan([-8.0, -4.0, 0.0], [0.03, 0.03, 0.03])
        self.assertAlmostEqual(grading.end_bank([side, road], (0.0, 0.0), (1.0, 0.0)), 0.03)

    def test_a_road_arriving_at_an_angle_takes_its_grade_across_the_deck(self):
        # level across, rising 8 % toward the deck, 16 degrees to the right of the deck's axis: its surface falls
        # toward the deck's left by 8 % x sin 16 degrees
        a = np.radians(-16.0)
        s = np.array([-12.0, -8.0, -4.0, 0.0])
        p = grading.Plan(np.c_[s * np.cos(a), s * np.sin(a)], 100.0 + 0.08 * s, 5.0, (False, False))
        self.assertAlmostEqual(grading.end_bank([p], (0.0, 0.0), (1.0, 0.0)), 0.08 * np.sin(a))


class OpenFloorHoleTest(unittest.TestCase):
    """roads.spare_open_floors: past a twin's shared tube no terrain cell is cut wider than the floor under it."""

    def filled(self, samples, span=(40.0, 100.0)):
        # a floor along x from 0 to 100, half width 4.3, the shared tube from x 40 on; samples every 2 m from (0, -12)
        mask = np.zeros((13, 51), bool)
        for x, y in samples:
            mask[int((y + 12) / 2), int(x / 2)] = True
        part = ("t#0", roads.Spec(8.6, "paved", False, "primary"), np.array([[0.0, 0.0], [100.0, 0.0]]), np.zeros(2), 0.0)
        with unittest.mock.patch.object(roads, "twin_spans", lambda parts: {"t#0": span}):
            out = roads.spare_open_floors(mask, [part], 0.0, -12.0, 2.0)
        return {(ix * 2.0, iy * 2.0 - 12.0) for iy, ix in np.argwhere(out)}

    def test_a_cell_past_the_open_floor_s_edge_stays_ground(self):
        self.assertEqual(self.filled([(20.0, 6.0)]), set())

    def test_on_the_floor_it_is_cut(self):
        self.assertEqual(self.filled([(20.0, 0.0)]), {(20.0, 0.0)})

    def test_under_the_shared_tube_its_wall_closes_it_off(self):
        self.assertEqual(self.filled([(60.0, 6.0)]), {(60.0, 6.0)})

    def test_far_off_the_floor_it_is_another_part_s(self):
        self.assertEqual(self.filled([(20.0, 12.0)]), {(20.0, 12.0)})

    def test_no_twin_nothing_changes(self):
        part = ("t#0", roads.Spec(8.6, "paved", False, "primary"), np.array([[0.0, 0.0], [100.0, 0.0]]), np.zeros(2), 0.0)
        mask = np.ones((3, 3), bool)
        self.assertTrue(roads.spare_open_floors(mask, [part], 0.0, 0.0, 2.0).all())


class ShortRoadOntoBridgeTest(unittest.TestCase):
    """An 8 m part between a junction and a bridge tells the bank from the road by the road going on past the junction."""

    def plan(self, goes_on):
        def elev(la, lo):       # level up to the part's start, then down the bank at 19 %
            e, _n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return 100.0 - 0.19 * np.maximum(np.asarray(e), 0.0)
        x = np.array([0.0, 8.0])
        la, lo, _ = FRAME.enu_to_geodetic(x, 0 * x, 0.0)
        part = (np.c_[lo, la], roads.Spec(6.0, "paved", False, "service"))
        west = np.c_[np.arange(0.0, -61.0, -4.0), np.zeros(16)]
        return grading.plan_roads(FRAME, [part], elev, abut=[(False, True)], ext=[(west if goes_on else None, None)],
                                  cuts=False, fine=True)[0]

    def test_with_the_road_going_on_its_end_keeps_the_road_s_height(self):
        self.assertGreater(float(self.plan(True).z[-1]), 99.5)

    def test_with_nothing_further_on_there_is_nothing_to_tell_it_by(self):
        self.assertLess(float(self.plan(False).z[-1]), 99.2)

    def test_a_side_road_s_own_level_half_tells_it_too(self):
        # (10 m to a bridge, no road going on straight past the junction: level, then 1.5 m down the bank)
        z = np.array([100.0, 100.0, 100.0, 99.95, 99.4, 98.5])
        np.testing.assert_allclose(grading.fill_abutment(z, True, fine=True)[-1], 100.0, atol=0.05)

    def test_an_even_steep_side_road_stays(self):
        z = 100.0 - 0.19 * np.arange(6) * 2.0
        np.testing.assert_array_equal(grading.fill_abutment(z, True, fine=True), z)

    def test_too_short_to_say_stays(self):
        z = np.array([100.0, 99.0, 98.0])
        np.testing.assert_array_equal(grading.fill_abutment(z, True, fine=True), z)


class ExtensionOntoBridgeTest(unittest.TestCase):
    """A road split at a junction short of its bridge: its smoothing runs on over the junction, along the short part, down the
    bank at the bridge's end. Filled, the road stays up (a 2 m hollow on Cap Corse)."""

    SPEC = roads.Spec(8.0, "paved", False, "secondary")

    def plan(self, bank=8.0, onto=True, ext_m=18.0, fine=True):
        def elev(la, lo):       # level up to the bridge's end at 200 m + ext_m: the last 4 m drop bank m
            e, _n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return 100.0 - bank * np.clip((np.asarray(e) - (196.0 + ext_m)) / 4.0, 0.0, 1.0)
        x = np.array([0.0, 200.0])
        la, lo, _ = FRAME.enu_to_geodetic(x, 0 * x, 0.0)
        part = (np.c_[lo, la], self.SPEC)
        on = np.c_[np.arange(200.0, 200.1 + ext_m, 2.0), np.zeros(int(ext_m / 2) + 1)]
        return grading.plan_roads(FRAME, [part], elev, ext=[(None, on)], cuts=False, fine=fine,
                                  onto=[(False, onto)] if onto is not None else None)[0]

    def test_the_bank_past_the_junction_doesn_t_draw_the_road_down(self):
        self.assertLess(float(self.plan(onto=False).z[-1]), 99.0, "without the fill: down the bank")
        self.assertGreater(float(self.plan().z[-1]), 99.8, "filled: at the road's height")

    def test_the_part_on_to_the_bridge_is_met_at_one_height(self):
        def elev(la, lo):
            e, _n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return 100.0 - 8.0 * np.clip((np.asarray(e) - 214.0) / 4.0, 0.0, 1.0)
        x = np.array([200.0, 218.0])
        la, lo, _ = FRAME.enu_to_geodetic(x, 0 * x, 0.0)
        short = (np.c_[lo, la], self.SPEC)
        back = np.c_[np.arange(200.0, -1.0, -4.0), np.zeros(51)]
        own = grading.plan_roads(FRAME, [short], elev, abut=[(False, True)], ext=[(back, None)], cuts=False, fine=True)[0]
        self.assertAlmostEqual(float(own.z[0]), float(self.plan().z[-1]), delta=0.1)

    def test_a_bridge_with_no_falling_bank_changes_nothing(self):
        np.testing.assert_array_equal(self.plan(bank=0.0).z, self.plan(bank=0.0, onto=None).z)

    def test_no_word_about_the_extension_changes_nothing(self):
        np.testing.assert_array_equal(self.plan(onto=None).z, self.plan(onto=False).z)

    def test_an_extension_cut_short_of_the_bridge_is_not_filled(self):
        reach = 3.0 * grading.profile_sigma(self.SPEC) + grading.PROFILE_STEP
        long_m = float(2 * int((reach + 40.0) / 2))
        np.testing.assert_array_equal(self.plan(ext_m=long_m).z, self.plan(ext_m=long_m, onto=False).z)


class OntoBridgeAnswerTest(unittest.TestCase):
    """_onto_bridge: whichever cell plans a part, told at the extension's far end."""

    class Planner(grading.ends._Ends, grading.abutments._Abutments):
        frame = FRAME

        def __init__(self, bridge_ends, roads_there):
            self.bridge_ends, self.roads_there = np.asarray(bridge_ends, np.float64).reshape(-1, 2), roads_there

        def _cell_enu(self, home, ground=True):
            return {"ends": self.bridge_ends}

        def _chain_cands(self, key, feats=None, specs=None):
            return [(np.asarray(xy, np.float64), 0.0, 0, None, None, fid) for fid, xy in self.roads_there]

    LINE = np.array([[0.0, 0.0], [18.0, 0.0]])

    def test_an_extension_ending_on_a_bridge_s_end(self):
        got = self.Planner([[18.5, 0.0]], [("short", self.LINE)])._onto_bridge([(None, self.LINE)])
        self.assertEqual(got, [(False, True)])

    def test_no_bridge_there(self):
        got = self.Planner([[80.0, 0.0]], [("short", self.LINE)])._onto_bridge([(None, self.LINE), (self.LINE, None)])
        self.assertEqual(got, [(False, False), (False, False)])

    def test_a_road_going_on_past_its_end_is_a_junction_not_the_bridge(self):
        through = np.array([[18.0, -30.0], [18.0, 30.0]])
        got = self.Planner([[18.5, 0.0]], [("short", self.LINE), ("through", through)])._onto_bridge([(None, self.LINE)])
        self.assertEqual(got, [(False, False)])

    def test_no_extensions_no_question(self):
        self.assertEqual(self.Planner([], [])._onto_bridge([(None, None)]), [(False, False)])

    def test_the_answer_doesn_t_depend_on_the_cell_asking(self):
        """(far away from any cell: _abut_ends would filter it by the cell asking; here nobody asks by a cell)"""
        far = self.LINE + [90000.0, 0.0]
        got = self.Planner(far[-1:], [("short", far)])._onto_bridge([(None, far)])
        self.assertEqual(got, [(False, True)])


class DeckFromItsRoadsTest(unittest.TestCase):
    """A deck between two roads takes its ends' heights and grades from them, not from the ground; the ground follows."""

    XY = np.c_[np.arange(0.0, 21.0, 4.0), np.zeros(6)]

    def laid(self, ground, crossings=(), xy=None):
        xy = self.XY if xy is None else xy
        bp = roads.BridgeProfiles(FRAME, None, ground)
        ends = iter([(100.04, 0.08), (100.04 + 0.08 * float(xy[-1, 0]), 0.08)])
        bp._road_end = lambda p, f: next(ends)
        out, laid = bp._tangent([xy], [np.full(len(xy), 110.0)], crossings)
        return out[0], laid[0]

    def test_its_ends_are_the_road_s_and_a_straight_grade_between(self):
        z, ok = self.laid(lambda la, lo: np.zeros(np.shape(la)))
        self.assertTrue(ok)
        np.testing.assert_allclose(z, 100.04 + 0.08 * self.XY[:, 0], atol=1e-9)

    def test_a_bank_under_it_does_not_lift_it(self):
        z, _ok = self.laid(lambda la, lo: np.full(np.shape(la), 500.0))
        np.testing.assert_allclose(z, 100.04 + 0.08 * self.XY[:, 0], atol=1e-9)

    def test_a_road_under_it_still_does(self):
        xy = np.c_[np.arange(0.0, 121.0, 4.0), np.zeros(31)]
        z, ok = self.laid(lambda la, lo: np.zeros(np.shape(la)), [(0, 60.0, 99.0, 6.0)], xy)
        self.assertTrue(ok)
        self.assertGreater(float(z[15]), 100.04 + 0.08 * 60.0 + 0.1)
        self.assertAlmostEqual(float(z[0]), 100.04)

    def test_the_road_end_s_height_and_grade(self):
        s = np.array([-12.0, -8.0, -4.0, 0.0])
        p = grading.Plan(np.c_[s, 0 * s], 100.0 + 0.08 * s, 5.0, (False, True))
        z, g = grading.road_end([p], (0.0, 0.0), (1.0, 0.0))
        self.assertAlmostEqual(z, 100.0 + grading.ROAD_LIFT)
        self.assertAlmostEqual(g, 0.08)
        self.assertAlmostEqual(grading.road_end([p], (0.0, 0.0), (-1.0, 0.0))[1], -0.08)
        self.assertIsNone(grading.road_end([p], (30.0, 0.0), (1.0, 0.0)))

    def test_the_ground_stays_under_the_deck_and_at_its_ends_on_its_top_at_most(self):
        q = np.array([[1.0, 0.0], [10.0, 0.0], [10.0, 2.0], [10.0, 20.0], [self.XY[-1, 0] - 1.0, 0.0]])
        z = np.full(5, 200.0)
        deck = (self.XY, 100.0 + 0.08 * self.XY[:, 0], 3.0)
        out = roads.under_deck_ground(q, z, [deck], [None])
        np.testing.assert_allclose(out, [100.08, 100.8 - roads.DECK_CLEAR, 100.8 - roads.DECK_CLEAR, 200.0,
                                         100.0 + 0.08 * (self.XY[-1, 0] - 1.0)])
        low = roads.under_deck_ground(q, np.full(5, 50.0), [deck], [None])
        np.testing.assert_allclose(low, 50.0)

    def test_a_point_over_a_deck_near_its_upper_end_is_brought_down_to_it(self):
        deck = (self.XY, 100.0 + 0.08 * self.XY[:, 0], 3.0)
        x = self.XY[-1, 0] - 1.9
        got = roads.under_deck_ground(np.array([[x, 0.0]]), np.array([100.0 + 0.08 * x + 0.14]), [deck], [None])
        np.testing.assert_allclose(got, [100.0 + 0.08 * x])

    def test_the_road_past_a_decks_end_is_left_alone(self):
        deck = (self.XY, 100.0 + 0.08 * self.XY[:, 0], 3.0)
        q = np.array([[-1.0, 0.0], [self.XY[-1, 0] + 1.0, 0.0]])
        np.testing.assert_allclose(roads.under_deck_ground(q, np.full(2, 200.0), [deck], [None]), 200.0)


class RoadEndOntoBridgeTest(unittest.TestCase):
    """The ground keeps the road's own line up to the joint (_past_segments): one height for the road and the deck."""

    def grade(self, x, abut, grade=0.08):
        s = np.arange(-120.0, 0.1, 4.0)
        p = grading.Plan(np.c_[s, 0 * s], 100.0 + grade * s, 7.0, (False, abut), road_half=3.0)
        x = np.asarray(x, np.float64)
        return grading.grade_points(x, 0 * x, np.full(len(x), 50.0), [p]), 100.0 + grade * x

    def test_the_ground_stays_on_the_line_up_to_a_bridge_on_a_steep_road(self):
        got, line = self.grade([-12.0, -8.0, -4.0, -2.0, -1.0, 0.0], True)
        np.testing.assert_allclose(got, line, atol=0.01)

    def test_and_on_a_falling_road(self):
        got, line = self.grade([-4.0, -2.0, 0.0], True, -0.08)
        np.testing.assert_allclose(got, line, atol=0.01)

    def test_a_road_ending_elsewhere_is_blended_as_ever(self):
        got, line = self.grade([0.0], False)
        self.assertLess(float(got[0] - line[0]), -0.05)

    def test_nothing_changes_past_the_end(self):
        at = [1.0, 3.0, 6.0]
        np.testing.assert_allclose(self.grade(at, True)[0], self.grade(at, False)[0])

    def test_under_a_deck_the_terrain_cell_past_the_joint_stays_on_the_line_too(self):
        # (its corner past the joint: blended one-sided, the cell across the joint sank the road's last metres)
        s = np.arange(-120.0, 0.1, 4.0)
        xy, z, grow, _opens = grading._under_deck(np.c_[s, 0 * s], 100.0 + 0.08 * s, (False, True), 3.0)
        p = grading.Plan(xy, z, 7.0, (False, True), road_half=3.0)
        p.under = (False, bool(grow[1]))
        x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
        got = grading.grade_points(x, 0 * x, np.full(len(x), 50.0), [p])
        np.testing.assert_allclose(got, 100.0 + 0.08 * x, atol=0.03)

    def test_the_end_s_cross_slope_goes_on_with_it(self):
        s = np.arange(-120.0, 0.1, 4.0)
        p = grading.Plan(np.c_[s, 0 * s], 100.0 + 0 * s, 7.0, (False, True), road_half=3.0)
        p.bank = np.full(len(s), 0.03)
        got = grading.grade_points(np.array([-1.0, -1.0]), np.array([2.0, -2.0]), np.full(2, 50.0), [p])
        self.assertAlmostEqual(float(got[0] - got[1]), 0.12, delta=0.01)


class TiltingPartsTest(unittest.TestCase):
    """roads._tilting_parts: which parts of a chain take their roads' cross slope. Heights: east-west twins at 100, what
    crosses them over or at their height."""
    TWIN = [np.array([[-30.0, 0.0], [30.0, 0.0]]), np.array([[30.0, -11.0], [-30.0, -11.0]])]

    def tilting(self, others=(), z=106.0):
        lines = self.TWIN + list(others)
        zs = [np.full(len(ln), 100.0) for ln in self.TWIN] + [np.full(len(ln), z) for ln in others]
        return roads._tilting_parts(lines, zs, [10.7] * len(lines))

    def test_a_twin_bridge_under_flyovers_tilts_each_alone(self):
        fly = [np.array([[-5.0, -80.0], [-5.0, 80.0]]), np.array([[20.0, 80.0], [20.0, -80.0]])]
        self.assertEqual(len(self.tilting(fly)), 4, "the twin and the two flyovers: nothing shared")

    def test_a_flyover_joining_them_at_their_height_keeps_them_level(self):
        at_grade = [np.array([[-5.0, -80.0], [-5.0, 80.0]])]
        self.assertEqual(self.tilting(at_grade, z=100.5), [], "crossing at one height: a junction, one surface")

    def test_ramps_sharing_an_end_stay_level_a_part_apart_still_tilts(self):
        ramps = [np.array([[0.0, 100.0], [50.0, 100.0]]), np.array([[50.0, 100.0], [100.0, 130.0]])]
        got = roads._tilting_parts(ramps + self.TWIN[:1], [np.full(2, 100.0)] * 3, [7.0] * 3)
        self.assertEqual(len(got), 1)
        self.assertIs(got[0], self.TWIN[0])

    def test_a_single_deck_or_a_twin_as_ever(self):
        self.assertEqual(len(self.tilting()), 2)


class DeckBankTest(unittest.TestCase):
    """roads.BridgeProfiles.deck_bank: the slopes of the roads ending at the deck's ends, run linearly between them."""

    def bank(self, plans):
        bp = roads.BridgeProfiles(FRAME, None, None)
        bp.plans_at = lambda xy: plans
        x = np.arange(0.0, 13.0, 3.0)
        with unittest.mock.patch.object(roads, "_is_simple", lambda f, xy: True), \
                unittest.mock.patch("railways._coarse_here", lambda f, box: False):
            return bp.deck_bank(np.c_[x, np.zeros(len(x))], 100.0 + 0.08 * x)

    def road(self, x, b=None):
        x = np.asarray(x, np.float64)
        p = grading.Plan(np.c_[x, np.zeros(len(x))], 100.0 + 0.08 * x, 5.0, (False, False))
        p.bank = None if b is None else np.full(len(x), b)
        return p

    def test_level_roads_on_an_8_percent_grade_keep_the_deck_level(self):
        self.assertIsNone(self.bank([self.road([-8.0, -4.0, 0.0]), self.road([12.0, 16.0, 20.0])]))

    def test_each_end_its_own_road_s_slope(self):
        b = self.bank([self.road([-8.0, -4.0, 0.0], 0.03), self.road([12.0, 16.0, 20.0], -0.01)])
        self.assertAlmostEqual(float(b[0]), 0.03)
        self.assertAlmostEqual(float(b[-1]), -0.01)
        self.assertAlmostEqual(float(b[2]), 0.01)

    def test_an_end_no_road_ends_at_takes_the_other_s(self):
        b = self.bank([self.road([-8.0, -4.0, 0.0], 0.03)])
        self.assertAlmostEqual(float(b[-1]), 0.03)

    def test_no_road_at_either_end_is_level(self):
        self.assertIsNone(self.bank([]))


class CrestTest(unittest.TestCase):
    def test_no_kinks_over_a_crest(self):
        # a road over a crest (the grade falls 4 % per 10 m): the graded centreline's slope changes smoothly, not
        # in a kink at every plan vertex (r/BeamNG: 'bumpy roads, worst uphill and at speed'; with
        # 16 m vertices the slope jumped 6.4 % at each)
        xy = np.stack([np.arange(-150.0, 150.1, grading.PROFILE_STEP), np.zeros(151)], axis=1)
        z = 20.0 - 0.002 * xy[:, 0] ** 2
        plan = grading._plan(xy, z, roads.Spec(7.0, "paved", False, "residential"))
        px = np.arange(-60.0, 60.1, 0.5)
        out = grading.grade_points(px, np.zeros(len(px)), 20.0 - 0.002 * px ** 2, [plan])
        slope = np.diff(out[::4]) / 2.0                     # per 2 m (the terrain grid)
        self.assertLess(np.abs(np.diff(slope)).max(), 0.02)


def slope_ground(x, y):
    """A hillside: 10 % up to the north, plus small bumps."""
    return 0.10 * y + 0.2 * np.sin(x / 7.0) * np.cos(y / 5.0)


def plan_line(x0, x1, y, kind="paved", cls="residential", w=6.0):
    xy = np.stack([np.linspace(x0, x1, 200), np.full(200, y)], axis=1)
    z = grading.smooth_profile(slope_ground(xy[:, 0], xy[:, 1]), (x1 - x0) / 199, grading.SIGMA_M)
    keep = np.r_[np.arange(0, 199, 8), 199]
    spec = roads.Spec(w, kind, False, cls)
    width = roads.carriageway(cls, kind, True) if kind in roads.BUILT else w
    return grading.Plan(xy[keep], z[keep], width / 2 + grading.shoulder(spec)), spec


class GradePointsTest(unittest.TestCase):
    def grid(self):
        xs, ys = np.meshgrid(np.arange(-60.0, 60.1, 1.0), np.arange(-40.0, 40.1, 1.0))
        return xs.ravel(), ys.ravel(), slope_ground(xs.ravel(), ys.ravel())

    def test_flat_across_untouched_away(self):
        px, py, base = self.grid()
        p, _ = plan_line(-200, 200, 0.0)
        out = grading.grade_points(px, py, base, [p])
        core = np.abs(py) <= p.half - 0.01
        for x in (-30.0, 0.0, 25.0):
            col = core & (np.abs(px - x) < 0.5)
            self.assertLess(np.ptp(out[col]), 0.02, f"flat across the core at x={x}")
        far = np.abs(py) > p.half + grading.T_MAX + 0.5
        self.assertTrue(np.allclose(out[far], base[far]), "untouched beyond the transition")
        mid = (np.abs(py) > p.half) & (np.abs(py) < p.half + grading.T_MIN)
        self.assertTrue((np.abs(out[mid] - base[mid]) <= np.abs(out[core].mean() - base[mid]) + 1.0).all())

    def test_lift_under_roads_only(self):
        px, py, base = self.grid()
        p, _ = plan_line(-200, 200, 0.0)
        flat = grading.grade_points(px, py, base, [p])
        lifted = grading.grade_points(px, py, base, [p], lift=grading.ROAD_LIFT)
        core = np.abs(py) <= p.half - 0.01
        self.assertTrue(np.allclose(lifted[core] - flat[core], grading.ROAD_LIFT), "the physics ground under the road")
        far = np.abs(py) > p.half + grading.T_MAX + 0.5
        self.assertTrue(np.allclose(lifted[far], base[far]), "untouched away from roads")
        self.assertTrue(((lifted - flat) <= grading.ROAD_LIFT + 1e-9).all() and ((lifted - flat) >= -1e-9).all())

    def test_junction_blends_and_deterministic(self):
        px, py, base = self.grid()
        a, _ = plan_line(-200, 200, 0.0)
        b = grading.Plan(np.array([[10.0, -200], [10.0, 200]]), np.array([slope_ground(10.0, -200.0),
                                                                          slope_ground(10.0, 200.0)]), 4.0)
        out1 = grading.grade_points(px, py, base, [a, b])
        out2 = grading.grade_points(px, py, base, [a, b])
        self.assertTrue(np.array_equal(out1, out2))
        j = (np.abs(px - 10) < 0.5) & (np.abs(py) < 0.5)
        self.assertTrue(np.isfinite(out1[j]).all())

    def test_a_side_road_gives_way_where_it_ends(self):
        # (YIELD_*) a service road ending on a road rising 5 %: the road keeps its own grade through
        # the junction; blended as equals the side road's end flattened it there (an S-wave)
        px = np.arange(-30.0, 30.1, 0.5)
        py = np.zeros(len(px))
        main = grading.Plan(np.array([[-100.0, 0.0], [100.0, 0.0]]), np.array([95.0, 105.0]), 4.0, road_half=3.0)
        main.rid = 1
        side = grading.Plan(np.array([[0.0, 0.0], [0.0, 40.0]]), np.array([100.0, 101.0]), 3.0, road_half=2.0)
        side.rid = 2
        base = 100.0 + 0.05 * px
        blended = grading.grade_points(px, py, base, [main, side])
        self.assertGreater(np.abs(blended - base).max(), 0.02, "blended as equals: pulled out of its grade")
        side.free = (True, False)
        out = grading.grade_points(px, py, base, [main, side])
        self.assertLess(np.abs(out - base).max(), 1e-6, "its own grade through the junction")
        off = grading.Plan(side.xy, np.array([100.5, 101.0]), 3.0, road_half=2.0)
        off.rid = 2
        before = grading.grade_points(px, py, base, [main, off])
        off.free = (True, False)
        self.assertTrue(np.array_equal(grading.grade_points(px, py, base, [main, off]), before),
                        "an end 0.5 m off the road's height: blended as before")

    def test_a_narrow_road_beside_at_another_level_gives_way(self):
        """(BESIDE_*) a service road 8 m beside a primary, 2 m under it: the primary's carriageway keeps its height,
        the service road takes the ramp (its weight back over YIELD_FADE_M past the primary's edge)."""
        px, py = np.meshgrid(np.arange(-20.0, 20.1, 1.0), np.arange(-4.0, 12.1, 0.5))
        px, py = px.ravel(), py.ravel()
        main = grading.Plan(np.array([[-100.0, 0.0], [100.0, 0.0]]), np.array([100.0, 100.0]), 7.0, road_half=4.0)
        main.rid = 1
        service = grading.Plan(np.array([[-100.0, 8.0], [100.0, 8.0]]), np.array([98.0, 98.0]), 3.0, road_half=2.0)
        service.rid = 2
        base = np.full(len(px), 99.0)
        out = grading.grade_points(px, py, base, [main, service])
        car = np.abs(py) <= 4.0
        self.assertLess(np.abs(out[car] - 100.0).max(), 1e-6, "the primary's lanes at its own height")
        ramp = out[py == 8.0]
        self.assertTrue(((ramp > 98.0) & (ramp < 99.0)).all(), "the service road nearer its own height than ours")
        wide = grading.Plan(service.xy, service.z, 7.0, road_half=4.0)
        wide.rid = 2
        out = grading.grade_points(px, py, base, [main, wide])
        self.assertGreater(np.abs(out[car] - 100.0).max(), 0.1, "as wide: blended as before")

    def test_a_narrow_carriageway_overlapping_a_wider_keeps_its_lanes(self):
        """(BESIDE_*) two carriageways 10 m apart, the narrower 0.5 m under the wider, their carriageways overlapping
        by 2.5 m: the narrower's lanes stay at its own height (giving way there lifted them to the wider one's)."""
        px, py = np.meshgrid(np.arange(-20.0, 20.1, 1.0), np.arange(-5.0, 5.1, 0.5))
        px, py = px.ravel(), py.ravel()
        narrow = grading.Plan(np.array([[-100.0, 0.0], [100.0, 0.0]]), np.array([100.0, 100.0]), 5.9, road_half=4.9)
        narrow.rid = 1
        wide = grading.Plan(np.array([[-100.0, 10.0], [100.0, 10.0]]), np.array([100.5, 100.5]), 8.6, road_half=7.6)
        wide.rid = 2
        out = grading.grade_points(px, py, np.full(len(px), 100.0), [narrow, wide])
        own = np.abs(py) <= 2.0
        self.assertLess(np.abs(out[own] - 100.0).max(), 0.25, "its lanes nearer its own height than the wider's")

    def _two_levels(self, low_z=98.9):
        """SH16 at Waterview, Auckland: the eastbound carriageway's plan at 100 m, the westbound's 10 m south of it at
        low_z, planned 18.5 m wide (four lanes and shoulders), both with a vertex every 4 m."""
        x = np.arange(-100.0, 100.1, 4.0)
        east = grading.Plan(np.c_[x, np.zeros(len(x))], np.full(len(x), 100.0), 6.33, road_half=5.33)
        west = grading.Plan(np.c_[x[::-1], np.full(len(x), -10.0)], np.full(len(x), low_z), 10.25, road_half=9.25)
        east.rid, west.rid = 1, 2
        return east, west

    def _ground(self, north):
        """elev(lat, lon) of a ground whose height is north(y) (m north of FRAME's origin)."""
        def elev(la, lo):
            _e, n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return north(np.asarray(n))
        return elev

    def test_a_mapped_wall_between_two_levels_ends_both_gradings_at_it(self):
        """(_between_cuts, BETWEEN_*) the map's wall 5.5 m south of the eastbound's line: both carriageways keep their
        own height up to it (graded as one surface the westbound took the eastbound's lanes down: a ramp under them,
        2-3.7 G in waves)."""
        from grading import profiles
        east, west = self._two_levels()
        profiles._between_cuts(FRAME, [east, west], self._ground(lambda n: np.full(n.shape, 99.5)),
                               [np.array([[-120.0, -5.5], [120.0, -5.5]])])
        self.assertTrue(np.allclose(east.cut[:, 3], 5.5) and np.isnan(east.cut[:, 0]).all(), "the eastbound: on its right")
        self.assertTrue(np.allclose(west.cut[:, 3], 4.5), "the westbound (running west): on its right too")
        px, py = np.meshgrid(np.arange(-20.0, 20.1, 1.0), np.arange(-16.0, 5.1, 0.5))
        px, py = px.ravel(), py.ravel()
        out = grading.grade_points(px, py, np.full(len(px), 99.5), [east, west])
        self.assertLess(np.abs(out[py >= -5.0] - 100.0).max(), 0.02, "the eastbound's lanes at its height up to the wall")
        self.assertLess(np.abs(out[(py <= -6.0) & (py >= -14.0)] - 98.9).max(), 0.02, "the westbound's beyond it")

    def test_the_grounds_step_between_two_levels_where_no_wall_is_mapped(self):
        """(BETWEEN_*) no wall mapped: the raw ground's step between them (lidar: 1 m within 1.5 m, 5.5 m south of the
        eastbound's line) is where both end; a gentle slope between them, or one level, cuts nothing."""
        from grading import profiles
        east, west = self._two_levels()
        step = lambda n: np.interp(n, [-10.0, -6.25, -4.75, 0.0], [98.9, 98.9, 100.0, 100.0])    # noqa: E731
        profiles._between_cuts(FRAME, [east, west], self._ground(step), [])
        self.assertTrue(np.allclose(east.cut[:, 3], 5.5, atol=0.5), "the eastbound ends at the step")
        self.assertTrue(np.allclose(west.cut[:, 3], 4.5, atol=0.5))
        east, west = self._two_levels()
        slope = lambda n: np.interp(n, [-10.0, 0.0], [98.9, 100.0])    # noqa: E731
        profiles._between_cuts(FRAME, [east, west], self._ground(slope), [])
        self.assertIsNone(east.cut, "a gentle slope between them: blended as ever")
        east, west = self._two_levels()
        profiles._between_cuts(FRAME, [east, west], self._ground(lambda n: np.full(n.shape, 100.0)), [])
        self.assertIsNone(east.cut, "no step in the ground: blended as ever, whatever the plans' heights")

    def test_the_grounds_step_decides_not_the_plans_heights_and_a_small_one_fades_in(self):
        """(BETWEEN_*) Waterview at 1056 m: the plans 0.46 m apart at their lines, their cross slopes toward the wall
        hiding the rest of its step (the ground 0.58 m apart between them): a wall at the step. A step of 0.375 m (half
        way between half and all of BESIDE_LEVEL_FROM_M): its wall half way out toward the other road."""
        from grading import profiles
        east, west = self._two_levels(low_z=99.54)
        cross = lambda n: np.interp(n, [-10.0, -8.0, -5.0, 0.0], [99.55, 99.27, 100.0, 99.82])    # noqa: E731
        profiles._between_cuts(FRAME, [east, west], self._ground(cross), [])
        self.assertTrue(np.allclose(east.cut[:, 3], 6.5, atol=0.75), "a wall at the ground's step")
        east, west = self._two_levels()
        small = lambda n: np.interp(n, [-10.0, -6.25, -4.75, 0.0], [99.625, 99.625, 100.0, 100.0])    # noqa: E731
        profiles._between_cuts(FRAME, [east, west], self._ground(small), [])
        self.assertTrue(((east.cut[:, 3] > 6.0) & (east.cut[:, 3] < 8.25)).all(), "half way out")

    def test_a_wall_goes_on_to_a_plan_s_end_on_a_bridge(self):
        """(_on_to_bridge_ends) Waterview at 1055 m: the ground's step between the carriageways gone from their last
        4 m under the bridge's end. Ending on the bridge the wall goes on to the end, so the other road's grading stays
        off the lanes; ending on the ground, or with the other road gone by then, it stops where the step stops."""
        from grading import profiles
        step = lambda e, n: np.where(e > 96.0, 99.5, np.interp(n, [-10.0, -6.25, -4.75, 0.0], [98.9, 98.9, 100.0, 100.0]))    # noqa: E731

        def elev(la, lo):
            e, n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return step(np.asarray(e), np.asarray(n))
        east, west = self._two_levels()
        east.abut = (False, True)
        profiles._between_cuts(FRAME, [east, west], elev, [])
        self.assertTrue(np.allclose(east.cut[-1, 3], east.cut[-2, 3]), "on to its end on the bridge")
        self.assertTrue(np.isnan(east.cut[0, 0]), "its other end and side untouched")
        east, west = self._two_levels()
        profiles._between_cuts(FRAME, [east, west], elev, [])
        self.assertTrue(np.isnan(east.cut[-1, 3]) and np.isfinite(east.cut[-2, 3]), "an end on the ground: no")
        east, west = self._two_levels()
        east.abut = (False, True)
        west.xy, west.z = west.xy[1:], west.z[1:]        # (west runs west: the east end's vertex gone)
        profiles._between_cuts(FRAME, [east, west], elev, [])
        self.assertTrue(np.isnan(east.cut[-1, 3]), "the other road gone by then: no")

    def test_a_wall_goes_on_only_a_short_way(self):
        """(_on_to_bridge_ends) no wall within SHARP_RUN_N segments of the end: the ground there had room to show one."""
        from grading import profiles
        put = np.array([1.0, 1.0, np.nan, np.nan, np.nan, np.nan])
        got = profiles._on_to_bridge_ends(put, np.ones(6, bool), (False, True))
        self.assertTrue(np.isnan(got[2:]).all())
        put = np.array([1.0, 1.0, 1.0, 1.0, np.nan, np.nan])
        got = profiles._on_to_bridge_ends(put, np.ones(6, bool), (False, True))
        np.testing.assert_allclose(got, 1.0)

    def test_a_narrow_road_mapped_onto_a_wider_one_far_under_it_gives_way(self):
        """(BESIDE_LEVEL_*) a driveway mapped onto a secondary's carriageway, 3 m off its centre line and 1.5 m under
        it: the secondary keeps its height across its carriageway; 0.3 m under it the two blend as before."""
        px, py = np.meshgrid(np.arange(-20.0, 20.1, 1.0), np.arange(-6.0, 6.1, 0.5))
        px, py = px.ravel(), py.ravel()
        main = grading.Plan(np.array([[-100.0, 0.0], [100.0, 0.0]]), np.array([100.0, 100.0]), 9.0, road_half=6.0)
        main.rid = 1
        drive = grading.Plan(np.array([[-100.0, -3.0], [100.0, -3.0]]), np.array([98.5, 98.5]), 3.0, road_half=2.0)
        drive.rid = 2
        base = np.full(len(px), 99.0)
        out = grading.grade_points(px, py, base, [main, drive])
        car = np.abs(py) <= 6.0
        self.assertLess(np.abs(out[car] - 100.0).max(), 1e-6, "the secondary's carriageway at its own height")
        near = grading.Plan(drive.xy, np.array([99.7, 99.7]), 3.0, road_half=2.0)
        near.rid = 2
        out = grading.grade_points(px, py, base, [main, near])
        self.assertGreater(np.abs(out[car] - 100.0).max(), 0.05, "0.3 m apart: blended as equals")

    def test_a_narrow_road_at_a_junction_with_a_wider_one_blends_as_an_equal(self):
        """(BESIDE_*) a narrower road sharing a node with a wider one does not give way beside it near the node (a
        primary going on from a trunk's end, a side road ending on its middle: the junction's roads meet at one height;
        giving way there left a hump on the side road joining at that node); one running alongside it does, and a
        road starting at the node and turning alongside does past the node's reach."""
        trunk = grading.Plan(np.array([[-100.0, 0.0], [0.0, 0.0]]), np.array([100.0, 100.0]), 9.6, road_half=6.6)
        trunk.rid = 1

        def bw(xy):
            narrow = grading.Plan(np.asarray(xy, np.float64), np.zeros(len(xy)) + 100.0, 8.0, road_half=5.0)
            narrow.rid = 2
            pack = grading.PlanPack([trunk, narrow])
            return pack.bw[pack.of == 1]

        self.assertFalse(bw([[0.0, 0.0], [100.0, 0.0]]).any(), "going on from its end")
        self.assertFalse(bw([[100.0, -10.0], [0.0, 0.0]]).any(), "going on, drawn toward the node")
        self.assertFalse(bw([[-50.0, 0.0], [-50.0, 100.0]]).any(), "a side road ending on its middle")
        self.assertTrue(bw([[-100.0, 9.0], [0.0, 9.0]]).any(), "alongside, no node")
        turn = bw([[-50.0, 0.0], [-50.0, 9.0], [-100.0, 9.0], [-150.0, 9.0]])
        self.assertFalse(turn[0], "near the node")
        self.assertTrue(turn[2], "alongside, past the node's reach")

    def test_an_end_joining_a_road_before_its_bridge_is_no_approach(self):
        """(APPROACH_TOUCH_M, junction_ends) a driveway ending on a road 2.5 m before the road's bridge starts joins the
        road (its end on the road's line, away from the road's own end); the road's own end at the abutment, and a road
        forking off at that end, do lead onto the bridge."""
        road = np.array([[0.0, -100.0], [0.0, 0.0]])          # (its end at y = 0: the abutment)
        drive = np.array([[-40.0, -2.5], [0.0, -2.5]])
        fork = np.array([[-30.0, -30.0], [0.0, 0.0]])
        got = grading.junction_ends([road, drive, fork], ["road", "drive", "fork"])
        self.assertTrue(got[1, 1], "the driveway's end: a junction with the road")
        self.assertFalse(got[0].any(), "the road's own ends")
        self.assertFalse(got[2, 1], "a fork at the road's end")
        self.assertFalse(got[1, 0], "the driveway's far end, on nothing")
        part = np.array([[0.0, -2.5], [0.0, 0.0]])            # (the same road's next piece: its own feature)
        self.assertFalse(grading.junction_ends([road, part], ["road", "road"])[1, 0], "a piece of the same road")

    @staticmethod
    def _tunnel_spec(width):
        """A road spec with a shoulder (SHOULDER_M: a built road of no sidewalk class) for grading.tunnel_plan."""
        import types
        import roads as roadsmod
        return types.SimpleNamespace(kind=sorted(roadsmod.BUILT)[0], cls="unclassified", width=width, oneway=False,
                                     walk=0.0)

    def test_a_road_over_a_wider_tunnel_does_not_give_way_to_it(self):
        """(BESIDE_*, Plan.tunnel) a carriageway over a wider tunnel's open section 5.6 m under it: another level by
        the map, it does not give way to it; the same plan unmarked would pull it down to its height."""
        px, py = np.meshgrid(np.arange(-20.0, 20.1, 1.0), np.arange(-4.0, 4.1, 0.5))
        px, py = px.ravel(), py.ravel()
        road = grading.Plan(np.array([[-100.0, 0.0], [100.0, 0.0]]), np.array([100.0, 100.0]), 6.9, road_half=3.9)
        road.rid = 1
        tun = grading.tunnel_plan(np.array([[-100.0, 6.0], [100.0, 6.0]]), np.array([94.4, 94.4]),
                                  self._tunnel_spec(10.0))
        base = np.full(len(px), 99.0)
        car = (py >= 1.5) & (py <= 3.9)        # (its carriageway over the tunnel's: from 6 - 5 m)
        marked = grading.grade_points(px, py, base, [road, tun])
        plain = grading.Plan(tun.xy, tun.z, tun.half, road_half=tun.road_half)
        plain.rid = 2
        unmarked = grading.grade_points(px, py, base, [road, plain])
        self.assertLess(np.abs(unmarked[car] - 94.4).max(), 0.5, "unmarked: the road gives way to it")
        self.assertGreater(marked[car].min(), unmarked[car].max() + 1.0, "a tunnel's: not given way to")

    def test_a_trench_shoulder_never_pulls_the_road_over_it(self):
        """(tunnel_plan) an open tunnel section 5.6 m under a road beside it, the trench's shoulder under the road's
        carriageway: its carriageway is the road's width, so its shoulder gives way there (another level, the native
        on_other_car) and the road keeps its height up to the trench's carriageway."""
        px, py = np.meshgrid(np.arange(-20.0, 20.1, 1.0), np.arange(-4.0, 4.1, 0.5))
        px, py = px.ravel(), py.ravel()
        road = grading.Plan(np.array([[-100.0, 0.0], [100.0, 0.0]]), np.array([100.0, 100.0]), 6.9, road_half=3.9)
        road.rid = 1
        spec = self._tunnel_spec(8.6)
        self.assertGreater(grading.shoulder(spec), 0.0)
        tun = grading.tunnel_plan(np.array([[-100.0, 8.0], [100.0, 8.0]]), np.array([94.4, 94.4]), spec)
        self.assertEqual(tun.road_half, 4.3)
        base = np.full(len(px), 99.0)
        out = grading.grade_points(px, py, base, [road, tun])
        alone = grading.grade_points(px, py, base, [road])
        mine = (py >= -3.9) & (py <= 3.5)      # (the road's carriageway short of the trench's at 8 - 4.3 m)
        self.assertLess(np.abs(out[mine] - alone[mine]).max(), 1e-6, "its carriageway as without the trench")


def beside_over_every_segment(plans, box, nseg):
    """_beside_strength measuring each sample to every segment of every wider plan: what its choice of segments must not
    change. Pure."""
    f64 = np.float64
    out = np.zeros(int(np.sum(nseg)), f64)
    s0 = np.r_[0, np.cumsum(nseg)]
    rh = np.array([p.road_half for p in plans], f64)
    tun = np.array([p.tunnel for p in plans], bool)
    for k, p in enumerate(plans):
        if tun[k]:
            continue
        wider = np.flatnonzero(~tun & (rh >= rh[k] + points.BESIDE_WIDER_M) & (box[:, 0] <= box[k, 2]) & (box[:, 2] >= box[k, 0])
                               & (box[:, 1] <= box[k, 3]) & (box[:, 3] >= box[k, 1]))
        wider = [o for o in wider if plans[o].rid != p.rid]
        if not wider:
            continue
        xy = np.asarray(p.xy, f64)[:, :2]
        arc = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        t = np.unique(np.r_[np.arange(0.0, arc[-1], points.BESIDE_STEP_M), arc[-1]])
        q = np.c_[np.interp(t, arc, xy[:, 0]), np.interp(t, arc, xy[:, 1])]
        qseg = np.clip(np.searchsorted(arc, t, side="right") - 1, 0, len(xy) - 2)
        near = np.zeros(len(t), bool)
        node = np.zeros(len(t), bool)
        for o in wider:
            oxy = np.asarray(plans[o].xy, f64)[:, :2]
            a, ab = oxy[:-1], np.diff(oxy, axis=0)
            l2 = np.maximum((ab * ab).sum(1), 1e-12)
            u = np.clip(((q[:, None, :] - a[None]) * ab[None]).sum(2) / l2[None], 0.0, 1.0)
            d = np.hypot(*(a[None] + u[..., None] * ab[None] - q[:, None, :]).transpose(2, 0, 1))
            reach = rh[o] + p.half + grading.T_MAX
            near |= d.min(axis=1) < reach
            for s in points._shared_nodes(p, plans[o]):
                node |= np.abs(t - s) < reach
        near &= ~node
        if near.any():
            out[s0[k] + np.unique(qseg[near])] = 1.0
    return np.round(out * 255.0).astype(np.uint8)


class BesideStrengthTest(unittest.TestCase):
    """_beside_strength measures a narrow road's samples only to the segments that can come within reach: the same result
    as to every segment, whatever the shapes."""

    @staticmethod
    def plan(xy, rid, half=3.0, road_half=2.0, tunnel=False):
        xy = np.array(xy, np.float64)
        p = grading.Plan(xy, np.full(len(xy), 100.0), half, road_half=road_half)
        p.rid, p.tunnel = rid, tunnel
        return p

    def same(self, plans, box=None):
        """Both results of plans (box: the plans' boxes where it isn't their own), once they are checked to be equal."""
        box = np.array([p.bbox for p in plans], np.float64) if box is None else box
        nseg = np.array([len(p.xy) - 1 for p in plans], np.int64)
        got = points._beside_strength(plans, box, nseg)
        want = beside_over_every_segment(plans, box, nseg)
        self.assertEqual(got.dtype, want.dtype)
        np.testing.assert_array_equal(got, want)
        return got

    def test_a_wider_road_whose_box_alone_comes_near(self):
        """Its corner far off, its box around the narrow road: none of its segments is measured, nothing near."""
        narrow = self.plan([[0, 0], [10, 0]], 1)
        wide = self.plan([[-500, -500], [500, -500], [500, 500]], 2, 5.0, 4.0)
        self.assertFalse(self.same([narrow, wide]).any())

    def test_a_long_segment_crossing_with_its_ends_far_off(self):
        narrow = self.plan([[0, -5], [0, 5]], 1)
        wide = self.plan([[-1000, 0], [1000, 0]], 2, 5.0, 4.0)
        np.testing.assert_array_equal(self.same([narrow, wide]), [255, 0])

    def test_segments_of_no_length(self):
        narrow = self.plan([[0, 8], [0, 8], [20, 8], [20, 8]], 1)
        wide = self.plan([[-50, 0], [-50, 0], [50, 0], [50, 0]], 2, 5.0, 4.0)
        self.assertTrue(self.same([narrow, wide])[:3].any())

    def test_right_at_the_reach(self):
        """reach 19 m (its road half 4, ours 3, T_MAX 12): a sample less than that away counts, one at it or past doesn't."""
        for y, near in ((19.0 - 1e-9, True), (19.0, False), (19.0 + 1e-9, False), (19.0 + 1e-7, False), (19.0 + 1e-5, False)):
            narrow = self.plan([[0, y], [10, y]], 1)
            wide = self.plan([[-50, 0], [50, 0]], 2, 5.0, 4.0)
            self.assertEqual(bool(self.same([narrow, wide])[0]), near, y)

    def test_a_tunnel_and_the_same_road_dont_count(self):
        narrow = self.plan([[0, 8], [20, 8]], 1)
        for wide in (self.plan([[-50, 0], [50, 0]], 2, 5.0, 4.0, tunnel=True), self.plan([[-50, 0], [50, 0]], 1, 5.0, 4.0)):
            self.assertFalse(self.same([narrow, wide]).any())

    def test_one_neighbours_node_lifts_anothers_near(self):
        """A runs beside the whole narrow road, B starts at the narrow road's first point: near B's node it blends as an
        equal, also beside A, whichever comes first."""
        narrow = self.plan([[0, 0], [10, 0], [60, 0], [90, 0]], 1)
        a = self.plan([[-200, 8], [200, 8]], 2, 5.0, 4.0)
        b = self.plan([[0, 0], [0, -200]], 3, 5.0, 4.0)
        alone = self.same([narrow, a])
        for plans in ([narrow, a, b], [narrow, b, a]):
            got = self.same(plans)[:3]
            self.assertFalse(got[0], "near the node")
            self.assertTrue(got[-1], "away from it")
        self.assertTrue(alone[0], "without B it gives way there")

    def test_lines_that_arent_finite(self):
        """A plan's box says it may be near, its line holds NaN or infinity: as measured to every segment."""
        narrow = self.plan([[0, 8], [20, 8]], 1)
        for bad in (np.nan, np.inf):
            wide = self.plan([[-50, 0], [50, 0]], 2, 5.0, 4.0)
            wide.xy = np.array([[-50.0, 0.0], [0.0, 0.0], [bad, 0.0], [5000.0, 0.0]])
            box = np.array([narrow.bbox, (-70.0, -20.0, 70.0, 20.0)])
            with np.errstate(invalid="ignore"):
                self.same([narrow, wide], box)

    def test_any_shapes(self):
        """Random roads, near the frame's origin and 1000 km from it."""
        rng = np.random.default_rng(7)
        for run in range(150):
            at = rng.choice([0.0, 1e6])
            plans = []
            for k in range(int(rng.integers(2, 7))):
                n = int(rng.integers(2, 12))
                xy = at + rng.uniform(-60, 60, 2) + np.cumsum(rng.normal(0, rng.choice([1.0, 15.0, 60.0]), (n, 2)), axis=0)
                half = float(rng.uniform(2, 9))
                plans.append(self.plan(xy, int(rng.integers(1, 5)), half, half - 1.0, tunnel=bool(rng.random() < 0.1)))
            self.same(plans)

    def test_what_a_plan_keeps_holds_for_every_pack(self):
        """The same plans again in other sets and orders, as regrade_past_ends makes them: each set as measured anew, and
        what's kept doesn't change."""
        rng = np.random.default_rng(11)
        pool = []
        for k in range(14):
            n = int(rng.integers(2, 10))
            half = float(rng.uniform(2, 9))
            xy = rng.uniform(-40, 40, 2) + np.cumsum(rng.normal(0, 15.0, (n, 2)), axis=0)
            pool.append(self.plan(xy, k % 9, half, half - 1.0, tunnel=k == 3))
        first = None
        for run in range(120):
            keep = rng.permutation(len(pool))[:int(rng.integers(2, len(pool) + 1))]
            self.same([pool[k] for k in keep])
            if run == 60:
                first = [{o: (a.copy(), b.copy()) for o, (a, b) in p.beside[3].items()} for p in pool if p.beside]
        kept = [p.beside[3] for p in pool if p.beside]
        for old, now in zip(first, kept):
            for o, (a, b) in old.items():
                np.testing.assert_array_equal(now[o][0], a)
                np.testing.assert_array_equal(now[o][1], b)
                self.assertFalse(now[o][0].flags.writeable or now[o][1].flags.writeable)

    def test_the_same_road_in_another_shape_is_measured_anew(self):
        """A new Plan of the same road (rid, half width): its own masks, not the old one's."""
        narrow = self.plan([[0, 8], [20, 8]], 1)
        near = self.plan([[-50, 0], [50, 0]], 2, 5.0, 4.0)
        far = self.plan([[-50, 500], [50, 500]], 2, 5.0, 4.0)
        box = np.array([narrow.bbox, (-70.0, -20.0, 70.0, 20.0)])
        self.assertTrue(self.same([narrow, near], box).any())
        self.assertFalse(self.same([narrow, far], box).any())

    def test_threads_on_the_same_plans(self):
        """Two plan threads building packs of the same plans at once (Grader's planning pool): each pack as measured anew."""
        from concurrent.futures import ThreadPoolExecutor
        rng = np.random.default_rng(13)
        pool = []
        for k in range(40):
            half = float(rng.uniform(2, 9))
            xy = rng.uniform(-60, 60, 2) + np.cumsum(rng.normal(0, 20.0, (8, 2)), axis=0)
            pool.append(self.plan(xy, k, half, half - 1.0))
        box = np.array([p.bbox for p in pool], np.float64)
        nseg = np.array([len(p.xy) - 1 for p in pool], np.int64)
        want = beside_over_every_segment(pool, box, nseg)
        with ThreadPoolExecutor(8) as ex:
            for got in ex.map(lambda _i: points._beside_strength(pool, box, nseg), range(8)):
                np.testing.assert_array_equal(got, want)


class AbutmentTest(unittest.TestCase):
    """(the D1 near Presov): a motorway onto a bridge over a road in a cutting 8 m under it."""

    def test_fill_keeps_the_grade_down_the_embankment(self):
        d = np.arange(0.0, 100.0, grading.PROFILE_STEP)
        road = 372.8 + 0.01 * d                 # the road on its embankment, rising 1 % away from the bridge
        z = np.where(d < 10.0, 365.0 + (road - 365.0) * d / 10.0, road)     # its map line ends down the slope
        filled = grading.fill_abutment(z, False)
        self.assertTrue(np.allclose(filled, road, atol=0.05), "the grade kept to the end")
        back = grading.fill_abutment(z[::-1], True)
        self.assertTrue(np.allclose(back, filled[::-1]), "the same from the other end")
        steady = 380.0 - 0.06 * d               # a road falling 6 % onto a bridge all the way: left alone
        self.assertIs(grading.fill_abutment(steady, False), steady)

    def test_a_lidar_bank_is_filled_from_a_smaller_drop(self):
        """A motorway's last sample 0.29 m down the bank, 15 % steeper than its grade: left on the coarse
        thresholds, filled on lidar's."""
        d = np.arange(0.0, 60.0, grading.PROFILE_STEP)
        road = 490.79 - 0.006 * d               # the road rising 0.6 % onto the bridge
        z = road.copy()
        z[0] -= 0.29
        self.assertIs(grading.fill_abutment(z, False), z)
        self.assertTrue(np.allclose(grading.fill_abutment(z, False, fine=True), road, atol=0.02))
        self.assertIs(grading.fill_abutment(road, False, fine=True), road, "a road on its grade: left alone")

    def test_the_abutment_is_its_roads(self):
        # the approach (abut at its first vertex) ends 9.7 m from the centreline of a road cut 8 m under it
        xy = np.stack([np.arange(0.0, 80.1, 4.0), np.zeros(21)], axis=1)
        approach = grading.Plan(xy, np.full(21, 372.9), 6.9, abut=(True, False))
        ys = np.arange(-200.0, 200.1, 4.0)
        lower = grading.Plan(np.stack([np.full(len(ys), -9.7), ys], axis=1), np.full(len(ys), 364.6), 8.6)
        px, py = np.array([0.0, 2.0]), np.array([0.0, 0.0])
        base = np.array([369.9, 370.6])
        out = grading.grade_points(px, py, base, [approach, lower])
        self.assertTrue(np.allclose(out, 372.9, atol=0.25), out)     # (the segments along it still blend a little)
        plain = grading.Plan(xy, np.full(21, 372.9), 6.9)     # (not onto a bridge, nor SEP_ON: ...)
        with unittest.mock.patch.object(grading, "SEP_ON", False):
            # ... the lower road's verge still gives way to the approach's carriageway, 8 m over it (grade_points' rh)
            self.assertGreater(grading.grade_points(px, py, base, [plain, lower])[0], 372.5)


class SeparationTest(unittest.TestCase):
    """a street in a cutting, a service road on the bank 7.5 m above it beside its core."""

    def setUp(self):
        xs = np.arange(-100.0, 100.1, 4.0)
        self.street = grading.Plan(np.stack([xs, np.zeros(len(xs))], axis=1), np.full(len(xs), 589.4), 9.1)
        self.bank = grading.Plan(np.stack([xs, np.full(len(xs), -15.0)], axis=1), np.full(len(xs), 596.9), 3.0)
        self.py = np.arange(-9.0, 9.1, 1.0)                         # across the street's core (the bank's 3 m off)
        self.px = np.zeros(len(self.py))
        self.base = np.where(self.py < -4.0, 594.0, 589.4)

    def test_the_street_stays_flat_across_its_core(self):
        out = grading.grade_points(self.px, self.py, self.base, [self.street, self.bank])
        self.assertLess(np.ptp(out), 0.3, out)
        with unittest.mock.patch.object(grading, "SEP_ON", False):
            # (the bank pulled its edge up before SEP; the carriageway rule keeps it flat too: the bank's verge
            # gives way to the street's carriageway, 7.5 m under it)
            old = grading.grade_points(self.px, self.py, self.base, [self.street, self.bank])
        self.assertLess(np.ptp(old), 0.3, old)


class CarriagewayFirstTest(unittest.TestCase):
    """A road in a cutting (carriageway 4 m each side) and a street 7 m above it, centres 10 m apart, its sidewalk verge
    3 m past its own carriageway (5.3 m): the verge reaches over the cutting's carriageway and gives way to it."""

    def test_verge_gives_way(self):
        xs = np.arange(-100.0, 100.1, 4.0)
        low = grading.Plan(np.stack([xs, np.zeros(len(xs))], axis=1), np.full(len(xs), 535.0), 7.0, road_half=4.0)
        high = grading.Plan(np.stack([xs, np.full(len(xs), 10.0)], axis=1), np.full(len(xs), 542.0), 8.3,
                            road_half=5.3)
        py = np.arange(-4.0, 4.01, 0.5)                              # across the low carriageway
        px = np.zeros(len(py))
        base = np.where(py > 1.0, 538.0, 535.0)
        out = grading.grade_points(px, py, base, [low, high])
        np.testing.assert_allclose(out, 535.0 + grading.ROAD_LIFT * 0, atol=0.3)
        up = grading.grade_points(np.zeros(5), np.arange(5.0, 7.1, 0.5), np.full(5, 542.0), [low, high])
        np.testing.assert_allclose(up, 542.0, atol=0.3)              # the street's own carriageway stays up


class SharpCutTest(unittest.TestCase):
    """_add_cuts: a street along y = 0 with a smoothed 4 m wall rising beside its left side (+y) gets a cutting there:
    the wall where the climb is half done, its top 4 m up; the open right side none."""

    def test_wall_on_one_side(self):
        import types
        xy = np.c_[np.arange(0.0, 81.0, 8.0), np.zeros(11)]
        p = types.SimpleNamespace(xy=xy, z=np.full(11, 10.0), half=5.0, road_half=4.0, cut=None)

        def elev(la, lo):
            _e, n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return 10.0 + 5.0 / (1.0 + np.exp(-(n - 8.0) / 0.8))
        grading._add_cuts(FRAME, [p], elev)
        self.assertIsNotNone(p.cut)
        self.assertEqual(p.cut.shape, (10, 6))
        wall, top, reach = p.cut[:, 0], p.cut[:, 1], p.cut[:, 2]
        self.assertTrue(np.isfinite(wall).all() and np.isfinite(top).all())
        np.testing.assert_allclose(wall, 8.0, atol=1.01)                # the half-way point of the climb
        np.testing.assert_allclose(top, 10.0 + 4.5, atol=0.5)          # 90 % of it
        self.assertTrue((reach > wall).all())
        self.assertTrue(np.isnan(p.cut[:, 3:]).all(), "the open side: no cutting")

    def test_a_low_bank_on_one_side_is_no_wall_but_a_trench_is(self):
        """A 2.5 m bank beside a road: a graded slope (US-163, Utah: a low rock bank was a concrete wall); the same depth
        on both sides (a trench, as Munich's McGraw-Graben): its walls."""
        import types
        xy = np.c_[np.arange(0.0, 81.0, 8.0), np.zeros(11)]
        for both in (False, True):
            p = types.SimpleNamespace(xy=xy, z=np.full(11, 10.0), half=5.0, road_half=4.0, cut=None)

            def elev(la, lo, both=both):
                _e, n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
                up = 2.5 / (1.0 + np.exp(-(n - 8.0) / 0.8))
                return 10.0 + up + (2.5 / (1.0 + np.exp((n + 8.0) / 0.8)) if both else 0.0)
            grading._add_cuts(FRAME, [p], elev)
            if not both:
                self.assertTrue(p.cut is None or np.isnan(p.cut[:, [1, 4]]).all(), "a lone low bank: no cutting")
            else:
                self.assertIsNotNone(p.cut)
                self.assertTrue(np.isfinite(p.cut[:, 1]).all() and np.isfinite(p.cut[:, 4]).all(), "a trench: both walls")

    def test_gentle_slope_is_no_wall(self):
        import types
        xy = np.c_[np.arange(0.0, 81.0, 8.0), np.zeros(11)]
        p = types.SimpleNamespace(xy=xy, z=np.full(11, 10.0), half=5.0, road_half=4.0, cut=None)

        def elev(la, lo):
            _e, n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return 10.0 + 0.2 * np.abs(n)                                # 1 in 5: a bank, not a wall
        grading._add_cuts(FRAME, [p], elev)
        self.assertIsNone(p.cut)


class DropSideTest(unittest.TestCase):
    """A road on a steep slope whose valley side falls away past its edge (a cutting's wall without a top: where the
    ground falls away the road ends): its carriageway stays flat across. The rule acts beside the road past its edge
    only; judged by the distance to each segment, the road's own segments a few metres on dropped out for the points
    right of the centre line only, a 3-7 cm step there wherever the grade changed (the Freiwand gallery)."""

    def test_flat_across_on_a_changing_grade(self):
        x = np.arange(0.0, 81.0, 4.0)
        z = 10.0 + 0.005 * (x - 40.0) ** 2                  # a sag: the segments ahead and behind do not cancel
        cut = np.full((len(x) - 1, 6), np.nan)
        cut[:, 3] = 5.0                                     # the right side: the ground falls away past the core
        p = grading.Plan(np.c_[x, np.zeros(len(x))], z, 5.0, cut=cut, road_half=4.0)
        p.rid = 1
        ys = np.arange(-3.0, 3.01, 0.5)
        px = np.full(len(ys), 40.0)
        base = 10.0 + 0.3 * ys                              # 30 % across, falling to the right (y < 0)
        got = grading.grade_points(px, ys, base, [p])
        self.assertLess(float(got.max() - got.min()), 0.01, f"flat across the carriageway: {np.round(got - got[6], 3)}")
        far = grading.grade_points(np.array([40.0]), np.array([-9.0]), np.array([10.0 - 2.7]), [p])
        self.assertAlmostEqual(float(far[0]), 10.0 - 2.7, places=6, msg="past the edge the ground falls away as it is")


class ShoulderTest(unittest.TestCase):
    def test_sidewalk_classes_keep_the_sidewalk_flat(self):
        res = roads.Spec(6.0, "paved", True, "residential")
        self.assertGreaterEqual(grading.shoulder(res), roads.SIDEWALK["w"], "the raised slab sits on flat ground")
        self.assertEqual(grading.shoulder(roads.Spec(6.0, "paved", False, "motorway")), grading.SHOULDER_M)
        self.assertEqual(grading.shoulder(roads.Spec(4.0, "dirt", False, "track")), 0.0)


class FakeMD:
    def __init__(self, feats):
        self.feats, self.calls = feats, 0

    def cell(self, key, layers=None, kind=None):
        self.calls += 1

        class C:
            pass
        c = C()
        c.layers = {"roads": self.feats}
        return c


class FailingMD:
    def __init__(self):
        self.calls = 0

    def cell(self, key, layers=None, kind=None):
        self.calls += 1
        raise OSError("offline")


class GraderTest(unittest.TestCase):
    def test_failed_fetch_not_retried_at_once(self):
        md = FailingMD()
        g = grading.Grader(FRAME, md, lambda la, lo: np.zeros(np.shape(la)))
        lat, lon = np.full((2, 2), LAT), np.full((2, 2), LON)
        base = np.ones((2, 2))
        self.assertTrue(np.array_equal(g.apply(lat, lon, base), base), "ungraded without road data")
        n = md.calls
        g.apply(lat, lon, base)
        self.assertEqual(md.calls, n, "a failed cell waits RETRY_S before it is fetched again")

    def test_plans_once_per_cell_and_dem_dropin(self):
        f = features([[(-300, 20), (300, 20)]], ["residential"])
        md = FakeMD(f)
        g = grading.Grader(FRAME, md, lambda la, lo: np.full(np.shape(la), 10.0))
        lat = np.full((3, 3), LAT)
        lon = np.full((3, 3), LON)
        g.apply(lat, lon, np.zeros((3, 3)))
        n = md.calls
        g.apply(lat, lon, np.zeros((3, 3)))
        self.assertEqual(md.calls, n, "cell plans cached")

        class Dem:
            def sample(self, la, lo, zoom, progress=None):
                return np.zeros(np.shape(la))
            other = 42
        gd = grading.GradedDem(Dem(), g)
        la, lo, _ = FRAME.enu_to_geodetic(np.array([0.0, 0.0]), np.array([20.0, 200.0]), 0.0)
        z = gd.sample(la, lo, 15)
        self.assertAlmostEqual(float(z[0]), 10.0, delta=0.05, msg="on the road: its profile")
        self.assertAlmostEqual(float(z[1]), 0.0, delta=1e-9, msg="far from it: the DEM")
        self.assertEqual(gd.other, 42, "other attributes pass through")


    def test_points_far_apart_plan_only_their_cells(self):
        # two points 27 km apart (a straight salt-flats track's ends): the cells around each, not the ~240 of their
        # bbox (one road tile planned them all: 53 s); the same heights, in an order of their own
        f = features([[(-300, 20), (300, 20)]], ["residential"])
        md = FakeMD(f)
        g = grading.Grader(FRAME, md, lambda la, lo: np.full(np.shape(la), 10.0))
        la, lo, _ = FRAME.enu_to_geodetic(np.array([0.0, 19000.0]), np.array([20.0, 19000.0]), 0.0)
        bbox = mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max()))
        self.assertGreater(len(bbox), 100)
        out = g.apply(la, lo, np.zeros(2))
        # (each point's own cells and those whose plans reach it: a cell plans CLIP_MARGIN_M past its edges; and the
        # bridges of their neighbours, read for the underpasses: grading.UNDER_*)
        self.assertLessEqual(md.calls, 30, "the cells around the two points")
        self.assertAlmostEqual(float(out[0]), 10.0, delta=0.05)
        near = mapcells.cells_near_points(la, lo, 1e-4, 1e-4)
        self.assertTrue(set(near) <= set(bbox))
        self.assertEqual(near, sorted(near, key=lambda k: (k.y, k.x)), "row-major")
        self.assertEqual({mapcells.cell_of(float(a), float(b)) for a, b in zip(la, lo)} - set(near), set())

    def test_plan_order_independent_of_the_cells(self):
        f = features([[(-300, 20), (300, 20)], [(0, -300), (0, 300)]], ["residential", "secondary"])
        g = grading.Grader(FRAME, FakeMD(f), lambda la, lo: np.full(np.shape(la), 10.0))
        la, lo, _ = FRAME.enu_to_geodetic(np.array([0.0, 5.0]), np.array([20.0, 25.0]), 0.0)
        a = g.plans(la, lo)
        la2, lo2, _ = FRAME.enu_to_geodetic(np.array([0.0, 5.0, 3000.0]), np.array([20.0, 25.0, -3000.0]), 0.0)
        b = g.plans(la2, lo2)
        self.assertEqual([id(p) for p in a], [id(p) for p in b])

    @unittest.mock.patch.object(grading, "SHARP_ON", False)        # (the profile's samples alone counted)
    def test_long_parts_planned_near_the_cell_only(self):
        # a 30 km straight track (one segment): its plan in a cell covers the cell and CLIP_MARGIN_M round it, not
        # its whole length (each cell sampled the ground to both ends: thousands of DEM tiles), with the
        # same heights in the cell; a short road is planned whole
        la, lo, _ = FRAME.enu_to_geodetic(np.array([-15000.0, 15000.0]), np.array([20.0, 20.0]), 0.0)
        f = features([[(-15000, 20), (15000, 20)], [(-300, 400), (300, 400)]], ["residential", "residential"])
        md = FakeMD(f)
        asked = []

        def elev(la_, lo_):
            asked.append(len(np.atleast_1d(la_)))
            e, _, _ = FRAME.geodetic_to_enu(la_, lo_, 0.0)
            return 10.0 + 0.001 * np.asarray(e)         # a gentle slope along the track
        g = grading.Grader(FRAME, md, elev)
        key = mapcells.cell_of(LAT, LON)
        plans = g._cell_plans(key)
        box = g._clip_box(key)
        xs = np.concatenate([p.xy[:, 0] for _f, p in plans])
        self.assertGreaterEqual(xs.min(), box[0] - 1e-6)
        self.assertLessEqual(xs.max(), box[2] + 1e-6)
        self.assertLess(sum(asked), 30000 / grading.PROFILE_STEP / 2, "not sampled along the whole track")
        short = [p for fid, p in plans if np.ptp(p.xy[:, 0]) < 700]
        self.assertEqual(len(short), 1, "the short road whole")
        y = float(plans[0][1].xy[0, 1])                 # on the track
        e = np.linspace(-600.0, 600.0, 13)
        lat, lon, _ = FRAME.enu_to_geodetic(e, np.full(len(e), y), 0.0)
        out = g.apply(lat, lon, np.zeros(len(e)))
        whole = grading.Grader(FRAME, FakeMD(f), elev)
        with unittest.mock.patch.object(grading, "LONG_PART_M", 1e9):
            want = whole.apply(lat, lon, np.zeros(len(e)))
        np.testing.assert_allclose(out, want, atol=1e-3)
        self.assertGreater(float(out.min()), 9.0, "graded to the track")

    def test_clip_polyline(self):
        xy = np.array([[-50.0, 0], [50, 0], [50, 50], [150, 50], [150, -150], [-150, -150]])
        runs = grading.clip_polyline(xy, (0, -10, 100, 100))
        self.assertEqual([r.tolist() for r in runs], [[[0.0, 0.0], [50.0, 0.0], [50.0, 50.0], [100.0, 50.0]]])
        self.assertEqual(grading.clip_polyline(np.array([[200.0, 0], [300, 0]]), (0, 0, 10, 10)), [])
        two = grading.clip_polyline(np.array([[-5.0, 5], [15, 5], [15, 7], [-5, 7]]), (0, 0, 10, 10))
        self.assertEqual(len(two), 2)


class ChainTest(unittest.TestCase):
    """A road split at a junction (BR-381): its parts are smoothed as one road."""

    @staticmethod
    def hill(la, lo):           # a 20 % grade, with a 1.5 m bump in the data right at the junction
        e, n, _ = FRAME.geodetic_to_enu(la, lo, 0.0)
        e = np.asarray(e)
        return 100.0 + 0.20 * e + 0.4 * np.sin(e / 11.0) + 1.5 * np.exp(-(e / 6.0) ** 2)

    def plans(self, on):
        # A ends at the junction (0, 0) where B goes on straight and C branches off 31 degrees to the left
        f = features([[(-300, 0), (0, 0)], [(0, 0), (300, 0)], [(0, 0), (200, 120)]], ["primary"] * 3)
        with unittest.mock.patch.object(grading, "CHAIN_ON", on):
            g = grading.Grader(FRAME, FakeMD(f), self.hill)
            return {fid: p for fid, p in g._cell_plans(mapcells.cell_of(LAT, LON))}

    def test_the_parts_meet_at_one_height(self):
        p = self.plans(True)
        a, b = p["id000"], p["id001"]
        self.assertLess(abs(a.z[-1] - b.z[0]), 0.01)
        self.assertLess(a.z[-1], 101.0, "smoothed through the junction: the bump in the data mostly gone")
        alone = self.plans(False)
        self.assertGreater(alone["id000"].z[-1], 101.4, "smoothed alone: each part pinned to the bump's top")
        # the grade goes on through the junction (the plans' last / first 8 m)
        ga = (a.z[-1] - a.z[-3]) / np.hypot(*(a.xy[-1] - a.xy[-3]))
        gb = (b.z[2] - b.z[0]) / np.hypot(*(b.xy[2] - b.xy[0]))
        self.assertAlmostEqual(ga, gb, delta=0.03)

    def test_the_straightest_part_goes_on(self):
        import fast
        cand = [np.array([[0.0, 0.0], [300.0, 0.0]]), np.array([[200.0, 120.0], [0.0, 0.5]]),
                np.array([[0.0, 0.0], [0.0, 300.0]]), np.array([[0.0, 0.0], [250.0, 1.0]])]
        cxy = np.concatenate(cand)
        coff = np.array([0, 2, 4, 6, 8], np.int64)

        def ext(roads, cls=(1, 1, 1, 1), reach=50.0):
            pts, off = fast._ef.chain_extensions(
                cxy, coff, np.array(cls, np.int64), np.array(roads, np.int64), np.array([[0.0, 0.0]]),
                np.array([[1.0, 0.0]]), np.array([1], np.int64), np.array([7], np.int64), np.array([reach]),
                1.0, 35.0, 10.0)
            return np.asarray(pts[off[0]:off[1]])
        line = ext([1, 2, 3, 4])
        self.assertEqual(line[0].tolist(), [0.0, 0.0])
        self.assertAlmostEqual(float(np.hypot(*np.diff(line, axis=0).T).sum()), 50.0, places=6)
        self.assertLess(abs(line[-1, 1]), 1e-6, "the straight one, not the 31 degree branch")
        self.assertAlmostEqual(float(ext([7, 2, 3, 4])[-1, 1]), 0.2, places=4, msg="not its own road: the next straightest")
        self.assertGreater(float(ext([7, 2, 3, 7])[-1, 1]), 10.0, "then the branch, its end at the node, turned")
        self.assertEqual(len(ext([7, 7, 3, 7])), 0, "never a 90 degree turn")
        self.assertEqual(len(ext([1, 2, 3, 4], cls=(2, 2, 2, 2))), 0, "only roads smoothed alike")


class MajorRoadTest(unittest.TestCase):
    """Motorways and trunks are smoothed more (SIGMA_MAJOR_M); a road ending on one meets it at its height (pins)."""

    @staticmethod
    def bumpy(la, lo):          # a 4 % grade with a 3 m bump 60 m long (a forest edge in a surface model)
        e, n, _ = FRAME.geodetic_to_enu(la, lo, 0.0)
        e = np.asarray(e)
        return 100.0 + 0.04 * e + 3.0 * np.exp(-((e - 20.0) / 30.0) ** 2)

    def plans(self):
        # the motorway split at the slip road's junction (0, 0); the slip road leaves at 25 degrees
        f = features([[(-400, 0), (0, 0)], [(0, 0), (400, 0)], [(0, 0), (180, -84)]], ["motorway"] * 3)
        f.rules["subclass"] = rules([(2, "link")])
        g = grading.Grader(FRAME, FakeMD(f), self.bumpy)
        return {fid: p for fid, p in g._cell_plans(mapcells.cell_of(LAT, LON))}

    def test_major_roads_smoothed_more(self):
        self.assertEqual(grading.profile_sigma(roads.Spec(7.0, "paved", False, "motorway")), grading.SIGMA_MAJOR_M)
        self.assertEqual(grading.profile_sigma(roads.Spec(7.0, "paved", False, "motorway", link=True)), grading.SIGMA_M)
        p = self.plans()
        a = p["id000"]
        bump = np.interp(20.0, a.xy[:, 0], a.z) if a.xy[-1, 0] > 20 else np.interp(20.0, p["id001"].xy[:, 0],
                                                                                    p["id001"].z)
        self.assertLess(bump - (100.0 + 0.04 * 20.0), 1.6, "most of the bump smoothed out of the motorway")

    def test_a_slip_road_meets_the_motorway(self):
        p = self.plans()
        mway, link = p["id001"], p["id002"]
        self.assertLess(abs(mway.z[0] - p["id000"].z[-1]), 0.01, "the motorway's parts meet")
        self.assertLess(abs(link.z[0] - mway.z[0]), 0.01, "the slip road ends at the motorway's height")
        self.assertGreater(abs(link.z[0] - self.bumpy(np.array([LAT]), np.array([LON]))[0]), 0.5,
                           "not at the bump's height")


class OverTunnels(unittest.TestCase):
    """Grader._over_tunnels (earthfast.over_tunnel): over the tube within its half width, from TUNNEL_KEEP_IN_M inside
    its portals."""

    def test_mask(self):
        import threading
        import types
        xy = np.array([[0.0, 0.0], [100.0, 0.0], [200.0, 0.0]])
        g = types.SimpleNamespace(lock=threading.Lock(), covers={"a": [(xy, 6.0)]})
        k = grading.TUNNEL_KEEP_IN_M
        e = np.array([50.0, 150.0, 50.0, k / 2, 200.0 - k / 2, k + 1.0, -5.0])
        n = np.array([2.0, -5.5, 7.0, 0.0, 0.0, 0.0, 0.0])
        got = grading.Grader._over_tunnels(g, e, n)
        np.testing.assert_array_equal(got, [True, True, False, False, False, True, False])
        self.assertIsNone(grading.Grader._over_tunnels(g, np.array([50.0]), np.array([30.0])))


class WallHeightTest(unittest.TestCase):
    def test_city_concrete_walls_full_height(self):
        """A major road's cutting in town keeps a full-height concrete wall (McGraw-Graben); stone walls elsewhere
        stop at WALL_MAX_H_M with the slope above them (mountain passes)."""
        import roads
        city = roads.Spec(width=12.0, kind="paved", urban=True, cls="primary", oneway=False)
        rural = roads.Spec(width=7.0, kind="paved", urban=False, cls="primary", oneway=False)
        street = roads.Spec(width=7.0, kind="paved", urban=True, cls="residential", oneway=False)
        self.assertEqual(grading.wall_max_h(city), grading.WALL_MAX_H_CITY_M)
        self.assertEqual(grading.wall_max_h(rural), grading.WALL_MAX_H_M)
        self.assertEqual(grading.wall_max_h(street), grading.WALL_MAX_H_M)


class UnderpassTest(unittest.TestCase):
    # (the clearance rule, which the coarse model keeps; lidar digs only a filled-in cutting)
    @unittest.mock.patch.object(grading._Planner, "_coarse", lambda self, key: True)
    def test_road_dips_under_a_motorway_overpass(self):
        """A local road crossing under a short motorway bridge whose terrain was interpolated at deck height (lidar
        with the bridge removed) dips to the deck minus UNDER_CLEAR_M; a road crossing nothing is left alone."""
        f = features([[(-200, 0), (200, 0)], [(0, -20), (0, 20)], [(-200, 300), (200, 300)]],
                     ["residential", "motorway", "residential"], flags=[(1, "is_bridge")])
        g = grading.Grader(FRAME, FakeMD(f), lambda la, lo: np.full(np.shape(la), 10.0))
        la, lo, _ = FRAME.enu_to_geodetic(np.array([0.0, 195.0, 0.0]), np.array([0.0, 0.0, 300.0]), 0.0)
        out = g.apply(la, lo, np.full(3, 10.0))
        self.assertAlmostEqual(float(out[0]), 10.0 - min(grading.UNDER_CLEAR_M, grading.UNDER_MAX_DROP_M),
                               delta=0.3, msg="under the deck, within the maximum excavation depth")
        self.assertAlmostEqual(float(out[1]), 10.0, delta=0.1, msg="back up past the ramp")
        # the ramp: no steeper than UNDER_GRADE, and no kinks (the grade changes smoothly)
        xs = np.arange(0.0, 200.0, 2.0)
        la, lo, _ = FRAME.enu_to_geodetic(xs, np.zeros(len(xs)), 0.0)
        z = g.apply(la, lo, np.full(len(xs), 10.0))
        grade = np.diff(z) / 2.0
        self.assertLessEqual(float(np.abs(grade).max()), grading.UNDER_MAX_GRADE + 0.005)
        self.assertLess(float(np.abs(np.diff(grade)).max()), 0.01, "no kink")
        self.assertAlmostEqual(float(out[2]), 10.0, delta=0.1, msg="another road untouched")


class UnderpassHumpTest(unittest.TestCase):
    """UNDER_HUMP_*: dug only where the elevation is filled under the deck, down to the road's line."""

    def _road_z(self, elev, xs):
        f = features([[(-200, 0), (200, 0)], [(0, -20), (0, 20)]], ["residential", "motorway"],
                     flags=[(1, "is_bridge")])
        g = grading.Grader(FRAME, FakeMD(f), elev)
        la, lo, _ = FRAME.enu_to_geodetic(xs, np.zeros(len(xs)), 0.0)
        return g.apply(la, lo, np.asarray(elev(la, lo), np.float64))

    def test_a_road_in_its_cutting_is_left_alone(self):
        """The elevation shows the road's own level under the bridge (lidar): nothing dug, though the clearance
        rule wanted 6 m."""
        xs = np.array([0.0, 30.0, 120.0])
        out = self._road_z(lambda la, lo: np.full(np.shape(la), 10.0), xs)
        self.assertTrue(np.allclose(out, 10.0, atol=0.1), out)

    def test_a_filled_road_is_dug_to_its_line(self):
        """Elevation filled 6 m over the road under the deck (the bridge removed and the gap interpolated): the road
        comes down to its own grade through the bridge, and stays as it was away from it."""
        def elev(la, lo):
            x, _y, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), np.zeros(np.shape(la)))
            return 10.0 + 0.02 * np.asarray(x) + np.where(np.abs(np.asarray(x)) < 6.0, 6.0, 0.0)
        xs = np.array([0.0, 120.0, -120.0])
        out = self._road_z(elev, xs)
        self.assertAlmostEqual(float(out[0]), 10.0, delta=0.4, msg="under the deck: the road's own line")
        self.assertAlmostEqual(float(out[1]), 10.0 + 2.4, delta=0.1, msg="away from it as before")
        self.assertAlmostEqual(float(out[2]), 10.0 - 2.4, delta=0.1, msg="away from it as before")




class UnderpassShortfallTest(unittest.TestCase):
    # (the clearance rule, which the coarse model keeps; lidar digs only a filled-in cutting)
    @unittest.mock.patch.object(grading._Planner, "_coarse", lambda self, key: True)
    def test_road_under_gives_way_for_what_the_ramps_could_not_raise(self):
        """A local road's bridge over a motorway (the motorway never rises): with room for its ramps the overpass rises
        and the motorway stays; with frontage roads hugging both ends (the ramps held down) the motorway dips under it
        instead (BR-381 near Pouso Alegre: ~1 m of clearance, the AI car drove into the abutment)."""
        mway = [(-300, 0), (300, 0)]
        bridge = [(0, -20), (0, 20)]
        ramps = [[(0, -260), (0, -20)], [(0, 20), (0, 260)]]
        frontage = [[(-150, -26), (150, -26)], [(-150, 26), (150, 26)]]

        def motorway_z(lines, classes):
            f = features(lines, classes, flags=[(1, "is_bridge")])
            g = grading.Grader(FRAME, FakeMD(f), lambda la, lo: np.full(np.shape(la), 10.0))
            la, lo, _ = FRAME.enu_to_geodetic(np.array([0.0, 250.0]), np.array([0.0, 0.0]), 0.0)
            return g.apply(la, lo, np.full(2, 10.0))
        free = motorway_z([mway, bridge] + ramps, ["motorway", "tertiary", "tertiary", "tertiary"])
        self.assertAlmostEqual(float(free[0]), 10.0, delta=0.3, msg="the overpass rises: the motorway stays")
        held = motorway_z([mway, bridge] + ramps + frontage, ["motorway", "tertiary", "tertiary", "tertiary",
                                                               "residential", "residential"])
        self.assertLess(float(held[0]), 10.0 - 0.6 * grading.UNDER_CLEAR_M, "ramps held down: the motorway dips")
        self.assertAlmostEqual(float(held[1]), 10.0, delta=0.1, msg="back up past its ramp")
        with unittest.mock.patch.object(grading, "UNDER_ANY_ON", False):
            off = motorway_z([mway, bridge] + ramps + frontage, ["motorway", "tertiary", "tertiary", "tertiary",
                                                                  "residential", "residential"])
        self.assertAlmostEqual(float(off[0]), 10.0, delta=0.3, msg="BNE_UNDERPASS_ANY=off: as before")


class RacewayKeepTest(unittest.TestCase):
    def test_track_surface_is_the_terrain(self):
        """A road crossing a racetrack at grade: on the track (its carriageway + margin) the terrain stays as it is
        (a banked oval's slope), off it the road is graded as usual."""
        f = features([[(-200, 0), (200, 0)], [(0, -100), (0, 100)]], ["raceway", "residential"])

        def sloped(la, lo):         # a banking: the ground rising to the north
            _e, n, _ = FRAME.geodetic_to_enu(np.asarray(la), np.asarray(lo), 0.0)
            return 10.0 + 0.3 * np.asarray(n)
        g = grading.Grader(FRAME, FakeMD(f), sloped)
        la, lo, _ = FRAME.enu_to_geodetic(np.array([0.0, 0.0]), np.array([3.0, 60.0]), 0.0)
        base = sloped(la, lo)
        out = g.apply(la, lo, base)
        self.assertAlmostEqual(float(out[0]), float(base[0]), places=6, msg="on the track: the terrain")



class NeverRaisedTest(unittest.TestCase):
    def test_links_are_raised_motorways_not(self):
        S = roads.Spec
        self.assertTrue(grading._never_raised(S(18.8, "paved", False, "motorway", True)))
        self.assertFalse(grading._never_raised(S(11.6, "paved", False, "motorway", True, link=True)))
        self.assertFalse(grading._never_raised(S(8.0, "paved", False, "secondary", False)))


class JunctionTest(unittest.TestCase):
    def test_side_road_meets_the_road_it_joins(self):
        import roads
        x = np.arange(-200, 201, 4.0)
        main = grading.Plan(np.stack([x, 0 * x], 1), 10 + 0.02 * x, 5, road_half=4)
        y = np.arange(0, 201, 4.0)
        side = grading.Plan(np.stack([0 * y + 50, y], 1), 11.8 + 0 * y, 3, road_half=3)   # 0.8 m over the main road
        grading.snap_junctions([main, side], [roads.Spec(8.0, "paved", False, "primary", False),
                                              roads.Spec(6.0, "paved", False, "residential", False)])
        self.assertAlmostEqual(side.z[0], 11.0, places=6)                  # at the main road's height where it joins
        self.assertAlmostEqual(side.z[-1], 11.8, places=6)                 # its own height past the taper
        self.assertTrue(np.all(np.diff(side.z[:12]) >= -1e-9))             # eased in, no bump
        np.testing.assert_allclose(main.z, 10 + 0.02 * x)                  # the main road keeps its profile

    def test_a_side_road_follows_its_road_down_into_a_dip(self):
        """Baltimore's Haven Street: the alleys were snapped to the street before the underpass dip lowered
        it 3.5 m, each a hump; snapped again after the dips, they meet it at its new height (a second snap is what
        Grader._make_cell runs after _lower_underpasses)."""
        import roads
        x = np.arange(-200, 201, 4.0)
        main = grading.Plan(np.stack([x, 0 * x], 1), 10.0 + 0 * x, 5, road_half=4)
        y = np.arange(0, 101, 4.0)
        side = grading.Plan(np.stack([0 * y + 50, y], 1), 10.0 + 0 * y, 2, road_half=2)
        specs = [roads.Spec(8.0, "paved", False, "primary", False), roads.Spec(4.0, "paved", False, "service", False)]
        grading.snap_junctions([main, side], specs)
        main.z = main.z - 3.0 * np.exp(-((x - 60.0) / 40.0) ** 2)     # the dip, after the first snap
        grading.snap_junctions([main, side], specs)
        _d, zq, _e = grading._nearest_on(main, 50.0, 0.0)
        self.assertAlmostEqual(side.z[0], zq, places=6)
        self.assertAlmostEqual(side.z[-1], 10.0, places=6)

    def test_a_road_crossing_a_bigger_one_meets_it_there(self):
        """(Perm): a service road crossing a primary at a shared node, 4 m higher, stood as a wall across
        it; it takes the primary's height at the crossing, eased in either side; the primary keeps its own. (Opt-in with
        the coarse easing: BNE_COARSE_EASE=1.)"""
        import roads
        from unittest import mock
        patcher = mock.patch.object(grading, "COARSE_EASE_ON", True)
        patcher.start()
        self.addCleanup(patcher.stop)
        x = np.arange(-200, 201, 4.0)
        main = grading.Plan(np.stack([x, 0 * x], 1), 10.0 + 0 * x, 5, road_half=5)
        y = np.arange(-200, 201, 4.0)
        cross = grading.Plan(np.stack([0 * y + 20, y], 1), 14.0 + 0 * y, 3, road_half=2)
        grading.snap_junctions([main, cross], [roads.Spec(10.0, "paved", False, "primary", False),
                                               roads.Spec(4.0, "paved", False, "service", False)])
        mid = int(np.argmin(np.abs(y)))
        self.assertAlmostEqual(cross.z[mid], 10.0, places=6)
        self.assertAlmostEqual(cross.z[0], 14.0, places=6)
        np.testing.assert_allclose(main.z, 10.0)

    def test_a_continuation_is_not_a_junction(self):
        import roads
        x = np.arange(0, 201, 4.0)
        a = grading.Plan(np.stack([x, 0 * x], 1), 10 + 0 * x, 4, road_half=3)
        b = grading.Plan(np.stack([x + 200, 0 * x], 1), 11 + 0 * x, 4, road_half=3)
        res = roads.Spec(6.0, "paved", False, "residential", False)
        grading.snap_junctions([a, b], [res, res])
        self.assertEqual((a.z[-1], b.z[0]), (10.0, 11.0))

    def test_the_other_carriageway_beside_it_is_no_junction(self):
        """An approach's end 7 m beside the other carriageway, 0.35 m higher on the cross slope, keeps its own
        height; a motorway road joining that carriageway square on still meets it."""
        import roads
        x = np.arange(-200, 201, 4.0)
        other = grading.Plan(np.stack([x, 0 * x], 1), 10.35 + 0 * x, 6, road_half=5)
        xa = np.arange(-100, 1, 4.0)
        beside = grading.Plan(np.stack([xa, 0 * xa + 7], 1), 10.0 + 0 * xa, 6, road_half=5)
        y = np.arange(0, 101, 4.0)
        square = grading.Plan(np.stack([0 * y + 100, y + 4], 1), 10.0 + 0 * y, 6, road_half=5)
        mw = roads.Spec(11.0, "paved", True, "motorway", False)
        grading.snap_junctions([other, beside, square], [mw, mw, mw])
        self.assertEqual(beside.z[-1], 10.0)
        self.assertAlmostEqual(square.z[0], 10.35, places=6)


class UnderDeckTest(unittest.TestCase):
    def test_the_plan_goes_on_under_the_deck_at_its_grade(self):
        """A plan rising 2 % onto a bridge at its end gets a vertex UNDER_DECK_M past it, at its
        grade, UNDER_DECK_FALL below it; its other end (no bridge) is left."""
        x = np.arange(0.0, 101.0, 4.0)
        xy, z, grow, _opens = grading._under_deck(np.stack([x, 0 * x], 1), 0.02 * x, (False, True), 4.0)
        self.assertEqual(grow, (0, 1))
        np.testing.assert_allclose(xy[-1], [100.0 + grading.UNDER_DECK_M, 0.0])
        self.assertAlmostEqual(z[-1], 2.0 + (0.02 - grading.UNDER_DECK_FALL) * grading.UNDER_DECK_M)
        np.testing.assert_allclose(z[:-1], 0.02 * x)
        _xy, _z, grow, _opens = grading._under_deck(np.stack([x, 0 * x], 1), 0.02 * x, (False, False), 4.0)
        self.assertEqual(grow, (0, 0))

    def test_it_stops_where_the_elevation_opens_under_the_deck(self):
        """Under the deck the plan goes on only as far as the elevation stands within UNDER_DECK_OPEN_M of the
        approach's grade line: a stream's bank 3 m past the abutment, 7 m deep beyond it (RN 147 at Moulismes)."""
        x = np.arange(0.0, 101.0, 4.0)

        def ground(xy):
            a = xy[:, 0] - 100.0
            return np.where(a <= 3.0, 2.0 + 0.02 * a, 2.0 + 0.02 * a - 7.0)
        xy, z, grow, opens = grading._under_deck(np.stack([x, 0 * x], 1), 0.02 * x, (False, True), 4.0, ground)
        self.assertEqual(grow, (0, 1))
        self.assertEqual(opens, (False, True))
        np.testing.assert_allclose(xy[-1], [103.0, 0.0])
        self.assertAlmostEqual(z[-1], 2.0 + (0.02 - grading.UNDER_DECK_FALL) * 3.0)

    def test_at_least_one_terrain_cell_under_the_deck(self):
        """Elevation open right past the abutment: the plan still goes on UNDER_DECK_MIN_M (the terrain cell under the
        deck's end on the road's height: no hole under the joint)."""
        x = np.arange(0.0, 101.0, 4.0)
        xy, _z, _grow, _opens = grading._under_deck(np.stack([x, 0 * x], 1), 0.02 * x, (False, True), 4.0,
                                                    lambda q: np.full(len(q), -10.0))
        np.testing.assert_allclose(xy[-1], [100.0 + grading.UNDER_DECK_MIN_M, 0.0])

    def test_closed_under_the_deck_it_goes_on_and_blends_out_as_before(self):
        """The elevation at the road's height under the deck's first UNDER_DECK_M (a deck along a slope the lidar draws
        at the road, the Grossglockner road at 6.6 km): no opening, the plan goes on UNDER_DECK_M and its grading is not
        cut (Plan.beyond None): cut off, the lidar came up through the deck's start."""
        x = np.arange(0.0, 101.0, 4.0)
        xy, _z, grow, opens = grading._under_deck(np.stack([x, 0 * x], 1), 0.02 * x, (False, True), 4.0,
                                                  lambda q: 2.0 + 0.02 * (q[:, 0] - 100.0) + 0.05)
        np.testing.assert_allclose(xy[-1], [100.0 + grading.UNDER_DECK_M, 0.0])
        self.assertEqual((grow, opens), ((0, 1), (False, False)))


class PastEndsTest(unittest.TestCase):
    """regrade_past_ends: a plan's grading stops square across at an abutment's end (Plan.beyond); the ground past it
    is the elevation's, graded by the other roads alone."""

    def approach(self, beyond):
        x = np.arange(0.0, 51.0, 2.0)
        p = grading.Plan(np.stack([x, 0 * x], 1), np.full(len(x), 10.0), 8.0, (False, True), road_half=5.0)
        p.rid = 1
        p.beyond = beyond
        return p

    def graded(self, plans, px, py):
        base = np.full(len(px), 3.0)
        out = grading.grade_points(px, py, base, plans)
        return grading.regrade_past_ends(px, py, base, plans, out)

    def test_the_ground_past_an_abutment_is_the_elevations(self):
        px, py = np.array([49.0, 52.0, 55.0, 51.0]), np.array([0.0, 0.0, 5.0, -6.0])
        out = self.graded([self.approach((None, 0.0))], px, py)
        self.assertAlmostEqual(out[0], 10.0, places=2)             # (on the plan: the road)
        np.testing.assert_allclose(out[1:], 3.0, atol=1e-6)         # (past its end: the stream bed)

    def test_the_pack_of_the_other_plans_is_made_once_and_grades_the_same(self):
        """(a pack takes a second on a busy map: made anew on every call, the A2's last tiles took minutes)"""
        y = np.arange(-30.0, 31.0, 2.0)
        under = grading.Plan(np.stack([0 * y + 60.0, y], 1), np.full(len(y), 4.0), 4.0, road_half=3.0)
        under.rid = 2
        plans = [self.approach((None, 0.0)), under]
        px, py = np.array([49.0, 52.0, 55.0, 58.0]), np.array([0.0, 0.0, 5.0, 2.0])
        base = np.full(len(px), 3.0)
        pack = grading.PlanPack(plans)
        out = grading.grade_points(px, py, base, pack)
        alone = grading.regrade_past_ends(px, py, base, plans, out)
        with unittest.mock.patch.object(grading.bridges, "PlanPack", wraps=grading.PlanPack) as made:
            first = grading.regrade_past_ends(px, py, base, plans, out, 0.0, pack)
            second = grading.regrade_past_ends(px, py, base, plans, out, 0.0, pack)
        self.assertEqual(made.call_count, 1)
        np.testing.assert_array_equal(first, alone)
        np.testing.assert_array_equal(second, alone)

    def test_no_other_plan_leaves_the_elevation(self):
        plans = [self.approach((None, 0.0))]
        px, py = np.array([52.0]), np.array([0.0])
        base = np.full(1, 3.0)
        pack = grading.PlanPack(plans)
        for _ in range(2):
            got = grading.regrade_past_ends(px, py, base, plans, grading.grade_points(px, py, base, pack), 0.0, pack)
            np.testing.assert_allclose(got, 3.0)

    def test_without_the_cut_the_end_fills_under_the_deck(self):
        """(the cause: a point past a segment's end takes the end's height up to the core's half width)"""
        out = self.graded([self.approach((None, None))], np.array([52.0]), np.array([0.0]))
        self.assertAlmostEqual(out[0], 10.0, places=2)

    def test_an_end_going_on_under_its_deck_is_never_raised(self):
        """raisable_ends: the approach ramps (_lift_approaches) leave an end that goes on under its deck (Plan.under:
        the lidar shows its embankment), cut where the elevation opens or not; any other end may rise."""
        cut, closed, other = self.approach((None, 0.0)), self.approach((None, None)), self.approach((None, None))
        cut.under = closed.under = (False, True)
        np.testing.assert_array_equal(grading.raisable_ends([cut, closed, other]),
                                      [[True, False], [True, False], [True, True]])

    def test_a_road_under_the_bridge_still_grades_it(self):
        y = np.arange(-30.0, 31.0, 2.0)
        under = grading.Plan(np.stack([0 * y + 60.0, y], 1), np.full(len(y), 4.0), 4.0, road_half=3.0)
        under.rid = 2
        out = self.graded([self.approach((None, 0.0)), under], np.array([60.0]), np.array([0.0]))
        self.assertAlmostEqual(out[0], 4.0, places=2)


if __name__ == "__main__":
    unittest.main()


class CoarseEaseTest(unittest.TestCase):
    """earthfast.ease_coarse: roads side by side on a coarse DEM brought together."""

    def run_ease(self, z_main, z_side, gap_y, rank_side=1, take=(1, 1)):
        import fast
        fast.require(94, "ease_coarse")
        x = np.linspace(0.0, 200.0, 41)
        xy = np.concatenate([np.c_[x, np.zeros_like(x)], np.c_[x, np.full_like(x, gap_y)]])
        z = np.concatenate([np.full_like(x, z_main), np.full_like(x, z_side)])
        off = np.array([0, len(x), 2 * len(x)], np.int64)
        out = fast._ef.ease_coarse(np.ascontiguousarray(xy), z, off, np.array([7, rank_side], np.int64),
                                   np.array([4.0, 2.0]), np.array(take, np.uint8), grading.COARSE_REACH_M,
                                   grading.COARSE_MAX_STEP_M, grading.COARSE_MAX_SLOPE, grading.COARSE_SIGMA_M)
        return out[:len(x)], out[len(x):]

    def test_a_service_road_beside_a_primary_comes_down_to_it(self):
        main, side = self.run_ease(100.0, 104.5, 7.0)
        np.testing.assert_allclose(main, 100.0)                     # the higher rank stays
        self.assertLess(float(np.median(side)), 101.0)               # the 4.5 m wall mostly gone
        self.assertGreater(float(np.median(side)), 100.0)            # (a little cross slope kept)

    def test_far_roads_and_real_separations_stay(self):
        _m, far = self.run_ease(100.0, 104.5, 60.0)
        np.testing.assert_allclose(far, 104.5)
        _m, sep = self.run_ease(100.0, 108.0, 7.0)                   # 8 m: an overpass or a cutting, left alone
        np.testing.assert_allclose(sep, 108.0)
        _m, kept = self.run_ease(100.0, 104.5, 7.0, take=(1, 0))      # a bridge approach: as it was
        np.testing.assert_allclose(kept, 104.5)

    def test_equal_ranks_meet_halfway(self):
        main, side = self.run_ease(100.0, 104.0, 7.0, rank_side=7)
        self.assertLess(float(np.median(side) - np.median(main)), 2.5)
