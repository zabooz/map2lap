"""The roads leading onto an overpass raised (approaches), the roads under a short one lowered
(underpasses), the humps under its deck."""
import math

import numpy as np

import mapcells
import roads as roadsmod

from .settings import (
    APPROACH_MAX_LIFT, APPROACH_MIN_CROSS_M, APPROACH_MIN_LIFT, APPROACH_SKIP, PROFILE_STEP, ROAD_LIFT, UNDER_ANY_ON,
    UNDER_HUMP_EDGE_M, UNDER_HUMP_MIN_M, UNDER_HUMP_RAIL_HALF_M, UNDER_HUMP_SIN_MIN, UNDER_HUMP_WIN_M,
    UNDER_MAX_BRIDGE_M, UNDER_MAX_DROP_M, UNDER_NEAR_M, UNDER_REACH_M, UNGRADED
)
from .profiles import Plan, median_profile, smooth_profile
from .bridges import (
    _arc_on, _never_raised, approach_add, hump_dip, hump_height, junction_ends, raisable_ends, underpass_offsets
)


class _Approaches:
    """_Planner inherits these methods; they read and write its state."""

    def _lift_approaches(self, key, plans, specs):
        """Raise, in place, the plans of the roads leading onto overpasses (APPROACH_ON). A road is raised where one of
        its ends is a bridge's abutment that must go up for the deck to clear the road under it (_end_lift); the raise
        falls off along the road (approach_add) and never comes nearer another road than its fill slope allows. Only
        what the plan's own line and the map around its ends say counts, the same in every cell that plans it (a long
        road is planned in each cell it passes; two cells raising the same road differently drew the road under a
        raised ground, I-20 in Greene County, AL). Major roads (APPROACH_SKIP) are never raised."""
        # every plan end at once: near the cell, and on a bridge end of its own cell (most touch none)
        pe = np.array([[p.xy[0][:2], p.xy[-1][:2]] for _f, p in plans], np.float64).reshape(-1, 2)
        ok = np.repeat([s is not None for s in specs], 2)       # (a motorway's or trunk's: over water only, below)
        ok &= raisable_ends([p for _f, p in plans]).reshape(-1)
        touch = self._abut_ends(key, pe, ok).reshape(-1, 2)
        if touch.any():
            touch &= ~junction_ends([p.xy for _f, p in plans], [f for f, _p in plans], touch)
        for i, (fid, p) in enumerate(plans):
            if not touch[i].any():
                continue
            add = None
            for at_end in (False, True):
                e = p.xy[-1] if at_end else p.xy[0]
                if not touch[i, int(at_end)]:
                    continue
                got = self._end_lift(e)
                if got is None:
                    continue
                if _never_raised(specs[i]) and not got[3]:
                    continue
                lift, others = got[0], got[1]
                if len(got) > 4 and got[4] is not None:
                    # (a measured deck end: up to its height from the plan's own there, not from the ground under the
                    # point, which may lie down the cut the deck spans: Charles Street's approach over I-83 rose 2.2 m
                    # over its plan to a deck end measured at the street's height)
                    zp = float(np.asarray(p.z, np.float64)[-1 if at_end else 0])
                    lift = min(float(got[4]) - zp, APPROACH_MAX_LIFT)
                    if lift < APPROACH_MIN_LIFT:
                        continue
                a = approach_add(p.xy, at_end, lift, p.half, others)
                if a is not None:
                    add = a if add is None else np.maximum(add, a)
            if add is not None:
                np_ = Plan(p.xy, p.z + add, p.half, p.abut, p.cut, p.road_half)
                np_.rid, np_.max_wall, np_.bank = p.rid, p.max_wall, getattr(p, "bank", None)
                np_.free = getattr(p, "free", (False, False))
                np_.under = getattr(p, "under", (False, False))
                np_.beyond = getattr(p, "beyond", (None, None))
                np_.tunnel = getattr(p, "tunnel", False)
                np_.road = getattr(p, "road", None)
                plans[i] = (fid, np_)

    def _lower_underpasses(self, key, plans):
        """Lower, in place, the plans that cross under a short never-raised overpass (UNDER_*), and the roads joined
        to them (underpass_offsets), only within the cell's box (each plan is trimmed to it after). Solved on every
        ground road and span within UNDER_REACH_M of the box, from whichever cells they lie in, each road whole, its
        depth from its ground (_under_ground) rather than its plan: every cell gets the same dips. (On its own cell's roads alone, a road ending at a junction whose other roads
        lay only in the next cell was pinned there by one cell and lowered 3.5 m by the other; their copies met as a
        step on US-101 by Los Angeles' Union Station.)"""
        f64 = np.float64
        box = self._clip_box(key, UNDER_NEAR_M)
        if box is None:
            return
        xys = [np.asarray(p.xy, f64)[:, :2] for _fid, p in plans]
        # the fill rule where the elevation shows cuttings; the coarse global model has none to
        # show (BR-381's ~1 m of clearance): there the clearance rule as it was
        hump_on = not self._coarse(key)
        lo = np.array(box[:2]) - UNDER_REACH_M
        hi = np.array(box[2:]) + UNDER_REACH_M
        # (the spans' cells a span's length further: one joined to another past the box is no single span)
        pad = UNDER_MAX_BRIDGE_M + 10.0
        cla, clo, _ = self.frame.enu_to_geodetic(np.array([lo[0] - pad, hi[0] + pad] * 2),
                                                 np.array([lo[1] - pad] * 2 + [hi[1] + pad] * 2), 0.0)
        cla, clo = np.asarray(cla, f64), np.asarray(clo, f64)
        keys = sorted(set(mapcells.cells_for_bbox(float(cla.min()), float(clo.min()), float(cla.max()),
                                                  float(clo.max()))) | {key}, key=str)
        bridges, ground = [], {}
        half_w = {}             # (id(line) -> the deck's half width, UNDER_HUMP_*)
        for k in keys:
            c = self._cell_enu(k)
            for line, cls, w in zip(c["bridges"], c.get("bridge_cls", [None] * len(c["bridges"])),
                                    c.get("bridge_w", [0.0] * len(c["bridges"]))):
                if cls is None:
                    continue
                if not (UNDER_ANY_ON or cls in APPROACH_SKIP or cls.endswith("_link")):
                    continue
                half_w[id(line)] = w
                bridges.append((line, cls in APPROACH_SKIP, False))     # (a link's "<cls>_link": raised)
            # (a line's deck: never raised; straight between its ends whatever its length or what it joins, as
            # railways.deck_heights lays it: no single-span test)
            bridges += [(line, True, True) for line in c.get("rail_bridges", ())]
            for (line, _h, cls), (fid, j, sg, med) in zip(c["ground"], c["ground_ids"]):
                if cls in UNGRADED or len(line) < 2:
                    continue
                if (line.max(0) < lo).any() or (line.min(0) > hi).any():
                    continue
                got = ground.get((fid, j))      # (the longest copy of a part, as each cell has it)
                if got is None or len(line) > len(got[0]):
                    ground[(fid, j)] = (line, sg, med)
        if not bridges or not ground:
            return
        # (single spans: neither end continues into another bridge part; deduplicated across cells)
        uniq, seen = [], set()
        for b, fixed, rail in bridges:
            k2 = (round(float(b[0, 0]), 1), round(float(b[0, 1]), 1), round(float(b[-1, 0]), 1), len(b))
            if k2 not in seen:
                seen.add(k2)
                uniq.append((b, fixed, rail))
        spans = []
        ue = np.array([[b[0, :2], b[-1, :2]] for b, _f, _r in uniq], f64)        # (n, 2 ends, 2)
        coarse = self._coarse(key)      # (there the railway rises over the road: railways.coarse_underpasses)
        for n, (b, fixed, rail) in enumerate(uniq):
            if rail and coarse:
                continue
            L = float(np.hypot(*np.diff(b, axis=0).T).sum())
            if L < 2 * APPROACH_MIN_CROSS_M or (L > UNDER_MAX_BRIDGE_M and not rail):
                continue
            d = np.hypot(ue[:, :, None, 0] - ue[n, None, None, :, 0], ue[:, :, None, 1] - ue[n, None, None, :, 1])
            d[n] = np.inf                       # (another part's end within 0.75 m of either of its ends: joined)
            if rail or not (d < 0.75).any():
                spans.append((b, L, fixed))
        if not spans:
            return
        gids = sorted(ground)
        lines = [ground[g][0] for g in gids]
        crs = roadsmod._crossings_by([b for b, _L, _f in spans], lines)
        ez, raised = {}, set()

        def deck_ends(j):           # (an overpass's abutments' ground, raised when it is: as high as its ramps could
            got = ez.get(j)         # take them; asked only for one a road crosses under: every span's took 2 s a
            if got is None:         # Canton cell)
                b, _L, fixed = spans[j]
                ends = np.array([b[0], b[-1]], f64)
                ela, elo, _ = self.frame.enu_to_geodetic(ends[:, 0], ends[:, 1], 0.0)
                got = np.asarray(self.elev(np.asarray(ela), np.asarray(elo)), f64).reshape(2).copy()
                if not fixed:
                    got[0] += self._end_raised(b[0])
                    got[1] += self._end_raised(b[-1])
                ez[j] = got
            return got
        cands, reach = [], []       # (reach)
        for i, cr in enumerate(crs):
            if not cr:
                continue
            xy = lines[i]
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            ab = np.diff(xy, axis=0)
            for c in cr:
                bi, arc_b, pt = c[0], c[1], np.asarray(c[2], f64)
                b, L, fixed = spans[bi]
                if arc_b < APPROACH_MIN_CROSS_M or arc_b > L - APPROACH_MIN_CROSS_M:
                    continue                    # a junction at the bridge's end
                ze = deck_ends(bi)
                corridor = np.clip([arc_b - roadsmod.DECK_CLEAR_REACH_M, arc_b + roadsmod.DECK_CLEAR_REACH_M], 0.0, L)
                deck = float(np.min(ze[0] + (ze[1] - ze[0]) * corridor / L))
                # where along this road (its nearest vertex segment)
                t = np.clip(((pt - xy[:-1]) * ab).sum(1) / np.maximum((ab * ab).sum(1), 1e-12), 0.0, 1.0)
                j = int(np.argmin(np.linalg.norm(xy[:-1] + t[:, None] * ab - pt, axis=1)))
                # (the deck's own clearance: its depth scales with its span, roads.deck_depth; the full-depth
                # UNDER_CLEAR_M dug the road out under a short overpass that sits lower)
                clear = roadsmod.deck_road_clear(roadsmod.deck_depth(roadsmod.geom_span([b]))) + ROAD_LIFT
                cands.append((i, float(s[j] + t[j] * (s[j + 1] - s[j])), deck - clear))
                if hump_on:             # the deck's half footprint along this road
                    bs = np.r_[0.0, np.cumsum(np.hypot(*np.diff(b[:, :2], axis=0).T))]
                    k_ = int(np.clip(np.searchsorted(bs, arc_b) - 1, 0, len(b) - 2))
                    ub = (b[k_ + 1, :2] - b[k_, :2]) / max(float(np.hypot(*(b[k_ + 1, :2] - b[k_, :2]))), 1e-9)
                    ur = ab[j] / max(float(np.hypot(*ab[j])), 1e-9)
                    sin = max(abs(float(ub[0] * ur[1] - ub[1] * ur[0])), UNDER_HUMP_SIN_MIN)
                    hw = half_w.get(id(b), UNDER_HUMP_RAIL_HALF_M) or UNDER_HUMP_RAIL_HALF_M
                    reach.append(hw / sin)
        if not cands:
            return
        zc = self._under_ground(lines, [ground[g][1:] for g in gids], cands)
        requirements, humps = [], []
        for n_c, ((i, sc, top), z) in enumerate(zip(cands, zc)):
            target = max(top, z - UNDER_MAX_DROP_M)
            if target < z - 0.1:
                requirements.append((i, sc, z - target))
                if hump_on:
                    humps.append((i, sc, reach[n_c]))
        if hump_on:             # only the fill under the deck, down to the road's own line
            humps = [h for h in humps if self._under_hump(lines[h[0]], h[1], h[2]) >= UNDER_HUMP_MIN_M]
            if not humps:
                return
        if not requirements:
            return
        # each plan on its road's line (of its feature's parts, the nearest)
        by_fid = {}
        for n, (fid, _j) in enumerate(gids):
            by_fid.setdefault(fid, []).append(n)
        queries, which = [], []
        inside = []
        for n, (fid, p) in enumerate(plans):
            cand = by_fid.get(fid)
            xy = xys[n]
            near = (xy[:, 0] >= box[0]) & (xy[:, 1] >= box[1]) & (xy[:, 0] <= box[2]) & (xy[:, 1] <= box[3])
            if not cand or not near.any():
                continue
            mid = xy[near][int(near.sum()) // 2]
            best = min(cand, key=lambda m: float(np.min(np.hypot(*(lines[m] - mid).T))))
            queries.append((best, xy[near]))
            which.append(n)
            inside.append(near)
        if not queries:
            return
        # the fill rule's offsets (UNDER_HUMP_*)
        offsets = (self._hump_offsets(lines, [ground[g][1:] for g in gids], humps, queries) if hump_on
                   else underpass_offsets(lines, requirements, queries))
        for n, near, got in zip(which, inside, offsets):
            if not np.any(got < -1e-8):
                continue
            fid, p = plans[n]
            offset = np.zeros(len(near))        # (past the box: the plan's piece there is another cell's)
            offset[near] = got
            np_ = Plan(p.xy, np.asarray(p.z) + offset, p.half, p.abut, p.cut, p.road_half)
            np_.rid, np_.max_wall, np_.bank = p.rid, p.max_wall, getattr(p, "bank", None)
            np_.free = getattr(p, "free", (False, False))
            np_.under = getattr(p, "under", (False, False))
            np_.beyond = getattr(p, "beyond", (None, None))
            np_.tunnel = getattr(p, "tunnel", False)
            np_.road = getattr(p, "road", None)
            plans[n] = (fid, np_)

    def _ground_along(self, xy, arcs):
        """The elevation at arcs (m) along polyline xy (k, 2)."""
        f64 = np.float64
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        px, py = np.interp(arcs, s, xy[:, 0]), np.interp(arcs, s, xy[:, 1])
        la, lo, _ = self.frame.enu_to_geodetic(px, py, 0.0)
        return np.asarray(self.elev(np.asarray(la, f64), np.asarray(lo, f64)), f64).ravel()

    def _under_hump(self, xy, sc, reach):
        """m the road's ground under a deck (sc: arc m of the crossing, reach: half its footprint
        along the road) stands over the line between its ground just past the footprint either side (UNDER_HUMP_*);
        0 where either side is past the road's ends (unknown: nothing dug)."""
        s_end = float(np.hypot(*np.diff(xy, axis=0).T).sum())
        a, b = sc - reach - UNDER_HUMP_EDGE_M, sc + reach + UNDER_HUMP_EDGE_M
        if a - UNDER_HUMP_WIN_M < 0.0 or b + UNDER_HUMP_WIN_M > s_end:
            return 0.0
        under = min(reach, 2.0)
        arcs = np.r_[np.linspace(a - UNDER_HUMP_WIN_M, a, 7), np.linspace(b, b + UNDER_HUMP_WIN_M, 7),
                     sc + np.linspace(-under, under, 5)]
        return hump_height(arcs, self._ground_along(xy, arcs), sc)

    def _hump_offsets(self, lines, smooth, humps, queries):
        """m (<= 0) to add at the query points [(line, points (k, 2))]: under each hump (line, arc,
        reach) the road's ground, smoothed as its plan (_under_ground), brought down to the straight line between it
        a smoothing length past the footprint's edges (hump_dip); nothing elsewhere."""
        f64 = np.float64
        prof = {}
        for i, sc, reach in humps:
            sg, med = smooth[i]
            xy = lines[i]
            s_end = float(np.hypot(*np.diff(xy, axis=0).T).sum())
            w = reach + UNDER_HUMP_EDGE_M + 2.5 * sg
            k = int(math.ceil((w + 3.0 * sg) / PROFILE_STEP))
            arcs = sc + PROFILE_STEP * np.arange(-k, k + 1)
            arcs = arcs[(arcs >= 0.0) & (arcs <= s_end)]
            if len(arcs) < 3:
                continue
            g = smooth_profile(median_profile(self._ground_along(xy, arcs), PROFILE_STEP, med), PROFILE_STEP, sg)
            prof.setdefault(i, []).append((arcs, hump_dip(arcs, g, sc, w)))
        out = []
        for i, pts in queries:
            pts = np.asarray(pts, f64).reshape(-1, 2)
            got = np.zeros(len(pts))
            if i in prof:
                sp = _arc_on(lines[i], pts)
                for arcs, off in prof[i]:
                    got = np.minimum(got, np.interp(sp, arcs, off, left=0.0, right=0.0))
            out.append(got)
        return out

    def _under_ground(self, lines, smooth, cands):
        """The heights of ground roads where they cross under a bridge, cands [(line, arc m, _)]: their ground along
        them, median-filtered and smoothed as their plans are (_plan: smooth (sigma, median width) per line), at the
        crossing. A pure function of the road and the ground (its plan's own height is only in the cells planning it).
        """
        f64 = np.float64
        pts, spans = [], []
        for i, sc, _d in cands:
            sg, med = smooth[i]
            xy = lines[i]
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            k = int(math.ceil(3.0 * sg / PROFILE_STEP))
            a = np.clip(sc + PROFILE_STEP * np.arange(-k, k + 1), 0.0, s[-1])
            pts.append(np.stack([np.interp(a, s, xy[:, 0]), np.interp(a, s, xy[:, 1])], axis=1))
            spans.append((k, sg, med))
        allp = np.concatenate(pts)
        la, lo, _ = self.frame.enu_to_geodetic(allp[:, 0], allp[:, 1], 0.0)
        z = np.asarray(self.elev(np.asarray(la, f64), np.asarray(lo, f64)), f64).ravel()
        out, k0 = [], 0
        for k, sg, med in spans:
            zz = z[k0:k0 + 2 * k + 1]
            k0 += 2 * k + 1
            out.append(float(smooth_profile(median_profile(zz, PROFILE_STEP, med), PROFILE_STEP, sg)[k]))
        return out
