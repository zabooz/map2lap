"""Distant view: coarse terrain around the corridor up to RADIUS_M, so the world doesn't end at the corridor's edge
(the mountains on the horizon).

The tiles come from BeamNG.Earth's distant terrain (farfield.build_tile): a quadtree of tiles of 256 m * 2^L, 32 cells
per edge, L0 = our detail tiles, heights with the Earth's curvature, a skirt hanging down at every edge (no gaps between
the levels and to the corridor). Unlike there (chosen by the player's position and swapped in game), the selection is
static here: a tile is split while it is closer to the corridor than K_FACTOR * K(L) * its edge (K: BeamNG.Earth's
table), and the corridor's L0 tiles stay out (the detail terrain lies there).

Each square takes the mean comic ground colours for its WorldCover classes, with rock on steep slopes.
Near the corridor land_use and lakes refine the colours and fade into WorldCover between the FADE_M distances.
If a WorldCover read fails, near squares paint local polygons over the palette colours. Outer squares use the
height/slope palette with their original mesh UVs.

    part = farview.build(tiles_dir, obj_dir, log)     # obj_dir/parts/far.obj (not t_*: the measuring tools read those)
"""
import json
import os
from concurrent.futures import as_completed
from functools import partial

import numpy as np
from PIL import Image

from app.paths import ROOT
from track import make_obj, parallel      # (make_obj first: sets the path to the BeamNG.Earth server)
from scenery import dryness, groundcover

import dem as demmod        # noqa: E402
import farfield             # noqa: E402
import geodesy              # noqa: E402
import heightmap            # noqa: E402
import mapdata              # noqa: E402
import netfetch             # noqa: E402

RADIUS_M = 40000.0          # m around the detail tiles (a summit above a valley ~9 km off; peaks on the horizon 30-40 km)
GROUP_LEVEL = 3             # finer tiles per 2 km square in one object (fewer draw calls), one texture each
# BeamNG.Earth refines only around the player, here along the whole corridor edge: half as far (a 13.5 km route,
# +-1 km: 910 instead of 1750 tiles, 1.2 instead of 2.4 million vertices)
K_FACTOR = 0.5
MATERIAL = "far"            # fallback height/slope palette
LAYOUT = farfield.V131      # 32 cells: L0 every 8 m, L1 16 m ... L6 512 m
FADE_M = (1200.0, 2400.0)   # m from the corridor over which local map details fade into WorldCover
TEX_PX = 512                # per 2 km square: 4 m per pixel
TEX_FAR_PX = 256            # 8 m per pixel on a 2 km square, 128 m on a 32 km square
HEIGHT_GRID = 65            # height and slope samples per square edge, refined onto the pixels

# Fallback colours (height in m, RGB) where WorldCover is missing. The height bands fit only the Alps:
# in the Hohe Tauern the tree line is around 2000 m, with alpine meadows up to 2700 m and glaciers from 3000 m.
LAND = ((0, (76, 128, 54)), (1700, (70, 120, 52)), (2100, (96, 128, 68)), (2600, (112, 122, 80)),
        (2900, (122, 120, 114)), (3150, (164, 166, 170)), (3350, (210, 214, 222)))
ROCK = (122, 120, 114)
WATER = (58, 118, 168)
# Slope (tan, at most 1: the colour table goes up to 45°) from ... to: transition to rock (40° ... 45°; the detail
# terrain: 40° ... 50°, ground.ROCK_SLOPE); not lower: alpine meadows above 2000 m have a median slope of ~29°
STEEP = (0.84, 1.0)

_w = {}                     # per worker process: heights, map data, ground colours, corridor (_init)


def palette():
    """The colour table (farfield.PALETTE_W x PALETTE_H): u height (farfield.u_from_elev, water on the far left), v slope."""
    w, h = farfield.PALETTE_W, farfield.PALETTE_H
    elev = farfield.elev_from_u((np.arange(w) + 0.5) / w)
    base = np.stack([np.interp(elev, [e for e, _ in LAND], [c[k] for _, c in LAND]) for k in range(3)], -1)
    base[(np.arange(w) + 0.5) / w < 0.04] = WATER
    t = np.abs((np.arange(h) + 0.5) / h - 0.5) * 2                 # 0 flat (v = 0.5) ... 1 steep (edge)
    img = base[None] * (1 - _rock_weight(t)[:, None, None]) + np.array(ROCK, float) * _rock_weight(t)[:, None, None]
    return Image.fromarray(np.uint8(np.clip(img, 0, 255) + 0.5), "RGB")


def _rock_weight(slope):
    return np.clip((slope - STEEP[0]) / (STEEP[1] - STEEP[0]), 0.0, 1.0)


def _dist(x, y, boxes):
    """m from the points (x, y) to the nearest box (n, 4: x0 y0 x1 y1; 0 inside)."""
    if len(boxes) == 0:
        return np.full(np.shape(x), np.inf)
    x, y = np.asarray(x, float)[..., None], np.asarray(y, float)[..., None]
    dx = np.maximum(0.0, np.maximum(boxes[:, 0] - x, x - boxes[:, 2]))
    dy = np.maximum(0.0, np.maximum(boxes[:, 1] - y, y - boxes[:, 3]))
    return np.hypot(dx, dy).min(-1)


def select(core, radius=RADIUS_M):
    """The distant tiles (farfield.Tile) up to radius around the detail tiles core {(tx, ty)}: split while closer than
    K_FACTOR * K(L) * edge; without core's L0 tiles."""
    boxes = _boxes(core)
    region = (boxes[:, 0].min() - radius, boxes[:, 1].min() - radius,
              boxes[:, 2].max() + radius, boxes[:, 3].max() + radius)
    top = farfield.MAX_LEVEL
    s = farfield.level_size(top)
    stack = [farfield.Tile(top, i, j)
             for i in range(int(np.floor(region[0] / s)), int(np.floor(region[2] / s)) + 1)
             for j in range(int(np.floor(region[1] / s)), int(np.floor(region[3] / s)) + 1)]
    out = []
    while stack:
        t = stack.pop()
        if not farfield.overlaps(t.bbox, region):
            continue
        if t.level > 0 and _box_dist(t.bbox, boxes) < K_FACTOR * LAYOUT.k(t.level) * t.size:
            stack += [farfield.Tile(t.level - 1, 2 * t.i + a, 2 * t.j + b) for a in (0, 1) for b in (0, 1)]
        elif not (t.level == 0 and (t.i, t.j) in core):
            out.append(t)
    return out


def _boxes(core):
    c = np.array(sorted(core), float) * farfield.BASE
    return np.c_[c, c + farfield.BASE]


def _box_dist(bbox, boxes):
    x0, y0, x1, y1 = bbox
    return float(np.hypot(np.maximum(0.0, np.maximum(boxes[:, 0] - x1, x0 - boxes[:, 2])),
                          np.maximum(0.0, np.maximum(boxes[:, 1] - y1, y0 - boxes[:, 3]))).min())


def _init(cache_dir, tex_dir, core, tiles_dir=None):
    _w["dry"] = dryness.load(tiles_dir) if tiles_dir else None
    net = netfetch.Fetcher(offline=False)
    _w["dem"] = demmod.Dem(os.path.join(cache_dir, "dem"), fetcher=net)
    _w["md"] = mapdata.MapData(cache_dir, fetcher=net)
    _w["core"], _w["boxes"] = set(core), _boxes(core)
    _w["pal"] = np.asarray(palette(), np.float32)
    colors = {"water": np.array(WATER, np.float32)}         # mean colour per comic ground texture
    for name in os.listdir(tex_dir):
        if name.startswith("gc_") and name.endswith(".png"):
            colors[name[:-4]] = np.asarray(Image.open(os.path.join(tex_dir, name)).convert("RGB"), np.float32).mean((0, 1))
    _w["colors"] = colors
    _w["classes"] = _class_colours(colors)


def _class_colours(colors):
    """Map all uint8 class codes to the supplied mean ground colours. Pure."""
    classes = np.tile(np.asarray(colors[groundcover.DEFAULT], np.float32), (256, 1))
    for code, name in groundcover.CLASS_MAT.items():
        classes[code] = colors.get(name, colors[groundcover.DEFAULT])
    classes[80] = WATER
    return classes


def _overview_for_texel(metres):
    """Coarsest supported WorldCover overview at least as fine as a texel of metres. Pure."""
    # Nominal native pixels are 10 m. Each overview doubles their side length.
    return int(np.clip(np.floor(np.log2(metres / 10)), 0, 5))


def _tile(lat0, lon0, level, i, j, near_zoom):
    """(vertices ENU, UV of the colour table, triangles) of a distant tile (worker process). The skirts get their own
    top vertices: with shared ones the smoothed normals (obj_to_kn5) tipped sideways at every tile edge."""
    t = farfield.Tile(level, i, j)
    zoom = near_zoom if level <= 0 else farfield.zoom_for_level(LAYOUT, lat0, level)
    b = parallel.retry_locked(lambda: farfield.build_tile(geodesy.EnuFrame(lat0, lon0), _w["dem"], t, zoom,
                                                          with_sink=False, layout=LAYOUT))
    P, UV, T = b.positions + np.asarray(b.pos), b.uvs, b.tris
    ns, ng = (LAYOUT.cells + 1) ** 2, 2 * LAYOUT.cells ** 2      # grid vertices, grid triangles (then the skirts)
    sk = T[ng:]
    top = np.unique(sk[sk < ns])
    new = np.full(len(P), -1, np.int64)
    new[top] = len(P) + np.arange(len(top))
    sk = np.where(sk < ns, new[sk], sk)
    return (level, i, j, np.r_[P, P[top]].astype(np.float64), np.r_[UV, UV[top]].astype(np.float64),
            np.r_[T[:ng], sk].astype(np.int64))


def _up(a, n):
    """Grid a [j, i] (j north, vertices on the edges) bilinear onto n x n pixel centres, row 0 = north."""
    k = a.shape[0] - 1
    f = (np.arange(n) + 0.5) / n * k
    i0 = np.minimum(f.astype(np.int64), k - 1)
    t = f - i0
    rows = a[i0] * (1 - t)[:, None] + a[i0 + 1] * t[:, None]            # [pixel northwards, grid i]
    out = rows[:, i0] * (1 - t)[None, :] + rows[:, i0 + 1] * t[None, :]
    return out[::-1]


def _near_colours(frame, gi, gj, far, polygons_only, t=None):
    """Blend local map details into the north-up WorldCover colours of a near square."""
    S, n = farfield.level_size(GROUP_LEVEL), len(far)
    x0, y0 = gi * S, gj * S
    # share of the ground colours by the distance to the corridor (computed coarse, refined)
    c = np.arange(17) * S / 16
    near = _w["boxes"][(_w["boxes"][:, 2] > x0 - FADE_M[1]) & (_w["boxes"][:, 0] < x0 + S + FADE_M[1]) &
                       (_w["boxes"][:, 3] > y0 - FADE_M[1]) & (_w["boxes"][:, 1] < y0 + S + FADE_M[1])]
    X, Y = np.meshgrid(x0 + c, y0 + c)
    w = _up(np.clip((FADE_M[1] - _dist(X, Y, near)) / (FADE_M[1] - FADE_M[0]), 0.0, 1.0), n)
    # ground colours per detail tile (8 x 8 per square), only where they count
    per = int(round(S / farfield.BASE))
    tp = n // per
    ground = far.copy()
    msgs = []
    # The normal material lookup reads WorldCover again. During an outage the independent polygon
    # layers still supply the mapped details, in their usual paint order.
    layers = ((groundcover.landuse, groundcover.land) if polygons_only
              else (partial(groundcover.materials, water="water"),))
    for a in range(per):
        for b in range(per):
            tx, ty = gi * per + a, gj * per + b
            box = (tx * farfield.BASE, ty * farfield.BASE, (tx + 1) * farfield.BASE, (ty + 1) * farfield.BASE)
            if (tx, ty) in _w["core"] or not len(near) or _box_dist(box, near) >= FADE_M[1]:
                continue
            r0, c0 = (per - 1 - b) * tp, a * tp
            tile = ground[r0:r0 + tp, c0:c0 + tp][::-1]
            local_t = t[r0:r0 + tp, c0:c0 + tp][::-1] if t is not None else None
            for layer in layers:
                try:
                    m = layer(frame, _w["md"], tx, ty, farfield.BASE / tp)
                except Exception as e:
                    msgs.append(f"Distant terrain colours, tile {tx},{ty}: {type(e).__name__}: {e}")
                    continue
                if m is not None:
                    for name in np.unique(m):
                        if name:  # no mapped polygon here: keep the underlying colour
                            mask = m == name
                            rgb = _w["colors"].get(name, _w["colors"][groundcover.DEFAULT])
                            if local_t is not None and name in _w["dry"].shifts:
                                rgb = _w["dry"].tint(rgb, name, local_t[mask])
                            tile[mask] = rgb
    return ground * w[..., None] + far * (1 - w[..., None]), msgs


def _texture(lat0, lon0, level, i, j, near, path):
    """Write the square's north-up JPG. Return success and log messages to the build process."""
    S = farfield.level_size(level)
    n = TEX_PX if near else TEX_FAR_PX
    x0, y0 = i * S, j * S
    frame = geodesy.EnuFrame(lat0, lon0)
    px = (np.arange(n) + 0.5) * S / n
    x, y = np.meshgrid(x0 + px, y0 + S - px)
    lat, lon, _ = frame.enu_to_geodetic(x, y)
    lon += 360 * np.rint((lon0 - lon) / 360)    # keep the sampled window local across the date line
    overview = _overview_for_texel(S / n)
    bounds = (lon.min(), lat.min(), lon.max(), lat.max())
    msgs = []
    try:
        raster = parallel.retry_locked(lambda: _w["md"].rasters.worldcover_box(bounds, overview))
    except Exception as e:
        msgs.append(f"Distant terrain {level},{i},{j}: using far palette (WorldCover: {e})")
        if not near:
            return False, msgs
        raster = None
    codes = raster.sample(lon, lat) if raster is not None else np.zeros(lat.shape, np.uint8)

    g = np.linspace(0, S, HEIGHT_GRID)
    zoom = farfield.zoom_for_level(LAYOUT, lat0, 1 + level - GROUP_LEVEL)
    elev, _ = parallel.retry_locked(lambda: heightmap.surface(frame, lambda la, lo: _w["dem"].sample(la, lo, zoom),
                                                              x0 + g, y0 + g))
    gy, gx = np.gradient(elev, g, g)
    slope = _up(np.clip(np.hypot(gx, gy), 0, 1), n)
    colours = _w["classes"][codes]
    dry = _w.get("dry")
    t = dry.sample(x[0], y[:, :1]) if dry is not None else None
    if dry is not None:
        for code in (10, 20, 30):
            mask = codes == code
            if mask.any():
                colours[mask] = dry.tint(_w["classes"][code], groundcover.CLASS_MAT[code], t[mask])
    missing = codes == 0
    if missing.any():
        E = _up(elev, n)[missing]
        u = np.where((E <= 0.5) & (slope[missing] < 0.02), farfield.WATER_U, farfield.u_from_elev(E))
        pal = _w["pal"]      # flat row supplies base colours; rock is applied below
        colours[missing] = pal[len(pal) // 2, np.clip((u * pal.shape[1]).astype(int), 0, pal.shape[1] - 1)]
    if near:
        colours, details = _near_colours(frame, i, j, colours, polygons_only=raster is None, t=t)
        msgs.extend(details)
    rw = _rock_weight(slope)[..., None]
    img = (colours * (1 - rw) + np.asarray(ROCK) * rw) * groundcover.macro(x, y)
    Image.fromarray(np.uint8(np.clip(img, 0, 255) + 0.5)).save(path, quality=90)
    return True, msgs


def build(tiles_dir, obj_dir, log=print, progress=None):
    """Write far.obj, its square textures and materials under obj_dir. Return the part path."""
    with open(os.path.join(tiles_dir, "anchor.json"), encoding="utf-8") as f:
        anc = json.load(f)
    core = {tuple(t) for t in anc["tiles"]}
    tiles = select(core)
    boxes = _boxes(core)
    S = farfield.level_size(GROUP_LEVEL)
    groups = {}
    for t in tiles:
        sh = max(0, GROUP_LEVEL - t.level)
        groups.setdefault((max(t.level, GROUP_LEVEL), t.i >> sh, t.j >> sh), [])
    near = {key for key in groups if key[0] == GROUP_LEVEL and
            _box_dist((key[1] * S, key[2] * S, (key[1] + 1) * S, (key[2] + 1) * S), boxes) < FADE_M[1]}
    materials = {(level, i, j): (f"ground_far_{i}_{j}" if (level, i, j) in near else f"ground_far_{level}_{i}_{j}")
                 for level, i, j in groups}
    tex_dir = os.path.join(obj_dir, "textures")
    n = parallel.workers(len(tiles))
    log(f"Distant terrain: {len(tiles)} tiles up to {RADIUS_M / 1000:.0f} km, {len(materials)} coloured squares, "
        f"{n} processes ...")
    field_dir = tiles_dir if anc.get("ground_quality", "sd") == "sd" else None
    with parallel.pool(n, _init, (os.path.join(ROOT, "cache"), tex_dir, sorted(core), field_dir)) as ex:
        futs = [ex.submit(_tile, anc["lat"], anc["lon"], t.level, t.i, t.j, anc["dem_zoom"]) for t in tiles]
        texs = {ex.submit(_texture, anc["lat"], anc["lon"], *key, key in near, os.path.join(tex_dir, name + ".jpg")): key
                for key, name in materials.items()}
        for k, fut in enumerate(as_completed([*futs, *texs]), 1):
            got = fut.result()
            if fut in texs:
                ok, messages = got
                if not ok:
                    del materials[texs[fut]]
                for m in messages:
                    log(m)
            else:
                level, i, j, P, UV, T = got
                sh = max(0, GROUP_LEVEL - level)
                groups[(max(level, GROUP_LEVEL), i >> sh, j >> sh)].append((P, UV, T))
            if progress is not None:
                progress("distant", k, len(futs) + len(texs))
            if k == len(futs) + len(texs) or k % max(1, (len(futs) + len(texs)) // 10) == 0:
                log(f"Distant terrain: {k}/{len(futs) + len(texs)}")
    path = os.path.join(obj_dir, "parts", "far.obj")
    obj = make_obj.Obj(path, header=False)
    for key, parts in sorted(groups.items()):
        level, i, j = key
        P = np.concatenate([p for p, _, _ in parts])
        off = np.cumsum([0] + [len(p) for p, _, _ in parts[:-1]])
        T = np.concatenate([t + o for (_, _, t), o in zip(parts, off)])
        if key in materials:         # v north, texture row 0 = north
            S = farfield.level_size(level)
            obj.add(f"nocol_far_{level}_{i}_{j}", materials[key], P, (P[:, :2] - (i * S, j * S)) / S, T)
        else:
            obj.add(f"nocol_far_{level}_{i}_{j}", MATERIAL, P, np.concatenate([uv for _, uv, _ in parts]), T)
    obj.close()
    palette().save(os.path.join(tex_dir, "far.png"))
    with open(os.path.join(obj_dir, "track.mtl"), "a", encoding="utf-8") as f:
        f.write(f"newmtl {MATERIAL}\nKd 1 1 1\nmap_Kd textures/far.png\n\n")
        for key in sorted(materials):
            name = materials[key]
            f.write(f"newmtl {name}\nKd 1 1 1\nmap_Kd textures/{name}.jpg\n\n")
    log(f"Distant terrain: {obj.objects} objects, {obj.nv:,} vertices")
    return path
