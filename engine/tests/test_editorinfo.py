"""Build metadata keeps the painted ground and source facts independently of the finished texture."""
import base64
import io
import json
import os
import sys
import tempfile
import unittest
from unittest import mock
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import editorinfo  # noqa: E402


class GroundInfoTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.kn5 = self.root / "track.kn5"
        self.kn5.write_bytes(b"unchanged geometry")

    def tile(self, tx=0, base=None):
        path = self.root / f"t_{tx}_0.obj"
        paint = editorinfo.Paint(str(path), tx, 0, 8)
        paint.base(["gc_meadow", "gc_sand"], np.zeros((8, 8), np.uint8) if base is None else base)
        return path, paint

    def install(self, *parts):
        editorinfo.install(str(self.kn5), list(map(str, parts)))

    def test_a_click_uses_actual_layers_and_keeps_the_soft_edge(self):
        part, paint = self.tile()
        alpha = np.zeros((8, 8), np.uint8)
        alpha[:, 3:5], alpha[:, 2] = 255, 100
        paint.layer("road_asphalt", alpha, repeat=4.0, brightness=1.06)
        paint.finish(features=[{"id": "road:123", "kind": "road", "line": [[0, 0], [256, 0]], "width": 7.0}])
        self.install(part)
        result = editorinfo.select(str(self.kn5), 0, 0, 3 / 8, 0.5)
        self.assertEqual("road_asphalt", result["material"])
        mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(result["tiles"][0]["mask"]))))
        np.testing.assert_array_equal(alpha, mask)
        with zipfile.ZipFile(editorinfo.side_file(str(part))) as z:
            data = json.loads(z.read("tile.json"))
        self.assertEqual(1.06, data["layers"][0]["brightness"])
        self.assertEqual("road:123", data["features"][0]["id"])
        self.assertEqual(b"unchanged geometry", self.kn5.read_bytes())

    def test_a_road_separates_two_meadows_and_the_selection_crosses_tile_edges(self):
        parts = []
        for tx in (0, 1):
            part, paint = self.tile(tx)
            alpha = np.zeros((8, 8), np.uint8)
            alpha[4, :] = 255
            paint.layer("road_asphalt", alpha)
            paint.finish()
            parts.append(part)
        self.install(*parts)
        with mock.patch.object(editorinfo, "_weight", wraps=editorinfo._weight) as decoded:
            result = editorinfo.select(str(self.kn5), 0, 0, 0.5, 0.8)  # north of the road: UV v points north
        self.assertEqual(2, decoded.call_count)  # revisiting an already selected edge must not decode every layer again
        self.assertEqual("gc_meadow", result["material"])
        self.assertEqual(2, len(result["tiles"]))
        for tile in result["tiles"]:
            mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(tile["mask"]))))
            self.assertTrue((mask[:4] == 255).all())
            self.assertTrue((mask[4:] == 0).all())

    def test_overlapping_paint_of_one_material_adds_its_actual_contribution(self):
        part, paint = self.tile()
        paint.layer("gc_rock", np.full((8, 8), 120, np.uint8))
        paint.layer("gc_rock", np.full((8, 8), 120, np.uint8))
        paint.finish()
        self.install(part)
        result = editorinfo.select(str(self.kn5), 0, 0, 0.5, 0.5)
        self.assertEqual("gc_rock", result["material"])
        mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(result["tiles"][0]["mask"]))))
        self.assertTrue((mask == 184).all())

    def test_repeated_surface_queries_reuse_weights_but_a_new_archive_invalidates_them(self):
        part, paint = self.tile()
        paint.finish()
        self.install(part)
        folder = str(self.root / editorinfo.FOLDER)
        with mock.patch.object(editorinfo, "_read", wraps=editorinfo._read) as reads:
            first = editorinfo._weight(folder, "0_0", "gc_meadow")
            second = editorinfo._weight(folder, "0_0", "gc_meadow")
            np.testing.assert_array_equal(first, second)
            self.assertEqual(1, reads.call_count)
        part, paint = self.tile(base=np.ones((8, 8), np.uint8))
        paint.finish()
        self.install(part)
        self.assertTrue((editorinfo._weight(folder, "0_0", "gc_meadow") == 0).all())

    def test_old_or_rebuilt_tracks_do_not_guess_from_their_colours(self):
        self.assertIsNone(editorinfo.manifest(str(self.kn5)))
        part, paint = self.tile()
        paint.finish()
        self.install(part)
        self.assertIsNotNone(editorinfo.manifest(str(self.kn5)))
        self.kn5.write_bytes(b"a different build")
        self.assertIsNone(editorinfo.manifest(str(self.kn5)))

    def test_source_and_saved_track_keep_valid_ground_metadata(self):
        part, paint = self.tile()
        paint.finish()
        self.install(part)
        for target in (self.root / "source" / "track.kn5", self.root / "copy" / "copy.kn5"):
            target.parent.mkdir()
            target.write_bytes(b"saved geometry of another size")
            editorinfo.copy(str(self.kn5), str(target))
            self.assertIsNotNone(editorinfo.manifest(str(target)))
            self.assertEqual("gc_meadow", editorinfo.select(str(target), 0, 0, 0.5, 0.5)["material"])


if __name__ == "__main__":
    unittest.main()
