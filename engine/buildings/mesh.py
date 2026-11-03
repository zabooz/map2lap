"""Mesh and the walls, roofs, signs and details of a building."""
import math

import numpy as np

import fast

from .looks import (
    BANDS, BAND_SHOP, BLADE_CAP_M, BLADE_T, BLADE_W, CHURCH_CLASSES, CORNICE_DOWN_M, CORNICE_OUT_M, CORNICE_UP_M,
    EAVE_M, FOUNDATION_M, GREEN_CROSS, GROUND_FLOOR_SHOP_M, HALL_CAP_M, HALL_CAP_SHARE, HALL_CLEAR_M, KEEP_SIDE, MERLON,
    PANEL_CAP, PANEL_H, PITCH, PLATE_H, PLATE_TOP_M, PLATE_W, ROOF_SLATE, ROOF_UV_M, SHOP, SIDING_UV_M, SIGN_CAP,
    SIGN_H, SIGN_MARGIN_M, SIGN_OUT, SIGN_SHOP_M, SIGN_TINTS, SYMBOL_IN_M, SYMBOL_M, TILE_PX_M, _hash01
)
from .styles import _area2, oriented_box, roof_pitch, triangulate


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


# A sash window cut from the plaster sheet (band 2, bay 0, its sill included): u, v ranges (Collada v up)
WIN_UV = (53 / 1024, 154 / 1024, 1.0 - (512 + 238) / 1024, 1.0 - (512 + 45) / 1024)
WIN_W, WIN_H, WIN_SILL = 1.05, 1.75, 0.85   # m
HOUSE_BAY_M = 3.4           # m between a house's windows
DOOR_GAP_M = 0.75           # m each side of a front door kept free of the ground floor's windows
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
    fast.require(76, "building_walls")
    band = spec.band or (0, 1)
    good = list(band[2]) if len(band) > 2 else []
    door = spec.door
    P, UV, mid = fast._ef.building_walls(
        np.ascontiguousarray(np.asarray(ring, np.float64)[:, :2]), float(z0), float(z_eave), bool(spec.wall),
        bool(spec.plain), int(band[0]), int(band[1]), [int(g) for g in good], int(spec.floors), float(spec.floor_h),
        bool(spec.shop), int(door[0]) if door else -1, float(door[1]) if door else 0.0, spec.roof == "flat",
        float(spec.seed) if isinstance(spec.seed, float) else 0.0, spec.windows is False,
        int(spec.front) if spec.front is not None else -1, bool(lite), _WALL_CONSTS)
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
    """The ground at a point `along` m on edge `edge` of the footprint (its corners' ground, spec.gring), or gmax
    when not known: a row house's door and steps (from the footprint's highest ground, its back yard's on a slope,
    the steps on Bradford Street stood 1.5 m over the sidewalk, five or six of them; Mapillary: one or two)."""
    g = getattr(spec, "gring", None)
    ring = spec.ring
    if g is None or len(g) != len(ring):
        return gmax
    a, b = ring[edge], ring[(edge + 1) % len(ring)]
    L = float(math.hypot(*(b - a)))
    t = 0.0 if L < 1e-6 else min(max(along / L, 0.0), 1.0)
    return float(g[edge] + t * (g[(edge + 1) % len(ring)] - g[edge]))


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


def _clutter(m, spec, ring, z_eave, mat_idx):
    area = _area2(ring) / 2
    if spec.roof != "flat" or spec.plain or area < ROOF_CLUTTER_M2 or spec.cls in CHURCH_CLASSES:
        return
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    n = min(6, 1 + int(area / 600.0))
    mat = mat_idx["bne_bld_fac_grey"]
    for k in range(n):
        s = (_hash01(spec.seed, "cx", k) * 2 - 1) * (hl - 3.0)
        t = (_hash01(spec.seed, "cy", k) * 2 - 1) * (hw - 3.0)
        p = c + u * s + v * t
        if not _inside(ring, p):
            continue
        big = _hash01(spec.seed, "cb", k) < 0.25
        hx, hy, h = (2.0, 1.6, 2.6) if big else (1.1, 0.7, 1.1)
        _box(m, p, u, hx, hy, z_eave, z_eave + h, mat)


def _roof(m, spec, ring, z_eave, mat_idx):
    rm = mat_idx[spec.roof_mat]
    if spec.roof == "flat":
        pts = [(p[0], p[1], z_eave) for p in ring]
        uv = [(p[0] / ROOF_UV_M, p[1] / ROOF_UV_M) for p in ring]
        m.poly(pts, uv, rm)
        return
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    hl2, hw2 = hl + EAVE_M, hw + EAVE_M
    rise = hw2 * math.tan(math.radians(roof_pitch(spec)))
    ze = z_eave - EAVE_M * math.tan(math.radians(roof_pitch(spec)))
    zr = ze + rise

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
            a, b, top = at(s, -sgn * hw, z_eave), at(s, sgn * hw, z_eave), at(s, 0, zr - EAVE_M * 0.2)
            if sgn > 0:
                m.tri(a, b, top, (0, 0.995), (0.02, 0.995), (0.01, 0.999), fac)
            else:
                m.tri(a, b, top, (0, 0.995), (0.02, 0.995), (0.01, 0.999), fac)
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
