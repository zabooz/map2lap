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


def material_colours(raw, space='linear'):
    """Decode explicitly selected legacy sRGB base-colour factors; preserve alpha, maps and binary chunks. Pure."""
    if space not in ('linear', 'srgb'):
        raise ValueError('Choose model or sRGB material colours')
    if space == 'linear':
        return raw
    document, _binary = modeldata._chunks(raw)
    changed = False
    for material in document.get('materials', []):
        pbr = material.get('pbrMetallicRoughness', {})
        if 'baseColorFactor' not in pbr:
            continue
        rgb, alpha = pbr['baseColorFactor'][:3], pbr['baseColorFactor'][3]
        # Some legacy exports (Kenney Nature Kit) put their sRGB palette directly in glTF's linear factor.
        # Never infer this from brightness: valid linear factors would be darkened a second time.
        pbr['baseColorFactor'] = [*(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb), alpha]
        changed = True
    if not changed:
        return raw
    return _with_document(raw, document)


def material_lighting(raw, mode='model'):
    """Explicit matte artwork keeps its palette and uses diffuse scene lighting without room reflections. Pure."""
    if mode not in ('model', 'matte'):
        raise ValueError('Choose model or matte material lighting')
    if mode == 'model':
        return raw
    document, _binary = modeldata._chunks(raw)
    for material in document.get('materials', []):
        extras = material.setdefault('extras', {})
        if not isinstance(extras, dict) or not isinstance(extras.get('map2lap', {}), dict):
            raise ValueError('The material extras cannot store a matte surface setting')
        extras.setdefault('map2lap', {})['lighting'] = 'matte'
        # Flat palette artwork has a matte dielectric surface, rather than the legacy exporter's metallic default.
        material.setdefault('pbrMetallicRoughness', {}).update(metallicFactor=0, roughnessFactor=1)
    return _with_document(raw, document)


TEXTURE_SIDES = (1024, 2048)
# Colour images are averaged in linear light; a normal map's vectors are renormalized; other maps hold data, each channel apart.
COLOUR_ROLES = {"baseColorTexture", "emissiveTexture", "diffuseTexture", "specularGlossinessTexture", "specularColorTexture", "sheenColorTexture"}


def _roles(document):
    """Each image's uses by texture slot name: "colour", "normal" or "data". Pure."""
    roles = {}

    def walk(value, key=""):
        if isinstance(value, dict):
            if key.endswith("Texture") and "index" in value:
                source = document["textures"][value["index"]].get("source")
                role = "normal" if key == "normalTexture" else "colour" if key in COLOUR_ROLES else "data"
                roles.setdefault(source, set()).add(role)
            for name, child in value.items():
                walk(child, name)
        elif isinstance(value, list):
            for child in value:
                walk(child, key)
    walk(document.get("materials", []))
    return roles


def _to_linear(c):
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)


def _to_srgb(c):
    return np.where(c <= .0031308, c * 12.92, 1.055 * np.maximum(c, 0) ** (1 / 2.4) - .055)


def _resized(image, size, role):
    """One image at size by its role: colour in linear light weighted by alpha, so transparent pixels lend no colour; a normal map
    with unit vectors again; data each channel apart. Pure."""
    bands = image.getbands()
    pixels = np.asarray(image.convert("RGBA" if "A" in bands else "RGB"), np.float32) / 255

    def scale(channel):
        return np.asarray(Image.fromarray(channel.astype(np.float32), "F").resize(size, Image.Resampling.LANCZOS))
    alpha = pixels[..., 3] if pixels.shape[2] == 4 else None
    if role == "colour":
        weight = alpha if alpha is not None else np.ones(pixels.shape[:2], np.float32)
        covered = np.clip(scale(weight), 0, 1)
        rgb = np.dstack([scale(_to_linear(pixels[..., k]) * weight) for k in range(3)])
        rgb = _to_srgb(np.clip(rgb / np.maximum(covered, 1e-6)[..., None], 0, 1))
    else:
        rgb = np.dstack([scale(pixels[..., k]) for k in range(3)])
        if role == "normal":
            vectors = rgb * 2 - 1
            rgb = vectors / np.maximum(np.linalg.norm(vectors, axis=2, keepdims=True), 1e-6) * .5 + .5
        covered = scale(alpha) if alpha is not None else None
    out = rgb if alpha is None else np.dstack([rgb, covered])
    return Image.fromarray(np.rint(np.clip(out, 0, 1) * 255).astype(np.uint8))


def texture_size(raw, side):
    """The GLB with every image longer than side reduced to it on its long side, never enlarged: the same object, a smaller texture.
    An image used both as a normal map and otherwise keeps its size. Alternative WebP/KTX2 sources go, so a browser shows the reduced
    core image; the original upload keeps them. raw itself when nothing is longer. Pure."""
    document, binary = modeldata._chunks(raw)
    entries, textures = document.get("images", []), document.get("textures", [])
    core = {texture["source"] for texture in textures if "source" in texture}
    kept = [k for k in range(len(entries)) if k in core or not any(
        extension.get("source") == k for texture in textures for name, extension in texture.get("extensions", {}).items() if name in modeldata.TEXTURE_EXTENSIONS)]

    def payload(entry):
        if "uri" in entry:
            return modeldata._embedded(entry["uri"], ("image/png", "image/jpeg", *modeldata.TEXTURE_EXTENSIONS.values()))[1]
        view = document["bufferViews"][entry["bufferView"]]
        return bytes(binary[view.get("byteOffset", 0):view.get("byteOffset", 0) + view["byteLength"]])
    sizes = {}
    for k, entry in enumerate(entries):
        with Image.open(io.BytesIO(payload(entry))) as image:
            sizes[k] = image.size
    if max((max(size) for size in sizes.values()), default=0) <= side:
        return raw
    roles, images = _roles(document), {}
    for k in kept:
        raw_image, role = payload(entries[k]), roles.get(k, {"data"})
        width, height = sizes[k]
        if max(width, height) <= side or ("normal" in role and len(role) > 1):
            images[k] = raw_image
            continue
        size = tuple(max(1, round(d * side / max(width, height))) for d in (width, height))
        with Image.open(io.BytesIO(raw_image)) as image:
            reduced = _resized(image, size, "colour" if role == {"colour"} else "normal" if role == {"normal"} else "data")
            out = io.BytesIO()
            if image.format == "JPEG":
                reduced.convert("RGB").save(out, "JPEG", quality=95)
            else:
                reduced.save(out, "PNG")
        images[k] = out.getvalue()
    return _with_images(document, binary, kept, images)


def _with_images(document, binary, kept, images):
    """A GLB of document whose image list is kept, each in its own buffer view holding images[k]; other views keep their bytes. Pure."""
    image_views = {entry.get("bufferView") for entry in document.get("images", [])} - {None}
    if any(view.get("buffer", 0) != 0 for view in document.get("bufferViews", [])):
        raise ValueError("GLB resources must be embedded in the model")
    out, views, renumber = bytearray(), [], {}

    def append(data, view):
        out.extend(b"\0" * (-len(out) % 4))
        views.append({**view, "buffer": 0, "byteOffset": len(out), "byteLength": len(data)})
        out.extend(data)
        return len(views) - 1
    for k, view in enumerate(document.get("bufferViews", [])):
        if k not in image_views:
            start = view.get("byteOffset", 0)
            renumber[k] = append(binary[start:start + view["byteLength"]], {key: v for key, v in view.items() if key != "byteOffset"})
    for accessor in document.get("accessors", []):
        if "bufferView" in accessor:
            accessor["bufferView"] = renumber[accessor["bufferView"]]
    entries, number = document.get("images", []), {}
    document["images"] = []
    for k in kept:
        entry = {key: v for key, v in entries[k].items() if key not in ("uri", "bufferView")}
        entry.setdefault("mimeType", "image/jpeg" if images[k][:2] == b"\xff\xd8" else "image/png")
        entry["bufferView"] = append(images[k], {})
        number[k] = len(document["images"])
        document["images"].append(entry)
    for texture in document.get("textures", []):
        texture["source"] = number[texture["source"]]
        for name in modeldata.TEXTURE_EXTENSIONS:
            texture.get("extensions", {}).pop(name, None)
        if texture.get("extensions") == {}:
            texture.pop("extensions")
    used = [name for name in document.get("extensionsUsed", []) if name not in modeldata.TEXTURE_EXTENSIONS]
    document.pop("extensionsUsed", None)
    if used:
        document["extensionsUsed"] = used
    document["bufferViews"] = views
    out.extend(b"\0" * (-len(out) % 4))
    document["buffers"] = [{"byteLength": len(out)}]
    text = json.dumps(document, separators=(",", ":"), allow_nan=False).encode("utf-8")
    text += b" " * (-len(text) % 4)
    size = 28 + len(text) + len(out)
    if size > modeldata.MAX_BYTES or len(text) > modeldata.MAX_JSON_BYTES:
        raise ValueError("Adjusted model exceeds the GLB size limit")
    return (struct.pack("<4sIIII", b"glTF", 2, size, len(text), 0x4e4f534a) + text
            + struct.pack("<II", len(out), 0x004e4942) + bytes(out))


def _with_document(raw, document):
    """Replace the GLB's JSON only, keeping every following binary chunk byte-identical. Pure."""
    text = json.dumps(document, separators=(',', ':'), allow_nan=False).encode('utf-8')
    text += b' ' * (-len(text) % 4)
    tail = raw[20 + struct.unpack_from('<I', raw, 12)[0]:]
    size = 20 + len(text) + len(tail)
    if size > modeldata.MAX_BYTES or len(text) > modeldata.MAX_JSON_BYTES:
        raise ValueError('Adjusted model exceeds the GLB size limit')
    return struct.pack('<4sIIII', b'glTF', 2, size, len(text), 0x4e4f534a) + text + tail


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
