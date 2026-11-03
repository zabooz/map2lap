"""The Rust sRGB step (mip_levels) reads its bytes from thresholds: exact only if the formula never decreases over
every float32 in [0, 1] (about a billion of them: ~50 s, so tools/check.py leaves this file out with --fast)."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import fast  # noqa: E402


@unittest.skipUnless(fast.AVAILABLE, "no earthfast binary for this platform (tools/build_native.py)")
class SrgbTest(unittest.TestCase):
    def test_srgb_monotonic(self):
        self.assertTrue(fast._ef.srgb_monotonic())


if __name__ == "__main__":
    unittest.main()
