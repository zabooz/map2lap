"""Reusable object mixtures are validated and persisted independently of placed model snapshots."""
import tempfile
import sys
import unittest
from pathlib import Path
from unittest import mock
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import grouplibrary, objectlibrary


class GroupsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        patch = mock.patch.object(objectlibrary, 'ROOT', self.temp.name); patch.start(); self.addCleanup(patch.stop)
        patch = mock.patch.object(objectlibrary, 'get', side_effect=lambda id: {'id': id, 'name': 'Oak'}); patch.start(); self.addCleanup(patch.stop)
        self.body = {'name': 'Waldrand', 'entries': [{'model': 'a' * 64, 'weight': 3, 'minScale': .8, 'maxScale': 1.2}]}

    def test_create_update_reload_and_delete(self):
        saved = grouplibrary.save(self.body)
        self.assertEqual([saved], grouplibrary.listing()['items'])
        changed = grouplibrary.save({**saved, 'name': 'Mixed forest'})
        self.assertEqual(saved['id'], changed['id']); self.assertEqual('Mixed forest', grouplibrary.get(saved['id'])['name'])
        self.assertTrue(grouplibrary.remove(saved['id'])); self.assertEqual([], grouplibrary.listing()['items'])

    def test_bad_weights_ranges_paths_and_duplicates_do_not_publish(self):
        entry = self.body['entries'][0]
        for change in ({'weight': -1}, {'weight': float('nan')}, {'minScale': 2, 'maxScale': 1}, {'model': '../bad'}):
            with self.assertRaises(ValueError): grouplibrary.save({**self.body, 'entries': [{**entry, **change}]})
        for change in ({'entries': []}, {'entries': [entry, entry]}, {'name': ' '}, {'id': '../outside'}):
            with self.assertRaises(ValueError): grouplibrary.save({**self.body, **change})
        self.assertEqual([], grouplibrary.listing()['items'])

    def test_deleted_assets_leave_a_visible_repairable_group(self):
        saved = grouplibrary.save(self.body)
        with mock.patch.object(objectlibrary, 'get', side_effect=ValueError('missing model')):
            self.assertEqual(saved, grouplibrary.get(saved['id']))
            with self.assertRaises(ValueError): grouplibrary.save(saved)

    def test_unknown_update_does_not_create_and_failed_write_keeps_old_definition(self):
        with self.assertRaises(ValueError): grouplibrary.save({**self.body, 'id': 'b' * 32})
        saved = grouplibrary.save(self.body)
        with mock.patch.object(grouplibrary.os, 'replace', side_effect=OSError('disk full')):
            with self.assertRaises(OSError): grouplibrary.save({**saved, 'name': 'Changed'})
        self.assertEqual(saved, grouplibrary.get(saved['id']))
        self.assertEqual([], list(Path(self.temp.name).rglob('*.tmp')))


if __name__ == '__main__': unittest.main()
