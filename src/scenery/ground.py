"""Terrain of one tile like BeamNG.Earth's terrain block, for AC: one mesh for looks and physics,
with the roads painted into the terrain (BeamNG.Earth's default since 22.10.2026, roads.ROADS_IN_GROUND).

As in BeamNG.Earth:
- Heights: ground (blockworker.ground) levelled under the roads with grading.ROAD_LIFT (the physics the road mesh
  lies on there), raised over flat tunnel vaults (roads.block_arch_raise), holes at the tunnel portals
  (roads.block_tunnel_holes).
- Surface per terrain cell (surface.classify + surface.paint_roads + paint_lots): asphalt, cobbles, gravel, grass ...
  Here it decides the AC object name (1ROAD / 1GRAVEL / 1GRASS), so grip and sound.
- Looks: one texture per tile (TEX_PX): comic ground (groundcover) with the roads on top in BeamNG.Earth's road shapes
  and widths (surface._road_segments, earthfast.paint_lines; anti-aliased).

Unlike BeamNG.Earth: the mapped paths (PATHS), which it leaves out, are painted in under the roads.

Unlike BeamNG.Earth: visible terrain = physics terrain (there the visible terrain lies 4 cm lower because a road mesh
lies on top as well; here there is none, the asphalt is the terrain texture).
"""
import os

import numpy as np
from PIL import Image, ImageDraw

import blockworker
import acgrid
import fast
import grading as gradingmod
import mapgeom
import roadmesh
import roads as roadsmod
import surface as surfacemod

from scenery import groundcover, leisure, wallcut, water
from track import groundmaterial
from track.textures import ring_indices

CELL = acgrid.CELL              # shared with the marks' draping and the water's lowering grid
TILE = roadsmod.TILE            # 256 m
LATTICE = int(round(TILE / CELL)) + 1   # vertices per tile edge
# HD samples every ground/road/path layer twice as finely, including wear and transitions. Keeping the same
# guard fraction preserves UVs/physics; four times the texture memory is the cost (long tracks need more VRAM).
TEX_PX = 4096 if os.environ.get("BNE_GROUND_QUALITY", "sd") == "hd" else 2048
# AC and the Editor sample a tile's texture repeating (a kn5 material has no clamp): at UV 0 or 1 bilinear filtering mixes
# in the opposite edge, 256 m away, half and half on every mip level: a thin green line across a road at each tile edge.
# The tile is baked into TEX_PX - 2 * GUARD_PX pixels and its edge pixels repeated around it (phased, phased_uv): no
# memory, 3.1 % of the resolution (12.5 -> 12.9 cm). Protects through mip 5 (4 m per pixel, a pixel on the screen some
# hundreds of metres away), less where filtering looks across the edge; beyond, the mix comes back, far off. (Mip 6 mixes:
# both guards lie side by side in one 64 px gap, and a tile's edge, at a world pixel 1984 * tx, on a 64 px block's edge.)
# The texture lies at the world's phase (groundmaterial.UV_SCALE): a painted Save samples the same image as one more layer,
# with no copy of it (tracknative.build). The kn5 marks it on each ground material (groundmaterial.uv_props).
GUARD_PX = round(groundmaterial.UV_GUARD * TEX_PX)
GC_PX_M = 1.0                   # m per cell of the comic ground classes (groundcover), then scaled up to TEX_PX
TERRAIN_UV_M = 8.0              # m per repeat of the comic ground textures
# Road look -> (texture, m per repeat, brightness); painted in this order. Asphalt by road class (_look).
# Textures: the comic surfaces (roadtex.make_surfaces, in the texture folder; photos turn into mush at 12.5 cm per
# pixel). Brightness: the asphalt classes against each other.
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
# Streams, rivers, canals: in Overture often only a line (a mountain valley: ~190 streams, 16 rivers, 14 canals as
# lines, 2 river areas); water.py draws only the areas. Painted into the terrain texture here: class -> (half width of the
# water m, bank per side m); intermittent ones (is_intermittent) as a stone bed. Ditches not, like BeamNG.Earth's riverlines
STREAMS = {"stream": (0.8, 0.6), "river": (3.0, 1.2), "canal": (2.0, 0.5)}
STREAM_WATER, STREAM_BANK, STREAM_DRY = (66, 124, 172), (104, 98, 84), (156, 150, 138)
PITCH_LINE = (236, 236, 230)       # the pitches' chalk / paint
# Mapped paths (OpenStreetMap's footways, cycleways ...: Overture's road segments of these classes, which
# roads.road_specs leaves out): painted into the ground's surface and texture at their own width, under the roads, and
# nothing else: no grading, junctions, sidewalks, markings or furniture, so a path that meets or crosses a road changes
# nothing of it (a crossing over the carriageway is painted over by the road). Class -> (width m where the map gives
# none, paved where it gives no surface): a two-way cycle path's usual 2.5 m, a footway's 1.8 (two people side by
# side), a trail's 1.5, a bridleway's 2 (a horse and room to pass), a pedestrian street's 5. Steps are left out (a
# flight on a slope: no surface to paint).
PATHS = {"cycleway": (2.5, True), "footway": (1.8, True), "path": (1.5, False), "bridleway": (2.0, False),
         "pedestrian": (5.0, True)}
PATH_WIDTH_M = (0.5, 20.0)      # a mapped width outside this is no path's (a typo, an area's)
PATH_LOOK = {"paved": "service", "cobble": "cobble", "gravel": "gravel", "dirt": "dirt"}     # (ROAD_LOOKS)
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


def phased(img, tile):
    """img (N, N, 3) uint8, the whole tile (tx, ty), as a texture of the same size: the tile shrunk to N - 2 * GUARD_PX
    pixels, its edge pixels repeated GUARD_PX times around it, the whole rolled to the world's phase (textures.ring_indices:
    a column at a world pixel's column modulo N). Pure."""
    n = img.shape[0]
    inside = np.asarray(Image.fromarray(img).resize((n - 2 * GUARD_PX, n - 2 * GUARD_PX), Image.LANCZOS))
    xs, ys = ring_indices(n - 2 * GUARD_PX, n - 2 * GUARD_PX, tile, (n, n))
    return inside[ys[:, None], xs[None, :]]


def phased_uv(uv, tile):
    """uv (k, 2) over the whole tile (tx, ty) (0..1, v north) onto its phased texture: the world position in tiles times
    groundmaterial.UV_SCALE, the kn5 negating v. Pure."""
    return (np.asarray(tile, np.float64) + np.asarray(uv, np.float64)) * groundmaterial.UV_SCALE


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


def _open_segments(frame, x0, y1, opened):
    """(segs (m, 4) in pixels of the tile texture, half widths (m,) in pixels, look (m,) ROAD_LOOKS number) of the
    tunnels' open sections opened ([(lat (k,), lon (k,), Spec)], grading's open_tunnels), or None. They are roads on
    the ground that the map calls tunnels (an avalanche gallery's open side, an underpass in the open): the physics
    paints them as road (surface.paint_roads' extra), the texture has to as well, or grass flickers through the
    road mesh lying on it. Pure."""
    names, px = list(ROAD_LOOKS), TEX_PX / TILE
    segs, hws, look = [], [], []
    for la, lo, spec in opened:
        if spec is None or spec.kind not in surfacemod.PHOTO_ROAD_RGBA or len(la) < 2:
            continue
        e, n, _ = frame.geodetic_to_enu(np.asarray(la, np.float64), np.asarray(lo, np.float64), np.zeros(len(la)))
        c, r = (np.asarray(e) - x0) * px, (y1 - np.asarray(n)) * px
        segs.append(np.stack([c[:-1], r[:-1], c[1:], r[1:]], axis=1))
        hws.append(np.full(len(c) - 1, (spec.width / 2 + surfacemod.PHOTO_ROAD_EDGE_M) * px))
        look.append(np.full(len(c) - 1, names.index(_look(spec, None)), np.uint8))
    if not segs:
        return None
    return np.concatenate(segs), np.concatenate(hws), np.concatenate(look)


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


def _paths(frame, feats_list, box):
    """The mapped paths (PATHS) near box (x0, y0, x1, y1): [(xy (k, 2) in frame, half width m, surface kind, look)]
    of their on-ground pieces (no bridges, no tunnels)."""
    x0, y0, x1, y1 = box
    out, seen = [], set()
    for feats in feats_list:
        if feats is None or len(feats) == 0 or "class" not in feats.attrs:
            continue
        cls_, sub, osm = feats.attrs["class"], feats.attrs.get("subtype"), feats.attrs.get("osm_surface")
        for i in range(len(feats)):
            cls, fid = str(cls_[i]), str(feats.ids[i])
            if cls not in PATHS or fid in seen or (sub is not None and str(sub[i]) != "road") \
                    or roadsmod.unbuilt(feats, i):
                continue
            seen.add(fid)
            width, paved = PATHS[cls]
            w = roadsmod._rule_value(feats.rules.get("width"), i)
            w = float(w) if w is not None and PATH_WIDTH_M[0] <= float(w) <= PATH_WIDTH_M[1] else \
                roadsmod._osm(feats, "width", i, *PATH_WIDTH_M)
            width = w or width
            surf = roadsmod._rule_value(feats.rules.get("surface"), i)
            if surf is None and osm is not None and osm[i]:
                surf = str(osm[i])
            # (the class's own surface where the value is none or not understood: a street's or a track's)
            kind = roadsmod.surface_kind("unclassified" if paved else "track", surf)
            token = roadsmod.surface_token(surf) or ""
            look = "concrete" if kind == "paved" and token.startswith("concrete") else PATH_LOOK[kind]
            for ring in roadsmod.ground_parts(feats, i):
                e, n = mapgeom.enu_xy(feats, frame, ring)
                xy = np.c_[e, n]
                m = width / 2 + CELL
                if len(xy) < 2 or xy[:, 0].max() < x0 - m or xy[:, 0].min() > x1 + m or \
                        xy[:, 1].max() < y0 - m or xy[:, 1].min() > y1 + m:
                    continue
                out.append((xy, width / 2, kind, look))
    return out


def _paint_paths(idx, paths, x0, y0):
    """idx (surface per sample, [row northwards, col eastwards] from (x0, y0)) with the paths' materials
    (surface.ROAD_MATERIAL by kind): a sample is a path's when the centre of the square north-east of it, the square it
    gives its material to (surface.paint_roads), lies within the path's half width. Pure (a new array)."""
    out = np.array(idx, copy=True)
    for kind in surfacemod.ROAD_ORDER:
        sel = [(xy, hw) for xy, hw, k, _look in paths if k == kind]
        if not sel:
            continue
        segs = np.concatenate([np.c_[(xy[:-1] - (x0, y0)) / CELL - 0.5, (xy[1:] - (x0, y0)) / CELL - 0.5]
                               for xy, _ in sel])
        hws = np.concatenate([np.full(len(xy) - 1, hw / CELL) for xy, hw in sel])
        m = np.zeros(out.shape, bool)
        fast._ef.mask_segments(m, np.ascontiguousarray(segs, np.float64), np.ascontiguousarray(hws, np.float64))
        out[m] = surfacemod.ROAD_MATERIAL[kind]
    return out


def _paint_looks(img, segs, hws, look, wx, wy, sp, gc_dir, worn, paint=None):
    """img with the segments (m, 4) in pixels, half widths hws (pixels), look (ROAD_LOOKS number per segment)
    painted in, anti-aliased. worn: the roads' patches and cracks (WEAR) and a dirt track's grass strip."""
    white = np.array([(255.0, 255.0, 255.0, 1.0)], np.float32)
    for k, (name, (texname, rep, bright)) in enumerate(ROAD_LOOKS.items()):
        sel = look == k
        if not sel.any():
            continue
        one = np.zeros(int(sel.sum()), np.uint8)
        alpha = fast._ef.paint_lines(np.zeros((TEX_PX, TEX_PX, 3), np.uint8), segs[sel], hws[sel], one, white)[..., 0]
        if not alpha.any():
            continue
        am = alpha > 0
        src = _texture(os.path.join(gc_dir, f"{texname}.png"), int(round(rep / sp)))
        road = _sample(src, wx[am], wy[am], rep) * bright
        if name in CALM:
            road *= (1.0 + MOTTLE[1] * groundcover._noise(wx[am], wy[am], MOTTLE[0], 83))[:, None]
        if worn and name in WEAR:
            road = _wear(road, wx[am], wy[am], WEAR[name])
        w = (alpha[am] / 255.0)[:, None]
        img[am] = img[am] * (1 - w) + road * w
        if paint is not None:
            paint.layer(texname, alpha, repeat=rep, brightness=bright, road_class=name)
        if worn and name == "dirt":      # grass strip between the wheel tracks
            alpha = fast._ef.paint_lines(np.zeros((TEX_PX, TEX_PX, 3), np.uint8), segs[sel], hws[sel] * TRACK_GRASS,
                                         one, white)[..., 0]
            am = alpha > 0
            grass = _sample(_texture(os.path.join(gc_dir, "gc_meadow.png"), int(round(TERRAIN_UV_M / sp))),
                            wx[am], wy[am], TERRAIN_UV_M)
            w = (alpha[am] / 255.0)[:, None] * 0.85
            img[am] = img[am] * (1 - w) + grass * w
            if paint is not None:
                paint.layer("gc_meadow", np.rint(alpha * 0.85).astype(np.uint8), repeat=TERRAIN_UV_M)


def _wear(rgb, x, y, amount):
    """Patches (darker blotches) and sealed cracks (thin dark lines, only here and there), world-locked."""
    # (a first try with patches from 0.6 and cracks on 40 % of the area looked like lava)
    patch = groundcover._noise(x, y, 7.0, 31) > 0.7
    crack = (np.abs(groundcover._noise(x, y, 5.0, 37)) < 0.018) & (groundcover._noise(x, y, 31.0, 41) > 0.55)
    rgb = rgb.copy()
    rgb[patch] *= 1.0 - 0.12 * amount
    rgb[crack] *= 1.0 - 0.35 * amount
    return rgb


def kept_terrain_cells(holes):
    """Cells that keep their ground, from cell hole flags (n, n: a flag cuts the cell it is the south-west corner of).
    Pure.

    The tunnel kernel already flags whole cells after testing their corners. A cell went as soon as any corner was
    flagged: every cut a grid step wider to the west and south, the sky beside portals facing that way.
    """
    return ~holes[:-1, :-1]


def tunnel_roof_profile(half, height):
    """Positive lateral distances and heights of a tube's faceted vault. Pure."""
    sec = roadmesh._tunnel_section(half, height, height < roadmesh.TUNNEL_H - 0.05)
    vault = sec[2:-2]
    right = vault[vault[:, 0] >= -1e-9]
    order = np.argsort(right[:, 0])
    return right[order, 0], right[order, 1]


def tunnel_footprints(parts, heights=None, mouths=None):
    """Tubes and their aprons (roads.PORTAL_APRON_M past each portal, mouths {fid: (start, end)} as
    TunnelProfiles.mouths): lines, half widths, floors and vault heights. Pure."""
    valid = [p for p in parts if len(p[2]) >= 2 and np.isfinite(np.asarray(p[3])).all()]
    twins = roadsmod.twin_tunnels(valid)
    twinned = {k for i, j, _mid, _width in twins for k in (i, j)}
    footprints = []
    for i, (fid, spec, xy, z, _lon) in enumerate(valid):
        half = spec.width / 2 + (0.0 if i in twinned else roadmesh.TUNNEL_SHOULDER)
        height = (heights or {}).get(fid, roadmesh.TUNNEL_H)
        footprints.append((np.asarray(xy, np.float64)[:, :2], half,
                           np.asarray(z, np.float64), height, tunnel_roof_profile(half, height)))
    for i, _j, mid, width in twins:
        if len(mid) >= 2:
            half = width / 2 + roadmesh.TUNNEL_SHOULDER
            height = (heights or {}).get(valid[i][0], roadmesh.TUNNEL_H)
            footprints.append((np.asarray(mid[:, :2], np.float64), half,
                               np.asarray(mid[:, 2], np.float64), height, tunnel_roof_profile(half, height)))
    # The floor's apron past a portal, as roads._tunnel_chunks draws it: only where the part's end is a portal
    # (Griffen's west portal had none; guarded anyway, its cut cells stayed open over 4.2 m of the road in front).
    # Its width is the road slab's: an individual twin has no wall shoulder outside the shared tube.
    for fid, spec, xy, z, _lon in valid:
        xy = np.asarray(xy, np.float64)[:, :2]
        z = np.asarray(z, np.float64)
        for (at, nb), mouth in zip(((0, 1), (-1, -2)), (mouths or {}).get(fid, (True, True))):
            if not mouth:
                continue
            d = xy[at] - xy[nb]
            d /= max(float(np.hypot(*d)), 1e-9)
            footprints.append((np.array([xy[at], xy[at] + d * roadsmod.PORTAL_APRON_M]),
                               spec.width / 2,
                               np.array([z[at], z[at]]),
                               (heights or {}).get(fid, roadmesh.TUNNEL_H)))
    return footprints


def _footprint_segments(footprints):
    """Segment, squared half width, bounds, floor, vault, whether it is its line's first and last segment, and the
    line's index, of tube/apron footprints. Pure."""
    segments = []
    for k, footprint in enumerate(footprints):
        line, half = footprint[:2]
        floor = footprint[2] if len(footprint) >= 4 else None
        th = float(footprint[3]) if floor is not None else float("inf")
        roof = footprint[4] if len(footprint) >= 5 else None
        valid = [j for j in range(len(line) - 1) if float((line[j + 1] - line[j]) @ (line[j + 1] - line[j])) > 1e-12]
        for j in valid:
            a, d = line[j], line[j + 1] - line[j]
            lo, hi = np.minimum(a, line[j + 1]) - half, np.maximum(a, line[j + 1]) + half
            z0 = float(floor[j]) if floor is not None else float("nan")
            dz = float(floor[j + 1] - floor[j]) if floor is not None else 0.0
            segments.append((a, d, float(d @ d), half * half, lo, hi, z0, dz, th, roof,
                             (j == valid[0], j == valid[-1]), k))
    return segments


def _inside_footprint(q, segments, height=None):
    """Whether q lies over a tube/apron at height, or in plan if height is None: per footprint line its nearest segment,
    q past the line's ends outside. Pure. (Each segment for itself, the outside of a bend lay past one segment's end and
    before the next one's start: outside both, terrain patches stood in Griffen's tubes up to their vaults.)"""
    nearest = {}
    for seg in segments:
        a, d, length2 = seg[:3]
        along = float((q - a) @ d) / length2
        t = min(max(along, 0.0), 1.0)
        side = q - a - t * d
        dist2 = float(side @ side)
        if seg[11] not in nearest or dist2 < nearest[seg[11]][0]:
            nearest[seg[11]] = (dist2, along, t, seg)
    for dist2, along, t, seg in nearest.values():
        _a, _d, _l2, half2, _lo, _hi, z0, dz, th, roof, (first, last), _k = seg
        if dist2 >= half2 or (along < 0 and first) or (along > 1 and last):     # (on the wall's line: outside)
            continue
        if height is None or not np.isfinite(z0):
            return True
        floor = z0 + t * dz
        if roof is not None:
            radius, vault = roof
            if floor - 0.5 <= height <= floor + float(np.interp(np.sqrt(dist2), radius, vault)) + 0.05:
                return True
            continue
        # A separate road over a low underpass keeps its terrain. The cut applies to the road at the tunnel floor,
        # with half a metre for grade/lattice interpolation near the portal face.
        if floor - 0.5 <= height <= floor + th + 0.5:
            return True
    return False


def fill_tunnel_cut_edges(holes, u, x0, y0, square, footprints):
    """(vertices, triangles, owner cells) of ground outside tube footprints in
    omitted terrain cells; u is the cell-corner height grid. Pure.

    The tunnel wall cuts through a terrain cell, while its hole drops that whole
    cell. Quarter-metre patches close the outer sliver without bridging the tube.
    A finer grid matters at a slanted portal; a coarser one leaves visible sky.
    """
    empty_p = np.zeros((0, 3), np.float64)
    empty_t = np.zeros((0, 3), np.int64)
    empty_o = np.zeros(0, np.int64)
    if not footprints or not holes[:-1, :-1].any():
        return empty_p, empty_t, empty_o
    segments = _footprint_segments(footprints)
    steps = max(1, int(np.ceil(square / 0.25)))
    p, t, owner = [], [], []
    cells_w = holes.shape[1] - 1
    for iy, ix in np.argwhere(holes[:-1, :-1]):
        x, y = x0 + ix * square, y0 + iy * square
        cand = [seg for seg in segments if (seg[5] >= (x, y)).all() and
                (seg[4] <= (x + square, y + square)).all()]
        if not cand:
            # The low-arch margin can flag a square outside every physical
            # tube. It has no opening to protect, so its full terrain stays.
            a = len(p)
            p.extend(((x, y, u[iy, ix]), (x + square, y, u[iy, ix + 1]),
                      (x, y + square, u[iy + 1, ix]),
                      (x + square, y + square, u[iy + 1, ix + 1])))
            t.extend(((a, a + 1, a + 3), (a, a + 3, a + 2)))
            owner.extend((iy * cells_w + ix,) * 2)
            continue
        def inside(w, v):
            q = np.array([x + w * square, y + v * square])
            h = ((1 - v) * ((1 - w) * u[iy, ix] + w * u[iy, ix + 1]) +
                 v * ((1 - w) * u[iy + 1, ix] + w * u[iy + 1, ix + 1]))
            return _inside_footprint(q, cand, h)
        # a patch with its centre or a corner in the opening stays out: by its centre alone, a patch just over the
        # vault near the wall (which falls 1.6 m per metre there) put its corners through the tube's ceiling
        corner = np.array([[inside(col / steps, row / steps) for col in range(steps + 1)] for row in range(steps + 1)])
        accepted = [(row, col) for row in range(steps) for col in range(steps)
                    if not (corner[row:row + 2, col:col + 2].any() or inside((col + 0.5) / steps, (row + 0.5) / steps))]
        if not accepted:
            continue
        h00, h10 = u[iy, ix], u[iy, ix + 1]
        h01, h11 = u[iy + 1, ix], u[iy + 1, ix + 1]
        base = len(p)
        for row in range(steps + 1):
            v = row / steps
            for col in range(steps + 1):
                w = col / steps
                z = (1 - v) * ((1 - w) * h00 + w * h10) + v * ((1 - w) * h01 + w * h11)
                p.append((x + w * square, y + v * square, z))
        for row, col in accepted:
            a = base + row * (steps + 1) + col
            b, c, d = a + 1, a + steps + 1, a + steps + 2
            t.extend(((a, b, d), (a, d, c)))
            owner.extend((iy * cells_w + ix,) * 2)
    return (np.asarray(p, np.float64).reshape(-1, 3),
            np.asarray(t, np.int64).reshape(-1, 3), np.asarray(owner, np.int64))


def build(frame, aid, tx, ty, g, dem, zoom, depth, md, tex_src, gc_dir, out_tex, log=print, walls=(), paint=None):
    """Terrain of tile (tx, ty): (ENU vertices, UV, triangles by AC prefix,
    texture file). Vertices start with the lattice, then wall cuts and tunnel
    edge patches. depth (n, n) lowers water; walls are cut lines. Writes the
    texture file and retained paint."""
    s = blockworker._s
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    n = int(round((x1 - x0) / CELL)) + 1
    gx, gy = np.meshgrid(x0 + np.arange(n) * CELL, y0 + np.arange(n) * CELL)
    la, lo, _ = frame.enu_to_geodetic(gx.ravel(), gy.ravel(), 0.0)
    la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)

    def elev(la_, lo_):          # (levelled with ROAD_LIFT, the physics)
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
        if g is not None and (depth > 0.0).any():
            wet = depth.ravel() > 0.0
            depth = water.off_roads(depth, gx, gy, g.plans(la[wet], lo[wet]), CELL)
        z = z - depth.ravel()
    u = np.asarray(frame.geodetic_to_enu(la, lo, z)[2], np.float64)
    if md is not None and g is not None:
        try:
            bridges = blockworker._bridges(aid, frame, elev)
            bridges.plans_at = lambda xy: g.plans(*map(np.asarray, frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)[:2]))
            bridges.cs.set_road_end(gradingmod.road_end_reader(g))
            cells = [cell_fn(k) for k in roadsmod.cells_of_tile(frame, tx, ty)]
            if tun is not None:
                u = roadsmod.portal_ground(np.c_[gx.ravel(), gy.ravel()], u,
                    tun.parts(cells, (x0, y0, x1, y1)), getattr(tun, 'mouths', None))
            decks = [(np.asarray(xy, np.float64)[:, :2], np.asarray(zd, np.float64), spec.width / 2)
                     for _f, spec, xy, zd, _l in bridges.parts(cells, (x0, y0, x1, y1))
                     if np.isfinite(zd).all()]
            # A junction deck needs the same unobstructed surface as a single bridge. Keep terrain
            # with room for another road above it; a near-deck overlap has no such headroom.
            u = roadsmod.under_deck_ground(np.c_[gx.ravel(), gy.ravel()], u, decks,
                                           [bridges.deck_bank(xy, zd) for xy, zd, _h in decks],
                                           max_drop=roadsmod.LIDAR_HEADROOM_M)
        except Exception as e:  # (rather the ground as graded than no tile)
            log(f"Ground {tx},{ty}: under decks: {type(e).__name__}: {e}")
    P = np.c_[gx.ravel(), gy.ravel(), u]
    keep = {"lat": la.reshape(n, n), "lon": lo.reshape(n, n), "u": u.reshape(n, n)}

    holes = np.zeros((n, n), bool)
    tunnel_parts = []
    if tun is not None:
        try:
            h, tunnel_parts = roadsmod.block_tunnel_holes(tun, cell_fn, frame, keep, cx, cy, CELL, with_parts=True)
            if h is not None:
                holes = np.asarray(h, bool)
        except Exception as e:
            log(f"Ground {tx},{ty}: tunnel holes: {type(e).__name__}: {e}")

    # surface per sample like BeamNG.Earth's terrain block (land use, slope -> rock, roads, car parks)
    idx = np.full((n, n), surfacemod.GRASS, np.int64)
    feats, paths, opened = [], [], []
    if s.surface is not None:
        classes, _ = s.surface.classes(keep["lat"], keep["lon"])
        idx = surfacemod.classify(classes, keep["u"], CELL, keep["lat"], keep["lon"])
        feats, _ = s.surface.roads(keep["lat"], keep["lon"])
        paths = _paths(frame, feats, (x0, y0, x1, y1))
        if paths:                                           # (under the roads)
            idx = _paint_paths(idx, paths, x0, y0)
        if feats:
            opened = blockworker._open_tunnels(g, keep)
            idx = surfacemod.paint_roads(idx, keep["lat"], keep["lon"], feats, CELL, s.surface.urban, s.widths,
                                         opened)
        if hasattr(s.surface, "lots"):
            idx = surfacemod.paint_lots(idx, keep["lat"], keep["lon"], s.surface.lots(keep["lat"], keep["lon"]))
        if getattr(s.surface, "gas_pads", False):          # gas station forecourts (make_obj._init_scenery)
            idx = surfacemod.paint_pads(idx, keep["lat"], keep["lon"], s.surface.fuel_pads(keep["lat"], keep["lon"]))
    idx = np.asarray(idx)

    # triangles per cell (split SW to NE), without cells at the portal hole; surface: the SW sample
    i, j = np.meshgrid(np.arange(n - 1), np.arange(n - 1))
    a = (j * n + i).ravel()
    b, c, d = a + 1, a + n, a + n + 1
    footprints = tunnel_footprints(tunnel_parts, getattr(tun, "heights", None), getattr(tun, "mouths", None))
    open_ = kept_terrain_cells(holes).ravel()
    surf = np.array([SURF_AC.get(int(k), "1GRASS") for k in idx[:-1, :-1].ravel()], object)
    # (the cells along a wall between two roads apart: a step at its face, not the lattice's ramp in front of it)
    along = wallcut.cut(keep["u"], x0, y0, CELL, walls, open_)
    drawn = open_.copy()
    drawn[along.cells] = False
    groups = {}
    for pre in np.unique(surf[open_]):
        m = drawn & (surf == pre)
        groups[pre] = np.r_[np.c_[a[m], b[m], d[m]], np.c_[a[m], d[m], c[m]], along.T[surf[along.cells[along.owner]] == pre]]
    P = np.r_[np.c_[P[:, :2], along.u.ravel()], along.P]
    cut_cells = np.zeros_like(holes)
    cut_cells[:-1, :-1] = ~open_.reshape(n - 1, n - 1)
    edge_p, edge_t, edge_owner = fill_tunnel_cut_edges(cut_cells, keep["u"], x0, y0, CELL, footprints)
    if len(edge_t):
        edge_t += len(P)
        P = np.r_[P, edge_p]
        for pre in np.unique(surf[edge_owner]):
            extra = edge_t[surf[edge_owner] == pre]
            groups[pre] = np.r_[groups.get(pre, np.zeros((0, 3), np.int64)), extra]
    UV = phased_uv(np.c_[(P[:, 0] - x0) / TILE,
                          (P[:, 1] - y0 + np.r_[np.zeros(n * n), along.lift, np.zeros(len(edge_p))]) / TILE], (tx, ty))

    # looks: comic ground, the roads on top
    sp = TILE / TEX_PX
    col, row = np.meshgrid(np.arange(TEX_PX), np.arange(TEX_PX))
    wx, wy = x0 + (col + 0.5) * sp, y1 - (row + 0.5) * sp
    mats = groundcover.materials(frame, md, tx, ty, GC_PX_M, record=paint) if paint is not None else groundcover.materials(frame, md, tx, ty, GC_PX_M)
    mi = np.clip(((wx - x0) / GC_PX_M).astype(np.int64), 0, mats.shape[1] - 1)
    mj = np.clip(((wy - y0) / GC_PX_M).astype(np.int64), 0, mats.shape[0] - 1)
    names, ids = np.unique(mats, return_inverse=True)        # (numbers: comparing names per pixel took 40 % of a tile)
    pm = ids.reshape(mats.shape)[mj, mi]
    if paint is not None:
        paint.base(names, ids.reshape(mats.shape)[::-1])
        paint.roads(frame, feats, getattr(s.surface, "urban", None), getattr(s, "widths", None))
    img = np.zeros((TEX_PX, TEX_PX, 3), np.float32)
    for k, name in enumerate(names):
        m = pm == k
        if not m.any():
            continue
        img[m] = _sample(_texture(os.path.join(gc_dir, f"{name}.png"), int(round(TERRAIN_UV_M / sp))), wx[m], wy[m],
                         TERRAIN_UV_M)
    # large-scale colour variation (groundcover.macro) on the ground, not on the roads: computed per 1 m, smoothed
    # onto the pixels
    nm = int(round(TILE / GC_PX_M))
    mx, my = np.meshgrid(x0 + (np.arange(nm) + 0.5) * GC_PX_M, y1 - (np.arange(nm) + 0.5) * GC_PX_M)   # row 0 = north
    f = groundcover.macro(mx, my)
    img *= np.stack([_to_px(f[..., k]) for k in range(3)], -1)
    # Rock faces before the roads: smooth slope over the same 4 m reach on either grid (raw lidar frays the rock areas).
    tan = groundcover._box_blur(np.hypot(*np.gradient(keep["u"], CELL)), round(4.0 / CELL))
    rw = np.clip((tan - ROCK_SLOPE[0]) / (ROCK_SLOPE[1] - ROCK_SLOPE[0]), 0.0, 1.0)
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
        if paint is not None:
            paint.layer("gc_rock", np.rint(w * 255).astype(np.uint8), repeat=TERRAIN_UV_M)
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
            if rgb is STREAM_WATER:     # the comic water's texture, world-locked like the water mesh's
                col = _sample(_texture(os.path.join(gc_dir, "water.png"), int(round(water.UV_M / sp))), wx[am],
                              wy[am], water.UV_M)
            else:
                col = np.array(rgb, np.float32) * (1.0 + 0.06 * groundcover._noise(wx[am], wy[am], 1.5, 71))[:, None]
            w = (a[am] / 255.0)[:, None]
            img[am] = img[am] * (1 - w) + col * w
            if paint is not None:
                paint.layer("water" if rgb is STREAM_WATER else "stream_bank" if rgb is STREAM_BANK else "stream_bed", a)
    got = leisure.marks(frame, md, tx, ty) if md is not None else None
    if got is not None:         # the pitches' white lines (leisure.pitch_layout), under the paths and roads
        segs, hw = got
        px = 1.0 / sp
        segs = np.c_[(segs[:, 0] - x0) * px, (y1 - segs[:, 1]) * px, (segs[:, 2] - x0) * px, (y1 - segs[:, 3]) * px]
        a = fast._ef.paint_lines(np.zeros((TEX_PX, TEX_PX, 3), np.uint8), np.ascontiguousarray(segs, np.float64),
                                 np.ascontiguousarray(hw * px, np.float64), np.zeros(len(segs), np.uint8),
                                 np.array([(255.0, 255.0, 255.0, 1.0)], np.float32))[..., 0]
        am = a > 0
        if am.any():
            w = (a[am] / 255.0)[:, None]
            img[am] = img[am] * (1 - w) + np.array(PITCH_LINE, np.float32) * w
            if paint is not None:
                paint.layer("pitch_line", a)
    pads = s.surface.fuel_pads(la, lo) if getattr(s.surface, "gas_pads", False) else []
    if pads:                    # gas station forecourts (make_obj._init_scenery): service asphalt, under the roads
        mask = Image.new("L", (TEX_PX, TEX_PX), 0)
        draw = ImageDraw.Draw(mask)
        for pla, plo in pads:
            e, nn, _ = frame.geodetic_to_enu(np.asarray(pla), np.asarray(plo), np.zeros(len(pla)))
            draw.polygon(list(zip(((np.asarray(e) - x0) / sp).tolist(), ((y1 - np.asarray(nn)) / sp).tolist())),
                         fill=255)
        am = np.asarray(mask) > 0
        if am.any():
            texname, rep, bright = ROAD_LOOKS["service"]
            img[am] = _sample(_texture(os.path.join(gc_dir, f"{texname}.png"), int(round(rep / sp))), wx[am], wy[am],
                              rep) * bright
            if paint is not None:
                paint.layer(texname, np.asarray(mask), repeat=rep, brightness=bright, road_class="service")
    if paths:                   # the mapped paths, under the roads
        names = list(ROAD_LOOKS)
        px = 1.0 / sp
        segs = np.concatenate([np.c_[(xy[:-1, 0] - x0) * px, (y1 - xy[:-1, 1]) * px, (xy[1:, 0] - x0) * px,
                                     (y1 - xy[1:, 1]) * px] for xy, *_ in paths])
        hws = np.concatenate([np.full(len(xy) - 1, hw * px) for xy, hw, *_ in paths])
        look = np.concatenate([np.full(len(xy) - 1, names.index(lk), np.uint8) for xy, _hw, _k, lk in paths])
        _paint_looks(img, np.ascontiguousarray(segs, np.float64), np.ascontiguousarray(hws, np.float64), look, wx, wy,
                     sp, gc_dir, worn=False, paint=paint)
    if feats:
        ro = []
        got = surfacemod._road_segments(frame, x0, y0, TILE, TEX_PX, TEX_PX, feats, s.surface.urban, s.widths,
                                        roads_of=ro)
        if got is not None:
            segs, hws, kind = got
            got = (segs, hws, _segment_looks(frame, x0, y0, feats, s.surface.urban, s.widths, kind, ro))
        more = _open_segments(frame, x0, y1, opened)
        if more is not None:
            got = more if got is None else tuple(np.concatenate([a, b]) for a, b in zip(got, more))
        if got is not None:
            segs, hws, look = got
            _paint_looks(img, np.ascontiguousarray(segs, np.float64), np.ascontiguousarray(hws, np.float64),
                         np.ascontiguousarray(look, np.uint8), wx, wy, sp, gc_dir, worn=True, paint=paint)
    Image.fromarray(phased(np.clip(img, 0, 255).astype(np.uint8), (tx, ty))).save(out_tex, quality=88)
    return P, UV, groups, out_tex
