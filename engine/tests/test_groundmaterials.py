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

    def test_individual_detail_images_and_world_scales_share_the_same_definition(self):
        base = kn5.Material("ground_-1_0", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, "base.dds")])
        result = groundmaterial.layered(base, mask="selection.png", details={"R": "asphalt.dds"}, scales={"R": .5})
        self.assertIn(("txMask", 1, "selection.png"), result.maps)
        self.assertIn(("txDetailR", 2, "asphalt.dds"), result.maps)
        self.assertEqual(.5, next(p[1] for p in result.props if p[0] == "multR"))

    def test_conversion_changes_only_ground_materials_and_adds_two_shared_tiny_images(self):
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
            with mock.patch.object(groundmaterial, "layered", side_effect=lambda m: m):
                obj_to_kn5.convert(str(part), str(root / "before.kn5"), parts=[str(part)], log=lambda _: None)
            obj_to_kn5.convert(str(part), str(root / "after.kn5"), parts=[str(part)], log=lambda _: None)
            before, after = kn5.read(str(root / "before.kn5")), kn5.read(str(root / "after.kn5"))
            before_textures = {t[0]: t[2] for t in before["textures"]}
            after_textures = {t[0]: t[2] for t in after["textures"]}
            for name, raw in before_textures.items():
                self.assertEqual(raw, after_textures[name])
            self.assertEqual(2, len(after_textures) - len(before_textures))
            self.assertTrue(sum(len(raw) for name, raw in after_textures.items() if name not in before_textures) < 1024)
            for a, b in zip(before["root"].children, after["root"].children):
                self.assertEqual(a.name, b.name)
                if a.vertices is not None:
                    np.testing.assert_array_equal(a.vertices, b.vertices)
                    np.testing.assert_array_equal(a.indices, b.indices)
            materials = {m.name: m for m in after["materials"]}
            self.assertEqual("ksMultilayer", materials["ground_0_0"].shader)
            self.assertEqual("ksMultilayer", materials["ground_1_0"].shader)
            self.assertEqual("ksPerPixel", materials["water"].shader)


if __name__ == "__main__":
    unittest.main()
