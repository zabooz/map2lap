"""Regional tree and bush silhouettes, valid portable LODs and complete sprite coverage."""
import hashlib
import os
import sys
import tempfile
import unittest
import zipfile

import numpy as np

sys.path[:0] = [os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "src"))]
from scenery import treefx, trees  # noqa: E402
from test_treefx import read_mesh  # noqa: E402

NEW = ("fir", "pine", "stone_pine", "cypress", "olive", "acacia", "baobab", "palm", "tropical", "juniper", "dry_shrub", "jungle_bush")


class SpeciesTest(unittest.TestCase):
    def test_fir_has_its_own_dense_crown_and_retains_needles_in_every_season(self):
        self.assertEqual(treefx.model_of('fir'), 'fir')
        texture, lods = treefx.model('fir')
        self.assertNotIn('fir', treefx.DECIDUOUS)
        for season in ('spring', 'summer', 'autumn', 'winter'):
            np.testing.assert_array_equal(np.asarray(treefx.season_texture('fir', season)), np.asarray(texture))
        self.assertNotEqual(lods[0].p, treefx.model('spruce')[1][0].p)
        self.assertGreater(treefx.size('fir')[0], 12)
        self.assertGreater(float((np.asarray(texture)[256:, :256, 3] > 128).mean()), .2)

    def test_every_generated_tree_and_bush_has_a_3d_form_including_each_climate_zone(self):
        for sprite in trees.SPRITES:
            with self.subTest(sprite=sprite):
                self.assertIn(treefx.model_of(sprite), treefx.MODELS)
        for style in (trees.STYLE, *trees.ZONE_STYLE.values()):
            for looks in style.values():
                for sprite, _ratio in looks:
                    self.assertIsNotNone(treefx.model_of(sprite), sprite)

    def test_the_new_species_have_their_own_models_instead_of_another_species_s_shape(self):
        for name in NEW:
            with self.subTest(name=name):
                self.assertEqual(name, treefx.model_of(name))

    def test_each_new_model_has_finite_geometry_unit_normals_and_three_decreasing_lods(self):
        for name in NEW:
            with self.subTest(name=name):
                texture, lods = treefx.model(name)
                self.assertEqual((512, 512), texture.size)
                self.assertEqual(3, len(lods))
                counts = [len(m.t) for m in lods]
                self.assertGreater(counts[0], counts[1])
                self.assertGreater(counts[1], counts[2])
                self.assertLessEqual(counts[0], 300)       # simple instanced scenery, not a detailed leaf-by-leaf model
                for mesh in lods:
                    p, n, uv, t = map(np.asarray, (mesh.p, mesh.n, mesh.uv, mesh.t))
                    self.assertTrue(np.isfinite(p).all() and np.isfinite(n).all())
                    np.testing.assert_allclose(np.linalg.norm(n, axis=1), 1, atol=1e-6)
                    self.assertGreaterEqual(float(p[:, 1].min()), -1e-6)
                    self.assertGreaterEqual(int(t.min()), 0)
                    self.assertLess(int(t.max()), len(p))
                    self.assertTrue(((uv >= 0) & (uv <= 1)).all())

    def test_characteristic_shapes_keep_the_column_umbrella_and_bottle_trunk(self):
        height, width = treefx.size("cypress")
        self.assertLess(width / height, .4)
        for name in ("stone_pine", "acacia"):
            height, width = treefx.size(name)
            self.assertGreater(width / height, .85, name)
        for name in ("dry_shrub", "jungle_bush"):
            self.assertLess(treefx.size(name)[0], 3, name)
        p = np.asarray(treefx.model("baobab")[1][0].p)
        self.assertGreater(np.ptp(p[p[:, 1] < .001, 0]), 1.5)

    def test_curved_trunk_sections_share_their_rings_without_cracks(self):
        for lod, sides in enumerate((6, 5, 4)):
            mesh = treefx.Mesh()
            treefx._stem(mesh, [(0, 0, 0), (.3, 2, .1), (.1, 4, -.2), (.5, 6, 0)], [.4, .35, .25, .1], lod)
            count = 2 if lod == 2 else 3
            sections = np.asarray(mesh.p[:count * sides * 4]).reshape(-1, sides, 4, 3)
            for a, b in zip(sections, sections[1:]):
                top = {tuple(v) for v in np.round(a[:, 2:4].reshape(-1, 3), 6)}
                bottom = {tuple(v) for v in np.round(b[:, :2].reshape(-1, 3), 6)}
                self.assertEqual(top, bottom, lod)

    def test_small_painted_leaves_still_form_filled_crown_clumps(self):
        for name in ("pine", "stone_pine", "olive", "acacia", "baobab", "tropical"):
            alpha = np.asarray(treefx.model(name)[0])[12:244, 12:244, 3]
            self.assertGreater(float((alpha > 128).mean()), .45, name)

    def test_bottle_trunk_is_closed_at_both_ends_as_well_as_its_bends(self):
        mesh = treefx.Mesh()
        treefx._stem(mesh, [(0, 0, 0), (.3, 2, .1), (.1, 4, -.2)], [.8, 1, .3], 0)
        p = np.round(np.asarray(mesh.p), 7)
        edges = {}
        for tri in mesh.t:
            a, b, c = p[list(tri)]
            if np.linalg.norm(np.cross(b - a, c - a)) < 1e-8:
                continue
            for i, j in ((0, 1), (1, 2), (2, 0)):
                edge = tuple(sorted((tuple(p[tri[i]]), tuple(p[tri[j]]))))
                edges[edge] = edges.get(edge, 0) + 1
        self.assertEqual({2}, set(edges.values()))

    def test_the_species_export_as_distinct_deterministic_tree_archives(self):
        with tempfile.TemporaryDirectory() as folder:
            contents = set()
            for name in NEW:
                with self.subTest(name=name):
                    path = os.path.join(folder, name + ".bin")
                    treefx.write_bin(path, name)
                    with open(path, "rb") as stream:
                        first = stream.read()
                    treefx.write_bin(path, name)
                    with open(path, "rb") as stream:
                        self.assertEqual(first, stream.read())
                    contents.add(hashlib.sha256(first).hexdigest())
                    with zipfile.ZipFile(path) as archive:
                        for lod in range(3):
                            self.assertEqual(([name + "_d.png", name + "_n.png"], 1),
                                             read_mesh(self, archive.read(f"{name}_lod{lod}.mesh")))
            self.assertEqual(len(NEW), len(contents))


if __name__ == "__main__":
    unittest.main()
