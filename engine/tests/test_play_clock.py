"""Play from the Editor starts Assetto Corsa at the hour the Editor's clock shows."""
import configparser
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: E402,F401
import server  # noqa: E402
from app import csp, system  # noqa: E402

RACE = "[RACE]\nMODEL=car\n\n[LIGHTING]\nSUN_ANGLE=-48.00\nTIME_MULT=1.0\n"


class SunAngleTest(unittest.TestCase):
    def test_the_angle_is_the_one_content_manager_writes(self):
        self.assertAlmostEqual(-48.0, server.sun_angle(10.0))
        self.assertAlmostEqual(0.0, server.sun_angle(13.0))
        self.assertAlmostEqual(175.73, server.sun_angle(23 + 59 / 60), places=1)     # (CM's own for just before midnight)


class PlayAtAnHourTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.ac = Path(self.tmp.name, "ac")
        track = self.ac / "content/tracks/one/one.kn5"
        track.parent.mkdir(parents=True)
        track.write_bytes(b"track")
        self.race = Path(self.tmp.name, "race.ini")
        self.race.write_text(RACE)

    def started(self, *args):
        with mock.patch.object(server.settings, "ac_path", return_value=str(self.ac)), \
             mock.patch.object(csp, "busy", return_value=False), \
             mock.patch.object(system, "running", return_value=False), \
             mock.patch.object(system, "ensure_steam", return_value=True), \
             mock.patch.object(server, "race_ini", return_value=str(self.race)), \
             mock.patch.object(server, "play_car", return_value=(None, None)), \
             mock.patch.object(system, "start_ac") as launch:
            code = server.play("one", *args)[0]
        return code, launch.called

    def ini(self):
        ini = configparser.ConfigParser(interpolation=None, strict=False)
        ini.optionxform = str
        ini.read(self.race, encoding="utf-8")
        return ini

    def test_the_editors_hour_goes_into_the_session(self):
        self.assertEqual((200, True), self.started(18.5))
        self.assertAlmostEqual(88.0, self.ini().getfloat("LIGHTING", "SUN_ANGLE"))

    def test_midnight_is_an_hour_too(self):
        self.assertEqual((200, True), self.started(0.0))
        self.assertAlmostEqual(-208.0, self.ini().getfloat("LIGHTING", "SUN_ANGLE"))

    def test_the_rest_of_the_light_stays(self):
        self.started(18.5)
        self.assertEqual("1.0", self.ini().get("LIGHTING", "TIME_MULT"))

    def test_without_an_hour_the_last_one_stays(self):
        """My tracks' Play has no clock."""
        self.assertEqual((200, True), self.started())
        self.assertAlmostEqual(-48.0, self.ini().getfloat("LIGHTING", "SUN_ANGLE"))

    def test_a_race_ini_without_light_gets_it(self):
        self.race.write_text("[RACE]\nMODEL=car\n")
        self.assertEqual((200, True), self.started(12.0))
        self.assertAlmostEqual(-16.0, self.ini().getfloat("LIGHTING", "SUN_ANGLE"))

    def test_a_wrong_hour_starts_nothing(self):
        for wrong in (-1, 24, float("nan"), "noon", True):
            self.assertEqual((400, False), self.started(wrong), wrong)
        self.assertEqual(RACE, self.race.read_text())

    def test_editor_weather_reaches_native_csp_and_installs_its_track_script(self):
        self.assertEqual((200, True), self.started(10, {'kind': 'snow', 'intensity': 'heavy',
                                                       'windDirection': 90, 'windSpeed': 20, 'fog': True}))
        ini = self.ini()
        self.assertEqual(ini.getint('LIGHTING', '__CM_WEATHER_TYPE'), 11)
        self.assertEqual(ini.get('LIGHTING', '__CM_WEATHER_CONTROLLER'), 'map2lap')
        self.assertEqual(ini.getint('WIND', 'DIRECTION_DEG'), 270)
        self.assertTrue((self.ac / 'content/tracks/one/extension/map2lap_weather.lua').is_file())
        self.assertTrue((self.ac / 'extension/weather-controllers/map2lap/controller.lua').is_file())

    def test_invalid_weather_does_not_start_or_rewrite_the_session(self):
        self.assertEqual((400, False), self.started(10, {'windSpeed': 101}))
        self.assertEqual(RACE, self.race.read_text())


if __name__ == "__main__":
    unittest.main()
