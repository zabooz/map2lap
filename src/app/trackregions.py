"""Derived regional ground draw inputs; immutable selections and photographs stay in their existing packages."""
import math
import struct
import hashlib

import numpy as np

from app import trackground


def compile(layout, weights, version, store):
    """Compile every semantic contribution into local mip prefixes and shared coarse tails."""
    width, height = layout["dimensions"]
    # The split changes storage only. Level five leaves a small global tail at the generator's 2K resolution.
    split = min(5, max(0, int(math.log2(min(width, height))) - 2))
    fields = {**weights, "base": np.maximum(0., 1. - sum(weights.values(), np.zeros((height, width), np.float32)))}
    levels = {key: trackground._levels(values) for key, values in fields.items()}
    palette = {ref["id"]: i for i, ref in enumerate(layout["images"])}
    palette["base"] = -1
    passes, allocated = [], {}

    def append(key, bounds, first, canonical):
        encoded = trackground.weight_atlas(canonical[0], bounds, len(canonical) - 1,
                                            canonical=canonical)
        if encoded["zero"]:
            return
        raw = struct.pack("<4sII", b"M2GW", encoded["pixels"].shape[1], encoded["pixels"].shape[0])
        raw += encoded["pixels"].astype("<f2", copy=False).tobytes()
        token = hashlib.sha256(raw).hexdigest()
        if encoded["pixels"].size and token not in allocated:
            store(token, raw)
            allocated[token] = len(raw)
        passes.append({"image": palette[key], "bounds": [bounds[0] * (1 << first) / width,
                        bounds[1] * (1 << first) / height, bounds[2] * (1 << first) / width,
                        bounds[3] * (1 << first) / height], "first": first, "frames": encoded["levels"],
                       "weight": {"name": token + ".r16", "key": token, "linear": True,
                                  "size": len(raw) if encoded["pixels"].size else 0},
                       "max_error": encoded["max_error"], "positive_lost": encoded["positive_lost"]})

    regions = trackground.weight_regions(fields, block=64, halo=2)
    for region in regions:
        support = trackground.region_support(fields, region["bounds"], split)
        for key in support["palette"]:
            append(key, region["bounds"], 0, levels[key][:split + 1])
    for key, canonical in levels.items():
        if split + 1 < len(canonical):
            tail = canonical[split + 1:]
            append(key, [0, 0, tail[0].shape[1], tail[0].shape[0]], split + 1, tail)
    return {"dimensions": [width, height], "passes": passes, "bytes": sum(allocated.values()), "split": split}
