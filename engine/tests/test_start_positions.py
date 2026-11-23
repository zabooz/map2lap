"""Native AC timing planes and grid, pit and hotlap spawns."""
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock
from zipfile import ZipFile

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src")))
import generator  # noqa: E402,F401  (sets the engine's import path)
from track import kn5, obj_to_kn5, route_race  # noqa: E402


def road(depth=400):
    """A sloping drivable plane covering east- and north-going test routes. Pure."""
    p = np.array([[0, 10, 0], [400, 30, 0], [400, 30, -depth], [0, 10, -depth]], float)
    return {"1ROAD_ground_0_0": ("road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}


def positions(nodes):
    """AC matrix-node positions by name. Pure."""
    return {n.name: np.asarray(n.matrix[12:15]) for n in nodes}


class StartPositionsTest(unittest.TestCase):
    def timed_route_files(self, default_models=None, *, legacy=False):
        path = Path(self.enterContext(tempfile.TemporaryDirectory()))
        obj = path / "track.obj"
        writer = generator.make_obj.Obj(obj, header=False)
        for name, (material, p, uv, faces) in road().items():
            writer.add(name, material, p[:, [0, 2, 1]] * [1, -1, 1], uv, faces)
        writer.close()
        (path / "track.mtl").write_text("newmtl road\nmap_Kd road.png\nnewmtl paint\nmap_Kd road.png\n", encoding="utf-8")
        Image.new("RGB", (1, 1), (80, 80, 80)).save(path / "road.png")
        (path / "ui").mkdir()
        (path / "ui/ui_track.json").write_text('{"name": "Timed Route", "run": "point-to-point"}', encoding="utf-8")
        if default_models is not None:
            (path / route_race.DEFAULT).write_text(default_models, encoding="utf-8")
        anchor = path / "anchor.json"
        timing = {"start_m": 0.0, "finish_m": 300.0, "approach": [[0, 30]]}
        if legacy:
            timing = {"start_m": 50.0, "finish_m": 300.0}
        anchor.write_text(json.dumps({"kind": "route", "route": [[50, 30], [400, 30]], "timing": timing}), encoding="utf-8")
        return path

    def convert_timed_route(self, default_models=None):
        path = self.timed_route_files(default_models)
        model = path / "track.kn5"
        obj_to_kn5.convert(str(path / "track.obj"), str(model), str(path / "anchor.json"), log=lambda _: None)
        return model

    def test_long_nose_clears_the_near_edge_of_the_band(self):
        model = self.convert_timed_route()
        points = kn5.scan(model)["points"]
        self.assertLess(points["AC_START_0"][12] + 2.5, points["AC_AB_START_L"][12] - generator.gates.SQUARE_M)

    def test_all_six_painted_slots_follow_their_road_faces_up_to_the_edge(self):
        folder = self.timed_route_files()
        anchor = folder / "anchor.json"
        config = json.loads(anchor.read_text())
        config["route"] = [[50, .8], [400, .8]]
        config["timing"]["approach"] = [[0, .8]]
        anchor.write_text(json.dumps(config))
        model = folder / "track.kn5"
        obj_to_kn5.convert(str(folder / "track.obj"), str(model), str(anchor), log=lambda _: None)
        scan = kn5.scan(model)
        marks = [m for m in scan["meshes"] if m["name"].startswith("nocol_grid_")]
        self.assertEqual(len(marks), 6)
        with model.open("rb") as stream:
            for k, mark in enumerate(marks):
                self.assertEqual(mark["name"], f"nocol_grid_{k}")
                xyz = kn5.mesh_arrays(stream, mark)[0]["pos"]
                self.assertGreater(xyz[:, 0].min(), scan["points"][f"AC_START_{k}"][12])
                self.assertLessEqual(xyz[:, 2].max(), 0)
                np.testing.assert_allclose(xyz[:, 1], 10 + xyz[:, 0] * .05 + generator.gates.BAND_LIFT, atol=2e-5)

    def test_unmarked_road_still_has_six_white_grid_brackets(self):
        folder = self.timed_route_files()
        (folder / "track.mtl").write_text("newmtl road\nmap_Kd road.png\n")
        model = folder / "track.kn5"
        obj_to_kn5.convert(str(folder / "track.obj"), str(model), str(folder / "anchor.json"), log=lambda _: None)
        scan = kn5.scan(model)
        marks = [m for m in scan["meshes"] if m["name"].startswith("nocol_grid_")]
        self.assertEqual(len(marks), 6)
        paint = next(i for i, m in enumerate(scan["materials"]) if m.name == "paint")
        self.assertEqual({m["material"] for m in marks}, {paint})
        texture = scan["materials"][paint].maps[0][2]
        _, offset, size = next(t for t in scan["textures"] if t[0] == texture)
        with model.open("rb") as stream:
            stream.seek(offset)
            with Image.open(io.BytesIO(stream.read(size))) as image:
                self.assertEqual(image.convert("RGB").getextrema(), ((230, 230),) * 3)

    def test_track_config_hides_stock_grid_crew_locally(self):
        folder = self.timed_route_files()
        with mock.patch.object(generator.make_track_folder, "AC", str(folder)):
            root = Path(generator.make_track_folder.make("route", "Route", obj=str(folder / "track.obj"),
                        route=[[50, 30], [400, 30]], preview=None, log=lambda _: None))
        self.assertEqual(int(json.loads((root / "ui/ui_track.json").read_text())["pitboxes"]), 6)
        config = (root / "extension/ext_config.ini").read_text()
        self.assertIn("[SCRIPT_...]", config)
        self.assertIn("Meccanico_PALETTA", config)
        self.assertIn("setVisible(false)", config)

    def test_legacy_route_with_native_gates_reports_point_to_point(self):
        folder = self.timed_route_files(legacy=True)
        target = folder / "legacy.kn5"
        prepare = mock.Mock(return_value=str(target))
        obj_to_kn5.convert(str(folder / "track.obj"), None, str(folder / "anchor.json"), log=lambda _: None,
                          prepare_output=prepare)
        prepare.assert_called_once_with(True)
        self.assertTrue(route_race.has_gates(kn5.scan(target)["points"]))

    def test_missing_texture_cleans_up_the_mesh_chunks(self):
        folder = self.timed_route_files()
        (folder / "road.png").unlink()
        with self.assertRaises(FileNotFoundError):
            obj_to_kn5.convert(str(folder / "track.obj"), str(folder / "track.kn5"),
                              str(folder / "anchor.json"), log=lambda _: None)
        self.assertFalse((folder / "kn5_parts").exists())

    def test_timed_route_build_installs_native_gates_and_sectors_in_one_model(self):
        model = self.convert_timed_route()
        points = kn5.scan(model)["points"]
        self.assertTrue(set(route_race.GATES) <= points.keys())
        self.assertFalse(set(route_race.ALIASES.values()) & points.keys())
        self.assertTrue({f"AC_TIME_{i}_{side}" for i in (1, 2) for side in "LR"} <= points.keys())
        for path in (route_race.DEFAULT, route_race.RACE, route_race.PRACTICE_MODEL, route_race.RACE_MODEL, route_race.UI):
            self.assertFalse((model.parent / path).exists())

    def test_rebuild_keeps_foreign_model_configuration_and_native_ab_gates(self):
        custom = "[MODEL_0]\nFILE=track.kn5\n"
        model = self.convert_timed_route(default_models=custom)
        self.assertEqual(custom, (model.parent / route_race.DEFAULT).read_text(encoding="utf-8"))
        self.assertFalse((model.parent / route_race.RACE).exists())
        self.assertTrue(set(route_race.GATES) <= kn5.scan(model)["points"].keys())

    def test_route_sector_lines_divide_the_checked_start_to_finish_distance(self):
        route = [[0, 0], [400, 0]]
        timing = {"start_m": 100, "finish_m": 350, "gates": {
            "start": {"pos": [130, 16.5, 0], "fwd": [1, 0, 0], "left": 6, "right": 4},
            "finish": {"pos": [340, 27, 0], "fwd": [1, 0, 0], "left": 6, "right": 4}}}
        nodes, _ = obj_to_kn5.start_empties(road(), {"route": route, "timing": timing})
        p = positions(nodes)
        for k, x in ((1, 200), (2, 270)):
            self.assertAlmostEqual(p[f"AC_TIME_{k}_L"][0], x)
            self.assertAlmostEqual(p[f"AC_TIME_{k}_R"][0], x)

    def test_route_sector_line_moves_away_from_a_second_crossing(self):
        route = [[50, 60], [250, 60], [250, 66.75], [200, 66.75], [200, 100]]
        timing = {"start_m": 30, "finish_m": 280}
        objs = {"1ROAD_stage": strip(50, 73), "1ROAD_finish": ("road",
                np.array([[195, 4, -60], [205, 4, -60], [205, 4, -115], [195, 4, -115]], float),
                np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}
        gates = obj_to_kn5.ab_gates(objs, route, timing)
        nodes, metres = obj_to_kn5.route_splits(objs, {"route": route, "timing": timing}, gates)
        self.assertEqual(len(nodes), 4)
        self.assertNotAlmostEqual(metres[1], 30 + 2 * (280 - 30) / 3)
        vertices = np.asarray(route)
        p = positions(nodes)
        for k, metre in enumerate(metres, 1):
            a, b = (p[f"AC_TIME_{k}_{side}"][[0, 2]] * [1, -1] for side in "LR")
            hits = obj_to_kn5._path_crossings(vertices, a, b, closed=False)
            self.assertEqual(sum(map(len, hits)), 1, metre)

    def test_grid_pits_and_hotlap_are_just_before_native_start(self):
        anchor = {"route": [[0, 0], [400, 0]], "timing": {"start_m": 100, "finish_m": 350}}
        nodes, base = obj_to_kn5.start_empties(road(), anchor)
        p = positions(nodes)
        for k in range(6):
            expected = [96 - 8 * k, 10 + .05 * (96 - 8 * k) + obj_to_kn5.START_LIFT, 0]
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
        self.assertAlmostEqual(positions(nodes)["AC_START_0"][0], 126)

    def test_grid_follows_a_bend_before_the_start(self):
        anchor = {"route": [[0, 0], [60, 0], [60, 300]], "timing": {"start_m": 70, "finish_m": 300}}
        nodes, _ = obj_to_kn5.start_empties(road(), anchor)
        p = positions(nodes)
        for k, (x, z) in enumerate([(60, -6), (58, 0), (50, 0), (42, 0), (34, 0), (26, 0)]):
            np.testing.assert_allclose(p[f"AC_START_{k}"][[0, 2]], [x, z])

    def test_grid_cannot_be_placed_beyond_start_when_road_is_missing(self):
        p = np.array([[95, 10, -5], [400, 10, -5], [400, 10, 5], [95, 10, 5]], float)
        objs = {"1ROAD_ground_0_0": ("road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]]))}
        anchor = {"route": [[0, 0], [400, 0]], "timing": {"start_m": 100, "finish_m": 350}}
        with self.assertRaisesRegex(RuntimeError, "before.*start"):
            obj_to_kn5.start_empties(objs, anchor)

    def test_route_without_stage_timing_keeps_its_original_grid(self):
        nodes, base = obj_to_kn5.start_empties(road(), {"route": [[0, 0], [400, 0]]})
        self.assertAlmostEqual(base[0], 42)
        self.assertIn("AC_TIME_0_L", positions(nodes))

    def test_route_start_stays_at_pin_with_room_on_its_approach(self):
        route = [[50, 0], [400, 0]]
        timing = {"start_m": 0, "finish_m": 280, "approach": [[5, 0]]}
        nodes, _ = obj_to_kn5.start_empties(road(), {"route": route, "timing": timing})
        p = positions(nodes)
        self.assertAlmostEqual(p["AC_AB_START_L"][0], 50)
        for k in range(6):
            self.assertAlmostEqual(p[f"AC_START_{k}"][0], 46 - 8 * k)

    def test_route_start_moves_only_enough_to_fit_its_grid(self):
        route = [[10, 0], [400, 0]]
        timing = {"start_m": 0, "finish_m": 150, "approach": [[0, 0]]}
        nodes, _ = obj_to_kn5.start_empties(road(), {"route": route, "timing": timing})
        p = positions(nodes)
        self.assertAlmostEqual(p["AC_AB_START_L"][0], 44)
        self.assertAlmostEqual(p["AC_HOTLAP_START_0"][0], 40)
        self.assertAlmostEqual(p["AC_START_5"][0], 0)


def circuit(**timing):
    """A square with 300 m sides and pin 1 halfway along its eastbound side. Pure."""
    return {"kind": "circuit", "route": [[150, 50], [300, 50], [300, 350], [0, 350], [0, 50], [150, 50]],
            "timing": {"start_m": 0.0, "twice": [], **timing}}


def circuit_roads(anchor=None, width=24.0):
    """Sloping road strips that follow the synthetic lap, joined at bends. Pure."""
    route = np.asarray((anchor or circuit())["route"], float)
    roads = {}
    half = width / 2
    for index, (a, b) in enumerate(zip(route, route[1:])):
        forward = (b - a) / np.linalg.norm(b - a)
        side = np.array([-forward[1], forward[0]]) * half
        lo, hi = a - half * forward, b + half * forward
        enu = np.array([lo - side, hi - side, hi + side, lo + side])
        p = np.column_stack([enu[:, 0], 10 + .05 * enu[:, 0], -enu[:, 1]])
        roads[f"1ROAD_road_{index}"] = "road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]])
    return roads


def folded_circuit(east=0.0, north=0.0, **timing):
    """A tight fold at the seam inside a larger lap and its flat road surface. Pure."""
    anchor = circuit(**timing)
    route = [[-10, -6.24], [-8, -5.74], [-18, 3.76], [-40, 43.76], [90, 43.76], [90, -56.24],
             [-2, -6.74], [-10, -6.24]]
    anchor["route"] = [[round(x + east, 2), round(y + north, 2)] for x, y in route]
    return circuit_roads(anchor), anchor


def long_circuit(depth=325, **timing):
    anchor = circuit(**timing)
    anchor["route"][2][1] = anchor["route"][3][1] = 50 + depth
    return anchor


class CircuitStartTest(unittest.TestCase):
    def circuit_part(self, anchor):
        """Place the timing lines and write the gantry using the Circuit build path."""
        folder = self.enterContext(tempfile.TemporaryDirectory())
        nodes, base, _, _, _ = obj_to_kn5._circuit_part(circuit_roads(anchor), anchor, [], folder,
                                                       os.path.join(folder, "gate.obj"), lambda _: None)
        return nodes, base

    def test_line_is_across_the_road_at_pin_1(self):
        nodes, _ = self.circuit_part(circuit())
        p = positions(nodes)
        left, right = p["AC_TIME_0_L"], p["AC_TIME_0_R"]
        np.testing.assert_allclose((left + right) / 2, [150, 17.5 + obj_to_kn5.START_LIFT, -50], atol=0.1)
        np.testing.assert_allclose(np.abs(left - right), [0, 0, 24], atol=1e-10)

    def test_grid_stands_before_the_line_across_the_seam(self):
        nodes, base = self.circuit_part(circuit())
        p = positions(nodes)
        for k in range(6):
            x = 150 - 4 - 8 * k
            expected = [x, 10 + 0.05 * x + obj_to_kn5.START_LIFT, -50]
            np.testing.assert_allclose(p[f"AC_START_{k}"], expected)
            np.testing.assert_allclose(p[f"AC_PIT_{k}"], expected)
        np.testing.assert_allclose(p["AC_HOTLAP_START_0"], p["AC_START_0"])
        np.testing.assert_allclose(base, p["AC_START_0"])
        self.assertFalse(any(name.startswith("AC_AB_") for name in p))

    def test_line_moves_forward_off_a_twice_driven_span(self):
        _, _, line = obj_to_kn5.circuit_empties(circuit_roads(), circuit(twice=[[0, 40]]))
        self.assertEqual(line, 98.0)

    def test_grid_window_checks_twice_driven_spans_across_the_seam(self):
        _, _, line = obj_to_kn5.circuit_empties(circuit_roads(), circuit(twice=[[1190, 1200]]))
        self.assertEqual(line, 58.0)

    def test_line_moves_forward_from_under_a_bridge(self):
        objs = circuit_roads()
        _, _, uv, faces = next(iter(objs.values()))
        deck = np.array([[130, 22.5, -45], [170, 24.5, -45], [170, 24.5, -55], [130, 22.5, -55]])
        objs["1ROAD_deck_bridge"] = "road", deck, uv, faces
        np.testing.assert_allclose(obj_to_kn5.road_levels(objs, 150, -50), [17.5, 23.5])
        _, _, line = obj_to_kn5.circuit_empties(objs, circuit())
        self.assertEqual(line, 78.0)

    def test_line_moves_if_its_full_span_crosses_another_part_of_the_lap(self):
        anchor = circuit()
        anchor["route"] = [[100, 50], [350, 50], [350, 350], [60, 350], [60, 57], [120, 57], [120, 65],
                           [50, 65], [50, 50], [100, 50]]
        _, _, line = obj_to_kn5.circuit_empties(circuit_roads(anchor), anchor)
        self.assertGreater(line, 20.0)

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
        self.assertGreater(line, 0.0)

    def test_given_line_cannot_count_a_crossing_away_from_its_own_place(self):
        objs, anchor = folded_circuit(east=-0.15, north=-0.11, line_m=0.0)
        with self.assertRaisesRegex(RuntimeError, "No place for start/finish"):
            obj_to_kn5.circuit_empties(objs, anchor)

    def test_no_place_within_search_stops_the_build(self):
        with self.assertRaisesRegex(RuntimeError, r"^No place for start/finish within 300 m after pin 1: "
                                    r"move pin 1 onto a stretch driven once, away from bridges$"):
            self.circuit_part(circuit(twice=[[0, 400]]))

    def test_given_line_m_is_kept(self):
        nodes, _, line = obj_to_kn5.circuit_empties(circuit_roads(), circuit(line_m=120.0))
        p = positions(nodes)
        self.assertEqual(line, 120.0)
        np.testing.assert_allclose((p["AC_TIME_0_L"] + p["AC_TIME_0_R"]) / 2,
                                   [270, 23.5 + obj_to_kn5.START_LIFT, -50])

    def test_given_line_m_cannot_move_away_from_a_bad_span(self):
        with self.assertRaisesRegex(RuntimeError, "No place for start/finish"):
            self.circuit_part(circuit(line_m=30.0, twice=[[0, 40]]))

    def test_convert_records_the_start_and_junction_adjusted_sectors_in_the_anchor_and_kn5(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            obj = path / "track.obj"
            layout = long_circuit(twice=[[0, 40]])
            # The second ideal split would land in this T-junction on the west side of the lap.
            z = 98 + 2 * 1250 / 3 - 1150
            features = [{"spec": {"width": 10}, "geometry": [line]}
                        for line in ([[0, -200], [0, z], [0, -275]], [[0, z], [-30, z]])]
            with ZipFile(obj.with_suffix(".editor.zip"), "w") as archive:
                archive.writestr("tile.json", json.dumps({"features": features}))
            writer = generator.make_obj.Obj(obj, header=False)
            for name, (material, p, uv, faces) in circuit_roads(layout, width=28.0).items():
                writer.add(name, material, p[:, [0, 2, 1]] * [1, -1, 1], uv, faces)
            writer.close()
            (path / "track.mtl").write_text("newmtl road\nmap_Kd road.png\nnewmtl paint\nmap_Kd road.png\n", encoding="utf-8")
            Image.new("RGB", (1, 1), (80, 80, 80)).save(path / "road.png")
            anchor = path / "anchor.json"
            anchor.write_text(json.dumps(layout), encoding="utf-8")
            (path / "data").mkdir()
            out = path / "track.kn5"
            obj_to_kn5.convert(str(obj), str(out), str(anchor), log=lambda _: None)
            timing = json.loads(anchor.read_text(encoding="utf-8"))["timing"]
            self.assertEqual(timing["line_m"], 98.0)
            first, second = timing["sector_m"]
            self.assertAlmostEqual(first, 98 + 1250 / 3)
            self.assertAlmostEqual(abs(second - (98 + 2 * 1250 / 3)), 6.0)
            children = kn5.read(out)["root"].children
            p = positions(n for n in children if n.cls == 1)
            np.testing.assert_allclose((p["AC_TIME_0_L"] + p["AC_TIME_0_R"]) / 2,
                                       [248, 22.4 + obj_to_kn5.START_LIFT, -50], atol=1e-5)
            route, distances = obj_to_kn5._closed_lap(layout["route"])
            for k, metre in enumerate(timing["sector_m"], 1):
                x, y = (np.interp(metre, distances, column) for column in route.T)
                split = (p[f"AC_TIME_{k}_L"] + p[f"AC_TIME_{k}_R"]) / 2
                np.testing.assert_allclose(split, [x, 10 + .05 * x + obj_to_kn5.START_LIFT, -y], atol=2e-5)
            self.assertEqual(sum(n.name.startswith("nocol_grid_") for n in children), 6)
            self.assertTrue(any(n.name.startswith("nocol_gate_band_circuit") for n in children))
            self.assertEqual(sum(n.name.startswith("nocol_gate_banner") for n in children), 1)
            band = next(n for n in children if n.name.startswith("nocol_gate_band_circuit"))
            self.assertAlmostEqual(float(band.vertices["pos"][:, 0].mean()), 248.0, places=4)
            ends = sorted(p[name][2] for name in ("AC_TIME_0_L", "AC_TIME_0_R"))
            self.assertEqual(ends, [float(band.vertices["pos"][:, 2].min()), float(band.vertices["pos"][:, 2].max())])

    def test_start_refuses_a_gantry_that_would_put_posts_in_its_neighbour_road(self):
        anchor = circuit()
        anchor["route"] = [[350, 50], [700, 50], [700, 65.75], [0, 65.75], [0, 50], [350, 50]]
        objs = {"1ROAD_wide": strip(38, 62), "1ROAD_neighbour": strip(62.75, 68.75)}
        with self.assertRaisesRegex(RuntimeError, "start/finish"):
            obj_to_kn5.circuit_empties(objs, anchor)


def strip(lo, hi):
    p = np.array([[0, 4, -lo], [700, 4, -lo], [700, 4, -hi], [0, 4, -hi]], float)
    return "road", p, np.zeros((4, 2)), np.array([[0, 1, 2], [0, 2, 3]])


def mapped_junctions(roads):
    features = [{"spec": {"width": 10}, "geometry": [line]} for line in roads]
    with tempfile.TemporaryDirectory() as folder:
        part = Path(folder) / "t_0_0.obj"
        with ZipFile(part.with_suffix(".editor.zip"), "w") as archive:
            archive.writestr("tile.json", json.dumps({"features": features}))
        return obj_to_kn5._mapped_junctions([part])


class CircuitSectorsTest(unittest.TestCase):
    def test_roadless_split_candidates_skip_the_junction_scan(self):
        xy, lengths = obj_to_kn5._closed_lap(circuit()["route"])
        junctions = (np.zeros((1, 3)), np.empty((0, 6)))
        with mock.patch.object(obj_to_kn5.np, "sum", side_effect=AssertionError("Scanned junctions without a road")):
            self.assertIsNone(obj_to_kn5._checked_splits({}, xy, lengths, 0.0, lengths[-1],
                                                        closed=True, junctions=junctions))

    def test_bad_junction_archives_are_skipped_and_reported(self):
        with tempfile.TemporaryDirectory() as folder:
            parts = [Path(folder) / f"t_{i}_0.obj" for i in range(3)]
            parts[0].with_suffix(".editor.zip").write_bytes(b"broken zip")
            with ZipFile(parts[1].with_suffix(".editor.zip"), "w") as archive:
                archive.writestr("different.json", "{}")
            with ZipFile(parts[2].with_suffix(".editor.zip"), "w") as archive:
                archive.writestr("tile.json", '{"features":')
            log = []
            areas, branches = obj_to_kn5._mapped_junctions(parts, log.append)
            self.assertEqual((len(areas), len(branches)), (0, 0))
            self.assertEqual(len(log), len(parts))
            self.assertTrue(all(part.with_suffix(".editor.zip").name in message for part, message in zip(parts, log)))

    def test_bad_road_feature_does_not_hide_valid_junctions_in_the_same_tile(self):
        roads = [[[0, 0], [30, 0]], [[0, 0], [0, 30]], [[-30, 0], [0, 0]]]
        features = [{"spec": {"width": 10}, "geometry": [line]} for line in roads]
        features.insert(1, {"spec": {"class": "residential"}, "geometry": [[[0, 0], [0, -30]]]})
        with tempfile.TemporaryDirectory() as folder:
            part = Path(folder) / "t_0_0.obj"
            with ZipFile(part.with_suffix(".editor.zip"), "w") as archive:
                archive.writestr("tile.json", json.dumps({"features": features}))
            log = []
            areas, branches = obj_to_kn5._mapped_junctions([part], log.append)
            np.testing.assert_array_equal(areas, [[0, 0, 25]])
            self.assertEqual(len(branches), 3)
            self.assertEqual(len(log), 1)
            self.assertIn("width", log[0])

    def test_short_lap_gets_three_sectors(self):
        split_nodes, metres = obj_to_kn5.circuit_splits(circuit_roads(), circuit(), 0.0)
        self.assertEqual(metres, [400.0, 800.0])
        self.assertEqual(set(positions(split_nodes)), {"AC_TIME_1_L", "AC_TIME_1_R", "AC_TIME_2_L", "AC_TIME_2_R"})

    def test_twenty_kilometre_lap_gets_three_sectors(self):
        length = 20_800
        anchor = long_circuit(depth=10_100, line_m=80.0)
        split_nodes, metres = obj_to_kn5.circuit_splits(circuit_roads(anchor), anchor, 80.0)
        np.testing.assert_allclose(metres, 80.0 + np.arange(1, 3) * length / 3)
        self.assertEqual(len(split_nodes), 4)

    def test_split_moves_to_nearest_once_driven_stretch(self):
        anchor = long_circuit(twice=[[611.0, 631.0]])
        _, metres = obj_to_kn5.circuit_splits(circuit_roads(anchor), anchor, 1250 / 6)
        self.assertAlmostEqual(metres[0], 637.0)

    def test_split_moves_off_an_overpass_to_the_lower_road(self):
        objs = circuit_roads(long_circuit())
        _, _, uv, faces = next(iter(objs.values()))
        deck = np.array([[140, 24, -365], [162, 25, -365], [162, 25, -385], [140, 24, -385]])
        objs["1ROAD_deck_bridge"] = "road", deck, uv, faces
        split_nodes, metres = obj_to_kn5.circuit_splits(objs, long_circuit(), 1250 / 6)
        p = positions(split_nodes)
        x, y, z = (p["AC_TIME_1_L"] + p["AC_TIME_1_R"]) / 2
        self.assertNotAlmostEqual(metres[0], 625.0)
        self.assertEqual(z, -375.0)
        self.assertAlmostEqual(y, 10 + .05 * x + obj_to_kn5.START_LIFT)

    def test_split_spans_its_road_without_touching_the_parallel_road(self):
        objs = {"1ROAD_south": strip(47, 53), "1ROAD_north": strip(53.75, 59.75)}
        anchor = circuit()
        anchor["route"] = [[350, 50], [700, 50], [700, 56.75], [0, 56.75], [0, 50], [350, 50]]
        nodes, metres = obj_to_kn5.circuit_splits(objs, anchor, 1413.5 / 6)
        self.assertAlmostEqual(metres[0], 706.75)
        p = positions(nodes)
        lo, hi = sorted(-p[f"AC_TIME_1_{side}"][2] for side in "LR")
        self.assertLessEqual(lo, 53.75)
        self.assertGreater(lo, 53)
        self.assertGreaterEqual(hi, 59.75)

    def test_contiguous_split_width_stays_at_the_height_of_its_road(self):
        lower = strip(47, 53)
        material, corners, uv, faces = strip(53, 59)
        corners[:, 1] += 12 * corners[:, 0] / 700
        objs = {"1ROAD_lower": lower, "1ROAD_upper": (material, corners, uv, faces)}
        intervals = obj_to_kn5._road_intervals(objs, np.array([350.0, 4.15, -50.0]), np.array([0.0, -1.0]), own_level=True)
        self.assertEqual(obj_to_kn5._containing_span(intervals), (-3.0, 3.0))

    def test_mapped_t_junction_moves_a_split_off_its_mouth(self):
        anchor = long_circuit()
        junctions = mapped_junctions([[[100, -375], [150, -375], [200, -375]], [[150, -375], [150, -400]]])
        _, metres = obj_to_kn5.circuit_splits(circuit_roads(anchor), anchor, 1250 / 6, junctions)
        self.assertAlmostEqual(metres[0], 631.0)

    def test_split_moves_beyond_the_paved_mouth_of_an_acute_junction(self):
        anchor = long_circuit()
        junctions = mapped_junctions([[[100, -375], [144, -375], [220, -375]],
                                      [[144, -375], [220, -392]]])
        _, metres = obj_to_kn5.circuit_splits(circuit_roads(anchor), anchor, 1250 / 6, junctions)
        self.assertGreater(metres[0], 636.0)

    def test_figure_eight_uses_the_selected_road_at_a_split(self):
        anchor = circuit()
        a, b, c, d = np.asarray([[25, 45], [375, 375], [25, 375], [375, 25]], float)
        anchor["route"] = np.array([a, b, c, d, a]).tolist()
        objs = circuit_roads(anchor)
        fraction, _ = np.linalg.solve(np.column_stack((b - a, c - d)), c - a)
        crossing = a + fraction * (b - a)
        _, lengths = obj_to_kn5._closed_lap(anchor["route"])
        under = float(fraction * lengths[1])
        line_m = (under - lengths[-1] / 3) % lengths[-1]
        along = (d - c) / np.linalg.norm(d - c)
        across = np.array([-along[1], along[0]])
        enu = np.array([crossing + u * along + v * across for u, v in [(-12, -4), (12, -4), (12, 4), (-12, 4)]])
        deck = np.column_stack([enu[:, 0], 16 + .05 * enu[:, 0], -enu[:, 1]])
        _, _, uv, faces = next(iter(objs.values()))
        objs["1ROAD_deck_bridge"] = "road", deck, uv, faces
        nodes, metres = obj_to_kn5.circuit_splits(objs, anchor, line_m)
        self.assertNotAlmostEqual(metres[0], under)
        p = positions(nodes)
        left, right = p["AC_TIME_1_L"], p["AC_TIME_1_R"]
        self.assertTrue(obj_to_kn5.crosses_once(anchor["route"], left[[0, 2]] * [1, -1], right[[0, 2]] * [1, -1]))
        x = float(np.interp(metres[0], lengths, np.array([a, b, c, d, a])[:, 0]))
        y = left[1]
        self.assertAlmostEqual(y, 10 + .05 * x + obj_to_kn5.START_LIFT)

    def test_lines_keep_room_for_each_other(self):
        placed = obj_to_kn5._sector_sites(90, 3, lambda d: True if d in (24, 34) else None)
        self.assertEqual(placed, [(24, True), (34, True)])


if __name__ == "__main__":
    unittest.main()
