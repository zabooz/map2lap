"""Raster compositing for saved ground textures, using row buffers and one owner per original material."""
import functools
import io

import numpy as np
from PIL import Image

from track import editorinfo
from track.textures import _is_bc7, dds_mipmaps, preserve_blocks

ROWS = 128  # A 2K tile needs only a few MiB of float colour buffers, instead of whole-tile copies for each overlay.


@functools.lru_cache(maxsize=4)  # At most 64 MiB: four RGBA 2K source images, usually reduced to a few pixels per repeat.
def _asset(path, width, height):
    with Image.open(path) as original:
        image = original.convert("RGBA").resize((width, height), Image.Resampling.LANCZOS)
        return np.array(image)


def _sample(image, x, z, repeat, texture_width, texture_height):
    """One stripe of a repeating image, anchored in world AC x/z. Pure."""
    # Reduce to the terrain's texel density before sampling; a 2 m repeat has only 16 pixels on a 2048px/256m tile.
    width = max(1, min(2048, int(np.ceil(repeat[0] * texture_width / editorinfo.TILE_M))))
    height = max(1, min(2048, int(np.ceil(repeat[1] * texture_height / editorinfo.TILE_M))))
    pixels = _asset(image, width, height)
    u, v = np.mod(x / repeat[0], 1) * width - 0.5, np.mod(z / repeat[1], 1) * height - 0.5
    ix, iy = np.floor(u).astype(np.int64), np.floor(v).astype(np.int64)
    fx, fy = (u - ix).astype(np.float32)[None, :, None], (v - iy).astype(np.float32)[:, None, None]
    a = pixels[iy[:, None] % height, ix[None, :] % width].astype(np.float32)
    b = pixels[iy[:, None] % height, (ix[None, :] + 1) % width].astype(np.float32)
    c = pixels[(iy[:, None] + 1) % height, ix[None, :] % width].astype(np.float32)
    d = pixels[(iy[:, None] + 1) % height, (ix[None, :] + 1) % width].astype(np.float32)
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def composite(original, tile, layers, assets, guard=0.):
    """Original encoded tile, (tx,ty), ordered (asset,material,mask bytes) and asset paths/repeats -> RGB and changed mask.
    guard: the share of each edge of a guarded tile texture (groundmaterial.UV_GUARD) around the tile, whose masks cover only
    the tile: they go onto the inside, their edges repeated over the ring, as the build made the texture."""
    with Image.open(io.BytesIO(original)) as source:
        base = np.array(source.convert("RGB"))
    height, width = base.shape[:2]
    gx, gy = round(guard * width), round(guard * height)
    owners, weights = {}, {}
    for asset, material, raw in layers:
        if material not in owners:
            owners[material] = np.zeros((height, width), np.uint16)
            weights[material] = np.zeros((height, width), np.uint8)
        with Image.open(io.BytesIO(raw)) as mask:
            if max(mask.size) > 2048:
                raise ValueError("Invalid material mask")
            alpha = np.pad(np.array(mask.convert("L").resize((width - 2 * gx, height - 2 * gy), Image.Resampling.BOX)),
                           ((gy, gy), (gx, gx)), mode="edge")
        on = alpha > 0
        owners[material][on], weights[material][on] = asset, alpha[on]
    output, touched = base.copy(), np.zeros((height, width), bool)
    x = tile[0] * editorinfo.TILE_M + (np.arange(width) + 0.5 - gx) * editorinfo.TILE_M / (width - 2 * gx)
    for row in range(0, height, ROWS):
        end = min(height, row + ROWS)
        z = -(tile[1] + 1) * editorinfo.TILE_M + (np.arange(row, end) + 0.5 - gy) * editorinfo.TILE_M / (height - 2 * gy)
        colour = np.zeros((end - row, width, 3), np.float32)
        coverage = np.zeros((end - row, width), np.float32)
        for material, owner in owners.items():
            stripe = owner[row:end]
            for number in np.unique(stripe):
                if not number:
                    continue
                path, repeat = assets[int(number)]
                sampled = _sample(path, x, z, repeat, width, height)
                opacity = (stripe == number) * weights[material][row:end].astype(np.float32) / 255 * sampled[..., 3] / 255
                coverage += opacity
                colour += sampled[..., :3] * opacity[..., None]
        coverage = np.clip(coverage, 0, 1)
        touched[row:end] = coverage > 0
        result = base[row:end].astype(np.float32) * (1 - coverage[..., None]) + colour
        output[row:end] = np.clip(np.rint(result), 0, 255).astype(np.uint8)
    return output, touched


def encoded(original, filename, tile, layers, assets, guard=0.):
    """Composite a tile once, in its existing image format (a tile with roads BC7); unchanged DDS blocks remain byte-identical."""
    pixels, touched = composite(original, tile, layers, assets, guard)
    image = Image.fromarray(pixels)
    if filename.lower().endswith(".dds"):
        return preserve_blocks(original, dds_mipmaps(image, smallest=1, bc7=_is_bc7(original)), touched)
    output = io.BytesIO()
    image.save(output, "PNG" if filename.lower().endswith(".png") else "JPEG", **({} if filename.lower().endswith(".png") else {"quality": 95, "subsampling": 0}))
    return output.getvalue()
