"""Original GLB model packages remain portable and immutable independently of prepared data and scene instances."""
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest import mock

from test_modeldata import encode, fixture
from app import objectlibrary


class LibraryTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        patch = mock.patch.object(objectlibrary, "ROOT", self.temporary.name)
        patch.start()
        self.addCleanup(patch.stop)

    def prepare(self):
        raw = encode(*fixture())
        return raw, objectlibrary.prepare("tree.glb", raw)

    def test_prepare_then_import_retains_the_original_and_explicit_model_properties(self):
        raw, prepared = self.prepare()
        self.assertEqual([], objectlibrary.listing()["items"])
        self.assertEqual([10, 4, -4], prepared["geometry"]["anchor"])
        settings = {"token": prepared["token"], "filename": "tree.glb", "name": "My tree", "category": "tree", "tags": ["own"]}
        result = objectlibrary.add(settings)
        asset = result["model"]
        self.assertFalse(result["duplicate"])
        self.assertEqual(1, asset["schema"])
        self.assertEqual("none", asset["collision"])
        self.assertEqual(1, asset["metres_per_unit"])
        self.assertEqual([10, 4, -4], asset["anchor"])
        folder = Path(self.temporary.name, "library/objects", asset["id"])
        self.assertEqual(raw, (folder / "original/model.glb").read_bytes())
        self.assertNotIn(self.temporary.name, json.dumps(asset))
        again = objectlibrary.add({**settings, "name": "A different display name"})
        self.assertTrue(again["duplicate"])
        self.assertEqual(asset["id"], again["model"]["id"])
        changed = objectlibrary.add({**settings, "metres_per_unit": .01, "anchor": [0, 0, 0], "collision": "mesh"})["model"]
        self.assertNotEqual(asset["id"], changed["id"])
        shutil.rmtree(Path(self.temporary.name, "cache"))
        self.assertEqual(raw, objectlibrary.original(asset["id"]))
        self.assertEqual("My tree", objectlibrary.listing(query="my", category="tree")["items"][0]["name"])

    def test_invalid_or_missing_imports_cannot_publish_a_model(self):
        _raw, prepared = self.prepare()
        settings = {"token": prepared["token"], "filename": "tree.glb", "name": "Tree", "category": "tree"}
        for extra in ({"collision": "automatic"}, {"metres_per_unit": 0}, {"metres_per_unit": float("nan")},
                      {"anchor": [0, float("inf"), 0]}, {"filename": "../tree.glb"}):
            with self.subTest(extra=extra), self.assertRaises(ValueError):
                objectlibrary.add({**settings, **extra})
        shutil.rmtree(Path(self.temporary.name, "cache"))
        with self.assertRaisesRegex(ValueError, "again"):
            objectlibrary.add(settings)
        self.assertEqual([], objectlibrary.listing()["items"])

    def test_changed_originals_are_refused_even_after_a_valid_import(self):
        _raw, prepared = self.prepare()
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree", "category": "tree"})["model"]
        path = Path(self.temporary.name, "library/objects", asset["id"], "original/model.glb")
        path.write_bytes(b"changed")
        with self.assertRaisesRegex(ValueError, "changed"):
            objectlibrary.original(asset["id"])


if __name__ == "__main__":
    unittest.main()
