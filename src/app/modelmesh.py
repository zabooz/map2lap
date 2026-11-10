"""Derived model geometry in AC's Y-up frame; original GLB resources remain immutable."""
import numpy as np
import hashlib
import io
import json
from PIL import Image

from track import kn5, obj_to_kn5


def _recipe(model, source, factor, opaque):
    """A native texture's name and what makes it: source image number, RGBA factor, opaque. The name covers every input of the
    pixels, so equal pixels are one texture. "bytes" estimates its size by the source image's, a 4 px swatch without one. Pure."""
    raw = model.images[source] if source is not None else b""
    inputs = [hashlib.sha256(raw).hexdigest() if source is not None else None, factor.tolist(), opaque]
    name = "map2lap_model_" + hashlib.sha256(json.dumps(inputs).encode()).hexdigest() + ".png"
    return name, {"source": source, "factor": factor.tolist(), "opaque": opaque, "bytes": len(raw) or 128}


def image(model, recipe, side=None):
    """A recipe's native colour/alpha texture as PNG bytes, at most side pixels wide and high when given. Pure."""
    factor = np.asarray(recipe["factor"], np.float64)
    if recipe["source"] is None:
        pixels = np.ones((4, 4, 4), np.float64)
    else:
        with Image.open(io.BytesIO(model.images[recipe["source"]])) as picture:
            if side:
                picture.thumbnail((side, side), Image.Resampling.LANCZOS)
            pixels = np.asarray(picture.convert("RGBA"), np.float64) / 255
    rgb = pixels[..., :3]
    linear = np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4) * factor[:3]
    pixels[..., :3] = np.where(linear <= .0031308, linear * 12.92, 1.055 * linear ** (1 / 2.4) - .055)
    pixels[..., 3] = 1 if recipe["opaque"] else pixels[..., 3] * factor[3]
    stream = io.BytesIO(); Image.fromarray(np.rint(pixels * 255).astype(np.uint8)).save(stream, "PNG")
    return stream.getvalue()


def materials(model, asset):
    """Native material factors, and each texture's recipe by name: no image is read until Save or a preview asks for it. Pure."""
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
        name, recipe = _recipe(model, source, factor, mode == "OPAQUE")
        recipes[name] = recipe
        props = {"ksAmbient": .5, "ksDiffuse": .5, "ksSpecular": 0., "ksAlphaRef": material.get("alphaCutoff", .5),
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
