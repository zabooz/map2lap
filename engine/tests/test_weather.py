"""Editor weather presets, bounded session input and portable track-local CSP effects."""
import configparser
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import weather


class WeatherTest(unittest.TestCase):
    def options(self, **changes):
        return weather.parse({**weather.DEFAULT, **changes})

    def test_air_and_road_temperatures_are_independent_session_values(self):
        for air, road in [(-30, -30), (-5, 2), (20, 26), (50, 80)]:
            ini = configparser.ConfigParser()
            ini.read_dict({'TEMPERATURE': {'AMBIENT': '13', 'ROAD': '18', 'OTHER': 'kept'}})
            weather.apply_session(ini, self.options(airTemperature=air, roadTemperature=road))
            self.assertEqual(float(ini['TEMPERATURE']['AMBIENT']), air)
            self.assertEqual(float(ini['TEMPERATURE']['ROAD']), road)
            self.assertEqual(ini['TEMPERATURE']['OTHER'], 'kept')

    def test_temperature_defaults_and_invalid_values(self):
        defaults = weather.parse({})
        self.assertEqual((defaults['airTemperature'], defaults['roadTemperature']), (20, 26))
        for field, upper in [('airTemperature', 50), ('roadTemperature', 80)]:
            for value in [-31, upper + 1, True, None, '20', float('inf'), float('nan')]:
                with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                    self.options(**{field: value})

    def test_cloud_cover_and_precipitation_have_their_own_native_presets(self):
        for kind, types in [('dry', (15, 17, 19)), ('rain', (6, 7, 2)), ('snow', (9, 10, 11))]:
            for intensity, expected in zip(('light', 'medium', 'heavy'), types):
                with self.subTest(kind=kind, intensity=intensity):
                    self.assertEqual(weather.weather_type(self.options(kind=kind, intensity=intensity)), expected)

    def test_invalid_values_are_rejected_before_a_session_is_changed(self):
        for field, values in {'kind': ['storm', 1], 'intensity': ['extreme', None],
                              'windDirection': [-2, 361, float('nan'), True],
                              'windSpeed': [-2, 101, float('inf'), True], 'fog': [1, 'yes'],
                              'windscreenSnow': [1, 'no', None]}.items():
            for value in values:
                with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                    self.options(**{field: value})

    def test_full_circle_is_north_and_random_is_a_distinct_setting(self):
        self.assertEqual(self.options(windDirection=360)['windDirection'], 0)
        self.assertEqual(self.options(windDirection=-1)['windDirection'], -1)

    def test_random_wind_speed_is_default_and_resolved_once_for_each_drive(self):
        self.assertEqual(weather.parse({})['windSpeed'], -1)
        ini = configparser.ConfigParser()
        with mock.patch.object(weather.secrets, 'randbelow', return_value=73) as random:
            weather.apply_session(ini, self.options(windDirection=0))
        random.assert_called_once_with(101)
        self.assertEqual(ini['WIND']['SPEED_KMH_MIN'], '73')
        self.assertEqual(ini['WIND']['SPEED_KMH_MAX'], '73')

    def test_explicit_calm_and_100_kmh_do_not_randomise_speed(self):
        for speed in (0, 100):
            ini = configparser.ConfigParser()
            with mock.patch.object(weather.secrets, 'randbelow') as random:
                weather.apply_session(ini, self.options(windDirection=0, windSpeed=speed))
            random.assert_not_called()
            self.assertEqual(float(ini['WIND']['SPEED_KMH_MIN']), speed)
            self.assertEqual(float(ini['WIND']['SPEED_KMH_MAX']), speed)

    def test_session_has_native_weather_wind_and_additional_fog(self):
        ini = configparser.ConfigParser()
        with mock.patch.object(weather.secrets, 'randbelow', return_value=82):
            weather.apply_session(ini, self.options(kind='rain', intensity='heavy', windSpeed=25, fog=True))
        self.assertEqual(ini['LIGHTING']['__CM_WEATHER_CONTROLLER'], 'map2lap')
        self.assertEqual(ini['LIGHTING']['__CM_WEATHER_TYPE'], '2')
        self.assertEqual(ini['LIGHTING']['__MAP2LAP_FOG'], '1')
        self.assertEqual(float(ini['WIND']['DIRECTION_DEG']), 262)
        self.assertEqual(float(ini['WIND']['SPEED_KMH_MIN']), 25)
        self.assertEqual(float(ini['WIND']['SPEED_KMH_MAX']), 25)

    def test_compass_direction_is_where_wind_arrives_from_not_where_it_travels_to(self):
        ini = configparser.ConfigParser()
        weather.apply_session(ini, self.options(windDirection=0, windSpeed=10))
        self.assertEqual(float(ini['WIND']['DIRECTION_DEG']), 180)

    def test_windscreen_snow_switch_preserves_native_snow_and_defaults_to_enabled(self):
        for enabled in (False, True):
            ini = configparser.ConfigParser()
            weather.apply_session(ini, self.options(kind='snow', intensity='heavy', windscreenSnow=enabled))
            self.assertEqual(ini['LIGHTING']['__MAP2LAP_WINDSCREEN_SNOW'], str(int(enabled)))
            self.assertEqual(ini['LIGHTING']['__CM_WEATHER_TYPE'], '11')
        self.assertTrue(weather.parse({})['windscreenSnow'])

    def test_install_is_idempotent_and_preserves_the_tracks_other_configuration(self):
        with tempfile.TemporaryDirectory() as temporary:
            track = Path(temporary)
            ext = track / 'extension'
            ext.mkdir()
            custom = b'[LIGHT_SERIES_0]\nCOLOR=1,0.5,0.2,4\n'
            main = ext / 'ext_config.ini'
            main.write_bytes(custom)
            weather.install_track(track)
            first = main.read_bytes()
            weather.install_track(track)
            self.assertEqual(main.read_bytes(), first)
            self.assertTrue(first.startswith(custom))
            self.assertEqual(first.count(b'INCLUDE: map2lap_weather.ini'), 1)
            self.assertEqual((ext / 'map2lap_weather.lua').read_bytes(), weather.SCRIPT.read_bytes())
            self.assertIn(b'SCRIPT=map2lap_weather.lua', (ext / 'map2lap_weather.ini').read_bytes())
            self.assertIn('__MAP2LAP_WINDSCREEN_SNOW', weather.SCRIPT.read_text())

    def test_controller_installs_without_modifying_csp_base_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            ac = Path(temporary)
            weather.install_controller(ac)
            self.assertEqual((ac / 'extension/weather-controllers/map2lap/controller.lua').read_bytes(),
                             weather.CONTROLLER.read_bytes())
            self.assertFalse((ac / 'extension/weather-controllers/base').exists())


if __name__ == '__main__':
    unittest.main()
