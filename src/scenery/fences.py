"""Fences, walls and hedges from OpenStreetMap (Overture base/infrastructure, subtype barrier), as comic models.

BeamNG.Earth reads the same lines but only draws guard rails, jersey and cable barriers (guardrails.py); its own fences
are made up (buildings._front_fence: a front yard fence at 30 % of the houses). Here the mapped ones:

- the kind: OSM's own tags first (fence_type, material, wall), else the surroundings: the comic ground on both sides
  (groundcover.materials: WorldCover and land_use) and the nearest road (a motorway's wildlife fence). Only a few
  per cent of the fences carry a fence_type, so mostly the surroundings decide.
- KINDS: pasture (posts with wire or wooden rails), garden (pickets or boards), chain link, bars (welded mesh,
  railing), wall (stone, brick, concrete, plaster; noise barriers; city walls), hedge; colour, height and post
  spacing hashed per line (its id).
- They stand on the visible ground and collide (one invisible wall per panel, 1WALL_fencecol_), except retaining
  walls (the terrain's own step: only their top shows). Every piece keeps CLEAR_M from the carriageways' edges (OSM
  lines lie a metre or two off: a fence on the road would be a wall across it) and gates leave a gap.
"""
import json
import math
import re
import zlib

import numpy as np
from PIL import Image, ImageDraw

import mapgeom
import roads as roadsmod

from scenery import groundcover, propsmesh

MATERIAL = "fences"
CLASSES = {"fence", "wall", "hedge", "retaining_wall", "city_wall"}
GATES = {"gate", "swing_gate", "lift_gate", "sliding_gate", "kissing_gate", "entrance", "stile", "hampshire_gate",
         "bump_gate", "cattle_grid"}
GATE_GAP_M = 1.8            # m: half the gap a gate leaves in its fence
CLEAR_M = 1.0               # m from a carriageway's edge (roads.road_specs width) no piece stands in
REACH_M = 60.0              # m: fences further from every road are left out (an area of a city: thousands of km)
SIDE_M = 3.0                # m to either side where the ground decides the kind
CELL_M = 2.0                # m per cell of the comic ground sampled (groundcover.materials)

# atlas cells (ATLAS x ATLAS of CELL px; RGBA: the meshes and gaps are cut out by the alpha test)
ATLAS, CELL = 5, 256
(POST_WOOD, POST_GREY, POST_DARK, PICKET_WOOD, PICKET_WHITE, BOARD_WOOD, BOARD_GREY, CHAIN_GREY, CHAIN_GREEN,
 MESH_GREEN, MESH_DARK, RAILING, STONE, BRICK, CONCRETE, PLASTER, NOISE_GREEN, NOISE_WOOD, HEDGE_A, HEDGE_B,
 CAP, RAIL_WOOD, WIRE) = range(23)

# kind -> (height range m, post spacing range m); a tagged height (clamped to HEIGHT_TAG) wins
KINDS = {"pasture": ((1.0, 1.3), (3.0, 4.0)), "garden": ((0.9, 1.6), (2.0, 2.6)), "chain": ((1.6, 2.2), (2.5, 3.0)),
         "bars": ((1.0, 1.8), (2.5, 2.5)), "wall": ((1.2, 2.2), (3.0, 3.0)), "noise": ((3.0, 4.5), (4.0, 4.0)),
         "hedge": ((1.2, 2.0), (3.0, 3.0)), "retaining": ((0.5, 0.9), (3.0, 3.0))}
HEIGHT_TAG = (0.3, 6.0)

# OSM fence_type / material -> kind; wall= and material -> look of a wall
FENCE_TYPE = {"wire": "pasture", "barbed_wire": "pasture", "electric": "pasture", "pole": "pasture",
              "split_rail": "pasture", "rail": "pasture", "knee_rail": "pasture", "wood": "garden",
              "picket": "garden", "palisade": "garden", "panel": "garden", "hedge": "hedge", "chain_link": "chain",
              "chain": "chain", "mesh": "bars", "metal": "bars", "metal_bars": "bars", "bars": "bars",
              "railing": "bars", "concrete": "wall", "brick": "wall", "stone": "wall"}
WALL_LOOK = {"brick": BRICK, "stone": STONE, "dry_stone": STONE, "drystone_wall": STONE, "castle_wall": STONE,
             "granite": STONE, "masonry": STONE, "flint": STONE, "concrete": CONCRETE, "reinforced_concrete": CONCRETE,
             "flood_wall": CONCRETE, "plaster": PLASTER}
# comic ground -> kind of an untagged fence (the most common one on both sides decides; the rest: pasture)
GROUND_KIND = {"gc_residential": "garden", "gc_garden": "garden", "gc_lawn": "garden", "gc_cemetery": "wall",
               "gc_urban": "garden", "gc_yard": "chain", "gc_pitch": "chain", "gc_sand": "bars", "gc_dirt": "chain"}
WILD_ROADS = {"motorway", "trunk"}     # a fence this near one is a wildlife fence (chain link on wooden posts)
WILD_M = 30.0


def _hash(fid, salt):
    return (zlib.crc32(f"{fid}|{salt}".encode()) & 0xFFFFFF) / float(0x1000000)


def _height(tags):
    v = str(tags.get("height") or "").replace(",", ".")
    m = re.match(r"^\s*([0-9.]+)\s*(m|cm)?\s*$", v)
    if not m:
        return None
    try:
        h = float(m.group(1)) / (100.0 if m.group(2) == "cm" else 1.0)
    except ValueError:
        return None
    return min(HEIGHT_TAG[1], max(HEIGHT_TAG[0], h))


# --- atlas --------------------------------------------------------------------------------------------------

def _box(k):
    return (k % ATLAS) * CELL, (k // ATLAS) * CELL


def make_atlas(path):
    img = Image.new("RGBA", (ATLAS * CELL, ATLAS * CELL), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(31)
    S = CELL

    def fill(k, col):
        x, y = _box(k)
        d.rectangle([x, y, x + S - 1, y + S - 1], fill=col + (255,))
        return x, y

    def grain(x, y, col, n, horizontal=True):
        for _ in range(n):
            a = int(rng.integers(0, S))
            if horizontal:
                d.line([(x, y + a), (x + S, y + a + int(rng.integers(-3, 4)))], fill=col + (255,), width=2)
            else:
                d.line([(x + a, y), (x + a + int(rng.integers(-3, 4)), y + S)], fill=col + (255,), width=2)

    for k, col, dark in ((POST_WOOD, (124, 92, 62), (96, 70, 46)), (RAIL_WOOD, (140, 104, 70), (108, 78, 50))):
        x, y = fill(k, col)
        grain(x, y, dark, 14, horizontal=k == RAIL_WOOD)
    fill(POST_GREY, (156, 162, 166))
    fill(POST_DARK, (58, 62, 64))
    fill(WIRE, (70, 72, 74))
    fill(CAP, (176, 172, 164))
    for k, col in ((PICKET_WOOD, (150, 112, 74)), (PICKET_WHITE, (236, 234, 226))):    # pickets with gaps, two rails
        x, y = _box(k)
        dark = tuple(int(c * 0.72) for c in col)
        for i in range(10):
            px = x + 4 + i * 25
            d.polygon([(px, y + S - 1), (px + 17, y + S - 1), (px + 17, y + 14), (px + 8, y + 2), (px, y + 14)],
                      fill=col + (255,), outline=dark + (255,))
        for ry in (y + 50, y + 190):
            d.rectangle([x, ry, x + S - 1, ry + 14], fill=dark + (255,))
    for k, col in ((BOARD_WOOD, (138, 100, 66)), (BOARD_GREY, (150, 146, 138))):        # closed boards, horizontal
        x, y = fill(k, col)
        dark = tuple(int(c * 0.7) for c in col)
        for i in range(1, 8):
            d.line([(x, y + i * 32), (x + S, y + i * 32)], fill=dark + (255,), width=4)
        grain(x, y, tuple(int(c * 0.85) for c in col), 10)
    for k, col in ((CHAIN_GREY, (176, 182, 186)), (CHAIN_GREEN, (64, 110, 70))):        # chain link: diamonds
        cell = Image.new("RGBA", (S, S), (0, 0, 0, 0))   # (its own image: the diagonals stay in the cell)
        dc = ImageDraw.Draw(cell)
        for i in range(-S, 2 * S, 16):
            dc.line([(i, 0), (i + S, S)], fill=col + (255,), width=3)
            dc.line([(i + S, 0), (i, S)], fill=col + (255,), width=3)
        dc.rectangle([0, 0, S - 1, 8], fill=col + (255,))
        dc.rectangle([0, S - 9, S - 1, S - 1], fill=col + (255,))
        img.paste(cell, _box(k))
    for k, col in ((MESH_GREEN, (52, 96, 62)), (MESH_DARK, (52, 56, 60))):              # welded mesh: rectangles
        x, y = _box(k)
        for i in range(0, S, 21):
            d.rectangle([x + i, y, x + i + 4, y + S - 1], fill=col + (255,))
        for j in (y, y + 70, y + 140, y + 210, y + S - 8):
            d.rectangle([x, j, x + S - 1, j + 7], fill=col + (255,))
    x, y = _box(RAILING)                                                                # railing: bars, two rails
    col = (90, 94, 98)
    for i in range(0, S, 26):
        d.rectangle([x + i, y, x + i + 6, y + S - 1], fill=col + (255,))
    for j in (y, y + S - 16):
        d.rectangle([x, j, x + S - 1, j + 15], fill=col + (255,))
    x, y = fill(STONE, (150, 142, 128))                                                 # stones in mortar
    for row in range(8):
        yy = y + row * 32
        xx = x - int(rng.integers(0, 30))
        while xx < x + S:
            w = int(rng.integers(26, 56))
            c = int(rng.integers(-18, 18))
            d.rounded_rectangle([max(x, xx + 2), yy + 2, min(x + S - 1, xx + w - 2), yy + 29], radius=6,
                                fill=(168 + c, 160 + c, 144 + c, 255), outline=(110, 104, 94, 255))
            xx += w
    x, y = fill(BRICK, (176, 92, 62))                                                   # bricks
    for row in range(16):
        yy = y + row * 16
        d.line([(x, yy), (x + S, yy)], fill=(214, 200, 186, 255), width=3)
        for xx in range(x + (0 if row % 2 else 20), x + S, 40):
            d.line([(xx, yy), (xx, yy + 16)], fill=(214, 200, 186, 255), width=3)
    x, y = fill(CONCRETE, (170, 168, 162))                                              # concrete: formwork lines
    for i in range(1, 4):
        d.line([(x, y + i * 64), (x + S, y + i * 64)], fill=(150, 148, 142, 255), width=2)
    for _ in range(40):
        a, b = int(rng.integers(0, S)), int(rng.integers(0, S))
        d.ellipse([x + a, y + b, x + a + 3, y + b + 3], fill=(140, 138, 132, 255))
    x, y = fill(PLASTER, (222, 210, 186))
    for _ in range(60):
        a, b = int(rng.integers(0, S)), int(rng.integers(0, S))
        d.ellipse([x + a, y + b, x + a + 6, y + b + 6], fill=(210, 198, 174, 255))
    for k, col in ((NOISE_GREEN, (86, 122, 96)), (NOISE_WOOD, (132, 98, 64))):          # noise barrier panels
        x, y = fill(k, col)
        dark = tuple(int(c * 0.72) for c in col)
        for i in range(0, S, 16):
            d.line([(x + i, y), (x + i, y + S)], fill=dark + (255,), width=3)
        d.rectangle([x, y, x + S - 1, y + 12], fill=(90, 94, 98, 255))
        d.rectangle([x, y + S - 13, x + S - 1, y + S - 1], fill=(150, 148, 142, 255))
    for k, base in ((HEDGE_A, (58, 104, 46)), (HEDGE_B, (82, 118, 52))):                # hedge: leaf blobs
        x, y = fill(k, base)
        for _ in range(420):
            a, b = int(rng.integers(0, S - 12)), int(rng.integers(0, S - 12))
            c = int(rng.integers(-26, 30))
            r = int(rng.integers(5, 12))
            d.ellipse([x + a, y + b, x + a + r, y + b + r],
                      fill=(base[0] + c, base[1] + c, base[2] + c // 2, 255))
    img.save(path)
    return path


# --- geometry -----------------------------------------------------------------------------------------------

class Builder(propsmesh.Builder):
    """propsmesh's quads on this atlas."""
    def _uv(self, k, u, v):
        x, y = _box(k)
        inset = 2
        uu = (x + inset + u * (CELL - 2 * inset)) / (ATLAS * CELL)
        vv = 1.0 - (y + inset + (1 - v) * (CELL - 2 * inset)) / (ATLAS * CELL)     # (OBJ: v up)
        return uu, vv


def _post(b, p, z, h, r, k):
    """Square post of half width r at p from below the ground to h above z, with a top."""
    x, y = p
    c = [(x - r, y - r), (x + r, y - r), (x + r, y + r), (x - r, y + r)]
    for i in range(4):
        j = (i + 1) % 4
        b.quad((*c[i], z - 0.3), (*c[j], z - 0.3), (*c[j], z + h), (*c[i], z + h), k)
    b.quad(*[(cx, cy, z + h) for cx, cy in c], k)


def _band(b, a, c, za, zc, lo, hi, k, back=True):
    """Vertical band along a-c from lo to hi over the ground (za, zc), both faces (back) or one."""
    b.quad((*a, za + lo), (*c, zc + lo), (*c, zc + hi), (*a, za + hi), k, back=k if back else None)


def _slab(b, a, c, za, zc, lo, hi, half, k, top_k, taper=0.0, ends=(False, False)):
    """A wall / hedge piece along a-c: both faces half m out (taper: in at the top), a top, ends where asked."""
    d = np.subtract(c, a)
    n = np.array([-d[1], d[0]]) / max(1e-9, float(np.hypot(*d)))
    ht = half - taper
    A0, A1, C0, C1 = np.add(a, n * half), np.subtract(a, n * half), np.add(c, n * half), np.subtract(c, n * half)
    a0, a1, c0, c1 = np.add(a, n * ht), np.subtract(a, n * ht), np.add(c, n * ht), np.subtract(c, n * ht)
    b.quad((*A1, za + lo), (*C1, zc + lo), (*c1, zc + hi), (*a1, za + hi), k)
    b.quad((*C0, zc + lo), (*A0, za + lo), (*a0, za + hi), (*c0, zc + hi), k)
    b.quad((*a1, za + hi), (*c1, zc + hi), (*c0, zc + hi), (*a0, za + hi), top_k)
    if ends[0]:
        b.quad((*A0, za + lo), (*A1, za + lo), (*a1, za + hi), (*a0, za + hi), k)
    if ends[1]:
        b.quad((*C1, zc + lo), (*C0, zc + lo), (*c0, zc + hi), (*c1, zc + hi), k)


# --- the lines ----------------------------------------------------------------------------------------------

def _tags(attrs, i):
    t = attrs.get("tags")
    if t is None:
        return {}
    try:
        v = json.loads(str(t[i]))
    except (TypeError, ValueError):
        return {}
    return v if isinstance(v, dict) else {}


def _roads(frame, md, tx, ty, urban, widths):
    """(segments (m, 4) ENU, half widths (m,), wild (m,): a motorway/trunk) of the carriageways near the tile."""
    segs, hws, wild, seen = [], [], [], set()
    for key in roadsmod.cells_of_tile(frame, tx, ty, REACH_M + 20.0):
        f = md.cell(key, layers=("roads",), kind="demand").layers.get("roads")
        if f is None or len(f) == 0:
            continue
        specs = roadsmod.road_specs(f, urban, widths)
        for i in range(len(f)):
            sp, fid = specs[i], str(f.ids[i])
            if sp is None or fid in seen:
                continue
            seen.add(fid)
            for ring in list(roadsmod.ground_parts(f, i)) + list(roadsmod.bridge_parts(f, i)):
                e, n = mapgeom.enu_xy(f, frame, ring)
                if len(e) < 2:
                    continue
                e, n = np.asarray(e, float), np.asarray(n, float)
                segs.append(np.stack([e[:-1], n[:-1], e[1:], n[1:]], 1))
                hws.append(np.full(len(e) - 1, sp.width / 2))
                wild.append(np.full(len(e) - 1, sp.cls in WILD_ROADS))
    if not segs:
        return np.zeros((0, 4)), np.zeros(0), np.zeros(0, bool)
    return np.concatenate(segs), np.concatenate(hws), np.concatenate(wild)


def _edge_dist(pts, segs, hws):
    """(distance of each point to the nearest carriageway edge (negative: on it), that road's index)."""
    if not len(segs):
        return np.full(len(pts), np.inf), np.zeros(len(pts), np.int64)
    A, D = segs[:, :2], segs[:, 2:] - segs[:, :2]
    L2 = np.maximum((D * D).sum(1), 1e-12)
    out, idx = np.empty(len(pts)), np.empty(len(pts), np.int64)
    for s in range(0, len(pts), 256):
        P = pts[s:s + 256, None, :]
        t = np.clip(((P - A) * D).sum(2) / L2, 0.0, 1.0)
        dist = np.hypot(*(P - (A + t[..., None] * D)).transpose(2, 0, 1)) - hws
        idx[s:s + 256] = dist.argmin(1)
        out[s:s + 256] = dist[np.arange(len(P)), idx[s:s + 256]]
    return out, idx


def _kind(cls, tags, ground, wild, fid):
    """(kind, look cell or None) of a barrier line from its class, OSM tags and the surroundings."""
    if cls == "hedge":
        return "hedge", None
    if cls == "retaining_wall":
        return "retaining", WALL_LOOK.get(str(tags.get("material") or "").lower(), STONE if _hash(fid, "rw") < 0.4
                                          else CONCRETE)
    wall_t = str(tags.get("wall") or "").lower()
    mat = str(tags.get("material") or "").lower().split(";")[0]
    if cls in ("wall", "city_wall"):
        if wall_t == "noise_barrier":
            return "noise", None
        look = WALL_LOOK.get(wall_t) or WALL_LOOK.get(mat)
        if look is None:
            look = STONE if cls == "city_wall" or ground not in GROUND_KIND else \
                (BRICK, PLASTER, CONCRETE, STONE)[int(_hash(fid, "wl") * 4)]
        return "wall", look
    ft = str(tags.get("fence_type") or "").lower()
    kind = FENCE_TYPE.get(ft) or FENCE_TYPE.get(mat)
    if kind is None:
        kind = "chain" if wild and ground not in GROUND_KIND else GROUND_KIND.get(ground, "pasture")
    if kind == "wall":
        return "wall", WALL_LOOK.get(ft) or WALL_LOOK.get(mat) or CONCRETE
    return kind, None


def build(frame, md, tx, ty, elev, urban=None, widths=None):
    """(visible mesh, collision mesh) of the tile's fences, walls and hedges, each None when there are none; elev(lat,
    lon): the visible ground's height."""
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    lines, gates, seen = [], [], set()
    for key in roadsmod.cells_of_tile(frame, tx, ty, 10.0):
        f = md.cell(key, layers=("infrastructure",), kind="demand").layers.get("infrastructure")
        if f is None or len(f) == 0 or f.attrs.get("class") is None:
            continue
        sub, cls, xy = f.attrs["subtype"], f.attrs["class"], f.xy_in(frame)
        for i in range(len(f)):
            if sub[i] != "barrier":
                continue
            c, fid = str(cls[i]), str(f.ids[i])
            if c in GATES:
                for part in f.parts(i, xy):
                    for ring in part:
                        gates.extend(np.asarray(ring, float)[:, :2].tolist())
                continue
            if c not in CLASSES or fid in seen or f.kind[i] == mapgeom.POINT:
                continue
            seen.add(fid)
            for part in f.parts(i, xy):
                if part and len(part[0]) >= 2:          # (an area: its outline)
                    r = np.asarray(part[0], float)[:, :2]
                    if r[:, 0].max() >= x0 - 1 and r[:, 0].min() <= x1 + 1 and r[:, 1].max() >= y0 - 1 \
                            and r[:, 1].min() <= y1 + 1:
                        lines.append((c, fid, _tags(f.attrs, i), r))
    if not lines:
        return None, None
    segs, hws, wild = _roads(frame, md, tx, ty, urban, widths)
    mats = groundcover.materials(frame, md, tx, ty, CELL_M)
    gates = np.asarray(gates, float).reshape(-1, 2)
    deco, col = Builder(), Builder()
    zcache = {}

    def z_at(p):
        k = (round(float(p[0]), 2), round(float(p[1]), 2))
        if k not in zcache:
            la, lo, _ = frame.enu_to_geodetic(float(p[0]), float(p[1]), 0.0)
            z = elev(float(la), float(lo))
            zcache[k] = float(frame.geodetic_to_enu(la, lo, z)[2])
        return zcache[k]

    def ground_at(pts):
        i = np.clip(((pts[:, 0] - x0) / CELL_M).astype(int), 0, mats.shape[1] - 1)
        j = np.clip(((pts[:, 1] - y0) / CELL_M).astype(int), 0, mats.shape[0] - 1)
        inside = (pts[:, 0] >= x0) & (pts[:, 0] < x1) & (pts[:, 1] >= y0) & (pts[:, 1] < y1)
        return [str(m)[:8] if str(m).startswith("gc_field") else str(m) for m in mats[j[inside], i[inside]]]

    for cls, fid, tags, r in lines:
        # the surroundings: the ground SIDE_M to both sides along the line, the nearest road
        d = np.diff(r, axis=0)
        L = np.hypot(d[:, 0], d[:, 1])
        ok = L > 0.05
        if not ok.any():
            continue
        mid = (r[:-1] + r[1:])[ok] / 2
        nrm = np.stack([-d[ok, 1], d[ok, 0]], 1) / L[ok, None]
        g = ground_at(np.concatenate([mid + nrm * SIDE_M, mid - nrm * SIDE_M]))
        vals, cnt = np.unique(g, return_counts=True) if g else (np.array(["gc_meadow"]), np.array([1]))
        known = [(c_, v) for v, c_ in zip(vals, cnt) if v in GROUND_KIND]
        ground = max(known)[1] if known and max(known)[0] * 3 >= len(g) else str(vals[cnt.argmax()])
        dist, ri = _edge_dist(mid, segs, hws)
        near_wild = bool(len(segs)) and bool((wild[ri] & (dist < WILD_M)).any())
        if dist.min() > REACH_M:
            continue
        kind, look = _kind(cls, tags, ground, near_wild, fid)
        (h0, h1), (s0, s1) = KINDS[kind]
        h = _height(tags) if kind != "retaining" else None
        if h is None:
            h = h0 + (h1 - h0) * _hash(fid, "h")
        if kind == "chain" and ground == "gc_pitch":
            h = max(h, 3.0 + _hash(fid, "hp"))      # (a ball stop)
        span = s0 + (s1 - s0) * _hash(fid, "s")
        v = _hash(fid, "v")                          # the variant
        # posts: the line's points plus some between them (at most span apart)
        pts = [r[0]]
        for a, c in zip(r[:-1], r[1:]):
            n = max(1, int(math.ceil(float(np.hypot(*(c - a))) / span)))
            pts += [a + (c - a) * (k / n) for k in range(1, n + 1)]
        pts = np.asarray(pts)
        pd, _ = _edge_dist(pts, segs, hws)
        clear = pd >= CLEAR_M
        if len(gates):
            gd = np.hypot(*(pts[:, None, :] - gates[None]).transpose(2, 0, 1)).min(1)
            clear &= gd >= GATE_GAP_M
        inside = (pts[:, 0] >= x0) & (pts[:, 0] < x1) & (pts[:, 1] >= y0) & (pts[:, 1] < y1)
        z = np.array([z_at(p) for p in pts])
        wire = kind == "pasture" and v < 0.6
        post_k = POST_WOOD if kind in ("pasture", "garden") or (kind == "chain" and near_wild) else \
            POST_DARK if kind == "bars" else POST_GREY
        for k in range(len(pts) - 1):
            a, c = pts[k], pts[k + 1]
            if not (clear[k] and clear[k + 1] and inside[k]) or np.hypot(*(c - a)) < 0.05:
                continue
            za, zc = z[k], z[k + 1]
            first = k == 0 or not clear[k - 1]
            last = k + 2 >= len(pts) or not clear[k + 2]
            if kind in ("pasture", "garden", "chain", "bars"):
                if first or kind != "bars":
                    _post(deco, a, za, h + (0.05 if kind != "garden" else 0.0), 0.06 if kind == "pasture" else 0.04,
                          post_k)
                if last:
                    _post(deco, c, zc, h + (0.05 if kind != "garden" else 0.0), 0.06 if kind == "pasture" else 0.04,
                          post_k)
            if kind == "pasture":
                if wire:                                    # 2-3 wires (one white tape: electric)
                    n = 2 if v < 0.3 else 3
                    for m in range(n):
                        hh = h * (0.4 + 0.55 * m / max(1, n - 1))
                        _band(deco, a, c, za, zc, hh - 0.012, hh + 0.012, CAP if (v < 0.1 and m == n - 1) else WIRE)
                else:                                       # two or three wooden rails
                    for hh in ((0.45, 0.9) if v < 0.85 else (0.3, 0.6, 0.9)):
                        _band(deco, a, c, za, zc, h * hh - 0.06, h * hh + 0.06, RAIL_WOOD)
            elif kind == "garden":
                cell = (PICKET_WOOD if v < 0.35 else PICKET_WHITE if v < 0.6 else BOARD_WOOD if v < 0.85 else
                        BOARD_GREY)
                hh = h if cell in (PICKET_WOOD, PICKET_WHITE) else max(h, 1.5)
                _band(deco, a, c, za, zc, 0.05, hh, cell)
            elif kind == "chain":
                _band(deco, a, c, za, zc, 0.0, h, CHAIN_GREEN if v < 0.4 else CHAIN_GREY)
            elif kind == "bars":
                cell = MESH_GREEN if v < 0.4 else MESH_DARK if v < 0.75 else RAILING
                _band(deco, a, c, za, zc, 0.0, h, cell)
                _post(deco, c, zc, h, 0.03, POST_DARK)
            elif kind == "wall":
                half = 0.2 if look in (BRICK, PLASTER) else 0.25 if look == CONCRETE else 0.3
                _slab(deco, a, c, za, zc, -0.3, h, half, look, CAP if look != STONE else STONE, ends=(first, last))
            elif kind == "noise":
                _slab(deco, a, c, za, zc, -0.3, h, 0.12, NOISE_GREEN if v < 0.6 else NOISE_WOOD, POST_GREY,
                      ends=(first, last))
            elif kind == "hedge":
                _slab(deco, a, c, za, zc, -0.2, h, 0.45 + 0.2 * _hash(fid, "w"), HEDGE_A if v < 0.5 else HEDGE_B,
                      HEDGE_A if v < 0.5 else HEDGE_B, taper=0.12, ends=(first, last))
            elif kind == "retaining":                       # its top over the higher side
                _slab(deco, a, c, za, zc, -1.0, h * 0.5, 0.25, look, CAP, ends=(first, last))
            if kind != "retaining":                         # collision: one wall per panel (obj_to_kn5: double-sided)
                col.quad((*a, za - 0.3), (*c, zc - 0.3), (*c, zc + h), (*a, za + h), WIRE)
    return deco.mesh(), col.mesh()


def substation_fence(groups, rows):
    """(visible mesh, collision mesh) of the substations' chain link (BeamNG.Earth powerlines.py: "sub_fence" props rows,
    one 2.04 m panel each along its x = (cos yaw, sin yaw), model height 1.76 m), each None when there is none."""
    deco, col = Builder(), Builder()
    for row in rows:
        if groups[row[0]] != "sub_fence":
            continue
        x, y, z, yaw, h = row[1], row[2], row[3], math.radians(row[4]), row[6]
        d = np.array([math.cos(yaw), math.sin(yaw)]) * 1.02
        a, c = (x - d[0], y - d[1]), (x + d[0], y + d[1])
        _band(deco, a, c, z, z, 0.0, h, CHAIN_GREY)
        _post(deco, a, z, h + 0.3, 0.04, POST_GREY)
        _band(deco, a, c, z, z, h + 0.2, h + 0.22, WIRE)            # (a strand of wire over it)
        col.quad((*a, z - 0.3), (*c, z - 0.3), (*c, z + h), (*a, z + h), WIRE)
    return deco.mesh(), col.mesh()
