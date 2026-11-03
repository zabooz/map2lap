"""Which stretches of a road are bridges and tunnels: map tags, lidar, the rules between them."""
import math
import os
import threading

import numpy as np

import osmtags

from .style import LINK_M, OSM_LANES, OSM_WIDTH_M, STYLE, Spec, log
from .tags import _cell_load, _facts_store, _osm, _rule_value, raw_level_ranges
from .specs import MIN_PART, carriageway, road_specs, surface_kind, surface_token, unbuilt


# a road crossing a tunnel at a flatter angle counts as crossing at this sine (the reach along the tunnel is / the
# sine: it would run away); the portals here and the covered sections (decks.py) read it
TUNNEL_ROAD_MIN_SIN = 0.35

URBAN_CLASS = 50                # ESA WorldCover "built-up"


def level_ranges(feats, i):
    """The off-ground ranges of feature i as sorted (start, end, "bridge" | "tunnel") fractions of its
    length, from its flags (is_bridge / is_tunnel) and level (> 0 bridge, < 0 tunnel) rules. Overture
    puts most bridges on a range of a longer segment (a street with a few metres of bridge
    was taken whole as a bridge and dropped). Pure. A cell's are made all at once and shared (cell_facts)."""
    memo = feats.__dict__.setdefault("_level_ranges", {})
    got = memo.get(i)
    if got is None:
        _cell_ranges(feats)
        got = memo.get(i)
        if got is None:
            got = memo[i] = _lidar_gaps(feats, i, rule_level_ranges(feats, i))
    if feats.__dict__.get("_lidar_rule"):
        import revisit                      # (the rule for want of the lidar: nothing built on it is kept)
        revisit.fault()
    return list(got)


def rule_level_ranges(feats, i):
    """level_ranges before the lidar's elevated stretches (_lidar_gaps): the map's ranges lengthened (_skew_decks) and
    their short ground gaps between decks filled (_deck_gaps). roadz.py measures the lidar along these (its answer is
    what level_ranges adds). Remembered on feats."""
    memo = feats.__dict__.setdefault("_rule_level_ranges", {})
    got = memo.get(i)
    if got is None:
        got = memo[i] = _deck_gaps(feats, i, _skew_decks(feats, i, raw_level_ranges(feats, i)))
    return list(got)


def _cell_ranges(feats):
    """Every feature's raw and lengthened level ranges into feats' memos: from the shared facts (_cell_load), or made
    here and kept there."""
    if not _cell_load(feats):
        return
    st = feats.__dict__
    import revisit
    f0 = revisit.faults()
    raw = [raw_level_ranges(feats, i) for i in range(len(feats))]
    lvl = [level_ranges(feats, i) for i in range(len(feats))]
    st["_ranges_state"] = "done"
    if revisit.faults() == f0:
        _facts_store(feats, "ranges", None, {"raw": [[[float(a), float(b), k] for a, b, k in r] for r in raw],
                                             "lvl": [[[float(a), float(b), k] for a, b, k in r] for r in lvl]})


# A bridge over a road spans more than its carriageway: the road's shoulders and the abutments' slopes stand under it.
# The map's bridge range often ends close to the lower road's edge (an 18 m deck of the Baltimore-Washington Parkway
# over an 11 m local road: the ground climbed 10 m from the road's edge to the Parkway within 3 m, wedges
# into its lanes), or, crossing at an angle, short of its edge under the upper road's outer lanes. A bridge range is
# lengthened until it covers, across the upper road's whole width, the lower road's carriageway, SKEW_MARGIN_M and an
# abutment slope of SKEW_SLOPE_M either side: (lower half width + margin + slope) / sin + upper half width / tan of
# the angle between them, at most SKEW_MAX_M more per end (onto the road joined there: _skew_decks).
SKEW_ON = os.environ.get("BNE_SKEW_DECKS", "on") != "off"
SKEW_MARGIN_M = 1.5         # m past the lower road's carriageway edge kept level (its shoulder)
SKEW_SLOPE_M = 6.0          # m for the abutment's slope up to the upper road, under the deck
SKEW_MAX_M = 30.0           # m a bridge range grows at most at each end
SKEW_MIN_SIN = math.sin(math.radians(20.0))    # flatter crossings are taken as this (the reach would run away)


def _feature_boxes(feats):
    """(n, 4) lon/lat boxes (lon0, lat0, lon1, lat1) of the features, remembered on feats."""
    got = feats.__dict__.get("_lonlat_boxes")
    if got is None:
        n = len(feats)
        got = np.full((n, 4), np.nan)
        po = np.asarray(feats.part_off, np.int64)
        co, ro = np.asarray(feats.coord_off, np.int64), np.asarray(feats.ring_off, np.int64)
        a, b = co[ro[po[:-1]]], co[ro[po[1:]]]
        ok = b > a
        ll = np.asarray(feats.lonlat, np.float64)
        if ok.any() and np.all(a[ok][1:] == b[ok][:-1]) and b[ok][-1] == len(ll):   # (contiguous: one reduce each)
            st = a[ok]
            got[ok, 0], got[ok, 1] = np.minimum.reduceat(ll[:, 0], st), np.minimum.reduceat(ll[:, 1], st)
            got[ok, 2], got[ok, 3] = np.maximum.reduceat(ll[:, 0], st), np.maximum.reduceat(ll[:, 1], st)
        else:
            for i in np.flatnonzero(ok):
                seg = ll[a[i]:b[i]]
                got[i] = (seg[:, 0].min(), seg[:, 1].min(), seg[:, 0].max(), seg[:, 1].max())
        feats.__dict__["_lonlat_boxes"] = got
    return got


def _raw_ground_parts(feats, j):
    """Feature j's on-ground pieces from its raw_level_ranges (_skew_decks: level_ranges of the others would recurse)."""
    pieces, at = [], 0.0
    for a, b, _ in raw_level_ranges(feats, j):
        if a - at > MIN_PART:
            pieces.append((at, a))
        at = max(at, b)
    if 1.0 - at > MIN_PART:
        pieces.append((at, 1.0))
    out = []
    for part in feats.parts(j):
        for ring in part:
            if len(ring) >= 2:
                for a, b in pieces:
                    out.append(ring if (a, b) == (0.0, 1.0) else sub_polyline(ring, a, b))
    return out


def _seg_hits(m, lines):
    """(line index, arc m along polyline m, sin of the angle) where each of the polylines lines (all (k, 2) m) crosses
    m (earthfast.seg_hits). Pure."""
    import fast
    fast.require(73, "seg_hits")
    starts = np.r_[0, np.cumsum([len(g) for g in lines])].astype(np.int64)
    return fast._ef.seg_hits(np.ascontiguousarray(m, np.float64),
                             np.ascontiguousarray(np.vstack(lines), np.float64), starts)


def _structure_width(feats, i):
    """m: the carriageway of road feature i as _bridge_specs makes it, without its level ranges (a road bridged along
    its whole length has no road_specs entry: its ranges were never lengthened over the roads under it; from cody196's
   ), or None (not a drawn road)."""
    cls = str(feats.attrs["class"][i]) if "class" in feats.attrs else "unknown"
    if str(feats.attrs.get("subtype", ["road"] * len(feats))[i]) != "road" or cls not in STYLE or unbuilt(feats, i):
        return None
    rules = feats.rules
    width = _rule_value(rules.get("width"), i)
    rule_w = float(width) if width is not None and 1.0 <= float(width) <= 40.0 else None
    if rule_w is None:
        rule_w = _osm(feats, "width", i, *OSM_WIDTH_M)
    lanes = _osm(feats, "lanes", i, *OSM_LANES)
    lanes = int(lanes) if lanes is not None else None
    kind = surface_kind(cls, _rule_value(rules.get("surface"), i))
    ow = _rule_value(rules.get("oneway"), i) is not None
    if rule_w is None and _rule_value(rules.get("subclass"), i) == "link" and lanes is None:
        rule_w = LINK_M[1] if ow else LINK_M[2]
    return carriageway(cls, kind, False, rule_w, ow, lanes)


def _bridge_reach(feats, i):
    """Bridge feature i's ranges lengthened over the ground roads crossing under them (SKEW_*), and how far past each
    end of the feature they would reach: {"ranges": [...], "over": [m past its start, m past its end]} (_skew_decks
    puts that on the road joined there). Remembered on feats. Pure given feats."""
    memo = feats.__dict__.setdefault("_bridge_reach", {})
    got = memo.get(i)
    if got is not None:
        return got
    rngs = raw_level_ranges(feats, i)
    got = {"ranges": rngs, "over": [0.0, 0.0]}
    memo[i] = got
    specs = road_specs(feats)
    up_w = specs[i].width if specs[i] is not None else _structure_width(feats, i)
    rings = [np.asarray(r, np.float64) for part in feats.parts(i) for r in part if len(r) >= 2]
    if up_w is None or not rings or not any(k == "bridge" for _, _, k in rngs):
        return got
    ring = rings[0]
    kx, ky = 111320.0 * math.cos(math.radians(float(ring[0, 1]))), 111320.0
    m = (ring - ring[0]) * [kx, ky]
    sm = np.r_[0.0, np.cumsum(np.hypot(*np.diff(m, axis=0).T))]
    L = float(sm[-1])
    if L <= 0:
        return got
    boxes = _feature_boxes(feats)
    out, over = [], [0.0, 0.0]
    for n, (a, b, k) in enumerate(rngs):
        if k == "bridge":
            a0, b0 = a, b
            lo_m, hi_m = a0 * L, b0 * L
            # (only the bridge's own stretch: a crossing counts under it; a 3 km segment's whole line and every road
            # near it cost a rail-yard tile seconds)
            inner = (sm > lo_m) & (sm < hi_m)      # (metres: sub_polyline scales lon/lat)
            sub = np.vstack([[np.interp(lo_m, sm, m[:, 0]), np.interp(lo_m, sm, m[:, 1])], m[inner],
                             [np.interp(hi_m, sm, m[:, 0]), np.interp(hi_m, sm, m[:, 1])]])
            pad = 1.0
            blo = (sub.min(0) - pad) / [kx, ky] + ring[0]
            bhi = (sub.max(0) + pad) / [kx, ky] + ring[0]
            near = np.flatnonzero((boxes[:, 0] <= bhi[0]) & (boxes[:, 2] >= blo[0]) & (boxes[:, 1] <= bhi[1]) &
                                  (boxes[:, 3] >= blo[1]))
            gl, gj = [], []
            for j in near:
                if j == i or specs[j] is None:
                    continue
                for g in _raw_ground_parts(feats, j):
                    gl.append((np.asarray(g, np.float64) - ring[0]) * [kx, ky])
                    gj.append(j)
            lo0, hi0 = lo_m, hi_m           # (arcs along sub: from lo0; a crossing at either end of it does not count)
            for g, sc, sin in (_seg_hits(sub, gl) if gl else ()):
                sc += lo0
                if not lo0 < sc < hi0:
                    continue
                j = gj[g]
                sin = max(sin, SKEW_MIN_SIN)
                cos = math.sqrt(max(0.0, 1.0 - sin * sin))
                h = (specs[j].width / 2 + SKEW_MARGIN_M + SKEW_SLOPE_M) / sin + (up_w / 2) * cos / sin
                lo_m = min(lo_m, max(a0 * L - SKEW_MAX_M, sc - h))
                hi_m = max(hi_m, min(b0 * L + SKEW_MAX_M, sc + h))
            prev = out[-1][1] if out else 0.0   # (never into a neighbouring range; past the feature's ends: "over")
            nxt = rngs[n + 1][0] if n + 1 < len(rngs) else 1.0
            if lo_m < 0 and a0 <= 1e-9:
                over[0] = max(over[0], -lo_m)
            if hi_m > L and b0 >= 1.0 - 1e-9:
                over[1] = max(over[1], hi_m - L)
            a, b = max(lo_m / L, prev, 0.0), min(hi_m / L, nxt, 1.0)
        out.append((a, b, k))
    got = memo[i] = {"ranges": out, "over": over}
    return got


# A tunnel's portal moved out past a ground road crossing over the tunnel's road at it (earthfast.tunnel_reach): its
# carriageway and TUNNEL_PORTAL_CLEAR_M past it (along the road: / the sine of the crossing, at least TUNNEL_ROAD_MIN_SIN),
# a crossing up to TUNNEL_PORTAL_REACH_M outside the portal, TUNNEL_PORTAL_GROW_M at most. OSM often ends an underpass's
# tunnel inside the carriageway over it: the portal's approach cut ran through the A-7's lanes near Malaga.
TUNNEL_PORTAL_CLEAR_M = 3.0
TUNNEL_PORTAL_REACH_M = 10.0
TUNNEL_PORTAL_GROW_M = 30.0
TUNNEL_PORTAL_END_M = 2.0   # m: a crossing this close to the other road's end is a junction
# A portal inside the carriageway of a road running along the tunnel (the map's ground stretch of a service tunnel laid
# in a motorway's lanes: the Gotthard road tunnel's service gallery at Goeschenen, an arch and a mound in the A2's
# lanes) moves into the tunnel until clear, TUNNEL_PORTAL_SHRINK_M at most; a tunnel shorter than
# TUNNEL_PORTAL_MIN_M left that way is none.
TUNNEL_PORTAL_SHRINK_M = 60.0
TUNNEL_PORTAL_MIN_M = 8.0


def _tunnel_reach(feats, i, rngs):
    """rngs with feature i's tunnel ranges grown over the ground roads crossing it at their portals
    (TUNNEL_PORTAL_*), never into a neighbouring range. Pure given feats."""
    specs = road_specs(feats)
    rings = [np.asarray(r, np.float64) for part in feats.parts(i) for r in part if len(r) >= 2]
    if specs[i] is None or not rings:
        return rngs
    ring = rings[0]
    kx, ky = 111320.0 * math.cos(math.radians(float(ring[0, 1]))), 111320.0
    m = (ring - ring[0]) * [kx, ky]
    sm = np.r_[0.0, np.cumsum(np.hypot(*np.diff(m, axis=0).T))]
    L = float(sm[-1])
    if L <= 0:
        return rngs
    tun = [n for n, (_, _, k) in enumerate(rngs) if k == "tunnel"]
    pad = (TUNNEL_PORTAL_REACH_M + TUNNEL_PORTAL_GROW_M + 1.0) / np.array([kx, ky])
    boxes = _feature_boxes(feats)
    near = np.zeros(len(boxes), bool)
    for n in tun:                   # (the roads near the portals only)
        for f in rngs[n][:2]:
            p = (np.array([np.interp(f * L, sm, m[:, 0]), np.interp(f * L, sm, m[:, 1])]) / [kx, ky]) + ring[0]
            near |= ((boxes[:, 0] <= p[0] + pad[0]) & (boxes[:, 2] >= p[0] - pad[0]) & (boxes[:, 1] <= p[1] + pad[1]) &
                     (boxes[:, 3] >= p[1] - pad[1]))
    gl, hw = [], []
    for j in np.flatnonzero(near):
        if j == i or specs[j] is None:
            continue
        for g in _raw_ground_parts(feats, j):
            gl.append((np.asarray(g, np.float64)[:, :2] - ring[0]) * [kx, ky])
            hw.append(specs[j].width / 2)
    if not gl:
        return rngs
    import fast
    fast.require(97, "tunnel_reach")
    got = fast._ef.tunnel_reach(
        np.ascontiguousarray(m), np.ascontiguousarray(sm),
        np.ascontiguousarray([[rngs[n][0] * L, rngs[n][1] * L] for n in tun], np.float64),
        np.ascontiguousarray(np.concatenate(gl)), np.r_[0, np.cumsum([len(g) for g in gl])].astype(np.int64),
        np.asarray(hw, np.float64), np.array([TUNNEL_PORTAL_CLEAR_M, TUNNEL_ROAD_MIN_SIN, TUNNEL_PORTAL_REACH_M,
                                              TUNNEL_PORTAL_GROW_M, TUNNEL_PORTAL_END_M, TUNNEL_PORTAL_SHRINK_M,
                                              TUNNEL_PORTAL_MIN_M], np.float64))
    out = list(rngs)
    for q, n in enumerate(tun):
        prev = out[n - 1][1] if n > 0 else 0.0
        nxt = out[n + 1][0] if n + 1 < len(out) else 1.0
        out[n] = (max(float(got[q, 0]) / L, prev), min(float(got[q, 1]) / L, nxt), "tunnel")
    return [r for r in out if r[1] > r[0]]      # (a tunnel left shorter than nothing: ground)


def _bridge_ends(feats):
    """(indices (k,), end points lon/lat (k, 2, 2)) of the features with a bridge range, once per cell."""
    got = feats.__dict__.get("_bridge_ends")
    if got is None:
        idx, ends = [], []
        for b in range(len(feats)):
            if not any(k == "bridge" for _, _, k in raw_level_ranges(feats, b)):
                continue
            rings = [r for part in feats.parts(b) for r in part if len(r) >= 2]
            if rings:
                idx.append(b)
                ends.append((rings[0][0], rings[0][-1]))
        got = (np.asarray(idx, np.int64), np.asarray(ends, np.float64).reshape(-1, 2, 2))
        feats.__dict__["_bridge_ends"] = got
    return got


def _near_bridge_ends(feats):
    """Per feature: may an end of its first ring lie within _skew_decks' 0.75 m of a bridge feature's end? A box test
    in lon / lat, wider than that everywhere (earthfast.ends_near; most features are nowhere near a bridge, and their
    exact test was most of _skew_decks' time). None: no pre-check. Kept on feats."""
    got = feats.__dict__.get("_near_bridge_ends")
    if got is not None:
        return got
    import fast
    bidx, bends = _bridge_ends(feats)
    n = len(feats)
    ends = np.full((n, 2, 2), np.nan)
    exact = np.zeros(n, bool)       # (no first ring of 2 points or more: _skew_decks' own test, which finds its ring)
    for i in range(n):
        if feats.part_off[i + 1] <= feats.part_off[i]:
            continue                # (no parts: nothing to lengthen)
        r = feats.ring_off[feats.part_off[i]]
        a, b = feats.coord_off[r], feats.coord_off[r + 1]
        if b - a >= 2:
            ends[i, 0], ends[i, 1] = feats.lonlat[a], feats.lonlat[b - 1]
        else:
            exact[i] = True
    lat = float(np.nanmax(np.abs(ends[:, :, 1]))) if np.isfinite(ends[:, :, 1]).any() else 0.0
    if not np.isfinite(lat) or lat > 89.0:
        feats.__dict__["_near_bridge_ends"] = got = None
        return got
    ty = 2.0 / 111320.0                                         # (2 m: 0.75 m and room)
    tx = ty / max(math.cos(math.radians(min(lat + 0.1, 89.0))), 1e-3)
    fast.require(75, "ends_near")
    m = np.asarray(fast._ef.ends_near(np.ascontiguousarray(ends.reshape(-1, 2)),
                                     np.ascontiguousarray(bends.reshape(-1, 2)), float(tx), float(ty)), bool)
    got = m.reshape(n, 2).any(axis=1) | exact
    feats.__dict__["_near_bridge_ends"] = got
    return got


def _skew_decks(feats, i, rngs):
    """rngs (feature i's raw_level_ranges) with its bridge ranges lengthened over the roads crossing under them
    (_bridge_reach), and a bridge range at an end of i where a bridge feature joined there reaches past its own end
    onto i (Overture makes most short bridges a segment of their own). Pure given feats."""
    if any(k == "tunnel" for _, _, k in rngs):
        rngs = _tunnel_reach(feats, i, rngs)
    if not SKEW_ON:
        return rngs
    if any(k == "bridge" for _, _, k in rngs):
        rngs = _bridge_reach(feats, i)["ranges"]
    bidx, bends = _bridge_ends(feats)
    if not len(bidx):
        return rngs
    near = _near_bridge_ends(feats)
    if near is not None and not near[i]:
        return rngs                             # (no end of it near a bridge's end: nothing joins it)
    rings = [np.asarray(r, np.float64) for part in feats.parts(i) for r in part if len(r) >= 2]
    if not rings:
        return rngs
    ring = rings[0]
    kx, ky = 111320.0 * math.cos(math.radians(float(ring[0, 1]))), 111320.0
    tol = 0.75
    add = []
    L = None
    for end, p in ((0, ring[0]), (1, ring[-1])):
        if any((a <= 1e-9 if end == 0 else b >= 1.0 - 1e-9) for a, b, _ in rngs):
            continue                            # off the ground at that end already
        d = np.hypot((bends[:, :, 0] - p[0]) * kx, (bends[:, :, 1] - p[1]) * ky)     # (k, 2) to each bridge's ends
        best = 0.0
        for r, e2 in zip(*np.nonzero(d < tol)):
            b = int(bidx[r])
            if b != i:
                best = max(best, _bridge_reach(feats, b)["over"][int(e2)])
        if best > 0:
            if L is None:
                L = float(np.hypot(*(np.diff(ring, axis=0) * [kx, ky]).T).sum())
            if L <= 0:
                break
            f = min(best, SKEW_MAX_M) / L
            add.append((0.0, min(f, 1.0), "bridge") if end == 0 else (max(1.0 - f, 0.0), 1.0, "bridge"))
    if not add:
        return rngs
    out = []
    for a, b, k in sorted(list(rngs) + add):
        if out and a <= out[-1][1] + 1e-9:     # (overlapping a range already there: joined, as level_ranges does)
            pa, pb, pk = out[-1]
            out[-1] = (pa, max(pb, b), "tunnel" if "tunnel" in (pk, k) else "bridge")
        else:
            out.append((a, b, k))
    return out


# A ground piece of a road shorter than GAP_DECK_M with a deck on both sides (a bridge range of its own, or another
# road's bridge going on from its end with nothing else meeting there) and no road joining it is deck too: a viaduct's
# stretch the map leaves untagged between two bridges was drawn on the ground, each deck eased down to it and up again
# (with the measured decks, 10-15 m: the Springfield Interchange). A junction on it keeps it on the ground.
GAP_DECK_ON = os.environ.get("BNE_DECK_GAPS", "on") != "off"
GAP_DECK_M = 60.0
GAP_JUNCTION_M = 1.5
GAP_JOIN_M = 0.75           # (_skew_decks' tolerance for a road's end at another's)


def _first_ring_ends(feats):
    """(n, 2, 2) lon / lat of each feature's first ring's two ends (NaN: none), kept on feats."""
    got = feats.__dict__.get("_first_ring_ends")
    if got is None:
        n = len(feats)
        got = np.full((n, 2, 2), np.nan)
        for i in range(n):
            if feats.part_off[i + 1] <= feats.part_off[i]:
                continue
            r = feats.ring_off[feats.part_off[i]]
            a, b = feats.coord_off[r], feats.coord_off[r + 1]
            if b - a >= 2:
                got[i, 0], got[i, 1] = feats.lonlat[a][:2], feats.lonlat[b - 1][:2]
        feats.__dict__["_first_ring_ends"] = got
    return got


def _deck_gaps(feats, i, rngs):
    """rngs (feature i's level ranges) with its short ground gaps between decks made bridge (GAP_DECK_*;
    earthfast.deck_gaps). A road with a tunnel range keeps its own. Pure given feats."""
    if not GAP_DECK_ON or any(k == "tunnel" for _, _, k in rngs):
        return rngs
    if not any(k == "bridge" for _, _, k in rngs):
        near = _near_bridge_ends(feats)
        if near is not None and not near[i]:
            return rngs                         # (no bridge of its own, none ending at it)
    if _structure_width(feats, i) is None:
        return rngs                             # (railways: their own pieces)
    rings = [np.asarray(r, np.float64) for part in feats.parts(i) for r in part if len(r) >= 2]
    if not rings:
        return rngs
    ring = rings[0][:, :2]
    kx, ky = 111320.0 * math.cos(math.radians(float(ring[0, 1]))), 111320.0
    m = (ring - ring[0]) * [kx, ky]
    L = float(np.hypot(*np.diff(m, axis=0).T).sum())
    if L <= 0:
        return rngs
    specs = road_specs(feats)
    ends = _first_ring_ends(feats)
    boxes = _feature_boxes(feats)
    end_deck = []
    for e, p in ((0, ring[0]), (1, ring[-1])):
        d = np.hypot((ends[:, :, 0] - p[0]) * kx, (ends[:, :, 1] - p[1]) * ky)
        d[i] = np.inf
        hit = [(int(j), int(k)) for j, k in zip(*np.nonzero(d < GAP_JOIN_M))]
        ok = len(hit) == 1
        if ok:
            j, k = hit[0]
            rj = raw_level_ranges(feats, j)
            ok = any(kk == "bridge" and (a <= 1e-6 if k == 0 else b >= 1.0 - 1e-6) for a, b, kk in rj)
        end_deck.append(ok)
    bridges = [(a * L, b * L) for a, b, k in rngs if k == "bridge"]
    pad = (GAP_JUNCTION_M + 1.0) / np.array([kx, ky])
    lo, hi = ring.min(0) - pad, ring.max(0) + pad
    near = np.flatnonzero((boxes[:, 0] <= hi[0]) & (boxes[:, 2] >= lo[0]) & (boxes[:, 1] <= hi[1]) &
                          (boxes[:, 3] >= lo[1]))
    others = [(ends[j, k] - ring[0]) * [kx, ky] for j in near if j != i and specs[j] is not None for k in (0, 1)
              if np.isfinite(ends[j, k]).all()]
    import fast
    fast.require(105, "deck_gaps")
    got = np.asarray(fast._ef.deck_gaps(np.ascontiguousarray(m), np.asarray(bridges, np.float64).reshape(-1, 2),
                                        np.asarray(end_deck, np.int64),
                                        np.asarray(others, np.float64).reshape(-1, 2), GAP_DECK_M, GAP_JUNCTION_M),
                     np.float64).reshape(-1, 2)
    if len(got) == len(bridges) and np.allclose(got, np.asarray(bridges, np.float64).reshape(-1, 2)):
        return rngs
    out = [(float(min(max(a / L, 0.0), 1.0)), float(min(max(b / L, 0.0), 1.0)), "bridge") for a, b in got]
    out[0] = (0.0, out[0][1], "bridge") if got[0, 0] <= 1e-6 else out[0]
    out[-1] = (out[-1][0], 1.0, "bridge") if got[-1, 1] >= L - 1e-6 else out[-1]
    return out


# Ground stretches the lidar shows on a structure (roadz.py, US 3DEP: "Sure add the check"): a
# drawn road's ground piece that touches a deck's end (rule_level_ranges) is measured along its first LIDAR_GAP_REACH_M
# with the decks' own lidar read, and is deck where its surface goes on from the deck's end well over the DTM (an
# untagged viaduct stretch: Springfield's, a measured deck eased 10-15 m down to it). roadz answers per map cell (the
# cell holding the deck's end), the same in every process (kept on disk; a cell whose lidar is not there in time keeps
# the rule for the session). BNE_LIDAR_GAPS=off: none.
LIDAR_GAPS_ON = os.environ.get("BNE_LIDAR_GAPS", "on") != "off"
LIDAR_GAP_TOUCH_M = 1.0     # m: a ground piece's end this near a deck piece's end goes on from it
LIDAR_GAP_REACH_M = 150.0   # m of a ground piece measured from that end at most


def _ll_metres(lat):
    return 111320.0 * math.cos(math.radians(lat)), 111320.0


def rule_level_ranges_near(feats):
    """{i: rule_level_ranges} of the features that can have a bridge range by the rule: one of their own (raw) or a
    bridge ending near them (_skew_decks / _deck_gaps add none elsewhere). Kept on feats."""
    got = feats.__dict__.get("_rule_near")
    if got is not None:
        return got
    near = _near_bridge_ends(feats)
    memo = feats.__dict__.get("_raw_level_ranges", {})
    got = {}
    for i in range(len(feats)):
        raw = memo.get(i)
        raw = raw if raw is not None else raw_level_ranges(feats, i)
        if any(k == "bridge" for _, _, k in raw) or near is None or near[i]:
            got[i] = rule_level_ranges(feats, i)
    feats.__dict__["_rule_near"] = got
    return got


def lidar_gap_candidates(feats):
    """[(fid, line lon/lat (k, 2) from the deck's end outward, LIDAR_GAP_REACH_M at most, half width m)] of the drawn
    roads' ground pieces (rule_level_ranges) with an end within LIDAR_GAP_TOUCH_M of a bridge piece's end (any road's).
    Pure given feats; kept on it."""
    got = feats.__dict__.get("_lidar_gap_candidates")
    if got is not None:
        return got
    n = len(feats)
    rule = [None] * n
    ends = []
    for i, rr in rule_level_ranges_near(feats).items():
        rule[i] = rr                            # (the others: no bridge of their own, none ending at them)
        for r in _parts_by_level_new(feats, i, "bridge", rule[i]):
            r = np.asarray(r, np.float64)
            ends += [r[0, :2], r[-1, :2]]
    out = []
    if ends:
        E = np.asarray(ends, np.float64)
        for i in range(n):
            if rule[i] is None or any(k == "tunnel" for _, _, k in rule[i]):
                continue
            w = _structure_width(feats, i)
            if w is None:
                continue
            fid = str(feats.ids[i])
            for r in _parts_by_level_new(feats, i, "ground", rule[i]):
                r = np.asarray(r, np.float64)[:, :2]
                if len(r) < 2:
                    continue
                kx, ky = _ll_metres(float(r[0, 1]))
                for at in (0, -1):
                    d = np.hypot((E[:, 0] - r[at, 0]) * kx, (E[:, 1] - r[at, 1]) * ky)
                    if not (d < LIDAR_GAP_TOUCH_M).any():
                        continue
                    line = r if at == 0 else r[::-1]
                    m = (line - line[0]) * [kx, ky]
                    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(m, axis=0).T))]
                    if s[-1] > LIDAR_GAP_REACH_M:
                        keep = s < LIDAR_GAP_REACH_M
                        cut = [np.interp(LIDAR_GAP_REACH_M, s, line[:, k]) for k in (0, 1)]
                        line = np.vstack([line[keep], cut])
                    out.append((fid, np.ascontiguousarray(line), max(2.5, w / 2)))
    feats.__dict__["_lidar_gap_candidates"] = out
    return out


def _lidar_cell(cid):
    """May the lidar know cell cid ("z/x/y", or a test's name: yes)? (No candidates looked for elsewhere.)"""
    try:
        z, x, y = (int(v) for v in str(cid).split("/"))
    except ValueError:
        return True
    import mapcells
    import roadz
    la, lo = mapcells.CellKey(z, x, y).center()
    return "lidar" in roadz.sources_at(la, lo, True)


def _lidar_answers(feats):
    """{fid: [(lon/lat from, lon/lat to)]} of the elevated stretches roadz found on feats' candidates (lidar_gap_
    candidates), from the answers of the cells holding their deck ends; {} without lidar. Kept on feats."""
    st = feats.__dict__
    got = st.get("_lidar_answers")
    if got is not None:
        return got
    lock = st.setdefault("_lidar_answers_lock", threading.Lock())
    with lock:
        got = st.get("_lidar_answers")
        if got is not None:
            return got
        got = {}
        try:
            import roadz
            prov = roadz.PROVIDER
            cid = st.get("_bnge_cell")
            if (LIDAR_GAPS_ON and prov is not None and prov.enabled and prov.lidar and cid is not None
                    and hasattr(prov, "gap_answers") and _lidar_cell(cid[0])):
                cands = lidar_gap_candidates(feats)
                if cands:
                    import mapcells
                    owners = sorted({mapcells.cell_of(float(c[1][0, 1]), float(c[1][0, 0])) for c in cands}, key=str)
                    fids = {c[0] for c in cands}
                    for _key, gaps in prov.gap_answers(owners).items():
                        if gaps is None:
                            st["_lidar_rule"] = True
                        for fid, a, b in gaps or ():
                            if fid in fids:
                                got.setdefault(fid, []).append((tuple(a), tuple(b)))
        except Exception as ex:             # (the rule rather than no ranges)
            log.debug("lidar gaps: %s: %s", type(ex).__name__, ex)
            got = {}
        st["_lidar_answers"] = got
    return got


def _ring_fraction(ring, p):
    """The fraction of lon/lat polyline ring's length (sub_polyline's metric) at its point nearest p (lon, lat)."""
    ring = np.asarray(ring, np.float64)[:, :2]
    c = math.cos(math.radians(float(np.mean(ring[:, 1]))))
    q = ring * [c, 1.0]
    pp = np.asarray(p, np.float64)[:2] * [c, 1.0]
    a, b = q[:-1], q[1:]
    ab = b - a
    l2 = np.maximum((ab ** 2).sum(1), 1e-30)
    t = np.clip(((pp - a) * ab).sum(1) / l2, 0.0, 1.0)
    d = np.hypot(*(a + t[:, None] * ab - pp).T)
    k = int(np.argmin(d))
    seg = np.sqrt(l2)
    s = np.r_[0.0, np.cumsum(seg)]
    return float((s[k] + t[k] * seg[k]) / max(s[-1], 1e-30))


def _lidar_gaps(feats, i, rngs):
    """rngs (rule_level_ranges) with the stretches the lidar found elevated (_lidar_answers) made bridge, never over a
    tunnel's range. Pure given feats and roadz's answer."""
    if not LIDAR_GAPS_ON or any(k == "tunnel" for _, _, k in rngs):
        return rngs
    got = _lidar_answers(feats).get(str(feats.ids[i]))
    if not got:
        return rngs
    rings = [np.asarray(r, np.float64) for part in feats.parts(i) for r in part if len(r) >= 2]
    if not rings:
        return rngs
    add = []
    for a, b in got:
        fa, fb = sorted((_ring_fraction(rings[0], a), _ring_fraction(rings[0], b)))
        if fb - fa > MIN_PART:
            add.append((0.0 if fa < 1e-4 else fa, 1.0 if fb > 1.0 - 1e-4 else fb, "bridge"))
    out = []
    for a, b, k in sorted(list(rngs) + add):
        if out and a <= out[-1][1] + 1e-9:
            out[-1] = (out[-1][0], max(out[-1][1], b), "bridge")
        else:
            out.append((a, b, k))
    return out


def sub_polyline(ring, a, b):
    """The part of a lon/lat polyline (k, >=2) between fractions a < b of its length (metres along it,
    lon scaled by cos lat). Pure."""
    ring = np.asarray(ring, np.float64)
    c = math.cos(math.radians(float(np.mean(ring[:, 1]))))
    seg = np.hypot(np.diff(ring[:, 0]) * c, np.diff(ring[:, 1]))
    s = np.r_[0.0, np.cumsum(seg)]
    if s[-1] <= 0:
        return ring[:1]
    sa, sb = a * s[-1], b * s[-1]
    inner = ring[(s > sa) & (s < sb)]
    pa = np.array([np.interp(sa, s, ring[:, d]) for d in range(ring.shape[1])])
    pb = np.array([np.interp(sb, s, ring[:, d]) for d in range(ring.shape[1])])
    return np.vstack([pa, inner, pb])


def _parts_by_level(feats, i, want):
    memo = feats.__dict__.setdefault("_parts_by_level", {})      # remembered: cells stay decoded (mapdata)
    got = memo.get((i, want))
    if got is None:
        got = memo[(i, want)] = _parts_by_level_new(feats, i, want)
    return list(got)


def _parts_by_level_new(feats, i, want, rngs=None):
    rngs = level_ranges(feats, i) if rngs is None else rngs
    if want == "ground":
        pieces, at = [], 0.0
        for a, b, _ in rngs:
            if a - at > MIN_PART:
                pieces.append((at, a))
            at = max(at, b)
        if 1.0 - at > MIN_PART:
            pieces.append((at, 1.0))
    else:
        pieces = [(a, b) for a, b, k in rngs if k == want and b - a > MIN_PART]
    out = []
    for part in feats.parts(i):
        for ring in part:
            if len(ring) < 2:
                continue
            for a, b in pieces:
                r = ring if (a, b) == (0.0, 1.0) else sub_polyline(ring, a, b)
                if len(r) >= 2:
                    out.append(r)
    return out


def bridge_levels(feats, i):
    """The level of each of bridge_parts(feats, i) (same order): the highest level rule overlapping its
    range, 1 for a bridge flagged without one. Overture's levels order stacked roads. Pure."""
    t = feats.rules.get("level")
    lv = []
    for a, b, k in level_ranges(feats, i):
        if k != "bridge" or b - a <= MIN_PART:
            continue
        best = 1.0
        if t is not None and len(t.feature):
            for j in t.rows(i):
                if t.end[j] > a and t.start[j] < b:
                    try:
                        best = max(best, float(t.value[j]))
                    except (TypeError, ValueError):
                        pass
        lv.append(best)
    rings = sum(1 for part in feats.parts(i) for ring in part if len(ring) >= 2)
    return lv * rings


def ground_parts(feats, i):
    """The on-ground pieces of feature i (lon/lat polylines): its rings minus the bridge / tunnel ranges."""
    return _parts_by_level(feats, i, "ground")


def bridge_parts(feats, i):
    """The bridge pieces of feature i (lon/lat polylines)."""
    return _parts_by_level(feats, i, "bridge")


def gallery_parts(feats, i):
    """The avalanche gallery pieces of feature i (lon/lat polylines): its ranges flagged osmtags.GALLERY_FLAG, tunnels
    (level_ranges) whose covered sections are galleries (gallery_kinds)."""
    t = feats.rules.get("flags")
    if t is None or len(t.feature) == 0:
        return []
    rngs = sorted((float(t.start[j]), float(t.end[j]), "gallery") for j in t.rows(i)
                  if str(t.value[j]) == osmtags.GALLERY_FLAG)
    return _parts_by_level_new(feats, i, "gallery", rngs) if rngs else []


def tunnel_parts(feats, i):
    """The tunnel pieces of feature i (lon/lat polylines), each end made longer where its portal would stand on a road
    it passes under (_clear_portals)."""
    memo = feats.__dict__.setdefault("_parts_by_level", {})
    got = memo.get((i, "tunnel+"))
    if got is None:
        got = memo[(i, "tunnel+")] = _clear_portals(feats, i, _parts_by_level(feats, i, "tunnel"))
    return list(got)


PORTAL_CLEAR_M = 1.0        # m a tunnel's portal face keeps from the edge of a carriageway it passes under, its tube
PORTAL_EXTEND_MAX_M = 25.0  # going on straight up to this far past the mapped end for it (an underpass mapped short: its
                            # portal face stood across the E6's lanes in Norway)
PORTAL_JOIN_M = 1.5         # a road this near a tunnel's end meets it there (a garage ramp ending in a street), not over it
UNDERPASS_MAX_M = 80.0      # only tunnel parts this short (an underpass) under roads of PORTAL_CLASSES are carried on
PORTAL_CLASSES = {"motorway", "trunk", "primary", "secondary"}


def _clear_portals(feats, i, parts):
    """parts (lon/lat polylines of feature i's tunnel ranges) with each end near a road the tube passes under (a road
    on the ground the part crosses, not joined at that end) carried on straight until the portal face (roadmesh: the
    tube's half width and its frame either side) is PORTAL_CLEAR_M clear of its carriageway and the mouth past the
    ground graded with it (grading.T_MAX beyond its edge: the floor at a mouth is that ground's height, and a mouth on
    the road's level put the tube's end over the road); an end that does not clear within PORTAL_EXTEND_MAX_M stays.
    Pure."""
    if not parts:
        return parts
    ts = tunnel_specs(feats)
    if ts[i] is None:
        return parts
    import roadmesh
    half = ts[i].width / 2 + roadmesh.TUNNEL_SHOULDER + roadmesh.PORTAL_FRAME
    rs = road_specs(feats)
    out = []
    for ring in parts:
        ring = np.asarray(ring, np.float64)
        kx = 111320.0 * math.cos(math.radians(float(ring[0, 1])))
        if float(np.hypot(*(np.diff(ring, axis=0) * [kx, 111320.0]).T).sum()) <= UNDERPASS_MAX_M:
            for at_start in (True, False):
                ring = _clear_end(feats, i, rs, ring, at_start, half)
        out.append(ring)
    return out


def _crosses(a, b):
    """Do the polylines a and b (k, 2) cross?"""
    for p, q in zip(a[:-1], a[1:]):
        r = q - p
        c, d = b[:-1], b[1:]
        s_ = d - c
        den = r[0] * s_[:, 1] - r[1] * s_[:, 0]
        ok = np.abs(den) > 1e-12
        w = c - p
        t = np.where(ok, (w[:, 0] * s_[:, 1] - w[:, 1] * s_[:, 0]) / np.where(ok, den, 1.0), -1.0)
        u = np.where(ok, (w[:, 0] * r[1] - w[:, 1] * r[0]) / np.where(ok, den, 1.0), -1.0)
        if np.any(ok & (t >= 0) & (t <= 1) & (u >= 0) & (u <= 1)):
            return True
    return False


def _clear_end(feats, i, rs, ring, at_start, half):
    import grading
    p0 = ring[0] if at_start else ring[-1]
    kx, ky = 111320.0 * math.cos(math.radians(p0[1])), 111320.0      # m per degree there
    m = (ring - p0) * [kx, ky]
    tail = m if at_start else m[::-1]                                  # from the end inwards
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(tail, axis=0).T))]
    if s[-1] < 1.0:
        return ring
    q = tail[min(np.searchsorted(s, 3.0), len(tail) - 1)]
    d = -q / max(float(np.hypot(*q)), 1e-9)                            # out of the tunnel
    nrm = np.array([-d[1], d[0]])
    reach = (half + PORTAL_EXTEND_MAX_M + 40.0) / ky                   # roads that could matter, in degrees
    roads_m = []
    for j in range(len(feats)):
        if j == i or rs[j] is None or rs[j].cls not in PORTAL_CLASSES:
            continue
        for g in ground_parts(feats, j):
            g = np.asarray(g, np.float64)
            if g[:, 1].min() > p0[1] + reach or g[:, 1].max() < p0[1] - reach or \
                    (g[:, 0].min() - p0[0]) * kx / ky > reach or (p0[0] - g[:, 0].max()) * kx / ky > reach:
                continue
            gm = (g - p0) * [kx, ky]
            a_, d_ = gm[:-1], np.diff(gm, axis=0)
            t_ = np.clip(-(a_ * d_).sum(1) / np.maximum((d_ * d_).sum(1), 1e-9), 0.0, 1.0)
            if float(np.hypot(*(a_ + t_[:, None] * d_).T).min()) < PORTAL_JOIN_M or not _crosses(m, gm):
                continue                        # joined here (an end at it or a T junction) / not over the tunnel
            hw = rs[j].width / 2
            roads_m.append((gm, ((0, hw + grading.T_MAX), (1, hw + PORTAL_CLEAR_M), (2, hw + PORTAL_CLEAR_M))))

    def clear(c):
        pts = np.array([c, c + nrm * half, c - nrm * half])
        for gm, needs in roads_m:
            a, b = gm[:-1], gm[1:]
            dd = b - a
            L2 = np.maximum((dd * dd).sum(1), 1e-9)
            for k, need in needs:
                t = np.clip(((pts[k] - a) * dd).sum(1) / L2, 0.0, 1.0)
                if np.hypot(*(a + t[:, None] * dd - pts[k]).T).min() < need:
                    return False
        return True
    if not roads_m or clear(np.zeros(2)):
        return ring
    for ext in np.arange(1.0, PORTAL_EXTEND_MAX_M + 1e-6, 1.0):
        if clear(d * ext):
            k = max(1, int(math.ceil(ext / 4.0)))
            add = np.array([d * ext * (t / k) for t in range(1, k + 1)]) / [kx, ky] + p0
            return np.vstack([add[::-1], ring]) if at_start else np.vstack([ring, add])
    return ring


def bridge_specs(feats):
    """Per feature: the Spec of a road bridge (flag is_bridge, or level above ground; not a tunnel), else
    None. No parking widths on bridges (urban False). Pure."""
    got = feats.__dict__.get("_bridge_specs")      # remembered: cells stay decoded (mapdata)
    if got is None:
        got = feats.__dict__["_bridge_specs"] = _bridge_specs(feats)
    return list(got)


def tunnel_specs(feats):
    """Per feature: the Spec of a road with a tunnel range, else None (as bridge_specs). Pure."""
    got = feats.__dict__.get("_tunnel_specs")
    if got is None:
        got = feats.__dict__["_tunnel_specs"] = _bridge_specs(feats, "tunnel")
    return list(got)


def _bridge_specs(feats, want="bridge"):
    out = []
    rules = feats.rules
    for i in range(len(feats)):
        cls = str(feats.attrs["class"][i]) if "class" in feats.attrs else "unknown"
        if str(feats.attrs.get("subtype", ["road"] * len(feats))[i]) != "road" or cls not in STYLE or unbuilt(feats, i):
            out.append(None)
            continue
        # (the lengthened ranges: a bridge's range carried onto the road joined at its end (_skew_decks) is a deck
        # too; with the raw ranges that stretch was neither deck nor ground, the deck's end lost its approach ramp
        # and sat ~4.5 m low over BR-343 at Teresina)
        if not any(k == want for _, _, k in (level_ranges(feats, i) if want == "bridge" else raw_level_ranges(feats, i))):
            out.append(None)
            continue
        width = _rule_value(rules.get("width"), i)
        rule_w = float(width) if width is not None and 1.0 <= float(width) <= 40.0 else None
        # (OpenStreetMap's width and lane count, as _road_specs: a 4-lane bridge was drawn at its class's 8 m, one lane
        # each way, Kommunalny Bridge in Perm by RiDexSS; tunnels too)
        if rule_w is None:
            rule_w = _osm(feats, "width", i, *OSM_WIDTH_M)
        lanes = _osm(feats, "lanes", i, *OSM_LANES)
        lanes = int(lanes) if lanes is not None else None
        surf = _rule_value(rules.get("surface"), i)
        kind = surface_kind(cls, surf)
        ow = _rule_value(rules.get("oneway"), i) is not None
        link = _rule_value(rules.get("subclass"), i) == "link"
        if rule_w is None and link and lanes is None:
            rule_w = LINK_M[1] if ow else LINK_M[2]
        out.append(Spec(carriageway(cls, kind, False, rule_w, ow, lanes), kind, False, cls, ow,
                        lanes=lanes, surf=surface_token(surf)))
    return out
