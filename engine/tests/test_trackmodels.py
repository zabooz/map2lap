"""Imported model instances replace visible trees and survive drafts, native Save and a cache-free transfer."""
from pathlib import Path
import shutil
from unittest import mock
import unittest

import numpy as np

from test_modeldata import encode, fixture
from test_trackcopy import Base
from app import objectlibrary, trackedits, trackcopy, trackview
from track import kn5


class ModelWorkflowTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)

    def keep(self, models, placed=(), heights=(), copies=()):
        now = trackedits.load(self.ac, self.name)
        return trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "id": "models", "deleted": [], "models": models, "placed": list(placed), "heights": list(heights), "copies": list(copies)})

    def test_an_omitted_primitive_material_is_white_opaque_and_single_sided_even_when_material_zero_is_coloured_mask(self):
        import io
        from PIL import Image
        document, binary = fixture()
        primitive = document["meshes"][0]["primitives"][0]
        document["meshes"][0]["primitives"].append({k: v for k, v in primitive.items() if k != "material"})
        prepared = objectlibrary.prepare("default.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "default.glb", "name": "Default"})["model"]
        now = trackedits.load(self.ac, self.name)
        instance = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [20, 0, 5]})["model"]
        self.keep([instance]); trackcopy.save(self.ac, self.name, "default_model", "Default model")
        native = kn5.read(Path(self.ac, "content/tracks/default_model/default_model.kn5"))
        parts = [m for m in kn5.walk_meshes(native["root"]) if "m2l_model" in m.name]
        self.assertEqual(2, len(parts)); self.assertNotEqual(parts[0].material, parts[1].material)
        coloured, default = (native["materials"][m.material] for m in parts)
        self.assertTrue(coloured.alpha_tested); self.assertFalse(default.alpha_tested); self.assertEqual(0, default.blend)
        self.assertEqual(6, len(parts[0].vertices)); self.assertEqual(3, len(parts[1].vertices))
        texture = next(name for slot, _number, name in default.maps if slot == "txDiffuse")
        with Image.open(io.BytesIO({name: raw for name, _active, raw in native["textures"]}[texture])) as image:
            self.assertTrue(np.all(np.asarray(image.convert("RGBA")) == 255))

    def test_existing_object_copy_and_new_model_both_survive_native_save_and_cold_resave(self):
        now = trackedits.load(self.ac, self.name)
        template = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "object": "nocol_trees_0_0#0"})
        copied = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "template": template["template"], "at": [30, 0, 5]})["copy"]
        self.keep([], copies=[copied])
        document, binary = fixture(); prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [20, 0, 5]})["model"]
        self.keep([model], copies=[copied])
        index = trackview.index(self.ac, self.name)
        self.assertTrue(any("_copy_" in m["name"] for m in index["meshes"]))
        self.assertTrue(any("m2l_model" in m["name"] for m in index["meshes"]))
        trackcopy.save(self.ac, self.name, "mixed_models", "Mixed models")
        native = kn5.read(Path(self.ac, "content/tracks/mixed_models/mixed_models.kn5"))
        first = {m.name: m for m in kn5.walk_meshes(native["root"])}
        self.assertTrue(any("m2l_model" in name for name in first), "An existing ObjectCopy must not discard appended model materials or meshes")
        self.assertTrue(any("_copy_" in name for name in first))
        for relative in ("library", "cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        self.assertIn(copied["id"], trackview.index(self.ac, "mixed_models")["objects"])
        trackcopy.save(self.ac, "mixed_models", "mixed_again", "Mixed again")
        second = kn5.read(Path(self.ac, "content/tracks/mixed_again/mixed_again.kn5"))
        for mesh in kn5.walk_meshes(second["root"]):
            self.assertEqual(first[mesh.name].vertices.tobytes(), mesh.vertices.tobytes())
            self.assertEqual(first[mesh.name].indices.tobytes(), mesh.indices.tobytes())

    def test_copy_an_imported_model_freezes_its_current_size_and_turn_without_duplicating_asset_or_binding_identity(self):
        document, binary = fixture(); prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        first = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [20, 0, 5]})["model"]
        source_pose = {"id": first["id"] + "#0", "x": 0, "y": 1, "z": 0, "turn": 30, "scale": 2}
        self.keep([first], [source_pose]); now = trackedits.load(self.ac, self.name)
        template = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "object": source_pose["id"]})
        copied = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "template": template["template"],
            "at": [30, 0, 5], "pose": {"turn": 15, "y": .3, "scale": 1.25}})
        self.assertNotEqual(first["id"], copied["model"]["id"])
        self.assertEqual(first["asset"], copied["model"]["asset"])
        self.assertEqual([30, 0, 5], copied["model"]["at"])
        self.assertEqual([{**source_pose, "id": copied["model"]["id"] + "#0", "y": .3, "turn": 45, "scale": 2.5}], copied["placed"])
        self.keep([first, copied["model"]], [source_pose, *copied["placed"]])
        self.assertEqual(1, len(trackview.index(self.ac, self.name)["model_assets"]))

    def test_discarding_models_does_not_hide_source_height_pose_or_copy_invalidations(self):
        from test_trackheights import plateau
        document, binary = fixture(); prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [20, 0, 5]})["model"]
        template = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "object": "nocol_trees_0_0#0"})
        copied = trackedits.copy_template(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "template": template["template"], "at": [30, 0, 5]})["copy"]
        self.keep([model], [{"id": "nocol_trees_0_0#0", "x": 1, "y": 2, "z": 0, "turn": 10, "scale": 1}],
                  [plateau(x=-20, z=-20, nx=81, nz=41, height=1500)], [copied])
        changed = self.keep([])["meshes"]
        for needed in (-2, -1, 0, 1):
            self.assertIn(needed, changed, "Model changes must preserve every other affected render domain")

    def test_warm_and_cold_save_apply_source_pose_and_model_ground_height_exactly_once(self):
        from test_trackheights import plateau
        document, binary = fixture()
        prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "at": [10, 0, 10]})["model"]
        pose = {"id": model["id"] + "#0", "x": 1, "y": 2, "z": 1, "turn": 30, "scale": 1.5}
        source_pose = {"id": "nocol_trees_0_0#0", "x": 2, "y": 1, "z": 0, "turn": 10, "scale": 1.2}
        self.keep([model], [pose, source_pose], [plateau(x=-20, z=-20, nx=41, nz=41, height=1500)])
        trackcopy.save(self.ac, self.name, "height_models", "Height models")
        first = kn5.read(Path(self.ac, "content/tracks/height_models/height_models.kn5"))
        model_mesh = next(m for m in kn5.walk_meshes(first["root"]) if "m2l_model" in m.name)
        self.assertAlmostEqual(3.5, float(model_mesh.vertices["pos"][:, 1].min()))
        for cold, source_name, target in ((False, "height_models", "warm_models"), (True, "height_models", "cold_models")):
            with self.subTest(cold=cold):
                if cold:
                    for relative in ("library", "cache", "out/sources", "out/edits", "out/model-assets"):
                        shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
                trackcopy.save(self.ac, source_name, target, target)
                second = kn5.read(Path(self.ac, "content/tracks", target, target + ".kn5"))
                by_name = {m.name: m for m in kn5.walk_meshes(second["root"])}
                for mesh in kn5.walk_meshes(first["root"]):
                    self.assertEqual(mesh.vertices.tobytes(), by_name[mesh.name].vertices.tobytes(), mesh.name)
                    self.assertEqual(mesh.indices.tobytes(), by_name[mesh.name].indices.tobytes(), mesh.name)

    def test_model_binding_is_immutable_and_distinct_from_the_existing_pose_draft(self):
        import json
        document, binary = fixture(); raw = encode(document, binary)
        prepared = objectlibrary.prepare("tree.glb", raw)
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        first = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "at": [10, 0, 20], "collision": "none"})["model"]
        self.assertFalse({"turn", "scale", "metres_per_unit"}.intersection(first))
        self.assertEqual([], trackedits.load(self.ac, self.name)["models"])
        self.assertEqual([-2], self.keep([first])["meshes"], "A model binding must invalidate the live render index")
        kept = trackedits.load(self.ac, self.name)
        self.assertEqual([first], kept["models"])
        self.assertEqual([], kept["placed"])
        with open(trackedits.path_of(self.name), encoding="utf8") as file:
            self.assertEqual(2, json.load(file)["schema"])
        with self.assertRaises(trackedits.Conflict):
            trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [0, 0, 0]})
        shutil.rmtree(Path(self.ac, "library")); shutil.rmtree(Path(self.ac, "cache"))
        from app import trackmodels
        self.assertEqual(raw, trackmodels.original(self.ac, self.name, first["asset"]))
        self.assertEqual([first], trackedits.load(self.ac, self.name)["models"])

    def test_mesh_collision_is_real_native_physics_and_none_keeps_only_visual_geometry(self):
        document, binary = fixture(); prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "at": [10, 0, 10], "collision": "mesh"})["model"]
        self.keep([model]); trackcopy.save(self.ac, self.name, "collision_models", "Collision models")
        native = kn5.read(Path(self.ac, "content/tracks/collision_models/collision_models.kn5"))
        own = [m for m in kn5.walk_meshes(native["root"]) if "m2l_model" in m.name]
        self.assertTrue(any(m.name.startswith("1WALL_") and not m.renderable for m in own))
        self.assertTrue(any(m.name.startswith("nocol_") and m.renderable for m in own))

    def test_removing_the_last_cold_model_stays_removed_after_save_and_undo_can_restore_its_retained_original(self):
        document, binary = fixture(); raw = encode(document, binary)
        prepared = objectlibrary.prepare("tree.glb", raw)
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "at": [10, 0, 10]})["model"]
        self.keep([model]); trackcopy.save(self.ac, self.name, "cold_model", "Cold model")
        for relative in ("library", "cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        now = trackedits.load(self.ac, "cold_model")
        trackedits.save_telling(self.ac, "cold_model", {"base": now["base"], "revision": now["revision"], "id": "remove", "deleted": [], "models": []})
        trackcopy.save(self.ac, "cold_model", "empty_model", "Empty model")
        native = kn5.read(Path(self.ac, "content/tracks/empty_model/empty_model.kn5"))
        self.assertFalse(any("m2l_model" in m.name for m in kn5.walk_meshes(native["root"])))
        self.assertFalse(any("m2l_model" in m["name"] for m in trackview.index(self.ac, "empty_model")["meshes"]), "The source cache must not resurrect compiled model meshes")
        now = trackedits.load(self.ac, "empty_model")
        trackedits.save_telling(self.ac, "empty_model", {"base": now["base"], "revision": now["revision"], "id": "undo", "deleted": [], "models": [model]})
        self.assertEqual([model], trackedits.load(self.ac, "empty_model")["models"])
        from app import trackmodels
        self.assertEqual(raw, trackmodels.original(self.ac, "empty_model", model["asset"]))
        now = trackedits.load(self.ac, "empty_model")
        trackedits.save_telling(self.ac, "empty_model", {"base": now["base"], "revision": now["revision"], "id": "delete", "models": [model],
            "deleted": [{"id": model["id"] + "#0", "position": model["at"]}]})
        trackcopy.save(self.ac, "empty_model", "deleted_model", "Deleted model")
        for relative in ("cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        cold = trackedits.load(self.ac, "deleted_model")
        self.assertEqual([model["id"] + "#0"], [d["id"] for d in cold["deleted"]], "A real Delete must not resurrect a retained model after transfer")

    def test_replacement_prepares_the_current_source_pose_as_part_of_the_same_undo_change(self):
        document, binary = fixture(); prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        moved = {"id": "nocol_trees_0_0#2", "x": 15, "y": 3, "z": -7, "turn": 60, "scale": 1.5}
        self.keep([], [moved])
        now = trackedits.load(self.ac, self.name)
        answer = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "replace": moved["id"]})
        self.assertEqual([1, 0, 0], answer["model"]["at"])
        self.assertEqual([{**moved, "id": answer["model"]["id"] + "#0"}], answer["placed"])
        self.assertEqual([moved], trackedits.load(self.ac, self.name)["placed"], "Preparing replacement must not move the original")

    def test_library_edits_cannot_change_an_applied_snapshot_and_changed_snapshot_refuses_the_draft_atomically(self):
        import json
        from app import trackmodels
        document, binary = fixture(); raw = encode(document, binary)
        prepared = objectlibrary.prepare("tree.glb", raw)
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]
        now = trackedits.load(self.ac, self.name)
        binding = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "at": [10, 0, 20]})["model"]
        self.keep([binding])
        library = Path(self.ac, "library/objects", asset["id"], "asset.json")
        changed = json.loads(library.read_text()); changed["metres_per_unit"] = 40; changed["anchor"] = [500, 1, 3]
        library.write_text(json.dumps(changed))
        folder, meta = trackmodels.resolve(self.ac, self.name, binding["asset"])
        self.assertEqual(1, meta["metres_per_unit"]); self.assertEqual([10, 4, -4], meta["anchor"])
        self.assertEqual(raw, trackmodels.original(self.ac, self.name, binding["asset"]))
        revision = trackedits.load(self.ac, self.name)["revision"]
        snapshot = json.loads((folder / "asset.json").read_text()); snapshot["metres_per_unit"] = 7
        (folder / "asset.json").write_text(json.dumps(snapshot))
        with self.assertRaisesRegex(trackedits.Invalid, "description has changed"):
            self.keep([binding])
        self.assertEqual(revision, trackedits.load(self.ac, self.name)["revision"])

    def test_replacing_an_imported_model_changes_only_its_binding_not_its_instance_or_pose(self):
        from app import trackmodels
        document, binary = fixture(); prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        settings = {"token": prepared["token"], "filename": "tree.glb", "name": "Tree"}
        first_asset = objectlibrary.add(settings)["model"]["id"]
        second_asset = objectlibrary.add({**settings, "metres_per_unit": 2, "collision": "mesh"})["model"]["id"]
        now = trackedits.load(self.ac, self.name)
        first = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": first_asset, "at": [10, 0, 20], "collision": "none"})["model"]
        pose = {"id": first["id"] + "#0", "x": 3, "y": 2, "z": -4, "turn": 60, "scale": 1.5}
        answer = trackmodels.create(self.ac, self.name, {**now, "models": [first], "placed": [pose]},
                                    {"model": second_asset, "replace": pose["id"]})
        self.assertEqual({**first, "asset": answer["model"]["asset"]}, answer["model"])
        self.assertNotEqual(first["asset"], answer["model"]["asset"])
        self.assertEqual([], answer["placed"], "Existing placement stays authoritative instead of being baked into another instance")

    def test_model_geometry_uses_node_transforms_import_anchor_units_and_flat_missing_normals_without_flipping_uv0(self):
        from app import modeldata, modelmesh
        document, binary = fixture()
        # This fixture's two triangles share a crease, so averaging missing normals would change glTF's flat shading.
        positions = np.array([[0, 0, 0], [2, 0, 0], [0, 2, 0], [0, 0, 2]], "<f4")
        uv = np.array([[.1, .2], [.8, .2], [.1, .9], [.9, .7]], "<f4")
        indices = np.array([0, 1, 2, 0, 3, 1], "<u2")
        start = (len(binary) + 3) // 4 * 4
        buffer = bytearray(binary + b"\0" * (start - len(binary)))
        for values, kind, shape in ((positions, 5126, "VEC3"), (uv, 5126, "VEC2"), (indices, 5123, "SCALAR")):
            while len(buffer) % 4: buffer.append(0)
            document["bufferViews"].append({"buffer": 0, "byteOffset": len(buffer), "byteLength": values.nbytes})
            document["accessors"].append({"bufferView": len(document["bufferViews"]) - 1, "componentType": kind, "count": len(values), "type": shape})
            buffer.extend(values.tobytes())
        document["meshes"][0]["primitives"][0].update(attributes={"POSITION": 2, "TEXCOORD_0": 3}, indices=4)
        document["nodes"][1]["scale"] = [-2, 3, 2]
        document["buffers"][0]["byteLength"] = len(buffer)
        model = modeldata.load(encode(document, bytes(buffer)))
        parts = modelmesh.geometry(model, {"anchor": model.anchor, "metres_per_unit": .5})
        self.assertEqual(1, len(parts))
        vertices, faces = parts[0]["vertices"], parts[0]["faces"]
        world = positions @ model.instances[0].transform[:3, :3].T + model.instances[0].transform[:3, 3]
        expected = (world - model.anchor) * .5
        self.assertEqual(6, len(vertices))
        for point, texcoord in zip(expected, uv):
            at = np.flatnonzero(np.all(np.isclose(vertices["pos"], point), axis=1))
            self.assertTrue(len(at)); np.testing.assert_allclose(vertices["uv"][at], np.broadcast_to(texcoord, (len(at), 2)))
        triangles = vertices["pos"][faces].astype(np.float64)
        normal = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
        normal /= np.linalg.norm(normal, axis=1, keepdims=True)
        np.testing.assert_allclose(normal, [[0, 0, 1], [0, 1, 0]], atol=1e-6)
        np.testing.assert_allclose(vertices["normal"][faces], np.broadcast_to(normal[:, None, :], (2, 3, 3)), atol=1e-6)
        from dataclasses import replace
        bad_tangents = replace(model, primitives=tuple(replace(p, tangents=np.tile([0, 0, 0, 1], (len(p.positions), 1))) for p in model.primitives))
        ignored = modelmesh.geometry(bad_tangents, {"anchor": model.anchor, "metres_per_unit": .5})
        np.testing.assert_array_equal(vertices["tangent"], ignored[0]["vertices"]["tangent"])

    def test_import_place_replace_pose_undo_save_and_cold_reopen_keep_originals_ids_and_collision(self):
        document, binary = fixture()
        document["materials"][0]["pbrMetallicRoughness"]["baseColorFactor"] = [.7, .9, .8, 1]
        raw = encode(document, binary)
        prepared = objectlibrary.prepare("own-tree.glb", raw)
        asset = objectlibrary.add({"token": prepared["token"], "filename": "own-tree.glb", "name": "Own alpha tree",
            "category": "tree", "metres_per_unit": .5, "collision": "none"})["model"]
        source = kn5.read(self.kn5)
        original_ground = source["root"].children[0]
        original_collision = source["root"].children[2]
        now = trackedits.load(self.ac, self.name)
        first = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "at": [20, 0, 5], "collision": "none"})["model"]
        self.keep([first])
        now = trackedits.load(self.ac, self.name)
        replacement = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
            "model": asset["id"], "replace": "nocol_trees_0_0#2", "collision": "none"})["model"]
        self.assertNotEqual(first["id"], replacement["id"])
        self.assertEqual(first["asset"], replacement["asset"])
        models = [first, replacement]
        self.keep(models)
        posed = {"id": first["id"] + "#0", "x": 3, "y": 1, "z": -2, "turn": 90, "scale": 1.5}
        self.keep(models, [posed])
        self.keep([first])  # Undo the replacement and pose through the ordinary draft mechanism.
        self.assertEqual([first], trackedits.load(self.ac, self.name)["models"])
        self.keep(models, [posed])
        index = trackview.index(self.ac, self.name)
        self.assertEqual(2, len(index["models"]))
        self.assertEqual(1, len(index["model_assets"]))
        self.assertEqual(["tree"], index["objects"][first["id"]]["kinds"])
        trackcopy.save(self.ac, self.name, "own_trees", "Own trees")
        target = Path(self.ac, "content/tracks/own_trees/own_trees.kn5")
        saved = kn5.read(target)
        generated = [m for m in kn5.walk_meshes(saved["root"]) if "m2l_model" in m.name]
        self.assertTrue(generated, "The imported model must exist as actual native render geometry")
        self.assertTrue(all(m.name.startswith("nocol_") for m in generated))
        self.assertTrue(any(m.alpha_tested for m in saved["materials"]), "Leaf MASK must remain a real native alpha test")
        trees = next(m for m in kn5.walk_meshes(saved["root"]) if m.name == "nocol_trees_0_0")
        self.assertEqual(len(source["root"].children[1].indices) - 24, len(trees.indices))
        for original in (original_ground, original_collision):
            actual = next(m for m in kn5.walk_meshes(saved["root"]) if m.name == original.name)
            self.assertEqual(original.vertices.tobytes(), actual.vertices.tobytes())
            self.assertEqual(original.indices.tobytes(), actual.indices.tobytes())
        own_points = np.concatenate([m.vertices["pos"] for m in generated])
        self.assertTrue(np.any(np.isclose(own_points[:, 1], 4)), "Ground anchor, import metres and instance size must compose")
        from app import trackmodels
        bundle = target.parent / trackmodels.BUNDLE
        self.assertEqual(raw, (bundle / "assets" / first["asset"] / "original/model.glb").read_bytes())
        for relative in ("library", "cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        reopened = trackview.index(self.ac, "own_trees")
        self.assertEqual({first["id"], replacement["id"]}, {m["id"] for m in reopened["models"]})
        self.assertEqual(models, trackedits.load(self.ac, "own_trees")["models"])
        self.assertEqual([posed], trackedits.load(self.ac, "own_trees")["placed"])
        trackcopy.save(self.ac, "own_trees", "own_trees_again", "Own trees again")
        second = kn5.read(Path(self.ac, "content/tracks/own_trees_again/own_trees_again.kn5"))
        self.assertEqual(len(generated), sum("m2l_model" in m.name for m in kn5.walk_meshes(second["root"])))
        self.assertEqual(len(saved["materials"]), len(second["materials"]))
        self.assertEqual(len(saved["textures"]), len(second["textures"]))
        second_meshes = {m.name: m for m in kn5.walk_meshes(second["root"])}
        for first_mesh in kn5.walk_meshes(saved["root"]):
            actual = second_meshes[first_mesh.name]
            self.assertEqual(first_mesh.vertices.tobytes(), actual.vertices.tobytes())
            self.assertEqual(first_mesh.indices.tobytes(), actual.indices.tobytes())


if __name__ == "__main__": unittest.main()
