"""Per-part materials survive map extraction and override regional/class guesses."""
import sys
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'engine/tests')]
import buildings as bld
import geodesy
import mapdata
import overture
from test_buildings import Feats


class PartMaterialTest(unittest.TestCase):
    def test_query_and_cache_include_part_materials(self):
        layer = overture.LAYERS['building_parts']
        for field in ('facade_material', 'roof_material'):
            self.assertIn(field, layer['cols'])
            self.assertIn(field, layer['text'])
        self.assertGreaterEqual(mapdata.LAYER_VERSIONS['building_parts'], 2)

    def test_part_material_then_parent_then_region(self):
        frame = geodesy.EnuFrame(46.6, 14.6)
        ring = np.array([[10., 10.], [26., 10.], [26., 22.], [10., 22.], [10., 10.]])
        lat, lon, _ = frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
        ll = np.stack([lon, lat], axis=1)
        for parent_tags in ({'facade_material': ['stone'], 'roof_material': ['copper']}, {}):
            parent = Feats(['B'], [ll], **{'class': ['commercial'], 'height': [14.], **parent_tags})
            parts = Feats(['base', 'top'], [ll, ll], building_id=['B', 'B'], height=[7., 14.],
                          min_height=[0., 7.], roof_shape=['flat', 'flat'],
                          facade_material=['', 'glass'], roof_material=['', 'grass'])
            items = bld.tile_buildings(frame, 0., 0., 256., 256., [parent], lambda la, lo: np.zeros(np.shape(la)),
                                       part_layers=[parts])
            self.assertEqual(len(items), 2)
            base, top = [item[0] for item in items]
            self.assertEqual(bld.LOOKS[top.facade][0], bld.OFFICE)
            self.assertEqual(bld.LOOKS[top.roof_mat][0], bld.SURFACE_MATERIALS['veg'])
            if parent_tags:
                self.assertEqual(bld.LOOKS[base.facade][0], bld.STONE)
                self.assertEqual(bld.LOOKS[base.roof_mat][0], bld.SURFACE_MATERIALS['cop'])
            else:
                reference = bld.plan(base.ring, {'class': 'commercial', 'height': base.height,
                                                'roof_shape': 'flat', 'building_height': 14.},
                                     lat=46.6, lon=14.6, look=base.seed)
                self.assertEqual(base.facade, reference.facade)
                self.assertEqual(base.roof_mat, reference.roof_mat)

    def test_mapped_concrete_overrides_hall_barn_shed_and_terminal_guesses(self):
        for cls, size in [('industrial', 50.), ('barn', 12.), ('shed', 5.), ('terminal', 30.), ('castle', 25.)]:
            for lat, lon in [(46.6, 14.6), (39.2, -76.6), (35.7, 139.7)]:
                with self.subTest(cls=cls, lat=lat):
                    ring = np.array([[0., 0.], [size, 0.], [size, size], [0., size]])
                    attrs = {'class': cls, 'height': 7., 'num_floors': 2, 'roof_shape': 'flat',
                             'facade_material': 'concrete', 'facade_color': '#aabbcc'}
                    if cls == 'terminal':
                        attrs['name'] = 'Airport Terminal'
                    if cls == 'castle':
                        attrs['castle'] = 'castle'
                    spec = bld.plan(ring, attrs, lat=lat, lon=lon)
                    material, rgb = bld.LOOKS[spec.facade]
                    self.assertEqual(material, bld.CONCRETE)
                    np.testing.assert_allclose(rgb, [170 / 255, 187 / 255, 204 / 255])
                    if cls in ('industrial', 'barn', 'shed'):
                        from buildings import mesh
                        walls = mesh.Mesh()
                        mesh._walls(walls, spec, ring, 0., spec.height, bld._Looks(spec.seed))
                        self.assertEqual(set(walls.M), {bld.MATERIALS.index(bld.CONCRETE)},
                                         'A mapped surface must not add house windows to a windowless use')

    def test_colored_brick_resolves_the_material_behind_its_named_look(self):
        ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
        spec = bld.plan(ring, {'class': 'house', 'facade_material': 'brick', 'facade_color': '#aabbcc'})
        index, _ = bld._Looks(spec.seed)[spec.facade]
        self.assertEqual(bld.MATERIALS[index], bld.BRICK_WALL)

    def test_unknown_material_keeps_existing_regional_fallback(self):
        ring = np.array([[0., 0.], [50., 0.], [50., 50.], [0., 50.]])
        attrs = {'class': 'industrial', 'height': 7., 'roof_shape': 'flat'}
        default = bld.plan(ring, attrs, lat=35.7, lon=139.7)
        unknown = bld.plan(ring, dict(attrs, facade_material='unknown_future_material'), lat=35.7, lon=139.7)
        self.assertEqual(unknown.facade, default.facade)
        self.assertEqual(unknown.windows, default.windows)


if __name__ == '__main__':
    unittest.main()
