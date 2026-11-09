"""Portable texture preparation shared by builds and the Editor's material library."""
import io
import struct

from PIL import Image


def dds_size(width, height, alpha=False, *, uncompressed=False):
    """Size of a BC1/BC3 or uncompressed RGBA DDS with mipmaps through 1px. Pure."""
    size = 128
    while True:
        size += width * height * 4 if uncompressed else ((width + 3) // 4) * ((height + 3) // 4) * (16 if alpha else 8)
        if width == height == 1:
            return size
        width, height = max(1, width // 2), max(1, height // 2)


def dds_mipmaps(image, alpha=False, smallest=4, *, independent=False):
    """RGB/RGBA as BC1/BC3 DDS. Pure. Independent data channels are averaged without alpha association.

    smallest=4 preserves the build profile; 1 makes a full chain. For weight masks A is another weight,
    not transparency: Pillow's premultiplied RGBA resize would erase RGB wherever A is zero.
    """
    im = image.convert("RGBA" if alpha else "RGB")
    w0, h0 = w, h = im.size
    fourcc = "DXT5" if alpha else "DXT1"
    levels = []
    while True:
        output = io.BytesIO()
        im.save(output, "DDS", pixel_format=fourcc)
        levels.append(output.getvalue()[128:])
        if smallest == 1:
            if w == h == 1:
                break
        elif w <= smallest or h <= smallest or w % 8 or h % 8:
            break
        w, h = max(1, w // 2), max(1, h // 2)
        im = (Image.merge(im.mode, [band.resize((w, h), Image.Resampling.BOX) for band in im.split()]) if independent
              else im.resize((w, h), Image.Resampling.BOX))
    header = struct.pack("<4s7I44x", b"DDS ", 124, 0xA1007, h0, w0, len(levels[0]), 0, len(levels))
    header += struct.pack("<2I4s5I", 32, 4, fourcc.encode("ascii"), 0, 0, 0, 0, 0)
    header += struct.pack("<5I", 0x401008, 0, 0, 0, 0)
    return header + b"".join(levels)


def dds_weights(image):
    """Lossless RGBA8 weights, each mip summing to 255; A is a fourth weight, never transparency. Pure."""
    import numpy as np
    im, levels, header = image.convert("RGBA"), [], None
    while True:
        pixels = np.array(im)
        excess = np.maximum(0, pixels[..., :3].sum(axis=2, dtype=np.int16) - 255)
        for channel in range(3):
            removed = np.minimum(pixels[..., channel], excess).astype(np.uint8)
            pixels[..., channel] -= removed
            excess -= removed
        pixels[..., 3] = 255 - pixels[..., :3].sum(axis=2, dtype=np.uint16)
        im = Image.fromarray(pixels)
        output = io.BytesIO()
        im.save(output, "DDS")  # Legacy uncompressed BGRA8 DDS, supported by AC without CSP and by DDSLoader.
        raw = output.getvalue()
        if header is None:
            header = bytearray(raw[:128])
        levels.append(raw[128:])
        if im.size == (1, 1):
            break
        size = max(1, im.width // 2), max(1, im.height // 2)
        im = Image.merge("RGBA", [band.resize(size, Image.Resampling.BOX) for band in im.split()])
    struct.pack_into("<I", header, 8, struct.unpack_from("<I", header, 8)[0] | 0x20000)
    struct.pack_into("<I", header, 28, len(levels))
    struct.pack_into("<I", header, 108, 0x401008)
    return bytes(header) + b"".join(levels)


DXGI_BC7_UNORM = 98


def _bc7_header(width, height, levels):
    """A DDS header with its DX10 extension for BC7_UNORM: linear data, never sRGB. Pure."""
    header = bytearray(148)
    header[:4] = b"DDS "
    struct.pack_into("<7I", header, 4, 124, 0xA1007, height, width, max(1, (width + 3) // 4) * max(1, (height + 3) // 4) * 16, 0, levels)
    struct.pack_into("<2I", header, 76, 32, 0x4)
    header[84:88] = b"DX10"
    struct.pack_into("<I", header, 108, 0x401008)
    struct.pack_into("<5I", header, 128, DXGI_BC7_UNORM, 3, 0, 1, 0)
    return bytes(header)


def _is_bc7(raw):
    return raw[:4] == b"DDS " and raw[84:88] == b"DX10" and len(raw) >= 148 and struct.unpack_from("<I", raw, 128)[0] == DXGI_BC7_UNORM


def _is_rgba8(raw):
    return raw[:4] == b"DDS " and not struct.unpack_from("<I", raw, 80)[0] & 4 and struct.unpack_from("<I", raw, 88)[0] == 32


def weight_levels(raw):
    """Every mip level (H, W, 4 uint8 RGBA) of an RGBA8 or BC7 weight DDS. Pure."""
    import numpy as np
    height, width = struct.unpack_from("<2I", raw, 12)
    count, levels = max(1, struct.unpack_from("<I", raw, 28)[0]), []
    if _is_bc7(raw):
        at = 148
        for _ in range(count):
            size = max(1, (width + 3) // 4) * max(1, (height + 3) // 4) * 16
            with Image.open(io.BytesIO(_bc7_header(width, height, 1) + raw[at:at + size])) as image:
                levels.append(np.array(image.convert("RGBA")))
            at, width, height = at + size, max(1, width // 2), max(1, height // 2)
        return levels
    masks, at = struct.unpack_from("<4I", raw, 92), 128
    for _ in range(count):
        packed = np.frombuffer(raw, "<u4", width * height, at).reshape(height, width)
        levels.append(np.stack([((packed & m) >> ((m & -m).bit_length() - 1)).astype(np.uint8) if m else np.full((height, width), 255, np.uint8)
                                for m in masks], -1))
        at, width, height = at + width * height * 4, max(1, width // 2), max(1, height // 2)
    return levels


def bc7_weights(raw):
    """A lossless RGBA8 weight DDS (dds_weights) as BC7 with the same mip levels: a quarter of the size, for AC. Pure.
    Weights are data, so the error is plain RGBA (linear), not perceptual: about 0.1 of 255 on average, up to some 10
    at sharp edges, the four weights' sum off by up to a few 255ths (a brightness step under 2 %, not seen). Tried in
    AC with CSP (2026-11-09); other textures, and RGBA16F region masks, pass unchanged."""
    if not _is_rgba8(raw):
        return raw
    import etcpak
    import numpy as np
    params = etcpak.BC7CompressBlockParams()
    params.init_linear_weights()
    params.m_uber_level = 2
    levels = weight_levels(raw)
    blocks = []
    for level in levels:
        h, w = level.shape[:2]
        padded = np.ascontiguousarray(np.pad(level, ((0, -h % 4), (0, -w % 4), (0, 0)), mode="edge"))
        blocks.append(etcpak.compress_bc7(padded.tobytes(), padded.shape[1], padded.shape[0], params))
    return _bc7_header(levels[0].shape[1], levels[0].shape[0], len(levels)) + b"".join(blocks)


def browser_weights(raw):
    """A BC7 weight DDS as lossless RGBA8 for the Editor's browser view, whose DDS loader has no BC7. Pure."""
    if not _is_bc7(raw):
        return raw
    return dds_weights(Image.fromarray(weight_levels(raw)[0]))


def weight_extent(width, height):
    """Mask canvas/source ratios with a one-texel guard through mip seven at 2K. Pure."""
    # AC's stock multilayer sampler repeats. 128 edge texels keep its bilinear
    # footprint away from the opposite tile through mip 7 (16 m per mask texel).
    return tuple((size + 2 * max(1, size // 16)) / size for size in (width, height))


def pad_weights(image, tile):
    """Extrude tile edges on a globally phase-locked repeating mask canvas. Pure."""
    import numpy as np
    width, height = image.size
    cw, ch = (round(size * extent) for size, extent in zip(image.size, weight_extent(width, height)))
    # UV V spans [-1, 0] inside a tile; its image rows span [0, height].
    phase = (tile[0] * width, (-tile[1] - 1) * height)
    xs = (np.arange(cw) - phase[0] + (cw-width)//2) % cw - (cw-width)//2
    ys = (np.arange(ch) - phase[1] + (ch-height)//2) % ch - (ch-height)//2
    pixels = np.asarray(image.convert('RGBA'))
    return Image.fromarray(pixels[np.clip(ys, 0, height-1)[:, None], np.clip(xs, 0, width-1)[None, :]])


def preserve_blocks(original, changed, mask):
    """Reuse untouched BC1/BC3 blocks at each common mip level. Pure. Other formats keep the newly encoded image."""
    import numpy as np
    if (original[:4] != b"DDS " or changed[:4] != b"DDS " or original[84:88] != changed[84:88]
            or original[12:20] != changed[12:20] or changed[84:88] not in (b"DXT1", b"DXT5")):
        return changed
    height, width = struct.unpack_from("<2I", changed, 12)
    if mask.shape != (height, width):
        raise ValueError("The texture mask has another size")
    block_bytes = 8 if changed[84:88] == b"DXT1" else 16
    count = min(max(1, struct.unpack_from("<I", data, 28)[0]) for data in (original, changed))
    result, offset = bytearray(changed), 128
    on = np.asarray(mask, bool)
    for _ in range(count):
        rows, cols = (height + 3) // 4, (width + 3) // 4
        size = rows * cols * block_bytes
        if offset + size > min(len(original), len(result)):
            break
        padded = np.pad(on, ((0, -height % 4), (0, -width % 4)))
        touched = padded.reshape(rows, 4, cols, 4).any(axis=(1, 3)).ravel()
        before = np.frombuffer(original, np.uint8, size, offset).reshape(-1, block_bytes)
        after = np.frombuffer(result, np.uint8, size, offset).reshape(-1, block_bytes)
        after[~touched] = before[~touched]
        offset += size
        on = np.pad(on, ((0, height % 2), (0, width % 2))).reshape((height + 1) // 2, 2, (width + 1) // 2, 2).any(axis=(1, 3))
        height, width = max(1, height // 2), max(1, width // 2)
    return bytes(result)
