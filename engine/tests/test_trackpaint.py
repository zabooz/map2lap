"""Grass appearance uses immutable masks and assets, one calculation for the Editor and saved kn5."""
import io
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import materiallibrary, mytracks, trackcopy, trackedits, trackview
from track import editorinfo, kn5

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)


def png(array):
    output = io.BytesIO()
    Image.fromarray(np.asarray(array, np.uint8)).save(output, "PNG")
    return output.getvalue()


class PaintTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.ac, self.name = self.tmp.name, "grass"
        for module in (mytracks, materiallibrary):
            patch = mock.patch.object(module, "ROOT", self.tmp.name)
            patch.start()
            self.addCleanup(patch.stop)
        self.folder = Path(self.ac, "content/tracks/grass")
        self.folder.mkdir(parents=True)
        (self.folder / "data").mkdir()
        mytracks.save(str(self.folder), {"title": "Grass", "points": [[1, 2], [3, 4]], "width": 100})
        self.path = self.folder / "grass.kn5"
        root = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        textures, materials, parts = [], [], []
        self.alpha = np.zeros((32, 32), np.uint8)
        self.alpha[12:20, 12:20] = 255
        self.alpha[11, 12:20] = 128
        for tx in (0, 1):
            image = np.full((32, 32, 3), (30, 150, 40), np.uint8)
            if tx == 0:
                a = self.alpha[..., None].astype(np.float32) / 255
                image = np.rint(image * (1 - a) + np.array([80, 80, 80]) * a).astype(np.uint8)
            textures.append((f"ground_{tx}_0.png", png(image)))
            materials.append(kn5.Material(f"ground_{tx}_0", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, textures[-1][0])]))
            vertices = np.zeros(3, kn5.VERTEX)
            vertices["pos"] = [(tx * 256, 0, 0), ((tx + 1) * 256, 0, 0), (tx * 256, 0, -256)]
            root.children.append(kn5.Node(2, f"1GRASS_ground_{tx}_0", 1, vertices=vertices, indices=np.array([0, 2, 1], "<u2"), material=tx,
                                          bs_center=(tx * 256 + 128, 0, -128), bs_radius=200))
            part = str(self.folder / f"t_{tx}_0.obj")
            paint = editorinfo.Paint(part, tx, 0, 32)
            paint.base(["gc_meadow"], np.zeros((32, 32), np.uint8))
            if tx == 0:
                paint.layer("road_asphalt", self.alpha)
            paint.finish()
            parts.append(part)
        kn5.write(str(self.path), textures, materials, root)
        editorinfo.install(str(self.path), parts)
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for i in (0, 1):
            trackview.prepare_surface(self.ac, self.name, i, self.revision)

    def material(self, colour, repeat=(2, 2)):
        prepared = materiallibrary.prepare("grass.png", png(np.full((4, 4, 3), colour, np.uint8)))
        return materiallibrary.add({"token": prepared["token"], "filename": "grass.png", "name": "Grass",
                                   "category": "grass", "repeat": list(repeat)})["material"]["id"]

    def operation(self, asset, u=0.1, v=-0.5):
        from app import trackpaint
        return trackpaint.create(self.ac, self.name, self.revision, asset,
                                 [{"mesh": 0, "u": u, "v": v, "whole": False}])

    def image(self, paints, i=0):
        from app import trackpaint
        descriptors = trackpaint.descriptors(self.ac, self.name, self.revision, paints)
        descriptor = next(d for d in descriptors if d["i"] == i)
        data = trackpaint.texture(self.ac, self.name, i, self.revision, descriptor["version"])
        with Image.open(io.BytesIO(data)) as image:
            return np.array(image.convert("RGB")), descriptor

    def keep(self, paints):
        now = trackedits.load(self.ac, self.name)
        return trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "paint",
                                      "deleted": [], "paints": paints})

    def test_material_snapshot_and_saved_copy_keep_originals_and_all_maps_without_the_library(self):
        from app import trackpaint
        raw_colour = png(np.full((8, 8, 3), (120, 100, 70), np.uint8))
        raw_normal = png(np.full((8, 8, 3), (160, 120, 245), np.uint8))
        raw_roughness = png(np.full((8, 8), 79, np.uint8))
        colour = materiallibrary.prepare("colour.png", raw_colour)
        normal = materiallibrary.prepare("normal.png", raw_normal, role="normal")
        roughness = materiallibrary.prepare("roughness.png", raw_roughness, role="roughness")
        asset = materiallibrary.add({"token": colour["token"], "filename": "colour.png", "name": "Ground",
                                     "category": "soil", "repeat": [2, 3], "tags": ["retained"], "license": "CC0",
                                     "maps": {"normal": {"token": normal["token"], "filename": "normal.png"},
                                              "roughness": {"token": roughness["token"], "filename": "roughness.png"}}})["material"]
        op = self.operation(asset["id"])
        folder, record = trackpaint.operation(self.ac, self.name, op)
        retained = trackpaint._resolve(self.ac, self.name, "materials", record["asset"])
        meta = trackpaint._verified(retained / "asset.json", record["asset"])
        self.assertEqual(asset, meta["original"])
        self.assertEqual({"colour", "normal", "roughness"}, set(meta["maps"]))
        for role, raw in (("colour", raw_colour), ("normal", raw_normal), ("roughness", raw_roughness)):
            self.assertEqual(raw, (retained / asset["maps"][role]["file"]).read_bytes())
            self.assertTrue((retained / meta["maps"][role]["file"]).is_file())
        self.keep([op])
        expected_size = trackpaint.bundle_size(self.ac, self.name, [op])
        trackcopy.save(self.ac, self.name, "portable_maps", "Portable maps")
        saved = Path(self.ac, "content/tracks/portable_maps") / trackpaint.BUNDLE
        self.assertEqual(expected_size, sum(path.stat().st_size for path in saved.rglob("*") if path.is_file()))
        shutil.rmtree(Path(self.tmp.name, "library"))
        shutil.rmtree(Path(self.tmp.name, "cache"), ignore_errors=True)
        shutil.rmtree(Path(self.tmp.name, "out/paints"))
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        trackpaint.validate(self.ac, "portable_maps", self.revision, [op])
        normal_path = saved / "materials" / record["asset"] / "normal.png"
        normal_path.write_bytes(b"damaged data")
        with self.assertRaisesRegex(ValueError, "changed"):
            trackpaint.validate(self.ac, "portable_maps", self.revision, [op])

    def test_grass_changes_across_tiles_while_roads_keep_their_pixels_and_edges_stay_soft(self):
        asset = self.material((200, 30, 40))
        operation = self.operation(asset)
        image, _d = self.image([operation])
        self.assertEqual([200, 30, 40], image[5, 5].tolist())
        self.assertEqual([80, 80, 80], image[16, 16].tolist())
        self.assertTrue(80 < image[11, 15, 0] < 200)
        neighbour, _d = self.image([operation], 1)
        self.assertEqual([200, 30, 40], neighbour[5, 5].tolist())
        original = trackview.texture_bytes(self.ac, self.name, 0, self.revision)[1]
        with Image.open(io.BytesIO(original)) as source:
            self.assertEqual((30, 150, 40), source.getpixel((5, 5)))

    def test_replacing_twice_uses_the_latest_material_without_accumulating_old_colour(self):
        first = self.operation(self.material((200, 30, 40)))
        second = self.operation(self.material((30, 40, 200)))
        both, _ = self.image([first, second])
        only, _ = self.image([second])
        self.assertTrue(np.array_equal(both, only))

    def test_texture_versions_survive_unrelated_draft_changes_and_cache_clears(self):
        operation = self.operation(self.material((200, 30, 40)))
        self.keep([operation])
        image, descriptor = self.image([operation])
        now = trackedits.load(self.ac, self.name)
        trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "again", "deleted": []})
        shutil.rmtree(Path(self.tmp.name, "cache"))
        from app import trackpaint
        with Image.open(io.BytesIO(trackpaint.texture(self.ac, self.name, 0, self.revision, descriptor["version"]))) as rebuilt:
            self.assertTrue(np.array_equal(image, np.array(rebuilt.convert("RGB"))))

    def test_a_retried_draft_returns_the_texture_versions_even_when_its_first_answer_was_lost(self):
        operation = self.operation(self.material((200, 30, 40)))
        now = trackedits.load(self.ac, self.name)
        body = {"base": now["base"], "revision": now["revision"], "id": "lost", "deleted": [], "paints": [operation]}
        first = trackedits.save_telling(self.ac, self.name, body)
        retry = trackedits.save_telling(self.ac, self.name, {**body, "id": "retry", "unanswered": ["lost"]})
        self.assertEqual(first["textures"], retry["textures"])

    def test_save_copy_and_discard_survive_library_removal_and_keep_the_original_geometry(self):
        asset = self.material((200, 30, 40))
        operation = self.operation(asset)
        self.keep([operation])
        before = kn5.read(str(self.path))
        shutil.rmtree(Path(self.tmp.name, "library"))
        trackcopy.save(self.ac, self.name, "grass_copy", "Grass copy")
        copied = Path(self.ac, "content/tracks/grass_copy/grass_copy.kn5")
        after = kn5.read(str(copied))
        self.assertEqual(before["root"].children[0].vertices.tobytes(), after["root"].children[0].vertices.tobytes())
        self.assertEqual("1GRASS_ground_0_0", after["root"].children[0].name)
        with Image.open(io.BytesIO(after["textures"][0][2])) as image:
            self.assertEqual((30, 150, 40), image.getpixel((5, 5)))  # The original tile is retained as the native base layer.
        saved_maps = {slot: name for slot, _index, name in after["materials"][0].maps}
        colour = next(raw for name, _active, raw in after["textures"] if name == saved_maps["txDetailR"])
        with Image.open(io.BytesIO(colour)) as image:
            self.assertLess(max(abs(a - b) for a, b in zip(image.convert("RGB").getpixel((0, 0)), (200, 30, 40))), 9)
        shutil.rmtree(Path(self.tmp.name, "out/paints"))
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        shutil.rmtree(Path(self.tmp.name, "cache"), ignore_errors=True)
        self.assertEqual([operation], trackedits.load(self.ac, "grass_copy")["paints"])
        manifest = trackview.index(self.ac, "grass_copy")
        self.assertTrue(manifest["textures"][0]["version"])
        now = trackedits.load(self.ac, "grass_copy")
        trackedits.save(self.ac, "grass_copy", {"base": now["base"], "revision": now["revision"], "id": "discard", "deleted": [], "paints": []})
        trackcopy.save(self.ac, "grass_copy")
        with Image.open(io.BytesIO(kn5.read(str(copied))["textures"][0][2])) as image:
            self.assertEqual((30, 150, 40), image.getpixel((5, 5)))

    def test_road_material_changes_leave_the_driving_surface_and_other_pixels_alone(self):
        operation = self.operation(self.material((200, 30, 40)), 0.5, -0.5)
        image, _ = self.image([operation])
        self.assertEqual([200, 30, 40], image[16, 16].tolist())
        self.assertEqual([30, 150, 40], image[5, 5].tolist())
        self.keep([operation])
        trackcopy.save(self.ac, self.name, "road_copy", "Road copy")
        copied = kn5.read(str(Path(self.ac, "content/tracks/road_copy/road_copy.kn5")))
        self.assertEqual("1GRASS_ground_0_0", copied["root"].children[0].name)

    def test_all_recorded_ground_materials_can_be_replaced(self):
        from app import trackpaint
        asset = self.material((200, 30, 40))
        for material in ("gc_shrub", "gc_rock", "gc_forest", "gc_field3", "gc_dirt", "road_gravel", "stream_bank", "pitch_line"):
            with self.subTest(material=material):
                part = str(self.folder / "t_0_0.obj")
                paint = editorinfo.Paint(part, 0, 0, 32)
                paint.base([material], np.zeros((32, 32), np.uint8))
                paint.finish()
                editorinfo.install(str(self.path), [part])
                operation = self.operation(asset)
                image, _ = self.image([operation])
                self.assertEqual([200, 30, 40], image[5, 5].tolist())
                self.assertEqual(material, trackpaint.operation(self.ac, self.name, operation)[1]["tiles"][0]["masks"][0]["material"])

    def test_draft_and_index_do_not_render_tiles_even_with_an_empty_texture_cache(self):
        from app import trackpaint
        operation = self.operation(self.material((200, 30, 40)))
        with mock.patch.object(trackpaint, "texture", side_effect=AssertionError("rendered before a texture request")):
            answer = self.keep([operation])
            manifest = trackview.index(self.ac, self.name)
        self.assertEqual(answer["textures"][0]["version"], manifest["textures"][0]["version"])
        self.assertGreater(answer["textures"][0]["size"], 0)

    def test_missing_material_is_refused_before_the_draft_is_written_and_index_can_recover(self):
        operation = self.operation(self.material((200, 30, 40)))
        before = trackedits.load(self.ac, self.name)
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        with self.assertRaises(trackedits.Invalid):
            self.keep([operation])
        self.assertEqual(before["revision"], trackedits.load(self.ac, self.name)["revision"])

    def test_a_missing_saved_material_keeps_the_track_openable_and_discardable(self):
        operation = self.operation(self.material((200, 30, 40)))
        self.keep([operation])
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        manifest = trackview.index(self.ac, self.name)
        self.assertTrue(manifest["paint_errors"])
        self.assertFalse(manifest["textures"][0].get("version"))
        self.keep([])
        self.assertEqual([], trackedits.load(self.ac, self.name)["paints"])

    def test_a_failed_version_manifest_write_does_not_commit_the_draft(self):
        from app import trackpaint
        operation = self.operation(self.material((200, 30, 40)))
        before = trackedits.load(self.ac, self.name)
        with mock.patch.object(trackpaint, "_atomic", side_effect=OSError("disk full")):
            with self.assertRaises(OSError):
                self.keep([operation])
        self.assertEqual(before["revision"], trackedits.load(self.ac, self.name)["revision"])

    def test_cached_texture_reads_do_not_wait_for_another_render(self):
        from app import trackpaint
        operation = self.operation(self.material((200, 30, 40)))
        _image, descriptor = self.image([operation])
        with mock.patch.object(trackpaint, "_rendering") as lock:
            self.assertTrue(trackpaint.texture(self.ac, self.name, 0, self.revision, descriptor["version"]))
            lock.__enter__.assert_not_called()

    def test_outdated_selections_cannot_create_edits(self):
        from app import trackpaint
        asset = self.material((200, 30, 40))
        with self.assertRaises(trackview.Unreadable):
            trackpaint.create(self.ac, self.name, "old", asset, [{"mesh": 0, "u": 0.1, "v": -0.5}])


if __name__ == "__main__":
    unittest.main()
