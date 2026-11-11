"""Tile images with roads are BC7 (textures.dds_mipmaps): painting a tile and saving a painted one keep it BC7, and the
photos a Save packs for the painted ground are BC7 too."""
import io
import os
import sys
import unittest

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from app import paintimage, trackdetail, tracknative  # noqa: E402
from track import textures  # noqa: E402


def png(pixels):
    output = io.BytesIO()
    Image.fromarray(pixels).save(output, "PNG")
    return output.getvalue()


def stripes():
    """A 16 × 16 tile image: asphalt with a white marking and green verge in every 4 px. Pure."""
    pixels = np.empty((16, 16, 3), np.uint8)
    pixels[:] = (90, 90, 92)
    pixels[:, 1::4], pixels[:, 3::4] = (235, 235, 235), (70, 140, 50)
    return pixels


class Bc7TileTest(unittest.TestCase):
    def test_untouched_bc7_blocks_stay_exactly_at_every_level(self):
        noise = np.random.default_rng(3).integers(0, 256, (16, 16, 3), dtype=np.uint8)     # (its blocks change when made again)
        old = textures.dds_mipmaps(Image.fromarray(noise), smallest=1, bc7=True)
        with Image.open(io.BytesIO(old)) as image:          # (painting reads the tile back from its blocks)
            changed = np.array(image.convert("RGB"))
        changed[:, :8] = (200, 30, 40)
        touched = np.zeros((16, 16), bool)
        touched[:, :8] = True
        new = textures.preserve_blocks(old, textures.dds_mipmaps(Image.fromarray(changed), smallest=1, bc7=True), touched)
        at = 148
        for block in (2, 3, 6, 7, 10, 11, 14, 15):          # (the east half of level 0's 4 × 4 blocks)
            self.assertEqual(old[at + block * 16:at + block * 16 + 16], new[at + block * 16:at + block * 16 + 16])
        self.assertNotEqual(old[at:at + 16], new[at:at + 16])

    def test_a_painted_bc7_tile_stays_bc7(self):
        original = textures.dds_mipmaps(Image.fromarray(stripes()), smallest=1, bc7=True)
        mask = np.zeros((16, 16), np.uint8)
        mask[:, :4] = 255
        with self.subTest("paint"), io.BytesIO() as red:
            Image.new("RGB", (4, 4), (255, 0, 0)).save(red, "PNG")
            red.seek(0)
            path = os.path.join(self.tmp(), "red.png")
            with open(path, "wb") as f:
                f.write(red.getvalue())
            raw = paintimage.encoded(original, "ground_0_0.dds", (0, 0), [(1, "grass", png(mask))], {1: (path, (2, 2))})
        self.assertTrue(textures._is_bc7(raw))
        self.assertEqual(original[148 + 3 * 16:148 + 4 * 16], raw[148 + 3 * 16:148 + 4 * 16])     # (an untouched block)

    def test_a_saved_tile_image_on_its_ring_canvas_keeps_bc7(self):
        pixels = np.dstack([stripes(), np.full((16, 16), 255, np.uint8)])
        self.assertTrue(textures._is_bc7(trackdetail.ringed_base(pixels, (0, 0), "ground_0_0.dds", bc7=True)))
        self.assertEqual(b"DXT1", trackdetail.ringed_base(pixels, (0, 0), "ground_0_0.dds")[84:88])

    def test_a_tile_images_copy_keeps_its_format_bc7_with_roads_else_bc3(self):
        from track import kn5
        material = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0, [], [])
        for bc7, fourcc in ((True, b"DX10"), (False, b"DXT5")):
            with self.subTest(bc7=bc7):
                tile = textures.dds_mipmaps(Image.fromarray(stripes()), bc7=bc7)
                copy = tracknative._photo_colour(tile, {"id": "base"}, material, (0, 0), 77, None)
                self.assertEqual(fourcc, copy[84:88])       # (BC3: BC1's colour, the gloss in its own alpha)

    def test_a_saved_photo_is_bc7_with_its_gloss_in_alpha(self):
        raw = tracknative._photo_colour(png(stripes()), {"id": "a", "asset": "a" * 64}, None, (0, 0), 77, None)
        self.assertTrue(textures._is_bc7(raw))
        level = textures.weight_levels(raw)[0]
        self.assertTrue((np.abs(level[..., 3].astype(int) - 77) <= 6).all())      # (BC7 shares a block's bits with the colour)
        self.assertLess(np.abs(level[..., :3].astype(int) - stripes()).max(), 8)

    def tmp(self):
        import tempfile
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        return folder.name


if __name__ == "__main__":
    unittest.main()
