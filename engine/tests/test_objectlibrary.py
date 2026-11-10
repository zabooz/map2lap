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

    def test_remove_deletes_only_the_selected_package_and_is_idempotent(self):
        _raw, prepared = self.prepare()
        settings = {"token": prepared["token"], "filename": "tree.glb", "name": "Tree", "category": "tree"}
        tree, mesh = objectlibrary.add(settings)["model"], objectlibrary.add({**settings, "collision": "mesh"})["model"]
        self.assertTrue(objectlibrary.remove(tree["id"]))
        self.assertFalse(objectlibrary.remove(tree["id"]))
        self.assertEqual([mesh["id"]], [item["id"] for item in objectlibrary.listing()["items"]])
        with self.assertRaises(ValueError):
            objectlibrary.remove("../objects")

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

    def test_catalogue_categorizes_old_curated_packages_and_returns_actual_credits_without_rewriting_them(self):
        raw, prepared = self.prepare()
        settings = {'token': prepared['token'], 'filename': 'kenney-flower_purpleB.glb', 'name': 'Kenney - Flower Purple B',
                    'category': 'tree', 'source': 'https://kenney.nl/assets/nature-kit', 'license': 'CC0 1.0 Universal - Kenney',
                    'tags': ['CC0', 'Kenney', 'vegetation']}
        asset = objectlibrary.add(settings)['model']
        path = objectlibrary._folder(asset['id']) / 'asset.json'
        before = path.read_bytes()
        result = objectlibrary.listing(category='flower')
        self.assertEqual(1, result['total'])
        item = result['items'][0]
        self.assertEqual('Kenney', item['creator'])
        self.assertEqual(settings['source'], item['source_url'])
        self.assertEqual(settings['license'], item['license'])
        self.assertEqual('flower', item['category'])
        self.assertIn('bush', result['categories'])
        self.assertIn('grass', result['categories'])
        self.assertIn('rock', result['categories'])
        self.assertEqual(before, path.read_bytes())
        self.assertEqual(raw, objectlibrary.original(asset['id']))
        self.assertEqual('tree', objectlibrary.get(asset['id'])['category'])
        self.assertEqual(1, objectlibrary.listing(query='Kenney')['total'])

    def test_curated_taxonomy_and_explicit_categories_cover_the_existing_collection(self):
        families = {'kenney-plant_bushDetailed.glb': 'bush', 'kenney-grass_leafsLarge.glb': 'grass',
                    'kenney-flower_purpleB.glb': 'flower', 'kenney-cactus_tall.glb': 'plant',
                    'quaternius-Rock_Medium_1.glb': 'rock', 'quaternius-CommonTree_1.glb': 'tree',
                    'quaternius-Pine_4.glb': 'tree', 'quaternius-Bush_Common_Flowers.glb': 'bush',
                    'fern_02.glb': 'plant', 'picnic_table_1k.glb': 'prop'}
        for filename, expected in families.items():
            with self.subTest(filename=filename):
                source = 'https://quaternius.com/packs/stylizednaturemegakit.html' if filename.startswith('quaternius') else \
                    'https://kenney.nl/assets/nature-kit' if filename.startswith('kenney') else 'https://polyhaven.com/a/fern_02'
                asset = {'model': {'filename': filename}, 'category': 'tree', 'tags': ['CC0'], 'source_url': source}
                self.assertEqual(expected, objectlibrary.catalogue_category(asset))
                self.assertEqual('other', objectlibrary.catalogue_category({**asset, 'source_url': 'https://example.org', 'category': 'other'}))
        _raw, prepared = self.prepare()
        for category in ('bush', 'grass', 'flower', 'plant', 'rock', 'prop'):
            with self.subTest(category=category):
                asset = objectlibrary.add({'token': prepared['token'], 'filename': 'own.glb', 'name': 'Own', 'category': category})['model']
                self.assertEqual(category, asset['category'])


if __name__ == "__main__":
    unittest.main()
