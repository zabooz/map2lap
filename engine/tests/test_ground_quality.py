"""HD keeps source detail, mapped masks and terrain physics through the actual KN5 conversion."""
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'src'), str(ROOT / 'engine')]
from track import editorinfo, groundmaterial, kn5, make_obj, obj_to_kn5


class GroundQualityTest(unittest.TestCase):
    def test_hd_conversion_preserves_geometry_base_and_road_masks(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            part = root / 't_-2_3.obj'
            p = np.array([[-512., 768., 0.], [-256., 768., 0.], [-256., 1024., 0.], [-512., 1024., 0.]])
            obj = make_obj.Obj(str(part))
            obj.add('1ROAD_ground_-2_3', 'ground_-2_3', p, p[:, :2] / 256 * groundmaterial.UV_SCALE,
                    np.array([[0, 1, 2], [0, 2, 3]]))
            obj.close()
            Image.new('RGB', (64, 64), (90, 110, 80)).save(root / 'ground_-2_3.jpg')
            part.with_suffix('.mtl').write_text('newmtl ground_-2_3\nmap_Kd ground_-2_3.jpg\n')
            paint = editorinfo.Paint(str(part), -2, 3, 64)
            ids = np.broadcast_to(np.arange(64) // 16, (64, 64)).astype(np.uint8)
            paint.base(['gc_meadow', 'gc_forest', 'gc_rock', 'gc_snow'], ids)
            alpha = np.zeros((64, 64), np.uint8); alpha[24:40] = 255
            paint.layer('road_asphalt', alpha)
            paint.finish()
            outputs = {}
            for quality in ('sd', 'hd'):
                anchor = root / (quality + '.json'); anchor.write_text(json.dumps({'ground_quality': quality}))
                path = root / quality / (quality + '.kn5'); path.parent.mkdir()
                obj_to_kn5.convert(str(part), str(path), str(anchor), log=lambda _: None)
                outputs[quality] = kn5.read(path)
                self.assertIsNotNone(editorinfo.manifest(str(path)))
            sd, hd = outputs['sd'], outputs['hd']
            s, h = next(iter(kn5.walk_meshes(sd['root']))), next(iter(kn5.walk_meshes(hd['root'])))
            np.testing.assert_array_equal(s.vertices['pos'], h.vertices['pos'])
            np.testing.assert_array_equal(s.indices, h.indices)
            self.assertEqual(s.renderable, h.renderable)
            material = hd['materials'][h.material]
            maps = {slot: name for slot, _, name in material.maps}
            self.assertEqual(material.shader, groundmaterial.NM4)
            self.assertEqual(maps['txDiffuse'], groundmaterial.WHITE)
            self.assertEqual(maps['txDetailA'], 'ground_-2_3.dds')
            images = {name: data for name, _, data in hd['textures']}
            old = {name: data for name, _, data in sd['textures']}
            self.assertEqual(images['ground_-2_3.dds'], old['ground_-2_3.dds'])
            for channel in 'RGB':
                with Image.open(io.BytesIO(images[maps['txDetail' + channel]])) as image:
                    self.assertEqual(image.size, (512, 512))
            from app import trackview
            preview = trackview._material(material)
            self.assertEqual(len(preview['splat']['images']), 3)
            extent = np.array(preview['splat']['mask_extent'])
            with Image.open(io.BytesIO(images[maps['txMask']])) as image:
                mask = np.asarray(image.convert('RGBA'))
            def sample(x, y):
                # The mask and the native vertex UVs share world phase, including negative tiles.
                uv = np.array([-2 + x / 64, -4 + y / 64]) / extent
                return mask[int((uv[1] % 1) * mask.shape[0]), int((uv[0] % 1) * mask.shape[1])]
            self.assertGreater(sample(8.5, 8.5)[0], 245)
            self.assertGreater(sample(24.5, 8.5)[1], 245)
            self.assertGreater(sample(40.5, 8.5)[2], 245)
            self.assertGreater(sample(56.5, 8.5)[3], 245)  # snow remains the baked base
            self.assertGreater(sample(8.5, 32.5)[3], 245)  # mapped road remains the baked base


if __name__ == '__main__':
    unittest.main()
