"""Convert bounded FBX/OBJ uploads and ZIP bundles to the existing self-contained GLB model format."""
import io
import json
import os
from pathlib import Path, PurePosixPath
import shlex
import stat
import struct
import subprocess
import tempfile
import zipfile

import numpy as np
from PIL import Image, UnidentifiedImageError

from app import modeldata

PROGRAM = Path(__file__).resolve().parents[1] / 'bin' / ('modelconvert-win64.exe' if os.name == 'nt' else 'modelconvert-linux-x64')
SUFFIXES = {'.glb', '.obj', '.fbx', '.zip'}


def _files(filename, raw):
    """One model and its uploaded companions, without opening any model-authored paths. Pure."""
    if Path(filename).suffix.lower() != '.zip':
        return filename, {filename: raw}
    files, size = {}, 0
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            if len(archive.infolist()) > 1024:
                raise ValueError('Choose a ZIP with at most 1024 files')
            for entry in archive.infolist():
                name = entry.filename.replace('\\', '/')
                parts = name.split('/')
                if (len(name) > 240 or name.startswith('/') or ':' in name or '\0' in name
                        or any(p in ('.', '..') for p in parts) or stat.S_ISLNK(entry.external_attr >> 16)):
                    raise ValueError('The ZIP contains an unsafe file path')
                if entry.is_dir() or '__MACOSX' in parts:
                    continue
                key = name.casefold()
                if key in files:
                    raise ValueError('The ZIP contains duplicate file names')
                size += entry.file_size
                if size > modeldata.MAX_BYTES:
                    raise ValueError('Unpacked model files must fit within 128 MB')
                files[key] = (name, archive.read(entry))
    except (zipfile.BadZipFile, RuntimeError, NotImplementedError, OSError) as error:
        raise ValueError('Could not read the model ZIP') from error
    models = [name for name, _ in files.values() if PurePosixPath(name).suffix.lower() in {'.obj', '.fbx'}]
    if len(models) != 1:
        raise ValueError('Choose a ZIP containing exactly one FBX or OBJ model and its textures')
    return models[0], {name: data for name, data in files.values()}


def _resolve(reference, model, files, material_dirs=()):
    """Resolve references only against uploaded bytes, including unique basenames from authored FBX paths. Pure."""
    reference = reference.replace('\\', '/').strip()
    lookup = {name.casefold(): name for name in files}
    for base in [str(PurePosixPath(model).parent), *material_dirs, '.']:
        path = str(PurePosixPath(base) / reference)
        if path.casefold() in lookup:
            return lookup[path.casefold()]
    matches = [name for name in files if PurePosixPath(name).name.casefold() == PurePosixPath(reference).name.casefold()]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        raise ValueError('Ambiguous texture file: ' + PurePosixPath(reference).name)
    raise ValueError('Missing model file: ' + PurePosixPath(reference).name + '. Include it in the model ZIP.')


def _materials(model, files):
    """Read only the uploaded MTL files named by an OBJ. Pure."""
    if PurePosixPath(model).suffix.lower() != '.obj':
        return b'', []
    names = []
    try:
        text = files[model].decode('utf-8-sig')
    except UnicodeDecodeError:
        text = files[model].decode('cp1252')
    for line in text.splitlines():
        fields = line.strip().split(maxsplit=1)
        if len(fields) != 2 or fields[0].lower() != 'mtllib':
            continue
        value = fields[1]
        value = value.strip()
        try:
            names.append(_resolve(value.strip('"'), model, files))
        except ValueError:
            try:
                references = shlex.split(value, posix=False)
            except ValueError as error:
                raise ValueError('Could not read the OBJ material file names') from error
            names.extend(_resolve(name.strip('"'), model, files) for name in references)
    names = list(dict.fromkeys(names))
    return b'\n'.join(files[name] for name in names), [str(PurePosixPath(name).parent) for name in names]


def _image(raw):
    """Decode one supported material image within the existing GLB image budget. Pure."""
    try:
        with Image.open(io.BytesIO(raw)) as image:
            if max(image.size) > 8192 or image.width * image.height > 32 << 20:
                raise ValueError('Model textures must fit within 8192 pixels per side and 32 megapixels')
            return image.convert('RGBA')
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
        raise ValueError('Could not decode a model texture; use PNG, JPG, TGA or another supported image') from error


def _pack_images(document, binary, folder, model, files, material_dirs):
    """Embed material maps, combining legacy opacity and metallic/roughness channels for glTF."""
    images, textures, samplers, cache, warnings = [], [], [], {}, []

    def source(spec):
        if 'embedded' in spec:
            name = spec['embedded']
            if PurePosixPath(name).name != name:
                raise ValueError('Invalid converted image path')
            return _image((folder / name).read_bytes())
        reference = spec.get('path') or spec.get('fallback') or ''
        return _image(files[_resolve(reference, model, files, material_dirs)])

    def embed(image, sampling=None):
        stream = io.BytesIO()
        image.save(stream, 'PNG')
        data = stream.getvalue()
        wrap = tuple((sampling or {}).get('wrap', (10497, 10497)))
        key = (data, wrap)
        if key in cache:
            return {'index': cache[key]}
        if len(images) >= modeldata.MAX_IMAGES:
            raise ValueError('Model has too many material images')
        binary.extend(b'\0' * (-len(binary) % 4))
        view = len(document['bufferViews'])
        document['bufferViews'].append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data)})
        binary.extend(data)
        if len(binary) > modeldata.MAX_BYTES:
            raise ValueError('Converted model exceeds 128 MB')
        index = len(images)
        images.append({'bufferView': view, 'mimeType': 'image/png'})
        samplers.append({'wrapS': wrap[0], 'wrapT': wrap[1]})
        textures.append({'source': index, 'sampler': index})
        cache[key] = index
        return {'index': index}

    for material in document['materials']:
        extras = material.pop('extras', {})
        specs = extras.get('importMaps', {})
        maps = {role: source(spec) for role, spec in specs.items()}
        pbr = material['pbrMetallicRoughness']
        colour = maps.get('colour')
        opacity = maps.get('opacity')
        if opacity is not None:
            if colour is not None and specs['opacity'].get('wrap') != specs['colour'].get('wrap'):
                raise ValueError('Colour and opacity textures must use the same repeat/clamp settings')
            if colour is None:
                colour = Image.new('RGBA', opacity.size, 'white')
            mask = opacity.getchannel('R').resize(colour.size, Image.Resampling.BILINEAR)
            alpha = (np.asarray(colour.getchannel('A'), dtype=np.uint16) * np.asarray(mask, dtype=np.uint16) // 255).astype('uint8')
            colour.putalpha(Image.fromarray(alpha))
        if colour is not None:
            if colour.getchannel('A').getextrema() != (255, 255):
                material.update(alphaMode='MASK', alphaCutoff=.5)
                # Legacy foliage often omits a two-sided flag; both leaf faces need its cutout.
                material['doubleSided'] = True
            pbr['baseColorTexture'] = embed(colour, specs.get('colour', specs.get('opacity')))
        if pbr['baseColorFactor'][3] < 1:
            material['alphaMode'] = 'BLEND'
        if 'normal' in maps:
            material['normalTexture'] = embed(maps['normal'].convert('RGB'), specs['normal'])
        if 'roughness' in maps or 'metallic' in maps:
            if 'roughness' in specs and 'metallic' in specs and specs['roughness'].get('wrap') != specs['metallic'].get('wrap'):
                raise ValueError('Roughness and metallic textures must use the same repeat/clamp settings')
            size = maps.get('roughness', maps.get('metallic')).size
            packed = Image.new('RGB', size, (255, 255, 255))
            channels = list(packed.split())
            for role, channel in [('roughness', 1), ('metallic', 2)]:
                if role in maps:
                    channels[channel] = maps[role].getchannel('R').resize(size, Image.Resampling.BILINEAR)
            pbr['metallicRoughnessTexture'] = embed(Image.merge('RGB', channels), specs.get('roughness', specs.get('metallic')))
        if 'emissive' in maps:
            material['emissiveTexture'] = embed(maps['emissive'].convert('RGB'), specs['emissive'])
            material.setdefault('emissiveFactor', [1, 1, 1])
        if extras.get('bumpMap'):
            warnings.append('Height/bump maps are retained in the source upload. Use tangent-space normal maps for surface relief.')
    if images:
        document.update(images=images, textures=textures, samplers=samplers)
    return list(dict.fromkeys(warnings))


def convert(filename, raw):
    """Convert an uploaded static model; the subprocess never reads model-authored external paths."""
    model, files = _files(filename, raw)
    mtl, material_dirs = _materials(model, files)
    if not PROGRAM.is_file():
        raise ValueError('The FBX/OBJ converter is missing from this Map2Lap installation')
    with tempfile.TemporaryDirectory(prefix='map2lap_model_') as temporary:
        folder = Path(temporary)
        path = folder / ('upload' + PurePosixPath(model).suffix.lower())
        path.write_bytes(files[model])
        (folder / 'materials.mtl').write_bytes(mtl)
        try:
            result = subprocess.run([str(PROGRAM), str(path), str(folder / 'materials.mtl'), str(folder)],
                                    capture_output=True, timeout=60, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        except subprocess.TimeoutExpired as error:
            raise ValueError('Model conversion took too long; simplify the model before importing') from error
        if result.returncode:
            error = result.stderr.decode('utf-8', errors='replace').strip()[:1500]
            raise ValueError(error or 'Could not convert this model')
        document = json.loads((folder / 'model.json').read_bytes())
        binary = bytearray((folder / 'geometry.bin').read_bytes())
        warnings = _pack_images(document, binary, folder, model, files, material_dirs)
    document['buffers'][0]['byteLength'] = len(binary)
    text = json.dumps(document, separators=(',', ':'), allow_nan=False).encode('utf-8')
    text += b' ' * (-len(text) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    size = 12 + 8 + len(text) + 8 + len(binary)
    if size > modeldata.MAX_BYTES:
        raise ValueError('Converted model exceeds 128 MB')
    glb = (struct.pack('<4sII', b'glTF', 2, size) + struct.pack('<II', len(text), 0x4e4f534a) + text
           + struct.pack('<II', len(binary), 0x004e4942) + binary)
    return glb, warnings
