"""Terrain of one tile like BeamNG.Earth's terrain block (blockworker.build), for AC: one mesh for looks and physics,
with the roads painted into the terrain (BeamNG.Earth's default since 22.10.2026, roads.ROADS_IN_GROUND).

As in BeamNG.Earth:
- Heights: ground (blockworker.ground) levelled under the roads with grading.ROAD_LIFT (the physics the road mesh
  lies on there), raised over flat tunnel vaults (roads.block_arch_raise), holes at the tunnel portals
  (roads.block_tunnel_holes).
- Surface per 2 m cell (surface.classify + surface.paint_roads + paint_lots): asphalt, cobbles, gravel, grass ...
  Here it decides the AC object name (1ROAD / 1GRAVEL / 1GRASS), so grip and sound.
- Looks: one texture per tile (TEX_PX): comic ground (groundcover) with the roads on top in BeamNG.Earth's road shapes
  and widths (surface._road_segments, earthfast.paint_lines; anti-aliased).

Unlike BeamNG.Earth: visible terrain = physics terrain (there the visible terrain lies 4 cm lower because a road mesh
lies on top as well; here there is none, the asphalt is the terrain texture).
"""
import os

import numpy as np
from PIL import Image

import blockworker
import fast
import grading as gradingmod
import heightmap
import roads as roadsmod
import surface as surfacemod

from scenery import groundcover

CELL = heightmap.SQUARE         # 2 m, BeamNG.Earth's terrain grid
TILE = roadsmod.TILE            # 256 m
TEX_PX = 2048                   # pixels per tile edge (12.5 cm); TODO long routes: ksMultilayer (mask + detail)
GC_PX_M = 1.0                   # m per cell of the comic ground classes (groundcover), then scaled up to TEX_PX
TERRAIN_UV_M = 8.0              # m per repeat of the comic ground textures
# Road look -> (texture, m per repeat, brightness); painted in this order. Asphalt by road class (_look).
# Textures: the comic surfaces (roadtex.make_surfaces, in the texture folder; photos from ambientCG used to turn into
# mush at 12.5 cm per pixel). Brightness: the asphalt classes against each other. (A single photo asphalt for all
# roads looked too bright next to the comic ground, gravel and dirt tracks shared one look.)
ROAD_LOOKS = {"dirt": ("road_dirt", 6.0, 1.0), "gravel": ("road_gravel", 4.0, 1.0), "cobble": ("road_cobble", 4.0, 1.0),
              "concrete": ("road_concrete", 6.0, 1.0), "service": ("road_asphalt", 4.0, 1.12),
              "minor": ("road_asphalt", 4.0, 1.06), "main": ("road_asphalt", 4.0, 1.0),
              "motorway": ("road_asphalt", 4.0, 0.95)}     # (asphalt 4 m: the bridge deck repeats it like that)
DECK_LOOK = "main"              # bridge decks (one material for all classes, make_obj): close to motorway and main road
KIND_LOOK = {"dirt": "dirt", "gravel": "gravel", "cobble": "cobble", "paved": "main"}   # (when _look can't tell)
WEAR = {"minor": 1.0, "service": 1.0, "main": 0.35}     # patches and sealed cracks (_wear), strength
CALM = {"concrete", "service", "minor", "main", "motorway"}    # one-colour surfaces (roadtex): soft world-locked blotches
MOTTLE = (3.0, 0.04)            # m, strength of the blotches (nothing repeats, nothing below a pixel)
ROCK_SLOPE = (0.84, 1.19)       # slope (tan): transition to the rock face from 40° to 50° (alpine meadows hold up to ~40°)
ROCK_BAND_M = 4.0               # m of height per rock layer on the face (soft light/dark; 1.8 m hard looked like
                                # contour lines from above, 3.5 m with +-10 %: zebra stripes)
# Streams, rivers, canals: in Overture often only a line (Heiligenblut: ~190 streams, 16 rivers, 14 canals as lines,
# 2 river areas); water.py draws only the areas. Painted into the terrain texture here: class -> (half width of the
# water m, bank per side m); intermittent ones (is_intermittent) as a stone bed. Ditches not, like BeamNG.Earth's riverlines
STREAMS = {"stream": (0.8, 0.6), "river": (3.0, 1.2), "canal": (2.0, 0.5)}
STREAM_WATER, STREAM_BANK, STREAM_DRY = (66, 124, 172), (104, 98, 84), (156, 150, 138)
TRACK_GRASS = 0.22            # dirt track: grass strip in the middle, share of the width (0.16 looked like a line)
# BeamNG.Earth surface -> AC driving surface (object name, surfaces.ini)
SURF_AC = {surfacemod.ASPHALT: "1ROAD", surfacemod.COBBLE: "1ROAD", surfacemod.DUSTY: "1GRAVEL",
           surfacemod.LOOSE: "1GRAVEL", surfacemod.ROCK: "1GRAVEL", surfacemod.GRASS: "1GRASS",
           surfacemod.LAWN: "1GRASS", surfacemod.MUD: "1GRASS", surfacemod.SNOW: "1GRASS", surfacemod.DIRT: "1GRASS"}

_tex = {}                       # per process: loaded textures (name -> array H x W x 3)


def _texture(path, px):
    """Texture scaled down to px x px (smoothed): px = pixels of the tile texture per repeat, otherwise sampling gives
    a coarse blotchy pattern (asphalt looked like cobblestones)."""
    if (path, px) not in _tex:
        _tex[(path, px)] = np.asarray(Image.open(path).convert("RGB").resize((px, px), Image.LANCZOS), np.float32)
    return _tex[(path, px)]


def _to_px(a):
    """Field a (row 0 = north) bilinear onto TEX_PX x TEX_PX."""
    return np.asarray(Image.fromarray(np.asarray(a, np.float32), "F").resize((TEX_PX, TEX_PX), Image.BILINEAR))


def _sample(tex, x, y, repeat_m):
    """World-locked tiling: colour of the texture tex at the world points (x, y) with repeat_m m per repeat."""
    h, w = tex.shape[:2]
    c = np.floor((x / repeat_m % 1.0) * w).astype(np.int64) % w
    r = np.floor((1.0 - y / repeat_m % 1.0) * h).astype(np.int64) % h      # (image row 0 at the top = north)
    return tex[r, c]


def _look(spec, osm_surface):
    """Look of a road (ROAD_LOOKS) from BeamNG.Earth's spec (roads.road_specs) and OSM's surface."""
    if spec.kind != "paved":
        return spec.kind
    if osm_surface and osm_surface.startswith("concrete"):
        return "concrete"
    if spec.cls in ("motorway", "trunk"):
        return "motorway"
    if spec.cls in ("primary", "secondary", "tertiary"):    # (tertiary: e.g. the Grossglockner High Alpine Road, a
        return "main"                                       # well-kept toll road, not patched like a town street)
    return "service" if spec.cls == "service" else "minor"


def _segment_looks(frame, x0, y0, feats_list, urban, widths, kind, roads_of):
    """Look number (in ROAD_LOOKS) per segment of surface._road_segments: its road numbers (roads_of) back to the
    roads, counted with the same filters as there; the ramp wedges after them like motorway. If the count doesn't
    match (BeamNG.Earth changed), by the surface alone."""
    names = list(ROAD_LOOKS)
    fallback = np.array([names.index(KIND_LOOK[k]) for k in surfacemod.PHOTO_ROAD_RGBA], np.uint8)[kind]
    looks, seen = [], set()
    for feats in feats_list:
        if feats is None or len(feats) == 0:
            continue
        specs = roadsmod.road_specs(feats, urban, widths)
        box = surfacemod._feature_boxes(feats, frame)
        ids = feats.ids.tolist()
        osm = feats.attrs.get("osm_surface")
        for i in range(len(feats)):
            fid, spec = str(ids[i]), specs[i]
            if spec is None or fid in seen or spec.kind not in surfacemod.PHOTO_ROAD_RGBA:
                continue
            seen.add(fid)
            m = spec.width / 2
            if box[i, 1] < x0 - m or box[i, 0] > x0 + TILE + m or box[i, 3] < y0 - m or box[i, 2] > y0 + TILE + m:
                continue
            looks.append(names.index(_look(spec, None if osm is None else str(osm[i]))))
    nr = np.concatenate([r for r, _ in roads_of]) if roads_of else np.zeros(0, np.int64)
    if len(nr) != len(kind):
        return fallback
    return np.array(looks + [names.index("motorway")], np.uint8)[np.minimum(nr, len(looks))]


def _streams(frame, md, tx, ty, px_m):
    """The water lines around the tile (STREAMS): (segments (m, 4) in pixels of the tile texture, half width of the water,
    half width with the bank (pixels), dry (m,)), or None."""
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    segs, hw, hb, dry = [], [], [], []
    for key in roadsmod.cells_of_tile(frame, tx, ty, 10.0):
        f = md.cell(key, layers=("water",), kind="demand").layers.get("water")
        if f is None or len(f) == 0:
            continue
        cls, inter, xy = f.attrs["class"], f.attrs.get("is_intermittent"), f.xy_in(frame)
        for i in np.flatnonzero(f.kind == 2):
            w = STREAMS.get(str(cls[i]))
            if w is None:
                continue
            for part in f.parts(i, xy):
                for line in part:
                    if len(line) < 2 or line[:, 0].max() < x0 - 10 or line[:, 0].min() > x1 + 10 or \
                            line[:, 1].max() < y0 - 10 or line[:, 1].min() > y1 + 10:
                        continue
                    c, r = (line[:, 0] - x0) * px_m, (y1 - line[:, 1]) * px_m
                    k = len(line) - 1
                    segs.append(np.stack([c[:-1], r[:-1], c[1:], r[1:]], 1))
                    hw.append(np.full(k, w[0] * px_m))
                    hb.append(np.full(k, (w[0] + w[1]) * px_m))
                    dry.append(np.full(k, inter is not None and str(inter[i]) == "True"))
    if not segs:
        return None
    return np.concatenate(segs), np.concatenate(hw), np.concatenate(hb), np.concatenate(dry)


def _wear(rgb, x, y, amount):
    """Patches (darker blotches) and sealed cracks (thin dark lines, only here and there), world-locked."""
    # (a first try with patches from 0.6 and cracks on 40 % of the area looked like lava)
    patch = groundcover._noise(x, y, 7.0, 31) > 0.7
    crack = (np.abs(groundcover._noise(x, y, 5.0, 37)) < 0.018) & (groundcover._noise(x, y, 31.0, 41) > 0.55)
    rgb = rgb.copy()
    rgb[patch] *= 1.0 - 0.12 * amount
    rgb[crack] *= 1.0 - 0.35 * amount
    return rgb


def build(frame, aid, tx, ty, g, dem, zoom, depth, md, tex_src, gc_dir, out_tex, log=print):
    """Terrain of the tile (tx, ty): returns (P (n*n, 3) ENU, UV (n*n, 2), {AC prefix: triangles}, texture file).
    depth (n, n): lowering under water (water.water_tile) or None."""
    s = blockworker._s
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    n = int(round((x1 - x0) / CELL)) + 1
    gx, gy = np.meshgrid(x0 + np.arange(n) * CELL, y0 + np.arange(n) * CELL)
    la, lo, _ = frame.enu_to_geodetic(gx.ravel(), gy.ravel(), 0.0)
    la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)

    def elev(la_, lo_):          # (blockworker.build: levelled with ROAD_LIFT, the physics)
        z = blockworker.ground(frame, la_, lo_, dem.sample(la_, lo_, zoom))
        return g.apply(la_, lo_, z, gradingmod.ROAD_LIFT) if g is not None else z

    half = n * CELL / 2
    cx, cy = x0 + half, y0 + half   # (heightmap convention: sample (ix, iy) at (cx - half + ix * CELL, ...))
    box = (cx - half, cy - half, cx + half, cy + half)
    z = np.asarray(elev(la, lo), np.float64)
    tun = cell_fn = None
    if md is not None:
        cell_fn = lambda key: md.cell(key, layers=("roads",), kind="demand").layers.get("roads")   # noqa: E731
        try:
            tun = blockworker.tunnel_profiles(aid, frame, elev, g)
            z = np.asarray(roadsmod.block_arch_raise(tun, cell_fn, frame, la, lo, z, box), np.float64)
        except Exception as e:  # (like blockworker: rather without the vault raise than without the tile)
            log(f"Ground {tx},{ty}: arch raise: {type(e).__name__}: {e}")
    if depth is not None:
        z = z - depth.ravel()
    u = np.asarray(frame.geodetic_to_enu(la, lo, z)[2], np.float64)
    P = np.c_[gx.ravel(), gy.ravel(), u]
    keep = {"lat": la.reshape(n, n), "lon": lo.reshape(n, n), "u": u.reshape(n, n)}

    holes = np.zeros((n, n), bool)
    if tun is not None:
        try:
            h = roadsmod.block_tunnel_holes(tun, cell_fn, frame, keep, cx, cy, CELL)
            if h is not None:
                holes = np.asarray(h, bool)
        except Exception as e:
            log(f"Ground {tx},{ty}: tunnel holes: {type(e).__name__}: {e}")

    # surface per sample like blockworker.build (land use, slope -> rock, roads, car parks)
    idx = np.full((n, n), surfacemod.GRASS, np.int64)
    feats = []
    if s.surface is not None:
        classes, _ = s.surface.classes(keep["lat"], keep["lon"])
        idx = surfacemod.classify(classes, keep["u"], CELL, keep["lat"], keep["lon"])
        feats, _ = s.surface.roads(keep["lat"], keep["lon"])
        if feats:
            idx = surfacemod.paint_roads(idx, keep["lat"], keep["lon"], feats, CELL, s.surface.urban, s.widths,
                                         blockworker._open_tunnels(g, keep))
        if hasattr(s.surface, "lots"):
            idx = surfacemod.paint_lots(idx, keep["lat"], keep["lon"], s.surface.lots(keep["lat"], keep["lon"]))
    idx = np.asarray(idx)

    # triangles per cell (split SW to NE as before), without cells at the portal hole; surface: the SW sample
    i, j = np.meshgrid(np.arange(n - 1), np.arange(n - 1))
    a = (j * n + i).ravel()
    b, c, d = a + 1, a + n, a + n + 1
    # (a cell goes as soon as any of its corners is a hole: the SW corner alone left triangles of the slope above the
    # portal hanging diagonally into the tube, a green block in the opening; the portal frame hides the edge,
    # roadmesh.PORTAL_FRAME)
    open_ = ~(holes[:-1, :-1] | holes[1:, :-1] | holes[:-1, 1:] | holes[1:, 1:]).ravel()
    surf = np.array([SURF_AC.get(int(k), "1GRASS") for k in idx[:-1, :-1].ravel()], object)
    groups = {}
    for pre in np.unique(surf[open_]):
        m = open_ & (surf == pre)
        groups[pre] = np.r_[np.c_[a[m], b[m], d[m]], np.c_[a[m], d[m], c[m]]]
    UV = np.c_[(P[:, 0] - x0) / TILE, (P[:, 1] - y0) / TILE]

    # looks: comic ground, the roads on top
    sp = TILE / TEX_PX
    col, row = np.meshgrid(np.arange(TEX_PX), np.arange(TEX_PX))
    wx, wy = x0 + (col + 0.5) * sp, y1 - (row + 0.5) * sp
    mats = groundcover.materials(frame, md, tx, ty, GC_PX_M)           # [j, i], j northwards
    mi = np.clip(((wx - x0) / GC_PX_M).astype(np.int64), 0, mats.shape[1] - 1)
    mj = np.clip(((wy - y0) / GC_PX_M).astype(np.int64), 0, mats.shape[0] - 1)
    pm = mats[mj, mi]
    img = np.zeros((TEX_PX, TEX_PX, 3), np.float32)
    for name in np.unique(pm):
        m = pm == name
        img[m] = _sample(_texture(os.path.join(gc_dir, f"{name}.png"), int(round(TERRAIN_UV_M / sp))), wx[m], wy[m],
                         TERRAIN_UV_M)
    # large-scale colour variation (groundcover.macro) on the ground, not on the roads: computed per 1 m, smoothed
    # onto the pixels
    nm = int(round(TILE / GC_PX_M))
    mx, my = np.meshgrid(x0 + (np.arange(nm) + 0.5) * GC_PX_M, y1 - (np.arange(nm) + 0.5) * GC_PX_M)   # row 0 = north
    f = groundcover.macro(mx, my)
    img *= np.stack([_to_px(f[..., k]) for k in range(3)], -1)
    # Rock faces: steep slopes (ROCK_SLOPE) as comic rock with horizontal layers by height (on the face they lie
    # across, like BeamNG.Earth's rockface.py in the distant view); before the roads, which stay on top
    tan = groundcover._box_blur(np.hypot(*np.gradient(keep["u"], CELL)), 2)   # (smoothed: the 2 m lidar frayed
    rw = np.clip((tan - ROCK_SLOPE[0]) / (ROCK_SLOPE[1] - ROCK_SLOPE[0]), 0.0, 1.0)  # the rock areas)
    if rw.max() > 0:
        w = _to_px(rw[::-1])                            # (grid: row 0 = south)
        m = w > 0
        zt = _to_px(keep["u"][::-1])[m]
        rock = _sample(_texture(os.path.join(gc_dir, "gc_rock.png"), int(round(TERRAIN_UV_M / sp))), wx[m], wy[m],
                       TERRAIN_UV_M)
        band = np.sin(2 * np.pi * zt / ROCK_BAND_M + 1.5 * groundcover._noise(wx[m], wy[m], 9.0, 61))
        rock *= (1.0 - 0.08 * w[m] * (1 - band))[:, None] * groundcover.macro(wx[m], wy[m])   # (layers strong only on
                                                                                            # the face itself)
        img[m] = img[m] * (1 - w[m][:, None]) + rock * w[m][:, None]
    # Streams and rivers (STREAMS): wet bank, water on top or a stone bed for dry ones; the roads go over them
    got = _streams(frame, md, tx, ty, 1.0 / sp) if md is not None else None
    if got is not None:
        segs, hw, hb, dry = got
        one, white = np.zeros(len(segs), np.uint8), np.array([(255.0, 255.0, 255.0, 1.0)], np.float32)
        for half, sel, rgb in ((hb, np.ones(len(segs), bool), STREAM_BANK), (hw, ~dry, STREAM_WATER),
                               (hw, dry, STREAM_DRY)):
            if not sel.any():
                continue
            a = fast._ef.paint_lines(np.zeros((TEX_PX, TEX_PX, 3), np.uint8), np.ascontiguousarray(segs[sel]),
                                     np.ascontiguousarray(half[sel]), one[sel], white)[..., 0]
            am = a > 0
            if not am.any():
                continue
            col = np.array(rgb, np.float32) * (1.0 + 0.06 * groundcover._noise(wx[am], wy[am], 1.5, 71))[:, None]
            w = (a[am] / 255.0)[:, None]
            img[am] = img[am] * (1 - w) + col * w
    if feats:
        ro = []
        got = surfacemod._road_segments(frame, x0, y0, TILE, TEX_PX, TEX_PX, feats, s.surface.urban, s.widths,
                                        roads_of=ro)
        if got is not None:
            segs, hws, kind = got
            look = _segment_looks(frame, x0, y0, feats, s.surface.urban, s.widths, kind, ro)
            for k, (name, (texname, rep, bright)) in enumerate(ROAD_LOOKS.items()):
                colors = np.array([(255.0, 255.0, 255.0, 1.0 if j == k else 0.0) for j in range(len(ROAD_LOOKS))],
                                  np.float32)
                alpha = fast._ef.paint_lines(np.zeros((TEX_PX, TEX_PX, 3), np.uint8), segs, hws, look, colors)[..., 0]
                if not alpha.any():
                    continue
                am = alpha > 0
                src = _texture(os.path.join(gc_dir, f"{texname}.png"), int(round(rep / sp)))
                road = _sample(src, wx[am], wy[am], rep) * bright
                if name in CALM:
                    road *= (1.0 + MOTTLE[1] * groundcover._noise(wx[am], wy[am], MOTTLE[0], 83))[:, None]
                if name in WEAR:
                    road = _wear(road, wx[am], wy[am], WEAR[name])
                w = (alpha[am] / 255.0)[:, None]
                img[am] = img[am] * (1 - w) + road * w
                if name == "dirt":      # grass strip between the wheel tracks
                    alpha = fast._ef.paint_lines(np.zeros((TEX_PX, TEX_PX, 3), np.uint8), segs, hws * TRACK_GRASS,
                                                 look, colors)[..., 0]
                    am = alpha > 0
                    grass = _sample(_texture(os.path.join(gc_dir, "gc_meadow.png"), int(round(TERRAIN_UV_M / sp))),
                                    wx[am], wy[am], TERRAIN_UV_M)
                    w = (alpha[am] / 255.0)[:, None] * 0.85
                    img[am] = img[am] * (1 - w) + grass * w
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(out_tex, quality=88)
    return P, UV, groups, out_tex
