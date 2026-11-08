"""Read-only details and small texture previews for one Editor selection."""
import functools
import io
import math
from pathlib import Path

from PIL import Image

from app import materiallibrary, trackdetail, trackedits, trackpaint, trackview


def object_info(ac, name, object_id, revision):
    """One listed object's own faces, related ids and original build parameters, for the served source revision."""
    path, _scan = trackview._scan_of(ac, name, revision)
    _path, scan, objects = trackedits.context(ac, name, revision)
    base, separator, number = object_id.rpartition("#")
    entry = objects.get(base)
    if not separator or not number.isdecimal() or entry is None or not 0 <= int(number) < len(entry["kinds"]):
        raise ValueError("This object has no retained build details")
    k = int(number)
    faces = entry["faces"][k]
    meshes = []
    for i in dict.fromkeys(f[0] for f in faces):
        mesh = scan["meshes"][i]
        meshes.append({"name": mesh["name"], "visible": bool(mesh["renderable"]),
                       "triangles": sum(f[2] for f in faces if f[0] == i),
                       "material": trackview._material(scan["materials"][mesh["material"]])})
    parent = entry["parents"][k]
    result = {"id": object_id, "kind": entry["kinds"][k], "sort": entry.get("sorts", entry["kinds"])[k],
              "built_at": entry["at"][k], "parent": f"{base}#{parent}" if parent >= 0 else None,
              "children": [f"{base}#{i}" for i, p in enumerate(entry["parents"]) if p == k],
              "companions": entry.get("with", {}).get(str(k), []), "meshes": meshes,
              "triangles": sum(f[2] for f in faces),
              "details": entry.get("details", [{}] * len(entry["kinds"]))[k]}
    # A build can replace the source while its descriptions are being read.
    trackview._scan_of(ac, name, revision)
    return result


@functools.lru_cache(maxsize=32)
def _thumbnail(ac, name, i, revision, version=""):
    """At most 32 encoded 256 px previews; neither source images nor decoded full-size pixels stay cached."""
    _filename, raw = trackview.texture_bytes(ac, name, i, revision, version)
    with Image.open(io.BytesIO(raw)) as original:
        original.thumbnail((256, 256), Image.Resampling.LANCZOS)
        image = original.convert("RGBA" if "A" in original.getbands() else "RGB")
        output = io.BytesIO()
        image.save(output, "PNG")
        return output.getvalue()


def thumbnail(ac, name, i, revision, version=""):
    """Texture i as a small browser-readable PNG; cached previews still require the requested source to be current."""
    _path, scan = trackview._scan_of(ac, name, revision)
    if not 0 <= i < len(scan["textures"]):
        raise ValueError("No texture with this number")
    result = _thumbnail(ac, name, i, revision, version)
    trackview._scan_of(ac, name, revision)
    return result


@functools.lru_cache(maxsize=32)
def _paint_preview(path, state):
    """Cache only small PNGs of immutable retained colour images, never full decoded photos."""
    with Image.open(path) as original:
        original.thumbnail((256, 256), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        original.save(output, "PNG")
        return output.getvalue()


def paint_preview(ac, name, asset):
    """A retained imported colour preview, independent of the user's library and colour-tile compositor."""
    path, _meta, _size = trackdetail._asset(ac, name, asset)
    stat = path.stat()
    return _paint_preview(str(path), (stat.st_mtime_ns, stat.st_size))


@functools.lru_cache(maxsize=32)
def _saved_image(folder, state, filename, repeat):
    """Find retained metadata for an embedded portable colour, only when no local source recipe exists."""
    for item in sorted(Path(folder).iterdir())[:trackpaint.MAX_PAINTS]:
        if not item.is_dir() or not trackpaint.KEY.fullmatch(item.name):
            continue
        meta = trackpaint._verified(item / "asset.json", item.name)
        if (filename == "map2lap_material_" + meta["image"] + ".dds"
                and all(math.isclose(a, b, rel_tol=1e-5) for a, b in zip(meta["repeat"], repeat))):
            return item.name, meta
    return None


def _appearance_ref(ac, name, revision, scan, ref):
    """Small user-facing metadata for one imported or embedded colour layer."""
    repeat = [256. / value for value in ref["scale"]]
    found = None
    if "asset" in ref:
        folder = trackpaint._resolve(ac, name, "materials", ref["asset"])
        found = ref["asset"], trackpaint._verified(folder / "asset.json", ref["asset"])
    else:
        folder = Path(trackview.kn5_path(ac, name)).parent / trackpaint.BUNDLE / "materials"
        if folder.is_dir():
            found = _saved_image(str(folder), folder.stat().st_mtime_ns, ref["name"], tuple(repeat))
    if found:
        asset, meta = found
        return {"name": meta["name"], "preview": f"/api/editor/{name}/paint-preview/{asset}", "repeat": meta["repeat"],
                "variation": materiallibrary.varies(meta), "original": False}
    return {"name": "Embedded texture", "preview": f"/api/editor/{name}/thumbnail?texture={ref['i']}&r={revision}",
            "repeat": repeat, "variation": ref.get("variation", False), "original": False}


def appearance(ac, name, mesh, u, v, revision, version=""):
    """The dominant displayed colour at the clicked ground point, bound to its immutable displayed version."""
    path, scan = trackview._scan_of(ac, name, revision)
    tx, ty = trackview._surface_tile(scan, mesh)
    material = scan["materials"][scan["meshes"][mesh]["material"]]
    if trackview._prop(material, "m2lUVGlobal", 0) == 1:
        u, v = u - tx, v + ty
    if not all(math.isfinite(q) and lo <= q <= hi for q, lo, hi in ((u, -.01, 1.01), (v, -1.01, .01))):
        raise ValueError("No ground at this texture point")
    base = next((i for i, t in enumerate(scan["textures"]) if trackpaint.GROUND_IMAGE.fullmatch(t[0])
                 and tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(t[0]).groups())) == (tx, ty)), None)
    if base is None:
        raise ValueError("This ground has no retained base image")
    result = {"name": "Original ground", "preview": f"/api/editor/{name}/thumbnail?texture={base}&r={revision}",
              "repeat": None, "variation": False, "original": True, "mixed": False}
    source = trackdetail._source(scan, base)
    if version:
        record, _path, _scan, _filename = trackdetail._view(ac, name, version)
        if record["texture"] != base:
            raise ValueError("The texture version belongs to another ground tile")
        layout = trackdetail.describe(ac, name, version)
        refs, raw, dual = layout["images"], trackdetail.mask(ac, name, version), False
    elif source["images"]:
        refs = [{**ref, "name": scan["textures"][ref["i"]][0]} for ref in source["images"]]
        _filename, offset, size = scan["textures"][source["mask"]]
        raw, dual = trackview._read(path, offset, size, revision), source["kind"] == "dual"
    else:
        return result
    with Image.open(io.BytesIO(raw)) as image:
        if max(image.size) > 2048:
            raise ValueError("The ground selection image is too large")
        col = min(image.width - 1, max(0, int(u * image.width)))
        row = min(image.height - 1, max(0, int((1 + v) * image.height)))
        pixel = image.convert("RGBA").getpixel((col, row))
    weights = [255 - pixel[0]] if dual else [pixel[ref.get("channel", j)] for j, ref in enumerate(refs)]
    if weights and max(weights) > 255 - sum(weights):
        ref = refs[weights.index(max(weights))]
        result.update(_appearance_ref(ac, name, revision, scan, ref))
    # Ignore contributions below about 5% when labelling a soft edge: BC3 rounding alone should not say "mixed".
    result["mixed"] = sum(w > 12 for w in [*weights, max(0, 255 - sum(weights))]) > 1
    trackview._scan_of(ac, name, revision)
    return result
