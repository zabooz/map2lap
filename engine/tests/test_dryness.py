"""SD ground dryness with synthetic WorldCover and a local EOX transport."""
from io import BytesIO
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "src"), str(ROOT / "engine")]
import climate
import maprasters
import netfetch
from scenery import dryness


class GroundFieldTest(unittest.TestCase):
    def test_tint_endpoints_and_other_materials(self):
        base = np.array([63, 131, 78], np.float32)
        for name, target in dryness.DRY.items():
            field = dryness.GroundField((0, 0), np.ones((1, 1)), {name: dryness._linear(target) - dryness._linear(base)})
            rgb = np.array([base, base + 8])
            np.testing.assert_array_equal(field.tint(rgb, name, 0), rgb)
            np.testing.assert_array_equal(field.tint(rgb, "gc_lawn", 1), rgb)
            tinted = field.tint(rgb, name, 1)
            np.testing.assert_allclose(tinted[0], target, atol=0.001)
            np.testing.assert_array_less(tinted[0], tinted[1])
            halfway = field.tint(base, name, 0.5)
            np.testing.assert_array_less(np.abs(halfway - target), np.abs(base - target))

    def test_sample_bilinear_and_clamped(self):
        field = dryness.GroundField((120, -100), np.array([[0, 1], [0.6, 0.2]]), {})
        x = 120 + dryness.CELL * np.array([-1, 0.25, 2])
        y = -100 + dryness.CELL * np.array([[0.5], [2]])
        np.testing.assert_allclose(field.sample(x, y), [[0.3, 0.375, 0.6], [0.6, 0.5, 0.2]])

    def test_missing_field(self):
        with tempfile.TemporaryDirectory() as folder:
            self.assertIsNone(dryness.load(folder))

    def test_natural_purity_and_urban_distance(self):
        data = np.full((41, 41), 30, np.uint8)
        data[:, :8] = 20
        data[20, 20] = 50
        # At 60 degrees the test raster has 25 m east-west and 50 m north-south pixels.
        step = 50 / 111320
        wc = maprasters.Raster(data, "EPSG:4326", 0, 60, step, step)
        mask = dryness._natural(wc, 60)
        self.assertEqual(mask[3, 6:10].tolist(), [True, False, False, True])
        self.assertFalse(mask[20, 27])
        self.assertTrue(mask[20, 29])
        self.assertFalse(mask[23, 20])
        self.assertTrue(mask[25, 20])

    def test_nearest_climate_land_across_date_line(self):
        zones = np.zeros((18, 36), np.uint8)
        zones[9, 0] = 7                      # across the date line, one pixel east
        zones[9, 32:34] = 4                  # more common locally, farther away
        with mock.patch.object(climate, "_load", return_value=zones), mock.patch.object(climate, "RES", 10):
            self.assertEqual(dryness._land_zone(-5, 175), 7)

    def test_koppen_dryness(self):
        for zones, value in [((4, 5), 1.), ((6, 7), 0.7), (range(8, 11), 0.5), (range(17, 21), 0.4),
                             ((1, 2, 3, 11, 16, 21, 28, 29, 30), 0.)]:
            for zone in zones:
                with self.subTest(zone=zone):
                    self.assertAlmostEqual(dryness._koppen_value(zone), value)


class FieldBuildTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        for name in dryness.DRY:
            Image.new("RGB", (1, 1), (60, 130, 80)).save(self.root / (name + ".png"))
        jpeg = BytesIO()
        Image.new("RGB", (256, 256), (70, 160, 55)).save(jpeg, format="JPEG")
        self.transport = mock.Mock()
        self.transport.request.return_value = (200, {}, jpeg.getvalue())
        self.cover = lambda lon: np.full_like(lon, 30, dtype=np.uint8)

    def worldcover(self, bounds, level):
        west, south, east, north = bounds
        step = 2**level / maprasters.WORLDCOVER_PPD
        nx, ny = np.ceil([(east - west) / step, (north - south) / step]).astype(int)
        lon = west + (np.arange(nx) + 0.5) * step
        data = np.broadcast_to(self.cover(lon), (ny, nx)).astype(np.uint8)
        return maprasters.Raster(data, "EPSG:4326", west, north, step, step)

    def build(self, offline=False):
        net = netfetch.Fetcher(offline=offline, transport=self.transport)
        with (mock.patch.object(dryness.netfetch, "Fetcher", return_value=net),
              mock.patch.object(maprasters.Rasters, "worldcover_box", side_effect=self.worldcover),
              mock.patch.object(dryness, "_land_zone", return_value=4)):
            dryness.write(self.root, self.root, {"lat": 0, "lon": 0}, (-10000, -2500, 10000, 2500),
                          self.root / "cache", lambda msg: None)
        with np.load(self.root / "dryness.npz") as data:
            return data["values"], data["measured"]

    def test_offline_reuses_warm_tiles_and_falls_back_only_where_missing(self):
        online, measured = self.build()
        self.assertTrue(measured.all())
        np.testing.assert_array_equal(online, 0)
        files = list((self.root / "cache" / "imagery" / "eox2016" / "12").glob("*/*.jpg"))
        self.assertTrue(files)
        self.transport.request.reset_mock()
        offline, measured = self.build(offline=True)
        self.transport.request.assert_not_called()
        self.assertTrue(measured.all())
        np.testing.assert_array_equal(offline, online)
        # Remove the western half of the photos. Only the two western land cells need Köppen.
        for path in files:
            if int(path.parent.name) < 2048:
                path.unlink()
        mixed, measured = self.build(offline=True)
        self.transport.request.assert_not_called()
        np.testing.assert_array_equal(measured, [[False, False, True, True]])
        self.assertGreater(mixed[0, 0], mixed[0, -1])

    def test_cached_404_still_uses_land_climate(self):
        self.transport.request.return_value = (404, {}, b"")
        values, measured = self.build()
        self.assertTrue(self.transport.request.called)
        self.assertFalse(measured.any())
        np.testing.assert_allclose(values, 1)
        self.transport.request.reset_mock()
        self.build()
        self.transport.request.assert_not_called()

    def test_sea_cannot_pull_green_coast_towards_dry_koppen(self):
        # Unmapped ocean (0) and mapped water (80) east of the green coast.
        self.cover = lambda lon: np.where(lon < 0, 30, np.where(lon < 0.05, 80, 0))
        values, measured = self.build()
        np.testing.assert_array_equal(measured, [[True, True, False, False]])
        np.testing.assert_array_equal(values, 0)

    def test_sea_has_zero_weight_in_the_gaussian_denominator(self):
        # A forested island has no eligible EOX pixels. Its 0.7 steppe fallback
        # must stay 0.7 across the shoreline even when most neighbours are water.
        self.cover = lambda lon: np.where((0 < lon) & (lon < 0.01), 10, 80)
        with mock.patch.object(dryness, "_koppen_value", return_value=0.7):
            values, measured = self.build()
        self.assertFalse(measured.any())
        np.testing.assert_allclose(values, 0.7)
        self.transport.request.assert_not_called()

    def test_only_sea_has_no_climate_weight(self):
        self.cover = lambda lon: np.full_like(lon, 80)
        values, measured = self.build()
        self.assertFalse(measured.any())
        np.testing.assert_array_equal(values, 0)
        self.transport.request.assert_not_called()


if __name__ == "__main__":
    unittest.main()
