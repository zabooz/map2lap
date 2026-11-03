"""grade_points: the heights at points from the plans in reach (earthfast)."""
import numpy as np

from .settings import (
    ABUT_NEAR_M, BLEND_R, BUCKET, CHAIN_JOIN_M, CORE_FADE_M, SEP_FROM_M, SEP_FULL_M, SEP_ON, SHARP_STEP_M, SIDE_FADE_M,
    SLOPE_RUN, T_MAX, T_MIN, VERTEX_STEP, WALL_AHEAD_M, WALL_CUT_M, WALL_FLAT_M, WALL_T_M, YIELD_FADE_M,
    YIELD_GATE_FROM_M, YIELD_GATE_TO_M, YIELD_NEAR_M
)
from .profiles import UNDER_DECK_GRADE_M, UNDER_DECK_MIN_M


def _end_onward(p, e):
    """Plan p's end e (0: first, 1: last) as the road's, before its way on under its deck (Plan.under): (the end's point
    (2,), unit direction out of the plan past it, height, grade along that direction over UNDER_DECK_GRADE_M, cross slope
    toward that direction's left), or None for a plan too short. Pure."""
    xy = np.asarray(p.xy, np.float64)[:, :2]
    z = np.asarray(p.z, np.float64)
    bank = getattr(p, "bank", None)
    k = (1 if getattr(p, "under", (False, False))[0] else 0) if e == 0 else \
        (len(xy) - 2 if getattr(p, "under", (False, False))[1] else len(xy) - 1)
    line, zl = (xy[k:], z[k:]) if e == 0 else (xy[k::-1], z[k::-1])     # (from the end into the plan)
    if len(line) < 2:
        return None
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]
    if s[-1] < 1e-9:
        return None
    back = min(UNDER_DECK_GRADE_M, float(s[-1]))
    q = np.array([np.interp(back, s, line[:, 0]), np.interp(back, s, line[:, 1])])
    u = (line[0] - q) / max(float(np.hypot(*(line[0] - q))), 1e-9)
    b = 0.0 if bank is None else float(np.asarray(bank, np.float64)[k])
    return line[0], u, float(zl[0]), (float(zl[0]) - float(np.interp(back, s, zl))) / back, b if e == 1 else -b


# The grading blends every segment within reach, nearest point of each: in a road's middle those lie on both sides and
# on an even grade they cancel out, the ground on the road's line. At an end onto a bridge they lie on one side only and
# pull the ground off the line: on an 8 % road 12 cm over its last 4 m, and the deck's end, which reads that ground, with
# it (too low at a bridge's lower end, too high at its upper: a mound or a trench across the whole carriageway at both
# joints, in proportion to the grade, on the road to Heiligenblut). The road and the deck meet at one point of the map at
# one height. So the road's line goes on past such an end, at its grade, for the blend alone: both sides are there again
# up to the joint, as in the road's middle, and the road's profile is left to do what it does everywhere else. It counts
# for the points behind the end and one terrain cell past it (Plan.under: UNDER_DECK_MIN_M): the cell across the joint
# has a corner past the end, and blended one-sided that corner sank the road's last 1.5 m by 10 cm. Further on the ground
# is the deck's end's (Plan.under, Plan.beyond).
PAST_ON_M = 0.01    # m past an end with nothing under its deck it still counts: a deck's end on the map's same point


def _past_segments(p):
    """Per end of Plan p onto a bridge (Plan.abut) the road's line going on past it as far as the blend reaches (half
    width + T_MAX): (a (m, 2), b (m, 2), za (m,), zb (m,), cross slope, past (m,): how far past each segment's start,
    back along the road, a point must lie to count), its vertices VERTEX_STEP apart. The segment under the deck
    (Plan.under) stands for the first of them. Each runs away from the end. Pure."""
    out = []
    for e in (0, 1):
        if not getattr(p, "abut", (False, False))[e]:
            continue
        got = _end_onward(p, e)
        if got is None:
            continue
        end, u, zp, g, b = got
        under = getattr(p, "under", (False, False))[e]
        d = np.arange(VERTEX_STEP if under else 0.0, p.half + T_MAX + VERTEX_STEP, VERTEX_STEP)
        if len(d) < 2:
            continue
        pts = end[None] + d[:, None] * u[None]
        zs = zp + g * d
        out.append((pts[:-1], pts[1:], zs[:-1], zs[1:], b, d[:-1] - (UNDER_DECK_MIN_M if under else PAST_ON_M)))
    return out


def _yield_strength(plans, box, nseg):
    """Per segment of plans (PlanPack's rows, with their boxes and segment counts) how much it gives
    way (uint8, 0 none to 255 fully): its plan's segments within YIELD_NEAR_M of an end that gives way (Plan.free), by
    how close that end comes to the height of the widest other road it lies on there (YIELD_GATE_*)."""
    f64 = np.float64
    out = np.zeros(int(np.sum(nseg)), f64)
    s0 = np.r_[0, np.cumsum(nseg)]
    for k, p in enumerate(plans):
        fr = getattr(p, "free", (False, False))
        if not (fr[0] or fr[1]):
            continue
        xy = np.asarray(p.xy, f64)[:, :2]
        arc = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        for end in (0, 1):
            if not fr[end]:
                continue
            q, zq = xy[-1 if end else 0], float(p.z[-1 if end else 0])
            best = None
            hit = (box[:, 0] <= q[0]) & (box[:, 2] >= q[0]) & (box[:, 1] <= q[1]) & (box[:, 3] >= q[1])
            for o in np.flatnonzero(hit):
                op = plans[o]
                if op.rid == p.rid:
                    continue
                oxy = np.asarray(op.xy, f64)[:, :2]
                a, ab = oxy[:-1], np.diff(oxy, axis=0)
                t = np.clip(((q - a) * ab).sum(axis=1) / np.maximum((ab * ab).sum(axis=1), 1e-12), 0.0, 1.0)
                d = np.hypot(*(a + t[:, None] * ab - q).T)
                i = int(np.argmin(d))
                if d[i] < CHAIN_JOIN_M and (best is None or op.road_half > best[0]):
                    best = (op.road_half, float(op.z[i] + (op.z[i + 1] - op.z[i]) * t[i]))
            if best is None:
                continue
            u = min(1.0, max(0.0, (abs(zq - best[1]) - YIELD_GATE_FROM_M) / (YIELD_GATE_TO_M - YIELD_GATE_FROM_M)))
            gate = 1.0 - u * u * (3.0 - 2.0 * u)
            near = arc[:-1] < YIELD_NEAR_M if end == 0 else arc[-1] - arc[1:] < YIELD_NEAR_M
            seg = out[s0[k]:s0[k + 1]]
            seg[near] = np.maximum(seg[near], gate)
    return np.round(out * 255.0).astype(np.uint8)


# A narrower road's edge never pulls a wider road's carriageway: past its own carriageway it gives way on the wider
# one's as a junction's end does (YIELD_*), its weight back over YIELD_FADE_M past that carriageway's edge, whatever
# their heights (the native loop, bw). Blended as equals, a driveway running along a secondary's edge 1-1.4 m under it
# pulled the secondary's near lane 0.5-0.7 m down. On its own carriageway, where the two overlap, it gives way only
# where they lie apart in height (BESIDE_LEVEL_*): a merging side road or a motorway's two carriageways side by side
# lie within a few dm and blend as equals (giving way there lifted the narrower one's lanes 0.5 m to the wider one's
# height over a few metres, a jump); a driveway mapped onto a secondary's carriageway, its profile 1.4-1.6 m under it
# where it really leads down, pulled the secondary's line 0.3 m down onto its bridge (a 23 cm step). A tunnel's own
# plans (Plan.tunnel) lie at another level by the map: neither gives way to the other (a bridge's far carriageway over
# a wider tunnel 5.6 m under its west end sank 3-4.6 m to it). Within its blend's reach of a node it shares with the
# wider road (an end of one on the other's line: a junction) it blends as an equal: there the roads meet at one height,
# and the ends that run onto another road give way by YIELD_*. Giving way there too, a primary going on from a trunk's
# end dropped out on the trunk's carriageway (a round cap reaching past its end over the junction) and on a wider side
# road's joining at that node: the side road's lanes there no longer came down to the primary, a 10 cm hump 6 m from
# the node, 3.5 G at 100 km/h.
BESIDE_WIDER_M = 0.5        # m: the other road's carriageway this much wider (half width) at least
BESIDE_LEVEL_FROM_M = 0.5   # m apart: on its own carriageway it gives way from this ...
BESIDE_LEVEL_TO_M = 1.0     # ... and fully from this
BESIDE_STEP_M = 1.0         # m between the narrow road's samples


def _beside_strength(plans, box, nseg):
    """Per segment of plans (PlanPack's rows, with their boxes and segment counts) whether it lies within its blend's
    reach of a wider road's carriageway (another rid, neither a tunnel's: BESIDE_*; uint8, 0 or 255)."""
    f64 = np.float64
    out = np.zeros(int(np.sum(nseg)), f64)
    s0 = np.r_[0, np.cumsum(nseg)]
    rh = np.array([getattr(p, "road_half", p.half) for p in plans], f64)
    tun = np.array([getattr(p, "tunnel", False) for p in plans], bool)
    for k, p in enumerate(plans):
        if tun[k]:
            continue
        wider = np.flatnonzero(~tun & (rh >= rh[k] + BESIDE_WIDER_M) & (box[:, 0] <= box[k, 2]) & (box[:, 2] >= box[k, 0])
                               & (box[:, 1] <= box[k, 3]) & (box[:, 3] >= box[k, 1]))
        wider = [o for o in wider if plans[o].rid != p.rid]
        if not wider:
            continue
        xy = np.asarray(p.xy, f64)[:, :2]
        arc = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        t = np.unique(np.r_[np.arange(0.0, arc[-1], BESIDE_STEP_M), arc[-1]])
        q = np.c_[np.interp(t, arc, xy[:, 0]), np.interp(t, arc, xy[:, 1])]
        qseg = np.clip(np.searchsorted(arc, t, side="right") - 1, 0, len(xy) - 2)    # (each sample's segment)
        near = np.zeros(len(t), bool)
        node = np.zeros(len(t), bool)
        for o in wider:
            op = plans[o]
            oxy = np.asarray(op.xy, f64)[:, :2]
            a, ab = oxy[:-1], np.diff(oxy, axis=0)
            l2 = np.maximum((ab * ab).sum(1), 1e-12)
            u = np.clip(((q[:, None, :] - a[None]) * ab[None]).sum(2) / l2[None], 0.0, 1.0)     # (samples, segments)
            d = np.hypot(*(a[None] + u[..., None] * ab[None] - q[:, None, :]).transpose(2, 0, 1))
            # (within reach: the narrow road's blend (its half and T_MAX) touches the wider one's carriageway)
            reach = rh[o] + p.half + T_MAX
            near |= d.min(axis=1) < reach
            for s in _shared_nodes(p, op):              # (a junction with it: blended as equals there)
                node |= np.abs(t - s) < reach
        near &= ~node
        if near.any():
            out[s0[k] + np.unique(qseg[near])] = 1.0
    return np.round(out * 255.0).astype(np.uint8)


def _shared_nodes(p, q):
    """Arc positions (m from p's first point) of the nodes Plans p and q share: p's ends within CHAIN_JOIN_M of q's
    line, q's ends within CHAIN_JOIN_M of p's line. Pure."""
    pxy, qxy = np.asarray(p.xy, np.float64)[:, :2], np.asarray(q.xy, np.float64)[:, :2]
    if len(pxy) < 2 or len(qxy) < 2:
        return []

    def on(line, pt):
        """(distance, arc position) of the point of line nearest pt."""
        a, ab = line[:-1], np.diff(line, axis=0)
        l2 = np.maximum((ab * ab).sum(1), 1e-12)
        t = np.clip(((pt - a) * ab).sum(1) / l2, 0.0, 1.0)
        d = np.hypot(*(a + t[:, None] * ab - pt).T)
        i = int(np.argmin(d))
        return float(d[i]), float(np.sqrt(l2[:i]).sum() + np.sqrt(l2[i]) * t[i])

    length = float(np.hypot(*np.diff(pxy, axis=0).T).sum())
    out = [s for s, pt in ((0.0, pxy[0]), (length, pxy[-1])) if on(qxy, pt)[0] < CHAIN_JOIN_M]
    out += [s for d, s in (on(pxy, qxy[0]), on(pxy, qxy[-1])) if d < CHAIN_JOIN_M]
    return out


def grade_points(px, py, base, plans, lift=0.0):
    """base at the points (px, py) graded under the plans (see the module doc; a list or a PlanPack of them), by the
    Rust loop (native/earthfast grade_points: a Python loop per segment was the server's largest CPU cost while driving,
   ). Pure."""
    px = np.asarray(px, np.float64)
    py = np.asarray(py, np.float64)
    base = np.asarray(base, np.float64)
    out = base.copy()
    if not len(px):
        return out
    pack = plans if isinstance(plans, PlanPack) else PlanPack(plans)
    # every segment of the plans near the points: ends, end heights, reach (core half width + T_MAX)
    got = pack.near(px.min(), py.min(), px.max(), py.max(), with_yield=True)
    if got is None:
        return out
    A, B, ZA, ZB, H, RH, RID, AB, CUT, BA, BB, YL, BW, TUN, PAST = got
    import fast
    fast.require(84, "grade_points")         # (the Rust loop: native/earthfast; its banked curves: 84)
    f64 = np.float64
    extra = {}
    if YL.any() or BW.any():                # (the junctions' and beside roads' give way, our own earthfast build)
        if getattr(fast._ef, "AC_EXPORT_YIELD", 0) < 4:
            raise fast.NativeMissing("grade_points' junction rule needs our earthfast build (tools/build_native.py)")
        extra = {"yl": np.ascontiguousarray(YL, np.uint8), "yield_fade": float(YIELD_FADE_M),
                 "bw": np.ascontiguousarray(BW, np.uint8), "beside_wider": float(BESIDE_WIDER_M),
                 "beside_from": float(BESIDE_LEVEL_FROM_M), "beside_to": float(BESIDE_LEVEL_TO_M),
                 "tun": np.ascontiguousarray(TUN, np.uint8)}
    if np.isfinite(PAST).any():             # (a road's line going on past its end onto a bridge: _past_segments)
        if getattr(fast._ef, "AC_EXPORT_PAST", 0) < 1:
            raise fast.NativeMissing("grade_points' road ends onto a bridge need our earthfast build "
                                     "(tools/build_native.py)")
        extra["past"] = np.ascontiguousarray(PAST, f64)
    return fast._ef.grade_points(np.ascontiguousarray(px, f64), np.ascontiguousarray(py, f64),
                                 np.ascontiguousarray(base, f64), A, B, ZA, ZB, H, RH, RID, AB, CUT, BA, BB, float(lift),
                                 float(SLOPE_RUN), float(T_MIN), float(T_MAX), float(BLEND_R), float(BUCKET),
                                 float(WALL_CUT_M), float(WALL_T_M), float(WALL_FLAT_M), float(WALL_AHEAD_M),
                                 bool(SEP_ON), float(SEP_FROM_M), float(SEP_FULL_M), float(CORE_FADE_M),
                                 float(SIDE_FADE_M), float(SHARP_STEP_M), **extra)


class PlanPack:
    """Plans (a list, in grade_points' order) as grade_points takes them: every segment's arrays concatenated once, with
    each plan's box; a call keeps the segments of the plans whose boxes meet its points', in the same order (built per
    call, the plans' Python loop cost a Canton tile set ~1 s)."""

    def __init__(self, plans):
        self.without = {}       # (frozenset of plan numbers -> the pack of the others: regrade_past_ends)
        rows = [(k, p) for k, p in enumerate(plans) if len(p.xy) >= 2]
        self.n = len(rows)
        if not self.n:
            return
        f64 = np.float64
        npts = np.array([len(p.xy) for _k, p in rows], np.int64)
        nseg = npts - 1
        xy = np.concatenate([np.asarray(p.xy, f64)[:, :2] for _k, p in rows])
        z = np.concatenate([np.asarray(p.z, f64) for _k, p in rows])
        last = np.cumsum(npts) - 1
        ia = np.delete(np.arange(len(xy)), last)            # each segment's first point (not a plan's last point)
        self.a, self.b = np.ascontiguousarray(xy[ia]), np.ascontiguousarray(xy[ia + 1])
        self.za, self.zb = np.ascontiguousarray(z[ia]), np.ascontiguousarray(z[ia + 1])
        bk = np.concatenate([np.asarray(p.bank, f64) if getattr(p, "bank", None) is not None else np.zeros(len(p.xy))
                             for _k, p in rows])
        self.ba, self.bb = np.ascontiguousarray(bk[ia]), np.ascontiguousarray(bk[ia + 1])
        self.h = np.repeat(np.array([p.half for _k, p in rows], f64), nseg)
        self.rh = np.repeat(np.array([getattr(p, "road_half", p.half) for _k, p in rows], f64), nseg)
        rids = [getattr(p, "rid", -1) for _k, p in rows]
        self.rid = np.repeat(np.array([r if r is not None and r >= 0 else 2 ** 40 + k
                                       for (k, _p), r in zip(rows, rids)], np.int64), nseg)
        s0 = np.r_[0, np.cumsum(nseg)]
        ab = np.zeros(int(s0[-1]), bool)
        cut = np.full((int(s0[-1]), 6), np.nan)
        for n, (_k, p) in enumerate(rows):
            abut = getattr(p, "abut", (False, False))
            if abut[0] or abut[1]:
                arc = np.r_[0.0, np.cumsum(np.hypot(*np.diff(p.xy[:, :2], axis=0).T))]
                if abut[0]:
                    ab[s0[n]:s0[n + 1]] |= arc[:-1] < ABUT_NEAR_M
                if abut[1]:
                    ab[s0[n]:s0[n + 1]] |= arc[-1] - arc[1:] < ABUT_NEAR_M
            c = getattr(p, "cut", None)
            if c is not None:
                cut[s0[n]:s0[n + 1]] = c
        self.ab = ab.astype(np.uint8)
        self.cut = cut
        self.box = np.array([p.bbox for _k, p in rows], f64).reshape(-1, 4)
        self.of = np.repeat(np.arange(self.n), nseg)
        self.yl = _yield_strength([p for _k, p in rows], self.box, nseg)
        self.bw = _beside_strength([p for _k, p in rows], self.box, nseg)
        self.tun = np.repeat(np.array([getattr(p, "tunnel", False) for _k, p in rows], np.uint8), nseg)
        self.past = np.full(int(s0[-1]), np.nan)
        self._add_past([(n, p) for n, (_k, p) in enumerate(rows)])

    def _add_past(self, rows):
        """The segments of each road's line going on past its ends onto a bridge (_past_segments) added to the arrays.
        rows: [(row number, Plan)]."""
        f64 = np.float64
        got = [(n, p, s) for n, p in rows for s in _past_segments(p)]
        if not got:
            return
        one = {"h": lambda p: p.half, "rh": lambda p: getattr(p, "road_half", p.half)}
        first = {int(n): int(i) for n, i in zip(*np.unique(self.of, return_index=True))}
        at = np.array([first[n] for n, _p, _s in got], np.int64)
        m = np.array([len(s[0]) for _n, _p, s in got], np.int64)
        take = np.repeat(at, m)
        self.a = np.ascontiguousarray(np.r_[self.a, np.concatenate([s[0] for _n, _p, s in got])])
        self.b = np.ascontiguousarray(np.r_[self.b, np.concatenate([s[1] for _n, _p, s in got])])
        self.za = np.r_[self.za, np.concatenate([s[2] for _n, _p, s in got])]
        self.zb = np.r_[self.zb, np.concatenate([s[3] for _n, _p, s in got])]
        self.ba = np.r_[self.ba, np.concatenate([np.full(len(s[0]), s[4], f64) for _n, _p, s in got])]
        self.bb = np.r_[self.bb, np.concatenate([np.full(len(s[0]), s[4], f64) for _n, _p, s in got])]
        for name, fn in one.items():
            setattr(self, name, np.r_[getattr(self, name), np.repeat(np.array([fn(p) for _n, p, _s in got], f64), m)])
        self.rid = np.r_[self.rid, self.rid[take]]
        self.tun = np.r_[self.tun, self.tun[take]]
        self.of = np.r_[self.of, self.of[take]]
        self.ab = np.r_[self.ab, np.zeros(len(take), np.uint8)]
        self.yl = np.r_[self.yl, np.zeros(len(take), np.uint8)]
        self.bw = np.r_[self.bw, np.zeros(len(take), np.uint8)]
        self.cut = np.r_[self.cut, np.full((len(take), 6), np.nan)]
        self.past = np.r_[self.past, np.concatenate([s[5] for _n, _p, s in got])]

    def near(self, x0, y0, x1, y1, with_yield=False):
        """The segment arrays of the plans whose boxes meet (x0, y0, x1, y1), or None; with_yield: their yl, bw, tun and
        past last too."""
        if not self.n:
            return None
        bx = self.box
        keep = ~((bx[:, 2] < x0) | (bx[:, 0] > x1) | (bx[:, 3] < y0) | (bx[:, 1] > y1))
        if not keep.any():
            return None
        arrs = (self.a, self.b, self.za, self.zb, self.h, self.rh, self.rid, self.ab, self.cut, self.ba, self.bb)
        if with_yield:
            arrs = arrs + (self.yl, self.bw, self.tun, self.past)
        if keep.all():
            return arrs
        sk = keep[self.of]
        return tuple(np.ascontiguousarray(v[sk]) for v in arrs)
