"""TreeFX trees in the Editor: read from the track's object list and its own .bin models, changed by the draft as other objects
are, and written by Save into the list and trees.txt from the source and the draft, so nothing is added twice."""
import os
import shutil
import sys
import tempfile
import unittest
import zipfile

import numpy as np

from test_trackcopy import Base

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "src")))

from app import trackcopy, trackedits, tracksource, tracktrees, trackview  # noqa: E402
from scenery import treefx  # noqa: E402
from track import make_track_folder, objectlist  # noqa: E402

SPRUCE = {"model": "spruce", "pos": [5.0, 0.0, 0.0], "angle": 10.0, "size": 1.0, "width": 1.0}
BIRCH = {"model": "birch", "pos": [200.0, 3.0, 0.0], "angle": 0.0, "size": 0.8, "width": 1.1}
SPRUCE2 = {"model": "spruce", "pos": [7.0, 0.0, 2.0], "angle": 350.0, "size": 1.2, "width": 0.9}
# (1 m up on all but its edge, from x -10 to 110 and z -10 to 10: under the spruces, not under the birch at x 200)
UP = {"id": "up", "x": -10, "z": -10, "nx": 61, "nz": 11, "mm": [1000 if 0 < i % 61 < 60 and 61 <= i < 610 else 0 for i in range(671)]}


class TreesBase(Base):
    """The test track with three TreeFX trees in its list, their models and trees.txt in its folder, as a build makes them."""

    def setUp(self):
        super().setUp()
        self.section = {"next": 3, "trees": {"0": SPRUCE, "1": BIRCH, "2": SPRUCE2}}
        objectlist.write(self.kn5, self.objects, self.section)
        os.makedirs(os.path.join(self.root, "extension"))
        with open(os.path.join(self.root, "extension", "ext_config.ini"), "w", encoding="utf-8") as f:
            f.write("[ABOUT]\n")
        make_track_folder.write_trees(self.root, self.section)

    def draft(self, **fields):
        """The page's list with fields in place of what the draft holds; its answer."""
        now = trackedits.load(self.ac, "t")
        body = {"base": now["base"], "revision": now["revision"], "id": f"r{now['revision']}", "deleted": now["deleted"],
                "sorts": now["sorts"], "object_sorts": now["object_sorts"], **fields}
        body["deleted"] = [d if isinstance(d, dict) else {"id": d, "position": [0, 0, 0]} for d in body["deleted"]]
        return trackedits.save_telling(self.ac, "t", body)

    def saved_section(self, name="t"):
        """The TreeFX section of a track's own list, as AC gets it."""
        return trackview.treefx_of(self.own(name))

    def lines(self, name="t"):
        with open(os.path.join(self.ac, "content", "tracks", name, "extension", "trees", "trees.txt"), encoding="utf-8") as f:
            return [t for t in map(treefx.parse, f) if t]


class ReadBinTest(unittest.TestCase):
    def test_a_written_model_reads_back_as_its_geometry_in_metres(self):
        folder = self.enterContext(tempfile.TemporaryDirectory())
        treefx.write_models(folder, ["spruce"])
        model = treefx.read_bin(os.path.join(folder, "spruce.bin"))
        H, W = treefx.size("spruce")
        self.assertEqual((H, W), (model["height"], model["width"]))
        self.assertEqual(list(treefx.LOD_M), [lod["distance"] for lod in model["lods"]])
        _texture, meshes = treefx.model("spruce")
        for lod, mesh in zip(model["lods"], meshes):
            part, = lod["parts"]
            np.testing.assert_allclose(part["pos"], np.asarray(mesh.p), atol=1e-4)
            np.testing.assert_allclose(part["uv"], np.asarray(mesh.uv), atol=1e-6)
            self.assertEqual(np.asarray(mesh.t).reshape(-1).tolist(), part["indices"].tolist())
            self.assertEqual(("spruce_d.png", "spruce_n.png"), (part["diffuse"], part["normal_map"]))
        self.assertTrue(model["textures"]["spruce_d.png"].startswith(b"\x89PNG"))


class ReadTest(TreesBase):
    def test_the_editor_reads_the_section_of_the_served_list(self):
        self.assertEqual(self.section, trackview.treefx_of(trackview.served(self.ac, "t")[0]))

    def test_a_list_of_another_state_of_the_kn5_or_a_broken_section_is_none(self):
        os.utime(self.kn5, ns=(1, 1))
        self.assertIsNone(trackview.treefx_of(self.kn5))
        for broken in ({"next": 1, "trees": {"1": SPRUCE}}, {"next": 2, "trees": {"0": {**SPRUCE, "pos": [1, 2]}}},
                       {"next": "3", "trees": {}}, {"next": 1, "trees": {"0": {**SPRUCE, "size": -1}}}):
            objectlist.write(self.kn5, self.objects, broken)
            self.assertIsNone(trackview.treefx_of(self.kn5), broken)

    def test_the_trees_come_with_ids_their_model_and_place(self):
        trees = trackview.treefx(self.ac, "t")
        self.assertEqual(["trees#0", "trees#1", "trees#2"], trees["ids"])
        self.assertEqual(["birch", "spruce"], trees["models"])
        self.assertEqual([1, 0, 1], trees["model"])
        self.assertEqual([5.0, 0.0, 0.0, 200.0, 3.0, 0.0, 7.0, 0.0, 2.0], trees["pos"])
        self.assertEqual(trees["pos"], trees["base"])
        self.assertEqual(([10.0, 0.0, 350.0], [1.0, 0.8, 1.2], [1.0, 1.1, 0.9]), (trees["angle"], trees["size"], trees["width"]))
        self.assertEqual(3, trackview.index(self.ac, "t")["treefx"])

    def test_a_track_without_trees_has_none(self):
        objectlist.write(self.kn5, self.objects)
        self.assertEqual([], trackview.treefx(self.ac, "t")["ids"])
        self.assertEqual(0, trackview.index(self.ac, "t")["treefx"])

    def test_a_model_comes_from_the_track_s_own_file_not_from_the_program(self):
        folder = os.path.join(self.root, "extension", "trees")
        shutil.copyfile(os.path.join(folder, "birch.bin"), os.path.join(folder, "spruce.bin"))     # (as an older Map2Lap made it)
        model = trackview.treefx_model(self.ac, "t", "spruce")
        birch = treefx.read_bin(os.path.join(folder, "birch.bin"))
        self.assertEqual(birch["height"], model["height"])
        np.testing.assert_allclose(model["lods"][0]["parts"][0]["pos"], np.asarray(birch["lods"][0]["parts"][0]["pos"]).reshape(-1),
                                   atol=1e-3)
        self.assertEqual(birch["textures"]["birch_d.png"], trackview.treefx_texture(self.ac, "t", "spruce", "birch_d.png"))

    def test_a_model_not_on_the_track_or_no_model_name_is_refused(self):
        for model in ("larch", "../t", "Spruce"):
            with self.assertRaises(trackview.NotOurs, msg=model):
                trackview.treefx_model(self.ac, "t", model)
        with self.assertRaises(trackview.NotOurs):
            trackview.treefx_texture(self.ac, "t", "spruce", "tree.ini")

    def test_the_first_save_keeps_the_section_in_the_source(self):
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        path, source = trackview.served(self.ac, "t")
        self.assertEqual(tracksource.kn5_of(source), path)
        self.assertEqual(self.section, trackview.treefx_of(path))


class DraftTest(TreesBase):
    def test_a_tree_is_deleted_by_its_id_and_its_kind_is_said(self):
        self.draft(deleted=["trees#1"])
        self.assertEqual([("trees#1", "treefx")], [(d["id"], d["kind"]) for d in trackedits.load(self.ac, "t")["deleted"]])

    def test_an_id_of_no_tree_is_refused(self):
        for wrong in ("trees#3", "trees#-1", "trees#x"):
            with self.assertRaises(trackedits.Invalid, msg=wrong):
                self.draft(deleted=[wrong])
        with self.assertRaises(trackedits.Invalid):
            self.draft(placed=[{"id": "trees#7", "x": 1, "y": 0, "z": 0, "turn": 0, "scale": 1}])

    def test_all_of_a_model_is_a_sort_to_delete(self):
        self.draft(object_sorts=["spruce"])
        self.assertEqual(["spruce"], trackedits.load(self.ac, "t")["object_sorts"])

    def test_a_tree_added_takes_a_number_never_given_and_is_kept_with_it(self):
        added = {"id": "trees#3", **SPRUCE, "pos": [9.0, 0.0, 1.0]}
        self.draft(trees=[added], trees_next=4)
        now = trackedits.load(self.ac, "t")
        self.assertEqual(([added], 4), (now["trees"], now["trees_next"]))
        self.assertIn("trees#3", trackview.treefx(self.ac, "t")["ids"])
        self.draft(deleted=["trees#3"])                 # (one added can go as the others)

    def test_an_added_tree_of_a_number_given_before_twice_or_of_a_model_not_on_the_track_is_refused(self):
        for wrong in ([{"id": "trees#1", **SPRUCE}], [{"id": "trees#3", **SPRUCE}, {"id": "trees#3", **BIRCH}],
                      [{"id": "trees#3", **SPRUCE, "model": "larch"}], [{"id": "trees#3", **SPRUCE, "size": 0}],
                      [{"id": "trees#3", **SPRUCE, "pos": [1, 2, float("nan")]}], [{"id": "t_0_0#3", **SPRUCE}]):
            with self.assertRaises(trackedits.Invalid, msg=wrong):
                self.draft(trees=wrong, trees_next=5)

    def test_the_next_number_never_goes_down(self):
        self.draft(trees=[{"id": "trees#5", **SPRUCE}], trees_next=6)
        self.draft(trees=[], trees_next=4)              # (the addition undone: its number stays given)
        self.assertEqual(6, trackedits.load(self.ac, "t")["trees_next"])
        self.draft(trees=[{"id": "trees#6", **SPRUCE}])
        self.assertEqual(7, trackedits.load(self.ac, "t")["trees_next"])

    def test_a_tree_moved_shows_where_the_draft_puts_it_and_a_height_change_lifts_it(self):
        answer = self.draft(placed=[{"id": "trees#2", "x": 2, "y": 0.5, "z": -1, "turn": 20, "scale": 2}])
        moved = {**SPRUCE2, "pos": [9.0, 0.5, 1.0], "angle": 10.0, "size": 2.4, "base": [7.0, 0.0, 2.0]}
        self.assertEqual({"trees": {"trees#2": moved}, "gone": []}, answer["treefx"])      # (only what stands otherwise)
        lifted = self.draft(heights=[UP])["treefx"]
        self.assertEqual(["trees#0", "trees#2"], sorted(lifted["trees"]))                  # (the birch at x 200 is not under it)
        self.assertEqual([9.0, 1.5, 1.0], lifted["trees"]["trees#2"]["pos"])
        trees = trackview.treefx(self.ac, "t")
        self.assertEqual([5.0, 1.0, 0.0, 200.0, 3.0, 0.0, 9.0, 1.5, 1.0], trees["pos"])
        self.assertEqual([5.0, 0.0, 0.0, 200.0, 3.0, 0.0, 7.0, 0.0, 2.0], trees["base"])
        self.assertEqual(([10.0, 0.0, 10.0], [1.0, 0.8, 2.4]), (trees["angle"], trees["size"]))

    def test_a_change_that_leaves_the_trees_says_none_an_addition_and_its_undo_name_the_tree(self):
        self.assertIsNone(self.draft(deleted=["trees#0"])["treefx"])
        added = {"id": "trees#3", **SPRUCE, "pos": [9.0, 0.0, 1.0]}
        answer = self.draft(trees=[added], trees_next=4)["treefx"]
        self.assertEqual({"trees": {"trees#3": {**SPRUCE, "pos": [9.0, 0.0, 1.0], "base": [9.0, 0.0, 1.0]}}, "gone": []}, answer)
        self.assertEqual({"trees": {}, "gone": ["trees#3"]}, self.draft(trees=[])["treefx"])

    def test_a_move_on_the_ground_keeps_a_tree_s_height_above_the_edited_ground(self):
        self.draft(heights=[UP])
        now = trackedits.load(self.ac, "t")
        out = trackedits.grounded(self.ac, "t", {"base": now["base"], "revision": now["revision"],
                                                 "placed": [{"id": "trees#1", "x": -195, "y": 0, "z": 0, "turn": 0, "scale": 1}]})
        self.assertEqual(-1.0, out["placed"][0]["y"])   # (Save lifts it by the 1 m there: at 3 m on the ground as before)

    def test_the_draft_s_trees_count_as_changes(self):
        self.draft(trees=[{"id": "trees#3", **SPRUCE}], trees_next=4)
        self.assertEqual(1, trackedits.changes(self.ac, "t"))


class CopyTest(TreesBase):
    def copy(self, body):
        now = trackedits.load(self.ac, "t")
        return trackedits.copy_template(self.ac, "t", {"base": now["base"], "revision": now["revision"], **body})

    def test_a_tree_picked_to_copy_gives_its_model_turn_and_size_and_its_foot_on_the_edited_ground(self):
        self.draft(heights=[UP])
        answer = self.copy({"object": "trees#2"})
        self.assertEqual({"tree": {"model": "spruce", "angle": 350.0, "size": 1.2, "width": 0.9}}, answer["template"])
        self.assertEqual(([7.0, 1.0, 2.0], "3D tree"), (answer["at"], answer["kind"]))

    def test_a_copy_placed_takes_the_next_number_never_given_and_stands_on_the_ground_as_save_lifts_it(self):
        self.draft(heights=[UP])
        template = {"tree": {"model": "spruce", "angle": 350.0, "size": 1.2, "width": 0.9}}
        tree = self.copy({"template": template, "at": [20, 5, 3], "pose": {"turn": 10, "y": 0.5, "scale": 2}})["tree"]
        self.assertEqual({"id": "trees#3", "model": "spruce", "pos": [20.0, 4.5, 3.0], "angle": 0.0, "size": 2.4, "width": 0.9}, tree)
        self.draft(trees=[tree])
        self.assertEqual("trees#4", self.copy({"template": template, "at": [30, 1, 3]})["tree"]["id"])
        self.draft(trees=[])                                # (undone: its number stays given)
        self.assertEqual("trees#4", self.copy({"template": template, "at": [30, 1, 3]})["tree"]["id"])
        trackcopy.save(self.ac, "t")
        self.assertEqual(4, self.saved_section()["next"])

    def test_a_copy_of_a_deleted_tree_or_of_no_model_on_the_track_is_refused(self):
        self.draft(deleted=["trees#2"])
        with self.assertRaises(trackedits.Invalid):
            self.copy({"object": "trees#2"})
        with self.assertRaises(trackedits.Invalid):
            self.copy({"template": {"tree": {"model": "larch", "angle": 0, "size": 1, "width": 1}}, "at": [1, 0, 1]})


class SaveTest(TreesBase):
    def test_a_tree_deleted_is_left_out_of_the_list_and_trees_txt_its_number_given_for_good(self):
        self.draft(deleted=["trees#2"])
        made = trackcopy.save(self.ac, "t")
        self.assertEqual(1, made["left_out"])
        self.assertEqual({"next": 3, "trees": {"0": SPRUCE, "1": BIRCH}}, self.saved_section())
        self.assertEqual([SPRUCE, BIRCH], self.lines())
        self.assertEqual(self.section, trackview.treefx_of(trackview.served(self.ac, "t")[0]))     # (the source keeps it)

    def test_undone_after_a_save_and_saved_again_the_tree_is_back(self):
        self.draft(deleted=["trees#2"])
        trackcopy.save(self.ac, "t")
        self.draft(deleted=[])
        trackcopy.save(self.ac, "t")
        self.assertEqual(self.section, self.saved_section())
        self.assertEqual([SPRUCE, BIRCH, SPRUCE2], self.lines())

    def test_a_move_and_a_height_change_are_saved_once_however_often_it_is_saved(self):
        self.draft(placed=[{"id": "trees#0", "x": 1, "y": 0, "z": 0, "turn": 355, "scale": 1.5}], heights=[UP])
        for _ in range(2):
            trackcopy.save(self.ac, "t")
            moved = {**SPRUCE, "pos": [6.0, 1.0, 0.0], "angle": 5.0, "size": 1.5}
            self.assertEqual(moved, self.saved_section()["trees"]["0"])
            self.assertEqual(moved, self.lines()[0])

    def test_all_of_a_model_goes_the_others_stay(self):
        self.draft(object_sorts=["spruce"])
        trackcopy.save(self.ac, "t")
        self.assertEqual({"next": 3, "trees": {"1": BIRCH}}, self.saved_section())
        self.assertEqual([BIRCH], self.lines())

    def test_a_tree_added_is_saved_under_its_number_and_the_next_one_after_it(self):
        added = {**SPRUCE, "pos": [9.0, 0.0, 1.0]}
        self.draft(trees=[{"id": "trees#4", **added}], trees_next=5, heights=[UP])
        trackcopy.save(self.ac, "t")
        section = self.saved_section()
        self.assertEqual(5, section["next"])
        self.assertEqual({**added, "pos": [9.0, 1.0, 1.0]}, section["trees"]["4"])
        self.assertEqual(4, len(self.lines()))

    def test_the_last_tree_deleted_and_saved_its_number_is_not_given_again(self):
        self.draft(deleted=["trees#2"])
        trackcopy.save(self.ac, "t")
        self.assertEqual(3, trackedits.load(self.ac, "t")["trees_next"])

    def test_a_copy_takes_the_list_trees_txt_and_the_models_along(self):
        self.draft(deleted=["trees#0"])
        self.copy()
        self.assertEqual({"next": 3, "trees": {"1": BIRCH, "2": SPRUCE2}}, self.saved_section("t_mod"))
        self.assertEqual([BIRCH, SPRUCE2], self.lines("t_mod"))
        folder = os.path.join(self.ac, "content", "tracks", "t_mod", "extension", "trees")
        self.assertEqual({"birch.bin", "spruce.bin", "trees.txt"}, set(os.listdir(folder)))
        with zipfile.ZipFile(os.path.join(folder, "spruce.bin")) as z:
            self.assertIn("tree.ini", z.namelist())

    def test_every_model_stays_though_no_tree_uses_it_so_undo_brings_its_trees_back(self):
        self.draft(object_sorts=["birch"])
        trackcopy.save(self.ac, "t")
        self.assertIn("birch.bin", os.listdir(os.path.join(self.root, "extension", "trees")))

    def test_a_track_without_trees_gets_no_trees_txt(self):
        objectlist.write(self.kn5, self.objects)
        shutil.rmtree(os.path.join(self.root, "extension", "trees"))
        self.edits(["t_0_0#1"])
        trackcopy.save(self.ac, "t")
        self.assertIsNone(self.saved_section())
        self.assertFalse(os.path.exists(os.path.join(self.root, "extension", "trees")))

    def test_the_trees_alone_are_something_to_save(self):
        self.draft(deleted=["trees#1"])
        trackcopy.save(self.ac, "t")
        self.assertNotIn("1", self.saved_section()["trees"])


class RouteTest(unittest.TestCase):
    def test_the_route_takes_the_trees_a_model_and_its_images_only(self):
        import server
        for path, groups in (("/api/editor/alpha/treefx", ("alpha", None, None)), ("/api/editor/alpha/treefx/spruce", ("alpha", "spruce", None)),
                             ("/api/editor/alpha/treefx/spruce/spruce_d.png", ("alpha", "spruce", "spruce_d.png"))):
            self.assertEqual(groups, server.TREEFX_PATH.fullmatch(path).groups())
        for path in ("/api/editor/alpha/treefx/..%2Fx", "/api/editor/alpha/treefx/spruce/tree.ini", "/api/editor/alpha/treefx/spruce/..%2Fa.png"):
            self.assertIsNone(server.TREEFX_PATH.fullmatch(path), path)


class ReckonTest(unittest.TestCase):
    def test_placed_turns_and_scales_a_tree_on_its_foot_then_the_ground_lifts_it(self):
        out = tracktrees.placed(SPRUCE, {"x": 1, "y": 2, "z": 3, "turn": -20, "scale": 0.5}, 0.25)
        self.assertEqual({**SPRUCE, "pos": [6.0, 2.25, 3.0], "angle": 350.0, "size": 0.5}, out)


if __name__ == "__main__":
    unittest.main()
