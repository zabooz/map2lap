"""Our tree looks as CSP tree models (TreeFX) and the lines of a track's trees.txt that place them.

A track lists its trees in extension/trees/trees.txt (ext_config.ini: [TREES] LIST_0 = trees/trees.txt), one line per tree:
"tree: birch.bin; pos=x, y, z; angle=a; size=s; width=w" in AC coordinates (x east, y up, z south), size and width scale
the model. CSP draws them with wind, shadows both ways and its own far image beyond the last LOD.

.bin, as Content Manager's AcTreeModelConverter writes it (gro-ove/actools AcTools.ExtraKn5Utils): a zip of tree.ini, one
<name>_lod<i>.mesh per LOD and the textures (PNG). .mesh: int 1, byte 0, int textures, per texture (uint checksum,
int32 length + UTF-8 name: AcTools' ExtendedBinaryWriter, not .NET's 7-bit length, which CSP reads as "Unexpected end");
per material part int diffuse, int normal, int indices, ushort indices, int vertices, 44-byte vertices (position, normal,
uv as floats, positions over x/half width, y/height, z/half width; tangent bytes, element id, uv2 halves, ao0, ao1, wet,
extra); then -1, 4, float trunk width (normalised). CSP writes its baked AO back into the .bin on first load.

The textures are symmetric top to bottom (mirror_v): whether CSP flips v is not known.
"""
import functools
import io
import math
import os
import random
import struct
import sys
import zipfile
import zlib

from . import treebranches

import numpy as np
from PIL import Image, ImageDraw

T = 256                     # px of an atlas region; atlas 2T x 2T: A leaves light, B leaves dark, C needle band, D bark
REGION = {"A": (0, 0), "B": (1, 0), "C": (0, 1), "D": (1, 1)}
PADPX = 12
LOD_M = (200, 300, 500)     # m to which each LOD shows, the user's choice 2026-11-12: no change to be seen near the road
GROW = 1.3                  # card size per halving of the cards: the crown stays about as full
# a tree's width over its height against the model's, at most this far apart: a model stretched further no longer looks like
# its kind (the billboards' sprites run from 0.22 to 1.3 of their height wide, a model from about 0.3 to 1.3)
WIDTH_RANGE = (0.6, 1.6)

# Every generated tree and bush sprite has a form. Unknown future sprites can still fall back to billboards.
MODEL_OF = {"deciduous": "broadleaf", "deciduous2": "broadleaf", "linden": "broadleaf", "birch": "birch",
            "conifer": "spruce", "conifer2": "spruce", "spruce": "spruce", "pine": "pine", "larch": "larch",
            "shrub": "shrub", "shrub_flowers": "shrub_flowers",
            **{name: name for name in ("stone_pine", "cypress", "olive", "acacia", "baobab", "palm", "tropical",
                                      "juniper", "dry_shrub", "jungle_bush")}}


def model_of(sprite):
    """The model's name for a billboard sprite, None for a kind without a 3D form. Pure."""
    return MODEL_OF.get(sprite)


def uv_rect(region, inset=PADPX):
    """(u0, v0, u1, v1) of an atlas region, inside its margin. Pure."""
    cx, cy = REGION[region]
    return ((cx * T + inset) / (2 * T), (cy * T + inset) / (2 * T),
            ((cx + 1) * T - inset) / (2 * T), ((cy + 1) * T - inset) / (2 * T))


def mirror_v(img):
    """img with its top half mirrored onto the bottom: the same whichever way v runs."""
    top = img.crop((0, 0, img.width, img.height // 2))
    img.paste(top.transpose(Image.FLIP_TOP_BOTTOM), (0, img.height // 2))
    return img


def leaf_clump(rng, green, tint, n=34, size=(26, 52), light=0.25, flowers=None, roundness=.5):
    """A round clump of leaf dabs, as the sprites paint their crowns (trees._dabs), on a transparent region; rng: its
    random.Random, green: the base green, tint: red and blue over green, flowers: their count."""
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c, r0 = T / 2, T / 2 - PADPX - 4
    for _ in range(n):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random())
        s = rng.uniform(*size)
        rr = max(0.0, r * (r0 - s))
        x, y = c + math.cos(a) * rr, c + math.sin(a) * rr * roundness   # (top half only: mirrored)
        g = int(min(255, green * (1 - light / 2 + light * rng.random()) + rng.uniform(-10, 10)))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * tint[0]), g, int(g * tint[1]), 255))
    for _ in range(flowers or 0):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random()) * (r0 - 20)
        x, y = c + math.cos(a) * r, c + math.sin(a) * r * 0.5
        s = rng.uniform(7, 12)
        d.ellipse([x - s, y - s, x + s, y + s], fill=rng.choice([(246, 244, 232, 255), (238, 170, 190, 255)]))
    return mirror_v(img)


def needle_band(rng, green, tint, loose=False):
    """A band of needle tiers with jagged edges top and bottom, as the conifer sprites draw theirs; loose: tufts only."""
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lo, hi = PADPX + 18, T / 2
    pts = [(PADPX, hi)] + [(PADPX + (T - 2 * PADPX) * j / 10, lo + rng.uniform(-14, 14)) for j in range(11)] + [(T - PADPX, hi)]
    g = int(green * 0.85)
    if not loose:
        d.polygon(pts, fill=(int(g * tint[0]), g, int(g * tint[1]), 255))
    for _ in range(140 if loose else 90):                                  # tufts
        x, y = rng.uniform(PADPX + 8, T - PADPX - 8), rng.uniform(lo + 4, hi)
        s = rng.uniform(8, 16) if loose else rng.uniform(6, 14)
        gg = int(green * rng.uniform(0.8, 1.15))
        d.ellipse([x - s, y - s * 0.6, x + s, y + s * 0.6], fill=(int(gg * tint[0]), gg, int(gg * tint[1]), 255))
    return mirror_v(img)


def bark(rng, colour, marks=None):
    """Bark of colour (r, g, b) in upright stripes; marks: the count of dark birch marks."""
    img = Image.new("RGBA", (T, T), colour + (255,))
    d = ImageDraw.Draw(img)
    for _ in range(40):
        x = rng.uniform(0, T)
        k = rng.uniform(0.8, 1.15)
        d.rectangle([x, 0, x + rng.uniform(2, 6), T], fill=tuple(int(min(255, c * k)) for c in colour) + (255,))
    for _ in range(marks or 0):
        y = rng.uniform(0, T / 2)
        x0 = rng.uniform(0, T * 0.7)
        d.rectangle([x0, y, x0 + rng.uniform(20, 70), y + rng.uniform(3, 7)], fill=(40, 38, 36, 255))
    return mirror_v(img)


def atlas(regions):
    """The 2T x 2T texture of {region letter: image}. Pure."""
    img = Image.new("RGBA", (2 * T, 2 * T), (0, 0, 0, 0))
    for k, part in regions.items():
        cx, cy = REGION[k]
        img.paste(part, (cx * T, cy * T))
    return img


class Mesh:
    """A LOD's quads: positions in m (x, y up, z) from the foot of the trunk, normals, uv and triangles."""

    def __init__(self):
        self.p, self.n, self.uv, self.t = [], [], [], []

    def quad(self, corners, normals, rect):
        """One face (CSP draws leaves from both sides: a back face too flickered far away and showed a grid).
        corners: 4 points (u0v0, u1v0, u1v1, u0v1); normals per corner; rect: (u0, v0, u1, v1)."""
        u0, v0, u1, v1 = rect
        b = len(self.p)
        self.p += [tuple(c) for c in corners]
        self.n += [tuple(x) for x in normals]
        self.uv += [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        self.t += [(b, b + 1, b + 2), (b, b + 2, b + 3)]


def unit(v):
    """v at length one. Pure."""
    v = np.asarray(v, float)
    return v / (np.linalg.norm(v) or 1)


def trunk(m, height, r0, r1, sides, rect):
    """A trunk into m: a cone of sides from radius r0 at the foot to r1 at height, the bark in rect."""
    u0, v0, u1, v1 = rect
    for k in range(sides):
        a0, a1 = 2 * math.pi * k / sides, 2 * math.pi * (k + 1) / sides
        c = [(math.cos(a0) * r0, 0, math.sin(a0) * r0), (math.cos(a1) * r0, 0, math.sin(a1) * r0),
             (math.cos(a1) * r1, height, math.sin(a1) * r1), (math.cos(a0) * r1, height, math.sin(a0) * r1)]
        n = [(math.cos(a0), 0, math.sin(a0)), (math.cos(a1), 0, math.sin(a1))]
        du = (u1 - u0) / sides
        m.quad(c, [n[0], n[1], n[1], n[0]], (u0 + du * k, v0, u0 + du * (k + 1), v1))


def card(m, centre, size, a, b, normal_from, rect):
    """A leaf card into m at centre, turned by a (around the upright) and b (tilt), its normals pointing away from normal_from."""
    right = np.array([math.cos(a), 0, math.sin(a)])
    up = unit([-math.sin(a) * math.sin(b), math.cos(b), math.cos(a) * math.sin(b)])
    up = unit(up - right * np.dot(up, right))
    c = np.asarray(centre)
    h = size / 2
    corners = [c - right * h - up * h, c + right * h - up * h, c + right * h + up * h, c - right * h + up * h]
    m.quad(corners, [unit(x - normal_from) for x in corners], rect)


def _cards(m, cards, lod, centre):
    """LOD lod keeps every 2**lod-th card of the full crown at its place, GROW**lod larger: the same crown, coarser (each LOD
    with a crown of its own was another tree on switching)."""
    for pos, size, a, b, dark in cards[::2 ** lod]:
        card(m, pos, size * GROW ** lod, a, b, centre, uv_rect("B" if dark else "A"))


def broadleaf(seed, lod, cards, crown_y, rx, ry, card_m, trunk_top, trunk_r, round_shell=0.5):
    """A broadleaf tree's LOD lod: cards in a shell (round_shell to 1 of the crown's radii rx, ry, rx around crown_y m), those
    below and inside dark; a trunk of radius trunk_r up to trunk_top m. Pure."""
    rng = random.Random(seed)
    m = Mesh()
    trunk(m, trunk_top, trunk_r, trunk_r * 0.6, (6, 5, 4)[lod], uv_rect("D", 0))
    centre = np.array([0, crown_y, 0])
    full = []
    for _ in range(cards):
        while True:
            q = np.array([rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)])
            r = np.linalg.norm(q)
            if round_shell <= r <= 1:
                break
        pos = centre + q * [rx - card_m * 0.35, ry - card_m * 0.35, rx - card_m * 0.35]
        full.append((pos, card_m * rng.uniform(0.85, 1.15), rng.uniform(0, 2 * math.pi), rng.uniform(-0.6, 0.6),
                     q[1] < -0.2 or r < 0.7))
    rng.shuffle(full)                                   # (every 2**lod-th then spreads over the whole crown)
    _cards(m, full, lod, centre)
    return m


def conifer(seed, lod, tiers, H, W, trunk_r, rect):
    """A conifer's LOD lod, H m high and W wide: tiers of needle cones (rect of the atlas), the same at every LOD with fewer
    sides (7, 5, 4); LOD 2 keeps every other tier, each reaching up to the next kept. Pure."""
    rng = random.Random(seed)
    m = Mesh()
    segs = (7, 5, 4)[lod]
    trunk(m, H * 0.9, trunk_r, trunk_r * 0.3, (5, 4, 3)[lod], uv_rect("D", 0))
    full = []
    for k in range(tiers):
        t = k / max(1, tiers - 1)
        y_bot = H * (0.1 + 0.68 * t)
        full.append((y_bot, min(H, y_bot + H * (0.32 - 0.1 * t)), W / 2 * (1 - 0.82 * t) * rng.uniform(0.92, 1.05),
                     rng.uniform(0, 2 * math.pi), rng.uniform(-0.03, 0.03) * H))
    step = 2 if lod == 2 else 1
    kept = full[::step]
    if step == 2 and full[-1] is not kept[-1]:
        kept.append(full[-1])
    for y_bot, y_top, R, turn, droop in kept:
        if step == 2:
            y_top = min(H, y_top + H * 0.68 / max(1, tiers - 1))
        _tier(m, segs, y_bot, y_top, droop, R, turn, rect)
    return m


def _tier(m, segs, y_bot, y_top, droop, R, turn, rect):
    """A needle cone into m: segs faces from radius R at y_bot + droop to R * 0.12 at y_top, turned by turn; its normals
    lean as from y_bot."""
    r_top = R * 0.12
    slope = math.atan2(R - r_top, y_top - y_bot)
    for s in range(segs):
        a0, a1 = turn + 2 * math.pi * s / segs, turn + 2 * math.pi * (s + 1) / segs
        c = [(math.cos(a0) * R, y_bot + droop, math.sin(a0) * R), (math.cos(a1) * R, y_bot + droop, math.sin(a1) * R),
             (math.cos(a1) * r_top, y_top, math.sin(a1) * r_top), (math.cos(a0) * r_top, y_top, math.sin(a0) * r_top)]
        n = [unit((math.cos(a) * math.cos(math.pi / 2 - slope), math.sin(math.pi / 2 - slope) * 0.8 + 0.2,
                   math.sin(a) * math.cos(math.pi / 2 - slope))) for a in (a0, a1, a1, a0)]
        m.quad(c, n, rect)


def bush(seed, lod, cards, H, rx, card_m):
    """A bush's LOD lod, H m high, rx wide to each side: cards in its upper half shell, the low ones dark. Pure."""
    rng = random.Random(seed)
    m = Mesh()
    centre = np.array([0, H * 0.15, 0])
    full = []
    for _ in range(cards):
        while True:
            q = np.array([rng.uniform(-1, 1), rng.uniform(0, 1), rng.uniform(-1, 1)])
            if 0.35 <= np.linalg.norm(q) <= 1:
                break
        pos = np.array([q[0] * (rx - card_m * 0.3), max(card_m * 0.4, q[1] * (H - card_m * 0.4)), q[2] * (rx - card_m * 0.3)])
        full.append((pos, card_m * rng.uniform(0.85, 1.15), rng.uniform(0, 2 * math.pi), rng.uniform(-0.6, 0.6), q[1] < 0.35))
    rng.shuffle(full)
    _cards(m, full, lod, centre)
    return m


def _broadleaf(rng, seed):
    tex = atlas({"A": leaf_clump(rng, 112, (0.45, 0.3)), "B": leaf_clump(rng, 74, (0.45, 0.3)), "D": bark(rng, (70, 52, 38))})
    return tex, [broadleaf(seed, lod, 44, 6.4, 3.4, 3.3, 2.6, 6.0, 0.22) for lod in range(3)]


def _birch(rng, seed):
    tex = atlas({"A": leaf_clump(rng, 140, (0.62, 0.36), n=30, size=(20, 40)),
                 "B": leaf_clump(rng, 100, (0.62, 0.36), n=30, size=(20, 40)), "D": bark(rng, (226, 222, 212), marks=18)})
    return tex, [broadleaf(seed, lod, 40, 8.2, 2.3, 3.6, 2.0, 7.5, 0.14, round_shell=0.4) for lod in range(3)]


def _spruce(rng, seed):
    tex = atlas({"C": needle_band(rng, 72, (0.32, 0.4)), "D": bark(rng, (56, 40, 30))})
    return tex, [conifer(seed, lod, 9, 14.0, 4.6, 0.2, uv_rect("C")) for lod in range(3)]


def _larch(rng, seed):
    tex = atlas({"C": needle_band(rng, 128, (0.56, 0.32), loose=True), "D": bark(rng, (92, 66, 46))})
    return tex, [conifer(seed, lod, 8, 14.0, 5.6, 0.2, uv_rect("C")) for lod in range(3)]


def _shrub(rng, seed, flowers=None):
    tex = atlas({"A": leaf_clump(rng, 104, (0.5, 0.3), flowers=flowers),
                 "B": leaf_clump(rng, 78, (0.5, 0.3), flowers=flowers and flowers // 3)})
    return tex, [bush(seed, lod, 14, 1.6, 1.05, 1.1) for lod in range(3)]


def _branch(m, start, end, r0, r1, lod):
    """A tapered bark branch from start to end into m, with the same axis at every lod."""
    start, end = np.asarray(start), np.asarray(end)
    direction = unit(end - start)
    right = np.cross(direction, [0, 1, 0])
    right = unit(right) if np.linalg.norm(right) > 1e-6 else np.array([1., 0, 0])
    front = unit(np.cross(direction, right))
    sides = (6, 5, 4)[lod]
    u0, v0, u1, v1 = uv_rect("D", 0)
    for k in range(sides):
        normals = [right * math.cos(2 * math.pi * j / sides) + front * math.sin(2 * math.pi * j / sides) for j in (k, k + 1)]
        a, b = normals
        corners = [start + r0 * a, start + r0 * b, end + r1 * b, end + r1 * a]
        for point in corners:
            point[1] = max(0., point[1])       # a tilted root ring meets the ground at the foot, never below its origin
        m.quad(corners, [a, b, b, a],
               (u0 + (u1 - u0) * k / sides, v0, u0 + (u1 - u0) * (k + 1) / sides, v1))


def _stem(m, path, radii, lod, rect=None):
    """A curved or bottle-shaped trunk into m: path's centres and their radii; coarse lods retain its end points."""
    indices = sorted({0, len(path) - 1, *range(0, len(path), 2 if lod == 2 else 1)})
    sides = (6, 5, 4)[lod]
    rect = rect or uv_rect("D", 0)
    u0, v0, u1, v1 = rect
    for a, b in zip(indices, indices[1:]):
        for k in range(sides):
            # Shared horizontal rings: independent cylinders have differently tilted end rings and leave cracks at a bend.
            normals = [np.array([math.cos(2 * math.pi * j / sides), 0, math.sin(2 * math.pi * j / sides)]) for j in (k, k + 1)]
            n0, n1 = normals
            start, end = np.asarray(path[a]), np.asarray(path[b])
            m.quad([start + radii[a] * n0, start + radii[a] * n1, end + radii[b] * n1, end + radii[b] * n0],
                   [n0, n1, n1, n0], (u0 + (u1 - u0) * k / sides, v0 + (v1 - v0) * start[1] / path[-1][1],
                                       u0 + (u1 - u0) * (k + 1) / sides, v0 + (v1 - v0) * end[1] / path[-1][1]))
    # Forks do not cover a thick trunk's whole top: without caps the baobab is visibly hollow from above.
    for index, sign in ((0, -1), (-1, 1)):
        centre = np.asarray(path[index])
        ring = [centre + radii[index] * np.array([math.cos(2 * math.pi * k / sides), 0,
                                                math.sin(2 * math.pi * k / sides)]) for k in range(sides)]
        for k in range(0, sides, 2):
            corners = [centre, ring[k], ring[(k + 1) % sides], ring[(k + 2) % sides] if k + 2 <= sides else centre]
            m.quad(corners[::sign], [[0, sign, 0]] * 4, rect)


def _crown(m, seed, lod, centre, radii, count, card_m):
    """A regional crown clump into m, as the accepted broadleaf's shell of leaf cards; its centre stays across lods."""
    rng, centre = random.Random(seed), np.asarray(centre)
    full = []
    for _ in range(count):
        while True:
            q = np.array([rng.uniform(-1, 1) for _axis in range(3)])
            if .4 <= np.linalg.norm(q) <= 1:
                break
        pos = centre + q * np.asarray(radii)
        full.append((pos, card_m * rng.uniform(.85, 1.15), rng.uniform(0, 2 * math.pi), rng.uniform(-.6, .6), q[1] < -.2))
    rng.shuffle(full)
    first = len(m.p)
    _cards(m, full, lod, centre)
    for i in range(first, len(m.p)):
        x, y, z = m.p[i]
        m.p[i] = (x, max(0., y), z)           # coarse cards of low bushes meet the same ground as their fine leaves


def _foliage(rng, green, tint, wood, leaf_size=(16, 32)):
    """The same painted atlas as broadleaf, in a species' greens and bark; leaf_size is the range of dab radii. Pure."""
    # Small individual leaves still fill a clump: a fixed dab count makes olive/acacia crowns look like isolated dots.
    count = max(60, round(50000 / (sum(leaf_size) / 2) ** 2))
    return atlas({"A": leaf_clump(rng, green, tint, n=count, size=leaf_size, roundness=.8),
                  "B": leaf_clump(rng, round(green * .7), tint, n=count, size=leaf_size, roundness=.8), "D": bark(rng, wood)})


def _pine(rng, seed):
    """Scots/ponderosa pine: long bare reddish trunk, irregular high needle clumps. Pure."""
    tex = _foliage(rng, 76, (.38, .5), (148, 86, 56), (10, 23))
    lods = []
    for lod in range(3):
        m = Mesh()
        trunk(m, 10.8, .25, .10, (6, 5, 4)[lod], uv_rect("D", 0))
        for k, centre in enumerate(((0, 11, 0), (2, 9.7, .5), (-1.7, 9.2, 1), (.3, 8.4, -1.9))):
            _branch(m, (0, centre[1] - 1, 0), centre, .08, .035, lod)
            _crown(m, seed + k, lod, centre, (1.4, .45, 1.3), 10, 1.35)
        lods.append(m)
    return tex, lods


def _stone_pine(rng, seed):
    """Mediterranean stone pine: forked bare trunk under a broad flat umbrella. Pure."""
    tex = _foliage(rng, 84, (.4, .42), (104, 74, 54), (12, 26))
    lods = []
    for lod in range(3):
        m = Mesh()
        trunk(m, 6, .23, .13, (6, 5, 4)[lod], uv_rect("D", 0))
        for k, centre in enumerate(((-2.1, 7.2, 0), (1.5, 7.4, 1.3), (1, 7.3, -1.8))):
            _branch(m, (0, 5.2, 0), centre, .13, .05, lod)
            _crown(m, seed + k, lod, centre, (2, .45, 1.9), 14, 1.55)
        lods.append(m)
    return tex, lods


def _cypress(rng, seed):
    """Italian cypress: pointed narrow dark column with foliage almost down to its foot. Pure."""
    tex = _foliage(rng, 78, (.34, .36), (80, 58, 42), (8, 16))
    # A cypress has a continuous narrow body, not a stack of spruce skirts or disconnected leaf puffs.
    core = Image.new("RGBA", (T, T), (23, 66, 25, 255))
    leaves = tex.crop((0, 0, T, T))
    core.alpha_composite(leaves)
    tex.paste(core, (0, T))
    lods = []
    for lod in range(3):
        m = Mesh()
        trunk(m, .5, .13, .10, (6, 5, 4)[lod], uv_rect("D", 0))
        _stem(m, [(0, .3, 0), (.04, 1.3, 0), (0, 3, .02), (-.05, 4.8, 0), (0, 6.5, .03),
                  (.05, 8, 0), (0, 9.1, 0)], [.3, .5, .62, .65, .55, .32, .015], lod, uv_rect("C"))
        _crown(m, seed, lod, (0, 4.5, 0), (.25, 3.3, .25), 24, .75)
        lods.append(m)
    return tex, lods


def _olive(rng, seed):
    """Olive: two irregular grey stems and a low, open silver-green crown. Pure."""
    tex = _foliage(rng, 90, (.74, .64), (88, 78, 66), (9, 20))
    lods = []
    for lod in range(3):
        m = Mesh()
        for side in (-1, 1):
            _stem(m, [(side * .12, 0, 0), (side * .3, 1.1, .1), (side * .18, 2, -.15), (side * .8, 2.9, .1),
                      (side * 1.2, 3.9 + .1 * side, -.1 * side)], [.22, .18, .14, .09, .035], lod)
        _branch(m, (0, 1.8, 0), (0, 3.7, 1.2), .13, .04, lod)
        for k, centre in enumerate(((-1.2, 3.9, .2), (1.1, 4.1, -.3), (0, 3.7, 1.2))):
            _crown(m, seed + k, lod, centre, (1.0, .7, 1.0), 14, 1.65)
        lods.append(m)
    return tex, lods


def _acacia(rng, seed):
    """Umbrella thorn acacia: thin spreading branches and a very wide flat-topped crown. Pure."""
    tex = _foliage(rng, 104, (.66, .32), (88, 66, 50), (8, 17))
    lods = []
    for lod in range(3):
        m = Mesh()
        trunk(m, 4.7, .18, .10, (6, 5, 4)[lod], uv_rect("D", 0))
        for k, centre in enumerate(((-2.5, 6.0, -.8), (2.3, 6.1, -.7), (.2, 6.2, 2.0))):
            x, y, z = centre
            _stem(m, [(0, 3.9, 0), (x * .55, y - .7, z * .55), centre], [.12, .08, .035], lod)
            _crown(m, seed + k, lod, centre, (1.8, .35, 1.7), 16, 1.85)
        lods.append(m)
    return tex, lods


def _baobab(rng, seed):
    """Baobab: broad bottle-shaped trunk with short upward branches and small leaf clumps. Pure."""
    tex = _foliage(rng, 100, (.6, .3), (150, 132, 112), (8, 18))
    lods = []
    for lod in range(3):
        m = Mesh()
        _stem(m, [(0, 0, 0), (0, 2.6, 0), (.12, 5.3, .05), (0, 6.5, 0)], [1.05, 1.35, .85, .45], lod)
        for k in range(6):
            a = 2 * math.pi * k / 6
            centre = (2.5 * math.cos(a), 7.8 + .3 * (k % 2), 2.5 * math.sin(a))
            _branch(m, (0, 5.8, 0), centre, .26, .08, lod)
            _crown(m, seed + k, lod, centre, (.65, .4, .65), 8, 1.45)
        lods.append(m)
    return tex, lods


def _blade(rng, green, tint, feather=False):
    """A painted long leaf along u, mirrored around its central vein; feather makes palm leaflets. Pure."""
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    colour = (int(green * tint[0]), green, int(green * tint[1]), 255)
    vein = (int(green * tint[0] * .7), int(green * .75), int(green * tint[1] * .7), 255)
    length, y = T - 2 * PADPX, T // 2 - 1
    if feather:
        for k in range(28):
            t = (k + 1) / 29
            x = PADPX + length * t
            reach = math.sin(math.pi * t) ** .6 * 78
            d.polygon([(x - 4, y), (x - reach * .28, y - reach), (x + 4, y)], fill=colour)
    else:
        edge = [(PADPX + length * k / 18, y - 75 * math.sin(math.pi * k / 18) ** .8) for k in range(19)]
        d.polygon([(PADPX, y), *edge, (T - PADPX, y)], fill=colour)
        for k in range(1, 15):
            t = k / 16
            x = PADPX + length * t
            d.line([(x, y), (x + 12, y - 65 * math.sin(math.pi * t) ** .8)], fill=vein, width=2)
    d.line([(PADPX, y), (T - PADPX, y)], fill=vein, width=3)
    return mirror_v(img)


def _frond(m, base, angle, length, width, rise, drop, lod, rect, camber=0):
    """A bent leaf ribbon into m, root to tip along u; the same arch with fewer segments in coarser lods."""
    direction = np.array([math.cos(angle), 0, math.sin(angle)])
    side = np.array([-math.sin(angle), 0, math.cos(angle)])
    u0, v0, u1, v1 = rect
    segments = (6, 4, 2)[lod] if camber else (4, 3, 2)[lod]
    for k in range(segments):
        values = []
        for t in (k / segments, (k + 1) / segments):
            p = np.asarray(base) + direction * length * t + [0, rise * math.sin(math.pi * t) - drop * t * t, 0]
            w = max(.035, width * math.sin(math.pi * t) ** .65 / 2)
            values.append((p, w))
        (a, wa), (b, wb) = values
        normal = unit(np.cross(b - a, -side))
        if camber:
            # A broad leaf curves across its vein too: flat ribbons have conspicuous horizontal shoulders at the arch.
            for sign in (1, -1):
                edge_a = a + sign * side * wa - np.array([0, camber * wa, 0])
                edge_b = b + sign * side * wb - np.array([0, camber * wb, 0])
                corners = [edge_a, edge_b, b, a] if sign == 1 else [a, b, edge_b, edge_a]
                vm = (v0 + v1) / 2
                m.quad(corners, [normal] * 4, (u0 + (u1 - u0) * k / segments, v0 if sign == 1 else vm,
                                             u0 + (u1 - u0) * (k + 1) / segments, vm if sign == 1 else v1))
        else:
            m.quad([a + side * wa, b + side * wb, b - side * wb, a - side * wa], [normal] * 4,
                   (u0 + (u1 - u0) * k / segments, v0, u0 + (u1 - u0) * (k + 1) / segments, v1))


def _palm(rng, seed):
    """Palm: ringed curved trunk and a radial crown of long drooping feathered fronds. Pure."""
    wood = bark(rng, (150, 122, 88))
    d = ImageDraw.Draw(wood)
    for y in range(8, T // 2, 18):
        d.line([(0, y), (T, y + 4)], fill=(112, 88, 62, 255), width=3)
    tex = atlas({"C": _blade(rng, 112, (.5, .3), feather=True), "D": mirror_v(wood)})
    lods = []
    for lod in range(3):
        m = Mesh()
        _stem(m, [(0, 0, 0), (.3, 3, 0), (.6, 6, .1), (.4, 9, .2)], [.2, .18, .15, .12], lod)
        for k in range(12):
            _frond(m, (.4, 9, .2), 2 * math.pi * k / 12, 3.5 + .3 * (k % 3), .9, .7, 1.7 + .25 * (k % 2), lod, uv_rect("C"))
        lods.append(m)
    return tex, lods


def _tropical(rng, seed):
    """Rainforest tree: pale tall trunk and several dense deep-green crown lobes. Pure."""
    tex = _foliage(rng, 88, (.32, .26), (168, 158, 138), (14, 30))
    lods = []
    for lod in range(3):
        m = Mesh()
        trunk(m, 9, .34, .17, (6, 5, 4)[lod], uv_rect("D", 0))
        for k, centre in enumerate(((0, 10.8, 0), (-1.5, 10, .2), (1.5, 10, 1), (0, 9.6, -1.6))):
            _branch(m, (0, 7.8, 0), centre, .13, .06, lod)
            _crown(m, seed + k, lod, centre, (1.2, .9, 1.15), 12, 2.4)
        lods.append(m)
    return tex, lods


def _juniper(rng, seed):
    """Juniper: dense irregular blue-green foliage down to the ground. Pure."""
    tex = _foliage(rng, 82, (.46, .62), (92, 70, 52), (8, 17))
    lods = []
    for lod in range(3):
        m = Mesh()
        trunk(m, 3.1, .11, .04, (6, 5, 4)[lod], uv_rect("D", 0))
        _crown(m, seed, lod, (0, 2.1, 0), (.55, 1.3, .5), 44, 1.2)
        for k, centre in enumerate(((-.4, .9, .15), (.45, 1.1, -.2))):
            _crown(m, seed + k + 1, lod, centre, (.4, .45, .35), 10, 1.1)
        lods.append(m)
    return tex, lods


def _dry_shrub(rng, seed):
    """Dry-country bush: sparse olive/tan leaves and exposed brown twigs. Pure."""
    tex = atlas({"A": leaf_clump(rng, 100, (.72, .44), n=20, size=(9, 18)),
                 "B": leaf_clump(rng, 88, (1.08, .70), n=15, size=(8, 17)), "D": bark(rng, (104, 86, 66))})
    lods = []
    for lod in range(3):
        m = Mesh()
        for k in range(6):
            a = 2 * math.pi * k / 6
            _branch(m, (0, 0, 0), (.6 * math.cos(a), .8 + .1 * (k % 2), .6 * math.sin(a)), .025, .012, lod)
        _crown(m, seed, lod, (0, .65, 0), (.55, .3, .55), 14, .45)
        lods.append(m)
    return tex, lods


def _jungle_bush(rng, seed):
    """Tropical undergrowth: broad painted leaves fan out from the ground, with no tree trunk. Pure."""
    tex = atlas({"A": _blade(rng, 124, (.38, .26)), "B": _blade(rng, 98, (.38, .26))})
    lods = []
    for lod in range(3):
        m = Mesh()
        for k in range(10):
            _frond(m, (0, .1, 0), 2 * math.pi * k / 10 + .12 * math.sin(k), 1.15 + .15 * (k % 3), .75,
                   .8 + .2 * (k % 5), .05, lod, uv_rect("B" if k % 3 == 0 else "A"), camber=.65)
        lods.append(m)
    return tex, lods


# name: (seed, painter and builder): the colours and shapes of the sprites in trees.py; the seeds of the trial of 2026-11-12
MODELS = {"broadleaf": (100, _broadleaf), "birch": (101, _birch), "spruce": (102, _spruce), "larch": (103, _larch),
          "shrub": (104, _shrub), "shrub_flowers": (105, lambda rng, seed: _shrub(rng, seed, flowers=9)),
          **{name: (106 + i, make) for i, (name, make) in enumerate((
              ("pine", _pine), ("stone_pine", _stone_pine), ("cypress", _cypress), ("olive", _olive), ("acacia", _acacia),
              ("baobab", _baobab), ("palm", _palm), ("tropical", _tropical), ("juniper", _juniper),
              ("dry_shrub", _dry_shrub), ("jungle_bush", _jungle_bush)))}}


DECIDUOUS = frozenset(('broadleaf', 'birch', 'larch', 'baobab'))
TREE_FORMAT = 1


@functools.lru_cache(maxsize=None)
def base_model(name):
    """(texture image, [Mesh per LOD, finest first]) of a model of MODELS; the same each time."""
    seed, make = MODELS[name]
    return make(random.Random(seed), seed)


@functools.lru_cache(maxsize=None)
def model(name):
    """The original tree plus permanent wood inside its crown, with one unchanged atlas/material. Pure."""
    texture, lods = base_model(name)
    if name not in ('broadleaf', 'birch', 'larch'):
        return texture, lods
    return texture, [treebranches.extend(name, i, mesh, lods[0], sys.modules[__name__]) for i, mesh in enumerate(lods)]


@functools.lru_cache(maxsize=None)
def season_texture(name, season):
    """A canonical atlas for a season; bark occupies D, and only deciduous foliage changes. Pure."""
    original = model(name)[0]
    if season not in ('autumn', 'winter') or name not in DECIDUOUS:
        return original
    pixels = np.asarray(original).copy()
    foliage = np.ones(pixels.shape[:2], bool)
    foliage[T:, T:] = False
    if season == 'winter':
        pixels[..., 3][foliage] = 0
    else:
        # The existing painted shading remains: birch/larch turn golden, other deciduous crowns copper/red.
        rgb = pixels[..., :3].astype(np.float32)
        light = np.clip(rgb.max(axis=2) / 140, .12, 1)
        yy, xx = np.indices(light.shape)
        variation = .5 + .5 * np.sin(xx / 37 + np.sin(yy / 29))
        if name in ('birch', 'larch'):
            a, b = np.array([215, 151, 37]), np.array([186, 101, 30])
        else:
            a, b = np.array([198, 101, 32]), np.array([151, 49, 30])
        colour = (a + (b - a) * variation[..., None]) * light[..., None]
        pixels[..., :3][foliage] = np.clip(colour[foliage], 0, 255).astype(np.uint8)
    return Image.fromarray(pixels)


@functools.lru_cache(maxsize=None)
def size(name):
    """(height, width) in m of a model of MODELS, as its tree.ini says."""
    allp = np.concatenate([np.asarray(m.p) for m in model(name)[1]])
    H = round(float(allp[:, 1].max()), 4)
    return H, round(2 * float(max(np.abs(allp[:, 0]).max(), np.abs(allp[:, 2]).max())), 4)


def dotnet_string(s):
    """AcTools' ExtendedBinaryWriter string: int32 byte length, then UTF-8. Pure."""
    b = s.encode("utf-8")
    return struct.pack("<i", len(b)) + b


def checksum(data):
    """A texture's checksum in a .mesh: CRC-32, never 0. Pure."""
    return (zlib.crc32(data) & 0xFFFFFFFF) or 1


def _tangents(P, UV, tris):
    """Per vertex the direction of u along its faces (good enough for a flat normal map). Pure."""
    tang = np.zeros_like(P)
    for a, b, c in tris:
        du = UV[b, 0] - UV[a, 0]
        if abs(du) > 1e-9:
            tang[[a, b, c]] += (P[b] - P[a]) / du
    return tang / np.maximum(np.linalg.norm(tang, axis=1, keepdims=True), 1e-9)


def mesh_bytes(m, textures, half_width, H):
    """A LOD's .mesh of Mesh m, with one material part (diffuse textures[0], normal textures[1]); textures: [(name, bytes)],
    half_width and H: the model's, which positions are given over; (bytes, count of triangles). Pure."""
    P, N, UV = (np.asarray(a, float) for a in (m.p, m.n, m.uv))
    tris = np.asarray(m.t, int)
    if len(P) >= 65536:
        raise ValueError(f"{len(P)} vertices: a tree mesh holds 65,535 at most")
    norm = P / [half_width, H, half_width]
    out = bytearray(struct.pack("<iB", 1, 0) + struct.pack("<i", len(textures)))
    for name, data in textures:
        out += struct.pack("<I", checksum(data)) + dotnet_string(name)
    idx = tris.reshape(-1)
    out += struct.pack("<ii", 0, 1) + struct.pack("<i", len(idx)) + idx.astype("<u2").tobytes()
    out += struct.pack("<i", len(P))
    for p, n, uv, t in zip(norm, N, UV, _tangents(P, UV, tris)):
        tb = [int(min(255, max(0, x * 127.5 + 127.5))) for x in t]
        out += (struct.pack("<3f3f2f", *p, *n, *uv) + bytes(tb + [0]) + np.float16(0).tobytes() * 2
                + bytes([255, 255, 255, 0]))
    trunk_w = trunk_width(norm)
    if trunk_w is not None:
        out += struct.pack("<iif", -1, 4, trunk_w)
    return bytes(out), len(tris)


def trunk_width(norm):
    """The trunk's half width at the foot over the model's half width, from the normalised positions; None without a trunk
    (a bush). Pure."""
    sel = norm[(norm[:, 1] < 0.002) & (np.abs(norm[:, 0]) < 0.2) & (np.abs(norm[:, 2]) < 0.2)]
    if not len(sel):
        return None
    return float(min(sel[:, 0].max(), sel[:, 2].max(), -sel[:, 0].min(), -sel[:, 2].min()))


def png(img):
    """img as PNG bytes. Pure."""
    b = io.BytesIO()
    img.save(b, "PNG")
    return b.getvalue()


def tree_ini(name, H, W, meshes):
    """tree.ini of a model H m high and W wide whose LOD meshes are named meshes, finest first. Pure."""
    ini = [f"[BASIC]\nHEIGHT={H:.4f}\nWIDTH={W:.4f}\nCACHE_RESOLUTION=256,512\nVERTICAL_OFFSET=0\n",
           "[SHADING]\nSPECULAR=1.0\nSUBSCATTERING=1.0\nREFLECTIVITY=1.0\nBRIGHTNESS=1.0\nUSE_AO_CHANNEL=0\n",
           "[NORMALS]\nBOOST=0.9\nSPHERE=1.0\n", "[LEAVES]\nMULT=20.0\nOFFSET=0.0\n", "[FAKE_SHADOW]\nSIZE=1.0\nOPACITY=1.0\n"]
    for i, fname in enumerate(meshes):                  # (beyond the last CSP's far image)
        ini.append(f"[LOD_{i}]\nMODEL={fname}\nDISTANCE={LOD_M[i]}\n")
    return "\n".join(ini)


@functools.lru_cache(maxsize=96)
def bin_bytes(name, season='summer'):
    """One shared model/geometry for a species, with its selected foliage atlas. Pure."""
    _, lods = model(name)
    tex = season_texture(name, season)
    H, W = size(name)
    textures = [(f"{name}_d.png", png(tex)), (f"{name}_n.png", png(Image.new("RGBA", (64, 64), (128, 128, 255, 255))))]
    meshes = [(f"{name}_lod{i}.mesh", mesh_bytes(m, textures, W / 2, H)[0]) for i, m in enumerate(lods)]
    marker = f'\n[MAP2LAP]\nTREE_FORMAT={TREE_FORMAT}\nSPECIES={name}\nSEASON={season}\nDECIDUOUS={int(name in DECIDUOUS)}\n'
    files = meshes + [("tree.ini", (tree_ini(name, H, W, [f for f, _ in meshes]) + marker).encode())] + textures
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as z:
        for fname, data in files:
            z.writestr(zipfile.ZipInfo(fname, (1980, 1, 1, 0, 0, 0)), data, zipfile.ZIP_DEFLATED)
    return buffer.getvalue()


def write_bin(path, name, season='summer'):
    """Write one shared species model; the season changes its atlas, never its geometry."""
    raw = bin_bytes(name, season)
    if hasattr(path, 'write'):
        path.write(raw)
    else:
        with open(path, 'wb') as stream:
            stream.write(raw)


def _ini(text):
    """{section: {key: value}} of an ini text. Pure."""
    out, section = {}, {}
    for line in text.splitlines():
        line = line.split(";", 1)[0].strip()
        if line.startswith("[") and line.endswith("]"):
            section = out.setdefault(line[1:-1].strip(), {})
        elif "=" in line:
            key, value = line.split("=", 1)
            section[key.strip()] = value.strip()
    return out


def _string(data, o):
    """(an ExtendedBinaryWriter string at offset o, the offset after it). Pure."""
    n = struct.unpack_from("<i", data, o)[0]
    return data[o + 4:o + 4 + n].decode("utf-8"), o + 4 + n


VERTEX = np.dtype([("pos", "<f4", 3), ("normal", "<f4", 3), ("uv", "<f4", 2), ("rest", "V12")])     # (mesh_bytes' 44 bytes)


def read_mesh(data, half_width, H):
    """A .mesh's material parts: [{"diffuse", "normal_map": texture names, "indices", "pos" (n by 3, m from the foot), "normals",
    "uv"}]; a block of extra data (-1, its length, its bytes: the trunk's width) is passed over. Pure."""
    o, names = 9, []
    for _ in range(struct.unpack_from("<i", data, 5)[0]):
        name, o = _string(data, o + 4)
        names.append(name)
    parts = []
    while o < len(data):
        diffuse, normal_map = struct.unpack_from("<ii", data, o)
        if diffuse < 0:
            o += 8 + normal_map
            continue
        ni = struct.unpack_from("<i", data, o + 8)[0]
        indices = np.frombuffer(data, "<u2", ni, o + 12).astype(np.int64)
        o += 12 + 2 * ni
        nv = struct.unpack_from("<i", data, o)[0]
        v = np.frombuffer(data, VERTEX, nv, o + 4)
        o += 4 + VERTEX.itemsize * nv
        parts.append({"diffuse": names[diffuse] if 0 <= diffuse < len(names) else None,
                      "normal_map": names[normal_map] if 0 <= normal_map < len(names) else None, "indices": indices,
                      "pos": v["pos"].astype(np.float64) * [half_width, H, half_width], "normals": v["normal"].astype(np.float64),
                      "uv": v["uv"].astype(np.float64)})
    return parts


def read_bin(path):
    """A tree model's .bin as a track holds it: {"height", "width" (m, tree.ini's), "lods": [{"distance", "parts" (read_mesh)},
    finest first], "textures": {name: bytes}}. ValueError for a file that is no such model."""
    try:
        with zipfile.ZipFile(path) as z:
            files = {info.filename: z.read(info) for info in z.infolist()}
        ini = _ini(files["tree.ini"].decode("utf-8"))
        H, W = float(ini["BASIC"]["HEIGHT"]), float(ini["BASIC"]["WIDTH"])
        lods = [ini[k] for k in sorted((k for k in ini if k.startswith("LOD_")), key=lambda k: int(k[4:]))]
        out = [{"distance": float(lod["DISTANCE"]), "parts": read_mesh(files[lod["MODEL"]], W / 2, H)} for lod in lods]
    except (OSError, KeyError, ValueError, struct.error, zipfile.BadZipFile, UnicodeDecodeError) as e:
        raise ValueError(f"No tree model: {e}") from e
    used = {p[k] for lod in out for p in lod["parts"] for k in ("diffuse", "normal_map")} - {None}
    result = {"height": H, "width": W, "lods": out, "textures": {n: files[n] for n in sorted(used) if n in files}}
    marker = ini.get('MAP2LAP', {})
    if marker.get('TREE_FORMAT') == str(TREE_FORMAT) and marker.get('SPECIES') in MODELS:
        result['seasonal'] = {'format': TREE_FORMAT, 'species': marker['SPECIES'],
                              'deciduous': marker.get('DECIDUOUS') == '1', 'season': marker.get('SEASON', 'summer')}
    return result


def owned_model(tree, name):
    """Recognize our marked models or exact legacy geometry/atlas; unknown/custom trees stay untouched. Pure."""
    if name not in MODELS:
        return False
    if tree.get('seasonal', {}).get('species') == name:
        return True
    texture, lods = base_model(name)
    if len(tree['lods']) != len(lods):
        return False
    for loaded, mesh in zip(tree['lods'], lods):
        if len(loaded['parts']) != 1:
            return False
        part = loaded['parts'][0]
        for key, expected in (('pos', mesh.p), ('normals', mesh.n), ('uv', mesh.uv), ('indices', mesh.t)):
            got, wanted = np.asarray(part[key]), np.asarray(expected)
            if key == 'indices':
                got = got.reshape(-1, 3)
            if got.shape != wanted.shape or not np.allclose(got, wanted, atol=2e-5, rtol=2e-5):
                return False
    try:
        diffuse = tree['textures'][name + '_d.png']
        with Image.open(io.BytesIO(diffuse)) as image:
            return np.array_equal(np.asarray(image.convert('RGBA')), np.asarray(texture))
    except (KeyError, OSError, ValueError):
        return False


def generated_species(tree):
    """Recognize an owned species from content, including immutable library snapshots and their aliases. Pure."""
    marked = tree.get('seasonal', {}).get('species')
    if marked in MODELS:
        return marked
    for name in MODELS:
        if name + '_d.png' in tree['textures'] and owned_model(tree, name):
            return name
    return None


def canonical_model(path):
    """Read a track model; our generated models always preview their canonical green source, custom trees their file."""
    tree = read_bin(path)
    name = generated_species(tree)
    return read_bin(io.BytesIO(bin_bytes(name))) if name else tree


def write_models(folder, names):
    """Write each of the models names once into folder as <name>.bin; their file names, sorted."""
    files = sorted({f"{n}.bin" for n in names})
    for f in files:
        write_bin(os.path.join(folder, f), f[:-4])
    return files


def write_text(folder, trees):
    """trees.txt into folder from trees, the object list's section (objectlist.collect_treefx), in the order of its numbers."""
    listed = [trees["trees"][k] for k in sorted(trees["trees"], key=int)]
    with open(os.path.join(folder, "trees.txt"), "w", encoding="utf-8") as f:
        f.write("; Map2Lap: made from the track's object list (data/map2lap_objects.json)\n")
        f.write("".join(text(t) + "\n" for t in listed))


def placement(name, pos, angle, height, ratio):
    """A TreeFX tree as the object list holds it and trees.txt says it: {model, pos, angle, size, width} for model name at pos
    (x, y, z in AC coordinates, the foot), turned by angle degrees, scaled to height m high and ratio of its height wide (its
    width at most WIDTH_RANGE from the model's); rounded as text writes it, so a list and its trees.txt say the same. Pure."""
    H, W = size(name)
    width = min(max(ratio / (W / H), WIDTH_RANGE[0]), WIDTH_RANGE[1])
    return {"model": name, "pos": [round(float(v), 2) for v in pos], "angle": float(round(angle) % 360),
            "size": round(height / H, 3), "width": round(width, 3)}


def text(tree):
    """trees.txt's line of a placement. Pure."""
    x, y, z = tree["pos"]
    return (f"tree: {tree['model']}.bin; pos={x:.2f}, {y:.2f}, {z:.2f}; angle={tree['angle']:.0f}; size={tree['size']:.3f}; "
            f"width={tree['width']:.3f}")


def parse(line):
    """A trees.txt line as a placement; None for a comment or an empty line. Pure."""
    if not line.strip().startswith("tree:"):
        return None
    fields = dict(part.split("=", 1) for part in (p.strip() for p in line.split(";")[1:]) if "=" in part)
    model_file = line.split(";", 1)[0].split(":", 1)[1].strip()
    return {"model": model_file[:-4] if model_file.endswith(".bin") else model_file,
            "pos": [float(v) for v in fields["pos"].split(",")],
            "angle": float(fields.get("angle", 0)), "size": float(fields.get("size", 1)), "width": float(fields.get("width", 1))}
