"""A track's terrain spacing survives sharing and each build gets its own worker environment."""
import base64
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock
import zlib

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import server
from app import buildoptions, mytracks, trackcode


class TrackCodeGridTest(unittest.TestCase):
    def test_hd_quality_roundtrips_and_old_codes_stay_sd(self):
        hd = trackcode.encode(self.info(ground_quality='hd'))
        self.assertTrue(hd.startswith('M2L3-'), 'Old apps must refuse HD instead of silently building SD')
        self.assertEqual(trackcode.decode(hd)['ground_quality'], 'hd')
        self.assertEqual(trackcode.decode(trackcode.encode(self.info()))['ground_quality'], 'sd')
        self.assertNotEqual(mytracks._same(self.info()), mytracks._same(self.info(ground_quality='hd')))

    def test_ground_quality_validation_and_worker_environment(self):
        self.assertEqual(buildoptions.environment({'ground_quality': 'hd'})['BNE_GROUND_QUALITY'], 'hd')
        with mock.patch.dict(os.environ, BNE_GROUND_QUALITY='hd'):
            self.assertEqual(buildoptions.from_environment()['ground_quality'], 'hd')
        for value in ('HD', 'ultra', None, True, 1):
            with self.subTest(value=value), self.assertRaises(ValueError):
                buildoptions.checked({'ground_quality': value})
    def info(self, **extra):
        return {"title": "Grid", "track_version": "0.6.0", "points": [[46., 14.], [46.01, 14.01]],
                "width": 100, **extra}

    def test_one_metre_route_and_area_codes_retain_their_spacing(self):
        for info in (self.info(terrain_cell_m=1), self.info(terrain_cell_m=1, area=[46, 14, 47, 15])):
            code = trackcode.encode(info)
            self.assertTrue(code.startswith("M2L2-"), "Older apps must refuse a grid they cannot reproduce")
            self.assertEqual(trackcode.decode(code)["terrain_cell_m"], 1)

    def test_old_codes_default_to_two_metres_and_their_encoding_stays_compatible(self):
        old = trackcode.encode(self.info())
        self.assertEqual(trackcode.decode(old)["terrain_cell_m"], 2)
        self.assertEqual(old, trackcode.encode(self.info(terrain_cell_m=2)))

    def test_codes_refuse_unsupported_grids_instead_of_building_a_different_track(self):
        for value in (0.5, True, "1", None):
            data = {"v": "0.6.0", "t": "Grid", "p": [[46, 14], [47, 15]], "w": 100, "g": value}
            code = trackcode.PREFIX + base64.urlsafe_b64encode(zlib.compress(json.dumps(data).encode())).decode().rstrip("=")
            with self.subTest(value=value), self.assertRaises(trackcode.BadCode):
                trackcode.decode(code)


class BuildGridTest(unittest.TestCase):
    def test_ground_quality_is_captured_and_sent_to_only_the_child(self):
        with mock.patch.object(server.threading, 'Thread') as thread:
            status, _ = server.start_build('quality', 'Quality', [(46, 14), (47, 15)], 100, None, ground_quality='hd')
        self.assertEqual(status, 200)
        self.assertEqual(thread.call_args.kwargs['args'][-1], 'hd')
        process = mock.Mock(stdout=['RESULT {"name":"quality"}\n'], pid=123, wait=mock.Mock(return_value=0))
        with (mock.patch.dict(os.environ, BNE_GROUND_QUALITY='hd'),
              mock.patch.object(server, 'MARK', str(Path(self.root) / 'running.json')),
              mock.patch.object(server, 'build_log', return_value=None),
              mock.patch.object(server.subprocess, 'Popen', return_value=process) as popen):
            server.run_build([], 'quality', False, 0., ground_quality='sd')
            self.assertEqual(popen.call_args.kwargs['env']['BNE_GROUND_QUALITY'], 'sd')
            self.assertEqual(os.environ['BNE_GROUND_QUALITY'], 'hd')
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = tmp.name
        for patch in (mock.patch.object(server.settings, "is_ac", return_value=True),
                      mock.patch.object(server, "saved_in_editor", return_value=None),
                      mock.patch.object(server.csp, "busy", return_value=False),
                      mock.patch.object(server.trackcopy, "busy", return_value=False),
                      mock.patch.dict(server.job, state="idle", log=[]),
                      mock.patch.dict(server.running, clearing=False),
                      mock.patch.dict(server.updater.state, state="idle")):
            patch.start()
            self.addCleanup(patch.stop)

    def test_each_build_captures_its_selected_grid(self):
        with mock.patch.object(server.threading, "Thread") as thread:
            status, _ = server.start_build("grid", "Grid", [(46, 14), (47, 15)], 100, None, terrain_cell_m=1)
        self.assertEqual(status, 200)
        self.assertEqual(thread.call_args.kwargs["args"][4], 1)

    def test_car_and_tree_options_are_captured_per_build_and_shared_in_codes(self):
        with mock.patch.object(server.threading, "Thread") as thread:
            status, _ = server.start_build("grid", "Grid", [(46, 14), (47, 15)], 100, None,
                                           parked_cars=False, tree_spacing_m=5.5)
        self.assertEqual(status, 200)
        self.assertEqual(thread.call_args.kwargs["args"][5:], (False, 5.5, "sd"))
        info = {"title": "Sparse", "points": [[46, 14], [47, 15]], "width": 100,
                "parked_cars": False, "tree_spacing_m": 5.5}
        code = trackcode.encode(info)
        self.assertTrue(code.startswith("M2L2-"))
        decoded = trackcode.decode(code)
        self.assertFalse(decoded["parked_cars"])
        self.assertEqual(decoded["tree_spacing_m"], 5.5)

    def test_bad_scenery_options_are_refused_before_starting(self):
        for values in ({"parked_cars": 0}, {"tree_spacing_m": True}, {"tree_spacing_m": -1},
                       {"tree_spacing_m": 101}, {"tree_spacing_m": float("nan")}):
            with self.subTest(values=values), mock.patch.object(server.threading, "Thread") as thread:
                self.assertEqual(server.start_build("grid", "Grid", [(46, 14), (47, 15)], 100, None, **values)[0], 400)
                thread.assert_not_called()

    def test_bad_grid_is_refused_before_starting_a_worker(self):
        for value in (0.5, True, "1", None):
            with self.subTest(value=value), mock.patch.object(server.threading, "Thread") as thread:
                status, _ = server.start_build("grid", "Grid", [(46, 14), (47, 15)], 100, None, terrain_cell_m=value)
                self.assertEqual(status, 400)
                thread.assert_not_called()

    def test_build_worker_overrides_an_inherited_grid_without_changing_the_server_environment(self):
        process = mock.Mock(stdout=['RESULT {"name":"grid"}\n'], pid=123, wait=mock.Mock(return_value=0))
        with (mock.patch.dict(os.environ, BNE_AC_GRID_M="1"),
              mock.patch.object(server, "MARK", str(Path(self.root) / "running.json")),
              mock.patch.object(server, "build_log", return_value=None),
              mock.patch.object(server.subprocess, "Popen", return_value=process) as popen):
            server.run_build([], "grid", False, 0.0, terrain_cell_m=2)
            self.assertEqual(popen.call_args.kwargs["env"]["BNE_AC_GRID_M"], "2")
            self.assertEqual(os.environ["BNE_AC_GRID_M"], "1")


class TrackIdentityGridTest(unittest.TestCase):
    def test_listing_repairs_an_experiment_track_code_that_predates_grid_support(self):
        with tempfile.TemporaryDirectory() as ac:
            folder = Path(ac) / "content/tracks/fine"
            (folder / "data").mkdir(parents=True)
            info = {"title": "Fine", "points": [[46, 14], [47, 15]], "width": 100,
                    "track_version": server.version.TRACK_VERSION}
            old_code = trackcode.encode(info)
            mytracks.save(str(folder), {**info, "terrain_cell_m": 1, "code": old_code})
            (folder / "fine.kn5").write_bytes(b"x")
            self.assertEqual(trackcode.decode(mytracks.listing(ac)[0]["code"])["terrain_cell_m"], 1)

    def test_a_different_grid_is_not_a_current_copy_of_an_old_track(self):
        two = {"points": [[46, 14], [47, 15]], "width": 100}
        one = {**two, "terrain_cell_m": 1}
        for extra in ({}, {"area": [46, 14, 47, 15]}):
            with self.subTest(extra=extra):
                self.assertNotEqual(mytracks._same({**two, **extra}), mytracks._same({**one, **extra}))


if __name__ == "__main__":
    unittest.main()
