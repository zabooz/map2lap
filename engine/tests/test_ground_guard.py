"""The tile texture's guard ring: AC and the Editor sample a ground tile's texture repeating, so its edge must not reach the
opposite edge 256 m away (a thin green line across every road at a tile edge)."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(1, str(Path(__file__).resolve().parents[2] / "src"))
from scenery import ground  # noqa: E402


def box_mip(a, k):
    """Mip level k of a (N, N, 3) as a box filter makes it. Pure."""
    for _ in range(k):
        a = (a[0::2, 0::2] + a[1::2, 0::2] + a[0::2, 1::2] + a[1::2, 1::2]) / 4
    return a


def wrapped(a, u, v):
    """Bilinear sample of a at (u, v) with repeat addressing, as AC's sampler and three.js RepeatWrapping do. Pure."""
    h, w = a.shape[:2]
    x, y = u * w - .5, v * h - .5
    x0, y0 = int(np.floor(x)), int(np.floor(y))
    fx, fy = x - x0, y - y0
    g = lambda r, c: a[r % h, c % w]  # noqa: E731
    return (g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy
            + g(y0 + 1, x0 + 1) * fx * fy)


class GuardTest(unittest.TestCase):
    def setUp(self):
        n = ground.TEX_PX
        img = np.zeros((n, n, 3), np.uint8)
        img[..., 1] = 255               # the tile's inside: green
        img[:, :64] = (255, 0, 0)       # its west edge: red (a road)
        img[:, -64:] = (0, 0, 255)      # its east edge: blue (the grass 256 m away)
        self.img = img

    def test_a_tile_edge_samples_only_its_own_side_through_the_guarded_mips(self):
        tex = ground.guarded(self.img, ground.GUARD_PX).astype(np.float64)
        uv = ground.guarded_uv(np.array([[0.0, 0.5], [1.0, 0.5]]), ground.GUARD_PX, ground.TEX_PX)
        u_west, u_east, v = uv[0, 0], uv[1, 0], uv[0, 1]
        for k in range(int(np.log2(2 * ground.GUARD_PX)) + 1):
            m = box_mip(tex, k)
            self.assertLess(wrapped(m, u_west, v)[2], 1.0, f"mip {k}: the east edge reaches the west edge")
            self.assertLess(wrapped(m, u_east, v)[0], 1.0, f"mip {k}: the west edge reaches the east edge")

    def test_the_texture_keeps_its_size_and_the_ring_repeats_the_edge(self):
        tex = ground.guarded(self.img, ground.GUARD_PX)
        g = ground.GUARD_PX
        self.assertEqual(self.img.shape, tex.shape)
        self.assertTrue((tex[:, :g] == tex[:, g:g + 1]).all())
        self.assertTrue((tex[:, -g:] == tex[:, -g - 1:-g]).all())
        self.assertTrue((tex[:g] == tex[g:g + 1]).all())

    def test_the_uv_of_a_tile_covers_exactly_its_shrunk_inside(self):
        n, g = ground.TEX_PX, ground.GUARD_PX
        uv = ground.guarded_uv(np.array([[0.0, 0.0], [1.0, 1.0], [0.5, 0.25]]), g, n)
        np.testing.assert_allclose(uv, [[g / n, g / n], [1 - g / n, 1 - g / n], [0.5, g / n + 0.25 * (n - 2 * g) / n]])


if __name__ == "__main__":
    unittest.main()
