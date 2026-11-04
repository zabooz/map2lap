"""ChainStore, ChainView: parts chained across tiles."""
import threading
from collections import OrderedDict

import numpy as np

import mapgeom
import roadmesh

from .tiles import box_owns
from .bridges import BridgeProfiles, NEAR_M, _Mapper


class ChainStore:
    """Bridge (or tunnel) chain profiles shared by every anchor of a process (geotiles): one
    BridgeProfiles / TunnelProfiles per geotiles.CHAIN_Z region in that region's frame (a WorldFrame: nearly level
    over a chain), a part asked for in the store of its first point's region, a chain solved in the store of its first
    part's (owner_of): one deck profile per chain, whatever the anchor or the store a tile asks. cell_fn, elev (the
    physics ground: anchor-free, as grading's heights are) as BridgeProfiles'; setup(profiles) sets wet, infra_fn,
    raw, ends on each store made. Anchors see it through a ChainView."""

    KEPT = 12           # stores kept (the farthest regions behind go first)
    road_end = None     # (BridgeProfiles.road_end, on each store)

    def set_road_end(self, fn):
        with self.lock:
            self.road_end = fn
            for st in self.stores.values():
                st.road_end = fn

    def __init__(self, cls, cell_fn, elev, setup=None):
        self.cls, self.cell_fn, self.elev, self.setup = cls, cell_fn, elev, setup
        self.stores = OrderedDict()     # region -> profiles
        self.lock = threading.Lock()

    def store(self, region):
        region = (int(region[0]), int(region[1]))
        with self.lock:
            got = self.stores.get(region)
            if got is not None:
                self.stores.move_to_end(region)
                return got
            import geotiles
            got = self.cls(geotiles.frame(region[0], region[1], geotiles.CHAIN_Z), self.cell_fn, self.elev)
            got.owner_of = self._owner
            got.region = region
            got.road_end = self.road_end
            if self.setup is not None:
                self.setup(got)
            self.stores[region] = got
            while len(self.stores) > self.KEPT:
                self.stores.popitem(last=False)
            return got

    def store_at(self, lat, lon):
        import geotiles
        return self.store(geotiles.tile_of(float(lat), float(lon), geotiles.CHAIN_Z))

    def _owner(self, prof, comp, pool):
        """The store whose region holds chain comp's first part's start."""
        first = min(comp)
        (la, lo), _ = prof._ends_ll(pool[first][1])
        return self.store_at(la, lo)


class ChainView:
    """An anchor's view of a ChainStore, with BridgeProfiles' / TunnelProfiles' read side (parts, open_parts,
    piers_in, beams_in, _ground, heights, mouths, height, portal_ups, cap_m, mouth): the parts asked for in
    their regions' stores, their geometry mapped exactly into this frame's world (kept per part). prefer: another
    ChainStore whose chains, where solved already, are taken first (the AI graph and the far bridges take the road
    tiles' decks: one profile per chain)."""

    def __init__(self, cs, frame, prefer=None):
        self.cs, self.frame, self.prefer = cs, frame, prefer
        self.elev = cs.elev
        self.lock = threading.Lock()
        self._mapped = {}           # (store region, pid, id(xy)) -> (xy ref, mapped part)
        self._piers = {}            # store region -> (version, mapped piers, mapped beams)
        self.specs_of, self.parts_of = cs.cls.specs_of, cs.cls.parts_of

    deck_bank = BridgeProfiles.deck_bank        # (in this frame, its plans_at)
    road_bank = BridgeProfiles.road_bank
    plans_at = None

    def __getattr__(self, name):        # wet, infra_fn, raw, ends: the stores' settings (setup)
        if name in ("wet", "infra_fn", "raw", "ends"):
            st = list(self.cs.stores.values())
            return getattr(st[0], name, None) if st else None
        raise AttributeError(name)

    def _todo(self, cells_feats, box):
        """{store: [((fid, j), feats, i)]} of the parts in these cells that come near box (this frame)."""
        x0, y0, x1, y1 = box
        by, queued = {}, set()
        for feats in cells_feats:
            if feats is None or len(feats) == 0:
                continue
            bs = self.specs_of(feats)
            for i in range(len(feats)):
                if bs[i] is None:
                    continue
                fid = str(feats.ids[i])
                for j, ring in enumerate(self.parts_of(feats, i)):
                    if (fid, j) in queued:
                        continue
                    e, n = mapgeom.enu_xy(feats, self.frame, ring)
                    if e.max() < x0 - NEAR_M or e.min() > x1 + NEAR_M or n.max() < y0 - NEAR_M or n.min() > y1 + NEAR_M:
                        continue
                    queued.add((fid, j))
                    st = self.cs.store_at(float(ring[0][1]), float(ring[0][0]))
                    by.setdefault(st.region, (st, []))[1].append(((fid, j), feats, i))
        return by

    def _map(self, st, got):
        out = []
        mp = None
        for pid, spec, xy, z, lon in got:
            k = (st.region, pid, id(xy))
            with self.lock:
                hit = self._mapped.get(k)
            if hit is None or hit[0] is not xy:
                mp = mp or _Mapper(st.frame, self.frame)
                xyz = mp.pts(np.c_[np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64)])
                hit = (xy, (pid, spec, xyz[:, :2].copy(), xyz[:, 2].copy(), lon))
                with self.lock:
                    if len(self._mapped) > 20000:
                        self._mapped.clear()
                    self._mapped[k] = hit
            out.append(hit[1])
        return out

    def _parts(self, cells_feats, box, **kw):
        out = []
        for _r, (st, todo) in sorted(self._todo(cells_feats, box).items()):
            if self.prefer is not None:
                pst = self.prefer.store(st.region)
                with pst.lock:
                    solved = [t for t in todo if t[0] in pst.done]
                out += self._map(pst, pst.parts_todo(solved, solved_only=True, **kw))
                todo = [t for t in todo if t not in solved]
            out += self._map(st, st.parts_todo(todo, **kw))
        return out

    def parts(self, cells_feats, box):
        return self._parts(cells_feats, box)

    def open_parts(self, cells_feats, box):
        return self._parts(cells_feats, box, open_=True)

    def _stores(self):
        out = list(self.cs.stores.values())
        if self.prefer is not None:
            out += list(self.prefer.stores.values())
        return out

    def _mapped_piers(self, st):
        with st.lock:
            ver = (len(st.piers), sum(len(v) for v in st.piers.values()), len(st.trusses),
                   sum(len(v) for v in st.trusses.values()))
            piers = [q for v in st.piers.values() for q in v]
            beams = [b for v in st.trusses.values() for b in v]
        key = (id(st), st.region)
        with self.lock:
            hit = self._piers.get(key)
        if hit is None or hit[0] != ver:
            mp = _Mapper(st.frame, self.frame)
            hit = (ver, [mp.pier(q) for q in piers], [mp.beam(b) for b in beams])
            with self.lock:
                self._piers[key] = hit
        return hit[1], hit[2]

    def piers_in(self, box):
        x0, y0, x1, y1 = box
        out, seen = [], set()
        for st in self._stores():
            for q in self._mapped_piers(st)[0]:
                k = (round(q[0], 3), round(q[1], 3))
                if box_owns(box, q[0], q[1]) and k not in seen:
                    seen.add(k)
                    out.append(q)
        return out

    def beams_in(self, box):
        x0, y0, x1, y1 = box
        out, seen = [], set()
        for st in self._stores():
            for b in self._mapped_piers(st)[1]:
                mx, my = (b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2
                k = (round(float(mx), 3), round(float(my), 3), round(float(b[0][2]), 3))
                if box_owns(box, mx, my) and k not in seen:
                    seen.add(k)
                    out.append(b)
        return out

    def _ground(self, xy):
        xy = np.asarray(xy, np.float64)
        la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        return self.frame.geodetic_to_enu(la, lo, np.asarray(self.elev(la, lo), np.float64))[2]

    def _merged(self, name):
        out = {}
        for st in self._stores():
            with st.lock:
                for k, v in getattr(st, name, {}).items():
                    out.setdefault(k, v)
        return out

    heights = property(lambda self: self._merged("heights"))
    mouths = property(lambda self: self._merged("mouths"))
    roofs = property(lambda self: self._merged("roofs"))

    def _sub(self, method, fid, default):
        for st in self._stores():
            with st.lock:
                if any(fid in getattr(st, d, {}) for d in ("heights", "ups", "caps", "mouths")):
                    break
        else:
            st = None
        if st is None:
            return default
        return getattr(st, method)(fid)

    def height(self, fid):
        return self._sub("height", fid, roadmesh.TUNNEL_H)

    def portal_ups(self, fid):
        return self._sub("portal_ups", fid, [roadmesh.PORTAL_FRAME, roadmesh.PORTAL_FRAME])

    def cap_m(self, fid):
        return self._sub("cap_m", fid, (None, None))

    def mouth(self, fid):
        return self._sub("mouth", fid, (True, True))
