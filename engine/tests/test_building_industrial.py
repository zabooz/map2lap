"""Industrial fronts use class-specific openings instead of the retail window strip."""
from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import buildings as bld
from buildings import mesh

KINDS = ('industrial', 'warehouse', 'manufacture', 'factory', 'hangar')
RING = np.array([[0., 0.], [40., 0.], [40., 32.], [0., 32.]])


def hall(kind, ring=None, **attrs):
    spec = bld.plan(RING.copy() if ring is None else ring, {'class': kind, 'height': 10. if kind in ('factory', 'hangar') else 8.,
                                 'num_floors': 2 if kind == 'factory' else 1, 'roof_shape': 'flat', **attrs}, lat=47., lon=12.)
    bld.doors([(spec, 0., 0.)], [(np.array([[-10., -8.], [50., -8.]]), 3.)], 0., 0.)
    return spec


class IndustrialTest(unittest.TestCase):
    def test_native_wall_emission_keeps_retail_fronts_but_not_industry_or_garages(self):
        for kind in (*KINDS, 'garage', 'stable', 'supermarket'):
            spec = hall(kind)
            output = mesh.Mesh()
            mesh._walls(output, spec, mesh.drawn_ring(spec), 0., spec.height, bld._Looks(spec.seed))
            materials = {bld.MATERIALS[i] for i in output.M}
            self.assertEqual(bld.SHOP in materials, kind == 'supermarket', kind)

    def test_industry_profiles_have_distinct_gates_and_window_patterns(self):
        from buildings.industrial import industrial_openings
        layouts = {kind: industrial_openings(hall(kind), 0., 0.) for kind in KINDS}
        gates = lambda kind: [p for p in layouts[kind] if p.kind in ('gate', 'hangar')]
        windows = lambda kind: [p for p in layouts[kind] if p.kind == 'window']
        self.assertGreaterEqual(len(gates('warehouse')), 3)
        self.assertEqual(len(gates('industrial')), 1)
        self.assertEqual(len(gates('hangar')), 1)
        self.assertGreater(gates('hangar')[0].width, 20.)
        self.assertGreater(gates('hangar')[0].height, gates('warehouse')[0].height)
        self.assertGreater(len(windows('manufacture')), len(windows('warehouse')))
        self.assertGreater(len({p.bottom for p in windows('factory')}), 1)
        for kind, panels in layouts.items():
            self.assertTrue(any(p.kind == 'door' for p in panels), kind)
            self.assertLessEqual(len(panels), 56)

    def test_openings_fit_their_wall_and_do_not_overlap(self):
        from buildings.industrial import industrial_openings
        for kind in KINDS:
            spec = hall(kind)
            spec.gring = np.array([1., 1., 2., 2.])
            panels = industrial_openings(spec, 1., 2.)
            ring = mesh.drawn_ring(spec)
            for i, p in enumerate(panels):
                length = np.linalg.norm(ring[(p.edge + 1) % len(ring)] - ring[p.edge])
                self.assertGreaterEqual(p.along - p.width / 2, .5 - 1e-7)
                self.assertLessEqual(p.along + p.width / 2, length - .5 + 1e-7)
                self.assertGreaterEqual(p.bottom, 1.)
                self.assertLessEqual(p.bottom + p.height, 2. + spec.height - .5 + 1e-7)
                for q in panels[:i]:
                    if p.edge == q.edge:
                        overlaps = abs(p.along - q.along) < (p.width + q.width) / 2 and \
                            p.bottom < q.bottom + q.height and q.bottom < p.bottom + p.height
                        self.assertFalse(overlaps, (kind, p, q))

    def test_mapped_materials_and_pitched_roofs_keep_their_inputs(self):
        from buildings.industrial import industrial_openings
        for material, expected in (('brick', bld.BRICK_WALL), ('wood', bld.SIDING), ('concrete', bld.CONCRETE)):
            spec = hall('warehouse', ring=RING * .6, facade_material=material, roof_shape='gabled', roof_height=2.)
            self.assertEqual(bld.LOOKS[spec.facade][0], expected)
            self.assertEqual(spec.roof, 'gabled')
            self.assertTrue(industrial_openings(spec, 0., 0.))
            p, uv, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
            self.assertNotIn(bld.SHOP, {materials[i] for i in mids})
            self.assertIn(bld.SURFACE_MATERIALS['ind'], {materials[i] for i in mids})
            self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())

    def test_windows_keep_the_shared_night_mask_and_raised_parts_have_no_ground_gates(self):
        from buildings.industrial import industrial_openings
        spec = hall('manufacture')
        p, uv, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
        windows = t[mids == materials.index(bld.FACADE)]
        self.assertGreater(len(windows), 0)
        self.assertGreater(len(set(np.floor(uv[windows, 0].mean(axis=1) * 4).astype(int))), 1)
        spec.min_h = 5.
        self.assertEqual(industrial_openings(spec, 0., 0.), [])

    def test_exported_texture_distinguishes_loading_doors_and_hangar_panels(self):
        from track import make_obj
        kind, px = make_obj.BLD_KINDS[bld.SURFACE_MATERIALS['ind']]
        a = np.asarray(make_obj.bld_texture(kind, (1., 1., 1.), False, px), float)
        self.assertGreater(np.abs(a[:px // 2, :px // 2] - a[:px // 2, px // 2:]).mean(), 15.)


if __name__ == '__main__':
    unittest.main()
