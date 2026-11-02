"""The download cache's size cap (server/cache.py; docs/ROADMAP.md "Caching" 1, 3, 5): LRU order, the
cap and the low-water mark, the protection rules (this session's last hour, gravity/, netstats/, empty
markers), index persistence and damage, the VERSION file, per-source lifetimes, concurrent use from
worker threads, clear, the background thread's pacing, and the hooks in dem.py / imagery.py /
deshadow.py / colormatch.py and earthd's 'cache' messages. No network: fake clock, stub fetcher."""
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import cache as cachemod  # noqa: E402

DAY = 86400.0
T0 = 1_760_000_000.0        # the fake wall clock's start (2025-10)
MB = 1_000_000



























# --- the producers -------------------------------------------------------------------------------





# --- earthd ------------------------------------------------------------------------------------------





class PruneDirTest(unittest.TestCase):
    def test_oldest_go_first_recent_stay(self):
        import tempfile, shutil
        root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, root, True)
        now = 1_000_000.0
        for i in range(10):
            p = os.path.join(root, f"d{i % 3}", f"{i}.raw.npy")
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, "wb") as f:
                f.write(b"x" * 100)
            os.utime(p, (now - 10000 + i * 100, now - 10000 + i * 100))
        keep = os.path.join(root, "other.npz")
        with open(keep, "wb") as f:
            f.write(b"x" * 5000)
        os.utime(keep, (0, 0))
        n, left = cachemod.prune_dir(root, 500, keep_s=600, match=lambda n: n.endswith(".raw.npy"), now=now)
        self.assertEqual((n, left), (6, 400), "down to 90 % of the cap, the oldest first")
        self.assertTrue(os.path.exists(keep), "files not matched stay")
        self.assertEqual(sorted(os.listdir(os.path.join(root, "d0"))), ["6.raw.npy", "9.raw.npy"])
        # a recent file stays even over the cap
        n, left = cachemod.prune_dir(root, 50, keep_s=10 ** 6, match=lambda n: n.endswith(".raw.npy"), now=now)
        self.assertEqual(n, 0)

    def test_touch_once(self):
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False) as f:
            path = f.name
        self.addCleanup(os.remove, path)
        os.utime(path, (1, 1))
        cachemod.touch_once(path)
        self.assertGreater(os.path.getmtime(path), 1000)
        os.utime(path, (1, 1))
        cachemod.touch_once(path)
        self.assertEqual(os.path.getmtime(path), 1, "once per process")









class HeldReadTest(unittest.TestCase):
    """A file another process is replacing on Windows (PermissionError for a moment): read again, then a miss."""

    def test_held_then_free_and_held_for_good(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "t.jpg")
            Path(path).write_bytes(b"jpg")
            real = open
            calls = []

            def held(n):
                def fake(p, *a, **k):
                    calls.append(p)
                    if p == path and len(calls) <= n:
                        raise PermissionError(13, "Permission denied")
                    return real(p, *a, **k)
                return fake
            with mock.patch.object(cachemod, "READ_WAITS", (0, 0, 0)), \
                    mock.patch("builtins.open", held(2)):
                self.assertEqual(cachemod.NONE.read(path), b"jpg")
            calls.clear()
            with mock.patch.object(cachemod, "READ_WAITS", (0, 0, 0)), \
                    mock.patch("builtins.open", held(99)):
                self.assertIsNone(cachemod.NONE.read(path))
            self.assertEqual(len(calls), 4)


if __name__ == "__main__":
    unittest.main()


class LinkedCacheTest(unittest.TestCase):
    """A scratch cache of links into a real one must never delete the real one's files (2026-10-29: ~7 GB evicted
    through the links of a benchmark's scratch cache)."""


    def test_remove_never_follows_a_link_out_of_the_cache(self):
        with tempfile.TemporaryDirectory() as real, tempfile.TemporaryDirectory() as root:
            os.makedirs(os.path.join(root, "dem", "z"))
            target = os.path.join(real, "1.webp")
            with open(target, "wb") as fh:
                fh.write(b"x" * 10)
            os.symlink(target, os.path.join(root, "dem", "z", "1.webp"))
            self.assertFalse(cachemod._inside(os.path.join(root, "dem", "z", "1.webp"), root))
            self.assertTrue(cachemod._inside(os.path.join(root, "dem", "z", "2.webp"), root))
