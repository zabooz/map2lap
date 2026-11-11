"""A generated ground material gains detail slots without changing its baked colour or geometry."""
import io
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: E402,F401
from track import groundmaterial, kn5, make_obj, obj_to_kn5  # noqa: E402


class GroundMaterialTest(unittest.TestCase):
    def test_bridge_colour_uses_world_metres_instead_of_the_old_road_strip_uvs(self):
        bridge = kn5.Material("asphalt", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, "asphalt_ground.dds")])
        result = groundmaterial.world_colour(bridge, "photo.dds", repeat_m=2)
        self.assertEqual("ksMultilayer", result.shader)
        self.assertEqual(.5, next(p[1] for p in result.props if p[0] == "multR"))
        self.assertIn(("txDiffuse", 0, groundmaterial.WHITE), result.maps)
        self.assertIn(("txMask", 1, groundmaterial.MASK), result.maps)
        self.assertIn(("txDetailR", 2, "photo.dds"), result.maps)
        self.assertEqual([("txDiffuse", 0, "asphalt_ground.dds")], bridge.maps)
        for repeat in (0, -1, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                groundmaterial.world_colour(bridge, "photo.dds", repeat_m=repeat)

    def test_dual_layer_keeps_the_old_tile_and_samples_the_new_colour_at_its_own_scale(self):
        base = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0,
                            [("ksAmbient", .41, (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                            [("txDiffuse", 0, "ground_0_0.dds")])
        prepared = groundmaterial.layered(base)
        result = groundmaterial.dual_layer(prepared, "asphalt.dds", "keep_base.dds", repeat_m=2)
        self.assertEqual("ksPerPixel_dual_layer", result.shader)
        self.assertEqual([("txDiffuse", 0, "asphalt.dds"), ("txLayer1", 1, "ground_0_0.dds"),
                          ("txLayer1_Mask", 2, "keep_base.dds")], result.maps)
        values = {p[0]: p[1] for p in result.props}
        self.assertEqual(128, values["uvMult"])
        self.assertEqual(.41, values["ksAmbient"])
        self.assertEqual(0, values["fresnelMaxLevel"])
        self.assertEqual(0, values["isAdditive"])
        self.assertNotIn("magicMult", values)
        self.assertEqual("ksMultilayer", prepared.shader)
        for repeat in (0, -1, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                groundmaterial.dual_layer(base, "asphalt.dds", "keep_base.dds", repeat_m=repeat)

    def test_neutral_layers_preserve_the_complete_baked_colour_including_alpha(self):
        base = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0,
                            [("ksAmbient", .41, (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                            [("txDiffuse", 0, "ground_0_0.dds")])
        result = groundmaterial.layered(base)
        self.assertEqual("ksMultilayer", result.shader)
        self.assertEqual(base.props, result.props[:len(base.props)])
        self.assertEqual(base.maps[0], result.maps[0])
        images = {name: np.asarray(Image.open(io.BytesIO(raw)).convert("RGBA"))[0, 0] / 255
                  for name, raw in groundmaterial.textures()}
        slots = {slot: name for slot, _index, name in result.maps}
        weights = images[slots["txMask"]]
        mixed = sum(weights[i] * images[slots["txDetail" + channel]] for i, channel in enumerate("RGBA"))
        np.testing.assert_array_equal(np.ones(4), mixed)
        self.assertEqual(1, next(p[1] for p in result.props if p[0] == "magicMult"))
        self.assertEqual("ksPerPixel", base.shader)

    def test_pbr_names_its_images_by_the_shader_s_own_slots_and_numbers(self):
        # Bound so, AC loads them with the material; bound by a CSP replacement's RESOURCE_TEXTURE they stayed black.
        base = kn5.Material("ground_0_0", "ksMultilayer", 0, 0, 0,
                            [("ksAmbient", .41, (0, 0), (0, 0, 0), (0, 0, 0, 0)), groundmaterial.guard_prop(),
                             ("multA", 1., (1., 1.), (0, 0, 0), (0, 0, 0, 0)), ("ksEmissive", 0., (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                            [("txDiffuse", 0, "ground_0_0.dds")])
        result = groundmaterial.pbr(base, "white.png", "mask.dds", {"R": ("grass.dds", "grass_data.png", .25),
                                                                   "A": ("tile.dds", "flat.png", 1 / 288)})
        self.assertEqual("fuPBR_multilayer", result.shader)
        self.assertEqual([("txDiffuse", 0, "white.png"), ("txMask", 1, "mask.dds"),
                          ("txDetailRAlbedoAO", 2, "grass.dds"), ("txDetailRNmMeRo", 3, "grass_data.png"),
                          ("txDetailGAlbedoAO", 4, groundmaterial.WHITE), ("txDetailGNmMeRo", 5, groundmaterial.FLAT_DATA),
                          ("txDetailBAlbedoAO", 6, groundmaterial.WHITE), ("txDetailBNmMeRo", 7, groundmaterial.FLAT_DATA),
                          ("txDetailAAlbedoAO", 8, "tile.dds"), ("txDetailANmMeRo", 9, "flat.png"),
                          ("txNormal2", 10, groundmaterial.FLAT_NORMAL)], result.maps)
        values = {p[0]: p for p in result.props}
        self.assertEqual(len(values), len(result.props))                    # (each property once)
        self.assertEqual([.25, 1., 1., 1 / 288], [values["mult" + c][1] for c in "RGBA"])
        self.assertEqual((1., 1., 1.), values["pbrAlbedoGain"][3])
        self.assertEqual((0., 0., 0.), values["ksEmissive"][3])
        self.assertEqual({"pbrF0": .04, "detailNMMult": 1., "magicMult": 1., "ksAlphaRef": 0., "pbrBlurCubemap": 0.},
                         {k: values[k][1] for k in ("pbrF0", "detailNMMult", "magicMult", "ksAlphaRef", "pbrBlurCubemap")})
        self.assertNotIn("pbrFlags", values)
        self.assertEqual(.41, values["ksAmbient"][1])
        self.assertEqual(groundmaterial.UV_GUARD, values["m2lUVGuard"][1])
        for bad in ({"X": ("a", "b", 1.)}, {"R": ("a", "b", 0.)}, {"R": ("a", "b", float("nan"))}):
            with self.assertRaises(ValueError):
                groundmaterial.pbr(base, "white.png", "mask.dds", bad)

    def test_generated_ground_keeps_its_baked_colours_under_pbr(self):
        base = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0, [groundmaterial.guard_prop()], [("txDiffuse", 0, "ground_0_0.dds")])
        result = groundmaterial.ground(base)
        self.assertEqual("fuPBR_multilayer", result.shader)
        slots = {slot: name for slot, _index, name in result.maps}
        self.assertEqual("ground_0_0.dds", slots["txDiffuse"])
        images = {name: np.asarray(Image.open(io.BytesIO(raw)).convert("RGBA"))[0, 0] / 255 for name, raw in groundmaterial.textures()}
        weights = images[slots["txMask"]]
        albedo = sum(weights[i] * images[slots[f"txDetail{c}AlbedoAO"]][:3] for i, c in enumerate("RGBA"))
        np.testing.assert_array_equal(np.ones(3), albedo)           # (the shader multiplies txDiffuse by it)
        data = sum(weights[i] * images[slots[f"txDetail{c}NmMeRo"]] for i, c in enumerate("RGBA"))
        self.assertAlmostEqual(groundmaterial.GROUND_ROUGHNESS, data[3], places=2)
        self.assertEqual(0, data[2])                                # (no metal)
        self.assertLess(abs(data[0] * 2 - 1) + abs(data[1] * 2 - 1), .02)  # (flat)
        self.assertEqual([128, 128, 255], list((images[slots["txNormal2"]][:3] * 255).round().astype(int)))

    def test_individual_detail_images_and_world_scales_share_the_same_definition(self):
        base = kn5.Material("ground_-1_0", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, "base.dds")])
        result = groundmaterial.layered(base, mask="selection.png", details={"R": "asphalt.dds"}, scales={"R": .5})
        self.assertIn(("txMask", 1, "selection.png"), result.maps)
        self.assertIn(("txDetailR", 2, "asphalt.dds"), result.maps)
        self.assertEqual(.5, next(p[1] for p in result.props if p[0] == "multR"))

    def test_conversion_makes_only_ground_materials_pbr_and_adds_four_shared_tiny_images(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name in ("ground_0_0", "ground_1_0", "water"):
                Image.new("RGB", (16, 16), (65, 110, 40)).save(root / (name + ".jpg"))
            (root / "t_0_0.mtl").write_text("".join(
                f"newmtl {name}\nmap_Kd {name}.jpg\n" for name in ("ground_0_0", "ground_1_0", "water")))
            part = root / "t_0_0.obj"
            obj = make_obj.Obj(str(part))
            for i, (mesh, material) in enumerate((("1ROAD_ground_0_0", "ground_0_0"),
                                                   ("1GRASS_ground_1_0", "ground_1_0"), ("nocol_water_0_0", "water"))):
                obj.add(mesh, material, np.array([[i * 4, 0, 0], [i * 4 + 2, 0, 0], [i * 4, 2, 0]], float),
                        np.array([[0, 0], [1, 0], [0, 1]], float), np.array([[0, 1, 2]]))
            obj.close()
            with mock.patch.object(groundmaterial, "ground", side_effect=lambda m: m):
                obj_to_kn5.convert(str(part), str(root / "before.kn5"), parts=[str(part)], log=lambda _: None)
            obj_to_kn5.convert(str(part), str(root / "after.kn5"), parts=[str(part)], log=lambda _: None)
            before, after = kn5.read(str(root / "before.kn5")), kn5.read(str(root / "after.kn5"))
            before_textures = {t[0]: t[2] for t in before["textures"]}
            after_textures = {t[0]: t[2] for t in after["textures"]}
            for name, raw in before_textures.items():
                self.assertEqual(raw, after_textures[name])
            self.assertEqual(4, len(after_textures) - len(before_textures))
            self.assertTrue(sum(len(raw) for name, raw in after_textures.items() if name not in before_textures) < 1024)
            for a, b in zip(before["root"].children, after["root"].children):
                self.assertEqual(a.name, b.name)
                if a.vertices is not None:
                    np.testing.assert_array_equal(a.vertices, b.vertices)
                    np.testing.assert_array_equal(a.indices, b.indices)
            materials = {m.name: m for m in after["materials"]}
            self.assertEqual(groundmaterial.PBR, materials["ground_0_0"].shader)
            self.assertEqual(groundmaterial.PBR, materials["ground_1_0"].shader)
            unchanged = {m.name: m for m in before["materials"]}["ground_0_0"]
            self.assertEqual(unchanged.maps[0], materials["ground_0_0"].maps[0])     # (txDiffuse: the baked tile image)
            self.assertEqual("ksPerPixel", materials["water"].shader)

    def test_a_tile_image_with_road_is_bc7_others_stay_bc1(self):
        from track import textures
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name in ("ground_0_0", "ground_1_0", "water"):
                Image.new("RGB", (16, 16), (65, 110, 40)).save(root / (name + ".jpg"))
            (root / "t_0_0.mtl").write_text("".join(
                f"newmtl {name}\nmap_Kd {name}.jpg\n" for name in ("ground_0_0", "ground_1_0", "water")))
            part = root / "t_0_0.obj"
            obj = make_obj.Obj(str(part))
            for i, (mesh, material) in enumerate((("1GRASS_ground_0_0", "ground_0_0"), ("1ROAD_ground_0_0", "ground_0_0"),
                                                   ("1GRASS_ground_1_0", "ground_1_0"), ("1ROAD_water_0_0", "water"))):
                obj.add(mesh, material, np.array([[i * 4, 0, 0], [i * 4 + 2, 0, 0], [i * 4, 2, 0]], float),
                        np.array([[0, 0], [1, 0], [0, 1]], float), np.array([[0, 1, 2]]))
            obj.close()
            obj_to_kn5.dds_texture(str(root / "ground_0_0.jpg"))      # (a BC1 one kept from a build before)
            obj_to_kn5.convert(str(part), str(root / "t.kn5"), parts=[str(part)], log=lambda _: None)
            images = {name: raw for name, _active, raw in kn5.read(str(root / "t.kn5"))["textures"]}
        self.assertTrue(textures._is_bc7(images["ground_0_0.dds"]))
        self.assertEqual(b"DXT1", images["ground_1_0.dds"][84:88])
        self.assertEqual(b"DXT1", images["water.dds"][84:88])


if __name__ == "__main__":
    unittest.main()
