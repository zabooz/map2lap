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
    def test_property_number_spelling_reuses_the_default_semantic_identity(self):
        _prepared, default = self.add()
        for values in ({"roughness": 1, "normal_scale": 1}, {"roughness": 1., "normal_scale": 1.}):
            _prepared, result = self.add(properties=values)
            self.assertTrue(result["duplicate"])
            self.assertEqual(default["material"]["id"], result["material"]["id"])
        for value in (True, float("inf"), float("nan")):
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.add(properties={"roughness": value})

    def test_reimport_reuses_existing_integer_schema_two_identity_without_rewriting_it(self):
        import hashlib
        _prepared, result = self.add(properties={"roughness": .5, "normal_scale": 2.})
        material = result["material"]
        values = {"roughness": .5, "normal_scale": 2}
        identity = {"schema": 2, "maps": {"colour": material["maps"]["colour"]["sha256"]},
                    "repeat": material["repeat"], "variation": material["variation"], "properties": values}
        old_id = hashlib.sha256(json.dumps(identity, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        folder = Path(self.tmp.name, "library/materials", material["id"])
        old_folder = folder.with_name(old_id)
        folder.rename(old_folder)
        material.update(id=old_id, properties=values)
        manifest = old_folder / "asset.json"
        manifest.write_text(json.dumps(material), encoding="utf-8")
        unchanged = manifest.read_bytes()
        _prepared, again = self.add(properties={"roughness": .5, "normal_scale": 2.})
        self.assertTrue(again["duplicate"])
        self.assertEqual(old_id, again["material"]["id"])
        self.assertEqual(unchanged, manifest.read_bytes())

    def test_ground_material_keeps_independent_original_maps_and_rebuilds_linear_data(self):
        from PIL import ImageCms
        colour = image_bytes()
        normal_image = Image.new("RGB", (8, 8), (180, 110, 240))
        encoded = io.BytesIO()
        normal_image.save(encoded, "PNG", icc_profile=ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes())
        normal = encoded.getvalue()
        roughness = image_bytes(mode="L", size=(8, 8), colour=73)
        staged = self.library.prepare("colour.png", colour)
        nm = self.library.prepare("normal.png", normal, role="normal")
        rm = self.library.prepare("roughness.png", roughness, role="roughness")
        settings = {"token": staged["token"], "filename": "colour.png", "name": "Ground", "category": "soil", "repeat": [2, 3],
                    "maps": {"normal": {"token": nm["token"], "filename": nm["filename"]},
                             "roughness": {"token": rm["token"], "filename": rm["filename"]}}}
        material = self.library.add(settings)["material"]
        self.assertEqual(2, material["schema"])
        self.assertEqual("srgb", material["maps"]["colour"]["colour_space"])
        self.assertEqual("linear", material["maps"]["normal"]["colour_space"])
        self.assertEqual("+Y", material["maps"]["normal"]["convention"])
        self.assertEqual({"roughness": 1., "normal_scale": 1.}, material["properties"])
        folder = Path(self.tmp.name, "library/materials", material["id"])
        for role, raw in (("colour", colour), ("normal", normal), ("roughness", roughness)):
            self.assertEqual(raw, (folder / material["maps"][role]["file"]).read_bytes())
        import shutil
        shutil.rmtree(Path(self.tmp.name, "cache"))
        with Image.open(io.BytesIO(self.library.map_image(material["id"], "normal"))) as image:
            self.assertEqual((180, 110, 240), image.getpixel((0, 0)), "normal vectors must not undergo colour management")
        with Image.open(io.BytesIO(self.library.map_image(material["id"], "roughness"))) as image:
            self.assertEqual(73, image.getpixel((0, 0)))
        self.assertTrue(self.library.add(settings)["duplicate"])
        self.library.prepare("colour.png", colour)
        colour_only = self.library.add({k: v for k, v in settings.items() if k != "maps"})["material"]
        self.assertNotEqual(material["id"], colour_only["id"])
        with self.assertRaisesRegex(ValueError, "roughness"):
            self.library.map_image(colour_only["id"], "roughness")

    def test_invalid_material_map_settings_never_publish_a_partial_package(self):
        staged = self.library.prepare("colour.png", image_bytes())
        settings = {"token": staged["token"], "filename": "colour.png", "name": "Ground", "category": "soil", "repeat": [2, 2]}
        for extra in ({"maps": {"unknown": {}}}, {"maps": {"normal": {"token": staged["token"], "filename": "colour.png"}}},
                      {"properties": {"roughness": float("nan")}}, {"properties": {"normal_scale": -1}}):
            with self.subTest(extra=extra), self.assertRaises(ValueError):
                self.library.add({**settings, **extra})
        self.assertEqual([], self.library.listing()["items"])

    def test_schema_one_material_keeps_its_id_and_can_regenerate_its_colour(self):
        import hashlib
        import shutil
        _prepared, result = self.add()
        material = result["material"]
        identity = {"schema": 1, "colour": material["maps"]["colour"]["sha256"], "repeat": material["repeat"], "variation": material["variation"]}
        old_id = hashlib.sha256(json.dumps(identity, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        old = {k: v for k, v in material.items() if k != "properties"}
        old.update(schema=1, id=old_id, maps={"colour": {k: v for k, v in material["maps"]["colour"].items() if k != "colour_space"}})
        folder = Path(self.tmp.name, "library/materials", old_id)
        shutil.copytree(folder.with_name(material["id"]), folder)
        (folder / "asset.json").write_text(json.dumps(old), encoding="utf-8")
        shutil.rmtree(Path(self.tmp.name, "cache"))
        self.assertEqual(old_id, self.library.get(old_id)["id"])
        self.assertEqual({"roughness": 1., "normal_scale": 1.}, self.library.properties(old))
        self.assertTrue(self.library.colour(old_id).startswith(b"\x89PNG"))
        self.library.remove(material["id"])
        unchanged = (folder / "asset.json").read_bytes()
        _prepared, again = self.add(properties={"roughness": 1, "normal_scale": 1})
        self.assertTrue(again["duplicate"])
        self.assertEqual(old_id, again["material"]["id"])
        self.assertEqual(unchanged, (folder / "asset.json").read_bytes())

    def test_data_map_cache_is_independent_of_colour_management_for_the_same_bytes(self):
        image = Image.new("RGB", (8, 8), (180, 110, 240))
        encoded = io.BytesIO()
        image.save(encoded, "PNG", icc_profile=b"not a colour profile; data channels have no colour space transform")
        with self.assertRaises(ValueError):
            self.library.prepare("colour.png", encoded.getvalue())
        normal = self.library.prepare("normal.png", encoded.getvalue(), role="normal")
        roughness = self.library.prepare("roughness.png", encoded.getvalue(), role="roughness")
        self.assertEqual(normal["token"], roughness["token"])
        self.assertNotEqual(self.library._cache(normal["token"], "normal"), self.library._cache(roughness["token"], "roughness"))
        with Image.open(self.library._cache(normal["token"], "normal") / "normal.png") as image:
            self.assertEqual((180, 110, 240), image.getpixel((0, 0)))


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
