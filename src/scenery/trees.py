"""Trees and bushes as crossed billboards (two vertical double-sided quads each) from BeamNG.Earth's
vegetation.tile_items (positions, heights, kinds from Meta's tree height data), plus a generated texture atlas.

Atlas (trees.png, 10 columns): 0-1 deciduous, 2-3 conifer, 4 bush, 5 birch, 6 linden, 7 spruce, 8 larch (only high
in the mountains, LARCH_FROM_M), 9 flowering bush; cut out (alpha), anchored at the bottom centre, every image with
PAD of empty margin. Rocks are left out here (as flat quads they look bad; rocks.py makes them 3D).
"""
import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import vegetation

COLS = 10
SPRITE_W, SPRITE_H = 256, 512
# px of empty margin around every image: without it the billboard edges reached into the neighbouring image at small
# mip levels (crowns touch the image edge: vertical lines next to conifers) and through the texture repeat into their
# own bottom row (horizontal lines above bushes); clean down to mip level 6 (image 8 pixels high)
PAD = 32
CELL_W, CELL_H = SPRITE_W + 2 * PAD, SPRITE_H + 2 * PAD
# group -> ((atlas column, width/height), ...): each tree gets one of them (by its random value)
STYLE = {"deciduous": ((0, 0.75), (1, 0.75), (5, 0.55), (6, 0.85)), "conifer": ((2, 0.42), (3, 0.42), (7, 0.32)),
         "pine_west": ((2, 0.45), (3, 0.45)), "juniper": ((2, 0.6), (3, 0.6)), "palm": ((0, 0.7), (1, 0.7)),
         "shrub": ((4, 1.3), (9, 1.2)), "desert_shrub": ((4, 1.3),)}
LARCH = ((8, 0.4),)
LARCH_FROM_M = 1500.0       # m altitude (anchor frame): above it every third conifer is a larch
SKIP = {"rock", "desert_rock"}
SINK_M = 0.2                # foot slightly into the ground (slopes)


def _deciduous(rng):
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    d.rectangle([cx - 9, SPRITE_H * 0.62, cx + 9, SPRITE_H - 1], fill=(70, 52, 38, 255))         # trunk
    for _ in range(320):                                           # crown from lots of leaf dabs
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random())
        x = cx + math.cos(a) * r * SPRITE_W * 0.45
        y = SPRITE_H * 0.36 + math.sin(a) * r * SPRITE_H * 0.33
        s = rng.uniform(10, 24)
        shade = 0.55 + 0.45 * (1 - (y / SPRITE_H)) * rng.uniform(0.7, 1.1)
        g = int(min(255, 105 * shade + rng.uniform(-12, 12)))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.45), g, int(g * 0.3), 255))
    return img


def _conifer(rng):
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    d.rectangle([cx - 6, SPRITE_H * 0.8, cx + 6, SPRITE_H - 1], fill=(60, 44, 32, 255))
    layers = 9
    for k in range(layers):                                        # stepped, jagged tiers from bottom to top
        t = k / (layers - 1)
        yb = SPRITE_H * (0.86 - 0.8 * t)
        w = SPRITE_W * (0.48 - 0.4 * t)
        pts = [(cx - w, yb)]
        for j in range(1, 8):
            pts.append((cx - w + 2 * w * j / 8, yb + rng.uniform(-8, 8)))
        pts += [(cx + w, yb), (cx, yb - SPRITE_H * 0.2)]
        g = int(70 + 30 * t + rng.uniform(-8, 8))
        d.polygon(pts, fill=(int(g * 0.35), g, int(g * 0.45), 255))
    return img


def _shrub(rng):
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    for _ in range(220):
        a, r = rng.uniform(math.pi, 2 * math.pi), math.sqrt(rng.random())
        x = cx + math.cos(a) * r * SPRITE_W * 0.46
        y = SPRITE_H - 4 + math.sin(a) * r * SPRITE_H * 0.4
        s = rng.uniform(9, 20)
        g = int(95 + rng.uniform(-20, 20))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.5), g, int(g * 0.3), 255))
    return img


def _birch(rng):
    """Birch: white trunk with black marks, loose, light green, narrow crown."""
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    d.rectangle([cx - 7, SPRITE_H * 0.5, cx + 7, SPRITE_H - 1], fill=(226, 222, 212, 255))
    for _ in range(14):
        y = rng.uniform(SPRITE_H * 0.52, SPRITE_H - 6)
        d.rectangle([cx - 7, y, cx + rng.uniform(-2, 7), y + rng.uniform(2, 5)], fill=(40, 38, 36, 255))
    for _ in range(260):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random())
        x = cx + math.cos(a) * r * SPRITE_W * 0.36
        y = SPRITE_H * 0.32 + math.sin(a) * r * SPRITE_H * 0.3
        s = rng.uniform(7, 16)
        g = int(min(255, 126 * (0.75 + 0.3 * (1 - y / SPRITE_H)) + rng.uniform(-14, 14)))   # (150 glowed next
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.62), g, int(g * 0.36), 255))      # to the others)
    return img


def _linden(rng):
    """Linden/oak: broad, round, dark crown on a short, thick trunk."""
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    d.rectangle([cx - 12, SPRITE_H * 0.66, cx + 12, SPRITE_H - 1], fill=(78, 60, 44, 255))
    for _ in range(380):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random())
        x = cx + math.cos(a) * r * SPRITE_W * 0.47
        y = SPRITE_H * 0.42 + math.sin(a) * r * SPRITE_H * 0.28
        s = rng.uniform(11, 26)
        g = int(min(255, 92 * (0.6 + 0.45 * (1 - y / SPRITE_H)) + rng.uniform(-10, 10)))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.42), g, int(g * 0.26), 255))
    return img


def _spruce(rng):
    """Spruce: narrow, dark, drooping tiers almost down to the ground."""
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    d.rectangle([cx - 5, SPRITE_H * 0.9, cx + 5, SPRITE_H - 1], fill=(56, 40, 30, 255))
    layers = 13
    for k in range(layers):
        t = k / (layers - 1)
        yb = SPRITE_H * (0.93 - 0.86 * t)
        w = SPRITE_W * (0.44 - 0.4 * t)
        pts = [(cx - w, yb + 10)] + [(cx - w + 2 * w * j / 6, yb + rng.uniform(-4, 10)) for j in range(1, 6)]
        pts += [(cx + w, yb + 10), (cx, yb - SPRITE_H * 0.12)]
        g = int(58 + 22 * t + rng.uniform(-6, 6))
        d.polygon(pts, fill=(int(g * 0.32), g, int(g * 0.4), 255))
    return img


def _larch(rng):
    """Larch: loose, light green needle tufts on horizontal branches, see-through."""
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    d.rectangle([cx - 6, SPRITE_H * 0.7, cx + 6, SPRITE_H - 1], fill=(92, 66, 46, 255))
    for k in range(24):                                 # tiers from bottom to top, dense enough for a cone
        t = k / 23
        y = SPRITE_H * (0.84 - 0.78 * t)
        w = SPRITE_W * (0.4 - 0.36 * t) + 6
        for _ in range(int(16 + 22 * (1 - t))):
            x = cx + rng.uniform(-1.0, 1.0) * w
            s = rng.uniform(6, 13)
            g = int(118 + rng.uniform(-22, 18))         # (156 with more red glowed yellow next to the
            d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.56), g, int(g * 0.32), 255))   # others)
    return img


def _shrub_flowers(rng):
    """Bush with flowers (elder, dog rose)."""
    img = _shrub(rng)
    d = ImageDraw.Draw(img)
    cx = SPRITE_W / 2
    for _ in range(60):
        a, r = rng.uniform(math.pi, 2 * math.pi), math.sqrt(rng.random())
        x = cx + math.cos(a) * r * SPRITE_W * 0.42
        y = SPRITE_H - 8 + math.sin(a) * r * SPRITE_H * 0.36
        s = rng.uniform(3, 6)
        d.ellipse([x - s, y - s, x + s, y + s], fill=rng.choice([(246, 244, 232, 255), (238, 170, 190, 255)]))
    return img


def _cell(sprite):
    """One atlas cell: the image with PAD margin all round; the transparent pixels in the image's mean colour (black
    ones gave the edges dark fringes at the small mip levels), edges slightly softened, alpha hard (alpha test)."""
    a = np.asarray(sprite, np.uint8).copy()
    solid = a[..., 3] > 100
    mean = a[solid, :3].mean(axis=0).astype(np.uint8)
    a[~solid, :3] = mean
    rgb = Image.fromarray(a[..., :3]).filter(ImageFilter.GaussianBlur(0.6))
    alpha = Image.fromarray(np.where(solid, 255, 0).astype(np.uint8))
    cell = Image.new("RGBA", (CELL_W, CELL_H), (*(int(v) for v in mean), 0))
    cell.paste(Image.merge("RGBA", (*rgb.split(), alpha)), (PAD, PAD))
    return cell


def make_atlas(path, seed=7):
    rng = random.Random(seed)
    atlas = Image.new("RGBA", (CELL_W * COLS, CELL_H), (0, 0, 0, 0))
    for col, fn in enumerate((_deciduous, _deciduous, _conifer, _conifer, _shrub)):
        atlas.paste(_cell(fn(rng)), (col * CELL_W, 0))
    for col, fn in enumerate((_birch, _linden, _spruce, _larch, _shrub_flowers), 5):    # (own random: the
        atlas.paste(_cell(fn(random.Random(seed * 1000 + col))), (col * CELL_W, 0))   # first five stay the same)
    atlas.save(path)
    return path


def tile_items(frame, tx, ty, veg, elev):
    """Trees, bushes and rocks of the tile: (group name, x, y, z, rotation, height or size, random value) in ENU."""
    rows = vegetation.tile_items(frame, tx, ty, veg, lambda k: True, elev) or []
    return [(vegetation.GROUPS[int(g)], x, y, z, yaw, height, rank) for g, x, y, z, yaw, _s, height, rank in rows]


def tile_trees(frame, tx, ty, veg, elev, wet=None, extra=()):
    """Billboard mesh (P, UV, T) in ENU for the tile's trees, or None. wet(x, y) -> bool: in water.
    extra: more trees (group name, x, y, z, rotation, height, random value), e.g. street trees from the props."""
    return billboards(tile_items(frame, tx, ty, veg, elev) + list(extra), wet)


def billboards(items, wet=None):
    """Crossed billboards for (group name, x, y, z, rotation, height, random value); (P, UV, T) or None."""
    P, UV, T = [], [], []
    for name, x, y, z, yaw, height, rank in items:
        if name in SKIP or (wet is not None and wet(x, y)):
            continue
        looks = STYLE.get(name, STYLE["deciduous"])
        if name == "conifer" and z > LARCH_FROM_M and int(rank * 7919) % 3 == 0:
            looks = LARCH
        col, ratio = looks[int(rank * 1000) % len(looks)]
        h = max(0.8, float(height))
        w = h * ratio
        u0 = (col * CELL_W + PAD) / (COLS * CELL_W)         # (only the image, without the cell's margin)
        u1 = u0 + SPRITE_W / (COLS * CELL_W)
        v0, v1 = PAD / CELL_H, 1.0 - PAD / CELL_H
        for k, ang in enumerate((math.radians(yaw), math.radians(yaw) + math.pi / 2)):
            dx, dy = math.cos(ang) * w / 2, math.sin(ang) * w / 2
            base = len(P)
            zb = z - SINK_M
            P += [(x - dx, y - dy, zb), (x + dx, y + dy, zb), (x + dx, y + dy, zb + h), (x - dx, y - dy, zb + h)]
            UV += [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
            T += [(base, base + 1, base + 2), (base, base + 2, base + 3),        # front
                  (base, base + 2, base + 1), (base, base + 3, base + 2)]        # back
    if not T:
        return None
    return np.asarray(P, float), np.asarray(UV, float), np.asarray(T, np.int64)
