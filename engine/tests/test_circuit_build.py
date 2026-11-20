"""Circuit kind, lap and timing through the build, track library and rebuild."""

from concurrent.futures import Future
from contextlib import redirect_stdout
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

REPO = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(REPO / "src"), str(REPO / "tools")]
import from_debug
import generator
import measure
import server
from app import circuitlap, mytracks, trackcode


PINS = [(46.65, 14.62), (46.66, 14.63)]
COORDS = [PINS[0], PINS[1], (46.651, 14.631), PINS[0]]
SAVED_TIMING = {"line_m": 120.0, "twice": [[10.0, 50.0]]}


class CircuitBuildTest(unittest.TestCase):
    def setUp(self):
        tmp = self.enterContext(tempfile.TemporaryDirectory())
        self.root = Path(tmp)
        self.work = self.root / "out/tracks/test"
        self.anchor = self.work / "tiles/anchor.json"
        self.installed = self.root / "content/tracks/test"

    def build_anchor(self, *, kind="circuit", area=None, line=None, **settings):
        """Run the generator through its anchor write with the tile work isolated."""
        tile = Future()
        tile.set_result((0, 0, 0.0))
        pool = mock.MagicMock()
        pool.__enter__.return_value.submit.return_value = tile
        log = []
        with (mock.patch.object(generator, "ROOT", str(self.root)),
              mock.patch.object(generator, "road_rules", return_value={"country": "AUT", "left_hand": False, "mph": False}),
              mock.patch.object(generator, "corridor_tiles", return_value=[(0, 0)]),
              mock.patch.object(generator, "area_tiles", return_value=[(0, 0)]),
              mock.patch.object(generator.parallel, "pool", return_value=pool),
              mock.patch.object(generator.make_obj, "main", return_value=(0, 0, 0, [])),
              mock.patch.object(generator, "route", side_effect=AssertionError("Circuit used Route")),
              mock.patch.object(generator, "extend", side_effect=AssertionError("Circuit used the Route run-off"))):
            generator._build(PINS, 120.0, "test", "Test", log.append, False, area, None, None, "obj", line,
                             kind=kind, **settings)
        return json.loads(self.anchor.read_text(encoding="utf-8")), log

    def test_circuit_anchor_is_a_closed_lap_with_timing(self):
        lap = circuitlap.Lap(COORDS, 3000.0, [(300.0, 600.0)], [0.0, 1000.0])
        with mock.patch.object(generator, "circuit_route", return_value=lap) as route:
            anchor, log = self.build_anchor(line=None)
        route.assert_called_once_with([(lat, generator.wrap_lon(lon)) for lat, lon in PINS])
        self.assertEqual(anchor["kind"], "circuit")
        self.assertEqual(anchor["route"][0], anchor["route"][-1])
        self.assertEqual(anchor["line"], [list(p) for p in COORDS])
        self.assertEqual(anchor["timing"]["start_m"], 0.0)
        metres = np.linalg.norm(np.diff(anchor["route"], axis=0), axis=1).sum()
        lo, hi = anchor["timing"]["twice"][0]
        self.assertAlmostEqual(lo, metres / 10, places=2)
        self.assertAlmostEqual(hi, metres / 5, places=2)
        self.assertTrue(any(line.startswith("Circuit, lap ") for line in log))

    def test_debug_anchor_preserves_placed_timing_and_uses_given_line(self):
        with mock.patch.object(generator, "circuit_route", side_effect=AssertionError("Circuit re-routed a saved lap")):
            anchor, _ = self.build_anchor(line=(COORDS, len(COORDS) - 1), circuit_timing=SAVED_TIMING)
        self.assertEqual(anchor["kind"], "circuit")
        self.assertEqual(anchor["route"][0], anchor["route"][-1])
        self.assertEqual(anchor["timing"], {"start_m": 0.0, **SAVED_TIMING})

    def test_route_and_area_anchors_record_their_kind(self):
        route, _ = self.build_anchor(kind="route", line=(COORDS, len(COORDS) - 1))
        area, _ = self.build_anchor(kind="route", area=[46.6, 14.6, 46.7, 14.7])
        self.assertEqual(route["kind"], "route")
        self.assertEqual(area["kind"], "area")

    def test_circuit_is_not_point_to_point(self):
        anchor = {"kind": "circuit", "route": [[0., 0.], [0., 100.], [50., 50.], [0., 0.]], "lat": 46.65, "lon": 14.62,
                  "tiles": [[0, 0]], "points": PINS, "width": 120, "length_m": 242.0,
                  "timing": {"start_m": 0.0, "twice": SAVED_TIMING["twice"]}}
        self.anchor.parent.mkdir(parents=True)
        self.anchor.write_text(json.dumps(anchor), encoding="utf-8")
        (self.installed / "data").mkdir(parents=True)

        def convert(_obj, kn5, anchor_path, prepare_output=None, **kwargs):
            """Write a stand-in KN5 and the converter's placed line metre."""
            if prepare_output is not None:
                kn5 = prepare_output()
            path = Path(anchor_path)
            saved = json.loads(path.read_text(encoding="utf-8"))
            saved["timing"]["line_m"] = SAVED_TIMING["line_m"]
            path.write_text(json.dumps(saved), encoding="utf-8")
            Path(kn5).write_bytes(b"kn5")
            return kn5

        with (mock.patch.object(generator.farview, "build", return_value=None),
              mock.patch.object(generator.gates, "make_textures", side_effect=AssertionError("Circuit built gates")),
              mock.patch.object(generator, "where", return_value=("", "")),
              mock.patch.object(generator.settings, "load", return_value={"debug_app": False}),
              mock.patch.object(generator.make_track_folder, "make", return_value=str(self.installed)) as make,
              mock.patch.object(generator.obj_to_kn5, "convert", side_effect=convert)):
            generator._finish("test", "Test", self.work, anchor, np.asarray(anchor["route"]), COORDS, [], (0, 0, 0),
                              0, lambda msg: None, lambda *progress: None, False, None)
        self.assertFalse(make.call_args.kwargs["point_to_point"])
        self.assertTrue(make.call_args.kwargs["extra_description"].startswith("Circuit, lap "))
        info = mytracks.load(self.installed)
        self.assertEqual(info["kind"], "circuit")
        self.assertEqual(info["timing"], SAVED_TIMING)
        self.assertEqual(trackcode.decode(info["code"])["kind"], "circuit")
        self.assertEqual(info["route_end"], len(COORDS) - 1)

    def test_refused_start_finish_keeps_the_installed_track(self):
        anchor = {"kind": "circuit", "route": [[0., 0.], [0., 100.], [50., 50.], [0., 0.]], "lat": 46.65, "lon": 14.62,
                  "tiles": [[0, 0]], "points": PINS, "width": 120, "length_m": 242.0,
                  "timing": {"start_m": 0.0, "twice": [[0., 242.]]}}
        self.anchor.parent.mkdir(parents=True)
        self.anchor.write_text(json.dumps(anchor), encoding="utf-8")
        obj_dir = self.work / "obj"
        obj_dir.mkdir()
        (obj_dir / "track.obj").touch()
        (obj_dir / "track.mtl").touch()
        (self.installed / "data").mkdir(parents=True)
        previous_kn5 = self.installed / "test.kn5"
        previous_kn5.write_bytes(b"installed track")
        previous_route = self.installed / "data/map2lap_route.txt"
        previous_route.write_bytes(b"installed route")

        with (mock.patch.object(generator.farview, "build", return_value=None),
              mock.patch.object(generator, "where", return_value=("", "")),
              mock.patch.object(generator.settings, "load", return_value={"debug_app": False}),
              mock.patch.object(generator.make_track_folder, "make", return_value=str(self.installed))):
            with self.assertRaisesRegex(RuntimeError, "No place for start/finish"):
                generator._finish("test", "Test", self.work, anchor, np.asarray(anchor["route"]), COORDS, [], (0, 0, 0),
                                  0, lambda msg: None, lambda *progress: None, False, None)
        self.assertTrue(previous_kn5.exists(), "Placement refusal removed the installed KN5")
        self.assertEqual(previous_kn5.read_bytes(), b"installed track")
        self.assertEqual(previous_route.read_bytes(), b"installed route")

    def post_build(self, path, body):
        """Send a build POST to the handler and capture the worker arguments without starting it."""
        request = json.dumps(body).encode()
        handler = object.__new__(server.Handler)
        handler.command, handler.path = "POST", path
        handler.headers = {"Content-Length": str(len(request))}
        handler.rfile, handler.wfile = io.BytesIO(request), io.BytesIO()
        handler.send_response, handler.send_header, handler.end_headers = mock.Mock(), mock.Mock(), mock.Mock()
        with (mock.patch.object(server.settings, "ac_path", return_value=str(self.root)),
              mock.patch.object(server.settings, "is_ac", return_value=True),
              mock.patch.object(server.settings, "load", return_value={"clean": False, "cores": 100, "cache_gb": 0}),
              mock.patch.object(server.csp, "busy", return_value=False),
              mock.patch.object(server.trackcopy, "busy", return_value=False),
              mock.patch.dict(server.job, state="idle", log=[]),
              mock.patch.dict(server.running, clearing=False),
              mock.patch.dict(server.updater.state, state="idle"),
              mock.patch.object(server.threading, "Thread") as thread):
            handler.do_POST()
        self.assertEqual(handler.send_response.call_args.args[0], 200, handler.wfile.getvalue())
        return thread.call_args.kwargs["args"][0]

    def test_build_passes_circuit(self):
        args = self.post_build("/api/build", {"name": "test", "points": PINS, "kind": "circuit"})
        self.assertIn("--circuit", args[:args.index("--")])

    def test_rebuild_passes_circuit(self):
        (self.installed / "data").mkdir(parents=True)
        mytracks.save(self.installed, {"title": "Test", "points": PINS, "width": 120, "kind": "circuit"})
        args = self.post_build("/api/rebuild", {"name": "test"})
        self.assertIn("--circuit", args[:args.index("--")])

    def test_listing_keeps_circuit_distinct_from_route(self):
        for name, extra in (("route", {"track_version": "old"}), ("test", {"kind": "circuit"}),
                            ("area", {"area": [46.6, 14.6, 46.7, 14.7]})):
            folder = self.installed.with_name(name)
            (folder / "data").mkdir(parents=True)
            (folder / f"{name}.kn5").write_bytes(b"kn5")
            mytracks.save(folder, {"title": name, "points": PINS, "width": 120, **extra})
        with mock.patch.object(mytracks.version, "outdated", side_effect=lambda ver: ver == "old"):
            tracks = {track["name"]: track for track in mytracks.listing(self.root)}
        self.assertEqual(tracks["route"]["kind"], "route")
        self.assertEqual(tracks["area"]["kind"], "area")
        self.assertEqual(tracks["test"]["kind"], "circuit")
        self.assertTrue(tracks["route"]["outdated"])

    def test_listing_recovers_circuit_kind_and_timing_from_work(self):
        anchor = {"kind": "circuit", "route": [[0., 0.], [0., 100.], [50., 50.], [0., 0.]], "lat": 46.65, "lon": 14.62,
                  "tiles": [[0, 0]], "points": PINS, "width": 120, "length_m": 242.0,
                  "timing": {"start_m": 0.0, **SAVED_TIMING}}
        self.anchor.parent.mkdir(parents=True)
        self.anchor.write_text(json.dumps(anchor), encoding="utf-8")
        (self.installed / "data").mkdir(parents=True)
        (self.installed / "ui").mkdir()
        (self.installed / "ui/ui_track.json").write_text('{"author":"Map2Lap"}', encoding="utf-8")
        with mock.patch.object(mytracks, "ROOT", str(self.root)):
            tracks = mytracks.listing(self.root)
        self.assertEqual(tracks[0]["kind"], "circuit")
        self.assertEqual(tracks[0]["timing"], SAVED_TIMING)
        self.assertEqual(tracks[0]["route_end"], len(anchor["route"]) - 1)

    def test_from_debug_passes_saved_line_and_circuit_timing(self):
        info = {"title": "Test", "points": PINS, "width": 120, "kind": "circuit", "timing": SAVED_TIMING,
                "route_end": 3}
        (self.root / "map2lap.json").write_text(json.dumps(info), encoding="utf-8")
        (self.root / "map2lap_route.txt").write_text("anchor 46.65 14.62\n0 0\n0 -100\n50 -50\n0 0\n", encoding="utf-8")
        with (mock.patch.object(sys, "argv", ["from_debug.py", str(self.root), "--upto", "obj"]),
              mock.patch.object(from_debug, "differences", return_value=[]),
              mock.patch.object(generator, "build", return_value={"work": str(self.work)}) as build,
              redirect_stdout(io.StringIO())):
            from_debug.main()
        kwargs = build.call_args.kwargs
        self.assertEqual(kwargs["kind"], "circuit")
        self.assertEqual(kwargs["circuit_timing"], SAVED_TIMING)
        coords, end = kwargs["line"]
        self.assertEqual(coords[0], coords[-1])
        self.assertEqual(end, 3)

    def test_measure_preserves_test_track_kind(self):
        entry = {"title": "Test", "points": PINS, "width": 120, "kind": "circuit"}
        with (mock.patch.dict(os.environ), mock.patch.object(measure, "HERE", str(self.root)),
              mock.patch.object(generator.parallel, "SHARE", 1.0), mock.patch.object(generator, "build") as build):
            measure.build_one({"test": entry}, "test", False, 0.5)
        self.assertEqual(build.call_args.kwargs["kind"], "circuit")
        self.assertEqual(trackcode.decode(measure.code(entry))["kind"], "circuit")


if __name__ == "__main__":
    unittest.main()
