"""Side snow must pass the glass depth test from cockpit and exterior cameras."""
from pathlib import Path
import math
import unittest

from test_weather_preview import LuaRuntime

ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class SideGlassDepthTest(unittest.TestCase):
    def draw_offset(self, sign, camera, angle=0, origin=(0, 0, 0)):
        """Run the shipped side draw transform for a sloped pane and camera. Pure."""
        lua = LuaRuntime(unpack_returned_tuples=True)
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        block = source.split('local sm = side.drawTransform:set(', 1)[1].split('render.mesh(side.pass)', 1)[0]
        run = lua.execute('''
            local function vec(x,y,z) return {x=x,y=y,z=z} end
            return function(sign, cx, cy, cz, c, s, ox, oy, oz)
              local m = {row1=vec(c,0,-s), row2=vec(0,1,0), row3=vec(s,0,c), row4=vec(ox,oy,oz)}
              function m:transformPoint(p)
                return vec(ox+c*p.x+s*p.z, oy+p.y, oz-s*p.x+c*p.z)
              end
              local parent = {row4=vec(ox,oy,oz)}
              local side = {sign=sign, ty=0.9, tx=-sign*math.sqrt(1-0.9^2), centre=vec(sign*0.6,0.85,0)}
              side.parent = {getWorldTransformationRaw=function() return parent end}
              side.drawTransform = {set=function() return {row4=vec(ox,oy,oz)} end}
              local sim = {cameraPosition=vec(cx,cy,cz)}
              local sm = side.drawTransform:set(''' + block + '''
              return sm.row4.x-ox, sm.row4.y-oy, sm.row4.z-oz
            end
        ''')
        return run(sign, *camera, math.cos(angle), math.sin(angle), *origin)

    def test_cockpit_coating_is_in_front_of_both_depth_writing_panes(self):
        for sign in (-1, 1):
            with self.subTest(sign=sign):
                dx, dy, dz = self.draw_offset(sign, (0, .85, 0))
                # At eye height, the view towards the cabin points opposite each pane's outward normal.
                self.assertLess(dx * sign, 0, 'Snow behind the glass fails its depth test from the cockpit')
                self.assertLessEqual(math.sqrt(dx*dx + dy*dy + dz*dz), .001)

    def test_exterior_coating_keeps_its_outer_surface_offset(self):
        for sign in (-1, 1):
            dx, dy, dz = self.draw_offset(sign, (sign*2, .85, 0))
            self.assertGreater(dx * sign, 0)
            self.assertAlmostEqual(math.sqrt(dx*dx + dy*dy + dz*dz), .004)

    def test_camera_side_uses_car_pose_and_pane_plane(self):
        for sign in (-1, 1):
            for angle in (math.pi/2, math.pi):
                origin = (4000, 1600, -2200)
                camera = (origin[0], origin[1]+.85, origin[2])
                dx, dy, dz = self.draw_offset(sign, camera, angle, origin)
                outward_dot = sign * (dx*math.cos(angle) - dz*math.sin(angle))
                self.assertLess(outward_dot, 0)


@unittest.skipUnless(LuaRuntime, 'Optional LuaJIT test runtime not installed (see weather preview README)')
class SideGlassDiscoveryTest(unittest.TestCase):
    def setUp(self):
        self.lua = LuaRuntime(unpack_returned_tuples=True)
        source = (ROOT / 'assets/weather/weather.lua').read_text(encoding='utf-8')
        self.lua.execute('''
            min,max,sqrt=math.min,math.max,math.sqrt
            local v={}; v.__index=v
            v.__add=function(a,b) return vec3(a.x+b.x,a.y+b.y,a.z+b.z) end
            v.__mul=function(a,b) return vec3(a.x*b,a.y*b,a.z*b) end
            function vec3(x,y,z) return setmetatable({x=x,y=y,z=z},v) end
            glass={sides={}}
            car={isDriverDoorOpen=true,driverEyesPosition=vec3(.3,1,0)}
            root={getWorldTransformationRaw=function() return {inverse=function() return {} end} end}
            local left={lo=vec3(.98,.85,.24),hi=vec3(1.93,1.27,.61)}
            local right={lo=vec3(-.69,.85,-.44),hi=vec3(-.55,1.27,.50)}
            function left:name() return 'left' end
            function right:name() return 'right' end
            found={left,right}; function found:at(i) return self[i] end
            function localBox(mesh) return mesh.lo,mesh.hi end
            function closeDoor()
              car.isDriverDoorOpen=false
              left.lo,left.hi=vec3(.56,.85,-.45),vec3(.70,1.27,.50)
            end
            function sampleSurface() return {} end
            ac={log=function() end}; DEBUG=false
            sideCandidates={}
        ''')
        # Execute the shipped initialization and retry path, with geometry and GPU sampling stubbed.
        helper = source[source.index('local function sidePaneCandidate('):source.index('-- Discovery runs')]
        init = source[source.index('  local function addSidePanes('):source.index('  -- Sample the car')]
        retry = source[source.index('  local sideScanClock'):source.index('  glass.fieldA =')]
        self.refresh = self.lua.execute(helper + init + retry + '\nreturn refreshSidePanes')

    def sides(self):
        return self.lua.globals().glass.sides

    def test_open_driver_door_is_discovered_after_closing_without_reload(self):
        self.refresh(.3, self.lua.globals().car)
        self.lua.globals().closeDoor()
        self.refresh(.3, self.lua.globals().car)
        self.assertEqual(len(self.sides()), 0, 'Wait for the door pose to settle')
        self.refresh(.3, self.lua.globals().car)
        self.assertEqual({p.sign for p in self.sides().values()}, {-1, 1})

    def test_retry_keeps_existing_snow_and_never_adds_duplicate_panes(self):
        self.lua.execute('glass.sides[1]={sign=-1,read="retained snow",step=123}')
        self.lua.globals().closeDoor()
        for _ in range(5):
            self.refresh(.3, self.lua.globals().car)
        self.assertEqual(len(self.sides()), 2)
        self.assertEqual(self.sides()[1].read, 'retained snow')
        self.assertEqual(self.sides()[1].step, 123)


if __name__ == '__main__':
    unittest.main()
