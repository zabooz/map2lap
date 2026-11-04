"""BridgeProfiles: the deck profiles of a tile, its crossings and piers."""
import os
import threading

import numpy as np

import mapcells
import mapgeom
import roadmesh

from .style import log
from .specs import road_specs
from .levels import bridge_levels, bridge_parts, bridge_specs, ground_parts
from .tiles import box_owns
from .walks import densify
from .decks import (
    AT_GRADE_M, AT_GRADE_REACH_M, BRIDGE_HEADROOM_MARGIN_M, DECK_CLEAR, DECK_CLEAR_REACH_M, DECK_DESIGN_GRADE,
    DECK_MAX_GRADE, DECK_ROAD_CLEAR, DECK_ROAD_HALF, MERGE_TOUCH_M, MIN_BRIDGE_HEADROOM_M, PIN_M, _EndJoin, _deck_beside,
    _deck_crossings, _dedupe, _end_joins, _end_ons, _ground_pins, _joined_lines, bridge_profile_mode, deck_profile,
    water_clear
)


NEAR_M = 40.0                   # roads this far outside the tile still cut its sidewalks / lines
DECK_STEP = 4.0         # m between deck profile points
DECK_FULL_DEPTH = roadmesh.DECK_DEPTH + roadmesh.GIRDER_D    # m of slab and girders under a long span's road
DECK_MIN_DEPTH = 0.9    # m: the thinnest deck (a short slab bridge)
DECK_SPAN_RATIO = 22.0  # a deck is its main span / this deep (girder bridges run span/20-25), DECK_MIN..FULL_DEPTH
END_ON_STEP_M = 0.3
WATER_STEP_M = 16.0         # m between a wet run's clearance points
NAV_RUN_M = 100.0           # a wet run this long takes the bridge's navigation clearance (NBI item 39)
GAP_DIP_M = 2.0             # BridgeProfiles._gap: the chain's lowest ground this far under its highest end, ...
GAP_LOW_M = 1.5             # ... the stretch within this of it is the water
GAP_SEA_M = 1.0             # ... and at most this high (a river at sea level)


# a deck's end is on the ground where the graded ground at it is within this of it (else an end over the valley: a joint)
DECK_BANK_ON_M = 0.3


def deck_depth(span):
    """m of structure (slab + girders) under a deck's road for a main span of span m. A short overpass or channel
    span drew 2.2 m of slab and girders whatever its span, and had to climb that much more to clear what is under it
    (a crown on 24 m overpasses and 2.7 m humps on the Sunshine Skyway causeway's channel bridges). Pure."""
    return float(np.clip(float(span) / DECK_SPAN_RATIO, DECK_MIN_DEPTH, DECK_FULL_DEPTH))


def deck_split(depth):
    """(slab m, girders m) of a deck depth m: the full deck's 1.2 : 1.0 kept. Pure."""
    slab = roadmesh.DECK_DEPTH * float(depth) / DECK_FULL_DEPTH
    return slab, float(depth) - slab


# The curve solve lets a deck leave its abutment up to CHORD_KINK (2 %) off its approach's grade, more where its curve
# needs it; past that its curve can stand well over the straight line between the abutments with nothing under it to
# clear and drop into one at 10 % and more: a kink stiff tyres throw a car off at speed. Where the elevation is lidar
# the deck's ends are the real road's: a deck between two approaches is a cubic between its ends' heights meeting each
# approach at its grade (read TANGENT_AT_M past the end), lifted over what it must clear (_deck_needs: the roads and
# water under it as far as the solve cleared them, the ground) by a bump that keeps its ends' heights and grades
# (_lift_tangent).
TANGENT_AT_M = np.array([4.0, 8.0, 12.0, 16.0])
TANGENT_MIN_M = 3.0         # m: a shorter deck is left as solved
TANGENT_TOL_M = 0.03        # m the deck may come nearer than what it must clear
TANGENT_END_M = 15.0        # m: a deck the lifted cubic cannot carry keeps its solved middle and is eased in this far
TANGENT_BUMPS = (0.5, 1 / 3, 1 / 4)     # the lift's ramps (share of the deck from each end): a hump, a plateau
TANGENT_GRADE_SLACK = 0.02  # its grade at most this over the steepest of its approaches, its straight line, DECK_MAX_GRADE


def _deck_needs(s, solved, floor, crossings, clear):
    """Per arc s of a deck part the height it must keep: floor (the ground and DECK_CLEAR) inside it, and over each of
    crossings (arc, height under it[, its own clearance]: the solve's) its clearance, at most the lowest the solve kept
    over that corridor (the headroom _clearance_deficits measures: where the corridor reaches an abutment, its height).
    The roads at its ends that are junctions at grade (deck_curve's rule) ask for nothing. -inf at the ends (they
    stay). Pure."""
    s, solved = np.asarray(s, np.float64), np.asarray(solved, np.float64)
    L = float(s[-1])
    need = np.asarray(floor, np.float64).copy()
    z0, zL = float(solved[0]), float(solved[-1])
    for cr in crossings:
        arc, zc = float(cr[0]), float(cr[1])
        own = len(cr) > 2 and cr[2] is not None
        cl = float(cr[2]) if own else float(clear)
        d_end = min(arc, L - arc)
        if not own and d_end <= AT_GRADE_REACH_M and min(z0, zL) + DECK_MAX_GRADE * d_end < zc + AT_GRADE_M:
            continue
        m = np.abs(s - arc) <= max(DECK_ROAD_HALF, DECK_CLEAR_REACH_M if not own else 0.0)
        if m.any():
            need[m] = np.maximum(need[m], min(zc + cl, float(solved[m].min())))
    need[0] = need[-1] = -np.inf
    return need


def _lift_tangent(s, zt, need, max_grade):
    """The cubic zt (at arcs s) lifted over need (_deck_needs) by the smoothest of the bumps TANGENT_BUMPS (zero with
    zero slope at both ends, so the ends' heights and grades stay), grades at most max_grade; zt itself when it clears
    need, None when no bump does. Pure."""
    s, zt, need = (np.asarray(a, np.float64) for a in (s, zt, need))
    short = need - zt
    if not (short > TANGENT_TOL_M).any():
        return zt
    t = s / max(float(s[-1]), 1e-9)
    best = None
    for a in TANGENT_BUMPS:
        u = np.clip(np.minimum(t, 1.0 - t) / a, 0.0, 1.0)
        b = 3 * u ** 2 - 2 * u ** 3
        inner = b > 1e-3
        if (short[~inner] > TANGENT_TOL_M).any():
            continue
        z = zt + float(np.max(np.where(inner, short, 0.0) / np.where(inner, b, 1.0))) * b
        g = np.arange(0.0, float(s[-1]) + 1e-9, 1.0)
        gr = np.diff(np.interp(g, s, z)) / np.maximum(np.diff(g), 1e-9) if len(g) > 1 else np.zeros(1)
        if float(np.max(np.abs(gr))) > max_grade:
            continue
        bend = float(np.max(np.abs(np.diff(gr)))) if len(gr) > 1 else 0.0
        if best is None or bend < best[0]:
            best = (bend, z)
    return None if best is None else best[1]


def tangent_profile(s, z0, zL, g0, gL):
    """Heights at arcs s (0..L) of the cubic from z0 (grade g0 leaving it) to zL (grade gL arriving
    there). Pure."""
    s = np.asarray(s, np.float64)
    L = max(float(s[-1]), 1e-9)
    t = s / L
    return ((2 * t ** 3 - 3 * t ** 2 + 1) * z0 + (t ** 3 - 2 * t ** 2 + t) * L * g0 + (-2 * t ** 3 + 3 * t ** 2) * zL
            + (t ** 3 - t ** 2) * L * gL)


def _deck_key(xy):
    """A deck part's key: its number of vertices and its ends (cm)."""
    xy = np.asarray(xy, np.float64)[:, :2]
    return (len(xy), *np.round(xy[[0, -1]], 2).ravel().tolist())


# The deck parts that tilt (_tilting_parts: single and twin bridges), by their ends' lat / lon: a chain is
# solved in its ChainStore's frame (geotiles.CHAIN_Z) and an anchor sees it through a ChainView, so no frame's
# coordinates are a key. Process-wide: a chain another store adopts or a store evicted keeps its entry.
SIMPLE_END_DEG = 5e-7       # deg (~5 cm): ends this near are the same part's
_simple_ends = []           # (vertices, lat0, lon0, lat1, lon1) per simple deck part
_simple_lock = threading.Lock()


def _ends_of(frame, xy):
    xy = np.asarray(xy, np.float64)[:, :2]
    la, lo, _ = frame.enu_to_geodetic(xy[[0, -1], 0], xy[[0, -1], 1], 0.0)
    return (len(xy), float(la[0]), float(lo[0]), float(la[1]), float(lo[1]))


def _simple_add(frame, lines):
    """Note the parts lines (this frame) as ones that tilt."""
    rows = [_ends_of(frame, ln) for ln in lines]
    with _simple_lock:
        _simple_ends.extend(rows)


def _is_simple(frame, xy):
    """Does deck part xy (this frame) tilt (_simple_add, in whichever frame)?"""
    with _simple_lock:
        if not _simple_ends:
            return False
        a = np.array(_simple_ends, np.float64)
    q = np.array(_ends_of(frame, xy), np.float64)
    return bool(((a[:, 0] == q[0]) & (np.abs(a[:, 1:] - q[1:]).max(1) < SIMPLE_END_DEG)).any())


SIMPLE_OPPOSITE_COS = -0.85     # two parts running opposite ways: a twin bridge


def _simple_chain(lines):
    """Is a bridge chain a single deck or a twin bridge (two parts running opposite ways, no end
    shared), not a junction's bridge (ramps leaving or joining on it, parts meeting at their ends)? The deck tilt and
    tangent ends are for these; a junction's chain keeps one merged surface (tilted and eased part by part, it would fall
    into edges). Pure."""
    xs = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    if len(xs) == 1:
        return True
    if len(xs) != 2 or min(len(x) for x in xs) < 2:
        return False
    ends = [x[e] for x in xs for e in (0, -1)]
    if min(float(np.hypot(*(a - b))) for a in ends[:2] for b in ends[2:]) < 0.75:
        return False
    da, db = xs[0][-1] - xs[0][0], xs[1][-1] - xs[1][0]
    return float(da @ db) / max(float(np.hypot(*da) * np.hypot(*db)), 1e-9) < SIMPLE_OPPOSITE_COS


SURFACE_STEP_M = 2.0        # m between the points two parts are compared at (_tilting_parts)


def _tilting_parts(lines, zs, widths):
    """The parts of a chain (lines, their heights zs, widths) whose deck takes the cross slope of the roads at its ends
    (deck_bank): those of a chain that is simple, else of each surface in it that is. A chain also holds what merely
    crosses it: a twin bridge under two flyovers was four parts, no junction, and lay level between its banked approaches
    (Waterview, Auckland: 12 cm at the lane's edge). Parts are one surface where their carriageways come within
    MERGE_TOUCH_M in plan and less than LIDAR_HEADROOM_M in height: one that far over the other leaves room to drive under
    it, so they share nothing. Pure."""
    if _simple_chain(lines):
        return list(lines)
    n = len(lines)
    pts = []
    for ln, z in zip(lines, zs):
        xy = np.asarray(ln, np.float64)[:, :2]
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        t = np.r_[np.arange(0.0, s[-1], SURFACE_STEP_M), s[-1]]
        pts.append(np.c_[np.interp(t, s, xy[:, 0]), np.interp(t, s, xy[:, 1]), np.interp(t, s, z)])
    group = list(range(n))
    for a in range(n):
        for b in range(a + 1, n):
            plan = np.hypot(pts[a][:, 0, None] - pts[b][:, 0], pts[a][:, 1, None] - pts[b][:, 1])
            high = np.abs(pts[a][:, 2, None] - pts[b][:, 2])
            if ((plan <= (widths[a] + widths[b]) / 2 + MERGE_TOUCH_M) & (high < LIDAR_HEADROOM_M)).any():
                ga, gb = group[a], group[b]
                group = [ga if g == gb else g for g in group]
    out = []
    for g in sorted(set(group)):
        surface = [lines[k] for k in range(n) if group[k] == g]
        if _simple_chain(surface):
            out += surface
    return out


def tangent_ends(s, z, g0, gL):
    """The solved deck z (at arcs s) with each end's first TANGENT_END_M (a third of it at most)
    replaced by the cubic from the end (leaving at the approach's grade g0 / meeting it at gL) to the solved deck's
    height and grade there. Pure."""
    s, z = np.asarray(s, np.float64), np.asarray(z, np.float64)
    L = float(s[-1])
    m = min(TANGENT_END_M, L / 3)
    if m < 2.0:
        return z
    g = np.arange(0.0, L + 1e-9, 1.0)
    zg = np.interp(g, s, z)
    dz = np.gradient(zg, g)
    out = z.copy()
    a = s <= m                      # the start: from (0, z0, g0) to (m, z(m), z'(m))
    out[a] = np.interp(m, s, z) + tangent_profile(np.r_[s[a], m], float(z[0]) - np.interp(m, s, z), 0.0, g0,
                                                  float(np.interp(m, g, dz)))[:-1]
    b = s >= L - m                  # the end: from (L - m, z(L - m), z'(L - m)) to (L, zL, gL)
    sb = s[b] - (L - m)
    zm = float(np.interp(L - m, s, z))
    out[b] = zm + tangent_profile(np.r_[sb, m], 0.0, float(z[-1]) - zm, float(np.interp(L - m, g, dz)), gL)[:-1]
    return out


def deck_road_clear(depth=None, headroom=None):
    """m a deck's road stands over a road under it: the headroom, its margin and the deck's depth. Pure."""
    head = MIN_BRIDGE_HEADROOM_M if headroom is None else float(headroom)
    return head + BRIDGE_HEADROOM_MARGIN_M + (DECK_FULL_DEPTH if depth is None else float(depth))


# Where the elevation is lidar (not dem.coarse_at: railways.COARSE_AT), the ground at a bridge's ends and under it is
# the real one: the deck already stands at its real height over the road or railway below, which real bridges give
# 4-5 m (motorway overpasses). Raised for 6 m there, a bridge would hump over its span and start over the motorway
# leading onto it (motorways are never raised to their decks). A deck is raised only where it leaves less than this
# under it; the road under a deck whose ground is filled is dug to its own line instead (grading.UNDER_HUMP_*).
LIDAR_HEADROOM_M = 4.0


def geom_span(lines):
    """m: a bridge chain's main span from its geometry alone: its longest part, or (one longer than 1.5 PIER_SPAN_M)
    that part's pier spacing (pier_sites' PIER_SPAN_M grid). Pure."""
    L = max((float(np.hypot(*np.diff(np.asarray(ln, np.float64)[:, :2], axis=0).T).sum())
             for ln in lines if len(ln) >= 2), default=0.0)
    if L <= 1.5 * PIER_SPAN_M:
        return L
    return L / max(1, int(round(L / PIER_SPAN_M)))


CHAIN_CELLS = 12        # map cells read at most to close one bridge chain


def _rail_drawn(feats, i):
    """Is feature i a railway line drawn on the map (railways.drawn: worn ones too)?"""
    import railways
    return railways.drawn(feats, i) is not None


def _clearance_deficits(lines, zs, crossings, depth=None):
    """(part, usable m) below the road target in a modelled crossing corridor.

    Road heights are the graded lower road's height at the crossing. Keep true
    abutment junctions at grade; data/grade constraints cannot promise global clearance.
    """
    out = []
    for pi, sc, zc in crossings:
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(lines[pi][:, :2], axis=0).T))]
        if min(sc, s[-1] - sc) <= AT_GRADE_REACH_M:
            continue
        lo, hi = max(0.0, sc - DECK_CLEAR_REACH_M), min(s[-1], sc + DECK_CLEAR_REACH_M)
        at = np.r_[lo, s[(s > lo) & (s < hi)], hi]
        headroom = float(np.min(np.interp(at, s, zs[pi]))) - zc - (DECK_FULL_DEPTH if depth is None else depth)
        if not np.isfinite(headroom) or headroom < MIN_BRIDGE_HEADROOM_M - 1e-6:
            out.append((pi, headroom))
    return out


def _crossings(lines, ground_lines):
    """(part index, arc m, point xy) where a ground road (polylines in metres) crosses under a deck
    part (earthfast.segment_crossings). Pure."""
    import fast
    lp = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    gp = [np.asarray(gl, np.float64)[:, :2] for gl in ground_lines]
    if not lp or not gp:
        return []
    fast.require(57, "segment_crossings")
    starts = lambda ps: np.r_[0, np.cumsum([len(p) for p in ps])].astype(np.int64)
    got = fast._ef.segment_crossings(np.ascontiguousarray(np.vstack(lp)), starts(lp),
                                     np.ascontiguousarray(np.vstack(gp)), starts(gp))
    return [(pi, arc, np.array([x, y])) for pi, arc, x, y in got]


def _crossings_by(lines, ground_lines):
    """_crossings for each of ground_lines apart, in one kernel call: [[(part index, arc m, point xy)] per ground line],
    each list as _crossings(lines, [that line]) gives it. Pure."""
    import fast
    lp = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    gp = [np.asarray(gl, np.float64)[:, :2] for gl in ground_lines]
    out = [[] for _ in gp]
    if not lp or not gp:
        return out
    fast.require(76, "segment_crossings_g")
    starts = lambda ps: np.r_[0, np.cumsum([len(p) for p in ps])].astype(np.int64)
    for pi, g, arc, x, y in fast._ef.segment_crossings_g(np.ascontiguousarray(np.vstack(lp)), starts(lp),
                                                          np.ascontiguousarray(np.vstack(gp)), starts(gp)):
        out[g].append((pi, arc, np.array([x, y])))
    return out


PIER_SPAN_M = 32.0      # m between a bridge's piers (a span), longer under a high deck: + PIER_SPAN_PER_M per m of height
PIER_SPAN_PER_M = 0.6
PIER_SPAN_MAX = 60.0
PIER_MIN_CLEAR = 1.5    # m from the ground up to a pier's top (under the girders): lower, the deck rests on the ground
PIER_ROAD_M = 7.0       # m a pier keeps from the centre line of a road under the deck (its half width + room)
PIER_CHANNEL_CLEAR = 15.0   # no pier in water whose run wants this much clearance (water_clear): a ship channel
PIER_IN_WATER_M = 8.0   # m a pier in water reaches under its surface


def pier_sites(xy, z, width, ground_fn, road_lines=(), wet_fn=None, depth=None):
    """The piers under a bridge deck (xy (k, 2), deck top z (k,), width m): [(x, y, ux, uy, z_top, z_bottom, width)],
    (ux, uy) along the deck, z_top under its girders (roadmesh.DECK_DEPTH + GIRDER_D), z_bottom in the ground (or
    PIER_IN_WATER_M under water); evenly spaced inside the part (its ends are abutments or joints) at PIER_SPAN_M,
    longer under a higher deck; none where the deck is within PIER_MIN_CLEAR of the ground, moved along up to 40 % of
    a span off a road under it (PIER_ROAD_M) or left out; none in a ship channel. The official maps' bridges stand
    on piers (Italy's tapered walls, East Coast's) where ours floated ("Bridges need a lot of
    work in general"). Pure given ground_fn(xy) -> heights, wet_fn(xy) -> bool."""
    import fast
    import roadmesh
    xy = np.asarray(xy, np.float64)
    if len(xy) < 2 or not np.isfinite(z).all():
        return []
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    L = float(s[-1])
    g_all = np.asarray(ground_fn(xy), np.float64)
    h = float(np.median(z - g_all))
    span = float(np.clip(PIER_SPAN_M + PIER_SPAN_PER_M * max(h, 0.0), PIER_SPAN_M, PIER_SPAN_MAX))
    n = int(round(L / span))
    if n < 2:
        return []
    under = DECK_FULL_DEPTH if depth is None else float(depth)
    segs = [np.asarray(ln, np.float64) for ln in road_lines if len(ln) >= 2]
    A = np.concatenate([ln[:-1] for ln in segs]) if segs else np.zeros((0, 2))
    B = np.concatenate([ln[1:] for ln in segs]) if segs else np.zeros((0, 2))
    wet_runs = None
    if wet_fn is not None:
        w = np.asarray(wet_fn(xy), bool)
        wet_runs = (w, s)
    out = []
    pw = float(np.clip(0.7 * width, 2.5, 14.0))
    for i in range(1, n):
        placed = None
        for off in (0.0, 0.25, -0.25, 0.4, -0.4):
            sc = L * i / n + off * span
            if sc < 0.5 * span or sc > L - 0.5 * span:
                continue
            p = np.array([np.interp(sc, s, xy[:, 0]), np.interp(sc, s, xy[:, 1])])
            j = min(int(np.searchsorted(s, sc)), len(s) - 1)
            t = xy[j] - xy[max(j - 1, 0)]
            t = t / max(float(np.hypot(*t)), 1e-9)
            nrm = np.array([-t[1], t[0]])
            foot = np.array([p + nrm * pw / 2, p - nrm * pw / 2, p])
            if len(A):
                fast.require(0, "points_near_segments")
                hit = fast._ef.points_near_segments(foot, A, B, np.full(len(A), PIER_ROAD_M))
                if np.asarray(hit).any():
                    continue
            zt = float(np.interp(sc, s, z)) - under
            g = float(ground_fn(p[None])[0])
            if zt - g < PIER_MIN_CLEAR:
                continue
            zb = g - roadmesh.FOOTING_M
            if wet_runs is not None:
                w, ss = wet_runs
                k = int(np.argmin(np.abs(ss - sc)))
                if w[k]:
                    a = k
                    while a > 0 and w[a - 1]:
                        a -= 1
                    b = k
                    while b + 1 < len(w) and w[b + 1]:
                        b += 1
                    if water_clear(ss[b] - ss[a]) >= PIER_CHANNEL_CLEAR and a < k < b:
                        continue
                    zb = g - PIER_IN_WATER_M
            placed = (float(p[0]), float(p[1]), float(t[0]), float(t[1]), zt, zb, float(width))
            break
        if placed is not None:
            out.append(placed)
    return out


OBS_BLEND_DG = 0.04     # a measured deck eased onto its joints' heights changes its grade by at most this (BridgeProfiles)
OBS_BLEND_MIN_M = 10.0  # m, the shortest easing
OBS_MAX_GRADE = 0.14    # a measured deck steeper than this after the easing (2 m steps) keeps the inference
OBS_END_MAX_M = float(os.environ.get("BNE_OBS_END_MAX", "inf"))  # m a measured deck's end may lie off the graded road at
                        # its abutment, else the inference (inf: always eased onto it; 4 m made Springfield worse)


class BridgeProfiles:
    """Deck heights per bridge part for one anchor frame, each chain resolved once from all of it, so
    every tile gets the same deck (computed per tile from the tile's cells, a chain's
    two halves disagreed at a tile seam). cell_fn(key) -> the roads Features of a map cell; elev:
    the physics elevation. Worker threads."""

    wet = None      # wet(lat, lon) -> water depth (m) or None: decks clear the water (water_clear)
    infra_fn = None     # infra_fn(cell key) -> the infrastructure Features (bridge:structure tags: bridgetypes)

    def __init__(self, frame, cell_fn, elev):
        self.frame, self.cell_fn, self.elev = frame, cell_fn, elev
        self.done = {}                          # (fid, j) -> (spec, xy (k, 2), z (k,), lon)
        self.piers = {}                         # (fid, j) -> pier_sites of its deck
        self.trusses = {}                       # a chain's first part key -> its truss beams (bridgetypes)
        self.depth = {}                         # (fid, j) -> m of slab and girders under its road (deck_depth)
        self.lock = threading.Lock()

    def _water(self, lines, nav=0.0, depth=None, channel=0.0):
        """Clearance requirements over water (deck_profile_once crossings with their own clearance): every
        WATER_STEP_M along each wet run of each line, water_clear of the run's length over the ground there; over a
        run of NAV_RUN_M or more at least nav (m: the bridge's navigation clearance, bridgetypes.nav_clearance) plus
        the slab and girders under the road."""
        out = []
        if self.wet is None:
            return out
        under = DECK_FULL_DEPTH if depth is None else float(depth)
        for k, ln in enumerate(lines):
            xy = np.asarray(ln, np.float64)[:, :2]
            if len(xy) < 2:
                continue
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
            w = np.asarray(self.wet(la, lo), np.float64) > 0.5
            if not w.any():
                continue
            g = self._ground(xy)
            sea = self.frame.geodetic_to_enu(la, lo, np.zeros(len(la)))[2]
            i = 0
            while i < len(w):
                if not w[i]:
                    i += 1
                    continue
                j = i
                while j + 1 < len(w) and w[j + 1]:
                    j += 1
                c = water_clear(s[j] - s[i] + (s[1] - s[0]))
                base = g
                if nav > 0:
                    # the inventory's clearance decides over the share-of-span rule, from the water's surface (sea
                    # level) not the carved bed: a causeway's 100 m channel bridge with 3.8 m of clearance was asked
                    # for 15 m over a 3 m deep bed and humped to its grade cap (the Sunshine Skyway causeway)
                    c = nav + under if s[j] - s[i] >= NAV_RUN_M else min(c, nav + under)
                    base = np.maximum(g, sea)
                run = s[j] - s[i]
                # the nav clearance holds over the channel only: the main span (channel m: NBI item 48) over the
                # run's deepest water, else the middle half of the run; outside it the clearance asked eases off at the
                # design grade to the run's own (water_clear: a causeway's low). Held flat across the whole run the
                # Sunshine Skyway stood 58 m up for 3.5 km of its causeway, and where the grade cap only just reached
                # the run's start the solver humped the Vincent Thomas Bridge 5 m over its span
                c_low = min(c, water_clear(run + (s[1] - s[0])))
                if nav > 0 and channel > 0 and 3 * channel < run:      # (a river crossing: its whole run)
                    seg = np.arange(i, j + 1)
                    mid = float(s[seg[int(np.argmin(g[seg]))]])
                    mid = float(np.clip(mid, s[i] + channel / 2, s[j] - channel / 2))
                    c0, c1 = mid - channel / 2, mid + channel / 2
                else:
                    c0, c1 = s[i] + run / 4, s[j] - run / 4
                for sc in np.arange(s[i], s[j] + 1e-6, WATER_STEP_M):
                    out_by = max(0.0, c0 - sc, sc - c1)
                    cc = max(c_low, c - DECK_DESIGN_GRADE * out_by) if nav > 0 else c
                    out.append((k, float(sc), float(np.interp(sc, s, base)), cc))
                i = j + 1
        return out

    def _ground(self, xy):
        la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        return self.frame.geodetic_to_enu(la, lo, np.asarray(self.elev(la, lo), np.float64))[2]

    specs_of = staticmethod(lambda feats: bridge_specs(feats))
    parts_of = staticmethod(lambda feats, i: bridge_parts(feats, i))
    levels_of = staticmethod(lambda feats, i: bridge_levels(feats, i))

    def _load(self, key, pool, ground):
        """Cell key's bridge parts into pool and its ground roads into ground (as the chain solves gather them)."""
        parts, roads_ = self._cell_entries(key)
        for k, v in parts:
            # a part in several cells can come clipped differently: the longest (the same part whichever
            # cell a process loads first: the terrain and the road tiles took different ones)
            old = pool.get(k)
            if old is None or v[4] > old[4]:
                pool[k] = v
        for k, lines in roads_:
            if k not in ground:
                ground[k] = lines

    def _cell_entries(self, key):
        """([((fid, j), (spec, deck line, lon, level, ring points))], [((fid, "g"), [ground lines])]) of cell key, made
        once (every chain solved gathered its cells again: each a loop over all their roads). Not to be
        changed by the caller."""
        cache = self.__dict__.setdefault("cell_entries", {})
        with self.lock:
            got = cache.get(str(key))
        if got is not None:
            return got
        parts, roads_ = [], []
        feats = self.cell_fn(key)
        if feats is not None and len(feats):
            bs = self.specs_of(feats)
            rs = road_specs(feats)
            names = feats.attrs.get("name")
            for i in range(len(feats)):
                fid = str(feats.ids[i])
                if bs[i] is not None:
                    lvls = self.levels_of(feats, i)
                    best = {}
                    for j, ring in enumerate(self.parts_of(feats, i)):
                        if (fid, j) in best and len(ring) <= best[(fid, j)][4]:
                            continue
                        e, n = mapgeom.enu_xy(feats, self.frame, ring)
                        best[(fid, j)] = (bs[i], densify(_dedupe(np.stack([e, n], axis=1)), DECK_STEP),
                                          float(np.mean(ring[:, 0])), lvls[j] if j < len(lvls) else 1.0, len(ring),
                                          str(names[i]) if names is not None else "")     # (roadz: name matching)
                    parts.extend(best.items())
                if rs[i] is not None:
                    lines = []
                    for ring in ground_parts(feats, i):
                        e, n = mapgeom.enu_xy(feats, self.frame, ring)
                        lines.append(np.stack([e, n], axis=1))
                    roads_.append(((fid, "g"), lines))
                elif _rail_drawn(feats, i):
                    # a railway on the ground: the decks over it keep their headroom too (a road bridge
                    # lay on the tracks; only roads under a deck were counted)
                    import railways
                    lines = []
                    for kind, rings in railways._pieces(feats, i):
                        if kind == "ground":
                            for ring in rings:
                                e, n = mapgeom.enu_xy(feats, self.frame, ring)
                                lines.append(np.stack([e, n], axis=1))
                    if lines:
                        roads_.append(((fid, "r"), lines))
        got = (parts, roads_)
        with self.lock:
            if len(cache) > 64:
                cache.clear()
            cache.setdefault(str(key), got)
            return cache[str(key)]

    END_JOINS = True        # (TunnelProfiles: none)

    def _end_joins_of(self, lines, halves, ground):
        """_end_joins of deck lines with the ground roads of ground ({(fid, "g"): lines}); [] for tunnels."""
        if not self.END_JOINS:
            return []
        return _end_joins(lines, halves, [g for k, v in ground.items() if k[1] == "g" for g in v])

    def _end_ons_of(self, lines, halves, levels, ground):
        """_end_ons of deck lines with the ground roads of ground; [] for tunnels."""
        if not self.END_JOINS:
            return []
        return _end_ons(lines, halves, levels, [g for k, v in ground.items() if k[1] == "g" for g in v])

    def _end_join_pairs(self, lines, halves, ground, levels=None):
        """(i, j): line i's free end joins line j's end (_end_joins) or stands on line j (_end_ons)."""
        joins = self._end_joins_of(lines, halves, ground)
        out = set()
        if levels is not None:
            for k, _at, j, _arc in self._end_ons_of(lines, halves, levels, ground):
                out.add((min(k, j), max(k, j)))
        if not joins:
            return sorted(out)
        moved = {(k, at): p for k, at, p in joins}
        for k, at, p in joins:
            for j, ln in enumerate(lines):
                if j != k and any(np.hypot(*(np.asarray(moved.get((j, a2), np.asarray(ln)[a2, :2]), np.float64) -
                                             np.asarray(p))) < 1e-6 for a2 in (0, -1)):
                    out.add((min(k, j), max(k, j)))
        return sorted(out)

    def _resolve(self, start, pool, ground, loaded):
        """The chain of part `start` (keys), loading the cell at each loose end until closed."""
        while True:
            nk = _EndJoin()
            by_node = {}
            for k, (_, xy, *_) in pool.items():
                by_node.setdefault(nk(xy[0]), []).append(k)
                by_node.setdefault(nk(xy[-1]), []).append(k)
            keys = sorted(pool)
            over = _deck_crossings([pool[k][1] for k in keys])
            crossing = {}
            for a, b, _, _ in over:
                crossing.setdefault(keys[a], set()).add(keys[b])
                crossing.setdefault(keys[b], set()).add(keys[a])
            # and side by side / one over the other (solved apart, the Queensboro Bridge's two upper roadways met at
            # a 0.5 m step and its tiles' decks at different heights stood as blocks in the lanes)
            for a, b in _deck_beside([pool[k][1] for k in keys], [pool[k][0].width for k in keys]):
                crossing.setdefault(keys[a], set()).add(keys[b])
                crossing.setdefault(keys[b], set()).add(keys[a])
            # and a free end joining another part's end (_end_joins): solved as one
            for a, b in self._end_join_pairs([pool[k][1] for k in keys], [pool[k][0].width / 2 for k in keys], ground,
                                             [pool[k][3] for k in keys]):
                crossing.setdefault(keys[a], set()).add(keys[b])
                crossing.setdefault(keys[b], set()).add(keys[a])
            comp, stack = {start}, [start]
            while stack:                        # joined at nodes, or crossing (solved together)
                k = stack.pop()
                xy = pool[k][1]
                nxt = [k2 for p in (xy[0], xy[-1]) for k2 in by_node.get(nk(p), ())]
                for k2 in nxt + sorted(crossing.get(k, ())):
                    if k2 not in comp:
                        comp.add(k2)
                        stack.append(k2)
            deg = {}
            for k in comp:
                xy = pool[k][1]
                for p in (xy[0], xy[-1]):
                    deg[nk(p)] = deg.get(nk(p), 0) + 1
            # the loose ends first, in key order: a cell loaded can put a longer copy of a part in the pool (_load), whose
            # ends deg never saw (KeyError: a Chicago road tile on a Windows test PC), and the set's order
            # changes with each process's string hashing (which cells CHAIN_CELLS let in)
            ends = [p for k in sorted(comp) for p in (pool[k][1][0], pool[k][1][-1]) if deg[nk(p)] == 1]
            grew = False
            for p in ends:
                la, lo, _ = self.frame.enu_to_geodetic(np.array([p[0]]), np.array([p[1]]), 0.0)
                key = mapcells.cell_of(float(la[0]), float(lo[0]))
                if str(key) not in loaded and len(loaded) < CHAIN_CELLS:
                    loaded.add(str(key))
                    self._load(key, pool, ground)
                    grew = True
            if not grew:
                return sorted(comp)

    def _solve(self, comp, pool, ground):
        """Deck heights of the chain comp (keys of pool)."""
        lines = [pool[k][1] for k in comp]
        # (solved with its free ends that join another part's moved onto those joints: _end_joins; the heights are
        # per point, so the parts keep their own lines)
        lines = _joined_lines(lines, self._end_joins_of(lines, [pool[k][0].width / 2 for k in comp], ground))
        gl = [g for k, v in ground.items() if k[1] == "g" for g in v]
        rl = [g for k, v in ground.items() if k[1] == "r" for g in v]
        cr = _crossings(lines, gl)
        road_z = self._ground(np.array([c[2] for c in cr])) if cr else []
        # (the railways under the chain: the same headroom, given as their own clearance, so never a junction at
        # grade by an abutment as a road can be)
        rcr = _crossings(lines, rl) if rl else []
        rail_z = self._ground(np.array([c[2] for c in rcr])) if rcr else []
        import bridgetypes
        try:
            nav = bridgetypes.nav_clearance(self.frame, lines)
        except Exception as ex:             # the share-of-span rule alone
            log.debug("nav clearance: %s: %s", type(ex).__name__, ex)
            nav = 0.0
        required = [(c[0], c[1], z) for c, z in zip(cr, road_z)]
        depth = self._depth(lines) if bridge_profile_mode() == "curve" else None
        head = None             # (LIDAR_HEADROOM_M on fine elevation)
        import railways
        allxy = np.concatenate([np.asarray(ln, np.float64)[:, :2] for ln in lines])
        if not railways._coarse_here(self.frame, (*allxy.min(0), *allxy.max(0))):
            head = LIDAR_HEADROOM_M
        dd = self.__dict__.setdefault("depth", {})
        for k in comp:
            dd[k] = DECK_FULL_DEPTH if depth is None else depth
        try:
            channel = bridgetypes.nav_span(self.frame, lines) if nav > 0 else 0.0
        except Exception:
            channel = 0.0
        water = self._water(lines, nav, depth, channel)
        if not water and nav > 0 and bridge_profile_mode() == "curve":
            water = self._gap(lines, nav, depth)
        rails = [(c[0], c[1], z, deck_road_clear(depth, head)) for c, z in zip(rcr, rail_z)]  # (head)
        levels = [pool[k][3] for k in comp]

        def solve(ground_fn):           # (head)
            return deck_profile(lines, ground_fn, required + rails + water, clear=deck_road_clear(depth, head),
                                levels=levels, widths=[pool[k][0].width for k in comp], pins=_ground_pins(lines, gl))
        zs = solve(self._ground)
        # a free end standing on another deck: solved again with it at that deck's height as drawn (measured too:
        # _observed) (_end_ons)
        over = {}
        ons = self._end_ons_of(lines, [pool[c][0].width / 2 for c in comp], levels, ground)
        final = self._observed(comp, pool, lines, zs, pins=_ground_pins(lines, gl)) if ons else zs
        for k, at, j, arc in ons:
            lj = np.asarray(lines[j], np.float64)[:, :2]
            sj = np.r_[0.0, np.cumsum(np.hypot(*np.diff(lj, axis=0).T))]
            zt = float(np.interp(arc, sj, np.asarray(final[j], np.float64)))
            if np.isfinite(zt) and abs(zt - float(final[k][at])) > END_ON_STEP_M:
                q = np.asarray(lines[k], np.float64)[at, :2]
                over[(float(q[0]), float(q[1]))] = zt
        if over:
            keys_ = np.array(list(over), np.float64)
            vals = np.array(list(over.values()), np.float64)

            def ground_on(xy):
                z = np.asarray(self._ground(xy), np.float64)
                xy = np.asarray(xy, np.float64).reshape(-1, 2)
                for (px, py), zt in zip(keys_, vals):
                    z = np.where((np.abs(xy[:, 0] - px) < 1e-6) & (np.abs(xy[:, 1] - py) < 1e-6), zt, z)
                return z
            zs = solve(ground_on)
        deficits = _clearance_deficits(lines, zs, required + [r[:3] for r in rails], depth)
        if deficits:
            # (debug: a city has hundreds of such bridges, each solved again in every process and tile; as a warning it
            # filled players' consoles, TGForever Discord)
            log.debug("bridge clearance below %.1f m target: %s; abutment/grade or map constraints prevent full headroom",
                      MIN_BRIDGE_HEADROOM_M, [(comp[i], round(h, 2)) for i, h in deficits[:3]])
        _simple_add(self.frame, _tilting_parts(lines, zs, [pool[k][0].width for k in comp]))
        simple = _simple_chain(lines)           # (a single deck or a twin bridge only)
        if head is not None and simple:     # on lidar: meeting its approaches' grades
            zs, laid = self._tangent(lines, zs, required + rails + water, deck_road_clear(depth, head))
            # a part laid between its real ends at their grades keeps that: a measured profile eased between them
            # (other data, another height reference) only humps it
            if all(laid):
                return zs
            obs = self._observed(comp, pool, lines, zs, pins=_ground_pins(lines, gl))
            return [z if done else o for z, o, done in zip(zs, obs, laid)]
        if ons and not over:            # (final is the solve before _tangent)
            return final
        return self._observed(comp, pool, lines, zs, pins=_ground_pins(lines, gl))

    def _observed(self, comp, pool, lines, zs, level=1, pins=None):
        """The chain's deck heights where a source measured them (roadz.py: IGN BD TOPO, NVDB, US lidar), the solved
        ones (the inference) elsewhere. Each joint ends up at one height: an abutment (a joint no other part of the
        chain shares) at the solved one (the graded road it meets), a joint between parts at the mean of their measured
        ends; each part's profile is eased onto its joints' heights (earthfast.deck_blend: the grade changes by
        OBS_BLEND_DG at most). A part whose measured profile still steps or climbs past OBS_MAX_GRADE keeps the
        solve. Pure given the provider's cached data."""
        import roadz
        prov = roadz.PROVIDER
        if prov is None or not prov.enabled or not lines:
            return zs
        obs = []
        for k, ln in zip(comp, lines):
            xy = np.asarray(ln, np.float64)[:, :2]
            got = None
            try:
                spec = pool[k][0]
                nm = pool[k][5] if len(pool[k]) > 5 else ""
                z = prov.observed(self.frame, xy, spec.width / 2, level, "" if nm in ("None", "nan") else nm)
                if z is not None:
                    la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
                    ok = np.isfinite(z)
                    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
                    zf = np.interp(s, s[ok], np.asarray(z)[ok])         # (the ends past the last measurement: flat)
                    got = np.asarray(self.frame.geodetic_to_enu(la, lo, zf)[2], np.float64)
            except Exception as ex:             # the inference rather than no bridge
                log.debug("observed deck %s: %s: %s", k, type(ex).__name__, ex)
            obs.append(got)
        if all(o is None for o in obs):
            return zs
        nk = _EndJoin()
        ends = [(nk(np.asarray(ln)[0]), nk(np.asarray(ln)[-1])) for ln in lines]
        deg = {}
        for a, b in ends:
            deg[a] = deg.get(a, 0) + 1
            deg[b] = deg.get(b, 0) + 1
        # a joint a ground road goes on from (pins: the solve's abutment there) keeps the solve's height, the graded
        # road's, as an abutment does: eased to the decks' measured mean, the street went on 2.5 m over them (Charles
        # Street over I-83 in Baltimore)
        if pins is not None and len(pins):
            P = np.asarray(pins, np.float64).reshape(-1, 2)
            for i_, (a, b) in enumerate(ends):
                for nd, at in ((a, 0), (b, -1)):
                    q = np.asarray(lines[i_], np.float64)[at, :2]
                    if deg[nd] > 1 and (np.hypot(P[:, 0] - q[0], P[:, 1] - q[1]) < PIN_M).any():
                        deg[nd] = 1
        # a measured deck whose end is far off the graded road it meets there is a map gap (a flyover's untagged
        # stretch drawn on the ground: Springfield's 15 m): the inference keeps that part rather than a long ramp
        for i, (o, z, (a, b)) in enumerate(zip(obs, zs, ends)):
            z = np.asarray(z, np.float64)
            if o is not None and len(z) and OBS_END_MAX_M is not None and (
                    (deg[a] == 1 and abs(o[0] - z[0]) > OBS_END_MAX_M)
                    or (deg[b] == 1 and abs(o[-1] - z[-1]) > OBS_END_MAX_M)):
                log.debug("observed deck %s: its end %.1f m off the road it meets, the solve kept", comp[i],
                          max(abs(o[0] - z[0]), abs(o[-1] - z[-1])))
                obs[i] = None
        if all(o is None for o in obs):
            return zs
        target = {}
        for node in deg:
            if deg[node] == 1:
                continue
            got = [(o[0] if a == node else o[-1]) for o, (a, b) in zip(obs, ends) if o is not None and node in (a, b)]
            if got:
                target[node] = float(np.mean(got))
        import fast
        out = []
        for k, (ln, z, o, (a, b)) in enumerate(zip(lines, zs, obs, ends)):
            z = np.asarray(z, np.float64)
            if not np.isfinite(z).all():
                out.append(z)
                continue
            base = o if o is not None else z
            t0 = z[0] if deg[a] == 1 else target.get(a, z[0])
            t1 = z[-1] if deg[b] == 1 else target.get(b, z[-1])
            if o is None and t0 == z[0] and t1 == z[-1]:
                out.append(z)
                continue
            xy = np.asarray(ln, np.float64)[:, :2]
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            zz = np.asarray(fast._ef.deck_blend(s, np.ascontiguousarray(base), float(t0), float(t1), OBS_BLEND_DG,
                                                OBS_BLEND_MIN_M, 0.5), np.float64)
            if o is not None and len(s) > 3:
                step = np.interp(np.arange(0.0, s[-1], 2.0), s, zz)
                g = np.abs(np.diff(step)) / 2.0 if len(step) > 1 else np.zeros(1)
                if len(g) and float(g.max()) > OBS_MAX_GRADE:
                    log.debug("observed deck %s: %.0f %% after the blend, the solve kept", comp[k], 100 * g.max())
                    zz = np.asarray(fast._ef.deck_blend(s, np.ascontiguousarray(z), float(t0), float(t1), OBS_BLEND_DG,
                                                        OBS_BLEND_MIN_M, 0.5), np.float64)
                else:
                    # never under both the solve (its clearances) and the measurement: an easing toward a joint
                    # pulled a deck through the road under it (-1.8 m over I-95 at Springfield)
                    # (the ends as eased: the parts at a joint keep meeting at one height)
                    zz = np.r_[zz[0], np.maximum(zz, np.minimum(z, o))[1:-1], zz[-1]]
            out.append(zz)
        return out

    def _tangent(self, lines, zs, crossings=(), clear=DECK_ROAD_CLEAR):
        """(zs with each part whose both ends are abutments (no other part ends there, the graded ground at the end
        within DECK_BANK_ON_M of it) laid as tangent_profile between its ends: their heights kept, the grade of the
        road leading onto each end (TANGENT_AT_M past it) taken, lifted over what it must clear (_deck_needs of
        crossings, the solve's (part, arc, height[, its own clearance]), and the ground beneath it: _lift_tangent);
        else its solved middle kept with tangent_ends where that clears it; else as solved, per part: was it laid).
        Where a road ends at both ends (road_end) both heights and both grades are that road's and nothing is read off
        the ground: the deck and the road meet at one point of the map at one height, and the ground, graded from those
        same roads, follows the deck (under_deck_ground) instead of lifting it. Read off the ground, the deck took the
        ground's error at the joint, and a bank left under it humped it 10 cm over a stream on a mountain road."""
        ends = np.array([np.asarray(ln, np.float64)[e, :2] for ln in lines for e in (0, -1)]).reshape(-1, 2)
        out, laid = [], []
        for k, (ln, z) in enumerate(zip(lines, zs)):
            xy = np.asarray(ln, np.float64)[:, :2]
            z = np.array(z, np.float64)
            out.append(z)
            laid.append(False)
            if len(xy) < 2 or not np.isfinite(z).all():
                continue
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            if s[-1] < TANGENT_MIN_M:
                continue
            grades, roads_ = [], 0
            for e in (0, -1):
                if (np.hypot(*(ends - xy[e]).T) < 0.75).sum() > 1:     # (a joint with another part)
                    break
                f = xy[1] - xy[0] if e == 0 else xy[-1] - xy[-2]
                f = f / max(float(np.hypot(*f)), 1e-9)
                got = self._road_end(xy[e], f)
                if got is not None:
                    z[e] = got[0]
                    grades.append(got[1])
                    roads_ += 1
                    continue
                outw = -f if e == 0 else f
                c = xy[e] + outw[None] * TANGENT_AT_M[:, None]
                g = self._ground(np.r_[xy[e][None], c])
                if abs(float(g[0]) - float(z[e])) > DECK_BANK_ON_M:
                    break
                slope = float(np.polyfit(TANGENT_AT_M, g[1:], 1)[0])     # (m per m outward)
                grades.append(-slope if e == 0 else slope)
            if len(grades) < 2:
                continue
            floor = np.full(len(s), -np.inf) if roads_ == 2 else self._ground(xy) + DECK_CLEAR
            need = _deck_needs(s, z, floor, [tuple(cr[1:]) for cr in crossings if cr[0] == k], clear)
            steep = max(abs(grades[0]), abs(grades[1]), abs(float(z[-1] - z[0])) / float(s[-1]), DECK_MAX_GRADE)
            zt = _lift_tangent(s, tangent_profile(s, float(z[0]), float(z[-1]), grades[0], grades[1]), need,
                               steep + TANGENT_GRADE_SLACK)
            if zt is None:
                ze = tangent_ends(s, z, grades[0], grades[1])
                zt = ze if not (need - ze > TANGENT_TOL_M).any() else None
            if zt is not None:
                out[-1], laid[-1] = zt, True
        return out, laid

    road_end = None     # road_end(lat (2,), lon (2,)) -> (absolute height, grade) or None: grading.road_end_reader

    def _road_end(self, p, f):
        """(height in this frame, grade in unit direction f (2,)) of the road ending at point p (2,) of this frame, or
        None."""
        if self.road_end is None:
            return None
        q = np.array([p, p + f], np.float64)
        la, lo, _ = self.frame.enu_to_geodetic(q[:, 0], q[:, 1], np.zeros(2))
        la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)
        got = self.road_end(la, lo)
        if got is None:
            return None
        return float(np.asarray(self.frame.geodetic_to_enu(la[:1], lo[:1], np.array([got[0]]))[2])[0]), float(got[1])

    def _depth(self, lines):
        """m of slab and girders of a chain: deck_depth of the inventory's main span where a record matches, else of
        geom_span. Never raises."""
        span = 0.0
        try:
            import bridgetypes
            got = bridgetypes.matches(self.frame, lines)
            if got:
                span = bridgetypes.record(got[0][1])["span"]
        except Exception as ex:
            log.debug("deck span: %s: %s", type(ex).__name__, ex)
        return deck_depth(span if span > 0 else geom_span(lines))

    plans_at = None     # plans_at(xy (k, 2)) -> the grading.Plans around those points of this frame (deck_bank)

    def deck_bank(self, xy, z):
        """A deck part's cross slope at each vertex (m per m toward its left, grading.bank's sense), or None (level):
        where the elevation is fine, each end's that of the road ending there (grading.end_bank, plans_at), run
        linearly between the ends; an end no road ends at (a joint over the valley) takes the other's.
        The road and the deck meet at one point of the map, so they take one cross slope there. Read off the graded
        ground past the end instead, a level road on an 8 % grade read -2 % and stood 9 cm under the deck's edge at the
        joint, and the test of whether that ground was the road's took the grade for a gap past 6 %: the deck's other
        end took the first end's slope, the wrong way round, 11 cm at both edges (the road to Heiligenblut)."""
        import grading
        xy = np.asarray(xy, np.float64)[:, :2]
        z = np.asarray(z, np.float64)
        if len(xy) < 2 or not np.isfinite(z).all():
            return None
        key = _deck_key(xy)
        cache = self.__dict__.setdefault("banks", {})
        if key in cache:
            return cache[key]
        b = None
        if not _is_simple(self.frame, xy):          # (a junction's bridge: level across)
            cache[key] = None
            return None
        import railways
        if self.plans_at is not None and not railways._coarse_here(self.frame, (*xy.min(0), *xy.max(0))):
            plans = self.plans_at(xy[[0, -1]])
            ends = [grading.end_bank(plans, xy[0], xy[1] - xy[0]), grading.end_bank(plans, xy[-1], xy[-1] - xy[-2])]
            if ends[0] is None:
                ends[0] = ends[1]
            if ends[1] is None:
                ends[1] = ends[0]
            if ends[0] is not None and max(abs(ends[0]), abs(ends[1])) > 1e-3:
                s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
                b = ends[0] + (ends[1] - ends[0]) * s / max(float(s[-1]), 1e-9)
        cache[key] = b
        return b

    def road_bank(self, q, along):
        """The cross slope (m per m toward the left of direction along (2,)) of the road ending at point q (2,)
        (grading.end_bank, plans_at), or None: no plans, no road ends there."""
        import grading
        if self.plans_at is None:
            return None
        q = np.asarray(q, np.float64)[:2]
        return grading.end_bank(self.plans_at(q[None]), q, np.asarray(along, np.float64)[:2])

    def _gap(self, lines, nav, depth=None):
        """Clearance requirements where the sea's depth knows no water but the inventory gives the bridge a
        navigation clearance (a river: the Calcasieu, the Mississippi at New Orleans, stayed 10-14 m up
        under a 41-46 m clearance): every WATER_STEP_M along the chain's low stretch (ground within GAP_LOW_M of its
        lowest point, which lies at sea level, GAP_SEA_M at most, and GAP_DIP_M or more under the chain's highest
        end), nav plus the slab and girders over it. Only at sea level: up a river the inventory's clearances are
        often the span raised or measured from another datum (Portland's lift and bascule bridges came out 7-29 m
        high with it). Pure given the ground."""
        under = DECK_FULL_DEPTH if depth is None else float(depth)
        gs = [np.asarray(self._ground(np.asarray(ln, np.float64)[:, :2]), np.float64) for ln in lines]
        if not gs or not all(len(g) for g in gs):
            return []
        lo = float(min(g.min() for g in gs))
        top = float(max(max(g[0], g[-1]) for g in gs))
        if lo > GAP_SEA_M or lo > top - GAP_DIP_M:
            return []
        out = []
        for k, (ln, g) in enumerate(zip(lines, gs)):
            xy = np.asarray(ln, np.float64)[:, :2]
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            low = g <= lo + GAP_LOW_M
            for at in np.arange(0.0, s[-1] + 1e-9, WATER_STEP_M):
                if low[min(int(np.searchsorted(s, at)), len(s) - 1)]:
                    out.append((k, float(at), lo, nav + under))
        return out

    def parts(self, cells_feats, box):
        """[(fid, spec, xy, z, lon)] of the bridge parts in these cells that come near box."""
        x0, y0, x1, y1 = box
        out, todo, queued = [], [], set()
        for feats in cells_feats:
            if feats is None or len(feats) == 0:
                continue
            bs = self.specs_of(feats)
            for i in range(len(feats)):
                if bs[i] is None:
                    continue
                fid = str(feats.ids[i])
                for j, ring in enumerate(self.parts_of(feats, i)):
                    if (fid, j) in queued:          # a feature in several of the cells: once (every
                        continue                    # part came once per cell it is in, decks made 2-3 times over)
                    e, n = mapgeom.enu_xy(feats, self.frame, ring)
                    if e.max() < x0 - NEAR_M or e.min() > x1 + NEAR_M or n.max() < y0 - NEAR_M or n.min() > y1 + NEAR_M:
                        continue
                    queued.add((fid, j))
                    todo.append(((fid, j), feats, i))
        return BridgeProfiles.parts_todo(self, todo)      # (the whole parts: TunnelProfiles splits them)

    owner_of = None     # owner_of(self, comp, pool) -> the profiles that solve chain comp (ChainStore: the one of its
                        # first part's region), or None: this one

    def parts_todo(self, todo, solved_only=False):
        """[(fid, spec, xy, z, lon)] of the parts todo [((fid, j), feats, i)], each solved with its chain (once);
        solved_only: only those solved already."""
        out = []
        for key, feats, i in todo:
            with self.lock:
                got = self.done.get(key)
            if got is None and not solved_only:
                ring = self.parts_of(feats, i)[key[1]]
                got = self._chain_of(key, [(float(p[1]), float(p[0])) for p in (ring[0], ring[-1])])
            if got is not None:
                spec, xy, z, lon = got
                out.append((self._part_id(key), spec, xy, z, lon))
        return out

    def _chain_of(self, key, ends, adopt=True):
        """Solve the chain of part key (its ring's ends (lat, lon) say where to start loading): its parts into done.
        Returns done[key] or None. A chain another store owns (owner_of) is solved there and its result taken in, its
        geometry mapped into this frame (one deck profile per chain, whichever store a tile asks)."""
        with self.lock:
            got = self.done.get(key)
        if got is not None:
            return got
        pool, ground, loaded = {}, {}, set()
        for la_, lo_ in ends:
            ck = mapcells.cell_of(la_, lo_)
            if str(ck) not in loaded:
                loaded.add(str(ck))
                self._load(ck, pool, ground)
        if key not in pool:
            return None
        comp = self._resolve(key, pool, ground, loaded)
        owner = self.owner_of(self, comp, pool) if (adopt and self.owner_of is not None) else None
        if owner is not None and owner is not self:
            try:
                if self._adopt(owner, comp, pool):
                    with self.lock:
                        got = self.done.get(key)
                    if got is not None:
                        return got
            except Exception as ex:         # (solved here rather than not at all)
                log.debug("chain %s from its owner: %s: %s", key, type(ex).__name__, ex)
        zs = self._solve(comp, pool, ground)
        with self.lock:
            for k, z in zip(comp, zs):
                spec, xy, lon = pool[k][:3]
                old = self.done.get(k)
                # the first solve of a part is kept, and what goes with it, unless this one saw more of it
                if old is None or len(xy) > len(old[1]):
                    # (its depth with its heights, per part: one map road's bridges differ, and which of them a process
                    # has solved is no reason for another's concrete to change)
                    self.done[k] = (spec._replace(depth=self.__dict__.get("depth", {}).get(k)), xy, z, lon)
                    self._commit(k, ground)
            chain = [(self.done[k][1], self.done[k][2], self.done[k][0].width) for k in comp
                     if k in self.done]
            ck = min(comp) if comp else None
            fresh = ck is not None and ck not in self.trusses
            if fresh:
                self.trusses[ck] = []
            got = self.done.get(key)
        if fresh:
            beams, tpiers = self._structure(chain)
            with self.lock:
                self.trusses[ck] = beams
                self.piers[("truss", ck)] = tpiers
        return got

    def _ends_ll(self, xy):
        """(lat, lon) of a deck line's two ends (this frame's world)."""
        la, lo, _ = self.frame.enu_to_geodetic(np.array([xy[0][0], xy[-1][0]]), np.array([xy[0][1], xy[-1][1]]), 0.0)
        return [(float(la[0]), float(lo[0])), (float(la[1]), float(lo[1]))]

    def _adopt(self, owner, comp, pool):
        """Chain comp solved by owner (from its first part), its parts, piers, trusses and depths taken into this
        frame. False when owner's solve did not cover comp's parts."""
        first = min(comp)
        if owner._chain_of(first, self._ends_ll(pool[first][1]), adopt=False) is None:
            return False
        import geotiles
        with owner.lock:
            mine = [k for k in comp if k in owner.done]
            if len(mine) != len(comp):
                return False
            done = {k: owner.done[k] for k in mine}
            piers = {k: owner.piers.get(k, []) for k in mine}
            ck = min(comp)
            beams = owner.trusses.get(ck)
            tpiers = owner.piers.get(("truss", ck))
            depth = {k: owner.__dict__.get("depth", {}).get(k) for k in mine}
            extra = owner._adopt_extra(comp)
        mp = _Mapper(owner.frame, self.frame)
        with self.lock:
            for k, (spec, xy, z, lon) in done.items():
                if k in self.done:
                    continue
                xyz = mp.pts(np.c_[np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64)])
                self.done[k] = (spec, xyz[:, :2].copy(), xyz[:, 2].copy(), lon)
                self.piers[k] = [mp.pier(q) for q in piers[k]]
                if depth.get(k) is not None:
                    self.__dict__.setdefault("depth", {})[k] = depth[k]
            if beams is not None and ck not in self.trusses:
                self.trusses[ck] = [mp.beam(b) for b in beams]
                self.piers[("truss", ck)] = [mp.pier(q) for q in (tpiers or [])]
            self._adopt_take(extra)
        return True

    def _adopt_extra(self, comp):
        """Under self.lock: what else goes with comp's solve (TunnelProfiles: its sections)."""
        return None

    def _adopt_take(self, extra):
        """Under self.lock: _adopt_extra's from another store."""

    def _commit(self, k, ground=None):
        """Under self.lock: part k's solve was kept: its piers (pier_sites; TunnelProfiles keeps its sections)."""
        spec, xy, z, _lon = self.done[k]
        lines = [ln for v in (ground or {}).values() for ln in v]
        try:
            self.piers[k] = pier_sites(np.asarray(xy, np.float64), np.asarray(z, np.float64), spec.width,
                                       self._ground, lines, self._wet_at, self.__dict__.get("depth", {}).get(k))
        except Exception as ex:             # no piers rather than no bridge
            log.debug("piers of %s: %s: %s", k, type(ex).__name__, ex)
            self.piers[k] = []

    def _wet_at(self, xy):
        if self.wet is None:
            return np.zeros(len(xy), bool)
        la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        return np.asarray(self.wet(la, lo), np.float64) > 0.5

    def _roads_near(self, xy):
        """The ground road lines (k, 2) of the map cells around the points xy (n, 2) (an anchor pier's site)."""
        la, lo, _ = self.frame.enu_to_geodetic(np.asarray(xy)[:, 0], np.asarray(xy)[:, 1], 0.0)
        out = []
        for key in {mapcells.cell_of(float(a), float(b)) for a, b in zip(la, lo)}:
            feats = self.cell_fn(key)
            if feats is None or len(feats) == 0:
                continue
            rs = road_specs(feats)
            for i in range(len(feats)):
                if rs[i] is not None:
                    for ring in ground_parts(feats, i):
                        e, n = mapgeom.enu_xy(feats, self.frame, ring)
                        out.append(np.stack([e, n], axis=1))
        return out

    def _structure(self, chain):
        """The truss beams of a solved chain [(xy, z, width)] and the piers under its ends (bridgetypes); ([], []) for a
        plain deck."""
        import bridgetypes
        try:
            infra = []
            if self.infra_fn is not None:
                pts = np.concatenate([np.asarray(xy, np.float64) for xy, _, _ in chain])
                la, lo, _ = self.frame.enu_to_geodetic(pts[:, 0], pts[:, 1], 0.0)
                infra = [self.infra_fn(k) for k in mapcells.cells_for_points(la, lo)]
            wet = self._wet_at if self.wet is not None else None
            beams, piers = [], []
            for info in bridgetypes.chain_structures(self.frame, chain, wet, infra):
                b, p = bridgetypes.structure_members(chain, info, self._ground, wet, road_lines=self._roads_near)
                beams += b
                piers += p
            return beams, piers
        except Exception as ex:             # a plain deck rather than no bridge
            log.debug("bridge structure: %s: %s", type(ex).__name__, ex)
            return [], []

    def beams_in(self, box):
        """The truss beams (p, q, w, h) of the chains solved so far whose middle lies in box (each in one tile)."""
        x0, y0, x1, y1 = box
        with self.lock:
            allb = [b for v in self.trusses.values() for b in v]
        return [b for b in allb if box_owns(box, (b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2)]

    def piers_in(self, box):
        """The piers (pier_sites) of the parts solved so far standing in box (x0, y0, x1, y1): x0 <= x < x1, y0 <= y
        < y1 (each in one tile)."""
        x0, y0, x1, y1 = box
        with self.lock:
            allp = [p for v in self.piers.values() for p in v]
        return [p for p in allp if box_owns(box, p[0], p[1])]

    @staticmethod
    def _part_id(key):
        return key[0]


class _Mapper:
    """Points of one frame's world in another's (geotiles.world_map), rigid parts by the rotation between them."""

    def __init__(self, src, dst):
        import geotiles
        self.src, self.dst, self.same = src, dst, src.lat0 == dst.lat0 and src.lon0 == dst.lon0
        self._gt = geotiles
        if not self.same:
            r, _t, _c = geotiles.placement(src, dst, (0.0, 0.0, 0.0))
            self.r = r

    def pts(self, p):
        p = np.asarray(p, np.float64)
        if self.same or not len(p):
            return p.copy()
        return self._gt.world_map(self.src, self.dst, p)

    def dir2(self, ux, uy):
        if self.same:
            return ux, uy
        v = self.r[:2, :2] @ np.array([ux, uy])
        n = max(float(np.hypot(*v)), 1e-12)
        return float(v[0] / n), float(v[1] / n)

    def pier(self, q):
        if self.same:
            return q
        x, y, ux, uy, zt, zb = q[:6]
        a = self.pts(np.array([[x, y, zt], [x, y, zb]], np.float64))
        ux, uy = self.dir2(ux, uy)
        return (float(a[0, 0]), float(a[0, 1]), ux, uy, float(a[0, 2]), float(a[1, 2])) + tuple(q[6:])

    def beam(self, b):
        if self.same:
            return b
        a = self.pts(np.array([np.asarray(b[0], np.float64)[:3], np.asarray(b[1], np.float64)[:3]]))
        return (a[0].copy(), a[1].copy()) + tuple(b[2:])
