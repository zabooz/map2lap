"""Library packages of our own generated scenery, enabled by assets/builtin-objects.json.

Source geometry and artwork stay in scenery/: a package is prepared once into cache/builtin-objects, content addressed like an
import. A tree also retains its real TreeFX .bin; the GLB is its library/placement preview, not its game representation.
"""
import functools
import hashlib
import io
import json
from pathlib import Path
import random
import struct
import tempfile
import threading

import numpy as np
from PIL import ImageFilter

from app import modeldata, version
from scenery import propsmesh, rocks, treefx

_gate = threading.RLock()
PROPS = {"streetlight": ("Street lamp", 9), "polelamp": ("Mast-mounted lamp", 3), "pole": ("Utility pole", 9),
         "bench": ("Bench", 1), "bin": ("Litter bin", .85), "hydrant": ("Fire hydrant", .8),
         "stop": ("Stop sign", 2.5), "giveway": ("Give way sign", 2.5), "signal": ("Traffic light", 4),
         **{f"speedk{n}": (f"Speed limit {n}", 2.5) for n in (50, 60, 80, 100)},
         **{g + suffix: (title + (" — Europe" if suffix else " — America"), 3)
            for g, title in (("rrcross", "Railway crossing sign"), ("rrflash", "Railway crossing lights"),
                             ("rrgate", "Railway crossing barrier")) for suffix in ("", "_eu")}}


def _png(image):
    stream = io.BytesIO()
    image.save(stream, format="PNG")
    return stream.getvalue()


def _glb(parts, texture, extras=None):
    """Self-contained GLB of [(positions, UVs, triangles, material description)], with one shared painted atlas. Pure."""
    binary = bytearray()
    views, accessors, primitives, materials = [], [], [], []

    def view(raw):
        binary.extend(b"\0" * (-len(binary) % 4))
        index = len(views)
        views.append({"buffer": 0, "byteOffset": len(binary), "byteLength": len(raw)})
        binary.extend(raw)
        return index

    def accessor(values, kind):
        values = np.asarray(values, dtype="<u4" if kind == "SCALAR" else "<f4")
        desc = {"bufferView": view(values.tobytes()), "componentType": 5125 if kind == "SCALAR" else 5126,
                "count": len(values), "type": kind}
        if kind == "VEC3":
            desc.update(min=values.min(axis=0).tolist(), max=values.max(axis=0).tolist())
        accessors.append(desc)
        return len(accessors) - 1

    for part in parts:
        positions, uv, triangles, material = part[:4]
        if not len(triangles):
            continue
        # The generator's boxes and rocks have hard edges: share the artwork, keep a face's normal on its face.
        positions, uv, triangles = map(np.asarray, (positions, uv, triangles))
        p, tuv = positions[triangles].reshape(-1, 3), uv[triangles].reshape(-1, 2)
        n = np.cross(positions[triangles[:, 1]] - positions[triangles[:, 0]], positions[triangles[:, 2]] - positions[triangles[:, 0]])
        n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
        normals = np.asarray(part[4])[triangles].reshape(-1, 3) if len(part) > 4 else np.repeat(n, 3, axis=0)
        primitives.append({"attributes": {"POSITION": accessor(p, "VEC3"), "NORMAL": accessor(normals, "VEC3"),
                                            "TEXCOORD_0": accessor(tuv, "VEC2")},
                           "indices": accessor(np.arange(len(p)), "SCALAR"), "material": len(materials)})
        materials.append({"pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0, "roughnessFactor": 1},
                          **material})
    image = view(_png(texture))
    document = {"asset": {"version": "2.0", "generator": "Map2Lap", "extras": extras or {}}, "scene": 0, "scenes": [{"nodes": [0]}],
                "nodes": [{"mesh": 0}], "meshes": [{"primitives": primitives}], "materials": materials,
                "images": [{"bufferView": image, "mimeType": "image/png"}], "textures": [{"source": 0, "sampler": 0}],
                "samplers": [{"wrapS": 10497, "wrapT": 10497, "magFilter": 9729, "minFilter": 9987}],
                "buffers": [{"byteLength": len(binary)}], "bufferViews": views, "accessors": accessors}
    description = json.dumps(document, separators=(",", ":"), allow_nan=False).encode()
    description += b" " * (-len(description) % 4)
    binary.extend(b"\0" * (-len(binary) % 4))
    return (struct.pack("<4sII", b"glTF", 2, 28 + len(description) + len(binary)) + struct.pack("<I4s", len(description), b"JSON")
            + description + struct.pack("<I4s", len(binary), b"BIN\0") + binary)


def _enu(part):
    """A generator mesh from ENU to AC (x east, y up, z south), and atlas UVs from OBJ to glTF. Pure."""
    p, uv, t = part
    return np.asarray(p)[:, [0, 2, 1]] * [1, 1, -1], np.asarray(uv) * [1, -1] + [0, 1], np.asarray(t)


def _source(name):
    """A library entry's GLB, category and collision choice, from the same builders the generator uses. Pure."""
    if name in treefx.MODELS:
        texture, lods = treefx.model(name)
        m = lods[0]
        return _glb([(m.p, m.uv, m.t, {"name": name, "alphaMode": "MASK", "alphaCutoff": .5, "doubleSided": True}, m.n)], texture,
                    {"treefx_sha256": hashlib.sha256(_tree_bin(name)).hexdigest()}), (
            "bush" if name in ("shrub", "shrub_flowers", "dry_shrub", "jungle_bush") else "tree"), "none"
    if name.startswith("rock_"):
        from scenery import groundcover
        shapes, triangles = rocks._variants()
        p = shapes[int(name.removeprefix("rock_"))]
        texture = groundcover._rock(random.Random(23)).filter(ImageFilter.SMOOTH)
        return _glb([(*_enu((p, p[:, :2] / rocks.UV_M, triangles)), {"name": "rock"})], texture), "rock", "mesh"
    # A pole-mounted head is authored below its attachment point; put its underside at the library's ground anchor.
    solid, deco, glass, _ = propsmesh.build([name], [[0, 0, 0, .3 if name == "polelamp" else 0, 0, 1, PROPS[name][1], .5]])
    parts = [(*_enu(part), {"name": label, "extras": {"map2lapCollision": collide, "map2lapLamp": label == "lamp_glass"}})
             for part, label, collide in ((solid, "props_solid", True), (deco, "props", False), (glass, "lamp_glass", False))
             if part is not None and len(part[2])]
    return _glb(parts, _props_texture()), "prop", "mesh" if solid is not None else "none"


@functools.lru_cache(maxsize=1)
def _props_texture():
    return propsmesh.atlas()


@functools.lru_cache(maxsize=32)
def _tree_bin(name):
    stream = io.BytesIO()
    treefx.write_bin(stream, name)
    return stream.getvalue()


@functools.lru_cache(maxsize=1)
def _packages():
    """Immutable descriptions and original bytes, once per process. No library or track is changed."""
    from app import objectlibrary
    out = {}
    for name in (*treefx.MODELS, *(f"rock_{n}" for n in range(rocks.VARIANTS)), *PROPS):
        raw, category, collision = _source(name)
        model, digest = modeldata.load(raw), hashlib.sha256(raw).hexdigest()
        meta = {"name": PROPS[name][0] if name in PROPS else (f"Rock {int(name[5:]) + 1}" if name.startswith("rock_") else name.replace("_", " ").title()),
                "category": category, "metres_per_unit": 1, "anchor": [0, 0, 0], "collision": collision}
        id = objectlibrary.identity(digest, meta)
        source = "treefx" if name in treefx.MODELS else "rocks" if name.startswith("rock_") else "propsmesh"
        record = {"schema": objectlibrary.SCHEMA, "kind": "model", "id": id, **meta, "creator": "Map2Lap (zabooz)",
                  "license": "MIT", "source_url": version.REPO_URL, "copyright": "Copyright (c) 2026 zabooz",
                  "attribution": "Map2Lap; generator based on BeamNG.Earth by TecnaGamer (MIT).",
                  "tags": ["Map2Lap", "painted", category], "geometry": objectlibrary._summary(model), "material_lighting": "matte",
                  "builtin": {"name": name, "source": f"src/scenery/{source}.py"},
                  "model": {"file": "original/model.glb", "filename": name + ".glb", "sha256": digest, "bytes": len(raw)}}
        if name in treefx.MODELS:
            native = _tree_bin(name)
            record["native_tree"] = {"file": "native/model.bin", "model": name, "sha256": hashlib.sha256(native).hexdigest(), "bytes": len(native)}
        out[id] = record, raw
    return out


def catalogue(root):
    """Our shipped entries, empty for an app folder without the manifest (such as a test's isolated library)."""
    manifest = Path(root, "assets/builtin-objects.json")
    if not manifest.is_file():
        return []
    if json.loads(manifest.read_text(encoding="utf-8")).get("version") != 1:
        raise ValueError("Unknown built-in object catalogue")
    return [record for record, _raw in _packages().values()]


def folder(root, id):
    """The immutable built-in package id, prepared atomically from our builders; None for another asset."""
    asset = next((a for a in catalogue(root) if a["id"] == id), None)
    if asset is None:
        return None
    target = Path(root, "cache/builtin-objects", id)
    with _gate:
        if not (target / "asset.json").is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(prefix=".builtin_", dir=target.parent) as temporary:
                ready = Path(temporary, "ready")
                (ready / "original").mkdir(parents=True)
                (ready / "original/model.glb").write_bytes(_packages()[id][1])
                project = Path(__file__).resolve().parents[2]
                (ready / "LICENSE.txt").write_text((project / "LICENSE").read_text(encoding="utf-8") + "\n\n"
                                                  + (project / "LICENSE-BeamNG.Earth").read_text(encoding="utf-8"), encoding="utf-8")
                if "native_tree" in asset:
                    (ready / "native").mkdir()
                    (ready / asset["native_tree"]["file"]).write_bytes(_tree_bin(asset["native_tree"]["model"]))
                (ready / "asset.json").write_text(json.dumps(asset, sort_keys=True), encoding="utf-8")
                ready.rename(target)
    return target
