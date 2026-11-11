"""The normal ground-material workflow retains repeating detail maps through draft, Save and portable reload."""
import io
import base64
import contextlib
import hashlib
import json
from pathlib import Path
import shutil
import struct
import tempfile
import os
import threading
import urllib.request
from http.server import ThreadingHTTPServer
import unittest
from unittest import mock

import numpy as np
from PIL import Image

import test_trackpaint as fixture
from app import materiallibrary, trackcopy, trackdetail, trackedits, trackview
from track import editorinfo, groundmaterial, kn5, surfaceindex


@contextlib.contextmanager
def selected_masks(merged, material="gc_meadow"):
    """trackpaint.create takes merged's tiles ({"tiles": [{"tile", "mask"}]}) as what its points select."""
    by_key = {"_".join(map(str, tile["tile"])): tile for tile in merged["tiles"]}
    region = {"material": material, "truncated": False, "whole": False, "regions": dict.fromkeys(by_key)}
    with (mock.patch.object(trackview, "surface_region", return_value=region),
          mock.patch.object(surfaceindex, "region_masks", side_effect=lambda _kn5, _region, keys: [by_key[k] for k in keys])):
        yield


class DetailTest(unittest.TestCase):
    def _saved_region_weights(self, saved, layout, fields, x, y):
        """Read the actual native DDS at a canonical source pixel, including the compiled global UV phase."""
        from app import tracknative
        height,width=next(iter(fields.values())).shape
        source={**fields,'base':np.maximum(0,1-sum(fields.values(),np.zeros((height,width),np.float32)))}
        result={key:0. for key in source}
        textures={name:raw for name,_a,raw in saved['textures']}
        for number,(bounds,palette) in enumerate(layout['native_regions']):
            if not (bounds[0]<=x<bounds[2] and bounds[1]<=y<bounds[3]): continue
            material=next(m for m in saved['materials'] if m.name==f'm2l_ground_region_0_{number}')
            name=next(name for slot,_i,name in material.maps if slot=='txMask')
            with Image.open(io.BytesIO(textures[name])) as image:
                phase=(np.asarray(layout['origin'])+layout['ground']['uv_origin']-[0,1])*[width,height]
                pixel=image.convert('RGBA').getpixel((int((x+.5+phase[0])%image.width),int((y+.5+phase[1])%image.height)))
            for channel,key in enumerate(palette): result[key]=pixel[channel]/255
            return result
        self.fail('The saved native regions do not cover the checked source point')

    def test_regional_six_distributed_soft_materials_and_tree_save_without_repeat_geometry(self):
        from app import trackpaint, objectlibrary, trackmodels
        from test_modeldata import encode, fixture as model_fixture
        raster_size=int(os.environ.get('M2L_REGIONAL_SIZE','256'))
        native = kn5.read(self.path)
        node = native['root'].children[0]
        zz, xx = np.mgrid[:129, :129]
        node.vertices = np.zeros(xx.size, kn5.VERTEX)
        node.vertices['pos'] = np.column_stack((xx.ravel()*2, np.zeros(xx.size), -zz.ravel()*2))
        node.vertices['uv'] = np.column_stack((xx.ravel()/128, -zz.ravel()/128))
        node.vertices['normal'] = [0,1,0]; node.vertices['tangent'] = [1,0,0]
        a = (zz[:-1,:-1]*129+xx[:-1,:-1]).ravel()
        node.indices = np.stack((a,a+129,a+130,a,a+130,a+1),axis=1).astype('<u2').ravel()
        textures = [(n, fixture.png(np.full((raster_size,raster_size,3),100,np.uint8)) if n=='ground_0_0.png' else raw) for n,_a,raw in native['textures']]
        kn5.write(self.path, textures, native['materials'], native['root'])
        part = str(self.folder/'t_0_0.obj'); paint = editorinfo.Paint(part,0,0,raster_size)
        paint.base(['field0'],np.zeros((raster_size,raster_size),np.uint8))
        cuts = np.linspace(0,raster_size,7); soft=raster_size*3/256
        for k in range(1,6):
            alpha=np.broadcast_to(np.rint(np.clip((np.arange(raster_size)-cuts[k]+soft)/(2*soft),0,1)*255).astype(np.uint8),(raster_size,raster_size))
            paint.layer('field'+str(k),alpha)
        paint.finish(); editorinfo.install(str(self.path),[part])
        self.revision=trackview.index(self.ac,self.name)['revision']; trackview.prepare_surface(self.ac,self.name,0,self.revision)
        paints=[]
        for k in range(6):
            asset=self.material((30+k*30,150-k*10,60),(2,1.333) if k%2==0 else (3,2))
            if k==0:
                colour=materiallibrary.prepare('colour.png',fixture.png(np.full((32,32,3),170,np.uint8)))
                normal=materiallibrary.prepare('normal.png',fixture.png(np.full((8,8,3),(143,177,243),np.uint8)),role='normal')
                rough=materiallibrary.prepare('rough.png',fixture.png(np.full((16,16),71,np.uint8)),role='roughness')
                asset=materiallibrary.add({'token':colour['token'],'filename':'colour.png','name':'Mapped regional material','category':'soil','repeat':[2,1.333],'variation':True,
                    'maps':{'normal':{'token':normal['token'],'filename':'normal.png'},'roughness':{'token':rough['token'],'filename':'rough.png'}}})['material']['id']
            paints.append(trackpaint.create(self.ac,self.name,self.revision,asset,[{'mesh':0,'u':float((cuts[k]+cuts[k+1])/(2*raster_size)),'v':-.2,'whole':True}]))
            self.keep(paints)
        with mock.patch.object(objectlibrary,'ROOT',self.tmp.name):
            glb=encode(*model_fixture()); prepared=objectlibrary.prepare('regional-tree.glb',glb)
            asset=objectlibrary.add({'token':prepared['token'],'filename':'regional-tree.glb','name':'Regional tree'})['model']
            now=trackedits.load(self.ac,self.name)
            model=trackedits.model(self.ac,self.name,{'base':now['base'],'revision':now['revision'],'model':asset['id'],'at':[110,0,-90]})['model']
            trackedits.save_telling(self.ac,self.name,{'base':now['base'],'revision':now['revision'],'id':'regional','paints':paints,'models':[model],'deleted':[]})
            trackcopy.save(self.ac,self.name,'regional_six','Regional six')
        folder=Path(self.ac,'content/tracks/regional_six'); saved=kn5.read(folder/'regional_six.kn5')
        self.assertFalse((folder/'regional_six.uv2').exists())
        self.assertEqual(fixture.geometry(node.vertices),fixture.geometry(saved['root'].children[0].vertices))
        self.assertEqual(node.indices.tobytes(),saved['root'].children[0].indices.tobytes())
        self.assertEqual(0,saved['root'].children[0].renderable)
        regions=[m for m in kn5.walk_meshes(saved['root']) if m.name.startswith('nocol_ground_m2l_')]
        self.assertTrue(regions)
        self.assertLess(sum(len(m.vertices) for m in regions),len(node.vertices)*2)
        self.assertTrue(all(saved['materials'][m.material].shader=='ksMultilayer_objsp' for m in regions))
        self.assertTrue(any('m2l_model_' in m.name for m in kn5.walk_meshes(saved['root'])))
        config=(folder/'extension/map2lap_ground.ini').read_text()
        self.assertIn('ksMultilayer_objsp_nm4',config); self.assertNotIn('stickers',config)
        payloads={n:raw for n,_active,raw in saved['textures']}
        normal_names={n for m in saved['materials'] for slot,_i,n in m.maps if slot.startswith('txNormal')}
        self.assertGreater(len(normal_names),1,'At least one actual imported normal must be bound independently of the flat filler')
        alpha_values=[]
        for m in saved['materials']:
            if m.shader!='ksMultilayer_objsp': continue
            for slot,_i,n in m.maps:
                if not slot.startswith('txDetail'): continue
                with Image.open(io.BytesIO(payloads[n])) as image: alpha_values.append(image.convert('RGBA').getpixel((0,0))[3])
        self.assertTrue(any(0<a<255 for a in alpha_values),'The DDS must retain the imported roughness/gloss alpha')
        metrics={'source_mask_dimensions':[raster_size,raster_size],'source_vertices':len(node.vertices),'regional_vertices':sum(len(m.vertices) for m in regions),
                 'regional_meshes':len(regions),'kn5_bytes':(folder/'regional_six.kn5').stat().st_size,
                 'mask_bytes':sum(len(payloads[n]) for n in {n for m in saved['materials'] for slot,_i,n in m.maps if slot=='txMask'})}
        for relative in ('library','cache','out'): shutil.rmtree(Path(self.tmp.name,relative),ignore_errors=True)
        cold=trackedits.load(self.ac,'regional_six'); self.assertEqual(paints,cold['paints']); self.assertEqual([model],cold['models'])
        index=trackview.index(self.ac,'regional_six')
        self.assertFalse(index['paint_errors']); self.assertTrue(any(m['name']==node.name for m in index['meshes']))
        self.assertEqual(glb,trackmodels.original(self.ac,'regional_six',model['asset']))
        trackcopy.save(self.ac,'regional_six','regional_cold_copy','Regional cold copy')
        copy=Path(self.ac,'content/tracks/regional_cold_copy')
        self.assertEqual((folder/'regional_six.kn5').read_bytes(),(copy/'regional_cold_copy.kn5').read_bytes())
        now=trackedits.load(self.ac,'regional_cold_copy')
        trackedits.save_telling(self.ac,'regional_cold_copy',{'base':now['base'],'revision':now['revision'],'id':'clear','paints':[],'models':[model],'deleted':[]})
        trackcopy.save(self.ac,'regional_cold_copy','regional_cleared','Regional cleared')
        cleared=kn5.read(Path(self.ac,'content/tracks/regional_cleared/regional_cleared.kn5'))
        self.assertEqual(1,cleared['root'].children[0].renderable)
        self.assertFalse(any(m.name.startswith('nocol_ground_m2l_') for m in kn5.walk_meshes(cleared['root'])))
        if evidence:=os.environ.get('M2L_REGIONAL_EVIDENCE'):
            target=Path(evidence).resolve(); self.assertTrue(target.is_relative_to(Path(__file__).resolve().parents[2]/'out'))
            target.mkdir(parents=True,exist_ok=True)
            shutil.copytree(folder,target/'first'); shutil.copytree(copy,target/'cold-copy')
            (target/'metrics.json').write_text(json.dumps(metrics,indent=2))

    def setUp(self):
        selection = tempfile.TemporaryDirectory()
        self.addCleanup(selection.cleanup)
        patch = mock.patch.object(surfaceindex, "CACHE_ROOT", Path(selection.name))
        patch.start()
        self.addCleanup(patch.stop)
        fixture.PaintTest.setUp(self)
    material = fixture.PaintTest.material
    operation = fixture.PaintTest.operation
    keep = fixture.PaintTest.keep

    def detail_asset(self):
        pixels = np.zeros((128, 128, 3), np.uint8)
        pixels[:, ::2] = (230, 20, 30)
        pixels[:, 1::2] = (20, 180, 230)
        staged = materiallibrary.prepare("detail.png", fixture.png(pixels))
        return materiallibrary.add({"token": staged["token"], "filename": "detail.png", "name": "Fine detail",
                                    "category": "asphalt", "repeat": [2, 3]})["material"]["id"]

    def test_preview_detail_packs_retained_positive_y_normal_and_roughness_as_linear_data(self):
        from app import trackdetail, trackpaint
        colour = materiallibrary.prepare("colour.png", fixture.png(np.full((32, 32, 3), 170, np.uint8)))
        normal = materiallibrary.prepare("normal.png", fixture.png(np.full((8, 8, 3), (143, 177, 243), np.uint8)), role="normal")
        rough = materiallibrary.prepare("rough.png", fixture.png(np.full((16, 16), 71, np.uint8)), role="roughness")
        asset = materiallibrary.add({"token": colour["token"], "filename": "colour.png", "name": "PBR",
                                    "category": "soil", "repeat": [2, 3], "variation": False,
                                    "maps": {"normal": {"token": normal["token"], "filename": "normal.png"},
                                             "roughness": {"token": rough["token"], "filename": "rough.png"}}})["material"]["id"]
        op = self.operation(asset)
        layout = self.keep([op])["textures"][0]["layers"]
        ref = layout["images"][0]
        self.assertEqual({"roughness": 1., "normal_scale": 1.}, ref["properties"])
        self.assertTrue(ref["detail"]["linear"])
        materiallibrary.remove(asset)
        with Image.open(io.BytesIO(trackdetail.detail_image(self.ac, self.name, ref["asset"]))) as packed:
            self.assertEqual((16, 16), packed.size)
            self.assertEqual((143, 177, 243, 71), packed.getpixel((5, 5)))
        self.assertTrue(trackpaint._resolve(self.ac, self.name, "materials", ref["asset"]).is_dir())

    def test_portable_pbr_slots_distinguish_identical_photos_after_original_source_and_caches_are_gone(self):
        from app import trackdetail, trackpaint
        operations = []
        for i, green in enumerate((38, 218)):
            colour = materiallibrary.prepare("colour.png", fixture.png(np.full((16, 16, 3), 130, np.uint8)))
            normal = materiallibrary.prepare("normal.png", fixture.png(np.full((16, 16, 3), (128, green, 218), np.uint8)), role="normal")
            asset = materiallibrary.add({"token": colour["token"], "filename": "colour.png", "name": f"PBR {i}",
                                        "category": "soil", "repeat": [2, 3], "variation": False,
                                        "maps": {"normal": {"token": normal["token"], "filename": "normal.png"}}})["material"]["id"]
            operations.append(self.operation(asset, .1 if i == 0 else .5, -.5))
        descriptor = self.keep(operations)["textures"][0]["layers"]
        self.assertEqual(2, len(descriptor["images"]))
        expected = {ref["asset"]: trackdetail.detail_image(self.ac, self.name, ref["asset"]) for ref in descriptor["images"]}
        trackcopy.save(self.ac, self.name, "portable_pbr", "Portable PBR")
        for relative in ("library", "cache", "out/sources", "out/paints", "out/paint-assets", "out/paint-views"):
            shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
        reopened = trackview.index(self.ac, "portable_pbr")
        refs = reopened["materials"][0]["splat"]["images"]
        self.assertEqual(set(expected), {ref.get("asset") for ref in refs})
        for ref in refs:
            self.assertTrue(ref["detail"]["linear"])
            self.assertIn("/portable_pbr/paint-data/", ref["detail"]["url"])
            self.assertEqual(expected[ref["asset"]], trackdetail.detail_image(self.ac, "portable_pbr", ref["asset"]))

    def test_compiled_slot_binding_is_hash_bound_and_rejects_corrupt_provenance(self):
        from app import trackdetail, trackpaint
        self.keep([self.operation(self.detail_asset())])
        trackcopy.save(self.ac, self.name, "bound", "Bound")
        path = Path(self.ac, "content/tracks/bound/bound.kn5")
        manifest = path.parent / trackdetail.BINDINGS_FILE
        self.assertTrue(trackdetail._bindings(self.ac, "bound", path))
        original = manifest.read_text(encoding="utf8")
        record = json.loads(original)
        record["materials"]["ground_0_0"]["R"] = "invalid"
        manifest.write_text(json.dumps(record), encoding="utf8")
        with self.assertRaisesRegex(ValueError, "binding.*changed"):
            trackdetail._bindings(self.ac, "bound", path)
        manifest.write_text(json.dumps({**record, "digest": trackpaint._digest({k: v for k, v in record.items() if k != "digest"})}), encoding="utf8")
        with self.assertRaisesRegex(ValueError, "Invalid texture edit id"):
            trackdetail._bindings(self.ac, "bound", path)
        manifest.write_text(original, encoding="utf8")
        _name, offset, size = kn5.scan(str(path))["textures"][0]
        with path.open("r+b") as file:
            file.seek(offset + size - 1)
            value = file.read(1)[0]
            file.seek(offset + size - 1)
            file.write(bytes([value ^ 1]))
        self.assertEqual({}, trackdetail._bindings(self.ac, "bound", path))

    def test_portable_index_resolves_shared_slot_provenance_and_asset_once_across_tiles(self):
        from app import trackdetail, trackpaint
        colour = materiallibrary.prepare("colour.png", fixture.png(np.full((16, 16, 3), 130, np.uint8)))
        normal = materiallibrary.prepare("normal.png", fixture.png(np.full((16, 16, 3), (128, 218, 218), np.uint8)), role="normal")
        asset = materiallibrary.add({"token": colour["token"], "filename": "colour.png", "name": "Shared PBR",
                                    "category": "soil", "repeat": [2, 3], "variation": False,
                                    "maps": {"normal": {"token": normal["token"], "filename": "normal.png"}}})["material"]["id"]
        self.keep([self.operation(asset)])
        # Read compatibility for an older three-slot compiled track, before native PBR output existed.
        with mock.patch.object(trackdetail, "native_descriptors", side_effect=lambda _ac, _name, descriptors: descriptors):
            trackcopy.save(self.ac, self.name, "shared_index", "Shared index")
        shutil.rmtree(Path(self.tmp.name, "out/sources"))
        with (mock.patch.object(trackdetail, "_bindings", wraps=trackdetail._bindings) as bindings,
              mock.patch.object(trackdetail, "_asset", wraps=trackdetail._asset) as assets,
              mock.patch.object(trackdetail, "_detail", wraps=trackdetail._detail) as details):
            reopened = trackview.index(self.ac, "shared_index")
        materials = [m for m in reopened["materials"] if "splat" in m]
        self.assertEqual(2, len(materials))
        self.assertEqual(1, bindings.call_count)
        self.assertEqual(1, assets.call_count)
        self.assertEqual(1, details.call_count)
        asset = materials[0]["splat"]["images"][0]["asset"]
        retained = trackpaint._resolve(self.ac, "shared_index", "materials", asset)
        (retained / "normal.png").write_bytes(b"damaged data")
        self.assertIn("The retained material image has changed", trackview.index(self.ac, "shared_index")["paint_errors"])


    def test_reapplying_a_after_b_moves_its_immutable_operation_to_the_end(self):
        first, second = self.detail_asset(), self.material((40, 180, 30))
        ids = []
        for asset in (first, second, first):
            now = trackedits.load(self.ac, self.name)
            answer = trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": now["revision"],
                                      "material": asset, "points": [{"mesh": 0, "u": .1, "v": -.5}]})
            ids = [p for p in ids if p != answer["paint"]] + [answer["paint"]]
            self.keep(ids)
        self.assertEqual(2, len(ids))
        self.assertEqual(ids, trackedits.load(self.ac, self.name)["paints"])

    def test_six_material_cold_transfer_reopens_and_saves_again_without_duplicate_render_meshes(self):
        from app import tracknative
        self._six_material_source(distributed=True)
        path = Path(self.ac, "content/tracks/six_pbr/six_pbr.kn5")
        before = kn5.read(path)
        old_derived = [n for n in before["root"].children if n.cls == 2 and n.name.startswith(tracknative.PREFIX)]
        shutil.rmtree(Path(self.tmp.name, "out/sources"))
        reopened = trackview.index(self.ac, "six_pbr")
        self.assertFalse(reopened["paint_errors"])
        self.assertFalse(any(m["name"].startswith(tracknative.PREFIX) for m in reopened["meshes"]))
        self.assertEqual(6, len(reopened["materials"][0]["splat"]["images"]))
        trackcopy.save(self.ac, "six_pbr", "six_cold_again", "Six cold again")
        after = kn5.read(Path(self.ac, "content/tracks/six_cold_again/six_cold_again.kn5"))
        derived = [n for n in after["root"].children if n.cls == 2 and n.name.startswith(tracknative.PREFIX)]
        self.assertEqual(len(old_derived), len(derived))
        self.assertEqual(before["root"].children[0].vertices.tobytes(), after["root"].children[0].vertices.tobytes())
        self.assertEqual(before["root"].children[0].indices.tobytes(), after["root"].children[0].indices.tobytes())
        self.assertEqual(len(before["materials"]), len(after["materials"]), "A repeated cold Save must reuse owned material slots")
        second = Path(self.ac, "content/tracks/six_cold_again/six_cold_again.kn5")
        self.assertEqual(path.read_bytes(), second.read_bytes())
        shutil.rmtree(Path(self.tmp.name, "out/sources"))
        trackcopy.save(self.ac, "six_cold_again", "six_cold_third", "Six cold third")
        third = Path(self.ac, "content/tracks/six_cold_third/six_cold_third.kn5")
        self.assertEqual(path.read_bytes(), third.read_bytes())

    def test_six_semantic_materials_and_a_model_keep_order_original_maps_pose_and_physics_through_cold_resave(self):
        from test_modeldata import encode, fixture as model_fixture
        from app import objectlibrary, trackmodels, trackpaint, tracknative
        raw_glb = encode(*model_fixture())
        with mock.patch.object(objectlibrary, "ROOT", self.tmp.name):
            prepared = objectlibrary.prepare("joint-tree.glb", raw_glb)
            asset = objectlibrary.add({"token": prepared["token"], "filename": "joint-tree.glb", "name": "Joint tree", "metres_per_unit": .5})["model"]
            now = trackedits.load(self.ac, self.name)
            model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [110, 0, -90]})["model"]
            pose = {"id": model["id"] + "#0", "x": 3, "y": .7, "z": -2, "turn": 35, "scale": 1.4}

            def keep_with_model(paints):
                current = trackedits.load(self.ac, self.name)
                return trackedits.save_telling(self.ac, self.name, {"base": current["base"], "revision": current["revision"],
                    "id": "joint", "deleted": [], "paints": paints, "models": [model], "placed": [pose]})

            # Reuse the real six-way soft source, 2 m terrain and original normal/roughness packages of the acceptance fixture.
            with mock.patch.object(self, "keep", side_effect=keep_with_model):
                self._six_material_source(distributed=True)
            name = "six_pbr"
            first_path = Path(self.ac, "content/tracks/six_pbr/six_pbr.kn5")
            first = kn5.read(first_path)
            warm = trackedits.load(self.ac, name)
            paints = warm["paints"]
            self.assertEqual(6, len(paints)); self.assertEqual([model], warm["models"]); self.assertEqual([pose], warm["placed"])
            records, originals = {}, {}
            for paint_id in paints:
                _folder, record = trackpaint.operation(self.ac, name, paint_id)
                records[paint_id] = record
                folder = trackpaint._resolve(self.ac, name, "materials", record["asset"])
                meta = trackpaint._verified(folder / "asset.json", record["asset"])
                originals[record["asset"]] = {role: (meta["original"]["maps"][role]["file"],
                    (folder / meta["original"]["maps"][role]["file"]).read_bytes()) for role in ("normal", "roughness")}
            source_meshes = {m.name: (m.vertices.tobytes(), m.indices.tobytes()) for m in kn5.walk_meshes(first["root"])
                             if not m.name.startswith(tracknative.PREFIX)}
            for relative in ("library", "cache", "out"):
                shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
            cold = trackedits.load(self.ac, name)
            self.assertEqual(paints, cold["paints"], "Cold model provenance must preserve ordered ground edits too")
            self.assertEqual([model], cold["models"]); self.assertEqual([pose], cold["placed"])
            self.assertEqual(raw_glb, trackmodels.original(self.ac, name, model["asset"]))
            for paint_id in paints:
                self.assertEqual(records[paint_id], trackpaint.operation(self.ac, name, paint_id)[1])
            for snapshot, roles in originals.items():
                folder = trackpaint._resolve(self.ac, name, "materials", snapshot)
                for filename, raw in roles.values(): self.assertEqual(raw, (folder / filename).read_bytes())
            index = trackview.index(self.ac, name)
            self.assertFalse(index["paint_errors"])
            self.assertEqual(paints, index["paints"])
            self.assertEqual(set(originals), {image["asset"] for image in index["materials"][0]["splat"]["images"]})
            self.assertTrue((first_path.parent / trackmodels.BUNDLE / "compiled.json").is_file())
            trackcopy.save(self.ac, name, "joint_again", "Joint again")
            second_path = Path(self.ac, "content/tracks/joint_again/joint_again.kn5")
            second = kn5.read(second_path)
            first_meshes = {mesh.name: mesh for mesh in kn5.walk_meshes(first["root"])}
            second_meshes = {mesh.name: mesh for mesh in kn5.walk_meshes(second["root"])}
            self.assertEqual(set(first_meshes), set(second_meshes))
            for name, expected in source_meshes.items():
                self.assertIn(name, second_meshes)
                mesh = second_meshes[name]
                self.assertEqual(expected, (mesh.vertices.tobytes(), mesh.indices.tobytes()))
            self.assertEqual(len(first["materials"]), len(second["materials"]))
            self.assertEqual(len(first["textures"]), len(second["textures"]))
            self.assertEqual(len(kn5.walk_meshes(first["root"])), len(kn5.walk_meshes(second["root"])))
            self.assertEqual(first_path.read_bytes(), second_path.read_bytes(), "Unchanged combined inputs must produce byte-identical native geometry, materials and images")
            final = trackedits.load(self.ac, "joint_again")
            self.assertEqual(paints, final["paints"]); self.assertEqual([model], final["models"]); self.assertEqual([pose], final["placed"])

    def test_regional_native_six_mixed_repeats_and_model_share_embedded_maps_through_cold_copy(self):
        add = materiallibrary.add
        def mixed_repeats(settings):
            settings = dict(settings)
            if settings.get('name', '').startswith('PBR grass'):
                k = int(settings['name'].rsplit(' ', 1)[1])
                settings['repeat'] = [2, 1.333] if k % 2 == 0 else [3, 2]
            return add(settings)
        with mock.patch.object(materiallibrary, 'add', side_effect=mixed_repeats):
            self.test_six_semantic_materials_and_a_model_keep_order_original_maps_pose_and_physics_through_cold_resave()
        first=Path(self.ac,'content/tracks/six_pbr'); second=Path(self.ac,'content/tracks/joint_again')
        self.assertFalse((first/'six_pbr.uv2').exists())
        self.assertFalse((second/'joint_again.uv2').exists())
        config=(second/'extension/map2lap_ground.ini').read_text()
        self.assertIn('ksMultilayer_objsp_nm4',config)
        self.assertNotIn('RESOURCE_FILE',config)
        native=kn5.read(second/'joint_again.kn5')
        resources={name:raw for name,_a,raw in native['textures']}
        referenced={name for material in native['materials'] for _slot,_i,name in material.maps}
        self.assertTrue(referenced.issubset(resources))
        own=[raw for name,raw in resources.items() if name.startswith('map2lap_native_')]
        self.assertEqual(len(own),len({hashlib.sha256(raw).digest() for raw in own}))

    def test_changed_cold_native_saves_remove_only_owned_obsolete_payloads_and_keep_source_images(self):
        from app import tracknative, trackpaint
        source = kn5.read(self.path)
        kn5.write(self.path, [(n, raw) for n, _a, raw in source["textures"]] + [("foreign_unused.bin", b"preserve original")],
                  source["materials"], source["root"])
        self._six_material_source(distributed=True)
        initial = kn5.read(Path(self.ac, "content/tracks/six_pbr/six_pbr.kn5"))
        old_photos = {}
        for n, _a, raw in initial["textures"]:
            if n.startswith("map2lap_native_"):
                with Image.open(io.BytesIO(raw)) as image:
                    pixel = image.convert("RGB").getpixel((0, 0))
                for k in (0, 1):
                    if max(abs(a-b) for a,b in zip(pixel,(40 + 30 * k, 180 - 20 * k, 65 + 20 * k))) <= 4:
                        old_photos[k] = n
        self.assertEqual(2, len(old_photos))
        current = "six_pbr"
        previous_photos = None
        for k in (0, 1):
            shutil.rmtree(Path(self.tmp.name, "out/sources"), ignore_errors=True)
            self.name = current
            self.revision = trackview.index(self.ac, current)["revision"]
            trackview.prepare_surface(self.ac, current, 0, self.revision)
            op = trackpaint.create(self.ac, current, self.revision, self.material((11 + 10 * k, 22, 33)),
                                   [{"mesh": 0, "u": .05 if k == 0 else .25, "v": -.1, "whole": True}])
            self.keep([*trackedits.load(self.ac,current)["paints"],op])
            destination = "changed_native_" + str(k)
            trackcopy.save(self.ac, current, destination, destination)
            own = Path(self.ac, f"content/tracks/{destination}/{destination}.kn5")
            saved = kn5.read(own)
            payloads = {n: raw for n, _a, raw in saved["textures"]}
            referenced = {n for m in saved["materials"] for _slot, _index, n in m.maps}
            self.assertNotIn(old_photos[k], set(payloads), "Obsolete own photograph must not accumulate on each cold Save")
            self.assertFalse({n for n in payloads if n.startswith("map2lap_native_")} - referenced)
            self.assertEqual(b"preserve original", payloads["foreign_unused.bin"])
            self.assertEqual(initial["materials"][:2], saved["materials"][:2])
            self.assertEqual(initial["root"].children[0].vertices.tobytes(), saved["root"].children[0].vertices.tobytes())
            self.assertEqual(initial["root"].children[0].indices.tobytes(), saved["root"].children[0].indices.tobytes())
            if previous_photos:
                self.assertTrue(previous_photos.issubset(payloads))
            previous_photos = {n for m in saved["materials"] for slot, _i, n in m.maps if slot.startswith("txDetail") and n not in old_photos.values()}
            self.assertTrue(tracknative.inherited(self.ac, destination, own)["paints"])
            current = destination

    def test_single_pbr_material_exports_maps_properties_and_survives_cold_transfer(self):
        from app import trackdetail, tracknative
        source = kn5.read(str(self.path))
        for node in source["root"].children:
            node.vertices = node.vertices.copy()
            node.vertices["uv"] = [(0, 0), (1, 0), (0, -1)]
        kn5.write(str(self.path), [(n, raw) for n, _a, raw in source["textures"]], source["materials"], source["root"])
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for i in (0, 1):
            trackview.prepare_surface(self.ac, self.name, i, self.revision)
        colour = materiallibrary.prepare("colour.png", fixture.png(np.full((16, 16, 3), 130, np.uint8)))
        normal = materiallibrary.prepare("normal.png", fixture.png(np.full((16, 16, 3), (170, 205, 224), np.uint8)), role="normal")
        rough = materiallibrary.prepare("rough.png", fixture.png(np.full((16, 16), 64, np.uint8)), role="roughness")
        asset = materiallibrary.add({"token": colour["token"], "filename": "colour.png", "name": "Single PBR",
                                    "category": "soil", "repeat": [2, 1.333], "variation": False,
                                    "properties": {"normal_scale": 0., "roughness": .5},
                                    "maps": {"normal": {"token": normal["token"], "filename": "normal.png"},
                                             "roughness": {"token": rough["token"], "filename": "rough.png"}}})["material"]["id"]
        self.keep([self.operation(asset)])
        trackcopy.save(self.ac, self.name, "single_pbr", "Single PBR")
        saved = kn5.read(str(Path(self.ac, "content/tracks/single_pbr/single_pbr.kn5")))
        regional = [m for m in saved["materials"] if any(p[0] == "m2lGroundPass" and p[1] == 3 for p in m.props)]
        self.assertTrue(regional, "A single material with normal/roughness maps must use the regional native adapter too")
        payloads = {key: raw for key, _active, raw in saved['textures']}
        matched = []
        for material in regional:
            maps = {slot: name for slot, _index, name in material.maps}
            for channel in 'RGBA':
                with Image.open(io.BytesIO(payloads[maps['txDetail'+channel]])) as image:
                    pixel = image.convert('RGBA').getpixel((0,0))
                if abs(pixel[0]-130)<=4 and abs(pixel[3]-223)<=2:     # (BC7: alpha a step or two off)
                    with Image.open(io.BytesIO(payloads[maps['txNormal'+channel]])) as image:
                        self.assertEqual((128,128,255), image.convert('RGB').getpixel((0,0)))
                    matched.append(channel)
        self.assertTrue(matched, 'normal_scale=0 must be flat and roughness .5*64/255 must retain gloss alpha223')
        for relative in ("out/sources", "library", "cache", "out/paint-assets", "out/paints", "out/paint-views"):
            shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
        with (mock.patch.object(trackdetail, "_asset", wraps=trackdetail._asset) as assets,
              mock.patch.object(trackdetail, "_detail", wraps=trackdetail._detail) as details):
            index = trackview.index(self.ac, "single_pbr")
        self.assertEqual(1, assets.call_count, "Resolve a shared native asset once across both tiles")
        self.assertEqual(1, details.call_count)
        self.assertFalse(index["paint_errors"])
        refs = index["materials"][0]["splat"]["images"]
        self.assertEqual(1, len(refs))
        self.assertEqual({"normal_scale": 0., "roughness": .5}, refs[0]["properties"])
        self.assertFalse(any(m["name"].startswith(tracknative.PREFIX) for m in index["meshes"]))
        trackcopy.save(self.ac,'single_pbr','single_again','Single again')
        self.assertEqual(Path(self.ac,'content/tracks/single_pbr/single_pbr.kn5').read_bytes(),
                         Path(self.ac,'content/tracks/single_again/single_again.kn5').read_bytes())
        from app import trackpaint
        retained = trackpaint._resolve(self.ac, "single_pbr", "materials", refs[0]["asset"])
        (retained / "normal.png").write_bytes(b"changed after the previous index request")
        self.assertIn("The retained material image has changed", trackview.index(self.ac, "single_pbr")["paint_errors"])

    def test_two_tile_cold_provenance_preserves_global_paint_order(self):
        from app import trackdetail, trackpaint, tracknative
        operations = []
        specifications = [([1], (0, 8, 0, 8)), ([0, 1], (0, 8, 4, 12)), ([0], (0, 8, 8, 16)),
                          ([0, 1], (8, 16, 0, 32)), ([0, 1], (16, 24, 0, 32)), ([0, 1], (24, 32, 0, 32))]
        for k, (tiles, bounds) in enumerate(specifications):
            mask = np.zeros((32, 32), np.uint8)
            y0, y1, x0, x1 = bounds; mask[y0:y1, x0:x1] = 255
            merged = {"tiles": [{"tile": [tile, 0], "mask": base64.b64encode(fixture.png(mask)).decode()} for tile in tiles]}
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + k * 30, 70, 100)),
                                                    [{"mesh": 0, "u": .1, "v": -.1}]))
        self.keep(operations)
        expected = {}
        for descriptor in trackpaint.descriptors(self.ac, self.name, self.revision, operations):
            args = trackdetail._view(self.ac, self.name, descriptor["version"])
            expected[descriptor["i"]] = trackdetail._semantic(self.ac, self.name, *args)[1]
        trackcopy.save(self.ac, self.name, "ordered_tiles", "Ordered tiles")
        shutil.rmtree(Path(self.tmp.name, "out/sources"))
        index = trackview.index(self.ac, "ordered_tiles")
        own = trackview.kn5_path(self.ac, "ordered_tiles")
        self.assertEqual(operations, tracknative.inherited(self.ac, "ordered_tiles", own)["paints"])
        self.assertEqual(operations, trackedits.load(self.ac,'ordered_tiles')['paints'])
        for descriptor in trackpaint.descriptors(self.ac, "ordered_tiles", index["revision"], index['paints']):
            args = trackdetail._view(self.ac, "ordered_tiles", descriptor["version"])
            actual = trackdetail._semantic(self.ac, "ordered_tiles", *args)[1]
            for key, values in expected[descriptor["i"]].items():
                np.testing.assert_array_equal(values, actual[key])
        provenance = Path(own).parent / tracknative.SOURCE_FILE
        original = provenance.read_bytes()
        record = json.loads(original)
        record["paints"].reverse()
        provenance.write_text(json.dumps(record), encoding="utf8")
        with self.assertRaisesRegex(ValueError, "provenance has changed"):
            tracknative.inherited(self.ac, "ordered_tiles", own)
        provenance.write_bytes(original)
        _name, offset, size = kn5.scan(own)["textures"][0]
        with open(own, "r+b") as file:
            file.seek(offset + size - 1); value = file.read(1)[0]
            file.seek(offset + size - 1); file.write(bytes([value ^ 1]))
        with self.assertRaisesRegex(ValueError, "another KN5"):
            tracknative.inherited(self.ac, "ordered_tiles", own)

    def test_cold_mixed_legacy_and_regional_tiles_replay_only_the_unbaked_regional_paints(self):
        from app import trackdetail, tracknative, trackpaint
        operations = []
        for k in range(5):
            mask = np.zeros((32, 32), np.uint8)
            mask[:, k * 8:(k + 1) * 8] = 128 if k < 4 else 0
            if k == 4:
                mask[:, :16] = 128
            tile = 0 if k < 4 else 1
            merged = {"tiles": [{"tile": [tile, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + 30 * k, 60, 100)),
                                                    [{"mesh": tile, "u": .1, "v": -.1}]))
        self.keep(operations)
        trackcopy.save(self.ac, self.name, "mixed_cold", "Mixed cold")
        own = Path(self.ac, "content/tracks/mixed_cold/mixed_cold.kn5")
        before = kn5.read(str(own))
        legacy = before["materials"][1]
        legacy_mask = next(name for slot, _i, name in legacy.maps if slot == "txMask")
        raw_mask = next(raw for name, _active, raw in before["textures"] if name == legacy_mask)
        with Image.open(io.BytesIO(raw_mask)) as image:
            self.assertAlmostEqual(128 / 255, image.convert("RGBA").getpixel((4, 4))[0] / 255, places=2)
        for relative in ("out/sources", "library", "cache", "out/paint-assets", "out/paints", "out/paint-views"):
            shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
        index = trackview.index(self.ac, "mixed_cold")
        self.assertFalse(index["paint_errors"])
        self.assertEqual(operations[:4], tracknative.inherited(self.ac, "mixed_cold", own)["paints"])
        descriptors = trackpaint.descriptors(self.ac, "mixed_cold", index["revision"], index['paints'])
        self.assertEqual([0], [d["i"] for d in descriptors])
        self.assertEqual(4, len(descriptors[0]["layers"]["images"]))
        # The old native mask owns tile1: replaying its original operation would turn .5 into .75.
        self.assertEqual(1, len(index["materials"][1]["splat"]["images"]))
        trackcopy.save(self.ac, "mixed_cold", "mixed_again", "Mixed again")
        second = kn5.read(str(Path(self.ac, "content/tracks/mixed_again/mixed_again.kn5")))
        self.assertEqual(legacy, second["materials"][1])
        self.assertEqual(raw_mask, next(raw for name, _active, raw in second["textures"] if name == legacy_mask))

    def test_native_edit_attenuates_only_new_paints_and_does_not_reapply_an_old_dual_soft_edge(self):
        from app import tracknative, trackpaint
        source = kn5.read(str(self.path))
        textures = [(n, raw) for n, _a, raw in source["textures"]]
        textures += [("old_red.png", fixture.png(np.full((4, 4, 3), (200, 10, 20), np.uint8))),
                     ("old_soft.png", fixture.png(np.broadcast_to(np.arange(32, dtype=np.uint8) * 8, (32, 32))))]
        source["materials"][0] = groundmaterial.dual_layer(source["materials"][0], "old_red.png", "old_soft.png", 2)
        for node in source["root"].children:
            node.vertices = node.vertices.copy()
            node.vertices["uv"] = [(0, 0), (1, 0), (0, -1)]
        kn5.write(str(self.path), textures, source["materials"], source["root"])
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        operations = []
        for k in range(4):
            mask = np.zeros((32, 32), np.uint8); mask[16:, k * 8:(k + 1) * 8] = 128
            merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + 30 * k, 60, 100)),
                                                    [{"mesh": 0, "u": .1, "v": -.1}]))
        self.keep(operations)
        trackcopy.save(self.ac, self.name, "old_soft_new_four", "Old soft edge and four paints")
        saved = kn5.read(str(Path(self.ac, "content/tracks/old_soft_new_four/old_soft_new_four.kn5")))
        self.assertEqual(source["materials"][0], saved["materials"][0])
        from app import trackdetail
        descriptor=trackdetail.native_descriptors(self.ac,self.name,trackpaint.descriptors(self.ac,self.name,self.revision,operations))[0]
        record,path,scan,filename=trackdetail._view(self.ac,self.name,descriptor['version'])
        _semantic,fields,_coverage=trackdetail._semantic(self.ac,self.name,record,path,scan,filename)
        layout=descriptor['layers']
        for x,y in ((4,5),(4,28)):
            actual=self._saved_region_weights(saved,layout,fields,x,y)
            for key,values in fields.items(): self.assertAlmostEqual(float(values[y,x]),actual[key],delta=2/255)
            self.assertAlmostEqual(1.,sum(actual.values()),delta=4/255)     # (saved masks are BC7: textures.bc7_weights)
        source_ids=[key for key in fields if key.startswith('source:')]
        self.assertEqual(1,len(source_ids))
        # Legacy dual's mask weights its original tile: its red replacement is
        # 1-mask, attenuated by the new .5 paint exactly once in the lower area.
        self.assertAlmostEqual(1-32/255,float(fields[source_ids[0]][5,4]),delta=2/255)
        self.assertAlmostEqual((1-32/255)*(1-128/255),float(fields[source_ids[0]][28,4]),delta=2/255)
        shutil.rmtree(Path(self.tmp.name, "out/sources"))
        revision = trackview.index(self.ac, "old_soft_new_four")["revision"]
        self.assertTrue(revision)
        trackcopy.save(self.ac, "old_soft_new_four", "old_soft_again", "Old soft again")
        second = kn5.read(str(Path(self.ac, "content/tracks/old_soft_again/old_soft_again.kn5")))
        self.assertEqual(source["materials"][0], second["materials"][0])
        for x,y in ((4,5),(4,28)):
            self.assertEqual(self._saved_region_weights(saved,layout,fields,x,y),self._saved_region_weights(second,layout,fields,x,y))

    def test_native_edit_preserves_portable_splat_source_roles_with_snapshot_metadata_warm_and_cold(self):
        from app import trackdetail, tracknative, trackpaint
        source = kn5.read(str(self.path))
        for node in source["root"].children:
            node.vertices = node.vertices.copy()
            node.vertices["uv"] = [(0, 0), (1, 0), (0, -1)]
        kn5.write(str(self.path), [(n, raw) for n, _a, raw in source["textures"]], source["materials"], source["root"])
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        colour = materiallibrary.prepare("old.png", fixture.png(np.full((4, 4, 3), (200, 10, 20), np.uint8)))
        normal = materiallibrary.prepare("old-normal.png", fixture.png(np.full((4, 4, 3), (128, 170, 245), np.uint8)), role="normal")
        old_asset = materiallibrary.add({"token": colour["token"], "filename": "old.png", "name": "Old portable PBR metadata",
                                         "category": "soil", "repeat": [2, 3], "variation": False,
                                         "maps": {"normal": {"token": normal["token"], "filename": "old-normal.png"}}})["material"]["id"]
        masks = [np.broadcast_to(np.arange(32, dtype=np.uint8) * 8, (32, 32))]
        for k in range(4):
            mask = np.zeros((32, 32), np.uint8); mask[16:, k * 8:(k + 1) * 8] = 128
            masks.append(mask)
        operations = []
        for k, mask in enumerate(masks):
            merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            asset = old_asset if k == 0 else self.material((30 + 30 * k, 60, 100))
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, asset, [{"mesh": 0, "u": .1, "v": -.1}]))
            if k == 0:
                self.keep(operations)
                with mock.patch.object(trackdetail, "native_descriptors", side_effect=lambda _ac, _name, ds: ds):
                    trackcopy.save(self.ac, self.name, "old_splat", "Old splat")
                shutil.rmtree(Path(self.tmp.name, "out/sources"))
                self.name = "old_splat"
                self.revision = trackview.index(self.ac, self.name)["revision"]
                operations = []
        answer = self.keep(operations)
        source_refs = [r for r in answer["textures"][0]["layers"]["images"] if r["id"].startswith("source:")]
        self.assertEqual(1, len(source_refs))
        self.assertIn("asset", source_refs[0], "Token role must win over the presence of retained snapshot metadata")
        source_material = kn5.read(trackview.kn5_path(self.ac, self.name))["materials"][0]
        descriptor=trackdetail.native_descriptors(self.ac,self.name,[answer['textures'][0]])[0]
        record,path,scan,filename=trackdetail._view(self.ac,self.name,descriptor['version'])
        _semantic,fields,_coverage=trackdetail._semantic(self.ac,self.name,record,path,scan,filename)
        layout=descriptor['layers']
        trackcopy.save(self.ac, self.name, "splat_four", "Splat plus four")
        for cold_name in ("splat_four", "splat_again"):
            saved = kn5.read(str(Path(self.ac, f"content/tracks/{cold_name}/{cold_name}.kn5")))
            self.assertEqual(source_material, saved["materials"][0])
            for x,y in ((4,5),(4,28)):
                actual=self._saved_region_weights(saved,layout,fields,x,y)
                self.assertAlmostEqual(1.,sum(actual.values()),delta=4/255)     # (saved masks are BC7: textures.bc7_weights)
                for key,values in fields.items(): self.assertAlmostEqual(float(values[y,x]),actual[key],delta=2/255)
            old=next(key for key in fields if key.startswith('source:'))
            self.assertAlmostEqual(32/255,float(fields[old][5,4]),delta=2/255)
            self.assertAlmostEqual(32/255*(1-128/255),float(fields[old][28,4]),delta=2/255)
            if cold_name == "splat_four":
                for relative in ("out/sources", "library", "cache", "out/paint-assets", "out/paints", "out/paint-views"):
                    shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
                self.assertFalse(trackview.index(self.ac, cold_name)["paint_errors"])
                trackcopy.save(self.ac, cold_name, "splat_again", "Splat again")

    def test_edit_can_override_variation_without_reimporting_or_changing_the_library(self):
        asset = self.detail_asset()
        first = trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": 0, "material": asset,
                                "variation": False, "points": [{"mesh": 0, "u": .1, "v": -.5}]})["paint"]
        layout = self.keep([first])["textures"][0]["layers"]
        self.assertFalse(layout["images"][0]["variation"])
        self.assertTrue(materiallibrary.get(asset)["variation"])
        materiallibrary.remove(asset)
        from app import trackdetail
        self.assertTrue(trackdetail.image(self.ac, self.name, layout["images"][0]["asset"]).startswith(b"DDS "))


    def test_mask_preparation_survives_a_restart_without_recalculating_weights(self):
        import importlib
        from app import trackdetail
        version = self.keep([self.operation(self.detail_asset())])["textures"][0]["version"]
        weights = trackdetail._cache(version, "weights").with_suffix(".png")
        self.assertTrue(weights.is_file())
        importlib.reload(trackdetail)
        with mock.patch.object(trackdetail, "_compute", side_effect=AssertionError("computed the mask twice")):
            self.assertTrue(trackdetail.mask(self.ac, self.name, version).startswith(b"DDS "))

    def test_transparent_ground_is_refused_before_retaining_any_paint_data(self):
        staged = materiallibrary.prepare("cutout.png", fixture.png(np.full((8, 8, 4), (100, 90, 80, 100), np.uint8)))
        asset = materiallibrary.add({"token": staged["token"], "filename": "cutout.png", "name": "Cutout",
                                    "category": "grass", "repeat": [2, 2]})["material"]["id"]
        with self.assertRaisesRegex(trackedits.Invalid, "opaque"):
            trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": 0, "material": asset,
                             "points": [{"mesh": 0, "u": .1, "v": -.5}]})
        self.assertFalse(Path(self.tmp.name, "out/paints").exists())
        self.assertFalse(Path(self.tmp.name, "out/paint-assets").exists())

    def test_inspector_reports_the_texture_at_the_clicked_area_without_baking_a_tile(self):
        from app import trackinspect, trackpaint
        op = self.operation(self.detail_asset())
        descriptor = self.keep([op])["textures"][0]
        with mock.patch.object(trackpaint, "texture", side_effect=AssertionError("baked a tile")):
            info = trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision, descriptor["version"])
            original = trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision, descriptor["version"])
        self.assertEqual("Fine detail", info["name"])
        self.assertEqual([2, 3], info["repeat"])
        self.assertFalse(info["original"])
        self.assertIn("/paint-preview/", info["preview"])
        self.assertTrue(original["original"])
        self.assertTrue(trackinspect.appearance(self.ac, self.name, 0, .1, -.5, self.revision)["original"])
        trackcopy.save(self.ac, self.name, "inspector_copy", "Inspector")
        shutil.rmtree(Path(self.tmp.name, "library"))
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        copied = trackinspect.appearance(self.ac, "inspector_copy", 0, .1, -.5, self.revision, descriptor["version"])
        self.assertEqual("Fine detail", copied["name"])
        with Image.open(io.BytesIO(trackinspect.paint_preview(self.ac, "inspector_copy", descriptor["layers"]["images"][0]["asset"]))) as image:
            self.assertLessEqual(max(image.size), 256)
        with self.assertRaises(trackview.Unreadable):
            trackinspect.appearance(self.ac, self.name, 0, .1, -.5, "old", descriptor["version"])
        metadata = Path(self.ac, "content/tracks/inspector_copy/data/map2lap.json")
        metadata.write_text('{"title":"Portable"}', encoding="utf-8")
        revision = trackview.index(self.ac, "inspector_copy")["revision"]
        portable = trackinspect.appearance(self.ac, "inspector_copy", 0, .1, -.5, revision)
        self.assertEqual("Fine detail", portable["name"])
        self.assertEqual([2, 3], portable["repeat"])

    def test_variation_survives_save_and_reload_and_discard_restores_only_our_config(self):
        op = self.operation(self.detail_asset())
        descriptor = self.keep([op])["textures"][0]
        self.assertTrue(descriptor["layers"]["images"][0].get("variation"))
        extension = self.folder / "extension"
        extension.mkdir()
        original = "[WATER_FX]\nACTIVE = 1\n"
        (extension / "ext_config.ini").write_text(original, encoding="utf-8")
        trackcopy.save(self.ac, self.name)
        config = (extension / "map2lap_ground.ini").read_text(encoding="utf-8")
        self.assertIn("SHADER = ksMultilayer_objsp_nm4", config)
        self.assertIn("tilingFixR, 1", config)
        self.assertIn("tilingFixA, 0", config)
        self.assertIn(original, (extension / "ext_config.ini").read_text(encoding="utf-8"))
        trackcopy.save(self.ac, self.name)
        self.assertEqual(1, (extension / "ext_config.ini").read_text(encoding="utf-8").count("[INCLUDE: map2lap_ground.ini]"))
        self.keep([])
        trackcopy.save(self.ac, self.name)
        self.assertEqual(original, (extension / "ext_config.ini").read_text(encoding="utf-8"))
        self.assertFalse((extension / "map2lap_ground.ini").exists())

    def test_imported_material_variation_is_immutable_and_can_be_disabled(self):
        staged = materiallibrary.prepare("pattern.png", fixture.png(np.full((8, 8, 3), (100, 90, 80), np.uint8)))
        settings = {"token": staged["token"], "filename": "pattern.png", "name": "Pattern", "category": "asphalt", "repeat": [2, 2]}
        varied = materiallibrary.add({**settings, "variation": True})["material"]
        regular = materiallibrary.add({**settings, "variation": False})["material"]
        self.assertNotEqual(varied["id"], regular["id"])
        self.assertFalse(regular["variation"])
        layout = self.keep([self.operation(regular["id"])])["textures"][0]["layers"]
        self.assertFalse(layout["images"][0].get("variation"))

    def test_older_saved_paints_can_be_saved_again_to_upgrade_the_native_material(self):
        op = self.operation(self.detail_asset())
        self.keep([op])
        trackcopy.save(self.ac, self.name, "upgrade", "Upgrade")
        metadata = Path(self.ac, "content/tracks/upgrade/data/map2lap.json")
        info = json.loads(metadata.read_text(encoding="utf-8"))
        info["edits"].pop("detail_profile", None)
        metadata.write_text(json.dumps(info), encoding="utf-8")
        self.assertTrue(trackedits.load(self.ac, "upgrade")["saved"].get("needs_save"))
        self.assertGreater(trackedits.changes(self.ac, "upgrade"), 0)
        trackcopy.save(self.ac, "upgrade")
        self.assertFalse(trackedits.load(self.ac, "upgrade")["saved"].get("needs_save"))
        self.assertEqual(0, trackedits.changes(self.ac, "upgrade"))

    def test_paints_saved_before_the_region_copies_reached_the_tile_edges_can_be_saved_again(self):
        # Their region copies left a 12.9 mm slit between tiles (tracknative._cuts): a Save writes them anew.
        self.keep([self.operation(self.detail_asset())])
        trackcopy.save(self.ac, self.name, "slit", "Slit")
        self.assertFalse(trackedits.load(self.ac, "slit")["saved"].get("needs_save"))
        metadata = Path(self.ac, "content/tracks/slit/data/map2lap.json")
        info = json.loads(metadata.read_text(encoding="utf-8"))
        info["edits"].pop("region_geometry")
        metadata.write_text(json.dumps(info), encoding="utf-8")
        self.assertTrue(trackedits.load(self.ac, "slit")["saved"].get("needs_save"))
        trackcopy.save(self.ac, "slit")
        self.assertFalse(trackedits.load(self.ac, "slit")["saved"].get("needs_save"))

    def test_paints_saved_with_pbr_ground_as_a_csp_replacement_can_be_saved_again(self):
        # Their PBR images were bound by a CSP replacement and stayed black in AC: a Save writes the shader itself.
        self.keep([self.operation(self.detail_asset())])
        trackcopy.save(self.ac, self.name, "black", "Black")
        metadata = Path(self.ac, "content/tracks/black/data/map2lap.json")
        info = json.loads(metadata.read_text(encoding="utf-8"))
        info["edits"].pop("pbr_format")
        metadata.write_text(json.dumps(info), encoding="utf-8")
        self.assertTrue(trackedits.load(self.ac, "black")["saved"].get("needs_save"))
        trackcopy.save(self.ac, "black")
        self.assertFalse(trackedits.load(self.ac, "black")["saved"].get("needs_save"))

    def test_apply_describes_a_separate_full_resolution_image_and_mask_without_compositing(self):
        from app import trackdetail, trackpaint
        op = self.operation(self.detail_asset())
        with mock.patch.object(trackpaint, "texture", side_effect=AssertionError("baked a tile")):
            answer = self.keep([op])
            index = trackview.index(self.ac, self.name)
        layer = answer["textures"][0]["layers"]
        self.assertEqual(0, layer["base"]["i"])
        self.assertEqual([0, 0], layer["origin"])
        self.assertEqual([128, 256 / 3], layer["images"][0]["scale"])
        self.assertEqual(layer, index["materials"][0]["splat"])
        self.assertTrue(layer["mask"]["linear"])
        asset = layer["images"][0]["asset"]
        with Image.open(io.BytesIO(trackdetail.image(self.ac, self.name, asset))) as photo:
            self.assertEqual((128, 128), photo.size)
        reset = self.keep([])
        self.assertTrue(all(not d.get("layers") and not d["version"] for d in reset["textures"]))
        restored = self.keep([op])
        self.assertEqual(layer, restored["textures"][0]["layers"])

    def test_mask_keeps_unselected_road_and_repainting_does_not_exhaust_the_palette(self):
        from app import trackdetail
        operations = [self.operation(self.material(c)) for c in [(200, 20, 30), (40, 190, 30), (40, 30, 180), (180, 140, 20)]]
        answer = self.keep(operations)
        layer = answer["textures"][0]["layers"]
        self.assertEqual(1, len(layer["images"]))
        version=answer['textures'][0]['version']
        selected=trackdetail.sample_mask(self.ac,self.name,version,5.5/32,5.5/32-1)
        road=trackdetail.sample_mask(self.ac,self.name,version,16.5/32,16.5/32-1)
        self.assertEqual((255,0),(selected[0],selected[3]))
        self.assertEqual((0,255),(road[0],road[3]))

    def test_same_colour_at_different_repeat_sizes_shares_one_embedded_image(self):
        first = self.operation(self.material((180, 30, 40), (2, 2)))
        second = self.operation(self.material((180, 30, 40), (3, 4)), .5, -.5)
        descriptor = self.keep([first, second])["textures"][0]
        images = descriptor["layers"]["images"]
        self.assertEqual(2, len(images))
        self.assertEqual(images[0]["key"], images[1]["key"])
        self.assertNotEqual(images[0]["scale"], images[1]["scale"])
        trackcopy.save(self.ac, self.name, "shared_copy", "Shared image")
        saved = kn5.read(str(Path(self.ac, "content/tracks/shared_copy/shared_copy.kn5")))
        self.assertEqual(1, sum(name == images[0]["name"] for name, _active, _raw in saved["textures"]))

    def test_portable_material_preserves_two_scales_of_the_same_image_when_painted_again(self):
        from app import trackpaint
        first = self.operation(self.material((180, 30, 40), (2, 2)))
        second = self.operation(self.material((180, 30, 40), (3, 4)), .5, -.5)
        self.keep([first, second])
        trackcopy.save(self.ac, self.name, "portable", "Portable")
        folder = Path(self.ac, "content/tracks/portable")
        (folder / "data/map2lap.json").write_text('{"title":"portable"}', encoding="utf-8")
        revision = trackview.index(self.ac, "portable")["revision"]
        selected = np.zeros((32, 32), np.uint8); selected[:8, :8] = 255
        merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(selected)).decode()}]}
        with selected_masks(merged):
            op = trackpaint.create(self.ac, "portable", revision, self.material((20, 30, 200)), [{"mesh": 0, "u": .1, "v": -.5}])
        descriptors = trackpaint.descriptors(self.ac, "portable", revision, [op])
        source_images = [p for p in descriptors[0]["layers"]["images"] if "i" in p]
        self.assertEqual(2, len(source_images))
        self.assertEqual(source_images[0]["i"], source_images[1]["i"])
        self.assertNotEqual(source_images[0]["scale"], source_images[1]["scale"])

    def test_portable_source_material_metadata_survives_another_edit_and_save(self):
        from app import trackinspect, trackpaint
        first = self.operation(self.detail_asset())
        descriptor = self.keep([first])["textures"][0]
        asset = descriptor["layers"]["images"][0]["asset"]
        trackcopy.save(self.ac, self.name, "portable", "Portable")
        folder = Path(self.ac, "content/tracks/portable")
        # A transferred track has its own native layers, without the original computer's source/draft cache.
        shutil.rmtree(Path(self.tmp.name, "out"))
        shutil.rmtree(Path(self.tmp.name, "library"))
        shutil.rmtree(Path(self.tmp.name, "cache"))
        revision = trackview.index(self.ac, "portable")["revision"]
        trackview.prepare_surface(self.ac, "portable", 0, revision)
        op = trackpaint.create(self.ac, "portable", revision, self.material((20, 30, 200)),
                               [{"mesh": 0, "u": .5, "v": -.5}])
        now = trackedits.load(self.ac, "portable")
        trackedits.save_telling(self.ac, "portable", {"base": revision, "revision": now["revision"], "id": "paint", "deleted": [], "paints": [op]})
        trackcopy.save(self.ac, "portable", "portable_again", "Portable again")
        retained = Path(self.ac, "content/tracks/portable_again") / trackpaint.BUNDLE / "materials" / asset
        self.assertTrue((retained / "asset.json").is_file(), "native source layer lost its material metadata")
        self.assertTrue((retained / "colour.png").is_file())
        shutil.rmtree(Path(self.tmp.name, "out"))
        shutil.rmtree(folder)
        revision = trackview.index(self.ac, "portable_again")["revision"]
        info = trackinspect.appearance(self.ac, "portable_again", 0, .1, -.5, revision)
        self.assertEqual("Fine detail", info["name"])
        self.assertEqual([2, 3], info["repeat"])
        self.assertTrue(trackinspect.paint_preview(self.ac, "portable_again", asset).startswith(b"\x89PNG"))

    def test_world_colour_source_survives_a_partial_ground_replacement(self):
        from app import trackdetail, trackinspect, trackpaint
        native = kn5.read(str(self.path))
        textures = [(name, raw) for name, _active, raw in native["textures"]]
        textures += [("old_photo.png", fixture.png(np.full((16, 16, 3), (200, 100, 30), np.uint8))), *groundmaterial.textures()]
        native["materials"][0] = groundmaterial.world_colour(native["materials"][0], "old_photo.png", 2)
        kn5.write(str(self.path), textures, native["materials"], native["root"])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        original = trackinspect.appearance(self.ac, self.name, 0, .5, -.5, self.revision)
        self.assertFalse(original["original"])
        self.assertEqual([2, 2], original["repeat"])
        selected = np.zeros((32, 32), np.uint8)
        selected[:8, :8] = 255
        merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(selected)).decode()}]}
        with selected_masks(merged):
            op = self.operation(self.detail_asset())
        descriptor = trackpaint.descriptors(self.ac, self.name, self.revision, [op])[0]
        layout = descriptor["layers"]
        old = next((ref for ref in layout["images"] if ref["name"] == "old_photo.png"), None)
        self.assertIsNotNone(old, "existing world-space colour was discarded")
        self.assertEqual([128, 128], old["scale"])
        self.assertEqual(255,trackdetail.sample_mask(self.ac,self.name,descriptor['version'],20.5/32,20.5/32-1)[old['channel']])
        self.assertEqual(0,trackdetail.sample_mask(self.ac,self.name,descriptor['version'],2.5/32,2.5/32-1)[old['channel']])

    def test_dense_six_way_soft_weights_remain_editable_and_native_save_refuses(self):
        self._six_material_source(distributed=False)

    def _six_material_source(self, distributed):
        """Actual source selections and snapshots, not fabricated palette ids or mutable texture handles."""
        native = kn5.read(str(self.path))
        node = native["root"].children[0]
        z, x = np.mgrid[:257:2, :257:2]
        vertices = np.zeros(x.size, kn5.VERTEX)
        vertices["pos"][:, 0] = x.ravel()
        vertices["pos"][:, 2] = -z.ravel()
        vertices["normal"] = (0, 1, 0)
        vertices["tangent"] = (1, 0, 0)
        vertices["uv"] = np.c_[x.ravel() / 256, -z.ravel() / 256]
        row, col = np.mgrid[:128, :128]
        a = (row * 129 + col).ravel()
        node.vertices = vertices
        node.indices = np.stack([a, a + 129, a + 130, a, a + 130, a + 1], axis=1).astype("<u2").ravel()
        kn5.write(str(self.path), [(name, raw) for name, _active, raw in native["textures"]], native["materials"], native["root"])
        cuts = np.linspace(0, 32, 7).astype(int)
        ids = np.broadcast_to(np.searchsorted(cuts[1:-1], np.arange(32), side="right"), (32, 32)).astype(np.uint8)
        part = str(self.folder / "t_0_0.obj")
        paint = editorinfo.Paint(part, 0, 0, 32)
        paint.base([f"source_grass{k}" for k in range(6)], ids)
        yy, xx = np.indices((32, 32))
        soft = np.rint(45 * np.maximum(0, 1 - np.hypot(xx - 16, yy - 16) / 8)).astype(np.uint8)
        for k in range(6):
            values = np.where(abs(xx-cuts[k])<=1,64,0).astype(np.uint8) if distributed and k else np.zeros_like(soft) if distributed else soft
            paint.layer(f"source_grass{k}", values)
        paint.finish()
        editorinfo.install(str(self.path), [part])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        trackview.prepare_surface(self.ac, self.name, 0, self.revision)
        original_vertices, original_indices = fixture.geometry(node.vertices), node.indices.tobytes()
        original_weight = {f"source_grass{k}": editorinfo._weight(editorinfo._folder(str(self.path)), "0_0", f"source_grass{k}")
                           for k in range(6)}
        if not distributed:
            self.assertEqual(6, sum(values[16, 16] > 0 for values in original_weight.values()))
        operations, snapshots = [], []
        for k in range(6):
            colour = materiallibrary.prepare(f"colour{k}.png", fixture.png(np.full((32, 32, 3), (40 + 30 * k, 180 - 20 * k, 65 + 20 * k), np.uint8)))
            normal = materiallibrary.prepare("normal.png", fixture.png(np.full((16, 16, 3), (145, 135, 252), np.uint8)), role="normal")
            roughness = materiallibrary.prepare("roughness.png", fixture.png(np.full((16, 16), 35 + 30 * k, np.uint8)), role="roughness")
            asset = materiallibrary.add({"token": colour["token"], "filename": f"colour{k}.png", "name": f"PBR grass {k}",
                                         "category": "grass", "repeat": [2, 3] if k % 2 == 0 else [3, 2], "variation": bool(k % 2),
                                         "maps": {"normal": {"token": normal["token"], "filename": "normal.png"},
                                                  "roughness": {"token": roughness["token"], "filename": "roughness.png"}}})["material"]
            now = trackedits.load(self.ac, self.name)
            answer = trackedits.paint(self.ac, self.name, {"base": self.revision, "revision": now["revision"], "material": asset["id"],
                                      "points": [{"mesh": 0, "u": (cuts[k] + cuts[k + 1]) / 64, "v": -.1, "whole": True}]})
            operations.append(answer["paint"])
            self.keep(operations)
        from app import trackpaint
        layers, assets = trackpaint._layers(self.ac, self.name, self.revision, operations, (0, 0))
        self.assertEqual(6, len(assets))
        for _number, label, raw in layers:
            with Image.open(io.BytesIO(raw)) as image:
                np.testing.assert_array_equal(np.array(image), original_weight[label])
        for operation in operations:
            _folder, record = trackpaint.operation(self.ac, self.name, operation)
            snapshots.append(record["asset"])
        if not distributed:
            # Explicit interim limitation: a real six-way soft junction stays fully editable,
            # but native Save refuses it atomically. Full native support remains a release requirement.
            before = Path(self.path).read_bytes()
            draft = trackedits.load(self.ac, self.name)
            with self.assertRaisesRegex(trackcopy.Refused, 'more than four.*local transition/filter halo'):
                trackcopy.save(self.ac, self.name, 'six_pbr', 'Six-way release gate')
            self.assertEqual(before, Path(self.path).read_bytes())
            self.assertEqual(draft, trackedits.load(self.ac, self.name))
            self.assertFalse(Path(self.ac,'content/tracks/six_pbr').exists())
            self.assertFalse(any(p.name.startswith(trackcopy.TEMPORARY) for p in Path(self.ac,'content/tracks').iterdir()))
            for relative in ('library','cache'):
                shutil.rmtree(Path(self.tmp.name,relative),ignore_errors=True)
            trackpaint.validate(self.ac,self.name,self.revision,operations)
            self.assertEqual(6,len(trackview.index(self.ac,self.name)['materials'][0]['splat']['images']))
            for snapshot in snapshots:
                retained=trackpaint._resolve(self.ac,self.name,'materials',snapshot)
                meta=trackpaint._verified(retained/'asset.json',snapshot)
                trackpaint._validate_asset(retained,meta)
                self.assertEqual({'colour','normal','roughness'},set(meta['original']['maps']))
            return
        trackcopy.save(self.ac, self.name, "six_pbr", "Six portable PBR materials")
        folder = Path(self.ac, "content/tracks/six_pbr")
        saved = kn5.read(str(folder / "six_pbr.kn5"))
        self.assertEqual(original_vertices, fixture.geometry(saved["root"].children[0].vertices))
        self.assertEqual(original_indices, saved["root"].children[0].indices.tobytes())
        self.assertTrue(all(n.name.startswith("nocol_") for n in saved["root"].children[2:] if n.cls == 2))
        for snapshot in snapshots:
            retained = folder / trackpaint.BUNDLE / "materials" / snapshot
            meta = trackpaint._verified(retained / "asset.json", snapshot)
            self.assertEqual({"colour", "normal", "roughness"}, set(meta["maps"]))
            trackpaint._validate_asset(retained, meta)
        config = (folder / "extension/map2lap_ground.ini").read_text(encoding="utf8")
        self.assertIn("ksMultilayer_objsp_nm4", config)
        for relative in ("library", "cache", "out/paints", "out/paint-assets", "out/paint-views"):
            shutil.rmtree(Path(self.tmp.name, relative), ignore_errors=True)
        # Sources are retained originals, not a disposable cache. Rebuild every derived view from saved bundles.
        trackpaint.validate(self.ac, "six_pbr", self.revision, operations)
        reopened = trackview.index(self.ac, "six_pbr")
        self.assertFalse(reopened["paint_errors"])
        self.assertEqual(set(operations), set(reopened["paints"]))
        rebuilt = trackpaint.descriptors(self.ac, "six_pbr", self.revision, operations)
        self.assertEqual(set(snapshots), {image["asset"] for descriptor in rebuilt for image in descriptor["layers"]["images"] if "asset" in image})
        self.assertTrue(trackview.mesh_bytes(self.ac, "six_pbr", 0, self.revision))
        for snapshot in snapshots:
            self.assertTrue((trackpaint._resolve(self.ac, "six_pbr", "materials", snapshot) / "normal.png").is_file())
            self.assertTrue((trackpaint._resolve(self.ac, "six_pbr", "materials", snapshot) / "roughness.png").is_file())
        self.assertEqual(6, len(trackedits.load(self.ac, "six_pbr")["paints"]))


    def test_four_colour_only_materials_are_not_limited_by_shader_slots(self):
        from app import trackdetail, trackpaint
        operations = []
        for i in range(4):
            mask = np.zeros((32, 32), np.uint8)
            mask[i * 8:(i + 1) * 8] = 255
            merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + 40 * i, 30, 40)),
                                                   [{"mesh": 0, "u": .1, "v": -.5}]))
        self.keep(operations[:3])
        version = trackpaint._plan(self.ac, self.name, self.revision, operations)[0]
        record, path, scan, filename = trackdetail._view(self.ac, self.name, version)
        semantic, weights, coverage = trackdetail._semantic(self.ac, self.name, record, path, scan, filename)
        self.assertEqual(4, len(weights))
        self.assertEqual({image["id"] for image in semantic["images"]}, set(weights))
        self.assertTrue(all(image["properties"] == {"roughness": 1., "normal_scale": 1.} for image in semantic["images"]))
        self.assertTrue(all(set(image["maps"]) == {"colour"} for image in semantic["images"]))
        np.testing.assert_array_equal(coverage, 1)
        answer = self.keep(operations)
        self.assertEqual(4, len(answer["textures"][0]["layers"]["images"]))
        self.assertEqual(operations, trackedits.load(self.ac, self.name)["paints"])


    def test_semantic_composition_retains_four_independent_materials_before_native_encoding(self):
        from app import trackdetail, trackpaint
        operations = []
        for i in range(4):
            mask = np.zeros((32, 32), np.uint8)
            mask[i * 8:(i + 1) * 8] = 255
            merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + 40 * i, 30, 40)),
                                                   [{"mesh": 0, "u": .1, "v": -.5}]))
        self.keep(operations[:3])
        version = trackpaint._plan(self.ac, self.name, self.revision, operations)[0]
        record, path, scan, filename = trackdetail._view(self.ac, self.name, version)
        semantic, weights, coverage = trackdetail._semantic(self.ac, self.name, record, path, scan, filename)
        self.assertEqual(4, len(weights))
        self.assertEqual({image["id"] for image in semantic["images"]}, set(weights))
        self.assertTrue(all(image["properties"] == {"roughness": 1., "normal_scale": 1.} for image in semantic["images"]))
        self.assertTrue(all(set(image["maps"]) == {"colour"} for image in semantic["images"]))
        np.testing.assert_array_equal(coverage, 1)

    def test_fourth_material_is_committed_to_the_draft_with_regional_render_inputs(self):
        from app import trackpaint
        operations = []
        for i in range(4):
            mask = np.zeros((32, 32), np.uint8)
            mask[i * 8:(i + 1) * 8] = 255
            merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
            with selected_masks(merged):
                operations.append(trackpaint.create(self.ac, self.name, self.revision, self.material((30 + 40 * i, 30, 40)),
                                                   [{"mesh": 0, "u": .1, "v": -.5}]))
        self.keep(operations[:3])
        before = trackedits.load(self.ac, self.name)["revision"]
        answer = self.keep(operations)
        self.assertEqual(before + 1, trackedits.load(self.ac, self.name)["revision"])
        self.assertEqual(operations, trackedits.load(self.ac, self.name)["paints"])
        layout = answer["textures"][0]["layers"]
        self.assertEqual(4, len(layout["images"]))
        self.assertIn("ground", layout)

    def test_a_copy_rebinds_immutable_resource_urls_to_its_own_name(self):
        from app import trackdetail
        op = self.operation(self.detail_asset())
        version = self.keep([op])["textures"][0]["version"]
        trackcopy.save(self.ac, self.name, "portable_copy", "Portable")
        shutil.rmtree(self.folder)
        descriptor = trackdetail.describe(self.ac, "portable_copy", version)
        self.assertIn("/portable_copy/", descriptor["mask"]["url"])
        self.assertIn("/portable_copy/", descriptor["images"][0]["url"])
        self.assertTrue(trackdetail.mask(self.ac, "portable_copy", version).startswith(b"DDS "))

    def test_full_resolution_image_and_mask_are_available_over_the_editor_http_api(self):
        import server
        from app import settings
        op = self.operation(self.detail_asset())
        layout = self.keep([op])["textures"][0]["layers"]
        http = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=http.serve_forever, daemon=True).start()
        self.addCleanup(http.server_close)
        self.addCleanup(http.shutdown)
        origin = f"http://127.0.0.1:{http.server_address[1]}"
        with mock.patch.object(settings, "ac_path", return_value=self.ac):
            for ref in [layout["mask"], *layout["images"]]:
                with urllib.request.urlopen(origin + ref["url"]) as answer:
                    raw = answer.read()
                    self.assertEqual(200, answer.status)
                    self.assertEqual(b"DDS ", raw[:4])
                    self.assertEqual(ref["size"], len(raw))
            with urllib.request.urlopen(origin + f"/api/editor/{self.name}/appearance?mesh=0&u=.1&v=-.5&r={self.revision}&p={layout['mask']['key']}") as answer:
                info = json.load(answer)
                self.assertEqual("Fine detail", info["name"])
            with urllib.request.urlopen(origin + info["preview"]) as answer:
                self.assertEqual("image/png", answer.headers["Content-Type"])
                self.assertTrue(answer.read().startswith(b"\x89PNG"))

    def test_save_keeps_original_tiles_and_embeds_shared_detail_and_mask_in_native_materials(self):
        op = self.operation(self.detail_asset())
        self.keep([op])
        before = kn5.read(str(self.path))
        trackcopy.save(self.ac, self.name, "detail_copy", "Detail copy")
        copied = Path(self.ac, "content/tracks/detail_copy/detail_copy.kn5")
        saved = kn5.read(str(copied))
        textures = {name: raw for name, _active, raw in saved["textures"]}
        self.assertEqual([t[0] for t in before["textures"]], [t[0] for t in saved["textures"]][:len(before["textures"])])
        for name, _active, raw in before["textures"]:     # (an edited tile samples the build's image itself, at its scale)
            self.assertEqual(raw, textures[name])
        self.assertEqual("ksMultilayer_objsp", saved["materials"][0].shader)
        maps = {slot: name for slot, _i, name in saved["materials"][0].maps}
        self.assertEqual(groundmaterial.WHITE, maps["txDiffuse"])
        self.assertEqual("ground_0_0.png", maps["txDetailA"])
        with Image.open(io.BytesIO(textures[maps["txDetailR"]])) as photo:
            self.assertEqual((128, 128), photo.size)
        for a, b in zip(before["root"].children, saved["root"].children):
            np.testing.assert_array_equal(a.vertices["pos"], b.vertices["pos"])
            np.testing.assert_array_equal(a.indices, b.indices)
        np.testing.assert_allclose(before["root"].children[1].vertices["uv"] + (1, 0),
            saved["root"].children[1].vertices["uv"] * trackview._mask_extent(saved['materials'][1]), atol=1e-7)
        shutil.rmtree(Path(self.tmp.name, "library"))
        shutil.rmtree(Path(self.tmp.name, "cache"), ignore_errors=True)
        shutil.rmtree(Path(self.tmp.name, "out/paint-assets"))
        shutil.rmtree(Path(self.tmp.name, "out/paints"))
        self.assertEqual([op], trackedits.load(self.ac, "detail_copy")["paints"])
        index = trackview.index(self.ac, "detail_copy")
        self.assertTrue(index["materials"][0].get("splat"))
        self.assertFalse(index["paint_errors"])
        # Copying without the local source cache still preserves a native material and usable surface selection.
        (copied.parent / "data/map2lap.json").write_text('{"title":"portable"}', encoding="utf-8")
        portable = trackview.index(self.ac, "detail_copy")
        self.assertTrue(portable["materials"][0].get("splat"))
        self.assertTrue(portable["materials"][0]["splat"]["images"][0]["variation"])
        trackview.prepare_surface(self.ac, "detail_copy", 1, portable["revision"])
        selected = trackview.surface(self.ac, "detail_copy", 1, 1.1, -.5, portable["revision"])
        self.assertEqual("gc_meadow", selected["material"])


class SavedStepMaskTest(unittest.TestCase):
    """The Editor shows a painted tile's material borders at the saved step (textures.SAVED_WEIGHT_STEP), as AC gets them:
    a 128 px tile (the fixture's 32 px tiles stay at their own resolution: 32 px do not divide into 16 such texels)."""
    material = fixture.PaintTest.material
    keep = fixture.PaintTest.keep

    def setUp(self):
        DetailTest.setUp(self)
        native = kn5.read(str(self.path))
        textures = [(n, fixture.png(np.full((128, 128, 3), (30, 150, 40), np.uint8)) if n == "ground_0_0.png" else raw)
                    for n, _a, raw in native["textures"]]
        kn5.write(str(self.path), textures, native["materials"], native["root"])
        self.revision = trackview.index(self.ac, self.name)["revision"]

    def paint(self, colour, rows, soft=None):
        """A plain colour over rows (of the 32 px selection) of tile 0, half over the row soft."""
        from app import trackpaint
        mask = np.zeros((32, 32), np.uint8)
        mask[rows] = 255
        if soft is not None:
            mask[soft] = 128
        merged = {"tiles": [{"tile": [0, 0], "mask": base64.b64encode(fixture.png(mask)).decode()}]}
        with selected_masks(merged):
            return trackpaint.create(self.ac, self.name, self.revision, self.material(colour), [{"mesh": 0, "u": .1, "v": -.5}])

    def test_a_painted_tile_shows_its_borders_at_the_saved_step_made_without_its_full_size_mask(self):
        from track import textures
        op = self.paint((200, 30, 40), slice(0, 13), 13)
        with mock.patch.object(trackdetail, "pad_weights", side_effect=AssertionError("made the full-size canvas")), \
             mock.patch.object(trackdetail, "_keep_weights", side_effect=AssertionError("kept the full-size mask")):
            answer = self.keep([op])
            descriptor = answer["textures"][0]
            raw = trackdetail.mask(self.ac, self.name, descriptor["version"])
        side = 144 // textures.SAVED_WEIGHT_STEP          # (the 128 px tile's ring canvas)
        self.assertEqual(textures.dds_size(side, side, uncompressed=True), descriptor["layers"]["mask"]["size"])
        self.assertEqual((side, side), struct.unpack_from("<2I", raw, 12))
        coarse = textures.weight_levels(raw)[0]
        record, path, scan, filename = trackdetail._view(self.ac, self.name, descriptor["version"])
        _layout, fine = trackdetail._compute(self.ac, self.name, record, path, scan, filename)
        before = textures.weight_levels(textures.coarse_weights(textures.dds_weights(textures.pad_weights(Image.fromarray(fine), (0, 0)))))[0]
        self.assertLessEqual(np.abs(coarse.astype(int) - before).max(), 2)      # (as Save made it from the full-size one)
        self.assertTrue(((coarse[..., 0] > 0) & (coarse[..., 0] < 255)).any())   # (a border across a coarse texel blends)
        self.assertTrue(trackdetail.compressed_mask(self.ac, self.name, descriptor["version"]))

    def test_save_writes_the_coarse_mask_as_the_editor_shows_it(self):
        from track import textures
        descriptor = self.keep([self.paint((200, 30, 40), slice(0, 13))])["textures"][0]
        shown = trackdetail.mask(self.ac, self.name, descriptor["version"])
        trackcopy.save(self.ac, self.name)
        saved = {n: raw for n, _a, raw in kn5.read(str(self.path))["textures"]}[descriptor["layers"]["mask"]["name"]]
        self.assertEqual(textures.bc7_weights(shown), saved)

    def test_the_point_asked_about_reads_the_coarse_mask(self):
        version = self.keep([self.paint((200, 30, 40), slice(0, 13))])["textures"][0]["version"]
        painted = trackdetail.sample_mask(self.ac, self.name, version, .5, -.9)
        ground = trackdetail.sample_mask(self.ac, self.name, version, .5, -.2)
        self.assertEqual((255, 0), (painted[0], painted[3]))
        self.assertEqual((0, 255), (ground[0], ground[3]))

    def test_four_materials_show_their_regions_at_the_saved_step_and_save_from_the_full_fields(self):
        from app import trackinspect
        from track import textures
        operations = [self.paint((30 + 40 * i, 30, 40), slice(i * 8, (i + 1) * 8)) for i in range(4)]
        descriptor = self.keep(operations)["textures"][0]
        ground = descriptor["layers"]["ground"]
        self.assertEqual([128 // textures.SAVED_WEIGHT_STEP] * 2, ground["dimensions"])
        self.assertTrue(trackdetail.weight_bundle(self.ac, self.name, descriptor["version"]))
        self.assertFalse(trackinspect.appearance(self.ac, self.name, 0, .5, -.9, self.revision, descriptor["version"])["original"])
        native = trackdetail.native_descriptors(self.ac, self.name, [descriptor])[0]["layers"]
        self.assertEqual([128, 128], native["ground"]["dimensions"])
        trackcopy.save(self.ac, self.name)


if __name__ == "__main__":
    unittest.main()
