"""The Editor asks for a track's window masks by a fixed name; a track built before has none."""
import io
import os
import sys
import tempfile
import unittest

from PIL import Image

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import server  # noqa: E402
from app import trackview  # noqa: E402


class GlowTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.ac = tmp.name
        self.ext = os.path.join(self.ac, "content", "tracks", "alpha", "extension")

    def test_a_mask_comes_at_half_its_size(self):
        os.makedirs(self.ext)
        Image.new("L", (1024, 1024), 255).save(os.path.join(self.ext, "glow_fac_1.png"))
        image = Image.open(io.BytesIO(trackview.glow_bytes(self.ac, "alpha", "glow_fac_1.png")))
        self.assertEqual((512, 512), image.size)
        self.assertEqual(255, image.getpixel((100, 100)))

    def test_a_track_built_before_has_none(self):
        self.assertIsNone(trackview.glow_bytes(self.ac, "alpha", "glow_fac_1.png"))

    def test_only_a_mask_s_name_is_read(self):
        with self.assertRaises(ValueError):
            trackview.glow_bytes(self.ac, "alpha", "../ext_config.ini")

    def test_the_route_takes_masks_only(self):
        self.assertEqual(("alpha", "glow_off_2.png"), server.GLOW_PATH.fullmatch("/api/editor/alpha/glow/glow_off_2.png").groups())
        for path in ("/api/editor/alpha/glow/ext_config.ini", "/api/editor/alpha/glow/glow_fac_3.png", "/api/editor/alpha/glow/..%2Fx"):
            self.assertIsNone(server.GLOW_PATH.fullmatch(path))


if __name__ == "__main__":
    unittest.main()
