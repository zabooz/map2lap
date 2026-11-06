"""The smooth tool: a band follows the road surface from A to B; the road in it comes out even, and joins what lies beyond with no edge."""
import os
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import trackband, trackheights  # noqa: E402
from track import kn5  # noqa: E402

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)


def road_way(cells, points):
    """The way over cells that all lie at one height."""
    return trackband.way(trackband.Road(cells, np.zeros(len(cells))), points)


def road_along_x(length=200, half=6):
    """The cells of a straight road along x at z 0: (i, j)."""
    i, j = np.meshgrid(np.arange(0, length // 2), np.arange(-half // 2, half // 2))
    return np.c_[i.ravel(), j.ravel()]


def lattice(height, xs=(-20, 220), zs=(-30, 30), where=None):
    """A road's ground on the 2 m lattice, its heights by height(x, z), and the kn5's mesh nodes. where(x, z): only the points it holds for, of those the ones in a
    triangle: a build writes no others."""
    xv, zv = np.arange(xs[0], xs[1] + 1, 2.0), np.arange(zs[0], zs[1] + 1, 2.0)
    n = len(xv)
    kept = {j * n + i: (x, z) for j, z in enumerate(zv) for i, x in enumerate(xv) if where is None or where(x, z)}
    used = []
    for j in range(len(zv) - 1):
        for i in range(n - 1):
            a, b, c, d = j * n + i, j * n + i + 1, (j + 1) * n + i, (j + 1) * n + i + 1
            if all(k in kept for k in (a, b, c, d)):
                used += [a, b, c, c, b, d]
    number = {k: m for m, k in enumerate(sorted(set(used)))}
    pos = [(kept[k][0], height(*kept[k]), kept[k][1]) for k in sorted(number)]
    v = np.zeros(len(pos), kn5.VERTEX)
    v["pos"] = pos
    faces = [number[k] for k in used]
    p = np.array(pos)
    centre = (p.min(0) + p.max(0)) / 2
    return kn5.Node(2, "1ROAD_ground_0_0", 1, cast_shadows=0, visible=1, transparent=0, vertices=v, indices=np.array(faces, "<u2"), material=0, layer=0,
                    lod_in=0.0, lod_out=1000.0, bs_center=tuple(centre.tolist()), bs_radius=float(np.linalg.norm(p - centre, axis=1).max()), renderable=1)


class WayTest(unittest.TestCase):
    def test_it_follows_a_road_keeping_to_its_middle(self):
        line, width = road_way(road_along_x(), [[10.0, 0.0], [180.0, 0.0]])
        self.assertLess(float(np.abs(line[:, 1]).max()), 1.5)
        self.assertAlmostEqual(10.0, float(line[0, 0]), delta=2.0)
        self.assertAlmostEqual(180.0, float(line[-1, 0]), delta=2.0)
        self.assertAlmostEqual(16.0, width, delta=2.5)      # (6 cells of 2 m, and a step over on each side)

    def test_it_goes_round_a_bend_not_across(self):
        """An L: straight across lies no road."""
        i, j = np.meshgrid(np.arange(0, 50), np.arange(-2, 2))
        k, m = np.meshgrid(np.arange(46, 50), np.arange(-2, 50))
        cells = np.unique(np.r_[np.c_[i.ravel(), j.ravel()], np.c_[k.ravel(), m.ravel()]], axis=0)
        line, _width = road_way(cells, [[2.0, 0.0], [96.0, 96.0]])
        self.assertGreater(float(line[:, 0].max()), 90.0)
        self.assertLess(float(line[len(line) // 3, 1]), 10.0)    # (a third of the way on it is still on the first leg)

    def test_a_point_in_between_says_which_way(self):
        ring = [(i, j) for i in range(60) for j in range(60) if not (4 <= i < 56 and 4 <= j < 56)]
        cells = np.array(ring)
        short = road_way(cells, [[4.0, 4.0], [116.0, 116.0]])[0]
        via_x_first = road_way(cells, [[4.0, 4.0], [116.0, 4.0], [116.0, 116.0]])[0]
        via_z_first = road_way(cells, [[4.0, 4.0], [4.0, 116.0], [116.0, 116.0]])[0]
        self.assertLess(abs(trackband._along(short)[-1] - trackband._along(via_x_first)[-1]), 30.0)
        self.assertGreater(float(via_x_first[len(via_x_first) // 2, 0]), 90.0)
        self.assertLess(float(via_z_first[len(via_z_first) // 2, 0]), 30.0)

    def test_off_the_road_or_no_road_it_says_so(self):
        cells = road_along_x()
        with self.assertRaisesRegex(trackband.Refused, "Click on the road"):
            road_way(cells, [[10.0, 60.0], [180.0, 0.0]])
        apart = np.r_[road_along_x(40), road_along_x(40) + [40, 0]]
        with self.assertRaisesRegex(trackband.Refused, "No road found"):
            road_way(apart, [[10.0, 0.0], [110.0, 0.0]])

    def test_points_too_far_apart_say_so_before_anything_is_laid_out(self):
        """Two points 10 km apart would ask for a grid of 150 million cells."""
        cells = np.r_[road_along_x(), road_along_x() + [5000, 0]]
        with self.assertRaisesRegex(trackband.Refused, "too far apart"):
            road_way(cells, [[10.0, 0.0], [10010.0, 0.0]])

    def test_what_is_no_band(self):
        for points in (None, [], [[1.0, 2.0]], "x", [[1.0], [2.0]], [["a", "b"], [1, 2]], [[float("nan"), 0.0], [1.0, 2.0]], [[10 ** 400, 0.0], [1.0, 2.0]],
                       [[1.0, 2.0]] * 21):
            with self.assertRaises(ValueError, msg=str(points)[:30]):
                road_way(road_along_x(), points)

    def test_a_large_triangle_is_road_under_all_of_it(self):
        v = np.zeros(3, kn5.VERTEX)
        v["pos"] = [(0.0, 0.0, 0.0), (40.0, 0.0, 0.0), (0.0, 0.0, 40.0)]
        cells, heights = trackband._cells_of_triangles(v, np.array([[0, 1, 2]]))
        np.testing.assert_allclose(heights, 0.0)
        self.assertGreater(len(cells), 150)
        self.assertTrue((np.c_[cells[:, 0] + cells[:, 1]] < 21).all())


class WallTest(unittest.TestCase):
    """1ROAD under a wall and on both sides of it: the way stays on the road it started on."""

    @staticmethod
    def two_levels():
        """A lower road z -4 to 0 at 100 m, right beside it an upper one z 0 to 12 at 106 m; both level, and straight on for 200 m."""
        i, j = np.meshgrid(np.arange(0, 100), np.arange(-2, 6))
        cells = np.c_[i.ravel(), j.ravel()]
        return trackband.Road(cells, np.where(cells[:, 1] < 0, 100.0, 106.0))

    def test_it_does_not_go_up_the_wall_where_the_other_road_is_wider(self):
        """It went over to the upper road, where the middle is further from an edge, and Smooth then moved two level roads by -4 and +13 m."""
        line, width = trackband.way(self.two_levels(), [[0.0, -2.0], [198.0, -2.0]])
        self.assertLess(float(line[:, 1].max()), 0.0)
        self.assertLess(width, 9.0)         # (the lower road's, 4 m and the steps over: the upper one is not more of it)

    def test_two_levels_joined_only_by_a_wall_have_no_way(self):
        with self.assertRaisesRegex(trackband.Refused, "wall or a gap"):
            trackband.way(self.two_levels(), [[0.0, -2.0], [198.0, 6.0]])

    def test_a_step_stops_the_depth_from_each_side(self):
        """Over sides, and with corners over those too: a road is as wide as to its wall, whichever way it runs and on whichever side the wall stands."""
        for corners in (False, True):
            for levels in (np.tile(np.array([0.0] * 6 + [6.0] * 6)[:, None], (1, 12)), np.tile(np.array([0.0] * 6 + [6.0] * 6), (12, 1)),
                           np.fromfunction(lambda j, i: 6.0 * (j + i >= 12), (12, 12)), np.fromfunction(lambda j, i: 6.0 * (j - i >= 0), (12, 12))):
                depth = trackband._inside_depth(levels, corners)
                for rows in (levels == 0.0, levels == 6.0):
                    self.assertLessEqual(int(depth[rows].max()), 6, msg=(corners, levels[0].tolist()))
                    near_wall = rows & (trackband._inside_depth(np.where(rows, 0.0, np.nan), corners) == 1)
                    self.assertEqual(1, int(depth[near_wall].max()), msg=(corners, levels[0].tolist()))

    def test_a_slope_a_road_can_take_is_no_wall(self):
        """37 %, the steepest street there is."""
        i, j = np.meshgrid(np.arange(0, 60), np.arange(-3, 3))
        cells = np.c_[i.ravel(), j.ravel()]
        line, _width = trackband.way(trackband.Road(cells, cells[:, 0] * 2.0 * 0.37), [[2.0, 0.0], [116.0, 0.0]])
        self.assertAlmostEqual(116.0, float(line[-1, 0]), delta=2.0)

    def test_a_triangle_steeper_than_a_road_stands_on_no_cell(self):
        v = np.zeros(6, kn5.VERTEX)
        v["pos"] = [(0.0, 0.0, 0.0), (2.0, 0.0, 0.0), (0.0, 0.0, 2.0), (10.0, 0.0, 0.0), (12.0, 4.0, 0.0), (10.0, 4.0, 2.0)]
        cells, heights = trackband._cells_of_triangles(v, np.array([[0, 1, 2], [3, 4, 5]]))
        self.assertEqual([[0, 0]], cells.tolist())
        np.testing.assert_allclose(heights, 0.0)

    def test_a_long_way_over_a_wide_square_looks_towards_its_goal(self):
        """Searching all around, a square of 160,000 cells took seconds, and the mouse asks for a way as it moves."""
        i, j = np.meshgrid(np.arange(0, 400), np.arange(0, 400))
        cells = np.c_[i.ravel(), j.ravel()]
        with mock.patch.object(trackband.heapq, "heappush", wraps=trackband.heapq.heappush) as pushed:
            trackband.way(trackband.Road(cells, np.zeros(len(cells))), [[100.0, 400.0], [700.0, 400.0]])
        self.assertLess(pushed.call_count, 60000)


class SmoothedTest(unittest.TestCase):
    s = np.arange(0.0, 201.0, 2.0)

    def even(self, heights, strength):
        """A row of heights as it comes out, with its joining."""
        if strength <= 0:
            return heights
        target = trackband._even(self.s, heights[None], trackband._window(float(self.s[-1]), strength))[0]
        return heights + (target - heights) * trackband._joining(self.s, float(self.s[-1]))

    def hill(self):
        return 100.0 + 0.02 * self.s + 3.0 * np.exp(-((self.s - 100.0) / 25.0) ** 2)

    def waves(self):
        return 100.0 + 0.02 * self.s + 0.05 * np.sin(self.s / 8.0 * 2 * np.pi)

    def test_full_strength_takes_a_hill_away(self):
        out = self.even(self.hill(), 1.0)
        line = 100.0 + 0.02 * self.s
        self.assertLess(float(np.abs(out - line)[np.abs(self.s - 100.0) < 70.0].max()), 0.02)

    def test_a_low_strength_takes_the_short_waves_and_leaves_the_hill(self):
        line = 100.0 + 0.02 * self.s
        middle = np.abs(self.s - 100.0) < 70.0
        self.assertLess(float(np.abs(self.even(self.waves(), 0.2) - line)[middle].max()), 0.012)     # (waves of 5 cm mostly gone)
        self.assertGreater(float((self.even(self.hill(), 0.2) - line).max()), 2.5)                   # (a hill of 3 m there)

    def test_more_strength_takes_more_and_nothing_jumps(self):
        """It sprang at 0: a wave stayed whole at 0 %, and only 11 % of it at anything over."""
        line = 100.0 + 0.02 * self.s
        wavy = self.waves() + self.hill() - line
        off = [float(np.abs(self.even(wavy, s) - line).max()) for s in (0.0, 0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 0.75, 1.0)]
        self.assertEqual(off, sorted(off, reverse=True))
        rest = [float(np.abs(self.even(self.waves(), s) - self.waves()).max()) for s in (0.0, 0.03, 0.06, 0.09)]
        self.assertEqual(rest, sorted(rest))
        self.assertLess(rest[1], 0.005)                  # (a little strength does a little: of waves of 5 cm)

    def test_a_straight_slope_stays_as_it_is(self):
        for strength in (0.2, 0.6, 1.0):
            np.testing.assert_allclose(self.even(100.0 + 0.05 * self.s, strength), 100.0 + 0.05 * self.s, atol=1e-6)

    def test_it_joins_at_a_and_b_in_height_and_slope_no_edge(self):
        """A step or a kink at its ends is what the user would feel: the road beyond goes on as it was."""
        out = self.even(self.hill(), 1.0)
        self.assertEqual((float(self.hill()[0]), float(self.hill()[-1])), (float(out[0]), float(out[-1])))
        self.assertLess(float(np.abs(np.diff(out - self.hill())).max() / 2.0), 0.2)

    def test_a_bump_near_an_end_goes_too(self):
        """A bump 8 m from A stayed by a quarter when the change faded out over 12 m."""
        bump = 100.0 + 0.02 * self.s + 1.0 * np.exp(-((self.s - 8.0) / 2.5) ** 2)
        at = np.abs(self.s - 8.0) < 2.5
        self.assertLess(float(np.abs(self.even(bump, 1.0) - (100.0 + 0.02 * self.s))[at].max()), 0.09)

    def test_the_calm_curve_takes_up_the_slopes_it_is_given(self):
        heights = 100.0 + 3.0 * np.exp(-((self.s - 100.0) / 25.0) ** 2)
        out = trackband._even(self.s, heights[None], 1600.0, (0.05, -0.05))[0]
        self.assertAlmostEqual(0.05, float((out[1] - out[0]) / 2.0), delta=0.005)
        self.assertAlmostEqual(-0.05, float((out[-1] - out[-2]) / 2.0), delta=0.005)
        self.assertLess(float(np.abs(np.diff(np.diff(out))).max() / 4.0), 0.002)   # (no bend worth feeling: the hill went, the slopes came)

    def test_below_the_shortest_wave_it_goes_to_the_heights_themselves(self):
        """On a short band the spline's points lie otherwise than the line's: read back, a peak comes out lower at any strength, even at none."""
        s = np.arange(0.0, 7.0, 2.0)
        heights = np.array([[100.0, 100.3, 100.0, 100.1]])
        np.testing.assert_allclose(trackband._even(s, heights, 1e-6), heights, atol=1e-5)

    def test_at_each_lanes_ends_its_height_now_not_as_built(self):
        """A lane's own end stays where the road goes on, also where it lies otherwise than built: else a step at A and B."""
        s = self.s
        built = np.full((3, len(s)), 100.0)
        now = built + np.array([[0.4], [0.0], [-0.3]])
        out = trackband._even_surface(s, now, built, 1.0, (0.0, 0.0))
        np.testing.assert_allclose(out[:, 0], now[:, 0], atol=1e-9)
        np.testing.assert_allclose(out[:, -1], now[:, -1], atol=1e-9)

    def test_a_long_window_is_the_cubic_and_a_short_one_the_heights(self):
        y = (100.0 + 2.0 * np.sin(self.s / 30.0))[None]
        slopes = np.array([0.1]), np.array([-0.1])
        t = self.s / 200.0
        cubic = (2 * t ** 3 - 3 * t ** 2 + 1) * y[0, 0] + (t ** 3 - 2 * t ** 2 + t) * 200.0 * 0.1 + (3 * t ** 2 - 2 * t ** 3) * y[0, -1] - (t ** 3 - t ** 2) * 200.0 * 0.1
        np.testing.assert_allclose(trackband._spline(y, 2.0, slopes, 1e7)[0], cubic, atol=1e-6)
        np.testing.assert_allclose(trackband._spline(y, 2.0, slopes, 1e-3)[0, 2:-2], y[0, 2:-2], atol=1e-3)

    def test_a_wave_as_long_as_the_window_halves(self):
        wave = 100.0 + np.sin(self.s / 20.0 * 2 * np.pi)
        out = trackband._even(self.s, wave[None], 20.0)[0]
        self.assertAlmostEqual(0.5, float(np.ptp(out[30:70])) / 2.0, delta=0.05)

    def test_a_banked_road_keeps_its_slant(self):
        """+0.37 % became -0.59 % when each lane went straight from A to B: a bend's banking belongs to the road. A hill made afterwards is no slant."""
        s = self.s
        lanes = np.array([-4.0, 0.0, 4.0])
        slant = 0.03 * np.exp(-((s - 100.0) / 40.0) ** 2)         # (banked in the middle of the band only)
        built = 100.0 + np.outer(lanes, slant)
        hump = 2.0 * np.exp(-((s - 100.0) / 6.0) ** 2) * np.array([[0.4], [1.0], [0.6]])
        out = trackband._even_surface(s, built + hump, built, 1.0, (0.0, 0.0))
        self.assertAlmostEqual(0.03, float((out[2, 50] - out[0, 50]) / 8.0), delta=0.006)
        self.assertLess(float(np.ptp(out[1, 30:70])), 0.05)       # (its middle calm)

    def test_at_each_lanes_ends_its_own_height(self):
        s = self.s
        heights = np.array([100.0 + 0.3 * np.sin(s / 7.0), 100.0 + 0.1 * np.cos(s / 9.0), 101.0 + 0.2 * np.sin(s / 11.0)])
        out = trackband._even_surface(s, heights, heights, 1.0, (None, 0.0))
        np.testing.assert_allclose(out[:, 0], heights[:, 0], atol=1e-9)
        np.testing.assert_allclose(out[:, -1], heights[:, -1], atol=1e-9)
        np.testing.assert_allclose(trackband._even_surface(s, heights, heights, 0.0, (0.0, 0.0)), heights, atol=1e-9)

    def test_little_strength_little_change_across_too(self):
        s = self.s
        built = 100.0 + np.outer([-4.0, 0.0, 4.0], np.full(len(s), 0.02))
        now = built + 0.5 * np.exp(-((s - 100.0) / 30.0) ** 2) * np.array([[1.0], [0.5], [0.0]])     # (a slant made since)
        np.testing.assert_allclose(trackband._even_surface(s, now, built, 0.02, (None, None)), now, atol=0.01)


class OnwardTest(unittest.TestCase):
    """What lies beyond A and B: the road's slope, read along the road."""

    def test_straight_on(self):
        line = np.c_[np.arange(0.0, 41.0, 2.0), np.zeros(21)]
        on = trackband._onward(line)
        np.testing.assert_allclose(on[:, 1], 0.0, atol=1e-9)
        self.assertAlmostEqual(42.0, float(on[0, 0]))
        self.assertAlmostEqual(40.0 + trackband.SLOPE_OVER_M, float(on[-1, 0]))

    def test_round_a_bend_it_keeps_turning(self):
        """A radius of 25 m: a straight line would be 5 m off the road after 16 m."""
        angle = np.arange(0.0, 1.6, 2.0 / 25.0)
        line = 25.0 * np.c_[np.sin(angle), 1 - np.cos(angle)]
        on = trackband._onward(line)
        self.assertLess(float(np.abs(np.hypot(on[:, 0], on[:, 1] - 25.0) - 25.0).max()), 0.5)

    def rise(self, height, road_to=110):
        """The rise along the x axis past x 40, on a road from 0 to road_to cells."""
        i, j = np.meshgrid(np.arange(0, 110), np.arange(-5, 5))
        grid = height(i * 2.0, j * 2.0)
        grid[:, road_to:] = np.nan
        return trackband._rise_onward(grid, 0, -5, np.array([40.0, 0.0]), np.c_[np.arange(42.0, 57.0, 2.0), np.zeros(8)])

    def test_it_reads_the_roads_rise(self):
        self.assertAlmostEqual(0.07, self.rise(lambda x, z: 0.07 * x), places=6)

    def test_a_bump_there_does_not_tilt_it(self):
        self.assertAlmostEqual(0.07, self.rise(lambda x, z: 0.07 * x + 0.5 * np.exp(-((x - 46.0) / 2.0) ** 2)), delta=0.01)

    def test_a_wall_there_ends_it(self):
        self.assertIsNone(self.rise(lambda x, z: 0.07 * x + 6.0 * (x >= 46.0)))

    def test_a_wall_right_behind_the_end_ends_it_too(self):
        """Compared among themselves, the points behind it read as a road at 10 %: Smooth then took a level road down by 2.7 m to meet it."""
        self.assertIsNone(self.rise(lambda x, z: 100.0 + (x >= 42.0) * (6.0 + 0.1 * (x - 42.0))))

    def test_no_road_there_no_slope(self):
        self.assertIsNone(self.rise(lambda x, z: 0.07 * x, 20))


class RasterTest(unittest.TestCase):
    line = np.c_[np.arange(0.0, 201.0, 2.0), np.zeros(101)]
    change = -2.0 * np.exp(-((np.arange(0.0, 201.0, 2.0) - 100.0) / 25.0) ** 2)

    def at(self, op, *places):
        x, z = zip(*places)
        return trackheights.Field([op]).at(np.array(x, float), np.array(z, float))[0]

    def test_it_is_a_height_change_like_any(self):
        self.assertIsNone(trackheights.problem(trackband.raster(self.line, self.change, 8.0, "a")))

    def test_across_the_band_the_same_a_road_keeps_its_slant(self):
        op = trackband.raster(self.line, self.change, 8.0, "a")
        np.testing.assert_allclose(self.at(op, (100, 0), (100, 3), (100, -3)), -2.0, atol=0.01)

    def test_beside_it_fades_out_softly_and_a_large_change_further(self):
        small = trackband.raster(self.line, self.change / 10, 8.0, "a")
        self.assertAlmostEqual(0.0, float(self.at(small, (100, 4 + trackband.SIDE_FADE_M + 2))[0]), places=3)
        large = trackband.raster(self.line, self.change * 5, 8.0, "a")
        d = [float(self.at(large, (100, z))[0]) for z in range(0, 120, 2)]
        self.assertLess(float(np.abs(np.diff(d)).max() / 2.0), trackband.SIDE_SLOPE * 1.05)     # (a soft fade's steepest, not only its mean)
        self.assertEqual(sorted(d), d)      # (rising from the deepest to nothing, never over it)

    def test_nothing_to_do_says_so(self):
        with self.assertRaisesRegex(trackband.Refused, "smooth here already"):
            trackband.raster(self.line, np.zeros(101), 8.0, "a")

    def test_lane_by_lane_each_its_own_change(self):
        """To the left of a line along +x is +z (_sideways)."""
        rows = np.vstack([self.change, self.change / 2, np.zeros(101)])
        op = trackband.raster(self.line, rows, 8.0, "a")
        side = trackband._sideways(self.line)[50]
        first, last = np.array([100.0, 0.0]) - side * 4, np.array([100.0, 0.0]) + side * 4
        self.assertAlmostEqual(-2.0, float(self.at(op, tuple(first))[0]), delta=0.03)
        self.assertAlmostEqual(-1.0, float(self.at(op, (100, 0))[0]), delta=0.03)
        self.assertAlmostEqual(0.0, float(self.at(op, tuple(last))[0]), delta=0.03)

    def test_a_hairpin_that_would_do_two_things_at_one_place_says_so(self):
        """Two legs 10 m apart, a band of 8 m with its fade, a hill on one leg only: the change would jump from one to the other."""
        out = np.c_[np.arange(0.0, 201.0, 2.0), np.zeros(101)]
        back = np.c_[np.arange(200.0, -1.0, -2.0), np.full(101, 10.0)]
        line = np.vstack([out, back])
        change = np.r_[-3.0 * np.exp(-((np.arange(0.0, 201.0, 2.0) - 100.0) / 25.0) ** 2), np.zeros(101)]
        with self.assertRaisesRegex(trackband.Refused, "overlaps itself"):
            trackband.raster(line, change, 8.0, "a")

    def test_legs_that_do_the_same_there_are_no_trouble(self):
        out = np.c_[np.arange(0.0, 201.0, 2.0), np.zeros(101)]
        back = np.c_[np.arange(200.0, -1.0, -2.0), np.full(101, 10.0)]
        self.assertIsNone(trackheights.problem(trackband.raster(np.vstack([out, back]), np.full(202, -1.0), 8.0, "a")))

    def test_too_long_says_so(self):
        far = np.c_[np.arange(0.0, 6001.0, 200.0), np.arange(0.0, 6001.0, 200.0)]
        with self.assertRaisesRegex(trackband.Refused, "too long"):
            trackband.raster(far, np.ones(len(far)), 8.0, "a")


class ChangeOfTest(unittest.TestCase):
    """On a kn5: a hill on a road goes, with what the draft moved already."""

    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.path = os.path.join(tmp.name, "t.kn5")
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        tree.children = [lattice(lambda x, z: 100.0 + 3.0 * np.exp(-((x - 100.0) / 25.0) ** 2))]
        material = kn5.Material("m", "ksPerPixel", 0, 0, 0, [("ksAmbient", 0.5, (0, 0), (0, 0, 0), (0, 0, 0, 0))], [("txDiffuse", 0, "t.png")])
        kn5.write(self.path, [("t.png", b"png")], [material], tree)
        self.scan = kn5.scan(self.path)
        trackband.road_cells.cache_clear()
        self.cells = trackband.road_cells(self.path, "r")

    def test_the_road_is_found_from_the_file(self):
        self.assertGreater(len(self.cells.cells), 1000)
        self.assertEqual(len(self.cells.cells), len(self.cells.heights))

    def test_the_heights_along_a_line_as_in_the_file(self):
        line = np.c_[np.arange(0.0, 200.0, 2.0), np.zeros(100)]
        np.testing.assert_allclose(trackband.road_heights(self.path, self.scan, None, line),
                                   100.0 + 3.0 * np.exp(-((line[:, 0] - 100.0) / 25.0) ** 2), atol=0.25)

    def test_a_hill_goes_where_the_band_is_and_nowhere_else(self):
        op = trackband.change_of(self.path, self.scan, None, self.cells, [[0.0, 0.0], [200.0, 0.0]], 8.0, 1.0, "s")
        self.assertIsNone(trackheights.problem(op))
        moved = trackheights.moved(self.path, self.scan, {}, [op])
        p = moved.vertices[0]["pos"]
        on_road = (np.abs(p[:, 2]) <= 2) & (p[:, 0] >= 0) & (p[:, 0] <= 200)
        at_middle = on_road & (np.abs(p[:, 0] - 100.0) < 40)
        self.assertLess(float(np.ptp(p[at_middle, 1])), 0.25)
        before = kn5.scan(self.path)
        self.assertEqual(before["meshes"][0]["vertices"], len(p))
        np.testing.assert_allclose(p[p[:, 0] <= -10, 1], 100.0, atol=1e-3)         # (beyond A as it was)

    def test_a_round_hill_goes_at_the_road_edges_too_not_only_in_its_middle(self):
        """Seen on Heiligenblut: by the middle alone a round hill stayed at the kerbs, as it is lower there than in the middle. As the user makes one."""
        scan, cells = self.rebuilt(lattice(lambda x, z: 100.0))
        hill = trackheights.brush([[100.0, 0.0, 0.0]], 20.0, 1.0, 3000, 0, "hill")
        before = trackheights.moved(self.path, scan, {}, [hill])
        op = trackband.change_of(self.path, scan, before, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 1.0, "s")
        p = trackheights.moved(self.path, scan, {}, [hill, op]).vertices[0]["pos"]
        band = (np.abs(p[:, 2]) <= 3) & (np.abs(p[:, 0] - 100.0) < 60)     # (the last 2 m of the band's 6 m on each side go over softly)
        self.assertLess(float(np.abs(p[band, 1] - 100.0).max()), 0.03)

    def test_a_band_too_long_says_so_before_it_is_solved(self):
        scan, cells = self.rebuilt(lattice(lambda x, z: 100.0))
        with mock.patch.object(trackband, "MAX_LENGTH_M", 100.0):
            with self.assertRaisesRegex(trackband.Refused, "too long"):
                trackband.change_of(self.path, scan, None, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 1.0, "s")

    def rebuilt(self, *nodes):
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        tree.children = list(nodes)
        material = kn5.Material("m", "ksPerPixel", 0, 0, 0, [("ksAmbient", 0.5, (0, 0), (0, 0, 0), (0, 0, 0, 0))], [("txDiffuse", 0, "t.png")])
        kn5.write(self.path, [("t.png", b"png")], [material], tree)
        trackband.road_cells.cache_clear()
        return kn5.scan(self.path), trackband.road_cells(self.path, "r3")

    def test_a_narrow_hill_goes_to_its_last_point(self):
        """Seen on Heiligenblut, a stack of strokes of 5 m: 18 cm stayed at full strength, whatever the length of the band: the change came from the
        heights around a point, not its own."""
        scan, cells = self.rebuilt(lattice(lambda x, z: 100.0 + 0.05 * x))
        spike = [trackheights.brush([[x, z, 0.0]], 5.0, 0.5, mm, 0, f"s{x}{z}") for x, z, mm in ((100.0, 0.0, 800), (104.0, 2.0, 500), (96.0, -2.0, 600))]
        before = trackheights.moved(self.path, scan, {}, spike)
        op = trackband.change_of(self.path, scan, before, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 1.0, "s")
        p = trackheights.moved(self.path, scan, {}, spike + [op]).vertices[0]["pos"]
        band = (np.abs(p[:, 2]) <= 3) & (p[:, 0] >= 60) & (p[:, 0] <= 140)     # (the last 2 m of the band's 6 m on each side go over softly)
        self.assertLess(float(np.abs(p[band, 1] - (100.0 + 0.05 * p[band, 0])).max()), 0.01)

    def test_a_bank_beside_the_road_stays_and_lifts_no_road(self):
        """Seen on Heiligenblut, a bank of 6 m in one lattice cell, not parallel to the road: a lane running into it evened road and bank out together and lifted the
        road beside it by a metre. Here the road's edge wanders over 40 m, so each lane meets the bank somewhere."""
        def edge(x):
            return 3.0 + 2.0 * np.sin(x / 40.0)

        def height(x, z):
            return 100.0 + 0.05 * x + (6.0 if z > edge(x) else 0.0)
        road = lattice(height, zs=(-8, 8), where=lambda x, z: z <= edge(x))
        bank = lattice(height, where=lambda x, z: z > edge(x))
        bank.name = "1GRASS_ground_0_0"
        scan, cells = self.rebuilt(road, bank)
        hill = trackheights.brush([[100.0, 0.0, 0.0]], 12.0, 0.5, 1000, 0, "hill")
        before = trackheights.moved(self.path, scan, {}, [hill])
        op = trackband.change_of(self.path, scan, before, cells, [[20.0, -2.0], [180.0, -2.0]], 24.0, 1.0, "s")
        after = trackheights.moved(self.path, scan, {}, [hill, op]).vertices
        got = after[0]["pos"]
        on = (got[:, 0] >= 50) & (got[:, 0] <= 150)
        self.assertLess(float(np.abs(got[on, 1] - (100.0 + 0.05 * got[on, 0])).max()), 0.03)
        up = after[1]["pos"]
        far = (up[:, 2] <= 8.0) & (up[:, 0] >= 50) & (up[:, 0] <= 150)
        self.assertGreater(float((up[far, 1] - (100.0 + 0.05 * up[far, 0])).min()), 5.0)    # (the bank's top still stands, within the band too)

    def test_a_road_at_another_level_beside_it_is_not_this_road(self):
        """Serpentines on Heiligenblut, 1ROAD both, a lattice cell apart, 6 m one above the other: the band of the one reached the other."""
        def height(x, z):
            return 100.0 + 0.05 * x + (6.0 if z > 4.0 else 0.0)
        low = lattice(height, zs=(-10, 2))
        high = lattice(height, zs=(6, 18))
        high.name = "1ROAD_ground_1_0"
        wall = lattice(height, zs=(2, 6))
        wall.name = "1GRASS_ground_0_0"
        scan, cells = self.rebuilt(low, high, wall)
        hill = trackheights.brush([[100.0, -4.0, 0.0]], 8.0, 0.5, 1000, 0, "hill")
        before = trackheights.moved(self.path, scan, {}, [hill])
        op = trackband.change_of(self.path, scan, before, cells, [[20.0, -4.0], [180.0, -4.0]], 20.0, 1.0, "s")
        got = trackheights.moved(self.path, scan, {}, [hill, op]).vertices[0]["pos"]
        on = (got[:, 0] >= 50) & (got[:, 0] <= 150)
        self.assertLess(float(np.abs(got[on, 1] - (100.0 + 0.05 * got[on, 0])).max()), 0.03)

    def test_a_bump_on_the_road_is_road(self):
        """Taken for standing beside the road, a metre's bump stayed, and Smooth said it was smooth already."""
        line = np.c_[np.arange(0.0, 81.0, 2.0), np.full(41, 10.0)]
        for at, high in (((5, 30), 101.0), ((5, 30), 103.0), ((3, 30), 103.0), ((7, 30), 103.0)):
            grid = np.full((12, 60), 100.0)
            grid[at] = high
            self.assertTrue(trackband._own_road(grid, 0, 0, line, 10.0)[:11, :40].all(), msg=(at, high))     # (the grid's last row has no cell left to read it by)

    def test_it_goes_as_a_lower_level_only_two_metres_off_stops_it(self):
        """A level 2 m off stood within what a road can be across at 8 m: lanes reading it moved a road by a metre."""
        grid = np.full((12, 60), 100.0)
        grid[6:, :] = 102.0
        own = trackband._own_road(grid, 0, 0, np.c_[np.arange(0.0, 81.0, 2.0), np.full(41, 2.0)], 12.0)
        self.assertTrue(own[:6, :40].all())
        self.assertFalse(own[6:, :40].any())

    def test_a_cut_lines_points_do_not_count_as_the_lattices(self):
        """A vertex between the lattice's points, on a kerb's height: rounded onto the lattice it would make the road there neither."""
        road = lattice(lambda x, z: 100.0, zs=(-6, 6))
        v = road.vertices.copy()
        v["pos"][0] = (100.9, 150.0, 0.9)
        road.vertices = v
        scan, _road = self.rebuilt(road)
        np.testing.assert_allclose(trackband.road_heights(self.path, scan, None, np.array([[100.0, 0.0], [102.0, 0.0]])), 100.0, atol=1e-3)

    def test_little_strength_little_change_on_a_short_band_too(self):
        """Held by the cubic, the points next to A and B moved by 44 mm at a strength of nothing."""
        scan, road = self.rebuilt(lattice(lambda x, z: 100.0 + 0.3 * np.exp(-((x - 8.0) / 2.0) ** 2)))
        for points in ([[0.0, 0.0], [12.0, 0.0]], [[0.0, 0.0], [20.0, 0.0]]):
            try:
                op = trackband.change_of(self.path, scan, None, road, points, 8.0, 0.000001, "s")
            except trackband.Refused:
                continue
            self.assertLess(max(map(abs, op["mm"])), 2)

    def test_a_and_b_stay_where_they_are(self):
        scan, road = self.rebuilt(lattice(lambda x, z: 100.0 + 0.5 * np.sin(x / 3.0) + 0.2 * np.cos(z / 2.0)))
        op = trackband.change_of(self.path, scan, None, road, [[1.0, 1.0], [41.0, 1.0]], 8.0, 1.0, "s")
        line = trackband.way(road, [[1.0, 1.0], [41.0, 1.0]])[0]
        np.testing.assert_allclose(trackheights.Field([op]).at(line[[0, -1], 0], line[[0, -1], 1])[0], 0.0, atol=1e-9)

    def test_a_width_a_little_more_makes_no_jump_at_the_bands_edge(self):
        """A stamp of a metre: at the band's edge it got -870 mm at 5.999 m and -1000 mm at 6 m."""
        scan, road = self.rebuilt(lattice(lambda x, z: 100.0))
        stamp = trackheights.brush([[100.0, 2.0, 0.0]], 3.0, 0.5, 1000, 0, "stamp")
        before = trackheights.moved(self.path, scan, {}, [stamp])
        line = trackband.way(road, [[0.0, 0.0], [200.0, 0.0]])[0]
        edge = 2 * abs(2.0 - float(line[len(line) // 2, 1]))      # (the width whose edge falls on the stamp's middle)
        at = [trackheights.Field([trackband.change_of(self.path, scan, before, road, [[0.0, 0.0], [200.0, 0.0]], edge + w, 1.0, "s")]).at(np.array([100.0]), np.array([2.0]))[0][0]
              for w in (-0.001, 0.0, 0.001)]
        self.assertLess(abs(at[0] - at[1]), 0.01)
        self.assertLess(abs(at[1] - at[2]), 0.01)

    def test_a_width_a_little_more_changes_nothing_at_a_wall_either(self):
        """Cap Corse, the road's vertex (12, 52) at a wall running slantwise: -376 mm at 8.000 m, +406 mm at 8.001 m: lanes at other places by the width, each read otherwise.
        Here a wavy road with a slant, its edge wandering towards a wall 3 m high and away, through all widths where another lane comes in, within the road and over it."""
        def edge(x):
            return 8.0 + 0.3 * x + 3.0 * np.sin(x / 13.0)

        def level(x, z):
            return 100.0 + 0.4 * np.sin(x / 6.0) + 0.05 * z + (3.0 if z > edge(x) else 0.0)
        low = lattice(level, zs=(-10, 80), where=lambda x, z: edge(x) - 14.0 <= z <= edge(x))
        high = lattice(level, zs=(-10, 80), where=lambda x, z: edge(x) + 2.0 < z <= edge(x) + 14.0)
        high.name = "1ROAD_ground_1_0"
        scan, road = self.rebuilt(low, high)
        points = [[60.0, float(edge(60.0)) - 7.0], [140.0, float(edge(140.0)) - 7.0]]
        p = low.vertices["pos"]
        places = p[(p[:, 0] >= 75) & (p[:, 0] <= 125)][:, [0, 2]].astype(np.float64)
        for w in (6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0):
            sides = [trackheights.Field([trackband.change_of(self.path, scan, None, road, points, w + d, 1.0, "s")]).at(places[:, 0], places[:, 1])[0] for d in (0.0, 0.001)]
            self.assertLess(float(np.abs(sides[0] - sides[1]).max()), 0.005, msg=w)

    def test_two_levels_in_one_cell_are_no_road_there(self):
        """A cut of 80 cm through a cell, its upright triangles gone by their steepness: the two flat parts' mean stood on no road, and a way went over it."""
        road = lattice(lambda x, z: 100.0, xs=(0, 2), zs=(0, 2))
        v = np.zeros(8, kn5.VERTEX)
        v["pos"] = [(0, 100, 0), (2, 100, 0), (0, 100, 1), (2, 100, 1), (0, 100.8, 1), (2, 100.8, 1), (0, 100.8, 2), (2, 100.8, 2)]
        road.vertices, road.indices = v, np.array([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7], "<u2")
        _scan, cut = self.rebuilt(road)
        self.assertEqual(0, len(cut.cells))
        whole = lattice(lambda x, z: 100.0 + 0.37 * x, xs=(0, 8), zs=(0, 8))
        _scan, sloped = self.rebuilt(whole)
        self.assertEqual(16, len(sloped.cells))     # (the steepest street's two triangles differ, and are one level)

    def test_its_own_road_is_what_stands_to_the_line_as_a_road_can(self):
        """Lower level along the bottom, a wall, a road 6 m higher; and they join, far on: a side road at a junction. By what can be reached it would count."""
        grid = np.full((12, 60), 100.0)
        grid[6:, :] = 106.0
        grid[5, :] = np.nan
        grid[:, 50:] = np.linspace(100.0, 106.0, 12)[:, None]      # (the join, a slope one can drive)
        line = np.c_[np.arange(0.0, 81.0, 2.0), np.full(41, 4.0)]
        own = trackband._own_road(grid, 0, 0, line, 10.0)
        self.assertTrue(own[:5, :40].all())
        self.assertFalse(own[6:, :40].any())

    def test_a_slanted_road_is_its_own_road_across_all_of_it(self):
        grid = 100.0 + np.arange(12)[:, None] * 2.0 * 0.12 * np.ones((12, 40))
        own = trackband._own_road(grid, 0, 0, np.c_[np.arange(0.0, 61.0, 2.0), np.full(31, 10.0)], 10.0)
        self.assertTrue(own[:11, :30].all())

    def test_no_point_of_the_other_level_comes_in_by_rounding_to_a_lane(self):
        """Cap Corse: a wall running slantwise across the lanes, and each point goes by its nearest lane: a point or two of the road above counted, and were pulled down 1.6 m."""
        grid = np.full((30, 90), 100.0)
        for j, i in np.ndindex(grid.shape):
            if j * 2.0 > 22.0 + (i * 2.0) * 0.27:
                grid[j, i] = 103.0
        s = np.arange(0.0, 161.0, 2.0)
        own = trackband._own_road(grid, 0, 0, np.c_[s, 14.0 + 0.27 * s], 7.0)
        self.assertGreater(int(own.sum()), 300)
        self.assertEqual(100.0, float(grid[own].max()))

    def test_the_foot_of_a_wall_is_not_the_road(self):
        """A build's road mesh runs up a wall at about 50 %, over several cells: in steps a road could take along, not across."""
        grid = np.full((14, 60), 100.0)
        for row, height in zip(range(6, 14), (101.0, 102.0, 103.0, 104.0, 105.0, 106.0, 106.0, 106.0)):
            grid[row, :] = height
        own = trackband._own_road(grid, 0, 0, np.c_[np.arange(0.0, 81.0, 2.0), np.full(41, 4.0)], 14.0)
        self.assertTrue(own[:6, :40].all())
        self.assertFalse(own[7:, :40].any())

    def test_a_diagonal_road_is_as_wide_as_a_straight_one(self):
        """It counted half as much again: the band reached over its edges."""
        i, j = np.meshgrid(np.arange(0, 120), np.arange(0, 120))
        keep = np.abs(i - j) * 2.0 / np.sqrt(2) <= 4.0
        diagonal = road_way(np.c_[i[keep], j[keep]], [[20.0, 20.0], [200.0, 200.0]])[1]
        straight = road_way(road_along_x(half=4), [[20.0, 0.0], [180.0, 0.0]])[1]
        self.assertAlmostEqual(straight, diagonal, delta=2.0)

    def test_lanes_off_the_road_take_the_nearest_lane_on_it(self):
        grid = np.full((5, 6), np.nan)
        grid[:3, :] = 100.0
        row = lambda z: np.c_[np.arange(2.0, 9.0, 2.0), np.full(4, z)]
        h = trackband._lanes(grid, 0, 0, [row(0.0), row(2.0), row(7.0)])
        np.testing.assert_allclose(h, 100.0)
        with self.assertRaisesRegex(trackband.Refused, "No road"):
            trackband._lanes(np.full((5, 6), np.nan), 0, 0, [row(0.0)])

    def test_a_bump_in_the_file_goes_too_with_no_bend_left(self):
        """A road as built with a bump on its one side: what a slant keeps of it is a long low wave, nothing to feel."""
        bump = {(100.0, 0.0): 0.45, (102.0, 0.0): 0.4, (98.0, 2.0): 0.3, (100.0, 2.0): 0.45}
        scan, cells = self.rebuilt(lattice(lambda x, z: 100.0 + 0.05 * x + bump.get((float(x), float(z)), 0.0)))
        op = trackband.change_of(self.path, scan, None, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 1.0, "s")
        p = trackheights.moved(self.path, scan, {}, [op]).vertices[0]["pos"]
        for z in (-4.0, 0.0, 2.0):      # (the line lies at z -1: at 4 the band's last 2 m of its 6 m begin, going over softly)
            row = p[(p[:, 2] == z) & (p[:, 0] >= 60) & (p[:, 0] <= 140)]
            row = row[np.argsort(row[:, 0])]
            self.assertLess(float(np.abs(np.diff(row[:, 1], 2)).max() / 4.0), 0.003, msg=z)

    def test_no_strength_moves_nothing_not_even_a_narrow_hills_top(self):
        """Each point by its own height at any strength: at none, a top between the lanes' samples would still come down."""
        scan, cells = self.rebuilt(lattice(lambda x, z: 100.0 + (0.45 if (x, z) == (100.0, 0.0) else 0.0)))
        with self.assertRaisesRegex(trackband.Refused, "smooth here already"):
            trackband.change_of(self.path, scan, None, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 0.0, "s")
        self.assertLess(max(map(abs, trackband.change_of(self.path, scan, None, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 0.03, "s")["mm"])), 10)
        self.assertGreater(max(map(abs, trackband.change_of(self.path, scan, None, cells, [[0.0, 0.0], [200.0, 0.0]], 12.0, 0.5, "s")["mm"])), 300)

    def test_the_solve_of_five_diagonals_is_a_solve(self):
        rows = np.random.default_rng(1).normal(size=(3, 40))
        for weight in (0.0, 0.5, 1e6):
            matrix = (np.diag(np.full(40, 1.0 + 6.0 * weight)) + np.diag(np.full(39, -4.0 * weight), 1) + np.diag(np.full(39, -4.0 * weight), -1)
                      + np.diag(np.full(38, weight), 2) + np.diag(np.full(38, weight), -2))
            np.testing.assert_allclose(trackband._bends_solved(weight, rows), np.linalg.solve(matrix, rows.T).T, atol=1e-8)

    def test_the_curve_goes_on_from_the_roads_slope_beyond_a_and_b(self):
        """Up at 2 %, then a hill, then up at 8 %: a straight line from A to B would make a kink at both ends."""
        def height(x, z):
            return 100.0 + (0.02 * x if x < 100.0 else 2.0 + 0.08 * (x - 100.0)) + 1.5 * np.exp(-((x - 100.0) / 12.0) ** 2)
        scan, cells = self.rebuilt(lattice(height))
        op = trackband.change_of(self.path, scan, None, cells, [[40.0, 0.0], [160.0, 0.0]], 12.0, 1.0, "s")
        p = trackheights.moved(self.path, scan, {}, [op]).vertices[0]["pos"]
        row = p[p[:, 2] == 0.0]
        row = row[np.argsort(row[:, 0])]
        grade = np.diff(row[:, 1]) / np.diff(row[:, 0])
        self.assertLess(float(np.abs(np.diff(grade)).max() / 2.0), 0.003)

    def test_a_cut_line_beside_the_road_makes_no_dip_in_it(self):
        """The road even at 100 m, the terrain beside it higher at the same places: a mean of the two would be neither."""
        road = lattice(lambda x, z: 100.0, zs=(-6, 6))
        road.name = "1ROAD_ground_0_0"
        bank = lattice(lambda x, z: 104.0 if abs(z) >= 6 else 100.0, zs=(-20, 20))
        bank.name = "1GRASS_ground_0_0"
        scan, cells = self.rebuilt(road, bank)
        self.assertGreater(len(cells), 0)
        np.testing.assert_allclose(trackband.road_heights(self.path, scan, None, np.array([[100.0, 6.0], [102.0, 6.0]])), 100.0, atol=1e-6)

    def test_points_of_one_kind_of_ground_far_apart_are_no_height_at_all(self):
        h = trackband._Heights((1, 2))
        h.add(np.array([0, 0, 0]), np.array([0, 0, 1]), np.array([100.0, 104.0, 100.0]))
        h.add(np.array([0]), np.array([1]), np.array([100.1]))
        grid = h.grid()
        self.assertTrue(np.isnan(grid[0, 0]))
        self.assertAlmostEqual(100.05, float(grid[0, 1]))

    def test_it_goes_from_the_ground_as_the_draft_has_it_not_as_the_file(self):
        points = [[0.0, 0.0], [200.0, 0.0]]
        first = trackband.change_of(self.path, self.scan, None, self.cells, points, 8.0, 1.0, "s")
        moved = trackheights.moved(self.path, self.scan, {}, [first])
        again = trackband.change_of(self.path, self.scan, moved, self.cells, points, 8.0, 1.0, "s2")
        self.assertLess(max(map(abs, again["mm"])), max(map(abs, first["mm"])) / 5)     # (the hill is gone already: only its last bit is left)

    def test_what_can_not_be_asked(self):
        for kwargs in ({"width": 1.0}, {"width": 100.0}, {"width": "x"}, {"strength": -0.1}, {"strength": 1.5}, {"strength": "x"}):
            args = {"width": 8.0, "strength": 1.0, **kwargs}
            with self.assertRaises(ValueError, msg=kwargs):
                trackband.change_of(self.path, self.scan, None, self.cells, [[0.0, 0.0], [200.0, 0.0]], args["width"], args["strength"], "s")

    def test_a_and_b_too_close_says_so(self):
        with self.assertRaisesRegex(trackband.Refused, "too close"):
            trackband.change_of(self.path, self.scan, None, self.cells, [[100.0, 0.0], [101.0, 0.0]], 8.0, 1.0, "s")


if __name__ == "__main__":
    unittest.main()
