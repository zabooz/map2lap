"""A bridge's ends and approaches, ramps, what a road under it needs."""
import math

import numpy as np

import roads as roadsmod

from .settings import PROFILE_STEP


def raisable_ends(plans):
    """(n, 2) whether each plan's (first, last) end may be raised as an overpass's approach (Grader._lift_approaches):
    not one that goes on under its deck (Plan.under: _under_deck, on lidar at a single deck). That end is the real
    road's, and the lidar shows its embankment, which the ramps stand in for on coarse elevation: raised, the A2's
    approaches to a 30 m bridge over a road east of Völkermarkt rose 1-2.5 m over the lidar, a 7 cm step at both deck
    ends, 1.4-1.6 G at 100 km/h. Pure."""
    return ~np.array([getattr(p, "under", (False, False)) for p in plans], bool).reshape(-1, 2)


END_BANK_JOIN_M = 0.75      # m: a road's end and a bridge's are one point of the map (as bridge_chain's joints)


def end_bank(plans, p, along):
    """The slope (m per m toward the left of direction along (2,)) of the surface of the road in plans ending at point
    p (2,), at its own end (_end_onward): its cross slope, and its grade where it arrives at an angle to along (a level
    road rising 8 % at 16 degrees to a deck falls 2 % across the deck's axis). Of several the one running most nearly
    along; None where no road ends there. Pure."""
    got = _end_at(plans, p, along)
    if got is None:
        return None
    u, _z, g, b, along = got
    left = np.array([-along[1], along[0]])
    return g * float(u @ left) + b * float(u @ along)


def _end_at(plans, p, along):
    """The road in plans ending at point p (2,), of several the one running most nearly along direction along (2,): its
    (unit direction out of the plan past the end, height, grade along that direction, cross slope toward that
    direction's left, along as a unit vector), or None where no road ends there. Pure."""
    p = np.asarray(p, np.float64)
    along = np.asarray(along, np.float64)
    along = along / max(float(np.hypot(*along)), 1e-9)
    best, out = -1.0, None
    for q in plans:
        for e in (0, 1):
            got = _end_onward(q, e)
            if got is None or float(np.hypot(*(got[0] - p))) > END_BANK_JOIN_M:
                continue
            c = abs(float(got[1] @ along))
            if c > best:
                best, out = c, (got[1], got[2], got[3], got[4], along)
    return out


def road_end(plans, p, along):
    """(height + ROAD_LIFT, the road's surface's slope in direction along (2,)) of the road in plans ending at point p
    (2,), at its own end (_end_at): what a deck starting there takes, one height and one grade for both; None where no
    road ends there. Heights absolute, as the plans'. Pure."""
    got = _end_at(plans, p, along)
    if got is None:
        return None
    u, z, g, b, along = got
    return z + ROAD_LIFT, g * float(u @ along) + b * float(np.array([-u[1], u[0]]) @ along)


def road_end_reader(g):
    """road_end for a deck's ends in any frame: read(lat (2,), lon (2,)) of the end and a point on along the deck, under
    Grader g's plans (roads.BridgeProfiles.road_end)."""
    def read(la, lo):
        la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)
        e, n, _ = g.frame.geodetic_to_enu(la, lo, np.zeros(2))
        return road_end(g.plans(la, lo), (float(e[0]), float(n[0])), (float(e[1] - e[0]), float(n[1] - n[0])))
    return read


def regrade_past_ends(px, py, base, plans, out, lift=0.0):
    """out (grade_points of base at the points (px, py) under plans) with the points past an end whose grading stops
    (Plan.beyond: more than that many m ahead of the end, along its last segment, and nearest that end of all the
    plan's line, so a road bending back beside its own end keeps its ground) graded again without that plan, within
    its reach (half width + T_MAX). Pure."""
    px, py = np.asarray(px, np.float64), np.asarray(py, np.float64)
    out = np.array(out, np.float64, copy=True)
    drop = {}                   # point index -> the plans that stop short of it
    for k, p in enumerate(plans):
        by = getattr(p, "beyond", (None, None))
        xy = np.asarray(p.xy, np.float64)[:, :2]
        if (by[0] is None and by[1] is None) or len(xy) < 2:
            continue
        a, b = xy[:-1], xy[1:]
        ab = b - a
        l2 = np.maximum((ab ** 2).sum(1), 1e-12)
        for e, d in ((0, by[0]), (1, by[1])):
            if d is None:
                continue
            end, prev = (xy[0], xy[1]) if e == 0 else (xy[-1], xy[-2])
            u = end - prev
            lu = float(np.hypot(*u))
            if lu < 1e-9:
                continue
            u /= lu
            ahead = ((px - end[0]) * u[0] + (py - end[1]) * u[1]) > d
            reach = np.hypot(px - end[0], py - end[1]) <= p.half + T_MAX + d
            js = np.flatnonzero(ahead & reach)
            if not len(js):
                continue
            q = np.stack([px[js], py[js]], 1)
            t = np.clip(((q[:, None, :] - a[None]) * ab[None]).sum(2) / l2[None], 0.0, 1.0)
            dline = np.hypot(*(q[:, None, :] - a[None] - t[..., None] * ab[None]).transpose(2, 0, 1)).min(1)
            dend = np.hypot(q[:, 0] - end[0], q[:, 1] - end[1])
            for j in js[dend <= dline + 1e-6]:
                drop.setdefault(int(j), set()).add(k)
    groups = {}
    for j, ks in drop.items():
        groups.setdefault(frozenset(ks), []).append(j)
    for ks, js in groups.items():
        js = np.asarray(sorted(js))
        rest = [p for k, p in enumerate(plans) if k not in ks]
        out[js] = grade_points(px[js], py[js], np.asarray(base, np.float64)[js], rest, lift) if rest else             np.asarray(base, np.float64)[js]
    return out


def bridge_chain(line, all_bridges):
    """The bridge parts joined to line through their ends (within 0.75 m), line itself excluded. Pure."""
    line = np.asarray(line, np.float64)[:, :2]
    parts = [np.asarray(b, np.float64)[:, :2] for b in all_bridges]
    parts = [b for b in parts if not (len(b) == len(line) and np.array_equal(b, line))]
    if not parts:
        return []
    first = np.array([b[0] for b in parts])
    last = np.array([b[-1] for b in parts])
    out, frontier, used = [], [line[0], line[-1]], np.zeros(len(parts), bool)
    while frontier:
        e = frontier.pop()
        d = np.minimum(np.hypot(first[:, 0] - e[0], first[:, 1] - e[1]), np.hypot(last[:, 0] - e[0], last[:, 1] - e[1]))
        for k in np.flatnonzero((d < 0.75) & ~used):    # (in the parts' order, as a loop over them would)
            used[k] = True
            out.append(parts[k])
            frontier += [parts[k][0], parts[k][-1]]
    return out


def junction_ends(lines, ids, ask=None):
    """(n, 2) whether the (first, last) point of each line (k, 2) of lines lies on another feature's line (ids: each
    line's feature) within CHAIN_JOIN_M, at least CHAIN_JOIN_M from that line's own ends: a junction with a road going
    on past it (APPROACH_TOUCH_M). ask: (n, 2) the ends to look at (the rest False). Pure."""
    n = len(lines)
    out = np.zeros((n, 2), bool)
    if ask is None:
        ask = np.ones((n, 2), bool)
    lines = [np.asarray(ln, np.float64)[:, :2] for ln in lines]
    boxes = np.array([np.r_[ln.min(0), ln.max(0)] if len(ln) else np.full(4, np.nan) for ln in lines]).reshape(-1, 4)
    for j, e in zip(*np.nonzero(ask)):
        if len(lines[j]) < 2:
            continue
        q = lines[j][-1 if e else 0]
        near = np.flatnonzero((boxes[:, 0] - CHAIN_JOIN_M <= q[0]) & (q[0] <= boxes[:, 2] + CHAIN_JOIN_M)
                              & (boxes[:, 1] - CHAIN_JOIN_M <= q[1]) & (q[1] <= boxes[:, 3] + CHAIN_JOIN_M))
        for k in near:
            o = lines[k]
            if ids[k] == ids[j] or len(o) < 2:
                continue
            a, ab = o[:-1], np.diff(o, axis=0)
            l2 = np.maximum((ab * ab).sum(1), 1e-12)
            t = np.clip(((q - a) * ab).sum(1) / l2, 0.0, 1.0)
            d = np.hypot(*(a + t[:, None] * ab - q).T)
            i = int(np.argmin(d))
            s = float(np.sqrt(l2[:i]).sum() + np.sqrt(l2[i]) * t[i])
            if d[i] < CHAIN_JOIN_M and CHAIN_JOIN_M <= s <= float(np.sqrt(l2).sum()) - CHAIN_JOIN_M:
                out[j, e] = True
                break
    return out


def bridge_chain_ends_free(line, all_bridges, xy):
    """Whether the end of bridge line nearest xy is an abutment: no other bridge part ends within 0.75 m. Pure."""
    line = np.asarray(line, np.float64)
    end = line[0, :2] if np.hypot(*(line[0, :2] - xy[:2])) <= np.hypot(*(line[-1, :2] - xy[:2])) else line[-1, :2]
    for o in all_bridges:
        o = np.asarray(o, np.float64)
        if len(o) == len(line) and np.array_equal(o, line):
            continue
        if min(np.hypot(*(o[0, :2] - end)), np.hypot(*(o[-1, :2] - end))) < 0.75:
            return False
    return True


def bridge_lifts(line, all_bridges, ground_lines, z_at, chain=None, rail_lines=()):
    """[(end xy (2,), lift m)] of a bridge part (line (k, 2) ENU m): at each of its ends that no other bridge part
    continues from (an abutment), how far the ground there must be raised for the deck to clear every road crossing
    under it (roads.DECK_ROAD_CLEAR + APPROACH_MARGIN_M over the road, full height within APPROACH_FLAT_M of the end,
    then falling at roads.DECK_GRADE), within [APPROACH_MIN_LIFT, APPROACH_MAX_LIFT]. Roads crossing within
    APPROACH_MIN_CROSS_M of either end meet it at grade and do not count; railways (rail_lines) always count (a track
    never meets a road deck at grade: the deck ended 3 m past one at Vitebsk). z_at(xy (n, 2)) -> ground
    m. Pure given z_at."""
    line = np.asarray(line, np.float64)[:, :2]
    if len(line) < 2:
        return []
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]
    # (a short part, or one no road crosses under, still raises its free end for the roads under the rest of its chain:
    # the deck carried a few metres onto the road joined at its end (roads._skew_decks) left that end unraised and the
    # whole deck ~4.5 m low over BR-343 at Teresina)
    if s[-1] < 2 * APPROACH_MIN_CROSS_M and not chain:
        return []
    cr = roadsmod._crossings([line], ground_lines)
    nr = len(cr)
    if rail_lines:
        cr = cr + roadsmod._crossings([line], list(rail_lines))
    if not cr and not chain:
        return []
    zu = z_at(np.array([c[2] for c in cr], np.float64).reshape(-1, 2)) if cr else np.zeros(0)
    arcs = np.array([c[1] for c in cr], np.float64)

    def joined_at(end, own=None):
        own = line if own is None else own
        for other in all_bridges:
            if other is own or (len(other) == len(own) and np.array_equal(np.asarray(other)[:, :2], own[:, :2])):
                continue
            o = np.asarray(other, np.float64)
            if min(np.hypot(*(o[0, :2] - end)), np.hypot(*(o[-1, :2] - end))) < 0.75:
                return True
        return False
    joined = (joined_at(line[0]), joined_at(line[-1]))
    # (not a junction at an abutment; at a joint with the chain's next part the crossing is mid-bridge: Commerce
    # Street's bridge over I-95 in Springfield VA, split 2 m from where the motorway passes under)
    rail = np.arange(len(cr)) >= nr
    under = ((arcs >= APPROACH_MIN_CROSS_M) | joined[0]) & ((arcs <= s[-1] - APPROACH_MIN_CROSS_M) | joined[1]) | rail
    zu, arcs, rail = zu[under], arcs[under], rail[under]
    pts = np.array([c[2] for c in cr], np.float64)[under].reshape(-1, 2)
    # (the crossings under the rest of its chain, by their distance from the abutment: Overture splits a bridge where
    # other ways meet it, and the road under it may pass under the next part)
    # (a road meeting a part's free end is a junction at grade there, as for the line itself: the trunk's own next
    # carriageway at the far abutment of its chain counted as a road under it and raised a residential bridge joined
    # to the chain 9.7 m, the trunk deck climbing 10 m in 20 m to it, US-24 near Buena Vista CO)
    more = []
    for part in (chain or ()):
        part = np.asarray(part, np.float64)[:, :2]
        sp = float(np.hypot(*np.diff(part, axis=0).T).sum())
        pj = (joined_at(part[0], part), joined_at(part[-1], part))
        for c in roadsmod._crossings([part], list(ground_lines)):
            a = float(c[1])
            if (a >= APPROACH_MIN_CROSS_M or pj[0]) and (a <= sp - APPROACH_MIN_CROSS_M or pj[1]):
                more.append(np.asarray(c[2], np.float64))
        for c in roadsmod._crossings([part], list(rail_lines)) if rail_lines else ():
            more.append(np.asarray(c[2], np.float64))
    if more:
        mp = np.array(more, np.float64)
        zu = np.r_[zu, z_at(mp)]
        pts = np.r_[pts, mp]
        rail = np.r_[rail, np.zeros(len(mp), bool)]
    if not len(zu):
        return []
    out = []
    for (end, at), jn in zip(((line[0], 0.0), (line[-1], s[-1])), joined):
        if jn:
            continue
        d = np.r_[np.abs(arcs - at), np.hypot(*(pts[len(arcs):] - end).T)] if more else np.abs(arcs - at)
        far = (d >= APPROACH_MIN_CROSS_M) | rail     # (a road meeting the abutment itself: a junction at grade)
        if not far.any():
            continue
        d, zu_e = d[far], zu[far]
        need = zu_e + roadsmod.deck_road_clear(roadsmod.deck_depth(roadsmod.geom_span([line] + list(chain or ()))))             + APPROACH_MARGIN_M \
            - roadsmod.DECK_GRADE * np.maximum(d - APPROACH_FLAT_M, 0.0)
        lift = float(need.max() - z_at(end[None])[0])
        if lift >= APPROACH_MIN_LIFT:
            out.append((np.asarray(end, np.float64), min(lift, APPROACH_MAX_LIFT)))
    return out


def fill_abutment(z, at_end, step=PROFILE_STEP, fine=False):
    """The raw profile z (a sample every step m) of a road leading onto a bridge at its first (at_end False) or last
    sample, its last ABUT_NEAR_M filled up to the straight grade of the stretch from there to ABUT_FAR_M where they
    fall at least ABUT_STEEP more steeply than it toward the bridge (ABUT_FILL_ON). A profile too short for that (a part
    between a junction and a bridge, with no road going on straight past the junction) takes its half nearer the bridge
    against the other, at least ABUT_SHORT_SAMPLES of them: on a side road's last 10 m, 1.5 m down the bank and then
    level, the end stayed down the bank at 19 % and the deck with it.
    fine: lidar, ABUT_*_FINE. Returns z itself when nothing is filled. Pure."""
    min_m, steep = (ABUT_MIN_FINE_M, ABUT_STEEP_FINE) if fine else (ABUT_MIN_M, ABUT_STEEP)
    z = np.asarray(z, np.float64)
    p = z[::-1] if at_end else z
    d = np.arange(len(p)) * step
    near_m = ABUT_NEAR_M
    far = (d >= near_m) & (d <= ABUT_FAR_M)
    if far.sum() < 4:
        near_m = float(d[-1]) / 2 if len(d) else 0.0
        far = d >= near_m
        if far.sum() < ABUT_SHORT_SAMPLES:
            return z
    b, a = np.polyfit(d[far], p[far], 1)
    n = int((d < near_m).sum())
    e = a + b * d[:n]
    if e[0] - p[0] < min_m or (np.diff(p[:n + 1]) / step - b).max() < steep:
        return z
    q = p.copy()
    q[:n] = np.minimum(np.maximum(p[:n], e), p[:n] + ABUT_MAX_M)
    return q[::-1] if at_end else q


def hump_height(arcs, z, sc):
    """m the ground z under a deck stands over the road's line through it: arcs/z are 7 samples
    before the deck's footprint, 7 after and the rest under it (Grader._under_hump). Pure."""
    za, zb, zm = float(np.median(z[:7])), float(np.median(z[7:14])), float(np.median(z[14:]))
    ma, mb = float(np.mean(arcs[:7])), float(np.mean(arcs[7:14]))
    return zm - (za + (zb - za) * (sc - ma) / max(mb - ma, 1e-9))


def hump_dip(arcs, g, sc, w):
    """m (<= 0) bringing the profile g (at arcs) down to the straight line between it at sc - w and
    sc + w (clipped to the profile's ends); 0 outside. Pure."""
    a, b = max(sc - w, float(arcs[0])), min(sc + w, float(arcs[-1]))
    ga, gb = float(np.interp(a, arcs, g)), float(np.interp(b, arcs, g))
    chord = ga + (gb - ga) * (np.asarray(arcs) - a) / max(b - a, 1e-9)
    return np.where((arcs >= a) & (arcs <= b), np.minimum(chord - g, 0.0), 0.0)


def _arc_on(xy, pts):
    """m along polyline xy (k, 2) of each point pts (n, 2)'s nearest point on it. Pure."""
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    a, ab = xy[:-1], np.diff(xy, axis=0)
    ll = np.maximum((ab * ab).sum(1), 1e-12)
    t = np.clip(((pts[:, None, :] - a[None]) * ab[None]).sum(2) / ll[None], 0.0, 1.0)
    d = np.hypot(*(a[None] + t[..., None] * ab[None] - pts[:, None, :]).transpose(2, 0, 1))
    j = d.argmin(1)
    return s[j] + t[np.arange(len(pts)), j] * np.sqrt(ll[j])


def underpass_offsets(lines, requirements, queries=None):
    """Smooth underpass dips along joined ground roads, never across space (earthfast.underpass_offsets; after
    wyo-backroads'): m (<= 0) to add to the roads' heights.

    lines: the ground roads [(k, 2)]; requirements [(line, arc m, depth m)] of the overpasses they cross under.
    queries: [(line, points (k, 2) on it)] where the offsets are asked (default: every line's own points); one
    array per query (per line by default). Roads join where their ends meet; a node shared by several roads takes
    one offset in each, the eighth norm combines nearby dips without summing their depths, loose ends stay pinned
    and only joined ground junctions carry a dip past the road under the bridge. Pure."""
    import fast
    fast.require(85, "underpass_offsets")
    f64 = np.float64
    pts = [np.asarray(ln, f64)[:, :2] for ln in lines]
    if queries is None:
        queries = list(enumerate(pts))
    if not queries:
        return []
    qs = [np.asarray(q, f64).reshape(-1, 2) for _l, q in queries]
    if not pts or not requirements:
        return [np.zeros(len(q)) for q in qs]
    starts = np.r_[0, np.cumsum([len(p) for p in pts])].astype(np.int64)
    xy = np.ascontiguousarray(np.vstack(pts)) if len(starts) and starts[-1] else np.zeros((0, 2))
    req = np.ascontiguousarray(np.asarray(requirements, f64).reshape(-1, 3))
    qxy = np.ascontiguousarray(np.vstack(qs)) if sum(len(q) for q in qs) else np.zeros((0, 2))
    qline = np.repeat(np.array([int(l) for l, _q in queries], np.int64), [len(q) for q in qs])
    prm = np.array([UNDER_FLAT_M, UNDER_GRADE, UNDER_MAX_GRADE, UNDER_MAX_DROP_M, UNDER_JOINT_FLAT_M,
                    UNDER_JOINT_FADE_M, 0.5], f64)
    out = fast._ef.underpass_offsets(xy, starts, req, qxy, qline, prm)
    return np.split(out, np.cumsum([len(q) for q in qs])[:-1])


def approach_add(xy, at_end, lift, half, others=()):
    """m to add to a road plan's vertices (xy (n, 2)) rising to `lift` at its first (at_end False) or last vertex (a
    bridge's abutment), falling off along the road (arc length) on a cosine ramp whose steepest grade is APPROACH_GRADE;
    at most what keeps the fill slope (SLOPE_RUN) clear of the other roads [(line (k, 2), half width)] beside it, with
    APPROACH_GAP_M to spare. None when nothing is raised. Pure."""
    xy = np.asarray(xy, np.float64)[:, :2]
    if len(xy) < 2 or lift < APPROACH_MIN_LIFT:
        return None
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    d = (s[-1] - s) if at_end else s
    run = float(np.clip(lift * math.pi / (2 * APPROACH_GRADE), APPROACH_MIN_RUN, APPROACH_MAX_RUN))
    u = np.clip(d / run, 0.0, 1.0)
    add = lift * 0.5 * (1.0 + np.cos(math.pi * u))
    on = add > 1e-3
    if not on.any():
        return None
    q0 = xy[on]
    lo_q, hi_q = q0.min(0), q0.max(0)
    for line, oh in others:
        line = np.asarray(line, np.float64)[:, :2]
        if len(line) < 2:
            continue
        reach = half + oh + APPROACH_GAP_M + SLOPE_RUN * lift
        if (line.max(0) < lo_q - reach).any() or (line.min(0) > hi_q + reach).any():
            continue                    # too far to matter
        q = xy[on]
        a, b = line[:-1], line[1:]
        ab = b - a
        L2 = np.maximum((ab * ab).sum(1), 1e-12)
        t = np.clip(((q[:, None, :] - a[None]) * ab[None]).sum(2) / L2[None], 0.0, 1.0)
        dist = np.hypot(*(q[:, None, :] - (a[None] + t[..., None] * ab[None])).transpose(2, 0, 1)).min(1)
        cap = np.maximum(0.0, (dist - half - oh - APPROACH_GAP_M) / SLOPE_RUN)
        add[on] = np.minimum(add[on], cap)
    # a cap lowers the ramp before it at APPROACH_CAP_GRADE at most, instead of a step at the cap
    for i in range(1, len(add)):
        add[i] = min(add[i], add[i - 1] + APPROACH_CAP_GRADE * (s[i] - s[i - 1]))
    for i in range(len(add) - 2, -1, -1):
        add[i] = min(add[i], add[i + 1] + APPROACH_CAP_GRADE * (s[i + 1] - s[i]))
    if add.max() < 1e-3:
        return None
    return add


def _is_link(spec):
    return bool(getattr(spec, "link", False))


def _never_raised(spec):
    """A road whose approaches are never raised: a motorway or trunk (APPROACH_SKIP), not one of their links. A link
    leaving a motorway's bridge runs down a fill to the street: kept at the ground, its deck fell 11 m within 90 m and
    dropped beside its mainline while they still overlapped, and an AI car drove into the mainline's parapet trying to
    take the exit (US-101's exit 1E over the Los Angeles River)."""
    return spec.cls in APPROACH_SKIP and not _is_link(spec)


class GradedDem:
    """dem.Dem with sample() graded under the roads; everything else passes through."""

    def __init__(self, dem, grader):
        self._dem, self._grader = dem, grader

    def sample(self, lat, lon, zoom, progress=None):
        base = self._dem.sample(lat, lon, zoom, progress) if progress is not None else self._dem.sample(lat, lon, zoom)
        return self._grader.apply(lat, lon, base)

    def __getattr__(self, name):
        return getattr(self._dem, name)


# (read inside functions only; here so that the parts can load each other)
from .settings import (
    ABUT_FAR_M, ABUT_MAX_M, ABUT_MIN_FINE_M, ABUT_MIN_M, ABUT_NEAR_M, ABUT_SHORT_SAMPLES, ABUT_STEEP,
    ABUT_STEEP_FINE, APPROACH_CAP_GRADE, APPROACH_FLAT_M, APPROACH_GAP_M, APPROACH_GRADE, APPROACH_MARGIN_M,
    APPROACH_MAX_LIFT, APPROACH_MAX_RUN, APPROACH_MIN_CROSS_M, APPROACH_MIN_LIFT, APPROACH_MIN_RUN, APPROACH_SKIP,
    CHAIN_JOIN_M, ROAD_LIFT, SLOPE_RUN, T_MAX, UNDER_FLAT_M, UNDER_GRADE, UNDER_JOINT_FADE_M, UNDER_JOINT_FLAT_M,
    UNDER_MAX_DROP_M, UNDER_MAX_GRADE
)  # noqa: E402
from .points import _end_onward, grade_points  # noqa: E402
