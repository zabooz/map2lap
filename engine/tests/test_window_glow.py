"""Windows lit at night: a mask drawn with the facades says which panes glow, CSP lights the houses through it."""
import os
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
import fast  # noqa: E402
from buildings import looks  # noqa: E402
from scenery import facades  # noqa: E402
from track import make_track_folder  # noqa: E402

WALL = (150, 150, 150)
GLASS = {facades.GLASS, facades.GLASS_HI}


def glow(kind="fac", level=0):
    return np.asarray(facades.window_glow(kind, level)) > 127


def colours(image, mask):
    """The set of colours of an RGB image where mask is True."""
    return {tuple(c) for c in np.asarray(image.convert("RGB"))[mask].tolist()}


def plaster():
    return Image.new("RGB", (facades.PX, facades.PX), WALL)


class MaskTest(unittest.TestCase):
    def test_only_glass_glows_on_a_house(self):
        self.assertLessEqual(colours(facades.sheet(plaster(), (1.0, 1.0, 1.0), True), glow("fac")), GLASS)

    def test_the_frame_and_the_cross_stay_dark(self):
        image = np.asarray(facades.sheet(plaster(), (1.0, 1.0, 1.0), True))
        frame = (image == facades.FRAME).all(axis=2)
        self.assertTrue(frame.any())
        self.assertFalse((glow("fac") & frame).any())

    def test_a_window_is_lit_whole_or_not_at_all(self):
        mask = glow("fac")
        for x0, y0, x1, y1, _ in facades.sheet_windows():
            xm, ym = (x0 + x1) // 2, (y0 + y1) // 2
            panes = [mask[(y0 + ym) // 2, (x0 + xm) // 2], mask[(y0 + ym) // 2, (xm + x1) // 2],
                     mask[(ym + y1) // 2, (x0 + xm) // 2], mask[(ym + y1) // 2, (xm + x1) // 2]]
            self.assertEqual(1, len(set(map(bool, panes))))

    def test_about_one_window_in_five_is_lit(self):
        windows, lit = facades.sheet_windows(), 0
        for level in range(facades.GLOW_LEVELS):
            mask = glow("fac", level)
            lit += sum(bool(mask[(y0 + y1) // 4 + y0 // 2, (x0 + x1) // 4 + x0 // 2 + 4]) for x0, y0, x1, y1, _ in windows)
        self.assertAlmostEqual(0.2, lit / (len(windows) * facades.GLOW_LEVELS), delta=0.04)

    def test_every_band_of_five_has_one_lit(self):
        sash = [k for k, w in enumerate(facades.sheet_windows()) if w[1] == 548]
        for level in range(facades.GLOW_LEVELS):
            mask = glow("fac", level)
            self.assertEqual(1, sum(bool(mask[600, facades.sheet_windows()[k][0] + 20]) for k in sash))

    def test_houses_of_single_windows_light_at_some_brightness(self):
        x0, y0, x1, y1, _ = next(w for w in facades.sheet_windows() if w[1] == 548)     # (mesh.WIN_UV: the first sash window)
        self.assertTrue(any(glow("fac", level)[y0 + 40, x0 + 20] for level in range(facades.GLOW_LEVELS)))

    def test_each_brightness_has_its_own_pattern(self):
        self.assertTrue((glow("fac", 0) != glow("fac", 1)).any())
        self.assertTrue((glow("fac", 1) != glow("fac", 2)).any())

    def test_a_pattern_stays_the_same(self):
        self.assertTrue((glow("fac", 2) == glow("fac", 2)).all())

    def test_shop_windows_glow_on_their_glass(self):
        self.assertLessEqual(colours(facades.shopfront(plaster()), glow("shp")), GLASS)
        self.assertTrue(glow("shp").any())

    def test_an_office_glows_in_its_glass_bands_only(self):
        mask = glow("off")
        self.assertTrue(mask[:512].any())
        self.assertFalse(mask[512:].any())           # (the sheet's lower half is plain cladding)

    def test_an_office_s_frame_stays_dark(self):
        image = np.asarray(facades.curtain((1.0, 1.0, 1.0)))
        self.assertFalse((glow("off") & (image == (196, 200, 206)).all(axis=2)).any())


class EachWindowItsOwnTest(unittest.TestCase):
    """The floors of a wall share a band of the sheet. A wall drawn in one piece per floor would light whole columns."""

    def test_every_bay_of_a_band_can_be_picked(self):
        for band in (looks.BAND_TALL, looks.BAND_PANEL, looks.BAND_SASH, looks.BAND_BRICK, looks.BAND_OFFICE, looks.BAND_OFFICE2):
            self.assertEqual(tuple(range(band[1])), band[2])

    def test_windows_on_top_of_each_other_take_different_bays(self):
        ring = np.array([[0.0, 0.0], [24.0, 0.0], [24.0, 10.0], [0.0, 10.0]])
        band = looks.BAND_BRICK
        constants = [3.0, 12.0, 0.3, 4.0, 2.0, 2.0, 0.75, 0.3, 3.5, 0.03, 3.4, 0.05, 0.15, 0.27, 0.46, 1.05, 1.75, 0.85]
        _, uv, _ = fast._ef.building_walls(ring, 0.0, 12.0, False, False, band[0], band[1], list(band[2]), 4, 3.0, False, -1, 0.0, False,
                                           0.61803, False, -1, False, constants)
        lefts = np.asarray(uv).reshape(-1, 8)[:, 0]
        self.assertGreater(len(set(np.round(lefts % (1.0 / band[1]) + np.floor(lefts * band[1]), 3).tolist())), 2)


class CspTest(unittest.TestCase):
    def test_every_look_has_its_mask(self):
        with tempfile.TemporaryDirectory() as folder:
            facades.write_glow(folder)
            for kind in facades.GLOWING:
                for level in range(facades.GLOW_LEVELS):
                    self.assertTrue(os.path.exists(os.path.join(folder, facades.glow_file(kind, level))))

    def test_each_material_takes_its_own_mask(self):
        config = facades.night_config()
        for kind in facades.GLOWING:
            for level in range(facades.GLOW_LEVELS):
                self.assertIn(f"Materials = {kind}_?_{level}\n", config)
                self.assertIn(f"RESOURCE_FILE_0 = {facades.glow_file(kind, level)}\n", config)

    def test_the_mask_says_where(self):
        self.assertIn("EmissiveMode = DIFFUSE_WITH_EMISSIVE\n", facades.night_config())
        self.assertIn("RESOURCE_0 = txEmissive\n", facades.night_config())

    def test_they_glow_at_night_only(self):
        config = facades.night_config()
        self.assertIn("KEY_0 = ksEmissive\n", config)
        self.assertIn("VALUE_0_OFF = 0, 0, 0\n", config)
        self.assertIn("CONDITION = NIGHT_SMOOTH\n", config)

    def test_a_track_has_it(self):
        self.assertIn(facades.night_config(), make_track_folder.EXT_CONFIG)


if __name__ == "__main__":
    unittest.main()
