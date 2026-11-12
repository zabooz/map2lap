"""Immutable model packages: the canonical GLB that was imported and its semantic import settings; the upload it came from is not kept."""
import hashlib
import functools
import json
import math
import os
from pathlib import Path
import re
import shutil
import tempfile
import threading
from urllib.parse import urlsplit

from app import libraryfolders, materiallibrary, modeldata, modelimport, modelmesh, modelsimplify
from app.paths import ROOT

SCHEMA = 1
PREPARATION = 1
CATEGORIES = ("tree", "bush", "grass", "flower", "plant", "rock", "vehicle", "building", "prop", "other")
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
    """The folder model id is read from: the user's import, else the one the release ships."""
    folder = libraryfolders.found(ROOT, "objects", _key(id))
    if folder.is_dir():
        return folder
    from app import builtinobjects
    return builtinobjects.folder(ROOT, id) or folder


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
            "alpha_modes": sorted({material.get("alphaMode", "OPAQUE") for material in model.materials}),
            "track_cost": modelmesh.track_cost(model)}


def identity(model_sha, meta):
    """A package's id: its GLB's hash with the import settings that change where and how it stands. Pure."""
    fields = {"schema": SCHEMA, "model": model_sha, **{k: meta[k] for k in ("category", "metres_per_unit", "anchor", "collision")}}
    return hashlib.sha256(json.dumps(fields, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def prepare(filename, raw):
    """Validate a model upload and stage a self-contained GLB; an FBX/OBJ/ZIP upload is converted and not kept."""
    filename = _filename(filename)
    if not isinstance(raw, bytes) or not 0 < len(raw) <= modeldata.MAX_BYTES:
        raise ValueError("Choose a model up to 128 MB")
    token = hashlib.sha256(raw).hexdigest()
    target = _cache(token)
    with _preparing:
        converted = Path(filename).suffix.lower() != '.glb'
        glb, warnings = modelimport.convert(filename, raw) if converted else (raw, [])
        model = modeldata.load(glb)
        data = {"version": PREPARATION, "token": token, "bytes": len(glb), "geometry": _summary(model), 'lighting_options': ['model', 'matte'],
                "model_sha256": hashlib.sha256(glb).hexdigest(), "warnings": warnings}
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=".prepare_", dir=target.parent) as temporary:
            ready = Path(temporary, "ready")
            ready.mkdir()
            (ready / "model.glb").write_bytes(glb)
            materiallibrary._write_json(ready / "prepared.json", data)
            with _gate:
                if target.exists():
                    os.replace(target, Path(temporary, "old"))
                os.replace(ready, target)
    return {**data, "filename": filename}


def _side(value):
    if type(value) is not int or value not in modelimport.TEXTURE_SIDES:
        raise ValueError("Choose a texture size of 1024 or 2048 pixels")
    return value


def _sized(folder, side):
    """The staged GLB with its images reduced to side, made once per prepared upload and size; the staged GLB stays as it is."""
    # The original preview and simplified geometry info arrive together. Share creation with _variant: on Windows,
    # replacing a file another request is reading fails, although the prepared upload is still perfectly valid.
    with _gate:
        path = folder / f"textures-{side}.glb"
        try:
            return path.read_bytes()
        except FileNotFoundError:
            pass
        raw = modelimport.texture_size((folder / "model.glb").read_bytes(), side)
        with tempfile.NamedTemporaryFile(dir=folder, prefix=".sized_", delete=False) as file:
            file.write(raw)
        try:
            os.replace(file.name, path)
        finally:
            Path(file.name).unlink(missing_ok=True)
        return raw


def _variant(folder, side, percentage):
    """Canonical geometry/texture choice, cached per upload, algorithm, level, error budget and texture size."""
    percentage = modelsimplify.level(percentage)
    if percentage == 100:
        return _sized(folder, side)
    path = folder / f'simplify-{modelsimplify.VERSION}-{percentage}-{modelsimplify.ERROR}-textures-{side}.glb'
    with _gate:
        if path.is_file():
            return path.read_bytes()
        raw = modelsimplify.simplify(_sized(folder, side), percentage)
        with tempfile.NamedTemporaryFile(dir=folder, prefix='.simplified_', delete=False) as file:
            file.write(raw)
        os.replace(file.name, path)
        return raw


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
            "creator": materiallibrary._text(settings.get("creator", ""), 200, "the creator"),
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
        except (OSError, ValueError) as error:
            raise ValueError("The prepared model is no longer available. Choose the file again.") from error
        colour_space = settings.get('material_colours', 'linear')
        lighting = settings.get('material_lighting', 'model')
        side = _side(settings.get('texture_side', modelimport.TEXTURE_SIDES[0]))
        percentage = modelsimplify.level(settings.get('simplify_level', 100))
        glb = modelimport.material_lighting(modelimport.material_colours(_variant(staged, side, percentage), colour_space), lighting)
        model_sha = hashlib.sha256(glb).hexdigest()
        meta = _settings(settings, data["geometry"])
        id = identity(model_sha, meta)
        if (_folder(id) / "asset.json").is_file():
            libraryfolders.show(ROOT, "objects", id)
            return {"model": get(id), "duplicate": True}
        target = libraryfolders.own(ROOT, "objects", id)
        geometry = data['geometry'] if percentage == 100 else _summary(modeldata.load(glb))
        asset = {"schema": SCHEMA, "kind": "model", "id": id, **meta, "geometry": geometry,
                 "model": {"file": "original/model.glb", "filename": Path(filename).stem + '.glb',
                           "sha256": model_sha, "bytes": len(glb)}, "texture_side": side}
        if percentage != 100:
            asset.update(simplify_level=percentage, simplify_error=modelsimplify.ERROR)
        if colour_space == 'srgb':
            asset['material_colours'] = colour_space
        if lighting == 'matte':
            asset['material_lighting'] = lighting
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=".import_", dir=target.parent) as temporary:
            folder = Path(temporary, "ready")
            (folder / "original").mkdir(parents=True)
            (folder / 'original/model.glb').write_bytes(glb)
            materiallibrary._write_json(folder / "asset.json", asset)
            os.replace(folder, target)
        return {"model": asset, "duplicate": False}


def remove(id):
    """Delete an imported package, or hide a shipped one (libraryfolders). Placed copies keep their own snapshot (trackmodels.snapshot),
    so no track loses the model."""
    with _gate:
        from app import builtinobjects
        if any(a["id"] == _key(id) for a in builtinobjects.catalogue(ROOT)):
            if id in libraryfolders.hidden(ROOT, "objects"):
                return False
            libraryfolders.hide(ROOT, "objects", id)
            return True
        return libraryfolders.remove(ROOT, "objects", _key(id), shutil.rmtree)


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


@functools.lru_cache(maxsize=32)
def _cost_at(path, stamp, digest):
    """Small geometry facts cached by immutable source hash and file revision; no GLB buffers are retained."""
    raw = Path(path).read_bytes()
    if hashlib.sha256(raw).hexdigest() != digest:
        raise ValueError("The retained original model has changed")
    return modelmesh.track_cost(modeldata.load(raw))


def cost(id):
    """Native geometry facts for one selected library model, including old packages without stored costs."""
    asset = get(id)
    known = asset["geometry"].get("track_cost")
    if known and known.get("version") == modelmesh.COST_VERSION:
        return known
    path = _folder(id) / "original/model.glb"
    stat = path.stat()
    return _cost_at(str(path), (stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size), asset["model"]["sha256"])


def prepared_model(token, material_colours='linear', material_lighting='model', texture_side=modelimport.TEXTURE_SIDES[0], simplify_level=100):
    """The validated preview with the chosen base-colour interpretation and texture size: the bytes add publishes. Staging stays
    unchanged."""
    token = _key(token)
    try:
        folder = _cache(token)
        data = materiallibrary._json(folder / 'prepared.json')
        raw = (folder / 'model.glb').read_bytes()
        if data.get('version') != PREPARATION or hashlib.sha256(raw).hexdigest() != data.get('model_sha256', token):
            raise ValueError('The prepared model has changed')
        return modelimport.material_lighting(modelimport.material_colours(_variant(folder, _side(texture_side), simplify_level), material_colours), material_lighting)
    except OSError as error:
        raise ValueError('The prepared model is no longer available. Choose the file again.') from error


def prepared_info(token, material_colours='linear', material_lighting='model', texture_side=modelimport.TEXTURE_SIDES[0], simplify_level=100):
    """Actual selected geometry costs and reduction status, measured by the same path Save uses."""
    raw = prepared_model(token, material_colours, material_lighting, texture_side, simplify_level)
    geometry = _summary(modeldata.load(raw))
    original = materiallibrary._json(_cache(token) / 'prepared.json')['geometry']
    before = original['track_cost']['triangles']
    after = geometry['track_cost']['triangles']
    return {'geometry': geometry, 'simplify_level': simplify_level,
            'simplification': 'original' if simplify_level == 100 else 'no_gain' if after >= before else 'target_reached' if after <= before * simplify_level / 100 else 'limited'}


def _superseded():
    """Catalogue replacements are separate from immutable packages and do not change existing model references."""
    try:
        data = materiallibrary._json(Path(ROOT, 'library/objects/superseded.json'))
        return {_key(old): _key(new) for old, new in data.items()}
    except (OSError, ValueError, TypeError, AttributeError):
        return {}


def supersede(old, new):
    """Show a replacement in the catalogue while retaining both original packages for existing references."""
    with _gate:
        get(old)
        get(new)
        replacements = _superseded()
        seen, target = {old}, new
        while True:
            if target in seen:
                raise ValueError('A model replacement cannot form a cycle')
            seen.add(target)
            if target not in replacements:
                break
            target = replacements[target]
        replacements[old] = new
        folder = Path(ROOT, 'library/objects')
        with tempfile.TemporaryDirectory(prefix='.catalogue_', dir=folder) as temporary:
            path = Path(temporary, 'superseded.json')
            materiallibrary._write_json(path, replacements)
            os.replace(path, folder / 'superseded.json')


def _provider(asset):
    """A known publisher from the retained source link; user model names do not establish provenance. Pure."""
    try:
        source = urlsplit(asset.get('source_url', ''))
        if source.scheme not in ('https', 'http'):
            return ''
        return {'kenney.nl': 'Kenney', 'quaternius.com': 'Quaternius', 'polyhaven.com': 'Poly Haven'}.get(
            (source.hostname or '').removeprefix('www.'), '')
    except ValueError:
        return ''


def catalogue_category(asset):
    """Expand legacy curated tree/other entries using the publisher's model family; retain explicit import categories. Pure."""
    category = asset['category']
    if category not in ('tree', 'other') or not _provider(asset):
        return category
    filename = Path(asset.get('model', {}).get('filename', '')).stem
    words = set(re.findall('[a-z]+', re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', filename).lower()))
    # A flowering bush is still a bush; standalone flowers and grass have their own publisher families.
    families = [('bush', {'bush', 'shrub'}), ('grass', {'grass'}), ('flower', {'flower', 'petal'}),
                ('tree', {'tree', 'pine', 'palm', 'trunk', 'stump', 'log'}),
                ('plant', {'plant', 'cactus', 'fern', 'sorrel'}), ('rock', {'rock', 'stone', 'boulder', 'pebble'}),
                ('prop', {'table', 'bench', 'barrier', 'lamp'})]
    return next((kind for kind, names in families if words & names), category)


def listing(query="", category="", offset=0, limit=40):
    """A small filtered/paged catalogue; geometry and image payloads are never returned here."""
    query = materiallibrary._text(query, 100, "the search").casefold()
    if category and category not in CATEGORIES:
        raise ValueError("Choose a model category")
    offset, limit = max(0, int(offset)), max(1, min(100, int(limit)))
    items = []
    with _gate:
        from app import builtinobjects
        gone = libraryfolders.hidden(ROOT, "objects")
        assets = [a for a in builtinobjects.catalogue(ROOT) if a["id"] not in gone]
        for name, _path in libraryfolders.names(ROOT, "objects"):
            if not materiallibrary.KEY.fullmatch(name):
                continue
            try:
                asset = get(name)
            except ValueError:
                continue
            assets.append(asset)
        assets = list({a["id"]: a for a in assets}.values())
        present = {asset['id'] for asset in assets}
        hidden = {old for old, new in _superseded().items() if new in present}
        for asset in assets:
            if asset['id'] in hidden:
                continue
            kind = catalogue_category(asset)
            if ((not category or category == kind)
                    and query in " ".join([asset["name"], *asset["tags"]]).casefold()):
                items.append({**{k: asset[k] for k in ("id", "name", "tags", "metres_per_unit", "anchor", "collision", "geometry")},
                              'category': kind, 'creator': asset.get('creator') or _provider(asset),
                              'source_url': asset.get('source_url', ''), 'license': asset.get('license', ''),
                              **{k: asset[k] for k in ("builtin", "native_tree") if k in asset}})
    items.sort(key=lambda item: (item["name"].casefold(), item["id"]))
    return {"items": items[offset:offset + limit], "total": len(items), "offset": offset, 'categories': list(CATEGORIES)}
