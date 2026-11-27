"""Recording a circuit keeps the original bytes and accepts only this practice's candidate."""
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import lanerecording, mytracks
from track import fastlane


def lane(path, shift=0, *, height=0):
    points = np.zeros(24, dtype=fastlane.POINT)
    angle = np.arange(24) * np.pi / 12
    points["pos"][:, 0] = (30 + shift) * np.cos(angle)
    points["pos"][:, 1] = height
    points["pos"][:, 2] = (30 + shift) * np.sin(angle)
    points["length"] = np.arange(24) * 8
    fastlane._write_lane(path, points, np.zeros(24, dtype=fastlane.DETAIL))


def road(model, height):
    root = fastlane.obj_to_kn5.empty("root", (0, 0, 0), (0, 0, 1))
    vertices = np.zeros(4, dtype=fastlane.kn5.VERTEX)
    vertices["pos"] = [(x, height, z) for x, z in ((-50, -50), (50, -50), (50, 50), (-50, 50))]
    root.children.append(fastlane.kn5.Node(2, "1ROAD_test", 1, vertices=vertices, bs_center=(0, 0, 0),
                                          indices=np.array([0, 1, 2, 0, 2, 3], dtype=np.uint16)))
    fastlane.kn5.write(model, [], [], root)


class RecordingTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.enterContext(mock.patch.object(mytracks, "ROOT", str(self.root)))
        self.folder = self.root / "ac/content/tracks/loop"
        self.folder.mkdir(parents=True)
        self.model = self.folder / "loop.kn5"
        road(self.model, 0)
        self.candidate = self.folder / "club/ai/fast_lane.ai.candidate"

    def test_preparing_practice_preserves_ini_and_arms_only_its_token(self):
        from app import recordingpractice
        ac = self.root / "ac"
        config = ac / "system/cfg/assetto_corsa.ini"
        config.parent.mkdir(parents=True)
        config.write_bytes(b"[AC_APPS]\r\nENABLE_DEV_APPS=0 ; user comment\r\n[OTHER]\r\nVALUE=2\r\n")
        recordingpractice.prepare(ac, "ticket")
        self.assertIn(b"ENABLE_DEV_APPS=1 ; user comment\r\n", config.read_bytes())
        self.assertIn(b"[OTHER]\r\nVALUE=2", config.read_bytes())
        self.assertEqual("ticket", (ac / recordingpractice.APP / "armed").read_text())

    def test_session_checks_track_and_layout_even_if_launcher_keeps_custom_keys(self):
        from app import recordingpractice
        race = self.root / "race.ini"
        session = recordingpractice.Session(self.root / "ac", self.model, "club", race)
        lane(self.candidate)
        race.write_text(f"[RACE]\n__MAP2LAP_RECORDING={session.token}\nTRACK=loop\nCONFIG_TRACK=other\n[SESSION_0]\nTYPE=1\n")
        session.finish()
        self.assertEqual("empty", session.result["status"])

    def test_even_explicit_race_retry_keeps_the_selected_recording(self):
        from app import ailanejobs
        from track import ailinestate
        target = self.folder / fastlane.FILE
        lane(target)
        key = ailinestate.checksum(target)
        (self.folder / "data").mkdir()
        mytracks.save(self.folder, {"kind":"circuit", "edits":{"aiLine":key}})
        ailinestate._write(self.folder, key, "ready", lane=key, recorded=True)
        with mock.patch.object(ailanejobs, "compute", side_effect=AssertionError("recording recalculated")):
            code, result = ailanejobs.race(self.model, True, {"recalculate":True}, lambda: (200, "started"))
        self.assertEqual((200, "started"), (code, result))

    def test_undo_only_reuses_an_automatic_line_for_its_original_geometry(self):
        from track import ailinestate

        base = self.folder / lanerecording.BASE
        lane(base / fastlane.FILE)
        ailinestate.record_ready(base, "original", circuit=True)
        mytracks.save(self.folder, {"kind": "circuit", "edits": {"aiLine": "a" * 64}})
        for fingerprint, expected in (("original", "ready"), ("raised", "pending")):
            with self.subTest(fingerprint=fingerprint):
                dest = self.root / fingerprint
                shutil.copytree(base, dest / lanerecording.BASE)
                with mock.patch.object(ailinestate, "input_key", return_value=fingerprint):
                    result = lanerecording.stage(self.model, dest / "copy.kn5", None)
                self.assertEqual(expected, result["status"])
                self.assertEqual(expected, ailinestate.status(dest, fingerprint)["status"])
                self.assertEqual((base / fastlane.FILE).read_bytes(), (dest / fastlane.FILE).read_bytes())

    def test_explicit_recalculate_republishes_the_selected_recording_after_file_damage(self):
        from app import ailanejobs
        from track import ailinestate

        installed = self.folder / fastlane.FILE
        lane(installed)
        key = ailinestate.checksum(installed)
        archive = self.folder / lanerecording.BUNDLE / (key + ".ai")
        archive.parent.mkdir(parents=True)
        shutil.copy2(installed, archive)
        mytracks.save(self.folder, {"kind": "circuit", "edits": {"aiLine": key}})
        points = fastlane.read_lane(archive)[0]["pos"]
        route = fastlane.aicorrections.Route(points[:, fastlane.XZ], [46., 14.], True)
        # Isolate geometry export while exercising the job, file installation and checksum checks.
        fields = dict(lane=key, recorded=True, gaps=[], metres=None, drivenMetres=route.metres[:-1].tolist())
        for missing in (False, True):
            with self.subTest(missing=missing):
                if missing:
                    installed.unlink()
                else:
                    installed.write_bytes(b"incomplete")
                self.assertEqual("failed", ailanejobs.ensure(self.model, True)["status"])
                with (mock.patch.object(lanerecording, "publication", return_value=(archive, fields)) as export,
                      mock.patch.object(lanerecording, "editing", return_value=(None, (None,) * 5 + (route,), None)),
                      mock.patch.object(ailanejobs, "compute", side_effect=AssertionError("Selected an automatic line"))):
                    result = ailanejobs.ensure(self.model, True, retry=True, place_margins=True)
                export.assert_called_once_with(self.model, key, self.model)
                self.assertEqual("ready", result["status"])
                self.assertEqual(archive.read_bytes(), installed.read_bytes())
        archive.unlink()
        installed.write_bytes(b"damaged again")
        with mock.patch.object(ailanejobs, "compute", side_effect=AssertionError("Selected an automatic line")):
            self.assertEqual("failed", ailanejobs.ensure(self.model, True, retry=True)["status"])
        self.assertEqual(b"damaged again", installed.read_bytes())

    def test_old_saved_raw_recording_with_its_archive_needs_measurement_before_racing(self):
        from track import ailinestate
        target = self.folder / fastlane.FILE
        lane(target)
        key = ailinestate.checksum(target)
        bundle = self.folder / lanerecording.BUNDLE
        bundle.mkdir(parents=True)
        shutil.copy2(target, bundle / (key + ".ai"))
        mytracks.save(self.folder, {"kind":"circuit", "edits":{"aiLine":key}})
        ailinestate._write(self.folder, key, "ready", lane=key, recorded=True)
        self.assertEqual("pending", ailinestate.status(self.folder,key)["status"])

    def test_old_recorded_export_is_remeasured_before_racing(self):
        import json
        from track import ailinestate

        installed = self.folder / fastlane.FILE
        lane(installed)
        key = ailinestate.checksum(installed)
        archive = self.folder / lanerecording.BUNDLE / (key + ".ai")
        archive.parent.mkdir(parents=True)
        shutil.copy2(installed, archive)
        mytracks.save(self.folder, {"kind": "circuit", "edits": {"aiLine": key}})
        ailinestate._write(self.folder, key, "ready", lane=key, recorded=True, drivenMetres=list(range(24)))
        metadata = self.folder / ailinestate.FILE
        record = json.loads(metadata.read_text(encoding="utf-8"))
        record["code"] = 14
        metadata.write_text(json.dumps(record), encoding="utf-8")
        self.assertEqual("pending", ailinestate.status(self.folder, key)["status"])

    @unittest.skipUnless(shutil.which("luajit"), "LuaJIT is optional in development")
    def test_csp_enters_practice_once_and_leaves_export_to_ac(self):
        app = Path(__file__).resolve().parents[2] / "src/acapp/Map2LapRecorder/Map2LapRecorder.lua"
        host = """
local sim, car, starts, recordings = {isInMainMenu=true}, {splinePosition=.99}, 0, 0
local settings = {__MAP2LAP_RECORDING="ticket", TRACK="loop", CONFIG_TRACK=""}
local ini = {get=function(_,section,key,default) return settings[key] or default end}
__dirname="."; io.load=function() return "ticket" end; io.save=function() end
ui={toast=function() end, Icons={}}; script={}
ac={INIConfig={raceConfig=function() return ini end}, getTrackID=function() return "loop" end,
    getTrackLayout=function() return "" end, getCar=function() return car end, getSim=function() return sim end,
    isAISplineRecorderPresent=function() return true end, isAISplineRecorderActive=function() return true end,
    startAISplineRecorder=function(pits) assert(not pits); recordings=recordings+1 end, log=function() end,
    tryToStart=function() starts=starts+1; sim.isInMainMenu=false; return true end}
dofile(arg[1])
script.update(.01); script.update(.01)
assert(starts==1 and recordings==1, "Drive and Arm must each run once")
for _,p in ipairs({.01,.95,.01}) do car.splinePosition=p; script.update(.01) end
sim.isInMainMenu=true; script.update(.01)
assert(starts==1 and recordings==1, "Leaving practice must not resume driving")
"""
        result = subprocess.run(["luajit", "-", str(app)], input=host, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_capture_is_layout_bound_and_freezes_exact_bytes(self):
        lane(self.candidate)
        session = lanerecording.Capture(self.model, "club")
        lane(self.folder / "ai/fast_lane.ai.candidate", 1)
        self.assertIsNone(session.finish())
        lane(self.candidate, 2)
        captured = session.finish()
        frozen = lanerecording.path(self.model, captured)
        self.assertEqual(self.candidate.read_bytes(), frozen.read_bytes())
        floors = lanerecording._floors_file(self.model, frozen)
        self.assertEqual([{"1ROAD_test": [0.]}] * 24, lanerecording._read_floors(floors, captured, 24))
        lanerecording.bundle_floors(self.model, self.model, captured)
        bundled = lanerecording._floors_file(self.model, frozen)
        self.assertEqual(self.folder / lanerecording.BUNDLE / floors.name, bundled)
        floors.write_bytes(b"later local capture")
        self.assertEqual([{"1ROAD_test": [0.]}] * 24, lanerecording._read_floors(bundled, captured, 24))
        bundled.write_bytes(bundled.read_bytes()[:-4])
        with self.assertRaisesRegex(ValueError, "height reference"):
            lanerecording._read_floors(bundled, captured, 24)
        lane(self.candidate, 3)
        self.assertNotEqual(self.candidate.read_bytes(), frozen.read_bytes())

    def test_prepared_v7_positions_follow_only_the_height_change_since_capture(self):
        (self.folder / "data").mkdir()
        mytracks.save(self.folder, {"kind": "circuit", "edits": {"heights": [{"id": "old"}]}})
        road(self.model, 5)
        session = lanerecording.Capture(self.model, "club")
        lane(self.candidate, height=5.125)
        key = session.finish()
        xyz = fastlane.read_lane(self.candidate)[0]["pos"]
        target = self.root / "copy" / "copy.kn5"
        (target.parent / "data").mkdir(parents=True)
        mytracks.save(target.parent, {"kind": "circuit"})
        np.savetxt(target.parent / fastlane.ROUTE, xyz[:, fastlane.XZ], header="anchor 0 0", comments="")
        for height in (5., 11.):
            with self.subTest(height=height):
                road(target, height)
                prepared = lanerecording.prepare(target, key, [], self.model)
                exported = fastlane.read_lane(lanerecording.prepared_path(prepared["file"]))[0]["pos"]
                np.testing.assert_array_equal(exported[:, fastlane.XZ], xyz[:, fastlane.XZ])
                np.testing.assert_array_equal(exported[:, 1], np.full(len(xyz), height+.125))

    def test_two_tracks_with_identical_raw_samples_keep_their_own_capture_surface(self):
        session = lanerecording.Capture(self.model, "club")
        lane(self.candidate)
        key = session.finish()
        other = self.root / "second" / "second.kn5"
        other.parent.mkdir()
        road(other, .25)
        second = lanerecording.Capture(other, "club")
        lane(second.file)
        self.assertEqual(key, second.finish())
        for model, expected in ((self.model, 0.), (other, .25)):
            raw = lanerecording.path(model, key)
            floors = lanerecording._read_floors(lanerecording._floors_file(model, raw), key, 24)
            np.testing.assert_allclose([f["1ROAD_test"][0] for f in floors], np.full(24, expected),
                                       rtol=0, atol=1e-10)

    def test_open_recording_requires_ordered_forward_crossings_on_the_gate_level(self):
        from track import drivenline, obj_to_kn5
        markers = {f"AC_AB_{gate}_{side}": obj_to_kn5.empty("gate", (x, 0, z), (0, 0, 1)).matrix
                   for gate, z in (("START", 5), ("FINISH", 25)) for side, x in (("L", -4), ("R", 4))}
        xyz = np.column_stack((np.zeros(32), np.zeros(32), np.arange(32)))
        self.assertEqual((5., 25.), drivenline.stage_gates(xyz, markers))
        for partial in (xyz[:23], xyz[::-1], xyz + [0, 12, 0], xyz + [7, 0, 0]):
            with self.subTest(last=partial[-1]), self.assertRaises(ValueError):
                drivenline.stage_gates(partial, markers)

    def test_open_alignment_never_projects_onto_a_return_chord(self):
        xyz = np.array([[0, 0, 0], [0, 0, 20], [20, 0, 20], [20, 0, 0]], float)
        stations = np.arange(4)*20.
        mapped, gaps = lanerecording.alignment(xyz, xyz, stations, 60., circuit=False)
        np.testing.assert_equal(mapped, stations)
        self.assertFalse(gaps)
        detour = np.insert(xyz, 2, [10, 0, 0], axis=0)
        _, gaps = lanerecording.alignment(detour, xyz, stations, 60., circuit=False)
        self.assertEqual([[20.,40.]], gaps)
        self.assertIsNone(lanerecording.alignment(xyz[::-1], xyz, stations, 60., circuit=False)[0])

    def test_open_hint_on_a_twice_driven_section_stays_stored(self):
        from track import ailinestate
        metres = np.arange(11)*10.
        reference = np.column_stack((metres*0, metres*0, metres))
        revisited = reference[[0,1,2,3,4,5,4,3,2,3,4,5,6,7,8,9,10]]
        mapped, gaps = lanerecording.alignment(revisited, reference, metres, 100., circuit=False)
        self.assertIsNotNone(mapped)
        self.assertTrue(ailinestate.crosses_gap(23, 30, gaps, 100., circuit=False))
        self.assertFalse(ailinestate.crosses_gap(70, 90, gaps, 100., circuit=False))

    def test_unrelated_hint_survives_a_local_detour(self):
        from track import ailinestate
        lane(self.folder / fastlane.FILE)
        xyz = fastlane.read_lane(self.folder / fastlane.FILE)[0]["pos"].copy()
        ref = xyz.copy()
        xyz[8:14, 1] += 10
        metres, blocked = lanerecording.alignment(xyz, ref, np.arange(24)*8., 192.)
        self.assertIsNotNone(metres)
        self.assertTrue(ailinestate.crosses_gap(80, 104, blocked, 192))
        self.assertFalse(ailinestate.crosses_gap(152, 176, blocked, 192))

    def test_hints_authored_on_a_driven_detour_use_its_own_stations(self):
        from track import ailinestate
        installed = self.folder / fastlane.FILE
        lane(installed)
        xyz = fastlane.read_lane(installed)[0]["pos"].astype(float)
        route = fastlane.aicorrections.Route(xyz[:, fastlane.XZ], [46.,14.], True)
        def anchor(i):
            m = route.metres[i]
            return dict(route=route.key, context=route.context(m).tolist(), level=0, metre=m, origin=route.origin)
        zone = dict(id="driven", kind="braking", value=.9, start=anchor(8), end=anchor(12))
        result, _ = ailinestate._render(self.folder, installed, True, [zone], {}, None, "recorded",
                                         native=(route, route.metres[:-1]))
        self.assertEqual({}, result.rejected)
        self.assertIn(b"[BRAKEHINT_0]", result.data)

    def test_invalid_candidate_cannot_replace_installed_line(self):
        installed = self.folder / fastlane.FILE
        lane(installed)
        original = installed.read_bytes()
        session = lanerecording.Capture(self.model, "")
        installed.with_suffix(".ai.candidate").write_bytes(b"partial")
        with self.assertRaises(ValueError):
            session.finish()
        self.assertEqual(original, installed.read_bytes())

    def test_unique_directed_lap_correspondence_refuses_wrong_direction_and_shortcut(self):
        path = self.folder / fastlane.FILE
        lane(path)
        xyz = fastlane.read_lane(path)[0]["pos"]
        metres = np.arange(len(xyz)) * 8.
        mapped, gaps = lanerecording.alignment(np.roll(xyz, 5, axis=0), xyz, metres, 192.)
        np.testing.assert_allclose(mapped, np.roll(metres, 5), atol=.01)
        self.assertFalse(gaps)
        self.assertIsNone(lanerecording.alignment(xyz[::-1], xyz, metres, 192.)[0])
        detour = xyz.copy()
        detour[8:14, 1] += 10
        self.assertTrue(lanerecording.alignment(detour, xyz, metres, 192.)[1])


if __name__ == "__main__":
    unittest.main()
