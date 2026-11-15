"""Build Vegetation: generated tree/bush looks, climate palettes and ground/road surfaces for Editor/AC."""
import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'engine'), str(ROOT / 'src')]

import numpy as np
from scenery import groundcover, ground, roadtex, trees, treefx
from building_gallery import atlas_rows, label_texture, write_materials

NAME = 'map2lap_vegetation_gallery'
TITLE = 'Vegetation'
GROUND = ('gc_meadow', 'gc_forest', 'gc_shrub', 'gc_wetland', 'gc_alpine', 'gc_lawn', 'gc_pitch',
          'gc_orchard', 'gc_vineyard', 'gc_garden', 'gc_cemetery', 'gc_residential',
          *(f'gc_field{i}' for i in range(groundcover.FIELD_VARIANTS)))
GROUND = tuple(dict.fromkeys((*GROUND, 'gc_urban', 'gc_rock', *groundcover.LOOKS_NEW)))
MESH_GROUND = ('asphalt', 'cobble', 'concrete', 'sidewalk', 'kerbstone', 'dirt', 'ballast', 'edge_dirt')
QUAD = np.array([[0, 1, 2], [0, 2, 3]])


def cases():
    """Every generator sprite, regional palette and ground surface, in a stable order. Pure."""
    ratios = {}
    for palette in (trees.STYLE, *trees.ZONE_STYLE.values()):
        for choices in palette.values():
            for sprite, ratio in choices:
                ratios.setdefault(sprite, ratio)
    result = [{'kind': 'species', 'sprite': sprite, 'model': treefx.model_of(sprite),
               'ratio': ratios.get(sprite), 'title': sprite.replace('_', ' ').upper()}
              for sprite in trees.SPRITES]
    for zone, overrides in [('temperate', {}), *trees.ZONE_STYLE.items()]:
        palette = {**trees.STYLE, **overrides}
        choices = list(dict.fromkeys(choice for group in ('deciduous', 'conifer', 'shrub')
                                     for choice in palette[group]))
        result.append({'kind': 'mix', 'zone': zone, 'choices': choices, 'title': 'MIX / ' + zone.upper()})
    result.extend({'kind': 'ground', 'material': name, 'title': 'GROUND / ' + name[3:].upper(),
                   'repeat': [ground.TERRAIN_UV_M] * 2} for name in GROUND)
    result.extend({'kind': 'road', 'road_class': name, 'material': 'sample_road_' + name,
                   'title': 'ROAD / ' + name.upper(), 'repeat': [54., 44.]}
                  for name in ground.ROAD_LOOKS)
    result.extend({'kind': 'mesh_ground', 'material': name, 'title': 'SURFACE / ' + name.upper(),
                   'repeat': [1.6, 6.4] if name == 'edge_dirt' else [4., 4.]}
                  for name in MESH_GROUND)
    result.extend({'kind': 'terrain_detail', 'material': name, 'title': name.replace('_', ' ').upper(),
                   'repeat': [54., 44.]} for name in ('stream_bank', 'stream_bed', 'rock_face'))
    return result


def case_position(index):
    """Three columns of 64 m plots with crown clearance and walking/driving aisles. Pure."""
    return (index % 3 - 1) * 64., index // 3 * 64. + 24.


def placements(case, index):
    """Deterministic ordinary TreeFX placements in AC coordinates; ground swatches contain no trees. Pure."""
    x, y = case_position(index)
    if case['kind'] not in ('species', 'mix'):
        return []
    if case['kind'] == 'species':
        model = case['model']
        height, width = treefx.size(model)
        ratio = case['ratio'] or width / height
        spread = 5. if model in treefx.BUSHES else 16.
        return [treefx.placement(model, (x + (i - 1) * spread, .01, -(y + (8. if i == 1 else 0.))),
                                 i * 37, min(height, 14.) * scale, ratio)
                for i, scale in enumerate((.7, 1., 1.3))]
    result = []
    for i, (sprite, ratio) in enumerate(case['choices']):
        model = treefx.model_of(sprite)
        height = min(treefx.size(model)[0], 11.)
        result.append(treefx.placement(model, (x + (i % 4 - 1.5) * 12., .01, -(y + (i // 4 - 1) * 12.)),
                                       i * 53, height, ratio))
    return result


def _label(case, index, rows):
    """A short comparison label with the model or the actual ground surface. Pure."""
    heading = f"{index + 1:02d}  {case['title']}"
    if case['kind'] == 'species':
        return f"{heading}\nModel: {case['model']}\nSmall / medium / large"
    if case['kind'] == 'mix':
        return f"{heading}\n{len(rows)} palette examples\nNot a density simulation"
    if case['kind'] == 'road':
        return f"{heading}\nGenerator road colour + wear\nVisual sample, not a grip test"
    return f"{heading}\n{case['material']}\nVisual surface sample"


def surface_textures(textures):
    """Write production land/road textures and mesh surface sources, with their normal tint and wear."""
    from PIL import Image
    from track import make_obj

    files = groundcover.make_textures(str(textures))
    roadtex.make_surfaces(str(textures))
    # The real terrain painter works on one tile at its normal resolution. Crop a 54 x 44 m sample;
    # this retains the road-class brightness, cracks and dirt track's grassy centre at world scale.
    px, sp = ground.TEX_PX, ground.TILE / ground.TEX_PX
    yy, xx = np.mgrid[:px, :px]
    wx, wy = (xx + .5) * sp, (px - yy - .5) * sp
    nx, ny = round(54 / sp), round(44 / sp)
    for i, name in enumerate(ground.ROAD_LOOKS):
        rgb = np.zeros((px, px, 3), np.float32)
        ground._paint_looks(rgb, np.array([[nx / 2, -1., nx / 2, px + 1.]], np.float64),
                            np.array([nx / 2 + 1.]), np.array([i], np.uint8), wx, wy, sp,
                            str(textures), worn=True)
        key = 'sample_road_' + name
        files[key] = key + '.png'
        Image.fromarray(np.uint8(np.clip(rgb[:ny, :nx], 0, 255))).save(textures / files[key])
    for name in MESH_GROUND:
        files[name] = 'surface_' + name + '.png'
        path = textures / files[name]
        if name == 'edge_dirt':
            roadtex.make_edge(str(path))
        elif name == 'asphalt':
            source, repeat, brightness = ground.ROAD_LOOKS[ground.DECK_LOOK]
            rgb = ground._texture(str(textures / (source + '.png')), round(repeat / sp)) * brightness
            Image.fromarray(np.uint8(np.clip(rgb, 0, 255))).save(path)
        else:
            # Match make_obj.write_mtl: sidewalks and kerbs darken the same Concrete034 source.
            source, _ = make_obj.MATERIALS[name]
            with Image.open(next((Path(make_obj.TEX_SRC) / source).glob('*_Color.jpg'))) as im:
                rgb = np.asarray(im.convert('RGB'), np.float32) * make_obj.DARKEN.get(name, 1.)
            Image.fromarray(np.uint8(np.clip(rgb, 0, 255))).save(path)
    x, y = wx[:ny, :nx], wy[:ny, :nx]
    for name, colour in (('stream_bank', ground.STREAM_BANK), ('stream_bed', ground.STREAM_DRY)):
        rgb = np.array(colour) * (1 + .06 * groundcover._noise(x, y, 1.5, 71))[..., None]
        files[name] = name + '.png'
        Image.fromarray(np.uint8(np.clip(rgb, 0, 255))).save(textures / files[name])
    # A fully rocky 45-degree slope sample, using ground.build's height bands and macro tint.
    rock = ground._sample(ground._texture(str(textures / 'gc_rock.png'), round(ground.TERRAIN_UV_M / sp)),
                          x, y, ground.TERRAIN_UV_M)
    band = np.sin(2 * np.pi * y / ground.ROCK_BAND_M + 1.5 * groundcover._noise(x, y, 9., 61))
    rock *= (1 - .08 * (1 - band))[..., None] * groundcover.macro(x, y)
    files['rock_face'] = 'rock_face.png'
    Image.fromarray(np.uint8(np.clip(rock, 0, 255))).save(textures / files['rock_face'])
    return files


def build(ac_root):
    """Write a labelled KN5 pad and production TreeFX models/list with normal Editor object ownership."""
    from app import mytracks, version
    from track import make_obj, make_track_folder, objectlist, obj_to_kn5

    work = ROOT / 'out' / 'tracks' / NAME / 'obj'
    textures = work / 'textures'
    textures.mkdir(parents=True, exist_ok=True)
    obj_path = work / 'track.obj'
    examples, labels, catalogue = cases(), [], []
    length = case_position(len(examples) - 1)[1] + 34.
    obj = make_obj.Obj(str(obj_path))
    pad = np.array([[-98., -32., 0.], [98., -32., 0.], [98., length, 0.], [-98., length, 0.]])
    obj.add('1ROAD_road_vegetation_pad', 'asphalt', pad, pad[:, :2] / 4., QUAD)
    rows = atlas_rows(len(examples))
    for i, case in enumerate(examples):
        x, y = case_position(i)
        instances = placements(case, i)
        first = len(obj.listed.treefx)
        obj.listed.treefx.extend(instances)
        material = case.get('material', 'gc_meadow')
        # Display swatches sit just above the continuous driveable comparison pad.
        p = np.array([[x - 27., y - 18., .005], [x + 27., y - 18., .005],
                      [x + 27., y + 26., .005], [x - 27., y + 26., .005]])
        repeat = case.get('repeat', [ground.TERRAIN_UV_M] * 2)
        if material == 'edge_dirt':
            # One actual 1.6 m verge strip; stretching the decal over a whole plot hides its scale.
            p[:, 0] = x + np.array([-.8, .8, .8, -.8])
        obj.add(f'nocol_ground_sample_{i}', material, p, (p[:, :2] - p[0, :2]) / repeat, QUAD)
        label = _label(case, i, instances)
        labels.append(label)
        board_y = y - 23.
        board = np.array([[x - 6., board_y, .15], [x + 6., board_y, .15],
                          [x + 6., board_y, 2.15], [x - 6., board_y, 2.15]])
        u0, u1 = (i % 2) / 2, (i % 2 + 1) / 2
        v1, v0 = 1 - (i // 2) / rows, 1 - (i // 2 + 1) / rows
        owner = obj.listed.new('signs', x, board_y, .15, details={'label': label})
        obj.add(f'nocol_signs_vegetation_{i}', 'lab_labels', board,
                np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]), QUAD, owners=np.full(2, owner))
        catalogue.append({**case, 'position': [x, y], 'trees': list(range(first, first + len(instances)))})
    obj.close()
    label_texture(textures, labels)
    write_materials(work / 'track.mtl', {'lab_labels'})
    files = surface_textures(textures)
    with (work / 'track.mtl').open('a') as f:
        for material in sorted({case.get('material', 'gc_meadow') for case in examples}):
            f.write(f'newmtl {material}\nKd 1 1 1\nmap_Kd textures/{files[material]}\n\n')
    anchor = work / 'anchor.json'
    anchor.write_text(json.dumps({'route': [[-32., -25.], [-32., length - 10.]]}))
    make_track_folder.AC = str(ac_root)
    folder = Path(make_track_folder.make(NAME, TITLE, obj=str(obj_path), preview='', parts=[str(obj_path)],
                                        bounds=(-98., -length, 98., 32.),
                                        extra_description='Generated vegetation, regional palettes, terrain and road surfaces.'))
    obj_to_kn5.convert(str(obj_path), str(folder / (NAME + '.kn5')), str(anchor))
    section = objectlist.collect_treefx([str(obj_path)])
    make_track_folder.write_trees(str(folder), section)
    mytracks.save(str(folder), {'title': TITLE, 'version': version.VERSION, 'track_version': version.TRACK_VERSION,
                               'points': [], 'width': None, 'area': None, 'area_m': [196., length + 32.],
                               'length_m': length, 'tiles': 1, 'built': time.time(), 'data': {}, 'gallery': True})
    (folder / 'data' / 'gallery.json').write_text(json.dumps(catalogue, indent=2))
    ui_path = folder / 'ui' / 'ui_track.json'
    ui = json.loads(ui_path.read_text())
    ui.update(description='All generated tree and bush looks at three sizes, regional palettes, terrain textures, road '
              'classes, pavements, ballast, verges and stream beds. Change seasons in Editor Properties. '
              'Synthetic visual comparison pad; surface samples do not simulate grip.',
              tags=['map2lap', 'test', 'freeroam'])
    ui_path.write_text(json.dumps(ui, indent=2))
    print(f"{len(examples)} labelled plots, {section['next']} TreeFX instances, {len(treefx.MODELS)} models: {folder}")
    return folder


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ac-root', type=Path, default=ROOT / 'out' / 'vegetation-gallery-ac',
                        help='AC folder to write into; default stages the lab under out/')
    build(parser.parse_args().ac_root.resolve())


if __name__ == '__main__':
    main()
