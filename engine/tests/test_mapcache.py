"""Build-cache limits and Clear leave Editor imports, prepared textures and saved track data alone."""
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: E402,F401  (sets the engine import path)
from app import mapcache  # noqa: E402


EDITOR_FOLDERS = ("track-details", "native-masks", "native-library", "track-textures", "materials", "models", "builtin-objects", "editor")


class CacheSeparationTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.project, self.root = Path(tmp.name), Path(tmp.name, "cache")
        self.root.mkdir()

    def file(self, name, size=20):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"x" * size)
        os.utime(path, (1, 1))
        return path

    def editor_files(self):
        return [self.file(f"{name}/nested/prepared", 1000) for name in EDITOR_FOLDERS]

    def test_usage_counts_only_build_data_and_never_enters_editor_folders(self):
        self.editor_files()
        self.file("mapdata/a", 20)
        self.file("dem/a", 30)
        # Classification applies to top-level owners, not a similarly named subfolder in build data.
        self.file("mapdata/models/a", 40)
        scan = os.scandir
        protected = {str(self.root / name) for name in EDITOR_FOLDERS}

        def checked(path):
            self.assertNotIn(os.fspath(path), protected, "Build cache must not scan Editor data")
            return scan(path)

        with mock.patch("os.scandir", side_effect=checked):
            self.assertEqual((90, 3), mapcache.usage(self.root))

    def test_editor_data_cannot_push_build_files_over_the_limit(self):
        editor = self.editor_files()
        build = self.file("mapdata/old", 20)
        self.assertEqual(20, mapcache.trim(100 / 1e9, self.root, log=lambda _: None))
        self.assertTrue(build.is_file())
        self.assertTrue(all(p.read_bytes() == b"x" * 1000 for p in editor))

    def test_a_real_build_overflow_only_evicts_build_files(self):
        editor = self.editor_files()
        old = self.file("mapdata/old", 200)
        self.assertEqual(0, mapcache.trim(100 / 1e9, self.root, log=lambda _: None))
        self.assertFalse(old.exists())
        self.assertTrue(all(p.is_file() for p in editor))

    def test_clear_keeps_editor_data_protected_build_files_and_track_metadata(self):
        editor = self.editor_files()
        self.file("mapdata/old", 200)
        protected = self.file("netstats/budget", 10)
        track = self.project / "content/tracks/test/data"
        track.mkdir(parents=True)
        objects = track / "map2lap_objects.json"
        objects.write_text('{"objects":{}}')
        self.assertEqual(200, mapcache.clear(self.root))
        self.assertEqual((10, 1), mapcache.usage(self.root))
        self.assertTrue(protected.is_file())
        self.assertTrue(all(p.is_file() for p in editor))
        self.assertEqual('{"objects":{}}', objects.read_text())


if __name__ == "__main__":
    unittest.main()
