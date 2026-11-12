"""Execute the shipped Lua's main and mirror particle-budget selection without a graphics host."""
import math
from pathlib import Path
import unittest

from test_weather_preview import LuaRuntime

ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class SnowBudgetTest(unittest.TestCase):
    def budget(self, density, snow=True, mirror=False):
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        helpers = source[source.index('local function snowScale()'):source.index('-- The camera-wrapped volume:')]
        block = source.split('function mirrorWeather.update()' if mirror else 'local function build()', 1)[1]
        block = block[block.index('  local scale, amount'):]
        block = block.split('  local mr = ' if mirror else '  if count < activeCount', 1)[0]
        lua = LuaRuntime(unpack_returned_tuples=True)
        return lua.execute(f'local density, snow = {density}, {str(snow).lower()}\n'
                           'local BASE_COUNT, floor = 8192, math.floor\n' + helpers + block + '\nreturn scale, count')

    def test_requested_snow_counts_preserve_flake_sizes(self):
        for density, scale, count in ((.3, 1, 2000), (.65, 1.15, 4500), (1, 1.584, 7000)):
            with self.subTest(density=density):
                self.assertEqual(self.budget(density), (scale, count))

    def test_mirrors_follow_the_same_snow_strength_at_their_existing_budget_ratio(self):
        for density, count in ((.3, 2000), (.65, 4500), (1, 7000)):
            with self.subTest(density=density):
                self.assertEqual(self.budget(density, mirror=True)[1], math.floor(count * 3072 / 8192))

    def test_rain_budgets_remain_unchanged(self):
        for density, count, mirrored in ((.35, 2007, 752), (.65, 4472, 1677), (1, 8601, 3225)):
            with self.subTest(density=density):
                self.assertEqual(self.budget(density, snow=False)[1], count)
                self.assertEqual(self.budget(density, snow=False, mirror=True)[1], mirrored)


if __name__ == '__main__':
    unittest.main()
