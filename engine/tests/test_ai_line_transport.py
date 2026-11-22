"""The Editor sends the installed AI line as revisioned little-endian columns."""
import struct
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import mytracks, settings
from server_editor import EditorHandlers
from track import fastlane


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
        self.assertEqual({"status", "message", "closed", "revision", "count"}, status.keys())
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
