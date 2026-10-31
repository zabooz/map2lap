"""Water (rivers, lakes, reservoirs) for a 256 m tile: the terrain lowered under water, and the water surface.

Source: Overture/OSM water areas (like buildings.water_rings, BeamNG.Earth), rasterised at 1 m (with a margin so
tile borders come out the same). Water level from the terrain heights inside the area (laser terrain models show the
mostly flat surface over water), their 25th percentile:
- lakes, reservoirs, the sea: one level per area and tile;
- rivers, streams, canals (FLOWING): the level runs downhill with the bed, the percentile within FLOW_R of each cell,
  smoothed (2026-10-31: one level per tile left the Lieser at Seeboden floating as a pale slab downstream and under
  the ground upstream, with steps at the tile borders).
The terrain is lowered below the level (0.15 m at the shore, +0.25 m per metre away from the shore inwards, at most
1.5 m, plus whatever of it stood above the level), the surface lies on the level per vertex and reaches one cell past
the shore: the shoreline is where the terrain comes out of it, not the 2 m cells' stairs.
"""
import math
import os
import random
import warnings

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import mapgeom
import roads as roadsmod

FOAM_M = 2.5                # m: cells this close to the shore get the comic foam
TEX_PX = 512


def _wavy(d, rng, color, count, width, w, h):
    """Curved wave strokes, repeated across the edges (tiles seamlessly)."""
    for _ in range(count):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        length, amp, ph = rng.uniform(40, 110), rng.uniform(3, 7), rng.uniform(0, 6.3)
        pts = [(x + t, y + amp * math.sin(ph + t / 14)) for t in np.linspace(0, length, 14)]
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                d.line([(px + ox, py + oy) for px, py in pts], fill=color, width=width, joint="curve")


def make_textures(water_path, foam_path, seed=11):
    """Comic water and shore foam (matching the trees): flat colour, wave strokes, glints; seamless."""
    rng = random.Random(seed)
    img = Image.new("RGB", (TEX_PX, TEX_PX), (52, 128, 196))
    d = ImageDraw.Draw(img)
    _wavy(d, rng, (72, 152, 214), 60, 6, TEX_PX, TEX_PX)
    _wavy(d, rng, (120, 190, 235), 28, 4, TEX_PX, TEX_PX)
    for _ in range(40):                                     # small white glints
        x, y, r = rng.uniform(0, TEX_PX), rng.uniform(0, TEX_PX), rng.uniform(1.5, 3.5)
        d.ellipse([x - r * 2, y - r, x + r * 2, y + r], fill=(235, 248, 255))
    img.filter(ImageFilter.SMOOTH).save(water_path)
    foam = Image.new("RGB", (TEX_PX, TEX_PX), (150, 214, 240))
    d = ImageDraw.Draw(foam)
    _wavy(d, rng, (235, 248, 255), 70, 7, TEX_PX, TEX_PX)
    foam.filter(ImageFilter.SMOOTH).save(foam_path)
    # second, transparent wave layer for the animation (CSP Scriptable Display, water_anim.lua)
    waves = Image.new("RGBA", (TEX_PX, TEX_PX), (0, 0, 0, 0))
    d = ImageDraw.Draw(waves)
    _wavy(d, rng, (170, 220, 250, 255), 34, 4, TEX_PX, TEX_PX)
    _wavy(d, rng, (240, 250, 255, 255), 10, 3, TEX_PX, TEX_PX)
    waves.save(os.path.splitext(water_path)[0] + "_waves.png")


ANIM_LUA = """\
-- Animated comic water (CSP Scriptable Display): the base texture flows slowly, a wave layer runs the other way.
local t = 0
local SPEED = {SPEED}

local function tiled(img, ox, oy, size, color)
  for i = -1, 0 do
    for j = -1, 0 do
      local p = vec2((i + ox) * size.x, (j + oy) * size.y)
      ui.drawImage(img, p, p + size, color)
    end
  end
end

function update(dt)
  t = t + dt
  local s = ac.currentDisplayTextureResolution()
  tiled('{BASE}', (t * 0.020 * SPEED) % 1, (t * 0.012 * SPEED) % 1, s, rgbm.colors.white)
  tiled('water_waves.png', (-t * 0.035 * SPEED) % 1, (t * 0.022 * SPEED) % 1, s, rgbm(1, 1, 1, {WAVES}))
end
"""


def write_anim(ext_dir, tex_dir):
    """Scripts and textures for the water animation into the track's extension folder."""
    import shutil
    for n in ("water.png", "foam.png", "water_waves.png"):
        shutil.copy2(os.path.join(tex_dir, n), os.path.join(ext_dir, n))
    for name, base, speed, waves in (("water_anim.lua", "water.png", 1.0, 0.7),
                                     ("foam_anim.lua", "foam.png", 2.2, 0.9)):
        with open(os.path.join(ext_dir, name), "w", encoding="utf-8") as f:
            f.write(ANIM_LUA.replace("{BASE}", base).replace("{SPEED}", str(speed)).replace("{WAVES}", str(waves)))


MARGIN = 16                 # m margin around the raster
SHORE_DEPTH, SLOPE, MAX_DEPTH, DIST_STEPS = 0.15, 0.25, 1.5, 6
LEVEL_PERCENTILE = 25
UV_M = 20.0
FLOWING = {"river", "stream", "canal", "drain", "ditch"}     # Overture water subtype / class whose surface runs downhill
FLOW_R = 14.0               # m (square reach, at most MARGIN): a flowing water's level from the bed around each cell
SMOOTH_R = 6.0              # m: then averaged over this reach


def _rings(frame, layers, x0, y0, size):
    """[(outer ring (k, 2), [hole rings], flowing)] relative to (x0, y0) of the water areas near the tile."""
    out = []
    for f in layers:
        if f is None or len(f.kind) == 0:
            continue
        sub, cls = f.attrs.get("subtype"), f.attrs.get("class")
        for i in np.flatnonzero(f.kind == 3):
            flowing = (sub is not None and str(sub[i]) in FLOWING) or (cls is not None and str(cls[i]) in FLOWING)
            for part in f.parts(i):
                if not part or len(part[0]) < 4:
                    continue
                e, n = mapgeom.enu_xy(f, frame, part[0])
                xy = np.stack([e - x0, n - y0], 1)
                if xy[:, 0].max() < -MARGIN or xy[:, 0].min() > size + MARGIN or xy[:, 1].max() < -MARGIN \
                        or xy[:, 1].min() > size + MARGIN:
                    continue
                holes = []
                for h in part[1:]:
                    if len(h) >= 4:
                        he, hn = mapgeom.enu_xy(f, frame, h)
                        holes.append(np.stack([he - x0, hn - y0], 1))
                out.append((xy, holes, flowing))
    return out


def _window(a, valid, r, fn):
    """fn over the valid values of a (2-D) in the (2r+1)^2 square around each valid cell (NaN elsewhere)."""
    pad = np.pad(np.where(valid, a, np.nan), r, constant_values=np.nan)
    jj, ii = np.nonzero(valid)
    offs = np.arange(-r, r + 1)
    out = np.full(a.shape, np.nan)
    for s in range(0, len(jj), 4096):
        j, i = jj[s:s + 4096, None, None] + r, ii[s:s + 4096, None, None] + r
        win = pad[j + offs[None, :, None], i + offs[None, None, :]].reshape(len(j), -1)
        out[jj[s:s + 4096], ii[s:s + 4096]] = fn(win)
    return out


def _label_image(rings, size):
    """int32 image (1 px = 1 m, margin MARGIN): 0 land, p+1 water area p (islands left out)."""
    w = int(size) + 2 * MARGIN
    img = Image.new("I", (w, w), 0)
    d = ImageDraw.Draw(img)

    def px(ring):
        return [(float(x) + MARGIN, float(size + MARGIN - y)) for x, y in ring]
    for p, (outer, holes, _) in enumerate(rings):
        d.polygon(px(outer), fill=p + 1)
        for h in holes:
            d.polygon(px(h), fill=0)
    return np.asarray(img, np.int32)


def _distance(water, steps):
    """Rough distance to the shore in pixels (up to steps), by repeated 4-neighbour erosion."""
    dist = np.zeros(water.shape, np.float32)
    cur = water.copy()
    for _ in range(steps):
        nxt = cur.copy()
        nxt[1:, :] &= cur[:-1, :]
        nxt[:-1, :] &= cur[1:, :]
        nxt[:, 1:] &= cur[:, :-1]
        nxt[:, :-1] &= cur[:, 1:]
        cur = nxt
        dist += cur
    return dist


def water_tile(frame, md, raw_elev, tx, ty, cell=2.0):
    """(lowering per terrain vertex (n, n) [j, i] or None, water mesh (P, UV, T) in ENU or None,
    shore foam mesh (P, UV, T) or None)."""
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    size = x1 - x0
    keys = roadsmod.cells_of_tile(frame, tx, ty, MARGIN)
    layers = [md.cell(k, layers=("water",), kind="demand").layers.get("water") for k in keys]
    rings = _rings(frame, layers, x0, y0, size)
    if not rings:
        return None, None, None
    lab = _label_image(rings, size)
    if not lab.any():
        return None, None, None
    flowing = np.array([False] + [r[2] for r in rings])          # per label
    n = int(round(size / cell)) + 1
    m = n - 1

    # the terrain vertices: wet ones, distance to the shore
    dist = _distance(lab > 0, DIST_STEPS)
    ii, jj = np.meshgrid(np.arange(n), np.arange(n))
    col = np.clip((ii * cell + MARGIN).astype(int), 0, lab.shape[1] - 1)
    row = np.clip((size + MARGIN - jj * cell).astype(int), 0, lab.shape[0] - 1)
    wet = lab[row, col] > 0
    depth = np.where(wet, np.minimum(MAX_DEPTH, SHORE_DEPTH + SLOPE * dist[row, col]), 0.0)

    # cells (centres) on a grid padded by FLOW_R: a flowing water's level comes out the same on both sides of a tile
    # border; lakes keep one level per area from their cells inside the tile
    pad = int(FLOW_R // cell)
    ci, cj = np.meshgrid(np.arange(-pad, m + pad), np.arange(-pad, m + pad))
    ccol = np.clip((ci * cell + cell / 2 + MARGIN).astype(int), 0, lab.shape[1] - 1)
    crow = np.clip((size + MARGIN - (cj * cell + cell / 2)).astype(int), 0, lab.shape[0] - 1)
    clab = lab[crow, ccol]
    inner = (ci >= 0) & (ci < m) & (cj >= 0) & (cj < m)
    if not (clab[inner] > 0).any():
        return (depth if wet.any() else None), None, None
    sel = clab > 0
    h = np.full(clab.shape, np.nan)
    la, lo, _ = frame.enu_to_geodetic(x0 + ci[sel] * cell + cell / 2, y0 + cj[sel] * cell + cell / 2, 0.0)
    h[sel] = np.asarray(raw_elev(la, lo), np.float64)
    level = np.full(clab.shape, np.nan)
    for p in np.unique(clab[sel & inner]):
        if not flowing[p]:
            level[clab == p] = float(np.percentile(h[(clab == p) & inner], LEVEL_PERCENTILE))
    flow = sel & flowing[clab]
    if flow.any():
        lv = _window(h, flow, pad, lambda w: np.nanpercentile(w, LEVEL_PERCENTILE, axis=1))
        lv = _window(lv, flow, int(SMOOTH_R // cell), lambda w: np.nanmean(w, axis=1))
        level[flow] = lv[flow]

    # levels at the vertices: the mean of the wet cells around each, then one vertex further (the shore cells)
    with warnings.catch_warnings():         # (vertices with no wet cell around: NaN, "mean of empty slice")
        warnings.simplefilter("ignore", RuntimeWarning)
        vl = np.nanmean(np.stack([level[pad - 1 + dj:pad - 1 + dj + n, pad - 1 + di:pad - 1 + di + n]
                                  for dj in (0, 1) for di in (0, 1)]), axis=0)
        vp = np.pad(vl, 1, constant_values=np.nan)
        ring = np.nanmean(np.stack([vp[1 + dj:1 + dj + n, 1 + di:1 + di + n] for dj in (-1, 0, 1)
                                    for di in (-1, 0, 1)]), axis=0)
    vl = np.where(np.isnan(vl), ring, vl)

    # lowering: below the level wherever the terrain stood above it
    up = wet & ~np.isnan(vl)
    if up.any():
        la, lo, _ = frame.enu_to_geodetic(x0 + ii[up] * cell, y0 + jj[up] * cell, 0.0)
        depth[up] += np.maximum(0.0, np.asarray(raw_elev(la, lo), np.float64) - vl[up])

    # surface: the wet cells and one more around them (all four corners with a level), on the vertices' levels;
    # cells close to the shore as a separate foam strip (comic style)
    wet_c = sel[pad:pad + m, pad:pad + m]
    corners = ~np.isnan(vl)
    drawn = corners[:-1, :-1] & corners[:-1, 1:] & corners[1:, :-1] & corners[1:, 1:]
    cd = dist[crow[pad:pad + m, pad:pad + m], ccol[pad:pad + m, pad:pad + m]]
    shore = ~wet_c | (cd < FOAM_M)
    gi, gj = np.meshgrid(np.arange(m), np.arange(m))

    def quads(mask):
        cells = np.flatnonzero(mask.ravel())
        if not len(cells):
            return None
        ci_s, cj_s = gi.ravel()[cells], gj.ravel()[cells]
        P = np.zeros((len(cells) * 4, 3))
        for k, (di, dj) in enumerate([(0, 0), (1, 0), (0, 1), (1, 1)]):
            ex, ny = x0 + (ci_s + di) * cell, y0 + (cj_s + dj) * cell
            la, lo, _ = frame.enu_to_geodetic(ex, ny, 0.0)
            u = np.asarray(frame.geodetic_to_enu(la, lo, vl[cj_s + dj, ci_s + di])[2], np.float64)
            P[k::4] = np.c_[ex, ny, u]
        base = np.arange(len(cells)) * 4
        T = np.r_[np.c_[base, base + 1, base + 3], np.c_[base, base + 3, base + 2]]
        return P, P[:, :2] / UV_M, T
    return (depth if wet.any() else None), quads(drawn & ~shore), quads(drawn & shore)
