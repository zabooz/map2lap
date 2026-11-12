"""Vehicle airflow detaches bounded snow patches without clearing parked glass."""
from pathlib import Path
import unittest

from test_weather_preview import LuaRuntime

ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class SnowWindTest(unittest.TestCase):
    def setUp(self):
        self.lua = LuaRuntime(unpack_returned_tuples=True)
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        helper = source[source.index('local function snowWindPatches('):source.index('local function rainScale()')]
        self.step = self.lua.execute('local min,max,floor=math.min,math.max,math.floor\n' + helper + '\nreturn snowWindPatches')

    def count(self, speed, dt, steps):
        state = self.lua.table_from({'gustBudget': 0})
        return sum(self.step(dt, speed, state) for _ in range(steps))

    def test_parked_and_below_threshold_do_not_detach_snow(self):
        for speed in (0, 2, 4):
            self.assertEqual(self.count(speed, .02, 100), 0)
        state = self.lua.table_from({'gustBudget': .9})
        self.assertEqual(self.step(.1, 0, state), 0)
        self.assertEqual(state.gustBudget, 0)

    def test_more_vehicle_airflow_detaches_more_patches_with_bounded_work(self):
        self.assertGreater(self.count(20, .02, 100), self.count(8, .02, 100))
        state = self.lua.table_from({'gustBudget': 0})
        self.assertLessEqual(self.step(.1, 100, state), 4)

    def test_detachment_rate_is_independent_of_frame_rate(self):
        self.assertEqual(self.count(12, .01, 100), self.count(12, .1, 10))


if __name__ == '__main__':
    unittest.main()
