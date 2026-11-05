"""Cheap bushes on shrubland: billboards the map doesn't measure, in loose groups, so a hillside of shrubs has plants on it
and not only a green ground. The canopy data (vegetation.py) finds what stands over 1 m as single tops with bare ground
between them; these fill in only where it found nothing, as objects of their own (make_obj: nocol_bush_, near and without
shadows, obj_to_kn5.VIEW).

Not spread evenly, which looks like spots again: the density comes from noise at three sizes, so there are large groups
with frayed edges, small ones and open gaps, plus now and then a winding row (where a slow noise crosses zero: its lines
curve and end by themselves). Everything depends only on the world position (anchor frame): seamless across tiles and the
same on every build.
"""
import numpy as np

import fast
import roads as roadsmod
import surface as surfacemod

from scenery import ground, groundcover

CELL_M = 3.0                # one candidate per this many metres: about 7,300 a tile, 8 triangles each
PEAK = 0.95                 # share of the candidates kept at a group's middle
# (m, weight, salt) of the density's noise: a hillside's large groups, small ones, their frayed edges
OCTAVES = ((70.0, 0.6, 91), (24.0, 0.3, 92), (8.0, 0.2, 93))
OPEN_BELOW, FULL_AT = -0.05, 0.40   # that noise: nothing below (the gaps), PEAK from here
ROW_M, ROW_WIDTH, ROW_SALT = 110.0, 0.035, 94   # a row: where this noise is within the width of zero (about 5 m wide)
ROW_WHERE_M, ROW_WHERE_FROM, ROW_WHERE_SALT = 260.0, 0.1, 95    # ... only in some parts of the country, not all over
ROW_DENSITY = 0.6
HEIGHT_M = (0.9, 2.5)       # a bush's height, 0.75 of it at a group's edge, 1.25 in its middle
ROAD_CLEAR_M = 1.5          # m kept from a carriageway's or path's edge (as the map's bushes: vegetation.ROAD_CLEAR_M)
# Thin where the climate is dry: WorldCover's shrubland in a desert is single plants on bare ground, not a thicket
ZONE_SHARE = {"desert": 0.25, "savanna": 0.6}


def density(x, y):
    """The share of candidates kept at the world points (x, y), in [0, 1]. Pure."""
    n = sum(w * groundcover._noise(x, y, m, salt) for m, w, salt in OCTAVES)
    d = np.clip((n - OPEN_BELOW) / (FULL_AT - OPEN_BELOW), 0.0, 1.0)
    row = (np.abs(groundcover._noise(x, y, ROW_M, ROW_SALT)) < ROW_WIDTH) \
        & (groundcover._noise(x, y, ROW_WHERE_M, ROW_WHERE_SALT) > ROW_WHERE_FROM)
    return np.where(row, np.maximum(d, ROW_DENSITY), d)


def scatter(x0, y0, size, free, cell, share=1.0):
    """(x, y, height, yaw, random value) arrays of the bushes in the square from (x0, y0), size m across. free: bool [j
    northwards, i eastwards] per cell m, where one may stand. A candidate's place and chances hang on the world grid alone,
    so two tiles agree along their border. Pure."""
    ix, iy = np.meshgrid(np.arange(np.floor(x0 / CELL_M), np.ceil((x0 + size) / CELL_M)),
                         np.arange(np.floor(y0 / CELL_M), np.ceil((y0 + size) / CELL_M)))
    ix, iy = ix.ravel().astype(np.int64), iy.ravel().astype(np.int64)
    x = (ix + groundcover._hash2(ix, iy, 96)) * CELL_M
    y = (iy + groundcover._hash2(ix, iy, 97)) * CELL_M
    i, j = np.floor((x - x0) / cell).astype(np.int64), np.floor((y - y0) / cell).astype(np.int64)
    on = (i >= 0) & (j >= 0) & (i < free.shape[1]) & (j < free.shape[0])
    on[on] = free[j[on], i[on]]
    d = density(x, y)
    on &= groundcover._hash2(ix, iy, 98) < PEAK * d * share
    height = HEIGHT_M[0] + (HEIGHT_M[1] - HEIGHT_M[0]) * groundcover._hash2(ix, iy, 99)
    return x[on], y[on], (height * (0.75 + 0.5 * d))[on], groundcover._hash2(ix, iy, 100)[on] * 360.0, \
        groundcover._hash2(ix, iy, 101)[on]


def _on_grid(grid, x0, y0, x, y):
    """The height of the tile's terrain lattice (ground.build: n * n vertices ground.CELL apart) at (x, y), bilinear. Pure."""
    n = int(round(np.sqrt(len(grid))))
    z = grid[:, 2].reshape(n, n)
    fx, fy = np.clip((x - x0) / ground.CELL, 0, n - 1.001), np.clip((y - y0) / ground.CELL, 0, n - 1.001)
    i, j = fx.astype(np.int64), fy.astype(np.int64)
    fx, fy = fx - i, fy - j
    return (z[j, i] * (1 - fx) + z[j, i + 1] * fx) * (1 - fy) + (z[j + 1, i] * (1 - fx) + z[j + 1, i + 1] * fx) * fy


def _off_roads(frame, s, box, m):
    """Bool [j northwards, i eastwards] per ground.CELL over the tile box: clear of the roads and mapped paths."""
    x0, y0, x1, y1 = box
    gx, gy = np.meshgrid(x0 + (np.arange(m) + 0.5) * ground.CELL, y0 + (np.arange(m) + 0.5) * ground.CELL)
    la, lo, _ = frame.enu_to_geodetic(gx.ravel(), gy.ravel(), 0.0)
    feats, _ = s.surface.roads(np.asarray(la).reshape(m, m), np.asarray(lo).reshape(m, m))
    near = np.zeros((m, m), bool)
    clear = ROAD_CLEAR_M / ground.CELL
    got = surfacemod._road_segments(frame, x0, y0, x1 - x0, m, m, feats, s.surface.urban, s.widths) if feats else None
    if got is not None:         # (row 0 north there)
        fast._ef.mask_segments(near, np.ascontiguousarray(got[0], np.float64), np.ascontiguousarray(got[1] + clear, np.float64))
        near = near[::-1]
    paths = ground._paths(frame, feats, box) if feats else []
    if paths:
        segs = np.concatenate([np.c_[(xy[:-1] - (x0, y0)) / ground.CELL - 0.5, (xy[1:] - (x0, y0)) / ground.CELL - 0.5]
                               for xy, *_ in paths])
        hws = np.concatenate([np.full(len(xy) - 1, hw / ground.CELL + clear) for xy, hw, *_ in paths])
        fast._ef.mask_segments(near, np.ascontiguousarray(segs, np.float64), np.ascontiguousarray(hws, np.float64))
    return ~near


def tile_items(frame, s, tx, ty, grid, taken, zone):
    """The cheap bushes of tile (tx, ty) as trees.billboards takes them: (group, x, y, z, rotation, height, random value).
    s: blockworker's state; grid: the terrain lattice; taken: the tile's items (group, x, y, ...), each keeping its own
    cell and those around free of a cheap bush; zone: trees.zone. On the ground painted shrubland only (groundcover), off
    the roads and paths, and off faces steep enough to be painted rock (ground.ROCK_SLOPE)."""
    box = roadsmod.tile_bbox(tx, ty)
    x0, y0 = box[0], box[1]
    free = groundcover.materials(frame, s.md, tx, ty, ground.CELL) == "gc_shrub"
    m = free.shape[0]
    free = free & _off_roads(frame, s, box, m)
    n = int(round(np.sqrt(len(grid))))
    tan = np.hypot(*np.gradient(grid[:, 2].reshape(n, n), ground.CELL))
    free &= tan[:m, :m] < ground.ROCK_SLOPE[0]
    if taken:
        p = np.array([(float(t[1]), float(t[2])) for t in taken])
        i, j = np.floor((p[:, 0] - x0) / ground.CELL).astype(np.int64), np.floor((p[:, 1] - y0) / ground.CELL).astype(np.int64)
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                on = (i + di >= 0) & (j + dj >= 0) & (i + di < m) & (j + dj < m)
                free[j[on] + dj, i[on] + di] = False
    x, y, h, yaw, rank = scatter(x0, y0, box[2] - x0, free, ground.CELL, ZONE_SHARE.get(zone, 1.0))
    z = _on_grid(grid, x0, y0, x, y)
    return [("shrub", float(a), float(b), float(c), float(d), float(e), float(f))
            for a, b, c, d, e, f in zip(x, y, z, yaw, h, rank)]
