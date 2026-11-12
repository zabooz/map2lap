"""How buildings and the ground take the light: buildings get more of the sun, the ground casts shadows at a low sun only."""
import os
import sys
import unittest

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import trackview  # noqa: E402
from track import kn5, make_track_folder, obj_to_kn5  # noqa: E402


class MaterialLightTest(unittest.TestCase):
    def test_fences_stay_on_their_shader(self):
        self.assertEqual(("ksPerPixelAT_NS", 1), obj_to_kn5.SHADERS["fences"])

    def test_a_building_takes_less_ambient_and_more_sun(self):
        for level, k in enumerate(obj_to_kn5.FACADE_LEVELS):
            values = obj_to_kn5.light_values(f"fac_07_{level}")
            self.assertAlmostEqual(obj_to_kn5.DEFAULT["ksAmbient"] * k * 0.75, values["ksAmbient"])
            self.assertAlmostEqual(obj_to_kn5.DEFAULT["ksDiffuse"] * k * 1.3, values["ksDiffuse"])
            self.assertEqual(obj_to_kn5.DEFAULT["ksSpecular"], values["ksSpecular"])

    def test_other_materials_keep_their_values(self):
        self.assertEqual(obj_to_kn5.VALUES["trees"], obj_to_kn5.light_values("trees"))
        self.assertEqual(obj_to_kn5.VALUES["asphalt"], obj_to_kn5.light_values("asphalt"))
        self.assertEqual(obj_to_kn5.VALUES["grass"], obj_to_kn5.light_values("ground_0_0"))
        self.assertEqual(obj_to_kn5.DEFAULT, obj_to_kn5.light_values("plaster"))


class EditorMaterialLightTest(unittest.TestCase):
    def test_the_editor_gets_ambient_and_diffuse_apart(self):
        """The sum alone can't tell a material lit by the sky from one lit by the sun, and the Editor's clock changes the two apart."""
        none = ((0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0))
        material = kn5.Material("fac_07_1", "ksPerPixel", 0, 0, 0,
                                [("ksAmbient", 0.3, *none), ("ksDiffuse", 0.4, *none)], [])
        shown = trackview._material(material)
        self.assertAlmostEqual(0.3, shown["ambient"])
        self.assertAlmostEqual(0.4, shown["diffuse"])
        self.assertAlmostEqual(0.7, shown["bright"])


class TerrainShadowTest(unittest.TestCase):
    def test_a_track_lets_its_ground_cast_shadows_only_at_a_low_sun(self):
        """With shadows all day the terrain shadowed itself: rings around the camera on the asphalt."""
        self.assertIn("[SHADER_REPLACEMENT_...]\nMATERIALS = ground_?\nCAST_SHADOWS = TERRAIN\n", make_track_folder.EXT_CONFIG)


if __name__ == "__main__":
    unittest.main()
