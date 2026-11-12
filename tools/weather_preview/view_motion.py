"""Decode recorded CSP DDS frames into paired scene/depth PNGs and an animated review image."""
import argparse
import json
from pathlib import Path
import struct

import numpy as np
from PIL import Image, ImageDraw


def read_dds(path):
    """Decode the two uncompressed formats emitted by this recorder. Pure."""
    raw = path.read_bytes()
    if raw[:4] != b'DDS ':
        raise ValueError('Not a DDS image')
    height, width = struct.unpack_from('<II', raw, 12)
    fourcc = struct.unpack_from('<I', raw, 84)[0]
    if fourcc in (111, 112, 113):  # D3DFMT_R16F, G16R16F, A16B16G16R16F.
        channels = {111: 1, 112: 2, 113: 4}[fourcc]
        data = np.frombuffer(raw, dtype='<f2', offset=128).reshape(height, width, channels)
        rgba = np.zeros((height, width, 4), np.float32)
        rgba[:, :, 3] = 1
        rgba[:, :, :channels] = data
        return rgba
    if fourcc != 0:
        raise ValueError(f'Unsupported DDS format {fourcc}')
    words = np.frombuffer(raw, dtype='<u4', offset=128).reshape(height, width)
    masks = struct.unpack_from('<4I', raw, 92)
    channels = []
    for mask in masks:
        shift = (mask & -mask).bit_length() - 1 if mask else 0
        channels.append(((words & mask) >> shift).astype(np.uint8) if mask else np.full(words.shape, 255, np.uint8))
    return np.stack(channels, axis=2)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('capture', type=Path)
    args = parser.parse_args()
    records = [json.loads(line) for line in (args.capture / 'frames.jsonl').read_text().splitlines()]
    frames, durations = [], []
    for i, record in enumerate(records):
        name = f"{record['sequence']:04d}"
        depth = read_dds(args.capture / (name + '-depth.dds'))[:, :, 0]
        scene = Image.fromarray(read_dds(args.capture / (name + '-view.dds'))).convert('RGB')
        image = Image.new('RGB', (1480, 590), (24, 24, 24))
        image.paste(scene, (0, 40))
        footprint = np.zeros((*depth.shape, 3), np.uint8)
        footprint[:, :, 0] = (depth > 0.025) * 255
        image.paste(Image.fromarray(footprint).resize((512, 292)), (968, 40))
        draw = ImageDraw.Draw(image)
        draw.text((8, 8), f"Frame {name}, simulation {record['time']:.3f}s, tick {record['tick']}, rain {record['rain']:.2f}, wiper {record['phase']:.3f}", fill='white')
        draw.text((976, 348), 'Same-draw water state; U right, V down', fill='white')
        draw.text((8, 564), 'Scene is diagnostic HDR tone mapping. Capture overhead is not a performance measurement.', fill='white')
        image.save(args.capture / (name + '-paired.png'))
        frames.append(image)
        dt = records[i + 1]['time'] - record['time'] if i + 1 < len(records) else 0.1
        durations.append(max(20, round(dt * 1000)))
    if frames:
        frames[0].save(args.capture / 'motion.webp', save_all=True, append_images=frames[1:], duration=durations, loop=0, lossless=True)
    print(args.capture / 'motion.webp')


if __name__ == '__main__':
    main()
