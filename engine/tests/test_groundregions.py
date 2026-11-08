"""Spatial render palettes preserve every assignment, including dense and filtered junctions."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import groundregions


class RegionTest(unittest.TestCase):
    def test_four_materials_in_one_tile_get_local_palettes_without_losing_pixels(self):
        weights = {}
        for k in range(4):
            values = np.zeros((32, 32), np.float32)
            values[:, k * 8:(k + 1) * 8] = 1
            weights[f"material-{k}"] = values
        plan = groundregions.plan(weights, capacity=3, min_side=4, filter_radius=1)
        self.assertEqual([], plan["overflow"])
        seen = np.zeros((32, 32), np.uint8)
        for region in plan["regions"]:
            x0, y0, x1, y1 = region["bounds"]
            seen[y0:y1, x0:x1] += 1
            for token, values in weights.items():
                if values[y0:y1, x0:x1].any():
                    self.assertIn(token, region["palette"])
            self.assertLessEqual(len(region["palette"]), 3)
        np.testing.assert_array_equal(seen, np.ones_like(seen))
        self.assertEqual(set(weights), {token for r in plan["regions"] for token in r["palette"]})
        self.assertEqual(plan, json.loads(json.dumps(plan)))

    def test_soft_junction_keeps_all_five_contributions_and_reports_the_shader_limit(self):
        weights = {f"material-{k}": np.full((8, 8), .2, np.float32) for k in range(5)}
        plan = groundregions.plan(weights, capacity=3, min_side=4, filter_radius=1)
        self.assertTrue(plan["overflow"])
        for number in plan["overflow"]:
            self.assertEqual(set(weights), set(plan["regions"][number]["palette"]))
        self.assertEqual(5, plan["required_capacity"])

    def test_filtering_counts_materials_beyond_a_region_edge_and_at_coarse_mips(self):
        weights = {}
        for k in range(4):
            values = np.zeros((16, 16), np.float32)
            values[:, k * 4:(k + 1) * 4] = 1
            weights[str(k)] = values
        near = groundregions.plan(weights, capacity=3, min_side=2, filter_radius=1)
        self.assertFalse(near["overflow"])
        left = near["regions"][0]
        self.assertIn("2", left["palette"], "bilinear support extends beyond the left half")
        distant = groundregions.plan(weights, capacity=3, min_side=2, filter_radius=16)
        self.assertTrue(distant["overflow"], "coarse filtering must not discard distant materials")
        self.assertEqual(4, distant["required_capacity"])
        self.assertEqual(1, len(distant["regions"]), "identical global filter support cannot benefit from further splitting")

    def test_invalid_weights_are_rejected_instead_of_normalized_or_simplified(self):
        for values in (np.array([[np.nan]]), np.array([[-.1]]), np.array([[1.1]]), np.zeros((2, 2, 3))):
            with self.subTest(values=values), self.assertRaises(ValueError):
                groundregions.plan({"a": values})
        with self.assertRaises(ValueError):
            groundregions.plan({"a": np.zeros((2, 2)), "b": np.zeros((4, 4))})

    def test_probe_retains_all_input_weights_and_reports_its_rendering_gap(self):
        sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
        import ground_regions
        with tempfile.TemporaryDirectory() as temporary:
            report = ground_regions.run(Path(temporary), size=32, materials=6)
            saved = json.loads(Path(temporary, "report.json").read_text(encoding="utf-8"))
            self.assertEqual(report, saved)
            self.assertFalse(saved["gpu_verified"])
            self.assertTrue(saved["runs"]["stripes_near"]["fits"])
            self.assertFalse(saved["runs"]["junction_near"]["fits"])
            self.assertFalse(saved["runs"]["stripes_far"]["fits"])
            with np.load(Path(temporary, "junction.npz"), allow_pickle=False) as source:
                self.assertEqual(6, len(source.files))
                self.assertEqual((32, 32), source[source.files[0]].shape)
                for token in source.files:
                    self.assertGreater(float(source[token][16, 16]), 0)


if __name__ == "__main__":
    unittest.main()
