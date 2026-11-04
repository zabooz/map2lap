"""pois.py: an area's answer kept on disk for every process and build."""
import os
import sys
import tempfile
import unittest
import unittest.mock
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pois  # noqa: E402

ROWS = [(14.1234567890123, 46.1, 14.2, 46.2, "church", None), (1e-07, -0.1, 0.30000000000000004, 2.0, None, "Café Ö")]
BOUNDS = (14.0, 46.0, 14.5, 46.5)


class AnswersTest(unittest.TestCase):
    def setUp(self):
        d = tempfile.TemporaryDirectory()
        self.addCleanup(d.cleanup)
        self.dir = d.name

    def process(self, rows=ROWS, version="v1"):
        """A new process's Pois, its reads counted (.asked), answering rows."""
        p = pois.Pois(self.dir, None)
        remote = SimpleNamespace(cache_dir=os.path.join(self.dir, version))
        p.tags = SimpleNamespace(version=lambda kind: (version, remote))
        p.asked = 0

        def read(_remote, _bounds, _what, _kind):
            p.asked += 1
            if isinstance(rows, Exception):
                raise rows
            return list(rows)
        p._read = read
        return p

    def path(self, version="v1", what="castles"):
        remote = SimpleNamespace(cache_dir=os.path.join(self.dir, version))
        return pois.answer_path(remote, (what,) + tuple(round(float(v), 7) for v in BOUNDS))

    def test_the_next_process_reads_the_answer_as_the_first_got_it(self):
        first, second = self.process(), self.process()
        want = first.boxes(BOUNDS, "castles")
        got = second.boxes(BOUNDS, "castles")
        self.assertEqual(want, ROWS)
        self.assertEqual(got, ROWS, "floats to the last bit, None and text as they were, rows as tuples")
        self.assertTrue(all(isinstance(r, tuple) for r in got))
        self.assertEqual((first.asked, second.asked), (1, 0))

    def test_no_rows_is_an_answer_too(self):
        self.process(rows=[]).boxes(BOUNDS, "castles")
        second = self.process(rows=ROWS)
        self.assertEqual(second.boxes(BOUNDS, "castles"), [])
        self.assertEqual(second.asked, 0)

    def test_another_question_another_area_another_version_ask_again(self):
        self.process().boxes(BOUNDS, "castles")
        for other, args in ((self.process(), (BOUNDS, "churches")), (self.process(), ((14.0, 46.0, 14.5, 46.6), "castles")),
                            (self.process(version="v2"), (BOUNDS, "castles"))):
            other.boxes(*args)
            self.assertEqual(other.asked, 1, args)

    def test_a_changed_query_asks_again(self):
        self.process().boxes(BOUNDS, "castles")
        with unittest.mock.patch.object(pois, "CODE", "other"):
            again = self.process()
            again.boxes(BOUNDS, "castles")
        self.assertEqual(again.asked, 1)

    def test_a_failed_read_leaves_nothing_behind(self):
        with self.assertRaises(IOError):
            self.process(rows=IOError("no net")).boxes(BOUNDS, "castles")
        self.assertFalse(os.path.exists(self.path()))
        then = self.process()
        self.assertEqual(then.boxes(BOUNDS, "castles"), ROWS)
        self.assertEqual(then.asked, 1)

    def test_an_answer_that_cant_be_read_is_asked_again_and_replaced(self):
        for broken in ("[[1, 2", "[1, 2]", "{}x"):
            os.makedirs(os.path.dirname(self.path()), exist_ok=True)
            with open(self.path(), "w", encoding="utf-8") as f:
                f.write(broken)
            p = self.process()
            self.assertEqual(p.boxes(BOUNDS, "castles"), ROWS, broken)
            self.assertEqual(p.asked, 1, broken)
            self.assertEqual(pois.load_answer(self.path()), ROWS)

    def test_a_full_disk_costs_only_the_next_process_another_read(self):
        with unittest.mock.patch.object(pois.os, "replace", side_effect=OSError("full")):
            self.assertEqual(self.process().boxes(BOUNDS, "castles"), ROWS)
        self.assertEqual(os.listdir(os.path.dirname(self.path())), [], "no half file left")


if __name__ == "__main__":
    unittest.main()
