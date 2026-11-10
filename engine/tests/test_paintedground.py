"""Painted ground materials for the library (tools/painted_ground.py): one for every look the build draws, seamless, in the
build's colours, with a normal map that lights the painted relief."""
import io
import os
import sys
import unittest

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "tools"))
import painted_ground  # noqa: E402
from scenery import groundcover, roadtex  # noqa: E402

PX, DENSITY = 96, 0.05      # (small and thin: the look's rules, not its pixels)


class PaintedGroundTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.targets = painted_ground.targets()
        cls.made = {name: painted_ground.paint(name, cls.targets, px=PX, density=DENSITY, seed=3) for name in painted_ground.LOOKS}

    def test_every_look_the_build_draws_has_a_painted_one(self):
        comic = set(groundcover.make_textures.__globals__["LOOKS_NEW"]) | {"gc_meadow", "gc_forest", "gc_urban", "gc_rock", "gc_wetland"}
        comic |= {f"gc_field{k}" for k in range(len(groundcover.FIELD_LOOKS))}
        comic |= {"road_asphalt", "road_concrete", "road_gravel", "road_dirt", "road_cobble", "edge_dirt", "stream_bank", "stream_bed"}
        self.assertLessEqual(comic, set(painted_ground.LOOKS))
        self.assertIn("rock_face", painted_ground.LOOKS)

    def test_mixtures_of_snow_rock_scree_and_grass(self):
        for name in ("snow_scree", "snow_grass", "snow_rock", "rock_grass", "scree_grass"):
            self.assertIn(name, painted_ground.LOOKS)

    def test_seamless(self):
        for name, (colour, _normal, _rough) in self.made.items():
            a = np.asarray(colour, float)
            across = np.abs(a[0] - a[-1]).mean() + np.abs(a[:, 0] - a[:, -1]).mean()
            inside = np.abs(a[PX // 2] - a[PX // 2 - 1]).mean() + np.abs(a[:, PX // 2] - a[:, PX // 2 - 1]).mean()
            self.assertLess(across, 1.6 * inside + 6, name)

    def test_the_build_s_colours_and_brightness(self):
        for name, (colour, _normal, _rough) in self.made.items():
            mean = np.asarray(colour, float).reshape(-1, 3).mean(0)
            target = painted_ground.target_of(name, self.targets)
            self.assertLess(np.abs(mean - target).max(), 6, (name, mean.round(), target))

    def test_normals_point_out_of_the_ground_and_roughness_is_one_channel(self):
        for name, (_colour, normal, rough) in self.made.items():
            n = np.asarray(normal, float) / 127.5 - 1
            self.assertGreater(n[..., 2].min(), 0.2, name)
            self.assertLess(np.abs(np.linalg.norm(n, axis=-1) - 1).max(), 0.05, name)
            self.assertEqual(rough.mode, "L", name)

    def test_a_road_material_is_named_and_sized_as_the_build_repeats_it(self):
        look = painted_ground.LOOKS["road_asphalt"]
        self.assertEqual(look.metres, 4.0)
        self.assertEqual(look.category, "asphalt")
        self.assertTrue(look.name.endswith("(painted)"))

    def test_shipped_maps_are_jpeg_close_to_the_painted_ones(self):
        colour, normal, rough = self.made["gc_meadow"]
        for image in (colour, normal, rough):
            raw = painted_ground.encoded(image)
            self.assertEqual(raw[:3], b"\xff\xd8\xff")
            back = np.asarray(Image.open(io.BytesIO(raw)), float)
            self.assertLess(np.abs(back - np.asarray(image, float)).mean(), 6)      # (fine blades: a few levels on average)


if __name__ == "__main__":
    unittest.main()
