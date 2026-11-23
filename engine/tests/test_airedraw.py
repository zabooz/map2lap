"""Hand-drawn AI segments select a continuous physics surface before sampling the automatic route."""
import json
from pathlib import Path
import sys
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import test_fastlane as fixture
from track import fastlane


class RedrawTest(unittest.TestCase):
    setUp = fixture.AILineTest.setUp
    write_track = fixture.AILineTest.write_track
    generate = fixture.AILineTest.generate

    def anchor(self, m):
        return {"metre": m, "level": 9, "origin": [0, 0],
                "context": [[20+m+d, 10] for d in (-5, 0, 5)]}

    def redraw(self, start, end, points):
        return dict(id="ink", kind="redraw", free=True, anchor=self.anchor(start),
                    end=self.anchor(end), points=points)

    def save(self, edit):
        (self.folder / "data/map2lap.json").write_text(json.dumps({"edits": {"aiCorrections": [edit]}}))

    def test_free_redraw_replaces_a_hole_before_the_first_surface_check(self):
        grass = ("1GRASS_ground", [(43, 9, 0), (58, 9, 0), (58, 9, 25), (43, 9, 25)])
        self.write_track([(20, 10), (80, 10)], strips=[(-10, 44, 0, 25), (57, 120, 0, 25)],
                         obstacles=[grass])
        self.assertIn("no driveable road", self.generate()[-1])
        edit = self.redraw(14, 46, [[50, 9, 14]])
        self.save(edit)
        log = self.generate()
        self.assertTrue(self.lane.is_file(), log)
        pos = fastlane.read_lane(self.lane)[0]["pos"]
        self.assertLess(np.linalg.norm(pos-[50, 9, 14], axis=1).min(), .1)
        self.assertLess(abs(pos[:, 1]-9).max(), .001)
        self.save(dict(edit, free=False))
        self.assertIn("route metre", self.generate()[-1])
        self.assertFalse(self.lane.exists())

    def test_free_move_can_go_onto_grass_but_never_through_a_wall(self):
        grass = ("1GRASS_ground", [(-10,9,10.5),(120,9,10.5),(120,9,40),(-10,9,40)])
        wall = ("1WALL_house", [(48,8,14),(52,8,14),(52,11,14),(48,11,14)])
        edit = dict(id="side", kind="move", free=True, range=12, routeOffset=-4, anchor=self.anchor(30))
        for obstacles, expected in [([grass],14), ([grass,wall],10)]:
            self.write_track([(20,10),(80,10)],strips=[(-10,120,0,11.5)],obstacles=obstacles)
            self.save(edit)
            log = self.generate()
            self.assertTrue(self.lane.exists(),log)
            xyz = fastlane.read_lane(self.lane)[0]["pos"]
            self.assertAlmostEqual(expected, xyz[abs(xyz[:,0]-50).argmin(),2],delta=.05)

    def test_free_move_crosses_an_initial_hole_only_on_the_selected_support(self):
        grass = ("1GRASS_ground", [(43,9,0),(58,9,0),(58,9,25),(43,9,25)])
        self.write_track([(20,10),(80,10)],strips=[(-10,44,0,25),(57,120,0,25)],obstacles=[grass])
        self.save(dict(id="repair", kind="move", free=True, range=15, routeOffset=-2, anchor=self.anchor(30)))
        log=self.generate()
        self.assertTrue(self.lane.exists(),log)
        xyz=fastlane.read_lane(self.lane)[0]["pos"]
        self.assertAlmostEqual(12,xyz[abs(xyz[:,0]-50).argmin(),2],delta=.1)

    def test_free_runout_uses_the_clicked_end_and_keeps_finish(self):
        grass = ("1GRASS_ground", [(85, 9, 0), (130, 9, 0), (130, 9, 25), (85, 9, 25)])
        self.write_track([(20, 10), (80, 10)], strips=[(-10, 86, 0, 25)], obstacles=[grass])
        self.generate()
        auto = fastlane.read_lane(self.lane)[0]["pos"]
        edit = self.redraw(60, 60, [[94, 9, 12]])
        end = self.anchor(60)
        end["context"][-1] = [80, 10]
        edit.update(anchor=end, end=end, tail=[112, 9, 12])
        self.save(edit)
        log = self.generate()
        self.assertTrue(self.lane.is_file(), log)
        pos = fastlane.read_lane(self.lane)[0]["pos"]
        np.testing.assert_allclose(pos[-1], edit["tail"], atol=.02)
        self.assertLess(np.linalg.norm(pos-[80,9,10], axis=1).min(), .02)
        self.assertLess(auto[-1,0], 87)

    def test_redraw_joins_tangentially_when_the_reference_moves_away_from_the_click(self):
        self.write_track([(20,10),(80,10)], strips=[(-10,120,-12,34)])
        edit = self.redraw(24,41,[[52,9,13]])
        for anchor in (edit["anchor"],edit["end"]):
            anchor["lateral"] = -2.5
        self.save(edit)
        log = self.generate()
        self.assertTrue(self.lane.is_file(),log)
        xyz = fastlane.read_lane(self.lane)[0]["pos"].astype(float)
        for x in (44,61):
            i = np.linalg.norm(xyz-[x,9,12.5],axis=1).argmin()
            np.testing.assert_allclose(xyz[i], [x,9,12.5], atol=.01)
            tangent = xyz[i+1]-xyz[i-1]
            self.assertLess(abs(tangent[2]/tangent[0]),.12)

    def test_free_move_can_repair_a_gap_alongside_an_ordinary_redraw(self):
        self.write_track([(20,10),(80,10)], strips=[(-10,44,0,25),(57,120,0,25)],
                         obstacles=[("1GRASS_ground",[(43,9,0),(58,9,0),(58,9,25),(43,9,25)])])
        move = dict(id="repair", kind="move", free=True, range=12, routeOffset=-2, anchor=self.anchor(30))
        draw = dict(self.redraw(43,53,[[68,9,11]]), free=False)
        (self.folder/"data/map2lap.json").write_text(json.dumps({"edits":{"aiCorrections":[move,draw]}}))
        log = self.generate()
        self.assertTrue(self.lane.is_file(), log)
        self.assertFalse(any("correction skipped" in line for line in log), log)
        xyz = fastlane.read_lane(self.lane)[0]["pos"]
        self.assertLess(np.linalg.norm(xyz-[68,9,11],axis=1).min(), .02)

    def test_saved_redraw_shows_the_generators_rejection_in_editor(self):
        from server_editor import _move_preview
        from track import ailinestate
        self.write_track([(20,10),(80,10)], strips=[(-10,120,0,25)])
        edit = self.redraw(20,40,[[50,9,12]])
        self.save(edit)
        self.generate()
        key = ailinestate.input_key(self.model, False)
        reason = "Insufficient clearance at route metre 19.8"
        ailinestate.record_ready(self.folder, key, {"ink": reason})
        self.assertEqual({"ink":reason}, _move_preview(self.model, {"aiCorrections":[edit]})["skipped"])

    def test_unrelated_invalid_stroke_keeps_both_required_repairs(self):
        strips = [(-10,39,0,25),(43,59,0,25),(63,120,0,25)]
        grass = ("1GRASS_ground",[(-10,9,0),(120,9,0),(120,9,25),(-10,9,25)])
        self.write_track([(20,10),(80,10)],strips=strips,obstacles=[grass])
        edits = [self.redraw(14,27,[[41,9,12]]),
                 dict(self.redraw(30,34,[[52,9,75]]),id="invalid"),
                 dict(self.redraw(35,48,[[61,9,12]]),id="second")]
        (self.folder/"data/map2lap.json").write_text(json.dumps({"edits":{"aiCorrections":edits}}))
        log = self.generate()
        self.assertTrue(self.lane.is_file(), log)
        xyz = fastlane.read_lane(self.lane)[0]["pos"]
        for click in ([41,9,12],[61,9,12]):
            self.assertLess(np.linalg.norm(xyz-click,axis=1).min(),.02)
        self.assertEqual(1,sum("correction skipped" in line for line in log))
