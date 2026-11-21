"""Retiring Map2Lap's standalone Race layout preserves the default A–B timing."""
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import route_race  # noqa: E402


def models(mesh, timing):
    return "\n".join(f"[MODEL_{i}]\nFILE={name}\nPOSITION=0,0,0\nROTATION=0,0,0\n"
                     for i, name in enumerate((mesh, timing)))


class RouteRaceTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.model = self.root / "one.kn5"
        self.model.write_bytes(b"shared track")
        self.files = {
            route_race.DEFAULT: models(self.model.name, route_race.PRACTICE_MODEL),
            route_race.RACE: models(self.model.name, route_race.RACE_MODEL),
            route_race.PRACTICE_MODEL: "A–B gates",
            route_race.RACE_MODEL: "old race gate",
            route_race.UI / "ui_track.json": '{"name": "Route (Race)"}',
            Path(route_race.LAYOUT, "data/surfaces.ini"): "[SURFACE_0]\nKEY=ROAD\n",
            Path(route_race.LAYOUT, "ai/fast_lane.ai"): "AI",
        }
        for relative, value in self.files.items():
            path = self.root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(value, encoding="utf-8")

    def test_retirement_preserves_default_models_and_moves_the_only_ai_line(self):
        self.assertTrue(route_race.remove_race_layout(self.model))
        self.assertFalse(route_race.remove_race_layout(self.model))
        for name in (route_race.DEFAULT, route_race.PRACTICE_MODEL):
            self.assertEqual(self.files[name], (self.root / name).read_text(encoding="utf-8"))
        for name in (route_race.RACE, route_race.RACE_MODEL, route_race.LAYOUT, route_race.UI):
            self.assertFalse((self.root / name).exists())
        self.assertEqual("AI", (self.root / "ai/fast_lane.ai").read_text())
        self.assertEqual(b"shared track", self.model.read_bytes())

    def test_retirement_keeps_a_different_ai_line_and_user_files(self):
        ai = self.root / "ai/fast_lane.ai"
        ai.parent.mkdir()
        ai.write_text("default AI")
        custom = self.root / route_race.LAYOUT / "custom.ini"
        custom.write_text("custom")
        self.assertTrue(route_race.remove_race_layout(self.model))
        self.assertEqual("custom", custom.read_text())
        self.assertEqual("default AI", ai.read_text())
        self.assertEqual("AI", (custom.parent / "ai/fast_lane.ai").read_text())
        self.assertFalse((self.root / route_race.RACE).exists())
        self.assertFalse((self.root / route_race.UI / "ui_track.json").exists())

    def test_foreign_layout_is_preserved(self):
        custom = self.root / route_race.RACE
        custom.write_text("[MODEL_0]\nFILE=custom.kn5\n")
        self.assertFalse(route_race.remove_race_layout(self.model))
        self.assertTrue((self.root / route_race.UI / "ui_track.json").exists())
        self.assertIn("custom.kn5", custom.read_text())

    def test_rebuild_removes_legacy_models_ini_and_timing_models(self):
        route_race.remove_generated_files(self.model)
        for name in (route_race.DEFAULT, route_race.PRACTICE_MODEL, route_race.RACE, route_race.RACE_MODEL):
            self.assertFalse((self.root / name).exists())

    def test_editor_copy_retains_default_timing_for_aliased_gates(self):
        copy = self.root / "copy.kn5"
        route_race.update_copy(self.model, copy, route_race.ALIASES.values())
        self.assertEqual(models(copy.name, route_race.PRACTICE_MODEL), (self.root / route_race.DEFAULT).read_text())
        self.assertTrue((self.root / route_race.PRACTICE_MODEL).is_file())
        self.assertFalse((self.root / route_race.RACE).exists())

    def test_editor_copy_with_native_gates_uses_its_main_model(self):
        route_race.update_copy(self.model, self.root / "copy.kn5", route_race.GATES)
        self.assertFalse((self.root / route_race.DEFAULT).exists())
        self.assertFalse((self.root / route_race.PRACTICE_MODEL).exists())


if __name__ == "__main__":
    unittest.main()
