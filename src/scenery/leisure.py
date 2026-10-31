"""Leisure grounds and tall utilities in comic style, from the map's areas and points round a tile (Overture's base
layers, in the anchor frame):
- pools (water class swimming_pool, reflecting_pool, fountain up to water.BASIN_MAX_M2): a level basin standing on the
  ground with a tiled rim and light blue water; on a slope its downhill side shows the wall (a pool is built level);
- playgrounds (land_use playground): play devices (swing, slide tower, climbing frame, seesaw, sandpit), one per
  PLAY_M2 of the area;
- fountains (infrastructure fountain: a stone basin on its outline, a round one round a point, a column in it), wells
  (drinking_water with man_made=water_well: a stone trough with its spout) and drinking fountains and taps (a pedestal);
- cemeteries (land_use cemetery, grave_yard): headstones and crosses in rows along the area's long side;
- pitches (land_use pitch, track; the sport from groundcover.pitch): the markings of a football pitch, a basketball
  court and a running track's lanes (pitch_layout; ground.py paints them into the terrain texture: marks()), the
  goals and hoops as models;
- silos and storage tanks (infrastructure, outline or point): a cylinder, a prism where the outline isn't round;
  communication and mobile phone masts (lattice or tube; a concrete TV tower from TV_MIN_M), floodlight masts turned
  to the nearest pitch.
One atlas (leisure.png, ATLAS x ATLAS cells, RGBA: the nets cut out by the alpha test). Nothing inside the buildings as drawn (the road tiles' footprints): a
tank or silo mapped as a building too is the building's (buildings.py draws it).
"""
import math
import zlib

import numpy as np
from PIL import Image, ImageDraw

import buildings as buildingsmod
import roads as roadsmod
from scenery import groundcover, propsmesh, water

MATERIAL = "leisure"
ATLAS, CELL = 5, 128
(POOL, TILE, STONE, GRANITE, MARBLE, WOOD, RED, YELLOW, BLUE, METAL, CONCRETE, TANK, SAND, DARK, LAMP,
 WHITE, NET, ORANGE) = range(18)

POOL_RIM_W = 0.3            # m: the coping round a pool (a row of edge stones)
POOL_RIM_H = 0.15           # m: the rim over the highest ground round the pool
POOL_WATER_DOWN = 0.1       # m: the water under the rim
POOL_SKIRT_M = 0.3          # m: the outer wall reaches under the ground round it

PLAY_CLASSES = ("playground",)
PLAY_M2 = 80.0              # m² per device: its safety zone (a swing's ~35 m², EN 1176) and the paths between them
PLAY_MAX = 6
PLAY_EDGE_M = 2.0           # m from the area's edge and from buildings
PLAY_GAP_M = 5.0            # m between two devices' centres
PLAY_GRID_M = 1.0           # m: the candidate spots

GRAVE_CLASSES = ("cemetery", "grave_yard")
GRAVE_ALONG_M = 1.5         # m between headstones in a row (a grave ~1 m wide and the gap)
GRAVE_ROW_M = 3.0           # m between rows (a grave ~2 m long and the path in front)
GRAVE_BLOCK = (5, 12)       # every 5th row and 12th column left out: the paths between the blocks
GRAVE_EDGE_M = 1.5          # m from the area's edge and from buildings (the chapel)
GRAVE_CAP = 2500            # headstones per tile at most (a big city cemetery: evenly thinned)
CROSS_SHARE = 0.15

FOUNTAIN_CLASSES = ("fountain", "drinking_water")
FOUNTAIN_R_M = 1.5          # m: the basin round a fountain mapped as a point (a village square's, ~3 m across)
FOUNTAIN_RIM = (0.35, 0.5)  # m: a basin's stone rim, wide and high (a seat's height is ~0.45)
FOUNTAIN_COLUMN_M2 = 200.0  # a basin up to this big gets the column with the spouts (a larger one: a pond with jets)
FLAT_FOUNTAINS = ("splash_pad", "nozzle")       # (OSM fountain=*: jets out of the paving, no basin)
PEDESTALS = ("water_tap", "drinking", "bubbler", "bottle_refill")    # (OSM man_made=* / fountain=*)

TOWER_CLASSES = ("silo", "storage_tank", "communication_tower", "mobile_phone_tower", "lighting")
ROUND_FILL = 0.8            # area / circle round its farthest vertex: a circle's ~0.97, a square's 0.64
CYL_N = 16
# heights without a mapped one: a farm's tower silo is ~3 times as high as wide (6 m wide, 18 m), a tank about as high
# as wide up to an oil tank's ~15 m; a phone mast 20-40 m, a floodlight mast round a pitch 15-25 m
SILO_H = (3.0, 8.0, 35.0)   # (height per diameter, least, most)
TANK_H = (0.8, 3.0, 15.0)
POINT_R_M = 3.0             # m: a silo or tank mapped as a point
MAST_H = {"communication_tower": 40.0, "mobile_phone_tower": 30.0, "lighting": 18.0}
TV_MIN_M = 60.0             # m: a communication tower (OSM man_made=tower) this high is a concrete TV tower
LIGHT_REACH_M = 120.0       # m: a floodlight mast faces the nearest pitch this close


def _hash(*key):
    return zlib.crc32("|".join(str(k) for k in key).encode()) / 4294967296.0


# --- atlas --------------------------------------------------------------------------------------------------

def _cell(k):
    return (k % ATLAS) * CELL, (k // ATLAS) * CELL


def make_atlas(path):
    img = Image.new("RGBA", (ATLAS * CELL, ATLAS * CELL), (200, 200, 200, 255))
    d = ImageDraw.Draw(img)
    flat = {POOL: (112, 200, 228), TILE: (232, 232, 224), STONE: (168, 164, 156), GRANITE: (92, 92, 98),
            MARBLE: (214, 212, 206), WOOD: (150, 104, 62), RED: (206, 52, 44), YELLOW: (240, 196, 50),
            BLUE: (52, 110, 200), METAL: (176, 182, 188), CONCRETE: (196, 190, 176), TANK: (226, 228, 224),
            SAND: (220, 200, 150), DARK: (54, 56, 60), LAMP: (90, 94, 100), WHITE: (245, 245, 240),
            ORANGE: (232, 110, 30)}
    for k, col in flat.items():
        x, y = _cell(k)
        d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=col)
    x, y = _cell(POOL)                                      # light lines on the pool's floor
    for k in range(9):
        yy = y + 8 + k * 14
        d.line([(x + t, yy + 4 * math.sin(t / 9 + k)) for t in range(0, CELL, 4)], fill=(186, 236, 248), width=2)
    x, y = _cell(TILE)                                      # tiles
    for t in range(0, CELL, 16):
        d.line([(x + t, y), (x + t, y + CELL)], fill=(200, 200, 194), width=2)
        d.line([(x, y + t), (x + CELL, y + t)], fill=(200, 200, 194), width=2)
    x, y = _cell(WOOD)                                      # grain
    for yy in range(y + 10, y + CELL, 18):
        d.line([(x + 4, yy), (x + CELL - 4, yy + 4)], fill=(120, 82, 48), width=3)
    x, y = _cell(CONCRETE)                                  # a silo's rings
    for yy in range(y + 16, y + CELL, 32):
        d.line([(x, yy), (x + CELL, yy)], fill=(170, 164, 150), width=3)
    x, y = _cell(TANK)                                      # a tank's seams
    for xx in range(x + 16, x + CELL, 32):
        d.line([(xx, y), (xx, y + CELL)], fill=(196, 198, 194), width=2)
    x, y = _cell(SAND)
    for k in range(300):
        px, py = x + _hash("sand", k, 0) * CELL, y + _hash("sand", k, 1) * CELL
        d.ellipse([px - 1.5, py - 1.5, px + 1.5, py + 1.5], fill=(200, 180, 132))
    x, y = _cell(NET)                                       # a net: white cords, the rest cut out
    d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=(0, 0, 0, 0))
    for t in range(0, CELL, 12):
        d.line([(x + t, y), (x + t, y + CELL - 1)], fill=(240, 240, 236, 255), width=2)
        d.line([(x, y + t), (x + CELL - 1, y + t)], fill=(240, 240, 236, 255), width=2)
    x, y = _cell(LAMP)                                      # a floodlight's lamps
    for i in range(4):
        for j in range(3):
            cx, cy = x + 16 + i * 32, y + 22 + j * 42
            d.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], fill=(255, 248, 214))
    img.save(path)
    return path


# --- geometry -----------------------------------------------------------------------------------------------

class Builder(propsmesh.Builder):
    """propsmesh's quads, boxes and bars on this module's atlas, plus triangles and cylinders."""

    def _uv(self, k, u, v):
        x, y = _cell(k)
        inset = 6
        return ((x + inset + u * (CELL - 2 * inset)) / (ATLAS * CELL),
                1.0 - (y + inset + (1 - v) * (CELL - 2 * inset)) / (ATLAS * CELL))

    def poly(self, P, T, UV01, k):
        """Triangles T (m, 3) over points P (n, 3), UV01 (n, 2) within cell k."""
        base = len(self.P)
        for p, (u, v) in zip(np.asarray(P, float), np.asarray(UV01, float)):
            self.P.append(tuple(p))
            self.UV.append(self._uv(k, min(max(u, 0.0), 1.0), min(max(v, 0.0), 1.0)))
        self.T += [(base + int(a), base + int(b), base + int(c)) for a, b, c in T]

    def cylinder(self, cx, cy, z0, z1, r0, k, r1=None, cap=None, n=CYL_N):
        """A (tapered) cylinder's side from z0 (radius r0) to z1 (r1, r0 without); cap: a flat top in that cell."""
        r1 = r0 if r1 is None else r1
        a = np.linspace(0.0, 2 * math.pi, n + 1)
        c, s = np.cos(a), np.sin(a)
        for i in range(n):
            self.quad((cx + r0 * c[i], cy + r0 * s[i], z0), (cx + r0 * c[i + 1], cy + r0 * s[i + 1], z0),
                      (cx + r1 * c[i + 1], cy + r1 * s[i + 1], z1), (cx + r1 * c[i], cy + r1 * s[i], z1), k)
        if cap is not None:
            self.cone(cx, cy, z1, z1, r1, cap, n)

    def cone(self, cx, cy, z0, z1, r, k, n=CYL_N):
        """A cone (a disc when z1 == z0) of radius r from z0 up to its tip at z1."""
        a = np.linspace(0.0, 2 * math.pi, n + 1)[:-1]
        P = np.c_[np.r_[cx + r * np.cos(a), cx], np.r_[cy + r * np.sin(a), cy], np.r_[np.full(n, z0), z1]]
        UV = np.r_[np.c_[0.5 + 0.5 * np.cos(a), 0.5 + 0.5 * np.sin(a)], [(0.5, 0.5)]]
        self.poly(P, [(i, (i + 1) % n, n) for i in range(n)], UV, k)

    def prism(self, ring, z0, z1, k, roof=None):
        """Walls over the counter-clockwise ring (n, 2) from z0 to z1, a flat roof in cell roof (k without)."""
        n = len(ring)
        for i in range(n):
            a, b = ring[i], ring[(i + 1) % n]
            self.quad((*a, z0), (*b, z0), (*b, z1), (*a, z1), k)
        T = buildingsmod.triangulate(ring)
        lo, span = ring.min(0), np.maximum(np.ptp(ring, 0), 1e-6)
        self.poly(np.c_[ring, np.full(n, z1)], T, (ring - lo) / span, k if roof is None else roof)


def _frame(x, y, z, yaw):
    """pt(along, across, up): a point of a model standing at (x, y, z), its length along yaw (rad)."""
    u, v = np.array([math.cos(yaw), math.sin(yaw)]), np.array([-math.sin(yaw), math.cos(yaw)])

    def pt(a, c, h):
        p = np.array([x, y]) + a * u + c * v
        return float(p[0]), float(p[1]), z + h
    return pt


def _box(b, pt, a, c, h0, la, lc, lh, yaw, k):
    """A box centred at (along a, across c) of the model pt, bottom h0, sizes along la, across lc, up lh."""
    x, y, z = pt(a, c, h0)
    b.box(x, y, z, lc, la, lh, yaw - math.pi / 2, k)


# --- shapes -------------------------------------------------------------------------------------------------

def _outer(parts):
    """The first part's outer ring, counter-clockwise and cleaned (buildings.clean_ring), or None."""
    if not parts or not parts[0] or len(parts[0][0]) < 4:
        return None
    return buildingsmod.clean_ring(parts[0][0])


def _area(ring):
    return 0.5 * abs(float(np.dot(ring[:, 0], np.roll(ring[:, 1], 1)) - np.dot(ring[:, 1], np.roll(ring[:, 0], 1))))


def _offset(ring, w):
    """The counter-clockwise ring (n, 2) moved w m outwards (mitred, at most 3 w at a sharp corner). Pure."""
    d = np.roll(ring, -1, 0) - ring
    d /= np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
    nrm = np.c_[d[:, 1], -d[:, 0]]                  # outwards of edge k -> k + 1
    m = nrm + np.roll(nrm, 1, 0)                    # at vertex k: edges k - 1 and k
    m /= np.maximum(np.linalg.norm(m, axis=1, keepdims=True), 1e-9)
    cos = np.maximum((m * nrm).sum(1), 1.0 / 3.0)
    return ring + m * (w / cos)[:, None]


def inside(pts, rings):
    """(inside, distance to the nearest edge) of the points (k, 2) for the polygon of rings (outer ring first, then its
    holes; even-odd). Pure."""
    pts = np.asarray(pts, np.float64).reshape(-1, 2)
    odd = np.zeros(len(pts), bool)
    dist = np.full(len(pts), np.inf)
    for r in rings:
        r = np.asarray(r, np.float64).reshape(-1, 2)
        if len(r) < 3:
            continue
        a, b = r, np.roll(r, -1, 0)
        d = b - a
        t = np.clip(((pts[:, None, :] - a[None]) * d[None]).sum(2) / np.maximum((d * d).sum(1), 1e-12)[None], 0, 1)
        dist = np.minimum(dist, np.hypot(*(a[None] + t[..., None] * d[None] - pts[:, None, :]).transpose(2, 0, 1))
                          .min(1))
        cross = ((a[None, :, 1] > pts[:, None, 1]) != (b[None, :, 1] > pts[:, None, 1])) & (
            pts[:, None, 0] < a[None, :, 0] + (pts[:, None, 1] - a[None, :, 1]) * d[None, :, 0]
            / np.where(d[None, :, 1] == 0, 1e-12, d[None, :, 1]))
        odd ^= cross.sum(1) % 2 == 1
    return odd, dist


def _clear(pts, blockers, clear):
    """Mask of the points outside every blocker ring and clear m from its walls at least."""
    ok = np.ones(len(pts), bool)
    for r in blockers:
        r = np.asarray(r, np.float64).reshape(-1, 2)
        lo, hi = r.min(0) - clear, r.max(0) + clear
        near = np.flatnonzero(((pts >= lo) & (pts <= hi)).all(1) & ok)
        if len(near):
            ins, dist = inside(pts[near], [r])
            ok[near] = ~ins & (dist >= clear)
    return ok


# --- pools --------------------------------------------------------------------------------------------------

def pool(b, ring, ground, rim=TILE, rim_w=POOL_RIM_W, rim_h=POOL_RIM_H):
    """A pool on the counter-clockwise outline ring (n, 2): the water level over the highest ground round it, a rim of
    cell rim (tiles; stone round a fountain) rim_w wide and rim_h high, its outer wall down into the ground. Returns
    the rim's top (None for no pool)."""
    n = len(ring)
    T = buildingsmod.triangulate(ring)
    if n < 3 or not len(T):
        return None
    out = _offset(ring, rim_w)
    zo = np.asarray(ground(out[:, 0], out[:, 1]), float)
    top = max(float(np.max(ground(ring[:, 0], ring[:, 1]))), float(zo.max())) + rim_h
    wl = top - POOL_WATER_DOWN
    lo, span = ring.min(0), np.maximum(np.ptp(ring, 0), 1e-6)
    b.poly(np.c_[ring, np.full(n, wl)], T, (ring - lo) / span, POOL)
    for k in range(n):
        j = (k + 1) % n
        b.quad((*out[k], top), (*out[j], top), (*ring[j], top), (*ring[k], top), rim)
        b.quad((*out[k], zo[k] - POOL_SKIRT_M), (*out[j], zo[j] - POOL_SKIRT_M), (*out[j], top), (*out[k], top), rim)
        b.quad((*ring[j], wl), (*ring[k], wl), (*ring[k], top), (*ring[j], top), rim)
    return top


def fountain(b, ring, centre, ground):
    """A fountain: a stone basin on the counter-clockwise outline ring (None: a round one FOUNTAIN_R_M round centre),
    a column with a bowl and spouts in a basin up to FOUNTAIN_COLUMN_M2."""
    if ring is None:
        a = np.linspace(0.0, 2 * math.pi, 13)[:-1]
        ring = np.c_[centre[0] + FOUNTAIN_R_M * np.cos(a), centre[1] + FOUNTAIN_R_M * np.sin(a)]
    top = pool(b, ring, ground, STONE, *FOUNTAIN_RIM)
    if top is None or _area(ring) > FOUNTAIN_COLUMN_M2 or not inside([centre], [ring])[0][0]:
        return
    x, y = float(centre[0]), float(centre[1])
    b.cylinder(x, y, top - 0.3, top + 0.9, 0.22, STONE, n=8)
    b.cylinder(x, y, top + 0.9, top + 1.05, 0.5, STONE, cap=POOL, n=10)
    b.cylinder(x, y, top + 1.05, top + 1.5, 0.12, STONE, r1=0.06, n=8)
    for k in range(4):                                  # spouts
        a = k * math.pi / 2
        b.beam((x + 0.2 * math.cos(a), y + 0.2 * math.sin(a), top + 0.6),
               (x + 0.45 * math.cos(a), y + 0.45 * math.sin(a), top + 0.55), 0.03, METAL)


def trough(b, x, y, z, yaw):
    """A well's stone trough (2 x 0.8 m, 0.75 m high) with water in it and a post with its spout at one end."""
    pt = _frame(x, y, z, yaw)
    _box(b, pt, 0.0, 0.0, -0.3, 2.0, 0.8, 1.05, yaw, STONE)
    b.quad(pt(-0.9, -0.3, 0.76), pt(0.9, -0.3, 0.76), pt(0.9, 0.3, 0.76), pt(-0.9, 0.3, 0.76), POOL)
    _box(b, pt, -1.15, 0.0, -0.3, 0.25, 0.25, 1.7, yaw, WOOD)
    b.beam(pt(-1.05, 0.0, 1.15), pt(-0.7, 0.0, 1.05), 0.025, METAL)


def pedestal(b, x, y, z):
    """A drinking fountain or tap: a stone column with a metal bowl."""
    b.cylinder(x, y, z - 0.2, z + 0.85, 0.18, STONE, n=8)
    b.cylinder(x, y, z + 0.85, z + 0.95, 0.28, METAL, cap=METAL, n=8)


# --- playgrounds --------------------------------------------------------------------------------------------

def _swing(b, pt, yaw, col):
    """A-frame 3 m long, 2.3 m high, two seats."""
    for e in (-1.5, 1.5):
        for s in (-0.9, 0.9):
            b.beam(pt(e, s, 0.0), pt(e, 0.0, 2.3), 0.05, col)
    b.beam(pt(-1.6, 0.0, 2.3), pt(1.6, 0.0, 2.3), 0.06, col)
    for a in (-0.65, 0.65):
        for c in (-0.2, 0.2):
            b.beam(pt(a + c, 0.0, 2.3), pt(a + c, 0.0, 0.45), 0.012, METAL)
        _box(b, pt, a, 0.0, 0.41, 0.5, 0.2, 0.04, yaw, RED)


def _slide(b, pt, yaw, col):
    """A tower with a 1.5 m platform and a roof, a ladder up, the slide down."""
    for a in (-0.55, 0.55):
        for c in (-0.55, 0.55):
            b.beam(pt(a, c, 0.0), pt(a, c, 2.5), 0.05, WOOD)
    _box(b, pt, 0.0, 0.0, 1.45, 1.2, 1.2, 0.08, yaw, WOOD)
    apex = pt(0.0, 0.0, 3.2)
    corners = [pt(-0.7, -0.7, 2.5), pt(0.7, -0.7, 2.5), pt(0.7, 0.7, 2.5), pt(-0.7, 0.7, 2.5)]
    for i in range(4):
        b.poly([corners[i], corners[(i + 1) % 4], apex], [(0, 1, 2)], [(0, 0), (1, 0), (0.5, 1)], col)
    for c in (-0.25, 0.25):
        b.beam(pt(-1.4, c, 0.0), pt(-0.6, c, 1.5), 0.03, METAL)
    for k in range(1, 5):
        f = k / 5
        b.beam(pt(-1.4 + 0.8 * f, -0.25, 1.5 * f), pt(-1.4 + 0.8 * f, 0.25, 1.5 * f), 0.02, METAL)
    w = 0.3
    path = [(0.6, 1.5), (2.9, 0.35), (3.4, 0.3)]
    for (a0, h0), (a1, h1) in zip(path[:-1], path[1:]):
        b.quad(pt(a0, -w, h0), pt(a1, -w, h1), pt(a1, w, h1), pt(a0, w, h0), YELLOW, back=YELLOW)
        for s in (-w, w):
            b.quad(pt(a0, s, h0), pt(a1, s, h1), pt(a1, s, h1 + 0.15), pt(a0, s, h0 + 0.15), YELLOW, back=YELLOW)


def _climber(b, pt, yaw, col):
    """A climbing frame: a 2 m cube of bars, rungs on two sides."""
    s = 1.0
    for a in (-s, s):
        for c in (-s, s):
            b.beam(pt(a, c, 0.0), pt(a, c, 2.0), 0.05, col)
    for h in (1.0, 2.0):
        for (a0, c0), (a1, c1) in (((-s, -s), (s, -s)), ((s, -s), (s, s)), ((s, s), (-s, s)), ((-s, s), (-s, -s))):
            b.beam(pt(a0, c0, h), pt(a1, c1, h), 0.04, col)
    for h in (0.5, 1.5):
        for c in (-s, s):
            b.beam(pt(-s, c, h), pt(s, c, h), 0.03, METAL)


def _seesaw(b, pt, yaw, col):
    _box(b, pt, 0.0, 0.0, 0.0, 0.3, 0.3, 0.45, yaw, col)
    _box(b, pt, 0.0, 0.0, 0.45, 3.2, 0.25, 0.06, yaw, WOOD)
    for a in (-1.25, 1.25):
        b.beam(pt(a, -0.15, 0.5), pt(a, -0.15, 0.85), 0.02, METAL)
        b.beam(pt(a, 0.15, 0.5), pt(a, 0.15, 0.85), 0.02, METAL)
        b.beam(pt(a, -0.15, 0.85), pt(a, 0.15, 0.85), 0.02, METAL)


def _sandpit(b, pt, yaw, col):
    for a, c, la, lc in ((0.0, -1.4, 3.0, 0.2), (0.0, 1.4, 3.0, 0.2), (-1.4, 0.0, 0.2, 2.6), (1.4, 0.0, 0.2, 2.6)):
        _box(b, pt, a, c, 0.0, la, lc, 0.3, yaw, WOOD)
    b.quad(pt(-1.3, -1.3, 0.18), pt(1.3, -1.3, 0.18), pt(1.3, 1.3, 0.18), pt(-1.3, 1.3, 0.18), SAND)


DEVICES = (_swing, _slide, _climber, _seesaw, _sandpit)
DEVICE_COLOURS = (RED, BLUE, YELLOW, WOOD, METAL)


def play_spots(rings, blockers, fid):
    """[(x, y, device index, colour, yaw)] of a playground's devices on the area rings (outer, holes), clear of the
    blocker rings (buildings): spots on a PLAY_GRID_M grid PLAY_EDGE_M inside, taken in a hashed order PLAY_GAP_M
    apart, one per PLAY_M2. Pure."""
    outer = np.asarray(rings[0], float)
    n = int(min(PLAY_MAX, max(1, round(_area(outer) / PLAY_M2))))
    lo, hi = np.floor(outer.min(0) / PLAY_GRID_M) * PLAY_GRID_M, outer.max(0)
    gx, gy = np.meshgrid(np.arange(lo[0], hi[0], PLAY_GRID_M), np.arange(lo[1], hi[1], PLAY_GRID_M))
    pts = np.c_[gx.ravel(), gy.ravel()]
    if not len(pts):
        return []
    ins, dist = inside(pts, rings)
    pts = pts[ins & (dist >= PLAY_EDGE_M)]
    pts = pts[_clear(pts, blockers, PLAY_EDGE_M)]
    order = sorted(range(len(pts)), key=lambda k: _hash(fid, round(pts[k][0], 1), round(pts[k][1], 1)))
    _, u, _, _ = buildingsmod.oriented_box(outer)
    base = math.atan2(u[1], u[0])
    out = []
    for k in order:
        p = pts[k]
        if all(math.hypot(p[0] - q[0], p[1] - q[1]) >= PLAY_GAP_M for q in out):
            j = len(out)
            out.append((float(p[0]), float(p[1]), int(_hash(fid, "dev", j) * len(DEVICES)) if j else 0,
                        DEVICE_COLOURS[int(_hash(fid, "col", j) * len(DEVICE_COLOURS))],
                        base + (math.pi / 2 if _hash(fid, "yaw", j) < 0.5 else 0.0)))
            if len(out) >= n:
                break
    return out


# --- cemeteries ---------------------------------------------------------------------------------------------

def grave_spots(rings, blockers, fid, box):
    """[(x, y, yaw, hash)] of the headstones of a cemetery's area rings (outer, holes) within box (x0, y0, x1, y1):
    rows GRAVE_ROW_M apart along the area's long side, GRAVE_ALONG_M in a row, paths between the blocks, clear of the
    edge and of the blocker rings. The grid comes from the area alone: a tile next to it continues it. Pure."""
    outer = np.asarray(rings[0], float)
    c, u, hl, hw = buildingsmod.oriented_box(outer)
    v = np.array([-u[1], u[0]])
    ia = np.arange(-int(hl / GRAVE_ALONG_M), int(hl / GRAVE_ALONG_M) + 1)
    ir = np.arange(-int(hw / GRAVE_ROW_M), int(hw / GRAVE_ROW_M) + 1)
    A, R = np.meshgrid(ia, ir)
    keep = (A % GRAVE_BLOCK[1] != 0) & (R % GRAVE_BLOCK[0] != 0)
    A, R = A[keep], R[keep]
    pts = c + A[:, None] * GRAVE_ALONG_M * u + R[:, None] * GRAVE_ROW_M * v
    x0, y0, x1, y1 = box
    sel = (pts[:, 0] >= x0) & (pts[:, 0] < x1) & (pts[:, 1] >= y0) & (pts[:, 1] < y1)
    pts, A, R = pts[sel], A[sel], R[sel]
    if not len(pts):
        return []
    ins, dist = inside(pts, rings)
    ok = ins & (dist >= GRAVE_EDGE_M)
    ok[ok] = _clear(pts[ok], blockers, GRAVE_EDGE_M)
    yaw = math.atan2(u[1], u[0])
    return [(float(p[0]), float(p[1]), yaw, _hash(fid, int(a), int(r))) for p, a, r in zip(pts[ok], A[ok], R[ok])]


def _grave(b, x, y, z, yaw, h):
    pt = _frame(x, y, z, yaw)
    k = (GRANITE, MARBLE, STONE)[int(h * 7) % 3]
    if h < CROSS_SHARE:
        _box(b, pt, 0.0, 0.0, -0.1, 0.1, 0.1, 1.1, yaw, k)
        _box(b, pt, 0.0, 0.0, 0.7, 0.5, 0.1, 0.1, yaw, k)
    else:
        _box(b, pt, 0.0, 0.0, -0.1, 0.5 + 0.3 * _hash(h, "w"), 0.14, 0.7 + 0.4 * _hash(h, "h"), yaw, k)


# --- pitches ------------------------------------------------------------------------------------------------

# The markings are the rules' sizes (football: IFAB Law 1; basketball: FIBA; track lanes: World Athletics), scaled
# down with a smaller pitch (a five-a-side pitch, a school court) and drawn LINE_INSET_M inside the mapped outline
# (traced from imagery round the lines, often with the run-off)
LINE_INSET_M = 0.5
LINE_HW = {"soccer": 0.06, "basketball": 0.05, "track": 0.05}     # m, half widths (12 cm; 5 cm, drawn 10: the
                                                                 # terrain texture's 12.5 cm pixel)
SOCCER = dict(length=105.0, circle=9.15, area=(16.5, 40.32), goal_area=(5.5, 18.32), spot=11.0, corner=1.0,
              goal=(7.32, 2.44), least=(3.0, 2.0))     # m; least: a small pitch's goals (mini goals 3 x 2 m)
BASKET = dict(length=28.0, circle=1.8, key=(5.8, 4.9), three=6.75, three_side=0.9, ring=1.575, board=1.2,
              height=3.05, half=20.0)  # m; a court shorter than half is a half court: one hoop (OSM hoops=* first)
LANE_M = 1.22               # m: a running lane
LANES = 8                   # at most (a 400 m track; fewer where the ring of the track is narrower)
TRACK_SPORTS = ("", "athletics", "running")
MIN_PITCH_M = (12.0, 8.0)   # m: a smaller outline (a mapped penalty spot, a goal mouth) gets no markings


def _arc(cx, cy, r, t0, t1, step=0.5):
    """Points on a circle (centre cx, cy along/across) from angle t0 to t1, about step m apart."""
    k = max(2, int(abs(t1 - t0) * r / step) + 1)
    t = np.linspace(t0, t1, k)
    return np.c_[cx + r * np.cos(t), cy + r * np.sin(t)]


def _rect(a0, a1, c0, c1):
    return np.array([(a0, c0), (a1, c0), (a1, c1), (a0, c1), (a0, c0)], float)


def _soccer(hl, hw):
    """(lines [(points along/across, half width)], objects) of a football pitch hl x hw (half sizes) round 0."""
    S, lw = SOCCER, LINE_HW["soccer"]
    s = min(1.0, 2 * hl / S["length"])
    lines = [_rect(-hl, hl, -hw, hw), np.array([(0.0, -hw), (0.0, hw)]), _arc(0, 0, S["circle"] * s, 0, 2 * math.pi)]
    objects = []
    for e in (-1.0, 1.0):
        for depth, width in (S["area"], S["goal_area"]):
            d, w = depth * s, min(width * s, 2 * hw - 2.0) / 2
            lines.append(np.array([(e * hl, -w), (e * (hl - d), -w), (e * (hl - d), w), (e * hl, w)]))
        spot, r, d = e * (hl - S["spot"] * s), S["circle"] * s, S["area"][0] * s
        m = math.acos(min(1.0, (d - S["spot"] * s) / r))
        base = math.pi if e > 0 else 0.0                 # (the arc faces the centre)
        lines.append(_arc(spot, 0.0, r, base - m, base + m))
        lines.append(_arc(spot, 0.0, 0.11, 0, 2 * math.pi, 0.05))
        for c in (-1.0, 1.0):                            # corner arcs
            t = math.atan2(-c, -e)
            lines.append(_arc(e * hl, c * hw, S["corner"], t - math.pi / 4, t + math.pi / 4, 0.2))
        gw, gh = max(S["least"][0], S["goal"][0] * s), max(S["least"][1], S["goal"][1] * s)
        objects.append(("goal", e * hl, 0.0, e, gw, gh))
    return [(p, lw) for p in lines], objects


def _basketball(hl, hw, hoops):
    """(lines, objects) of a basketball court hl x hw (half sizes) round 0; hoops: 1 (a half court: at -along) or 2."""
    B, lw = BASKET, LINE_HW["basketball"]
    full = hoops != 1
    s = min(1.0, 2 * hl / (B["length"] if full else B["length"] / 2))
    lines, objects = [_rect(-hl, hl, -hw, hw)], []
    if full:
        lines += [np.array([(0.0, -hw), (0.0, hw)]), _arc(0, 0, B["circle"] * s, 0, 2 * math.pi)]
    for e in ((-1.0, 1.0) if full else (-1.0,)):
        depth, w = B["key"][0] * s, min(B["key"][1] * s, 2 * hw) / 2
        lines.append(np.array([(e * hl, -w), (e * (hl - depth), -w), (e * (hl - depth), w), (e * hl, w)]))
        lines.append(_arc(e * (hl - depth), 0.0, B["circle"] * s, 0, 2 * math.pi))
        ba, r = e * (hl - B["ring"] * s), B["three"] * s
        side = min(r * 0.98, hw - B["three_side"] * s)  # (the straight parts: 0.9 m in from the sidelines)
        if side > 0:                                    # the arc facing the centre, straight on to the baseline
            m = math.asin(side / r)
            base = math.pi if e > 0 else 0.0
            arc = _arc(ba, 0.0, r, base - m, base + m)
            lines.append(np.r_[[(e * hl, arc[0][1])], arc, [(e * hl, arc[-1][1])]])
        objects.append(("hoop", e * (hl - B["ring"] * s), 0.0, e, B["board"] * s, B["height"]))
    return [(p, lw) for p in lines], objects


def _track(rings):
    """Lane lines of a running track's area rings (outer, the infield as a hole or none): the outer edge and lines
    LANE_M apart inwards, as many lanes as the ring between them is wide (LANES at most)."""
    outer = np.asarray(rings[0], float)
    if len(rings) > 1:
        inner = np.asarray(rings[1], float)
        width = (_area(outer) - _area(inner)) / max(1.0, float(np.sum(np.hypot(*np.diff(np.r_[outer, outer[:1]],
                                                                                          axis=0).T))))
        n = int(min(LANES, max(1, math.floor(width / LANE_M + 0.25))))
    else:
        n = LANES
    out = []
    for k in range(n + 1):
        r = _offset(outer, -(LINE_INSET_M + k * LANE_M))
        out.append((np.r_[r, r[:1]], LINE_HW["track"]))
    return out


def pitch_layout(cls, sport, tags, rings):
    """(lines [(points (k, 2) in the rings' frame, half width m)], objects [(kind "goal" / "hoop", x, y, facing (2,):
    into the pitch, width, height)]) of a land_use pitch or track of sport (groundcover.pitch) on its area rings
    (outer counter-clockwise, then holes). Football and basketball markings and their goals and hoops on the
    outline's oriented box; a running track's lanes along its outline. Pure."""
    outer = buildingsmod.clean_ring(np.asarray(rings[0], float))
    if outer is None:
        return [], []
    if cls == "track":
        if sport not in TRACK_SPORTS:
            return [], []
        holes = [h for h in (buildingsmod.clean_ring(np.asarray(r, float)) for r in rings[1:]) if h is not None]
        return [(p, hw) for p, hw in _track([outer] + holes[:1])], []
    if sport not in ("soccer", "basketball"):
        return [], []
    c, u, hl, hw = buildingsmod.oriented_box(outer)
    hl, hw = float(hl) - LINE_INSET_M, float(hw) - LINE_INSET_M
    if 2 * hl < MIN_PITCH_M[0] or 2 * hw < MIN_PITCH_M[1]:
        return [], []
    if sport == "soccer":
        lines, objects = _soccer(hl, hw)
    else:
        try:
            hoops = int(str(tags.get("hoops", "")).split(";")[0])
        except ValueError:
            hoops = 0
        lines, objects = _basketball(hl, hw, hoops or (2 if 2 * hl >= BASKET["half"] else 1))
    v = np.array([-u[1], u[0]])

    def world(p):
        p = np.asarray(p, float).reshape(-1, 2)
        return c + p[:, :1] * u + p[:, 1:] * v
    return ([(world(p), lw) for p, lw in lines],
            [(k, *world((a, cc))[0], -e * u, w, h) for k, a, cc, e, w, h in objects])


def _pitches(frame, md, tx, ty, margin):
    """(class, sport, tags, rings, feature id) of the pitches and tracks whose cell builds them round tile (tx, ty)."""
    for f, i, cls, parts in _features(frame, md, tx, ty, "land_use", tuple(groundcover.PITCH_CLASSES), margin):
        tags = groundcover._tags(f.attrs, i)
        surf = f.attrs.get("surface")
        sport, _ = groundcover.pitch(cls, tags, "" if surf is None else str(surf[i]))
        for part in parts:
            if part and len(part[0]) >= 4:
                yield cls, sport, tags, part, str(f.ids[i])


def marks(frame, md, tx, ty):
    """(segments (m, 4) x0, y0, x1, y1 in the anchor frame, half widths (m,)) of the pitch markings touching tile
    (tx, ty) (pitch_layout), or None."""
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    segs, hws = [], []
    for cls, sport, tags, rings, _ in _pitches(frame, md, tx, ty, 0.0):
        for p, hw in pitch_layout(cls, sport, tags, rings)[0]:
            if len(p) < 2 or p[:, 0].max() < x0 or p[:, 0].min() > x1 or p[:, 1].max() < y0 or p[:, 1].min() > y1:
                continue
            segs.append(np.c_[p[:-1], p[1:]])
            hws.append(np.full(len(p) - 1, hw))
    if not segs:
        return None
    return np.concatenate(segs), np.concatenate(hws)


def _goal(b, x, y, z, facing, w, h):
    """A football goal: white posts and crossbar on the goal line, the net's frame and net behind it."""
    back = np.array([-facing[0], -facing[1]])
    side = np.array([-facing[1], facing[0]])
    d = min(2.0, 0.8 * h)                   # (the net's depth at the ground)

    def P(s, t, hh):
        q = np.array([x, y]) + s * side + t * back
        return float(q[0]), float(q[1]), z + hh
    for sgn in (-1, 1):
        b.beam(P(sgn * w / 2, 0, -0.2), P(sgn * w / 2, 0, h), 0.06, WHITE)
        b.beam(P(sgn * w / 2, 0, h), P(sgn * w / 2, d * 0.5, h * 0.8), 0.025, WHITE)
        b.beam(P(sgn * w / 2, d * 0.5, h * 0.8), P(sgn * w / 2, d, 0.0), 0.025, WHITE)
    b.beam(P(-w / 2 - 0.06, 0, h), P(w / 2 + 0.06, 0, h), 0.06, WHITE)
    b.quad(P(-w / 2, 0, h), P(w / 2, 0, h), P(w / 2, d * 0.5, h * 0.8), P(-w / 2, d * 0.5, h * 0.8), NET, back=NET)
    b.quad(P(-w / 2, d * 0.5, h * 0.8), P(w / 2, d * 0.5, h * 0.8), P(w / 2, d, 0), P(-w / 2, d, 0), NET, back=NET)
    for sgn in (-1, 1):
        b.poly([P(sgn * w / 2, 0, 0), P(sgn * w / 2, d, 0), P(sgn * w / 2, d * 0.5, h * 0.8), P(sgn * w / 2, 0, h)],
               [(0, 1, 2), (0, 2, 3), (0, 2, 1), (0, 3, 2)], [(0, 0), (1, 0), (0.5, 0.8), (0, 1)], NET)


def _hoop(b, x, y, z, facing, board, h):
    """A basketball hoop: pole behind the baseline, arm, white backboard, orange ring, net; the ring's centre at
    (x, y), facing into the court."""
    f = np.array(facing, float)
    side = np.array([-f[1], f[0]])

    def P(t, s, hh):                        # t: metres into the court from the ring's centre
        q = np.array([x, y]) + t * f + s * side
        return float(q[0]), float(q[1]), z + hh
    pole = -(0.4 + board + 1.0)             # (1 m behind the baseline)
    b.cylinder(*P(pole, 0, 0)[:2], z - 0.3, z + h + 0.6, 0.08, METAL, n=8)
    b.beam(P(pole, 0, h + 0.5), P(-0.4, 0, h + 0.5), 0.05, METAL)
    b.beam(P(pole, 0, h - 0.4), P(-0.4, 0, h + 0.2), 0.04, METAL)
    pt = _frame(*P(-0.4, 0, 0)[:2], z, math.atan2(f[1], f[0]))
    _box(b, pt, 0.0, 0.0, h - 0.15, 0.05, 1.8, 1.05, math.atan2(f[1], f[0]), WHITE)
    ring = [P(0.225 * math.cos(a), 0.225 * math.sin(a), h) for a in np.linspace(0, 2 * math.pi, 9)]
    for p0, p1 in zip(ring[:-1], ring[1:]):
        b.beam(p0, p1, 0.012, ORANGE)
    low = [P(0.13 * math.cos(a), 0.13 * math.sin(a), h - 0.4) for a in np.linspace(0, 2 * math.pi, 9)]
    for k in range(8):
        b.quad(low[k], low[k + 1], ring[k + 1], ring[k], NET, back=NET)


# --- silos, tanks, masts ------------------------------------------------------------------------------------

def _tank(b, cls, ring, centre, height, ground, tags):
    """A silo or storage tank on its outline ring (None: a point at centre) height m high (NaN: by its width)."""
    if ring is not None:
        area = _area(ring)
        rmax = float(np.max(np.hypot(*(ring - centre).T)))
        r = math.sqrt(area / math.pi)
    else:
        rmax = r = POINT_R_M
    per, least, most = SILO_H if cls == "silo" else TANK_H
    h = height if np.isfinite(height) and height > 0 else min(most, max(least, per * 2 * r))
    pts = ring if ring is not None else np.array([centre])
    z0 = float(np.min(ground(pts[:, 0], pts[:, 1]))) - 0.3
    metal = str(tags.get("material", "")).lower() in ("metal", "steel")
    skin = TANK if cls == "storage_tank" or metal else CONCRETE
    if ring is None or area / (math.pi * rmax * rmax) >= ROUND_FILL:
        b.cylinder(centre[0], centre[1], z0, z0 + 0.3 + h, r, skin)
        b.cone(centre[0], centre[1], z0 + 0.3 + h, z0 + 0.3 + h + r * (0.4 if cls == "silo" else 0.12), r, skin)
    else:
        b.prism(ring, z0, z0 + 0.3 + h, skin)


def _mast(b, cls, x, y, z, h, tags, yaw):
    """A communication mast (lattice or tube with antenna panels, a concrete TV tower from TV_MIN_M) or a floodlight
    mast facing yaw."""
    if cls == "lighting":
        b.cylinder(x, y, z - 0.5, z + h, 0.25, METAL, r1=0.15)
        pt = _frame(x, y, z, yaw)
        _box(b, pt, 0.3, 0.0, h - 0.8, 0.3, 3.0, 1.6, yaw, METAL)
        b.quad(pt(0.46, -1.5, h - 0.8), pt(0.46, 1.5, h - 0.8), pt(0.46, 1.5, h + 0.8), pt(0.46, -1.5, h + 0.8), LAMP)
        return
    if str(tags.get("man_made", "")) == "tower" and h >= TV_MIN_M:
        r = max(2.0, 0.03 * h)
        b.cylinder(x, y, z - 0.5, z + 0.8 * h, r, CONCRETE, r1=0.8 * r)
        b0 = z + 0.68 * h
        b.cylinder(x, y, b0, b0 + 0.06 * h, 2.5 * r, WHITE, cap=CONCRETE)
        b.cone(x, y, b0, b0, 2.5 * r, CONCRETE)
        b.cylinder(x, y, z + 0.8 * h, z + h, 0.5, RED, r1=0.2)
        return
    lattice = str(tags.get("tower:construction", "")) == "lattice"
    if lattice:
        w0, w1 = max(1.0, 0.06 * h), 0.4
        legs = [(math.cos(a), math.sin(a)) for a in (yaw, yaw + 2.094, yaw + 4.189)]

        def leg(k, t):
            w = w0 + (w1 - w0) * t
            return x + w * legs[k][0], y + w * legs[k][1], z - 0.5 + (h + 0.5) * t
        steps = max(2, int(h / 4.0))
        for k in range(3):
            b.beam(leg(k, 0.0), leg(k, 1.0), 0.08, METAL)
            for s in range(steps):
                t0, t1 = s / steps, (s + 1) / steps
                b.beam(leg(k, t1), leg((k + 1) % 3, t1), 0.04, METAL)
                b.beam(leg(k, t0), leg((k + 1) % 3, t1), 0.03, METAL)
    else:
        r0 = max(0.4, 0.012 * h)
        b.cylinder(x, y, z - 0.5, z + h, r0, METAL, r1=0.6 * r0, n=8)
    for k in range(3):                                      # three antenna panels round the top
        a = yaw + k * 2.094
        q = _frame(x + 0.7 * math.cos(a), y + 0.7 * math.sin(a), z, a + math.pi / 2)
        _box(b, q, 0.0, 0.0, h - 2.2, 0.35, 0.12, 1.6, a + math.pi / 2, WHITE)


# --- per tile -----------------------------------------------------------------------------------------------

def _features(frame, md, tx, ty, layer, classes, margin=0.0):
    """(features, row, class, parts in the anchor frame) of layer's features of classes whose cell builds them
    (Features.own: one cell each; a clipped area's piece per cell) round tile (tx, ty)."""
    for key in roadsmod.cells_of_tile(frame, tx, ty, margin):
        f = md.cell(key, layers=(layer,), kind="demand").layers.get(layer)
        if f is None or not len(f) or f.attrs.get("class") is None:
            continue
        cls = f.attrs["class"]
        own = f.own if f.own is not None else np.ones(len(f), bool)
        sel = np.flatnonzero(np.isin(cls, list(classes)) & own)
        if not len(sel):
            continue
        xy = f.xy_in(frame)
        for i in sel:
            yield f, int(i), str(cls[i]), f.parts(i, xy)


def _centre(parts):
    ring = parts[0][0]
    return ring[:-1].mean(0) if len(ring) > 1 else ring[0]


def _in_box(p, box):
    return box[0] <= p[0] < box[2] and box[1] <= p[1] < box[3]


def build(frame, md, tx, ty, ground, blockers):
    """{object prefix: mesh (P, UV, T)} of tile (tx, ty) in the anchor frame: "nocol_pool", "nocol_play",
    "nocol_sport", "nocol_graves", "1WALL_tower", "1WALL_fountain" (only those with something in them). ground(x, y) -> heights (arrays);
    blockers: the buildings as drawn (rings) round the tile."""
    box = roadsmod.tile_bbox(tx, ty)
    blockers = [np.asarray(r, float).reshape(-1, 2) for r in (blockers or ())]
    out = {}

    b = Builder()
    for f, i, cls, parts in _features(frame, md, tx, ty, "water", water.BASINS):
        ring = _outer(parts)
        if ring is None or not _in_box(_centre(parts), box) or _area(ring) > water.BASIN_MAX_M2:
            continue
        pool(b, ring, ground, TILE if cls == "swimming_pool" else STONE)
    out["nocol_pool"] = b.mesh()

    b = Builder()
    for f, i, cls, parts in _features(frame, md, tx, ty, "land_use", PLAY_CLASSES):
        if not parts or len(parts[0][0]) < 4 or not _in_box(_centre(parts), box):
            continue
        fid = str(f.ids[i])
        for x, y, dev, col, yaw in play_spots(parts[0], blockers, fid):
            z = float(ground(np.array([x]), np.array([y]))[0])
            DEVICES[dev](b, _frame(x, y, z, yaw), yaw, col)
    out["nocol_play"] = b.mesh()

    b = Builder()
    for cls, sport, tags, rings, fid in _pitches(frame, md, tx, ty, 0.0):
        for kind, x, y, facing, w, h in pitch_layout(cls, sport, tags, rings)[1]:
            if _in_box((x, y), box):
                z = float(ground(np.array([x]), np.array([y]))[0])
                (_goal if kind == "goal" else _hoop)(b, float(x), float(y), z, facing, w, h)
    out["nocol_sport"] = b.mesh()

    spots = []
    for f, i, cls, parts in _features(frame, md, tx, ty, "land_use", GRAVE_CLASSES, GRAVE_ROW_M):
        for part in parts:
            if len(part[0]) >= 4:
                spots += grave_spots(part, blockers, str(f.ids[i]), box)
    if len(spots) > GRAVE_CAP:
        keep = GRAVE_CAP / len(spots)
        spots = [s for s in spots if _hash(s[3], "cap") < keep]
    b = Builder()
    if spots:
        xy = np.array([(s[0], s[1]) for s in spots])
        zs = np.asarray(ground(xy[:, 0], xy[:, 1]), float)
        for (x, y, yaw, h), z in zip(spots, zs):
            _grave(b, x, y, float(z), yaw, h)
    out["nocol_graves"] = b.mesh()

    b = Builder()
    pitches = None
    for f, i, cls, parts in _features(frame, md, tx, ty, "infrastructure", TOWER_CLASSES):
        c = _centre(parts) if parts and parts[0] else None
        if c is None or not _in_box(c, box) or not _clear(np.array([c]), blockers, 0.0)[0]:
            continue
        tags = groundcover._tags(f.attrs, i)
        height = float(f.attrs["height"][i]) if f.attrs.get("height") is not None else math.nan
        if cls in ("silo", "storage_tank"):
            ring = _outer(parts) if f.kind[i] == 3 else None
            _tank(b, cls, ring, (ring.mean(0) if ring is not None else c), height, ground, tags)
            continue
        h = height if np.isfinite(height) and height > 0 else MAST_H[cls]
        z = float(ground(np.array([c[0]]), np.array([c[1]]))[0])
        yaw = _hash(f.ids[i], "yaw") * 2 * math.pi
        if cls == "lighting":
            if pitches is None:
                pitches = [_centre(p) for _, _, _, p in _features(frame, md, tx, ty, "land_use",
                                                                  ("pitch", "stadium", "track"), LIGHT_REACH_M)
                           if p and len(p[0][0]) >= 4]
            near = min(pitches, key=lambda q: math.hypot(q[0] - c[0], q[1] - c[1]), default=None)
            if near is not None and math.hypot(near[0] - c[0], near[1] - c[1]) <= LIGHT_REACH_M:
                yaw = math.atan2(near[1] - c[1], near[0] - c[0])
        _mast(b, cls, float(c[0]), float(c[1]), z, h, tags, yaw)
    out["1WALL_tower"] = b.mesh()

    b = Builder()
    for f, i, cls, parts in _features(frame, md, tx, ty, "infrastructure", FOUNTAIN_CLASSES):
        c = _centre(parts) if parts and parts[0] else None
        if c is None or not _in_box(c, box) or not _clear(np.array([c]), blockers, 0.0)[0]:
            continue
        tags = groundcover._tags(f.attrs, i)
        kind = str(tags.get("fountain", "")).lower()
        if kind in FLAT_FOUNTAINS:
            continue
        z = float(ground(np.array([c[0]]), np.array([c[1]]))[0])
        if cls == "fountain" and kind not in PEDESTALS:
            ring = _outer(parts) if f.kind[i] == 3 else None
            fountain(b, ring, c if ring is None else ring.mean(0), ground)
        elif str(tags.get("man_made", "")).lower() == "water_well":
            trough(b, float(c[0]), float(c[1]), z, _hash(f.ids[i], "yaw") * 2 * math.pi)
        else:
            pedestal(b, float(c[0]), float(c[1]), z)
    out["1WALL_fountain"] = b.mesh()
    return {k: m for k, m in out.items() if m is not None}
