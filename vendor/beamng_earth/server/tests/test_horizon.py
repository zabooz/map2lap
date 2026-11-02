"""Horizon mode (docs/V1_4_SPEC.md §3.6 "Radius: the real line-of-sight horizon", milestone M1h;
earthd --horizon, off by default): the horizon distances with refraction, the per-anchor zmax grid
(a coarse DEM pass, never below the DEM's pixels), RADIUS = clamp(sqrt(2R'h_eye) + sqrt(2R'zmax_region),
80 km, 1500 km), the disc selection with L10 roots and the per-tile horizon cull (the selection tiles
the disc minus the culled nodes exactly once), the scratchpad viewshed numbers (Whitney summit, eye
4417 m: San Gorgonio, 306 km away, stays; sea-level ground past the horizon goes), the number of
extra tiles, the near field (< 80 km) and its demand unchanged, and the server's eye, textures,
zooms and flags.

The synthetic terrain is sea level with cones at Mount Whitney (the anchor, 4415 m) and San
Gorgonio (3342 m, the scratchpad `viewshed.py` z7 value), or the real DEM's numbers checked
offline (2026-10-10, z6, Whitney summit: radius 503 km, zmax 4217 m, 83 tiles beyond 80 km; Central
Valley floor 289 km; open ocean 80 km; recorded in docs/V1_4_SPEC.md §3.6 implementation notes).
"""
import math
import random
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import dem as demmod  # noqa: E402
import farfield as ff  # noqa: E402
import geodesy as g  # noqa: E402

WHITNEY = (36.5785, -118.2923)          # the anchor (the mod's default start)
SAN_GORGONIO = (34.0991, -116.8250)     # 3506 m summit; 3342 m in the z7 DEM the viewshed used
EYE_WHITNEY = 4417.0                    # summit + 1.7 m (spec §3.6)
FRAME = g.EnuFrame(*WHITNEY)
SG_XY = tuple(float(v) for v in FRAME.geodetic_to_enu(*SAN_GORGONIO, 0.0)[:2])
LAY64 = ff.Layout(64)


class SampledConeDem:
    """Sea level with cones ((x, y) in FRAME, height, base radius), sample() only (horizon_grid
    then samples it twice per block and axis, as for the other tests' synthetic DEMs)."""

    def __init__(self, cones):
        self.cones = cones

    def height(self, lat, lon):
        e, n, _ = FRAME.geodetic_to_enu(np.asarray(lat, np.float64), np.asarray(lon, np.float64), 0.0)
        z = np.zeros(np.broadcast(e, n).shape)
        for (cx, cy), h, r in self.cones:
            z = np.maximum(z, h * np.clip(1.0 - np.hypot(e - cx, n - cy) / r, 0.0, 1.0))
        return z

    def sample(self, lat, lon, zoom, progress=None):
        return self.height(lat, lon)

    def pixel_height(self, zoom, fx, fy):
        w = 2 ** zoom * demmod.TILE
        lon = fx / w * 360.0 - 180.0
        lat = np.degrees(np.arctan(np.sinh(np.pi * (1.0 - 2.0 * fy / w))))
        return self.height(lat, lon)


class ConeDem(SampledConeDem):
    """The same with block_max, as dem.Dem has it: the cones at every DEM pixel centre of the tile, so
    the grid sees what a real DEM's pixels would show."""

    def block_max(self, z, x, y, block):
        f = np.arange(demmod.TILE) + 0.5
        fx, fy = np.meshgrid(x * demmod.TILE + f, y * demmod.TILE + f)
        a = self.pixel_height(z, fx, fy)
        n = demmod.TILE // block
        return a.reshape(n, block, n, block).max(axis=(1, 3))


WHITNEY_CONE = ((0.0, 0.0), 4415.0, 20000.0)
SG_CONE = (SG_XY, 3342.0, 15000.0)
_GRIDS = {}








def dist(node, px, py):
    s = ff.level_size(node[0])
    x0, y0 = node[1] * s, node[2] * s
    return math.hypot(max(x0 - px, 0.0, px - x0 - s), max(y0 - py, 0.0, py - y0 - s))


def check_partition(tc, tiles, refined, px, py, radius, horizon):
    """The tiles are an exact quadtree partition of the disc minus the culled nodes: no tile is an
    ancestor of another, every child of a refined node is a tile, refined, outside the disc or
    culled, every root in the disc is a tile or refined, and random points of the disc lie in
    exactly one tile unless a culled node holds them. (tc: the TestCase; also used by test_server.)"""
    nodes = {t.node for t in tiles.values()}

    def inside(n):
        d = dist(n, px, py)
        return d < radius and (horizon is None or horizon.keeps(*n, d))
    internal = set()
    for lvl, i, j in nodes:
        while lvl < ff.HORIZON_MAX_LEVEL:
            lvl, i, j = lvl + 1, i >> 1, j >> 1
            internal.add((lvl, i, j))
    tc.assertFalse(nodes & internal, "a tile overlaps another")
    tc.assertEqual(internal, set(refined) & internal)
    for lvl, i, j in internal:
        for c in ((lvl - 1, 2 * i, 2 * j), (lvl - 1, 2 * i + 1, 2 * j), (lvl - 1, 2 * i, 2 * j + 1),
                  (lvl - 1, 2 * i + 1, 2 * j + 1)):
            tc.assertTrue(c in nodes or c in internal or not inside(c), c)
    s = ff.level_size(ff.HORIZON_MAX_LEVEL)
    for i in range(math.floor((px - radius) / s), math.ceil((px + radius) / s)):
        for j in range(math.floor((py - radius) / s), math.ceil((py + radius) / s)):
            n = (ff.HORIZON_MAX_LEVEL, i, j)
            tc.assertTrue(n in nodes or n in internal or not inside(n), n)
    for n in nodes:
        tc.assertTrue(inside(n), n)
    rng = random.Random(3)
    for _ in range(3000):
        a, r = rng.uniform(0, 2 * math.pi), radius * math.sqrt(rng.random()) * 0.999
        x, y = px + r * math.cos(a), py + r * math.sin(a)
        hits = [t for t in tiles.values() if t.bbox[0] <= x < t.bbox[2] and t.bbox[1] <= y < t.bbox[3]]
        if len(hits) == 1:
            continue
        tc.assertEqual(hits, [], (x, y))
        lvl = ff.HORIZON_MAX_LEVEL                   # uncovered: some node on its path is culled
        while True:
            s = ff.level_size(lvl)
            n = (lvl, math.floor(x / s), math.floor(y / s))
            if not inside(n):
                break
            tc.assertIn(n, internal, (x, y))
            lvl -= 1


class HorizonMathTest(unittest.TestCase):
    def test_distances(self):
        self.assertAlmostEqual(ff.R_REFRACTED, 6371000.0 / 0.87, delta=1e-6)
        self.assertAlmostEqual(ff.R_REFRACTED / 1000, 7323, delta=1)
        self.assertAlmostEqual(ff.horizon_distance(EYE_WHITNEY) / 1000, 254.3, delta=0.1)
        self.assertAlmostEqual(ff.horizon_distance(10000.0) / 1000, 382.7, delta=0.1)      # 10 km: 357 km without refraction
        self.assertAlmostEqual(ff.horizon_distance(10000.0, ff.R_EARTH) / 1000, 357.0, delta=0.1)
        self.assertEqual((ff.horizon_distance(0.0), ff.horizon_distance(-86.0)), (0.0, 0.0))  # Death Valley
        # spec §3.6 examples: Whitney summit ~480-510 km bound; the valley floor with the Sierra ~290 km;
        # the cap 1500 km covers eyes up to ~40 km over the highest terrain
        self.assertAlmostEqual((ff.horizon_distance(EYE_WHITNEY) + ff.horizon_distance(4421)) / 1000, 509, delta=1)
        self.assertAlmostEqual((ff.horizon_distance(110) + ff.horizon_distance(4421)) / 1000, 295, delta=1)
        self.assertLess(ff.horizon_distance(40000) + ff.horizon_distance(4000), ff.HORIZON_MAX)
        self.assertEqual((ff.HORIZON_MIN, ff.HORIZON_MAX, ff.HORIZON_MAX_LEVEL), (80000.0, 1500000.0, 10))



class HorizonGridTest(unittest.TestCase):
    def test_pyramid_lookup(self):
        n = 32                                          # one L10 node per side: half = 262 km / 2 ... 2 nodes
        half = n * ff.level_size(ff.HORIZON_GRID_LEVEL) / 2
        base = np.zeros((n, n))
        base[3, 20] = 1234.0                            # L6 node (4, -13)
        base[30, 1] = 500.0                             # L6 node (-15, 14)
        grid = ff.HorizonGrid(half, base)
        self.assertEqual(grid.zmax(6, 4, -13), 1234.0)
        self.assertEqual(grid.zmax(7, 2, -7), 1234.0)
        self.assertEqual(grid.zmax(9, 0, -2), 1234.0)
        self.assertEqual(grid.zmax(10, 0, -1), 1234.0)
        self.assertEqual(grid.zmax(10, -1, 0), 500.0)
        self.assertEqual(grid.zmax(10, 0, 0), 0.0)
        self.assertEqual(grid.zmax(-1, 4 * 128 + 5, -13 * 128 + 127), 1234.0)       # a finer node: its L6 ancestor
        self.assertEqual(grid.zmax(0, 4 * 64, -13 * 64), 1234.0)
        self.assertEqual(grid.zmax(5, 9, -26), 1234.0)
        self.assertEqual(grid.zmax(5, -30, 29), 500.0)
        self.assertEqual(grid.zmax(5, -31, 28), 0.0)                                # its neighbour's parent
        self.assertEqual(grid.zmax(10, 1, 0), math.inf)                             # outside: never culled
        self.assertEqual(grid.zmax(6, -17, 0), math.inf)
        with self.assertRaises(ValueError):
            ff.HorizonGrid(half, np.zeros((24, 24)))

    def test_radius(self):
        n = 96                                          # 3 L10 nodes per side: 786 km half-size
        half = n * ff.level_size(6) / 2
        s = ff.level_size(6)
        base = np.zeros((n, n))
        base[n // 2, n // 2] = 4400.0                   # the eye's own cell (0, 0)
        grid = ff.HorizonGrid(half, base)
        r, zr = grid.radius(100.0, 100.0, 4417.0)
        self.assertEqual(zr, 4400.0)                    # the eye's own cell is always in sight
        self.assertAlmostEqual(r, ff.horizon_distance(4417.0) + ff.horizon_distance(4400.0))
        # a 3000 m cell 300 km away is in sight (254 + 210 km); a 6000 m one 650 km away is not (254 + 296)
        base[n // 2, n // 2] = 0.0
        base[n // 2, n // 2 + int(300000 // s)] = 3000.0
        base[n // 2, n // 2 + int(650000 // s)] = 6000.0
        grid = ff.HorizonGrid(half, base)
        r, zr = grid.radius(0.0, 0.0, 4417.0)
        self.assertEqual(zr, 3000.0)
        self.assertAlmostEqual(r, ff.horizon_distance(4417.0) + ff.horizon_distance(3000.0))
        self.assertEqual(grid.radius(0.0, 0.0, 10000.0)[1], 6000.0)    # 383 + 296 km: from 10 km it is
        # sea level everywhere: the 80 km floor; very high: the 1500 km cap
        flat = ff.HorizonGrid(half, np.zeros((n, n)))
        self.assertEqual(flat.radius(0.0, 0.0, 2.0), (ff.HORIZON_MIN, 0.0))
        self.assertEqual(flat.radius(0.0, 0.0, 200000.0)[0], ff.HORIZON_MAX)

    def test_grid_is_never_below_the_dem_pixels(self):
        """Every L6 cell's zmax is at least every DEM pixel (at the grid's zoom) whose centre lies in
        the cell: the cull can only keep too much."""
        dem = ConeDem((WHITNEY_CONE, SG_CONE, ((-60000.0, 90000.0), 2500.0, 9000.0)))
        half = ff.level_size(10)
        grid = ff.horizon_grid(FRAME, dem, half)
        self.assertEqual(grid.base.shape, (32, 32))
        self.assertEqual(grid.zoom, ff.HORIZON_DEM_ZOOM)
        rng = np.random.default_rng(5)
        xy = rng.uniform(-half, half, (20000, 2))
        xy[:200] = rng.normal(0.0, 3000.0, (200, 2))                    # the summits
        xy[200:400] = np.array(SG_XY) + rng.normal(0.0, 3000.0, (200, 2))
        lat, lon, _ = FRAME.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        fx, fy = ff._merc(lat, lon, grid.zoom)
        pz = dem.pixel_height(grid.zoom, np.floor(fx) + 0.5, np.floor(fy) + 0.5)   # the pixel the point lies in
        s = ff.level_size(6)
        for (x, y), z in zip(xy, pz):
            self.assertGreaterEqual(grid.zmax(6, int(x // s), int(y // s)), z - 1e-6, (x, y))
        # and not grossly above it: the summit cell is the summit, sea-level cells far off stay 0
        self.assertAlmostEqual(grid.zmax(6, 0, 0), 4415.0, delta=4415.0 * 1000 / 20000)
        self.assertEqual(grid.zmax(6, 15, 15), 0.0)

    def test_sampled_dem_and_cache(self):
        """A DEM without block_max is sampled (the tests' synthetic DEMs); the block cache is
        filled once and reused by the next anchor."""
        cache = {}
        half = ff.level_size(10)
        a = ff.horizon_grid(FRAME, SampledConeDem((WHITNEY_CONE,)), half, cache=cache)
        self.assertTrue(cache and all(k[0] == ff.HORIZON_DEM_ZOOM and k[3] == ff.HORIZON_BLOCK for k in cache))
        self.assertGreater(a.zmax(6, 0, 0), 3500.0)
        n = len(cache)

        class NoDem:
            def sample(self, *a, **kw):
                raise AssertionError("cached blocks must not be sampled again")
        b = ff.horizon_grid(FRAME, NoDem(), half, cache=cache)
        self.assertEqual(len(cache), n)
        self.assertTrue(np.array_equal(a.base, b.base))

    def test_dem_block_max(self):
        """dem.Dem.block_max: the max of each block x block pixel square of a tile (row 0 north)."""
        with tempfile.TemporaryDirectory() as tmp:
            d = demmod.Dem(tmp)
            try:
                tile = np.arange(512 * 512, dtype=np.float32).reshape(512, 512)
                d._lru[(6, 10, 20)] = tile              # in memory: no download
                bm = d.block_max(6, 10, 20, 8)
                self.assertEqual(bm.shape, (64, 64))
                self.assertEqual(bm[0, 0], tile[7, 7])
                self.assertEqual(bm[63, 63], tile[511, 511])
                self.assertEqual(bm[2, 5], tile[23, 47])
            finally:
                d.pool.shutdown()



class DiscSelectionTest(unittest.TestCase):
    def test_disc_without_cull_covers_exactly_once(self):
        for layout in (LAY64, ff.V131):
            for px, py, radius in ((0.0, 0.0, 300000.0), (12345.0, -6789.0, ff.HORIZON_MIN),
                                   (-262144.0, 131072.0, 700000.0), (5000.0, 5000.0, 1500000.0)):
                with self.subTest(cells=layout.cells, p=(px, py), r=radius):
                    tiles, refined = ff.select(px, py, (), frozenset(), radius=radius, layout=layout,
                                               min_level=layout.min_level, max_level=ff.HORIZON_MAX_LEVEL, disc=True)
                    check_partition(self, tiles, refined, px, py, radius, None)


    def test_square_default_is_unchanged(self):
        """disc / horizon off: the v1.3.1 square (the arguments' defaults change nothing)."""
        a = ff.select(1234.0, -777.0, (), frozenset(), min_level=-2)
        b = ff.select(1234.0, -777.0, (), frozenset(), min_level=-2, disc=False, horizon=None)
        self.assertEqual(a, b)
        corner = [t for t in a[0].values() if t.distance(1234.0, -777.0) > ff.RADIUS]
        self.assertTrue(corner)                         # the square's corners (a disc has none)
        self.assertTrue(all(t.level <= ff.MAX_LEVEL for t in a[0].values()))


class HorizonCullTest(unittest.TestCase):




    def test_swap_groups_reach_level_10(self):
        """An L10 tile and its four L9 children form one swap group (the union walks up to L10)."""
        kids = [f"9_{i}_{j}" for i in (2, 3) for j in (-2, -1)]
        groups = ff.swap_groups({"10_1_-1"}, set(kids))
        self.assertEqual(groups, [(sorted(kids), ["10_1_-1"])])




if __name__ == "__main__":
    unittest.main()
