"""Product Play ships and starts snow acceleration without requiring a compiler or touching another session."""
from pathlib import Path
import os
import json
import mmap
import math
import struct
import subprocess
import sys
import tempfile
import time
import unittest
import uuid
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import csp, system

ROOT = Path(__file__).resolve().parents[2]


class SnowLaunchTest(unittest.TestCase):
    def launch(self, *, windows=True, present=True, enabled=True, fail=False):
        with mock.patch.object(system, 'WIN', windows), \
             mock.patch.object(system, 'proton', return_value='/proton/proton'), \
             mock.patch.object(system, 'runtime', return_value='/runtime'), \
             mock.patch.object(system, 'compatdata', return_value='/steam/compatdata/244210'), \
             mock.patch.object(system, 'steam_roots', return_value=['/steam']), \
             mock.patch.object(system, 'steam_libraries', return_value=['/steam']), \
             mock.patch.object(csp, 'inspect', return_value={'status': 'installed', 'enabled': enabled}), \
             mock.patch.object(Path, 'is_file', return_value=present), \
             mock.patch.object(system, '_detached', side_effect=[OSError('blocked helper'), mock.Mock()] if fail else None) as start:
            system.start_ac('/games/assettocorsa')
        return start

    def test_windows_starts_shipped_helper_with_the_game_as_its_child(self):
        start = self.launch()
        command = start.call_args.args[0]
        self.assertEqual(Path(command[0]).name, 'snow-worker.exe')
        self.assertEqual(command[1], '--launch-ac')
        self.assertTrue(command[2].endswith('acs.exe'))
        self.assertEqual(start.call_args.kwargs['cwd'], '/games/assettocorsa')

    def test_proton_runs_the_windows_helper_in_the_games_prefix_and_runtime(self):
        start = self.launch(windows=False)
        command = start.call_args.args[0]
        self.assertEqual(command[:5], [os.path.join('/runtime', '_v2-entry-point'), '--verb=waitforexitandrun', '--', '/proton/proton', 'waitforexitandrun'])
        self.assertEqual(Path(command[5]).name, 'snow-worker.exe')
        self.assertEqual(command[6:], ['--launch-ac', r'Z:\games\assettocorsa\acs.exe'])
        self.assertEqual(start.call_args.kwargs['env']['STEAM_COMPAT_DATA_PATH'], '/steam/compatdata/244210')
        self.assertIn('dwrite=n,b', start.call_args.kwargs['env']['WINEDLLOVERRIDES'])

    def test_missing_helper_or_disabled_csp_keeps_direct_play(self):
        for options in ({'present': False}, {'enabled': False}):
            with self.subTest(options=options):
                command = self.launch(**options).call_args.args[0]
                self.assertEqual(len(command), 1)
                self.assertTrue(command[0].endswith('acs.exe'))

    def test_helper_launch_failure_falls_back_to_direct_game_launch(self):
        start = self.launch(fail=True)
        self.assertEqual(start.call_count, 2)
        command = start.call_args.args[0]
        self.assertEqual(len(command), 1)
        self.assertTrue(command[0].endswith('acs.exe'))


@unittest.skipUnless(os.name == 'nt', 'Windows helper lifecycle; Linux uses this executable through Proton')
class SnowExecutableTest(unittest.TestCase):
    def test_shipped_helper_launches_its_own_child_and_exits_with_it(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            done, log = root / 'done', root / 'worker.log'
            child = "import pathlib,time,sys; end=time.monotonic()+10; p=pathlib.Path(sys.argv[1]);\nwhile not p.exists() and time.monotonic()<end: time.sleep(.02)"
            with log.open('w') as output:
                process = subprocess.Popen([str(ROOT / 'src/bin/snow-worker.exe'), '--channel',
                                            'Local\\Map2Lap.Test.' + uuid.uuid4().hex, '--launch-ac', sys.executable,
                                            '-c', child, str(done)], stdout=output, stderr=subprocess.PIPE,
                                           creationflags=subprocess.CREATE_NO_WINDOW)
                try:
                    deadline = time.monotonic() + 5
                    while not log.read_text().strip() and process.poll() is None and time.monotonic() < deadline:
                        time.sleep(.02)
                    self.assertIsNone(process.poll(), process.stderr.read() if process.poll() is not None else '')
                    receipt = json.loads(log.read_text().splitlines()[0])
                    self.assertTrue(receipt['ready'])
                    self.assertNotEqual(receipt['pid'], receipt['ac_pid'])
                    self.assertEqual(receipt['pid'], process.pid)
                    channel = process.args[2]
                    with mmap.mmap(-1, receipt['bytes'], tagname=channel) as shared:
                        params = [0.] * 20
                        params[8], params[9], params[11], params[13], params[16] = 1, .001, 1, 1, 1
                        struct.pack_into('<20d', shared, 48, *params)
                        struct.pack_into('<7d', shared, 992, 0, 0, 5, .5, 1, 0, 1)
                        struct.pack_into('<I', shared, 24, 1)
                        struct.pack_into('<I', shared, 12, 1)
                        deadline = time.monotonic() + 3
                        while struct.unpack_from('<I', shared, 16)[0] != 1 and time.monotonic() < deadline:
                            time.sleep(.01)
                        self.assertEqual(struct.unpack_from('<I', shared, 16)[0], 1)
                        self.assertEqual(struct.unpack_from('<I', shared, 28)[0], 1)
                        vertices = struct.unpack_from('<16f', shared, 992 + 16383 * 56)
                        self.assertTrue(all(math.isfinite(v) for v in vertices))
                        self.assertGreater(vertices[4], -1)
                        self.assertGreater(vertices[3], 0)
                    done.touch()
                    self.assertEqual(process.wait(timeout=5), 0)
                finally:
                    done.touch()
                    if process.poll() is None:
                        process.terminate()
                    process.communicate(timeout=5)


class SnowPackageTest(unittest.TestCase):
    def test_both_platform_archives_require_the_compiled_current_helper(self):
        sys.path.insert(0, str(ROOT / 'tools'))
        import make_release
        for platform in ('win', 'linux'):
            self.assertIn('src/bin/snow-worker.exe', make_release.files(platform))
        with tempfile.TemporaryDirectory() as folder, mock.patch.object(make_release, 'HERE', folder):
            with self.assertRaisesRegex(SystemExit, 'snow'):
                make_release.check_snow_worker()


if __name__ == '__main__':
    unittest.main()
