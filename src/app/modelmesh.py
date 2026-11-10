"""Derived model geometry in AC's Y-up frame; original GLB resources remain immutable."""
import numpy as np
import hashlib
import io
import json
import math
from PIL import Image

from app import modelimport
from track import kn5, obj_to_kn5
from track.textures import dds_colour, dds_size


ENCODER = "dds 2"           # in every texture name: a changed encoder makes new images, and saved tracks take them
MAX_SIDE = 2048             # the native texture's longest side, also for models imported at 4K before import reduced them


def _native_size(width, height):
    """A native texture's sides: each the nearest power of two (BC blocks and mips halve evenly), at most MAX_SIDE. Pure."""
    return tuple(min(MAX_SIDE, 1 << max(0, round(math.log2(d)))) for d in (width, height))


def _recipe(model, source, factor, mode, cutoff):
    """A native texture's name and what makes it: source image number, RGBA factor, glTF alpha mode and cutoff, size. The name covers
    every input of its pixels, so equal pixels are one texture. "bytes" is the DDS's size; only the source image's header is read. Pure."""
    raw = model.images[source] if source is not None else b""
    if source is None:
        size = (4, 4)
    else:
        with Image.open(io.BytesIO(raw)) as picture:
            size = _native_size(*picture.size)
    inputs = [hashlib.sha256(raw).hexdigest() if source is not None else None, factor.tolist(), mode,
              cutoff if mode == "MASK" else None, size, ENCODER]
    name = "map2lap_model_" + hashlib.sha256(json.dumps(inputs).encode()).hexdigest() + ".dds"
    return name, {"source": source, "factor": factor.tolist(), "mode": mode, "cutoff": cutoff, "size": list(size),
                  "bytes": dds_size(*size, alpha=mode != "OPAQUE")}


def _pixels(model, recipe, size):
    """A recipe's colour and alpha as sRGB RGBA bytes at size (None: the source's), its factor applied after the resize: both
    are linear, so the order makes no difference, and a 4K source is never held as floats. Pure."""
    factor = np.asarray(recipe["factor"], np.float32)
    if recipe["source"] is None:
        pixels = np.ones(tuple((size or (4, 4))[::-1]) + (4,), np.float32)
    else:
        with Image.open(io.BytesIO(model.images[recipe["source"]])) as picture:
            image = picture.convert("RGBA")
        if recipe["mode"] == "OPAQUE":
            image.putalpha(255)       # (an opaque material's alpha means nothing: it must not weigh its colours)
        if size and tuple(size) != image.size:
            image = modelimport.resized(image, tuple(size), "colour")
        pixels = np.asarray(image.convert("RGBA"), np.float32) / 255
    rgb = pixels[..., :3]
    linear = np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4) * factor[:3]
    pixels[..., :3] = np.where(linear <= .0031308, linear * 12.92, 1.055 * np.maximum(linear, 0) ** (1 / 2.4) - .055)
    pixels[..., 3] = 1 if recipe["mode"] == "OPAQUE" else pixels[..., 3] * factor[3]
    return np.rint(np.clip(pixels, 0, 1) * 255).astype(np.uint8)


def image(model, recipe, side=None):
    """A recipe's colour and alpha as PNG bytes for a preview, at most side pixels wide and high when given. Pure."""
    size = None
    if side and recipe["source"] is not None:
        with Image.open(io.BytesIO(model.images[recipe["source"]])) as picture:
            scale = min(1, side / max(picture.size))
            size = tuple(max(1, round(d * scale)) for d in picture.size)
    stream = io.BytesIO(); Image.fromarray(_pixels(model, recipe, size)).save(stream, "PNG")
    return stream.getvalue()


def dds(model, recipe):
    """A recipe's native texture: DDS with mips at its power-of-two size, BC1 opaque, BC3 with alpha (textures.dds_colour). Pure."""
    return dds_colour(_pixels(model, recipe, recipe["size"]), recipe["mode"], recipe["cutoff"])


def materials(model, asset, light):
    """Native material factors lit as light says ({"ksAmbient", "ksDiffuse"}), and each texture's recipe by name: no image is read
    until Save or a preview asks for it. Pure."""
    result, recipes = [], {}
    definitions = list(model.materials)
    if not definitions or any(part.material is None for part in model.primitives):
        definitions.append({})  # glTF's omitted assignment uses its own default, independently of material zero.
    for number, material in enumerate(definitions):
        pbr = material.get("pbrMetallicRoughness", {})
        factor = np.asarray(pbr.get("baseColorFactor", [1, 1, 1, 1]), np.float64)
        if factor.shape != (4,) or not np.isfinite(factor).all() or np.any((factor < 0) | (factor > 1)):
            raise ValueError("Model base colour factors must be four numbers in 0..1")
        source = None
        if "baseColorTexture" in pbr:
            info = pbr["baseColorTexture"]
            if info.get("extensions"):
                raise ValueError("Bake model texture transforms into UV0 before native export")
            source = model.document["textures"][info["index"]]["source"]
        mode = material.get("alphaMode", "OPAQUE")
        name, recipe = _recipe(model, source, factor, mode, material.get("alphaCutoff", .5))
        recipes[name] = recipe
        props = {"ksAmbient": light["ksAmbient"], "ksDiffuse": light["ksDiffuse"], "ksSpecular": 0., "ksAlphaRef": material.get("alphaCutoff", .5),
                 "m2lModelMaterial": 1., "m2lRoughness": pbr.get("roughnessFactor", 1.), "m2lMetallic": pbr.get("metallicFactor", 1.)}
        values = [(k, float(v), (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)) for k, v in props.items()]
        result.append(kn5.Material(f"m2l_model_{asset[:24]}_{number}", "ksPerPixelAT" if mode == "MASK" else "ksPerPixel",
                                   int(mode == "BLEND"), int(mode == "MASK"), 0, values, [("txDiffuse", 0, name)]))
    return result, recipes


def _unit(values):
    lengths = np.linalg.norm(values, axis=1, keepdims=True)
    return values / np.maximum(lengths, 1e-30)


def geometry(model, meta):
    """Apply node transforms and import units about the frozen anchor, preserving UV0 and inverse-transpose normals. Pure."""
    result = []
    for node in model.instances:
        matrix = node.transform[:3, :3]
        determinant = np.linalg.det(matrix)
        if determinant == 0:
            raise ValueError("Model nodes need invertible transforms")
        for number in node.primitives:
            source = model.primitives[number]
            positions, uv, faces = source.positions.astype(np.float64), source.uvs, source.indices.copy()
            tangents = source.tangents
            if source.normals is None:
                # glTF explicitly defines flat face normals when NORMAL is absent, including vertices shared at a crease.
                normals = _unit(np.cross(positions[faces[:, 1]] - positions[faces[:, 0]], positions[faces[:, 2]] - positions[faces[:, 0]]))
                positions, uv = positions[faces.ravel()], uv[faces.ravel()]
                tangents = None  # glTF ignores TANGENT as well when NORMAL is absent.
                normals = np.repeat(normals, 3, axis=0)
                faces = np.arange(len(positions), dtype=np.uint32).reshape(-1, 3)
            else:
                normals = source.normals.astype(np.float64)
            points = (positions @ matrix.T + node.transform[:3, 3] - meta["anchor"]) * meta["metres_per_unit"]
            normals = _unit(normals @ np.linalg.inv(matrix))
            if determinant < 0:
                faces = faces[:, [0, 2, 1]]
            if tangents is None:
                tangent = obj_to_kn5.tangents(points, uv, faces, normals)
                handedness = None
            else:
                tangent = tangents[:, :3].astype(np.float64) @ matrix.T
                tangent = _unit(tangent - np.sum(tangent * normals, axis=1, keepdims=True) * normals)
                handedness = np.asarray(tangents[:, 3] * np.sign(determinant), np.float32)
            vertices = np.zeros(len(points), kn5.VERTEX)
            vertices["pos"], vertices["uv"], vertices["normal"], vertices["tangent"] = points, uv, normals, tangent
            if not np.isfinite(vertices.view("<f4")).all():
                raise ValueError("The model's imported dimensions exceed finite native coordinates")
            result.append({"vertices": vertices, "faces": np.asarray(faces, "<u4"), "material": source.material,
                           "primitive": number, "node": node.node, "tangent_handedness": handedness})
    return result
