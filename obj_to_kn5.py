"""Our own kn5 writer: OBJ (make_obj.py) -> .kn5, without Blender and ksEditor.

Modelled on a file written by ksEditor (kn5.py reads it completely):
- root node with an identity matrix, below it the meshes in world coordinates (Y up) and the empties
  (AC_START_n, AC_PIT_n, AC_HOTLAP_START_0, AC_TIME_0_L/R or AC_AB_*) as matrix nodes; the car faces local +Z.
- vertex: position, normal, UV (v negated), tangent; 16 bit indices (<= 65535 vertices per mesh).
- material ksPerPixel with ksAmbient, ksDiffuse, ksSpecular, ksSpecularEXP, ksEmissive, ksAlphaRef and txDiffuse.

    python obj_to_kn5.py <track.obj> <target.kn5> [anchor.json]
"""
import json
import math
import os
import shutil
import sys

import numpy as np

import kn5
import parallel

# Material values (tried in AC). About a fifth less ambient light than at first (it all looked a bit bright; before:
# ground and asphalt 0.45 / 0.35, buildings 0.45 / 0.35, trees 0.50 / 0.40); then 0.05 moved from the sun into the
# ambient light: the shadow sides were too dark, the sunlit sides stay as bright as before (ambient + sun the
# same)
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
# Billboards: alpha test shader, normals pointing up (evenly lit from all sides); gravel edge and arrows
# (roadtex.py): frayed or cut-out shape through the alpha test. Trees don't receive shadows (_NS, like Kunos'
# ksTree; they still cast them): with ksPerPixelAT every upright quad shadowed itself, diagonal stripes across all
# crowns, different with every viewing angle
SHADERS = {"trees": ("ksPerPixelAT_NS", 1), "edge_dirt": ("ksPerPixelAT", 1), "arrows": ("ksPerPixelAT", 1)}
UP_NORMALS = {"trees"}
VALUES["trees"] = {"ksAmbient": 0.42, "ksDiffuse": 0.36, "ksSpecular": 0.0, "ksSpecularEXP": 1.0}
VALUES["edge_dirt"] = VALUES["grass"]
VALUES["far"] = VALUES["grass"]
VALUES["arrows"] = VALUES["paint"]
VALUES["gate_band"] = VALUES["paint"]
ALPHA_REF = {"trees": 0.5, "edge_dirt": 0.5, "arrows": 0.5}
FACADE_LEVELS = (0.82, 1.0, 1.15)       # brightness levels of the facades (make_obj.FACADE_LEVELS)
MAX_VERTS = 65535
SLOTS, SLOT_GAP, START_LIFT = 4, 8.0, 0.15
# View distance (m) and shadows per kind of object, first matching name prefix. Without a limit AC drew every tile up
# to the horizon, kerbs and markings too (Völkermarkt–Vienna, 2419 tiles: 22 fps; Graz, 25 tiles: 90+).
# No shadows for flat and thin things (invisible, but every shadow cascade pays for them). AC measures from the mesh
# centre; the meshes are per tile, hence the bounding sphere radius is added.
# The terrain casts no shadows: it shadowed itself, rings around the camera on the asphalt. Trees, houses, pylons,
# bridges and tunnel tubes still cast them; hills no longer do.
VIEW = (
    ("1GRASS_ground", 6000.0, 0), ("1ROAD_ground", 6000.0, 0), ("1GRAVEL_ground", 6000.0, 0),
    ("1ROAD_deck", 6000.0, 1), ("1WALL_tunnel_grass", 6000.0, 1), ("nocol_water", 6000.0, 0),
    ("1WALL_props", 400.0, 1), ("nocol_props", 400.0, 1), ("1WALL_rocks", 900.0, 1),   # (before "1WALL_")
    ("1WALL_gate", 3000.0, 1), ("nocol_gate_band", 1500.0, 0), ("nocol_gate", 3000.0, 1),     # start/finish (gates.py)
    ("1WALL_pylon", 2500.0, 1), ("nocol_pylon", 2500.0, 1),     # high-voltage pylons (30 m high)
    ("nocol_bld_", 2000.0, 1), ("1WALL_", 2000.0, 1), ("1GRAVEL_rail", 2000.0, 0),
    ("nocol_trees", 1200.0, 1), ("nocol_rocks", 600.0, 1),
    ("nocol_road_", 400.0, 0), ("nocol_tunnel_paint", 400.0, 0), ("nocol_walk_", 400.0, 0),
    ("nocol_wire", 400.0, 0), ("nocol_rail_wood", 400.0, 0), ("nocol_rail_rail", 400.0, 0),
    ("nocol_rail_ballast", 2000.0, 0), ("nocol_rail_", 2000.0, 1), ("nocol_foam", 400.0, 0),
    ("nocol_guardrail", 800.0, 0),
    ("nocol_far", 100000.0, 0),                 # distant view (farview.py, up to 40 km around the corridor)
)
VIEW_DEFAULT = (2000.0, 1)


def view(name):
    """(view distance m, shadows) of an object by VIEW."""
    for start, dist, shadows in VIEW:
        if name.startswith(start):
            return dist, shadows
    return VIEW_DEFAULT


def dds_bc1(path):
    """JPG -> DDS (BC1/DXT1) with mipmaps down to 4 px, stored next to it (reused while newer than the JPG); returns the
    path or None (sides not a multiple of 4). AC unpacks JPG to RGBA in video memory: 2048 px = 22 MB with mipmaps,
    BC1 2.8 MB (Völkermarkt–Vienna: 2419 terrain textures, 53 GB -> 7 GB)."""
    import io
    import struct
    from PIL import Image
    out = os.path.splitext(path)[0] + ".dds"
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
        return out
    im = Image.open(path).convert("RGB")
    w0, h0 = w, h = im.size
    if w % 4 or h % 4:
        return None
    levels = []
    while True:
        b = io.BytesIO()
        im.save(b, "DDS", pixel_format="DXT1")
        levels.append(b.getvalue()[128:])       # (Pillow's header: 128 bytes, FourCC DXT1)
        if w <= 4 or h <= 4 or w % 8 or h % 8:
            break
        w, h = w // 2, h // 2
        im = im.resize((w, h), Image.BOX)
    head = struct.pack("<4s7I44x", b"DDS ", 124, 0xA1007, h0, w0, len(levels[0]), 0, len(levels))
    head += struct.pack("<2I4s5I", 32, 0x4, b"DXT1", 0, 0, 0, 0, 0) + struct.pack("<5I", 0x401008, 0, 0, 0, 0)
    tmp = out + ".tmp"
    with open(tmp, "wb") as f:
        f.write(head + b"".join(levels))
    os.replace(tmp, out)
    return out


def obj_index(s, n):
    """OBJ index (1-based, or negative relative to the n entries read so far) -> 0-based."""
    k = int(s)
    return k - 1 if k > 0 else n + k


def invisible(name):
    """Collision-only objects (make_obj.COL_ONLY: "<prefix>_walkcol_...", "<prefix>_bldcol_..."): not drawn."""
    parts = name.split("_")
    return len(parts) > 1 and parts[1].endswith("col")


def read_obj(path):
    """{object name: (material, positions (n,3), UVs (n,2), triangles (m,3))} in AC coordinates (OBJ is Y-up)."""
    V, VT, objs, cur = [], [], {}, None
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("v "):
                V.append(line.split()[1:4])
            elif line.startswith("vt "):
                VT.append(line.split()[1:3])
            elif line.startswith("o "):
                cur = {"mat": None, "f": []}
                objs[line.split()[1]] = cur
            elif line.startswith("usemtl "):
                cur["mat"] = line.split()[1]
            elif line.startswith("f "):         # (negative: relative to the end, make_obj writes them that way)
                cur["f"].append([tuple(obj_index(x, len(L)) for x, L in zip(p.split("/")[:2], (V, VT)))
                                 for p in line.split()[1:4]])
    V, VT = np.asarray(V, np.float64), np.asarray(VT, np.float64)
    out = {}
    for name, o in objs.items():
        F = np.asarray(o["f"], np.int64)            # (m, 3, 2): position and UV index
        keys, inv = np.unique(F.reshape(-1, 2), axis=0, return_inverse=True)
        out[name] = (o["mat"], V[keys[:, 0]], VT[keys[:, 1]], inv.reshape(-1, 3))
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


def mesh_nodes(name, mat_index, smooth, P, UV, T, up=False, skirts=False):
    """One or more mesh nodes (<= 65535 vertices each) with normals and tangents; up: all normals pointing up;
    skirts: skirts with the normal of the surface above (skirt_normals)."""
    if smooth:                      # shared vertices, area-weighted normals
        fn = face_normals(P, T)
        N = np.zeros_like(P)
        for k in range(3):
            np.add.at(N, T[:, k], fn)
    else:                           # hard edges: every face its own vertices (like ksEditor with FBX face normals)
        P, UV = P[T.ravel()], UV[T.ravel()]
        T = np.arange(len(P)).reshape(-1, 3)
        N = np.repeat(face_normals(P, T), 3, axis=0)
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)
    if up:
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


def road_height(objs, x, z, prefixes=("1ROAD_", "1GRAVEL_")):
    """Height of the road (1ROAD_*: terrain under asphalt/cobbles, bridges; 1GRAVEL_*: gravel) at the point (x, z), or
    None; with other prefixes the height of those objects (gates.py: grass too, for the posts)."""
    best = None
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
            y = (w1 * a[:, 1] + w2 * b[:, 1] + w3 * c[:, 1])[hit].max()
            best = y if best is None else max(best, y)
    return best


def route_slots(objs, route, n, gap, log=print):
    """n grid slots along the route (ENU polyline): slot 0 at the front, the others behind it; each (position,
    direction). If the route starts on a way that isn't built (driveway, car park aisle: BeamNG.Earth leaves them out),
    the slots move forward to the first place where all of them stand on road."""
    xy = np.asarray(route, float)
    seg = np.linalg.norm(np.diff(xy, axis=0), axis=1)
    s = np.r_[0.0, np.cumsum(seg)]

    def slot(d):
        x, y = np.interp(d, s, xy[:, 0]), np.interp(d, s, xy[:, 1])
        x2, y2 = np.interp(d + 5, s, xy[:, 0]), np.interp(d + 5, s, xy[:, 1])
        h = math.atan2(y2 - y, x2 - x)
        yy = road_height(objs, x, -y)
        return (np.array([x, yy, -y]) if yy is not None else None, np.array([math.cos(h), 0.0, -math.sin(h)]))

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


def timing_points(route, timing):
    """(x, z) in AC of the start and finish line (for the road objects start_empties needs)."""
    xy = np.asarray(route, float)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    return [(x, -y) for x, y, _ in (_along(xy, s, timing[k]) for k in ("start_m", "finish_m"))]


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
    for prefix, d0, step in (("AC_AB_START", timing["start_m"], 2.0), ("AC_AB_FINISH", timing["finish_m"], -2.0)):
        for d in d0 + step * np.arange(26):
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


def start_empties(objs, anchor, log=print):
    """Start right at the beginning of the route on the road (slots along the route); without a route at the asphalt
    point nearest the centre along the road's axis. With anchor["timing"] (point-to-point route) start and finish
    lines (ab_gates) instead of the lap line AC_TIME_0."""
    route = (anchor or {}).get("route")
    if route and len(route) > 1:
        slots = route_slots(objs, route, SLOTS, SLOT_GAP, log)
        if all(p is not None for p, _ in slots):
            nodes = []
            for k, (p, fwd) in enumerate(slots):
                pos = p + np.array([0.0, START_LIFT, 0.0])
                nodes.append(empty(f"AC_START_{k}", pos, fwd))
                nodes.append(empty(f"AC_PIT_{k}", pos, fwd))
            base, fwd = slots[0][0] + np.array([0.0, START_LIFT, 0.0]), slots[0][1]
            side = np.cross([0.0, 1.0, 0.0], fwd)
            nodes.append(empty("AC_HOTLAP_START_0", base, fwd))
            gates = ab_gates(objs, route, anchor["timing"], log) if anchor.get("timing") else []
            if gates:
                nodes += gates
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
    road objects near one of the points near_xz for the grid slots and the finish line; all if near_xz is None)."""
    objs = read_obj(path)
    n_nodes = n_verts = 0
    with open(chunk_path, "wb") as f:
        for name, (m, P, UV, T) in objs.items():
            if name.startswith("1WALL"):    # double-sided: AC only collides with the front, and BeamNG.Earth's
                T = np.r_[T, T[:, ::-1]]    # walls (bridge railings, some house walls) aren't wound consistently
            dist, shadows = view(name)
            for nd in mesh_nodes(name, mat_index[m], m in SMOOTH or m.startswith(("gc_", "ground_")), P, UV, T,
                                 up=m in UP_NORMALS, skirts=m == "far" or m.startswith("ground_far_")):
                nd.lod_out, nd.cast_shadows = dist + nd.bs_radius, shadows
                if invisible(name):     # (collision only: BeamNG.Earth's walkcol/bldcol)
                    nd.renderable, nd.cast_shadows = 0, 0
                for b in kn5.node_bytes(nd):
                    f.write(b)
                n_nodes, n_verts = n_nodes + 1, n_verts + len(nd.vertices)
    roads = {}
    for k, v in objs.items():
        if k.startswith(("1ROAD_", "1GRAVEL_")):
            P = v[1]
            if near_xz is None or any((np.hypot(P[:, 0] - x, P[:, 2] - z) < START_NEAR_M).any() for x, z in near_xz):
                roads[k] = v
    return n_nodes, n_verts, roads


def convert(obj_path, kn5_path, anchor_path=None, log=print, parts=None):
    """parts: make_obj's tile part files; else obj_path alone. The worker processes write their meshes as finished kn5
    bytes into intermediate files, the main process writes the header and the start points and appends them.
    Materials: all of the .mtl (fixed numbers for all processes; unused ones only cost their texture, < 35 MB)."""
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
    start_xz = ((route[0][0], -route[0][1]) if route else (start["x"], -start["y"]) if start else None)
    near_xz = None if start_xz is None else [start_xz]
    if route and (anchor or {}).get("timing"):
        near_xz += timing_points(route, anchor["timing"])
    chunk_dir = os.path.join(os.path.dirname(os.path.abspath(obj_path)), "kn5_parts")
    os.makedirs(chunk_dir, exist_ok=True)
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
    for _, _, roads in results:
        objs.update(roads)
    # JPG as DDS (dds_bc1); PNG (alpha: trees, furniture, water) stays
    jpgs = sorted({mtl[m] for m in used if mtl[m].lower().endswith(".jpg")})
    if len(jpgs) > 1:
        n = parallel.workers(len(jpgs))
        log(f"DDS textures with {n} processes ...")
        with parallel.pool(n) as ex:
            dds = dict(zip(jpgs, ex.map(dds_bc1, jpgs, chunksize=max(1, len(jpgs) // (4 * n)))))
    else:
        dds = {p: dds_bc1(p) for p in jpgs}
    tex = {m: dds.get(mtl[m]) or mtl[m] for m in used}
    textures, seen = [], set()      # (once per file: the 3 brightness levels of a facade colour share one texture)
    for m in used:
        if os.path.basename(tex[m]) not in seen:
            seen.add(os.path.basename(tex[m]))
            textures.append((os.path.basename(tex[m]), open(tex[m], "rb").read()))
    materials = []
    for m in used:
        val = VALUES.get(m, DEFAULT)
        if m.startswith(("gc_", "ground_")):    # comic ground and terrain texture per tile: light values like the meadow
            val = VALUES["grass"]
        # facades and walls <kind>_CC_L (make_obj.FACADE_SOURCE, WALL_SOURCE): brightness level L through the light values
        if m.startswith(("fac_", "shp_", "sid_", "stn_", "sti_", "tub_", "con_")):
            k = FACADE_LEVELS[int(m[-1])]
            val = {**DEFAULT, "ksAmbient": DEFAULT["ksAmbient"] * k, "ksDiffuse": DEFAULT["ksDiffuse"] * k}
        props = [(k, val[k], (0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0))
                 for k in ("ksAmbient", "ksDiffuse", "ksSpecular", "ksSpecularEXP")]
        props += [("ksEmissive", 0.0, (0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0)),
                  ("ksAlphaRef", ALPHA_REF.get(m, 0.0), (0.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0))]
        shader, alpha_tested = SHADERS.get(m, ("ksPerPixel", 0))
        materials.append(kn5.Material(m, shader, 0, alpha_tested, 0, props,
                                      [("txDiffuse", 0, os.path.basename(tex[m]))]))
    root = kn5.Node(1, "map2lap", 1, matrix=(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1))
    empties, base = start_empties(objs, anchor, log)
    root.children += empties
    try:
        kn5.write_streamed(kn5_path, textures, materials, root, chunks, n_nodes)
    finally:
        shutil.rmtree(chunk_dir, ignore_errors=True)
    log(f"kn5: {kn5_path} ({n_nodes} meshes, {n_verts:,} vertices, "
        f"start at {base[0]:.1f} {base[1]:.1f} {base[2]:.1f})")
    return kn5_path


if __name__ == "__main__":       # (with obj/parts next to it: the tile part files, like generator.py)
    import glob
    _parts = sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "parts", "t_*.obj")))
    convert(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None, parts=_parts or None)
