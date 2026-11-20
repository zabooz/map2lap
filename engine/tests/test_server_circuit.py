"""The generator page's route preview for Circuit and Route."""

import io
import json
from pathlib import Path
import sys
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import circuitlap
import server


class RoutePreviewTest(unittest.TestCase):
    points = [[1, 2], [3, 4]]

    def post_route(self, **fields):
        """Send JSON to the real POST handler and read its response without opening a socket."""
        request = json.dumps({"points": self.points, **fields}).encode("utf-8")
        handler = object.__new__(server.Handler)
        handler.command, handler.path = "POST", "/api/route"
        handler.headers = {"Content-Length": str(len(request))}
        handler.rfile, handler.wfile = io.BytesIO(request), io.BytesIO()
        handler.send_response, handler.send_header, handler.end_headers = mock.Mock(), mock.Mock(), mock.Mock()
        handler.do_POST()
        handler.send_response.assert_called_once()
        return handler.send_response.call_args.args[0], json.loads(handler.wfile.getvalue())

    def test_route_endpoint_answers_lap(self):
        lap = circuitlap.Lap([(1, 2), (3, 4), (1, 2)], 2000.0, [], [0.0, 1000.0])
        with mock.patch.object(server.generator, "circuit_route", return_value=lap, create=True) as circuit, \
             mock.patch.object(server.generator, "route", side_effect=AssertionError("Circuit used Route")):
            status, answer = self.post_route(kind="circuit")
        self.assertEqual((status, answer), (200, {"coords": [[1, 2], [3, 4], [1, 2]], "length_m": 2000.0}))
        circuit.assert_called_once_with([(1, 2), (3, 4)])

    def test_route_endpoint_answers_lap_refusal(self):
        message = "At pin 3 the car would have to turn around: put it on the through road"
        with mock.patch.object(server.generator, "circuit_route", side_effect=circuitlap.NoLap(message), create=True), \
             mock.patch.object(server.generator, "route", side_effect=AssertionError("Circuit used Route")):
            status, answer = self.post_route(kind="circuit")
        self.assertEqual((status, answer), (400, {"error": message}))

    def test_route_endpoint_without_kind_uses_route(self):
        with mock.patch.object(server.generator, "route", return_value=([(1, 2), (3, 4)], 1000.0)) as route, \
             mock.patch.object(server.generator, "circuit_route", side_effect=AssertionError("Route used Circuit"), create=True):
            status, answer = self.post_route()
        self.assertEqual((status, answer), (200, {"coords": self.points, "length_m": 1000.0}))
        route.assert_called_once_with([(1, 2), (3, 4)])


if __name__ == "__main__":
    unittest.main()
