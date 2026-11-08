"""Imported materials survive restarts and cache eviction without changing the originals."""
import io
import json
import os
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))
from PIL import Image


def image_bytes(mode="RGB", size=(64, 32), colour=(30, 160, 40), format="PNG"):
    buffer = io.BytesIO()
    Image.new(mode, size, colour).save(buffer, format)
    return buffer.getvalue()


class LibraryTest(unittest.TestCase):
    def test_tiny_colours_keep_their_pixels_but_prepare_valid_bc_texture_dimensions(self):
        prepared, result = self.add(raw=image_bytes(size=(1, 1), colour=(255, 0, 0)))
        self.assertEqual([1, 1], prepared["source"]["size"])
        self.assertEqual([4, 4], prepared["prepared"]["size"])
        with Image.open(io.BytesIO(self.library.colour(result["material"]["id"]))) as colour:
            self.assertEqual((255, 0, 0), colour.getpixel((3, 3)))

    def test_remove_deletes_only_the_selected_library_package_and_is_idempotent(self):
        _prepared, result = self.add()
        id = result["material"]["id"]
        other = Path(self.tmp.name, "out/retained.txt")
        other.parent.mkdir()
        other.write_text("kept", encoding="utf-8")
        self.assertTrue(self.library.remove(id))
        self.assertFalse(self.library.remove(id))
        self.assertEqual([], self.library.listing()["items"])
        self.assertEqual("kept", other.read_text(encoding="utf-8"))
        with self.assertRaises(ValueError):
            self.library.remove("../out")

    def test_palette_transparency_survives_an_embedded_rgb_profile(self):
        from PIL import ImageCms
        image = Image.new("P", (4, 4), 0)
        image.putpalette([255, 0, 0] + [0] * 765)
        output = io.BytesIO()
        image.save(output, "PNG", transparency=0, icc_profile=ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes())
        _image, source = self.library._decoded("palette.png", output.getvalue())
        self.assertTrue(source["alpha"])

    def test_rgb_png_sixteen_bit_channels_are_refused_even_when_pillow_reports_rgb(self):
        import zlib
        def chunk(kind, value):
            return struct.pack(">I", len(value)) + kind + value + struct.pack(">I", zlib.crc32(kind + value) & 0xffffffff)
        rows = b"".join(b"\0" + struct.pack(">12H", *([40000, 1000, 65535] * 4)) for _ in range(4))
        raw = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", 4, 4, 16, 2, 0, 0, 0))
        raw += chunk(b"IDAT", zlib.compress(rows)) + chunk(b"IEND", b"")
        with self.assertRaisesRegex(ValueError, "8-bit"):
            self.library.prepare("rgb16.png", raw)

    def setUp(self):
        from app import materiallibrary
        self.library = materiallibrary
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        patch = mock.patch.object(materiallibrary, "ROOT", self.tmp.name)
        patch.start()
        self.addCleanup(patch.stop)

    def add(self, filename="meadow.png", raw=None, **settings):
        prepared = self.library.prepare(filename, raw or image_bytes())
        result = self.library.add({"token": prepared["token"], "filename": filename, "name": "Meadow", "category": "grass",
                                   "repeat": [2, 1], **settings})
        return prepared, result

    def test_prepare_does_not_import_and_commit_keeps_original_and_reuses_the_same_material(self):
        raw = image_bytes()
        prepared = self.library.prepare("Wiese.PNG", raw)
        self.assertEqual([], self.library.listing()["items"])
        self.assertEqual([64, 32], prepared["source"]["size"])
        settings = {"token": prepared["token"], "filename": "Wiese.PNG", "name": "Sommerwiese", "category": "grass", "repeat": [2, 1],
                    "source": "https://example.invalid/grass", "license": "CC0", "tags": ["summer", "green"]}
        result = self.library.add(settings)
        self.assertFalse(result["duplicate"])
        asset = result["material"]
        original = Path(self.tmp.name, "library", "materials", asset["id"], asset["maps"]["colour"]["file"])
        self.assertEqual(raw, original.read_bytes())
        self.assertEqual("Wiese.PNG", asset["maps"]["colour"]["filename"])
        self.assertNotIn(self.tmp.name, json.dumps(asset))
        self.assertEqual("BC1", asset["prepared"]["format"])
        self.assertEqual([2, 1], asset["repeat"])
        again = self.library.add({**settings, "name": "Another display name"})
        self.assertTrue(again["duplicate"])
        self.assertEqual(asset["id"], again["material"]["id"])
        self.assertEqual("Sommerwiese", self.library.get(asset["id"])["name"])
        self.assertEqual(1, self.library.listing()["total"])

    def test_library_browse_is_filtered_and_paged_and_does_not_include_original_maps(self):
        self.add(name="Alpine grass")
        self.add(name="Dark asphalt", category="asphalt", raw=image_bytes(colour=(40, 40, 40)))
        page = self.library.listing(limit=1)
        self.assertEqual(2, page["total"])
        self.assertEqual(1, len(page["items"]))
        self.assertNotIn("maps", page["items"][0])
        self.assertEqual("Dark asphalt", self.library.listing(query="DARK", category="asphalt")["items"][0]["name"])
        self.assertEqual([], self.library.listing(category="rock")["items"])

    def test_a_cleared_cache_is_rebuilt_from_the_retained_original(self):
        _prepared, result = self.add()
        id = result["material"]["id"]
        first = self.library.colour(id)
        import shutil
        shutil.rmtree(Path(self.tmp.name, "cache"))
        self.assertEqual(first, self.library.colour(id))
        self.assertEqual(1, self.library.listing()["total"])
        preview = self.library.preview(id)
        with Image.open(io.BytesIO(preview)) as image:
            self.assertLessEqual(max(image.size), 256)

    def test_individually_evicted_prepared_files_are_recreated(self):
        prepared, result = self.add()
        id = result["material"]["id"]
        first = self.library.colour(id)
        for path in Path(self.tmp.name, "cache").rglob("colour.png"):
            path.unlink()
        self.assertEqual(first, self.library.colour(id))

    def test_alpha_is_retained_in_normalized_pixels_for_future_cutout_materials(self):
        raw = image_bytes("RGBA", (64, 32), (20, 150, 40, 80))
        _prepared, result = self.add(raw=raw)
        asset = result["material"]
        self.assertTrue(asset["source"]["alpha"])
        self.assertEqual("BC3", asset["prepared"]["format"])
        with Image.open(io.BytesIO(self.library.colour(asset["id"]))) as image:
            self.assertEqual(80, image.convert("RGBA").getpixel((2, 2))[3])

    def test_dds_input_and_non_square_images_work_without_an_external_converter(self):
        raw = io.BytesIO()
        Image.new("RGB", (32, 16), "green").save(raw, "DDS", pixel_format="DXT1")
        _prepared, result = self.add("grass.DDS", raw.getvalue())
        self.assertEqual("DDS", result["material"]["source"]["format"])
        self.assertEqual([32, 16], result["material"]["prepared"]["size"])

    def test_invalid_files_and_metadata_never_publish_a_partial_material(self):
        for filename, raw in (("../x.png", image_bytes()), ("C:\\x.png", image_bytes()), ("x.png", b"broken"),
                              ("x.jpg", image_bytes()), ("x.blend", b"blend")):
            with self.subTest(filename=filename), self.assertRaises(ValueError):
                self.library.prepare(filename, raw)
        prepared = self.library.prepare("grass.png", image_bytes())
        good = {"token": prepared["token"], "filename": "grass.png", "name": "Grass", "category": "grass", "repeat": [2, 2]}
        for bad in ({"name": ""}, {"repeat": [0, 2]}, {"repeat": [True, 2]}, {"repeat": [float("nan"), 2]},
                    {"category": "../other"}, {"token": "../other"}, {"filename": "../other"}):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                self.library.add({**good, **bad})
        self.assertEqual([], self.library.listing()["items"])

    def test_high_bit_depth_images_are_refused_without_clipping_their_colours(self):
        with self.assertRaisesRegex(ValueError, "8.bit"):
            self.library.prepare("height.png", image_bytes("I;16", (2, 2), 30000))

    def test_embedded_profiles_keep_greys_and_transparency_and_cmyk_imports_as_colour(self):
        from PIL import ImageCms
        profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
        for mode, value in (("L", 100), ("RGBA", (30, 160, 40, 80))):
            with self.subTest(mode=mode):
                raw = io.BytesIO()
                Image.new(mode, (2, 2), value).save(raw, "PNG", icc_profile=profile)
                image, _ = self.library._decoded("colour.png", raw.getvalue())
                self.assertEqual((100, 100, 100) if mode == "L" else value, image.getpixel((0, 0)))
        image, _ = self.library._decoded("colour.jpg", image_bytes("CMYK", (2, 2), (0, 255, 255, 0), "JPEG"))
        self.assertEqual((255, 0, 0), image.getpixel((0, 0)))

    def test_import_does_not_encode_an_unused_dds(self):
        self.add()
        self.assertFalse(list(Path(self.tmp.name, "cache").rglob("*.dds")))

    def test_browsing_does_not_wait_for_an_image_to_decode(self):
        import threading
        started, release, browsed = threading.Event(), threading.Event(), threading.Event()
        original = self.library._decoded
        errors = []
        def decode(*args):
            started.set()
            release.wait(3)
            return original(*args)
        def prepare():
            try:
                self.library.prepare("image.png", image_bytes())
            except Exception as error:
                errors.append(error)
        with mock.patch.object(self.library, "_decoded", side_effect=decode):
            worker = threading.Thread(target=prepare)
            worker.start()
            self.assertTrue(started.wait(2))
            browser = threading.Thread(target=lambda: (self.library.listing(), browsed.set()))
            browser.start()
            try:
                self.assertTrue(browsed.wait(0.5), "browse blocked by image decoding")
            finally:
                release.set()
                worker.join(4)
                browser.join(4)
        self.assertEqual([], errors)


if __name__ == "__main__":
    unittest.main()
