"""Layercake readers publish complete version pins without sharing temporary files."""
from concurrent.futures import ThreadPoolExecutor
import os
from pathlib import Path
import sys
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import osmtags  # noqa: E402


class VersionTest(unittest.TestCase):
    def test_independent_readers_can_publish_the_same_version_together(self):
        for sub in ('pois', 'osmtags', 'settlements'):
            with self.subTest(layer=sub), tempfile.TemporaryDirectory() as folder:
                fetched, written = threading.Barrier(2), threading.Barrier(2)
                replace = os.replace

                def get(*args, **kwargs):
                    # Both readers missed the pin before either download finishes.
                    fetched.wait(timeout=5)
                    return SimpleNamespace(headers={'etag': '"v1"', 'content-range': 'bytes 0-15/1234'})

                def publish(source, target):
                    # Reproduce the logged race: both files closed, neither renamed yet.
                    written.wait(timeout=5)
                    replace(source, target)

                readers = [osmtags.OsmTags(folder, SimpleNamespace(get=get), sub=sub) for _ in range(2)]
                with patch.object(osmtags.os, 'replace', side_effect=publish), ThreadPoolExecutor(2) as pool:
                    futures = [pool.submit(reader.version) for reader in readers]
                    versions = [future.result(timeout=10)[0] for future in futures]
                self.assertEqual(versions, ['"v1"', '"v1"'])
                pin = Path(folder, sub, 'pinned')
                self.assertEqual(pin.read_text().splitlines()[:2], ['"v1"', '1234'])
                fetcher = Mock()
                self.assertEqual(osmtags.OsmTags(folder, fetcher, sub=sub).version()[0], '"v1"')
                fetcher.get.assert_not_called()
                self.assertEqual(list(pin.parent.glob('*.tmp')), [])

    def test_failed_publication_keeps_the_old_pin_and_removes_its_temporary_file(self):
        with tempfile.TemporaryDirectory() as folder:
            pin = Path(folder, 'pois', 'pinned')
            pin.parent.mkdir()
            old = '"old"\n100\n0\n'
            pin.write_text(old)
            fetcher = Mock()
            fetcher.get.return_value = SimpleNamespace(headers={'etag': '"new"', 'content-range': 'bytes 0-15/1234'})
            reader = osmtags.OsmTags(folder, fetcher, sub='pois')
            with patch.object(osmtags.os, 'replace', side_effect=OSError('cannot publish')):
                with self.assertRaisesRegex(OSError, 'cannot publish'):
                    reader.version()
            self.assertEqual(pin.read_text(), old)
            self.assertEqual(list(pin.parent.glob('*.tmp')), [])


if __name__ == '__main__':
    unittest.main()
