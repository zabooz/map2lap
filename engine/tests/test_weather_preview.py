"""Weather preview regressions: execute its Lua under LuaJIT with a small graphics host.

The optional Lua runtime is development-only; see tools/weather_preview/README.md.
These tests check state and geometry, not shader appearance or actual CSP timings.
"""
import importlib.util
import json
import math
import os
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'tools' / 'weather_preview'
sys.path.insert(0, str(ROOT / 'src'))
# Import persistent native dependencies outside the temporary sys.modules mock used by the launcher host.
from app import weather
if extra := os.environ.get('MAP2LAP_LUA_TESTS'):
    sys.path.insert(0, extra)
try:
    from lupa.luajit21 import LuaRuntime
except ImportError:
    LuaRuntime = None


HOST = r'''
local vector = {}
vector.__index = vector
function vector:set(x, y, z)
  if type(x) == 'table' then self.x, self.y, self.z = x.x, x.y, x.z
  else self.x, self.y, self.z = x, y, z end
  return self
end
function vector:scale(k) self.x, self.y, self.z = self.x*k, self.y*k, self.z*k; return self end
function vec3(x,y,z) return setmetatable({x=x or 0,y=y or 0,z=z or 0}, vector) end
function vec2(x,y) return vec3(x,y,0) end
function rgb(r,g,b) return {r=r,g=g,b=b} end
mat4x4 = {identity=function() return {} end}
script = {}
testHost = {physicsRoofs={}, trackRoofs={}, uploaded=0, draws=0}
local sim = {cameraPosition=vec3(0,5,0), cameraPositionDelta=vec3(), cameraLook=vec3(0,0,1),
  cameraUp=vec3(0,1,0), cameraSide=vec3(1,0,0), cameraFOV=56, windSpeedKmh=0,
  skyColor=rgb(0.1,0.1,0.1), horizonColor=rgb(0.1,0.1,0.1), lightColor=rgb(0.1,0.1,0.1)}
local condition = {currentType=15}
local enums = {}
for i,name in ipairs({'LightThunderstorm','Thunderstorm','HeavyThunderstorm','LightDrizzle','Drizzle',
  'HeavyDrizzle','LightRain','Rain','HeavyRain','LightSnow','Snow','HeavySnow'}) do enums[name]=i-1 end
local mesh = {}
function mesh:setVisible(v) end
function mesh:alterVertices(v) testHost.uploaded=testHost.uploaded+1 end
local holder = {createMesh=function() return mesh end}
ac = {WeatherType=enums, FolderID={CurrentTrack=0}, getFolder=function() return '.' end,
  getSim=function() return sim end, getConditionsSet=function() return condition end,
  getWindVelocityTo=function(v) v:set(0,0,0) end, setMessage=function() end, log=function() end,
  setAppOpen=function() end, getPatchVersion=function() return 'test' end, getPatchVersionCode=function() return 3465 end}
ac.INIConfig = {trackConfig=function() return {get=function() return true end} end,
  raceConfig=function() return {get=function(_, section, key, default) return default end} end}
ac.getCar = function() return {position=vec3(0,5,0), side=vec3(1,0,0), velocity=vec3()} end
function ac.findNodes(path)
  assert(path=='luaRoot:yes', 'Disabled windscreen must not query car meshes')
  return {createNode=function() return holder end}
end
function ac.VertexBuffer(n)
  local raw = {}
  for i=0,n-1 do raw[i]={pos=vec3(),normal=vec3(),uv=vec2()} end
  return {raw=raw}
end
function ac.IndicesBuffer(n) return {set=function() end} end
render = {BlendMode={AlphaBlend=0}, CullMode={None=0}, DepthMode={ReadOnly=0},
  setBlendMode=function() end, setCullMode=function() end, setDepthMode=function() end,
  getRenderTargetSize=function() return {x=1600,y=900} end, fullscreenPass=function() end,
  on=function() return {} end}
function render.mesh(pass) testHost.draws=testHost.draws+1 end
local function intersection(origin,dir,length,roofs,ground)
  local hit = math.huge
  for _,height in ipairs(roofs) do
    local t=(height-origin.y)/dir.y
    if t>0 and t<=length then hit=math.min(hit,t) end
  end
  if ground then
    local t=-origin.y/dir.y
    if t>0 and t<=length then hit=math.min(hit,t) end
  end
  return hit<math.huge and hit or -1
end
function render.createRay(origin,dir,length)
  return {physics=function() return intersection(origin,dir,length,testHost.physicsRoofs,true) end,
    track=function() return intersection(origin,dir,length,testHost.trackRoofs,false) end}
end
ui = {keyboardButtonDown=function() return false end}
io.load = function() return nil end
os.preciseClock = os.clock
'''

EXPORT = r'''
return {
  refresh=function(x,y,z,n) for i=1,n do updateShelter(x,y,z) end end,
  covered=sheltered,
  step=function(m,d,dt)
    previousWeather=ac.getConditionsSet().currentType
    setMode(m); density=d
    script.frameBegin(dt,dt)
  end,
  tailCount=function()
    local n=0
    for i=SPLASH_FIRST,COUNT-1 do if raw[i*4].pos.y>-9000 then n=n+1 end end
    return n
  end,
  zeroRelativeRain=function()
    buildRain(1,px[0],py[0],pz[0]-5,0,0,1,0.001,0,5.5+weight[0]*3.5,0,1)
    return raw[0].pos.x,raw[0].pos.y,raw[0].pos.z
  end,
  draw=script.draw3D
}
'''


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class WeatherLuaTest(unittest.TestCase):
    def setUp(self):
        self.lua = LuaRuntime(unpack_returned_tuples=True)
        self.lua.execute(HOST)
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        # This host exercises outdoor geometry only; car-mesh/glass rendering requires AC.
        source = source.replace('local WINDSCREEN_ENABLED = true', 'local WINDSCREEN_ENABLED = false', 1)
        self.api = self.lua.execute(source + EXPORT)

    def test_shelter_finds_roof_and_leaves_open_sky_clear(self):
        self.lua.execute('testHost.physicsRoofs={10}')
        self.api.refresh(0, 5, 0, 250)
        self.assertTrue(self.api.covered(2, 6, 2))
        self.assertFalse(self.api.covered(2, 11, 2))
        self.assertFalse(self.api.covered(200, 6, 200))

    def test_shelter_refresh_forgets_removed_roof(self):
        self.lua.execute('testHost.physicsRoofs={10}; testHost.trackRoofs={12}')
        self.api.refresh(0, 5, 0, 250)
        self.assertTrue(self.api.covered(2, 6, 2))
        self.lua.execute('testHost.physicsRoofs={}; testHost.trackRoofs={}')
        self.api.refresh(0, 5, 0, 250)
        self.assertFalse(self.api.covered(2, 6, 2))

    def test_upper_deck_also_shelters_particles_above_lower_deck(self):
        self.lua.execute('testHost.physicsRoofs={10,12}')
        self.api.refresh(0, 5, 0, 250)
        self.assertTrue(self.api.covered(2, 11, 2))

    def test_shelter_handles_negative_track_coordinates(self):
        self.lua.execute('testHost.physicsRoofs={10}')
        self.api.refresh(-24, 5, -28, 250)
        self.assertTrue(self.api.covered(-22, 6, -26))

    def test_rain_splashes_clear_when_switching_to_light_snow(self):
        self.api.step('rain', 1, 0.1)
        self.assertGreater(self.api.tailCount(), 0)
        self.api.step('snow', 0.3, 0.1)
        self.assertEqual(self.api.tailCount(), 0)

    def test_matching_rain_and_camera_velocity_does_not_create_nan(self):
        self.assertTrue(all(math.isfinite(v) for v in self.api.zeroRelativeRain()))

    def test_disabled_windscreen_never_queries_car_meshes(self):
        self.api.step('rain', 1, 0.01)
        self.api.draw()
        self.assertEqual(self.lua.globals().testHost.draws, 1)


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class WeatherControllerTest(unittest.TestCase):
    def load(self, fog):
        lua = LuaRuntime(unpack_returned_tuples=True)
        lua.execute(HOST)
        lua.globals().extraFog = fog
        lua.execute('''
          ac.WeatherType.Fog=20
          ac.INIConfig.raceConfig=function() return {get=function() return extraFog end} end
          ac.ConditionsSet=function() return {} end
          ac.getInputWeatherType=function() return 11 end
          ac.getInputTemperatures=function() return {} end
          ac.getInputWind=function() return {direction=82,speedFrom=25,speedTo=25} end
          ac.getInputHumidity=function() return 0.5 end
          ac.getInputPressure=function() return 101325 end
          ac.getInputTrackState=function() return {} end
          ac.setConditionsSet2=function(c) chosen=c end
          package.preload['shared/sim/weather']=function()
            return {setRainIntensity=function(c) c.rainIntensity=0 end, debugAware=function() return false end}
          end
        ''')
        lua.execute((ROOT / 'assets/weather/controller.lua').read_text(encoding='utf-8'))
        return lua.globals().chosen

    def test_additional_native_fog_keeps_the_selected_snow_type_and_wind(self):
        c = self.load(True)
        self.assertEqual((c.currentType, c.upcomingType, c.transition), (11, 20, .65))
        self.assertEqual((c.wind.direction, c.wind.speedFrom, c.wind.speedTo), (82, 25, 25))
        self.assertEqual((c.rainWetness, c.rainWater), (0, 0))

    def test_without_additional_fog_the_native_weather_is_unchanged(self):
        c = self.load(False)
        self.assertEqual((c.currentType, c.upcomingType, c.transition), (11, 11, 0))


class PreviewFilesTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        ext, docs, runtime, source = (root / n for n in ('extension', 'docs', 'runtime', 'source'))
        for folder in (ext, docs / 'cfg', runtime, source):
            folder.mkdir(parents=True)
        self.context = SimpleNamespace(AC=root, DOCS=docs, EXT=ext, MODE=ext / 'mode.txt',
            MODES=('off', 'rain', 'snow', 'auto'), RUNTIME=runtime, SCRIPT=ext / 'probe.lua',
            SOURCE=source, STATE=runtime / 'session.json', TRACK=root / 'test_track',
            system=SimpleNamespace(running=lambda name: False))
        self.config = ext / 'ext_config.ini'
        self.race, self.video = docs / 'cfg/race.ini', docs / 'cfg/video.ini'
        self.before = {self.config: b'[BASIC]\nACTIVE=1\n', self.race: b'[CAR_0]\nMODEL=test\n',
                       self.video: b'[VIDEO]\nWIDTH=3440\nHEIGHT=1440\n'}
        for path, raw in self.before.items():
            path.write_bytes(raw)
        (source / 'weather.lua').write_bytes(b'-- source\n')

    def load(self, name):
        spec = importlib.util.spec_from_file_location('weather_test_' + name, SOURCE / (name + '.py'))
        module = importlib.util.module_from_spec(spec)
        with mock.patch.dict(sys.modules, {'context': self.context}):
            spec.loader.exec_module(module)
        return module

    def launch(self, on_exit=lambda: None):
        run = self.load('run')
        proc = mock.Mock(pid=12345)
        proc.poll.return_value = 0
        proc.wait.side_effect = lambda: (on_exit(), 0)[1]
        with mock.patch.dict(sys.modules, {'snow_rust': SimpleNamespace(ensure_running=mock.Mock())}), \
                mock.patch.object(sys, 'argv', ['run.py']), mock.patch.object(run.subprocess, 'Popen', return_value=proc), \
                mock.patch('builtins.print'):
            run.main()
        return json.loads(self.context.STATE.read_text())

    def test_exit_restores_original_configuration_and_removes_probe(self):
        state = self.launch()
        self.assertTrue(state['restored'])
        for path, raw in self.before.items():
            self.assertEqual(path.read_bytes(), raw)
        self.assertFalse(self.context.SCRIPT.exists())
        self.assertFalse(self.context.MODE.exists())

    def test_exit_preserves_independent_changes_and_restores_other_files(self):
        state = self.launch(lambda: self.video.write_bytes(b'user video settings'))
        self.assertFalse(state['restored'])
        self.assertIn(str(self.video), state['conflicts'])
        self.assertEqual(self.video.read_bytes(), b'user video settings')
        self.assertEqual(self.race.read_bytes(), self.before[self.race])
        self.assertEqual(self.config.read_bytes(), self.before[self.config])

    def test_missing_ini_does_not_stop_restoration_of_other_files(self):
        state = self.launch(lambda: self.race.unlink())
        self.assertFalse(state['restored'])
        self.assertIn(str(self.race), state['conflicts'])
        self.assertFalse(self.race.exists())
        self.assertEqual(self.video.read_bytes(), self.before[self.video])
        self.assertEqual(self.config.read_bytes(), self.before[self.config])


if __name__ == '__main__':
    unittest.main()
