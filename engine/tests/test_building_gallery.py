"""The roof comparison gallery covers supported forms, mapped dimensions and explicit fallbacks."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
import building_gallery


class GalleryTest(unittest.TestCase):
    def test_onion_and_spherical_examples_use_tall_roofs_on_small_square_towers(self):
        import numpy as np
        cases = building_gallery.cases()
        for index, shape in ((23, "onion"), (27, "spherical")):
            case = cases[index]
            self.assertEqual(case["attrs"]["roof_shape"], shape)
            width, depth = np.ptp(building_gallery.footprint(case["footprint"]), axis=0)
            self.assertEqual(width, 6.)
            self.assertEqual(depth, 6.)
            self.assertGreaterEqual(case["attrs"]["roof_height"], .9 * width)
            self.assertAlmostEqual(case["attrs"]["height"] - case["attrs"]["roof_height"], 9.)
            self.assertEqual(case["attrs"]["num_floors"], 3)

    def test_every_gallery_roof_is_now_drawn_as_requested(self):
        import buildings as bld
        for case in building_gallery.cases():
            with self.subTest(title=case["title"]):
                spec = bld.plan(building_gallery.footprint(case["footprint"]), case["attrs"], lat=46.6, lon=14.6)
                self.assertEqual(spec.roof, case["attrs"]["roof_shape"])

    def test_catalogue_includes_every_overture_roof_shape_and_both_orientations(self):
        cases = building_gallery.cases()
        shapes = {c["attrs"].get("roof_shape") for c in cases}
        self.assertTrue({"flat", "gabled", "hipped", "skillion", "pyramidal", "half_hipped", "mansard", "gambrel",
                         "dome", "onion", "round", "saltbox", "sawtooth", "spherical"} <= shapes)
        self.assertTrue({"along", "across"} <= {c["attrs"].get("roof_orientation") for c in cases})
        self.assertTrue({1., 3., 5.} <= {c["attrs"].get("roof_height") for c in cases})
        self.assertEqual(len(cases), len({c["title"] for c in cases}))


if __name__ == "__main__":
    unittest.main()
