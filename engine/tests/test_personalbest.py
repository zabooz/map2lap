"""Import the driver's AC Personal Best from a completed Map2Lap session."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import personalbest  # noqa: E402


class PersonalBestTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.documents = Path(temp.name)
        self.result = self.documents / "out" / "race_out.json"
        self.result.parent.mkdir()
        self.ini = self.documents / "personalbest.ini"

    def save_result(self, **parts):
        data = {"track": "one", "players": [{"car": "car"}], "sessions": [{"bestLaps": []}],
                "extras": [{"name": "bestlap", "time": 48771}], **parts}
        self.result.write_text(json.dumps(data), encoding="utf-8")

    def test_imports_the_extra_even_when_the_race_has_no_laps_list(self):
        self.save_result()
        self.assertEqual(48771, personalbest.import_result(self.documents, "one", "car", 0))
        self.assertIn("[car@one]\nTIME=48771\nDATE=", self.ini.read_text())

    def test_selects_the_fastest_player_best_across_sessions(self):
        self.save_result(sessions=[{"bestLaps": [{"car": 1, "time": 30000}, {"car": 0, "time": 47000}]},
                                   {"bestLaps": [{"car": 0, "time": -1}]}])
        self.assertEqual(47000, personalbest.import_result(self.documents, "one", "car", 0))

    def test_ai_race_uses_only_player_times_even_when_the_ai_drives_the_same_car(self):
        self.save_result(players=[{"car": "car"}, {"car": "car"}],
                         sessions=[{"bestLaps": [{"car": 1, "time": 30000}, {"car": 0, "time": 47000}]}],
                         extras=[{"name": "bestlap", "time": 31000, "car": 1}])
        self.assertEqual(47000, personalbest.import_result(self.documents, "one", "car", 0))

    def test_updates_only_the_matching_combination_if_it_is_faster(self):
        self.save_result()
        old = "[unrelated@layout]\n; keep existing content\nTIME=99999\n\n[CAR@ONE]\ntime=49000\ndate=123\n"
        self.ini.write_text(old, encoding="utf-8")
        self.assertEqual(48771, personalbest.import_result(self.documents, "one", "car", 0))
        written = self.ini.read_text()
        self.assertIn("[unrelated@layout]\n; keep existing content\nTIME=99999\n", written)
        self.assertIn("[CAR@ONE]\nTIME=48771\nDATE=", written)
        self.save_result(extras=[{"name": "bestlap", "time": 50000}])
        self.assertIsNone(personalbest.import_result(self.documents, "one", "car", 0))
        self.assertEqual(written, self.ini.read_text())

    def test_ignores_wrong_or_stale_results_and_nonpositive_times(self):
        self.save_result()
        self.assertIsNone(personalbest.import_result(self.documents, "other", "car", 0))
        self.assertIsNone(personalbest.import_result(self.documents, "one", "other", 0))
        self.assertIsNone(personalbest.import_result(self.documents, "one", "car", self.result.stat().st_mtime_ns + 1))
        self.save_result(extras=[{"name": "bestlap", "time": 0}])
        self.assertIsNone(personalbest.import_result(self.documents, "one", "car", 0))
        self.assertFalse(self.ini.exists())

    def test_import_runs_after_ac_exits_and_flushes_the_result(self):
        calls = iter((False, True, True, False))
        saw_game = False

        def running(_):
            nonlocal saw_game
            active = next(calls)
            self.assertFalse(self.ini.exists())
            if not active and saw_game:
                self.save_result()
            saw_game = saw_game or active
            return active

        with mock.patch.object(personalbest.system, "running", side_effect=running), \
             mock.patch.object(personalbest.time, "sleep"):
            personalbest.watch(self.documents, "one", "car", 0)
        self.assertIn("TIME=48771", self.ini.read_text())

    def test_reads_the_fastest_car_per_track_without_mixing_layouts(self):
        self.ini.write_text("[slow@one]\nTIME=50000\n[fast@ONE]\ntime=48771\n"
                            "[fast@one-short]\nTIME=20000\n[bad@one]\nTIME=-1\n", encoding="utf-8")
        self.assertEqual({"one": ("fast", 48771), "one-short": ("fast", 20000)},
                         personalbest.fastest_by_track(self.documents))


if __name__ == "__main__":
    unittest.main()
