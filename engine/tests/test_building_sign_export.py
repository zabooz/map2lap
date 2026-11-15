"""Letter opacity must occupy the glyph after the actual KN5 UV conversion."""
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src'), str(ROOT / 'tools')]
import buildings as bld
from buildings import mesh
import building_gallery
from track import make_obj, obj_to_kn5


class SignExportTest(unittest.TestCase):
    def test_production_and_gallery_letters_survive_kn5_uv_conversion(self):
        output = mesh.Mesh()
        mesh._lettering(output, 'A', np.array([0., 0.]), np.array([1., 0.]), np.array([0., -1.]),
                        2., 1., 3., bld._Looks(.5)['letters|0'])
        p, uv, t, *_ = output.arrays()
        vertices = obj_to_kn5.mesh_nodes('sign', 0, False, p, uv, t)[0].vertices
        lo, hi = vertices['uv'].min(0), vertices['uv'].max(0)
        u, v = np.meshgrid(np.linspace(lo[0], hi[0], 40), np.linspace(lo[1], hi[1], 40))
        for gallery in (False, True):
            with self.subTest(gallery=gallery), tempfile.TemporaryDirectory() as folder:
                folder = Path(folder)
                material = 'bne_guide_letters'
                with patch.dict(make_obj.MATERIALS, {material: make_obj.MATERIALS[material]}, clear=True):
                    if gallery:
                        building_gallery.write_materials(folder / 'track.mtl', {material})
                    else:
                        make_obj.write_mtl(str(folder / 'track.mtl'), str(folder / 'textures'))
                a = np.array(Image.open(folder / 'textures' / (material + '.png')))[:, :, 3]
                sampled = a[(v % 1 * a.shape[0]).astype(int), (u % 1 * a.shape[1]).astype(int)]
                self.assertGreater((sampled > 128).mean(), .2, 'Letters must not sample transparent atlas space')

    def test_gallery_preserves_public_window_profile(self):
        case = next(c for c in building_gallery.cases() if c['attrs'].get('class') == 'school')
        items = building_gallery.case_items(case, 0., 0.)
        before = items[0][0].facade_pattern
        building_gallery.prepare_case(items)
        self.assertEqual(items[0][0].facade_pattern.window_height_m, before.window_height_m)
        self.assertEqual(items[0][0].facade_pattern.bay_m, before.bay_m)


if __name__ == '__main__':
    unittest.main()
