"""Masked full-resolution ground colours: small immutable layouts, shared DDS images and native KN5 materials."""
import functools
import hashlib
import io
from dataclasses import replace
from pathlib import Path

import numpy as np
from PIL import Image

from app import materiallibrary, trackpaint, trackview
from track import groundmaterial, kn5
from track.textures import dds_mipmaps, dds_size, dds_weights

PROFILE = 4


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
    result = {"materials": indices, "global_uv": trackview._prop(material, "m2lUVGlobal", 0) == 1, "images": []}
    if material.shader == "ksPerPixel_dual_layer":
        result.update(kind="dual", mask=numbers[maps["txLayer1_Mask"]])
        scale = trackview._prop(material, "uvMult", 1.)
        result["images"] = [{"i": numbers[maps["txDiffuse"]], "scale": [scale, scale]}]
    elif material.shader == "ksMultilayer_objsp":
        result.update(kind="splat", mask=numbers[maps["txMask"]])
        for channel in "RGB":
            texture = maps.get("txDetail" + channel)
            if texture and texture != groundmaterial.WHITE:
                scale = next((list(p[2]) for p in material.props if p[0] == "mult" + channel), [1., 1.])
                result["images"].append({"i": numbers[texture], "scale": scale, "channel": "RGB".index(channel),
                                         "variation": trackview._prop(material, "m2lVariation" + channel, 0) == 1})
    else:
        result["kind"] = "base"
    return result


def _source_image(path, scan, i, revision, mode="RGBA"):
    _name, offset, size = scan["textures"][i]
    with Image.open(io.BytesIO(trackview._read(path, offset, size, revision))) as image:
        if max(image.size) > 2048:
            raise ValueError("The source ground selection image is too large")
        return np.array(image.convert(mode))


def _compute(ac, name, record, path, scan, filename):
    key = tuple(map(int, trackpaint.GROUND_IMAGE.fullmatch(filename).groups()))
    source = _source(scan, record["texture"])
    _file, offset, size = scan["textures"][record["texture"]]
    with Image.open(io.BytesIO(trackview._read(path, offset, size, record["base"]))) as base:
        width, height = base.size
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
                if len(weights) == 3:
                    raise ValueError("A 256 m ground tile can use at most three replacement materials; reuse a material or undo a replacement")
                _asset_path, meta, dimensions = _asset(ac, name, id)
                images[token] = {"asset": id, "name": "map2lap_material_" + meta["image"] + ".dds", "key": meta["image"],
                                 "url": _url(name, "paint-asset", id), "size": dds_size(*dimensions),
                                 "variation": materiallibrary.varies(meta),
                                 "scale": [256. / v for v in meta["repeat"]]}
                weights[token] = np.zeros((height, width), np.float32)
            weights[token][on] += values[on] / 255.
    coverage = np.minimum(1., sum(weights.values(), np.zeros((height, width), np.float32)))
    if source["images"]:
        old_mask = _source_image(path, scan, source["mask"], record["base"])
        if old_mask.shape[:2] != (height, width):
            old_mask = np.array(Image.fromarray(old_mask).resize((width, height), Image.Resampling.BOX))
        for ref in source["images"]:
            values = (1. - old_mask[..., 0] / 255.) if source["kind"] == "dual" else old_mask[..., ref["channel"]] / 255.
            values = (values * (1. - coverage)).astype(np.float32)
            if not values.any():
                continue
            token = f"source:{ref['i']}:{ref.get('channel', 0)}"
            weights[token] = values
            images[token] = {**ref, "name": scan["textures"][ref["i"]][0]}
    if len(weights) > 3:
        raise ValueError("A 256 m ground tile can use at most three replacement materials; reuse a material or undo a replacement")
    total = sum(weights.values(), np.zeros((height, width), np.float32))
    divisor = np.maximum(1., total)
    mask = np.zeros((height, width, 4), np.uint8)
    palette = sorted(weights)
    for channel, token in enumerate(palette):
        mask[..., channel] = np.rint(weights[token] / divisor * 255).astype(np.uint8)
    excess = np.maximum(0, mask[..., :3].sum(axis=2).astype(np.int16) - 255)
    for channel in range(3):
        removed = np.minimum(mask[..., channel], excess).astype(np.uint8)
        mask[..., channel] -= removed
        excess -= removed
    mask[..., 3] = 255 - mask[..., :3].sum(axis=2)
    origin = [0, 0] if source["global_uv"] else [key[0], -key[1]]
    return {"base": {"i": record["texture"], "name": filename}, "images": [{**images[token], "channel": j} for j, token in enumerate(palette)],
            "origin": origin, "materials": source["materials"], "dimensions": [width, height]}, mask


def _keep_weights(version, pixels):
    """Retain derived lossless mask pixels in disposable cache, so DDS requests do not repeat preparation."""
    output = io.BytesIO()
    Image.fromarray(pixels).save(output, "PNG")
    trackpaint._atomic(_cache(version, "weights").with_suffix(".png"), output.getvalue())


def describe(ac, name, version):
    """Small immutable layout; cached metadata avoids pixel work on repeated PUTs and index reads."""
    record, path, scan, filename = _view(ac, name, version)
    target = trackpaint._out("paint-views", version) / "layers.json"
    try:
        saved = trackpaint._read(target)
        if (saved.get("profile") == PROFILE
                and saved.get("digest") == trackpaint._digest({k: v for k, v in saved.items() if k != "digest"})):
            return _with_urls(name, version, saved["layout"])
    except ValueError:
        pass
    layout, pixels = _compute(ac, name, record, path, scan, filename)
    width, height = layout.pop("dimensions")
    layout["mask"] = {"name": "map2lap_mask_" + version + ".dds", "key": version, "linear": True,
                      "size": dds_size(width, height, uncompressed=True)}
    for ref in layout["images"]:
        ref.pop("url", None)
    raw = pixels.tobytes()
    saved = {"profile": PROFILE, "layout": layout, "dimensions": [width, height], "mask_hash": hashlib.sha256(raw).hexdigest()}
    _keep_weights(version, pixels)
    trackpaint._atomic(target, trackpaint._json_bytes({**saved, "digest": trackpaint._digest(saved)}))
    return _with_urls(name, version, layout)


def _with_urls(name, version, layout):
    """Bind retained content to this track's endpoints; a saved copy may outlive the original track. Pure."""
    return {**layout, "mask": {**layout["mask"], "url": _url(name, "paint-mask", version)},
            "images": [{**ref, **({"url": _url(name, "paint-asset", ref["asset"])} if "asset" in ref else {})}
                       for ref in layout["images"]]}


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
    target = _cache(version, "mask")
    if target.is_file():
        return target.read_bytes()
    with trackpaint._rendering:
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
            trackpaint._atomic(target, dds_weights(pixels))
        return target.read_bytes()


def save_size(descriptors, scan):
    """Additional shared image bytes needed by Save, before any DDS is encoded. Pure."""
    known = {t[0] for t in scan["textures"]}
    sizes = {}
    for descriptor in descriptors:
        layout = descriptor.get("layers")
        if not layout:
            continue
        for ref in [layout["mask"], *layout["images"]]:
            if ref["name"] not in known:
                sizes[ref["name"]] = ref["size"]
    return sum(sizes.values()) + sum(len(raw) for name, raw in groundmaterial.textures() if name not in known)


def saved(ac, name, revision, descriptors, scan, change, path):
    """Prepare native material tables/images and integer UV origins, preserving every position and triangle."""
    materials, resources = list(scan["materials"]), {}
    present = {t[0] for t in scan["textures"]}
    origins = {}
    for descriptor in descriptors:
        layout = descriptor.get("layers")
        if not layout:
            continue
        resources[layout["mask"]["name"]] = mask(ac, name, descriptor["version"])
        for ref in layout["images"]:
            if "asset" in ref:
                resources[ref["name"]] = image(ac, name, ref["asset"])
        for i in layout["materials"]:
            original = materials[i]
            props = [p for p in original.props if p[0] not in {"multR", "multG", "multB", "multA", "magicMult", "uvMult", "m2lUVGlobal",
                                                             "m2lVariationR", "m2lVariationG", "m2lVariationB"}]
            props.extend([(f"mult{channel}", 1., tuple(layout["images"][j]["scale"]) if j < len(layout["images"]) else (1., 1.),
                           (0., 0., 0.), (0., 0., 0., 0.)) for j, channel in enumerate("RGB")])
            props += [("multA", 1., (1., 1.), (0., 0., 0.), (0., 0., 0., 0.)),
                      ("magicMult", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)),
                      ("m2lUVGlobal", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))]
            props.extend(("m2lVariation" + channel, float(j < len(layout["images"]) and layout["images"][j].get("variation", False)),
                          (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)) for j, channel in enumerate("RGB"))
            maps = [("txDiffuse", 0, groundmaterial.WHITE), ("txMask", 1, layout["mask"]["name"])]
            maps.extend(("txDetail" + channel, j + 2, layout["images"][j]["name"] if j < len(layout["images"]) else groundmaterial.WHITE)
                        for j, channel in enumerate("RGB"))
            maps.append(("txDetailA", 5, layout["base"]["name"]))
            materials[i] = replace(original, shader="ksMultilayer_objsp", props=props, maps=maps)
            origins[i] = layout["origin"]
    if not origins:
        return None, [], change
    resources.update(groundmaterial.textures())
    vertices = dict(change.vertices)
    with open(path, "rb") as file:
        for i, mesh in enumerate(scan["meshes"]):
            offset = origins.get(mesh["material"])
            if offset is None or offset == [0, 0]:
                continue
            data = vertices[i].copy() if i in vertices else kn5.mesh_arrays(file, mesh)[0]
            data["uv"] += offset
            vertices[i] = data
    return materials, [(name, raw) for name, raw in resources.items() if name not in present], kn5.Moved(vertices, change.grow, change.points)
