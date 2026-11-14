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
