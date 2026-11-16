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

    def test_all_fourteen_styles_keep_their_existing_values(self):
        self.assertEqual(len(styles.STYLES), 14)
        self.assertEqual(styles.STYLES["alpine"].walls, ((styles.SIDING, .45),))
        self.assertEqual(styles.STYLES["alpine"].pitch, 24.0)
        self.assertEqual(styles.STYLES["us_east"].brick, .75)
        self.assertEqual(styles.STYLES["mediterranean"].wall_tints, (0, 1, 2, 3, 4, 5))

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
