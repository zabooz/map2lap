"""Retaining-wall and parapet edits, applied from their immutable build geometry to preview and Save."""
import copy
import functools
import hashlib
import json
import math
from pathlib import Path
import shutil

import numpy as np
from PIL import Image

from app import placement, trackpaint, trackview
from track import kn5, obj_to_kn5
from track.textures import dds_mipmaps

KINDS = {"retaining wall", "parapet"}
BUNDLE = Path("data", "map2lap_walls")


def problems(edits):
    """What is malformed in a wall edit list; None for valid descriptors. Pure."""
    if not isinstance(edits, list):
        return "Wall edits must be a list"
    seen = set()
    for edit in edits:
        if not isinstance(edit, dict) or not isinstance(edit.get("id"), str) or edit["id"] in seen:
            return "Each wall needs a unique object id"
        seen.add(edit["id"])
        rise = edit.get("rise")
        if type(rise) not in (int, float) or not math.isfinite(rise) or abs(rise) > placement.MAX_MOVE_M:
            return "The wall top offset must be a finite distance within the movement limit"
        material = edit.get("material")
        if material is not None and (not isinstance(material, str) or len(material) != 64 or any(c not in "0123456789abcdef" for c in material)):
            return "No retained wall texture"
    return None


def _wall(objects, id_):
    """The listed wall's entry, number and original profile; reject anything else. Pure."""
    try:
        tile, number = id_.rsplit("#", 1)
        k = int(number)
        entry = objects[tile]
        if k < 0 or entry["kinds"][k] not in KINDS or not entry["faces"][k]:
            raise ValueError("No wall")
        profile = entry["details"][k]["wall"]
        if not profile.get("tops"):
            raise ValueError("Wall needs a new build")
        return entry, k, profile
    except (KeyError, IndexError, TypeError, ValueError) as error:
        raise ValueError(f"No editable generated wall: {id_}") from error


def linked(objects, ids):
    """Wall pieces sharing a sampled edge across tiles, expanded from ids. Pure.

    Two shared profile rows distinguish a tile overlap from two unrelated walls merely meeting at an end.
    """
    rows, by_row = {}, {}
    for tile, entry in objects.items():
        for k, kind in enumerate(entry["kinds"]):
            if kind not in KINDS or not entry["faces"][k]:
                continue
            id_ = f"{tile}#{k}"
            _entry, _k, p = _wall(objects, id_)
            keys = {(kind, *np.round([*xy, foot, top], 3)) for xy, foot, top in zip(p["base"], p["foot"], p["top"])}
            rows[id_] = keys
            for key in keys:
                by_row.setdefault(key, set()).add(id_)
    out, todo = set(), list(ids)
    while todo:
        id_ = todo.pop()
        _wall(objects, id_)
        if id_ in out:
            continue
        out.add(id_)
        candidates = set().union(*(by_row[key] for key in rows[id_]))
        todo.extend(other for other in candidates - out if len(rows[id_] & rows[other]) >= 2)
    return sorted(out)


def asset(ac, name, id_):
    """Resolve and verify a retained texture independently of its library entry or local caches."""
    trackpaint._key(id_)
    folder = trackpaint._out("paint-assets", id_)
    if not folder.is_dir():
        folder = Path(trackview.kn5_path(ac, name)).parent / BUNDLE / id_
    meta = trackpaint._verified(folder / "asset.json", id_)
    trackpaint._validate_asset(folder, meta)
    colour = folder / "colour.png"
    return {"id": id_, "repeat": meta["repeat"], "colour": _colour(str(colour), trackpaint._file_digest(colour))}


@functools.lru_cache(maxsize=16)
def _colour(path, digest):
    """One opaque retained colour image as AC-ready DDS with mips; digest identifies its verified bytes."""
    with Image.open(path) as image:
        return dds_mipmaps(image.convert("RGB"), smallest=1)


def prepare(ac, name, objects, previous, ids, *, rise=None, material=False, reset=False):
    """A complete edit list after changing selected wall assemblies; a library texture is captured once."""
    if not isinstance(ids, list) or not ids or not all(isinstance(i, str) for i in ids):
        raise ValueError("Select a generated wall")
    selected = linked(objects, ids)
    snapshot = trackpaint._snapshot(material, variation=False) if isinstance(material, str) else material
    by_id = {e["id"]: dict(e) for e in previous}
    for id_ in selected:
        edit = by_id.pop(id_, {"id": id_, "rise": 0, "material": None})
        if reset:
            continue
        if rise is not None:
            edit["rise"] = rise
        if material is not False:
            edit["material"] = snapshot
        if edit["rise"] or edit["material"]:
            by_id[id_] = edit
    result = sorted(by_id.values(), key=lambda e: e["id"])
    if wrong := problems(result):
        raise ValueError(wrong)
    return result


def _check_lowering(positions, profile, rise):
    """Reject a lowered cap touching either fixed foot, from all owned source positions. Pure."""
    tops = {tuple(p) for p in np.asarray(profile["tops"], np.float32)}
    feet = {}
    for p in positions:
        if tuple(p) not in tops:
            key = (p[0], p[2])
            feet[key] = max(feet.get(key, -math.inf), float(p[1]))
    # One centimetre of vertical wall keeps its faces from collapsing or turning inside out at the fixed feet.
    if any(float(y) + rise < feet.get((x, z), -math.inf) + 0.01 for x, y, z in tops):
        raise ValueError("The wall top must stay above both fixed feet")


def _vertices(vertices, faces, profile, rise, repeat=None):
    """Own vertices with an offset cap; both feet stay, UV height follows vertical masonry. Pure."""
    used, inverse = np.unique(faces.ravel(), return_inverse=True)
    v, tri = vertices[used].copy(), inverse.reshape(-1, 3)
    tops = {tuple(p) for p in np.asarray(profile["tops"], np.float32)}
    moving = np.array([tuple(p) in tops for p in v["pos"]])
    metres = np.asarray(profile.get("repeat", [4.0, 4.0] if profile["concrete"] else [3.0, 3.0]))
    # Upright faces map V to world height. The sloping cap maps V across its width and keeps that UV when raised.
    vertical = np.abs(v["normal"][:, 1]) < 1e-6
    v["pos"][moving, 1] += rise
    v["uv"][moving & vertical, 1] -= rise / metres[1]
    if repeat is not None:
        v["uv"] *= metres / np.asarray(repeat)
    if rise:
        p = v["pos"].astype(np.float64)
        n = np.zeros_like(p)
        normal = obj_to_kn5.face_normals(p, tri)
        for j in range(3):
            np.add.at(n, tri[:, j], normal)
        n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
        v["normal"] = n
        v["tangent"] = obj_to_kn5.tangents(p, np.c_[v["uv"][:, 0], -v["uv"][:, 1]], tri, n)
    return v, tri.astype("<u2")


def extend(path, scan, objects, edits, assets=None):
    """Append only edited walls, keeping source meshes batched; list the source ranges they replace. Pure apart from reading path."""
    if wrong := problems(edits):
        raise ValueError(wrong)
    if not edits:
        return {**scan, "wall_hidden": [], "walls": []}, objects
    meshes, materials, textures = list(scan["meshes"]), list(scan["materials"]), list(scan["textures"])
    listed, hidden, images, slots = copy.deepcopy(objects), [], {}, {}
    assets = assets or {}
    with open(path, "rb") as f:
        for edit in edits:
            source_arrays = {}
            entry, k, profile = _wall(objects, edit["id"])
            for i, _first, _count in entry["faces"][k]:
                if i not in source_arrays:
                    source_arrays[i] = kn5.mesh_arrays(f, scan["meshes"][i])
            if edit["rise"] < 0:
                positions = np.concatenate([source_arrays[i][0]["pos"][np.unique(source_arrays[i][1][first:first + count])]
                                            for i, first, count in entry["faces"][k]])
                _check_lowering(positions, profile, edit["rise"])
            new_faces = listed[edit["id"].rsplit("#", 1)[0]]["faces"][k] = []
            material = edit["material"]
            saved_profile = listed[edit["id"].rsplit("#", 1)[0]]["details"][k]["wall"]
            saved_profile["top"] = (np.asarray(profile["top"]) + edit["rise"]).tolist()
            saved_profile["tops"] = (np.asarray(profile["tops"]) + [0, edit["rise"], 0]).astype(np.float32).tolist()
            if material:
                saved_profile["repeat"] = assets[material]["repeat"]
            if material and material not in slots:
                snapshot = assets[material]
                tex = f"map2lap_wall_{material}.dds"
                if tex not in {t[0] for t in textures}:
                    images[tex] = snapshot["colour"]
                    textures.append((tex, 0, len(images[tex])))
                slots[material] = next((i for i, m in enumerate(materials) if m.name == f"map2lap_wall_{material}"), len(materials))
                props = [(key, value, (0, 0), (0, 0, 0), (0, 0, 0, 0)) for key, value in
                         (("ksAmbient", 0.5), ("ksDiffuse", 0.5), ("ksSpecular", 0), ("ksSpecularEXP", 1))]
                if slots[material] == len(materials):
                    materials.append(kn5.Material(f"map2lap_wall_{material}", "ksPerPixel", 0, 0, 0, props, [("txDiffuse", 0, tex)]))
            for i, first, count in entry["faces"][k]:
                info = scan["meshes"][i]
                if i not in source_arrays:
                    source_arrays[i] = kn5.mesh_arrays(f, info)
                vertices, faces = source_arrays[i]
                hidden.append([i, first, count])
                # Three unique corners per face fit AC's uint16 vertex indices even for a fully split hard surface.
                for a in range(first, first + count, 21845):
                    v, tri = _vertices(vertices, faces[a:min(a + 21845, first + count)], profile, edit["rise"],
                                       assets[material]["repeat"] if material else None)
                    centre = (v["pos"].min(0).astype(float) + v["pos"].max(0)) / 2
                    number = len(meshes)
                    meshes.append({**info, "name": f"1WALL_wall_{number}", "copy": True, "wall": True,
                                   "vertices": len(v), "indices": tri.size, "data": (v, tri),
                                   "material": slots[material] if material else info["material"],
                                   "center": centre.tolist(), "radius": float(np.linalg.norm(v["pos"] - centre, axis=1).max())})
                    new_faces.append([number, 0, len(tri)])
    key = hashlib.sha256(json.dumps([scan.get("copy_key"), edits], sort_keys=True).encode()).hexdigest()
    return {**scan, "meshes": meshes, "materials": materials, "textures": textures, "wall_images": images,
            "wall_hidden": hidden, "walls": edits, "copy_key": key}, listed


def export(ac, name, edits, target):
    """Retain every active wall material in the saved track; library removal never breaks later Save or Undo."""
    destination = Path(target) / BUNDLE
    if destination.exists():
        shutil.rmtree(destination)
    for id_ in {e["material"] for e in edits if e["material"]}:
        asset(ac, name, id_)
        source = trackpaint._out("paint-assets", id_)
        if not source.is_dir():
            source = Path(trackview.kn5_path(ac, name)).parent / BUNDLE / id_
        shutil.copytree(source, destination / id_)
