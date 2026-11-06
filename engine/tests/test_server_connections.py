"""The server's connections: the Editor asks for a long track's parts by the ten thousand."""
import json
import os
import socketserver
import sys
import threading
import unittest
from http.client import HTTPConnection

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "src"))

import server  # noqa: E402


class ConnectionsTest(unittest.TestCase):
    def setUp(self):
        self.srv = server.Server(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.addCleanup(self.srv.server_close)
        self.addCleanup(self.srv.shutdown)
        self.connection = HTTPConnection("127.0.0.1", self.srv.server_address[1], timeout=10)
        self.addCleanup(self.connection.close)

    def ask(self, method="GET", path="/api/status", body=None):
        self.connection.request(method, path, body=body)
        answer = self.connection.getresponse()
        return answer, answer.read()

    def test_a_burst_finds_room_in_the_queue(self):
        self.assertGreater(self.srv.request_queue_size, socketserver.TCPServer.request_queue_size)

    def test_gets_share_one_connection(self):
        self.assertEqual(200, self.ask()[0].status)
        sock = self.connection.sock
        self.assertIsNotNone(sock)
        answer, body = self.ask()
        self.assertEqual(200, answer.status)
        self.assertIn("state", json.loads(body))
        self.assertIs(sock, self.connection.sock)

    def test_a_request_with_a_body_ends_its_connection_so_an_unread_body_can_t_start_the_next(self):
        answer, _ = self.ask("POST", "/api/no_such_thing", body=b'{"a": 1}')
        self.assertEqual("close", answer.getheader("Connection"))
        self.assertEqual(200, self.ask()[0].status)


if __name__ == "__main__":
    unittest.main()
