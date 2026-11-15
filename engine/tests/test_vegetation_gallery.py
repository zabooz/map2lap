"""The vegetation lab covers every generator look and retains real TreeFX placements."""
from pathlib import Path
import sys
import unittest
import tempfile

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'tools'), str(ROOT / 'src'), str(ROOT / 'engine')]
import vegetation_gallery as gallery
from scenery import trees, treefx, groundcover, ground
from track import objectlist


class VegetationGalleryTest(unittest.TestCase):
    def test_every_generated_ground_texture_and_road_class_is_shown(self):
        with tempfile.TemporaryDirectory() as folder:
            generated = set(groundcover.make_textures(folder))
        cases = gallery.cases()
        self.assertEqual({c['material'] for c in cases if c['kind'] == 'ground'}, generated)
        self.assertEqual({c['road_class'] for c in cases if c['kind'] == 'road'}, set(ground.ROAD_LOOKS))
        shown = {c.get('material') for c in cases}
        self.assertTrue({'sidewalk', 'kerbstone', 'ballast', 'concrete', 'cobble', 'dirt',
                         'asphalt', 'edge_dirt', 'stream_bank', 'stream_bed', 'rock_face'} <= shown)
        self.assertEqual(len(shown - {None}), len([c for c in cases if 'material' in c]))

    def test_every_sprite_and_model_is_present(self):
        cases = gallery.cases()
        species = [c for c in cases if c['kind'] == 'species']
        self.assertEqual({c['sprite'] for c in species}, set(trees.SPRITES))
        self.assertEqual({c['model'] for c in species}, set(treefx.MODELS))
        self.assertEqual(len(species), len(trees.SPRITES))

    def test_all_climate_styles_and_vegetated_ground_samples_are_present(self):
        cases = gallery.cases()
        self.assertEqual({c['zone'] for c in cases if c['kind'] == 'mix'}, {'temperate', *trees.ZONE_STYLE})
        ground = {c['material'] for c in cases if c['kind'] == 'ground'}
        self.assertTrue({'gc_meadow', 'gc_forest', 'gc_shrub', 'gc_wetland', 'gc_alpine', 'gc_lawn',
                         'gc_orchard', 'gc_vineyard', 'gc_garden', 'gc_cemetery', 'gc_residential'} <= ground)
        self.assertTrue({f'gc_field{i}' for i in range(6)} <= ground)

    def test_placements_are_valid_deterministic_and_in_their_own_plot(self):
        for i, case in enumerate(gallery.cases()):
            rows = gallery.placements(case, i)
            self.assertEqual(rows, gallery.placements(case, i))
            if case['kind'] == 'species':
                self.assertEqual(len(rows), 3)
                self.assertEqual(len({r['size'] for r in rows}), 3)
            x, y = gallery.case_position(i)
            for row in rows:
                self.assertIsNone(objectlist.tree_problem(row))
                self.assertLessEqual(abs(row['pos'][0] - x), 24.)
                self.assertLessEqual(abs(-row['pos'][2] - y), 24.)
                self.assertEqual(row, treefx.parse(treefx.text(row)))


if __name__ == '__main__':
    unittest.main()
