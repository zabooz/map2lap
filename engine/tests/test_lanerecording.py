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


def lane(path, shift=0):
    points = np.zeros(24, dtype=fastlane.POINT)
    angle = np.arange(24) * np.pi / 12
    points["pos"][:, 0] = (30 + shift) * np.cos(angle)
    points["pos"][:, 2] = (30 + shift) * np.sin(angle)
    points["length"] = np.arange(24) * 8
    fastlane._write_lane(path, points, np.zeros(24, dtype=fastlane.DETAIL))


class RecordingTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.enterContext(mock.patch.object(mytracks, "ROOT", str(self.root)))
        self.folder = self.root / "ac/content/tracks/loop"
        self.folder.mkdir(parents=True)
        self.model = self.folder / "loop.kn5"
        self.model.touch()
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
        lane(self.candidate, 3)
        self.assertNotEqual(self.candidate.read_bytes(), frozen.read_bytes())

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
