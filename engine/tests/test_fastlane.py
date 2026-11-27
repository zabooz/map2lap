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
        for name in ("fastlane", "airacing", "aicorridor", "aibends", "ailinestate", "aicorrections", "airedraw", "drivenline"):
            # Text mode makes the same source hash identical on CRLF and LF checkouts.
            digest.update((folder / f"{name}.py").read_text(encoding="utf-8").encode("utf-8"))
            digest.update(b"\0")
        expected = (15, "8839ddeef171b358a4ce1e0cbb83e68c750edc22e47d71723f65bd6736f9496a")
        self.assertEqual(expected, (ailinestate.CODE_VERSION, digest.hexdigest()),
                         "Bump CODE_VERSION and update the pair for code changes. "
                         "For comments or refactors proven to preserve the generated line, update only the digest.")


class RacingSolverTest(unittest.TestCase):
    def solve(self, heading):
        spacing = 1.5
        centre = spacing * np.cumsum(np.column_stack((np.cos(heading), np.sin(heading))), axis=0)
        tangent = np.gradient(centre, axis=0)
        side = tangent[:, ::-1] * [-1, 1] / np.linalg.norm(tangent, axis=1)[:, None]
        room = np.full(len(centre), .95)
        offset = fastlane.airacing.offsets(centre, side, -room, room, False)
        path = centre + side * offset[:, None]
        curvature = fastlane.airacing._curvature(path[:-2], path[1:-1], path[2:])
        return offset, spacing * (curvature**2).sum()

    def test_winding_road_reaches_both_apices_and_converged_energy(self):
        metres = np.arange(0, 1500, 1.5)
        offset, energy = self.solve(.6*np.sin(2*np.pi*metres/300) + .3*np.sin(2*np.pi*metres/130))
        # Reference integral on this fixture with 20,000 steps and eight linearisations.
        self.assertLessEqual(energy, 1.01 * .225368)
        # Strong interior right and left apices on the centreline.
        np.testing.assert_allclose(offset[[302, 605]], [-.95, .95], atol=.01)

    def test_long_motorway_bends_do_not_stop_at_the_initial_energy_plateau(self):
        # Two full waves with 600 m between opposite apices and minimum radius 637 m.
        metres = np.arange(0, 2400, 1.5)
        offset, energy = self.solve(.30*np.sin(2*np.pi*metres/1200))
        # Reference integral with 80,000 steps and eight linearisations.
        self.assertLessEqual(energy, 1.01 * .00257853)
        np.testing.assert_allclose(offset[[400, 800, 1200]], [-.95, .95, -.95], atol=.01)


class AILineTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.model = self.folder / "test.kn5"
        (self.folder / "data").mkdir()
        self.lane = self.folder / "ai/fast_lane.ai"

    def write_track(self, route, *, circuit=False, road_start=-10, road_end=120, prefix="AC", height=9,
                    strips=None, grid=None, obstacles=(), splits=(), mapped_width=None):
        forward = (1, 0, 0)
        root = obj_to_kn5.empty("root", (0, 0, 0), (0, 0, 1))
        grid = grid or [(x, 10, forward) for x in (17, 9, 1)]
        for i, (x, z, direction) in enumerate(grid):
            root.children.append(obj_to_kn5.empty(f"AC_START_{i}", (x, height + .15, z), direction))
        gates = (("AC_TIME_0", 20),) if circuit else ((f"{prefix}_AB_START", 20), (f"{prefix}_AB_FINISH", 80))
        for gate, x in (*gates, *splits):
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

        if mapped_width is not None:
            tile = self.folder / "roads.zip"
            features = [{"spec": {"width": mapped_width}, "geometry": [[list(a), list(b)]]}
                        for a, b in zip(route, route[1:])]
            with ZipFile(tile, "w") as archive:
                archive.writestr("tile.json", json.dumps({"features": features}))
            editorinfo._publish(self.model, [("0_0", tile)])

    def generate(self, circuit=False):
        log = []
        fastlane.regenerate(self.model, circuit=circuit, log=log.append)
        return log

    def gravel_bend(self, width):
        path = np.array([[0., 0.], [80., 0.], [80., 80.]])
        metres = fastlane._distances(path)
        vertices = np.array([[-200., 0., -200.], [200., 0., -200.], [200., 0., 200.], [-200., 0., 200.]])
        roads = {"1GRAVEL_ground": (None, vertices, None, np.array([[0, 1, 2], [0, 2, 3]]))}
        road = fastlane._local_roads(roads)
        rounded = fastlane._rounded(path, metres, np.array([True, False, True]), (metres, np.zeros(3)),
                                    road, [(path, width)], ownership=True)
        return rounded, path, road

    def test_reference_car_stays_in_its_mapped_band_over_gravel(self):
        (xz, _, half, _), _, _ = self.gravel_bend(5.5)
        gap = np.minimum(abs(xz[:, 1]), abs(xz[:, 0] - 80))
        np.testing.assert_allclose(half, 5.5 / 2 + 1.0)
        self.assertLessEqual(gap.max() + fastlane.FILLET_CLEARANCE, half.min())
        self.assertGreater(gap.max(), .1, "use the room for a supported arc")

    def test_narrow_band_retains_its_centre_at_a_corner(self):
        (xz, _, _, _), path, _ = self.gravel_bend(3)
        np.testing.assert_array_equal(xz, path)

    def test_narrow_surveyed_curve_keeps_the_centre_without_steering_at_each_map_knot(self):
        # A 12 m radius hairpin sampled at 15 degree intervals on a 3 m road.
        _, _, road = self.gravel_bend(3.)
        angle = np.linspace(0., np.pi, 13)
        path = 12 * np.column_stack((np.cos(angle), np.sin(angle)))
        metres = fastlane._distances(path)
        fixed = np.zeros(len(path), bool)
        fixed[[0, -1]] = True
        curve = fastlane._rounded(path, metres, fixed, (metres, metres * 0), road, [(path, 3.)])
        for centre in path:
            self.assertLess(np.linalg.norm(curve - centre, axis=1).min(), 1e-8)
        stations = fastlane._distances(curve)
        xz = fastlane._at(curve, stations, np.arange(0, stations[-1], fastlane.SPACING))
        # On the established part of the circle the car should track the surveyed radius.
        radius = 1 / np.maximum(abs(fastlane._curvature(xz, 1, False)[4:-4]), 1e-8)
        np.testing.assert_allclose(radius, 12, rtol=.10)

    def test_width_uses_owned_leg_when_the_offset_line_has_no_map_match(self):
        # The centre is outside the bare 2.75 m match radius, inside the painted edge.
        xyz = np.array([[0., 2.8], [5., 2.8]])
        side = np.tile([0., -1.], (2, 1))
        start, end = np.tile([-20., 0.], (2, 1)), np.tile([20., 0.], (2, 1))
        ribbon = fastlane.airacing.RouteRibbon(None, start, end, np.full(2, 2.95), None, [], None, ())
        widths = fastlane._own_widths(xyz, side, np.full((2, 2), 200.), [], False, route=ribbon)
        np.testing.assert_allclose(widths, [[5.75, .15]] * 2)

    def test_visible_cap_cannot_reopen_a_collision_side_opening(self):
        # A spur in the raw collision area exceeds the side-opening threshold. Clipping
        # its paint first could hide that spur from the neighbour-width check.
        physical = np.full((9, 2), 3.)
        physical[4, 0] = 6.
        painted = np.full_like(physical, 2.95)
        painted[4, 0] = 4.8
        widths = fastlane._export_widths(physical, np.full_like(physical, 10.), painted, np.zeros(9, bool), False)
        self.assertLessEqual(widths[4, 0], 3.)
        self.assertTrue((widths <= painted).all())

    def test_only_a_mapped_mouth_can_interpolate_past_its_own_band(self):
        x = np.arange(9.)
        xz = np.column_stack((x, x*0))
        side = np.tile([0., 1.], (len(x), 1))
        half = np.where(x == 4, 3., 4.)
        ribbon = fastlane.airacing.RouteRibbon(None, xz - [1,0], xz + [1,0], half, x, [], None, ())
        for mouth, expected in (([], 3.), ([(4., 0., .25)], 4.)):
            limits = fastlane._own_widths(xz, side, np.full((len(x), 2), 200.), mouth, False, route=ribbon)
            np.testing.assert_allclose(limits[4], expected)

    def test_finite_span_matches_clipped_full_span_with_one_local_query(self):
        _, _, road = self.gravel_bend(5.5)
        calls = []
        def lookup(x, z, margin):
            calls.append(margin)
            return road(x, z, margin)
        point, side = np.zeros(3), np.array([1., 0., 0.])
        full = fastlane._span(road, point, side, 0)[:2]
        span = fastlane._span(lookup, point, side, 0, limits=(2.95, 1.5))[:2]
        np.testing.assert_allclose(span, [max(full[0], -1.5), min(full[1], 2.95)])
        self.assertEqual(calls, [3])

    def test_absent_band_reports_route_metres_and_only_exports_the_checked_car(self):
        self.write_track([(20, 10), (80, 10)])
        log = self.generate()
        self.assertRegex(" ".join(log), r"no road band at route metres? -?\d")
        _, detail, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(detail["left"], fastlane.CAR_HALF_WIDTH)
        np.testing.assert_allclose(detail["right"], fastlane.CAR_HALF_WIDTH)

    def test_built_ribbon_ends_at_its_own_edges_above_gravel(self):
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        ground = np.array([[-30., 0., -80.], [130., 0., -80.], [130., 0., 80.], [-30., 0., 80.]])
        path = np.array([[0., 0.], [100., 0.]])
        metres = fastlane._distances(path)
        for name in fastlane.aicorridor.BUILT:
            # The road reaches the deck over a diagonal joint. Its lateral edges are 3 m from the axis.
            deck = np.array([[0., 0., -3.], [102., 0., -3.], [102., 0., 3.], [4., 0., 3.]])
            road = fastlane._local_roads({name: (None, deck, None, faces), "1GRAVEL_ground": (None, ground, None, faces)})
            for mapped in ([], [(path, 5.5)], [(path, 16.)]):
                (_, _, half), _ = fastlane._leg_bands(path, metres, (metres, [0., 0.]), road, mapped)
                np.testing.assert_allclose(half, [3.])
            side = np.array([0., 0., 1.])
            np.testing.assert_allclose(fastlane._span(road, np.array([50., 0., 0.]), side, 50, (8.,8.))[:2], [-3.,3.])
            self.assertTrue(fastlane._fits_chord(road, np.array([1.5, 0., 0.]), np.array([3., 0., 0.]), 1.))

    def test_export_uses_visible_road_edge_while_solver_keeps_physics_band(self):
        import surface
        self.write_track([(-10, 10), (120, 10)], mapped_width=6.5)
        self.generate()
        _, detail, _ = fastlane.read_lane(self.lane)
        for side in ("left", "right"):
            np.testing.assert_allclose(detail[side], 3.25 + surface.PHOTO_ROAD_EDGE_M, atol=1e-5)
        (_, _, solver_half, _), _, _ = self.gravel_bend(6.5)
        np.testing.assert_allclose(solver_half, 3.25 + fastlane.AI_ROAD_EDGE_M)

    def test_swept_car_crosses_buried_slab_at_deck_end_but_still_hits_wall(self):
        # At the abutment the lower terrain beside the car becomes exposed. The slab
        # behind it is covered by the deck over its entire footprint.
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        def strip(x0, x1, z0, z1, y0, y1):
            vertices = [[x0,y0,z0], [x1,y0,z0], [x1,y1,z1], [x0,y1,z1]]
            return None, np.array(vertices, float), None, faces
        meshes = {"1ROAD_deck": strip(-8, 0, -4, 4, 0, 0),
                  "1WALL_slab": strip(-8, 0, -4, 4, -.5, -.5),
                  "1ROAD_ground_main": strip(-8, 8, -4, .2, 0, 0),
                  "1ROAD_ground_side": strip(-8, 8, .2, 4, 0, -3.8)}
        chord = np.array([[-.65, 0., 0.], [.85, 0., 0.]])
        self.assertTrue(fastlane._fits_chord(fastlane._local_roads(meshes), *chord, 1.))
        meshes["1WALL_post"] = strip(-.32, -.30, .8, .8, -.1, 1.)
        self.assertFalse(fastlane._fits_chord(fastlane._local_roads(meshes), *chord, 1.))
        del meshes["1WALL_post"]
        meshes["1WALL_slab"] = strip(-8, .5, -4, 4, -.5, -.5)
        self.assertFalse(fastlane._fits_chord(fastlane._local_roads(meshes), *chord, 1.))

    def anchor(self, metre):
        return dict(metre=metre, level=9, origin=[0, 0],
                    context=[[20 + metre + d, 10] for d in (-5, 0, 5)])

    def test_calculation_returns_one_route_metre_per_written_sample(self):
        self.write_track([(20, 10), (80, 10)], mapped_width=6.5)
        move = dict(id="move", kind="move", free=False, range=10, routeOffset=-.3, anchor=self.anchor(30))
        redraw = dict(id="ink", kind="redraw", free=False, anchor=self.anchor(20), end=self.anchor(40),
                      points=[[50, 9, 11]])

        def written_count(corrections):
            (self.folder / "data/map2lap.json").write_text(json.dumps({"edits": {"aiCorrections": corrections}}))
            inputs = fastlane.lane_inputs(self.model, False, print)
            skipped, metres = fastlane.calculate(self.model, inputs, False, self.lane, print)
            count = len(fastlane.read_lane(self.lane)[0])
            self.assertEqual(skipped, {})
            self.assertEqual(metres.shape, (count,))
            self.assertTrue(np.isfinite(metres).all())
            return count

        automatic = written_count([])
        self.assertEqual(written_count([move]), automatic)
        # Redraw samples the authored arc more densely than the automatic guide it replaces.
        self.assertGreater(written_count([redraw]), automatic)

    def test_margins_leave_fingerprint_and_lane_bytes_unchanged(self):
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)], mapped_width=6.5)
        self.generate()
        record = self.folder / ailinestate.FILE
        saved = record.read_bytes()
        self.assertEqual(len(json.loads(saved)["metres"]), len(fastlane.read_lane(self.lane)[0]))
        key = ailinestate.input_key(self.model, False)
        digest = ailinestate.checksum(self.lane)
        margin = dict(id="m", start=self.anchor(20), end=self.anchor(40), left=None, right=1.)
        (self.folder / "data/map2lap.json").write_text(json.dumps({"edits": {"aiMargins": [margin]}}))
        self.assertEqual(ailinestate.inspect(self.model, False), {"status": "ready", "inputs": key, "lane": digest})
        ailinestate.sync_hints(self.folder, False)
        self.assertEqual(ailinestate.checksum(self.lane), digest)
        self.assertEqual(record.read_bytes(), saved)

    def test_new_build_and_editor_recalculation_replace_passing_hints(self):
        from app import ailanejobs
        from track import aihints, ailinestate
        self.write_track([(-10, 10), (120, 10)], mapped_width=6.2)
        self.generate()
        hints = self.folder / aihints.FILE
        self.assertEqual(b"", hints.read_bytes())
        hints.write_bytes(b"old generated hints")
        self.write_track([(-10, 10), (120, 10)], mapped_width=8.)
        self.assertEqual("ready", ailanejobs.ensure(self.model, False, force=True)["status"])
        self.assertEqual(b"", hints.read_bytes())
        self.assertEqual(len(json.loads((self.folder / ailinestate.FILE).read_bytes())["metres"]),
                         len(fastlane.read_lane(self.lane)[0]))

    def test_build_keeps_its_lane_and_valid_margins_with_a_malformed_saved_margin(self):
        from track import aihints, ailinestate
        self.write_track([(20, 10), (80, 10)], mapped_width=6.5)
        self.generate()
        lane = self.lane.read_bytes()
        valid = dict(id="placed", start=self.anchor(20), end=self.anchor(40), left=None, right=1.)
        broken = dict(id="broken", start=self.anchor(10), left=1., right=None)
        (self.folder / "data/map2lap.json").write_text(json.dumps({"edits": {"aiMargins": [broken, valid]}}))
        self.assertTrue(fastlane.regenerate(self.model, circuit=False, log=lambda line: None))
        self.assertEqual(self.lane.read_bytes(), lane)
        result = ailinestate.hints(self.folder, False)
        self.assertEqual(result.rejected, {"broken": "Invalid danger zone"})
        self.assertEqual([span.id for span in result.spans], ["placed"])
        self.assertIn(b"RIGHT=1.00", (self.folder / aihints.FILE).read_bytes())

    def test_ai_road_edge_controls_band_and_fingerprint(self):
        from unittest.mock import patch
        import surface
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)], mapped_width=6)
        inputs = fastlane.lane_inputs(self.model, False, print)
        old = ailinestate.fingerprint(inputs, False)
        with patch.object(surface, "PHOTO_ROAD_EDGE_M", surface.PHOTO_ROAD_EDGE_M * 2):
            self.assertNotEqual(old, ailinestate.fingerprint(inputs, False))
        with patch.object(fastlane, "AI_ROAD_EDGE_M", .6):
            (_, _, half, _), _, _ = self.gravel_bend(5.5)
            np.testing.assert_allclose(half, 5.5 / 2 + .6)
            self.assertNotEqual(old, ailinestate.fingerprint(inputs, False))

    def test_road_bound_preview_only_queries_the_owned_band(self):
        from unittest.mock import patch
        from server_editor import _move_preview
        self.write_track([(-10, 10), (120, 10)], mapped_width=8)
        self.generate()
        move = {"id": "nudge", "kind": "move", "free": False, "range": 10, "routeOffset": .3,
                "anchor": {"metre": 60, "level": 9, "origin": [0,0], "context": [[45,10],[50,10],[55,10]]}}
        with patch.object(fastlane, "_span", wraps=fastlane._span) as span:
            preview = _move_preview(self.model, {"aiCorrections": [move]})
            self.assertFalse(preview["skipped"])
            self.assertTrue(preview["samples"])
            for call in span.call_args_list:
                self.assertIsNotNone(call.args[4])
                self.assertLess(max(call.args[4]), 4 + fastlane.AI_ROAD_EDGE_M + .5)  # includes the .3 m move and its tangent

    def test_saved_move_survives_calculation_on_its_racing_line_and_invalidates_metadata(self):
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        before = fastlane.read_lane(self.lane)[0]["pos"].copy()
        old_key = ailinestate.input_key(self.model, False)
        move = {"id": "move-one", "kind": "move", "free": False, "range": 28, "routeOffset": 3,
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
        inside = abs(before[:, 0]-50) < 28
        expected = 1.5*(1 + np.cos(np.pi*(before[inside, 0]-50)/28))
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
        self.write_track([(20, 10), (80, 10)], strips=[(-10,120,6,14)])
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
        self.write_track([(20, 10), (80, 10)], strips=[(-10,120,5,15)])
        self.generate()
        before = fastlane.read_lane(self.lane)[0]["pos"].copy()
        def move(mid, offset):
            x = mid+20
            return dict(id=str(mid), kind="move", free=False, range=12, routeOffset=offset,
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
        ribbon = airacing.RouteRibbon(np.zeros(61,bool), None, None, None, m, [], np.zeros(61,bool), ())
        move = dict(id="a", kind="move", free=False, range=10, routeOffset=4,
                    anchor=dict(metre=30, level=0, origin=[0,0], context=route.context(30).tolist()))
        for z in (0, -2):
            xyz = np.column_stack([m,np.zeros(61),np.full(61,z)]).astype(float)
            side = np.tile([0,0,-1.], (61,1))
            out, mask = route.moves([move], ribbon, xyz, side, 2.5)
            np.testing.assert_allclose(out[30], [30,0,-4])
            np.testing.assert_array_equal(out[~mask], xyz[~mask])
            self.assertAlmostEqual(out[25,2], (z-4)/2)


    def test_save_keeps_last_line_visible_until_pending_replacement_is_ready(self):
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
            self.assertEqual(self.lane.read_bytes(), (target / fastlane.FILE).read_bytes())

            with patch.object(ailanejobs, "compute", wraps=ailanejobs.compute) as calculate:
                if expected == "pending":
                    def launch():
                        self.assertEqual("ready", ailinestate.inspect(saved, False)["status"])
                        return 200, {"ok": True}
                    self.assertEqual((200, {"ok": True}), ailanejobs.race(saved, False, {}, launch))
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

    def test_unreadable_route_keeps_preview_but_refuses_race(self):
        from app import ailanejobs
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        (self.folder / fastlane.ROUTE).unlink()
        state = ailanejobs.ensure(self.model, False)
        self.assertEqual("failed", state["status"])
        self.assertIn("map2lap_route.txt", state["message"])
        self.assertTrue(self.lane.exists())
        code, result = ailanejobs.race(self.model, False, {}, lambda: self.fail("launched stale lane"))
        self.assertEqual((409, "failed"), (code, result["lane"]))

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

    def test_second_save_replaces_the_first_job_and_only_publishes_the_latest_inputs(self):
        from concurrent.futures import ThreadPoolExecutor
        from threading import Event
        from unittest.mock import patch
        from app import ailanejobs
        from track import ailinestate
        route = [(20, 10), (80, 10)]
        self.write_track(route)
        self.generate()
        original = self.lane.read_bytes()
        entered, resume = Event(), Event()
        compute = ailanejobs.compute

        def pause(*args):
            self.assertEqual(original, self.lane.read_bytes())
            answer = compute(*args)
            entered.set()
            self.assertTrue(resume.wait(5))
            return answer

        def save(height):
            with ailanejobs.changing(self.model):
                self.write_track(route, height=height)
                key = ailinestate.input_key(self.model, False)
                ailinestate.mark_outdated(self.folder, key)
                return key

        with patch.object(ailanejobs, "compute", side_effect=pause), patch.object(
                ailinestate, "publish", wraps=ailinestate.publish) as publish, ThreadPoolExecutor(2) as pool:
            first = pool.submit(ailanejobs.ensure, self.model, False, saved_inputs=save(11))
            self.assertTrue(entered.wait(5))
            latest = save(12)
            second = pool.submit(ailanejobs.ensure, self.model, False, saved_inputs=latest)
            resume.set()
            self.assertEqual("superseded", first.result()["status"])
            self.assertEqual("ready", second.result()["status"])
            publish.assert_called_once()
            self.assertEqual(latest, publish.call_args.args[1])

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
        np.testing.assert_allclose(detail["left"], fastlane.CAR_HALF_WIDTH)
        np.testing.assert_allclose(detail["right"], fastlane.CAR_HALF_WIDTH)
        self.assertEqual(bytes(4), tail)  # v7 HasGrid = 0 after the detail records.
        self.assertEqual(16 + len(points)*20 + 4 + len(points)*fastlane.DETAIL.itemsize + 4,
                         self.lane.stat().st_size)
        self.assertRegex(log[-1], r"AI line: \d+ points in")

    def test_recorded_stage_uses_last_distinct_route_leg_for_the_runout(self):
        from track import drivenline
        trace = self.folder / "session.drive"
        np.savetxt(trace, [[x, 9, 11, 20, .5, 0, 0] for x in range(19, 82)])
        candidate = self.folder / "ai/fast_lane.ai.candidate"
        route = [(20, 10), (50, 10), (80, 10)]
        self.write_track(route)
        drivenline.stage_candidate(self.model, trace, candidate)
        expected = candidate.read_bytes()
        # The routing data for the Cap Corse runout repeats its final coordinate.
        self.write_track([point for point in route for _ in range(2)])
        drivenline.stage_candidate(self.model, trace, candidate)
        self.assertEqual(candidate.read_bytes(), expected)
        self.assertFalse(self.lane.exists())

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

    def racing_rectangle(self, *, obstacles=(), log=print):
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
        mapped, rings = fastlane.aibends.lane_roads(editorinfo.archives(self.model), print)
        _, reference, _ = fastlane._sample(route, scan["points"], True, road, mapped, rings)
        self.assertTrue(fastlane.regenerate(self.model, circuit=True, log=log))
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
        _, old, _, limits = fastlane._sample(route, scan["points"], True, road, mapped, rings, ownership=True)
        self.assertTrue(fastlane.regenerate(self.model, circuit=True))
        points, _, _ = fastlane.read_lane(self.lane)
        new = points["pos"][:, [0, 2]]
        inside = fastlane.aibends.ring_vertices(old, rings)
        self.assertTrue(limits.fixed[inside].all())
        self.assertFalse(limits.hard[inside].any())
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

    def test_racing_log_reports_partial_returns_once_and_omits_a_discarded_move(self):
        from unittest.mock import patch
        post = ("1WALL_post", [(77.5, 9, 7), (77.51, 9, 7), (77.51, 10, 7), (77.5, 10, 7)])
        messages = []
        reference, final, _ = self.racing_rectangle(obstacles=[post], log=messages.append)
        self.assertFalse(np.array_equal(reference, final))
        summaries = [line for line in messages if "return to reference" in line]
        self.assertEqual(len(summaries), 1, summaries)
        self.assertRegex(summaries[0], r"local return to reference at [1-9]\d* locations?.*route metres?")
        with patch.object(fastlane.airacing, "worse_runs", side_effect=lambda moved, *_: moved.copy()):
            messages.clear()
            reference, final, _ = self.racing_rectangle(obstacles=[post], log=messages.append)
            np.testing.assert_array_equal(reference, final)
            self.assertFalse(any("return to reference" in line for line in messages), messages)

    def test_corner_is_rounded_with_room_for_both_sides_of_the_car(self):
        strips = [(-10, 60, 5, 15), (50, 60, 5, 50), (3, 60, 40, 50), (3, 13, 5, 50)]
        self.write_track([(8, 10), (55, 10), (55, 45), (8, 45), (8, 10)], circuit=True, strips=strips, mapped_width=10)
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
        self.write_track([(20, 10), (80, 10)], mapped_width=12, obstacles=[
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

    def test_ground_teeth_only_use_tracking_reserve_with_broad_floor_on_both_sides(self):
        # A box-shaped bite starting halfway between two stored samples. The rotated
        # case reaches the diagonal length of one terrain cell along the driving line.
        from acgrid import CELL
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        for length, depth, angle, obstacle, fits in (
            (CELL, 1., 0., None, True), (CELL*np.sqrt(2), .9, np.pi/4, None, True),
            (4., .8, 0., None, False), (6., .8, 0., None, False), (CELL, 1.1, 0., None, False),
            (CELL, .8, 0., "1WALL_post", False), (CELL, .8, 0., "1KERB_walkcol_0", False),
        ):
            with self.subTest(length=length, depth=depth, angle=angle, obstacle=obstacle):
                # The broad flanks contain the requested 2.5 m reserve on both sides.
                rim = fastlane.RACING_CLEARANCE
                outline = [(-8, -4), (8, -4), (8, rim), (length, rim),
                           (length, rim-depth), (0, rim-depth), (0, rim), (-8, rim)]
                triangles = np.array([[0, 1, 5], [1, 4, 5], [1, 2, 4], [2, 3, 4], [0, 5, 6], [0, 6, 7]])
                def xyz(points):
                    x, z = np.array(points).T
                    return np.column_stack((x*np.cos(angle)-z*np.sin(angle), x*0, x*np.sin(angle)+z*np.cos(angle)))
                meshes = {"1ROAD_ground_0_0": (None, xyz(outline), None, triangles)}
                if obstacle:
                    post = xyz([(.1, 2), (.2, 2), (.2, 2), (.1, 2)])
                    post[2:, 1] = 1.
                    meshes[obstacle] = None, post, None, faces
                road = fastlane._local_roads(meshes)
                start, end = xyz([(-.5, 0), (1, 0)])
                self.assertEqual(fits, fastlane._fits_chord(road, start, end, rim, tracking=True))

                # Give the proposal the same requested width and inspect the offending
                # side at a stored point, independently of the swept chord above.
                base = xyz([(-1.35, 0), (.15, 0), (1.65, 0)])
                sides = fastlane._frame(base, False)[3]
                raw, tracking = fastlane._tracking_spans(base, sides, [0, 1.5, 3], road, False, np.full((3, 2), rim))
                self.assertLess(-raw[1][0], rim)
                self.assertEqual(fits, tracking[1, 1] >= rim-1e-8)

                if angle == 0.:
                    from unittest.mock import patch
                    # Force the same straight translated candidate through the full end
                    # check. An invalid proposal must take the local repair path.
                    metres = np.arange(0., 12.1, 1.5)
                    base = xyz([(m-6, -.4) for m in metres])
                    axis = base[:, fastlane.XZ]
                    ribbon = fastlane.airacing.RouteRibbon(np.zeros(len(base), bool), axis-[8, 0], axis+[8, 0],
                                                           np.full(len(base), 5.), metres, [], None, ())
                    shift = np.full(len(base), -.4 + fastlane.GRID_XZ_TOL)
                    with patch.object(fastlane.airacing, "offsets", return_value=shift), \
                         patch.object(fastlane, "_restore", wraps=fastlane._restore) as restore:
                        points, _ = fastlane._racing_records(base, metres, road, False, [], ribbon, lambda _: None)
                    self.assertEqual(not fits, restore.called)
                    if fits:
                        np.testing.assert_allclose(points["pos"][:, 2], -fastlane.GRID_XZ_TOL, atol=1e-7)

    def test_oblique_line_crosses_a_single_axis_aligned_ground_cell(self):
        # One missing 2 x 2 m cell on an otherwise straight shoulder. At 15 degrees
        # the tracking edge spends 2 / cos(15°) = 2.07 m in the cell.
        angle = np.deg2rad(15.)
        forward = np.array([np.cos(angle), 0., np.sin(angle)])
        left = np.array([-np.sin(angle), 0., np.cos(angle)])
        edge = np.array([1., 0., .6])
        centre = edge - fastlane.RACING_CLEARANCE * left
        xs = [-10, 0, 2, 10]
        zs = [-10, 0, 2]
        vertices = np.array([(x, 0., z) for z in zs for x in xs])
        triangles = []
        for row in range(2):
            for col in range(3):
                if (row, col) != (1, 1):
                    a = 4*row + col
                    triangles.extend(((a, a+1, a+5), (a, a+5, a+4)))
        meshes = fastlane._RoadMeshes({"1ROAD_ground_0_0": (None, vertices, None, np.array(triangles))})
        for cell, expected in ((2, True), (1, False)):
            meshes.cell = cell
            road = fastlane._local_roads(meshes)
            self.assertEqual(expected, fastlane._fits_chord(road, centre-forward, centre+forward,
                                                             fastlane.RACING_CLEARANCE, tracking=True))

    def test_installed_terrain_grid_changes_the_line_fingerprint(self):
        from track import ailinestate
        self.write_track([(20, 10), (80, 10)], mapped_width=6)
        fingerprint = lambda: ailinestate.fingerprint(fastlane.lane_inputs(self.model, False, print), False)
        original = fingerprint()
        (self.folder / "data/map2lap.json").write_text(json.dumps({"terrain_cell_m": 1}))
        self.assertNotEqual(original, fingerprint())

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
        self.write_track([(-10, 10), (120, 10)], mapped_width=10, strips=[(-10, 120, 5, 15), (45, 55, 15, 315)])
        self.generate()
        points, detail, _ = fastlane.read_lane(self.lane)
        across_junction = np.abs(points["pos"][:, 0] - 50) < 4
        np.testing.assert_allclose(detail["right"][across_junction], 5.2, atol=0.01)
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
        np.testing.assert_allclose(detail["left"], 5.2, atol=0.01)
        np.testing.assert_allclose(detail["right"], 3.2, atol=0.01)

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

    def test_long_straight_speed_follows_acceleration_and_braking(self):
        ds = np.full(101, 10.)
        v, _, _ = fastlane._speed(np.zeros(101), ds, False)
        distance = np.arange(101) * 10.
        np.testing.assert_allclose(v**2, 2 * 9.81 * np.minimum(.25 * distance, .70 * (1000 - distance)))

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
        stations, xz, height = fastlane._sample(path, {"AC_TIME_0_L": root, "AC_TIME_0_R": right}, True, road, [(np.vstack((path, path[0])), 12)])
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
                                    (metres, np.zeros(len(path))), road, [(path, 20)])
        x, z = rounded[1]
        # Sharing the 9 m chord equally cuts just 4.5 m from the sharp corner. The gentle bend needs about 0.75 m.
        self.assertGreater(40 - x, 8)
        self.assertEqual(0, z)


if __name__ == "__main__":
    unittest.main()
