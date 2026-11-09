"""Read-only details and small texture previews for one Editor selection."""
import functools
import io
import math
import struct
from pathlib import Path

from PIL import Image

from app import materiallibrary, trackdetail, trackedits, trackpaint, trackview


def statistics(ac, name):
    """Measure the current KN5 and estimate the draft on demand, without writing or a save staging folder."""
    current = Path(trackview.kn5_path(ac, name)).stat().st_size
    draft = trackedits.load(ac, name)
    changed = trackedits.changes(ac, name) > 0
    result = {'current_bytes': current, 'draft_bytes': current, 'estimated': bool(changed)}
    if not changed:
        return result
    try:
        path, scan, _objects = trackedits.context(ac, name, draft['base'])
        source = trackview._scan_of(ac, name, draft['base'])[1]
        added = scan['meshes'][len(source['meshes']):]
        size = Path(path).stat().st_size + sum(128 + len(m['name'].encode()) + m['vertices'] * 44 + m['indices'] * 2 for m in added)
        size += sum(len(raw) for raw in scan.get('model_images', {}).values())
        if draft['paints']:
            descriptors = trackpaint.descriptors(ac, name, draft['base'], draft['paints'])
            native = trackdetail.native_descriptors(ac, name, descriptors)
            size += trackdetail.save_size(native, source, path)
        result['draft_bytes'] = size
    except (ValueError, OSError, trackview.Unreadable) as error:
        result.update(draft_bytes=None, error=str(error))
    return result


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


def _regional_at(ac, name, version, layout, u, v):
    """Read only the cached level-zero atlases covering the clicked texel, never recompose the tile."""
    ground = layout["ground"]
    width, height = ground["dimensions"]
    col, row = min(width - 1, max(0, int(u * width))), min(height - 1, max(0, int((1 + v) * height)))
    x, y = (col + .5) / width, (row + .5) / height
    values = [0.] * len(layout["images"])
    for part in ground["passes"]:
        left, top, right, bottom = part["bounds"]
        if part["first"] != 0 or part["image"] < 0 or not (left <= x < right and top <= y < bottom):
            continue
        frame = part["frames"][0]
        if "constant" in frame:
            value = frame["constant"]
        else:
            raw = trackdetail.region_image(ac, name, version, part["weight"]["key"])
            magic, columns, rows = struct.unpack_from("<4sII", raw)
            px = col - frame["source"][0] + frame["atlas"][0]
            py = row - frame["source"][1] + frame["atlas"][1]
            if magic != b"M2GW" or len(raw) != 12 + columns * rows * 2 or not (0 <= px < columns and 0 <= py < rows):
                raise ValueError("Invalid ground weight atlas")
            value = struct.unpack_from("<e", raw, 12 + (py * columns + px) * 2)[0]
        values[part["image"]] += value
    return values


def appearance(ac, name, mesh, u, v, revision, version=""):
    """The dominant displayed colour at the clicked ground point, bound to its immutable displayed version."""
    path, scan = trackview._scan_of(ac, name, revision)
    tx, ty = trackview._surface_tile(scan, mesh)
    material = scan["materials"][scan["meshes"][mesh]["material"]]
    u, v = trackview.material_uv(material, tx, ty, u, v)
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
        if "ground" in layout:
            weights = _regional_at(ac, name, version, layout, u, v)
            residual = max(0., 1. - sum(weights))
            if weights and max(weights) > residual:
                result.update(_appearance_ref(ac, name, revision, scan, layout["images"][weights.index(max(weights))]))
            result["mixed"] = sum(value > .05 for value in [*weights, residual]) > 1
            trackview._scan_of(ac, name, revision)
            return result
        refs, dual = layout["images"], False
        pixel = trackdetail.sample_mask(ac, name, version, u, v)
    elif source["images"]:
        refs = [{**ref, "name": scan["textures"][ref["i"]][0]} for ref in source["images"]]
        if source["kind"] == "world":
            result.update(_appearance_ref(ac, name, revision, scan, refs[0]))
            trackview._scan_of(ac, name, revision)
            return result
        dual = source["kind"] == "dual"
        pixel = trackdetail.sample_source_mask(path, scan, source, revision, u, v, (tx, ty))
    else:
        return result
    weights = [255 - pixel[0]] if dual else [pixel[ref.get("channel", j)] for j, ref in enumerate(refs)]
    if weights and max(weights) > 255 - sum(weights):
        ref = refs[weights.index(max(weights))]
        result.update(_appearance_ref(ac, name, revision, scan, ref))
    # Ignore contributions below about 5% when labelling a soft edge: BC3 rounding alone should not say "mixed".
    result["mixed"] = sum(w > 12 for w in [*weights, max(0, 255 - sum(weights))]) > 1
    trackview._scan_of(ac, name, revision)
    return result
