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

    def test_the_list_says_where_objects_are_now(self):
        objects = {"t_0_0": {"at": [[10.0, 100.0, 10.0], [1.0, 100.0, 10.0], [50.0, 7.0, 50.0]], "parents": [-1, 0, -1]},
                   "t_9_9": {"at": [[900.0, 1.0, 900.0]], "parents": [-1]}}
        out = trackheights.list_moved(objects, [plateau()])
        self.assertEqual([[10.0, 101.0, 10.0], [1.0, 101.0, 10.0], [50.0, 7.0, 50.0]], out["t_0_0"]["at"])
        self.assertIs(objects["t_9_9"], out["t_9_9"])
        self.assertEqual(100.0, objects["t_0_0"]["at"][0][1])       # (the list given stays)


if __name__ == "__main__":
    unittest.main()
