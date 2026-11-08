"""Persistent, immutable imported materials; derived colour/DDS files are disposable and shared by content."""
import functools
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import shutil
import struct
import tempfile
import threading

from PIL import Image, ImageCms, ImageOps, UnidentifiedImageError

from app.paths import ROOT
from track.textures import dds_size

SCHEMA = 2
PREPARATION = 5
MAP_ROLES = ("colour", "normal", "roughness")
MAX_BYTES = 64 << 20
MAX_PIXELS = 32 << 20             # One decoded RGBA input stays within 128 MiB, before its 2K prepared copy.
MAX_SIDE = 8192
RUNTIME_SIDE = 2048
CATEGORIES = ("grass", "asphalt", "rock", "soil", "sand", "snow", "wall", "wood", "other")
FORMATS = {".png": "PNG", ".jpg": "JPEG", ".jpeg": "JPEG", ".dds": "DDS"}
EXTENSION = {"PNG": ".png", "JPEG": ".jpg", "DDS": ".dds"}
KEY = re.compile(r"[a-f0-9]{64}")
_gate = threading.RLock()
_preparing = threading.Lock()  # Bound decoded-image memory without blocking small library reads.


def _key(value):
    if not isinstance(value, str) or not KEY.fullmatch(value):
        raise ValueError("No material with this id")
    return value


def _filename(value):
    if not isinstance(value, str) or not value or len(value) > 200 or any(c in value for c in '/\\\x00:'):
        raise ValueError("Choose an image file, not a folder or path")
    if Path(value).suffix.lower() not in FORMATS:
        raise ValueError("Choose a PNG, JPG or DDS colour image")
    return value


def _role(value):
    if value not in MAP_ROLES:
        raise ValueError("Choose a colour, normal or roughness map")
    return value


def _cache(token, role="colour"):
    return Path(ROOT, "cache", "materials", str(PREPARATION), _key(token) + ("_" + _role(role) if role != "colour" else ""))


def _folder(id):
    return Path(ROOT, "library", "materials", _key(id))


def _json(path):
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def _write_json(path, value):
    with open(path, "w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def _decoded(filename, raw, role="colour"):
    """Validate and decode a colour image, applying orientation and converting an embedded colour profile to sRGB."""
    expected = FORMATS[Path(filename).suffix.lower()]
    if expected == "DDS":
        if len(raw) < 128 or raw[:4] != b"DDS " or raw[84:88] not in (b"DXT1", b"DXT3", b"DXT5"):
            raise ValueError("Use a two-dimensional BC1, BC2 or BC3 DDS colour image")
        if struct.unpack_from("<I", raw, 112)[0]:
            raise ValueError("Cube maps and volume DDS textures cannot be used as a surface material")
    try:
        with Image.open(io.BytesIO(raw)) as original:
            if original.format != expected:
                raise ValueError("The file extension does not match its image format")
            if max(original.size) > MAX_SIDE or original.width * original.height > MAX_PIXELS:
                raise ValueError("Choose an image up to 8192 pixels per side and 32 megapixels")
            if original.mode in ("I", "F") or original.mode.startswith("I;16"):
                raise ValueError("Choose an 8-bit colour image; 16-bit and floating-point images are not supported")
            # Pillow exposes 16-bit RGB PNG as mode RGB after silently reducing its channels to eight bits.
            if expected == "PNG" and len(raw) >= 33 and raw[24] > 8:
                raise ValueError("Choose an 8-bit colour image; 16-bit and floating-point images are not supported")
            if role == "normal" and original.getexif().get(274, 1) != 1:
                raise ValueError("Normal maps must have their orientation applied before import")
            image = ImageOps.exif_transpose(original)
            if image.mode == "P":
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            profile = original.info.get("icc_profile")
            if profile and role == "colour":
                input_profile = ImageCms.ImageCmsProfile(io.BytesIO(profile))
                alpha_channel = image.getchannel("A") if "A" in image.getbands() else None
                colour_space = input_profile.profile.xcolor_space.strip()
                if colour_space == "GRAY":
                    image = image.getchannel("L") if image.mode == "LA" else image.convert("L")
                elif colour_space == "RGB" or image.mode not in ("L", "RGB", "CMYK"):
                    image = image.convert("RGB")
                image = ImageCms.profileToProfile(image, input_profile,
                                                  ImageCms.createProfile("sRGB"), outputMode="RGB")
                if alpha_channel is not None:
                    image.putalpha(alpha_channel)
            image = image.convert("RGBA")
            alpha = image.getchannel("A").getextrema() != (255, 255)
            if not alpha:
                image = image.convert("RGB")
            if role != "colour":
                # Data channels encode vectors or scalar roughness, never gamma-corrected colour.
                image = image.convert("RGB")
                if role == "roughness":
                    image = image.getchannel("R")
                alpha = False
            image.info.clear()                 # Prepared maps never carry EXIF, GPS or the source colour profile.
            return image, {"format": expected, "size": list(image.size), "alpha": alpha, "bytes": len(raw)}
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, ImageCms.PyCMSError) as error:
        raise ValueError("Could not read this image. Choose a valid PNG, JPG or supported DDS file.") from error


def _prepare(filename, raw, token, role="colour"):
    """Publish complete prepared data atomically. Call under _preparing; no persistent library entry is made here."""
    target = _cache(token, role)
    try:
        data = _json(target / "prepared.json")
    except (OSError, ValueError):
        data = None
    if data and all((target / f).is_file() for f in (role + ".png", "preview.png", "original" + EXTENSION[data["source"]["format"]])):
        if FORMATS[Path(filename).suffix.lower()] != data["source"]["format"]:
            raise ValueError("The file extension does not match its image format")
        return data
    image, source = _decoded(filename, raw, role)
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".prepare_", dir=target.parent) as temporary:
        folder = Path(temporary, "ready")
        folder.mkdir()
        (folder / ("original" + EXTENSION[source["format"]])).write_bytes(raw)
        preview = image.copy()
        preview.thumbnail((256, 256), Image.Resampling.LANCZOS)
        preview.save(folder / "preview.png")
        # BC texture base dimensions must span a complete 4×4 block in WebGL, even for a solid 1px colour input.
        size = tuple(max(4, 1 << (min(d, RUNTIME_SIDE).bit_length() - 1)) for d in image.size)
        colour = image.resize(size, Image.Resampling.LANCZOS)
        colour.save(folder / (role + ".png"))
        data = {"token": token, "role": role, "source": source,
                "prepared": {"version": PREPARATION, "size": list(size), "format": "BC3" if source["alpha"] else "BC1", "bytes": dds_size(*size, alpha=source["alpha"])}}
        _write_json(folder / "prepared.json", data)
        with _gate:
            if target.exists():
                os.replace(target, Path(temporary, "old"))  # A per-file cache prune may leave an incomplete entry.
            os.replace(folder, target)
    return data


def prepare(filename, raw, role="colour"):
    """Prepare one uploaded colour image for preview/import, without adding it to the library."""
    filename = _filename(filename)
    role = _role(role)
    if role == "normal" and Path(filename).suffix.lower() == ".dds":
        raise ValueError("Choose a PNG or JPG RGB normal map (+Y); packed DDS normals are not supported")
    if not isinstance(raw, bytes) or not 0 < len(raw) <= MAX_BYTES:
        raise ValueError("Choose an image up to 64 MB")
    token = hashlib.sha256(raw).hexdigest()
    with _preparing:
        return {**_prepare(filename, raw, token, role), "filename": filename}


def _text(value, maximum, label, required=False):
    if not isinstance(value, str) or len(value) > maximum or any(ord(c) < 32 for c in value):
        raise ValueError(f"Check {label}")
    value = value.strip()
    if required and not value:
        raise ValueError(f"Give the material {label}")
    return value


def _settings(settings):
    if not isinstance(settings, dict):
        raise ValueError("No material settings")
    token = _key(settings.get("token"))
    filename = _filename(settings.get("filename"))
    name = _text(settings.get("name"), 80, "a name", True)
    category, repeat = settings.get("category"), settings.get("repeat")
    if category not in CATEGORIES:
        raise ValueError("Choose a material category")
    variation = settings.get("variation", varies({"category": category}))
    if type(variation) is not bool:
        raise ValueError("Choose whether the material varies its repeats")
    if not isinstance(repeat, list) or len(repeat) != 2 or not all(type(v) in (int, float) and math.isfinite(v) and 0.01 <= v <= 10000 for v in repeat):
        raise ValueError("Width and height must be between 0.01 and 10000 metres")
    tags = settings.get("tags", [])
    if not isinstance(tags, list) or len(tags) > 20:
        raise ValueError("Use at most 20 tags")
    return token, filename, {"name": name, "category": category, "repeat": [float(v) for v in repeat], "variation": variation,
                             "source_url": _text(settings.get("source", ""), 500, "the source"),
                             "license": _text(settings.get("license", ""), 200, "the license"),
                             "tags": list(dict.fromkeys(_text(t, 40, "the tags", True) for t in tags))}


def varies(material):
    """Whether a material breaks up repetitions; older natural ground imports use the category default. Pure."""
    return material.get("variation", material.get("category") in {"grass", "asphalt", "rock", "soil", "sand", "snow"})


def properties(material):
    """Shader-independent ground defaults, also for colour-only schema 1 packages. Pure."""
    return {"roughness": 1., "normal_scale": 1., **material.get("properties", {})}


def _map_settings(settings, token, filename):
    """Validated upload references and physical material properties. Pure."""
    maps = settings.get("maps", {})
    if not isinstance(maps, dict) or set(maps) - {"normal", "roughness"}:
        raise ValueError("Choose optional normal and roughness maps")
    references = {"colour": {"token": token, "filename": filename}}
    for role, ref in maps.items():
        if not isinstance(ref, dict):
            raise ValueError("Choose a prepared " + role + " map")
        references[role] = {"token": _key(ref.get("token")), "filename": _filename(ref.get("filename"))}
    values = settings.get("properties", {})
    if not isinstance(values, dict) or set(values) - {"roughness", "normal_scale"}:
        raise ValueError("Check the material properties")
    values = properties({"properties": values})
    if any(type(v) not in (int, float) or not math.isfinite(v) for v in values.values()):
        raise ValueError("Material properties must be finite numbers")
    if not 0 <= values["roughness"] <= 1 or values["normal_scale"] < 0:
        raise ValueError("Roughness must be between 0 and 1; normal scale must be non-negative")
    return references, {key: float(value) for key, value in values.items()}


def _compatible_id(references, meta, values):
    """Find an immutable schema 1/2 package with the same map bytes and physical settings."""
    root = Path(ROOT, "library", "materials")
    if not root.is_dir():
        return None
    maps = {role: ref["token"] for role, ref in references.items()}
    for folder in sorted(root.iterdir()):
        if not KEY.fullmatch(folder.name):
            continue
        try:
            material = get(folder.name)
            if (material["repeat"] == meta["repeat"] and varies(material) == meta["variation"]
                    and properties(material) == values
                    and {role: ref["sha256"] for role, ref in material["maps"].items()} == maps):
                return folder.name
        except (OSError, ValueError, KeyError, TypeError):
            continue
    return None


def _staged_map(role, ref):
    """Read a role-bound prepared upload; missing or changed inputs cannot publish a material package."""
    staged = _cache(ref["token"], role)
    try:
        data = _json(staged / "prepared.json")
        extension = EXTENSION[data["source"]["format"]]
        original = staged / ("original" + extension)
        if (data.get("role", "colour") != role or not (staged / (role + ".png")).is_file()
                or hashlib.sha256(original.read_bytes()).hexdigest() != ref["token"]):
            raise ValueError("The prepared map has changed")
    except (OSError, ValueError, KeyError) as error:
        raise ValueError("The prepared " + role + " map is no longer available. Choose the file again.") from error
    if FORMATS[Path(ref["filename"]).suffix.lower()] != data["source"]["format"]:
        raise ValueError("The file extension does not match its image format")
    description = {"file": "original/" + role + extension, "filename": ref["filename"], "sha256": ref["token"],
                   "colour_space": "srgb" if role == "colour" else "linear"}
    if role == "normal":
        description["convention"] = "+Y"
    return staged, original, data, description


def add(settings):
    """Import a prepared image with immutable material settings; identical content and scale reuse the existing id."""
    token, filename, meta = _settings(settings)
    references, values = _map_settings(settings, token, filename)
    identity = json.dumps({"schema": SCHEMA, "maps": {role: ref["token"] for role, ref in references.items()},
                           "repeat": meta["repeat"], "variation": meta["variation"], "properties": values}, sort_keys=True, separators=(",", ":"))
    id = hashlib.sha256(identity.encode("utf-8")).hexdigest()
    with _gate:
        target = _folder(id)
        if (target / "asset.json").is_file():
            return {"material": get(id), "duplicate": True}
        compatible = _compatible_id(references, meta, values)
        if compatible is not None:
            return {"material": get(compatible), "duplicate": True}
        inputs = {role: _staged_map(role, ref) for role, ref in references.items()}
        staged, _original, data, _description = inputs["colour"]
        material = {"schema": SCHEMA, "kind": "material", "id": id, **meta, "source": data["source"], "prepared": data["prepared"],
                    "properties": values, "maps": {role: item[3] for role, item in inputs.items()}}
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=".import_", dir=target.parent) as temporary:
            folder = Path(temporary, "ready")
            (folder / "original").mkdir(parents=True)
            for role, (_staged, original, _data, description) in inputs.items():
                shutil.copyfile(original, folder / description["file"])
            shutil.copyfile(staged / "preview.png", folder / "preview.png")
            _write_json(folder / "asset.json", material)
            os.replace(folder, target)
        _catalog.cache_clear()
        return {"material": material, "duplicate": False}


def get(id):
    """The immutable description of material id, with only package-relative file names."""
    try:
        material = _json(_folder(id) / "asset.json")
    except (OSError, ValueError) as error:
        raise ValueError("This material is not in the library") from error
    if material.get("schema") not in (1, SCHEMA) or material.get("id") != id:
        raise ValueError("This material description is not supported")
    return material


def remove(id):
    """Delete only this library package; retained track snapshots and disposable prepared data remain independent."""
    target = _folder(id)
    root = Path(ROOT, "library", "materials").resolve()
    if target.is_symlink() or target.is_junction() or target.resolve().parent != root:
        raise ValueError("The texture package is outside the material library")
    with _gate:
        if not target.exists():
            return False
        shutil.rmtree(target)
        _catalog.cache_clear()
    return True


@functools.lru_cache(maxsize=4)
def _catalog(root, changed):
    """Only small immutable summaries are retained, until an import publishes a new package."""
    items = []
    for path in Path(root).iterdir():
        if not KEY.fullmatch(path.name):
            continue
        try:
            material = get(path.name)
        except ValueError:
            continue
        items.append({**{key: material[key] for key in ("id", "name", "category", "repeat", "tags", "source", "prepared")}, "variation": varies(material)})
    return sorted(items, key=lambda m: (m["name"].casefold(), m["id"]))


def listing(query="", category="", offset=0, limit=40):
    """A filtered page of material summaries; originals and build maps never enter the list response."""
    if category and category not in CATEGORIES:
        raise ValueError("Choose a material category")
    query = _text(query, 100, "the search").casefold()
    offset, limit = max(0, int(offset)), max(1, min(100, int(limit)))
    folder = Path(ROOT, "library", "materials")
    with _gate:
        items = _catalog(str(folder), folder.stat().st_mtime_ns) if folder.is_dir() else []
        matches = [m for m in items if (not category or m["category"] == category)
                   and query in " ".join([m["name"], *m["tags"]]).casefold()]
        return {"items": matches[offset:offset + limit], "total": len(matches), "offset": offset}


def preview(id, staged=False):
    """One small preview PNG, from a retained material package or a prepared import."""
    try:
        return ((_cache(id) if staged else _folder(id)) / "preview.png").read_bytes()
    except OSError as error:
        raise ValueError("This material preview is no longer available") from error


def map_image(id, role):
    """A normalized lossless map; derived files can be regenerated from each verified original independently."""
    role = _role(role)
    material = get(id)
    source = material["maps"].get(role)
    if source is None:
        raise ValueError("This material has no " + role + " map")
    token = _key(source["sha256"])
    target = _cache(token, role) / (role + ".png")
    try:
        return target.read_bytes()
    except FileNotFoundError:
        pass
    with _preparing:
        if not target.is_file():
            filename = _filename(source["filename"])
            raw = original(id, role)
            _prepare(filename, raw, token, role)
        return target.read_bytes()


def original(id, role):
    """The verified original map bytes; only generated package-relative names are accepted."""
    role = _role(role)
    source = get(id)["maps"].get(role)
    if source is None:
        raise ValueError("This material has no " + role + " map")
    filename = _filename(source["filename"])
    extension = EXTENSION[FORMATS[Path(filename).suffix.lower()]]
    if source["file"] != "original/" + role + extension:
        raise ValueError("Invalid original material path")
    raw = (_folder(id) / source["file"]).read_bytes()
    if hashlib.sha256(raw).hexdigest() != _key(source["sha256"]):
        raise ValueError("The retained material image has changed")
    return raw


def colour(id):
    """A normalized colour map for retained track snapshots, independent of the disposable cache."""
    return map_image(id, "colour")
