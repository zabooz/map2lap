"""Passing hints follow the bytes installed for Assetto Corsa."""
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

    def test_no_zones_clear_old_hints_on_routes_and_circuits(self):
        for circuit in (False, True):
            with self.subTest(circuit=circuit):
                self.write([[0,0,0], [80,0,0], [80,0,80]], [4., 6.6, 14.])
                self.hints.write_bytes(b"[DANGER_0]\nSTART=0.000000000\nEND=1.000000000\nLEFT=1.00\nRIGHT=1.00\n")
                self.assertEqual("stale", ailinestate.hints_state(self.folder, circuit)["state"])
                ailinestate.sync_hints(self.folder, circuit)
                self.assertEqual(self.hints.read_bytes(), b"")
                self.assertEqual("current", ailinestate.hints_state(self.folder, circuit)["state"])

    def test_publish_carry_and_clear_follow_the_installed_lane(self):
        self.write([[0,0,0], [80,0,0]], 6.5)
        ailinestate.record_ready(self.folder, "build")
        self.hints.write_bytes(b"previous hints")
        candidate = self.folder / "worker.ai"
        self.write([[0,0,0], [80,0,0]], 10., candidate)
        with patch.object(ailinestate, "_write", side_effect=PermissionError):
            with self.assertRaises(PermissionError):
                ailinestate.publish(self.folder, "editor", candidate)
        self.assertEqual(self.hints.read_bytes(), b"previous hints")
        self.write([[0,0,0], [80,0,0]], 10., candidate)
        ailinestate.publish(self.folder, "editor", candidate)
        self.assertEqual(self.hints.read_bytes(), b"")
        self.hints.write_bytes(b"legacy generated hints")
        staged = self.folder / "copy"
        with patch.object(ailinestate, "input_key", return_value="editor"):
            ailinestate.carry(self.folder, staged / "copy.kn5", False)
        self.assertEqual((staged / "data/ai_hints.ini").read_bytes(), b"")
        ailinestate.clear(self.folder, "editor", "no floor")
        self.assertFalse(self.hints.exists())

    def test_retiring_a_legacy_race_layout_recomputes_hints_for_the_surviving_lane(self):
        model = self.folder / "test.kn5"
        (self.folder / route_race.RACE).write_text(route_race._models(model.name, route_race.RACE_MODEL))
        old = self.folder / route_race.LAYOUT
        self.write([[0,0,0], [80,0,0]], 7., old / fastlane.FILE)
        (old / "data").mkdir()
        (old / "data/ai_hints.ini").write_text("[DANGER_0]\nSTART=0.000000000\nEND=1.000000000\nLEFT=0.50\nRIGHT=0.50\n")
        original = self.hints.read_bytes()
        self.assertTrue(route_race.remove_race_layout(model))
        self.assertEqual(self.hints.read_bytes(), original)
        self.assertFalse(old.exists())


if __name__ == "__main__":
    unittest.main()
