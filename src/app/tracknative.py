"""Stock-CSP render passes compiled directly from the Editor's retained semantic ground inputs."""
import hashlib
import io
import math
from pathlib import Path
import shutil
import functools
from dataclasses import replace
import re
import struct

import numpy as np
import PIL
from PIL import Image

from app import trackground
from track import kn5
from track.textures import bc7_weights, pad_weights, weight_extent

PREFIX = "nocol_ground_m2l_"
# The packed region masks a track's last Save wrote, by the digest of their inputs (_mask_key). Raise it when
# region_mask, canvas_size or bc7_weights write other bytes for the same inputs: the files would no longer match.
MASK_CACHE_VERSION = 1
# The same for the packed photos kept beside them (_photo_key): raise it when _photo_colour, _photo_normals, tile_base,
# pad_weights or dds_mipmaps write other bytes for the same inputs.
PHOTO_CACHE_VERSION = 1
SOURCE_FILE = Path("data", "map2lap_regional_source.json")
OWN_TEXTURE = re.compile(r"map2lap_native_[0-9a-f]{64}\.(?:png|dds)\Z")


def _owned_material(material):
    return material.name.startswith(("m2l_ground_black_", "m2l_ground_pbr_", "m2l_ground_region_")) and any(
        p[0] == "m2lGroundPass" and p[1] in (1., 2., 3.) for p in material.props)


def _owned_images(materials):
    return {name for m in materials if _owned_material(m) for _slot, _i, name in m.maps if OWN_TEXTURE.fullmatch(name)}


@functools.lru_cache(maxsize=32)
def _source_record_at(path, state):
    from app import trackpaint
    record = trackpaint._read(Path(path))
    if record.get("schema") != 1 or record.get("digest") != trackpaint._digest({k: v for k, v in record.items() if k != "digest"}):
        raise ValueError("The retained regional ground provenance has changed")
    if (not isinstance(record.get("tiles"), list) or not isinstance(record.get("paints"), list)
            or any(not isinstance(tile, list) or len(tile) != 2 or any(type(v) is not int for v in tile) for tile in record["tiles"])):
        raise ValueError("Invalid regional ground provenance")
    for id in record["paints"]:
        trackpaint._key(id)
    if not isinstance(record.get('render_sources',{}),dict) or any(not isinstance(k,str) or type(v) is not int or v not in (0,1) for k,v in record.get('render_sources',{}).items()):
        raise ValueError('Invalid regional source render provenance')
    if (not isinstance(record.get("native_textures", []), list)
            or any(not isinstance(n, str) or not OWN_TEXTURE.fullmatch(n) for n in record.get("native_textures", []))):
        raise ValueError("Invalid native ground resource provenance")
    return record


def inherited(ac, name, path):
    """Only hash-bound compiled provenance may adopt immutable paints made against an earlier source revision."""
    from app import trackdetail, trackpaint, trackview
    candidates = [Path(path).parent / SOURCE_FILE, Path(trackview.kn5_path(ac, name)).parent / SOURCE_FILE]
    for candidate in dict.fromkeys(candidates):
        if not candidate.is_file():
            continue
        stat = candidate.stat()
        record = _source_record_at(str(candidate), (stat.st_ino, stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size))
        if record.get("kn5_size", Path(path).stat().st_size) != Path(path).stat().st_size:
            if candidate == Path(path).parent / SOURCE_FILE:
                raise ValueError("Regional ground provenance belongs to another KN5")
            continue
        if record.get("kn5_sha256") != trackdetail._kn5_digest(path):
            if candidate == Path(path).parent / SOURCE_FILE:
                raise ValueError("Regional ground provenance belongs to another KN5")
            continue
        return record
    stat = Path(path).stat()
    try:
        meshes = trackview._scan(str(path), trackview._revision(stat))["meshes"]
    except (AssertionError, struct.error, ValueError, OSError) as error:
        raise trackview.Unreadable(str(error)) from error
    if any(mesh["name"].startswith(PREFIX) for mesh in meshes):
        raise ValueError("Regional ground provenance is missing or belongs to another KN5; restore the saved material package")
    return {"paints": [], "tiles": []}


def copy_source(source, target):
    """Retain compiled provenance beside an archived source; canonical inputs remain in the track's paint bundle."""
    original = Path(source).parent / SOURCE_FILE
    if original.is_file():
        destination = Path(target).parent / SOURCE_FILE
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(original, destination)
    uv2 = Path(source).with_suffix('.uv2')
    if uv2.is_file():
        shutil.copyfile(uv2, Path(target).with_suffix('.uv2'))


def write_source(ac, name, source, descriptors, scan, target, paints):
    """Bind ordered canonical paint ids to this compiled native source without rewriting their original records."""
    from app import trackdetail, trackpaint
    tiles, needed = [], set()
    for descriptor in descriptors:
        if "ground" not in descriptor.get("layers", {}):
            continue
        record, _p, _s, _filename = trackdetail._view(ac, name, descriptor["version"])
        match = trackpaint.GROUND_IMAGE.fullmatch(scan["textures"][record["texture"]][0])
        tiles.append(list(map(int, match.groups())))
        needed.update(record["paints"])
    destination = Path(target).parent / SOURCE_FILE
    if tiles:
        old=inherited(ac,name,source)
        ordered = list(dict.fromkeys([*old["paints"], *paints]))
        affected={i for d in descriptors if 'ground' in d.get('layers',{}) for i in d['layers']['materials']}
        record = {"schema": 1, "kn5_sha256": trackdetail._kn5_digest(target), "kn5_size": Path(target).stat().st_size,
                  "paints": [id for id in ordered if id in needed], "tiles": tiles,
                  "native_textures": sorted(_owned_images(kn5.scan(target)["materials"])),
                  'render_sources':{m['name']:int(old.get('render_sources',{}).get(m['name'],m['renderable'])) for m in scan['meshes'] if m['material'] in affected}}
        trackpaint._atomic(destination, trackpaint._json_bytes({**record, "digest": trackpaint._digest(record)}))
    else:
        destination.unlink(missing_ok=True)


def palette_regions(fields, halo=2):
    """Disjoint geometry bounds retaining every positive local and bilinear-halo contribution. Pure."""
    height, width = next(iter(fields.values())).shape
    result = []
    def visit(bounds):
        x0,y0,x1,y1 = bounds
        palette = [key for key, values in fields.items() if np.any(values[max(0,y0-halo):min(height,y1+halo), max(0,x0-halo):min(width,x1+halo)] > 0)]
        if len(palette) <= 4:
            result.append((bounds,palette)); return
        if x1-x0 == y1-y0 == 1:
            raise ValueError('Native regional Save cannot represent more than four materials in this local transition/filter halo; preview and draft retain every material')
        if x1-x0 >= y1-y0 and x1-x0 > 1:
            mid=(x0+x1)//2; visit([x0,y0,mid,y1]); visit([mid,y0,x1,y1])
        else:
            mid=(y0+y1)//2; visit([x0,y0,x1,mid]); visit([x0,mid,x1,y1])
    visit([0,0,width,height])
    return result


def region_mask(fields, bounds, palette, phase=(0,0)):
    """RGBA16F weights with exact near-field support; far cross-region filtering remains a release gate. Pure."""
    import struct
    height,width = next(iter(fields.values())).shape
    x0,y0,x1,y1=bounds
    # Keep a genuine two-source-texel halo. Extend its edge for coarser per-region
    # mips; this is not the unresolved global N-material far-filter contract.
    cw,ch=canvas_size(bounds,width,height)
    # Origin-locked periodic canvases avoid an unsupported per-material UV offset.
    # Rotate the pixels within the small canvas, not the shared photograph. Its
    # scale-only UV transform cancels exactly in each float2 detail multiplier.
    xs=((np.arange(cw)-int(phase[0])-(x0+x1)//2+cw//2)%cw)+(x0+x1)//2-cw//2
    ys=((np.arange(ch)-int(phase[1])-(y0+y1)//2+ch//2)%ch)+(y0+y1)//2-ch//2
    xs=np.clip(xs,max(0,x0-2),min(width-1,x1+1))
    ys=np.clip(ys,max(0,y0-2),min(height-1,y1+1))
    level=np.zeros((ch,cw,4),np.float32)
    for channel,key in enumerate(palette): level[...,channel]=fields[key][ys[:,None],xs[None,:]]
    total=level.sum(axis=2)
    if not np.all(total>0): raise ValueError('A regional ground palette has an uncovered filter halo')
    level/=total[...,None]
    levels=[]
    while True:
        levels.append(level)
        if level.shape[:2]==(1,1): break
        h,w=level.shape[:2]
        level=np.stack([np.asarray(Image.fromarray(level[...,c]).resize((max(1,w//2),max(1,h//2)),Image.Resampling.BOX),np.float32) for c in range(4)],axis=2)
    quantized=[]
    for values in levels:
        q=np.maximum(np.rint(values*255).astype(np.int16),(values>0).astype(np.int16))
        winner=values.argmax(axis=2)
        yy,xx=np.indices(winner.shape)
        q[yy,xx,winner]+=255-q.sum(axis=2)
        quantized.append(q.astype(np.uint8))
    if all(np.max(abs(q.astype(np.float32)/255-values))<=2/255 for q,values in zip(quantized,levels)):
        header=None; payload=[]
        for q in quantized:
            stream=io.BytesIO(); Image.fromarray(q).save(stream,'DDS'); raw=stream.getvalue()
            if header is None: header=bytearray(raw[:128])
            payload.append(raw[128:])
        struct.pack_into('<I',header,8,struct.unpack_from('<I',header,8)[0]|0x20000)
        struct.pack_into('<I',header,28,len(levels)); struct.pack_into('<I',header,108,0x401008)
        return bytes(header)+b''.join(payload)
    payload=[np.stack([trackground.half_weights(v[...,c])[0] for c in range(4)],axis=2).astype('<f2').tobytes() for v in levels]
    header=struct.pack('<4s7I44x',b'DDS ',124,0x2100f,ch,cw,cw*8,0,len(payload))
    header+=struct.pack('<8I',32,4,113,0,0,0,0,0)+struct.pack('<5I',0x401008,0,0,0,0)
    return header+b''.join(payload)


def canvas_size(bounds,width,height):
    """Local spans with bounded repeat guards; photographs retain their original resolution and phase. Pure."""
    # AC repeats the canvas: two texels cease protecting its opposite edge at
    # mip 2. A 128-texel guard protects 2K source filtering through mip 7. Cap
    # each guard at half the local span so small regions grow by at most 4x in
    # area. Sub-four-pixel regions retain their existing two-real-texel halo;
    # their far global multi-palette filtering remains outside this contract.
    spans=[max(1,bounds[k+2]-bounds[k]) for k in range(2)]
    return [span+2*max(2,min(128,span//2)) for span in spans]


def save_size(layout,scan,path):
    """Bound regional source copies and full-resolution mask storage; never multiply by photo repeat. Keeps the clips in
    layout['native_clips'], {mesh: (digest of the vertices clipped, {region: points})}, for build."""
    width,height=layout['ground']['dimensions']
    regions=layout.get('native_regions',[])
    # A byte per pixel and its mips: BC7 (bc7_weights); the rare RGBA16F mask (region_mask) stays 8 and is left out here.
    masks=sum((canvas_size(bounds,width,height)[0]*canvas_size(bounds,width,height)[1]*4//3+256) for bounds,_palette in regions)
    ring=weight_extent(width,height)
    masks+=round(width*ring[0])*round(height*ring[1])*4//3+256    # (the tile image on its ring canvas, as BC3 at most)
    geometry=0
    clips=layout.setdefault('native_clips',{})
    with open(path,'rb') as file:
        for source_i,info in enumerate(scan['meshes']):
            if info['material'] not in layout['materials']: continue
            vertices,faces=kn5.mesh_arrays(file,info)
            extent=next((p[2] for p in scan['materials'][info['material']].props if p[0]=='m2lMaskExtent'),(1.,1.))
            vertices=_tile_uvs(vertices,scan['materials'][info['material']])
            if extent != (1.,1.): vertices=vertices.copy(); vertices['uv']*=extent
            clips[source_i]=_field_digest(vertices),{}
            clipped=clips[source_i][1]
            for number,(bounds,_palette) in enumerate(regions):
                points=trackground.clip_region(vertices,faces,[bounds[0]/width,bounds[1]/height,bounds[2]/width,bounds[3]/height],layout['ground']['uv_origin'])
                clipped[number]=points
                geometry+=len(points)*46+256
    return masks+geometry


def _tile_uvs(vertices,material):
    """vertices with the whole tile's UVs where a guarded build's cover only its texture's inside (trackview.tile_uv). Pure."""
    from app import trackview
    guard=trackview._prop(material,'m2lUVGuard',0.)
    if not guard: return vertices
    vertices=vertices.copy(); vertices['uv']=np.array(trackview.tile_uv(vertices['uv'][:,0],vertices['uv'][:,1],guard,False,0,0)).T
    return vertices


def _append(meshes,source,points,material,name):
    """Deduplicate render-only regional triangles without touching source vertices or indices."""
    if not len(points): return
    unique,inverse=np.unique(points,return_inverse=True)
    batches=[(unique,inverse)] if len(unique)<=65535 else [np.unique(points[k:k+65535],return_inverse=True) for k in range(0,len(points),65535)]
    for number,(vertices,indices) in enumerate(batches):
        center=(vertices['pos'].min(axis=0).astype(np.float64)+vertices['pos'].max(axis=0))/2
        meshes.append({**source,'name':f'{name}_{number}','material':material,'cast_shadows':0,'active':1,'renderable':1,'visible':1,'transparent':0,
            'data':(vertices,indices.reshape(-1,3).astype('<u2')),'vertices':len(vertices),'indices':len(indices),'center':center.tolist(),
            'radius':float(np.linalg.norm(vertices['pos']-center,axis=1).max())})


def build(ac,name,descriptors,scan,change,path,added):
    """One opaque stock multilayer render copy per region; source physics and geometry stay byte-identical."""
    from app import trackdetail,trackpaint,trackview
    from track import groundmaterial
    materials=list(scan['materials']); textures={}; meshes=list(added)
    inherited_record=inherited(ac,name,path)
    owned=set(inherited_record.get('native_textures',[]))|_owned_images(materials)
    referenced={m['material'] for m in [*scan['meshes'],*added] if not m['name'].startswith(PREFIX)}
    unused=[i for i,m in enumerate(materials) if i not in referenced and _owned_material(m)][::-1]
    hidden={i:int(inherited_record.get('render_sources',{}).get(m['name'],m['renderable'])) for i,m in enumerate(scan['meshes']) if m['name'] in inherited_record.get('render_sources',{})}
    def resource(raw,extension):
        key='map2lap_native_'+hashlib.sha256(raw).hexdigest()+extension
        textures.setdefault(key,raw); return key
    white=resource(dict(groundmaterial.textures())[groundmaterial.WHITE],'.png')
    flat=resource(_png(np.full((4,4,4),[128,128,255,255],np.uint8)),'.png')
    prepared={}
    kept,used=_mask_folder(name),set()
    with open(path,'rb') as file:
        for descriptor in descriptors:
            layout=descriptor['layers']; record,_p,_s,filename=trackdetail._view(ac,name,descriptor['version'])
            # (native_descriptors read this tile's fields for its regions and kept what is needed of them here: the fields of
            # all tiles, 400 MiB for ten, don't wait for the export; read again only for a mask not kept)
            read=functools.cache(lambda: trackdetail._semantic(ac,name,record,path,scan,filename))
            fields=functools.cache(lambda: with_base(read()[1]))
            semantic=layout.get('native_tile') or read()[0]
            width,height=semantic['dimensions']
            regions=layout.get('native_regions') or palette_regions(fields())
            keys=layout.get('native_mask_keys')
            refs={ref['id']:ref for ref in semantic['images']}
            # The tile image on its mask's ring canvas (trackdetail.ringed_base): sampled as one more repeating photo, its
            # edge must not reach the opposite one.
            tile=tuple(map(int,trackpaint.GROUND_IMAGE.fullmatch(semantic['base']['name']).groups()))
            ring=weight_extent(width,height)
            refs['base']={**semantic['base'],'id':'base','scale':[1/ring[0],1/ring[1]],'variation':False}
            base_material=materials[layout['materials'][0]]
            origin=layout['ground']['uv_origin']
            clips=layout.get('native_clips',{})
            # A region's mask depends on the tile's fields, its bounds and palette and the tile's phase, not on the ground
            # piece clipped to it: made once per region, though a tile's ground comes in several pieces (1ROAD_, 1GRASS_,
            # split ones). First made where it was first needed, so the kn5 keeps its texture order.
            masks={}
            for source_i,info in enumerate(scan['meshes']):
                if info['material'] not in layout['materials']: continue
                original=materials[info['material']]
                source_values={p[0]:p[1] for p in original.props}
                specular=max(.15,source_values.get('ksSpecular',0.))
                vertices,faces=kn5.mesh_arrays(file,info)
                vertices=_tile_uvs(change.vertices.get(source_i,vertices),original)
                previous=trackview._mask_extent(original)
                if previous != [1.,1.]: vertices=vertices.copy(); vertices['uv']*=previous
                hidden[source_i]=0
                # (the size check clipped this ground before: its clips hold unless the vertices changed since)
                digest,clipped=clips.get(source_i,(None,{}))
                if digest!=_field_digest(vertices): clipped={}
                for number,(bounds,palette) in enumerate(regions):
                    cw,ch=canvas_size(bounds,width,height)
                    extent=np.array([cw/width,ch/height])
                    points=clipped.pop(number,None)
                    if points is None: points=trackground.clip_region(vertices,faces,[bounds[0]/width,bounds[1]/height,bounds[2]/width,bounds[3]/height],origin)
                    if not len(points): continue
                    if number not in masks:
                        phase=_mask_phase(layout,width,height)
                        key=keys[number] if keys else _mask_key(fields(),bounds,palette,phase)
                        # (AC gets BC7: a quarter; one unchanged since the last Save is taken from then)
                        raw=_stored(kept,key+'.dds',lambda: bc7_weights(region_mask(fields(),bounds,palette,phase=phase)))
                        used.add(key+'.dds')
                        masks[number]=resource(raw,'.dds')
                    mask=masks[number]
                    props=[p for p in original.props if p[0] not in {'multR','multG','multB','multA','magicMult','m2lUVGlobal','m2lMaskExtent','ksSpecular',*('m2lVariation'+c for c in 'RGBA')}]
                    props.extend([('magicMult',1.,(0.,0.),(0.,0.,0.),(0.,0.,0.,0.)),('m2lGroundPass',3.,(0.,0.),(0.,0.,0.),(0.,0.,0.,0.)),('ksSpecular',specular,(0.,0.),(0.,0.,0.),(0.,0.,0.,0.))])
                    maps=[('txDiffuse',0,white),('txMask',1,mask)]
                    for j,channel in enumerate('RGBA'):
                        ref=refs[palette[j]] if j<len(palette) else None
                        photo,normal,scale,varies=white,flat,[1.,1.],False
                        if ref is not None:
                            # (each tile has its own image under the same id 'base': its texture number tells them apart)
                            key=(ref['id'],ref.get('i'),specular)
                            if key not in prepared:
                                if 'asset' in ref:
                                    folder=trackpaint._resolve(ac,name,'materials',ref['asset'])
                                    raw=(folder/'colour.png').read_bytes()
                                else:
                                    _n,at,size=scan['textures'][ref['i']]
                                    raw=trackview._read(path,at,size,record['base'])
                                sheen=round(255*source_values.get('ksSpecular',0.)/specular) if ref['id']=='base' or ref['id'].startswith('source:') else 0
                                detail=None
                                if 'detail' in ref and 'asset' in ref:
                                    detail=functools.cache(lambda asset=ref['asset']: _rgba(trackdetail.detail_image(ac,name,asset)))
                                # (a tile's images unchanged since the last Save are taken from then, as its masks are)
                                stored=_photo_key(raw,ref,base_material,tile,sheen)
                                normal_name=flat
                                if detail:
                                    normal_name=resource(_stored(kept,stored+'.png',lambda: _photo_normals(detail(),ref)),'.png')
                                    used.add(stored+'.png')
                                colour=_stored(kept,stored+'.dds',lambda: _photo_colour(raw,ref,base_material,tile,sheen,detail))
                                used.add(stored+'.dds')
                                prepared[key]=(resource(colour,'.dds'),normal_name)
                            photo,normal=prepared[key]; scale=ref.get('scale',[1.,1.]); varies=bool(ref.get('variation'))
                        props.extend([('mult'+channel,1.,tuple(np.asarray(scale)*extent),(0.,0.,0.),(0.,0.,0.,0.)),('m2lVariation'+channel,float(varies),(0.,0.),(0.,0.,0.),(0.,0.,0.,0.))])
                        maps.extend([('txDetail'+channel,j+2,photo),('txNormal'+channel,j+6,normal)])
                    material=kn5.Material(f'm2l_ground_region_{source_i}_{number}','ksMultilayer_objsp',0,0,0,props,maps)
                    index=unused.pop() if unused else len(materials)
                    if index==len(materials): materials.append(material)
                    else: materials[index]=material
                    output=points.copy(); output['uv']=(output['uv']+layout['origin'])/extent
                    _append(meshes,info,output,index,f'{PREFIX}region_{source_i}_{number}')
    for i in unused: materials[i]=replace(materials[i],maps=[])
    _keep_only(kept,used)
    return materials,textures,meshes,'',owned|set(textures),{'renderable':hidden}


def _mask_folder(name):
    """The folder of the packed region masks and photos of track name's last Save (cache: deleting it costs one slower Save)."""
    from app import trackpaint
    return Path(trackpaint.mytracks.ROOT, "cache", "native-masks", hashlib.sha256(name.encode()).hexdigest()[:32])


def forget(name):
    """Delete what track name's Saves kept here, when the track is deleted."""
    shutil.rmtree(_mask_folder(name), ignore_errors=True)


def _field_digest(field):
    """sha256 of one weight field's values, type and shape. Pure."""
    digest = hashlib.sha256(f"{field.dtype.str}{field.shape}".encode())
    digest.update(np.ascontiguousarray(field).data)
    return digest.hexdigest()


def _mask_key(fields, bounds, palette, phase):
    """The digest of all region_mask reads: the palette's fields within the bounds and the two pixels around them (a change
    elsewhere on the tile keeps this mask), in channel order, the bounds, the phase and the tile's size. Pure."""
    from app import trackpaint
    height, width = next(iter(fields.values())).shape
    x0, y0, x1, y1 = bounds
    area = slice(max(0, y0 - 2), min(height, y1 + 2)), slice(max(0, x0 - 2), min(width, x1 + 2))
    return trackpaint._digest([MASK_CACHE_VERSION, [_field_digest(fields[key][area]) for key in palette], [int(b) for b in bounds],
                               list(palette), [float(p) for p in phase], [width, height]])


def with_base(weights):
    """A tile's weight fields and 'base', what they leave of its own image. Pure."""
    return {**weights, "base": np.maximum(0., 1. - sum(weights.values(), np.zeros_like(next(iter(weights.values())))))}


def _mask_phase(layout, width, height):
    """The phase region_mask takes for a width x height tile of layout. Pure."""
    return (np.asarray(layout["origin"]) + layout["ground"]["uv_origin"] - [0, 1]) * [width, height]


def mask_keys(fields, regions, layout):
    """The _mask_key of each of a tile's regions, in their order, fields with 'base'. Pure."""
    height, width = next(iter(fields.values())).shape
    return [_mask_key(fields, bounds, palette, _mask_phase(layout, width, height)) for bounds, palette in regions]


def _stored(folder, file, make):
    """The bytes kept under file in folder, else make() kept there. A file that can't be read or written only costs making it."""
    from app import trackpaint
    path = folder / file
    try:
        return path.read_bytes()
    except OSError:
        raw = make()
    try:
        trackpaint._atomic(path, raw)
    except OSError:
        pass
    return raw


def _keep_only(folder, used):
    """Delete the packed images in folder that the Save just made did not use: a track keeps those of its last Save."""
    for path in folder.glob("*"):
        if path.name not in used:
            path.unlink(missing_ok=True)


def _photo_key(raw, ref, material, tile, sheen):
    """The digest of all that _photo_colour and _photo_normals read: the encoded source, for a tile's own image its guard,
    ring canvas and tile, the alpha of a photo without a gloss map (sheen), a detail map and its properties. Pure."""
    from app import trackdetail, trackpaint, trackview
    properties = ref.get("properties", {})
    base = [[int(t) for t in tile], trackview._prop(material, "m2lUVGuard", 0.), trackdetail.base_extent(material)] if ref["id"] == "base" else None
    detail = [ref["detail"]["key"], properties.get("normal_scale", 1.), properties.get("roughness", 1.)] if "detail" in ref and "asset" in ref else None
    return trackpaint._digest([PHOTO_CACHE_VERSION, PIL.__version__, hashlib.sha256(raw).hexdigest(), sheen, base, detail])


def _rgba(raw):
    """The pixels of an encoded image as (H, W, 4) uint8. Pure."""
    with Image.open(io.BytesIO(raw)) as image:
        return np.array(image.convert("RGBA"))


def _photo_colour(raw, ref, material, tile, sheen, detail):
    """A ground photo as an RGBA DDS: its colour (a tile's own image on its mask's ring canvas), in alpha its gloss from
    detail, a function giving the detail map's pixels, or else sheen. Pure."""
    from app import trackdetail
    from track.textures import dds_mipmaps
    if ref["id"] == "base":
        colour = pad_weights(Image.fromarray(trackdetail.tile_base(raw, material, tile)), tile).convert("RGBA")
    else:
        with Image.open(io.BytesIO(raw)) as image:
            colour = image.convert("RGBA")
    if detail is None:
        alpha = Image.new("L", colour.size, sheen)
    else:
        gloss = np.rint((1 - np.clip(detail()[..., 3] / 255 * ref.get("properties", {}).get("roughness", 1.), 0, 1)) * 255).astype(np.uint8)
        alpha = Image.fromarray(gloss).resize(colour.size, Image.Resampling.BILINEAR)
    colour.putalpha(alpha)
    return dds_mipmaps(colour, alpha=True, smallest=1, independent=True)


def _photo_normals(data, ref):
    """A detail map's (H, W, 4) pixels as a PNG of its normals, scaled by the material's normal_scale. Pure."""
    values = data[..., :3].astype(np.float64) / 255 * 2 - 1
    values[..., :2] *= ref.get("properties", {}).get("normal_scale", 1.)
    values /= np.maximum(np.linalg.norm(values, axis=2, keepdims=True), 1e-20)
    normals = np.empty_like(data)
    normals[..., :3] = np.rint((values * .5 + .5) * 255).clip(0, 255).astype(np.uint8)
    normals[..., 3] = 255
    return _png(normals)


def _png(values):
    output=io.BytesIO(); Image.fromarray(values).save(output,'PNG'); return output.getvalue()
