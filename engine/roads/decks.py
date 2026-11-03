"""A bridge's height profile: end joins, curves, deck heights, what covers a road."""
import math
import os

import numpy as np

import roadmesh

from .levels import TUNNEL_ROAD_MIN_SIN

# Usable space below the lowest structural girder, not merely to the road surface.
# Six metres accommodates tall road vehicles such as semi-trucks; unlimited-height
# modded vehicles and raised equipment cannot have a finite universal guarantee.
MIN_BRIDGE_HEADROOM_M = 6.0
BRIDGE_HEADROOM_MARGIN_M = 0.15   # mesh simplification/float and vehicle clearance tolerance


DECK_CLEAR = 0.05       # m a deck stays above the ground under it (no z-fighting where it rests on it)
DECK_ROAD_CLEAR = MIN_BRIDGE_HEADROOM_M + BRIDGE_HEADROOM_MARGIN_M + roadmesh.DECK_DEPTH + roadmesh.GIRDER_D


DECK_CLEAR_REACH_M = 20.0   # full headroom either side of a road crossing (matches approach fills' flat reach)
DECK_GRADE = 0.05       # that requirement falls 5 % along the deck from the crossing
DECK_MAX_GRADE = 0.06   # a deck climbs no steeper than this from an abutment
DECK_STEEP_GRADE = 0.15  # ... nor, whatever ground the caps were raised to, than this over lower ground (no walls)
AT_GRADE_M = 3.0        # m: a road crossing a deck within AT_GRADE_REACH_M of an abutment that cannot get this
AT_GRADE_REACH_M = 12.0     # high over it is a junction at grade (the intersection a ramp starts from)

# a major road's cutting is walled in concrete (Munich's McGraw-Graben, Mapillary), a smaller road's in stone
# (Central Park's transverses)
CONCRETE_WALL_CLASSES = {"motorway", "motorway_link", "trunk", "trunk_link", "primary", "primary_link"}


class _EndJoin:
    """Line end points joined into nodes when within tol m of each other (the first point seen names the node; a later
    one joins the nearest node within tol). Rounding to a 0.5 m grid split ends a few cm apart either side of a grid
    line and joined ends 0.68 m apart on a diagonal. A grid of tol cells, the 3 x 3 around a
    point looked up: as cheap as the rounding. Deterministic for a given order."""

    def __init__(self, tol=0.5):
        self.tol, self.grid, self.pts = tol, {}, []

    def __call__(self, p):
        x, y = float(p[0]), float(p[1])
        gx, gy = math.floor(x / self.tol), math.floor(y / self.tol)
        best, bd = None, self.tol * self.tol
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for i in self.grid.get((gx + dx, gy + dy), ()):
                    q = self.pts[i]
                    d = (q[0] - x) ** 2 + (q[1] - y) ** 2
                    if d < bd or (d == bd and best is not None and i < best):
                        best, bd = i, d
        if best is not None:
            return best
        self.pts.append((x, y))
        self.grid.setdefault((gx, gy), []).append(len(self.pts) - 1)
        return len(self.pts) - 1


def _chain_graph(lines):
    """Nodes (end points within 0.5 m joined) and edges (start node, end node, arc lengths) of parts."""
    join, nodes = _EndJoin(), []

    def node(p):
        k = join(p)
        if k == len(nodes):
            nodes.append(np.asarray(p[:2], np.float64))
        return k
    edges = []
    for ln in lines:
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(ln[:, :2], axis=0).T))]
        edges.append((node(ln[0]), node(ln[-1]), s))
    adj = [[] for _ in nodes]
    for a, b, s in edges:
        adj[a].append((b, s[-1]))
        adj[b].append((a, s[-1]))
    return nodes, edges, adj


def _dijkstra(adj, seeds):
    """Shortest distances along the chain from seeds {node: start distance}."""
    import heapq
    d = np.full(len(adj), np.inf)
    q = []
    for n, d0 in seeds.items():
        if d0 < d[n]:
            d[n] = d0
            q.append((d0, n))
    heapq.heapify(q)
    while q:
        dd, u = heapq.heappop(q)
        if dd > d[u]:
            continue
        for v, w in adj[u]:
            if dd + w < d[v]:
                d[v] = dd + w
                heapq.heappush(q, (dd + w, v))
    return d


MERGE_TOUCH_M = 1.5     # m: decks side by side this close (edge to edge) are pulled together too (the Queensboro
                        # Bridge's upper roadway's two directions met at a 0.5-2 m step, a wall and stubs on it)
# A deck part's end that no other part's end meets (within _EndJoin's 0.5 m) and no ground road goes on from (within
# END_JOIN_GROUND_M) is no abutment when it lies on another deck part's end, along it: a carriageway's split or merge
# drawn a few metres off the joint. Held at the ground as an abutment, the branch's deck rose from the street under the
# viaduct beside the main deck, a cliff of 7-14 m across a motorway's lanes the AI drove off (I-83 in Baltimore, 3.3 m
# off the joint, the Springfield Interchange). Such an end is solved as joined there (earthfast.
# deck_end_joins): within min(END_JOIN_M, the wider part's half width), directions within acos(END_JOIN_COS).
END_JOIN_ON = os.environ.get("BNE_DECK_END_JOINS", "on") != "off"
END_JOIN_M = 6.0
END_JOIN_COS = 0.8
END_JOIN_GROUND_M = 2.5     # (grading's APPROACH_TOUCH_M: a road ending this near leads onto the deck)
END_JOIN_MIN_M = 10.0       # m: shorter parts keep their ends


def _end_joins(lines, halves, ground_lines):
    """[(part, 0 | -1, (x, y))]: the free ends of deck lines (k, 2+) that join another line's end there (END_JOIN_*;
    earthfast.deck_end_joins), halves their half widths, ground_lines the ground roads near them. Pure."""
    if not END_JOIN_ON or len(lines) < 2:
        return []
    import fast
    fast.require(105, "deck_end_joins")
    pts = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    off = np.r_[0, np.cumsum([len(p) for p in pts])].astype(np.int64)
    gl = [np.asarray(g, np.float64)[:, :2] for g in ground_lines if len(g) >= 2]
    gends = np.array([p for g in gl for p in (g[0], g[-1])], np.float64).reshape(-1, 2)
    got = np.asarray(fast._ef.deck_end_joins(
        np.ascontiguousarray(np.concatenate(pts)), off, np.asarray(halves, np.float64), np.ascontiguousarray(gends),
        np.array([0.5, END_JOIN_M, END_JOIN_COS, END_JOIN_GROUND_M, END_JOIN_MIN_M], np.float64)), np.float64)
    return [(e // 2, 0 if e % 2 == 0 else -1, (float(got[e, 0]), float(got[e, 1])))
            for e in range(len(got)) if np.isfinite(got[e, 0])]


# ... and a free end standing on another deck part's carriageway of its level (within its half width and END_ON_MARGIN_M;
# no road going on on the ground there): a ramp's end on the cross street's bridge. Held at the ground, the ramp's
# short deck rose 8 m in 6 m to its measured joint, a wall (the Springfield Interchange). Solved again with
# that end at the other deck's height where they differ by more than END_ON_STEP_M (earthfast.deck_end_on).
END_ON_MARGIN_M = 0.5


def _end_ons(lines, halves, levels, ground_lines):
    """[(part, 0 | -1, the part it stands on, arc m along that one)]: the free ends of deck lines standing on another
    deck of their level (END_ON_*; earthfast.deck_end_on). Pure."""
    if not END_JOIN_ON or len(lines) < 2:
        return []
    import fast
    fast.require(107, "deck_end_on")
    pts = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    off = np.r_[0, np.cumsum([len(q) for q in pts])].astype(np.int64)
    gl = [np.asarray(g, np.float64)[:, :2] for g in ground_lines if len(g) >= 2]
    gends = np.array([q for g in gl for q in (g[0], g[-1])], np.float64).reshape(-1, 2)
    got = np.asarray(fast._ef.deck_end_on(
        np.ascontiguousarray(np.concatenate(pts)), off, np.asarray(halves, np.float64),
        np.asarray([float(v) for v in levels], np.float64), np.ascontiguousarray(gends),
        np.array([0.5, END_JOIN_GROUND_M, END_ON_MARGIN_M], np.float64)), np.float64)
    return [(e // 2, 0 if e % 2 == 0 else -1, int(got[e, 0]), float(got[e, 1]))
            for e in range(len(got)) if got[e, 0] >= 0]


def _joined_lines(lines, joins):
    """lines with each end of joins moved onto its joint (copies; the others as they are)."""
    out = list(lines)
    for k, at, p in joins:
        ln = np.array(out[k], np.float64, copy=True)
        ln[at, 0], ln[at, 1] = p
        out[k] = ln
    return out


def _ground_pins(lines, ground_lines):
    """The joints of decks (lines' ends shared by two or more) a ground road of PIN_ROAD_M or more goes on from (an
    end of it within PIN_M): _pin's points. Pure."""
    ends = np.array([p[:2] for ln in lines for p in (ln[0], ln[-1])], np.float64).reshape(-1, 2)
    if not len(ends) or not ground_lines:
        return []
    shared = [p for k, p in enumerate(ends) if (np.hypot(*(ends - p).T) < 0.5).sum() > 1]
    if not shared:
        return []
    out = []
    for gl in ground_lines:
        gl = np.asarray(gl, np.float64)[:, :2]
        if len(gl) < 2 or float(np.hypot(*np.diff(gl, axis=0).T).sum()) < PIN_ROAD_M:
            continue
        for e in (gl[0], gl[-1]):
            for p in shared:
                if np.hypot(*(e - p)) < PIN_M:
                    out.append(p)
    return out


def _merge_overlaps(lines, zs, widths, levels, rounds=3, pins=None):
    """Heights of decks lying over each other (a ramp leaving the mainline, parallel carriageways of
    one level) pulled to their mean where their surfaces overlap, so a split is one surface until the
    decks part (exits and splits not clean). Parts are related when they share an
    end node or a level and run within ~30 degrees of each other. Abutment ends stay (pins: deck_profile's). Pure."""
    nodes, edges, adj = _chain_graph(lines)
    deg = np.zeros(len(nodes), int)
    for a, b, _ in edges:
        deg[a] += 1
        deg[b] += 1
    deg = _pin(nodes, deg, pins)
    n = len(lines)
    pairs = []
    # the related pairs (i, j), i then j ascending, as a double loop testing each would find them, one line against
    # all others at a time (that loop was ~4 s of a Fells Point teleport, on the event loop)
    if n:
        ea = np.array([e[0] for e in edges[:n]])
        eb = np.array([e[1] for e in edges[:n]])
        lo = np.array([np.asarray(ln)[:, :2].min(0) for ln in lines])
        hi = np.array([np.asarray(ln)[:, :2].max(0) for ln in lines])
        lv = None if levels is None else np.empty(n, object)
        if lv is not None:
            lv[:] = list(levels)[:n]
        idx = np.arange(n)
        for i in range(n):
            ok = (ea[i] == ea) | (ea[i] == eb) | (eb[i] == ea) | (eb[i] == eb)
            if lv is not None:
                ok |= ~(lv != lv[i]).astype(bool)          # elementwise, the same != as levels[i] != levels[j]
            ok &= ~(hi[i] < lo - 30).any(1) & ~(hi < lo[i] - 30).any(1)
            ok &= idx != i
            pairs.extend((i, int(j)) for j in np.flatnonzero(ok))
    if not pairs:
        return zs
    floors = [np.array(z, np.float64) for z in zs]
    zs = [z.copy() for z in floors]
    # never raised faster than DECK_MAX_GRADE from any abutment of the chain, along it (a lift at a joint reached the
    # parts beyond it: Spaghetti Junction's ramps, lifted to a higher deck of their level beside them, stood 21 m up at
    # the joint of a 48 m part ending on the ground, 40 %)
    reach = [np.full(len(z), np.inf) for z in zs]
    for k0, (a0, b0, _s) in enumerate(edges[:n]):
        for node, zend in ((a0, floors[k0][0]), (b0, floors[k0][-1])):
            if deg[node] != 1 or not np.isfinite(zend):
                continue
            d = _dijkstra(adj, {node: 0.0})
            for k, (ea, eb, es) in enumerate(edges[:n]):
                reach[k] = np.minimum(reach[k], zend + DECK_MAX_GRADE * np.minimum(d[ea] + es, d[eb] + (es[-1] - es)))
    for _ in range(rounds):
        new = [z.copy() for z in zs]
        acc = [np.zeros(len(z)) for z in zs]
        cnt = [np.zeros(len(z)) for z in zs]
        up = [np.zeros(len(z)) for z in zs]     # twin carriageways: how far up to the other's height
        for i, j in pairs:
            A, B = lines[i][:, :2], lines[j][:, :2]
            P, Q = B[:-1], B[1:]
            ab = Q - P
            L2 = np.maximum((ab ** 2).sum(1), 1e-12)
            t = np.clip(((A[:, None, :] - P[None]) * ab[None]).sum(2) / L2[None], 0, 1)
            near = P[None] + t[..., None] * ab[None]
            d = np.hypot(*(A[:, None, :] - near).transpose(2, 0, 1))
            m = np.argmin(d, axis=1)
            dmin = d[np.arange(len(A)), m]
            tj = t[np.arange(len(A)), m]
            zj = zs[j][m] + tj * (zs[j][np.minimum(m + 1, len(zs[j]) - 1)] - zs[j][m])
            ta = np.gradient(A, axis=0)
            tb = ab[m]
            cos = np.abs((ta * tb).sum(1)) / (np.hypot(*ta.T) * np.hypot(*tb.T) + 1e-12)
            # soft: full weight 2 m into the overlap and when parallel, none at its edge (a hard mask
            # made 4 m steps mid-viaduct where a neighbour's footprint started)
            depth = np.clip(((widths[i] + widths[j]) / 2 + MERGE_TOUCH_M - dmin) / 2.0, 0.0, 1.0)
            w = depth * np.clip((cos - 0.85) / 0.1, 0.0, 1.0) * np.isfinite(zj)
            acc[i] += w * np.nan_to_num(zj)
            cnt[i] += w
            if levels is not None and levels[i] == levels[j]:
                # one level's carriageways side by side are one deck (the Tsing Ma Bridge's two directions stood 15 m
                # apart in height, the one over the lower deck lifted by the stacking, 2026-10-18): the lower lifted
                # to the higher, fading out from DUAL_DECK_M apart
                w2 = np.clip((DUAL_DECK_M - dmin) / 10.0, 0.0, 1.0) * np.clip((cos - 0.85) / 0.1, 0.0, 1.0)
                lift = np.where(np.isfinite(zj), w2 * np.maximum(np.nan_to_num(zj) - zs[i], 0.0), 0.0)
                up[i] = np.maximum(up[i], lift)
        for i in range(n):
            m = cnt[i] > 0
            new[i][m] = (zs[i][m] + acc[i][m]) / (1 + cnt[i][m])
            new[i] = np.maximum(new[i], zs[i] + up[i])
            a, b, es = edges[i]
            # a lift fades along the deck no faster than DECK_MAX_GRADE: it ended where the parts drew apart, over a
            # few metres of their spacing (a High Five ramp lifted 11 m to its twin fell back over ~60 m, 35 %)
            lifted = new[i] > zs[i] + 1e-6
            if lifted.any():
                new[i] = np.maximum(new[i], _ground_envelope(es, np.where(lifted, new[i], -np.inf), DECK_MAX_GRADE))
            # never raised faster than DECK_MAX_GRADE from an abutment (a road's bridge forking off uphill near one,
            # taken for a carriageway beside it, pulled US-24's deck 1.1 m up in the first 3 m off its abutment near
            # Buena Vista CO)
            # (fading out toward a joint with other parts, where the parts must meet: capped right up to it, an 8 m
            # ramp part of a Calgary diverging diamond stood 0.7 m under the joint it leaves, #369)
            rise = np.full(len(es), np.inf)
            to_joint = np.full(len(es), np.inf)
            for end, d, at in ((a, es, 0), (b, es[-1] - es, -1)):
                if deg[end] == 1:
                    rise = np.minimum(rise, floors[i][at] + DECK_MAX_GRADE * d)
                else:
                    to_joint = np.minimum(to_joint, d)
            capped = np.minimum(new[i], np.maximum(floors[i], rise))     # (from the unmerged heights: no creep per round)
            if np.isfinite(to_joint).any() and np.isfinite(rise).any():
                w = np.clip(to_joint / max(float(es[-1]), 1e-6), 0.0, 1.0)
                capped = w * capped + (1.0 - w) * new[i]
            new[i] = np.minimum(capped, np.maximum(reach[i], floors[i]))
            if deg[a] == 1:
                new[i][0] = zs[i][0]
            if deg[b] == 1:
                new[i][-1] = zs[i][-1]
        zs = new
    out = []
    for i, z in enumerate(zs):                  # re-smoothed, ends kept
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(lines[i][:, :2], axis=0).T))]
        sm = _smooth_pinned(z, s[-1] / max(len(s) - 1, 1), DECK_SIGMA) if len(z) > 3 else z
        out.append(np.maximum(sm, floors[i]))
    return out


DUAL_DECK_M = 30.0      # m: parts of one level parallel within this are one deck's carriageways (_merge_overlaps)


def deck_profile(lines, ground_fn, crossings=(), clear=None, grade=None, lift=None, levels=None, widths=None, pins=None):
    """deck_profile_once, then repeated with the deck-over-deck requirements: where two parts of
    different levels cross, the higher one clears the lower one's deck by `clear` (crossing
    decks clipped into each other). pins: points where a ground road goes on from a joint of decks (abutments too: _pin).
    Pure given ground_fn."""
    zs = deck_profile_once(lines, ground_fn, crossings, clear, grade, lift, pins=pins)
    n_road = len(crossings)
    if levels is None or len(lines) < 2:
        return zs
    over = _deck_crossings(lines)
    stacks = _deck_stacks(lines, levels, widths) if widths is not None else []
    if not over and not stacks:
        zs = _merge_overlaps(lines, zs, widths, levels, pins=pins) if widths is not None else zs
        return _ease(lines, zs, ground_fn, lift) if bridge_profile_mode() == "curve" else zs
    arcs = [np.r_[0.0, np.cumsum(np.hypot(*np.diff(ln[:, :2], axis=0).T))] for ln in lines]
    # curve mode: one round. Its grades carry a requirement along the line to the parts joined to it whatever their
    # level, so a ramp under the upper deck rose with it and lifted it again each round (the Morrison Bridge 21 ->
    # 41 m over the Willamette)
    for _ in range(1 if bridge_profile_mode() == "curve" else 4):
        extra = []
        for i, j, si, sj in over:
            if levels[i] == levels[j]:
                continue
            hi, lo, sh, sl = (i, j, si, sj) if levels[i] > levels[j] else (j, i, sj, si)
            extra.append((hi, sh, float(np.interp(sl, arcs[lo], zs[lo])), None, levels[hi]))
        for hi, sh, lo, sl in stacks:               # a deck over another along it (an upper roadway)
            extra.append((hi, sh, float(np.interp(sl, arcs[lo], zs[lo])), None, levels[hi]))
        if not extra:
            break
        new = deck_profile_once(lines, ground_fn, list(crossings) + extra, clear, grade, lift, n_road=n_road,
                                levels=levels, pins=pins)
        if all(np.allclose(a, b, atol=0.02, equal_nan=True) for a, b in zip(new, zs)):
            zs = new
            break
        zs = new
    zs = _merge_overlaps(lines, zs, widths, levels, pins=pins) if widths is not None else zs
    return _ease(lines, zs, ground_fn, lift) if bridge_profile_mode() == "curve" else zs


STACK_STEP_M = 16.0     # m between the points where an upper deck must clear the one under it (_deck_stacks)


def _deck_stacks(lines, levels, widths, step=STACK_STEP_M):
    """(upper part, arc on it, lower part, arc on that) every `step` m where a part of a higher level runs over one
    of a lower level, their surfaces overlapping in plan: the Queensboro Bridge's upper and lower roadways lay at
    one height, one road through the other; _deck_crossings only finds crossings.
    Pure."""
    out = []
    n = len(lines)
    if levels is None or n < 2:
        return out
    pts = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    arcs = [np.r_[0.0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))] for p in pts]
    lo_b = [p.min(0) for p in pts]
    hi_b = [p.max(0) for p in pts]
    for i in range(n):
        for j in range(n):
            if levels[i] <= levels[j] or len(pts[i]) < 2 or len(pts[j]) < 2:
                continue
            reach = (float(widths[i]) + float(widths[j])) / 2
            if (hi_b[i] + reach < lo_b[j]).any() or (hi_b[j] + reach < lo_b[i]).any():
                continue
            # over it means over at least half the narrower deck: two carriageways side by side that the map gives
            # different layers touch edge to edge (the Vincent Thomas Bridge's, 8.5 m apart, 11.8 m wide: the upper
            # was lifted 10 m over its twin)
            reach -= 0.5 * min(float(widths[i]), float(widths[j]))
            s = np.arange(0.0, arcs[i][-1], step)
            q = np.c_[np.interp(s, arcs[i], pts[i][:, 0]), np.interp(s, arcs[i], pts[i][:, 1])]
            P, ab = pts[j][:-1], np.diff(pts[j], axis=0)
            L2 = np.maximum((ab * ab).sum(1), 1e-12)
            t = np.clip(((q[:, None, :] - P[None]) * ab[None]).sum(2) / L2[None], 0.0, 1.0)
            near = P[None] + t[..., None] * ab[None]
            d = np.hypot(*(q[:, None, :] - near).transpose(2, 0, 1))
            m = np.argmin(d, axis=1)
            dd = d[np.arange(len(q)), m]
            # (two parts joined at an end: a ramp leaving the mainline overlaps it from the fork on. A requirement there
            # falls back to the shared end at DECK_GRADE and lifted the upper part's end alone: a ramp of a higher
            # level started 2.2 m over the fork, a ledge across the lanes, I-83 in Baltimore. None within
            # the distance it takes to fall away.)
            shared = [ei for ei in (0, -1) for ej in (0, -1) if np.hypot(*(pts[i][ei] - pts[j][ej])) < 0.5]
            for a in np.flatnonzero(dd < reach):
                k = m[a]
                sl = arcs[j][k] + t[a, k] * (arcs[j][k + 1] - arcs[j][k])
                if any((s[a] if ei == 0 else arcs[i][-1] - s[a]) * DECK_GRADE < DECK_ROAD_CLEAR for ei in shared):
                    continue
                out.append((i, float(s[a]), j, float(sl)))
    return out


def _deck_beside(lines, widths, step=STACK_STEP_M):
    """(i, j), i < j: deck parts whose surfaces come within MERGE_TOUCH_M of each other in plan (side by side or one
    over the other: solved together): 2 or more of part i's points every `step` m along it within half their widths
    + MERGE_TOUCH_M of part j's line. earthfast.deck_beside (Rust) on the samples. Pure."""
    import fast
    fast.require(89, "deck_beside")
    pts = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    qs = []
    for p in pts:
        if len(p) < 2:
            qs.append(np.zeros((0, 2)))
            continue
        si = np.r_[0.0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]
        t = np.arange(0.0, si[-1] + 1e-9, step)
        qs.append(np.c_[np.interp(t, si, p[:, 0]), np.interp(t, si, p[:, 1])])
    off = lambda arrs: np.r_[0, np.cumsum([len(a) for a in arrs])].astype(np.int64)      # noqa: E731
    pairs = fast._ef.deck_beside(np.ascontiguousarray(np.concatenate(qs) if qs else np.zeros((0, 2))), off(qs),
                                 np.ascontiguousarray(np.concatenate(pts) if pts else np.zeros((0, 2))), off(pts),
                                 np.asarray(widths, np.float64), float(MERGE_TOUCH_M))
    return [(int(a), int(b)) for a, b in pairs]


def water_clear(w):
    """m a deck clears the water under it for a wet run w m long: a share of the span (a river's channel wants a
    ship's room: the Queensboro Bridge's ~40 m over 250 m channels), at least WATER_CLEAR_MIN; a run longer than
    WATER_CAUSEWAY_M is a causeway, low over the water. Pure."""
    if w > WATER_CAUSEWAY_M:
        return WATER_CAUSEWAY_CLEAR
    return float(np.clip(WATER_CLEAR_SHARE * w, WATER_CLEAR_MIN, WATER_CLEAR_MAX))


WATER_CLEAR_SHARE = 0.15
WATER_CLEAR_MIN = 2.5
WATER_CLEAR_MAX = 40.0
WATER_CAUSEWAY_M = 1500.0
WATER_CAUSEWAY_CLEAR = 5.0


def _curve_grade(lines, zs):
    """The steepest grade (rise / run) between consecutive points of any part of a deck profile. Pure."""
    g = 0.0
    for ln, z in zip(lines, zs):
        if len(ln) < 2:
            continue
        run = np.maximum(np.hypot(*np.diff(np.asarray(ln, np.float64)[:, :2], axis=0).T), 0.5)
        g = max(g, float(np.max(np.abs(np.diff(np.asarray(z, np.float64))) / run)))
    return g


def _end_step(lines, zs):
    """The steepest grade of a deck's first or last segment at a free end (an abutment: no other part ends within
    0.75 m), where a curve that cannot meet its end leaves a step. Pure."""
    ends = [np.asarray(ln, np.float64)[k, :2] for ln in lines for k in (0, -1)]
    g = 0.0
    for ln, z in zip(lines, zs):
        ln = np.asarray(ln, np.float64)
        if len(ln) < 2:
            continue
        for a, b in ((0, 1), (-1, -2)):
            if sum(np.hypot(*(e - ln[a, :2])) < 0.75 for e in ends) > 1:
                continue
            run = max(float(np.hypot(*(ln[b, :2] - ln[a, :2]))), 0.5)
            g = max(g, abs(float(z[b]) - float(z[a])) / run)
    return g


def _curve_crossings(crossings, n_road=None, levels=None):
    """deck_profile_once's crossings for deck_curve: (part, arc, height under it, its clearance or None). A
    deck-over-deck requirement holds on the upper part itself (deck_curve applies a requirement where it is, not
    falling along the chain, so it never reaches the lower deck). Pure."""
    return [(cr[0], cr[1], cr[2], cr[3] if len(cr) > 3 else None) for cr in crossings]


def deck_profile_once(lines, ground_fn, crossings=(), clear=None, grade=None, lift=None, n_road=None, levels=None,
                      pins=None, curve=True):
    """Deck heights (one array per part) of a bridge chain: deck_heights between the abutments, at
    least `lift` over the ground under it, and at least `clear` over each crossing road below
    ((part index, arc m, road height)), the requirement falling at `grade` along the chain; then
    smoothed per part with its end heights kept. A road crossing (the first n_road crossings, default all, without
    their own clearance) by an abutment the deck cannot get AT_GRADE_M over is a junction at grade: the deck
    meets the road's height there. Pure given ground_fn(xy (m, 2)) -> heights."""
    clear = DECK_ROAD_CLEAR if clear is None else clear
    grade = DECK_GRADE if grade is None else grade
    lift = DECK_CLEAR if lift is None else lift
    # (curve mode for a deck that clears something; one over nothing but the ground keeps the ground envelope's rounded
    # crest: Lombard Street, Baltimore's deck over its embankment, test_no_step_onto_a_steep_abutment)
    if curve and lines and bridge_profile_mode() == "curve" and len(crossings):
        cl, cg = _unpinned(lines, ground_fn, pins)
        got = deck_curve(cl, cg, _curve_crossings(crossings, n_road, levels), (), clear, lift)
        if got is not None:
            g = _curve_grade(lines, got)
            if g <= DECK_STEEP_GRADE or _end_step(lines, got) <= DECK_STEEP_GRADE:
                return got
            # (a curve steeper than that may not meet its ends: a "bridge" mapped along a hillside stepped 40 m at
            # its abutment near Tata. The ground envelope's profile when it is the gentler one)
            old = deck_profile_once(lines, ground_fn, crossings, clear, grade, lift, n_road, levels, pins, False)
            return got if not old or _end_step(lines, got) <= _end_step(lines, old) + 0.05 else old
    zs = deck_heights(lines, ground_fn, pins)
    if not zs:
        return zs
    nodes, edges, adj = _chain_graph(lines)
    allxy = np.concatenate([ln[:, :2] for ln in lines])
    gz = np.asarray(ground_fn(allxy), np.float64)
    deg = np.zeros(len(nodes), int)
    for a, b, _ in edges:
        deg[a] += 1
        deg[b] += 1
    deg = _pin(nodes, deg, pins)
    # no steeper than DECK_MAX_GRADE from an abutment: a short bridge over a road cannot reach full
    # headroom (such decks became steep wedges, "walls" in the user's screenshot)
    cap = [np.full(len(ln), np.inf) for ln in lines]
    dab = [np.full(len(ln), np.inf) for ln in lines]      # m to the nearest abutment
    steep = [np.full(len(ln), np.inf) for ln in lines]    # DECK_STEEP_GRADE off each abutment (below)
    for k, (a, b, s) in enumerate(edges):
        for node, zend in ((a, zs[k][0]), (b, zs[k][-1])):
            if deg[node] != 1 or not np.isfinite(zend):
                continue
            d = _dijkstra(adj, {node: 0.0})
            for k2, (ea, eb, es) in enumerate(edges):
                dk = np.minimum(d[ea] + es, d[eb] + (es[-1] - es))
                cap[k2] = np.minimum(cap[k2], zend + DECK_MAX_GRADE * dk)
                dab[k2] = np.minimum(dab[k2], dk)
                steep[k2] = np.minimum(steep[k2], zend + DECK_STEEP_GRADE * dk)
    n_road = len(crossings) if n_road is None else n_road
    req = [np.full(len(ln), -np.inf) for ln in lines]
    for ci, cr in enumerate(crossings):     # (part, arc, height under it[, its own clearance: over water])
        pi, sc, zc = cr[:3]
        cl = cr[3] if len(cr) > 3 and cr[3] is not None else clear
        # a deck-over-deck requirement (its 5th element: the upper part's level) lifts the parts of that level and
        # above only: falling along the chain it reached the lower deck it was measured on, lifting it, and so the
        # upper again each round (the Tsing Ma Bridge's upper deck 33 m over its lower one, 7 m in life)
        min_lv = cr[4] if len(cr) > 4 and levels is not None else None
        a, b, s = edges[pi]
        d = _dijkstra(adj, {a: sc, b: s[-1] - sc})
        # a junction at grade (Queens Plaza: a ramp's map line starts in the
        # intersection it climbs from; its deck rose 0.8 m over the cross street there, a hump across it)
        flat = (ci < n_road and len(cr) == 3 and float(np.interp(sc, s, dab[pi])) <= AT_GRADE_REACH_M
                and float(np.interp(sc, s, cap[pi])) < zc + AT_GRADE_M)
        for k, (ea, eb, es) in enumerate(edges):
            dk = np.minimum(d[ea] + es, d[eb] + (es[-1] - es))
            if k == pi:
                dk = np.minimum(dk, np.abs(es - sc))
            if flat:
                cap[k] = np.minimum(cap[k], zc + DECK_MAX_GRADE * dk)
            elif min_lv is None or levels[k] >= min_lv:
                # A lower road has width: keep a level clearance corridor around its
                # centreline instead of reaching the target at just one point.
                reach = DECK_CLEAR_REACH_M if len(cr) == 3 or cr[3] is None else 0.0
                req[k] = np.maximum(req[k], zc + cl - grade * np.maximum(dk - reach, 0.0))
                if k == pi:
                    # A crossing can lie between mesh vertices. Both bracketing vertices
                    # need full height, otherwise linear interpolation loses headroom.
                    for point in (sc - reach, sc, sc + reach):
                        if not 0 <= point <= es[-1]:
                            continue
                        j = int(np.searchsorted(es, point, side="left"))
                        near = [j] if j < len(es) and abs(es[j] - point) < 1e-8 else [j - 1, j]
                        for at in near:
                            if 0 <= at < len(es):
                                req[k][at] = max(req[k][at], zc + cl)
    # the caps (from an abutment, from a junction at grade) never under the straight line between the abutments: two
    # abutments further apart in height than DECK_MAX_GRADE allows had the higher one pulled under its own road, a
    # step onto the deck (0.9 m up onto the I-20 bridge near Temple, GA, once its approaches were raised)
    cap = [np.where(np.isfinite(z), np.maximum(c, z), c) for c, z in zip(cap, zs)]
    out, k0 = [], 0
    for k, (z, (a, b, s)) in enumerate(zip(zs, edges)):
        # Meet the graded approach exactly. A constant skin allowance right up
        # to a pinned abutment otherwise restores a small lip after smoothing.
        blend = np.ones(len(z))
        for distance in ([s] if deg[a] == 1 else []) + ([s[-1] - s] if deg[b] == 1 else []):
            u = np.clip(distance / DECK_SIGMA, 0.0, 1.0)
            blend = np.minimum(blend, u * u * (3.0 - 2.0 * u))
        g = gz[k0:k0 + len(z)] + lift * blend
        k0 += len(z)
        if not np.isfinite(z).all():
            out.append(z)
            continue
        # ground standing over a cap raises it, falling at DECK_MAX_GRADE either way: capped from its abutment, a deck
        # met a steep embankment's ground in a step where the ground took over (0.86 m in 4 m onto Lombard Street's
        # east abutment in Baltimore, the bridge's map line ending down the embankment; cars stopped dead)
        # the floor: the ground rounded over its peaks (a vertical curve of DECK_CREST_R), so a deck smoothed under a
        # sharp peak and floored there has no spike
        g = np.maximum(g, _ground_envelope(s, g, 0.0, 1.0 / (2.0 * DECK_CREST_R)))
        cap[k] = np.maximum(cap[k], _ground_envelope(s, g, DECK_MAX_GRADE))
        # ... but never steeper than DECK_STEEP_GRADE off an abutment where the ground under it is lower (nor under
        # the straight line between the abutments): raised by the ground 90 m off at the far, 10 m higher abutment, a
        # water clearance stood the New York Thruway's deck over the Vloman Kill 5 m up in its first 3.6 m, a wall an
        # AI car hit at 65 mph
        cap[k] = np.minimum(cap[k], np.maximum(np.maximum(steep[k], g), np.where(np.isfinite(z), z, -np.inf)))
        zz = np.maximum(np.minimum(np.maximum(z, req[k]), cap[k]), g)
        if deg[a] == 1:                         # an abutment keeps the ground's height
            zz[0] = z[0]
        if deg[b] == 1:
            zz[-1] = z[-1]
        if len(zz) > 3:
            # no sag between two higher points (the Queensboro Bridge dipped 7 m over Roosevelt Island between its
            # channel spans: one arch in life), within the caps
            zz = np.maximum(np.minimum(_no_sag(s, zz), np.maximum(cap[k], zz)), zz)
            step = s[-1] / (len(s) - 1)
            sigma = float(np.clip(s[-1] / DECK_SIGMA_SHARE, DECK_SIGMA, DECK_SIGMA_MAX))   # a long deck: a long curve
            sm = np.minimum(_smooth_pinned(zz, step, sigma), cap[k])   # no hump over an at-grade junction
            # Smoothing is aesthetic: it must not remove feasible structural headroom.
            # Keep the abutment/grade cap, rather than turning a short bridge into a wall.
            floor = np.maximum(np.minimum(req[k], cap[k]), g)
            zz = np.maximum(sm, floor)
            zz[0], zz[-1] = sm[0], sm[-1]
            zz = _curve_deck(s, zz, floor, cap[k])
        out.append(zz)
    return out


DECK_CREST_R = 60.0     # m: the ground under a deck is its floor rounded to vertical curves this wide (deck_profile_once)
# ---- clearance-aware deck profile ----------------------------------------------------------------------
# (a user in Portland, OR): decks came out as "two flat pieces of road joined in the middle with slight
# up, then down slopes": deck_heights' straight line between abutments, a 5 % tent where a road crosses
# under, smoothed. deck_curve plans the deck as a road designer would: grades of DECK_DESIGN_GRADE up to
# whatever must be cleared beneath (never steeper than DECK_MAX_GRADE from an abutment), joined by parabolic vertical
# curves (one moving average of a piecewise-linear profile), the whole simple chain solved as one line.
# BNE_BRIDGE_PROFILE=legacy (earthd --bridge-profile legacy) brings the old profile back for comparison.
DECK_CURVE_K = 1500.0   # m of vertical curve per unit of grade change (15 m per %)
DECK_CURVE_MIN = 16.0   # m, shortest vertical curve
DECK_CURVE_KMIN = 260.0 # m per unit grade change at least: under 2 % of grade change between 4 m deck points
DECK_ROAD_HALF = 8.0    # m either side of a crossing road's centreline the clearance is held
DECK_CURVE_STEP = 1.0   # m, the profile's working grid
DECK_DESIGN_GRADE = 0.05  # a deck climbs to (and leaves) what it must clear at this grade (DECK_MAX_GRADE at most)
APPROACH_GRADE = 0.08  # m/m: the approach road's grade read from the ground 12 m past an abutment, at most


def bridge_profile_mode():
    """'curve' (default) or 'legacy', from BNE_BRIDGE_PROFILE (set by earthd --bridge-profile)."""
    return "legacy" if os.environ.get("BNE_BRIDGE_PROFILE", "curve").lower() == "legacy" else "curve"


def _upper_hull(s, z):
    """Indices of the least concave majorant's vertices of points (s ascending, z). Pure."""
    h = []
    for i in range(len(s)):
        while len(h) >= 2:
            a, b = h[-2], h[-1]
            if (s[b] - s[a]) * (z[i] - z[a]) - (z[b] - z[a]) * (s[i] - s[a]) >= 0:
                h.pop()
            else:
                break
        h.append(i)
    return h


def _simple_path(lines):
    """[(edge index, reversed)] in order along the chain if the parts form one open path, else None."""
    nodes, edges, adj = _chain_graph(lines)
    deg = np.zeros(len(nodes), int)
    for a, b, _ in edges:
        deg[a] += 1
        deg[b] += 1
    ends = np.flatnonzero(deg == 1)
    if len(ends) != 2 or deg.max() > 2 or len(edges) != len(nodes) - 1:
        return None
    at, used, order = int(ends[0]), set(), []
    while len(order) < len(edges):
        for k, (a, b, _) in enumerate(edges):
            if k in used or at not in (a, b):
                continue
            used.add(k)
            order.append((k, at == b and a != b))
            at = a if at == b else b
            break
        else:
            return None
    return order


CHORD_KINK = 0.02       # curve_profile keeps the straight line between abutments meeting the approaches within this grade
CHORD_SHELF_M = 1.0     # m
CHORD_TOL = 0.35        # m a requirement may go short: 0.21 m of it margins, 6 m headroom to 5.86 m at worst


def _chord(s, g, need, z0, zL, g0, gL, max_grade, cap=None):
    """curve_profile's straight line or single parabola between the abutments (see there), or None. Pure."""
    L = float(s[-1])
    if L <= 0:
        return None
    t = s / L
    line = z0 + (zL - z0) * t
    gl = (zL - z0) / L
    if abs(gl) > max_grade:
        return None
    p = 4.0 * t * (1.0 - t)
    # (where the ground stands within CHORD_SHELF_M of it, an abutment's shelf, nothing under it is to be cleared: the
    # crossing's +-DECK_CLEAR_REACH_M corridor reached over the abutments of a 24 m overpass)
    on = g >= line - CHORD_SHELF_M
    shelf = (np.cumsum(~on) == 0) | (np.cumsum((~on)[::-1])[::-1] == 0)     # (from each end, while on it)
    if shelf.all():
        shelf[:] = False
    short = np.maximum(np.where(shelf, -np.inf, need - CHORD_TOL - line), g - line)
    h = 0.0
    inner = p > 1e-6
    if (short[~inner] > 1e-6).any():
        return None
    if (short[inner] > 0).any():
        h = float(np.max(short[inner] / p[inner]))
    # its grade out of each abutment, against the approach's there
    if abs(gl + 4.0 * h / L - g0) > CHORD_KINK or abs(gl - 4.0 * h / L - gL) > CHORD_KINK             or 4.0 * h / L > CHORD_KINK or abs(gl) + 4.0 * h / L > max_grade:
        return None
    z = line + h * p
    if cap is not None and not bool(np.all(z <= np.asarray(cap) + 1e-6)):
        return None
    return z


def curve_profile(s, g, req, z0, zL, g0=0.0, gL=0.0, max_grade=None, lift=None, iters=20, cap=None):
    """One deck line's heights on a uniform grid s (0..L): from z0 to zL (the abutments), meeting the
    approach grades g0 (dz/ds just before s=0) and gL (just after L); at least req (the clearances) where
    the grade cap lets it, reached and left at DECK_DESIGN_GRADE (no steeper than max_grade from either end), joined by parabolic
    vertical curves; never below g + lift nor the straight line between the abutments; under cap (m, per point: a
    junction at grade's) where given. Pure."""
    max_grade = DECK_MAX_GRADE if max_grade is None else max_grade
    lift = DECK_CLEAR if lift is None else lift
    s = np.asarray(s, np.float64)
    L = s[-1]
    floor = np.asarray(g, np.float64) + lift
    req = np.maximum(np.asarray(req, np.float64), floor)
    cap = np.minimum(np.minimum(z0 + max_grade * s, zL + max_grade * (L - s)),
                     np.inf if cap is None else cap)        # (and under a junction at grade's own cap)
    line = z0 + (zL - z0) * s / max(L, 1e-9)    # never under the straight line between the abutments
    # the straight line between the abutments, or one parabola over it rising at most CHORD_KINK more steeply out of
    # each abutment, when that clears everything (the requirements within CHORD_TOL: they carry 0.21 m of margin;
    # the ground itself, which it may rest on) and meets both approaches within CHORD_KINK. The curve's floor stood
    # DECK_CLEAR over the approach ground beside each abutment and its smoothing crowned a 24 m overpass by 0.2-0.3 m
    # (I-275 by the Sunshine Skyway: "it just has a HUMP in the middle that's not necessary")
    chord = _chord(s, np.asarray(g, np.float64), np.asarray(req, np.float64) - lift, z0, zL, g0, gL, max_grade, cap)
    if chord is not None:
        return chord
    want = np.minimum(np.maximum(req, line), cap)
    want[0], want[-1] = z0, zL
    step = L / max(len(s) - 1, 1)
    # every curve length from long to the shortest allowed: of those holding the clearance (within 5 cm)
    # the one that rises least above what is needed (a long curve over a short clearance stretch had to
    # be lifted 14 m over the Fremont Bridge's 58 m), else the one falling least short
    best = None
    for kf in (1.0, 0.5, 0.25, 0.12, 0.067):
        z = _curve_try(s, want, cap, z0, zL, g0, gL, step, L, DECK_CURVE_K * kf, iters)
        short = float(np.max(want - z))
        over = float(np.max(z) - np.max(want))
        key = (0, over) if short <= 0.05 else (1, short)
        if best is None or key < best[0]:
            best = (key, z)
    z = best[1].copy()
    return _lift_smooth(s, z, floor)                # the abutments stay on the approach road


def _tents(s, z, grade):
    """max over points i of z_i - grade * |s - s_i|: every requirement reached at `grade` and left at it
    (the deck rides low where nothing is under it, then climbs to what it must clear). Pure."""
    ds = np.diff(s)
    f = np.array(z, np.float64)
    for i in range(1, len(f)):
        f[i] = max(f[i], f[i - 1] - grade * ds[i - 1])
    b = np.array(z, np.float64)
    for i in range(len(b) - 2, -1, -1):
        b[i] = max(b[i], b[i + 1] - grade * ds[i])
    return np.maximum(f, b)


def _curve_try(s, want, cap, z0, zL, g0, gL, step, L, K, iters):
    raise_ = np.zeros(len(s))
    z = want
    for _ in range(iters):
        pts = want + raise_
        pts[0], pts[-1] = z0, zL
        hull = np.minimum(_tents(s, pts, DECK_DESIGN_GRADE), cap)
        gr = np.diff(hull) / np.maximum(np.diff(s), 1e-9)
        # the whole crest's change (close hull corners act as one curve), or an end's
        A = max(float(np.max(gr) - np.min(gr)), abs(gr[0] - g0), abs(gr[-1] - gL))
        W = float(np.clip(K * A, max(DECK_CURVE_MIN, DECK_CURVE_KMIN * A), max(DECK_CURVE_MIN, 0.8 * L)))
        n = max(int(round(W / step)) | 1, 1)
        r = n // 2
        ext = np.r_[z0 - g0 * step * np.arange(r, 0, -1), hull, zL + gL * step * np.arange(1, r + 1)]
        sm = np.convolve(ext, np.ones(n) / n, mode="valid") if r else hull.copy()
        sm = sm + (z0 - sm[0]) + ((zL - sm[-1]) - (z0 - sm[0])) * (s / max(L, 1e-9))
        z = sm
        short = want - z
        short[0] = short[-1] = 0.0
        if short.max() <= 0.02:
            break
        # (not where the grade cap holds want down: no raise reaches it there, and raising it again and again
        # tented a 5 m hump past the cap onto the Vincent Thomas Bridge's span)
        raise_ += np.maximum(short, 0.0)
    return z


def _path_curve(lines, order, ground_fn, crossings, spans, clear, lift, max_grade, ends=(None, None)):
    """curve_profile along one path of parts (order: [(part, reversed)]). ends: per end None (an abutment:
    the ground's height, the approach grade from the ground beyond it) or (z, grade dz/ds arriving) (a
    junction with a part already solved). Returns {part: heights}, the path's polyline (m, 2), its grid s,
    heights z. None if degenerate."""
    pts, off, info = [], 0.0, {}
    for k, rev in order:
        ln = np.asarray(lines[k], np.float64)[:, :2]
        a = np.r_[0.0, np.cumsum(np.hypot(*np.diff(ln, axis=0).T))]
        info[k] = (off, rev, a)
        seq = ln[::-1] if rev else ln
        pts.append(seq if not pts else seq[1:])
        off += a[-1]
    P = np.concatenate(pts)
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    L = S[-1]
    if L < 1.0 or len(P) < 2:
        return None
    n = max(int(math.ceil(L / DECK_CURVE_STEP)), 2)
    s = np.linspace(0.0, L, n + 1)
    xy = np.c_[np.interp(s, S, P[:, 0]), np.interp(s, S, P[:, 1])]

    def to_s(k, arc):
        o, rev, a = info[k]
        return o + (a[-1] - arc if rev else arc)
    t0 = (P[0] - P[1]) / max(np.hypot(*(P[0] - P[1])), 1e-9)
    t1 = (P[-1] - P[-2]) / max(np.hypot(*(P[-1] - P[-2])), 1e-9)
    out_pts = np.array([P[0] + t0 * 12.0, P[-1] + t1 * 12.0])
    gz = np.asarray(ground_fn(np.r_[xy, out_pts]), np.float64)
    g, go = gz[:len(s)], gz[len(s):]
    if ends[0] is None:
        z0, g0 = float(g[0]), float(np.clip((g[0] - go[0]) / 12.0, -APPROACH_GRADE, APPROACH_GRADE))
    else:
        z0, g0 = ends[0]
    if ends[1] is None:
        zL, gL = float(g[-1]), float(np.clip((go[1] - g[-1]) / 12.0, -APPROACH_GRADE, APPROACH_GRADE))
    else:
        zL, gL = ends[1]
    req = g + lift
    junction = np.full(len(s), np.inf)
    for cr in crossings:
        k, arc, zc = cr[:3]
        own = len(cr) > 3 and cr[3] is not None
        cl = cr[3] if own else clear
        if k in info:
            sc = to_s(k, arc)
            # a road by an abutment the deck cannot get AT_GRADE_M over is a junction at grade (the intersection a
            # ramp climbs from: deck_profile_once's rule): no requirement, the deck leaves the road's height
            d_end = min(sc if ends[0] is None else np.inf, L - sc if ends[1] is None else np.inf)
            if not own and d_end <= AT_GRADE_REACH_M and                     min(z0, zL) + DECK_MAX_GRADE * d_end < zc + AT_GRADE_M:
                junction = np.minimum(junction, zc + DECK_MAX_GRADE * np.abs(s - sc))
                continue
            # (upstream's full-headroom corridor, DECK_CLEAR_REACH_M either side, and the curve's 5 cm acceptance
            # taken up front: the corridor came out 4 cm short, test_bridge_clearance)
            m = np.abs(s - sc) <= max(DECK_ROAD_HALF, DECK_CLEAR_REACH_M if not own else 0.0)
            req[m] = np.maximum(req[m], zc + cl + (0.06 if not own else 0.0))
    for k, a0, a1, zmin in spans:
        if k in info:
            x0, x1 = sorted((to_s(k, a0), to_s(k, a1)))
            m = (s >= x0) & (s <= x1)
            req[m] = np.maximum(req[m], zmin)
    z = curve_profile(s, g, req, z0, zL, g0, gL, max_grade, lift, cap=junction)
    out = {}
    for k, rev in order:
        o, r, a = info[k]
        out[k] = np.interp(o + (a[-1] - a if r else a), s, z)
    return out, xy, s, z


def deck_curve(lines, ground_fn, crossings=(), spans=(), clear=None, lift=None, max_grade=None):
    """Deck heights (one array per part) of a bridge chain by curve_profile. A chain of parts in one line is
    solved as one profile; a branched chain (ramps leaving a viaduct) as its longest abutment-to-abutment
    line first, then each remaining branch from the solved deck it leaves (its height and grade there) to
    its own abutment or the deck it rejoins. None when the chain has no abutment (a closed loop). crossings:
    (part, arc m, height under it[, its own clearance]) roads and water under it (held `clear`, or their own
    clearance, over +-DECK_ROAD_HALF); spans: (part, arc from, arc to, min deck height). Pure given ground_fn."""
    clear = DECK_ROAD_CLEAR if clear is None else clear
    lift = DECK_CLEAR if lift is None else lift
    if not lines:
        return None
    args = (ground_fn, crossings, spans, clear, lift, max_grade)
    order = _simple_path(lines)
    if order is not None:
        got = _path_curve(lines, order, *args)
        return None if got is None else [got[0][k] for k in range(len(lines))]
    nodes, edges, adj = _chain_graph(lines)
    # parts not joined at all (a chain also holds the decks crossing it, solved together for the deck-over-deck
    # rule): each joined group on its own (one crossing deck sent a whole interchange to the legacy
    # profile)
    comp = list(range(len(nodes)))

    def find(a):
        while comp[a] != a:
            comp[a] = comp[comp[a]]
            a = comp[a]
        return a
    for a, b, _ in edges:
        comp[find(a)] = find(b)
    groups = {}
    for k, (a, _, _) in enumerate(edges):
        groups.setdefault(find(a), []).append(k)
    if len(groups) > 1:
        out = [None] * len(lines)
        for ks in groups.values():
            idx = {k: i for i, k in enumerate(ks)}
            sub = deck_curve([lines[k] for k in ks], ground_fn,
                             [(idx[cr[0]],) + tuple(cr[1:]) for cr in crossings if cr[0] in idx],
                             [(idx[k], a0, a1, z) for k, a0, a1, z in spans if k in idx], clear, lift, max_grade)
            if sub is None:
                sub = deck_profile_once([lines[k] for k in ks], ground_fn,
                                        [(idx[cr[0]],) + tuple(cr[1:]) for cr in crossings if cr[0] in idx], clear, None, lift)
                if bridge_profile_mode() == "curve" and sub is not None and any(
                        s is None for s in sub):
                    return None
            for k, z in zip(ks, sub):
                out[k] = z
        return out
    deg = np.zeros(len(nodes), int)
    inc = [[] for _ in nodes]
    for k, (a, b, _) in enumerate(edges):
        deg[a] += 1
        deg[b] += 1
        inc[a].append(k)
        inc[b].append(k)
    abut = [i for i in range(len(nodes)) if deg[i] == 1]
    if not abut:
        return None
    out = [None] * len(lines)
    solved = {}                                 # node -> (z, [(unit tangent arriving, grade along it)])

    def walk(start, done_edges, stop):
        """Longest path from start through edges not in done_edges, ending at an abutment or a solved node
        (stop): [(edge, reversed)] (Dijkstra on lengths, the farthest such end)."""
        import heapq
        dist, prev = {start: 0.0}, {}
        q = [(0.0, start)]
        while q:
            d, u = heapq.heappop(q)
            if d > dist.get(u, np.inf):
                continue
            if u != start and stop(u):
                continue
            for k in inc[u]:
                if k in done_edges:
                    continue
                a, b, s = edges[k]
                v = b if u == a else a
                if d + s[-1] < dist.get(v, np.inf):
                    dist[v] = d + s[-1]
                    prev[v] = (u, k)
                    heapq.heappush(q, (d + s[-1], v))
        ends = [v for v in dist if v != start and stop(v)]
        if not ends:
            return None
        v = max(ends, key=lambda x: dist[x])
        path = []
        while v != start:
            u, k = prev[v]
            path.append((k, edges[k][0] != u))
            v = u
        return path[::-1]

    def record(order, s, z, xy):
        """The solved path's nodes: their heights and the tangents / grades arriving there both ways."""
        node_s = 0.0
        seq = []
        for k, rev in order:
            a, b, es = edges[k]
            seq.append((a if not rev else b, node_s))
            node_s += es[-1]
        last_k, last_rev = order[-1]
        seq.append((edges[last_k][1] if not last_rev else edges[last_k][0], node_s))
        gr = np.gradient(z, s)
        tg = np.gradient(xy, s, axis=0)
        for nd, sn in seq:
            j = int(np.clip(np.searchsorted(s, sn), 0, len(s) - 1))
            t = tg[j] / max(np.hypot(*tg[j]), 1e-9)
            zz, lst = solved.get(nd, (float(np.interp(sn, s, z)), []))
            lst += [(t, float(gr[j])), (-t, -float(gr[j]))]
            solved[nd] = (zz, lst)

    def end_of(node, direction):
        """(z, grade arriving) for a path leaving / reaching a solved node in this unit direction."""
        z, lst = solved[node]
        t, gr = max(lst, key=lambda tg: float(np.dot(tg[0], direction)))
        return (z, gr)

    # the trunk: of the abutment-to-abutment paths, the one carrying the highest requirement (the span over the
    # river: solved first, so a branch never pins it low), then the longest. (the Crescent City
    # Connection's river decks were branches of a longer, low line through the approaches and stayed 17 m up)
    need = {}
    for cr in crossings:
        k, zc = cr[0], cr[2]
        cl = cr[3] if len(cr) > 3 and cr[3] is not None else clear
        need[k] = max(need.get(k, -np.inf), zc + cl)
    for k, _, _, zmin in spans:
        need[k] = max(need.get(k, -np.inf), zmin)
    best = None
    for a0 in abut:
        for a1 in abut:
            if a1 <= a0:
                continue
            p = walk(a0, set(), lambda v, a1=a1: v == a1)
            if p is None:
                continue
            L = sum(edges[k][2][-1] for k, _ in p)
            top = max((need.get(k, -np.inf) for k, _ in p), default=-np.inf)
            key = (top if np.isfinite(top) else -1e9, L)
            if best is None or key > best[0]:
                best = (key, p)
    if best is None:
        return None
    done = set()
    todo = [best[1]]
    first = True
    while todo:
        order = todo.pop()
        k0, r0 = order[0]
        start = edges[k0][1] if r0 else edges[k0][0]
        kl, rl = order[-1]
        end = edges[kl][0] if rl else edges[kl][1]
        e0 = e1 = None
        if not first:
            ln0 = np.asarray(lines[k0], np.float64)[:, :2]
            ln0 = ln0[::-1] if r0 else ln0
            d0 = (ln0[1] - ln0[0]) / max(np.hypot(*(ln0[1] - ln0[0])), 1e-9)
            e0 = end_of(start, d0)
            if end in solved:
                lnl = np.asarray(lines[kl], np.float64)[:, :2]
                lnl = lnl[::-1] if rl else lnl
                d1 = (lnl[-1] - lnl[-2]) / max(np.hypot(*(lnl[-1] - lnl[-2])), 1e-9)
                z1, g1 = end_of(end, d1)
                e1 = (z1, g1)
        first = False
        got = _path_curve(lines, order, *args, ends=(e0, e1))
        for k, _ in order:
            done.add(k)
        if got is None:
            continue
        res, xy, s, z = got
        for k, v in res.items():
            out[k] = v
        record(order, s, z, xy)
        if not todo:                            # the next branch: from any solved node with an open edge
            for nd in list(solved):
                if any(k not in done for k in inc[nd]):
                    p = walk(nd, done, lambda v: deg[v] == 1 or v in solved)
                    if p:
                        todo.append(p)
                        break
    if any(o is None for o in out):             # parts not reached (should not happen): the legacy answer
        return None
    return out


DECK_EASE_M = 24.0      # m, the moving average run over each part after the merges (deck_profile, curve mode)


def _ease(lines, zs, ground_fn, lift=None):
    """Each part's heights after _merge_overlaps / the deck-over-deck rounds, run through a DECK_EASE_M moving
    average on a 1 m grid with its end heights kept (a linear correction) and never under the ground + lift:
    blending a part with its neighbour where their surfaces overlap left 2.5-4.3 % grade changes between deck
    points (Steel, Broadway). Pure given ground_fn."""
    lift = DECK_CLEAR if lift is None else lift
    out = []
    for ln, z in zip(lines, zs):
        z = np.asarray(z, np.float64)
        if len(z) < 3 or not np.isfinite(z).all():
            out.append(z)
            continue
        xy = np.asarray(ln, np.float64)[:, :2]
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        L = s[-1]
        n = int(round(DECK_EASE_M))
        if L < 2 * n:
            out.append(z)
            continue
        g = np.arange(0.0, L + 1e-9, 1.0)
        zg = np.interp(g, s, z)
        r = n // 2
        ext = np.r_[2 * zg[0] - zg[r:0:-1], zg, 2 * zg[-1] - zg[-2:-r - 2:-1]]
        sm = np.convolve(ext, np.ones(2 * r + 1) / (2 * r + 1), mode="valid")
        sm = sm + (zg[0] - sm[0]) + ((zg[-1] - sm[-1]) - (zg[0] - sm[0])) * g / L
        zz = np.interp(s, g, sm)
        gz = np.asarray(ground_fn(xy), np.float64) + lift
        zz[0], zz[-1] = z[0], z[-1]
        out.append(_lift_smooth(s, zz, gz))
    return out


LIFT_GRADE = 0.03       # _lift_smooth: a lift over the ground is run out along the deck at this grade ...
LIFT_EASE_M = 40.0      # ... and rounded over this many m
LIFT_END_GRADE = 0.01   # by an abutment the floor rises from the abutment no faster than this


def _lift_smooth(s, z, floor, iters=8):
    """z (heights at arcs s) raised to at least floor between its ends, the lift run out at LIFT_GRADE and rounded
    over LIFT_EASE_M, not stepped: clamping each point to the ground left a 0.6-0.9 m step in the last few metres
    where a deck lands on a bank the DEM shows steep (the Steel and St. Johns bridges' ends: 17-31 % between two deck
    points). The ends keep their heights; whatever the rounding leaves short is clamped last. Pure."""
    s = np.asarray(s, np.float64)
    z = np.array(z, np.float64)
    floor = np.asarray(floor, np.float64)
    if len(z) < 3 or s[-1] <= 0:
        z[1:-1] = np.maximum(z[1:-1], floor[1:-1])
        return z
    g = np.arange(0.0, s[-1] + 1e-9, 1.0)
    if g[-1] < s[-1]:
        g = np.r_[g, s[-1]]
    zg = np.interp(g, s, z)
    # within LIFT_EASE_M / 2 of an abutment the floor is no higher than the abutment allows at LIFT_END_GRADE (a bank
    # the DEM shows over the road's end: the deck lands on the road, not on the bank's top)
    d0, d1 = g, g[-1] - g
    cap = np.minimum(np.where(d0 < LIFT_EASE_M / 2, z[0] + LIFT_END_GRADE * d0, np.inf),
                     np.where(d1 < LIFT_EASE_M / 2, z[-1] + LIFT_END_GRADE * d1, np.inf))
    fl = np.interp(g, s, floor)
    fg = np.maximum(np.minimum(fl, cap), fl - DECK_CLEAR)     # (never under the ground itself)
    r = int(LIFT_EASE_M // 2)
    inner = np.ones(len(g), bool)
    inner[0] = inner[-1] = False
    if not (fg[inner] > zg[inner] + 0.01).any():
        out = np.array(z)
        out[1:-1] = np.maximum(out[1:-1], np.interp(s, g, fg)[1:-1])
        return out
    # the lift (how far the deck is short of its floor) runs out, not the floor's height: a deck climbing faster than
    # LIFT_GRADE never met a height run out from a 4 cm shortfall by one of its abutments, the cone stood over the deck
    # all the way back to the other abutment, kept at its road's height (a 320 m valley bridge climbing 3.9 %: 3.3 m up
    # over its first 14 m, 30 % at its steepest)
    want = np.where(inner, np.maximum(fg - zg, 0.0), 0.0)
    zz = zg
    for _ in range(iters):
        cone = np.maximum(_tents(g, np.where(want > 0.0, want, -np.inf), LIFT_GRADE), 0.0)
        ext = np.r_[np.full(r, cone[0]), cone, np.full(r, cone[-1])]
        zz = zg + np.convolve(ext, np.ones(2 * r + 1) / (2 * r + 1), mode="valid")
        zz[0], zz[-1] = zg[0], zg[-1]
        short = np.where(inner, fg - zz, 0.0)
        if short.max() <= 0.01:
            break
        want = want + np.maximum(short, 0.0)
    zg = zz
    out = np.interp(s, g, zg)
    out[0], out[-1] = z[0], z[-1]
    ff = np.interp(s, g, fg)
    out[1:-1] = np.maximum(out[1:-1], ff[1:-1])
    return out


DECK_SIGMA = 12.0       # m, deck profile smoothing (at least) ...
DECK_SIGMA_SHARE = 25.0  # ... a 25th of the part's length ...
DECK_SIGMA_MAX = 40.0   # ... at most


def _curve_deck(s, z, floor, cap):
    """The deck profile z (at arcs s) projected onto its bounds [min(floor, cap), cap] and a change of grade of at most
    1/300 per metre (a 300 m vertical radius), its ends pinned; z itself when the map's constraints cannot all hold.
    Only bridge decks use this (wyo-backroads: I-80 over Otto Road's 6 % crests). Pure."""
    import fast
    fast.require(83, "curve_deck")      # (Dykstra's projections, up to 2000 rounds: ~170 ms a deck in Python)
    f64 = np.float64
    return fast._ef.curve_deck(np.ascontiguousarray(s, f64), np.ascontiguousarray(z, f64),
                               np.ascontiguousarray(floor, f64), np.ascontiguousarray(cap, f64))


def _no_sag(s, z):
    """The upper concave hull of the profile (s, z) at s: every dip between two higher points filled with the
    straight grade between them. Pure."""
    hull = []
    for p in zip(s, z):
        while len(hull) >= 2:
            (x1, y1), (x2, y2) = hull[-2], hull[-1]
            if (x2 - x1) * (p[1] - y1) - (y2 - y1) * (p[0] - x1) >= 0:      # hull[-1] under the chord: dropped
                hull.pop()
            else:
                break
        hull.append(p)
    hx, hy = zip(*hull)
    return np.interp(s, hx, hy)


def _dedupe(xy, tol=0.5):
    """A polyline without points closer than tol m to the previous one (ends kept). Pure."""
    import fast
    fast.require(66, "dedupe_polyline")     # (the Rust loop: 14-21 CPU-s a Deck teleport in each road process)
    xy = np.asarray(xy, np.float64)
    return xy[fast._ef.dedupe_polyline(xy, float(tol))]


def _ground_envelope(s, g, grade, curve=0.0):
    """The least profile over the ground heights g (at arcs s) that falls from each no faster than grade * d + curve *
    d^2 at d m from it: max_j g_j - grade |s - s_j| - curve (s - s_j)^2. Pure."""
    s, g = np.asarray(s, np.float64), np.asarray(g, np.float64)
    out = np.full(len(s), -np.inf)
    for i0 in range(0, len(s), 512):        # (in blocks: a long chain's (n, n) would be large)
        d = np.abs(s[None, :] - s[i0:i0 + 512, None])
        out = np.maximum(out, (g[i0:i0 + 512, None] - grade * d - curve * d * d).max(axis=0))
    return out


def _smooth_pinned(z, step, sigma):
    """Gaussian smoothing that keeps both end values and the trend at the ends (the profile is
    point-reflected about each end: plain mirroring pulled a hump's height into its pinned ends and
    made 15 % steps there). Pure."""
    z = np.asarray(z, np.float64)
    r = int(math.ceil(3 * sigma / step))
    r = min(r, len(z) - 1)
    if r < 1:
        return z.copy()
    k = np.exp(-0.5 * (np.arange(-r, r + 1) * step / sigma) ** 2)
    k /= k.sum()
    pad = np.r_[2 * z[0] - z[r:0:-1], z, 2 * z[-1] - z[-2:-r - 2:-1]]
    out = np.convolve(pad, k, mode="valid")
    out[0], out[-1] = z[0], z[-1]
    return out


PIN_M = 1.0             # m: a ground road's end this near a joint of decks makes the joint an abutment (_pin) ...
PIN_ROAD_M = 20.0       # ... a road at least this long (a shorter piece between decks is a gap in the map's bridge tags)
PIN_SPLIT_M = 0.7      # m between the ends of the parts at a pinned joint as _unpinned parts them (> _EndJoin's 0.5)


def _unpinned(lines, ground_fn, pins):
    """(lines, ground_fn) for deck_curve with each joint at pins (_pin: a ground road goes on from it) made an end of
    each part there: their ends moved PIN_SPLIT_M apart (one more step east each), ground_fn giving the ground at the
    joint itself there. deck_curve's graph joined them, the path went through the joint, and the ground road went on
    from it 8.5 m under the deck (Charles Street over I-83 in Baltimore: the AI crashed at the step). The
    heights stay one per point of each line. Pure."""
    if pins is None or not len(pins) or len(lines) < 2:
        return lines, ground_fn
    nodes, edges, _adj = _chain_graph(lines)
    deg = np.zeros(len(nodes), int)
    for a, b, _ in edges:
        deg[a] += 1
        deg[b] += 1
    pinned = _pin(nodes, deg, pins)
    split = [i for i in range(len(nodes)) if deg[i] > 1 and pinned[i] == 1]
    if not split:
        return lines, ground_fn
    out = [np.array(ln, np.float64, copy=True) for ln in lines]
    moved = []                      # (moved point, the joint)
    for nd in split:
        q = np.asarray(nodes[nd], np.float64)
        n = 0
        for k, (a, b, _s) in enumerate(edges):
            for at, end in ((0, a), (-1, b)):
                if end != nd:
                    continue
                n += 1
                if n == 1:
                    continue        # (the first part keeps the joint's point)
                out[k][at, 0] = q[0] + PIN_SPLIT_M * (n - 1)
                out[k][at, 1] = q[1]
                moved.append((out[k][at, :2].copy(), q))
    if not moved:
        return lines, ground_fn
    M = np.array([m for m, _ in moved], np.float64)
    Q = np.array([q for _, q in moved], np.float64)

    def ground_at(xy):
        xy = np.asarray(xy, np.float64).reshape(-1, 2)
        hit = np.full(len(xy), -1)
        for j, m in enumerate(M):
            hit[(np.abs(xy[:, 0] - m[0]) < 1e-6) & (np.abs(xy[:, 1] - m[1]) < 1e-6)] = j
        if not (hit >= 0).any():
            return ground_fn(xy)
        q = np.where((hit >= 0)[:, None], Q[np.maximum(hit, 0)], xy)
        return ground_fn(q)
    return out, ground_at


def _pin(nodes, deg, pins):
    """deg with the joints at pins made ends (1): abutments, held at the ground. Two motorway decks met at a node the
    motorway went on from on the ground; taken for a joint of decks it stood 3.9 m over the road it ran on to, a wall
    (the Four Level Interchange, Los Angeles). Pure."""
    if pins is None or not len(pins):
        return deg
    P = np.asarray(pins, np.float64).reshape(-1, 2)
    deg = deg.copy()
    for i, nd in enumerate(nodes):
        if deg[i] > 1 and (np.hypot(P[:, 0] - nd[0], P[:, 1] - nd[1]) < PIN_M).any():
            deg[i] = 1
    return deg


def deck_heights(lines, end_z, pins=None):
    """Deck heights of chained bridge parts. lines: polylines (k, 2) in metres (one per bridge part);
    parts sharing an end point (within 0.5 m) are joined. end_z(xy (m, 2)) -> heights of the ground at
    the abutments (chain ends: points used by one part only). A joint's height is the abutments' heights weighted by
    1 / their distance along the chain, and each part runs straight between its two ends (between two abutments: a
    straight line). Weighting every point, a part from an abutment to a joint of three parts rose ~16 % off its
    abutment and flattened toward the joint, 38 % once smoothed: US-24's deck near Buena Vista CO, 1.1 m up in its
    first 3 m. Returns one height array per line. Pure given end_z."""
    if not lines:
        return []
    edges, ez, dist = _end_dists(lines, end_z, pins)
    out = []

    def weighted(dk):
        num, den = np.zeros(len(dk[0])), np.zeros(len(dk[0]))
        for k, d in enumerate(dk):
            ok = np.isfinite(d)
            w = np.where(ok, 1.0 / np.maximum(d, 1e-6), 0.0)
            num += w * np.where(ok, ez[k], 0.0)
            den += w
        return np.where(den > 0, num / np.maximum(den, 1e-12), np.nan)
    for a, b, s in edges:
        if not dist:                            # a closed loop: no abutment known
            out.append(np.full(len(s), np.nan))
            continue
        za, zb = weighted([np.array([d[a], d[b]], np.float64) for d in dist])
        if np.isfinite(za) and np.isfinite(zb) and s[-1] > 0:
            out.append(za + (zb - za) * (s / s[-1]))
        else:
            out.append(weighted([np.minimum(d[a] + s, d[b] + (s[-1] - s)) for d in dist]))
    return out


def _end_dists(lines, end_z, pins=None):
    """The chain of lines (joined at end points within 0.5 m): its edges (start node, end node, arc (k,)),
    the heights end_z gives at its ends (points of one line only) and per end the distance along the chain
    to every node. Pure given end_z."""
    join, nodes = _EndJoin(), []

    def node(p):
        k = join(p)                                                 # 0.5 m
        if k == len(nodes):
            nodes.append(np.asarray(p[:2], np.float64))
        return k
    edges = []
    for ln in lines:
        seg = np.hypot(*np.diff(ln[:, :2], axis=0).T)
        s = np.r_[0.0, np.cumsum(seg)]
        edges.append((node(ln[0]), node(ln[-1]), s))
    deg = np.zeros(len(nodes), int)
    adj = [[] for _ in nodes]
    for a, b, s in edges:
        deg[a] += 1
        deg[b] += 1
        adj[a].append((b, s[-1]))
        adj[b].append((a, s[-1]))
    deg = _pin(nodes, deg, pins)
    ends = [i for i in range(len(nodes)) if deg[i] == 1]
    ez = np.asarray(end_z(np.array([nodes[i] for i in ends]).reshape(-1, 2)), np.float64) if ends else np.zeros(0)
    import heapq
    dist = []                                   # per end: distance along the chain to every node
    for e in ends:
        d = np.full(len(nodes), np.inf)
        d[e] = 0.0
        q = [(0.0, e)]
        while q:
            dd, u = heapq.heappop(q)
            if dd > d[u]:
                continue
            for v, w in adj[u]:
                if dd + w < d[v]:
                    d[v] = dd + w
                    heapq.heappush(q, (dd + w, v))
        dist.append(d)
    return edges, ez, dist


TUNNEL_COVER = 8.0      # m from the floor up to the ground over it wanted inside a tunnel (the tube's 6.5 m and rock)
TUNNEL_GRADE = 0.05     # a tunnel floor falls no steeper than this from a portal
TUNNEL_STEP = 4.0       # m between tunnel profile points
SECTION_MIN_M = 8.0     # m: a tunnel's covered sections and the open gaps between them at least this long
# A covered section (a low arch or a tube) goes on along the tunnel until every ground road crossing over it within
# TUNNEL_ROAD_REACH_M of its ends is covered, its carriageway and TUNNEL_ROAD_CLEAR_M past it (along the tunnel: / the
# sine of the crossing angle, at least TUNNEL_ROAD_MIN_SIN). On lidar each carriageway of a divided motorway over an
# underpass is its own embankment: the arch under one was 8 m long under 13 m of lanes, its mouths and terrain holes
# in them (the A-7 near Málaga).
TUNNEL_ROAD_CLEAR_M = 2.0
TUNNEL_ROAD_REACH_M = 15.0
# Under a road's bridge deck an open tunnel section plans no ground (its width and TUNNEL_ROAD_CLEAR_M past it), for
# the grading only. Lidar has the bridges taken out, so a tunnel under a bridgehead can be open all along there; its
# open section's plan would lower the ground to its floor under the bridge's approach and the deck's end with it (a
# cliff where the bridge begins). Covered, the ground would stay raw there and the approach could not meet the deck;
# with no plan the roads grade it as anywhere. The meshes keep drawing the open road under the deck.
UNDER_DECK = -1         # cover_decks' kind: an open section's samples under a deck (grading._tunnel_sections drops them)


def cover_decks(xy, s, kinds, lines, halves):
    """kinds (tunnel_sections') with the open samples under a deck crossing the tunnel (lines
    (k, 2) in xy's frame, half widths; at TUNNEL_ROAD_MIN_SIN or more) UNDER_DECK: within the deck's half width over
    the crossing's sine plus TUNNEL_ROAD_CLEAR_M of the crossing along the tunnel. Pure."""
    kinds = np.array(kinds, np.int64)
    if not lines or len(xy) < 2:
        return kinds
    xy = np.asarray(xy, np.float64)[:, :2]
    s = np.asarray(s, np.float64)
    A, D = xy[:-1], np.diff(xy, axis=0)
    LD = np.maximum(np.hypot(D[:, 0], D[:, 1]), 1e-9)
    for ln, hw in zip(lines, halves):
        ln = np.asarray(ln, np.float64)[:, :2]
        for a, b in zip(ln[:-1], ln[1:]):
            r = b - a
            lr = float(np.hypot(*r))
            if lr < 1e-9:
                continue
            den = D[:, 0] * r[1] - D[:, 1] * r[0]
            ok = np.abs(den) > 1e-12
            den = np.where(ok, den, 1.0)
            q = a - A
            t = (q[:, 0] * r[1] - q[:, 1] * r[0]) / den        # along the tunnel's segment
            u = (q[:, 0] * D[:, 1] - q[:, 1] * D[:, 0]) / den  # along the deck's segment
            sin = np.abs(den) / (LD * lr)
            for i in np.flatnonzero(ok & (t >= 0) & (t <= 1) & (u >= 0) & (u <= 1) & (sin >= TUNNEL_ROAD_MIN_SIN)):
                sc = s[i] + t[i] * (s[i + 1] - s[i])
                kinds[(np.abs(s - sc) <= float(hw) / sin[i] + TUNNEL_ROAD_CLEAR_M) & (kinds == 0)] = UNDER_DECK
    return kinds


PORTAL_SHALLOW_COVER_M = 1.5    # m: a major road's open end run with at least this much ground over its floor is covered


def portal_cover(kinds, cover, spec):
    """kinds with a major road's (CONCRETE_WALL_CLASSES) open run at either end of its tunnel covered (a low arch, in
    concrete: roadmesh) where the median ground over its floor is PORTAL_SHALLOW_COVER_M or more: the map's portal is a
    cut-and-cover box under shallow ground there (the Gotthard road tunnel's north portal under the meadow at
    Goeschenen stood 90 m further in, an open cut before it). Park roads keep their open cuts (Central
    Park's transverses). The meshes (TunnelProfiles) and the grading both."""
    kinds = np.array(kinds, np.int64)
    if spec is None or spec.cls not in CONCRETE_WALL_CLASSES or not (kinds > 0).any():
        return kinds
    cover = np.asarray(cover, np.float64)
    n = len(kinds)
    for rng in (range(n), range(n - 1, -1, -1)):
        run = []
        for q in rng:
            if kinds[q] != 0:
                break
            run.append(q)
        if run and len(run) < n and np.isfinite(cover[run]).any() and \
                float(np.nanmedian(cover[run])) >= PORTAL_SHALLOW_COVER_M:
            kinds[run] = 1
    return kinds


def cover_roads(xy, s, kinds, lines, halves):
    """kinds (tunnel_sections') with each covered section carried on until the ground roads crossing over it (lines
    (k, 2) in xy's frame, carriageway half widths) are covered, TUNNEL_ROAD_*: earthfast.tunnel_cover_roads. The
    road meshes (TunnelProfiles) and the grading (grading._tunnel_sections) both: an open section the grading did
    not know of cut its trench through the A-7's lanes near Malaga."""
    kinds = np.asarray(kinds, np.int64)
    if not lines or not (kinds > 0).any() or len(xy) < 2:
        return kinds
    import fast
    fast.require(95, "tunnel_cover_roads")
    pts = np.ascontiguousarray(np.concatenate(lines))
    starts = np.concatenate([[0], np.cumsum([len(ln) for ln in lines])]).astype(np.int64)
    return np.asarray(fast._ef.tunnel_cover_roads(
        np.ascontiguousarray(np.asarray(xy, np.float64)[:, :2]), np.ascontiguousarray(s, np.float64),
        np.ascontiguousarray(kinds), pts, starts, np.asarray(halves, np.float64), TUNNEL_ROAD_CLEAR_M,
        TUNNEL_ROAD_MIN_SIN, TUNNEL_ROAD_REACH_M, SECTION_MIN_M), np.int64)


def tunnel_profile(lines, ground_fn):
    """Floor heights of chained tunnel parts (as deck_heights: polylines (k, 2), joined at their ends; the chain's
    ends are the portals, at the ground's height there). Straight between the portals, but at least TUNNEL_COVER
    under the ground over it (an underwater tunnel dips under the bed: Fort McHenry's portals are on land), falling
    no steeper than TUNNEL_GRADE from a portal; smoothed. One array per line (NaN for a closed loop). Pure given
    ground_fn(xy (m, 2)) -> heights."""
    if not lines:
        return []
    straight = deck_heights(lines, ground_fn)
    edges, ez, dist = _end_dists(lines, ground_fn)
    allxy = np.concatenate([np.asarray(ln[:, :2], np.float64) for ln in lines])
    gz = np.asarray(ground_fn(allxy), np.float64)
    out, k = [], 0
    import grading
    for (a, b, s), z0 in zip(edges, straight):
        g = gz[k:k + len(s)]
        k += len(s)
        if not dist or not np.isfinite(z0).all():
            out.append(np.full(len(s), np.nan))
            continue
        # under TUNNEL_COVER of ground where the straight line has less (a hollow, a low hill), reached at no more than
        # TUNNEL_GRADE from the portals (a mountain's steep portal face gives the cover within metres)
        z = np.minimum(z0, g - TUNNEL_COVER)
        low = np.full(len(s), -np.inf)
        for e, d in enumerate(dist):
            dk = np.minimum(d[a] + s, d[b] + (s[-1] - s))
            low = np.maximum(low, np.where(np.isfinite(dk), ez[e] - TUNNEL_GRADE * dk, -np.inf))
        z = np.maximum(z, low)
        if len(z) > 3:          # (the ends' trend kept: smoothed then pinned, a floor bent up beside a portal)
            z = _smooth_pinned(z, TUNNEL_STEP, grading.SIGMA_M)
        out.append(z)
    return out


def _deck_crossings(lines):
    """(i, j, arc on i, arc on j) where deck parts i < j cross (not at their end points). Pure."""
    import fast
    if not lines:
        return []
    fast.require(0, "deck_crossings")
    pts = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    starts = np.r_[0, np.cumsum([len(p) for p in pts])].astype(np.int64)
    return fast._ef.deck_crossings(np.ascontiguousarray(np.vstack(pts)), starts)
