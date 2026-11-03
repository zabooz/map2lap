"""Parking structures: decks, ramps and what stands on a road's deck."""
import numpy as np

# A parking structure you can drive into ("garage buildings ... are solid"): open storeys of
# concrete decks on perimeter columns, a parapet round each upper deck, and a two-lane switchback ramp along the
# longest wall (one lane up per storey, a U-turn landing at each end). Only where the ramp fits inside the footprint
# and the ground under it is near level; otherwise the closed box as before. The tile's mesh collides as drawn.
DECK_LANE_M = 3.6           # a ramp lane
DECK_EDGE_M = 0.8           # the ramp lanes start this far in from the wall (the columns stand there)
DECK_LANDING_M = 7.0        # flat deck at each end of the ramps (the U-turn)
DECK_SLOPE = 0.17           # the steepest ramp
DECK_SLAB_M = 0.3
DECK_PARAPET_M = 1.0
DECK_COLUMN_M = 9.0         # perimeter column spacing
DECK_LEVEL_M = 3.5          # ground this uneven (max - min) under the footprint: no deck (up to it: the ground deck
                            # level at the highest ground on a plinth, driven into from the uphill side)
DECK_HEADROOM_M = 2.6       # the lowest storey height that still drives
DECK_STOREY_M = 3.0         # a deck's storey where the mapped floors are too many for the height
DECK_RAMP_EDGES = 4         # the longest edges tried for the ramp, longest first


def _deck_layout(ring, storey):
    """The ramp's frame on the longest edge of the counter-clockwise ring it fits along: (edge index i, A, along
    unit u, inward unit n, s0, s1), the ramps between arc lengths s0 and s1; None when it fits along none of the
    DECK_RAMP_EDGES longest (too short for DECK_SLOPE, or the well outside the ring: the longest edge of an
    L-shaped garage can be the short leg's, 3 of downtown Baltimore's 15 garages were boxes)."""
    lens = [float(np.hypot(*(ring[(k + 1) % len(ring)] - ring[k]))) for k in range(len(ring))]
    depth = DECK_EDGE_M + 2 * DECK_LANE_M
    for i in sorted(range(len(ring)), key=lambda k: -lens[k])[:DECK_RAMP_EDGES]:
        a, b = ring[i], ring[(i + 1) % len(ring)]
        L = lens[i]
        s0, s1 = 0.5 + DECK_LANDING_M, L - 0.5 - DECK_LANDING_M
        if s1 - s0 < storey / DECK_SLOPE:
            return None                         # the rest are shorter
        u = (b - a) / L
        n = np.array([-u[1], u[0]])             # the inside is on the left
        if all(_inside(ring, a + u * s + n * d) for s in np.linspace(0.5, L - 0.5, 9)
               for d in (0.3, depth / 2, depth + 0.5, depth + DECK_LANDING_M / 2)):
            return i, a, u, n, s0, s1
    return None


def _deck_wall(m, p, q, z0, z1, mat, t=0.2):
    """A thin wall (both faces and a top) from p to q, z0 to z1."""
    d = q - p
    L = float(np.hypot(*d))
    if L > 0.05:
        _box(m, (p + q) / 2, d / L, L / 2, t / 2, z0, z1, mat)


def deck_plan(spec, gmin, gmax):
    """(counter-clockwise ring, floors, storey height, _deck_layout) of a parking structure drawn as open decks, or
    None (not a garage, ground too uneven, storeys too low, the ramp does not fit: a closed box)."""
    if not spec.deck or gmax - gmin > DECK_LEVEL_M or not spec.height or (spec.min_h or 0.0) > 0.5:
        return None
    floors = max(1, int(spec.floors or 1))
    storey = spec.height / floors
    if storey < DECK_HEADROOM_M:                # split levels counted as floors (10 in 20.8 m): whole decks
        floors = max(1, int(spec.height // DECK_STOREY_M))
        storey = spec.height / floors
    if storey < DECK_HEADROOM_M:
        return None
    ring = np.asarray(spec.ring, np.float64)
    if _area2(ring) < 0:
        ring = ring[::-1]
    lay = _deck_layout(ring, storey)
    return None if lay is None else (ring, floors, storey, lay)


def _parking_deck(m, spec, gmin, gmax, mat_idx):
    """The open parking structure (see DECK_*); False when it does not apply (the caller draws the box)."""
    plan_ = deck_plan(spec, gmin, gmax)
    if plan_ is None:
        return False
    ring, floors, storey, (i, A, u, n, s0, s1) = plan_
    # weathered concrete (Baltimore's street photos: the white decks read as a skeleton; city garages are grey)
    mat = mat_idx[f"{PANEL}|{len(WALL_TINTS[PANEL]) - 1 - int(_hash01(spec.seed, 'deck') * 2)}"]
    W, e = DECK_LANE_M, DECK_EDGE_M
    depth = e + 2 * W
    zs = [gmax + 0.03 + k * storey for k in range(floors + 1)]

    def at(s, d):
        return A + u * s + n * d

    def uvp(p):
        return (float(p[0]) / 4.0, float(p[1]) / 4.0)

    k_ring = len(ring)
    m.poly([(p[0], p[1], zs[0]) for p in ring], [uvp(p) for p in ring], mat)          # the ground deck, whole
    if gmax - gmin > 0.05:                      # its plinth down to the lowest ground (a sloping street)
        for j in range(k_ring):
            p, q = ring[j], ring[(j + 1) % k_ring]
            m.quad((p[0], p[1], gmin - FOUNDATION_M), (q[0], q[1], gmin - FOUNDATION_M), (q[0], q[1], zs[0]),
                   (p[0], p[1], zs[0]), (0, 0), (1, 0), (1, 0.1), (0, 0.1), mat)
    # the upper decks: the ring with the ramp well (both lanes, s0..s1) cut in from the longest edge
    well = [at(s0, 0.0), at(s0, depth), at(s1, depth), at(s1, 0.0)]
    pts = [A] + well + [ring[(i + 1 + j) % k_ring] for j in range(k_ring - 1)]
    for k in range(1, floors + 1):
        z = zs[k]
        m.poly([(p[0], p[1], z) for p in pts], [uvp(p) for p in pts], mat)
        m.poly([(p[0], p[1], z - DECK_SLAB_M) for p in pts[::-1]], [uvp(p) for p in pts[::-1]], mat)
        for j in range(len(pts)):
            p, q = pts[j], pts[(j + 1) % len(pts)]
            m.quad((p[0], p[1], z - DECK_SLAB_M), (q[0], q[1], z - DECK_SLAB_M), (q[0], q[1], z), (p[0], p[1], z),
                   (0, 0), (1, 0), (1, 0.1), (0, 0.1), mat)
            if not (1 <= j <= 3):               # the parapet, not round the well (below)
                _deck_wall(m, p, q, z, z + DECK_PARAPET_M, mat)
        # round the well: its inner side and the end away from the ramps' landing (ramp k - 1 comes up at s1 when
        # k - 1 is even, and ramp k leaves from that same end); the top deck has no ramp leaving: its lane closed
        land = s1 if (k - 1) % 2 == 0 else s0
        far = s0 if land == s1 else s1
        _deck_wall(m, at(s0, depth), at(s1, depth), z, z + DECK_PARAPET_M, mat)
        _deck_wall(m, at(far, 0.0), at(far, depth), z, z + DECK_PARAPET_M, mat)
        if k == floors:
            d_free = e + (k % 2) * W
            _deck_wall(m, at(land, d_free), at(land, d_free + W), z, z + DECK_PARAPET_M, mat)
    # the ramps: ramp k from deck k to deck k + 1 on lane k % 2, even ones climbing from s0 to s1, walled both sides
    for k in range(floors):
        d0 = e + (k % 2) * W
        sa, sb = (s0, s1) if k % 2 == 0 else (s1, s0)
        za, zb = zs[k], zs[k + 1]
        top = [(at(sa, d0), za), (at(sb, d0), zb), (at(sb, d0 + W), zb), (at(sa, d0 + W), za)]
        if sb < sa:                             # counter-clockwise seen from above
            top = top[::-1]
        quad = [(p[0], p[1], z) for p, z in top]
        m.quad(*quad, (0, 0), (1, 0), (1, 1), (0, 1), mat)
        m.quad(*[(x, y, z - DECK_SLAB_M) for x, y, z in quad[::-1]], (0, 0), (1, 0), (1, 1), (0, 1), mat)
        for d in (d0, d0 + W):
            steps = 6
            for j in range(steps):
                f0, f1 = j / steps, (j + 1) / steps
                ca, cb = at(sa + (sb - sa) * f0, d), at(sa + (sb - sa) * f1, d)
                _deck_wall(m, ca, cb, za + (zb - za) * f0, za + (zb - za) * f1 + DECK_PARAPET_M, mat, 0.15)
    _garage_skin(m, spec, ring, zs, i, mat_idx)
    # the columns: round the outline every DECK_COLUMN_M, from the foundation to the top deck
    for j in range(k_ring):
        p, q = ring[j], ring[(j + 1) % k_ring]
        L = float(np.hypot(*(q - p)))
        if L < 0.5:
            continue
        d = (q - p) / L
        inward = np.array([-d[1], d[0]])
        for t in np.arange(0.0, L, DECK_COLUMN_M):
            _box(m, p + d * t + inward * 0.35, d, 0.25, 0.25, zs[0] - FOUNDATION_M, zs[-1], mat)
    return True


# A garage's skin ("Garages look ugly and basic", "all garages look the
# same"; Canton's on Mapillary: brick or precast concrete spandrels with long openings between, solid corners, a
# stair tower over the roof): per garage (hashed) one of GARAGE_SKINS
GARAGE_SKINS = ("bne_brick_red", "bne_brick_dark", "bne_brick_tan", "bne_precast", "bne_precast_warm")
SPANDREL_H = 1.1            # m of spandrel over each deck (the slab's edge behind it)
SPANDREL_T = 0.3            # m thick, its face just outside the outline
PIER_W = 0.9                # m: the solid corners and every PIER_EVERY_M along the outline
PIER_EVERY_M = 18.0
STAIR_TOWER_M = 4.5         # m square, at the outline's corner farthest from the ramps, ...
STAIR_TOWER_UP = 3.2        # ... this far over the top deck


def _garage_skin(m, spec, ring, zs, ramp_edge, mat_idx):
    """The facade of an open parking structure: spandrels round its outline at every deck above the ground,
    piers at its corners and along it, a stair tower; brick or precast concrete by its seed (GARAGE_SKINS)."""
    mat = mat_idx[GARAGE_SKINS[int(_hash01(spec.seed, "skin") * len(GARAGE_SKINS)) % len(GARAGE_SKINS)]]
    k_ring = len(ring)
    for j in range(k_ring):
        p, q = ring[j], ring[(j + 1) % k_ring]
        L = float(np.hypot(*(q - p)))
        if L < 0.5:
            continue
        d = (q - p) / L
        out = np.array([d[1], -d[0]])           # (counter-clockwise ring: the outside on the right)
        c = (p + q) / 2 + out * (SPANDREL_T / 2 - 0.05)
        for z in zs[1:]:
            _box_tiled(m, c, d, L / 2, SPANDREL_T / 2, z - DECK_SLAB_M - 0.1, z + SPANDREL_H, mat, 2.0)
        for t in [0.0] + list(np.arange(PIER_EVERY_M, L - PIER_EVERY_M / 2, PIER_EVERY_M)):
            _box_tiled(m, p + d * t + out * 0.05, d, PIER_W / 2, PIER_W / 2, zs[0] - FOUNDATION_M,
                       zs[-1] + SPANDREL_H + 0.2, mat, 2.0)
    # the stair tower: at the ring's vertex farthest from the ramps' edge
    a, b = ring[ramp_edge], ring[(ramp_edge + 1) % k_ring]
    ab = b - a
    L2 = max(float(ab @ ab), 1e-9)

    def dist(v):
        t = float(np.clip(((v - a) @ ab) / L2, 0.0, 1.0))
        return float(np.hypot(*(v - (a + t * ab))))
    jv = max(range(k_ring), key=lambda j: dist(ring[j]))
    v = ring[jv]
    inward = ring.mean(0) - v
    inward = inward / max(float(np.hypot(*inward)), 1e-9)
    c = v + inward * (STAIR_TOWER_M * 0.75)
    if _inside(ring, c):
        e = ring[(jv + 1) % k_ring] - v
        e = e / max(float(np.hypot(*e)), 1e-9)
        _box_tiled(m, c, e, STAIR_TOWER_M / 2, STAIR_TOWER_M / 2, zs[0] - FOUNDATION_M, zs[-1] + STAIR_TOWER_UP,
                   mat, 2.0)


def garage_drives(items, lines, x0, y0):
    """Driveway chunks (road tile chunk dicts, draped by roadmesh) into each open parking structure: from the
    middle of its outline's edge nearest a road out to that road's edge (report #51: "No ramp leading
    into the garage")."""
    out = []
    if not lines:
        return out
    segs = []
    for ln in lines:
        pts, half = np.asarray(ln[0], np.float64)[:, :2], ln[1]
        for k in range(len(pts) - 1):
            segs.append((pts[k], pts[k + 1], half))
    if not segs:
        return out
    A = np.array([s[0] for s in segs])
    B = np.array([s[1] for s in segs])
    H = np.array([s[2] for s in segs])
    D = B - A
    L2 = np.maximum((D * D).sum(1), 1e-12)
    for spec, gmin, gmax in items:
        plan_ = deck_plan(spec, gmin, gmax)
        if plan_ is None:
            continue
        ring = plan_[0] + np.array([x0, y0])
        best = None
        for j in range(len(ring)):
            p, q = ring[j], ring[(j + 1) % len(ring)]
            if np.hypot(*(q - p)) < 2 * DRIVEWAY_W:
                continue
            mid = (p + q) / 2
            t = np.clip(((mid - A) * D).sum(1) / L2, 0.0, 1.0)
            near = A + t[:, None] * D
            dd = np.hypot(*(mid - near).T) - H
            k = int(np.argmin(dd))
            if best is None or dd[k] < best[0]:
                best = (float(dd[k]), mid, near[k], H[k], p, q)
        if best is None or not (0.5 < best[0] < GARAGE_DRIVE_MAX_M):
            continue
        _, mid, qn, half, p, q = best
        d = (q - p) / max(float(np.hypot(*(q - p))), 1e-9)
        inside = np.array([-d[1], d[0]])
        v = mid - qn
        dl = float(np.hypot(*v))
        p0 = mid + inside * 3.0             # a few metres in, onto the ground deck
        p1 = qn + v / max(dl, 1e-9) * (half + 0.1)
        n = max(2, int(np.hypot(*(p1 - p0)) // 4.0) + 1)
        pts = [p0 + (p1 - p0) * (j / (n - 1)) for j in range(n)]
        out.append({"m": DRIVEWAY["m"], "w": GARAGE_DRIVE_W, "tl": DRIVEWAY["tl"], "p": DRIVEWAY["p"],
                    "n": [[round(float(pp[0]), 3), round(float(pp[1]), 3), 0.0] for pp in pts]})
    return out


GARAGE_DRIVE_W = 6.5        # m: a garage entrance's two lanes
GARAGE_DRIVE_MAX_M = 25.0   # m from the outline to a road's edge at most


def _clip_half(ring, p0, nrm, keep_ge):
    """The part of the ring (k, 2) on one side of the line through p0 with normal nrm (Sutherland-Hodgman)."""
    out = []
    pts = list(ring[:-1]) if np.allclose(ring[0], ring[-1]) else list(ring)
    side = [float((q - p0) @ nrm) for q in pts]
    for k in range(len(pts)):
        a, b = pts[k], pts[(k + 1) % len(pts)]
        sa, sb = side[k], side[(k + 1) % len(pts)]
        ina, inb = (sa >= 0) == keep_ge or sa == 0, (sb >= 0) == keep_ge or sb == 0
        if ina:
            out.append(a)
        if (sa > 0) != (sb > 0) and sa != 0 and sb != 0:
            t = sa / (sa - sb)
            out.append(a + t * (b - a))
    if len(out) < 3:
        return None
    r = np.array(out + [out[0]], np.float64)
    return r if _area2(r) / 2 >= 2.0 else None


DECK_STAND_M = 2.0      # m: a deck this far over the ground under a footprint is what the building stands on ...
DECK_LANE_M = 1.0       # ... and it is left out where it reaches this far inside the deck's road (its width / 2) ...
DECK_REACH_M = 6.0      # m past the road's edge a footprint's centre still counts as on its deck
DECK_SEA_M = 0.5        # ... only over ground this low: water, a beach (a building on dry land under a viaduct stays)


def on_deck(ring, decks, ground):
    """(over the lanes, deck height) when footprint ring (k, 2) has its centre on a deck (decks: [(xy (k, 2), z (k,),
    width m)], the same frame) standing DECK_STAND_M or more over ground (m, its highest ground, DECK_SEA_M at most:
    over water), else None. A building
    on the old Sunshine Skyway span kept as a fishing pier (its bait shop) was raised from the seabed: its top 0.5 m
    stood over the deck. Over the lanes: a corner more than DECK_LANE_M inside the road's edge. Pure."""
    r = np.asarray(ring, np.float64)[:, :2]
    c = r.mean(0)
    best = None
    for d in decks:
        if len(d) < 3 or len(d[0]) < 2:
            continue
        xy, z, w = np.asarray(d[0], np.float64), np.asarray(d[1], np.float64), float(d[2])
        a, b = xy[:-1], xy[1:]
        ab = b - a
        t = np.clip(((c - a) * ab).sum(1) / np.maximum((ab * ab).sum(1), 1e-12), 0.0, 1.0)
        dist = np.hypot(*(a + t[:, None] * ab - c).T)
        k = int(np.argmin(dist))
        half = w / 2 + DECK_REACH_M         # (a pier's map width is its lane: its deck reaches past it)
        if dist[k] > half:
            continue
        zd = float(z[k] + t[k] * (z[k + 1] - z[k]))
        if zd - ground < DECK_STAND_M:
            continue
        if best is None or dist[k] < best[0]:
            best = (dist[k], zd, a[k], ab[k] / max(float(np.hypot(*ab[k])), 1e-9), w)
    if best is None or ground > DECK_SEA_M:
        return None
    _, zd, p, u, w = best
    off = (r - p) @ np.array([-u[1], u[0]])            # (signed: a footprint across the lanes has corners both sides)
    inner = w / 2 - DECK_LANE_M
    return bool(off.min() < inner and off.max() > -inner), zd


# (read inside functions only; here so that the parts can load each other)
from .looks import FOUNDATION_M, PANEL, WALL_TINTS  # noqa: E402
from .styles import _area2, _hash01  # noqa: E402
from .mesh import _box, _box_tiled, _inside  # noqa: E402
from .tiles import DRIVEWAY, DRIVEWAY_W  # noqa: E402
