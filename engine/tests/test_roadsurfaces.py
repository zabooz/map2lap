"""Smooth road crosses structures without moving terrain or other levels at their projection."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
import generator  # sets the engine import path
from app import roadnet, roadregion, trackheights
from track import kn5, editorinfo
from test_roadregion import road, lattice_track


def structured_track(test, kind):
    before = road('before', [[0, 0], [40, 0]])
    span = road('span', [[40, 0], [80, 0]], layer='1' if kind == 'bridge' else '-1')
    span['tags'][kind] = 'yes'
    after = road('after', [[80, 0], [120, 0]])
    path, _ = lattice_track(test, [before, span, after], lambda x, z: 100 + np.zeros_like(x), (-20, 142), (-20, 22))
    data = kn5.read(path)
    # Remove the driving road inside the span; retain a different ground level under/over it.
    for m in data['root'].children:
        m.vertices = m.vertices.copy()
        p = m.vertices['pos']; faces = m.indices.reshape(-1, 3)
        middle = p[faces][:, :, 0].mean(axis=1)
        under = (p[:, 0] > 40) & (p[:, 0] < 80)
        p[under, 1] = 80 if kind == 'bridge' else 120
        if m.name.startswith('1ROAD'):
            m.indices = faces[(middle <= 40) | (middle >= 80)].ravel()
    x, z = np.meshgrid(np.arange(40, 82, 2), np.arange(-4, 6, 2))
    v = np.zeros(x.size, kn5.VERTEX)
    v['pos'] = np.c_[x.ravel(), (100 + 1.5 * np.sin((x - 40) * np.pi / 40)).ravel(), z.ravel()]
    v['normal'][:, 1] = 1; v['tangent'][:, 0] = 1
    rows, cols = x.shape
    a = (np.arange(rows - 1)[:, None] * cols + np.arange(cols - 1)).ravel()
    faces = np.concatenate([np.c_[a, a + cols, a + 1], np.c_[a + 1, a + cols, a + cols + 1]])
    data['root'].children.append(kn5.Node(2, '1WALL_deck_con_0_0' if kind == 'tunnel' else '1ROAD_deck_0_0', 1, vertices=v, indices=faces.astype('<u2').ravel(), material=0,
                                         bs_center=(60., 100., 0.), bs_radius=100.))
    if kind == 'tunnel':
        roof = v.copy(); roof['pos'][:, 1] += 6
        data['root'].children.append(kn5.Node(2, '1WALL_tunnel_0_0', 1, vertices=roof, indices=faces.astype('<u2').ravel(), material=0,
                                             bs_center=(60., 106., 0.), bs_radius=100.))
    kn5.write(path, data['textures'], data['materials'], data['root'])
    editorinfo.install(path, [str(p).replace('.editor.zip', '.obj') for p in Path(path).parent.glob('*.editor.zip')])
    return path, kn5.scan(path), len(data['root'].children) - (2 if kind == 'tunnel' else 1)


class StructureSmoothingTest(unittest.TestCase):
    def test_short_bridge_and_tunnel_smooth_across_the_whole_span(self):
        for kind in ('bridge', 'tunnel'):
            with self.subTest(kind=kind):
                self.smooth(kind, [[10, 0], [110, 0]])

    def test_each_end_of_a_long_structure_can_be_smoothed_separately(self):
        for kind in ('bridge', 'tunnel'):
            for points in ([[10, 0], [65, 0]], [[55, 0], [110, 0]]):
                with self.subTest(kind=kind, points=points):
                    self.smooth(kind, points)

    def test_a_second_deck_at_the_same_projection_stays_fixed(self):
        path, scan, deck = structured_track(self, 'bridge')
        data = kn5.read(path)
        other = data['root'].children[deck]
        import copy
        upper = copy.deepcopy(other)
        upper.name = '1ROAD_deck_0_0_1'
        upper.vertices = upper.vertices.copy()
        upper.vertices['pos'][:, 1] += 15
        data['root'].children.append(upper)
        kn5.write(path, data['textures'], data['materials'], data['root'])
        editorinfo.install(path, [str(p).replace('.editor.zip', '.obj') for p in Path(path).parent.glob('*.editor.zip')])
        scan = kn5.scan(path)
        net = roadregion.mapped(path, [[10, 0], [110, 0]])
        op, _ = roadnet.change_of(path, scan, None, net, roadregion.selection(path, net), 6, 1, 's')
        changed = trackheights.moved(path, scan, {}, [op])
        self.assertIn(deck, changed.vertices)
        self.assertFalse(deck + 1 in changed.vertices)

    def test_lowering_a_bridge_cannot_consume_an_already_tight_crossing_clearance(self):
        path, scan, deck = structured_track(self, 'bridge')
        data = kn5.read(path)
        import copy
        lower = copy.deepcopy(data['root'].children[deck])
        lower.name = '1ROAD_deck_0_0_1'
        lower.vertices = lower.vertices.copy()
        lower.vertices['pos'][:, 1] -= 3
        data['root'].children.append(lower)
        kn5.write(path, data['textures'], data['materials'], data['root'])
        editorinfo.install(path, [str(p).replace('.editor.zip', '.obj') for p in Path(path).parent.glob('*.editor.zip')])
        scan = kn5.scan(path)
        net = roadregion.mapped(path, [[10, 0, 100], [110, 0, 100]])
        net['crossings'] = [{'a': [60, -40], 'b': [60, 40], 'width': 8, 'structure': ''}]
        with self.assertRaisesRegex(ValueError, 'clearance'):
            roadnet.change_of(path, scan, None, net, roadregion.selection(path, net), 6, 1, 's')

    def test_a_skewed_deck_end_follows_the_same_field_as_its_approach(self):
        from app import roadsurfaces
        path, scan, deck = structured_track(self, 'bridge')
        data = kn5.read(path)
        node = data['root'].children[deck]
        node.vertices = node.vertices.copy()
        first = node.vertices['pos'][:, 0] == 40
        node.vertices['pos'][first, 0] += node.vertices['pos'][first, 2] * .1
        kn5.write(path, data['textures'], data['materials'], data['root'])
        scan = kn5.scan(path)
        net = roadregion.network([road('before', [[0, 0], [40, 0]]),
                                  {**road('span', [[40, 0], [80, 0]]), 'tags': {'bridge': 'yes'}},
                                  road('after', [[80, 0], [120, 0]])], [[10, 0], [110, 0]])
        grid, i0, j0 = roadsurfaces.ground(path, scan, None, np.array([[0, -20], [120, 20]]), net)
        mm = np.zeros((21, 61), int); mm[1:-1, 1:-1] = 500
        op = {'id': 'skew', 'x': 0, 'z': -20, 'nx': 61, 'nz': 21, 'mm': mm.ravel().tolist()}
        scoped = roadsurfaces.scope(path, scan, None, net, op, grid, i0, j0)
        changed = trackheights.moved(path, scan, {}, [scoped])
        np.testing.assert_allclose(changed.vertices[deck]['pos'][first, 1] - node.vertices['pos'][first, 1], .5, atol=.001)

    def test_selection_highlights_the_asphalt_skin_above_the_collision_floor(self):
        import copy
        path, scan, deck = structured_track(self, 'bridge')
        data = kn5.read(path)
        skin = copy.deepcopy(data['root'].children[deck])
        skin.name = 'nocol_road_asphalt_2lane_0_0'
        skin.vertices = skin.vertices.copy()
        skin.vertices['pos'][:, 1] += .01
        data['root'].children.append(skin)
        kn5.write(path, data['textures'], data['materials'], data['root'])
        editorinfo.install(path, [str(p).replace('.editor.zip', '.obj') for p in Path(path).parent.glob('*.editor.zip')])
        net = roadregion.mapped(path, [[10, 0], [110, 0]])
        selected = roadregion.selection(path, net)
        self.assertTrue(any(m['mesh'] == deck + 1 for m in selected['meshes']))

    def smooth(self, kind, points):
        path, scan, deck = structured_track(self, kind)
        net = roadregion.mapped(path, points)
        region = roadregion.selection(path, net)
        self.assertTrue(any(m['mesh'] == deck for m in region.get('meshes', [])))
        op, _ = roadnet.change_of(path, scan, None, net, region, 6, 1, 'smooth')
        self.assertIsNone(trackheights.problem(op))
        moved = trackheights.moved(path, scan, {}, [op])
        self.assertIn(deck, moved.vertices)
        with open(path, 'rb') as f:
            source, _ = kn5.mesh_arrays(f, scan['meshes'][deck])
            self.assertGreater(np.max(np.abs(moved.vertices[deck]['pos'][:, 1] - source['pos'][:, 1])), .05)
            for i, m in enumerate(scan['meshes'][:deck]):
                before, _ = kn5.mesh_arrays(f, m)
                under = (before['pos'][:, 0] > 42) & (before['pos'][:, 0] < 78)
                np.testing.assert_array_equal(moved.vertices.get(i, before)['pos'][under], before['pos'][under])
        if kind == 'tunnel':
            np.testing.assert_allclose(moved.vertices[deck + 1]['pos'][:, 1] - moved.vertices[deck]['pos'][:, 1], 6, atol=2e-5)


if __name__ == '__main__':
    unittest.main()
