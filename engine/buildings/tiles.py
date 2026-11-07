"""tile_buildings, toll plazas, a tile's files."""
import json
import os
import math

import numpy as np

import mapgeom

from .looks import (
    BRIDGE_CLASSES, CHURCH_OVER, FLOOR_M, FOUNDATION_M, INDUSTRIAL_CLASSES, MIN_AREA_M2, SHED_CLASSES, STEEL_MATERIALS,
    _hash01
)
from .styles import _area2, clean_ring, oriented_box, tree_line_m
from .mesh import OVER_TUNNEL_CLEAR_M, _portal_lift
from .places import castle_rings, church_rings, footprint_names, footprint_signs, footprint_uses, names_for, signs_for
from .garages import deck_plan, on_deck
from .sites import _covers_garage, _ml_false, _ml_steep, _on_support, _passages, road_across, road_through
from .build import _part_heights, _shared_walls
from .planner import plan
from .photo import BRICK_WALK_COVERAGE

ALPINE_COVER = 0.02          # ... in a tile this empty gets dressed stone walls (Mount Whitney's
                             # stone summit hut was a plain grey box)
TUNNEL_THROUGH_M = 5.0      # a footprint a road tunnel runs into this far: its portal building, lifted over the tube
CENTRE_PREFILTER_M = 1.0       # m of slack for Features.outer_centres (cumulative sums: within ~1e-5 m of the exact mean)
ROAD_THROUGH_M = 15.0       # a footprint that public roads run through this far is a structure over them
OVER_ROAD_CLEAR_M = 5.5     # ... lifted this high (an expressway's or a station's slab over the streets: Baltimore's
                            # 17,500 m2 one by I-83, the AI drove into its wall at 35 mph)


TOWN_COVERAGE = 0.16        # a tile whose footprints cover less than this share is a town / suburb (heights)


def _parts_index(f):
    """{building id: [rows]} of a building parts layer, kept on it (the cells stay decoded in memory: every tile of
    them looks parts up again)."""
    memo = f.__dict__.get("_bnge_parts_by_bid")
    if memo is None:
        memo = {}
        col = f.attrs.get("building_id")
        if col is not None:
            for i in range(len(f.kind)):
                bid = str(col[i])
                if bid:
                    memo.setdefault(bid, []).append(i)
        f.__dict__["_bnge_parts_by_bid"] = memo
    return memo


def _parts_tops(f):
    """Each part's own height + bottom (_part_heights' sum; nan without a height) for the whole layer, kept on it."""
    tops = f.__dict__.get("_bnge_parts_tops")
    if tops is None:
        a, n = f.attrs, len(f.kind)

        def col(k):
            return np.asarray(a[k], np.float64) if k in a else np.full(n, np.nan)
        with np.errstate(invalid="ignore"):
            top, mh, nf, f0 = col("height"), col("min_height"), col("num_floors"), col("min_floor")
            mh = np.where(np.isfinite(mh) & (mh > 0), mh, 0.0)
            f0 = np.where(np.isfinite(f0) & (f0 > 0), f0, 0.0)
            floors = np.maximum(FLOOR_M, (nf - f0) * FLOOR_M) + np.where(mh > 0, mh, f0 * FLOOR_M)
            tops = np.where(np.isfinite(top) & (top > mh + 1.0), top,
                            np.where(np.isfinite(nf) & (nf > 0), floors, np.nan))
        f.__dict__["_bnge_parts_tops"] = tops
    return tops


class _PartsOf:
    """The building parts of a tile's cells by building id, each [(ring in the anchor frame, _part_heights)], made
    when asked for: a tile needs those of its own buildings, and the toll booths (booths), not all the cells' parts
    (converting every part for every tile was half of tile_buildings' time in Manhattan). A part in two
    cells' layers is taken once (the first)."""

    def __init__(self, frame, part_layers):
        self.frame = frame
        self.layers = [f for f in part_layers if f is not None and len(f.kind)]
        self.memo = {}

    def _part(self, f, i):
        pp = f.parts(i)
        if not pp or not pp[0]:
            return None
        outer = np.asarray(pp[0][0], np.float64)
        if len(outer) < 4:
            return None
        e, n = mapgeom.enu_xy(f, self.frame, outer)
        a = f.attrs
        # (its own roof shape and mapped colours: hudsontadams')
        own = {k: (a[k][i] if k in a else None) for k in ("roof_shape", "facade_color", "roof_color")}
        return np.stack([e, n], 1), _part_heights(a, i), own

    def get(self, bid, default=None):
        if bid not in self.memo:
            out, seen = [], set()
            for f in self.layers:
                for i in _parts_index(f).get(bid, ()):
                    pid = f.ids[i]
                    if pid in seen:
                        continue
                    seen.add(pid)
                    p = self._part(f, i)
                    if p is not None:
                        out.append(p)
            self.memo[bid] = out or None
        got = self.memo[bid]
        return default if got is None else got

    def booths(self, lo, hi):
        """The parts (ring, _part_heights) whose top (own height + bottom) is within [lo, hi], of any building."""
        out, seen = [], set()
        for f in self.layers:
            index = _parts_index(f)
            if not index:
                continue
            col = f.attrs["building_id"]
            tops = _parts_tops(f)
            with np.errstate(invalid="ignore"):
                rows = np.flatnonzero((tops >= lo - 1e-6) & (tops <= hi + 1e-6))
            for i in rows.tolist():
                pid = f.ids[i]
                if pid in seen or not str(col[i]):
                    continue
                seen.add(pid)
                p = self._part(f, i)
                if p is not None:
                    out.append(p[:2])
        return out


def tile_buildings(frame, x0, y0, x1, y1, layers, elev, water=None, part_layers=(), west_town=False, roads_xy=None,
                   tunnels_xy=None, garages_xy=None, supports=None, bridges_xy=None, water_xy=None, decks=None,
                   ml_roads_xy=None, ways_xy=None, skip=frozenset(), min_size=None, own=None, uses=None,
                   country=None, worship=(), castles=()):
    """[(Spec, gmin, gmax)] of the buildings whose footprint centroid is in the tile [x0, x1) x [y0, y1) (own: the
    tile's box when it says which points are its own, roads.box_owns: a geotile's)
    (anchor frame), rings relative to (x0, y0). layers: mapgeom.Features of buildings (one per map cell; a
    building in two cells is taken once, by id); elev(lat, lon) the physics ground. part_layers: the
    building parts of the same cells: a building whose parts all have heights is drawn as its parts
    (each from its bottom to its top, the building's look). garages_xy: garage_rings (a building one covers, or
    covering one's centre, is a parking structure). supports: support_rings (a building or part on one is the
    bridge's painted steel). bridges_xy / water_xy (bridge_lines, water_rings): a machine-learned footprint (not
    OSM) on a road bridge, over water or on a public road (roads_xy, or ml_roads_xy for that test alone: the far
    buildings) is a deck, a boat or a vehicle, left out (_ml_false). skip: ids of buildings left out (a gas station's
    canopy, drawn by the mod from the stock levels' props: gasstations.tile_sites). min_size (min height m, min
    footprint m²): only buildings at least that tall or that large (the skyline tiles: skyline_tile), tested before
    any other work on a building. uses: use_data's places and land use relative to (x0, y0): an unclassed footprint
    takes the class they give (footprint_uses), a shop or hall the names on its signs (names_for, invented ones in
    country's language: an ISO code), any building its other signs (signs_for: public buildings, hotels, pharmacies,
    offices). worship: worship_boxes relative to (x0, y0): the footprints they name are churches (church_rings);
    castles: castle_boxes relative to (x0, y0): the footprints on a castle's site or a ruin's (castle_rings)."""
    parts_of = _PartsOf(frame, part_layers)     # building id -> [(ring in the anchor frame, (own height, bottom))]
    seen = set()
    rings, attrs, looks, mins = [], [], [], []
    for f in layers:
        if f is None or len(f.kind) == 0:
            continue
        a = f.attrs
        ids = getattr(f, "ids", None)
        rows = range(len(f.kind))
        if isinstance(f, mapgeom.Features):     # only the buildings whose centre may be in the tile (the exact test below)
            cx_, cy_ = f.outer_centres(frame)
            m = CENTRE_PREFILTER_M
            rows = np.flatnonzero((cx_ >= x0 - m) & (cx_ < x1 + m) & (cy_ >= y0 - m) & (cy_ < y1 + m)).tolist()
        for i in rows:
            if a.get("is_underground") is not None and bool(a["is_underground"][i]):
                continue
            lv = a["level"][i] if a.get("level") is not None else None
            if lv is not None and np.isfinite(lv) and lv < 0:
                continue                # below ground (Shot Tower Metro, level -2, stood across a Baltimore street)
            key = ids[i] if ids is not None else None
            if key is not None and (key in seen or key in skip):
                continue
            parts = f.parts(i)
            if not parts or not parts[0]:
                continue
            outer = np.asarray(parts[0][0], np.float64)
            if len(outer) < 4:
                continue
            e, n = mapgeom.enu_xy(f, frame, outer)
            k = len(e) - 1             # the same reduction as np.mean, without its wrapper (36k calls a tile set)
            cx, cy = float(e[:-1].sum() / k), float(n[:-1].sum() / k)
            if not (x0 <= cx < x1 and y0 <= cy < y1) if own is None else not own.owns(cx, cy):
                continue
            if min_size is not None:
                h_ = a["height"][i] if a.get("height") is not None else None
                if h_ is None or not np.isfinite(h_):
                    fl_ = a["num_floors"][i] if a.get("num_floors") is not None else None
                    h_ = float(fl_) * 3.2 if fl_ is not None and np.isfinite(fl_) else 0.0
                if h_ < min_size[0] and abs(float(np.dot(e[:-1], n[1:]) - np.dot(e[1:], n[:-1]))) / 2 < min_size[1]:
                    continue
            at = {k: (a[k][i] if k in a else None) for k in
                  ("class", "height", "num_floors", "min_height", "roof_shape", "roof_height", "name",
                   "facade_material", "facade_color", "roof_material", "roof_color")}
            if key is not None:         # (plan's random choices keyed on the feature, not where the anchor puts it)
                at["seed_id"] = str(key)
            hh_ = at.get("height")
            if hh_ is not None and np.isfinite(hh_) and 0 < hh_ < FLAT_FOOTPRINT_M and not parts_of.get(str(key)):
                continue                # a mapped area, not a building (the Golden Gate toll plaza's 0.01 m footprint
                                        # drew a slab with a rim round the booths)
            bparts = parts_of.get(str(key)) if key is not None else None
            if bparts and any(p[1] is not None for p in bparts):
                # drawn as its parts, with the building's class and one look for all of them; a part
                # without a height takes the building's (else its lowest known part's)
                look = _hash01(str(key), "look")
                bh = at.get("height")
                fill = float(bh) if bh is not None and np.isfinite(bh) and bh > 0 else \
                    min(p[1][0] + p[1][1] for p in bparts if p[1] is not None)
                top = max([fill] + [p[1][0] + p[1][1] for p in bparts if p[1] is not None])
                for ppart in bparts:
                    pring, hh = ppart[0], ppart[1]
                    pat = ppart[2] if len(ppart) > 2 else {}
                    ph, pmh = hh if hh is not None else (fill, 0.0)
                    if ph + pmh < FLAT_FOOTPRINT_M:
                        continue        # (a part taking a flat area's height: FLAT_FOOTPRINT_M)
                    r = clean_ring(pring - np.array([x0, y0]))
                    if r is None or _area2(r) / 2 < 4.0:
                        continue
                    rings.append(r)
                    p_rshape = str(pat.get("roof_shape") or "").lower() or "flat"
                    p_fcol = pat.get("facade_color") or at.get("facade_color")
                    p_rcol = pat.get("roof_color") or at.get("roof_color")
                    attrs.append({"class": at["class"], "height": ph, "num_floors": None,
                                  "roof_shape": p_rshape,
                                  "building_height": top, "facade_material": at.get("facade_material"),
                                  "facade_color": p_fcol,
                                  "roof_material": at.get("roof_material"),
                                  "roof_color": p_rcol,
                                  "bridge_part": _on_support(r, supports) if str(at.get("facade_material") or "")
                                  .lower() in STEEL_MATERIALS else None,
                                  "bridge_masonry": str(at.get("facade_material") or "").lower()
                                  if _on_support(r, supports) is not None and str(at.get("facade_material") or "")
                                  .lower() not in STEEL_MATERIALS else None})
                    looks.append(look)
                    mins.append(pmh)
                if key is not None:
                    seen.add(key)
                continue
            ring = clean_ring(np.stack([e - x0, n - y0], 1))
            if ring is None or _area2(ring) / 2 < MIN_AREA_M2:
                continue
            is_ml = "src_dataset" in a and str(a["src_dataset"][i]) != "OpenStreetMap"
            if is_ml and _ml_false(ring, bridges_xy, water_xy, ml_roads_xy if ml_roads_xy is not None else roads_xy):
                continue
            if key is not None:
                seen.add(key)
            rings.append(ring)
            mh = at.get("min_height")
            mh = float(mh) if mh is not None and np.isfinite(mh) and mh > 0 else 0.0
            if mh <= 0.5 and roads_xy and (road_through(ring, roads_xy) >= ROAD_THROUGH_M or road_across(ring, roads_xy)):
                mh = OVER_ROAD_CLEAR_M
                h = at.get("height")
                if h is None or not np.isfinite(h) or h < mh + 3.0:
                    at = dict(at, height=mh + 3.0)      # keeps its top; at least a slab's worth over the clearance
            if mh < OVER_TUNNEL_CLEAR_M and tunnels_xy and road_through(ring, tunnels_xy) >= TUNNEL_THROUGH_M:
                # over a tunnel: its floor OVER_TUNNEL_CLEAR_M over the road at the mouth near it (the lowest ground
                # along the tunnel's line round it), from its own lowest ground (base_z); none where its ground is
                # that high already (a house on the hill over the tube: Wabash's floated ~10 m)
                lift = _portal_lift(frame, ring, x0, y0, tunnels_xy, elev)
                if lift > 0.5:
                    mh = lift
                    at = dict(at, portal=True)
                    h = at.get("height")
                    if h is None or not np.isfinite(h) or h < mh + 3.0:
                        at = dict(at, height=mh + 3.0)
            if mh <= 0.5 and garages_xy and _covers_garage(ring, garages_xy):
                at = dict(at, garage=True)
            on = _on_support(ring, supports)
            if on is not None:              # a bridge's own: no flats' windows (Tower Bridge's towers)
                fm_ = str(at.get("facade_material") or "").lower()
                at = dict(at, bridge_part=on) if fm_ in STEEL_MATERIALS else dict(at, bridge_masonry=fm_)
            if is_ml:
                at = dict(at, ml=True)          # (_ml_steep once its ground is known)
            attrs.append(at)
            looks.append(None)
            mins.append(mh)
    if not rings:
        return []
    for k in church_rings(rings, worship):
        if looks[k] is None and str(attrs[k].get("class") or "") in CHURCH_OVER:
            attrs[k] = dict(attrs[k], **{"class": "church"})
    for k, kind in castle_rings(rings, castles).items():
        if looks[k] is None:
            attrs[k] = dict(attrs[k], castle=kind)
    if uses is not None:
        todo = [k for k, (at, look) in enumerate(zip(attrs, looks)) if look is None and not at.get("class")]
        for k, u in zip(todo, footprint_uses([rings[k] for k in todo], *uses)):
            if u is not None:
                attrs[k] = dict(attrs[k], use=u)
        todo = [k for k, look in enumerate(looks) if look is None]
        for k, got, sg in zip(todo, footprint_names([rings[k] for k in todo], uses[0]),
                              footprint_signs([rings[k] for k in todo], uses[0])):
            if got or sg:
                attrs[k] = dict(attrs[k], places=got, signs=sg)
    if bridges_xy or decks:             # a road bridge through a building: a passage (Tower Bridge's towers and gate)
        def ground_at(c):
            la, lo, _ = frame.enu_to_geodetic(float(c[0]) + x0, float(c[1]) + y0, 0.0)
            z = float(np.asarray(elev(np.array([float(la)]), np.array([float(lo)])), np.float64)[0])
            return float(frame.geodetic_to_enu(float(la), float(lo), z)[2])       # (the decks' frame up)
        rings, attrs, looks, mins = _passages(rings, attrs, looks, mins, bridges_xy, decks, ground_at)
    shared = _shared_walls(rings)
    cover = sum(_area2(r) / 2 for r, mh in zip(rings, mins) if mh <= 0.5) / ((x1 - x0) * (y1 - y0))
    town, dense = cover < TOWN_COVERAGE, cover > BRICK_WALK_COVERAGE
    clat, clon, _ = frame.enu_to_geodetic((x0 + x1) / 2, (y0 + y1) / 2, 0.0)
    clat, clon = float(clat), float(clon)
    alpine = False
    if cover < ALPINE_COVER:
        try:
            gz = float(np.asarray(elev(np.array([clat]), np.array([clon])), np.float64)[0])
            alpine = np.isfinite(gz) and gz > tree_line_m(clat)
        except Exception:
            alpine = False
    # the ground at every building's corners in one call (elev and the frame's conversions are point by point; a
    # call per building cost a far buildings tile ~20 % of its time)
    ends = np.cumsum([len(r) for r in rings])
    allr = np.concatenate(rings)
    la_all, lo_all, _ = frame.enu_to_geodetic(allr[:, 0] + x0, allr[:, 1] + y0, np.zeros(len(allr)))
    la_all, lo_all = np.asarray(la_all, np.float64), np.asarray(lo_all, np.float64)
    g_all = np.asarray(elev(la_all, lo_all), np.float64)
    ok = np.isfinite(g_all)
    # heights above the ellipsoid -> the anchor frame's up (the Earth's curvature, as the terrain and the roads):
    # without it a building stood (d^2 / 2R) over the ground at d from the anchor's origin, 5 m at 8 km, up to
    # 18 m at the 15 km rebase distance (at Santa Maria Val Muestair: floating houses)
    up_all = np.full(len(allr), np.nan)
    if ok.any():
        up_all[ok] = np.asarray(frame.geodetic_to_enu(la_all[ok], lo_all[ok], g_all[ok])[2], np.float64)
    out = []
    for k, (ring, at, sh, look, mh) in enumerate(zip(rings, attrs, shared, looks, mins)):
        if mh > 0.5 and at.get("height") is not None and np.isfinite(at["height"]) and look is None:
            at = dict(at, height=max(2.5, float(at["height"]) - mh))     # a building's own height range
        spec = plan(ring, at, int(sh) if look is None else 0, clat, clon, look, town, dense, west_town, alpine)
        spec.min_h = mh
        spec.portal = bool(at.get("portal"))
        spec.names = names_for(spec, at.get("name"), at.get("places") or (), country) if uses is not None else ()
        spec.plates = signs_for(spec, at.get("name"), at.get("signs") or (), country) if uses is not None else ()
        i0, i1 = (ends[k - 1] if k else 0), ends[k]
        if not ok[i0:i1].all():
            continue
        g = up_all[i0:i1].copy()
        if at.get("ml") and ways_xy is not None and _ml_steep(ring, g, ways_xy):
            continue
        if water is not None:
            c = ring.mean(0)
            cla, clo, _ = frame.enu_to_geodetic(c[0] + x0, c[1] + y0, 0.0)
            if water(float(cla), float(clo)):
                continue
        if decks and mh <= 0.5 and not (at.get("bridge_part") or at.get("bridge_masonry")):
            got = on_deck(ring, decks, float(g.max()))
            if got is not None:
                if got[0]:              # over the deck's lanes: a vehicle, a booth on the road
                    continue
                g = np.full(len(g), got[1])     # its floor on the deck (a pier's bait shop stood on the seabed)
        spec.gring = g              # the ground at each corner (door_ground: the door's, not the footprint's highest)
        out.append((spec, float(g.min()), float(g.max())))
    lines = roads_xy if roads_xy else ml_roads_xy
    if lines and out:
        isl = _toll_islands(frame, layers, parts_of, lines, x0, y0)
        if isl:
            out = _toll_mark(out, isl)
    return out


# Toll plazas (the user's report at the Golden Gate Bridge: "Toll booths need work. west coast has one,
# reference that"): OSM maps a plaza's islands as low "buildings" (0.2 m there) with the booths as building parts
# standing on them; drawn as buildings they were bare boxes on slabs. An island with a booth on it, along a road, is
# West Coast USA's toll booth instead (trees.lua group "tollbooth": the island, its booth and kerbs in one shape, 22 m
# long along its local y), placed along the island (toll_booth_rows); the island and its booth parts are not built.
FLAT_FOOTPRINT_M = 0.1     # m: a footprint mapped lower than this is an area (a plaza), not drawn
G_TOLLBOOTH = "tollbooth"
TOLLBOOTH_H = 4.96          # m: the stock shape's height (s_toll_booth_center)
TOLL_ISLAND_MAX_H = 1.0     # m: an island is a "building" no taller than this ...
TOLL_ISLAND_MIN_L = 8.0     # ... at least this long ...
TOLL_ISLAND_MAX_W = 4.0     # ... and at most this wide
TOLL_BOOTH_H = (2.0, 8.0)   # m: a booth on it: a footprint this tall ...
TOLL_BOOTH_MAX_AREA = 40.0  # ... and this small (m2), its centre on the island
TOLL_ROAD_M = 25.0          # m: a road this near the island's centre ...
TOLL_ROAD_DEG = 25.0        # ... running along it within this


def _on_box(p, box, pad=1.0):
    """Is point p (2,) within the oriented box (centre, axis u, half length, half width) grown by pad?"""
    c, u, hl, hw = box
    d = np.asarray(p, np.float64) - c
    return abs(float(d @ u)) <= hl + pad and abs(float(d[0] * u[1] - d[1] * u[0])) <= hw + pad


def _toll_islands(frame, layers, parts_of, lines, x0, y0):
    """The toll islands among all the buildings of the tile's cells, as oriented boxes relative to (x0, y0): a low
    building (TOLL_ISLAND_*) with a booth (TOLL_BOOTH_*) among all the cells' building parts centred on it, along a
    road (lines, relative to (x0, y0)). Not only the tile's own buildings: a part is in its building's tile, and the
    Golden Gate's booths are parts of the plaza's footprint, centred in the next tile from most islands."""
    booths = []
    for pring, hh in parts_of.booths(*TOLL_BOOTH_H):
        if hh is None or not (TOLL_BOOTH_H[0] <= hh[0] + hh[1] <= TOLL_BOOTH_H[1]):
            continue
        r = pring - np.array([x0, y0])
        if _area2(r) / 2 <= TOLL_BOOTH_MAX_AREA:
            booths.append(r[:-1].mean(0) if len(r) > 1 and np.allclose(r[0], r[-1]) else r.mean(0))
    if not booths:
        return []
    segs = [np.concatenate([np.asarray(ln, np.float64)[:-1], np.asarray(ln, np.float64)[1:]], 1)
            for ln in lines if len(ln) >= 2]
    if not segs:
        return []
    segs = np.concatenate(segs)
    a, b = segs[:, :2], segs[:, 2:]
    ab = b - a
    L = np.maximum(np.hypot(ab[:, 0], ab[:, 1]), 1e-9)
    cos_max = math.cos(math.radians(TOLL_ROAD_DEG))
    out, seen = [], set()
    for f in layers:
        if f is None or len(f.kind) == 0 or f.attrs.get("height") is None:
            continue
        h = np.asarray(f.attrs["height"], np.float64)
        ids = getattr(f, "ids", None)
        for i in np.flatnonzero(np.isfinite(h) & (h > 0) & (h <= TOLL_ISLAND_MAX_H)).tolist():
            key = ids[i] if ids is not None else None
            if key is not None and key in seen:
                continue
            seen.add(key)
            parts = f.parts(i)
            if not parts or not parts[0] or len(parts[0][0]) < 4:
                continue
            e, n = mapgeom.enu_xy(f, frame, np.asarray(parts[0][0], np.float64))
            box = oriented_box(np.stack([e - x0, n - y0], 1)[:-1])
            c, u, hl, hw = box
            if 2 * hl < TOLL_ISLAND_MIN_L or 2 * hw > TOLL_ISLAND_MAX_W:
                continue
            if not any(_on_box(q, box) for q in booths):
                continue
            tt = np.clip(((c - a) * ab).sum(1) / (L * L), 0.0, 1.0)
            dist = np.hypot(*(a + tt[:, None] * ab - c).T)
            if ((dist <= TOLL_ROAD_M) & (np.abs((ab @ u) / L) >= cos_max)).any():
                out.append(box)
    return out


def _toll_mark(items, islands):
    """items with each toll island (islands: _toll_islands' boxes) marked cls "toll_booth" and the booths standing on
    them left out (West Coast USA's booth stands there instead: toll_booth_rows). Pure."""
    out = []
    for spec, gmin, gmax in items:
        p = spec.ring.mean(0)
        on = next((bx for bx in islands if _on_box(p, bx)), None)
        if on is None:
            out.append((spec, gmin, gmax))
            continue
        h = spec.height or 0.0
        if h <= TOLL_ISLAND_MAX_H:
            _c, _u, hl, hw = oriented_box(spec.ring)
            if 2 * hl >= TOLL_ISLAND_MIN_L and 2 * hw <= TOLL_ISLAND_MAX_W and (spec.min_h or 0) <= 0.5:
                spec.cls = "toll_booth"         # the island itself (not a plaza's flat footprint round it)
            out.append((spec, gmin, gmax))
        elif not (TOLL_BOOTH_H[0] <= h <= TOLL_BOOTH_H[1] and _area2(spec.ring) / 2 <= TOLL_BOOTH_MAX_AREA):
            out.append((spec, gmin, gmax))
    return out


def toll_booth_rows(items, x0, y0):
    """Prop rows (trees.lua rows, group G_TOLLBOOTH) of the toll islands (_toll_mark) among items (rings relative to
    (x0, y0)): West Coast USA's booth along each island, on its lowest ground."""
    rows = []
    for spec, gmin, _gmax in items:
        if spec.cls != "toll_booth":
            continue
        c, u, _hl, _hw = oriented_box(spec.ring)
        if u[0] < 0 or (u[0] == 0 and u[1] < 0):    # one way along the axis for every island: the booths face alike
            u = -u
        yaw = (math.degrees(math.atan2(u[1], u[0])) - 90.0) % 360.0       # (its length is the shape's local y)
        rows.append([G_TOLLBOOTH, round(float(c[0] + x0), 2), round(float(c[1] + y0), 2), round(gmin, 2),
                     round(yaw, 1), 1.0, TOLLBOOTH_H, 0.5])
    return rows


def collider_boxes(items, x0, y0):
    """Boxes [x0, y0, z0, x1, y1, z1] (anchor frame) around each building: the mod does not make the tile's
    mesh solid while the player's car is inside one (roads.lua playerIn)."""
    out = []
    for spec, gmin, gmax in items:
        if deck_plan(spec, gmin, gmax) is not None:     # an open parking deck: driven into on purpose
            continue
        if spec.cls in BRIDGE_CLASSES:                  # a bridge's frame: driven through between its legs
            continue
        r = spec.ring
        out.append([round(float(r[:, 0].min() + x0), 2), round(float(r[:, 1].min() + y0), 2),
                    round(gmin - FOUNDATION_M, 2), round(float(r[:, 0].max() + x0), 2),
                    round(float(r[:, 1].max() + y0), 2), round(gmax + spec.height + 6.0, 2)])
    return out


def garage_sound_boxes(items, x0, y0, kind):
    """The sound spaces (roads.sound_boxes rows [kind, x, y, z, length, width, height, yaw], anchor frame) of the
    tile's parking structures drawn as open decks (deck_plan: the ones driven into): each its footprint's oriented
    box from its lowest ground to its top."""
    out = []
    for spec, gmin, gmax in items:
        if deck_plan(spec, gmin, gmax) is None:
            continue
        c, u, hl, hw = oriented_box(spec.ring)
        z0, z1 = gmin - 0.5, gmax + spec.height + 1.0
        out += [float(kind), round(float(c[0]) + x0, 2), round(float(c[1]) + y0, 2), round((z0 + z1) / 2, 2),
                round(2 * float(hl), 2), round(2 * float(hw), 2), round(z1 - z0, 2),
                round(math.atan2(float(u[1]), float(u[0])), 4)]
    return out


# The engine's LOD size of a near tile's shape below which its buildings are drawn as the lite mesh (the far tiles' one:
# no window bays, steps, porches, signs, cornices or roof clutter): the engine's own camera LOD (cdae lods), the tile's
# whole shape at once. Calibrated in game (1440p, the game's mesh detail at its default 2): a 21 m radius
# probe switched between 450 and 550 m, so a tile of ~190 m radius switches ~500 m from its centre (less with a lower
# mesh detail or screen resolution, as the stock shapes do).
BLD_LOD_PX = 2700.0


def write(path, mesh, collision_only=False):
    """The tile's .cdae (cdae.encode with one primitive per material; collision_only: a never-drawn collision detail).
    A mesh with a 7th element (build_parts with_lod) gets that lite mesh as its coarse detail below BLD_LOD_PX."""
    import cdae
    P, UV, T, M, mats, C = mesh[:6]
    mats = list(mats)
    lods = None
    lite = mesh[6] if len(mesh) > 6 and not collision_only else None     # (None: no lite mesh)
    if lite is not None:
        Pl, UVl, Tl, Ml, matsl, Cl = lite
        for m in matsl:
            if m not in mats:
                mats.append(m)
        remap = np.array([mats.index(m) for m in matsl], np.int64)
        lods = [(BLD_LOD_PX, {"positions": Pl, "tris": Tl, "uvs": UVl, "tri_materials": remap[np.asarray(Ml)],
                              "colors": Cl})]
    return cdae.write(path, P, T, uvs=UV, material=mats, tri_materials=M, object_name="buildings", colors=C,
                      collision_only=collision_only, lods=lods)


def write_objects(path, mesh, listed):
    """What the track's list of objects needs of the building shape at path, written from mesh, in a file beside it
    (src/track/objectlist.py). listed: its buildings as build_parts says them. Saved: the buildings, the pieces they are made of
    ([building's number, None or "sign"]) and, in the order the shape file holds its vertices (cdae.vertex_order), runs of [piece,
    how many vertices]."""
    import cdae
    P, T, M, mats = mesh[0], mesh[2], mesh[3], mesh[4]
    piece, pieces = np.full(len(P), -1, np.int64), []
    for b, end in zip(listed, [b["start"] for b in listed[1:]] + [len(P)]):
        marks = [(b["start"], None)] + [tuple(m) for m in b.get("marks", ())]
        for (start, what), stop in zip(marks, [m[0] for m in marks[1:]] + [end]):
            if start < stop:
                piece[start:stop] = len(pieces)
                pieces.append([b["item"], what])
    used = piece[cdae.vertex_order(T, M, len(list(mats)))]
    starts = np.r_[0, np.flatnonzero(used[1:] != used[:-1]) + 1]
    runs = [[int(used[a]), int(b - a)] for a, b in zip(starts, np.r_[starts[1:], len(used)])]
    keep = ("item", "house", "at", "details")
    with open(os.path.splitext(path)[0] + ".objects.json", "w", encoding="utf-8") as f:
        json.dump({"buildings": [{k: b[k] for k in keep if k in b} for b in listed], "pieces": pieces, "runs": runs}, f)


DOOR_CLASSES_SKIP = SHED_CLASSES | INDUSTRIAL_CLASSES
