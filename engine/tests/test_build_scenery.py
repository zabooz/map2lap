"""Build-time tree thinning removes source placements, including neighbours on different tiles."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import generator
from app import treespacing
from track import objectlist
from scenery import treefx


class BuildTreeSpacingTest(unittest.TestCase):
    def test_trees_and_bushes_do_not_stand_on_marked_parking_spaces(self):
        from scenery import trees
        spots = [[0, 0, 0, 0, 1], [12, 0, 0, 0]]
        items = [(kind, x, y, 0, 0, 2, 0.5) for kind, x, y in
                 (("deciduous", 0, 0), ("shrub", 12, 0), ("shrub", 0, 3), ("deciduous", 12, 3))]
        self.assertEqual(trees.clear_of_parking(items, spots), items[2:])

    def test_parking_beyond_tile_seam_still_blocks_plants(self):
        from track import make_obj
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "roads_1_1_0.json"
            path.write_text(json.dumps({"park": [[256.5, 10, 0, 0, 1]]}), encoding="utf-8")
            self.assertEqual(make_obj._nearby_parking(folder, 1, 0, 0), [(256.5, 10, 0, 0, 1)])

    def test_finished_neighbour_footprint_removes_its_parking_line_and_mesh(self):
        from track import buildscenery
        import numpy as np
        house = [(0, 0), (10, 0), (10, 8), (0, 8)]
        line = {"m": "line_white", "w": 0.1, "n": [[-1, 4, 1], [2, 4, 1]]}
        clear = {"m": "line_white", "w": 0.1, "n": [[15, 4, 1], [18, 4, 1]]}
        kept, blocked = buildscenery.clear_covered_parking_lines([line, clear], [house])
        self.assertEqual(kept, [clear])
        p = np.array([[0, 4, 1], [1, 4, 1], [0, 4.1, 1],
                      [15, 4, 1], [16, 4, 1], [15, 4.1, 1]], float)
        triangles = np.array([[0, 1, 2], [3, 4, 5]])
        np.testing.assert_array_equal(buildscenery.clear_covered_mark_mesh(p, triangles, blocked),
                                      triangles[1:])
        thin = [(0.1, 0), (0.2, 0), (0.2, 8), (0.1, 8)]
        kept, blocked = buildscenery.clear_covered_parking_lines([line], [thin])
        self.assertFalse(kept, "a narrow building crossing the line still covers it")
        self.assertEqual(blocked, [line])

    def test_cars_clear_neighbouring_tile_buildings_before_mesh(self):
        from unittest import mock
        from track import buildscenery
        house = [(0, 0), (10, 0), (10, 8), (0, 8)]
        spots = [[5, 4, 0, 0], [20, 4, 0, 0]]
        with mock.patch.object(buildscenery.cars, "build") as build:
            buildscenery.car_mesh(spots, None, [house], ["apartments"], [])
            self.assertEqual(build.call_args.args[0], [spots[1]])

    def test_disabling_cars_does_not_generate_meshes_or_consume_the_parking_spots(self):
        from unittest import mock
        from track import buildscenery
        spots = [[1, 2, 3, 90], [4, 5, 6, 0]]
        before = [list(s) for s in spots]
        with mock.patch.object(buildscenery.cars, "build") as build, mock.patch.object(buildscenery.cars, "fill_shares") as fill:
            self.assertIsNone(buildscenery.car_mesh(spots, None, [], [], [], enabled=False))
            build.assert_not_called()
            fill.assert_not_called()
        self.assertEqual(spots, before)

    def thin(self, parts, distance):
        from track import buildscenery
        return buildscenery.thin_trees(parts, distance)

    def test_neighbours_across_tile_seams_are_removed_from_the_saved_source(self):
        with tempfile.TemporaryDirectory() as folder:
            parts = [str(Path(folder) / f"t_{i}_0.obj") for i in range(2)]
            for part, x in zip(parts, (255., 257.)):
                listed = objectlist.TileList()
                listed.treefx = [treefx.placement("spruce", (x, 0, 0), 0, 10, .4)]
                listed.save(part)
            self.assertEqual(self.thin(parts, 5.), 1)
            section = objectlist.collect_treefx(parts)
            self.assertEqual(len(section["trees"]), 1)
            self.assertEqual(sum(len(objectlist.load_side(p).get("treefx", [])) for p in parts), 1)
            # Editor reset sees only the built subset; there is no hidden original placement to restore.
            candidates = {f"trees#{key}": value["pos"] for key, value in section["trees"].items()}
            self.assertEqual(treespacing.prepare(candidates, 0, None)["hidden"], [])
            self.assertEqual(len(candidates), 1)

    def test_build_spacing_leaves_bushes_and_non_tree_object_data_intact(self):
        with tempfile.TemporaryDirectory() as folder:
            part = str(Path(folder) / "t_0_0.obj")
            listed = objectlist.TileList()
            listed.new("bench", 1, 2, 3)
            listed.treefx = [treefx.placement("spruce", (x, 0, 0), 0, 10, .4) for x in (0., 1., 10.)]
            listed.treefx.append(treefx.placement("shrub", (0, 0, 0), 0, 1, 1))
            listed.save(part)
            before = Path(objectlist.side_file(part)).read_bytes()
            self.assertEqual(self.thin([part], 0), 0)
            self.assertEqual(Path(objectlist.side_file(part)).read_bytes(), before)
            self.assertGreater(self.thin([part], 5), 0)
            saved = objectlist.load_side(part)
            self.assertEqual(saved["kinds"], ["bench"])
            self.assertEqual(sum(t["model"] == "shrub" for t in saved["treefx"]), 1)
            self.assertNotIn("hidden", saved)


if __name__ == "__main__":
    unittest.main()
