"""Street lamps at night: the glass of each lamp head is its own material, and CSP finds the lamps by it."""
import os
import re
import sys
import unittest

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
from scenery import propsmesh  # noqa: E402
from track import make_obj, make_track_folder, objectlist, obj_to_kn5  # noqa: E402

GROUPS = ["streetlight", "pole", "polelamp", "bin"]
ROWS = [[0, 0.0, 0.0, 100.0, 0.0, 1.0, 9.0, 0.5],
        [1, 40.0, 0.0, 100.0, 0.0, 1.0, 8.0, 0.5], [2, 40.0, 0.0, 107.0, 0.0, 1.0, 1.1, 0.5],
        [3, 80.0, 0.0, 100.0, 0.0, 1.0, 1.0, 0.5]]


def built():
    """(the meshes of a streetlight, a pole with its lamp and a bin, their objects, whose each vertex of the glass is)."""
    marks = []
    solid, deco, glass, _trees = propsmesh.build(GROUPS, ROWS, None, marks)
    objects = objectlist.TileList()
    _, _, of_glass = make_obj._props_listed(objects, GROUPS, ROWS, marks, solid, deco, glass, {})
    return solid, deco, glass, objects, of_glass


def section(name, key):
    """The first section of EXT_CONFIG that has the line key = ... ; its text."""
    for part in re.split(r"(?m)^(?=\[)", make_track_folder.EXT_CONFIG):
        if part.startswith(f"[{name}") and re.search(rf"(?m)^{key}\s*=", part):
            return part
    raise AssertionError(f"no [{name}] with {key}")


class GlassTest(unittest.TestCase):
    def test_each_lamp_has_glass_of_its_own(self):
        _, _, glass, objects, of_glass = built()
        self.assertEqual(["streetlight", "pole", "polelamp", "bin"], objects.sorts)
        self.assertEqual({0, 2}, set(of_glass.tolist()))         # (the lamp's, the pole's own has none, a bin neither)
        self.assertEqual(len(glass[0]), len(of_glass))

    def test_the_glass_hangs_at_the_head_under_the_arm(self):
        _, _, glass, _, of_glass = built()
        street = glass[0][of_glass == 0]
        self.assertTrue((abs(street[:, 2] - (100.0 + 9.0 - 0.5)) < 0.1).all())    # (the build's z is up; just under the top)
        self.assertAlmostEqual(1.6, float(street[:, 0].mean()), places=1)

    def test_the_rest_of_the_lamp_keeps_no_glass(self):
        _, deco, glass, _, _ = built()
        yellow = {tuple(uv) for uv in glass[1].round(5).tolist()}
        self.assertFalse(yellow & {tuple(uv) for uv in deco[1].round(5).tolist()})

    def test_no_lamp_no_glass_mesh(self):
        self.assertIsNone(propsmesh.build(["bin"], [[0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.5]], None, [])[2])

    def test_the_glass_is_a_listed_mesh(self):
        self.assertIsNone(objectlist.problem("nocol_props_glass_3_-4", True))
        self.assertIsNotNone(objectlist.problem("nocol_props_glass_3_-4", False))

    def test_the_material_is_the_furniture_s_image(self):
        self.assertEqual(make_obj.MATERIALS["props"], make_obj.MATERIALS["lamp_glass"])

    def test_it_stays_as_far_as_the_lamp(self):
        self.assertEqual(obj_to_kn5.view("nocol_props_3_4")[0], obj_to_kn5.view("nocol_props_glass_3_4")[0])


class CspTest(unittest.TestCase):
    def test_the_condition_is_known_to_the_track(self):
        self.assertIn("[INCLUDE: common/conditions.ini]", make_track_folder.EXT_CONFIG)

    def test_csp_finds_a_lamp_by_its_glass(self):
        lights = section("LIGHT_SERIES", "MATERIALS")
        self.assertRegex(lights, r"(?m)^MATERIALS\s*=\s*lamp_glass$")
        self.assertRegex(lights, r"(?m)^DIRECTION\s*=\s*0,\s*-1,\s*0$")
        self.assertRegex(lights, r"(?m)^CONDITION\s*=\s*NIGHT_SMOOTH$")

    def test_one_light_per_lamp(self):
        lights = section("LIGHT_SERIES", "MATERIALS")
        threshold = float(re.search(r"(?m)^CLUSTER_THRESHOLD\s*=\s*([\d.]+)", lights).group(1))
        self.assertGreater(threshold, 0.6)      # the glass of one head: a box of 0.5 m
        self.assertLess(threshold, 5.0)         # the closest two lamps: both sides of a road's middle

    def test_lamps_throw_no_shadow_of_their_own(self):
        self.assertRegex(section("LIGHT_SERIES", "MATERIALS"), r"(?m)^SHADOWS\s*=\s*0$")

    def test_the_glass_glows_at_night_only(self):
        glow = section("MATERIAL_ADJUSTMENT", "MATERIALS")
        self.assertRegex(glow, r"(?m)^MATERIALS\s*=\s*lamp_glass$")
        self.assertRegex(glow, r"(?m)^KEY_0\s*=\s*ksEmissive$")
        self.assertRegex(glow, r"(?m)^VALUE_0_OFF\s*=\s*0,\s*0,\s*0$")
        self.assertRegex(glow, r"(?m)^CONDITION\s*=\s*NIGHT_SMOOTH$")


if __name__ == "__main__":
    unittest.main()
