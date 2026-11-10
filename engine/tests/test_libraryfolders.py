"""The library a release ships (assets/library/) and the user's own imports (library/) read as one; an update replaces only the
first, a deletion hides a shipped package instead of losing it at the next update."""
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest import mock

from test_materiallibrary import image_bytes
from test_modeldata import encode, fixture
from app import materiallibrary, objectlibrary


class LibraryFoldersTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        for module in (materiallibrary, objectlibrary):
            patch = mock.patch.object(module, "ROOT", self.temporary.name)
            patch.start()
            self.addCleanup(patch.stop)

    def ship(self, kind, id):
        """Move an imported package from the user's library into the shipped one, as a release brings it."""
        shipped = Path(self.temporary.name, "assets/library", kind, id)
        shipped.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(Path(self.temporary.name, "library", kind, id), shipped)
        return shipped

    def model(self, **settings):
        prepared = objectlibrary.prepare("tree.glb", encode(*fixture()))
        return objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree", "category": "tree", **settings})

    def material(self, colour=(30, 160, 40)):
        prepared = materiallibrary.prepare("meadow.png", image_bytes(colour=colour))
        return materiallibrary.add({"token": prepared["token"], "filename": "meadow.png", "name": "Meadow", "category": "grass",
                                    "repeat": [2, 1]})

    def test_a_shipped_model_is_listed_read_and_not_copied_again_and_a_deletion_hides_it(self):
        asset = self.model()["model"]
        shipped = self.ship("objects", asset["id"])
        raw = (shipped / "original/model.glb").read_bytes()
        own = self.model(collision="mesh")["model"]
        self.assertEqual({asset["id"], own["id"]}, {item["id"] for item in objectlibrary.listing()["items"]})
        self.assertEqual(asset, objectlibrary.get(asset["id"]))
        self.assertEqual(raw, objectlibrary.original(asset["id"]))
        self.assertTrue(objectlibrary.cost(asset["id"]))
        # (importing what is shipped again finds it there: nothing lands in library/)
        self.assertTrue(self.model()["duplicate"])
        self.assertFalse(Path(self.temporary.name, "library/objects", asset["id"]).exists())
        self.assertTrue(objectlibrary.remove(asset["id"]))
        self.assertFalse(objectlibrary.remove(asset["id"]))
        self.assertEqual([own["id"]], [item["id"] for item in objectlibrary.listing()["items"]])
        self.assertEqual(raw, (shipped / "original/model.glb").read_bytes())
        # (an own import is deleted for good, in library/ only)
        self.assertTrue(objectlibrary.remove(own["id"]))
        self.assertFalse(Path(self.temporary.name, "library/objects", own["id"]).exists())
        self.assertEqual([], objectlibrary.listing()["items"])

    def test_a_shipped_texture_is_listed_read_and_not_copied_again_and_a_deletion_hides_it(self):
        material = self.material()["material"]
        shipped = self.ship("materials", material["id"])
        own = self.material(colour=(200, 40, 40))["material"]
        self.assertEqual({material["id"], own["id"]}, {item["id"] for item in materiallibrary.listing()["items"]})
        self.assertEqual(material, materiallibrary.get(material["id"]))
        self.assertEqual((shipped / "preview.png").read_bytes(), materiallibrary.preview(material["id"]))
        self.assertTrue(materiallibrary.original(material["id"], "colour"))
        self.assertTrue(self.material()["duplicate"])
        self.assertFalse(Path(self.temporary.name, "library/materials", material["id"]).exists())
        self.assertTrue(materiallibrary.remove(material["id"]))
        self.assertFalse(materiallibrary.remove(material["id"]))
        self.assertEqual([own["id"]], [item["id"] for item in materiallibrary.listing()["items"]])
        self.assertTrue(shipped.is_dir())


if __name__ == "__main__":
    unittest.main()
