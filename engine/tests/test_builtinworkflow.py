"""Place our shipped scenery, save it, transfer it without caches, and save again with native trees and lights intact."""
from pathlib import Path
import shutil
import sys
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from test_trackcopy import Base
from app import builtinobjects, modeltrees, objectlibrary, trackedits, trackcopy, trackview
from scenery import treefx
from track import kn5, objectlist


class WorkflowTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)
        Path(self.ac, "assets").mkdir()
        Path(self.ac, "assets/builtin-objects.json").write_text('{"version":1}', encoding="utf-8")

    def add(self, species):
        meta = next(a for a in builtinobjects.catalogue(self.ac) if a["builtin"]["name"] == species)
        now = trackedits.load(self.ac, self.name)
        result = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": meta["id"], "at": [20, 0, 5]})
        return result["model"]

    def keep(self, models, placed=(), deleted=(), object_sorts=()):
        now = trackedits.load(self.ac, self.name)
        return trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "builtins",
            "deleted": list(deleted), "models": models, "placed": list(placed), "object_sorts": list(object_sorts)})

    def test_tree_is_drawn_via_native_lods_and_moves_with_the_same_model_matrix(self):
        instance = self.add("spruce")
        pose = {"id": instance["id"] + "#0", "x": 3, "y": 2, "z": -1, "turn": 90, "scale": 1.5}
        self.assertTrue(self.keep([instance], [pose])["treefx"])
        view = trackview.index(self.ac, self.name)
        self.assertEqual(1, view["treefx"])
        trees = trackview.treefx(self.ac, self.name)
        self.assertEqual([instance["id"] + "#0"], trees["ids"])
        np.testing.assert_allclose(trees["pos"], [23, 2, 4])
        self.assertEqual([90], trees["angle"])
        self.assertEqual([1.5], trees["size"])
        self.assertEqual([200, 300, 500], [l["distance"] for l in trackview.treefx_model(self.ac, self.name, trees["models"][0])["lods"]])
        self.assertFalse(any("m2l_model" in m["name"] for m in view["meshes"]))

    def test_native_tree_survives_cache_free_transfer_without_duplicate_lines_or_kn5_geometry(self):
        instance = self.add("olive")
        self.keep([instance])
        trackcopy.save(self.ac, self.name, "native_tree", "Native tree")
        target = Path(self.ac, "content/tracks/native_tree")
        model_name = modeltrees.named(instance["asset"])
        self.assertTrue((target / "extension/trees" / (model_name + ".bin")).is_file())
        license = target / "data/map2lap_models/assets" / instance["asset"] / "LICENSE.txt"
        self.assertIn("Copyright (c) 2026 zabooz", license.read_text(encoding="utf-8"))
        for relative in ("cache", "out"):
            path = Path(self.ac, relative).resolve()
            self.assertTrue(path.is_relative_to(Path(self.ac).resolve()))
            shutil.rmtree(path, ignore_errors=True)
        Path(self.ac, "assets/builtin-objects.json").unlink()
        self.assertEqual(1, trackview.index(self.ac, "native_tree")["treefx"])
        trackcopy.save(self.ac, "native_tree", "native_again", "Native again")
        copied = Path(self.ac, "content/tracks/native_again")
        lines = [t for line in (copied / "extension/trees/trees.txt").read_text().splitlines() if (t := treefx.parse(line))]
        self.assertEqual([model_name], [t["model"] for t in lines])
        saved = kn5.scan(copied / "native_again.kn5")
        self.assertFalse(any("m2l_model" in m["name"] for m in saved["meshes"]))
        self.assertIn("LIST_0 = trees/trees.txt", (copied / "extension/map2lap_ground.ini").read_text())

    def test_placed_lamp_writes_real_night_light_config_and_only_solid_collision(self):
        instance = self.add("streetlight")
        self.keep([instance])
        trackcopy.save(self.ac, self.name, "lamp", "Lamp")
        target = Path(self.ac, "content/tracks/lamp")
        saved = kn5.scan(target / "lamp.kn5")
        lamp = next(i for i, m in enumerate(saved["materials"]) if any(p[0] == "m2lLamp" and p[1] == 1 for p in m.props))
        self.assertTrue(any(m["name"].startswith("1WALL_m2l_model_") for m in saved["meshes"]))
        self.assertFalse(any(m["name"].startswith("1WALL_") and m["material"] == lamp for m in saved["meshes"]))
        config = (target / "extension/map2lap_ground.ini").read_text()
        self.assertIn(saved["materials"][lamp].name, config)
        self.assertIn("[LIGHT_SERIES_...]", config)
        self.assertIn("NIGHT_SMOOTH", config)

    def test_delete_all_can_name_a_library_tree_even_though_it_has_no_kn5_faces(self):
        instance = self.add("spruce")
        self.keep([instance])
        path, scan, objects = trackedits.context(self.ac, self.name, trackedits.load(self.ac, self.name)["base"])
        self.assertIn("Spruce", trackview.counts_of(scan, objects)[1])
        self.keep([instance], object_sorts=["Spruce"])
        trackcopy.save(self.ac, self.name, "gone", "Gone")
        lines = Path(self.ac, "content/tracks/gone/extension/trees/trees.txt").read_text()
        self.assertFalse(any(treefx.parse(line) for line in lines.splitlines()))

    def test_a_treefx_package_cannot_promise_mesh_collision_that_treefx_does_not_write(self):
        meta = next(a for a in builtinobjects.catalogue(self.ac) if a["builtin"]["name"] == "spruce")
        now = trackedits.load(self.ac, self.name)
        with self.assertRaises((trackedits.Invalid, ValueError)):
            trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": meta["id"], "at": [20, 0, 5], "collision": "mesh"})

    def test_a_mixed_group_keeps_native_trees_and_ordinary_rocks_in_one_draft(self):
        library = {a["builtin"]["name"]: a for a in builtinobjects.catalogue(self.ac)}
        now = trackedits.load(self.ac, self.name)
        result = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "instances": [
            {"model": library[species]["id"], "at": [20 + k, 0, 5], "turn": 30, "scale": 1.2}
            for k, species in enumerate(("spruce", "shrub", "rock_0"))]})
        self.keep(result["models"], result["placed"])
        view = trackview.index(self.ac, self.name)
        self.assertEqual(3, len(view["models"]))
        self.assertEqual(2, view["treefx"])
        self.assertEqual(2, len(trackview.treefx(self.ac, self.name)["ids"]))
        self.assertTrue(any("m2l_model" in m["name"] for m in view["meshes"]))

    def test_a_parked_car_and_fountain_save_as_ordinary_solid_objects_and_keep_their_credits(self):
        car, fountain = self.add("car_saloon_red"), self.add("fountain")
        self.keep([car, fountain])
        view = trackview.index(self.ac, self.name)
        self.assertEqual("car", view["objects"][car["id"]]["kinds"][0])
        trackcopy.save(self.ac, self.name, "car_and_fountain", "Car and fountain")
        target = Path(self.ac, "content/tracks/car_and_fountain")
        saved = kn5.scan(target / "car_and_fountain.kn5")
        self.assertTrue(any(m["name"].startswith("1WALL_m2l_model_") for m in saved["meshes"]))
        for instance in (car, fountain):
            package = target / "data/map2lap_models/assets" / instance["asset"]
            self.assertIn("zabooz", (package / "LICENSE.txt").read_text(encoding="utf-8"))
            self.assertTrue((package / "original/model.glb").is_file())

    def test_replacing_a_generator_treefx_tree_removes_its_old_line_and_keeps_height_and_turn(self):
        tree = {"model": "spruce", "pos": [12, 0, 15], "angle": 30, "size": 1, "width": 1}
        objectlist.write(self.kn5, self.objects, {"next": 1, "trees": {"0": tree}})
        folder = Path(self.root, "extension/trees")
        folder.mkdir(parents=True)
        treefx.write_models(folder, ["spruce"])
        treefx.write_text(folder, {"next": 1, "trees": {"0": tree}})
        library = next(a for a in builtinobjects.catalogue(self.ac) if a["builtin"]["name"] == "birch")
        now = trackedits.load(self.ac, self.name)
        result = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": library["id"],
            "replace": "trees#0", "keep_height": True})
        self.keep([result["model"]], result["placed"])
        index = trackview.index(self.ac, self.name)
        self.assertIn("trees#0", index["model_replacements"])
        matrix = np.asarray(index["model_matrices"][result["model"]["id"]]).reshape(4, 4).T
        np.testing.assert_allclose(matrix[:3, 3], tree["pos"])
        self.assertAlmostEqual(30, np.degrees(np.arctan2(matrix[0, 2], matrix[0, 0])))
        target_height = library["geometry"]["bounds"][1][1] - library["geometry"]["bounds"][0][1]
        self.assertAlmostEqual(treefx.size("spruce")[0] / target_height, np.linalg.norm(matrix[:3, 1]))
        trackcopy.save(self.ac, self.name, "replaced", "Replaced")
        lines = Path(self.ac, "content/tracks/replaced/extension/trees/trees.txt").read_text()
        rows = [t for line in lines.splitlines() if (t := treefx.parse(line))]
        self.assertEqual(1, len(rows))
        self.assertNotEqual("spruce", rows[0]["model"])
