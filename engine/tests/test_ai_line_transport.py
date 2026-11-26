"""The Editor sends the installed AI line as revisioned little-endian columns."""
from concurrent.futures import ThreadPoolExecutor
import struct
import sys
import tempfile
from threading import Event
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import ailanejobs, mytracks, settings
from server_editor import EditorHandlers
from track import fastlane, obj_to_kn5


class AiLineTransportTest(unittest.TestCase):
    def setUp(self):
        ac = self.enterContext(tempfile.TemporaryDirectory())
        self.directory = Path(ac, "content/tracks/lane")
        (self.directory / "data").mkdir(parents=True)
        (self.directory / "lane.kn5").touch()
        mytracks.save(self.directory, {"kind": "circuit"})
        self.path = self.directory / fastlane.FILE
        self.enterContext(mock.patch.object(settings, "ac_path", return_value=ac))
        self.handler = EditorHandlers()
        self.handler._send = mock.Mock()

    def request(self, *args):
        self.handler._ai_line("lane", *args)
        return self.handler._send.call_args

    def write(self):
        points = np.zeros(2, dtype=fastlane.POINT)
        points["pos"] = [[1.25, 2.25, 3.25], [1.5, 2.5, 3.5]]
        points["length"] = [4.25, 4.5]
        points["id"] = [16_777_217, -2]
        detail = np.zeros(2, dtype=fastlane.DETAIL)
        number = 6
        for field in ("speed", "gas", "brake", "lat_g", "radius", "left", "right", "camber", "direction", "normal", "length", "forward", "tag", "grade"):
            columns = detail[field].reshape(2, -1)
            for column in columns.T:
                column[:] = [number + .25, number + .5]
                number += 1
        fastlane._write_lane(self.path, points, detail)
        return points, detail

    def test_status_and_binary_round_trip(self):
        self.write()
        args, headers = self.request()
        code, status = args
        self.assertEqual(200, code)
        self.assertEqual({"status", "message", "closed", "revision", "count", "canCalculate", "validity", "hints"}, status.keys())
        self.assertEqual({"state": "stale", "unplaced": None, "rejected": {}}, status["hints"])
        self.assertTrue(status["canCalculate"])
        self.assertEqual("pending", status["validity"])
        self.assertEqual(("ready", True, 2), (status["status"], status["closed"], status["count"]))
        self.assertEqual("no-store", headers["headers"]["Cache-Control"])
        args, headers = self.request(status["revision"])
        code, raw, content_type = args
        self.assertEqual((200, "application/octet-stream", 2 * 92), (code, content_type, len(raw)))
        self.assertIn("immutable", headers["headers"]["Cache-Control"])
        values = struct.unpack("<8f2i36f", raw)
        columns = [(i + .25, i + .5) for i in range(1, 24)]
        columns[4] = (16_777_217, -2)
        self.assertEqual(tuple(value for col in columns for value in col), values)

    def test_status_and_margin_preview_wait_for_the_complete_saved_folder(self):
        import server
        self.write()
        model = self.directory / "lane.kn5"
        previous = self.directory.with_name("previous")
        def preview():
            handler = object.__new__(server.Handler)
            handler.path = "/api/editor/lane/ai-line/margins"
            handler._body = mock.Mock(return_value={"aiMargins": []})
            handler._own_page = mock.Mock(return_value=True)
            handler._send = mock.Mock()
            handler.do_POST()
            return handler._send.call_args
        with ThreadPoolExecutor(1) as pool:
            for request in (self.request, preview):
                with self.subTest(request=request.__name__):
                    entered = Event()
                    def ac_path():
                        entered.set()
                        return str(self.directory.parents[2])
                    with mock.patch.object(settings, "ac_path", side_effect=ac_path):
                        with ailanejobs.changing(model):
                            self.directory.rename(previous)
                            try:
                                reply = pool.submit(request)
                                self.assertTrue(entered.wait(5))
                                with self.assertRaises(TimeoutError):
                                    reply.result(timeout=.1)
                            finally:
                                previous.rename(self.directory)
                        self.assertEqual(200, reply.result(timeout=5).args[0])

    def test_stage_range_includes_interpolated_gate_speeds_and_excludes_runout(self):
        mytracks.save(self.directory, {"kind": "route"})
        points = np.zeros(6, dtype=fastlane.POINT)
        points["pos"][:, 2] = np.arange(6) * 10
        detail = np.zeros(6, dtype=fastlane.DETAIL)
        detail["speed"] = [0, 10, 20, 19, 35, 0]
        fastlane._write_lane(self.path, points, detail)
        for prefix in ("AC", "M2"):
            markers = {f"{prefix}_AB_{gate}_{side}": obj_to_kn5.empty("", (x, 0, z), (0, 0, 1)).matrix
                       for gate, z in (("START", 15), ("FINISH", 35))
                       for side, x in (("L", -3), ("R", 3))}
            with mock.patch("server_editor.trackview._scan", return_value={"points": markers}):
                self.assertEqual([15., 27.], self.request().args[1].get("speedRange"))

    def test_readable_stage_line_remains_visible_without_readable_timing_markers(self):
        mytracks.save(self.directory, {"kind": "route"})
        self.write()
        (_, status), _ = self.request()
        self.assertEqual("ready", status["status"])
        self.assertIsNone(status.get("speedRange"))

    def test_missing_and_invalid_file_return_status(self):
        for expected in ("missing", "invalid"):
            if expected == "invalid":
                self.path.parent.mkdir()
                self.path.write_bytes(b"invalid AI line")
            (code, body), _ = self.request()
            self.assertEqual((200, expected, None, None, 0),
                             (code, body["status"], body["closed"], body["revision"], body["count"]))
            self.assertTrue(body["message"])
        points, detail = self.write()
        detail["speed"][0] = np.nan
        fastlane._write_lane(self.path, points, detail)
        self.assertEqual("invalid", self.request().args[1]["status"])

    def test_binary_refuses_a_replaced_or_removed_file(self):
        points, detail = self.write()
        revision = self.request().args[1]["revision"]
        detail["speed"] = 17
        fastlane._write_lane(self.path, points, detail)
        for remove in (False, True):
            if remove:
                self.path.unlink()
            (code, body), _ = self.request(revision)
            self.assertEqual(409, code)
            self.assertIn("changed", body["error"])


if __name__ == "__main__":
    unittest.main()
