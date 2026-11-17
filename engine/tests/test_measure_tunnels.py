"""Tunnel measurements use the geometry retained by a Map2Lap build."""
import sys
import tempfile
import unittest
from unittest import mock
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
import measure_tunnels  # noqa: E402


class TunnelScanTest(unittest.TestCase):
    def test_tunnel_chunks_read_editor_data_and_convert_north_to_ac_z(self):
        with tempfile.TemporaryDirectory() as tmp:
            tiles = Path(tmp) / "tiles"
            tiles.mkdir()
            (tiles / "roads_1_0_0.json").write_text(
                '{"chunks": [], "editor": {"chunks": [{"tunnel": true, "deck": true, '
                '"portal": [true, false], "tunnel_h": 6.8, "w": 8, '
                '"n": [[1, 2, 3], [5, 6, 7]]}]}}', encoding="utf-8")
            chunks = measure_tunnels.tunnel_chunks(Path(tmp))
        self.assertEqual(len(chunks), 1)
        np.testing.assert_array_equal(chunks[0]["n"], [[1, 3, -2], [5, 7, -6]])

    def test_gap_is_physical_area_at_either_terrain_resolution(self):
        self.assertEqual(measure_tunnels.gap_area(3, 1), 3)
        self.assertEqual(measure_tunnels.gap_area(1, 2), 4)

    def test_blocked_checks_road_width_and_ignores_missing_ground(self):
        p = np.array([0.0, 0.0])
        out = np.array([1.0, 0.0])
        def ground(q):
            z = np.zeros(len(q))
            z[(q[:, 0] == 7) & (q[:, 1] > 0)] = 1.2
            z[q[:, 0] == 3] = np.nan
            return z
        self.assertAlmostEqual(measure_tunnels.blocked(p, out, 4.0, 0.0, 0.0, ground), 1.2)

    def test_cover_more_than_one_metre_below_the_missing_ground_leaves_a_gap(self):
        self.assertTrue(measure_tunnels.uncovered(346.0, np.nan, 340.0, [343.2]))
        self.assertFalse(measure_tunnels.uncovered(346.0, np.nan, 340.0, [345.2]))
        self.assertFalse(measure_tunnels.uncovered(346.0, 346.0, 340.0, []))

    def test_a_six_metre_paint_triangle_is_reportable(self):
        tri = np.array([[[0, 340, 0], [1, 346, 0], [0, 346, 1]]], float)
        self.assertEqual(measure_tunnels.marking_spans(tri).tolist(), [6.0])

    def test_gap_uses_the_obj_floor_not_the_chunk_ribbon(self):
        class Mesh:
            def top(self, kind, q):
                return np.full(len(q), np.nan)

            def hits(self, kind, q):
                return [np.zeros(0) for _ in q]

        q = np.array([[5.0, 0.0]])
        with mock.patch.object(measure_tunnels, "_ground_reference", return_value=np.array([340.0])):
            bad, depth = measure_tunnels._gap_points(Mesh(), q, 2.0)
        self.assertTrue(bad[0], "a chunk describes a floor, but the saved OBJ has no triangle at this point")

    def test_joint_rise_uses_the_whole_connected_tunnel_depth(self):
        class Frame:
            def enu_to_geodetic(self, x, y, z):
                return 0.0, 0.0, 0.0

        floors = [{"n": np.array([[a, 100, 0], [a + 10, 100, 0]], float), "portal": (a == 0, a == 20)}
                  for a in (0, 10, 20)]
        cover = [np.array([0.0, 2.0]), np.array([2.0, 4.0]), np.array([4.0, 20.0])]
        found = measure_tunnels._joint_findings(floors, cover, Frame())
        self.assertTrue(any(abs(row["x"] - 10.0) < 0.1 for row in found))


if __name__ == "__main__":
    unittest.main()
