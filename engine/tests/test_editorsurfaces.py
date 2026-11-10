"""Ground selection uses the served source and survives Save, copies and loss of build files."""
import os
import unittest

import numpy as np

from test_trackcopy import Base
from app import trackcopies, trackcopy, tracksource, trackview
from track import editorinfo, kn5, objectlist


class SurfaceSourceTest(Base):
    def setUp(self):
        super().setUp()
        part = os.path.join(self.ac, "t_0_0.obj")
        paint = editorinfo.Paint(part, 0, 0, 8)
        paint.base(["gc_meadow"], np.zeros((8, 8), np.uint8))
        paint.finish()
        editorinfo.install(self.kn5, [part])

    def select(self, name="t"):
        revision = trackview.index(self.ac, name)["revision"]
        return trackview.surface(self.ac, name, 0, 0.5, -0.5, revision)

    def test_copy_keeps_original_asset_metadata_for_later_replacement(self):
        self.objects["t_0_0"]["details"] = [{"asset": "car", "parameters": [35.0, 1.2]}] + [{}] * 5
        objectlist.write(self.kn5, self.objects)
        copy = {"id": "copy_" + "a" * 24, "parts": [{"source": "t_0_0#0", "parent": -1, "matrix": trackcopies.IDENTITY}]}
        _scan, objects = trackcopies.build(self.kn5, kn5.scan(self.kn5), self.objects, [copy])
        self.assertEqual(self.objects["t_0_0"]["details"][0], objects[copy["id"]]["details"][0])

    def test_the_index_says_how_many_sections_a_first_opening_computes(self):
        from unittest import mock
        from track import surfaceindex
        with mock.patch.object(surfaceindex, "CACHE_ROOT", os.path.join(self.ac, "selection")):
            self.assertEqual(1, trackview.index(self.ac, "t")["surface_unprepared"])
            surfaceindex.prepare(self.kn5)
            self.assertEqual(0, trackview.index(self.ac, "t")["surface_unprepared"])

    def test_select_needs_the_served_revision_and_a_ground_mesh(self):
        self.assertEqual("gc_meadow", self.select()["material"])
        with self.assertRaises(trackview.Unreadable):
            trackview.surface(self.ac, "t", 0, 0.5, -0.5, "an old build")
        with self.assertRaises(ValueError):
            trackview.surface(self.ac, "t", 1, 0.5, -0.5, trackview.index(self.ac, "t")["revision"])

    def test_first_overwrite_preserves_facts_in_the_source_and_the_written_track(self):
        self.edits(["t_0_0#0"])
        trackcopy.save(self.ac, "t")
        source = trackview.recipe(self.ac, "t")["source"]
        self.assertIsNotNone(editorinfo.manifest(tracksource.kn5_of(source)))
        self.assertIsNotNone(editorinfo.manifest(self.kn5))
        self.assertEqual("gc_meadow", self.select()["material"])

    def test_save_as_new_keeps_facts_through_the_second_save(self):
        trackcopy.save(self.ac, "t", copy_to="copy", title="Copy")
        self.assertEqual("gc_meadow", self.select("copy")["material"])
        target = os.path.join(self.ac, "content", "tracks", "copy", "copy.kn5")
        self.assertIsNotNone(editorinfo.manifest(target))
        trackcopy.save(self.ac, "copy")
        self.assertEqual("gc_meadow", self.select("copy")["material"])


if __name__ == "__main__":
    unittest.main()
