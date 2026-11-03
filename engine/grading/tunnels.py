"""Tunnels in the plans: their sections, portals and approaches, the roads and decks over them,
the floor into a covered section's mouth, tunnels under water."""
import math

import numpy as np

import mapcells
import roads as roadsmod

from .settings import MOUTH_PLAN_M, TUNNEL_KEEP_M, TUNNEL_TAG, VERTEX_STEP, log
from .snap import _twin_trimmed, shoulder
from .profiles import Plan, resample, tunnel_plan
from .points import PlanPack, grade_points


class _Tunnels:
    """_Planner inherits these methods; they read and write its state."""

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
