"""Mapped roof height and ridge direction survive planning and mesh generation."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import buildings as bld
from buildings import mesh
from buildings.looks import _Looks


def roof(attrs):
    """Plan a rectangular house and emit only its roof. Pure."""
    ring = np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]])
    spec = bld.plan(ring, {"class": "house", "height": 10., "num_floors": 2,
                           "roof_shape": "gabled", **attrs})
    output = mesh.Mesh()
    mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, _Looks(spec.seed))
    return spec, np.asarray(output.P).reshape(-1, 3)


class RoofTest(unittest.TestCase):
    def test_spherical_roof_has_a_rounded_bulb_and_crown_at_mapped_height(self):
        spec, _ = roof({"roof_shape": "spherical", "roof_height": 3.})
        self.assertEqual(spec.roof, "spherical")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, _, _ = output.arrays()
        self.assertLessEqual(len(t), 336)
        body = p[p[:, 2] > 7. + 1e-8]
        radius_z = 3. / (1. + np.sqrt(3.) / 2)
        centre_z = 10. - radius_z
        ellipsoid = ((body[:, 0] - 8.) / 8.) ** 2 + ((body[:, 1] - 4.) / 4.) ** 2 + ((body[:, 2] - centre_z) / radius_z) ** 2
        np.testing.assert_allclose(ellipsoid, np.ones(len(body)), atol=1e-8)
        normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
        centres = p[t].mean(axis=1)
        curved = centres[:, 2] > 7. + 1e-8
        radial = centres[:, :2] - [8., 4.]
        self.assertTrue(((normals[curved, :2] * radial[curved]).sum(axis=1) > 0).all())
        self.assertTrue((normals[curved, 2] < 0).any())
        self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
        self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
        self.assertAlmostEqual(p[:, 2].max(), 10.)
        self.assertAlmostEqual(p[:, 2].min(), 7.)

    def test_spherical_roof_ignores_ridge_tags_and_keeps_inferred_height(self):
        heights = []
        for attrs in ({}, {"roof_orientation": "across"}, {"roof_direction": 45.}):
            spec, p = roof({"roof_shape": "spherical", **attrs})
            self.assertEqual(spec.roof, "spherical")
            self.assertAlmostEqual(p[:, 2].max(), 10.)
            self.assertTrue(np.isfinite(p).all())
            heights.append(spec.roof_height)
        np.testing.assert_allclose(heights, np.full(3, heights[0]))

    def test_onion_has_a_wide_bulb_narrow_neck_and_single_tip(self):
        spec, _ = roof({"roof_shape": "onion", "roof_height": 3.})
        self.assertEqual(spec.roof, "onion")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, _, _ = output.arrays()
        self.assertLessEqual(len(t), 240)
        levels = np.unique(np.round(p[:, 2], 6))
        radius = np.hypot((p[:, 0] - 8.) / 8., (p[:, 1] - 4.) / 4.)
        base = radius[np.isclose(p[:, 2], 7.)]
        self.assertGreater(radius[np.isclose(p[:, 2], levels[2])].max(), base.min())
        self.assertLess(radius[np.isclose(p[:, 2], levels[-2])].max(), .2)
        tip = p[np.isclose(p[:, 2], 10.)]
        np.testing.assert_allclose(tip[:, :2], np.tile([8., 4.], (len(tip), 1)))
        normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
        centres = p[t].mean(axis=1)
        curved = centres[:, 2] > 7. + 1e-8
        radial = centres[:, :2] - [8., 4.]
        self.assertTrue(((normals[curved, :2] * radial[curved]).sum(axis=1) > 0).all())
        self.assertTrue((normals[curved, 2] < 0).any(), "the expanding bulb must be visible from below")
        self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
        self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
        self.assertAlmostEqual(p[:, 2].min(), 7.)
        self.assertAlmostEqual(p[:, 2].max(), 10.)

    def test_onion_ignores_ridge_tags_and_keeps_inferred_height(self):
        heights = []
        for attrs in ({}, {"roof_orientation": "across"}, {"roof_direction": 45.}):
            spec, p = roof({"roof_shape": "onion", **attrs})
            self.assertEqual(spec.roof, "onion")
            self.assertAlmostEqual(p[:, 2].max(), 10.)
            self.assertTrue(np.isfinite(p).all())
            heights.append(spec.roof_height)
        np.testing.assert_allclose(heights, np.full(3, heights[0]))

    def test_dome_has_an_elliptical_cap_and_closed_rectangular_base(self):
        spec, _ = roof({"roof_shape": "dome", "roof_height": 3.})
        self.assertEqual(spec.roof, "dome")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, materials, _ = output.arrays()
        self.assertLessEqual(len(t), 208)
        self.assertGreater(len(t), 16)
        curved = p[p[:, 2] > 7. + 1e-8]
        ellipse = ((curved[:, 0] - 8.) / 8.) ** 2 + ((curved[:, 1] - 4.) / 4.) ** 2 + ((curved[:, 2] - 7.) / 3.) ** 2
        np.testing.assert_allclose(ellipse, np.ones(len(curved)), atol=1e-8)
        self.assertAlmostEqual(p[:, 2].max(), 10.)
        self.assertAlmostEqual(p[:, 2].min(), 7.)
        normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
        self.assertTrue((normals[:, 2] > 0).all())
        self.assertTrue(np.isfinite(uv).all())
        # Projected upper faces cover the entire roof rectangle, including its corner apron.
        self.assertAlmostEqual(normals[:, 2].sum() / 2, (16. + 2 * mesh.EAVE_M) * (8. + 2 * mesh.EAVE_M))

    def test_dome_ignores_ridge_tags_and_keeps_inferred_height_stable(self):
        heights = []
        for attrs in ({}, {"roof_orientation": "across"}, {"roof_direction": 45.}):
            spec, p = roof({"roof_shape": "dome", **attrs})
            self.assertEqual(spec.roof, "dome")
            self.assertAlmostEqual(p[:, 2].max(), 10.)
            self.assertTrue(np.isfinite(p).all())
            heights.append(spec.roof_height)
        np.testing.assert_allclose(heights, np.full(3, heights[0]))

    def test_sawtooth_repeats_asymmetric_slopes_at_the_mapped_height(self):
        spec, _ = roof({"roof_shape": "sawtooth", "roof_height": 3.})
        self.assertEqual(spec.roof, "sawtooth")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, materials, _ = output.arrays()
        faces = t[materials == looks[spec.roof_mat][0]]
        peaks = p[np.isclose(p[:, 2], 10.)]
        self.assertGreaterEqual(len(np.unique(np.round(peaks[:, 1], 6))), 2)
        self.assertLessEqual(len(faces), 32)
        normals = np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
        slopes = np.linalg.norm(normals[:, :2], axis=1) / normals[:, 2]
        self.assertGreater(slopes.max(), slopes.min() * 2)
        self.assertAlmostEqual(p[np.unique(faces), 2].min(), 7.)
        self.assertTrue(np.isfinite(uv).all())

    def test_sawtooth_directions_and_inferred_rise_keep_valid_geometry(self):
        for attrs in ({"roof_orientation": "across"}, {"roof_direction": 45.},
                      {"roof_direction": 90.}, {"roof_height": None}):
            with self.subTest(attrs=attrs):
                spec, _ = roof({"roof_shape": "sawtooth", "roof_height": 3., **attrs})
                self.assertEqual(spec.roof, "sawtooth")
                output, looks = mesh.Mesh(), _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, uv, t, materials, _ = output.arrays()
                normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                self.assertTrue((normals[materials == looks[spec.roof_mat][0], 2] > 0).all())
                self.assertAlmostEqual(p[:, 2].max(), 10.)
                np.testing.assert_allclose(mesh.drawn_ring(spec), mesh.drawn_ring(roof({})[0]))

    def test_round_roof_follows_a_barrel_profile_with_bounded_mesh_cost(self):
        spec, _ = roof({"roof_shape": "round", "roof_height": 3.})
        self.assertEqual(spec.roof, "round")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, materials, _ = output.arrays()
        faces = t[materials == looks[spec.roof_mat][0]]
        self.assertGreater(len(faces), 4)
        self.assertLessEqual(len(faces), 24)
        points = p[np.unique(faces)]
        profile = ((points[:, 1] - 4.) / (4. + mesh.EAVE_M)) ** 2 + ((points[:, 2] - 7.) / 3.) ** 2
        np.testing.assert_allclose(profile, np.ones(len(points)), atol=1e-8)
        self.assertAlmostEqual(points[:, 2].max(), 10.)
        self.assertGreater(len(np.unique(np.round(points[:, 2], 6))), 3)
        self.assertTrue(np.isfinite(uv).all())

    def test_round_roof_directions_and_inferred_rise_remain_valid(self):
        for attrs in ({"roof_orientation": "across"}, {"roof_direction": 45.},
                      {"roof_direction": 90.}, {"roof_height": None}):
            with self.subTest(attrs=attrs):
                spec, _ = roof({"roof_shape": "round", "roof_height": 3., **attrs})
                self.assertEqual(spec.roof, "round")
                output, looks = mesh.Mesh(), _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, uv, t, materials, _ = output.arrays()
                normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                self.assertTrue((normals[materials == looks[spec.roof_mat][0], 2] > 0).all())
                self.assertAlmostEqual(p[:, 2].max(), 10.)
                np.testing.assert_allclose(mesh.drawn_ring(spec), mesh.drawn_ring(roof({})[0]))

    def test_saltbox_has_offset_ridge_and_unequal_eave_heights(self):
        spec, _ = roof({"roof_shape": "saltbox", "roof_height": 3.})
        self.assertEqual(spec.roof, "saltbox")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, materials, _ = output.arrays()
        faces = t[materials == looks[spec.roof_mat][0]]
        self.assertEqual(len(faces), 4)
        points = p[np.unique(faces)]
        ridge = points[np.isclose(points[:, 2], 10.)]
        self.assertGreater(ridge[:, 1].mean(), 4.)
        south = points[np.isclose(points[:, 1], -mesh.EAVE_M)]
        north = points[np.isclose(points[:, 1], 8. + mesh.EAVE_M)]
        self.assertAlmostEqual(south[:, 2].mean(), 7.)
        self.assertGreater(north[:, 2].mean(), south[:, 2].mean() + 1.)
        self.assertLess(north[:, 2].mean(), 10.)
        normals = np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
        slopes = np.linalg.norm(normals[:, :2], axis=1) / normals[:, 2]
        np.testing.assert_allclose(slopes, np.full(len(slopes), slopes[0]))
        self.assertTrue(np.isfinite(uv).all())

    def test_saltbox_directions_and_inferred_height_keep_valid_geometry(self):
        for attrs in ({"roof_orientation": "across"}, {"roof_direction": 45.},
                      {"roof_direction": 90.}, {"roof_direction": 270.}, {"roof_height": None}):
            with self.subTest(attrs=attrs):
                spec, _ = roof({"roof_shape": "saltbox", "roof_height": 3., **attrs})
                self.assertEqual(spec.roof, "saltbox")
                output, looks = mesh.Mesh(), _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, uv, t, materials, _ = output.arrays()
                normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                self.assertTrue((normals[materials == looks[spec.roof_mat][0], 2] > 0).all())
                self.assertAlmostEqual(p[:, 2].max(), 10.)
                np.testing.assert_allclose(mesh.drawn_ring(spec), mesh.drawn_ring(roof({})[0]))

    def test_gambrel_has_two_pitches_per_side_and_full_height_gable_walls(self):
        spec, _ = roof({"roof_shape": "gambrel", "roof_height": 3.})
        self.assertEqual(spec.roof, "gambrel")
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, materials, _ = output.arrays()
        faces = t[materials == looks[spec.roof_mat][0]]
        self.assertEqual(len(faces), 8, "four roof quads, with no hipped ends")
        normals = np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
        self.assertTrue(np.allclose(normals[:, 0], 0.))
        slopes = np.linalg.norm(normals[:, :2], axis=1) / normals[:, 2]
        lower = np.isclose(p[faces, 2].min(axis=1), spec.height)
        self.assertGreater(slopes[lower].min(), slopes[~lower].max())
        walls = p[np.unique(t[materials == looks[spec.facade][0]])]
        for x in (0., 16.):
            end = walls[np.isclose(walls[:, 0], x)]
            self.assertAlmostEqual(end[:, 2].max(), 10.)
        self.assertTrue(np.isfinite(uv).all())

    def test_gambrel_height_and_orientation_keep_valid_faces(self):
        for attrs in ({"roof_orientation": "across"}, {"roof_direction": 45.},
                      {"roof_direction": 90.}, {"roof_height": None}):
            with self.subTest(attrs=attrs):
                spec, _ = roof({"roof_shape": "gambrel", "roof_height": 3., **attrs})
                self.assertEqual(spec.roof, "gambrel")
                output, looks = mesh.Mesh(), _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, uv, t, materials, _ = output.arrays()
                normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                self.assertTrue((normals[materials == looks[spec.roof_mat][0], 2] > 0).all())
                self.assertAlmostEqual(p[:, 2].max(), 10.)
                np.testing.assert_allclose(mesh.drawn_ring(spec), mesh.drawn_ring(roof({})[0]))

    def test_mansard_has_steep_lower_and_shallow_upper_slopes(self):
        spec, _ = roof({"roof_shape": "mansard", "roof_height": 3.})
        self.assertEqual(spec.roof, "mansard")
        self.assertAlmostEqual(spec.height, 7.)
        output, looks = mesh.Mesh(), _Looks(spec.seed)
        mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
        p, uv, t, materials, _ = output.arrays()
        faces = t[materials == looks[spec.roof_mat][0]]
        self.assertEqual(len(faces), 14)
        levels = np.unique(np.round(p[np.unique(faces), 2], 6))
        self.assertEqual(len(levels), 3)
        self.assertAlmostEqual(levels[0], 7.)
        self.assertAlmostEqual(levels[-1], 10.)
        normals = np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
        slopes = np.linalg.norm(normals[:, :2], axis=1) / normals[:, 2]
        lower = np.isclose(p[faces, 2].min(axis=1), levels[0])
        self.assertGreater(slopes[lower].min(), slopes[~lower].max())
        self.assertTrue(np.isfinite(uv).all())

    def test_mansard_directions_and_square_footprints_keep_valid_geometry(self):
        for ring in (np.array([[0., 0.], [16., 0.], [16., 8.], [0., 8.]]),
                     np.array([[0., 0.], [12., 0.], [12., 12.], [0., 12.]])):
            for attrs in ({}, {"roof_orientation": "across"}, {"roof_direction": 45.}):
                with self.subTest(ring=ring.tolist(), attrs=attrs):
                    spec = bld.plan(ring, {"class": "house", "height": 10., "roof_height": 3.,
                                          "roof_shape": "mansard", **attrs})
                    self.assertEqual(spec.roof, "mansard")
                    output, looks = mesh.Mesh(), _Looks(spec.seed)
                    mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                    p, uv, t, materials, _ = output.arrays()
                    normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                    self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                    self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                    self.assertTrue((normals[materials == looks[spec.roof_mat][0], 2] > 0).all())
                    self.assertAlmostEqual(p[:, 2].max(), 10.)
                    self.assertTrue((p[:, :2].min(0) >= ring.min(0) - mesh.EAVE_M - 1e-8).all())
                    self.assertTrue((p[:, :2].max(0) <= ring.max(0) + mesh.EAVE_M + 1e-8).all())

    def test_half_hip_keeps_lower_gables_and_clips_only_their_tops(self):
        for tag in ("half_hipped", "half-hipped"):
            with self.subTest(tag=tag):
                spec, _ = roof({"roof_shape": tag, "roof_height": 3.})
                self.assertEqual(spec.roof, "half_hipped")
                output, looks = mesh.Mesh(), _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, uv, t, materials, _ = output.arrays()
                faces = t[materials == looks[spec.roof_mat][0]]
                self.assertEqual(len(faces), 10)
                # The small end slopes stop above the eaves, leaving a substantial gable wall.
                normals = np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
                ends = faces[np.abs(normals[:, 0]) > 1e-6]
                self.assertEqual(len(ends), 2)
                self.assertGreater(p[ends, 2].min(), spec.height + 1.)
                self.assertAlmostEqual(p[:, 2].max(), 10.)
                ridge = p[np.isclose(p[:, 2], 10.)]
                self.assertGreater(np.ptp(ridge[:, 0]), 8.)
                self.assertLess(np.ptp(ridge[:, 0]), 16.)
                self.assertTrue(np.isfinite(uv).all())

    def test_half_hip_directions_close_walls_and_keep_valid_roof_faces(self):
        for attrs in ({}, {"roof_orientation": "across"}, {"roof_direction": 45.}, {"roof_direction": 90.}):
            with self.subTest(attrs=attrs):
                spec, _ = roof({"roof_shape": "half_hipped", "roof_height": 3., **attrs})
                self.assertEqual(spec.roof, "half_hipped")
                output, looks = mesh.Mesh(), _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, uv, t, materials, _ = output.arrays()
                normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                self.assertTrue((normals[materials == looks[spec.roof_mat][0], 2] > 0).all())
                self.assertGreater(len(t[materials == looks[spec.facade][0]]), 0)
                self.assertAlmostEqual(p[:, 2].max(), 10.)
                np.testing.assert_allclose(mesh.drawn_ring(spec), mesh.drawn_ring(roof({})[0]))

    def test_pyramidal_roof_has_four_slopes_meeting_at_one_central_apex(self):
        for width, depth, angle in ((16., 8., 0.), (12., 12., 0.), (24., 6., 30.)):
            for direction in (None, 45., 90.):
                with self.subTest(width=width, depth=depth, angle=angle, direction=direction):
                    ring = np.array([[0., 0.], [width, 0.], [width, depth], [0., depth]])
                    a = np.radians(angle)
                    ring = ring @ np.array([[np.cos(a), np.sin(a)], [-np.sin(a), np.cos(a)]])
                    spec = bld.plan(ring, {"class": "house", "height": 10., "num_floors": 2,
                                          "roof_shape": "pyramidal", "roof_height": 3.,
                                          "roof_direction": direction})
                    self.assertEqual(spec.roof, "pyramidal")
                    self.assertAlmostEqual(spec.height, 7.)
                    output, looks = mesh.Mesh(), _Looks(spec.seed)
                    mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                    p, uv, t, materials, _ = output.arrays()
                    faces = t[materials == looks[spec.roof_mat][0]]
                    self.assertEqual(len(faces), 4)
                    self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                    normals = np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
                    self.assertTrue((normals[:, 2] > 0).all())
                    apex = p[np.isclose(p[:, 2], 10.)]
                    np.testing.assert_allclose(apex[:, :2], np.tile(ring.mean(0), (len(apex), 1)))
                    self.assertTrue(np.all(np.sum(np.isclose(p[faces, 2], 10.), axis=1) == 1))
                    self.assertAlmostEqual(p[:, 2].max(), 10.)

    def test_pyramidal_inferred_height_ignores_ridge_bearing(self):
        heights = []
        for direction in (None, 45., 90.):
            spec, p = roof({"roof_shape": "pyramidal", "roof_direction": direction})
            self.assertEqual(spec.roof, "pyramidal")
            self.assertGreater(spec.roof_height, 0.)
            self.assertAlmostEqual(p[:, 2].max(), 10.)
            heights.append(spec.roof_height)
        np.testing.assert_allclose(heights, np.full(3, heights[0]))

    def test_skillion_is_one_plane_with_closed_walls_and_mapped_height(self):
        for bearing in (None, 0., 90., 180., 270., 45.):
            with self.subTest(bearing=bearing):
                spec, _ = roof({"roof_shape": "skillion", "roof_direction": bearing, "roof_height": 2.})
                self.assertEqual(spec.roof, "skillion")
                output = mesh.Mesh()
                looks = _Looks(spec.seed)
                mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, looks)
                p, _, t, materials, _ = output.arrays()
                roof_faces = t[materials == looks[spec.roof_mat][0]]
                self.assertEqual(len(roof_faces), 2, "one quad, without a central ridge")
                corners = p[np.unique(roof_faces)]
                self.assertAlmostEqual(corners[:, 2].min(), 8.)
                self.assertAlmostEqual(corners[:, 2].max(), 10.)
                normals = np.cross(p[roof_faces[:, 1]] - p[roof_faces[:, 0]], p[roof_faces[:, 2]] - p[roof_faces[:, 0]])
                normals /= np.linalg.norm(normals, axis=1)[:, None]
                np.testing.assert_allclose(normals[0], normals[1], atol=1e-8)
                self.assertGreater(normals[0, 2], 0.)
                if bearing is not None:
                    downhill = normals[0, :2] / np.linalg.norm(normals[0, :2])
                    np.testing.assert_allclose(downhill, [np.sin(np.radians(bearing)), np.cos(np.radians(bearing))], atol=1e-8)
                cap_vertices = p[np.unique(t[materials != looks[spec.roof_mat][0]])]
                self.assertGreater(len(cap_vertices), 0)
                plane_height = corners[0, 2] - ((cap_vertices[:, :2] - corners[0, :2]) @ normals[0, :2]) / normals[0, 2]
                self.assertTrue(np.all(np.isclose(cap_vertices[:, 2], spec.height) |
                                       np.isclose(cap_vertices[:, 2], plane_height)))

    def test_skillion_without_mapped_rise_has_a_finite_roof(self):
        spec, p = roof({"roof_shape": "skillion", "roof_height": None})
        self.assertEqual(spec.roof, "skillion")
        self.assertTrue(np.isfinite(p).all())
        self.assertGreater(spec.roof_height, 0.)
        self.assertAlmostEqual(p[:, 2].max(), 10.)

    def test_valid_low_walls_are_not_raised_above_the_mapped_roof(self):
        spec, p = roof({"height": 4., "roof_height": 3.})
        self.assertAlmostEqual(spec.height, 1.)
        self.assertAlmostEqual(p[:, 2].max(), 4.)

    def test_main_building_and_part_keep_their_roof_tags(self):
        import geodesy
        from test_buildings import Feats
        frame = geodesy.EnuFrame(46.6, 14.6)
        ring = np.array([[10., 10.], [26., 10.], [26., 18.], [10., 18.], [10., 10.]])
        la, lo, _ = frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
        polygon = np.c_[lo, la]
        attrs = {"height": [10.], "roof_shape": ["gabled"], "roof_height": [2.],
                 "roof_direction": [45.], "roof_orientation": ["across"]}
        for parts in (False, True):
            with self.subTest(parts=parts):
                parent = Feats(["B"], [polygon], **{"class": ["house"], **({} if parts else attrs)})
                children = [Feats(["P"], [polygon], **{"building_id": ["B"], **attrs})] if parts else []
                items = bld.tile_buildings(frame, 0., 0., 256., 256., [parent], lambda la, lo: np.zeros(np.shape(la)),
                                           part_layers=children)
                self.assertEqual(len(items), 1)
                spec = items[0][0]
                self.assertEqual((spec.roof_direction, spec.roof_orientation, spec.roof_height), (45., "across", 2.))
                self.assertAlmostEqual(spec.height, 8.)

    def test_cached_float32_roof_tags_reach_the_object_list_as_json(self):
        """The map cells keep numbers as float32 (mapdata's npz), which json can't write; a building's details in the
        tile's object list (write_objects) carry its roof direction: one mapped roof:direction stopped the build."""
        import json
        import geodesy
        from test_buildings import Feats
        from buildings.build import _listed
        frame = geodesy.EnuFrame(46.6, 14.6)
        ring = np.array([[10., 10.], [26., 10.], [26., 18.], [10., 18.], [10., 10.]])
        la, lo, _ = frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
        polygon = np.c_[lo, la]
        attrs = {"height": [10.], "roof_shape": ["gabled"], "roof_height": [2.], "roof_direction": [45.]}
        for parts in (False, True):
            with self.subTest(parts=parts):
                parent = Feats(["B"], [polygon], **{"class": ["house"], **({} if parts else attrs)})
                children = [Feats(["P"], [polygon], **{"building_id": ["B"], **attrs})] if parts else []
                for layer in (parent, *children):
                    layer.attrs = {k: v.astype(np.float32) if v.dtype == np.float64 else v
                                   for k, v in layer.attrs.items()}
                items = bld.tile_buildings(frame, 0., 0., 256., 256., [parent], lambda la, lo: np.zeros(np.shape(la)),
                                           part_layers=children)
                self.assertEqual(len(items), 1)
                self.assertEqual(items[0][0].roof_direction, 45.)
                json.dumps(_listed(0, items[0], 0, []), allow_nan=False)

    def test_oblique_roofs_have_finite_nonzero_upward_roof_faces(self):
        for shape in ("gabled", "hipped"):
            for bearing in (0., 30., 45., 90., 135., 270.):
                with self.subTest(shape=shape, bearing=bearing):
                    spec, _ = roof({"roof_shape": shape, "roof_direction": bearing, "roof_height": 2.})
                    output = mesh.Mesh()
                    mesh._roof(output, spec, mesh.drawn_ring(spec), spec.height, _Looks(spec.seed))
                    p, _, t, _, _ = output.arrays()
                    normals = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
                    self.assertTrue(np.isfinite(normals).all())
                    self.assertTrue((np.linalg.norm(normals, axis=1) > 1e-8).all())
                    self.assertTrue((normals[:, 2] >= -1e-8).all())

    def test_mapped_roof_height_keeps_total_building_height(self):
        for shape in ("gabled", "hipped"):
            for orientation in ("along", "across"):
                with self.subTest(shape=shape, orientation=orientation):
                    spec, p = roof({"roof_shape": shape, "roof_height": 2., "roof_orientation": orientation})
                    self.assertAlmostEqual(spec.height, 8.)
                    self.assertAlmostEqual(p[:, 2].max(), 10.)

    def test_across_turns_ridge_without_turning_walls(self):
        spec, p = roof({"roof_orientation": "across", "roof_height": 2.})
        top = p[np.isclose(p[:, 2], p[:, 2].max())]
        self.assertLess(np.ptp(top[:, 0]), 1e-8)
        self.assertGreater(np.ptp(top[:, 1]), 4.)
        np.testing.assert_allclose(np.sort(mesh.drawn_ring(spec), axis=0), np.sort(spec.ring, axis=0))

    def test_explicit_bearing_overrides_orientation_and_keeps_roof_over_footprint(self):
        spec, p = roof({"roof_direction": 45., "roof_orientation": "along", "roof_height": 2.})
        top = p[np.isclose(p[:, 2], p[:, 2].max())]
        self.assertGreater(np.ptp(top[:, 0]), 4.)
        np.testing.assert_allclose(top[:, 0] - top[:, 1], np.full(len(top), 4.), atol=1e-6)
        self.assertGreaterEqual(p[:, 0].min(), -mesh.EAVE_M - 1e-8)
        self.assertLessEqual(p[:, 0].max(), 16. + mesh.EAVE_M + 1e-8)
        self.assertGreaterEqual(p[:, 1].min(), -mesh.EAVE_M - 1e-8)
        self.assertLessEqual(p[:, 1].max(), 8. + mesh.EAVE_M + 1e-8)
        np.testing.assert_allclose(mesh.drawn_ring(spec), mesh.drawn_ring(roof({})[0]))

    def test_invalid_roof_height_does_not_make_an_inverted_roof(self):
        for value in (-2., float("nan"), 20.):
            with self.subTest(value=value):
                spec, p = roof({"roof_height": value})
                self.assertTrue(np.isfinite(p).all())
                self.assertGreater(spec.height, 0.)
                self.assertAlmostEqual(p[:, 2].max(), 10.)


if __name__ == "__main__":
    unittest.main()
