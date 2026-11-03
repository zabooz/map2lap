"""TunnelProfiles: floors, portals and their approaches, holes in the terrain, tunnel meshes."""
import math
import threading

import numpy as np

import mapcells
import mapgeom
import roadmesh

from .style import BUILT, EDGE_DECAL, GUTTER, SIDEWALK, SIMPLIFY_Z_M, log, look_of, terrain_surface
from .specs import road_specs
from .levels import PORTAL_EXTEND_MAX_M, gallery_parts, ground_parts, tunnel_parts, tunnel_specs
from .tiles import _along, _chunk, split
from .walks import clip_polyline, densify, extras, simplify
from .decks import CONCRETE_WALL_CLASSES, SECTION_MIN_M, TUNNEL_COVER, UNDER_DECK, _EndJoin, cover_roads, portal_cover
from .bridges import BridgeProfiles, DECK_STEP, OBS_BLEND_DG, OBS_BLEND_MIN_M
from .deckmesh import _deck_look


TUNNEL_WET_SHARE = 0.25 # a tunnel part with more of its points under water is left out (TunnelProfiles.wet)
TUNNEL_WET_COVER_M = 60.0   # m: water this far over the chain's lower portal is no underwater tunnel's (_mark_drowned)
TUNNEL_WET_RUN_M = 20.0 # ... and a tunnel chain passing under water this far away from its ends (_mark_drowned)
TUNNEL_OPEN_COVER = 4.0 # m: a 'tunnel' whose ground nowhere rises this far over the straight line between its portals
                        # is an underpass in the open (under a bridge the map does not draw as a deck over it): a road
                        # on the ground, no tube, portals or holes (Central Park's 86th Street Transverse under its
                        # park bridges got portal frames standing in the open). Between it
                        # and TUNNEL_COVER: a low arch (a park's stone bridge over a sunken road, Central Park's West
                        # Drive over the 86th Street Transverse: 3.4 m clearance under ~1.5 m of arch and soil):
                        # straight between its portals, its tube as high as the ground over it allows (TUNNEL_SOIL_M
                        # under it, at least TUNNEL_LOW_H), of stone (roadmesh.tunnel)
PORTAL_LOOK_M = 12.0    # m inside a portal where the ground over it is read for its face's height ...
PORTAL_GROUND_M = 0.5   # ... which reaches this far over that ground ...
PORTAL_UP_MIN = 1.0     # ... and at least this far over the vault
FULL_MIN_M = 60.0       # a covered section reaching TUNNEL_COVER is a full tunnel (a rock tube) if it is this long or
FULL_DEEP_M = 16.0      # has this much ground over it somewhere; shorter and shallower, an underpass under an embankment:
                        # a low arch, the ground built up over it (a 31 m underpass under the E6 in Norway with 8.6 m of
                        # embankment over it stood as a bare 6.8 m concrete tube on the ground beside the road)
TUNNEL_SOIL_M = 1.0     # m of arch and soil kept over a low tunnel's vault
ARCH_SIZE_SKIP_M = 5.0  # m at a low arch's mouths left out when its height is sized from the cover over it
ROAD_CAP_JOIN_M = 20.0  # a road with an end this near a low arch's mouth joins it (its own road going on), not one over it
ROAD_CAP_GAP_M = 0.5    # m a low arch's stone top stops short of a carriageway over its mouth ...
ROAD_CAP_OVER_M = 1.0   # ... and its portal face reaches at most this far over that road
TUNNEL_LOW_H = 3.6      # m: the lowest tube (floor to vault)
MAJOR_LOW_H = 5.0       # m: ... on a major road (CONCRETE_WALL_CLASSES: road tunnels clear ~4.5 m, a truck ~4 m)


TWIN_SHARE = 0.8        # a tunnel part beside another for this share of its length (their tubes overlapping) ...
TWIN_DZ_M = 2.0         # ... with its floor within this of the other's: twin tubes, one tube round both (
                        # the Route des Tamarins' two carriageways 9.5 m apart on Réunion, each an 11 m road in its own
                        # tube, the tubes through each other's walls and portals)
TWIN_STEP_M = 10.0


def tunnel_sections(s, g, open_cover=None, full_cover=None, min_m=SECTION_MIN_M):
    """A tunnel's road level and its sections from the ground over it (g at arc lengths s): (floor, kinds). floor: the
    lower convex hull of (s, g), the road's level under the covered parts and the ground where it lies open; kinds per
    sample: 0 open road, 1 a low arch, 2 a full tunnel (a run with TUNNEL_OPEN_COVER over the floor, full where it
    reaches TUNNEL_COVER; runs and gaps shorter than min_m merged away). One long 'tunnel' in the map can be a sunken
    road with arches and a rock tunnel along it (Central Park's 79th Street Transverse, 683 m: one tube).
    The Rust kernel (fast). Pure."""
    s = np.ascontiguousarray(s, np.float64)
    g = np.ascontiguousarray(g, np.float64)
    oc = TUNNEL_OPEN_COVER if open_cover is None else open_cover
    fc = TUNNEL_COVER if full_cover is None else full_cover
    step = float(np.median(np.diff(s))) if len(s) > 1 else 1.0
    min_n = max(1, int(math.ceil(min_m / max(step, 1e-6))))
    import fast
    fast.require(28, "tunnel_sections")
    f, k = fast._ef.tunnel_sections(s, g, float(oc), float(fc), int(min_n))
    return _shallow_full_low(s, g, np.asarray(f), np.asarray(k))


# An avalanche gallery (osmtags.GALLERY_FLAG) is a roof against the slope on pillars, open toward the valley: a road in
# the open at the tunnel's floor (straight under the roof: the lower hull, the scan never saw the road there), graded and
# painted as an open section, with the gallery drawn over it (roadmesh.tunnel's galleries): GALLERY_KIND along all of
# the map's gallery. The elevation data cannot tell its roof from the rock it leans on: the cover over the floor
# (tunnel_sections) put the Grossglockner road's Freiwand gallery's roof from route metre 575 or 296 or nowhere as the
# floor's height moved by a few metres. As a tube it stood in the open, a low arch's grass cap across the lanes, its
# terrain holes and portal faces in the slope. (Where the map's way runs on past the real roof, so does the drawn one.)
GALLERY_KIND = 3
GALLERY_ON_M = 1.0      # m from a gallery's line a tunnel sample counts as on it (the same line, resampled)


def gallery_kinds(xy, kinds, lines, kind=GALLERY_KIND):
    """kinds (tunnel_sections') with the samples of xy (k, 2) within GALLERY_ON_M of a gallery's line (lines: [(m, 2)] in
    the same frame) set to kind (UNDER_DECK kept). Pure."""
    kinds = np.array(kinds, np.int64)
    on = _near_lines(xy, lines, GALLERY_ON_M)
    kinds[on & (kinds != UNDER_DECK)] = kind
    return kinds


def _near_lines(xy, lines, tol):
    """Which points of xy (k, 2) lie within tol m of one of the polylines lines ([(m, 2)]). Pure."""
    xy = np.asarray(xy, np.float64)[:, :2]
    on = np.zeros(len(xy), bool)
    for ln in lines:
        on |= _line_gap(xy, ln)[0] <= tol
    return on


def _line_gap(xy, ln):
    """(distance (k,), segment index (k,), fraction along it (k,)) of each point of xy (k, 2) to the polyline ln (m, 2)'s
    nearest point; inf without a segment. Pure."""
    xy = np.asarray(xy, np.float64)[:, :2]
    ln = np.asarray(ln, np.float64)[:, :2]
    if len(ln) < 2:
        return np.full(len(xy), np.inf), np.zeros(len(xy), np.int64), np.zeros(len(xy))
    a, d = ln[:-1], ln[1:] - ln[:-1]
    t = np.clip(((xy[:, None, :] - a[None]) * d[None]).sum(-1) / np.maximum((d * d).sum(-1), 1e-12)[None], 0.0, 1.0)
    gap = np.hypot(*(xy[:, None, :] - (a[None] + t[..., None] * d[None])).transpose(2, 0, 1))
    k = gap.argmin(axis=1)
    r = np.arange(len(xy))
    return gap[r, k], k, t[r, k]


# A tunnel's floor is the lower hull of the ground along it and along the road going on out of each portal, as far as
# that road's profile smoothing reaches (approach_reach: grading.profile_sigma's three sigma); the approach's road lies
# at most at that hull (grading.Grader._portal_lows). Hulled over the tunnel alone, its portal stood on whatever the
# elevation data had at that one point and the road climbed to it: the Freiwand gallery's way began on a 6 m step of the
# cliff in the data, its approach 30 % up to it and 11 % on (a crest the cars took off from). Where the approach's
# ground lies on the hull (a valley road into a mountain) nothing changes: the Lilienberg tunnel's approaches by under
# 10 cm. (A road that really crosses a crest just before a portal would be cut down to the hull there.)
APPROACH_JOIN_M = 2.0   # m between a portal and the end of the ground road going on from it (the map's shared node)
APPROACH_ON_M = 1.0     # m from an approach's line a road sample takes its hull's height (the same line, resampled)
APPROACH_TURN = 0.0     # cosine: an approach leaves its portal less than 90 degrees off the tunnel's direction
# cosine: a road is held at an approach's hull only where it runs along it, under 45 degrees off (the approach's own road,
# resampled: a few degrees). A road crossing it is another road at its own height: the road over an underpass crosses
# the stretch its tube was carried on under it (_clear_portals), and its point there held at the floor would dip it metres
# down to the tube's floor. (A
# road meeting an approach at under 45 degrees, a slip road merging, is held over its last metres as the approach is.)
APPROACH_ALONG_COS = math.cos(math.radians(45.0))


def approach_reach(spec):
    """m of a tunnel's approaches for road spec: its profile smoothing's reach (grading.profile_sigma)."""
    import grading
    return 3.0 * grading.profile_sigma(spec) + grading.PROFILE_STEP


def approach_lines(feats, frame):
    """The ground roads' lines [(m, 2)] of feats in the frame (ground_parts of the roads road_specs builds)."""
    out = []
    rs = road_specs(feats)
    for i in range(len(feats)):
        if rs[i] is None:
            continue
        for ring in ground_parts(feats, i):
            e, n = mapgeom.enu_xy(feats, frame, ring)
            out.append(np.stack([e, n], axis=1))
    return out


def portal_approaches(xy, lines, reach):
    """(before, after) of a tunnel part's line xy (k, 2): the ground road going on out of its start / its end, from the
    portal outward reach m along the one of lines ([(m, 2)] in the same frame) with an end within APPROACH_JOIN_M of the
    portal that leaves it most nearly straight on ((m, 2), its first point at the portal); None where none does
    (portal_roads). Pure."""
    return portal_roads(xy, lines, reach)[0]


# A tube can run on past the end of the ground road going on from it: _clear_portals carries an underpass's end on until
# its portal face clears the road it passes under, and the road's way still starts at the map's end, inside the tube.
# Looked for only at the portal, that road was no approach: the Weblinger Gürtel's underpass (Graz) was carried on 8 m,
# its road's profile not held at the floor's hull began on the elevation's edge of the road overhead, 20 cm over the
# road under it, and held that for 40 m (a hump onto the floor at the portal). Such a road is the approach from where its
# line passes the portal, and it lies on the floor over the stretch inside (portal_lows).
def portal_roads(xy, lines, reach):
    """((before, after), (m before, m after)) of a tunnel part's line xy (k, 2): portal_approaches, and the m of the tube
    each approach's road runs inside it before its portal (0.0 where it ends at the portal). A road with no end at the
    portal but one on the tube's line within PORTAL_EXTEND_MAX_M of it, its line passing the portal, is the approach from
    there. Pure."""
    xy = np.asarray(xy, np.float64)[:, :2]
    out, inside = [], []
    for end in (0, 1):
        line = xy if end == 0 else xy[::-1]
        p = line[0]
        d = p - _along(line, 5.0)               # (out of the tunnel)
        d = d / max(float(np.hypot(*d)), 1e-9)
        best, bc, m = None, APPROACH_TURN, 0.0
        for ln in lines:
            ln = np.asarray(ln, np.float64)[:, :2]
            if len(ln) < 2:
                continue
            for o in (ln, ln[::-1]):
                if float(np.hypot(*(o[0] - p))) > APPROACH_JOIN_M:
                    continue
                v = _along(o, 5.0) - o[0]
                c = float(v @ d) / max(float(np.hypot(*v)), 1e-9)
                if c > bc:
                    best, bc = o, c
        if best is None:
            best, m = _road_through_portal(line, d, lines)
        if best is None:
            out.append(None)
            inside.append(0.0)
            continue
        sa = np.r_[0.0, np.cumsum(np.hypot(*np.diff(best, axis=0).T))]
        cut = best[sa < reach]
        if sa[-1] > reach:
            cut = np.vstack([cut, _along(best, reach)])
        out.append(cut if len(cut) >= 2 else None)
        inside.append(m if len(cut) >= 2 else 0.0)
    return tuple(out), tuple(inside)


def _road_through_portal(line, d, lines):
    """(the road of lines ([(m, 2)]) going on out through the portal line[0] of a tube's line (k, 2, from that portal
    inward) from its end inside the tube (portal_roads): its line from where it passes the portal ((m, 2)), the m of the
    tube's line from the portal to its end), or (None, 0.0). d: out of the tube. Pure."""
    p = line[0]
    sl = np.r_[0.0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]
    best, bc, bm = None, APPROACH_TURN, 0.0
    for ln in lines:
        ln = np.asarray(ln, np.float64)[:, :2]
        if len(ln) < 2:
            continue
        for o in (ln, ln[::-1]):
            gap, k, t = _line_gap(o[:1], line)
            m = float(sl[k[0]] + t[0] * (sl[k[0] + 1] - sl[k[0]]))
            if gap[0] > APPROACH_JOIN_M or not 0.0 < m <= PORTAL_EXTEND_MAX_M:
                continue
            gp, kp, tp = _line_gap(p[None], o)
            if gp[0] > APPROACH_JOIN_M:
                continue                        # (it ends inside, not on through the portal)
            so = np.r_[0.0, np.cumsum(np.hypot(*np.diff(o, axis=0).T))]
            at = float(so[kp[0]] + tp[0] * (so[kp[0] + 1] - so[kp[0]]))
            rest = np.vstack([_along(o, at)[None], o[so > at + 1e-6]])
            if len(rest) < 2:
                continue
            v = _along(rest, 5.0) - rest[0]
            c = float(v @ d) / max(float(np.hypot(*v)), 1e-9)
            if c > bc:
                best, bc, bm = rest, c, m
    return best, bm


def portal_ends(g, raw):
    """TunnelProfiles.ends for the grader g and the ungraded ground raw(lat, lon): the ground at a portal graded by the
    roads' plans alone (apply roads_only), without grading.ROAD_LIFT, as the grader's own sections read the floor's ends
    (Grader._tunnel_sections). The floor is drawn ROAD_LIFT over its heights (_tunnel_chunks): read with the lift, its
    end lay twice the lift over the road's plan, a 4 cm crest at the portal over the road in front. Pure given g, raw."""
    return lambda la, lo: g.apply(la, lo, raw(la, lo), 0.0, roads_only=True)     # noqa: E731


def approach_floor(s, g, before=None, after=None):
    """tunnel_sections of a tunnel's samples (s: arc lengths, g: ground) with its approaches' joined on (before /
    after: (arc lengths from the portal outward, > 0; their ground), or None): (floor, kinds) at the tunnel's samples,
    and (before, after) the hull at the approaches' samples (None where none). Pure."""
    s, g = np.asarray(s, np.float64), np.asarray(g, np.float64)
    S, G, nb, na = [s], [g], 0, 0
    if before is not None and len(before[0]):
        sb, gb = np.asarray(before[0], np.float64), np.asarray(before[1], np.float64)
        S.insert(0, s[0] - sb[::-1])
        G.insert(0, gb[::-1])
        nb = len(sb)
    if after is not None and len(after[0]):
        sa, ga = np.asarray(after[0], np.float64), np.asarray(after[1], np.float64)
        S.append(s[-1] + sa)
        G.append(ga)
        na = len(sa)
    floor, kinds = tunnel_sections(np.concatenate(S), np.concatenate(G))
    k = len(s)
    return (floor[nb:nb + k], np.asarray(kinds)[nb:nb + k],
            (floor[:nb][::-1] if nb else None, floor[nb + k:] if na else None))


def approach_samples(apps, step, ground_fn):
    """portal_approaches' (before, after) resampled every step m, the portal left out, with their ground (ground_fn(xy
    (m, 2)) -> (m,)): each (arc lengths from the portal, ground, points (m, 2)) or None. Pure given ground_fn."""
    import grading
    out = []
    for a in apps:
        if a is None:
            out.append(None)
            continue
        q, sa = grading.resample(a, step)
        if len(q) < 2:
            out.append(None)
            continue
        out.append((sa[1:], np.asarray(ground_fn(q[1:]), np.float64), q[1:]))
    return tuple(out)


def approach_heights(xy, lows):
    """(k,) the approaches' hull height at each point of a road's line xy (k, 2, in order) within APPROACH_ON_M of one
    of lows ([(line (m, 2), z (m,))]: interpolated along it) where the road runs along it (APPROACH_ALONG_COS), NaN
    elsewhere; the lowest where several. Pure."""
    xy = np.asarray(xy, np.float64)[:, :2]
    out = np.full(len(xy), np.nan)
    tan = np.gradient(xy, axis=0) if len(xy) >= 2 else None
    for ln, z in lows:
        ln = np.asarray(ln, np.float64)[:, :2]
        gap, k, t = _line_gap(xy, ln)
        z = np.asarray(z, np.float64)
        zz = z[k] + t * (z[np.minimum(k + 1, len(z) - 1)] - z[k])
        on = gap <= APPROACH_ON_M
        if tan is not None and len(ln) >= 2:
            seg = ln[np.minimum(k + 1, len(ln) - 1)] - ln[k]
            c = np.abs((tan * seg).sum(1)) / np.maximum(np.hypot(*tan.T) * np.hypot(*seg.T), 1e-12)
            on &= c >= APPROACH_ALONG_COS
        out[on] = np.fmin(out[on], zz[on])
    return out


def portal_lows(xy, s, floor, apps, hulls, inside, step):
    """[(line (m, 2), heights (m,))] of a tunnel part (its line xy (k, 2), arc lengths s, floor) for approach_heights:
    per portal with an approach (apps: approach_samples', hulls: approach_floor's), the portal on to the approach's
    samples at the hull; where its road runs inside the tube (inside: portal_roads' m per end), that stretch and one
    step (m between the samples) more at the floor before it. Pure."""
    xy, s, floor = np.asarray(xy, np.float64)[:, :2], np.asarray(s, np.float64), np.asarray(floor, np.float64)
    out = []
    for app, hull, m, at in zip(apps, hulls, inside, (0, -1)):
        if app is None or hull is None:
            continue
        back = m + step if m > 0 else 0.0
        idx = np.flatnonzero(s <= back)[::-1] if at == 0 else np.flatnonzero(s >= s[-1] - back)
        out.append((np.vstack([xy[idx], app[2]]), np.r_[floor[idx], hull]))
    return out


def _shallow_full_low(s, g, floor, kinds):
    """kinds with each full-tunnel run (2) shorter than FULL_MIN_M and nowhere FULL_DEEP_M under the ground a low arch
    (1). Pure."""
    kinds = np.array(kinds, np.int64)
    i, n = 0, len(kinds)
    while i < n:
        if kinds[i] != 2:
            i += 1
            continue
        j = i
        while j + 1 < n and kinds[j + 1] == 2:
            j += 1
        if s[j] - s[i] < FULL_MIN_M and float(np.max(g[i:j + 1] - floor[i:j + 1])) < FULL_DEEP_M:
            kinds[i:j + 1] = 1
        i = j + 1
    return floor, kinds


class TunnelProfiles(BridgeProfiles):
    """Floor heights per tunnel part for one anchor frame, each chain (joined parts: a tunnel split over several
    segments) resolved once, as BridgeProfiles; each part cut into its sections (tunnel_sections): open roads
    (open_parts), low arches (heights) and full tunnels, each a part of its own (fid#k) with its own portals. Worker
    threads."""
    specs_of = staticmethod(lambda feats: tunnel_specs(feats))
    parts_of = staticmethod(lambda feats, i: tunnel_parts(feats, i))
    levels_of = staticmethod(lambda feats, i: [-1.0] * len(tunnel_parts(feats, i)))
    END_JOINS = False

    def _structure(self, chain):                # (no truss over a tunnel)
        return [], []

    wet = None      # wet(lat, lon) -> water depth (m): tunnels under water are left out (the sea's WaterBlocks reach
                    # 100 m down: a car in the tube would float; earthd / blockworker set the sea's depth)
    open = None
    raw = None      # raw(lat, lon) -> the ground without the roads' grading (the cover over a tunnel is read on it)
    ends = None     # ends(lat, lon) -> the graded ground (its portals' floor: portal_ends), else the profiles' elev. At one DEM
                    # zoom (grading.PROFILE_ZOOM) in every process: the terrain blocks and the road tiles are built in
                    # different processes at different zooms, and cut 97th Street's arch 15 m apart: its west mouth
                    # filled with ground behind the portal face

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.open = set()           # sub-part fids that are open roads
        self.roofs = {}             # sub-part fid -> True: an avalanche gallery's covered section (GALLERY_KIND), open
        self._gal = {}              # feature id -> its galleries' lines in the frame (gallery_parts; _load)
        self.heights = {}           # sub-part fid -> a low arch's tube height
        self.ups = {}               # sub-part fid -> its portal faces' reach over the vault at its start and end
        self.sections = {}          # part fid -> [(i0, i1, kind)] (inclusive sample ranges, sharing their ends)
        self.caps = {}              # sub-part fid -> a low arch's stone top's depth at its start and end (None: the
                                    # full roadmesh.LOW_CAP_M), stopping short of a road over its mouth (_road_caps)
        self._hw = {}               # (fid, "g") -> half the carriageway of a ground road in `ground` (_load)
        self.mouths = {}            # sub-part fid -> (its start is a portal, its end is one): not where a low arch
                                    # meets a full tunnel inside the hill (no hole, no portal face there)
        self._tls = threading.local()   # a thread's solved sections, kept with its parts (_commit) or dropped
        self._drowned = {}          # part id (fid.j) -> its chain has a part under water (drowned)

    def _raw_ground(self, xy):
        la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        return self.frame.geodetic_to_enu(la, lo, np.asarray(self.raw(la, lo), np.float64))[2]

    @staticmethod
    def _part_id(key):
        # one feature can come as several parts (clipped differently in the map cells around: 97th Street's arch as
        # 45 m and 30 m pieces, the shorter one's sections cut the longer one's terrain 15 m short)
        return f"{key[0]}.{key[1]}"

    def _commit(self, k, ground=None):
        staged = getattr(self._tls, "staged", {}).pop(k, None)
        if staged is None:
            return
        pid = self._part_id(k)
        secs, subs = staged
        self.sections[pid] = secs
        for n, (kind, th, ups, mouths, caps) in subs.items():
            sub = f"{pid}#{n}"
            if kind in (0, GALLERY_KIND):
                self.open.add(sub)
                if kind == GALLERY_KIND:
                    self.roofs[sub] = True
                continue
            if kind == 1:
                self.heights[sub] = th
            self.ups[sub] = ups
            self.mouths[sub] = mouths
            if caps is not None:
                self.caps[sub] = caps

    def _mark_drowned(self, comp, pool):
        """Mark every part of the chain comp drowned when one of its parts is under water for more than
        TUNNEL_WET_SHARE of its points: an underwater tunnel is left out whole. Overture splits one into pieces (the
        Burnley Tunnel, Melbourne: the piece under the Yarra was left out, the dry piece from Batman Avenue to the
        bank was built, an open trench across the avenue with its mouth at the river)."""
        if self.wet is None:
            return
        wet = False
        gfn = self._raw_ground if self.raw is not None else self._ground
        low = None                      # (the lowest ground at the parts' ends: the lower portal's)
        for k in comp:
            xy = np.asarray(pool[k][1], np.float64)
            if len(xy) >= 2:
                ge = np.asarray(gfn(xy[[0, -1]]), np.float64)
                if np.isfinite(ge).any():
                    low = float(np.nanmin(ge)) if low is None else min(low, float(np.nanmin(ge)))
        for k in comp:
            xy = np.asarray(pool[k][1], np.float64)
            if len(xy) < 2:
                continue
            la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
            w = np.asarray(self.wet(la, lo), np.float64) > 0.5
            if w.any() and low is not None:
                # (water far above the portals is a mountain lake over a deep tunnel, not a river over a shallow one:
                # one pond 900 m over the Gotthard road tunnel left all 17 km of it out)
                g = np.asarray(gfn(xy), np.float64)
                w &= ~(g - low > TUNNEL_WET_COVER_M)
            if w.mean() > TUNNEL_WET_SHARE or wet_run_inside(xy, w) >= TUNNEL_WET_RUN_M:
                wet = True
                break
        with self.lock:
            for k in comp:
                self._drowned[self._part_id(k)] = wet

    def drowned(self, key, ring):
        """Is tunnel part key (fid, j) (ring: its lon/lat points) in a chain with a part under water
        (_mark_drowned)? The grader asks the same (grading.Grader._tunnel_sections), so the ground under a left-out
        tunnel is not cut for it either."""
        pid = self._part_id(key)
        with self.lock:
            got = self._drowned.get(pid)
        if got is not None or self.wet is None:
            return bool(got)
        pool, ground, loaded = {}, {}, set()
        for p in (ring[0], ring[-1]):
            ck = mapcells.cell_of(float(p[1]), float(p[0]))
            if str(ck) not in loaded:
                loaded.add(str(ck))
                self._load(ck, pool, ground)
        if key not in pool:
            return False
        self._mark_drowned(self._resolve(key, pool, ground, loaded), pool)
        with self.lock:
            return bool(self._drowned.get(pid))

    def _ends_ground(self, xy):
        if self.ends is None:
            return self._ground(xy)
        la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        return self.frame.geodetic_to_enu(la, lo, np.asarray(self.ends(la, lo), np.float64))[2]

    def _solve(self, comp, pool, ground):
        """Per part: the floor (the hull of the ungraded ground, its ends at the roads' graded height at its portals,
        where the approaches arrive) and its sections; a low arch's tube under the thin part of the cover over its
        middle (a 20th percentile of the middle 60 %, less TUNNEL_SOIL_M; sized from the most, the ground came down
        into it and was cut away, a bare stone vault), a full tunnel's roadmesh.TUNNEL_H."""
        import roadmesh
        self._mark_drowned(comp, pool)
        gfn = self._raw_ground if self.raw is not None else self._ground
        out = []
        self._tls.staged = {}           # (committed by parts() right after, the rest dropped with the next solve)
        nk = _EndJoin()                 # (the parts' ends another part of the chain goes on from: no portal there)
        jends = {k: (nk(np.asarray(pool[k][1])[0]), nk(np.asarray(pool[k][1])[-1])) for k in comp
                 if len(pool[k][1]) >= 2}
        jdeg = {}
        for a, b in jends.values():
            jdeg[a] = jdeg.get(a, 0) + 1
            jdeg[b] = jdeg.get(b, 0) + 1
        for k in comp:
            xy = np.asarray(pool[k][1], np.float64)
            if len(xy) < 2:
                out.append(np.full(len(xy), np.nan))
                continue
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            g = np.asarray(gfn(xy), np.float64)
            ge = np.asarray(self._ends_ground(xy[[0, -1]]), np.float64)
            g = g.copy()
            g[0], g[-1] = ge[0], ge[-1]
            floor, kinds, _ = approach_floor(s, g, *self._approaches(xy, pool[k][0], gfn))
            kinds = portal_cover(kinds, g - floor, pool[k][0])
            kinds = self._cover_roads(xy, s, kinds, ground)
            kinds = gallery_kinds(xy, kinds, self._gal.get(str(k[0]), ()))
            secs, i = [], 0
            while i < len(kinds):
                j = i
                while j + 1 < len(kinds) and kinds[j + 1] == kinds[i]:
                    j += 1
                secs.append((i, j, int(kinds[i])))
                i = j + 1
            # neighbouring sections share their end sample (no gap between a portal and the open road)
            secs = [(a if n == 0 else a - 1, b, kd) for n, (a, b, kd) in enumerate(secs)]
            floor = self._observed_floor(k, pool, xy, s, floor, secs,
                                         tuple(jdeg.get(e, 0) > 1 for e in jends.get(k, (None, None))))
            cover = g - floor
            log.debug("tunnel %s: sections %s over %.0f m", k, secs, s[-1])
            subs = {}
            for n, (a, b, kd) in enumerate(secs):
                if kd in (0, GALLERY_KIND):
                    subs[n] = (kd, None, None, None, None)
                    continue
                th = roadmesh.TUNNEL_H
                if kd == 1:
                    c_ = cover[a:b + 1]
                    k0, k1 = int(len(c_) * 0.2), max(int(len(c_) * 0.8), int(len(c_) * 0.2) + 1)
                    base = float(np.percentile(c_[k0:k1], 20))
                    # nor over the thinnest cover along it (ARCH_SIZE_SKIP_M at its mouths aside, where the ground
                    # rises over it): the vault follows a sloping floor, and sized from the middle it rose out of the
                    # ground near a mouth, its stone top 2 m over the E6 beside it (an underpass in Norway)
                    s_ = s[a:b + 1]
                    inner = (s_ >= s_[0] + ARCH_SIZE_SKIP_M) & (s_ <= s_[-1] - ARCH_SIZE_SKIP_M)
                    if inner.any():
                        base = min(base, float(c_[inner].min()))
                    low_h = MAJOR_LOW_H if pool[k][0] is not None and pool[k][0].cls in CONCRETE_WALL_CLASSES \
                        else TUNNEL_LOW_H         # (a motorway's box clears a truck, its top in a mound if need be)
                    th = float(np.clip(base - TUNNEL_SOIL_M, low_h, roadmesh.TUNNEL_H))
                ups = []
                for near in (s[a:b + 1] <= s[a] + PORTAL_LOOK_M, s[a:b + 1] >= s[b] - PORTAL_LOOK_M):
                    cv = float(np.max(cover[a:b + 1][near])) if near.any() else th
                    ups.append(float(np.clip(cv + PORTAL_GROUND_M - th, PORTAL_UP_MIN, roadmesh.PORTAL_FRAME)))
                mouths = (n == 0 or secs[n - 1][2] in (0, GALLERY_KIND),
                          n == len(secs) - 1 or secs[n + 1][2] in (0, GALLERY_KIND))
                caps = None
                if kd == 1:
                    caps, ups = self._road_caps(xy[a:b + 1], floor[a:b + 1], th, ups, mouths, pool[k][0].width, ground)
                subs[n] = (kd, th, ups, mouths, caps)
            self._tls.staged[k] = (secs, subs)
            out.append(floor)
        return out

    def _observed_floor(self, k, pool, xy, s, floor, secs, joints=(False, False)):
        """floor with each covered section (kind 1 / 2) at the measured height where a source has one (roadz.py,
        level < 0: BD TOPO, NVDB) and it is deeper: never over the ground's lower hull (the cover stays); at a portal
        (next to an open section, or the part's end where no other part of the chain goes on: joints (start, end))
        at the hull's (the portals, the open sections and the grader's mouth plans keep theirs), eased in as the decks
        are (earthfast.deck_blend); at a joint inside the hill as measured (the next part reads the same source).
        Pure given the provider's cached data."""
        import roadz
        prov = roadz.PROVIDER
        if prov is None or not prov.enabled or not any(kd in (1, 2) for _a, _b, kd in secs):
            return floor
        try:
            spec = pool[k][0]
            nm = pool[k][5] if len(pool[k]) > 5 else ""
            z = prov.observed(self.frame, xy, spec.width / 2, -1, "" if nm in ("None", "nan") else nm)
            if z is None:
                return floor
            import fast
            la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
            z = np.asarray(z, np.float64)
            zf = np.where(np.isfinite(z), z, 0.0)
            zg = np.where(np.isfinite(z), np.asarray(self.frame.geodetic_to_enu(la, lo, zf)[2], np.float64), np.nan)
            out = np.array(floor, np.float64)
            last = len(s) - 1
            for n, (a, b, kd) in enumerate(secs):
                seg = zg[a:b + 1]
                if kd not in (1, 2) or b - a < 2 or np.isfinite(seg).mean() < roadz.MIN_COVER:
                    continue
                ok = np.isfinite(seg)
                ss = s[a:b + 1]
                filled = np.interp(ss, ss[ok], seg[ok])
                inside0 = a == 0 and joints[0]
                inside1 = b == last and joints[1]
                if n > 0 and secs[n - 1][2] in (1, 2):  # (another covered section before it: no portal between)
                    inside0 = True
                if n + 1 < len(secs) and secs[n + 1][2] in (1, 2):
                    inside1 = True
                eased = np.asarray(fast._ef.deck_blend(ss - ss[0], np.ascontiguousarray(filled),
                                                       float("nan") if inside0 else float(out[a]),
                                                       float("nan") if inside1 else float(out[b]),
                                                       OBS_BLEND_DG, OBS_BLEND_MIN_M, 0.5), np.float64)
                out[a:b + 1] = np.minimum(eased, out[a:b + 1])
            return out
        except Exception as ex:             # the hull rather than no tunnel
            log.debug("observed tunnel floor %s: %s: %s", k, type(ex).__name__, ex)
            return floor

    def _approaches(self, xy, spec, gfn):
        """approach_samples of tunnel line xy (k, 2) (road spec) among the ground roads of its portals' map cells
        (portal_approaches), every DECK_STEP on the ground gfn: (before, after)."""
        if spec is None or len(xy) < 2:
            return None, None
        la, lo, _ = self.frame.enu_to_geodetic(xy[[0, -1], 0], xy[[0, -1], 1], 0.0)
        lines = []
        for ck in {str(c): c for c in (mapcells.cell_of(float(a), float(b)) for a, b in zip(la, lo))}.values():
            lines += self._approach_lines(ck)
        return approach_samples(portal_approaches(xy, lines, approach_reach(spec)), DECK_STEP, gfn)

    def _approach_lines(self, key):
        """approach_lines of map cell key, made once."""
        memo = self.__dict__.setdefault("approach_memo", {})
        with self.lock:
            got = memo.get(str(key))
        if got is None:
            feats = self.cell_fn(key)
            got = approach_lines(feats, self.frame) if feats is not None and len(feats) else []
            with self.lock:
                memo[str(key)] = got
        return got

    def _load(self, key, pool, ground):
        super()._load(key, pool, ground)
        done = self.__dict__.setdefault("hw_done", set())
        if str(key) in done:            # (the same half widths each time: once per cell)
            return
        done.add(str(key))
        feats = self.cell_fn(key)
        if feats is None or len(feats) == 0:
            return
        rs = road_specs(feats)
        for i in range(len(feats)):
            if rs[i] is not None:
                self._hw[(str(feats.ids[i]), "g")] = rs[i].width / 2
            gal = gallery_parts(feats, i)
            if gal:
                self._gal.setdefault(str(feats.ids[i]), [np.stack(mapgeom.enu_xy(feats, self.frame, r), axis=1)
                                                         for r in gal])

    def _cover_roads(self, xy, s, kinds, ground):
        """kinds with each covered section carried on until the ground roads crossing over it are covered (their
        carriageway and TUNNEL_ROAD_CLEAR_M past it): earthfast.tunnel_cover_roads."""
        lines, halves = [], []
        for gk, lns in (ground or {}).items():
            hw = self._hw.get(gk)
            if hw is None:
                continue
            for ln in lns:
                ln = np.asarray(ln, np.float64).reshape(-1, 2)
                if len(ln) >= 2:
                    lines.append(ln)
                    halves.append(hw)
        return cover_roads(xy, s, kinds, lines, halves)

    def _road_caps(self, xy, floor, th, ups, mouths, width, ground):
        """A low arch's stone tops (roadmesh.LOW_CAP_M back from each portal face over its mouth) and face reaches where
        a road on the ground runs over a mouth (not one joined there: ends of it within ROAD_CAP_JOIN_M): the top stops
        ROAD_CAP_GAP_M short of the carriageway, the face ROAD_CAP_OVER_M over the road at most (an underpass under
        the E6 in Norway: its stone top 1.7 m over the lanes, 4 m into them). ((start, end) depths or None
        where nothing changes, ups)."""
        import fast
        import roadmesh
        fast.require(45, "first_probe_near_lines")
        side = width / 2 + roadmesh.TUNNEL_SHOULDER + roadmesh.LOW_PORTAL_SIDE
        caps, ups, any_ = [None, None], list(ups), False
        lines, radius = [], []
        for gk, lns in ground.items():
            hw = self._hw.get(gk)
            if hw is None:
                continue
            for ln in lns:
                lines.append(np.asarray(ln, np.float64).reshape(-1, 2))
                radius.append(hw)
        if not lines or len(xy) < 2:
            return None, ups
        pts = np.concatenate(lines)
        starts = np.concatenate([[0], np.cumsum([len(ln) for ln in lines])]).astype(np.int64)
        radius = np.asarray(radius, np.float64)
        ds = np.arange(0.0, roadmesh.LOW_CAP_M + 0.25, 0.5)
        for e, (at, nb) in enumerate(((0, 1), (-1, -2))):
            if not mouths[e]:
                continue
            p = xy[at]
            tin = xy[nb] - p
            tin = tin / max(float(np.hypot(*tin)), 1e-9)
            nrm = np.array([-tin[1], tin[0]])
            mid = p + tin * ds[:, None]
            probes = np.stack([mid, mid + nrm * side, mid - nrm * side], 1).reshape(-1, 2)
            got = fast._ef.first_probe_near_lines(pts, starts, radius, ROAD_CAP_GAP_M, (float(p[0]), float(p[1])),
                                                  ROAD_CAP_JOIN_M, probes)
            depth = None
            if got is not None:
                i, hx, hy = got
                depth = max(0.0, float(ds[i // 3]) - ROAD_CAP_GAP_M)
                road_z = float(self._ground(np.array([[hx, hy]]))[0])
                top = road_z + ROAD_CAP_OVER_M - float(floor[at]) - th
                ups[e] = float(max(roadmesh.LOW_PORTAL_UP, min(ups[e], top)))
            if depth is not None:
                caps[e], any_ = depth, True
        return (tuple(caps) if any_ else None), ups

    def cap_m(self, fid):
        """(start, end): a low arch's stone top depth over each mouth, None for roadmesh.LOW_CAP_M."""
        with self.lock:
            return self.caps.get(fid, (None, None))

    def portal_ups(self, fid):
        """(at the part's start, at its end): the portal faces' reach over the vault, PORTAL_GROUND_M over the ground
        just inside (within PORTAL_LOOK_M), PORTAL_UP_MIN..roadmesh.PORTAL_FRAME (a 6 m frame stood ~10 m over the
        flat park at the 79th Street Transverse); the full frame when not known."""
        import roadmesh
        with self.lock:
            return self.ups.get(fid, [roadmesh.PORTAL_FRAME, roadmesh.PORTAL_FRAME])

    def height(self, fid):
        """The tube's height (floor to vault) of a sub-part: a low arch's, else roadmesh.TUNNEL_H."""
        import roadmesh
        with self.lock:
            return self.heights.get(fid, roadmesh.TUNNEL_H)

    def mouth(self, fid):
        """(start, end) of a sub-part: True where it is a portal."""
        with self.lock:
            return self.mouths.get(fid, (True, True))

    def _split(self, parts):
        """parts (whole map parts) as their sections' sub-parts (fid#n, spec, xy, z, lon)."""
        out = []
        for fid, spec, xy, z, lon in parts:
            with self.lock:
                secs = self.sections.get(fid)
            if not secs:
                out.append((f"{fid}#0", spec, xy, z, lon))
                continue
            for n, (a, b, kd) in enumerate(secs):
                if b > a:
                    out.append((f"{fid}#{n}", spec, np.asarray(xy)[a:b + 1], np.asarray(z)[a:b + 1], lon))
        return out

    def open_parts(self, cells_feats, box):
        """[(fid, spec, xy, z, lon)] of the open sections near box: roads at the floor (the ground graded to it,
        grading.Grader._open_tunnels; _tunnel_chunks)."""
        return self._open_of(super().parts(cells_feats, box))

    def _open_of(self, whole):
        with self.lock:
            opened = set(self.open)
        # (an open section under water is an underwater tunnel with no ground over it: the Sydney Harbour Tunnel
        # was drawn as a road across the harbour)
        return self._dry([p for p in self._split(whole) if p[0] in opened])

    def parts(self, cells_feats, box):
        return self._closed_of(super().parts(cells_feats, box))

    def _closed_of(self, whole):
        out = self._split(whole)
        with self.lock:
            opened = set(self.open)
        return self._dry([p for p in out if p[0] not in opened])

    def parts_todo(self, todo, solved_only=False, open_=False):
        """BridgeProfiles.parts_todo split into sections: the closed ones (parts), or the open ones (open_)."""
        whole = super().parts_todo(todo, solved_only)
        return self._open_of(whole) if open_ else self._closed_of(whole)

    def _adopt_extra(self, comp):
        pids = {self._part_id(k) for k in comp}

        def mine(d):
            return {k: v for k, v in d.items() if str(k).split("#")[0] in pids}
        return {"sections": mine(self.sections), "heights": mine(self.heights), "ups": mine(self.ups),
                "caps": mine(self.caps), "mouths": mine(self.mouths), "roofs": mine(self.roofs),
                "open": {o for o in self.open if o.split("#")[0] in pids},
                "drowned": {k: v for k, v in self._drowned.items() if k in pids}}

    def _adopt_take(self, extra):
        if not extra:
            return
        for name in ("sections", "heights", "ups", "caps", "mouths", "roofs"):
            for k, v in extra.get(name, {}).items():
                getattr(self, name).setdefault(k, v)
        self.open.update(extra["open"])
        for k, v in extra["drowned"].items():
            self._drowned.setdefault(k, v)

    def _dry(self, out):
        """The parts not under water for more than TUNNEL_WET_SHARE of their points, nor in a chain with one."""
        if self.wet is None or not out:
            return out
        keep = []
        for p in out:
            with self.lock:
                if self._drowned.get(str(p[0]).split("#")[0]):      # (its chain is under water: _mark_drowned)
                    continue
            xy = np.asarray(p[2], np.float64)
            la, lo, _ = self.frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
            # under water for a good part of it (a portal on a river bank, Fort Pitt's east end 0.6 m "in" the
            # Monongahela, is not: that dropped one of its two tubes)
            if (np.asarray(self.wet(la, lo)) > 0.5).mean() <= TUNNEL_WET_SHARE:
                keep.append(p)
        return keep


def wet_run_inside(xy, wet):
    """The longest run (m) of wet points along the line xy that touches neither end: a tunnel under a river (the
    Burnley Tunnel's 70 m under the Yarra, 2 % of its 3.2 km), not one whose portal is on a bank (Fort
    Pitt's east end 0.6 m "in" the Monongahela). earthfast.wet_run_inside (Rust)."""
    import fast
    fast.require(48, "wet_run_inside")
    return float(fast._ef.wet_run_inside(np.ascontiguousarray(xy, np.float64), np.ascontiguousarray(wet, bool)))


TUNNEL = {"m": "road_asphalt_2lane", "tl": 11.0, "p": 20}     # the road surface in a tunnel (a deck: collides)
LOW_HOLE_M = 3.0            # m from a low arch's ends: its mouths, flat at its floor (arch_raise) and cut away ...
LOW_HOLE_STEP = 2.5         # ... the cut a terrain grid step further (the squares from the floor up to the soil)
TUNNEL_HOLE_MARGIN = 0.5    # m around the tube a portal's terrain hole reaches (above, below and sideways)


def tunnel_hole_mask(parts, u, cx, cy, square, heights=None, mouths=None):
    """Where the terrain block (heights u [iy, ix]: sample (ix, iy) at (cx - half + ix * square, cy - half +
    iy * square), half = n * square / 2) must be a hole for the tunnels `parts` ([(fid, spec, xy, z, lon)]: a
    TunnelProfiles' parts): the samples over a tube's footprint whose ground lies between its floor and its
    vault (+- TUNNEL_HOLE_MARGIN): the portals' openings into the hillside (the ground over the vault stays, as
    does ground under a tube crossing a hollow). Pure."""
    import fast
    import roadmesh
    n = u.shape[0]
    half = n * square / 2
    x0, y0 = cx - half, cy - half
    mask = np.zeros(u.shape, bool)
    # twin tunnels (twin_tunnels): their one tube round both reaches over the strip between them too, and its mouths are
    # cut whatever the height (the ground left between the carriageways sloped into the shared opening, its portal face
    # covering what is above)
    parts = list(parts)
    n_own = len(parts)
    parts += [(parts[i][0], parts[i][1]._replace(width=w), mid[:, :2], mid[:, 2], parts[i][4])
              for i, j, mid, w in twin_tunnels([p for p in parts if np.isfinite(np.asarray(p[3])).all()]) if len(mid) >= 2]
    fast.require(88, "tunnel_holes")
    u = np.ascontiguousarray(u, np.float64)
    for k_, (_fid, spec, xy, z, _lon) in enumerate(parts):
        xy = np.asarray(xy, np.float64)
        z = np.asarray(z, np.float64)
        if len(xy) < 2 or not np.isfinite(z).all():
            continue
        hw = spec.width / 2 + roadmesh.TUNNEL_SHOULDER + TUNNEL_HOLE_MARGIN
        th = (heights or {}).get(_fid, roadmesh.TUNNEL_H)       # heights: a low arch's tube (TunnelProfiles.heights)
        low = th < roadmesh.TUNNEL_H - 0.05
        if k_ >= n_own and not low:     # a twin tube's mouths, whatever the height (the low arches' cut, no side reach)
            m0, m1 = (mouths or {}).get(_fid, (True, True))
            mouth_mask = np.zeros(u.shape, bool)
            fast._ef.tunnel_holes(mouth_mask, u, float(x0), float(y0), float(square), np.ascontiguousarray(xy),
                                  np.ascontiguousarray(z), float(hw), float(th), True, bool(m0), bool(m1),
                                  float(TUNNEL_HOLE_MARGIN), float(LOW_HOLE_M + LOW_HOLE_STEP), 0.0, True)
            mask |= mouth_mask
        # the Rust kernel: the samples over the part between its floor and vault (a low arch: its mouths only)
        m0, m1 = (mouths or {}).get(_fid, (True, True))
        # (a low arch: the squares from its flat mouth band, LOW_HOLE_M, up to the soil over its vault)
        fast._ef.tunnel_holes(mask, u, float(x0), float(y0), float(square), np.ascontiguousarray(xy),
                              np.ascontiguousarray(z), float(hw), float(th), bool(low), bool(m0), bool(m1),
                              float(TUNNEL_HOLE_MARGIN), float(LOW_HOLE_M if low else LOW_HOLE_M + LOW_HOLE_STEP),
                              float(ARCH_SIDE_M + 1.0), not low)
    return spare_open_floors(mask, parts[:n_own], x0, y0, square)


def spare_open_floors(mask, parts, x0, y0, square):
    """mask (samples at (x0 + ix * square, y0 + iy * square)) with the hole samples filled again whose cells reach past
    the floor of a twin tunnel's stretch with no tube over it (twin_spans: past the shared tube, its floor lies open). The
    terrain drops every cell with a corner on a hole sample; beside a tube its wall closes that off, here nothing does: a
    2 m cell past the floor's edge was a hole a car fell through beside the road, at a divided road's underpass whose
    portals the map puts 10 m apart (the Weblinger Gürtel, Graz). Pure."""
    spans = twin_spans(parts)
    if not spans or not mask.any():
        return mask
    mask = mask.copy()
    corners = np.array([[-1, -1], [-1, 1], [1, -1], [1, 1]], np.float64) * square
    for fid, spec, xy, _z, _lon in parts:
        if fid not in spans:
            continue
        line = np.asarray(xy, np.float64)[:, :2]
        a, b = spans[fid]
        half = spec.width / 2
        lo, hi = line.min(0) - half - 2 * square, line.max(0) + half + 2 * square
        for iy, ix in np.argwhere(mask):
            q = np.array([x0 + ix * square, y0 + iy * square])
            if not ((q >= lo) & (q <= hi)).all():
                continue
            if a <= _arc_on(line, q) <= b:      # (under the shared tube)
                continue
            seg_a, seg = line[:-1], np.diff(line, axis=0)
            l2 = np.maximum((seg * seg).sum(1), 1e-12)
            p = q + corners
            t = np.clip(((p[:, None] - seg_a[None]) * seg[None]).sum(2) / l2[None], 0.0, 1.0)
            d = np.hypot(*(p[:, None] - seg_a[None] - t[..., None] * seg[None]).transpose(2, 0, 1)).min(1)
            if d.min() <= half + square and d.max() > half:
                mask[iy, ix] = False
    return mask


ARCH_SIDE_M = 1.0           # m beside a low arch's tube its soil is raised too
ARCH_SOIL_MIN = 0.6         # m of ground kept over a low arch's vault (arch_raise)
# Twin tunnels (twin_tunnels) have one tube round both, along the stretch they run side by side; the grading keeps the
# ground over that stretch alone (grading._twin_trimmed). A twin's arch reaching past it has no tube over it: its soil is
# not raised there, its floor lies open as at a mouth. Raised over the twin's whole mapped length, a divided road's
# underpass whose carriageways' portals the map puts 10 m apart had the ground 6 m over the longer one's floor in front
# of the shared tube: a wall across its lanes, one-sided, and no ground to drive on under it.


def arch_raise(parts, heights, px, py, z, mouths=None):
    """z (ground heights at the anchor-frame points px, py) raised over the low arches among parts (TunnelProfiles
    parts; heights: their tubes, TunnelProfiles.heights) to ARCH_SOIL_MIN over the vault, beside it too, but for
    their mouths (LOW_HOLE_M, cut there by tunnel_hole_mask): the ground dipping into a low tube near its mouths
    made one-sided terrain triangles from the road's level up to the soil, seen as dark wedges in the opening from
    outside (Central Park). Pure."""
    import fast
    import roadmesh
    z = np.array(z, np.float64, copy=True)
    fast.require(0, "arch_raise_part")
    px = np.ascontiguousarray(px, np.float64)
    py = np.ascontiguousarray(py, np.float64)
    tubes = twin_spans(parts)
    for fid, spec, xy, zf, _lon in parts:
        th = (heights or {}).get(fid)
        if th is None or th >= roadmesh.TUNNEL_H - 0.05:
            continue
        xy = np.asarray(xy, np.float64)
        zf = np.asarray(zf, np.float64)
        if len(xy) < 2 or not np.isfinite(zf).all():
            continue
        hw = spec.width / 2 + roadmesh.TUNNEL_SHOULDER + ARCH_SIDE_M
        m0, m1 = (mouths or {}).get(fid, (True, True))
        pieces = [(xy, zf, m0, m1, LOW_HOLE_M)]
        if fid in tubes:                # (a twin: raised under the shared tube, open past it)
            s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
            a, b = tubes[fid]
            pieces = [(*_line_piece(xy, zf, s, a, b), m0 or a > 0.0, m1 or b < s[-1], LOW_HOLE_M)]
            pieces += [(*_line_piece(xy, zf, s, u, v), True, True, math.inf) for u, v in ((0.0, a), (b, s[-1])) if v > u]
        for pxy, pz, p0, p1, mouth_m in pieces:
            if len(pxy) < 2:
                continue
            # the Rust kernel (per piece) on the points in its box
            lo, hi = pxy.min(0) - hw, pxy.max(0) + hw
            k = np.flatnonzero((px >= lo[0]) & (px <= hi[0]) & (py >= lo[1]) & (py <= hi[1]))
            if len(k):
                zk = np.ascontiguousarray(z[k])
                fast._ef.arch_raise_part(zk, np.ascontiguousarray(px[k]), np.ascontiguousarray(py[k]),
                                         np.ascontiguousarray(pxy), np.ascontiguousarray(pz), float(hw), float(th),
                                         float(ARCH_SOIL_MIN), float(mouth_m), bool(p0), bool(p1))
                z[k] = zk
    return z


def twin_spans(parts):
    """{fid: (from, to)} the arc range (m along its line) of each twin tunnel part (twin_tunnels, among parts with
    finite floors) under the tube round both: from the shared midline's first point to its last, projected on it.
    Pure."""
    fin = [p for p in parts if np.isfinite(np.asarray(p[3], np.float64)).all()]
    out = {}
    for i, j, mid, _w in twin_tunnels(fin):
        for n in (i, j):
            xy = np.asarray(fin[n][2], np.float64)[:, :2]
            ends = sorted(_arc_on(xy, np.asarray(q, np.float64)) for q in (mid[0, :2], mid[-1, :2]))
            out[fin[n][0]] = (ends[0], ends[1])
    return out


def _arc_on(xy, q):
    """m along polyline xy (k, 2) to its point nearest q. Pure."""
    a, ab = xy[:-1], np.diff(xy, axis=0)
    l2 = np.maximum((ab * ab).sum(1), 1e-12)
    t = np.clip(((q - a) * ab).sum(1) / l2, 0.0, 1.0)
    i = int(np.argmin(np.hypot(*(a + t[:, None] * ab - q).T)))
    return float(np.sqrt(l2[:i]).sum() + np.sqrt(l2[i]) * t[i])


def _line_piece(xy, z, s, a, b):
    """The piece of polyline xy (k, 2) with heights z (k,), s its arc lengths, from arc a to arc b: (xy, z), its ends
    interpolated. Pure."""
    inner = (s > a) & (s < b)
    ss = np.r_[a, s[inner], b]
    return np.c_[np.interp(ss, s, xy[:, 0]), np.interp(ss, s, xy[:, 1])], np.interp(ss, s, z)


def tunnel_floor_at(parts, x, y):
    """The floor height of the tunnel tubes among parts ([(fid, spec, xy, z, lon)]) over the point (x, y), the lowest
    one, or None outside them (within the road's half width + roadmesh.TUNNEL_SHOULDER). Pure."""
    import roadmesh
    best = None
    p = np.array([x, y], np.float64)
    for _fid, spec, xy, z, _lon in parts:
        xy = np.asarray(xy, np.float64)
        z = np.asarray(z, np.float64)
        if len(xy) < 2 or not np.isfinite(z).all():
            continue
        hw = spec.width / 2 + roadmesh.TUNNEL_SHOULDER
        a, b = xy[:-1], xy[1:]
        ab = b - a
        L2 = np.maximum((ab * ab).sum(1), 1e-12)
        t = np.clip(((p - a) * ab).sum(1) / L2, 0.0, 1.0)
        d = np.hypot(*(a + t[:, None] * ab - p).T)
        j = int(np.argmin(d))
        if d[j] <= hw:
            f = float(z[j] + t[j] * (z[j + 1] - z[j]))
            best = f if best is None else min(best, f)
    return best


def block_arch_raise(tunnels, cell_fn, frame, la, lo, z, box):
    """arch_raise for ground heights at the points (la, lo) of a block in the anchor-frame box (x0, y0, x1, y1),
    the tunnels from the map cells under it. z as it was when the cells are not at hand."""
    try:
        x0, y0, x1, y1 = box
        cla, clo, _ = frame.enu_to_geodetic(np.array([x0, x1]), np.array([y0, y1]), np.zeros(2))
        keys = mapcells.cells_for_bbox(float(cla.min()), float(clo.min()), float(cla.max()), float(clo.max()))
        cells = []
        for key in keys:
            try:
                cells.append(cell_fn(key))
            except Exception:
                cells.append(None)
        parts = tunnels.parts(cells, box)
        if not parts or not tunnels.heights:
            return z
        e, n, _ = frame.geodetic_to_enu(np.asarray(la, np.float64).ravel(), np.asarray(lo, np.float64).ravel(), 0.0)
        return arch_raise(parts, tunnels.heights, np.asarray(e), np.asarray(n),
                          np.asarray(z, np.float64).ravel(), getattr(tunnels, "mouths", None)).reshape(np.shape(z))
    except Exception as ex:         # no raise rather than no block (a network error quietly; a bug where it shows)
        (log.debug if isinstance(ex, OSError) else log.warning)("arch raise: %s: %s", type(ex).__name__, ex)
        return z


def block_tunnel_holes(tunnels, cell_fn, frame, keep, cx, cy, square):
    """tunnel_hole_mask for a terrain block being built (heightmap.generate's keep: lat, lon, u), its tunnels from
    the map cells under it (cell_fn(key) -> roads Features) through the anchor's TunnelProfiles."""
    lat, lon, u = keep["lat"], keep["lon"], keep["u"]
    keys = mapcells.cells_for_points(lat, lon)
    cells = []
    for k in keys:
        try:
            cells.append(cell_fn(k))
        except Exception as e:      # a cell not at hand (offline, a network error): no tunnels from it this time
            log.debug("tunnel holes: cell %s: %s: %s", k, type(e).__name__, e)
            cells.append(None)
    half = u.shape[0] * square / 2
    try:
        parts = tunnels.parts(cells, (cx - half, cy - half, cx + half, cy + half))
    except Exception as e:          # a chain's other cells not at hand (offline): no holes this time
        (log.debug if isinstance(e, OSError) else log.warning)("tunnel holes: %s: %s", type(e).__name__, e)
        return None
    if not parts:
        return None
    mask = tunnel_hole_mask(parts, u, cx, cy, square, getattr(tunnels, "heights", None),
                            getattr(tunnels, "mouths", None))
    if mask is not None and mask.any():
        mask = spare_carriageways(mask, parts, cells, frame, cx, cy, square)
    return mask


HOLE_ROAD_MARGIN = 0.3      # m past another road's carriageway no tunnel hole is cut (spare_carriageways)
HOLE_JOIN_M = 3.0           # m: a road with an end this near a tunnel part's end is its approach (its mouth cut)


def spare_carriageways(mask, parts, cells, frame, cx, cy, square):
    """mask with the hole samples inside the carriageway of a ground road that is not the tunnel's (another feature, not
    an approach joined at a mouth) filled again: a portal's opening reaching into a road beside or over it left a hole in
    its lanes (the A-7 near Málaga, a 2 m drop at the edge of a carriageway beside an underpass's mouth)."""
    import fast
    own = {str(p[0]).split("#")[0] for p in parts}
    ends = np.array([np.asarray(p[2], np.float64)[k, :2] for p in parts for k in (0, -1) if len(p[2])], np.float64)
    others = []
    for feats in cells:
        if feats is None or len(feats) == 0:
            continue
        rs = road_specs(feats)
        for i, sp in enumerate(rs):
            fid = str(feats.ids[i])
            if sp is None or sp.kind not in BUILT or fid in own:
                continue
            for ring in ground_parts(feats, i):
                e, n = mapgeom.enu_xy(feats, frame, ring)
                xy = np.c_[e, n]
                if len(xy) < 2:
                    continue
                if len(ends) and min(float(np.min(np.hypot(*(ends - xy[0]).T))),
                                     float(np.min(np.hypot(*(ends - xy[-1]).T)))) < HOLE_JOIN_M:
                    continue            # (its approach: the mouth is cut into it)
                others.append((fid, sp.width / 2, xy))
    if not others:
        return mask
    oth = fast.Others(others)
    n = mask.shape[0]
    x0, y0 = cx - n * square / 2, cy - n * square / 2
    out = mask.copy()
    for iy, ix in zip(*np.nonzero(mask)):
        if not oth.clear((x0 + ix * square, y0 + iy * square), None, HOLE_ROAD_MARGIN):
            out[iy, ix] = False
    return out


def _one_road(fa, xa, fb, xb):
    """Whether tunnel parts a and b (fid, xy (k, 2)) are pieces of one road: the same feature's range or an end of
    one at an end of the other. Pure."""
    if str(fa).split("#")[0] == str(fb).split("#")[0]:
        return True
    ends = [np.asarray(xb, np.float64)[k, :2] for k in (0, -1)]
    return any(np.hypot(*(np.asarray(xa, np.float64)[k, :2] - e)) < _EndJoin().tol for k in (0, -1) for e in ends)


def _line_near(xy, other):
    """Per point of xy (k, 2): (distance to the polyline other (m, 2), the nearest point on it, its index t along it
    as a float segment index). Pure."""
    a, b = other[:-1], other[1:]
    d = b - a
    L2 = np.maximum((d * d).sum(1), 1e-12)
    out_d, out_q = np.empty(len(xy)), np.empty((len(xy), 2))
    for i, p in enumerate(xy):
        t = np.clip(((p - a) * d).sum(1) / L2, 0.0, 1.0)
        q = a + t[:, None] * d
        dd = np.hypot(*(q - p).T)
        j = int(np.argmin(dd))
        out_d[i], out_q[i] = dd[j], q[j]
    return out_d, out_q


def twin_tunnels(parts):
    """Pairs of tunnel parts ([(fid, spec, xy, z, lon)]) side by side: [(i, j, midline (k, 3), width)] with i < j their
    indices, the midline along part i (each point halfway to j's line, the floors' mean) and the width of a road
    surface covering both carriageways (the tube round both: roadmesh.tunnel). Each part in one pair at most. Pure."""
    import roadmesh
    taken, out = set(), []
    for i, (fa, sa, xa, za, _) in enumerate(parts):
        if i in taken or len(xa) < 2:
            continue
        xa = np.asarray(xa, np.float64)
        sj = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xa, axis=0).T))]
        if sj[-1] < 1.0:
            continue
        ss = np.linspace(0.0, sj[-1], max(2, int(sj[-1] / TWIN_STEP_M) + 1))
        P = np.c_[np.interp(ss, sj, xa[:, 0]), np.interp(ss, sj, xa[:, 1])]
        Z = np.interp(ss, sj, np.asarray(za, np.float64))
        for j in range(i + 1, len(parts)):
            fb, sb, xb, zb, _ = parts[j]
            if j in taken or len(xb) < 2 or _one_road(fa, xa, fb, xb):
                continue
            xb = np.asarray(xb, np.float64)
            reach = (sa.width + sb.width) / 2 + 2 * roadmesh.TUNNEL_SHOULDER + 1.0      # their tubes would overlap
            d, q = _line_near(P, xb)
            near = d < reach
            if near.mean() < TWIN_SHARE:
                continue
            tb = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xb, axis=0).T))]
            _, qb = _line_near(q, xb)           # (q on xb: its floor by the arc to it)
            sb_at = np.array([tb[k] + np.hypot(*(qb[n] - xb[k])) for n, k in enumerate(
                [int(np.argmin(np.hypot(*(xb[:-1] - p).T) + np.hypot(*(xb[1:] - p).T))) for p in qb])])
            zq = np.interp(sb_at, tb, np.asarray(zb, np.float64))
            if np.abs(Z[near] - zq[near]).max() > TWIN_DZ_M:
                continue
            mid = np.c_[(P + q) / 2, (Z + zq) / 2]
            k0, k1 = int(np.flatnonzero(near)[0]), int(np.flatnonzero(near)[-1])     # (where they run side by side)
            width = float(np.median(d[near])) + (sa.width + sb.width) / 2
            out.append((i, j, mid[k0:k1 + 1], width))
            taken.update((i, j))
            break
    return out


# m a tunnel's floor reaches out past a portal, under the road in front: the terrain grid's reach there (below)
PORTAL_APRON_M = 1.5 * roadmesh.GRID_M * math.sqrt(2.0)
# The terrain block drops every grid cell with a corner on a hole sample (scenery.ground: a cell kept with a corner in
# the hole hung the slope over the vault into the opening). A hole sample stands for the square from it on, cut when
# that square's centre lies past the portal face; the cells round the sample reach 1.5 squares back from that centre,
# a diagonal's worth on a road at 45 degrees to the grid: up to 4.2 m of road in front of the face with nothing under
# it, seen as a hole and driven as one (the A2's tunnels at Griffen: 2.5 to 3 m at both portals, a 1.5 G hit at
# 190 km/h). The floor's apron covers it. The floor lies grading.ROAD_LIFT over its heights, as the ground under every
# road lies over its grading (the mouth's ground is graded to the floor, Grader._mouth_plans): at the floor's own
# heights a 4 cm step down where the ground ended.


def portal_apron(pts, at):
    """The apron's line (2, 3) out past the end `at` (0: the start, -1: the end) of a tunnel's floor pts (k, 3):
    PORTAL_APRON_M on along its end's heading and slope (over its last MOUTH_PLAN_M, the mouth's grading plan); in the
    line's own direction. Pure."""
    import grading
    pts = np.asarray(pts, np.float64)
    q = pts if at == 0 else pts[::-1]
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(q[:, :2], axis=0).T))]
    j = min(int(np.searchsorted(s, min(grading.MOUTH_PLAN_M, s[-1]))), len(q) - 1)
    d = q[0, :2] - q[j, :2]
    run = max(float(np.hypot(*d)), 1e-9)
    slope = (q[0, 2] - q[j, 2]) / run
    out = np.r_[q[0, :2] + d / run * PORTAL_APRON_M, q[0, 2] + slope * PORTAL_APRON_M]
    line = np.array([out, q[0]])
    return line if at == 0 else line[::-1]


def _tunnel_chunks(tunnels, cells, exact, terrain_paint=True):
    """The chunks of the tunnels crossing the tile box `exact`: the road surface ("deck", "tunnel": the tube is
    built around it, roadmesh.tunnel) and its lines, every one "fixed" at the floor's heights; a surface chunk
    ending at its part's end carries "portal": [start is one, end is one]. Twin tunnels (twin_tunnels): their surfaces
    are floors without a tube ("no_tube"), and one "tube_only" chunk along their midline (not drawn as a road) carries
    the tube round both, with the first's portals. Their heights: the floor's, ROAD_LIFT over it (PORTAL_APRON_M)."""
    import grading
    out = []
    if getattr(tunnels, "open_parts", None) is not None:
        for fid, spec, xy, z, lon in tunnels.open_parts(cells, exact):
            if not np.isfinite(z).all():
                continue
            pts = np.c_[xy, z]
            for look, w, line in [(look_of(spec), spec.width, pts)] + [
                    (lk, w2, ln) for lk, w2, ln in extras(spec, pts, lon)
                    if lk["m"] not in (SIDEWALK["m"], GUTTER["m"], EDGE_DECAL["m"])]:
                for piece in clip_polyline(line, *exact):
                    for c in split(densify(simplify(piece))):
                        if len(c) >= 2:
                            # on the ground as any road (the grading lays the ground at its floor, Grader._open_tunnels:
                            # at the floor's own heights the ground graded from the grader's profile covered it
                            # outside 97th Street's arch)
                            out.append(_chunk(look, w, c))
    parts = [p for p in tunnels.parts(cells, exact) if np.isfinite(p[3]).all()]
    twins = twin_tunnels(parts)
    twinned = {k for i, j, _, _ in twins for k in (i, j)}
    jobs = []                                   # (fid, its ends, [(look, width, line)])
    for i, j, mid, width in twins:              # the tube round both, with the first's portals
        mid = np.c_[mid[:, :2], mid[:, 2] + grading.ROAD_LIFT]
        if len(mid) >= 2:
            jobs.append((parts[i][0], (mid[0, :2], mid[-1, :2]), [({**TUNNEL, "tunnel": True, "tube_only": True}, width, mid)],
                         parts[i][1]))
    for n, (fid, spec, xy, z, lon) in enumerate(parts):
        pts = np.c_[xy, np.asarray(z, np.float64) + grading.ROAD_LIFT]
        look = _deck_look(spec) if not terrain_surface(spec) else None
        if terrain_paint and terrain_surface(spec):
            look = None                     # painted in the ground layer, as any other ground part
        lines = [] if look is None else [({**look, "deck": True, "tunnel": True, "no_tube": n in twinned}, spec.width, pts)]
        if look is not None:                # the floor's aprons past its portals (PORTAL_APRON_M), no tube over them
            mouths = tunnels.mouth(fid) if getattr(tunnels, "mouth", None) is not None else (True, True)
            lines += [({**look, "deck": True, "tunnel": True, "no_tube": True}, spec.width, portal_apron(pts, at))
                      for at, mouth in zip((0, -1), mouths) if mouth]
        for look, w, line in extras(spec, pts, lon):
            if look["m"] not in (SIDEWALK["m"], GUTTER["m"], EDGE_DECAL["m"]):     # (no ground beside a deck)
                lines.append((look, w, line))
        jobs.append((fid, (pts[0, :2], pts[-1, :2]), lines, spec))
    for fid, ends, lines, spec in jobs:
        length = max((float(np.hypot(*np.diff(np.asarray(ln)[:, :2], axis=0).T).sum()) for _, _, ln in lines
                      if len(ln) >= 2), default=0.0)
        for look, w, line in lines:
            for piece in clip_polyline(line, *exact):
                for c in split(densify(simplify(piece, ztol=SIMPLIFY_Z_M))):
                    if len(c) >= 2:
                        ch = _chunk(look, w, c)
                        ch["fixed"] = True
                        if look.get("tunnel"):
                            ch["tunnel"] = True
                            ch["deck"] = not look.get("tube_only")      # (a twin's tube: no floor, no road surface)
                            ch["tunnel_len"] = round(length, 1)             # (the whole sub-part's: sound_boxes)
                            if spec.cls in CONCRETE_WALL_CLASSES:
                                ch["concrete"] = True   # (a major road's low arch: concrete, as its cutting's walls)
                            for flag in ("no_tube", "tube_only"):
                                if look.get(flag):
                                    ch[flag] = True
                            if getattr(tunnels, "height", None) is not None:
                                ch["tunnel_h"] = tunnels.height(fid)
                            if getattr(tunnels, "portal_ups", None) is not None:
                                # (over the floor's own heights: its face's top stays where TunnelProfiles put it)
                                u0, u1 = (None if u is None else u - grading.ROAD_LIFT for u in tunnels.portal_ups(fid))
                                at = lambda p: u0 if np.hypot(*(p - ends[0])) < 0.5 else u1    # noqa: E731
                                ch["portal_up"] = [at(c[0, :2]), at(c[-1, :2])]
                            if getattr(tunnels, "cap_m", None) is not None:
                                c0, c1 = tunnels.cap_m(fid)
                                if c0 is not None or c1 is not None:
                                    atc = lambda p: c0 if np.hypot(*(p - ends[0])) < 0.5 else c1    # noqa: E731
                                    ch["cap_m"] = [atc(c[0, :2]), atc(c[-1, :2])]
                            m0, m1 = tunnels.mouth(fid) if getattr(tunnels, "mouth", None) is not None else (True, True)
                            isp = lambda p: bool((np.hypot(*(p - ends[0])) < 0.5 and m0) or      # noqa: E731
                                                 (np.hypot(*(p - ends[1])) < 0.5 and m1))
                            ch["portal"] = [isp(c[0, :2]), isp(c[-1, :2])]
                        out.append(ch)
    return out
