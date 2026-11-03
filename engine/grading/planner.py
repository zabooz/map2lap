"""_Planner: all plans of a region, their bridges, tunnels and junctions."""
import math
import threading
from collections import OrderedDict
import time
from concurrent.futures import ThreadPoolExecutor

import numpy as np

import mapcells
import roads as roadsmod

from .settings import CLIP_MARGIN_M


class _Planner:
    """The road plans of one planning region (geotiles.PLAN_Z), in its frame, per map cell, made once (worker threads;
    it fetches the road cells it lacks). store: the PlanStore it belongs to (its other regions, its settings)."""

    def __init__(self, frame, mapdata, elev, widths=None, store=None, region=None):
        self.frame, self.md, self.elev, self.widths = frame, mapdata, elev, widths
        self.store, self.region = store, region
        self.cells = {}
        self.failed = {}        # cell key -> monotonic time of the last failed fetch
        self.lock = threading.Lock()
        self.key_locks = {}     # cell key -> Lock: one thread plans a cell, the others wait for it
        self.covers = {}        # cell key -> [(xy (k, 2), half width)]: the tunnels whose ground over them stays
        self.keeps = {}         # cell key -> [(xy (k, 2), half width)]: the UNGRADED roads' carriageways
        self.opens = {}         # cell key -> [(xy (k, 2), Spec)]: the tunnels' open sections (roads in the open)

    # the store's settings (set on the anchors' Graders after they are made): shared: plancache.PlanCache (the cells'
    # plans shared with the server's other processes); wet(lat, lon) -> water depth (m): tunnels under water are left
    # out, as roads.TunnelProfiles leaves them (their "open" sections graded a dam across the river: the Maastunnel's
    # bed raised from -6 m to -0.4 m); dem: its urgent lane (_plan_missing)
    def _store_attr(name):
        def get(self):
            own = self.__dict__.get("_own_" + name, _UNSET)
            if own is not _UNSET:
                return own
            return getattr(getattr(self, "store", None), name, None)

        def put(self, v):           # (a planner of its own: tests)
            self.__dict__["_own_" + name] = v
        return property(get, put)
    shared = _store_attr("shared")
    wet = _store_attr("wet")
    dem = _store_attr("dem")
    del _store_attr

    def _foreign(self, key):
        """The planner of cell key's region when it is not this one's (None: this one plans it)."""
        if self.store is None:
            return None
        import geotiles
        r = geotiles.region_of_cell(key)
        return None if r == self.region else self.store.planner(r)

    def _import(self, src, key):
        """Cell key planned by src (another region's planner), its vertices mapped exactly into this frame."""
        plans = src._cell_plans(key)
        with src.lock:
            if key not in src.cells:            # (its fetch failed: asked again later)
                return []
            keeps, covers, opens = src.keeps.get(key, []), src.covers.get(key, []), src.opens.get(key, [])
        import geotiles

        def m(xy):
            return geotiles.world_xy_map(src.frame, self.frame, xy)
        got = ([(fid, mapped_plan(p, m)) for fid, p in plans], [(m(xy), hw) for xy, hw in keeps],
               [(m(xy), w) for xy, w in covers], [(m(xy), sp) for xy, sp in opens])
        with self.lock:
            self.cells.setdefault(key, got[0])
            self.keeps.setdefault(key, got[1])
            self.covers.setdefault(key, got[2])
            self.opens.setdefault(key, got[3])
            return self.cells[key]

    def _cell_plans(self, key):
        with self.lock:
            got = self.cells.get(key)
            kl = self.key_locks.setdefault(key, threading.Lock())
        if got is not None:
            return got
        src = self._foreign(key)
        if src is not None:
            with kl:
                return self._import(src, key)
        with kl:
            return self._plan_cell(key)

    def _plan_cell(self, key):
        with self.lock:
            got = self.cells.get(key)
            failed = self.failed.get(key)
        if got is not None:
            return got
        if failed is not None and time.monotonic() - failed < RETRY_S:
            return []               # offline: no block waits on the same failing fetch again
        shared, mine = (self.shared.claim(key) if self.shared is not None else (None, False))
        try:
            import revisit
            f0 = revisit.faults()
            got = shared if shared is not None else self._make_cell(key)
            if got is None:
                return []
            if mine:        # (kept for later visits too when complete: nothing it read failed or was missing)
                self.shared.store(key, *got, persist=revisit.faults() == f0)
        finally:
            if mine:
                self.shared.release(key)
        plans, keeps, covers, opens = got
        with self.lock:
            self.cells.setdefault(key, plans)
            self.keeps.setdefault(key, keeps)
            self.covers.setdefault(key, covers)
            self.opens.setdefault(key, opens)
            return self.cells[key]

    def _make_cell(self, key):
        """(plans, keeps, covers, opens) of cell key, or None when its roads could not be fetched."""
        try:
            feats = self.md.cell(key, layers=("roads",), kind="demand").layers.get("roads")
        except Exception as e:      # no road data: ungraded (asked again after RETRY_S)
            log.debug("grading: roads of %s: %s: %s", key, type(e).__name__, e)
            with self.lock:
                self.failed[key] = time.monotonic()
            return None
        plans = []
        if feats is not None and len(feats):
            specs = roadsmod.road_specs(feats, None, self.widths)
            parts, ids, clipped = [], [], []
            box = self._clip_box(key)
            keeps = []
            for i in range(len(feats)):
                if specs[i] is not None and specs[i].cls in UNGRADED:
                    for ring in roadsmod.ground_parts(feats, i):
                        e, n, _ = self.frame.geodetic_to_enu(ring[:, 1], ring[:, 0], 0.0)
                        keeps.append((np.stack([np.asarray(e), np.asarray(n)], axis=1),
                                      specs[i].width / 2 + UNGRADED_MARGIN_M))
                    continue
                if specs[i] is None:
                    continue
                for ring in roadsmod.ground_parts(feats, i):     # not bridges / tunnels
                    pieces = self._near_cell(np.asarray(ring, np.float64), box)
                    for r in pieces:
                        parts.append((r, specs[i]))
                        ids.append(str(feats.ids[i]))
                        clipped.append(len(pieces) > 1 or r is not ring)
            pspecs = []
            abut = under = None
            if (ABUT_FILL_ON or APPROACH_ON) and parts:
                try:
                    pe = np.array([[r[0], r[-1]] for r, _sp in parts], np.float64).reshape(-1, 2)
                    e, n, _ = self.frame.geodetic_to_enu(pe[:, 1], pe[:, 0], 0.0)
                    abut = self._abut_ends(key, np.stack([np.asarray(e), np.asarray(n)], axis=1)).reshape(-1, 2)
                    if abut.any():          # (an end joining a road going on: no approach, APPROACH_TOUCH_M)
                        abut &= ~junction_ends(self._enu_lines([r for r, _sp in parts]), ids, abut)
                    # the ends onto a single bridge part
                    under = self._simple_abuts(np.stack([np.asarray(e), np.asarray(n)], axis=1),
                                               abut.ravel()).reshape(-1, 2)
                except Exception as e:      # no fills rather than no grading
                    log.debug("grading: abutments of %s: %s: %s", key, type(e).__name__, e)
            ext = pins = free = None
            if CHAIN_ON and parts:
                try:
                    self._chain_cands(key, feats, specs)        # (this cell's own: its specs are at hand)
                    ext = self._extensions(parts, ids)
                    pins = self._pins(parts, ids, ext)
                except Exception as e:      # each part smoothed alone rather than no grading
                    log.debug("grading: road chains of %s: %s: %s", key, type(e).__name__, e)
            if ext is not None:
                try:
                    free = self._free_ends(parts, ids, ext)
                except Exception as e:      # blended as equals rather than no grading
                    log.debug("grading: free ends of %s: %s: %s", key, type(e).__name__, e)
            pclip = []
            pparts = []                         # (fid, spec, lon/lat ring) of each plan (roadcorners.grade_rows)
            coarse = COARSE_EASE_ON and self._coarse(key)
            fine = self._fine(key)
            lows = []
            if parts:
                try:
                    lows = self._portal_lows(parts, key)
                except Exception as e:      # the approaches as the ground has them rather than no grading
                    log.debug("grading: tunnel approaches of %s: %s: %s", key, type(e).__name__, e)
            for j, (fid, part, cl, p) in enumerate(zip(ids, parts, clipped,
                                                       plan_roads(self.frame, parts, self.elev, abut, ext, pins,
                                                                  coarse=coarse, fine=fine, under=under,
                                                                  obs=_with_lows(self._obs(key), lows)))):
                if p is not None:
                    p.rid = road_id(fid)
                    if free is not None:
                        p.free = free[j]
                    plans.append((fid, p))
                    pspecs.append(part[1])
                    pclip.append(cl)
                    pparts.append((fid, part[1], part[0]))
            if JUNCTION_SNAP_ON and plans:
                try:
                    snap_junctions([p for _f, p in plans], pspecs)
                except Exception as e:      # blended as before rather than no grading
                    log.debug("grading: junctions of %s: %s: %s", key, type(e).__name__, e)
            if COARSE_EASE_ON and plans:
                try:
                    self._ease_coarse(key, plans, pspecs)
                except Exception as e:      # as they were rather than no grading
                    log.debug("grading: coarse easing of %s: %s: %s", key, type(e).__name__, e)
            if APPROACH_ON and plans:
                try:
                    self._lift_approaches(key, plans, pspecs)
                except Exception as e:      # ungraded approaches rather than no grading
                    log.debug("grading: approaches of %s: %s: %s", key, type(e).__name__, e)
            if UNDER_ON and plans:
                try:
                    self._lower_underpasses(key, plans)
                except Exception as e:      # as the data has it rather than no grading
                    log.debug("grading: underpasses of %s: %s: %s", key, type(e).__name__, e)
            if JUNCTION_SNAP_ON and plans and (APPROACH_ON or UNDER_ON):
                # the side roads again, at their roads' heights after the approaches' lifts and the underpasses' dips
                # (snapped before them, every alley along Baltimore's Haven Street stood up to 3.5 m over the street
                # the dip had lowered: a hump at each)
                try:
                    snap_junctions([p for _f, p in plans], pspecs)
                except Exception as e:
                    log.debug("grading: junctions after the dips of %s: %s: %s", key, type(e).__name__, e)
            if CORNERS_ON and plans:
                # the rounded corners of curbless junctions (roadcorners.py): the ground under each graded to its roads'
                # solved heights (trimmed to the cell's box with the roads' plans below)
                try:
                    import roadcorners
                    rings = roadcorners.ring_ids(feats)
                    crows, heights = roadcorners.grade_rows(pparts, [p for _f, p in plans], self.frame, rings)
                    corner_plans = roadcorners.grade(crows, rings, self._clip_box(key, 0.0), heights)
                    plans.extend(corner_plans)
                    pclip.extend([True] * len(corner_plans))
                except Exception as e:      # the roads' own grading rather than none
                    log.debug("grading: road corners of %s: %s: %s", key, type(e).__name__, e)
            # a long road's piece (planned with CLIP_MARGIN_M of the road either side for its profile) kept only within
            # the cell's own box: every stretch of road in one cell's plans, once (overlapping pieces from neighbouring
            # cells counted a road up to 9 times, and every batch of points graded differently: patches of ground
            # through the Stelvio's asphalt's 2.5 m step at a bridge end in Meppen)
            own = self._clip_box(key, 0.0)
            sub = feats.attrs.get("subtype")
            if RAIL_GRADE_ON and own is not None and sub is not None and (np.asarray(sub).astype(str) == "rail").any():
                try:            # the railways' bed lines (railways.grade_plans): cuttings and embankments for the track
                    import railways     # (the cells around only where this one has a line: their fetches cost)
                    rcells = [self.md.cell(k, layers=("roads",), kind="demand").layers.get("roads")
                              for k in railways.cells_near(self.frame, own)]
                    for fid, xy, z in railways.grade_plans(self.frame, rcells, own, self.elev):
                        p = Plan(xy, z, railways.GRADE_HALF_M)
                        p.rid = road_id(RAIL_TAG + fid)
                        plans.append((RAIL_TAG + fid, p))
                        pclip.append(True)
                except Exception as e:      # no rail grading rather than no grading
                    log.debug("grading: railways of %s: %s: %s", key, type(e).__name__, e)
            # every plan only within the cell's own box, so each stretch of road is planned by one cell (its dips
            # made with every road around: _lower_underpasses); the tunnels' ends graded as before, a part shorter
            # than LONG_PART_M by all of it (TunnelProfiles.ends grades them by the roads' plans alone)
            tplans = plans
            if own is not None:
                # (by the cell's quad in this frame, not its box: a cell at a planning region's edge stands turned
                # ~0.16 deg in it, and boxes left slivers planned twice or not at all between neighbouring cells)
                quad = self._clip_quad(key)
                kept, tplans = [], []
                for (fid, p), cl in zip(plans, pclip):
                    pieces = trim_plan(p, own if quad is None else quad)
                    kept.extend((fid, q) for q in pieces)
                    tplans.extend((fid, q) for q in (pieces if cl else [p]))
                plans = kept
            secs = self._tunnel_sections(feats, key, [p for _f, p in tplans])
            plans.extend((fid + TUNNEL_TAG, tunnel_plan(xy, z, spec))
                         for fid, spec, xy, z, k in secs if k == 0)
            plans.extend(self._mouth_plans(secs))
            covers = [(xy, spec.width / 2 + TUNNEL_KEEP_M) for _f, spec, xy, _z, k in _twin_trimmed(secs) if k]
            opens = [(xy, spec) for _f, spec, xy, _z, k in secs if k == 0]
        else:
            covers, opens, keeps = [], [], []
        return plans, keeps, covers, opens

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

    def _cell_tunnels(self, feats):
        """(roads.approach_lines, [(fid, j, lon/lat ring, spec, its ends (2, 2) in the frame)] of the tunnel parts) of a
        cell's roads (_tunnels_of)."""
        self.__dict__.setdefault("_tunnel_memo", {})
        if feats is None or not len(feats):
            return [], []
        ts = roadsmod.tunnel_specs(feats)
        parts = []
        for i in range(len(feats)):
            if ts[i] is None:
                continue
            for j, ring in enumerate(roadsmod.tunnel_parts(feats, i)):
                ll = np.asarray(ring, np.float64)
                if len(ll) >= 2:
                    e, n, _ = self.frame.geodetic_to_enu(ll[[0, -1], 1], ll[[0, -1], 0], 0.0)
                    parts.append((str(feats.ids[i]), j, ring, ts[i], np.stack([np.asarray(e), np.asarray(n)], axis=1)))
        return roadsmod.approach_lines(feats, self.frame), parts

    def _tunnels_of(self, key):
        """_cell_tunnels of map cell key, kept with its _chain_cands (one read of the cell for both)."""
        memo = self.__dict__.setdefault("_tunnel_memo", {})
        with self.lock:
            got = memo.get(key)
        if got is None:
            self._chain_cands(key)
            with self.lock:
                got = memo.get(key)
        if got is None:                 # (dropped meanwhile: read again)
            got = self._cell_tunnels(self.md.cell(key, layers=("roads",), kind="demand").layers.get("roads"))
        return got

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

    def _clip_quad(self, key):
        """The cell's quad (4, 2: its corners SW, SE, NE, NW at h = 0) in the frame, or None for a key without bounds:
        the cells' own pieces of the plans (trim_plan), each place in one cell's whatever the frame."""
        if not hasattr(key, "bounds"):
            return None
        lon0, lat0, lon1, lat1 = key.bounds()
        e, n, _ = self.frame.geodetic_to_enu(np.array([lat0, lat0, lat1, lat1]), np.array([lon0, lon1, lon1, lon0]),
                                             0.0)
        return np.stack([np.asarray(e, np.float64), np.asarray(n, np.float64)], axis=1)

    def _clip_box(self, key, margin=CLIP_MARGIN_M):
        """The cell's box in the frame (east / north), margin wider each side; None for a key without bounds."""
        if not hasattr(key, "bounds"):
            return None
        lon0, lat0, lon1, lat1 = key.bounds()
        e, n, _ = self.frame.geodetic_to_enu(np.array([lat0, lat0, lat1, lat1]), np.array([lon0, lon1, lon0, lon1]),
                                             0.0)
        e, n = np.asarray(e), np.asarray(n)
        m = margin
        return float(e.min()) - m, float(n.min()) - m, float(e.max()) + m, float(n.max()) + m

    def _near_cell(self, ring, box):
        """A road part (lon/lat ring) as planned for a cell: as it is, or, longer than LONG_PART_M, the pieces of it
        within the cell's box (each its own plan). A cell's plans sampled the ground along every road through it
        to its ends: on the Bonneville salt flats, tracks one segment 27 km long, ~2,500 DEM tiles for one road
        tile's four cells. The profile's smoothing (SIGMA_M) reaches a few tens of metres: the plan
        within the cell is the same."""
        if box is None or len(ring) < 2:
            return [ring]
        e, n, _ = self.frame.geodetic_to_enu(ring[:, 1], ring[:, 0], 0.0)
        xy = np.stack([np.asarray(e, np.float64), np.asarray(n, np.float64)], axis=1)
        if float(np.hypot(*np.diff(xy, axis=0).T).sum()) <= LONG_PART_M:
            return [ring]
        out = []
        for run in clip_polyline(xy, box):
            la, lo, _ = self.frame.enu_to_geodetic(run[:, 0], run[:, 1], 0.0)
            out.append(np.stack([np.asarray(lo, np.float64), np.asarray(la, np.float64)], axis=1))
        return out

    def _obs(self, key, lonlat=None):
        """plan_roads' obs: the measured heights of ground roads (roadz.PROVIDER, level 0) where cell key's (or the
        part's) elevation is only the coarse global model (dem.coarse_at): on lidar terrain the DTM is the better
        height (decimetres; BD TOPO's Z is 1.5-2.5 m), so None there, as when roadz is off."""
        import roadz
        prov = roadz.PROVIDER
        if prov is None or not prov.enabled:
            return None
        if not (self._coarse(key) if key is not None else self._coarse_ll(lonlat)):
            return None

        def obs(xy, spec):
            try:
                return prov.observed(self.frame, xy, spec.width / 2, 0)
            except Exception as e:      # the DEM's rather than no grading
                log.debug("grading: measured road heights: %s: %s", type(e).__name__, e)
                return None
        return obs

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

    def _coarse(self, key):
        """Is cell key's elevation only the coarse global model (dem.coarse_at its centre)? False without a DEM."""
        dem = getattr(self, "dem", None) or getattr(self.md, "dem", None)
        if dem is None or not hasattr(dem, "coarse_at"):
            return False
        lon0, lat0, lon1, lat1 = key.bounds()
        try:
            return bool(dem.coarse_at((lat0 + lat1) / 2, (lon0 + lon1) / 2))
        except Exception:
            return False

    def _fine(self, key):
        """Is cell key's elevation known to be fine (a DEM that tells coarse_at, not coarse there)?"""
        dem = getattr(self, "dem", None) or getattr(self.md, "dem", None)
        return dem is not None and hasattr(dem, "coarse_at") and not self._coarse(key)

    def _coarse_ll(self, lonlat):
        """dem.coarse_at the middle of a part's (lon, lat) points (the pins' and chains' own plans sample as the cell's)."""
        dem = getattr(self, "dem", None) or getattr(self.md, "dem", None)
        if dem is None or not hasattr(dem, "coarse_at") or not len(lonlat):
            return False
        lon, lat = np.asarray(lonlat, np.float64)[len(lonlat) // 2][:2]
        try:
            return bool(dem.coarse_at(float(lat), float(lon)))
        except Exception:
            return False

    def _ease_coarse(self, key, plans, pspecs):
        """COARSE_* above: the cell's plans eased together where its elevation is coarse (in place)."""
        if not self._coarse(key):
            return
        ps = [p for _f, p in plans]
        if len(ps) < 2:
            return
        import fast
        fast.require(94, "ease_coarse")
        off = np.r_[0, np.cumsum([len(p.xy) for p in ps])].astype(np.int64)
        xy = np.ascontiguousarray(np.concatenate([np.asarray(p.xy, np.float64)[:, :2] for p in ps]))
        z = np.ascontiguousarray(np.concatenate([np.asarray(p.z, np.float64) for p in ps]))
        rank = np.array([road_rank(sp) for sp in pspecs], np.int64)
        half = np.array([p.road_half for p in ps], np.float64)
        take = np.array([0 if (p.abut[0] or p.abut[1]) else 1 for p in ps], np.uint8)
        out = fast._ef.ease_coarse(xy, z, off, rank, half, take, COARSE_REACH_M, COARSE_MAX_STEP_M, COARSE_MAX_SLOPE,
                                   COARSE_SIGMA_M)
        for j, p in enumerate(ps):
            p.z = np.asarray(out[off[j]:off[j + 1]], np.float64)

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

    def _longest(self, fid, j, ring, key):
        """Part j of tunnel fid as the cells at its ends have it, the longest (a part comes clipped differently in
        the cells around: graded as the 30 m piece, 97th Street's 45 m arch got an open road graded in it; the
        same rule as roads.BridgeProfiles._load)."""
        best = ring
        for p in (ring[0], ring[-1]):
            ck = mapcells.cell_of(float(p[1]), float(p[0]))
            if key is not None and str(ck) == str(key):
                continue
            try:
                f = self.md.cell(ck, layers=("roads",), kind="demand").layers.get("roads")
            except Exception:
                continue
            if f is None or not len(f):
                continue
            ids = [str(x) for x in f.ids]
            if fid not in ids:
                continue
            i = ids.index(fid)
            parts = roadsmod.tunnel_parts(f, i)
            if j < len(parts) and len(parts[j]) > len(best):
                best = parts[j]
        return best

    def _chains_for(self):
        """A roads.TunnelProfiles of this frame for its chain questions (drowned): the same chains, from the same map
        cells, as the road tiles' and terrain blocks' own."""
        if getattr(self, "_chains", None) is None:
            md = self.md
            t = roadsmod.TunnelProfiles(self.frame, lambda key: md.cell(key, layers=("roads",), kind="demand")
                                        .layers.get("roads"), self.elev)
            t.wet = self.wet
            self._chains = t
        return self._chains

    def _drowned(self, key, ring):
        """roads.TunnelProfiles.drowned for tunnel part key (ring: its lon / lat points): the process's tunnel chain
        store's (the road tiles' and blocks', blockworker: store.tunnel_store), whose chains are resolved once for all
        of them, when it is there; else this frame's own (_chains_for)."""
        get = getattr(self.store, "tunnel_store", None) if getattr(self, "store", None) is not None else None
        cs = get() if callable(get) else None
        if cs is not None:
            try:
                st = cs.store_at(float(ring[0][1]), float(ring[0][0]))
                if st.wet is not None:
                    return st.drowned(key, ring)
            except Exception as e:      # (this frame's own then)
                log.debug("grading: the chain store's drowned: %s: %s", type(e).__name__, e)
        return self._chains_for().drowned(key, ring)

    def _tunnel_sections(self, feats, key=None, road_plans=()):
        """[(fid, spec, xy, z, kind)] of the tunnels' sections (roads.tunnel_sections on the ungraded ground, its
        ends graded by road_plans: the cell's road Plans, as roads.TunnelProfiles.ends grades them with the roads'
        plans alone): kind 0 an open road at z, 1 a low arch, 2 a full tunnel."""
        out = []
        ts = roadsmod.tunnel_specs(feats)
        pack = None                     # (the road plans packed once: per tunnel part, ~6 ms each, 0.9 s of 8 tiles)
        over = None                     # (the ground roads near the tunnels, as roads.TunnelProfiles covers them)
        decks = ([], [])                # (the roads' decks near them, roads.cover_decks)
        for i in range(len(feats)):
            if ts[i] is None:
                continue
            for j, ring in enumerate(roadsmod.tunnel_parts(feats, i)):
                ring = self._longest(str(feats.ids[i]), j, ring, key)
                ll = np.asarray(ring, np.float64)
                if len(ll) < 2:
                    continue
                E, N, _ = self.frame.geodetic_to_enu(ll[:, 1], ll[:, 0], 0.0)
                xy, s = resample(np.stack([np.asarray(E), np.asarray(N)], axis=1), VERTEX_STEP)
                if len(xy) < 2 or s[-1] <= 0:
                    continue
                la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
                if self.wet is not None and \
                        (np.asarray(self.wet(la, lo)) > 0.5).mean() > roadsmod.TUNNEL_WET_SHARE:
                    continue
                if self.wet is not None and self._drowned((str(feats.ids[i]), j), ring):
                    continue            # (a dry piece of an underwater tunnel: left out with it)
                g = np.asarray(self.elev(la, lo), np.float64)
                if road_plans:
                    g = g.copy()
                    pack = PlanPack(list(road_plans)) if pack is None else pack
                    g[[0, -1]] = grade_points(xy[[0, -1], 0], xy[[0, -1], 1], g[[0, -1]], pack)
                floor, kinds, _ = roadsmod.approach_floor(s, g, *self._approaches(xy, ts[i]))
                kinds = roadsmod.portal_cover(kinds, g - floor, ts[i])
                if over is None:
                    over = self._roads_over_tunnels(feats, ts)
                    decks = self._decks_over_tunnels(feats, ts)
                kinds = roadsmod.cover_roads(xy, s, kinds, *over)
                kinds = roadsmod.cover_decks(xy, s, kinds, *decks)
                gal = roadsmod.gallery_parts(feats, i)
                if gal:                 # (a gallery's covered sections: open roads at the floor, roads.GALLERY_KIND)
                    import mapgeom
                    kinds = roadsmod.gallery_kinds(xy, kinds, [np.stack(mapgeom.enu_xy(feats, self.frame, r), axis=1)
                                                               for r in gal], kind=0)
                i0 = 0
                while i0 < len(kinds):
                    i1 = i0
                    while i1 + 1 < len(kinds) and kinds[i1 + 1] == kinds[i0]:
                        i1 += 1
                    a = max(0, i0 - 1)          # sharing the end sample with the section before
                    if i1 > a and kinds[i0] != roadsmod.UNDER_DECK:     # (no plan under a deck)
                        out.append((str(feats.ids[i]), ts[i], xy[a:i1 + 1], floor[a:i1 + 1], int(kinds[i0])))
                    i0 = i1 + 1
        return out

    def _approaches(self, xy, spec, found=None):
        """roads.approach_samples of tunnel line xy (k, 2) in the frame (road spec) among the ground roads of its
        portals' map cells (found: _portal_roads', made here if None), every VERTEX_STEP on the ungraded ground:
        (before, after)."""
        found = self._portal_roads(xy, spec) if found is None else found

        def ground(q):
            qa, qo, _ = self.frame.enu_to_geodetic(q[:, 0], q[:, 1], 0.0)
            return self.elev(qa, qo)
        return roadsmod.approach_samples(found[0], VERTEX_STEP, ground)

    def _portal_roads(self, xy, spec):
        """roads.portal_roads of tunnel line xy (k, 2) in the frame (road spec) among the ground roads of its portals'
        map cells: ((before, after), (m before, m after))."""
        if spec is None or len(xy) < 2:
            return (None, None), (0.0, 0.0)
        la, lo, _ = self.frame.enu_to_geodetic(xy[[0, -1], 0], xy[[0, -1], 1], 0.0)
        lines = []
        for ck in {str(c): c for c in (mapcells.cell_of(float(a), float(b)) for a, b in zip(la, lo))}.values():
            lines += self._approach_lines(ck)
        return roadsmod.portal_roads(xy, lines, roadsmod.approach_reach(spec))

    def _approach_lines(self, key):
        """roads.approach_lines of map cell key (_tunnels_of)."""
        return self._tunnels_of(key)[0]

    def _portal_lows(self, parts, key):
        """[(line (m, 2), heights (m,))] in the frame: the hulls (roads.approach_floor) over the approaches of the
        tunnels that cell key's ground parts ([(lonlat, spec)]) lead out of (a tunnel part in the map cell of a part's
        end with a portal there; another cell's only where the approach could reach into this one), on the ungraded
        ground (the road plans come after); plan_roads holds the approaches' profiles at them (_with_lows). Kept per
        tunnel part."""
        ends = np.array([[r[0], r[-1]] for r, _sp in parts], np.float64).reshape(-1, 2)
        e, n, _ = self.frame.geodetic_to_enu(ends[:, 1], ends[:, 0], 0.0)
        exy = np.stack([np.asarray(e), np.asarray(n)], axis=1)
        reach = np.repeat([roadsmod.approach_reach(sp) for _r, sp in parts], 2)
        box = self._clip_box(key, 0.0)
        if box is not None:
            out_by = np.maximum(np.maximum(box[0] - exy[:, 0], exy[:, 0] - box[2]),
                                np.maximum(box[1] - exy[:, 1], exy[:, 1] - box[3]))
            near = out_by <= reach
            ends, exy = ends[near], exy[near]
        out = []
        if not len(ends):
            return out
        for ck in {str(c): c for c in mapcells.cells_of(ends[:, 1], ends[:, 0])}.values():
            for fid, j, ring, spec, pxy in self._tunnels_of(ck)[1]:
                if np.hypot(*(exy[:, None, :] - pxy[None]).transpose(2, 0, 1)).min() <= roadsmod.APPROACH_JOIN_M:
                    out += self._approach_lows(fid, j, ring, spec, ck)
        return out

    def _approach_lows(self, fid, j, ring, spec, key):
        """_portal_lows' lines of tunnel part j of fid (ring: its lon/lat points, spec its road's)."""
        memo = self.__dict__.setdefault("_lows_memo", {})
        with self.lock:
            got = memo.get((fid, j))
        if got is not None:
            return got
        got = []
        ll = np.asarray(self._longest(fid, j, ring, key), np.float64)
        E, N, _ = self.frame.geodetic_to_enu(ll[:, 1], ll[:, 0], 0.0)
        xy, s = resample(np.stack([np.asarray(E), np.asarray(N)], axis=1), VERTEX_STEP)
        if len(xy) >= 2 and s[-1] > 0:
            la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
            dry = self.wet is None or ((np.asarray(self.wet(la, lo)) > 0.5).mean() <= roadsmod.TUNNEL_WET_SHARE
                                       and not self._drowned((fid, j), ring))
            if dry:
                found = self._portal_roads(xy, spec)
                apps = self._approaches(xy, spec, found)
                floor, _k, hulls = roadsmod.approach_floor(s, np.asarray(self.elev(la, lo), np.float64), *apps)
                got = roadsmod.portal_lows(xy, s, floor, apps, hulls, found[1], VERTEX_STEP)
        with self.lock:
            memo[(fid, j)] = got
        return got

    def _roads_over_tunnels(self, feats, ts):
        """([ground lines (k, 2) in the frame], [carriageway half widths]) of the roads near feats' tunnels (ts:
        tunnel_specs), as roads.TunnelProfiles._cover_roads has them."""
        import mapgeom
        tun = [i for i in range(len(feats)) if ts[i] is not None]
        boxes = roadsmod._feature_boxes(feats)
        if not tun:
            return [], []
        pad = (roadsmod.TUNNEL_ROAD_REACH_M + 40.0) / 111320.0      # (lon/lat degrees, generous at high latitudes)
        tb = boxes[tun]
        rs = roadsmod.road_specs(feats)
        lines, halves = [], []
        for i in range(len(feats)):
            if rs[i] is None:
                continue
            b = boxes[i]
            k = 1.0 / max(math.cos(math.radians(0.5 * (b[1] + b[3]))), 0.05)
            if not ((tb[:, 0] - pad * k <= b[2]) & (tb[:, 2] + pad * k >= b[0]) & (tb[:, 1] - pad <= b[3]) &
                    (tb[:, 3] + pad >= b[1])).any():
                continue
            for ring in roadsmod.ground_parts(feats, i):
                e, n = mapgeom.enu_xy(feats, self.frame, ring)
                lines.append(np.stack([e, n], axis=1))
                halves.append(rs[i].width / 2)
        return lines, halves

    def _decks_over_tunnels(self, feats, ts):
        """([deck lines (k, 2) in the frame], [carriageway half widths]) of the roads' bridge parts
        near feats' tunnels (ts: tunnel_specs): roads.cover_decks."""
        import mapgeom
        if not any(t is not None for t in ts):
            return [], []
        rs = roadsmod.road_specs(feats)
        lines, halves = [], []
        for i in range(len(feats)):
            if rs[i] is None:
                continue
            for ring in roadsmod.bridge_parts(feats, i):
                e, n = mapgeom.enu_xy(feats, self.frame, ring)
                lines.append(np.stack([e, n], axis=1))
                halves.append(rs[i].width / 2)
        return lines, halves

    @staticmethod
    def _mouth_plans(secs):
        """(fid, Plan) of the covered sections' mouths: the floor MOUTH_PLAN_M into the tube from a portal (where an
        open section or nothing comes before / after it): the ground at the portal graded to the road on both sides
        of it (the grading faded from the road's plan into the ungraded hill there, and the road tile and the
        terrain block, sampled at different zooms, came out a few cm apart: the block poked through the road
        outside 97th Street's arch)."""
        out = []
        for n, (fid, spec, xy, z, kind) in enumerate(secs):
            if not kind or len(xy) < 2:
                continue
            same = lambda m: 0 <= m < len(secs) and secs[m][0] == fid     # noqa: E731
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            for at_start in (True, False):
                nb = n - 1 if at_start else n + 1
                if same(nb) and secs[nb][4] != 0:
                    continue                    # inside the hill: a full tunnel goes on
                if at_start:
                    m = s <= MOUTH_PLAN_M
                    t = np.interp(MOUTH_PLAN_M, s, np.arange(len(s)))
                else:
                    m = s >= s[-1] - MOUTH_PLAN_M
                    t = np.interp(s[-1] - MOUTH_PLAN_M, s, np.arange(len(s)))
                i0 = int(np.floor(t))
                p = xy[i0] + (t - i0) * (xy[min(i0 + 1, len(xy) - 1)] - xy[i0])
                pz = z[i0] + (t - i0) * (z[min(i0 + 1, len(z) - 1)] - z[i0])
                if at_start:
                    pxy, pzz = np.r_[xy[m], p[None]], np.r_[z[m], pz]
                else:
                    pxy, pzz = np.r_[p[None], xy[m]], np.r_[pz, z[m]]
                if len(pxy) >= 2:
                    out.append((fid + TUNNEL_TAG + ("m0" if at_start else "m1"), tunnel_plan(pxy, pzz, spec)))
        return out

    def _covered_tunnels(self, feats):
        """[(xy, half width)] of the tunnels' covered sections (not open roads): the grading leaves the ground over
        them as it is (apply): the approaches' grading reached up to T_MAX past a portal and cut a park bridge's soil
        down under its arch's vault, the terrain then cut away over it."""
        return [(xy, spec.width / 2 + TUNNEL_KEEP_M) for _f, spec, xy, _z, kind in _twin_trimmed(self._tunnel_sections(feats))
                if kind]

    def _open_tunnels(self, feats):
        """(fid, Plan) of the tunnels' open sections (roads.TUNNEL_OPEN_COVER): the ground graded to the road's floor
        (the lower hull of the ground), as the road is drawn (roads._tunnel_chunks): over a footbridge's hump in the
        DEM the road climbed it, the ground over the road (Central Park's transverses)."""
        return [(fid, Plan(xy, z, spec.width / 2 + shoulder(spec)))
                for fid, spec, xy, z, kind in self._tunnel_sections(feats) if kind == 0]

    def planned(self, key):
        """True once cell key's plans exist (made, or failed recently)."""
        src = self._foreign(key)
        if src is not None:
            return src.planned(key)
        with self.lock:
            f = self.failed.get(key)
            return key in self.cells or (f is not None and time.monotonic() - f < RETRY_S)

    def warm(self, key):
        """Make cell key's plans now (worker threads: the lookahead ahead of the player)."""
        self._cell_plans(key)

    def _plan_missing(self, keys):
        """The cells of keys not planned yet, planned at once on up to PLAN_THREADS threads (their map data and
        elevation downloads overlap: a fresh place's first block planned its 3-4 cells one after another, 27-35 s of
        its wait); the caller's urgent elevation lane (a teleport's first block) carried over."""
        with self.lock:
            missing = [k for k in keys if k not in self.cells]
        if len(missing) < 2:
            return
        dem = getattr(self, "dem", None)
        urgent = dem is not None and getattr(dem, "is_urgent", lambda: False)()

        def one(k):
            if urgent:
                with dem.urgent():
                    return self._cell_plans(k)
            return self._cell_plans(k)
        with ThreadPoolExecutor(min(len(missing), PLAN_THREADS), thread_name_prefix="plans") as ex:
            list(ex.map(one, missing))

    def plans(self, lat, lon, roads_only=False):
        """The Plans touching the points' area (each road once); roads_only: not the tunnels' (TUNNEL_TAG)."""
        return self._plan_set(self._keys(lat, lon), roads_only)[0]

    @staticmethod
    def _keys(lat, lon):
        """The map cells whose plans can reach the points."""
        lat = np.asarray(lat, np.float64)
        lon = np.asarray(lon, np.float64)
        pad = (T_MAX + 40.0) / 111320.0
        padlon = pad / max(0.05, math.cos(math.radians(float(np.mean(lat)))))
        keys = mapcells.cells_for_points(lat, lon, pad, padlon)
        if len(keys) > SPREAD_CELLS:        # points far apart: only the cells around them
            keys = mapcells.cells_near_points(lat, lon, pad, padlon)
        return keys

    def _plan_set(self, keys, roads_only):
        """(plans, PlanPack of them) of the cells keys: each road once, in the order of their keys. Remembered once all
        the cells are planned (a road tile asks for the same few cells' plans dozens of times: merging them cost a
        Canton tile set ~1.6 s)."""
        self._plan_missing(keys)
        mk = (tuple(sorted(str(k) for k in keys)), bool(roads_only))
        memo = self.__dict__.setdefault("_plan_sets", {})
        with self.lock:
            hit = memo.get(mk)
        if hit is not None:
            return hit
        got = {}
        for key in keys:
            for fid_part, p in self._cell_plans(key):
                if roads_only and TUNNEL_TAG in fid_part:
                    continue
                got.setdefault((fid_part, float(p.xy[0, 0]), float(p.xy[0, 1])), p)
        # in the order of their keys: grade_points' sums run in plan order, so every caller (the block, a road
        # tile, a far tile) gets the same heights at a point whatever other cells its points reached
        plans = [got[k] for k in sorted(got)]
        out = (plans, PlanPack(plans))
        with self.lock:
            if all(k in self.cells for k in keys):      # (not while a cell's fetch failed: it is asked again)
                if len(memo) >= PLAN_SETS_MAX:
                    memo.pop(next(iter(memo)))
                memo[mk] = out
        return out

    def apply(self, lat, lon, base, lift=0.0, roads_only=False, planned_only=False):
        """base (the ungraded heights at the points) graded under the roads. Same shape as base.
        lift: m added under the roads (tapering with the grading's weight): the physics block and the
        road mesh use ROAD_LIFT, the visible ground tiles 0, so the road mesh lies exactly on the
        ground the tyres touch while the visible ground stays a little below it (no z-fighting;
        the user saw the tyres sink into a road mesh lifted above the physics ground).
        planned_only: graded only under the cells planned already (none planned here: the AI graph's wide window, whose
        planning held a Windows PC's road processes for minutes)."""
        lat = np.asarray(lat, np.float64)
        lon = np.asarray(lon, np.float64)
        base = np.asarray(base, np.float64)
        shape = base.shape
        if base.size == 0:
            return base
        keys = self._keys(lat, lon)
        if planned_only:
            with self.lock:
                have = {k for k in keys if k in self.cells}
            for k in keys:              # (a neighbouring region's, planned there: read in)
                src = None if k in have else self._foreign(k)
                if src is not None:
                    with src.lock:
                        if k in src.cells:
                            have.add(k)
            keys = [k for k in keys if k in have]
            if not keys:
                return base
        plans, pack = self._plan_set(keys, roads_only)
        if not plans:
            return base
        e, n, _ = self.frame.geodetic_to_enu(lat.ravel(), lon.ravel(), 0.0)
        e, n = np.asarray(e), np.asarray(n)
        out = grade_points(e, n, base.ravel(), pack, lift)
        out = regrade_past_ends(e, n, base.ravel(), plans, out, lift)
        race = self._on_kept(e, n)
        if race is not None:                # (the terrain is a racetrack's surface)
            out[race] = base.ravel()[race]
        keep = self._over_tunnels(e, n)
        if keep is not None:
            # (a small change stays: a road over the tunnel lies on its own graded profile, the ground over the tunnel
            # left ungraded under it stood a few cm over the E6's lanes as patches of bare ground)
            keep &= np.abs(out - base.ravel()) >= OVER_TUNNEL_SMALL_M
            out[keep] = base.ravel()[keep]
        return out.reshape(shape)

    def open_tunnels(self, lat, lon):
        """[(lat (k,), lon (k,), Spec)] of the tunnels' open sections planned near the points: roads on the ground
        that the map calls tunnels (surface.paint_roads paints them: grass grew over the open road of Central Park's
        79th Street Transverse)."""
        lat = np.asarray(lat, np.float64)
        lon = np.asarray(lon, np.float64)
        if lat.size == 0:
            return []
        for key in mapcells.cells_for_points(lat, lon):
            self._cell_plans(key)
        with self.lock:
            secs = [o for v in self.opens.values() for o in v]
        out, seen = [], set()
        for xy, spec in secs:
            k = (round(float(xy[0, 0]), 2), round(float(xy[0, 1]), 2), len(xy))
            if k in seen:
                continue
            seen.add(k)
            la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
            la, lo = np.asarray(la), np.asarray(lo)
            if la.max() < lat.min() - 0.001 or la.min() > lat.max() + 0.001 or \
                    lo.max() < lon.min() - 0.0015 or lo.min() > lon.max() + 0.0015:
                continue
            out.append((la, lo, spec))
        return out

    def _on_kept(self, e, n):
        """Which points lie on an UNGRADED road's carriageway (+ UNGRADED_MARGIN_M), or None."""
        with self.lock:
            zones = [z for v in self.keeps.values() for z in v]
        if not zones or not len(e):
            return None
        import fast
        fast.require(0, "over_tunnel")
        mask = np.zeros(len(e), bool)
        ee, nn = np.ascontiguousarray(e, np.float64), np.ascontiguousarray(n, np.float64)
        for xy, hw in zones:
            fast._ef.over_tunnel(mask, ee, nn, np.ascontiguousarray(xy[:, :2], np.float64), float(hw), 0.0)
        return mask if mask.any() else None

    def _over_tunnels(self, e, n):
        """Which points lie over a covered tunnel (its half width + TUNNEL_KEEP_M), or None."""
        with self.lock:
            zones = [z for v in self.covers.values() for z in v]
        if not zones or not len(e):
            return None
        import fast
        fast.require(0, "over_tunnel")      # (Rust: per segment near the points, without the GIL)
        mask = np.zeros(len(e), bool)
        ee, nn = np.ascontiguousarray(e, np.float64), np.ascontiguousarray(n, np.float64)
        for xy, hw in zones:
            fast._ef.over_tunnel(mask, ee, nn, np.ascontiguousarray(xy[:, :2], np.float64), float(hw),
                                 float(TUNNEL_KEEP_IN_M))
        return mask if mask.any() else None


# (read inside functions only; here so that the parts can load each other)
from .settings import (
    ABUT_FILL_ON, APPROACH_CELL_M, APPROACH_MAX_LIFT, APPROACH_MAX_RUN, APPROACH_MIN_CROSS_M, APPROACH_MIN_LIFT,
    APPROACH_ON, APPROACH_SKIP, APPROACH_TOUCH_M, CHAIN_JOIN_M, CHAIN_LOOK_M, CHAIN_ON, CHAIN_TURN_DEG,
    COARSE_EASE_ON, COARSE_MAX_SLOPE, COARSE_MAX_STEP_M, COARSE_REACH_M, COARSE_SIGMA_M, CORNERS_ON, DIRT_MEDIAN_M,
    ENU_CACHE_MAX, JUNCTION_SNAP_ON, LONG_PART_M, MEDIAN_M, MOUTH_PLAN_M, OBS_END_M, OBS_HALF_M, OVER_TUNNEL_SMALL_M,
    PLAN_SETS_MAX, PLAN_THREADS, PROFILE_STEP, RAIL_GRADE_ON, RAIL_TAG, RETRY_S, ROAD_LIFT, SPREAD_CELLS,
    TUNNEL_KEEP_IN_M, TUNNEL_KEEP_M, TUNNEL_TAG, T_MAX, UNDER_ANY_ON, UNDER_HUMP_EDGE_M, UNDER_HUMP_MIN_M,
    UNDER_HUMP_RAIL_HALF_M, UNDER_HUMP_SIN_MIN, UNDER_HUMP_WIN_M, UNDER_MAX_BRIDGE_M, UNDER_MAX_DROP_M, UNDER_NEAR_M,
    UNDER_ON, UNDER_REACH_M, UNGRADED, UNGRADED_MARGIN_M, VERTEX_STEP, WATER_CURVE_M, WATER_LIFT_ON, WATER_MAX_LIFT,
    log
)  # noqa: E402
from .profiles import (
    Plan, _point_along, clip_polyline, median_profile, plan_roads, profile_sigma, resample, smooth_profile,
    tunnel_plan
)  # noqa: E402
from .banks import BANK_DESIGN, BANK_ON, BANK_RUNOFF_M, BANK_SIGMA_M, BANK_STENCIL_M  # noqa: E402
from .snap import _UNSET, _twin_trimmed, _with_lows, road_rank, shoulder, snap_junctions  # noqa: E402
from .grader import PlanPack, mapped_plan, road_id, trim_plan  # noqa: E402
from .points import grade_points  # noqa: E402
from .bridges import (
    _arc_on, _is_link, _never_raised, approach_add, bridge_chain, bridge_chain_ends_free, bridge_lifts, hump_dip,
    hump_height, junction_ends, raisable_ends, regrade_past_ends, underpass_offsets
)  # noqa: E402
