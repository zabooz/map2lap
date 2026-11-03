"""A road's class, width, lanes and sidewalks."""
import math

import numpy as np

from .style import (
    BUILT, COBBLE, COBBLE_ALIASES, EDGE_LINE, GRAVEL, LANE_W, LANE_W_DEFAULT, LINK_LANE_M, LINK_M, MEASURE_MAX,
    MEASURE_SKIP, ONEWAY_STYLE, OSM_LANES, OSM_WIDTH_M, PAVED, SIDEWALK_CLASSES, STYLE, Spec, UNPAVED, URBAN_ARTERIAL
)
from .tags import _facts_load, _facts_store, _osm, _rule_value, raw_level_ranges


# Carriageway = driving width + parking lanes on city streets or paved edge strips on rural roads
# (docs/research/2026-10-11-official-road-study.md §2: rural paved surface = AI width + 2-2.5 m;
# West Coast USA's plain streets 12.5 m for 8 m of driving: ~2.3 m of parking each side). A width
# rule, where Overture has one, is the carriageway already.
PARKING_M = 2.3

# Rural motorways: two lanes a direction (most rural Interstates and European motorways; every US Interstate was drawn
# with three) between paved shoulders, the edge line along each; urban ones keep STYLE's three lanes.
# Overture has no lane counts.
MOTORWAY_RURAL_M = 7.4
SHOULDER_M = 2.2
PARKING_CLASSES = {"residential", "tertiary", "secondary", "unclassified", "living_street"}
EDGE_STRIP_M = 1.0

# ... by class where measured narrower: rural minor roads' paved width on the official aerials (PEMA 6-inch, Lancaster
# County PA, 20 tertiary 6.4 m and 20 secondary 6.7 m against 8.5 and 9.5 drawn; NAIP, El Paso County CO, tertiary 7.2;
# 2026-10-28, the user: "compare against high res satellite photos"): no strips on tertiary and unclassified roads,
# narrow ones on secondaries
EDGE_STRIP_CLASS_M = {"tertiary": 0.0, "unclassified": 0.0, "secondary": 0.25}
URBAN_SHARE = 0.5               # a road is urban when this share of its vertices is built-up ...
URBAN_BESIDE_M = 30.0           # ... and at least URBAN_BESIDE_SHARE of them have built-up land this far to one side:
URBAN_BESIDE_SHARE = 0.2        # the land cover counts a wide road's own pavement as built-up, and the Eyre Highway
                                # through Eucla (centre 94 %, beside it 3 %) got a town's footpaths, bins and hydrants
                                # across the Nullarbor. Baltimore and Chicago keep every urban road.
URBAN_BOTH_SHARE = 0.1          # a motorway or trunk needs built-up land on both
                                # sides of this share of its vertices: a roadhouse beside the Eyre Highway (Eucla: one
                                # side 33 %, the other 0 %) is no town
URBAN_STEP_M = 10.0             # m between the points those shares are taken at (the land cover's pixel): shares of a
                                # road's length, not of its vertices, which crowd where it bends and joins (a 762 m
                                # primary through fields read 64 % built-up from the 9 of its 14 vertices in the
                                # village at its end, 41 % along its length, and got curbs and sidewalks throughout)
MIN_PART = 1e-3     # parts shorter than this share of a segment are dropped


def surface_token(surface):
    """A surface rule value's base token: the detail after a colon and a second value after a semicolon dropped
    (`sett:pattern` -> `sett`, `sett;asphalt` -> `sett`); None for no value. surface_kind and look_of read it."""
    if surface is None:
        return None
    return str(surface).lower().split(";")[0].split(":")[0].strip()


def surface_kind(cls, surface):
    """'paved', 'cobble', 'gravel' or 'dirt' from the class and the surface rule value (None if unknown).

    The value's base token decides: OSM writes the detail after a colon (`cobblestone:flattened`,
    `paving_stones:30`, `sett:pattern`) and more than one value after a semicolon, and matched whole they all fell
    through to "dirt", which is drawn with gravel's own material (LOOK) and painted DIRT: İzmir's sett streets read
    as gravel tracks. Interlocking pavers have their own names in the map. A value not understood at
    all is the class's own surface, not dirt: an unknown tag must not turn a residential street into a track."""
    if surface is not None:
        s = surface_token(surface)
        if s in PAVED:
            return "paved"
        if s in COBBLE or s in COBBLE_ALIASES:
            return "cobble"
        if s in GRAVEL:
            return "gravel"
        if s in UNPAVED:
            return "dirt"
    return "paved" if STYLE.get(cls, STYLE["unknown"])[1] else "dirt"


def carriageway(cls, kind, urban, rule_width=None, oneway=False, lanes=None):
    """Paved / dirt width (m) of a road: the width rule if any, else the driving width (OpenStreetMap's lanes x the
    class's LANE_W when known, else the class's) plus parking lanes (urban paved streets; one side on a one-way street)
    or edge strips (rural paved roads). One-way: ONEWAY_STYLE's driving width (motorways and trunks are per carriageway
    already). Pure."""
    if rule_width is not None:
        return rule_width
    w = STYLE.get(cls, STYLE["unknown"])[0]
    if oneway and cls in ONEWAY_STYLE:
        w = ONEWAY_STYLE[cls]
    if lanes:
        w = lanes * LANE_W.get(cls, LANE_W_DEFAULT)
    if kind not in BUILT:
        return w
    if lanes and not urban and oneway and cls == "motorway":
        return w + 2 * SHOULDER_M
    if urban and not oneway and cls in URBAN_ARTERIAL and not lanes:
        return URBAN_ARTERIAL[cls]          # four lanes, no parking (a walled street is measured instead)
    if urban and cls in PARKING_CLASSES:
        return w + (1 if oneway else 2) * PARKING_M
    if not urban and cls != "service":
        if oneway and cls == "motorway":
            return MOTORWAY_RURAL_M + 2 * SHOULDER_M
        return w + 2 * EDGE_STRIP_CLASS_M.get(cls, EDGE_STRIP_M)
    return w


def rural_motorway(spec):
    """One carriageway of a rural motorway: two lanes between shoulders (carriageway)."""
    return spec.cls == "motorway" and spec.oneway and not spec.urban and spec.kind in BUILT


def edge_margin(spec):
    """m of a drawn carriageway beside its driving lanes on each side, parking aside: a rural road's edge strip or
    a rural motorway's shoulder (carriageway), 0 in towns."""
    if spec.urban or spec.kind not in BUILT or spec.cls == "service":
        return 0.0
    return motorway_shoulder(spec) if rural_motorway(spec) else EDGE_STRIP_CLASS_M.get(spec.cls, EDGE_STRIP_M)


def motorway_shoulder(spec):
    """A rural motorway carriageway's shoulder: SHOULDER_M, or on a ramp (one lane, LINK_M) what one LINK_LANE_M lane
    leaves (a 6 m ramp's edge lines stood 1.6 m apart, inside the motorway's 2.2 m shoulders)."""
    return float(np.clip((spec.width - LINK_LANE_M) / 2, EDGE_LINE["inset"], SHOULDER_M))


def _dir_kmh(feats, i, ncon, lengths=None):
    """(one-way direction along the geometry +1 / -1 or 0, speed limit km/h or None, m per junction or None)
    of feature i; ncon: connectors per feature (None: unknown); lengths: _lengths(feats) (None: measured
    here)."""
    rules = feats.rules
    v = _rule_value(rules.get("oneway"), i)
    d = 0 if v is None else (-1 if float(v) < 0 else 1)
    k = _rule_value(rules.get("max_speed_kmh"), i)
    gap = None
    if ncon is not None and ncon[i] >= 2:
        L = (lengths if lengths is not None else _lengths(feats, i))[i if lengths is not None else 0]
        if L is not None and not np.isnan(L):
            gap = float(L) / (ncon[i] - 1)
    return d, (float(k) if k is not None and float(k) > 0 else None), gap


def _lengths(feats, only=None):
    """Length (m, lon scaled by the cos of each feature's first latitude) of every feature's geometry, NaN for
    fewer than two points; only: just that feature (an array of one). All features at once: one numpy pass
    instead of ~3000 small ones a cell."""
    po, ro, co = feats.part_off, feats.ring_off, feats.coord_off
    idx = np.arange(len(feats)) if only is None else np.array([only])
    a = np.asarray(co[ro[po[idx]]], np.int64)
    b = np.asarray(co[ro[po[idx + 1]]], np.int64)
    out = np.full(len(idx), np.nan)
    ll = np.asarray(feats.lonlat, np.float64)
    cnt = b - a
    if not len(idx) or cnt.sum() < 2:
        return out
    m = 111320.0
    fid = np.repeat(np.arange(len(idx)), cnt)
    pos = np.concatenate([np.arange(x, y) for x, y in zip(a, b)]) if only is not None else np.arange(a[0], b[-1])
    pl = ll[pos]
    same = fid[1:] == fid[:-1]
    c = np.cos(np.radians(ll[np.minimum(a, len(ll) - 1), 1]))
    seg = np.hypot(np.diff(pl[:, 0]) * m * c[fid[:-1]], np.diff(pl[:, 1]) * m)
    L = np.bincount(fid[:-1][same], weights=seg[same], minlength=len(idx))
    ok = cnt >= 2
    out[ok] = L[ok]
    return out


DUAL_CLASSES = {"motorway", "trunk", "primary", "secondary", "tertiary"}
DUAL_GAP_M = (4.0, 45.0)    # centreline to centreline of a divided road's two carriageways
DUAL_SHARE = 0.6            # this share of the shorter one runs beside the other ...
DUAL_ANGLE_DEG = 25.0       # ... parallel within this


def _dual_side(a, b):
    """For polylines a, b (k, 2) in metres: the share of a's points (every ~10 m) with b beside it (DUAL_GAP_M,
    parallel within DUAL_ANGLE_DEG) and the mean side b is on (+1 left / -1 right of a's direction)."""
    import fast
    fast.require(0, "dual_side")       # the Rust kernel (~25k calls a Las Vegas road tile set)
    return fast._ef.dual_side(np.ascontiguousarray(a, np.float64), np.ascontiguousarray(b, np.float64),
                              DUAL_GAP_M[0], DUAL_GAP_M[1], math.cos(math.radians(DUAL_ANGLE_DEG)))


def dual_carriageways(feats, specs, left_hand=False):
    """specs with the two carriageways of a divided road made one-way when the map says neither is (Boston St,
    Baltimore: two "primary" roads either side of a wide median, each with its own double yellow centre line, the
    user's report). Two roads of one name and class running side by side DUAL_GAP_M apart over most of
    the shorter one; each runs so that the other is on its left (driving on the right) or right. Pure."""
    groups = {}
    names = feats.attrs.get("name")
    if names is None:
        return specs
    for i, sp in enumerate(specs):
        if sp is None or sp.cls not in DUAL_CLASSES:     # (one-way already: paired for its median only)
            continue
        nm = str(names[i] or "").strip()
        if nm and nm != "None":
            groups.setdefault((nm, sp.cls), []).append(i)
    out = list(specs)
    for idx in groups.values():
        if len(idx) < 2:
            continue
        lines = {}
        for i in idx:
            a = feats.coord_off[feats.ring_off[feats.part_off[i]]]
            b = feats.coord_off[feats.ring_off[feats.part_off[i + 1]]]
            ll = feats.lonlat[a:b]
            lines[i] = ll
        lat0 = float(np.mean(np.concatenate(list(lines.values()))[:, 1]))
        m = np.array([111320.0 * math.cos(math.radians(lat0)), 110540.0])
        ref = lines[idx[0]][0]
        xy = {i: (ll - ref) * m for i, ll in lines.items()}
        for i in idx:
            best = None
            for j in idx:
                if i == j:
                    continue
                share, side = _dual_side(xy[i], xy[j])
                if share >= DUAL_SHARE and abs(side) > 0.5:
                    # the nearest of the carriageways beside it (by share, cells holding different neighbours
                    # paired one piece of Boston Street 20 m and 38 m away: a sidewalk on its median in one tile)
                    gap = _centre_gap(xy[i], xy[j])
                    if best is None or gap < best[3]:
                        best = (share, side, j, gap)
            if best is None:
                continue
            sp = out[i]
            # driving on the right the other carriageway is on the left
            gap = best[3]
            if sp.oneway:               # the map's own one-way carriageway: its direction stands
                out[i] = sp._replace(median=gap, width=_dual_width(sp, sp.width, gap, feats, i))
                continue
            if sp.lanes:                # OpenStreetMap counts this way's lanes as a two-way road (a divided road's
                continue                # carriageways are one-way ways there): Portland's Rosa Parks Way, 1+1 lanes and
                                        # a turn lane, was drawn as two one-ways of 3 lanes each
            d = (1 if best[1] > 0 else -1) * (-1 if left_hand else 1)
            w = sp.width if (_rule_value(feats.rules.get("width"), i) is not None
                             or _osm(feats, "width", i, *OSM_WIDTH_M) is not None) else \
                carriageway(sp.cls, sp.kind, sp.urban, None, True, sp.lanes)
            out[i] = sp._replace(oneway=True, dir=d, width=_dual_width(sp, w, gap, feats, i), median=gap)
    return out


URBAN_MEDIAN_M = 1.5    # m: a city's divided road (centre lines within URBAN_MEDIAN_GAP_M): a narrow concrete median,
URBAN_MEDIAN_GAP_M = 24.0   # its carriageways out to it (Boston Street, Mapillary: two lanes and parking
URBAN_DUAL_MAX_W = 12.0     # each way either side of a ~1.5 m curb; we drew 6.5 m carriageways and a 4.5 m strip)
DUAL_MIN_MEDIAN_M = 0.6    # m between a divided road's carriageways at the least (a concrete barrier): the class's width
                            # overlapped them (Munich's McGraw-Graben: two 11 m carriageways 9.6 m apart, wider than its
                            # trench, their edges up its walls)
DUAL_MIN_W = 3.5            # ... but a carriageway keeps one lane


def dual_cap(gap, w):
    """w capped so carriageways gap m apart (centre to centre) do not overlap (DUAL_MIN_MEDIAN_M between them)."""
    return float(min(w, max(gap - DUAL_MIN_MEDIAN_M, DUAL_MIN_W)))


def _dual_width(sp, w, gap, feats, i):
    """A divided road carriageway's width: a mapped width stands; in a city with its centre lines within
    URBAN_MEDIAN_GAP_M, out to an URBAN_MEDIAN_M median (at most URBAN_DUAL_MAX_W); never overlapping the other
    (dual_cap)."""
    if (_rule_value(feats.rules.get("width"), i) is not None
            or _osm(feats, "width", i, *OSM_WIDTH_M) is not None):
        return w
    if sp.urban and gap <= URBAN_MEDIAN_GAP_M:
        w = float(np.clip(gap - URBAN_MEDIAN_M, w, URBAN_DUAL_MAX_W))
    return dual_cap(gap, w)


def _centre_gap(a, b):
    """The median distance (m) from polyline a's points to polyline b (both (k, 2) in metres) where b is beside it
    (within DUAL_GAP_M): a divided road's centre lines apart."""
    import fast
    fast.require(0, "polyline_dist")
    d = np.asarray(fast._ef.polyline_dist(np.ascontiguousarray(b, np.float64), np.ascontiguousarray(a, np.float64)))
    beside = d[d <= DUAL_GAP_M[1]]       # where it runs beside the other (a longer piece's far end inflated it 2x)
    return float(np.median(beside)) if len(beside) else float(np.median(d))


def road_specs(feats, urban_fn=None, widths=None, left_hand=False):
    """Per feature: None (left out) or (width m, surface kind). urban_fn(lat, lon) -> bool array (built-up
    land cover), None = rural everywhere; called once for every candidate's points (its cost is per
    call:, one call per road made 4.4 of a physics block's 6 s). Pure given urban_fn.
    Remembered on feats (mapdata keeps decoded cells in memory: every tile of a cell asked again)."""
    memo = feats.__dict__.setdefault("_road_specs", {})
    k = (urban_fn, widths, bool(left_hand))     # a bound method equals another of the same object and function
    got = memo.get(k)
    if got is None:             # (the measured widths on the specs without them: those are asked for too, _bridge_reach)
        extra = (widths is not None, bool(left_hand))
        if urban_fn is None:    # (the land cover's are the server's own: not shared, cell_facts)
            got = _specs_from(_facts_load(feats, "specs", extra), len(feats))
        if got is None:
            import revisit
            f0 = revisit.faults()
            got = (_road_specs(feats, urban_fn, left_hand) if widths is None else
                   _measured_widths(feats, road_specs(feats, urban_fn, None, left_hand), widths))
            if urban_fn is None and revisit.faults() == f0:
                _facts_store(feats, "specs", extra, [None if sp is None else _spec_json(sp) for sp in got])
        got = memo.setdefault(k, got)
    return list(got)


def _spec_json(sp):
    return {f: (v.item() if hasattr(v, "item") else list(v) if isinstance(v, tuple) else v)
            for f, v in sp._asdict().items()}


def _specs_from(data, n):
    """road_specs' list from the shared facts (_spec_json), or None."""
    if not isinstance(data, list) or len(data) != n:
        return None
    try:
        return [None if d is None else Spec(**{**d, "sides": tuple(d["sides"]) if d.get("sides") is not None else None})
                for d in data]
    except (TypeError, KeyError):
        return None


# OpenStreetMap's sidewalk tag (osmtags.py) -> walk_sides' sides; "separate" (a footway mapped on its own beside the
# road) and "no" give none. Other values (or none) leave the class and land-cover rule.
SIDEWALK_TAG = {"both": (1, -1), "left": (1,), "right": (-1,), "no": (), "none": (), "separate": ()}


def _osm_sidewalks(feats, specs):
    """specs with sides set where OpenStreetMap's sidewalk tag says which (SIDEWALK_TAG). Pure."""
    tags = feats.attrs.get("osm_sidewalk")
    if tags is None:
        return specs
    out = list(specs)
    for i, sp in enumerate(out):
        if sp is None or sp.kind not in BUILT:
            continue
        tag = str(tags[i]).strip().lower()
        if tag in SIDEWALK_TAG:
            out[i] = sp._replace(sides=SIDEWALK_TAG[tag])
    return out


UNBUILT_SHARE = 0.5     # a feature Overture flags is_under_construction over this share of its length is not built


def unbuilt(feats, i):
    """Is feature i a road not built yet (OpenStreetMap's highway=construction / proposed: osmtags osm_highway, or
    Overture's is_under_construction flag over most of it)? Not drawn, as on the stock map views (GitHub #184). (The
    Gotthard road tunnel's second bore, highway=construction until ~2029, was built beside the real one, its portal in
    the A2's lanes: Layercake leaves construction ways out, and the join took the open tunnel's tags.)"""
    col = feats.attrs.get("osm_highway")
    if col is not None and str(col[i]) in ("construction", "proposed"):
        return True
    t = feats.rules.get("flags")
    if t is None or len(t.feature) == 0:
        return False
    share = 0.0
    for j in t.rows(i):
        if "is_under_construction" in str(t.value[j]):
            a, b = float(t.start[j]), float(t.end[j])
            share += (b - a) if b > a else 1.0      # (no range: the whole feature)
    return share >= UNBUILT_SHARE


def _road_specs(feats, urban_fn, left_hand):
    out = []
    rules = feats.rules
    ask = []                                    # (index in out, cls, kind, rule_w, coordinate range)
    developed_both = {}
    cr = rules.get("connectors")
    ncon = np.bincount(np.asarray(cr.feature), minlength=len(feats)) if cr is not None and len(cr.feature) else None
    lens = _lengths(feats) if ncon is not None else None
    for i in range(len(feats)):
        cls = str(feats.attrs["class"][i]) if "class" in feats.attrs else "unknown"
        if str(feats.attrs.get("subtype", ["road"] * len(feats))[i]) != "road" or cls not in STYLE or unbuilt(feats, i):
            out.append(None)
            continue
        rngs = raw_level_ranges(feats, i)        # (raw: _skew_decks reads these specs)
        if rngs and sum(b - a for a, b, _ in rngs) > 1.0 - MIN_PART:     # entirely off the ground
            out.append(None)
            continue
        width = _rule_value(rules.get("width"), i)
        rule_w = float(width) if width is not None and 1.0 <= float(width) <= 40.0 else None
        if rule_w is None:
            rule_w = _osm(feats, "width", i, *OSM_WIDTH_M)      # OpenStreetMap's width (osmtags.py)
        lanes = _osm(feats, "lanes", i, *OSM_LANES)
        lanes = int(lanes) if lanes is not None else None
        surf = _rule_value(rules.get("surface"), i)
        kind = surface_kind(cls, surf)
        ow = _rule_value(rules.get("oneway"), i) is not None
        link = _rule_value(rules.get("subclass"), i) == "link"
        if rule_w is None and link and lanes is None:
            rule_w = LINK_M[1] if ow else LINK_M[2]
        dk = _dir_kmh(feats, i, ncon, lens)
        if dk[1] is None:                       # OpenStreetMap's speed limit where Overture has none
            ms = _osm(feats, "maxspeed", i, 5.0, 200.0)
            if ms is not None:
                dk = (dk[0], ms, dk[2])
        if urban_fn is not None and rule_w is None and kind in BUILT:
            a = feats.coord_off[feats.ring_off[feats.part_off[i]]]
            b = feats.coord_off[feats.ring_off[feats.part_off[i + 1]]]
            if b > a:
                ask.append((len(out), cls, kind, a, b, ow, dk, lanes, surface_token(surf), link))
                out.append(None)
                continue
        out.append(Spec(carriageway(cls, kind, False, rule_w, ow, lanes), kind, False, cls, ow, 2.5, *dk,
                        lanes=lanes, surf=surface_token(surf), link=link))
    if ask:
        lines = [_even(feats.lonlat[a:b], URBAN_STEP_M) for _, _, _, a, b, *_ in ask]
        counts = [len(p) for p in lines]
        ll = np.concatenate(lines)
        left, right = _beside(ll, counts, URBAN_BESIDE_M)
        n = len(ll)
        pts = np.concatenate([ll, left, right])
        u_all = np.asarray(urban_fn(pts[:, 1], pts[:, 0]), bool)      # (one call: its cost is per call)
        u, by, both = u_all[:n], u_all[n:2 * n] | u_all[2 * n:], u_all[n:2 * n] & u_all[2 * n:]
        k = 0
        for (j, cls, kind, a, b, ow, dk, lanes, token, link), c in zip(ask, counts):
            developed_both[j] = float(np.mean(both[k:k + c])) >= URBAN_BOTH_SHARE
            urban = (float(np.mean(u[k:k + c])) >= URBAN_SHARE
                     and float(np.mean(by[k:k + c])) >= URBAN_BESIDE_SHARE
                     and (cls not in ("motorway", "trunk")
                          or float(np.mean(both[k:k + c])) >= URBAN_BOTH_SHARE))
            k += c
            out[j] = Spec(carriageway(cls, kind, urban, None, ow, lanes), kind, urban, cls, ow, 2.5, *dk, lanes=lanes,
                          surf=token, link=link)
    out = _rings(feats, out)
    out = dual_carriageways(feats, out, left_hand)
    # A primary's opposite carriageway can supply all of its apparent development
    # on one side. Apply the major-highway rule after pairing, without changing
    # ordinary town main streets or explicitly mapped sidewalk/lighting tags.
    for j, sp in enumerate(out):
        if (sp is not None and sp.cls == "primary" and sp.median and sp.urban
                and not developed_both.get(j, True)):
            width = _rule_value(rules.get("width"), j)
            if width is None:
                width = _osm(feats, "width", j, *OSM_WIDTH_M)
            w = carriageway(sp.cls, sp.kind, False, width, sp.oneway, sp.lanes)
            out[j] = sp._replace(urban=False, width=_dual_width(sp._replace(urban=False), w, sp.median, feats, j))
    return _osm_sidewalks(feats, _rural_connectors(feats, out))


def _rural_connectors(feats, specs):
    """Short links across a rural divided highway inherit its roadside context.

    The two carriageways themselves can make a median crossing look built-up.
    Require both ends to meet distinct rural divided roads; an urban connection
    or a road merely running nearby is not evidence. OSM overrides follow this.
    """
    candidates = [i for i, sp in enumerate(specs) if sp is not None and sp.link and sp.urban
                  and sp.cls in ("trunk", "primary", "secondary", "tertiary")]
    rural = [i for i, sp in enumerate(specs) if sp is not None and not sp.urban and sp.oneway
             and sp.median and sp.cls in ("motorway", "trunk", "primary")]
    if not candidates or len(rural) < 2:
        return specs
    ends = {}
    for i in candidates + rural:
        a = feats.coord_off[feats.ring_off[feats.part_off[i]]]
        b = feats.coord_off[feats.ring_off[feats.part_off[i + 1]]]
        if b > a:
            ends[i] = feats.lonlat[[a, b - 1]]
    points = np.concatenate([ends[i] for i in rural if i in ends])
    owners = np.repeat([i for i in rural if i in ends], 2)
    scale = np.array([111320.0 * math.cos(math.radians(float(points[:, 1].mean()))), 110540.0])
    out = list(specs)
    lengths = _lengths(feats)
    for i in candidates:
        if i not in ends or lengths[i] > 2 * URBAN_BESIDE_M:
            continue
        distance = np.linalg.norm((ends[i][:, None] - points[None]) * scale, axis=2)
        attached = [set(owners[distance[j] < 2.5]) for j in (0, 1)]
        if not attached[0] or not attached[1] or len(attached[0] | attached[1]) < 2:
            continue
        sp = out[i]
        width = _rule_value(feats.rules.get("width"), i)
        if width is None:
            width = _osm(feats, "width", i, *OSM_WIDTH_M)
        out[i] = sp._replace(urban=False, width=carriageway(sp.cls, sp.kind, False, width, sp.oneway, sp.lanes))
    return out


# Roundabouts (OpenStreetMap junction=roundabout / circular: osmtags osm_junction): the circulatory roadway as wide as
# the design guides make it, not a one-way street's lane (3.5-4 m: cars clipped the central island's curb). FHWA /
# NCHRP Report 672 (Roundabouts: An Informational Guide, 2nd ed., 6.4.5 / 6.5.5): single-lane 16-20 ft (4.9-6.1 m),
# two-lane 29-32 ft (8.8-9.8 m). No parking lanes or inferred sidewalks on the ring (urban False; mapped sidewalks
# stay). (cody196's took 9 m a lane: twice the guides.)
RING_LANE_M = 5.5               # m: a single-lane ring
RING_EXTRA_LANE_M = 4.3         # m per further circulating lane
RING_JUNCTIONS = ("roundabout", "circular")


def ring_width(lanes):
    """The circulatory roadway's width for its lane count (None: one)."""
    return RING_LANE_M + RING_EXTRA_LANE_M * (max(1, int(lanes or 1)) - 1)


def is_ring(feats, i):
    """Is feature i a mapped roundabout ring (osmtags osm_junction)?"""
    col = feats.attrs.get("osm_junction")
    return col is not None and str(col[i]) in RING_JUNCTIONS


def _rings(feats, specs):
    """specs with the mapped roundabout rings widened to ring_width (or their mapped width, if wider). Pure."""
    if feats.attrs.get("osm_junction") is None:
        return specs
    out = list(specs)
    rules = feats.rules
    for i, sp in enumerate(out):
        if sp is None or sp.kind not in BUILT or not is_ring(feats, i):
            continue
        width = _rule_value(rules.get("width"), i)
        mapped = float(width) if width is not None and 1.0 <= float(width) <= 40.0 else None
        if mapped is None:
            mapped = _osm(feats, "width", i, *OSM_WIDTH_M)
        out[i] = sp._replace(width=max(mapped or 0.0, ring_width(sp.lanes)), urban=False, median=None)
    return out


def _measured_widths(feats, specs, widths):
    """specs with the widths measured between the buildings (roadwidth.py: widths(id, lonlat) -> (carriageway m,
    sidewalk m) or None) where the map gives none. Pure given widths."""
    rules = feats.rules
    out = list(specs)
    for j, sp in enumerate(out):
        if sp is None or sp.kind not in BUILT or sp.cls not in SIDEWALK_CLASSES or sp.cls in MEASURE_SKIP:
            continue
        if _rule_value(rules.get("width"), j) is not None:
            continue
        if sp.median:       # one carriageway of a divided road: the width between the buildings is both of them
            continue        # and the median (each took all of it, one wide road over Boston Street's median)
        if is_ring(feats, j):
            continue        # (a roundabout: _rings' circulatory width; the buildings stand round the whole circle)
        a = feats.coord_off[feats.ring_off[feats.part_off[j]]]
        b = feats.coord_off[feats.ring_off[feats.part_off[j + 1]]]
        if _osm(feats, "width", j, *OSM_WIDTH_M) is not None or sp.lanes:
            continue        # (OpenStreetMap's own width, or its lane count's)
        m = widths(str(feats.ids[j]), feats.lonlat[a:b]) if b > a else None
        dflt = carriageway(sp.cls, sp.kind, True, None, sp.oneway, sp.lanes)
        # Historic streets can be one shared lane between close building fronts. Rejecting these measurements
        # kept a default carriageway wider than the street itself.
        minimum = 3.0 if sp.cls in {"residential", "living_street", "unclassified", "tertiary"} else 0.6 * dflt
        if m is not None and minimum <= m[0] <= MEASURE_MAX * dflt:
            out[j] = sp._replace(width=m[0], walk=m[1])
    return out


def _even(p, step):
    """A line (lon/lat (k, 2)) as points every step m along it, its ends included. Pure."""
    if len(p) < 2:
        return p
    m = np.array([111320.0 * math.cos(math.radians(float(p[:, 1].mean()))), 110540.0])   # m per degree
    cum = np.r_[0.0, np.cumsum(np.hypot(*(np.diff(p, axis=0) * m).T))]
    s = np.r_[np.arange(0.0, cum[-1], step), cum[-1]]
    return np.c_[np.interp(s, cum, p[:, 0]), np.interp(s, cum, p[:, 1])]


def _beside(ll, counts, d):
    """The points d m to the left and to the right of each vertex of the lines (lon/lat (n, 2), counts: the vertices of
    each line in turn), square to the line there; a one-vertex line's are the vertex itself. Pure."""
    left, right = np.empty_like(ll), np.empty_like(ll)
    k = 0
    for c in counts:
        p = ll[k:k + c]
        if c < 2:
            left[k:k + c] = right[k:k + c] = p
            k += c
            continue
        m = np.array([111320.0 * math.cos(math.radians(float(p[:, 1].mean()))), 110540.0])   # m per degree
        t = np.gradient(p * m, axis=0)
        t /= np.maximum(np.hypot(t[:, 0], t[:, 1]), 1e-9)[:, None]
        off = np.stack([-t[:, 1], t[:, 0]], axis=1) * d / m
        left[k:k + c], right[k:k + c] = p + off, p - off
        k += c
    return left, right
