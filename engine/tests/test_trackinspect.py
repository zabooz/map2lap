"""Selection details are read on demand, leaving the loading index small."""
import io
import json
from pathlib import Path
import threading
import unittest
from http.server import ThreadingHTTPServer
from unittest import mock

from PIL import Image

import test_trackview
import server
from app import trackedits, trackview


class InspectorTest(unittest.TestCase):
    def setUp(self):
        test_trackview.TrackViewTest.setUp(self)

    def test_track_size_is_measured_and_draft_estimate_is_read_only(self):
        from app import trackinspect
        current = Path(self.path).stat().st_size
        result = trackinspect.statistics(self.ac, self.name)
        self.assertEqual(current, result['current_bytes'])
        self.assertEqual(current, result['draft_bytes'])
        draft = trackedits.load(self.ac, self.name)
        with (mock.patch.object(trackedits, 'load', return_value={**draft, 'heights': [[0, 0, 1]]}),
              mock.patch.object(trackedits, 'changes', return_value=1)):
            estimate = trackinspect.statistics(self.ac, self.name)
        self.assertEqual(current, estimate['current_bytes'])
        self.assertGreaterEqual(estimate['draft_bytes'], current)
        self.assertTrue(estimate['estimated'])
        self.assertEqual(draft, trackedits.load(self.ac, self.name))
        with (mock.patch.object(trackedits, 'load', return_value={**draft,'paints':['already saved']}),
              mock.patch.object(trackedits,'changes',return_value=0)):
            saved=trackinspect.statistics(self.ac,self.name)
        self.assertFalse(saved['estimated'])
        self.assertEqual(current,saved['draft_bytes'])

    def test_only_the_requested_object_with_hidden_parts_and_original_parameters(self):
        from app import trackinspect
        path, scan, revision = trackview._scanned(self.ac, self.name)
        listed = {"t_0_0": {"kinds": ["house", "door"], "sorts": ["house", "door"],
                             "parents": [-1, 0], "at": [[1, 2, 3], [2, 2, 3]],
                             "faces": [[[0, 0, 1], [1, 0, 1]], [[2, 0, 1]]],
                             "details": [{"asset": "generated-building", "parameters": {"floors": 2}}, {}]}}
        with mock.patch.object(trackedits, "context", return_value=(path, scan, listed)):
            result = trackinspect.object_info(self.ac, self.name, "t_0_0#0", revision)
        self.assertEqual("house", result["kind"])
        self.assertEqual(["t_0_0#1"], result["children"])
        self.assertEqual({"floors": 2}, result["details"]["parameters"])
        self.assertEqual(2, result["triangles"])
        self.assertEqual([True, False], [m["visible"] for m in result["meshes"]])

    def test_unknown_or_outdated_ids_are_refused_without_reading_a_whole_list_for_the_page(self):
        from app import trackinspect
        revision = trackview.index(self.ac, self.name)["revision"]
        with self.assertRaises(trackview.Unreadable):
            trackinspect.object_info(self.ac, self.name, "t_0_0#0", "old")
        for bad in ("t_0_0#-1", "t_0_0#99", "../file", "x#0"):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                trackinspect.object_info(self.ac, self.name, bad, revision)

    def test_thumbnail_is_small_png_from_the_exact_source_texture(self):
        from app import trackinspect
        raw = io.BytesIO()
        Image.new("RGB", (1024, 512), (10, 180, 20)).save(raw, "PNG")
        revision = trackview.index(self.ac, self.name)["revision"]
        with mock.patch.object(trackview, "texture_bytes", return_value=("grass.png", raw.getvalue())):
            png = trackinspect.thumbnail(self.ac, self.name, 0, revision)
        with Image.open(io.BytesIO(png)) as image:
            self.assertEqual("PNG", image.format)
            self.assertEqual((256, 128), image.size)
            self.assertEqual((10, 180, 20), image.convert("RGB").getpixel((20, 20)))


class InspectorRequestsTest(unittest.TestCase):
    get = test_trackview.EditorRequestsTest.get

    def setUp(self):
        test_trackview.TrackViewTest.setUp(self)
        srv = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        self.addCleanup(srv.server_close)
        self.addCleanup(srv.shutdown)
        self.url = f"http://127.0.0.1:{srv.server_address[1]}/api/editor/{self.name}"
        patch = mock.patch.object(server.settings, "ac_path", return_value=self.ac)
        patch.start()
        self.addCleanup(patch.stop)

    def test_one_object_is_available_over_http_but_details_stay_out_of_the_index(self):
        from track import objectlist
        objectlist.write(self.path, {"t_0_0": {"kinds": ["car"], "at": [[1, 0, 0]], "parents": [-1],
                                              "faces": [[[0, 0, 1]]], "details": [{"asset": "test-car"}]}})
        code, raw = self.get("/index")
        index = json.loads(raw)
        self.assertEqual(200, code)
        self.assertNotIn("details", index["objects"]["t_0_0"])
        code, raw = self.get(f"/inspect?id=t_0_0%230&r={index['revision']}")
        self.assertEqual(200, code)
        self.assertEqual("test-car", json.loads(raw)["details"]["asset"])
        self.assertEqual(400, self.get(f"/inspect?id=t_0_0%2399&r={index['revision']}")[0])
        self.assertEqual(409, self.get("/inspect?id=t_0_0%230&r=old")[0])

    def test_invalid_thumbnail_numbers_and_missing_revisions_are_refused(self):
        revision = trackview.index(self.ac, self.name)["revision"]
        raw = io.BytesIO()
        Image.new("RGB", (4, 4), "green").save(raw, "PNG")
        with mock.patch.object(trackview, "texture_bytes", return_value=("valid.png", raw.getvalue())):
            self.assertEqual(400, self.get(f"/thumbnail?texture=-1&r={revision}")[0])
        self.assertEqual(400, self.get("/thumbnail?texture=0")[0])
        self.assertEqual(409, self.get("/thumbnail?texture=0&r=old")[0])


if __name__ == "__main__":
    unittest.main()
