"""_Planner: all plans of a region, their bridges, tunnels and junctions."""
import math
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import numpy as np

import mapcells
import roads as roadsmod

from .settings import (
    ABUT_FILL_ON, APPROACH_ON, CHAIN_ON, CLIP_MARGIN_M, COARSE_EASE_ON, COARSE_MAX_SLOPE, COARSE_MAX_STEP_M,
    COARSE_REACH_M, COARSE_SIGMA_M, CORNERS_ON, JUNCTION_SNAP_ON, LONG_PART_M, OVER_TUNNEL_SMALL_M, PLAN_SETS_MAX,
    PLAN_THREADS, RAIL_GRADE_ON, RAIL_TAG, RETRY_S, SPREAD_CELLS, TUNNEL_KEEP_IN_M, TUNNEL_KEEP_M, TUNNEL_TAG, T_MAX,
    UNDER_ON, UNGRADED, UNGRADED_MARGIN_M, log
)
from .snap import _twin_trimmed, _with_lows, road_rank, snap_junctions
from .profiles import (Plan, carriageway_of, clip_polyline, mapped_plan, plan_roads, road_id, trim_plan,
                       tunnel_plan)
from .points import PlanPack, grade_points
from .bridges import junction_ends, regrade_past_ends
from .ends import _Ends
from .approaches import _Approaches
from .abutments import _Abutments
from .tunnels import _Tunnels

_UNSET = object()


class _Planner(_Ends, _Approaches, _Abutments, _Tunnels):
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
            names = feats.attrs.get("name")
            parts, ids, clipped, roads_of = [], [], [], []
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
                        roads_of.append(carriageway_of(specs[i], None if names is None else names[i]))
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
                    p.road = roads_of[j]
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
        out = regrade_past_ends(e, n, base.ravel(), plans, out, lift, pack)
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
