"""Distant terrain colours with in-memory map and elevation inputs."""
import sys
import unittest
from pathlib import Path
from unittest import mock

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from scenery import farview


class FarColoursTest(unittest.TestCase):
    def test_class_colours(self):
        colours = {name: (code, 2, 3) for code, name in farview.groundcover.CLASS_MAT.items()}
        del colours["gc_shrub"]
        lut = farview._class_colours(colours)
        for code, name in farview.groundcover.CLASS_MAT.items():
            with self.subTest(code=code):
                np.testing.assert_array_equal(lut[code], colours.get(name, colours["gc_meadow"]))
        np.testing.assert_array_equal(lut[80], farview.WATER)
        np.testing.assert_array_equal(lut[255], colours["gc_meadow"])

    def test_overview_for_texel(self):
        for metres, expected in ((8, 0), (31, 1), (125, 3), (320, 5), (2000, 5)):
            with self.subTest(metres=metres):
                self.assertEqual(farview._overview_for_texel(metres), expected)

    def test_worldcover_failure_preserves_near_land_use_on_palette(self):
        md = mock.Mock()
        md.rasters.worldcover_box.side_effect = OSError("offline")
        colours = {"gc_meadow": (1, 2, 3), "gc_urban": (200, 100, 50)}
        palette = np.asarray(farview.palette())
        state = {"md": md, "pal": palette, "colors": colours,
                 "classes": np.zeros((256, 3)), "boxes": farview._boxes({(-1, 0)}), "core": {(-1, 0)}}
        elev = np.full((farview.HEIGHT_GRID, farview.HEIGHT_GRID), 500.0)
        mapped = np.array([["gc_urban", ""], ["", ""]])
        with (
            mock.patch.dict(farview._w, state, clear=True),
            mock.patch.object(farview, "TEX_PX", 16),
            mock.patch.object(farview.heightmap, "surface", return_value=(elev, None)),
            mock.patch.object(farview.groundcover, "landuse", return_value=mapped),
            mock.patch.object(farview.groundcover, "land", return_value=None),
            mock.patch.object(farview.groundcover, "macro", return_value=1),
            mock.patch.object(Image.Image, "save", autospec=True) as save,
        ):
            ok, messages = farview._texture(47, 12, 3, 0, 0, True, "near.jpg")
            self.assertTrue(ok)
            self.assertEqual(len(messages), 1)
            save.assert_called_once()
            img = np.asarray(save.call_args.args[0])
            np.testing.assert_array_equal(img[-1, 0], colours["gc_urban"])
            u = farview.farfield.u_from_elev(500)
            np.testing.assert_array_equal(img[-1, 1], palette[len(palette) // 2, int(u * palette.shape[1])])

    def test_worldcover_failure_leaves_outer_square_on_far_material(self):
        md = mock.Mock()
        md.rasters.worldcover_box.side_effect = OSError("offline")
        with mock.patch.dict(farview._w, {"md": md}, clear=True), mock.patch.object(Image.Image, "save") as save:
            ok, messages = farview._texture(47, 12, 4, 0, 0, False, "far.jpg")
            self.assertFalse(ok)
            self.assertEqual(len(messages), 1)
            save.assert_not_called()
