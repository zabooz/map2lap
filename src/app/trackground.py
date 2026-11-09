"""Regional Editor ground inputs; persistent material packages and semantic weights stay unchanged."""
import math
import struct

import numpy as np

MAX_TEXTURE_SIDE = 16384  # D3D11 2D-resource dimension; the adapter checks before materializing a derived mosaic.


def native_frame(bounds, repeat, texel, variation=False):
    """Independent physical region/canvas mapping for the stock shader's scalar detail multiplier. Pure.

    The photograph is shared unchanged. A rounded derived mask canvas is sampled
    from the world reference; its texel grid need not coincide with the photo grid.
    """
    if (len(bounds) != 4 or len(repeat) != 2 or len(texel) != 2
            or not all(math.isfinite(value) for value in (*bounds, *repeat, *texel))
            or any(value <= 0 for value in (*repeat, *texel)) or bounds[2] <= bounds[0] or bounds[3] <= bounds[1]):
        raise ValueError("Invalid native ground region frame")
    # Two source texels retain bilinear support at each edge of the owned geometry.
    origin = [bounds[k] - 2 * texel[k] for k in range(2)]
    period = 20 if variation else 1
    phase = [(origin[k] / repeat[k]) % period for k in range(2)]
    size = [bounds[k + 2] - bounds[k] + 4 * texel[k] for k in range(2)]
    multiplier = math.ceil(max(size[k] / repeat[k] + phase[k] for k in range(2)))
    extent = [value * multiplier for value in repeat]
    return {"origin": origin, "phase": phase, "multiplier": multiplier, "extent": extent,
            "world_origin": [origin[k] - phase[k] * repeat[k] for k in range(2)],
            "dimensions": [max(1, math.ceil(extent[k] / texel[k])) for k in range(2)]}


def clip_region(vertices, faces, bounds, uv_origin, coordinates=None):
    """Exact render-only triangle clipping in tile UVs; interpolate position, normal, UV and tangent. Pure."""
    flat = vertices.view("<f4").reshape(-1, 11).astype(np.float64)
    if coordinates is None:
        coordinates = flat[:, 6:8] - uv_origin + [0, 1]
    # Keep original mask UVs and all other attributes while a separate photo
    # coordinate plane decides periodic cuts. Both interpolate with the same t.
    flat = np.column_stack((flat, coordinates))
    triangles = coordinates[faces]
    overlap = ((triangles[..., 0].max(axis=1) > bounds[0]) & (triangles[..., 0].min(axis=1) < bounds[2])
               & (triangles[..., 1].max(axis=1) > bounds[1]) & (triangles[..., 1].min(axis=1) < bounds[3]))
    faces = faces[overlap]
    triangles = coordinates[faces]
    inside = ((triangles >= bounds[:2]) & (triangles <= bounds[2:])).all(axis=(1, 2))
    direct = flat[faces[inside]].reshape(-1, 13)
    result = []
    for face in faces[~inside]:
        polygon = list(flat[face])
        for axis, boundary, sign in ((0, bounds[0], 1), (0, bounds[2], -1), (1, bounds[1], 1), (1, bounds[3], -1)):
            if not polygon:
                break
            output = []
            previous = polygon[-1]
            def coordinate(vertex):
                  return vertex[11 + axis]
            previous_distance = sign * (coordinate(previous) - boundary)
            for current in polygon:
                distance = sign * (coordinate(current) - boundary)
                if (distance >= 0) != (previous_distance >= 0):
                    ratio = previous_distance / (previous_distance - distance)
                    output.append(previous + (current - previous) * ratio)
                if distance >= 0:
                    output.append(current)
                previous, previous_distance = current, distance
            polygon = output
        for k in range(1, len(polygon) - 1):
            a, b, c = polygon[0], polygon[k], polygon[k + 1]
            if np.any(np.cross(b[:3] - a[:3], c[:3] - a[:3])):
                result.extend((a, b, c))
    packed = np.concatenate([direct, np.asarray(result, dtype=np.float64).reshape(-1, 13)])[:, :11].astype("<f4")
    return packed.copy().view(vertices.dtype).reshape(-1)


def weight_regions(weights, block=64, *, halo=0):
    """Disjoint raster bounds with all semantic contributors and mask-free opaque interiors. Pure.

    Bounds partition geometry, not the weights: a mixed region retains even a tiny
    positive contributor. Filtering reads the original fields outside those bounds.
    """
    if not weights or type(block) is not int or block < 1:
        raise ValueError("Invalid ground region inputs")
    fields = {key: np.asarray(value, dtype=np.float32) for key, value in sorted(weights.items())}
    first = next(iter(fields.values()))
    if (first.ndim != 2 or not all(first.shape)
            or any(value.shape != first.shape or not np.isfinite(value).all() or np.any(value < 0) or np.any(value > 1)
                   for value in fields.values())):
        raise ValueError("Invalid ground material weights")
    total = sum(fields.values(), np.zeros_like(first))
    if np.any(total > 1 + 1e-6):
        raise ValueError("Ground material weights exceed unit coverage")
    result = []

    def visit(x0, y0, x1, y1):
        palette = [key for key, values in fields.items() if np.any(values[y0:y1, x0:x1] > 0)]
        base = bool(np.any(total[y0:y1, x0:x1] < 1))
        opaque = len(palette) + int(base) == 1
        if opaque and halo:
            left, top, right, bottom = x0 - halo, y0 - halo, x1 + halo, y1 + halo
            opaque = (0 <= left < right <= first.shape[1] and 0 <= top < bottom <= first.shape[0]
                      and bool(palette) and bool(np.all(fields[palette[0]][top:bottom, left:right] == 1)))
        if opaque or max(x1 - x0, y1 - y0) <= block:
            result.append({"bounds": [x0, y0, x1, y1], "palette": palette, "base": base, "opaque": opaque})
            return
        xs = [x0, (x0 + x1) // 2, x1] if x1 - x0 > block else [x0, x1]
        ys = [y0, (y0 + y1) // 2, y1] if y1 - y0 > block else [y0, y1]
        for top, bottom in zip(ys, ys[1:]):
            for left, right in zip(xs, xs[1:]):
                visit(left, top, right, bottom)

    height, width = first.shape
    visit(0, 0, width, height)
    return result






def half_weights(values):
    """Derived half weights with positive subnormal retention; report error without changing semantic input. Pure."""
    source = np.asarray(values, dtype=np.float32)
    if source.ndim != 2 or not np.isfinite(source).all() or np.any(source < 0) or np.any(source > 1):
        raise ValueError("Invalid ground material weights")
    half = source.astype(np.float16)
    raised = (source > 0) & (half == 0)
    half[raised] = np.nextafter(np.float16(0), np.float16(1))
    error = half.astype(np.float32) - source
    return half, {"raised_subnormals": int(raised.sum()), "max_error": float(np.abs(error).max(initial=0)),
                  "mass_delta": float(error.sum(dtype=np.float64)), "positive_lost": int(((source > 0) & (half == 0)).sum())}


def _levels(values):
    """Canonical independent-channel box mips for the generator's power-of-two weight grid. Pure."""
    level = np.asarray(values, dtype=np.float32)
    height, width = level.shape
    if any(side < 1 or side & (side - 1) for side in (width, height)):
        raise ValueError("Regional ground weights need the generator's power-of-two grid")
    result = [level]
    while level.shape != (1, 1):
        height, width = level.shape
        level = level.reshape(max(1, height // 2), min(2, height), max(1, width // 2), min(2, width)).mean(axis=(1, 3), dtype=np.float32)
        result.append(level)
    return result


def _world_level(tiles, level, crop):
    """Read true adjacent tile samples; missing tiles contribute zero, never an unrelated wrapped edge. Pure."""
    x0, y0, x1, y1 = crop
    height, width = next(iter(tiles.values()))[level].shape
    out = np.zeros((y1 - y0, x1 - x0), np.float32)
    for ty in range(y0 // height, (y1 - 1) // height + 1):
        for tx in range(x0 // width, (x1 - 1) // width + 1):
            levels = tiles.get((tx, ty))
            if levels is None:
                continue
            left, top = max(x0, tx * width), max(y0, ty * height)
            right, bottom = min(x1, (tx + 1) * width), min(y1, (ty + 1) * height)
            out[top - y0:bottom - y0, left - x0:right - x0] = levels[level][top - ty * height:bottom - ty * height,
                                                                                       left - tx * width:right - tx * width]
    return out


def _region_crop(bounds, split_level):
    """Grid-aligned bounds with two split-level texels of bilinear filter support. Pure."""
    x0, y0, x1, y1 = bounds
    step = 1 << split_level
    halo = 2 * step
    return [math.floor((x0 - halo) / step) * step, math.floor((y0 - halo) / step) * step,
            math.ceil((x1 + halo) / step) * step, math.ceil((y1 + halo) / step) * step]


def region_support(weights, bounds, split_level, neighbours=None):
    """All fine-filter contributors and a proven constant over the complete halo, not only owned geometry. Pure."""
    if not weights or type(split_level) is not int or split_level < 0:
        raise ValueError("Invalid ground filter support")
    crop = _region_crop(bounds, split_level)
    palette, constant = [], None
    keys = sorted(set(weights).union(*(fields for fields in (neighbours or {}).values())))
    for key in keys:
        tiles = {(0, 0): [np.asarray(weights[key], dtype=np.float32)]} if key in weights else {}
        for at, fields in (neighbours or {}).items():
            if key in fields:
                tiles[at] = [np.asarray(fields[key], dtype=np.float32)]
        values = _world_level(tiles, 0, crop)
        if np.any(values > 0):
            palette.append(key)
            if np.all(values == 1):
                constant = key
    return {"crop": crop, "palette": palette, "constant": constant}


def _atlas_positions(shapes):
    """Bottom-left rectangle packing with no power-of-two or full-source-size padding. Pure."""
    width = max(shape[1] for shape in shapes)
    placed = []
    for height, columns in shapes:
        candidates = {0, *(x + w for x, _y, w, _h in placed)}
        choices = []
        for x in candidates:
            if x + columns > width:
                continue
            y = max((top + rows for left, top, w, rows in placed if left < x + columns and left + w > x), default=0)
            choices.append((y + height, y, x))
        _bottom, y, x = min(choices)
        placed.append((x, y, columns, height))
    return width, max(y + h for _x, y, _w, h in placed), placed


def weight_atlas(values, bounds, split_level, neighbours=None, *, canonical=None):
    """Independent canonical mip rectangles with true two-texel halos, stored compactly as R16F. Pure.

    Each level retains its original texel grid. It has its own frame instead of
    inflating the full-resolution rectangle to fit the coarsest filter halo.
    """
    original = _levels(values) if canonical is None else canonical
    if type(split_level) is not int or not 0 <= split_level < len(original):
        raise ValueError("Invalid regional mip split")
    tiles = {(0, 0): original}
    for at, field in (neighbours or {}).items():
        if np.shape(field) != np.shape(values):
            raise ValueError("Ground neighbours need the same grid")
        tiles[at] = _levels(field)
    frames, rectangles, reports = [], [], []
    for level in range(split_level + 1):
        step = 1 << level
        x0, y0, x1, y1 = bounds
        crop = [math.floor(x0 / step) - 2, math.floor(y0 / step) - 2,
                math.ceil(x1 / step) + 2, math.ceil(y1 / step) + 2]
        pixels, report = half_weights(_world_level(tiles, level, crop))
        rectangles.append(pixels)
        reports.append(report)
        frames.append({"source": crop[:2]})
    variable = [(i, pixels) for i, pixels in enumerate(rectangles) if not np.all(pixels == pixels[0, 0])]
    width, height, positions = _atlas_positions([pixels.shape for _i, pixels in variable]) if variable else (0, 0, [])
    packed = np.zeros((height, width), np.float16)
    for frame, pixels in zip(frames, rectangles):
        if np.all(pixels == pixels[0, 0]):
            frame.update(constant=float(pixels[0, 0]), atlas=[0, 0, 0, 0])
    for (i, pixels), position in zip(variable, positions):
        frame = frames[i]
        x, y, columns, rows = position
        frame["atlas"] = list(position)
        packed[y:y + rows, x:x + columns] = pixels
    return {"pixels": packed, "levels": frames, "constant": bool(all(np.all(p == 1) for p in rectangles)),
            "zero": bool(all(not p.any() for p in rectangles)),
            "positive_lost": sum(report["positive_lost"] for report in reports),
            "max_error": max(report["max_error"] for report in reports),
            "mass_delta": sum(report["mass_delta"] for report in reports)}


def region_weights(values, bounds, split_level, neighbours=None):
    """Local canonical mip prefix and complementary whole-tile tail, with actual fine-filter neighbour support. Pure.

    The split changes storage, not filtering. Its two trilinear terms add back to
    the complete original mip chain. Geometry owns bounds; this is not a screen scissor.
    """
    original = _levels(values)
    if type(split_level) is not int or not 0 <= split_level < len(original):
        raise ValueError("Invalid regional mip split")
    height, width = original[0].shape
    x0, y0, x1, y1 = bounds
    if not (0 <= x0 < x1 <= width and 0 <= y0 < y1 <= height):
        raise ValueError("Invalid ground region bounds")
    crop = _region_crop(bounds, split_level)
    tiles = {(0, 0): original}
    for key, field in (neighbours or {}).items():
        if np.shape(field) != (height, width):
            raise ValueError("Ground neighbours need the same grid")
        tiles[key] = _levels(field)
    near = []
    w, h = crop[2] - crop[0], crop[3] - crop[1]
    for level in range(max(w, h).bit_length()):
        shape = (max(1, h >> level), max(1, w >> level))
        near.append(_world_level(tiles, level, [value // (1 << level) for value in crop])
                    if level <= split_level else np.zeros(shape, np.float32))
    tail = [np.zeros_like(original[split_level]), *original[split_level + 1:]]
    return {"bounds": list(bounds), "crop": crop, "split_level": split_level, "near": near, "tail": tail}


def weight_dds(levels):
    """RGBA16F flat base normal plus alpha weights, full independent supplied mips and exact byte/error report. Pure."""
    height, width = levels[0].shape
    expected = (height, width)
    payload, reports = [], []
    for level in levels:
        if level.shape != expected:
            raise ValueError("Invalid ground weight mip dimensions")
        half, report = half_weights(level)
        rgba = np.empty((*half.shape, 4), "<f2")
        rgba[:] = [.5, 1., .5, 0.]
        rgba[..., 3] = half
        payload.append(rgba.tobytes())
        reports.append(report)
        expected = tuple(max(1, side // 2) for side in expected)
    if levels[-1].shape != (1, 1):
        raise ValueError("Ground weight mip chain must end at 1 x 1")
    header = struct.pack("<4s7I44x", b"DDS ", 124, 0x2100f, height, width, width * 8, 0, len(levels))
    header += struct.pack("<8I", 32, 4, 113, 0, 0, 0, 0, 0) + struct.pack("<5I", 0x401008, 0, 0, 0, 0)
    raw = header + b"".join(payload)
    return raw, {"bytes": len(raw), "format": "RGBA16F", "levels": reports,
                 "positive_lost": sum(report["positive_lost"] for report in reports),
                 "max_error": max(report["max_error"] for report in reports)}
