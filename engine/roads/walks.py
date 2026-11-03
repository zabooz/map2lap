"""Sidewalks, medians and markings beside a road."""
import math

import numpy as np

from .style import (
    BUILT, CENTRE, CENTRE_CLASSES, EDGE_DECAL, EDGE_DECAL_AT, EDGE_LINE, EDGE_LINE_CLASSES, GUTTER, LANE_CLASSES,
    LANE_M, MAX_SPACING, SIDEWALK, SIDEWALK_CLASSES, SIMPLIFY_M, URBAN_ARTERIAL
)
from .specs import PARKING_CLASSES, PARKING_M, edge_margin, motorway_shoulder, rural_motorway
from .levels import LANE_LINE, MIN_PIECE_M, WALK_STEP_M
from .tiles import lane_layout


def centre_colour(lon):
    """Centre line colour: yellow in the Americas, white elsewhere (the country rule comes later)."""
    return "line_yellow" if -170.0 <= float(lon) <= -30.0 else "line_white"


def offset_polyline(pts, d):
    """The polyline moved d m to its left (xy; z kept), with mitred joints (miter at most 2x). Pure."""
    pts = np.asarray(pts, np.float64)
    if len(pts) < 2:
        return pts.copy()
    t = np.diff(pts[:, :2], axis=0)
    L = np.hypot(t[:, 0], t[:, 1])
    L[L < 1e-9] = 1e-9
    t /= L[:, None]
    nrm = np.stack([-t[:, 1], t[:, 0]], axis=1)          # left normals per segment
    vn = np.empty((len(pts), 2))
    vn[0], vn[-1] = nrm[0], nrm[-1]
    if len(pts) > 2:
        m = nrm[:-1] + nrm[1:]
        ml = np.hypot(m[:, 0], m[:, 1])
        ml[ml < 1e-9] = 1e-9
        m /= ml[:, None]
        cosh = np.clip(np.sum(m * nrm[1:], axis=1), 0.5, 1.0)  # miter scale 1/cos(half angle), at most 2
        vn[1:-1] = m / cosh[:, None]
    out = pts.copy()
    out[:, :2] += vn * d
    return out


def _seg_dist(p, a, b):
    """Distance from points p (N, 2) to segments a-b (M, 2): (N, M)."""
    ab = b - a
    L2 = np.maximum(np.sum(ab * ab, axis=1), 1e-12)
    ap = p[:, None, :] - a[None, :, :]
    t = np.clip(np.sum(ap * ab[None], axis=2) / L2[None], 0.0, 1.0)
    q = a[None] + t[..., None] * ab[None]
    return np.hypot(p[:, None, 0] - q[..., 0], p[:, None, 1] - q[..., 1])


def cut_outside(pts, blockers, spacing=2.0):
    """The pieces of a polyline (k, 3) outside every blocker (centreline xy (m, 2), half width): densified
    to `spacing`, points inside a blocker removed, runs of at least MIN_PIECE_M kept. Pure."""
    if not blockers:
        return [pts]
    d = densify(np.asarray(pts, np.float64), spacing)
    import fast
    fast.require(0, "inside_blockers")      # the Rust test (712 calls a tile set, ~1 s of numpy)
    segs, starts, hws = _blocker_segments(blockers)
    inside = np.asarray(fast._ef.inside_blockers(np.ascontiguousarray(d[:, :2]), segs, starts, hws))
    return _runs_outside(d, inside)


_BLOCKERS = ()                  # ((blockers list, its segment arrays), ...): the last few lists (a tile alternates
                                # between its sidewalk and road blockers over many calls)


def _blocker_segments(blockers):
    """(segs (m, 4), starts (B + 1,), half widths (B,)) of [(centreline (k, 2), half width)] (lines of < 2
    points left out)."""
    global _BLOCKERS
    for last, arr in _BLOCKERS:         # one read of the tuple: another thread may replace it meanwhile
        if last is blockers and arr[3] == len(blockers):
            return arr[:3]
    segs, starts, hws = [], [0], []
    for line, hw in blockers:
        line = np.asarray(line, np.float64)
        if len(line) < 2:
            continue
        segs.append(np.hstack([line[:-1, :2], line[1:, :2]]))
        starts.append(starts[-1] + len(line) - 1)
        hws.append(float(hw))
    arr = (np.ascontiguousarray(np.vstack(segs)) if segs else np.zeros((0, 4)), np.array(starts, np.int64),
           np.array(hws, np.float64), len(blockers))
    _BLOCKERS = ((blockers, arr),) + _BLOCKERS[:3]
    return arr[:3]


def _on_level(frame, elev, run):
    """The pieces of a sidewalk run (k, 3) whose ground (elev(lat, lon), the graded ground) lies within WALK_STEP_M of
    the run's own level (MIN_PIECE_M long at least)."""
    if len(run) < 2:
        return [run]
    la, lo, _ = frame.enu_to_geodetic(run[:, 0], run[:, 1], np.zeros(len(run)))
    g = np.asarray(frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))[2], np.float64)
    off = ~(np.abs(g - run[:, 2]) <= WALK_STEP_M)
    return [run] if not off.any() else _runs_outside(run, off)


def _runs_outside(d, inside):
    out, start = [], None
    for k in range(len(d) + 1):
        if k < len(d) and not inside[k]:
            if start is None:
                start = k
        elif start is not None:
            run = d[start:k]
            if len(run) >= 2 and float(np.sum(np.hypot(*np.diff(run[:, :2], axis=0).T))) >= MIN_PIECE_M:
                out.append(run)
            start = None
    return out


ARTERIAL_KMH = 73.0             # a divided urban trunk this slow (45 mph) is a town arterial, not an expressway ...
ARTERIAL_GAP_M = 150.0          # ... or, with no limit, one with a junction this often (Coastal Highway ~50 m)


def has_sidewalks(spec):
    # a two-way urban trunk is a town's main street on a state highway (Bishop's US-395, Moab's US-191);
    # divided trunks are one-way per carriageway: expressways get none, slow ones (Ocean City's Coastal
    # Highway, 35 mph, street photos) one on their outer side (walk_sides)
    if getattr(spec, "sides", None) is not None:      # the map says (_osm_sidewalks)
        return spec.kind in BUILT and bool(spec.sides)
    return spec.kind in BUILT and spec.urban and (spec.cls in SIDEWALK_CLASSES
                                                  or (spec.cls == "trunk" and (not spec.oneway or _arterial(spec))))


def _arterial(spec):
    if not spec.oneway:
        return False
    if spec.kmh is not None:
        return spec.kmh <= ARTERIAL_KMH
    return spec.gap is not None and spec.gap <= ARTERIAL_GAP_M


def walk_sides(spec, left_hand=False):
    """The sides (+1 left of the geometry, -1 right) of a road with sidewalks that get one: both, or a
    divided trunk carriageway's outer side only (the curb on the driver's right, left where they drive on
    the left; the other side is the median). Where OpenStreetMap's sidewalk tag says which: those (_osm_sidewalks)."""
    if getattr(spec, "sides", None):
        return tuple(spec.sides)
    if (spec.cls == "trunk" or has_median(spec)) and spec.oneway:     # (a divided road's median: its curbed band)
        right = -1 if spec.dir >= 0 else 1
        return (-right,) if left_hand else (right,)
    return (1, -1)


MEDIAN_SLAB_M = 6.0     # m: a divided road's median up to this wide is one raised island, curb to curb (each
                        # carriageway's half of it); wider, ...
MEDIAN_CURB_W = 0.6     # ... a curbed band this wide along each carriageway, ...
MEDIAN_MIN_M = 0.8      # ... where its ground between them is this wide or more (Boston Street's is ~1.5 m of concrete
                        # curb, Mapillary), lawn on one wider than MEDIAN_SLAB_M (surface.paint_roads), ...
MEDIAN_MAX_M = 16.0     # ... and no wider (two one-way streets a block apart are not one road with a median)


def has_median(spec):
    """A divided road's carriageway with a median of MEDIAN_MIN_M..MEDIAN_MAX_M of ground beside it."""
    return bool(spec.median) and spec.oneway and MEDIAN_MIN_M <= median_width(spec) <= MEDIAN_MAX_M


def median_side(spec, left_hand=False):
    """The side (+1 left / -1 right of the geometry) of a divided road's carriageway that faces its median, or None."""
    if not has_median(spec):
        return None
    return -walk_sides(spec, left_hand)[0]


def median_width(spec):
    """m of ground between a divided road's two carriageways (its centre lines' distance less both halves; the
    other's width taken as this one's), or 0."""
    return max(0.0, float(spec.median or 0.0) - spec.width) if spec.median else 0.0


def sidewalk_stop(spec, fid, other, ofid):
    """How far from the centreline of a crossing road (other) the sidewalks of road spec stop. The corner
    square is one sidewalk's: when both roads have sidewalks the wider road's (then the smaller id) runs on
    to the other's curb and the other's stops against its outer edge; with none on the other road, they
    run on to its curb. No gap and no overlap (two slabs at one height would z-fight). Pure."""
    if has_sidewalks(other) and (-other.width, ofid) < (-spec.width, fid):
        return other.width / 2 + other.walk
    return other.width / 2


def extras(spec, pts, lon, left_hand=False, country=None, osm=None):
    """The sidewalk / gutter / marking polylines of one road: [(look dict with m / tl / p, width, pts)].
    pts: its centreline (k, 3) in the anchor frame (a whole ground part: its broken lines' dashes start their cycle at
    its start, so they meet across tiles); lon: its longitude; country: ISO code (markings.style: the country's line
    colours, widths and dash patterns; by longitude when unknown); osm: OpenStreetMap's lane tags of the road
    (railtags.LANE_COLUMNS: the lines lane by lane, markings.lane_plan). Pure."""
    import markings
    out = []
    st = markings.style(country, lon)
    w, kind, urban, cls = spec[:4]
    if kind not in BUILT:
        return out
    if has_sidewalks(spec):
        for side in walk_sides(spec, left_hand):
            out.append(({**SIDEWALK, "side": side}, spec.walk,
                        offset_polyline(pts, side * (w / 2 + spec.walk / 2))))
            out.append(({**GUTTER, "side": side}, GUTTER["w"], offset_polyline(pts, side * (w / 2 - GUTTER["w"] / 2))))
        ms = median_side(spec, left_hand)
        if ms is not None:
            # the median: a curbed band, lawn beyond it (two sidewalks back to back made a concrete strip, the user's
            # report #48 on Boston Street: "Improve how medians are made")
            mw = median_width(spec)
            # (each carriageway's half, a hair short of the middle: touching the other's carriageway where the gap
            # narrows, the band was cut away)
            band = max(0.3, mw / 2 - 0.15) if mw <= MEDIAN_SLAB_M else MEDIAN_CURB_W
            out.append(({**SIDEWALK, "side": ms, "median": True}, band, offset_polyline(pts, ms * (w / 2 + band / 2))))
            if kind == "paved":     # a double yellow line along it (Boston Street, Mapillary) ...
                look = {"m": st.centre, "tl": CENTRE["tl"], "p": CENTRE["p"]}
                # ... where centre lines are white one solid white edge line along the median's curb
                for k in ((0,) if st.centre == "line_white" else (0, 1)):
                    out.append((look, st.w, offset_polyline(
                        pts, ms * (w / 2 - EDGE_LINE["inset"] - k * (st.w + st.double_gap)))))
            out.append(({**GUTTER, "side": ms}, GUTTER["w"], offset_polyline(pts, ms * (w / 2 - GUTTER["w"] / 2))))
    motorway = cls == "motorway"
    lw_ = st.w_motorway if motorway else st.w           # a line's width

    def mark(kind_, mat, width, along, pattern=None, side=None):
        """A solid line, or a broken one's dashes (pattern: dash, gap); kind_: "centre", "lane" or "edge"; side: an edge
        line's (+1 left / -1 right of the geometry: build_tile cuts it at a rounded corner, roadcorners.tile)."""
        if pattern is None:
            look = {"m": mat, "tl": EDGE_LINE["tl"], "p": CENTRE["p"], "kind": kind_}
            if side is not None:
                look["side"] = side
            out.append((look, width, along))
            return
        for piece in markings.dashes(along, pattern):
            out.append(({"m": mat, "tl": max(1.0, pattern[0]), "p": CENTRE["p"], "kind": kind_}, width, piece))
    # the driving width (a town street's parking lanes and a rural road's edge strips left out: three lanes on every
    # rural Interstate) and its lanes (OpenStreetMap's count where known)
    parked = urban and cls in PARKING_CLASSES and not (not spec.oneway and cls in URBAN_ARTERIAL)
    drive, lanes = lane_layout(spec)
    plan = markings.lane_plan(osm, not spec.oneway, drive, lanes, left_hand) \
        if kind == "paved" and (cls in CENTRE_CLASSES or cls in LANE_CLASSES) else None
    if plan is not None:
        # the map's lanes: each line where its lanes meet (OpenStreetMap lanes:forward / backward / both_ways,
        # overtaking, change:lanes; research §5)
        pat = st.lane_motorway if motorway else (st.lane_urban if urban else st.lane_rural)
        cpat = st.centre_urban if urban else st.centre_rural
        d = (st.double_gap + lw_) / 2

        def at(off):
            return offset_polyline(pts, off) if abs(off) > 1e-6 else pts.copy()
        for off, role, how in plan:
            if role == "lane":
                mark("lane", "line_white", lw_, at(off), None if how else pat)
            elif role == "twltl":           # solid on the through side, broken on the turn lane's (MUTCD 3B.05)
                mark("centre", st.centre, lw_, at(off + how * d))
                mark("centre", st.centre, lw_, at(off - how * d), cpat)
            elif how == "double":
                if st.centre == "line_yellow" or st is markings.STYLES.get("GB"):
                    for sd in (1, -1):
                        mark("centre", st.centre, lw_, at(off + sd * d))
                else:
                    mark("centre", st.centre, lw_, at(off))
            elif how in ("solid_right", "solid_left"):
                sd = -1 if how == "solid_right" else 1
                mark("centre", st.centre, lw_, at(off + sd * d))
                mark("centre", st.centre, lw_, at(off - sd * d), cpat)
            else:
                mark("centre", st.centre, lw_, at(off), cpat)
    if plan is None and kind == "paved" and cls in CENTRE_CLASSES \
            and w - (2 * PARKING_M if parked else 0.0) >= st.min_centre_m \
            and not spec.oneway:   # no paint on cobbles (the width between the parking lanes, edge strips included)
        # the centre line (MUTCD 3B.01-02, TSRGD / RMS / IISR centre lines): too narrow a road has none; four lanes or
        # more get a solid line (the Americas: double solid yellow), and in the US a town's street a double solid one;
        # otherwise one broken line in the country's colour and town / country pattern
        solid = lanes >= 4 or (st.double_centre_urban and urban)
        if solid and st.centre == "line_yellow":
            for side in (1, -1):
                mark("centre", st.centre, lw_, offset_polyline(pts, side * (st.double_gap + lw_) / 2))
        elif solid:
            mark("centre", st.centre, lw_, pts.copy())
        else:
            mark("centre", st.centre, lw_, pts.copy(), st.centre_urban if urban else st.centre_rural)
    if plan is None and kind == "paved" and cls in LANE_CLASSES:
        # lane lines between the lanes of one direction, broken in the country's pattern
        pat = st.lane_motorway if motorway else (st.lane_urban if urban else st.lane_rural)
        if spec.oneway and lanes >= 2:
            lw = drive / lanes
            for k in range(1, lanes):
                mark("lane", "line_white", lw_, offset_polyline(pts, -drive / 2 + k * lw), pat)
        elif not spec.oneway and lanes >= 4:
            n = lanes // 2
            lw = drive / 2 / n
            for side in (1, -1):
                for k in range(1, n):
                    mark("lane", "line_white", lw_, offset_polyline(pts, side * k * lw), pat)
    if kind == "paved" and not has_sidewalks(spec):          # no curb: the asphalt's edge
        dw = EDGE_DECAL["w"]
        for side in (1, -1):
            line = offset_polyline(pts, side * (w / 2 + (EDGE_DECAL_AT - 0.5) * dw))
            # (u runs from the ribbon's left to its right: the road is on the right of the left side's, so the right
            # side's runs backwards)
            out.append(({**EDGE_DECAL, "side": side}, dw, line if side > 0 else line[::-1].copy()))
    if kind == "paved" and (not urban or not has_sidewalks(spec)) and cls in (st.edge_classes or EDGE_LINE_CLASSES):
        # no curb: edge lines
        # the right edge white; a one-way carriageway's left edge yellow where the country says so (MUTCD 3B.09:
        # divided roads, ramps); wider on motorways (TSRGD 1012, RMS: 0.20-0.30 m)
        ew = st.edge_motorway if motorway else st.edge
        travel_left = 1 if getattr(spec, "dir", 0) >= 0 else -1      # (dir < 0: one way against the line)
        for side in (1, -1):
            inset = motorway_shoulder(spec) if rural_motorway(spec) else EDGE_LINE["inset"]
            mat = st.left_edge if (st.left_edge and spec.oneway and side == travel_left) else "line_white"
            mark("edge", mat, ew, offset_polyline(pts, side * (w / 2 - inset)), side=side)
    return out
    if has_sidewalks(spec):
        for side in walk_sides(spec, left_hand):
            out.append(({**SIDEWALK, "side": side}, spec.walk,
                        offset_polyline(pts, side * (w / 2 + spec.walk / 2))))
            out.append(({**GUTTER, "side": side}, GUTTER["w"], offset_polyline(pts, side * (w / 2 - GUTTER["w"] / 2))))
        ms = median_side(spec, left_hand)
        if ms is not None:
            # the median: a curbed band, lawn beyond it (two sidewalks back to back made a concrete strip, the user's
            # report #48 on Boston Street: "Improve how medians are made")
            mw = median_width(spec)
            # (each carriageway's half, a hair short of the middle: touching the other's carriageway where the gap
            # narrows, the band was cut away)
            band = max(0.3, mw / 2 - 0.15) if mw <= MEDIAN_SLAB_M else MEDIAN_CURB_W
            out.append(({**SIDEWALK, "side": ms, "median": True}, band, offset_polyline(pts, ms * (w / 2 + band / 2))))
            if kind == "paved":     # a double yellow line along it (Boston Street, Mapillary) ...
                look = {"m": centre_colour(lon), "tl": CENTRE["tl"], "p": CENTRE["p"]}
                # ... outside the Americas one solid white edge line along the median's curb
                for k in ((0,) if centre_colour(lon) == "line_white" else (0, 1)):
                    out.append((look, CENTRE["w"], offset_polyline(
                        pts, ms * (w / 2 - EDGE_LINE["inset"] - 2 * k * CENTRE["gap"]))))
            out.append(({**GUTTER, "side": ms}, GUTTER["w"], offset_polyline(pts, ms * (w / 2 - GUTTER["w"] / 2))))
    if kind == "paved" and cls in CENTRE_CLASSES and w >= 6.0 and not spec.oneway:   # no paint on cobbles
        if centre_colour(lon) == "line_white":
            # outside the Americas one broken white line (the Gotthard road on Mapillary: ours had the
            # Americas' double line in white)
            out.append((LANE_LINE, LANE_LINE["w"], pts.copy()))
        else:
            look = {"m": centre_colour(lon), "tl": CENTRE["tl"], "p": CENTRE["p"]}
            for side in (1, -1):
                out.append((look, CENTRE["w"], offset_polyline(pts, side * CENTRE["gap"])))
    if kind == "paved" and cls in LANE_CLASSES:
        # lane lines (white dashes) where the driving width holds two or more lanes a direction
        parked = urban and cls in PARKING_CLASSES and not (not spec.oneway and cls in URBAN_ARTERIAL)
        # (a rural road's edge strips counted as lanes: three on every rural Interstate)
        drive = w - ((PARKING_M if spec.oneway else 2 * PARKING_M) if parked else 2 * edge_margin(spec))
        lanes = spec.lanes if spec.lanes else int(drive // LANE_M)      # (OpenStreetMap's count where known)
        if spec.oneway and lanes >= 2:
            lw = drive / lanes
            for k in range(1, lanes):
                out.append((LANE_LINE, LANE_LINE["w"], offset_polyline(pts, -drive / 2 + k * lw)))
        elif not spec.oneway and lanes >= 4:
            n = lanes // 2
            lw = drive / 2 / n
            for side in (1, -1):
                for k in range(1, n):
                    out.append((LANE_LINE, LANE_LINE["w"], offset_polyline(pts, side * k * lw)))
    if kind == "paved" and not has_sidewalks(spec):          # no curb: the asphalt's edge
        dw = EDGE_DECAL["w"]
        for side in (1, -1):
            line = offset_polyline(pts, side * (w / 2 + (EDGE_DECAL_AT - 0.5) * dw))
            # (u runs from the ribbon's left to its right: the road is on the right of the left side's, so the right
            # side's runs backwards)
            out.append(({**EDGE_DECAL, "side": side}, dw, line if side > 0 else line[::-1].copy()))
    if kind == "paved" and (not urban or not has_sidewalks(spec)) and cls in EDGE_LINE_CLASSES:   # no curb: edge lines
        for side in (1, -1):
            inset = motorway_shoulder(spec) if rural_motorway(spec) else EDGE_LINE["inset"]
            out.append((EDGE_LINE, EDGE_LINE["w"], offset_polyline(pts, side * (w / 2 - inset))))
    return out


JOIN_GAP_M = 14.0       # sidewalk ends this close (and facing each other) are joined: a sharp corner / road merge
JOIN_TURN_DEG = 70.0    # ... when the run turns by at most this to reach the other end


def _end_dir(pts, at_end):
    """Unit direction a run leaves by at its start (at_end False: pointing out of the run backwards) or end."""
    if at_end:
        d = pts[-1, :2] - pts[-2, :2]
    else:
        d = pts[0, :2] - pts[1, :2]
    n = math.hypot(*d)
    return d / n if n > 1e-9 else d


def join_walk_ends(runs, carriageways):
    """Sidewalk runs whose open ends face each other across a short gap merged into one run
    (sidewalks at sharp corners do not join; junctions.py makes no curb return under 35 degrees or with a
    long tangent, so each street's sidewalk stopped at the other's carriageway with bare ground between). runs: the
    runs near the tile before clipping ({pts, side, w, fid, j, open, ramp_fids}); two are merged when the straight
    gap between their ends stays off every carriageway and they are on the same side (one continuous polyline: the
    mesh mitres it, no seam). Pairs found greedily, nearest first. Returns the new list of runs."""
    ends = []                                   # (run index, at_end, point, leaving direction)
    for k, rn in enumerate(runs):
        p = rn["pts"]
        if len(p) < 2:
            continue
        for at_end in (False, True):
            if not rn["open"][1 if at_end else 0] or rn["j"][1 if at_end else 0]:
                continue                        # cut by the near box, or at a curb return: not a loose end
            ends.append((k, at_end, (p[-1] if at_end else p[0]), _end_dir(p, at_end)))
    pairs = []
    cos_t = math.cos(math.radians(JOIN_TURN_DEG))
    for a in range(len(ends)):
        for b in range(a + 1, len(ends)):
            ki, ei, qi, di = ends[a]
            kj, ej, qj, dj = ends[b]
            if ki == kj:
                continue
            gap = qj[:2] - qi[:2]
            L = math.hypot(*gap)
            if L < 0.3 or L > JOIN_GAP_M:
                continue
            u = gap / L
            if float(u @ di) < cos_t or float(-u @ dj) < cos_t:
                continue                        # each end must leave toward the other
            pairs.append((L, a, b))
    runs = [dict(r) for r in runs]
    alias = list(range(len(runs)))              # a merged run's index (runs consumed by merges point to it)
    used = set()
    for L, a, b in sorted(pairs):
        if a in used or b in used:
            continue
        ki, ei, qi, di = ends[a]
        kj, ej, qj, dj = ends[b]
        while alias[ki] != ki:
            ki = alias[ki]
        while alias[kj] != kj:
            kj = alias[kj]
        if ki == kj:
            continue
        ri, rj = runs[ki], runs[kj]
        # the pieces in travel order: ri toward its joined end, then rj away from its joined end
        pi_ = ri["pts"] if ei else ri["pts"][::-1]
        pj_ = rj["pts"] if not ej else rj["pts"][::-1]
        si = ri["side"] if ei else -ri["side"]
        sj = rj["side"] if not ej else -rj["side"]
        if si != sj:
            continue                            # opposite sides of the streets: not one sidewalk
        gap_pts = np.linspace(pi_[-1], pj_[0], max(2, int(L / 2.0) + 2))[1:-1]
        hw = 0.25 * (ri["w"] + rj["w"])
        if any(_seg_dist_min(cl, q[:2]) < h + hw * 0.5 for cl, h in carriageways for q in gap_pts):
            continue                            # the gap would cross a road
        used.update((a, b))
        pts = np.vstack([pi_, gap_pts, pj_]) if len(gap_pts) else np.vstack([pi_, pj_])
        j0 = ri["j"][0] if ei else ri["j"][1]
        j1 = rj["j"][1] if not ej else rj["j"][0]
        o0 = ri["open"][0] if ei else ri["open"][1]
        o1 = rj["open"][1] if not ej else rj["open"][0]
        runs[ki] = {"pts": densify(simplify(pts)), "side": si, "w": ri["w"], "fid": ri["fid"], "j": (j0, j1),
                    "open": (o0, o1), "ramp_keys": sorted(set(ri.get("ramp_keys", [(ri["fid"], ri["side"])])
                                                               + rj.get("ramp_keys", [(rj["fid"], rj["side"])])))}
        runs[kj] = None
        alias[kj] = ki
    return [r for r in runs if r is not None]


def _left_normal(two):
    d = two[1] - two[0]
    n = math.hypot(*d)
    return np.array([-d[1], d[0]]) / n if n > 1e-9 else np.array([0.0, 0.0])


def _seg_dist_min(line, p):
    import fast
    fast.require(0, "seg_dist_min")
    return fast._ef.seg_dist_min(np.asarray(line, np.float64), float(p[0]), float(p[1]))


def clip_polyline(pts, x0, y0, x1, y1):
    """The pieces of a polyline (k, D >= 2, xy first) inside the box, as a list of arrays (Liang-Barsky
    per segment, consecutive pieces joined; earthfast.clip_polyline). Pure."""
    import fast
    fast.require(74, "clip_polyline")
    P = np.ascontiguousarray(np.asarray(pts, np.float64))
    if P.ndim != 2 or len(P) < 2:
        return []
    out, starts = fast._ef.clip_polyline(P, float(x0), float(y0), float(x1), float(y1))
    out, starts = np.asarray(out), np.asarray(starts)
    return [out[starts[i]:starts[i + 1]].copy() for i in range(len(starts) - 1)]


def simplify(pts, tol=SIMPLIFY_M, ztol=None):
    """Ramer-Douglas-Peucker on the xy of a polyline (k, D). ztol (D >= 3): a point is also kept where its height is
    more than this off the line between the kept ones (a deck drawn at its own heights: on xy alone a straight bridge
    kept its two ends in a tile and lost its rise between, 2.5 m below the abutment it met; a car drove into the
    ground, Baltimore's Lombard Street). Pure."""
    if len(pts) < 3:
        return pts
    keep = np.zeros(len(pts), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        a, b = pts[i, :2], pts[j, :2]
        ab = b - a
        L = math.hypot(ab[0], ab[1])
        seg = pts[i + 1:j, :2]
        if len(seg) == 0:
            continue
        if L < 1e-9:
            d = np.hypot(seg[:, 0] - a[0], seg[:, 1] - a[1])
        else:
            d = np.abs(ab[0] * (seg[:, 1] - a[1]) - ab[1] * (seg[:, 0] - a[0])) / L
        if ztol is not None and pts.shape[1] >= 3:
            t = (np.clip(((seg[:, 0] - a[0]) * ab[0] + (seg[:, 1] - a[1]) * ab[1]) / (L * L), 0.0, 1.0)
                 if L >= 1e-9 else np.zeros(len(seg)))
            dz = np.abs(pts[i + 1:j, 2] - (pts[i, 2] + t * (pts[j, 2] - pts[i, 2])))
            d = np.maximum(d, dz * (tol / ztol))
        k = int(np.argmax(d))
        if d[k] > tol:
            m = i + 1 + k
            keep[m] = True
            stack.append((i, m))
            stack.append((m, j))
    return pts[keep]


def densify(pts, spacing=MAX_SPACING):
    """Nodes added so no two are more than `spacing` m apart (xy). Pure."""
    import fast
    pts = np.asarray(pts, np.float64)
    if not len(pts):
        return pts
    fast.require(0, "densify")
    return fast._ef.densify(pts, float(spacing))     # the Rust loop


WALK_DRAPE_M = 2.0      # m between the ground samples under a sidewalk (roadmesh.DRAPE_STEP: the road mesh's edges)
WALK_GROUND_M = 0.5     # ... on the drawn ground (ground): its squares' kinks then cost the run under 0.5 cm over
                        # WALK_DRAPE_TOL_M (a 3 m dip on a hill, 1/32 m quantum: 1.9-2.0 cm; every 1 m: 2.7-2.8)
WALK_DRAPE_TOL_M = 0.02     # m a sidewalk point dropped again may lie off the line through its kept neighbours


def drape_walks(frame, elev, walks, ground=None):
    """The sidewalk runs and corner pieces of build_tile's walks put on the ground, in place: z = elev at the curb line,
    as the road mesh's draped edges there. The runs carried the road's centreline z, sampled at its vertices only and
    interpolated along straight stretches (simplify keeps the xy bends), so a sidewalk crossing a dip ran as a chord
    up to the dip's depth in the air beside the draped road. Each run is sampled every WALK_DRAPE_M m, thinned to the
    points the ground's shape needs (WALK_DRAPE_TOL_M) and densified again: a flat street keeps exactly its points.
    One elev call (its cost is per call). ground(x (n,), y (n,)) -> z (n,): the terrain block's drawn ground in the
    frame (roadmesh.drawn_ground), which the road surfaces lie on (roadmesh.build follow) and elev is off by its
    height quantum and more between its samples; the curbs take it instead, sampled every WALK_GROUND_M m
    (sidewalks on the drawn ground with upstream's road surfaces). One ground call."""
    import sidewalks
    items, xy = [], []
    for wk in walks:
        if "corner" in wk:
            arc = np.asarray(wk["corner"]["arc"], np.float64)
            items.append((wk, arc))
            xy.append(arc[:, :2])
            continue
        pts = densify(np.asarray(wk["pts"], np.float64), WALK_DRAPE_M if ground is None else WALK_GROUND_M)
        curb, _ = sidewalks.run_geometry(pts, wk["side"], wk.get("w", SIDEWALK["w"]))
        items.append((wk, pts))
        xy.append(curb[:, :2])
    if not items:
        return
    xy = np.concatenate(xy)
    if ground is not None:
        u = np.asarray(ground(xy[:, 0], xy[:, 1]), np.float64)
    else:
        la, lo, _ = frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        _, _, u = frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))
    k = 0
    for wk, pts in items:
        z = u[k:k + len(pts)]
        k += len(pts)
        if "corner" in wk:
            c = wk["corner"]
            arc = pts.copy()
            arc[:, 2] = z
            # the outer corners: the ends at the ends of the arc (where the runs' slabs end), the rest between
            zo = 0.5 * (z[0] + z[-1])
            outer = [tuple(q) for q in c["outer"]]
            outer = [(*outer[0][:2], z[-1])] + [(*q[:2], zo) for q in outer[1:-1]] + [(*outer[-1][:2], z[0])]
            wk["corner"] = {**c, "arc": arc, "outer": outer}
            continue
        pts = pts.copy()
        pts[:, 2] = z
        wk["pts"] = densify(pts[sidewalks.simplify(pts, WALK_DRAPE_TOL_M)])
