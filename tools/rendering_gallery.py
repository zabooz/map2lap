"""Build a compact AC comparison of TreeFX lighting inputs and linear-albedo grey cards."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import sys
import time
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]

import numpy as np
from PIL import Image
from scenery import treefx

NAME = 'map2lap_rendering_gallery'
VARIANTS = ('BASELINE', 'DIMMED', 'BRIGHTNESS', 'SPECULAR', 'REFLECTIVITY', 'SUBSCATTERING', 'NORMAL_ALPHA',
            'SPHERE', 'SPHERE_SUBSCATTERING')
ALBEDOS = (.05, .18, .5, .9)
QUAD = np.array([[0, 1, 2], [0, 2, 3]])
UV = np.array([[0., 0.], [1., 0.], [1., 1.], [0., 1.]])


def register(folder):
    """Publish this synthetic gallery in My Tracks without inventing a geographical build route."""
    from app import mytracks, version
    mytracks.save(str(folder), {'title': 'Rendering', 'version': version.VERSION,
                               'track_version': version.TRACK_VERSION, 'points': [], 'width': None,
                               'area': None, 'area_m': [len(VARIANTS) * 23. + 16., 115.], 'length_m': 0., 'tiles': 1,
                               'built': time.time(), 'data': {}, 'gallery': True})


def grey(value):
    """An RGB reference texture with linear reflectance value encoded as sRGB. Pure."""
    srgb = 12.92 * value if value <= .0031308 else 1.055 * value ** (1 / 2.4) - .055
    return Image.new('RGB', (8, 8), (round(srgb * 255),) * 3)


def tree_variant(species, variant):
    """A named TreeFX archive with a dimmed comparison or one changed input and isolated caches. Pure."""
    if variant not in VARIANTS:
        raise ValueError(variant)
    texture, lods = treefx.model(species)
    height, width = treefx.size(species)
    source = treefx.bin_bytes(species)
    digest = hashlib.sha256(source + variant.encode()).hexdigest()[:16]
    name = f'm2l_probe_{species}_{variant.lower()}_{digest}'
    normal = Image.new('RGBA', (64, 64), (128, 128, 255, 0 if variant == 'NORMAL_ALPHA' else 255))
    textures = [(name + '_d.png', treefx.png(texture)), (name + '_n.png', treefx.png(normal))]
    meshes = [(f'{name}_lod{i}.mesh', treefx.mesh_bytes(mesh, textures, width / 2, height)[0])
              for i, mesh in enumerate(lods)]
    ini = treefx.tree_ini(species, height, width, [n for n, _ in meshes])
    # Keep the labelled CM reference columns stable after adopting the production fix.
    ini = ini.replace('SUBSCATTERING=0.0', 'SUBSCATTERING=1.0').replace('SPHERE=0.0', 'SPHERE=1.0')
    for key in ('SPECULAR', 'REFLECTIVITY', 'SUBSCATTERING', 'BRIGHTNESS'):
        if variant in (key, 'DIMMED'):
            ini = ini.replace(key + '=1.0', key + ('=0.5' if key == 'BRIGHTNESS' else '=0.0'))
    if variant in ('SPHERE', 'SPHERE_SUBSCATTERING'):
        # The backlight comparison isolates the dome-normal blend, then transmission too.
        # SPHERE_SUBSCATTERING matches needle shading; SUBSCATTERING matches rounded crowns.
        ini = ini.replace('[NORMALS]\nBOOST=0.9\nSPHERE=1.0', '[NORMALS]\nBOOST=0.9\nSPHERE=0.0')
        if variant == 'SPHERE_SUBSCATTERING':
            ini = ini.replace('SUBSCATTERING=1.0', 'SUBSCATTERING=0.0')
    # No owned-species marker: Play must not replace diagnostic inputs with production defaults.
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w') as archive:
        for filename, raw in [('tree.ini', ini.encode()), *textures, *meshes]:
            archive.writestr(zipfile.ZipInfo(filename, (1980, 1, 1, 0, 0, 0)), raw, zipfile.ZIP_DEFLATED)
    return name, output.getvalue()


def build(ac_root):
    """Write the comparison track with identical tree poses, grey cards and production ground samples."""
    from building_gallery import atlas_rows, label_texture, write_materials
    from scenery import groundcover
    from track import make_obj, make_track_folder, objectlist, obj_to_kn5

    work = ROOT / 'out/tracks' / NAME / 'obj'
    textures = work / 'textures'
    textures.mkdir(parents=True, exist_ok=True)
    obj = make_obj.Obj(str(work / 'track.obj'))
    half_width = len(VARIANTS) * 23 / 2 + 8
    pad = np.array([[-half_width, -30., 0.], [half_width, -30., 0.],
                    [half_width, 85., 0.], [-half_width, 85., 0.]])
    obj.add('1ROAD_road_render_pad', 'asphalt', pad, pad[:, :2] / 4, QUAD)
    labels, boards, bins, catalogue = [], [], {}, []
    for row, species in enumerate(('spruce', 'broadleaf')):
        for col, variant in enumerate(VARIANTS):
            x, y = (col - (len(VARIANTS) - 1) / 2) * 23., row * 30. + 15.
            name, raw = tree_variant(species, variant)
            bins[name] = raw
            height, width = treefx.size(species)
            placement = treefx.placement(species, (x, .01, -y), 0, height, width / height)
            placement['model'] = name
            obj.listed.treefx.append(placement)
            detail = {'BASELINE': 'CM shading reference', 'DIMMED': 'Half brightness / diffuse',
                      'NORMAL_ALPHA': 'Only normal alpha = 0', 'BRIGHTNESS': 'Only brightness = 0.5',
                      'SPHERE_SUBSCATTERING': 'Sphere and subscattering = 0'}.get(variant, 'Only this input = 0')
            labels.append(f'{species.upper()}\n{variant}\n{detail}')
            boards.append((x, y - 7.))
            catalogue.append({'species': species, 'variant': variant, 'model': name, 'pos': placement['pos']})
    for i, value in enumerate(ALBEDOS):
        material = f'probe_grey_{i}'
        grey(value).save(textures / (material + '.png'))
        x = (i - 1.5) * 9.
        # Both orientations share the same material; geometry determines their illumination.
        for suffix, points in (
            ('upright', [[x-3, -9, .1], [x+3, -9, .1], [x+3, -9, 4.1], [x-3, -9, 4.1]]),
            ('ground', [[x-3, -17, .005], [x+3, -17, .005], [x+3, -11, .005], [x-3, -11, .005]]),
        ):
            obj.add(f'nocol_reference_{i}_{suffix}', material, np.array(points), UV, QUAD)
        labels.append(f'LINEAR ALBEDO {value:g}\nsRGB {grey(value).getpixel((0, 0))[0]}/255\nExposure affects displayed grey')
        boards.append((x, -20.))
    ground = ('gc_lawn', 'gc_field1', 'gc_field3', 'gc_snow')
    groundcover.make_textures(str(textures))
    for i, material in enumerate(ground):
        x = (i - 1.5) * 18.
        points = np.array([[x-7, 62, .005], [x+7, 62, .005], [x+7, 78, .005], [x-7, 78, .005]])
        obj.add(f'nocol_surface_{i}', material, points, UV, QUAD)
        labels.append(f'{material}\nProduction texture\nProduction material values')
        boards.append((x, 59.))
    rows = atlas_rows(len(labels))
    for i, (x, y) in enumerate(boards):
        board = np.array([[x-4, y, .1], [x+4, y, .1], [x+4, y, 1.7], [x-4, y, 1.7]])
        u0, u1 = (i % 2) / 2, (i % 2 + 1) / 2
        v1, v0 = 1 - (i // 2) / rows, 1 - (i // 2 + 1) / rows
        owner = obj.listed.new('signs', x, y, .1, details={'label': labels[i]})
        obj.add(f'nocol_signs_reference_{i}', 'lab_labels', board,
                np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]), QUAD, owners=np.full(2, owner))
    obj.close()
    label_texture(textures, labels)
    write_materials(work / 'track.mtl', {'lab_labels', 'asphalt'})
    with (work / 'track.mtl').open('a') as stream:
        for name in [*(f'probe_grey_{i}' for i in range(len(ALBEDOS))), *ground]:
            stream.write(f'newmtl {name}\nKd 1 1 1\nmap_Kd textures/{name}.png\n\n')
    anchor = work / 'anchor.json'
    anchor.write_text(json.dumps({'route': [[0., -28.], [0., 80.]]}))
    make_track_folder.AC = str(ac_root)
    folder = Path(make_track_folder.make(NAME, 'Rendering', obj=str(work / 'track.obj'), preview='',
                                        parts=[str(work / 'track.obj')], bounds=(-half_width, -85., half_width, 30.)))
    obj_to_kn5.convert(str(work / 'track.obj'), str(folder / (NAME + '.kn5')), str(anchor))
    tree_folder = folder / 'extension/trees'
    tree_folder.mkdir(exist_ok=True)
    for name, raw in bins.items():
        (tree_folder / (name + '.bin')).write_bytes(raw)
    treefx.write_text(tree_folder, objectlist.collect_treefx([str(work / 'track.obj')]))
    with (folder / 'extension/ext_config.ini').open('a') as stream:
        stream.write(make_track_folder.TREES_CONFIG)
    (folder / 'data/gallery.json').write_text(json.dumps(catalogue, indent=2))
    register(folder)
    print(folder)
    return folder


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ac-root', type=Path, default=ROOT / 'out/rendering-gallery-ac')
    build(parser.parse_args().ac_root.resolve())


if __name__ == '__main__':
    main()
