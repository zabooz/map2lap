"""Owned TreeFX AO is softened per model and rebaked when its setting changes."""
import io
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import seasons
from scenery import treefx


class TreeAOTest(unittest.TestCase):
    def test_only_owned_tree_models_request_the_milder_native_ao_bake(self):
        for name in treefx.MODELS:
            with self.subTest(name=name), zipfile.ZipFile(io.BytesIO(treefx.bin_bytes(name))) as model:
                ini = treefx._ini(model.read('tree.ini').decode())
                if name in treefx.BUSHES:
                    self.assertNotIn('BAKING', ini)
                else:
                    self.assertEqual(float(ini['BAKING']['AO_OPACITY']), .75)
                    self.assertEqual(float(ini['BAKING'].get('AO_EXP', '1')), 1.)
                # Native CSP performs the bake; we do not supply a fixed replacement AO value.
                for lod in range(3):
                    self.assertEqual(model.read(f'{name}_lod{lod}.mesh')[4], 0)

    def test_play_replaces_previously_baked_format_seven_models_and_keeps_custom_files(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            trees = root / 'extension/trees'
            trees.mkdir(parents=True)
            for filename, species in (('spruce.bin', 'spruce'), ('m2l_tree_alias.bin', 'birch')):
                with zipfile.ZipFile(io.BytesIO(treefx.bin_bytes(species))) as source:
                    with zipfile.ZipFile(trees / filename, 'w') as target:
                        for item in source.infolist():
                            data = source.read(item)
                            if item.filename == 'tree.ini':
                                data = data.replace(f'TREE_FORMAT={treefx.TREE_FORMAT}'.encode(), b'TREE_FORMAT=7')
                            elif item.filename.endswith('.mesh'):
                                data = data[:4] + b'\x01' + data[5:]
                            target.writestr(item, data)
            custom = trees / 'custom.bin'
            custom.write_bytes(b'foreign custom tree')
            seasons.install(root, 'summer')
            self.assertEqual(custom.read_bytes(), b'foreign custom tree')
            for filename in ('spruce.bin', 'm2l_tree_alias.bin'):
                with zipfile.ZipFile(trees / filename) as model:
                    ini = treefx._ini(model.read('tree.ini').decode())
                    self.assertEqual(int(ini['MAP2LAP']['TREE_FORMAT']), treefx.TREE_FORMAT)
                    self.assertEqual(float(ini['BAKING']['AO_OPACITY']), .75)
                    for lod in range(3):
                        raw = model.read(f"{ini['MAP2LAP']['SPECIES']}_lod{lod}.mesh")
                        self.assertEqual(raw[4], 0, 'Previously baked AO must be computed again by CSP')


if __name__ == '__main__':
    unittest.main()
