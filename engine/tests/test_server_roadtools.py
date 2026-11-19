"""The Editor's Bank road requests: marking A and B reads the road's cross slope, applying makes one height change."""
import io
import json
import os
import sys
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "src"))

import server  # noqa: E402
import server_roadtools  # noqa: E402

NET = {"segments": [{"a": [0, 0], "b": [100, 0], "width": 8, "road": "mine", "structure": ""}]}
POINTS = [[0, 0, 0], [100, 0, 0]]


class BankRouteTest(unittest.TestCase):
    def ask(self, path, body):
        """(status, answer) of a POST from the page itself, with the track, its draft and the road query stood in."""
        handler = object.__new__(server.Handler)
        data = json.dumps(body).encode()
        handler.path, handler.command, handler.close_connection = path, "POST", False
        handler.headers = {"Host": "127.0.0.1:8800", "Content-Type": "application/json", "Content-Length": str(len(data))}
        handler.rfile = io.BytesIO(data)
        sent = []
        handler._send = lambda code, answer, *a, **k: sent.append((code, answer))
        handler.do_POST()
        return sent[0]

    def setUp(self):
        r = server_roadtools
        self.stored = {"id": "old", "bank": {"points": POINTS, "target": 0.06, "road_ids": ["mine"]}}
        for target, name, value in [
                (r.settings, "ac_path", mock.Mock(return_value="ac")),
                (r.trackview, "_scan_of", mock.Mock(return_value=("t.kn5", {"meshes": []}))),
                (r.trackedits, "load", mock.Mock(return_value={"revision": 3, "heights": [self.stored], "surfaces": []})),
                (r.trackedits, "moved_without", mock.Mock(return_value=None)),
                (r.trackedits, "remember_meshes", mock.Mock()),
                (r.tracksurfaces, "going", mock.Mock(return_value=None)),
                (r.roadregion, "selection", mock.Mock(return_value={"tiles": []})),
                (r.roadbank, "describe", mock.Mock(return_value=(NET, np.array([[0., 0.], [100., 0.]])))),
                (r.roadbank, "current", mock.Mock(return_value=np.array([[0., 0.01], [50., 0.03], [100., 0.02]]))),
                (r.roadbank, "blockers", mock.Mock(return_value=[])),
                (r.roadbank, "change_of", mock.Mock(return_value={"id": "new", "bank": {"ramp": 48.0}}))]:
            patcher = mock.patch.object(target, name, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_bank_way_reports_the_current_slope_and_a_stored_target(self):
        code, answer = self.ask("/api/editor/alpha/bank/way", {"base": "b", "revision": 3, "points": POINTS})
        self.assertEqual(200, code)
        self.assertEqual(["old"], answer["replace"])
        self.assertAlmostEqual(0.06, answer["target"])
        self.assertEqual({"min": 0.01, "mean": 0.02, "max": 0.03}, {k: round(v, 6) for k, v in answer["current"].items()})
        self.assertEqual(100.0, answer["length"])
        self.assertEqual([], answer["blockers"])

    def test_bank_applies_and_remembers_its_meshes(self):
        code, answer = self.ask("/api/editor/alpha/bank", {"base": "b", "revision": 3, "points": POINTS, "target": 0.04, "replace": ["old"]})
        self.assertEqual((200, {"height": {"id": "new", "bank": {"ramp": 48.0}}}), (code, answer))
        args = server_roadtools.roadbank.change_of.call_args[0]
        self.assertEqual((POINTS, 0.04), args[3:5])
        server_roadtools.trackedits.moved_without.assert_called_with("ac", "alpha", "b", ["old"])
        server_roadtools.trackedits.remember_meshes.assert_called_once()

    def test_bank_with_a_stale_revision_is_refused(self):
        code, answer = self.ask("/api/editor/alpha/bank", {"base": "b", "revision": 2, "points": POINTS, "target": 0.04, "replace": []})
        self.assertEqual(409, code)
        self.assertIn("mark A and B again", answer["error"])

    def test_a_refusal_says_why(self):
        server_roadtools.roadbank.change_of.side_effect = ValueError("A side road joins inside this bank")
        code, answer = self.ask("/api/editor/alpha/bank", {"base": "b", "revision": 3, "points": POINTS, "target": 0.04, "replace": []})
        self.assertEqual((409, {"error": "A side road joins inside this bank"}), (code, answer))


if __name__ == "__main__":
    unittest.main()
