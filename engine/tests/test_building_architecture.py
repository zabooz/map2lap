"""Architecture metadata is retained without changing buildings until a profile is implemented."""
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'engine/tests')]
import buildings as bld


class ArchitectureTest(unittest.TestCase):
    def test_mixed_styles_keep_order_and_unknown_names(self):
        from buildings.architecture import architecture_values
        self.assertEqual(architecture_values({'building:architecture': ' Baroque ; neo-byzantine;baroque;future_style '}),
                         ('baroque', 'neo-byzantine', 'future_style'))
        for value in (None, '', float('nan'), 7):
            self.assertEqual(architecture_values({'architecture': value}), ())

    def test_placeholder_preserves_exact_mesh_and_exported_metadata(self):
        from buildings.build import _listed
        ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
        attrs = {'class': 'house', 'height': 10., 'roof_shape': 'gabled', 'facade_material': 'brick'}
        default = bld.plan(ring, attrs, lat=46.6, lon=14.6)
        tagged = bld.plan(ring, dict(attrs, **{'building:architecture': 'gothic;unimplemented'}), lat=46.6, lon=14.6)
        self.assertEqual(tagged.architecture, ('gothic', 'unimplemented'))
        before, after = bld.build([(default, 0., 0.)]), bld.build([(tagged, 0., 0.)])
        for first, second in zip(before, after):
            np.testing.assert_array_equal(first, second)
        details = _listed(0, (tagged, 0., 0.), 0, [])['details']['parameters']
        self.assertEqual(details['architecture'], tagged.architecture)

    def test_future_profile_can_supply_a_facade_pattern_only(self):
        from buildings.architecture import ArchitectureProfile, PROFILES
        ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
        pattern = bld.FacadePattern(bay_m=4.)
        with patch.dict(PROFILES, {'example': ArchitectureProfile(facade_pattern=pattern)}, clear=True):
            spec = bld.plan(ring, {'class': 'house', 'height': 10., 'roof_shape': 'hipped',
                                   'roof_material': 'copper', 'architecture': 'unknown;example'})
        self.assertIs(spec.facade_pattern, pattern)
        self.assertEqual(spec.roof, 'hipped')
        self.assertEqual(bld.LOOKS[spec.roof_mat][0], bld.SURFACE_MATERIALS['cop'])

    def test_parts_inherit_architecture_and_override_it_individually(self):
        import geodesy
        from test_buildings import Feats
        frame = geodesy.EnuFrame(46.6, 14.6)
        ring = np.array([[10., 10.], [26., 10.], [26., 22.], [10., 22.], [10., 10.]])
        lat, lon, _ = frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
        ll = np.stack([lon, lat], axis=1)
        parent = Feats(['B'], [ll], **{'class': ['commercial'], 'height': [14.], 'architecture': ['baroque']})
        parts = Feats(['base', 'top'], [ll, ll], building_id=['B', 'B'], height=[7., 14.],
                      min_height=[0., 7.], **{'building:architecture': ['', 'modern']})
        items = bld.tile_buildings(frame, 0., 0., 256., 256., [parent], lambda la, lo: np.zeros(np.shape(la)),
                                  part_layers=[parts])
        self.assertEqual([item[0].architecture for item in items], [('baroque',), ('modern',)])


if __name__ == '__main__':
    unittest.main()
