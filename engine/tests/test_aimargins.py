"""Hand-set side margins on the installed racing line, checked through AC's INI."""
from configparser import ConfigParser
import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import aicorrections, aihints, aimargins, fastlane


class SideMarginTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.lane = self.folder / fastlane.FILE
        self.metres = np.array([0., 100., 200., 300.])
        path = np.column_stack((self.metres, self.metres*0))
        self.route = aicorrections.Route(path, [0., 0.], False)
        self.write(path, np.where(self.metres < 150, 6.6, 7.0))

    def write(self, path, widths, height=0.):
        points = np.zeros(len(path), fastlane.POINT)
        detail = np.zeros(len(path), fastlane.DETAIL)
        points["pos"][:, [0, 2]] = path
        points["pos"][:, 1] = height
        detail["left"] = detail["right"] = np.asarray(widths) / 2
        fastlane._write_lane(self.lane, points, detail)

    def anchor(self, metre, level=0.):
        return dict(metre=metre, level=level, origin=self.route.origin,
                    context=self.route.context(metre).tolist())

    def margin(self, start=100., end=200., left=None, right=1., id="m1"):
        return dict(id=id, start=self.anchor(start), end=self.anchor(end), left=left, right=right)

    def render(self, *items):
        return aihints.render(self.lane, self.route.circuit, list(items), (self.route, self.metres), None)

    def assertSections(self, result, expected):
        ini = ConfigParser()
        ini.read_string(result.data.decode("ascii"))
        self.assertEqual(ini.sections(), [f"DANGER_{i}" for i in range(len(expected))])
        for name, (start, end, left, right) in zip(ini.sections(), expected):
            self.assertAlmostEqual(ini[name].getfloat("START"), start, places=6)
            self.assertAlmostEqual(ini[name].getfloat("END"), end, places=6)
            self.assertEqual(ini[name]["LEFT"], f"{left:.2f}")
            self.assertEqual(ini[name]["RIGHT"], f"{right:.2f}")

    def test_right_margin_over_two_automatic_widths_keeps_left_automatic(self):
        hints = self.render(self.margin())
        self.assertSections(hints, [[0, 1/3, .5, .5], [1/3, .5, .5, 1.],
                                    [.5, 2/3, .75, 1.], [2/3, 1, .75, .75]])

    def test_explicit_zero_differs_from_auto(self):
        self.write(self.route.path, 6.6)
        margin = self.margin(left=0., right=None)
        self.assertSections(self.render(margin), [[0, 1/3, .5, .5], [1/3, 2/3, 0., .5],
                                                   [2/3, 1, .5, .5]])
        self.assertEqual(aimargins.problem([dict(margin, left=None)]), "Invalid side margin value")

    def test_tolerance_rounds_to_zero_before_dropping_empty_sections(self):
        self.write(self.route.path, 5.)
        margin = self.margin(left=1e-7, right=None)
        self.assertIsNone(aimargins.problem([margin]))
        result = self.render(margin)
        self.assertSections(result, [])
        self.assertEqual(result.spans[0].left, 0.)

    def test_without_margins_the_ini_is_the_automatic_bytes(self):
        automatic = (b"[DANGER_0]\nSTART=0.000000000\nEND=0.500000000\nLEFT=0.50\nRIGHT=0.50\n\n"
                     b"[DANGER_1]\nSTART=0.500000000\nEND=1.000000000\nLEFT=0.75\nRIGHT=0.75\n\n")
        self.assertEqual(aihints.contents(self.lane, False), automatic)
        self.assertEqual(self.render().data, automatic)
        hints = aihints.render(self.lane, False, [self.margin()], None, "manual")
        self.assertEqual((hints.data, hints.unplaced), (automatic, "manual"))

    def square(self, first=0):
        path = np.array([[0., 0.], [100., 0.], [100., 100.], [0., 100.]])
        self.route = aicorrections.Route(path, [0., 0.], True)
        self.metres = np.roll(np.arange(4)*100., -first)
        self.write(np.roll(path, -first, axis=0), 5.)

    def test_circuit_margin_across_start_finish_splits_at_zero(self):
        self.square()
        result = self.render(self.margin(380., 20., right=.75))
        self.assertSections(result, [[0., .05, 0, .75], [.95, 1., 0, .75]])

    def test_same_side_overlap_is_rejected_and_left_right_overlap_is_not(self):
        self.write(self.route.path, 5.)
        first = self.margin(30, 120)
        later = self.margin(60, 90, right=.75, id="later")
        result = self.render(first, later)
        self.assertIn("Overlaps side margin at route metre", result.rejected["later"])
        self.assertSections(result, [[.1, .4, 0, 1]])
        result = self.render(first, dict(later, left=.75, right=None))
        self.assertEqual(result.rejected, {})
        self.assertSections(result, [[.1, .2, 0, 1], [.2, .3, .75, 1], [.3, .4, 0, 1]])

    def test_unresolved_anchor_is_rejected_and_others_apply(self):
        self.write(self.route.path, 5.)
        bad = self.margin(30, 60, id="lost")
        bad["end"]["context"] = (np.array(bad["end"]["context"]) + [0, 20]).tolist()
        result = self.render(bad, self.margin())
        self.assertIn("Unresolved route anchor at route metre 60", result.rejected["lost"])
        self.assertSections(result, [[1/3, 2/3, 0, 1]])

    def test_anchor_on_the_deck_does_not_place_on_the_road_below(self):
        margin = dict(self.margin(), start=self.anchor(100, 7), end=self.anchor(200, 7))
        self.assertIn("Unresolved driving level", self.render(margin).rejected["m1"])
        self.write(self.route.path, 5., height=7)
        self.assertSections(self.render(margin), [[1/3, 2/3, 0, 1]])

    def test_empty_stretch_is_rejected(self):
        self.write(self.route.path, 5.)
        result = self.render(self.margin(100, 100))
        self.assertIn("Empty side margin", result.rejected["m1"])
        self.assertSections(result, [])

    def test_circuit_lane_with_wrapping_route_metres(self):
        self.square(first=2)
        result = self.render(self.margin(380, 20))
        self.assertSections(result, [[.45, .55, 0, 1]])
        result = self.render(self.margin(190, 205))
        self.assertSections(result, [[0., .0125, 0, 1], [.975, 1., 0, 1]])

    def test_route_margin_is_clipped_to_the_lane(self):
        self.metres = np.array([50., 100., 200., 250.])
        self.write(np.column_stack((self.metres, self.metres*0)), 5.)
        result = self.render(self.margin(30, 100))
        self.assertSections(result, [[0., .25, 0, 1]])
        self.assertSections(self.render(self.margin(200, 270)), [[.75, 1., 0, 1]])
        self.assertIn("m1", self.render(self.margin(270, 300)).rejected)
        self.assertIn("End precedes the start", self.render(self.margin(200, 100)).rejected["m1"])

    def test_margin_schema(self):
        margin = self.margin()
        self.assertIsNone(aimargins.problem([margin]))
        for items in [None, {}, [None], [dict(margin, id="")], [margin, margin],
                      [dict(margin, start={})], [dict(margin, end=None)]]:
            with self.subTest(items=items):
                self.assertEqual(aimargins.problem(items), "Invalid side margin")
        for value in [True, -0.05, 1.05, .051, "0.5", float("nan")]:
            with self.subTest(value=value):
                self.assertEqual(aimargins.problem([dict(margin, right=value)]),
                                 "Invalid side margin value")

    def test_recipe_reads_saved_margins(self):
        self.assertEqual(aimargins.recipe(self.folder), [])
        data = self.folder / "data"
        data.mkdir()
        margin = self.margin()
        (data / "map2lap.json").write_text(json.dumps({"edits": {"aiMargins": [margin]}}))
        self.assertEqual(aimargins.recipe(self.folder), [margin])


if __name__ == "__main__":
    unittest.main()
