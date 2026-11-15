"""Native parked-wiper vibration must not clear snow or paint a blade ridge."""
from pathlib import Path
import unittest

from test_weather_preview import LuaRuntime

ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class WiperMotionTest(unittest.TestCase):
    def setUp(self):
        lua = LuaRuntime(unpack_returned_tuples=True)
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        update = source[source.index('  local function updateBlades('):source.index('  local function updateDrops(')]
        pack = source[source.index('  local function fillBladeMat('):source.index('  -- Custom Map2Lap water.')]
        self.step = lua.execute('''
            local sqrt,min,elapsed=math.sqrt,math.min,0
            local function cbrt(v) return v^(1/3) end
            local car,offset={},0
            local ac={getCar=function() return car end}
            local transform={transformPoint=function(_,p) return {x=p.x,y=p.y+offset,z=p.z} end}
            local inverse={transformPoint=function(_,p) return p end}
            local blade={a={x=-.4,y=0,z=0},b={x=.2,y=0,z=0},active=0,idle=0,ridge=0,leaked=0,
              node={getWorldTransformationRaw=function() return transform end}}
            local glass={blades={blade},ty=1,tz=0,sc=0}
            local rustRain={active=true}
            local function releaseRidge() error('Unexpected liquid ridge release') end
            local function row() return {set=function(r,x,y,z,w) r.x,r.y,r.z,r.w=x,y,z,w end} end
            local packed={row1=row(),row2=row(),row3=row(),row4=row()}
        ''' + update + pack + '''
            return function(mode,selected,progress,position)
              elapsed=elapsed+.016
              car.wiperMode,car.wiperSelectedMode,car.wiperProgress=mode,selected,progress
              offset=position
              glass.anyActive=updateBlades(.016,inverse)
              fillBladeMat(packed,blade,.014)
              return glass.anyActive,packed.row4.y,blade.pas,blade.as
            end
        ''')

    def test_parked_phase_drift_and_body_jolts_do_not_wipe(self):
        self.step(0, 0, .0009, 0)
        for progress, pose in ((.00089, .001), (.00088, -.002), (.00087, .0015)):
            active, shader_active, _, _ = self.step(0, 0, progress, pose)
            self.assertFalse(active)
            self.assertEqual(shader_active, 0, 'No snow clearing or ridge deposition while parked')

    def test_active_wiper_still_sweeps_and_finishes_after_switch_off(self):
        self.step(1, 1, .1, 0)
        self.assertEqual(self.step(1, 1, .12, .01)[:2], (True, 1))
        # CSP retains wiperMode until the final loop parks, although selected mode is already off.
        self.assertEqual(self.step(1, 0, .14, .02)[:2], (True, 1))
        self.assertEqual(self.step(0, 0, .14001, .021)[:2], (False, 0))

    def test_parked_vibration_is_not_saved_up_for_the_next_sweep(self):
        self.step(0, 0, 0, 0)
        self.step(0, 0, .00001, .002)
        self.step(0, 0, .00002, -.001)
        active, shader_active, previous, current = self.step(1, 1, .01, .003)
        self.assertEqual((active, shader_active), (True, 1))
        self.assertAlmostEqual(previous, -.001)
        self.assertAlmostEqual(current, .003)


if __name__ == '__main__':
    unittest.main()
