"""The version-7 AI line follows the final KN5, including its grid and lap seam."""
from pathlib import Path
import hashlib
import json
import sys
import tempfile
import unittest
from zipfile import ZipFile

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: F401 (sets the engine's import path)
from track import editorinfo, fastlane, kn5, obj_to_kn5


class LaneCodeVersionTest(unittest.TestCase):
    def test_line_sources_match_code_version(self):
        from track import ailinestate

        folder = Path(ailinestate.__file__).parent
        digest = hashlib.sha256()
        for name in ("fastlane", "airacing", "aicorridor", "aibends", "ailinestate", "aicorrections"):
            # Text mode makes the same source hash identical on CRLF and LF checkouts.
            digest.update((folder / f"{name}.py").read_text(encoding="utf-8").encode("utf-8"))
            digest.update(b"\0")
        expected = (3, "c076fb5304258f10882204572d064e1b69e71adb50376a2fefaf2a64f0cd93da")
        self.assertEqual(expected, (ailinestate.CODE_VERSION, digest.hexdigest()),
                         "Bump CODE_VERSION and update the pair for code changes. "
                         "For comments alone, update only the digest.")


class AILineTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.model = self.folder / "test.kn5"
        (self.folder / "data").mkdir()
        self.lane = self.folder / "ai/fast_lane.ai"

    def write_track(self, route, *, circuit=False, road_start=-10, road_end=120, prefix="AC", height=9,
                    strips=None, grid=None, obstacles=()):
        forward = (1, 0, 0)
        root = obj_to_kn5.empty("root", (0, 0, 0), (0, 0, 1))
        grid = grid or [(x, 10, forward) for x in (17, 9, 1)]
        for i, (x, z, direction) in enumerate(grid):
            root.children.append(obj_to_kn5.empty(f"AC_START_{i}", (x, height + .15, z), direction))
        gates = (("AC_TIME_0", 20),) if circuit else ((f"{prefix}_AB_START", 20), (f"{prefix}_AB_FINISH", 80))
        for gate, x in gates:
            for side, z in (("L", 5), ("R", 15)):
                root.children.append(obj_to_kn5.empty(f"{gate}_{side}", (x, height + .15, z), forward))
        strips = strips or [(road_start, road_end, 0, 55)]
        for i, (start, end, low, high) in enumerate(strips):
            vertices = np.zeros(4, dtype=kn5.VERTEX)
            for y in (height, height + 8):
                vertices["pos"] = [(start, y, low), (end, y, low), (end, y, high), (start, y, high)]
                root.children.append(kn5.Node(2, f"1ROAD_{i}_{y}", 1, vertices=vertices.copy(), bs_center=(0, 0, 0),
                                             indices=np.array([0, 1, 2, 0, 2, 3], dtype=np.uint16)))
        for name, positions in obstacles:
            vertices = np.zeros(4, dtype=kn5.VERTEX)
            vertices["pos"] = positions
            root.children.append(kn5.Node(2, name, 1, vertices=vertices, bs_center=(0, 0, 0),
                                          indices=np.array([0, 1, 2, 0, 2, 3], dtype=np.uint16)))
        kn5.write(self.model, [], [], root)
        (self.folder / "data/map2lap_route.txt").write_text(
            "anchor 0 0\n" + "".join(f"{x} {z}\n" for x, z in route))

    def generate(self, circuit=False):
        log = []
        fastlane.regenerate(self.model, circuit=circuit, log=log.append)
        return log

    def test_saved_move_survives_calculation_on_its_racing_line_and_invalidates_metadata(self):
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        before = fastlane.read_lane(self.lane)[0]["pos"].copy()
        old_key = ailinestate.input_key(self.model, False)
        move = {"id": "move-one", "kind": "move", "free": False, "range": 10, "routeOffset": 3,
                "anchor": {"metre": 30, "level": 9, "origin": [0, 0],
                           "context": [[45, 10], [50, 10], [55, 10]]}}
        recipe = self.folder / "data/map2lap.json"
        recipe.write_text(json.dumps({"edits": {"aiCorrections": [move]}}))
        self.assertNotEqual(old_key, ailinestate.input_key(self.model, False))
        self.assertEqual("pending", ailinestate.inspect(self.model, False)["status"])
        from unittest.mock import patch
        from app import ailanejobs
        with patch.object(ailanejobs, "compute", wraps=ailanejobs.compute) as worker:
            self.assertEqual("ready", ailanejobs.ensure(self.model, False)["status"])
            self.assertEqual("ready", ailanejobs.ensure(self.model, False)["status"])
            self.assertEqual(1, worker.call_count)
        after = fastlane.read_lane(self.lane)[0]["pos"]
        inside = abs(before[:, 0]-50) < 10
        expected = 1.5*(1 + np.cos(np.pi*(before[inside, 0]-50)/10))
        np.testing.assert_allclose(after[inside, 2], before[inside, 2]-expected, atol=1e-5)
        self.assertEqual("ready", ailinestate.inspect(self.model, False)["status"])
        meta = self.folder / ailinestate.FILE
        data = json.loads(meta.read_text())
        self.assertEqual([move], data["corrections"])
        data["corrections"] = []
        meta.write_text(json.dumps(data))
        self.assertEqual("pending", ailinestate.inspect(self.model, False)["status"])

    def test_rebuilt_route_resolves_the_directed_passage_or_reports_ambiguity(self):
        from track.aicorrections import Route
        anchor = {"metre": 50, "context": [[45, 0], [50, 0], [55, 0]], "origin": [0, 0], "level": 9}
        rebuilt = Route(np.array([[-20, 0], [49.6, 0], [80, 0]]), [0, 0], False)
        self.assertEqual((70, 9), rebuilt.resolve(anchor))
        repeated = Route(np.array([[0, 0], [80, 0], [0, 0], [80, 0]]), [0, 0], False)
        with self.assertRaisesRegex(ValueError, "Unresolved route anchor at route metre 50.0"):
            repeated.resolve(anchor)

    def test_fixed_or_overlapping_moves_leave_a_located_error(self):
        self.write_track([(20, 10), (80, 10)])
        for centre, duplicate, reason in [(0, False, "Fixed"), (30, True, "Overlap")]:
            x = 20 + centre
            move = {"kind": "move", "id": "a", "range": 8, "routeOffset": 2, "free": False,
                    "anchor": {"metre": centre, "level": 9, "origin": [0, 0],
                               "context": [[max(20,x-5),10],[x,10],[x+5,10]]}}
            moves = [move, dict(move, id="b")] if duplicate else [move]
            (self.folder / "data/map2lap.json").write_text(json.dumps({"edits":{"aiCorrections":moves}}))
            log = self.generate()
            self.assertTrue(self.lane.exists(), log)
            self.assertRegex(" ".join(log), reason + ".*route metre")

    def test_wall_skips_only_its_move_in_build_race_and_editor(self):
        from app import ailanejobs
        from server_editor import _move_preview
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        before = fastlane.read_lane(self.lane)[0]["pos"].copy()
        def move(mid, offset):
            x = mid+20
            return dict(id=str(mid), kind="move", free=False, range=5, routeOffset=offset,
                        anchor=dict(metre=mid, level=9, origin=[0,0], context=[[x-5,10],[x,10],[x+5,10]]))
        moves = [move(16, 80), move(42, 3)]
        path = self.folder / "data/map2lap.json"
        path.write_text(json.dumps({"edits": {"aiCorrections": moves}}))
        for launch in ("build", "race", "button"):
            if launch == "build":
                self.generate()
            else:
                if launch == "race":
                    self.lane.unlink()
                self.assertEqual("ready", ailanejobs.ensure(self.model, False, force=launch=="button")["status"])
            after = fastlane.read_lane(self.lane)[0]["pos"]
            np.testing.assert_array_equal(before[abs(before[:,0]-36)<5], after[abs(before[:,0]-36)<5])
            self.assertGreater((before-after)[:,2].max(), 2.8)
            diagnostics = json.loads((self.folder / ailinestate.FILE).read_text())["skipped"]
            self.assertEqual(["16"], list(diagnostics))
            self.assertIn("route metre", diagnostics["16"])
        self.assertEqual(moves, json.loads(path.read_text())["edits"]["aiCorrections"])
        self.assertEqual(diagnostics, _move_preview(self.model, {"aiCorrections": moves})["skipped"])

    def test_legacy_delta_without_its_original_reference_is_skipped(self):
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        before = self.lane.read_bytes()
        old = dict(id="old", kind="move", range=10, offset=2, free=False,
                   anchor=dict(metre=30, level=9, origin=[0,0], context=[[45,10],[50,10],[55,10]]))
        (self.folder / "data/map2lap.json").write_text(json.dumps({"edits": {"aiCorrections":[old]}}))
        self.assertIn("Legacy move needs to be redrawn at route metre 30.0", " ".join(self.generate()))
        self.assertEqual(before, self.lane.read_bytes())

    def test_move_target_survives_a_different_automatic_line(self):
        from track import aicorrections, airacing
        path = np.array([[0,0],[60,0]])
        route = aicorrections.Route(path, [0,0], False)
        m = np.arange(61)
        ribbon = airacing.RouteRibbon(np.zeros(61,bool), None, None, None, m, [])
        move = dict(id="a", kind="move", free=False, range=10, routeOffset=4,
                    anchor=dict(metre=30, level=0, origin=[0,0], context=route.context(30).tolist()))
        for z in (0, -2):
            xyz = np.column_stack([m,np.zeros(61),np.full(61,z)]).astype(float)
            side = np.tile([0,0,-1.], (61,1))
            out, mask = route.moves([move], ribbon, xyz, side, 2.5)
            np.testing.assert_allclose(out[30], [30,0,-4])
            np.testing.assert_array_equal(out[~mask], xyz[~mask])
            self.assertAlmostEqual(out[25,2], (z-4)/2)


    def test_save_carries_current_or_manual_line_only_for_matching_inputs(self):
        from unittest.mock import patch
        from app import ailanejobs
        from track import ailinestate
        route = [(20, 10), (80, 10)]
        self.write_track(route)
        self.generate()
        reference = self.lane.read_bytes()
        target = self.folder / "saved"
        (target / "data").mkdir(parents=True)
        saved = target / "copy.kn5"
        xyz = [(30, 9, 5), (31, 9, 5), (31, 9, 6), (30, 9, 6)]
        for mesh, expected in [("nocol_tree", "ready"), ("nocol_tree", "manual"), ("1WALL_house", "pending")]:
            if expected == "manual":
                self.lane.write_bytes(reference + b"test")
            self.write_track(route, obstacles=[(mesh, xyz)])
            saved.write_bytes(self.model.read_bytes())
            (target / fastlane.ROUTE).write_bytes((self.folder / fastlane.ROUTE).read_bytes())
            ailinestate.carry(self.folder, saved, False)
            state = ailinestate.inspect(saved, False)
            self.assertEqual(expected, state["status"])
            self.assertEqual(expected != "pending", (target / fastlane.FILE).exists())
            if expected != "pending":
                self.assertEqual(self.lane.read_bytes(), (target / fastlane.FILE).read_bytes())

            with patch.object(ailanejobs, "compute", wraps=ailanejobs.compute) as calculate:
                first = ailanejobs.ensure(saved, False)
                self.assertEqual("manual" if expected == "manual" else "ready", first["status"])
                self.assertEqual(first, ailanejobs.ensure(saved, False))
                self.assertEqual(int(expected == "pending"), calculate.call_count)

    def test_manual_line_remains_usable_after_a_failed_publication(self):
        from unittest.mock import patch
        from app import ailanejobs
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        manual = self.lane.read_bytes() + b"manual"
        self.lane.write_bytes(manual)
        replace = ailinestate.os.replace
        def fail_metadata(src, dst):
            if Path(dst) == self.folder / ailinestate.FILE:
                raise PermissionError("cannot replace metadata")
            replace(src, dst)
        with patch.object(ailinestate.os, "replace", side_effect=fail_metadata):
            self.assertEqual("failed", ailanejobs.ensure(self.model, False, force=True)["status"])
        self.assertEqual(manual, self.lane.read_bytes())
        self.assertEqual("manual", ailinestate.inspect(self.model, False)["status"])

    def test_unreadable_route_cannot_leave_its_previous_line_installed(self):
        from app import ailanejobs
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        (self.folder / fastlane.ROUTE).unlink()
        state = ailanejobs.ensure(self.model, False)
        self.assertEqual("failed", state["status"])
        self.assertIn("map2lap_route.txt", state["message"])
        self.assertFalse(self.lane.exists())

    def test_race_and_button_share_work_and_save_discards_old_result(self):
        from concurrent.futures import ThreadPoolExecutor
        from threading import Event
        from unittest.mock import patch
        from app import ailanejobs
        route = [(20, 10), (80, 10)]
        self.write_track(route)
        entered, resume = Event(), Event()
        real = ailanejobs.compute
        calls = []

        def paused(*args):
            calls.append(1)
            result = real(*args)
            if len(calls) == 1:
                entered.set()
                self.assertTrue(resume.wait(5))
            return result

        with patch.object(ailanejobs, "compute", side_effect=paused), ThreadPoolExecutor(2) as pool:
            race = pool.submit(ailanejobs.ensure, self.model, False)
            self.assertTrue(entered.wait(5))
            with ailanejobs.changing(self.model):
                self.write_track(route, height=11)
            button = pool.submit(ailanejobs.ensure, self.model, False, force=True)
            resume.set()
            self.assertEqual("ready", race.result()["status"])
            self.assertEqual("ready", button.result()["status"])
            self.assertEqual(2, len(calls))
            self.assertEqual("ready", ailanejobs.ensure(self.model, False)["status"])
            self.assertEqual(2, len(calls))
        self.assertGreater(fastlane.read_lane(self.lane)[0]["pos"][0, 1], 10.9)

    def test_open_route_begins_behind_the_last_grid_slot_and_passes_the_finish(self):
        self.write_track([(20, 10), (80, 10)], prefix="M2")
        log = self.generate()
        points, detail, tail = fastlane.read_lane(self.lane)
        xyz = points["pos"]
        self.assertLess(xyz[0, 0], 1)
        self.assertGreater(xyz[-1, 0], 80)
        np.testing.assert_allclose(xyz[:, 1], xyz[0, 1])
        self.assertLess(xyz[0, 1], 10, "stay on the grid's lower level along the whole road")
        np.testing.assert_array_equal(points["id"], np.arange(len(points)))
        np.testing.assert_allclose(np.diff(points["length"]), np.linalg.norm(np.diff(xyz, axis=0), axis=1), atol=1e-5)
        np.testing.assert_allclose(detail["length"][[0, -1]], 0)
        np.testing.assert_allclose(detail["left"], 10)   # up × forward points towards decreasing Z here
        np.testing.assert_allclose(detail["right"], 45)
        self.assertEqual(b"", tail)
        self.assertRegex(log[-1], r"AI line: \d+ points in")

    def test_open_line_follows_the_saved_bent_runout_to_its_end(self):
        self.write_track([(20, 10), (80, 10), (93, 10), (107, 22)])
        self.generate()
        points, _, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(points["pos"][-1, [0, 2]], [107, 22], atol=.02)

    def test_short_runout_stops_at_first_road_edge_and_keeps_the_timed_line(self):
        self.write_track([(20, 10), (80, 10)], strips=[(-10, 86.2, 0, 55), (87, 120, 0, 55)])
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        self.assertAlmostEqual(points["pos"][-1, 0], 86.2, delta=.05)

    def test_blocked_turn_in_runout_preserves_the_usable_straight_after_the_finish(self):
        for bend in (80, 90):
            with self.subTest(bend=bend):
                obstacle = ("1KERB_walkcol_corner", [(bend+.45, 9.2, 9.4), (bend+.6, 9.2, 9.4),
                                                     (bend+.6, 9.2, 9.55), (bend+.45, 9.2, 9.55)])
                self.write_track([(20, 10), (bend, 10), (bend, 30)], obstacles=[obstacle])
                log = self.generate()
                self.assertTrue(self.lane.exists(), log)
                points, _, _ = fastlane.read_lane(self.lane)
                np.testing.assert_allclose(points["pos"][-1, [0, 2]], [bend, 10], atol=.02)

    def test_circuit_starts_at_the_kn5_gate_and_closes_without_a_duplicate_point(self):
        self.write_track([(8, 10), (55, 10), (55, 45), (8, 45), (8, 10)], circuit=True)
        self.generate(circuit=True)
        points, detail, _ = fastlane.read_lane(self.lane)
        xyz = points["pos"]
        np.testing.assert_allclose(xyz[0, [0, 2]], [20, 10], atol=1e-5)
        closing = np.linalg.norm(xyz[0] - xyz[-1])
        self.assertGreater(closing, 1.0)
        self.assertLessEqual(closing, 1.51)
        self.assertAlmostEqual(detail["length"][0], closing, places=5)
        np.testing.assert_allclose(detail["forward"][0], [1, 0, 0])
        self.assertGreater(detail["speed"][0], 0)

    def test_rebuild_reads_changed_kn5_and_discards_a_line_if_the_new_road_ends_early(self):
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        self.write_track([(20, 10), (80, 10)], height=13)
        self.generate()
        points, _, _ = fastlane.read_lane(self.lane)
        self.assertAlmostEqual(points["pos"][25, 1] - points["pos"][0, 1], 0)
        self.assertGreater(points["pos"][0, 1], 12.9)
        self.write_track([(20, 10), (80, 10)], road_end=40)
        log = self.generate()
        self.assertFalse(self.lane.exists())
        self.assertRegex(log[-1], r"AI line skipped: .*at route metre \d+")

    def counterbend(self, *, junction=None, obstacle=(), exit_x=62, rounded=False):
        # Three surveyed corners at one paved mouth. The street enters east and leaves almost due south.
        route = [(8, 10), (55, 10), (53.6, 18.8), (53.6, 23.8), (exit_x, 65), (8, 65), (8, 10)]
        self.write_track(route, circuit=True, strips=[(-10, 125, 0, 80)], obstacles=obstacle)
        features = []
        for i, (a, b) in enumerate(zip(route, route[1:])):
            tags = {"junction": junction} if junction and i == 2 else {}
            features.append({"id": str(i), "spec": {"width": 10, "kind": "paved"},
                             "tags": tags, "geometry": [[a, b]]})
        tile = self.folder / "tile.zip"
        with ZipFile(tile, "w") as archive:
            archive.writestr("tile.json", json.dumps({"features": features}))
        editorinfo._publish(self.model, [("0_0", tile)])
        if rounded:
            # Compare the grouping decision upstream of racing offsets. A tagged ring
            # also pins the subsequent optimiser, so final positions can differ.
            scan = kn5.scan(self.model)
            road = fastlane._local_roads(fastlane._roads(self.model, scan["meshes"]))
            mapped, rings = fastlane.aibends.lane_roads(editorinfo.archives(self.model), print)
            _, xz, _ = fastlane._sample(route, scan["points"], True, road, mapped, rings)
        else:
            log = self.generate(circuit=True)
            self.assertTrue(self.lane.exists(), log)
            points, _, _ = fastlane.read_lane(self.lane)
            xz = points["pos"][:, [0, 2]].astype(float)
        step = np.diff(xz, axis=0)
        heading = np.degrees(np.unwrap(np.arctan2(step[:, 1], step[:, 0])))
        bend = (xz[1:-1, 0] > 30) & (xz[1:-1, 1] < 30) & (heading[:-1] < 150)
        return np.diff(heading)[bend]

    def test_short_counterturns_at_one_road_mouth_form_a_single_tangent_arc(self):
        turns = self.counterbend()
        self.assertGreater(turns.sum(), 70)
        self.assertGreater(turns.min(), -.02, "the exit must not unwind the main turn")

    def test_painted_roundabout_keeps_its_entry_and_circulating_turn(self):
        regular = self.counterbend()
        ring = self.counterbend(junction="roundabout")
        self.assertGreater(-ring[ring < 0].sum(), 12, "keep the circulating direction even on flat asphalt")
        self.assertGreater(regular[regular < 0].sum() - ring[ring < 0].sum(), 12,
                           "the ring tag must distinguish this entry from an ordinary junction")

    def test_counterturns_stay_separate_at_a_real_offset_or_a_blocked_mouth(self):
        # A more easterly exit makes a real chicane on the same flat collision road.
        np.testing.assert_array_equal(self.counterbend(rounded=True, exit_x=94),
                                      self.counterbend(rounded=True, exit_x=94, junction="circular"))
        # This raised corner overlaps the replacement but leaves the single fillets free.
        walk = [(42, 9.2, 14), (51.8, 9.2, 14), (51.8, 9.2, 18), (42, 9.2, 18)]
        obstacle = [("1KERB_walkcol_mouth", walk)]
        np.testing.assert_array_equal(self.counterbend(rounded=True, obstacle=obstacle),
                                      self.counterbend(rounded=True, obstacle=obstacle, junction="roundabout"))

    def racing_rectangle(self, *, obstacles=()):
        # A closed 12 m road with square junction corners.
        # Save the reference samples as well so movement near the gate can be measured exactly.
        route = np.array([(0, 10), (100, 10), (100, 80), (0, 80), (0, 10)], float)
        strips = [(-6, 106, 4, 16), (94, 106, 4, 86), (-6, 106, 74, 86), (-6, 6, 4, 86)]
        self.write_track(route, circuit=True, strips=strips, obstacles=obstacles)
        features = []
        for i, (a, b) in enumerate(zip(route[:-1], route[1:])):
            features.append({"id": str(i), "spec": {"kind": "paved", "width": 12},
                             "geometry": [[a.tolist(), b.tolist()]]})
        tile = self.folder / "tile.zip"
        with ZipFile(tile, "w") as archive:
            archive.writestr("tile.json", json.dumps({"features": features}))
        editorinfo._publish(self.model, [("0_0", tile)])
        scan = kn5.scan(self.model)
        road = fastlane._local_roads(fastlane._roads(self.model, scan["meshes"]))
        _, reference, _ = fastlane._sample(route, scan["points"], True, road)
        self.assertTrue(fastlane.regenerate(self.model, circuit=True))
        p, d, _ = fastlane.read_lane(self.lane)
        return reference.astype("f4"), p["pos"][:, [0, 2]], d

    def test_racing_corner_uses_outside_entry_inside_apex_and_outside_exit(self):
        _, xz, _ = self.racing_rectangle()
        entry = xz[(xz[:, 0] > 60) & (xz[:, 0] < 70) & (xz[:, 1] < 20)]
        exit = xz[(xz[:, 1] > 42) & (xz[:, 1] < 49) & (xz[:, 0] > 90)]
        self.assertLess(entry[:, 1].min(), 9)
        self.assertGreater(exit[:, 0].max(), 101)
        apex = xz[np.argmin(np.linalg.norm(xz - [94, 16], axis=1))]
        self.assertGreater(100 - apex[0], 1)
        self.assertGreater(apex[1] - 10, 1)
        self.assertGreaterEqual(np.linalg.norm(apex - [94, 16]), 2.5 - 1e-4)
        self.assertGreaterEqual(xz[:, 1].min(), 4 + 2.5 - 1e-4)

    def test_racing_grid_and_timing_seam_stay_exact_while_free_approach_moves(self):
        old, new, _ = self.racing_rectangle()
        np.testing.assert_array_equal(old[:1], new[:1])
        grid = (old[:, 1] == 10) & (old[:, 0] >= 1) & (old[:, 0] < 20)
        self.assertTrue(grid.any())
        np.testing.assert_array_equal(new[grid], old[grid])
        self.assertGreater(np.max(abs(new - old)), 1)

    def test_racing_painted_ring_keeps_circulation_while_other_bends_use_the_width(self):
        # A painted, fully paved circle with a half-lap between its entry and exit.
        # In AC's X/Z frame decreasing heading is counterclockwise on the map.
        angle = np.linspace(np.pi/2, np.pi/2 - 2*np.pi, 33)
        ring = [80, -5] + 15*np.column_stack((np.cos(angle), np.sin(angle)))
        route = np.vstack(([0, 10], ring[:17], [15, -20], [0, -20], [0, 10]))
        self.write_track(route, circuit=True, strips=[(-7, 105, -28, 18)])
        features = [{"id": "ring", "spec": {"kind": "paved", "width": 8},
                     "tags": {"junction": "roundabout"}, "geometry": [ring.tolist()]}]
        for i in (0, 17, 18, 19):
            features.append({"id": str(i), "spec": {"width": 12},
                             "geometry": [route[i:i+2].tolist()]})
        tile = self.folder / "tile.zip"
        with ZipFile(tile, "w") as archive:
            archive.writestr("tile.json", json.dumps({"features": features}))
        editorinfo._publish(self.model, [("0_0", tile)])
        scan = kn5.scan(self.model)
        road = fastlane._local_roads(fastlane._roads(self.model, scan["meshes"]))
        mapped, rings = fastlane.aibends.lane_roads(editorinfo.archives(self.model), print)
        _, old, _ = fastlane._sample(route, scan["points"], True, road, mapped, rings)
        self.assertTrue(fastlane.regenerate(self.model, circuit=True))
        points, _, _ = fastlane.read_lane(self.lane)
        new = points["pos"][:, [0, 2]]
        inside = fastlane.aibends.ring_vertices(old, rings)
        np.testing.assert_array_equal(new[inside], old[inside].astype("f4"))
        radial = new[inside] - [80, -5]
        heading = np.unwrap(np.arctan2(radial[:, 1], radial[:, 0]))
        self.assertLess(heading[-1] - heading[0], -np.pi*.95)
        self.assertGreater(np.max(abs(new[~inside] - old[~inside])), 1)

    def test_racing_chord_returns_locally_at_a_thin_post_between_samples(self):
        # The original approach is at z=10. The ideal entry swings towards a post
        # between sample planes. The next corner remains free to use the full width.
        post = [(77.5, 9, 7), (77.51, 9, 7), (77.51, 10, 7), (77.5, 10, 7)]
        old, new, _ = self.racing_rectangle(obstacles=[("1WALL_post", post)])
        beside = np.argmin(np.linalg.norm(old - [77.5, 10], axis=1))
        np.testing.assert_array_equal(new[beside-1:beside+2], old[beside-1:beside+2])
        self.assertGreater(np.max(abs(new[old[:, 1] > 40] - old[old[:, 1] > 40])), 1)

    def test_corner_is_rounded_with_room_for_both_sides_of_the_car(self):
        strips = [(-10, 60, 5, 15), (50, 60, 5, 50), (3, 60, 40, 50), (3, 13, 5, 50)]
        self.write_track([(8, 10), (55, 10), (55, 45), (8, 45), (8, 10)], circuit=True, strips=strips)
        self.generate(circuit=True)
        points, detail, _ = fastlane.read_lane(self.lane)
        xz = points["pos"][:, [0, 2]]
        delta = np.roll(xz, -1, axis=0) - xz
        angle = np.unwrap(np.arctan2(delta[:, 1], delta[:, 0]))
        self.assertLess(np.max(np.abs(np.diff(angle))), np.deg2rad(35))
        side = detail["forward"][:, [2, 0]] * [1, -1]
        for x, z in np.vstack((xz + side, xz - side)):
            self.assertTrue(any(a <= x <= b and lo <= z <= hi for a, b, lo, hi in strips), (x, z))

    def test_walk_above_road_limits_the_fillet_and_the_connected_width(self):
        walk = [(30, 9.2, 14), (51, 9.2, 14), (51, 9.2, 32), (30, 9.2, 32)]
        self.write_track([(8, 10), (55, 10), (55, 45), (8, 45), (8, 10)], circuit=True,
                         obstacles=[("1KERB_walkcol_corner", walk)])
        objects = fastlane._roads(self.model, kn5.scan(self.model)["meshes"])
        road = fastlane._local_roads(objects)
        side = fastlane._section(road, np.array([40., 9., 10.]), np.array([0., 0., 1.]), 0)
        with self.subTest("width"):
            self.assertAlmostEqual(side[0], 4)
        log = self.generate(circuit=True)
        self.assertTrue(self.lane.exists(), log)
        pts, details, _ = fastlane.read_lane(self.lane)
        for offset in np.linspace(-1, 1, 9):
            edge = pts["pos"][:, [0, 2]] + offset * details["forward"][:, [2, 0]] * [1, -1]
            x, z = edge.T
            self.assertFalse(((x > 30) & (x < 51) & (z > 14) & (z < 32)).any(), "body overlaps pavement")

    def test_wall_cuts_road_at_car_height_only_and_racing_kerb_is_passable(self):
        def slab(z, low, high):
            return [(25, low, z), (70, low, z), (70, high, z), (25, high, z)]
        self.write_track([(20, 10), (80, 10)], obstacles=[
            ("1WALL_parked_car", slab(13, 9.2, 10.4)),
            ("1WALL_tunnel_roof", slab(11, 14, 15)),
            ("1WALL_lower_road", slab(11, 5, 8)),
            ("1ROAD_buried_terrain", [(25, 7.5, 5), (70, 7.5, 5), (70, 7.5, 15), (25, 7.5, 15)]),
            ("1WALL_deck_soffit", [(25, 8.5, 5), (70, 8.5, 5), (70, 8.5, 15), (25, 8.5, 15)]),
            ("1KERB_racing_apex", slab(12, 9, 9.05))])
        self.generate()
        p, d, _ = fastlane.read_lane(self.lane)
        middle = (p["pos"][:, 0] > 30) & (p["pos"][:, 0] < 65)
        np.testing.assert_allclose(d["right"][middle], 3)

    def test_thin_post_between_samples_blocks_the_swept_car_on_a_straight(self):
        post = [(41.2, 9., 10.5), (41.21, 9., 10.5), (41.21, 10., 10.5), (41.2, 10., 10.5)]
        self.write_track([(20, 10), (80, 10)], obstacles=[("1WALL_post", post)])
        log = self.generate()
        self.assertFalse(self.lane.exists(), log)
        self.assertIn("car width", log[-1])

    def test_oblique_deck_join_supports_the_swept_car_but_an_open_joint_does_not(self):
        # Each tile ends its deck ribbon normal to its own last segment. The two end
        # rows share a centre but their outer tips rotate 6.5 cm on a 10 m wide deck.
        faces = np.array([[0, 1, 4], [0, 4, 3], [1, 2, 5], [1, 5, 4]])
        x = np.array([-5., 0., 5.])
        def deck(start, end):
            return np.column_stack((np.tile(x, 2), np.zeros(6), np.r_[start, end]))

        first = deck(x * 0 - 6, x * 0)
        second = deck(x * .013, x * .013 + 6)
        def fits(offset=0., extra=None, x=0.):
            roads = {"1ROAD_deck_0_-1": (None, first, None, faces),
                     "1ROAD_deck_0_0": (None, second + [0, 0, offset], None, faces)}
            roads.update(extra or {})
            return fastlane._fits_chord(fastlane._local_roads(roads),
                                        np.array([x + .004, 0., -.65]), np.array([x - .005, 0., .85]), 1.)

        self.assertTrue(fits(), "the same deck continues across its shared centre")
        self.assertFalse(fits(x=3.), "the wider opening near the shoulder is outside tyre tolerance")
        self.assertFalse(fits(.05), "a separated second deck leaves a real slot")
        wall = np.array([[-1, 0, 0], [1, 0, 0], [1, .4, 0], [-1, .4, 0]])
        self.assertFalse(fits(extra={"1WALL_fence": (None, wall, None, np.array([[0, 1, 2], [0, 2, 3]]))}))

    def test_short_gap_in_one_wheel_track_between_samples_blocks_the_line(self):
        self.write_track([(20, 10), (80, 10)], strips=[(-10, 41.2, 0, 55), (41.3, 120, 0, 55),
                                                       (41.2, 41.3, 0, 10.5)])
        log = self.generate()
        self.assertFalse(self.lane.exists(), log)
        self.assertIn("car width", log[-1])

    def test_side_street_does_not_widen_the_main_road(self):
        self.write_track([(20, 10), (80, 10)], strips=[(-10, 120, 5, 15), (45, 55, 15, 315)])
        self.generate()
        points, detail, _ = fastlane.read_lane(self.lane)
        across_junction = np.abs(points["pos"][:, 0] - 50) < 4
        np.testing.assert_allclose(detail["right"][across_junction], 5, atol=0.1)
        np.testing.assert_allclose(detail["left"], 5, atol=0.1)

    def test_mapped_road_excludes_the_extra_collision_strip(self):
        self.write_track([(20, 10), (80, 10)])
        tile = self.folder / "tile.zip"
        features = [{"spec": {"width": 8}, "geometry": [[[-10, 9], [50, 9], [120, 9]]]},
                    {"spec": {"width": 6}, "geometry": [[[50, 9], [50, 55]]]}]
        with ZipFile(tile, "w") as archive:
            archive.writestr("tile.json", json.dumps({"features": features}))
        editorinfo._publish(self.model, [("0_0", tile)])
        self.generate()
        _, detail, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(detail["left"], 5, atol=0.1)
        np.testing.assert_allclose(detail["right"], 3, atol=0.1)

    def test_route_starts_at_rear_slot_if_its_run_in_has_no_road(self):
        self.write_track([(20, 10), (80, 10)], road_start=0)
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(points["pos"][0, [0, 2]], [1, 10])

    def test_route_preserves_grid_on_the_approach_around_a_bend(self):
        self.write_track([(20, 10), (80, 10)], grid=[(17, 10, (1, 0, 0)), (15, 16, (0, 0, -1)),
                                                     (15, 24, (0, 0, -1))])
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        xz = points["pos"][:, [0, 2]]
        np.testing.assert_allclose(xz[0], [15, 29])
        self.assertLess(np.linalg.norm(xz - [15, 16], axis=1).min(), 0.76)
        self.assertLess(np.linalg.norm(xz - [15, 10], axis=1).min(), 0.76)

    def test_route_grid_can_approach_pin_one_perpendicularly(self):
        self.write_track([(20, 10), (80, 10)], grid=[(20, 13, (0, 0, -1)), (20, 21, (0, 0, -1)),
                                                     (20, 29, (0, 0, -1))])
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(points["pos"][0, [0, 2]], [20, 34])

    def test_radius_and_speed_of_a_100_m_arc_with_15_m_chords(self):
        angle = np.linspace(0, 2 * np.pi, 42, endpoint=False)
        path = 100 * np.column_stack((np.cos(angle), np.sin(angle)))
        root = obj_to_kn5.empty("AC_TIME_0_L", (104, 0, 0), (0, 0, 1)).matrix
        right = obj_to_kn5.empty("AC_TIME_0_R", (96, 0, 0), (0, 0, 1)).matrix
        # Flat square, larger than the arc, gives every candidate the same driving level.
        road_vertices = np.array([[-110, 0, -110], [110, 0, -110], [110, 0, 110], [-110, 0, 110]])
        roads = {"1ROAD_arc": (None, road_vertices, None, np.array([[0, 1, 2], [0, 2, 3]]))}
        # A raised traffic island over the same road mesh bounds the inside of the circulating lane.
        island = np.column_stack((94 * np.cos(angle[:-1]), np.full(len(angle)-1, .18), 94 * np.sin(angle[:-1])))
        island = np.vstack(([0, .18, 0], island))
        rim = np.arange(1, len(island))
        roads["1KERB_walkcol_island"] = None, island, None, np.column_stack((np.zeros_like(rim), rim, np.roll(rim, -1)))
        road = fastlane._local_roads(roads)
        stations, xz, height = fastlane._sample(path, {"AC_TIME_0_L": root, "AC_TIME_0_R": right}, True, road)
        xyz = fastlane._surface(stations, xz, road, height, True)
        _, detail = fastlane._records(xyz, stations, road, True)
        np.testing.assert_allclose(detail["radius"][25:325], 100, atol=6)
        self.assertTrue(np.all((detail["right"] > 5) & (detail["right"] < 7)))
        # The pinned timing point is a seam in the synthetic polygon. Measure the steady arc after accelerating.
        np.testing.assert_allclose(detail["speed"][80:325] * 3.6, 90.9, atol=3)

    def test_sharp_corner_gets_more_of_the_chord_shared_with_a_gentle_bend(self):
        path = np.array([[0, 0], [40, 0], [40, 9], [44, 31]], dtype=float)
        metres = fastlane._distances(path)
        vertices = np.array([[-2, 0, -2], [46, 0, -2], [46, 0, 33], [-2, 0, 33]])
        roads = {"1ROAD_corner": (None, vertices, None, np.array([[0, 1, 2], [0, 2, 3]]))}
        road = fastlane._local_roads(roads)
        rounded = fastlane._rounded(path, metres, np.array([True, False, False, True]),
                                    (metres, np.zeros(len(path))), road)
        x, z = rounded[1]
        # Sharing the 9 m chord equally cuts just 4.5 m from the sharp corner. The gentle bend needs about 0.75 m.
        self.assertGreater(40 - x, 8)
        self.assertEqual(0, z)


if __name__ == "__main__":
    unittest.main()
