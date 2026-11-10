"""Model contexts reuse asset work and hold no world-space vertex arrays until requested."""
import copy
from pathlib import Path
import unittest
from unittest import mock


from test_modeldata import encode, fixture
from test_trackcopy import Base
from test_trackheights import plateau
from app import modeldata, modelmesh, objectlibrary, trackcopies, trackcopy, trackedits, trackmodels, trackview
from model_context_reference import extend as eager_extend


class ContextTest(Base):
    def setUp(self):
        super().setUp()
        self.enterContext(mock.patch.object(objectlibrary, 'ROOT', self.ac))
        document, binary = fixture()
        prepared = objectlibrary.prepare('tree.glb', encode(document, binary))
        self.asset = objectlibrary.add({'token': prepared['token'], 'filename': 'tree.glb', 'name': 'Tree'})['model']['id']
        self.snapshot, _meta = trackmodels.snapshot(self.asset)

    def instance(self, number, **changes):
        return {'id': 'instance_' + format(number, '024x'), 'asset': self.snapshot,
                'at': [number * 3.142857, .123456789, 5.987654321], 'collision': 'none', **changes}

    def write(self, models, **changes):
        now = trackedits.load(self.ac, self.name)
        return trackedits.save_telling(self.ac, self.name, {
            'base': now['base'], 'revision': now['revision'], 'id': 'stroke', 'deleted': [],
            'models': models, **changes})

    def test_second_stroke_reuses_assets_and_only_prepares_new_instances(self):
        first, second = self.instance(1), self.instance(2)
        with mock.patch.object(modelmesh, 'geometry', wraps=modelmesh.geometry) as geometry, \
                mock.patch.object(modelmesh, 'pieces', wraps=modelmesh.pieces) as pieces, \
                mock.patch.object(trackmodels, '_instance_meshes', wraps=trackmodels._instance_meshes) as instances:
            self.write([first])
            index = trackview.index(self.ac, self.name)
            initial = geometry.call_count, pieces.call_count
            self.assertEqual(1, instances.call_count)
            self.write([first, second])
            index = trackview.index(self.ac, self.name)
            for mesh in index['meshes']:
                if mesh.get('model') and mesh['model']['instance'] == second['id']:
                    trackview.mesh_bytes(self.ac, self.name, mesh['i'], index['revision'], draft=index['draft'])
            self.assertEqual(initial, (geometry.call_count, pieces.call_count))
            self.assertEqual(2, instances.call_count)
        _path, scan, _objects = trackedits.context(self.ac, self.name, index['revision'])
        self.assertTrue(all(not isinstance(m['data'], tuple) for m in scan['meshes'] if m.get('model')),
                        'Index metadata must not retain full vertex copies per instance')

    def test_editing_pose_height_delete_and_copy_template_never_materializes_model_vertices(self):
        models = [self.instance(1), self.instance(2)]
        self.write(models)
        original = trackmodels._InstanceData.__getitem__
        def no_vertices(data, index):
            if index == 0:
                raise AssertionError("Model vertex copy outside Save")
            return original(data, index)
        with mock.patch.object(trackmodels._InstanceData, '__getitem__', no_vertices):
            self.write(models, placed=[{'id': models[0]['id'] + '#0', 'x': 1, 'y': 2, 'z': 1, 'turn': 30, 'scale': 1.5}],
                       heights=[plateau(x=-20, z=-20, nx=41, nz=41, height=1500)])
            now = trackedits.load(self.ac, self.name)
            trackview.index(self.ac, self.name)
            trackedits.moved_now(self.ac, self.name, now['base'])
            trackedits.copy_template(self.ac, self.name, {'base': now['base'], 'revision': now['revision'], 'object': models[0]['id'] + '#0'})
            trackedits.preview(self.ac, self.name, now['base'], plateau(x=-20, z=-20, nx=41, nz=41, height=500))

    def test_active_assets_are_retained_even_when_a_mixture_exceeds_the_recent_asset_lru(self):
        import json
        import shutil
        folder, meta = trackmodels.resolve(self.ac, self.name, self.snapshot)
        models = []
        for number in range(17):
            record = {**meta, 'name': f'Tree {number}'}
            record.pop('id')
            asset = trackmodels._digest(record)
            target = trackmodels._folder(asset)
            shutil.copytree(folder, target)
            (target / 'asset.json').write_text(json.dumps({**record, 'id': asset}), encoding='utf8')
            models.append(self.instance(number, asset=asset))
        with mock.patch.object(modelmesh, 'geometry', wraps=modelmesh.geometry) as geometry:
            self.write(models)
            self.assertEqual(17, geometry.call_count)
            self.write(models)
            self.assertEqual(17, geometry.call_count)

    def test_one_completed_stroke_does_not_rebuild_on_index_or_mesh_requests(self):
        # This count also runs on the old eager implementation: save publishes its validated context.
        with mock.patch.object(modelmesh, 'geometry', wraps=modelmesh.geometry) as geometry:
            now = trackedits.load(self.ac, self.name)
            created = trackedits.model(self.ac, self.name, {'base': now['base'], 'revision': now['revision'],
                'instances': [{'model': self.asset, 'at': [20, 0, 5], 'turn': 10, 'scale': 1}]})
            self.assertEqual(0, geometry.call_count)
            self.write(created['models'], placed=created['placed'])
            self.assertEqual(1, geometry.call_count)
            index = trackview.index(self.ac, self.name)
            for mesh in index['meshes']:
                if mesh.get('model'):
                    trackview.mesh_bytes(self.ac, self.name, mesh['i'], index['revision'], draft=index['draft'])
            self.assertEqual(1, geometry.call_count)

    def test_incremental_sequence_matches_eager_index_buffers_and_native_save(self):
        first, second = self.instance(1, scale=1.234567), self.instance(2, collision='mesh')
        height = plateau(x=-20, z=-20, nx=41, nz=41, height=1500)
        poses = [{'id': first['id'] + '#0', 'x': 1, 'y': 2, 'z': 1, 'turn': 30, 'scale': 1.5}]
        now = trackedits.load(self.ac, self.name)
        template = trackedits.copy_template(self.ac, self.name, {'base': now['base'], 'revision': now['revision'], 'object': 'nocol_trees_0_0#0'})
        copied = trackedits.copy_template(self.ac, self.name, {'base': now['base'], 'revision': now['revision'],
            'template': template['template'], 'at': [50, 0, 5]})['copy']
        states = [([first], {}), ([first, second], {}), ([first], {}),
                  ([first], {'deleted': [{'id': 'nocol_trees_0_0#0', 'position': [0, 0, 0]}]}),
                  ([first], {'heights': [height], 'placed': poses}),
                  ([{**first, 'collision': 'mesh'}], {}),
                  ([{**first, 'collision': 'mesh'}, self.instance(3)], {'copies': [copied]})]
        for number, (models, changes) in enumerate(states):
            with self.subTest(step=number):
                self.write(copy.deepcopy(models), **changes)
                actual = trackview.index(self.ac, self.name)
                revision = actual['revision']
                path, scan, objects = trackedits.context(self.ac, self.name, revision)
                _source, base = trackview._scan_of(self.ac, self.name, revision)
                base, source_objects = trackcopies.build(path, base, trackview.list_of(path), trackedits.load(self.ac, self.name)['copies'])
                expected, listed = eager_extend(self.ac, self.name, {**base, 'model_source_path': path, 'model_source_revision': revision}, source_objects, models)
                self.assertEqual(objects, listed)
                self.assertEqual(scan['materials'], expected['materials'])
                self.assertEqual(scan['textures'], expected['textures'])
                for own, full in zip(scan['meshes'], expected['meshes'], strict=True):
                    self.assertEqual({k:v for k,v in own.items() if k != 'data'}, {k:v for k,v in full.items() if k != 'data'})
                    if own.get('model'):
                        self.assertEqual([a.tobytes() for a in own['data']], [a.tobytes() for a in full['data']])
                trackedits._context_cache.clear()
                with mock.patch.object(trackmodels, 'extend', side_effect=eager_extend):
                    expected_index = trackview.index(self.ac, self.name)
                self.assertEqual(actual, expected_index)
                trackedits._context_cache.clear()
        # Save copies clear the source draft, so restore the exact semantic state for the eager Save.
        now = trackedits.load(self.ac, self.name)
        trackcopy.save(self.ac, self.name, 'incremental', 'Incremental')
        self.write(now['models'], placed=now['placed'], heights=now['heights'], deleted=now['deleted'], copies=now['copies'])
        trackedits._context_cache.clear()
        with mock.patch.object(trackmodels, 'extend', side_effect=eager_extend):
            trackcopy.save(self.ac, self.name, 'eager', 'Eager')
        self.assertEqual(Path(self.ac, 'content/tracks/incremental/incremental.kn5').read_bytes(),
                         Path(self.ac, 'content/tracks/eager/eager.kn5').read_bytes())


if __name__ == '__main__': unittest.main()
