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

RACE = "[RACE]\nMODEL=car\n\n[LIGHTING]\nSUN_ANGLE=-48.00\nTIME_MULT=1.0\n\n[TEMPERATURE]\nAMBIENT=13\nROAD=18\n"


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

    def started(self, *args, weather_effects=True):
        with mock.patch.object(server.settings, "ac_path", return_value=str(self.ac)), \
             mock.patch.object(server.settings, "load", return_value={**server.settings.DEFAULTS, 'weather_effects': weather_effects}), \
             mock.patch.object(csp, "busy", return_value=False), \
             mock.patch.object(system, "running", return_value=False), \
             mock.patch.object(system, "ensure_steam", return_value=True), \
             mock.patch.object(server, "race_ini", return_value=str(self.race)), \
             mock.patch.object(server, "play_car", return_value=(None, None)), \
             mock.patch.object(system, "start_ac") as launch:
            code = server.play("one", *args)[0]
            self.launch_args = launch.call_args
        return code, launch.called

    def test_global_effects_switch_disables_script_and_helper_but_keeps_native_weather(self):
        for enabled in (True, False, True):
            self.assertEqual((200, True), self.started(10, {'kind': 'rain'}, weather_effects=enabled))
            self.assertEqual(self.ini().getint('LIGHTING', '__MAP2LAP_WEATHER_EFFECTS'), int(enabled))
            self.assertEqual(self.ini().getint('LIGHTING', '__CM_WEATHER_TYPE'), 6)
            script = (self.ac / 'content/tracks/one/extension/map2lap_weather.ini').read_text()
            self.assertIn(f'ACTIVE={int(enabled)}', script)
            self.assertEqual(self.launch_args.kwargs.get('weather_effects'), enabled)
        self.assertEqual((200, True), self.started(weather_effects=False))
        self.assertEqual(self.ini().getint('LIGHTING', '__MAP2LAP_WEATHER_EFFECTS'), 0)

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
        self.assertEqual((self.ini().getfloat('TEMPERATURE', 'AMBIENT'), self.ini().getfloat('TEMPERATURE', 'ROAD')), (13, 18))

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
                                                       'windDirection': 90, 'windSpeed': 20, 'fog': True,
                                                       'airTemperature': -12, 'roadTemperature': -6}))
        ini = self.ini()
        self.assertEqual(ini.getint('LIGHTING', '__CM_WEATHER_TYPE'), 11)
        self.assertEqual(ini.get('LIGHTING', '__CM_WEATHER_CONTROLLER'), 'map2lap')
        self.assertEqual(ini.getint('WIND', 'DIRECTION_DEG'), 270)
        self.assertEqual((ini.getfloat('TEMPERATURE', 'AMBIENT'), ini.getfloat('TEMPERATURE', 'ROAD')), (-12, -6))
        self.assertTrue((self.ac / 'content/tracks/one/extension/map2lap_weather.lua').is_file())
        self.assertTrue((self.ac / 'extension/weather-controllers/map2lap/controller.lua').is_file())

    def test_invalid_weather_does_not_start_or_rewrite_the_session(self):
        for options in ({'windSpeed': 101}, {'airTemperature': -31}, {'roadTemperature': 81}):
            self.assertEqual((400, False), self.started(10, options))
            self.assertEqual(RACE, self.race.read_text())


if __name__ == "__main__":
    unittest.main()
