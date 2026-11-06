"""The build's list of single objects: from what make_obj adds, through its splits and 1WALL's doubled triangles, to the right
triangles of the finished kn5."""
import json
import os
import re
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
import buildings  # noqa: E402
from buildings.build import _listed  # noqa: E402
from app import mytracks, trackedits, trackview  # noqa: E402
from track import kn5, make_obj, obj_to_kn5, objectlist  # noqa: E402

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)


class RunsTest(unittest.TestCase):
    def test_runs_of_owners_without_the_unowned(self):
        self.assertEqual([[2, 0, 2], [3, 2, 1], [2, 5, 1]], objectlist.runs_of([2, 2, 3, -1, -1, 2]))
        self.assertEqual([], objectlist.runs_of([]))


class PiecesTest(unittest.TestCase):
    def test_a_mesh_in_one_piece(self):
        self.assertEqual([[7, 10, 5]], objectlist.pieces_of(10, 15, [[(7, 15)]], False))

    def test_a_doubled_mesh_has_each_object_twice(self):
        self.assertEqual([[7, 0, 10], [7, 15, 10]], objectlist.pieces_of(0, 10, [[(7, 30)]], True))

    def test_across_two_nodes(self):
        self.assertEqual([[1, 0, 6], [2, 0, 4]], objectlist.pieces_of(0, 10, [[(1, 6), (2, 7)]], False))

    def test_doubling_splits_a_part_into_nodes(self):
        self.assertEqual([[1, 0, 5], [1, 8, 2], [2, 0, 3]], objectlist.pieces_of(0, 5, [[(1, 10), (2, 6)]], True))

    def test_across_two_obj_parts(self):
        self.assertEqual([[0, 99, 1], [1, 0, 1]], objectlist.pieces_of(99, 101, [[(0, 100)], [(1, 1)]], False))

    def test_parts_in_order_and_no_others(self):
        written = {"a_1_2": [0], "a_1_2_1": [1], "a_1_2_2": [2], "a_1_20": [9], "b": [8]}
        self.assertEqual([[0], [1], [2]], objectlist.parts_of("a_1_2", written))
        self.assertEqual([], objectlist.parts_of("c", written))

    def test_the_tiles_numbers_count_on(self):
        lists = [{"t_0_0": {"kinds": ["car"], "at": [[0, 0, 0]], "parents": [-1], "faces": [[[0, 0, 5]]]}},
                 {"t_1_0": {"kinds": ["car"], "at": [[1, 1, 1]], "parents": [-1], "faces": [[[1, 3, 2]]]}}]
        merged = objectlist.merged(lists, [4, 2])
        self.assertEqual([[0, 0, 5]], merged["t_0_0"]["faces"][0])
        self.assertEqual([[5, 3, 2]], merged["t_1_0"]["faces"][0])


def obj_mesh(count, faces_each):
    """count objects of faces_each triangles with their own vertices; an object's x is its number."""
    per_object = np.arange(faces_each * 3).reshape(-1, 3)
    P = np.array([(k, f, 0.0) for k in range(count) for f in range(faces_each * 3)], float)
    return P, np.zeros((len(P), 2)), np.concatenate([per_object + k * faces_each * 3 for k in range(count)])


class WholeWayTest(unittest.TestCase):
    """From Obj.add to the triangles in the kn5 file."""

    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = tmp.name
        self.part = os.path.join(self.dir, "t_0_0.obj")

    def built(self, obj):
        """The OBJ part as far as a kn5: (its path, its scan, the tile's list)."""
        obj.close()
        chunk = os.path.join(self.dir, "c.bin")
        nodes, _verts, _roads, objects = obj_to_kn5._part_chunk(self.part, chunk, {"m": 0}, None)
        path = os.path.join(self.dir, "x.kn5")
        kn5.write_streamed(path, [], [kn5.Material("m", "ksPerPixel", 0, 0, 0, [], [])],
                           kn5.Node(1, "map2lap", 1, matrix=IDENTITY), [chunk], nodes)
        return path, kn5.scan(path), objects.get("t_0_0")

    def corners(self, path, scan, pieces):
        """x of every corner the pieces of an object name, in the file."""
        xs = []
        with open(path, "rb") as f:
            for mesh, first, count in pieces:
                m = scan["meshes"][mesh]
                f.seek(m["offset"])
                v = np.frombuffer(f.read(m["vertices"] * kn5.VERTEX.itemsize), dtype=kn5.VERTEX)
                f.read(4)
                i = np.frombuffer(f.read(m["indices"] * 2), dtype=np.uint16)
                xs.extend(v["pos"][i[first * 3:(first + count) * 3], 0].tolist())
        return xs

    def check(self, name, count, faces_each, doubled):
        P, UV, T = obj_mesh(count, faces_each)
        obj = make_obj.Obj(self.part, header=False)
        numbers = [obj.listed.new("car", k, 0.0, 0.0) for k in range(count)]
        obj.add("nocol_water_0_0", "m", P[:3], UV[:3], T[:1])
        obj.add(name, "m", P, UV, T, owners=np.repeat(numbers, faces_each))
        path, scan, listed = self.built(obj)
        self.assertEqual(count, len(listed["faces"]))
        for k in sorted({0, 1, count // 2, count - 1}):
            xs = self.corners(path, scan, listed["faces"][k])
            self.assertEqual({float(k)}, set(xs), f"object {k}")
            self.assertEqual(faces_each * 3 * (2 if doubled else 1), len(xs), f"object {k}")

    def test_a_few_objects_doubled(self):
        self.check("1WALL_cars_0_0", 5, 16, True)

    def test_a_mesh_split_by_doubling(self):
        self.check("1WALL_cars_0_0", 800, 20, True)     # (16,000 triangles: 32,000 doubled, two kn5 meshes)

    def test_a_mesh_split_in_the_obj_and_by_doubling(self):
        self.check("1WALL_cars_0_0", 1300, 20, True)    # (26,000 triangles: two OBJ objects, four kn5 meshes)

    def test_a_mesh_not_doubled(self):
        self.check("nocol_props_0_0", 1300, 20, False)

    def test_an_object_in_two_meshes_and_a_mesh_with_unowned_triangles(self):
        P, UV, T = obj_mesh(4, 2)
        obj = make_obj.Obj(self.part, header=False)
        a, b = obj.listed.new("house", 0, 0, 0), obj.listed.new("house sign", 0, 0, 0, parent=0)
        obj.add("1WALL_bld_a_0_0", "m", P, UV, T, owners=np.array([a, a, b, b, -1, -1, a, a]))
        obj.add("nocol_bld_b_0_0", "m", P, UV, T[:2], owners=np.array([b, b]))
        path, scan, listed = self.built(obj)
        self.assertEqual({0.0, 3.0}, set(self.corners(path, scan, listed["faces"][a])))
        self.assertEqual({0.0, 1.0}, set(self.corners(path, scan, listed["faces"][b])))
        self.assertEqual([-1, 0], listed["parents"])
        self.assertEqual(["house", "house sign"], listed["kinds"])

    def test_a_part_without_objects_lists_none(self):
        P, UV, T = obj_mesh(1, 2)
        obj = make_obj.Obj(self.part, header=False)
        obj.add("nocol_water_1_1", "m", P, UV, T)
        obj.close()
        self.assertFalse(os.path.exists(objectlist.side_file(self.part)))
        self.assertEqual({}, obj_to_kn5._part_chunk(self.part, os.path.join(self.dir, "c.bin"), {"m": 0}, None)[3])

    def test_a_tile_built_again_without_objects_leaves_no_old_list(self):
        P, UV, T = obj_mesh(2, 2)
        obj = make_obj.Obj(self.part, header=False)
        a = obj.listed.new("car", 0, 0, 0)
        obj.add("1WALL_cars_0_0", "m", P, UV, T, owners=np.repeat(a, 4))
        obj.close()
        self.assertTrue(os.path.exists(objectlist.side_file(self.part)))
        make_obj.Obj(self.part, header=False).close()
        self.assertFalse(os.path.exists(objectlist.side_file(self.part)))

    def test_positions_in_ac_s_frame(self):
        listed = objectlist.TileList()
        listed.new("car", 10.0, 20.0, 3.0)      # (x east, y north, z up)
        self.assertEqual([[10.0, 3.0, -20.0]], listed.at)

    def test_a_sort_is_its_kind_unless_finer(self):
        listed = objectlist.TileList()
        listed.new("car", 0, 0, 0)
        listed.new("street furniture", 0, 0, 0, sort="bench")
        self.assertEqual(["car", "bench"], listed.sorts)

    def test_a_list_without_sorts_has_its_kinds_as_sorts(self):
        self.assertEqual(["car"], objectlist.sorts_of({"kinds": ["car"]}))
        self.assertEqual(["bench"], objectlist.sorts_of({"kinds": ["street furniture"], "sorts": ["bench"]}))

    def test_the_sorts_to_delete_all_of(self):
        objects = {"a": {"kinds": ["house", "door", "car", "car"], "sorts": ["house", "door", "car", "car"],
                         "faces": [[[0, 0, 1]], [[0, 1, 1]], [], [[0, 2, 1]]]},
                   "b": {"kinds": ["street furniture"], "faces": [[]]}}
        # (houses never; an object left out of a modded track has no triangles, its sort counts only by another's)
        self.assertEqual({"door", "car"}, objectlist.all_sorts(objects))


class HousesTest(unittest.TestCase):
    """What the building code tells about its meshes, and make_obj reading it from the shape file."""

    def spec(self, x, sign=None):
        """A house as the planner makes one, with a shop's sign band on its first wall if asked."""
        s = buildings.plan(np.array([(x, 0.0), (x + 10.0, 0.0), (x + 10.0, 8.0), (x, 8.0)]), {"class": "house"}, lat=47.0, lon=14.0)
        if sign is not None:
            s.sign, s.names = sign, ("Shop",)
        return s

    def built(self, specs, directory):
        listed, starts = [], []
        items = [(s, 0.0, 0.5) for s in specs]
        meshes = buildings.build_parts(items, objects=listed)
        col = buildings.collision_mesh(items, starts)
        shape = os.path.join(directory, "bld_1_0_0.cdae")
        buildings.write(shape, meshes[0])
        buildings.write_objects(shape, meshes[0], listed[0])
        return meshes, listed, col, starts, shape

    def test_each_building_s_vertices_and_its_signs(self):
        with tempfile.TemporaryDirectory() as d:
            specs = [self.spec(0.0), self.spec(20.0, sign=0), self.spec(40.0)]
            meshes, listed, _col, starts, _shape = self.built(specs, d)
            P = meshes[0][0]
            entries = listed[0]
            self.assertEqual([0, 1, 2], [e["item"] for e in entries])
            self.assertEqual(3, len(starts))
            ends = [e["start"] for e in entries[1:]] + [len(P)]
            for e, end, x in zip(entries, ends, (0.0, 20.0, 40.0)):
                # (a sign or a cornice stands out a little: within a metre of its walls)
                self.assertGreaterEqual(P[e["start"]:end, 0].min(), x - 1.0)
                self.assertLessEqual(P[e["start"]:end, 0].max(), x + 11.0)
            self.assertFalse(any(what == "sign" for _v, what in entries[0]["marks"]))
            self.assertTrue(any(what == "sign" for _v, what in entries[1]["marks"]))

    def test_the_shape_file_numbers_its_vertices_as_vertex_order_says(self):
        import cdae
        with tempfile.TemporaryDirectory() as d:
            meshes, _listed, _col, _starts, shape = self.built([self.spec(0.0), self.spec(20.0, sign=0)], d)
            P0, T, M, mats = meshes[0][0], meshes[0][2], meshes[0][3], meshes[0][4]
            P = next(make_obj.shape_parts(shape, [0.0, 0.0, 0.0]))[1]
            self.assertTrue(np.allclose(P, P0[cdae.vertex_order(T, M, len(list(mats)))], atol=1e-3))

    def test_collision_mesh_owners_too(self):
        with tempfile.TemporaryDirectory() as d:
            meshes, listed, col, starts, shape = self.built([self.spec(0.0), self.spec(20.0)], d)
            path = os.path.join(d, "bldcol_1_0_0.cdae")
            buildings.write(path, col, collision_only=True)
            buildings.write_objects(path, col, [{"item": k, "start": s} for k, s in enumerate(starts)])
            data = {"bld": {"shape": "x/bld_1_0_0.cdae", "pos": [0.0, 0.0, 0.0]},
                    "bldcol": {"shape": "x/bldcol_1_0_0.cdae", "pos": [0.0, 0.0, 0.0]}}
            shapes = [("bld", list(make_obj.shape_parts(shape, [0.0, 0.0, 0.0]))), ("bldcol", list(make_obj.shape_parts(path, [0.0, 0.0, 0.0])))]
            objects = objectlist.TileList()
            owners, _rings = make_obj._buildings_listed(objects, data, shapes, d)
            P = shapes[1][1][0][1]
            self.assertEqual(len(P), len(owners["bldcol"]))
            self.assertEqual({0, 1}, set(owners["bldcol"].tolist()))
            self.assertTrue((P[owners["bldcol"] == 0, 0] < 15.0).all())
            self.assertTrue((P[owners["bldcol"] == 1, 0] > 15.0).all())

    def test_make_obj_gives_every_vertex_its_owner(self):
        with tempfile.TemporaryDirectory() as d:
            specs = [self.spec(0.0), self.spec(20.0, sign=0)]
            meshes, listed, _col, _starts, shape = self.built(specs, d)
            objects = objectlist.TileList()
            parts = list(make_obj.shape_parts(shape, [100.0, 0.0, 0.0]))
            P = parts[0][1]
            data = {"bld": {"shape": "x/bld_1_0_0.cdae", "pos": [100.0, 0.0, 0.0]}}
            owners, rings = make_obj._buildings_listed(objects, data, [("bld", parts)], d)
            self.assertEqual(len(P), len(owners["bld"]))
            self.assertGreaterEqual(owners["bld"].min(), 0)
            houses = [k for k, kind in enumerate(objects.kinds) if kind == "house"]
            signs = [k for k, kind in enumerate(objects.kinds) if kind == "house sign"]
            self.assertEqual(2, len(houses))
            self.assertTrue(signs)
            self.assertEqual({houses[1]}, {objects.parents[k] for k in signs})
            self.assertTrue((P[owners["bld"] == houses[0], 0] < 115.0).all())
            self.assertTrue((P[owners["bld"] == houses[1], 0] > 115.0).all())
            self.assertTrue((P[np.isin(owners["bld"], signs), 0] > 115.0).all())
            self.assertEqual(2, len(rings))

    def test_a_door_row_says_its_house_whatever_shape_its_wall_is_drawn(self):
        l_shaped = np.array([(0.0, 0.0), (20.0, 0.0), (20.0, 8.0), (8.0, 8.0), (8.0, 20.0), (0.0, 20.0)])
        house = buildings.plan(l_shaped, {"class": "house"}, lat=47.0, lon=14.0)
        house.roof = "gable"
        other = self.spec(100.0)
        rows = buildings.doors([(other, 0.0, 0.5), (house, 0.0, 0.5)], [(np.array([(-5.0, -3.0), (130.0, -3.0)]), 3.0)], 0.0, 0.0)
        doors = [r for r in rows if r[0] == "door"]
        self.assertEqual({0, 1}, {r[8] for r in doors})

    def test_a_bridge_s_parts_are_no_houses(self):
        for cls in ("bridge_structure", "bridge_part", "bridge_pier"):
            s = self.spec(0.0)
            s.cls = cls
            self.assertFalse(_listed(0, (s, 0.0, 0.5), 0, [])["house"], cls)
        self.assertTrue(_listed(0, (self.spec(0.0), 0.0, 0.5), 0, [])["house"])


class WiresTest(unittest.TestCase):
    def test_a_span_is_the_wires_that_start_and_end_together(self):
        import furniture
        poles = [(0.0, 0.0, 0.0, 90.0), (30.0, 0.0, 0.0, 90.0), (60.0, 0.0, 0.0, 90.0)]
        lines = furniture.wire_lines(poles)
        starts = []
        furniture.wire_mesh(lines, (0.0, 0.0, 0.0), starts)
        spans = furniture.wire_spans(lines, starts)
        self.assertEqual(6, len(lines))
        self.assertEqual(2, len(spans))
        self.assertEqual(starts[3], spans[1]["start"])

    def test_a_short_span_stays_a_span_of_its_own(self):
        import furniture
        lines = furniture.wire_lines([(0.0, 0.0, 0.0, 90.0), (6.0, 0.0, 0.0, 90.0), (12.0, 0.0, 0.0, 90.0)])
        starts = []
        furniture.wire_mesh(lines, (0.0, 0.0, 0.0), starts)
        self.assertEqual(2, len(furniture.wire_spans(lines, starts)))

    def test_the_shape_file_s_vertices_come_to_their_spans(self):
        import cdae
        import furniture
        with tempfile.TemporaryDirectory() as d:
            lines = furniture.wire_lines([(0.0, 0.0, 0.0, 90.0), (30.0, 0.0, 0.0, 90.0), (60.0, 0.0, 0.0, 90.0)])
            starts = []
            wm = furniture.wire_mesh(lines, (0.0, 0.0, 0.0), starts)
            shape = os.path.join(d, "wire_1_0_0.cdae")
            cdae.write(shape, wm[0], wm[1], uvs=wm[2], material="bne_wire", object_name="wires")
            furniture.write_wire_objects(shape, wm, furniture.wire_spans(lines, starts))
            parts = list(make_obj.shape_parts(shape, [0.0, 0.0, 0.0]))
            objects = objectlist.TileList()
            owner = make_obj._wires_listed(objects, {"wire": {"shape": "x/wire_1_0_0.cdae", "pos": [0.0, 0.0, 0.0]}}, [("wire", parts)], d)["wire"]
            self.assertEqual(["power line", "power line"], objects.kinds)
            P = parts[0][1]
            self.assertTrue((P[owner == 0, 0] <= 30.1).all())
            self.assertTrue((P[owner == 1, 0] >= 29.9).all())

    def test_a_pole_gets_the_spans_at_it_in_any_tile(self):
        objects = {"t_0_0": {"spans": {"5": [[0.5, 0.0, 8.0], [30.0, 0.0, 8.0], "pole"]}, "poles": {"1": [0.0, 0.0, "pole"]}},
                   "t_1_0": {"spans": {"7": [[30.0, 0.0, 8.0], [300.0, 0.0, 8.0], "pole"]}, "poles": {"2": [30.0, 0.5, "pole"], "3": [100.0, 0.0, "pole"]}}}
        self.assertEqual({"t_0_0": {"1": ["t_0_0#5"]}, "t_1_0": {"2": ["t_0_0#5", "t_1_0#7"]}}, objectlist.linked(objects))

    def test_two_lines_side_by_side_stay_two_spans(self):
        import furniture
        import powerlines
        n = len(powerlines.ARMS)
        a = [(np.array([(0.0 + k, 0.0, 20.0), (400.0 + k, 0.0, 20.0)]), powerlines.WIRE_R) for k in range(n)]
        b = [(np.array([(5.0 + k, 0.0, 20.0), (405.0 + k, 0.0, 20.0)]), powerlines.WIRE_R) for k in range(n)]
        starts = []
        furniture.wire_mesh(a + b, (0.0, 0.0, 0.0), starts)
        spans = furniture.wire_spans(a + b, starts)
        self.assertEqual(2, len(spans))
        self.assertEqual(starts[n], spans[1]["start"])

    def test_a_street_s_wires_and_a_pylon_s_are_never_one_span(self):
        import furniture
        import powerlines
        line = np.array([(0.0, 0.0, 8.0), (30.0, 0.0, 8.0)])
        lines = [line, (line.copy(), powerlines.WIRE_R)]
        starts = []
        furniture.wire_mesh(lines, (0.0, 0.0, 0.0), starts)
        self.assertEqual(["pole", "pylon"], [s["on"] for s in furniture.wire_spans(lines, starts)])

    def test_a_high_voltage_line_never_hangs_on_a_street_s_pole_beside_it(self):
        objects = {"t_0_0": {"spans": {"5": [[4.12, 0.0, 25.0], [400.0, 0.0, 25.0], "pylon"]},
                             "poles": {"1": [0.0, 0.0, "pylon"], "2": [4.0, 0.0, "pole"]}}}
        self.assertEqual({"t_0_0": {"1": ["t_0_0#5"]}}, objectlist.linked(objects))

    def test_a_street_s_wire_never_hangs_on_a_pylon_beside_it(self):
        objects = {"t_0_0": {"spans": {"5": [[4.0, 0.0, 8.0], [40.0, 0.0, 8.0], "pole"]},
                             "poles": {"1": [0.0, 0.0, "pylon"], "2": [4.0, 0.0, "pole"]}}}
        self.assertEqual({"t_0_0": {"2": ["t_0_0#5"]}}, objectlist.linked(objects))

    def test_a_span_ends_at_its_pole_itself(self):
        import furniture
        lines = furniture.wire_lines([(10.0, 20.0, 0.0, 90.0), (40.0, 20.0, 0.0, 90.0)])
        starts = []
        furniture.wire_mesh(lines, (0.0, 0.0, 0.0), starts)
        span = furniture.wire_spans(lines, starts)[0]
        self.assertEqual([10.0, 20.0], span["from"][:2])
        self.assertEqual([40.0, 20.0], span["to"][:2])
        self.assertEqual("pole", span["on"])


class PropsTest(unittest.TestCase):
    def test_each_row_has_its_vertices(self):
        from scenery import propsmesh
        groups = ["speedk50", "door", "bin", "lamplens"]
        rows = [[0, 1.0, 1.0, 0.0, 0.0, 1.0, 2.5, 0.5], [3, 2.0, 2.0, 0.0, 0.0, 1.0, 2.5, 0.5],
                [1, 5.0, 5.0, 0.0, 0.0, 1.0, 2.1, 0.5, 4], [2, 9.0, 9.0, 0.0, 0.0, 1.0, 1.0, 0.5]]
        marks = []
        solid, deco, _trees = propsmesh.build(groups, rows, None, marks)
        objects = objectlist.TileList()
        solid_owner, deco_owner = make_obj._props_listed(objects, groups, rows, marks, solid, deco, {4: 77})
        self.assertEqual(["road sign", "door", "street furniture"], objects.kinds)
        self.assertEqual(["speedk50", "door", "bin"], objects.sorts)
        self.assertEqual([-1, 77, -1], objects.parents)
        self.assertEqual({0}, set(solid_owner.tolist()))        # (only the sign's post has collision)
        self.assertEqual({0, 1, 2}, set(deco_owner.tolist()))
        self.assertTrue((deco[0][deco_owner == 1, 0] < 6.0).all())
        self.assertTrue((deco[0][deco_owner == 2, 0] > 8.0).all())


class KindsTest(unittest.TestCase):
    """A new kind of mesh can't come in unnoticed."""

    def test_every_mesh_make_obj_adds_is_entered(self):
        path = os.path.join(ENGINE, "..", "src", "track", "make_obj.py")
        with open(path, encoding="utf-8") as f:
            source = f.read()
        names = re.findall(r'f"((?:1[A-Z]+|nocol|\{prefix\}|\{pre\})_[^"]*\{tx\}_\{ty\})"', source)
        self.assertGreater(len(names), 10)
        for name in names:
            for prefix in make_obj.LEISURE_KINDS if name.startswith("{prefix}_{tx}") else ("1WALL",):     # (leisure's prefix is whole)
                sample = (name.replace("{prefix}", prefix).replace("{pre}", "1GRASS").replace("{what}", "bld").replace("{mat}", "m")
                          .replace("{tx}", "0").replace("{ty}", "0"))
                self.assertIsNone(objectlist.problem(sample, True), sample)

    def test_a_kind_not_entered_is_named(self):
        self.assertIn("nocol_spaceship_0_0", objectlist.problem("nocol_spaceship_0_0", True))

    def test_a_listed_kind_without_owners_is_named(self):
        self.assertIn("1WALL_cars_0_0", objectlist.problem("1WALL_cars_0_0", False))

    def test_what_needs_none_needs_none(self):
        for name in ("1ROAD_ground_0_0", "nocol_trees_0_0", "nocol_trees_bush_0_0", "nocol_bush_0_0", "nocol_far_1", "1WALL_deck_con_00_0_0",
                     "nocol_fence_sub_0_0", "1WALL_fencecol_sub_0_0", "nocol_gate_band_start", "1WALL_gate_x"):
            self.assertIsNone(objectlist.problem(name, False), name)

    def test_strict_stops_the_build_else_it_is_said(self):
        with tempfile.TemporaryDirectory() as d:
            P, UV, T = obj_mesh(1, 2)
            with mock.patch.dict(os.environ):
                os.environ.pop(objectlist.STRICT, None)
                obj = make_obj.Obj(os.path.join(d, "t_0_0.obj"), header=False)
                obj.add("nocol_spaceship_0_0", "m", P, UV, T)
                self.assertEqual(1, len(obj.problems))
                obj.close()
            with mock.patch.dict(os.environ, {objectlist.STRICT: "1"}):
                obj = make_obj.Obj(os.path.join(d, "t_1_0.obj"), header=False)
                with self.assertRaises(ValueError):
                    obj.add("nocol_spaceship_0_0", "m", P, UV, T)
                obj.close()


class MarkedTest(unittest.TestCase):
    def test_each_marked_object_gets_its_vertices_and_empty_ones_none(self):
        P = np.array([(float(k), 0.0, 0.0) for k in range(6)])
        objects = objectlist.TileList()
        vertex = make_obj._marked(objects, "pool", (P,), [0, 2, 2, 5])
        self.assertEqual([0, 0, 1, 1, 1, 2], vertex.tolist())
        self.assertEqual(["pool", "pool", "pool"], objects.kinds)

    def test_in_two_meshes_one_number(self):
        a, b = (np.zeros((4, 3)),), (np.zeros((2, 3)),)
        objects = objectlist.TileList()
        of_a, of_b = make_obj._marked_in_two(objects, "fence", [(0, 0), (3, 0), (3, 1)], a, b)
        self.assertEqual([0, 0, 0, 2], of_a.tolist())
        self.assertEqual([1, 2], of_b.tolist())

    def test_one_mesh_of_the_two_missing(self):
        objects = objectlist.TileList()
        of_a, of_b = make_obj._marked_in_two(objects, "fence", [(0, 0)], (np.zeros((2, 3)),), None)
        self.assertEqual([0, 0], of_a.tolist())
        self.assertEqual(0, len(of_b))

    def test_rocks_say_where_they_are(self):
        from scenery import rocks
        places = {}
        meshes = rocks.meshes([("rock", 1.0, 2.0, 3.0, 0.0, 0.5, 0.1), ("rock", 9.0, 2.0, 3.0, 0.0, 0.5, 0.2)], None, places)
        self.assertEqual(1, len(meshes))
        prefix = next(iter(meshes))
        self.assertEqual([(1.0, 2.0, 3.0), (9.0, 2.0, 3.0)], places[prefix])
        self.assertEqual(0, len(meshes[prefix][2]) % 2)


class SignsTest(unittest.TestCase):
    def test_the_shape_file_s_vertices_come_to_their_signs(self):
        import cdae
        import exitsigns
        import signstream
        with tempfile.TemporaryDirectory() as d:
            P = np.array([(x + dx, dy, 0.0) for x in (0.0, 50.0) for dx, dy in ((0, 0), (1, 0), (1, 1), (0, 1))])
            T = np.array([(0, 1, 2), (0, 2, 3), (4, 5, 6), (4, 6, 7)])
            mesh = exitsigns.with_starts((P, T, np.zeros((8, 2)), ["a", "b"], np.array([1, 0, 1, 0])), [0, 4])
            path = os.path.join(d, "speeds_1_0_0.cdae")
            cdae.write(path, P, T, uvs=mesh[2], material=mesh[3], tri_materials=mesh[4], object_name="signs")
            signstream.write_parts(path, mesh)
            read = next(make_obj.shape_parts(path, [0.0, 0.0, 0.0]))[1]
            objects = objectlist.TileList()
            vertex = make_obj._signs_listed(objects, "road sign", "speeds", read, objectlist.load_side(path))
            self.assertEqual(["road sign", "road sign"], objects.kinds)
            self.assertEqual(["speeds", "speeds"], objects.sorts)
            self.assertTrue((read[vertex == 0, 0] < 10.0).all())
            self.assertTrue((read[vertex == 1, 0] > 10.0).all())

    def test_a_shape_without_its_file_is_no_one_s(self):
        objects = objectlist.TileList()
        self.assertEqual([-1, -1], make_obj._signs_listed(objects, "road sign", "exits", np.zeros((2, 3)), {}).tolist())
        self.assertEqual([], objects.kinds)


class PoleLampTest(unittest.TestCase):
    def test_a_pole_s_lamp_belongs_to_it(self):
        from scenery import propsmesh
        groups = ["pole", "polelamp"]
        rows = [[0, 3.0, 4.0, 0.0, 0.0, 1.0, 8.0, 0.5], [1, 3.0, 4.0, 7.0, 0.0, 1.0, 1.1, 0.5]]
        marks = []
        solid, deco, _trees = propsmesh.build(groups, rows, None, marks)
        objects = objectlist.TileList()
        make_obj._props_listed(objects, groups, rows, marks, solid, deco, {})
        self.assertEqual(["power pole", "street furniture"], objects.kinds)
        self.assertEqual(["pole", "polelamp"], objects.sorts)
        self.assertEqual([-1, 0], objects.parents)
        self.assertEqual({0: [3.0, 4.0, "pole"]}, objects.poles)


class OnTheTrackTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.ac = tmp.name
        self.root = os.path.join(self.ac, "content", "tracks", "t")
        os.makedirs(os.path.join(self.root, "data"))
        with open(os.path.join(self.root, mytracks.FILE), "w", encoding="utf-8") as f:
            json.dump({}, f)
        patch = mock.patch.object(mytracks, "ROOT", self.ac)
        patch.start()
        self.addCleanup(patch.stop)
        self.kn5 = os.path.join(self.root, "t.kn5")
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        kn5.write(self.kn5, [], [kn5.Material("m", "ksPerPixel", 0, 0, 0, [], [])], tree)
        self.objects = {"t_0_0": {"kinds": ["house", "house sign"], "at": [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]], "parents": [-1, 0],
                                  "faces": [[[0, 0, 5]], [[0, 5, 5]]]}}

    def test_a_listed_object_can_be_deleted(self):
        objectlist.write(self.kn5, self.objects)
        self.assertEqual({"t_0_0": (2, ["house", "house sign"])}, trackview.deletable(self.ac, "t")[1])
        now = trackedits.load(self.ac, "t")
        trackedits.save(self.ac, "t", {"base": now["base"], "revision": 0, "deleted": [{"id": "t_0_0#1", "position": [1, 0, 0]}], "id": "a"})
        self.assertEqual("house sign", trackedits.load(self.ac, "t")["deleted"][0]["kind"])
        with self.assertRaises(trackedits.Invalid):
            trackedits.save(self.ac, "t", {"base": now["base"], "revision": 1, "deleted": [{"id": "t_0_0#2", "position": [1, 0, 0]}], "id": "b"})

    def test_all_of_a_listed_sort_is_saved_as_a_rule_and_counts_as_older_on_another_build(self):
        objectlist.write(self.kn5, {"t_0_0": {**self.objects["t_0_0"], "sorts": ["house", "shop sign"]}})
        now = trackedits.load(self.ac, "t")
        trackedits.save(self.ac, "t", {"base": now["base"], "revision": 0, "deleted": [], "object_sorts": ["shop sign"], "id": "a"})
        self.assertEqual(["shop sign"], trackedits.load(self.ac, "t")["object_sorts"])
        self.assertEqual(1, trackedits.changes(self.ac, "t"))
        with self.assertRaises(trackedits.Invalid):           # (its kind is no sort here: the list names a finer one)
            trackedits.save(self.ac, "t", {"base": now["base"], "revision": 1, "deleted": [], "object_sorts": ["house sign"], "id": "b"})
        stat = os.stat(self.kn5)
        os.utime(self.kn5, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1000))
        self.assertEqual(([], 1), (trackedits.load(self.ac, "t")["object_sorts"], trackedits.load(self.ac, "t")["outdated"]))

    def test_a_list_of_another_file_counts_for_nothing_of_the_same_size_too(self):
        objectlist.write(self.kn5, self.objects)
        self.assertEqual(self.objects, trackview.objects(self.ac, "t"))
        stat = os.stat(self.kn5)
        os.utime(self.kn5, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1000))     # (NTFS counts in 100 ns)
        self.assertEqual({}, trackview.objects(self.ac, "t"))
        self.assertEqual({}, trackview.deletable(self.ac, "t")[1])

    def test_an_older_track_has_none_and_a_broken_or_older_list_is_none(self):
        self.assertEqual({}, trackview.objects(self.ac, "t"))
        path = os.path.join(self.root, objectlist.FILE)
        with open(path, "w", encoding="utf-8") as f:
            f.write("{ not json")
        self.assertEqual({}, trackview.objects(self.ac, "t"))
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"schema": objectlist.SCHEMA - 1, "kn5": objectlist.state_of(self.kn5), "objects": self.objects}, f)
        self.assertEqual({}, trackview.objects(self.ac, "t"))

    def test_a_list_of_the_wrong_shape_is_none(self):
        good = self.objects["t_0_0"]
        for bad in ([], {"t_0_0": 5}, {"t_0_0": {**good, "kinds": 7}}, {"t_0_0": {**good, "at": []}},
                    {"t_0_0": {**good, "faces": [[[0, 0]], [[0, 5, 5]]]}}, {"t_0_0": {**good, "faces": [[[0, 0, "5"]], [[0, 5, 5]]]}},
                    {"t_0_0": {**good, "faces": [5, 5]}}, {"t_0_0": {**good, "with": 5}}, {"t_0_0": {**good, "sorts": ["house"]}},
                    {"t_0_0": {**good, "sorts": ["house", 5]}}):
            objectlist.write(self.kn5, bad if bad else {"t_0_0": 5})
            self.assertEqual({}, trackview.objects(self.ac, "t"), bad)
            self.assertEqual({}, trackview.deletable(self.ac, "t")[1], bad)

    def test_no_objects_leaves_no_file(self):
        objectlist.write(self.kn5, self.objects)
        objectlist.write(self.kn5, {})
        self.assertFalse(os.path.exists(os.path.join(self.root, objectlist.FILE)))

    def test_the_index_hands_it_to_the_page(self):
        objectlist.write(self.kn5, self.objects)
        self.assertEqual(self.objects, trackview.index(self.ac, "t")["objects"])


if __name__ == "__main__":
    unittest.main()
