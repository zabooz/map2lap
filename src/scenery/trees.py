"""Trees and bushes as crossed billboards (two vertical double-sided quads each) from BeamNG.Earth's
vegetation.tile_items (positions, heights, kinds from Meta's tree height data), plus a generated texture atlas.

Atlas (trees.png, SPRITES in rows of COLS): cut out (alpha), anchored at the bottom centre, every image with PAD of
empty margin. The larch only grows high in the mountains (LARCH_FROM_M). Rocks are left out here (as flat quads they
look bad; rocks.py makes them 3D).

Species by region: BeamNG.Earth already turns its generic groups into regional ones (palm, tropical, pine_west,
oak_west, juniper, desert_shrub: vegetation.regional); the generic deciduous, conifer and shrub left over get the
trees of the tile's climate zone (zone(): Koppen-Geiger from BeamNG.Earth's climate map). Wau in South Sudan had
birches and lindens before (2026-10-31).
"""
import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import climate
import vegetation

# the first ten keep their place and their random numbers (the look of the tracks built before the regions)
SPRITES = ("deciduous", "deciduous2", "conifer", "conifer2", "shrub", "birch", "linden", "spruce", "larch",
           "shrub_flowers", "pine", "stone_pine", "cypress", "olive", "acacia", "baobab", "palm", "tropical",
           "dry_shrub", "juniper", "jungle_bush")
COLS = 11
ROWS = (len(SPRITES) + COLS - 1) // COLS
SPRITE_W, SPRITE_H = 256, 512
# px of empty margin around every image: without it the billboard edges reached into the neighbouring image at small
# mip levels (crowns touch the image edge: vertical lines next to conifers) and through the texture repeat into their
# own bottom row (horizontal lines above bushes); clean down to mip level 6 (image 8 pixels high)
PAD = 32
CELL_W, CELL_H = SPRITE_W + 2 * PAD, SPRITE_H + 2 * PAD
# group -> ((sprite, width/height), ...): each tree gets one of them (by its random value; a sprite named twice is
# twice as common). STYLE everywhere, ZONE_STYLE's groups replace it in their climate zone.
STYLE = {"deciduous": (("deciduous", 0.75), ("deciduous2", 0.75), ("birch", 0.55), ("linden", 0.85)),
         "conifer": (("conifer", 0.42), ("conifer2", 0.42), ("spruce", 0.32)),
         "pine_west": (("pine", 0.45), ("pine", 0.45), ("conifer", 0.45)),
         "oak_west": (("linden", 0.9), ("olive", 0.9)),
         "juniper": (("juniper", 0.7),),
         "palm": (("palm", 0.7),),
         "tropical": (("tropical", 0.85),),
         "shrub": (("shrub", 1.3), ("shrub_flowers", 1.2)),
         "desert_shrub": (("dry_shrub", 1.3),)}
ZONE_STYLE = {
    "boreal": {"deciduous": (("birch", 0.55), ("birch", 0.55), ("deciduous", 0.75)),
               "conifer": (("spruce", 0.32), ("spruce", 0.32), ("pine", 0.4), ("conifer2", 0.42))},
    "mediterranean": {"deciduous": (("olive", 0.9), ("olive", 0.9), ("linden", 0.85), ("deciduous", 0.75)),
                      "conifer": (("stone_pine", 1.0), ("cypress", 0.22), ("pine", 0.45)),
                      "shrub": (("dry_shrub", 1.3), ("shrub", 1.3))},
    "savanna": {"deciduous": (("acacia", 1.3),) * 5 + (("deciduous", 0.75),) * 2 + (("baobab", 0.85),),
                "tropical": (("tropical", 0.85), ("acacia", 1.3)),
                "shrub": (("dry_shrub", 1.3), ("dry_shrub", 1.3), ("shrub", 1.3))},
    "rainforest": {"deciduous": (("tropical", 0.85), ("tropical", 0.85), ("deciduous", 0.75)),
                   "shrub": (("jungle_bush", 1.2), ("jungle_bush", 1.2), ("shrub", 1.3))},
    "desert": {"deciduous": (("acacia", 1.3), ("acacia", 1.3), ("olive", 0.9)),
               "conifer": (("juniper", 0.7),),
               "shrub": (("dry_shrub", 1.3),)}}
LARCH = (("larch", 0.4),)
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


def _canvas():
    img = Image.new("RGBA", (SPRITE_W, SPRITE_H), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img), SPRITE_W / 2


def _dabs(d, rng, n, cx, cy, rx, ry, size, green, tint, light=0.4):
    """A crown from n leaf dabs in the ellipse (cx, cy, rx, ry): colour (g * tint[0], g, g * tint[1]), lighter on top."""
    for _ in range(n):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random())
        x, y = cx + math.cos(a) * r * rx, cy + math.sin(a) * r * ry
        s = rng.uniform(*size)
        g = int(min(255, green * (1 - light / 2 + light * (cy + ry - y) / (2 * ry)) + rng.uniform(-10, 10)))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * tint[0]), g, int(g * tint[1]), 255))


def _pine(rng):
    """Scots / ponderosa pine: tall bare trunk, orange-red above, flat dark needle clumps at the top."""
    img, d, cx = _canvas()
    H = SPRITE_H
    d.polygon([(cx - 9, H - 1), (cx + 9, H - 1), (cx + 5, H * 0.14), (cx - 5, H * 0.14)], fill=(92, 62, 46, 255))
    d.polygon([(cx - 7, H * 0.6), (cx + 7, H * 0.6), (cx + 5, H * 0.14), (cx - 5, H * 0.14)], fill=(170, 96, 60, 255))
    for k in range(6):                                  # clumps on short branches, the top one widest
        y = H * (0.12 + 0.065 * k) + rng.uniform(-6, 6)
        bx = cx + (rng.choice((-1, 1)) * rng.uniform(22, 62) if k else 0)
        d.line([(cx, y + 22), (bx, y)], fill=(92, 62, 46, 255), width=6)
        w = SPRITE_W * (0.34 if k == 0 else rng.uniform(0.16, 0.26))
        _dabs(d, rng, 70, bx, y, w, 24, (8, 15), 76, (0.38, 0.5), light=0.5)
    return img


def _stone_pine(rng):
    """Stone pine (Mediterranean umbrella pine): bare forked trunk, broad flat dark crown."""
    img, d, cx = _canvas()
    H = SPRITE_H
    d.polygon([(cx - 6, H - 1), (cx + 6, H - 1), (cx + 4, H * 0.52), (cx - 4, H * 0.52)], fill=(104, 74, 54, 255))
    for side in (-1, 1):
        d.line([(cx, H * 0.54), (cx + side * 40, H * 0.4)], fill=(104, 74, 54, 255), width=7)
    _dabs(d, rng, 420, cx, H * 0.34, SPRITE_W * 0.42, H * 0.085, (9, 18), 84, (0.4, 0.42), light=0.6)
    return img


def _cypress(rng):
    """Italian cypress: a narrow dark green column with a pointed top."""
    img, d, cx = _canvas()
    H = SPRITE_H
    for _ in range(900):
        t = rng.random()                                # 0 top .. 1 bottom
        y = H * (0.03 + 0.9 * t)
        w = SPRITE_W * 0.42 * min(1.0, math.sin(math.pi * min(t * 0.62 + 0.04, 0.5)) * 1.25) * (1 - 0.18 * t)
        x = cx + rng.uniform(-1, 1) * w
        s = rng.uniform(8, 15)
        g = int(66 + 22 * (1 - t) + rng.uniform(-8, 8))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.34), g, int(g * 0.36), 255))
    d.rectangle([cx - 6, H * 0.93, cx + 6, H - 1], fill=(80, 58, 42, 255))
    return img


def _olive(rng):
    """Olive: short, gnarled grey trunk, loose silvery grey-green crown."""
    img, d, cx = _canvas()
    H = SPRITE_H
    for off in (-14, 12):                               # two twisted stems
        pts = [(cx + off * (1 - t) + 10 * math.sin(t * 5 + off), H - 1 - t * H * 0.42) for t in [k / 8 for k in range(9)]]
        d.line(pts, fill=(118, 104, 88, 255), width=16, joint="curve")
    _dabs(d, rng, 300, cx, H * 0.4, SPRITE_W * 0.46, H * 0.22, (8, 18), 128, (0.74, 0.64), light=0.35)
    return img


def _acacia(rng):
    """Umbrella thorn acacia: thin forked trunk, a wide, thin, flat-topped crown."""
    img, d, cx = _canvas()
    H = SPRITE_H
    bark = (88, 66, 50, 255)
    d.polygon([(cx - 5, H - 1), (cx + 5, H - 1), (cx + 3, H * 0.6), (cx - 3, H * 0.6)], fill=bark)
    for dx, top in ((-70, 0.38), (-20, 0.36), (30, 0.37), (75, 0.39)):
        d.line([(cx, H * 0.62), (cx + dx * 0.5, H * 0.5), (cx + dx, H * top)], fill=bark, width=5, joint="curve")
    _dabs(d, rng, 260, cx, H * 0.33, SPRITE_W * 0.44, H * 0.05, (7, 13), 104, (0.66, 0.32), light=0.7)
    _dabs(d, rng, 90, cx + rng.uniform(-30, 30), H * 0.28, SPRITE_W * 0.3, H * 0.035, (6, 11), 112, (0.66, 0.32))
    return img


def _baobab(rng):
    """Baobab: a huge bottle-shaped grey trunk with stubby branches and sparse small leaf clumps."""
    img, d, cx = _canvas()
    H = SPRITE_H
    bark = (150, 132, 112, 255)
    d.polygon([(cx - 70, H - 1), (cx - 84, H * 0.75), (cx - 58, H * 0.52), (cx - 30, H * 0.42), (cx + 30, H * 0.42),
               (cx + 58, H * 0.52), (cx + 84, H * 0.75), (cx + 70, H - 1)], fill=bark)
    for _ in range(9):                                  # bark furrows
        x = cx + rng.uniform(-60, 60)
        d.line([(x, H * rng.uniform(0.5, 0.6)), (x + rng.uniform(-6, 6), H - 6)], fill=(122, 106, 90, 255), width=3)
    for k in range(7):                                  # stubby branches, leaf clumps at their ends
        a = math.radians(-170 + 160 * k / 6 + rng.uniform(-8, 8))
        ex, ey = cx + math.cos(a) * rng.uniform(70, 115), H * 0.42 + math.sin(a) * rng.uniform(60, 120)
        d.line([(cx + math.cos(a) * 20, H * 0.43), (ex, ey)], fill=bark, width=14)
        _dabs(d, rng, 26, ex, ey - 8, 28, 18, (6, 11), 100, (0.6, 0.3))
    return img


def _palm(rng):
    """Palm: slim, slightly bent ringed trunk, a crown of long drooping fronds."""
    img, d, cx = _canvas()
    H = SPRITE_H
    top = (cx - 14, H * 0.2)
    trunk = [(cx + 12 * (1 - t) ** 2 - 14 * t, H - 1 - t * (H - 1 - top[1])) for t in [k / 20 for k in range(21)]]
    d.line(trunk, fill=(150, 122, 88, 255), width=14, joint="curve")
    for x, y in trunk[1:-1:2]:                          # rings
        d.line([(x - 7, y), (x + 7, y + 3)], fill=(112, 88, 62, 255), width=3)
    for k in range(15):
        a = math.radians(-190 + 200 * k / 14 + rng.uniform(-8, 8))
        L, droop = rng.uniform(100, 118), rng.uniform(0.7, 1.2)
        for j in range(1, 26):                          # leaflets along the frond, smaller to the tip
            t = j / 25
            x = top[0] + math.cos(a) * L * t
            y = top[1] + math.sin(a) * L * t * 0.7 + droop * L * t * t * 0.9
            s = 15 * (1 - t) + 5
            g = int(112 + rng.uniform(-14, 10) - 20 * t)
            d.ellipse([x - s, y - s * 0.7, x + s, y + s * 0.7], fill=(int(g * 0.5), g, int(g * 0.3), 255))
    return img


def _tropical(rng):
    """Rainforest tree: tall pale trunk, a dense deep green crown of several round clumps."""
    img, d, cx = _canvas()
    H = SPRITE_H
    pale = (168, 158, 138, 255)
    d.polygon([(cx - 10, H - 1), (cx + 10, H - 1), (cx + 6, H * 0.36), (cx - 6, H * 0.36)], fill=pale)
    for side in (-1, 1):
        d.line([(cx, H * 0.42), (cx + side * 55, H * 0.3)], fill=pale, width=8)
    for k in range(6):
        ccx = cx + rng.uniform(-0.22, 0.22) * SPRITE_W
        ccy = H * rng.uniform(0.14, 0.32)
        _dabs(d, rng, 110, ccx, ccy, SPRITE_W * 0.17, H * 0.08, (9, 18), 88, (0.32, 0.26), light=0.6)
    return img


def _dry_shrub(rng):
    """Dry country bush: low, sparse, olive and grey-brown, bare twigs showing."""
    img, d, cx = _canvas()
    H = SPRITE_H
    for _ in range(14):
        a = rng.uniform(math.pi * 1.1, math.pi * 1.9)
        d.line([(cx, H - 2), (cx + math.cos(a) * 110, H - 2 + math.sin(a) * 160)], fill=(104, 86, 66, 255), width=3)
    for _ in range(150):
        a, r = rng.uniform(math.pi, 2 * math.pi), math.sqrt(rng.random())
        x, y = cx + math.cos(a) * r * SPRITE_W * 0.46, H - 4 + math.sin(a) * r * H * 0.36
        s = rng.uniform(7, 15)
        g = int(112 + rng.uniform(-16, 16))
        dry = rng.random() < 0.35
        d.ellipse([x - s, y - s, x + s, y + s],
                  fill=(int(g * 0.95), int(g * 0.88), int(g * 0.62), 255) if dry else (int(g * 0.72), g, int(g * 0.44), 255))
    return img


def _juniper(rng):
    """Juniper: small, dense, irregular, dark blue-green down to the ground."""
    img, d, cx = _canvas()
    H = SPRITE_H
    d.rectangle([cx - 7, H * 0.88, cx + 7, H - 1], fill=(92, 70, 52, 255))
    for _ in range(520):
        t = rng.random()
        y = H * (0.12 + 0.78 * t)
        w = SPRITE_W * (0.12 + 0.24 * math.sin(math.pi * min(1.0, 0.25 + 0.75 * t)))
        x = cx + rng.uniform(-1, 1) * w + 12 * math.sin(t * 9)
        s = rng.uniform(8, 16)
        g = int(74 + 18 * (1 - t) + rng.uniform(-8, 8))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * 0.46), g, int(g * 0.62), 255))
    return img


def _jungle_bush(rng):
    """Tropical undergrowth: big glossy leaves fanning out from the ground."""
    img, d, cx = _canvas()
    H = SPRITE_H
    for _ in range(46):
        a = rng.uniform(math.pi * 1.05, math.pi * 1.95)
        L = rng.uniform(90, 170)
        bx, by = cx + rng.uniform(-20, 20), H - 2
        tx, ty = bx + math.cos(a) * L, by + math.sin(a) * L * 1.4
        nx, ny = -math.sin(a) * L * 0.22, math.cos(a) * L * 0.22
        mx, my = (bx + tx) / 2, (by + ty) / 2
        g = int(124 + rng.uniform(-22, 22))
        d.polygon([(bx, by), (mx + nx, my + ny), (tx, ty), (mx - nx, my - ny)],
                  fill=(int(g * 0.38), g, int(g * 0.26), 255))
        d.line([(bx, by), (tx, ty)], fill=(int(g * 0.3), int(g * 0.8), int(g * 0.2), 255), width=2)
    return img


def zone(lat, lon):
    """The tile's climate zone for the species (Koppen-Geiger class, climate.koppen_at): rainforest (Af, Am), savanna
    (Aw, BSh), desert (BWh, BWk), mediterranean (Csa, Csb outside North America, where BeamNG.Earth's own western
    species stand), boreal (D and E north of 55 degrees: Scandinavia, Finland, Russia, Canada; the Alps' Dfc and ET
    stay temperate), else temperate."""
    k = climate.koppen_at(lat, lon)
    if k in (1, 2):
        return "rainforest"
    if k in (3, 6):
        return "savanna"
    if k in (4, 5):
        return "desert"
    if k in (8, 9) and not (lat > 24.0 and -170.0 < lon < -50.0):
        return "mediterranean"
    if k >= 17 and abs(lat) > 55.0:
        return "boreal"
    return "temperate"


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
    atlas = Image.new("RGBA", (CELL_W * COLS, CELL_H * ROWS), (0, 0, 0, 0))
    at = lambda k: ((k % COLS) * CELL_W, (k // COLS) * CELL_H)      # noqa: E731
    for k, fn in enumerate((_deciduous, _deciduous, _conifer, _conifer, _shrub)):
        atlas.paste(_cell(fn(rng)), at(k))
    for k, fn in enumerate((_birch, _linden, _spruce, _larch, _shrub_flowers, _pine, _stone_pine, _cypress, _olive,
                            _acacia, _baobab, _palm, _tropical, _dry_shrub, _juniper, _jungle_bush), 5):
        atlas.paste(_cell(fn(random.Random(seed * 1000 + k))), at(k))    # (own random: the first five stay the same)
    atlas.save(path)
    return path


def tile_items(frame, tx, ty, veg, elev):
    """Trees, bushes and rocks of the tile: (group name, x, y, z, rotation, height or size, random value) in ENU."""
    rows = vegetation.tile_items(frame, tx, ty, veg, lambda k: True, elev) or []
    return [(vegetation.GROUPS[int(g)], x, y, z, yaw, height, rank) for g, x, y, z, yaw, _s, height, rank in rows]


def tile_zone(frame, items):
    """The climate zone (zone()) at the first of the tile's items (ENU), temperate without any."""
    if not items:
        return "temperate"
    lat, lon, _ = frame.enu_to_geodetic(float(items[0][1]), float(items[0][2]))
    return zone(float(lat), float(lon))


def tile_trees(frame, tx, ty, veg, elev, wet=None, extra=()):
    """Billboard mesh (P, UV, T) in ENU for the tile's trees, or None. wet(x, y) -> bool: in water.
    extra: more trees (group name, x, y, z, rotation, height, random value), e.g. street trees from the props."""
    items = tile_items(frame, tx, ty, veg, elev) + list(extra)
    return billboards(items, wet, tile_zone(frame, items))


def billboards(items, wet=None, zone="temperate"):
    """Crossed billboards for (group name, x, y, z, rotation, height, random value) in the climate zone (zone());
    (P, UV, T) or None."""
    style = {**STYLE, **ZONE_STYLE.get(zone, {})}
    P, UV, T = [], [], []
    for name, x, y, z, yaw, height, rank in items:
        if name in SKIP or (wet is not None and wet(x, y)):
            continue
        looks = style.get(name, style["deciduous"])
        if (name == "conifer" and zone in ("temperate", "boreal") and z > LARCH_FROM_M
                and int(rank * 7919) % 3 == 0):
            looks = LARCH
        sprite, ratio = looks[int(rank * 1000) % len(looks)]
        k = SPRITES.index(sprite)
        col, row = k % COLS, k // COLS
        h = max(0.8, float(height))
        w = h * ratio
        u0 = (col * CELL_W + PAD) / (COLS * CELL_W)         # (only the image, without the cell's margin)
        u1 = u0 + SPRITE_W / (COLS * CELL_W)
        v0 = 1.0 - ((row + 1) * CELL_H - PAD) / (ROWS * CELL_H)     # (v from the bottom, rows from the top)
        v1 = 1.0 - (row * CELL_H + PAD) / (ROWS * CELL_H)
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
