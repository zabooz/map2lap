"""Small utility classes have access, open shelters and class-appropriate surfaces."""
from pathlib import Path
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import buildings as bld
from buildings import mesh

RING = np.array([[0., 0.], [10., 0.], [10., 6.], [0., 6.]])


def plan(kind, ring=None, **attrs):
    return bld.plan(RING.copy() if ring is None else ring,
                    {'class': kind, 'height': 4., 'num_floors': 1, **attrs}, lat=46.6, lon=14.6)


class OutbuildingTest(unittest.TestCase):
    def test_unclassified_tiny_building_has_shed_access(self):
        ring = np.array([[0., 0.], [4.5, 0.], [4.5, 3.2], [0., 3.2]])
        spec = bld.plan(ring, {'class': '', 'height': np.nan, 'num_floors': np.nan},
                        lat=46.65, lon=14.63)
        p, uv, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
        access = materials.index(bld.SURFACE_MATERIALS['utl'])
        self.assertGreater(np.count_nonzero(mids == access), 0)
        self.assertGreater(np.count_nonzero(mids == materials.index('bne_bld_facade')), 0)

    def test_narrow_rectangular_buildings_keep_mapped_pitched_roofs(self):
        ring = np.array([[0., 0.], [4.5, 0.], [4.5, 3.2], [0., 3.2]])
        for kind in ('', 'shed', 'garage', 'kiosk'):
            spec = bld.plan(ring, {'class': kind, 'roof_shape': 'gabled'},
                            lat=46.65, lon=14.63)
            self.assertEqual(spec.roof, 'gabled', kind)
        inferred = bld.plan(ring, {'class': ''}, lat=46.65, lon=14.63, look=.927682)
        self.assertEqual(inferred.roof, 'gabled')

    def test_closed_small_utilities_get_a_door_without_a_nearby_road(self):
        for kind in ('shed', 'hut', 'cabin', 'toilets', 'service', 'static_caravan'):
            spec = plan(kind)
            p, uv, t, mids, materials, _ = bld.build([(spec, 0., 0.)])
            door_mats = {materials.index(bld.SURFACE_MATERIALS[k]) for k in ('utl', 'ind')}
            panels = t[np.isin(mids, list(door_mats))]
            self.assertGreater(len(panels), 0, kind)
            self.assertGreaterEqual(p[panels, 2].min(), 0.)
            self.assertLessEqual(p[panels, 2].max(), spec.height)

    def test_shelters_are_open_in_visible_and_collision_meshes(self):
        for kind in ('shelter', 'roof', 'carport'):
            spec = plan(kind, roof_shape='flat')
            for output in (bld.build([(spec, 0., 0.)]), bld.collision_mesh([(spec, 0., 0.)])):
                p, _, t = output[:3]
                midheight = p[t].mean(axis=1)[:, 2]
                walls = p[t[(midheight > .4) & (midheight < 3.)]]
                # No full-width solid side spans the space between corner posts.
                self.assertLess(np.max(np.linalg.norm(walls[:, 1, :2] - walls[:, 0, :2], axis=1)), 1.)

    def test_greenhouses_have_glass_walls_and_roofs_without_office_bands(self):
        spec = plan('greenhouse')
        self.assertEqual(bld.LOOKS[spec.facade][0], bld.SURFACE_MATERIALS['ghg'])
        self.assertEqual(bld.LOOKS[spec.roof_mat][0], bld.SURFACE_MATERIALS['rgl'])
        self.assertFalse(spec.windows)
        self.assertGreaterEqual(spec.height, 2.4)

    def test_silos_and_tanks_keep_mapped_outline_and_avoid_wood_defaults(self):
        angles = np.arange(24) * 2 * np.pi / 24
        ring = np.c_[np.cos(angles), np.sin(angles)] * 3.
        for kind in ('silo', 'grain_silo', 'storage_tank'):
            spec = plan(kind, ring, height=15.)
            self.assertEqual(bld.LOOKS[spec.facade][0], bld.METALWALL)
            self.assertFalse(spec.windows)
            np.testing.assert_allclose(mesh.drawn_ring(spec), ring)
            p, uv, t, *_ = bld.build([(spec, 0., 0.)])
            self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
            self.assertLessEqual(p[:, 2].max(), 15.01)
            self.assertLess(len(t), 250)

    def test_mapped_materials_roofs_and_low_heights_win(self):
        for kind in ('greenhouse', 'storage_tank', 'static_caravan', 'toilets', 'chapel'):
            spec = plan(kind, facade_material='brick', roof_shape='flat', roof_material='concrete')
            self.assertEqual(bld.LOOKS[spec.facade][0], bld.BRICK_WALL)
            self.assertEqual(spec.roof, 'flat')
            self.assertEqual(bld.LOOKS[spec.roof_mat][0], bld.ROOF_FLAT)
        self.assertLessEqual(plan('toilets', height=1.5).height, 1.5)

    def test_rectangular_storage_is_not_forced_into_a_circle(self):
        for kind in ('silo', 'storage_tank'):
            spec = plan(kind, height=12.)
            np.testing.assert_allclose(mesh.drawn_ring(spec), RING)
            self.assertEqual(spec.roof, 'flat')

    def test_shelter_roof_has_both_windings_and_handles_preceding_meshes(self):
        spec = plan('shelter', roof_shape='flat')
        output = bld.build([(plan('house'), 0., 0.), (spec, 0., 0.)])
        p, uv, t = output[:3]
        self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
        faces = p[t]
        roof = faces[np.all(np.isclose(faces[:, :, 2], spec.height), axis=1)]
        normals = np.cross(roof[:, 1] - roof[:, 0], roof[:, 2] - roof[:, 0])[:, 2]
        self.assertTrue((normals > 0).any() and (normals < 0).any())

    def test_caravan_has_light_cladding_and_compact_roof(self):
        spec = plan('static_caravan', height=3.)
        self.assertEqual(bld.LOOKS[spec.facade][0], bld.SURFACE_MATERIALS['vny'])
        self.assertGreaterEqual(spec.height, 2.4)
        self.assertLessEqual(spec.roof_height or 0., .6)

    def test_chapel_tower_is_a_small_roof_turret(self):
        spec = plan('chapel', height=7.)
        output = mesh.Mesh()
        mesh._steeple(output, spec, spec.height, bld._Looks(spec.seed))
        p = output.arrays()[0]
        self.assertLess(p[:, 2].max(), 12.)
        self.assertLess(np.ptp(p[:, 0]), 3.)


if __name__ == '__main__':
    unittest.main()
