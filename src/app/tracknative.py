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
from PIL import Image

from app import trackground
from track import kn5

PREFIX = "nocol_ground_m2l_"
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
    """Bound regional source copies and full-resolution mask storage; never multiply by photo repeat. Pure."""
    width,height=layout['ground']['dimensions']
    regions=layout.get('native_regions',[])
    masks=sum((canvas_size(bounds,width,height)[0]*canvas_size(bounds,width,height)[1]*8*4//3+256) for bounds,_palette in regions)
    geometry=0
    with open(path,'rb') as file:
        for info in scan['meshes']:
            if info['material'] not in layout['materials']: continue
            vertices,faces=kn5.mesh_arrays(file,info)
            extent=next((p[2] for p in scan['materials'][info['material']].props if p[0]=='m2lMaskExtent'),(1.,1.))
            if extent != (1.,1.): vertices=vertices.copy(); vertices['uv']*=extent
            for bounds,_palette in regions:
                points=trackground.clip_region(vertices,faces,[bounds[0]/width,bounds[1]/height,bounds[2]/width,bounds[3]/height],layout['ground']['uv_origin'])
                geometry+=len(points)*46+256
    return masks+geometry


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
    from track.textures import dds_mipmaps
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
    with open(path,'rb') as file:
        for descriptor in descriptors:
            layout=descriptor['layers']; record,_p,_s,filename=trackdetail._view(ac,name,descriptor['version'])
            semantic,fields,_coverage=trackdetail._semantic(ac,name,record,path,scan,filename)
            height,width=next(iter(fields.values())).shape
            fields={**fields,'base':np.maximum(0.,1.-sum(fields.values(),np.zeros((height,width),np.float32)))}
            regions=layout.get('native_regions') or palette_regions(fields)
            refs={ref['id']:ref for ref in semantic['images']}
            refs['base']={**semantic['base'],'id':'base','scale':[1,1],'variation':False}
            origin=layout['ground']['uv_origin']
            for source_i,info in enumerate(scan['meshes']):
                if info['material'] not in layout['materials']: continue
                original=materials[info['material']]
                source_values={p[0]:p[1] for p in original.props}
                specular=max(.15,source_values.get('ksSpecular',0.))
                vertices,faces=kn5.mesh_arrays(file,info)
                vertices=change.vertices.get(source_i,vertices)
                previous=trackview._mask_extent(original)
                if previous != [1.,1.]: vertices=vertices.copy(); vertices['uv']*=previous
                hidden[source_i]=0
                for number,(bounds,palette) in enumerate(regions):
                    cw,ch=canvas_size(bounds,width,height)
                    extent=np.array([cw/width,ch/height])
                    points=trackground.clip_region(vertices,faces,[bounds[0]/width,bounds[1]/height,bounds[2]/width,bounds[3]/height],origin)
                    if not len(points): continue
                    phase=(np.asarray(layout['origin'])+origin-[0,1])*[width,height]
                    mask=resource(region_mask(fields,bounds,palette,phase=phase),'.dds')
                    props=[p for p in original.props if p[0] not in {'multR','multG','multB','multA','magicMult','m2lUVGlobal','m2lMaskExtent','ksSpecular',*('m2lVariation'+c for c in 'RGBA')}]
                    props.extend([('magicMult',1.,(0.,0.),(0.,0.,0.),(0.,0.,0.,0.)),('m2lGroundPass',3.,(0.,0.),(0.,0.,0.),(0.,0.,0.,0.)),('ksSpecular',specular,(0.,0.),(0.,0.,0.),(0.,0.,0.,0.))])
                    maps=[('txDiffuse',0,white),('txMask',1,mask)]
                    for j,channel in enumerate('RGBA'):
                        ref=refs[palette[j]] if j<len(palette) else None
                        photo,normal,scale,varies=white,flat,[1.,1.],False
                        if ref is not None:
                            key=(ref['id'],specular)
                            if key not in prepared:
                                if 'asset' in ref:
                                    folder=trackpaint._resolve(ac,name,'materials',ref['asset'])
                                    raw=(folder/'colour.png').read_bytes()
                                else:
                                    _n,at,size=scan['textures'][ref['i']]
                                    raw=trackview._read(path,at,size,record['base'])
                                with Image.open(io.BytesIO(raw)) as image: colour=image.convert('RGBA')
                                data=None
                                if 'detail' in ref and 'asset' in ref:
                                    with Image.open(io.BytesIO(trackdetail.detail_image(ac,name,ref['asset']))) as image: data=np.array(image.convert('RGBA'))
                                if data is None:
                                    normal_name=flat; alpha=Image.new('L',colour.size,round(255*source_values.get('ksSpecular',0.)/specular) if ref['id']=='base' or ref['id'].startswith('source:') else 0)
                                else:
                                    values=data[...,:3].astype(np.float64)/255*2-1
                                    values[...,:2]*=ref.get('properties',{}).get('normal_scale',1.)
                                    values/=np.maximum(np.linalg.norm(values,axis=2,keepdims=True),1e-20)
                                    normals=np.empty_like(data); normals[...,:3]=np.rint((values*.5+.5)*255).clip(0,255).astype(np.uint8); normals[...,3]=255
                                    normal_name=resource(_png(normals),'.png')
                                    gloss=np.rint((1-np.clip(data[...,3]/255*ref.get('properties',{}).get('roughness',1.),0,1))*255).astype(np.uint8)
                                    alpha=Image.fromarray(gloss).resize(colour.size,Image.Resampling.BILINEAR)
                                colour.putalpha(alpha)
                                prepared[key]=(resource(dds_mipmaps(colour,alpha=True,smallest=1,independent=True),'.dds'),normal_name)
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
    return materials,textures,meshes,'',owned|set(textures),{'renderable':hidden}


def _png(values):
    output=io.BytesIO(); Image.fromarray(values).save(output,'PNG'); return output.getvalue()
