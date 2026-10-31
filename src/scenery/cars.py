"""Parked cars in comic style on BeamNG.Earth's parking spots (parking.py, the road tiles' "park" rows): curbside spots
[x, y, z, heading] along town streets and lot stalls [x, y, z, heading, 1] in the mapped car parks (ENU, heading in
degrees counter-clockwise from east: the car's nose). In BeamNG the game's own traffic parks stock cars there; here
static boxy cars with collision (1WALL, like a wall), one shared atlas (cars.png).

Not every spot is taken: the share by how built-up the land round it is and, for a lot, by what stands next to it
(fill_shares), the spots hashed by position (the same cars on every build). The cars follow the ground's slope (each
vertex lifted by the ground plane under the car).
"""
import math

import numpy as np
from PIL import Image, ImageDraw

MATERIAL = "cars"
FILL = {"curb": 0.6, "lot": 0.7}       # share of the spots with a car where the buildings round them are unknown
# How full the curbs and lots are: by the built share of the ground round a spot (the buildings' footprints within
# DENSITY_R_M), from FILL_RANGE's first on open built-up land (a village street: a car before every few houses) to its
# second in a dense core (a city centre's curbs are nearly full). Where it fails: a stadium's or a station's lot
# among few buildings stands as empty as a village's.
DENSITY_R_M = 100.0         # m: a block and the streets round it, where the people who park there live and work
FILL_RANGE = (0.2, 0.9)
DENSE_SHARE = 0.4           # built share of a dense core (an old town's blocks: ~40-50 % of the ground under roofs)
# A lot next to a shop, a restaurant, an office or a public building is fuller (its customers' and staff's cars) ...
BUSY_M = 40.0               # m from the lot's stall to the building's wall, about
BUSY_FILL = 0.8             # ... this full at least
BUSY_CLASSES = {"retail", "supermarket", "commercial", "shop", "kiosk", "restaurant", "hotel", "office", "civic",
                "public", "government", "townhall", "school", "university", "college", "kindergarten", "hospital",
                "train_station", "transportation", "post_office", "library", "fire_station"}
CELL, COLS, ROWS = 128, 8, 6
# body colours and their share in traffic (white, black, greys and silver lead world-wide)
BODY = (((236, 236, 232), 24), ((28, 30, 34), 18), ((120, 124, 128), 14), ((178, 182, 186), 12),
        ((40, 70, 140), 8), ((176, 32, 30), 8), ((44, 84, 60), 3), ((150, 128, 96), 3), ((96, 26, 32), 3),
        ((236, 190, 40), 2), ((220, 110, 30), 2), ((90, 150, 200), 3))
GLASS, TYRE, TRIM, HEAD, TAIL = len(BODY), len(BODY) + 1, len(BODY) + 2, len(BODY) + 3, len(BODY) + 4
# the cabin in the body's colour with the windows set in: sides (pillars A, B, C) and windscreen / rear window
SIDE_WIN, END_WIN = len(BODY) + 5, 2 * len(BODY) + 5
GLASS_RGB, GLINT_RGB = (78, 104, 130), (150, 182, 206)
# shapes, local metres, x forward from the centre: length, width, body bottom / top, wheel diameter,
# cabin (rear x, front x at the bottom; rear x, front x at the roof; roof height)
SHAPES = (
    (4.5, 1.80, 0.30, 1.00, 0.66, (-1.30, 0.90, -1.00, 0.35, 1.45)),     # saloon
    (4.0, 1.75, 0.30, 0.95, 0.62, (-1.95, 0.75, -1.80, 0.15, 1.48)),     # hatchback
    (4.6, 1.90, 0.38, 1.15, 0.76, (-2.15, 0.85, -2.05, 0.35, 1.78)),     # SUV
    (4.9, 1.95, 0.36, 1.10, 0.70, (-2.40, 1.25, -2.40, 0.95, 2.02)),     # van
)


def _hash(x, y, salt):
    v = math.sin(x * 12.9898 + y * 78.233 + salt * 37.719) * 43758.5453
    return v - math.floor(v)


def _windows(d, x, y, body, panes):
    """A cabin face: the body colour with glass panes (fractions of the cell: (x0, x1)) between y 0.16 and 0.9."""
    d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=body)
    for a, b in panes:
        x0, x1, y0, y1 = x + a * CELL, x + b * CELL, y + 0.16 * CELL, y + 0.9 * CELL
        d.rectangle([x0, y0, x1, y1], fill=GLASS_RGB)
        d.polygon([(x0 + 4, y0 + 4), (x0 + 0.35 * (x1 - x0), y0 + 4), (x0 + 4, y0 + 0.6 * (y1 - y0))],
                  fill=GLINT_RGB)


def make_atlas(path):
    img = Image.new("RGB", (COLS * CELL, ROWS * CELL), (128, 128, 128))
    d = ImageDraw.Draw(img)
    at = lambda k: ((k % COLS) * CELL, (k // COLS) * CELL)      # noqa: E731
    cols = [c for c, _ in BODY] + [GLASS_RGB, (24, 24, 26), (46, 48, 52), (250, 246, 220), (210, 30, 30)]
    for k, c in enumerate(cols):
        x, y = at(k)
        d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=c)
    for k, (c, _) in enumerate(BODY):
        _windows(d, *at(SIDE_WIN + k), c, ((0.07, 0.47), (0.54, 0.91)))
        _windows(d, *at(END_WIN + k), c, ((0.09, 0.91),))
    img.save(path)
    return path


def _uv(k, u=0.5, v=0.5):
    """Atlas uv of point (u, v) of cell k (v up), 3 px in from its edge (mip levels)."""
    x = (k % COLS) * CELL + 3 + u * (CELL - 6)
    y = (k // COLS) * CELL + 3 + (1 - v) * (CELL - 6)
    return x / (COLS * CELL), 1.0 - y / (ROWS * CELL)


class _Mesh:
    def __init__(self):
        self.P, self.UV, self.T = [], [], []

    def quad(self, pts, k, full=False):
        """Quad counter-clockwise seen from outside (from its bottom left), atlas cell k: one solid colour, or the
        whole cell spread over it (full)."""
        base = len(self.P)
        self.P += pts
        self.UV += [_uv(k, 0, 0), _uv(k, 1, 0), _uv(k, 1, 1), _uv(k, 0, 1)] if full else [_uv(k)] * 4
        self.T += [(base, base + 1, base + 2), (base, base + 2, base + 3)]

    def hexa(self, bottom, top, sides, roof, full=False):
        """A solid from its bottom and top rings (4 corners counter-clockwise from above); sides: the cells of the
        faces right, front, left, back (local x forward, y left); full: each side's cell spread over it."""
        for i in range(4):
            j = (i + 1) % 4
            self.quad([bottom[i], bottom[j], top[j], top[i]], sides[i], full)
        self.quad(list(top), roof)


def _car(m, shape, color):
    """One car in local coordinates (x forward, y left, z up from the ground)."""
    L, W, zb, zt, wd, (cr0, cf0, cr1, cf1, zr) = shape
    hl, hw = L / 2, W / 2
    ring = lambda x0, x1, w, z: [(x0, -w, z), (x1, -w, z), (x1, w, z), (x0, w, z)]     # noqa: E731
    m.hexa(ring(-hl, hl, hw, zb), ring(-hl, hl, hw, zt), (color, color, color, color), color)       # body
    cw0, cw1 = hw - 0.08, hw - 0.22
    side, end = SIDE_WIN + color, END_WIN + color
    m.hexa(ring(cr0, cf0, cw0, zt), ring(cr1, cf1, cw1, zr), (side, end, side, end), color, full=True)  # cabin
    for x in (-hl + 0.95 * wd + 0.15, hl - 0.95 * wd - 0.05):                                       # wheels
        for side in (-1, 1):
            y0, y1 = side * (hw - 0.26), side * (hw + 0.01)
            y0, y1 = min(y0, y1), max(y0, y1)
            m.hexa([(x - wd / 2, y0, 0.0), (x + wd / 2, y0, 0.0), (x + wd / 2, y1, 0.0), (x - wd / 2, y1, 0.0)],
                   [(x - wd / 2, y0, wd), (x + wd / 2, y0, wd), (x + wd / 2, y1, wd), (x - wd / 2, y1, wd)],
                   (TYRE, TYRE, TYRE, TYRE), TYRE)
    zl0, zl1 = zt - 0.28, zt - 0.12
    for side in (-1, 1):                                                                            # lights
        ya, yb = sorted((side * (hw - 0.12), side * (hw - 0.48)))
        m.quad([(hl + 0.01, ya, zl0), (hl + 0.01, yb, zl0), (hl + 0.01, yb, zl1), (hl + 0.01, ya, zl1)], HEAD)
        m.quad([(-hl - 0.01, yb, zl0), (-hl - 0.01, ya, zl0), (-hl - 0.01, ya, zl1), (-hl - 0.01, yb, zl1)], TAIL)
    m.quad([(hl + 0.02, -hw + 0.1, zb), (hl + 0.02, hw - 0.1, zb), (hl + 0.02, hw - 0.1, zb + 0.14),   # bumpers
            (hl + 0.02, -hw + 0.1, zb + 0.14)], TRIM)
    m.quad([(-hl - 0.02, hw - 0.1, zb), (-hl - 0.02, -hw + 0.1, zb), (-hl - 0.02, -hw + 0.1, zb + 0.14),
            (-hl - 0.02, hw - 0.1, zb + 0.14)], TRIM)


_MODELS = {}


def _model(shape_i, color_i):
    """(P local (n, 3), UV, T) of a shape in a colour, made once."""
    key = (shape_i, color_i)
    if key not in _MODELS:
        m = _Mesh()
        _car(m, SHAPES[shape_i], color_i)
        _MODELS[key] = (np.asarray(m.P, float), np.asarray(m.UV, float), np.asarray(m.T, np.int64))
    return _MODELS[key]


def _color(h):
    total = sum(w for _, w in BODY)
    acc = 0.0
    for k, (_, w) in enumerate(BODY):
        acc += w / total
        if h < acc:
            return k
    return 0


def fill_shares(rows, rings=(), classes=()):
    """Per spot row ([x, y, z, heading] curbside, [..., 1] a lot's stall): the share of such spots with a car, by the
    built share of the ground within DENSITY_R_M (rings: the buildings as drawn, (k, 2) each; classes: their class or
    use), a lot's stall near a building of BUSY_CLASSES BUSY_FILL at least; FILL's without any rings. Pure."""
    if not len(rings):
        return [FILL["lot" if len(r) > 4 else "curb"] for r in rows]
    rs = [np.asarray(r, np.float64).reshape(-1, 2) for r in rings]
    c = np.array([r.mean(0) for r in rs])
    area = np.array([abs(float(np.dot(r[:, 0], np.roll(r[:, 1], -1)) - np.dot(r[:, 1], np.roll(r[:, 0], -1)))) / 2
                     for r in rs])
    size = np.sqrt(area) / 2                    # (about a building's half width: its wall from its centre)
    busy = np.array([str(k) in BUSY_CLASSES for k in classes] + [False] * (len(rs) - len(classes)))
    out = []
    for r in rows:
        d = np.hypot(c[:, 0] - float(r[0]), c[:, 1] - float(r[1]))
        built = float(area[d <= DENSITY_R_M].sum()) / (math.pi * DENSITY_R_M ** 2)
        lo, hi = FILL_RANGE
        f = lo + (hi - lo) * min(built / DENSE_SHARE, 1.0)
        if len(r) > 4 and (busy & (d - size <= BUSY_M)).any():
            f = max(f, BUSY_FILL)
        out.append(f)
    return out


def build(rows, ground=None, fill=None):
    """Mesh (P, UV, T) of the parked cars on the spots rows, or None. ground(x, y) -> z arrays: the ground the cars
    stand on (else each spot's own z). fill: per row the share of such spots with a car (fill_shares), else FILL's."""
    cars = []
    for k, r in enumerate(rows):
        x, y, z, heading = (float(v) for v in r[:4])
        lot = len(r) > 4
        if _hash(x, y, 1) >= (fill[k] if fill is not None else FILL["lot" if lot else "curb"]):
            continue
        shape = int(_hash(x, y, 2) * len(SHAPES))
        if not lot and shape == 3 and _hash(x, y, 3) < 0.5:     # (fewer vans on the curb)
            shape = 0
        cars.append((x, y, z, math.radians(heading), shape, _color(_hash(x, y, 4))))
    if not cars:
        return None
    P, UV, T = [], [], []
    n = 0
    for x, y, z, a, shape, color in cars:
        lp, luv, lt = _model(shape, color)
        c, s = math.cos(a), math.sin(a)
        wx = x + lp[:, 0] * c - lp[:, 1] * s
        wy = y + lp[:, 0] * s + lp[:, 1] * c
        if ground is not None:      # the ground plane under the car (fitted to its corners and centre), lifted so
            hl, hw = SHAPES[shape][0] / 2, SHAPES[shape][1] / 2      # that no corner is under the ground
            fx = np.array([0.0, hl, hl, -hl, -hl])
            fy = np.array([0.0, hw, -hw, hw, -hw])
            gz = np.asarray(ground(x + fx * c - fy * s, y + fx * s + fy * c), float)
            A = np.c_[np.ones(5), fx, fy]
            k0, kf, kl = np.linalg.lstsq(A, gz, rcond=None)[0]
            k0 += float(np.max(gz - A @ np.array([k0, kf, kl])))
            base = k0 + kf * lp[:, 0] + kl * lp[:, 1] - 0.03
        else:
            base = z - 0.03
        P.append(np.c_[wx, wy, base + lp[:, 2]])
        UV.append(luv)
        T.append(lt + n)
        n += len(lp)
    return np.concatenate(P), np.concatenate(UV), np.concatenate(T)
