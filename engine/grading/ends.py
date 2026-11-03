"""Where a road's plan goes on: the continuations of a cell's parts, their pins and free ends,
the heights a stronger road gives them."""

import numpy as np

import mapcells
import roads as roadsmod

from .settings import (
    CHAIN_JOIN_M, CHAIN_LOOK_M, CHAIN_TURN_DEG, CLIP_MARGIN_M, COARSE_EASE_ON, LONG_PART_M, PROFILE_STEP, UNGRADED, log
)
from .profiles import (
    BANK_DESIGN, BANK_ON, BANK_RUNOFF_M, BANK_SIGMA_M, BANK_STENCIL_M, _point_along, clip_polyline, plan_roads,
    profile_sigma, road_id
)


class _Ends:
    """_Planner inherits these methods; they read and write its state."""

    def _chain_cands(self, key, feats=None, specs=None):
        """The graded ground parts of cell key's roads, as the continuations at a node in it are looked for (every cell
        that plans a part looks in its nodes' own cells, so its plan is the same in each): [(xy (k, 2) in the frame,
        smoothing sigma, road id, lon/lat ring, spec, feature id)], in the map's feature order. Kept per cell. feats, specs: the cell's roads and their
        road_specs when the caller has them."""
        memo = self.__dict__.setdefault("_chain_memo", {})
        with self.lock:
            got = memo.get(key)
        if got is not None:
            return got
        out = []
        if feats is None:
            feats = self.md.cell(key, layers=("roads",), kind="demand").layers.get("roads")
        if feats is not None and len(feats):
            if specs is None:
                specs = roadsmod.road_specs(feats, None, self.widths)
            rows = []
            for i in range(len(feats)):
                if specs[i] is None or specs[i].cls in UNGRADED:
                    continue
                for ring in roadsmod.ground_parts(feats, i):
                    rows.append((i, np.asarray(ring, np.float64)))
            if rows:            # (the frame's conversion once for all: it is per call)
                allr = np.concatenate([r for _, r in rows])
                e, n, _ = self.frame.geodetic_to_enu(allr[:, 1], allr[:, 0], 0.0)
                en = np.stack([np.asarray(e, np.float64), np.asarray(n, np.float64)], axis=1)
                k0 = 0
                for i, ring in rows:
                    out.append((en[k0:k0 + len(ring)], profile_sigma(specs[i]), road_id(str(feats.ids[i])), ring,
                                specs[i], str(feats.ids[i])))
                    k0 += len(ring)
        tun = self._cell_tunnels(feats)
        with self.lock:
            if len(memo) > 64:
                memo.clear()
                self._tunnel_memo.clear()
            memo[key] = out
            self._tunnel_memo[key] = tun
        return out

    def _extensions(self, parts, ids):
        """plan_roads' ext of a cell's parts [(lonlat, spec)] (ids: their features'): per part (before, after), the line
        from each end outward along the part the road goes on in there (earthfast.chain_extensions), 3 sigma of its
        smoothing long, or None."""
        import fast
        fast.require(69, "road chains")
        f64 = np.float64
        q_node, q_dir, q_class, q_road, q_reach, q_cell = [], [], [], [], [], []
        if not parts:
            return []
        # (the frame's conversion once for every part: it is per call)
        alll = np.concatenate([np.asarray(ll, f64) for (ll, _sp) in parts])
        ae, an, _ = self.frame.geodetic_to_enu(alll[:, 1], alll[:, 0], 0.0)
        axy = np.stack([np.asarray(ae, f64), np.asarray(an, f64)], axis=1)
        k0 = 0
        for (lonlat, spec), fid in zip(parts, ids):
            xy = axy[k0:k0 + len(lonlat)]
            k0 += len(lonlat)
            sg = profile_sigma(spec)
            for end in (0, 1):
                line = xy if end == 0 else xy[::-1]          # from this end inward
                p = _point_along(line, CHAIN_LOOK_M)
                q_node.append(line[0])
                q_dir.append(line[0] - p)                    # the way the road goes on out of this end
                q_class.append(int(round(sg * 1000)))
                q_road.append(road_id(fid))
                reach = 3.0 * sg + PROFILE_STEP
                if BANK_ON and spec.kind in roadsmod.BUILT and spec.cls in BANK_DESIGN:
                    # Runoff averages curvature beyond the join, and that
                    # curvature needs its own stencil on either side too.
                    reach = max(reach, BANK_STENCIL_M + BANK_RUNOFF_M / 2 + 3 * BANK_SIGMA_M + PROFILE_STEP)
                q_reach.append(reach)
                q_cell.append(lonlat[0] if end == 0 else lonlat[-1])
        if q_cell:                  # (the ends' cells at once)
            qll = np.asarray(q_cell, np.float64).reshape(-1, 2)
            q_cell = mapcells.cells_of(qll[:, 1], qll[:, 0])
        out = [[None, None] for _ in parts]
        for key in sorted(set(q_cell), key=str):
            cands = self._chain_cands(key)
            qs = [i for i, c in enumerate(q_cell) if c == key]
            if not cands or not qs:
                continue
            cxy, coff, ccls, croad = self._cand_arrays(key, cands)
            pts, off = fast._ef.chain_extensions(
                cxy, coff, ccls, croad,
                np.ascontiguousarray([q_node[i] for i in qs], f64), np.ascontiguousarray([q_dir[i] for i in qs], f64),
                np.array([q_class[i] for i in qs], np.int64), np.array([q_road[i] for i in qs], np.int64),
                np.array([q_reach[i] for i in qs], f64), float(CHAIN_JOIN_M), float(CHAIN_TURN_DEG), float(CHAIN_LOOK_M))
            for j, i in enumerate(qs):
                if off[j + 1] - off[j] >= 2:
                    out[i // 2][i % 2] = np.asarray(pts[off[j]:off[j + 1]])
        return [tuple(o) for o in out]

    def _cand_arrays(self, key, cands):
        """_chain_cands(key) as the Rust kernels take them (points, offsets, sigma class, road id), made once per cell."""
        memo = self.__dict__.setdefault("_cand_arrays_memo", {})
        got = memo.get(str(key))
        if got is not None and got[0] is cands:
            return got[1]
        arr = (np.ascontiguousarray(np.concatenate([c[0] for c in cands]), np.float64),
               np.r_[0, np.cumsum([len(c[0]) for c in cands])].astype(np.int64),
               np.array([int(round(c[1] * 1000)) for c in cands], np.int64),
               np.array([c[2] for c in cands], np.int64))
        with self.lock:
            if len(memo) > 64:
                memo.clear()
            memo[str(key)] = (cands, arr)
        return arr

    def _pins(self, parts, ids, ext):
        """plan_roads' pins of a cell's parts: an end that no part of its own smoothing goes on from (ext None there) and
        that ends on another road's part smoothed as much or more (a slip road on a motorway, a side road on a trunk or
        on a street of its own class) is held at that road's planned height there (_stronger_z), so the two meet at one
        height (a same-class side road ended at the raw ground, the street through the junction at its smoothed height:
        0.6 m apart on a hill). The most smoothed such road, the first of equals. None when no end is held."""
        import fast
        fast.require(70, "road pins")
        f64 = np.float64
        q_node, q_cell, q_who = [], [], []
        for j, ((lonlat, spec), fid) in enumerate(zip(parts, ids)):
            for end in (0, 1):
                if ext is not None and ext[j][end] is not None:
                    continue
                ll = lonlat[-1] if end else lonlat[0]
                q_node.append((float(ll[1]), float(ll[0])))         # (lat, lon: converted below, all at once)
                q_who.append((j, end, profile_sigma(spec), road_id(fid)))
        if q_node:
            qa = np.asarray(q_node, f64)
            q_cell = mapcells.cells_of(qa[:, 0], qa[:, 1])
            qe, qn, _ = self.frame.geodetic_to_enu(qa[:, 0], qa[:, 1], 0.0)
            q_node = list(zip(np.asarray(qe, f64).tolist(), np.asarray(qn, f64).tolist()))
        out = [[None, None] for _ in parts]
        held = False
        todo = []                           # (part, end, candidate, at its last point): heights asked all at once
        for key in sorted(set(q_cell), key=str):
            cands = self._chain_cands(key)
            qs = [i for i, c in enumerate(q_cell) if c == key]
            weakest = min(q_who[i][2] for i in qs)
            strong = [c for c in cands if c[1] >= weakest]
            if not strong:
                continue
            cxy = np.concatenate([c[0] for c in strong])
            coff = np.r_[0, np.cumsum([len(c[0]) for c in strong])].astype(np.int64)
            hits, off = fast._ef.node_parts(np.ascontiguousarray(cxy, f64), coff,
                                            np.ascontiguousarray([q_node[i] for i in qs], f64), float(CHAIN_JOIN_M))
            for k, i in enumerate(qs):
                j, end, sg, rid = q_who[i]
                best = None
                for h in hits[off[k]:off[k + 1]]:
                    c = strong[int(h) // 2]
                    if c[1] >= sg and c[2] != rid and (best is None or c[1] > best[0][1]):
                        best = (c, bool(int(h) % 2))
                if best is not None:
                    todo.append((j, end, best[0], best[1]))
        for (j, end, _c, _l), z in zip(todo, self._stronger_zs([(c, last) for _j, _e, c, last in todo])):
            if z is not None:
                out[j][end] = z
                held = True
        return [tuple(o) for o in out] if held else None

    def _free_ends(self, parts, ids, ext):
        """Per part of a cell [(lonlat, spec)] (ids: their features'; ext: _extensions'), (first, last):
        does that end give way: no part of its own smoothing goes on from it (ext None there) and it lies
        within CHAIN_JOIN_M of another road's centre line (a part in _chain_cands of its cell, anywhere along it)."""
        f64 = np.float64
        out = [[False, False] for _ in parts]
        ask = [(j, end) for j in range(len(parts)) for end in (0, 1) if ext[j][end] is None]
        if not ask:
            return [tuple(o) for o in out]
        ll = np.asarray([parts[j][0][-1 if end else 0] for j, end in ask], f64).reshape(-1, 2)
        cells = mapcells.cells_of(ll[:, 1], ll[:, 0])
        e, n, _ = self.frame.geodetic_to_enu(ll[:, 1], ll[:, 0], 0.0)
        q = np.stack([np.asarray(e, f64), np.asarray(n, f64)], axis=1)
        memo = {}
        for k, (j, end) in enumerate(ask):
            key = cells[k]
            if str(key) not in memo:            # (each cell's segments once: starts, ends, their roads)
                cands = [c for c in self._chain_cands(key) if len(c[0]) >= 2]
                memo[str(key)] = ((np.concatenate([np.asarray(c[0], f64)[:-1] for c in cands]),
                                   np.concatenate([np.asarray(c[0], f64)[1:] for c in cands]),
                                   np.concatenate([np.full(len(c[0]) - 1, c[2], np.int64) for c in cands]))
                                  if cands else None)
            got = memo[str(key)]
            if got is None:
                continue
            a, b, r = got
            m = r != road_id(ids[j])
            if not m.any():
                continue
            a, ab = a[m], b[m] - a[m]
            t = np.clip(((q[k] - a) * ab).sum(axis=1) / np.maximum((ab * ab).sum(axis=1), 1e-12), 0.0, 1.0)
            out[j][end] = bool(np.hypot(*(a + t[:, None] * ab - q[k]).T).min() < CHAIN_JOIN_M)
        return [tuple(o) for o in out]

    def _stronger_zs(self, asks):
        """_stronger_z of each (candidate, at_last) of asks, the ones not kept yet planned in one plan_roads call (the
        same plans: each part is planned on its own; its cost is per call, ~1 ms, 935 calls in 4 Penn Station cells,
       )."""
        memo = self.__dict__.setdefault("_strong_memo", {})
        keys = [self._strong_key(c, last) for c, last in asks]
        with self.lock:
            miss = [n for n, k in enumerate(keys) if k not in memo]
        jobs, seen = [], set()
        for n in miss:
            if keys[n] not in seen:
                seen.add(keys[n])
                jobs.append(n)
        if len(jobs) > 1:
            try:
                preps = [self._strong_part(*asks[n]) for n in jobs]
                parts = [(part, asks[n][0][4]) for n, (part, _last, _whole) in zip(jobs, preps)]
                ext = self._extensions(parts, [asks[n][0][5] for n in jobs])
                plans = plan_roads(self.frame, parts, self.elev, None, ext, cuts=False,
                                   coarse=COARSE_EASE_ON and self._coarse_ll(parts[0][0]),
                                   obs=self._obs(None, parts[0][0]))
                for n, (part, last, whole), p in zip(jobs, preps, plans):
                    self._strong_keep(asks[n][0], keys[n], p, last, whole)
            except Exception as e:      # one at a time, each its own failure (_stronger_z)
                log.debug("grading: pin heights at once: %s: %s", type(e).__name__, e)
        return [self._stronger_z(c, last) for c, last in asks]

    @staticmethod
    def _strong_key(cand, at_last):
        xy, rid = cand[0], cand[2]
        e = xy[-1 if at_last else 0]
        return (rid, round(float(e[0]), 1), round(float(e[1]), 1))

    def _strong_part(self, cand, at_last):
        """(the lon/lat part planned for _stronger_z, whose end is asked for: its last point?, the whole part?)"""
        xy, _sg, rid, ring, spec, fid = cand
        part = ring
        if float(np.hypot(*np.diff(xy, axis=0).T).sum()) > LONG_PART_M:
            end = xy[-1] if at_last else xy[0]
            m = CLIP_MARGIN_M
            runs = clip_polyline(xy, (end[0] - m, end[1] - m, end[0] + m, end[1] + m))
            run = min(runs, key=lambda r: min(np.hypot(*(r[0] - end)), np.hypot(*(r[-1] - end)))) if runs else None
            if run is not None:
                la, lo, _ = self.frame.enu_to_geodetic(run[:, 0], run[:, 1], 0.0)
                part = np.stack([np.asarray(lo), np.asarray(la)], axis=1)
                at_last = bool(np.hypot(*(run[-1] - end)) <= np.hypot(*(run[0] - end)))
        return part, at_last, part is ring

    def _strong_keep(self, cand, k, p, at_last, whole):
        """Keep a _stronger_z height (and the other end's, for a part planned whole)."""
        z, other = None, None
        if p is not None:
            z = float(p.z[-1] if at_last else p.z[0])
            if whole:
                xy, rid = cand[0], cand[2]
                e2 = xy[0 if at_last else -1]
                other = ((rid, round(float(e2[0]), 1), round(float(e2[1]), 1)), float(p.z[0] if at_last else p.z[-1]))
        memo = self.__dict__.setdefault("_strong_memo", {})
        with self.lock:
            if len(memo) > 4096:
                memo.clear()
            memo.setdefault(k, z)
            if other is not None:
                memo.setdefault(*other)

    def _stronger_z(self, cand, at_last):
        """The planned height of a candidate part (_chain_cands') at its first or last point: its own plan (its chains,
        no pins), within CLIP_MARGIN_M of that point when it is long. Kept per part end (a short part's plan gives both
        ends' heights: the other kept too)."""
        k = self._strong_key(cand, at_last)
        memo = self.__dict__.setdefault("_strong_memo", {})
        with self.lock:
            if k in memo:
                return memo[k]
        try:
            part, last, whole = self._strong_part(cand, at_last)
            # (the profile alone: its cutting's walls cost most of a plan and no height)
            p = plan_roads(self.frame, [(part, cand[4])], self.elev, None,
                           self._extensions([(part, cand[4])], [cand[5]]), cuts=False,
                           coarse=COARSE_EASE_ON and self._coarse_ll(part), obs=self._obs(None, part))[0]
            self._strong_keep(cand, k, p, last, whole)
        except Exception as e:      # not held rather than no grading
            log.debug("grading: pin height of %s: %s: %s", cand[5], type(e).__name__, e)
            with self.lock:
                memo[k] = None
        with self.lock:
            return memo.get(k)
