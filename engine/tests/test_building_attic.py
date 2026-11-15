"""Optional attic windows fit beneath roof planes and retain the existing night mask."""
import sys
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "engine"), str(ROOT / "src")]
import buildings as bld
from buildings import mesh
from buildings.looks import _Looks
from scenery import facades


def attic(shape="skillion", height=3., enabled=True, windows=True, direction=None):
    """Emit a roof with a selectable attic pattern. Pure."""
    ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
    spec = bld.plan(ring, {"class": "house", "height": 10., "num_floors": 2,
                           "facade_material": "plaster", "roof_shape": shape,
                           "roof_height": height, "roof_direction": direction})
    spec.facade_pattern = bld.FacadePattern(attic_windows=enabled)
    spec.windows = windows
    looks, output = _Looks(spec.seed), mesh.Mesh()
    mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
    p, uv, t, mids, _ = output.arrays()
    faces = t[mids == looks["bne_bld_fac_white"][0]]
    indices = np.unique(faces)
    return spec, p[indices].reshape(-1, 4, 3), uv[indices], len(faces)


class AtticTest(unittest.TestCase):
    def test_optional_and_low_roofs_remain_blank(self):
        self.assertFalse(bld.FacadePattern().attic_windows)
        for args in ({"enabled": False}, {"height": .8}, {"windows": False}, {"shape": "flat"}):
            with self.subTest(args=args):
                self.assertEqual(attic(**args)[3], 0)

    def test_small_windows_fit_roof_and_follow_regular_axes(self):
        for direction in (0., 45., 90., 180., 270.):
            with self.subTest(direction=direction):
                spec, quads, _, faces = attic(direction=direction)
                self.assertGreater(faces, 0)
                self.assertEqual(faces, len(quads) * 2)
                down = np.array([np.sin(np.radians(direction)), np.cos(np.radians(direction))])
                ring = mesh.drawn_ring(spec)
                outer = ring + np.sign(ring - ring.mean(0)) * mesh.EAVE_M
                along = outer @ down
                roof_z = spec.height + 3. * (along.max() - quads[..., :2] @ down) / np.ptp(along)
                self.assertTrue(np.all(quads[..., 2] + .25 <= roof_z + 1e-8))
                for q in quads:
                    self.assertAlmostEqual(np.linalg.norm(q[1, :2] - q[0, :2]), .8)
                    self.assertAlmostEqual(np.ptp(q[:, 2]), .8)
                    centre = q[:, :2].mean(0)
                    if centre[1] < 0 or centre[1] > 8:
                        self.assertTrue(np.any(np.isclose(centre[0], [2., 6., 10., 14.])))
                    else:
                        self.assertTrue(np.any(np.isclose(centre[1], [2., 6.])))

    def test_gable_windows_work_with_default_and_oblique_ridges(self):
        for direction in (None, 45., 90.):
            with self.subTest(direction=direction):
                self.assertGreater(attic(shape="gabled", height=5., direction=direction)[3], 0)

    def test_window_uvs_use_existing_glow_mask_with_dark_frames(self):
        _, _, uv, count = attic()
        self.assertGreater(count, 0)
        u0, u1, v0, v1 = mesh.WIN_UV
        bays = np.floor(uv[:, 0] * 4)
        self.assertGreater(len(set(bays)), 1)
        uv[:, 0] -= bays / 4
        np.testing.assert_allclose(uv.min(0), [u0, v0])
        np.testing.assert_allclose(uv.max(0), [u1, v1])
        x0, x1 = round(u0 * 1024), round(u1 * 1024)
        y0, y1 = round((1 - v1) * 1024), round((1 - v0) * 1024)
        masks = [np.asarray(facades.window_glow("fac", level)) for level in range(3)]
        self.assertEqual(sum(bool(mask[y0 + 20, x0 + 20]) for mask in masks), 1)
        for mask in masks:
            self.assertEqual(mask[y0, x0], 0)
            self.assertEqual(mask[(y0 + y1) // 2, (x0 + x1) // 2], 0)


if __name__ == "__main__":
    unittest.main()
