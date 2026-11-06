"""A build's road rules: its country comes from Nominatim or the borders we carry, and no failed request gives it another country's
rules."""
import json
import os
import sys
import tempfile
import unittest
from unittest import mock

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402
import borders  # noqa: E402


class BordersTest(unittest.TestCase):
    """Places worldwide, each what an atlas says: left-hand and mph countries, enclaves, islands, a border's two sides."""

    def test_places(self):
        for lat, lon, code in ((46.688, 14.699, "AT"), (51.507, -0.128, "GB"), (35.68, 139.76, "JP"), (-36.85, 174.76, "NZ"),
                               (42.90, 9.36, "FR"), (59.91, 10.75, "NO"), (-33.87, 151.21, "AU"), (-23.55, -46.63, "BR"),
                               (-1.29, 36.82, "KE"), (28.61, 77.21, "IN"), (64.15, -21.94, "IS"), (41.9029, 12.4534, "VA"),
                               (43.94, 12.45, "SM"), (-29.31, 27.48, "LS"), (47.14, 9.52, "LI")):
            self.assertEqual(code, borders.at(lat, lon)[0], (lat, lon))

    def test_both_sides_of_a_border(self):
        self.assertEqual("DE", borders.at(47.60, 7.64)[0])
        self.assertEqual("FR", borders.at(47.60, 7.56)[0])

    def test_a_state_only_in_the_us(self):
        self.assertEqual(("US", "US-CA"), borders.at(34.05, -118.24))
        self.assertEqual(("US", "US-NY"), borders.at(40.71, -74.0))
        self.assertEqual(("DE", None), borders.at(52.52, 13.40))

    def test_just_off_a_coast_and_far_out_at_sea(self):
        self.assertEqual("FR", borders.at(42.90, 9.36)[0])
        self.assertEqual((None, None), borders.at(45.0, -30.0))
        self.assertEqual((None, None), borders.at(0.0, -160.0))


class RoadRulesTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        for patch in (mock.patch.object(generator, "COUNTRIES", os.path.join(tmp.name, "cache", "countries.json")),
                      mock.patch.dict(generator._codes, clear=True)):
            patch.start()
            self.addCleanup(patch.stop)

    def nominatim(self, code=None, fault=None):
        """place() naming code, or failing with fault."""
        def place(lat, lon):
            if fault:
                raise fault
            generator._codes[(round(lat, 3), round(lon, 3))] = code or (None, None)
            return "Town", None
        patch = mock.patch.object(generator, "place", side_effect=place)
        started = patch.start()
        self.addCleanup(patch.stop)
        return started

    def test_nominatim_decides_near_a_border(self):
        self.nominatim(("IE", "IE-U"))
        self.assertEqual("IE", generator.road_rules(54.6641, -7.9056)["country"])     # (the borders we carry say GB there)

    def test_no_answer_the_borders_decide_and_no_other_rules_come(self):
        self.nominatim(fault=OSError("HTTP Error 429"))
        rules = generator.road_rules(51.507, -0.128)
        self.assertEqual("GB", rules["country"])
        self.assertTrue(rules["left_hand"])
        self.assertTrue(rules["mph"])
        self.assertEqual({}, generator._stored_countries())       # (next time Nominatim is asked again)

    def test_an_answer_without_a_country_the_borders_decide(self):
        self.nominatim(None)
        self.assertEqual("JP", generator.road_rules(35.68, 139.76)["country"])

    def test_at_sea_no_country_and_no_fault(self):
        self.nominatim(fault=OSError("no net"))
        rules = generator.road_rules(45.0, -30.0)
        self.assertIsNone(rules["country"])
        self.assertFalse(rules["left_hand"])

    def test_a_territory_with_its_own_traffic_rules(self):
        self.nominatim(("CN", None))
        rules = generator.road_rules(22.32, 114.17)
        self.assertEqual("HK", rules["country"])
        self.assertTrue(rules["left_hand"])

    def test_a_country_found_is_known_without_the_net_next_time(self):
        self.nominatim(("AT", "AT-2"))
        generator.road_rules(46.7, 14.7)
        place = self.nominatim(fault=OSError("no net"))
        self.assertEqual("AT", generator.road_rules(46.7, 14.7)["country"])
        self.assertEqual(0, place.call_count)
        with open(generator.COUNTRIES, encoding="utf-8") as f:
            self.assertEqual(["AT", "AT-2"], json.load(f)["46.7,14.7"])

    def test_a_broken_store_counts_for_nothing(self):
        os.makedirs(os.path.dirname(generator.COUNTRIES))
        with open(generator.COUNTRIES, "w", encoding="utf-8") as f:
            f.write("{ not json")
        self.nominatim(("AT", "AT-2"))
        self.assertEqual("AT", generator.road_rules(46.7, 14.7)["country"])


if __name__ == "__main__":
    unittest.main()
