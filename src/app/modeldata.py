"""Bounded, self-contained static GLB geometry and scene resources, independent of browser and AC material packing."""
from dataclasses import dataclass
import base64
import io
import json
import math
import struct

import numpy as np
from PIL import Image, UnidentifiedImageError

MAX_BYTES = 128 << 20
MAX_JSON_BYTES = 8 << 20  # Geometry belongs in binary buffers; cap Python object allocation for metadata.
MAX_VERTICES = 2_000_000
MAX_TRIANGLES = 2_000_000
MAX_PRIMITIVES = 4096
MAX_NODES = 4096
MAX_IMAGES = 128
COMPONENTS = {5120: "i1", 5121: "u1", 5122: "<i2", 5123: "<u2", 5125: "<u4", 5126: "<f4"}
WIDTHS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}
TEXTURE_EXTENSIONS = {"EXT_texture_webp": "image/webp", "KHR_texture_basisu": "image/ktx2"}


@dataclass(frozen=True)
class Primitive:
    positions: np.ndarray
    indices: np.ndarray
    normals: np.ndarray | None
    uvs: np.ndarray
    tangents: np.ndarray | None
    material: int | None


@dataclass(frozen=True)
class Instance:
    node: int
    primitives: tuple
    transform: np.ndarray


@dataclass(frozen=True)
class Model:
    primitives: tuple
    instances: tuple
    materials: tuple
    images: tuple
    document: dict
    bounds: list
    anchor: list


def _integer(value, minimum=0):
    if type(value) is not int or value < minimum:
        raise ValueError("Invalid GLB integer or index")
    return value


def _at(values, number):
    number = _integer(number)
    if number >= len(values):
        raise ValueError("GLB resource index is out of range")
    return values[number]


def _frozen(array):
    array.setflags(write=False)
    return array


def _nonfinite(_value):
    raise ValueError("Non-finite GLB number")


def _float(value):
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("Non-finite GLB number")
    return number


def _embedded(uri, mime_types):
    """Decode only inline base64 resources, without opening files or making network requests. Pure."""
    if not isinstance(uri, str):
        raise ValueError("GLB resources must be embedded in the model")
    header, separator, encoded = uri.partition(",")
    mime = next((kind for kind in mime_types if header.lower() == "data:" + kind + ";base64"), None)
    if not separator or mime is None:
        raise ValueError("GLB resources must be embedded as supported base64 data or buffer views")
    return mime, base64.b64decode(encoded, validate=True)


def _chunks(raw):
    """Validate the GLB header/chunk boundaries and retain views into its original binary buffer. Pure."""
    if not isinstance(raw, bytes) or not 20 <= len(raw) <= MAX_BYTES:
        raise ValueError("Choose a GLB model up to 128 MB")
    magic, version, size = struct.unpack_from("<4sII", raw)
    if magic != b"glTF" or version != 2 or size != len(raw) or size % 4:
        raise ValueError("Choose a complete binary glTF 2.0 (.glb) model")
    document, binary, offset, number = None, memoryview(b""), 12, 0
    seen_binary = False
    while offset < size:
        if offset + 8 > size:
            raise ValueError("Incomplete GLB chunk")
        length, kind = struct.unpack_from("<II", raw, offset)
        offset += 8
        if length % 4 or offset + length > size:
            raise ValueError("Invalid GLB chunk length")
        chunk = memoryview(raw)[offset:offset + length]
        if kind == 0x4e4f534a:
            if number != 0 or document is not None:
                raise ValueError("GLB must begin with exactly one JSON chunk")
            if length > MAX_JSON_BYTES:
                raise ValueError("The GLB JSON metadata is too large")
            document = json.loads(bytes(chunk), parse_constant=_nonfinite, parse_float=_float)
        elif kind == 0x004e4942:
            if number != 1 or seen_binary:
                raise ValueError("GLB binary data must be its second chunk")
            binary, seen_binary = chunk, True
        elif number == 0:
            raise ValueError("GLB must begin with JSON")
        offset += length
        number += 1
    if not isinstance(document, dict) or document.get("asset", {}).get("version") != "2.0":
        raise ValueError("The GLB asset must use glTF 2.0")
    return document, binary


class _Reader:
    def __init__(self, document, binary):
        self.document, self.binary = document, binary
        buffers = document.get("buffers", [])
        if len(buffers) != 1:
            raise ValueError("GLB buffers must be embedded in the model")
        if "uri" in buffers[0]:
            _mime, payload = _embedded(buffers[0]["uri"], ("application/octet-stream", "application/gltf-buffer"))
            self.binary = memoryview(payload)
        self.length = _integer(buffers[0]["byteLength"])
        if not 0 <= len(self.binary) - self.length <= 3:
            raise ValueError("The embedded GLB buffer length is invalid")

    def view(self, index):
        view = _at(self.document.get("bufferViews", []), index)
        if view.get("buffer") != 0 or view.get("extensions"):
            raise ValueError("Use uncompressed embedded GLB buffer views")
        start, size = _integer(view.get("byteOffset", 0)), _integer(view["byteLength"], 1)
        if start + size > self.length:
            raise ValueError("GLB buffer view lies outside its embedded data")
        return view, self.binary[start:start + size]

    def array(self, index, width, *, indices=False):
        accessor = _at(self.document.get("accessors", []), index)
        if accessor.get("sparse"):
            raise ValueError("Sparse GLB accessors are not supported")
        kind, shape = accessor["componentType"], accessor["type"]
        count = _integer(accessor["count"], 1)
        if kind not in COMPONENTS or WIDTHS.get(shape) != width or count > max(MAX_VERTICES, MAX_TRIANGLES * 3):
            raise ValueError("Invalid or oversized GLB accessor")
        if indices and (kind not in (5121, 5123, 5125) or accessor.get("normalized")):
            raise ValueError("GLB indices require unsigned integers")
        view, raw = self.view(accessor["bufferView"])
        dtype = np.dtype(COMPONENTS[kind])
        offset = _integer(accessor.get("byteOffset", 0))
        stride = _integer(view.get("byteStride", dtype.itemsize * width), 1)
        if (stride < dtype.itemsize * width or stride % dtype.itemsize or offset % dtype.itemsize
                or offset + (count - 1) * stride + dtype.itemsize * width > len(raw)):
            raise ValueError("GLB accessor lies outside its buffer view")
        values = np.ndarray((count, width), dtype, raw, offset, (stride, dtype.itemsize)).copy()
        if accessor.get("normalized"):
            if dtype.kind not in "iu":
                raise ValueError("Only integer GLB attributes can be normalized")
            values = np.maximum(-1, values.astype(np.float32) / np.iinfo(dtype).max)
        if not np.isfinite(values).all():
            raise ValueError("GLB attributes must be finite")
        return _frozen(values)


def _primitive(reader, primitive, materials):
    if primitive.get("mode", 4) != 4 or primitive.get("targets"):
        raise ValueError("Use static GLB triangle meshes without morph targets")
    attributes = primitive["attributes"]
    if set(attributes) - {"POSITION", "NORMAL", "TEXCOORD_0", "TANGENT"}:
        raise ValueError("This GLB uses unsupported vertex attributes; use positions, normals, UV0 and tangents")
    positions = reader.array(attributes["POSITION"], 3)
    if positions.dtype.kind != "f" or len(positions) > MAX_VERTICES:
        raise ValueError("GLB positions must use floating-point metres")
    indices = (reader.array(primitive["indices"], 1, indices=True).ravel() if "indices" in primitive
               else np.arange(len(positions), dtype=np.uint32))
    if len(indices) % 3 or len(indices) // 3 > MAX_TRIANGLES or np.any(indices >= len(positions)):
        raise ValueError("Invalid or oversized GLB triangle indices")
    normals = reader.array(attributes["NORMAL"], 3) if "NORMAL" in attributes else None
    tangents = reader.array(attributes["TANGENT"], 4) if "TANGENT" in attributes else None
    uvs = reader.array(attributes["TEXCOORD_0"], 2) if "TEXCOORD_0" in attributes else np.zeros((len(positions), 2), np.float32)
    if any(len(values) != len(positions) for values in (normals, tangents, uvs) if values is not None):
        raise ValueError("GLB attributes have different vertex counts")
    material = primitive.get("material")
    if material is not None:
        _at(materials, material)
    return Primitive(positions, _frozen(indices.reshape(-1, 3)), normals, _frozen(uvs), tangents, material)


def _vector(value, size):
    values = np.asarray(value, np.float64)
    if values.shape != (size,) or not np.isfinite(values).all():
        raise ValueError("Invalid GLB transform")
    return values


def _transform(node):
    if "matrix" in node:
        if any(key in node for key in ("translation", "rotation", "scale")):
            raise ValueError("GLB nodes cannot mix matrix and TRS transforms")
        matrix = _vector(node["matrix"], 16).reshape((4, 4), order="F")
        if not np.array_equal(matrix[3], [0, 0, 0, 1]):
            raise ValueError("GLB transforms must be affine")
        return matrix
    x, y, z, w = _vector(node.get("rotation", [0, 0, 0, 1]), 4)
    norm = x*x + y*y + z*z + w*w
    if not np.isclose(norm, 1, rtol=1e-5, atol=1e-7):
        raise ValueError("GLB rotations must use unit quaternions")
    x, y, z, w = np.array([x, y, z, w]) / np.sqrt(norm)
    rotation = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                         [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                         [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
    matrix = np.eye(4)
    matrix[:3, :3] = rotation * _vector(node.get("scale", [1, 1, 1]), 3)
    matrix[:3, 3] = _vector(node.get("translation", [0, 0, 0]), 3)
    return matrix


def _instances(document, meshes, primitives):
    nodes = document.get("nodes", [])
    if len(nodes) > MAX_NODES:
        raise ValueError("The GLB has too many scene nodes")
    scenes = document.get("scenes", [])
    if not scenes:
        raise ValueError("The GLB needs a scene containing its model")
    roots = _at(scenes, document.get("scene", 0)).get("nodes", [])
    if not isinstance(roots, list) or len(roots) > MAX_NODES:
        raise ValueError("The GLB scene has too many root nodes")
    instances, visited = [], set()
    low, high = np.full(3, np.inf), np.full(3, -np.inf)
    foot_low, foot_high = low.copy(), high.copy()
    vertex_count = 0
    # Iteration bounds hierarchy depth without relying on Python's recursion limit.
    pending = [(index, np.eye(4)) for index in reversed(roots)]
    while pending:
        index, parent = pending.pop()
        node = _at(nodes, index)
        if index in visited:
            raise ValueError("The GLB scene must be a tree without cycles or repeated node references")
        visited.add(index)
        if "skin" in node or node.get("weights"):
            raise ValueError("Use static GLB models without skins or animated morph weights")
        with np.errstate(over="ignore", invalid="ignore"):
            transform = parent @ _transform(node)
        if not np.isfinite(transform).all():
            raise ValueError("The combined GLB transform is not finite")
        if "mesh" in node:
            refs = _at(meshes, node["mesh"])
            for part in refs:
                positions = primitives[part].positions
                vertex_count += len(positions)
                if vertex_count > MAX_VERTICES:
                    raise ValueError("The instantiated GLB scene has too many vertices")
                with np.errstate(over="ignore", invalid="ignore"):
                    world = positions @ transform[:3, :3].T + transform[:3, 3]
                if not np.isfinite(world).all():
                    raise ValueError("The transformed GLB vertices must be finite")
                bottom = world[:, 1].min()
                contacts = world[world[:, 1] == bottom]
                if bottom < low[1]:
                    foot_low, foot_high = contacts.min(axis=0), contacts.max(axis=0)
                elif bottom == low[1]:
                    foot_low = np.minimum(foot_low, contacts.min(axis=0))
                    foot_high = np.maximum(foot_high, contacts.max(axis=0))
                low, high = np.minimum(low, world.min(axis=0)), np.maximum(high, world.max(axis=0))
            instances.append(Instance(index, refs, _frozen(transform)))
        children = node.get("children", [])
        if not isinstance(children, list) or len(children) > MAX_NODES:
            raise ValueError("The GLB has too many child nodes")
        for child in reversed(children):
            pending.append((child, transform))
    if not instances:
        raise ValueError("The GLB scene has no model geometry")
    # The lowest transformed vertices are the contact footprint; an asymmetric crown must not move the tree's foot.
    # Bounds, rather than a mean, also make duplicated contact vertices immaterial. No physical-height tolerance is used.
    anchor = foot_low / 2 + foot_high / 2
    return tuple(instances), [low.tolist(), high.tolist()], anchor.tolist()


def _images(reader):
    entries = reader.document.get("images", [])
    if len(entries) > MAX_IMAGES:
        raise ValueError("The GLB contains too many images")
    textures = reader.document.get("textures", [])
    core_sources = {texture["source"] for texture in textures}
    alternatives = {}
    for texture in textures:
        for name, extension in texture.get("extensions", {}).items():
            if name in TEXTURE_EXTENSIONS:
                alternatives.setdefault(extension["source"], set()).add(TEXTURE_EXTENSIONS[name])
    images = []
    for index, entry in enumerate(entries):
        alternative_mimes = alternatives.get(index, set()) if index not in core_sources else set()
        if "uri" in entry:
            mime, raw = _embedded(entry["uri"], ("image/png", "image/jpeg", *sorted(alternative_mimes)))
        elif "bufferView" in entry:
            _view, raw = reader.view(entry["bufferView"])
            mime = entry.get("mimeType")
        else:
            raise ValueError("GLB images must be embedded in the model")
        if mime in alternative_mimes:
            # Select the supported core fallback. Retain unused extension bytes/metadata verbatim, without claiming a decoder.
            images.append(bytes(raw))
            continue
        with Image.open(io.BytesIO(raw)) as image:
            if (image.format not in ("PNG", "JPEG") or max(image.size) > 8192 or image.width * image.height > (32 << 20)
                    or mime != {"PNG": "image/png", "JPEG": "image/jpeg"}.get(image.format)):
                raise ValueError("Use embedded PNG/JPG model images up to 8192 pixels and 32 megapixels")
            image.verify()
        images.append(bytes(raw))
    return tuple(images)


def _materials(document):
    """Validate core PBR resource references while retaining their complete original material descriptions. Pure."""
    textures, images = document.get("textures", []), document.get("images", [])
    samplers = document.get("samplers", [])
    for texture in textures:
        if "source" not in texture:
            extensions = texture.get("extensions", {})
            unsupported = [name for name in TEXTURE_EXTENSIONS if name in extensions]
            if unsupported:
                raise ValueError("Unsupported texture extension " + ", ".join(unsupported) + "; export a PNG/JPEG core texture fallback")
            raise ValueError("A GLB texture needs an embedded PNG/JPEG source")
        _at(images, texture["source"])
        for name, extension in texture.get("extensions", {}).items():
            if name in TEXTURE_EXTENSIONS:
                _at(images, extension["source"])
        if "sampler" in texture:
            _at(samplers, texture["sampler"])
    materials = document.get("materials", [])
    for material in materials:
        if material.get("alphaMode", "OPAQUE") not in ("OPAQUE", "MASK", "BLEND"):
            raise ValueError("Invalid GLB material alpha mode")
        pbr = material.get("pbrMetallicRoughness", {})
        for key, owner in (("baseColorTexture", pbr), ("metallicRoughnessTexture", pbr),
                           ("normalTexture", material), ("occlusionTexture", material), ("emissiveTexture", material)):
            if key in owner:
                _at(textures, owner[key]["index"])
                if owner[key].get("texCoord", 0) != 0:
                    raise ValueError("Model textures must use the first UV set")
    return materials


def load(raw):
    """Read a self-contained static GLB, sharing primitive resources and retaining material metadata and original image bytes. Pure."""
    try:
        document, binary = _chunks(raw)
        if document.get("extensionsRequired"):
            raise ValueError("This GLB requires an unsupported extension: " + ", ".join(document["extensionsRequired"]))
        if document.get("animations"):
            raise ValueError("Use a static GLB without animation")
        reader = _Reader(document, binary)
        materials = _materials(document)
        primitives, meshes = [], []
        vertex_count, triangle_count = 0, 0
        for mesh in document.get("meshes", []):
            refs = []
            for primitive in mesh["primitives"]:
                if len(primitives) >= MAX_PRIMITIVES:
                    raise ValueError("The GLB has too many mesh primitives")
                refs.append(len(primitives))
                part = _primitive(reader, primitive, materials)
                primitives.append(part)
                vertex_count += len(part.positions)
                triangle_count += len(part.indices)
                if vertex_count > MAX_VERTICES or triangle_count > MAX_TRIANGLES:
                    raise ValueError("The GLB contains too much geometry")
            if not refs:
                raise ValueError("GLB meshes must contain triangle geometry")
            meshes.append(tuple(refs))
        instances, bounds, anchor = _instances(document, meshes, primitives)
        images = _images(reader)
        return Model(tuple(primitives), instances, tuple(materials), images, document, bounds, anchor)
    except (KeyError, IndexError, TypeError, AttributeError, struct.error, UnicodeError, OSError, UnidentifiedImageError,
            OverflowError, RecursionError, Image.DecompressionBombError) as error:
        raise ValueError("Could not read this GLB model: invalid or unsupported data") from error
