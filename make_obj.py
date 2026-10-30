"""Build the terrain and write all tiles (build_tiles.py) as OBJ part files plus materials.

Object names follow the AC convention: the name decides the driving surface (1ROAD_, 1KERB_, 1GRASS_, 1WALL_), objects
without a digit at the start have no collision (markings, wires). Coordinates: Y up (x, z, -y).

    python make_obj.py
"""
import glob
import json
import os
import shutil
import struct
import sys
from concurrent.futures import as_completed

import numpy as np

SERVER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vendor", "beamng_earth", "server")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SERVER)
os.chdir(SERVER)

import blockworker          # noqa: E402
import cdae                 # noqa: E402
import geodesy              # noqa: E402
import roads as roadsmod    # noqa: E402
sys.path.insert(1, HERE)
import facades              # noqa: E402
import groundcover          # noqa: E402
import parallel             # noqa: E402
import propsmesh            # noqa: E402
import roadtex              # noqa: E402
import ground               # noqa: E402
import rocks                # noqa: E402
import trees                # noqa: E402
import vegetation           # noqa: E402
import water                # noqa: E402

TILES = os.path.join(HERE, "out", "tiles")
OUT = os.path.join(HERE, "out", "obj")
TEX_SRC = os.path.join(HERE, "assets", "textures")
CELL = 2.0                  # m, terrain grid (like BeamNG.Earth's physics block)
TERRAIN_UV_M = 8.0          # m per repeat of the grass texture
MAX_VERTS = 65000           # kn5: 16 bit indices per mesh
# m: terrain under the roads lower than the road surface (fading out sideways, grading.apply with a negative lift).
# At 0 (road only 4 cm above) the sloping 2 m terrain triangles poked through the asphalt as green jags at the edge.
TERRAIN_SINK = 0.0         # (0.12 tested: the road looked too high and the jags stayed -> another cause)

# BeamNG material -> (AC surface or None for "no collision", our material)
SURFACE = {
    "road_asphalt_2lane": ("1ROAD", "asphalt"), "italy_cobblestone": ("1ROAD", "cobble"),
    "gutter1": ("1ROAD", "concrete"), "m_metal_grid_drain": ("1ROAD", "concrete"),
    "line_white": (None, "paint"), "line_dashed_long": (None, "paint"), "crossing_white": (None, "paint"),
    "sidewalk1": ("1ROAD", "sidewalk"), "tactile_indicator": ("1ROAD", "sidewalk"), "curbs": ("1KERB", "kerbstone"),
    "bne_bld_facade": ("1WALL", "plaster"), "bne_bld_shop": ("1WALL", "plaster2"), "bne_bld_siding": ("1WALL", "plaster"),
    "bne_bld_panel": ("1WALL", "plaster"), "bne_bld_metalwall": ("1WALL", "concrete"), "bne_bld_stone": ("1WALL", "bricks"),
    "bne_bld_roof_slate": ("1WALL", "roof"), "bne_bld_roof_metal": ("1WALL", "roof"), "bne_bld_roof_flat": ("1WALL", "concrete"),
    "bne_tunnel_stone": ("1WALL", "concrete"), "bne_tunnel_stone_in": ("1WALL", "concrete"),
    "bne_tunnel_soil": ("1WALL", "grass"),      # (BeamNG.Earth: grass texture, tunnel.materials.json)
    "bne_bridge_concrete": ("1WALL", "concrete"), "bne_wire": (None, "wire"),
    "bne_bridge_asphalt": ("1ROAD", "asphalt"),     # (road on bridges: as a wall you'd have crashed into it)
    "m_dirt_road": ("1GRAVEL", "dirt"),         # (OSM surface=gravel/unpaved/dirt: its own surface, less grip)
    "bne_bld_marble": ("1WALL", "concrete"),
    "bne_tunnel_inner": ("1WALL", "concrete"), "bne_tunnel_light": (None, "paint"),
    # (first seen in Vienna; before, everything FALLBACK = wall: you crashed into tram rails in the road)
    "road_gravel": ("1GRAVEL", "dirt"), "road_tramline": ("1ROAD", "asphalt"),
    "bne_rail_ballast": ("1GRAVEL", "ballast"), "bne_rail_ballast_grown": ("1GRAVEL", "ballast"),
    "bne_rail_ballast_weedy": ("1GRAVEL", "ballast"),
    "bne_rail_sleeper": (None, "wood"), "bne_rail_sleeper_old": (None, "wood"),    # (flat on the gravel)
    "bne_rail_steel": (None, "rail"), "bne_rail_steel_old": (None, "rail"),
    "bne_bld_brick": ("1WALL", "bricks"), "bne_bld_office": ("1WALL", "plaster2"),
    "bne_truss_steel": ("1WALL", "rail"),
    "m_gm_concrete_plain": ("1WALL", "concrete"), "m_gm_metal_hotspotting": ("1WALL", "rail"),
    # (since BeamNG.Earth 1.7.1: gravel edge on roads without kerbs, turn arrows, plaster walls; roadtex.py)
    "ECA_road_edge_dirt": (None, "edge_dirt"), "roadmarkings1": (None, "arrows"),
    "bne_bld_stucco": ("1WALL", "plaster"),
}
FALLBACK = ("1WALL", "concrete")
# Collision as in the BeamNG mod (mod/.../roads.lua: createWalk): "road" visual only (you drive on the terrain),
# "deck" (bridges, tunnel floor), "tunnel" (tubes, portals, retaining walls) and "rail" visible with collision; "walk"
# and "bld*" visible, their collision is the invisible copy "walkcol"/"bldcol" (without the copy they collide
# themselves); "wire" visual only. (walkcol/bldcol used to be dropped as "duplicates" and "tunnel" hidden.)
COLLIDE = {"deck", "tunnel", "rail"}
COL_ONLY = {"walkcol": "1KERB", "bldcol": "1WALL"}      # invisible (obj_to_kn5: name "<prefix>_<x>col_...")
RENDER_ONLY = {"road", "wire"}


def collision_prefix(what, surf, data):
    """AC object prefix of a part of the tile (what) with the surface surf from SURFACE: driving surface, wall or
    "nocol" (visual only)."""
    if what in COL_ONLY:
        return COL_ONLY[what]
    base = what.rstrip("0123456789")            # (bld2, bld3 ...)
    if what in RENDER_ONLY or not surf:
        return "nocol"
    if base in ("walk", "bld", "rail") and f"{base}col" in data:    # (railcol: since BeamNG.Earth 1.7.1)
        return "nocol"
    return surf


MATERIALS = {   # our material -> (texture or None, base colour)
    "asphalt": ("Asphalt031", (1, 1, 1)), "cobble": ("PavingStones151", (1, 1, 1)),
    "concrete": ("Concrete034", (1, 1, 1)), "plaster": ("Plaster001", (1, 1, 1)),
    "plaster2": ("PaintedPlaster017", (1, 1, 1)), "bricks": ("Bricks108A", (1, 1, 1)),
    "roof": ("RoofingTiles013A", (1, 1, 1)), "grass": ("Grass005", (1, 1, 1)),
    "paint": (None, (0.9, 0.9, 0.9)), "wire": (None, (0.05, 0.05, 0.05)),
    "sidewalk": ("Concrete034", (1, 1, 1)), "kerbstone": ("Concrete034", (1, 1, 1)),
    "dirt": ("Ground037", (1, 1, 1)), "ballast": ("Gravel043", (1, 1, 1)),
    "wood": (None, (0.36, 0.27, 0.2)), "rail": (None, (0.42, 0.4, 0.38)),
    "water": ("@water", (1, 1, 1)), "foam": ("@foam", (1, 1, 1)),    # comic water (water.make_textures)
    "trees": ("@trees", (1, 1, 1)),             # (the atlas is made by trees.make_atlas)
    "props": ("@props", (1, 1, 1)),             # street furniture (propsmesh.make_atlas)
    "edge_dirt": ("@edge", (1, 1, 1)), "arrows": ("@arrows", (1, 1, 1)),     # (roadtex.py)
    "rock": ("@rock", (1, 1, 1)),               # boulders (rocks.py): the ground's comic rock
}
for _g in list(groundcover.CLASS_MAT.values()) + [f"gc_field{k}" for k in range(groundcover.FIELD_VARIANTS)]:
    if _g != "gc_field":
        MATERIALS[_g] = ("@gc", (1, 1, 1))      # comic ground (groundcover.make_textures)
for _c in range(12):                            # facades <kind>_CC_L (FACADE_COLORS; L: brightness in the kn5)
    for _l in range(3):
        for _kind in ("fac", "shp", "sid"):
            MATERIALS[f"{_kind}_{_c:02d}_{_l}"] = (f"@facade:{_c}:{_kind}", (1, 1, 1))
# colour factors per texture (the meadow looked glaring yellow-green in AC)
TINT = {"grass": (0.72, 0.82, 0.62)}
FACADE_TEX_PX = 1024                            # (12 facade textures: smaller than the 2K originals)
# texture darkened (factor): Concrete034 looked almost white on pavements in AC
DARKEN = {"sidewalk": 0.55, "kerbstone": 0.7}


class Obj:
    """OBJ writer; positions in ENU (x east, y north, z up). Faces with relative (negative) indices as in the OBJ
    standard: the worker processes' tile part files can simply be concatenated."""

    def __init__(self, path, header=True):
        self.f = open(path, "w", encoding="utf-8")
        if header:
            self.f.write("mtllib track.mtl\n")
        self.nv = 0
        self.objects = 0

    def add(self, name, mat, P, UV, T):
        for s in range(0, len(T), MAX_VERTS // 3):          # (triangles per part: at most MAX_VERTS vertices)
            t = T[s:s + MAX_VERTS // 3]
            used, inv = np.unique(t.ravel(), return_inverse=True)
            p, uv, t = P[used], UV[used], inv.reshape(-1, 3) - len(used)
            part = name if s == 0 else f"{name}_{s // (MAX_VERTS // 3)}"
            self.f.write(f"o {part}\nusemtl {mat}\n")
            self.f.write("".join(f"v {x:.3f} {z:.3f} {-y:.3f}\n" for x, y, z in p))
            self.f.write("".join(f"vt {u:.4f} {v:.4f}\n" for u, v in uv))
            self.f.write("".join(f"f {a}/{a} {b}/{b} {c}/{c}\n" for a, b, c in t))
            self.nv += len(p)
            self.objects += 1

    def close(self):
        self.f.close()


def shape_parts(path, pos):
    """(BeamNG material name, P, UV, T, vertex colours (n, 4) or None) per primitive of a .cdae, moved by pos.
    Per object only its finest level of detail: BeamNG.Earth's building tiles have two (buildings.write: the full mesh
    from 2700 px, a simplified one below), the game only ever shows one. Taking both, they lay on top of each other
    and the windows flickered."""
    s = cdae.read(path)
    names = [m["name"] for m in s["materials"]]
    n_obj, size, data = s["objects"]
    for k in range(n_obj):
        _, num, start = struct.unpack_from("<3i", data, k * size)
        # (Torque: an object's meshes by level of detail, the finest first; a pure collision shape has a null mesh, type
        # 4, as its visible level, then the collision mesh)
        m = next((m for m in s["meshes"][start:start + num] if m.get("type") == 0), None)
        if m is None:
            continue
        arr = cdae.mesh_arrays(m)
        P = arr["verts"].astype(np.float64) + np.asarray(pos, np.float64)
        UV = arr["tverts"].astype(np.float64)
        n_col, _, col_data = m["colors"]
        C = np.frombuffer(col_data, np.uint8).reshape(-1, 4) if n_col == len(P) else None
        for start, count, mat in arr["primitives"]:
            T = arr["indices"][start:start + count].astype(np.int64).reshape(-1, 3)
            # BeamNG/Torque winds the front clockwise (measured: 0 % of the road normals pointing up), OBJ/FBX
            # counter-clockwise: flip them, else the normals point inwards (black houses)
            yield names[mat & 0x0FFFFFFF], P, UV, T[:, ::-1], C


# Facades: every house (recognised by its BeamNG vertex colour, else by its position) gets one of 12 colours in
# 3 brightness levels for good. Colour = tinted plaster texture (facade_NN), brightness = material values
# (obj_to_kn5.FACADE_LEVELS). BeamNG material -> facade kind: fac = residential facade with windows in BeamNG's grid,
# shp = shop (shop windows), sid = family house wall (tiled world-wide, no windows: those come as faces of their
# own from bne_bld_facade)
FACADE_SOURCE = {"bne_bld_facade": "fac", "bne_bld_panel": "fac", "bne_bld_shop": "shp", "bne_bld_siding": "sid",
                 "bne_bld_stucco": "sid"}     # (plaster: windows come from bne_bld_facade like with siding)
FACADE_COLORS = [   # Carinthian townscape
    (0.96, 0.95, 0.92), (0.95, 0.91, 0.80), (0.97, 0.92, 0.66), (0.90, 0.76, 0.46), (0.98, 0.84, 0.36),
    (0.97, 0.80, 0.64), (0.93, 0.70, 0.62), (0.90, 0.76, 0.76), (0.80, 0.86, 0.72), (0.76, 0.82, 0.86),
    (0.80, 0.80, 0.79), (0.86, 0.80, 0.68)]
FACADE_LEVELS = 3


def facade_material(key, kind="fac", colors=len(FACADE_COLORS)):
    h = (int(key) * 2654435761) & 0xFFFFFFFF
    return f"{kind}_{h % colors:02d}_{(h // 97) % FACADE_LEVELS}"


def facade_split(P, T, C, kind="fac"):
    """{material: triangles} of the facade triangles, one colour per house (the same colour for all kinds of a house)."""
    if C is not None:
        c = C[T[:, 0]].astype(np.int64)
        keys = (c[:, 0] << 16) | (c[:, 1] << 8) | c[:, 2]
    else:                           # (without vertex colours: position rounded to 12 m)
        cen = P[T].mean(axis=1)
        keys = (np.floor(cen[:, 0] / 12).astype(np.int64) * 7919) ^ np.floor(cen[:, 1] / 12).astype(np.int64)
    out = {}
    for k in np.unique(keys):
        out.setdefault(facade_material(k, kind), []).append(T[keys == k])
    return {m: np.concatenate(ts) for m, ts in out.items()}


# Walls: BeamNG.Earth tints them itself (mod/.../tunnel.materials.json, baseColorFactor): portals and retaining walls
# ashlar (0.92/0.86/0.80), darker in flat vaults (0.50/0.47/0.44), the tunnel tube dark concrete (0.36/0.33/0.29),
# bridges concrete (0.82/0.80/0.77). Untinted Concrete034 (mean 0.72, hardly any structure) was glaring white in AC.
# So tinted like that, and like the facades each connected part (a portal, a wall, a bridge) gets one of WALL_TONES
# tones in FACADE_LEVELS brightness levels.
WALL_SOURCE = {"bne_tunnel_stone": "stn", "bne_tunnel_stone_in": "sti", "bne_tunnel_inner": "tub",
               "bne_bridge_concrete": "con"}
CONCRETE_TONES = [(0.60, 0.59, 0.57), (0.54, 0.54, 0.53), (0.57, 0.54, 0.49), (0.50, 0.52, 0.54), (0.47, 0.46, 0.44),
                  (0.56, 0.55, 0.50)]     # (texture mean: lighter, neutral, warmer, cooler, weathered concrete)
STONE_TONES = [(0.48, 0.48, 0.47), (0.58, 0.50, 0.38), (0.50, 0.45, 0.39), (0.52, 0.43, 0.38), (0.40, 0.38, 0.35),
               (0.60, 0.57, 0.52)]        # (granite, sandstone, warm, reddish, dark, limestone)
WALL_TONES = 6
# kind -> (template, contrast of its structure, tones, factor); Concrete034 has almost no structure (2 % deviation)
WALL_KINDS = {"con": ("Concrete034", 3.0, CONCRETE_TONES, 1.0), "tub": ("Concrete034", 3.0, CONCRETE_TONES, 0.55),
              "stn": ("Bricks108A", 1.0, STONE_TONES, 1.0), "sti": ("Bricks108A", 1.0, STONE_TONES, 0.55)}
WALL_TEX_PX = 512
for _kind in WALL_KINDS:                        # walls <kind>_TT_L (WALL_KINDS; L: brightness in the kn5)
    for _c in range(WALL_TONES):
        for _l in range(FACADE_LEVELS):
            MATERIALS[f"{_kind}_{_c:02d}_{_l}"] = (f"@wall:{_kind}:{_c}", (1, 1, 1))


def _pieces(P, T):
    """Number of the connected part per triangle (vertices at the same place, to 1 cm, count as connected)."""
    _, vid = np.unique(np.round(P * 100).astype(np.int64), axis=0, return_inverse=True)
    t = vid.ravel()[T]
    lab = np.arange(int(t.max()) + 1)
    while True:                 # (pass the smallest number along the triangles, then let the pointers jump)
        new = lab.copy()
        np.minimum.at(new, t.ravel(), np.repeat(lab[t].min(axis=1), 3))
        new = new[new]
        if np.array_equal(new, lab):
            return lab[t[:, 0]]
        lab = new


def wall_split(P, T, kind):
    """{material: triangles} of the wall triangles, one tone and one brightness per connected part (by the position of
    its centre, to 1 m: the same on every build)."""
    piece = _pieces(P, T)
    out = {}
    for p in np.unique(piece):
        t = T[piece == p]
        c = np.floor(P[np.unique(t)].mean(axis=0)).astype(np.int64)
        key = (int(c[0]) * 73856093) ^ (int(c[1]) * 19349663) ^ (int(c[2]) * 83492791)
        out.setdefault(facade_material(key, kind, WALL_TONES), []).append(t)
    return {m: np.concatenate(ts) for m, ts in out.items()}


def write_mtl(path, tex_dir, ground_mats=()):
    """Every material gets a texture: ksEditor aborts the export on a material without txDiffuse ("NULL TEXTURE ON
    MATERIAL ... EXPORT FAILED"); single-colour materials get a small PNG of their colour."""
    from PIL import Image
    os.makedirs(tex_dir, exist_ok=True)
    made = set()                            # (wall textures: once per file, the 3 brightness levels share it)
    with open(path, "w", encoding="utf-8") as f:
        for name in ground_mats:            # (terrain texture per tile, ground.build)
            f.write(f"newmtl {name}\nKd 1 1 1\nmap_Kd textures/{name}.jpg\n\n")
        for name, (tex, kd) in MATERIALS.items():
            f.write(f"newmtl {name}\nKd {kd[0]} {kd[1]} {kd[2]}\n")
            if tex == "@trees":
                trees.make_atlas(os.path.join(tex_dir, "trees.png"))
                f.write("map_Kd textures/trees.png\n\n")
            elif tex == "@props":
                propsmesh.make_atlas(os.path.join(tex_dir, "props.png"))
                f.write("map_Kd textures/props.png\n\n")
            elif tex in ("@edge", "@arrows"):
                png = os.path.join(tex_dir, f"{name}.png")
                if not os.path.exists(png):
                    (roadtex.make_edge if tex == "@edge" else roadtex.make_arrows)(png)
                f.write(f"map_Kd textures/{name}.png\n\n")
            elif tex in ("@gc", "@rock"):
                if not os.path.exists(os.path.join(tex_dir, "gc_meadow.png")):
                    groundcover.make_textures(tex_dir)
                f.write(f"map_Kd textures/{'gc_rock' if tex == '@rock' else name}.png\n\n")
            elif tex in ("@water", "@foam"):
                if not os.path.exists(os.path.join(tex_dir, "water.png")):
                    water.make_textures(os.path.join(tex_dir, "water.png"), os.path.join(tex_dir, "foam.png"))
                f.write(f"map_Kd textures/{tex[1:]}.png\n\n")
            elif tex and tex.startswith("@facade:"):
                _, c, kind = tex.split(":")
                c = int(c)
                fname = f"facade_{kind}_{c:02d}.jpg"
                out = os.path.join(tex_dir, fname)
                if not os.path.exists(out):     # tinted plaster (+ windows or shop windows, facades.py)
                    src = glob.glob(os.path.join(TEX_SRC, "Plaster001", "*_Color.jpg"))[0]
                    img = facades.plaster(Image.open(src), FACADE_COLORS[c])
                    img = {"fac": facades.windowed, "shp": facades.shopfront}.get(kind, lambda i: i)(img)
                    img.save(out, quality=90)
                f.write(f"map_Kd textures/{fname}\n\n")
            elif tex and tex.startswith("@wall:"):
                _, kind, c = tex.split(":")
                fname = f"wall_{kind}_{int(c):02d}.jpg"
                if fname not in made:           # tinted concrete or stone (WALL_KINDS)
                    made.add(fname)
                    src, contrast, tones, k = WALL_KINDS[kind]
                    src = glob.glob(os.path.join(TEX_SRC, src, "*_Color.jpg"))[0]
                    facades.tinted(Image.open(src), [v * k for v in tones[int(c)]], contrast, WALL_TEX_PX).save(
                        os.path.join(tex_dir, fname), quality=90)
                f.write(f"map_Kd textures/{fname}\n\n")
            elif tex and name in TINT:
                src = glob.glob(os.path.join(TEX_SRC, tex, "*_Color.jpg"))[0]
                a = np.asarray(Image.open(src).convert("RGB"), np.float32) * np.asarray(TINT[name])
                Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(tex_dir, f"{name}.jpg"),
                                                                           quality=92)
                f.write(f"map_Kd textures/{name}.jpg\n\n")
            elif name == "asphalt":     # like the asphalt painted into the terrain (ground.ROAD_LOOKS): scaled to
                fname = "asphalt_ground.jpg"    # 12.5 cm/px and darkened; at full resolution the bridges
                src, rep, bright = ground.ROAD_LOOKS[ground.DECK_LOOK]  # looked like a different surface
                px = int(round(rep / (ground.TILE / ground.TEX_PX)))
                a = ground._texture(os.path.join(tex_dir, f"{src}.png"), px)     # (roadtex.make_surfaces)
                Image.fromarray(np.clip(a * bright, 0, 255).astype(np.uint8)).save(
                    os.path.join(tex_dir, fname), quality=95)
                f.write(f"map_Kd textures/{fname}\n\n")
            elif tex and name in DARKEN:
                src = glob.glob(os.path.join(TEX_SRC, tex, "*_Color.jpg"))[0]
                img = Image.open(src).convert("RGB")
                img.point(lambda v, k=DARKEN[name]: int(v * k)).save(os.path.join(tex_dir, f"{name}.jpg"), quality=92)
                f.write(f"map_Kd textures/{name}.jpg\n\n")
            elif tex:
                src = glob.glob(os.path.join(TEX_SRC, tex, "*_Color.jpg"))[0]
                shutil.copy2(src, os.path.join(tex_dir, f"{tex}.jpg"))
                f.write(f"map_Kd textures/{tex}.jpg\n\n")
            else:
                rgb = tuple(int(round(c * 255)) for c in kd)
                Image.new("RGB", (16, 16), rgb).save(os.path.join(tex_dir, f"solid_{name}.png"))
                f.write(f"map_Kd textures/solid_{name}.png\n\n")


_ctx = {}                       # per worker process: anchor, terrain, vegetation (_init_scenery)


def _init_scenery(tiles_dir, tex_dir):
    with open(os.path.join(tiles_dir, "anchor.json"), encoding="utf-8") as f:
        anc = json.load(f)
    blockworker._s = blockworker._State(os.path.join(HERE, "cache"), offline=False, roads=True, grading=True,
                                        road_widths=True, surface=True)
    g, _ = blockworker._s.anchor(anc["aid"], anc["lat"], anc["lon"])
    frame = geodesy.EnuFrame(anc["lat"], anc["lon"])
    dem = blockworker._s.dem

    def elev(la, lo):           # visible ground: levelled and lowered under the roads (TERRAIN_SINK)
        z = blockworker.ground(frame, la, lo, dem.sample(la, lo, anc["dem_zoom"]))
        return g.apply(la, lo, z, -TERRAIN_SINK) if g is not None else z

    def raw(la, lo):            # terrain without levelling (for the water level)
        return blockworker.ground(frame, la, lo, dem.sample(la, lo, anc["dem_zoom"]))

    veg = vegetation.Vegetation(blockworker._s.md, os.path.join(HERE, "cache"))
    veg.dem = dem               # (rocks by slope)
    _ctx.update(anc=anc, tiles_dir=tiles_dir, frame=frame, elev=elev, raw=raw, veg=veg, g=g, tex_dir=tex_dir)


def main(tiles_dir=TILES, out_dir=OUT, log=print, progress=None):
    """OBJ from the tiles in tiles_dir (anchor.json), tile by tile in several processes: one part file each in
    out_dir/parts, the materials in out_dir/track.mtl; returns (objects, vertices, triangles, part files in tile
    order)."""
    with open(os.path.join(tiles_dir, "anchor.json"), encoding="utf-8") as f:
        tiles = [tuple(t) for t in json.load(f)["tiles"]]
    parts_dir = os.path.join(out_dir, "parts")
    os.makedirs(parts_dir, exist_ok=True)
    parts = [os.path.join(parts_dir, f"t_{tx}_{ty}.obj") for tx, ty in tiles]
    tex_dir = os.path.join(out_dir, "textures")
    os.makedirs(tex_dir, exist_ok=True)
    groundcover.make_textures(tex_dir)      # (before the worker processes: they paint the terrain textures with them)
    roadtex.make_surfaces(tex_dir)          # (... and the roads)
    n = parallel.workers(len(tiles))
    log(f"Scenery with {n} processes ...")
    objects, nv, tris, unknown = 0, 0, {}, set()
    with parallel.pool(n, _init_scenery, (tiles_dir, tex_dir)) as ex:
        futs = [ex.submit(_scenery_job, tx, ty, p) for (tx, ty), p in zip(tiles, parts)]
        for k, fut in enumerate(as_completed(futs), 1):
            o, v, t, u, msgs = fut.result()
            objects, nv = objects + o, nv + v
            for key, c in t.items():
                tris[key] = tris.get(key, 0) + c
            unknown |= u
            for m in msgs:
                log(m)
            if progress is not None:
                progress("scenery", k, len(tiles))
            if k == len(tiles) or k % max(1, len(tiles) // 20) == 0:
                log(f"Scenery: tile {k}/{len(tiles)}")
    write_mtl(os.path.join(out_dir, "track.mtl"), tex_dir, [f"ground_{tx}_{ty}" for tx, ty in tiles])
    log(f"Scenery: {objects} objects, {nv:,} vertices")
    log("Triangles: " + ", ".join(f"{k} {v:,}" for k, v in tris.items()))
    if unknown:
        log(f"Unknown materials (used as wall/concrete): {sorted(unknown)}")
    return objects, nv, tris, parts


def _scenery_job(tx, ty, part_path):
    """_scenery_tile, repeated as a whole when a cache file (terrain, water) is locked."""
    return parallel.retry_locked(lambda: _scenery_tile(tx, ty, part_path))


def _scenery_tile(tx, ty, part_path):
    """Terrain, water, ground, roads, houses, furniture and trees of one tile into part_path (worker process);
    returns (objects, vertices, triangles per prefix, unknown materials, messages)."""
    anc, tiles_dir, frame, elev, raw, veg = (_ctx[k] for k in ("anc", "tiles_dir", "frame", "elev", "raw", "veg"))
    obj = Obj(part_path, header=False)
    unknown, tris, msgs = set(), {}, []
    log = msgs.append
    depth, wmesh, fmesh = water.water_tile(frame, blockworker._s.md, raw, tx, ty, CELL)
    with open(os.path.join(tiles_dir, f"roads_{anc['aid']}_{tx}_{ty}.json"), encoding="utf-8") as f:
        data = json.load(f)
    shapes = [(what, list(shape_parts(os.path.join(tiles_dir, os.path.basename(v["shape"])), v["pos"])))
              for what, v in data.items() if isinstance(v, dict) and "shape" in v]
    # terrain like BeamNG.Earth's terrain block: looks and physics in one, roads as texture (ground.py)
    gmat = f"ground_{tx}_{ty}"
    P, UV, ggroups, _ = ground.build(frame, anc["aid"], tx, ty, _ctx["g"], blockworker._s.dem, anc["dem_zoom"],
                                     depth, blockworker._s.md, TEX_SRC, _ctx["tex_dir"],
                                     os.path.join(_ctx["tex_dir"], f"{gmat}.jpg"), log)
    for pre, T in ggroups.items():
        obj.add(f"{pre}_ground_{tx}_{ty}", gmat, P, UV, T)
        tris[pre] = tris.get(pre, 0) + len(T)
    if wmesh is not None:
        obj.add(f"nocol_water_{tx}_{ty}", "water", *wmesh)
        tris["water"] = tris.get("water", 0) + len(wmesh[2])
    if fmesh is not None:
        obj.add(f"nocol_foam_{tx}_{ty}", "foam", *fmesh)     # (own name: CSP filter nocol_water_? for the animation)
        tris["water"] = tris.get("water", 0) + len(fmesh[2])

    x0, y0, _, _ = roadsmod.tile_bbox(tx, ty)
    wet = None
    if depth is not None:
        def wet(x, y, d=depth, x0=x0, y0=y0):
            i = min(depth.shape[1] - 1, max(0, int(round((x - x0) / CELL))))
            j = min(depth.shape[0] - 1, max(0, int(round((y - y0) / CELL))))
            return d[j, i] > 0
    road_xy = []                # road points of the tile (street light arms point to the nearest one)
    for what, parts_ in shapes:
        groups = {}
        for bname, P, UV, T, C in parts_:
            if what == "road":  # (markings: the road itself is terrain texture now)
                road_xy.append(P[np.unique(T), :2])
            if bname in FACADE_SOURCE:
                for mat, t in facade_split(P, T, C, FACADE_SOURCE[bname]).items():
                    groups.setdefault(("1WALL", mat), []).append((P, UV, t))
                continue
            if bname in WALL_SOURCE:
                for mat, t in wall_split(P, T, WALL_SOURCE[bname]).items():
                    groups.setdefault((SURFACE[bname][0], mat), []).append((P, UV, t))
                continue
            if bname not in SURFACE:
                unknown.add(bname)
            surf, mat = SURFACE.get(bname, FALLBACK)
            key = (surf, mat)
            groups.setdefault(key, []).append((P, UV, T))
        for (surf, mat), parts in groups.items():
            P = np.concatenate([p for p, _, _ in parts])
            UV = np.concatenate([uv for _, uv, _ in parts])
            off = np.cumsum([0] + [len(p) for p, _, _ in parts[:-1]])
            T = np.concatenate([t + o for (_, _, t), o in zip(parts, off)])
            prefix = collision_prefix(what, surf, data)
            obj.add(f"{prefix}_{what}_{mat}_{tx}_{ty}", mat, P, UV, T)
            tris[prefix] = tris.get(prefix, 0) + len(T)

    street_trees = []           # street furniture (propsmesh.py): poles/street lights/sign posts with collision
    if data.get("props"):
        try:
            solid, deco, street_trees = propsmesh.build(
                data["props"]["groups"], data["props"]["items"],
                np.concatenate(road_xy) if road_xy else None)
            for prefix, mesh in (("1WALL", solid), ("nocol", deco)):
                if mesh is not None:
                    obj.add(f"{prefix}_props_{tx}_{ty}", "props", *mesh)
                    tris["props"] = tris.get("props", 0) + len(mesh[2])
            solid, deco = propsmesh.pylons(data["props"]["groups"], data["props"]["items"])  # high-voltage pylons
            for prefix, mesh in (("1WALL", solid), ("nocol", deco)):
                if mesh is not None:
                    obj.add(f"{prefix}_pylon_{tx}_{ty}", "props", *mesh)
                    tris["pylons"] = tris.get("pylons", 0) + len(mesh[2])
        except Exception as e:
            log(f"Street furniture, tile {tx},{ty}: {type(e).__name__}: {e}")
    if data.get("guardrails"):  # guardrails, concrete barriers, cable barriers (since BeamNG.Earth 1.7.1, propsmesh.rails)
        try:
            deco, col = propsmesh.rails(data["guardrails"]["groups"], data["guardrails"]["items"])
            for name, mesh in ((f"nocol_guardrail_{tx}_{ty}", deco), (f"1WALL_guardrailcol_{tx}_{ty}", col)):
                if mesh is not None:
                    obj.add(name, "props", *mesh)
                    tris["guardrail"] = tris.get("guardrail", 0) + len(mesh[2])
        except Exception as e:
            log(f"Guard rails, tile {tx},{ty}: {type(e).__name__}: {e}")
    try:
        items = parallel.retry_locked(lambda: trees.tile_items(frame, tx, ty, veg, elev))
    except Exception as e:      # (missing tree data shouldn't stop the track)
        log(f"Trees, tile {tx},{ty}: {type(e).__name__}: {e}")
        items = []
    extra = [("deciduous", x, y, z, yaw, h, rank) for x, y, z, yaw, h, rank in street_trees]
    tmesh = trees.billboards(items + extra, wet)
    if tmesh is not None:
        obj.add(f"nocol_trees_{tx}_{ty}", "trees", *tmesh)
        tris["trees"] = tris.get("trees", 0) + len(tmesh[2])
    for prefix, mesh in rocks.meshes(items, wet).items():     # boulders (rocks.py)
        obj.add(f"{prefix}_rocks_{tx}_{ty}", rocks.MATERIAL, *mesh)
        tris["rocks"] = tris.get("rocks", 0) + len(mesh[2])
    obj.close()
    return obj.objects, obj.nv, tris, unknown, msgs


if __name__ == "__main__":
    main()
