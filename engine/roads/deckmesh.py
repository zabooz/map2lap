"""A bridge's meshes: chunks, abutments, tilted rows, pads."""
import os

import numpy as np

import mapgeom

from .style import CONCRETE, EDGE_DECAL, GUTTER, LOOK, SIDEWALK, SIMPLIFY_Z_M, terrain_surface
from .levels import bridge_parts
from .tiles import DECK, DECK_CLEAR, DECK_STEP, _chunk, box_owns, split
from .walks import clip_polyline, densify, extras, simplify
from .decks import _EndJoin, _smooth_pinned, deck_heights
from .bridges import CORNER_CONCRETE_M


def _bridge_chunks(frame, bseen, elev, exact, bridges=None, cells=None):
    """The chunks of the bridges crossing the tile box `exact` (deck surfaces flagged "deck", their
    centre / edge lines; every bridge chunk "fixed": its z is the deck's, not the ground's). Deck
    heights: from `bridges` (BridgeProfiles: whole chains, shared by every tile), else from the
    chains found among the given cells (deck_heights; tests)."""
    if bridges is not None:
        got = [(fid, spec, np.c_[xy, z], lon) for fid, spec, xy, z, lon in bridges.parts(cells, exact)
               if np.isfinite(z).all()]
        dd = getattr(bridges, "depth_of", None)
        bb = getattr(bridges, "deck_bank", None)
        return _deck_chunks(got, exact, bridges._ground, {d[0]: dd(d[0]) for d in got} if dd else None,
                            [bb(p[:, :2], p[:, 2]) if bb else None for _f, _spec, p, _l in got])
    if not bseen:
        return []
    parts = []                                  # (fid, spec, xy (k, 2), lon)
    for fid in sorted(bseen):
        feats, i, spec = bseen[fid]
        for ring in bridge_parts(feats, i):
            if len(ring) >= 2:
                e, n = mapgeom.enu_xy(feats, frame, ring)
                parts.append((fid, spec, densify(np.stack([e, n], axis=1), DECK_STEP),
                              float(np.mean(ring[:, 0]))))
    if not parts:
        return []

    def ground(xy):
        la, lo, _ = frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        h = np.asarray(elev(la, lo), np.float64)
        return frame.geodetic_to_enu(la, lo, h)[2]
    zs = deck_heights([p[2] for p in parts], ground)
    allxy = np.concatenate([p[2] for p in parts])
    gz = ground(allxy)                          # one call: the ground under every deck point
    decks, k = [], 0
    for (fid, spec, xy, lon), z in zip(parts, zs):
        g = gz[k:k + len(xy)]
        k += len(xy)
        if not np.isfinite(z).all():
            continue
        # never below the ground under it (abutments on low spots buried decks), then
        # smoothed along it like a road profile (the ends keep their heights: the abutments)
        g = g + DECK_CLEAR
        z = np.maximum(z, g)
        if len(z) > 3:          # (the ends' trend kept: smoothed then pinned, the deck bent up beside an abutment)
            import grading
            z = np.maximum(_smooth_pinned(z, DECK_STEP, grading.SIGMA_M), g)
        decks.append((fid, spec, np.c_[xy, z], lon))
    return _deck_chunks(decks, exact, ground)


DECK_CONTEXT_M = 24.0   # m around a tile its bridges' decks are passed as context (roadmesh.deck: whether an edge has
                        # another deck beside it; a parapet stood across the lanes at a tile seam, the deck beside it
                        # in the next tile, Queensboro Bridge)


def _deck_look(spec):
    """A bridge deck's look: the concrete of a `surface=concrete` street (it stays concrete over the bridge), else
    asphalt — and asphalt for rock/grass surfaces, whose ground mask cannot be painted on a deck at all."""
    if not terrain_surface(spec) and spec.kind == "paved" and spec.surf == "concrete":
        return CONCRETE
    return DECK


def _corner_look(point, roads):
    """A junction's corner-fill polygon look: the asphalt of the paved streets meeting there, or the concrete of
    them when a concrete street is within CORNER_CONCRETE_M of the corner (its wedges would otherwise be asphalt
    wedges in a concrete junction)."""
    px, py = float(point[0]), float(point[1])
    for _fid, spec, pts, _lon in roads:
        if spec.kind == "paved" and spec.surf == "concrete":
            if np.hypot(pts[:, 0] - px, pts[:, 1] - py).min() <= CORNER_CONCRETE_M:
                return CONCRETE
    return LOOK["paved"]


DECK_JOIN_M = 1.0       # m: deck parts' ends this close go on one from the other (no parapet end there)
ABUT_GROUND_M = 1.0     # a deck part's end within this of the ground under it is an abutment (roadmesh.deck: its
                        # parapets ramp down there to the approach)


def _abutments(pts, ground_fn):
    """[(x, y)] of the ends of a deck part (pts (k, 3)) that land on the ground (within ABUT_GROUND_M); [] without
    ground_fn. Never raises."""
    if ground_fn is None or len(pts) < 2:
        return []
    try:
        ends = np.asarray(pts, np.float64)[[0, -1]]
        g = np.asarray(ground_fn(ends[:, :2]), np.float64)
        return [(float(e[0]), float(e[1])) for e, gz in zip(ends, g) if e[2] - gz <= ABUT_GROUND_M]
    except Exception:
        return []


def _deck_tilt(center, bank, q):
    """Per point q (m, 2) the cross slope of the deck centre line center (k, 2) with its bank
    (k,) at q's nearest point on it, and q's signed offset to its left (m). Pure."""
    a, d = center[:-1], np.diff(center, axis=0)
    L2 = np.maximum((d * d).sum(1), 1e-12)
    t = np.clip(((q[:, None, :] - a[None]) * d[None]).sum(2) / L2[None], 0.0, 1.0)
    p = a[None] + t[..., None] * d[None]
    j = np.argmin(np.hypot(*(q[:, None, :] - p).transpose(2, 0, 1)), 1)
    i = np.arange(len(q))
    tj = t[i, j]
    b = bank[j] + tj * (bank[j + 1] - bank[j])
    dj = d[j] / np.sqrt(L2[j])[:, None]
    off = (q - p[i, j])[:, 1] * dj[:, 0] - (q - p[i, j])[:, 0] * dj[:, 1]
    return b, off


def under_deck_ground(q, z, parts, banks):
    """Ground heights z (m,) at points q (m, 2) kept DECK_CLEAR under the deck parts over them, tilted by their banks:
    parts [(xy (k, 2), z (k,), half width)], banks per part (k,) or None. Not within UNDER_DECK_END_M of a part's end: the
    terrain cell across the joint carries the road. A deck takes its height from its road, so the ground follows it.
    Pure."""
    z = np.array(z, np.float64)
    q = np.asarray(q, np.float64).reshape(-1, 2)
    for (xy, zd, half), bank in zip(parts, banks):
        xy, zd = np.asarray(xy, np.float64)[:, :2], np.asarray(zd, np.float64)
        if len(xy) < 2 or not len(q):
            continue
        lo, hi = xy.min(0) - half - 1.0, xy.max(0) + half + 1.0
        near = np.flatnonzero(((q >= lo) & (q <= hi)).all(1))
        if not len(near):
            continue
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        zq, off = _deck_tilt(xy, zd, q[near])
        arc, _o = _deck_tilt(xy, s, q[near])
        b = 0.0 if bank is None else _deck_tilt(xy, np.asarray(bank, np.float64), q[near])[0]
        top = zq + b * np.clip(off, -half, half) - DECK_CLEAR
        on = (np.abs(off) <= half + 1.0) & (arc >= UNDER_DECK_END_M) & (arc <= s[-1] - UNDER_DECK_END_M)
        z[near[on]] = np.minimum(z[near[on]], top[on])
    return z


UNDER_DECK_END_M = 2.0      # m: one terrain cell


def tilt_rows_on_decks(rows, parts, bridges):
    """The guard rail rows (guardrails.forest_rows: [group, x, y, z, ...]) that stand on a tilted
    deck (deck_bank) raised or lowered with it at their offset from its centre line. parts: bridges.parts()'."""
    bb = getattr(bridges, "deck_bank", None)
    if not rows or not parts or bb is None:
        return rows
    out = [list(r) for r in rows]
    q = np.array([[r[1], r[2]] for r in out], np.float64)
    zr = np.array([r[3] for r in out], np.float64)
    for _fid, spec, xy, z, _lon in parts:
        b = bb(xy, z)
        if b is None:
            continue
        xy = np.asarray(xy, np.float64)[:, :2]
        lo, hi = xy.min(0) - spec.width, xy.max(0) + spec.width
        near = np.flatnonzero(((q >= lo) & (q <= hi)).all(1))
        if not len(near):
            continue
        bq, off = _deck_tilt(xy, np.asarray(b, np.float64), q[near])
        _zq, zoff = _deck_tilt(xy, np.asarray(z, np.float64), q[near])
        on = (np.abs(off) <= spec.width / 2 + 1.5) & (np.abs(zr[near] - _zq) < 1.5)
        for n, bn, of in zip(near[on], bq[on], off[on]):
            out[n][3] = float(out[n][3]) + float(bn) * float(of)
    return out


# Junction pads on bridges: where deck parts meet (with each other, or with a ground road going on from the joint), the
# convex hull of their carriageways within PAD_REACH_M of the joint is paved at their heights (roadmesh.deck draws it,
# colliding): the corner of a turn, the wedge where a ramp leaves, a wider deck's edge past a narrower street's. The map
# leaves those open, over whatever lies under the bridge: at North Charles Street over I-83 in Baltimore the AI cut the
# corner onto the station's road and fell 6 m into the motorway's cut, 2 of 2 runs. None where a deck simply
# goes on straight from another part (BNE_DECK_PADS=off: none at all).
PADS_ON = os.environ.get("BNE_DECK_PADS", "on") != "off"
PAD_REACH_M = 12.0
PAD_STEP_M = 2.0
PAD_JOIN_M = 0.75           # m: ends this near are one joint (_skew_decks' tolerance)
PAD_GROUND_M = 1.0          # m: a ground road's end this near a joint goes on from it
PAD_STRAIGHT_COS = -0.97    # two parts leaving a joint this straight need none
# A pad only where three or more carriageways meet (a junction): two are one road going on (a bridge in a bend onto
# its own approach, or a way split on the bridge), at any angle; a pad there would lie just under the deck and the road
# over metres, both colliding, and take a short bridge's parapets.
PAD_MIN_PARTS = 3
# The pad reaches PAD_MARGIN_M past the carriageways (a turn cut across the corner stays that far from its rim); the
# decks' parapets stand nowhere inside it, and its rim has a railing where the ground under it lies PAD_WALL_DROP_M or
# more lower, except where a carriageway leaves it (within its half width + PAD_OPEN_M): the station road's parapet
# began at the joint, in the turn's path, and the AI clipped its end (Charles Street over I-83).
PAD_MARGIN_M = 2.5
PAD_OPEN_M = 0.75
PAD_WALL_DROP_M = 1.0
PAD_RIM_STEP_M = 1.0


def deck_pads(decks, ground_roads, box, ground_fn, own=True):
    """[(ring (k, 3), centre (3,), walls [(pts (m, 3), out (m, 2))])] of the junction pads of the joints of decks
    [(fid, spec, xy (k, 2), z (k,))] (the bridge parts round tile box, as bridges.parts gives them) whose joint the box
    owns (own False: every joint, the parapets' test round the tile); ground_roads [(fid, spec, pts (k, 2+), _)] the
    ground carriageways near it (build_tile roads_out), the ground's heights ground_fn(xy) (the decks' abutments').
    walls: the rim's railings (PAD_*). earthfast.deck_pad, deck_pad_rim. Pure given ground_fn."""
    if not PADS_ON or not decks:
        return []
    import fast
    fast.require(113, "deck_pad_rim")
    join = _EndJoin(PAD_JOIN_M)
    nodes, inc = [], {}
    for fid, spec, xy, z in decks:
        xy = np.asarray(xy, np.float64)[:, :2]
        z = np.asarray(z, np.float64)
        if len(xy) < 2 or not np.isfinite(z).all():
            continue
        for at in (0, -1):
            nd = join(xy[at])
            if nd == len(nodes):
                nodes.append(xy[at].copy())
            line, zz = (xy, z) if at == 0 else (xy[::-1], z[::-1])
            inc.setdefault(nd, []).append((line, zz, spec.width / 2))
    out = []
    gl = [(np.asarray(pts, np.float64)[:, :2], spec.width / 2) for _fid, spec, pts, _ in ground_roads
          if spec is not None and len(pts) >= 2]
    for nd, parts in sorted(inc.items()):
        q = nodes[nd]
        if own and not box_owns(box, float(q[0]), float(q[1])):
            continue
        parts = list(parts)
        for line, half in gl:
            for at in (0, -1):
                if np.hypot(*(line[at] - q)) < PAD_GROUND_M:
                    ln = line if at == 0 else line[::-1]
                    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(ln, axis=0).T))]
                    keep = s <= PAD_REACH_M + 2 * PAD_STEP_M
                    ln = ln[keep] if keep.sum() >= 2 else ln[:2]
                    parts.append((ln, np.asarray(ground_fn(ln), np.float64), half))
        if len(parts) < PAD_MIN_PARTS:
            continue
        if len(parts) == 2:
            d = []
            for line, _z, _h in parts:
                v = line[min(len(line) - 1, 1)] - line[0]
                d.append(v / max(np.hypot(*v), 1e-9))
            if float(np.dot(d[0], d[1])) < PAD_STRAIGHT_COS:
                continue                        # (a deck going on straight: its own end, an abutment, no corner)
        pts = np.ascontiguousarray(np.concatenate([p[0] for p in parts]), np.float64)
        zz = np.ascontiguousarray(np.concatenate([p[1] for p in parts]), np.float64)
        off = np.r_[0, np.cumsum([len(p[0]) for p in parts])].astype(np.int64)
        halves = np.array([p[2] for p in parts], np.float64)
        hull = np.asarray(fast._ef.deck_pad(pts, zz, off, halves + PAD_MARGIN_M, PAD_REACH_M, PAD_STEP_M), np.float64)
        if len(hull) < 3:
            continue
        zc = float(np.mean([p[1][0] for p in parts]))
        rim = np.asarray(fast._ef.deck_pad_rim(np.ascontiguousarray(hull), pts, off, halves, PAD_RIM_STEP_M,
                                               PAD_OPEN_M), np.float64)
        walls = []
        if len(rim):
            drop = rim[:, 2] - np.asarray(ground_fn(rim[:, :2]), np.float64)
            wall = (rim[:, 5] < 0.5) & (drop >= PAD_WALL_DROP_M)
            # runs round the ring (one closing over its start joined)
            k = len(rim)
            if wall.all():
                walls.append((np.r_[rim[:, :3], rim[:1, :3]], np.r_[rim[:, 3:5], rim[:1, 3:5]]))
            elif wall.any():
                start = int(np.flatnonzero(~wall)[0])
                order = [(start + i) % k for i in range(1, k + 1)]
                run = []
                for i in order:
                    if wall[i]:
                        run.append(i)
                    elif run:
                        if len(run) >= 2:
                            walls.append((rim[run, :3], rim[run, 3:5]))
                        run = []
                if len(run) >= 2:
                    walls.append((rim[run, :3], rim[run, 3:5]))
        out.append((hull, np.array([q[0], q[1], zc]), walls))
    return out


def pad_inside(pads, xy, shrink=0.3):
    """Per point of xy (n, 2): inside a pad of pads (deck_pads) by shrink m or more (its interior: no parapet). Pure."""
    xy = np.asarray(xy, np.float64).reshape(-1, 2)
    out = np.zeros(len(xy), bool)
    for pad in pads:
        r = np.asarray(pad[0], np.float64)[:, :2]
        a, b = r, np.roll(r, -1, axis=0)
        e = b - a
        ln = np.maximum(np.hypot(*e.T), 1e-9)
        # signed distance inside every edge (counter-clockwise: left of each edge is inside)
        d = ((e[None, :, 0] * (xy[:, None, 1] - a[None, :, 1]) - e[None, :, 1] * (xy[:, None, 0] - a[None, :, 0]))
             / ln[None, :])
        out |= (d >= shrink).all(1)
    return out


def _deck_chunks(decks, exact, ground_fn=None, depths=None, banks=None):
    """Deck + line chunks of bridge parts [(fid, spec, pts (k, 3), lon)] clipped to the box `exact`, and their decks
    within DECK_CONTEXT_M of it as "ctx" chunks (not drawn: build_tile's caller hands them to roadmesh.deck).
    ground_fn(xy) -> heights: a part's ends on the ground are its abutments (each deck chunk's "abut" points: the
    parapets ramp down there)."""
    out = []
    abut = {}
    ends = [(i, e, np.asarray(pts, np.float64)[e, :2]) for i, (_, _, pts, _) in enumerate(decks) if len(pts) >= 2
            for e in (0, -1)]
    for i, (fid, spec, pts, lon) in enumerate(decks):
        abut.setdefault(fid, []).extend(_abutments(pts, ground_fn))
        # an end no other deck part goes on from is an end of its parapets too (it stood there full height, square, on
        # the slab's edge: a short channel bridge's ends on the Sunshine Skyway causeway)
        for i2, e, q in ends:
            if i2 != i:
                continue
            if not any(j != i and np.hypot(*(q - q2)) < DECK_JOIN_M for j, _, q2 in ends):
                abut[fid].append((float(q[0]), float(q[1])))
    x0, y0, x1, y1 = exact
    wide = (x0 - DECK_CONTEXT_M, y0 - DECK_CONTEXT_M, x1 + DECK_CONTEXT_M, y1 + DECK_CONTEXT_M)
    def tilt(ch, i, pts, deck):     # the deck's cross slope: its own per point, a line's in its z
        b = banks[i] if banks else None
        if b is None:
            return
        n = np.asarray(ch["n"], np.float64)
        bq, off = _deck_tilt(np.asarray(pts, np.float64)[:, :2], np.asarray(b, np.float64), n[:, :2])
        if deck:
            ch["bank"] = np.round(bq, 4).tolist()
        else:
            n[:, 2] += bq * off
            ch["n"] = n.tolist()
    for i, (fid, spec, pts, lon) in enumerate(decks):
        for piece in clip_polyline(pts, *wide):
            for c in split(densify(simplify(piece, ztol=SIMPLIFY_Z_M))):
                if len(c) >= 2:
                    ch = _chunk({**_deck_look(spec), "deck": True}, spec.width, c)
                    tilt(ch, i, pts, True)
                    ch.update(fixed=True, deck=True, fid=fid, ctx=True)
                    if depths and fid in depths:
                        ch["dd"] = round(float(depths[fid]), 3)
                    out.append(ch)
    for i, (fid, spec, pts, lon) in enumerate(decks):
        lines = [({**_deck_look(spec), "deck": True}, spec.width, pts)]
        for look, w, line in extras(spec, pts, lon):
            if look["m"] not in (SIDEWALK["m"], GUTTER["m"], EDGE_DECAL["m"]):     # (no ground beside a deck)
                lines.append((look, w, line))
        for look, w, line in lines:
            for piece in clip_polyline(line, *exact):
                for c in split(densify(simplify(piece, ztol=SIMPLIFY_Z_M))):
                    if len(c) >= 2:
                        ch = _chunk(look, w, c)
                        tilt(ch, i, pts, bool(look.get("deck")))
                        ch["fixed"] = True
                        if look.get("deck"):
                            ch["deck"] = True
                            ch["fid"] = fid             # (roadmesh.deck: no parapet between parts side by side)
                            if depths and fid in depths:
                                ch["dd"] = round(float(depths[fid]), 3)     # (roadmesh.deck: its slab and girders)
                            if abut.get(fid):
                                ch["abut"] = abut[fid]
                        out.append(ch)
    return out
