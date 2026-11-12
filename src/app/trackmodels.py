"""Semantic model instances and portable immutable GLB snapshots; poses belong to the ordinary placement list."""
import hashlib
import functools
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import tempfile
import threading

import numpy as np

from app import modeldata, modelmesh, mytracks, objectlibrary, placement, trackcopies, trackheights, trackview
from track import kn5, obj_to_kn5, objectlist

SCHEMA = 1
BUNDLE = Path("data/map2lap_models")
INSTANCE = re.compile(r"instance_[0-9a-f]{24}\Z")
KEY = re.compile(r"[0-9a-f]{64}\Z")
_gate = threading.RLock()


def _json(record):
    return json.dumps(record, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


def _digest(record):
    return hashlib.sha256(_json(record)).hexdigest()


def problems(instances):
    """Validate generic asset bindings, initial ground anchors and explicit per-instance collision. Pure."""
    if not isinstance(instances, list):
        return "Model instances must be a list"
    seen = set()
    for instance in instances:
        if (not isinstance(instance, dict) or not isinstance(instance.get("id"), str)
                or not INSTANCE.fullmatch(instance["id"]) or instance["id"] in seen):
            return "No unique model instance id"
        seen.add(instance["id"])
        if not isinstance(instance.get("asset"), str) or not KEY.fullmatch(instance["asset"]):
            return "No retained model asset"
        point = instance.get("at")
        if not isinstance(point, list) or len(point) != 3 or any(type(v) not in (int, float) or not np.isfinite(v) for v in point):
            return "No finite model position"
        if instance.get("collision") not in ("none", "mesh"):
            return "Choose no collision or model mesh collision"
        scale = instance.get("scale", 1)
        if type(scale) not in (int, float) or not np.isfinite(scale) or scale <= 0:
            return "No finite positive model size"
        if instance.get("replaces") is not None and (not isinstance(instance["replaces"], str) or len(instance["replaces"]) > 64):
            return "No source object to replace"
    return None


def _folder(id):
    if not isinstance(id, str) or not KEY.fullmatch(id):
        raise ValueError("No retained model asset")
    return Path(mytracks.ROOT, "out/model-assets", id)


def _verified(folder, id):
    with (folder / "asset.json").open(encoding="utf8") as file:
        record = json.load(file)
    if (record.get("schema") != SCHEMA or record.get("kind") != "model" or record.get("id") != id
            or _digest({k: v for k, v in record.items() if k != "id"}) != id
            or record.get("model", {}).get("file") != "original/model.glb"):
        raise ValueError("The retained model description has changed")
    with (folder / "original/model.glb").open("rb") as file:
        if hashlib.file_digest(file, "sha256").hexdigest() != record["model"]["sha256"]:
            raise ValueError("The retained original model has changed")
    native = record.get("native_tree")
    if native:
        if native.get("file") != "native/model.bin" or hashlib.sha256((folder / "native/model.bin").read_bytes()).hexdigest() != native.get("sha256"):
            raise ValueError("The retained TreeFX model has changed")
    return record


def resolve(ac, name, id):
    """A verified snapshot can be resolved without the mutable library, source cache or prepared geometry."""
    folder = _folder(id)
    candidates = [folder, Path(trackview.kn5_path(ac, name)).parent / BUNDLE / "assets" / id]
    for candidate in candidates:
        if (candidate / "asset.json").is_file():
            return candidate, _verified(candidate, id)
    raise ValueError("The retained model is missing; restore the track's model package")


def original(ac, name, id):
    folder, _record = resolve(ac, name, id)
    return (folder / "original/model.glb").read_bytes()


def _copy_original(folder, target):
    (target / "original").mkdir(parents=True)
    shutil.copyfile(folder / "asset.json", target / "asset.json")
    shutil.copyfile(folder / "original/model.glb", target / "original/model.glb")
    if (folder / "native/model.bin").is_file():
        (target / "native").mkdir()
        shutil.copyfile(folder / "native/model.bin", target / "native/model.bin")
    if (folder / "LICENSE.txt").is_file():
        shutil.copyfile(folder / "LICENSE.txt", target / "LICENSE.txt")


def retain(ac, name, models):
    """Keep verified portable originals in the immutable local snapshot store before Undo can outlive the track's current bundle."""
    for asset in dict.fromkeys(m["asset"] for m in models):
        folder, _meta = resolve(ac, name, asset)
        target = _folder(asset)
        if target == folder:
            continue
        with _gate:
            if target.exists():
                _verified(target, asset)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(prefix=".retain_", dir=target.parent) as temporary:
                ready = Path(temporary, "ready")
                _copy_original(folder, ready)
                ready.rename(target)


def save_size(ac, name, models, scan):
    """Actual original/metadata/image byte payload plus bounded provenance JSON allowance for the save preflight."""
    size = 0
    for asset in dict.fromkeys(m["asset"] for m in models):
        folder, _meta = resolve(ac, name, asset)
        size += (folder / "asset.json").stat().st_size + (folder / "original/model.glb").stat().st_size
        size += sum(p.stat().st_size for p in (folder / "native/model.bin", folder / "LICENSE.txt") if p.is_file())
        if (folder / "native/model.bin").is_file():
            size += (folder / "native/model.bin").stat().st_size       # the game's model, as well as its portable snapshot
    existing = {t[0] for t in scan["textures"] if t[1] != 0}
    size += sum(len(raw) for texture, raw in scan.get("model_images", {}).items() if texture not in existing)
    return size + len(_json(models)) * 2 + 4096


def export(ac, name, models, target, new_kn5, edits, inherited=None):
    """Copy each verified immutable original once into the track being atomically saved."""
    root = Path(target) / BUNDLE
    shutil.rmtree(root, ignore_errors=True)
    for asset in dict.fromkeys(instance["asset"] for instance in models):
        folder, _meta = resolve(ac, name, asset)
        _copy_original(folder, root / "assets" / asset)
    if models or inherited:
        root.mkdir(parents=True, exist_ok=True)
        record = {"schema": SCHEMA, "kn5": _file_hash(new_kn5), "models": models,
                  "model_deleted": [d for d in edits["deleted"] if d["id"].split("#")[0] in {m["id"] for m in models}],
                  "placed": [p for p in edits["placed"] if p["id"].split("#")[0] in {m["id"] for m in models}],
                  "model_heights": {m["id"]: [*(inherited or {}).get("model_heights", {}).get(m["id"], []), *edits["heights"]] for m in models},
                  "meshes": [m["name"] for m in kn5.scan(new_kn5)["meshes"] if m["name"].startswith(("nocol_m2l_model_", "1WALL_m2l_model_"))]}
        (root / "compiled.json").write_bytes(_json({**record, "digest": _digest(record)}))


@functools.lru_cache(maxsize=16)
def _hash_at(path, stamp):
    with open(path, "rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def _file_hash(path):
    stat = Path(path).stat()
    return _hash_at(str(path), (stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size))


def _checked_compiled(record):
    if record.get("schema") != SCHEMA or record.get("digest") != _digest({k: v for k, v in record.items() if k != "digest"}):
        raise ValueError("The saved model provenance has changed")
    if problems(record.get("models")):
        raise ValueError("The saved model bindings are invalid")
    return record


@functools.lru_cache(maxsize=8)
def _compiled_at(path, stamp):
    return _checked_compiled(json.loads(Path(path).read_bytes()))


def compiled(ac, name, path=None):
    """Resolve hash-bound compiled provenance only for the exact saved KN5, including its later source-cache copy."""
    own = Path(trackview.kn5_path(ac, name))
    manifest = own.parent / BUNDLE / "compiled.json"
    candidates = []
    if manifest.is_file():
        stat = manifest.stat()
        candidates.append(_compiled_at(str(manifest), (stat.st_ino, stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size)))
    if path is not None:
        info = own.parent / mytracks.FILE
        saved = trackview._info(str(info), trackview._revision(info.stat())).get("edits") or {}
        if saved.get("kn5") == objectlist.state_of(own) and saved.get("model_source"):
            candidates.append(_checked_compiled(saved["model_source"]))
    if not candidates:
        return None
    digest = _file_hash(path or own)
    return next((record for record in candidates if record["kn5"] == digest), None)


def grounded(scan, objects, placed, under):
    """Apply inherited baked terrain to regenerated models only, after their current pose; source terrain is already baked."""
    histories = scan.get("model_heights", {})
    if not histories:
        return under
    posed = placement.list_placed(objects, placed)
    vertices, grow = dict(under.vertices), dict(under.grow)
    for instance, heights in histories.items():
        if not heights or instance not in posed:
            continue
        at = posed[instance]["at"][0]
        dy = float(trackheights.Field(heights).at(at[0], at[2])[0])
        if not dy:
            continue
        for i, first, count in posed[instance]["faces"][0]:
            data = vertices.get(i, scan["meshes"][i]["data"][0]).copy()
            own = np.unique(scan["meshes"][i]["data"][1].reshape(-1, 3)[first:first + count])     # (a saved bundle holds others too)
            data["pos"][own, 1] = data["pos"][own, 1].astype(np.float64) + dy
            vertices[i], grow[i] = data, max(grow.get(i, 0), abs(dy))
    return kn5.Moved(vertices, grow, under.points)


def cold_recipe(ac, name):
    """Rebase editable model bindings onto a compiled track; its source edits have already been applied once."""
    record = compiled(ac, name)
    from app import tracknative
    regional = tracknative.inherited(ac, name, trackview.kn5_path(ac, name))
    if not record:
        if not regional.get('paints'):
            return None
        record = {'placed': [], 'models': []}
    paints = regional["paints"]
    return {"source": None, "cold_models": True, "base": objectlist.state_of(trackview.kn5_path(ac, name)),
            "kn5": objectlist.state_of(trackview.kn5_path(ac, name)), "saved": 0, "deleted": record.get("model_deleted", []), "sorts": [],
            "object_sorts": [], "heights": [], "placed": record["placed"], "copies": [], "paints": paints, "models": record["models"]}


def editor_source(scan, objects, placed):
    """Source-only inputs for draft height/pose work. Models follow rigid matrices; Save still uses every native face. Pure."""
    ids = {instance["id"] for instance in scan.get("models", [])}
    if not ids:
        return scan, objects, placed
    return ({**scan, "models": [], "model_heights": {}}, {key: value for key, value in objects.items() if key not in ids},
            [pose for pose in placed if pose["id"].split("#")[0] not in ids])


def meshes_at_height(scan, placed, heights):
    """Generated model mesh numbers moved rigidly by heights at their posed anchor, with no vertex reads. Pure."""
    if not scan.get("models"):
        return set()
    poses, field = {p["id"]: p for p in placed}, trackheights.Field(heights)
    changed = set()
    for instance in scan["models"]:
        pose = poses.get(instance["id"] + "#0", {})
        at = instance["at"]
        if field.at(at[0] + pose.get("x", 0), at[2] + pose.get("z", 0))[0]:
            changed.add(instance["id"])
    return {i for i, mesh in enumerate(scan["meshes"]) if mesh.get("model", {}).get("instance") in changed}


def view_matrices(scan, placed, heights):
    """World transforms for shared original GLB render buffers, with the same anchor, pose and rigid ground following as Save. Pure."""
    poses, field, result = {p["id"]: p for p in placed}, trackheights.Field(heights), {}
    for instance in scan.get("models", []):
        meta = scan["model_assets"][instance["asset"]]
        pose = poses.get(instance["id"] + "#0", {"x": 0, "y": 0, "z": 0, "turn": 0, "scale": 1})
        angle = np.deg2rad(pose["turn"]); c, s = np.cos(angle), np.sin(angle)
        matrix = np.eye(4); matrix[:3, :3] = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]]) * (pose["scale"] * instance.get("scale", 1) * meta["metres_per_unit"])
        at = np.asarray(instance["at"], np.float64) + [pose["x"], pose["y"], pose["z"]]
        old = trackheights.Field(scan.get("model_heights", {}).get(instance["id"], []))
        at[1] += float(field.at(at[0], at[2])[0] + old.at(at[0], at[2])[0])
        matrix[:3, 3] = at - matrix[:3, :3] @ meta["anchor"]
        result[instance["id"]] = matrix.T.ravel().tolist()
    return result


def _model(ac, name, asset):
    folder, _meta = resolve(ac, name, asset)
    return modeldata.load((folder / "original/model.glb").read_bytes())


def image(ac, name, recipe, side=None):
    """One texture of extend's "model_textures", from its retained original, at most side pixels when given."""
    return modelmesh.image(_model(ac, name, recipe["asset"]), recipe, side)


def images(ac, name, scan, kept=None):
    """The new native textures of an extended scan as {name: DDS bytes}, each asset's original read once: only Save pays for them.
    kept: a kn5, the track's last Save, whose textures of the same name and size are taken as they are, not encoded again: a
    name covers every input of its pixels (modelmesh._recipe). 15 textures of a painted Heiligenblut copy: 2.7 s a Save."""
    load = functools.lru_cache(maxsize=1)(lambda asset: _model(ac, name, asset))
    saved = _saved_images(kept, {texture: recipe["bytes"] for texture, recipe in scan.get("model_textures", {}).items()})
    return {texture: saved.get(texture) or modelmesh.dds(load(recipe["asset"]), recipe)
            for texture, recipe in scan.get("model_textures", {}).items()}


def _saved_images(path, sizes):
    """{name: DDS bytes} of the textures in the kn5 at path (None or missing: none) whose name is in sizes with that byte size."""
    if not sizes or not path or not os.path.exists(path):
        return {}
    found = [(texture, at, size) for texture, at, size in kn5.scan(path)["textures"] if sizes.get(texture) == size]
    with open(path, "rb") as f:
        return {texture: (f.seek(at), f.read(size))[1] for texture, at, size in found}


TILE = 256                  # m, as object copies are bundled (trackcopies): AC still culls each bundle on its own
FLAGS = ("material", "active", "visible", "renderable", "cast_shadows", "transparent", "layer", "lod_in", "lod_out")


def bundle(scan, objects, placed):
    """Save's model meshes merged per tile of their instance's final place, prefix and mesh flags, each bundle within AC's 65,535
    vertices, as object copies are; every instance keeps its own face range in the object list. A blended (transparent) part stays
    alone: AC sorts each mesh as a whole. Fewer meshes, the same triangles. Pure."""
    first = next((i for i, m in enumerate(scan["meshes"]) if m.get("model")), None)
    if first is None:
        return scan, objects
    poses = {p["id"]: p for p in placed}
    meshes, buckets, where = list(scan["meshes"][:first]), {}, {}
    for i, mesh in enumerate(scan["meshes"][first:], first):
        model = mesh["model"]
        pose = poses.get(model["instance"] + "#0", {"x": 0, "z": 0})
        tile = int(np.floor((model["at"][0] + pose["x"]) / TILE)), int(np.floor(-(model["at"][2] + pose["z"]) / TILE))
        prefix = mesh["name"].split("m2l_model_")[0]
        key = (prefix, tile, *(mesh.get(k) for k in FLAGS), i if mesh.get("transparent") else None)
        target = buckets.get(key)
        if target is None or target["vertices"] + mesh["vertices"] > 65535:
            target = buckets[key] = {**{k: v for k, v in mesh.items() if k != "model"}, "vertices": 0, "indices": 0, "data": ([], []),
                                     "name": f"{prefix}m2l_model_{tile[0]}_{tile[1]}_{len(meshes) - first}", "number": len(meshes)}
            meshes.append(target)
        vertices, triangles = mesh["data"]
        where[i] = target["number"], target["indices"] // 3
        target["data"][0].append(vertices); target["data"][1].append(triangles.astype(np.int64) + target["vertices"])
        target["vertices"] += len(vertices); target["indices"] += triangles.size
    return _bundled(meshes, first, scan, objects, where)


def _bundled(meshes, first, scan, objects, where):
    """The bundles' arrays and bounds, and the object list's faces moved into them. Pure."""
    for mesh in meshes[first:]:
        vertices, triangles = np.concatenate(mesh["data"][0]), np.concatenate(mesh["data"][1]).astype("<u2")
        center = (vertices["pos"].min(axis=0).astype(np.float64) + vertices["pos"].max(axis=0)) / 2
        mesh.update(data=(vertices, triangles), center=center.tolist(), radius=float(np.linalg.norm(vertices["pos"] - center, axis=1).max()))
        del mesh["number"]
    listed = {}
    for key, entry in objects.items():
        if any(i in where for pieces in entry["faces"] for i, _f, _c in pieces):
            entry = {**entry, "faces": [[[where[i][0], where[i][1] + f, count] if i in where else [i, f, count] for i, f, count in pieces]
                                       for pieces in entry["faces"]]}
        listed[key] = entry
    return {**scan, "meshes": meshes}, listed


PLANTS = {"tree", "bush", "grass", "flower", "plant"}


def light(category):
    """A model's ambient and sun share in AC: the track's own trees' for plants, its other objects' for the rest. Both were set
    in AC by eye (obj_to_kn5); 0.5 and 0.5 burnt bright flat colours, a Kenney tree's green, nearly white in the sun. Pure."""
    values = obj_to_kn5.VALUES["trees"] if category in PLANTS else obj_to_kn5.DEFAULT
    return {key: values[key] for key in ("ksAmbient", "ksDiffuse")}


# Only the current track's instance metadata is retained. Array storage is per asset, independent of plant count.
_instances = {}


def _asset_stamp(folder):
    """Read both retained files in folder: identity, revision and size, including atomic replacement."""
    return tuple((s.st_ino, s.st_mtime_ns, s.st_ctime_ns, s.st_size)
                 for s in ((folder / name).stat() for name in ("asset.json", "original/model.glb")))


@functools.lru_cache(maxsize=16)  # A few brush mixtures can be reused; visiting more assets evicts old decoded geometry.
def _prepared(folder, asset, stamp):
    """Decode one verified immutable asset revision and prepare shared native parts/material recipes."""
    folder = Path(folder)
    meta = _verified(folder, asset)
    model = modeldata.load((folder / "original/model.glb").read_bytes())
    parts = modelmesh.geometry(model, meta)
    native, recipes = ([], {}) if meta.get("native_tree") else modelmesh.materials(model, asset, light(meta["category"]))
    return {"stamp": (str(folder), stamp), "parts": parts, "materials": native, "recipes": recipes,
            "definitions": model.materials, "pieces": {}, "native_tree": meta.get("native_tree")}


def _asset_pieces(ready, collision):
    """Shared local pieces for one asset and collision choice, in the original mesh/triangle order."""
    if collision in ready["pieces"]:
        return ready["pieces"][collision]
    result = []
    for part in ready["parts"]:
        vertices, faces = part["vertices"], part["faces"]
        number = part["material"] if part["material"] is not None else len(ready["definitions"])
        definition = ready["definitions"][number] if part["material"] is not None else {}
        collides = collision == "mesh" and definition.get("extras", {}).get("map2lapCollision", True) is not False
        blended, double = definition.get("alphaMode") == "BLEND", definition.get("doubleSided", False)
        def add(prefix, data, triangles, visible):
            data.flags.writeable = triangles.flags.writeable = False
            result.append({"prefix": prefix, "vertices": data, "faces": triangles, "visible": visible,
                           "material": number, "primitive": part["primitive"], "source_material": part["material"],
                           "transparent": int(blended)})
        if "visual_pieces" not in part:
            part["visual_pieces"] = list(modelmesh.pieces(vertices, faces, blended))
        for data, triangles in part["visual_pieces"]:
            add("nocol_", data, triangles, 1)
            if collides and not double:
                add("1WALL_", data, triangles, 0)
        # CSP draws a double-sided visual face once; physical collision also needs its reversed back face.
        if collides and double:
            back = vertices.copy(); back["normal"] *= -1
            for data, triangles in modelmesh.pieces(np.concatenate([vertices, back]), np.concatenate([faces, faces[:, ::-1] + len(vertices)])):
                add("1WALL_", data, triangles, 0)
    ready["pieces"][collision] = result
    return result


class _InstanceData:
    """Tuple-compatible mesh data: shared local arrays and a frozen transform, no retained world-space vertex copy."""
    def __init__(self, vertices, faces, instance):
        self.vertices, self.faces = vertices, faces
        self.scale, self.at = instance.get("scale", 1), tuple(instance["at"])

    def __getitem__(self, index):
        if index == 1:
            return self.faces
        if index != 0:
            raise IndexError(index)
        vertices = self.vertices.copy()
        # Keep the original two float32 assignments: folding the translation into a matrix changes saved bytes.
        vertices["pos"] *= self.scale
        vertices["pos"] += self.at
        return vertices


def _instance_meshes(instance, ready):
    """Only a new binding computes bounds; native vertices remain shared until Save or compatibility mesh output needs them."""
    result = []
    if ready.get("native_tree"):
        return result             # TreeFX draws the shared .bin; this binding keeps ordinary Undo, groups and portable ownership.
    for part in _asset_pieces(ready, instance["collision"]):
        data = _InstanceData(part["vertices"], part["faces"], instance)
        # Exact old bounds include float32 rounding at the world position. Analytical transformed spheres differ in the index.
        pos = part["vertices"]["pos"].copy()
        pos *= data.scale
        pos += data.at
        center = (pos.min(axis=0).astype(np.float64) + pos.max(axis=0)) / 2
        visible = part["visible"]
        result.append({"name": f"{part['prefix']}m2l_model_{instance['id']}_{len(result)}",
            "material": part["material"], "vertices": len(pos), "indices": part["faces"].size, "data": data,
            "model": {"instance": instance["id"], "asset": instance["asset"], "primitive": part["primitive"],
                      "material": part["source_material"], "at": list(data.at), "scale": data.scale},
            "active": 1, "visible": visible, "renderable": visible, "cast_shadows": visible,
            "transparent": part["transparent"], "layer": 0, "lod_in": 0., "lod_out": 1000.,
            "center": center.tolist(), "radius": float(np.linalg.norm(pos - center, axis=1).max())})
    return result


def extend(ac, name, scan, objects, models):
    """Extend the source layout using immutable asset pieces and only the changed bindings' metadata."""
    with _gate:
        scope = (str(mytracks.ROOT), str(ac), name, scan.get("model_source_path"))
        if _instances.get("scope") != scope:
            _instances.clear()
            _instances["scope"] = scope
        return _extend(ac, name, scan, objects, models)


def _extend(ac, name, scan, objects, models):
    """Register model roots in the ordinary object list and derive each unique asset's real local geometry once."""
    inherited = compiled(ac, name, scan.get("model_source_path"))
    owned = set(inherited["meshes"]) if inherited else set()
    meshes = [{**m, "active": 0, "visible": 0, "renderable": 0} if m["name"] in owned else m for m in scan["meshes"]]
    if not models:
        _instances["entries"], _instances["assets"] = {}, {}
        return {**scan, "meshes": meshes, "models": [], "model_assets": {}, "model_parts": {}, "model_replacements": []}, objects
    assets, parts, listed = {}, {}, dict(objects)
    materials, resources, prepared, slots = list(scan["materials"]), {}, {}, {}
    previous, current = _instances.get("entries", {}), {}
    present = {t[0] for t in scan["textures"]}
    for instance in models:
        asset = instance["asset"]
        if asset not in assets:
            folder, meta = resolve(ac, name, asset)
            stamp = _asset_stamp(folder)
            ready = _instances.get("assets", {}).get(asset)
            if ready is None or ready["stamp"] != (str(folder), stamp):
                ready = _prepared(str(folder), asset, stamp)
            prepared[asset] = ready
            parts[asset] = ready["parts"]
            assets[asset] = {**meta, "url": f"/api/editor/{name}/model-asset/{asset}"}
            native, recipes = ready["materials"], ready["recipes"]
            slots[asset] = []
            for material in native:
                slot = next((i for i, previous in enumerate(materials) if previous.name == material.name
                             and any(p[0] == "m2lModelMaterial" and p[1] == 1 for p in previous.props)), None)
                # (a saved kn5's own slot keeps its number and takes the material as made now: an image made by an older
                # encoder is replaced, and Save drops it once no material uses it)
                if slot is None:
                    slot = len(materials); materials.append(material)
                else:
                    materials[slot] = material
                texture = next(n for map_slot, _number, n in material.maps if map_slot == "txDiffuse")
                if texture not in present:
                    resources[texture] = {**recipes[texture], "asset": asset}
                slots[asset].append(slot)
        meta = assets[asset]
        if meta.get("native_tree") and instance["collision"] != "none":
            raise ValueError("TreeFX trees have no mesh collision")
        kind = {"tree": "tree", "bush": "bush", "building": "house"}.get(meta["category"], "model")
        listed[instance["id"]] = {"kinds": [kind], "sorts": [meta["name"]], "at": [instance["at"]],
                                   "parents": [-1], "faces": [[]], "details": [{"model": asset, **({"treefx": True} if meta.get("native_tree") else {})}]}
        ready = prepared[asset]
        key = (asset, ready["stamp"], _json(instance))
        local = previous.get(key)
        if local is None:
            local = _instance_meshes(instance, ready)
        current[key] = local
        for source in local:
            mesh = {**source, "material": slots[asset][source["material"]]}
            listed[instance["id"]]["faces"][0].append([len(meshes), 0, mesh["indices"] // 3])
            meshes.append(mesh)
    _instances["entries"], _instances["assets"] = current, prepared
    names = {t[0] for t in scan["textures"]}
    textures = [*scan["textures"], *[(n, 0, recipe["bytes"]) for n, recipe in resources.items() if n not in names]]
    consumed = {m["id"]: m.get("replaces") for m in inherited["models"]} if inherited else {}
    replacements = [m["replaces"] for m in models if m.get("replaces") and consumed.get(m["id"]) != m["replaces"]]
    return {**scan, "meshes": meshes, "materials": materials, "textures": textures, "model_textures": resources,
            "models": models, "model_assets": assets, "model_parts": parts,
            "model_replacements": replacements,
            "model_heights": inherited.get("model_heights", {}) if inherited else {}}, listed


def snapshot(asset):
    """Freeze all semantic import settings and the original GLB before an instance can enter the draft."""
    meta, raw = objectlibrary.get(asset), objectlibrary.original(asset)
    identity = {"schema": meta["schema"], "model": meta["model"]["sha256"],
                **{k: meta[k] for k in ("category", "metres_per_unit", "anchor", "collision")}}
    if _digest(identity) != asset:
        raise ValueError("The library model settings have changed; import them again")
    record = {**{k: v for k, v in meta.items() if k not in {"schema", "id"}}, "schema": SCHEMA, "library": asset}
    id = _digest(record)
    destination = _folder(id)
    with _gate:
        if destination.is_dir():
            _verified(destination, id)
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(prefix=".model_", dir=destination.parent) as temporary:
                ready = Path(temporary, "ready"); (ready / "original").mkdir(parents=True)
                (ready / "original/model.glb").write_bytes(raw)
                (ready / "asset.json").write_bytes(_json({**record, "id": id}))
                source = objectlibrary._folder(asset)
                if meta.get("native_tree"):
                    (ready / "native").mkdir()
                    shutil.copyfile(source / "native/model.bin", ready / "native/model.bin")
                if (source / "LICENSE.txt").is_file():
                    shutil.copyfile(source / "LICENSE.txt", ready / "LICENSE.txt")
                ready.rename(destination)
    return id, record


def _model_height(meta):
    """The model's actual height in metres after its imported node transforms and units. Pure."""
    height = (meta["geometry"]["bounds"][1][1] - meta["geometry"]["bounds"][0][1]) * meta["metres_per_unit"]
    if not np.isfinite(height) or height <= 0:
        raise ValueError("The replacement model needs a positive height")
    return height


def _source_pose(source, target, objects, by_id):
    """Collapse the source tree's placement chain, retaining its translation, turn and relative size. Pure."""
    point = source["at"].tolist()
    base, number = target.rsplit("#", 1)
    chain = (placement.chain(objects[base], base, int(number), by_id) if base in objects
             else [(point, by_id[target])] if target in by_id else [])
    if not chain:
        return None
    moved = placement.through([point], [[0, 1, 0]], [[1, 0, 0]], chain)[0][0]
    return {"x": float(moved[0] - point[0]), "y": float(moved[1] - point[1]), "z": float(moved[2] - point[2]),
            "turn": (sum(p["turn"] for _at, p in chain) + 180) % 360 - 180,
            "scale": float(np.prod([p["scale"] for _at, p in chain]))}


def _replacements(ac, name, now, body, asset, meta, targets):
    """Prepare all selected trees together, sharing asset verification and a bounded source-mesh cache."""
    from app import trackedits
    path, scan, objects = trackedits.context(ac, name, now["base"])
    existing = {m["id"] + "#0": m for m in now.get("models", [])}
    by_id = {p["id"]: p for p in now["placed"]}
    from app import modeltrees, tracktrees
    native_sources = tracktrees.trees_of(trackview.treefx_of(path), now.get("trees", []))
    omitted = {d["id"] for d in now["deleted"]} | {m["replaces"] for m in existing.values() if m.get("replaces")}
    models, posed, heights = [], [], {}
    keep_height = body.get("keep_height", False)
    height = _model_height(meta) if keep_height else None
    with open(path, "rb") as file:
        # Nearby trees share mesh buffers; four cached meshes keep large forest replacements bounded.
        @functools.lru_cache(maxsize=4)
        def arrays(i):
            return kn5.mesh_arrays(file, scan["meshes"][i])

        for target in targets:
            if target in omitted:
                raise ValueError("The selected tree is deleted or already replaced")
            old = existing.get(target)
            if old is not None:
                if old["asset"] not in heights:
                    _folder, old_meta = resolve(ac, name, old["asset"])
                    if old_meta["category"] not in ("tree", "bush"):
                        raise ValueError("Select a tree or bush to replace")
                    heights[old["asset"]] = _model_height(old_meta)
                collision = meta["collision"] if meta.get("native_tree") else old["collision"]
                instance = {**old, "asset": asset, "collision": body.get("collision", collision)}
                if keep_height:
                    instance["scale"] = heights[old["asset"]] * old.get("scale", 1) / height
            elif target in native_sources:
                source = native_sources[target]
                if source["model"] in now["object_sorts"]:
                    raise ValueError("The selected tree is deleted")
                instance = {"id": "instance_" + secrets.token_hex(12), "asset": asset, "at": list(source["pos"]),
                            "replaces": target, "collision": body.get("collision", meta["collision"])}
                posed.append(modeltrees.replacement(ac, name, source, instance, meta, by_id.get(target), keep_height))
            else:
                source = trackcopies._source(file, scan, objects, target, arrays)
                if source["kind"] not in ("tree", "bush"):
                    raise ValueError("Select a tree or bush to replace")
                if source["sort"] in [*now["sorts"], *now["object_sorts"]]:
                    raise ValueError("The selected tree is deleted")
                instance = {"id": "instance_" + secrets.token_hex(12), "asset": asset, "at": source["at"].tolist(),
                            "replaces": target, "collision": body.get("collision", meta["collision"])}
                if keep_height:
                    corners = [arrays(i)[0]["pos"][arrays(i)[1][first:first+count]].reshape(-1, 3)
                               for i, first, count in source["faces"] if scan["meshes"][i].get("renderable", 1)]
                    if not corners:
                        raise ValueError("The selected tree has no visible height")
                    # Fit the source's physical height before its pose; the same pose then keeps every tree's final height.
                    instance["scale"] = float(np.ptp(np.concatenate(corners)[:, 1])) / height
                pose = _source_pose(source, target, objects, by_id)
                if pose:
                    posed.append({"id": instance["id"] + "#0", **pose})
            models.append(instance)
    wrong = problems(models) or placement.problems(posed)
    if wrong:
        raise ValueError(wrong)
    return models, posed


def create(ac, name, now, body):
    """Prepare placement or an atomic group replacement; the page commits bindings and poses in one Undo step."""
    if "instances" in body:
        return _mixture(now, body["instances"])
    asset, meta = snapshot(body.get("model"))
    if meta.get("native_tree") and body.get("collision", "none") != "none":
        raise ValueError("TreeFX trees have no mesh collision")
    target = body.get("replace")
    if type(body.get("keep_height", False)) is not bool:
        raise ValueError("Choose whether to retain tree heights")
    if target is not None:
        targets = target if isinstance(target, list) else [target]
        if not targets or any(not isinstance(t, str) or len(t) > 64 for t in targets) or len(set(targets)) != len(targets):
            raise ValueError("Select distinct trees or bushes to replace")
        models, posed = _replacements(ac, name, now, body, asset, meta, targets)
        return {"models": models, "placed": posed} if isinstance(target, list) else {"model": models[0], "placed": posed}
    point = body.get("at")
    instance = {"id": "instance_" + secrets.token_hex(12), "asset": asset, "at": point,
                "replaces": None, "collision": body.get("collision", meta["collision"])}
    wrong = problems([instance])
    if wrong:
        raise ValueError(wrong)
    instance["at"] = list(point)
    instance["at"][1] -= float(trackheights.Field(now["heights"]).at(point[0], point[2])[0])
    return {"model": instance, "placed": []}


def _mixture(now, entries):
    """Prepare one bounded browser-generated stroke; verify every pose before freezing any asset."""
    if not isinstance(entries, list) or not 1 <= len(entries) <= 2000:
        raise ValueError("Place between 1 and 2000 objects per stroke")
    for e in entries:
        if (not isinstance(e, dict) or not isinstance(e.get("model"), str) or not KEY.fullmatch(e["model"])
                or not isinstance(e.get("at"), list) or len(e["at"]) != 3
                or any(type(v) not in (int, float) or not np.isfinite(v) for v in e["at"])
                or type(e.get("turn")) not in (int, float) or not np.isfinite(e["turn"]) or not -180 <= e["turn"] <= 180
                or type(e.get("scale")) not in (int, float) or not np.isfinite(e["scale"]) or not placement.MIN_SCALE <= e["scale"] <= placement.MAX_SCALE):
            raise ValueError("Choose finite positions, turns and sizes (10–1000%) for every object")
    snapshots = {id: snapshot(id) for id in dict.fromkeys(e["model"] for e in entries)}
    models, posed = [], []
    field = trackheights.Field(now["heights"])
    for e in entries:
        asset, meta = snapshots[e["model"]]
        at = list(e["at"])
        at[1] -= float(field.at(at[0], at[2])[0])
        id = "instance_" + secrets.token_hex(12)
        models.append({"id": id, "asset": asset, "at": at, "replaces": None, "collision": meta["collision"]})
        posed.append({"id": id + "#0", "x": 0, "y": 0, "z": 0, "turn": e["turn"], "scale": e["scale"]})
    return {"models": models, "placed": posed}


def copy_template(ac, name, now, instance):
    """Freeze a model's current turn/size for ordinary Copy; the target click supplies its new ground foot."""
    folder, meta = resolve(ac, name, instance["asset"])
    if any(d["id"] == instance["id"] + "#0" for d in now["deleted"]) or meta["name"] in now["object_sorts"]:
        raise ValueError("The source object is deleted")
    pose = next((p for p in now["placed"] if p["id"] == instance["id"] + "#0"),
                {"x": 0, "y": 0, "z": 0, "turn": 0, "scale": 1})
    from app import trackedits
    _path, scan, _objects = trackedits.context(ac, name, now["base"])
    matrix = np.asarray(view_matrices(scan, now["placed"], now["heights"])[instance["id"]]).reshape(4, 4).T
    foot = matrix @ [*meta["anchor"], 1]
    return {"template": {"model": {"asset": instance["asset"], "collision": instance["collision"],
                                   "turn": pose["turn"], "scale": pose["scale"], "model_scale": instance.get("scale", 1)}},
            "at": foot[:3].tolist(), "kind": meta["category"]}


def copied(ac, name, now, body):
    """A copied model is a new semantic instance of the same frozen asset, with an ordinary independent pose."""
    source, at = body["template"]["model"], body.get("at")
    pose = body.get("pose", {"turn": 0, "y": 0, "scale": 1})
    if (not isinstance(source, dict) or not isinstance(at, list) or len(at) != 3
            or any(type(v) not in (int, float) or not np.isfinite(v) for v in at)
            or not isinstance(pose, dict) or placement.problem({**pose, "id": "copy#0", "x": 0, "z": 0})
            or placement.problem({"id": "copy#0", "x": 0, "y": 0, "z": 0, "turn": source.get("turn"), "scale": source.get("scale")})):
        raise ValueError("No model copy position, turn or size")
    resolve(ac, name, source.get("asset"))
    instance = {"id": "instance_" + secrets.token_hex(12), "asset": source["asset"], "at": list(at),
                "replaces": None, "collision": source.get("collision")}
    if source.get("model_scale", 1) != 1:
        instance["scale"] = source["model_scale"]
    wrong = problems([instance])
    if wrong:
        raise ValueError(wrong)
    instance["at"][1] -= float(trackheights.Field(now["heights"]).at(at[0], at[2])[0])
    placed = {"id": instance["id"] + "#0", "x": 0, "y": pose["y"], "z": 0,
              "turn": (source["turn"] + pose["turn"] + 180) % 360 - 180, "scale": source["scale"] * pose["scale"]}
    if placement.problem(placed):
        raise ValueError("The copied model's combined pose is outside the supported placement range")
    return {"model": instance, "placed": [placed]}
