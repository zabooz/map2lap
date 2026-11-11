"""Portable stock-CSP ground: real roughness, original road colour, and embedded Save resources."""
import copy
import io
from pathlib import Path
import unittest
from unittest import mock

import numpy as np
from PIL import Image

import test_native_save as savefixture
import test_trackpaint as paintfixture
from app import trackcopy, trackdetail, tracknative
from track import kn5


class PackingTest(unittest.TestCase):
    def test_pbr_packs_mirrored_tangent_x_nonmetal_and_factored_roughness(self):
        data = np.full((4, 4, 4), [255, 128, 128, 128], np.uint8)
        ref = {"properties": {"normal_scale": 1., "roughness": .5}}
        with Image.open(io.BytesIO(tracknative._photo_normals(data, ref, pbr=True))) as image:
            self.assertEqual((0, 128, 0, 64), image.getpixel((0, 0)))
        with Image.open(io.BytesIO(tracknative._photo_normals(data, ref))) as image:
            self.assertEqual((255, 128, 128, 255), image.getpixel((0, 0)))

    def test_roughness_is_clamped_and_flat_data_has_no_metal(self):
        for rough, expected in ((-1, 0), (0, 0), (221 / 255, 221), (1, 255), (2, 255)):
            with self.subTest(rough=rough), Image.open(io.BytesIO(tracknative._pbr_flat(rough))) as image:
                self.assertEqual((127, 128, 0, expected), image.getpixel((0, 0)))

    def test_albedo_alpha_is_unoccluded_instead_of_old_gloss(self):
        raw = paintfixture.png(np.full((8, 8, 4), [90, 110, 130, 34], np.uint8))
        ref = {"id": "asset:a", "asset": "a"}
        material = kn5.Material("ground", "ksPerPixel", 0, 0, 0, [], [])
        detail = mock.Mock(side_effect=AssertionError("roughness belongs in NmMeRo"))
        encoded = tracknative._photo_colour(raw, ref, material, (0, 0), 34, detail, pbr=True)
        with Image.open(io.BytesIO(encoded)) as image:
            self.assertGreaterEqual(image.convert("RGBA").getchannel("A").getextrema()[0], 254)  # BC7 rounds opaque alpha by at most 1/255.
            self.assertLess(max(abs(a - b) for a, b in zip(image.convert("RGB").getpixel((0, 0)), (90, 110, 130))), 6)
        detail.assert_not_called()
        self.assertNotEqual(tracknative._photo_key(raw, ref, material, (0, 0), 34),
                            tracknative._photo_key(raw, ref, material, (0, 0), 34, pbr=True))

    def test_rectangular_repeats_keep_the_float2_path(self):
        refs = {"square": {"scale": [128, 128]}, "cliff": {"scale": [128, 256]}}
        self.assertTrue(tracknative._pbr_palette(refs, ["square"]))
        self.assertFalse(tracknative._pbr_palette(refs, ["square", "cliff"]))

    def test_preview_disables_variation_without_changing_retained_preferences(self):
        layout = {"mask": {"name": "mask"}, "images": [{"name": "photo", "scale": [128, 128], "variation": True}]}
        before = copy.deepcopy(layout)
        with mock.patch.object(trackdetail, "_weight_offsets", return_value={}):
            shown = trackdetail._with_urls("track", "version", layout)
        self.assertTrue(shown["pbr"])
        self.assertFalse(shown["images"][0]["variation"])
        self.assertEqual(before, layout)
        layout['images'][0]['scale']=[128,256]
        with mock.patch.object(trackdetail, "_weight_offsets", return_value={}):
            rectangular=trackdetail._with_urls('track','version',layout)
        self.assertFalse(rectangular['pbr'])
        self.assertTrue(rectangular['images'][0]['variation'])


class PbrSaveTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    material = paintfixture.PaintTest.material
    keep = paintfixture.PaintTest.keep
    build = savefixture.RegionMaskTest.build
    painted = savefixture.RegionMaskTest.painted
    stripe = savefixture.RegionMaskTest.stripe

    def test_one_colour_save_uses_pbr_and_keeps_its_editable_source_slots(self):
        self.keep(self.painted(1))
        trackcopy.save(self.ac,self.name,'simple','Simple')
        folder=Path(self.ac,'content/tracks/simple')
        saved=kn5.read(str(folder/'simple.kn5'))
        material=next(m for m in saved['materials'] if m.name=='ground_0_0')
        self.assertIn(('m2lPBR',1.),[(p[0],p[1]) for p in material.props])
        self.assertEqual('ksMultilayer_objsp',material.shader)
        self.assertIn('txDetailA',[slot for slot,_index,_image in material.maps])
        config=(folder/'extension/map2lap_ground.ini').read_text(encoding='utf-8')
        self.assertIn('SHADER = fuPBR_multilayer',config)
        self.assertIn('txDetailRNmMeRo',config)

    def test_save_embeds_all_pbr_inputs_and_stock_config_without_changing_collision(self):
        self.keep(self.painted(5))
        original = kn5.read(str(self.path))
        trackcopy.save(self.ac, self.name, "pbr", "PBR")
        folder = Path(self.ac, "content/tracks/pbr")
        saved = kn5.read(str(folder / "pbr.kn5"))
        resources = {name: raw for name, _active, raw in saved["textures"]}
        config = (folder / "extension/map2lap_ground.ini").read_text(encoding="utf-8")
        regions = [m for m in saved["materials"] if any(p[0] == "m2lGroundPass" and p[1] == 4 for p in m.props)]
        self.assertTrue(regions)
        for material in regions:
            slots = {name: (slot, image) for name, slot, image in material.maps}
            self.assertEqual({"txDiffuse", "txMask", "txNormal2", *[prefix + c for c in "RGBA"
                              for prefix in ("txDetail", "txNormal")]}, set(slots))
            self.assertTrue(all(image in resources for _slot, image in slots.values()))
            self.assertEqual(11, len({slot for slot, _image in slots.values()}))
            self.assertIn("MATERIALS = " + material.name, config)
            self.assertTrue(tracknative._owned_material(material))
            values = {p[0]: p[1] for p in material.props}
            self.assertAlmostEqual(.5, values["m2lPbrScaleR"])
            for c in "RGBA":
                with Image.open(io.BytesIO(resources[slots["txDetail" + c][1]])) as image:
                    self.assertGreaterEqual(image.convert("RGBA").getchannel("A").getextrema()[0], 254)
                with Image.open(io.BytesIO(resources[slots["txNormal" + c][1]])) as image:
                    self.assertEqual((0, 0), image.getchannel("B").getextrema())
        self.assertIn("SHADER = fuPBR_multilayer", config)
        self.assertIn("pbrFlags, 24", config)  # AO and perceptual roughness; the shared variation flag stays off.
        self.assertNotIn("RESOURCE_FILE", config)
        self.assertNotIn("tilingFix", config)
        for before, after in zip(original["root"].children, saved["root"].children):
            self.assertEqual(before.vertices["pos"].tobytes(), after.vertices["pos"].tobytes())
            self.assertEqual(before.indices.tobytes(), after.indices.tobytes())
