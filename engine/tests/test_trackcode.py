"""Track codes preserve the choice between Circuit, Route and Area."""

import base64
import json
from pathlib import Path
import sys
import unittest
import zlib

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import trackcode


POINTS = [[46.65, 14.62], [46.66, 14.63]]
AREA = [46.65, 14.62, 46.66, 14.63]
INFO = {"title": "Test", "points": POINTS, "width": 120.0}


def raw_code(payload):
    """An M2L1 code containing the given JSON payload. Pure."""
    compressed = zlib.compress(json.dumps(payload).encode())
    return trackcode.PREFIX + base64.urlsafe_b64encode(compressed).decode().rstrip("=")


class TrackCodeTest(unittest.TestCase):
    def test_circuit_code_round_trips(self):
        code = trackcode.encode({**INFO, "kind": "circuit"})
        self.assertTrue(code.startswith("M2L1-"))
        body = code.removeprefix("M2L1-")
        payload = json.loads(zlib.decompress(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4))))
        self.assertEqual(payload["k"], "circuit")
        decoded = trackcode.decode(code)
        self.assertEqual(decoded["kind"], "circuit")
        self.assertEqual(decoded["points"], POINTS)

    def test_route_code_without_k_is_a_route(self):
        code = raw_code({"p": POINTS, "w": 120})
        self.assertEqual(trackcode.decode(code)["kind"], "route")
        self.assertEqual(trackcode.encode(INFO), trackcode.encode({**INFO, "kind": "route"}))

    def test_unknown_k_is_refused(self):
        for kind in ("route", "area", None):
            with self.subTest(kind=kind), self.assertRaises(trackcode.BadCode):
                trackcode.decode(raw_code({"p": POINTS, "w": 120, "k": kind}))

    def test_k_is_refused_on_area_codes(self):
        with self.assertRaises(trackcode.BadCode):
            trackcode.decode(raw_code({"a": AREA, "k": "circuit"}))
        self.assertEqual(trackcode.decode(raw_code({"a": AREA}))["area"], AREA)


if __name__ == "__main__":
    unittest.main()
