"""PlanStore, Grader, PlanPack: plans shared and asked for heights."""
import threading
from collections import OrderedDict

import numpy as np

from .settings import TUNNEL_TAG
from .profiles import mapped_plan
from .planner import _Planner


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
