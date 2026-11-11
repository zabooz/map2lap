"""Texture settings per application: maps on or off, normal strength and roughness toward smooth or matte, retained in the
applied snapshot so the Editor and Save read one description, and changeable after Apply without touching other uses."""
import io
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest import mock

import numpy as np
from PIL import Image

import test_ground_guard_editor as guarded
import test_trackpaint as fixture
from app import materiallibrary, trackcopy, trackdetail, trackedits, trackinspect, tracknative, trackpaint, trackview
from track import surfaceindex


def meta(maps=("normal", "roughness"), look=None, properties=None):
    """A snapshot description with these data maps. Pure."""
    record = {"maps": {"colour": {}, **{role: {"file": role + ".png", "sha256": role} for role in maps}}}
    if look:
        record["look"] = look
    if properties:
        record["properties"] = properties
    return record


class LookTest(unittest.TestCase):
    def test_the_default_keeps_the_library_properties_and_maps_exactly(self):
        for properties in (None, {"roughness": .4, "normal_scale": 2.}):
            with self.subTest(properties=properties):
                described = meta(properties=properties)
                self.assertEqual(materiallibrary.properties(described), trackpaint.rendered(described))
                self.assertEqual({"normal", "roughness"}, set(trackpaint.data_maps(described)))

    def test_matte_lifts_even_a_black_roughness_map_and_full_matte_is_rough_everywhere(self):
        for shift, black, white in ((.5, .5, .6), (1., 1., 1.)):
            with self.subTest(shift=shift):
                properties = trackpaint.rendered(meta(look={**trackpaint.LOOK, "roughness_shift": shift}, properties={"roughness": .2}))
                self.assertAlmostEqual(black, properties["roughness_offset"])
                self.assertAlmostEqual(white, properties["roughness_offset"] + properties["roughness"])

    def test_smoother_scales_toward_zero_and_strength_scales_the_normals(self):
        look = {**trackpaint.LOOK, "roughness_shift": -.25, "normal_strength": .5}
        properties = trackpaint.rendered(meta(look=look, properties={"roughness": .8, "normal_scale": 2.}))
        self.assertAlmostEqual(.6, properties["roughness"])
        self.assertEqual(0., properties.get("roughness_offset", 0.))
        self.assertAlmostEqual(1., properties["normal_scale"])

    def test_a_switched_off_map_is_left_out_but_kept_in_the_snapshot(self):
        described = meta(look={**trackpaint.LOOK, "normal": False})
        self.assertEqual({"roughness"}, set(trackpaint.data_maps(described)))
        self.assertIn("normal", described["maps"])
        described = meta(look={**trackpaint.LOOK, "roughness_map": False})
        self.assertEqual({"normal"}, set(trackpaint.data_maps(described)))

    def test_settings_are_checked_and_switches_of_missing_maps_mean_nothing(self):
        for value in ({"roughness_shift": 1.5}, {"roughness_shift": float("nan")}, {"normal_strength": -.1},
                      {"normal_strength": 1.1}, {"normal": 1}, {"colour": False}, [], {"roughness_shift": True}):
            with self.subTest(value=value), self.assertRaises(ValueError):
                trackpaint.look(value, {"normal", "roughness"})
        self.assertEqual(trackpaint.LOOK, trackpaint.look({"normal": False, "normal_strength": .3, "roughness_map": False}, set()))
        self.assertEqual(trackpaint.LOOK, trackpaint.look(None, {"normal"}))
        self.assertEqual(.333, trackpaint.look({"roughness_shift": 1 / 3}, set())["roughness_shift"])


class ApplicationTest(unittest.TestCase):
    def setUp(self):
        selection = tempfile.TemporaryDirectory()
        self.addCleanup(selection.cleanup)
        patch = mock.patch.object(surfaceindex, "CACHE_ROOT", Path(selection.name))
        patch.start()
        self.addCleanup(patch.stop)
        fixture.PaintTest.setUp(self)

    keep = fixture.PaintTest.keep
    build = guarded.GuardedSaveTest.build

    def pbr_material(self):
        colour = materiallibrary.prepare("colour.png", fixture.png(np.full((16, 16, 3), 130, np.uint8)))
        normal = materiallibrary.prepare("normal.png", fixture.png(np.full((16, 16, 3), (170, 205, 224), np.uint8)), role="normal")
        rough = materiallibrary.prepare("rough.png", fixture.png(np.full((16, 16), 10, np.uint8)), role="roughness")
        return materiallibrary.add({"token": colour["token"], "filename": "colour.png", "name": "Shiny grass",
                                    "category": "grass", "repeat": [2, 2], "variation": False,
                                    "maps": {"normal": {"token": normal["token"], "filename": "normal.png"},
                                             "roughness": {"token": rough["token"], "filename": "rough.png"}}})["material"]["id"]

    def apply(self, material, u=.1, look=None):
        return trackpaint.create(self.ac, self.name, self.revision, material, [{"mesh": 0, "u": u, "v": -.5, "whole": False}], look=look)

    def snapshot(self, op):
        _folder, record = trackpaint.operation(self.ac, self.name, op)
        folder = trackpaint._resolve(self.ac, self.name, "materials", record["asset"])
        return record, trackpaint._verified(folder / "asset.json", record["asset"])

    def files(self, folder):
        return {path.relative_to(folder).as_posix(): path.read_bytes() for path in folder.rglob("*") if path.is_file()}

    def test_apply_keeps_the_default_snapshot_and_retains_chosen_settings(self):
        material = self.pbr_material()
        plain = self.apply(material)
        self.assertEqual(plain, self.apply(material, look=dict(trackpaint.LOOK)))
        self.assertNotIn("look", self.snapshot(plain)[1])
        matte = self.apply(material, look={"roughness_shift": .5})
        self.assertEqual(.5, self.snapshot(matte)[1]["look"]["roughness_shift"])
        with self.assertRaisesRegex(ValueError, "settings"):
            self.apply(material, look={"roughness_shift": 2})

    def test_restyle_copies_one_application_and_leaves_its_original_and_the_library_alone(self):
        material = self.pbr_material()
        library = self.files(Path(self.tmp.name, "library", "materials", material))
        first, other = self.apply(material), self.apply(material, u=.9)
        record, before = self.snapshot(first)
        original = self.files(trackpaint._resolve(self.ac, self.name, "operations", first))
        matte = trackpaint.restyle(self.ac, self.name, self.revision, first, {"roughness_shift": .5, "normal": False})
        self.assertNotEqual(first, matte)
        copied, after = self.snapshot(matte)
        self.assertEqual(record["tiles"], copied["tiles"])
        self.assertEqual({**before, "look": {**trackpaint.LOOK, "roughness_shift": .5, "normal": False}}, after)
        masks = {name: raw for name, raw in original.items() if name != "paint.json"}
        self.assertEqual(masks, {n: r for n, r in self.files(trackpaint._resolve(self.ac, self.name, "operations", matte)).items()
                                 if n != "paint.json"})
        self.assertEqual(original, self.files(trackpaint._resolve(self.ac, self.name, "operations", first)))
        self.assertEqual(before, self.snapshot(first)[1])
        self.assertNotIn("look", self.snapshot(other)[1])
        self.assertEqual(library, self.files(Path(self.tmp.name, "library", "materials", material)))
        self.assertEqual(first, trackpaint.restyle(self.ac, self.name, self.revision, matte, None), "back to default is the original")

    def test_switched_off_maps_and_matte_reach_the_editor_and_the_saved_kn5(self):
        self.build(0)                       # (one quad over the whole tile, as regional Save needs: test_native_save)
        self.revision = trackview.index(self.ac, self.name)["revision"]
        trackview.prepare_surface(self.ac, self.name, 0, self.revision)
        op = trackpaint.restyle(self.ac, self.name, self.revision, self.apply(self.pbr_material()),
                                {"roughness_shift": .5, "normal": False})
        ref = self.keep([op])["textures"][0]["layers"]["images"][0]
        self.assertEqual({"normal_scale": 1., "roughness": .5, "roughness_offset": .5}, ref["properties"])
        with Image.open(io.BytesIO(trackdetail.detail_image(self.ac, self.name, ref["asset"]))) as packed:
            self.assertEqual((128, 128, 255, 10), packed.getpixel((3, 3)))      # (flat normal; the roughness map kept)
        trackcopy.save(self.ac, self.name, "matte", "Matte")
        saved = trackview.index(self.ac, "matte")
        self.assertFalse(saved["paint_errors"])
        from track import kn5
        native = kn5.read(str(Path(self.ac, "content/tracks/matte/matte.kn5")))
        payloads = {key: raw for key, _active, raw in native["textures"]}
        rough = []
        for material in native["materials"]:
            maps = {slot: name for slot, _index, name in material.maps}
            for channel in "RGBA":
                if "txNormal" + channel in maps and maps["txNormal" + channel] in payloads:
                    with Image.open(io.BytesIO(payloads[maps["txNormal" + channel]])) as image:
                        pixel = image.convert("RGBA").getpixel((0, 0))
                    if pixel[3] not in (221, 255):
                        rough.append(pixel)
        self.assertIn((127, 128, 0, round((.5 + .5 * 10 / 255) * 255)), rough)

    def test_a_restyled_application_survives_undo_save_and_a_portable_reopen(self):
        first = self.apply(self.pbr_material())
        self.keep([first])
        matte = trackpaint.restyle(self.ac, self.name, self.revision, first, {"roughness_shift": 1.})
        self.keep([matte])
        self.keep([first])                                  # (Undo puts the original back)
        self.keep([matte])
        trackcopy.save(self.ac, self.name, "portable_look", "Portable look")
        for relative in ("library", "cache", "out/paint-assets", "out/paints", "out/paint-views"):
            shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
        self.assertEqual([matte], trackedits.load(self.ac, "portable_look")["paints"])
        index = trackview.index(self.ac, "portable_look")
        self.assertFalse(index["paint_errors"])
        refs = [ref for material in index["materials"] for ref in (material.get("splat") or {}).get("images", []) if "asset" in ref]
        self.assertTrue(refs)
        self.assertTrue(all(ref["properties"]["roughness_offset"] == 1. for ref in refs))

    def test_the_page_restyles_only_an_edit_of_its_current_draft(self):
        first = self.apply(self.pbr_material())
        self.keep([first])
        now = trackedits.load(self.ac, self.name)
        body = {"base": now["base"], "revision": now["revision"], "paint": first, "look": {"normal_strength": .5}}
        matte = trackedits.restyle(self.ac, self.name, body)["paint"]
        self.assertEqual(.5, trackpaint.look_of(self.snapshot(matte)[1])["normal_strength"])
        with self.assertRaises(trackedits.Conflict):
            trackedits.restyle(self.ac, self.name, {**body, "revision": "old"})
        with self.assertRaisesRegex(trackedits.Invalid, "no longer"):
            trackedits.restyle(self.ac, self.name, {**body, "paint": matte})
        with self.assertRaisesRegex(trackedits.Invalid, "settings"):
            trackedits.restyle(self.ac, self.name, {**body, "look": {"normal_strength": 3}})

    def test_settings_back_to_an_application_already_in_the_draft_are_one_edit(self):
        material = self.pbr_material()
        first = self.apply(material)
        matte = self.apply(material, look={"roughness_shift": 1.})     # (the same area: it equals first but for its settings)
        self.keep([first, matte])
        now = trackedits.load(self.ac, self.name)
        body = {"base": now["base"], "revision": now["revision"], "paint": matte, "look": None}
        self.assertEqual(first, trackedits.restyle(self.ac, self.name, body)["paint"])

    def test_an_application_adopted_by_a_saved_copy_can_be_restyled_there(self):
        first = self.apply(self.pbr_material())
        self.keep([first])
        trackcopy.save(self.ac, self.name, "adopted", "Adopted")
        now = trackedits.load(self.ac, "adopted")
        matte = trackpaint.restyle(self.ac, "adopted", now["base"], first, {"roughness_shift": .5})
        answer = trackedits.save_telling(self.ac, "adopted", {"base": now["base"], "revision": now["revision"], "id": "look",
                                                              "deleted": [], "paints": [matte]})
        refs = answer["textures"][0]["layers"]["images"]
        self.assertTrue(any(ref.get("properties", {}).get("roughness_offset") == .5 for ref in refs))
        trackcopy.save(self.ac, "adopted")
        self.assertFalse(trackview.index(self.ac, "adopted")["paint_errors"])

    def test_the_inspector_names_the_application_under_the_point_and_its_settings(self):
        material = self.pbr_material()
        meadow, road = self.apply(material), self.apply(material, u=.5)      # (one snapshot: the masks tell them apart)
        version = self.keep([meadow])["textures"][0]["version"]
        self.assertNotIn("paint", trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision, version))
        version = self.keep([meadow, road])["textures"][0]["version"]
        self.assertEqual(meadow, trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, version)["paint"])
        self.assertEqual(road, trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision, version)["paint"])
        matte = trackpaint.restyle(self.ac, self.name, self.revision, road, {"roughness_shift": .5})
        version = self.keep([meadow, matte])["textures"][0]["version"]
        left = trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, version)
        right = trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision, version)
        self.assertEqual((meadow, matte), (left["paint"], right["paint"]))
        self.assertEqual(trackpaint.LOOK, left["look"])
        self.assertEqual(.5, right["look"]["roughness_shift"])
        self.assertEqual({"normal": True, "roughness": True}, right["maps"])
        self.assertFalse(right["rectangular"])


class VariationShownTest(unittest.TestCase):
    setUp = ApplicationTest.setUp
    keep = fixture.PaintTest.keep
    material = fixture.PaintTest.material

    def test_the_inspector_shows_repetition_variation_only_where_it_works(self):
        for repeat, shown in (((2, 2), False), ((2, 3), True)):
            with self.subTest(repeat=repeat):
                op = trackpaint.create(self.ac, self.name, self.revision, self.material((200, 30, 40), repeat),
                                       [{"mesh": 0, "u": .1, "v": -.5}], variation=True)
                version = self.keep([op])["textures"][0]["version"]
                self.assertIs(shown, trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, version)["variation"])


class PackingTest(unittest.TestCase):
    def test_the_roughness_offset_reaches_the_pbr_data_the_legacy_gloss_and_the_cache_key(self):
        data = np.full((4, 4, 4), [128, 128, 255, 0], np.uint8)
        ref = {"id": "asset:a", "asset": "a", "detail": {"key": "k"}, "properties": {"normal_scale": 1., "roughness": .5,
                                                                                     "roughness_offset": .5}}
        with Image.open(io.BytesIO(tracknative._photo_normals(data, ref, pbr=True))) as image:
            self.assertEqual(128, image.getpixel((0, 0))[3])
        from track import kn5
        material = kn5.Material("ground", "ksPerPixel", 0, 0, 0, [], [])
        raw = fixture.png(np.full((8, 8, 3), 90, np.uint8))
        legacy = tracknative._photo_colour(raw, ref, material, (0, 0), 34, lambda: data)
        with Image.open(io.BytesIO(legacy)) as image:
            self.assertLessEqual(abs(image.convert("RGBA").getpixel((0, 0))[3] - 127), 2)
        plain = {**ref, "properties": {"normal_scale": 1., "roughness": .5}}
        self.assertNotEqual(tracknative._photo_key(raw, ref, material, (0, 0), 34, pbr=True),
                            tracknative._photo_key(raw, plain, material, (0, 0), 34, pbr=True))

    def test_a_colour_only_material_made_matte_or_smooth_needs_the_native_layout(self):
        self.assertFalse(trackdetail._native({"images": [{"properties": {"roughness": 1., "normal_scale": 1.}}]}))
        self.assertTrue(trackdetail._native({"images": [{"properties": {"roughness": .5, "normal_scale": 1.}}]}))
        self.assertFalse(trackdetail._native({"images": [{"properties": {"roughness": .5, "roughness_offset": .5}}]}))
        self.assertTrue(trackdetail._native({"images": [{"properties": {"roughness": 0., "roughness_offset": .5}}]}))


if __name__ == "__main__":
    unittest.main()
