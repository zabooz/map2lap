"""The settings page's graphics knobs on the server (the user, 2026-10-28: "give player much more control in the graphics
settings (view distance, LOD quality, ETC. Also add an extreme quality setting that puts everything at max quality to
the real horizon"): the mod's 'graphics' message {lodScale, treeScale, buildingScale, photoPx} (Connection.set_graphics)
scales the far field's K (more / fewer tiles, the exact-level rule near the car unchanged), the tree tiles' and the far
buildings' / skyline's / far bridges' reach, and sets the ground photo's size (Server.set_base_px: the photo, its packed
cache entry and every size's flat AO map the level ships)."""
import os
import sys
import unittest


sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import buildings  # noqa: E402
import vegetation  # noqa: E402







class DiscTest(unittest.TestCase):
    """The reach of every tile kind is a disc (the user, 2026-10-28: "change the quality/view distance radius from a
    square to a circle"): the far buildings' whole groups and the skyline's squares agree (no overlap, no hole), and a
    corner square inside the old square but beyond the radius is not wanted."""

    def test_far_buildings_and_skyline_meet(self):
        import roads
        far = vegetation.Tracker(buildings.FAR_SEND_M, buildings.FAR_DROP_M, 1, "bldfar", group=buildings.SKY_UNIT)
        sky = vegetation.Tracker(buildings.SKY_SEND_M, buildings.SKY_DROP_M, 1, "bldsky", unit=buildings.SKY_UNIT,
                                 inner=(buildings.FAR_SEND_M, buildings.SKY_UNIT))
        u = buildings.SKY_UNIT
        for x, y in ((0.0, 0.0), (700.0, -300.0), (1023.0, 1023.0)):
            groups = {(k[0] // u, k[1] // u) for k in far._near(x, y, far.send_m)}
            inner = set(sky._near(x, y, sky.inner[0], unit=sky.unit, group=sky.inner[1]))
            self.assertEqual(groups, inner, "the skyline leaves out exactly the far buildings' groups")
            for g in groups:        # every group within the radius by its own square's nearest point
                self.assertLessEqual(roads.box_gap(g[0] * u * 256, g[1] * u * 256, (g[0] + 1) * u * 256,
                                                   (g[1] + 1) * u * 256, x, y), far.send_m)
        # a 1 km square whose corner is 1.7 km away (each axis 1.2 km: inside the old square of 1.6 km) is not wanted
        self.assertNotIn((1, 1), sky._near(-200.0, -200.0, 1600.0))
        self.assertIn((1, 0), sky._near(-200.0, -200.0, 1600.0))

    def test_tree_tiles_disc(self):
        t = vegetation.Tracker()
        near = set(t._near(0.0, 0.0, t.send_m))
        self.assertIn((4, 0), near)                 # its side 1024 m away
        self.assertNotIn((4, 4), near)              # its corner 1448 m away (Chebyshev 1024: wanted before)
        self.assertEqual(t._dist((4, 4), 0.0, 0.0), 1024 * 2 ** 0.5)




if __name__ == "__main__":
    unittest.main()
