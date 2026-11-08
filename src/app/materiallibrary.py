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

SCHEMA = 1
PREPARATION = 4
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


def _cache(token):
    return Path(ROOT, "cache", "materials", str(PREPARATION), _key(token))


def _folder(id):
    return Path(ROOT, "library", "materials", _key(id))


def _json(path):
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def _write_json(path, value):
    with open(path, "w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def _decoded(filename, raw):
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
            image = ImageOps.exif_transpose(original)
            if image.mode == "P":
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            profile = original.info.get("icc_profile")
            if profile:
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
            image.info.clear()                 # Prepared maps never carry EXIF, GPS or the source colour profile.
            return image, {"format": expected, "size": list(image.size), "alpha": alpha, "bytes": len(raw)}
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, ImageCms.PyCMSError) as error:
        raise ValueError("Could not read this image. Choose a valid PNG, JPG or supported DDS file.") from error


def _prepare(filename, raw, token):
    """Publish complete prepared data atomically. Call under _preparing; no persistent library entry is made here."""
    target = _cache(token)
    try:
        data = _json(target / "prepared.json")
    except (OSError, ValueError):
        data = None
    if data and all((target / f).is_file() for f in ("colour.png", "preview.png", "original" + EXTENSION[data["source"]["format"]])):
        if FORMATS[Path(filename).suffix.lower()] != data["source"]["format"]:
            raise ValueError("The file extension does not match its image format")
        return data
    image, source = _decoded(filename, raw)
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
        colour.save(folder / "colour.png")
        data = {"token": token, "source": source,
                "prepared": {"version": PREPARATION, "size": list(size), "format": "BC3" if source["alpha"] else "BC1", "bytes": dds_size(*size, alpha=source["alpha"])}}
        _write_json(folder / "prepared.json", data)
        with _gate:
            if target.exists():
                os.replace(target, Path(temporary, "old"))  # A per-file cache prune may leave an incomplete entry.
            os.replace(folder, target)
    return data


def prepare(filename, raw):
    """Prepare one uploaded colour image for preview/import, without adding it to the library."""
    filename = _filename(filename)
    if not isinstance(raw, bytes) or not 0 < len(raw) <= MAX_BYTES:
        raise ValueError("Choose an image up to 64 MB")
    token = hashlib.sha256(raw).hexdigest()
    with _preparing:
        return {**_prepare(filename, raw, token), "filename": filename}


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


def add(settings):
    """Import a prepared image with immutable material settings; identical content and scale reuse the existing id."""
    token, filename, meta = _settings(settings)
    identity = json.dumps({"schema": SCHEMA, "colour": token, "repeat": meta["repeat"], "variation": meta["variation"]}, sort_keys=True, separators=(",", ":"))
    id = hashlib.sha256(identity.encode("utf-8")).hexdigest()
    with _gate:
        target = _folder(id)
        if (target / "asset.json").is_file():
            return {"material": get(id), "duplicate": True}
        staged = _cache(token)
        try:
            data = _json(staged / "prepared.json")
        except (OSError, ValueError) as error:
            raise ValueError("The prepared image is no longer available. Choose the file again.") from error
        extension = EXTENSION[data["source"]["format"]]
        if FORMATS[Path(filename).suffix.lower()] != data["source"]["format"]:
            raise ValueError("The file extension does not match its image format")
        material = {"schema": SCHEMA, "kind": "material", "id": id, **meta, "source": data["source"], "prepared": data["prepared"],
                    "maps": {"colour": {"file": "original/colour" + extension, "filename": filename, "sha256": token}}}
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=".import_", dir=target.parent) as temporary:
            folder = Path(temporary, "ready")
            (folder / "original").mkdir(parents=True)
            shutil.copyfile(staged / ("original" + extension), folder / material["maps"]["colour"]["file"])
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
    if material.get("schema") != SCHEMA or material.get("id") != id:
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


def colour(id):
    """A normalized lossless colour map for a retained track snapshot; rebuild an evicted cache from the original."""
    material = get(id)
    source = material["maps"]["colour"]
    token = _key(source["sha256"])
    target = _cache(token) / "colour.png"
    try:
        return target.read_bytes()
    except FileNotFoundError:
        pass
    with _preparing:
        if not target.is_file():
            path = _folder(id) / ("original/colour" + EXTENSION[material["source"]["format"]])
            raw = path.read_bytes()
            if hashlib.sha256(raw).hexdigest() != token:
                raise ValueError("The retained material image has changed")
            _prepare(source["filename"], raw, token)
        return target.read_bytes()
