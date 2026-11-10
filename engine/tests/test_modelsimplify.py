"""Conservative import levels retain material seams and physical placement while measuring Save's geometry."""
import tempfile
import shutil
import unittest
from unittest import mock
from pathlib import Path

import numpy as np
from test_modeldata import encode, fixture
from app import modeldata, modelmesh, modelsimplify, objectlibrary
from test_trackcopy import Base
from app import trackedits, trackcopy, trackview
from track import kn5


def panel():
    """An indexed plane with normal/UV attributes and two separate materials. Pure."""
    document, _ = fixture()
    document.pop('images'); document.pop('textures')
    document['materials'] = [{'name': 'wall'}, {'name': 'roof', 'doubleSided': True}]
    points = np.array([[x / 10, y / 10, 0] for y in range(16) for x in range(16)], '<f4')
    indices = np.array([[a, a + 1, a + 16, a + 1, a + 17, a + 16]
                        for y in range(15) for x in range(15) for a in [y * 16 + x]], '<u4').ravel()
    arrays = [points, np.tile([0, 0, 1], (256, 1)).astype('<f4'), points[:, :2].copy(), indices]
    binary = b''; document['bufferViews'] = []; document['accessors'] = []
    for data, width in zip(arrays, [3, 3, 2, 1]):
        document['bufferViews'].append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': data.nbytes})
        document['accessors'].append({'bufferView': len(document['bufferViews']) - 1, 'componentType': 5125 if width == 1 else 5126,
                                      'count': len(data), 'type': 'SCALAR' if width == 1 else f'VEC{width}'})
        binary += data.tobytes()
    document['buffers'] = [{'byteLength': len(binary)}]
    document['meshes'] = [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2}, 'indices': 3, 'material': k} for k in range(2)]}]
    return encode(document, binary)


class SimplificationTest(unittest.TestCase):
    def test_uv_and_hard_normal_seam_vertices_are_locked(self):
        from dataclasses import replace
        model = modeldata.load(panel())
        part = model.primitives[0]
        # Two coincident interior vertices, differing once in UV and once in hard normal.
        for kind in ('uv', 'normal'):
            positions = np.concatenate([part.positions, part.positions[[100]]])
            normals = np.concatenate([part.normals, part.normals[[100]]])
            uv = np.concatenate([part.uvs, part.uvs[[100]]])
            if kind == 'uv':
                uv[-1] += [1, 0]
            else:
                normals[-1] = [1, 0, 0]
            changed = replace(part, positions=positions, normals=normals, uvs=uv)
            altered = replace(model, primitives=(changed, model.primitives[1]))
            locks = modelsimplify._locks(altered, 0)
            self.assertTrue(locks[100]); self.assertTrue(locks[-1])
            # Force both seam copies into rendered triangles, then verify they survive the actual simplifier.
            faces = changed.indices.copy(); faces[faces == 101] = 256
            changed = replace(changed, indices=faces)
            altered = replace(altered, primitives=(changed, model.primitives[1]))
            raw = modelsimplify._encode(altered, [p.indices.ravel() for p in altered.primitives])
            result = modeldata.load(modelsimplify.simplify(raw, 25)).primitives[0]
            same = np.all(result.positions == part.positions[100], axis=1)
            self.assertGreaterEqual(int(same.sum()), 2)

    def test_variant_cache_reuses_geometry_and_separates_levels_and_textures(self):
        with tempfile.TemporaryDirectory() as folder, mock.patch.object(objectlibrary, 'ROOT', folder):
            prepared = objectlibrary.prepare('house.glb', panel())
            with mock.patch.object(modelsimplify, 'simplify', wraps=modelsimplify.simplify) as simplify:
                first = objectlibrary.prepared_model(prepared['token'], simplify_level=25)
                self.assertEqual(first, objectlibrary.prepared_model(prepared['token'], simplify_level=25))
                objectlibrary.prepared_info(prepared['token'], simplify_level=25)
                self.assertEqual(1, simplify.call_count)
                objectlibrary.prepared_model(prepared['token'], simplify_level=50)
                objectlibrary.prepared_model(prepared['token'], texture_side=2048, simplify_level=25)
                self.assertEqual(3, simplify.call_count)

    def test_scan_rounding_splits_use_existing_native_weld_before_simplifying(self):
        source = modeldata.load(panel())
        parts = []
        from dataclasses import replace
        for p in source.primitives:
            corners = p.indices.ravel()
            normals = p.normals[corners].copy()
            normals[:, 0] = np.arange(len(corners)) % 3 * .001
            parts.append(replace(p, positions=p.positions[corners], normals=normals, uvs=p.uvs[corners],
                                 indices=np.arange(len(corners), dtype=np.uint32).reshape(-1, 3)))
        raw = modelsimplify._encode(replace(source, primitives=tuple(parts)), [p.indices.ravel() for p in parts])
        # No original tangents: these are generated only after native welding, as for scanned imports.
        doc, binary = modeldata._chunks(raw)
        for mesh in doc['meshes']:
            for entry in mesh['primitives']:
                entry['attributes'].pop('TANGENT', None)
        raw = encode(doc, bytes(binary))
        result = modelsimplify.simplify(raw, 25)
        self.assertLessEqual(modelmesh.track_cost(modeldata.load(result))['triangles'], 225)
        self.assertLess(modelmesh.track_cost(modeldata.load(result))['bytes']['none'], modelmesh.track_cost(modeldata.load(raw))['bytes']['none'])

    def test_original_is_byte_identical_and_leaf_cards_report_no_gain(self):
        raw = encode(*fixture())
        self.assertEqual(raw, modelsimplify.simplify(raw, 100))
        self.assertEqual(raw, modelsimplify.simplify(raw, 25))

    def test_levels_reach_target_and_preserve_materials_bounds_anchor_and_attributes(self):
        raw = panel(); source = modeldata.load(raw)
        for level in (75, 50, 25):
            model = modeldata.load(modelsimplify.simplify(raw, level))
            self.assertLessEqual(sum(len(p.indices) for p in model.primitives), 900 * level / 100)
            self.assertEqual(source.bounds, model.bounds)
            self.assertEqual(source.anchor, model.anchor)
            self.assertEqual(source.materials, model.materials)
            for old, new in zip(source.primitives, model.primitives):
                self.assertEqual(old.material, new.material)
                original = {tuple(p): (n, uv) for p, n, uv in zip(old.positions, old.normals, old.uvs)}
                for p, n, uv in zip(new.positions, new.normals, new.uvs):
                    np.testing.assert_array_equal(n, original[tuple(p)][0])
                    np.testing.assert_array_equal(uv, original[tuple(p)][1])
                self.assertTrue(np.isfinite(new.tangents).all())
                np.testing.assert_allclose(np.sum(new.tangents[:, :3] * new.normals, axis=1), 0, atol=1e-6)

    def test_prepared_preview_published_cost_and_save_geometry_agree_after_cache_removal(self):
        raw = panel()
        with tempfile.TemporaryDirectory() as folder, mock.patch.object(objectlibrary, 'ROOT', folder):
            prepared = objectlibrary.prepare('house.glb', raw)
            preview = objectlibrary.prepared_model(prepared['token'], simplify_level=25)
            summary = objectlibrary.prepared_info(prepared['token'], simplify_level=25)
            asset = objectlibrary.add({'token': prepared['token'], 'filename': 'house.glb', 'name': 'House',
                                       'simplify_level': 25, 'metres_per_unit': 2})['model']
            self.assertEqual(preview, objectlibrary.original(asset['id']))
            self.assertEqual(prepared['geometry']['anchor'], asset['anchor'])
            self.assertEqual(summary['geometry']['track_cost'], asset['geometry']['track_cost'])
            model = modeldata.load(preview)
            self.assertEqual(modelmesh.track_cost(model), objectlibrary.cost(asset['id']))
            self.assertEqual(25, asset['simplify_level'])
            self.assertEqual(raw, (Path(folder) / 'library/objects' / asset['id'] / 'original/upload.glb').read_bytes())

    def test_invalid_levels_are_rejected(self):
        for value in (0, 24, True, '25', None):
            with self.assertRaises(ValueError):
                modelsimplify.simplify(panel(), value)


class SimplifiedSaveTest(Base):
    def test_actual_kn5_payload_and_cold_resave_match_selected_import_cost(self):
        with mock.patch.object(objectlibrary, 'ROOT', self.ac):
            raw = panel()
            prepared = objectlibrary.prepare('house.glb', raw)
            canonical = objectlibrary.prepared_model(prepared['token'], simplify_level=25)
            cost = objectlibrary.prepared_info(prepared['token'], simplify_level=25)['geometry']['track_cost']
            for collision in ('none', 'mesh'):
                asset = objectlibrary.add({'token': prepared['token'], 'filename': 'house.glb', 'name': 'House',
                                           'simplify_level': 25, 'collision': collision, 'metres_per_unit': 2})['model']
                now = trackedits.load(self.ac, self.name)
                instance = trackedits.model(self.ac, self.name, {'base': now['base'], 'revision': now['revision'],
                    'model': asset['id'], 'at': [20, 0, 5], 'collision': collision})['model']
                trackedits.save_telling(self.ac, self.name, {'base': now['base'], 'revision': now['revision'],
                    'id': 'simplified', 'deleted': [], 'models': [instance]})
                name = 'simplified_' + collision
                trackcopy.save(self.ac, self.name, name, name)
                scan = kn5.scan(Path(self.ac, 'content/tracks', name, name + '.kn5'))
                meshes = [m for m in scan['meshes'] if 'm2l_model_' in m['name']]
                self.assertEqual(cost['bytes'][collision], sum(m['vertices'] * 44 + m['indices'] * 2 for m in meshes))
            for relative in ('library', 'cache', 'out/sources', 'out/edits', 'out/model-assets'):
                shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
            self.assertEqual(1, len(trackview.index(self.ac, 'simplified_mesh')['models']))
            trackcopy.save(self.ac, 'simplified_mesh', 'simplified_cold', 'Cold')
            retained = Path(self.ac, 'content/tracks/simplified_cold/data/map2lap_models/assets', instance['asset'])
            self.assertEqual(canonical, (retained / 'original/model.glb').read_bytes())
            self.assertEqual(raw, (retained / 'original/upload.glb').read_bytes())
