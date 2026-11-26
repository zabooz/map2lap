"""Hand-set side margins on the installed racing line, checked through AC's INI."""
from concurrent.futures import Future
from configparser import ConfigParser
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import aicorrections, aihints, ailinestate, aimargins, fastlane, route_race


class SideMarginTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.lane = self.folder / fastlane.FILE
        self.metres = np.array([0., 100., 200., 300.])
        path = np.column_stack((self.metres, self.metres*0))
        self.route = aicorrections.Route(path, [0., 0.], False)
        self.write(path, np.where(self.metres < 150, 6.6, 7.0))

    def write(self, path, widths, height=0., lane=None):
        points = np.zeros(len(path), fastlane.POINT)
        detail = np.zeros(len(path), fastlane.DETAIL)
        points["pos"][:, [0, 2]] = path
        points["pos"][:, 1] = height
        detail["left"] = detail["right"] = np.asarray(widths) / 2
        fastlane._write_lane(lane or self.lane, points, detail)

    def anchor(self, metre, level=0.):
        return dict(metre=metre, level=level, origin=self.route.origin,
                    context=self.route.context(metre).tolist())

    def margin(self, start=100., end=200., left=None, right=1., id="m1"):
        return dict(id=id, start=self.anchor(start), end=self.anchor(end), left=left, right=right)

    def render(self, *items):
        return aihints.render(self.lane, self.route.circuit, list(items), (self.route, self.metres), None)

    def assertSections(self, result, expected):
        ini = ConfigParser()
        ini.read_string(result.data.decode("ascii"))
        self.assertEqual(ini.sections(), [f"DANGER_{i}" for i in range(len(expected))])
        for name, (start, end, left, right) in zip(ini.sections(), expected):
            self.assertAlmostEqual(ini[name].getfloat("START"), start, places=6)
            self.assertAlmostEqual(ini[name].getfloat("END"), end, places=6)
            self.assertEqual(ini[name]["LEFT"], f"{left:.2f}")
            self.assertEqual(ini[name]["RIGHT"], f"{right:.2f}")

    def test_right_margin_over_two_automatic_widths_keeps_left_automatic(self):
        hints = self.render(self.margin())
        self.assertSections(hints, [[0, 1/3, .5, .5], [1/3, .5, .5, 1.],
                                    [.5, 2/3, .75, 1.], [2/3, 1, .75, .75]])

    def test_explicit_zero_differs_from_auto(self):
        self.write(self.route.path, 6.6)
        margin = self.margin(left=0., right=None)
        self.assertSections(self.render(margin), [[0, 1/3, .5, .5], [1/3, 2/3, 0., .5],
                                                   [2/3, 1, .5, .5]])
        self.assertEqual(aimargins.problem([dict(margin, left=None)]), "Invalid side margin value")

    def test_tolerance_rounds_to_zero_before_dropping_empty_sections(self):
        self.write(self.route.path, 5.)
        margin = self.margin(left=1e-7, right=None)
        self.assertIsNone(aimargins.problem([margin]))
        result = self.render(margin)
        self.assertSections(result, [])
        self.assertEqual(result.spans[0].left, 0.)

    def test_without_margins_the_ini_is_the_automatic_bytes(self):
        automatic = (b"[DANGER_0]\nSTART=0.000000000\nEND=0.500000000\nLEFT=0.50\nRIGHT=0.50\n\n"
                     b"[DANGER_1]\nSTART=0.500000000\nEND=1.000000000\nLEFT=0.75\nRIGHT=0.75\n\n")
        self.assertEqual(self.render().data, automatic)
        hints = aihints.render(self.lane, False, [self.margin()], None, "manual")
        self.assertEqual((hints.data, hints.unplaced), (automatic, "manual"))

    def square(self, first=0):
        path = np.array([[0., 0.], [100., 0.], [100., 100.], [0., 100.]])
        self.route = aicorrections.Route(path, [0., 0.], True)
        self.metres = np.roll(np.arange(4)*100., -first)
        self.write(np.roll(path, -first, axis=0), 5.)

    def test_circuit_margin_across_start_finish_splits_at_zero(self):
        self.square()
        result = self.render(self.margin(380., 20., right=.75))
        self.assertSections(result, [[0., .05, 0, .75], [.95, 1., 0, .75]])

    def test_same_side_overlap_is_rejected_and_left_right_overlap_is_not(self):
        self.write(self.route.path, 5.)
        first = self.margin(30, 120)
        later = self.margin(60, 90, right=.75, id="later")
        result = self.render(first, later)
        self.assertIn("Overlaps side margin at route metre", result.rejected["later"])
        self.assertSections(result, [[.1, .4, 0, 1]])
        result = self.render(first, dict(later, left=.75, right=None))
        self.assertEqual(result.rejected, {})
        self.assertSections(result, [[.1, .2, 0, 1], [.2, .3, .75, 1], [.3, .4, 0, 1]])

    def test_unresolved_anchor_is_rejected_and_others_apply(self):
        self.write(self.route.path, 5.)
        bad = self.margin(30, 60, id="lost")
        bad["end"]["context"] = (np.array(bad["end"]["context"]) + [0, 20]).tolist()
        result = self.render(bad, self.margin())
        self.assertIn("Unresolved route anchor at route metre 60", result.rejected["lost"])
        self.assertSections(result, [[1/3, 2/3, 0, 1]])

    def test_anchor_on_the_deck_does_not_place_on_the_road_below(self):
        margin = dict(self.margin(), start=self.anchor(100, 7), end=self.anchor(200, 7))
        self.assertIn("Unresolved driving level", self.render(margin).rejected["m1"])
        self.write(self.route.path, 5., height=7)
        self.assertSections(self.render(margin), [[1/3, 2/3, 0, 1]])

    def test_empty_stretch_is_rejected(self):
        self.write(self.route.path, 5.)
        result = self.render(self.margin(100, 100))
        self.assertIn("Empty side margin", result.rejected["m1"])
        self.assertSections(result, [])

    def test_circuit_lane_with_wrapping_route_metres(self):
        self.square(first=2)
        result = self.render(self.margin(380, 20))
        self.assertSections(result, [[.45, .55, 0, 1]])
        result = self.render(self.margin(190, 205))
        self.assertSections(result, [[0., .0125, 0, 1], [.975, 1., 0, 1]])

    def test_route_margin_is_clipped_to_the_lane(self):
        self.metres = np.array([50., 100., 200., 250.])
        self.write(np.column_stack((self.metres, self.metres*0)), 5.)
        result = self.render(self.margin(30, 100))
        self.assertSections(result, [[0., .25, 0, 1]])
        self.assertSections(self.render(self.margin(200, 270)), [[.75, 1., 0, 1]])
        self.assertIn("m1", self.render(self.margin(270, 300)).rejected)
        self.assertIn("End precedes the start", self.render(self.margin(200, 100)).rejected["m1"])

    def test_margin_schema(self):
        margin = self.margin()
        self.assertIsNone(aimargins.problem([margin]))
        for items in [None, {}, [None], [dict(margin, id="")], [margin, margin],
                      [dict(margin, start={})], [dict(margin, end=None)]]:
            with self.subTest(items=items):
                self.assertEqual(aimargins.problem(items), "Invalid side margin")
        for value in [True, -0.05, 1.05, .051, "0.5", float("nan")]:
            with self.subTest(value=value):
                self.assertEqual(aimargins.problem([dict(margin, right=value)]),
                                 "Invalid side margin value")

    def test_recipe_reads_saved_margins(self):
        self.assertEqual(aimargins.recipe(self.folder), [])
        data = self.folder / "data"
        data.mkdir()
        margin = self.margin()
        (data / "map2lap.json").write_text(json.dumps({"edits": {"aiMargins": [margin]}}))
        self.assertEqual(aimargins.recipe(self.folder), [margin])

    def recipe(self, folder, *items):
        data = folder / "data"
        data.mkdir(parents=True, exist_ok=True)
        (data / "map2lap.json").write_text(json.dumps({"edits": {"aiMargins": items}}))
        (folder / fastlane.ROUTE).write_text("anchor 0 0\n0 0\n300 0\n")

    def ready(self, metres):
        self.recipe(self.folder)
        ailinestate.record_ready(self.folder, "source", metres=metres)

    def test_publish_uses_candidate_metres_not_the_installed_record(self):
        self.ready(self.metres)
        self.recipe(self.folder, self.margin())
        candidate = self.folder / "candidate.ai"
        self.write(self.route.path, 6., lane=candidate)
        ailinestate.publish(self.folder, "recalculated", candidate, metres=self.metres + 40.004)
        ini = ConfigParser()
        ini.read(self.folder / aihints.FILE)
        self.assertAlmostEqual(ini["DANGER_1"].getfloat("START"), .2)
        self.assertEqual(ini["DANGER_1"].getfloat("LEFT"), .25)
        self.assertEqual(ini["DANGER_1"].getfloat("RIGHT"), 1.)
        np.testing.assert_array_equal(ailinestate.lane_metres(self.folder, self.lane), self.metres + 40)
        self.assertEqual(ailinestate.hints_state(self.folder, False)["state"], "current")

    def test_publish_without_candidate_metres_cannot_reuse_the_installed_correspondence(self):
        self.ready(self.metres)
        self.recipe(self.folder, self.margin())
        candidate = self.folder / "candidate.ai"
        shutil.copy2(self.lane, candidate)
        ailinestate.publish(self.folder, "recalculated", candidate)
        self.assertEqual((self.folder / aihints.FILE).read_bytes(), self.render().data)
        self.assertEqual(ailinestate.hints_state(self.folder, False)["unplaced"], "recalculate")

    def test_save_carry_renders_after_the_record_is_staged(self):
        self.ready(self.metres + 40)
        staged = self.folder / "staged"
        self.recipe(staged, self.margin())
        with patch.object(ailinestate, "input_key", return_value="source"):
            state = ailinestate.carry(self.folder, staged / "new.kn5", False)
        self.assertEqual(state["status"], "ready")
        ini = ConfigParser()
        ini.read(staged / aihints.FILE)
        self.assertAlmostEqual(ini["DANGER_1"].getfloat("START"), .2)
        self.assertEqual(ini["DANGER_1"].getfloat("RIGHT"), 1.)

    def test_save_carry_keeps_metres_of_the_copied_lane_when_pending(self):
        self.ready(self.metres)
        staged = self.folder / "staged"
        self.recipe(staged, self.margin())
        with patch.object(ailinestate, "input_key", return_value="new geometry"):
            state = ailinestate.carry(self.folder, staged / "new.kn5", False)
        self.assertEqual(state["status"], "pending")
        np.testing.assert_array_equal(ailinestate.lane_metres(staged, staged / fastlane.FILE), self.metres)
        self.assertEqual((staged / aihints.FILE).read_bytes(), self.render(self.margin()).data)

    def test_save_carry_preserves_existing_and_missing_hints_while_ac_runs(self):
        self.ready(self.metres)
        staged = self.folder / "staged"
        self.recipe(staged, self.margin())
        source = self.folder / aihints.FILE
        target = staged / aihints.FILE
        with patch.object(ailinestate, "input_key", return_value="source"), patch.object(route_race, "ac_running", return_value=True):
            for installed in (b"[old]\r\n", b"", None):
                with self.subTest(installed=installed):
                    if installed is None:
                        source.unlink()
                    else:
                        source.write_bytes(installed)
                    target.write_bytes(b"from an earlier staged source")
                    ailinestate.carry(self.folder, staged / "new.kn5", False)
                    self.assertEqual(target.read_bytes() if target.exists() else None, installed)

    def test_sync_and_build_record_defer_installed_hints_while_ac_runs(self):
        self.ready(self.metres)
        ini = self.folder / aihints.FILE
        before = ini.read_bytes()
        self.recipe(self.folder, self.margin())
        with patch.object(route_race, "ac_running", return_value=True):
            for write in (lambda: ailinestate.sync_hints(self.folder, False),
                          lambda: ailinestate.record_ready(self.folder, "build", metres=self.metres)):
                with self.subTest(write=write):
                    ini.write_bytes(before)
                    write()
                    self.assertEqual(ini.read_bytes(), before)
            self.lane.unlink()
            ailinestate.mark_outdated(self.folder, "build", "missing lane")
            self.assertEqual(ini.read_bytes(), before)

    def test_publish_defers_the_whole_candidate_while_ac_runs(self):
        self.ready(self.metres)
        before = [(path, path.read_bytes()) for path in (
            self.lane, self.folder / aihints.FILE, self.folder / ailinestate.FILE)]
        candidate = self.folder / "candidate.ai"
        shutil.copy2(self.lane, candidate)
        with patch.object(route_race, "ac_running", return_value=True):
            with self.assertRaisesRegex(ValueError, "Close Assetto Corsa"):
                ailinestate.publish(self.folder, "recalculation", candidate, metres=self.metres + 40)
        self.assertTrue(candidate.is_file())
        for path, expected in before:
            self.assertEqual(path.read_bytes(), expected)

    def test_missing_saved_route_rejects_margins_and_keeps_the_lane_and_automatic_hints(self):
        self.ready(self.metres)
        self.recipe(self.folder, self.margin())
        (self.folder / fastlane.ROUTE).unlink()
        installed = self.lane.read_bytes()
        result = ailinestate.sync_hints(self.folder, False)
        self.assertIn("Unresolved route anchor at route metre 100", result.rejected["m1"])
        self.assertEqual((self.folder / aihints.FILE).read_bytes(), self.render().data)
        self.assertEqual(self.lane.read_bytes(), installed)
        self.assertEqual(ailinestate.hints_state(self.folder, False)["state"], "current")

    def test_unreadable_route_geometry_keeps_automatic_hints(self):
        self.ready(self.metres)
        self.recipe(self.folder, self.margin())
        for route in ("anchor 0 0\n", "unknown\n0 0\n300 0\n",
                      "anchor 0 0\n0 0\n0 0\n", "anchor 0 0\n0 0 0\n300 0 0\n",
                      "anchor 0 0\n0 0\nnan 0\n"):
            with self.subTest(route=route):
                (self.folder / fastlane.ROUTE).write_text(route)
                result = ailinestate.sync_hints(self.folder, False)
                self.assertIn("saved route unavailable", result.rejected["m1"])
                self.assertEqual(result.data, self.render().data)

    def test_outdated_record_keeps_metres_of_unchanged_lane(self):
        self.ready(self.metres)
        self.recipe(self.folder, self.margin())
        for message in (None, "failed to regenerate"):
            ailinestate.mark_outdated(self.folder, "changed inputs", message)
            np.testing.assert_array_equal(ailinestate.lane_metres(self.folder, self.lane), self.metres)
            self.assertEqual(ailinestate.hints(self.folder, False).data, self.render(self.margin()).data)
        self.write(self.route.path, 8.)
        ailinestate.mark_outdated(self.folder, "new inputs")
        self.assertIsNone(ailinestate.lane_metres(self.folder, self.lane))

    def test_legacy_record_without_metres_is_unplaced_recalculate(self):
        ailinestate.record_ready(self.folder, "legacy")
        self.recipe(self.folder, self.margin())
        record = self.folder / ailinestate.FILE
        legacy = json.loads(record.read_bytes())
        for data in (legacy, dict(legacy, metres=[0, 50]), {}):
            record.write_text(json.dumps(data))
            result = ailinestate.hints(self.folder, False)
            self.assertEqual(result.unplaced, "recalculate")
            self.assertEqual(result.data, self.render().data)

    def test_hand_replaced_lane_is_unplaced_manual_and_keeps_automatic_hints(self):
        self.ready(self.metres)
        self.recipe(self.folder, self.margin())
        self.write(self.route.path, 6.6)
        result = ailinestate.sync_hints(self.folder, False)
        self.assertEqual(result.unplaced, "manual")
        self.assertEqual((self.folder / aihints.FILE).read_bytes(), self.render().data)

    def run_generator(self, name, *args):
        """Run the build CLI and its folder/recipe writers with a stand-in tile and KN5 in this test's AC."""
        import generator
        target = self.folder / "content/tracks" / name
        (target / "data").mkdir(parents=True, exist_ok=True)
        tile = Future()
        tile.set_result((0, 0, 0.))
        def convert(*_, prepare_output, **kwargs):
            path = Path(prepare_output(True, 1))
            path.touch()
            return path
        points = [(0, 0), (0, .002)]
        with (patch.object(sys, "argv", ["generator", "--name", name, "--cache-gb", "0", *args, "--", "0,0", "0,.002"]),
              patch.object(generator, "ROOT", str(self.folder)),
              patch.object(generator.make_track_folder, "AC", str(self.folder)),
              patch.object(generator, "route", return_value=(points, 220)),
              patch.object(generator, "extend", return_value=[]),
              patch.object(generator, "road_rules", return_value={"country": "", "left_hand": False, "mph": False}),
              patch.object(generator, "corridor_tiles", return_value=[(0, 0)]),
              patch.object(generator.parallel, "pool") as pool,
              patch.object(generator.make_obj, "main", return_value=(0, 0, 0, [])),
              patch.object(generator.gates, "build", return_value=None),
              patch.object(generator.farview, "build", return_value=None),
              patch.object(generator, "where", return_value=("", "")),
              patch.object(generator.settings, "load", return_value={"debug_app": False}),
              patch.object(generator.make_track_folder, "make", return_value=target),
              patch.object(generator.obj_to_kn5, "convert", side_effect=convert),
              patch.object(fastlane, "regenerate"), patch.object(generator.mapcache, "trim")):
            pool.return_value.__enter__.return_value.submit.return_value = tile
            generator.main()
        return target

    def test_copy_rebuild_carries_side_margins_alone(self):
        import server
        from app import mytracks
        source = self.folder / "content/tracks/source"
        (source / "data").mkdir(parents=True)
        margins = [self.margin()]
        mytracks.save(source, {"title": "Source", "points": [[0, 0], [0, .002]], "edits": {"aiMargins": margins}})
        handler = object.__new__(server.Handler)
        handler.path = "/api/rebuild"
        handler._body = Mock(return_value={"name": "source", "copy": True})
        handler._send = Mock()
        with (patch.object(server.settings, "ac_path", return_value=str(self.folder)),
              patch.object(server, "start_build", return_value=(200, {"ok": True})) as start):
            handler.do_POST()
        handler._send.assert_called_once_with(200, {"ok": True})
        self.assertEqual("source", start.call_args.kwargs.get("ai_source"))
        target = self.run_generator(start.call_args.args[0], "--ai-source", start.call_args.kwargs["ai_source"])
        self.assertEqual({"aiMargins": margins}, mytracks.load(target)["edits"])

    def test_generator_defers_removing_installed_ini_while_ac_runs(self):
        hints = self.folder / "content/tracks/existing" / aihints.FILE
        hints.parent.mkdir(parents=True)
        hints.write_bytes(b"installed hints")
        with patch.object(route_race, "ac_running", return_value=True):
            self.run_generator("existing")
        self.assertEqual(b"installed hints", hints.read_bytes())

    def test_hints_state_current_and_stale(self):
        self.ready(self.metres)
        def state():
            return ailinestate.hints_state(self.folder, False)
        self.assertEqual(state(), dict(state="current", unplaced=None, rejected={}))
        self.recipe(self.folder, self.margin())
        self.assertEqual(state(), dict(state="stale", unplaced=None, rejected={}))
        ailinestate.sync_hints(self.folder, False)
        self.assertEqual(state()["state"], "current")
        self.recipe(self.folder)
        self.assertEqual(ailinestate.sync_hints(self.folder, False).data, self.render().data)
        self.write(self.route.path, 5.)
        (self.folder / aihints.FILE).unlink()
        self.assertEqual(state()["state"], "current")


if __name__ == "__main__":
    unittest.main()
