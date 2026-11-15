"""Public entrances, small food businesses and terrace access have distinct bounded layouts."""
from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import buildings as bld
from buildings import mesh

RING = np.array([[0., 0.], [18., 0.], [18., 8.], [0., 8.]])


def planned(kind, **attrs):
    spec = bld.plan(RING.copy(), {'class': kind, 'height': 10., 'num_floors': 3,
                                'roof_shape': 'gabled', 'roof_height': 2., **attrs}, lat=46.6, lon=14.6)
    bld.doors([(spec, 0., 0.)], [(np.array([[-10., -8.], [30., -8.]]), 3.)], 0., 0.)
    return spec


class FrontageTest(unittest.TestCase):
    def test_public_buildings_keep_a_window_row_on_each_supplied_floor(self):
        for kind in ('school', 'college', 'university', 'townhall', 'train_station'):
            spec = planned(kind)
            self.assertEqual(bld.LOOKS[spec.facade][0], bld.STUCCO)
            output = mesh.Mesh()
            mesh._walls(output, spec, mesh.drawn_ring(spec), 0., spec.height, bld._Looks(spec.seed))
            p, _, t, mids, _ = output.arrays()
            windows = p[t[mids == bld.MATERIALS.index(bld.FACADE)]]
            self.assertEqual(len(set(np.round(windows[:, :, 2].min(axis=1), 5))), 3, kind)
            self.assertLessEqual(windows[:, :, 2].max(), spec.height)

    def test_civic_entrances_and_terrace_doors_are_distinct(self):
        from buildings.frontages import entrance_layout
        school, terrace = planned('school'), planned('terrace')
        self.assertGreaterEqual(entrance_layout(school)[0][1], 1.8)
        self.assertGreaterEqual(len(entrance_layout(terrace)), 3)
        self.assertTrue(all(width <= 1.2 for _, width in entrance_layout(terrace)))

    def test_fire_station_has_vehicle_gates_and_personnel_access(self):
        from buildings.frontages import fire_gates, frontage_kind
        spec = planned('fire_station', height=7., num_floors=2)
        self.assertEqual(frontage_kind(spec), 'fire')
        gates = fire_gates(spec)
        self.assertGreaterEqual(len(gates), 2)
        self.assertTrue(all(width >= 3. for _, width in gates))
        self.assertFalse(spec.windows)

    def test_food_labels_preserve_names_and_blade_letters_face_outward(self):
        from buildings.frontages import _business_blade
        spec = planned('cafe', height=4., num_floors=1, roof_shape='flat', roof_height=0.)
        self.assertEqual(bld.names_for(spec, None, (), 'AT'), ('CAFE',))
        self.assertEqual(bld.names_for(spec, 'Cafe Anna', (), 'AT'), ('Cafe Anna',))
        out = mesh.Mesh()
        _business_blade(out, spec, mesh.drawn_ring(spec), spec.front, spec.height, 0., bld._Looks(spec.seed))
        p, _, t, mids, _ = out.arrays()
        faces = p[t[np.isin(mids, [bld.MATERIALS.index(m) for m in bld.LETTERS])]]
        normal = np.cross(faces[:, 1] - faces[:, 0], faces[:, 2] - faces[:, 0])
        self.assertTrue(np.all(normal[:, 0] * (faces[:, :, 0].mean(1) - .6) > 0))

    def test_kiosk_has_sales_window_and_personnel_door(self):
        from buildings.frontages import frontage_kind
        spec = planned('kiosk', height=3., num_floors=1, roof_shape='flat', roof_height=0.)
        self.assertEqual(frontage_kind(spec), 'kiosk')
        _, _, _, mids, materials, _ = bld.build([(spec, 0., 0.)])
        used = {materials[i] for i in mids}
        self.assertIn(bld.SURFACE_MATERIALS['ent'], used)
        self.assertIn(bld.FACADE, used)

    def test_cafe_and_fast_food_have_front_display_windows(self):
        from buildings.frontages import frontage_kind
        for kind in ('cafe', 'fast_food'):
            spec = planned(kind, height=4., num_floors=1, roof_shape='flat', roof_height=0.)
            self.assertEqual(frontage_kind(spec), 'food')
            p, _, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
            windows = p[t[mids == materials.index(bld.FACADE)]]
            self.assertGreater(len(windows), 0)
            self.assertGreater(np.ptp(windows[0, :, 0]), 1.5)

    def test_mapped_surfaces_and_raised_parts_override_inference(self):
        from buildings.frontages import entrance_layout
        spec = planned('school', facade_material='wood', facade_color='#946442')
        self.assertEqual(bld.LOOKS[spec.facade][0], bld.SIDING)
        spec.min_h = 4.
        self.assertEqual(entrance_layout(spec), [])

    def test_narrow_cafe_does_not_put_a_display_window_over_its_door(self):
        spec = planned('cafe', height=4., num_floors=1, roof_shape='flat', roof_height=0.)
        spec.ring = RING * [.17, 1.]
        p, _, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
        doors = p[t[mids == materials.index(bld.SURFACE_MATERIALS['ent'])]]
        windows = p[t[mids == materials.index(bld.FACADE)]]
        for w in windows:
            if np.all(w[:, 1] < 0.) and w[:, 2].max() < 2.5:  # Exclude the white roof cornice.
                self.assertTrue(w[:, 0].max() <= doors[:, :, 0].min() or
                                w[:, 0].min() >= doors[:, :, 0].max())


if __name__ == '__main__':
    unittest.main()
