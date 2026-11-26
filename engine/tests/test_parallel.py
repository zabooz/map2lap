"""The tile pool's workers end with the process that started them, also after a hard end without cleanup."""
import os
import subprocess
import sys
import tempfile
import textwrap
import time
import unittest
from pathlib import Path

SRC = Path(__file__).resolve().parents[2] / "src"

PARENT = textwrap.dedent(f"""
    import os, sys, time
    sys.path.insert(0, {str(SRC)!r})
    from track import parallel

    def pid():
        time.sleep(.5)
        return os.getpid()

    if __name__ == "__main__":
        ex = parallel.pool(2)
        pids = sorted({{f.result() for f in [ex.submit(pid) for _ in range(2)]}})
        with open(sys.argv[1], "w") as out:
            out.write(" ".join(map(str, pids)))
        os._exit(0)   # like a killed server: no executor shutdown, no atexit
""")


def alive(pid):
    """Whether process pid still runs."""
    if sys.platform == "win32":
        import ctypes
        handle = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)   # PROCESS_QUERY_LIMITED_INFORMATION
        if not handle:
            return False
        code = ctypes.c_ulong()
        ctypes.windll.kernel32.GetExitCodeProcess(handle, ctypes.byref(code))
        ctypes.windll.kernel32.CloseHandle(handle)
        return code.value == 259   # STILL_ACTIVE
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    return True


_given = None


def _remember(value):
    global _given
    _given = value


def _read():
    return _given


class OrphanedWorkersTest(unittest.TestCase):
    def test_the_callers_initializer_still_runs_in_each_worker(self):
        sys.path.insert(0, str(SRC))
        from track import parallel
        with parallel.pool(1, _remember, ("tiles",)) as ex:
            self.assertEqual(ex.submit(_read).result(timeout=60), "tiles")

    def test_workers_end_after_their_parent_dies_without_shutdown(self):
        with tempfile.TemporaryDirectory() as tmp:
            script = Path(tmp) / "parent.py"
            script.write_text(PARENT)
            found = Path(tmp) / "pids"
            # (No captured output: surviving workers would keep its pipe open and the run would never end.)
            subprocess.run([sys.executable, str(script), str(found)], stdout=subprocess.DEVNULL, timeout=60, check=True)
            pids = [int(p) for p in found.read_text().split()]
        self.assertTrue(pids)
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline and any(map(alive, pids)):
            time.sleep(.1)
        left = [p for p in pids if alive(p)]
        for p in left:   # don't leave this test's own orphans behind
            os.kill(p, 9)
        self.assertEqual(left, [], "pool workers outlived their parent")


if __name__ == "__main__":
    unittest.main()
