"""Deck paint follows collision triangles; separate levels and tunnel openings stay separate."""
import sys
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]
import roadmesh
from roads.bridges import BridgeProfiles
import roads
from roads.tunnels import spare_carriageways
from test_roads import features, FRAME


def top_at(mesh, material, points):
    """Heights of material's actual ENU triangles at points. Pure."""
    p, t, _, mats, indices = mesh
    tri = p[t[indices == mats.index(material)]]
    a = tri[:, 0, :2]
    b, c = tri[:, 1, :2] - a, tri[:, 2, :2] - a
    den = b[:, 0] * c[:, 1] - b[:, 1] * c[:, 0]
    good = np.abs(den) > 1e-10
    tri, a, b, c, den = tri[good], a[good], b[good], c[good], den[good]
    heights = []
    for point in points:
        d = point - a
        u = (d[:, 0] * c[:, 1] - d[:, 1] * c[:, 0]) / den
        v = (b[:, 0] * d[:, 1] - b[:, 1] * d[:, 0]) / den
        inside = (u >= -1e-8) & (v >= -1e-8) & (u + v <= 1 + 1e-8)
        z = tri[:, 0, 2] + u * (tri[:, 1, 2] - tri[:, 0, 2]) + v * (tri[:, 2, 2] - tri[:, 0, 2])
        heights.append(float(z[inside].max()) if inside.any() else np.nan)
    return np.array(heights)


class Markings(unittest.TestCase):
    def test_paint_stays_on_its_own_level(self):
        chunks = []
        for owner, z in [('low', 10.), ('high', 20.)]:
            deck = dict(n=[[0., 0., z], [8., 0., z]], w=10., m='road_asphalt_2lane',
                        deck=True, fixed=True, surface_id=owner, bank=[.014, -.014])
            mark = dict(n=deck['n'], w=.12, m='line_' + owner, fixed=True, surface_id=owner)
            chunks.extend([deck, mark])
        skin = roadmesh.build(None, chunks, None, [0, 0, 0])
        q = np.c_[np.linspace(.1, 7.9, 31), np.zeros(31)]
        low = top_at(skin, 'line_low', q)
        high = top_at(skin, 'line_high', q)
        np.testing.assert_allclose(high - low, 10., atol=1e-8)
        self.assertTrue(((low > 10.) & (low < 10.1)).all())

    def test_banked_deck_keeps_its_planned_axis_between_rows(self):
        c = dict(n=[[0., 0., 10.], [5.6, 0., 10.245]], w=10., m='road_asphalt_2lane',
                 deck=True, fixed=True, bank=[.014, -.014])
        q = np.c_[np.linspace(.01, 5.59, 501), np.zeros(501)]
        top = top_at(roadmesh.deck([c], [0., 0., 0.], parapets=[]), roadmesh.DECK_TOP, q)
        np.testing.assert_allclose(top, 10. + q[:, 0] * .245 / 5.6, atol=1e-8)

    def check_bank(self, bank):
        deck = dict(n=[[0, 0, 10], [5.6, 0, 10.245]], w=10., m='road_asphalt_2lane',
                    deck=True, fixed=True, bank=bank)
        mark = dict(n=deck['n'], w=.12, m='line_white', fixed=True)
        slab = roadmesh.deck([deck], [0, 0, 0], parapets=[])
        skin = roadmesh.build(None, [deck, mark], None, [0, 0, 0])
        q = np.c_[np.linspace(.01, 5.59, 501), np.zeros(501)]
        line = top_at(skin, 'line_white', q)
        top = top_at(slab, roadmesh.DECK_TOP, q)
        asphalt = top_at(skin, 'road_asphalt_2lane', q)
        self.assertTrue(np.isfinite(line + top + asphalt).all())
        self.assertGreater(float((line - top).min()), 0., 'marking penetrates collision deck')
        self.assertGreater(float((line - asphalt).min()), 0., 'marking penetrates visible asphalt')

    def test_constant_bank_control(self):
        self.check_bank([.014, .014])

    def test_changing_bank(self):
        self.check_bank([.014, -.014])


class EndConnections(unittest.TestCase):
    def pairs(self, levels):
        lines = [np.array([[0., -100], [0, 0]]), np.array([[0., 0], [0, 100]]),
                 np.array([[3.3, 0], [3.3, 100]])]
        # These helpers need no provider state. Call the real production methods, including native kernels.
        profiles = BridgeProfiles.__new__(BridgeProfiles)
        return profiles._end_join_pairs(lines, [5., 5., 5.], {}, levels)

    def test_same_level_control(self):
        self.assertEqual(self.pairs([1, 1, 1]), [(0, 2), (1, 2)])

    def test_separate_upper_carriageway(self):
        self.assertEqual(self.pairs([1, 1, 2]), [], 'XY proximity alone must not join the upper road')


class TerrainOwnership(unittest.TestCase):
    def test_portal_apron_clears_terrain_across_its_width_but_not_an_upper_road(self):
        part = ('tube', roads.Spec(8., 'paved', False, 'primary', False),
                np.array([[0., 0.], [20., 0.]]), np.zeros(2), 0.)
        q = np.array([[22., 3.], [22., -3.], [22., 6.], [22., 0.]])
        result = roads.portal_ground(q, np.array([1., 1., 1., 6.]), [part])
        self.assertLessEqual(result[0], .04)
        self.assertLessEqual(result[1], .04)
        np.testing.assert_array_equal(result[2:], [1., 6.])

    def test_another_roads_margin_cannot_fill_the_tunnel_carriageway(self):
        part = ('tube', roads.Spec(6., 'paved', False, 'primary', False),
                np.array([[-20., 0.], [20., 0.]]), np.zeros(2), 0.)
        other = features([[(0, -30), (0, 30)]], ['primary'], widths=[(0, 6.)])
        mask = np.zeros((11, 11), bool)
        mask[5, 5] = mask[9, 5] = True  # centre and outside the tunnel footprint
        result = spare_carriageways(mask, [part], [other], FRAME, 1., 1., 2.)
        self.assertTrue(result[5, 5], 'an existing clearance hole inside the tube must remain')
        self.assertFalse(result[9, 5], 'the neighbouring road outside the tube stays supported')

    def test_under_deck_keeps_a_separate_upper_level(self):
        part = (np.array([[0., 0.], [20., 0.]]), np.zeros(2), 4.)
        q = np.array([[10., 0.], [10., 1.]])
        result = roads.under_deck_ground(q, np.array([.16, 6.]), [part], [None], max_drop=4.)
        self.assertLessEqual(result[0], 0.)
        self.assertEqual(result[1], 6.)


if __name__ == '__main__':
    unittest.main(verbosity=2)
