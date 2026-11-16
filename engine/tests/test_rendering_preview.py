"""Rendering sessions restore owned files while retaining independent edits."""
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools'))
import rendering_preview as preview


class RenderingPreviewTest(unittest.TestCase):
    def test_restore_retains_independent_edits_and_restores_other_files(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            race, app, created = (root / name for name in ('race.ini', 'app.lua', 'filter.ini'))
            race.write_bytes(b'original race'); app.write_bytes(b'original app')
            writes = {race: b'probe race', app: b'probe app', created: b'probe filter'}
            manifest = preview.prepare(root / 'backup', writes)
            for path, raw in writes.items():
                path.write_bytes(raw)
            race.write_bytes(b'user edit')
            self.assertEqual(preview.restore_files(manifest), [str(race)])
            self.assertEqual(race.read_bytes(), b'user edit')
            self.assertEqual(app.read_bytes(), b'original app')
            self.assertFalse(created.exists())
            race.write_bytes(b'probe race')
            self.assertEqual(preview.restore_files(manifest), [])
            self.assertEqual(race.read_bytes(), b'original race')

    def test_restore_handles_partial_start_and_ac_saving_test_exposure(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            exposure, untouched, missing = (root / n for n in ('exposure.ini', 'video.ini', 'probe.ini'))
            exposure.write_bytes(b'[EXPOSURE]\r\nVALUE=0.99\r\n'); untouched.write_bytes(b'original')
            writes = {exposure: exposure.read_bytes(), untouched: b'probe', missing: b'created'}
            manifest = preview.prepare(root / 'backup', writes)
            exposure.write_bytes(b'[EXPOSURE]\r\nVALUE=1\r\n')
            self.assertEqual(preview.restore_files(manifest, exposure=exposure), [])
            self.assertIn(b'0.99', exposure.read_bytes())
            self.assertEqual(untouched.read_bytes(), b'original')
            self.assertFalse(missing.exists())

    def test_camera_commands_reject_path_traversal_and_invalid_vectors(self):
        for name in ('../shot', 'a/b', 'a\\b', 'shot.png'):
            with self.assertRaises(ValueError):
                preview.camera_command(name, (0, 7.5, 10), (0, 0, -1), 40)
        for direction in ((0, 0, 0), (0, float('nan'), -1)):
            with self.assertRaises(ValueError):
                preview.camera_command('shot', (0, 7.5, 10), direction, 40)
        command = preview.camera_command('spruce_after', (0, 7.5, 10), (0, 0, -1), 40)
        self.assertEqual([float(x) for x in command.split()[:8]], [0, 7.5, 10, 0, 0, -1, 40, 1])


if __name__ == '__main__':
    unittest.main()
