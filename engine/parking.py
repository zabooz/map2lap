"""Parking spots for BeamNG's own parked cars (gameplay_parking, the player's traffic settings): curbside
spots along town and city streets, from the sidewalk runs of a road tile (roads.build_tile), and rows of
spots in the mapped parking lots (Overture infrastructure polygons of class "parking").

Stall markings (lot_markings, aisle_markings): the same rows, drawn as white lines on the ground the way
lane lines are (a line_white ribbon in the road mesh). A mapped lot (class "parking", unless its surface
is grass or gravel) gets a divider and a line across the head of each stall. A lot that the map gives
only as its aisles (road subclass parking_aisle) gets the same lines along both sides of each aisle.
The asphalt under them is the ground itself (surface.paint_lots, surface.photo_lots).

The stock system spawns its parked cars onto the spots of a sites object and moves them to spots near the
player as the player drives (the mod's parking.lua feeds it these). Each spot is a row [x, y, z, heading]:
the anchor frame's position of the spot's centre on the road surface, and the direction the parked car
faces (degrees, counter-clockwise from +x); lot spots carry a fifth value, 1 (the mod tags them as lot
spots: either way in, no "street" tracking). Cars park along the curb facing the traffic on their side
(right-hand traffic). Deterministic: the stations are arc lengths along the road, as furniture.py's.
"""
import math

import numpy as np
from polygon import Path

import furniture

PARK_CLASSES = {"residential", "tertiary", "secondary", "unclassified", "living_street"}
SPOT_LEN_M = 6.5            # a spot's length along the curb (US parallel parking: 6-7 m)
SPOT_W_M = 2.5              # the stock spot size (city.sites.json: 2.5 x 6 x 3)
CURB_OFF_M = 1.25           # the spot's centre this far from the curb into the road
MIN_WIDTH_M = 7.0           # narrower streets: no parking lane
BOTH_SIDES_M = 9.0          # wider streets park on both sides, narrower ones on one (hashed per street)
STREET_SHARE = 0.85         # the share of eligible streets with curbside parking (hashed per street)
CORNER_CLEAR_M = 9.0        # m kept clear of a run's ends (corners, crosswalks; US: 20 ft from a crosswalk)
HYDRANT_CLEAR_M = 4.6       # m kept clear of a hydrant (US: 15 ft)
DRIVE_CLEAR_M = 4.2         # m from a driveway's mouth to a spot's centre




def _owns(box, x, y):
    """Is (x, y) the tile's own point (geotiles.box_owns: a geotile's exactly, an anchor tile's half-open box)?"""
    import geotiles
    return geotiles.box_owns(box, x, y)

def curb_spots(roads, walks, box, left_hand=False, directions=None):
    """Rows [x, y, z, heading] of the curbside spots of a tile box (x0, y0, x1, y1). roads: build_tile's
    (fid, spec, centreline (k, 3), lon); walks: its sidewalk runs (dicts with fid, pts, side, w). left_hand:
    traffic drives on the left (the car's left side to the curb). directions: fid -> +1 / -1, a one-way street's
    traffic along / against its geometry (Overture's one-way rule; +1 when unknown)."""
    import roads as roadsmod
    by_fid = {fid: (spec, pts) for fid, spec, pts, _ in roads}
    out = []
    for wk in walks:
        fid = wk.get("fid")
        if fid is None or "pts" not in wk or fid not in by_fid:
            continue
        spec, line = by_fid[fid]
        if not spec.urban or spec.cls not in PARK_CLASSES or spec.width < MIN_WIDTH_M:
            continue
        if furniture._h01(fid, "park") >= STREET_SHARE:
            continue
        side = wk["side"]
        if spec.width < BOTH_SIDES_M and side != (1 if furniture._h01(fid, "parkside") < 0.5 else -1):
            continue
        run = np.asarray(wk["pts"], np.float64)
        if len(run) < 2:
            continue
        w = wk.get("w", 2.5)
        # The occupied row lies inside the curb. At a bend it has a different length from the road centreline;
        # stationing on the latter placed two cars on top of one another at the inside corner.
        row = roadsmod.offset_polyline(line, side * (spec.width / 2 - CURB_OFF_M))
        phase = furniture._h01(fid, side, "parkph") * SPOT_LEN_M
        stations = np.arange(phase, furniture._arclen(row)[-1], SPOT_LEN_M)
        if not len(stations):
            continue
        centres, tangents = furniture._at(row, stations)
        on_run = furniture._project(run, centres[:, :2])
        run_pts, _ = furniture._at(run, on_run)
        length = furniture._arclen(run)[-1]
        for q, t, s, p in zip(centres, tangents, on_run, run_pts):
            if not (CORNER_CLEAR_M <= s <= length - CORNER_CLEAR_M):
                continue
            if np.linalg.norm(q[:2] - p[:2]) > w / 2 + CURB_OFF_M + 0.5:
                continue
            if not _owns(box, q[0], q[1]):
                continue
            # On a two-way road the car faces away from the row's tangent on the left side (right-hand traffic).
            if spec.oneway:
                _, d = furniture._at(line, furniture._project(line, q[None, :2]))
                h = d[0] * (-1.0 if (directions or {}).get(fid, 1) < 0 else 1.0)
            elif left_hand:             # left(h) = (-h_y, h_x) = away
                h = t * side
            else:
                h = -t * side
            out.append([round(float(q[0]), 2), round(float(q[1]), 2), round(float(q[2]), 2),
                        round(math.degrees(math.atan2(h[1], h[0])) % 360.0, 1)])
    return out


def clear_of(spots, props, drives):
    """The spots not in front of a hydrant (props rows of group furniture.G_HYDRANT) or a driveway's mouth
    (drives: buildings.doors' driveway chunks, "n" points from the house to the road's edge)."""
    if not spots:
        return spots
    block = [(r[1], r[2], HYDRANT_CLEAR_M) for r in (props or ()) if r[0] == furniture.G_HYDRANT]
    block += [(d["n"][-1][0], d["n"][-1][1], DRIVE_CLEAR_M) for d in (drives or ()) if d.get("n")]
    if not block:
        return spots
    b = np.array(block, np.float64)
    s = np.array([r[:2] for r in spots], np.float64)
    dist = np.hypot(s[:, None, 0] - b[None, :, 0], s[:, None, 1] - b[None, :, 1])
    keep = (dist >= b[None, :, 2]).all(1)
    return [r for r, k in zip(spots, keep) if k]


# half the length and width of the biggest parked car (Map2Lap's cars.SHAPES: a 4.9 x 1.95 m van): a spot whose car
# would reach into a building is left empty
CAR_HALF_M = (2.45, 1.0)


def car_points(spots):
    """(k, 5, 2) the centre and the four corners of the car on each spot ([x, y, z, heading, ...], heading in
    degrees from +x: its nose), CAR_HALF_M round the centre. Pure."""
    s = np.asarray([r[:4] for r in spots], np.float64).reshape(-1, 4)
    a = np.radians(s[:, 3])
    u = np.column_stack([np.cos(a), np.sin(a)])
    v = np.column_stack([-u[:, 1], u[:, 0]])
    hl, hw = CAR_HALF_M
    offs = [(0, 0), (hl, hw), (hl, -hw), (-hl, hw), (-hl, -hw)]
    return np.stack([s[:, :2] + u * a_ + v * b_ for a_, b_ in offs], 1)


def _spot_corners(row):
    """Four corners of a marked parking space [x, y, z, heading, optional lot flag]. Pure."""
    x, y, _, heading = row[:4]
    half_l, half_w = ((LOT_SPOT_D_M / 2, LOT_SPOT_W_M / 2) if len(row) > 4
                      else (SPOT_LEN_M / 2, SPOT_W_M / 2))
    a = math.radians(heading)
    u = np.array([math.cos(a), math.sin(a)]) * half_l
    v = np.array([-math.sin(a), math.cos(a)]) * half_w
    c = np.array([x, y])
    return np.array([c + u + v, c + u - v, c - u - v, c - u + v])


def _spots_overlap(a, b):
    """Whether two oriented marked spaces overlap beyond their centimetre-rounding error. Pure."""
    # Spot coordinates are rounded to 0.01 m. Adjacent spaces share a line; 0.02 m covers both endpoints'
    # rounding and avoids treating their common boundary as occupied area.
    for ring in (a, b):
        for edge in np.roll(ring, -1, axis=0) - ring:
            axis = np.array([-edge[1], edge[0]])
            aa, bb = a @ axis, b @ axis
            if min(aa.max(), bb.max()) - max(aa.min(), bb.min()) <= 0.02 * np.linalg.norm(axis):
                return False
    return True


def resolve_spots(existing, lot=()):
    """Non-overlapping curb/aisle rows and mapped-lot rows, with mapped aisles first. Pure.

    Each source proposes full-size spaces. A curve or two sources may put them on top of one another; keep the
    first one in a stable coordinate order instead of squeezing it. The caller uses this same list for cars and
    stall markings.
    """
    groups = (sorted((r for r in existing if len(r) > 4), key=lambda r: tuple(r[:4])),
              sorted((r for r in existing if len(r) == 4), key=lambda r: tuple(r[:4])),
              sorted(lot, key=lambda r: tuple(r[:4])))
    cells, kept = {}, []
    for group in groups:
        for row in group:
            x, y = float(row[0]), float(row[1])
            key = (math.floor(x / 10), math.floor(y / 10))
            poly = _spot_corners(row)
            near = (j for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                    for j in cells.get((key[0] + dx, key[1] + dy), ()))
            if any(_spots_overlap(poly, _spot_corners(kept[j])) for j in near):
                continue
            cells.setdefault(key, []).append(len(kept))
            kept.append(row)
    return kept


def clear_of_buildings(spots, rings):
    """The spots whose car (car_points: its corners and centre) stands in none of the rings and has none of their
    corners inside it (a house's corner reaching into its side between the car's corners): the buildings as drawn (a
    curbside row runs on along the street's line through a house that stands in it, a stall's nose into the wall it
    faces). Pure."""
    if not spots or not rings:
        return list(spots or ())
    pts = car_points(spots)
    flat = pts.reshape(-1, 2)
    hit = np.zeros(len(flat), bool)
    lo, hi = flat.min(0), flat.max(0)
    s = np.asarray([r[:4] for r in spots], np.float64).reshape(-1, 4)
    a = np.radians(s[:, 3])
    u = np.column_stack([np.cos(a), np.sin(a)])
    corner = np.zeros(len(spots), bool)
    for ring in rings:
        r = np.asarray(ring, np.float64).reshape(-1, 2)
        if len(r) < 3 or (r.max(0) < lo).any() or (r.min(0) > hi).any():
            continue
        hit |= Path(r).contains_points(flat)
        d = r[None, :, :] - s[:, None, :2]                  # (spots, corners, 2): the ring's corners from each car
        along = (d * u[:, None, :]).sum(2)
        across = d[..., 0] * -u[:, None, 1] + d[..., 1] * u[:, None, 0]
        corner |= ((np.abs(along) < CAR_HALF_M[0]) & (np.abs(across) < CAR_HALF_M[1])).any(1)
    keep = ~hit.reshape(len(spots), 5).any(1) & ~corner
    return [r for r, k in zip(spots, keep) if k]


SIDEWALK_LEVEL_M = 0.5     # a 0.15 m curb and normal draping lie within this; a deck with vehicle clearance does not


def clear_of_sidewalks(spots, mesh, origin=(0, 0, 0), ground=None):
    """Parking rows whose car footprint misses the built sidewalk slabs on the same level. Pure.

    mesh is sidewalks.Builder.arrays() (positions relative to origin); material 0 is curb faces,
    the other materials are slab/tactile/brick tops. A raised bridge above a lot is left alone.
    """
    if not spots or mesh is None:
        return list(spots or ())
    p, indices, _uv, materials = mesh
    tops = np.asarray(indices)[np.asarray(materials) != 0]
    if not len(tops):
        return list(spots)
    triangles = np.asarray(p, np.float64)[tops] + np.asarray(origin, np.float64)
    lower, upper = triangles[:, :, :2].min(1), triangles[:, :, :2].max(1)
    kept = []
    for spot in spots:
        car = car_points([spot])[0]
        corners = car[[1, 2, 4, 3]]
        samples = np.concatenate((car, (corners + np.roll(corners, -1, axis=0)) / 2))
        near = (lower <= samples.max(0)).all(1) & (upper >= samples.min(0)).all(1)
        tri = triangles[near]
        if not len(tri):
            kept.append(spot)
            continue
        a, b, c = tri[:, 0], tri[:, 1], tri[:, 2]
        ab, ac = b[:, :2] - a[:, :2], c[:, :2] - a[:, :2]
        den = ab[:, 0] * ac[:, 1] - ab[:, 1] * ac[:, 0]
        q = samples[:, None, :] - a[None, :, :2]
        u = np.divide(q[..., 0] * ac[None, :, 1] - q[..., 1] * ac[None, :, 0], den[None],
                      out=np.zeros((len(samples), len(tri))), where=np.abs(den[None]) > 1e-12)
        v = np.divide(ab[None, :, 0] * q[..., 1] - ab[None, :, 1] * q[..., 0], den[None],
                      out=np.zeros_like(u), where=np.abs(den[None]) > 1e-12)
        inside = (np.abs(den)[None] > 1e-12) & (u >= 0) & (v >= 0) & (u + v <= 1)
        surface = a[None, :, 2] + u * (b - a)[None, :, 2] + v * (c - a)[None, :, 2]
        level = (np.asarray(ground(samples[:, 0], samples[:, 1]), np.float64) if ground is not None
                 else np.full(len(samples), float(spot[2])))
        if not np.any(inside & (np.abs(surface - level[:, None]) < SIDEWALK_LEVEL_M)):
            kept.append(spot)
    return kept


LOT_SPOT_W_M = 2.6          # a lot's stall: width along its row ...
LOT_SPOT_D_M = 5.5          # ... and depth (US: 8.5-9 ft x 18 ft)
LOT_AISLE_M = 7.0           # the driving aisle between rows (two-way, 90-degree stalls: ~24 ft)
LOT_MARGIN_M = 0.8          # kept in from the lot's edge
LOT_MAX_PER_TILE = 500
# The sum of two curb-space corner radii: any spaces on opposite sides of a tile seam that can overlap have
# centres within this halo. It also covers shorter 5.5 x 2.6 m lot spaces, without a guessed map distance.
SPOT_HALO_M = 2 * math.hypot(SPOT_LEN_M / 2, SPOT_W_M / 2)
LOT_CLASSES = {"parking"}   # (surface.PARKING_CLASSES: the lots painted asphalt)
# a mapped surface that is not a paved lot (OSM surface= on amenity=parking): no asphalt, no paint
LOT_UNPAVED = {"unpaved", "ground", "dirt", "earth", "mud", "grass", "sand", "soil", "gravel",
               "fine_gravel", "compacted", "woodchips", "grass_paver", "pebblestone"}
# stall paint, the road mesh's line layer (roads.EDGE_LINE's material: solid white, over the asphalt)
STALL_LINE = {"m": "line_white", "tl": 6.4, "p": 2, "w": 0.10}
MIN_MARK_M = 0.4            # a clipped stall line shorter than this is dropped
MARK_EDGE_M = 1e-3          # the tile box is half-open: a line on the far edge belongs to the next tile
# A mapped lot's polygon often takes in more than its stalls: drawn up to the road's centre line (its nodes shared
# with the way), its stalls and lines stood on half the carriageway (the Grossglockner road at the Glocknerhaus); drawn
# over the embankment down to a lower deck, its cars stood on their noses on the 13 m slope (4-9 m over a stall's
# 5.5 m). A stall stands clear of all mapped carriageways, including a lot's own aisles, and on ground no steeper
# than LOT_MAX_GRADE. (The elevation data's pixels blur a terraced lot's edge, so a real stall there can read steep:
# the limit stays well above a lot's few percent and well below an embankment's 80 %.)
LOT_MAX_GRADE = 0.45


def through_roads(roads, aisles=(), include_aisles=False):
    """fast.Others of the carriageways of roads ((fid, spec, centreline (k, 3), lon): build_tile's roads_out) but the
    parking aisles (aisles: their fids), or None without any. include_aisles: lot-grid stalls also clear mapped
    driving aisles within a lot; aisle_spots supply the stalls beside those roads instead."""
    rs = [(fid, spec.width / 2, pts) for fid, spec, pts, _ in roads or ()
          if (include_aisles or fid not in aisles) and len(pts) >= 2]
    if not rs:
        return None
    import fast
    return fast.Others(rs)


def _stalls_ok(centres, heading, z_at, through=None):
    """Which stalls (centres (k, 2), noses toward heading, degrees from +x: one or (k,)) stand clear of the through
    roads' carriageways (through_roads, or None) and on ground no steeper than LOT_MAX_GRADE (z_at(x, y) -> the
    ground, arrays; None: any): the plane through a stall's corners and centre."""
    c = np.asarray(centres, np.float64).reshape(-1, 2)
    ok = np.ones(len(c), bool)
    if not len(c):
        return ok
    a = np.radians(np.broadcast_to(np.asarray(heading, np.float64), (len(c),)))
    v = np.stack([np.cos(a), np.sin(a)], 1)
    u = np.stack([-v[:, 1], v[:, 0]], 1)
    hu, hv = LOT_SPOT_W_M / 2 - 0.1, LOT_SPOT_D_M / 2 - 0.1
    su = np.array([0.0, -1.0, 1.0, 1.0, -1.0])[:, None]
    sv = np.array([0.0, -1.0, -1.0, 1.0, 1.0])[:, None]
    pts = (c[None] + (su * hu)[..., None] * u[None] + (sv * hv)[..., None] * v[None]).reshape(-1, 2)
    if through is not None:
        ok &= np.array([through.clear(p, None, 0.0) for p in pts]).reshape(5, -1).all(0)
    if z_at is None:
        return ok
    z = np.asarray(z_at(pts[:, 0], pts[:, 1]), np.float64).reshape(5, -1)
    gu = (su * z).sum(0) / (4 * hu)        # (the least-squares plane's slopes: the points are symmetric)
    gv = (sv * z).sum(0) / (4 * hv)
    return ok & (np.hypot(gu, gv) <= LOT_MAX_GRADE)


def _lot_rows(hw):
    """Offsets across a lot (from its -v edge, which is at -hw) of its stall rows' centres and the side their
    noses point (-1: toward -v), for a lot 2 * hw wide: a single row along the -v edge, then double rows
    back to back, an aisle before each."""
    out = []
    o = LOT_MARGIN_M + LOT_SPOT_D_M / 2
    width = 2 * hw - LOT_MARGIN_M
    if o + LOT_SPOT_D_M / 2 > width:
        return out
    out.append((o, -1))
    o += LOT_SPOT_D_M / 2 + LOT_AISLE_M + LOT_SPOT_D_M / 2
    while o + LOT_SPOT_D_M / 2 <= width:
        out.append((o, 1))
        if o + LOT_SPOT_D_M * 1.5 <= width:
            out.append((o + LOT_SPOT_D_M, -1))
        o += 2 * LOT_SPOT_D_M + LOT_AISLE_M
    return out


def lot_spots(rings, box, z_at, blockers=(), through=None):
    """Rows [x, y, z, heading, 1] of the stalls of parking lots (rings: (k, 2) arrays in the anchor frame)
    whose centres are in the tile box: rows along each lot's long side, every stall wholly inside the lot, its
    centre in none of the blockers (building footprints: a garage's ground floor), clear of the through roads
    (through_roads) and level enough (_stalls_ok). z_at(x, y) -> the ground (arrays). Deterministic."""
    import buildings
    x0, y0, x1, y1 = box
    cand = []
    for ring in rings:
        ring = np.asarray(ring, np.float64)
        if len(ring) < 3:
            continue
        if ring[:, 0].max() < x0 or ring[:, 0].min() >= x1 or ring[:, 1].max() < y0 or ring[:, 1].min() >= y1:
            continue
        c, u, hl, hw = buildings.oriented_box(ring)
        if hw < LOT_SPOT_D_M / 2 or hl < LOT_SPOT_W_M:
            continue
        v = np.array([-u[1], u[0]])
        path = Path(ring)
        n_along = int((2 * hl - 2 * LOT_MARGIN_M) // LOT_SPOT_W_M)
        if n_along < 1:
            continue
        along = (np.arange(n_along) - (n_along - 1) / 2) * LOT_SPOT_W_M
        for off, nose in _lot_rows(hw):
            centres = c[None] + along[:, None] * u[None] + (off - hw) * v[None]
            hx, hy = u * (LOT_SPOT_W_M / 2 - 0.1), v * (LOT_SPOT_D_M / 2 - 0.1)
            ok = np.ones(len(centres), bool)
            for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                ok &= path.contains_points(centres + sx * hx + sy * hy)
            heading = math.degrees(math.atan2(nose * v[1], nose * v[0])) % 360.0
            own = centres[ok]
            own = own[np.array([_owns(box, q[0], q[1]) for q in own], bool)] if len(own) else own
            for q in own[_stalls_ok(own, heading, z_at, through)]:
                cand.append((float(q[0]), float(q[1]), heading))
    if not cand:
        return []
    pts = np.array([(x, y) for x, y, _ in cand])
    keep = np.ones(len(cand), bool)
    for b in blockers:
        b = np.asarray(b, np.float64)
        if len(b) >= 3:
            keep &= ~Path(b).contains_points(pts)
    cand = [cnd for cnd, k in zip(cand, keep) if k][:LOT_MAX_PER_TILE]
    if not cand:
        return []
    z = np.asarray(z_at(np.array([x for x, _, _ in cand]), np.array([y for _, y, _ in cand])), np.float64)
    return [[round(x, 2), round(y, 2), round(float(zz), 2), round(h, 1), 1] for (x, y, h), zz in zip(cand, z)]


def lot_unpaved(feats, i):
    """A parking polygon whose mapped surface is not a hard lot (grass, gravel, dirt): no asphalt, no stall
    lines. No surface mapped: a paved lot, as the ones the map leaves blank."""
    surf = feats.attrs.get("surface")
    if surf is None:
        return False
    return str(surf[i] or "").strip().lower() in LOT_UNPAVED


def lot_rings(frame, feats_list, paved_only=False):
    """The parking lot polygons (outer rings) of Overture infrastructure Features, in the anchor frame.
    paved_only: grass and gravel lots left out (the stall lines)."""
    out, seen = [], set()
    for f in feats_list:
        if f is None or len(f) == 0:
            continue
        cls = f.attrs.get("class")
        if cls is None:
            continue
        for i in np.flatnonzero(np.isin(cls.astype(str), list(LOT_CLASSES)) & (f.kind == 3)):
            if paved_only and lot_unpaved(f, i):
                continue
            fid = f.ids[i]
            if fid in seen:
                continue
            seen.add(fid)
            for part in f.parts(i):
                if part and len(part[0]) >= 3:
                    ll = np.asarray(part[0], np.float64)
                    e, n, _ = frame.geodetic_to_enu(ll[:, 1], ll[:, 0], 0.0)
                    out.append(np.stack([e, n], 1))
    return out


def tile_lot_spots(frame, tx, ty, md, elev, items=None, existing=None, roads_near=(), aisles=(), ground=None,
                   accepted_out=None):
    """The tile's accepted curb, aisle and mapped-lot spots; accepted_out includes the halo across tile edges.
    md supplies mapped lots; items supplies this tile's ground-level building blockers; roads_near and aisles
    supply carriageway blockers. ground or elev samples the drawn surface. Pure except for map-cell reads."""
    import roads
    existing = list(existing or [])
    box = roads.tile_bbox(tx, ty)
    halo = (box[0] - SPOT_HALO_M, box[1] - SPOT_HALO_M,
            box[2] + SPOT_HALO_M, box[3] + SPOT_HALO_M)
    import buildings
    blockers = buildings.ground_rings(items, *box[:2])     # (as drawn: a pitched roof's house is its oriented box)
    try:
        feats = [md.cell(k, layers=("infrastructure",), kind="demand").layers.get("infrastructure")
                 for k in roads.cells_of_tile(frame, tx, ty, margin=SPOT_HALO_M)]
        rings = lot_rings(frame, feats)
    except Exception:
        rings = []
    def z_at(x, y):                 # the anchor frame's up, as the ground drawn (the Earth's curve: raw heights stood a
        if ground is not None:
            return np.asarray(ground(x, y), np.float64)
        la, lo, _ = frame.enu_to_geodetic(x, y, 0.0)    # spot ~6 m up 10 km from the anchor, 18 m at 15 km)
        return frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))[2]
    if aisles:
        extra = aisle_spots(roads_near, aisles, halo, z_at=z_at)
        existing += [r for r in extra if not _owns(box, r[0], r[1])]
    existing = clear_of_buildings(existing, blockers)
    lots = clear_of_buildings(lot_spots(rings, halo, z_at, blockers,
                                       through_roads(roads_near, aisles, include_aisles=True)), blockers) if rings else []
    accepted = resolve_spots(existing, lots)
    if accepted_out is not None:
        accepted_out.extend(accepted)  # the markings crossing this tile's edge use the same accepted halo rows
    return [r for r in accepted if _owns(box, r[0], r[1])]


AISLE_END_M = 6.0           # stalls kept this far from an aisle's ends (its junctions)


def aisle_spots(roads, aisles, box, blockers=(), lots=(), z_at=None):
    """Rows [x, y, z, heading, 1] of 90-degree stalls along both sides of the parking aisles (aisles: their
    fids; Overture maps many lots by their aisles alone), LOT_SPOT_W_M apart at stations of the aisle, clear
    of its ends, of other roads and of buildings (blockers). If lots is given, it excludes those polygons.
    Stalls must be level enough (_stalls_ok; z_at(x, y) -> the ground, arrays; None: any); nose in, away from the aisle.
    (An aisle along a slope's edge: its stalls on the valley side stood on the slope.)"""
    x0, y0, x1, y1 = box
    import fast
    others = fast.Others([(fid, spec.width / 2, pts) for fid, spec, pts, _ in roads if fid not in aisles])
    all_roads = through_roads(roads, include_aisles=True)
    paths = [Path(np.asarray(b, np.float64)) for b in list(blockers) + list(lots) if len(b) >= 3]
    out = []
    for fid, spec, line, _ in roads:
        if fid not in aisles or len(line) < 2:
            continue
        for side in (1.0, -1.0):
            Q, D, st, offset = _aisle_stations(fid, spec, line, side)
            if not len(st):
                continue
            P, _ = furniture._at(line, furniture._project(line, Q[:, :2]))
            n = np.stack([-D[:, 1], D[:, 0]], 1) * side
            flat = _stalls_ok(Q[:, :2], np.degrees(np.arctan2(n[:, 1], n[:, 0])), z_at, all_roads)
            for q, nn, p in zip(Q[flat], n[flat], P[flat]):
                if not (_owns(box, q[0], q[1])):
                    continue
                if not furniture._clear(np.array([q[0], q[1], p[2]]), others, fid):
                    continue
                if _hit(paths, q):
                    continue
                out.append([round(float(q[0]), 2), round(float(q[1]), 2), round(float(p[2]), 2),
                            round(math.degrees(math.atan2(nn[1], nn[0])) % 360.0, 1), 1])
    return out


def _aisle_stations(fid, spec, line, side):
    """Spot centres and tangents at regular distances along the actual stall row, not the aisle's middle. Pure.

    On the inside of a bend the row is shorter than the centreline; centreline stationing compressed adjacent
    2.6 m stalls into one another at Friedensbruecke and Weblinger Guertel. The offset is the aisle's half width
    plus half a 5.5 m deep stall. A mitered sharp corner can still fold; final overlap filtering handles that.
    """
    import roads
    offset = roads.offset_polyline(line, side * (spec.width / 2 + LOT_SPOT_D_M / 2))
    length = furniture._arclen(offset)[-1]
    if length < 2 * AISLE_END_M + LOT_SPOT_W_M:
        return np.empty((0, 3)), np.empty((0, 2)), np.empty(0), offset
    phase = furniture._h01(fid, "aisle", side) * LOT_SPOT_W_M
    st = np.arange(AISLE_END_M + phase, length - AISLE_END_M, LOT_SPOT_W_M)
    if not len(st):
        return np.empty((0, 3)), np.empty((0, 2)), st, offset
    q, d = furniture._at(offset, st)
    return q, d, st, offset


def _hit(paths, q):
    """Does q lie in any of the polygons (Path.contains_points; one point)?"""
    if not paths:
        return False
    pt = np.atleast_2d(np.asarray(q, np.float64))[..., :2]
    return any(bool(np.asarray(pa.contains_points(pt)).reshape(-1)[0]) for pa in paths)


def _groups(ok):
    """Inclusive index ranges of consecutive True values in ok."""
    idx = np.flatnonzero(ok)
    if not len(idx):
        return []
    groups, start, prev = [], int(idx[0]), int(idx[0])
    for i in idx[1:]:
        i = int(i)
        if i == prev + 1:
            prev = i
        else:
            groups.append((start, prev))
            start = prev = i
    groups.append((start, prev))
    return groups


def _clip_seg(a, b, box):
    """The part of segment a..b inside box (x0, y0, x1, y1), or None. a and b are (x, y) or (x, y, z);
    z is lerped. Cohen-Sutherland."""
    x0, y0, x1, y1 = box
    ax, ay, bx, by = float(a[0]), float(a[1]), float(b[0]), float(b[1])
    za = float(a[2]) if len(a) > 2 else 0.0
    zb = float(b[2]) if len(b) > 2 else 0.0
    oax, oay, obx, oby, oza, ozb = ax, ay, bx, by, za, zb

    def code(x, y):
        c = 0
        if x < x0:
            c |= 1
        elif x > x1:
            c |= 2
        if y < y0:
            c |= 4
        elif y > y1:
            c |= 8
        return c

    ca, cb = code(ax, ay), code(bx, by)
    for _ in range(8):
        if not (ca | cb):
            dx, dy = obx - oax, oby - oay
            den = dx * dx + dy * dy

            def at(x, y, z0):
                if den < 1e-12:
                    return z0
                t = float(np.clip(((x - oax) * dx + (y - oay) * dy) / den, 0.0, 1.0))
                return oza + t * (ozb - oza)

            return (ax, ay, at(ax, ay, oza)), (bx, by, at(bx, by, ozb))
        if ca & cb:
            return None
        c = ca or cb
        if c & 8:
            x = ax + (bx - ax) * (y1 - ay) / (by - ay or 1e-12)
            y = y1
        elif c & 4:
            x = ax + (bx - ax) * (y0 - ay) / (by - ay or 1e-12)
            y = y0
        elif c & 2:
            y = ay + (by - ay) * (x1 - ax) / (bx - ax or 1e-12)
            x = x1
        else:
            y = ay + (by - ay) * (x0 - ax) / (bx - ax or 1e-12)
            x = x0
        if c == ca:
            ax, ay, ca = x, y, code(x, y)
        else:
            bx, by, cb = x, y, code(x, y)
    return None


def _line_chunk(a, b):
    return {"m": STALL_LINE["m"], "w": round(STALL_LINE["w"], 2), "tl": STALL_LINE["tl"], "p": STALL_LINE["p"],
            "n": [[round(float(a[0]), 3), round(float(a[1]), 3), round(float(a[2]), 3)],
                  [round(float(b[0]), 3), round(float(b[1]), 3), round(float(b[2]), 3)]]}


def _boxed_chunks(segs, box):
    """2-point line chunks of segs [((x, y, z), (x, y, z))] clipped to the half-open tile box."""
    x0, y0, x1, y1 = box
    if x1 - x0 <= MARK_EDGE_M or y1 - y0 <= MARK_EDGE_M:
        return []
    closed = (x0, y0, x1 - MARK_EDGE_M, y1 - MARK_EDGE_M)
    out = []
    for a, b in segs:
        got = _clip_seg(a, b, closed)
        if got is None:
            continue
        p, q = got
        if math.hypot(q[0] - p[0], q[1] - p[1]) < MIN_MARK_M:
            continue
        out.append(_line_chunk(p, q))
    return out


def _row_segs(c, u, v, along, off, hw, nose, ok, back):
    """Divider segments and (back) the line across the heads of one stall row. ok: which stalls stand."""
    nose_vec = nose * v
    depth, side = LOT_SPOT_D_M / 2, LOT_SPOT_W_M / 2
    segs = []

    def edge(i, which):
        base = c + (along[i] + which * side) * u + (off - hw) * v
        p0 = base - nose_vec * depth
        p1 = base + nose_vec * depth
        return (float(p0[0]), float(p0[1]), 0.0), (float(p1[0]), float(p1[1]), 0.0)

    for a, b in _groups(ok):
        ends = [edge(a, -1)[1]]
        segs.append(edge(a, -1))
        for i in range(a, b + 1):
            e = edge(i, 1)
            segs.append(e)
            ends.append(e[1])
        if back and len(ends) >= 2:
            segs.append((ends[0], ends[-1]))
    return segs


def lot_markings(rings, box, z_at, blockers=(), through=None, allowed=None):
    """line_white chunks of the stall lines of parking lots (the rows lot_spots parks cars in): a divider
    between stalls and a line across their heads, each stall wholly inside its lot, its centre in none of
    the blockers (a garage), clear of the through roads (through_roads) and level enough (_stalls_ok). A
    back-to-back pair shares one head line. Clipped to the tile box. z_at(x, y) the ground. Deterministic."""
    import buildings
    x0, y0, x1, y1 = box
    pad = LOT_SPOT_D_M
    ex0, ey0, ex1, ey1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    segs, n_stalls = [], 0
    blocks = [Path(np.asarray(b, np.float64)) for b in blockers if len(np.asarray(b)) >= 3]
    for ring in rings:
        if n_stalls >= LOT_MAX_PER_TILE:
            break
        ring = np.asarray(ring, np.float64)
        if len(ring) < 3:
            continue
        if ring[:, 0].max() < x0 or ring[:, 0].min() >= x1 or ring[:, 1].max() < y0 or ring[:, 1].min() >= y1:
            continue
        c, u, hl, hw = buildings.oriented_box(ring)
        if hw < LOT_SPOT_D_M / 2 or hl < LOT_SPOT_W_M:
            continue
        v = np.array([-u[1], u[0]])
        path = Path(ring)
        n_along = int((2 * hl - 2 * LOT_MARGIN_M) // LOT_SPOT_W_M)
        if n_along < 1:
            continue
        along = (np.arange(n_along) - (n_along - 1) / 2) * LOT_SPOT_W_M
        rows = _lot_rows(hw)
        paired = {round(off + LOT_SPOT_D_M, 3) for off, nose in rows if nose > 0}
        for off, nose in rows:
            if n_stalls >= LOT_MAX_PER_TILE:
                break
            centres = c[None] + along[:, None] * u[None] + (off - hw) * v[None]
            hx, hy = u * (LOT_SPOT_W_M / 2 - 0.1), v * (LOT_SPOT_D_M / 2 - 0.1)
            ok = np.ones(len(centres), bool)
            for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                ok &= path.contains_points(centres + sx * hx + sy * hy)
            ok &= (centres[:, 0] >= ex0) & (centres[:, 0] < ex1) & (centres[:, 1] >= ey0) & (centres[:, 1] < ey1)
            for pa in blocks:
                ok &= ~pa.contains_points(centres)
            if ok.any():
                ok[ok] = _stalls_ok(centres[ok], math.degrees(math.atan2(nose * v[1], nose * v[0])) % 360.0, z_at,
                                    through)
            if allowed is not None:
                ok &= np.array([(round(float(q[0]), 2), round(float(q[1]), 2)) in allowed for q in centres], bool)
            room = LOT_MAX_PER_TILE - n_stalls
            if int(ok.sum()) > room:
                idx = np.flatnonzero(ok)
                ok[:] = False
                ok[idx[:room]] = True
            n_stalls += int(ok.sum())
            if not ok.any():
                continue
            segs.extend(_row_segs(c, u, v, along, off, hw, nose, ok, round(off, 3) not in paired))
    chunks = _boxed_chunks(segs, box)
    if not chunks:
        return []
    pts = np.array([(n[0], n[1]) for c in chunks for n in c["n"]], np.float64)
    z = np.asarray(z_at(pts[:, 0], pts[:, 1]), np.float64)
    for i, c in enumerate(chunks):
        c["n"][0][2] = round(float(z[2 * i]), 3)
        c["n"][1][2] = round(float(z[2 * i + 1]), 3)
    return chunks


def _aisle_side_segs(offset, st, keep, side):
    """Divider and head-line segments along one side of an aisle, for the stations keep marks."""
    half, depth = LOT_SPOT_W_M / 2, LOT_SPOT_D_M / 2
    segs = []
    for a, b in _groups(keep):
        ends = np.array([st[a] - half] + [st[i] + half for i in range(a, b + 1)], np.float64)
        ends = np.clip(ends, 0.0, furniture._arclen(offset)[-1])
        P, D = furniture._at(offset, ends)
        nrm = np.stack([-D[:, 1], D[:, 0]], 1) * side
        inner = P[:, :2] - nrm * depth
        outer = P[:, :2] + nrm * depth
        for i in range(len(ends)):
            z = float(P[i, 2])
            segs.append(((float(inner[i, 0]), float(inner[i, 1]), z), (float(outer[i, 0]), float(outer[i, 1]), z)))
        for i in range(len(ends) - 1):
            segs.append(((float(outer[i, 0]), float(outer[i, 1]), float(P[i, 2])),
                         (float(outer[i + 1, 0]), float(outer[i + 1, 1]), float(P[i + 1, 2]))))
    return segs


def aisle_markings(roads, aisles, box, blockers=(), lots=(), z_at=None, allowed=None):
    """line_white chunks of the stall lines along both sides of the parking aisles (aisles: their fids),
    the rows aisle_spots parks in: clear of the aisle's ends, of other roads, of buildings and of mapped
    lots, on ground level enough (z_at: as aisle_spots'). Nose away from the aisle. Clipped to the tile box.
    Deterministic."""
    x0, y0, x1, y1 = box
    import fast
    others = fast.Others([(fid, spec.width / 2, pts) for fid, spec, pts, _ in roads if fid not in aisles])
    all_roads = through_roads(roads, include_aisles=True)
    paths = [Path(np.asarray(b, np.float64)) for b in list(blockers) + list(lots) if len(np.asarray(b)) >= 3]
    pad = LOT_SPOT_D_M
    ex0, ey0, ex1, ey1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    segs, n_stalls = [], 0
    for fid, spec, line, _ in roads:
        if n_stalls >= LOT_MAX_PER_TILE or fid not in aisles or len(line) < 2:
            continue
        for side in (1.0, -1.0):
            if n_stalls >= LOT_MAX_PER_TILE:
                break
            Q, D, st, offset = _aisle_stations(fid, spec, line, side)
            if not len(st):
                continue
            P, _ = furniture._at(line, furniture._project(line, Q[:, :2]))
            n = np.stack([-D[:, 1], D[:, 0]], 1) * side
            keep = _stalls_ok(Q[:, :2], np.degrees(np.arctan2(n[:, 1], n[:, 0])), z_at, all_roads)
            for i, (q, p) in enumerate(zip(Q, P)):
                if allowed is not None and \
                        (round(float(q[0]), 2), round(float(q[1]), 2)) not in allowed:
                    keep[i] = False
                    continue
                if not (ex0 <= q[0] < ex1 and ey0 <= q[1] < ey1):
                    keep[i] = False
                    continue
                if not furniture._clear(np.array([q[0], q[1], p[2]]), others, fid):
                    keep[i] = False
                    continue
                if _hit(paths, q):
                    keep[i] = False
            room = LOT_MAX_PER_TILE - n_stalls
            if int(keep.sum()) > room:
                idx = np.flatnonzero(keep)
                keep[:] = False
                keep[idx[:room]] = True
            n_stalls += int(keep.sum())
            if keep.any():
                segs.extend(_aisle_side_segs(offset, st, keep, side))
    return _boxed_chunks(segs, box)


def drop_covered(chunks, rings):
    """The line chunks whose midpoint lies in none of the rings (a mapped lot or a building: that ground
    is marked by lot_markings, or is indoors)."""
    paths = [Path(np.asarray(r, np.float64)) for r in rings if len(np.asarray(r)) >= 3]
    if not paths:
        return list(chunks or [])
    kept = []
    for ch in chunks or ():
        n = ch.get("n") or []
        if len(n) < 2:
            continue
        mid = ((n[0][0] + n[1][0]) / 2.0, (n[0][1] + n[1][1]) / 2.0)
        if _hit(paths, mid):
            continue
        kept.append(ch)
    return kept


def finish_markings(frame, tx, ty, md, elev, items=None, marks=(), roads_near=(), aisles=(), spots=None, ground=None):
    """A road tile's stall-line chunks: accepted aisle lines outside this tile's buildings, plus
    lot_markings of the paved lots under the tile, clear of all mapped roads near it
    (roads_near: build_tile's roads_out; aisles: build_tile's aisles_out). elev(lat, lon) the ground."""
    import roads
    box = roads.tile_bbox(tx, ty)
    blockers = [spec.ring + np.array(box[:2]) for spec, *_ in (items or ()) if getattr(spec, "ring", None) is not None]
    try:
        feats = [md.cell(k, layers=("infrastructure",), kind="demand").layers.get("infrastructure")
                 for k in roads.cells_of_tile(frame, tx, ty, margin=0.0)]
        rings = lot_rings(frame, feats, paved_only=True)
    except Exception:
        rings = []

    def z_at(x, y):
        if ground is not None:
            return np.asarray(ground(x, y), np.float64)
        la, lo, _ = frame.enu_to_geodetic(np.asarray(x, np.float64), np.asarray(y, np.float64), 0.0)
        return frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))[2]

    allowed = {(r[0], r[1]) for r in spots} if spots is not None else None
    if allowed is not None:
        marks = aisle_markings(roads_near, aisles, box, blockers, z_at=z_at, allowed=allowed)
    return drop_covered(marks, blockers) + lot_markings(rings, box, z_at, blockers,
                                                       through_roads(roads_near, aisles, include_aisles=True),
                                                       allowed=allowed)
