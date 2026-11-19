"""The road tools stacked on one stretch: Bend, Smooth, Bank, Bend and Smooth again, each on what the ones before left (as the
Editor's draft hands them, trackedits.moved_without), stay one stepless road and keep the banking."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app import builtroad, roadbank, roadbend, roadnet, roadregion, trackheights
from test_roadregion import lattice_track, road

# Along a lane no 2 m step may rise more than 10 %: the gentle hills here and the bends' ramps stay below it, a step a
# tool left at another's edge goes over it.
STEEPEST = 0.10
BANKING = 0.06


class StackedToolsTest(unittest.TestCase):
    def setUp(self):
        # A 300 m road over gentle hills (0.4 m, 75 m apart), wide enough for every tool's transitions.
        self.path, self.scan = lattice_track(self, [road("r", [[0, 0], [300, 0]], 8)],
                                             lambda x, z: 100 + 0.4 * np.sin(x / 12), (-20, 322), (-40, 42))
        self.whole = roadregion.mapped(self.path, [[5, 0], [295, 0]])
        self.stretch = roadregion.mapped(self.path, [[40, 0], [260, 0]])
        self.ops = []

    def moved(self, ops):
        return trackheights.moved(self.path, self.scan, {}, ops) if ops else None

    def lane(self, z):
        """The road's height every 2 m along the lane z metres beside its middle, as the draft's operations leave it."""
        xs = np.arange(10, 291, 2.0)
        return builtroad.heights(self.path, self.scan, self.moved(self.ops), self.whole, np.c_[xs, np.full_like(xs, z)])[0]

    def at_150(self):
        """(the middle's height, the rise from the right lane to the left one) at x 150, inside every operation."""
        middle, left, right = (self.lane(z)[70] for z in (0, 3, -3))
        return float(middle), float(left - right)

    def bend(self, points, delta, id_):
        self.ops.append(roadbend.change_of(self.path, self.scan, self.moved(self.ops), points, delta, id_))

    def smooth(self, strength, id_):
        bankings = self.moved([op for op in self.ops if "bank" in op])
        op, _ = roadnet.change_of(self.path, self.scan, self.moved(self.ops), self.stretch,
                                  roadregion.selection(self.path, self.stretch), 6, strength, id_, slant=bankings)
        self.ops.append(op)

    def bank(self, points, id_):
        self.ops.append(roadbank.change_of(self.path, self.scan, self.moved(self.ops), points, BANKING, 1, roadbank.EDGE_RAMP,
                                           id_, None, self.ops))

    def assert_stepless(self, after):
        for z in (-3, 0, 3):
            with self.subTest(after=after, lane=z):
                self.assertLess(float(np.abs(np.diff(self.lane(z))).max()), STEEPEST * trackheights.STEP)

    def test_each_tool_works_on_what_the_others_left(self):
        steps = [
            ("bend up", lambda: self.bend([[60, 0], [240, 0]], 2.0, "bend1")),
            ("smooth half", lambda: self.smooth(0.5, "smooth1")),
            ("bank", lambda: self.bank([[110, 0], [190, 0]], "bank1")),
            ("bend down", lambda: self.bend([[80, 0], [220, 0]], -1.0, "bend2")),
            ("smooth fully", lambda: self.smooth(1, "smooth2")),
        ]
        for name, step in steps:
            before, _ = self.at_150()
            step()
            self.assertIsNone(trackheights.problem(self.ops[-1]), name)
            self.assert_stepless(name)
            middle, across = self.at_150()
            if name == "bend down":
                self.assertAlmostEqual(before - 1.0, middle, delta=0.05)     # (Bend lowers what Smooth left, by its own metre)
            if name in ("bank", "bend down", "smooth fully"):
                with self.subTest(after=name):
                    self.assertAlmostEqual(BANKING * 6, abs(across), delta=0.02)  # (6 % across 6 m: the banking stays)

    def test_a_second_banking_on_the_same_stretch_is_refused(self):
        self.bank([[110, 0], [190, 0]], "bank1")
        with self.assertRaisesRegex(ValueError, "There is banking here already"):
            self.bank([[130, 0], [200, 0]], "bank2")


if __name__ == "__main__":
    unittest.main()
