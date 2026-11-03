"""Python under Map2Lap's names (app.named): where the copies lie, when they are made, that they run and pass an exit code."""
import os
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ENGINE, "..", "src")
sys.path.insert(0, os.path.abspath(SRC))

from app import named  # noqa: E402


class WhereTest(unittest.TestCase):
    def test_a_releases_copies_lie_beside_its_python(self):
        self.assertEqual(named.where(r"C:\M2L\python\python.exe", r"C:\M2L"), (r"C:\M2L\python", False))

    def test_any_other_pythons_lie_apart_in_out(self):
        got = named.where(r"C:\Users\x\Python314\python.exe", r"C:\M2L")
        self.assertEqual(got, (os.path.join(r"C:\M2L", "out", "python"), True))


class MakeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = self.tmp.name
        self.home = os.path.join(self.root, "base")
        os.makedirs(self.home)
        self.base = os.path.join(self.home, "python.exe")
        for n in ("python.exe", "python314.dll", "python3.dll", "vcruntime140.dll", "other.dll"):
            with open(os.path.join(self.home, n), "wb") as f:
                f.write(b"x")

    def test_the_names_and_the_dlls_python_loads_are_copied_apart(self):
        with mock.patch.object(named, "_check", return_value=True):
            folder, apart = named.make(self.base, self.root)
        self.assertTrue(apart)
        self.assertEqual(sorted(os.listdir(folder)), ["Map2Lap Build.exe", "Map2Lap Server.exe", "Map2Lap Worker.exe",
                                                      "python3.dll", "python314.dll", "vcruntime140.dll"])

    def test_copies_up_to_date_are_neither_made_nor_checked_again(self):
        with mock.patch.object(named, "_check", return_value=True) as check:
            named.make(self.base, self.root)
            named.make(self.base, self.root)
        self.assertEqual(check.call_count, 1)

    def test_a_new_python_is_copied_again(self):
        with mock.patch.object(named, "_check", return_value=True) as check:
            folder, _ = named.make(self.base, self.root)
            with open(self.base, "wb") as f:
                f.write(b"newer")
            named.make(self.base, self.root)
        self.assertEqual(check.call_count, 2)
        with open(os.path.join(folder, "Map2Lap Worker.exe"), "rb") as f:
            self.assertEqual(f.read(), b"newer")

    def test_copies_that_dont_run_go_and_plain_python_stays(self):
        with mock.patch.object(named, "_check", return_value=False):
            self.assertEqual(named.make(self.base, self.root), (None, False))
        left = os.listdir(os.path.join(self.root, "out", "python"))
        self.assertFalse([n for n in left if n.endswith(".exe")])


class EnvTest(unittest.TestCase):
    def test_apart_it_finds_python_and_leaves_the_venvs_launcher_out(self):
        with mock.patch.dict(os.environ, {named.LAUNCHER_VAR: "x"}), mock.patch.object(named.sys, "executable", "python.exe"):
            env = named.child_env(True)
        self.assertEqual(env["PYTHONHOME"], sys.base_prefix)
        self.assertNotIn(named.LAUNCHER_VAR, env)

    def test_beside_a_releases_python_nothing_is_needed(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("PYTHONHOME", None)
            self.assertNotIn("PYTHONHOME", named.child_env(False))


@unittest.skipUnless(named.WIN, "named copies are Windows' only")
class RealCopyTest(unittest.TestCase):
    def run_script(self, code):
        """code run as a child of this Python, its output and exit code."""
        env = {**os.environ, "PYTHONPATH": os.path.abspath(SRC)}
        return subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, env=env, timeout=120)

    def test_a_worker_runs_under_its_name_with_our_packages(self):
        path = named.exe("worker")
        self.assertEqual(os.path.basename(path), "Map2Lap Worker.exe")
        r = subprocess.run([path, "-c", "import sys, numpy; print(sys.executable)"], env=named.child_env(),
                           capture_output=True, text=True, timeout=120)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("Map2Lap Worker.exe", r.stdout)

    def test_a_restart_comes_back_with_the_programs_exit_code(self):
        r = self.run_script("import sys\nfrom app import named\nnamed.restart_as('server')\n"
                            "print(sys.executable)\nsys.exit(75)\n")
        self.assertEqual(r.returncode, 75, r.stderr)
        self.assertIn("Map2Lap Server.exe", r.stdout)

    def test_workers_of_a_pool_run_under_their_name(self):
        r = self.run_script("import multiprocessing, os, sys\nfrom app import named\n"
                            "from concurrent.futures import ProcessPoolExecutor\n"
                            "if __name__ == '__main__':\n"
                            "    ctx = multiprocessing.get_context('spawn')\n"
                            "    named.use_for_workers(ctx)\n"
                            "    with ProcessPoolExecutor(1, mp_context=ctx) as ex:\n"
                            "        print(ex.submit(os.getpid).result() != os.getpid(), named.exe('worker'))\n")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("True", r.stdout)
        self.assertIn("Map2Lap Worker.exe", r.stdout)


if __name__ == "__main__":
    unittest.main()
