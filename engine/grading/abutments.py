"""A bridge's ends: how far an abutment is raised, by its approaches, by a measured deck, over
water."""
import math
import threading
from collections import OrderedDict

import numpy as np

import mapcells
import roads as roadsmod

from .settings import (
    APPROACH_CELL_M, APPROACH_MAX_LIFT, APPROACH_MAX_RUN, APPROACH_MIN_LIFT, APPROACH_TOUCH_M, DIRT_MEDIAN_M,
    ENU_CACHE_MAX, MEDIAN_M, OBS_END_M, OBS_HALF_M, WATER_CURVE_M, WATER_LIFT_ON, WATER_MAX_LIFT, log
)
from .snap import shoulder
from .profiles import profile_sigma
from .bridges import _is_link, approach_add, bridge_chain, bridge_chain_ends_free, bridge_lifts


class _Abutments:
    """_Planner inherits these methods; they read and write its state."""

    def _observed_lift(self, bridge, xy, z_at):
        """(m the abutment at bridge end xy is raised, the measured deck end's height) when a source measured the deck
        (roadz.PROVIDER, level 1): the measured deck end over the ground there, 0 or more; None when none did (the
        inference: bridge_lifts)."""
        import roadz
        prov = roadz.PROVIDER
        if prov is None or not prov.enabled:
            return None
        try:
            z = prov.observed(self.frame, bridge, OBS_HALF_M, 1)
        except Exception as e:
            log.debug("grading: measured deck at %s: %s: %s", xy, type(e).__name__, e)
            return None
        if z is None:
            return None
        z = np.asarray(z, np.float64)
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(bridge, axis=0).T))]
        at_end = bool(np.hypot(*(bridge[-1] - xy)) < np.hypot(*(bridge[0] - xy)))
        d = (s[-1] - s) if at_end else s
        near = np.flatnonzero(np.isfinite(z) & (d <= OBS_END_M))
        if not len(near):
            return None
        k = int(near[np.argmin(d[near])])
        return max(0.0, float(z[k]) - float(z_at(np.asarray([xy], np.float64))[0])), float(z[k])

    def _simple_abuts(self, pe, abut):
        """Of the road ends pe (n, 2) that are abutments (abut (n,)), those at a bridge part no
        other part joins at either of its ends (bridge_chain_ends_free: a single deck, one half of a twin bridge)."""
        out = np.zeros(len(pe), bool)
        js = np.flatnonzero(np.asarray(abut, bool))
        if not len(js):
            return out
        la, lo, _ = self.frame.enu_to_geodetic(pe[js, 0], pe[js, 1], 0.0)
        for j, home in zip(js.tolist(), mapcells.cells_of(np.asarray(la, np.float64), np.asarray(lo, np.float64))):
            bl = self._cell_enu(home, ground=False)["bridges"]
            for line in bl:
                line = np.asarray(line, np.float64)
                if min(np.hypot(*(line[0, :2] - pe[j])), np.hypot(*(line[-1, :2] - pe[j]))) <= APPROACH_TOUCH_M:
                    out[j] = (bridge_chain_ends_free(line, bl, line[0, :2])
                              and bridge_chain_ends_free(line, bl, line[-1, :2]))
                    break
        return out

    def _enu_lines(self, rings):
        """Lon/lat polylines rings in the frame's ENU metres ((k, 2) each), with one conversion call."""
        if not rings:
            return []
        ll = np.concatenate([np.asarray(r, np.float64)[:, :2] for r in rings])
        e, n, _ = self.frame.geodetic_to_enu(ll[:, 1], ll[:, 0], 0.0)
        xy = np.stack([np.asarray(e, np.float64), np.asarray(n, np.float64)], axis=1)
        cut = np.cumsum([len(r) for r in rings])[:-1]
        return np.split(xy, cut)

    def _abut_ends(self, key, pe, ok=None):
        """Which of the points pe (n, 2) (road ends; ok: those to look at) near cell key are within APPROACH_TOUCH_M
        of a bridge's end in their own cell."""
        la, lo, _ = self.frame.enu_to_geodetic(pe[:, 0], pe[:, 1], 0.0)
        la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)
        lon0, lat0, lon1, lat1 = (float(v) for v in key.bounds())
        dla = np.maximum(np.maximum(lat0 - la, la - lat1), 0.0) * 111320.0
        dlo = np.maximum(np.maximum(lon0 - lo, lo - lon1), 0.0) * 111320.0 * np.cos(np.radians(la))
        touch = np.hypot(dla, dlo) <= APPROACH_CELL_M
        if ok is not None:
            touch &= ok
        homes = {}
        tj = np.flatnonzero(touch)
        for j, home in zip(tj.tolist(), mapcells.cells_of(la[tj], lo[tj])):
            homes.setdefault(home, []).append(j)
        for home, js in homes.items():
            ends = self._cell_enu(home, ground=False)["ends"]
            js = np.asarray(js)
            if not len(ends):
                touch[js] = False
                continue
            d = np.hypot(pe[js, None, 0] - ends[None, :, 0], pe[js, None, 1] - ends[None, :, 1])
            touch[js] = (d <= APPROACH_TOUCH_M).any(axis=1)
        return touch

    def _end_raised(self, xy):
        """m the abutment at bridge end xy is raised by its approach ramps (_lift_approaches: the most any road leading
        onto it rises there, its fill slope kept clear of the roads beside), 0 when it is not raised."""
        got = self._end_lift(xy)
        if got is None:
            return 0.0
        lift, others, approaches = got[:3]
        best = 0.0
        for line, half in approaches:
            at_end = bool(np.hypot(*(line[-1] - xy)) <= np.hypot(*(line[0] - xy)))
            a = approach_add(line, at_end, lift, half, others)
            if a is not None:
                best = max(best, float(a[-1] if at_end else a[0]))
        return best

    def _end_lift(self, xy):
        """(lift m, other road lines [(xy (k, 2), half width)], the roads leading onto it [(xy, half width)]) when the
        road end xy is a bridge abutment to raise, else None. A pure function of the map around the bridge (its cells,
        fetched as needed), cached per point."""
        k = (round(float(xy[0]) * 2), round(float(xy[1]) * 2))
        with self.lock:
            if not hasattr(self, "end_cache"):
                self.end_cache = {}
            if k in self.end_cache:
                return self.end_cache[k]
        res = None
        try:
            res = self._end_lift_calc(np.asarray(xy, np.float64))
        except Exception as e:      # no ramp rather than no grading
            log.debug("grading: approach at %s: %s: %s", k, type(e).__name__, e)
        with self.lock:
            return self.end_cache.setdefault(k, res)

    def _cell_enu(self, k, ground=True):
        """Cell k's road parts in the anchor frame, made once: {"bridges": [line (k, 2)], "ends": (n, 2) bridge end
        points, "end_of": [bridge index per end], "ground": [(line, half width, cls)], "ground_ids":
        [(feature id, part index, profile sigma, median width)] per ground part} (the longest copy of each part).
        With ground False, only the bridges (most plan ends touch none: their cells' ground roads are not needed).
        Kept for the ENU_CACHE_MAX cells used last; a cell another thread is making is waited for (cleared whole at
        128 cells, while the planning threads made the same cells at once, a 36-tile downtown Los Angeles set made
        318 cells for 242, ~125 ms each)."""
        key = (str(k), ground)
        with self.lock:
            if not hasattr(self, "enu_cache"):
                self.enu_cache, self.enu_making = OrderedDict(), {}
            while True:
                got = self.enu_cache.get(key) or (self.enu_cache.get((str(k), True)) if not ground else None)
                if got is not None:
                    self.enu_cache.move_to_end(key if key in self.enu_cache else (str(k), True))
                    return got
                ev = self.enu_making.get(key)
                if ev is None:
                    ev = self.enu_making[key] = threading.Event()
                    break
                self.lock.release()
                try:
                    ev.wait(60.0)
                finally:
                    self.lock.acquire()
                if key not in self.enu_cache and self.enu_making.get(key) is ev:    # (its maker gave up: make it here)
                    break
        try:
            out = self._cell_enu_calc(k, ground)
            with self.lock:
                self.enu_cache[key] = out
                self.enu_cache.move_to_end(key)
                while len(self.enu_cache) > ENU_CACHE_MAX:
                    self.enu_cache.popitem(last=False)
            return out
        finally:
            with self.lock:
                if self.enu_making.get(key) is ev:
                    del self.enu_making[key]
            ev.set()

    def _cell_enu_calc(self, k, ground):
        parts = {}
        f = self.md.cell(k, layers=("roads",), kind="demand").layers.get("roads")
        if f is not None and len(f):
            bs = roadsmod.bridge_specs(f)
            rs = roadsmod.road_specs(f, None, self.widths) if ground else [None] * len(f)
            for i in range(len(f)):
                if bs[i] is None and rs[i] is None:
                    continue
                fid = str(f.ids[i])
                for kind, sp, ps in (("bridge", bs[i], roadsmod.bridge_parts(f, i) if bs[i] is not None else ()),
                                     ("ground", rs[i], roadsmod.ground_parts(f, i) if rs[i] is not None else ())):
                    for j, ring in enumerate(ps):
                        ring = np.asarray(ring, np.float64)
                        kk = (fid, kind, j)
                        if len(ring) >= 2 and (kk not in parts or len(ring) > len(parts[kk][0])):
                            parts[kk] = (ring, sp)
        # the rail bridges (railways.DRAWN lines' bridge pieces): the roads under them dip as under a road overpass
        # (_lower_underpasses), nothing else (no ramps, no abutments: a line's deck is never raised for a road).
        # (/ #345 / #364: the track lay across the road under a rail bridge)
        rail, rail_g = [], []
        if f is not None and len(f) and f.attrs.get("subtype") is not None:
            import railways
            sub, rcls = f.attrs["subtype"], f.attrs.get("class")
            for i in range(len(f)):
                if str(sub[i]) != "rail" or railways.drawn(f, i) is None:
                    continue
                for kind, rings in railways._pieces(f, i):
                    if kind == "bridge":
                        rail += [np.asarray(r, np.float64) for r in rings if len(r) >= 2]
                    elif kind == "ground" and ground:
                        # (and the tracks on the ground: a road bridge's approaches rise over them as over a road,
                        #)
                        rail_g += [np.asarray(r, np.float64) for r in rings if len(r) >= 2]
        bridges, ground_l, ends, end_of, bcls, ground_ids = [], [], [], [], [], []
        bw = []                 # (the decks' half widths)
        items = sorted(parts.items())
        if items:               # (the frame's conversion once for every part: it is per call)
            allr = np.concatenate([ring for _k, (ring, _sp) in items])
            ae, an, _ = self.frame.geodetic_to_enu(allr[:, 1], allr[:, 0], 0.0)
            axy = np.stack([np.asarray(ae, np.float64), np.asarray(an, np.float64)], axis=1)
        k0 = 0
        for (fid, kind, j), (ring, sp) in items:
            line = axy[k0:k0 + len(ring)]
            k0 += len(ring)
            if kind == "bridge":
                end_of += [len(bridges), len(bridges)]
                ends += [line[0], line[-1]]
                bridges.append(line)
                bw.append(float(getattr(sp, "width", 0.0) or 0.0) / 2)      # (UNDER_HUMP_*)
                cls = getattr(sp, "cls", None)
                bcls.append(cls + "_link" if cls is not None and _is_link(sp) else cls)
            else:
                ground_l.append((line, sp.width / 2 + shoulder(sp), sp.cls))
                ground_ids.append((fid, j, profile_sigma(sp), MEDIAN_M if sp.kind in roadsmod.BUILT else DIRT_MEDIAN_M))
        rail_xy, rail_gxy = [], []
        if rail or rail_g:
            allr = np.concatenate(rail + rail_g)
            re_, rn, _ = self.frame.geodetic_to_enu(allr[:, 1], allr[:, 0], 0.0)
            rxy = np.stack([np.asarray(re_, np.float64), np.asarray(rn, np.float64)], axis=1)
            k0 = 0
            for ring, out_ in [(r, rail_xy) for r in rail] + [(r, rail_gxy) for r in rail_g]:
                out_.append(rxy[k0:k0 + len(ring)])
                k0 += len(ring)
        return {"bridges": bridges, "bridge_cls": bcls, "ground": ground_l, "ground_ids": ground_ids, "end_of": end_of,
                "ends": np.asarray(ends, np.float64).reshape(-1, 2), "rail_bridges": rail_xy, "rail_ground": rail_gxy,
                "bridge_w": bw}

    def _ground_table(self, keys, cs):
        """The ground road parts of the cells keys (cs: their _cell_enu), each once (the first copy, by its first point
        and length), in their order: (lines, half widths, boxes' lo (n, 2), hi (n, 2), first points, last points).
        Kept per cell set (every bridge end near them asks: a loop over each part per end was most of
        _lift_approaches)."""
        mk = tuple(str(k) for k in keys)
        memo = self.__dict__.setdefault("_ground_tables", {})
        with self.lock:
            got = memo.get(mk)
        if got is not None and all(a is b for a, b in zip(got[0], cs)):
            return got[1]
        lines, halves, seen = [], [], set()
        for c in cs:
            for line, half, _cls in c["ground"]:
                key = (round(float(line[0, 0]), 1), round(float(line[0, 1]), 1), len(line))
                if key in seen:
                    continue
                seen.add(key)
                lines.append(line)
                halves.append(half)
        f64 = np.float64
        if lines:
            tab = (lines, halves, np.array([ln.min(0) for ln in lines], f64), np.array([ln.max(0) for ln in lines], f64),
                   np.array([ln[0] for ln in lines], f64), np.array([ln[-1] for ln in lines], f64))
        else:
            z = np.zeros((0, 2), f64)
            tab = (lines, halves, z, z, z, z)
        with self.lock:
            if len(memo) > 64:
                memo.clear()
            memo[mk] = (list(cs), tab)
        return tab

    def _end_lift_calc(self, xy):
        la, lo, _ = self.frame.enu_to_geodetic(np.array([xy[0]]), np.array([xy[1]]), 0.0)
        home = mapcells.cell_of(float(la[0]), float(lo[0]))
        hc = self._cell_enu(home, ground=False)
        if not len(hc["ends"]):
            return None
        d = np.hypot(hc["ends"][:, 0] - xy[0], hc["ends"][:, 1] - xy[1])
        hit = np.flatnonzero(d <= APPROACH_TOUCH_M)
        if not len(hit):
            return None
        bridge = hc["bridges"][hc["end_of"][int(hit[0])]]
        # the bridge's own cells (a few, it is short): the roads crossing under it and the parts it joins
        lam, lom, _ = self.frame.enu_to_geodetic(bridge[:, 0], bridge[:, 1], 0.0)
        pad = 50.0 / 111320.0
        padlon = pad / max(0.05, math.cos(math.radians(float(np.mean(lam)))))
        keys = sorted(set(mapcells.cells_for_points(lam, lom, pad, padlon)) | {home}, key=str)
        cs = [self._cell_enu(k) for k in keys]
        bridges = [b for c in cs for b in c["bridges"]]
        lo_b, hi_b = bridge.min(0) - APPROACH_MAX_RUN - 50.0, bridge.max(0) + APPROACH_MAX_RUN + 50.0
        ground, others, approaches = [], [], []
        chain = bridge_chain(bridge, bridges)
        spans = [bridge] + chain        # (a road under any part of the chain is spanned, not beside the ramp: #138)
        blo = np.min([b.min(0) for b in spans], axis=0)
        bhi = np.max([b.max(0) for b in spans], axis=0)
        lines, halves, lo_l, hi_l, first, last = self._ground_table(keys, cs)
        near = np.flatnonzero(~((hi_l < lo_b).any(1) | (lo_l > hi_b).any(1)))   # (the rest nowhere near the bridge)
        tch = np.minimum(np.hypot(first[near, 0] - xy[0], first[near, 1] - xy[1]),
                         np.hypot(last[near, 0] - xy[0], last[near, 1] - xy[1])) <= APPROACH_TOUCH_M
        box = ~((hi_l[near] < blo).any(1) | (lo_l[near] > bhi).any(1))
        inbox = np.flatnonzero(box)     # (which of them cross under the chain: one kernel call for all)
        crossing = np.zeros(len(near), bool)
        for n, cr in zip(inbox, roadsmod._crossings_by(spans, [lines[near[n]] for n in inbox])):
            crossing[n] = bool(cr)
        for n, i in enumerate(near):
            line, half = lines[i], halves[i]
            ground.append(line)
            touches = bool(tch[n])
            under = bool(crossing[n])
            if touches:
                approaches.append((line, half))
            # the roads beside the ramp, which its fill slope must not reach (not the ones the bridge spans: its
            # abutment stands between)
            if not touches and not under:
                others.append((line, half))

        # (the tracks near it: crossed under like a road, never an approach or a road beside the ramp)
        rails = [line for c in cs for line in c.get("rail_ground", ())
                 if not ((line.max(0) < lo_b).any() or (line.min(0) > hi_b).any())]

        def z_at(p):
            la_, lo_, _ = self.frame.enu_to_geodetic(p[:, 0], p[:, 1], 0.0)
            return np.asarray(self.elev(la_, lo_), np.float64)
        best = None
        for end, lift in bridge_lifts(bridge, bridges, ground, z_at, chain, rails):
            if np.hypot(*(end - xy)) <= APPROACH_TOUCH_M:
                best = lift
                break
        seen = self._observed_lift(bridge, xy, z_at)
        if seen is not None:            # (a measured deck: its own end, not what the clearance rules would need)
            seen, target = seen
            return None if seen < APPROACH_MIN_LIFT else (min(seen, APPROACH_MAX_LIFT), others, approaches, False,
                                                          target)
        wl = self._water_lift(bridge, chain, xy, z_at) if bridge_chain_ends_free(bridge, bridges, xy) else 0.0
        if wl >= APPROACH_MIN_LIFT and (best is None or wl > best):
            return min(wl, WATER_MAX_LIFT), others, approaches, True
        return None if best is None else (best, others, approaches, False)

    def _water_lift(self, bridge, chain, xy, z_at):
        """m the abutment at xy of a bridge over water must be raised for its deck to reach the water's clearance
        (roads.BridgeProfiles._water, the deck's own depth) at DECK_DESIGN_GRADE after WATER_CURVE_M of vertical curve,
        0 when it need not. A causeway's 100 m channel bridge over 3.8 m of navigation clearance, its ends 0.7 m short
        of it 12 m out, humped 1.8 m over a curve squeezed under its grade cap (the Sunshine Skyway)."""
        if self.wet is None or not WATER_LIFT_ON:
            return 0.0
        try:
            import bridgetypes
            ch = self._chains_for()
            lines = [roadsmod.densify(np.asarray(c, np.float64)[:, :2], roadsmod.DECK_STEP)       # (as the deck's)
                     for c in [bridge] + list(chain or ())]
            try:
                nav = bridgetypes.nav_clearance(self.frame, lines)
            except Exception:
                nav = 0.0
            req = ch._water(lines, nav, ch._depth(lines))
            if not req:
                return 0.0
            pts, need = [], []
            for k, arc, base, c in req:
                ln = lines[k]
                s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(ln, axis=0).T))]
                pts.append([np.interp(arc, s, ln[:, 0]), np.interp(arc, s, ln[:, 1])])
                need.append(base + c)
            d = np.hypot(*(np.asarray(pts) - np.asarray(xy)[:2]).T)
            reach = np.asarray(need) - roadsmod.DECK_DESIGN_GRADE * np.maximum(d - roadsmod.DECK_ROAD_HALF - WATER_CURVE_M, 0.0)
            return max(0.0, float(reach.max() - z_at(np.asarray(xy, np.float64)[None, :2])[0]))
        except Exception as e:      # no fill rather than no grading
            log.debug("grading: water lift: %s: %s", type(e).__name__, e)
            return 0.0
