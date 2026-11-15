"""Roof overhangs have downward-facing soffits and outward-facing rims in exported building geometry."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import buildings as bld
from buildings import mesh


class EavesTest(unittest.TestCase):
    def test_pitched_buildings_have_visible_undersides_outside_the_walls(self):
        ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
        for shape in ("gabled", "hipped", "skillion", "pyramidal", "half_hipped", "mansard", "gambrel", "saltbox", "round", "sawtooth", "dome", "onion", "spherical"):
            for direction in (None, 45.):
                with self.subTest(shape=shape, direction=direction):
                    spec = bld.plan(ring, {"class": "house", "height": 10., "roof_height": 3.,
                                          "roof_shape": shape, "roof_direction": direction})
                    spec.porch = False
                    p, uv, t, _, _, _ = bld.build([(spec, 0., 0.)])
                    normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                    self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                    under = normals[:, 2] < -1e-8
                    if shape in ("onion", "spherical"):
                        under &= p[t, 2].max(axis=1) <= spec.height + 1e-8  # The bulb itself also faces down.
                    undersides = t[under]
                    self.assertGreater(len(undersides), 0)
                    centres = p[undersides].mean(axis=1)
                    if shape == "sawtooth":
                        self.assertGreaterEqual(p[undersides, 2].min(), spec.height - .12 - 1e-7)
                    self.assertTrue(np.all((centres[:, 0] < 0.) | (centres[:, 0] > 16.) |
                                           (centres[:, 1] < 0.) | (centres[:, 1] > 8.)))
                    self.assertAlmostEqual(p[:, 2].max(), 10.)
                    self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())

    def test_outer_roof_edges_are_closed_by_outward_rims(self):
        ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
        spec = bld.plan(ring, {"class": "house", "height": 10., "roof_height": 3., "roof_shape": "gambrel"})
        spec.porch = False
        p, _, t, _, _, _ = bld.build([(spec, 0., 0.)])
        normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
        outward = []
        for axis, bound, sign in ((0, -mesh.EAVE_M, -1), (0, 16. + mesh.EAVE_M, 1),
                                  (1, -mesh.EAVE_M, -1), (1, 8. + mesh.EAVE_M, 1)):
            rim = np.all(np.isclose(p[t, axis], bound), axis=1) & np.isclose(normals[:, 2], 0.)
            self.assertTrue(rim.any())
            self.assertTrue((normals[rim, axis] * sign > 0.).all())
            outward.extend(t[rim].tolist())
        self.assertGreater(len(outward), 0)


if __name__ == "__main__":
    unittest.main()
