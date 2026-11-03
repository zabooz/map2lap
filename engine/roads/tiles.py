"""Tile geometry and the helpers for polylines and chunks."""
import math

import numpy as np

import mapcells

from .style import LANE_M, MAX_NODES, OVERLAP, TILE, URBAN_ARTERIAL
from .specs import PARKING_CLASSES, PARKING_M, edge_margin


def split(pts, n=MAX_NODES):
    """Chunks of at most n nodes sharing their end nodes. Pure."""
    if len(pts) <= n:
        return [pts]
    out, i = [], 0
    while i < len(pts) - 1:
        out.append(pts[i:i + n])
        i += n - 1
    return out


def tile_bbox(tx, ty):
    """A tile's box (x0, y0, x1, y1) in its frame: an anchor tile's square; a geotile's (tx a geotiles.GeoBox, ty
    None) its quad's bounding box in its own frame, an OwnedBox (box_owns: its own points exactly)."""
    b = getattr(tx, "box", None)
    if b is not None:
        return b
    return tx * TILE, ty * TILE, (tx + 1) * TILE, (ty + 1) * TILE


def box_owns(box, x, y):
    """geotiles.box_owns: the tile's own points (a geotile's exactly, an anchor tile's half-open box)."""
    import geotiles
    return geotiles.box_owns(box, x, y)


def tile_side(tx, ty):
    """m: the side of a square of the tile's area (TILE for an anchor tile)."""
    side = getattr(tx, "side", None)
    return side() if side is not None else TILE


def box_gap(x0, y0, x1, y1, x, y):
    """m from (x, y) to the nearest point of the box [x0, x1] x [y0, y1] (Euclidean; 0 inside)."""
    return math.hypot(max(x0 - x, x - x1, 0.0), max(y0 - y, y - y1, 0.0))


def tiles_near(x, y, radius):
    """Tile keys whose square comes within `radius` of (x, y): the Euclidean distance to its nearest point, a disc (the
    user: "change the quality/view distance radius from a square to a circle"). Before it was the square
    (Chebyshev): its corners reached 41 % farther than its sides, ~27 % more tiles than the disc for no reach ahead
    (the anchor frame's axes are not the way the car drives). Order: tx, then ty (as before)."""
    t0x, t1x = int(math.floor((x - radius) / TILE)), int(math.floor((x + radius) / TILE))
    t0y, t1y = int(math.floor((y - radius) / TILE)), int(math.floor((y + radius) / TILE))
    r2 = radius * radius
    out = []
    for tx in range(t0x, t1x + 1):
        dx = max(tx * TILE - x, x - (tx + 1) * TILE, 0.0)
        for ty in range(t0y, t1y + 1):
            dy = max(ty * TILE - y, y - (ty + 1) * TILE, 0.0)
            if dx * dx + dy * dy <= r2:
                out.append((tx, ty))
    return out


def tile_distance(tx, ty, x, y):
    """m from (x, y) to tile (tx, ty)'s square (Euclidean, as tiles_near; 0 inside)."""
    return box_gap(*tile_bbox(tx, ty), x, y)


def cells_of_tile(frame, tx, ty, margin=OVERLAP):
    x0, y0, x1, y1 = tile_bbox(tx, ty)
    lat, lon, _ = frame.enu_to_geodetic(np.array([x0 - margin, x1 + margin, x0 - margin, x1 + margin]),
                                        np.array([y0 - margin, y0 - margin, y1 + margin, y1 + margin]), 0.0)
    return mapcells.cells_for_bbox(float(np.min(lat)), float(np.min(lon)), float(np.max(lat)), float(np.max(lon)))


TILE_BUILDING_LAYERS = ("buildings", "building_parts", "water")   # a road tile's own cells, with its buildings


def tile_needs(frame, tx, ty, buildings=True, widths=True, water_ring=0):
    """The (cell, layer)s a road tile asks the map data for, nearest first (MapData.warm, before building it): the
    roads and infrastructure (bridges) of the cells under it and their buildings (buildings on), the roads of the ring
    around (grading's neighbours), the buildings of two rings around (widths on: roadwidth's walls) and the water of
    water_ring cells around (seacarve's rasters and river lines), and the roads of the second ring (gradesep's
    neighbours of the first)."""
    keys = cells_of_tile(frame, tx, ty)
    if not keys:
        return []
    z = keys[0].z
    n = 1 << z
    x0, x1 = min(k.x for k in keys), max(k.x for k in keys)
    y0, y1 = min(k.y for k in keys), max(k.y for k in keys)
    cx, cy = 0.5 * (x0 + x1), 0.5 * (y0 + y1)

    def ring(r):
        out = [mapcells.CellKey(z, x % n, y) for x in range(x0 - r, x1 + r + 1) for y in range(y0 - r, y1 + r + 1)
               if 0 <= y < n]
        return sorted(out, key=lambda k: (abs((k.x - cx + n / 2) % n - n / 2) + abs(k.y - cy), k))
    own = set(keys)
    tile = ("roads", "infrastructure") + (TILE_BUILDING_LAYERS if buildings else ())
    needs = [(k, ly) for k in sorted(keys) for ly in tile]
    needs += [(k, "roads") for k in ring(1) if k not in own]
    # (and the ring past that: gradesep reads the neighbours of every cell whose level ranges are asked, the ring's too)
    import gradesep
    if gradesep.ON:
        r1 = set(ring(1))
        needs += [(k, "roads") for k in ring(2) if k not in r1]
    if widths:      # the walls of the cells the ring's roads cross, each with its neighbours' buildings
        needs += [(k, "buildings") for k in ring(2) if k not in own]
    if water_ring:
        done = {k for k, ly in needs if ly == "water"}
        needs += [(k, "water") for k in ring(water_ring) if k not in done]
    return needs


def lane_layout(spec):
    """(driving width m, lanes) of a road as its lane lines are painted (extras) and the AI drives it (navgraph): the
    carriageway less a town street's parking lanes or a rural road's edge strips (counted as lanes, every rural
    Interstate had three), its lanes OpenStreetMap's count or as many LANE_M as fit (at least 1). Pure."""
    w, cls = spec.width, spec.cls
    parked = spec.urban and cls in PARKING_CLASSES and not (not spec.oneway and cls in URBAN_ARTERIAL)
    drive = w - ((PARKING_M if spec.oneway else 2 * PARKING_M) if parked else 2 * edge_margin(spec))
    lanes = int(spec.lanes) if spec.lanes else int(drive // LANE_M)
    return drive, max(1, lanes)


def lane_tags(feats, i):
    """OpenStreetMap's lane tags of feature i ({key: value}, railtags.LANE_COLUMNS joined by MapData), or None."""
    import railtags
    out = {}
    for k in railtags.LANE_COLUMNS:
        if k == "junction":
            continue                            # (a ring's tag, not lane data: roads._rings reads it)
        col = feats.attrs.get(railtags.lane_attr(k))
        if col is not None and col[i] is not None:
            out[k] = col[i]
    return out or None


def _chunk(look, w, c):
    out = {"m": look["m"], "w": round(float(w), 2), "tl": look["tl"], "p": look["p"],
           "n": [[round(float(v), 3) for v in p] for p in c]}
    if look.get("layer"):
        out["layer"] = look["layer"]
    return out


def _along(line, dist):
    """The point dist along polyline line (k, 3) from its start (its end if shorter)."""
    seg = np.hypot(*np.diff(line[:, :2], axis=0).T)
    for i, L in enumerate(seg):
        if dist <= L and L > 0:
            return line[i] + (line[i + 1] - line[i]) * (dist / L)
        dist -= L
    return line[-1]
