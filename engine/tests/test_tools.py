"""The tools in tools/ an agent reads a report with: what they conclude from their numbers. Every tool is named in tools/README.md,
the catalogue linked from AGENTS.md."""
import collections
import glob
import json
import os
import sys
import tempfile
import unittest
import unittest.mock
from types import SimpleNamespace

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(ENGINE)
sys.path.insert(0, os.path.join(ROOT, "tools"))

import compare_parts  # noqa: E402
import debug_stretch  # noqa: E402
import editor_memory  # noqa: E402
import heights  # noqa: E402
import map_spot  # noqa: E402
import mark  # noqa: E402
import measure  # noqa: E402
import plants  # noqa: E402
import spot  # noqa: E402
import stability  # noqa: E402
import surroundings  # noqa: E402
import watch_build as wb  # noqa: E402


def row(t, s=100.0, kmh=50.0, vert=0.0, off=0.0, susp=(0.01, 0.01, 0.03, 0.03)):
    """One sample of a mark's csv."""
    return {"time_s": t, "route_m": s, "off_m": off, "x": s, "y": 0.0, "z": 0.0, "speed_kmh": kmh, "acc_vert_g": vert,
            "acc_side_g": 0.0, "acc_long_g": 0.0, "susp_fl": susp[0], "susp_fr": susp[1], "susp_rl": susp[2],
            "susp_rr": susp[3]}


class DebugStretchTest(unittest.TestCase):
    XY = [[0.0, 0.0], [100.0, 0.0], [200.0, 0.0], [300.0, 0.0], [400.0, 0.0]]
    LINE = [[1.0, 10.0], [2.0, 20.0], [3.0, 30.0], [4.0, 40.0], [5.0, 50.0]]

    def test_the_name_says_debug_and_where(self):
        self.assertEqual(debug_stretch.stretch_name("heiligenblut_test", 13100.0, 13300.0), "heiligenblut_test_13200_debug")

    def test_the_cut_ends_on_its_metres_with_the_run_off_behind(self):
        line, end = debug_stretch.cut_line(self.XY, self.LINE, 50.0, 250.0, run_off=100.0)
        np.testing.assert_allclose(line, [[1.5, 15.0], [2.0, 20.0], [3.0, 30.0], [3.5, 35.0], [4.0, 40.0], [4.5, 45.0]])
        self.assertEqual(end, 3)

    def test_at_the_route_s_end_there_is_no_run_off(self):
        line, end = debug_stretch.cut_line(self.XY, self.LINE, 300.0, 400.0)
        self.assertEqual((line, end), ([[4.0, 40.0], [5.0, 50.0]], 1))

    def test_a_stretch_off_the_route_stops(self):
        with self.assertRaises(SystemExit):
            debug_stretch.cut_line(self.XY, self.LINE, 300.0, 500.0)


class SpotTest(unittest.TestCase):
    HEIGHTS = ("the map there (Overture / OpenStreetMap):\n"
               "  road 839f9e08-7094  0.8 m off: residential, paved, 8.0 m wide; levels none\n"
               "    {'name': 'x'}\n"
               "  road 4b3a8ba3-7725  0.4 m off: secondary, paved, 8.0 m wide; levels [(0.1, 0.2, 'is_bridge')]\n")
    STEPS = ("Chjassu f943c382: pins (first end, last end; the stronger road's height there): [(162.55, 142.72)]\n"
             "  part of 147 m, free (False, True); m from its last point\n"
             "      m elevation    profile       snap  over elevation\n"
             "      0    146.36     142.72     146.33    -0.02\n"
             "     12    147.49     146.44     149.31    +1.83\n"
             "     68    156.15     154.88     154.88    -1.27\n")

    def test_the_roads_nearest_first(self):
        self.assertEqual(spot.roads_in(self.HEIGHTS), [("4b3a8ba3-7725", 0.4, "secondary, paved, 8.0 m wide"),
                                                       ("839f9e08-7094", 0.8, "residential, paved, 8.0 m wide")])

    def test_how_far_a_plan_leaves_the_elevation(self):
        self.assertEqual(spot.off_elevation(self.STEPS), (1.83, 12, "[(162.55, 142.72)]"))
        self.assertEqual(spot.off_elevation("no road"), (None, None, ""))


class PlantsTest(unittest.TestCase):
    def test_a_share_is_of_all_counted_with_its_total(self):
        self.assertEqual(plants.shares(collections.Counter(a=3, b=1)), "a 75 %, b 25 % (of 4)")
        self.assertEqual(plants.shares(collections.Counter()), "nothing")

    def test_built_trees_by_their_model_from_the_tile_s_list(self):
        listed = {"kinds": [], "treefx": [{"model": "spruce"}, {"model": "shrub"}, {"model": "spruce"}]}
        self.assertEqual(plants.built_trees(listed), collections.Counter(spruce=2, shrub=1))
        self.assertEqual(plants.built_trees({}), collections.Counter())


class PointWhyTest(unittest.TestCase):
    def test_a_plan_at_a_point(self):
        import grading
        p = grading.Plan(np.array([[0.0, 0.0], [10.0, 0.0], [20.0, 0.0]]), np.array([1.0, 2.0, 4.0]), 3.0, road_half=2.0)
        p.rid = 1
        p.cut = np.full((2, 6), np.nan)
        p.cut[1, :2] = (2.5, 9.0)
        pack = unittest.mock.Mock(yl=np.array([0, 255]), bw=np.array([255, 0]))
        got = heights.plan_at(p, 0, np.array([15.0, 1.0]), pack)
        self.assertEqual((got["k"], got["d"], got["z"], got["left"], got["yl"], got["bw"]), (1, 1.0, 3.0, True, 255, 0))
        self.assertEqual(list(got["cut"][:2]), [2.5, 9.0])
        self.assertFalse(heights.plan_at(p, 0, np.array([5.0, -1.0]), pack)["left"])

    def test_steps_keep_only_what_changed(self):
        import grading
        p = grading.Plan(np.array([[0.0, 0.0], [10.0, 0.0]]), np.array([1.0, 2.0]), 3.0)
        p.rid = 7
        s = heights.PlanSteps()
        s.keep("profile", [p])
        s.keep("snap", [("fid", p)])
        p.z = np.array([1.5, 2.0])
        s.keep("lift", [p])
        self.assertEqual([g[0] for g in s.rows[(7, 0.0, 0.0)]], ["profile", "lift"])


class TileOrderTest(unittest.TestCase):
    TILES = [(0, 0), (1, 0), (2, 0), (3, 0)]

    def test_each_order_holds_every_tile(self):
        P = stability.parallel
        self.assertEqual(P.tile_order(self.TILES, None), self.TILES)
        self.assertEqual(P.tile_order(self.TILES, "forward"), self.TILES)
        self.assertEqual(P.tile_order(self.TILES, "reverse"), self.TILES[::-1])
        self.assertEqual(P.tile_order(self.TILES, "first:2,0")[0], (2, 0))
        self.assertEqual(P.tile_order(self.TILES, "last:0,0")[-1], (0, 0))
        got = P.tile_order(self.TILES, "shuffle:1")
        self.assertEqual(got, P.tile_order(self.TILES, "shuffle:1"))
        self.assertEqual(sorted(got), self.TILES)

    def test_a_wrong_order_stops_the_build(self):
        for how in ("sideways", "first:9,9"):
            with self.assertRaises(ValueError):
                stability.parallel.tile_order(self.TILES, how)

    def test_orders_keep_a_tiles_comma(self):
        self.assertEqual(stability.split_orders("forward,first:7,5,shuffle:1,last:-1,-2"),
                         ["forward", "first:7,5", "shuffle:1", "last:-1,-2"])


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

    def test_the_newest_session_of_a_track_with_a_mark_or_a_drive_is_found(self):
        import tempfile
        with tempfile.TemporaryDirectory() as root:
            for name, has in (("rechberg_test_20261101_115118", "mark_01.csv"), ("rechberg_test_20261103_083656", "mark_01.csv"),
                              ("rechberg_test_20261103_090000", None), ("griffen_test_20261104_100000", "mark_01.csv"),
                              ("henderson_20261103_112959", mark.DRIVE)):
                os.makedirs(os.path.join(root, name))
                if has:
                    open(os.path.join(root, name, has), "w").close()
            self.assertEqual(os.path.basename(mark.find_session("rechberg", root)), "rechberg_test_20261103_083656")
            self.assertEqual(os.path.basename(mark.find_session(None, root)), "griffen_test_20261104_100000")
            self.assertEqual(os.path.basename(mark.find_session("henderson", root)), "henderson_20261103_112959")
            self.assertIsNone(mark.find_session("stausee", root))

    def test_a_row_s_side_of_the_line_right_is_plus(self):
        route = np.array([[0.0, 0.0], [100.0, 0.0]])     # (going east along AC x: z south is its right)
        rows = [dict(row(0.0, s=50.0), x=50.0, z=2.5), dict(row(1.0, s=60.0), x=60.0, z=-3.0)]
        np.testing.assert_allclose(mark.sides(rows, route), [2.5, -3.0], atol=1e-9)
        north = np.array([[0.0, 0.0], [0.0, -100.0]])    # (going north: -z; x east is its right)
        np.testing.assert_allclose(mark.sides([dict(row(0.0, s=50.0), x=2.0, z=-50.0)], north), [2.0], atol=1e-9)

    def road_and_grass(self, strips):
        """Small triangles along AC x 30..70 at y 0: strips [(z from, z to, object name)]. (T3, names)"""
        tris, names = [], []
        for z0, z1, name in strips:
            for x in np.arange(30.0, 70.0, 4.0):
                for z in np.arange(z0, z1 - 1e-9, 1.0):
                    a, b, c, d = [x, 0, z], [x + 4, 0, z], [x + 4, 0, z + 1], [x, 0, z + 1]
                    tris += [[a, c, b], [a, d, c]]
                    names += [name, name]
        return np.array(tris, np.float64), np.array(names, object)

    def test_a_median_anywhere_between_the_line_and_the_car_is_another_road(self):
        """A motorway's median lies in the first metres: the other carriageway 10 m off, grass 3-5 m off."""
        car = dict(row(0.0, s=50.0, off=10.0), x=50.0, y=0.0, z=10.0)
        foot = (50.0, 0.0, 1.0, 0.0)
        road, grass = "1ROAD_ground_0_0", "1GRASS_ground_0_0"
        for strips, same in (([(-5, 3, road), (3, 5, grass), (5, 15, road)], False),
                             ([(-5, 7, road), (7, 9, grass), (9, 15, road)], False),
                             ([(-5, 15, road)], True)):
            T3, names = self.road_and_grass(strips)
            self.assertEqual(mark.same_road(car, foot, T3, names), same, strips)

    def test_lanes_past_the_6_m_are_the_road_a_median_between_is_not(self):
        self.assertTrue(mark.on_one_road(["1ROAD_deck_0", "1ROAD_ground_0_0"]))
        self.assertFalse(mark.on_one_road(["1ROAD_deck_0", "1GRASS_ground_0_0", "1ROAD_ground_0_0"]))
        self.assertFalse(mark.beside(dict(row(0.0, off=8.0), beside=False)), "read off the track: wide lanes")
        self.assertTrue(mark.beside(row(0.0, off=8.0)), "not read: past BESIDE_M")

    def test_the_surface_under_the_car_in_runs_beside_the_road_left_out(self):
        rows = [row(0.0, s=100.0), row(1.0, s=110.0), row(2.0, s=120.0), row(3.0, s=130.0, off=9.0), row(4.0, s=140.0)]
        names = ["1ROAD_ground_0_0", "1GRASS_ground_0_0", "1GRASS_ground_0_0_1", "1GRASS_ground_0_0", ""]
        got = [(a["route_m"], b["route_m"], n) for a, b, n in mark.surface_runs(rows, names)]
        self.assertEqual(got, [(100.0, 100.0, "1ROAD_ground_0_0"), (110.0, 120.0, "1GRASS_ground_0_0"),
                               (140.0, 140.0, "nothing")])


class PadTest(unittest.TestCase):
    def test_a_fan_in_the_deck_object_is_a_pad_a_ribbon_is_not(self):
        c = [5.0, 100.0, 5.0]
        ring = [[0, 100, 0], [10, 100, 0], [10, 100, 10], [0, 100, 10]]
        fan = [[c, ring[i], ring[(i + 1) % 4]] for i in range(4)]
        ribbon = []
        for x in (20.0, 25.0, 30.0):
            ribbon += [[[x, 100, 0], [x + 5, 100, 0], [x + 5, 100, 8]], [[x, 100, 0], [x + 5, 100, 8], [x, 100, 8]]]
        T3 = np.array(fan + ribbon, np.float64)
        got = measure.pad_triangles(T3, np.ones(len(T3), bool))
        self.assertEqual(got.tolist(), [True] * 4 + [False] * 6)
        self.assertFalse(measure.pad_triangles(T3, np.zeros(len(T3), bool)).any(), "only in the deck objects")

    def test_three_triangles_of_a_ribbon_cut_out_by_the_box_are_no_pad(self):
        ribbon = []
        for x in (0.0, 4.0, 8.0, 12.0):       # (as roadmesh's rows: (A, B, B1), (A, B1, A1))
            A, A1, B, B1 = [x, 0, 0], [x + 4, 0, 0], [x, 0, 8], [x + 4, 0, 8]
            ribbon += [[A, B, B1], [A, B1, A1]]
        ribbon = np.array(ribbon, np.float64)
        for a in range(len(ribbon) - 2):
            self.assertFalse(measure.pad_triangles(ribbon[a:a + 3], np.ones(3, bool)).any(), a)


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


class SurfaceTest(unittest.TestCase):
    def test_a_tile_touches_a_box_within_its_reach(self):
        # t_-22_15: x -5632..-5376, north 3840..4096, so z -4096..-3840
        self.assertTrue(measure.tile_touches("t_-22_15.obj", (-5600, -3900, -5590, -3890)))
        self.assertTrue(measure.tile_touches("t_-22_15.obj", (-5370, -3900, -5360, -3890)), "within its reach east")
        self.assertFalse(measure.tile_touches("t_-22_15.obj", (-5000, -3900, -4990, -3890)))
        self.assertFalse(measure.tile_touches("t_-22_15.obj", (-5600, -3700, -5590, -3690)), "south of it")

    def test_split_parts_are_one_object_and_the_prefix_is_the_physics(self):
        self.assertEqual(measure.unsplit("1GRASS_ground_-22_14_1"), "1GRASS_ground_-22_14")
        self.assertEqual(measure.unsplit("1ROAD_deck_asphalt_-21_13"), "1ROAD_deck_asphalt_-21_13")
        self.assertEqual(measure.physics("1GRASS_ground_-22_14"), "1GRASS")

    def test_runs_of_equal_values(self):
        self.assertEqual(measure.runs([1, 2, 3, 4], ["a", "a", "b", "a"]), [(1, 2, "a"), (3, 3, "b"), (4, 4, "a")])

    def test_the_name_of_the_surface_nearest_in_height(self):
        sq = lambda y: [[[0, y, 0], [10, y, 10], [10, y, 0]], [[0, y, 0], [0, y, 10], [10, y, 10]]]     # noqa: E731
        T3 = np.array(sq(0.0) + sq(6.0), np.float64)
        N = np.array(["1GRASS_ground"] * 2 + ["1ROAD_deck"] * 2, object)
        got = measure.names_at(T3, N, np.array([5.0, 5.0, 5.0, 50.0]), np.array([5.0, 5.0, 5.0, 50.0]),
                               np.array([0.1, 5.9, np.nan, 0.0]))
        self.assertEqual(list(got), ["1GRASS_ground", "1ROAD_deck", "1ROAD_deck", ""])


class HeightsTest(unittest.TestCase):
    def test_a_stretch_is_metres_and_points_east_and_north(self):
        route = np.array([[0.0, 0.0], [100.0, 0.0], [100.0, -100.0]])     # (AC x, z: z = -north)
        ss, px, py = heights.stretch(route, 90.0, 120.0, 10.0)
        self.assertEqual(list(ss), [90.0, 100.0, 110.0, 120.0])
        self.assertEqual(list(px), [90.0, 100.0, 100.0, 100.0])
        self.assertEqual(list(py), [0.0, 0.0, 10.0, 20.0])

    def test_the_tile_and_its_nearest_ground_vertex(self):
        self.assertEqual(heights.tile_of(-5600.0, 3878.0), (-22, 15))
        self.assertEqual(heights.vertex_of(-5600.0, 3878.0, -22, 15), (19, 16))
        self.assertEqual(heights.vertex_of(-5600.9, 3878.9, -22, 15), (19, 16), "rounded to the nearest vertex")

    def test_what_meets_at_a_deck_s_end(self):
        deck = ("d", None, np.array([[0.0, 0.0], [0.0, 40.0]]), None)
        other = ("x", None, np.array([[50.0, 50.0], [60.0, 60.0]]), None)
        road = ("road", None, np.array([[0.0, -40.0], [0.0, 0.0]]), None)
        a = np.radians(10.0)
        slip = ("slip", None, np.array([[-40 * np.sin(a), -40 * np.cos(a)], [0.0, 0.0]]), None)
        on, around = heights.joint_of(np.zeros(2), [deck, other], [road, slip, other], 0.75, 1.0)
        self.assertEqual(on, ["d"])
        self.assertEqual([f for f, _a in around], ["road", "slip"])
        self.assertAlmostEqual(around[0][1], 0.0, places=3)
        self.assertAlmostEqual(around[1][1], 10.0, places=3)

    def test_arcs_from_a_decks_ends(self):
        xy = np.array([[0.0, 0.0], [10.0, 0.0], [10.0, 5.0]])
        self.assertEqual(heights.arcs_from_ends(xy, np.array([4.0, 2.0])), (4.0, 11.0))
        self.assertEqual(heights.arcs_from_ends(xy, np.array([-3.0, 0.0])), (0.0, 15.0), "before its start: 0")


class MapSpotTest(unittest.TestCase):
    def test_the_spot_is_the_pictures_middle_and_north_is_up(self):
        u, v = map_spot.to_px(np.array([100.0, 100.0, 160.0]), np.array([50.0, 110.0, 50.0]), (100.0, 50.0), 60.0)
        self.assertEqual((float(u[0]), float(v[0])), (map_spot.PX / 2, map_spot.PX / 2))
        self.assertEqual(float(v[1]), 0.0, "60 m north: the top edge")
        self.assertEqual(float(u[2]), map_spot.PX, "60 m east: the right edge")

    def test_a_line_moved_to_its_left(self):
        got = map_spot.offset(np.array([[0.0, 0.0], [10.0, 0.0]]), 2.0)
        self.assertTrue(np.allclose(got, [[0.0, 2.0], [10.0, 2.0]]))

    def test_every_tile_of_a_wide_picture_the_middle_ones_too(self):
        """(radius 300 m round a tile's middle: 3 by 3 tiles, the corners only left out the one at the spot)"""
        c = 128.0 + 256 * 3
        got = map_spot.tiles_in((c - 300.0, c - 300.0, c + 300.0, c + 300.0))
        self.assertEqual(len(got), 9)
        self.assertIn((3, 3), got)
        self.assertEqual(map_spot.tiles_in((c - 80.0, c - 80.0, c + 80.0, c + 80.0)), [(3, 3)])

    def test_labels_filtered_by_a_word(self):
        self.assertTrue(map_spot.shown("SH16 motorway 15.2m fd52eb57", None))
        self.assertTrue(map_spot.shown("SH16 motorway 15.2m fd52eb57", "x, FD52"))
        self.assertFalse(map_spot.shown("SH16 motorway 15.2m fd52eb57", "9532d386"))

    def test_another_radius_or_a_part_metre_is_another_picture(self):
        self.assertEqual(map_spot.picture_name("t", "1000", 80.0), "map_t_1000_r80.png")
        self.assertNotEqual(map_spot.picture_name("t", "1000", 80.0), map_spot.picture_name("t", "1000", 150.0))
        self.assertEqual(f"{1052.5:g}", "1052.5", "--route's tag keeps its part metre")

    def test_the_vertex_nearest_the_spot(self):
        p, k = map_spot.nearest([np.array([[0.0, 0.0], [5.0, 0.0]]), np.array([[1.0, 1.0], [2.0, 2.0]])], (2.0, 1.8))
        self.assertEqual((p[k].tolist()), [2.0, 2.0])


DUMP = '''Process 2388: "Map2Lap Worker.exe" "-c" "from multiprocessing.spawn import spawn_main"
Python v3.14.10 (Map2Lap Worker.exe)

Thread 16784 (active+gil): "MainThread"
    _yield_strength (grading\\\\points.py:95)
    PlanPack.__init__ (grading\\\\points.py:279)
    _process_worker (concurrent\\\\futures\\\\process.py:255)
Thread 2452 (idle): "mapdata-layer_0"
    _worker (concurrent\\\\futures\\\\thread.py:116)
'''


class WatchBuildTest(unittest.TestCase):
    def test_processes_are_told_by_name_and_by_command_line(self):
        self.assertEqual(wb.role("Map2Lap Worker.exe", ""), "worker")
        self.assertEqual(wb.role("Map2Lap Server.exe", ""), "server")
        self.assertEqual(wb.role("python.exe", "python -c from multiprocessing.spawn import spawn_main"), "worker")
        self.assertEqual(wb.role("python.exe", r"python src\generator.py --name a"), "build")
        self.assertEqual(wb.role("python.exe", r"python tools\measure.py --build-one a"), "build")
        self.assertEqual(wb.role("python.exe", r"python tools\measure.py a --build"), None)
        self.assertEqual(wb.role("brave.exe", "server.py"), None)

    def test_a_dump_gives_the_main_threads_frames_innermost_first(self):
        got = wb.parse_stack(DUMP)
        self.assertEqual(got["state"], "active+gil")
        self.assertEqual(got["frames"][0], ("_yield_strength", "points.py", 95))
        self.assertEqual(len(got["frames"]), 3)
        self.assertIsNone(wb.parse_stack("Error: no such process"))

    def test_a_worker_waits_only_with_none_of_our_code_on_the_stack(self):
        idle = [("SemLock.__enter__", "synchronize.py", 1), ("Queue.get", "queues.py", 2), ("_process_worker", "process.py", 3)]
        self.assertTrue(wb.waiting(idle))
        self.assertFalse(wb.waiting([("build", "ground.py", 300)] + idle))
        self.assertFalse(wb.waiting([("build", "ground.py", 300)]))

    def test_steps_start_at_their_first_line_and_the_last_builds_log_is_left_out(self):
        lines = [(0.0, "a", "Done in 4.4 min"), (10.0, "b", "Calculating route (OSRM) ..."), (10.0, "b", "Building tiles with 31"),
                 (50.0, "c", "Scenery with 31 processes"), (60.0, "d", "Scenery with 31 again"), (90.0, "e", "Done in 2.3 min")]
        got = wb.steps(lines, 8.0)
        self.assertEqual([(m[0], m[1]) for m in got], [("route", 10.0), ("tiles", 10.0), ("scenery", 50.0), ("done", 90.0)])
        self.assertEqual(wb.step_at(got, 5.0), "before")
        self.assertEqual(wb.step_at(got, 55.0), "scenery")

    def test_the_slowest_tiles_come_first(self):
        lines = [(0, "", "Tile 1/3 (1,2): 5.0 s"), (0, "", "Tile 2/3 (-4,5): 50.5 s"), (0, "", "no tile")]
        self.assertEqual(wb.slowest_tiles(lines), [(50.5, (-4, 5), 2), (5.0, (1, 2), 1)])

    def test_waiting_for_a_few_counts_only_with_many_workers_mostly_waiting(self):
        tick = lambda n, busy, wait: {"workers": str(n), "workers_busy": str(busy), "workers_waiting": str(wait)}  # noqa: E731
        ticks = [tick(31, 1, 30), tick(31, 31, 0), tick(4, 1, 3), tick(31, 2, 5)]
        self.assertEqual(wb.few_running(ticks), 1)

    def test_samples_are_counted_per_step(self):
        idle = {"frames": [("Queue.get", "queues.py", 2)]}
        work = {"frames": [("_beside_strength", "points.py", 159), ("apply", "planner.py", 510)]}
        samples, incl, inner = wb.tally([("tiles", idle), ("tiles", work), ("scenery", work)])
        self.assertEqual(samples["tiles"], 2)
        self.assertEqual(incl["tiles"][wb.WAITING], 1)
        self.assertEqual(incl["tiles"]["apply (planner.py)"], 1)
        self.assertEqual(inner["scenery"]["_beside_strength (points.py:159)"], 1)


class WallToolsTest(unittest.TestCase):
    LINE = {"base": [[0.0, 0.0], [4.0, 0.0]], "low": [10.0, 10.0], "high": [13.0, 13.0], "toward": [[0.0, -1.0], [0.0, -1.0]]}

    def test_a_hit_says_where_it_is_not_only_its_route_metre(self):
        self.assertIn("AC 100.0, 0.0", mark._where(row(1.0)))

    def test_the_points_in_front_lie_on_the_lower_side_each_place_once(self):
        got = measure.in_front_points([self.LINE, self.LINE])
        self.assertEqual(len(got), 8, "4 m every 0.5 m, a neighbour's piece doubled")
        np.testing.assert_allclose(got[:, 1], measure.IN_FRONT_M, err_msg="AC z = -north: south of the line")
        np.testing.assert_allclose(got[:, 2], 10.0)

    def test_ground_standing_in_front_of_a_line_is_read_as_its_height(self):
        """(a tooth: flat road, then a triangle reaching 3 m over it at x 2)"""
        flat = np.array([[[-9.0, 10.0, -9.0], [9.0, 10.0, -9.0], [9.0, 10.0, 9.0]], [[-9.0, 10.0, -9.0], [9.0, 10.0, 9.0], [-9.0, 10.0, 9.0]]])
        tooth = np.array([[[1.0, 11.0, 0.0], [3.0, 11.0, 0.0], [2.0, 13.0, 1.0]]])
        pts = np.array([[0.5, 0.4, 10.0], [2.0, 0.4, 10.0]])
        got = measure.ground_in_front(pts, np.r_[flat, tooth])
        self.assertAlmostEqual(got[0], 0.0)
        self.assertGreater(got[1], 0.3)
        self.assertTrue(np.isnan(measure.highest_over(flat, 50.0, 50.0)))

    def walls(self, **kw):
        base = dict(run=[False], there=[True], off=[3.0], on_deck=[False], on_road=[False], bends=[False], near_wall=[False],
                    no_depth=[False], stands=[True], h=[1.5], room=[2.5])
        return SimpleNamespace(**{k: np.array(v) for k, v in {**base, **kw}.items()})

    def test_a_wall_s_answer_names_the_test_that_refused_it(self):
        for kw, what in ((dict(run=[True]), "wall"), (dict(there=[False]), "a cutting's"), (dict(there=[False], off=[np.nan]), "no step"),
                         (dict(on_deck=[True]), "under a deck"), (dict(on_road=[True]), "carriageway"), (dict(bends=[True]), "bend"),
                         (dict(near_wall=[True]), "wall near"), (dict(no_depth=[True]), "depth"),
                         (dict(stands=[False]), "lower than the room: 1.50 under 2.5"), (dict(), "_wall_runs")):
            self.assertIn(what, heights.wall_answer(self.walls(**kw), 0), kw)

    def test_a_wall_s_answer_names_all_that_refused_it_the_step_first(self):
        got = heights.wall_answer(self.walls(stands=[False], on_road=[True], bends=[True]), 0)
        self.assertEqual(got, "lower than the room: 1.50 under 2.5 m; on a carriageway; tight bend")

    def test_a_road_s_pieces_are_joined_end_to_end(self):
        piece = lambda a, b: SimpleNamespace(xy=np.array([[a, 0.0], [b, 0.0]]), z=np.array([a, b]))     # noqa: E731
        got = heights._chained([piece(4.0, 8.0), piece(0.0, 4.0), piece(20.0, 24.0)])
        self.assertEqual(sorted(len(xy) for xy, _z in got), [2, 3])
        joined = [(xy, z) for xy, z in got if len(xy) == 3][0]
        np.testing.assert_allclose(joined[0][:, 0], [0.0, 4.0, 8.0])
        np.testing.assert_allclose(joined[1], [0.0, 4.0, 8.0])

    def test_the_other_plans_on_a_point_with_their_edge(self):
        me = SimpleNamespace(rid="a", xy=np.array([[0.0, 0.0], [9.0, 0.0]]), z=np.array([1.0, 1.0]), half=2.0, road_half=2.0)
        other = SimpleNamespace(rid="bbbb", xy=np.array([[0.0, 3.0], [9.0, 3.0]]), z=np.array([5.0, 5.0]), half=6.0, road_half=6.0)
        self.assertEqual(heights._others_on(np.array([4.0, 0.0]), [me, other], "a"), "bbbb -3.0 z5.00")


class SurroundingsTest(unittest.TestCase):
    N = surroundings.N

    def grid(self, v=100.0):
        return np.full((self.N, self.N), v)

    def test_a_hillside_cut_down_away_from_a_road_is_lowered_beside_a_road_it_is_the_grading(self):
        built, elev = self.grid(), self.grid()
        built[10:20, 10:20] = 60.0
        no_water = self.grid(np.nan)
        cls, *_ = surroundings.classes(built, elev, no_water, np.zeros((self.N, self.N), bool))
        self.assertEqual(cls[15, 15], surroundings.LOW)
        cls, *_ = surroundings.classes(built, elev, no_water, np.ones((self.N, self.N), bool))
        self.assertEqual(cls[15, 15], surroundings.FINE)

    def test_water_lying_on_the_land_is_fine_on_a_hillside_it_is_not(self):
        built, elev, water = self.grid(), self.grid(), self.grid(np.nan)
        water[5, 5], water[6, 6] = 100.5, 140.0
        cls, *_ = surroundings.classes(built, elev, water, np.zeros((self.N, self.N), bool))
        self.assertEqual(cls[5, 5], surroundings.FINE)
        self.assertEqual(cls[6, 6], surroundings.WET)

    def test_a_step_the_terrain_doesn_t_have_counts_a_cliff_it_has_not(self):
        built, elev = self.grid(), self.grid()
        built[:, 50:] = 80.0
        near = np.zeros((self.N, self.N), bool)
        self.assertEqual(surroundings.classes(built, elev, self.grid(np.nan), near)[3], self.N)
        self.assertEqual(surroundings.classes(built, built, self.grid(np.nan), near)[3], 0)

    def test_two_steps_at_one_vertex_are_two(self):
        built, elev = self.grid(), self.grid()
        built[10, 10] = 80.0        # (a pit: four edges)
        near = np.zeros((self.N, self.N), bool)
        self.assertEqual(surroundings.classes(built, elev, self.grid(np.nan), near)[3], 4)

    def test_two_tiles_apart_on_their_border_count_once(self):
        a, b = self.grid(), self.grid(80.0)
        self.assertEqual(surroundings.seam_steps({(0, 0): a, (1, 0): b}), self.N - 1)
        self.assertEqual(surroundings.seam_steps({(0, 0): a, (0, 1): a.copy()}), 0)

    def test_a_part_s_area_leaves_out_its_islands(self):
        square = lambda s: np.array([[0.0, 0.0], [s, 0.0], [s, s], [0.0, s], [0.0, 0.0]])    # noqa: E731
        self.assertEqual(surroundings.part_area([square(100.0)]), 10000.0)
        self.assertEqual(surroundings.part_area([square(100.0), square(60.0)]), 6400.0)

    def test_a_cape_is_not_flat_a_lake_is_a_river_may_fall(self):
        self.assertTrue(surroundings.not_flat("cape", "physical", 340.0))
        self.assertFalse(surroundings.not_flat("lake", "lake", 0.5))
        self.assertFalse(surroundings.not_flat("river", "river", 400.0))

    def test_a_sample_inside_a_ring_and_not_in_its_hole(self):
        ring = np.array([[0.0, 0.0], [40.0, 0.0], [40.0, 40.0], [0.0, 40.0]])
        hole = np.array([[16.0, 16.0], [24.0, 16.0], [24.0, 24.0], [16.0, 24.0]])
        got = surroundings.inside([ring, hole], 0.0, 0.0, 4.0, 11, 11)
        self.assertTrue(got[2, 2])
        self.assertFalse(got[5, 5], "the hole: an island")


class CompareTest(unittest.TestCase):
    def tree(self, root, track="t", anchor=None):
        """A built track under root: one OBJ part, a texture, an anchor."""
        os.makedirs(os.path.join(root, track, "obj", "parts"))
        os.makedirs(os.path.join(root, track, "obj", "textures"))
        os.makedirs(os.path.join(root, track, "tiles"))
        with open(os.path.join(root, track, "obj", "parts", "t_0_0.obj"), "w", encoding="utf-8") as f:
            f.write("o wall\nv 1 2 3\nv 4 5 6\nf 1 2 1\n")
        with open(os.path.join(root, track, "obj", "textures", "a.png"), "wb") as f:
            f.write(b"png")
        with open(os.path.join(root, track, "tiles", "anchor.json"), "w", encoding="utf-8") as f:
            json.dump(anchor or {"lat": 1.0, "code_key": "x"}, f)

    def test_a_texture_and_the_anchor_count_but_the_anchors_code_key_doesnt(self):
        with tempfile.TemporaryDirectory() as root, unittest.mock.patch.object(compare_parts, "TRACKS", root):
            self.tree(root)
            snap = compare_parts.snapshot(["t"])
            self.assertEqual(sorted(snap), ["t/@obj/textures/a.png", "t/@tiles/anchor.json", "t/t_0_0.obj"])
            anchor = os.path.join(root, "t", "tiles", "anchor.json")
            json.dump({"lat": 1.0, "code_key": "y"}, open(anchor, "w", encoding="utf-8"))
            self.assertEqual(compare_parts.compare(snap, compare_parts.snapshot(["t"])), [])
            json.dump({"lat": 2.0, "code_key": "y"}, open(anchor, "w", encoding="utf-8"))
            self.assertEqual(compare_parts.compare(snap, compare_parts.snapshot(["t"])), ["  t/@tiles/anchor.json: changed"])

    def test_tracks_not_asked_for_arent_missing(self):
        old = {"a/x.obj": {"sha1": "1"}, "a/@y": {"sha1": "1"}, "b/x.obj": {"sha1": "2"}}
        got, new = compare_parts.only(old, ["a"], {"a/x.obj": {"sha1": "1"}, "a/@y": {"sha1": "1"}})
        self.assertEqual(sorted(got), ["a/@y", "a/x.obj"])
        self.assertEqual(compare_parts.compare(got, new), [])

    def test_a_tracks_many_new_files_are_one_line(self):
        """(--kn5 leaves thousands of textures beside the parts: 3297 "differ" that said nothing)"""
        many = [f"  a/@obj/textures/{i}.dds: new" for i in range(compare_parts.NEW_SHOWN + 1)]
        got = compare_parts.folded(["  a/t_0_0.obj: changed", *many, "  b/@x: new"])
        self.assertEqual(len(got), 3)
        self.assertEqual(got[0], "  a/t_0_0.obj: changed", "a changed file stays")
        self.assertIn(f"{len(many)} new files", got[1])
        self.assertEqual(got[2], "  b/@x: new", "few are named")

    def test_the_ground_over_a_roads_middle_says_where(self):
        """(the table's AC x, z are the road's line: a peak 4 m beside it was reported at its line)"""
        got = heights._over_middle(476, np.array([45.0, -75.0]), np.array([-1.0, 0.0]), (-4, 0, 4), [411.8, 411.8, 412.45])
        self.assertEqual(got, ["    along 476 +4 at AC 41.00, 75.00: +65 cm"])

    def test_a_snapshot_of_the_parts_alone_isnt_told_of_every_other_file(self):
        _old, new = compare_parts.only({"a/x.obj": {"sha1": "1"}}, ["a"], {"a/x.obj": {"sha1": "1"}, "a/@y": {"sha1": "1"}})
        self.assertEqual(list(new), ["a/x.obj"])

    def test_a_track_built_with_other_code_is_named(self):
        import revisit
        with tempfile.TemporaryDirectory() as root, unittest.mock.patch.object(compare_parts, "TRACKS", root):
            self.tree(root, "old", {"code_key": "x"})
            self.tree(root, "now", {"code_key": revisit.code_key()})
            self.assertEqual(compare_parts.not_this_code(["old", "now", "unbuilt"]), ["old"])

    def test_what_moved_is_read_from_the_part_as_it_was(self):
        with tempfile.TemporaryDirectory() as root, unittest.mock.patch.object(compare_parts, "TRACKS", root), \
                unittest.mock.patch.object(compare_parts, "OUT", os.path.join(root, "compare")):
            self.tree(root)
            old = compare_parts.snapshot(["t"])
            compare_parts.keep(old)
            with open(os.path.join(root, "t", "obj", "parts", "t_0_0.obj"), "w", encoding="utf-8") as f:
                f.write("o wall\nv 1 2.25 3\nv 4 5 6\nf 1 2 1\n")
            got = compare_parts.what_moved(old, compare_parts.snapshot(["t"]))
        self.assertEqual(got[0], "  t/t_0_0.obj:")
        self.assertIn("wall: 1 of 2 vertices moved", got[1])
        self.assertIn("height +0.000..+0.250", got[1])
        self.assertIn("at AC x 1.0..1.0, z 3.0..3.0", got[2])

    def test_each_place_is_named_also_where_the_vertices_changed_in_number(self):
        far = [[300.0, 5.0, 300.0], [301.0, 5.0, 300.0]]
        was = {"a": np.array([[0.0, 1.0, 0.0], [1.0, 1.0, 0.0]] + far), "b": np.array(far), "c": np.array(far)}
        now = {"a": np.array([[0.0, 1.0, 0.0], [1.0, 2.0, 0.0]] + far[:1]), "d": np.array(far)}
        route = (np.array([[0.0, 0.0], [400.0, 0.0]]), np.array([0.0, 400.0]))
        got = compare_parts.moved(was, now, ["a", "c", "d"], route)
        self.assertEqual(got[0], "    a: 4 -> 3 vertices")
        self.assertIn("at AC x 1.0..1.0, z 0.0..0.0, height 1.0..2.0: 2 points, route 1-1 m, 0 m off the line", got[1])
        self.assertIn("at AC x 301.0..301.0, z 300.0..300.0", got[2], "two spots, two places")
        self.assertEqual(got[3], "    c: gone")
        self.assertIn("route 300-301 m, 300 m off the line", got[4])
        self.assertEqual(got[5], "    d: new")

    def test_places_touching_are_one_and_many_are_counted(self):
        spots = np.array([[i * 100.0, 0.0, 0.0] for i in range(compare_parts.PLACES_SHOWN + 2)])
        self.assertEqual(len(compare_parts.places(np.array([[1.0, 0.0, 1.0], [31.0, 0.0, 1.0], [61.0, 0.0, 1.0]]))), 1)
        got = compare_parts.place_lines(spots)
        self.assertEqual(len(got), compare_parts.PLACES_SHOWN + 1)
        self.assertEqual(got[-1], "      and 2 more places")

    def order_or_move(self, one, other):
        """What moved() says of object wall from OBJ text one to other."""
        as_lines = lambda text: text.encode().splitlines(True)
        a, b = as_lines(one), as_lines(other)
        return compare_parts.moved(compare_parts.vertices(a), compare_parts.vertices(b), ["wall"], None,
                                   (compare_parts.triangles(a), compare_parts.triangles(b)))

    def test_only_the_very_same_triangles_are_another_order(self):
        one = "o wall\nv 0 0 0\nv 1 0 0\nv 0 1 0\nv 5 0 0\nv 6 0 0\nv 5 1 0\nf 1 2 3\nf 4 5 6\n"
        swapped = "o wall\nv 5 0 0\nv 6 0 0\nv 5 1 0\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\nf 4 5 6\n"
        self.assertEqual(self.order_or_move(one, swapped), ["    wall: the same triangles in another order"])

    def test_a_real_change_among_swapped_points_stays_a_move(self):
        one = "o wall\nv 0 0 0\nv 1 0 0\nv 0 1 0\nv 5 0 0\nv 6 0 0\nv 5 1 0\nf 1 2 3\nf 4 5 6\n"
        for name, other in (("a tenth of a mm", "o wall\nv 5 0 0\nv 6 0 0\nv 5 1.0001 0\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\nf 4 5 6\n"),
                            ("turned over", "o wall\nv 5 0 0\nv 6 0 0\nv 5 1 0\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 3 2\nf 4 5 6\n"),
                            ("other corners", "o wall\nv 5 0 0\nv 6 0 0\nv 5 1 0\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 6\nf 4 5 3\n")):
            got = self.order_or_move(one, other)
            self.assertNotIn("another order", got[0], name)
            self.assertIn("vertices moved", got[0], name)

    def test_with_no_triangles_told_points_that_differ_are_a_move(self):
        was, now = {"wall": np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]])}, {"wall": np.array([[1.0, 0.0, 0.0], [0.0, 0.0, 0.0]])}
        self.assertIn("vertices moved", compare_parts.moved(was, now, ["wall"])[0])

    def test_the_same_vertices_in_new_triangles_have_a_place(self):
        one = "o wall\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n"
        turned = "o wall\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 3 2\n"
        as_lines = lambda text: text.encode().splitlines(True)
        vs = compare_parts.vertices(as_lines(one))
        got = compare_parts.moved(vs, vs, ["wall"], None, (compare_parts.triangles(as_lines(one)), compare_parts.triangles(as_lines(turned))))
        self.assertEqual(got[0], "    wall: the same vertices, its other lines differ")
        self.assertIn("at AC x 0.0..1.0, z 0.0..0.0, height 0.0..1.0: 6 points", got[1])

    def test_triangles_in_another_order_are_no_move(self):
        one = "o wall\nv 0 0 0\nv 1 0 0\nv 0 1 0\nv 5 0 0\nv 6 0 0\nv 5 1 0\nf 1 2 3\nf 4 5 6\n"
        other = "o wall\nv 5 0 0\nv 6 0 0\nv 5 1 0\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\nf 5 6 4\n"
        turned = "o wall\nv 0 0 0\nv 1 0 0\nv 0 1 0\nv 5 0 0\nv 6 0 0\nv 5 1 0\nf 1 3 2\nf 4 5 6\n"
        as_lines = lambda text: text.encode().splitlines(True)
        self.assertEqual(compare_parts.triangles(as_lines(one)), compare_parts.triangles(as_lines(other)))
        self.assertNotEqual(compare_parts.triangles(as_lines(one)), compare_parts.triangles(as_lines(turned)))
        with tempfile.TemporaryDirectory() as root, unittest.mock.patch.object(compare_parts, "TRACKS", root), \
                unittest.mock.patch.object(compare_parts, "OUT", os.path.join(root, "compare")):
            self.tree(root)
            part = os.path.join(root, "t", "obj", "parts", "t_0_0.obj")
            with open(part, "w", encoding="utf-8") as f:
                f.write(one)
            old = compare_parts.snapshot(["t"])
            compare_parts.keep(old)
            with open(part, "w", encoding="utf-8") as f:
                f.write(other)
            got = compare_parts.what_moved(old, compare_parts.snapshot(["t"]))
        self.assertEqual(got, ["  t/t_0_0.obj: the same triangles in another order"])

    def test_a_version_no_snapshot_names_is_dropped(self):
        with tempfile.TemporaryDirectory() as root, unittest.mock.patch.object(compare_parts, "TRACKS", root), \
                unittest.mock.patch.object(compare_parts, "OUT", os.path.join(root, "compare")):
            self.tree(root)
            snap = compare_parts.snapshot(["t"])
            os.makedirs(os.path.join(root, "compare", "kept"))
            old = os.path.join(root, "compare", "kept", "dead.gz")
            open(old, "wb").close()
            with open(os.path.join(root, "compare", "s.json"), "w", encoding="utf-8") as f:
                json.dump(snap, f)
            compare_parts.keep(snap)
            self.assertFalse(os.path.exists(old))
            self.assertTrue(os.path.exists(compare_parts._kept(snap["t/t_0_0.obj"]["sha1"])))


class EditorMemoryTest(unittest.TestCase):
    MATERIALS = [{"texture": "a"}, {"texture": "b"}]
    SIZES = {"a": 100, "b": 1000}

    @staticmethod
    def mesh(name="1WALL_bld_fac_00_1_0_0", x=0.0, material=0, vertices=10):
        return {"name": name, "center": [x, 0.0, 0.0], "radius": 1.0, "material": material, "vertices": vertices, "indices": 0}

    def test_a_mesh_s_kind_is_its_name_without_its_numbers(self):
        self.assertEqual("1WALL_bld", editor_memory.kind_of("1WALL_bld_fac_00_1_0_0"))
        self.assertEqual("nocol_trees", editor_memory.kind_of("nocol_trees_0_0"))
        self.assertEqual("1ROAD_ground", editor_memory.kind_of("1ROAD_ground_-3_7"))

    def test_the_kinds_add_up_the_largest_first(self):
        kinds = editor_memory.by_kind([self.mesh("nocol_a_1"), self.mesh("nocol_b_1", vertices=100), self.mesh("nocol_a_2")])
        self.assertEqual(["nocol_b", "nocol_a"], list(kinds))
        self.assertEqual(2, kinds["nocol_a"][0])

    def test_a_texture_too_large_stays_out_and_the_meshes_go_on(self):
        meshes = [self.mesh(x=0.0), self.mesh(x=10.0)]
        limit = 2 * sum(map(editor_memory.mesh_bytes, meshes))
        self.assertEqual(2, editor_memory.reach(meshes, self.MATERIALS, {"a": limit}, [0.0, 0.0, 0.0], limit)[0])

    def test_a_limit_takes_the_nearest_with_their_textures_twice(self):
        meshes = [self.mesh(x=100.0), self.mesh(x=0.0), self.mesh(x=10.0, material=1)]
        one = 2 * editor_memory.mesh_bytes(meshes[0])
        self.assertEqual((1, 0.0), editor_memory.reach(meshes, self.MATERIALS, self.SIZES, [0.0, 0.0, 0.0], one + 200))
        self.assertEqual((2, 9.0), editor_memory.reach(meshes, self.MATERIALS, self.SIZES, [0.0, 0.0, 0.0], 2 * one + 200))
        self.assertEqual(3, editor_memory.reach(meshes, self.MATERIALS, self.SIZES, [0.0, 0.0, 0.0], 3 * one + 2200)[0])


class ToolListTest(unittest.TestCase):
    def test_every_tool_is_named_in_the_catalogue(self):
        with open(os.path.join(ROOT, "tools", "README.md"), encoding="utf-8") as f:
            text = f.read()
        missing = [os.path.basename(p) for p in glob.glob(os.path.join(ROOT, "tools", "*.py"))
                   if os.path.basename(p) not in text]
        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()
