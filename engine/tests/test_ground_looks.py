"""How Map2Lap's generated looks read at their distance: the shrubland ground (groundcover) and the cheap bushes."""
import random
import sys
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(1, str(Path(__file__).resolve().parents[2] / "src"))
from scenery import bushes, groundcover  # noqa: E402
from track import obj_to_kn5  # noqa: E402

LUMA = (0.3, 0.59, 0.11)
TILE_PX = 64                # the pixels a ground texture's repeat gets on a tile (ground: 8 m at 12.5 cm)


def spread(fn):
    """The brightness between a ground texture's darkest and brightest 5 % as a tile samples it."""
    img = fn(random.Random(23000)).resize((TILE_PX, TILE_PX), Image.LANCZOS)
    p5, p95 = np.percentile(np.asarray(img, np.float32) @ LUMA, [5, 95])
    return p95 - p5


class GroundLooksTest(unittest.TestCase):
    def test_shrubland_is_no_more_spotted_than_a_meadow_by_much(self):
        # dark dabs on a light ground read as spots across a whole hillside (Cap Corse: 54 between the 5 % against the
        # meadow's 19, on 73 % of a track's ground)
        self.assertLess(spread(groundcover._shrub), 30)

    def test_shrubland_stays_darker_than_a_meadow(self):
        look = lambda fn: np.asarray(fn(random.Random(23000)), np.float32).reshape(-1, 3).mean(0) @ LUMA    # noqa: E731
        self.assertLess(look(groundcover._shrub), look(groundcover._meadow) - 8)


class CheapBushesTest(unittest.TestCase):
    FREE = np.ones((128, 128), bool)

    def in_cells(self, m=32.0):
        """Bushes per m square over 12 x 12 free tiles."""
        x, y = [], []
        for tx in range(-6, 6):
            for ty in range(-6, 6):
                a, b, *_ = bushes.scatter(tx * 256.0, ty * 256.0, 256.0, self.FREE, 2.0)
                x.append(a)
                y.append(b)
        x, y = np.concatenate(x), np.concatenate(y)
        return np.histogram2d(x, y, bins=int(3072 / m), range=[[-1536, 1536], [-1536, 1536]])[0]

    def test_they_stand_in_groups_with_gaps_not_evenly(self):
        # (spread evenly they read as spots again; a random even spread has a variance about its mean)
        c = self.in_cells()
        self.assertGreater(c.var() / c.mean(), 4.0)
        self.assertGreater((c == 0).mean(), 0.1)
        self.assertGreater(c.max(), 3 * c.mean())

    def test_a_tile_gets_a_budget_of_a_few_thousand(self):
        n = [len(bushes.scatter(tx * 256.0, 0.0, 256.0, self.FREE, 2.0)[0]) for tx in range(-20, 20)]
        self.assertLess(max(n), 5000)       # (8 triangles each; the tile's other vegetation: up to 48,000)
        self.assertGreater(np.mean(n), 800)

    def test_they_stand_only_where_free(self):
        free = np.zeros((128, 128), bool)
        free[40:80, 40:80] = True
        x, y, *_ = bushes.scatter(0.0, 0.0, 256.0, free, 2.0)
        self.assertGreater(len(x), 0)
        self.assertTrue(free[(y / 2.0).astype(int), (x / 2.0).astype(int)].all())

    def test_a_tile_border_splits_no_bush_and_the_build_repeats(self):
        left = bushes.scatter(0.0, 0.0, 256.0, self.FREE, 2.0)
        right = bushes.scatter(256.0, 0.0, 256.0, self.FREE, 2.0)
        whole = bushes.scatter(0.0, 0.0, 512.0, np.ones((128, 256), bool), 2.0)
        self.assertEqual(len(left[0]) + len(right[0]), len(whole[0]))
        for a, b in zip(left, bushes.scatter(0.0, 0.0, 256.0, self.FREE, 2.0)):
            np.testing.assert_array_equal(a, b)

    def test_dry_country_is_thinner(self):
        some = lambda share: sum(len(bushes.scatter(t * 256.0, 0.0, 256.0, self.FREE, 2.0, share)[0]) for t in range(-9, 9))    # noqa: E731
        self.assertLess(some(bushes.ZONE_SHARE["desert"]), 0.4 * some(1.0))

    def test_they_are_near_only_and_cast_no_shadow(self):
        self.assertEqual(obj_to_kn5.view("nocol_bush_3_12"), (350.0, 0))


if __name__ == "__main__":
    unittest.main()
