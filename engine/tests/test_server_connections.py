"""The server's connections: the Editor asks for a long track's parts by the ten thousand."""
import json
import os
import socket
import socketserver
import sys
import threading
import unittest
from unittest import mock
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

    def test_rejected_model_upload_closes_before_an_unread_body_can_be_parsed_as_another_request(self):
        for length, saturated, status in ((server.modeldata.MAX_BYTES + 1, False, 413), (3, True, 429)):
            with self.subTest(status=status), mock.patch.object(server.MATERIAL_UPLOADS, "acquire", return_value=not saturated):
                with socket.create_connection(self.srv.server_address, timeout=5) as connection:
                    body = b"GET /api/status HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n"
                    headers = (f"POST /api/library/model-imports?filename=tree.glb HTTP/1.1\r\nHost: 127.0.0.1\r\n"
                               f"Content-Type: application/x-map2lap-glb\r\nContent-Length: {length}\r\n\r\n").encode()
                    connection.sendall(headers + body); connection.shutdown(socket.SHUT_WR)
                    received = bytearray()
                    try:
                        while chunk := connection.recv(65536): received.extend(chunk)
                    except ConnectionResetError:
                        pass  # A server closing with unread bytes can reset after sending its response.
                self.assertTrue(received.startswith(f"HTTP/1.1 {status}".encode()), received)
                self.assertEqual(1, received.count(b"HTTP/1.1 "), "The rejected upload body must not become a second GET")


if __name__ == "__main__":
    unittest.main()
