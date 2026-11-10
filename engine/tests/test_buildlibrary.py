"""The shipped library is built from a curated one: every shown CC0 object at the chosen geometry level, every texture as it is,
nothing else."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
from test_materiallibrary import image_bytes
from test_modelsimplify import panel
from app import materiallibrary, modeldata, objectlibrary
import build_library


class BuildLibraryTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        for module in (materiallibrary, objectlibrary):
            patch = mock.patch.object(module, "ROOT", self.temporary.name)
            patch.start()
            self.addCleanup(patch.stop)

    def model(self, **settings):
        prepared = objectlibrary.prepare("house.glb", panel())
        return objectlibrary.add({"token": prepared["token"], "filename": "house.glb", "name": "House", "category": "building",
                                  "source": "https://kenney.nl/assets/city-kit", "license": "CC0 1.0 Universal - Kenney", **settings})["model"]

    def test_shown_cc0_objects_at_the_level_and_the_textures_as_they_are_and_nothing_else(self):
        shown = self.model(metres_per_unit=2)
        old = self.model()
        objectlibrary.supersede(old["id"], shown["id"])
        unlicensed = self.model(license="", collision="mesh")
        prepared = materiallibrary.prepare("meadow.png", image_bytes())
        material = materiallibrary.add({"token": prepared["token"], "filename": "meadow.png", "name": "Meadow", "category": "grass",
                                        "repeat": [2, 1]})["material"]
        report = build_library.build(self.temporary.name, 25)
        objects = Path(self.temporary.name, "assets/library/objects")
        built = [path.name for path in objects.iterdir()]
        self.assertEqual(1, len(built))
        self.assertEqual({"skipped": {old["id"]: "hidden", unlicensed["id"]: "no CC0 licence"}}, {"skipped": report["skipped"]})
        asset = json.loads((objects / built[0] / "asset.json").read_text(encoding="utf-8"))
        self.assertEqual(built[0], asset["id"])
        self.assertNotEqual(shown["id"], asset["id"])
        for key in ("name", "category", "metres_per_unit", "anchor", "collision", "license", "source_url"):
            self.assertEqual(shown[key], asset[key], key)
        self.assertEqual(25, asset["simplify_level"])
        self.assertNotIn("source", asset)
        self.assertEqual(["asset.json", "original"], sorted(p.name for p in (objects / built[0]).iterdir()))
        model = modeldata.load((objects / built[0] / "original/model.glb").read_bytes())
        self.assertLessEqual(asset["geometry"]["triangles"], shown["geometry"]["triangles"] * .25)
        self.assertEqual(shown["geometry"]["bounds"], model.bounds)
        self.assertEqual(asset["model"]["sha256"], report["built"][shown["id"]]["sha256"])
        # (what the Editor then shows, with the curated library gone: only the built package and the texture)
        Path(self.temporary.name, "library").rename(Path(self.temporary.name, "curated"))
        self.assertEqual([asset["id"]], [item["id"] for item in objectlibrary.listing()["items"]])
        self.assertEqual(asset, objectlibrary.get(asset["id"]))
        self.assertEqual([material["id"]], [item["id"] for item in materiallibrary.listing()["items"]])
        self.assertEqual(material, materiallibrary.get(material["id"]))


if __name__ == "__main__":
    unittest.main()
