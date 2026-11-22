"""The version-7 AI line follows the final KN5, including its grid and lap seam."""
from pathlib import Path
import json
import sys
import tempfile
import unittest
from zipfile import ZipFile

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator  # noqa: F401 (sets the engine's import path)
from track import editorinfo, fastlane, kn5, obj_to_kn5


class AILineTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.model = self.folder / "test.kn5"
        (self.folder / "data").mkdir()
        self.lane = self.folder / "ai/fast_lane.ai"

    def write_track(self, route, *, circuit=False, road_start=-10, road_end=120, prefix="AC", height=9,
                    strips=None, grid=None):
        forward = (1, 0, 0)
        root = obj_to_kn5.empty("root", (0, 0, 0), (0, 0, 1))
        grid = grid or [(x, 10, forward) for x in (17, 9, 1)]
        for i, (x, z, direction) in enumerate(grid):
            root.children.append(obj_to_kn5.empty(f"AC_START_{i}", (x, height + .15, z), direction))
        gates = (("AC_TIME_0", 20),) if circuit else ((f"{prefix}_AB_START", 20), (f"{prefix}_AB_FINISH", 80))
        for gate, x in gates:
            for side, z in (("L", 5), ("R", 15)):
                root.children.append(obj_to_kn5.empty(f"{gate}_{side}", (x, height + .15, z), forward))
        strips = strips or [(road_start, road_end, 0, 55)]
        for i, (start, end, low, high) in enumerate(strips):
            vertices = np.zeros(4, dtype=kn5.VERTEX)
            for y in (height, height + 8):
                vertices["pos"] = [(start, y, low), (end, y, low), (end, y, high), (start, y, high)]
                root.children.append(kn5.Node(2, f"1ROAD_{i}_{y}", 1, vertices=vertices.copy(), bs_center=(0, 0, 0),
                                             indices=np.array([0, 1, 2, 0, 2, 3], dtype=np.uint16)))
        kn5.write(self.model, [], [], root)
        (self.folder / "data/map2lap_route.txt").write_text(
            "anchor 0 0\n" + "".join(f"{x} {z}\n" for x, z in route))

    def generate(self, circuit=False):
        log = []
        fastlane.regenerate(self.model, circuit=circuit, log=log.append)
        return log

    def test_open_route_begins_behind_the_last_grid_slot_and_passes_the_finish(self):
        self.write_track([(20, 10), (80, 10)], prefix="M2")
        log = self.generate()
        points, detail, tail = fastlane.read_lane(self.lane)
        xyz = points["pos"]
        self.assertLess(xyz[0, 0], 1)
        self.assertGreater(xyz[-1, 0], 80)
        np.testing.assert_allclose(xyz[:, 1], xyz[0, 1])
        self.assertLess(xyz[0, 1], 10, "stay on the grid's lower level along the whole road")
        np.testing.assert_array_equal(points["id"], np.arange(len(points)))
        np.testing.assert_allclose(np.diff(points["length"]), np.linalg.norm(np.diff(xyz, axis=0), axis=1), atol=1e-5)
        np.testing.assert_allclose(detail["length"][[0, -1]], 0)
        np.testing.assert_allclose(detail["left"], 10)   # up × forward points towards decreasing Z here
        np.testing.assert_allclose(detail["right"], 45)
        self.assertEqual(b"", tail)
        self.assertRegex(log[-1], r"AI line: \d+ points in")

    def test_circuit_starts_at_the_kn5_gate_and_closes_without_a_duplicate_point(self):
        self.write_track([(8, 10), (55, 10), (55, 45), (8, 45), (8, 10)], circuit=True)
        self.generate(circuit=True)
        points, detail, _ = fastlane.read_lane(self.lane)
        xyz = points["pos"]
        np.testing.assert_allclose(xyz[0, [0, 2]], [20, 10], atol=1e-5)
        closing = np.linalg.norm(xyz[0] - xyz[-1])
        self.assertGreater(closing, 1.0)
        self.assertLessEqual(closing, 1.51)
        self.assertAlmostEqual(detail["length"][0], closing, places=5)
        np.testing.assert_allclose(detail["forward"][0], [1, 0, 0])
        self.assertGreater(detail["speed"][0], 0)

    def test_rebuild_reads_changed_kn5_and_discards_a_line_if_the_new_road_ends_early(self):
        self.write_track([(20, 10), (80, 10)])
        self.generate()
        self.write_track([(20, 10), (80, 10)], height=13)
        self.generate()
        points, _, _ = fastlane.read_lane(self.lane)
        self.assertAlmostEqual(points["pos"][25, 1] - points["pos"][0, 1], 0)
        self.assertGreater(points["pos"][0, 1], 12.9)
        self.write_track([(20, 10), (80, 10)], road_end=40)
        log = self.generate()
        self.assertFalse(self.lane.exists())
        self.assertRegex(log[-1], r"AI line skipped: .*at route metre \d+")

    def test_corner_is_rounded_with_room_for_both_sides_of_the_car(self):
        strips = [(-10, 60, 5, 15), (50, 60, 5, 50), (3, 60, 40, 50), (3, 13, 5, 50)]
        self.write_track([(8, 10), (55, 10), (55, 45), (8, 45), (8, 10)], circuit=True, strips=strips)
        self.generate(circuit=True)
        points, detail, _ = fastlane.read_lane(self.lane)
        xz = points["pos"][:, [0, 2]]
        delta = np.roll(xz, -1, axis=0) - xz
        angle = np.unwrap(np.arctan2(delta[:, 1], delta[:, 0]))
        self.assertLess(np.max(np.abs(np.diff(angle))), np.deg2rad(35))
        side = detail["forward"][:, [2, 0]] * [1, -1]
        for x, z in np.vstack((xz + side, xz - side)):
            self.assertTrue(any(a <= x <= b and lo <= z <= hi for a, b, lo, hi in strips), (x, z))

    def test_side_street_does_not_widen_the_main_road(self):
        self.write_track([(20, 10), (80, 10)], strips=[(-10, 120, 5, 15), (45, 55, 15, 315)])
        self.generate()
        points, detail, _ = fastlane.read_lane(self.lane)
        across_junction = np.abs(points["pos"][:, 0] - 50) < 4
        np.testing.assert_allclose(detail["right"][across_junction], 5, atol=0.1)
        np.testing.assert_allclose(detail["left"], 5, atol=0.1)

    def test_mapped_road_excludes_the_extra_collision_strip(self):
        self.write_track([(20, 10), (80, 10)])
        tile = self.folder / "tile.zip"
        features = [{"spec": {"width": 8}, "geometry": [[[-10, 9], [50, 9], [120, 9]]]},
                    {"spec": {"width": 6}, "geometry": [[[50, 9], [50, 55]]]}]
        with ZipFile(tile, "w") as archive:
            archive.writestr("tile.json", json.dumps({"features": features}))
        editorinfo._publish(self.model, [("0_0", tile)])
        self.generate()
        _, detail, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(detail["left"], 5, atol=0.1)
        np.testing.assert_allclose(detail["right"], 3, atol=0.1)

    def test_route_starts_at_rear_slot_if_its_run_in_has_no_road(self):
        self.write_track([(20, 10), (80, 10)], road_start=0)
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(points["pos"][0, [0, 2]], [1, 10])

    def test_route_preserves_grid_on_the_approach_around_a_bend(self):
        self.write_track([(20, 10), (80, 10)], grid=[(17, 10, (1, 0, 0)), (15, 16, (0, 0, -1)),
                                                     (15, 24, (0, 0, -1))])
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        xz = points["pos"][:, [0, 2]]
        np.testing.assert_allclose(xz[0], [15, 29])
        self.assertLess(np.linalg.norm(xz - [15, 16], axis=1).min(), 0.76)
        self.assertLess(np.linalg.norm(xz - [15, 10], axis=1).min(), 0.76)

    def test_route_grid_can_approach_pin_one_perpendicularly(self):
        self.write_track([(20, 10), (80, 10)], grid=[(20, 13, (0, 0, -1)), (20, 21, (0, 0, -1)),
                                                     (20, 29, (0, 0, -1))])
        log = self.generate()
        self.assertTrue(self.lane.exists(), log)
        points, _, _ = fastlane.read_lane(self.lane)
        np.testing.assert_allclose(points["pos"][0, [0, 2]], [20, 34])

    def test_radius_and_speed_of_a_100_m_arc_with_15_m_chords(self):
        angle = np.linspace(0, 2 * np.pi, 42, endpoint=False)
        path = 100 * np.column_stack((np.cos(angle), np.sin(angle)))
        root = obj_to_kn5.empty("AC_TIME_0_L", (104, 0, 0), (0, 0, 1)).matrix
        right = obj_to_kn5.empty("AC_TIME_0_R", (96, 0, 0), (0, 0, 1)).matrix
        # Flat square, larger than the arc, gives every candidate the same driving level.
        road_vertices = np.array([[-110, 0, -110], [110, 0, -110], [110, 0, 110], [-110, 0, 110]])
        roads = {"1ROAD_arc": (None, road_vertices, None, np.array([[0, 1, 2], [0, 2, 3]]))}
        road = lambda x, z, margin: roads
        stations, xz, height = fastlane._sample(path, {"AC_TIME_0_L": root, "AC_TIME_0_R": right}, True, road)
        xyz = fastlane._surface(stations, xz, road, height, True)
        _, detail = fastlane._records(xyz, stations, road, True)
        np.testing.assert_allclose(detail["radius"][25:325], 100, atol=6)
        # The pinned timing point is a seam in the synthetic polygon. Measure the steady arc after accelerating.
        np.testing.assert_allclose(detail["speed"][80:325] * 3.6, 90.9, atol=3)

    def test_sharp_corner_gets_more_of_the_chord_shared_with_a_gentle_bend(self):
        path = np.array([[0, 0], [40, 0], [40, 9], [44, 31]], dtype=float)
        metres = fastlane._distances(path)
        vertices = np.array([[-2, 0, -2], [46, 0, -2], [46, 0, 33], [-2, 0, 33]])
        roads = {"1ROAD_corner": (None, vertices, None, np.array([[0, 1, 2], [0, 2, 3]]))}
        road = lambda x, z, margin: roads
        rounded = fastlane._rounded(path, metres, np.array([True, False, False, True]),
                                    (metres, np.zeros(len(path))), road)
        x, z = rounded[1]
        # Sharing the 9 m chord equally cuts just 4.5 m from the sharp corner. The gentle bend needs about 0.75 m.
        self.assertGreater(40 - x, 8)
        self.assertEqual(0, z)


if __name__ == "__main__":
    unittest.main()
