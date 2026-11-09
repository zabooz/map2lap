"""Selection and appearance inspect existing pixels without repeating full-tile work."""
import base64
import struct
import unittest
from unittest import mock

import numpy as np

import test_trackdetail as fixture
from app import trackdetail, trackinspect
from track import editorinfo, surfaceindex


class AppearanceWorkTest(unittest.TestCase):
    setUp = fixture.DetailTest.setUp
    material = fixture.DetailTest.material
    operation = fixture.DetailTest.operation
    keep = fixture.DetailTest.keep
    detail_asset = fixture.DetailTest.detail_asset

    def test_cached_simple_appearance_never_reads_the_entire_dds(self):
        descriptor = self.keep([self.operation(self.detail_asset())])["textures"][0]
        version = descriptor["version"]
        trackdetail.mask(self.ac, self.name, version)
        with mock.patch.object(trackdetail, "mask", side_effect=AssertionError("read the full DDS for one point")):
            info = trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, version)
            original = trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision, version)
        self.assertEqual("Fine detail", info["name"])
        self.assertTrue(original["original"])

    def test_regional_appearance_samples_existing_atlas_without_recomposing_the_tile(self):
        descriptor = self.keep([self.operation(self.detail_asset())])["textures"][0]
        layout = {**descriptor["layers"], "ground": {"dimensions": [4, 4], "passes": [
            {"image": 0, "first": 0, "bounds": [0, 0, 1, 1],
             "frames": [{"source": [0, 0], "atlas": [0, 0, 4, 4]}], "weight": {"key": "a" * 64}}]}}
        field = np.zeros((4, 4), "<f2")
        field[:, :2] = 1
        raw = struct.pack("<4sII", b"M2GW", 4, 4) + field.tobytes()
        with mock.patch.object(trackdetail, "describe", return_value=layout), \
             mock.patch.object(trackdetail, "region_image", return_value=raw) as read, \
             mock.patch.object(trackdetail, "_semantic", side_effect=AssertionError("recomputed all material weights")):
            applied = trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, descriptor["version"])
            original = trackinspect.appearance(self.ac, self.name, 0, .8, -.5, self.revision, descriptor["version"])
        self.assertEqual("Fine detail", applied["name"])
        self.assertTrue(original["original"])
        self.assertEqual(2, read.call_count)


class SelectionMergeWorkTest(unittest.TestCase):
    def test_single_selection_keeps_exact_encoded_masks_without_decoding_them_again(self):
        mask = base64.b64encode(editorinfo._png(np.full((8, 8), 127, np.uint8))).decode("ascii")
        selected = {"material": "gc_meadow", "truncated": True, "tiles": [{"tile": [0, 0], "mask": mask}]}
        with mock.patch.object(surfaceindex.Image, "open", side_effect=AssertionError("decoded the same selection twice")):
            result = surfaceindex.merge([selected])
        self.assertEqual(["gc_meadow"], result["materials"])
        self.assertEqual(selected["tiles"], result["tiles"])
        self.assertTrue(result["truncated"])


if __name__ == "__main__":
    unittest.main()
