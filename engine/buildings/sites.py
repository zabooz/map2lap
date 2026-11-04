"""What a footprint must not stand on: roads, tunnels, water, medians."""
import math

import numpy as np

import fast
import mapgeom

from .styles import oriented_box
from .mesh import _inside
from .garages import _clip_half


ACROSS_W = 8.0              # m: a footprint at most this wide that a public road crosses (its long middle line) is a
                            # walkway or canopy over it (the 69th Street station's 3 m shelters stood across
                            # the Dan Ryan as brick walls; a road crossing one runs only its width inside it)
THROUGH_CLASSES = {"motorway", "trunk", "primary", "secondary", "tertiary", "residential", "unclassified",
                   "living_street"}


def tunnel_lines(frame, road_layers, x0, y0, margin=50.0, size=256.0):
    """Polylines (k, 2) relative to (x0, y0) of the road tunnels near the tile (roads.tunnel_parts; for
    road_through: a building a tunnel runs into is its portal building, its floor over the tube), but those of
    PORTAL_SKIP_CLASSES."""
    import roads as roadsmod
    out = []
    for f in road_layers:
        if f is None or len(f.kind) == 0:
            continue
        ts = roadsmod.tunnel_specs(f)
        for i in range(len(f.kind)):
            if ts[i] is None or ts[i].cls in PORTAL_SKIP_CLASSES:
                continue
            for ring in roadsmod.tunnel_parts(f, i):
                e, n = mapgeom.enu_xy(f, frame, ring)
                xy = np.stack([e - x0, n - y0], 1)
                if xy[:, 0].max() < -margin or xy[:, 0].min() > size + margin or xy[:, 1].max() < -margin \
                        or xy[:, 1].min() > size + margin:
                    continue
                out.append(xy)
    return out


GARAGE_TAGS = ("multi-storey", "multistorey", "multi_storey", "multi-level")


def garage_rings(frame, infra_layers, x0, y0, margin=50.0, size=256.0):
    """Outer rings (k, 2) relative to (x0, y0) of the mapped multi-storey car parks near the tile (Overture
    infrastructure, class parking, OSM parking=multi-storey). OSM often keeps the car park's tags on its own area
    and the building beside it as building=yes or =garage (a shed), so the class alone missed 25 of downtown
    Baltimore's 40 garages (the user's 'parking garages are solid boxes')."""
    import json
    out, seen = [], set()
    for f in infra_layers:
        if f is None or len(f.kind) == 0:
            continue
        a = f.attrs
        cls, tags = a.get("class"), a.get("tags")
        if cls is None or tags is None:
            continue
        for i in np.flatnonzero((cls.astype(str) == "parking") & (f.kind == 3)):
            t = str(tags[i])
            if '"parking"' not in t:
                continue
            try:
                if str(json.loads(t).get("parking", "")).lower() not in GARAGE_TAGS:
                    continue
            except (ValueError, AttributeError):
                continue
            fid = f.ids[i]
            if fid in seen:
                continue
            seen.add(fid)
            for part in f.parts(i):
                if not part or len(part[0]) < 3:
                    continue
                e, n = mapgeom.enu_xy(f, frame, part[0])
                xy = np.stack([e - x0, n - y0], 1)
                if xy[:, 0].max() < -margin or xy[:, 0].min() > size + margin or xy[:, 1].max() < -margin \
                        or xy[:, 1].min() > size + margin:
                    continue
                out.append(xy)
    return out


def support_rings(frame, infra_layers, x0, y0, margin=50.0, size=256.0):
    """[(ring (k, 2) relative to (x0, y0), paint)] of the mapped bridge supports near the tile (Overture
    infrastructure, class bridge_support: OSM bridge:support towers and piers, their building:colour as a
    bridgetypes paint, grey without one). The Golden Gate Bridge's towers are mapped as building parts over them and
    were drawn as a 225 m glass tower."""
    import json
    import bridgetypes
    out, seen = [], set()
    for f in infra_layers:
        if f is None or len(f.kind) == 0:
            continue
        a = f.attrs
        cls, tags = a.get("class"), a.get("tags")
        if cls is None:
            continue
        cs = cls.astype(str)
        # a bridge's supports, and its own outlines mapped as buildings (Tower Bridge's high walkways: building:colour
        # lightblue, 45 m); not a bare bridge outline (Ponte Vecchio's shops stand on one)
        three_d = f.__dict__.get("_three_d")         # (once per cell's features: every tile of it asked)
        if three_d is None:
            three_d = f._three_d = (np.array(['"building' in str(t) for t in tags], bool) if tags is not None
                                    else np.zeros(len(cs), bool))
        for i in np.flatnonzero(((cs == "bridge_support") | ((cs == "bridge") & three_d)) & (f.kind == 3)):
            fid = f.ids[i]
            if fid in seen:
                continue
            seen.add(fid)
            pt = None
            if tags is not None and "colour" in str(tags[i]):
                try:
                    td = json.loads(str(tags[i]))
                    pt = bridgetypes.paint(td.get("building:colour") or td.get("colour"))
                except ValueError:
                    pt = None
            for part in f.parts(i):
                if not part or len(part[0]) < 3:
                    continue
                e, n = mapgeom.enu_xy(f, frame, part[0])
                xy = np.stack([e - x0, n - y0], 1)
                if xy[:, 0].max() < -margin or xy[:, 0].min() > size + margin or xy[:, 1].max() < -margin \
                        or xy[:, 1].min() > size + margin:
                    continue
                out.append((xy, pt or "grey"))
    return out


def _on_support(ring, supports):
    """The paint of the bridge support (support_rings) holding the footprint's centre, else None."""
    if not supports:
        return None
    from polygon import Path
    c = ring.mean(0)
    for r, pt in supports:
        if r[:, 0].min() <= c[0] <= r[:, 0].max() and r[:, 1].min() <= c[1] <= r[:, 1].max() \
                and Path(r).contains_points(c[None])[0]:
            return pt
    return None


def _covers_garage(ring, garages):
    """A footprint inside a mapped car park's area (its centre in it) or holding the car park's centre."""
    c = ring.mean(0)
    for g in garages:
        if _inside(g, c) or _inside(ring, g.mean(0)):
            return True
    return False


PORTAL_SKIP_CLASSES = ("service",)     # tunnels that lift no building: a driveway, loading dock or covered drop-off
                            # under a building, which stands on the ground (a 15 m drive-through under an
                            # Oklahoma City church floated it 10 m up; in downtown Baltimore and Chicago 20 office and
                            # garage blocks of up to 7,156 m2 stood 7.4-10.5 m up over loading-dock tunnels)


def road_lines(frame, road_layers, x0, y0, margin=50.0, size=256.0):
    """Polylines (k, 2) relative to (x0, y0) of the public roads on the ground near the tile (for road_through)."""
    import roads as roadsmod
    out = []
    for f in road_layers:
        if f is None or len(f.kind) == 0:
            continue
        cls = f.attrs.get("class")
        if cls is None:
            continue
        bb = f.boxes(frame)             # (only the roads near the tile: the test below, all at once)
        near = np.flatnonzero((bb[:, 2] - x0 >= -margin) & (bb[:, 0] - x0 <= size + margin)
                              & (bb[:, 3] - y0 >= -margin) & (bb[:, 1] - y0 <= size + margin))
        for i in near.tolist():
            if str(cls[i]) not in THROUGH_CLASSES:
                continue
            if roadsmod.level_ranges(f, i):
                # its pieces on the ground (a motorway segment with a short overpass in it was left out whole, and the
                # lorries machine-learned as buildings on its lanes stayed: the A7;'s finding)
                lls = [np.asarray(p, np.float64) for p in roadsmod.ground_parts(f, i)]
            else:
                a = f.coord_off[f.ring_off[f.part_off[i]]]
                b = f.coord_off[f.ring_off[f.part_off[i + 1]]]
                lls = [f.lonlat[a:b]]
            for ll in lls:
                if len(ll) < 2:
                    continue
                e, n = mapgeom.enu_xy(f, frame, ll)
                xy = np.stack([e - x0, n - y0], 1)
                if xy[:, 0].max() < -margin or xy[:, 0].min() > size + margin or xy[:, 1].max() < -margin \
                        or xy[:, 1].min() > size + margin:
                    continue
                out.append(xy)
    return out


PASSAGE_W = 11.0           # m: the passage a bridge's road takes through its tower (Tower Bridge: 2 lanes + walks) ...
PASSAGE_H = 7.0            # ... this high over the tower's mapped bottom (its deck: the part starts at the road), ...
PASSAGE_CLEAR = 6.5        # m: the way over a deck through a building (with the decks' heights)
PASSAGE_BOTTOM_M = 20.0    # ... in a structure whose bottom is this low (not its high walkways or tops)


def _passages(rings, attrs, looks, mins, bridges_xy, decks=None, ground_at=None):
    """Buildings a road bridge runs through split round a PASSAGE_W wide way (Tower Bridge's road ran into its towers'
    stone and its Southern Gate: "the buildings are still in the middle of the bridge", "this
    building is still blocking the bridge"). With the decks' heights (decks: [(xy (k, 2), z (k,))] relative to the
    tile, ground_at(c (2,)) -> the ground under a footprint's centre): only where the deck passes through the
    building's height (a building under a viaduct stays whole): solid under the deck, the way PASSAGE_CLEAR over it,
    the whole footprint above. Without them, a bridge's own structure (bridge_part / bridge_masonry) starting within
    PASSAGE_BOTTOM_M gets the way PASSAGE_H over its bottom (its deck: the part starts at the road)."""
    R, A, L, M = [], [], [], []
    lines = [d[0] for d in decks] if decks else bridges_xy
    for ring, at, look, mh in zip(rings, attrs, looks, mins):
        bridge_own = bool(at.get("bridge_part") or at.get("bridge_masonry"))
        if not lines or road_through(ring, lines) < 3.0 or (not decks and (not bridge_own or mh > PASSAGE_BOTTOM_M)):
            R.append(ring), A.append(at), L.append(look), M.append(mh)
            continue
        c = ring.mean(0)
        best = None
        for k, ln in enumerate(lines):
            for q in range(len(ln) - 1):
                a, b = ln[q], ln[q + 1]
                ab = b - a
                t = float(np.clip((c - a) @ ab / max(ab @ ab, 1e-9), 0, 1))
                d = float(np.hypot(*(a + t * ab - c)))
                if best is None or d < best[0]:
                    zd = None
                    if decks:
                        z = decks[k][1]
                        zd = float(z[q] + t * (z[q + 1] - z[q]))
                    best = (d, a + t * ab, ab / max(float(np.hypot(*ab)), 1e-9), zd)
        _, p0, u, zd = best
        nrm = np.array([-u[1], u[0]])
        h = at.get("height")
        own = look is not None          # (a building's part carries its own height over its bottom, a building its top)
        top = (mh + float(h) if own else float(h)) if h is not None and np.isfinite(h) else mh + PASSAGE_H + 3.0
        if zd is not None and ground_at is not None and np.isfinite(zd):
            dh = zd - float(ground_at(c))           # the deck's height over the building's ground
            if top <= dh + 1.0 or mh >= dh + PASSAGE_CLEAR:
                R.append(ring), A.append(at), L.append(look), M.append(mh)
                continue                            # under the deck, or over its way
            low, cut = max(mh, dh - 1.5), dh + PASSAGE_CLEAR
        else:
            low, cut = mh, mh + PASSAGE_H
        cut = min(cut, top)
        if low > mh + 0.5:                          # solid under the deck
            R.append(ring), A.append(dict(at, height=(low - mh) if own else low)), L.append(look), M.append(mh)
        for sgn in (1, -1):
            piece = _clip_half(ring, p0 + nrm * sgn * PASSAGE_W / 2, nrm * sgn, True)
            if piece is not None and cut > low + 0.5:
                R.append(piece), A.append(dict(at, height=(cut - low) if own else cut)), L.append(look), M.append(low)
        if top > cut + 1.0:
            R.append(ring), A.append(dict(at, height=(top - cut) if own else top)), L.append(look), M.append(cut)
    return R, A, L, M


ML_BRIDGE_M = 6.0          # m of a road bridge's line through a machine-learned footprint: the deck, not a building
ML_ROAD_M = 4.0            # m from a public road's centre line to a machine-learned footprint's centre: a vehicle on it
ML_MEDIAN_M = 9.0          # m: a machine-learned footprint between two parallel roads this close on either side lies in a
                           # dual carriageway's median (a house between Moscow's Bolshaya Tulskaya carriageways)


def _line_dist(p, lines):
    """Distance from point p (2,) to the nearest of the polylines lines (k, 2), or inf."""
    best = np.inf
    for ln in lines:
        a, b = ln[:-1], ln[1:]
        d = b - a
        t = np.clip(((p - a) * d).sum(1) / np.maximum((d * d).sum(1), 1e-12), 0.0, 1.0)
        q = a + t[:, None] * d
        best = min(best, float(np.hypot(*(q - p).T).min()))
    return best


def _nearest_on(p, ln):
    """(distance, unit direction of the segment) of polyline ln (k, 2) nearest point p (2,)."""
    a, b = ln[:-1], ln[1:]
    d = b - a
    t = np.clip(((p - a) * d).sum(1) / np.maximum((d * d).sum(1), 1e-12), 0.0, 1.0)
    q = a + t[:, None] * d
    dist = np.hypot(*(q - p).T)
    k = int(np.argmin(dist))
    u = d[k] / max(float(np.hypot(*d[k])), 1e-9)
    return float(dist[k]), q[k], u


def _in_median(c, roads_xy):
    """Does point c (2,) lie between two parallel roads each within ML_MEDIAN_M, on opposite sides of it?"""
    near = []
    for ln in roads_xy:
        if len(ln) < 2 or ln[:, 0].min() > c[0] + ML_MEDIAN_M or ln[:, 0].max() < c[0] - ML_MEDIAN_M or \
                ln[:, 1].min() > c[1] + ML_MEDIAN_M or ln[:, 1].max() < c[1] - ML_MEDIAN_M:
            continue
        dist, q, u = _nearest_on(c, ln)
        if dist <= ML_MEDIAN_M:
            near.append((q - c, u))
    for i in range(len(near)):
        for j in range(i + 1, len(near)):
            (vi, ui), (vj, uj) = near[i], near[j]
            if abs(float(ui @ uj)) > 0.9 and float(vi @ vj) < 0:        # parallel, one on each side
                return True
    return False


def _ml_false(ring, bridges_xy, water_xy, roads_xy=None):
    """A machine-learned footprint (Microsoft's, Google's) that is a bridge deck, a boat or a vehicle: a road bridge
    runs through it, its centre lies on mapped water (Tower Bridge's river: barges as brick buildings), on
    a public road (a lorry on a Norwegian trunk road stood as a white building over the lanes) or in a dual
    carriageway's median (_in_median)."""
    if bridges_xy and road_through(ring, bridges_xy) >= ML_BRIDGE_M:
        return True
    if roads_xy and (_line_dist(ring.mean(0), roads_xy) <= ML_ROAD_M or _in_median(ring.mean(0), roads_xy)):
        return True
    if water_xy:
        from polygon import Path
        c = ring.mean(0)
        for w, holes in water_xy:
            if w[:, 0].min() <= c[0] <= w[:, 0].max() and w[:, 1].min() <= c[1] <= w[:, 1].max() \
                    and Path(w).contains_points(c[None])[0] \
                    and not any(Path(h).contains_points(c[None])[0] for h in holes):    # (an island: land)
                return True
    return False


ML_STEEP_DEG = 25.0         # a machine-learned footprint on ground this steep ...
ML_FAR_FROM_WAY_M = 60.0    # ... this far from any mapped way (a road, track or path) is a rock or a shadow, not a hut
ML_CLIFF_DEG = 36.0         # ... and on ground this steep, wherever it is
# (64 machine-learned outlines (Shi et al.'s East Asia set) on Mount Fuji's slopes, median 34 deg, half
# over 60 m from a trail; the real huts on 6 deg next to the trail. Steep places with real ones: La Paz 0 of
# 5453, Gorkha (Nepal) 0 of 50, Rwanda's hills 1 of 293, Medellin and Valparaiso 0)


def _ml_steep(ring, g, ways_xy):
    """Is a machine-learned footprint (ring, relative to the tile's corner; g its ground at each corner) on ground too
    steep for it (ML_*)? The slope of the plane through its corners; the distance from its centre to the nearest
    mapped way (ways_xy: way_lines, the same corner). Pure."""
    r = np.asarray(ring, np.float64)[:, :2]
    g = np.asarray(g, np.float64)
    if len(r) < 3 or len(g) != len(r):
        return False
    A = np.c_[r - r.mean(0), np.ones(len(r))]
    try:
        (a, b, _), *_ = np.linalg.lstsq(A, g, rcond=None)
    except np.linalg.LinAlgError:
        return False
    slope = math.degrees(math.atan(math.hypot(a, b)))
    if slope > ML_CLIFF_DEG:
        return True
    if slope <= ML_STEEP_DEG:
        return False
    return not ways_xy or _line_dist(r.mean(0), ways_xy) > ML_FAR_FROM_WAY_M


def way_lines(frame, road_layers, x0, y0, margin=ML_FAR_FROM_WAY_M + 20.0, size=256.0):
    """Polylines (k, 2) relative to (x0, y0) of every mapped way near the tile (roads of any class, tracks, paths,
    steps: _ml_steep's access test)."""
    out = []
    for f in road_layers:
        if f is None or len(f.kind) == 0:
            continue
        bb = f.boxes(frame)
        near = np.flatnonzero((bb[:, 2] - x0 >= -margin) & (bb[:, 0] - x0 <= size + margin)
                              & (bb[:, 3] - y0 >= -margin) & (bb[:, 1] - y0 <= size + margin))
        for i in near.tolist():
            a = f.coord_off[f.ring_off[f.part_off[i]]]
            b = f.coord_off[f.ring_off[f.part_off[i + 1]]]
            ll = f.lonlat[a:b]
            if len(ll) < 2:
                continue
            e, n = mapgeom.enu_xy(f, frame, ll)
            out.append(np.stack([e - x0, n - y0], 1))
    return out


def bridge_lines(frame, road_layers, x0, y0, margin=50.0, size=256.0):
    """Polylines (k, 2) relative to (x0, y0) of the road bridges near the tile (their bridge ranges)."""
    import roads as roadsmod
    out = []
    for f in road_layers:
        if f is None or len(f.kind) == 0:
            continue
        bs = roadsmod.bridge_specs(f)
        for i in range(len(f.kind)):
            if bs[i] is None:
                continue
            for ring in roadsmod.bridge_parts(f, i):
                e, n = mapgeom.enu_xy(f, frame, ring)
                xy = np.stack([e - x0, n - y0], 1)
                if len(xy) < 2 or xy[:, 0].max() < -margin or xy[:, 0].min() > size + margin or \
                        xy[:, 1].max() < -margin or xy[:, 1].min() > size + margin:
                    continue
                out.append(xy)
    return out


def water_rings(frame, water_layers, x0, y0, margin=50.0, size=256.0):
    """[(outer ring (k, 2), [hole rings])] relative to (x0, y0) of the mapped water areas (sea, rivers, lakes, docks)
    near the tile (their holes: islands)."""
    out = []
    for f in water_layers:
        if f is None or len(f.kind) == 0:
            continue
        for i in np.flatnonzero(mapgeom.water_areas(f)):
            for part in f.parts(i):
                if not part or len(part[0]) < 4:
                    continue
                e, n = mapgeom.enu_xy(f, frame, part[0])
                xy = np.stack([e - x0, n - y0], 1)
                if xy[:, 0].max() < -margin or xy[:, 0].min() > size + margin or xy[:, 1].max() < -margin \
                        or xy[:, 1].min() > size + margin:
                    continue
                holes = []
                for h in part[1:]:
                    if len(h) >= 4:
                        he, hn = mapgeom.enu_xy(f, frame, h)
                        holes.append(np.stack([he - x0, hn - y0], 1))
                out.append((xy, holes))
    return out


_BOXES = {}                     # id(list of polylines) -> (that list, its boxes (n, 4)): the last few lists asked


def line_boxes(lines):
    """(n, 4) x0 y0 x1 y1 of each polyline (k, 2+) of the list, made once per list (a tile's buildings test the same
    lists of roads one footprint after another: ~1.2M small numpy min / max calls a Baltimore tile set)."""
    got = _BOXES.get(id(lines))
    if got is not None and got[0] is lines:
        return got[1]
    b = np.array([(ln[:, 0].min(), ln[:, 1].min(), ln[:, 0].max(), ln[:, 1].max()) for ln in lines],
                 np.float64).reshape(-1, 4)
    if len(_BOXES) >= 16:
        _BOXES.clear()
    _BOXES[id(lines)] = (lines, b)      # (the list kept: its id cannot be another list's meanwhile)
    return b


def road_through(ring, lines, step=2.0):
    """Metres of the polylines lines (k, 2) inside ring (sampled every step m)."""
    lo, hi = ring.min(0), ring.max(0)
    b = line_boxes(lines)
    near = np.flatnonzero((b[:, 2] >= lo[0]) & (b[:, 0] <= hi[0]) & (b[:, 3] >= lo[1]) & (b[:, 1] <= hi[1]))
    if not len(near):
        return 0.0
    fast.require(74, "road_through")         # (the Rust loop: every sample's even-odd test there)
    sel = [np.asarray(lines[li], np.float64)[:, :2] for li in near]
    starts = np.r_[0, np.cumsum([len(ln) for ln in sel])].astype(np.int64)
    return float(fast._ef.road_through(np.ascontiguousarray(np.asarray(ring, np.float64)[:, :2]),
                                       np.ascontiguousarray(np.concatenate(sel)), starts, float(step)))


def road_across(ring, lines, max_w=ACROSS_W):
    """Does one of the polylines lines (k, 2) cross the narrow footprint ring (at most max_w wide) along its length,
    over its long middle line?"""
    c, u, hl, hw = oriented_box(ring)
    if 2 * hw > max_w or hl <= hw:
        return False
    a, b = c - u * hl, c + u * hl
    lo, hi = np.minimum(a, b), np.maximum(a, b)
    bx = line_boxes(lines)
    for li in np.flatnonzero((bx[:, 2] >= lo[0]) & (bx[:, 0] <= hi[0]) & (bx[:, 3] >= lo[1]) & (bx[:, 1] <= hi[1])):
        ln = lines[li]
        p, q = ln[:-1], ln[1:]
        d = q - p
        e = b - a
        den = d[:, 0] * e[1] - d[:, 1] * e[0]
        ok = np.abs(den) > 1e-9
        den = np.where(ok, den, 1.0)
        w = a - p
        t = (w[:, 0] * e[1] - w[:, 1] * e[0]) / den         # along the road segment
        s_ = (w[:, 0] * d[:, 1] - w[:, 1] * d[:, 0]) / den  # along the middle line
        if np.any(ok & (t >= 0) & (t <= 1) & (s_ >= 0) & (s_ <= 1)):
            return True
    return False
