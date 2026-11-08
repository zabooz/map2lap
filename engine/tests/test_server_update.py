"""App updates and Editor saves cannot interrupt each other, in either request order."""
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src")))
import server  # noqa: E402
from app import trackcopy, updater  # noqa: E402


class UpdateSaveTest(unittest.TestCase):
    def setUp(self):
        for obj, name, value in ((updater, "state", {"state": "idle"}),
                                 (server, "job", {"state": "idle"}), (server, "running", {"clearing": False})):
            patch = mock.patch.object(obj, name, value)
            patch.start()
            self.addCleanup(patch.stop)

    def test_update_refuses_active_save_before_requesting_a_release(self):
        with mock.patch.object(updater, "possible", return_value=True), \
             mock.patch.object(server.csp, "busy", return_value=False), \
             mock.patch.object(server.version, "latest") as latest, trackcopy.alone():
            code, body = server.install_update()
        self.assertEqual(409, code)
        self.assertIn("saved", body["error"])
        latest.assert_not_called()
        self.assertEqual("idle", updater.state["state"])

    def test_save_refuses_downloading_and_restarting_update_without_writing(self):
        handler = object.__new__(server.Handler)
        handler._own_page = lambda: True
        handler._body = lambda: {}
        handler._send = mock.Mock()
        with mock.patch.object(server.settings, "ac_path", return_value="unused"), \
             mock.patch.object(trackcopy, "_save", return_value={}) as write:
            for state in ("downloading", "restarting"):
                with self.subTest(state=state):
                    updater.state["state"] = state
                    handler._save_track("one")
                    self.assertEqual(409, handler._send.call_args.args[0])
                    self.assertIn("update", handler._send.call_args.args[1]["error"])
                    self.assertFalse(trackcopy.busy())
            write.assert_not_called()


if __name__ == "__main__":
    unittest.main()
