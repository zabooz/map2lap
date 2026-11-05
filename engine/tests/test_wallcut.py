"""The ground along a wall between two roads at two levels: a clean step inside it, no teeth in front (scenery.wallcut)."""
import os
import sys
import unittest

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.join(ENGINE, "..", "src"))

from scenery import wallcut  # noqa: E402

N = 21
CELL = 2.0
LOW, HIGH = 10.0, 13.0


def lattice(slope=0.33, c=15.0, x0=0.0):
    """Heights of a lattice with a step along y = c + slope * x: low to its south, high to its north."""
    gx, gy = np.meshgrid(x0 + np.arange(N) * CELL, np.arange(N) * CELL)
    return np.where(gy < c + slope * gx, LOW, HIGH)


def line(x_from=-4.0, x_to=44.0, slope=0.33, c=15.0):
    xs = np.arange(x_from, x_to + 0.1, 4.0)
    tw = np.array([slope, -1.0]) / np.hypot(slope, 1.0)     # (toward the low side, south)
    return {"base": np.c_[xs, c + slope * xs], "low": np.full(len(xs), LOW), "high": np.full(len(xs), HIGH),
            "toward": np.tile(tw, (len(xs), 1))}


def surface(got, x0=0.0):
    """All triangles (t, 3, 3) of the ground with the cells' replaced, as ground.build makes them."""
    n = got.u.shape[0]
    gx, gy = np.meshgrid(x0 + np.arange(n) * CELL, np.arange(n) * CELL)
    P = np.r_[np.c_[gx.ravel(), gy.ravel(), got.u.ravel()], got.P]
    i, j = np.meshgrid(np.arange(n - 1), np.arange(n - 1))
    a = (j * n + i).ravel()
    keep = np.ones(len(a), bool)
    keep[got.cells] = False
    T = np.r_[np.c_[a[keep], a[keep] + 1, a[keep] + n + 1], np.c_[a[keep], a[keep] + n + 1, a[keep] + n], got.T]
    return P[T]


def height_over(tris, x, y):
    """The highest surface over (x, y). Pure."""
    a, b, c = tris[:, 0], tris[:, 1], tris[:, 2]
    d = (b[:, 1] - c[:, 1]) * (a[:, 0] - c[:, 0]) + (c[:, 0] - b[:, 0]) * (a[:, 1] - c[:, 1])
    ok = np.abs(d) > 1e-9
    a, b, c, d = a[ok], b[ok], c[ok], d[ok]
    l1 = ((b[:, 1] - c[:, 1]) * (x - c[:, 0]) + (c[:, 0] - b[:, 0]) * (y - c[:, 1])) / d
    l2 = ((c[:, 1] - a[:, 1]) * (x - c[:, 0]) + (a[:, 0] - c[:, 0]) * (y - c[:, 1])) / d
    l3 = 1 - l1 - l2
    m = (l1 >= -1e-9) & (l2 >= -1e-9) & (l3 >= -1e-9)
    return float((l1[m] * a[m, 2] + l2[m] * b[m, 2] + l3[m] * c[m, 2]).max())


def open_edges(tris):
    """The edges inside the lattice not used an even number of times: cracks. Pure."""
    edges = {}
    for t in np.round(tris, 6):
        for k in range(3):
            a, b = tuple(t[k]), tuple(t[(k + 1) % 3])
            key = (a, b) if a < b else (b, a)
            edges[key] = edges.get(key, 0) + 1
    return [e for e, c in edges.items() if c % 2 and all(0.0 < p[0] < (N - 1) * CELL and 0.0 < p[1] < (N - 1) * CELL for p in e)]


class WallCutTest(unittest.TestCase):
    def test_no_teeth_in_front_of_the_line_and_the_upper_level_behind_it(self):
        tris = surface(wallcut.cut(lattice(), 0.0, 0.0, CELL, [line()]))
        for x in np.arange(6.0, 30.0, 0.37):
            y = 15.0 + 0.33 * x
            self.assertAlmostEqual(height_over(tris, x, y - 0.05), LOW, places=6, msg=f"in front of the line at x {x}")
            self.assertAlmostEqual(height_over(tris, x, y + 0.05), HIGH, places=6, msg=f"behind the line at x {x}")

    def test_a_step_a_little_off_the_line_is_cut_on_the_line(self):
        """(a corner 0.1 m behind the face still low: the line missed its edge, that cell and its neighbours stayed a ramp, a
        3.8 m tooth at the road's edge, Cap Corse)"""
        for off in (-0.5, -0.3, -0.1, -0.03, 0.03, 0.1, 0.3, 0.5):
            tris = surface(wallcut.cut(lattice(), 0.0, 0.0, CELL, [line(c=15.0 + off)]))
            for x in np.arange(6.0, 30.0, 0.37):
                y = 15.0 + off + 0.33 * x
                self.assertAlmostEqual(height_over(tris, x, y - 0.1), LOW, places=6, msg=f"in front, line {off:+} off, x {x}")
                self.assertAlmostEqual(height_over(tris, x, y + 0.1), HIGH, places=6, msg=f"behind, line {off:+} off, x {x}")

    def test_a_line_far_from_any_step_moves_nothing(self):
        """(another road's step 5 m away is not this wall's)"""
        u = lattice()
        got = wallcut.cut(u, 0.0, 0.0, CELL, [line(c=20.0)])
        self.assertEqual(len(got.cells), 0)
        np.testing.assert_array_equal(got.u, u)

    def test_without_a_line_the_lattice_stays_as_it_is(self):
        """(and with the cut undone the teeth are there: this is what the tests above fail on)"""
        u = lattice()
        got = wallcut.cut(u, 0.0, 0.0, CELL, [])
        self.assertEqual((len(got.P), len(got.cells), len(got.T)), (0, 0, 0))
        tris = surface(got)
        self.assertGreater(max(height_over(tris, x, 15.0 + 0.33 * x - 0.05) for x in np.arange(6.0, 30.0, 0.37)), LOW + 1.0)

    def test_the_skirt_faces_the_lower_road_and_the_parts_up(self):
        got = wallcut.cut(lattice(), 0.0, 0.0, CELL, [line()])
        tris = surface(got)[-len(got.T):]
        nrm = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0])
        upright = np.abs(nrm[:, 2]) < 1e-9
        self.assertTrue(upright.any())
        self.assertTrue((nrm[~upright, 2] > 0).all(), "the parts' fronts up")
        self.assertTrue((nrm[upright, 1] < 0).all(), "the skirt's front south, toward the lower road")

    def test_the_skirt_s_texture_isn_t_one_point_stretched_up(self):
        """(asphalt streaks down the wall, Cap Corse)"""
        got = wallcut.cut(lattice(), 0.0, 0.0, CELL, [line()])
        self.assertEqual(len(got.lift), len(got.P))
        np.testing.assert_allclose(got.lift[3::4], HIGH - LOW)
        self.assertTrue((got.lift[0::4] == 0).all() and (got.lift[1::4] == 0).all() and (got.lift[2::4] == 0).all())

    def test_closed_along_the_step(self):
        self.assertEqual(open_edges(surface(wallcut.cut(lattice(), 0.0, 0.0, CELL, [line()]))), [], "no crack")

    def test_where_the_line_ends_the_ramp_stays_and_no_crack(self):
        got = wallcut.cut(lattice(), 0.0, 0.0, CELL, [line(x_from=8.0, x_to=20.0)])
        self.assertGreater(len(got.cells), 0)
        self.assertEqual(open_edges(surface(got)), [], "the gap to the ramp is closed")
        self.assertGreater(height_over(surface(got), 30.0, 15.0 + 0.33 * 30.0 - 0.05), LOW + 0.5, "past its end: the ramp")

    def test_past_a_line_s_end_no_corner_is_moved(self):
        """(a corner taken up just past the end stood as a tooth over the next cell, Cap Corse)"""
        u = lattice(c=15.3)
        got = wallcut.cut(u, 0.0, 0.0, CELL, [line(x_from=8.0, x_to=20.0, c=15.0)])
        np.testing.assert_array_equal(got.u[:, :4], u[:, :4], "west of its end")
        np.testing.assert_array_equal(got.u[:, 11:], u[:, 11:], "east of its end")

    def test_two_tiles_cut_their_shared_edge_at_the_same_point(self):
        """(each has its own piece of the wall; the crossing comes from the edge and the lines alone)"""
        w = line(x_from=-40.0, x_to=84.0)
        a = wallcut.cut(lattice(x0=0.0), 0.0, 0.0, CELL, [w]).P
        b = wallcut.cut(lattice(x0=40.0), 40.0, 0.0, CELL, [w]).P
        on_a = {tuple(p) for p in np.round(a[np.abs(a[:, 0] - 40.0) < 1e-9], 6)}
        on_b = {tuple(p) for p in np.round(b[np.abs(b[:, 0] - 40.0) < 1e-9], 6)}
        self.assertTrue(on_a)
        self.assertEqual(on_a, on_b)

    def test_two_tiles_snap_their_shared_corners_alike(self):
        w = line(x_from=-40.0, x_to=84.0, c=15.3)
        a = wallcut.cut(lattice(x0=0.0), 0.0, 0.0, CELL, [w]).u
        b = wallcut.cut(lattice(x0=40.0), 40.0, 0.0, CELL, [w]).u
        np.testing.assert_array_equal(a[:, -1], b[:, 0])

    def test_a_neighbour_s_piece_of_the_line_counts(self):
        """(a tile's piece starts past its border: Cap Corse, 0.71 m into the tile; the last 0.71 m are the neighbour's)"""
        u = lattice()
        whole = line(x_from=-12.0, x_to=44.0)
        mine, theirs = ({k: v[s] for k, v in whole.items()} for s in (slice(4, None), slice(None, 5)))
        both = wallcut.cut(u, 0.0, 0.0, CELL, [mine, theirs])
        self.assertEqual(len(both.cells), len(wallcut.cut(u, 0.0, 0.0, CELL, [whole]).cells))
        self.assertGreater(len(both.cells), len(wallcut.cut(u, 0.0, 0.0, CELL, [mine]).cells))

    def test_a_tunnel_s_hole_stays_a_hole(self):
        whole = wallcut.cut(lattice(), 0.0, 0.0, CELL, [line()])
        shut = np.ones((N - 1) ** 2, bool)
        shut[whole.cells[0]] = False
        self.assertNotIn(whole.cells[0], wallcut.cut(lattice(), 0.0, 0.0, CELL, [line()], shut).cells)

    def test_a_step_gone_flat_is_not_cut(self):
        self.assertEqual(len(wallcut.cut(np.full((N, N), LOW), 0.0, 0.0, CELL, [line()]).cells), 0)


if __name__ == "__main__":
    unittest.main()
