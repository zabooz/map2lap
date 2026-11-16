"""Building style data is strict, cached by content, and shipped with the engine."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "engine"), str(ROOT / "tools")]

from buildings import styles  # noqa: E402
import make_release  # noqa: E402
import revisit  # noqa: E402


class StyleDataTest(unittest.TestCase):
    def data(self):
        return json.loads(styles.STYLE_FILE.read_text(encoding="utf-8"))

    def load(self, data):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d, "styles.json")
            path.write_text(json.dumps(data), encoding="utf-8")
            return styles.load_style_data(path)

    def test_unselected_existing_styles_keep_their_values(self):
        self.assertEqual(styles.STYLES["alpine"].walls, ((styles.SIDING, .45),))
        self.assertEqual(styles.STYLES["alpine"].pitch, 24.0)
        self.assertEqual(styles.STYLES["us_east"].brick, .75)
        self.assertEqual(styles.STYLES["mediterranean"].wall_tints, (0, 1, 2, 3, 4, 5))

    def test_ten_selected_proposal_styles_have_supported_values(self):
        names = {"central_europe", "alpine", "northwest_brick", "mediterranean", "italy_north", "italy_south",
                 "france_north", "britain", "new_zealand", "australia"}
        self.assertEqual(len(styles.STYLES), 22)  # alpine and mediterranean already existed
        self.assertTrue(names <= styles.STYLES.keys())
        self.assertEqual(styles.STYLES["central_europe"].brick, .04)
        self.assertEqual(styles.STYLES["central_europe"].pitch, 38)
        self.assertEqual(styles.STYLES["alpine"].brick, .02)
        self.assertEqual(styles.STYLES["new_zealand"].flat, .08)
        self.assertEqual(styles.STYLES["australia"].hipped, .75)

    def test_style_couplings_are_explicit_data(self):
        for name, kit, special, shutters in (("us_east", "us_east", True, False),
                                              ("us_west", "default", True, False),
                                              ("europe_north", "europe", False, True),
                                              ("central_europe", "europe", False, True),
                                              ("northwest_brick", "europe", False, False),
                                              ("britain", "europe", False, False),
                                              ("new_zealand", "default", False, False)):
            with self.subTest(style=name):
                style = styles.STYLES[name]
                self.assertEqual((style.gas_station_kit, style.us_special, style.shutters),
                                 (kit, special, shutters))

    def test_missing_coupling_field_is_an_error(self):
        data = self.data()
        for raw in data["styles"].values():
            raw.update(gas_station_kit="default", us_special=False, shutters=False)
        del data["styles"]["alpine"]["gas_station_kit"]
        with self.assertRaisesRegex(ValueError, "alpine.*missing.*gas_station_kit"):
            self.load(data)

    def test_invalid_gas_station_kit_is_an_error(self):
        data = self.data()
        for raw in data["styles"].values():
            raw.update(gas_station_kit="default", us_special=False, shutters=False)
        data["styles"]["alpine"]["gas_station_kit"] = "other"
        with self.assertRaisesRegex(ValueError, "alpine.*gas_station_kit.*expected"):
            self.load(data)

    def test_invalid_country_split_threshold_is_an_error(self):
        data = self.data()
        data["regions"]["country_splits"] = [{"country": "DE", "style": "alpine", "min_lat": 91}]
        with self.assertRaisesRegex(ValueError, "country_splits\\[0\\].*min_lat"):
            self.load(data)

    def test_shutters_use_style_field_at_track_anchor(self):
        sys.path.insert(0, str(ROOT / "src"))
        from track import make_obj
        self.assertTrue(make_obj.shutters_for_anchor(47.07, 15.44))  # Graz
        self.assertFalse(make_obj.shutters_for_anchor(52.37, 4.90))  # Amsterdam

    def test_height_only_style_pairs_keep_their_couplings(self):
        # These callers have no elevation yet: gasstations, plazas, photo.brick_share and make_obj shutters.
        places = (("Heiligenblut", 47.041, 12.837, "central_europe"),
                  ("Oberstdorf", 47.408, 10.279, "central_europe"),
                  ("Chamonix", 45.924, 6.869, "france_north"),
                  ("Briancon", 44.899, 6.643, "mediterranean"),
                  ("Val Gardena", 46.557, 11.760, "italy_north"))
        for place, lat, lon, low_name in places:
            with self.subTest(place=place):
                low = styles.region_style(lat, lon, elevation_m=699)
                high = styles.region_style(lat, lon, elevation_m=700)
                self.assertEqual((low.name, high.name), (low_name, "alpine"))
                self.assertEqual((low.gas_station_kit, low.us_special, low.shutters),
                                 (high.gas_station_kit, high.us_special, high.shutters))

    def test_unknown_style_field_is_an_error(self):
        data = self.data()
        data["styles"]["alpine"]["surprise"] = 1
        with self.assertRaisesRegex(ValueError, "alpine.*surprise"):
            self.load(data)

    def test_missing_required_style_field_is_an_error(self):
        data = self.data()
        del data["styles"]["alpine"]["brick"]
        with self.assertRaisesRegex(ValueError, "alpine.*brick"):
            self.load(data)

    def test_out_of_range_share_is_an_error(self):
        data = self.data()
        data["styles"]["alpine"]["brick"] = 1.1
        with self.assertRaisesRegex(ValueError, "alpine.*brick"):
            self.load(data)

    def test_bad_nested_roof_tint_is_an_error(self):
        data = self.data()
        data["styles"]["alpine"]["roofs"][0][1][0] = 999
        with self.assertRaisesRegex(ValueError, "alpine.*roofs"):
            self.load(data)

    def test_unknown_wall_material_has_a_clear_error(self):
        data = self.data()
        data["styles"]["alpine"]["walls"][0][0] = ["not a material"]
        with self.assertRaisesRegex(ValueError, "alpine.*walls"):
            self.load(data)

    def test_wall_tint_must_fit_the_styles_wall_material(self):
        data = self.data()
        data["styles"]["alpine"]["wall_tints"] = [10]  # siding has no house tint 10
        with self.assertRaisesRegex(ValueError, "alpine.*wall_tints"):
            self.load(data)

    def test_region_rule_cannot_name_a_missing_style(self):
        data = self.data()
        data["regions"]["countries"]["AT"] = "imaginary"
        with self.assertRaisesRegex(ValueError, "regions.*AT.*imaginary"):
            self.load(data)

    def test_region_rule_needs_every_required_field(self):
        data = self.data()
        del data["regions"]["alpine"]["min_elevation_m"]
        with self.assertRaisesRegex(ValueError, "regions.*alpine.*min_elevation_m"):
            self.load(data)

    def test_region_threshold_must_be_in_range(self):
        data = self.data()
        data["regions"]["alpine"]["min_elevation_m"] = -10
        with self.assertRaisesRegex(ValueError, "regions.*min_elevation_m"):
            self.load(data)

    def test_style_file_contributes_to_revisit_key(self):
        self.assertIn("buildings/styles.json", revisit.code_files(str(ROOT / "engine")))

    def test_style_file_goes_into_both_release_packages(self):
        with mock.patch.object(make_release.subprocess, "run", return_value=mock.Mock(stdout=b"engine/buildings/styles.json\0")):
            for system in ("win", "linux"):
                self.assertIn("engine/buildings/styles.json", make_release.files(system))


if __name__ == "__main__":
    unittest.main()
