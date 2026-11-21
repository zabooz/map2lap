"""Play passes the selected car, conditions and session to Assetto Corsa."""
import configparser
from io import BytesIO
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: E402,F401
import server  # noqa: E402
from app import csp, mytracks, system  # noqa: E402
from track import kn5, obj_to_kn5, route_race  # noqa: E402

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
        self.track = self.ac / "content/tracks/one"
        (self.track / "data").mkdir(parents=True)
        (self.track / "one.kn5").write_bytes(b"track")
        self.race = Path(self.tmp.name, "race.ini")
        self.race.write_text(RACE)

    def started(self, *args, weather_effects=True, **options):
        with mock.patch.object(server.settings, "ac_path", return_value=str(self.ac)), \
             mock.patch.object(server.settings, "load", return_value={**server.settings.DEFAULTS, 'weather_effects': weather_effects}), \
             mock.patch.object(csp, "busy", return_value=False), \
             mock.patch.object(system, "running", return_value=False), \
             mock.patch.object(system, "ensure_steam", return_value=True), \
             mock.patch.object(server, "race_ini", return_value=str(self.race)), \
             mock.patch.object(server, "play_car", return_value=(None, None)), \
             mock.patch.object(server, "_watch_best") as watch, \
             mock.patch.object(system, "start_ac") as launch:
            code = server.play("one", *args, **options)[0]
            self.launch_args = launch.call_args
            self.watch_args = watch.call_args
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

    def test_selected_car_is_used_for_this_session(self):
        skins = self.ac / "content/cars/selected/skins/first"
        skins.mkdir(parents=True)
        self.assertEqual((200, True), self.started(10, None, "selected"))
        self.assertEqual("selected", self.ini().get("RACE", "MODEL"))
        self.assertEqual("first", self.ini().get("RACE", "SKIN"))

    def test_uninstalled_car_cannot_start(self):
        self.assertEqual((400, False), self.started(10, None, "missing"))
        self.assertEqual(RACE, self.race.read_text())

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

    def test_laps_start_a_native_solo_race_on_a_saved_circuit_copy(self):
        mytracks.save(self.track, {"kind": "circuit", "edits": {"source": "original"}})
        self.race.write_text(RACE + "\n[SESSION_0]\nWAIT_TIME=60\n\n[SESSION_1]\nTYPE=2\n\n[CAR_1]\nMODEL=opponent\n")
        self.assertEqual((200, True), self.started(laps=1))
        ini = self.ini()
        self.assertEqual("Race", ini.get("SESSION_0", "NAME"))
        for key, expected in (("TYPE", 3), ("LAPS", 1), ("DURATION_MINUTES", 0), ("WAIT_TIME", 0)):
            self.assertEqual(expected, ini.getint("SESSION_0", key))
        self.assertEqual("START", ini.get("SESSION_0", "SPAWN_SET"))
        self.assertEqual(1, ini.getint("RACE", "CARS"))
        self.assertFalse(ini.has_section("SESSION_1"))
        self.assertFalse(ini.has_section("CAR_1"))
        self.assertNotIn("laps", mytracks.load(self.track))
        self.assertEqual((str(self.race), "one", "car"), self.watch_args.args)

    def test_unlimited_after_a_race_clears_the_session_lap_count(self):
        mytracks.save(self.track, {"kind": "circuit"})
        self.assertEqual((200, True), self.started(laps=3))
        self.assertEqual((200, True), self.started())
        ini = self.ini()
        self.assertEqual("Practice", ini.get("SESSION_0", "NAME"))
        self.assertEqual(1, ini.getint("SESSION_0", "TYPE"))
        self.assertFalse(ini.has_option("SESSION_0", "LAPS"))
        self.assertEqual((str(self.race), "one", "car"), self.watch_args.args)

    def test_race_requires_a_circuit_or_a_timed_route(self):
        self.assertEqual((400, False), self.started(laps=2))
        for options in ({"kind": "route"}, {"area": [0, 1, 2, 3]}):
            mytracks.save(self.track, options)
            self.assertEqual((400, False), self.started(laps=1))
        self.assertEqual(RACE, self.race.read_text())

    def test_invalid_lap_counts_do_not_start_or_rewrite_the_session(self):
        mytracks.save(self.track, {"kind": "circuit"})
        for laps in (True, False, "3", 0, -1, 1.5, 3.0, 2**31, float("nan"), []):
            with self.subTest(laps=laps):
                self.assertEqual((400, False), self.started(laps=laps))
        self.assertEqual(RACE, self.race.read_text())

    def install_timed_route(self):
        mytracks.save(self.track, {"kind": "route"})
        root = obj_to_kn5.empty("track", (0, 0, 0), (0, 0, 1))
        for gate in ("START", "FINISH"):
            for edge in ("L", "R"):
                root.children.append(obj_to_kn5.empty(f"AC_AB_{gate}_{edge}", (0, 0, 0), (0, 0, 1)))
        kn5.write(self.track / "one.kn5", [], [], root)

    def test_route_race_starts_one_timed_run_and_watches_the_time(self):
        self.install_timed_route()
        self.assertEqual((400, False), self.started(laps=2))
        self.assertEqual((200, True), self.started(laps=1))
        ini = self.ini()
        self.assertEqual("Race", ini.get("SESSION_0", "NAME"))
        self.assertEqual("START", ini.get("SESSION_0", "SPAWN_SET"))
        for key, expected in (("TYPE", 3), ("LAPS", 1), ("WAIT_TIME", 0)):
            self.assertEqual(expected, ini.getint("SESSION_0", key))
        self.assertEqual(route_race.LAYOUT, ini.get("RACE", "CONFIG_TRACK"))
        self.assertEqual((str(self.race), f"one-{route_race.LAYOUT}", "car"), self.watch_args.args)
        self.assertTrue((self.track / route_race.RACE).is_file())
        self.assertEqual((200, True), self.started())
        self.assertEqual("", self.ini().get("RACE", "CONFIG_TRACK"))

    def test_route_practice_watches_the_time(self):
        self.install_timed_route()
        self.assertEqual((200, True), self.started())
        self.assertEqual("Practice", self.ini().get("SESSION_0", "NAME"))
        self.assertEqual((str(self.race), "one", "car"), self.watch_args.args)

    def test_previous_timed_route_result_is_recovered(self):
        self.install_timed_route()
        ini = self.ini()
        ini["RACE"].update({"TRACK": "one", "CARS": "1"})
        for session in ({"TYPE": "1"}, {"TYPE": "3", "LAPS": "1"}):
            ini["SESSION_0"] = session
            with mock.patch.object(server.personalbest, "import_result") as collect:
                server._previous_best(str(self.ac), str(self.race), ini)
            collect.assert_called_once_with(str(self.race.parent.parent), "one", "car", self.race.stat().st_mtime_ns)
        ini["RACE"]["CONFIG_TRACK"] = route_race.LAYOUT
        with mock.patch.object(server.personalbest, "import_result") as collect:
            server._previous_best(str(self.ac), str(self.race), ini)
        collect.assert_called_once_with(str(self.race.parent.parent), f"one-{route_race.LAYOUT}", "car",
                                        self.race.stat().st_mtime_ns)

    def test_route_hotlap_uses_native_start_and_watches_the_time(self):
        self.install_timed_route()
        self.race.write_text(RACE + "\n[SESSION_0]\nTYPE=3\nLAPS=8\nWAIT_TIME=0\n")
        self.assertEqual((200, True), self.started(hotlap=True))
        ini = self.ini()
        self.assertEqual("Hotlap", ini.get("SESSION_0", "NAME"))
        self.assertEqual("START", ini.get("SESSION_0", "SPAWN_SET"))
        self.assertEqual(4, ini.getint("SESSION_0", "TYPE"))
        self.assertFalse(ini.has_option("SESSION_0", "LAPS"))
        self.assertEqual((str(self.race), "one", "car"), self.watch_args.args)

    def test_route_without_timing_cannot_start_hotlap(self):
        mytracks.save(self.track, {"kind": "route"})
        self.assertEqual((400, False), self.started(hotlap=True))
        self.assertEqual(RACE, self.race.read_text())

    def test_play_request_passes_laps_to_the_session(self):
        request = b'{"name":"one","laps":2}'
        handler = object.__new__(server.Handler)
        handler.command, handler.path = "POST", "/api/play"
        handler.headers = {"Content-Length": str(len(request))}
        handler.rfile, handler.wfile = BytesIO(request), BytesIO()
        handler.send_response, handler.send_header, handler.end_headers = mock.Mock(), mock.Mock(), mock.Mock()
        with mock.patch.object(server, "play", return_value=(200, {"ok": True})) as launch:
            handler.do_POST()
        launch.assert_called_once_with("one", None, None, None, laps=2, hotlap=False)
        handler.send_response.assert_called_once_with(200)


if __name__ == "__main__":
    unittest.main()
