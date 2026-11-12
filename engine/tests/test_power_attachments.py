"""Cable ends meet the rendered insulators, with a deliberately small geometry budget."""
import math
import sys
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import furniture
import powerlines
from scenery import propsmesh


class PoleAttachmentTest(unittest.TestCase):
    def test_pole_has_three_low_cost_insulators_and_wires_touch_their_tips(self):
        for height in (7., 9.2, 12.):
            for yaw in (0., 37., 90.):
                rows = [[0, 4., 8., 100., yaw, 1., height, 0.]]
                solid, deco, _, _ = propsmesh.build(['pole'], rows, None)
                self.assertIsNotNone(deco, 'the pole needs visible insulators above its cross-arm')
                self.assertLessEqual(len(deco[2]), 36, 'three insulators at 12 triangles each')
                self.assertLessEqual(len(deco[0]), 24, 'eight vertices per insulator, shared within it')
                wires = furniture.wire_lines([(4., 8., 100., yaw, height), (34., 8., 102., yaw, height)])
                self.assertEqual(len(wires), 3)
                for wire in wires:
                    self.assertLess(np.linalg.norm(deco[0] - wire[0], axis=1).min(), 1e-8)
                # The middle conductor must clear the pole head, not emerge from its wooden body.
                self.assertGreater(wires[1][0, 2], 100. + height)
                self.assertTrue(np.isfinite(solid[0]).all())

    def test_high_voltage_insulator_tips_match_the_same_arms_passed_to_rust(self):
        solid, deco = propsmesh.Builder(), propsmesh.Builder()
        x, y, z, yaw = 10., -5., 100., .71
        propsmesh._pylon(solid, deco, x, y, z, yaw)
        points = np.array(deco.P)
        for lateral, height, *_ in powerlines.ARMS:
            endpoint = np.array([x - math.sin(yaw) * lateral, y + math.cos(yaw) * lateral, z + height])
            self.assertLess(np.linalg.norm(points - endpoint, axis=1).min(), 1e-8)

    def test_insulator_is_closed_non_degenerate_and_twelve_triangles(self):
        builder = propsmesh.Builder()
        propsmesh._insulator(builder, [0., 0., 1.], [0., 0., 1.25], .12)
        self.assertEqual((len(builder.P), len(builder.T)), (8, 12))
        points, _, tris = builder.mesh()
        faces = points[tris]
        self.assertTrue((np.linalg.norm(np.cross(faces[:, 1] - faces[:, 0], faces[:, 2] - faces[:, 0]), axis=1) > 1e-9).all())
        edges = {}
        for tri in tris:
            for a, b in zip(tri, np.roll(tri, -1)):
                edge = tuple(sorted((int(a), int(b))))
                edges[edge] = edges.get(edge, 0) + 1
        self.assertTrue(all(n == 2 for n in edges.values()))


if __name__ == '__main__':
    unittest.main()
