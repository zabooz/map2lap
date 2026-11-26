"""The shipped ACP plugin, the AC plugin registry and the offline one-lap Race gate."""
import codecs
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'src'), str(ROOT / 'tools')]
from app import settings
import make_release
import test_play_clock as play_fixture

INPUTS = ('native/acplugin/plugin.c', 'native/acplugin/green_clock.h', 'native/acplugin/route_json.h',
          'native/acplugin/rollover.h', 'tools/build_acplugin.py')
DLL = 'src/bin/map2lap.dll'
RECEIPT = 'src/bin/map2lap.json'
FOREIGN = b'\xef\xbb\xbf[Plugins]\r\n; \xfc keep map2lap.dll=0\r\nOTHER.dll = 1\n[more]\r\nvalue=keep'


class InstallTest(unittest.TestCase):
    def setUp(self):
        from app import acplugin
        self.plugin = acplugin
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.ac = Path(temp.name)
        self.folder = self.ac / 'plugins'
        self.folder.mkdir()
        self.dll = self.folder / 'map2lap.dll'
        self.ini = self.folder / 'plugins.ini'
        self.ini.write_bytes(FOREIGN.replace(b'[more]', b' Map2Lap.DLL = 0\r\nmap2lap.dll=1\n[more]'))
        self.dll.write_bytes(b'previous version')
        self.running = self.enterContext(patch.object(acplugin, 'ac_running', return_value=False))

    def test_update_deduplicates_and_preserves_foreign_bytes_even_on_remove(self):
        self.assertTrue(self.plugin.install(self.ac))
        self.assertEqual(self.dll.read_bytes(), (ROOT / DLL).read_bytes())
        raw = self.ini.read_bytes()
        self.assertEqual(raw.lower().splitlines().count(b'map2lap.dll=1'), 1)
        self.plugin.install(self.ac)
        self.assertEqual(raw, self.ini.read_bytes())
        self.plugin.remove(self.ac)
        self.assertFalse(self.dll.exists())
        self.assertEqual(self.ini.read_bytes(), FOREIGN)

    def test_already_current_install_needs_no_writable_files(self):
        self.dll.write_bytes((ROOT / DLL).read_bytes())
        self.ini.write_bytes(FOREIGN.replace(b'[more]', b'map2lap.dll=1\r\n[more]'))
        with patch.object(self.plugin, '_replace', side_effect=PermissionError('read-only')):
            self.assertTrue(self.plugin.install(self.ac))

    def test_open_ac_skips_update_and_removal(self):
        self.running.return_value = True
        raw = self.ini.read_bytes()
        for operation in (self.plugin.install, self.plugin.remove):
            self.assertFalse(operation(self.ac))
            self.assertEqual(self.dll.read_bytes(), b'previous version')
            self.assertEqual(self.ini.read_bytes(), raw)

    def test_install_missing_and_remove_in_unicode_ini(self):
        raw = codecs.BOM_UTF16_LE + '[PLUGINS]\r\nÄnderung.dll=1'.encode('utf-16le')
        self.ini.write_bytes(raw)
        self.dll.unlink()
        self.plugin.install(self.ac)
        self.assertIn('map2lap.dll=1', self.ini.read_bytes().decode('utf-16'))
        self.plugin.remove(self.ac)
        self.assertEqual(self.ini.read_bytes(), raw)


class LaunchTest(unittest.TestCase):
    def setUp(self):
        self.play = play_fixture.PlayAtAnHourTest()
        self.play.setUp()
        self.addCleanup(self.play.doCleanups)
        self.play.install_timed_route()
        self.play.install_ai()

    def test_play_installs_for_races_and_supplies_offline_flags(self):
        from app import mytracks
        for kind, mode in [('route', 'practice'), ('route', 'hotlap'), ('route', 'race'), ('circuit', 'race')]:
            mytracks.save(self.play.track, {'kind': kind})
            opts = {'laps': 1, 'ai': {'opponents': 0}} if mode == 'race' else {}
            with self.subTest(kind=kind, mode=mode), patch('app.acplugin.install', return_value=True) as install:
                self.assertEqual((200, True), self.play.started(session=mode, **opts))
                self.assertEqual(install.called, mode == 'race')
                self.assertNotIn('AB_GREEN', self.play.race.read_text())
                for section in ('REMOTE', 'REPLAY'):
                    self.assertEqual(self.play.ini().get(section, 'ACTIVE'), '0')

    def test_busy_or_failed_update_leaves_old_dll_and_race_starts(self):
        from app import mytracks
        mytracks.save(self.play.track, {'kind': 'route'})
        folder = self.play.ac / 'plugins'
        folder.mkdir()
        dll = folder / 'map2lap.dll'
        dll.write_bytes(b'old')
        ini = folder / 'plugins.ini'
        ini.write_bytes(FOREIGN)
        for guard in (patch('app.acplugin.ac_running', return_value=True),
                      patch('app.acplugin.install', side_effect=PermissionError('busy file'))):
            with guard:
                self.assertEqual((200, True), self.play.started(session='race', ai={'opponents': 1}))
                self.assertEqual(dll.read_bytes(), b'old')
                self.assertEqual(ini.read_bytes(), FOREIGN)


class ArtifactTest(unittest.TestCase):
    def test_win64_unwind_table_for_recovery_caller_check(self):
        image = (ROOT / DLL).read_bytes()
        pe, = struct.unpack_from('<I', image, 0x3c)
        exception_rva, length = struct.unpack_from('<II', image, pe + 24 + 112 + 3 * 8)
        self.assertGreater(exception_rva, 0)
        self.assertGreaterEqual(length, 12)

    def test_receipt_matches_exact_sources_builder_and_dll(self):
        receipt = json.loads((ROOT / RECEIPT).read_bytes())
        self.assertEqual(receipt, {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in (*INPUTS, DLL)})

    @unittest.skipUnless(shutil.which('clang'), 'rebuilding the shipped DLL needs LLVM')
    def test_rebuild_is_byte_identical(self):
        import build_acplugin
        with tempfile.TemporaryDirectory() as temp:
            dll = Path(temp) / 'map2lap.dll'
            build_acplugin.build(dll)
            self.assertEqual(dll.read_bytes(), (ROOT / DLL).read_bytes())

    def test_both_packagers_reject_stale_or_missing_plugin_before_packaging(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(make_release, 'HERE', temp), \
             patch.object(make_release, 'check_snow_worker'), patch.object(make_release, 'DIST', temp), \
             patch.object(make_release, 'files', side_effect=AssertionError('packaging started')), \
             patch.object(make_release, 'fetch', side_effect=AssertionError('download started')):
            for path in (*INPUTS, DLL, RECEIPT):
                dest = Path(temp) / path
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / path, dest)
            make_release.check_acplugin()
            source = Path(temp) / INPUTS[0]
            source.write_bytes(source.read_bytes() + b'\n')
            with self.assertRaisesRegex(SystemExit, 'build_acplugin'):
                make_release.check_acplugin()
            shutil.copyfile(ROOT / INPUTS[0], source)
            for build in (make_release.build_win, make_release.build_linux):
                dll = Path(temp) / DLL
                dll.write_bytes(b'old')
                with self.assertRaisesRegex(SystemExit, 'build_acplugin'):
                    build()
                dll.unlink()
                with self.assertRaisesRegex(SystemExit, 'build_acplugin'):
                    build()


@unittest.skipUnless(shutil.which('clang') and os.name == 'posix', 'POSIX host double uses clang')
class NativeHostTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        temp = tempfile.TemporaryDirectory()
        cls.addClassCleanup(temp.cleanup)
        cls.host = Path(temp.name) / 'host'
        subprocess.run(['clang', '-std=c11', '-Wall', '-Wextra', '-Werror',
                        ROOT / 'engine/tests/acplugin_host.c', '-o', cls.host], check=True)

    def test_metadata_and_session_gates(self):
        subprocess.run([self.host], check=True)

    def test_clock_only_rollback_and_shutdown_on_supported_game_image(self):
        exe = Path(settings.ac_path() or '') / 'acs.exe'
        if not exe.is_file():
            self.skipTest('no local acs.exe')
        raw = exe.read_bytes()
        if hashlib.sha256(raw).hexdigest() != '0df569c840f8303f7018f7891085e3a4c22cf93fb19327c6a0b85325cea23fd1':
            self.skipTest('requires the supported acs.exe')
        # Lay out the PE sections by RVA as in a loaded module, in a private test buffer.
        pe, = struct.unpack_from('<I', raw, 0x3c)
        sections, = struct.unpack_from('<H', raw, pe + 6)
        optional, = struct.unpack_from('<H', raw, pe + 20)
        size, headers = struct.unpack_from('<II', raw, pe + 0x50)
        image = bytearray(size)
        image[:headers] = raw[:headers]
        for i in range(sections):
            address, length, offset = struct.unpack_from('<III', raw, pe + 24 + optional + i * 40 + 12)
            image[address:address + length] = raw[offset:offset + length]
        mapped = self.host.with_name('acs.image')
        mapped.write_bytes(image)
        subprocess.run([self.host, mapped], check=True)


if __name__ == '__main__':
    unittest.main()
