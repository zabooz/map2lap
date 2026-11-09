"""Stock PBR input mapping retains independent XY repeats without allocating per-region photos."""
from pathlib import Path
import sys
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import trackground




class RegionalWeightTest(unittest.TestCase):
    def test_two_k_preview_compile_does_not_allocate_full_tile_defaults_per_region_or_repeat_shared_writes(self):
        import time
        import json
        from unittest import mock
        from app import trackregions
        size=2048; yy,xx=np.ogrid[:size,:size]
        blend=(.2*np.maximum(0,1-np.hypot(xx/size-.5,yy/size-.5)/.12)).astype(np.float32)
        fields={str(k):np.asarray((xx*6//size==k)*(1-blend)+blend/6,np.float32) for k in range(6)}
        layout={'dimensions':[size,size],'images':[{'id':key} for key in fields]}
        writes=[]; zeros=np.zeros_like; started=time.perf_counter()
        with mock.patch.object(np,'zeros_like',wraps=zeros) as allocate:
            result=trackregions.compile(layout,fields,'fixture',lambda key,raw:writes.append((key,len(raw))))
        large=sum(getattr(call.args[0],'shape',None)==(size,size) for call in allocate.call_args_list)
        print('APPLY_2K '+json.dumps({'seconds':time.perf_counter()-started,'passes':len(result['passes']),
            'full_tile_defaults':large,'default_allocation_bytes':large*size*size*4,
            'store_calls':len(writes),'unique_stores':len({key for key,_size in writes}),'encoded_bytes':result['bytes']}))
        self.assertLessEqual(large,1,'A present field must never allocate a full-tile fallback for each regional query')
        self.assertEqual(len(writes),len({key for key,_size in writes}),'Content-shared atlases are written once per compile')

    def test_regional_npot_mask_uses_the_entire_global_uv_origin_without_changing_photo_phase(self):
        import io
        from PIL import Image
        from app import tracknative
        yy,xx=np.indices((256,256))
        fields={'a':(.2+.6*xx/255).astype(np.float32)}
        fields['b']=1-fields['a']
        bounds=[0,0,128,128]; cw,ch=tracknative.canvas_size(bounds,256,256)
        for origin in ([0,0],[1,-2]):
            phase=(np.asarray(origin)-[0,1])*256
            raw=tracknative.region_mask(fields,bounds,['a','b'],phase=phase)
            with Image.open(io.BytesIO(raw)) as image: pixels=np.asarray(image.convert('RGBA'))/255
            source_uv=np.array([(17.5)/256,(33.5)/256-1])
            uv=(source_uv+origin)/[cw/256,ch/256]
            at=np.floor((uv%1)*[cw,ch]).astype(int)
            self.assertLessEqual(abs(float(pixels[at[1],at[0],0])-fields['a'][33,17]),2/255)
            np.testing.assert_allclose(uv*np.array([128,256/1.333])*[cw/256,ch/256],(source_uv+origin)*[128,256/1.333],rtol=0,atol=1e-12)

    def test_native_preflight_counts_shared_data_maps_independently_of_a_small_colour_photo(self):
        from unittest import mock
        from app import trackdetail, tracknative
        from track import groundmaterial
        ref = {"id": "asset:shared", "asset": "shared", "name": "same-colour.dds", "size": 160,
               "detail": {"key": "large-normal", "size": 4 * 2048 * 2048 * 4 // 3}}
        layout = {"ground": {}, "base": {"name": "tile"}, "images": [ref]}
        with (mock.patch.object(tracknative, "save_size", return_value=0),
              mock.patch.object(groundmaterial, "textures", return_value=[])):
            one = trackdetail.save_size([{"layers": layout}], {"textures": []}, None)
            shared = trackdetail.save_size([{"layers": {**layout, "images": [ref, ref]}}], {"textures": []}, None)
        self.assertGreater(one, 2048 * 2048 * 4)
        self.assertEqual(one, shared)

    def test_native_regional_dds_preserves_four_contributor_filter_mass_without_repeat_coupling(self):
        import math
        import struct
        from app import tracknative
        size=2048
        yy,xx=np.mgrid[:size,:size]
        blend=.2*np.maximum(0,1-np.hypot(xx/size-.5,yy/size-.5)/.12)
        labels=xx*4//size
        fields={str(k):np.asarray((labels==k)*(1-blend)+blend/4,np.float32) for k in range(4)}
        raw=tracknative.region_mask(fields,[0,0,size,size],list(fields))
        count=struct.unpack_from('<I',raw,28)[0]
        masks=struct.unpack_from('<4I',raw,92)
        half=struct.unpack_from('<I',raw,84)[0]==113
        decoded=[]; offset=128; height,width=struct.unpack_from('<2I',raw,12)
        extent=np.array([width/size,height/size])
        for _ in range(count):
            if half:
                level=np.frombuffer(raw,'<f2',count=width*height*4,offset=offset).reshape(height,width,4).astype(np.float32)
            else:
                pixels=np.frombuffer(raw,'<u4',count=width*height,offset=offset).reshape(height,width)
                level=np.stack([((pixels&mask)>>((mask&-mask).bit_length()-1))/255 for mask in masks],axis=2)
            decoded.append(level); offset+=width*height*(8 if half else 4); width=max(1,width//2); height=max(1,height//2)
        self.assertEqual(offset,len(raw))
        canonical=[trackground._levels(field) for field in fields.values()]
        def linear(level,uv):
            height,width=level.shape; px,py=np.array(uv)*[width,height]-.5
            ix,iy=math.floor(px),math.floor(py); fx,fy=px-ix,py-iy
            return (1-fy)*((1-fx)*level[iy%height,ix%width]+fx*level[iy%height,(ix+1)%width])+fy*((1-fx)*level[(iy+1)%height,ix%width]+fx*level[(iy+1)%height,(ix+1)%width])
        rows=[]
        for uv in ((.2,.2),(.499,.51),(.75,.7)):
            for lod in (0,1,3,4.5,5,5.5,6,6.5,7,11):
                low=int(lod); high=min(low+1,count-1); part=lod-low
                actual=[(1-part)*linear(decoded[low][...,k],np.asarray(uv)/extent)+part*linear(decoded[high][...,k],np.asarray(uv)/extent) for k in range(4)]
                expected=[(1-part)*linear(levels[low],uv)+part*linear(levels[high],uv) for levels in canonical]
                # Edge extrusion intentionally changes far averages; keep the
                # complete tail's unit mass and every contributor, without
                # comparing it against the former opposite-edge repeat.
                if lod==11:self.assertTrue(all(value>0 for value in actual))
                rows.append((uv,lod,sum(actual),max(abs(a-b) for a,b in zip(actual,expected)) if lod<=7 else 0.))
        self.assertLessEqual(max(abs(total-1) for _,_,total,_ in rows),.002,rows)
        self.assertLessEqual(max(error for _,_,_,error in rows),2/255,rows)
        # >4 at one soft junction and coarse support across separate palettes remain
        # explicit release gates; this checks the actual supported four-channel DDS.

    def test_native_geometry_budget_counts_only_bounded_regional_copies_without_repeat_cuts(self):
        from app import tracknative
        from track import kn5
        from unittest import mock
        size=17; y,x=np.mgrid[:size,:size]
        vertices=np.zeros(size*size,kn5.VERTEX)
        vertices['uv']=np.column_stack((x.ravel()/16,y.ravel()/16-1))
        vertices['pos']=np.column_stack((x.ravel(),np.zeros(size*size),y.ravel()))
        cells=(y[:-1,:-1]*size+x[:-1,:-1]).ravel()
        faces=np.concatenate((np.column_stack((cells,cells+1,cells+size)),np.column_stack((cells+1,cells+size+1,cells+size))))
        regions=[([0,0,8,16],['a']),([8,0,16,16],['b'])]
        source={'name':'1ROAD_ground_0_0','material':0,'vertices':len(vertices),'indices':faces.size}
        layout={'ground':{'dimensions':[16,16],'uv_origin':[0,0]},'materials':[0],'native_regions':regions}
        with mock.patch.object(kn5,'mesh_arrays',return_value=(vertices,faces)):
            budget=tracknative.save_size(layout,{'meshes':[source],'materials':[kn5.Material('ground','ksPerPixel',0,0,0,[],[])]},__file__)
        meshes=[]
        for i,(bound,_palette) in enumerate(regions):
            points=trackground.clip_region(vertices,faces,np.array(bound)/16,[0,0])
            tracknative._append(meshes,source,points,0,f'nocol_ground_m2l_{i}')
        actual=sum(m['vertices']*44+m['indices']*2+256 for m in meshes)
        self.assertGreaterEqual(budget,actual)
        self.assertLess(budget,200_000)
        self.assertLessEqual(sum(m['vertices'] for m in meshes),len(vertices)*2)

    def test_native_region_clips_unaligned_triangles_and_interpolates_all_vertex_fields(self):
        from track import kn5
        vertices = np.zeros(3, kn5.VERTEX)
        vertices["pos"] = [(0, 0, 0), (10, 2, 0), (0, 0, 10)]
        vertices["uv"] = [(0, -1), (1, -1), (0, 0)]
        vertices["normal"] = [(0, 1, 0), (.1, .995, 0), (0, .995, .1)]
        vertices["tangent"] = [(1, 0, 0), (.99, .1, 0), (.99, 0, .1)]
        before = vertices.tobytes()
        clipped = trackground.clip_region(vertices, np.array([[0, 1, 2]], np.uint16), (.25, 0, .75, 1), (0, 0))
        self.assertTrue(np.all((clipped["uv"][:, 0] >= .25) & (clipped["uv"][:, 0] <= .75)))
        np.testing.assert_allclose(clipped["pos"][:, 0], 10 * clipped["uv"][:, 0])
        np.testing.assert_allclose(clipped["pos"][:, 1], 2 * clipped["uv"][:, 0])
        np.testing.assert_allclose(clipped["normal"][:, 0], .1 * clipped["uv"][:, 0])
        np.testing.assert_allclose(clipped["tangent"][:, 2], .1 * (clipped["uv"][:, 1] + 1))
        triangles = clipped["pos"].reshape(-1, 3, 3).astype(np.float64)
        area = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])[:, 1]
        self.assertAlmostEqual(25, float(abs(area).sum() / 2))
        self.assertEqual(before, vertices.tobytes())

    def test_native_frame_preserves_arbitrary_xy_photo_phase_without_shared_photo_mosaics(self):
        for repeat in ((2., 1.333), (2., 3.), (3., 2.)):
            bounds = (8192., -16384., 8200., -16376.)
            frame = trackground.native_frame(bounds, repeat, (.125, .125))
            points = np.array([[8192.125, -16383.75], [8199.25, -16376.125]])
            uv = ((points - frame["origin"]) / repeat + frame["phase"]) / frame["multiplier"]
            delta = uv * frame["multiplier"] - points / repeat
            np.testing.assert_allclose(delta, np.rint(delta), atol=1e-9)
            self.assertTrue(np.all((uv >= 0) & (uv <= 1)))
            self.assertLessEqual(max(frame["dimensions"]), 160)
            # Small interpolated UVs retain sub-texel phase even when source geometry is kilometres from its anchor.
            reconstructed = uv.astype(np.float32) * np.float32(frame["multiplier"])
            self.assertLess(float(np.max(abs(reconstructed - uv * frame["multiplier"])) * 2048), .02)

    def test_constant_mip_rectangles_use_uniforms_and_allocate_no_mask_pixels(self):
        packed = trackground.weight_atlas(np.ones((128, 128), np.float32), (32, 32, 64, 64), 4)
        self.assertEqual(0, packed["pixels"].size)
        self.assertTrue(all(frame["constant"] == 1 for frame in packed["levels"]))

    def test_regions_keep_every_soft_contributor_and_do_not_mask_opaque_interiors(self):
        fields = {f"material-{k}": np.zeros((128, 128), np.float32) for k in range(6)}
        fields["material-0"][:, :64] = 1
        for k, values in enumerate(fields.values()):
            values[:, 64:] = (k + 1) / 21
        before = {key: values.copy() for key, values in fields.items()}
        regions = trackground.weight_regions(fields, block=32)
        owners = np.zeros((128, 128), np.uint8)
        rebuilt = {key: np.zeros_like(values) for key, values in fields.items()}
        for region in regions:
            x0, y0, x1, y1 = region["bounds"]
            owners[y0:y1, x0:x1] += 1
            for key in region["palette"]:
                rebuilt[key][y0:y1, x0:x1] = fields[key][y0:y1, x0:x1]
            if region["opaque"]:
                self.assertEqual(["material-0"], region["palette"])
                self.assertEqual(64 * 64, (x1 - x0) * (y1 - y0))
            else:
                self.assertEqual(sorted(fields), region["palette"])
        np.testing.assert_array_equal(owners, 1)
        self.assertEqual(2, sum(region["opaque"] for region in regions))
        for key in fields:
            np.testing.assert_array_equal(fields[key], before[key])
            np.testing.assert_array_equal(rebuilt[key], fields[key])

    def test_regions_retain_base_residual_and_tiny_positive_materials(self):
        fields = {"dust": np.full((8, 16), .25, np.float32), "tiny": np.full((8, 16), 1e-12, np.float32)}
        regions = trackground.weight_regions(fields, block=32)
        self.assertEqual([{"bounds": [0, 0, 16, 8], "palette": ["dust", "tiny"], "base": True, "opaque": False}], regions)

    def test_opaque_region_is_not_mask_free_when_a_filter_halo_contains_another_material(self):
        a = np.zeros((64, 64), np.float32)
        a[:, :32] = 1
        b = 1 - a
        safe = trackground.region_support({"a": a, "b": b}, [8, 8, 24, 24], 2)
        edge = trackground.region_support({"a": a, "b": b}, [24, 8, 32, 24], 2)
        self.assertEqual("a", safe["constant"])
        self.assertIsNone(edge["constant"])
        self.assertEqual(["a", "b"], edge["palette"])
        self.assertEqual([16, 0, 40, 32], edge["crop"])

    def test_local_mip_atlas_uses_independent_canonical_halos_without_full_resolution_padding(self):
        field = np.arange(128 * 128, dtype=np.float32).reshape(128, 128) / (128 * 128 - 1)
        original = field.copy()
        packed = trackground.weight_atlas(field, (32, 32, 64, 64), 4)
        atlas = packed["pixels"]
        self.assertEqual(np.dtype("float16"), atlas.dtype)
        for k, frame in enumerate(packed["levels"]):
            x, y, width, height = frame["atlas"]
            x0, y0 = frame["source"]
            reference = field.reshape(128 >> k, 1 << k, 128 >> k, 1 << k).mean(axis=(1, 3))
            np.testing.assert_allclose(atlas[y:y + height, x:x + width], reference[y0:y0 + height, x0:x0 + width], atol=.00025)
        # The old constant physical crop needs a 96x96 base. The independent mip rectangles retain fewer than 2.1K texels.
        self.assertLess(atlas.size, 2100)
        self.assertEqual(0, packed["positive_lost"])
        np.testing.assert_array_equal(field, original)

    def test_half_mask_keeps_positive_underflow_without_changing_semantic_values(self):
        source = np.array([[0, 1e-12, .2, 1]], np.float32)
        original = source.copy()
        half, info = trackground.half_weights(source)
        np.testing.assert_array_equal(source, original)
        self.assertEqual(np.dtype("float16"), half.dtype)
        self.assertEqual(0, half[0, 0])
        self.assertGreater(half[0, 1], 0)
        self.assertEqual(1, info["raised_subnormals"])
        self.assertLess(info["max_error"], .0001)
        self.assertLess(abs(info["mass_delta"]), .0001)

    def test_near_and_tail_are_complementary_at_the_fractional_split(self):
        field = np.arange(32 * 32, dtype=np.float32).reshape(32, 32) / 1023
        packed = trackground.region_weights(field, (8, 8, 16, 16), 2)
        self.assertEqual([0, 0, 24, 24], packed["crop"])
        self.assertTrue(all(not level.any() for level in packed["near"][3:]))
        self.assertFalse(packed["tail"][0].any())
        reference = field.reshape(8, 4, 8, 4).mean(axis=(1, 3))
        # At LOD2.25 near contributes .75 of level2, tail contributes .25 of canonical level3.
        near = packed["near"][2][2:4, 2:4]
        coarse = field.reshape(4, 8, 4, 8).mean(axis=(1, 3))
        np.testing.assert_allclose(near, reference[2:4, 2:4], atol=1e-7)
        np.testing.assert_allclose(packed["tail"][1], coarse, atol=1e-7)
        self.assertEqual((1, 1), packed["near"][-1].shape)
        self.assertEqual((1, 1), packed["tail"][-1].shape)

    def test_source_neighbour_is_in_the_fine_halo_instead_of_an_edge_copy(self):
        source = np.zeros((16, 16), np.float32)
        neighbour = np.full((16, 16), .75, np.float32)
        packed = trackground.region_weights(source, (12, 4, 16, 8), 1, {(1, 0): neighbour})
        x0, y0, _x1, _y1 = packed["crop"]
        self.assertEqual(.75, packed["near"][0][4 - y0, 16 - x0])
        self.assertEqual(0, packed["near"][0][4 - y0, 15 - x0])

    def test_float_half_dds_keeps_full_mip_dimensions_and_measured_cost(self):
        import struct
        levels = [np.full((8 >> k, 8 >> k), .1, np.float32) for k in range(4)]
        raw, info = trackground.weight_dds(levels)
        self.assertEqual(b"DDS ", raw[:4])
        self.assertEqual(113, struct.unpack_from("<I", raw, 84)[0])
        self.assertEqual(128 + 8 * (64 + 16 + 4 + 1), len(raw))
        self.assertEqual(len(raw), info["bytes"])
        self.assertEqual(0, info["positive_lost"])


if __name__ == "__main__": unittest.main()
