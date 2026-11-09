"""Repeating native masks must never mix a tile with its opposite edge."""
import io
import math
from pathlib import Path
import struct
import sys
import unittest
from unittest import mock

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import trackdetail, tracknative
from track import textures
from track import kn5, editorinfo
from app import trackcopy, trackview
import test_trackpaint as fixture


def levels(raw):
    """Decode every legacy RGBA8 DDS level independently. Pure."""
    height, width = struct.unpack_from('<2I', raw, 12)
    masks = struct.unpack_from('<4I', raw, 92)
    offset, result = 128, []
    for _ in range(struct.unpack_from('<I', raw, 28)[0]):
        packed = np.frombuffer(raw, '<u4', width * height, offset).reshape(height, width)
        result.append(np.stack([(packed & mask) >> ((mask & -mask).bit_length() - 1) for mask in masks], axis=2) / 255.)
        offset += width * height * 4
        width, height = max(1, width // 2), max(1, height // 2)
    return result


def linear(image, uv):
    """Independent repeat/bilinear sampler. Pure."""
    height, width = image.shape[:2]
    px, py = np.array(uv) * [width, height] - .5
    x, y = math.floor(px), math.floor(py)
    fx, fy = px - x, py - y
    return ((1-fy)*((1-fx)*image[y % height, x % width]+fx*image[y % height, (x+1) % width])
            + fy*((1-fx)*image[(y+1) % height, x % width]+fx*image[(y+1) % height, (x+1) % width]))


class GroundSeamTest(unittest.TestCase):
    def test_regional_live_partition_guards_mips_without_unbounded_small_region_growth(self):
        # The nine spans of the first mixed regional/simple live seam. Keep the
        # physical source grid and world phase, not a reduced synthetic mask.
        size=2048
        bounds_list=[[0,0,512,512],[0,512,512,1024],[512,0,1024,1024],
            [0,1024,1024,2048],[1024,0,2048,1024],[1024,1024,1280,1536],
            [1280,1024,1536,1536],[1024,1536,1536,2048],[1536,1024,2048,2048]]
        yy,xx=np.ogrid[:size,:size]
        phase=np.array([15,8])*size
        for bounds in bounds_list:
            x0,y0,x1,y1=bounds;sw,sh=x1-x0,y1-y0
            a=((xx>=(x0+x1)//2)^(yy>=(y0+y1)//2)).astype(np.float32)
            raw=tracknative.region_mask({'a':a,'b':1-a},bounds,['a','b'],phase)
            decoded=levels(raw);ch,cw=decoded[0].shape[:2]
            self.assertLessEqual(cw*ch,4*sw*sh,bounds)
            probes=[((x0,y0+sh/4),0.),((x1,y0+sh/4),1.),
                    ((x0+sw/4,y0),0.),((x0+sw/4,y1),1.)]
            for lod in range(8):
                for point,expected in probes:
                    uv=(np.asarray(point)+phase)/[cw,ch]
                    self.assertLess(abs(linear(decoded[lod],uv)[0]-expected),1/255,(bounds,lod,point))
        self.assertEqual([128,128],tracknative.canvas_size([0,0,64,64],size,size))
        # Sub-four-pixel palette regions retain the existing two-real-texel halo.
        self.assertEqual([5,5],tracknative.canvas_size([0,0,1,1],size,size))

    def test_tile_mask_edges_do_not_read_opposite_material_through_mip_seven(self):
        size = 2048
        pixels = np.zeros((size, size, 4), np.uint8)
        pixels[:, :size//2, 0] = 255
        pixels[:, size//2:, 3] = 255
        for tile in ((0, 0), (16, -9), (-17, 11)):
            padded = textures.pad_weights(Image.fromarray(pixels), tile)
            self.assertEqual((2304, 2304), padded.size)
            decoded = levels(textures.dds_weights(padded))
            extent = np.array(padded.size) / size
            for lod in range(8):
                for x, expected in ((0., 1.), (1., 0.)):
                    uv = (np.array([x, -.37]) + [tile[0], -tile[1]]) / extent
                    self.assertLess(abs(linear(decoded[lod], uv)[0] - expected), 1/255, (tile, lod, x))
            # Scale-only native UVs cancel in every photo, including a noninteger physical repeat.
            uv = np.array([.123 + tile[0], -.456 - tile[1]])
            scale = np.array([128., 256/1.333])
            np.testing.assert_allclose(uv/extent * (scale*extent), uv*scale, rtol=0, atol=1e-12)

class GroundSeamSaveTest(unittest.TestCase):
    setUp = fixture.PaintTest.setUp
    material = fixture.PaintTest.material
    operation = fixture.PaintTest.operation
    keep = fixture.PaintTest.keep

    def test_native_save_cold_uvs_photo_phase_and_single_pixel_sampling_remain_canonical(self):
        native=kn5.read(self.path)
        for node in native['root'].children:
            node.vertices=node.vertices.copy()
            node.vertices['uv']=[(0,-1),(1,-1),(0,0)]
        kn5.write(self.path,[(n,raw) for n,_a,raw in native['textures']],native['materials'],native['root'])
        editorinfo.install(self.path,[str(self.folder/f't_{tx}_0.obj') for tx in (0,1)])
        self.revision=trackview.index(self.ac,self.name)['revision']
        for mesh in (0,1): trackview.prepare_surface(self.ac,self.name,mesh,self.revision)
        descriptor=self.keep([self.operation(self.material((200,30,40),(2,3)))])['textures'][0]
        trackdetail.mask(self.ac,self.name,descriptor['version'])
        with mock.patch.object(trackdetail,'mask',side_effect=AssertionError('read full DDS')):
            self.assertEqual((255,0,0,0),trackdetail.sample_mask(self.ac,self.name,descriptor['version'],.15,-.85))
            self.assertEqual((0,0,0,255),trackdetail.sample_mask(self.ac,self.name,descriptor['version'],.5,-.5))
        trackcopy.save(self.ac,self.name,'seam_copy','Seam copy')
        path=Path(self.ac,'content/tracks/seam_copy/seam_copy.kn5')
        saved=kn5.read(path)
        for i,node in enumerate(saved['root'].children):
            extent=trackview._mask_extent(saved['materials'][i])
            np.testing.assert_allclose(node.vertices['uv']*extent,native['root'].children[i].vertices['uv']+[i,0],atol=1e-7)
            mult=next(p[2] for p in saved['materials'][i].props if p[0]=='multR')
            np.testing.assert_allclose(np.array(mult)/extent,[128,256/3],rtol=1e-7)
        # Open the saved KN5 as a transferred source with no local recipe binding.
        (path.parent/'data/map2lap.json').write_text('{"title":"portable"}')
        index=trackview.index(self.ac,'seam_copy')
        scan=kn5.scan(path)
        raw=trackview.mesh_bytes(self.ac,'seam_copy',1,index['revision'])
        served=np.frombuffer(raw,kn5.VERTEX,3)
        np.testing.assert_allclose(served['uv'],native['root'].children[1].vertices['uv']+[1,0],atol=1e-7)
        source=trackdetail._source(scan,0)
        self.assertEqual((255,0,0,0),trackdetail.sample_source_mask(path,scan,source,index['revision'],.15,-.85,(0,0)))
        self.assertEqual((0,0,0,255),trackdetail.sample_source_mask(path,scan,source,index['revision'],.5,-.5,(0,0)))
        pixels=trackdetail._source_image(path,scan,source['mask'],index['revision'],source=source,tile=(0,0),dimensions=(32,32))
        self.assertEqual([0,0,0,255],pixels[16,16].tolist())


if __name__ == '__main__':
    unittest.main()
