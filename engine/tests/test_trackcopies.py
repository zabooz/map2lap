"""Copies have independent identity and geometry, retain collision and obey AC's mesh limit."""
import copy
import os
import unittest
from unittest import mock
from types import SimpleNamespace

import numpy as np

from test_trackcopy import Base, IDENTITY, boxes, material
from app import trackcopies, trackedits, trackplace, trackview, trackcopy
from track import kn5, objectlist


def spec(source="t_0_0#3", number=0, x=5):
    matrix = list(trackcopies.IDENTITY)
    matrix[3] = x
    return {"id": f"copy_{number:024x}", "parts": [{"source": source, "parent": -1, "matrix": matrix}]}


class CopiesTest(Base):
    def test_copy_index_omits_original_geometry_and_original_object_lists(self):
        now = trackedits.load(self.ac, self.name)
        copied = spec("t_0_0#0")
        trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "index", "deleted": [], "copies": [copied]})
        index = trackview.copy_index(self.ac, self.name)
        self.assertEqual([copied["id"]], list(index["objects"]))
        self.assertTrue(all(m["copy"] for m in index["meshes"]))
        self.assertEqual(trackview.index(self.ac, self.name)["copy_revision"], index["copy_revision"])

    def test_mesh_requests_reuse_validated_context_until_the_draft_changes(self):
        self.edits()
        index = trackview.index(self.ac, self.name)
        with mock.patch.object(trackedits, "_stored", wraps=trackedits._stored) as read, \
             mock.patch.object(trackcopies, "build", wraps=trackcopies.build) as build:
            for _ in range(5):
                trackview.mesh_bytes(self.ac, self.name, 0, index["revision"])
            self.assertEqual(0, read.call_count)
            self.assertEqual(0, build.call_count)

    def test_context_cache_follows_a_changed_source_object_list(self):
        now = trackedits.load(self.ac, self.name)
        copied = spec("t_0_0#0")
        trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "list", "deleted": [], "copies": [copied]})
        before = trackview.index(self.ac, self.name)
        self.objects["t_0_0"]["kinds"][0] = "bench"
        objectlist.write(self.kn5, self.objects)
        after = trackview.index(self.ac, self.name)
        self.assertNotEqual(before["objects"]["t_0_0"]["kinds"][0], after["objects"]["t_0_0"]["kinds"][0])
        self.assertEqual("bench", after["objects"][copied["id"]]["kinds"][0])

    def test_copy_geometry_revision_survives_unrelated_draft_changes_but_rejects_an_obsolete_manifest(self):
        now = trackedits.load(self.ac, self.name)
        copied = spec("t_0_0#0")
        def keep(copies, deleted=()):
            current = trackedits.load(self.ac, self.name)
            trackedits.save(self.ac, self.name, {"base": current["base"], "revision": current["revision"], "id": "revision",
                "copies": copies, "deleted": [{"id": id_, "position": [0, 0, 0]} for id_ in deleted]})
            return trackview.index(self.ac, self.name)
        before = keep([copied])
        tag = before["copy_revision"]
        self.assertEqual(64, len(tag))
        i = next(m["i"] for m in before["meshes"] if m["copy"])
        after = keep([copied], ["t_0_0#1"])
        self.assertEqual(tag, after["copy_revision"])
        self.assertNotEqual(before["draft"], after["draft"])
        self.assertTrue(trackview.mesh_bytes(self.ac, self.name, i, now["base"], copy_revision=tag))
        changed = keep([])
        self.assertNotEqual(tag, changed["copy_revision"])
        with self.assertRaises(trackview.Unreadable):
            trackview.mesh_bytes(self.ac, self.name, i, now["base"], copy_revision=tag)

    def test_template_anchor_includes_lower_invisible_collision_and_current_height_field(self):
        data = kn5.read(self.kn5)
        collision = next(m for m in kn5.walk_meshes(data["root"]) if m.name.startswith("1WALL_bldcol"))
        collision.vertices = collision.vertices.copy()
        collision.vertices["pos"][:, 1] -= 4
        kn5.write(self.kn5, [(name, blob) for name, _active, blob in data["textures"]], data["materials"], data["root"])
        objectlist.write(self.kn5, self.objects)
        now = trackedits.load(self.ac, self.name)
        op = {"id": "lift", "x": -2, "z": -2, "nx": 3, "nz": 3, "mm": [0, 0, 0, 0, 2000, 0, 0, 0, 0]}
        trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "anchor", "deleted": [], "heights": [op]})
        now = trackedits.load(self.ac, self.name)
        result = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "object": "t_0_0#3"})
        np.testing.assert_allclose(result["at"], [0, -2, 0])

    def test_ground_following_subtracts_the_height_field_that_save_will_apply_at_the_new_place(self):
        now = trackedits.load(self.ac, self.name)
        op = {"id": "slope", "x": -2, "z": -2, "nx": 4, "nz": 3, "mm": [0] * 4 + [0, 1000, 2000, 0] + [0] * 4}
        copied = spec("t_0_0#0", x=0)
        trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "ground",
            "deleted": [], "heights": [op], "copies": [copied]})
        now = trackedits.load(self.ac, self.name)
        for id_ in ("t_0_0#0", copied["id"] + "#0"):
            proposed = {"id": id_, "x": 2, "y": 3, "z": 0, "turn": 0, "scale": 1}
            result = trackedits.grounded(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "placed": [proposed]})
            self.assertEqual(2, result["placed"][0]["y"])
        with self.assertRaises(trackedits.Conflict):
            trackedits.grounded(self.ac, self.name, {"base": now["base"], "revision": now["revision"] - 1, "placed": [proposed]})

    def test_copy_options_turn_and_size_the_whole_template_and_raise_it_above_the_clicked_ground(self):
        now = trackedits.load(self.ac, self.name)
        body = {"base": now["base"], "revision": now["revision"]}
        template = trackedits.copy_template(self.ac, self.name, {**body, "object": "t_0_0#3"})["template"]
        copied = trackedits.copy_template(self.ac, self.name, {**body, "template": template, "at": [100, 20, 50],
            "pose": {"turn": 90, "y": 3, "scale": 2}})["copy"]
        extended, objects = trackcopies.build(self.kn5, kn5.scan(self.kn5), self.objects, [copied])
        np.testing.assert_allclose(objects[copied["id"]]["at"][0], [100, 23, 50])
        with open(self.kn5, "rb") as f:
            for member, part in enumerate(copied["parts"]):
                source = trackcopies._source(f, kn5.scan(self.kn5), self.objects, part["source"])
                for mesh, first, count in source["faces"]:
                    v, faces = kn5.mesh_arrays(f, kn5.scan(self.kn5)["meshes"][mesh])
                    points = v["pos"][faces[first:first+count]].reshape(-1, 3)
                    expected = np.c_[100 + 2 * points[:, 2], 23 + 2 * points[:, 1], 50 - 2 * points[:, 0]]
                    np.testing.assert_allclose(trackcopies._posed(points, part["matrix"]), expected, atol=1e-6)
        self.assertEqual(3, len(objects[copied["id"]]["kinds"]))

    def test_copy_options_reject_non_finite_height_and_invalid_size(self):
        now = trackedits.load(self.ac, self.name)
        body = {"base": now["base"], "revision": now["revision"], "template": {"parts": spec()["parts"]}, "at": [0, 0, 0]}
        for pose in ({"turn": 0, "y": float("nan"), "scale": 1}, {"turn": 0, "y": 0, "scale": 0}, None):
            with self.subTest(pose=pose), self.assertRaises(trackedits.Invalid):
                trackedits.copy_template(self.ac, self.name, {**body, "pose": pose})

    def test_copy_sets_its_foot_on_the_ground_even_when_the_source_pivot_is_higher(self):
        self.objects["t_0_0"]["at"][3] = [0, 5, 0]
        objectlist.write(self.kn5, self.objects)
        now = trackedits.load(self.ac, self.name)
        body = {"base": now["base"], "revision": now["revision"]}
        template = trackedits.copy_template(self.ac, self.name, {**body, "object": "t_0_0#3"})["template"]
        copied = trackedits.copy_template(self.ac, self.name, {**body, "template": template, "at": [100, 20, 50]})["copy"]
        extended, _objects = trackcopies.build(self.kn5, kn5.scan(self.kn5), self.objects, [copied])
        root_mesh = next(m for m in extended["meshes"] if m.get("copy") and m["name"].startswith("nocol_bld_"))
        self.assertEqual(20, root_mesh["data"][0]["pos"][:, 1].min())

    def test_copy_foot_includes_a_child_below_its_owner(self):
        template = {"parts": [spec("t_0_0#3")["parts"][0], {**spec("t_0_0#5")["parts"][0], "parent": 0}]}
        template["parts"][1]["matrix"][7] = -3
        now = trackedits.load(self.ac, self.name)
        result = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "template": template, "at": [0, 20, 0]})["copy"]
        self.assertEqual(23, result["parts"][0]["matrix"][7])

    def test_a_house_copies_its_children_and_invisible_collision_with_mesh_flags(self):
        scan = kn5.scan(self.kn5)
        template, at, kind = trackcopies.template(self.kn5, scan, self.objects, [], [], "t_0_0#3")
        self.assertEqual([p["source"] for p in template["parts"]], ["t_0_0#3", "t_0_0#4", "t_0_0#5"])
        self.assertEqual([-1, 0, 0], [p["parent"] for p in template["parts"]])
        self.assertEqual("house", kind)
        template["id"] = spec()["id"]
        extended, objects = trackcopies.build(self.kn5, scan, self.objects, [template])
        entry = objects[template["id"]]
        self.assertEqual(["house", "house sign", "door"], entry["kinds"])
        added = extended["meshes"][len(scan["meshes"]):]
        collision = next(m for m in added if m["name"].startswith("1WALL_bldcol"))
        self.assertEqual(0, collision["renderable"])
        self.assertEqual(scan["meshes"][3]["cast_shadows"], collision["cast_shadows"])
        out = os.path.join(self.ac, "copies.kn5")
        kn5.without_faces(self.kn5, out, {}, added=added)
        saved = kn5.scan(out)
        self.assertEqual(len(extended["meshes"]), len(saved["meshes"]))
        self.assertEqual(scan["meshes"], saved["meshes"][:len(scan["meshes"])] )

    def test_the_draft_view_and_save_have_the_same_copy_and_reload_keeps_its_id(self):
        before = trackedits.load(self.ac, self.name)
        wanted = spec("t_0_0#0")
        trackedits.save(self.ac, self.name, {"base": before["base"], "revision": before["revision"], "id": "copy-test",
                                          "deleted": [], "copies": [wanted]})
        draft = trackedits.load(self.ac, self.name)
        self.assertEqual([wanted], draft["copies"])
        index = trackview.index(self.ac, self.name)
        self.assertIn(wanted["id"], index["objects"])
        generated = [m for m in index["meshes"] if m.get("copy")]
        self.assertTrue(generated)
        shown = trackview.mesh_bytes(self.ac, self.name, generated[0]["i"], index["revision"])
        trackcopy.save(self.ac, self.name)
        self.assertEqual([wanted], trackedits.load(self.ac, self.name)["copies"])
        own = kn5.scan(self.kn5)
        with open(self.kn5, "rb") as f:
            vertices, faces = kn5.mesh_arrays(f, own["meshes"][generated[0]["i"]])
        self.assertEqual(shown[:len(vertices) * kn5.VERTEX.itemsize], vertices.tobytes())

    def test_a_copied_tree_is_listed_and_does_not_reuse_the_counted_tree_id(self):
        scan, objects = trackcopies.build(self.kn5, kn5.scan(self.kn5), self.objects, [spec("nocol_trees_0_0#0")])
        entry = objects[spec()["id"]]
        self.assertEqual(["tree"], entry["kinds"])
        new_mesh = entry["faces"][0][0][0]
        self.assertNotIn(new_mesh, trackview._first_faces(scan["meshes"], scan["materials"]))

    def test_bundled_copies_split_before_65536_vertices(self):
        node = boxes("nocol_props_0_0", 0, [1], faces_each=21845)
        kn5.write(self.kn5, [], [material("m")], kn5.Node(1, "root", 1, matrix=IDENTITY, children=[node]))
        objects = {"t_0_0": {"kinds": ["bench"], "at": [[0, 0, 0]], "parents": [-1], "faces": [[[0, 0, 21845]]]}}
        objectlist.write(self.kn5, objects)
        scan, listed = trackcopies.build(self.kn5, kn5.scan(self.kn5), objects, [spec("t_0_0#0", 0), spec("t_0_0#0", 1)])
        self.assertEqual([65535, 65535], [m["vertices"] for m in scan["meshes"][1:]])
        for m in scan["meshes"][1:]:
            self.assertLess(int(m["data"][1].max()), 65535)

    def test_a_copied_pole_excludes_wires_and_a_wire_alone_is_refused(self):
        self.poles()
        template, _at, _kind = trackcopies.template(self.kn5, kn5.scan(self.kn5), trackview.list_of(self.kn5), [], [], "t_0_0#0")
        self.assertEqual(["t_0_0#0"], [p["source"] for p in template["parts"]])

    def test_bad_poses_and_duplicate_ids_are_refused(self):
        one = spec()
        self.assertIsNone(trackcopies.problems([one]))
        self.assertIsNotNone(trackcopies.problems([one, one]))
        bad = copy.deepcopy(one)
        bad["parts"][0]["matrix"][0] = float("nan")
        self.assertIsNotNone(trackcopies.problems([bad]))
        bad["parts"][0]["matrix"] = [0] * 12
        self.assertIsNotNone(trackcopies.problems([bad]))

    def test_first_save_as_new_keeps_a_source_without_draft_mesh_ids(self):
        before = trackedits.load(self.ac, self.name)
        wanted = spec("t_0_0#0")
        trackedits.save(self.ac, self.name, {"base": before["base"], "revision": before["revision"], "id": "new",
                                          "deleted": [], "copies": [wanted]})
        trackcopy.save(self.ac, self.name, copy_to="new_copy", title="New copy")
        source, _ = trackview.served(self.ac, "new_copy")
        self.assertNotIn(wanted["id"], trackview.list_of(source))
        self.assertIn(wanted["id"], trackview.index(self.ac, "new_copy")["objects"])

    def test_template_of_a_moved_copy_is_independent_of_both_earlier_objects(self):
        copied = spec("t_0_0#0", x=5)
        template, at, _kind = trackcopies.template(self.kn5, kn5.scan(self.kn5), self.objects, [copied],
            [{"id": copied["id"] + "#0", "x": 7, "y": 2, "z": 0, "turn": 0, "scale": 1}], copied["id"] + "#0")
        self.assertEqual("t_0_0#0", template["parts"][0]["source"])
        np.testing.assert_allclose(at, [12, 2, 0])
        np.testing.assert_allclose(np.array(template["parts"][0]["matrix"]).reshape(3, 4)[:, 3], [12, 2, 0])

    def test_copying_a_house_does_not_bring_back_a_deleted_sign(self):
        self.edits(deleted=["t_0_0#4"])
        now = trackedits.load(self.ac, self.name)
        result = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "object": "t_0_0#3"})
        self.assertEqual(["t_0_0#3", "t_0_0#5"], [p["source"] for p in result["template"]["parts"]])

    def test_obsolete_copy_mesh_request_is_refused_after_undo_changes_the_indices(self):
        now = trackedits.load(self.ac, self.name)
        trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "old",
                                          "deleted": [], "copies": [spec("t_0_0#0")]})
        index = trackview.index(self.ac, self.name)
        number = next(m["i"] for m in index["meshes"] if m["copy"])
        with self.assertRaises(trackview.Unreadable):
            trackview.mesh_bytes(self.ac, self.name, number, index["revision"], draft=index["draft"] - 1)

    def test_disk_room_includes_added_geometry_before_writing_a_copy(self):
        now = trackedits.load(self.ac, self.name)
        trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "disk",
                                          "deleted": [], "copies": [spec("t_0_0#0")]})
        free = int(os.path.getsize(self.kn5) * trackcopy.ROOM_FACTOR) + 1
        with mock.patch.object(trackcopy.shutil, "disk_usage", return_value=SimpleNamespace(free=free)):
            with self.assertRaises(trackcopy.Refused):
                trackcopy.save(self.ac, self.name)

    def test_meshes_with_different_physics_prefixes_are_never_bundled_together(self):
        nodes = [boxes("nocol_cars_0_0", 0, [1], faces_each=1), boxes("1WALL_cars_0_0", 0, [1], faces_each=1)]
        kn5.write(self.kn5, [], [material("m")], kn5.Node(1, "root", 1, matrix=IDENTITY, children=nodes))
        objects = {"t_0_0": {"kinds": ["car"], "at": [[0, 0, 0]], "parents": [-1], "faces": [[[0, 0, 1], [1, 0, 1]]]}}
        objectlist.write(self.kn5, objects)
        scan, _listed = trackcopies.build(self.kn5, kn5.scan(self.kn5), objects, [spec("t_0_0#0")])
        self.assertEqual(["nocol", "1WALL"], [m["name"].split("_")[0] for m in scan["meshes"][2:]])


if __name__ == "__main__":
    unittest.main()
