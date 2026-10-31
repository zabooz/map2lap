"""Map2Lap's leisure grounds (src/scenery/leisure.py) and pitch grounds (groundcover.pitch)."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(1, str(Path(__file__).resolve().parents[4] / "src"))
from scenery import groundcover, leisure  # noqa: E402


def square(x0, y0, x1, y1):
    return np.array([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], float)


class PitchTest(unittest.TestCase):
    def test_mapped_surface_first(self):
        self.assertEqual(groundcover.pitch("pitch", {"sport": "tennis", "surface": "clay"}, "recreation_paved"),
                         ("tennis", "clay"), "OSM's clay over Overture's coarser 'paved'")
        self.assertEqual(groundcover.pitch("pitch", {"sport": "soccer"}, "recreation_paved")[1], "hard")
        self.assertEqual(groundcover.pitch("pitch", {"sport": "basketball;soccer", "surface": "tartan"}),
                         ("basketball", "tartan"))

    def test_by_sport_without_a_surface(self):
        self.assertEqual(groundcover.pitch("pitch", {"sport": "tennis"})[1], "acrylic")
        self.assertEqual(groundcover.pitch("pitch", {"sport": "beachvolleyball"})[1], "sand")
        self.assertEqual(groundcover.pitch("pitch", {"sport": "soccer"})[1], "grass")
        self.assertEqual(groundcover.pitch("pitch", {})[1], "grass")
        self.assertEqual(groundcover.pitch("track", {}), ("", "tartan"), "a track without a sport: a running track")
        self.assertEqual(groundcover.pitch("track", {"sport": "horse_racing"})[1], "dirt")
        for ground in groundcover.SURFACE_GROUND.values():
            self.assertIn(ground, groundcover.PITCH_LOOK)
        for ground in groundcover.SPORT_GROUND.values():
            self.assertIn(ground, groundcover.PITCH_LOOK)


class PoolTest(unittest.TestCase):
    def test_level_basin_on_a_slope(self):
        def slope(x, y):
            return 0.1 * np.asarray(x, float)           # 10 % up to the east
        ring = square(0, 0, 8, 4)
        b = leisure.Builder()
        leisure.pool(b, ring, slope)
        P, UV, T = b.mesh()
        top = slope(8 + leisure.POOL_RIM_W, 0) + leisure.POOL_RIM_H
        self.assertAlmostEqual(P[:, 2].max(), top, 6, "the rim over the highest ground round it")
        water = T[:2]                                   # (the water's triangles come first)
        n = np.cross(P[water[:, 1]] - P[water[:, 0]], P[water[:, 2]] - P[water[:, 0]])
        self.assertTrue((n[:, 2] > 0).all(), "the water faces up")
        self.assertAlmostEqual(P[water.ravel(), 2].max(), top - leisure.POOL_WATER_DOWN, 6)
        self.assertLess(P[:, 2].min(), slope(-leisure.POOL_RIM_W, 0), "the downhill wall into the ground")
        self.assertTrue((P[:, 0] >= -leisure.POOL_RIM_W - 1e-6).all() and (P[:, 0] <= 8.3 + 1e-6).all())


class PlaygroundTest(unittest.TestCase):
    def test_devices_inside_apart_and_off_buildings(self):
        area = [square(0, 0, 24, 20)]
        house = square(9, 7, 15, 13)
        spots = leisure.play_spots(area, [house], "pg")
        self.assertEqual(len(spots), min(leisure.PLAY_MAX, round(24 * 20 / leisure.PLAY_M2)))
        xy = np.array([(s[0], s[1]) for s in spots])
        ins, dist = leisure.inside(xy, area)
        self.assertTrue(ins.all() and (dist >= leisure.PLAY_EDGE_M).all())
        ins, dist = leisure.inside(xy, [house])
        self.assertTrue((~ins).all() and (dist >= leisure.PLAY_EDGE_M).all(), "none in or at the house")
        d = np.hypot(*(xy[:, None] - xy[None]).transpose(2, 0, 1))
        self.assertGreaterEqual(d[np.triu_indices(len(xy), 1)].min(), leisure.PLAY_GAP_M)
        self.assertEqual(spots, leisure.play_spots(area, [house], "pg"), "the same on every build")

    def test_a_tiny_one_has_one_device(self):
        self.assertEqual(len(leisure.play_spots([square(0, 0, 6, 6)], [], "small")), 1)


class CemeteryTest(unittest.TestCase):
    def test_rows_clear_of_the_chapel_and_split_by_tiles(self):
        area = [square(0, 0, 60, 30), square(25, 10, 35, 20)[::-1]]      # (the hole: a yard round the chapel)
        chapel = square(27, 12, 33, 18)
        big = (-100, -100, 100, 100)
        spots = leisure.grave_spots(area, [chapel], "cem", big)
        self.assertGreater(len(spots), 100)
        xy = np.array([(s[0], s[1]) for s in spots])
        self.assertFalse(leisure.inside(xy, [area[1]])[0].any(), "none in the hole")
        ins, dist = leisure.inside(xy, [area[0]])
        self.assertTrue(ins.all() and (dist >= leisure.GRAVE_EDGE_M).all())
        west = leisure.grave_spots(area, [chapel], "cem", (-100, -100, 30, 100))
        east = leisure.grave_spots(area, [chapel], "cem", (30, -100, 100, 100))
        self.assertEqual(sorted(west + east), sorted(spots), "two tiles: the same rows")


class PitchLayoutTest(unittest.TestCase):
    def test_football_lines_and_goals_on_the_long_sides_ends(self):
        lines, objects = leisure.pitch_layout("pitch", "soccer", {}, [square(0, 0, 100, 64)])
        pts = np.concatenate([p for p, _ in lines])
        self.assertTrue((pts[:, 0] >= leisure.LINE_INSET_M - 1e-6).all() and (pts[:, 0] <= 100 - 0.5 + 1e-6).all())
        goals = sorted((round(x, 1), round(y, 1)) for k, x, y, *_ in objects if k == "goal")
        self.assertEqual(goals, [(0.5, 32.0), (99.5, 32.0)], "on the goal lines' middles")
        for _, x, _, facing, w, h in objects:
            self.assertGreater(facing[0] * (50 - x), 0, "facing into the pitch")
            self.assertAlmostEqual(w, leisure.SOCCER["goal"][0] * 99 / 105, 3)

    def test_a_small_court_has_one_hoop(self):
        _, full = leisure.pitch_layout("pitch", "basketball", {}, [square(0, 0, 29, 16)])
        _, half = leisure.pitch_layout("pitch", "basketball", {}, [square(0, 0, 15, 14)])
        _, tagged = leisure.pitch_layout("pitch", "basketball", {"hoops": "2"}, [square(0, 0, 15, 14)])
        self.assertEqual((len(full), len(half), len(tagged)), (2, 1, 2), "OSM's hoops=* first")
        self.assertTrue(all(abs(h - leisure.BASKET["height"]) < 1e-9 for *_, h in full))

    def test_track_lanes_fit_the_ring(self):
        lines, _ = leisure.pitch_layout("track", "", {}, [square(0, 0, 170, 90), square(10, 10, 160, 80)])
        self.assertEqual(len(lines), 8, "7 lanes in the 10 m ring (the corners' share counted): 8 lines")
        self.assertEqual(leisure.pitch_layout("track", "horse_racing", {}, [square(0, 0, 170, 90)]), ([], []))

    def test_other_sports_and_scraps_get_nothing(self):
        self.assertEqual(leisure.pitch_layout("pitch", "tennis", {}, [square(0, 0, 24, 11)]), ([], []))
        self.assertEqual(leisure.pitch_layout("pitch", "soccer", {}, [square(0, 0, 6, 4)]), ([], []))


class FountainTest(unittest.TestCase):
    def test_a_point_fountain_basin_and_column(self):
        b = leisure.Builder()
        leisure.fountain(b, None, np.array([10.0, 20.0]), lambda x, y: np.zeros(np.size(x)))
        P, _, _ = b.mesh()
        r = np.hypot(P[:, 0] - 10, P[:, 1] - 20)
        self.assertAlmostEqual(r.max(), leisure.FOUNTAIN_R_M + leisure.FOUNTAIN_RIM[0], delta=0.2)
        self.assertGreater(P[:, 2].max(), leisure.FOUNTAIN_RIM[1] + 1.2, "the column over the rim")


class InsideTest(unittest.TestCase):
    def test_hole_and_distance(self):
        rings = [square(0, 0, 10, 10), square(4, 4, 6, 6)]
        ins, dist = leisure.inside([(1, 1), (5, 5), (12, 5)], rings)
        self.assertEqual(ins.tolist(), [True, False, False])
        self.assertAlmostEqual(dist[0], 1.0)
        self.assertAlmostEqual(dist[1], 1.0)


if __name__ == "__main__":
    unittest.main()
