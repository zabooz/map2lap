"""Native generator ground detail for HD builds, using the same masks and shader as Editor saves."""
from dataclasses import replace
import json
import os
from pathlib import Path
import tempfile
import zipfile

import numpy as np
from PIL import Image

from track import editorinfo, groundmaterial, kn5, textures

DETAILS = ('gc_meadow', 'gc_forest', 'gc_rock')
REPEAT_M = 8.  # The generator's source textures cover 8 m, independent of terrain spacing or country.


def _mask(part):
    """Compose one part's mapped base and ordered overlays into three HD weights and the baked remainder."""
    from app.trackdetail import _coarse_mask, _preview_step
    with zipfile.ZipFile(editorinfo.side_file(part)) as archive:
        data = json.loads(archive.read('tile.json'))
        size = data['size']
        base = editorinfo._image(archive, 'base.png', size)
        weights = {name: np.zeros((size, size), np.float32) for name in DETAILS}
        for index, name in enumerate(data['base']):
            if name in weights:
                weights[name][base == index] = 1.
        for layer in data['layers']:
            alpha = editorinfo._image(archive, layer['mask'], size).astype(np.float32) / 255
            for name, weight in weights.items():
                weight *= 1 - alpha
                if name == layer['material']:
                    weight += alpha
    tile = data['tile']
    raw = _coarse_mask(weights, size, size, tile, _preview_step(size, size))
    return f'ground_{tile[0]}_{tile[1]}', textures.weight_extent(size, size), textures.bc7_weights(raw)


def _details():
    """Encode the generator's deterministic 512 px source images once, shared by every HD tile."""
    from scenery import groundcover
    with tempfile.TemporaryDirectory() as folder:
        paths = groundcover.make_textures(folder)
        result = []
        for name in DETAILS:
            with Image.open(Path(folder) / paths[name]) as image:
                result.append((f'map2lap_hd_{name}.dds', textures.dds_mipmaps(image, bc7=True)))
        return result


def write(path, parts, log=print):
    """Apply HD to a newly converted KN5; preserve every mesh, index, position and baked road pixel."""
    from track import parallel
    scan = kn5.scan(path)
    ground = {m.name for m in scan['materials'] if groundmaterial.is_ground(m.name)}
    if not ground:
        return
    # Only near-ground tiles have paint facts; distant terrain and scenery parts have none.
    sources = [part for part in parts if os.path.isfile(editorinfo.side_file(part))]
    log('HD: adding shared meadow, forest-floor and rock detail layers ...')
    if len(sources) > 1:
        with parallel.pool(parallel.workers(len(sources))) as pool:
            masks = list(pool.map(_mask, sources))
    else:
        masks = [_mask(part) for part in sources]
    by_name = {name: (extent, raw) for name, extent, raw in masks}
    if missing := ground - by_name.keys():
        raise ValueError(f'HD ground is missing tile masks: {sorted(missing)}')
    images = _details()
    materials, extents = list(scan['materials']), {}
    for index, material in enumerate(materials):
        if material.name not in ground:
            continue
        extent, raw = by_name[material.name]
        mask = f'map2lap_hd_{material.name}.dds'
        images.append((mask, raw))
        base = next(name for slot, _, name in material.maps if slot == 'txDiffuse')
        layers = {channel: (images[i][0], None, tuple(256 / REPEAT_M * e for e in extent), False)
                  for i, channel in enumerate('RGB')}
        layers['A'] = (base, None, tuple(groundmaterial.UV_SCALE * e for e in extent), False)
        props = [p for p in material.props if p[0] != 'm2lUVScale']
        props += [('m2lMaskExtent', 1., tuple(extent), (0., 0., 0.), (0., 0., 0., 0.)),
                  ('m2lBaseScale', groundmaterial.UV_SCALE, (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))]
        materials[index] = groundmaterial.classic(replace(material, props=props), groundmaterial.WHITE, mask, layers)
        extents[index] = extent
    vertices = {}
    with open(path, 'rb') as source:
        for i, mesh in enumerate(scan['meshes']):
            if mesh['material'] in extents:
                data = kn5.mesh_arrays(source, mesh)[0]
                data['uv'] /= groundmaterial.UV_SCALE * np.array(extents[mesh['material']])
                vertices[i] = data
    temporary = str(path) + '.hd.tmp'
    try:
        kn5.without_faces(path, temporary, {}, change=kn5.Moved(vertices, {}, {}), materials=materials, textures=images)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
