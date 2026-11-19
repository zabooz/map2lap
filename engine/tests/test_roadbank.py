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
from app import roadbank, roadseparation, trackband, trackheights  # noqa: E402
from track import editorinfo, kn5  # noqa: E402
from test_trackheights import Base, mesh  # noqa: E402

LENGTH = 400.0


def flat(value):
    """An existing cross slope that is the same everywhere. Pure."""
    return lambda station: np.full(np.shape(station), value, np.float64)


class CrossFieldTest(unittest.TestCase):
    def at(self, d, station, target, e0=flat(0.0), ramp=100.0):
        return float(roadbank.change(np.array([d], float), np.array([station], float), LENGTH, ramp, target, e0)[0])

    def test_the_centreline_stays(self):
        self.assertEqual(0.0, self.at(0.0, 200.0, 0.08))

    def test_left_is_up_for_a_positive_target(self):
        self.assertAlmostEqual(0.32, self.at(4.0, 200.0, 0.08))
        self.assertAlmostEqual(-0.32, self.at(-4.0, 200.0, 0.08))

    def test_ends_stay(self):
        self.assertEqual(0.0, self.at(4.0, 0.0, 0.08))
        self.assertEqual(0.0, self.at(4.0, LENGTH, 0.08))

    def test_an_already_banked_road_gets_only_the_difference(self):
        self.assertAlmostEqual(0.08, self.at(4.0, 200.0, 0.08, flat(0.06)))

    def test_target_equal_to_a_constant_current_changes_nothing(self):
        station = np.linspace(0, LENGTH, 41)
        moved = roadbank.change(np.full(41, 4.0), station, LENGTH, 100.0, 0.06, flat(0.06))
        np.testing.assert_allclose(moved, 0.0, atol=1e-12)

    def test_a_varying_current_is_evened_by_a_constant_target(self):
        e0 = lambda s: 0.02 + 0.04 * np.asarray(s) / LENGTH          # (the builder's runoff inside A-B)
        core = np.linspace(110, 290, 19)
        result = roadbank.change(np.full(19, 4.0), core, LENGTH, 100.0, 0.08, e0) / 4.0 + e0(core)
        np.testing.assert_allclose(result, 0.08)
        self.assertGreater(float(np.ptp(roadbank.change(np.full(19, 4.0), core, LENGTH, 100.0, 0.08, e0))), 0.05)


class TransitionTest(unittest.TestCase):
    def test_constant_zero_to_eight_percent_needs_96_m_per_ramp_at_8_m(self):
        # (smoothstep's steepest slope is 1.5 times the mean: 1.5 x 4 m x 0.08 / 0.005)
        self.assertAlmostEqual(96, roadbank.needed_ramp(LENGTH, 0.08, flat(0.0), 4.0), delta=1)

    def test_width_scales_the_edge_lift(self):
        narrow = roadbank.needed_ramp(LENGTH, 0.08, flat(0.0), 2.0)
        wide = roadbank.needed_ramp(LENGTH, 0.08, flat(0.0), 6.0)
        self.assertAlmostEqual(3.0, wide / narrow, delta=0.1)
        self.assertAlmostEqual(0.48, 6.0 * 0.08)

    def test_a_changing_existing_slope_is_judged_on_the_resulting_edges(self):
        # An S-bend banked by the builder: +6 % at A turning to -6 % within the first 60 m. The formula on the slope at
        # A (6 % to 8 %) asks only 24 m; on the resulting edges the change to -6 % needs far more.
        e0 = lambda s: 0.06 - 0.12 * np.clip(np.asarray(s) / 60.0, 0, 1)
        formula = 1.5 * 4.0 * abs(0.08 - 0.06) / roadbank.EDGE_RAMP
        self.assertGreater(roadbank.edge_ramp(np.arange(0, LENGTH + 1.0), LENGTH, formula, 0.08, e0, 4.0), roadbank.EDGE_RAMP)
        self.assertGreater(roadbank.needed_ramp(LENGTH, 0.08, e0, 4.0), formula)

    def test_an_existing_steep_edge_that_is_not_made_steeper_is_no_refusal(self):
        # A step the build left (4 % edge ramp over 4 m) inside the first transition; the target only nears its far side.
        e0 = lambda s: 0.06 - 0.04 * np.clip((np.asarray(s) - 40.0) / 4.0, 0, 1)
        self.assertIsNone(roadbank.refusal(LENGTH, 0.021, e0, 4.0))
        # A step in the core is evened out: the result is flat there.
        core_step = lambda s: 0.06 - 0.04 * np.clip((np.asarray(s) - 200.0) / 4.0, 0, 1)
        self.assertIsNone(roadbank.refusal(LENGTH, 0.04, core_step, 4.0))

    def test_a_short_stretch_says_how_long_it_must_be(self):
        message = roadbank.refusal(60.0, 0.08, flat(0.0), 4.0)
        self.assertRegex(message, r"60 m available, 19\d m needed; mark A and B farther apart")
        self.assertIsNone(roadbank.refusal(LENGTH, 0.08, flat(0.0), 4.0))

    def test_out_of_range_target_is_refused(self):
        self.assertRegex(roadbank.refusal(LENGTH, 0.125, flat(0.0), 4.0), "between -12 and 12 percent")


# A ground road "mine" along x from 0 to 100, 8 m wide (left: -z), banked to 10 % with 20 m transitions.
LINE = [[0.0, 0.0], [100.0, 0.0]]
NET = {"segments": [{"a": LINE[0], "b": LINE[1], "width": 8.0, "road": "mine", "structure": ""}],
       "held_junctions": [], "unselected": [], "crossings": [], "pins": LINE}
BANK = {"points": LINE, "target": 0.1, "line": LINE, "road_ids": ["mine"], "ramp": 20.0, "e0": [[0.0, 0.0], [100.0, 0.0]],
        "half": 4.0}


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

    def test_a_side_road_inside_is_refused(self):
        self.assertRegex(roadbank.junction_refusal({**NET, "held_junctions": [[50.0, 0.0]]}, np.array(LINE), 100.0, 20.0, 4.0),
                         "side road joins")
        self.assertIsNone(roadbank.junction_refusal({**NET, "held_junctions": [[0.0, 0.0]]}, np.array(LINE), 100.0, 20.0, 4.0))

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
    def test_change_of_makes_one_valid_operation_that_save_applies(self):
        self.write(mesh("1GRASS_ground_0_0", 0, [(50, 0, -4), (50, 0, 4), (50, 0, -30)]))
        scan = kn5.scan(self.path)
        grid = (np.zeros((300, 300)), -100, -150)
        with (mock.patch.object(roadbank, "describe", return_value=(NET, np.array(LINE))),
              mock.patch.object(roadbank.builtroad, "heights", side_effect=lambda *a: (np.zeros(len(a[-1])), None)),
              mock.patch.object(trackband, "_ground", return_value=grid)):
            op = roadbank.change_of(self.path, scan, None, LINE, 0.04, "b1")      # (2 x 48 m of transition in 100 m)
        self.assertIsNone(trackheights.problem(op))
        self.assertEqual(["mine"], op["bank"]["road_ids"])
        self.assertAlmostEqual(0.04, op["bank"]["target"])
        self.assertLessEqual(op["bank"]["ramp"], 50)
        meshes, _scan = self.apply([op])
        np.testing.assert_allclose(meshes["1GRASS_ground_0_0"].vertices["pos"][:, 1], [0.16, -0.16, 0.0], atol=2e-3)


if __name__ == "__main__":
    unittest.main()
