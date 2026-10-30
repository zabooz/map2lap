"""Comic ground by land cover (ESA WorldCover 10 m, through BeamNG.Earth's mapdata): a class per terrain cell and
hand-drawn, seamless textures in the style of the trees and the water.

So it doesn't look blocky (stair-step edges on slopes):
- class masks blurred (SMOOTH_M) and per point the strongest class: round outlines instead of 10 m steps (jitter alone
  only shifted the steps, yellow zigzags at field edges); the query points slightly jittered as well.
- fields as Voronoi plots (centres on a jittered FIELD_M grid) instead of 64 m squares; each plot one of
  FIELD_VARIANTS variants.
On top the areas from Overture land_use (OSM landuse/leisure, landuse()): farmland with its real borders, orchards
and vineyards, lawns, pitches, cemeteries, residential and commercial areas ...; smaller over larger, sharply edged.
Under trees, snow and water (WorldCover) WorldCover stays.
Everything depends only on the world position (anchor frame): seamless across tiles and the same on every build.
"""
import math
import random
import zlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import roads as roadsmod

PX = 512
FIELD_M = 70.0              # mean plot size (Voronoi grid)
WARP_M, WARP_SCALE_M = 12.0, 45.0
# WorldCover class -> material (10 trees, 20 shrubland, 30 grassland, 40 cropland, 50 built-up, 60 bare/sparse,
# 70 snow/ice, 80 water, 90 wetland, 95 mangroves, 100 moss/lichen). 60, 70 and 100 used to be all rock and 20 meadow
# (Heiligenblut: 10 % scree, 6 % alpine mats, 3 % glacier in grey)
CLASS_MAT = {10: "gc_forest", 20: "gc_shrub", 30: "gc_meadow", 40: "gc_field", 50: "gc_urban", 60: "gc_scree",
             70: "gc_snow", 90: "gc_wetland", 95: "gc_wetland", 100: "gc_alpine"}
DEFAULT = "gc_meadow"
FIELD_VARIANTS = 6
# Overture land_use class (OSM landuse/leisure) -> material; "@field": farmland, one variant per area
LANDUSE_MAT = {
    "farmland": "@field", "orchard": "gc_orchard", "vineyard": "gc_vineyard", "allotments": "gc_garden",
    "greenhouse_horticulture": "gc_garden", "plant_nursery": "gc_garden", "farmyard": "gc_yard",
    "grass": "gc_lawn", "village_green": "gc_lawn", "park": "gc_lawn", "garden": "gc_lawn",
    "recreation_ground": "gc_lawn", "golf_course": "gc_lawn", "pitch": "gc_pitch", "playground": "gc_sand",
    "cemetery": "gc_cemetery", "grave_yard": "gc_cemetery", "residential": "gc_residential",
    "industrial": "gc_yard", "commercial": "gc_yard", "retail": "gc_yard", "construction": "gc_dirt",
    "brownfield": "gc_dirt", "landfill": "gc_dirt", "quarry": "gc_scree",
    # (counted on the test tracks: meadows are the most common; WorldCover often takes them for cropland)
    "meadow": "gc_meadow", "greenfield": "gc_meadow", "school": "gc_residential", "kindergarten": "gc_residential",
    "schoolyard": "gc_residential", "religious": "gc_residential", "railway": "gc_yard", "stadium": "gc_pitch",
    "dog_park": "gc_lawn", "water_park": "gc_lawn", "camp_site": "gc_lawn",
}
LANDUSE_UNDER = (10, 70, 80)    # WorldCover classes land_use doesn't paint over: trees, snow/ice, water


def _hash2(ix, iy, salt):
    """Uniform values in [0, 1) per integer grid point (deterministic)."""
    h = (ix.astype(np.int64) * 73856093) ^ (iy.astype(np.int64) * 19349663) ^ (salt * 83492791)
    h = (h ^ (h >> 13)) * 1274126177
    return ((h ^ (h >> 16)) & 0xFFFFFF) / float(0x1000000)


def _noise(x, y, scale, salt):
    """Smooth value noise in [-1, 1] (bilinear between hashed grid points, smoothly interpolated)."""
    gx, gy = x / scale, y / scale
    ix, iy = np.floor(gx).astype(np.int64), np.floor(gy).astype(np.int64)
    fx, fy = gx - ix, gy - iy
    fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    v00, v10 = _hash2(ix, iy, salt), _hash2(ix + 1, iy, salt)
    v01, v11 = _hash2(ix, iy + 1, salt), _hash2(ix + 1, iy + 1, salt)
    return 2 * ((v00 * (1 - fx) + v10 * fx) * (1 - fy) + (v01 * (1 - fx) + v11 * fx) * fy) - 1


# Large-scale colour variation (alpine meadows looked plain: the ground textures' pattern repeats every 8 m and can't
# be seen from far away): brightness per (scale m, strength, salt), plus a tint towards yellow or blue-green
MACRO = ((60.0, 0.09, 51), (17.0, 0.04, 52))     # (a first try with 0.07 / 0.035 was barely visible on a tile)
MACRO_TINT = (140.0, 0.06, 53)


def macro(x, y):
    """Factor (..., 3) per world point for the large-scale colour variation (world-locked: seamless across tiles and the distant view)."""
    b = 1.0 + sum(a * _noise(x, y, s, salt) for s, a, salt in MACRO)
    t = MACRO_TINT[1] * _noise(x, y, MACRO_TINT[0], MACRO_TINT[2])
    return np.stack([b * (1 + t), b, b * (1 - t)], -1).astype(np.float32)


def _warp(x, y):
    return (x + WARP_M * _noise(x, y, WARP_SCALE_M, 1), y + WARP_M * _noise(x, y, WARP_SCALE_M, 2))


def _field_variant(x, y):
    """Voronoi plots: one jittered centre per FIELD_M cell; the variant of the nearest centre."""
    gx, gy = np.floor(x / FIELD_M).astype(np.int64), np.floor(y / FIELD_M).astype(np.int64)
    best_d = np.full(x.shape, np.inf)
    best_v = np.zeros(x.shape, np.int64)
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            cx, cy = gx + dx, gy + dy
            sx = (cx + _hash2(cx, cy, 5)) * FIELD_M
            sy = (cy + _hash2(cx, cy, 6)) * FIELD_M
            d = (x - sx) ** 2 + ((y - sy) * 1.6) ** 2          # (slightly stretched: elongated fields)
            closer = d < best_d
            best_d[closer] = d[closer]
            best_v[closer] = (_hash2(cx, cy, 7)[closer] * FIELD_VARIANTS).astype(np.int64)
    return best_v


SMOOTH_M = 10.0             # blur radius of the class masks (rounds off the 10 m pixel steps)


def _box_blur(a, r):
    """Box filter with radius r cells in both directions (twice = roughly Gaussian); edges clipped."""
    for axis in (0, 1):
        c = np.cumsum(np.pad(a, [(r + 1, r) if k == axis else (0, 0) for k in (0, 1)], mode="edge"), axis=axis)
        a = (np.take(c, range(2 * r + 1, c.shape[axis]), axis=axis) -
             np.take(c, range(0, c.shape[axis] - 2 * r - 1), axis=axis)) / (2 * r + 1)
    return a


def classes(frame, md, tx, ty, cell=2.0):
    """WorldCover class per terrain cell of the tile (m, m) [j, i] (0: no data) with soft borders: masks per class
    blurred (SMOOTH_M), then the strongest; query points slightly jittered (organic)."""
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    m = int(round((x1 - x0) / cell))
    pad = int(np.ceil(2 * SMOOTH_M / cell))         # margin so tile borders come out the same
    n = m + 2 * pad
    ci, cj = np.meshgrid(np.arange(n) - pad, np.arange(n) - pad)
    wx, wy = _warp(x0 + (ci.ravel() + 0.5) * cell, y0 + (cj.ravel() + 0.5) * cell)
    la, lo, _ = frame.enu_to_geodetic(wx, wy, 0.0)
    raw = np.zeros(n * n, np.int32)
    for key in roadsmod.cells_of_tile(frame, tx, ty, WARP_M + 2 * SMOOTH_M + 4):
        r = md.cell(key, layers=("landcover",), kind="demand").layers.get("landcover")
        if r is not None:
            raw = np.maximum(raw, np.asarray(r.sample(np.asarray(lo), np.asarray(la)), np.int32))
    raw = raw.reshape(n, n)
    rad = max(1, int(round(SMOOTH_M / cell / 2)))
    best, best_w = raw.copy(), np.full(raw.shape, -1.0)
    for c in np.unique(raw):
        w = _box_blur(_box_blur((raw == c).astype(np.float32), rad), rad)
        better = w > best_w
        best[better], best_w[better] = c, w[better]
    return best[pad:pad + m, pad:pad + m]


def landuse(frame, md, tx, ty, cell=2.0):
    """Material per terrain cell [j, i] from the tile's land_use areas ("" for none), or None without areas.
    Larger ones painted first, smaller ones on top (the pitch in the park in the residential area); holes left out. A
    field gets its variant from its id: all pieces of one area (one per map cell) the same."""
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    m = int(round((x1 - x0) / cell))
    polys = []                  # (area m², material, rings in cells)
    for key in roadsmod.cells_of_tile(frame, tx, ty, 2.0):
        f = md.cell(key, layers=("land_use",), kind="demand").layers.get("land_use")
        if f is None or len(f) == 0 or f.attrs.get("class") is None:
            continue
        cls, xy = f.attrs["class"], f.xy_in(frame)
        for i in np.flatnonzero(f.kind == 3):
            mat = LANDUSE_MAT.get(str(cls[i]))
            if mat is None:
                continue
            if mat == "@field":
                mat = f"gc_field{zlib.crc32(str(f.ids[i]).encode()) % FIELD_VARIANTS}"
            for part in f.parts(i, xy):
                if not part or len(part[0]) < 3:
                    continue
                o = part[0]
                if o[:, 0].max() < x0 or o[:, 0].min() > x1 or o[:, 1].max() < y0 or o[:, 1].min() > y1:
                    continue
                area = 0.5 * abs(np.dot(o[:, 0], np.roll(o[:, 1], 1)) - np.dot(o[:, 1], np.roll(o[:, 0], 1)))
                polys.append((area, mat, [(r - (x0, y0)) / cell - 0.5 for r in part]))     # (cell centres)
    if not polys:
        return None
    index = {name: k + 1 for k, name in enumerate(sorted({p[1] for p in polys}))}
    canvas = Image.new("L", (m, m), 0)                  # row = j (northwards), column = i
    for _, mat, rings in sorted(polys, key=lambda p: -p[0]):
        mask = Image.new("1", (m, m), 0)
        d = ImageDraw.Draw(mask)
        d.polygon([tuple(p) for p in rings[0].tolist()], fill=1)
        for hole in rings[1:]:
            if len(hole) >= 3:
                d.polygon([tuple(p) for p in hole.tolist()], fill=0)
        canvas.paste(index[mat], (0, 0, m, m), mask)
    a = np.asarray(canvas)
    out = np.full((m, m), "", object)
    for name, k in index.items():
        out[a == k] = name
    return out


def materials(frame, md, tx, ty, cell=2.0, water=None):
    """Material per terrain cell (m, m) as an object array: WorldCover (fields as Voronoi plots), on top the land_use
    areas except on trees, snow and water. water: name for WorldCover's water (the distant view paints lakes; close
    by water.py's water lies there, meadow below it)."""
    cls = classes(frame, md, tx, ty, cell)
    x0, y0, _, _ = roadsmod.tile_bbox(tx, ty)
    m = cls.shape[0]
    ci, cj = np.meshgrid(np.arange(m), np.arange(m))
    fx, fy = _warp(x0 + (ci + 0.5) * cell, y0 + (cj + 0.5) * cell)
    variant = _field_variant(fx, fy)
    mats = np.full(cls.shape, DEFAULT, object)
    for c, name in CLASS_MAT.items():
        mats[cls == c] = name
    field = cls == 40
    mats[field] = np.char.add("gc_field", variant[field].astype(str)).astype(object)
    lu = landuse(frame, md, tx, ty, cell)
    if lu is not None:
        on = (lu != "") & ~np.isin(cls, LANDUSE_UNDER)
        mats[on] = lu[on]
    if water is not None:
        mats[cls == 80] = water
    return mats


# --- textures -------------------------------------------------------------------------------------------------

def _wrap_draw(d, shape, coords, **kw):
    """Draws a shape nine times offset (tiles seamlessly)."""
    for ox in (-PX, 0, PX):
        for oy in (-PX, 0, PX):
            pts = [(x + ox, y + oy) for x, y in coords]
            getattr(d, shape)(pts, **kw)


def _base(rgb):
    return Image.new("RGB", (PX, PX), rgb)


def _strokes(img, rng, colors, count, length, width, angle=None, jitter=0.6):
    d = ImageDraw.Draw(img)
    for _ in range(count):
        x, y = rng.uniform(0, PX), rng.uniform(0, PX)
        a = (angle if angle is not None else rng.uniform(0, math.pi)) + rng.uniform(-jitter, jitter)
        ln = rng.uniform(*length)
        _wrap_draw(d, "line", [(x, y), (x + math.cos(a) * ln, y - math.sin(a) * ln)], fill=rng.choice(colors),
                   width=width)


def _dots(img, rng, colors, count, r):
    d = ImageDraw.Draw(img)
    for _ in range(count):
        x, y, s = rng.uniform(0, PX), rng.uniform(0, PX), rng.uniform(*r)
        _wrap_draw(d, "ellipse", [(x - s, y - s), (x + s, y + s)], fill=rng.choice(colors))


def _meadow(rng):
    img = _base((96, 158, 66))
    _dots(img, rng, [(88, 148, 60), (104, 168, 72)], 260, (6, 16))
    _strokes(img, rng, [(70, 128, 50), (122, 182, 80)], 900, (5, 10), 2, angle=math.pi / 2)    # blades of grass
    _dots(img, rng, [(240, 236, 200), (250, 214, 90)], 25, (1.5, 2.5))                         # little flowers
    return img


def _field(rng, a, b, furrow):
    """Field stripes: alternating colour a and b, slightly wavy, plus furrow lines."""
    img = _base(a)
    d = ImageDraw.Draw(img)
    rows = 16
    for k in range(0, rows, 2):
        y0 = k * PX / rows
        pts = [(x, y0 + 3 * math.sin(x / 40 + k)) for x in np.linspace(0, PX, 24)]
        pts += [(x, y0 + PX / rows + 3 * math.sin(x / 40 + k)) for x in np.linspace(PX, 0, 24)]
        d.polygon(pts, fill=b)
    _strokes(img, rng, [furrow], 220, (12, 30), 2, angle=0.0, jitter=0.08)
    return img


def _forest(rng):
    """Forest floor moss green with a few leaves (brown looked like a bare stripe on slopes with few trees)."""
    img = _base((72, 122, 56))
    _dots(img, rng, [(64, 112, 50), (82, 136, 62), (92, 146, 66)], 600, (4, 11))
    _dots(img, rng, [(118, 104, 60), (132, 116, 64)], 90, (2, 5))
    return img


def _urban(rng):
    img = _base((128, 150, 108))
    _dots(img, rng, [(118, 140, 100), (140, 158, 118), (150, 146, 132)], 400, (4, 12))
    return img


def _rock(rng):
    img = _base((142, 140, 134))
    _dots(img, rng, [(128, 126, 120), (160, 158, 150)], 300, (6, 20))
    _strokes(img, rng, [(100, 98, 94)], 120, (10, 34), 2)                                      # cracks
    return img


def _wetland(rng):
    img = _base((82, 140, 112))
    _dots(img, rng, [(74, 128, 104), (96, 156, 128)], 300, (6, 16))
    _strokes(img, rng, [(60, 110, 70), (150, 170, 90)], 500, (8, 16), 2, angle=math.pi / 2, jitter=0.3)
    return img


FIELD_LOOKS = [((132, 178, 76), (112, 160, 64), (96, 140, 56)),      # young green
               ((222, 196, 96), (204, 176, 80), (176, 148, 64)),      # grain
               ((150, 112, 74), (132, 96, 62), (108, 78, 50)),        # ploughed
               ((176, 204, 110), (156, 188, 96), (130, 160, 80)),     # light green
               ((92, 140, 60), (76, 122, 52), (60, 100, 44)),         # maize
               ((206, 190, 130), (190, 172, 112), (164, 148, 94))]    # stubble


# --- more WorldCover classes ---

def _shrub(rng):
    """Shrubland: meadow with dark dabs of bushes."""
    img = _base((104, 150, 64))
    _strokes(img, rng, [(84, 132, 54), (122, 170, 78)], 600, (5, 10), 2, angle=math.pi / 2)
    _dots(img, rng, [(60, 104, 48), (70, 116, 52), (54, 94, 44)], 140, (8, 20))
    return img


def _scree(rng):
    """Scree and bare ground: light grey gravel, stones, a few tufts of grass."""
    img = _base((152, 148, 138))
    _dots(img, rng, [(128, 124, 116), (172, 168, 158), (112, 108, 102), (160, 152, 136)], 1100, (2, 7))
    _dots(img, rng, [(112, 150, 80), (96, 138, 70)], 40, (2, 4))
    return img


def _snow(rng):
    """Snow and glacier: white with bluish hollows and crevasses."""
    img = _base((236, 240, 246))
    _dots(img, rng, [(222, 230, 242), (248, 250, 252), (214, 224, 238)], 220, (10, 34))
    _strokes(img, rng, [(196, 210, 230), (186, 202, 226)], 50, (24, 70), 2, angle=0.3, jitter=0.4)
    return img


def _alpine(rng):
    """Alpine mats (moss, lichen, cushions): olive brown with grey stones."""
    img = _base((128, 142, 92))
    _dots(img, rng, [(112, 128, 80), (146, 152, 100), (150, 128, 96), (120, 136, 74)], 520, (3, 9))
    _dots(img, rng, [(156, 154, 146), (138, 136, 130)], 90, (2, 6))
    return img


# --- land_use ---

def _bands(rng, a, b, rows, wobble=0.0):
    """Two colours in horizontal bands (mowing stripes)."""
    img = _base(a)
    d = ImageDraw.Draw(img)
    for k in range(0, rows, 2):
        y0 = k * PX / rows
        pts = [(x, y0 + wobble * math.sin(x / 50 + k)) for x in np.linspace(0, PX, 24)]
        pts += [(x, y0 + PX / rows + wobble * math.sin(x / 50 + k)) for x in np.linspace(PX, 0, 24)]
        d.polygon(pts, fill=b)
    return img


def _lawn(rng):
    """Lawns and parks: strong green, mowing stripes."""
    img = _bands(rng, (104, 172, 72), (96, 162, 66), 8)
    _strokes(img, rng, [(90, 154, 62), (114, 182, 80)], 500, (4, 8), 2, angle=math.pi / 2)
    return img


def _pitch(rng):
    """Pitch: wide, even mowing stripes."""
    img = _bands(rng, (92, 172, 70), (82, 156, 62), 4)
    _strokes(img, rng, [(86, 164, 66)], 300, (3, 6), 1, angle=math.pi / 2)
    return img


def _sand(rng):
    """Playground: sand."""
    img = _base((214, 196, 150))
    _dots(img, rng, [(200, 182, 136), (226, 210, 168), (190, 172, 128)], 700, (1.5, 4))
    return img


def _cemetery(rng):
    """Cemetery: lawn with gravel paths and gravestones."""
    img = _lawn(rng)
    d = ImageDraw.Draw(img)
    for k in range(4):                                              # gravel paths
        y = k * PX / 4 + PX / 8
        d.rectangle([0, y - 5, PX, y + 5], fill=(186, 180, 166))
    for _ in range(140):                                            # gravestones in rows
        x, k = rng.uniform(0, PX), rng.randrange(4)
        y = k * PX / 4 + PX / 8 + rng.choice((-1, 1)) * 22
        g = rng.choice([(150, 150, 146), (120, 118, 114), (172, 170, 164)])
        _wrap_draw(d, "rectangle", [(x - 5, y - 3), (x + 5, y + 3)], fill=g)
    return img


def _residential(rng):
    """Residential: garden lawn with paved spots and flower beds."""
    img = _base((110, 164, 80))
    _strokes(img, rng, [(96, 152, 70), (124, 176, 90)], 500, (4, 8), 2, angle=math.pi / 2)
    _dots(img, rng, [(90, 150, 64), (130, 112, 80)], 160, (4, 10))
    d = ImageDraw.Draw(img)
    for _ in range(14):                                             # terraces, paths
        x, y = rng.uniform(0, PX), rng.uniform(0, PX)
        w, h = rng.choice([(rng.uniform(24, 44), rng.uniform(16, 30)), (rng.uniform(60, 120), 7)])
        _wrap_draw(d, "rectangle", [(x, y), (x + w, y + h)], fill=rng.choice([(176, 170, 158), (164, 156, 144)]))
    return img


def _yard(rng):
    """Commercial, industrial, yard: concrete and gravel, oil stains."""
    img = _base((156, 152, 142))
    _dots(img, rng, [(140, 136, 128), (170, 166, 156), (150, 146, 134)], 420, (6, 18))
    _dots(img, rng, [(112, 110, 106)], 30, (4, 10))
    return img


def _dirt(rng):
    """Construction site, brownfield, landfill: brown soil with a little grass."""
    img = _base((150, 122, 88))
    _dots(img, rng, [(134, 108, 78), (166, 138, 100), (142, 116, 84)], 520, (3, 10))
    _dots(img, rng, [(110, 146, 74)], 50, (2, 5))
    return img


def _orchard(rng):
    """Orchard: meadow with tree discs in rows."""
    img = _meadow(rng)
    d = ImageDraw.Draw(img)
    for gx in range(4):
        for gy in range(4):
            x, y = (gx + 0.5) * PX / 4, (gy + 0.5) * PX / 4
            d.ellipse([x - 26, y - 26, x + 26, y + 26], fill=(74, 120, 52))
    return img


def _vineyard(rng):
    """Vineyard: green rows of vines on brown soil."""
    img = _bands(rng, (146, 128, 92), (84, 132, 56), 16)
    _dots(img, rng, [(70, 116, 48), (98, 146, 64)], 300, (3, 7))
    return img


def _garden(rng):
    """Allotments and nurseries: a patchwork of beds."""
    img = _base((104, 160, 74))
    d = ImageDraw.Draw(img)
    beds = [(132, 104, 72), (96, 150, 64), (148, 176, 90), (120, 96, 66), (84, 136, 58), (176, 160, 110)]
    for _ in range(46):
        x, y = rng.uniform(0, PX), rng.uniform(0, PX)
        w, h = rng.uniform(30, 70), rng.uniform(18, 40)
        _wrap_draw(d, "rectangle", [(x, y), (x + w, y + h)], fill=rng.choice(beds))
    return img


LOOKS_NEW = {"gc_shrub": _shrub, "gc_scree": _scree, "gc_snow": _snow, "gc_alpine": _alpine, "gc_lawn": _lawn,
             "gc_pitch": _pitch, "gc_sand": _sand, "gc_cemetery": _cemetery, "gc_residential": _residential,
             "gc_yard": _yard, "gc_dirt": _dirt, "gc_orchard": _orchard, "gc_vineyard": _vineyard,
             "gc_garden": _garden}


def make_textures(tex_dir, seed=23):
    """All comic ground textures as PNG into tex_dir; returns {material: file name}. (The newer ones after the older
    ones with their own random: the older ones stay the same pixel for pixel.)"""
    rng = random.Random(seed)
    looks = {"gc_meadow": _meadow, "gc_forest": _forest, "gc_urban": _urban, "gc_rock": _rock,
             "gc_wetland": _wetland}
    out = {}
    for name, fn in looks.items():
        fn(rng).filter(ImageFilter.SMOOTH).save(f"{tex_dir}/{name}.png")
        out[name] = f"{name}.png"
    for k, (a, b, furrow) in enumerate(FIELD_LOOKS):
        _field(rng, a, b, furrow).filter(ImageFilter.SMOOTH).save(f"{tex_dir}/gc_field{k}.png")
        out[f"gc_field{k}"] = f"gc_field{k}.png"
    for k, (name, fn) in enumerate(LOOKS_NEW.items()):
        fn(random.Random(seed * 1000 + k)).filter(ImageFilter.SMOOTH).save(f"{tex_dir}/{name}.png")
        out[name] = f"{name}.png"
    return out
