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
