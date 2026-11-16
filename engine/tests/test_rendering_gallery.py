"""Rendering comparisons isolate one shader input and use linear-albedo references."""
import io
from pathlib import Path
import sys
import unittest
import zipfile

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'tools'), str(ROOT / 'src')]
import rendering_gallery as gallery
from scenery import treefx


class RenderingGalleryTest(unittest.TestCase):
    def test_legacy_comparison_retains_old_lighting_with_identical_albedo(self):
        for species in ('spruce', 'broadleaf'):
            _, raw = gallery.tree_variant(species, 'LEGACY')
            with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                shading = treefx._ini(archive.read('tree.ini').decode())['SHADING']
            self.assertEqual({key: float(shading[key]) for key in
                              ('BRIGHTNESS', 'SPECULAR', 'REFLECTIVITY', 'SUBSCATTERING')},
                             dict.fromkeys(('BRIGHTNESS', 'SPECULAR', 'REFLECTIVITY', 'SUBSCATTERING'), 1.))

    def test_grey_reference_encodes_linear_albedo_as_srgb(self):
        for value in (.05, .18, .5, .9):
            pixel = np.asarray(gallery.grey(value))[0, 0] / 255.
            linear = np.where(pixel <= .04045, pixel / 12.92, ((pixel + .055) / 1.055) ** 2.4)
            np.testing.assert_allclose(linear, value, atol=.004)
        self.assertEqual(gallery.grey(.18).getpixel((0, 0)), (118, 118, 118))

    def test_tree_variants_change_one_input_and_have_separate_cache_names(self):
        for species in ('spruce', 'broadleaf'):
            source = treefx.read_bin(io.BytesIO(treefx.bin_bytes(species)))
            used = set()
            for variant in gallery.VARIANTS:
                name, raw = gallery.tree_variant(species, variant)
                self.assertNotIn(name, used)
                used.add(name)
                loaded = treefx.read_bin(io.BytesIO(raw))
                self.assertIsNone(treefx.generated_species(loaded), 'Play must preserve diagnostic overrides')
                for before, after in zip(source['lods'], loaded['lods']):
                    for key in ('pos', 'normals', 'uv', 'indices'):
                        np.testing.assert_array_equal(before['parts'][0][key], after['parts'][0][key])
                with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                    ini = treefx._ini(archive.read('tree.ini').decode())
                    for key in ('SPECULAR', 'REFLECTIVITY', 'SUBSCATTERING', 'BRIGHTNESS'):
                        expected = 1. if variant in (key, 'LEGACY') else (.5 if key == 'BRIGHTNESS' else 0.)
                        self.assertEqual(float(ini['SHADING'][key]), expected)
                for key in ('diffuse', 'normal_map'):
                    before = np.asarray(Image.open(io.BytesIO(source['textures'][source['lods'][0]['parts'][0][key]])))
                    after = np.asarray(Image.open(io.BytesIO(loaded['textures'][loaded['lods'][0]['parts'][0][key]])))
                    if variant == 'NORMAL_ALPHA' and key == 'normal_map':
                        before = before.copy(); before[..., 3] = 0
                    np.testing.assert_array_equal(after, before)


if __name__ == '__main__':
    unittest.main()
