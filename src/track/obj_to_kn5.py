"""Our own kn5 writer: OBJ (make_obj.py) -> .kn5, without Blender and ksEditor.

Modelled on a file written by ksEditor (kn5.py reads it completely):
- root node with an identity matrix, below it the meshes in world coordinates (Y up) and the empties
  (AC_START_n, AC_PIT_n, AC_HOTLAP_START_0, AC_TIME_0_L/R or AC_AB_*) as matrix nodes; the car faces local +Z.
- vertex: position, normal, UV (v negated), tangent; 16 bit indices (<= 65535 vertices per mesh).
- materials with ksAmbient, ksDiffuse, ksSpecular, ksSpecularEXP, ksEmissive, ksAlphaRef and txDiffuse;
  tile ground uses CSP's ksMultilayer_objsp_nm4 (groundmaterial.ground), retaining the baked image's colours and gloss.

    python -m track.obj_to_kn5 <track.obj> <target.kn5> [anchor.json]
"""
import json
import math
import os
import re
import shutil
import sys
from zipfile import BadZipFile, ZipFile

import numpy as np

from track import editorinfo, groundmaterial, kn5, objectlist, parallel, route_race

# Material values (set in AC by eye): ambient and sun balanced so the shadow sides are not too dark and the sunlit
# sides not too bright
DEFAULT = {"ksAmbient": 0.43, "ksDiffuse": 0.27, "ksSpecular": 0.05, "ksSpecularEXP": 20.0}
VALUES = {
    "asphalt": {"ksAmbient": 0.41, "ksDiffuse": 0.27, "ksSpecular": 0.02, "ksSpecularEXP": 10.0},    # (like the terrain)
    "cobble": {"ksAmbient": 0.39, "ksDiffuse": 0.23, "ksSpecular": 0.08, "ksSpecularEXP": 25.0},
    "paint": {"ksAmbient": 0.45, "ksDiffuse": 0.31, "ksSpecular": 0.10, "ksSpecularEXP": 30.0},
    "grass": {"ksAmbient": 0.41, "ksDiffuse": 0.27, "ksSpecular": 0.02, "ksSpecularEXP": 10.0},
    "wire": {"ksAmbient": 0.10, "ksDiffuse": 0.10, "ksSpecular": 0.05, "ksSpecularEXP": 20.0},
    "water": {"ksAmbient": 0.55, "ksDiffuse": 0.30, "ksSpecular": 0.35, "ksSpecularEXP": 40.0},     # comic water
    "foam": {"ksAmbient": 0.60, "ksDiffuse": 0.30, "ksSpecular": 0.10, "ksSpecularEXP": 20.0},
}
SMOOTH = {"grass", "asphalt", "cobble", "dirt", "ballast", "paint", "water", "foam", "edge_dirt", "arrows", "far"}
# gravel edge and arrows (roadtex.py): frayed or cut-out shape through the alpha test
SHADERS = {"edge_dirt": ("ksPerPixelAT", 1), "arrows": ("ksPerPixelAT", 1)}
SIGN_LETTERS = ("bne_exit_letters", "bne_guide_letters", "bne_guide_letters_black")     # (make_obj.SIGN_LETTERS)
SHADERS.update({m: ("ksPerPixelAT", 1) for m in SIGN_LETTERS})
SHADERS["fences"] = ("ksPerPixelAT_NS", 1)     # (fences.py: chain link, mesh, pickets cut out; upright quads like trees)
SHADERS["leisure"] = ("ksPerPixelAT", 1)        # (leisure.py: the goals' and hoops' nets cut out)
VALUES["trees"] = {"ksAmbient": 0.42, "ksDiffuse": 0.36, "ksSpecular": 0.0, "ksSpecularEXP": 1.0}     # (imported plant models: trackmodels)
VALUES["edge_dirt"] = VALUES["grass"]
VALUES["far"] = VALUES["grass"]
VALUES["arrows"] = VALUES["paint"]
VALUES["gate_band"] = VALUES["paint"]
ALPHA_REF = {"edge_dirt": 0.5, "arrows": 0.5}
ALPHA_REF.update({m: 0.5 for m in SIGN_LETTERS})
ALPHA_REF["fences"] = 0.5
ALPHA_REF["leisure"] = 0.5
FACADE_LEVELS = (0.82, 1.0, 1.15)       # brightness levels of the facades (make_obj.FACADE_LEVELS)
# Buildings against DEFAULT: less ambient, more sun, so a side turned away from the sun reads darker than the lit one (set in AC
# by eye on a town and a country test track; the sum stays about the same, so their brightness does)
BUILDING_AMBIENT, BUILDING_DIFFUSE = 0.75, 1.3
MAX_VERTS = 65535
SLOTS, SLOT_GAP, START_LIFT = 4, 8.0, 0.15
# Metres from the first car's centre to the timing plane: a normal road car's nose stays behind the line.
# Very long vehicles can need more clearance; all following slots stay farther back along the road.
STAGE_START_GAP_M = 3.0
STAGE_GRID_M = STAGE_START_GAP_M + (SLOTS - 1) * SLOT_GAP
# View distance (m) and shadows per kind of object, first matching name prefix. Without a limit AC draws every tile up
# to the horizon, kerbs and markings too (a 2400-tile track: 22 fps; a 25-tile one: 90+).
# No shadows for flat and thin things (invisible, but every shadow cascade pays for them). AC measures from the mesh
# centre; the meshes are per tile, hence the bounding sphere radius is added.
# The terrain casts no shadows: it shadowed itself, rings around the camera on the asphalt. Trees, houses, pylons,
# bridges and tunnel tubes still cast them; hills no longer do.
VIEW = (
    ("1GRASS_ground", 6000.0, 0), ("1ROAD_ground", 6000.0, 0), ("1GRAVEL_ground", 6000.0, 0),
    ("1ROAD_deck", 6000.0, 1), ("1WALL_tunnel_cap", 6000.0, 1),
    ("1WALL_tunnel_grass", 6000.0, 1), ("nocol_water", 6000.0, 0),
    ("1WALL_props", 400.0, 1), ("nocol_props", 400.0, 1), ("1WALL_rocks", 900.0, 1),   # (before "1WALL_")
    ("1WALL_cars", 300.0, 1),                   # parked cars (cars.py)
    ("1WALL_fuel", 800.0, 1), ("nocol_fuel", 400.0, 1),     # gas stations (propsmesh.fuel)
    ("nocol_signs", 600.0, 1),                  # road signs (make_obj: BeamNG.Earth's sign tiles)
    ("1WALL_gate", 3000.0, 1), ("nocol_gate_band", 1500.0, 0), ("nocol_gate", 3000.0, 1),     # start/finish (gates.py)
    ("1WALL_pylon", 2500.0, 1), ("nocol_pylon", 2500.0, 1),     # high-voltage pylons (30 m high)
    ("1WALL_tower", 2500.0, 1),                 # silos, tanks, masts (leisure.py)
    ("1WALL_fountain", 500.0, 1),               # fountains, wells, drinking fountains (leisure.py)
    ("nocol_pool", 600.0, 0), ("nocol_play", 400.0, 1), ("nocol_sport", 500.0, 1),     # (leisure.py)
    ("nocol_graves", 300.0, 0),
    ("nocol_bld_", 2000.0, 1), ("1WALL_", 2000.0, 1), ("1GRAVEL_rail", 2000.0, 0),
    ("nocol_trees", 1200.0, 1), ("nocol_rocks", 600.0, 1),
    ("nocol_bush", 350.0, 0),                   # cheap bushes (bushes.py): thousands a tile, near only, no shadow cascades
    ("nocol_road_", 400.0, 0), ("nocol_tunnel_paint", 400.0, 0), ("nocol_walk_", 400.0, 0),
    ("nocol_wire", 400.0, 0), ("nocol_rail_wood", 400.0, 0), ("nocol_rail_rail", 400.0, 0),
    ("nocol_rail_ballast", 2000.0, 0), ("nocol_rail_", 2000.0, 1), ("nocol_foam", 400.0, 0),
    ("nocol_guardrail", 800.0, 0),
    ("nocol_fence", 500.0, 0),                  # fences, walls, hedges (fences.py)
    ("nocol_far", 100000.0, 0),                 # distant view (farview.py, up to 40 km around the corridor)
)
VIEW_DEFAULT = (2000.0, 1)


def view(name):
    """(view distance m, shadows) of an object by VIEW."""
    for start, dist, shadows in VIEW:
        if name.startswith(start):
            return dist, shadows
    return VIEW_DEFAULT


def dds_texture(path, bc7=False):
    """JPG -> DDS (BC1/DXT1, or BC7 with bc7) with mipmaps down to 4 px, stored next to it (reused while newer than the JPG
    and in that format); returns the path or None (sides not a multiple of 4). AC unpacks JPG to RGBA in video memory:
    2048 px = 22 MB with mipmaps, BC1 2.8 MB (2400 terrain textures: 53 GB -> 7 GB), BC7 5.6 MB (bc7_images)."""
    from PIL import Image
    from track.textures import _is_bc7, dds_mipmaps
    out = os.path.splitext(path)[0] + ".dds"
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
        with open(out, "rb") as f:
            if _is_bc7(f.read(148)) == bc7:
                return out
    with Image.open(path) as im:
        if im.width % 4 or im.height % 4:
            return None
        data = dds_mipmaps(im, bc7=bc7)
    tmp = out + ".tmp"
    with open(tmp, "wb") as f:
        f.write(data)
    os.replace(tmp, out)
    return out


def bc7_images(mtl, road_materials):
    """The JPGs of mtl ({material: image}) to write as BC7: the ground tile images of materials with a 1ROAD_ object
    (road_materials), where asphalt meets verge and markings (textures.dds_mipmaps). The others stay BC1: BC7 is twice
    the size, a 2400-tile route's ground ~7 -> ~13 GB of video memory if every tile were BC7. Pure."""
    return {mtl[m] for m in road_materials if groundmaterial.is_ground(m) and mtl.get(m, "").lower().endswith(".jpg")}


def obj_index(s, n):
    """OBJ index (1-based, or negative relative to the n entries read so far) -> 0-based."""
    k = int(s)
    return k - 1 if k > 0 else n + k


def invisible(name):
    """Collision-only objects (make_obj.COL_ONLY: "<prefix>_walkcol_...", "<prefix>_bldcol_..."): not drawn."""
    parts = name.split("_")
    return len(parts) > 1 and parts[1].endswith("col")


def read_obj(path, normals=None):
    """{object name: (material, positions (n,3), UVs (n,2), triangles (m,3))} in AC coordinates (OBJ is Y-up); normals:
    a dict that gets {object name: normals (n,3)} of the objects that carry them (make_obj: the trees)."""
    V, VT, VN, objs, cur = [], [], [], {}, None
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("v "):
                V.append(line.split()[1:4])
            elif line.startswith("vt "):
                VT.append(line.split()[1:3])
            elif line.startswith("vn "):
                VN.append(line.split()[1:4])
            elif line.startswith("o "):
                cur = {"mat": None, "f": []}
                objs[line.split()[1]] = cur
            elif line.startswith("usemtl "):
                cur["mat"] = line.split()[1]
            elif line.startswith("f "):         # (negative: relative to the end, make_obj writes them that way)
                cur["f"].append([tuple(obj_index(x, len(L)) for x, L in zip(p.split("/")[:3], (V, VT, VN)))
                                 for p in line.split()[1:4]])
    V, VT, VN = np.asarray(V, np.float64), np.asarray(VT, np.float64), np.asarray(VN, np.float64).reshape(-1, 3)
    out = {}
    for name, o in objs.items():
        F = np.asarray(o["f"], np.int64)            # (m, 3, 2 or 3): position, UV and normal index
        k = F.shape[2]
        keys, inv = np.unique(F.reshape(-1, k), axis=0, return_inverse=True)
        out[name] = (o["mat"], V[keys[:, 0]], VT[keys[:, 1]], inv.reshape(-1, 3))
        if k == 3 and normals is not None:
            normals[name] = VN[keys[:, 2]]
    return out


def read_mtl(path):
    mats, cur = {}, None
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("newmtl "):
                cur = line.split()[1]
                mats[cur] = None
            elif line.startswith("map_Kd "):
                mats[cur] = os.path.join(os.path.dirname(path), line.split(maxsplit=1)[1].strip())
    return mats


def face_normals(P, T):
    n = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
    return n


def tangents(P, UV, T, N):
    """Tangents per vertex from the UVs (averaged, orthogonalised against the normal)."""
    p0, p1, p2 = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
    w0, w1, w2 = UV[T[:, 0]], UV[T[:, 1]], UV[T[:, 2]]
    e1, e2 = p1 - p0, p2 - p0
    d1, d2 = w1 - w0, w2 - w0
    r = d1[:, 0] * d2[:, 1] - d2[:, 0] * d1[:, 1]
    r = np.where(np.abs(r) < 1e-12, 1.0, r)
    t = (e1 * d2[:, 1:2] - e2 * d1[:, 1:2]) / r[:, None]
    acc = np.zeros_like(P)
    for k in range(3):
        np.add.at(acc, T[:, k], t)
    acc -= N * np.sum(acc * N, axis=1, keepdims=True)
    ln = np.linalg.norm(acc, axis=1, keepdims=True)
    fallback = np.cross(N, np.where(np.abs(N[:, 1:2]) < 0.9, [[0.0, 1.0, 0.0]], [[1.0, 0.0, 0.0]]))
    return np.where(ln > 1e-9, acc / np.maximum(ln, 1e-9), fallback / np.maximum(
        np.linalg.norm(fallback, axis=1, keepdims=True), 1e-9))


def skirt_normals(P, N):
    """Every vertex gets the normal that points up the most among the vertices at the same (horizontal) place: the
    skirts of the distant view (farview, vertical below the tile edge) get the one of the surface above, as in
    BeamNG.Earth (farfield.build_tile: "same normal and uv as the edge"). With their own horizontal normals they lay in
    shadow: dark, flickering jags where a finer tile ends above a coarser one."""
    _, inv = np.unique(np.round(P[:, [0, 2]] * 100.0).astype(np.int64), axis=0, return_inverse=True)
    inv = inv.ravel()
    order = np.lexsort((N[:, 1], inv))          # per place, within it ascending by up
    last = np.r_[np.nonzero(np.diff(inv[order]))[0], len(order) - 1]
    return N[order[last]][inv]


def light_values(m):
    """The light values {ksAmbient, ksDiffuse, ksSpecular, ksSpecularEXP} of the material named m. Pure."""
    if m.startswith(("gc_", "ground_")):        # comic ground and terrain texture per tile: light values like the meadow
        return VALUES["grass"]
    # buildings and walls <kind>_CC_L (make_obj.BLD_KINDS, WALL_SOURCE): brightness level L through the light values
    if re.fullmatch(r"[a-z]{3}_\d{2}_[0-2]", m):
        k = FACADE_LEVELS[int(m[-1])]
        return {**DEFAULT, "ksAmbient": DEFAULT["ksAmbient"] * k * BUILDING_AMBIENT,
                "ksDiffuse": DEFAULT["ksDiffuse"] * k * BUILDING_DIFFUSE}
    return VALUES.get(m, DEFAULT)


def mesh_nodes(name, mat_index, smooth, P, UV, T, up=False, skirts=False, normals=None):
    """One or more mesh nodes (<= 65535 vertices each) with normals and tangents; up: all normals pointing up;
    skirts: skirts with the normal of the surface above (skirt_normals); normals: given ones per vertex (they win)."""
    if smooth:                      # shared vertices, area-weighted normals
        fn = face_normals(P, T)
        N = np.zeros_like(P)
        for k in range(3):
            np.add.at(N, T[:, k], fn)
    else:                           # hard edges: every face its own vertices (like ksEditor with FBX face normals)
        P, UV = P[T.ravel()], UV[T.ravel()]
        if normals is not None:
            normals = normals[T.ravel()]
        T = np.arange(len(P)).reshape(-1, 3)
        N = np.repeat(face_normals(P, T), 3, axis=0)
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)
    if normals is not None:
        N = normals / np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    elif up:
        N[:] = (0.0, 1.0, 0.0)
    if skirts:
        N = skirt_normals(P, N)
    TG = tangents(P, UV, T, N)
    nodes, per = [], MAX_VERTS // 3
    for s in range(0, len(T), per):
        t = T[s:s + per]
        used, inv = np.unique(t.ravel(), return_inverse=True)
        v = np.zeros(len(used), kn5.VERTEX)
        v["pos"], v["normal"], v["tangent"] = P[used], N[used], TG[used]
        v["uv"] = np.c_[UV[used, 0], -UV[used, 1]]          # (ksEditor stores v negated)
        lo, hi = P[used].min(0), P[used].max(0)
        c = (lo + hi) / 2
        nodes.append(kn5.Node(2, name if s == 0 else f"{name}_{s // per}", 1, cast_shadows=1, visible=1,
                              transparent=0, vertices=v, indices=inv.astype(np.uint16), material=mat_index,
                              layer=0, lod_in=0.0, lod_out=0.0, bs_center=tuple(c.tolist()),
                              bs_radius=float(np.linalg.norm(P[used] - c, axis=1).max()), renderable=1))
    return nodes


def empty(name, pos, forward):
    """Matrix node like ksEditor's: rows = local axes (X, Y up, Z = driving direction), last row the position.
    Checked on Kunos' Magione: the AI line's direction at AC_START_0 is 1 degree off +Z (not -Z, as first guessed
    from the ksEditor file: that put every car backwards)."""
    z = np.asarray(forward, float)
    y = np.array([0.0, 1.0, 0.0])
    x = np.cross(y, z)
    m = np.zeros((4, 4))
    m[0, :3], m[1, :3], m[2, :3], m[3, :3], m[3, 3] = x, y, z, pos, 1.0
    return kn5.Node(1, name, 1, matrix=tuple(m.ravel().tolist()))


def _surface_heights(objs, x, z, prefixes):
    """Arrays of triangle heights at AC coordinates (x, z) from objects with the given prefixes. Pure."""
    for name, (_, P, _, T) in objs.items():
        if not name.startswith(prefixes):
            continue
        a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
        den = (b[:, 2] - c[:, 2]) * (a[:, 0] - c[:, 0]) + (c[:, 0] - b[:, 0]) * (a[:, 2] - c[:, 2])
        ok = np.abs(den) > 1e-12
        den = np.where(ok, den, 1.0)
        w1 = ((b[:, 2] - c[:, 2]) * (x - c[:, 0]) + (c[:, 0] - b[:, 0]) * (z - c[:, 2])) / den
        w2 = ((c[:, 2] - a[:, 2]) * (x - c[:, 0]) + (a[:, 0] - c[:, 0]) * (z - c[:, 2])) / den
        w3 = 1 - w1 - w2
        hit = ok & (w1 >= -1e-6) & (w2 >= -1e-6) & (w3 >= -1e-6)
        if hit.any():
            yield (w1 * a[:, 1] + w2 * b[:, 1] + w3 * c[:, 1])[hit]


def road_height(objs, x, z, prefixes=("1ROAD_", "1GRAVEL_")):
    """Highest road at AC coordinates (x, z), or None; other prefixes select other objects for gates.py. Pure."""
    return max((y.max() for y in _surface_heights(objs, x, z, prefixes)), default=None)


# Road decks normally have at least about 4.5 m of clearance. Overlapping surfaces at a junction
# differ by centimetres. A deck less than 2.5 m above another surface would be grouped with it.
LEVEL_GAP_M = 2.5


def road_levels(objs, x, z, gap=LEVEL_GAP_M):
    """Distinct driving-surface heights at AC coordinates (x, z), merging levels within gap. Pure."""
    heights = sorted(float(v) for y in _surface_heights(objs, x, z, ("1ROAD_", "1GRAVEL_")) for v in y)
    levels = []
    for height in heights:
        if not levels or height - bottom >= gap:
            levels.append(height)
            bottom = height
        else:
            levels[-1] = height
    return levels


def route_slots(objs, route, n, gap, log=print, front_m=None):
    """n grid slots along the route (ENU polyline): slot 0 at the front, the others behind it; each (position,
    direction). If the route starts on a way that isn't built (driveway, car park aisle: BeamNG.Earth leaves them out),
    the slots move forward to the first place where all of them stand on road. With front_m, the first slot is fixed
    at that route metre and the others behind it: no forward search past a stage's start line."""
    xy = np.asarray(route, float)
    seg = np.linalg.norm(np.diff(xy, axis=0), axis=1)
    s = np.r_[0.0, np.cumsum(seg)]

    def slot(d):
        x, y = np.interp(d, s, xy[:, 0]), np.interp(d, s, xy[:, 1])
        x2, y2 = np.interp(d + 5, s, xy[:, 0]), np.interp(d + 5, s, xy[:, 1])
        h = math.atan2(y2 - y, x2 - x)
        yy = road_height(objs, x, -y)
        return (np.array([x, yy, -y]) if yy is not None else None, np.array([math.cos(h), 0.0, -math.sin(h)]))

    if front_m is not None:
        if front_m < gap * (n - 1) or front_m > s[-1]:
            return [(None, None)] * n
        return [slot(front_m - gap * k) for k in range(n)]

    for d0 in np.arange(2.0, min(400.0, s[-1] - gap * n), 2.0):
        out = [slot(d0 + gap * (n - 1 - k)) for k in range(n)]
        if all(p is not None for p, _ in out):
            if d0 > 2.0:
                log(f"Start moved {d0:.0f} m forward: the route begins on a way that is not built "
                    "(driveway, parking lot or similar)")
            return out
    return [(None, None)] * n


AB_HALF_M = 12.0           # half length of the start and finish line across the route (also over wide roads)


def _along(xy, s, d):
    """(x, y) ENU and driving direction (AC) at d m along the polyline xy (arc lengths s)."""
    at = lambda t: (np.interp(t, s, xy[:, 0]), np.interp(t, s, xy[:, 1]))      # noqa: E731
    (x, y), (x0, y0), (x1, y1) = at(d), at(d - 5), at(d + 5)
    h = math.atan2(y1 - y0, x1 - x0)
    return x, y, np.array([math.cos(h), 0.0, -math.sin(h)])


def _lap_vertices(route_xy):
    """Vertices of an ENU lap, preserving pin 1 and dropping consecutive duplicates and the closing copy. Pure."""
    xy = np.asarray(route_xy, float)
    if len(xy) < 2:
        return xy
    xy = xy[np.r_[True, (xy[1:] != xy[:-1]).any(axis=1)]]
    return xy[:-1] if len(xy) > 1 and np.array_equal(xy[0], xy[-1]) else xy


def _closed_lap(route_xy):
    """ENU lap with its closing vertex and cumulative lengths. Pure."""
    vertices = _lap_vertices(route_xy)
    xy = np.concatenate((vertices, vertices[:1]))
    return xy, np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]


def _path_crossings(xy, a, b, *, closed=True):
    """Crossing vertex and edge indices on the ENU path, without a repeated closing vertex. Pure."""
    line = np.subtract(b, a)
    span = line @ line
    if len(xy) < (3 if closed else 2) or span == 0:
        return (), ()
    rel = xy - a
    side = rel[:, 0] * line[1] - rel[:, 1] * line[0]
    along = rel @ line
    next_side, next_along = np.roll(side, -1), np.roll(along, -1)
    collinear = (side == 0) & (next_side == 0)
    if not closed:
        collinear[-1] = False   # there is no edge back to the start of an open route
    if np.any(collinear & (np.maximum(along, next_along) >= 0) & (np.minimum(along, next_along) <= span)):
        return (), ()
    # Count each visit at a vertex once. A touch that comes back to the same side cannot be a timing crossing.
    vertices = (side == 0) & (along >= 0) & (along <= span)
    if not closed and (vertices[0] or vertices[-1]):
        return (), ()
    if np.any(vertices & (np.roll(side, 1) * next_side >= 0)):
        return (), ()
    through = side * next_side < 0
    if not closed:
        through[-1] = False
    t = side[through] / (side[through] - next_side[through])
    crossing = along[through] + t * (next_along[through] - along[through])
    return np.flatnonzero(vertices), np.flatnonzero(through)[(crossing >= 0) & (crossing <= span)]


def crosses_once(route_xy, a, b):
    """Whether ENU segment a–b crosses the closed ENU lap exactly once. Pure."""
    vertices, edges = _path_crossings(_lap_vertices(route_xy), a, b)
    return len(vertices) + len(edges) == 1


def _line_crosses_at(xy, s, metre, centre, left, right, *, closed=True):
    """Whether the ENU timing segment crosses only the intended metre's part of the path. Pure."""
    n = len(xy) - 1
    incident = (np.searchsorted(s, metre, side="left") - 1) % n, np.searchsorted(s, metre, side="right") - 1
    normal = np.array([-(left[1] + right[1]), left[0] + right[0]])
    approach, departure = (xy[np.array(incident) + 1] - xy[list(incident)]) @ normal
    # Test at the intended lap metre using local edges, where rounding of the endpoints cannot hide a touch.
    if approach * departure <= 0:
        return False
    # Check the whole timing segment at the precision of the matrices written by kn5.node_bytes.
    a, b = np.array([centre + left, centre - right], dtype=np.float32).astype(float)
    vertices, edges = _path_crossings(xy[:-1] if closed else xy, a, b, closed=closed)
    if len(vertices) + len(edges) != 1:
        return False
    if len(edges):
        return edges[0] in incident
    vertex = vertices[0]
    return (vertex - 1) % n in incident or vertex in incident


# Start/finish can move the length of a village main street. A longer move would put it away from pin 1.
CIRCUIT_SEARCH_M = 300.0
# Sample the driving surface at terrain-cell intervals. Shorter gaps between samples can go undetected.
CIRCUIT_STEP_M = 2.0
# Leave road ahead of the line and behind the grid window, matching the direction lookahead in route_slots.
CIRCUIT_MARGIN_M = 5.0
SECTOR_COUNT = 3             # place timing lines at one third and two thirds of the timed distance


def _overlaps_twice(twice, first, span, length):
    """Whether the cyclic window [first, first + span] covers any distance in the twice-driven spans. Pure."""
    lo = first % length
    hi = lo + span
    return any(max(lo, a + shift) < min(hi, b + shift) for a, b in twice for shift in (0, length))


def circuit_empties(objs, anchor, log=print):
    """Start/finish, grid and hotlap from road objects and the closed ENU lap in the Circuit anchor."""
    xy, s = _closed_lap(anchor["route"])
    timing = anchor["timing"]
    length = s[-1]
    behind = SLOTS * SLOT_GAP + STAGE_START_GAP_M + CIRCUIT_MARGIN_M
    span = behind + CIRCUIT_MARGIN_M
    error = (f"No place for start/finish within {CIRCUIT_SEARCH_M:g} m after pin 1: "
             "move pin 1 onto a stretch driven once, away from bridges")
    if length < span:
        raise RuntimeError(error)

    # The middle copy provides approach and runout across the seam for direction and grid placement.
    loop_xy = np.concatenate((xy, xy[1:], xy[1:]))
    loop_s = np.r_[s, length + s[1:], 2 * length + s[1:]]
    sample_at = np.r_[np.arange(-behind, CIRCUIT_MARGIN_M, CIRCUIT_STEP_M), CIRCUIT_MARGIN_M,
                      -STAGE_START_GAP_M - SLOT_GAP * np.arange(SLOTS)]
    sample_cache = {}
    nearby_roads = _road_near(objs)

    def levels_at(d):
        metre = d % length
        if metre not in sample_cache:
            x, y = np.interp(metre, s, xy[:, 0]), np.interp(metre, s, xy[:, 1])
            sample_cache[metre] = road_levels(objs, x, -y)
        return sample_cache[metre]

    given = timing.get("line_m")
    start_m = timing["start_m"]
    candidates = (given,) if given is not None else (
        start_m + k * CIRCUIT_STEP_M for k in range(int(CIRCUIT_SEARCH_M // CIRCUIT_STEP_M) + 1))
    for d in candidates:
        if _overlaps_twice(timing["twice"], d - behind, span, length):
            continue
        metre = d % length
        x, y, fwd = _along(loop_xy, loop_s, length + metre)
        if not all(len(levels_at(sample)) == 1 for sample in d + sample_at):
            continue
        centre = np.array([x, levels_at(d)[0] + START_LIFT, -y])
        line = _timing_line(nearby_roads, xy, s, metre, centre, fwd, gantry=True)
        if line is None:
            continue
        slots = route_slots(objs, loop_xy, SLOTS, SLOT_GAP, log, front_m=length + metre - STAGE_START_GAP_M)
        if any(p is None for p, _ in slots):
            continue
        if given is None and d > start_m:
            log(f"Start/finish moved {d - start_m:g} m forward from pin 1")
        nodes = []
        for k, (p, direction) in enumerate(slots):
            pos = p + [0.0, START_LIFT, 0.0]
            nodes.extend((empty(f"AC_START_{k}", pos, direction), empty(f"AC_PIT_{k}", pos, direction)))
        base = slots[0][0] + [0.0, START_LIFT, 0.0]
        left, right = line
        nodes.extend((empty("AC_HOTLAP_START_0", base, slots[0][1]), empty("AC_TIME_0_L", left, fwd),
                      empty("AC_TIME_0_R", right, fwd)))
        return nodes, base, float(metre if given is None else given)
    raise RuntimeError(error)


def _road_near(objs):
    """Return a lookup for road objects whose horizontal bounds meet the area around an AC point. Pure."""
    keys = list(objs)
    lows = np.array([objs[k][1][:, [0, 2]].min(axis=0) for k in keys]).reshape(-1, 2)
    highs = np.array([objs[k][1][:, [0, 2]].max(axis=0) for k in keys]).reshape(-1, 2)

    def near(x, z, reach):
        point = np.array([x, z])
        ids = np.flatnonzero(((lows <= point + reach) & (highs >= point - reach)).all(axis=1))
        return {keys[i]: objs[keys[i]] for i in ids}

    return near


def _road_intervals(objs, centre, side, half_depth=0.0, own_level=False):
    """Across-road intervals of triangles inside the strip at centre, in AC horizontal coordinates. Pure."""
    forward = np.array([-side[1], side[0]])
    for _, positions, _, triangles in objs.values():
        relative = positions[:, [0, 2]] - centre[[0, 2]]
        across, along = relative @ side, relative @ forward
        distances = along[triangles]
        hit = (distances.min(axis=1) <= half_depth) & (distances.max(axis=1) >= -half_depth)
        faces = triangles[hit]
        v, u = distances[hit], across[faces]
        if not len(v):
            continue
        # Clipping a triangle to the slab gives inside vertices plus intersections with the slab's edges.
        projected = np.stack([u, positions[faces, 1] - centre[1]], axis=2)
        points = [np.where((np.abs(v) <= half_depth)[:, :, None], projected, np.nan)]
        next_v, next_points = np.roll(v, -1, axis=1), np.roll(projected, -1, axis=1)
        for edge in (-half_depth, half_depth) if half_depth else (0.0,):
            cut = (v < edge) != (next_v < edge)
            fraction = (edge - v) / np.where(cut, next_v - v, 1.0)
            points.append(np.where(cut[:, :, None], projected + fraction[:, :, None] * (next_points - projected), np.nan))
        samples = np.concatenate(points, axis=1)
        lows, highs = np.nanmin(samples, axis=1), np.nanmax(samples, axis=1)
        if own_level:
            at_level = (lows[:, 1] < LEVEL_GAP_M) & (highs[:, 1] > -LEVEL_GAP_M)
            lows, highs = lows[at_level], highs[at_level]
        yield from zip(lows[:, 0], highs[:, 0])


def _containing_span(intervals):
    """Unbroken road interval containing across-distance zero. Pure."""
    merged = []
    for lo, hi in sorted(intervals):
        # The OBJ shares edge vertices to millimetres. Ignore only numerical rounding in intersection math.
        if merged and lo <= merged[-1][1] + 1e-9:
            merged[-1][1] = max(merged[-1][1], hi)
        else:
            merged.append([lo, hi])
    return next(((lo, hi) for lo, hi in merged if lo <= 0 <= hi and lo < hi), None)


def _timing_line(nearby_roads, xy, s, metre, centre, forward, gantry=False, *, closed=True):
    """A road-wide timing segment with a single path crossing and, at start/finish, room for its posts. Pure."""
    from scenery import gates

    across = np.cross([0.0, 1.0, 0.0], forward)
    ac_side = across[[0, 2]]
    enu_side = ac_side * [1, -1]
    half_post = gates.POST_W / 2 if gantry else 0.0
    post_reach = gates.POST_GAP + half_post if gantry else 0.0
    reach = gates.SPAN_MAX + post_reach
    while True:
        roads = nearby_roads(centre[0], centre[2], reach)
        span = _containing_span(_road_intervals(roads, centre, ac_side, own_level=True))
        if span is None:
            return None
        lo, hi = span
        if not _line_crosses_at(xy, s, metre, centre[[0, 2]] * [1, -1], hi * enu_side, -lo * enu_side, closed=closed):
            return None
        needed = math.hypot(max(-lo, hi) + post_reach, half_post)
        if needed <= reach:
            break
        reach = needed
    if gantry:
        posts = lo - gates.POST_GAP, hi + gates.POST_GAP
        for a, b in _road_intervals(roads, centre, ac_side, half_depth=half_post):
            if any(max(a, post - half_post) < min(b, post + half_post) for post in posts):
                return None
    return centre + hi * across, centre + lo * across


def _sector_candidates(target, low, high):
    """Lap offsets in [low, high], nearest to target first, on the existing placement sample grid. Pure."""
    steps = math.ceil(max(abs(low - target), abs(high - target)) / CIRCUIT_STEP_M)
    for step in range(steps + 1):
        shift = step * CIRCUIT_STEP_M
        for offset in (target + shift, target - shift) if step else (target,):
            if low <= offset <= high:
                yield offset


def _sector_sites(length, count, check):
    """Ordered timing offsets and their checked line geometry, including room for the remaining lines. Pure."""
    # Leave room for the two lines' approach/runout windows. The first/last windows meet at start/finish.
    spacing = 2 * CIRCUIT_MARGIN_M
    blocked_from = {}

    def search(index, low):
        if index == count:
            return []
        if low >= blocked_from.get(index, math.inf):
            return None
        high = length - (count - index) * spacing
        for offset in _sector_candidates(length * index / count, low, high):
            line = check(offset)
            if line is None:
                continue
            remaining = search(index + 1, offset + spacing)
            if remaining is not None:
                return [(offset, line), *remaining]
        blocked_from[index] = low
        return None

    return search(1, spacing)


def _checked_splits(objs, xy, s, start, length, *, closed, twice=(), junctions=None):
    """Native sector markers and path metres for a timed span with a safe road crossing at each split. Pure."""
    total = s[-1]
    sample_xy, sample_s = xy, s
    if closed:
        sample_xy = np.concatenate((xy, xy[1:], xy[1:]))
        sample_s = np.r_[s, total + s[1:], 2 * total + s[1:]]
    nearby_roads = _road_near(objs)
    areas, branches = junctions or (np.empty((0, 3)), np.empty((0, 6)))
    memo = {}

    def build_line(metre):
        if twice and _overlaps_twice(twice, metre - CIRCUIT_MARGIN_M, 2 * CIRCUIT_MARGIN_M, total):
            return None
        x, y, forward = _along(sample_xy, sample_s, total + metre if closed else metre)
        local_roads = nearby_roads(x, -y, 0)
        if not local_roads:
            return None
        if len(areas) and np.any(np.sum((areas[:, :2] - (x, -y)) ** 2, axis=1) < areas[:, 2]):
            return None
        levels = road_levels(local_roads, x, -y)
        if len(levels) != 1:
            return None
        centre = np.array([x, levels[0] + START_LIFT, -y])
        line = _timing_line(nearby_roads, xy, s, metre, centre, forward, closed=closed)
        if line is None or _crosses_junction_arms(branches, *line):
            return None
        return *line, forward

    def path_metre(offset):
        return (start + offset) % total if closed else start + offset

    def check(offset):
        if offset not in memo:
            memo[offset] = build_line(path_metre(offset))
        return memo[offset]

    placed = _sector_sites(length, SECTOR_COUNT, check)
    if placed is None:
        return None
    nodes, metres = [], []
    for k, (offset, (left, right, forward)) in enumerate(placed, 1):
        metres.append(float(path_metre(offset)))
        nodes.extend((empty(f"AC_TIME_{k}_L", left, forward), empty(f"AC_TIME_{k}_R", right, forward)))
    return nodes, metres


def circuit_splits(objs, anchor, line_m, junctions=None):
    """Additional AC_TIME nodes and their metres from pin 1, ordered from the actual start/finish. Pure."""
    xy, s = _closed_lap(anchor["route"])
    placed = _checked_splits(objs, xy, s, line_m, s[-1], closed=True,
                             twice=anchor["timing"]["twice"], junctions=junctions)
    if placed is None:
        raise RuntimeError("No place for the circuit's sector lines: use stretches driven once, away from junctions and bridges")
    return placed


def _mapped_junctions(parts, log=print):
    """Read junction centres and branch polylines from available tile facts in AC x/z coordinates."""
    from junctions import NODE_TOL

    arms, widths = {}, {}
    for part in parts:
        path = editorinfo.side_file(part)
        try:
            with ZipFile(path) as archive:
                features = json.loads(archive.read("tile.json"))["features"]
            if not isinstance(features, list):
                raise ValueError("features must be a list")
        except FileNotFoundError:
            continue    # Older retained OBJ parts have no map facts.
        except (BadZipFile, OSError, KeyError, TypeError, ValueError) as error:
            log(f"Skipping junction data in {os.path.basename(path)}: {error}")
            continue
        for index, feature in enumerate(features, 1):
            try:
                spec = feature.get("spec")
                if not spec:
                    continue
                width = float(spec["width"])
                geometries = [np.asarray(line, dtype=float) for line in feature["geometry"]]
                if not math.isfinite(width) or any(line.size and (line.ndim != 2 or line.shape[1] != 2
                                                                  or not np.isfinite(line).all()) for line in geometries):
                    raise ValueError("invalid road width or coordinates")
            except (AttributeError, KeyError, OverflowError, TypeError, ValueError) as error:
                log(f"Skipping junction feature {index} in {os.path.basename(path)}: {error}")
                continue
            for geometry in geometries:
                nodes = np.rint(geometry / NODE_TOL).astype(int)
                for first, second in zip(map(tuple, nodes), map(tuple, nodes[1:])):
                    if first == second:
                        continue
                    for node, arm in ((first, second), (second, first)):
                        arms.setdefault(node, set()).add(arm)
                        widths[node] = max(widths.get(node, 0.0), width)
    junctions = [node for node, connected in arms.items() if len(connected) >= 3]
    areas, branches = [], []
    for index, centre in enumerate(junctions):
        x, z = np.asarray(centre) * NODE_TOL
        areas.append((x, z, (widths[centre] / 2) ** 2))
        for branch, arm in enumerate(sorted(arms[centre])):
            previous, node = centre, arm
            while True:
                coords = np.asarray([*previous, *node]) * NODE_TOL
                branches.append((*coords, index, branch))
                if len(arms[node]) != 2:
                    break
                previous, node = node, next(iter(arms[node] - {previous}))
    return np.asarray(areas).reshape(-1, 3), np.asarray(branches).reshape(-1, 6)


def _crosses_junction_arms(branches, left, right):
    """Whether a timing segment meets two different mapped arms of a junction. Pure."""
    if not len(branches):
        return False
    origin = left[[0, 2]]
    axis = right[[0, 2]] - origin
    normal = np.array([-axis[1], axis[0]])
    first, second = branches[:, :2] - origin, branches[:, 2:4] - origin
    a, b = first @ normal, second @ normal
    crosses = (a * b <= 0) & (a != b)
    t = a[crosses] / (a[crosses] - b[crosses])
    cut = first[crosses] + t[:, None] * (second[crosses] - first[crosses])
    along = cut @ axis
    groups = branches[crosses, 4:][(0 <= along) & (along <= axis @ axis)]
    # A shallow fork's axes can both be inside its single paved cross-section past the junction centre.
    distinct = np.unique(groups, axis=0)
    return len(np.unique(distinct[:, 0])) < len(distinct)


def timing_points(route, timing):
    """(x, z) in AC of the estimated start, finish and two split lines."""
    xy = np.asarray(route, float)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    return [(x, -y) for x, y, _ in (_along(xy, s, metre)
                                  for metre in np.linspace(timing["start_m"], timing["finish_m"], SECTOR_COUNT + 1))]


def _stage_grid(route, timing):
    """Grid path including the approach and its distance to pin 1, in ENU metres. Pure."""
    lead = np.asarray(timing["approach"], float).reshape(-1, 2)
    xy = np.concatenate((lead, np.asarray(route, float)))
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    return xy, s, s[len(lead)]


def stage_start(objs, route, timing, log=print):
    """Find a Route's first start after pin 1 whose grid fits on one road level in the supplied objects."""
    xy, s, origin = _stage_grid(route, timing)
    first = max(origin, STAGE_GRID_M)
    # Keep the existing gantry search resolution and range (2 m steps across at most 50 m).
    for d in first + 2.0 * np.arange(26):
        if d >= min(s[-1], origin + timing["finish_m"]):
            break
        x, y, fwd = _along(xy, s, d)
        levels = road_levels(objs, x, -y)
        if len(levels) != 1:
            continue
        front = d - STAGE_START_GAP_M
        slots = route_slots(objs, xy, SLOTS, SLOT_GAP, log, front_m=front)
        if all(p is not None and len(road_levels(objs, p[0], p[2])) == 1 for p, _ in slots):
            return float(d - origin), np.array([x, levels[0], -y]), fwd, slots
    return None


def ab_gates(objs, route, timing, log=print):
    """Point-to-point start and finish lines: AC_AB_START_L/R and AC_AB_FINISH_L/R (acs.exe knows them; CSP's rally
    mode reads them as a stage; rally and hill climb tracks use them), across the road at timing["start_m"] /
    ["finish_m"] along the route (generator.build). Without road there the start line moves up to 50 m forward, the
    finish line up to 50 m back; returns the nodes, [] without road (then the lap line stays). With timing["gates"]
    (gates.py: band and gantry) exactly there, from post to post."""
    if timing.get("gates"):
        nodes = []
        for prefix, kind in (("AC_AB_START", "start"), ("AC_AB_FINISH", "finish")):
            g = timing["gates"][kind]
            pos, fwd = np.asarray(g["pos"], float) + [0.0, START_LIFT, 0.0], np.asarray(g["fwd"], float)
            side = np.cross([0.0, 1.0, 0.0], fwd)
            nodes += [empty(f"{prefix}_L", pos + side * g["left"], fwd),
                      empty(f"{prefix}_R", pos - side * g["right"], fwd)]
        return nodes
    xy = np.asarray(route, float)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    nodes = []
    start = timing["start_m"]
    if "approach" in timing:
        placed = stage_start(objs, route, timing, log)
        if placed is None:
            return []
        start, pos, fwd, _ = placed
        side = np.cross([0.0, 1.0, 0.0], fwd) * AB_HALF_M
        pos = pos + [0.0, START_LIFT, 0.0]
        nodes.extend((empty("AC_AB_START_L", pos + side, fwd), empty("AC_AB_START_R", pos - side, fwd)))
    targets = [("AC_AB_FINISH", timing["finish_m"], -2.0)]
    if not nodes:
        targets.insert(0, ("AC_AB_START", start, 2.0))
    for prefix, d0, step in targets:
        for d in d0 + step * np.arange(26):
            if "approach" in timing and d <= start:
                return []
            x, y, fwd = _along(xy, s, d)
            h = road_height(objs, x, -y)
            if h is not None:
                break
        else:
            log(f"No road at the {'start' if step > 0 else 'finish'} line: no start-to-finish timing")
            return []
        side, pos = np.cross([0.0, 1.0, 0.0], fwd), np.array([x, h + START_LIFT, -y])
        nodes += [empty(f"{prefix}_L", pos + side * AB_HALF_M, fwd), empty(f"{prefix}_R", pos - side * AB_HALF_M, fwd)]
    return nodes


def _gate_distance(route, gates, near_m, kind):
    """Route metre crossing the supplied native gate plane nearest its requested near_m. Pure."""
    xy = np.asarray(route, float)
    delta = np.diff(xy, axis=0)
    seg = np.linalg.norm(delta, axis=1)
    s = np.r_[0.0, np.cumsum(seg)]
    left, right = (np.asarray(node.matrix[12:15]) for node in gates[:2])
    centre = ((left + right) / 2)[[0, 2]] * [1, -1]
    normal = np.asarray(gates[0].matrix[8:11])[[0, 2]] * [1, -1]
    den = delta @ normal
    t = np.divide((centre - xy[:-1]) @ normal, den, out=np.full(len(seg), np.nan), where=den > 0)
    hits = np.flatnonzero((t >= 0) & (t <= 1))
    if not len(hits):
        raise RuntimeError(f"The {kind} gate does not cross the route in its driving direction")
    at = s[hits] + t[hits] * seg[hits]
    return float(at[np.argmin(np.abs(at - near_m))])


def route_splits(objs, anchor, gates, junctions=None):
    """Two split lines for an open Route, and their route metres, or None if they cannot be placed safely. Pure."""
    route, timing = anchor["route"], anchor["timing"]
    if timing.get("approach"):
        xy, _, origin = _stage_grid(route, timing)
    else:
        xy, origin = np.asarray(route, float), 0.0
    xy = xy[np.r_[True, (np.diff(xy, axis=0) != 0).any(axis=1)]]
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    try:
        start = _gate_distance(xy, gates[:2], origin + timing["start_m"], "start")
        finish = _gate_distance(xy, gates[2:], origin + timing["finish_m"], "finish")
    except RuntimeError:
        return None
    if finish <= start:
        return None
    placed = _checked_splits(objs, xy, s, start, finish - start, closed=False, junctions=junctions)
    if placed is None:
        return None
    nodes, metres = placed
    return nodes, [metre - origin for metre in metres]


def start_empties(objs, anchor, log=print, junctions=None):
    """Grid, pits and hotlap just before a route's native timing start, else at its first road. Without a route,
    use the asphalt nearest the anchor. Point-to-point routes keep AC_AB_START/FINISH, others AC_TIME_0."""
    route = (anchor or {}).get("route")
    if route and len(route) > 1:
        timing = anchor.get("timing")
        gates = ab_gates(objs, route, timing, log) if timing else []
        if gates and "approach" in timing:
            grid, _, origin = _stage_grid(route, timing)
            if timing.get("gates"):
                front_m = max(STAGE_GRID_M, origin + timing["start_m"]) - STAGE_START_GAP_M
                slots = route_slots(objs, grid, SLOTS, SLOT_GAP, log, front_m=front_m)
            else:
                slots = stage_start(objs, route, timing, log)[3]
        else:
            front_m = _gate_distance(route, gates[:2], timing["start_m"], "start") - STAGE_START_GAP_M if gates else None
            slots = route_slots(objs, route, SLOTS, SLOT_GAP, log, front_m=front_m)
        if gates and any(p is None for p, _ in slots):
            raise RuntimeError("No road for all grid slots before the start line")
        if all(p is not None for p, _ in slots):
            nodes = []
            for k, (p, fwd) in enumerate(slots):
                pos = p + np.array([0.0, START_LIFT, 0.0])
                nodes.append(empty(f"AC_START_{k}", pos, fwd))
                nodes.append(empty(f"AC_PIT_{k}", pos, fwd))
            base, fwd = slots[0][0] + np.array([0.0, START_LIFT, 0.0]), slots[0][1]
            side = np.cross([0.0, 1.0, 0.0], fwd)
            nodes.append(empty("AC_HOTLAP_START_0", base, fwd))
            if gates:
                nodes += gates
                splits = route_splits(objs, anchor, gates, junctions)
                if splits is None:
                    log("No safe place for both Route sector lines: start and finish timing only")
                else:
                    nodes += splits[0]
            else:
                nodes.append(empty("AC_TIME_0_L", base + fwd * 20 + side * 6, fwd))
                nodes.append(empty("AC_TIME_0_R", base + fwd * 20 - side * 6, fwd))
            return nodes, base
    start = (anchor or {}).get("start")
    tx, tz = (start["x"], -start["y"]) if start else (0.0, 0.0)      # ENU -> AC: z = -north
    best = None
    for name, (_, P, _, _) in objs.items():
        if not name.startswith("1ROAD_"):
            continue
        d = (P[:, 0] - tx) ** 2 + (P[:, 2] - tz) ** 2
        i = int(np.argmin(d))
        if best is None or d[i] < best[0]:
            best = (d[i], P[i], P)
    if best is None:
        raise RuntimeError("no road surface found for the start position")
    _, p, P = best
    if start:
        h = start["heading"]                                        # ENU, from east
        fwd = np.array([math.cos(h), 0.0, -math.sin(h)])
    else:                           # road axis (main axis of the road points; sign checked: else turned by 180°)
        near = P[np.linalg.norm(P[:, [0, 2]] - p[[0, 2]], axis=1) < 15.0]
        ex, ny = near[:, 0] - near[:, 0].mean(), -near[:, 2] - (-near[:, 2]).mean()     # ENU: north = -z
        h = 0.5 * math.atan2(2 * np.sum(ex * ny), np.sum(ex * ex) - np.sum(ny * ny))
        fwd = np.array([math.cos(h), 0.0, -math.sin(h)])
    base = p + np.array([0.0, START_LIFT, 0.0])
    side = np.cross([0.0, 1.0, 0.0], fwd)
    nodes = []
    for k in range(SLOTS):
        nodes.append(empty(f"AC_START_{k}", base - fwd * SLOT_GAP * k, fwd))
        nodes.append(empty(f"AC_PIT_{k}", base - fwd * SLOT_GAP * k, fwd))
    nodes.append(empty("AC_HOTLAP_START_0", base, fwd))
    nodes.append(empty("AC_TIME_0_L", base + fwd * 20 + side * 6, fwd))
    nodes.append(empty("AC_TIME_0_R", base + fwd * 20 - side * 6, fwd))
    return nodes, base


START_NEAR_M = 1000.0      # road objects this close to the start of the route (and to the finish line) go to start_empties
                           # (it searches <= ~450 m)


def _part_chunk(path, chunk_path, mat_index, near_xz):
    """Mesh nodes of an OBJ (part) file as finished kn5 bytes to chunk_path (worker process); returns (nodes, vertices,
    road objects near one of the points near_xz for the grid slots and the finish line; all if near_xz is None, its list of
    single objects with node numbers from this chunk's start: objectlist, the materials of its 1ROAD_ objects: bc7_images)."""
    normals = {}
    objs = read_obj(path, normals)
    n_nodes = n_verts = 0
    nodes_of = {}
    with open(chunk_path, "wb") as f:
        for name, (m, P, UV, T) in objs.items():
            if name.startswith("1WALL"):    # double-sided: AC only collides with the front, and BeamNG.Earth's
                T = np.r_[T, T[:, ::-1]]    # walls (bridge railings, some house walls) aren't wound consistently
            dist, shadows = view(name)
            for nd in mesh_nodes(name, mat_index[m], m in SMOOTH or m.startswith(("gc_", "ground_")), P, UV, T,
                                 skirts=m == "far" or m.startswith("ground_far_"),
                                 normals=normals.get(name)):
                nd.lod_out, nd.cast_shadows = dist + nd.bs_radius, shadows
                if invisible(name):     # (collision only: BeamNG.Earth's walkcol/bldcol)
                    nd.renderable, nd.cast_shadows = 0, 0
                for b in kn5.node_bytes(nd):
                    f.write(b)
                nodes_of.setdefault(name, []).append((n_nodes, len(nd.indices) // 3))
                n_nodes, n_verts = n_nodes + 1, n_verts + len(nd.vertices)
    objects = objectlist.chunk_objects(path, nodes_of)
    roads = {}
    for k, v in objs.items():
        if k.startswith(("1ROAD_", "1GRAVEL_")):
            P = v[1]
            if near_xz is None or any((np.hypot(P[:, 0] - x, P[:, 2] - z) < START_NEAR_M).any() for x, z in near_xz):
                roads[k] = v
    return n_nodes, n_verts, roads, objects, {v[0] for k, v in objs.items() if k.startswith("1ROAD_")}


def _circuit_part(objs, anchor, parts, obj_dir, gate_path, log):
    """Checked timing nodes and the corresponding visible start/finish OBJ. Does not install the track."""
    from scenery import gates

    nearby_roads = _road_near(objs)
    x, y = anchor["route"][0]
    start_roads = nearby_roads(x, -y, START_NEAR_M)
    if anchor["timing"].get("line_m") is not None:
        xy, s = _closed_lap(anchor["route"])
        if s[-1] > 0:
            x, y, _ = _along(xy, s, anchor["timing"]["line_m"] % s[-1])
            start_roads.update(nearby_roads(x, -y, START_NEAR_M))
    nodes, base, line_m = circuit_empties(start_roads, anchor, log)
    splits, sector_m = circuit_splits(objs, anchor, line_m, _mapped_junctions(parts, log))
    start = nodes[-2:]
    left, right = np.asarray([node.matrix[12:15] for node in start])
    centre = (left + right) / 2
    reach = float(np.linalg.norm(left - right)) / 2 + gates.POST_GAP + gates.POST_W
    gate_roads = nearby_roads(centre[0], centre[2], reach)
    materials = gates.circuit_gate(gate_path, obj_dir, parts, gate_roads, start)
    return nodes + splits, base, line_m, sector_m, materials


def convert(obj_path, kn5_path, anchor_path=None, log=print, parts=None, prepare_output=None):
    """parts: make_obj's tile part files; else obj_path alone. The worker processes write their meshes as finished kn5
    bytes into intermediate files, the main process writes the header and the start points and appends them.
    Materials: all of the .mtl (fixed numbers for all processes; unused ones only cost their texture, < 35 MB).
    prepare_output(point_to_point): prepare the installed folder and return its kn5 path once the timing nodes
    have been placed. The flag indicates whether the model contains both A–B gates."""
    anchor = None
    if anchor_path and os.path.exists(anchor_path):
        with open(anchor_path, encoding="utf-8") as f:
            anchor = json.load(f)
    parts = parts or [obj_path]
    mtl = read_mtl(os.path.splitext(obj_path)[0] + ".mtl")
    used = sorted(mtl)
    mat_index = {m: i for i, m in enumerate(used)}
    route = (anchor or {}).get("route")
    start = (anchor or {}).get("start")
    circuit = (anchor or {}).get("kind") == "circuit"
    start_xz = ((route[0][0], -route[0][1]) if route else (start["x"], -start["y"]) if start else None)
    near_xz = None if start_xz is None else [start_xz]
    if circuit:
        near_xz = None      # split lines can be anywhere on the lap
    elif route and (anchor or {}).get("timing"):
        near_xz += timing_points(route, anchor["timing"])
    chunk_dir = os.path.join(os.path.dirname(os.path.abspath(obj_path)), "kn5_parts")
    os.makedirs(chunk_dir, exist_ok=True)
    try:
        chunks = [os.path.join(chunk_dir, f"{k}.bin") for k in range(len(parts))]
        jobs = list(zip(parts, chunks, [mat_index] * len(parts), [near_xz] * len(parts)))
        if len(parts) == 1:
            results = [_part_chunk(*jobs[0])]
        else:
            n = parallel.workers(len(parts))
            log(f"Meshes with {n} processes ...")
            with parallel.pool(n) as ex:
                results = list(ex.map(_part_chunk, *zip(*jobs), chunksize=max(1, len(parts) // (4 * n))))
        n_nodes = sum(r[0] for r in results)
        n_verts = sum(r[1] for r in results)
        objs = {}
        for _, _, roads, _, _ in results:
            objs.update(roads)
        if circuit:
            gate_obj = os.path.join(chunk_dir, "circuit_gate.obj")
            empties, base, line_m, sector_m, materials = _circuit_part(
                objs, anchor, parts, os.path.dirname(os.path.abspath(obj_path)), gate_obj, log)
            mat_index.update({m: len(used) + i for i, m in enumerate(materials)})
            mtl.update(materials)
            used.extend(materials)
            gate_chunk = os.path.join(chunk_dir, "circuit_gate.bin")
            gate = _part_chunk(gate_obj, gate_chunk, mat_index, None)
            chunks.append(gate_chunk)
            results.append(gate)
            n_nodes += gate[0]
            n_verts += gate[1]
        # JPG as DDS (dds_texture); PNG (alpha: trees, furniture, water) stays
        jpgs = sorted({mtl[m] for m in used if mtl[m].lower().endswith(".jpg")})
        bc7 = bc7_images(mtl, set().union(*(r[4] for r in results)))
        flags = [p in bc7 for p in jpgs]
        if len(jpgs) > 1:
            n = parallel.workers(len(jpgs))
            log(f"DDS textures with {n} processes ...")
            with parallel.pool(n) as ex:
                dds = dict(zip(jpgs, ex.map(dds_texture, jpgs, flags, chunksize=max(1, len(jpgs) // (4 * n)))))
        else:
            dds = {p: dds_texture(p, f) for p, f in zip(jpgs, flags)}
        tex = {m: dds.get(mtl[m]) or mtl[m] for m in used}
        textures, seen = [], set()      # (once per file: the 3 brightness levels of a facade colour share one texture)
        for m in used:
            if os.path.basename(tex[m]) not in seen:
                seen.add(os.path.basename(tex[m]))
                with open(tex[m], "rb") as f:
                    textures.append((os.path.basename(tex[m]), f.read()))
        materials = []
        for m in used:
            val = light_values(m)
            props = [(k, val[k], (0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0))
                     for k in ("ksAmbient", "ksDiffuse", "ksSpecular", "ksSpecularEXP")]
            props += [("ksEmissive", 0.0, (0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0)),
                      ("ksAlphaRef", ALPHA_REF.get(m, 0.0), (0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0))]
            if groundmaterial.is_ground(m):     # (its UVs: world tiles on a phased tile texture, scenery/ground.phased)
                props.extend(groundmaterial.uv_props())
            shader, alpha_tested = SHADERS.get(m, ("ksPerPixel", 0))
            material = kn5.Material(m, shader, 0, alpha_tested, 0, props,
                                   [("txDiffuse", 0, os.path.basename(tex[m]))])
            materials.append(groundmaterial.ground(material) if groundmaterial.is_ground(m) else material)
        if any(m.shader == groundmaterial.NM4 for m in materials):
            textures.extend(groundmaterial.textures())
        root = kn5.Node(1, "map2lap", 1, matrix=(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1))
        if not circuit:
            junctions = _mapped_junctions(parts, log) if route and (anchor or {}).get("timing") else None
            empties, base = start_empties(objs, anchor, log, junctions)
        if prepare_output is not None:
            kn5_path = prepare_output(route_race.has_gates({node.name for node in empties}))
        root.children += empties
        kn5.write_streamed(kn5_path, textures, materials, root, chunks, n_nodes)
    finally:
        shutil.rmtree(chunk_dir, ignore_errors=True)
    from track import groundnormals
    groundnormals.write(kn5_path)
    if (anchor or {}).get("ground_quality", "sd") == "hd":
        from track import groundquality
        groundquality.write(kn5_path, parts, log)
    objectlist.write(kn5_path, objectlist.merged([r[3] for r in results], [r[0] for r in results]), objectlist.collect_treefx(parts))
    editorinfo.install(kn5_path, parts)
    if circuit:
        anchor["timing"]["line_m"] = line_m
        anchor["timing"]["sector_m"] = sector_m
        with open(anchor_path, "w", encoding="utf-8") as f:
            json.dump(anchor, f)
    log(f"kn5: {kn5_path} ({n_nodes} meshes, {n_verts:,} vertices, "
        f"start at {base[0]:.1f} {base[1]:.1f} {base[2]:.1f})")
    return kn5_path


if __name__ == "__main__":       # (with obj/parts next to it: the tile part files, like generator.py)
    import glob
    _parts = sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "parts", "t_*.obj")))
    convert(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None, parts=_parts or None)
