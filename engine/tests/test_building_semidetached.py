"""Whole mapped pairs get two entrances; separate halves and ambiguous outlines do not."""
from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src'), str(ROOT / 'tools')]
import buildings as bld
from buildings.frontages import entrance_layout, frontage_kind
import building_gallery

RING = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])


def planned(neighbours=0, **attrs):
    spec = bld.plan(RING.copy(), {'class': 'semidetached_house', 'height': 8., 'num_floors': 2,
                                 'roof_shape': 'gabled', 'roof_height': 2., **attrs}, neighbours, 46.6, 14.6)
    props = bld.doors([(spec, 0., 0.)], [(np.array([[-5., -6.], [21., -6.]]), 2.)], 0., 0.)
    return spec, props


class SemidetachedTest(unittest.TestCase):
    def test_whole_pair_has_exactly_two_mirrored_entrances(self):
        spec, props = planned(**{'building:flats': '2'})
        self.assertEqual(frontage_kind(spec), 'paired')
        doors = entrance_layout(spec)
        self.assertEqual(len(doors), 2)
        self.assertAlmostEqual(doors[0][0] + doors[1][0], 16.)
        self.assertFalse(any(row[0] == 'door' for row in props), 'No extra ordinary house entrance')

    def test_separate_halves_and_unknown_counts_keep_one_entrance(self):
        for neighbours, count in ((1, '2'), (0, None), (0, '1'), (0, 'unknown'), (0, '2;3')):
            spec, props = planned(neighbours, **{'building:flats': count})
            self.assertEqual(frontage_kind(spec), 'semi_half')
            self.assertEqual(len(entrance_layout(spec)), 1)
            self.assertFalse(any(row[0] == 'door' for row in props))

    def test_pair_front_has_symmetric_window_axes_without_door_overlap(self):
        spec, _ = planned(**{'building:flats': 2})
        p, uv, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
        panes = p[t[mids == materials.index(bld.FACADE)]]
        panes = panes[np.all(panes[:, :, 1] < 0., axis=1)]
        centres = sorted(set(np.round((panes[:, :, 0].min(1) + panes[:, :, 0].max(1)) / 2, 5)))
        np.testing.assert_allclose(centres, 16 - np.array(centres[::-1]))
        for pane in panes:
            if pane[:, 2].min() < 2.:
                for along, width in entrance_layout(spec):
                    self.assertTrue(pane[:, 0].max() < along - width / 2 or pane[:, 0].min() > along + width / 2)
        self.assertLess(len(t), 200)
        self.assertTrue(np.isfinite(uv).all())

    def test_pair_preserves_mapped_material_and_raised_parts_do_not_get_access(self):
        spec, _ = planned(facade_material='wood', **{'building:flats': 2})
        self.assertEqual(bld.LOOKS[spec.facade][0], bld.SIDING)
        spec.min_h = 4.
        self.assertEqual(entrance_layout(spec), [])

    def test_gallery_pair_is_explicit_and_house_detached_stay_general(self):
        cases = building_gallery.cases()
        pair = building_gallery.case_items(cases[83], 0., 0.)[0][0]
        self.assertEqual(frontage_kind(pair), 'paired')
        self.assertEqual(len(entrance_layout(pair)), 2)
        for index in (81, 82):
            spec = building_gallery.case_items(cases[index], 0., 0.)[0][0]
            self.assertIsNone(frontage_kind(spec))

    def test_tile_import_retains_supplied_dwelling_count(self):
        import geodesy
        from test_buildings import Feats
        frame = geodesy.EnuFrame(46.6, 14.6)
        ring = np.vstack([RING, RING[0]]) + [20., 20.]
        la, lo, _ = frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
        feats = Feats(['pair'], [np.c_[lo, la]], **{'class': ['semidetached_house'], 'height': [8.],
                      'num_floors': [2.], 'building:flats': ['2']})
        items = bld.tile_buildings(frame, 0, 0, 256, 256, [feats], lambda la, lo: np.zeros(np.shape(la)))
        self.assertEqual(len(items), 1)
        self.assertEqual(frontage_kind(items[0][0]), 'paired')


if __name__ == '__main__':
    unittest.main()
