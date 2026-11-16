"""Race kerbs added along a selected mapped road in the Editor."""
import numpy as np
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))
from app import roadsurfaces, trackkerbs
from app import trackcopy, trackedits, trackview
from track import kn5, objectlist
from test_trackcopy import Base


class KerbTest(unittest.TestCase):
    def test_first_edge_click_chooses_side_relative_to_click_order(self):
        net = {"segments": [{"a": [0, 0], "b": [20, 0], "width": 8, "structure": ""}],
               "pins": [[1, 0, 0], [19, 0, 0]]}
        self.assertEqual(trackkerbs.side_of_click(net, [1, 3]), "left")
        self.assertEqual(trackkerbs.side_of_click(net, [1, -3]), "right")
        reverse = {**net, "pins": list(reversed(net["pins"]))}
        self.assertEqual(trackkerbs.side_of_click(reverse, [19, 3]), "right")
        self.assertEqual(trackkerbs.side_of_click(reverse, [19, -3]), "left")

    def test_route_follows_selected_road_in_click_order(self):
        net = {"segments": [
            {"a": [10, 0], "b": [20, 0], "width": 8, "structure": ""},
            {"a": [0, 0], "b": [10, 0], "width": 6, "structure": ""},
        ], "pins": [[1, 0, 0], [19, 0, 0]]}
        line = trackkerbs.route(net)
        self.assertTrue(np.allclose(np.asarray(line)[:, 0], [0, 10, 20]))
        self.assertEqual([row[2] for row in line], [6, 7, 8])


    def test_kerb_follows_the_road_spline_at_a_mapped_bend(self):
        net = {"segments": [
            {"a": [0, 0], "b": [20, 0], "width": 6, "road": "a", "structure": ""},
            {"a": [20, 0], "b": [40, 10], "width": 6, "road": "a", "structure": ""},
        ], "pins": [[1, 0, 0], [39, 10, 0]], "junctions": [], "held_junctions": []}
        with mock.patch.object(trackkerbs.trackband, "road_heights", side_effect=lambda _p, _s, _m, edge: np.zeros(len(edge))):
            line = trackkerbs.prepare(None, {}, None, net, "right")
        xy = np.asarray(line)[:, [0, 2]]
        heading = np.unwrap(np.arctan2(np.diff(xy[:, 1]), np.diff(xy[:, 0])))
        self.assertLess(np.max(np.abs(np.diff(heading))), np.radians(6), "the kerb must retain the road's curve knots")
        self.assertLess(float(np.min(np.linalg.norm(xy - [20, 0], axis=1))), 0.75)


    def test_kerb_keeps_a_feature_join_fixed(self):
        net = {"segments": [
            {"a": [0, 0], "b": [20, 0], "width": 6, "road": "a", "structure": ""},
            {"a": [20, 0], "b": [40, 10], "width": 6, "road": "b", "structure": ""},
        ], "pins": [[1, 0, 0], [39, 10, 0]], "junctions": [], "held_junctions": []}
        with mock.patch.object(trackkerbs.trackband, "road_heights", side_effect=lambda _p, _s, _m, edge: np.zeros(len(edge))):
            line = trackkerbs.prepare(None, {}, None, net, "right")
        self.assertTrue(np.any(np.all(np.asarray(line)[:, [0, 2]] == [20, 0], axis=1)))


    def test_a_tile_owner_change_does_not_reintroduce_a_corner(self):
        net = {"segments": [
            {"a": [0, 0], "b": [20, 0], "width": 6, "road": "a", "owner": 1, "structure": ""},
            {"a": [20, 0], "b": [40, 10], "width": 6, "road": "a", "owner": 2, "structure": ""},
        ], "pins": [[1, 0, 0], [39, 10, 0]], "junctions": [], "held_junctions": []}
        with mock.patch.object(trackkerbs.trackband, "road_heights", side_effect=lambda _p, _s, _m, edge: np.zeros(len(edge))):
            line = trackkerbs.prepare(None, {}, None, net, "right")
        xy = np.asarray(line)[:, [0, 2]]
        heading = np.unwrap(np.arctan2(np.diff(xy[:, 1]), np.diff(xy[:, 0])))
        self.assertLess(np.max(np.abs(np.diff(heading))), np.radians(6))


    def test_bridge_kerb_uses_the_sloped_deck_face_at_its_edge(self):
        net = {"segments": [{"a": [0, 0], "b": [4, 0], "width": 6, "structure": "bridge"}],
               "pins": [[0, 0, 10], [4, 0, 10.4]]}
        floor = np.array([[[0, 10, -5], [0, 10, 5], [4, 10.4, -5]],
                          [[4, 10.4, -5], [0, 10, 5], [4, 10.4, 5]]], dtype=float)
        stacked = floor.copy()
        stacked[:, :, 1] += 10
        scan = {"meshes": [{"name": "1ROAD_deck_0"}]}
        faces = [(0, np.arange(4), np.concatenate((floor, stacked)))]
        with (mock.patch.object(roadsurfaces, "ground", return_value=(np.zeros((2, 2)), 0, 0)),
              mock.patch.object(trackkerbs.trackband, "_sampled", side_effect=lambda _g, _i, _j, edge: np.full(len(edge), 10.0)),
              mock.patch.object(roadsurfaces, "_top_triangles", return_value=faces)):
            line = np.asarray(trackkerbs.prepare(None, scan, None, net, "left"))
        np.testing.assert_allclose(line[:, 1], 10.01 + 0.1 * line[:, 0], atol=0.001)


    def test_kerb_mesh_has_real_ac_collision_and_adjustable_profile(self):
        line = [[0, 1, 0, 8], [2, 1, 0, 8]]
        flat = trackkerbs.mesh(line, side="right", profile="flat", width=0.4, height=0.03)
        ribbed = trackkerbs.mesh(line, side="right", profile="ribbed", width=0.4, height=0.10)
        wide = trackkerbs.mesh(line, side="right", profile="flat", width=2.0, height=0.30)
        self.assertGreater(flat[0]["pos"][:, 1].max(), 1.02)
        self.assertGreater(ribbed[0]["pos"][:, 1].max(), 1.08)
        self.assertGreater(np.ptp(ribbed[0]["pos"][:, 1]), np.ptp(flat[0]["pos"][:, 1]))
        self.assertGreater(len(np.unique(np.round(ribbed[0]["pos"][2::5, 1], 3))), 2,
                           "ribs must be sampled between one-metre road rows")
        self.assertLess(flat[1].max(), len(flat[0]))
        self.assertAlmostEqual(float(np.ptp(wide[0]["pos"][:, 2])), 2.0, places=3)
        self.assertGreater(float(wide[0]["pos"][:, 1].max()), 1.29)
        self.assertIsNone(objectlist.problem("1KERB_racing_0", False))


    def test_invalid_kerbs_are_rejected(self):
        valid = {"id": "a", "line": [[0, 1, 0, 8], [2, 1, 0, 8]], "side": "left", "profile": "rounded", "width": 0.4, "height": 0.08}
        self.assertIsNone(trackkerbs.problems([valid]))
        self.assertIsNone(trackkerbs.problems([{**valid, "width": 2.0, "height": 0.30}]))
        self.assertTrue(trackkerbs.problems([{**valid, "width": 2.01}]))
        self.assertTrue(trackkerbs.problems([{**valid, "height": 0.31}]))
        self.assertTrue(trackkerbs.problems([{**valid, "height": -0.01}]))
        self.assertTrue(trackkerbs.problems([{**valid, "line": [[0, 1, 0, 8]]}]))
        self.assertTrue(trackkerbs.problems([{**valid, "line": [[0, 1, 0, 8], [3000, 1, 0, 8]]}]))
        self.assertTrue(trackkerbs.problems([valid, valid]))


class KerbSaveTest(Base):
    def test_draft_preview_and_save_keep_a_physical_kerb(self):
        now = trackedits.load(self.ac, "t")
        kerb = {"id": "race", "line": [[0, 0, 0, 8], [1, 0, 0, 8], [2, 0, 0, 8]],
                "side": "left", "profile": "rounded", "width": 0.45, "height": 0.08}
        answer = trackedits.save_telling(self.ac, "t", {"base": now["base"], "revision": now["revision"],
                                                         "id": "kerb-test", "deleted": [], "kerbs": [kerb]})
        self.assertIn(-1, answer["meshes"])
        shown = trackview.index(self.ac, "t")
        part = next(m for m in shown["meshes"] if m["name"].startswith("1KERB_"))
        self.assertTrue(part["copy"])
        self.assertEqual(part["kerb_id"], kerb["id"])
        draft_part = next(m for m in trackview.copy_index(self.ac, "t")["meshes"] if m["name"].startswith("1KERB_"))
        self.assertEqual(draft_part["kerb_id"], kerb["id"])
        texture = next(i for i, t in enumerate(shown["textures"]) if t["name"] == trackkerbs.TEXTURE)
        self.assertTrue(trackview.texture_bytes(self.ac, "t", texture, now["base"])[1].startswith(b"DDS "))
        trackcopy.save(self.ac, "t", copy_to="kerbed")
        saved = kn5.read(self.own("kerbed"))
        race = [mesh for mesh in kn5.walk_meshes(saved["root"]) if mesh.name.startswith("1KERB_")]
        self.assertTrue(race)
        self.assertGreater(float(race[0].vertices["pos"][:, 1].max()), 0.07)
        self.assertEqual([kerb], trackedits.load(self.ac, "kerbed")["kerbs"])
        saved_part = next(m for m in trackview.index(self.ac, "kerbed")["meshes"] if m["name"].startswith("1KERB_"))
        self.assertEqual(saved_part["kerb_id"], kerb["id"])
