"""Garages and farm buildings have class-specific openings without overriding mapped materials."""
from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import buildings as bld
from track import make_obj

RING = np.array([[0., 0.], [16., 0.], [16., 10.], [0., 10.]])


def planned(kind, **attrs):
    return bld.plan(RING.copy(), {'class': kind, 'height': 5., 'roof_shape': 'flat', **attrs}, lat=47., lon=12.)


def panels(spec, ground=0.):
    p, uv, t, mids, materials, _ = bld.build([(spec, ground, ground)])
    selected = t[mids == materials.index(bld.SURFACE_MATERIALS['utl'])]
    return p[selected], uv[selected]


class UtilityTest(unittest.TestCase):
    def test_garage_fallback_is_plaster_but_mapped_wood_and_brick_win(self):
        self.assertEqual(bld.LOOKS[planned('garage').facade][0], bld.STUCCO)
        for tag, expected in [('wood', bld.SIDING), ('brick', bld.BRICK_WALL), ('metal', bld.METALWALL)]:
            with self.subTest(material=tag):
                self.assertEqual(bld.LOOKS[planned('garage', facade_material=tag).facade][0], expected)
        coloured = planned('garage', facade_color='#cc5533')
        self.assertEqual(bld.LOOKS[coloured.facade][0], bld.STUCCO)

    def test_gate_follows_the_road_facing_wall_and_local_ground(self):
        spec = planned('garage')
        spec.gring = np.array([100., 100., 102., 102.])
        bld.doors([(spec, 100., 102.)], [(np.array([[-10., 15.], [26., 15.]]), 2.)], 0., 0.)
        self.assertEqual(spec.front, 2)
        p, _ = panels(spec, 102.)
        self.assertGreater(p.size, 0)
        self.assertTrue(np.all(p[:, :, 1] > 10.))
        self.assertAlmostEqual(p[:, :, 2].min(), 102.)
        self.assertLessEqual(p[:, :, 2].max(), 107.)

    def test_row_of_garages_has_multiple_gates_and_stable_has_small_windows(self):
        p, uv = panels(planned('garages'))
        self.assertGreater(len(p), 2, 'More than one two-triangle gate on a long garage row')
        self.assertTrue(np.all(uv[:, :, 1] > .5))
        p, uv, t, mids, materials, _ = bld.build([(planned('stable'), 0., 0.)])
        windows = t[mids == materials.index(bld.FACADE)]
        self.assertGreater(len(windows), 0, 'Stable windows reuse the existing facade night masks')
        self.assertLess(np.ptp(p[windows[0], 2]), .7)

    def test_utility_classes_work_on_flat_and_pitched_roofs(self):
        for kind in ('garage', 'garages', 'stable', 'cowshed', 'barn', 'farm_auxiliary'):
            for shape in ('flat', 'gabled'):
                with self.subTest(kind=kind, roof=shape):
                    spec = planned(kind, roof_shape=shape, height=7., roof_height=2.)
                    p, uv = panels(spec)
                    self.assertGreater(p.size, 0)
                    self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                    self.assertLessEqual(p[:, :, 2].max(), spec.height)

    def test_carports_and_raised_parts_do_not_get_ground_level_gates(self):
        for kind in ('carport', 'roof', 'house', 'garage'):
            spec = planned(kind)
            if kind == 'garage':
                spec.min_h = 4.
            p, _ = panels(spec)
            self.assertEqual(p.size, 0)

    def test_shared_texture_distinguishes_metal_shutters_and_braced_timber_doors(self):
        material = bld.SURFACE_MATERIALS['utl']
        kind, px = make_obj.BLD_KINDS[material]
        image = np.asarray(make_obj.bld_texture(kind, (1., 1., 1.), False, px), float)
        metal, wood = image[:px // 2, :px // 2], image[:px // 2, px // 2:]
        self.assertGreater(np.abs(metal - wood).mean(), 20.)
        self.assertGreater(metal.std(), 15.)
        self.assertGreater(wood.std(), 15.)


if __name__ == '__main__':
    unittest.main()
