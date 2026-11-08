"""User libraries stay outside both release formats and cannot be replaced by a downloaded update."""
import io
import os
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest import mock
import zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "tools"))
from app import updater
import make_release


def archive(zip_format, own_library):
    entries = {"Map2Lap/src/server.py": b"server", "Map2Lap/" + updater.PYTHON: b"python"}
    if own_library:
        entries["Map2Lap/library/materials/own/asset.json"] = b"replacement"
    output = io.BytesIO()
    if zip_format:
        with zipfile.ZipFile(output, "w") as file:
            for name, raw in entries.items():
                file.writestr(name, raw)
    else:
        with tarfile.open(fileobj=output, mode="w:gz") as file:
            for name, raw in entries.items():
                entry = tarfile.TarInfo(name)
                entry.size = len(raw)
                file.addfile(entry, io.BytesIO(raw))
    return output.getvalue()


class MaterialUpdatesTest(unittest.TestCase):
    def test_neither_system_packages_user_assets_even_if_accidentally_tracked(self):
        with tempfile.TemporaryDirectory() as temporary:
            for name in ("src/server.py", "library/materials/own/asset.json"):
                path = Path(temporary, name)
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("own", encoding="utf-8")
            result = mock.Mock(stdout=b"src/server.py\0library/materials/own/asset.json\0")
            with mock.patch.object(make_release, "HERE", temporary), mock.patch.object(make_release.subprocess, "run", return_value=result):
                for system in ("win", "linux"):
                    self.assertEqual(["src/server.py"], make_release.files(system))

    def test_update_archives_with_a_library_are_refused_before_the_install_is_marked_ready(self):
        for zip_format in (True, False):
            with self.subTest(zip=zip_format), tempfile.TemporaryDirectory() as temporary:
                path = Path(temporary, "library/materials/own/asset.json")
                path.parent.mkdir(parents=True)
                path.write_bytes(b"my material")
                raw = archive(zip_format, True)
                work = os.path.join(temporary, "update")
                with mock.patch.multiple(updater, DIR=work, NEW=os.path.join(work, "Map2Lap"), READY=os.path.join(work, "ready")), \
                     mock.patch.object(updater.urllib.request, "urlopen", return_value=io.BytesIO(raw)):
                    with self.assertRaisesRegex(ValueError, "library"):
                        updater.download({"archive": {"name": "release.zip" if zip_format else "release.tar.gz", "url": "https://example.invalid/release", "size": len(raw)}})
                    self.assertFalse(os.path.exists(updater.READY))
                self.assertEqual(b"my material", path.read_bytes())


if __name__ == "__main__":
    unittest.main()
