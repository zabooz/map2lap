"""The generator page's "Delete" of the build files: only out/tracks goes, and never during a build."""
import os
import sys
import tempfile
import unittest
from unittest import mock

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import server  # noqa: E402


class BuildFilesTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = tmp.name
        for rel, size in ((("out", "tracks", "a", "obj", "t.obj"), 100), (("out", "tracks", "b.json"), 20),
                          (("out", "compare", "x.json"), 7), (("cache", "m.bin"), 5), (("settings.json",), 3)):
            p = os.path.join(self.root, *rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, "wb") as f:
                f.write(b"x" * size)
        for patch in (mock.patch.object(server, "ROOT", self.root), mock.patch.dict(server.job, state="idle")):
            patch.start()
            self.addCleanup(patch.stop)

    def test_the_size_counts_out_tracks_alone(self):
        self.assertEqual(server.build_files_bytes(), 120)

    def test_delete_takes_out_tracks_and_nothing_else(self):
        self.assertEqual(server.clear_build_files(), (200, {"bytes": 0}))
        self.assertFalse(os.path.exists(os.path.join(self.root, "out", "tracks")))
        for rel in (("out", "compare", "x.json"), ("cache", "m.bin"), ("settings.json",)):
            self.assertTrue(os.path.exists(os.path.join(self.root, *rel)), rel)
        self.assertFalse(server.running["clearing"])

    def test_not_during_a_build(self):
        for state in ("running", "stopping"):
            server.job["state"] = state
            self.assertEqual(server.clear_build_files()[0], 409)
        self.assertEqual(server.build_files_bytes(), 120)

    def test_no_build_files_is_no_error(self):
        self.assertEqual(server.clear_build_files()[0], 200)
        self.assertEqual(server.clear_build_files(), (200, {"bytes": 0}))
        self.assertEqual(server.build_files_bytes(), 0)


class FailedBuildTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = tmp.name
        self.half = os.path.join(self.root, "ac", "content", "tracks", "t")
        self.work = os.path.join(self.root, "out", "tracks", "t")
        for folder in (self.half, self.work):
            os.makedirs(folder)
        failing = mock.Mock(stdout=[], pid=1, wait=mock.Mock(return_value=1))
        for patch in (mock.patch.object(server, "ROOT", self.root), mock.patch.dict(server.job, state="running", log=[]),
                      mock.patch.object(server, "MARK", os.path.join(self.root, "out", "mark.json")),
                      mock.patch.object(server.settings, "ac_path", return_value=os.path.join(self.root, "ac")),
                      mock.patch.object(server.subprocess, "Popen", return_value=failing)):
            patch.start()
            self.addCleanup(patch.stop)

    def test_its_half_track_goes_and_its_work_folder_unless_kept(self):
        server.run_build([], "t", False, 0.0)
        self.assertEqual("error", server.job["state"])
        self.assertFalse(os.path.exists(self.half))
        self.assertTrue(os.path.exists(self.work))      # (Keep build files on)
        os.makedirs(self.half)
        server.run_build([], "t", True, 0.0)
        self.assertFalse(os.path.exists(self.half))
        self.assertFalse(os.path.exists(self.work))

    def test_a_whole_track_of_a_build_before_stays(self):
        with open(os.path.join(self.half, "t.kn5"), "wb"):
            pass
        os.utime(os.path.join(self.half, "t.kn5"), (1000.0, 1000.0))
        server.run_build([], "t", True, 2000.0)
        self.assertTrue(os.path.exists(os.path.join(self.half, "t.kn5")))


if __name__ == "__main__":
    unittest.main()
