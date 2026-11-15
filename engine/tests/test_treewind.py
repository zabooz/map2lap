"""TreeFX wood samples the wind bend without adding lighting seams to spruce/larch needles."""
import io
from pathlib import Path
import random
import sys
import tempfile
import unittest
import zipfile
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import seasons
from scenery import treefx, treewind


class WindTest(unittest.TestCase):
    def test_only_the_top_needle_hem_sits_lower_while_its_tip_stays_at_full_height(self):
        for name, tiers in (('spruce', 9), ('larch', 8)):
            treefx.base_model(name)
            treefx.model.cache_clear()
            with mock.patch.object(treefx, '_tier', wraps=treefx._tier) as draw:
                treefx.model(name)
            offset = 0
            for lod, count in enumerate((tiers, tiers, 5)):
                with self.subTest(name=name, lod=lod):
                    calls = draw.call_args_list[offset:offset + count]
                    top = calls[-1].args
                    self.assertAlmostEqual(top[2], 14 * .78 - 14 * .34 / (tiers - 1) - 1.5)
                    self.assertAlmostEqual(top[3], 14.)
                offset += count

    def test_original_atlas_and_lower_needle_tiers_are_retained(self):
        for name in ('spruce', 'larch', 'fir'):
            texture, old = treefx.base_model(name)
            current_texture, current = treefx.model(name)
            np.testing.assert_array_equal(np.asarray(current_texture), np.asarray(texture))
            for lod, (before, after) in enumerate(zip(old, current)):
                def needles(mesh, end=None):
                    return {tuple(np.round((*p, *n, *uv), 7)) for p, n, uv in zip(mesh.p[:end], mesh.n[:end], mesh.uv[:end])
                            if uv[0] < .5 and uv[1] > .5}
                upper = (7, 5, 4)[lod] * 4 if name in ('spruce', 'larch') else 0
                self.assertTrue(needles(before, len(before.p) - upper) <= needles(after), name)

    def test_original_shadow_bake_and_unpadded_model_dimensions_are_restored(self):
        for name in ('spruce', 'larch', 'birch'):
            with zipfile.ZipFile(io.BytesIO(treefx.bin_bytes(name))) as z:
                basic = treefx._ini(z.read('tree.ini').decode())['BASIC']
                self.assertEqual((float(basic['HEIGHT']), float(basic['WIDTH'])), treefx.size(name))
                self.assertEqual(z.read(f'{name}_lod0.mesh')[4], 0)

    def test_conifer_trunks_end_in_a_point_and_keep_their_lower_taper(self):
        for name in ('spruce', 'larch', 'fir'):
            height, _ = treefx.size(name)
            radius = .23 if name == 'fir' else .2
            top = 15.8 if name == 'fir' else height * .9
            for lod, mesh in enumerate(treefx.model(name)[1]):
                with self.subTest(name=name, lod=lod):
                    p, uv = np.asarray(mesh.p), np.asarray(mesh.uv)
                    wood = p[(uv >= .5).all(axis=1)]
                    tip = wood[np.isclose(wood[:, 1], top)]
                    self.assertGreater(len(tip), 0)
                    np.testing.assert_allclose(tip[:, [0, 2]], 0, atol=1e-8)
                    foot = wood[np.isclose(wood[:, 1], 0)]
                    self.assertAlmostEqual(np.linalg.norm(foot[:, [0, 2]], axis=1).max(), radius)
                    # The original bole below the thin leader still reaches its old radius.
                    y = height * .5
                    ring = wood[np.isclose(wood[:, 1], y)]
                    old_tip_radius = .035 if name == 'fir' else radius * .3
                    expected = radius + (old_tip_radius - radius) * y / top
                    self.assertAlmostEqual(np.linalg.norm(ring[:, [0, 2]], axis=1).max(), expected)


    def test_wood_and_supported_needles_sample_height_bands_in_every_exported_lod(self):
        for name in treefx.MODELS.keys() - treefx.BUSHES:
            tree = treefx.read_bin(io.BytesIO(treefx.bin_bytes(name)))
            self.assertLessEqual(len(tree['lods'][0]['parts'][0]['indices']) // 3, 900)
            for lod, mesh in enumerate(tree['lods']):
                with self.subTest(name=name, lod=lod):
                    part = mesh['parts'][0]
                    y = part['pos'][:, 1] / tree['height']
                    indices = part['indices'].reshape(-1, 3)
                    uv = part['uv'][indices]
                    selected = (uv >= .5).all(axis=(1, 2))
                    if name in ('fir', 'cypress'):
                        selected |= ((uv[:, :, 0] < .5) & (uv[:, :, 1] > .5)).all(axis=1)
                    triangles = y[indices[selected]]
                    # With eight shared bands, linear interpolation of a quadratic bend differs
                    # by at most 1/256 of tip sway (under 8 mm for a 2 m tip displacement).
                    for low, high in zip(triangles.min(axis=1), triangles.max(axis=1)):
                        boundaries = np.arange(1, 8) / 8
                        self.assertFalse(((boundaries > low + 1e-6) & (boundaries < high - 1e-6)).any(),
                                         f'{name} LOD {lod}: face spans {low:.3f}..{high:.3f}')


    def test_spruce_and_larch_export_original_needle_faces_without_height_cuts(self):
        for name in ('spruce', 'larch'):
            seed, make = treefx.MODELS[name]
            _, original = make(random.Random(seed), seed, pointed=True, inset_tip=True)
            exported = treefx.read_bin(io.BytesIO(treefx.bin_bytes(name)))
            for lod, (before, after) in enumerate(zip(original, exported['lods'])):
                with self.subTest(name=name, lod=lod):
                    part = after['parts'][0]
                    old_triangles = np.asarray(before.t)
                    new_triangles = part['indices'].reshape(-1, 3)
                    old_uv = np.asarray(before.uv)[old_triangles]
                    new_uv = part['uv'][new_triangles]
                    old_needles = ((old_uv[:, :, 0] < .5) & (old_uv[:, :, 1] > .5)).all(axis=1)
                    new_needles = ((new_uv[:, :, 0] < .5) & (new_uv[:, :, 1] > .5)).all(axis=1)
                    self.assertEqual(new_needles.sum(), old_needles.sum(), 'Extra needle faces cause CSP lighting bands')
                    for old_values, key in ((before.p, 'pos'), (before.n, 'normals'), (before.uv, 'uv')):
                        np.testing.assert_allclose(part[key][new_triangles[new_needles]],
                                                   np.asarray(old_values)[old_triangles[old_needles]], atol=1e-6)

    def test_subdivision_preserves_rest_surface_winding_uvs_and_source(self):
        mesh = treefx.Mesh()
        mesh.p = [(0., 0., 0.), (1., 1., 0.), (0., 1., 1.)]
        normal = treefx.unit(np.cross(np.subtract(mesh.p[1], mesh.p[0]), np.subtract(mesh.p[2], mesh.p[0])))
        mesh.n = [tuple(normal)] * 3
        mesh.uv = [(.6, .6), (.9, .6), (.6, .9)]
        mesh.t = [(0, 1, 2)]
        before = {key: list(getattr(mesh, key)) for key in ('p', 'n', 'uv', 't')}
        split = treewind.subdivide(mesh, 1.)
        p, uv, t = map(np.asarray, (split.p, split.uv, split.t))
        np.testing.assert_allclose(p[:, 1], p[:, 0] + p[:, 2], atol=1e-12)
        np.testing.assert_allclose(uv[:, 0], .6 + .3 * p[:, 0])
        np.testing.assert_allclose(uv[:, 1], .6 + .3 * p[:, 2])
        areas = np.cross(p[t[:, 1]] - p[t[:, 0]], p[t[:, 2]] - p[t[:, 0]])
        self.assertTrue(((areas @ normal) > 0).all())
        np.testing.assert_allclose(areas.sum(axis=0), [1, -1, 1])
        np.testing.assert_allclose(split.n, np.tile(normal, (len(p), 1)))
        for key, values in before.items():
            self.assertEqual(getattr(mesh, key), values)

    def test_play_replaces_experimental_models_and_old_library_aliases_in_the_same_season(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            trees = root / 'extension/trees'
            trees.mkdir(parents=True)
            for filename, species, version in (('spruce.bin', 'spruce', 6), ('larch.bin', 'larch', 10),
                                               ('m2l_tree_alias.bin', 'birch', 2)):
                with zipfile.ZipFile(io.BytesIO(treefx.bin_bytes(species))) as source:
                    with zipfile.ZipFile(trees / filename, 'w') as target:
                        for item in source.infolist():
                            data = source.read(item)
                            if item.filename == 'tree.ini':
                                data = data.replace(f'TREE_FORMAT={treefx.TREE_FORMAT}'.encode(),
                                                    f'TREE_FORMAT={version}'.encode())
                            target.writestr(item, data)
            seasons.install(root, 'summer')
            for path in trees.glob('*.bin'):
                self.assertEqual(treefx.read_bin(path)['seasonal']['format'], treefx.TREE_FORMAT)

    def test_unmarked_needle_models_upgrade_without_changing_their_painted_crown(self):
        for name in ('spruce', 'larch', 'fir'):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                trees = root / 'extension/trees'
                trees.mkdir(parents=True)
                path = trees / 'legacy_library_alias.bin'
                treefx.bin_bytes.cache_clear()
                treefx.season_texture.cache_clear()
                try:
                    with mock.patch.object(treefx, 'model', treefx.base_model):
                        old = treefx.bin_bytes(name)
                finally:
                    treefx.bin_bytes.cache_clear()
                    treefx.season_texture.cache_clear()
                with zipfile.ZipFile(io.BytesIO(old)) as source, zipfile.ZipFile(path, 'w') as target:
                    for item in source.infolist():
                        data = source.read(item)
                        if item.filename == 'tree.ini':
                            data = data.split(b'\n[MAP2LAP]')[0]
                        target.writestr(item, data)
                old_count = len(treefx.read_bin(path)['lods'][0]['parts'][0]['indices'])
                seasons.install(root, 'summer')
                updated = treefx.read_bin(path)
                self.assertEqual(updated['seasonal']['species'], name)
                self.assertEqual(updated['seasonal']['format'], treefx.TREE_FORMAT)
                self.assertGreater(len(updated['lods'][0]['parts'][0]['indices']), old_count)


if __name__ == '__main__':
    unittest.main()
