"""Legacy material RGB is decoded only by explicit choice; preview and retained models agree."""
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest import mock

import numpy as np

from test_modeldata import encode, fixture
from app import modeldata, modelimport, objectlibrary, trackmodels


def coloured_model():
    """A legacy palette factor, embedded texture, alpha and unrelated PBR inputs. Pure."""
    document, binary = fixture()
    document['materials'][0]['pbrMetallicRoughness']['baseColorFactor'] = [159 / 255, 137 / 255, 1, .75]
    document['materials'][0]['emissiveFactor'] = [.1, .2, .3]
    return encode(document, binary)


class ColourTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        patch = mock.patch.object(objectlibrary, 'ROOT', self.temporary.name)
        patch.start()
        self.addCleanup(patch.stop)

    def test_default_keeps_valid_glb_bytes_and_explicit_srgb_changes_only_base_rgb(self):
        raw = coloured_model()
        self.assertEqual(raw, modelimport.material_colours(raw, 'linear'))
        changed = modelimport.material_colours(raw, 'srgb')
        original, original_binary = modeldata._chunks(raw)
        document, binary = modeldata._chunks(changed)
        self.assertEqual(bytes(original_binary), bytes(binary))
        self.assertEqual(modeldata.load(raw).images, modeldata.load(changed).images)
        factor = document['materials'][0]['pbrMetallicRoughness']['baseColorFactor']
        np.testing.assert_allclose(factor, [.3467040563550296, .25015828472995344, 1, .75], atol=1e-12)
        original['materials'][0]['pbrMetallicRoughness']['baseColorFactor'] = factor
        self.assertEqual(original, document)
        for choice in ('auto', None, [], ''):
            with self.subTest(choice=choice), self.assertRaisesRegex(ValueError, 'colour'):
                modelimport.material_colours(raw, choice)

    def test_srgb_transfer_matches_a_colour_texture_including_the_dark_linear_segment(self):
        document, binary = fixture()
        factors = [2 / 255, 137 / 255, 159 / 255, .4]
        document['materials'][0]['pbrMetallicRoughness']['baseColorFactor'] = factors
        raw = modelimport.material_colours(encode(document, binary), 'srgb')
        factor = modeldata.load(raw).materials[0]['pbrMetallicRoughness']['baseColorFactor']
        self.assertAlmostEqual(2 / 255 / 12.92, factor[0])
        for byte, linear in zip((2, 137, 159), factor):
            encoded = linear * 12.92 if linear <= .0031308 else 1.055 * linear ** (1 / 2.4) - .055
            self.assertAlmostEqual(byte / 255, encoded)

    def test_preview_choice_is_isolated_and_add_keeps_only_the_adjusted_glb(self):
        raw = coloured_model()
        prepared = objectlibrary.prepare('flower.glb', raw)
        token = prepared['token']
        preview = objectlibrary.prepared_model(token, 'srgb')
        self.assertNotEqual(raw, preview)
        self.assertEqual(raw, objectlibrary.prepared_model(token))
        settings = {'token': token, 'filename': 'flower.glb', 'name': 'Flower'}
        corrected = objectlibrary.add({**settings, 'material_colours': 'srgb'})['model']
        original = objectlibrary.add(settings)['model']
        self.assertNotEqual(original['id'], corrected['id'])
        self.assertEqual('srgb', corrected['material_colours'])
        self.assertEqual(preview, objectlibrary.original(corrected['id']))
        self.assertEqual(raw, objectlibrary.original(original['id']))
        # (only what was imported is kept: the corrected model, not the upload it came from)
        folder = objectlibrary._folder(corrected['id'])
        self.assertNotIn('source', corrected)
        self.assertEqual(['model.glb'], sorted(p.name for p in (folder / 'original').iterdir()))
        snapshot = Path(self.temporary.name, 'retained')
        trackmodels._copy_original(folder, snapshot)
        shutil.rmtree(Path(self.temporary.name, 'cache'))
        shutil.rmtree(objectlibrary._folder(corrected['id']))
        self.assertEqual(['model.glb'], sorted(p.name for p in (snapshot / 'original').iterdir()))
        self.assertEqual(preview, (snapshot / 'original/model.glb').read_bytes())

    def test_unknown_import_choice_never_publishes_a_package(self):
        prepared = objectlibrary.prepare('flower.glb', coloured_model())
        with self.assertRaisesRegex(ValueError, 'colour'):
            objectlibrary.add({'token': prepared['token'], 'filename': 'flower.glb', 'name': 'Flower', 'material_colours': 'auto'})
        self.assertEqual(0, objectlibrary.listing()['total'])

    def test_explicit_matte_material_preserves_palette_and_default_materials(self):
        raw = coloured_model()
        self.assertEqual(raw, modelimport.material_lighting(raw, 'model'))
        changed = modelimport.material_lighting(raw, 'matte')
        original, original_binary = modeldata._chunks(raw)
        document, binary = modeldata._chunks(changed)
        self.assertEqual(bytes(original_binary), bytes(binary))
        expected = original['materials'][0]
        expected['extras'] = {'map2lap': {'lighting': 'matte'}}
        expected['pbrMetallicRoughness'].update(metallicFactor=0, roughnessFactor=1)
        self.assertEqual(original, document)
        self.assertEqual(modeldata.load(raw).images, modeldata.load(changed).images)
        prepared = objectlibrary.prepare('flower.glb', raw)
        preview = objectlibrary.prepared_model(prepared['token'], 'srgb', 'matte')
        asset = objectlibrary.add({'token': prepared['token'], 'filename': 'flower.glb', 'name': 'Flower',
                                   'material_colours': 'srgb', 'material_lighting': 'matte'})['model']
        self.assertEqual(preview, objectlibrary.original(asset['id']))
        self.assertEqual('matte', asset['material_lighting'])
        for choice in ('auto', '', None):
            with self.subTest(choice=choice), self.assertRaisesRegex(ValueError, 'material'):
                modelimport.material_lighting(raw, choice)

    def test_catalogue_replacement_hides_only_the_old_choice_and_keeps_originals_addressable(self):
        raw = coloured_model()
        prepared = objectlibrary.prepare('flower.glb', raw)
        settings = {'token': prepared['token'], 'filename': 'flower.glb', 'name': 'Flower'}
        old = objectlibrary.add(settings)['model']
        new = objectlibrary.add({**settings, 'material_colours': 'srgb'})['model']
        objectlibrary.supersede(old['id'], new['id'])
        self.assertEqual([new['id']], [m['id'] for m in objectlibrary.listing()['items']])
        self.assertEqual(raw, objectlibrary.original(old['id']))
        self.assertEqual(new['id'], objectlibrary.get(new['id'])['id'])
        with self.assertRaises(ValueError):
            objectlibrary.supersede(new['id'], old['id'])
        shutil.rmtree(objectlibrary._folder(new['id']))
        self.assertEqual([old['id']], [m['id'] for m in objectlibrary.listing()['items']])


if __name__ == '__main__':
    unittest.main()
