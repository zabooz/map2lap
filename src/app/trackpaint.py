"""Immutable painted-ground texture edits and retained material snapshots, independent of the user's library and caches."""
import base64
import functools
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import tempfile
import threading

from PIL import Image

from app import materiallibrary, mytracks, paintimage, trackview
from track import editorinfo, surfaceindex

SCHEMA = 1
ASSET_SCHEMA = 2
MATERIAL = re.compile(r"[a-z][a-z0-9_]{0,79}")  # Build-written labels, also used in package-relative mask names.
MAX_PAINTS = 4096
KEY = re.compile(r"[a-f0-9]{64}")
GROUND_IMAGE = re.compile(r"ground_(-?\d+)_(-?\d+)\.(?:dds|png|jpe?g)", re.IGNORECASE)
BUNDLE = Path("data", "map2lap_paints")
_writing = threading.RLock()
_rendering = threading.Lock()  # One bounded tile compositor at a time, shared by index, preview requests and Save.


def _key(value):
    if not isinstance(value, str) or not KEY.fullmatch(value):
        raise ValueError("Invalid texture edit id")
    return value


def _digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def _out(folder, id):
    return Path(mytracks.ROOT, "out", folder, _key(id))


def _cache(version, filename):
    extension = Path(filename).suffix.lower()
    return Path(mytracks.ROOT, "cache", "track-textures", _key(version) + extension)


@functools.lru_cache(maxsize=512)
def _read_at(path, _state):
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def _read(path):
    try:
        stat = path.stat()
        return _read_at(str(path), (stat.st_mtime_ns, stat.st_size))
    except (OSError, ValueError) as error:
        raise ValueError("Texture edit data is missing or unreadable") from error


@functools.lru_cache(maxsize=4096)
def _verified_at(path, state, id):
    record = _read_at(path, state)
    if _digest(record) != id:
        raise ValueError("The retained material data has changed")
    return record


def _verified(path, id):
    try:
        stat = path.stat()
        return _verified_at(str(path), (stat.st_mtime_ns, stat.st_size), id)
    except OSError as error:
        raise ValueError("Texture edit data is missing or unreadable") from error


def _atomic(path, raw):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".writing_", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as file:
            file.write(raw)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.remove(temporary)


def _json_bytes(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


def _resolve(ac, name, folder, id):
    direct = _out("paints" if folder == "operations" else "paint-assets", id)
    if direct.is_dir():
        return direct
    saved = Path(trackview.kn5_path(ac, name)).parent / BUNDLE / folder / _key(id)
    if saved.is_dir():
        return saved
    raise ValueError("Texture edit data is missing; restore the track's saved material package")


def operation(ac, name, id, revision=None):
    folder = _resolve(ac, name, "operations", id)
    record = _verified(folder / "paint.json", id)
    if record.get("schema") != SCHEMA or not isinstance(record.get("tiles"), list) or len(record["tiles"]) > editorinfo.MAX_TILES:
        raise ValueError("Invalid texture edit")
    _key(record.get("asset"))
    asset = _resolve(ac, name, "materials", record["asset"])
    _verified(asset / "asset.json", record["asset"])
    if not (asset / "colour.png").is_file():
        raise ValueError("The retained material image is missing")
    if revision is not None and record.get("base") != revision:
        raise ValueError("The material selection belongs to another build of this track")
    for tile in record["tiles"]:
        if not isinstance(tile.get("tile"), list) or len(tile["tile"]) != 2 or not all(type(v) is int for v in tile["tile"]):
            raise ValueError("Invalid material tile")
        for mask in tile["masks"]:
            expected = f"{tile['tile'][0]}_{tile['tile'][1]}_{mask['material']}.png"
            if not MATERIAL.fullmatch(mask["material"]) or mask["file"] != expected:
                raise ValueError("Invalid ground material mask")
            if not (folder / expected).is_file():
                raise ValueError("The retained material selection is missing")
    return folder, record


def problems(paints):
    """Whether a draft contains a bounded ordered list of immutable edit ids. Pure; no files are read for a mesh request."""
    if (not isinstance(paints, list) or len(paints) > MAX_PAINTS or not all(isinstance(p, str) and KEY.fullmatch(p) for p in paints)
            or len(set(paints)) != len(paints)):
        return "Invalid ground texture edits"
    return None


def validate(ac, name, revision, paints):
    if problems(paints):
        raise ValueError(problems(paints))
    from app import tracknative
    path, _scan = trackview._scan_of(ac, name, revision)
    inherited = set(tracknative.inherited(ac, name, path)["paints"])
    for id in paints:
        folder, record = operation(ac, name, id, None if id in inherited else revision)
        asset = _resolve(ac, name, "materials", record["asset"])
        description = _verified(asset / "asset.json", record["asset"])
        _validate_asset(asset, description)
        for tile in record["tiles"]:
            for mask in tile["masks"]:
                if _file_digest(folder / mask["file"]) != mask["sha256"]:
                    raise ValueError("The retained material selection has changed")


@functools.lru_cache(maxsize=512)
def _file_digest_at(path, state):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _file_digest(path):
    stat = path.stat()
    return _file_digest_at(str(path), (stat.st_mtime_ns, stat.st_size))


def _validate_asset(folder, description):
    """Verify every retained normalized map and original; colour-only schema 1 snapshots remain readable."""
    files = {"colour.png": description["image"]}
    if description.get("schema") == ASSET_SCHEMA:
        for role, ref in description["maps"].items():
            materiallibrary._role(role)
            if ref["file"] != role + ".png":
                raise ValueError("Invalid retained material map path")
            files[ref["file"]] = _key(ref["sha256"])
        for role, ref in description["original"]["maps"].items():
            materiallibrary._role(role)
            extension = materiallibrary.EXTENSION[materiallibrary.FORMATS[Path(materiallibrary._filename(ref["filename"])).suffix.lower()]]
            if ref["file"] != "original/" + role + extension:
                raise ValueError("Invalid original material path")
            files[ref["file"]] = _key(ref["sha256"])
    elif description.get("schema") != 1:
        raise ValueError("This retained material format is not supported")
    if any(_file_digest(folder / path) != digest for path, digest in files.items()):
        raise ValueError("The retained material image has changed")


def _snapshot(material, variation=None):
    description = materiallibrary.get(material)
    raw = materiallibrary.colour(material)
    # Older library metadata could miss palette transparency; validate the normalized pixels before retaining anything.
    with Image.open(io.BytesIO(raw)) as colour:
        if "A" in colour.getbands() and colour.getchannel("A").getextrema() != (255, 255):
            raise ValueError("Ground textures require an opaque colour image")
    record = {k: description[k] for k in ("name", "category", "repeat", "source_url", "license")}
    record["variation"] = materiallibrary.varies(description) if variation is None else variation
    files, maps = {"colour.png": raw}, {}
    for role, source in description["maps"].items():
        filename = role + ".png"
        pixels = raw if role == "colour" else materiallibrary.map_image(material, role)
        files[filename] = pixels
        files[source["file"]] = materiallibrary.original(material, role)
        maps[role] = {"file": filename, "sha256": hashlib.sha256(pixels).hexdigest(),
                      "colour_space": "srgb" if role == "colour" else "linear"}
        if role == "normal":
            maps[role]["convention"] = "+Y"
    record.update(schema=ASSET_SCHEMA, library=material, image=hashlib.sha256(raw).hexdigest(), maps=maps,
                  properties=materiallibrary.properties(description), original=description)
    id = _digest(record)
    folder = _out("paint-assets", id)
    if not (folder / "asset.json").is_file():
        for filename, pixels in files.items():
            _atomic(folder / filename, pixels)
        _atomic(folder / "asset.json", _json_bytes(record))
    return id


def create(ac, name, revision, material, points, variation=None):
    """Capture authoritative painted-ground masks and a material; the draft is not changed here."""
    if variation is not None and type(variation) is not bool:
        raise ValueError("Choose whether the texture varies its repeats")
    description = materiallibrary.get(material)
    if description["source"]["alpha"]:
        raise ValueError("Ground textures require an opaque colour image")
    path, scan = trackview._scan_of(ac, name, revision)
    if not isinstance(points, list) or not points:
        raise ValueError("Select a ground area first")
    if len(points) > 64:
        raise ValueError("Select at most 64 ground points")
    groups = {}
    for point in points:
        selected = trackview.surface(ac, name, int(point["mesh"]), float(point["u"]), float(point["v"]), revision, bool(point.get("whole")))
        if point.get("whole") and selected["truncated"]:
            raise ValueError("Select all is incomplete: finish loading or select a smaller area (at most 64 ground tiles)")
        if not MATERIAL.fullmatch(selected["material"]):
            raise ValueError("Invalid ground material")
        groups.setdefault(selected["material"], []).append(selected)
    tiles, masks = {}, {}
    for source, selections in groups.items():
        for tile in surfaceindex.merge(selections)["tiles"]:
            key = tuple(tile["tile"])
            filename = f"{key[0]}_{key[1]}_{source}.png"
            raw = base64.b64decode(tile["mask"], validate=True)
            masks[filename] = raw
            tiles.setdefault(key, []).append({"material": source, "file": filename, "sha256": hashlib.sha256(raw).hexdigest()})
    if not tiles or len(tiles) > editorinfo.MAX_TILES:
        raise ValueError("Select at most 64 ground tiles")
    images = {tuple(map(int, match.groups())) for tex in scan["textures"] if (match := GROUND_IMAGE.fullmatch(tex[0]))}
    if not set(tiles) <= images:
        raise ValueError("This track has no editable ground image for part of the selection")
    with _writing:
        record = {"schema": SCHEMA, "base": revision, "asset": _snapshot(material, variation),
                  "tiles": [{"tile": list(key), "masks": sorted(value, key=lambda m: m["material"])} for key, value in sorted(tiles.items())]}
        id = _digest(record)
        folder = _out("paints", id)
        if not (folder / "paint.json").is_file():
            for filename, raw in masks.items():
                _atomic(folder / filename, raw)
            _atomic(folder / "paint.json", _json_bytes(record))
    trackview._scan_of(ac, name, revision)
    return id


@functools.lru_cache(maxsize=512)  # Digests only, not source image bytes.
def _source_digest(path, revision, i, offset, size):
    return hashlib.sha256(trackview._read(path, offset, size, revision)).hexdigest()


def _plan(ac, name, revision, paints, errors=None):
    from app import trackdetail, tracknative
    path, scan = trackview._scan_of(ac, name, revision)
    retained = tracknative.inherited(ac, name, path)
    inherited = set(retained["paints"])
    # Regional sources retain the untouched base plus their complete editable
    # paint list. An explicit empty draft therefore means restore that base.
    effective = list(dict.fromkeys(paints if 'render_sources' in retained else [*retained["paints"], *paints]))
    grouped = {}
    for id in effective:
        try:
            _folder, record = operation(ac, name, id, None if id in inherited else revision)
        except (ValueError, OSError) as error:
            if errors is None:
                raise
            errors.append(str(error))
            continue
        for tile in record["tiles"]:
            if id in inherited and tile["tile"] not in retained["tiles"]:
                continue
            grouped.setdefault(tuple(tile["tile"]), []).append(id)
    result = {}
    for i, (filename, offset, size) in enumerate(scan["textures"]):
        match = GROUND_IMAGE.fullmatch(filename)
        if not match or (key := tuple(map(int, match.groups()))) not in grouped:
            continue
        record = {"schema": SCHEMA, "detail_profile": trackdetail.PROFILE, "base": revision, "texture": i, "source": _source_digest(path, revision, i, offset, size),
                  "paints": grouped[key]}
        version = _digest(record)
        manifest = _out("paint-views", version) / "view.json"
        if not manifest.is_file():
            _atomic(manifest, _json_bytes(record))
        result[i] = version
    return result


@functools.lru_cache(maxsize=512)
def _output_size(path, revision, i, offset, size):
    """Exact full-mip BC1 size, or a conservative PNG/JPEG bound, from source headers without decoding pixels."""
    raw = trackview._read(path, offset, size, revision)
    with Image.open(io.BytesIO(raw)) as image:
        width, height = image.size
    if raw[:4] != b"DDS ":
        return width * height * 4 + 65536  # RGB scanlines, filters and compression/container overhead.
    from track.textures import dds_size
    return dds_size(width, height)


def descriptors(ac, name, revision, paints, reset=(), errors=None):
    """Immutable versions and allocation bounds; never composite or encode a texture here."""
    if problems(paints):
        raise ValueError(problems(paints))
    path, scan = trackview._scan_of(ac, name, revision)
    plan = _plan(ac, name, revision, paints, errors)
    result = []
    resolved = {}
    from app import trackdetail
    for i, version in plan.items():
        try:
            layers = trackdetail.describe(ac, name, version, resolved)
        except (ValueError, OSError) as error:
            if errors is None:
                raise
            errors.append(str(error))
            continue
        result.append({"i": i, "version": version, "size": scan["textures"][i][2], "layers": layers,
                       "materials": layers["materials"]})
    for i in reset:
        if i not in plan:
            material = Path(scan["textures"][i][0]).stem
            result.append({"i": i, "version": "", "size": scan["textures"][i][2],
                           "materials": [j for j, m in enumerate(scan["materials"]) if m.name == material]})
    return result


def changed(ac, name, revision, before, after):
    if before == after:
        # A repeated PUT may be recovering an answer lost after the draft was written.
        return descriptors(ac, name, revision, after, errors=[])
    reset = _plan(ac, name, revision, before, errors=[])
    return descriptors(ac, name, revision, after, reset)


def _layers(ac, name, revision, paints, key):
    from app import tracknative
    retained = set(tracknative.inherited(ac, name, trackview._scan_of(ac, name, revision)[0])["paints"])
    layers, assets = [], {}
    numbers = {}
    for id in paints:
        folder, record = operation(ac, name, id, None if id in retained else revision)
        asset = record["asset"]
        if asset not in numbers:
            asset_folder = _resolve(ac, name, "materials", asset)
            description = _verified(asset_folder / "asset.json", asset)
            if _file_digest(asset_folder / "colour.png") != description["image"]:
                raise ValueError("The retained material image has changed")
            numbers[asset] = len(numbers) + 1
            assets[numbers[asset]] = (str(asset_folder / "colour.png"), description["repeat"])
        for tile in record["tiles"]:
            if tuple(tile["tile"]) != key:
                continue
            for mask in tile["masks"]:
                raw = (folder / mask["file"]).read_bytes()
                if hashlib.sha256(raw).hexdigest() != mask["sha256"]:
                    raise ValueError("The retained material selection has changed")
                layers.append((numbers[asset], mask["material"], raw))
    return layers, assets


def texture(ac, name, i, revision, version):
    """One requested immutable texture, even after Undo or an unrelated draft write; regenerate only if its cache was evicted."""
    path, scan = trackview._scan_of(ac, name, revision)
    filename, offset, size = scan["textures"][i]
    record = _read(_out("paint-views", version) / "view.json")
    if (_digest(record) != version or record["base"] != revision or record["texture"] != i
            or record["source"] != _source_digest(path, revision, i, offset, size)):
        raise trackview.Unreadable("The texture belongs to another track source")
    target = _cache(version, filename)
    try:
        raw = target.read_bytes()
    except FileNotFoundError:
        raw = None
    if raw is not None:
        trackview._scan_of(ac, name, revision)
        return raw
    with _rendering:
        if not target.is_file():
            match = GROUND_IMAGE.fullmatch(filename)
            if not match:
                raise ValueError("No ground texture here")
            key = tuple(map(int, match.groups()))
            layers, assets = _layers(ac, name, revision, record["paints"], key)
            raw = trackview._read(path, offset, size, revision)
            _atomic(target, paintimage.encoded(raw, filename, key, layers, assets))
        raw = target.read_bytes()
    trackview._scan_of(ac, name, revision)
    return raw


def _bundle_inputs(ac, name, paints):
    """Active edit files and metadata for native source materials, including a transferred track's embedded layers."""
    operations, materials = {}, {}
    _path, scan, _revision = trackview._scanned(ac, name)
    from app import tracknative
    inherited = tracknative.inherited(ac, name, _path)["paints"]
    paints = list(dict.fromkeys([*inherited, *paints]))
    used = {texture for material in scan["materials"] for _slot, _index, texture in material.maps}
    saved = Path(trackview.kn5_path(ac, name)).parent / BUNDLE / "materials"
    if saved.is_dir():
        for folder in saved.iterdir():
            if KEY.fullmatch(folder.name) and folder.is_dir():
                meta = _verified(folder / "asset.json", folder.name)
                if "map2lap_material_" + meta["image"] + ".dds" in used:
                    _validate_asset(folder, meta)
                    materials[folder.name] = folder
    for id in paints:
        folder, record = operation(ac, name, id)
        operations[id] = folder
        materials[record["asset"]] = _resolve(ac, name, "materials", record["asset"])
    return operations, materials


def bundle_size(ac, name, paints):
    """Additional retained masks and material snapshots needed by a saved track, including native source layers."""
    return sum(path.stat().st_size for folders in _bundle_inputs(ac, name, paints) for folder in folders.values()
               for path in folder.rglob("*") if path.is_file())


def export(ac, name, paints, target):
    """Active edits and assets still used by native source layers into the saved track's data folder."""
    operations, materials = _bundle_inputs(ac, name, paints)
    destination = Path(target) / BUNDLE
    if destination.exists():
        shutil.rmtree(destination)
    for id, folder in operations.items():
        shutil.copytree(folder, destination / "operations" / id)
    for id, folder in materials.items():
        shutil.copytree(folder, destination / "materials" / id)
