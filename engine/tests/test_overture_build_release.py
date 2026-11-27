"""One compatible Overture release per build, across workers, caches and saved metadata."""
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "src"), str(ROOT / "engine")]
import generator
import mapdata
import overture
import overturebuild as release
import revisit

NEW = "2027-01-20.0"
OLD = "2026-12-16.0"


class BuildReleaseTest(unittest.TestCase):
    def catalog(self, name):
        if name == "catalog.json":
            return {"latest": NEW, "links": [{"rel": "child", "href": f"./{r}/catalog.json"} for r in (OLD, NEW)]}
        r = name.split("/")[0]
        return {"release:version": r, "schema:version": "2.0.0"}

    def test_build_uses_selected_release_in_workers_metadata_and_revisit_cache(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(release, "_catalog", side_effect=self.catalog):
            before = dict(os.environ)
            with release.for_build(folder, lambda message: None) as version:
                self.assertEqual(version, NEW)
                self.assertEqual(generator.data_versions()["overture"], NEW)
                with patch.object(mapdata.overture, "Reader", wraps=overture.Reader) as reader:
                    md = mapdata.MapData(folder)
                    try:
                        self.assertEqual(md.release, NEW)
                        self.assertEqual(reader.call_args.args[2], NEW)
                        self.assertIn(NEW, md.path(mapdata.mapcells.CellKey(14, 1, 1), "roads"))
                    finally:
                        md.close()
                key = revisit.code_key()
                self.assertEqual(os.environ[release.ENV], NEW)
            self.assertEqual(os.environ.get(release.ENV), before.get(release.ENV))
            with release.using(OLD):
                self.assertNotEqual(key, revisit.code_key())
            with patch.object(release, "_catalog", side_effect=OSError("offline")):
                self.assertEqual(release.choose(folder)[0], NEW)

    def test_failed_build_does_not_promote_release_for_offline_use(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(release, "_catalog", side_effect=self.catalog):
            with self.assertRaises(RuntimeError), release.for_build(folder, lambda message: None):
                raise RuntimeError("missing road data")
            with patch.object(release, "_catalog", side_effect=OSError("offline")):
                self.assertEqual(release.choose(folder)[0], overture.RELEASE)

    def test_uses_previous_published_compatible_release_or_refuses_before_build(self):
        def changed(name):
            data = self.catalog(name)
            if name.startswith(NEW):
                data["schema:version"] = "3.0.0"
            return data
        with tempfile.TemporaryDirectory() as folder, patch.object(release, "_catalog", side_effect=changed):
            self.assertEqual(release.choose(folder)[0], OLD)
            with patch.object(release, "_catalog", side_effect=lambda name: {**changed(name), "schema:version": "3.0.0"}):
                with self.assertRaisesRegex(RuntimeError, "compatible"):
                    release.choose(folder)
