"""Independent copies of source objects, bundled by tile, material and mesh flags.

A draft keeps source ids and affine poses, never geometry. Generated meshes extend the source's scan in memory;
Save appends those same meshes to the kn5. Every copied member has its own listed id, including billboards.
"""
import functools
import hashlib
import json
import os
import re

import numpy as np

from app import placement, trackplace, trackview
from track import kn5, objectlist

COPY_ID = re.compile(r"copy_[a-f0-9]{24,32}")
IDENTITY = np.eye(4)[:3].reshape(-1).tolist()
FLAGS = ("active", "cast_shadows", "visible", "transparent", "material", "layer", "lod_in", "lod_out", "renderable")
MAX_COPIES, MAX_PARTS = 4096, 4096
MAX_VERTICES = 2_000_000    # 88 MB of vertex data: bound the draft cache independently of a long source track's size.


def problems(copies):
    """What is malformed in the copy descriptors, None for a valid list. Pure."""
    if not isinstance(copies, list) or len(copies) > MAX_COPIES:
        return "too many copies"
    seen = set()
    for copy in copies:
        if not isinstance(copy, dict) or not isinstance(copy.get("id"), str) or not COPY_ID.fullmatch(copy["id"]) or copy["id"] in seen:
            return "no unique copy id"
        seen.add(copy["id"])
        parts = copy.get("parts")
        if not isinstance(parts, list) or not 0 < len(parts) <= MAX_PARTS:
            return "no copied objects"
        for k, part in enumerate(parts):
            if not isinstance(part, dict) or not isinstance(part.get("source"), str) or len(part["source"]) > 64:
                return "no source object"
            parent, values = part.get("parent"), part.get("matrix")
            if type(parent) is not int or not (-1 if k == 0 else 0) <= parent < k:
                return "no parent"
            if not isinstance(values, list) or len(values) != 12 or not all(type(v) in (int, float) and np.isfinite(v) and abs(v) < 1e7 for v in values):
                return "no finite pose"
            a = np.array(values).reshape(3, 4)[:, :3]
            scale = np.linalg.norm(a[:, 0])
            if not 0.001 <= scale <= 1000 or not np.allclose(a.T @ a, np.eye(3) * scale ** 2, rtol=1e-5, atol=1e-7) or np.linalg.det(a) <= 0:
                return "no rotation and uniform size"
    return None


def _source(f, scan, objects, id_, arrays=None):
    """A source object's metadata and its (mesh, first face, count) pieces; refuse an unknown or empty object."""
    arrays = arrays or (lambda i: kn5.mesh_arrays(f, scan["meshes"][i]))
    try:
        base, number = id_.rsplit("#", 1)
        k = int(number)
        if k < 0:
            raise ValueError("negative object number")
        if base in objects:
            entry = objects[base]
            kind, at, faces = entry["kinds"][k], entry["at"][k], entry["faces"][k]
            sort = objectlist.sorts_of(entry)[k]
        else:
            pieces = trackplace._billboard_pieces(scan, trackplace._billboard_parts(scan), base, k)
            faces = [(i, a, b - a) for i, a, b in pieces]
            vertices = [arrays(i)[0] for i, _a, _n in faces]
            corners = np.concatenate([v["pos"][np.unique(arrays(i)[1][a:a+n])]
                                      for v, (i, a, n) in zip(vertices, faces)])
            low, high = corners.min(axis=0), corners.max(axis=0)
            at = [(low[0] + high[0]) / 2, low[1], (low[2] + high[2]) / 2]
            kind = trackview._billboard_kind(base)
            uv = vertices[0]["uv"][arrays(faces[0][0])[1][faces[0][1]]].mean(axis=0)
            atlas = trackview._atlas()
            cell = int((uv[1] % 1) * atlas["rows"]) * atlas["cols"] + int((uv[0] % 1) * atlas["cols"])
            sort = atlas["sprites"][cell]
        if not faces or kind in placement.NOT_ALONE:
            raise ValueError("this object cannot be copied on its own")
        details = objects[base].get("details", [{}] * len(objects[base]["kinds"]))[k] if base in objects else {}
        return {"kind": kind, "sort": sort, "at": np.array(at, np.float64), "faces": faces, "details": details}
    except (IndexError, KeyError, TypeError, ValueError) as e:
        raise ValueError(f"No object to copy: {id_}") from e


def _posed(points, matrix):
    """Points transformed by a row-major 3 by 4 affine matrix. Pure."""
    m = np.array(matrix, np.float64).reshape(3, 4)
    return np.asarray(points) @ m[:, :3].T + m[:, 3]


def _compose(matrix, chain):
    """The matrix followed by placement.chain's transforms. Pure."""
    sample = _posed(np.r_[np.zeros((1, 3)), np.eye(3)], matrix)
    moved = placement.through(sample, np.ones_like(sample), np.ones_like(sample), chain)[0]
    return np.c_[(moved[1:] - moved[0]).T, moved[0]].reshape(-1).tolist()


def foot(f, scan, objects, parts):
    """The posed root's horizontal pivot and assembly's lowest corner: the Copy preview's ground anchor."""
    root = _source(f, scan, objects, parts[0]["source"])
    at = _posed(root["at"], parts[0]["matrix"])
    bottom = []
    for part in parts:
        source = _source(f, scan, objects, part["source"])
        for i, first, count in source["faces"]:
            vertices, faces = kn5.mesh_arrays(f, scan["meshes"][i])
            bottom.append(_posed(vertices["pos"][faces[first:first+count]], part["matrix"])[..., 1].min())
    at[1] = min(bottom)
    return at


def template(path, scan, objects, copies, placed, wanted, omitted=()):
    """A copy template of wanted as placed now, with descendants but without a pole's wires. No geometry is persisted."""
    extended, listed = build(path, scan, objects, copies)
    base, number = wanted.rsplit("#", 1)
    number = int(number)
    if wanted in omitted:
        raise ValueError("The source object is deleted")
    members = [number]
    if base in listed:
        for k, parent in enumerate(listed[base]["parents"]):
            if parent in members and f"{base}#{k}" not in omitted:
                members.append(k)
    old = next((c for c in copies if c["id"] == base), None)
    parts = []
    with open(path, "rb") as f:
        for k in members:
            original = old["parts"][k] if old else {"source": f"{base}#{k}", "matrix": IDENTITY}
            _source(f, scan, objects, original["source"])
            chain = placement.chain(listed[base], base, k, {p["id"]: p for p in placed}) if base in listed else []
            if base not in listed:
                source = _source(f, scan, objects, wanted)
                chain = [(source["at"], p) for p in placed if p["id"] == wanted]
            parent = listed[base]["parents"][k] if base in listed else -1
            parts.append({"source": original["source"], "matrix": _compose(original["matrix"], chain),
                          "parent": members.index(parent) if parent in members else -1})
        source = _source(f, scan, objects, parts[0]["source"])
    return {"parts": parts}, _posed(source["at"], parts[0]["matrix"]).tolist(), source["kind"]


def build(path, scan, objects, copies):
    """The source scan and object list extended with copies; source dictionaries are never changed."""
    wrong = problems(copies)
    if wrong:
        raise ValueError(wrong)
    if not copies:
        return scan, objects
    try:
        listed = objectlist.state_of(os.path.join(os.path.dirname(path), objectlist.FILE))
    except OSError:
        listed = None
    return _build(path, objectlist.state_of(path), json.dumps(copies, sort_keys=True, separators=(",", ":")), listed)


@functools.lru_cache(maxsize=1)  # one generated manifest; the validated draft context shares these arrays
def _build(path, revision, encoded, _listed):
    """Cache only generated geometry: source meshes are read individually, never a long kn5 as a whole."""
    scan, objects = trackview._scan(path, revision), trackview.list_of(path)
    return _generate(path, scan, objects, json.loads(encoded))


def _generate(path, scan, objects, copies):
    meshes, listed, buckets = list(scan["meshes"]), dict(objects), {}
    total = 0
    with open(path, "rb") as f:
        for copy in copies:
            entry = {"kinds": [], "sorts": [], "at": [], "parents": [], "faces": [], "details": []}
            listed[copy["id"]] = entry
            for part in copy["parts"]:
                source = _source(f, scan, objects, part["source"])
                at = _posed(source["at"], part["matrix"])
                entry["kinds"].append(source["kind"])
                entry["sorts"].append(source["sort"])
                entry["at"].append(at.tolist())
                entry["parents"].append(part["parent"])
                entry["faces"].append([])
                entry["details"].append(source["details"])
                tile = int(np.floor(at[0] / 256)), int(np.floor(-at[2] / 256))
                for i, first, count in source["faces"]:
                    info = scan["meshes"][i]
                    vertices, faces = kn5.mesh_arrays(f, info)
                    faces = faces[first:first + count]
                    # Triangle batches cannot exceed AC's 65,535 vertex limit even with no shared corners.
                    for begin in range(0, len(faces), 21845):
                        used, inverse = np.unique(faces[begin:begin + 21845].ravel(), return_inverse=True)
                        v = vertices[used].copy()
                        total += len(v)
                        if total > MAX_VERTICES:
                            raise ValueError("Too much copied geometry in this draft; save a smaller set")
                        m = np.array(part["matrix"]).reshape(3, 4)
                        v["pos"] = _posed(v["pos"], part["matrix"])
                        for field in ("normal", "tangent"):
                            a = v[field].astype(np.float64) @ m[:, :3].T
                            v[field] = a / np.maximum(np.linalg.norm(a, axis=1, keepdims=True), 1e-12)
                        prefix, kind = info["name"].split("_")[0], objectlist.kind_of(info["name"])
                        # AC assigns collision by name: visually identical materials may still have different physics.
                        key = (prefix, kind, tile) + tuple(info.get(k, 1 if k in ("active", "visible", "renderable") else 0) for k in FLAGS)
                        bucket = buckets.get(key)
                        if bucket is None or bucket["vertices"] + len(v) > 65535:
                            mesh = {**info, "name": f"{prefix}_{kind}_copy_{tile[0]}_{tile[1]}_{len(meshes)}",
                                    "vertices": 0, "indices": 0, "data": ([], []), "copy": True}
                            mesh["number"] = len(meshes)
                            meshes.append(mesh)
                            bucket = buckets[key] = mesh
                        number = bucket["number"]
                        entry["faces"][-1].append([number, bucket["indices"] // 3, len(inverse) // 3])
                        bucket["data"][0].append(v)
                        bucket["data"][1].append(inverse.reshape(-1, 3) + bucket["vertices"])
                        bucket["vertices"] += len(v)
                        bucket["indices"] += len(inverse)
    for info in meshes[len(scan["meshes"]):]:
        vertices, faces = np.concatenate(info["data"][0]), np.concatenate(info["data"][1]).astype("<u2")
        center = (vertices["pos"].min(axis=0).astype(np.float64) + vertices["pos"].max(axis=0)) / 2
        info.update(data=(vertices, faces), center=center.tolist(), radius=float(np.linalg.norm(vertices["pos"] - center, axis=1).max()))
    key = hashlib.sha256(json.dumps(copies, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    return {**scan, "meshes": meshes, "copy_key": key}, listed
