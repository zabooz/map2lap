"""Passing hints follow the bytes installed for Assetto Corsa."""
from configparser import ConfigParser
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import ailinestate, fastlane, route_race


class PassingHintsTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.lane = self.folder / fastlane.FILE
        self.hints = self.folder / "data/ai_hints.ini"
        self.hints.parent.mkdir()
        self.hints.write_text("[old]\n")

    def write(self, xyz, widths, target=None):
        points = np.zeros(len(xyz), fastlane.POINT)
        detail = np.zeros(len(xyz), fastlane.DETAIL)
        points["pos"] = xyz
        detail["left"] = np.asarray(widths) * .25
        detail["right"] = np.asarray(widths) * .75
        fastlane._write_lane(target or self.lane, points, detail)

    def read(self, path=None):
        ini = ConfigParser()
        ini.read_string((path or self.hints).read_text())
        sections = []
        for i, name in enumerate(ini.sections()):
            self.assertEqual(f"DANGER_{i}", name)
            data = ini[name]
            self.assertEqual(data.getfloat("LEFT"), data.getfloat("RIGHT"))
            sections.append([data.getfloat(k) for k in ("START", "END", "LEFT")])
        return sections

    def test_narrow_ordinary_and_wide_streets_replace_the_old_hints(self):
        for width, hint in [(4., 0.), (5.5, 0.), (6., .25), (6.6, .5), (7., .75), (14., 1.)]:
            with self.subTest(width=width):
                self.write([[0,0,0], [0,0,70]], width)
                ailinestate.record_ready(self.folder, "build")
                self.assertEqual(self.read(), [[0., 1., hint]] if hint else [])

    def test_ranges_use_3d_spline_distance_and_keep_long_changes(self):
        # 50 m on a grade and 150 m on the flat. The width changes halfway along the middle chord.
        self.write([[0,0,0], [30,40,0], [30,40,100], [30,40,150]], [6.5,6.5,8.,8.])
        ailinestate.record_ready(self.folder, "build")
        self.assertEqual(self.read(), [[0., .5, .5], [.5, 1., 1.]])

    def test_short_wider_patch_merges_but_a_narrow_pinch_keeps_room_for_two_cars(self):
        x = np.arange(0., 301., 5.)
        widths = np.full(len(x), 6.5)
        widths[(x > 30) & (x < 55)] = 10.
        widths[(x > 150) & (x < 170)] = 5.
        self.write(np.column_stack((x, x*0, x*0)), widths)
        ailinestate.record_ready(self.folder, "build")
        sections = self.read()
        self.assertEqual([s[2] for s in sections], [.5, .5])
        self.assertGreaterEqual(300*(sections[1][0]-sections[0][1]), 49.999)
        self.assertFalse(any(a <= 160/300 <= b for a,b,_ in sections))

    def test_circuit_counts_closing_chord_and_joins_short_halves_at_lap_seam(self):
        (self.folder / "data/map2lap.json").write_text('{"kind":"circuit"}')
        self.write([[0,0,0], [80,0,0], [80,0,80], [0,0,80]], [6.5,5.,5.,5.])
        ailinestate.record_ready(self.folder, "build", circuit=True)
        self.assertEqual(self.read(), [[0., .125, .5], [.875, 1., .5]])

    def test_short_widening_on_a_circuit_leaves_one_continuous_hint(self):
        self.write([[0,0,0], [20,0,0], [20,0,20], [0,0,20]], [9.,6.6,6.6,6.6])
        ailinestate.record_ready(self.folder, "build", circuit=True)
        self.assertEqual(self.read(), [[0., 1., .5]])

    def test_publish_carry_and_clear_follow_the_installed_lane(self):
        self.write([[0,0,0], [80,0,0]], 6.5)
        ailinestate.record_ready(self.folder, "build")
        candidate = self.folder / "worker.ai"
        self.write([[0,0,0], [80,0,0]], 10., candidate)
        with patch.object(ailinestate, "_write", side_effect=PermissionError):
            with self.assertRaises(PermissionError):
                ailinestate.publish(self.folder, "editor", candidate)
        self.assertEqual(self.read(), [[0.,1.,.5]])
        self.write([[0,0,0], [80,0,0]], 10., candidate)
        ailinestate.publish(self.folder, "editor", candidate)
        self.assertEqual(self.read(), [[0.,1.,1.]])
        staged = self.folder / "copy"
        with patch.object(ailinestate, "input_key", return_value="editor"):
            ailinestate.carry(self.folder, staged / "copy.kn5", False)
        self.assertEqual(self.read(staged / "data/ai_hints.ini"), self.read())
        ailinestate.clear(self.folder, "editor", "no floor")
        self.assertFalse(self.hints.exists())

    def test_retiring_a_legacy_race_layout_recomputes_hints_for_the_surviving_lane(self):
        model = self.folder / "test.kn5"
        (self.folder / route_race.RACE).write_text(route_race._models(model.name, route_race.RACE_MODEL))
        old = self.folder / route_race.LAYOUT
        self.write([[0,0,0], [80,0,0]], 7., old / fastlane.FILE)
        (old / "data").mkdir()
        (old / "data/ai_hints.ini").write_text("[stale]\n")
        self.assertTrue(route_race.remove_race_layout(model))
        self.assertEqual(self.read(), [[0.,1.,.75]])
        self.assertFalse(old.exists())


if __name__ == "__main__":
    unittest.main()
