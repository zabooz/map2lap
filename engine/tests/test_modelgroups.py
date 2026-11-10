"""A browser-generated mixture enters one draft change and survives portable native Save."""
from pathlib import Path
import shutil
from unittest import mock
import test_trackmodels
from test_trackcopy import Base
from test_modeldata import encode, fixture
from app import objectlibrary, trackedits, trackmodels, trackcopy, trackview


class ModelGroupsTest(Base):
    keep = test_trackmodels.ModelWorkflowTest.keep

    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, 'ROOT', self.ac); patch.start(); self.addCleanup(patch.stop)
        prepared = objectlibrary.prepare('group.glb', encode(*fixture()))
        self.asset = objectlibrary.add({'token': prepared['token'], 'filename': 'group.glb', 'name': 'Oak'})['model']

    def body(self, items=None):
        now = trackedits.load(self.ac, self.name)
        return {'base': now['base'], 'revision': now['revision'], 'instances': items or [
            {'model': self.asset['id'], 'at': [20, 0, 5], 'turn': 35, 'scale': .8},
            {'model': self.asset['id'], 'at': [25, 1, 10], 'turn': -80, 'scale': 1.2}]}

    def test_batch_prepares_once_per_asset_and_does_not_commit_half_a_stroke(self):
        before = trackedits.load(self.ac, self.name)
        with mock.patch.object(trackmodels, 'snapshot', wraps=trackmodels.snapshot) as snap:
            answer = trackedits.model(self.ac, self.name, self.body())
        self.assertEqual(1, snap.call_count); self.assertEqual(2, len(answer['models']))
        self.assertEqual(2, len({m['id'] for m in answer['models']}))
        self.assertEqual([35, -80], [p['turn'] for p in answer['placed']])
        self.assertEqual([.8, 1.2], [p['scale'] for p in answer['placed']])
        self.assertEqual(before, trackedits.load(self.ac, self.name))
        self.keep(answer['models'], answer['placed'])
        self.assertEqual(2, len(trackedits.load(self.ac, self.name)['models']))

    def test_invalid_final_entry_and_oversize_batch_fail_before_asset_preparation(self):
        body = self.body(); bad = {**body['instances'][-1], 'scale': float('nan')}
        with mock.patch.object(trackmodels, 'snapshot') as snap:
            for items in ([], [body['instances'][0], bad], [body['instances'][0]] * 2001):
                with self.assertRaises(trackedits.Invalid): trackedits.model(self.ac, self.name, {**body, 'instances': items})
            snap.assert_not_called()

    def test_stale_batch_is_rejected_without_snapshotting(self):
        with mock.patch.object(trackmodels, 'snapshot') as snap:
            with self.assertRaises(trackedits.Conflict): trackedits.model(self.ac, self.name, {**self.body(), 'revision': -1})
            snap.assert_not_called()

    def test_group_sizes_use_the_same_limits_as_individual_transform(self):
        body = self.body()
        with mock.patch.object(trackmodels, 'snapshot') as snap:
            for scale in (.05, 20):
                items = [{**body['instances'][0], 'scale': scale}]
                with self.assertRaises(trackedits.Invalid): trackedits.model(self.ac, self.name, {**body, 'instances': items})
            snap.assert_not_called()

    def test_saved_mix_retains_exact_poses_without_library_or_caches(self):
        answer = trackedits.model(self.ac, self.name, self.body()); self.keep(answer['models'], answer['placed'])
        trackcopy.save(self.ac, self.name, 'mixed', 'Mixed')
        expected = trackview.index(self.ac, 'mixed')['model_matrices']
        for relative in ('library', 'cache', 'out/sources', 'out/edits', 'out/model-assets'):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        index = trackview.index(self.ac, 'mixed')
        self.assertEqual(expected, index['model_matrices']); self.assertEqual(2, len(index['models']))
        trackcopy.save(self.ac, 'mixed', 'mixed_again', 'Mixed again')
        self.assertEqual(expected, trackview.index(self.ac, 'mixed_again')['model_matrices'])
