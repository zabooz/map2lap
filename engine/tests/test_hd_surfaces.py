"""HD resolves every baked ground layer and retains detailed standalone road surfaces."""
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'src'), str(ROOT / 'engine')]
from scenery import roadtex
from track import editorinfo


class HDSurfacesTest(unittest.TestCase):
    def test_hd_workers_double_ground_sampling_without_changing_world_uvs(self):
        code = "import json; from scenery import ground; print(json.dumps([ground.TEX_PX,ground.GUARD_PX,ground.CELL,ground.phased_uv([[.2,.3]],[-2,3]).tolist()]))"
        results = {}
        for quality in ('sd', 'hd'):
            env = {**os.environ, 'PYTHONPATH': os.pathsep.join([str(ROOT/'src'), str(ROOT/'engine')]),
                   'BNE_GROUND_QUALITY': quality, 'BNE_AC_GRID_M': '2'}
            results[quality] = json.loads(subprocess.check_output([sys.executable, '-c', code], env=env, text=True))
        self.assertEqual(results['sd'][:2], [2048, 32])
        self.assertEqual(results['hd'][:2], [4096, 64])
        self.assertEqual(results['sd'][2:], results['hd'][2:])

    def test_bankett_is_redrawn_at_higher_resolution_with_same_physical_alpha_pattern(self):
        with tempfile.TemporaryDirectory() as folder:
            sd, hd = Path(folder)/'sd.png', Path(folder)/'hd.png'
            roadtex.make_edge(sd)
            roadtex.make_edge(hd, scale=4)
            with Image.open(sd) as a, Image.open(hd) as b:
                self.assertEqual(b.size, (512, 2048))
                reduced = np.asarray(b.resize(a.size, Image.Resampling.BOX))[..., 3].astype(float)
                self.assertLess(np.mean(abs(reduced - np.asarray(a)[..., 3])), 5.)

    def test_hd_paint_facts_keep_editor_mask_budget_and_soft_coverage(self):
        with tempfile.TemporaryDirectory() as folder:
            part = str(Path(folder)/'t_0_0.obj')
            paint = editorinfo.Paint(part, 0, 0, 64)
            paint.base(['gc_sand'], np.zeros((32,32), np.uint8))
            alpha = np.full((128,128), 128, np.uint8)
            paint.layer('road_gravel', alpha, repeat=4.)
            paint.finish()
            with zipfile.ZipFile(editorinfo.side_file(part)) as archive:
                data = json.loads(archive.read('tile.json'))
                with Image.open(io.BytesIO(archive.read(data['layers'][0]['mask']))) as image:
                    self.assertEqual(image.size, (64,64))
                    self.assertEqual(image.getpixel((16,16)), 128)

if __name__ == '__main__':
    unittest.main()
