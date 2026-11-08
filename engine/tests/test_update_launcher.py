"""Run the actual Windows launcher: bounded lock failures, retry and restart in disposable app folders."""
from contextlib import contextmanager
import ctypes
from ctypes import wintypes
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
START = "Start Map2Lap.bat"
PROBE = "from pathlib import Path; import json, sys; Path('launched').write_text(json.dumps(sys.argv[1:]))\n"
SH = shutil.which("sh")
if not SH and os.name == "nt" and (git := shutil.which("git")):
    git_sh = Path(git).parents[1] / "usr/bin/sh.exe"
    SH = str(git_sh) if git_sh.is_file() else None


@contextmanager
def locked(path):
    """Hold the existing path with Windows denying writes/deletes, like a loaded DLL."""
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.c_void_p,
                                  wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
    kernel.CreateFileW.restype = wintypes.HANDLE
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    handle = kernel.CreateFileW(str(path), 0x80000000, 1, None, 3, 0, None)
    if handle == ctypes.c_void_p(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        yield
    finally:
        kernel.CloseHandle(handle)


@unittest.skipUnless(os.name == "nt", "Windows launcher and file locks")
class LauncherTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory(prefix="map2lap update ")
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        shutil.copyfile(ROOT / START, self.root / START)
        self.new = self.root / "update/Map2Lap"
        (self.new / "src").mkdir(parents=True)
        (self.new / "src/server.py").write_text(PROBE)
        shutil.copyfile(ROOT / START, self.new / START)
        (self.root / "src").mkdir()
        (self.root / "src/server.py").write_text("raise RuntimeError('old server must not start')\n")
        (self.root / "update/ready").touch()

    def run_launcher(self):
        """Run the real batch with the test interpreter on PATH; kill its tree on a retry timeout."""
        env = dict(os.environ, PATH=str(Path(sys.executable).parent) + os.pathsep + os.environ["PATH"])
        with subprocess.Popen(["cmd.exe", "/d", "/c", str(self.root / START)], cwd=self.root, env=env,
                              stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT) as process:
            try:
                output = process.communicate(b"\n", timeout=22)[0]
            except subprocess.TimeoutExpired:
                subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], capture_output=True)
                process.communicate()
                self.fail("Update still running after 22 seconds with one locked file")
        return process.returncode, output.decode(errors="replace")

    def test_success_mirrors_code_and_preserves_user_data(self):
        (self.root / "src/obsolete.py").touch()
        for name in ("settings.json", "cache/own", "out/own", "library/materials/own"):
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("keep")
        code, output = self.run_launcher()
        self.assertEqual(0, code, output)
        self.assertTrue((self.root / "launched").is_file(), output)
        self.assertFalse((self.root / "update").exists())
        self.assertFalse((self.root / "src/obsolete.py").exists())
        for name in ("settings.json", "cache/own", "out/own", "library/materials/own"):
            self.assertEqual("keep", (self.root / name).read_text())

    def test_locked_code_stops_then_can_retry_without_redownloading(self):
        target = self.root / "src/server.py"
        with locked(target):
            code, output = self.run_launcher()
        self.assertNotEqual(0, code, output)
        self.assertIn("Update failed", output)
        self.assertFalse((self.root / "launched").exists())
        self.assertTrue((self.root / "update/ready").is_file())
        self.assertTrue((self.new / "src/server.py").is_file())
        code, output = self.run_launcher()
        self.assertEqual(0, code, output)
        self.assertTrue((self.root / "launched").is_file())

    def assert_locked_top_level_stops(self, name):
        """A failed top-level copy must keep the staged update and never start the server."""
        if name != START:
            (self.root / name).write_text("old")
            (self.new / name).write_text("new readme")
        with locked(self.root / name):
            code, output = self.run_launcher()
        self.assertNotEqual(0, code, output)
        self.assertIn("Update failed", output)
        self.assertFalse((self.root / "launched").exists())
        self.assertTrue((self.root / "update/ready").is_file())

    def test_locked_top_level_file_prevents_start(self):
        self.assert_locked_top_level_stops("README.txt")

    def test_locked_launcher_prevents_start(self):
        self.assert_locked_top_level_stops(START)

    def test_restart_75_installs_and_passes_no_browser_to_new_server(self):
        shutil.move(str(self.root / "update"), str(self.root / "pending"))
        (self.root / "src/server.py").write_text(
            "import shutil; shutil.move('pending', 'update'); raise SystemExit(75)\n")
        code, output = self.run_launcher()
        self.assertEqual(0, code, output)
        self.assertEqual(["--no-browser"], json.loads((self.root / "launched").read_text()))


@unittest.skipUnless(SH, "POSIX shell (Linux or Git Bash)")
class LinuxLauncherTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory(prefix="map2lap update ")
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.new = self.root / "update/Map2Lap"
        (self.new / "src").mkdir(parents=True)
        (self.new / "src/server.py").write_text(PROBE)
        (self.new / "README.txt").write_text("new")
        shutil.copyfile(ROOT / "start.sh", self.root / "start.sh")
        shutil.copyfile(ROOT / "start.sh", self.new / "start.sh")
        (self.root / "update/ready").touch()

    def run_launcher(self, command=None, fail_path=None):
        """Run start.sh with an optional failing copy/rename to model permissions or a full disk."""
        env = dict(os.environ, MAP2LAP_TERMINAL="1")
        tools = self.root / "commands"
        tools.mkdir()
        env["PATH"] = str(tools) + os.pathsep + str(Path(SH).parent) + os.pathsep + env["PATH"]
        if os.name == "nt":
            (tools / "python3").write_text(f'#!/bin/sh\nexec "{Path(sys.executable).as_posix()}" "$@"\n')
        if command:
            binary = Path(shutil.which(command, path=env["PATH"])).as_posix()
            stub = tools / command
            stub.write_text(f'#!/bin/sh\nfor arg; do [ "$arg" != "{fail_path}" ] || exit 1; done\nexec "{binary}" "$@"\n')
            stub.chmod(0o755)
        return subprocess.run([SH, (self.root / "start.sh").as_posix()], cwd=self.root, env=env, input="\n",
                              capture_output=True, text=True, timeout=10)

    def test_success_keeps_user_data_and_removes_old_code(self):
        (self.root / "src").mkdir()
        (self.root / "src/obsolete.py").touch()
        for name in ("settings.json", "cache/own", "out/own", "library/materials/own"):
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("keep")
        result = self.run_launcher()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertTrue((self.root / "launched").is_file())
        self.assertFalse((self.root / "src/obsolete.py").exists())
        self.assertFalse((self.root / "update").exists())
        for name in ("settings.json", "cache/own", "out/own", "library/materials/own"):
            self.assertEqual("keep", (self.root / name).read_text())

    def assert_failed_update_stops(self, command, path):
        """Failed installs keep the ready update for retry and never start the new server."""
        result = self.run_launcher(command, path)
        self.assertNotEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("Update failed", result.stdout)
        self.assertFalse((self.root / "launched").exists())
        self.assertTrue((self.root / "update/ready").exists())

    def test_failed_folder_copy_stops(self):
        self.assert_failed_update_stops("cp", "update/Map2Lap/src/")

    def test_failed_top_level_copy_stops(self):
        self.assert_failed_update_stops("cp", "update/Map2Lap/README.txt")

    def test_failed_launcher_copy_stops(self):
        self.assert_failed_update_stops("cp", "update/Map2Lap/start.sh")

    def test_failed_launcher_rename_stops(self):
        self.assert_failed_update_stops("mv", "start.sh.new")

    def test_restart_75_passes_no_browser(self):
        shutil.move(str(self.root / "update"), str(self.root / "pending"))
        (self.root / "src").mkdir()
        (self.root / "src/server.py").write_text(
            "import shutil; shutil.move('pending', 'update'); raise SystemExit(75)\n")
        result = self.run_launcher()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertEqual(["--no-browser"], json.loads((self.root / "launched").read_text()))


if __name__ == "__main__":
    unittest.main()
