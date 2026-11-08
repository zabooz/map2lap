"""The Editor's changes on a built track: kept for one state of its kn5, written whole, only into the track's own folder."""
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import server  # noqa: E402
from app import mytracks, trackedits, trackview  # noqa: E402
from track import kn5  # noqa: E402

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)
TREES = 3


def billboard_mesh(name, count):
    """count billboards of 8 triangles over 8 vertices each."""
    v = np.zeros(count * 8, kn5.VERTEX)
    faces = np.array([0, 1, 2, 0, 2, 3, 0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 4, 6, 5, 4, 7, 6], "<u2")
    indices = np.concatenate([faces + 8 * k for k in range(count)]).astype("<u2")
    return kn5.Node(2, name, 1, vertices=v, indices=indices, material=0, lod_out=100.0, bs_center=(0.0, 0.0, 0.0), bs_radius=1.0)


def write_track(ac, name, trees=TREES):
    root = os.path.join(ac, "content", "tracks", name)
    os.makedirs(os.path.join(root, "data"), exist_ok=True)
    with open(os.path.join(root, mytracks.FILE), "w", encoding="utf-8") as f:
        json.dump({}, f)
    materials = [kn5.Material("trees", "ksPerPixelAT", 0, 1, 0, [], [])]
    tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
    tree.children = [billboard_mesh("nocol_trees_0_0", trees), billboard_mesh("nocol_trees_0_0_1", 1),
                     billboard_mesh("nocol_bush_0_0", 1)]
    kn5.write(os.path.join(root, name + ".kn5"), [], materials, tree)


def item(k=0, mesh="nocol_trees_0_0"):
    return {"id": f"{mesh}#{k}", "position": [1.5, 2.5, float(k)]}


class Base(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.ac, self.name = tmp.name, "t"
        write_track(self.ac, self.name)
        patch = mock.patch.object(mytracks, "ROOT", self.ac)
        patch.start()
        self.addCleanup(patch.stop)
        self.file = trackedits.path_of(self.name)

    def load(self):
        return trackedits.load(self.ac, self.name)

    def test_smoothing_can_recompute_from_before_its_own_height_change(self):
        first, other = {"id": "smooth"}, {"id": "brush"}
        placed, moved = [], object()
        with mock.patch.object(trackedits, "_heights_and_moved", return_value=([other, first], placed, moved)), \
             mock.patch.object(trackedits, "context", return_value=("source", {}, {})), \
             mock.patch.object(trackedits.trackplace, "changed", return_value="baseline") as changed:
            self.assertIs(moved, trackedits.moved_without(self.ac, self.name, "base", None))
            self.assertEqual("baseline", trackedits.moved_without(self.ac, self.name, "base", "smooth"))
            self.assertEqual([other], changed.call_args.args[3])
            with self.assertRaises(ValueError):
                trackedits.moved_without(self.ac, self.name, "base", "undone")

    def save(self, deleted, **changed):
        now = self.load()
        return trackedits.save(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "deleted": deleted, "id": "x", **changed})

    def rebuild(self):
        path = os.path.join(self.ac, "content", "tracks", self.name, self.name + ".kn5")
        write_track(self.ac, self.name, trees=TREES + 1)
        os.utime(path, ns=(1, 1))       # (another state of the file, whatever the clock says)


class ListTest(Base):
    def test_a_track_without_changes(self):
        now = self.load()
        self.assertEqual((0, [], 0), (now["revision"], now["deleted"], now["outdated"]))
        self.assertFalse(os.path.exists(self.file))

    def test_a_saved_list_comes_back_with_its_kinds(self):
        self.assertEqual(1, self.save([item(0), item(0, "nocol_bush_0_0")]))
        now = self.load()
        self.assertEqual(1, now["revision"])
        self.assertEqual(["tree", "bush"], [d["kind"] for d in now["deleted"]])
        self.assertEqual([1.5, 2.5, 0.0], now["deleted"][0]["position"])

    def test_billboards_count_on_over_a_mesh_s_parts(self):
        self.save([item(TREES)])        # (the part nocol_trees_0_0_1 holds the last one)
        with self.assertRaises(trackedits.Invalid):
            self.save([item(TREES + 1)])

    def test_a_list_made_from_an_older_one_is_refused(self):
        old = self.load()
        self.save([item(0)])
        with self.assertRaises(trackedits.Conflict):
            trackedits.save(self.ac, self.name, {"base": old["base"], "revision": old["revision"], "deleted": [], "id": "y"})
        self.assertEqual(1, len(self.load()["deleted"]))

    def test_a_list_for_another_build_is_refused(self):
        old = self.load()
        self.rebuild()
        with self.assertRaises(trackedits.Conflict):
            trackedits.save(self.ac, self.name, {"base": old["base"], "revision": old["revision"], "deleted": [], "id": "y"})

    def test_a_list_for_a_build_with_fewer_objects_is_a_conflict_not_a_fault(self):
        old = self.load()
        path = os.path.join(self.ac, "content", "tracks", self.name, self.name + ".kn5")
        write_track(self.ac, self.name, trees=1)
        os.utime(path, ns=(1, 1))
        with self.assertRaises(trackedits.Conflict):
            trackedits.save(self.ac, self.name, {"base": old["base"], "revision": 0, "deleted": [item(TREES - 1)], "id": "y"})

    def test_a_save_whose_answer_was_lost_can_be_followed(self):
        old = self.load()
        trackedits.save(self.ac, self.name, {"base": old["base"], "revision": 0, "deleted": [item(0)], "id": "lost"})
        with self.assertRaises(trackedits.Conflict):
            trackedits.save(self.ac, self.name, {"base": old["base"], "revision": 0, "deleted": [item(1)], "id": "next"})
        new = trackedits.save(self.ac, self.name, {"base": old["base"], "revision": 0, "deleted": [item(0), item(1)], "id": "next",
                                                   "unanswered": ["lost"]})
        self.assertEqual(2, new)
        self.assertEqual(2, len(self.load()["deleted"]))

    def test_another_tab_s_save_is_no_lost_answer(self):
        old = self.load()
        trackedits.save(self.ac, self.name, {"base": old["base"], "revision": 0, "deleted": [item(0)], "id": "theirs"})
        with self.assertRaises(trackedits.Conflict):
            trackedits.save(self.ac, self.name, {"base": old["base"], "revision": 0, "deleted": [], "id": "mine", "unanswered": ["other"]})

    def test_a_whole_sort_is_saved_as_a_rule(self):
        self.save([item(0)], sorts=["olive", "birch"])
        now = self.load()
        self.assertEqual(["olive", "birch"], now["sorts"])
        self.assertEqual(1, len(now["deleted"]))

    def test_a_sort_not_in_the_atlas_or_twice_is_refused(self):
        for bad in (["no_such_tree"], ["olive", "olive"], "olive", [5]):
            with self.assertRaises(trackedits.Invalid):
                self.save([], sorts=bad)

    def test_built_again_a_sort_counts_as_older_too(self):
        self.save([], sorts=["olive"])
        self.rebuild()
        now = self.load()
        self.assertEqual(([], 1), (now["sorts"], now["outdated"]))

    def test_built_again_the_list_stays_but_is_not_applied(self):
        self.save([item(0), item(1)])
        self.rebuild()
        now = self.load()
        self.assertEqual(([], 2), (now["deleted"], now["outdated"]))
        with self.assertRaises(trackedits.Conflict):        # (never mixed into new changes)
            self.save([item(0)])
        self.assertEqual(2, self.load()["outdated"])

    def test_an_outdated_list_goes_when_given_up(self):
        self.save([item(0)])
        self.rebuild()
        self.save([])
        now = self.load()
        self.assertEqual(([], 0), (now["deleted"], now["outdated"]))
        self.save([item(0)])
        self.assertEqual(1, len(self.load()["deleted"]))

    def test_a_broken_file_is_said_and_not_overwritten_by_new_changes(self):
        os.makedirs(os.path.dirname(self.file), exist_ok=True)
        with open(self.file, "w", encoding="utf-8") as f:
            f.write("{ not json")
        self.assertEqual(1, self.load()["outdated"])
        with self.assertRaises(trackedits.Conflict):
            self.save([item(0)])
        with open(self.file, encoding="utf-8") as f:
            self.assertEqual("{ not json", f.read())
        self.save([])
        self.assertEqual(0, self.load()["outdated"])

    def test_a_file_of_the_wrong_shape_is_said_like_a_broken_one(self):
        os.makedirs(os.path.dirname(self.file), exist_ok=True)
        base = {"schema": trackedits.SCHEMA, "base": "b", "revision": 1, "deleted": []}
        for bad in (["x"], {}, {**base, "sorts": 7}, {**base, "sorts": [7]}, {**base, "deleted": 5}, {**base, "deleted": ["x"]},
                    {**base, "deleted": [{"id": 5, "position": []}]}, {**base, "revision": "1"}, {**base, "revision": True},
                    {**base, "base": 5}, {k: v for k, v in base.items() if k != "base"}):
            with open(self.file, "w", encoding="utf-8") as f:
                json.dump(bad, f)
            self.assertEqual(1, self.load()["outdated"], bad)
            self.assertEqual(1, trackedits.changes(self.ac, self.name), bad)

    def test_saving_breaks_nothing_when_writing_fails_halfway(self):
        self.save([item(0)])
        with mock.patch.object(trackedits.json, "dump", side_effect=OSError("disk full")):
            with self.assertRaises(OSError):
                self.save([item(1)])
        self.assertEqual([item(0)["id"]], [d["id"] for d in self.load()["deleted"]])
        self.assertEqual([os.path.basename(self.file)],
                         os.listdir(os.path.dirname(self.file)))

    def test_two_saves_at_once_cannot_both_win(self):
        now = self.load()
        body = {"base": now["base"], "revision": now["revision"], "deleted": [], "id": "y"}
        results = []

        def one():
            try:
                results.append(trackedits.save(self.ac, self.name, body))
            except trackedits.Conflict:
                results.append("conflict")
        threads = [threading.Thread(target=one) for _ in range(8)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        self.assertEqual([1] + ["conflict"] * 7, sorted(results, key=str))


class RefusedTest(Base):
    def refused(self, deleted):
        with self.assertRaises(trackedits.Invalid):
            self.save(deleted)

    def test_what_is_no_object(self):
        for bad in ("x", {}, {"id": 5, "position": [0, 0, 0]}, {"id": "nocol_trees_0_0", "position": [0, 0, 0]},
                    {"id": "../../x#0", "position": [0, 0, 0]}, {"id": "nocol_trees_0_0#99", "position": [0, 0, 0]},
                    {"id": "1ROAD_ground_0_0#0", "position": [0, 0, 0]}):
            self.refused([bad])

    def test_what_is_no_position(self):
        for bad in (None, [0, 0], [0, 0, "1"], [0, 0, float("nan")], [0, 0, float("inf")], [0, 0, True]):
            self.refused([{"id": item()["id"], "position": bad}])

    def test_the_same_object_twice_and_no_list(self):
        self.refused([item(0), item(0)])
        self.refused("nocol_trees_0_0#0")
        with self.assertRaises(trackedits.Invalid):
            trackedits.save(self.ac, self.name, ["x"])

    def test_names_are_taken_as_they_are(self):
        for name in ("..", "T", "a/b", "a\\b", "a.b", "", "t "):
            with self.assertRaises(trackview.NotOurs):
                trackedits.load(self.ac, name)

    def test_only_map2lap_tracks(self):
        os.makedirs(os.path.join(self.ac, "content", "tracks", "other", "data"))
        with self.assertRaises(trackview.NotOurs):
            trackedits.load(self.ac, "other")

    def test_a_track_s_folder_stays_untouched(self):
        root = os.path.join(self.ac, "content", "tracks", self.name)
        before = sorted(os.path.relpath(os.path.join(d, f), root) for d, _, fs in os.walk(root) for f in fs)
        self.save([item(0)])
        self.assertEqual(before, sorted(os.path.relpath(os.path.join(d, f), root) for d, _, fs in os.walk(root) for f in fs))
        self.assertTrue(os.path.exists(self.file))

    def test_cleared_and_counted(self):
        self.assertEqual(0, trackedits.changes(self.ac, self.name))
        self.save([item(0)], sorts=["olive"])
        self.assertEqual(2, trackedits.changes(self.ac, self.name))
        trackedits.clear(self.name)
        self.assertEqual(0, trackedits.changes(self.ac, self.name))
        trackedits.clear(self.name)
        self.assertEqual(0, trackedits.changes(self.ac, "../x"))


class RequestsTest(Base):
    def setUp(self):
        super().setUp()
        srv = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        self.addCleanup(srv.server_close)
        self.addCleanup(srv.shutdown)
        self.port = srv.server_address[1]
        patch = mock.patch.object(server.settings, "ac_path", return_value=self.ac)
        patch.start()
        self.addCleanup(patch.stop)

    def request(self, method, path, body=None, headers=None):
        c = HTTPConnection("127.0.0.1", self.port)
        self.addCleanup(c.close)
        c.request(method, path, body=body, headers=headers if headers is not None else {"Content-Type": "application/json"})
        r = c.getresponse()
        return r.status, r.read()

    def put(self, body, name="t", headers=None):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        return self.request("PUT", f"/api/editor/{name}/edits", data, headers)

    def test_read_and_saved(self):
        code, body = self.request("GET", "/api/editor/t/edits")
        self.assertEqual(200, code)
        now = json.loads(body)
        code, body = self.put({"base": now["base"], "revision": 0, "deleted": [item(1)], "id": "y"})
        self.assertEqual((200, 1), (code, json.loads(body)["revision"]))
        self.assertEqual(1, len(json.loads(self.request("GET", "/api/editor/t/edits")[1])["deleted"]))

    def test_a_conflict_answers_409(self):
        now = self.load()
        self.assertEqual(409, self.put({"base": now["base"], "revision": 7, "deleted": [], "id": "y"})[0])

    def test_bad_lists_answer_400_and_no_track_404(self):
        now = self.load()
        self.assertEqual(400, self.put({"base": now["base"], "revision": 0, "deleted": [{"id": "x"}], "id": "y"})[0])
        self.assertEqual(400, self.put(b"{ not json")[0])
        self.assertEqual(404, self.put({}, name="missing")[0])
        self.assertEqual(404, self.put({}, name="T")[0])
        self.assertEqual(404, self.request("PUT", "/api/editor/t/index", b"{}")[0])
        self.assertEqual(404, self.request("PUT", "/api/anything", b"{}")[0])

    def test_a_deleted_track_leaves_no_draft(self):
        self.save([item(0)])
        self.assertTrue(os.path.exists(self.file))
        self.assertEqual(200, server.delete_track(self.name)[0])
        self.assertFalse(os.path.exists(self.file))

    def test_a_length_that_is_none(self):
        for bad in ("abc", "-1"):
            self.assertEqual(400, self.request("PUT", "/api/editor/t/edits", b"{}", {"Content-Type": "application/json", "Content-Length": bad})[0])

    def test_too_much_is_not_even_read(self):
        code, _ = self.request("PUT", "/api/editor/t/edits", b"x", {"Content-Type": "application/json",
                                                                    "Content-Length": str(trackedits.MAX_BYTES + 1)})
        self.assertEqual(413, code)

    def test_only_the_page_itself_can_write(self):
        now = self.load()
        body = {"base": now["base"], "revision": 0, "deleted": [], "id": "y"}
        self.assertEqual(403, self.put(body, headers={"Content-Type": "text/plain"})[0])       # (a form elsewhere can send this)
        self.assertEqual(403, self.put(body, headers={"Content-Type": "application/json", "Host": "evil.example"})[0])
        self.assertNotEqual(200, self.request("OPTIONS", "/api/editor/t/edits")[0])     # (no other site gets a yes to PUT)
        self.assertEqual(0, self.load()["revision"])


if __name__ == "__main__":
    unittest.main()
