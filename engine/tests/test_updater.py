"""updater.drop_old: an update from 0.5.5 left its vendor/ beside the new engine/; a release folder drops it at start."""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src"))
from app import updater  # noqa: E402


def folder(root, *names):
    for n in names:
        os.makedirs(os.path.dirname(os.path.join(root, n)), exist_ok=True)
        open(os.path.join(root, n), "w").close()


class DropOldTest(unittest.TestCase):
    def test_a_release_drops_vendor_once_engine_is_there(self):
        with tempfile.TemporaryDirectory() as d:
            folder(d, updater.PYTHON, "engine/generator.py", "vendor/beamng_earth/server/generator.py")
            self.assertEqual(updater.drop_old(d), ["vendor"])
            self.assertFalse(os.path.exists(os.path.join(d, "vendor")))
            self.assertTrue(os.path.isfile(os.path.join(d, "engine", "generator.py")))

    def test_vendor_stays_without_engine(self):
        with tempfile.TemporaryDirectory() as d:
            folder(d, updater.PYTHON, "vendor/beamng_earth/server/generator.py")
            self.assertEqual(updater.drop_old(d), [])
            self.assertTrue(os.path.isdir(os.path.join(d, "vendor")))

    def test_a_developer_folder_keeps_everything(self):
        with tempfile.TemporaryDirectory() as d:
            folder(d, updater.PYTHON, ".git/HEAD", "engine/generator.py", "vendor/x.py")
            self.assertEqual(updater.drop_old(d), [])
            self.assertTrue(os.path.isdir(os.path.join(d, "vendor")))


if __name__ == "__main__":
    unittest.main()
