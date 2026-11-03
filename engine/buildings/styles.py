"""A region's style: roofs, walls, heights."""
import hashlib

import numpy as np

import fast

from .looks import ROOF_METAL, ROOF_SHINGLE, ROOF_SLATE, SIDING, STUCCO


def _hash01(*vals):
    """A number in [0, 1) from the values (stable across runs and machines)."""
    h = hashlib.blake2b(repr(vals).encode(), digest_size=8).digest()
    return int.from_bytes(h, "little") / 2.0 ** 64


# ------------------------------------------------------------------------------------------- polygons


def _area2(p):
    """Twice the signed area of the ring p (n, 2), counter-clockwise positive."""
    x, y = p[:, 0], p[:, 1]
    # np.roll(v, -1) by hand: the same arrays without roll's axis handling (~28k calls a 9-tile set)
    return float(np.dot(x, np.concatenate((y[1:], y[:1]))) - np.dot(np.concatenate((x[1:], x[:1])), y))


def clean_ring(p):
    """The ring (n, 2) without its closing point, duplicate and nearly collinear vertices, counter-clockwise;
    None if fewer than 3 are left. The simplification in Rust (earthfast.clean_ring_core: numpy's arithmetic)."""
    fast.require(76, "clean_ring_core")
    p = fast._ef.clean_ring_core(np.ascontiguousarray(np.asarray(p, np.float64)[:, :2]), float(SIMPLIFY_M), int(MAX_VERTS))
    if p is None:
        return None
    p = np.asarray(p, np.float64)
    if _area2(p) < 0:
        p = p[::-1]
    return p


def triangulate(p):
    """Ear clipping of the counter-clockwise simple ring p (n, 2): (n-2, 3) indices into p (fewer if the
    ring is not simple: the rest is left out). The Rust loop (earthfast.triangulate)."""
    fast.require(76, "triangulate")
    return np.asarray(fast._ef.triangulate(np.ascontiguousarray(np.asarray(p, np.float64)[:, :2])), np.int64)


def oriented_box(p):
    """The minimum-area rectangle around ring p along one of its edges: (centre (2,), axis u (2,) along the
    long side, half length, half width). The edge search in Rust (earthfast.oriented_box_core: the same products and
    sums, math.hypot's own rounding), the rest here as before."""
    fast.require(76, "oriented_box_core")
    best = fast._ef.oriented_box_core(np.ascontiguousarray(np.asarray(p, np.float64)[:, :2]))
    if best is None:
        raise ValueError("oriented_box: a ring without an edge")
    ux, uy, vx, vy, amin, amax, bmin, bmax = best
    sa, sb = amax + amin, bmax + bmin
    c = np.array([ux * sa / 2 + vx * sb / 2, uy * sa / 2 + vy * sb / 2])
    hl, hw = np.float64((amax - amin) / 2), np.float64((bmax - bmin) / 2)     # (numpy scalars, as before)
    u = np.array([ux, uy])
    if hw > hl:
        u, hl, hw = np.array([vx, vy]), hw, hl
    return c, u, hl, hw


# ------------------------------------------------------------------------------------------- the model


class Spec:
    """What is built for one footprint (decided by plan())."""
    __slots__ = ("ring", "floors", "floor_h", "height", "roof", "roof_mat", "facade", "band", "shop", "plain", "min_h", "wall", "door", "windows", "front", "steeple", "stoop",
                 "sign", "porch", "cls", "seed", "deck", "pitch", "portal", "gring", "names", "plates", "plate",
                 "castle")

    def __init__(self, **kw):
        for k in self.__slots__:
            setattr(self, k, kw.get(k))


class Style:
    """A region's building habits ("the other parts of the world need more love": Swiss
    villages came out as clapboard houses with porches). Shares are of buildings whose data does not say:
    brick: of facades; walls: (kind, share) for detached houses' plain walls (SIDING, STUCCO; the rest the
    plaster window sheet), wall_tints: the tint indices the plain walls take (None: all but barn red);
    paint: plaster houses painted (PAINT_TINTS); porch; flat: detached houses with flat roofs; hipped: of the
    pitched; roofs: (roof material, (tint indices)) to pick from; pitch: the roof pitch in degrees (None: PITCH);
    stone: the share of low older buildings (houses and attached ones, up to STONE_FLOORS, no shops) with dressed stone
    walls; wood: siding walls are stained wood (WOOD_TINTS, barns too); barn_red: the share of barns painted barn red
    (the US's and Scandinavia's; elsewhere their siding colours: a Lauterbrunnen garage row came out a 150 m red
    wall); attached: low attached buildings (terraces, old town
    blocks) with a pitched roof (the US: flat; Amsterdam's canal houses, Europe's old towns: gables).
    Coarse boxes by region until a facade-material map; the US ones keep their earlier behaviour."""

    def __init__(self, name, brick, walls, porch, flat, hipped, roofs, pitch=None, paint=0.3, wall_tints=None,
                 wood=False, attached=0.0, barn_red=0.0, stone=0.0):
        self.name, self.brick, self.walls, self.porch, self.flat = name, brick, walls, porch, flat
        self.barn_red, self.stone = barn_red, stone
        self.hipped, self.roofs, self.pitch, self.paint, self.wall_tints = hipped, roofs, pitch, paint, wall_tints
        self.wood, self.attached = wood, attached


_US_ROOFS = ((ROOF_SLATE, (0, 1, 2, 3)), (ROOF_SHINGLE, (0, 1, 2, 3)))
_CLAY = (ROOF_SLATE, (4, 5, 6))
_DARK = (ROOF_SLATE, (7, 8, 9))
STYLES = {
    "us_east": Style("us_east", 0.75, ((SIDING, 0.75),), 0.55, 0.0, 0.4, _US_ROOFS, barn_red=0.5),
    "us_south": Style("us_south", 0.35, ((SIDING, 0.75),), 0.55, 0.0, 0.4, _US_ROOFS, barn_red=0.5),
    "us_plains": Style("us_plains", 0.15, ((SIDING, 0.75),), 0.55, 0.0, 0.4, _US_ROOFS, barn_red=0.5),
    "us_west": Style("us_west", 0.15, ((STUCCO, 0.65), (SIDING, 0.25)), 0.25, 0.0, 0.4, _US_ROOFS, barn_red=0.5),
    # Alpine villages: white plaster ground floors, dark wooden chalets, low wide gables of dark or brown roofs
    "alpine": Style("alpine", 0.05, ((SIDING, 0.45),), 0.0, 0.03, 0.15, (_DARK, (ROOF_SLATE, (9, 5))), pitch=24.0,
                    paint=0.05, wood=True, attached=0.85, stone=0.15),
    # north-west / central Europe: brick (Low Countries, northern Germany, Britain) or plaster, steep tiled or
    # slate roofs
    "europe_north": Style("europe_north", 0.5, (), 0.02, 0.05, 0.3, (_CLAY, _DARK, (ROOF_SLATE, (5,))), pitch=42.0,
                          paint=0.15, attached=0.75, stone=0.12),
    # Scandinavia and Finland: painted wooden houses (siding), little brick, dark or tiled roofs, falu-red barns
    "nordic": Style("nordic", 0.12, ((SIDING, 0.65),), 0.0, 0.08, 0.2, (_DARK, _CLAY), pitch=35.0, paint=0.2,
                    attached=0.3, barn_red=0.7),
    "mediterranean": Style("mediterranean", 0.08, ((STUCCO, 0.85),), 0.0, 0.35, 0.5, (_CLAY,), pitch=22.0,
                           paint=0.1, wall_tints=(0, 1, 2, 3, 4, 5), attached=0.8, stone=0.4),
    "latin_america": Style("latin_america", 0.25, ((STUCCO, 0.9),), 0.02, 0.7, 0.3, (_CLAY, (ROOF_METAL, (0, 1))),
                           pitch=22.0, paint=0.0, wall_tints=(0, 1, 2, 3, 5, 6, 7, 8, 9, 10)),
    "east_asia": Style("east_asia", 0.08, ((SIDING, 0.5), (STUCCO, 0.3)), 0.0, 0.35, 0.5,
                       (_DARK, (ROOF_SHINGLE, (6, 7)), (ROOF_METAL, (1, 4))), pitch=25.0, paint=0.0,
                       wall_tints=(0, 1, 6, 5), attached=0.3),
    "oceania": Style("oceania", 0.55, ((STUCCO, 0.5), (SIDING, 0.3)), 0.25, 0.05, 0.7, (_CLAY, (ROOF_METAL, (0, 1, 4))),
                     pitch=24.0, paint=0.1),
    # South Asia (India, Pakistan, Bangladesh, Sri Lanka, Nepal): a concrete frame and brick under plaster, flat terrace
    # roofs, pastel and whitewashed walls, metal roofs on sheds (OmdevShastri)
    "south_asia": Style("south_asia", 0.08, ((STUCCO, 0.92),), 0.0, 0.94, 0.2, (_CLAY, (ROOF_METAL, (0, 1, 3))),
                        pitch=18.0, paint=0.15, wall_tints=(0, 1, 2, 3, 5, 6, 8, 10), attached=0.90),
    # elsewhere (Africa, the Middle East, ...): concrete and plaster, mostly flat roofs
    "warm": Style("warm", 0.15, ((STUCCO, 0.85),), 0.0, 0.75, 0.4, (_CLAY, (ROOF_METAL, (0, 1, 3))), pitch=20.0,
                  paint=0.0, wall_tints=(0, 1, 2, 3, 4, 5, 6, 8)),
    "cool": Style("cool", 0.3, ((SIDING, 0.4),), 0.05, 0.1, 0.3, (_DARK, (ROOF_METAL, (0, 1, 2, 3))), pitch=30.0,
                  paint=0.3, barn_red=0.5),
}


def region_style(lat, lon):
    """The Style of the region around (lat, lon) (None: the US East's)."""
    if lat is None or lon is None:
        return STYLES["us_east"]
    if 24.0 <= lat <= 72.0 and -170.0 <= lon <= -52.0:          # North America (and Canada)
        if lon < -100.0:
            return STYLES["us_west"]
        if lon <= -95.0:
            return STYLES["us_plains"]
        return STYLES["us_east"] if lat > 36.0 else STYLES["us_south"]
    if -56.0 <= lat < 24.0 and -120.0 <= lon <= -30.0:          # Mexico, the Caribbean, Central and South America
        return STYLES["latin_america"]
    if 45.4 <= lat <= 48.0 and 5.8 <= lon <= 16.5:              # the Alps
        return STYLES["alpine"]
    if 56.0 <= lat <= 72.0 and 4.5 <= lon <= 32.0:              # Norway, Sweden, Finland (brick Copenhagen, Malmo: not)
        return STYLES["nordic"]
    if 46.0 <= lat <= 72.0 and -11.0 <= lon <= 32.0:
        return STYLES["europe_north"]
    if 30.0 <= lat < 46.0 and -10.0 <= lon <= 40.0:             # southern Europe, North Africa's coast, Levant
        return STYLES["mediterranean"]
    if 20.0 <= lat <= 46.0 and 100.0 <= lon <= 146.0:           # China, Korea, Japan, Taiwan
        return STYLES["east_asia"]
    if -50.0 <= lat <= -10.0 and 110.0 <= lon <= 180.0:         # Australia, New Zealand
        return STYLES["oceania"]
    if 6.0 <= lat <= 37.5 and 68.0 <= lon <= 92.5:              # South Asia (not Myanmar, east of 92.5)
        return STYLES["south_asia"]
    if abs(lat) >= 50.0:
        return STYLES["cool"]
    return STYLES["warm"]


def brick_share(lat, lon):
    """The share of brick facades in a region (old East Coast / Midwest towns are mostly brick; the South and
    the West plaster, siding and stucco; region_style elsewhere). A coarse stand-in until a facade-material map."""
    if lat is None:
        return 0.4
    return region_style(lat, lon).brick


def roof_pitch(spec):
    """The roof pitch (degrees) of a Spec: its region's, else PITCH."""
    return spec.pitch or PITCH.get(spec.roof, PITCH["gabled"])


ALPINE_HUT_M2 = 120.0        # an isolated building this small above the tree line (a summit shelter, a mountain hut) ...
ALPINE_COVER = 0.02          # ... in a tile this empty gets dressed stone walls (Mount Whitney's
                             # stone summit hut was a plain grey box)


def tree_line_m(lat):
    """A rough tree line (m) by latitude: ~3,600 m to 32 deg, falling ~110 m per degree (the Alps at 46 deg ~2,050 m,
    Scandinavia at 60 deg ~520 m), sea level towards 70 deg. Pure."""
    return max(0.0, 3600.0 - 110.0 * max(0.0, abs(float(lat)) - 32.0))


# (read inside functions only; here so that the parts can load each other)
from .looks import MAX_VERTS, PITCH, SIMPLIFY_M  # noqa: E402
