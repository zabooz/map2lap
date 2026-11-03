"""Town signs: a place's name where a road enters its built-up area, the end of it on the back (a red bar through the
name), one plate for the whole world: white with a black border and black letters, in the speed signs' materials
and the guide signs' lettering.

Where: along every road a town sign stands on (speedsigns.RANK residential to trunk; no motorway, no link), the
stretches with buildings beside them (the map's footprints: the land cover's built-up class misses most villages,
whose houses stand in gardens), long enough to be a place, their gaps closed, entered from open country. The name: the OpenStreetMap place (settlements.py: city, town, village, hamlet)
nearest that run within the place's reach. A run with no place near (an industrial estate, a lone petrol station)
gets no sign; nor a name the lettering can't write (another script: no stray letters).

Built in the sign tiles (signstream.py, field "towns"), render-only like the speed signs.
"""
import numpy as np

import buildings
import exitsigns
import mapcells
import roads
import speedsigns

STEP_M = 10.0           # m between the samples along a road
NEAR_M = 50.0           # m round a sample a building's centre makes it built-up: a house's front garden and the row
                        # behind it (a building farther off stands on another street)
# A town sign marks where a road comes in from open country. A place's built-up pixels break between its houses
# and round its parks, school grounds and sports fields (other land cover): runs closer than GAP_M along the road are
# one place, and a sign needs that much open road before the run (a road ending in the fields brings no one in). Two
# villages with less open land between them get one sign pair.
GAP_M = 300.0
# A shorter run with open land at both ends is a farmstead or a lone barn (one building alone makes 2 NEAR_M), no place.
RUN_M = 150.0
OPEN, BUILT, DEAD = "open", "built", "dead"     # beyond a road's end: open land on another road, the place, nothing
# m a place's point (its centre, as mapped) may lie from the built-up run that is it: about a place's radius
REACH_M = {"city": 6000.0, "town": 2500.0, "village": 1200.0, "hamlet": 500.0}
RANKS = (1, 6)          # speedsigns.RANK of the roads with town signs: residential to trunk
SIDE_M = 1.5            # m from the carriageway's edge to the posts
MARGIN_M = 50.0         # m round a tile: the roads whose runs may put a sign in it
# the plate (m): its height for one and two lines of name, its width round the name within PLATE_W, the capitals
PLATE_H = (0.65, 0.95)
PLATE_W = (1.0, 2.2)
CAP_M = 0.17
BORDER_M = 0.035
PLATE_T = 0.03
PLATE_BOTTOM_M = 1.8    # the plate's lower edge over the ground
POST_W = 0.06
BAR_W = 0.07            # the red bar through the name on the back (the end of the place)
MATERIALS = speedsigns.MATERIALS     # white, red, metal, black lettering, black
WHITE, RED, METAL, LETTERS, BLACK = range(5)


def runs(urban, step=STEP_M, gap=GAP_M, run=RUN_M, ends=(OPEN, OPEN)):
    """[(start index, end index)] of the built-up runs of urban (bools at samples step m apart along a road), gaps up
    to gap m closed; runs shorter than run m dropped unless they reach an end where the place goes on past the road
    (ends: OPEN, BUILT or DEAD beyond the first / last sample). Pure."""
    u = np.asarray(urban, bool)
    idx = np.flatnonzero(u)
    if not len(idx):
        return []
    out = [[int(idx[0]), int(idx[0])]]
    for k in idx[1:]:
        if (k - out[-1][1]) * step <= gap:
            out[-1][1] = int(k)
        else:
            out.append([int(k), int(k)])
    n = len(u)
    keep = []
    for a, b in out:
        through = (a == 0 and ends[0] == BUILT) or (b == n - 1 and ends[1] == BUILT)
        if (b - a) * step >= run or through:
            keep.append((a, b))
    return keep


def entries(urban, step=STEP_M, ends=(OPEN, OPEN), oneway=0, gap=GAP_M):
    """[(sample index, +1 / -1, its run)] where a road enters a place from open country: a run's start going along
    (+1), its end going against (-1), with gap m of open road before it (the samples before the run, and gap more
    where the road goes on into open land beyond its end: ends OPEN); none against a one-way road's direction
    (oneway: +1 along, -1 against, 0 both). Pure."""
    n = len(urban)
    out = []
    got = runs(urban, step, gap, ends=ends)
    for k, (a, b) in enumerate(got):
        before = (a - got[k - 1][1]) * step if k else a * step + (gap if ends[0] == OPEN else 0.0)
        after = (got[k + 1][0] - b) * step if k + 1 < len(got) else \
            (n - 1 - b) * step + (gap if ends[1] == OPEN else 0.0)
        if oneway >= 0 and before >= gap:
            out.append((a, 1, (a, b)))
        if oneway <= 0 and after >= gap:
            out.append((b, -1, (a, b)))
    return out


def sign_lines(name):
    """The name's lines on the plate: a bilingual name ("Grabelsdorf/Grabalja vas") one language per line, in the
    lettering's glyphs (buildings.sign_text), or () when it can't be written. Pure."""
    parts = [p.strip() for p in str(name or "").replace(" - ", "/").split("/") if p.strip()][:2]
    lines = tuple(t for t in (buildings.sign_text(p) for p in parts) if t)
    return lines if len(lines) == len(parts) else ()


def nearest_place(pts, places):
    """The name of the place of places [(x, y, kind, name)] nearest the points pts (k, 2) of a run within its kind's
    REACH_M (the nearest as a share of its reach: a town's centre farther than a hamlet's), else None. Pure."""
    best = None
    for x, y, kind, name in places:
        reach = REACH_M.get(kind)
        if reach is None:
            continue
        d = float(np.hypot(pts[:, 0] - x, pts[:, 1] - y).min())
        if d <= reach and (best is None or d / reach < best[0]):
            best = (d / reach, name)
    return best[1] if best else None


def _samples(pts):
    """(points every STEP_M along the line pts (k, 2), their distance along it, the unit direction at each). Pure."""
    seg = np.hypot(*np.diff(pts, axis=0).T)
    cum = np.r_[0.0, np.cumsum(seg)]
    if cum[-1] < STEP_M:
        return None
    s = np.arange(0.0, cum[-1] + 1e-9, STEP_M)
    x, y = np.interp(s, cum, pts[:, 0]), np.interp(s, cum, pts[:, 1])
    k = np.clip(np.searchsorted(cum, s, side="right") - 1, 0, len(seg) - 1)
    d = np.diff(pts, axis=0)[k] / np.maximum(seg[k], 1e-9)[:, None]
    return np.column_stack([x, y]), s / cum[-1], d


def place(frame, box, context, md, left_hand=False):
    """The town signs of box (x0, y0, x1, y1): [(x, y, travel x, travel y, half width, name lines)], the post's
    middle on the road's right (left_hand: left) of the traffic entering the place."""
    if md is None or not hasattr(md, "settlements"):
        return []
    x0, y0, x1, y1 = box
    m = MARGIN_M
    la, lo, _ = frame.enu_to_geodetic(np.array([x0 - m, x1 + m]), np.array([y0 - m, y1 + m]), 0.0)
    rows, seen, ends_at = [], set(), {}
    for key in mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max())):
        feats = context.cell(key)
        if feats is None or not len(feats):
            continue
        for fid, row in speedsigns._cell_rows(feats, frame, context.urban, context.widths, left_hand, True).items():
            if fid in seen:
                continue
            seen.add(fid)
            for f, c in row[3]:                         # (every drivable road's ends: a road goes on there)
                if f <= 1e-6 or f >= 1 - 1e-6:
                    ends_at[c] = ends_at.get(c, 0) + 1
            pts, meta = row[1], row[2]
            if not RANKS[0] <= meta[2] <= RANKS[1] or meta[4]:
                continue
            if (pts[:, 0].max() < x0 - m or pts[:, 0].min() > x1 + m or
                    pts[:, 1].max() < y0 - m or pts[:, 1].min() > y1 + m):
                continue
            rows.append(row)
    lines = []
    for row in rows:
        got = _samples(row[1])
        if got is None:
            continue
        pts = got[0]
        # (the land beyond each end, a gap's length on along the road's last direction: built-up there, the place
        # goes on past the junction that ends this road; else open land if another road goes on from there)
        ends = [pts[0] - got[2][0] * (STEP_M * (k + 1)) for k in range(int(GAP_M / STEP_M))] + \
               [pts[-1] + got[2][-1] * (STEP_M * (k + 1)) for k in range(int(GAP_M / STEP_M))]
        lines.append((row, got, np.asarray(ends)))
    if not lines:
        return []
    allp = np.concatenate([np.vstack([g[0], e]) for _, g, e in lines])
    u_all = near_buildings(allp, _building_centres(frame, allp, md))
    places = None
    out, k = [], 0
    half_n = int(GAP_M / STEP_M)
    for row, (pts, frac, dirs), ends in lines:
        n = len(pts)
        u, ue = u_all[k:k + n], u_all[k + n:k + n + 2 * half_n]
        k += n + 2 * half_n
        meta, skips = row[2], row[5]
        on = [any(ends_at.get(c, 0) > 1 for f, c in row[3] if abs(f - e) <= 1e-6) for e in (0.0, 1.0)]
        ends = tuple(BUILT if ue[j * half_n:(j + 1) * half_n].any() else OPEN if on[j] else DEAD for j in (0, 1))
        found = entries(u, ends=ends, oneway=int(meta[1]))
        for i, sense, run in found:
            p = pts[i]
            if not (x0 <= p[0] < x1 and y0 <= p[1] < y1):
                continue
            if any(a <= frac[i] <= b for a, b in skips):
                continue                                # (on a bridge or in a tunnel)
            if places is None:
                places = _places(frame, box, md)
            name = nearest_place(pts[run[0]:run[1] + 1], places)
            lines_ = sign_lines(name)
            if not lines_:
                continue
            t = dirs[i] * sense
            out.append((float(p[0]), float(p[1]), float(t[0]), float(t[1]), float(meta[0]), lines_))
    return out


def near_buildings(xy, centres, near=NEAR_M, cell=STEP_M):
    """Per point of xy (k, 2): a building centre (centres (b, 2)) within near m of it (a square's half side: a
    summed-area table of the centres on a cell m grid). Pure."""
    xy, centres = np.asarray(xy, np.float64).reshape(-1, 2), np.asarray(centres, np.float64).reshape(-1, 2)
    if not len(centres) or not len(xy):
        return np.zeros(len(xy), bool)
    lo = np.minimum(xy.min(0), centres.min(0)) - near - cell
    hi = np.maximum(xy.max(0), centres.max(0)) + near + cell
    nx, ny = (np.ceil((hi - lo) / cell).astype(int) + 1)
    grid = np.zeros((ny + 1, nx + 1), np.int64)
    ix, iy = ((centres - lo) / cell).astype(int).T
    np.add.at(grid, (iy + 1, ix + 1), 1)
    sat = grid.cumsum(0).cumsum(1)
    r = int(np.ceil(near / cell))
    px, py = ((xy - lo) / cell).astype(int).T
    x0, x1 = np.clip(px - r, 0, nx), np.clip(px + r + 1, 0, nx)
    y0, y1 = np.clip(py - r, 0, ny), np.clip(py + r + 1, 0, ny)
    return (sat[y1, x1] - sat[y0, x1] - sat[y1, x0] + sat[y0, x0]) > 0


def _building_centres(frame, pts, md):
    """(b, 2) frame xy of the centres of the map's buildings round the points pts."""
    lo_, hi_ = pts.min(0) - NEAR_M, pts.max(0) + NEAR_M
    la, lo, _ = frame.enu_to_geodetic(np.array([lo_[0], hi_[0]]), np.array([lo_[1], hi_[1]]), 0.0)
    got = []
    for key in mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max())):
        f = md.cell(key, layers=("buildings",), kind="demand").layers.get("buildings")
        if f is not None and len(f):
            cx, cy = f.outer_centres(frame)
            ok = np.isfinite(cx) & (cx >= lo_[0]) & (cx <= hi_[0]) & (cy >= lo_[1]) & (cy <= hi_[1])
            got.append(np.column_stack([cx[ok], cy[ok]]))
    return np.concatenate(got) if got else np.zeros((0, 2))


def _places(frame, box, md):
    """[(x, y, kind, name)] in frame of the places within the largest reach of box."""
    x0, y0, x1, y1 = box
    r = max(REACH_M.values())
    la, lo, _ = frame.enu_to_geodetic(np.array([x0 - r, x1 + r]), np.array([y0 - r, y1 + r]), 0.0)
    got = []
    for key in mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max())):
        got.extend(md.settlements(key))
    if not got:
        return []
    ll = np.asarray([(g[0], g[1]) for g in got], np.float64)
    e, n, _ = frame.geodetic_to_enu(ll[:, 1], ll[:, 0], np.zeros(len(ll)))
    return [(float(a), float(b), g[2], g[3]) for a, b, g in zip(np.ravel(e), np.ravel(n), got)]


class _Mesh:
    def __init__(self, origin):
        self.P, self.UV, self.T, self.M, self.o = [], [], [], [], np.asarray(origin, np.float64)

    def quad(self, corners, uvs, mat):
        """corners: bottom left, bottom right, top right, top left as seen from the front."""
        k = len(self.P)
        self.P.extend(np.asarray(c, np.float64) - self.o for c in corners)
        self.UV.extend(uvs)
        self.T.extend(((k, k + 1, k + 2), (k, k + 2, k + 3)))
        self.M.extend((mat, mat))

    def box(self, c, u, hu, hv, z0, z1, mat):
        """A box round c (2D), half sizes hu along u and hv across, from z0 to z1."""
        v = np.array([-u[1], u[0]])
        k = [c + u * su * hu + v * sv * hv for su, sv in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        for i in range(4):
            a, b = k[i], k[(i + 1) % 4]
            self.quad(((*a, z0), (*b, z0), (*b, z1), (*a, z1)), [(0, 0)] * 4, mat)
        self.quad([(*q, z1) for q in k], [(0, 0)] * 4, mat)

    def face(self, c, r, w, z0, z1, mat):
        """A flat face round c (3D: its foot's middle at z0 is c[:2]), its right r, w wide, from z0 to z1."""
        a, b = c - r * (w / 2), c + r * (w / 2)
        self.quad(((*a, z0), (*b, z0), (*b, z1), (*a, z1)), [(0, 0)] * 4, mat)

    def arrays(self):
        return (np.asarray(self.P, np.float64).reshape(-1, 3), np.asarray(self.T, np.int64).reshape(-1, 3),
                np.asarray(self.UV, np.float64).reshape(-1, 2), list(MATERIALS), np.asarray(self.M, np.int64))


def _text(m, data, text, c, r, z_mid, cap, max_w):
    """text in the guide signs' glyphs on a face whose right is r, centred on c (2D) and z_mid, capitals cap high,
    squeezed to max_w (buildings._lettering's quads)."""
    glyphs = data["glyphs"]
    scale = cap / data["capHeight"]
    width = sum(glyphs[ch]["advance"] for ch in text) * scale
    if width > max_w:
        scale *= max_w / width
        width = max_w
    base = z_mid - data["capHeight"] * scale / 2
    cur = np.asarray(c, np.float64) - r * (width / 2)
    for ch in text:
        g = glyphs[ch]
        l, t, rr, b = g["bbox"]
        u0, v0, u1, v1 = g["uv"]
        if rr > l and b > t:
            p0, p1 = cur + r * (l * scale), cur + r * (rr * scale)
            zb, zt = base - b * scale, base - t * scale
            m.quad(((*p0, zb), (*p1, zb), (*p1, zt), (*p0, zt)), [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], LETTERS)
        cur = cur + r * (g["advance"] * scale)


def text_width(data, text, cap):
    """The width of text at capitals cap high. Pure."""
    return sum(data["glyphs"][ch]["advance"] for ch in text) * cap / data["capHeight"]


def sign_mesh(m, data, x, y, z, tx, ty, lines, left_hand=False):
    """One town sign into m: its posts at (x, y) on ground z, its front (lines) facing the traffic coming along
    (tx, ty), its back the same name with the red bar."""
    t = np.array([tx, ty], np.float64)
    t /= max(float(np.hypot(*t)), 1e-9)
    front = -t                                          # the face's outward normal: towards the coming traffic
    r = np.array([-front[1], front[0]])                 # its right, seen from the front
    w = min(max(max(text_width(data, ln, CAP_M) for ln in lines) + 0.4, PLATE_W[0]), PLATE_W[1])
    h = PLATE_H[len(lines) - 1]
    c = np.array([x, y], np.float64)
    z0, z1 = z + PLATE_BOTTOM_M, z + PLATE_BOTTOM_M + h
    for off in ((-0.32 * w, 0.32 * w) if w > 1.3 else (0.0,)):
        m.box(c + r * off - front * (PLATE_T / 2 + POST_W / 2), t, POST_W / 2, POST_W / 2, z - 0.3, z1 - 0.05, METAL)
    m.box(c, r, w / 2, PLATE_T / 2, z0, z1, BLACK)     # (the border: the plate's black edge round the white faces)
    zm = (z0 + z1) / 2
    rows = [zm] if len(lines) == 1 else [zm + h * 0.2, zm - h * 0.2]
    for n, rr, back in ((front, r, False), (-front, -r, True)):
        fc = c + n * (PLATE_T / 2 + 0.002)
        m.face(fc, rr, w - 2 * BORDER_M, z0 + BORDER_M, z1 - BORDER_M, WHITE)
        for ln, zr in zip(lines, rows):
            _text(m, data, ln, fc + n * 0.002, rr, zr, CAP_M, w - 0.3)
        if back:                                        # the end of the place: a red bar corner to corner
            a = fc + n * 0.004
            dx, dz = w - 4 * BORDER_M, h - 4 * BORDER_M
            L = float(np.hypot(dx, dz))
            ox, oz = -dz / L * BAR_W / 2, dx / L * BAR_W / 2  # (the bar's half width, across it)
            p = [(-dx / 2 - ox, -dz / 2 - oz), (dx / 2 - ox, dz / 2 - oz), (dx / 2 + ox, dz / 2 + oz),
                 (-dx / 2 + ox, -dz / 2 + oz)]
            m.quad([(*(a + rr * px), zm + pz) for px, pz in p], [(0, 0)] * 4, RED)


def build_tile(frame, tx, ty, elev, context, md, decks=(), left_hand=False):
    """The mesh (signstream.write_tile's) of road tile (tx, ty)'s town signs, or None (none)."""
    box = roads.tile_bbox(tx, ty)
    signs = place(frame, box, context, md, left_hand)
    posts = []
    for x, y, tx_, ty_, half, lines in signs:
        right = np.array([ty_, -tx_]) if not left_hand else np.array([-ty_, tx_])
        p = np.array([x, y]) + right * (half + SIDE_M)
        if not exitsigns._on_deck(p, decks, 1.5):
            posts.append((p, tx_, ty_, lines))
    if not posts:
        return None
    pts = np.asarray([p for p, _, _, _ in posts])
    la, lo, _ = frame.enu_to_geodetic(pts[:, 0], pts[:, 1], np.zeros(len(pts)))
    h = np.asarray(elev(la, lo), np.float64).ravel()
    z = np.asarray(frame.geodetic_to_enu(la, lo, h)[2], np.float64).ravel()
    m = _Mesh((box[0], box[1], 0.0))
    data = exitsigns.lettering()
    for (p, tx_, ty_, lines), zz in zip(posts, z):
        sign_mesh(m, data, p[0], p[1], zz, tx_, ty_, lines, left_hand)
    return m.arrays()
