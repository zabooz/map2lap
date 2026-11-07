"""Editor facts survive the build's mesh merging; the painted RGB and physics stay unchanged."""
import io
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest import mock
from types import SimpleNamespace

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: E402,F401
import roads  # noqa: E402
from scenery import ground  # noqa: E402
from track import editorinfo, make_obj, objectlist  # noqa: E402
from buildings.build import _listed  # noqa: E402


class BuildFactsTest(unittest.TestCase):
    def test_generated_building_dimensions_and_footprint_are_kept(self):
        spec = SimpleNamespace(ring=np.array([[0, 0], [4, 0], [4, 6], [0, 6]]), cls="house", height=9.0, roof="hipped", floors=3)
        item = _listed(7, (spec, 12.0, 12.0), 0, [])
        self.assertEqual(9.0, item["details"]["parameters"]["height"])
        self.assertEqual(spec.ring.tolist(), item["details"]["footprint"])

    def test_mesh_output_keeps_road_and_marking_descriptions(self):
        with tempfile.TemporaryDirectory() as folder:
            chunks = [{"fid": "source-road", "n": [[0, 0, 0], [20, 0, 0]], "w": 7.0, "m": "asphalt"}]
            with mock.patch("roadmesh.write"), mock.patch("roads.build.sound_boxes", return_value=[]):
                roads.write_tile(folder, "", 1, 0, 0, chunks, road_mesh=object())
            data = json.loads((Path(folder) / "roads_1_0_0.json").read_text())
            self.assertEqual([], data["chunks"])  # existing game-facing output stays as it was
            self.assertEqual(chunks, data["editor"]["chunks"])

    def test_original_asset_parameters_survive_the_kn5_object_list(self):
        listed = objectlist.TileList()
        row = [0, 5, 7, 2, 35, 1.2, 0.8, 2.0]
        mesh = (np.array([[5, 7, 2], [6, 7, 2], [5, 8, 2]]), np.zeros((3, 2)), np.array([[0, 1, 2]]))
        make_obj._props_listed(listed, ["bench"], [row], [(0, 0, 0)], mesh, None, {})
        with tempfile.TemporaryDirectory() as folder:
            part = str(Path(folder) / "t_0_0.obj")
            listed.note("nocol_props_0_0", [0])
            listed.save(part)
            entry = objectlist.chunk_objects(part, {"nocol_props_0_0": [(2, 1)]})["t_0_0"]
        self.assertEqual("bench", entry["details"][0]["asset"])
        self.assertEqual(row[4:], entry["details"][0]["parameters"])

    def test_paint_capture_reuses_the_actual_road_mask_without_changing_rgb(self):
        with tempfile.TemporaryDirectory() as folder:
            paint = editorinfo.Paint(str(Path(folder) / "t_0_0.obj"), 0, 0, 8)
            paint.base(["gc_meadow"], np.zeros((8, 8), np.uint8))
            img = np.full((8, 8, 3), 60.0, np.float32)
            segs, widths = np.array([[0, 4, 8, 4]], np.float64), np.array([1.0])
            look = np.array([list(ground.ROAD_LOOKS).index("main")], np.uint8)
            wx, wy = np.meshgrid(np.arange(8), np.arange(8))
            with mock.patch.object(ground, "TEX_PX", 8), mock.patch.object(ground, "_texture", return_value=np.full((4, 4, 3), 100, np.uint8)):
                expected = img.copy()
                ground._paint_looks(expected, segs, widths, look, wx, wy, 1.0, folder, False)
                ground._paint_looks(img, segs, widths, look, wx, wy, 1.0, folder, False, paint=paint)
            paint.finish()
            np.testing.assert_array_equal(expected, img)
            with zipfile.ZipFile(paint.path) as z:
                data = json.loads(z.read("tile.json"))
                self.assertEqual("road_asphalt", data["layers"][0]["material"])
                self.assertEqual(4.0, data["layers"][0]["repeat"])
                self.assertGreater(len(z.read(data["layers"][0]["mask"])), 0)


if __name__ == "__main__":
    unittest.main()
