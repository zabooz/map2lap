"""The tile texture's layout (ground.phased): AC and the Editor sample a ground tile's texture repeating, so its edge must
not reach the opposite edge 256 m away (a thin green line across every road at a tile edge); and the texture lies at the
world's phase, so a painted Save samples the same image in world X/Z (fuPBR's layers) as the mesh UVs do."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(1, str(Path(__file__).resolve().parents[2] / "src"))
from scenery import ground  # noqa: E402
from track import groundmaterial  # noqa: E402

TILES = [(0, 0), (3, -2), (-5, 7), (-1, -1)]


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


class PhasedTest(unittest.TestCase):
    def setUp(self):
        n = ground.TEX_PX
        img = np.zeros((n, n, 3), np.uint8)
        img[..., 1] = 255               # the tile's inside: green
        img[:, :64] = (255, 0, 0)       # its west edge: red (a road)
        img[:, -64:] = (0, 0, 255)      # its east edge: blue (the grass 256 m away)
        self.img = img

    def test_a_tile_edge_samples_only_its_own_side_through_the_guarded_mips(self):
        for tile in TILES:
            tex = ground.phased(self.img, tile).astype(np.float64)
            uv = ground.phased_uv(np.array([[0.0, 0.5], [1.0, 0.5]]), tile)
            u_west, u_east, v = uv[0, 0], uv[1, 0], -uv[0, 1]      # (kn5 stores v negated)
            # (both guards lie side by side in one 2 * GUARD_PX gap, on a mip block's edge: their own mips hold apart)
            for k in range(int(np.log2(ground.GUARD_PX)) + 1):
                m = box_mip(tex, k)
                self.assertLess(wrapped(m, u_west, v)[2], 1.0, f"tile {tile} mip {k}: the east edge reaches the west edge")
                self.assertLess(wrapped(m, u_east, v)[0], 1.0, f"tile {tile} mip {k}: the west edge reaches the east edge")

    def test_the_texture_keeps_its_size_and_holds_the_tile_once_with_its_edges_repeated_around_it(self):
        n, g = ground.TEX_PX, ground.GUARD_PX
        for tile in TILES:
            tex = ground.phased(self.img, tile)
            self.assertEqual(self.img.shape, tex.shape)
            red = np.flatnonzero(tex[n // 2, :, 0] > 128)
            blue = np.flatnonzero(tex[n // 2, :, 2] > 128)
            # the tile's own 64 px edges shrunk by (n - 2g) / n, and each repeated g times across the guard
            self.assertEqual(round(64 * (n - 2 * g) / n) + g, len(red), tile)
            self.assertEqual(round(64 * (n - 2 * g) / n) + g, len(blue), tile)

    def test_mesh_uvs_and_world_xz_sample_the_same_pixel(self):
        """fuPBR samples a layer at world X/Z times its multiplier (AC's z points south); the mesh at its UV."""
        n, s = ground.TEX_PX, groundmaterial.UV_SCALE
        rng = np.random.default_rng(1)
        for tile in TILES:
            tex = ground.phased(self.img, tile)
            local = rng.uniform(0, 1, (50, 2))
            uv = ground.phased_uv(local, tile)
            x, north = (np.asarray(tile) + local).T * 256
            mult = s / 256
            for k in range(len(local)):
                by_mesh = tex[int(np.floor(-uv[k, 1] * n)) % n, int(np.floor(uv[k, 0] * n)) % n]
                by_world = tex[int(np.floor(-north[k] * mult * n)) % n, int(np.floor(x[k] * mult * n)) % n]
                np.testing.assert_array_equal(by_mesh, by_world)

    def test_a_tile_point_shows_its_own_pixel(self):
        n = ground.TEX_PX
        img = np.zeros((n, n, 3), np.uint8)
        img[: n // 2, : n // 2] = (255, 255, 255)           # the tile's north-west quarter: white
        for tile in TILES:
            tex = ground.phased(img, tile)
            for (lx, ly), white in (((.2, .8), True), ((.7, .8), False), ((.2, .3), False)):
                u, v = ground.phased_uv(np.array([[lx, ly]]), tile)[0]
                self.assertEqual(white, bool(wrapped(tex.astype(np.float64), u, -v)[0] > 128), (tile, lx, ly))

    def test_the_uv_is_the_world_position_in_tiles_times_the_scale(self):
        uv = ground.phased_uv(np.array([[0.0, 0.0], [1.0, 1.0], [0.5, 0.25]]), (3, -2))
        np.testing.assert_allclose(uv, (np.array([[3, -2], [4, -1], [3.5, -1.75]])) * groundmaterial.UV_SCALE)

    def test_the_scale_is_the_share_of_the_texture_inside_its_guard(self):
        self.assertEqual((ground.TEX_PX - 2 * ground.GUARD_PX) / ground.TEX_PX, groundmaterial.UV_SCALE)


if __name__ == "__main__":
    unittest.main()
