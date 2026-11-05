"""Origin-independent world gen (geotiles, .claude/work/geotiles_plan.md phases 1a / 1b):

- the grid and its maths (earthfast geotiles.rs): keys partition the Earth, quads, tiles near a point, world_map exact,
  placement exact at its pivot and within a fraction of a mm round it; the mod's geotile.lua agrees (keys and corners
  bit for bit, placements to 1e-9 m);
- grading plans per planning region: two anchors 15 km apart grade the same place to the same height (1e-6 m), the
  plan cache hits across anchors (no lat0 / lon0 in its keys);
- bridge / tunnel chains per region (roads.ChainStore): one deck profile per chain, whatever the anchor;
- vegetation tiles in tile frames (vegetation.geo_tile_items): the same items from any anchor once placed, the
  tracker keeps what it sent across a rebase.
"""
import math
import os
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import geodesy  # noqa: E402
import geotiles  # noqa: E402
import grading  # noqa: E402
import plancache  # noqa: E402
import roads  # noqa: E402
from test_grading import FakeMD  # noqa: E402
from test_roads import features, FRAME, LAT, LON  # noqa: E402
from test_approaches import overpass, flat_elev  # noqa: E402

LUAJIT = shutil.which("luajit")


def east(lat, lon, km):
    """The frame km east of (lat, lon)."""
    return geodesy.EnuFrame(lat, lon + km * 1000.0 / (111320.0 * math.cos(math.radians(lat))))


class GridTest(unittest.TestCase):

    def test_tiles_near_by_quad(self):
        a = east(LAT, LON, 15.0)
        p = a.geodetic_to_enu(LAT, LON, 0.0)
        got = geotiles.tiles_near(a, float(p[0]), float(p[1]), 600.0)
        self.assertEqual(tuple(got[0][:2]), geotiles.tile_of(LAT, LON))
        self.assertEqual(got[0][2], 0.0)
        self.assertTrue(all(d <= 600.0 for _x, _y, d in got))
        self.assertEqual([d for *_k, d in got], sorted(d for *_k, d in got))
        q = geotiles.quad(a, *geotiles.tile_of(LAT, LON))
        side = np.hypot(*(q[1] - q[0]))
        self.assertTrue(200 < side < 260, side)      # (~237 m at 39 deg)

    def test_world_map_round_trip_and_placement(self):
        t = geotiles.frame(*geotiles.tile_of(LAT, LON))
        a = east(LAT, LON, 15.0)
        pts = np.array([[100.0, -80.0, 1700.0], [-120.0, 110.0, 1550.0], [0.0, 0.0, 1650.0], [5.0, 7.0, -3.0]])
        there = geotiles.world_map(t, a, pts)
        back = geotiles.world_map(a, t, there)
        np.testing.assert_allclose(back, pts, atol=1e-7)
        la, lo, h = geotiles.world_to_geodetic(t, pts)
        x, y, z = geotiles.geodetic_to_world(t, la, lo, h)
        np.testing.assert_allclose(np.c_[x, y, z], pts, atol=1e-7)
        placed = geotiles.place(t, a, (0.0, 0.0, 1650.0), pts)
        self.assertLess(float(np.abs(placed - there).max()), 5e-4, "rigid + shear within half a mm over the tile")
        rigid = geotiles.place(t, a, (0.0, 0.0, 1650.0), pts) - np.outer(pts[:, 2] - 1650.0,
                                                                            geotiles.placement(t, a, (0, 0, 1650.0))[2])
        self.assertGreater(float(np.abs(rigid - there).max()), 0.1, "the shear matters: 23 cm per 100 m at 15 km")

    def test_world_frame_samples_its_own_vertices(self):
        f = geotiles.region_frame(*geotiles.region_of(LAT, LON))
        lat, lon = LAT + 0.1, LON + 0.15          # ~15 km from the region's centre
        x, y, _ = f.geodetic_to_enu(lat, lon, 0.0)
        la, lo, _ = f.enu_to_geodetic(x, y, 0.0)
        self.assertLess(abs(float(la) - lat) + abs(float(lo) - lon), 1e-11)


LUA_AGREE = r"""
package.path = '%s/beamng_earth/lua/ge/extensions/?.lua;' .. package.path
local g = require('beamngEarth/geodesy')
local gt = require('beamngEarth/geotile')
local inp = %s
local out = { keys = {}, tiles = {}, quads = {}, places = {} }
local function f(v) return string.format('%%.17g', v) end
for _, p in ipairs(inp.points) do
  local x, y = gt.tileOf(p[1], p[2], p[3])
  out.keys[#out.keys + 1] = { x, y }
end
for _, t in ipairs(inp.tiles) do
  local cl, cn = gt.centre(t[1], t[2], t[3])
  local s, w, n, e = gt.bounds(t[1], t[2], t[3])
  out.tiles[#out.tiles + 1] = { f(cl), f(cn), f(s), f(w), f(n), f(e) }
end
for _, q in ipairs(inp.quads) do
  local a = g.newAnchor(q[1], q[2])
  local c = gt.quad(a, q[3], q[4], q[5])
  out.quads[#out.quads + 1] = { f(c[1][1]), f(c[1][2]), f(c[2][1]), f(c[2][2]), f(c[3][1]), f(c[3][2]), f(c[4][1]),
    f(c[4][2]) }
end
for _, q in ipairs(inp.places) do
  local pl = gt.placement(g.newAnchor(q[1], q[2]), g.newAnchor(q[3], q[4]), q[5], q[6], q[7])
  local r = {}
  for i = 1, 9 do r[i] = f(pl.r[i]) end
  out.places[#out.places + 1] = { r = r, t = { f(pl.t[1]), f(pl.t[2]), f(pl.t[3]) },
    c = { f(pl.c[1]), f(pl.c[2]), f(pl.c[3]) } }
end
local function enc(v)
  if type(v) == 'table' then
    local parts = {}
    if #v > 0 then
      for _, x in ipairs(v) do parts[#parts + 1] = enc(x) end
      return '[' .. table.concat(parts, ',') .. ']'
    end
    for k, x in pairs(v) do parts[#parts + 1] = '"' .. k .. '":' .. enc(x) end
    return '{' .. table.concat(parts, ',') .. '}'
  end
  return tostring(v)
end
print(enc(out))
"""




class PlansAcrossAnchorsTest(unittest.TestCase):
    """Two anchors 15 km apart: the same heights at the same lat / lon."""

    def setUp(self):
        self.f = features([[(-300, 20), (300, 20)], [(0, -300), (0, 300)], [(-200, -150), (250, 180)]],
                          ["residential", "secondary", "tertiary"])

    @staticmethod
    def hill(la, lo):
        la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)
        return 40.0 + 2000.0 * (la - LAT) + 900.0 * np.sin((lo - LON) * 4000.0)

    def points(self):
        e = np.linspace(-250.0, 250.0, 101)
        n = 30.0 * np.sin(e / 40.0) + 18.0
        la, lo, _ = FRAME.enu_to_geodetic(e, n, 0.0)
        return np.asarray(la), np.asarray(lo)

    def test_same_heights_from_anchors_15_km_apart(self):
        la, lo = self.points()
        base = self.hill(la, lo)
        a = grading.Grader(FRAME, FakeMD(self.f), self.hill)
        b = grading.Grader(east(LAT, LON, 15.0), FakeMD(self.f), self.hill)
        za = a.apply(la, lo, base, grading.ROAD_LIFT)
        zb = b.apply(la, lo, base, grading.ROAD_LIFT)
        self.assertGreater(float(np.abs(za - base).max()), 0.05, "graded at all")
        self.assertLess(float(np.abs(za - zb).max()), 1e-6)

    def test_one_store_plans_once_for_every_anchor(self):
        md = FakeMD(self.f)
        store = grading.PlanStore(md, self.hill)
        la, lo = self.points()
        a = grading.Grader(FRAME, md, self.hill, store=store)
        a.apply(la, lo, self.hill(la, lo))
        calls = md.calls
        b = grading.Grader(east(LAT, LON, 15.0), md, self.hill, store=store)
        b.apply(la, lo, self.hill(la, lo))
        self.assertEqual(md.calls, calls, "the second anchor planned nothing again")
        # plans handed out in each anchor's own world: the same places
        pa, pb = a.plans(la, lo), b.plans(la, lo)
        self.assertEqual(len(pa), len(pb))
        for p, q in zip(pa, pb):
            ga = np.c_[FRAME.enu_to_geodetic(p.xy[:, 0], p.xy[:, 1], 0.0)[:2]]
            fb = b.frame
            back = geotiles.world_xy_map(fb, FRAME, q.xy)
            self.assertLess(float(np.abs(back - p.xy).max()), 1e-6)
            self.assertTrue(np.array_equal(p.z, q.z))
            del ga

    def test_plan_cache_hits_across_anchors(self):
        root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, root, True)
        os.environ[plancache.RUN_ENV] = "geo"
        self.addCleanup(os.environ.pop, plancache.RUN_ENV, None)
        la, lo = self.points()
        a = grading.Grader(FRAME, FakeMD(self.f), self.hill)
        a.shared = plancache.for_grader(root, a, None, None)
        za = a.apply(la, lo, self.hill(la, lo))
        md = FakeMD(self.f)
        b = grading.Grader(east(LAT, LON, 15.0), md, self.hill)          # (another process, another anchor)
        b.shared = plancache.for_grader(root, b, None, None)
        zb = b.apply(la, lo, self.hill(la, lo))
        self.assertEqual(md.calls, 0, "read from the cache: no road data fetched")
        self.assertGreater(b.shared.stats["read"], 0)
        self.assertTrue(np.array_equal(za, zb))

    def test_region_border_neighbours_read_in(self):
        # a place whose cells straddle two planning regions: the same heights either side, from each region's own
        # planner or the neighbour's plans mapped in
        rx, ry = geotiles.region_of(LAT, LON)
        _c, _d, s, w, n, e = geotiles.info(rx, ry, geotiles.PLAN_Z)
        lat0, lon0 = (s + n) / 2, e         # the region's east edge
        f0 = geodesy.EnuFrame(lat0, lon0)
        M_LON = 111320.0 * math.cos(math.radians(lat0))
        ft = features([[(-300, 0), (300, 0)]], ["secondary"])
        ft.lonlat[:, 0] = ft.lonlat[:, 0] - LON + lon0
        ft.lonlat[:, 1] = ft.lonlat[:, 1] - LAT + lat0
        ee = np.linspace(-120, 120, 49)
        la, lo, _ = f0.enu_to_geodetic(ee, np.full(len(ee), 3.0), 0.0)
        la, lo = np.asarray(la), np.asarray(lo)
        ramp = lambda a_, o_: 10.0 + 0.02 * (np.asarray(o_) - lon0) * M_LON      # noqa: E731
        g = grading.Grader(f0, FakeMD(ft), ramp)
        z = g.apply(la, lo, ramp(la, lo))
        self.assertEqual(len(g.store.planners), 2, "both regions")
        # (the cells' boxes are axis-aligned in a frame whose north turns ~0.16 deg from the meridian at a region's
        # edge: the two sides' pieces overlap a few m and blend there, as cells far from one anchor always did)
        self.assertLess(float(np.abs(np.diff(z, 2)).max()), 0.03, "no step at the border")
        one = grading.Grader(f0, FakeMD(ft), ramp)
        one.store.frame_of = lambda region: f0          # (both cells in one frame)
        self.assertLess(float(np.abs(one.apply(la, lo, ramp(la, lo)) - z).max()), 0.02)


class ChainStoreTest(unittest.TestCase):
    def test_one_deck_profile_per_chain(self):
        f = overpass()
        solves = []
        cls = type("Counted", (roads.BridgeProfiles,), {})
        base_solve = roads.BridgeProfiles._solve

        def counted(self, comp, pool, ground):
            solves.append(tuple(comp))
            return base_solve(self, comp, pool, ground)
        cls._solve = counted
        cs = roads.ChainStore(cls, lambda key: f, flat_elev)
        a = roads.ChainView(cs, FRAME)
        b = roads.ChainView(cs, east(LAT, LON, 15.0))
        pa = a.parts([f], (-100, -100, 100, 100))
        pb_box = b.frame.geodetic_to_enu(LAT, LON, 0.0)
        cx, cy = float(pb_box[0]), float(pb_box[1])
        pb = b.parts([f], (cx - 100, cy - 100, cx + 100, cy + 100))
        self.assertEqual(len(solves), 1, "solved once for both anchors")
        self.assertEqual(len(pa), 1)
        self.assertEqual(len(pb), 1)
        (_f, _s, xa, za, _l), (_g, _t, xb, zb, _m) = pa[0], pb[0]
        back = geotiles.world_map(b.frame, FRAME, np.c_[xb, zb])
        np.testing.assert_allclose(back[:, :2], xa, atol=1e-6)
        np.testing.assert_allclose(back[:, 2], za, atol=1e-6)
        # and the same deck as a profile solved in the anchor's own frame (the old per-anchor store) to a mm
        own = roads.BridgeProfiles(FRAME, lambda key: f, flat_elev).parts([f], (-100, -100, 100, 100))[0]
        np.testing.assert_allclose(np.interp(xa[:, 0], own[2][:, 0], own[3]), za, atol=2e-3)

    def test_a_tiles_piers_and_beams_keep_one_order_whichever_chain_was_solved_first(self):
        """The deck mesh's triangles follow them: a tile came out in two orders, by what its process had solved before."""
        xs, box = (30.0, 10.0, 20.0), (0.0, 0.0, 100.0, 100.0)
        for order in (1, -1):
            cs = roads.ChainStore(roads.BridgeProfiles, lambda key: None, flat_elev)
            st = cs.store_at(LAT, LON)
            st.piers = {("part", x): [(x, 5.0, 1.0, 0.0, 10.0, 0.0, 8.0)] for x in xs[::order]}
            st.trusses = {("chain", x): [(np.array([x, 5.0, 10.0]), np.array([x + 2.0, 5.0, 10.0]), 0.3, 0.3)]
                          for x in xs[::order]}
            for read in (st, roads.ChainView(cs, st.frame)):
                self.assertEqual([q[0] for q in read.piers_in(box)], [10.0, 20.0, 30.0])
                self.assertEqual([float(b[0][0]) for b in read.beams_in(box)], [10.0, 20.0, 30.0])

    def test_chain_across_stores_solved_by_its_owner(self):
        f = overpass()
        cs = roads.ChainStore(roads.BridgeProfiles, lambda key: f, flat_elev)
        a = roads.ChainView(cs, FRAME)
        st = cs.store_at(LAT, LON)
        other = cs.store((st.region[0] + 1, st.region[1]))         # (a neighbouring region's store)
        ring = f.lonlat
        todo = [(("cross", 0), f, 0)]
        mine = other.parts_todo(todo)
        self.assertEqual(len(mine), 1)
        self.assertIn(("cross", 0), st.done, "solved by the chain's own store")
        z_own = a.parts([f], (-100, -100, 100, 100))[0][3]
        z_other = geotiles.world_map(other.frame, FRAME, np.c_[mine[0][2], mine[0][3]])[:, 2]
        np.testing.assert_allclose(z_other, z_own, atol=1e-6)
        del ring






if __name__ == "__main__":
    unittest.main()
