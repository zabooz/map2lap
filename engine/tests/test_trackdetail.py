"""The normal ground-material workflow retains repeating detail maps through draft, Save and portable reload."""
import io
import base64
import json
from pathlib import Path
import shutil
import tempfile
import threading
import urllib.request
from http.server import ThreadingHTTPServer
import unittest
from unittest import mock

import numpy as np
from PIL import Image

import test_trackpaint as fixture
from app import materiallibrary, trackcopy, trackedits, trackview
from track import groundmaterial, kn5, surfaceindex


class DetailTest(unittest.TestCase):
    def setUp(self):
        selection = tempfile.TemporaryDirectory()
        self.addCleanup(selection.cleanup)
        patch = mock.patch.object(surfaceindex, "CACHE_ROOT", Path(selection.name))
        patch.start()
        self.addCleanup(patch.stop)
        fixture.PaintTest.setUp(self)
    material = fixture.PaintTest.material
    operation = fixture.PaintTest.operation
    keep = fixture.PaintTest.keep

    def detail_asset(self):
        pixels = np.zeros((128, 128, 3), np.uint8)
        pixels[:, ::2] = (230, 20, 30)
        pixels[:, 1::2] = (20, 180, 230)
        staged = materiallibrary.prepare("detail.png", fixture.png(pixels))
        return materiallibrary.add({"token": staged["token"], "filename": "detail.png", "name": "Fine detail",
                                    "category": "asphalt", "repeat": [2, 3]})["material"]["id"]

    def test_reapplying_a_after_b_moves_its_immutable_operation_to_the_end(self):
        first, second = self.detail_asset(), self.material((40, 180, 30))
        ids = []
        for asset in (first, second, first):
            now = trackedits.load(self.ac, self.name)
            answer = trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": now["revision"],
                                      "material": asset, "points": [{"mesh": 0, "u": .1, "v": -.5}]})
            ids = [p for p in ids if p != answer["paint"]] + [answer["paint"]]
            self.keep(ids)
        self.assertEqual(2, len(ids))
        self.assertEqual(ids, trackedits.load(self.ac, self.name)["paints"])

    def test_edit_can_override_variation_without_reimporting_or_changing_the_library(self):
        asset = self.detail_asset()
        first = trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": 0, "material": asset,
                                "variation": False, "points": [{"mesh": 0, "u": .1, "v": -.5}]})["paint"]
        layout = self.keep([first])["textures"][0]["layers"]
        self.assertFalse(layout["images"][0]["variation"])
        self.assertTrue(materiallibrary.get(asset)["variation"])
        materiallibrary.remove(asset)
        from app import trackdetail
        self.assertTrue(trackdetail.image(self.ac, self.name, layout["images"][0]["asset"]).startswith(b"DDS "))


    def test_mask_preparation_survives_a_restart_without_recalculating_weights(self):
        import importlib
        from app import trackdetail
        version = self.keep([self.operation(self.detail_asset())])["textures"][0]["version"]
        weights = trackdetail._cache(version, "weights").with_suffix(".png")
        self.assertTrue(weights.is_file())
        importlib.reload(trackdetail)
        with mock.patch.object(trackdetail, "_compute", side_effect=AssertionError("computed the mask twice")):
            self.assertTrue(trackdetail.mask(self.ac, self.name, version).startswith(b"DDS "))

    def test_transparent_ground_is_refused_before_retaining_any_paint_data(self):
        staged = materiallibrary.prepare("cutout.png", fixture.png(np.full((8, 8, 4), (100, 90, 80, 100), np.uint8)))
        asset = materiallibrary.add({"token": staged["token"], "filename": "cutout.png", "name": "Cutout",
                                    "category": "grass", "repeat": [2, 2]})["material"]["id"]
        with self.assertRaisesRegex(trackedits.Invalid, "opaque"):
            trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": 0, "material": asset,
                             "points": [{"mesh": 0, "u": .1, "v": -.5}]})
        self.assertFalse(Path(self.tmp.name, "out/paints").exists())
        self.assertFalse(Path(self.tmp.name, "out/paint-assets").exists())

    def test_inspector_reports_the_texture_at_the_clicked_area_without_baking_a_tile(self):
        from app import trackinspect, trackpaint
        op = self.operation(self.detail_asset())
        descriptor = self.keep([op])["textures"][0]
        with mock.patch.object(trackpaint, "texture", side_effect=AssertionError("baked a tile")):
            info = trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, descriptor["version"])
            original = trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision, descriptor["version"])
        self.assertEqual("Fine detail", info["name"])
        self.assertEqual([2, 3], info["repeat"])
        self.assertFalse(info["original"])
        self.assertIn("/paint-preview/", info["preview"])
        self.assertTrue(original["original"])
        self.assertTrue(trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision)["original"])
        trackcopy.save(self.ac, self.name, "inspector_copy", "Inspector")
        shutil.rmtree(Path(self.tmp.name, "library"))
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        copied = trackinspect.appearance(self.ac, "inspector_copy", 0, .1, -.5, self.revision, descriptor["version"])
        self.assertEqual("Fine detail", copied["name"])
        with Image.open(io.BytesIO(trackinspect.paint_preview(self.ac, "inspector_copy", descriptor["layers"]["images"][0]["asset"]))) as image:
            self.assertLessEqual(max(image.size), 256)
        with self.assertRaises(trackview.Unreadable):
            trackinspect.appearance(self.ac, self.name, 0, .1, -.5, "old", descriptor["version"])
        metadata = Path(self.ac, "content/tracks/inspector_copy/data/map2lap.json")
        metadata.write_text('{"title":"Portable"}', encoding="utf-8")
        revision = trackview.index(self.ac, "inspector_copy")["revision"]
        portable = trackinspect.appearance(self.ac, "inspector_copy", 0, .1, -.5, revision)
        self.assertEqual("Fine detail", portable["name"])
        self.assertEqual([2, 3], portable["repeat"])

    def test_variation_survives_save_and_reload_and_discard_restores_only_our_config(self):
        op = self.operation(self.detail_asset())
        descriptor = self.keep([op])["textures"][0]
        self.assertTrue(descriptor["layers"]["images"][0].get("variation"))
        extension = self.folder / "extension"
        extension.mkdir()
        original = "[WATER_FX]\nACTIVE = 1\n"
        (extension / "ext_config.ini").write_text(original, encoding="utf-8")
        trackcopy.save(self.ac, self.name)
        config = (extension / "map2lap_ground.ini").read_text(encoding="utf-8")
        self.assertIn("SHADER = ksMultilayer_objsp_nm4", config)
        self.assertIn("tilingFixR, 1", config)
        self.assertIn("tilingFixA, 0", config)
        self.assertIn(original, (extension / "ext_config.ini").read_text(encoding="utf-8"))
        trackcopy.save(self.ac, self.name)
        self.assertEqual(1, (extension / "ext_config.ini").read_text(encoding="utf-8").count("[INCLUDE: map2lap_ground.ini]"))
        self.keep([])
        trackcopy.save(self.ac, self.name)
        self.assertEqual(original, (extension / "ext_config.ini").read_text(encoding="utf-8"))
        self.assertFalse((extension / "map2lap_ground.ini").exists())

    def test_imported_material_variation_is_immutable_and_can_be_disabled(self):
        staged = materiallibrary.prepare("pattern.png", fixture.png(np.full((8, 8, 3), (100, 90, 80), np.uint8)))
        settings = {"token": staged["token"], "filename": "pattern.png", "name": "Pattern", "category": "asphalt", "repeat": [2, 2]}
        varied = materiallibrary.add({**settings, "variation": True})["material"]
        regular = materiallibrary.add({**settings, "variation": False})["material"]
        self.assertNotEqual(varied["id"], regular["id"])
        self.assertFalse(regular["variation"])
        layout = self.keep([self.operation(regular["id"])])["textures"][0]["layers"]
        self.assertFalse(layout["images"][0].get("variation"))

    def test_older_saved_paints_can_be_saved_again_to_upgrade_the_native_material(self):
        op = self.operation(self.detail_asset())
        self.keep([op])
        trackcopy.save(self.ac, self.name, "upgrade", "Upgrade")
        metadata = Path(self.ac, "content/tracks/upgrade/data/map2lap.json")
        info = json.loads(metadata.read_text(encoding="utf-8"))
        info["edits"].pop("detail_profile", None)
        metadata.write_text(json.dumps(info), encoding="utf-8")
        self.assertTrue(trackedits.load(self.ac, "upgrade")["saved"].get("needs_save"))
        self.assertGreater(trackedits.changes(self.ac, "upgrade"), 0)
        trackcopy.save(self.ac, "upgrade")
        self.assertFalse(trackedits.load(self.ac, "upgrade")["saved"].get("needs_save"))
        self.assertEqual(0, trackedits.changes(self.ac, "upgrade"))

    def test_apply_describes_a_separate_full_resolution_image_and_mask_without_compositing(self):
        from app import trackdetail, trackpaint
        op = self.operation(self.detail_asset())
        with mock.patch.object(trackpaint, "texture", side_effect=AssertionError("baked a tile")):
            answer = self.keep([op])
            index = trackview.index(self.ac, self.name)
        layer = answer["textures"][0]["layers"]
        self.assertEqual(0, layer["base"]["i"])
        self.assertEqual([0, 0], layer["origin"])
        self.assertEqual([128, 256 / 3], layer["images"][0]["scale"])
        self.assertEqual(layer, index["materials"][0]["splat"])
        self.assertTrue(layer["mask"]["linear"])
        asset = layer["images"][0]["asset"]
        with Image.open(io.BytesIO(trackdetail.image(self.ac, self.name, asset))) as photo:
            self.assertEqual((128, 128), photo.size)
        reset = self.keep([])
        self.assertTrue(all(not d.get("layers") and not d["version"] for d in reset["textures"]))
        restored = self.keep([op])
        self.assertEqual(layer, restored["textures"][0]["layers"])

    def test_mask_keeps_unselected_road_and_repainting_does_not_exhaust_the_palette(self):
        from app import trackdetail
        operations = [self.operation(self.material(c)) for c in [(200, 20, 30), (40, 190, 30), (40, 30, 180), (180, 140, 20)]]
        answer = self.keep(operations)
        layer = answer["textures"][0]["layers"]
        self.assertEqual(1, len(layer["images"]))
        with Image.open(io.BytesIO(trackdetail.mask(self.ac, self.name, answer["textures"][0]["version"]))) as encoded:
            values = np.array(encoded.convert("RGBA"))
        self.assertEqual(255, int(values[5, 5, 0]))
        self.assertEqual(0, int(values[5, 5, 3]))
        self.assertEqual(0, int(values[16, 16, 0]))
        self.assertEqual(255, int(values[16, 16, 3]))

    def test_same_colour_at_different_repeat_sizes_shares_one_embedded_image(self):
        first = self.operation(self.material((180, 30, 40), (2, 2)))
        second = self.operation(self.material((180, 30, 40), (3, 4)), .5, -.5)
        descriptor = self.keep([first, second])["textures"][0]
        images = descriptor["layers"]["images"]
        self.assertEqual(2, len(images))
        self.assertEqual(images[0]["key"], images[1]["key"])
        self.assertNotEqual(images[0]["scale"], images[1]["scale"])
        trackcopy.save(self.ac, self.name, "shared_copy", "Shared image")
        saved = kn5.read(str(Path(self.ac, "content/tracks/shared_copy/shared_copy.kn5")))
        self.assertEqual(1, sum(name == images[0]["name"] for name, _active, _raw in saved["textures"]))

    def test_portable_material_preserves_two_scales_of_the_same_image_when_painted_again(self):
        from app import trackpaint
        first = self.operation(self.material((180, 30, 40), (2, 2)))
        second = self.operation(self.material((180, 30, 40), (3, 4)), .5, -.5)
        self.keep([first, second])
        trackcopy.save(self.ac, self.name, "portable", "Portable")
        folder = Path(self.ac, "content/tracks/portable")
        (folder / "data/map2lap.json").write_text('{"title":"portable"}', encoding="utf-8")
        revision = trackview.index(self.ac, "portable")["revision"]
        selected = np.zeros((32, 32), np.uint8); selected[:8, :8] = 255
        chosen = {"material": "gc_meadow", "truncated": False}
        merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(selected)).decode()}]}
        with mock.patch.object(trackview, "surface", return_value=chosen), mock.patch.object(surfaceindex, "merge", return_value=merged):
            op = trackpaint.create(self.ac, "portable", revision, self.material((20, 30, 200)), [{"mesh": 0, "u": .1, "v": -.5}])
        descriptors = trackpaint.descriptors(self.ac, "portable", revision, [op])
        source_images = [p for p in descriptors[0]["layers"]["images"] if "i" in p]
        self.assertEqual(2, len(source_images))
        self.assertEqual(source_images[0]["i"], source_images[1]["i"])
        self.assertNotEqual(source_images[0]["scale"], source_images[1]["scale"])

    def test_exceeding_shader_slots_is_refused_before_writing_the_draft(self):
        from app import trackpaint
        operations = []
        for i in range(4):
            mask = np.zeros((32, 32), np.uint8)
            mask[i * 8:(i + 1) * 8] = 255
            chosen = {"material": "gc_meadow", "truncated": False}
            merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            with mock.patch.object(trackview, "surface", return_value=chosen), mock.patch.object(surfaceindex, "merge", return_value=merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + 40 * i, 30, 40)),
                                                   [{"mesh": 0, "u": .1, "v": -.5}]))
        self.keep(operations[:3])
        before = trackedits.load(self.ac, self.name)["revision"]
        with self.assertRaisesRegex(trackedits.Invalid, "three replacement"):
            self.keep(operations)
        self.assertEqual(before, trackedits.load(self.ac, self.name)["revision"])

    def test_a_copy_rebinds_immutable_resource_urls_to_its_own_name(self):
        from app import trackdetail
        op = self.operation(self.detail_asset())
        version = self.keep([op])["textures"][0]["version"]
        trackcopy.save(self.ac, self.name, "portable_copy", "Portable")
        shutil.rmtree(self.folder)
        descriptor = trackdetail.describe(self.ac, "portable_copy", version)
        self.assertIn("/portable_copy/", descriptor["mask"]["url"])
        self.assertIn("/portable_copy/", descriptor["images"][0]["url"])
        self.assertTrue(trackdetail.mask(self.ac, "portable_copy", version).startswith(b"DDS "))

    def test_full_resolution_image_and_mask_are_available_over_the_editor_http_api(self):
        import server
        from app import settings
        op = self.operation(self.detail_asset())
        layout = self.keep([op])["textures"][0]["layers"]
        http = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=http.serve_forever, daemon=True).start()
        self.addCleanup(http.server_close)
        self.addCleanup(http.shutdown)
        origin = f"http://127.0.0.1:{http.server_address[1]}"
        with mock.patch.object(settings, "ac_path", return_value=self.ac):
            for ref in [layout["mask"], *layout["images"]]:
                with urllib.request.urlopen(origin + ref["url"]) as answer:
                    raw = answer.read()
                    self.assertEqual(200, answer.status)
                    self.assertEqual(b"DDS ", raw[:4])
                    self.assertEqual(ref["size"], len(raw))
            with urllib.request.urlopen(origin + f"/api/editor/{self.name}/appearance?mesh=0&u=.1&v=-.5&r={self.revision}&p={layout['mask']['key']}") as answer:
                info = json.load(answer)
                self.assertEqual("Fine detail", info["name"])
            with urllib.request.urlopen(origin + info["preview"]) as answer:
                self.assertEqual("image/png", answer.headers["Content-Type"])
                self.assertTrue(answer.read().startswith(b"\x89PNG"))

    def test_save_keeps_original_tiles_and_embeds_shared_detail_and_mask_in_native_materials(self):
        op = self.operation(self.detail_asset())
        self.keep([op])
        before = kn5.read(str(self.path))
        trackcopy.save(self.ac, self.name, "detail_copy", "Detail copy")
        copied = Path(self.ac, "content/tracks/detail_copy/detail_copy.kn5")
        saved = kn5.read(str(copied))
        textures = {name: raw for name, _active, raw in saved["textures"]}
        for name, _active, raw in before["textures"]:
            self.assertEqual(raw, textures[name])
        self.assertEqual("ksMultilayer_objsp", saved["materials"][0].shader)
        maps = {slot: name for slot, _i, name in saved["materials"][0].maps}
        self.assertEqual(groundmaterial.WHITE, maps["txDiffuse"])
        self.assertEqual("ground_0_0.png", maps["txDetailA"])
        with Image.open(io.BytesIO(textures[maps["txDetailR"]])) as photo:
            self.assertEqual((128, 128), photo.size)
        for a, b in zip(before["root"].children, saved["root"].children):
            np.testing.assert_array_equal(a.vertices["pos"], b.vertices["pos"])
            np.testing.assert_array_equal(a.indices, b.indices)
        np.testing.assert_array_equal(before["root"].children[1].vertices["uv"] + (1, 0), saved["root"].children[1].vertices["uv"])
        shutil.rmtree(Path(self.tmp.name, "library"))
        shutil.rmtree(Path(self.tmp.name, "cache"), ignore_errors=True)
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        shutil.rmtree(Path(self.tmp.name, "out/paints"))
        self.assertEqual([op], trackedits.load(self.ac, "detail_copy")["paints"])
        index = trackview.index(self.ac, "detail_copy")
        self.assertTrue(index["materials"][0].get("splat"))
        self.assertFalse(index["paint_errors"])
        # Copying without the local source cache still preserves a native material and usable surface selection.
        (copied.parent / "data/map2lap.json").write_text('{"title":"portable"}', encoding="utf-8")
        portable = trackview.index(self.ac, "detail_copy")
        self.assertTrue(portable["materials"][0].get("splat"))
        self.assertTrue(portable["materials"][0]["splat"]["images"][0]["variation"])
        trackview.prepare_surface(self.ac, "detail_copy", 1, portable["revision"])
        selected = trackview.surface(self.ac, "detail_copy", 1, 1.1, -.5, portable["revision"])
        self.assertEqual("gc_meadow", selected["material"])


if __name__ == "__main__":
    unittest.main()
