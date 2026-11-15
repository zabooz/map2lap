"""Front snow catches turbulent flakes before relative airflow turns into a headwind."""
from pathlib import Path
import unittest

from test_weather_preview import LuaRuntime

ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class SnowExposureTest(unittest.TestCase):
    def setUp(self):
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        helpers = source[source.index('local function windscreenSnowAmount('):source.index('local function snowWindPatches(')]
        impact = source[source.index('    local fall = mode'):source.index('    -- Gravity along the glass')]
        deposits = source[source.index('    local frontSnowRate, frontSnowFlux'):source.index('    -- The ridge estimate')]
        lua = LuaRuntime(unpack_returned_tuples=True)
        self.exposure = lua.execute('local min,max,sqrt=math.min,math.max,math.sqrt\n' + helpers + '''
            return function(az, snowRate, enabled, ty, tz)
              local mode, ay, WINDSCREEN_SNOW = 'snow', 0, enabled
        ''' + impact + deposits + '\nreturn clumpsPerSecond, snowImpact\nend')

    def rate(self, az, density=1, enabled=True, ty=.554, tz=-.833):
        """Shipped deposition rate for relative forward wind az in m/s. Pure."""
        return self.exposure(az, density, enabled, ty, tz)[0]

    def test_tailwind_keeps_a_small_snowfall_without_driving(self):
        for ty, tz in ((.554, -.833), (.436, -.900), (1, 0)):
            with self.subTest(ty=ty):
                tailwind = self.rate(20, ty=ty, tz=tz)
                self.assertGreater(tailwind, 450 * .25)
                self.assertLess(tailwind, 450)

    def test_acceleration_into_headwind_rises_gradually_and_stays_bounded(self):
        # A 15 m/s rear wind used to postpone deposits until almost 50 km/h on this pane.
        rates = [self.rate(15 - kmh / 3.6) for kmh in range(0, 181)]
        self.assertTrue(all(a < b for a, b in zip(rates, rates[1:])))
        self.assertLess(max(b - a for a, b in zip(rates, rates[1:])), 450 * .1)
        self.assertLess(max(rates), 450 * 5)

    def test_intensity_and_off_switch_still_control_all_deposits(self):
        for az in (-30, 0, 20):
            self.assertEqual(self.rate(az, density=0), 0)
            self.assertEqual(self.rate(az, enabled=False), 0)
            self.assertLess(self.rate(az, .3), self.rate(az, .65))
            self.assertLess(self.rate(az, .65), self.rate(az, 1))
            # The wiper ridge and deposited field must use the same incoming snow.
            clumps, ridge = self.exposure(az, 1, True, .554, -.833)
            self.assertAlmostEqual(clumps / 450, ridge / .65)


if __name__ == '__main__':
    unittest.main()
