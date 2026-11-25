"""Feedback identity, history and uploads through the generator page's HTTP handlers."""
import base64
from email import policy
from email.parser import BytesParser
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import server
from app import settings, trackcode, version


class FeedbackTest(unittest.TestCase):
    def setUp(self):
        folder = self.enterContext(tempfile.TemporaryDirectory())
        self.enterContext(mock.patch.object(settings, "FILE", os.path.join(folder, "settings.json")))
        self.enterContext(mock.patch.dict(os.environ, MAP2LAP_FEEDBACK_URL="http://localhost:3100"))
        self.remote = self.enterContext(mock.patch("urllib.request.urlopen"))
        self.enterContext(mock.patch.object(server.csp, "inspect", return_value={"version": "0.2.11"}))

    def request(self, path="/api/feedback", body=None, host="localhost", content_type="application/json"):
        handler = object.__new__(server.Handler)
        data = json.dumps(body).encode()
        handler.path, handler.command = path, "GET" if body is None else "POST"
        handler.headers = {"Host": host, "Content-Type": content_type, "Content-Length": str(len(data))}
        handler.rfile, handler.wfile = io.BytesIO(data), io.BytesIO()
        handler.send_response, handler.send_header, handler.end_headers = mock.Mock(), mock.Mock(), mock.Mock()
        getattr(handler, "do_" + handler.command)()
        return handler.send_response.call_args.args[0], json.loads(handler.wfile.getvalue())

    def remote_answer(self, answer):
        self.remote.return_value.__enter__.return_value = io.BytesIO(json.dumps(answer).encode())

    def test_first_report_is_multipart_with_installation_identity_and_track_metadata(self):
        self.assertEqual(self.request(), (200, {"reports": [], "seen": {}}))
        self.remote.assert_not_called()
        code = trackcode.encode({"area": [1, 2, 3, 4], "track_version": "0.4.0"})
        self.remote_answer({"id": 8})
        self.assertEqual(self.request(body={"kind": "idea", "message": "  More trees  ", "track_code": code,
                                           "images": [base64.b64encode(b"image bytes").decode()]}), (201, {"id": 8}))
        req = self.remote.call_args.args[0]
        key = settings.load()["feedback_key"]
        self.assertRegex(key, r"^[A-Za-z0-9_-]{43}$")
        self.assertEqual((req.full_url, dict(req.header_items())["Authorization"], req.get_header("User-agent")),
                         ("http://localhost:3100/api/feedback", "Bearer " + key, version.USER_AGENT))
        parts = BytesParser(policy=policy.default).parsebytes(
            b"Content-Type: " + req.get_header("Content-type").encode() + b"\r\n\r\n" + req.data)
        fields = {part.get_param("name", header="content-disposition"): part.get_payload(decode=True).decode()
                  for part in parts.iter_parts()}
        self.assertEqual(fields, {"kind": "idea", "message": "More trees", "track_code": code, "track_version": "0.4.0",
                                  "version": version.VERSION, "os": "windows" if os.name == "nt" else "linux",
                                  "csp": "0.2.11", "screenshot": "image bytes"})
        settings.save({"clean": True})
        self.assertNotIn(key, str(self.request("/api/settings")))
        self.remote_answer({"reports": []})
        self.request()
        self.assertEqual(dict(self.remote.call_args.args[0].header_items())["Authorization"], "Bearer " + key)

    def test_invalid_code_and_foreign_submissions_never_reach_service(self):
        self.assertEqual(self.request(body={"kind": "bug", "message": "x", "track_code": "broken"})[1]["field"], "track_code")
        for path in ("/api/feedback", "/api/feedback/7/messages", "/api/feedback/7/seen"):
            for headers in ({"host": "other.test"}, {"content_type": "text/plain"}):
                self.assertEqual(self.request(path, {}, **headers)[0], 403)
        self.assertEqual(self.request(body={"kind": "bug", "message": "x", "images": ["eA=="] * 6})[0], 400)
        self.remote.assert_not_called()

    def test_seen_is_monotonic_for_each_ticket_and_survives_settings_save(self):
        for ticket, entry in [(3, 19), (4, 20), (3, 11)]:
            self.assertEqual(self.request(f"/api/feedback/{ticket}/seen", {"entry": entry})[0], 200)
        settings.save({"cores": 25})
        self.assertEqual(settings.load()["feedback_seen"], {"3": 19, "4": 20})
        self.remote.assert_not_called()

    def test_opening_inbox_recovers_first_ticket_if_submission_response_was_lost(self):
        self.remote.side_effect = TimeoutError()
        self.assertEqual(self.request(body={"kind": "bug", "message": "Hello"})[0], 503)
        self.remote.side_effect = None
        self.remote_answer({"reports": [{"id": 12, "messages": []}]})
        self.assertEqual(self.request("/api/feedback?open=1")[1]["reports"][0]["id"], 12)
        self.assertEqual(settings.load()["feedback_seen"], {"12": 0})

    def test_history_only_available_under_local_host(self):
        self.assertEqual(self.request(host="other.test")[0], 403)
        self.remote.assert_not_called()

    def test_rate_limit_keeps_identity_and_honours_retry_after(self):
        self.enterContext(mock.patch.dict(server.feedback._wait_until, clear=True))
        self.remote.side_effect = HTTPError("http://localhost", 429, "wait", {"Retry-After": "60"},
                                            io.BytesIO(b'{"error":"Too many reports"}'))
        body = {"kind": "bug", "message": "Hello"}
        self.assertEqual(self.request(body=body)[0], 429)
        self.assertEqual(self.request(body=body)[0], 429)
        self.assertEqual(self.request()[1]["reports"], [])
        self.remote.assert_called_once()


if __name__ == "__main__":
    unittest.main()
