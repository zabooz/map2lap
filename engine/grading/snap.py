"""Where roads meet: ranks, junction heights, carriageways side by side."""
import numpy as np

import roads as roadsmod

from .settings import (
    COARSE_EASE_ON, JUNCTION_END_M, JUNCTION_MAX_M, JUNCTION_PARALLEL_DEG, JUNCTION_RANK, JUNCTION_REACH_M,
    JUNCTION_TAPER_M, SHOULDER_M, SIDEWALK_MARGIN_M
)


def road_rank(spec):
    """Higher: the road that keeps its profile at a junction (snap_junctions); a link ranks just under its class."""
    cls = spec.cls or ""
    base = cls.removesuffix("_link")
    r = JUNCTION_RANK.get(base, 0) * 2
    return r - 1 if cls != base else r


def _parallel_at(p, end, q, x, y):
    """Does Plan p's end (0 / -1) at (x, y) run within JUNCTION_PARALLEL_DEG of Plan q's nearest
    segment, either way?"""
    if len(p.xy) < 2 or len(q.xy) < 2:
        return False
    u = p.xy[1, :2] - p.xy[0, :2] if end == 0 else p.xy[-1, :2] - p.xy[-2, :2]
    a, b = q.xy[:-1, :2], q.xy[1:, :2]
    d = b - a
    ll = np.maximum((d * d).sum(1), 1e-12)
    t = np.clip(((x - a[:, 0]) * d[:, 0] + (y - a[:, 1]) * d[:, 1]) / ll, 0.0, 1.0)
    i = int(np.argmin(np.hypot(a[:, 0] + d[:, 0] * t - x, a[:, 1] + d[:, 1] * t - y)))
    c = abs(float(u @ d[i])) / max(float(np.hypot(*u)) * float(np.sqrt(ll[i])), 1e-12)
    return c >= np.cos(np.radians(JUNCTION_PARALLEL_DEG))


def _nearest_on(p, x, y):
    """(distance, height, arc position from p's nearer end) of the point of Plan p's centreline nearest (x, y)."""
    a, b = p.xy[:-1, :2], p.xy[1:, :2]
    d = b - a
    ll = np.maximum((d * d).sum(1), 1e-12)
    t = np.clip(((x - a[:, 0]) * d[:, 0] + (y - a[:, 1]) * d[:, 1]) / ll, 0.0, 1.0)
    q = a + d * t[:, None]
    dist = np.hypot(q[:, 0] - x, q[:, 1] - y)
    i = int(dist.argmin())
    seg = np.sqrt(ll)
    s = float(seg[:i].sum() + seg[i] * t[i])
    return float(dist[i]), float(p.z[i] + (p.z[i + 1] - p.z[i]) * t[i]), min(s, float(seg.sum()) - s)


def snap_junctions(plans, specs):
    """A side road's end at a junction takes the height of the road it joins, eased in over
    JUNCTION_TAPER_M along the side road (each road is smoothed on its own: a side road met the main road up to a metre
    off, blended over BLEND_R only: a bump at every turn-off). Plans are changed in place, the higher ranks first, so
    a residential street joining a tertiary road meets it at its already adjusted height. plans: [Plan], specs:
    their Specs."""
    order = sorted(range(len(plans)), key=lambda j: -road_rank(specs[j]))
    rank = np.array([road_rank(sp) for sp in specs])
    boxes = np.array([q.bbox for q in plans], np.float64).reshape(-1, 4)
    for j in order:
        p = plans[j]
        if len(p.xy) < 2:
            continue
        seg = np.hypot(*np.diff(p.xy[:, :2], axis=0).T)
        s = np.r_[0.0, np.cumsum(seg)]
        length = s[-1]
        dz = np.zeros(len(p.z))
        for end in (0, -1):
            if p.abut[0 if end == 0 else 1]:
                continue            # a bridge abutment's end: the deck's height (dev)
            x, y = float(p.xy[end, 0]), float(p.xy[end, 1])
            best = None
            near = np.flatnonzero((rank >= rank[j]) & (boxes[:, 0] <= x) & (x <= boxes[:, 2]) & (boxes[:, 1] <= y)
                                  & (y <= boxes[:, 3]))
            for k in near:
                if k == j:
                    continue
                q = plans[k]
                dist, zq, from_end = _nearest_on(q, x, y)
                if dist > q.road_half + JUNCTION_REACH_M:
                    continue
                if rank[k] == rank[j] and from_end < JUNCTION_END_M:
                    continue        # the same class end to end: a road's continuation, not a junction
                if rank[k] == rank[j] and _parallel_at(p, end, q, x, y):
                    continue        # the other carriageway beside it
                if best is None or dist < best[0]:
                    best = (dist, zq)
            if best is None:
                continue
            delta = best[1] - p.z[end]
            if abs(delta) > JUNCTION_MAX_M:
                continue            # a ramp up to an overpass, or bad data: as it was
            taper = min(JUNCTION_TAPER_M, 0.5 * length)
            u = (s if end == 0 else length - s) / max(taper, 1e-6)
            dz += delta * np.where(u < 1.0, 0.5 * (1.0 + np.cos(np.pi * np.clip(u, 0.0, 1.0))), 0.0)
        # crossings (Perm: service roads crossing a primary at a shared node stood as 4-5 m walls across
        # it): where this road runs over a higher-ranked road's carriageway away from its own ends, it takes that
        # road's height there, eased in over JUNCTION_TAPER_M either side (with the coarse easing: BNE_COARSE_EASE=1)
        for k in ([] if not COARSE_EASE_ON else np.flatnonzero((rank > rank[j]) & (boxes[:, 0] <= p.bbox[2]) & (boxes[:, 2] >= p.bbox[0])
                                & (boxes[:, 1] <= p.bbox[3]) & (boxes[:, 3] >= p.bbox[1]))):
            q = plans[k]
            if len(q.xy) < 2:
                continue
            inner = np.flatnonzero((s > JUNCTION_END_M) & (s < length - JUNCTION_END_M))
            if not len(inner):
                continue
            a, b = q.xy[:-1, :2], q.xy[1:, :2]
            d = b - a
            ll = np.maximum((d * d).sum(1), 1e-12)
            P = p.xy[inner, :2]
            t = np.clip(((P[:, None, 0] - a[None, :, 0]) * d[None, :, 0] + (P[:, None, 1] - a[None, :, 1]) * d[None, :, 1])
                        / ll[None, :], 0.0, 1.0)
            dist = np.hypot(a[None, :, 0] + t * d[None, :, 0] - P[:, None, 0], a[None, :, 1] + t * d[None, :, 1] - P[:, None, 1])
            si = dist.argmin(1)
            dmin = dist[np.arange(len(inner)), si]
            hit = dmin <= q.road_half
            if not hit.any():
                continue
            h = int(np.argmin(np.where(hit, dmin, np.inf)))       # the crossing point (nearest the other's line)
            i_, sg = int(inner[h]), int(si[h])
            zq = float(q.z[sg] + (q.z[sg + 1] - q.z[sg]) * t[h, sg])
            delta = zq - (p.z[i_] + dz[i_])
            if abs(delta) > JUNCTION_MAX_M or abs(delta) < 0.05:
                continue
            u = np.abs(s - s[i_]) / max(min(JUNCTION_TAPER_M, 0.5 * length), 1e-6)
            dz += delta * np.where(u < 1.0, 0.5 * (1.0 + np.cos(np.pi * np.clip(u, 0.0, 1.0))), 0.0)
        if dz.any():
            p.z = p.z + dz


def shoulder(spec):
    """m of flat ground beyond the carriageway edge, each side. Like the core width, never from the land
    cover: a road class that gets sidewalks in towns keeps a sidewalk-wide verge everywhere."""
    if spec.kind not in roadsmod.BUILT:
        return 0.0
    if spec.cls in roadsmod.SIDEWALK_CLASSES or (spec.cls == "trunk" and (not spec.oneway
                                                                          or roadsmod._arterial(spec))):
        return spec.walk + SIDEWALK_MARGIN_M
    return SHOULDER_M


def _with_lows(obs, lows):
    """plan_roads' obs with the tunnels' approaches held at their hulls (lows: Grader._portal_lows) where no source
    measured the road (roads.approach_heights). Pure given obs."""
    if not lows:
        return obs

    def got(xy, spec):
        o = obs(xy, spec) if obs is not None else None
        low = roadsmod.approach_heights(xy, lows)
        if o is None or len(o) != len(xy):
            return low
        return np.where(np.isfinite(o), o, low)
    return got


def _twin_trimmed(secs):
    """secs ([(fid, spec, xy, z, kind)]) with the covered sections of twin tunnels (roads.twin_tunnels: side by side,
    one tube round both) cut to the stretch they share: one twin's portal a few metres deeper than the other's, the
    other's ground kept as it is over it (TUNNEL_KEEP_M wide) left the deeper one's approach on the hill there, its road
    mesh a wedge up into their shared mouth (Réunion's Route des Tamarins). Pure."""
    cov = [n for n, sec in enumerate(secs) if sec[4] and len(sec[2]) >= 2]
    if len(cov) < 2:
        return secs
    parts = [(secs[n][0], secs[n][1], np.asarray(secs[n][2], np.float64), np.asarray(secs[n][3], np.float64), 0.0)
             for n in cov]
    out = list(secs)
    for i, j, _mid, _w in roadsmod.twin_tunnels(parts):
        for a, b in ((i, j), (j, i)):
            xa, xb = parts[a][2], parts[b][2]
            ub = xb[-1] - xb[0]
            ub = ub / max(float(np.hypot(*ub)), 1e-9)
            t = (xa - xb[0]) @ ub                   # along b, from its start
            keep = (t >= 0.0) & (t <= float((xb[-1] - xb[0]) @ ub))
            if keep.sum() >= 2 and not keep.all():
                fid, spec, xy, z, kind = secs[cov[a]]
                k = np.flatnonzero(keep)
                out[cov[a]] = (fid, spec, np.asarray(xy)[k[0]:k[-1] + 1], np.asarray(z)[k[0]:k[-1] + 1], kind)
    return out


_UNSET = object()
