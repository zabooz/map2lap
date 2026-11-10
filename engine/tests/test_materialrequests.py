"""The browser's material imports are bounded and kept inside the chosen app folder."""
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))
import server
from test_materiallibrary import image_bytes


class RequestsTest(unittest.TestCase):
    def setUp(self):
        from app import materiallibrary
        self.library = materiallibrary
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        patch = mock.patch.object(materiallibrary, "ROOT", self.tmp.name)
        patch.start()
        self.addCleanup(patch.stop)
        srv = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        self.addCleanup(srv.server_close)
        self.addCleanup(srv.shutdown)
        self.url = f"http://127.0.0.1:{srv.server_address[1]}"

    def request(self, path, data=None, content_type="application/json", headers=None):
        req = urllib.request.Request(self.url + path, data=data, headers={"Content-Type": content_type, **(headers or {})})
        try:
            with urllib.request.urlopen(req) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as response:
            return response.code, response.read()

    def test_prepare_import_preview_and_browse_over_http(self):
        code, raw = self.request("/api/library/imports?filename=grass.png", image_bytes(), "application/x-map2lap-image")
        self.assertEqual(200, code)
        prepared = json.loads(raw)
        code, raw = self.request(f"/api/library/imports/{prepared['token']}/preview")
        self.assertEqual(200, code)
        self.assertTrue(raw.startswith(b"\x89PNG"))
        code, raw = self.request("/api/library/materials", json.dumps({"token": prepared["token"], "filename": "grass.png",
                                 "name": "Meadow", "category": "grass", "repeat": [2, 2]}).encode())
        self.assertEqual(200, code)
        id = json.loads(raw)["material"]["id"]
        code, raw = self.request("/api/library/materials?q=meadow&category=grass")
        self.assertEqual(1, json.loads(raw)["total"])
        self.assertEqual(id, json.loads(raw)["items"][0]["id"])
        self.assertEqual(200, self.request(f"/api/library/materials/{id}/preview")[0])
        self.assertEqual(403, self.request(f"/api/library/materials/{id}/delete", b"{}", "text/plain")[0])
        code, raw = self.request(f"/api/library/materials/{id}/delete", b"{}")
        self.assertEqual(200, code)
        self.assertTrue(json.loads(raw)["deleted"])
        self.assertEqual(0, self.library.listing()["total"])

    def test_a_library_model_is_deleted_over_http_by_the_page_only(self):
        from app import objectlibrary
        from test_modeldata import encode, fixture
        patch = mock.patch.object(objectlibrary, "ROOT", self.tmp.name)
        patch.start()
        self.addCleanup(patch.stop)
        prepared = objectlibrary.prepare("tree.glb", encode(*fixture()))
        id = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree", "category": "tree"})["model"]["id"]
        self.assertEqual(403, self.request(f"/api/library/models/{id}/delete", b"{}", "text/plain")[0])
        code, raw = self.request(f"/api/library/models/{id}/delete", b"{}")
        self.assertEqual(200, code)
        self.assertTrue(json.loads(raw)["deleted"])
        self.assertEqual(0, objectlibrary.listing()["total"])

    def test_cross_site_simple_uploads_and_oversized_requests_are_refused(self):
        path = "/api/library/imports?filename=grass.png"
        self.assertEqual(403, self.request(path, b"invalid", "text/plain")[0])
        self.assertEqual(413, self.request(path, b"invalid", "application/x-map2lap-image",
                                         {"Content-Length": str(self.library.MAX_BYTES + 1)})[0])
        self.assertEqual(400, self.request(path, b"invalid", "application/x-map2lap-image")[0])
        self.assertEqual(400, self.request("/api/library/imports?filename=..%2Fgrass.png", image_bytes(), "application/x-map2lap-image")[0])
        self.assertEqual(0, self.library.listing()["total"])

    def test_material_import_retains_role_bound_normal_and_roughness_uploads(self):
        uploads = {}
        for role, raw in (("colour", image_bytes()), ("normal", image_bytes(colour=(128, 128, 255))),
                          ("roughness", image_bytes(mode="L", colour=90))):
            code, response = self.request(f"/api/library/imports?filename={role}.png&role={role}", raw, "application/x-map2lap-image")
            self.assertEqual(200, code)
            data = json.loads(response)
            self.assertEqual(role, data["role"])
            uploads[role] = {"token": data["token"], "filename": role + ".png"}
        code, raw = self.request("/api/library/materials", json.dumps({**uploads["colour"], "name": "Ground", "category": "soil", "repeat": [2, 2],
                                 "maps": {role: uploads[role] for role in ("normal", "roughness")}}).encode())
        self.assertEqual(200, code)
        self.assertEqual({"colour", "normal", "roughness"}, set(json.loads(raw)["material"]["maps"]))
        code, _raw = self.request("/api/library/imports?filename=map.png&role=unknown", image_bytes(), "application/x-map2lap-image")
        self.assertEqual(400, code)


if __name__ == "__main__":
    unittest.main()
