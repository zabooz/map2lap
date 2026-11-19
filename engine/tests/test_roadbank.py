"""Bank road: a signed absolute cross slope between A and B, tilted about the mapped centreline, with checked transitions."""
import os
import sys
import unittest
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import roadbank, roadregion, roadseparation, trackband, trackheights  # noqa: E402
from track import editorinfo, kn5  # noqa: E402
from test_trackheights import Base, mesh  # noqa: E402

SPAN = (150.0, 250.0, 100.0, 100.0)    # (A, B, transition before A, after B): stations along a 400 m line


def flat(value):
    """An existing cross slope that is the same everywhere. Pure."""
    return lambda station: np.full(np.shape(station), value, np.float64)


class CrossFieldTest(unittest.TestCase):
    def at(self, d, station, target, e0=flat(0.0), span=SPAN):
        return float(roadbank.change(np.array([d], float), np.array([station], float), span, target, e0)[0])

    def test_the_centreline_stays(self):
        self.assertEqual(0.0, self.at(0.0, 200.0, 0.08))

    def test_left_is_up_for_a_positive_target(self):
        self.assertAlmostEqual(0.32, self.at(4.0, 200.0, 0.08))
        self.assertAlmostEqual(-0.32, self.at(-4.0, 200.0, 0.08))

    def test_a_to_b_is_fully_banked_and_transitions_lie_outside(self):
        self.assertAlmostEqual(0.32, self.at(4.0, 150.0, 0.08))      # (A)
        self.assertAlmostEqual(0.32, self.at(4.0, 250.0, 0.08))      # (B)
        self.assertAlmostEqual(0.16, self.at(4.0, 100.0, 0.08))      # (halfway through the transition before A)
        self.assertEqual(0.0, self.at(4.0, 50.0, 0.08))              # (where it begins)
        self.assertEqual(0.0, self.at(4.0, 350.0, 0.08))             # (where the one after B ends)

    def test_an_already_banked_road_gets_only_the_difference(self):
        self.assertAlmostEqual(0.08, self.at(4.0, 200.0, 0.08, flat(0.06)))

    def test_target_equal_to_a_constant_current_changes_nothing(self):
        station = np.linspace(0, 400, 41)
        np.testing.assert_allclose(roadbank.change(np.full(41, 4.0), station, SPAN, 0.06, flat(0.06)), 0.0, atol=1e-12)

    def test_a_varying_current_is_evened_by_a_constant_target(self):
        e0 = lambda s: 0.02 + 0.04 * np.asarray(s) / 400          # (the builder's runoff along the road)
        core = np.linspace(150, 250, 11)
        result = roadbank.change(np.full(11, 4.0), core, SPAN, 0.08, e0) / 4.0 + e0(core)
        np.testing.assert_allclose(result, 0.08)


class TransitionTest(unittest.TestCase):
    def ramps(self, target, e0=flat(0.0), half=4.0, limit=roadbank.EDGE_RAMP, room=(1000.0, 1000.0)):
        return roadbank.needed_ramps(e0, 1000.0, 1100.0, target, half, limit, room)

    def test_the_limit_sets_the_transition_length(self):
        # (smoothstep's steepest slope is 1.5 times the mean: 1.5 x 4 m x 0.08 / limit)
        before, after = self.ramps(0.08)
        self.assertAlmostEqual(96, before, delta=1)
        self.assertAlmostEqual(96, after, delta=1)
        self.assertAlmostEqual(48, self.ramps(0.08, limit=0.01)[0], delta=1)

    def test_each_side_gets_its_own_transition(self):
        e0 = lambda s: np.where(np.asarray(s) < 1050, 0.08, 0.0)     # (already banked up to A's side)
        before, after = self.ramps(0.08, e0)
        self.assertEqual(roadbank.MIN_RAMP_M, before)
        self.assertAlmostEqual(96, after, delta=1)

    def test_width_scales_the_edge_lift(self):
        self.assertAlmostEqual(3.0, self.ramps(0.08, half=6.0)[0] / self.ramps(0.08, half=2.0)[0], delta=0.1)

    def test_a_changing_existing_slope_is_judged_on_the_resulting_edges(self):
        # The builder banked the road before A the other way (-6 % turning to +6 % at A over 60 m). The formula on the
        # slope at A (6 % to 8 %) asks only 24 m; on the resulting edges the change from -6 % needs far more.
        e0 = lambda s: 0.06 - 0.12 * np.clip((1000.0 - np.asarray(s)) / 60.0, 0, 1)
        formula = 1.5 * 4.0 * abs(0.08 - 0.06) / roadbank.EDGE_RAMP
        self.assertGreater(self.ramps(0.08, e0)[0], formula)

    def test_an_existing_steep_edge_that_is_not_made_steeper_is_no_refusal(self):
        e0 = lambda s: 0.06 - 0.04 * np.clip((np.asarray(s) - 1050.0) / 4.0, 0, 1)    # (a 4 % edge ramp in the core)
        self.assertNotIn(None, self.ramps(0.04, e0))

    def test_too_little_room_gives_no_transition_and_says_how_much_fits(self):
        self.assertEqual((None, 96.0), tuple(round(r) if r else r for r in self.ramps(0.08, room=(48.0, 1000.0))))
        self.assertAlmostEqual(0.04, roadbank.most_that_fits(flat(0.0), 1000.0, 1100.0, 1, 4.0, roadbank.EDGE_RAMP, (48.0, 1000.0)),
                               delta=0.001)

    def test_values_out_of_range_are_refused(self):
        self.assertRegex(roadbank.value_refusal(0.205, 0.005), "between 0 and 20 percent")
        self.assertIsNone(roadbank.value_refusal(0.2, 0.005))
        self.assertRegex(roadbank.value_refusal(0.05, 0.001), "between 0.2 and 3 percent")
        self.assertIsNone(roadbank.value_refusal(0.0, 0.005))


def banked(id_, line, roads=("mine",)):
    """A stored Bank road operation along line on roads (only what the overlap test reads). Pure."""
    return {"id": id_, "bank": {"line": line, "road_ids": list(roads)}}


class OverlapTest(unittest.TestCase):
    def test_a_transition_into_another_banking_is_refused(self):
        others = [banked("first", [[0, 0], [100, 0]])]
        self.assertRegex(roadbank.overlap(others, {"mine"}, [[90, 0], [200, 0]]), "banking here already; click it to change it")

    def test_a_range_inside_another_is_refused(self):
        self.assertIsNotNone(roadbank.overlap([banked("first", [[0, 0], [100, 0]])], {"mine"}, [[40, 0], [60, 0]]))

    def test_ranges_that_only_touch_end_to_end_do_not_overlap(self):
        self.assertIsNone(roadbank.overlap([banked("first", [[0, 0], [100, 0]])], {"mine"}, [[100, 0], [200, 0]]))

    def test_the_picked_banking_is_not_its_own_overlap(self):
        self.assertIsNone(roadbank.overlap([banked("first", [[0, 0], [100, 0]])], {"mine"}, [[40, 0], [160, 0]], ignore=["first"]))

    def test_bankings_on_two_roads_never_overlap(self):
        self.assertIsNone(roadbank.overlap([banked("first", [[0, 0], [100, 0]], ["theirs"])], {"mine"}, [[0, 0], [100, 0]]))

    def test_a_bridge_over_a_banking_is_no_overlap(self):
        # (the bridge's road crosses the banked road below at x=50: same x/z there, other road IDs)
        self.assertIsNone(roadbank.overlap([banked("below", [[0, 0], [100, 0]], ["ground"])], {"bridge"}, [[50, -50], [50, 50]]))

    def test_other_height_changes_are_no_banking(self):
        self.assertIsNone(roadbank.overlap([{"id": "bend", "bend": {}}], {"mine"}, [[0, 0], [100, 0]]))


class StartSideTest(unittest.TestCase):
    def test_a_clear_curve_starts_with_its_outside_edge_high(self):
        right = [[0, 0], [0, -50], [50, -100]]        # (north, then north-east: a right-hand curve; its outside is left)
        self.assertEqual(1, roadbank.start_side(right))
        self.assertEqual(-1, roadbank.start_side([[0, 0], [0, -50], [-50, -100]]))

    def test_a_straight_or_s_bend_starts_left_high(self):
        self.assertEqual(1, roadbank.start_side([[0, 0], [0, -100]]))
        self.assertEqual(1, roadbank.start_side([[0, 0], [0, -50], [30, -80], [30, -130], [0, -160]]))


class WalkTest(unittest.TestCase):
    def graph(self, *roads):
        from test_roadregion import road
        features = [road(*r[:2]) if len(r) == 2 else {**road(*r[:2]), "tags": {"layer": "0", **r[2]}} for r in roads]
        return roadregion._graph(features)

    def test_the_road_goes_on_beyond_the_mark(self):
        data = self.graph(("r", [[0, 0], [100, 0], [200, 0]]))
        points, stop = roadbank.walk(data, [150, 0], [180, 0], {"r"}, 80)
        np.testing.assert_allclose(points, [[100, 0], [70, 0]])
        self.assertIsNone(stop)

    def test_two_mapped_pieces_in_a_row_are_one_road(self):
        data = self.graph(("r", [[0, 0], [100, 0]]), ("s", [[100, 0], [200, 0]]))
        points, stop = roadbank.walk(data, [50, 0], [20, 0], {"r"}, 100)
        np.testing.assert_allclose(points[-1], [150, 0])
        self.assertIsNone(stop)

    def test_a_junction_is_passed_on_the_road_going_on_most_straight_and_its_side_road_is_joined(self):
        # (a driveway or a fork: the banking takes its mouth along, so the transition goes on over it)
        junction = self.graph(("r", [[0, 0], [100, 0]]), ("s", [[0, 0], [0, 50]]), ("t", [[0, 0], [-80, 0]]))
        joined = []
        points, stop = roadbank.walk(junction, [50, 0], [80, 0], {"r"}, 100, joined=joined)
        self.assertIsNone(stop)
        np.testing.assert_allclose(points[-1], [-50, 0])
        self.assertEqual(["s"], [e["road"] for e in joined])

    def test_a_road_end_a_sharp_turn_only_and_a_tunnel_stop_it_with_the_room_there(self):
        turn = self.graph(("r", [[0, 0], [100, 0]]), ("s", [[0, 0], [0, 50]]), ("u", [[0, 0], [10, -60]]))
        self.assertEqual(("junction", 50.0), roadbank.walk(turn, [50, 0], [80, 0], {"r"}, 100)[1])
        end = self.graph(("r", [[0, 0], [100, 0]]))
        self.assertEqual(("road end", 50.0), roadbank.walk(end, [50, 0], [80, 0], {"r"}, 100)[1])
        tunnel = self.graph(("r", [[0, 0], [100, 0]]), ("t", [[0, 0], [-80, 0]], {"tunnel": "yes", "layer": "-1"}))
        self.assertEqual(("tunnel", 50.0), roadbank.walk(tunnel, [50, 0], [80, 0], {"r"}, 100)[1])


# A ground road "mine" along x from 0 to 100, 8 m wide (left: -z), banked to 10 % with 20 m transitions.
LINE = [[0.0, 0.0], [100.0, 0.0]]
NET = {"segments": [{"a": LINE[0], "b": LINE[1], "width": 8.0, "road": "mine", "structure": ""}],
       "held_junctions": [], "unselected": [], "crossings": [], "pins": LINE}
BANK = {"points": LINE, "target": 0.1, "line": LINE, "road_ids": ["mine"], "a": 20.0, "b": 80.0, "before": 20.0, "after": 20.0,
        "e0": [[0.0, 0.0], [100.0, 0.0]], "half": 4.0}


def op_of(net=NET, bank=BANK):
    """The ground raster of BANK on net as a height change. Pure."""
    return {"id": "bank", **roadbank.ground_raster(roadbank.field_of(bank), bank["line"], net, bank["half"], 0.4), "mesh_offsets": {}}


class CurrentTest(unittest.TestCase):
    def test_the_existing_cross_slope_is_read_left_positive(self):
        plane = lambda points: 0.05 * -np.asarray(points)[:, 1]          # (the left, -z, side up 5 %)
        samples = roadbank.current_of(plane, np.array(LINE), 4.0)
        np.testing.assert_allclose(samples[:, 1], 0.05, atol=1e-9)
        self.assertEqual(0.0, samples[0, 0])
        self.assertEqual(100.0, samples[-1, 0])

    def test_a_reading_off_the_road_takes_its_neighbours(self):
        def bumpy(points):
            y = 0.02 * -np.asarray(points)[:, 1]
            y[np.abs(np.asarray(points)[:, 0] - 50) < 1] += np.where(np.asarray(points)[np.abs(np.asarray(points)[:, 0] - 50) < 1, 1] > 1, 3.0, 0.0)
            return y
        samples = roadbank.current_of(bumpy, np.array(LINE), 4.0)
        np.testing.assert_allclose(samples[:, 1], 0.02, atol=1e-3)


class GroundTest(Base):
    def test_ground_road_tilts_by_the_raster_and_objects_follow(self):
        self.write(mesh("1GRASS_ground_0_0", 0, [(50, 0, -4), (50, 0, 4), (50, 0, -20)]))
        meshes, _scan = self.apply([op_of()])
        y = meshes["1GRASS_ground_0_0"].vertices["pos"][:, 1]
        np.testing.assert_allclose(y, [0.4, -0.4, 0.0], atol=1e-3)

    def test_a_sign_on_tilted_ground_moves_with_it(self):
        sign = [(50.0, 0.0, -4.0), (50.2, 0.0, -4.0), (50.1, 2.0, -4.0)]
        self.write(mesh("nocol_bld_0_0", 0, sign))
        objects = {"t_0_0": {"kinds": ["sign"], "at": [[50.0, 0.0, -4.0]], "parents": [-1], "faces": [[[0, 0, 1]]], "with": {}}}
        meshes, _scan = self.apply([op_of()], objects)
        np.testing.assert_allclose(meshes["nocol_bld_0_0"].vertices["pos"][:, 1], [0.4, 0.4, 2.4], atol=1e-3)

    def test_a_neighbouring_road_at_the_same_level_stays(self):
        other = {"a": [0.0, -12.0], "b": [100.0, -12.0], "width": 8.0, "road": "theirs", "structure": ""}
        op = op_of({**NET, "unselected": [other]})
        field = trackheights.Field([op])
        self.assertEqual(0.0, float(field.at(np.array([50.0]), np.array([-10.0]))[0][0]))
        self.assertAlmostEqual(0.4, float(field.at(np.array([50.0]), np.array([-4.0]))[0][0]), places=3)


class KerbOnBankTest(Base):
    def test_a_kerb_beside_a_banked_ground_road_lifts_once_with_the_ground(self):
        # (racing kerbs follow the height raster like the ground: the bank's field must not lift them a second time)
        kerb = [(40, 0, -4.5), (50, 0, -4.5), (60, 0, -4.5), (40, 0, 4.5), (50, 0, 4.5), (60, 0, 4.5)]
        self.write(mesh("1KERB_racing_0", 0, kerb), mesh("1GRASS_ground_0_0", 0, [(50, 0, -4.5), (51, 0, -4.5), (50, 0, -3.5)]))
        op = {**op_of(), "bank": BANK}
        scan = kn5.scan(self.path)
        scan["meshes"][0]["road_ids"] = ["mine"]
        moved = trackheights.moved(self.path, scan, {}, [op])
        ground = float(moved.vertices[1]["pos"][0, 1])
        self.assertAlmostEqual(0.4, ground, delta=0.05)                     # (about the edge's lift, fading beside the road)
        np.testing.assert_allclose(moved.vertices[0]["pos"][[1, 4], 1], [ground, -ground], atol=0.01)


class LevelTest(Base):
    def owners(self, names):
        return mock.patch.object(editorinfo, "surface_face_owners", side_effect=lambda _p, n: np.array(names[n]))

    def test_a_bridge_over_the_marked_road_keeps_its_height(self):
        bridge = [(46, 5, -6), (54, 5, -6), (46, 5, 6), (54, 5, 6)]
        self.write(mesh("nocol_road_asphalt_0_0", 0, bridge, faces=[0, 2, 1, 1, 2, 3]),
                   mesh("1GRASS_ground_0_0", 0, [(50, 0, -4), (51, 0, -4), (50, 0, -3)]))
        op = op_of()
        scan = kn5.scan(self.path)
        op["mesh_offsets"] = roadbank.level_offsets(self.path, scan, None, op, {}, lambda xz: np.zeros(len(xz)))
        meshes, _scan = self.apply([op])
        np.testing.assert_allclose(meshes["nocol_road_asphalt_0_0"].vertices["pos"][:, 1], 5.0, atol=1e-3)
        self.assertAlmostEqual(0.4, float(meshes["1GRASS_ground_0_0"].vertices["pos"][0, 1]), places=3)

    def test_a_ground_tile_follows_although_its_lowest_corner_lies_beyond_the_ground_read(self):
        # (a terrain tile is one piece; its lowest vertex can lie far off the marked road, where no ground was read)
        self.write(mesh("1GRASS_ground_0_0", 0, [(50, 0, -4), (51, 0, -4), (500, -10, 300)]))
        op = op_of()
        scan = kn5.scan(self.path)
        ground = lambda xz: np.where(np.abs(np.asarray(xz)[:, 0]) < 200, 0.0, np.nan)
        op["mesh_offsets"] = roadbank.level_offsets(self.path, scan, None, op, {}, ground)
        meshes, _scan = self.apply([op])
        self.assertAlmostEqual(0.4, float(meshes["1GRASS_ground_0_0"].vertices["pos"][0, 1]), places=3)

    def test_lines_on_a_ground_road_stay_on_its_surface_and_wires_stay_on_their_poles(self):
        # (the road's surface is the raster's; a line owned by the marked road follows that, not the exact field, or it
        # dips under the asphalt where the 2 m raster and the field differ; a wire hangs on poles that go with the ground)
        ground = [(49, 0, -4), (51, 0, -4), (50, 0, -2)]
        self.write(mesh("1ROAD_ground_0_0", 0, ground), mesh("nocol_road_paint_0_0", 0, [(x, y + 0.01, z) for x, y, z in ground]),
                   mesh("nocol_wire_wire_0_0", 0, [(49, 8, -4), (51, 8, -4), (50, 8, -2)]))
        op = op_of()
        scan = kn5.scan(self.path)
        owned = {"1": [[k, 999, 0.0, 0.0] for k in range(3)]}          # (an exact field unlike the raster there)
        op["mesh_offsets"] = roadbank.level_offsets(self.path, scan, None, op, owned, lambda xz: np.zeros(len(xz)))
        self.assertNotIn("2", op["mesh_offsets"])
        meshes, _scan = self.apply([op])
        np.testing.assert_allclose(meshes["nocol_road_paint_0_0"].vertices["pos"][:, 1] - meshes["1ROAD_ground_0_0"].vertices["pos"][:, 1],
                                   0.01, atol=1e-3)

    def test_a_marked_bridge_tilts_its_own_deck_faces_only(self):
        deck = [(40, 5, -4), (60, 5, -4), (40, 5, 4), (60, 5, 4), (40, 5, 6), (60, 5, 6)]
        self.write(mesh("1ROAD_deck_0_0", 0, deck, faces=[0, 2, 1, 1, 2, 3, 2, 4, 3]))
        net = {**NET, "segments": [{**NET["segments"][0], "structure": "bridge"}]}
        scan = kn5.scan(self.path)
        with self.owners({"1ROAD_deck_0_0": ["mine", "mine", "other"]}):
            owned = roadbank.own_offsets(self.path, scan, None, net, BANK, None)
        op = op_of(net)
        op["mesh_offsets"] = roadbank.level_offsets(self.path, scan, None, op, owned, lambda xz: np.zeros(len(xz)))
        meshes, _scan = self.apply([op])
        np.testing.assert_allclose(meshes["1ROAD_deck_0_0"].vertices["pos"][:, 1], [5.4, 5.4, 4.6, 4.6, 5.0, 5.0], atol=1e-3)


class RefusalTest(unittest.TestCase):
    def test_a_tunnel_is_refused(self):
        net = {**NET, "segments": [{**NET["segments"][0], "structure": "tunnel"}]}
        with mock.patch.object(roadbank.builtroad, "pick", return_value=net), self.assertRaisesRegex(ValueError, "outside the tunnel"):
            roadbank.describe("unused", {}, LINE)

    def test_a_road_joining_is_no_carriageway_beside_it(self):
        side = {"a": [50.0, -4.0], "b": [50.0, -60.0], "width": 6.0, "road": "drive", "structure": ""}
        self.assertIsNone(roadbank.step_refusal(roadbank.field_of(BANK), np.array(LINE), {**NET, "unselected": [side]}, 4.0))

    def clearance(self, own, other, deck_y):
        net = {**NET, "segments": [{**NET["segments"][0], "structure": own}],
               "crossings": [{"a": [50.0, -20.0], "b": [50.0, 20.0], "width": 8.0, "road": "cross", "structure": other}]}
        grid = (np.zeros((200, 200)), -50, -100)
        with (mock.patch.object(trackband, "_ground", return_value=grid),
              mock.patch.object(roadseparation, "_deck_height", return_value=deck_y)):
            return roadbank.clearance_refusal("unused", {}, None, net, np.array(LINE), roadbank.field_of(BANK), 4.0)

    def test_a_raised_road_edge_under_a_bridge_is_checked(self):
        self.assertRegex(self.clearance("", "bridge", 4.6), r"clearance to 4\.20 m at its high edge; at least 4\.60 m")

    def test_a_lowered_bridge_edge_above_a_road_is_checked(self):
        self.assertRegex(self.clearance("bridge", "", 4.6), r"clearance to 4\.20 m at its low edge; at least 4\.60 m")
        self.assertIsNone(self.clearance("bridge", "", 7.0))                  # (6.2 m required, 6.6 m left)

    def test_a_step_to_the_other_carriageway_is_refused(self):
        near = {"a": [0.0, -8.5], "b": [100.0, -8.5], "width": 8.0, "road": "theirs", "structure": ""}
        far = {**near, "a": [0.0, -16.0], "b": [100.0, -16.0]}
        height = roadbank.field_of(BANK)
        self.assertRegex(roadbank.step_refusal(height, np.array(LINE), {**NET, "unselected": [near]}, 4.0),
                         "40 cm higher than the carriageway beside it")
        self.assertIsNone(roadbank.step_refusal(height, np.array(LINE), {**NET, "unselected": [far]}, 4.0))


class OperationTest(Base):
    def make(self, banking, heights=lambda at: np.zeros(len(at)), roads=(("mine", [[-300, 0], [400, 0]]),)):
        from test_roadregion import road
        self.write(mesh("1GRASS_ground_0_0", 0, [(50, 0, -4), (50, 0, 4), (50, 0, -30)]))
        scan = kn5.scan(self.path)
        grid = (np.zeros((400, 600)), -250, -200)
        with (mock.patch.object(roadbank, "describe", return_value=(NET, np.array(LINE))),
              mock.patch.object(roadbank, "_graph_of", return_value=roadregion._graph([road(*r) for r in roads])),
              mock.patch.object(roadbank.builtroad, "heights", side_effect=lambda *a: (heights(np.asarray(a[-1])), None)),
              mock.patch.object(trackband, "_ground", return_value=grid)):
            op = roadbank.change_of(self.path, scan, None, LINE, banking, 1, roadbank.EDGE_RAMP, "b1")
        return op, self.apply([op])[0]

    def test_change_of_makes_one_valid_operation_that_save_applies(self):
        op, meshes = self.make(0.04)
        self.assertIsNone(trackheights.problem(op))
        self.assertEqual(["mine"], op["bank"]["road_ids"])
        self.assertEqual((0.04, 1, 0.04), (op["bank"]["banking"], op["bank"]["side"], op["bank"]["target"]))
        self.assertAlmostEqual(48, op["bank"]["before"], delta=1)          # (outside A-B: 1.5 x 4 m x 4 % / 0.5 %)
        np.testing.assert_allclose(meshes["1GRASS_ground_0_0"].vertices["pos"][:, 1], [0.16, -0.16, 0.0], atol=2e-3)

    def test_the_road_going_on_beyond_the_marks_is_no_carriageway_beside_it(self):
        # (the map gives the marked road's own continuation beyond A and B as unselected: there lie the transitions now)
        on = [{"a": [-300.0, 0.0], "b": [0.0, 0.0], "width": 8.0, "road": "mine", "structure": ""},
              {"a": [100.0, 0.0], "b": [400.0, 0.0], "width": 8.0, "road": "mine", "structure": ""}]
        with mock.patch.dict(NET, {"unselected": on}):
            op, meshes = self.make(0.04)
        self.assertEqual(0.04, op["bank"]["banking"])
        field = trackheights.Field([op])
        self.assertAlmostEqual(0.08, float(field.at(np.array([-24.0]), np.array([-4.0]))[0][0]), delta=0.01)   # (halfway up before A)

    def test_zero_levels_the_fully_banked_stretch(self):
        op, meshes = self.make(0.0, heights=lambda at: -0.03 * at[:, 1])     # (3 % left up now)
        self.assertEqual(0.0, op["bank"]["target"])
        np.testing.assert_allclose(meshes["1GRASS_ground_0_0"].vertices["pos"][:2, 1], [-0.12, 0.12], atol=2e-3)

    def test_a_transition_at_a_road_end_says_how_much_fits(self):
        with self.assertRaisesRegex(ValueError, r"Only 2\.\d % banking fits here: the transition before A meets a road end after 30 m"):
            self.make(0.08, roads=(("mine", [[-30, 0], [400, 0]]),))

    def test_a_driveway_inside_is_taken_along_and_its_mouth_banks_with_the_road(self):
        # (a driveway joining at x=50 from the left: its mouth on the road banks, beside the road it fades out along it)
        drive = {"a": [50.0, 0.0], "b": [50.0, -60.0], "width": 6.0, "road": "drive", "structure": ""}
        with mock.patch.dict(NET, {"held_junctions": [[50.0, 0.0]], "unselected": [drive]}):
            op, _meshes = self.make(0.04)
        field = trackheights.Field([op])
        at = lambda x, z: float(field.at(np.array([x]), np.array([z]))[0][0])
        self.assertAlmostEqual(0.16, at(50, -4), delta=0.01)                 # (the road's edge where the driveway joins)
        self.assertGreater(at(50, -6), 0.08)                                 # (the driveway's mouth goes up with it)
        self.assertEqual(0.0, at(50, -30))                                   # (further in it keeps its height)


if __name__ == "__main__":
    unittest.main()
