"""Far buildings, street lamps, the skyline."""
import os
import math

import numpy as np

import mapgeom
import staging


def coverage(items, tile=256.0):
    """The share of the tile (a square of side tile m: roads.tile_side) covered by building footprints."""
    return sum(_area2(s.ring) / 2 for s, _, _ in items if (s.min_h or 0) <= 0.5) / (tile * tile)


def centres(items, tx, ty):
    """The anchor-frame (x, y) centres of a road tile's buildings (road_tile_items' rings are tile-local)."""
    import roads
    x0, y0, _, _ = roads.tile_bbox(tx, ty)
    return [(float(s.ring[:, 0].mean() + x0), float(s.ring[:, 1].mean() + y0)) for s, _, _ in items]


def road_tile(frame, tx, ty, md, ground, lines=None, props=None, items=None):
    """The buildings of road tile (tx, ty) (roads.TILE squares of the anchor frame): (mesh, collider boxes) or
    None. md: mapdata.MapData; ground(lat, lon): the physics ground without the road lift. lines (the road
    centrelines, roads.build_tile) and props (its prop rows): the houses' front doors are added to props.
    items: road_tile_items' result when the caller has it."""
    import roads
    x0, y0, x1, y1 = roads.tile_bbox(tx, ty)
    if items is None:
        items = road_tile_items(frame, tx, ty, md, ground)
    if props is not None and lines:
        props.extend(doors(items, lines, x0, y0))
    meshes = build_parts(items, with_lod=True)
    if not meshes:
        return None
    return meshes, collider_boxes(items, x0, y0), collision_mesh(items)


FAR_LAYERS = ("buildings", "building_parts", "infrastructure", "roads", "water")


def far_items(frame, tile, ty, md, ground, lamp_region=None):
    """The far (lite) buildings of road tile (tile, ty) (an anchor tile, or a geotile: tile a geotiles.GeoBox, ty None:
    its own buildings, those the road geotile of the same key holds) in frame: (items, lamps [[x, y, z], ...] of its
    streets in frame, the tile's box)."""
    import roads
    box = roads.tile_bbox(tile, ty)
    x0, y0, x1, y1 = box
    own = box if hasattr(box, "owns") else None
    keys = roads.cells_of_tile(frame, tile, ty, margin=0.0)
    cds = [md.cell(k, layers=FAR_LAYERS, kind="demand") for k in keys]
    items = tile_buildings(frame, x0, y0, x1, y1, [c.layers.get("buildings") for c in cds], ground, own=own,
                           uses=use_data(frame, md, keys, x0, y0), worship=worship_boxes(frame, md, keys, x0, y0),
                           castles=castle_boxes(frame, md, keys, x0, y0),
                           part_layers=[c.layers.get("building_parts") for c in cds],
                           west_town=district_town(frame, tile, ty, md),
                           garages_xy=garage_rings(frame, [c.layers.get("infrastructure") for c in cds], x0, y0),
                           supports=support_rings(frame, [c.layers.get("infrastructure") for c in cds], x0, y0),
                           bridges_xy=bridge_lines(frame, [c.layers.get("roads") for c in cds], x0, y0),
                           water_xy=water_rings(frame, [c.layers.get("water") for c in cds], x0, y0),
                           ml_roads_xy=road_lines(frame, [c.layers.get("roads") for c in cds], x0, y0),
                           ways_xy=way_lines(frame, [c.layers.get("roads") for c in cds], x0, y0, size=x1 - x0))
    size = max(x1 - x0, y1 - y0)
    lamps = far_lamps(frame, [c.layers.get("roads") for c in cds], x0, y0, size,
                      built_squares(items, 0.0, 0.0, size), ground, lamp_region, own=own)
    return items, lamps, box


def far_tile(frame, tx, ty, md, ground, out_dir, vfs_dir, aid, lamp_region=None):
    """A far (render-only) building tile written to the session folder: (vfs path of its JSON, building
    count) or None. The lite mesh of the same buildings as road_tile's."""
    import json
    import os
    items, lamps, (x0, y0, _x1, _y1) = far_items(frame, tx, ty, md, ground, lamp_region)
    mesh = build(items, lite=True)
    data = {"v": 1}
    if lamps:
        data["lamps"] = lamps
    if mesh is not None:
        shape = f"bldfar_{aid}_{tx}_{ty}.cdae"
        write(os.path.join(out_dir, shape), mesh)
        data["shape"] = f"{vfs_dir}/{shape}"
        data["pos"] = [x0, y0, 0.0]
    name = f"bldfar_{aid}_{tx}_{ty}.json"
    path = os.path.join(out_dir, name)
    tmp = staging.tmp_for(path)
    with open(tmp, "w") as f:
        f.write(json.dumps(data))       # (json.dump to a file: the pure-Python encoder)
    staging.replace(tmp, path)
    return f"{vfs_dir}/{name}", len(items)


# ------------------------------------------------------------------------------------------- far street lamps
# The street lamps past the road tiles ("extend the street and window lights as far as the
# buildings render"): the far and skyline tiles carry their streets' lamps as glow points (trees.lua's lampglow group,
# night only), placed along the mapped roads by furniture.py's spacing: the town streets in built-up squares (at least
# FAR_LAMP_MIN_BLD buildings in its 256 m square: the near rule's land cover is not at hand here), the highways there
# and every ramp. FAR_LAMP_Z over the ground, over the carriageway's edge.
FAR_LAMP_MIN_BLD = 8
FAR_LAMP_Z = 8.0
FAR_LAMP_MAX = 4000         # a tile's most (the skyline's 1 km squares: a dense city's ~3000)


def built_squares(items, x0, y0, size, sq=256.0):
    """The set of (i, j) 256 m squares of a tile (x0, y0 its corner; items' rings tile-relative) holding at least
    FAR_LAMP_MIN_BLD buildings."""
    import collections
    n = collections.Counter()
    for spec, _gmin, _gmax in items:
        c = np.asarray(spec.ring, np.float64)[:, :2].mean(0)
        n[(int(c[0] // sq), int(c[1] // sq))] += 1
    return {k for k, v in n.items() if v >= FAR_LAMP_MIN_BLD}


def far_lamps(frame, road_layers, x0, y0, size, built, ground, region=None, sq=256.0, own=None):
    """The lamps of a far tile's streets: [x, y, z] in frame (rounded; z the frame's up at FAR_LAMP_Z over the ground),
    at most FAR_LAMP_MAX. built: the tile's built-up 256 m squares (built_squares); ground(lat, lon) the ground
    (arrays); region: furniture.lamp_region's (the spacing); own: a geotile's box (geotiles.OwnedBox): only its own
    lamps (each in one tile)."""
    import furniture
    import roads as roadsmod
    import fast
    if not built:
        return []
    table = furniture.lamp_spacing(region)
    hw = "na" if furniture._na(region) else None
    pts, off, spacing, phase, side, lit_any = [], [0], [], [], [], []
    for f in road_layers:
        if f is None or len(f.kind) == 0:
            continue
        specs = roadsmod.road_specs(f)
        bb = f.boxes(frame)
        near = np.flatnonzero((bb[:, 2] - x0 >= -20) & (bb[:, 0] - x0 <= size + 20)
                              & (bb[:, 3] - y0 >= -20) & (bb[:, 1] - y0 <= size + 20))
        for i in near.tolist():
            sp = specs[i]
            if sp is None:
                continue
            highway = sp.cls in furniture.HIGHWAY_CLASSES
            if highway and not furniture.highway_lit(region, sp.link, True):
                continue
            if highway:
                every = (furniture.LINK_LAMP_SPACING if sp.link else furniture.HIGHWAY_LAMP_SPACING)[hw]
                rules = [(every, -float(sp.dir) if sp.dir else (1.0 if furniture._h01(str(f.ids[i]), "pside") < 0.5
                                                               else -1.0), 0.0)]
            elif sp.cls in table:
                every, both = table[sp.cls]
                sd = 1.0 if furniture._h01(str(f.ids[i]), "side") < 0.5 else -1.0
                rules = [(every, sd, 0.0)] + ([(every, -sd, every / 2)] if both else [])
            else:
                continue
            ph0 = furniture._h01(str(f.ids[i]), "pphase")
            reach = max(1.0, sp.width / 2 - 1.0)
            parts = roadsmod.ground_parts(f, i) if roadsmod.level_ranges(f, i) else [None]
            for part in parts:
                if part is None:
                    a = f.coord_off[f.ring_off[f.part_off[i]]]
                    b = f.coord_off[f.ring_off[f.part_off[i + 1]]]
                    part = f.lonlat[a:b]
                if len(part) < 2:
                    continue
                e, n = mapgeom.enu_xy(f, frame, np.asarray(part, np.float64))
                xy = np.stack([np.asarray(e, np.float64), np.asarray(n, np.float64)], 1)
                for every, sd, shift in rules:
                    pts.append(xy)
                    off.append(off[-1] + len(xy))
                    spacing.append(every)
                    phase.append(ph0 * every + shift)
                    side.append(sd * reach)
                    lit_any.append(bool(highway and sp.link))
    if not pts:
        return []
    fast.require(87, "lamp_stations")
    st = fast._ef.lamp_stations(np.ascontiguousarray(np.concatenate(pts)), np.asarray(off, np.int64),
                                np.asarray(spacing, np.float64), np.asarray(phase, np.float64),
                                np.asarray(side, np.float64), [x0, y0, x0 + size, y0 + size])
    if not len(st):
        return []
    keep = [k for k in range(len(st)) if lit_any[int(st[k, 2])]
            or (int((st[k, 0] - x0) // sq), int((st[k, 1] - y0) // sq)) in built]
    st = st[keep]
    if own is not None and len(st):
        st = st[np.asarray(own.owns(st[:, 0], st[:, 1]), bool)]
    st = st[:FAR_LAMP_MAX]
    if not len(st):
        return []
    lat, lon, _ = frame.enu_to_geodetic(st[:, 0], st[:, 1], 0.0)
    lat, lon = np.asarray(lat, np.float64), np.asarray(lon, np.float64)
    h = np.asarray(ground(lat, lon), np.float64) + FAR_LAMP_Z
    z = np.asarray(frame.geodetic_to_enu(lat, lon, h)[2], np.float64)     # (the frame's up: the Earth's curvature)
    return np.round(np.c_[st[:, 0], st[:, 1], z], 1).tolist()


# ------------------------------------------------------------------------------------------- the skyline
SKY_SEND_M = float(os.environ.get("BNE_SKY_SEND_M", "4800"))
SKY_DROP_M = SKY_SEND_M + 800.0
SKY_PER_POSE = 2
SKY_MIN_AREA_M2 = 40.0      # (sheds left out)
SKY_BOX_AREA_M2 = 600.0     # a footprint smaller than this is drawn as its oriented box
SKY_MAX_CORNERS = 12        # a larger one with more corners: every k-th kept
# The mean colour of each building material's base texture (tools: a 64 x 64 resize of each material's
# baseColorMap from the game's content zips): a skyline building is drawn in its facade's and its roof's
# mean colour times their tints (MARBLE, nearly white, sampled at one texel: the vertex colour is the colour)
MAT_MEAN = {"bne_bld_facade": (0.679, 0.676, 0.683), "bne_bld_shop": (0.669, 0.691, 0.699),
            "bne_bld_office": (0.47, 0.493, 0.492), "bne_bld_roof_flat": (0.432, 0.431, 0.43),
            "bne_bld_roof_slate": (0.359, 0.36, 0.388), "bne_bld_roof_shingle": (0.585, 0.577, 0.571),
            "bne_bld_siding": (0.822, 0.822, 0.822), "bne_bld_stucco": (0.795, 0.795, 0.795),
            "bne_bld_roof_metal": (0.642, 0.642, 0.642), "bne_bld_panel": (0.815, 0.815, 0.814),
            "bne_bld_metalwall": (0.841, 0.841, 0.841), "bne_bld_stone": (0.83, 0.818, 0.803),
            "bne_bld_marble": (0.978, 0.978, 0.978), "bne_bld_brick": (0.717, 0.569, 0.513)}
SKY_UV = (0.5, 0.5)
# the skyline walls' windows (tools/build_sky_windows.py: SKY_WIN_BAYS x SKY_WIN_FLOORS of them in its map), lit at
# night (nightlights.lua: "extend the street and window lights as far as the buildings render")
SKY_BAY_M = 3.5
SKY_WIN_BAYS = SKY_WIN_FLOORS = 16


def _sky_colour(look, f):
    """RGBA bytes of a LOOKS name drawn plain: its material's mean colour x its tint x the jitter f."""
    if look not in LOOKS:
        return (150, 150, 150, 255)
    mat, tint = LOOKS[look]
    mean = MAT_MEAN.get(mat, (0.7, 0.7, 0.7))
    return tuple(int(max(0, min(255, round(255 * m * t * f)))) for m, t in zip(mean, tint)) + (255,)


def _sky_mesh(items):
    """The skyline mesh of [(Spec, gmin, gmax)]: per building a quad per wall and its flat roof, in MARBLE at one
    texel, coloured per vertex (~4 per corner + the roof's corners: a row house is 20 vertices, the lite mesh ~72).
    (positions, uvs, tris, tri material indices, MATERIALS, colours) as build, or None."""
    m = Mesh()
    mi = MATERIALS.index(MARBLE)
    ms = MATERIALS.index(SKY_WALL)
    uv = SKY_UV
    for spec, gmin, gmax in items:
        ring = np.asarray(spec.ring, np.float64)[:, :2]
        if len(ring) < 3:
            continue
        if _area2(ring) < 0:
            ring = ring[::-1]
        f = 1.0 + JITTER * (2.0 * _hash01(spec.seed, "jit") - 1.0)
        windows = spec.windows is not False
        wall = (ms if windows else mi, _sky_colour(spec.facade, f))
        roof = (mi, _sky_colour(spec.roof_mat or ROOF_FLAT, f))
        z0 = gmin - SKIRT_LITE_M
        z1 = base_z(spec, gmin, gmax) + float(spec.min_h or 0.0) + float(spec.height or 0.0)
        if z1 <= z0 + 0.5:
            continue
        n = len(ring)
        # (windows: u along the walls in bays, v up in storeys from the ground, both over the map's count)
        zb = gmin
        fh = float(spec.floor_h or FLOOR_M) * SKY_WIN_FLOORS
        bw = SKY_BAY_M * SKY_WIN_BAYS
        v0, v1 = (z0 - zb) / fh, (z1 - zb) / fh
        u = 0.0
        for i in range(n):
            a, b = ring[i], ring[(i + 1) % n]
            if windows:
                du = float(math.hypot(*(b - a))) / bw
                m.quad((a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], z1), (a[0], a[1], z1),
                       (u, v0), (u + du, v0), (u + du, v1), (u, v1), wall)
                u += du
            else:
                m.quad((a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], z1), (a[0], a[1], z1), uv, uv, uv, uv, wall)
        m.poly([(p[0], p[1], z1) for p in ring], [uv] * n, roof)
    if not m.n:
        return None
    P, UV, T, M, C = m.arrays()
    return P, UV, T, M, MATERIALS, C


def sky_items(frame, box, keys, md, ground, lamp_region=None, own=None):
    """The skyline's buildings of box (x0, y0, x1, y1) in frame over map cells keys: (picked items, lamps), or None when
    the cells are not at hand (fetched in the background: asked again later). own: a geotile's box (its own buildings
    and lamps, each in one tile)."""
    x0, y0, x1, y1 = box
    # (and the roads: their street lamps, far_lamps)
    if not all(md.has(k, "buildings") and md.has(k, "roads") for k in keys):
        for k in keys:                      # (the background lane: never before what the player is near)
            md.prefetch(k, layers=("buildings", "roads"))
        return None
    cds = [md.cell(k, layers=("buildings", "roads"), kind="background") for k in keys]
    layers = [c.layers.get("buildings") for c in cds]
    items = tile_buildings(frame, x0, y0, x1, y1, layers, ground, min_size=(1e9, SKY_MIN_AREA_M2), own=own)
    size = max(x1 - x0, y1 - y0)
    lamps = far_lamps(frame, [c.layers.get("roads") for c in cds], x0, y0, size,
                      built_squares(items, 0.0, 0.0, size), ground, lamp_region, own=own)
    for spec, _gmin, _gmax in items:        # (the simplest shape: a box or a few corners, a flat roof, nothing on it)
        ring = np.asarray(spec.ring, np.float64)
        if len(ring) > 4 and abs(_area2(ring)) / 2 < SKY_BOX_AREA_M2:
            c, u, hl, hw = oriented_box(ring)
            v = np.array([-u[1], u[0]])
            ring = np.array([c - u * hl - v * hw, c + u * hl - v * hw, c + u * hl + v * hw, c - u * hl + v * hw])
        elif len(ring) > SKY_MAX_CORNERS:     # (rings are open: the last corner is not the first again)
            ring = ring[::int(np.ceil(len(ring) / SKY_MAX_CORNERS))]
        spec.ring = ring
        spec.roof, spec.steeple, spec.stoop, spec.porch, spec.sign, spec.door = "flat", None, None, None, None, None
        spec.plate = None
    items.sort(key=lambda it: (-(float(it[0].height or 0.0) + float(it[0].min_h or 0.0)), str(it[0].seed)))
    picked, n = [], 0
    for it in items:                        # (the tallest first, up to the 16-bit vertex budget: 5 per corner)
        k = 5 * len(it[0].ring)
        if n + k > MAX_MESH_VERTS:
            break
        picked.append(it)
        n += k
    return picked, lamps


# ------------------------------------------------------------------------------------------- far bridges
# The road bridges past the road tiles (their decks only came with the road tiles, ~0.8 km: a city's bridges were
# gone beyond that): one render-only slab per road tile that has bridge decks, out to BRIDGE_FAR_SEND_M, from the same
# deck solver as the road tiles (roads.BridgeProfiles), each part's segments in the tile of their midpoint (offsets
# from the whole part: tiles meet without a gap). A slab: the deck's top, its sides and its underside down to its
# girders, plain grey (MARBLE at one texel, vertex colours). The mod hides one while its road tile has a deck.
BRIDGE_FAR_SEND_M = float(os.environ.get("BNE_BRIDGE_FAR_SEND_M", "4800"))
BRIDGE_FAR_DROP_M = BRIDGE_FAR_SEND_M + 500.0
BRIDGE_FAR_PER_POSE = 2
BRIDGE_TOP_RGBA = (92, 92, 94, 255)        # the deck's asphalt from afar
BRIDGE_SIDE_RGBA = (176, 174, 168, 255)    # its concrete
FAR_NEED = 106             # earthfast.bridge_slabs


def bridge_slabs(parts, origin, box=None, owners=None):
    """The slab meshes of the bridge parts [(xy (k, 2), z (k,), width m)] (in one frame), relative to origin (x, y),
    by owner (earthfast.bridge_slabs): box (x0, y0, x1, y1): the segments whose midpoint is in [x0, x1) x [y0, y1), one
    mesh under the key None; owners (frame, cz, pz, px, py): those whose midpoint's place lies in a zoom-cz geotile
    under the zoom-pz one (px, py), a mesh per geotile {(gx, gy): mesh}. Each (positions, uvs, tris, tri materials,
    MATERIALS, colours) as build: the deck's top, its sides and its underside down to its girders, plain grey."""
    import fast
    import roadmesh
    parts = [(np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64), float(w)) for xy, z, w in parts]
    parts = [p for p in parts if len(p[0]) >= 2]
    if not parts:
        return {}
    fast.require(FAR_NEED, "bridge_slabs")
    xy = np.ascontiguousarray(np.concatenate([p[0] for p in parts]))
    z = np.ascontiguousarray(np.concatenate([p[1] for p in parts]))
    off = np.r_[0, np.cumsum([len(p[0]) for p in parts])].astype(np.int64)
    w = np.array([p[2] for p in parts], np.float64)
    if owners is None:
        lat0 = lon0 = 0.0
        cz = pz = px = py = 0
        bb = tuple(float(v) for v in box)
    else:
        frame, cz, pz, px, py = owners
        lat0, lon0, bb = float(frame.lat0), float(frame.lon0), (0.0, 0.0, 0.0, 0.0)
    got = fast._ef.bridge_slabs(xy, z, off, w, (float(origin[0]), float(origin[1])),
                                float(roadmesh.DECK_DEPTH + roadmesh.GIRDER_D), BRIDGE_TOP_RGBA, BRIDGE_SIDE_RGBA, bb,
                                lat0, lon0, int(cz), int(pz), int(px), int(py))
    mi = MATERIALS.index(MARBLE)
    out = {}
    for gx, gy, P, T, C in got:
        if not len(T):
            continue
        UV = np.tile(np.asarray(SKY_UV, np.float64), (len(P), 1))
        out[None if owners is None else (int(gx), int(gy))] = (P, UV, T, np.full(len(T), mi, np.int64), MATERIALS, C)
    return out


# ------------------------------------------------------------------------------------------- the ground photo


PHOTO_GROW_M = 1.5          # m a footprint is grown on the ground photo (edges, eaves) ...
PHOTO_LEAN = 0.12           # ... plus this share of its height (the photo's lean of tall buildings), at most
PHOTO_LEAN_MAX_M = 6.0      # ... this
PHOTO_FILL_M = 12.0         # m: the blur that fills them from the ground around


# (read inside functions only; here so that the parts can load each other)
from .looks import FLOOR_M, JITTER, LOOKS, MARBLE, MATERIALS, ROOF_FLAT, SKIRT_LITE_M, SKY_WALL  # noqa: E402
from .build import build, collision_mesh  # noqa: E402
from .styles import _area2, _hash01, oriented_box  # noqa: E402
from .places import castle_boxes, use_data, worship_boxes  # noqa: E402
from .mesh import MAX_MESH_VERTS, Mesh, base_z, build_parts  # noqa: E402
from .sites import bridge_lines, garage_rings, road_lines, support_rings, water_rings, way_lines  # noqa: E402
from .tiles import collider_boxes, tile_buildings, write  # noqa: E402
from .doors import doors, road_tile_items  # noqa: E402
from .photo import district_town  # noqa: E402
