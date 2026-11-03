"""PlanStore, Grader, PlanPack: plans shared and asked for heights."""
import threading
from collections import OrderedDict

import numpy as np

from .planner import _Planner


def mapped_plan(p, fn):
    """Plan p with its vertices through fn (xy (n, 2) -> (n, 2): geotiles.world_xy_map); heights, widths, cuttings and
    banking as they are (geodetic, or along / across the road)."""
    q = Plan(fn(p.xy), p.z, p.half, p.abut, p.cut, p.road_half)
    q.rid, q.max_wall, q.bank = p.rid, p.max_wall, getattr(p, "bank", None)
    q.tunnel = getattr(p, "tunnel", False)
    q.under = getattr(p, "under", (False, False))
    q.beyond = getattr(p, "beyond", (None, None))
    return q


class PlanStore:
    """Every road plan of a process, whatever the anchor: one _Planner per planning region (geotiles.PLAN_Z), made on
    first use. mapdata, elev (lat, lon -> m at PROFILE_ZOOM, raw), widths as the Grader's; wet, dem, shared (the
    planners' settings) set after it is made, as on a Grader (which forwards them here)."""

    def __init__(self, mapdata, elev, widths=None):
        self.md, self.elev, self.widths = mapdata, elev, widths
        self.wet = None
        self.dem = None
        self.shared = None
        self.lock = threading.Lock()
        self.planners = OrderedDict()   # (rx, ry) -> _Planner, the least recently used first

    @staticmethod
    def frame_of(region):
        """The planning frame of a region (geotiles.region_frame; a test replaying samples captured in one frame
        sets its own)."""
        import geotiles
        return geotiles.region_frame(*region)

    def planner(self, region):
        region = (int(region[0]), int(region[1]))
        with self.lock:
            got = self.planners.get(region)
            if got is None:
                got = self.planners[region] = _Planner(self.frame_of(region), self.md, self.elev, self.widths,
                                                       store=self, region=region)
                # (the regions far behind go: their plans are on disk, plancache; a drive across a continent kept
                # every cell it passed)
                while len(self.planners) > PLANNERS_KEPT:
                    self.planners.popitem(last=False)
            else:
                self.planners.move_to_end(region)
            return got

    def planner_of_cell(self, key):
        import geotiles
        return self.planner(geotiles.region_of_cell(key))

    def planners_of(self, lat, lon):
        """[(planner, index array)] of the points' regions (most calls: one)."""
        import geotiles
        lat = np.asarray(lat, np.float64).ravel()
        lon = np.asarray(lon, np.float64).ravel()
        rx, ry = geotiles.region_of(lat, lon)
        rx, ry = np.atleast_1d(rx), np.atleast_1d(ry)
        if len(rx) and (rx == rx[0]).all() and (ry == ry[0]).all():
            return [(self.planner((int(rx[0]), int(ry[0]))), None)]
        out = []
        for a, b in sorted({(int(a), int(b)) for a, b in zip(rx, ry)}):
            out.append((self.planner((a, b)), np.flatnonzero((rx == a) & (ry == b))))
        return out


PLANNERS_KEPT = 6               # planning regions a PlanStore keeps in memory (~30 km each)
MAPPED_MAX = 256                # cells' plans mapped into an anchor's world kept (Grader._cell_plans)


class Grader:
    """The road plans as one anchor frame sees them (the PlanStore's, store: shared by the process's anchors; its own
    without one). Heights (apply) are the planners', in their regions' frames: the same at a place whatever the
    anchor. Plans and outlines handed out (plans, _cell_plans) are in this frame's world."""

    def __init__(self, frame, mapdata, elev, widths=None, store=None):
        self.frame = frame
        self.store = store if store is not None else PlanStore(mapdata, elev, widths)
        self.md, self.elev, self.widths = self.store.md, self.store.elev, self.store.widths
        self.lock = threading.Lock()
        self._mapped = OrderedDict()        # cell key -> its plans in this frame

    def _set(name):
        return property(lambda self: getattr(self.store, name), lambda self, v: setattr(self.store, name, v))
    wet = _set("wet")
    dem = _set("dem")
    shared = _set("shared")
    del _set

    def planned(self, key):
        """True once cell key's plans exist (made, or failed recently), by any anchor of the store."""
        return self.store.planner_of_cell(key).planned(key)

    def warm(self, key):
        """Make cell key's plans now (worker threads: the lookahead ahead of the player)."""
        self.store.planner_of_cell(key)._cell_plans(key)

    def _cell_plans(self, key):
        """[(fid, Plan)] of cell key, in this frame's world (mapped from its region's frame; kept)."""
        with self.lock:
            got = self._mapped.get(key)
            if got is not None:
                self._mapped.move_to_end(key)
                return got
        pl = self.store.planner_of_cell(key)
        plans = pl._cell_plans(key)
        with pl.lock:
            done = key in pl.cells
        import geotiles

        def m(xy):
            return geotiles.world_xy_map(pl.frame, self.frame, xy)
        got = [(fid, mapped_plan(p, m)) for fid, p in plans]
        if done:
            with self.lock:
                got = self._mapped.setdefault(key, got)
                while len(self._mapped) > MAPPED_MAX:
                    self._mapped.popitem(last=False)
        return got

    _clip_box = _Planner._clip_box          # (in this frame: self.frame only)
    _keys = staticmethod(_Planner._keys)
    _over_tunnels = _Planner._over_tunnels  # (a namespace with covers and lock: tests)
    _on_kept = _Planner._on_kept

    def plans(self, lat, lon, roads_only=False):
        """The Plans touching the points' area (each road once), in this frame's world; roads_only: not the tunnels'
        (TUNNEL_TAG). In the order of the plans' own region (as _Planner._plan_set)."""
        keys = self._keys(lat, lon)
        got = {}
        for key in keys:
            for fid_part, p in self._cell_plans(key):
                if roads_only and TUNNEL_TAG in fid_part:
                    continue
                got.setdefault((fid_part, float(p.xy[0, 0]), float(p.xy[0, 1])), p)
        return [got[k] for k in sorted(got)]

    def apply(self, lat, lon, base, lift=0.0, roads_only=False, planned_only=False):
        """_Planner.apply by the points' regions (the anchor plays no part). Same shape as base."""
        lat = np.asarray(lat, np.float64)
        lon = np.asarray(lon, np.float64)
        base = np.asarray(base, np.float64)
        if base.size == 0:
            return base
        parts = self.store.planners_of(lat, lon)
        if len(parts) == 1:
            return parts[0][0].apply(lat, lon, base, lift, roads_only, planned_only)
        la, lo, b = lat.ravel(), lon.ravel(), base.ravel()
        out = np.array(b, np.float64, copy=True)
        for pl, idx in parts:
            out[idx] = pl.apply(la[idx], lo[idx], b[idx], lift, roads_only, planned_only)
        return out.reshape(base.shape)

    def open_tunnels(self, lat, lon):
        """_Planner.open_tunnels by the points' regions: [(lat (k,), lon (k,), Spec)], each section once."""
        lat = np.asarray(lat, np.float64).ravel()
        lon = np.asarray(lon, np.float64).ravel()
        if lat.size == 0:
            return []
        out, seen = [], set()
        for pl, idx in self.store.planners_of(lat, lon):
            for la, lo, spec in pl.open_tunnels(lat if idx is None else lat[idx], lon if idx is None else lon[idx]):
                k = (round(float(la[0]), 7), round(float(lo[0]), 7), len(la))
                if k not in seen:
                    seen.add(k)
                    out.append((la, lo, spec))
        return out


def trim_plan(p, box):
    """The pieces of Plan p within box (x0, y0, x1, y1), or a convex polygon (k, 2): cut at its edges (earthfast.clip_segments), heights and
    cuttings with them; an end not at p's own end leads onto no bridge. [Plan]."""
    import fast
    xy = np.ascontiguousarray(np.asarray(p.xy, np.float64)[:, :2])
    if len(xy) < 2:
        return [p]
    if np.ndim(box) == 2:               # a convex polygon (a cell's quad: _Planner._clip_quad)
        fast.require(104, "clip_segments_convex")
        t = np.asarray(fast._ef.clip_segments_convex(xy, np.ascontiguousarray(box, np.float64)))
    else:
        fast.require(44, "clip_segments")
        t = np.asarray(fast._ef.clip_segments(xy, tuple(float(v) for v in box)))
    ok = np.isfinite(t[:, 0])
    if ok.all() and (t[:, 0] == 0.0).all() and (t[:, 1] == 1.0).all():
        return [p]
    out, i, n = [], 0, len(ok)
    while i < n:
        if not ok[i]:
            i += 1
            continue
        j = i
        while j + 1 < n and ok[j + 1] and t[j, 1] == 1.0 and t[j + 1, 0] == 0.0:
            j += 1
        t0, t1 = t[i, 0], t[j, 1]
        a = xy[i] + (xy[i + 1] - xy[i]) * t0
        b = xy[j] + (xy[j + 1] - xy[j]) * t1
        za = p.z[i] + (p.z[i + 1] - p.z[i]) * t0
        zb = p.z[j] + (p.z[j + 1] - p.z[j]) * t1
        pxy = np.vstack([a, xy[i + 1:j + 1], b])
        pz = np.r_[za, p.z[i + 1:j + 1], zb]
        pb = getattr(p, "bank", None)
        if pb is not None:
            pb = np.r_[pb[i] + (pb[i + 1] - pb[i]) * t0, pb[i + 1:j + 1], pb[j] + (pb[j + 1] - pb[j]) * t1]
        if np.hypot(*(pxy[-1] - pxy[0])) > 1e-6 or len(pxy) > 2:
            q = Plan(pxy, pz, p.half, (p.abut[0] and i == 0 and t0 == 0.0, p.abut[1] and j == n - 1 and t1 == 1.0),
                     None if p.cut is None else np.asarray(p.cut)[i:j + 1].copy(), p.road_half)
            q.rid = getattr(p, "rid", -1)
            q.max_wall = getattr(p, "max_wall", WALL_MAX_H_M)
            q.bank = pb
            q.tunnel = getattr(p, "tunnel", False)
            fr = getattr(p, "free", (False, False))     # (only the pieces with its own ends)
            q.free = (fr[0] and i == 0 and t0 == 0.0, fr[1] and j == n - 1 and t1 == 1.0)
            first, last = i == 0 and t0 == 0.0, j == n - 1 and t1 == 1.0
            un, by = getattr(p, "under", (False, False)), getattr(p, "beyond", (None, None))
            q.under = (un[0] and first, un[1] and last)
            q.beyond = (by[0] if first else None, by[1] if last else None)
            out.append(q)
        i = j + 1
    return out


def road_id(fid):
    """A stable integer id of a map feature (grade_points: a road never gives way to itself, though each map cell
    plans its own stretch of it: the Stelvio Pass's hairpins sank under their own other stretches)."""
    import zlib
    return zlib.crc32(str(fid).encode()) & 0x7FFFFFFF


class PlanPack:
    """Plans (a list, in grade_points' order) as grade_points takes them: every segment's arrays concatenated once, with
    each plan's box; a call keeps the segments of the plans whose boxes meet its points', in the same order (built per
    call, the plans' Python loop cost a Canton tile set ~1 s)."""

    def __init__(self, plans):
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


# (read inside functions only; here so that the parts can load each other)
from .settings import ABUT_NEAR_M, TUNNEL_TAG  # noqa: E402
from .profiles import Plan, WALL_MAX_H_M  # noqa: E402
from .points import _beside_strength, _past_segments, _yield_strength  # noqa: E402
