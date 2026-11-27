"""A recorded spline follows the same collision surface through an Editor Save."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import drivenline, fastlane


class RecordingHeightTest(unittest.TestCase):
    def road(self, surfaces):
        meshes = {}
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        for name, height in surfaces.items():
            vertices = np.array([[0., height, 0.], [20., height, 0.], [20., height, 20.], [0., height, 20.]])
            meshes[name] = None, vertices, None, faces
        return fastlane._local_roads(meshes, free=True)

    def test_changes_follow_the_recorded_deck_even_above_a_closer_road(self):
        xyz = np.array([[2., 8.125, 3.], [6., 8.25, 4.]])
        original = self.road({"1ROAD_ground/0": 1., "1ROAD_deck/7": 8.})
        reference = drivenline.floor_columns(xyz, original)
        np.testing.assert_array_equal(drivenline.refit_heights(xyz, reference, original), xyz)
        # The recording already includes the earlier edit that brought this deck to 8 m.
        edited = self.road({"1ROAD_ground/1": 8., "1ROAD_deck/5": 13.})
        result = drivenline.refit_heights(xyz, reference, edited)
        np.testing.assert_allclose(result, xyz + [0., 5., 0.], rtol=0, atol=1e-10)
        np.testing.assert_array_equal(drivenline.refit_heights(xyz, reference, edited), result)

    def test_removing_the_recorded_deck_cannot_snap_the_spline_to_the_road_below(self):
        xyz = np.array([[2., 4., 3.]])
        reference = drivenline.floor_columns(xyz, self.road({"1ROAD_ground/0": 0., "1ROAD_deck/1": 4.}))
        with self.assertRaisesRegex(fastlane.NoLine, "recording"):
            drivenline.refit_heights(xyz, reference, self.road({"1ROAD_ground/0": 0.}))

    def test_two_possible_capture_levels_cannot_be_disambiguated_by_moving_one(self):
        xyz = np.array([[2., 2.1, 3.]])
        reference = drivenline.floor_columns(xyz, self.road({"1ROAD_ground/0": 0., "1ROAD_deck/1": 4.}))
        with self.assertRaisesRegex(fastlane.NoLine, "recording"):
            drivenline.refit_heights(xyz, reference, self.road({"1ROAD_ground/0": 1., "1ROAD_deck/1": 8.}))

    def test_original_kerb_contact_is_preserved_on_an_unchanged_track(self):
        xyz = np.array([[2., .30, 3.]])
        original = self.road({"1ROAD_ground/0": 0., "1KERB_walkcol_edge/1": .26})
        reference = drivenline.floor_columns(xyz, original)
        np.testing.assert_array_equal(drivenline.refit_heights(xyz, reference, original), xyz)


if __name__ == "__main__":
    unittest.main()
