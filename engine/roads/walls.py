"""Parapets, cliffs and retaining walls."""
import math
import os
from types import SimpleNamespace

import numpy as np

from .style import BUILT
from .specs import carriageway
from .walks import cut_outside, simplify
from .decks import CONCRETE_WALL_CLASSES


WALL_STEP = 2.0         # m between a retaining wall's points
WALL_PROBE_M = 1.0      # m beyond the cut's foot (grading.WALL_T_M) where the natural ground's height is read
WALL_TOP_M = 0.15       # m the wall stands over the ground behind it
WALL_FOOT_M = 0.3       # m it reaches under the road
WALL_FULL = 0.9         # the graded ground this share of the way up to the natural ground behind a wall: its top ends
                        # there ...
WALL_THICK_MIN_M = 1.0  # ... at least this deep and at most WALL_THICK_MAX_M
WALL_THICK_MAX_M = 3.5
WALL_OTHER_GAP_M = 0.3  # m a wall's top keeps from another road's carriageway
WALL_TAPER_M = 8.0      # m at each end of a wall over which it comes down ...
WALL_TAPER_LOW_M = 0.6  # ... to this over the road
WALL_SLAB_DZ = 0.8      # m the ground behind a wall may fall under its top before the top ends there ...
WALL_COPING_MIN_M = 0.5  # ... at least its coping
WALL_DIAG_M = 2.9       # the terrain lattice's diagonal (heightmap.SQUARE 2 m)
WALL_EVEN_N = 2         # a wall's top as deep as its deepest within this many WALL_STEPs either side
WALL_STEP_UP_M = 0.5     # m the graded ground climbs over the road where a wall's face goes (short of the core's edge)
WALL_KEEP_M = 1.2       # m: a wall goes on while the cut stays this deep (it starts at grading.WALL_CUT_M) ...
WALL_GAP_N = 3          # ... over gaps of up to this many WALL_STEPs, and none shorter than WALL_MIN_N (the cut's depth
WALL_MIN_N = 3          # wavered round 2 m: stubs of wall with gaps, the 97th Street Transverse)

# A wall stands only where the graded ground behind its face climbs at least this steeply (m per m, its median over
# the wall; across WALL_STEEP_SPAN from 1 m in front of the face): the step the grading cut. A natural bank the
# terrain already draws as a slope is no cutting: a 1.5 m concrete wall stood in front of a low eroded bank beside
# US-163 in Utah (its ground rose 0.4-1.2 m per m; Munich's McGraw-Graben's cut walls 5-9, measured)
WALL_STEEP = 2.0
WALL_STEEP_SPAN = (-1.0, 6.0)

# A step between two roads at two levels (grading._between_cuts) gets a wall where it can't be a slope: loose ground stands
# at about 1:1 at most, so a step higher than the room between the carriageways has something holding it up. A wider gap
# can be a real bank, walled or not, and stays the terrain's (a mapped wall there too: the map doesn't say how high it is)
BETWEEN_WALL_SLOPE = 1.0
BETWEEN_LOW_M = 0.75        # m in front of the step the lower road's level is read (less: the grading's transition) ...
BETWEEN_HIGH_M = 1.5        # ... and behind it the upper's, at least: 1.5 m behind a step that lies a metre or two short of the
                            # upper road the ground is still climbing (Cap Corse: 1.56 m read of a 5 m step, so no wall)
BETWEEN_EDGE_IN_M = 0.5     # ... at the road beside it this far onto its carriageway, on its own level
BETWEEN_PARALLEL_DEG = 25.0 # the road beside runs parallel within this (as grading._between_cuts finds it)
BETWEEN_ROOM_M = 12.0       # m past a road's edge another carriageway is looked for
BETWEEN_NOT_TWICE_M = 1.5   # m: a cutting's own wall this near stands there already
BETWEEN_THICK_MIN_M = 0.2   # m a wall stands deep at least: with less room before another carriageway none stands there, only
                            # the ground's step. Its top covers no strip (the ground is cut inside it, scenery.wallcut), so
                            # WALL_COPING_MIN_M at most
BETWEEN_CUT_IN_M = 0.1      # m behind the face the ground is cut: inside the thinnest wall's body, so the skirt doesn't stand
                            # in the face (the lattice's cells draw the line straight: a few cm off it)
BETWEEN_CUT_MIN_M = 0.5     # m a step goes on being cut past its wall's end: no ramp coming back in front of the road (a wall
                            # ends at a bend, say, while the step goes on: a tooth at the road's edge). Bare there, a hard look
JOIN_PIECES_M = 0.5         # m: two pieces of a road's plan this close are one (grading.trim_plan cuts on a line)


def _wall_runs(cut):
    """Which samples along one side of a road get a wall, from the cut's depth there (m). Pure."""
    import grading
    cut = np.asarray(cut, np.float64)
    keep = cut > WALL_KEEP_M
    out = np.zeros(len(cut), bool)
    i = 0
    while i < len(cut):                     # runs over WALL_KEEP_M that reach WALL_CUT_M somewhere
        if not keep[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(cut) and keep[j + 1]:
            j += 1
        if (cut[i:j + 1] > grading.WALL_CUT_M).any():
            out[i:j + 1] = True
        i = j + 1
    i = 0
    while i < len(out):                     # runs shorter than WALL_MIN_N dropped ...
        if not out[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(out) and out[j + 1]:
            j += 1
        if j - i + 1 < WALL_MIN_N:
            out[i:j + 1] = False
        i = j + 1
    idx = np.flatnonzero(out)               # ... then gaps of up to WALL_GAP_N filled
    for a, b in zip(idx[:-1], idx[1:]):
        if 1 < b - a <= WALL_GAP_N + 1:
            out[a:b] = True
    return out


WALL_DECK_MARGIN_M = 3.0    # m beyond a bridge deck's edge where a road under it gets no retaining wall ...
WALL_DECK_OVER_M = 2.0      # ... a deck this far over the road (an overpass, not the road's own approach)


def _under_decks(xy, z, decks):
    """Which points xy (k, 2) at road heights z lie under a bridge deck (deck chunks: "n" points [x, y, z], "w" m):
    within its half width + WALL_DECK_MARGIN_M of its nearest segment and the deck WALL_DECK_OVER_M or more over them
    (earthfast.under_decks). Pure."""
    import fast
    xy = np.asarray(xy, np.float64).reshape(-1, 2)
    pack = _deck_pack(decks)
    if pack is None or not len(xy):
        return np.zeros(len(xy), bool)
    fast.require(74, "under_decks")
    return np.asarray(fast._ef.under_decks(np.ascontiguousarray(xy), np.ascontiguousarray(np.asarray(z, np.float64)),
                                           *pack, float(WALL_DECK_OVER_M)), bool)


_DECK_PACK = [(None, None)]     # [(the decks list, its packed arrays)]: one tile's walls ask with the same list


def _deck_pack(decks):
    """(points (n, 3), starts (C + 1,), reach (C,)) of the deck chunks with 2 points or more, or None."""
    if not decks:
        return None
    last = _DECK_PACK[0]
    if last[0] is decks:
        return last[1]
    ns = [np.asarray(ch["n"], np.float64)[:, :3] for ch in decks]
    keep = [k for k, n in enumerate(ns) if len(n) >= 2]
    pack = None
    if keep:
        pts = np.ascontiguousarray(np.concatenate([ns[k] for k in keep]))
        starts = np.r_[0, np.cumsum([len(ns[k]) for k in keep])].astype(np.int64)
        reach = np.array([float(decks[k].get("w") or 0) / 2 + WALL_DECK_MARGIN_M for k in keep], np.float64)
        pack = (pts, starts, reach)
    _DECK_PACK[0] = (decks, pack)
    return pack


def _off_wall_tops(chunks, walls):
    """chunks with the ground roads' surfaces and lines cut away over the retaining walls' tops (a path on the bank
    above a cutting lay on the lattice's low strip under the top, in patches through it, Munich's McGraw-Graben).
    Decks, tunnels and filled polygons are left as they are."""
    if not walls:
        return chunks
    blockers = []
    for w in walls:
        th = np.asarray(w["thick"], np.float64)
        mid = np.asarray(w["base"], np.float64) - np.asarray(w["toward"], np.float64) * (th[:, None] / 2)
        blockers.append((mid, max(float(th.max()) / 2 - WALL_TOP_EDGE_M, 0.1)))
    lo = np.min([b[0].min(0) - b[1] for b in blockers], axis=0)
    hi = np.max([b[0].max(0) + b[1] for b in blockers], axis=0)
    out = []
    for c in chunks:
        n = c.get("n")
        if c.get("deck") or c.get("tunnel") or c.get("poly") is not None or not n or len(n) < 2:
            out.append(c)
            continue
        pts = np.asarray(n, np.float64)
        if (pts[:, 0].max() < lo[0] or pts[:, 0].min() > hi[0] or pts[:, 1].max() < lo[1]
                or pts[:, 1].min() > hi[1]):
            out.append(c)
            continue
        pieces = cut_outside(pts, blockers, 1.0)
        if len(pieces) == 1 and len(pieces[0]) >= len(pts) and np.allclose(pieces[0][[0, -1]], pts[[0, -1]]):
            out.append(c)
            continue
        for piece in pieces:
            out.append(dict(c, n=[[round(float(v), 3) for v in q] for q in simplify(piece)]))
    return out


WALL_TOP_EDGE_M = 0.3   # a road surface goes this far onto a wall's top at most (_off_wall_tops)


def _taper(xy, run):
    """Per point of a road's wall sample line xy (k, 2): its wall's height factor, 0 at the ends of each run of run (k,)
    rising (smoothstep) to 1 over WALL_TAPER_M (no full-height wall ending in a cliff). Pure."""
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(np.asarray(xy, np.float64)[:, :2], axis=0).T))]
    f = np.zeros(len(xy))
    i = 0
    while i < len(run):
        if not run[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(run) and run[j + 1]:
            j += 1
        d = np.minimum(s[i:j + 1] - s[i], s[j] - s[i:j + 1]) / WALL_TAPER_M
        d = np.clip(d, 0.0, 1.0)
        f[i:j + 1] = d * d * (3 - 2 * d)
        i = j + 1
    return f


class _Segs:
    """others {fid: (centreline (m, 2), half width)} as one table of segments (a, b, half width, its road's fid), with
    each segment's box: the carriageway tests below in one Rust call each (one per road cost retaining_walls ~2 s of
    a Canton tile set)."""

    def __init__(self, others):
        rows = [(f, np.asarray(ln, np.float64), h) for f, (ln, h) in others.items() if len(ln) >= 2]
        f64 = np.float64
        self.a = np.concatenate([ln[:-1, :2] for _f, ln, _h in rows]) if rows else np.zeros((0, 2), f64)
        self.b = np.concatenate([ln[1:, :2] for _f, ln, _h in rows]) if rows else np.zeros((0, 2), f64)
        self.h = np.concatenate([np.full(len(ln) - 1, h, f64) for _f, ln, h in rows]) if rows else np.zeros(0, f64)
        self.road = np.concatenate([np.full(len(ln) - 1, n) for n, (_f, ln, _h) in enumerate(rows)]) if rows else \
            np.zeros(0, np.int64)
        self.fids = [f for f, _ln, _h in rows]
        self.lo = np.minimum(self.a, self.b)
        self.hi = np.maximum(self.a, self.b)

    def near(self, pts, gap, skip=None):
        """Which points (k, 2) lie within a segment's half width + gap (its road's fid not skip). Pure."""
        import fast
        pts = np.ascontiguousarray(np.asarray(pts, np.float64))
        if not len(pts) or not len(self.h):
            return np.zeros(len(pts), bool)
        lo, hi = pts.min(0), pts.max(0)
        r = self.h + gap
        keep = (self.hi[:, 0] + r >= lo[0]) & (self.hi[:, 1] + r >= lo[1]) & (self.lo[:, 0] - r <= hi[0]) & \
            (self.lo[:, 1] - r <= hi[1])
        if skip is not None and skip in self.fids:
            keep &= self.road != self.fids.index(skip)
        if not keep.any():
            return np.zeros(len(pts), bool)
        fast.require(0, "points_near_segments")
        return np.asarray(fast._ef.points_near_segments(pts, np.ascontiguousarray(self.a[keep]),
                                                        np.ascontiguousarray(self.b[keep]),
                                                        np.ascontiguousarray(r[keep])), bool)


def _on_carriageways(pts, others, gap):
    """Which points (k, 2) lie on a carriageway of others {fid: (centreline (m, 2), half width)} or a _Segs of them
    (+ gap). Pure."""
    segs = others if isinstance(others, _Segs) else _Segs(others)
    return segs.near(pts, gap)


def _clear_depth(base, out, depth, others, own, skip=None):
    """Per point of a wall's face line base (k, 2): how far (up to depth (k,)) out from it along out (k, 2) stays off
    every other road's carriageway in others {fid: (centreline (m, 2), half width)} or a _Segs of them (less
    WALL_OTHER_GAP_M); skip: a road's fid left out (a wall standing on its own road's drawn width). Pure."""
    segs = others if isinstance(others, _Segs) else _Segs(others)
    steps = np.arange(0.5, float(np.max(depth)) + 0.51, 0.5)
    q = (base[:, None, :] + out[:, None, :] * steps[None, :, None]).reshape(-1, 2)
    # (its own road too: a hairpin's other leg; the face stands past its own carriageway, so the stretch beside it
    # never hits)
    hit = segs.near(q, WALL_OTHER_GAP_M, skip=skip).reshape(len(base), len(steps))
    first = np.where(hit.any(axis=1), steps[np.argmax(hit, axis=1)] - 0.5, np.inf)
    return np.minimum(np.asarray(depth, np.float64), np.maximum(first, 0.0))


# Rock cliffs (after the official maps: Italy's and West Coast USA's rural cuts are rock-face meshes
# sunk into the slope, overlapping): a rural road's retaining wall is drawn as Italy's rock-face pieces (trees.lua group
# "cliff") along its face instead of stone. (shape height m, its bottom under the pivot as a share of it, its depth in
# front of the pivot m per unit scale, its width m, its depth m)
CLIFF_SHAPES = ((2.9, 0.52, 1.5, 10.5, 2.9), (13.2, 0.17, 1.9, 12.9, 5.2))
CLIFF_TALL_M = 6.2      # a piece this tall or taller: the tall shape (trees.lua M.pick: nearer to it than the short one by log)
CLIFF_SINK_M = 1.0      # m the pieces reach under the road's level ...
CLIFF_OVER_M = 0.3      # ... and over the ground behind
CLIFF_SPACING = 0.55    # pieces along the face a share of their width apart (overlapping)
CLIFF_REACH_M = 8.0     # m behind the face a piece may reach at most (less where another road is)
CLIFF_EDGE_M = 0.5      # m off the carriageway's edge the pieces' fronts stand
CLIFF_ROAD_GAP_M = 0.3  # m a piece's footprint keeps from any carriageway
# Parapets (the Stelvio Pass, Mapillary: a low dry-stone wall along the outside of every bend and drop): a
# rural road (not a motorway / trunk: guardrails there) whose ground falls PARAPET_DROP_M or more within PARAPET_PROBE_M of
# its edge gets a stone parapet just off its carriageway, not across a road joining it.
PARAPET_DROP_M = 2.0
PARAPET_PROBE_M = 3.0
PARAPET_H = 0.6
PARAPET_W = 0.45
PARAPET_OFF_M = 0.2
PARAPET_ROAD_GAP_M = 2.0
NO_PARAPET_CLASSES = {"motorway", "motorway_link", "trunk", "trunk_link", "service", "track"}
CLIFF_MIN_CUT_M = 6.0   # a rural cut this deep: rock faces (cliff_rows), when CLIFF_WALLS_ON; else a dry-stone wall
CLIFF_WALLS_ON = os.environ.get("BNE_CLIFF_WALLS", "off") == "on"


def _parapets(xy, z, out_n, rh, inside, steps, gs, others, own, decks):
    """The stone parapets along one side of a road (see PARAPET_*): wall dicts as retaining_walls' (roadmesh draws them
    with a back face). gs: the graded ground at steps (m off the centre line) per point. Pure but for decks."""
    near = np.flatnonzero((steps >= rh + 0.5) & (steps <= rh + PARAPET_PROBE_M))
    if not len(near):
        return []
    drop = (z[:, None] - gs[:, near]).max(axis=1) > PARAPET_DROP_M
    base = xy + out_n * (rh + PARAPET_OFF_M)
    ok = drop & inside & ~_under_decks(base, z, decks) & ~_on_carriageways(base, others, 0.0)
    # not across a road joining it (its junctions), nor where another road runs beside
    if ok.any():
        segs = others if isinstance(others, _Segs) else _Segs(others)
        ok &= ~segs.near(base, PARAPET_ROAD_GAP_M, skip=own)
    out, i = [], 0
    while i < len(ok):
        if not ok[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(ok) and ok[j + 1]:
            j += 1
        if j - i + 1 >= WALL_MIN_N:
            sl = slice(i, j + 1)
            # (its foot down to the ground behind it, which falls away: it stood in the air seen from below)
            back = np.flatnonzero((steps >= rh) & (steps <= rh + 2.5))
            g_back = gs[sl][:, back].min(axis=1) if len(back) else z[sl] - 1.0
            out.append({"base": base[sl], "top": z[sl] + PARAPET_H, "foot": np.minimum(z[sl] - 1.0, g_back - 0.3),
                        "toward": -out_n[sl],
                        "thick": np.full(j - i + 1, PARAPET_W), "concrete": False, "rock": False, "parapet": True,
                        "road_z": z[sl]})
        i = j + 1
    return out


def cliff_rows(walls, roads=()):
    """trees.lua rows [group, x, y, z, yaw, scale, height, rank] of rock-face pieces along the rural walls' faces
    (retaining_walls' "rock" walls). roads: build_tile's roads: no piece's footprint on a carriageway (shrunk until
    clear, else left out). Deterministic (hashed by position)."""
    import fast
    lines = [(np.asarray(pts, np.float64)[:, :2], spec.width / 2 + CLIFF_ROAD_GAP_M) for _, spec, pts, _ in roads
             if len(pts) >= 2]
    A = np.concatenate([ln[:-1] for ln, _ in lines]) if lines else np.zeros((0, 2))
    B = np.concatenate([ln[1:] for ln, _ in lines]) if lines else np.zeros((0, 2))
    H = np.concatenate([np.full(len(ln) - 1, h) for ln, h in lines]) if lines else np.zeros(0)

    def on_road(px, py, yaw, sc, width, front, depth):
        """Does the piece's footprint (its corners and edge midpoints) touch a carriageway?"""
        if not len(A):
            return False
        c, s_ = math.cos(math.radians(yaw)), math.sin(math.radians(yaw))
        ux, uy = np.array([c, s_]), np.array([-s_, c])          # its local x (along) and y (back from the road)
        pts = [np.array([px, py]) + ux * a * width * sc / 2 + uy * b * sc
               for a in (-1.0, -0.5, 0.0, 0.5, 1.0) for b in (-front * 0.6, depth - front)]
        fast.require(0, "points_near_segments")
        return bool(np.asarray(fast._ef.points_near_segments(np.ascontiguousarray(np.array(pts)), np.ascontiguousarray(A),
                                                             np.ascontiguousarray(B), np.ascontiguousarray(H))).any())
    rows = []
    for w in walls:
        # (their fronts just off the carriageway, not at the wall's face: the ground climbing in front of the face
        # showed as a mound under the rocks)
        b = np.asarray(w.get("edge", w["base"]), np.float64)
        if len(b) < 2:
            continue
        tw = np.asarray(w["toward"], np.float64)
        road_z, top = np.asarray(w["road_z"], np.float64), np.asarray(w["top"], np.float64)
        clear = np.asarray(w["clear"], np.float64)
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(b, axis=0).T))]
        at = 0.0
        while at <= s[-1]:
            i = min(int(np.searchsorted(s, at)), len(b) - 1)
            hh = float(np.interp(at, s, top) - np.interp(at, s, road_z)) + CLIFF_SINK_M + CLIFF_OVER_M
            jit = _hash01(round(float(b[i, 0]), 1), round(float(b[i, 1]), 1))
            hh *= 0.9 + 0.2 * jit
            sh, frac, front, width, depth = CLIFF_SHAPES[1 if hh >= CLIFF_TALL_M else 0]
            sc = hh / sh
            sc = min(sc, float(clear[i]) / depth)          # (not over another road)
            if sc < 0.2:
                at += 3.0
                continue
            t = tw[i]
            x, y = float(np.interp(at, s, b[:, 0])), float(np.interp(at, s, b[:, 1]))
            jit2 = _hash01(round(float(b[i, 0]), 1), round(float(b[i, 1]), 1), "z")
            yaw = math.degrees(math.atan2(t[0], -t[1])) + (jit - 0.5) * 30.0
            while sc >= 0.2:            # (shrunk until its footprint is off every carriageway, this road's included)
                px, py = x - t[0] * front * sc, y - t[1] * front * sc   # its front (-y, toward the road) on the face
                if not on_road(px, py, yaw, sc, width, front, depth):
                    break
                sc *= 0.8
            if sc < 0.2:
                at += 3.0
                continue
            hh = sc * sh
            zb = float(np.interp(at, s, road_z)) - CLIFF_SINK_M - jit2 * 0.8 * sc
            rows.append(["cliff", round(px, 2), round(py, 2), round(zb + frac * hh, 2), round(yaw % 360.0, 1), 1.0,
                         round(hh, 2), round(jit, 3)])
            at += max(CLIFF_SPACING * width * sc, 1.5)
    return rows


def _hash01(*key):
    import hashlib
    h = hashlib.blake2b(repr(key).encode(), digest_size=8).digest()
    return int.from_bytes(h, "little") / 2.0 ** 64


def _cut_behind(base, out_n, z, ground):
    """Whether the graded ground behind a wall's face line base (k, 2) (out_n: unit vectors away from the road; z: the
    road's heights) climbs as steeply as a cutting does (WALL_STEEP over 1 m, its median along the wall)."""
    offs = np.arange(WALL_STEEP_SPAN[0], WALL_STEEP_SPAN[1] + 0.01, 0.5)
    P = (base[:, None, :] + out_n[:, None, :] * offs[None, :, None]).reshape(-1, 2)
    g = np.asarray(ground(P), np.float64).reshape(len(base), len(offs))
    rise = (g[:, 2:] - g[:, :-2]).max(axis=1)           # (over 1 m: two 0.5 m steps)
    return bool(np.median(rise) >= WALL_STEEP)


def _joined_plans(plans):
    """The plans of each road with its pieces (grading.trim_plan cuts them per map cell) joined end to end where they meet:
    [(rid, xy (n, 2), z (n,), cut (n - 1, 6))], only plans with a cut. A wall's run and taper must not end where a map cell
    does. Pure."""
    by_road = {}
    for p in plans:
        if getattr(p, "cut", None) is not None and not getattr(p, "tunnel", False) and len(p.xy) >= 2:
            by_road.setdefault(p.rid, []).append((np.asarray(p.xy, np.float64)[:, :2], np.asarray(p.z, np.float64),
                                                  np.asarray(p.cut, np.float64)))
    out = []
    for rid, rows in by_road.items():
        rows = sorted(rows, key=lambda r: tuple(r[0][0]))
        while rows:
            xy, z, cut = rows.pop(0)
            grew = True
            while grew:
                grew = False
                for i, (x2, z2, c2) in enumerate(rows):
                    if np.hypot(*(xy[-1] - x2[0])) < JOIN_PIECES_M:
                        xy, z, cut, grew = np.r_[xy, x2[1:]], np.r_[z, z2[1:]], np.r_[cut, c2], True
                    elif np.hypot(*(x2[-1] - xy[0])) < JOIN_PIECES_M:
                        xy, z, cut, grew = np.r_[x2, xy[1:]], np.r_[z2, z[1:]], np.r_[c2, cut], True
                    if grew:
                        rows.pop(i)
                        break
            out.append((rid, xy, z, cut))
    return out


def _road_beside(mid, n_out, d, plans, rid, half):
    """Per segment (mids (k, 2), unit normals n_out outward, unit directions d) of a road of drawn half width half, the road beside
    it on that side, as grading._between_cuts finds it: the nearest parallel plan of another road whose edge lies within
    BETWEEN_ROOM_M of its edge, the reach of the room's test (a road 390 m off across a valley was "beside" it, and the upper level
    read there: 189 m at Heiligenblut): (the distance to its line, inf when none; its carriageway's half width). Pure."""
    import grading
    cos_par = math.cos(math.radians(BETWEEN_PARALLEL_DEG))
    off, out_half = np.full(len(mid), np.inf), np.zeros(len(mid))
    for q in plans:
        if q is None or q.rid == rid or getattr(q, "tunnel", False) or len(q.xy) < 2:
            continue
        foot, on, u, _j, _t = grading._foot(mid, np.asarray(q.xy, np.float64)[:, :2])
        v = foot - mid
        o = (v * n_out).sum(1)
        its_half = getattr(q, "road_half", q.half)
        ok = (on & (np.abs((u * d).sum(1)) >= cos_par) & (o > 0) & (np.abs((v * d).sum(1)) < grading.VERTEX_STEP) & (o < off)
              & (o - its_half <= half + BETWEEN_ROOM_M))
        off[ok], out_half[ok] = o[ok], its_half
    return off, out_half


def _runs_with(mask, seed):
    """mask (k,) with only its runs that hold a point of seed (k,). Pure."""
    out, i = np.zeros(len(mask), bool), 0
    while i < len(mask):
        if not mask[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(mask) and mask[j + 1]:
            j += 1
        if seed[i:j + 1].any():
            out[i:j + 1] = True
        i = j + 1
    return out


def _spans(keep):
    """The slices of keep's (k,) runs of two points or more. Pure."""
    out, i = [], 0
    while i < len(keep):
        if not keep[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(keep) and keep[j + 1]:
            j += 1
        if j > i:
            out.append(slice(i, j + 1))
        i = j + 1
    return out


def _step_side(mid, d, n_out, off, off_top, half, plans, rid, fid, ground, others, decks, road_z, bends, faces):
    """One side of a road's plan: per segment (mids (k, 2), unit directions d, unit normals n_out outward; off, off_top: Plan.cut's
    columns) each test of _between_walls, or None with no step of two roads on that side (tools/heights.py --walls prints
    them). Fields: there, n_out, off, base, low, high, top (the level of wall and cut), h, room, stands, on_deck, on_road, near_wall,
    no_depth, bends, run (a wall stands), cut (the ground is cut). Pure given ground."""
    import grading
    there = np.isfinite(off) & np.isnan(off_top)
    if not there.any():
        return None
    at = np.where(np.isfinite(off), off, 0.0)
    base = mid + n_out * at[:, None]
    low = ground(base - n_out * BETWEEN_LOW_M)
    # (the upper level: at the road beside, whose edge bounds the step, no slope or third road behind it counts)
    beside, its_half = _road_beside(mid, n_out, d, plans, rid, half)
    back = np.where(np.isfinite(beside), np.minimum(np.maximum(at + BETWEEN_HIGH_M, beside - its_half + BETWEEN_EDGE_IN_M),
                                                    beside), at + BETWEEN_HIGH_M)
    high = ground(mid + n_out * back[:, None])
    h = np.where(there, high - low, 0.0)
    # (the room to the other road's carriageway, past this one's drawn edge)
    steps = np.arange(half, half + BETWEEN_ROOM_M + 0.01, 0.5)
    q = (mid[:, None, :] + n_out[:, None, :] * steps[None, :, None]).reshape(-1, 2)
    hit = others.near(q, 0.0, skip=fid).reshape(len(mid), len(steps))
    room = np.where(hit.any(axis=1), steps[np.argmax(hit, axis=1)] - half, np.inf)
    stands = h >= np.maximum(room, 0.0) * BETWEEN_WALL_SLOPE
    on_deck, on_road = _under_decks(base, road_z, decks), others.near(base, 0.0, skip=fid)
    near_wall = np.zeros(len(mid), bool)
    if len(faces):
        near_wall = np.hypot(base[:, 0, None] - faces[:, 0], base[:, 1, None] - faces[:, 1]).min(axis=1) <= BETWEEN_NOT_TWICE_M
    free = ~on_deck & ~on_road
    step_runs = _wall_runs(np.where(stands, h, 0.0)) & free & ~bends & ~near_wall
    no_depth = others.near(base + n_out * BETWEEN_THICK_MIN_M, 0.0, skip=fid)
    # (on into a cutting's own step too, its height set: the same step of the same ground, Cap Corse's going on 2 m out)
    steps_on = np.isfinite(off) & free & (high - low >= BETWEEN_CUT_MIN_M)
    return SimpleNamespace(there=there, n_out=n_out, off=off, base=base, low=low, high=high, h=h, room=room, stands=stands,
                           top=np.maximum(np.minimum(high, low + grading.WALL_MAX_H_CITY_M), low),     # (one level for both)
                           on_deck=on_deck, on_road=on_road, near_wall=near_wall, no_depth=no_depth, bends=bends,
                           run=step_runs & ~no_depth, cut=_runs_with(steps_on, step_runs))


def _between_walls(frame, plans, roads, ground, exact, others, decks, made, cut_lines=None):
    """Retaining walls at the steps grading._between_cuts set between two roads at two levels, facing the lower road: where
    the step stands higher than the room between their carriageways (BETWEEN_WALL_SLOPE) and at least a cutting's height
    (_wall_runs). The step lies where the plan says, not where the walls of a cutting are looked for: past the road's core,
    it would be on the upper road already, and _cut_behind would read that road's flat lanes (Cap Corse: a stone wall
    between a main road and the lane climbing beside it drew nothing). Its top follows the upper level to its ends, the
    ground cut along it to the same level: a top lowered at the ends left the ground standing over it. plans: the plans around
    in frame; roads: the tile's [(fid, spec, pts, _)]; ground(P (n, 2)): the graded ground's height; made: the walls so far,
    none doubled; cut_lines: a list that gets the lines the ground is cut along (scenery.wallcut: dicts of base (n, 2), low,
    high (n,), toward (n, 2)), the step on past a wall's ends too. Pure given ground."""
    import grading
    x0, y0, x1, y1 = exact
    road_of = {grading.road_id(fid): (fid, spec) for fid, spec, _p, _x in roads}
    faces = [np.asarray(w["base"], np.float64) for w in made if not w.get("parapet")]
    faces = np.concatenate(faces) if faces else np.zeros((0, 2))
    out = []
    for rid, xy, z, cut in _joined_plans(plans):
        if rid not in road_of or not (np.isfinite(cut[:, [0, 3]]) & np.isnan(cut[:, [1, 4]])).any():
            continue
        fid, spec = road_of[rid]
        if spec.kind not in BUILT:
            continue
        mid, zm = (xy[:-1] + xy[1:]) / 2, (z[:-1] + z[1:]) / 2
        d = np.diff(xy, axis=0)
        d /= np.maximum(np.hypot(*d.T), 1e-9)[:, None]
        nl = np.c_[-d[:, 1], d[:, 0]]
        la, lo, _ = frame.enu_to_geodetic(mid[:, 0], mid[:, 1], np.zeros(len(mid)))
        road_z = np.asarray(frame.geodetic_to_enu(la, lo, zm)[2], np.float64)
        bends = grading.bend_zone(mid)
        half = spec.width / 2
        for side, c0 in ((1.0, 0), (-1.0, 3)):
            t = _step_side(mid, d, nl * side, cut[:, c0], cut[:, c0 + 1], half, plans, rid, fid, ground, others, decks, road_z,
                           bends, faces)
            if t is None:
                continue
            base, n_out, low, top = t.base, t.n_out, t.low, t.top
            inside = (base[:, 0] >= x0 - 2) & (base[:, 0] < x1 + 2) & (base[:, 1] >= y0 - 2) & (base[:, 1] < y1 + 2)
            for sl in _spans(t.run & inside):
                th = _clear_depth(base[sl], n_out[sl], np.full(sl.stop - sl.start, WALL_THICK_MAX_M), others, fid, skip=fid)
                out.append({"base": base[sl], "top": top[sl] + WALL_TOP_M, "foot": low[sl] - WALL_FOOT_M,
                            "toward": -n_out[sl], "thick": np.clip(th, BETWEEN_THICK_MIN_M, WALL_COPING_MIN_M),
                            "concrete": spec.cls in CONCRETE_WALL_CLASSES, "rock": False, "road_z": low[sl],
                            "clear": th, "edge": mid[sl] + n_out[sl] * (half + CLIFF_EDGE_M)})
            if cut_lines is not None:
                for sl in _spans(t.cut & inside):
                    cut_lines.append({"base": base[sl] + n_out[sl] * BETWEEN_CUT_IN_M, "low": low[sl], "high": top[sl],
                                      "toward": -n_out[sl]})
    return out


def retaining_walls(frame, roads, elev, exact, decks=(), plans_at=None, cut_lines=None):
    """Stone retaining walls along the ground roads cut deeper than grading.WALL_CUT_M into the ground (the grading
    leaves the ground at its natural height right behind them): [dict(base (k, 2) the wall's face line, top (k,),
    foot (k,), toward (k, 2) unit vectors to the road)] of the walls in the tile box `exact`. The edge of the road's
    flat core (as grading plans it), from the road level up to the ground behind; none where another road comes in
    (its ground is graded to the road), nor under a bridge deck (decks: the deck chunks near the tile; the ground beside
    a motorway under an overpass is its abutment's fill, and the wall rose through the deck, the user's report on the
    Bruce Highway). Central Park's 86th Street Transverse between its stone walls (
    plans_at(xy (n, 2)): the grading's plans around the points, for the walls between two roads (_between_walls), or
    None: none of those; cut_lines: _between_walls'. Pure given elev and plans_at."""
    import grading
    import roadmesh
    x0, y0, x1, y1 = exact
    pts_all, info = [], []
    for fid, spec, pts, _ in roads:
        if spec.kind not in BUILT or len(pts) < 2:
            continue
        xy, s = grading.resample(np.asarray(pts[:, :2], np.float64), WALL_STEP)
        if len(xy) < 2:
            continue
        seg = np.hypot(*np.diff(pts[:, :2], axis=0).T)
        z = np.interp(s, np.r_[0.0, np.cumsum(seg)], pts[:, 2])
        inside = (xy[:, 0] >= x0 - 2) & (xy[:, 0] < x1 + 2) & (xy[:, 1] >= y0 - 2) & (xy[:, 1] < y1 + 2)
        if not inside.any():
            continue
        d = np.gradient(xy, axis=0)
        d /= np.maximum(np.hypot(*d.T), 1e-9)[:, None]
        nl = np.stack([-d[:, 1], d[:, 0]], axis=1)
        width = max(spec.width, carriageway(spec.cls, spec.kind, True, None, spec.oneway))
        core = width / 2 + grading.shoulder(spec)
        # (the grading's sharp cuttings end the core sooner; its flat strip behind a wall reaches past the core)
        steps = np.arange(width / 2 + 0.5, core + grading.WALL_FLAT_M + 1.51, 1.0)
        for side in (1.0, -1.0):
            probe = xy + nl * side * (core + grading.WALL_FLAT_M + grading.WALL_T_M + WALL_PROBE_M)
            pts_all.append(probe)
            info.append((xy, z, nl * side, core, inside, width / 2, steps, spec.cls in CONCRETE_WALL_CLASSES,
                         fid, not spec.urban, not spec.urban and spec.cls not in NO_PARAPET_CLASSES and not spec.median,
                         grading.wall_max_h(spec)))
    if not pts_all:
        return []

    def ground(P):
        la, lo, _ = frame.enu_to_geodetic(P[:, 0], P[:, 1], np.zeros(len(P)))
        return np.asarray(frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))[2], np.float64)
    g = ground(np.concatenate(pts_all))
    # the graded ground at the steps out from the road only where a wall or a parapet can stand: a side whose probe
    # finds no cutting (_wall_runs) and that gets no parapets has no use for them (most of a town's streets: 8 of 9 of
    # the ground lookups)
    probes, k = [], 0
    for xy, z, out_n, core, inside, rh, steps, concrete, fid, rural, parapets, max_h in info:
        gg = g[k:k + len(xy)]
        k += len(xy)
        need = len(steps) and (parapets or _wall_runs(gg - z).any())
        probes.append((gg, need))
    sp = []
    for (xy, z, out_n, core, inside, rh, steps, *_r), (gg, need) in zip(info, probes):
        if need:
            sp.extend(xy + out_n * o for o in steps)
    gsteps = ground(np.concatenate(sp)) if sp else np.zeros(0)
    out, k = [], 0
    others = {fid: (np.asarray(pts, np.float64)[:, :2], spec.width / 2) for fid, spec, pts, _ in roads if len(pts) >= 2}
    others = _Segs(others)          # (one table for all the carriageway tests below)
    bend_of = {}
    for (xy, z, out_n, core, inside, rh, steps, concrete, fid, rural, parapets, max_h), (gg, need) in zip(info, probes):
        key = (id(xy), len(xy))
        if key not in bend_of:          # (a tight bend: no wall into it, grading.bend_zone)
            bend_of[key] = grading.bend_zone(xy)
        bends = bend_of[key]
        face = np.full(len(xy), core + 0.1)
        thick = np.full(len(xy), roadmesh.WALL_THICK_M)
        top_g = gg
        if need:                    # the wall where the graded ground starts to climb (a sharp cutting: before the core's edge)
            gs = gsteps[k:k + len(xy) * len(steps)].reshape(len(steps), len(xy)).T
            k += len(xy) * len(steps)
            up = gs - z[:, None] > WALL_STEP_UP_M
            first = np.argmax(up, axis=1)
            # (the grading's flat strip in front of the climb: the terrain's 2 m lattice draws a step at an angle to it
            # as teeth reaching up to a grid diagonal out, under the wall's top; its face in front of them)
            face = np.where(up.any(axis=1), np.maximum(steps[first] - 1.0 - grading.WALL_FLAT_M, rh + 0.1), face)
            # its top back to where the graded ground is up again (no trough behind it: a street above drove into one)
            full = gs >= (z + WALL_FULL * (gg - z))[:, None]
            back = np.argmax(full, axis=1)
            # (and a grid diagonal more: the terrain's lattice reaches the top that much later between its points)
            thick = np.where(full.any(axis=1), np.clip(steps[back] - face + WALL_DIAG_M, WALL_THICK_MIN_M,
                                                       WALL_THICK_MAX_M), thick)
            # (its top over the highest graded ground under it, not the one probe's: the bank poked through it in
            # patches where that probe sat in a dip)
            under = steps[None, :] >= face[:, None]
            top_g = np.maximum(gg, np.where(under, gs, -np.inf).max(axis=1))
            # (and never past where the ground behind falls away again: between a hairpin's legs the bank tops out
            # and drops to the other leg, and the top hung out over that slope, its underside seen from the road
            # above, the Stelvio Pass)
            low = (gs < (top_g - WALL_SLAB_DZ)[:, None]) & (steps[None, :] > (face + 1.0)[:, None])
            reach = np.where(low.any(axis=1), steps[np.argmax(low, axis=1)] - face, np.inf)
            thick = np.minimum(thick, np.maximum(reach - 0.5, WALL_COPING_MIN_M))
        if parapets and need:
            out.extend(_parapets(xy, z, out_n, rh, inside, steps, gs, others, fid, decks))
        full = _wall_runs(gg - z) & ~_under_decks(xy + out_n * core, z, decks) & ~bends
        # (no face standing on a carriageway: a hairpin's other leg, the same road, the Stelvio Pass)
        full &= ~_on_carriageways(xy + out_n * face[:, None], others, 0.0)
        # (its ends lowered over WALL_TAPER_M toward the road, the whole wall's ends, not a tile edge's)
        taper = _taper(xy, full)
        cut = full & inside
        i = 0
        while i < len(cut):
            if not cut[i]:
                i += 1
                continue
            j = i
            while j + 1 < len(cut) and cut[j + 1]:
                j += 1
            if j > i:
                sl = slice(i, j + 1)
                # (its top's depth evened out along it: the 1 m probe steps drew a jagged back edge)
                th = thick[sl]
                th = np.maximum.reduce([np.r_[th[:1].repeat(m), th[:len(th) - m]] for m in range(WALL_EVEN_N + 1)]
                                       + [np.r_[th[m:], th[-1:].repeat(m)] for m in range(1, WALL_EVEN_N + 1)])
                base = xy[sl] + out_n[sl] * face[sl][:, None]
                if not _cut_behind(base, out_n[sl], z[sl], ground):        # (a natural slope: no wall, WALL_STEEP)
                    i = j + 1
                    continue
                # (never over another road: a hairpin's wall top covered the road above, the Stelvio Pass, the user's
                # report)
                th = np.minimum(th, _clear_depth(base, out_n[sl], th, others, fid))
                tp = np.minimum(top_g[sl], z[sl] + max_h) + WALL_TOP_M      # (no taller than that)
                tp = z[sl] + WALL_TAPER_LOW_M + (tp - z[sl] - WALL_TAPER_LOW_M).clip(0) * taper[sl]
                # (rock faces only as an experiment, BNE_CLIFF_WALLS=on, for tall rural cuts: the Stelvio's hairpins are
                # walled in dry stone, tall cuts too, Mapillary; the user chose stone walls for passes)
                tall = CLIFF_WALLS_ON and float(np.max(top_g[sl] - z[sl])) > CLIFF_MIN_CUT_M
                out.append({"base": base, "top": np.maximum(tp, z[sl] + WALL_TAPER_LOW_M), "foot": z[sl] - WALL_FOOT_M,
                            "toward": -out_n[sl], "thick": th, "concrete": concrete, "rock": rural and tall,
                            "road_z": z[sl], "clear": _clear_depth(base, out_n[sl], np.full(len(base), CLIFF_REACH_M),
                                                                   others, fid),
                            "edge": xy[sl] + out_n[sl] * (rh + CLIFF_EDGE_M)})
            i = j + 1
    if plans_at is not None:
        lines = np.concatenate([np.asarray(pts, np.float64)[:, :2] for _f, _s, pts, _x in roads if len(pts) >= 2])
        out.extend(_between_walls(frame, plans_at(lines), roads, ground, exact, others, decks, out, cut_lines))
    return out


# Two parts of one tunnel joined end to end are one road going on, never twins: the pieces of a tube split by its sections
# (tunnel_sections: a 1 m low arch at the portal, then the full tube) or by the map (one way in two segments). Every point
# of a short piece lies by the next one, so it passed as beside it, the long one became a twin's floor without a tube of
# its own and the shared tube was the 1 m they overlap: 650 m of the Kollmanntunnel's westbound tube open to the sky,
# the hill over it seen from below. Both are checked: the same feature's tunnel range (the fid before "#") and an end
# shared (_EndJoin's tolerance).
