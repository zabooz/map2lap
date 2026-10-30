"""Distant view: coarse terrain around the corridor up to RADIUS_M, so the world doesn't end at the corridor's edge
(without it Heiligenblut had no Grossglockner in the background).

The tiles come from BeamNG.Earth's distant terrain (farfield.build_tile): a quadtree of tiles of 256 m * 2^L, 32 cells
per edge, L0 = our detail tiles, heights with the Earth's curvature, a skirt hanging down at every edge (no gaps between
the levels and to the corridor). Unlike there (chosen by the player's position and swapped in game), the selection is
static here: a tile is split while it is closer to the corridor than K_FACTOR * K(L) * its edge (K: BeamNG.Earth's
table), and the corridor's L0 tiles stay out (the detail terrain lies there).

Colour:
- near (up to FADE_M[1] from the corridor): per GROUP_LEVEL square (2 km) a texture (TEX_PX) in the mean colours of our
  comic ground (groundcover.materials: WorldCover and land_use, plus lakes), steep slopes rock; between FADE_M[0] and
  FADE_M[1] blended into
- the colour table as there without aerial imagery: u = height, v = slope (mirrored around v = 0.5, so it doesn't
  matter which way round v is read), green, alpine meadow, rock, snow on top. So the transition has no edge, neither at
  the corridor's edge nor further out.

    part = farview.build(tiles_dir, obj_dir, log)     # obj_dir/parts/far.obj (not t_*: the measuring tools read those)
"""
import json
import os
from concurrent.futures import as_completed

import numpy as np
from PIL import Image

import make_obj             # (sets the path to the BeamNG.Earth server)
import groundcover
import parallel

import dem as demmod        # noqa: E402
import farfield             # noqa: E402
import geodesy              # noqa: E402
import heightmap            # noqa: E402
import mapdata              # noqa: E402
import netfetch             # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
RADIUS_M = 40000.0          # m around the detail tiles (Grossglockner from Heiligenblut: ~9 km; Carinthian peaks: 30-40 km)
GROUP_LEVEL = 3             # finer tiles per 2 km square in one object (fewer draw calls), one texture each
# BeamNG.Earth refines only around the player, here along the whole corridor edge: half as far (Heiligenblut,
# 13.5 km +-1 km: 910 instead of 1750 tiles, 1.2 instead of 2.4 million vertices)
K_FACTOR = 0.5
MATERIAL = "far"            # the colour table; the textured squares: ground_far_<i>_<j> (obj_to_kn5: like the terrain)
LAYOUT = farfield.V131      # 32 cells: L0 every 8 m, L1 16 m ... L6 512 m
FADE_M = (1200.0, 2400.0)   # m from the corridor: ground colours up to here, then the colour table (L2 tiles reach ~2.5 km)
TEX_PX = 512                # per 2 km square: 4 m per pixel
HEIGHT_GRID = 65            # height and slope grid per square (32 m), refined onto the pixels

# Colour table: (height m, RGB) like the comic ground textures (groundcover: meadow 96,158,66; forest 72,122,56; rock
# 142,140,134); low down between meadow and forest (forest and meadow can't be told apart from far away)
# (Hohe Tauern: tree line ~2000 m, alpine meadows up to ~2700 m, rock above, glaciers from ~3000 m). Darker and more
# saturated than the ground textures: in the evening sun rock and snow glowed yellowish white
LAND = ((0, (76, 128, 54)), (1700, (70, 120, 52)), (2100, (96, 128, 68)), (2600, (112, 122, 80)),
        (2900, (122, 120, 114)), (3150, (164, 166, 170)), (3350, (210, 214, 222)))
ROCK = (122, 120, 114)
WATER = (58, 118, 168)
# Slope (tan, at most 1: the colour table goes up to 45°) from ... to: transition to rock (40° ... 45°; the detail
# terrain: 40° ... 50°, ground.ROCK_SLOPE). From 29° on, half the alpine meadow at Heiligenblut was grey (median of the
# slopes above 2000 m: 29°)
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


def _init(cache_dir, tex_dir, core):
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


def _texture(lat0, lon0, gi, gj, path):
    """The texture of the square (GROUP_LEVEL, gi, gj) to path (JPG; worker process); returns messages."""
    S = farfield.level_size(GROUP_LEVEL)
    x0, y0 = gi * S, gj * S
    frame = geodesy.EnuFrame(lat0, lon0)
    n, k = TEX_PX, HEIGHT_GRID
    # height and slope (the way farfield.build_tile picks its colour), then the colour table
    g = np.arange(k) * S / (k - 1)
    zoom = farfield.zoom_for_level(LAYOUT, lat0, 1)
    elev, _ = parallel.retry_locked(lambda: heightmap.surface(frame, lambda la, lo: _w["dem"].sample(la, lo, zoom),
                                                              x0 + g, y0 + g))
    gy, gx = np.gradient(elev, y0 + g, x0 + g)
    slope = _up(np.clip(np.hypot(gx, gy), 0.0, 1.0), n)
    E = _up(elev, n)
    u = np.where((E <= 0.5) & (slope < 0.02), farfield.WATER_U, farfield.u_from_elev(E))
    v = 0.5 - 0.47 * slope
    pal = _w["pal"]
    far = pal[np.clip((v * pal.shape[0]).astype(np.int64), 0, pal.shape[0] - 1),
              np.clip((u * pal.shape[1]).astype(np.int64), 0, pal.shape[1] - 1)]
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
    for a in range(per):
        for b in range(per):
            tx, ty = gi * per + a, gj * per + b
            box = (tx * farfield.BASE, ty * farfield.BASE, (tx + 1) * farfield.BASE, (ty + 1) * farfield.BASE)
            if (tx, ty) in _w["core"] or not len(near) or _box_dist(box, near) >= FADE_M[1]:
                continue
            try:
                m = groundcover.materials(frame, _w["md"], tx, ty, farfield.BASE / tp, water="water")
            except Exception as e:      # (missing map data: the colour table stays there)
                msgs.append(f"Distant terrain colours, tile {tx},{ty}: {type(e).__name__}: {e}")
                continue
            col = np.zeros(m.shape + (3,), np.float32)
            for name in np.unique(m):
                col[m == name] = _w["colors"].get(name, _w["colors"]["gc_meadow"])
            r0, c0 = (per - 1 - b) * tp, a * tp
            ground[r0:r0 + tp, c0:c0 + tp] = col[::-1]
    rw = _rock_weight(slope)[..., None]
    ground = ground * (1 - rw) + np.array(ROCK, np.float32) * rw
    px = (np.arange(n) + 0.5) * S / n                   # large-scale colour variation like the detail terrain (seamless)
    ground *= groundcover.macro(*np.meshgrid(x0 + px, y0 + S - px))
    img = ground * w[..., None] + far * (1 - w[..., None])
    Image.fromarray(np.uint8(np.clip(img, 0, 255) + 0.5)).save(path, quality=90)
    return msgs


def build(tiles_dir, obj_dir, log=print, progress=None):
    """The distant view to obj_dir/parts/far.obj, its materials into track.mtl (written by make_obj.main), the colour
    table to textures/far.png and the textures of the near squares to textures/ground_far_<i>_<j>.jpg; returns the
    path of the part file."""
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
    textured = [key for key in groups if key[0] == GROUP_LEVEL and
                _box_dist((key[1] * S, key[2] * S, (key[1] + 1) * S, (key[2] + 1) * S), boxes) < FADE_M[1]]
    tex_dir = os.path.join(obj_dir, "textures")
    n = parallel.workers(len(tiles))
    log(f"Distant terrain: {len(tiles)} tiles up to {RADIUS_M / 1000:.0f} km, {len(textured)} coloured squares, "
        f"{n} processes ...")
    with parallel.pool(n, _init, (os.path.join(HERE, "cache"), tex_dir, sorted(core))) as ex:
        futs = [ex.submit(_tile, anc["lat"], anc["lon"], t.level, t.i, t.j, anc["dem_zoom"]) for t in tiles]
        texs = [ex.submit(_texture, anc["lat"], anc["lon"], i, j, os.path.join(tex_dir, f"ground_far_{i}_{j}.jpg"))
                for _, i, j in textured]
        for k, fut in enumerate(as_completed(futs + texs), 1):
            got = fut.result()
            if isinstance(got, list):
                for m in got:
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
    textured = set(textured)
    for key, parts in sorted(groups.items()):
        level, i, j = key
        P = np.concatenate([p for p, _, _ in parts])
        off = np.cumsum([0] + [len(p) for p, _, _ in parts[:-1]])
        T = np.concatenate([t + o for (_, _, t), o in zip(parts, off)])
        if key in textured:         # (UV like the detail terrain: v north, texture row 0 = north)
            obj.add(f"nocol_far_{level}_{i}_{j}", f"ground_far_{i}_{j}", P, (P[:, :2] - (i * S, j * S)) / S, T)
        else:
            obj.add(f"nocol_far_{level}_{i}_{j}", MATERIAL, P, np.concatenate([uv for _, uv, _ in parts]), T)
    obj.close()
    palette().save(os.path.join(tex_dir, "far.png"))
    with open(os.path.join(obj_dir, "track.mtl"), "a", encoding="utf-8") as f:
        f.write(f"newmtl {MATERIAL}\nKd 1 1 1\nmap_Kd textures/far.png\n\n")
        for _, i, j in sorted(textured):
            f.write(f"newmtl ground_far_{i}_{j}\nKd 1 1 1\nmap_Kd textures/ground_far_{i}_{j}.jpg\n\n")
    log(f"Distant terrain: {obj.objects} objects, {obj.nv:,} vertices")
    return path
