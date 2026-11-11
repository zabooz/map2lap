"""Masked full-resolution ground colours: small immutable layouts, shared DDS images and native KN5 materials."""
import functools
import gzip
import hashlib
import io
import json
import os
import struct
from dataclasses import replace
from pathlib import Path

import numpy as np
from PIL import Image

from app import materiallibrary, trackpaint, trackview
from track import groundmaterial, kn5
from track.textures import SAVED_WEIGHT_STEP, _is_bc7, bc7_weights, coarse_weights, dds_mipmaps, dds_size, dds_weights, pad_weights, ring_indices, weight_extent

PROFILE = 10
# The Editor shows a painted tile's material borders as AC gets them, at 50 cm a texel (SAVED_WEIGHT_STEP, _preview_step),
# its masks made from the tile's fields directly: a 16th of the pixels (64 tiles of a painted Heiligenblut copy: an Apply
# 50 s at 12.5 cm, most of it the full-size mask, and 1.7 GiB in the browser). Raise it when the Editor's masks are made
# otherwise: a view's kept description is then made again (as for trackregions.BLOCK), a saved track's paints stay saved.
PREVIEW = 2
# A painted tile's Save description kept under its version (_native_layout): raise it when native_descriptors,
# tracknative.palette_regions or mask_keys give another one for the same tile.
NATIVE_PROFILE = 1
BINDINGS_SCHEMA = 1
BINDINGS_FILE = Path("data", "map2lap_ground_layers.json")


def _url(name, kind, key):
    return f"/api/editor/{name}/{kind}/{key}"


def _cache(key, suffix):
    return Path(trackpaint.mytracks.ROOT, "cache", "track-details", f"{PROFILE}_{trackpaint._key(key)}_{suffix}.dds")


def _view(ac, name, version):
    record = trackpaint._read(trackpaint._out("paint-views", version) / "view.json")
    if trackpaint._digest(record) != version:
        raise ValueError("The ground material version is invalid")
    path, scan = trackview._scan_of(ac, name, record["base"])
    filename, offset, size = scan["textures"][record["texture"]]
    if record["source"] != trackpaint._source_digest(path, record["base"], record["texture"], offset, size):
        raise trackview.Unreadable("The ground material belongs to another source")
    return record, path, scan, filename


@functools.lru_cache(maxsize=512)
def _image_info(path, state):
    with Image.open(path) as image:
        return image.size, "A" in image.getbands()


def _asset(ac, name, id):
    trackview.kn5_path(ac, name)
    folder = trackpaint._resolve(ac, name, "materials", id)
    meta = trackpaint._verified(folder / "asset.json", id)
    path = folder / "colour.png"
    if trackpaint._file_digest(path) != meta["image"]:
        raise ValueError("The retained material image has changed")
    stat = path.stat()
    size, alpha = _image_info(str(path), (stat.st_mtime_ns, stat.st_size))
    if alpha:
        raise ValueError("Ground detail materials require an opaque colour image")
    return path, meta, tuple(max(4, dimension) for dimension in size)


def _source(scan, i):
    filename = scan["textures"][i][0]
    name = Path(filename).stem
    indices = [j for j, material in enumerate(scan["materials"]) if material.name == name]
    if not indices:
        raise ValueError("This ground image has no editable material")
    material = scan["materials"][indices[0]]
    maps = {slot: tex for slot, _n, tex in material.maps}
    numbers = {t[0]: j for j, t in enumerate(scan["textures"])}
    required = {"ksPerPixel_dual_layer": ("txDiffuse", "txLayer1_Mask"), "ksMultilayer_objsp": ("txMask", "txDetailA")}
    if any(maps.get(slot) not in numbers for slot in required.get(material.shader, ())):
        raise ValueError("The source ground material has a missing layer image")
    result = {"materials": indices, "global_uv": trackview._prop(material, "m2lUVGlobal", 0) == 1, "images": [],
              "uv_guard": trackview._prop(material, "m2lUVGuard", 0.)}
    if material.shader == "ksPerPixel_dual_layer":
        result.update(kind="dual", mask=numbers[maps["txLayer1_Mask"]])
        scale = trackview._prop(material, "uvMult", 1.)
        result["images"] = [{"i": numbers[maps["txDiffuse"]], "scale": [scale, scale]}]
    elif material.shader == "ksMultilayer_objsp":
        extent = trackview._mask_extent(material)
        result.update(kind="splat", mask=numbers[maps["txMask"]], mask_extent=extent)
        for channel in "RGB":
            texture = maps.get("txDetail" + channel)
            if texture and texture != groundmaterial.WHITE:
                scale = next((list(p[2]) for p in material.props if p[0] == "mult" + channel), [1., 1.])
                result["images"].append({"i": numbers[texture], "scale": [v/e for v,e in zip(scale,extent)], "channel": "RGB".index(channel),
                                         "variation": trackview._prop(material, "m2lVariation" + channel, 0) == 1})
    elif scale := trackview._material(material).get("world_scale"):
        texture = maps.get("txDetailR")
        if texture not in numbers:
            raise ValueError("The source ground material has a missing layer image")
        # The legacy full-surface shader repeats in world metres; objsp repeats against a 256 m tile UV.
        result.update(kind="world", images=[{"i": numbers[texture], "scale": [256. * v for v in scale]}])
    else:
        result["kind"] = "base"
    return result


def _source_image(path, scan, i, revision, mode="RGBA", *, source=None, tile=None, dimensions=None):
    _name, offset, size = scan["textures"][i]
    with Image.open(io.BytesIO(trackview._read(path, offset, size, revision))) as image:
        if max(image.size) > 2304:
            raise ValueError("The source ground selection image is too large")
        if source and source.get('mask_extent', [1,1]) != [1,1]:
            width,height=dimensions
            canvas=image.convert(mode)
            # (a saved mask is coarser than its tile (textures.coarse_weights): back to a texel per tile pixel first, band by
            # band, as its weights are independent, so the phase-locked indices below find the same place, not a repeat)
            size=tuple(round(s*e) for s,e in zip(dimensions,source['mask_extent']))
            if canvas.size!=size:
                canvas=Image.merge(mode,[band.resize(size,Image.Resampling.BILINEAR) for band in canvas.split()])
            xs=(np.arange(width)+tile[0]*width)%canvas.width
            ys=(np.arange(height)+(-tile[1]-1)*height)%canvas.height
            return np.asarray(canvas)[ys[:,None],xs[None,:]]
        return np.array(image.convert(mode))


def _detail(ac, name, asset, meta):
    """Shared linear normal/roughness input descriptor, without decoding the colour photograph."""
    maps = {role: ref for role, ref in meta.get("maps", {}).items() if role in {"normal", "roughness"}}
    if not maps:
        return None
    folder = trackpaint._resolve(ac, name, "materials", asset)
    dimensions = [1, 1]
    for role, ref in maps.items():
        path = folder / (role + ".png")
        if trackpaint._file_digest(path) != ref["sha256"]:
            raise ValueError("The retained material image has changed")
        with Image.open(path) as image:
            dimensions = [max(a, b) for a, b in zip(dimensions, image.size)]
    key = trackpaint._digest(maps)
    return {"name": "map2lap_detail_" + key + ".png", "key": key, "linear": True,
            "size": dds_size(*dimensions, uncompressed=True), "dimensions": dimensions}


def _kn5_digest(path):
    """sha256 of a compiled KN5, the one hash of it that the models' and the ground's records of a Save share."""
    from app import trackmodels
    return trackmodels._file_hash(path)


@functools.lru_cache(maxsize=32)
def _binding_record_at(path, state):
    """Validate one immutable provenance file once, including callers compiling several edited native tiles."""
    record = trackpaint._read(Path(path))
    if record.get("schema") != BINDINGS_SCHEMA or not isinstance(record.get("materials"), dict):
        raise ValueError("This saved ground material binding is not supported")
    if record.get("digest") != trackpaint._digest({k: v for k, v in record.items() if k != "digest"}):
        raise ValueError("The saved ground binding has changed")
    for material, slots in record["materials"].items():
        if not isinstance(material, str) or not isinstance(slots, dict) or set(slots) - set("RGB"):
            raise ValueError("Invalid saved ground binding")
        for asset in slots.values():
            trackpaint._key(asset)
    return record


def _bindings(ac, name, path):
    """Optional compiled slot provenance, valid only for exactly these KN5 bytes; original paints remain authoritative."""
    target = Path(trackview.kn5_path(ac, name)).parent / BINDINGS_FILE
    if not target.is_file():
        return {}
    stat = target.stat()
    record = _binding_record_at(str(target), (stat.st_mtime_ns, stat.st_size))
    if record.get("kn5_sha256") != _kn5_digest(path):
        return {}
    return record["materials"]


def _retained_ref(ac, name, ref, asset, resolved):
    """Resolve a compiled slot to its full portable snapshot, including two assets with the same colour/repeat."""
    if asset not in resolved:
        _path, meta, _dimensions = _asset(ac, name, asset)
        attributes = {"asset": asset, "properties": materiallibrary.properties(meta)}
        detail = _detail(ac, name, asset, meta)
        if detail:
            attributes["detail"] = {**detail, "url": _url(name, "paint-data", asset)}
        resolved[asset] = ("map2lap_material_" + meta["image"] + ".dds", attributes)
    filename, attributes = resolved[asset]
    if ref["name"] != filename:
        raise ValueError("The saved ground slot has another photograph")
    return {**ref, **attributes}


def retained_context(ac, name, path):
    """One validated provenance table and one shared-asset resolution table for an index operation."""
    return _bindings(ac, name, path), {}


def retained_layers(ac, name, path, material_name, layout, context=None):
    """Rebind a transferred native material to portable PBR inputs without requiring its original source/cache."""
    table, resolved = retained_context(ac, name, path) if context is None else context
    bindings = table.get(material_name, {})
    images = []
    for ref in layout["images"]:
        channel = "RGB"[ref["channel"]]
        images.append(_retained_ref(ac, name, ref, trackpaint._key(bindings[channel]), resolved) if channel in bindings else ref)
    return {**layout, "images": images}


def _compiled_bindings(ac, name, path, descriptors, scan):
    """Compile slot provenance from semantic descriptors; existing portable source slots remain bound."""
    result = dict(_bindings(ac, name, path))
    for descriptor in descriptors:
        layout = descriptor.get("layers")
        if layout:
            if "ground" in layout:
                continue
            slots = {"RGB"[ref["channel"]]: ref["asset"] for ref in layout["images"] if "asset" in ref}
            for i in layout["materials"]:
                result[scan["materials"][i].name] = slots
    return result


def binding_size(ac, name, path, descriptors, scan):
    """Exact compiled binding size before writing, using the fixed 64-character SHA256 field."""
    return len(trackpaint._json_bytes({"schema": BINDINGS_SCHEMA, "kn5_sha256": "0" * 64,
                                      "materials": _compiled_bindings(ac, name, path, descriptors, scan), "digest": "0" * 64}))


def write_bindings(ac, name, path, descriptors, scan, target):
    """Write versioned compiled provenance after the copied KN5 and semantic paint bundle are complete."""
    materials = _compiled_bindings(ac, name, path, descriptors, scan)
    if materials:
        record = {"schema": BINDINGS_SCHEMA, "kn5_sha256": _kn5_digest(target), "materials": materials}
        trackpaint._atomic(Path(target).parent / BINDINGS_FILE,
                           trackpaint._json_bytes({**record, "digest": trackpaint._digest(record)}))
    else:
        (Path(target).parent / BINDINGS_FILE).unlink(missing_ok=True)


def _resolved_asset(ac, name, id, resolved):
    """Validate colour and data maps once per descriptor/index operation; never reuse validation across requests."""
    if id not in resolved:
        _path, meta, dimensions = _asset(ac, name, id)
        resolved[id] = (meta, dimensions, _detail(ac, name, id, meta))
    return resolved[id]


def _semantic(ac, name, record, path, scan, filename, resolved=None):
    """Original material composition and retained map metadata, independent of native shader slots."""
    resolved = {} if resolved is None else resolved
    key = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
    source = _source(scan, record["texture"])
    if source["kind"] == "splat":
        source["images"] = retained_layers(ac, name, path, scan["materials"][source["materials"][0]].name,
                                           {"images": [{**ref, "name": scan["textures"][ref["i"]][0]} for ref in source["images"]]})["images"]
    _file, offset, size = scan["textures"][record["texture"]]
    with Image.open(io.BytesIO(trackview._read(path, offset, size, record["base"]))) as base:
        extent = base_extent(scan["materials"][source["materials"][0]])     # (a saved ring canvas: the tile's own size)
        width, height = round(base.width / extent[0]), round(base.height / extent[1])
    if max(width, height) > 2048:
        raise ValueError("Ground detail masks support tile images up to 2048 pixels")
    layers, assets = trackpaint._layers(ac, name, record["base"], record["paints"], key)
    weights, images = {}, {}
    # Last application wins for each original material, including partial regions; older invisible colours use no slot.
    for material in dict.fromkeys(layer[1] for layer in layers):
        claimed = np.zeros((height, width), bool)
        for number, label, raw in reversed(layers):
            if label != material:
                continue
            with Image.open(io.BytesIO(raw)) as encoded:
                if max(encoded.size) > 2048:
                    raise ValueError("The retained ground selection is too large")
                values = np.array(encoded.convert("L").resize((width, height), Image.Resampling.BOX))
            on = (values > 0) & ~claimed
            claimed |= values > 0
            if not on.any():
                continue
            id = Path(assets[number][0]).parent.name
            token = "asset:" + id
            if token not in weights:
                meta, dimensions, detail = _resolved_asset(ac, name, id, resolved)
                images[token] = {"asset": id, "name": "map2lap_material_" + meta["image"] + ".dds", "key": meta["image"],
                                 "url": _url(name, "paint-asset", id), "size": dds_size(*dimensions),
                                 "variation": materiallibrary.varies(meta),
                                 "scale": [256. / v for v in meta["repeat"]], "repeat": list(meta["repeat"]),
                                 "maps": meta.get("maps", {"colour": {"file": "colour.png", "sha256": meta["image"], "colour_space": "srgb"}}),
                                 "properties": materiallibrary.properties(meta)}
                if detail:
                    images[token]["detail"] = detail
                weights[token] = np.zeros((height, width), np.float32)
            weights[token][on] += values[on] / 255.
    coverage = np.minimum(1., sum(weights.values(), np.zeros((height, width), np.float32)))
    if source["images"]:
        old_mask = None if source["kind"] == "world" else _source_image(path, scan, source["mask"], record["base"],
            source=source,tile=key,dimensions=(width,height))
        if old_mask is not None and old_mask.shape[:2] != (height, width):
            old_mask = np.array(Image.fromarray(old_mask).resize((width, height), Image.Resampling.BOX))
        for ref in source["images"]:
            values = (1. if source["kind"] == "world" else
                      1. - old_mask[..., 0] / 255. if source["kind"] == "dual" else old_mask[..., ref["channel"]] / 255.)
            values = (values * (1. - coverage)).astype(np.float32)
            if not values.any():
                continue
            token = f"source:{ref['i']}:{ref.get('channel', 0)}"
            weights[token] = values
            images[token] = {**ref, "name": scan["textures"][ref["i"]][0]}
    total = sum(weights.values(), np.zeros((height, width), np.float32))
    divisor = np.maximum(1., total)
    palette = sorted(weights)
    origin = [0, 0] if source["global_uv"] else [key[0], -key[1]]
    layout = {"base": {"i": record["texture"], "name": filename},
              "images": [{**images[token], "id": token} for token in palette], "source": source,
              "origin": origin, "materials": source["materials"], "dimensions": [width, height]}
    if source["uv_guard"]:      # (the tile's mesh UVs cover only its guarded texture's inside: trackview.tile_uv)
        layout["uv_guard"] = source["uv_guard"]
    if extent != [1., 1.]:      # (a saved copy's tile image on its old mask's ring canvas, sampled where that mask is)
        layout["base_extent"] = extent
    return layout, {token: weights[token] / divisor for token in palette}, coverage


def _compute(ac, name, record, path, scan, filename, composition=None):
    """Encode the existing three-slot colour layout from the shared semantic composition."""
    semantic, weights, _coverage = composition or _semantic(ac, name, record, path, scan, filename)
    return _plain_layout(semantic, weights), _weight_pixels(np.stack(list(weights.values()), axis=-1) if weights else
                                                            np.zeros((*semantic["dimensions"][::-1], 0), np.float32))


def _plain_layout(semantic, weights):
    """The three-slot colour layout of a tile's composition (_semantic), its images by mask channel. Pure."""
    if len(weights) > 3:
        raise ValueError("A 256 m ground tile can use at most three replacement materials; reuse a material or undo a replacement")
    images = [{**{k: v for k, v in image.items() if k not in {"id", "maps", "repeat"}}, "channel": j}
              for j, image in enumerate(semantic["images"])]
    return {**{k: v for k, v in semantic.items() if k not in {"images", "source"}}, "images": images}


def _weight_pixels(values):
    """RGBA8 mask pixels (H, W, 4) of up to three weights (H, W, n) from 0 to 1: each rounded, R, G, B summing to 255 at
    most, A the original ground's rest. Pure."""
    mask = np.zeros((*values.shape[:2], 4), np.uint8)
    for channel in range(values.shape[2]):
        mask[..., channel] = np.rint(values[..., channel] * 255).astype(np.uint8)
    excess = np.maximum(0, mask[..., :3].sum(axis=2).astype(np.int16) - 255)
    for channel in range(3):
        removed = np.minimum(mask[..., channel], excess).astype(np.uint8)
        mask[..., channel] -= removed
        excess -= removed
    mask[..., 3] = 255 - mask[..., :3].sum(axis=2)
    return mask


def _preview_step(width, height):
    """How many of a width × height tile's pixels a side the Editor's mask texel spans: SAVED_WEIGHT_STEP (50 cm on a
    2048 px tile) where both sides divide into 16 of them, so its ring canvas (weight_extent) does too and keeps every UV;
    else 1. Pure."""
    return 1 if any(size % (16 * SAVED_WEIGHT_STEP) for size in (width, height)) else SAVED_WEIGHT_STEP


def _coarse_mask(weights, width, height, tile, step):
    """A tile's mask DDS on its ring canvas (pad_weights) step times coarser: its fields averaged in step × step blocks
    before rounding (_weight_pixels), no full-size mask made; within 2/255 of the full-size one made coarse
    (coarse_weights). weights: {id: (height, width) from 0 to 1}, at most three. Pure."""
    xs, ys = ring_indices(width, height, tile)
    level = np.zeros((len(ys), len(xs), len(weights)), np.float32)
    for channel, values in enumerate(weights.values()):
        level[..., channel] = values[ys[:, None], xs[None, :]]
    ch, cw = level.shape[:2]
    small = level.reshape(ch // step, step, cw // step, step, len(weights)).mean(axis=(1, 3))
    return dds_weights(Image.fromarray(_weight_pixels(small)))


def _regional_inputs(semantic, weights):
    """A tile's composition (_semantic) as the Editor's regional atlases take it (trackregions.compile): at its
    _preview_step, each step × step block of a field averaged. Pure."""
    width, height = semantic["dimensions"]
    step = _preview_step(width, height)
    if step == 1:
        return semantic, weights
    return ({**semantic, "dimensions": [width // step, height // step]},
            {key: values.reshape(height // step, step, width // step, step).mean(axis=(1, 3)) for key, values in weights.items()})


def _keep_weights(version, pixels):
    """Retain derived lossless mask pixels in disposable cache, so DDS requests do not repeat preparation."""
    output = io.BytesIO()
    Image.fromarray(pixels).save(output, "PNG")
    trackpaint._atomic(_cache(version, "weights").with_suffix(".png"), output.getvalue())


def _kept_view(version):
    """A tile's kept description (describe's layers.json) if it is of this PROFILE, PREVIEW and BLOCK, else None."""
    from app import trackregions
    try:
        saved = trackpaint._read(trackpaint._out("paint-views", version) / "layers.json")
    except ValueError:
        return None
    # (the block is the Editor's alone: PROFILE would count every saved painted track as changed, trackedits)
    if (saved.get("profile") == PROFILE and saved.get("preview") == PREVIEW
            and ("ground" not in saved["layout"] or saved.get("block") == trackregions.BLOCK)
            and saved.get("digest") == trackpaint._digest({k: v for k, v in saved.items() if k != "digest"})):
        return saved
    return None


# Below this many tiles to describe, an Apply stays in this process: starting the workers (spawn, each importing the
# modules) costs more than they save. A painted Heiligenblut copy's Apply on 32 cores, from a script: 4 tiles 0.86 s alone,
# 0.78 s with workers; 8 tiles 1.48 -> 0.98 s; 64 tiles 9.8 -> 2.8 s (2026-11-11).
POOL_FROM = 4
_job = {}


def prepare_views(ac, name, versions, processes=None):
    """Describe the tiles of versions whose description is not kept (describe), several at once: an Apply then takes them
    from the cache. A tile a worker fails on, describe makes itself and says why. processes: how many (None: as a build
    may use, as RAM allows, none below POOL_FROM tiles)."""
    from app import settings
    from track import parallel
    todo = [version for version in dict.fromkeys(versions) if _kept_view(version) is None]
    if processes is None:
        cores = max(1, round((os.cpu_count() or 2) * settings.load()["cores"] / 100))
        processes = 1 if len(todo) < POOL_FROM else min(parallel.workers(len(todo)), cores)
    if processes <= 1 or not todo:
        return
    with parallel.pool(processes, _init_views, ((trackpaint.mytracks.ROOT, materiallibrary.ROOT), ac, name)) as pool:
        for job in [pool.submit(_describe_view, version) for version in todo]:
            try:
                job.result()
            except Exception:       # (describe makes that tile itself, and says what went wrong)
                pass


def _init_views(roots, ac, name):
    """A prepare_views worker's state: its parent's roots (a test's) and the track."""
    trackpaint.mytracks.ROOT, materiallibrary.ROOT = roots
    _job.update(ac=ac, name=name)


def _describe_view(version):
    describe(_job["ac"], _job["name"], version)


def describe(ac, name, version, resolved=None):
    """Small immutable layout; cached metadata avoids pixel work on repeated PUTs and index reads."""
    from app import trackregions
    record, path, scan, filename = _view(ac, name, version)
    resolved = {} if resolved is None else resolved
    target = trackpaint._out("paint-views", version) / "layers.json"
    saved = _kept_view(version)
    if saved is not None:
        for ref in saved["layout"]["images"]:
            if "asset" in ref:
                _resolved_asset(ac, name, ref["asset"], resolved)
        return _with_urls(name, version, saved["layout"])
    composition = _semantic(ac, name, record, path, scan, filename, resolved)
    if len(composition[1]) > 3:
        semantic, weights, _coverage = composition
        def store(key, raw):
            trackpaint._atomic(_cache(key, "region").with_suffix(".r16"), raw)
        ground = trackregions.compile(*_regional_inputs(semantic, weights), version, store)
        key = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
        ground["uv_origin"] = [key[0], -key[1]] if semantic["source"]["global_uv"] else [0, 0]
        layout = {k: v for k, v in semantic.items() if k not in {"source", "dimensions"}}
        layout.update(ground=ground, mask={"name": "regional", "size": 0})
        saved = {"profile": PROFILE, "preview": PREVIEW, "block": trackregions.BLOCK, "layout": layout}
        trackpaint._atomic(target, trackpaint._json_bytes({**saved, "digest": trackpaint._digest(saved)}))
        return _with_urls(name, version, layout)
    semantic, weights, _coverage = composition
    layout = _plain_layout(semantic, weights)
    width, height = layout.pop("dimensions")
    layout['mask_extent'] = list(weight_extent(width,height))
    layout['mask_origin'] = layout['origin']
    cw,ch=(round(size*extent) for size,extent in zip((width,height),layout['mask_extent']))
    step = _preview_step(width, height)
    layout["mask"] = {"name": "map2lap_mask_" + version + ".dds", "key": version, "linear": True,
                      "size": dds_size(cw // step, ch // step, uncompressed=True), **({"step": step} if step > 1 else {})}
    for ref in layout["images"]:
        ref.pop("url", None)
    if step > 1:
        tile = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
        raw = _coarse_mask(weights, width, height, tile, step)
        trackpaint._atomic(_mask_target(version, layout), raw)
    else:
        pixels = _weight_pixels(np.stack(list(weights.values()), axis=-1) if weights else np.zeros((height, width, 0), np.float32))
        raw = pixels.tobytes()
        _keep_weights(version, pixels)
    saved = {"profile": PROFILE, "preview": PREVIEW, "layout": layout, "dimensions": [width, height],
             "mask_hash": hashlib.sha256(raw).hexdigest()}
    trackpaint._atomic(target, trackpaint._json_bytes({**saved, "digest": trackpaint._digest(saved)}))
    return _with_urls(name, version, layout)


def _mask_target(version, layout):
    """Where a plain layout's mask DDS is kept: one at the saved step (_coarse_mask) apart from a full-size one. Pure."""
    step = layout["mask"].get("step", 1)
    return _cache(version, "mask" if step == 1 else f"mask{step}")


def _with_urls(name, version, layout):
    """Bind retained content to this track's endpoints; a saved copy may outlive the original track. Pure."""
    bundles = _weight_offsets(name, version, layout)
    return {**layout,
            **({"ground": {**layout["ground"], "passes": [{**p, "weight": {**p["weight"],
                "url": f"/api/editor/{name}/paint-region/{version}/{p['weight']['key']}",
                **({"bundle": bundles[p['weight']['key']]} if p['weight']['size'] else {})}} for p in layout["ground"]["passes"]]}}
               if "ground" in layout else {}),
            "mask": {**layout["mask"], "url": _url(name, "paint-mask", version)},
            "images": [{**ref, **({"url": _url(name, "paint-asset", ref["asset"])} if "asset" in ref else {}),
                        **({"detail": {**ref["detail"], "url": _url(name, "paint-data", ref["asset"])}} if "detail" in ref else {})}
                       for ref in layout["images"]]}


def _weight_offsets(name, version, layout):
    """Byte offsets of unique nonconstant atlases in descriptor order. Pure."""
    offsets, size = {}, 0
    for part in layout.get("ground", {}).get("passes", []):
        ref = part["weight"]
        if ref["size"] and ref["key"] not in offsets:
            offsets[ref["key"]] = {"offset": size}
            size += ref["size"]
    return {key: {**ref, "size": size, "url": _url(name, "paint-weights", version)} for key, ref in offsets.items()}


def weight_bundle(ac, name, version):
    """Gzip one tile's existing regional atlas bytes, preserving every stored mip bit."""
    from app import trackregions
    _view(ac, name, version)  # Validate the track/source even when the compressed transfer is cached.
    target = _cache(version, f"bundle{trackregions.BLOCK}_{PREVIEW}").with_suffix(".gz")
    if not target.is_file():
        layout = describe(ac, name, version)
        output = io.BytesIO()
        with gzip.GzipFile(fileobj=output, mode="wb", compresslevel=1, mtime=0) as zipped:
            for key in _weight_offsets(name, version, layout):
                path = _cache(key, "region").with_suffix(".r16")
                raw = path.read_bytes() if path.is_file() else region_image(ac, name, version, key)
                zipped.write(raw)
        trackpaint._atomic(target, output.getvalue())
    return target.read_bytes()


def compressed_mask(ac, name, version):
    """Cache gzip of the unchanged RGBA DDS, including its independently filtered mips."""
    _view(ac, name, version)
    target = _cache(version, f"mask_{PREVIEW}").with_suffix(".dds.gz")     # (the mask at the saved step or full size: mask)
    if not target.is_file():
        trackpaint._atomic(target, gzip.compress(mask(ac, name, version), compresslevel=1, mtime=0))
    return target.read_bytes()


@functools.lru_cache(maxsize=128)
def _region_keys_at(path, state):
    """Small ownership sets per immutable descriptor revision, not another copy of all pass metadata."""
    saved=trackpaint.json.loads(Path(path).read_bytes())
    if saved.get('profile')!=PROFILE or saved.get('digest')!=trackpaint._digest({k:v for k,v in saved.items() if k!='digest'}):
        raise ValueError('The regional ground descriptor has changed')
    return frozenset(p['weight']['key'] for p in saved['layout'].get('ground',{}).get('passes',[]))


def region_image(ac, name, version, key):
    """One immutable regional R16F atlas, reconstructed from retained original inputs after cache eviction."""
    trackpaint._key(key)
    record,path,scan,filename=_view(ac,name,version)
    manifest=trackpaint._out('paint-views',version)/'layers.json'
    try:
        stat=manifest.stat()
    except FileNotFoundError:
        describe(ac,name,version)
        stat=manifest.stat()
    keys=_region_keys_at(str(manifest),(stat.st_ino,stat.st_mtime_ns,stat.st_ctime_ns,stat.st_size))
    if key not in keys:
        raise ValueError("This region does not belong to the ground version")
    target = _cache(key, "region").with_suffix(".r16")
    if not target.is_file():
        with trackpaint._rendering:
            if not target.is_file():
                from app import trackregions
                semantic, weights, _coverage = _semantic(ac, name, record, path, scan, filename)
                trackregions.compile(*_regional_inputs(semantic, weights), version,
                    lambda token, raw: trackpaint._atomic(_cache(token, "region").with_suffix(".r16"), raw))
    return target.read_bytes()


def detail_image(ac, name, asset):
    """Portable +Y tangent normal RGB and linear roughness A, each source retained unchanged."""
    _path, meta, _size = _asset(ac, name, asset)
    descriptor = _detail(ac, name, asset, meta)
    if descriptor is None:
        raise ValueError("This material has no normal or roughness map")
    target = _cache(descriptor["key"], "data").with_suffix(".png")
    if not target.is_file():
        folder = trackpaint._resolve(ac, name, "materials", asset)
        size = tuple(descriptor["dimensions"])
        bands = [Image.new("L", size, value) for value in (128, 128, 255, 255)]
        for role in ("normal", "roughness"):
            if role not in meta["maps"]:
                continue
            with Image.open(folder / (role + ".png")) as image:
                channels = image.convert("RGB").split() if role == "normal" else [image.convert("RGB").getchannel("R")]
                resized = [band.resize(size, Image.Resampling.BILINEAR) for band in channels]
                if role == "normal":
                    bands[:3] = resized
                else:
                    bands[3] = resized[0]
        output = io.BytesIO()
        Image.merge("RGBA", bands).save(output, "PNG")
        trackpaint._atomic(target, output.getvalue())
    return target.read_bytes()


def image(ac, name, asset):
    """One shared full-resolution opaque DDS, encoded lazily from the retained normalized image."""
    path, meta, size = _asset(ac, name, asset)
    target = _cache(meta["image"], "colour")
    if target.is_file():
        return target.read_bytes()
    with trackpaint._rendering:
        if not target.is_file():
            with Image.open(path) as colour:
                if colour.size != size:
                    colour = colour.resize(size, Image.Resampling.LANCZOS)
                trackpaint._atomic(target, dds_mipmaps(colour, smallest=1))
        return target.read_bytes()


def mask(ac, name, version):
    """One immutable RGBA weight DDS, shared by preview and Save; regenerate an evicted cache without the library."""
    record, path, scan, filename = _view(ac, name, version)
    layout = describe(ac, name, version)
    target = _mask_target(version, layout)
    if target.is_file():
        return target.read_bytes()

    with trackpaint._rendering:
        if not target.is_file() and "step" in layout["mask"]:
            saved = trackpaint._read(trackpaint._out("paint-views", version) / "layers.json")
            semantic, weights, _coverage = _semantic(ac, name, record, path, scan, filename)
            width, height = saved["dimensions"]
            tile = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
            raw = _coarse_mask(weights, width, height, tile, layout["mask"]["step"])
            if hashlib.sha256(raw).hexdigest() != saved["mask_hash"]:
                raise ValueError("The retained ground selection has changed")
            trackpaint._atomic(target, raw)
        if not target.is_file():
            saved = trackpaint._read(trackpaint._out("paint-views", version) / "layers.json")
            weights = _cache(version, "weights").with_suffix(".png")
            if weights.is_file():
                with Image.open(weights) as image:
                    if list(image.size) != saved["dimensions"]:
                        raise ValueError("The cached ground selection has another size")
                    raw = image.tobytes()
            else:
                _layout, pixels = _compute(ac, name, record, path, scan, filename)
                raw = pixels.tobytes()
                _keep_weights(version, pixels)
            if hashlib.sha256(raw).hexdigest() != saved["mask_hash"]:
                raise ValueError("The retained ground selection has changed")
            width, height = saved["dimensions"]
            pixels = Image.frombytes("RGBA", (width, height), raw)
            tile=tuple(map(int,trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
            trackpaint._atomic(target, dds_weights(pad_weights(pixels,tile)))
        return target.read_bytes()


def _mask_pixel(path, offset, size, u, v, tile, extent):
    """Read one canonical tile-UV pixel; uncompressed masks need only a header and four bytes."""
    with open(path,'rb') as file:
        file.seek(offset); header=file.read(min(128,size))
        if header[:4]==b'DDS ' and len(header)==128 and struct.unpack_from('<I',header,88)[0]==32 and not (struct.unpack_from('<I',header,80)[0]&4):
            height,width=struct.unpack_from('<2I',header,12)
            if not (0 < width <= 2304 and 0 < height <= 2304 and 128+width*height*4 <= size):
                raise ValueError('The ground selection image has invalid dimensions')
            if extent != [1.,1.]:
                # The padding is rotated into world phase; never clamp these global coordinates.
                col=int(((u+tile[0])/extent[0]%1)*width)%width
                row=int(((v-tile[1])/extent[1]%1)*height)%height
            else:
                col=min(width-1,max(0,int(u*width))); row=min(height-1,max(0,int((1+v)*height)))
            file.seek(offset+128+(row*width+col)*4)
            packed=int.from_bytes(file.read(4),'little')
            masks=struct.unpack_from('<4I',header,92)
            return tuple((packed&m)>>((m&-m).bit_length()-1) if m else 255 for m in masks)
        # Older dual-layer/DXT tracks retain their original decoding path.
        file.seek(offset); raw=file.read(size)
    with Image.open(io.BytesIO(raw)) as image:
        if max(image.size)>2304: raise ValueError('The ground selection image is too large')
        col=min(image.width-1,max(0,int(u*image.width)))
        row=min(image.height-1,max(0,int((1+v)*image.height)))
        return image.convert('RGBA').getpixel((col,row))


def sample_mask(ac,name,version,u,v):
    """One RGBA weight at canonical local u=[0,1], v=[-1,0], without decoding the full mask."""
    record,path,scan,filename=_view(ac,name,version)
    layout=describe(ac,name,version)
    target=_mask_target(version,layout)
    if not target.is_file(): mask(ac,name,version)
    tile=tuple(map(int,trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
    return _mask_pixel(target,0,target.stat().st_size,u,v,tile,layout.get('mask_extent',[1.,1.]))


def sample_source_mask(path,scan,source,revision,u,v,tile):
    """One embedded source-mask RGBA weight at canonical local tile UV, including padded cold saves."""
    _filename,offset,size=scan['textures'][source['mask']]
    return _mask_pixel(path,offset,size,u,v,tile,source.get('mask_extent',[1.,1.]))


def native_descriptors(ac, name, descriptors, keys=True):
    """Select real native PBR output even for one to three materials, independently of the browser adapter. keys: also
    keep what tracknative.build reads of a tile, for an export to need its weight fields only for a mask not kept."""
    result, resolved = [], {}
    for descriptor in descriptors:
        if _native(descriptor.get("layers", {})):
            descriptor = {**descriptor, "layers": _native_layout(ac, name, descriptor, keys, resolved)}
        result.append(descriptor)
    return result


def _native(layout):
    """Whether a painted tile of this layout is saved as regional native ground (tracknative.build): a ground layout, or an
    image with a detail map or a roughness. Pure."""
    pbr = any("detail" in ref or ref.get("properties", {}).get("roughness", 1.) != 1. for ref in layout.get("images", []))
    return pbr or "ground" in layout


def _native_stamp(descriptor, keys):
    """What a kept _native_layout must have been made with. Pure."""
    from app import tracknative
    return {"profile": NATIVE_PROFILE, "masks": tracknative.MASK_CACHE_VERSION, "keys": keys,
            "layout": trackpaint._digest(descriptor.get("layers", {}))}


def _kept_native(descriptor, keys):
    """The layout _native_layout kept for this painted tile, a copy, or None if none or one made otherwise."""
    try:
        saved = trackpaint._read(trackpaint._out("paint-views", descriptor["version"]) / "native.json")
    except ValueError:
        return None
    return json.loads(json.dumps(saved["layout"])) if saved.get("stamp") == _native_stamp(descriptor, keys) else None     # (a copy: the read is shared)


def _native_layout(ac, name, descriptor, keys, resolved, read=None):
    """A painted tile's layout as native_descriptors gives it, kept beside its view's layers.json: the version covers the tile's
    source image, the track's state and its paints, so a Save that changed nothing there reads none of its fields (99 tiles of
    a painted Heiligenblut copy: 9 s a Save). Read back as JSON either way, so a kept and a new one are alike. read: what
    _semantic gives for the tile, when its caller reads it anyway (tracknative.prepare)."""
    from app import tracknative
    kept = _kept_native(descriptor, keys)
    if kept is not None:
        return kept
    layout, stamp = descriptor.get("layers", {}), _native_stamp(descriptor, keys)
    target = trackpaint._out("paint-views", descriptor["version"]) / "native.json"
    record, path, scan, filename = _view(ac, name, descriptor["version"])
    semantic, weights, _coverage = read() if read else _semantic(ac, name, record, path, scan, filename, resolved)
    if "ground" not in layout:
        tile = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
        # Only what tracknative reads of "ground": the browser's passes and atlases (trackregions.compile) aren't.
        ground = {"dimensions": semantic["dimensions"], "uv_origin": [tile[0], -tile[1]] if semantic["source"]["global_uv"] else [0, 0]}
        layout = {**{k: v for k, v in semantic.items() if k not in {"source", "dimensions"}}, "ground": ground}
    else:       # (the browser's atlases are at the saved step (_regional_inputs), the fields AC's masks are made of at the tile's own size)
        layout = {**layout, "ground": {**layout["ground"], "dimensions": semantic["dimensions"]}}
    fields = tracknative.with_base(weights)
    layout = {**layout, "native_regions": tracknative.palette_regions(fields)}
    if keys:
        layout = {**layout, "native_tile": {k: semantic[k] for k in ("images", "base", "dimensions")},
                  "native_mask_keys": tracknative.mask_keys(fields, layout["native_regions"], layout)}
    raw = trackpaint._json_bytes({"stamp": stamp, "layout": layout})
    trackpaint._atomic(target, raw)
    return json.loads(raw)["layout"]


def save_size(descriptors, scan, path, kept=None):
    """Preflight shared photographs/data maps and bounded native masks/geometry before output is allocated. kept: the track's
    tracknative._mask_folder, whose region copies of its last Save are counted, not clipped again."""
    known = {t[0] for t in scan["textures"]}
    sizes = {}
    for descriptor in descriptors:
        layout = descriptor.get("layers")
        if not layout:
            continue
        if "ground" in layout:
            from app import tracknative
            for ref in layout["images"]:
                if not ref["id"].startswith("asset:"):
                    continue
                sizes.setdefault(ref["name"], ref.get("size", 2048 * 2048 * 4) * 8 + 65536)
                if "detail" in ref:
                    key = ref["detail"]["key"] + trackpaint._digest(ref.get("properties", {}))
                    sizes.setdefault(key, ref["detail"]["size"] + 65536)
            sizes[layout["base"]["name"] + ":native"] = tracknative.save_size(layout, scan, path, kept)
            continue
        for ref in layout["images"]:
            if ref["name"] not in known:
                sizes[ref["name"]] = ref["size"]
        # The mask is written at the saved step and as BC7 (bc7_weights): a byte per pixel of a step² th of the full-size
        # lossless RGBA8 mask's pixels; the tile image on the mask's canvas as BC3 at most (ringed_base), a byte per pixel.
        step = layout["mask"].get("step", 1)
        sizes[layout["mask"]["name"]] = layout["mask"]["size"] * step ** 2 // (4 * SAVED_WEIGHT_STEP ** 2) + 256
        sizes[layout["base"]["name"] + ":ring"] = layout["mask"]["size"] * step ** 2 // 4 + 256
    return sum(sizes.values()) + sum(len(raw) for name, raw in groundmaterial.textures() if name not in known)


def base_extent(material):
    """The ring canvas of a saved tile image (ringed_base) to the tile's own size; [1, 1] for an image of the tile alone. Pure."""
    return next((list(p[2]) for p in material.props if p[0] == "m2lBaseExtent"), [1., 1.])


def tile_base(raw, material, tile):
    """A ground tile's image over exactly its 256 m (H, W, 4 uint8) from its encoded texture: a guarded build's inside
    (groundmaterial.UV_GUARD) stretched back over the whole tile, a saved ring canvas unrolled. Pure."""
    with Image.open(io.BytesIO(raw)) as image:
        pixels = np.array(image.convert("RGBA"))
    extent = base_extent(material)
    if extent != [1., 1.]:
        height, width = round(pixels.shape[0] / extent[1]), round(pixels.shape[1] / extent[0])
        xs = (np.arange(width) + tile[0] * width) % pixels.shape[1]
        ys = (np.arange(height) + (-tile[1] - 1) * height) % pixels.shape[0]
        return pixels[ys[:, None], xs[None, :]]
    guard = trackview._prop(material, "m2lUVGuard", 0.)
    if guard:
        height, width = pixels.shape[:2]
        gx, gy = round(guard * width), round(guard * height)
        return np.array(Image.fromarray(pixels[gy:height - gy, gx:width - gx]).resize((width, height), Image.Resampling.LANCZOS))
    return pixels


def ringed_base(pixels, tile, filename, bc7=False):
    """The tile image on the same world-phase ring canvas as its saved mask (pad_weights), in filename's format, a DDS as
    BC7 with bc7 (a tile with roads: textures.dds_mipmaps). Pure.
    The edited material samples image and mask at one UV; the ring keeps the opposite tile edge out of AC's repeating
    filter, as the build's guard does (scenery/ground.py)."""
    alpha = bool((pixels[..., 3] < 255).any())      # (an opaque tile stays BC1 / RGB, half the size of BC3)
    image = pad_weights(Image.fromarray(pixels), tile)
    if filename.lower().endswith(".dds"):
        return dds_mipmaps(image, alpha=alpha, smallest=1, bc7=bc7)
    output = io.BytesIO()
    if filename.lower().endswith(".png"):
        image.convert("RGBA" if alpha else "RGB").save(output, "PNG")
    else:
        image.convert("RGB").save(output, "JPEG", quality=95, subsampling=0)
    return output.getvalue()


def saved(ac, name, revision, descriptors, scan, change, path, added=()):
    """Prepare native material tables/images and integer UV origins, preserving every position and triangle."""
    materials, resources = list(scan["materials"]), {}
    descriptors = list(descriptors)
    regional = [d for d in descriptors if "ground" in d.get("layers", {})]
    from app import tracknative
    inherited=tracknative.inherited(ac,name,path)
    restore={i:flag for i,m in enumerate(scan['meshes']) if (flag:=inherited.get('render_sources',{}).get(m['name'])) is not None}
    native_config, owned, native_files = "", set(), {'renderable':restore}
    if regional:
        from app import tracknative
        materials, resources, added, native_config, owned, native_files = tracknative.build(ac, name, regional, scan, change, path, added)
    present = {t[0] for t in scan["textures"]}
    origins, ringed = {}, {}
    for descriptor in descriptors:
        layout = descriptor.get("layers")
        if not layout:
            continue
        if "ground" in layout:
            continue
        # (AC gets it at 50 cm a texel and as BC7: a 16th of the pixels, a quarter of the bytes each; the Editor's is at that
        # step already where its tile divides (_preview_step), else coarse_weights leaves it as it is)
        shown = mask(ac, name, descriptor["version"])
        resources[layout["mask"]["name"]] = bc7_weights(shown if "step" in layout["mask"] else coarse_weights(shown))
        for ref in layout["images"]:
            if "asset" in ref:
                resources[ref["name"]] = image(ac, name, ref["asset"])
        base = layout["base"]["name"]
        tile = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(base).groups()))
        _name, offset, size = scan["textures"][layout["base"]["i"]]
        # (the tile image of the source; it replaces the old one under its name, so there is no second copy)
        raw = trackview._read(path, offset, size, revision)
        ringed[base] = ringed_base(tile_base(raw, materials[layout["materials"][0]], tile), tile, base, bc7=_is_bc7(raw))
        for i in layout["materials"]:
            original = materials[i]
            extent = layout.get('mask_extent',[1.,1.])
            props = [p for p in original.props if p[0] not in {"multR", "multG", "multB", "multA", "magicMult", "uvMult", "m2lUVGlobal", "m2lMaskExtent",
                                                             "m2lVariationR", "m2lVariationG", "m2lVariationB", "m2lUVGuard", "m2lBaseExtent"}]
            props.extend([(f"mult{channel}", 1., tuple(v*e for v,e in zip(layout["images"][j]["scale"],extent)) if j < len(layout["images"]) else tuple(extent),
                           (0., 0., 0.), (0., 0., 0., 0.)) for j, channel in enumerate("RGB")])
            props += [("multA", 1., (1., 1.), (0., 0., 0.), (0., 0., 0., 0.)),     # (the ring canvas is the mask's)
                      ("m2lMaskExtent", 1., tuple(extent), (0., 0., 0.), (0., 0., 0., 0.)),
                      ("m2lBaseExtent", 1., tuple(extent), (0., 0., 0.), (0., 0., 0., 0.)),
                      ("magicMult", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)),
                      ("m2lUVGlobal", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))]
            props.extend(("m2lVariation" + channel, float(j < len(layout["images"]) and layout["images"][j].get("variation", False)),
                          (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)) for j, channel in enumerate("RGB"))
            maps = [("txDiffuse", 0, groundmaterial.WHITE), ("txMask", 1, layout["mask"]["name"])]
            maps.extend(("txDetail" + channel, j + 2, layout["images"][j]["name"] if j < len(layout["images"]) else groundmaterial.WHITE)
                        for j, channel in enumerate("RGB"))
            maps.append(("txDetailA", 5, layout["base"]["name"]))
            materials[i] = replace(original, shader="ksMultilayer_objsp", props=props, maps=maps)
            origins[i] = (layout["origin"], extent, trackview._mask_extent(original), trackview._prop(original, "m2lUVGuard", 0.))
    def finish(table, moved):
        referenced = {n for m in materials for _slot, _i, n in m.maps}
        images = [(n, raw) for n, raw in resources.items() if n not in present and (n not in owned or n in referenced)]
        # (a ringed tile image takes the old one's place and number: paint records name the tile image by its number)
        return table, images, moved, added, native_config, (owned - referenced) & present, {**native_files, "replace": ringed}
    if not origins:
        return finish(materials if regional else None, change)
    resources.update(groundmaterial.textures())
    vertices = dict(change.vertices)
    with open(path, "rb") as file:
        for i, mesh in enumerate(scan["meshes"]):
            transform = origins.get(mesh["material"])
            if transform is None:
                continue
            offset,extent,previous,guard = transform
            data = vertices[i].copy() if i in vertices else kn5.mesh_arrays(file, mesh)[0]
            uv = np.array(trackview.tile_uv(data["uv"][:, 0], data["uv"][:, 1], guard, False, 0, 0)).T
            data["uv"] = (uv * previous + offset) / extent
            vertices[i] = data
    return finish(materials, kn5.Moved(vertices, change.grow, change.points))
