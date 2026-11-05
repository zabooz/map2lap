"""How Map2Lap's generated looks read at their distance: the shrubland ground (groundcover) and the olive's crown (trees)."""
import random
import sys
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(1, str(Path(__file__).resolve().parents[2] / "src"))
from scenery import groundcover, trees  # noqa: E402

LUMA = (0.3, 0.59, 0.11)
TILE_PX = 64                # the pixels a ground texture's repeat gets on a tile (ground: 8 m at 12.5 cm)


def spread(fn):
    """The brightness between a ground texture's darkest and brightest 5 % as a tile samples it."""
    img = fn(random.Random(23000)).resize((TILE_PX, TILE_PX), Image.LANCZOS)
    p5, p95 = np.percentile(np.asarray(img, np.float32) @ LUMA, [5, 95])
    return p95 - p5


def crown_brightness(fn):
    """The mean brightness of a tree sprite's crown (its solid pixels in the upper part)."""
    a = np.asarray(fn(random.Random(7000)), np.float32)
    top = a[: int(a.shape[0] * 0.55)]
    return float((top[top[..., 3] > 100][:, :3] @ LUMA).mean())


class GroundLooksTest(unittest.TestCase):
    def test_shrubland_is_no_more_spotted_than_a_meadow_by_much(self):
        # dark dabs on a light ground read as spots across a whole hillside (Cap Corse: 54 between the 5 % against the
        # meadow's 19, on 73 % of a track's ground)
        self.assertLess(spread(groundcover._shrub), 30)

    def test_shrubland_stays_darker_than_a_meadow(self):
        look = lambda fn: np.asarray(fn(random.Random(23000)), np.float32).reshape(-1, 3).mean(0) @ LUMA    # noqa: E731
        self.assertLess(look(groundcover._shrub), look(groundcover._meadow) - 8)


class OliveTest(unittest.TestCase):
    def test_the_olive_stands_out_without_glowing(self):
        # (its crown at 114 against the others' 60-67 came out nearly white in AC's sun)
        self.assertLess(crown_brightness(trees._olive), 90)
        self.assertGreater(crown_brightness(trees._olive), crown_brightness(trees._linden))


if __name__ == "__main__":
    unittest.main()
