"""The Editor's Undo and Redo steps kept beside the draft, so a reload or a server restart keeps them (app/trackhistory.py)."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import mytracks, trackhistory


def entry(*heights, sorts=()):
    """An Undo step as the page sends it: its height changes by item key, its sorts as they are."""
    return {"heights": list(heights), "objectSorts": list(sorts)}


def delta(past, future=(), entries=None, items=None):
    return {"past": list(past), "future": list(future), "entries": entries or {}, "items": items or {}}


class MergeTest(unittest.TestCase):
    def test_new_steps_are_added_and_what_is_known_is_not_sent_again(self):
        stored, answer = trackhistory.merged(None, delta(["e1"], entries={"e1": entry("h1")}, items={"h1": {"id": "a", "mm": [1]}}))
        self.assertEqual({"past": 1, "future": 0, "missing": False}, answer)
        stored, answer = trackhistory.merged(stored, delta(["e1", "e2"], entries={"e2": entry("h1", "h2")}, items={"h2": {"id": "b"}}))
        self.assertEqual({"past": 2, "future": 0, "missing": False}, answer)
        page = trackhistory.page_form(stored)
        self.assertEqual(["e1", "e2"], page["past"])
        self.assertEqual({"h1": {"id": "a", "mm": [1]}, "h2": {"id": "b"}}, page["items"])

    def test_undo_moves_the_position_and_a_new_step_cuts_the_redo_branch(self):
        stored, _ = trackhistory.merged(None, delta(["e1", "e2"], entries={"e1": entry(), "e2": entry("h1")}, items={"h1": {"id": "a"}}))
        stored, _ = trackhistory.merged(stored, delta(["e1"], ["e3"], entries={"e3": entry("h1")}))      # (Undo: the step undone is redone by e3)
        self.assertEqual((["e1"], ["e3"]), (stored["past"], stored["future"]))
        stored, answer = trackhistory.merged(stored, delta(["e1", "e4"], entries={"e4": entry()}))
        self.assertEqual({"past": 2, "future": 0, "missing": False}, answer)
        self.assertNotIn("e3", stored["entries"])       # (what nothing reaches any more goes)
        self.assertNotIn("h1", trackhistory.page_form(stored)["items"])

    def test_the_same_content_under_two_keys_is_kept_once(self):
        big = {"id": "a", "mm": list(range(1000))}
        stored, _ = trackhistory.merged(None, delta(["e1", "e2"], entries={"e1": entry("h1"), "e2": entry("h2")}, items={"h1": big, "h2": big}))
        self.assertEqual(1, len(stored["blobs"]))

    def test_more_than_the_steps_kept_drops_the_oldest(self):
        keys = [f"e{k}" for k in range(trackhistory.MAX_STEPS + 5)]
        stored, answer = trackhistory.merged(None, delta(keys, entries={k: entry() for k in keys}))
        self.assertEqual(trackhistory.MAX_STEPS, answer["past"])
        self.assertEqual(keys[5:], stored["past"])

    def test_beyond_the_byte_limit_the_oldest_steps_go_but_the_newest_stays_however_large(self):
        with mock.patch.object(trackhistory, "MAX_BYTES", 5000):
            items = {f"h{k}": {"id": str(k), "mm": [k] * 1000} for k in range(3)}     # (each about 2 kB)
            entries = {f"e{k}": entry(f"h{k}") for k in range(3)}
            stored, answer = trackhistory.merged(None, delta(["e0", "e1", "e2"], entries=entries, items=items))
            self.assertEqual(["e1", "e2"], stored["past"])
            huge = {"id": "x", "mm": [9] * 3000}
            stored, answer = trackhistory.merged(stored, delta(["e1", "e2", "e3"], entries={"e3": entry("h3")}, items={"h3": huge}))
            self.assertEqual({"past": 1, "future": 0, "missing": False}, answer)
            self.assertEqual(["e3"], stored["past"])

    def test_the_farthest_redo_steps_go_before_the_last_undo_step(self):
        with mock.patch.object(trackhistory, "MAX_BYTES", 4500):
            items = {f"h{k}": {"id": str(k), "mm": [k] * 1000} for k in range(3)}
            entries = {f"e{k}": entry(f"h{k}") for k in range(3)}
            stored, answer = trackhistory.merged(None, delta(["e0"], ["e2", "e1"], entries=entries, items=items))
            self.assertEqual({"past": 1, "future": 1, "missing": False}, answer)
            self.assertEqual(["e1"], stored["future"])

    def test_a_step_the_server_does_not_know_keeps_only_what_lies_after_it_and_says_so(self):
        stored, _ = trackhistory.merged(None, delta(["e1"], entries={"e1": entry()}))
        stored, answer = trackhistory.merged(stored, delta(["e0", "e1", "e2"], ["f0", "f1"],
                                                          entries={"e2": entry(), "f0": entry(), "f1": entry("gone")}))
        self.assertEqual({"past": 2, "future": 0, "missing": True}, answer)
        self.assertEqual((["e1", "e2"], []), (stored["past"], stored["future"]))

    def test_a_malformed_change_is_named(self):
        self.assertIsNone(trackhistory.problem(delta(["e1"], entries={"e1": entry("h1")}, items={"h1": {}})))
        for wrong in ([], {"past": "e1"}, delta([1]), delta(["e1"], entries={"e1": {"heights": "h1"}}), delta(["x" * 200]),
                      delta(["e1"], entries={"e1": []})):
            with self.subTest(wrong=wrong):
                self.assertIsNotNone(trackhistory.problem(wrong))


class FileTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        patch = mock.patch.object(mytracks, "ROOT", tmp.name)
        patch.start()
        self.addCleanup(patch.stop)
        self.stored, _ = trackhistory.merged(None, delta(["e1"], entries={"e1": entry()}))

    def test_it_is_read_back_only_for_the_draft_and_build_it_was_written_with(self):
        trackhistory.write("t", self.stored, "b1", 4)
        self.assertEqual(["e1"], trackhistory.read("t", "b1", 4)["past"])
        self.assertIsNone(trackhistory.read("t", "b1", 5))          # (a draft written after it without it, or cut off in between)
        self.assertIsNone(trackhistory.read("t", "b2", 4))          # (built again)

    def test_it_lies_beside_the_draft_and_goes_with_it(self):
        trackhistory.write("t", self.stored, "b1", 4)
        self.assertTrue(os.path.exists(Path(mytracks.ROOT, "out", "edits", "t.history.json")))
        trackhistory.remove("t")
        self.assertIsNone(trackhistory.read("t", "b1", 4))
        trackhistory.remove("t")                                    # (none: nothing to do)

    def test_a_broken_file_is_no_history(self):
        path = trackhistory.path_of("t")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        Path(path).write_text("{", encoding="utf-8")
        self.assertIsNone(trackhistory.read("t", "b1", 4))
        Path(path).write_text(json.dumps({"schema": 1, "base": "b1", "revision": 4, "past": "x"}), encoding="utf-8")
        self.assertIsNone(trackhistory.read("t", "b1", 4))


if __name__ == "__main__":
    unittest.main()
