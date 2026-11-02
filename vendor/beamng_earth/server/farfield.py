"""Render-only dynamic-LOD tiles: the far field, and in mesh mode the near ground too
(docs/V1_2_DESIGN.md §2, §3, §6; docs/V1_3_SPEC.md §A, §B; V1_1_SPEC 2).

A quadtree in the current anchor's ENU plane. Tile (L, i, j) is 256*2^L m wide and covers
[i*S, (i+1)*S) x [j*S, (j+1)*S); its key is "L_i_j" and depends on nothing else, so a terrain
commit never re-keys a tile (v1.1 had per-block apron variants). Levels: L0 (256 m) .. L9
(131 km), and in mesh near-visual mode (v1.3 §B) also L-1 (128 m, 4 m vertex spacing) and L-2
(64 m, 2 m spacing: exactly the terrain block's physics lattice).

Selection (select()):
  - a node of level L >= 1 is refined while the player is closer than K(L) * S; in mesh mode
    a node is also refined down to L-1 within 400 m and to L-2 within 150 m of the player
    (min-level radii NEAR_RADII[32]; with 64 cells: L0 within 400 m, L-1 within 150 m, and the
    K' table, so selection stays one level coarser at the same distance);
  - hysteresis: a node refined last time stays refined until the player is (1 + h) times its
    switch distance away (h = 0.25, so the band is 25 % of the switch distance);
  - terrain mode only: nodes overlapping a forced box (the committed, pending and predicted
    terrain blocks) are refined down to L0, so the 8 x 8 L0 tiles under every such block are
    always present: the mod hides the ones under the committed block and sinks the edge ring
    (§2.3). Mesh mode has no forced boxes: the TerrainBlock is invisible (physics only);
  - everything intersecting the square of half-size RADIUS (80 km) around the player is kept.
The selected tiles tile the radius square exactly once.

Horizon mode (docs/V1_4_SPEC.md §3.6 "Radius", milestone M1h; earthd --horizon, off by default):
roots at HORIZON_MAX_LEVEL (L10, 262 km), a disc instead of the square (radius from the line-of-sight
horizon, HorizonGrid.radius) and, beyond HORIZON_MIN (80 km), a per-node horizon cull (Horizon): a
node whose nearest point is farther than sqrt(2R'h_eye) + sqrt(2R'zmax_node) is dropped with its
subtree (a child is never nearer nor higher than its parent, so this is the per-tile test). The
selected tiles then tile the disc minus the culled nodes exactly once.

LOD changes are grouped into swap groups (swap_groups()): connected sets of added and removed
tiles with the same footprint (a parent and its descendants), which the mod exchanges with a
vertical crossover (§2.5 C2).

Each tile is C x C cells plus a skirt on all 4 edges: a vertical curtain facing outwards,
max(2 m, 0.02 S, 2.5 err + 1 m) deep, so neighbours at different levels and tiles moving during a
crossover never show cracks. C is the layout's cell count (Layout, docs/V1_4_SPEC.md §3.1 M1):
32 (v1.3.1, FORMAT 3, 2048 + 256 tris; the default) or 64 (FORMAT 4, 8192 + 512 tris, every level
keeps its size so its vertex spacing halves, and the exact level is L-1). Vertex x, y are plane
positions; z is the ENU z of the DEM surface point under it (curvature included). Tiles of level
<= 0 use the terrain block's DEM zoom and height quantum, so their vertices (every 4th / 2nd /
every lattice sample for L0 / L-1 / L-2 with 32 cells; every 2nd / every sample for L0 / L-1 with
64) equal the terrain's samples bit for bit. Cells are split along the diagonal the Torque
TerrainBlock uses for the same square (torque_split45()), so an exact-level tile (L-2 with 32
cells, L-1 with 64) is the TerrainBlock's surface exactly at its vertices. Per tile the builder also measures `err` (max deviation
from a 2x finer reference surface) and, for L0 in terrain mode, `sink` (how far the tile must go
down to be under the terrain block everywhere).

Colour: with imagery (v1.3), every tile has its own texture of its footprint (imagery.py) and
UV0 = (x - x0, y - y0) / S across the footprint, plus UV1 = (x - x0, y - y0) / DETAIL_M, a
world-locked detail-map coordinate (tile origins are multiples of 64 m and DETAIL_M divides 64,
so UV1 is continuous across tiles). Without imagery (--imagery off) the colour comes from one
small palette texture shared by every tile (shipped with the mod, see write_mod_assets()): u
encodes height (with water at the far left), v encodes slope. The palette is mirrored around
v = 0.5, so the result does not depend on the engine's v-flip. Below 1500 m the land colour is
the terrain material's dirt colour, blending into the height palette by 2500 m.
"""
import json
import functools
import math
import os
from dataclasses import dataclass, replace

import numpy as np
from PIL import Image

import cdae
import dae
import dem as demmod
import fast
import heightmap
import imagery

BASE = 256.0            # L0 tile size
MAX_LEVEL = 9           # L9 = 131 072 m
RADIUS = 80000.0
# Tile layouts by cell count (docs/V1_4_SPEC.md §3.1 M1; Layout below). Nothing reads these at call
# time through a module setting: a Layout picks its row, and the server makes one Layout.
CELL_COUNTS = (32, 64)
# K(L) for refining a node of level L >= 1; the last entry repeats for coarser levels.
# 32 (v1.3.1, §3 recommendation): K(1) = K(2) = 3, K(>=3) = 2.5. 64: K'(L) = K(L-1) / 2, so a level
# splits at the distance where the 32-cell layout split the level below it (K'(1) = 0.75: 384 m,
# the 400 m radius of L0 wins).
K_TABLE = {32: {1: 3.0, 2: 3.0, 3: 2.5}, 64: {1: 0.75, 2: 1.5, 3: 1.5, 4: 1.25}}
# Mesh mode: everything within NEAR_RADII[cells][m] of the player is level m or finer (v1.3 §B).
NEAR_RADII = {32: {-2: 150.0, -1: 400.0}, 64: {-1: 150.0, 0: 400.0}}
# Mesh near-visual mode's finest level: the one whose vertices are the 2 m physics lattice
# (cells * 2 m = its size): L-2 = 64 m with 32 cells, L-1 = 128 m with 64.
MESH_MIN_LEVEL = {32: -2, 64: -1}
CONTENT_FORMAT = {32: 3, 64: 4}     # the protocol's FORMAT (hello.format) of each layout
# Texture edge (px) per level from the finest level of the mode, the last value repeating. 32: the
# v1.3.1 rule (two finest levels tex_near, the rest tex_far; both 256). 64 (§3.1; P8 may change it):
# 256 to L1, 512 from L2 (keeps today's texel density at distance).
TEX_DEFAULT = {32: (256, 256, 256), 64: (256, 256, 256, 512)}
BLOCK_SIZES = (1024, 512)   # terrain block samples per edge (M4, docs/V1_4_SPEC.md §3.5: 512, mesh mode only)
# Triangles per tile shape: 8192 + 512 at 64 cells. The old 8192 was the ProceduralMesh rule;
# .cdae has no such cliff (§3.1): its limit is the engine's 16-bit vertex indices (VERTS_MAX), which the fine near
# tiles (NEAR_FINE_M, up to ~2x the grid's triangles at a cutting) keep under.
TRIS_MAX = 9000
VERTS_MAX = 65535
HYSTERESIS = 0.25           # a refined node stays refined while d < (1 + h) * its switch distance
HOLD_S = 2.0                # a node changes state at most once per HOLD_S seconds (§2.4)
DETAIL_M = 2.0              # UV1 (detail map) repeat in metres; must divide 64 (see module doc)
FAR_MAX_ZOOM = 14           # DEM zoom cap for L1+ (L0 uses the heightmap's zoom)
SINK_MARGIN = 0.3           # m below the terrain everywhere for a sunk L0 tile
# Adaptive far meshes (the user, 2026-10-22: "Only use the highest resolution available when needed ... Large flat
# areas can use lower resolutions ... and far away of course uses low res"): from ADAPT_MIN_LEVEL up a tile is the
# right-triangulated irregular network of its grid (earthfast.rtin_mesh) within ADAPT_EPS of its vertex spacing of
# every grid height: flat ground a few large triangles, cliffs the whole grid. 2026-10-22, 64 cells: 75-85 % fewer
# triangles on Baltimore's and Kansas's tiles, 50-70 % at Whitney Portal, 25-35 % in Yosemite, for ~0.06 spacings
# of error (under a pixel at a level's switch distance; the grid's own sampling error is 0.3-5 spacings). Levels <= 0
# stay the 2 m lattice the roads and the terrain block meet. BNGE_FAR_ADAPT=0 turns it off.
ADAPT_MIN_LEVEL = 1
ADAPT_EPS = 0.0 if os.environ.get("BNGE_FAR_ADAPT") == "0" else 0.04
# Fine near ground (prototype, BNGE_NEAR_FINE=1; the user, 2026-10-22: "up close sharp features (like walls) more
# detailed and sharper ... instead of the mesh being forced to a grid it can be more fluid"): in mesh mode (the tiles
# drawn, the terrain block physics only) the finest near level is sampled every NEAR_FINE_M of the graded ground and
# simplified like the far tiles (rtin_mesh within NEAR_FINE_EPS of the spacing, doubled until the mesh has at most NEAR_FINE_VERTS
# vertices: the engine's 16-bit indices): a cutting's wall is a 0.5 m step instead of a 2-4 m ramp of lattice teeth,
# flat ground a few triangles. The physics stays the 2 m lattice (the walls' own colliders hold the steps).
NEAR_FINE_M = 0.5 if os.environ.get("BNGE_NEAR_FINE") == "1" else 0.0
NEAR_FINE_NEXT_M = 1.0          # ... and the level after it (L0, to ~400 m) every this
# ... and their road masks (surface.road_mask: the mod's asphalt layer) this fine, by level past the exact one: 12.5 cm
# on the 128 m tiles, 50 cm on the 256 m ones
NEAR_MASK_PX = {0: 1024, 1: 512}
NEAR_FINE_EPS = 0.1             # of the sample spacing (5 cm at 0.5 m, 10 cm at 1 m)
NEAR_FINE_VERTS = 60000
LATTICE = int(BASE / heightmap.SQUARE) + 1      # 129 terrain samples per L0 tile edge
PALETTE_W, PALETTE_H = 256, 32
WATER_U = 0.02
MATERIAL = "bngEarthFar_v3"     # static material shipped with the mod (§6.2)
# Terrain material's macro colour (mean of levels/beamng_earth/art/terrains/bngEarth_base_b.png).
DIRT = (0.39, 0.35, 0.27)
DIRT_UNTIL, DIRT_BLEND_TO = 1500.0, 2500.0      # m of elevation
MOD_SHAPES = ("levels", "beamng_earth", "art", "shapes", "beamngEarth")   # in mod/beamng_earth
MOD_PALETTE = "far_palette.png"
FORMATS = ("cdae", "dae")

# --- horizon mode (M1h, docs/V1_4_SPEC.md §3.6 "Radius: the real line-of-sight horizon") ---------
# Texture px of the coarse levels in horizon mode (a 256 px L9 is 512 m/px; at 300 km one screen
# pixel is ~100 m, so the texture is never the limit); imagery.render picks the low source zoom.
HORIZON_TEX = {8: 256, 9: 256, 10: 128}
VISIBLE_MARGIN = 1.10           # the mod's LevelInfo.visibleDistance = radius * this (horizon.lua)


@dataclass(frozen=True)
class Layout:
    """The tile layout of a server (docs/V1_4_SPEC.md §3.1, M1): cells per tile edge (32: v1.3.1,
    FORMAT 3; 64: FORMAT 4), the terrain block's samples per edge, the near-visual mode (mesh: tiles
    down to the exact level with the near radii; terrain: L0 floor, frozen at 32 cells) and the
    texture edge per level (from the mode's finest level, the last value repeating; None: the
    cells' default). Made once by earthd.Server and passed to select (K, radii), build_tile,
    zoom_for_level and heightmap, so nothing depends on a module setting."""
    cells: int = 32
    block: int = heightmap.SIZE
    mesh: bool = True
    tex: tuple = None

    def __post_init__(self):
        if self.cells not in CELL_COUNTS:
            raise ValueError(f"cells must be one of {CELL_COUNTS}, not {self.cells!r}")
        if self.block not in BLOCK_SIZES:
            raise ValueError(f"terrain block size {self.block!r} is not supported (one of {BLOCK_SIZES})")
        if not self.mesh and (self.cells != 32 or self.block != heightmap.SIZE):
            raise ValueError("terrain near-visual mode is frozen at the v1.3.1 layout (32 cells, 1024² block)")
        tex = TEX_DEFAULT[self.cells] if self.tex is None else tuple(int(v) for v in self.tex)
        if not tex:
            raise ValueError("no texture size")
        object.__setattr__(self, "tex", tex)

    @property
    def k_table(self):
        return K_TABLE[self.cells]

    def k(self, level):
        """K(L) of a node of level L >= 1 (the last table entry repeats)."""
        t = self.k_table
        return t[min(max(level, 1), max(t))]

    @property
    def near_radii(self):
        """The min-level radii of the mode (none in terrain mode: its floor is L0)."""
        return dict(NEAR_RADII[self.cells]) if self.mesh else {}

    @property
    def min_level(self):
        return MESH_MIN_LEVEL[self.cells] if self.mesh else 0

    @property
    def exact_level(self):
        """The level whose vertices are the physics lattice (mesh mode's finest)."""
        return MESH_MIN_LEVEL[self.cells]

    @property
    def format(self):
        return CONTENT_FORMAT[self.cells]

    @property
    def tris(self):
        """Triangles per tile: the grid plus a skirt quad per edge cell."""
        return 2 * self.cells * self.cells + 8 * self.cells

    def spacing(self, level):
        return level_size(level) / self.cells

    def dem_zoom(self, lat, level):
        return zoom_for_level(self, lat, level)

    def tex_size(self, level):
        return self.tex[min(max(level - self.min_level, 0), len(self.tex) - 1)]

    @property
    def grid(self):
        """The terrain block's centre grid (M4: 128 m for 512², 256 m for 1024²)."""
        return heightmap.grid(self.block)

    def block_at(self, cx, cy):
        """The Block of this layout's size centred at (cx, cy)."""
        return Block(cx, cy, self.block)


V131 = Layout(32)           # the v1.3.1 mesh layout (the server's default; terrain mode: mesh=False)


def level_size(level):
    """Tile edge (m) of a level: 256 * 2^L (64 m for L-2)."""
    return BASE * 2.0 ** level


def switch_distance(level, kfun=None, radii=None, min_level=0, layout=V131):
    """Distance below which a node of `level` is refined (0: never): K(L) * S for L >= 1, and
    at least radii[m] for every allowed finer minimum level m < L. kfun / radii default to the
    layout's K table and NEAR_RADII row."""
    if level <= min_level:
        return 0.0
    d = (kfun or layout.k)(level) * level_size(level) if level >= 1 else 0.0
    for m, r in (NEAR_RADII[layout.cells] if radii is None else radii).items():
        if min_level <= m < level:
            d = max(d, r)
    return d


@dataclass(frozen=True)
class Block:
    """Footprint of a terrain block: the 2048 m square of its samples (the valid, collidable
    area is [cx-1024, cx+1022]; the 2 m N/E strip is covered by sunk L0 tiles). size: samples per
    edge (M4: 512, a 1024 m square, collidable [cx-512, cx+510]; mesh mode only)."""
    cx: float
    cy: float
    size: int = heightmap.SIZE

    @property
    def bbox(self):
        h = heightmap.half_extent(self.size)
        return (self.cx - h, self.cy - h, self.cx + h, self.cy + h)


@dataclass(frozen=True)
class Tile:
    level: int
    i: int
    j: int

    @property
    def size(self):
        return level_size(self.level)

    @property
    def bbox(self):
        s = self.size
        return (self.i * s, self.j * s, (self.i + 1) * s, (self.j + 1) * s)

    @functools.cached_property
    def key(self):          # (cached: swap_groups and the build order ask for it on every pose)
        return f"{self.level}_{self.i}_{self.j}"

    @property
    def node(self):
        return (self.level, self.i, self.j)

    def distance(self, x, y):
        """Horizontal distance from (x, y) to the tile's footprint."""
        x0, y0, x1, y1 = self.bbox
        return math.hypot(max(x0 - x, 0.0, x - x1), max(y0 - y, 0.0, y - y1))


@functools.lru_cache(maxsize=65536)
def tile_of(key):
    """The Tile of a key (cached: Tiles are immutable; the far field's bookkeeping parses the same keys on every pose)."""
    lvl, i, j = (int(v) for v in key.split("_"))
    return Tile(lvl, i, j)


def overlaps(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


def select(px, py, forced=(), prev_refined=frozenset(), kfun=None, h=HYSTERESIS,
           radius=RADIUS, max_level=MAX_LEVEL, hold=frozenset(), min_level=0, radii=None, layout=V131,
           disc=False, horizon=None, forced_level=0, view=None, region=None):
    """Desired tiles for a player at (px, py).

    region (global far tiles, select_global): a Region, the refined finest global tiles; the roots are then the
    max_level nodes over it, a node outside it is dropped, one across its edge is a Piece per global tile it overlaps
    when it does not split (only its part inside that tile), one inside it a Tile.

    forced: bboxes (terrain blocks) under which everything is refined to `forced_level` (terrain mode:
    L0; detail mode: L-1, so tile edges meet the 128 m-grid edges of a 512² block).
    prev_refined: the nodes (L, i, j) refined last time (for the hysteresis).
    hold: nodes whose state must not change now (they changed less than HOLD_S ago).
    min_level: finest level (0; layout.min_level in mesh mode); kfun / radii: K(L) and the
    min-level radii (default: the layout's K table and NEAR_RADII row; only levels >= min_level
    count).
    disc (horizon mode): keep the nodes whose nearest point is closer than `radius` (a disc, not
    the square). horizon: a Horizon; beyond HORIZON_MIN it drops every node past the line-of-sight
    horizon, with its subtree (the server passes it with disc=True and max_level HORIZON_MAX_LEVEL).
    view: a View (screen-space LOD): nodes whose known geometric error would pop more than view.tau px on
    screen split too (within view.reach x the switch distance), distances from the camera.
    Returns ({key: Tile}, set of refined nodes)."""
    kfun = kfun or layout.k
    radii = NEAR_RADII[layout.cells] if radii is None else radii
    lo_x, lo_y, hi_x, hi_y = px - radius, py - radius, px + radius, py + radius
    s = level_size(max_level)
    rx0, ry0, rx1, ry1 = (lo_x, lo_y, hi_x, hi_y) if region is None else region.bbox
    stack = [(max_level, i, j)
             for j in range(math.floor(ry0 / s), math.ceil(ry1 / s))
             for i in range(math.floor(rx0 / s), math.ceil(rx1 / s))]
    out, refined = {}, set()
    while stack:
        node = stack.pop()
        lvl, i, j = node
        s = level_size(lvl)
        x0, y0, x1, y1 = i * s, j * s, (i + 1) * s, (j + 1) * s
        d = None
        if disc:
            d = math.hypot(max(x0 - px, 0.0, px - x1), max(y0 - py, 0.0, py - y1))
            if d >= radius or (horizon is not None and not horizon.keeps(lvl, i, j, d)):
                continue                                # outside the disc, or beyond the horizon
        elif not (x0 < hi_x and x1 > lo_x and y0 < hi_y and y1 > lo_y):
            continue                                    # outside the far radius
        cover = None
        if region is not None:
            cover = region.cover(x0, y0, x1, y1)
            if cover == []:
                continue                                # a global tile's
        if lvl > min_level:
            if lvl > forced_level and any(x0 < b[2] and x1 > b[0] and y0 < b[3] and y1 > b[1] for b in forced):
                split = True
            elif node in hold:
                split = node in prev_refined
            else:
                if d is None:
                    d = math.hypot(max(x0 - px, 0.0, px - x1), max(y0 - py, 0.0, py - y1))
                lim = switch_distance(lvl, kfun, radii, min_level)
                split = d < lim or (node in prev_refined and d < (1.0 + h) * lim)
                if not split and view is not None and d < view.reach * lim:
                    px_ = view.pixels(node, x0, y0, x1, y1)
                    if px_ is not None:
                        split = px_ > view.tau or (node in prev_refined and px_ > view.tau / (1.0 + view.h))
            if split:
                refined.add(node)
                i2, j2 = 2 * i, 2 * j
                stack += [(lvl - 1, i2, j2), (lvl - 1, i2 + 1, j2), (lvl - 1, i2, j2 + 1), (lvl - 1, i2 + 1, j2 + 1)]
                continue
        if cover:                                       # across the region's edge: its part in each global tile
            for qi, _area, poly in cover:
                p = Piece(lvl, i, j, *region.tiles[qi], tuple(poly), region.quads[qi])
                out[p.key] = p
            continue
        t = Tile(lvl, i, j)
        out[t.key] = t
    return out, refined


def diff(old, new):
    """Keys to add and to remove to go from tile set `old` to `new` (dicts or sets of keys)."""
    return [k for k in new if k not in old], [k for k in old if k not in new]


def zoom_for_level(layout, lat, level):
    """DEM zoom with pixels about half the layout's vertex spacing (L1+; L0 uses the heightmap zoom)."""
    return demmod.zoom_for(lat, layout.spacing(level) / 2, FAR_MAX_ZOOM)


def skirt_depth(size, err=0.0):
    return max(2.0, 0.02 * size, 2.5 * err + 1.0)


# --- global far tiles (geotiles phase 3b: docs/V1_4_SPEC.md 3.7 M6 on the geotiles grid) ------------------------
GLOBAL_MAX_LAT = 84.5          # deg: the selection's whole radius must stay within Web Mercator
GLOBAL_NEED = 109               # earthfast farglobal.rs
GLOBAL_GEO_VERSION = 1          # bump: every global tile's cached geometry / texture is built again
GLOBAL_PROTO = 1                # hello.globalFar: the mod places global far tiles (farfield.lua GLOBAL_FAR)


def _poly_bbox(p):
    xs, ys = p[0::2], p[1::2]
    return (min(xs), min(ys), max(xs), max(ys))


@dataclass(frozen=True, eq=False)
class Piece:
    """The part of anchor node (level, i, j) inside global tile (cz, cx, cy) (select's region mode): poly the
    overlap (flat, the anchor's world), quad the global tile's."""
    level: int
    i: int
    j: int
    cz: int
    cx: int
    cy: int
    poly: tuple
    quad: tuple

    @functools.cached_property
    def key(self):
        return f"{self.level}_{self.i}_{self.j}_c{self.cz}_{self.cx}_{self.cy}"

    @property
    def base(self):
        """The whole node (its geometry and texture are the node's, cut)."""
        return Tile(self.level, self.i, self.j)

    @property
    def node(self):
        return (self.level, self.i, self.j)

    @property
    def size(self):
        return level_size(self.level)

    @functools.cached_property
    def bbox(self):
        return _poly_bbox(self.poly)

    def distance(self, x, y):
        x0, y0, x1, y1 = self.bbox
        return math.hypot(max(x0 - x, 0.0, x - x1), max(y0 - y, 0.0, y - y1))


def global_frame_ll(z, x, y):
    """(lat, lon) of a global tile's frame (its centre)."""
    fast.require(GLOBAL_NEED, "global far tiles")
    cl, cn = fast._ef.geo_tile_info(int(z), int(x), int(y))[:2]
    return float(cl), float(cn)


def build_global(dem, z, x, y, zoom, ref_zoom, layout=V131):
    """A global tile's Built (pos (0, 0, pz) and positions in its own frame, the world convention; planar: its
    Mercator position, u east, v north; grid: its surface's world z on the Mercator vertex grid, [j north, i east]):
    the DEM at `zoom` on its (cells + 1)^2 Mercator grid, the 2x reference at ref_zoom, simplified like the anchor's far
    levels (rtin within ADAPT_EPS of the spacing)."""
    fast.require(GLOBAL_NEED, "global far tiles")
    n = layout.cells

    def ll(steps):
        f = np.arange(steps + 1) / steps
        X, Y = np.meshgrid(x + f, (y + 1) - f)          # [j north, i east]
        w = float(2 ** z)
        lon = X / w * 360.0 - 180.0
        lat = np.degrees(np.arctan(np.sinh(np.pi * (1.0 - 2.0 * Y / w))))
        return lat, lon
    lat, lon = ll(n)
    elev = np.ascontiguousarray(np.asarray(dem.sample(lat, lon, zoom), np.float64))
    rlat, rlon = ll(2 * n)
    ref = np.ascontiguousarray(np.asarray(dem.sample(rlat, rlon, ref_zoom), np.float64))
    eps = ADAPT_EPS if layout.cells == 64 else 0.0
    P, nrm, uv, planar, tris, grid, pz, err, skirt, size = fast._ef.far_global_mesh(int(z), int(x), int(y), elev,
                                                                                    ref, float(eps))
    return Built([0.0, 0.0, float(pz)], P, nrm, uv, planar, tris, grid.astype(np.float32), float(err), None,
                 float(skirt), float(size))


# --- horizon mode (M1h) ------------------------------------------------------------------


def _merc(lat, lon, zoom):
    """Global DEM pixel coordinates (x east, y south; pixel k covers [k, k + 1)) of lat/lon at a zoom,
    as dem.sample maps them; latitudes beyond the Web Mercator limit are clamped to it."""
    w = 2 ** zoom * demmod.TILE
    lat = np.clip(lat, -demmod.MAX_LAT, demmod.MAX_LAT)
    fx = (np.asarray(lon, np.float64) / 360.0 + 0.5) * w
    fy = (0.5 - np.arcsinh(np.tan(np.radians(lat))) / (2 * np.pi)) * w
    return fx, fy


# --- colour ----------------------------------------------------------------------------
def palette_image():
    land = [  # (elevation m, rgb): the height palette
        (0, (0.36, 0.43, 0.24)), (800, (0.42, 0.44, 0.27)), (1800, (0.50, 0.45, 0.33)),
        (2800, (0.53, 0.50, 0.45)), (3800, (0.63, 0.62, 0.61)), (4800, (0.86, 0.87, 0.89)),
    ]
    u = (np.arange(PALETTE_W) + 0.5) / PALETTE_W
    elev = elev_from_u(u)
    base = np.stack([np.interp(elev, [e for e, _ in land], [c[k] for _, c in land]) for k in range(3)], -1)
    # Low land takes the terrain block's dirt colour (§2.3 colour continuity), blending into the
    # height palette between DIRT_UNTIL and DIRT_BLEND_TO; the slope tint fades in with it.
    w = np.clip((elev - DIRT_UNTIL) / (DIRT_BLEND_TO - DIRT_UNTIL), 0.0, 1.0)[:, None]
    base = np.array(DIRT) * (1 - w) + base * w
    base[u < 0.04] = (0.15, 0.30, 0.42)                         # water
    base[(u >= 0.04) & (u < 0.08)] = (0.72, 0.67, 0.50)         # shore
    t = np.abs((np.arange(PALETTE_H) + 0.5) / PALETTE_H - 0.5) * 2  # 0 at v=0.5 (flat) .. 1 at edges (steep)
    rock = np.array([0.44, 0.42, 0.40])
    rw = np.clip(t, 0, 1)[:, None, None] * 0.8 * w[None, :, :]
    img = base[None, :, :] * (1 - rw) + rock * rw
    return Image.fromarray(np.uint8(np.clip(img, 0, 1) * 255 + 0.5), "RGB")


def u_from_elev(elev):
    return 0.1 + 0.88 * np.clip(elev / 5000.0, 0.0, 1.0)


def elev_from_u(u):
    return (u - 0.1) / 0.88 * 5000.0


def material_json(palette_vfs):
    """The static far-tile material (§6.2): a v1.5 Material whose mapTo is the material name
    the tiles carry, so it applies to .cdae and .dae tiles alike (probe P2)."""
    return {MATERIAL: {
        "name": MATERIAL, "mapTo": MATERIAL, "class": "Material", "version": 1.5,
        "persistentId": "6f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b",
        "Stages": [{"baseColorMap": palette_vfs, "metallicFactor": 0, "roughnessFactor": 1}, {}, {}, {}],
        "castShadows": False,       # (PR #41; the far tiles lie beyond the shadow distance: no change measured)
    }}


def write_mod_assets(mod_dir):
    """Write the palette and the material file into the mod (mod/beamng_earth). The level
    loader picks up every main.materials.json under the level folder."""
    d = os.path.join(mod_dir, *MOD_SHAPES)
    os.makedirs(d, exist_ok=True)
    palette_image().save(os.path.join(d, MOD_PALETTE))
    vfs = "/" + "/".join(MOD_SHAPES) + "/" + MOD_PALETTE
    with open(os.path.join(d, "main.materials.json"), "w") as f:
        json.dump(material_json(vfs), f, indent=2)
        f.write("\n")
    return d


# --- geometry --------------------------------------------------------------------------
def _skirt(nx, ny):
    """Edge vertex index runs, each ordered so that the skirt faces outwards
    (direction along the edge = up x outward normal)."""
    g = np.arange(nx * ny).reshape(ny, nx)          # [j, i], j = north
    return [g[0, :],            # south, west -> east
            g[:, -1],           # east, south -> north
            g[-1, ::-1],        # north, east -> west
            g[::-1, 0]]         # west, north -> south


def surface_at(grid, sp, fx, fy):
    """Height of a tile's triangulated surface at tile-local plane points (fx, fy in metres
    from the SW corner, inside the tile). grid: [j, i] vertex heights, spacing sp. Cells with
    i + j even are split along the SW-NE diagonal, the others along SE-NW, as build_tile
    triangulates them (the TerrainBlock's pattern, see torque_split45)."""
    n = grid.shape[0] - 1
    gx, gy = np.asarray(fx, np.float64) / sp, np.asarray(fy, np.float64) / sp
    i = np.clip(np.floor(gx).astype(np.int64), 0, n - 1)
    j = np.clip(np.floor(gy).astype(np.int64), 0, n - 1)
    a, b = gx - i, gy - j
    z00, z10 = grid[j, i], grid[j, i + 1]
    z01, z11 = grid[j + 1, i], grid[j + 1, i + 1]
    split45 = (i + j) % 2 == 0
    # SW-NE diagonal: triangles (00, 10, 11) where a >= b and (00, 11, 01) above it.
    z45 = np.where(a >= b, z00 + a * (z10 - z00) + b * (z11 - z10),
                   z00 + a * (z11 - z01) + b * (z01 - z00))
    # SE-NW diagonal: triangles (00, 10, 01) where a + b <= 1 and (10, 11, 01) above it.
    z135 = np.where(a + b <= 1.0, z00 + a * (z10 - z00) + b * (z01 - z00),
                    z11 + (1 - a) * (z01 - z11) + (1 - b) * (z10 - z11))
    return np.where(split45, z45, z135)


def grid_triangles(n):
    """Triangles (counter-clockwise from +Z) of an (n+1) x (n+1) vertex grid indexed [j, i]:
    cell (i, j) is split SW-NE when i + j is even, SE-NW otherwise (torque_split45)."""
    nx = n + 1
    jj, ii = np.meshgrid(np.arange(n), np.arange(n), indexing="ij")
    a = (jj * nx + ii).ravel()
    b, c, d = a + 1, a + nx, a + nx + 1
    even = ((ii + jj) % 2 == 0).ravel()[:, None]
    t1 = np.where(even, np.stack([a, b, d], -1), np.stack([a, b, c], -1))
    t2 = np.where(even, np.stack([a, d, c], -1), np.stack([b, d, c], -1))
    return np.stack([t1, t2], 1).reshape(-1, 3)


@dataclass
class Built:
    pos: list               # [x, y, z] of the tile origin (SW corner, z = rounded mean height)
    positions: np.ndarray   # (n, 3) relative to pos
    normals: np.ndarray     # (n, 3)
    uvs: np.ndarray         # (n, 2) palette coordinates
    planar: np.ndarray      # (n, 2) tile-local xy / S: the footprint UV0 and the tangent frame
    tris: np.ndarray        # (m, 3) counter-clockwise from +Z
    grid: np.ndarray        # (cells + 1)² absolute vertex heights, float32 (for swap-group deltas)
    err: float              # max |reference - tile| (m)
    sink: float | None      # levels <= 0 with_sink (terrain / detail mode): drop that puts the tile under the terrain everywhere
    skirt: float            # skirt depth (m)
    size: float             # tile edge (m)

    @property
    def detail_uvs(self):
        """UV1: tile-local metres / DETAIL_M (world-locked: tile origins are multiples of DETAIL_M)."""
        return self.planar * (self.size / DETAIL_M)


def build_tile(frame, dem, tile, zoom, q=None, ref_zoom=None, with_sink=True, layout=V131):
    """Geometry of one tile with layout.cells cells per edge. zoom: DEM zoom of its vertices;
    ref_zoom: zoom of the 2x finer reference used for `err` (default zoom). For levels <= 0 pass q
    (the anchor's height quantum) and the heightmap zoom: vertices are then Q-rounded 2 m lattice
    samples, the same values the terrain block stores, and (L0, with_sink) `sink` is measured
    against the terrain's 2 m lattice."""
    cells = layout.cells
    x0, y0, x1, y1 = tile.bbox
    S = tile.size
    sp = S / cells
    elev_fn = lambda la, lo: dem.sample(la, lo, zoom)       # noqa: E731
    terrain = None
    if tile.level <= 0:
        # One evaluation of the terrain lattice over the tile (129² for L0, 65² for L-1, 33²
        # for L-2) gives the vertices (32 cells: every 4th / 2nd / every sample; 64 cells: every
        # 2nd / every sample for L0 / L-1), the error reference at half the vertex spacing and the
        # sink reference (all samples).
        n = int(S / heightmap.SQUARE) + 1
        step = (n - 1) // cells
        if step < 1 or (n - 1) % cells:
            raise ValueError(f"level {tile.level} is finer than the {cells}-cell layout's lattice level")
        k0x, k0y = int(x0 // heightmap.SQUARE), int(y0 // heightmap.SQUARE)
        lxs, lys = heightmap.lattice_coords(k0x, n), heightmap.lattice_coords(k0y, n)
        lelev, lu = heightmap.surface(frame, elev_fn, lxs, lys)
        lq = lu if q is None else heightmap.quantise(lu, q) * q
        xs, ys = lxs[::step], lys[::step]
        elev, U = lelev[::step, ::step], lq[::step, ::step]
        if step >= 2:
            ref = lu[::step // 2, ::step // 2]
        else:                           # the exact level: the vertices are the lattice; reference at 1 m
            r = x0 + np.arange(2 * cells + 1) * (sp / 2), y0 + np.arange(2 * cells + 1) * (sp / 2)
            ref = heightmap.surface_u(frame, elev_fn, *r)
        if with_sink:                   # L0 (terrain mode) or any near level (detail mode)
            terrain = lq
    else:
        xs = x0 + np.arange(cells + 1) * sp
        ys = y0 + np.arange(cells + 1) * sp
        elev, U = heightmap.surface(frame, elev_fn, xs, ys)
        if q is not None:
            U = heightmap.quantise(U, q) * q
        rz = zoom if ref_zoom is None else ref_zoom
        rxs = x0 + np.arange(2 * cells + 1) * (sp / 2)
        rys = y0 + np.arange(2 * cells + 1) * (sp / 2)
        ref = heightmap.surface_u(frame, lambda la, lo: dem.sample(la, lo, rz), rxs, rys)
    step_f = (NEAR_FINE_M if tile.level == layout.exact_level else
              NEAR_FINE_NEXT_M if tile.level == layout.exact_level + 1 else 0.0) if NEAR_FINE_M > 0 else 0.0
    fine = (step_f > 0 and not with_sink and tile.level <= 0
            and (int(round(S / step_f)) & (int(round(S / step_f)) - 1)) == 0)
    if fine:                            # (the two finest near levels, mesh mode: NEAR_FINE_M, NEAR_FINE_NEXT_M)
        nf = int(round(S / step_f)) + 1
        xs = x0 + np.arange(nf) * step_f
        ys = y0 + np.arange(nf) * step_f
        elev, U = heightmap.surface(frame, elev_fn, xs, ys)
        sp, cells = step_f, nf - 1
    U = np.asarray(U, np.float64)
    shade = U                           # the vertex normals: the whole grid's (its detail in the light)
    adaptive = None
    if fine:
        fast.require(51, "fine near ground")
        eps = NEAR_FINE_EPS * step_f
        while True:
            adaptive, surf, worst = fast._ef.rtin_mesh(np.ascontiguousarray(U), eps)
            if len(np.unique(adaptive)) + 4 * nf <= NEAR_FINE_VERTS:
                break
            eps *= 2
        U = surf
    elif tile.level >= ADAPT_MIN_LEVEL and ADAPT_EPS > 0 and layout.cells == 64:    # (the v1.3.1 layout: its grid)
        fast.require(51, "adaptive far tiles")
        adaptive, U, _ = fast._ef.rtin_mesh(np.ascontiguousarray(U), ADAPT_EPS * sp)     # U: the mesh's surface

    # Geometric error: the reference against the triangulated tile, on the 2x grid (fine: the samples themselves).
    if fine:
        err = float(worst)
    else:
        rf = np.arange(2 * cells + 1) * (sp / 2)
        RX, RY = np.meshgrid(rf, rf)
        err = float(np.abs(ref - surface_at(U, sp, RX, RY)).max())
    sink = None
    if terrain is not None:
        lf = np.arange(terrain.shape[0]) * heightmap.SQUARE
        LX, LY = np.meshgrid(lf, lf)
        sink = float(max(0.0, (surface_at(U, sp, LX, LY) - terrain).max()) + SINK_MARGIN)

    X, Y = np.meshgrid(xs, ys)          # [j, i], j = north
    # Colour: height along u, slope along v (mirrored palette, flat = 0.5).
    gy, gx = np.gradient(elev, ys, xs)
    slope_t = np.clip(np.hypot(gx, gy) / 1.0, 0.0, 1.0)
    water = (elev <= 0.5) & (slope_t < 0.02)
    uu = np.where(water, WATER_U, u_from_elev(elev))
    vv = 0.5 - 0.47 * slope_t

    # Vertex normals from the grid (central differences).
    Ps = np.stack([X, Y, shade], -1)
    di = np.gradient(Ps, axis=1)
    dj = np.gradient(Ps, axis=0)
    nrm = np.cross(di, dj)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    P = np.stack([X, Y, U], -1)

    ny, nx = X.shape
    P, nrm = P.reshape(-1, 3), nrm.reshape(-1, 3)
    uv = np.stack([uu, vv], -1).reshape(-1, 2)
    runs = _skirt(nx, ny)
    if adaptive is None:
        tris = [grid_triangles(nx - 1)]     # CCW from +Z, the TerrainBlock's diagonals
    else:                               # the mesh's vertices only; the skirts along its edge vertices
        used = np.unique(adaptive)
        new_of = np.full(nx * ny, -1, np.int64)
        new_of[used] = np.arange(len(used))
        tris = [new_of[adaptive]]
        P, nrm, uv = P[used], nrm[used], uv[used]
        runs = [new_of[r[new_of[r] >= 0]] for r in runs]

    # Skirts: copies of the edge vertices, lowered; same normal and uv as the edge.
    depth = skirt_depth(S, err)
    extra_p, extra_n, extra_uv, nv = [], [], [], len(P)
    for run in runs:
        low = P[run] - (0.0, 0.0, depth)
        t0, t1 = run[:-1], run[1:]
        lo0 = nv + np.arange(len(run) - 1)
        lo1 = lo0 + 1
        tris.append(np.stack([t0, lo0, t1, t1, lo0, lo1], -1).reshape(-1, 3))
        extra_p.append(low)
        extra_n.append(nrm[run])
        extra_uv.append(uv[run])
        nv += len(run)
    P = np.concatenate([P] + extra_p)
    nrm = np.concatenate([nrm] + extra_n)
    uv = np.concatenate([uv] + extra_uv)

    pos = [float(x0), float(y0), float(np.round(U.mean()))]
    P -= pos
    planar = (P[:, :2] / S)
    return Built(pos, P, nrm, uv, planar, np.concatenate(tris), U.astype(np.float32), err, sink, depth, S)


def write_built(path, built, fmt="cdae", material=MATERIAL, textured=False, tex_px=None):
    """Write a built tile as .cdae (default) or .dae; returns the file size. textured: the tile
    has its own imagery texture (UV0 = footprint, UV1 = world-locked detail); otherwise UV0 is
    the shared palette coordinate and there is no UV1. tex_px: the texture has a border of
    imagery.gutter(tex_px) texels around the footprint (UV0 is inset to match)."""
    assert len(built.positions) <= VERTS_MAX
    uvs = built.uvs
    if textured:
        uvs = built.planar if tex_px is None else imagery.gutter_uv(built.planar, tex_px)
    uvs2 = built.detail_uvs if textured else None
    if fmt == "cdae":
        return cdae.write(path, built.positions, built.tris, normals=built.normals, uvs=uvs, uvs2=uvs2,
                          material=material, tangent_uvs=built.planar)
    dae.write_grid_dae(path, built.positions.ravel(), uvs.ravel(), built.tris.ravel(),
                       material=material, normals=built.normals.ravel(),
                       uvs2=None if uvs2 is None else uvs2.ravel())
    return os.path.getsize(path)


def write_tile(path, frame, dem, tile, zoom, q=None, ref_zoom=None, fmt="cdae", cancelled=None, layout=V131):
    """Build and write one tile; returns the Built record, or None if cancelled meanwhile."""
    if cancelled is not None and cancelled.is_set():
        return None
    built = build_tile(frame, dem, tile, zoom, q, ref_zoom, layout=layout)
    write_built(path, built, fmt)
    return built


if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "mod", "beamng_earth")
    print("wrote", write_mod_assets(target))
