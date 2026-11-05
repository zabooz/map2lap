"""buildtrace: what a build's processes did, written only when a build traces; the same plan the same hash wherever it came from."""
import io
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import buildtrace  # noqa: E402
import plancache  # noqa: E402
import revisit  # noqa: E402

KEY = (14, 4000, 6000)


class BuildTraceTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir, True)
        self.addCleanup(self.close)
        self.trace = os.path.join(self.dir, "trace")

    @staticmethod
    def close():
        with buildtrace._lock:
            for f in buildtrace._file.values():
                f.close()
            buildtrace._file.clear()

    def tracing(self):
        return mock.patch.dict(os.environ, {buildtrace.ENV: self.trace})

    def test_nothing_without_the_switch(self):
        with mock.patch.dict(os.environ):
            os.environ.pop(buildtrace.ENV, None)
            buildtrace.note("tile", "(1, 2)")
            buildtrace.plan("plan_made", KEY, io.BytesIO(b"x"))
        self.assertFalse(os.path.exists(self.trace))

    def test_tiles_in_each_workers_order(self):
        with self.tracing():
            for t in ("(1, 2)", "(3, 4)"):
                buildtrace.note("tile", t)
        s = buildtrace.summary(buildtrace.read(self.trace))
        self.assertEqual(s["tiles"], {str(os.getpid()): ["(1, 2)", "(3, 4)"]})

    def test_a_fault_says_who_called(self):
        before = revisit.faults()
        with self.tracing():
            revisit.fault()
        self.assertEqual(revisit.faults(), before + 1)
        who = list(buildtrace.summary(buildtrace.read(self.trace))["faults"])
        self.assertEqual(len(who), 1)
        self.assertIn("test_buildtrace.py", who[0])

    def test_a_plan_made_and_read_has_one_hash(self):
        with self.tracing():
            plancache.PlanCache(self.dir, "s").store(KEY, [], [], [], [])
            self.assertIsNotNone(plancache.PlanCache(self.dir, "s").load(KEY))
        plans = buildtrace.summary(buildtrace.read(self.trace))["plans"]
        self.assertEqual(list(plans), ["14/4000/6000"])
        self.assertEqual(list(plans["14/4000/6000"].values()), [{"plan_made": 1, "plan_read": 1}])

    def test_two_plans_of_a_cell_show(self):
        with self.tracing():
            buildtrace.plan("plan_made", KEY, io.BytesIO(b"a"))
            buildtrace.plan("plan_made", KEY, io.BytesIO(b"b"))
        self.assertEqual(len(buildtrace.summary(buildtrace.read(self.trace))["plans"]["14/4000/6000"]), 2)

    def test_no_trace_reads_as_empty(self):
        self.assertEqual(buildtrace.read(os.path.join(self.dir, "none")), [])


if __name__ == "__main__":
    unittest.main()
