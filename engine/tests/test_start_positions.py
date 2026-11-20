"""Native AC timing planes and grid, pit and hotlap spawns."""
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src")))
import generator  # noqa: E402,F401  (sets the engine's import path)
from track import kn5, obj_to_kn5  # noqa: E402


def road():
    """A sloping drivable plane covering east- and north-going test routes. Pure."""
    p = np.array([[0, 10, 0], [400, 30, 0], [400, 30, -400], [0, 10, -400]], float)
    return {"1ROAD_ground_0_0": ("road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}


def positions(nodes):
    """AC matrix-node positions by name. Pure."""
    return {n.name: np.asarray(n.matrix[12:15]) for n in nodes}


class StartPositionsTest(unittest.TestCase):
    def test_grid_pits_and_hotlap_are_just_before_native_start(self):
        anchor = {"route": [[0, 0], [400, 0]], "timing": {"start_m": 100, "finish_m": 350}}
        nodes, base = obj_to_kn5.start_empties(road(), anchor)
        p = positions(nodes)
        for k in range(4):
            expected = [97 - 8 * k, 10 + .05 * (97 - 8 * k) + obj_to_kn5.START_LIFT, 0]
            np.testing.assert_allclose(p[f"AC_START_{k}"], expected)
            np.testing.assert_allclose(p[f"AC_PIT_{k}"], expected)
        np.testing.assert_allclose(p["AC_HOTLAP_START_0"], p["AC_START_0"])
        np.testing.assert_allclose(base, p["AC_START_0"])
        self.assertAlmostEqual((p["AC_AB_START_L"][0] + p["AC_AB_START_R"][0]) / 2, 100)
        self.assertAlmostEqual((p["AC_AB_FINISH_L"][0] + p["AC_AB_FINISH_R"][0]) / 2, 350)
        self.assertNotIn("AC_TIME_0_L", p)

    def test_actual_visible_gate_wins_over_original_start_distance(self):
        timing = {"start_m": 100, "finish_m": 350, "gates": {
            "start": {"pos": [130, 16.5, 0], "fwd": [1, 0, 0], "left": 6, "right": 4},
            "finish": {"pos": [350, 27.5, 0], "fwd": [1, 0, 0], "left": 6, "right": 4}}}
        nodes, _ = obj_to_kn5.start_empties(road(), {"route": [[0, 0], [400, 0]], "timing": timing})
        self.assertAlmostEqual(positions(nodes)["AC_START_0"][0], 127)

    def test_grid_follows_a_bend_before_the_start(self):
        anchor = {"route": [[0, 0], [60, 0], [60, 300]], "timing": {"start_m": 70, "finish_m": 300}}
        nodes, _ = obj_to_kn5.start_empties(road(), anchor)
        p = positions(nodes)
        for k, (x, z) in enumerate([(60, -7), (59, 0), (51, 0), (43, 0)]):
            np.testing.assert_allclose(p[f"AC_START_{k}"][[0, 2]], [x, z])

    def test_grid_cannot_be_placed_beyond_start_when_road_is_missing(self):
        p = np.array([[95, 10, -5], [400, 10, -5], [400, 10, 5], [95, 10, 5]], float)
        objs = {"1ROAD_ground_0_0": ("road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}
        anchor = {"route": [[0, 0], [400, 0]], "timing": {"start_m": 100, "finish_m": 350}}
        with self.assertRaisesRegex(RuntimeError, "before.*start"):
            obj_to_kn5.start_empties(objs, anchor)

    def test_route_without_stage_timing_keeps_its_original_grid(self):
        nodes, base = obj_to_kn5.start_empties(road(), {"route": [[0, 0], [400, 0]]})
        self.assertAlmostEqual(base[0], 26)
        self.assertIn("AC_TIME_0_L", positions(nodes))


def circuit(**timing):
    """A square with 300 m sides and pin 1 halfway along its eastbound side. Pure."""
    return {"kind": "circuit", "route": [[150, 50], [300, 50], [300, 350], [0, 350], [0, 50], [150, 50]],
            "timing": {"start_m": 0.0, "twice": [], **timing}}


def folded_circuit(east=0.0, north=0.0, **timing):
    """A tight fold at the seam inside a larger lap and its flat road surface. Pure."""
    anchor = circuit(**timing)
    route = [[-10, -6.24], [-8, -5.74], [-18, 3.76], [-40, 43.76], [90, 43.76], [90, -56.24],
             [-2, -6.74], [-10, -6.24]]
    anchor["route"] = [[round(x + east, 2), round(y + north, 2)] for x, y in route]
    _, _, uv, faces = next(iter(road().values()))
    corners = np.array([[-100, 0, 100], [100, 0, 100], [100, 0, -100], [-100, 0, -100]])
    return {"1ROAD_ground_0_0": ("road", corners, uv, faces)}, anchor


class CircuitStartTest(unittest.TestCase):
    def test_line_is_across_the_road_at_pin_1(self):
        nodes, _ = obj_to_kn5.start_empties(road(), circuit())
        p = positions(nodes)
        left, right = p["AC_TIME_0_L"], p["AC_TIME_0_R"]
        np.testing.assert_allclose((left + right) / 2, [150, 17.5 + obj_to_kn5.START_LIFT, -50], atol=0.1)
        np.testing.assert_allclose(np.abs(left - right), [0, 0, 2 * obj_to_kn5.AB_HALF_M], atol=1e-10)

    def test_grid_stands_before_the_line_across_the_seam(self):
        nodes, base = obj_to_kn5.start_empties(road(), circuit())
        p = positions(nodes)
        for k in range(4):
            x = 150 - 3 - 8 * k
            expected = [x, 10 + 0.05 * x + obj_to_kn5.START_LIFT, -50]
            np.testing.assert_allclose(p[f"AC_START_{k}"], expected)
            np.testing.assert_allclose(p[f"AC_PIT_{k}"], expected)
        np.testing.assert_allclose(p["AC_HOTLAP_START_0"], p["AC_START_0"])
        np.testing.assert_allclose(base, p["AC_START_0"])
        self.assertFalse(any(name.startswith("AC_AB_") for name in p))

    def test_line_moves_forward_off_a_twice_driven_span(self):
        _, _, line = obj_to_kn5.circuit_empties(road(), circuit(twice=[[0, 40]]))
        self.assertEqual(line, 80.0)

    def test_grid_window_checks_twice_driven_spans_across_the_seam(self):
        _, _, line = obj_to_kn5.circuit_empties(road(), circuit(twice=[[1190, 1200]]))
        self.assertEqual(line, 40.0)

    def test_line_moves_forward_from_under_a_bridge(self):
        objs = road()
        _, _, uv, faces = next(iter(objs.values()))
        deck = np.array([[130, 22.5, -45], [170, 24.5, -45], [170, 24.5, -55], [130, 22.5, -55]])
        objs["1ROAD_deck_bridge"] = "road", deck, uv, faces
        np.testing.assert_allclose(obj_to_kn5.road_levels(objs, 150, -50), [17.5, 23.5])
        _, _, line = obj_to_kn5.circuit_empties(objs, circuit())
        self.assertEqual(line, 62.0)

    def test_line_moves_if_its_full_span_crosses_another_part_of_the_lap(self):
        anchor = circuit()
        anchor["route"] = [[100, 50], [350, 50], [350, 350], [60, 350], [60, 57], [120, 57], [120, 65],
                           [50, 65], [50, 50], [100, 50]]
        _, _, line = obj_to_kn5.circuit_empties(road(), anchor)
        self.assertEqual(line, 22.0)

    def test_crossing_the_same_point_on_two_passes_counts_twice(self):
        route = [[0, 0], [2, 2], [2, 0], [0, 2], [0, 0]]
        self.assertFalse(obj_to_kn5.crosses_once(route, [1, 0.5], [1, 1.5]))

    def test_float32_line_moves_off_the_fold_at_pin_1(self):
        objs, anchor = folded_circuit()
        nodes, _, line = obj_to_kn5.circuit_empties(objs, anchor)
        p = positions(nodes)
        # KN5 packs every empty's transform into float32. Inspect the endpoints that the game uses.
        ends = np.array([p[name][[0, 2]] for name in ("AC_TIME_0_L", "AC_TIME_0_R")], np.float32) * [1, -1]
        self.assertTrue(obj_to_kn5.crosses_once(anchor["route"], *ends))
        self.assertEqual(line, 4.0)

    def test_given_line_cannot_count_a_crossing_away_from_its_own_place(self):
        objs, anchor = folded_circuit(east=-0.15, north=-0.11, line_m=0.0)
        with self.assertRaisesRegex(RuntimeError, "No place for start/finish"):
            obj_to_kn5.circuit_empties(objs, anchor)

    def test_no_place_within_search_stops_the_build(self):
        with self.assertRaisesRegex(RuntimeError, r"^No place for start/finish within 300 m after pin 1: "
                                    r"move pin 1 onto a stretch driven once, away from bridges$"):
            obj_to_kn5.start_empties(road(), circuit(twice=[[0, 400]]))

    def test_given_line_m_is_kept(self):
        nodes, _, line = obj_to_kn5.circuit_empties(road(), circuit(line_m=120.0))
        p = positions(nodes)
        self.assertEqual(line, 120.0)
        np.testing.assert_allclose((p["AC_TIME_0_L"] + p["AC_TIME_0_R"]) / 2,
                                   [270, 23.5 + obj_to_kn5.START_LIFT, -50])

    def test_given_line_m_cannot_move_away_from_a_bad_span(self):
        with self.assertRaisesRegex(RuntimeError, "No place for start/finish"):
            obj_to_kn5.start_empties(road(), circuit(line_m=30.0, twice=[[0, 40]]))

    def test_convert_records_the_placed_line_in_the_anchor_and_kn5(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            obj = path / "track.obj"
            obj.write_text("o 1ROAD_ground_0_0\nusemtl road\n"
                           "v 0 10 0\nv 400 30 0\nv 400 30 -400\nv 0 10 -400\n"
                           "vt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\n"
                           "f 1/1 2/2 3/3\nf 1/1 3/3 4/4\n", encoding="utf-8")
            (path / "track.mtl").write_text("newmtl road\nmap_Kd road.png\n", encoding="utf-8")
            Image.new("RGB", (1, 1), (80, 80, 80)).save(path / "road.png")
            anchor = path / "anchor.json"
            anchor.write_text(json.dumps(circuit(twice=[[0, 40]])), encoding="utf-8")
            (path / "data").mkdir()
            out = path / "track.kn5"
            obj_to_kn5.convert(str(obj), str(out), str(anchor), log=lambda _: None)
            self.assertEqual(json.loads(anchor.read_text(encoding="utf-8"))["timing"]["line_m"], 80.0)
            p = positions(n for n in kn5.read(out)["root"].children if n.cls == 1)
            np.testing.assert_allclose((p["AC_TIME_0_L"] + p["AC_TIME_0_R"]) / 2,
                                       [230, 21.5 + obj_to_kn5.START_LIFT, -50], atol=1e-5)


if __name__ == "__main__":
    unittest.main()
