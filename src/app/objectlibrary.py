"""Immutable model packages: canonical GLBs, retained source uploads and semantic import settings."""
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import tempfile
import threading

from app import materiallibrary, modeldata, modelimport
from app.paths import ROOT

SCHEMA = 1
PREPARATION = 1
CATEGORIES = ("tree", "building", "other")
_gate = threading.RLock()
_preparing = threading.Lock()


def _key(value):
    if not isinstance(value, str) or not materiallibrary.KEY.fullmatch(value):
        raise ValueError("No model with this id")
    return value


def _filename(value):
    if (not isinstance(value, str) or not value or len(value) > 200 or any(c in value for c in '/\\\x00:')
            or Path(value).suffix.lower() not in modelimport.SUFFIXES):
        raise ValueError("Choose a GLB, FBX, OBJ or model ZIP file, not a folder or path")
    return value


def _folder(id):
    return Path(ROOT, "library", "objects", _key(id))


def _cache(token):
    return Path(ROOT, "cache", "models", str(PREPARATION), _key(token))


def _digest(path):
    with open(path, "rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def _summary(model):
    """Small source geometry facts in GLB metres; scene/object placement is not part of a model package. Pure."""
    return {"vertices": sum(len(part.positions) for part in model.primitives), "triangles": sum(len(part.indices) for part in model.primitives),
            "primitives": len(model.primitives), "instances": len(model.instances), "materials": len(model.materials), "images": len(model.images),
            "bounds": model.bounds, "anchor": model.anchor,
            "alpha_modes": sorted({material.get("alphaMode", "OPAQUE") for material in model.materials})}


def prepare(filename, raw):
    """Validate a model upload and stage a self-contained GLB and its retained source bytes."""
    filename = _filename(filename)
    if not isinstance(raw, bytes) or not 0 < len(raw) <= modeldata.MAX_BYTES:
        raise ValueError("Choose a model up to 128 MB")
    token = hashlib.sha256(raw).hexdigest()
    target = _cache(token)
    with _preparing:
        converted = Path(filename).suffix.lower() != '.glb'
        glb, warnings = modelimport.convert(filename, raw) if converted else (raw, [])
        model = modeldata.load(glb)
        data = {"version": PREPARATION, "token": token, "bytes": len(glb), "geometry": _summary(model),
                "model_sha256": hashlib.sha256(glb).hexdigest(), "warnings": warnings}
        if converted:
            data['source'] = {"filename": filename, "sha256": token, "bytes": len(raw),
                              "file": 'original/upload' + Path(filename).suffix.lower()}
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=".prepare_", dir=target.parent) as temporary:
            ready = Path(temporary, "ready")
            ready.mkdir()
            (ready / "model.glb").write_bytes(glb)
            if converted:
                (ready / 'upload').write_bytes(raw)
            materiallibrary._write_json(ready / "prepared.json", data)
            with _gate:
                if target.exists():
                    os.replace(target, Path(temporary, "old"))
                os.replace(ready, target)
    return {**data, "filename": filename}


def _settings(settings, geometry):
    """Semantic immutable import settings; source units and the model anchor remain independent of object placements. Pure."""
    name = materiallibrary._text(settings.get("name"), 80, "a name", True)
    category = settings.get("category", "tree")
    if category not in CATEGORIES:
        raise ValueError("Choose a model category")
    scale, collision = settings.get("metres_per_unit", 1.), settings.get("collision", "none")
    if type(scale) not in (int, float) or not math.isfinite(scale) or scale <= 0:
        raise ValueError("Model scale must be a finite positive number")
    if collision not in ("none", "mesh"):
        raise ValueError("Choose no collision or model mesh collision")
    anchor = settings.get("anchor", geometry["anchor"])
    if (not isinstance(anchor, list) or len(anchor) != 3
            or any(type(v) not in (int, float) or not math.isfinite(v) for v in anchor)):
        raise ValueError("The model anchor needs three finite coordinates")
    tags = settings.get("tags", [])
    if not isinstance(tags, list) or len(tags) > 20:
        raise ValueError("Use at most 20 tags")
    return {"name": name, "category": category, "metres_per_unit": float(scale), "anchor": list(map(float, anchor)), "collision": collision,
            "tags": list(dict.fromkeys(materiallibrary._text(t, 40, "the tags", True) for t in tags)),
            "source_url": materiallibrary._text(settings.get("source", ""), 500, "the source"),
            "license": materiallibrary._text(settings.get("license", ""), 200, "the license")}


def add(settings):
    """Publish an immutable GLB package; identical source and semantic properties reuse the existing model id."""
    if not isinstance(settings, dict):
        raise ValueError("No model settings")
    token, filename = _key(settings.get("token")), _filename(settings.get("filename"))
    with _gate:
        staged = _cache(token)
        try:
            data = materiallibrary._json(staged / "prepared.json")
            if (data.get("version") != PREPARATION or data.get("token") != token
                    or _digest(staged / "model.glb") != data.get('model_sha256', token)):
                raise ValueError("The prepared model has changed")
            if data.get('source') and (_digest(staged / 'upload') != token or data['source']['filename'] != filename):
                raise ValueError('The prepared source model has changed')
        except (OSError, ValueError) as error:
            raise ValueError("The prepared model is no longer available. Choose the file again.") from error
        meta = _settings(settings, data["geometry"])
        identity = {"schema": SCHEMA, "model": data.get('model_sha256', token),
                    **{k: meta[k] for k in ("category", "metres_per_unit", "anchor", "collision")}}
        id = hashlib.sha256(json.dumps(identity, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()
        target = _folder(id)
        if (target / "asset.json").is_file():
            return {"model": get(id), "duplicate": True}
        asset = {"schema": SCHEMA, "kind": "model", "id": id, **meta, "geometry": data["geometry"],
                 "model": {"file": "original/model.glb", "filename": Path(filename).stem + '.glb' if data.get('source') else filename,
                           "sha256": data.get('model_sha256', token), "bytes": data["bytes"]}}
        if data.get('source'):
            asset['source'] = data['source']
            asset['warnings'] = data.get('warnings', [])
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=".import_", dir=target.parent) as temporary:
            folder = Path(temporary, "ready")
            (folder / "original").mkdir(parents=True)
            shutil.copyfile(staged / "model.glb", folder / "original/model.glb")
            if data.get('source'):
                shutil.copyfile(staged / 'upload', folder / data['source']['file'])
            materiallibrary._write_json(folder / "asset.json", asset)
            os.replace(folder, target)
        return {"model": asset, "duplicate": False}


def get(id):
    """One versioned model description, with package-relative paths only."""
    try:
        asset = materiallibrary._json(_folder(id) / "asset.json")
    except (OSError, ValueError) as error:
        raise ValueError("This model is not in the library") from error
    if asset.get("schema") != SCHEMA or asset.get("id") != id or asset.get("kind") != "model":
        raise ValueError("This model format is not supported")
    return asset


def original(id):
    """The unchanged verified GLB bytes, also usable when every derived cache file has gone."""
    asset = get(id)
    if asset["model"]["file"] != "original/model.glb":
        raise ValueError("Invalid original model path")
    raw = (_folder(id) / "original/model.glb").read_bytes()
    if hashlib.sha256(raw).hexdigest() != _key(asset["model"]["sha256"]):
        raise ValueError("The retained original model has changed")
    return raw


def prepared_model(token):
    """The validated canonical GLB used by the import preview, including converted FBX/OBJ uploads."""
    token = _key(token)
    try:
        folder = _cache(token)
        data = materiallibrary._json(folder / 'prepared.json')
        raw = (folder / 'model.glb').read_bytes()
        if data.get('version') != PREPARATION or hashlib.sha256(raw).hexdigest() != data.get('model_sha256', token):
            raise ValueError('The prepared model has changed')
        return raw
    except OSError as error:
        raise ValueError('The prepared model is no longer available. Choose the file again.') from error


def source_path(folder, asset):
    """An optional retained FBX/OBJ/ZIP input, checked by its package-relative name and original byte hash."""
    source = asset.get('source')
    if source is None:
        return None
    suffix = Path(_filename(source.get('filename'))).suffix.lower()
    if suffix == '.glb' or source.get('file') != 'original/upload' + suffix:
        raise ValueError('Invalid original source model path')
    path = Path(folder) / source['file']
    if _digest(path) != _key(source.get('sha256')):
        raise ValueError('The original source model has changed')
    return path


def listing(query="", category="", offset=0, limit=40):
    """A small filtered/paged catalogue; geometry and image payloads are never returned here."""
    query = materiallibrary._text(query, 100, "the search").casefold()
    if category and category not in CATEGORIES:
        raise ValueError("Choose a model category")
    offset, limit = max(0, int(offset)), max(1, min(100, int(limit)))
    folder = Path(ROOT, "library", "objects")
    items = []
    with _gate:
        for path in folder.iterdir() if folder.is_dir() else ():
            if not materiallibrary.KEY.fullmatch(path.name):
                continue
            try:
                asset = get(path.name)
            except ValueError:
                continue
            if ((not category or category == asset["category"])
                    and query in " ".join([asset["name"], *asset["tags"]]).casefold()):
                items.append({k: asset[k] for k in ("id", "name", "category", "tags", "metres_per_unit", "anchor", "collision", "geometry")})
    items.sort(key=lambda item: (item["name"].casefold(), item["id"]))
    return {"items": items[offset:offset + limit], "total": len(items), "offset": offset}
