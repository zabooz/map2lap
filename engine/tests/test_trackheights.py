"""A height change in a built kn5: the ground and what lies along it follow, single objects move whole, bridges refuse, nothing else moves."""
import os
import sys
import tempfile
import unittest

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import trackheights, trackview  # noqa: E402
from track import kn5, objectlist  # noqa: E402

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)
UP = (0.0, 1.0, 0.0)
TANGENT = (1.0, 0.0, 0.0)


def raster(x=0, z=0, nx=11, nz=11, peak=1000, id_="a"):
    """A height change: peak mm in the middle point, down to 0 at its edge. Pure."""
    mm = np.zeros((nz, nx), np.int64)
    mm[nz // 2, nx // 2] = peak
    return {"id": id_, "x": x, "z": z, "nx": nx, "nz": nz, "mm": mm.ravel().tolist()}


def plateau(x=0, z=0, nx=11, nz=11, height=1000, id_="a"):
    """A height change: height mm on all points but its edge. Pure."""
    mm = np.zeros((nz, nx), np.int64)
    mm[1:-1, 1:-1] = height
    return {"id": id_, "x": x, "z": z, "nx": nx, "nz": nz, "mm": mm.ravel().tolist()}


def mesh(name, material, points, faces=None, renderable=1, radius=100.0):
    """A mesh of those places, each its own vertex; faces: all in threes if none."""
    v = np.zeros(len(points), kn5.VERTEX)
    v["pos"], v["normal"], v["tangent"] = points, UP, TANGENT
    v["uv"] = [(i * 0.5, 0.25) for i in range(len(points))]
    i = np.arange(len(points)) if faces is None else np.asarray(faces)
    return kn5.Node(2, name, 1, cast_shadows=1, visible=1, transparent=0, vertices=v, indices=i.astype("<u2"), material=material, layer=0,
                    lod_in=0.0, lod_out=1000.0, bs_center=(0.0, 0.0, 0.0), bs_radius=radius, renderable=renderable)


def material(name):
    return kn5.Material(name, "ksPerPixel", 0, 0, 0, [("ksAmbient", 0.5, (0, 0), (0, 0, 0), (0, 0, 0, 0))], [("txDiffuse", 0, "t.png")])


class Base(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = tmp.name
        self.path = os.path.join(self.dir, "t.kn5")

    def write(self, *meshes, points=()):
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        tree.children = list(meshes) + [kn5.Node(1, name, 1, matrix=matrix) for name, matrix in points]
        kn5.write(self.path, [("t.png", b"png")], [material("m"), material(trackview.ATLAS_MATERIAL)], tree)

    def apply(self, ops, objects=None, going=None):
        """The kn5 with ops applied, read back: {mesh name: its Node}, and the file's points."""
        scan = kn5.scan(self.path)
        out = os.path.join(self.dir, "out.kn5")
        kn5.without_faces(self.path, out, going or {}, trackheights.moved(self.path, scan, objects or {}, ops))
        return {m.name: m for m in kn5.walk_meshes(kn5.read(out)["root"])}, kn5.scan(out)


class RasterTest(unittest.TestCase):
    def test_a_good_one_has_no_problem(self):
        self.assertIsNone(trackheights.problem(raster()))

    def test_what_a_draft_can_not_hold(self):
        for wrong, why in (({"id": ""}, "no id"), ({"x": 1}, "lattice"), ({"z": 0.5}, "lattice"), ({"x": True}, "lattice"), ({"nx": 2, "mm": [0] * 22}, "raster"),
                           ({"mm": [0]}, "raster"), ({"mm": [0.5] * 121}, "heights"), ({"mm": [True] * 121}, "heights"),
                           ({"mm": [1_000_000] + [0] * 120}, "heights"), ({"mm": [1] + [0] * 120}, "edge")):
            self.assertIn(why, trackheights.problem({**raster(), **wrong}), wrong)
        self.assertIsNotNone(trackheights.problem("x"))

    def test_too_big_a_raster(self):
        self.assertIn("raster", trackheights.problem({**raster(), "nx": 2000, "nz": 2000, "mm": [0] * 4_000_000}))

    def test_exact_on_its_points_linear_between_zero_outside(self):
        field = trackheights.Field([raster()])
        d = field.at([10.0, 11.0, 9.0, 10.0, 0.0, 20.0, 30.0, -1.0], [10.0, 10.0, 10.0, 11.0, 0.0, 20.0, 30.0, 10.0])[0]
        np.testing.assert_allclose(d, [1.0, 0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.0])

    def test_changes_add_up(self):
        field = trackheights.Field([plateau(height=1000), plateau(height=-250, id_="b")])
        self.assertAlmostEqual(0.75, float(field.at(10.0, 10.0)[0]))

    def test_slope_as_the_points_say(self):
        field = trackheights.Field([plateau()])
        _d, along_x, along_z = field.at(1.0, 10.0)       # (between the edge, 0, and the first point, 1 m, 2 m on)
        self.assertGreater(float(along_x), 0.1)
        self.assertAlmostEqual(0.0, float(along_z))

    def test_every_kind_of_mesh_is_sorted(self):
        """A new kind of mesh must be entered in objectlist: here it says what it does when the ground moves."""
        self.assertEqual(set(), objectlist.TRACK - trackheights.FOLLOW - trackheights.STAY - trackheights.IN_THE_WAY)
        self.assertEqual(set(), objectlist.COUNTED & trackheights.FOLLOW)

    def test_what_holds_its_own_heights_never_follows(self):
        """The rule itself: a railway's mesh holds its bridges' plates, a deck is a bridge, the sea doesn't rise with a road."""
        self.assertEqual({"deck", "rail", "railcol"}, trackheights.IN_THE_WAY)
        self.assertEqual({"water", "foam", "far"}, trackheights.STAY)
        self.assertEqual(set(), trackheights.FOLLOW & (trackheights.IN_THE_WAY | trackheights.STAY))

    def test_changes_that_cancel_out_leave_exactly_nothing(self):
        ops = [plateau(height=h, id_=str(h)) for h in (100, 200, -300)]
        d, along_x, along_z = trackheights.Field(ops).at(np.array([10.0, 11.3, 1.0]), np.array([10.0, 12.7, 10.0]))
        self.assertEqual(([0.0] * 3,) * 3, (d.tolist(), along_x.tolist(), along_z.tolist()))

    def test_a_list_of_changes(self):
        self.assertIsNone(trackheights.problems([raster(), raster(id_="b")]))
        self.assertIn("twice", trackheights.problems([raster(), raster()]))
        self.assertIn("no list", trackheights.problems("x"))
        self.assertIn("edge", trackheights.problems([raster(), {**raster(id_="b"), "mm": [1] + [0] * 120}]))


class BrushTest(unittest.TestCase):
    def stroke(self, samples=((10.0, 10.0, 0.0),), radius=10.0, soft=0.5, mm=1000, speed=1000):
        return trackheights.brush([list(s) for s in samples], radius, soft, mm, speed, "s")

    def heights(self, op, *places):
        x, z = zip(*places)
        return trackheights.Field([op]).at(np.array(x, float), np.array(z, float))[0]

    def test_a_click_gives_its_height_inside_and_nothing_from_its_radius_on(self):
        op = self.stroke()
        self.assertIsNone(trackheights.problem(op))
        np.testing.assert_allclose(self.heights(op, (10, 10), (14, 10), (20, 10), (24, 10)), [1, 1, 0, 0], atol=1e-3)
        self.assertGreater(float(self.heights(op, (17, 10))[0]), 0.05)     # (and softly between)
        self.assertLess(float(self.heights(op, (17, 10))[0]), 0.95)

    def test_it_goes_down_too_also_while_held(self):
        self.assertAlmostEqual(-0.5, float(self.heights(self.stroke(mm=-500), (10, 10))[0]))
        held = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, 1.25)), mm=-500, speed=300)
        self.assertAlmostEqual(-0.8, float(self.heights(held, (10, 10))[0]), places=2)

    def test_its_raster_lies_on_the_lattice_whatever_the_mouse_gave(self):
        op = self.stroke(samples=((10.37, -7.91, 0.0),))
        self.assertEqual((0, 0), (op["x"] % trackheights.STEP, op["z"] % trackheights.STEP))
        self.assertIsNone(trackheights.problem(op))

    def test_a_press_as_short_as_a_click_is_one_height(self):
        held = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, trackheights.HOLD_AFTER_S)))
        self.assertEqual(self.stroke()["mm"], held["mm"])

    def test_held_it_grows_by_its_speed_not_by_its_height(self):
        """A fine click and quick building: the user's 5 cm and 30 cm a second."""
        for seconds, metres in ((1.0, 0.35), (3.0, 0.95)):
            op = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, trackheights.HOLD_AFTER_S + seconds)), mm=50, speed=300)
            self.assertAlmostEqual(metres, float(self.heights(op, (10, 10))[0]), places=2)

    def test_with_no_speed_holding_does_nothing_more(self):
        op = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, 9.0)), speed=0)
        self.assertEqual(self.stroke()["mm"], op["mm"])

    def test_how_the_time_is_cut_up_makes_no_other_hill(self):
        """A slow computer or a fast mouse: not a mm of difference where the ring stood."""
        one = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, 2.25)))
        many = self.stroke(samples=[(10.0, 10.0, 0.0)] + [(10.0, 10.0, 0.05)] * 45)
        self.assertEqual(one["mm"], many["mm"])

    def test_how_a_way_is_cut_up_makes_no_other_hill(self):
        """The first moment of a press lies on the way too: one sample or a hundred on the same way in the same second."""
        one = self.stroke(samples=((0.0, 10.0, 0.0), (100.0, 10.0, 1.0)), radius=5.0, mm=1, speed=1000)
        many = self.stroke(samples=[(0.0, 10.0, 0.0)] + [(float(x), 10.0, 0.01) for x in range(1, 101)], radius=5.0, mm=1, speed=1000)
        places = [(x, 10) for x in (10, 20, 30, 50, 80)]
        np.testing.assert_allclose(self.heights(one, *places), self.heights(many, *places), atol=0.004)
        self.assertLess(float(self.heights(one, (10, 10))[0]), 0.01)      # (the first quarter second is the click's: the ring passed here in it)
        self.assertGreater(float(self.heights(one, (50, 10))[0]), 0.05)

    def test_tiny_shares_add_up_not_lost_to_rounding(self):
        op = self.stroke(samples=[(10.0, 10.0, 0.0)] + [(10.0, 10.0, 0.001)] * 3000, mm=1, speed=1)     # (each 0.001 mm)
        self.assertEqual(4, max(op["mm"]))     # (1 for the click, 2.75 by the time held: rounded once, at the end)

    def test_a_place_the_ring_left_stops_growing_and_time_stood_stays_where_it_stood(self):
        op = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, 1.25), (200.0, 10.0, 0.0), (200.0, 10.0, 5.0)))
        self.assertAlmostEqual(2.0, float(self.heights(op, (10, 10))[0]), places=2)
        self.assertAlmostEqual(5.0, float(self.heights(op, (200, 10))[0]), places=2)
        self.assertAlmostEqual(0.0, float(self.heights(op, (100, 10))[0]))

    def test_standing_after_a_way_adds_to_the_end_not_to_the_way(self):
        moved = ((0.0, 10.0, 0.0), (0.0, 10.0, 0.25), (100.0, 10.0, 1.0))
        op = self.stroke(samples=moved + ((100.0, 10.0, 3.0),), radius=5.0, mm=1, speed=1000)
        alone = self.stroke(samples=moved, radius=5.0, mm=1, speed=1000)
        np.testing.assert_allclose(self.heights(op, (30, 10), (50, 10), (70, 10)), self.heights(alone, (30, 10), (50, 10), (70, 10)), atol=0.002)
        self.assertGreater(float(self.heights(op, (100, 10))[0]), 3.0)

    def test_time_on_a_way_is_spread_along_it(self):
        op = self.stroke(samples=((0.0, 10.0, 0.0), (0.0, 10.0, trackheights.HOLD_AFTER_S), (100.0, 10.0, 10.0)), radius=5.0)
        middle = self.heights(op, (30, 10), (50, 10), (70, 10))
        self.assertLess(float(np.ptp(middle)), 0.03)       # (the same all along)
        self.assertGreater(float(middle[0]), 0.2)

    def test_a_long_stroke_costs_by_its_way_not_by_its_samples(self):
        """A big brush moving for a minute: thousands of stamps of 250,000 points each would make every answer take seconds."""
        stamps = list(trackheights._stamps(np.array([[0.0, 0.0, 0.0]] + [[float(k), 0.0, 0.05] for k in range(1, 1001)]), 125.0))
        self.assertLess(len(stamps), 10)
        self.assertAlmostEqual(49.75, sum(s for _x, _z, s in stamps), places=6)     # (and all of its time, but the click's first moment)

    def test_it_never_goes_past_what_a_raster_can_hold(self):
        op = self.stroke(samples=((10.0, 10.0, 0.0), (10.0, 10.0, 3600.0), (10.0, 10.0, 3600.0)), mm=trackheights.MAX_MM, speed=trackheights.MAX_MM)
        self.assertEqual(trackheights.MAX_MM, max(op["mm"]))
        self.assertIsNone(trackheights.problem(op))

    def test_the_smallest_ring_tells_wherever_it_is_clicked(self):
        for x, z in ((11.0, 11.0), (10.0, 10.0), (10.1, 11.9), (10.9, 11.2)):      # (a cell's middle the worst: each corner 1.41 m off)
            self.assertEqual(500, max(self.stroke(samples=((x, z, 0.0),), radius=trackheights.MIN_RADIUS_M, soft=0.25, mm=500, speed=0)["mm"]), (x, z))
            self.assertGreaterEqual(max(self.stroke(samples=((x, z, 0.0),), radius=trackheights.MIN_RADIUS_M, soft=1.0, mm=500, speed=0)["mm"]), 100, (x, z))

    def test_what_is_no_stroke_or_no_brush(self):
        for kwargs in ({"radius": 1.9}, {"radius": 501.0}, {"radius": "x"}, {"soft": 0.0}, {"soft": 1.5}, {"mm": 0}, {"mm": 1_000_000}, {"mm": 1.5},
                       {"speed": -1}, {"speed": 1.5}, {"speed": None}, {"speed": 1_000_000}):
            with self.assertRaises(ValueError, msg=kwargs):
                self.stroke(**kwargs)
        for samples in ([], "x", None, [[1.0]], [[1.0, 2.0]], [["a", "b", "c"]], [[float("nan"), 0.0, 0.0]], [[0.0, 0.0, 0.0]] * 5001, [[10 ** 400, 0.0, 0.0]],
                        [[1e20, 1e20, 0.0]], [[float("inf"), 0.0, 0.0]], [[0.0, 0.0, -1.0]], [[0.0, 0.0, float("nan")]], [[0.0, 0.0, 1e9]]):
            with self.assertRaises(ValueError, msg=str(samples)[:30]):
                trackheights.brush(samples, 10.0, 0.5, 1000, 1000, "s")

    def test_a_stroke_too_long_for_a_raster_says_so(self):
        with self.assertRaisesRegex(ValueError, "too long"):
            self.stroke(samples=((0.0, 0.0, 0.0), (3000.0, 3000.0, 0.1)))


class MovedTest(Base):
    def test_the_ground_follows_x_z_uv_and_triangles_stay(self):
        points = [(10.0, 100.0, 10.0), (12.0, 100.0, 10.0), (10.0, 100.0, 12.0), (50.0, 100.0, 50.0), (51.0, 100.0, 50.0), (50.0, 100.0, 51.0)]
        self.write(mesh("1ROAD_ground_0_0", 0, points))
        out, _scan = self.apply([plateau()])
        before = {m.name: m for m in kn5.walk_meshes(kn5.read(self.path)["root"])}["1ROAD_ground_0_0"]
        after = out["1ROAD_ground_0_0"]
        np.testing.assert_allclose(after.vertices["pos"][:, 1], [101, 101, 101, 100, 100, 100], atol=1e-4)
        np.testing.assert_array_equal(before.vertices["pos"][:, [0, 2]], after.vertices["pos"][:, [0, 2]])
        np.testing.assert_array_equal(before.vertices["uv"], after.vertices["uv"])
        np.testing.assert_array_equal(before.indices, after.indices)

    def test_a_road_line_with_long_edges_stays_over_the_hill(self):
        """Its points far apart, each on the ground: between them the ground bulges up. Seen on a real track: the line had a gap on the hill."""
        field_op = plateau(x=0, z=0, nx=31, nz=11)
        line = [(10.0, 100.0, 10.0), (30.0, 100.0, 10.0), (30.0, 100.0, 11.0)]      # (the long edge from x 10 to x 30, over x 0 to 60)
        mm = np.zeros((11, 31), np.int64)
        mm[1:-1, 11:-1] = 0
        for i in range(1, 30):
            mm[1:-1, i] = int(1000 * np.sin(np.pi * i / 30))     # (a hill along x: its top at x 30)
        op = {**field_op, "mm": mm.ravel().tolist()}
        self.write(mesh("nocol_road_0_0", 0, line))
        ys = self.apply([op])[0]["nocol_road_0_0"].vertices["pos"][:, 1]
        field = trackheights.Field([op])
        ends = field.at(np.array([10.0, 30.0]), np.array([10.0, 10.0]))[0]
        for t in (0.25, 0.5, 0.75):
            ground = 100.0 + float(field.at(np.array(10.0 + 20.0 * t), np.array(10.0))[0])
            self.assertGreaterEqual(ys[0] + (ys[1] - ys[0]) * t, ground - 1e-3, t)
        self.assertGreater(ys[0], 100.0 + ends[0] + 0.01)       # (it took more than the change at its own place)

    def test_only_a_line_goes_up_over_a_hill_a_kerb_and_its_collision_stay_together(self):
        line = [(1.0, 100.0, 10.0), (19.0, 100.0, 10.0), (10.0, 100.0, 11.0)]
        for kind, up in (("road", True), ("walk", False), ("walkcol", False), ("ground", False), ("fence", False)):
            with self.subTest(kind):
                self.write(mesh(f"nocol_{kind}_0_0", 0, line))
                ys = self.apply([plateau()])[0][f"nocol_{kind}_0_0"].vertices["pos"][:, 1]
                self.assertEqual(up, bool(ys[0] > 100.5 + 1e-3))

    def test_a_long_line_goes_over_a_narrow_hill_and_no_further_than_its_most(self):
        """A change of 3 m at x 10 under an edge of 80 m: three places along the edge would miss it. Far off it shouldn't float a metre either."""
        self.write(mesh("nocol_road_0_0", 0, [(-30.0, 100.0, 10.0), (50.0, 100.0, 10.0), (50.0, 100.0, 11.0)]))
        ys = self.apply([raster(peak=2000)])[0]["nocol_road_0_0"].vertices["pos"][:, 1]
        np.testing.assert_allclose(ys[0], 100.0 + trackheights.MAX_LIFT_M, atol=1e-4)

    def test_a_line_stays_over_the_very_top_of_a_narrow_hill(self):
        """A raster's top lies at its point: places half way between points miss it (a line at 72.5 mm over a hill of 100)."""
        self.write(mesh("nocol_road_0_0", 0, [(6.0, 100.0, 10.0), (14.0, 100.0, 10.0), (14.0, 100.0, 10.5)]))
        ys = self.apply([raster(peak=100)])[0]["nocol_road_0_0"].vertices["pos"][:, 1]
        self.assertGreater(float((ys[0] + ys[1]) / 2), 100.09)     # (to within SAG_STEP_M's half on this slope of 5 %: 6 mm)

    def test_vertices_at_one_place_go_up_together_also_in_two_meshes(self):
        """A line goes on over a tile's border: one mesh's long edge over the hill, the next one's short and off it. It mustn't jump there."""
        long_edge = [(-30.0, 100.0, 10.0), (50.0, 100.0, 10.0), (50.0, 100.0, 11.0)]
        short_edge = [(50.0, 100.0, 10.0), (52.0, 100.0, 10.0), (52.0, 100.0, 11.0)]
        self.write(mesh("nocol_road_0_0", 0, long_edge), mesh("nocol_road_1_0", 0, short_edge))
        out = self.apply([raster(peak=2000)])[0]
        self.assertEqual(out["nocol_road_0_0"].vertices["pos"][1, 1], out["nocol_road_1_0"].vertices["pos"][0, 1])
        self.assertGreater(float(out["nocol_road_1_0"].vertices["pos"][0, 1]), 100.0)
        self.assertEqual(100.0, float(out["nocol_road_1_0"].vertices["pos"][1, 1]))     # (only what lies at that place)

    def test_a_line_a_change_can_lift_or_lower_is_named_though_it_moves_nothing_by_itself(self):
        self.write(mesh("nocol_road_0_0", 0, [(0.0, 100.0, 0.0)] * 3, radius=1.0), mesh("nocol_road_9_9", 0, [(900.0, 100.0, 900.0)] * 3, radius=1.0))
        scan = kn5.scan(self.path)
        scan["meshes"][1]["center"] = (900.0, 100.0, 900.0)
        self.assertEqual([0], trackheights.lines_reached(scan, trackheights.Field([plateau()])))

    def test_three_hundred_strokes_on_a_stretch_are_one_raster_and_cancel_out_exactly(self):
        ops = [raster(x=2 * k, id_=f"u{k}", peak=100) for k in range(300)] + [raster(x=2 * k, id_=f"d{k}", peak=-100) for k in range(300)]
        field = trackheights.Field(ops)
        self.assertEqual(1, len(field.rasters))
        self.assertTrue((field.rasters[0][2] == 0).all())

    def test_changes_far_apart_are_two_rasters_a_long_track_has_no_room_for_one(self):
        field = trackheights.Field([raster(), raster(x=100000, z=100000, id_="b")])
        self.assertEqual(2, len(field.rasters))
        self.assertAlmostEqual(1.0, float(field.at(100010.0, 100010.0)[0]))
        self.assertTrue(field.reaches((100010.0, 0.0, 100010.0), 1.0))
        self.assertFalse(field.reaches((50000.0, 0.0, 50000.0), 1.0))

    def test_every_kind_along_the_ground_bends_with_it(self):
        points = [(float(x), 100.0, 10.0) for x in (0, 1, 2)]
        for kind in sorted(trackheights.FOLLOW):
            with self.subTest(kind):
                self.write(mesh(f"nocol_{kind}_0_0", 0, points))
                ys = self.apply([plateau()])[0][f"nocol_{kind}_0_0"].vertices["pos"][:, 1]
                np.testing.assert_allclose(ys, [100, 100.5, 101], atol=1e-4)     # (each by its own place)

    def test_the_same_place_in_two_meshes_stays_shut(self):
        place = (3.3, 100.0, 7.7)
        self.write(mesh("1ROAD_ground_0_0", 0, [place] * 3), mesh("1GRASS_ground_1_0", 0, [place] * 3))
        out, _scan = self.apply([plateau()])
        np.testing.assert_array_equal(out["1ROAD_ground_0_0"].vertices["pos"], out["1GRASS_ground_1_0"].vertices["pos"])

    def test_a_cut_line_keeps_its_step(self):
        self.write(mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0), (10.0, 103.0, 10.0), (10.0, 100.0, 10.0)]))
        ys = self.apply([plateau()])[0]["1ROAD_ground_0_0"].vertices["pos"][:, 1]
        np.testing.assert_allclose(ys, [101, 104, 101], atol=1e-4)

    def test_normals_turn_with_the_slope_and_stay_whole(self):
        self.write(mesh("1ROAD_ground_0_0", 0, [(1.0, 100.0, 10.0), (19.0, 100.0, 10.0), (10.0, 100.0, 10.0)]))
        out = self.apply([plateau()])[0]["1ROAD_ground_0_0"].vertices
        self.assertLess(out["normal"][0, 0], -0.05)         # (going up along +x: it leans back)
        self.assertGreater(out["normal"][1, 0], 0.05)       # (going down: forward)
        np.testing.assert_allclose(np.linalg.norm(out["normal"], axis=1), 1.0, atol=1e-5)
        np.testing.assert_allclose(np.linalg.norm(out["tangent"], axis=1), 1.0, atol=1e-5)
        self.assertGreater(out["tangent"][0, 1], 0.05)      # (and the tangent goes up with the ground)

    def test_water_and_the_distant_view_stay_the_same_to_the_byte(self):
        points = [(10.0, 100.0, 10.0)] * 3
        self.write(mesh("nocol_water_0_0", 0, points), mesh("nocol_far_0_0", 0, points), mesh("1ROAD_ground_0_0", 0, points))
        moved = trackheights.moved(self.path, kn5.scan(self.path), {}, [plateau()])
        self.assertEqual({2}, set(moved.vertices))

    def test_a_mesh_out_of_reach_is_not_even_read(self):
        self.write(mesh("1ROAD_ground_0_0", 0, [(5000.0, 100.0, 5000.0)] * 3, radius=1.0))
        scan = kn5.scan(self.path)
        scan["meshes"][0]["center"] = (5000.0, 100.0, 5000.0)
        scan["meshes"][0]["offset"] = -1        # (reading it would fail)
        self.assertEqual({}, trackheights.moved(self.path, scan, {}, [plateau()]).vertices)

    def test_a_bridge_refuses_only_where_it_is_reached(self):
        self.write(mesh("1ROAD_deck_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
        with self.assertRaisesRegex(trackheights.InTheWay, "bridge"):
            self.apply([plateau()])
        self.write(mesh("1ROAD_deck_0_0", 0, [(50.0, 100.0, 50.0)] * 3))
        self.assertEqual({}, trackheights.moved(self.path, kn5.scan(self.path), {}, [plateau()]).vertices)

    def test_a_railway_refuses_as_it_can_hold_a_bridge(self):
        for kind in ("rail", "railcol"):
            self.write(mesh(f"1WALL_{kind}_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
            with self.assertRaisesRegex(trackheights.InTheWay, "railway"):
                self.apply([plateau()])

    def test_a_bridge_over_a_change_refuses_with_all_its_corners_outside(self):
        over = [(-40.0, 100.0, -40.0), (80.0, 100.0, -40.0), (-40.0, 100.0, 80.0)]     # (the raster lies inside this one triangle)
        self.write(mesh("1ROAD_deck_0_0", 0, over))
        with self.assertRaisesRegex(trackheights.InTheWay, "bridge"):
            self.apply([plateau()])

    def test_a_bridge_beside_a_change_stays_allowed(self):
        beside = [(40.0, 100.0, 40.0), (60.0, 100.0, 40.0), (40.0, 100.0, 60.0)]
        self.write(mesh("1ROAD_deck_0_0", 0, beside), mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
        self.assertEqual({1}, set(trackheights.moved(self.path, kn5.scan(self.path), {}, [plateau()]).vertices))

    def test_changes_that_cancel_out_leave_a_bridge_in_peace(self):
        self.write(mesh("1ROAD_deck_0_0", 0, [(10.0, 100.0, 10.0)] * 3), mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
        ops = [plateau(height=h, id_=str(h)) for h in (100, 200, -300)]
        self.assertEqual({}, trackheights.moved(self.path, kn5.scan(self.path), {}, ops).vertices)

    def test_objects_without_a_list_refuse(self):
        self.write(mesh("1WALL_cars_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
        with self.assertRaisesRegex(trackheights.InTheWay, "no list"):
            self.apply([plateau()])
        self.write(mesh("1WALL_cars_0_0", 0, [(-40.0, 100.0, -40.0), (80.0, 100.0, -40.0), (-40.0, 100.0, 80.0)]))
        with self.assertRaisesRegex(trackheights.InTheWay, "no list"):
            self.apply([plateau()])

    def test_on_a_slope_where_the_change_is_nothing_the_light_turns_all_the_same(self):
        mm = np.zeros((5, 5), np.int64)
        mm[1, 2], mm[1, 3] = 1000, -1000     # (at x 4 and x 6: 0 half way, at x 5)
        ops = [{"id": "a", "x": 0, "z": 0, "nx": 5, "nz": 5, "mm": mm.ravel().tolist()}]
        self.write(mesh("1ROAD_ground_0_0", 0, [(5.0, 100.0, 2.0)] * 3))
        out = self.apply(ops)[0]["1ROAD_ground_0_0"].vertices
        np.testing.assert_allclose(out["pos"][:, 1], 100.0, atol=1e-4)
        self.assertGreater(abs(out["normal"][0, 0]), 0.1)

    def test_a_wire_stays_on_its_poles(self):
        poles = [(1.0, 100.0, 10.0)] * 3 + [(10.0, 100.0, 10.0)] * 3
        wire = [(1.0, 108.0, 11.0), (5.5, 107.0, 11.0), (10.0, 108.0, 11.0)]
        self.write(mesh("nocol_props_0_0", 0, poles), mesh("nocol_wire_0_0", 0, wire))
        objects = {"t_0_0": {"kinds": ["power pole", "power pole", "wire"], "at": [[1.0, 100.0, 10.0], [10.0, 100.0, 10.0], [5.5, 107.0, 11.0]],
                             "parents": [-1, -1, -1], "faces": [[[0, 0, 1]], [[0, 1, 1]], [[1, 0, 1]]],
                             "with": {"0": ["t_0_0#2"], "1": ["t_0_0#2"]}}}
        out = self.apply([plateau()], objects)[0]
        np.testing.assert_allclose(out["nocol_props_0_0"].vertices["pos"][:, 1], [100.5] * 3 + [101] * 3, atol=1e-4)
        # (by the place of each it would be 100.5, 1 m and 1 m: here the way from pole to pole, 0.5, 0.75, 1)
        np.testing.assert_allclose(out["nocol_wire_0_0"].vertices["pos"][:, 1], [108.5, 107.75, 109.0], atol=1e-4)

    def test_a_wire_with_a_pole_lost_goes_by_the_ground(self):
        self.write(mesh("nocol_wire_0_0", 0, [(1.0, 108.0, 10.0), (5.5, 107.0, 10.0), (10.0, 108.0, 10.0)]))
        objects = {"t_0_0": {"kinds": ["wire"], "at": [[5.5, 107.0, 10.0]], "parents": [-1], "faces": [[[0, 0, 1]]], "with": {}}}
        ys = self.apply([plateau()], objects)[0]["nocol_wire_0_0"].vertices["pos"][:, 1]
        np.testing.assert_allclose(ys, [108.5, 108.0, 109.0], atol=1e-4)

    def test_an_object_moves_whole_by_its_place_and_what_belongs_to_it_with_it(self):
        house = [(1.0, 100.0, 10.0), (3.0, 100.0, 10.0), (2.0, 105.0, 10.0)]        # (leans over the slope: its own places differ)
        sign = [(1.5, 101.0, 10.0), (2.5, 101.0, 10.0), (2.0, 102.0, 10.0)]
        other = [(19.0, 100.0, 10.0), (19.5, 100.0, 10.0), (19.0, 101.0, 10.0)]
        self.write(mesh("nocol_bld_0_0", 0, house + sign + other))
        objects = {"t_0_0": {"kinds": ["house", "house sign", "house"], "at": [[10.0, 100.0, 10.0], [1.5, 100.0, 10.0], [50.0, 100.0, 50.0]],
                             "parents": [-1, 0, -1], "faces": [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]], "with": {}}}
        ys = self.apply([plateau()], objects)[0]["nocol_bld_0_0"].vertices["pos"][:, 1]
        np.testing.assert_allclose(ys, [101, 101, 106, 102, 102, 103, 100, 100, 101], atol=1e-4)

    def test_an_object_in_a_mesh_along_the_ground_goes_by_the_ground(self):
        self.write(mesh("nocol_fence_0_0", 0, [(0.0, 100.0, 10.0), (1.0, 100.0, 10.0), (2.0, 100.0, 10.0)]))
        objects = {"t_0_0": {"kinds": ["fence"], "at": [[10.0, 100.0, 10.0]], "parents": [-1], "faces": [[[0, 0, 1]]], "with": {}}}
        ys = self.apply([plateau()], objects)[0]["nocol_fence_0_0"].vertices["pos"][:, 1]
        np.testing.assert_allclose(ys, [100, 100.5, 101], atol=1e-4)

    def billboards(self, *places):
        """A mesh of billboards (8 triangles each) at those places in x, z."""
        points = [(x + side, 100.0 + k, z) for x, z in places for k in range(8 * 3) for side in (0.5 if k % 2 else -0.5,)]
        return points

    def test_a_billboard_moves_whole(self):
        self.write(mesh("nocol_trees_0_0", 1, self.billboards((1.0, 10.0), (50.0, 50.0))))
        ys = self.apply([plateau()])[0]["nocol_trees_0_0"].vertices["pos"][:, 1]
        self.assertEqual(1, len(set(np.round(ys[:24] - (100.0 + np.arange(24)), 3))))    # (one change for all of it)
        self.assertAlmostEqual(0.5, float(ys[0] - 100.0), places=2)
        np.testing.assert_allclose(ys[24:], 100.0 + np.arange(24), atol=1e-4)

    def test_a_billboard_across_two_parts_of_a_mesh_stays_one(self):
        points = self.billboards((1.0, 10.0))
        self.write(mesh("nocol_trees_0_0", 1, points[:12]), mesh("nocol_trees_0_0_1", 1, points[12:]))
        out = self.apply([plateau()])[0]
        ys = np.r_[out["nocol_trees_0_0"].vertices["pos"][:, 1], out["nocol_trees_0_0_1"].vertices["pos"][:, 1]]
        self.assertEqual(1, len(set(np.round(ys - (100.0 + np.arange(24)), 3))))

    def test_the_start_moves_with_the_ground(self):
        at = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 10.0, 100.0, 10.0, 1.0)
        far = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 90.0, 100.0, 90.0, 1.0)
        self.write(mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0)] * 3), points=[("AC_START_0", at), ("AC_PIT_0", far)])
        points = self.apply([plateau()])[1]["points"]
        self.assertAlmostEqual(101.0, points["AC_START_0"][13], places=4)
        self.assertEqual(100.0, points["AC_PIT_0"][13])

    def test_its_sphere_grows_and_every_mesh_not_moved_stays_the_same_to_the_byte(self):
        self.write(mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0)] * 3), mesh("nocol_water_0_0", 0, [(10.0, 50.0, 10.0)] * 3), mesh("1ROAD_ground_9_9", 0, [(900.0, 7.0, 900.0)] * 3))
        out_path = os.path.join(self.dir, "out.kn5")
        scan = kn5.scan(self.path)
        kn5.without_faces(self.path, out_path, {}, trackheights.moved(self.path, scan, {}, [plateau()]))
        after = kn5.scan(out_path)
        self.assertEqual(os.path.getsize(self.path), os.path.getsize(out_path))
        self.assertAlmostEqual(101.0, after["meshes"][0]["radius"])
        self.assertEqual([100.0, 100.0], [m["radius"] for m in after["meshes"][1:]])
        with open(self.path, "rb") as a, open(out_path, "rb") as b:
            old, new = a.read(), b.read()
        first = scan["meshes"][0]
        changed_to = first["offset"] + first["vertices"] * kn5.VERTEX.itemsize + 4 + first["indices"] * 2 + 4 + 4 + 8 + 12 + 4
        self.assertEqual(old[:first["offset"]], new[:first["offset"]])
        self.assertEqual(old[changed_to:], new[changed_to:])

    def test_triangles_go_and_the_rest_moves(self):
        points = [(float(x), 100.0, 10.0) for x in (8, 9, 10, 11, 12, 13)]
        self.write(mesh("1ROAD_ground_0_0", 0, points))
        out = self.apply([plateau()], going={0: np.array([True, False])})[0]["1ROAD_ground_0_0"]
        np.testing.assert_allclose(out.vertices["pos"][:, 0], [11, 12, 13])
        np.testing.assert_allclose(out.vertices["pos"][:, 1], 101, atol=1e-4)

    def test_an_object_reached_by_a_change_but_standing_outside_it_is_named(self):
        big = [(9.0, 100.0, 10.0), (60.0, 100.0, 10.0), (60.0, 105.0, 10.0)]        # (it reaches in, its place lies outside)
        small = [(50.0, 100.0, 50.0), (51.0, 100.0, 50.0), (50.0, 101.0, 50.0)]
        inside = [(10.0, 100.0, 10.0), (11.0, 100.0, 10.0), (10.0, 101.0, 10.0)]
        self.write(mesh("nocol_bld_0_0", 0, big + small + inside))
        objects = {"t_0_0": {"kinds": ["house"] * 3, "at": [[40.0, 100.0, 10.0], [50.0, 100.0, 50.0], [10.0, 100.0, 10.0]], "parents": [-1, -1, -1],
                             "faces": [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]], "with": {}}}
        self.assertEqual(1, trackheights.standing(self.path, kn5.scan(self.path), objects, plateau()))

    def test_the_list_says_where_objects_are_now(self):
        objects = {"t_0_0": {"at": [[10.0, 100.0, 10.0], [1.0, 100.0, 10.0], [50.0, 7.0, 50.0]], "parents": [-1, 0, -1]},
                   "t_9_9": {"at": [[900.0, 1.0, 900.0]], "parents": [-1]}}
        out = trackheights.list_moved(objects, [plateau()])
        self.assertEqual([[10.0, 101.0, 10.0], [1.0, 101.0, 10.0], [50.0, 7.0, 50.0]], out["t_0_0"]["at"])
        self.assertIs(objects["t_9_9"], out["t_9_9"])
        self.assertEqual(100.0, objects["t_0_0"]["at"][0][1])       # (the list given stays)


if __name__ == "__main__":
    unittest.main()
