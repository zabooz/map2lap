"""Parapets, cliffs and retaining walls."""
import math
import os

import numpy as np

from .style import BUILT
from .specs import carriageway
from .walks import cut_outside, simplify
from .tunnels import (
    CONCRETE_WALL_CLASSES, WALL_COPING_MIN_M, WALL_DIAG_M, WALL_EVEN_N, WALL_FOOT_M, WALL_FULL, WALL_GAP_N,
    WALL_KEEP_M, WALL_MIN_N, WALL_OTHER_GAP_M, WALL_PROBE_M, WALL_SLAB_DZ, WALL_STEEP, WALL_STEEP_SPAN, WALL_STEP,
    WALL_STEP_UP_M, WALL_TAPER_LOW_M, WALL_TAPER_M, WALL_THICK_MAX_M, WALL_THICK_MIN_M, WALL_TOP_M
)


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


def _clear_depth(base, out, depth, others, own):
    """Per point of a wall's face line base (k, 2): how far (up to depth (k,)) out from it along out (k, 2) stays off
    every other road's carriageway in others {fid: (centreline (m, 2), half width)} or a _Segs of them (less
    WALL_OTHER_GAP_M). Pure."""
    segs = others if isinstance(others, _Segs) else _Segs(others)
    steps = np.arange(0.5, float(np.max(depth)) + 0.51, 0.5)
    q = (base[:, None, :] + out[:, None, :] * steps[None, :, None]).reshape(-1, 2)
    # (its own road too: a hairpin's other leg; the face stands past its own carriageway, so the stretch beside it
    # never hits)
    hit = segs.near(q, WALL_OTHER_GAP_M).reshape(len(base), len(steps))
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


def retaining_walls(frame, roads, elev, exact, decks=()):
    """Stone retaining walls along the ground roads cut deeper than grading.WALL_CUT_M into the ground (the grading
    leaves the ground at its natural height right behind them): [dict(base (k, 2) the wall's face line, top (k,),
    foot (k,), toward (k, 2) unit vectors to the road)] of the walls in the tile box `exact`. The edge of the road's
    flat core (as grading plans it), from the road level up to the ground behind; none where another road comes in
    (its ground is graded to the road), nor under a bridge deck (decks: the deck chunks near the tile; the ground beside
    a motorway under an overpass is its abutment's fill, and the wall rose through the deck, the user's report on the
    Bruce Highway). Central Park's 86th Street Transverse between its stone walls (
   ). Pure given elev."""
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
    return out


TWIN_SHARE = 0.8        # a tunnel part beside another for this share of its length (their tubes overlapping) ...
TWIN_DZ_M = 2.0         # ... with its floor within this of the other's: twin tubes, one tube round both (
                        # the Route des Tamarins' two carriageways 9.5 m apart on Réunion, each an 11 m road in its own
                        # tube, the tubes through each other's walls and portals)
TWIN_STEP_M = 10.0
# Two parts of one tunnel joined end to end are one road going on, never twins: the pieces of a tube split by its sections
# (tunnel_sections: a 1 m low arch at the portal, then the full tube) or by the map (one way in two segments). Every point
# of a short piece lies by the next one, so it passed as beside it, the long one became a twin's floor without a tube of
# its own and the shared tube was the 1 m they overlap: 650 m of the Kollmanntunnel's westbound tube open to the sky,
# the hill over it seen from below. Both are checked: the same feature's tunnel range (the fid before "#") and an end
# shared (_EndJoin's tolerance).
