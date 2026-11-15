"""Mesh and the walls, roofs, signs and details of a building."""
import math

import numpy as np

import fast

from .looks import (
    BANDS, BAND_SHOP, BLADE_CAP_M, BLADE_T, BLADE_W, CHURCH_CLASSES, CORNICE_DOWN_M, CORNICE_OUT_M, CORNICE_UP_M,
    EAVE_M, FOUNDATION_M, GREEN_CROSS, GROUND_FLOOR_SHOP_M, HALL_CAP_M, HALL_CAP_SHARE, HALL_CLEAR_M, KEEP_SIDE, MERLON,
    PANEL_CAP, PANEL_H, PITCH, PLATE_H, PLATE_TOP_M, PLATE_W, ROOF_SLATE, ROOF_UV_M, SALTBOX_OFFSET, SHED_LONG_SHARE, SHOP, SIDING_UV_M, SIGN_CAP,
    SIGN_H, SIGN_MARGIN_M, SIGN_OUT, SIGN_SHOP_M, SIGN_TINTS, SURFACE_MATERIALS, SYMBOL_IN_M, SYMBOL_M, TILE_PX_M, _hash01
)
from .styles import _area2, oriented_box, roof_box, roof_pitch, shed_count, skillion_axis, triangulate
from .facade import DOOR_GAP_M, HOUSE_BAY_M, bay_width, pattern_for, require_layout


OVER_TUNNEL_CLEAR_M = 7.5   # (the tube's vault is roadmesh.TUNNEL_H = 6.8 m over the floor;: Eisenhower's
                            # east portal building closed the tunnel)

# A row house's marble stoop ("the steps model isnt good. Try and find one from the
# offical maps"): built as the official maps' stair blocks are (West Coast USA's stairblock1, Italy's old stairs:
# treads and risers up to a landing between stepped side walls); their own models carry race-track paint and logos
STOOP_H = 0.54              # m: three steps up to the door (Fells Point's on Mapillary: low white marble
STOOP_STEPS = 3             # steps, no side walls; ours were four between walls, big white blocks)
STOOP_RISE = 0.18           # m a step (more of them where the street falls away from the house)
STOOP_MAX_STEPS = 7
STOOP_RISE_MAX = 0.23       # m: the steepest outdoor step
STOOP_TREAD = 0.3           # m deep each step
STOOP_LANDING = 0.6         # m deep the landing at the door
STOOP_W = 1.3               # m wide the steps


class Mesh:
    """Positions, uvs, colours, triangles and their material index, appended to. A material is a token
    (index, RGBA) as _Looks gives. Kept as flat lists of numbers (x y z x y z ..., one material per triangle):
    a road tile adds ~25k quads, and lists of tuples flattened at the end took ~2.5 s of a Steam Deck's 87 s."""

    def __init__(self):
        self.P, self.UV, self.C, self.T, self.M = [], [], [], [], []
        self.n = 0
        self.marks = []             # [(vertices so far, what comes from there on)]: a building's signs, for the track's list

    def mark(self, what):
        """What is added from now on is what (None: the building again)."""
        self.marks.append((self.n, what))

    def quad(self, a, b, c, d, uva, uvb, uvc, uvd, mat):
        """Corners counter-clockwise seen from outside."""
        i = self.n
        self.P += (*a, *b, *c, *d)
        self.UV += (*uva, *uvb, *uvc, *uvd)
        self.C += mat[1] * 4
        self.T += (i, i + 1, i + 2, i, i + 2, i + 3)
        self.M += (mat[0], mat[0])
        self.n += 4

    def quads(self, P, UV, mid, mats):
        """Quads from a kernel (earthfast.building_walls): P 12 numbers per quad, UV 8, mid the index into mats (material
        tokens) per quad; the same lists quad() would make."""
        q = len(mid)
        if not q:
            return
        i = self.n
        self.P += P
        self.UV += UV
        cols = [tuple(mt[1]) * 4 if mt is not None else None for mt in mats]
        for k in mid:
            self.C += cols[k]
        self.T += (np.arange(q, dtype=np.int64)[:, None] * 4 + np.array([0, 1, 2, 0, 2, 3], np.int64) + i).ravel().tolist()
        idx = [mt[0] if mt is not None else None for mt in mats]
        self.M += [idx[k] for k in mid for _ in (0, 1)]
        self.n += 4 * q

    def tri(self, a, b, c, uva, uvb, uvc, mat):
        i = self.n
        self.P += (*a, *b, *c)
        self.UV += (*uva, *uvb, *uvc)
        self.C += mat[1] * 3
        self.T += (i, i + 1, i + 2)
        self.M.append(mat[0])
        self.n += 3

    def poly(self, pts3, uv, mat):
        """A flat polygon facing up when counter-clockwise seen from above, down when clockwise (its underside:
        the ear clipping wants counter-clockwise rings and gave a clockwise one no triangles at all, so the
        parking decks' and floating parts' undersides were missing)."""
        xy = np.asarray(pts3)[:, :2]
        if _area2(xy) < 0:
            k = len(xy)
            tris = np.array([(k - 1 - c, k - 1 - b, k - 1 - a) for a, b, c in triangulate(xy[::-1])],
                            np.int64).reshape(-1, 3)
        else:
            tris = triangulate(xy)
        i = self.n
        self.P += np.asarray(pts3, np.float64)[:, :3].ravel().tolist()
        self.UV += np.asarray(uv, np.float64)[:, :2].ravel().tolist()
        self.C += tuple(mat[1]) * len(pts3)
        self.T += (np.asarray(tris, np.int64).reshape(-1, 3) + i).ravel().tolist()
        self.M += [mat[0]] * len(tris)
        self.n += len(pts3)

    def arrays(self):
        return (np.array(self.P, np.float64).reshape(-1, 3), np.array(self.UV, np.float64).reshape(-1, 2),
                np.array(self.T, np.int64).reshape(-1, 3), np.array(self.M, np.int64),
                np.array(self.C, np.uint8).reshape(-1, 4))


# A panel window cut from the plaster sheet (band 1, bay 0): u, v ranges (mesh V up).
WIN_UV = (53 / 1024, 154 / 1024, 1.0 - 467 / 1024, 1.0 - 274 / 1024)
WIN_W, WIN_H, WIN_SILL = 1.05, 1.75, 0.85   # m
WIN_OUT_M = 0.03            # m the window stands proud of its wall
_WALL_CONSTS = None


def _walls(m, spec, ring, z0, z_eave, mat_idx, lite=False):
    """Each wall of the ring, floor by floor: one band of the window sheet, a whole number of bays; a plain wall with
    sash windows laid over it for a plain tileable material (spec.wall; a big box's storefront band); a plain plinth
    under the floors on a slope; a shopfront ground floor; the good bays only where a band has some; the front door's
    bay as the band's plain strip, at the sheet's scale. The Rust loop (earthfast.building_walls: the quads the Python
    made, in its order and arithmetic)."""
    global _WALL_CONSTS
    if _WALL_CONSTS is None:
        _WALL_CONSTS = [float(v) for v in (SIDING_UV_M, TILE_PX_M, FOUNDATION_M, BANDS, BAND_SHOP[0], BAND_SHOP[1],
                                           DOOR_GAP_M, PLAIN_STRIP, GROUND_FLOOR_SHOP_M, WIN_OUT_M, HOUSE_BAY_M,
                                           *WIN_UV, WIN_W, WIN_H, WIN_SILL)]
    require_layout()
    band = spec.band or (0, 1)
    good = list(band[2]) if len(band) > 2 else []
    door = spec.door
    constants = _WALL_CONSTS.copy()
    constants[6] = pattern_for(spec).door_clearance_m
    constants.append(bay_width(spec))
    P, UV, mid = fast._ef.building_walls(
        np.ascontiguousarray(np.asarray(ring, np.float64)[:, :2]), float(z0), float(z_eave), bool(spec.wall),
        bool(spec.plain), int(band[0]), int(band[1]), [int(g) for g in good], int(spec.floors), float(spec.floor_h),
        bool(spec.shop), int(door[0]) if door else -1, float(door[1]) if door else 0.0, spec.roof == "flat",
        float(spec.seed) if isinstance(spec.seed, float) else 0.0, spec.windows is False,
        int(spec.front) if spec.front is not None else -1, bool(lite), constants)
    if mid:
        m.quads(P, UV, mid, [mat_idx[spec.facade], mat_idx[SHOP] if (spec.shop or spec.wall) else None,
                             mat_idx["bne_bld_fac_white"] if spec.wall else None])


PLAIN_STRIP = 0.3           # of a bay: the plain wall between two windows of a sheet's band (centred on a bay edge)


def _cornice(m, spec, ring, z_eave, mat_idx):
    """A box moulding round a flat roof's edge (row houses' cornices, parapets), the plain white plaster."""
    mat = mat_idx["bne_bld_fac_white"]
    o, z0, z1 = CORNICE_OUT_M, z_eave - CORNICE_DOWN_M, z_eave + CORNICE_UP_M
    uv = ((0.002, 0.995), (0.012, 0.995), (0.012, 0.999), (0.002, 0.999))
    n = len(ring)
    for i in range(n):
        a, b = ring[i], ring[(i + 1) % n]
        e = b - a
        L = float(math.hypot(*e))
        if L < 0.3:
            continue
        d = e / L
        nn = np.array([d[1], -d[0]])                  # outward (counter-clockwise ring)
        a2, b2 = a + nn * o - d * o, b + nn * o + d * o
        m.quad((a2[0], a2[1], z0), (b2[0], b2[1], z0), (b2[0], b2[1], z1), (a2[0], a2[1], z1), *uv, mat)
        m.quad((a[0], a[1], z1), (a2[0], a2[1], z1), (b2[0], b2[1], z1), (b[0], b[1], z1), *uv, mat)      # top
        m.quad((a[0], a[1], z0), (b[0], b[1], z0), (b2[0], b2[1], z0), (a2[0], a2[1], z0), *uv, mat)      # under
        # the lip's inner face, above the roof (seen from on the roof it was missing: the user's report)
        m.quad((b[0], b[1], z_eave), (a[0], a[1], z_eave), (a[0], a[1], z1), (b[0], b[1], z1), *uv, mat)


def _inside(ring, p):
    """Point p inside the ring (even-odd)."""
    x, y = p
    return fast._ef.point_inside(np.asarray(ring, np.float64), float(x), float(y))     # (Rust; even-odd)


def _box(m, c, u, hx, hy, z0, z1, mat):
    """An axis-u box (half sizes hx along u, hy across) from z0 to z1: four sides and a top."""
    v = np.array([-u[1], u[0]])
    k = [c + u * sx * hx + v * sy * hy for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    uv = ((0.002, 0.995), (0.012, 0.995), (0.012, 0.999), (0.002, 0.999))
    for i in range(4):
        a, b = k[i], k[(i + 1) % 4]
        m.quad((a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], z1), (a[0], a[1], z1), *uv, mat)
    m.quad(*[(p[0], p[1], z1) for p in k], *uv, mat)


def _letters_look(tint):
    """The lettering's look on a sign of tint (rgb 0..1): dark on a light one, light on a dark one. Pure."""
    return f"letters|{1 if 0.299 * tint[0] + 0.587 * tint[1] + 0.114 * tint[2] > 0.5 else 0}"


def _lettering(m, text, c, d, out, z_mid, cap, max_w, mat):
    """text (sign_text) in the guide signs' glyphs on a face looking out (its reading direction d), centred on c (2D)
    and z_mid, the capitals cap high, squeezed to max_w; a hair in front of the face. Returns the width drawn."""
    import exitsigns
    data = exitsigns.lettering()
    glyphs = data["glyphs"]
    scale = cap / data["capHeight"]
    width = sum(glyphs[ch]["advance"] for ch in text) * scale
    if width > max_w:
        scale *= max_w / width
        width = max_w
    base = z_mid - data["capHeight"] * scale / 2
    cur = np.asarray(c, np.float64) + out * 0.02 - d * (width / 2)
    for ch in text:
        g = glyphs[ch]
        l, t, r, b = g["bbox"]
        u0, v0, u1, v1 = g["uv"]
        if r > l and b > t:
            p0, p1 = cur + d * (l * scale), cur + d * (r * scale)
            zb, zt = base - b * scale, base - t * scale
            m.quad((p0[0], p0[1], zb), (p1[0], p1[1], zb), (p1[0], p1[1], zt), (p0[0], p0[1], zt),
                   (u0, v0), (u1, v0), (u1, v1), (u0, v1), mat)
        cur = cur + d * (g["advance"] * scale)
    return width


def _signs(m, spec, ring, z_top, mat_idx, floor=None, z_eave=None, names=None, edge=None, top=False):
    """The sign band over a shop's street wall (edge, else spec.sign), shop by shop, a few without one; the names
    (names, else spec.names) on the first bands, one each. A hall with a name, or top (an office building's name with
    no door to put it at): one panel in the middle instead, its name in letters up to HALL_CAP_M, between
    HALL_CLEAR_M over its floor and the eave (z_eave)."""
    m.mark("sign")
    edge = spec.sign if edge is None else edge
    a, b = ring[edge], ring[(edge + 1) % len(ring)]
    L = float(math.hypot(*(b - a)))
    if L < 3.0:
        return
    d = (b - a) / L
    out = np.array([d[1], -d[0]])
    names = list(spec.names or ()) if names is None else list(names)
    if names and (spec.windows is False or top):
        tint = SIGN_TINTS[int(_hash01(spec.seed, "signc", 0) * len(SIGN_TINTS))]
        z1 = (z_eave if z_eave is not None else z_top) - 0.3
        z0 = max(z1 - HALL_CAP_M / SIGN_CAP, (floor if floor is not None else z1 - spec.height) + HALL_CLEAR_M)
        if z1 - z0 < SIGN_H:                            # (a low hall: the band's place)
            z0, z1 = z_top - 0.15 - SIGN_H, z_top - 0.15
        cap = (z1 - z0) * SIGN_CAP
        c = a + d * (L / 2) + out * (SIGN_OUT / 2)
        tmp = Mesh()                                    # (the name's width first: the panel fits round it)
        w = _lettering(tmp, names[0], c, d, out * 0, (z0 + z1) / 2, cap, L * HALL_CAP_SHARE, mat_idx["letters|0"])
        hw = w / 2 + max(SIGN_MARGIN_M, cap * 0.6)
        _box(m, c, d, hw, SIGN_OUT / 2, z0, z1, mat_idx[f"sign|{SIGN_TINTS.index(tint)}"])
        _lettering(m, names[0], c + out * (SIGN_OUT / 2), d, out, (z0 + z1) / 2, cap, L * HALL_CAP_SHARE,
                   mat_idx[_letters_look(tint)])
        return
    t, k, n = 0.3, 0, 0
    while t < L - 1.5:
        w = SIGN_SHOP_M[0] + (SIGN_SHOP_M[1] - SIGN_SHOP_M[0]) * _hash01(spec.seed, "signw", k)
        t1 = min(L - 0.3, t + w)
        if L - 0.3 - t1 < 2.5:                         # no sliver of a shop at the end
            t1 = L - 0.3
        if n < len(names) or _hash01(spec.seed, "signon", k) < 0.85:
            c = a + d * ((t + t1) / 2) + out * (SIGN_OUT / 2)
            ci = int(_hash01(spec.seed, 'signc', k) * len(SIGN_TINTS))
            z0, z1 = z_top - 0.15 - SIGN_H, z_top - 0.15
            m.mark("sign")
            _box(m, c, d, (t1 - t) / 2 - 0.15, SIGN_OUT / 2, z0, z1, mat_idx[f"sign|{ci}"])
            if n < len(names):
                _lettering(m, names[n], c + out * (SIGN_OUT / 2), d, out, (z0 + z1) / 2, SIGN_H * SIGN_CAP,
                           (t1 - t) - 0.3 - 2 * SIGN_MARGIN_M, mat_idx[_letters_look(SIGN_TINTS[ci])])
                n += 1
        t, k = t1, k + 1


def _plates(m, spec, ring, base, z_eave, mat_idx, bands=False):
    """spec.plates (signs_for) on the street wall (spec.plate, else the shop band's spec.sign): the name panel over
    the entrance (the door, else the wall's middle), between the ground floor's windows and the next floor's (a
    one-storey building's: under its eave); the office plates stacked beside the door (no door and four floors or
    more: the first name at the top, an office building's lettering; else at the wall's middle); a hotel's blade over
    the ground floor and a pharmacy's symbol at the wall's corners, the one away from the door first. bands: the
    names are on the shop bands (no panel, no plates). base: the floor's height."""
    edge = spec.plate if spec.plate is not None else spec.sign
    a, b = ring[edge], ring[(edge + 1) % len(ring)]
    L = float(math.hypot(*(b - a)))
    if L < 3.0:
        return
    d = (b - a) / L
    out = np.array([d[1], -d[0]])
    door = spec.door[1] if spec.door is not None and spec.door[0] == edge else None
    gf = GROUND_FLOOR_SHOP_M if spec.shop and spec.floors > 1 else spec.floor_h     # the ground floor's top over base
    first = (SYMBOL_IN_M if door > L / 2 else L - SYMBOL_IN_M) if door is not None else \
        (SYMBOL_IN_M if _hash01(spec.seed, "corner") < 0.5 else L - SYMBOL_IN_M)
    corners = [first, L - first]
    plates = []
    for shape, text, tint in spec.plates:
        m.mark("sign")
        if shape == "panel" and not bands:
            if spec.floors > 1:
                z_mid = base + (WIN_SILL + WIN_H + gf + WIN_SILL) / 2
                z0, z1 = z_mid - PANEL_H / 2, min(z_mid + PANEL_H / 2, z_eave - 0.15)
            else:
                z1 = z_eave - 0.15
                z0 = max(z1 - PANEL_H, base + 2.2)          # (over the door)
            if z1 - z0 < 0.35:
                continue
            cap = (z1 - z0) * PANEL_CAP
            w = _lettering(Mesh(), text, a, d, out, (z0 + z1) / 2, cap, L * 0.8 - 2 * SIGN_MARGIN_M,
                           mat_idx["letters|0"])            # (the width first: the panel fits round it)
            hw = w / 2 + max(SIGN_MARGIN_M, cap * 0.6)
            along = min(max(door if door is not None else L / 2, hw + 0.2), L - hw - 0.2)
            c = a + d * along + out * (SIGN_OUT / 2)
            _box(m, c, d, hw, SIGN_OUT / 2, z0, z1, mat_idx[f"sign|{tint}"])
            _lettering(m, text, c + out * (SIGN_OUT / 2), d, out, (z0 + z1) / 2, cap, L * 0.8 - 2 * SIGN_MARGIN_M,
                       mat_idx[_letters_look(SIGN_TINTS[tint])])
        elif shape == "plate" and not bands:
            plates.append((text, tint))
        elif shape == "blade" and corners and spec.floors > 1:
            z0, z1 = base + gf + 0.3, z_eave - 0.3
            cap = min(BLADE_CAP_M, (z1 - z0 - 0.3) / (len(text) * 1.35))
            if cap < 0.2:
                continue
            z1 = z0 + len(text) * cap * 1.35 + 0.3
            c = a + d * corners.pop(0) + out * (BLADE_W / 2 + 0.05)
            _box(m, c, out, BLADE_W / 2, BLADE_T / 2, z0, z1, mat_idx[f"sign|{tint}"])
            for n in (d, -d):                       # both faces, read from either way along the street
                for i, ch in enumerate(text):
                    _lettering(m, ch, c + n * (BLADE_T / 2), np.array([-n[1], n[0]]), n,
                               z1 - 0.15 - cap * 1.35 * (i + 0.5), cap, BLADE_W - 0.2,
                               mat_idx[_letters_look(SIGN_TINTS[tint])])
        elif shape in ("cross", "a") and corners:
            s = SYMBOL_M
            zc = base + gf + 0.3 + s / 2 if spec.floors > 1 else z_eave - 0.2 - s / 2
            if zc - s / 2 < base + 2.2:
                continue
            c = a + d * corners.pop(0) + out * (s / 2 + 0.05)
            if shape == "cross":
                _box(m, c, out, s / 2, BLADE_T / 2, zc - s / 6, zc + s / 6, mat_idx[GREEN_CROSS])
                _box(m, c, out, s / 6, BLADE_T / 2, zc - s / 2, zc + s / 2, mat_idx[GREEN_CROSS])
            else:
                _box(m, c, out, s / 2, BLADE_T / 2, zc - s / 2, zc + s / 2, mat_idx[f"sign|{tint}"])
                for n in (d, -d):
                    _lettering(m, text, c + n * (BLADE_T / 2), np.array([-n[1], n[0]]), n, zc, s * 0.6, s * 0.8,
                               mat_idx[_letters_look(SIGN_TINTS[tint])])
    if not plates:
        return
    if door is None and spec.floors >= 4:
        _signs(m, spec, ring, z_eave, mat_idx, base, z_eave, names=[plates[0][0]], edge=edge, top=True)
        return
    along = L / 2
    if door is not None:
        along = door + DOOR_GAP_M + PLATE_W / 2 + 0.1
        if along + PLATE_W / 2 > L - 0.2:           # (no room after the door: before it)
            along = door - DOOR_GAP_M - PLATE_W / 2 - 0.1
    along = min(max(along, PLATE_W / 2 + 0.2), L - PLATE_W / 2 - 0.2)
    c = a + d * along + out * 0.015
    for i, (text, tint) in enumerate(plates):
        m.mark("sign")
        z1 = base + PLATE_TOP_M - i * (PLATE_H + 0.06)
        _box(m, c, d, PLATE_W / 2, 0.015, z1 - PLATE_H, z1, mat_idx[f"sign|{tint}"])
        _lettering(m, text, c + out * 0.015, d, out, z1 - PLATE_H / 2, PLATE_H * 0.4, PLATE_W - 0.1,
                   mat_idx[_letters_look(SIGN_TINTS[tint])])


PORCH_DEPTH_M = 2.2
PORCH_H_M = 2.7             # the porch roof's underside above the floor
PORCH_DECK_M = 0.35         # the deck's top above the ground
PORTAL_NEAR_M = 25.0        # m round a building where the road at a tunnel's mouth is looked for


def _portal_lift(frame, ring, x0, y0, tunnels_xy, elev):
    """How far (m) over its lowest ground a building over a tunnel stands: to OVER_TUNNEL_CLEAR_M over the lowest ground
    along the tunnel lines within PORTAL_NEAR_M of it (the road at the mouth), 0 when its ground is that high."""
    lo = ring.min(0) - PORTAL_NEAR_M
    hi = ring.max(0) + PORTAL_NEAR_M
    pts = []
    for line in tunnels_xy:
        ln = np.asarray(line, np.float64)
        if len(ln) < 2:
            continue
        seg = np.hypot(*np.diff(ln, axis=0).T)
        s = np.concatenate(([0.0], np.cumsum(seg)))
        t = np.arange(0.0, s[-1] + 1e-9, 2.0)
        p = np.stack([np.interp(t, s, ln[:, 0]), np.interp(t, s, ln[:, 1])], axis=1)
        p = p[(p[:, 0] >= lo[0]) & (p[:, 0] <= hi[0]) & (p[:, 1] >= lo[1]) & (p[:, 1] <= hi[1])]
        if len(p):
            pts.append(p)
    if not pts:
        return 0.0
    q = np.concatenate(pts + [ring])
    la, lo_, _ = frame.enu_to_geodetic(q[:, 0] + x0, q[:, 1] + y0, np.zeros(len(q)))
    z = np.asarray(elev(la, lo_), np.float64)
    nr = len(ring)
    road, ground = z[:-nr], z[-nr:]
    if not len(road) or not np.isfinite(road).any() or not np.isfinite(ground).any():
        return 0.0
    return max(0.0, float(np.nanmin(road)) + OVER_TUNNEL_CLEAR_M - float(np.nanmin(ground)))


def base_z(spec, gmin, gmax):
    """The ground a building's floors stand on: the footprint's highest, but the lowest for one over a tunnel's portal
    (the road at its mouth: from the hill over it, Wabash's portal house floated ~10 m over the portal and
    Eisenhower's portal building over its frames)."""
    return gmin if spec.portal else gmax


def drawn_ring(spec):
    """The footprint its walls are drawn on: a pitched roof's house is its oriented box (build); its door, steps and
    porch go on these walls (on the map's outline they stood off a box wall at an angle, or inside it, only the
    door's frame showing: Stelvio pass)."""
    ring = spec.ring
    if spec.roof != "flat":
        c, u, hl, hw = oriented_box(ring)
        v = np.array([-u[1], u[0]])
        ring = np.array([c - u * hl - v * hw, c + u * hl - v * hw, c + u * hl + v * hw, c - u * hl + v * hw])
    return ring


def ground_rings(items, x0, y0, classes=False):
    """The buildings of items (road_tile_items': rings tile-local, the tile's corner x0, y0) as drawn (drawn_ring) in
    the anchor frame, those standing on the ground only (one lifted over a street leaves room under it): what parked
    cars and tree trunks keep out of. classes: (ring, the building's class or use) pairs. Pure."""
    got = [(drawn_ring(spec) + np.array([x0, y0]), spec.cls or "") for spec, *_ in (items or ())
           if (spec.min_h or 0.0) <= 0.5]
    return got if classes else [r for r, _ in got]


def _porch(m, spec, base, mat_idx):
    """A front porch on the front door's wall (spec.door: (edge, distance along it) of spec.ring): a deck, three
    posts and a shallow roof, the house's trim white and its roof's colour."""
    edge, sd = spec.door
    base = door_ground(spec, edge, sd, base)
    ring = drawn_ring(spec)
    a, b = ring[edge], ring[(edge + 1) % len(ring)]
    L = float(math.hypot(*(b - a)))
    if L < 4.0:
        return
    d = (b - a) / L
    out = np.array([d[1], -d[0]])
    w = min(L * 0.75, 7.5)
    c0 = float(np.clip(sd, w / 2, L - w / 2))
    c = a + d * c0
    white = mat_idx["bne_bld_fac_white"]
    D = PORCH_DEPTH_M
    _box(m, c + out * (D / 2), d, w / 2, D / 2, base - 0.3, base + PORCH_DECK_M, white)              # deck
    top = base + PORCH_DECK_M + PORCH_H_M
    for t in (-w / 2 + 0.15, 0.0, w / 2 - 0.15):                                                   # posts
        _box(m, c + d * t + out * (D - 0.15), d, 0.08, 0.08, base + PORCH_DECK_M, top, white)
    roof = mat_idx[spec.roof_mat] if spec.roof_mat else white
    _box(m, c + out * (D / 2 + 0.1), d, w / 2 + 0.15, D / 2 + 0.1, top, top + 0.18, roof)          # roof


def door_ground(spec, edge, along, gmax):
    """Estimate ground at a drawn wall's entrance from the nearest mapped edge's corner heights; gmax if absent.
    Pure. Pitched roofs use an oriented box whose edge numbers need not match the mapped footprint."""
    g = getattr(spec, "gring", None)
    ring = spec.ring
    if g is None or len(g) != len(ring):
        return gmax
    drawn = drawn_ring(spec)
    a, b = drawn[edge], drawn[(edge + 1) % len(drawn)]
    L = float(math.hypot(*(b - a)))
    t = 0.0 if L < 1e-6 else min(max(along / L, 0.0), 1.0)
    p = a + t * (b - a)
    delta = np.roll(ring, -1, axis=0) - ring
    fractions = np.clip(((p - ring) * delta).sum(1) / np.maximum((delta * delta).sum(1), 1e-12), 0., 1.)
    nearest = ring + fractions[:, None] * delta
    k = int(((nearest - p) ** 2).sum(1).argmin())
    return float(g[k] + fractions[k] * (g[(k + 1) % len(ring)] - g[k]))


def _stoop(m, spec, ring, gmin, base, mat_idx):
    """Marble steps up to the front door (spec.stoop: (edge, distance along it); base: the ground there, the door
    STOOP_H over it): STOOP_STEPS treads to a landing, each block down under the footprint's lowest ground (they floated where the street falls away, Fells Point)."""
    edge, sd = spec.stoop
    a, b = ring[edge], ring[(edge + 1) % len(ring)]
    L = float(math.hypot(*(b - a)))
    if L < 1e-6:
        return
    d = (b - a) / L
    out = np.array([d[1], -d[0]])
    c = a + d * sd
    mat = mat_idx[MARBLE_LOOK]
    base = door_ground(spec, edge, sd, base)     # (the ground at the door)
    top = base + STOOP_H
    z0 = min(gmin, base) - 0.3
    # as many steps as it takes down to the street (the footprint's lowest ground): from the highest one only the
    # bottom step stood a metre over the sidewalk on a white block (Bradford Street, Mapillary)
    n = int(np.clip(round((top - min(gmin, base)) / STOOP_RISE), STOOP_STEPS - 1, STOOP_MAX_STEPS))
    rise = min((top - min(gmin, base)) / n, STOOP_RISE_MAX)    # (n risers: the landing's and n - 1 steps' fronts;
                                                                # higher, the bottom step on a plinth)
    for k in range(n):
        depth = STOOP_LANDING + k * STOOP_TREAD
        zt = top - k * rise
        _box_tiled(m, c + out * depth / 2, d, STOOP_W / 2, depth / 2, z0, zt, mat)


MARBLE_LOOK = "bne_marble"


def _box_tiled(m, c, u, hx, hy, z0, z1, mat, tile=1.0):
    """_box with the material tiled at `tile` m per repeat (a stone texture, not the facade sheets' colour patches)."""
    v = np.array([-u[1], u[0]])
    k = [c + u * sx * hx + v * sy * hy for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    for i in range(4):
        p, q = k[i], k[(i + 1) % 4]
        w = float(math.hypot(*(q - p))) / tile
        hz0, hz1 = z0 / tile, z1 / tile
        m.quad((p[0], p[1], z0), (q[0], q[1], z0), (q[0], q[1], z1), (p[0], p[1], z1),
               (0.0, hz0), (w, hz0), (w, hz1), (0.0, hz1), mat)
    m.quad(*[(p[0], p[1], z1) for p in k], *[(p[0] / tile, p[1] / tile) for p in k], mat)


def _steeple(m, spec, z_eave, mat_idx):
    """A church's square tower with a pyramid spire, at one end of its nave (hashed)."""
    c, u, hl, hw = oriented_box(spec.ring)
    if _hash01(spec.seed, "steeple") < 0.5:
        u = -u
    side = float(np.clip(1.1 * hw, 3.0, 6.0)) / 2
    p = c + u * (hl - side)
    for k in range(1, 12):              # on the footprint (an irregular one's box end can be outside it)
        if _inside(spec.ring, p):
            break
        p = c + u * (hl - side) * (1 - k / 12)
    rise = (min(hw, 12.0) + EAVE_M) * math.tan(math.radians(spec.pitch or PITCH["gabled"]))
    top = z_eave + rise + 6.0
    _box(m, p, u, side, side, z_eave - 1.0, top, mat_idx[spec.facade])
    v = np.array([-u[1], u[0]])
    k = [p + u * sx * side + v * sy * side for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    apex = (float(p[0]), float(p[1]), top + 2.6 * side * 2)
    rm = mat_idx[f"{ROOF_SLATE}|3"]
    for i in range(4):
        a, b = k[i], k[(i + 1) % 4]
        m.tri((a[0], a[1], top), (b[0], b[1], top), apex, (0, 0), (1, 0), (0.5, 2.0), rm)


def _merlons(m, ring, z, mat, seed, ragged=False):
    """Merlons along the counter-clockwise ring's edges, on the wall's top at z (MERLON); ragged: a ruin's broken top,
    hashed heights and gaps."""
    ln, gap, hi, thick = MERLON
    n = len(ring)
    for i in range(n):
        a, b = ring[i], ring[(i + 1) % n]
        L = float(math.hypot(*(b - a)))
        if L < ln + gap:
            continue
        d = (b - a) / L
        inward = np.array([-d[1], d[0]])
        k = int(L // (ln + gap))
        for j in range(k):
            h = hi
            if ragged:
                if _hash01(seed, "gap", i, j) < 0.25:
                    continue
                h = 0.3 + 2.2 * _hash01(seed, "rag", i, j)
            c = a + d * ((j + 0.5) * L / k) + inward * (thick / 2)
            _box(m, c, d, ln / 2, thick / 2, z - 0.05, z + h, mat)


def _keep(m, spec, z_eave, mat_idx):
    """A castle's square corner tower (KEEP_SIDE) over its building at one corner (hashed): merlons on top, or a
    spire."""
    c, u, hl, hw = oriented_box(spec.ring)
    v = np.array([-u[1], u[0]])
    side = float(np.clip(0.5 * hw, *KEEP_SIDE))
    sx = 1.0 if _hash01(spec.seed, "keep x") < 0.5 else -1.0
    sy = 1.0 if _hash01(spec.seed, "keep y") < 0.5 else -1.0
    p = c + u * sx * max(0.0, hl - side) + v * sy * max(0.0, hw - side)
    for k in range(1, 12):              # on the footprint (an irregular one's box corner can be outside it)
        if _inside(spec.ring, p):
            break
        p = c + (u * sx * max(0.0, hl - side) + v * sy * max(0.0, hw - side)) * (1 - k / 12)
    rise = 0.0 if spec.roof == "flat" else (min(hw, 12.0) + EAVE_M) * math.tan(math.radians(spec.pitch or
                                                                                          PITCH["gabled"]))
    top = z_eave + rise + 4.0 + 4.0 * _hash01(spec.seed, "keep h")
    _box(m, p, u, side, side, z_eave - 1.0, top, mat_idx[spec.facade])
    k = [p + u * a * side + v * b * side for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    if _hash01(spec.seed, "keep roof") < 0.5:
        _merlons(m, np.array(k), top, mat_idx[spec.facade], spec.seed)
    else:
        apex = (float(p[0]), float(p[1]), top + 2.2 * side)
        rm = mat_idx[f"{ROOF_SLATE}|3"]
        for i in range(4):
            a, b = k[i], k[(i + 1) % 4]
            m.tri((a[0], a[1], top), (b[0], b[1], top), apex, (0, 0), (1, 0), (0.5, 2.0), rm)


ROOF_CLUTTER_M2 = 250.0     # flat roofs this large get boxes: air-conditioning units, stair bulkheads
ROOF_UNIT_CLEAR_M = .5     # Visual maintenance gap from parapets and neighbouring units; not a building-code rule.


def _roof_unit_fits(ring, centre, u, hx, hy):
    """Whether the whole unit and its margin lie within the simple roof ring, including concave edges. Pure."""
    axes = np.column_stack((u, [-u[1], u[0]]))
    half = np.array([hx, hy]) + ROOF_UNIT_CLEAR_M
    for signs in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        if not _inside(ring, centre + axes @ (half * signs)):
            return False
    # Corners alone miss a notch crossing the box. SAT against every boundary segment tests
    # the box axes and the segment's normal, also rejecting a notch ending inside the box.
    a = (ring - centre) @ axes
    b = np.roll(a, -1, axis=0)
    separated = np.any((np.minimum(a, b) > half) | (np.maximum(a, b) < -half), axis=1)
    delta = b - a
    normal = np.column_stack((-delta[:, 1], delta[:, 0]))
    crosses = np.abs(np.sum(normal * a, axis=1)) <= np.abs(normal) @ half
    return not np.any(~separated & crosses)


def _roof_unit(m, p, u, hx, hy, bottom, height, mat):
    """Emit four vent-panel sides and a plain metal lid from the shared equipment atlas."""
    v = np.array([-u[1], u[0]])
    corners = [p + u * sx * hx + v * sy * hy for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    top = bottom + height
    for a, b in zip(corners, corners[1:] + corners[:1]):
        m.quad((*a, bottom), (*b, bottom), (*b, top), (*a, top),
               (.02, .52), (.98, .52), (.98, .98), (.02, .98), mat)
    m.quad(*[(*c, top) for c in corners], (.02, .02), (.98, .02), (.98, .48), (.02, .48), mat)


def _clutter(m, spec, ring, z_eave, mat_idx):
    """Add deterministic equipment only where its complete footprint fits on the flat roof."""
    area = _area2(ring) / 2
    if spec.roof != "flat" or spec.plain or area < ROOF_CLUTTER_M2 or spec.cls in CHURCH_CLASSES:
        return
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    n = min(6, 1 + int(area / 600.0))
    mat = mat_idx[f"{SURFACE_MATERIALS['hvu']}|0"]
    placed = []
    for k in range(n):
        s = (_hash01(spec.seed, "cx", k) * 2 - 1) * (hl - 3.0)
        t = (_hash01(spec.seed, "cy", k) * 2 - 1) * (hw - 3.0)
        p = c + u * s + v * t
        big = _hash01(spec.seed, "cb", k) < 0.25
        hx, hy, h = (2.0, 1.6, 2.6) if big else (1.1, 0.7, 1.1)
        if not _roof_unit_fits(ring, p, u, hx, hy):
            continue
        if any(abs((p - q) @ u) < hx + qx + ROOF_UNIT_CLEAR_M and
               abs((p - q) @ v) < hy + qy + ROOF_UNIT_CLEAR_M for q, qx, qy in placed):
            continue
        _roof_unit(m, p, u, hx, hy, z_eave, h, mat)
        placed.append((p, hx, hy))


def _clip_roof(points, ring):
    """Clip a planar roof polygon to the wall box plus eaves, preserving Z. Pure."""
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    polygon = [np.asarray(p, float) for p in points]
    for axis, bound in ((u, hl + EAVE_M), (-u, hl + EAVE_M), (v, hw + EAVE_M), (-v, hw + EAVE_M)):
        clipped = []
        for a, b in zip(polygon, polygon[1:] + polygon[:1]):
            da, db = float((a[:2] - c) @ axis - bound), float((b[:2] - c) @ axis - bound)
            if da <= 1e-9:
                clipped.append(a)
            if (da < -1e-9 and db > 1e-9) or (db < -1e-9 and da > 1e-9):
                clipped.append(a + (b - a) * da / (da - db))
        polygon = clipped
        if not polygon:
            break
    return polygon


ATTIC_WINDOW_M = .8         # Small square openings; larger inhabited floors need a different facade pattern.
ATTIC_SILL_M = .6           # Above the attic floor datum, not above terrain; this is an optional visual assumption.
ATTIC_CLEAR_M = .25         # Masonry between frame and roof/corner; omit openings in narrower wall caps.


def _attic_windows(m, spec, ring, z_eave, planes, mat_idx):
    """Add optional small windows on regular facade axes, fully below every roof plane."""
    if not pattern_for(spec).attic_windows or spec.windows is False or spec.plain:
        return
    require_layout()
    bottom, top = z_eave + ATTIC_SILL_M, z_eave + ATTIC_SILL_M + ATTIC_WINDOW_M
    half = ATTIC_WINDOW_M / 2
    u0, u1, v0, v1 = WIN_UV
    for edge, (a, b) in enumerate(zip(ring, np.roll(ring, -1, axis=0))):
        length = float(np.linalg.norm(b - a))
        if length < ATTIC_WINDOW_M + 2 * ATTIC_CLEAR_M:
            continue
        count, _ = fast._ef.facade_layout(length, bay_width(spec), bool(spec.wall))
        d = (b - a) / length
        out = np.array([d[1], -d[0]]) * WIN_OUT_M
        for i in range(count):
            along = length * (i + .5) / count
            if min(along, length - along) < half + ATTIC_CLEAR_M:
                continue
            left, right = a + d * (along - half) + out, a + d * (along + half) + out
            if min(float(p @ n + h) for p in (left, right) for n, h in planes) < top + ATTIC_CLEAR_M:
                continue
            # Same panel-bay choice as Rust's ordinary windows; the attic follows the last regular storey.
            shift = int(_hash01(float(spec.seed), edge, int(spec.floors), i) * 4) / 4
            m.quad((*left, bottom), (*right, bottom), (*right, top), (*left, top),
                   (u0 + shift, v0), (u1 + shift, v0), (u1 + shift, v1), (u0 + shift, v1),
                   mat_idx["bne_bld_fac_white"])


def _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx, span=None):
    """Close wall tops beneath the roof planes, including oblique ridges on an unchanged footprint."""
    mat = mat_idx[spec.facade]
    uv = ((4 / 1024, .995), (12 / 1024, .995), (12 / 1024, .999), (4 / 1024, .999))
    for a, b in zip(ring, np.roll(ring, -1, axis=0)):
        if span is not None:
            axis, low, high = span
            start, delta = float(a @ axis), float((b - a) @ axis)
            if abs(delta) < 1e-9:
                if not low <= start <= high:
                    continue
            else:
                t0, t1 = sorted(((low - start) / delta, (high - start) / delta))
                t0, t1 = max(0., t0), min(1., t1)
                if t1 - t0 < 1e-9:
                    continue
                a, b = a + (b - a) * t0, a + (b - a) * t1
        ha = np.array([float(a @ n + h) for n, h in planes])
        hb = np.array([float(b @ n + h) for n, h in planes])
        cuts = [0., 1.]
        for i in range(len(ha)):
            for j in range(i):
                slope = (hb[i] - ha[i]) - (hb[j] - ha[j])
                if abs(slope) > 1e-9:
                    t = (ha[j] - ha[i]) / slope
                    if 0 < t < 1:
                        cuts.append(float(t))
        cuts = sorted(set(cuts))
        for t0, t1 in zip(cuts, cuts[1:]):
            if t1 - t0 < 1e-9:
                continue
            p, q = a + (b - a) * t0, a + (b - a) * t1
            hp, hq = max(z_eave, float(np.min(ha + (hb - ha) * t0))), max(z_eave, float(np.min(ha + (hb - ha) * t1)))
            if max(hp, hq) <= z_eave + 1e-7:
                continue
            # Each nonzero half is a triangle; zero-height tips must not emit degenerate faces.
            if hq > z_eave + 1e-7:
                m.tri((*p, z_eave), (*q, z_eave), (*q, hq), uv[0], uv[1], uv[2], mat)
            if hp > z_eave + 1e-7:
                m.tri((*p, z_eave), (*q, hq), (*p, hp), uv[0], uv[2], uv[3], mat)
    _attic_windows(m, spec, ring, z_eave, planes, mat_idx)


def _skillion_roof(m, spec, ring, z_eave, mat_idx):
    """One sloped quad and its wall caps, with the full mapped rise between the outer roof edges."""
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    down, span = skillion_axis(ring, spec.roof_direction, spec.roof_orientation)
    height = spec.roof_height if spec.roof_height is not None else span * math.tan(math.radians(roof_pitch(spec)))
    xy = np.array([c + u * s * (hl + EAVE_M) + v * t * (hw + EAVE_M)
                   for s, t in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
    along = xy @ down
    slope = height / float(np.ptp(along))
    normal = -down * slope
    intercept = z_eave + height + float(along.min()) * slope
    points = [(*p, float(p @ normal + intercept)) for p in xy]
    uv = [(float((p - c) @ u) * math.hypot(1., float(normal @ u)) / ROOF_UV_M,
           float((p - c) @ v) * math.hypot(1., float(normal @ v)) / ROOF_UV_M) for p in xy]
    m.quad(*points, *uv, mat_idx[spec.roof_mat])
    _roof_wall_caps(m, spec, ring, z_eave, [(normal, intercept)], mat_idx)


def _pyramidal_roof(m, spec, ring, z_eave, mat_idx):
    """Four roof triangles meeting above the box centre, with wall caps under the eaves."""
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    height = spec.roof_height if spec.roof_height is not None else hw * math.tan(math.radians(roof_pitch(spec)))
    corners = np.array([c + u * s * (hl + EAVE_M) + v * t * (hw + EAVE_M)
                        for s, t in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
    apex, planes = (*c, z_eave + height), []
    for a, b in zip(corners, np.roll(corners, -1, axis=0)):
        width = float(np.linalg.norm(b - a))
        inward = c - (a + b) / 2
        run = float(np.linalg.norm(inward))
        slope_length = math.hypot(run, height)
        m.tri((*a, z_eave), (*b, z_eave), apex,
              (0., 0.), (width / ROOF_UV_M, 0.), (width / (2 * ROOF_UV_M), slope_length / ROOF_UV_M),
              mat_idx[spec.roof_mat])
        normal = inward * (height / (run * run))
        planes.append((normal, z_eave - float(a @ normal)))
    _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx)


def _broken_roof(m, spec, ring, z_eave, mat_idx):
    """Two pitches per side: hipped mansard or full gabled gambrel, clipped to the wall footprint."""
    c, u, hl, hw = roof_box(ring, spec.roof_direction, spec.roof_orientation)
    v = np.array([-u[1], u[0]])
    height = spec.roof_height if spec.roof_height is not None else hw * math.tan(math.radians(roof_pitch(spec)))
    hl, hw = hl + EAVE_M, hw + EAVE_M
    # Without mapped break dimensions, place most rise in a narrow lower slope, leaving a shallow upper roof.
    # These proportions are an appearance default, not a reconstruction of individual mansard floors.
    inset, zbreak = min(hl, hw) * .25, z_eave + height * .65
    gambrel = spec.roof == "gambrel"
    il, iw, top = hl if gambrel else hl - inset, hw - inset, z_eave + height
    planes = []

    def at(s, t, z):
        return np.array([*(c + u * s + v * t), z])

    def face(points):
        points = [p for i, p in enumerate(points) if np.linalg.norm(p - points[i - 1]) > 1e-9]
        normal = np.cross(points[1] - points[0], points[2] - points[0])
        gradient = -normal[:2] / normal[2]
        planes.append((gradient, float(points[0][2] - points[0][:2] @ gradient)))
        edge = points[1] - points[0]
        edge /= np.linalg.norm(edge)
        across = np.cross(normal / np.linalg.norm(normal), edge)
        origin = points[0]
        clipped = _clip_roof(points, ring)
        clipped = [p for i, p in enumerate(clipped) if np.linalg.norm(p - clipped[i - 1]) > 1e-9]
        if len(clipped) < 3:
            return
        uv = [(float((p - origin) @ edge) / ROOF_UV_M, float((p - origin) @ across) / ROOF_UV_M)
              for p in clipped]
        m.poly(clipped, uv, mat_idx[spec.roof_mat])

    signs = ((-1, -1), (1, -1), (1, 1), (-1, 1))
    outer = [at(s * hl, t * hw, z_eave) for s, t in signs]
    inner = [at(s * il, t * iw, zbreak) for s, t in signs]
    for i in ((0, 2) if gambrel else range(4)):
        j = (i + 1) % 4
        face([outer[i], outer[j], inner[j], inner[i]])
    ridge = il if gambrel else max(il - iw, 0.)
    face([inner[0], inner[1], at(ridge, 0, top), at(-ridge, 0, top)])
    face([inner[2], inner[3], at(-ridge, 0, top), at(ridge, 0, top)])
    if not gambrel:
        face([inner[1], inner[2], at(ridge, 0, top)])
        face([inner[3], inner[0], at(-ridge, 0, top)])
    _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx)


DOME_SIDES, DOME_BANDS = 16, 6  # Bounded silhouette detail: 176 curved triangles plus 32 corner-apron triangles.
# Height/radius fractions: a supported narrow base, widening bulb, then a concave neck and pointed tip.
# This is an appearance profile without mapped bulb/neck dimensions; the maximum radius stays over the wall box.
ONION_PROFILE = ((0., .65), (.12, .9), (.28, 1.), (.45, .85), (.62, .55), (.78, .26), (.9, .1), (1., 0.))
# Truncated spherical profile from -60 to +90 degrees: a narrow support below the equator and a rounded crown.
# Ten 15-degree intervals bound cost; horizontal/vertical scaling follows the footprint and mapped roof height.
SPHERICAL_PROFILE = tuple(((math.sin(phi) + math.sqrt(3.) / 2) / (1 + math.sqrt(3.) / 2), math.cos(phi))
                         for phi in np.linspace(-math.pi / 3, math.pi / 2, 11))


def _radial_roof(m, spec, ring, z_eave, mat_idx):
    """Dome, onion or spherical profile on a closed rectangular apron, with an explicit crown fan."""
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    height = spec.roof_height if spec.roof_height is not None else hw * math.tan(math.radians(roof_pitch(spec)))
    angles = np.linspace(0., 2 * math.pi, DOME_SIDES + 1)
    ca, sa = np.cos(angles), np.sin(angles)
    offsets = ca[:, None] * u * hl + sa[:, None] * v * hw
    if spec.roof == "onion":
        profile = ONION_PROFILE
    elif spec.roof == "spherical":
        profile = SPHERICAL_PROFILE
    else:
        profile = tuple((math.sin(i * math.pi / (2 * DOME_BANDS)), math.cos(i * math.pi / (2 * DOME_BANDS)))
                        for i in range(DOME_BANDS + 1))
    outer = c + (ca[:, None] * u * (hl + EAVE_M) + sa[:, None] * v * (hw + EAVE_M)) / \
        np.maximum(np.abs(ca), np.abs(sa))[:, None]
    base = c + offsets * profile[0][1]
    mat = mat_idx[spec.roof_mat]
    for i in range(DOME_SIDES):
        xy = [outer[i], outer[i + 1], base[i + 1], base[i]]
        m.quad(*[(*p, z_eave) for p in xy], *[(float(p @ u) / ROOF_UV_M, float(p @ v) / ROOF_UV_M) for p in xy], mat)
    along = np.r_[0., np.cumsum(np.linalg.norm(np.diff(base, axis=0), axis=1))] / ROOF_UV_M
    radius = np.linalg.norm(offsets, axis=1)
    previous, previous_scale, previous_z = np.c_[base, np.full(len(base), z_eave)], profile[0][1], z_eave
    distance = np.zeros(len(base))
    for band, (fraction, scale) in enumerate(profile[1:], 1):
        z = z_eave + height * fraction
        current = np.c_[c + offsets * scale, np.full(len(base), z)]
        next_distance = distance + np.hypot((previous_scale - scale) * radius, z - previous_z) / ROOF_UV_M
        for i in range(DOME_SIDES):
            a, b = (along[i], distance[i]), (along[i + 1], distance[i + 1])
            if band == len(profile) - 1:
                m.tri(previous[i], previous[i + 1], (*c, z_eave + height), a, b,
                      ((along[i] + along[i + 1]) / 2, (next_distance[i] + next_distance[i + 1]) / 2), mat)
            else:
                m.quad(previous[i], previous[i + 1], current[i + 1], current[i], a, b,
                       (along[i + 1], next_distance[i + 1]), (along[i], next_distance[i]), mat)
        previous, previous_scale, previous_z, distance = current, scale, z, next_distance


def _sawtooth_roof(m, spec, ring, z_eave, mat_idx):
    """Repeated asymmetric roof bays, with each exterior wall capped only under its own bay."""
    c, u, hl, hw = roof_box(ring, spec.roof_direction, spec.roof_orientation)
    v = np.array([-u[1], u[0]])
    count = shed_count(2 * hw)
    height = spec.roof_height if spec.roof_height is not None else \
        2 * hw / count * SHED_LONG_SHARE * math.tan(math.radians(roof_pitch(spec)))
    hl, hw = hl + EAVE_M, hw + EAVE_M
    for i in range(count):
        low, high = -hw + 2 * hw * i / count, -hw + 2 * hw * (i + 1) / count
        peak = low + (high - low) * SHED_LONG_SHARE
        planes = []
        for ta, tb, za, zb in ((low, peak, z_eave, z_eave + height), (peak, high, z_eave + height, z_eave)):
            slope = (zb - za) / (tb - ta)
            gradient = v * slope
            planes.append((gradient, float(za - slope * ta - c @ gradient)))
            points = [np.array([*(c + u * s + v * t), z])
                      for s, t, z in ((-hl, ta, za), (hl, ta, za), (hl, tb, zb), (-hl, tb, zb))]
            clipped = _clip_roof(points, ring)
            clipped = [p for j, p in enumerate(clipped) if np.linalg.norm(p - clipped[j - 1]) > 1e-9]
            if len(clipped) >= 3:
                uv = [(float((p[:2] - c) @ u) / ROOF_UV_M,
                       (float((p[:2] - c) @ v) - ta) * math.hypot(1., slope) / ROOF_UV_M) for p in clipped]
                m.poly(clipped, uv, mat_idx[spec.roof_mat])
        _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx, (v, float(c @ v) + low, float(c @ v) + high))


BARREL_SEGMENTS = 12       # 15-degree steps include the crown; at most 24 top triangles before footprint clipping.


def _round_roof(m, spec, ring, z_eave, mat_idx):
    """A segmented elliptical barrel, with mapped rise, clipped footprint and closed end walls."""
    c, u, hl, hw = roof_box(ring, spec.roof_direction, spec.roof_orientation)
    v = np.array([-u[1], u[0]])
    height = spec.roof_height if spec.roof_height is not None else hw * math.tan(math.radians(roof_pitch(spec)))
    hl, hw = hl + EAVE_M, hw + EAVE_M
    angles = np.linspace(-math.pi / 2, math.pi / 2, BARREL_SEGMENTS + 1)
    span, rise = hw * np.sin(angles), height * np.cos(angles)
    planes, distance = [], 0.
    for i in range(BARREL_SEGMENTS):
        ta, tb, za, zb = span[i], span[i + 1], z_eave + rise[i], z_eave + rise[i + 1]
        slope = (zb - za) / (tb - ta)
        gradient = v * slope
        planes.append((gradient, float(za - slope * ta - c @ gradient)))
        points = [np.array([*(c + u * s + v * t), z])
                  for s, t, z in ((-hl, ta, za), (hl, ta, za), (hl, tb, zb), (-hl, tb, zb))]
        clipped = _clip_roof(points, ring)
        clipped = [p for j, p in enumerate(clipped) if np.linalg.norm(p - clipped[j - 1]) > 1e-9]
        if len(clipped) >= 3:
            uv = [(float((p[:2] - c) @ u) / ROOF_UV_M,
                   (distance + (float((p[:2] - c) @ v) - ta) * math.hypot(1., slope)) / ROOF_UV_M)
                  for p in clipped]
            m.poly(clipped, uv, mat_idx[spec.roof_mat])
        distance += math.hypot(tb - ta, zb - za)
    _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx)


ROOF_EDGE_DEPTH_M = .12    # Thin roof assembly at the overhang; not a structural slab or an interior ceiling.


def _roof_eaves(m, ring, first_vertex, first_index, mat):
    """Close only the roof's exposed perimeter with soffits and rims, reusing its emitted slope heights."""
    p = np.asarray(m.P[first_vertex * 3:], float).reshape(-1, 3)
    triangles = np.asarray(m.T[first_index:], int).reshape(-1, 3) - first_vertex
    faces = p[triangles]
    normals = np.cross(faces[:, 1] - faces[:, 0], faces[:, 2] - faces[:, 0])
    upward = normals[:, 2] > 1e-8
    faces, normals = faces[upward], normals[upward]
    if not len(faces):
        return
    slopes = -normals[:, :2] / normals[:, 2, None]
    heights = faces[:, 0, 2] - (faces[:, 0, :2] * slopes).sum(1)
    edges = {}
    for face in faces:
        for a, b in zip(face, np.roll(face, -1, axis=0)):
            # Clipped adjacent faces calculate the same edge with tiny rounding differences.
            key = tuple(sorted((tuple(np.round(a, 7)), tuple(np.round(b, 7)))))
            count, _, _ = edges.get(key, (0, a, b))
            edges[key] = count + 1, a, b
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    blank = (.008, .997)  # Window-free facade margin; reused material adds no draw or light mask.
    for count, a, b in edges.values():
        if count != 1:
            continue
        outer = np.array([a, b])
        local = outer[:, :2] - c
        inner = c + np.clip(local @ u, -hl, hl)[:, None] * u + np.clip(local @ v, -hw, hw)[:, None] * v
        if np.max(np.linalg.norm(inner - outer[:, :2], axis=1)) < 1e-6:
            continue
        # Select actual triangles above the wall points: extending all planes across sawtooth valleys is wrong.
        inside = np.ones((2, len(faces)), bool)
        for j in range(3):
            edge = faces[:, (j + 1) % 3, :2] - faces[:, j, :2]
            rel = inner[:, None, :] - faces[None, :, j, :2]
            inside &= edge[None, :, 0] * rel[:, :, 1] - edge[None, :, 1] * rel[:, :, 0] >= -1e-7
        zinner = np.min(np.where(inside, inner @ slopes.T + heights, np.inf), axis=1) - ROOF_EDGE_DEPTH_M
        ai, bi = np.c_[inner, zinner]
        ad, bd = outer - [0., 0., ROOF_EDGE_DEPTH_M]
        soffit = [ad, ai, bi, bd]
        soffit = [p for i, p in enumerate(soffit) if np.linalg.norm(p - soffit[i - 1]) > 1e-7]
        # Near an oblique hip, both inner endpoints can meet at one wall corner: emit one triangle there.
        if len(soffit) >= 3:
            m.poly(soffit, [blank] * len(soffit), mat)          # faces downward
        m.quad(ad, bd, b, a, blank, blank, blank, blank, mat)    # faces outward


def _roof(m, spec, ring, z_eave, mat_idx):
    """Emit supported roof planes using the mapped rise and bearing where present."""
    if spec.roof == "skillion":
        return _skillion_roof(m, spec, ring, z_eave, mat_idx)
    if spec.roof == "pyramidal":
        return _pyramidal_roof(m, spec, ring, z_eave, mat_idx)
    if spec.roof in ("dome", "onion", "spherical"):
        return _radial_roof(m, spec, ring, z_eave, mat_idx)
    if spec.roof in ("mansard", "gambrel"):
        return _broken_roof(m, spec, ring, z_eave, mat_idx)
    if spec.roof == "round":
        return _round_roof(m, spec, ring, z_eave, mat_idx)
    if spec.roof == "sawtooth":
        return _sawtooth_roof(m, spec, ring, z_eave, mat_idx)
    if spec.roof not in ("half_hipped", "saltbox") and spec.roof_direction is None and spec.roof_orientation != "across":
        return _roof_aligned(m, spec, ring, z_eave, mat_idx)
    rm = mat_idx[spec.roof_mat]
    if spec.roof == "flat":
        pts = [(p[0], p[1], z_eave) for p in ring]
        m.poly(pts, [(p[0] / ROOF_UV_M, p[1] / ROOF_UV_M) for p in ring], rm)
        return
    c, u, hl, hw = roof_box(ring, spec.roof_direction, spec.roof_orientation)
    v = np.array([-u[1], u[0]])
    height = spec.roof_height if spec.roof_height is not None else hw * math.tan(math.radians(roof_pitch(spec)))
    slope = height / hw
    hl2, hw2 = hl + EAVE_M, hw + EAVE_M
    ze, zr = z_eave - EAVE_M * slope, z_eave + height
    rise = zr - ze

    def at(s, t, z):
        p = c + u * s + v * t
        return (*p, z)

    def face(points):
        points = _clip_roof(points, ring)
        points = [p for i, p in enumerate(points) if np.linalg.norm(p - points[i - 1]) > 1e-9]
        if len(points) < 3:
            return
        uv = [(float((p[:2] - c) @ u) / ROOF_UV_M,
               float((p[:2] - c) @ v) * math.hypot(1., slope) / ROOF_UV_M) for p in points]
        m.poly(points, uv, rm)

    planes = [(v * slope, zr - float(c @ v) * slope), (-v * slope, zr + float(c @ v) * slope)]
    if spec.roof == "saltbox":
        # Equal pitch, unequal runs: the longer side descends to the lower eave; the short side ends higher.
        offset = hw2 * SALTBOX_OFFSET
        if spec.roof_height is None:
            height *= 1 + SALTBOX_OFFSET
            zr = z_eave + height
        slope = height / (hw2 + offset)
        high_eave = zr - slope * (hw2 - offset)
        face([at(-hl2, -hw2, z_eave), at(hl2, -hw2, z_eave), at(hl2, offset, zr), at(-hl2, offset, zr)])
        face([at(hl2, hw2, high_eave), at(-hl2, hw2, high_eave), at(-hl2, offset, zr), at(hl2, offset, zr)])
        ridge_projection = float(c @ v) + offset
        planes = [(v * slope, zr - ridge_projection * slope), (-v * slope, zr + ridge_projection * slope)]
        _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx)
        return
    if spec.roof == "half_hipped":
        # No tag gives the clipped-gable depth: keep the lower half upright, clip the upper half.
        # Limit the end run on short/across roofs so the two hips leave a ridge rather than a pyramid.
        cut, zcut = hw2 / 2, ze + rise / 2
        run = min(hw2 / 2, hl2 / 2)
        r = hl2 - run
        face([at(-hl2, -hw2, ze), at(hl2, -hw2, ze), at(hl2, -cut, zcut),
              at(r, 0, zr), at(-r, 0, zr), at(-hl2, -cut, zcut)])
        face([at(hl2, hw2, ze), at(-hl2, hw2, ze), at(-hl2, cut, zcut),
              at(-r, 0, zr), at(r, 0, zr), at(hl2, cut, zcut)])
        face([at(hl2, -cut, zcut), at(hl2, cut, zcut), at(r, 0, zr)])
        face([at(-hl2, cut, zcut), at(-hl2, -cut, zcut), at(-r, 0, zr)])
        end_slope = (zr - zcut) / run
        planes += [(u * end_slope, zcut + (hl2 - float(c @ u)) * end_slope),
                   (-u * end_slope, zcut + (hl2 + float(c @ u)) * end_slope)]
        _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx)
        return
    r = hl2 if spec.roof == "gabled" else max(hl2 - hw2, 0.)
    face([at(-hl2, -hw2, ze), at(hl2, -hw2, ze), at(r, 0, zr), at(-r, 0, zr)])
    face([at(hl2, hw2, ze), at(-hl2, hw2, ze), at(-r, 0, zr), at(r, 0, zr)])
    if spec.roof != "gabled":
        face([at(hl2, -hw2, ze), at(hl2, hw2, ze), at(r, 0, zr)])
        face([at(-hl2, hw2, ze), at(-hl2, -hw2, ze), at(-r, 0, zr)])
        end_slope = rise / (hl2 - r)
        planes += [(u * end_slope, ze + (hl2 - float(c @ u)) * end_slope),
                   (-u * end_slope, ze + (hl2 + float(c @ u)) * end_slope)]
    _roof_wall_caps(m, spec, ring, z_eave, planes, mat_idx)


def _roof_aligned(m, spec, ring, z_eave, mat_idx):
    rm = mat_idx[spec.roof_mat]
    if spec.roof == "flat":
        pts = [(p[0], p[1], z_eave) for p in ring]
        uv = [(p[0] / ROOF_UV_M, p[1] / ROOF_UV_M) for p in ring]
        m.poly(pts, uv, rm)
        return
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    hl2, hw2 = hl + EAVE_M, hw + EAVE_M
    height = spec.roof_height if spec.roof_height is not None else hw * math.tan(math.radians(roof_pitch(spec)))
    ze = z_eave - EAVE_M * height / hw
    zr = z_eave + height
    rise = zr - ze

    def at(s, t, z):
        p = c + u * s + v * t
        return (float(p[0]), float(p[1]), float(z))
    slope = math.hypot(hw2, rise)

    def uv(s, t):            # along the ridge, up the slope (m / ROOF_UV_M)
        return (s / ROOF_UV_M, (hw2 - abs(t)) / hw2 * slope / ROOF_UV_M)
    if spec.roof == "gabled":
        r = hl2
        m.quad(at(-hl2, -hw2, ze), at(hl2, -hw2, ze), at(r, 0, zr), at(-r, 0, zr),
               uv(-hl2, -hw2), uv(hl2, -hw2), uv(r, 0), uv(-r, 0), rm)
        m.quad(at(hl2, hw2, ze), at(-hl2, hw2, ze), at(-r, 0, zr), at(r, 0, zr),
               uv(hl2, hw2), uv(-hl2, hw2), uv(-r, 0), uv(r, 0), rm)
        # the gable ends: wall triangles from the eave line up to the ridge, the facade's plain colour
        fac = mat_idx[spec.facade]
        for sgn in (-1, 1):
            s = sgn * hl
            a, b, top = at(s, -sgn * hw, z_eave), at(s, sgn * hw, z_eave), at(s, 0, zr)
            if sgn > 0:
                m.tri(a, b, top, (0, 0.995), (0.02, 0.995), (0.01, 0.999), fac)
            else:
                m.tri(a, b, top, (0, 0.995), (0.02, 0.995), (0.01, 0.999), fac)
        slope_m = height / hw
        _attic_windows(m, spec, ring, z_eave,
                       [(v * slope_m, zr - float(c @ v) * slope_m),
                        (-v * slope_m, zr + float(c @ v) * slope_m)], mat_idx)
    else:                    # hipped
        r = max(hl2 - hw2, 0.0)
        m.quad(at(-hl2, -hw2, ze), at(hl2, -hw2, ze), at(r, 0, zr), at(-r, 0, zr),
               uv(-hl2, -hw2), uv(hl2, -hw2), uv(r, 0), uv(-r, 0), rm)
        m.quad(at(hl2, hw2, ze), at(-hl2, hw2, ze), at(-r, 0, zr), at(r, 0, zr),
               uv(hl2, hw2), uv(-hl2, hw2), uv(-r, 0), uv(r, 0), rm)
        m.tri(at(hl2, -hw2, ze), at(hl2, hw2, ze), at(r, 0, zr),
              (-hw2 / ROOF_UV_M, 0), (hw2 / ROOF_UV_M, 0), (0, slope / ROOF_UV_M), rm)
        m.tri(at(-hl2, hw2, ze), at(-hl2, -hw2, ze), at(-r, 0, zr),
              (-hw2 / ROOF_UV_M, 0), (hw2 / ROOF_UV_M, 0), (0, slope / ROOF_UV_M), rm)
