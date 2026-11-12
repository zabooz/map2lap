"""Our generated scenery stays a usable, portable library, including native trees and working street lamps."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import builtinobjects, modeldata, modelmesh, objectlibrary, trackmodels, trackvariation
from app import mytracks
from scenery import treefx


class BuiltinTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "assets").mkdir()
        (self.root / "assets/builtin-objects.json").write_text('{"version":1}', encoding="utf-8")
        patch = mock.patch.object(objectlibrary, "ROOT", str(self.root))
        patch.start(); self.addCleanup(patch.stop)
        patch = mock.patch.object(mytracks, "ROOT", str(self.root))
        patch.start(); self.addCleanup(patch.stop)

    def test_catalogue_contains_all_our_trees_six_rocks_and_freestanding_furniture(self):
        items = objectlibrary.listing(limit=100)["items"]
        entries = {m["builtin"]["name"]: m for m in items}
        self.assertTrue(set(treefx.MODELS) <= entries.keys())
        self.assertEqual(6, sum(name.startswith("rock_") for name in entries))
        self.assertTrue({"streetlight", "polelamp", "bench", "bin", "hydrant", "stop", "giveway", "signal"} <= entries.keys())
        self.assertTrue(all(m["creator"] == "Map2Lap (zabooz)" and m["license"] == "MIT" for m in entries.values()))

    def test_each_entry_has_valid_geometry_a_preview_and_an_immutable_identity(self):
        for asset in builtinobjects.catalogue(self.root):
            with self.subTest(name=asset["name"]):
                raw = objectlibrary.original(asset["id"])
                model = modeldata.load(raw)
                self.assertGreater(sum(len(p.indices) for p in model.primitives), 0)
                self.assertEqual(asset["id"], objectlibrary.identity(asset["model"]["sha256"], asset))
                self.assertEqual(raw, objectlibrary.original(asset["id"]))
                notice = (objectlibrary._folder(asset["id"]) / "LICENSE.txt").read_text(encoding="utf-8")
                self.assertIn("Copyright (c) 2026 zabooz", notice)
                self.assertIn("Copyright (c) 2026 TecnaGamer", notice)

    def test_hiding_a_builtin_keeps_its_bytes_and_never_changes_an_import(self):
        item = next(m for m in objectlibrary.listing(limit=100)["items"] if m["builtin"]["name"] == "spruce")
        raw = objectlibrary.original(item["id"])
        self.assertTrue(objectlibrary.remove(item["id"]))
        self.assertNotIn(item["id"], {m["id"] for m in objectlibrary.listing(limit=100)["items"]})
        self.assertEqual(raw, objectlibrary.original(item["id"]))

    def test_tree_package_retains_all_three_native_lods_in_addition_to_its_library_preview(self):
        item = next(m for m in builtinobjects.catalogue(self.root) if m["builtin"]["name"] == "olive")
        folder = objectlibrary._folder(item["id"])
        native = treefx.read_bin(folder / item["native_tree"]["file"])
        self.assertEqual([200, 300, 500], [lod["distance"] for lod in native["lods"]])
        self.assertEqual("none", item["collision"])

    def test_street_lamp_keeps_the_emitting_glass_and_only_the_pole_collides(self):
        item = next(m for m in builtinobjects.catalogue(self.root) if m["builtin"]["name"] == "streetlight")
        model = modeldata.load(objectlibrary.original(item["id"]))
        native, _ = modelmesh.materials(model, item["id"], trackmodels.light("prop"))
        marked = [m for m in native if any(p[0] == "m2lLamp" and p[1] == 1 for p in m.props)]
        self.assertEqual(1, len(marked))
        config = trackvariation.model_config(native)
        self.assertIn(marked[0].name, config)
        self.assertIn("[LIGHT_SERIES_...]", config)
        self.assertIn("CONDITION = NIGHT_SMOOTH", config)
        parts = modelmesh.geometry(model, item)
        ready = {"parts": parts, "definitions": model.materials, "pieces": {}}
        pieces = trackmodels._asset_pieces(ready, "mesh")
        glass_slot = next(i for i, m in enumerate(native) if m in marked)
        self.assertTrue(any(p["prefix"] == "1WALL_" for p in pieces))
        self.assertFalse(any(p["prefix"] == "1WALL_" and p["material"] == glass_slot for p in pieces))

    def test_library_and_generator_share_the_same_lamp_lighting_rule(self):
        from scenery import lamps
        from track import make_track_folder
        self.assertIn(lamps.config(["lamp_glass"], include=False), make_track_folder.EXT_CONFIG)

    def test_builtin_manifest_is_required_so_an_empty_app_library_stays_empty(self):
        (self.root / "assets/builtin-objects.json").unlink()
        self.assertEqual([], objectlibrary.listing()["items"])

    def test_a_placed_tree_keeps_native_lods_in_its_snapshot_and_adds_no_kn5_meshes(self):
        item = next(m for m in builtinobjects.catalogue(self.root) if m["builtin"]["name"] == "spruce")
        asset, meta = trackmodels.snapshot(item["id"])
        folder = trackmodels._folder(asset)
        self.assertEqual(meta["native_tree"]["bytes"], (folder / "native/model.bin").stat().st_size)
        ready = trackmodels._prepared(str(folder), asset, trackmodels._asset_stamp(folder))
        instance = {"id": "instance_" + "a" * 24, "asset": asset, "at": [10, 20, 30], "replaces": None, "collision": "none"}
        self.assertEqual([], trackmodels._instance_meshes(instance, ready))
        (self.root / "assets/builtin-objects.json").unlink()
        self.assertEqual(meta["native_tree"], trackmodels._verified(folder, asset)["native_tree"])


if __name__ == "__main__":
    unittest.main()
