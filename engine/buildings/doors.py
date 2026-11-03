"""Doors, wall signs, fences in front."""
import math

import numpy as np

import fast

from .looks import BAND_BRICK, BAND_OFFICE, BAND_OFFICE2, CHURCH_CLASSES, METALWALL, _hash01
from .mesh import PORCH_DECK_M, STOOP_H, _inside, door_ground, drawn_ring
from .places import castle_boxes, use_data, worship_boxes
from .garages import DRIVEWAY, DRIVEWAY_W
from .sites import bridge_lines, garage_rings, road_lines, support_rings, tunnel_lines, water_rings, way_lines
from .photo import district_town
from .tiles import (
    BACK_ROAD_CLASSES, DOOR_OUT_M, DOOR_ROAD_M, G_DOOR, MAIN_STREET_CLASSES, MAIN_STREET_SETBACK_M, MAIN_STREET_SHOPS,
    STOOP_SHARE, tile_buildings
)


def doors(items, lines, x0, y0, drives=None):
    """Prop rows (trees.lua rows, group "door") of a front door per house: on the wall whose middle is
    nearest a road and faces it, a row house's to one side, others' in the middle. lines: [(centreline
    (k, 2) in the anchor frame, half width[, class, urban])]. A building close to an urban main street gets
    a shopfront ground floor instead (spec.shop, most of them). drives (a list) gets a driveway chunk (road
    tile chunk dicts, draped by roadmesh) from each detached house's front to the road's edge."""
    if not lines:
        return []
    segs, smain, shalf, sminor = [], [], [], []
    for ln in lines:
        pts, half = ln[0], ln[1]
        main = len(ln) > 3 and ln[3] and ln[2] in MAIN_STREET_CLASSES     # an urban main street
        p = np.asarray(pts, np.float64)
        if len(p) >= 2:
            segs.append(np.concatenate([p[:-1], p[1:]], 1))
            smain.append(np.full(len(p) - 1, bool(main)))
            shalf.append(np.full(len(p) - 1, float(half)))
            sminor.append(np.full(len(p) - 1, len(ln) > 2 and ln[2] in BACK_ROAD_CLASSES))
    if not segs:
        return []
    S = np.concatenate(segs)                             # (n, 4) x0 y0 x1 y1
    SMAIN, SHALF, SMINOR = np.concatenate(smain), np.concatenate(shalf), np.concatenate(sminor)
    A, B = S[:, :2], S[:, 2:]
    D = B - A
    L2 = np.maximum((D * D).sum(1), 1e-12)
    rows = []
    others = [(spec, spec.ring + np.array([x0, y0])) for spec, _, _ in items if (spec.min_h or 0.0) <= 0.5]
    for spec, gmin, gmax in items:
        no_door = False
        if spec.plain or spec.floors >= 7 or spec.band in (BAND_OFFICE, BAND_OFFICE2) or spec.wall:
            if not spec.wall or spec.plain or spec.floors >= 7:
                no_door = True
        # shops and big boxes: their sign faces the street, not the alley or the parking aisle behind (a pitched roof's
        # too: its band hangs under the eave; most village shops have one)
        storefront = (spec.shop or spec.windows is False) and not spec.plain
        named = bool(spec.plates) and not spec.plain     # signs_for's: on the street wall, any building
        if no_door and not (storefront or named):
            continue
        ring = drawn_ring(spec) + np.array([x0, y0])
        best = None
        for i in range(len(ring)):
            a, b = ring[i], ring[(i + 1) % len(ring)]
            e = b - a
            Le = float(math.hypot(*e))
            if Le < 2.5:
                continue
            mid = (a + b) / 2
            t = np.clip(((mid - A) * D).sum(1) / L2, 0, 1)
            q = A + t[:, None] * D
            dist = np.hypot(*(q - mid).T)
            k = int(dist.argmin())
            if dist[k] > DOOR_ROAD_M:
                continue
            out = np.array([e[1], -e[0]]) / Le
            if float(np.dot(q[k] - mid, out)) <= 0:
                continue                                 # the wall faces away from that road
            rank = (bool(SMINOR[k]) if storefront or named else False, float(dist[k]))
            if best is None or rank < best[0]:
                best = (rank, a, e / Le, Le, out, i, bool(SMAIN[k]) and dist[k] < SHALF[k] + MAIN_STREET_SETBACK_M,
                        k)
        if best is None:
            continue
        _, a, d, Le, out, edge, on_main, kseg = best
        if named:
            spec.plate = edge
        if spec.windows is False:
            spec.front = edge                   # a big box: its storefront faces the road
            if storefront:
                spec.sign = edge
            rows.extend(_sign_in_open(_wall_sign(spec, a, d, Le, out, gmax), spec, d, out, others))
            continue
        if spec.cls in RESTAURANT_CLASSES and spec.floors == 1:
            rows.extend(_sign_in_open(_wall_sign(spec, a, d, Le, out, gmax), spec, d, out, others))
        if spec.shop:
            if storefront and not spec.wall:
                spec.sign = edge                # the sign band over the street wall's shopfront
            continue
        if no_door:
            continue
        if on_main and not spec.wall and spec.roof == "flat" and spec.cls not in CHURCH_CLASSES \
                and _hash01(spec.seed, "shop") < MAIN_STREET_SHOPS:
            spec.shop = True                    # a main street's ground floor: a shopfront, no house door
            if not spec.plain:
                spec.sign = edge
            continue
        narrow = Le < 9.0
        f = (0.22 if _hash01(spec.seed, "door") < 0.5 else 0.78) if narrow else 0.5
        spec.door = (edge, Le * f)          # _walls leaves the ground floor's band plain there
        # brick row houses (an eastern city's): white marble steps up to the door
        if narrow and spec.band == BAND_BRICK and spec.roof == "flat" and _hash01(spec.seed, "stoop") < STOOP_SHARE:
            spec.stoop = (edge, Le * f)
        if drives is not None and spec.wall and Le >= 7.0:
            # the driveway beside the door, straight out to the road's edge
            g = 0.82 if f <= 0.5 else 0.18
            p0 = a + d * (Le * g) + out * 0.2
            t = float(np.clip(((p0 - A[kseg]) * D[kseg]).sum() / L2[kseg], 0, 1))
            q = A[kseg] + t * D[kseg]
            v = p0 - q
            dl = float(np.hypot(*v))
            if SHALF[kseg] + 1.0 < dl < DOOR_ROAD_M:
                p1 = q + v / dl * (SHALF[kseg] + 0.1)
                n = max(2, int(dl // 4.0) + 1)
                pts = [p0 + (p1 - p0) * (j / (n - 1)) for j in range(n)]
                drives.append({"m": DRIVEWAY["m"], "w": DRIVEWAY_W, "tl": DRIVEWAY["tl"], "p": DRIVEWAY["p"],
                               "n": [[round(float(pp[0]), 3), round(float(pp[1]), 3), 0.0] for pp in pts]})
        if spec.roof != "flat" and not narrow and _hash01(spec.seed, "fence") < FENCE_SHARE:
            rows.extend(_front_fence(spec, a, d, Le, f, A[kseg], D[kseg], L2[kseg], SHALF[kseg], gmin,
                                     drives is not None and spec.wall and Le >= 7.0, (A, B, SHALF)))
        p = a + d * (Le * f) + out * DOOR_OUT_M
        gd = door_ground(spec, edge, Le * f, gmax) if spec.stoop else gmax     # a stoop's door: over its own ground
        base = gd + (STOOP_H if spec.stoop else 0.0) + (PORCH_DECK_M if spec.porch else 0.0)   # (the deck / stoop)
        rows.append([G_DOOR, round(float(p[0]), 2), round(float(p[1]), 2), round(base, 2),
                     round(math.degrees(math.atan2(d[1], d[0])) % 360.0, 1), 1.0, 2.2,
                     round(_hash01(spec.seed, "dv"), 3)])
    return rows


# Company signs on walls (West Coast USA's, for its fictional firms): (prop group, width m, height m, panel thin
# along its local x (True) or y (False)). Warehouses: Logistics or Rentabox; big retail boxes: Lemon; one-storey
# restaurants: Turboburger.
WALL_SIGNS = {"logistics": ("wallsign_logistics", 10.8, 5.8, True), "rentabox": ("wallsign_rentabox", 8.2, 5.7, True),
              "lemon": ("wallsign_lemon", 11.5, 3.6, True), "burger": ("wallsign_turboburger", 5.8, 2.4, False)}
WALL_SIGN_SHARE = 0.6
RESTAURANT_CLASSES = {"restaurant", "fast_food", "cafe"}


def _sign_in_open(rows, spec, d, out, others):
    """rows (a _wall_sign) kept only when the panel and the air in front of it are clear of the other buildings:
    a sign on a wall hidden behind a neighbour stood out through the neighbour at the wall's angle (Stelvio
    pass, a big box's sign through the shop in front of it)."""
    if not rows:
        return rows
    _, x, y, _, _, _, h, _ = rows[0]
    w = WALL_SIGNS[next(k for k, v in WALL_SIGNS.items() if v[0] == rows[0][0])][1] * h / \
        WALL_SIGNS[next(k for k, v in WALL_SIGNS.items() if v[0] == rows[0][0])][2]
    c = np.array([x, y])
    probes = [c + d * (w / 2 * f) + out * o for f in (-1.0, 0.0, 1.0) for o in (0.0, 1.5)]
    for other, ring in others:
        if other is spec:
            continue
        if any(_inside(ring, p) for p in probes):
            return []
    return rows


def _wall_sign(spec, a, d, Le, out, gmax):
    """A company sign centred high on a big box's or restaurant's street wall (WALL_SIGNS), if it fits; none on a
    building with its own name (spec.names, spec.plates: _signs and _plates write it there)."""
    if spec.names or spec.plates or _hash01(spec.seed, "wallsign") >= WALL_SIGN_SHARE:
        return []
    if spec.cls in RESTAURANT_CLASSES:
        key = "burger"
    elif spec.wall and str(spec.wall).startswith(METALWALL):
        key = "logistics" if _hash01(spec.seed, "ws") < 0.5 else "rentabox"
    else:
        key = "lemon"
    group, w, h0, thin_x = WALL_SIGNS[key]
    h = min(h0, spec.height * 0.45)                     # scaled down to the wall (trees.lua scales to the height)
    w *= h / h0
    if h < 1.8 or Le < w + 2.0:
        return []
    zc = gmax + spec.height - 0.6 - h / 2               # its top 0.6 m under the parapet
    p = a + d * (Le / 2) + out * 0.35
    # the logo faces the model's local -x (Lemon, Logistics, Rentabox: seen in game) or its -y
    yaw = math.degrees(math.atan2(out[1], out[0])) + (180.0 if thin_x else 90.0)
    return [[group, round(float(p[0]), 2), round(float(p[1]), 2), round(float(zc), 2), round(yaw % 360.0, 1), 1.0,
             round(h, 2), 0.0]]


G_FENCE = "fence"           # trees.lua: East Coast USA's low wooden fence (eca_bld_wood_fence_c, 5.4 m, along x)
FENCE_SEG_M = 5.4
FENCE_SHARE = 0.3           # detached houses with a fence along the front of their yard (hashed)
FENCE_BACK_M = 3.2          # m from the road's edge (the back of the sidewalk)
FENCE_MIN_YARD_M = 2.5      # the front yard at least this deep between the fence and the house
FENCE_CLEAR_M = 2.0         # m every piece keeps from any road's edge (a house on a bend or a corner: its fence ran
                            # along one road out across another Falcon Drive, Coquitlam)


def _front_fence(spec, a, d, Le, f, A, D, L2, half, z, driveway, roads=None):
    """Prop rows of a fence along the front of a house's yard, parallel to the road at the back of the sidewalk,
    a little wider than the house, with gaps for the path to the door and the driveway. roads: (starts (n, 2), ends
    (n, 2), half widths (n,)) of the roads near: no piece within FENCE_CLEAR_M of their edges."""
    mid = a + d * (Le / 2)
    t = float(np.clip(((mid - A) * D).sum() / L2, 0, 1))
    q = A + t * D
    v = mid - q
    dist = float(np.hypot(*v))
    if dist - (half + FENCE_BACK_M) < FENCE_MIN_YARD_M:
        return []
    nv = v / dist
    dr = D / math.sqrt(L2)
    centre = q + nv * (half + FENCE_BACK_M)
    yaw = round(math.degrees(math.atan2(dr[1], dr[0])) % 360.0, 1)
    gaps = [float((a + d * (Le * f) - centre) @ dr)]                          # the path to the door
    if driveway:
        gaps.append(float((a + d * (Le * (0.82 if f <= 0.5 else 0.18)) - centre) @ dr))
    n = max(1, int(math.ceil((Le + 3.0) / FENCE_SEG_M)))
    rows = []
    for k in range(n):
        sk = (k - (n - 1) / 2) * FENCE_SEG_M
        if any(abs(sk - g) < FENCE_SEG_M / 2 + 0.6 for g in gaps):
            continue
        p = centre + dr * sk
        if roads is not None and len(roads[0]):
            ends = np.array([p - dr * (FENCE_SEG_M / 2), p, p + dr * (FENCE_SEG_M / 2)])
            fast.require(0, "points_near_segments")
            if np.asarray(fast._ef.points_near_segments(ends, np.ascontiguousarray(roads[0], np.float64),
                                                        np.ascontiguousarray(roads[1], np.float64),
                                                        np.asarray(roads[2], np.float64) + FENCE_CLEAR_M)).any():
                continue
        rows.append([G_FENCE, round(float(p[0]), 2), round(float(p[1]), 2), round(float(z), 2), yaw, 1.0, 1.3,
                     round(_hash01(spec.seed, "fr", k), 3)])
    return rows


def road_tile_items(frame, tx, ty, md, ground, decks=None, skip=frozenset(), country=None):
    """tile_buildings of road tile (tx, ty), from the map cells under it. decks: the bridge decks near it
    [(xy (k, 2), z (k,))] in the anchor frame (roads.BridgeProfiles.parts): buildings they run through get a way.
    skip: building ids left out (gas station canopies). country: ISO code (the signs' invented names)."""
    import roads
    box = roads.tile_bbox(tx, ty)
    x0, y0, x1, y1 = box
    keys = roads.cells_of_tile(frame, tx, ty, margin=0.0)
    cds = [md.cell(k, layers=("buildings", "building_parts", "roads", "infrastructure", "water"), kind="demand")
           for k in keys]
    return tile_buildings(frame, x0, y0, x1, y1, [c.layers.get("buildings") for c in cds], ground,
                          own=box if hasattr(box, "owns") else None, uses=use_data(frame, md, keys, x0, y0),
                          country=country, worship=worship_boxes(frame, md, keys, x0, y0),
                          castles=castle_boxes(frame, md, keys, x0, y0),
                          part_layers=[c.layers.get("building_parts") for c in cds],
                          west_town=district_town(frame, tx, ty, md),
                          roads_xy=road_lines(frame, [c.layers.get("roads") for c in cds], x0, y0),
                          ways_xy=way_lines(frame, [c.layers.get("roads") for c in cds], x0, y0),
                          tunnels_xy=tunnel_lines(frame, [c.layers.get("roads") for c in cds], x0, y0),
                          garages_xy=garage_rings(frame, [c.layers.get("infrastructure") for c in cds], x0, y0),
                          supports=support_rings(frame, [c.layers.get("infrastructure") for c in cds], x0, y0),
                          bridges_xy=bridge_lines(frame, [c.layers.get("roads") for c in cds], x0, y0),
                          water_xy=water_rings(frame, [c.layers.get("water") for c in cds], x0, y0),
                          decks=[(np.asarray(d[0], np.float64)[:, :2] - [x0, y0], np.asarray(d[1], np.float64))
                                 + tuple(d[2:3]) for d in decks] if decks else None, skip=skip)


POLES_COVERAGE = 0.30       # ... and its streets get wired wooden poles (furniture; Ocean City's photos: poles
                            # everywhere; Fells Point's dense core ~0.45 keeps lamp posts)
