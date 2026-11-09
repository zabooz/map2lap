"""How plants and buildings take the light: a plant's billboards face away from its stem, buildings get more of the sun."""
import math
import os
import sys
import tempfile
import unittest

import numpy as np

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import trackview  # noqa: E402
from scenery import trees  # noqa: E402
from track import kn5, make_obj, make_track_folder, obj_to_kn5  # noqa: E402

UP = (0.0, 0.0, 1.0)


def plant(x=10.0, y=20.0, yaw=0.0):
    """One tree's billboard mesh (P, UV, T), its first quad along east at yaw 0."""
    return trees.billboards([("deciduous", x, y, 5.0, yaw, 8.0, 0.5)])


class AwayFromStemTest(unittest.TestCase):
    def test_up_normals_lean_away_from_the_stem(self):
        P, _, _ = plant()
        N = make_obj.away_from_stem(P)
        half = math.sqrt(0.5)
        for point, normal in zip(P[:4], N[:4]):     # (the quad along east: its ends lean east and west)
            self.assertAlmostEqual(math.copysign(half, point[0] - 10.0), normal[0], places=6)
            self.assertAlmostEqual(0.0, normal[1], places=6)
            self.assertAlmostEqual(half, normal[2], places=6)

    def test_normals_have_length_one(self):
        P, _, _ = plant(yaw=33.0)
        self.assertTrue(np.allclose(np.linalg.norm(make_obj.away_from_stem(P), axis=1), 1.0))

    def test_a_given_slope_stays_in_the_normal(self):
        P, _, _ = plant()
        slope = np.tile((0.6, 0.0, 0.8), (len(P), 1))
        N = make_obj.away_from_stem(P, slope)
        level = (P - (10.0, 20.0, 0.0)) * (1, 1, 0)
        level /= np.linalg.norm(level, axis=1, keepdims=True)
        expected = slope + level
        expected /= np.linalg.norm(expected, axis=1, keepdims=True)
        self.assertTrue(np.allclose(expected, N))

    def test_a_level_light_finds_the_side_it_comes_from_on_flat_land(self):
        """Headlights come in almost level: with normals straight up a plant got nothing of them and stayed black."""
        P, _, _ = plant()
        toward_east = np.array((1.0, 0.0, 0.0))
        lit = make_obj.away_from_stem(P) @ toward_east
        self.assertGreater(lit[P[:, 0] > 10.0].min(), 0.5)
        self.assertLess(lit[P[:, 0] < 10.0].max(), 0.0)

    def test_two_plants_lean_from_their_own_stems(self):
        one, _, _ = plant(x=0.0)
        two, _, _ = plant(x=100.0)
        together = make_obj.away_from_stem(np.concatenate([one, two]))
        self.assertTrue(np.allclose(together[:8], make_obj.away_from_stem(one)))
        self.assertTrue(np.allclose(together[8:], make_obj.away_from_stem(two)))


class PlantsInThePartTest(unittest.TestCase):
    def added(self, ground=None):
        """The normals (AC: x east, y up, z south) a plant added to a part file has when the kn5 step reads it."""
        P, UV, T = plant()
        with tempfile.TemporaryDirectory() as folder:
            part = os.path.join(folder, "part.obj")
            obj, tris = make_obj.Obj(part, header=False), {}
            make_obj.add_plants(obj, "nocol_trees_0_0", (P, UV, T), tris, ground)
            obj.close()
            normals = {}
            obj_to_kn5.read_obj(part, normals)
        self.assertEqual(len(T), tris["trees"])
        return normals["nocol_trees_0_0"]

    def test_a_tree_carries_normals_away_from_its_stem(self):
        N = self.added()
        self.assertGreater(N[:, 0].max(), 0.6)                      # (the end to the east leans east)
        self.assertLess(N[:, 0].min(), -0.6)
        self.assertGreater(N[:, 2].max(), 0.6)                      # (and the quad across it north and south)
        self.assertAlmostEqual(math.sqrt(0.5), float(N[:, 1].mean()), places=2)

    def test_a_bush_keeps_the_ground_it_stands_on_in_its_normals(self):
        P, _, _ = plant()
        N = self.added(np.tile((0.6, 0.0, 0.8), (len(P), 1)))
        self.assertGreater(N[:, 0].mean(), 0.2)                     # (the slope turns all of it east)


class MaterialLightTest(unittest.TestCase):
    def test_plants_use_the_tree_shader_of_the_stock_tracks(self):
        self.assertEqual(("ksTree", 1), obj_to_kn5.SHADERS["trees"])

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


class PlantShadowTest(unittest.TestCase):
    def test_a_track_lets_its_plants_receive_shadows_and_cast_none(self):
        """Plants in a house's or a hill's shade stood bright; casting too, the crossed quads put black wedges on each other."""
        self.assertIn("[SHADER_REPLACEMENT_...]\nMATERIALS = trees\nSHADER = ksTree_ppshadows\nCAST_SHADOWS = 0\n",
                      make_track_folder.EXT_CONFIG)


class TerrainShadowTest(unittest.TestCase):
    def test_a_track_lets_its_ground_cast_shadows_only_at_a_low_sun(self):
        """With shadows all day the terrain shadowed itself: rings around the camera on the asphalt."""
        self.assertIn("[SHADER_REPLACEMENT_...]\nMATERIALS = ground_?\nCAST_SHADOWS = TERRAIN\n", make_track_folder.EXT_CONFIG)


if __name__ == "__main__":
    unittest.main()
