"""One portable DDS encoder serves the existing builds and imported material maps."""
import io
import os
import struct
import sys
import unittest

from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))


class TextureTest(unittest.TestCase):
    def test_saved_weights_are_bc7_a_quarter_of_the_size_and_read_back_close_to_the_lossless_ones(self):
        import numpy as np
        from track.textures import dds_weights, bc7_weights, weight_levels
        y, x = np.mgrid[:64, :96]
        r = np.clip((np.sin(x / 9) + np.cos(y / 7) + .2) * 400, 0, 255)
        values = np.stack([r, 255 - r, np.zeros_like(r), np.zeros_like(r)], -1).astype(np.uint8)
        lossless = dds_weights(Image.fromarray(values))
        saved = bc7_weights(lossless)
        self.assertEqual((b"DX10", 98), (saved[84:88], struct.unpack_from("<I", saved, 128)[0]))     # BC7_UNORM: data, not sRGB
        self.assertEqual(struct.unpack_from("<I", lossless, 28), struct.unpack_from("<I", saved, 28))  # every mip level
        self.assertLess(len(saved), len(lossless) / 3)
        for before, after in zip(weight_levels(lossless), weight_levels(saved)):
            d = np.abs(before.astype(int) - after.astype(int))
            self.assertLess(d.mean(), 2.55)     # (under 1 % of a weight on average)
            self.assertLessEqual(np.abs(before.astype(int).sum(-1) - after.astype(int).sum(-1)).max(), 12)

    def test_a_saved_mask_is_an_eighth_as_wide_its_weights_averaged_and_summing_to_one(self):
        import numpy as np
        from track.textures import coarse_weights, dds_weights, weight_levels
        values = np.zeros((2304, 2304, 4), np.uint8)
        values[:, :1152, 0], values[:, 1152:, 3] = 255, 255           # (one material left, the original tile right)
        values[:8, :8] = np.repeat(np.eye(4, dtype=np.uint8) * 255, 2, axis=0)   # (two columns each of four materials)
        coarse = weight_levels(coarse_weights(dds_weights(Image.fromarray(values))))
        self.assertEqual((288, 288, 4), coarse[0].shape)              # (1 m a texel on a 2048 px tile's ring canvas)
        self.assertEqual([255, 0, 0, 0], coarse[0][100, 100].tolist())
        self.assertEqual([0, 0, 0, 255], coarse[0][100, 200].tolist())
        self.assertTrue(np.allclose(coarse[0][0, 0], 63.75, atol=1))    # (an 8×8 block of four materials: a quarter each)
        for level in coarse:
            self.assertTrue((level.astype(int).sum(-1) == 255).all())
        self.assertEqual(1, coarse[-1].shape[0])
        small = dds_weights(Image.fromarray(values[:36, :36]))       # (a 32 px tile's canvas: an eighth would lose its ring)
        self.assertEqual(small, coarse_weights(small))

    def test_a_bc7_mask_reads_back_as_lossless_weights_for_the_browser(self):
        import numpy as np
        from track.textures import dds_weights, bc7_weights, browser_weights
        values = np.zeros((8, 8, 4), np.uint8)
        values[:, :4, 0], values[:, 4:, 3] = 255, 255
        raw = browser_weights(bc7_weights(dds_weights(Image.fromarray(values))))
        self.assertEqual((bytes(4), 32), (raw[84:88], struct.unpack_from("<I", raw, 88)[0]))
        self.assertEqual(4, struct.unpack_from("<I", raw, 28)[0])

    def test_other_textures_pass_unchanged(self):
        from track.textures import bc7_weights, browser_weights, dds_mipmaps
        raw = dds_mipmaps(Image.new("RGB", (8, 8)))
        self.assertIs(raw, bc7_weights(raw))
        self.assertIs(raw, browser_weights(raw))

    def test_lossless_weight_dds_preserves_unit_sums_at_every_mip(self):
        import numpy as np
        from track.textures import dds_weights, dds_size
        rng = np.random.default_rng(29)
        values = rng.random((16, 32, 4))
        values = np.rint(values / values.sum(axis=2, keepdims=True) * 255).astype(np.uint8)
        raw = dds_weights(Image.fromarray(values))
        self.assertEqual(dds_size(32, 16, uncompressed=True), len(raw))
        self.assertEqual(32, struct.unpack_from("<I", raw, 88)[0])
        offset, width, height = 128, 32, 16
        for level in range(struct.unpack_from("<I", raw, 28)[0]):
            size = width * height * 4
            header = bytearray(raw[:128])
            struct.pack_into("<3I", header, 12, height, width, width * 4)
            struct.pack_into("<I", header, 28, 1)
            with Image.open(io.BytesIO(header + raw[offset:offset + size])) as image:
                weights = np.asarray(image, dtype=np.int16)
            self.assertTrue(np.all(weights.sum(axis=2) == 255), f"weight drift in mip {level}")
            offset += size
            width, height = max(1, width // 2), max(1, height // 2)

    def test_independent_mask_channels_keep_their_weights_in_every_mip(self):
        import numpy as np
        from track.textures import dds_mipmaps
        pixels = np.zeros((32, 32, 4), np.uint8)
        pixels[:, ::2, 0] = 255
        pixels[:, 1::2, 3] = 255
        raw = dds_mipmaps(Image.fromarray(pixels), alpha=True, smallest=1, independent=True)
        offset, width, height = 128, 32, 32
        for level in range(struct.unpack_from("<I", raw, 28)[0]):
            size = ((width + 3) // 4) * ((height + 3) // 4) * 16
            header = bytearray(raw[:128])
            struct.pack_into("<2I", header, 12, height, width)
            struct.pack_into("<I", header, 28, 1)
            with Image.open(io.BytesIO(header + raw[offset:offset + size])) as image:
                weights = np.array(image.convert("RGBA"), dtype=np.int16)
            self.assertTrue(np.all(abs(weights.sum(axis=2) - 255) <= 16), f"lost weights in mip {level}")
            if level:
                self.assertGreater(int(weights[..., 0].min()), 110)
                self.assertGreater(int(weights[..., 3].min()), 110)
            offset += size
            width, height = max(1, width // 2), max(1, height // 2)

    def test_the_build_profile_keeps_the_existing_bc1_bytes(self):
        from track.textures import dds_mipmaps
        image = Image.new("RGB", (32, 16), (30, 150, 40))
        levels, current = [], image
        while True:
            buffer = io.BytesIO()
            current.save(buffer, "DDS", pixel_format="DXT1")
            levels.append(buffer.getvalue()[128:])
            w, h = current.size
            if w <= 4 or h <= 4 or w % 8 or h % 8:
                break
            current = current.resize((w // 2, h // 2), Image.Resampling.BOX)
        header = struct.pack("<4s7I44x", b"DDS ", 124, 0xA1007, 16, 32, len(levels[0]), 0, len(levels))
        header += struct.pack("<2I4s5I", 32, 4, b"DXT1", 0, 0, 0, 0, 0) + struct.pack("<5I", 0x401008, 0, 0, 0, 0)
        self.assertEqual(header + b"".join(levels), dds_mipmaps(image))

    def test_new_materials_have_mips_down_to_one_pixel_in_both_dimensions(self):
        from track.textures import dds_mipmaps
        result = dds_mipmaps(Image.new("RGB", (32, 16), "green"), smallest=1)
        self.assertEqual(6, struct.unpack_from("<I", result, 28)[0])
        self.assertEqual(128 + 256 + 64 + 16 + 8 + 8 + 8, len(result))

    def test_ground_changes_keep_untouched_compressed_blocks_exactly(self):
        import numpy as np
        from track.textures import dds_mipmaps, preserve_blocks
        pixels = np.zeros((8, 16, 3), np.uint8)
        pixels[..., 1] = np.arange(16, dtype=np.uint8) * 12
        old = dds_mipmaps(Image.fromarray(pixels), smallest=1)
        with Image.open(io.BytesIO(old)) as image:
            changed = np.array(image.convert("RGB"))
        changed[:, :8] = (200, 30, 40)
        mask = np.zeros((8, 16), bool)
        mask[:, :8] = True
        new = preserve_blocks(old, dds_mipmaps(Image.fromarray(changed), smallest=1), mask)
        for block in (2, 3, 6, 7):
            self.assertEqual(old[128 + block * 8:136 + block * 8], new[128 + block * 8:136 + block * 8])
        self.assertNotEqual(old[128:136], new[128:136])


if __name__ == "__main__":
    unittest.main()
