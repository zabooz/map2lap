"""Season selection preserves summer geometry and changes only owned TreeFX assets at Play."""
import io
import configparser
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'src'))
from app import seasons, weather
from scenery import treefx


class SeasonTest(unittest.TestCase):
    def test_snow_forces_winter_and_other_weather_keeps_the_selected_season(self):
        for name in ('spring', 'summer', 'autumn', 'winter'):
            self.assertEqual(seasons.resolve(weather.parse({'season': name})), name)
            self.assertEqual(seasons.resolve(weather.parse({'kind': 'snow', 'season': name})), 'winter')

    def test_old_weather_requests_keep_summer_and_unknown_seasons_are_rejected(self):
        self.assertEqual(weather.parse({})['season'], 'summer')
        for value in (None, True, 'fall', 'monsoon'):
            with self.assertRaises(ValueError):
                weather.parse({'season': value})

    def test_my_tracks_play_preserves_the_last_season_and_snow_still_forces_winter(self):
        ini = configparser.ConfigParser()
        ini['LIGHTING'] = {'__MAP2LAP_SEASON': 'autumn', '__CM_WEATHER_TYPE': '15'}
        self.assertEqual(seasons.resolve(weather.scenery_options(ini)), 'autumn')
        ini['LIGHTING']['__CM_WEATHER_TYPE'] = '10'
        self.assertEqual(seasons.resolve(weather.scenery_options(ini)), 'winter')

    def test_original_leaves_and_trunk_are_retained_and_branches_add_no_material(self):
        for name in ('broadleaf', 'birch', 'larch'):
            base_texture, before = treefx.base_model(name)
            texture, after = treefx.model(name)
            np.testing.assert_array_equal(np.asarray(base_texture), np.asarray(texture))
            for old, new in zip(before, after):
                self.assertGreater(len(new.p), len(old.p))
                for key in ('p', 'n', 'uv', 't'):
                    self.assertEqual(getattr(new, key)[:len(getattr(old, key))], getattr(old, key))
                self.assertTrue(np.isfinite(np.asarray(new.p)).all())
            loaded = treefx.read_bin(io.BytesIO(treefx.bin_bytes(name)))
            self.assertTrue(all(len(lod['parts']) == 1 for lod in loaded['lods']))

    def test_summer_and_spring_are_green_and_autumn_leaves_have_warm_colours(self):
        for name in ('broadleaf', 'birch', 'baobab', 'larch'):
            summer = np.asarray(treefx.model(name)[0])
            for season in ('spring', 'summer'):
                np.testing.assert_array_equal(np.asarray(treefx.season_texture(name, season)), summer)
            autumn = np.asarray(treefx.season_texture(name, 'autumn'))
            np.testing.assert_array_equal(autumn[256:, 256:], summer[256:, 256:])
            selected = (summer[..., 3] > 128)
            selected[256:, 256:] = False
            self.assertGreater(autumn[..., 0][selected].mean(), autumn[..., 1][selected].mean())

    def test_winter_hides_deciduous_foliage_but_retains_bark_and_evergreen_alpha(self):
        for name in treefx.DECIDUOUS:
            original = np.asarray(treefx.model(name)[0])
            winter = np.asarray(treefx.season_texture(name, 'winter'))
            np.testing.assert_array_equal(winter[256:, 256:], original[256:, 256:])
            alpha = winter[..., 3].copy(); alpha[256:, 256:] = 0
            self.assertEqual(int(alpha.max()), 0)
        for name in ('spruce', 'pine', 'olive', 'palm', 'tropical'):
            np.testing.assert_array_equal(np.asarray(treefx.season_texture(name, 'winter'))[..., 3],
                                          np.asarray(treefx.model(name)[0])[..., 3])

    def test_play_changes_owned_model_texture_without_changing_its_geometry_or_main_track(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); trees = root / 'extension/trees'; trees.mkdir(parents=True)
            track = root / 'track.kn5'; track.write_bytes(b'unchanged track')
            path = trees / 'birch.bin'; treefx.write_bin(path, 'birch')
            before = treefx.read_bin(path)
            seasons.install(root, 'winter')
            winter = treefx.read_bin(path)
            for a, b in zip(before['lods'], winter['lods']):
                np.testing.assert_array_equal(a['parts'][0]['pos'], b['parts'][0]['pos'])
                np.testing.assert_array_equal(a['parts'][0]['indices'], b['parts'][0]['indices'])
            texture = next(iter(winter['textures'].values()))
            self.assertEqual(np.asarray(Image.open(io.BytesIO(texture)))[0, 0, 3], 0)
            canonical = treefx.canonical_model(path)
            self.assertEqual(canonical['seasonal']['season'], 'summer')
            self.assertEqual(track.read_bytes(), b'unchanged track')
            seasons.install(root, 'summer')
            restored = treefx.read_bin(path)
            self.assertEqual(restored['textures'], before['textures'])

    def test_foreign_model_with_a_known_filename_is_preserved(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); trees = root / 'extension/trees'; trees.mkdir(parents=True)
            foreign = trees / 'birch.bin'; foreign.write_bytes(b'foreign custom model')
            seasons.install(root, 'winter')
            self.assertEqual(foreign.read_bytes(), b'foreign custom model')

    def test_library_alias_uses_species_from_content_and_keeps_snapshot_immutable(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); trees = root / 'extension/trees'; trees.mkdir(parents=True)
            snapshot = root / 'native/model.bin'; snapshot.parent.mkdir()
            treefx.write_bin(snapshot, 'broadleaf')
            original = snapshot.read_bytes()
            alias = trees / ('m2l_tree_' + 'a' * 64 + '.bin'); alias.write_bytes(original)
            seasons.install(root, 'autumn')
            self.assertEqual(treefx.read_bin(alias)['seasonal']['season'], 'autumn')
            self.assertEqual(treefx.canonical_model(alias)['seasonal']['season'], 'summer')
            self.assertEqual(treefx.canonical_model(snapshot)['seasonal']['species'], 'broadleaf')
            self.assertEqual(snapshot.read_bytes(), original)
            self.assertIn(alias.name, (root / 'extension/map2lap_seasons.ini').read_text())

    def test_legacy_library_snapshot_is_recognized_by_exact_geometry_and_atlas(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'model.bin'
            original = treefx.bin_bytes('birch')
            from unittest.mock import patch
            with patch.object(treefx, 'model', treefx.base_model):
                treefx.bin_bytes.cache_clear()
                legacy = treefx.bin_bytes('birch')
            treefx.bin_bytes.cache_clear()
            import zipfile
            with zipfile.ZipFile(io.BytesIO(legacy)) as source, zipfile.ZipFile(path, 'w') as target:
                for item in source.infolist():
                    data = source.read(item)
                    if item.filename == 'tree.ini':
                        data = data.split(b'\n[MAP2LAP]')[0]
                    target.writestr(item, data)
            canonical = treefx.canonical_model(path)
            self.assertEqual(canonical['seasonal']['species'], 'birch')
            self.assertEqual(len(canonical['lods'][0]['parts'][0]['pos']),
                             len(treefx.read_bin(io.BytesIO(original))['lods'][0]['parts'][0]['pos']))


if __name__ == '__main__':
    unittest.main()
