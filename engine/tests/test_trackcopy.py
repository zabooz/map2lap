"""Save in the Editor: exactly those triangles gone, everything else the same to the byte, the source untouched, so all can come back."""
import json
import os
import shutil
import sys
import tempfile
import threading
import unittest
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402  (sets the engine's path)
from app import mytracks, trackcopy, trackedits, tracksource, trackview, version  # noqa: E402
from track import kn5, objectlist  # noqa: E402

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)
START = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 5.0, 6.0, 7.0, 1.0)
ATLAS = {"sprites": ["a", "b", "c", "d"], "cols": 2, "rows": 2}


def boxes(name, material, numbers, faces_each=2, renderable=1, doubled=False):
    """A mesh of objects with their own vertices; an object's x is its number, and each triangle's uv the object's cell of the atlas
    (its number modulo 4)."""
    pos, uv = [], []
    for k in numbers:
        for f in range(faces_each * 3):
            pos.append((float(k), float(f), 0.0))
            uv.append((0.25 + 0.5 * (k % 2), -0.75 + 0.5 * (k % 4 // 2)))
    v = np.zeros(len(pos), kn5.VERTEX)
    v["pos"], v["uv"] = pos, uv
    i = np.arange(len(pos))
    if doubled:
        i = np.r_[i, i.reshape(-1, 3)[:, ::-1].ravel()]
    return kn5.Node(2, name, 1, cast_shadows=1, visible=1, transparent=0, vertices=v, indices=i.astype("<u2"), material=material,
                    layer=0, lod_in=0.0, lod_out=1000.0, bs_center=(1.0, 2.0, 3.0), bs_radius=4.0, renderable=renderable)


def material(name):
    return kn5.Material(name, "ksPerPixel", 0, 0, 0, [("ksAmbient", 0.5, (0, 0), (0, 0, 0), (0, 0, 0, 0))], [("txDiffuse", 0, "t.png")])


class Base(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.ac, self.name = tmp.name, "t"
        self.root = os.path.join(self.ac, "content", "tracks", "t")
        os.makedirs(os.path.join(self.root, "data"))
        os.makedirs(os.path.join(self.root, "ui"))
        os.makedirs(os.path.join(self.root, "ai"))
        self.kn5 = os.path.join(self.root, "t.kn5")
        mytracks.save(self.root, {"title": "Tee", "points": [[1, 2], [3, 4]], "width": 100, "version": "x", "track_version": "x"})
        with open(os.path.join(self.root, "ui", "ui_track.json"), "w", encoding="utf-8") as f:
            json.dump({"name": "Tee"}, f)
        with open(os.path.join(self.root, "map.png"), "wb") as f:
            f.write(b"map")
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        tree.children = [boxes("1ROAD_ground_0_0", 0, [90]),                          # 0
                         boxes("nocol_trees_0_0", 1, [0, 0, 1, 2], faces_each=8),     # 1: four billboards of 8 triangles
                         boxes("1WALL_cars_0_0", 0, [10, 11, 12], doubled=True),      # 2: 12 triangles, doubled
                         boxes("1WALL_bldcol_0_0", 0, [20, 20], renderable=0),        # 3: a house's collision, not drawn
                         boxes("nocol_bld_0_0", 0, [20, 21]),                         # 4: a house, and its sign
                         boxes("nocol_only_0_0", 0, [30]),                            # 5: a door, its whole mesh
                         kn5.Node(1, "AC_START_0", 1, matrix=START)]
        kn5.write(self.kn5, [("t.png", b"png")], [material("m"), material("trees")], tree)
        self.objects = {"t_0_0": {
            "kinds": ["car", "car", "car", "house", "house sign", "door"], "at": [[0.0, 0.0, 0.0]] * 6, "parents": [-1, -1, -1, -1, 3, 3],
            "faces": [[[2, 0, 2], [2, 6, 2]], [[2, 2, 2], [2, 8, 2]], [[2, 4, 2], [2, 10, 2]],
                      [[3, 0, 4], [4, 0, 2]], [[4, 2, 2]], [[5, 0, 2]]],
            "with": {}}}
        objectlist.write(self.kn5, self.objects)
        for patch in (mock.patch.object(trackview, "_atlas", return_value=ATLAS),):
            patch.start()
            self.addCleanup(patch.stop)
        mock.patch.object(mytracks, "ROOT", self.ac).start()
        self.addCleanup(mock.patch.stopall)

    def edits(self, deleted=(), sorts=(), object_sorts=()):
        now = trackedits.load(self.ac, "t")
        trackedits.save(self.ac, "t", {"base": now["base"], "revision": now["revision"], "id": "x", "sorts": list(sorts),
                                       "object_sorts": list(object_sorts),
                                       "deleted": [{"id": d, "position": [0, 0, 0]} for d in deleted]})

    def poles(self):
        """The three cars' boxes as two poles of one sort, A (x 10) and B (x 11), and the span between them (x 12) in the next tile:
        it goes with either."""
        self.objects = {"t_0_0": {**self.objects["t_0_0"], "kinds": ["power pole", "power pole", "car", "house", "house sign", "door"],
                                  "sorts": ["pole", "pole", "car", "house", "house sign", "door"],
                                  "faces": [[[2, 0, 2], [2, 6, 2]], [[2, 2, 2], [2, 8, 2]], [], *self.objects["t_0_0"]["faces"][3:]],
                                  "with": {"0": ["t_1_0#0"], "1": ["t_1_0#0"]}},
                        "t_1_0": {"kinds": ["power line"], "at": [[0.0, 0.0, 0.0]], "parents": [-1], "faces": [[[2, 4, 2], [2, 10, 2]]],
                                  "with": {}}}
        objectlist.write(self.kn5, self.objects)

    def new(self, name="t_mod"):
        return kn5.read(os.path.join(self.ac, "content", "tracks", name, name + ".kn5"))

    @staticmethod
    def xs(node):
        """The object numbers (x) of a mesh's corners, in order. Pure."""
        return node.vertices["pos"][node.indices, 0].tolist()

    def meshes(self, root):
        return {n.name: n for n in kn5.walk_meshes(root)}

    def copy(self, to="t_mod"):
        """Save as a copy: the track stays, the copy is new() to look at."""
        return trackcopy.save(self.ac, "t", copy_to=to)

    def own(self, name="t"):
        return os.path.join(self.ac, "content", "tracks", name, name + ".kn5")

    def cars(self, name="t"):
        return set(self.xs(self.meshes(kn5.read(self.own(name))["root"])["1WALL_cars_0_0"]))


class FilterTest(Base):
    def test_a_car_goes_front_and_back_and_nothing_else(self):
        self.edits(["t_0_0#1"])
        self.copy()
        meshes = self.meshes(self.new()["root"])
        xs = self.xs(meshes["1WALL_cars_0_0"])
        self.assertEqual(8 * 3, len(xs))
        self.assertEqual({10.0, 12.0}, set(xs))
        self.assertEqual(self.xs(meshes["1ROAD_ground_0_0"]), [90.0] * 6)

    def test_a_house_takes_its_sign_door_and_collision_along(self):
        self.edits(["t_0_0#3"])
        self.copy()
        meshes = self.meshes(self.new()["root"])
        self.assertNotIn("1WALL_bldcol_0_0", meshes)
        self.assertNotIn("nocol_bld_0_0", meshes)
        self.assertNotIn("nocol_only_0_0", meshes)
        self.assertIn("1WALL_cars_0_0", meshes)

    def test_a_sign_alone_leaves_its_house(self):
        self.edits(["t_0_0#4"])
        self.copy()
        meshes = self.meshes(self.new()["root"])
        self.assertEqual({20.0}, set(self.xs(meshes["nocol_bld_0_0"])))
        self.assertIn("1WALL_bldcol_0_0", meshes)

    def test_a_billboard_goes_by_its_number(self):
        self.edits(["nocol_trees_0_0#2"])
        self.copy()
        xs = self.xs(self.meshes(self.new()["root"])["nocol_trees_0_0"])
        self.assertEqual(3 * 8 * 3, len(xs))
        self.assertEqual([0.0] * 48 + [2.0] * 24, xs)

    def test_a_billboard_across_two_parts(self):
        whole = boxes("nocol_trees_0_0", 1, [0, 1, 2], faces_each=8)     # (24 triangles)
        a, b = boxes("nocol_trees_0_0", 1, [0]), boxes("nocol_trees_0_0_1", 1, [0])
        a.vertices, a.indices = whole.vertices[:36], np.arange(36).astype("<u2")     # (12 triangles: the first billboard and half the second)
        b.vertices, b.indices = whole.vertices[36:], np.arange(36).astype("<u2")     # (the other half, and the third)
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        tree.children = [a, b]
        kn5.write(self.kn5, [("t.png", b"png")], [material("m"), material("trees")], tree)
        objectlist.write(self.kn5, {})
        self.edits(["nocol_trees_0_0#1"])
        self.copy()
        meshes = self.meshes(self.new()["root"])
        self.assertEqual({0.0}, set(self.xs(meshes["nocol_trees_0_0"])))
        self.assertEqual({2.0}, set(self.xs(meshes["nocol_trees_0_0_1"])))

    def test_a_whole_sort_goes(self):
        self.edits(sorts=["a"])         # (the cell of objects 0: the billboards 0 and 1)
        self.copy()
        xs = self.xs(self.meshes(self.new()["root"])["nocol_trees_0_0"])
        self.assertEqual({1.0, 2.0}, set(xs))

    def test_all_cars_go_fronts_and_backs(self):
        self.edits(object_sorts=["car"])
        made = self.copy()
        meshes = self.meshes(self.new()["root"])
        self.assertNotIn("1WALL_cars_0_0", meshes)
        self.assertEqual(3, made["left_out"])
        old = self.meshes(kn5.read(self.kn5)["root"])
        for name in ("1ROAD_ground_0_0", "nocol_trees_0_0", "1WALL_bldcol_0_0", "nocol_bld_0_0", "nocol_only_0_0"):
            self.assertEqual(old[name].indices.tobytes(), meshes[name].indices.tobytes(), name)
        self.assertEqual(["car"], mytracks.load(os.path.dirname(self.own("t_mod")))["edits"]["object_sorts"])

    def test_on_a_track_left_out_of_before_all_cars_count_only_those_still_there(self):
        self.objects["t_0_0"]["faces"][0] = []          # (left out of it before: its number stays, without triangles)
        objectlist.write(self.kn5, self.objects)
        self.edits(object_sorts=["car"])
        self.assertEqual(2, self.copy()["left_out"])

    def test_all_doors_leave_their_houses_standing(self):
        self.edits(object_sorts=["door"])
        self.copy()
        meshes = self.meshes(self.new()["root"])
        self.assertNotIn("nocol_only_0_0", meshes)
        self.assertEqual({20.0, 21.0}, set(self.xs(meshes["nocol_bld_0_0"])))
        self.assertIn("1WALL_bldcol_0_0", meshes)       # (its collision)

    def test_all_doors_and_a_house_back_the_doors_stay_gone(self):
        self.edits(["t_0_0#3"], object_sorts=["door"])
        self.edits(object_sorts=["door"])               # (the house's deletion taken back)
        self.copy()
        meshes = self.meshes(self.new()["root"])
        self.assertNotIn("nocol_only_0_0", meshes)
        self.assertIn("1WALL_bldcol_0_0", meshes)

    def test_a_sort_takes_along_what_its_objects_do_across_a_tile(self):
        self.poles()
        self.edits(object_sorts=["pole"])
        self.copy()
        self.assertNotIn("1WALL_cars_0_0", self.meshes(self.new()["root"]))     # (both poles, and the span of the next tile)

    def test_a_pole_alone_and_its_sort_taken_back_the_other_pole_comes_back_the_shared_span_stays_gone(self):
        self.poles()
        self.edits(["t_0_0#0"], object_sorts=["pole"])
        self.edits(["t_0_0#0"])                         # (the sort taken back)
        self.copy()
        self.assertEqual({11.0}, set(self.xs(self.meshes(self.new()["root"])["1WALL_cars_0_0"])))
        objects = trackview.list_of(self.own("t_mod"))
        self.assertEqual([[], [[2, 0, 2], [2, 2, 2]]], [objects["t_0_0"]["faces"][0], objects["t_0_0"]["faces"][1]])
        self.assertEqual([[]], objects["t_1_0"]["faces"])
        self.assertEqual("pole", objects["t_0_0"]["sorts"][0])      # (the list keeps its sorts)

    def test_a_house_can_t_go_all_at_once_nor_a_sort_not_on_the_track(self):
        for bad in (["house"], ["bench"], ["car", "car"]):
            with self.assertRaises(trackedits.Invalid, msg=bad):
                self.edits(object_sorts=bad)

    def test_what_stays_is_the_same_to_the_byte(self):
        self.edits(["t_0_0#1"])
        self.copy()
        old, new = kn5.read(self.kn5), self.new()
        self.assertEqual(old["textures"], new["textures"])            # (textures)
        self.assertEqual([m.name for m in old["materials"]], [m.name for m in new["materials"]])
        olds, news = self.meshes(old["root"]), self.meshes(new["root"])
        for name in ("1ROAD_ground_0_0", "nocol_trees_0_0", "1WALL_bldcol_0_0", "nocol_bld_0_0", "nocol_only_0_0"):
            self.assertEqual(olds[name].vertices.tobytes(), news[name].vertices.tobytes())
            self.assertEqual(olds[name].indices.tobytes(), news[name].indices.tobytes())
            self.assertEqual(olds[name].renderable, news[name].renderable)
            self.assertEqual(olds[name].lod_out, news[name].lod_out)
        self.assertEqual([c.name for c in old["root"].children if c.cls == 1], [c.name for c in new["root"].children if c.cls == 1])
        self.assertEqual(START, [c.matrix for c in new["root"].children if c.name == "AC_START_0"][0])

    def test_a_changed_mesh_keeps_what_is_not_its_geometry(self):
        self.edits(["t_0_0#1"])
        self.copy()
        old, new = self.meshes(kn5.read(self.kn5)["root"])["1WALL_cars_0_0"], self.meshes(self.new()["root"])["1WALL_cars_0_0"]
        for field in ("material", "layer", "lod_in", "lod_out", "bs_center", "bs_radius", "renderable", "cast_shadows", "visible", "transparent"):
            self.assertEqual(getattr(old, field), getattr(new, field), field)
        self.assertLess(len(new.vertices), len(old.vertices))

    def test_the_new_list_fits_the_new_file(self):
        self.edits(["t_0_0#0", "t_0_0#5"])      # (a piece from a mesh's start, and a whole mesh, so later meshes move up)
        self.copy()
        path = self.own("t_mod")
        objects = trackview.list_of(path)["t_0_0"]
        self.assertEqual([], objects["faces"][0])
        self.assertEqual([], objects["faces"][5])
        scan = kn5.scan(path)
        with open(path, "rb") as f:
            def corners(pieces):
                xs = []
                for mesh, first, count in pieces:
                    m = scan["meshes"][mesh]
                    f.seek(m["offset"])
                    v = np.frombuffer(f.read(m["vertices"] * kn5.VERTEX.itemsize), dtype=kn5.VERTEX)
                    f.read(4)
                    i = np.frombuffer(f.read(m["indices"] * 2), dtype=np.uint16)
                    xs += v["pos"][i[first * 3:(first + count) * 3], 0].tolist()
                return set(xs)
            self.assertEqual({11.0}, corners(objects["faces"][1]))
            self.assertEqual({12.0}, corners(objects["faces"][2]))
            self.assertEqual({20.0}, corners(objects["faces"][3]))
            self.assertEqual({21.0}, corners(objects["faces"][4]))


class SaveTest(Base):
    def test_overwritten_in_place_the_editor_shows_the_unchanged_source_with_every_object(self):
        self.edits(["t_0_0#1"])
        made = trackcopy.save(self.ac, "t")
        self.assertEqual(("t", "Tee"), (made["name"], made["title"]))
        self.assertEqual(["t"], os.listdir(os.path.join(self.ac, "content", "tracks")))
        self.assertEqual({10.0, 12.0}, self.cars())                     # (AC drives it without the car)
        path, source = trackview.served(self.ac, "t")
        self.assertEqual(tracksource.kn5_of(source), path)
        self.assertEqual({10.0, 11.0, 12.0}, set(self.xs(self.meshes(kn5.read(path)["root"])["1WALL_cars_0_0"])))
        self.assertEqual([[2, 2, 2], [2, 8, 2]], trackview.objects(self.ac, "t")["t_0_0"]["faces"][1])
        now = trackedits.load(self.ac, "t")
        self.assertEqual(["t_0_0#1"], [d["id"] for d in now["deleted"]])
        self.assertEqual((["t_0_0#1"], 0), (now["saved"]["deleted"], now["outdated"]))

    def test_undone_after_a_save_and_saved_again_the_object_is_back(self):
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        self.edits([])
        trackcopy.save(self.ac, "t")
        self.assertEqual({10.0, 11.0, 12.0}, self.cars())
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")
        self.assertEqual({11.0, 12.0}, self.cars())
        self.assertEqual(1, len(os.listdir(tracksource.root())))           # (one source over all saves)

    def test_a_new_name_on_overwrite_keeps_the_folder(self):
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t", title="Neu")
        info = mytracks.load(os.path.join(self.ac, "content", "tracks", "t"))
        with open(os.path.join(self.ac, "content", "tracks", "t", "ui", "ui_track.json"), encoding="utf-8") as f:
            self.assertEqual(("Neu", "Neu"), (info["title"], json.load(f)["name"]))
        self.assertEqual([[1, 2], [3, 4]], info["points"])
        self.assertEqual(["t"], os.listdir(os.path.join(self.ac, "content", "tracks")))

    def test_a_copy_takes_the_changes_along_its_track_goes_back_to_its_own(self):
        self.edits(["t_0_0#0"])
        before = objectlist.state_of(self.kn5)
        made = trackcopy.save(self.ac, "t", copy_to="t_2", title="Tee 2")
        self.assertEqual(("t_2", "Tee 2"), (made["name"], made["title"]))
        self.assertEqual(before, objectlist.state_of(self.kn5))
        self.assertEqual([], trackedits.load(self.ac, "t")["deleted"])          # (never saved: nothing)
        self.assertEqual(["t_0_0#0"], [d["id"] for d in trackedits.load(self.ac, "t_2")["deleted"]])    # (its recipe)
        self.assertEqual({11.0, 12.0}, self.cars("t_2"))
        self.edits(["t_0_0#2"])                     # (the track itself, saved on its own: the same source)
        trackcopy.save(self.ac, "t")
        self.assertEqual({10.0, 11.0}, self.cars())
        now = trackedits.load(self.ac, "t_2")
        trackedits.save(self.ac, "t_2", {"base": now["base"], "revision": now["revision"], "id": "y", "deleted": []})
        trackcopy.save(self.ac, "t_2")              # (the copy brings its car back)
        self.assertEqual({10.0, 11.0, 12.0}, self.cars("t_2"))
        self.assertEqual(1, len(os.listdir(tracksource.root())))

    def test_the_draft_lost_is_the_recipe_a_saved_empty_one_stays_empty(self):
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        os.remove(trackedits.path_of("t"))
        self.assertEqual(["t_0_0#1"], [d["id"] for d in trackedits.load(self.ac, "t")["deleted"]])
        self.assertEqual(0, trackedits.changes(self.ac, "t"))
        self.edits([])
        self.assertEqual([], trackedits.load(self.ac, "t")["deleted"])
        self.assertEqual(1, trackedits.changes(self.ac, "t"))

    def test_built_again_the_recipe_counts_for_nothing_and_its_ids_are_not_applied(self):
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        stat = os.stat(self.kn5)                    # (a build from the map writes the kn5: whole, or cut off)
        os.utime(self.kn5, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1000))
        self.assertEqual((self.kn5, None), trackview.served(self.ac, "t"))
        now = trackedits.load(self.ac, "t")
        self.assertEqual(([], 1, None), (now["deleted"], now["outdated"], now["saved"]))
        os.remove(trackedits.path_of("t"))          # (and no draft: none from the recipe either)
        self.assertEqual([], trackedits.load(self.ac, "t")["deleted"])

    def test_the_source_lost_the_track_s_own_kn5_is_its_source_from_now_on(self):
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        shutil.rmtree(tracksource.root())
        self.assertEqual((self.kn5, None), trackview.served(self.ac, "t"))
        self.assertEqual(1, trackedits.load(self.ac, "t")["outdated"])      # (its ids were of the source)

    def test_the_route_comes_from_the_track_s_own_folder(self):
        with open(os.path.join(self.root, "data", "map2lap_route.txt"), "w", encoding="utf-8") as f:
            f.write("anchor 47.0 14.0\n1.00 2.00\n3.00 4.00\n")
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        index = trackview.index(self.ac, "t")
        self.assertEqual(([47.0, 14.0], [[1.0, 2.0], [3.0, 4.0]]), (index["anchor"], index["route"]))
        self.assertEqual(6, len(index["objects"]["t_0_0"]["kinds"]))

    def test_listing_says_edited_without_the_recipe_and_hides_one_not_whole(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")
        os.makedirs(os.path.join(self.ac, "content", "tracks", ".map2lap_new_x", "data"))
        mytracks.save(os.path.join(self.ac, "content", "tracks", ".map2lap_new_x"), {"title": "half", "points": [[1, 2], [3, 4]]})
        names = {t["name"]: t for t in mytracks.listing(self.ac)}
        self.assertEqual({"t"}, set(names))
        self.assertTrue(names["t"]["edited"])
        self.assertNotIn("edits", names["t"])

    def test_a_build_asked_for_before_a_save_ended_doesnt_replace_the_track(self):
        import server
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")       # (between the page's request and the start of its build)
        with (mock.patch.object(server.settings, "ac_path", return_value=self.ac), mock.patch.object(server.settings, "is_ac", return_value=True),
              mock.patch.dict(server.job, state="idle"), mock.patch.object(server, "run_build") as run):
            code, answer = server.start_build("t", "Tee", [(1, 2), (3, 4)], 100, None)
            self.assertEqual((409, "idle"), (code, server.job["state"]))
            self.assertIn("saved in the Editor", answer["error"])
            run.assert_not_called()

    # (1 m up on all but its edge, from x -10 to 110 and z -10 to 10: over this track's ground and over the spheres its meshes say they have)
    UP = {"id": "up", "x": -10, "z": -10, "nx": 61, "nz": 11, "mm": [1000 if 0 < i % 61 < 60 and 61 <= i < 610 else 0 for i in range(671)]}

    def lift(self, *ops):
        now = trackedits.load(self.ac, "t")
        trackedits.save(self.ac, "t", {"base": now["base"], "revision": now["revision"], "id": f"h{now['revision']}", "deleted": now["deleted"],
                                       "sorts": now["sorts"], "object_sorts": now["object_sorts"], "heights": list(ops)})

    def ground(self, name="t"):
        return self.meshes(kn5.read(self.own(name))["root"])["1ROAD_ground_0_0"].vertices["pos"][:, 1]

    def test_a_height_change_is_saved_with_what_was_deleted_and_a_second_save_adds_nothing(self):
        before = self.ground()
        self.lift(self.UP)
        self.edits(["t_0_0#0"])                 # (the page's list of deletions alone leaves it in)
        self.assertEqual(["up"], [h["id"] for h in trackedits.load(self.ac, "t")["heights"]])
        trackcopy.save(self.ac, "t")
        np.testing.assert_allclose(self.ground(), before + 1.0, atol=1e-4)
        self.assertEqual({11.0, 12.0}, self.cars())
        self.assertEqual(0, trackedits.changes(self.ac, "t"))
        self.assertEqual(["up"], trackedits.load(self.ac, "t")["saved"]["heights"])
        trackcopy.save(self.ac, "t")
        np.testing.assert_allclose(self.ground(), before + 1.0, atol=1e-4)

    def test_undone_and_saved_a_height_change_is_gone_to_the_byte(self):
        before = self.ground()
        self.lift(self.UP)
        trackcopy.save(self.ac, "t")
        self.lift()
        self.assertEqual(1, trackedits.changes(self.ac, "t"))
        trackcopy.save(self.ac, "t")
        np.testing.assert_array_equal(self.ground(), before)

    def test_a_copy_takes_its_height_changes_along(self):
        before = self.ground()
        self.lift(self.UP)
        trackcopy.save(self.ac, "t", copy_to="t_up")
        np.testing.assert_allclose(self.ground("t_up"), before + 1.0, atol=1e-4)
        np.testing.assert_array_equal(self.ground(), before)
        self.assertEqual(["up"], [h["id"] for h in trackedits.load(self.ac, "t_up")["heights"]])

    def test_a_change_on_a_bridge_leaves_the_track_and_the_disk_as_they_were(self):
        self.lift(self.UP)
        state = objectlist.state_of(self.kn5)
        with mock.patch.object(trackcopy.trackheights, "moved", side_effect=trackcopy.trackheights.InTheWay("A bridge")):
            with self.assertRaisesRegex(trackcopy.Refused, "A bridge"):
                trackcopy.save(self.ac, "t")
        self.assertEqual(state, objectlist.state_of(self.kn5))
        self.assertEqual(["t"], os.listdir(os.path.dirname(self.root)))

    def served_ground(self):
        now = trackedits.load(self.ac, "t")
        i = next(i for i, m in enumerate(kn5.scan(self.kn5)["meshes"]) if m["name"] == "1ROAD_ground_0_0")
        data = trackview.mesh_bytes(self.ac, "t", i, now["base"], trackedits.moved_now(self.ac, "t", now["base"]))
        count = kn5.scan(self.kn5)["meshes"][i]["vertices"]
        return np.frombuffer(data[:count * kn5.VERTEX.itemsize], dtype=kn5.VERTEX)["pos"][:, 1]

    def test_the_view_gets_what_the_draft_says_and_save_writes_the_same(self):
        before = self.served_ground().copy()
        self.lift(self.UP)
        np.testing.assert_allclose(self.served_ground(), before + 1.0, atol=1e-4)
        self.lift()
        np.testing.assert_array_equal(self.served_ground(), before)
        self.lift(self.UP)
        trackcopy.save(self.ac, "t")
        np.testing.assert_array_equal(self.served_ground(), self.ground())
        self.lift()
        np.testing.assert_array_equal(self.served_ground(), before)       # (the source's, with the draft's empty list)

    def test_the_view_keeps_what_moved_for_all_its_meshes_until_the_draft_changes(self):
        self.lift(self.UP)
        now = trackedits.load(self.ac, "t")
        first = trackedits.moved_now(self.ac, "t", now["base"])
        self.assertIs(first, trackedits.moved_now(self.ac, "t", now["base"]))
        self.lift({**self.UP, "id": "other"})
        self.assertIsNot(first, trackedits.moved_now(self.ac, "t", now["base"]))

    def told(self, *ops):
        now = trackedits.load(self.ac, "t")
        return trackedits.save_telling(self.ac, "t", {"base": now["base"], "revision": now["revision"], "id": f"h{now['revision']}", "deleted": now["deleted"],
                                                      "sorts": now["sorts"], "object_sorts": now["object_sorts"], "heights": list(ops)})

    def test_saving_a_change_names_the_meshes_it_moves_and_only_for_what_changed(self):
        ground = next(i for i, m in enumerate(kn5.scan(self.kn5)["meshes"]) if m["name"] == "1ROAD_ground_0_0")
        told = self.told(self.UP)
        self.assertIn(ground, told["meshes"])
        self.assertEqual([], self.told(self.UP)["meshes"])      # (the same again: nothing to show)
        self.assertIn(ground, self.told()["meshes"])            # (taken back)

    def test_a_change_made_by_the_brush_isnt_reckoned_again_on_saving(self):
        trackedits.remember_meshes("known", [7])
        with mock.patch.object(trackedits.trackheights, "moved", side_effect=AssertionError("reckoned again")):
            self.assertEqual([7], self.told({**self.UP, "id": "known"})["meshes"])

    def test_a_change_names_the_road_lines_it_reaches_though_it_moves_them_not_by_itself(self):
        """Lowering can take back what another's bulge lifted: the line looks different with no move of its own."""
        with mock.patch.object(trackedits.trackheights, "lines_reached", return_value=[3]):
            trackedits.remember_meshes("lower", [])
            self.assertEqual([3], self.told({**self.UP, "id": "lower"})["meshes"])

    def preview(self, op):
        """What trackedits.preview answers: {mesh number: {vertex: [y, normal x, y, z]}}."""
        data = trackedits.preview(self.ac, "t", trackedits.load(self.ac, "t")["base"], op)
        words = np.frombuffer(data, "<u4")
        out, at = {}, 1
        for _ in range(words[0]):
            i, n = int(words[at]), int(words[at + 1])
            values = np.frombuffer(data, "<f4", n * 4, (at + 2 + n) * 4).reshape(n, 4)
            out[i] = {int(v): row for v, row in zip(words[at + 2:at + 2 + n], values)}
            at += 2 + n + n * 4
        return out

    def test_a_stroke_under_way_names_only_what_it_changes_and_keeps_nothing(self):
        ground = next(i for i, m in enumerate(kn5.scan(self.kn5)["meshes"]) if m["name"] == "1ROAD_ground_0_0")
        before = self.served_ground().copy()
        out = self.preview(self.UP)
        self.assertEqual(sorted(out[ground]), list(range(len(before))))
        np.testing.assert_allclose([out[ground][v][0] for v in sorted(out[ground])], before + 1.0, atol=1e-4)
        np.testing.assert_array_equal(self.served_ground(), before)
        self.assertEqual([], trackedits.load(self.ac, "t")["heights"])

    def test_a_stroke_under_way_goes_on_top_of_what_the_draft_holds_and_names_what_it_adds(self):
        ground = next(i for i, m in enumerate(kn5.scan(self.kn5)["meshes"]) if m["name"] == "1ROAD_ground_0_0")
        before = self.served_ground().copy()
        self.lift(self.UP)
        out = self.preview({**self.UP, "id": "more"})
        np.testing.assert_allclose([out[ground][v][0] for v in sorted(out[ground])], before + 2.0, atol=1e-4)
        self.assertEqual({}, self.preview({"id": "nothing", "x": 80, "z": -10, "nx": 3, "nz": 3, "mm": [0] * 9}))

    def test_a_stroke_under_way_that_takes_all_of_a_change_back_shows_it_gone(self):
        ground = next(i for i, m in enumerate(kn5.scan(self.kn5)["meshes"]) if m["name"] == "1ROAD_ground_0_0")
        before = self.served_ground().copy()
        self.lift(self.UP)
        out = self.preview({**self.UP, "id": "back", "mm": [-v for v in self.UP["mm"]]})
        np.testing.assert_allclose([out[ground][v][0] for v in sorted(out[ground])], before, atol=1e-4)

    def test_the_draft_and_what_it_moves_are_read_as_one(self):
        self.lift(self.UP)
        base = trackedits.load(self.ac, "t")["base"]
        heights, moved = trackedits._heights_and_moved(self.ac, "t", base)
        self.assertEqual(["up"], [h["id"] for h in heights])
        self.assertIsNotNone(moved)
        self.lift()
        heights, moved = trackedits._heights_and_moved(self.ac, "t", base)
        self.assertEqual(([], None), (heights, moved))

    def test_a_stroke_under_way_that_cant_be_applied_says_so(self):
        with mock.patch.object(trackedits.trackheights, "moved", side_effect=trackedits.trackheights.InTheWay("A bridge")):
            with self.assertRaisesRegex(trackedits.trackheights.InTheWay, "A bridge"):
                self.preview(self.UP)

    def test_a_change_that_cant_be_applied_leaves_the_view_as_the_file(self):
        self.lift(self.UP)
        before = trackedits.load(self.ac, "t")["base"]
        with mock.patch.object(trackedits.trackheights, "moved", side_effect=trackedits.trackheights.InTheWay("A bridge")):
            self.lift({**self.UP, "id": "other"})
            self.assertIsNone(trackedits.moved_now(self.ac, "t", before))

    def test_a_copy_refused_for_its_heights_leaves_no_source_behind(self):
        self.lift(self.UP)
        with mock.patch.object(trackcopy.trackheights, "moved", side_effect=trackcopy.trackheights.InTheWay("A bridge")):
            with self.assertRaises(trackcopy.Refused):
                trackcopy.save(self.ac, "t", copy_to="t_up")
        self.assertFalse(os.path.exists(tracksource.root()) and os.listdir(tracksource.root()))
        self.assertFalse(os.path.exists(os.path.dirname(self.own("t_up"))))

    def test_a_raster_changed_under_its_id_counts_as_a_change(self):
        self.lift(self.UP)
        trackcopy.save(self.ac, "t")
        self.assertEqual(0, trackedits.changes(self.ac, "t"))
        self.lift({**self.UP, "mm": [2 * v for v in self.UP["mm"]]})
        self.assertGreater(trackedits.changes(self.ac, "t"), 0)

    def test_a_draft_on_disk_with_a_height_change_twice_is_no_list_to_act_on(self):
        self.lift(self.UP)
        path = trackedits.path_of("t")
        with open(path, encoding="utf-8") as f:
            draft = json.load(f)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({**draft, "heights": [self.UP, self.UP]}, f)
        now = trackedits.load(self.ac, "t")
        self.assertEqual(([], 1), (now["heights"], now["outdated"]))

    def test_a_recipe_edited_by_hand_is_no_list_to_act_on(self):
        self.lift(self.UP)
        trackcopy.save(self.ac, "t")
        os.remove(trackedits.path_of("t")) if os.path.exists(trackedits.path_of("t")) else None
        info = mytracks.load(self.root)
        state = objectlist.state_of(self.kn5)
        mytracks.save(self.root, {**info, "edits": {**info["edits"], "heights": [{"id": "bad"}]}})
        self.assertEqual(state, objectlist.state_of(self.kn5))
        now = trackedits.load(self.ac, "t")
        self.assertEqual(([], 1, []), (now["heights"], now["outdated"], now["saved"]["heights"]))

    def test_a_draft_refuses_a_height_change_it_can_not_hold(self):
        now = trackedits.load(self.ac, "t")
        for wrong in ([{"id": "x"}], "no list", [{"id": "up", "x": 80, "z": 0, "nx": 3, "nz": 3, "mm": [1] * 9}]):
            with self.assertRaises(trackedits.Invalid):
                trackedits.save(self.ac, "t", {"base": now["base"], "revision": now["revision"], "id": "x", "deleted": [], "heights": wrong})
        good = {"id": "up", "x": 80, "z": 0, "nx": 3, "nz": 3, "mm": [0, 0, 0, 0, 1, 0, 0, 0, 0]}
        with self.assertRaisesRegex(trackedits.Invalid, "twice"):
            trackedits.save(self.ac, "t", {"base": now["base"], "revision": now["revision"], "id": "x", "deleted": [], "heights": [good, good]})

    def test_the_list_goes_by_the_last_save_of_an_edited_track(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t", copy_to="copy")
        newer = os.path.join(self.ac, "content", "tracks", "newer")
        os.makedirs(os.path.join(newer, "data"))
        mytracks.save(newer, {"title": "Newer", "points": [[1, 2], [3, 4]], "built": 2000})
        info = mytracks.load(os.path.dirname(self.own("copy")))
        mytracks.save(os.path.dirname(self.own("copy")), {**info, "built": 1000, "edits": {**info["edits"], "saved": 3000}})
        mytracks.save(self.root, {**mytracks.load(self.root), "built": 4000})
        listed = mytracks.listing(self.ac)
        self.assertEqual(["t", "copy", "newer"], [t["name"] for t in listed])
        self.assertEqual([None, 3000, None], [t["saved"] for t in listed])

    def test_the_generator_itself_refuses_to_replace_a_saved_track(self):
        self.edits(["t_0_0#0"])
        with (mock.patch.object(generator.make_track_folder, "AC", self.ac), mock.patch.object(generator.plancache, "one_run"),
              mock.patch.object(generator, "_build") as chain):
            chain.side_effect = lambda *a: "built"
            self.assertEqual("built", generator.build([(1, 2), (3, 4)], 100, "t"))      # (not saved yet: a build like any)
            chain.reset_mock()
            trackcopy.save(self.ac, "t")
            for into_ac in (lambda: generator.build([(1, 2), (3, 4)], 100, "T"), lambda: generator.finish_obj("t")):
                with self.assertRaisesRegex(RuntimeError, "saved in the Editor as “Tee”"):
                    into_ac()
            chain.assert_not_called()
            self.assertEqual("built", generator.build([(1, 2), (3, 4)], 100, "t", upto="obj"))      # (nothing goes into AC)
            self.assertEqual("built", generator.build([(1, 2), (3, 4)], 100, "other"))

    def test_an_edited_track_is_never_old_and_no_current_copy_of_a_build(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")
        old = os.path.join(self.ac, "content", "tracks", "old")
        os.makedirs(os.path.join(old, "data"))
        mytracks.save(old, {"title": "Old", "points": [[1, 2], [3, 4]], "width": 100, "version": "0.1", "track_version": "0.1"})
        built_long_ago = {t["name"]: t for t in mytracks.listing(self.ac)}["t"]
        self.assertEqual((False, None), (built_long_ago["outdated"], built_long_ago["current_copy"]))
        mytracks.save(self.root, {**mytracks.load(self.root), "track_version": version.TRACK_VERSION})
        beside = {t["name"]: t for t in mytracks.listing(self.ac)}["old"]
        self.assertEqual((True, None), (beside["outdated"], beside["current_copy"]))

    def test_an_overwrite_with_the_file_in_use_leaves_the_track_whole(self):
        self.edits(["t_0_0#0"])
        before = objectlist.state_of(self.kn5)
        real = os.rename

        def refuse(a, b):
            if os.path.basename(a) == "t":
                raise PermissionError("in use")
            return real(a, b)
        with mock.patch.object(trackcopy.os, "rename", side_effect=refuse):
            with self.assertRaises(trackcopy.Refused) as refused:
                trackcopy.save(self.ac, "t")
        self.assertIn("close Assetto Corsa", str(refused.exception))
        self.assertEqual(before, objectlist.state_of(self.kn5))
        self.assertEqual(["t"], os.listdir(os.path.join(self.ac, "content", "tracks")))
        self.assertEqual(1, len(trackedits.load(self.ac, "t")["deleted"]))      # (the draft stays for another try)
        self.assertEqual({"t_0_0#0"}, {d["id"] for d in trackedits.load(self.ac, "t")["deleted"]})
        trackcopy.save(self.ac, "t")                                            # (AC closed: it goes through)
        self.assertEqual({11.0, 12.0}, self.cars())

    def test_saved_from_the_revision_the_page_saved(self):
        self.edits(["t_0_0#0"])
        revision = trackedits.load(self.ac, "t")["revision"]
        with self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, "t", revision=revision - 1)
        self.assertEqual({10.0, 11.0, 12.0}, self.cars())
        trackcopy.save(self.ac, "t", revision=revision)
        self.assertEqual({11.0, 12.0}, self.cars())

    def test_a_kn5_changing_meanwhile_leaves_the_track_as_it_was(self):
        self.edits(["t_0_0#0"])
        real = kn5.without_faces

        def and_a_build_writes(*args):
            moved = real(*args)
            stat = os.stat(args[0])
            os.utime(args[0], ns=(stat.st_atime_ns, stat.st_mtime_ns + 1000))
            return moved
        with mock.patch.object(kn5, "without_faces", side_effect=and_a_build_writes):
            with self.assertRaises(trackcopy.Refused):
                trackcopy.save(self.ac, "t")
        self.assertEqual(["t"], os.listdir(os.path.join(self.ac, "content", "tracks")))
        self.assertEqual({10.0, 11.0, 12.0}, self.cars())

    def test_a_draft_changing_meanwhile_leaves_the_track_as_it_was(self):
        self.edits(["t_0_0#0"])
        real = kn5.without_faces

        def and_another_tab_saves(*args):
            moved = real(*args)
            self.edits(["t_0_0#1"])
            return moved
        with mock.patch.object(kn5, "without_faces", side_effect=and_another_tab_saves):
            with self.assertRaises(trackcopy.Refused):
                trackcopy.save(self.ac, "t")
        self.assertEqual({10.0, 11.0, 12.0}, self.cars())

    def free(self, times):
        return mock.patch.object(trackcopy.shutil, "disk_usage", return_value=mock.Mock(free=int(os.path.getsize(self.kn5) * times)))

    def test_the_disk_s_room_to_the_limit(self):
        self.edits(["t_0_0#0"])
        with self.free(1.0), self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, "t")
        with self.free(1.2):                                    # (the first Save in its place: the source is its old file)
            trackcopy.save(self.ac, "t")
        self.edits(["t_0_0#1"])
        with self.free(1.2):
            trackcopy.save(self.ac, "t")

    def test_the_disk_s_room_for_a_source_that_has_to_be_copied(self):
        self.edits(["t_0_0#0"])
        with self.free(2.0), self.assertRaises(trackcopy.Refused):       # (a new track: the track stays, so does its file)
            trackcopy.save(self.ac, "t", copy_to="t_2")
        with mock.patch.object(tracksource.os, "link", side_effect=OSError("no such names on this disk")):
            with self.free(2.0), self.assertRaises(trackcopy.Refused):   # (in its place, no link to be had)
                trackcopy.save(self.ac, "t")
            with self.free(2.2):
                trackcopy.save(self.ac, "t")
        self.assertEqual(1, os.stat(tracksource.kn5_of(trackview.recipe(self.ac, "t")["source"])).st_nlink)

    def test_replaced_its_old_file_is_the_source_it_stands_alone_after(self):
        self.edits(["t_0_0#0"])
        before = objectlist.state_of(self.kn5)
        with open(self.kn5, "rb") as f:
            data = f.read()
        trackcopy.save(self.ac, "t")
        source = tracksource.kn5_of(trackview.recipe(self.ac, "t")["source"])
        self.assertEqual((before, 1), (objectlist.state_of(source), os.stat(source).st_nlink))
        self.assertFalse(os.path.samefile(source, self.kn5))
        with open(source, "rb") as f:
            self.assertEqual(data, f.read())

    def test_a_new_track_s_source_is_no_name_of_the_track_s_file(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t", copy_to="t_2")
        source = tracksource.kn5_of(trackview.recipe(self.ac, "t_2")["source"])
        self.assertFalse(os.path.samefile(source, self.kn5))
        self.assertEqual((1, 1), (os.stat(source).st_nlink, os.stat(self.kn5).st_nlink))

    def test_a_save_that_fails_leaves_no_second_name_of_the_track_s_file(self):
        self.edits(["t_0_0#0"])
        for patch in (mock.patch.object(kn5, "without_faces", side_effect=OSError("disk gone")), self.free(1.0)):
            with patch, self.assertRaises((OSError, trackcopy.Refused)):
                trackcopy.save(self.ac, "t")
            self.assertEqual(1, os.stat(self.kn5).st_nlink)
            self.assertEqual([], os.listdir(tracksource.root()))
        trackcopy.save(self.ac, "t")
        self.assertEqual({11.0, 12.0}, self.cars())

    def test_stopped_or_failing_halfway_the_track_stays_as_it_was_and_a_half_source_goes(self):
        self.edits(["t_0_0#0"])
        for fault in (KeyboardInterrupt(), OSError("disk gone")):
            with mock.patch.object(kn5, "without_faces", side_effect=fault):
                with self.assertRaises(type(fault)):
                    trackcopy.save(self.ac, "t")
            self.assertEqual(["t"], os.listdir(os.path.join(self.ac, "content", "tracks")))
            self.assertEqual({10.0, 11.0, 12.0}, self.cars())
        os.makedirs(os.path.join(tracksource.root(), tracksource.NEW + "x"))
        trackcopy.tidy(self.ac)
        self.assertEqual([], os.listdir(tracksource.root()))     # (the source made, never named: gone)

    def test_what_a_map2lap_cut_off_left_is_tidied(self):
        tracks = os.path.join(self.ac, "content", "tracks")
        half, aside, both = (os.path.join(tracks, n) for n in (".map2lap_new_x", ".map2lap_old_gone", ".map2lap_old_t"))
        for folder in (half, aside, both):
            os.makedirs(folder)
        trackcopy.tidy(self.ac)
        self.assertEqual(["gone", "t"], sorted(os.listdir(tracks)))

    def test_an_ac_folder_not_there_says_nothing_the_sources_stay(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")
        source = os.listdir(tracksource.root())
        os.makedirs(os.path.join(tracksource.root(), tracksource.NEW + "x"))
        trackcopy.tidy(os.path.join(self.ac, "moved away"))
        self.assertEqual(source, os.listdir(tracksource.root()))        # (a half one goes all the same)
        self.assertEqual(["t_0_0#0"], [d["id"] for d in trackedits.load(self.ac, "t")["deleted"]])
        trackcopy.tidy(self.ac)
        self.assertEqual(source, os.listdir(tracksource.root()))

    def test_another_ac_folder_says_nothing_about_this_one_s_sources(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")
        source = os.listdir(tracksource.root())
        other = os.path.join(self.ac, "other")
        os.makedirs(os.path.join(other, "content", "tracks"))
        trackcopy.tidy(other)
        self.assertEqual(source, os.listdir(tracksource.root()))
        self.assertIsNotNone(trackview.recipe(self.ac, "t"))
        shutil.rmtree(os.path.join(self.ac, "content", "tracks", "t"))  # (in its own folder, one no track names does go)
        trackcopy.tidy(self.ac)
        self.assertEqual([], os.listdir(tracksource.root()))

    def test_a_copy_leaves_a_draft_newer_than_what_it_took(self):
        self.edits(["t_0_0#0"])
        rename = os.rename

        def and_another_tab_saves(old, new):
            rename(old, new)
            if os.path.basename(new) == "t_2":      # (the copy there, not the source made before it)
                self.edits(["t_0_0#1"])
        with mock.patch.object(trackcopy.os, "rename", side_effect=and_another_tab_saves):
            trackcopy.save(self.ac, "t", copy_to="t_2")
        self.assertEqual(["t_0_0#1"], [d["id"] for d in trackedits.load(self.ac, "t")["deleted"]])
        self.assertEqual(["t_0_0#0"], [d["id"] for d in trackedits.load(self.ac, "t_2")["deleted"]])

    def test_a_copy_made_is_saved_even_if_its_draft_can_t_be_cleared(self):
        self.edits(["t_0_0#0"])
        with mock.patch.object(trackedits.os, "remove", side_effect=PermissionError("in use")):
            self.assertEqual("t_2", trackcopy.save(self.ac, "t", copy_to="t_2")["name"])
        self.assertTrue(os.path.exists(os.path.join(self.ac, "content", "tracks", "t_2", "t_2.kn5")))

    def test_the_room_is_asked_of_each_disk_when_ac_lies_on_another(self):
        self.edits(["t_0_0#0"])
        size, tracks = os.path.getsize(self.kn5), os.path.join(self.ac, "content", "tracks")

        def free(tracks_disk, sources_disk):
            return lambda folder: mock.Mock(free=int(size * (tracks_disk if folder == tracks else sources_disk)))
        with mock.patch.object(trackcopy, "_disk", side_effect=lambda folder: folder), mock.patch.object(tracksource.os, "link", side_effect=OSError("two disks")):
            with mock.patch.object(trackcopy.shutil, "disk_usage", side_effect=free(1.2, 0.5)):
                with self.assertRaises(trackcopy.Refused):      # (the source doesn't fit where the sources lie)
                    trackcopy.save(self.ac, "t")
            with mock.patch.object(trackcopy.shutil, "disk_usage", side_effect=free(1.0, 2.0)):
                with self.assertRaises(trackcopy.Refused):      # (the track doesn't fit where the tracks lie)
                    trackcopy.save(self.ac, "t")
            with mock.patch.object(trackcopy.shutil, "disk_usage", side_effect=free(1.2, 1.2)):
                trackcopy.save(self.ac, "t")

    def test_a_half_new_track_doesn_t_stop_the_next_try(self):
        self.edits(["t_0_0#0"])
        os.makedirs(os.path.join(self.ac, "content", "tracks", ".map2lap_new_t", "data"))
        trackcopy.save(self.ac, "t")
        self.assertEqual(["t"], os.listdir(os.path.join(self.ac, "content", "tracks")))

    def test_a_source_a_copy_names_stays_when_its_track_is_deleted(self):
        import server
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t", copy_to="t_2")
        with mock.patch.object(server.settings, "ac_path", return_value=self.ac):
            self.assertEqual(200, server.delete_track("t")[0])
            self.assertEqual(1, len(os.listdir(tracksource.root())))
            self.assertEqual(["t_0_0#0"], [d["id"] for d in trackedits.load(self.ac, "t_2")["deleted"]])
            self.assertEqual(200, server.delete_track("t_2")[0])
        self.assertEqual([], os.listdir(tracksource.root()))

    def test_a_build_and_a_deletion_wait_for_a_save(self):
        import server
        with trackcopy._making:
            self.assertEqual(409, server.start_build("x", "X", [(1, 2), (3, 4)], 100, None)[0])
            with mock.patch.object(server.settings, "ac_path", return_value=self.ac):
                self.assertEqual(409, server.delete_track("t")[0])
        self.assertTrue(os.path.exists(self.kn5))

    def test_a_save_waits_for_a_build(self):
        self.edits(["t_0_0#0"])

        def building():
            raise trackcopy.Refused("A build is running")
        with self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, "t", may_start=building)
        self.assertEqual({10.0, 11.0, 12.0}, self.cars())
        self.assertFalse(os.path.exists(tracksource.root()))

    def test_refused_without_anything_to_do(self):
        with self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, "t")
        self.assertEqual("t_2", trackcopy.save(self.ac, "t", copy_to="t_2")["name"])     # (a copy as it is: fine)

    def test_a_copy_onto_a_track_there_is_refused(self):
        self.edits(["t_0_0#0"])
        os.makedirs(os.path.join(self.ac, "content", "tracks", "t_2"))
        with self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, "t", copy_to="t_2")

    def test_refused_for_changes_of_another_build(self):
        self.edits(["t_0_0#0"])
        stat = os.stat(self.kn5)
        os.utime(self.kn5, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1000))
        with self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, "t")

    def test_one_at_a_time(self):
        self.edits(["t_0_0#0"])
        with trackcopy._making:
            with self.assertRaises(trackcopy.Busy):
                trackcopy.save(self.ac, "t")


if __name__ == "__main__":
    unittest.main()
