"""Inferred roof equipment stays within concave roofs and uses an exported equipment texture."""
from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import buildings as bld
from buildings import mesh
from track import make_obj


class RoofUnitsTest(unittest.TestCase):
    def test_clearance_includes_notches_between_corners_and_rotated_roofs(self):
        # All four box corners lie inside, but a narrow notch cuts through its upper edge.
        ring = np.array([[0., 0.], [20., 0.], [20., 20.], [10.2, 20.], [10.2, 8.],
                         [9.8, 8.], [9.8, 20.], [0., 20.]])
        for angle in (0., .6):
            rotation = np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
            roof = ring @ rotation.T + [40., -30.]
            centre = lambda p: np.asarray(p) @ rotation.T + [40., -30.]
            u = rotation[:, 0]
            self.assertFalse(mesh._roof_unit_fits(roof, centre([10., 8.]), u, 2., 1.6))
            self.assertFalse(mesh._roof_unit_fits(roof, centre([2.2, 4.]), u, 2., 1.6))
            self.assertTrue(mesh._roof_unit_fits(roof, centre([5., 4.]), u, 2., 1.6))

    def test_emitted_units_stay_on_the_l_shaped_roof_with_clearance(self):
        ring = np.array([[0., 0.], [30., 0.], [30., 5.], [5., 5.], [5., 30.], [0., 30.]])
        spec = bld.plan(ring, {'class': 'house', 'height': 7., 'roof_shape': 'flat'})
        total = 0
        for seed in range(24):
            spec.seed = seed
            out = mesh.Mesh()
            mesh._clutter(out, spec, ring, 7., bld._Looks(seed))
            positions = np.asarray(out.P).reshape(-1, 20, 3)
            for unit in positions:
                total += 1
                self.assertAlmostEqual(unit[:, 2].min(), 7.)
                for p in unit[-4:, :2]:
                    self.assertTrue(mesh._inside(ring, p))
                    delta = np.roll(ring, -1, axis=0) - ring
                    t = np.clip(np.sum((p - ring) * delta, axis=1) / np.sum(delta * delta, axis=1), 0., 1.)
                    distance = np.linalg.norm(p - (ring + delta * t[:, None]), axis=1).min()
                    self.assertGreaterEqual(distance, .5 - 1e-7)
        self.assertGreater(total, 0, 'Keep valid units instead of disabling roof equipment')

    def test_equipment_uses_textured_panels_with_a_plain_lid(self):
        ring = np.array([[0., 0.], [30., 0.], [30., 30.], [0., 30.]])
        spec = bld.plan(ring, {'class': 'house', 'height': 7., 'roof_shape': 'flat'})
        out = mesh.Mesh()
        mesh._clutter(out, spec, ring, 7., bld._Looks(spec.seed))
        self.assertGreater(out.n, 0)
        self.assertEqual({bld.MATERIALS[i] for i in out.M}, {bld.SURFACE_MATERIALS['hvu']})
        uv = np.asarray(out.UV).reshape(-1, 5, 4, 2)
        self.assertGreater(np.ptp(uv[:, :4, :, 0]), .8)
        self.assertGreater(uv[:, :4, :, 1].min(), .5)
        self.assertLess(uv[:, 4, :, 1].max(), .5)
        kind, px = make_obj.BLD_KINDS[bld.SURFACE_MATERIALS['hvu']]
        image = np.asarray(make_obj.bld_texture(kind, (1., 1., 1.), False, px), dtype=float)
        self.assertGreater(image[:px // 2].std(), 20., 'Visible dark louvres on metal panels')
        self.assertLess(image[px // 2:].std(), image[:px // 2].std(), 'Lid is not another vent grille')


if __name__ == '__main__':
    unittest.main()
