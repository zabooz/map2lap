"""Mapped surface types survive planning, mesh construction and AC texture selection."""
import sys
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import buildings as bld
from track import make_obj


class SurfaceTest(unittest.TestCase):
    def test_concrete_and_brick_wall_quads_use_plain_materials_with_separate_windows(self):
        from buildings import mesh
        ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
        for tag, expected in [('concrete', bld.CONCRETE), ('brick', bld.BRICK_WALL)]:
            with self.subTest(tag=tag):
                spec = bld.plan(ring, {'class': 'house', 'height': 10., 'num_floors': 2,
                                      'roof_shape': 'gabled', 'roof_height': 3., 'facade_material': tag},
                                lat=46.6, lon=14.6)
                output = mesh.Mesh()
                mesh._walls(output, spec, ring, 0., spec.height, bld._Looks(spec.seed))
                p = np.asarray(output.P).reshape(-1, 4, 3)
                wall = np.all(np.isclose(p[:, :, 1], 0.), axis=1)
                materials = np.asarray(output.M).reshape(-1, 2)[:, 0]
                self.assertTrue(wall.any())
                self.assertEqual(set(materials[wall]), {bld.MATERIALS.index(expected)})
                windows = np.all(p[:, :, 1] < 0, axis=1) & (p[:, :, 2].mean(axis=1) > spec.floor_h)
                self.assertEqual(np.count_nonzero(windows), 4, '16 m facade: four ordinary house windows per floor')

    def test_copper_keeps_blue_green_patina_and_patches_after_export_selection(self):
        ring = np.array([[0., 0.], [12., 0.], [12., 8.], [0., 8.]])
        spec = bld.plan(ring, {'class': 'house', 'height': 10., 'num_floors': 2,
                              'roof_shape': 'gabled', 'roof_height': 3., 'roof_material': 'copper'})
        p, uv, t, mids, materials, colors = bld.build([(spec, 0., 0.)])
        material = bld.LOOKS[spec.roof_mat][0]
        kind, px = make_obj.BLD_KINDS[material]
        faces = t[mids == materials.index(material)]
        for selected in make_obj.bld_split(p, faces, colors, kind):
            _, exported_kind, index = make_obj.MATERIALS[selected][0].split(':')
            img = make_obj.bld_texture(exported_kind, make_obj.BLD_PALETTES[exported_kind][int(index)], False, px)
            a = np.asarray(img, dtype=float)
            r, g, b = a.mean(axis=(0, 1))
            self.assertGreater(b, r + 12, 'Patina must survive palette selection without turning olive')
            self.assertGreater(g, 135, 'Use pale weathered copper, not dark green paint')
            self.assertLess(g - b, 35)
            # Patina varies along the sheets too; seam-only painted metal is constant down the slope.
            self.assertGreater(a.std(axis=0).mean(), 7)

    def test_missing_materials_get_distinct_exportable_surfaces(self):
        ring = np.array([[0., 0.], [12., 0.], [12., 8.], [0., 8.]])
        textures = set()
        for field, tags in (("facade_material", ('cement_block', 'clay', 'plastic', 'timber_framing')),
                            ("roof_material", ('eternit', 'grass', 'plastic', 'solar_panels', 'thatch', 'glass',
                                               'gravel', 'tar_paper', 'roof_tiles'))):
            for tag in tags:
                with self.subTest(field=field, tag=tag):
                    spec = bld.plan(ring, {'class': 'house', 'height': 10., 'num_floors': 2,
                                          'roof_shape': 'gabled', 'roof_height': 3., field: tag}, lat=46., lon=14.)
                    look = spec.facade if field == 'facade_material' else spec.roof_mat
                    material = bld.LOOKS[look][0]
                    self.assertIn(material, make_obj.BLD_KINDS)
                    kind, px = make_obj.BLD_KINDS[material]
                    self.assertNotIn(kind, textures)
                    textures.add(kind)
                    p, uv, t, mids, materials, colors = bld.build([(spec, 0., 0.)])
                    self.assertIn(material, {materials[m] for m in np.unique(mids)})
                    img = make_obj.bld_texture(kind, (1., 1., 1.), False, px)
                    self.assertEqual(img.size, (512, 512))
                    self.assertGreater(np.asarray(img).std(), 5)
                    # Every generated surface repeats without a border seam.
                    a = np.asarray(img).astype(float)
                    self.assertLess(np.abs(a[0] - a[-1]).mean(), 3)
                    self.assertLess(np.abs(a[:, 0] - a[:, -1]).mean(), 3)


if __name__ == '__main__':
    unittest.main()
