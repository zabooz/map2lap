"""FBX/OBJ uploads reach the existing static model pipeline with retained sources and textures."""
import io
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest import mock
import zipfile

from PIL import Image
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import modeldata, objectlibrary, trackmodels, mytracks

OBJ = b'v 0 0 0\nv 2 0 0\nv 2 3 0\nv 0 3 0\nvt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\nf 1/1 2/2 3/3 4/4\n'


def package(files):
    """A small in-memory uploaded archive. Pure."""
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as archive:
        for name, data in files.items():
            archive.writestr(name, data)
    return stream.getvalue()


class ImportTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        patch = mock.patch.object(objectlibrary, 'ROOT', self.temporary.name)
        patch.start()
        self.addCleanup(patch.stop)
        patch = mock.patch.object(mytracks, 'ROOT', self.temporary.name)
        patch.start()
        self.addCleanup(patch.stop)

    def publish(self, filename, raw):
        prepared = objectlibrary.prepare(filename, raw)
        return objectlibrary.add({'token': prepared['token'], 'filename': filename, 'name': 'Imported', 'category': 'other'})['model']

    def test_obj_quad_becomes_triangles_and_only_the_converted_model_is_kept(self):
        asset = self.publish('panel.obj', OBJ)
        shutil.rmtree(Path(self.temporary.name, 'cache'))
        model = modeldata.load(objectlibrary.original(asset['id']))
        self.assertEqual(2, sum(len(p.indices) for p in model.primitives))
        self.assertEqual([[0, 0, 0], [2, 3, 0]], model.bounds)
        self.assertNotIn('source', asset)
        self.assertEqual(['model.glb'], sorted(p.name for p in (Path(self.temporary.name, 'library/objects', asset['id'], 'original')).iterdir()))
        snapshot, _description = trackmodels.snapshot(asset['id'])
        self.assertTrue(snapshot)

    def test_obj_zip_keeps_colour_alpha_normal_and_uv_orientation(self):
        stream = io.BytesIO()
        Image.new('RGBA', (4, 4), (30, 180, 40, 0)).save(stream, 'PNG')
        normal = io.BytesIO()
        Image.new('RGB', (4, 4), (128, 128, 255)).save(normal, 'PNG')
        raw = package({'plant/panel.obj': b'mtllib panel.mtl\nusemtl leaf\n' + OBJ,
                       'plant/panel.mtl': b'newmtl leaf\nKd 1 1 1\nmap_Kd -clamp on textures/leaf.png\nnorm textures/normal.png\n',
                       'plant/textures/leaf.png': stream.getvalue(), 'plant/textures/normal.png': normal.getvalue()})
        asset = self.publish('plant.zip', raw)
        model = modeldata.load(objectlibrary.original(asset['id']))
        material = next(m for m in model.materials if m.get('name') == 'leaf')
        self.assertIn(material['alphaMode'], ('MASK', 'BLEND'))
        self.assertIn('baseColorTexture', material['pbrMetallicRoughness'])
        self.assertIn('normalTexture', material)
        texture = model.document['textures'][material['pbrMetallicRoughness']['baseColorTexture']['index']]
        sampler = model.document.get('samplers', [])[texture.get('sampler', -1)]
        self.assertEqual(33071, sampler['wrapS'])
        self.assertEqual(2, len(model.images))
        primitive = model.primitives[0]
        self.assertEqual(1., float(primitive.uvs[0, 1]))

    def test_missing_material_and_texture_files_are_explicit_errors(self):
        for raw in (b'mtllib missing.mtl\n' + OBJ,
                    package({'a.obj': b'mtllib a.mtl\nusemtl leaf\n' + OBJ,
                             'a.mtl': b'newmtl leaf\nmap_Kd missing.png\n'})):
            with self.subTest(raw=raw[:16]), self.assertRaisesRegex(ValueError, 'missing|Missing'):
                objectlibrary.prepare('a.zip' if raw.startswith(b'PK') else 'a.obj', raw)
        self.assertEqual(0, objectlibrary.listing()['total'])

    def test_archive_paths_duplicates_and_multiple_models_are_rejected(self):
        for files in ({'../outside.obj': OBJ}, {'a.obj': OBJ, 'b.obj': OBJ},
                      {'a.obj': OBJ, 'A.OBJ': OBJ}, {'C:/outside.obj': OBJ},
                      {'a.obj': OBJ, 'a.mtl': b'newmtl a\n', 'textures/../../escape.png': b'x'}):
            with self.subTest(files=list(files)), self.assertRaises(ValueError):
                objectlibrary.prepare('assets.zip', package(files))

    def test_coloured_vertices_are_not_silently_replaced_with_white(self):
        raw = b'v 0 0 0 1 0 0\nv 1 0 0 0 1 0\nv 0 1 0 0 0 1\nf 1 2 3\n'
        with self.assertRaisesRegex(ValueError, 'vertex colours'):
            objectlibrary.prepare('coloured.obj', raw)

    def test_ascii_and_binary_fbx_honour_axes_file_units_and_default_pose(self):
        root = Path(__file__).parent / 'fixtures/model-import'
        for filename in ('blender_279_default_6100_ascii.fbx', 'blender_279_default_7400_binary.fbx'):
            with self.subTest(filename=filename):
                asset = self.publish(filename, (root / filename).read_bytes())
                model = modeldata.load(objectlibrary.original(asset['id']))
                # The old 6.1 exporter omits units (FBX defaults to centimetres); 7.4 exports metre-sized geometry.
                unit = .01 if '6100' in filename else 1.
                np.testing.assert_allclose(model.bounds, np.array([[-1, -1, -1], [1, 1, 1]]) * unit, atol=1e-5)
                self.assertEqual(12, sum(len(p.indices) for p in model.primitives))

    def test_binary_fbx_retains_embedded_material_images(self):
        path = Path(__file__).parent / 'fixtures/model-import/blender_293_embedded_textures_7400_binary.fbx'
        asset = self.publish(path.name, path.read_bytes())
        model = modeldata.load(objectlibrary.original(asset['id']))
        self.assertEqual(3, len(model.images))
        self.assertTrue(any('baseColorTexture' in m['pbrMetallicRoughness'] for m in model.materials))
        self.assertTrue(any('metallicRoughnessTexture' in m['pbrMetallicRoughness'] for m in model.materials))
        self.assertTrue(any('emissiveTexture' in m for m in model.materials))

    def test_prepared_preview_is_the_same_canonical_model_that_is_saved(self):
        prepared = objectlibrary.prepare('panel.obj', OBJ)
        preview = objectlibrary.prepared_model(prepared['token'])
        asset = objectlibrary.add({'token': prepared['token'], 'filename': 'panel.obj', 'name': 'Panel'})['model']
        self.assertEqual(preview, objectlibrary.original(asset['id']))
        path = objectlibrary._cache(prepared['token']) / 'model.glb'
        path.write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError, 'changed'):
            objectlibrary.prepared_model(prepared['token'])


if __name__ == '__main__':
    unittest.main()
