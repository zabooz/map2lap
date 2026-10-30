"""Boulders as chunky 3D comic rocks from BeamNG.Earth's vegetation (groups rock, desert_rock: position, size,
rotation, random value). As billboards they looked bad and there was no 3D shape, so they used to be left out
(Heiligenblut: 325 in 60 tiles, mostly 0.8 m, up to 2 m).

VARIANTS base shapes: a once-subdivided icosahedron with jittered vertices, flattened; each rock takes one by its
random value, rotated, scaled to its size and SINK into the ground. Hard edges (obj_to_kn5: material rock is not
smooth) for the comic look; texture: the ground's comic rock (groundcover gc_rock), planar.
"""
import math
import random

import numpy as np

ROCKS = {"rock", "desert_rock"}
MATERIAL = "rock"
COLLIDE_M = 1.0             # rocks from this size on collide (1WALL), smaller ones are visual only
SINK = 0.3                  # share of the height below ground (slopes: no gap underneath)
FLAT = 0.65                 # height / width
VARIANTS = 6
UV_M = 2.0                  # m per texture repeat


def _icosphere():
    """Once-subdivided icosahedron on the unit sphere: (vertices (42, 3), triangles (80, 3), counter-clockwise outside)."""
    t = (1 + 5 ** 0.5) / 2
    v = [(-1, t, 0), (1, t, 0), (-1, -t, 0), (1, -t, 0), (0, -1, t), (0, 1, t), (0, -1, -t), (0, 1, -t),
         (t, 0, -1), (t, 0, 1), (-t, 0, -1), (-t, 0, 1)]
    f = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11), (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6),
         (7, 1, 8), (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9), (4, 9, 5), (2, 4, 11), (6, 2, 10),
         (8, 6, 7), (9, 8, 1)]
    v = [np.array(p, float) / np.linalg.norm(p) for p in v]
    mid = {}

    def m(a, b):
        k = (min(a, b), max(a, b))
        if k not in mid:
            p = v[a] + v[b]
            v.append(p / np.linalg.norm(p))
            mid[k] = len(v) - 1
        return mid[k]
    out = []
    for a, b, c in f:
        ab, bc, ca = m(a, b), m(b, c), m(c, a)
        out += [(a, ab, ca), (b, bc, ab), (c, ca, bc), (ab, bc, ca)]
    return np.array(v), np.array(out, np.int64)


def _variants(seed=11):
    """The base shapes: vertices jittered per shape (0.75-1.15), flattened, bottom at z = 0, width 1."""
    P, T = _icosphere()
    rng = random.Random(seed)
    out = []
    for _ in range(VARIANTS):
        r = np.array([rng.uniform(0.75, 1.15) for _ in range(len(P))])
        q = P * r[:, None] * (0.5, 0.5 * rng.uniform(0.8, 1.2), 0.5 * FLAT)
        q[:, 2] -= q[:, 2].min()
        out.append(q)
    return out, T


_SHAPES = None


def meshes(items, wet=None):
    """{AC prefix: (P, UV, T)} of the rocks among items (group name, x, y, z, rotation, size, random value), ENU:
    "1WALL" the big ones (they collide), "nocol" the small ones."""
    global _SHAPES
    if _SHAPES is None:
        _SHAPES = _variants()
    shapes, T0 = _SHAPES
    out = {}
    for name, x, y, z, yaw, size, rank in items:
        if name not in ROCKS or (wet is not None and wet(x, y)):
            continue
        s = max(0.3, float(size))
        q = shapes[int(rank * 1000) % len(shapes)] * s
        a = math.radians(yaw)
        ca, sa = math.cos(a), math.sin(a)
        P = np.c_[x + q[:, 0] * ca - q[:, 1] * sa, y + q[:, 0] * sa + q[:, 1] * ca, z - SINK * FLAT * s + q[:, 2]]
        UV = np.c_[(P[:, 0] + P[:, 1]) / UV_M, P[:, 2] / UV_M]
        out.setdefault("1WALL" if s >= COLLIDE_M else "nocol", []).append((P, UV))
    res = {}
    for prefix, parts in out.items():
        n = len(parts[0][0])
        res[prefix] = (np.concatenate([p for p, _ in parts]), np.concatenate([uv for _, uv in parts]),
                       np.concatenate([T0 + k * n for k in range(len(parts))]))
    return res
