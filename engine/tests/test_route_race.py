"""A Route can use AC's standing-start Race and retain its A-to-B Practice."""
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import kn5, objectlist, route_race  # noqa: E402
from track.obj_to_kn5 import empty  # noqa: E402


class RouteRaceTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.model = self.root / "one.kn5"
        root = empty("root", (0, 0, 0), (0, 0, 1))
        for gate, metre in (("START", 0), ("FINISH", 300)):
            for edge, x in (("L", -3), ("R", 3)):
                root.children.append(empty(f"AC_AB_{gate}_{edge}", (x, 0, metre), (0, 0, 1)))
        root.children.append(empty("AC_START_0", (0, 0, -3), (0, 0, 1)))
        kn5.write(self.model, [], [], root)
        (self.root / "data").mkdir()
        (self.root / "data/surfaces.ini").write_text("[SURFACE_0]\nKEY=ROAD\n")

    def test_routes_share_the_model_with_separate_native_timing(self):
        state = objectlist.state_of(self.model)
        original = kn5.scan(self.model)["points"]
        route_race.prepare(self.model)
        track = kn5.scan(self.model)["points"]
        practice = kn5.scan(self.root / route_race.PRACTICE_MODEL)["points"]
        race = kn5.scan(self.root / route_race.RACE_MODEL)["points"]
        for edge in ("L", "R"):
            self.assertNotIn(f"AC_AB_START_{edge}", track)
            self.assertEqual(original[f"AC_AB_START_{edge}"], practice[f"AC_AB_START_{edge}"])
            self.assertEqual(original[f"AC_AB_FINISH_{edge}"], practice[f"AC_AB_FINISH_{edge}"])
            self.assertNotIn(f"AC_TIME_1_{edge}", race)
            self.assertEqual(original[f"AC_AB_FINISH_{edge}"], race[f"AC_TIME_0_{edge}"])
        self.assertEqual(track["AC_START_0"], original["AC_START_0"])
        self.assertEqual(objectlist.state_of(self.model), state)
        self.assertTrue(route_race.has_gates(track))
        self.assertEqual((self.root / "data/surfaces.ini").read_bytes(),
                         (self.root / route_race.LAYOUT / "data/surfaces.ini").read_bytes())
        for config, timing in ((route_race.DEFAULT, route_race.PRACTICE_MODEL), (route_race.RACE, route_race.RACE_MODEL)):
            self.assertEqual(["FILE=one.kn5", f"FILE={timing}"],
                             [line for line in (self.root / config).read_text().splitlines() if line.startswith("FILE=")])

    def test_replaces_an_existing_race_timing_model_without_rewriting_the_road(self):
        route_race.prepare(self.model)
        ino = self.model.stat().st_ino
        path = self.root / route_race.RACE_MODEL
        old = empty("timing", (0, 0, 0), (0, 0, 1))
        old.children.append(empty("AC_TIME_1_L", (0, 0, 0), (0, 0, 1)))
        kn5.write(path, [], [], old)
        route_race.prepare(self.model)
        self.assertEqual(ino, self.model.stat().st_ino)
        self.assertNotIn("AC_TIME_1_L", kn5.scan(path)["points"])

    def test_existing_custom_model_layout_is_preserved(self):
        default = self.root / route_race.DEFAULT
        default.write_text("[MODEL_0]\nFILE=custom.kn5\n")
        before = self.model.read_bytes()
        with self.assertRaises(ValueError):
            route_race.prepare(self.model)
        self.assertIn("custom.kn5", default.read_text())
        self.assertEqual(before, self.model.read_bytes())

    def test_cleanup_removes_empty_layout_folders_and_keeps_other_files(self):
        ui = self.root / "ui/ui_track.json"
        ui.parent.mkdir()
        ui.write_text('{"name": "Track"}', encoding="utf-8")
        root = self.root / route_race.LAYOUT
        for keep_custom_file in (False, True):
            with self.subTest(keep_custom_file=keep_custom_file):
                route_race.prepare(self.model)
                custom = root / "custom.ini"
                if keep_custom_file:
                    custom.write_text("custom", encoding="utf-8")
                route_race.remove_generated_files(self.model)
                self.assertFalse((self.root / route_race.UI).exists())
                self.assertFalse((root / "data").exists())
                self.assertEqual(root.exists(), keep_custom_file)
                self.assertEqual(custom.exists(), keep_custom_file)
                self.assertTrue(ui.is_file())
                self.assertTrue(self.model.is_file())


if __name__ == "__main__":
    unittest.main()
