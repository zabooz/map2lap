"""Release downloads are checked completely before installation; failed staging leaves no ready update."""
import hashlib
import io
import os
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest import mock
import urllib.error
import zipfile

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src"))
from app import updater  # noqa: E402


def folder(root, *names):
    for n in names:
        os.makedirs(os.path.dirname(os.path.join(root, n)), exist_ok=True)
        open(os.path.join(root, n), "w").close()


class DownloadTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        for key, value in {"DIR": str(self.root / "update"), "NEW": str(self.root / "update/Map2Lap"),
                           "READY": str(self.root / "update/ready"), "state": dict(updater.state)}.items():
            patch = mock.patch.object(updater, key, value)
            patch.start()
            self.addCleanup(patch.stop)

    def package(self, kind, extra=(), missing=False):
        """A small release archive for kind (ZIP or TAR.GZ), with optional extra/missing files. Pure."""
        stream = io.BytesIO()
        files = [("Map2Lap/src/server.py", b"new server"), *extra]
        if not missing:
            files.append(("Map2Lap/" + updater.PYTHON, b"python"))
        if kind == "zip":
            with zipfile.ZipFile(stream, "w") as archive:
                for name, data in files:
                    archive.writestr(name, data)
        else:
            with tarfile.open(fileobj=stream, mode="w:gz") as archive:
                for name, data in files:
                    item = tarfile.TarInfo(name)
                    item.size, item.mode = len(data), 0o755
                    archive.addfile(item, io.BytesIO(data))
        return stream.getvalue()

    def fetch(self, raw, kind, **overrides):
        """Download raw as a release response with optionally incorrect metadata."""
        archive = dict(name="release." + kind, url="https://example.invalid/release", size=len(raw),
                       digest="sha256:" + hashlib.sha256(raw).hexdigest())
        archive.update(overrides)
        with mock.patch.object(updater.urllib.request, "urlopen", return_value=io.BytesIO(raw)):
            updater.download({"archive": archive})

    def test_both_formats_become_ready_only_after_complete_extraction(self):
        for kind in ("zip", "tar.gz"):
            with self.subTest(kind=kind):
                raw = self.package(kind)
                self.fetch(raw, kind)
                self.assertEqual(b"new server", Path(updater.NEW, "src/server.py").read_bytes())
                self.assertTrue(Path(updater.READY).is_file())
                self.assertFalse(Path(updater.DIR, "release." + kind).exists())
                self.assertEqual(len(raw), updater.state["done"])

    def test_bad_hash_or_size_removes_staging(self):
        for kind in ("zip", "tar.gz"):
            for metadata in ({"digest": "sha256:wrong"}, {"size": 1}):
                with self.subTest(kind=kind, metadata=metadata):
                    with self.assertRaisesRegex(ValueError, "damaged"):
                        self.fetch(self.package(kind), kind, **metadata)
                    self.assertFalse(Path(updater.DIR).exists())

    def test_missing_runtime_and_broken_archives_are_not_installable(self):
        for kind in ("zip", "tar.gz"):
            for raw in (self.package(kind, missing=True), b"broken archive"):
                with self.subTest(kind=kind, broken=raw == b"broken archive"):
                    with self.assertRaises((ValueError, zipfile.BadZipFile, tarfile.ReadError)):
                        self.fetch(raw, kind)
                    self.assertFalse(Path(updater.DIR).exists())

    def test_user_library_is_refused_in_both_formats(self):
        for kind in ("zip", "tar.gz"):
            for name in ("Map2Lap/library/own.png", "Map2Lap/Library/own.png", "Map2Lap/./library/own.png"):
                with self.subTest(kind=kind, name=name):
                    with self.assertRaisesRegex(ValueError, "library"):
                        self.fetch(self.package(kind, [(name, b"must not overwrite")]), kind)
                    self.assertFalse(Path(updater.DIR).exists())

    def test_download_interruption_removes_partial_files_and_old_ready_marker(self):
        Path(updater.NEW).mkdir(parents=True)
        Path(updater.READY).touch()
        response = mock.MagicMock()
        response.__enter__.return_value.read.side_effect = [b"partial", urllib.error.URLError("offline")]
        with mock.patch.object(updater.urllib.request, "urlopen", return_value=response):
            with self.assertRaises(urllib.error.URLError):
                updater.download({"archive": {"name": "release.zip", "url": "https://example.invalid/", "size": 100}})
        self.assertFalse(Path(updater.DIR).exists())


class DropOldTest(unittest.TestCase):
    def test_a_release_drops_vendor_once_engine_is_there(self):
        with tempfile.TemporaryDirectory() as d:
            folder(d, updater.PYTHON, "engine/generator.py", "vendor/beamng_earth/server/generator.py")
            self.assertEqual(updater.drop_old(d), ["vendor"])
            self.assertFalse(os.path.exists(os.path.join(d, "vendor")))
            self.assertTrue(os.path.isfile(os.path.join(d, "engine", "generator.py")))

    def test_vendor_stays_without_engine(self):
        with tempfile.TemporaryDirectory() as d:
            folder(d, updater.PYTHON, "vendor/beamng_earth/server/generator.py")
            self.assertEqual(updater.drop_old(d), [])
            self.assertTrue(os.path.isdir(os.path.join(d, "vendor")))

    def test_a_developer_folder_keeps_everything(self):
        with tempfile.TemporaryDirectory() as d:
            folder(d, updater.PYTHON, ".git/HEAD", "engine/generator.py", "vendor/x.py")
            self.assertEqual(updater.drop_old(d), [])
            self.assertTrue(os.path.isdir(os.path.join(d, "vendor")))


if __name__ == "__main__":
    unittest.main()
