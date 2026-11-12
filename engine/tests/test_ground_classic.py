"""Classic CSP ground: ksMultilayer_objsp_nm4 straight in the kn5, its normals, gloss and variation per layer."""
import copy
import io
from pathlib import Path
import unittest
from unittest import mock

import numpy as np
from PIL import Image

import test_native_save as savefixture
import test_trackpaint as paintfixture
from app import trackcopy, trackdetail, tracknative, trackvariation, trackview
from track import groundmaterial, kn5


def _prop(name, value):
    return (name, value, (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))


class PackingTest(unittest.TestCase):
    def test_normals_are_tangent_rgb_with_their_strength_applied(self):
        data = np.full((4, 4, 4), [255, 128, 128, 128], np.uint8)
        with Image.open(io.BytesIO(tracknative._photo_normals(data, {"properties": {"normal_scale": 1.}}))) as image:
            self.assertEqual((255, 128, 128, 255), image.getpixel((0, 0)))
        with Image.open(io.BytesIO(tracknative._photo_normals(data, {"properties": {"normal_scale": 0.}}))) as image:
            self.assertEqual((128, 128, 255, 255), image.getpixel((0, 0)))

    def test_a_roughness_map_becomes_gloss_in_the_photo_alpha(self):
        raw = paintfixture.png(np.full((8, 8, 3), [90, 110, 130], np.uint8))
        ref = {"id": "asset:a", "asset": "a", "properties": {"roughness": .5}}
        detail = lambda: np.full((8, 8, 4), [128, 128, 255, 200], np.uint8)
        with Image.open(io.BytesIO(tracknative._photo_colour(raw, ref, detail))) as image:
            alpha = image.convert("RGBA").getchannel("A").getextrema()
        self.assertLess(abs(alpha[0] - round(255 * (1 - 100 / 255))), 3)       # (roughness 200 * .5: gloss 1 - 100/255)

    def test_a_colour_only_photo_shines_by_its_flat_roughness(self):
        # As imported (roughness 1) it has no gloss, as a simple Save's photo; made smoother it shines up to the ground's.
        raw = paintfixture.png(np.full((8, 8, 3), 90, np.uint8))
        for properties, expected in (({}, 0), ({"roughness": .5}, 128), ({"roughness": 0.}, 255), ({"roughness": .5, "roughness_offset": .5}, 0)):
            with self.subTest(properties=properties):
                encoded = tracknative._photo_colour(raw, {"id": "asset:a", "asset": "a", "properties": properties}, None)
                with Image.open(io.BytesIO(encoded)) as image:
                    self.assertLess(abs(image.convert("RGBA").getchannel("A").getextrema()[0] - expected), 2)
        self.assertNotEqual(tracknative._colour_key(raw, {"asset": "a", "properties": {}}),
                            tracknative._colour_key(raw, {"asset": "a", "properties": {"roughness": .5}}))


class ColourKeyTest(unittest.TestCase):
    @staticmethod
    def ref(normal="n", roughness=None, rough=.5):
        detail = {"key": normal + (roughness or ""), **({"roughness": roughness} if roughness is not None else {"roughness": None})}
        return {"id": "asset:a", "asset": "a", "detail": detail, "properties": {"normal_scale": 1., "roughness": rough}}

    def test_a_colour_depends_on_its_photo_and_effective_roughness_not_on_the_normal_map(self):
        # (its alpha is its gloss, 1 - roughness: a normal map switched on or off writes the same bytes)
        self.assertEqual(tracknative._colour_key(b"a", self.ref("n1")), tracknative._colour_key(b"a", self.ref("n2")))
        self.assertEqual(tracknative._colour_key(b"a", self.ref("n1")), tracknative._colour_key(b"a", {"asset": "a", "properties": {"roughness": .5}}))
        self.assertNotEqual(tracknative._colour_key(b"a", self.ref("n1", "r1")), tracknative._colour_key(b"a", self.ref("n1", "r2")))
        self.assertEqual(tracknative._colour_key(b"a", self.ref("n1", "r1")), tracknative._colour_key(b"a", self.ref("n2", "r1")))
        self.assertNotEqual(tracknative._colour_key(b"a", self.ref("n1", "r1")), tracknative._colour_key(b"a", self.ref("n1", "r1", rough=.8)))


class MaterialTest(unittest.TestCase):
    base = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0,
                        [_prop("ksAmbient", .41), _prop("ksSpecular", .02), _prop("ksSpecularEXP", 10.), *groundmaterial.uv_props(),
                         _prop("multR", 7.), _prop("m2lVariationR", 1.)],
                        [("txDiffuse", 0, "ground_0_0.dds")])

    def test_classic_names_its_images_by_the_shader_s_own_slots_and_numbers(self):
        # Bound so, AC loads them with the material (stausee_nm4_direkt, 2026-11-11); RESOURCE_TEXTURE left fuPBR's black.
        result = groundmaterial.classic(self.base, "white.png", "mask.dds",
                                        {"R": ("grass.dds", "grass_n.png", (64., 32.), True), "A": ("tile.dds", None, (.5, .5), False)})
        self.assertEqual(groundmaterial.NM4, result.shader)
        self.assertEqual([("txDiffuse", 0, "white.png"), ("txMask", 1, "mask.dds"), ("txDetailR", 2, "grass.dds"),
                          ("txDetailG", 3, groundmaterial.WHITE), ("txDetailB", 4, groundmaterial.WHITE), ("txDetailA", 5, "tile.dds"),
                          ("txNormalR", 6, "grass_n.png"), ("txNormalG", 7, groundmaterial.FLAT_NORMAL),
                          ("txNormalB", 8, groundmaterial.FLAT_NORMAL), ("txNormalA", 9, groundmaterial.FLAT_NORMAL)], result.maps)
        values = {p[0]: p for p in result.props}
        self.assertEqual(len(values), len(result.props))                    # (each property once)
        self.assertEqual([(64., 32.), (1., 1.), (1., 1.), (.5, .5)], [values["mult" + c][2] for c in "RGBA"])
        self.assertEqual([1., 0., 0., 0.], [values["tilingFix" + c][1] for c in "RGBA"])
        self.assertEqual([1., 0., 0., 0.], [values["m2lVariation" + c][1] for c in "RGBA"])
        self.assertEqual(groundmaterial.TILING_FIX, values["multTilingFix"][1])
        self.assertEqual(1., values["magicMult"][1])
        self.assertEqual((.02, 10.), (values["ksSpecular"][1], values["ksSpecularEXP"][1]))     # (kept: the gloss cap)
        self.assertFalse({"pbrF0", "pbrFlags", "pbrAlbedoGain", "detailNMMult"} & set(values))
        for bad in ({"X": ("a", None, (1., 1.), False)}, {"R": ("a", None, (0., 1.), False)}, {"R": ("a", None, (float("nan"), 1.), False)}):
            with self.assertRaises(ValueError):
                groundmaterial.classic(self.base, "white.png", "mask.dds", bad)

    def test_generated_ground_keeps_its_baked_colours_and_gloss(self):
        result = groundmaterial.ground(self.base)
        self.assertEqual(groundmaterial.NM4, result.shader)
        slots = {slot: name for slot, _index, name in result.maps}
        self.assertEqual("ground_0_0.dds", slots["txDiffuse"])
        images = {name: np.asarray(Image.open(io.BytesIO(raw)).convert("RGBA"))[0, 0] / 255 for name, raw in groundmaterial.textures()}
        weights = images[slots["txMask"]]
        mixed = sum(weights[i] * images[slots["txDetail" + c]] for i, c in enumerate("RGBA"))
        np.testing.assert_array_equal(np.ones(4), mixed)           # (colour and gloss alpha: txDiffuse's times one)
        normal = sum(weights[i] * images[slots["txNormal" + c]] for i, c in enumerate("RGBA"))
        np.testing.assert_array_equal([128, 128, 255], (normal[:3] * 255).round())
        values = {p[0]: p[1] for p in result.props}
        self.assertEqual([0.] * 4, [values["tilingFix" + c] for c in "RGBA"])
        self.assertEqual(.02, values["ksSpecular"])


class ClassicSourceTest(unittest.TestCase):
    def test_a_painted_classic_tile_is_a_splat_source_of_its_photos_mask_and_variation(self):
        tile = kn5.Material("ground_0_0", "ksMultilayer_objsp", 0, 0, 0, [("m2lMaskExtent", 1., (1.125, 1.125), (0., 0., 0.), (0., 0., 0., 0.))], [])
        material = groundmaterial.classic(tile, groundmaterial.WHITE, "mask.dds",
                                          {"R": ("grass.dds", "n.png", (144., 144.), True), "A": ("ground_0_0.png", None, (1., 1.), False)})
        names = ["ground_0_0.png", "mask.dds", "grass.dds", "n.png", groundmaterial.WHITE, groundmaterial.FLAT_NORMAL]
        source = trackdetail._source({"textures": [(n, 0, 1) for n in names], "materials": [material]}, 0)
        self.assertEqual("splat", source["kind"])
        self.assertEqual(1, source["mask"])
        self.assertEqual([1.125, 1.125], source["mask_extent"])
        self.assertEqual([{"i": 2, "scale": [128., 128.], "channel": 0, "variation": True}], source["images"])
        shown = trackview._material(material)
        self.assertEqual("ground_0_0.png", shown["splat"]["base"]["name"])
        self.assertTrue(shown["splat"]["images"][0]["variation"])

    def test_generated_classic_ground_is_a_base_source_drawn_with_its_own_light(self):
        tile = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0, [_prop("ksSpecular", .02), _prop("ksSpecularEXP", 10.)],
                            [("txDiffuse", 0, "ground_0_0.dds")])
        names = ["ground_0_0.dds", *(n for n, _raw in groundmaterial.textures())]
        material = groundmaterial.ground(tile)
        source = trackdetail._source({"textures": [(n, 0, 1) for n in names], "materials": [material]}, 0)
        self.assertEqual("base", source["kind"])
        shown = trackview._material(material)
        self.assertEqual("ground_0_0.dds", shown["texture"])
        self.assertNotIn("splat", shown)
        self.assertNotIn("pbr", shown)
        self.assertEqual((.02, 10.), (shown["specular"], shown["specular_exp"]))

    def test_variation_preferences_reach_the_preview(self):
        layout = {"mask": {"name": "mask"}, "images": [{"name": "photo", "scale": [128, 128], "variation": True}]}
        before = copy.deepcopy(layout)
        with mock.patch.object(trackdetail, "_weight_offsets", return_value={}):
            shown = trackdetail._with_urls("track", "version", layout)
        self.assertNotIn("pbr", shown)
        self.assertTrue(shown["images"][0]["variation"])
        self.assertEqual(before, layout)


class ConfigTest(unittest.TestCase):
    def test_classic_ground_needs_no_shader_replacement(self):
        material = groundmaterial.ground(MaterialTest.base)
        regional = replace_props(material, [_prop("m2lGroundPass", 3.)], name="m2l_ground_region_0_0")
        self.assertEqual("", trackvariation.config([material, regional]))


def replace_props(material, extra, name):
    from dataclasses import replace
    return replace(material, name=name, props=[*material.props, *extra])


class ClassicSaveTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    keep = paintfixture.PaintTest.keep
    build = savefixture.RegionMaskTest.build
    quad = savefixture.RegionMaskTest.quad
    painted = savefixture.RegionMaskTest.painted
    stripe = savefixture.RegionMaskTest.stripe

    material = paintfixture.PaintTest.material     # (category grass: its repeats vary, materiallibrary.varies)

    def glossy(self):
        """The test tiles' ground with the generator's gloss (obj_to_kn5: grass), which a Save keeps."""
        native = kn5.read(str(self.path))
        native["materials"] = [m if not groundmaterial.is_ground(m.name) else
                               replace_props(m, [_prop("ksSpecular", .02), _prop("ksSpecularEXP", 10.)], m.name) for m in native["materials"]]
        kn5.write(str(self.path), [(t[0], t[2]) for t in native["textures"]], native["materials"], native["root"])
        from track import editorinfo
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])

    def test_one_colour_save_writes_classic_ground_straight_into_the_kn5(self):
        self.keep(self.painted(1))
        trackcopy.save(self.ac, self.name, "simple", "Simple")
        folder = Path(self.ac, "content/tracks/simple")
        saved = kn5.read(str(folder / "simple.kn5"))
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        self.assertEqual(groundmaterial.NM4, material.shader)
        self.assertEqual(list(groundmaterial.NM4_SLOTS), [slot for slot, _index, _image in material.maps])
        self.assertEqual(list(range(10)), [i for _slot, i, _image in material.maps])
        values = {p[0]: p for p in material.props}
        extent = values["m2lMaskExtent"][2]
        self.assertAlmostEqual(values["m2lBaseScale"][1] * extent[0], values["multA"][2][0])  # (the build's tile image, at the world's phase)
        self.assertIn(("txDetailA", "ground_0_0.png"), [(slot, image) for slot, _index, image in material.maps])
        self.assertEqual(0., values["tilingFixA"][1])
        names = {t[0] for t in saved["textures"]}
        self.assertTrue(all(image in names for _slot, _index, image in material.maps))
        config = folder / "extension/map2lap_ground.ini"
        self.assertNotIn("SHADER =", config.read_text(encoding="utf-8") if config.exists() else "")

    def test_regional_save_writes_classic_ground_with_the_tile_image_itself_and_the_ground_s_gloss(self):
        self.painted(5)
        self.glossy()
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for mesh in (0, 1):
            trackview.prepare_surface(self.ac, self.name, mesh, self.revision)
        paints = [self.stripe(k) for k in range(4)]
        paints.append(trackpaint_create(self, self.material((200, 200, 200), repeat=(2, 3)), 5))
        self.keep(paints)
        original = kn5.read(str(self.path))
        trackcopy.save(self.ac, self.name, "classic", "Classic")
        folder = Path(self.ac, "content/tracks/classic")
        saved = kn5.read(str(folder / "classic.kn5"))
        resources = {name: raw for name, _active, raw in saved["textures"]}
        regions = [m for m in saved["materials"] if any(p[0] == "m2lGroundPass" and p[1] == 3 for p in m.props)]
        self.assertTrue(regions)
        varied = False
        for material in regions:
            self.assertEqual(groundmaterial.NM4, material.shader)
            self.assertEqual(list(groundmaterial.NM4_SLOTS), [slot for slot, _i, _image in material.maps])
            self.assertTrue(tracknative._owned_material(material))
            slots = {slot: image for slot, _i, image in material.maps}
            self.assertTrue(all(image in resources for image in slots.values()))
            values = {p[0]: p for p in material.props}
            self.assertAlmostEqual(.02, values["ksSpecular"][1], places=6)       # (the ground's: the gloss cap)
            self.assertEqual(10., values["ksSpecularEXP"][1])
            for j, c in enumerate("RGBA"):
                if slots["txDetail" + c] == "ground_0_0.png":       # (no copy of the tile image: the build's own, held fixed)
                    self.assertEqual(0., values["tilingFix" + c][1])
                    self.assertEqual(groundmaterial.FLAT_NORMAL, slots["txNormal" + c])
                varied |= values["tilingFix" + c][1] == 1.
        self.assertTrue(varied)
        self.assertFalse([n for n in resources if n.startswith("map2lap_native_") and n.endswith(".dds")
                          and Image.open(io.BytesIO(resources[n])).size == Image.open(io.BytesIO(resources["ground_0_0.png"])).size
                          and n not in {slots["txMask"] for m in regions for slots in [{s: i for s, _n, i in m.maps}]}])
        config = folder / "extension/map2lap_ground.ini"
        self.assertNotIn("SHADER =", config.read_text(encoding="utf-8") if config.exists() else "")
        for before, after in zip(original["root"].children, saved["root"].children):
            self.assertEqual(before.vertices["pos"].tobytes(), after.vertices["pos"].tobytes())
            self.assertEqual(before.indices.tobytes(), after.indices.tobytes())

    def test_prepare_makes_a_simple_save_s_photos_on_its_pool_and_the_save_none(self):
        from app import trackedits, trackpaint
        self.keep(self.painted(1))
        descriptors = trackpaint.descriptors(self.ac, self.name, self.revision, trackedits.load(self.ac, self.name)["paints"])
        self.assertFalse(any(trackdetail._native(d.get("layers", {})) for d in descriptors if d.get("layers")))   # (a simple Save)
        tracknative.prepare(self.ac, self.name, descriptors, kn5.scan(str(self.path)), str(self.path), processes=1)
        self.assertTrue(list(tracknative._library_folder().glob("*.dds")))
        with mock.patch.object(tracknative, "_photo_colour", wraps=tracknative._photo_colour) as encode:
            trackcopy.save(self.ac, self.name, "pooled", "Pooled")
        self.assertEqual(0, encode.call_count)

    def test_a_simple_save_s_size_counts_its_photos_as_written(self):
        from app import trackedits, trackpaint
        self.keep(self.painted(1))
        descriptors = trackpaint.descriptors(self.ac, self.name, self.revision, trackedits.load(self.ac, self.name)["paints"])
        layout = next(d["layers"] for d in descriptors if d.get("layers"))
        ref = layout["images"][0]
        written = len(tracknative._stored(tracknative._library_folder(), *tracknative._library_parts(self.ac, self.name, ref, {})[0]))
        scan = kn5.scan(str(self.path))
        estimate = (trackdetail.save_size([{"layers": layout}], scan, str(self.path))
                    - trackdetail.save_size([{"layers": {**layout, "images": []}}], scan, str(self.path)))
        self.assertGreaterEqual(estimate, written)      # (BC7 with its gloss alpha, not the library's BC1)

    def test_a_save_rewrites_generated_pbr_ground_as_classic_so_neighbours_shine_alike(self):
        # (tracks built before ground_format 3 have fuPBR generated ground; a painted tile's neighbour would light otherwise)
        from track import editorinfo
        self.painted(1)
        native = kn5.read(str(self.path))
        old = native["materials"][1]
        native["materials"][1] = kn5.Material(old.name, "fuPBR_multilayer", 0, 0, 0,
                                              [*old.props, _prop("ksSpecular", .02), _prop("pbrF0", .04), _prop("detailNMMult", 1.)],
                                              [("txDiffuse", 0, "ground_1_0.png"), ("txMask", 1, groundmaterial.MASK)])
        kn5.write(str(self.path), [(t[0], t[2]) for t in native["textures"]], native["materials"], native["root"])
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for mesh in (0, 1):
            trackview.prepare_surface(self.ac, self.name, mesh, self.revision)
        self.keep([self.stripe(0)])
        trackcopy.save(self.ac, self.name, "migrated", "Migrated")
        saved = kn5.read(str(Path(self.ac, "content/tracks/migrated/migrated.kn5")))
        neighbour = next(m for m in saved["materials"] if m.name == "ground_1_0")
        self.assertEqual(groundmaterial.NM4, neighbour.shader)
        maps = {slot: name for slot, _i, name in neighbour.maps}
        self.assertEqual("ground_1_0.png", maps["txDiffuse"])
        values = {p[0]: p[1] for p in neighbour.props}
        self.assertAlmostEqual(.02, values["ksSpecular"], places=6)
        self.assertNotIn("pbrF0", values)
        names = {t[0] for t in saved["textures"]}
        self.assertTrue(all(name in names for name in maps.values()))

    def test_a_reopened_classic_save_shows_its_photos_and_saves_again(self):
        self.keep(self.painted(5))
        trackcopy.save(self.ac, self.name, "again", "Again")
        index = trackview.index(self.ac, "again")
        painted = [m for m in index["materials"] if m.get("splat")]
        self.assertTrue(painted)
        trackcopy.save(self.ac, "again", "again2", "Again 2")
        self.assertTrue(Path(self.ac, "content/tracks/again2/again2.kn5").is_file())


def trackpaint_create(test, asset, k):
    from app import trackpaint
    return trackpaint.create(test.ac, test.name, test.revision, asset,
                             [{"mesh": 0, "u": (k + 1.5) / 7 * test.scale, "v": -.5 * test.scale, "whole": False}])


if __name__ == "__main__":
    unittest.main()
