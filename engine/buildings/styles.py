"""A region's style: roofs, walls, heights."""
import json
import math
from pathlib import Path

import numpy as np

import borders
import climate
import fast

from .facade import FacadePattern
from .looks import BARN_REDS, MAX_VERTS, PITCH, ROOF_TINTS, SIDING, SIMPLIFY_M, WALL_TINTS


# ------------------------------------------------------------------------------------------- polygons


def _area2(p):
    """Twice the signed area of the ring p (n, 2), counter-clockwise positive."""
    x, y = p[:, 0], p[:, 1]
    # np.roll(v, -1) by hand: the same arrays without roll's axis handling (~28k calls a 9-tile set)
    return float(np.dot(x, np.concatenate((y[1:], y[:1]))) - np.dot(np.concatenate((x[1:], x[:1])), y))


def round_storage_ring(ring):
    """Whether a mapped ring describes a round tank/silo rather than a rectangular building. Pure."""
    if len(ring) < 8:
        return False
    r = np.linalg.norm(ring - np.mean(ring, axis=0), axis=1)
    edges = np.roll(ring, -1, axis=0) - ring
    turns = edges[:, 0] * np.roll(edges[:, 1], -1) - edges[:, 1] * np.roll(edges[:, 0], -1)
    # Allow survey/outline simplification noise, but not elongated tanks or concave compounds.
    return bool(np.min(r) > .9 * np.max(r) and np.all(turns >= -1e-6))


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

def roof_box(ring, direction=None, orientation=None):
    """Roof frame around the drawn rectangle; bearing clockwise from north. Pure.
    Explicit bearing wins over along/across; the wall footprint itself never rotates."""
    c, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    if direction is not None and np.isfinite(direction) and 0 <= direction < 360:
        corners = np.array([c + u * s * hl + v * t * hw for s, t in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
        angle = np.radians(direction)
        u = np.array([np.sin(angle), np.cos(angle)])
        v = np.array([-u[1], u[0]])
        hl, hw = np.max(np.abs((corners - c) @ u)), np.max(np.abs((corners - c) @ v))
    elif orientation == "across":
        u, hl, hw = v, hw, hl
    return c, u, hl, hw


def skillion_axis(ring, direction=None, orientation=None):
    """Downhill unit vector and full wall-to-wall span of a single-pitch roof. Pure.
    For a roof without a ridge, the direction follows runoff (OSM roof:direction)."""
    _, u, hl, hw = oriented_box(ring)
    v = np.array([-u[1], u[0]])
    if direction is not None:
        angle = np.radians(direction)
        down = np.array([np.sin(angle), np.cos(angle)])
    else:
        down = u if orientation == "across" else v
    return down, 2 * (abs(float(down @ u)) * hl + abs(float(down @ v)) * hw)


class Spec:
    """What is built for one footprint (decided by plan())."""
    __slots__ = ("ring", "floors", "floor_h", "height", "roof", "roof_mat", "facade", "band", "shop", "plain", "min_h", "wall", "house", "door", "windows", "front", "steeple", "stoop",
                 "sign", "porch", "cls", "seed", "deck", "pitch", "portal", "gring", "names", "plates", "plate",
                 "castle", "toll", "architecture", "facade_pattern", "roof_height", "roof_direction", "roof_orientation", "paired_home")

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
    gas_station_kit, us_special and shutters control regional assets independently of the style name.
    The style values live in styles.json; mapped building facts take precedence."""

    def __init__(self, name, brick, walls, porch, flat, hipped, roofs, pitch=None, paint=0.3, wall_tints=None,
                 wood=False, attached=0.0, barn_red=0.0, stone=0.0, facade_pattern=None,
                 gas_station_kit="default", us_special=False, shutters=False):
        self.name, self.brick, self.walls, self.porch, self.flat = name, brick, walls, porch, flat
        self.barn_red, self.stone = barn_red, stone
        self.hipped, self.roofs, self.pitch, self.paint, self.wall_tints = hipped, roofs, pitch, paint, wall_tints
        self.wood, self.attached = wood, attached
        self.facade_pattern = facade_pattern
        self.gas_station_kit, self.us_special, self.shutters = gas_station_kit, us_special, shutters


STYLE_FILE = Path(__file__).with_name("styles.json")
_STYLE_FIELDS = frozenset(("brick", "walls", "porch", "flat", "hipped", "roofs", "pitch", "paint",
                           "wall_tints", "wood", "attached", "barn_red", "stone", "facade_pattern",
                           "gas_station_kit", "us_special", "shutters"))
_SHARE_FIELDS = ("brick", "porch", "flat", "hipped", "paint", "attached", "barn_red", "stone")


def _share(value, where):
    """A finite fraction in [0, 1]; where names its source field. Pure."""
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 1:
        raise ValueError(f"{where}: expected a share from 0 to 1")
    return value


def _tints(value, material, where):
    """Nonempty tint indices for a known material. Pure."""
    palette = ROOF_TINTS.get(material, WALL_TINTS.get(material))
    if palette is None or not isinstance(value, list) or not value or any(
            isinstance(v, bool) or not isinstance(v, int) or not 0 <= v < len(palette) for v in value):
        raise ValueError(f"{where}: expected tint indices for {material}")
    return tuple(value)


def _style(name, raw):
    """Validate one named style record and retain the tuple shapes Style consumers use. Pure."""
    if not isinstance(raw, dict):
        raise ValueError(f"style {name}: expected an object")
    unknown, missing = raw.keys() - _STYLE_FIELDS, _STYLE_FIELDS - raw.keys()
    if unknown or missing:
        raise ValueError(f"style {name}: unknown {sorted(unknown)}; missing {sorted(missing)}")
    for field in _SHARE_FIELDS:
        _share(raw[field], f"style {name}.{field}")
    walls = raw["walls"]
    if not isinstance(walls, list):
        raise ValueError(f"style {name}.walls: expected a list")
    for item in walls:
        if not isinstance(item, list) or len(item) != 2 or not isinstance(item[0], str) or item[0] not in WALL_TINTS:
            raise ValueError(f"style {name}.walls: expected [known material, share]")
        _share(item[1], f"style {name}.walls")
    if sum(item[1] for item in walls) > 1:
        raise ValueError(f"style {name}.walls: shares exceed 1")
    roofs = raw["roofs"]
    if not isinstance(roofs, list) or not roofs:
        raise ValueError(f"style {name}.roofs: expected a nonempty list")
    for item in roofs:
        if not isinstance(item, list) or len(item) != 2 or not isinstance(item[0], str) or item[0] not in ROOF_TINTS:
            raise ValueError(f"style {name}.roofs: expected [known material, tint indices]")
        _tints(item[1], item[0], f"style {name}.roofs")
    if raw["pitch"] is not None and (isinstance(raw["pitch"], bool) or not isinstance(raw["pitch"], (int, float))
                                     or not math.isfinite(raw["pitch"]) or not 0 < raw["pitch"] <= 90):
        raise ValueError(f"style {name}.pitch: expected degrees from 0 to 90")
    if not isinstance(raw["wood"], bool):
        raise ValueError(f"style {name}.wood: expected true or false")
    if raw["gas_station_kit"] not in ("europe", "us_east", "default"):
        raise ValueError(f"style {name}.gas_station_kit: expected europe, us_east or default")
    for field in ("us_special", "shutters"):
        if not isinstance(raw[field], bool):
            raise ValueError(f"style {name}.{field}: expected true or false")
    tints = raw["wall_tints"]
    palette_size = max((len(WALL_TINTS[m]) - (BARN_REDS if m == SIDING else 0) for m, _ in walls), default=0)
    if tints is not None and (not isinstance(tints, list) or not tints or any(
            isinstance(v, bool) or not isinstance(v, int) or not 0 <= v < palette_size for v in tints)):
        raise ValueError(f"style {name}.wall_tints: invalid tint index")
    pattern = raw["facade_pattern"]
    if pattern is not None:
        if not isinstance(pattern, dict):
            raise ValueError(f"style {name}.facade_pattern: expected an object")
        try:
            pattern = FacadePattern(**pattern)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"style {name}.facade_pattern: {exc}") from exc
    return Style(name, raw["brick"], tuple((m, v) for m, v in walls), raw["porch"], raw["flat"], raw["hipped"],
                 tuple((m, _tints(t, m, f"style {name}.roofs")) for m, t in roofs), pitch=raw["pitch"],
                 paint=raw["paint"], wall_tints=tuple(tints) if tints is not None else None, wood=raw["wood"],
                 attached=raw["attached"], barn_red=raw["barn_red"], stone=raw["stone"], facade_pattern=pattern,
                 gas_station_kit=raw["gas_station_kit"], us_special=raw["us_special"], shutters=raw["shutters"])


def _fields(raw, fields, where):
    """Require exactly fields on a JSON object at where. Pure."""
    if not isinstance(raw, dict):
        raise ValueError(f"{where}: expected an object")
    unknown, missing = raw.keys() - fields, fields - raw.keys()
    if unknown or missing:
        raise ValueError(f"{where}: unknown {sorted(unknown)}; missing {sorted(missing)}")


def _countries(raw, where):
    """Unique two-letter ISO country codes from raw. Pure."""
    if not isinstance(raw, list) or any(not isinstance(c, str) or len(c) != 2 or not c.isascii() or not c.isupper()
                                        for c in raw) or len(set(raw)) != len(raw):
        raise ValueError(f"{where}: expected unique ISO country codes")
    return frozenset(raw)


def _classes(raw, where):
    """Unique Köppen class numbers 1..30 from raw. Pure."""
    if not isinstance(raw, list) or any(isinstance(k, bool) or not isinstance(k, int) or not 1 <= k <= 30
                                        for k in raw) or len(set(raw)) != len(raw):
        raise ValueError(f"{where}: expected unique Köppen classes 1..30")
    return frozenset(raw)


def _bounds(raw, where):
    """Validated exclusive latitude/longitude bounds in degrees for one country rule. Pure."""
    allowed = {"min_lat", "max_lat", "min_lon", "max_lon"}
    if not isinstance(raw, dict) or not raw or raw.keys() - allowed:
        raise ValueError(f"{where}: expected one or more latitude/longitude bounds")
    for field, value in raw.items():
        limit = 90 if field.endswith("lat") else 180
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not -limit <= value <= limit:
            raise ValueError(f"{where}.{field}: expected degrees from {-limit} to {limit}")
    for axis in ("lat", "lon"):
        if f"min_{axis}" in raw and f"max_{axis}" in raw and raw[f"min_{axis}"] >= raw[f"max_{axis}"]:
            raise ValueError(f"{where}: min_{axis} must be below max_{axis}")
    return raw


def _within_bounds(bounds, lat, lon):
    """Whether (lat, lon) is strictly inside each bound supplied by a country rule. Pure."""
    return (lat > bounds.get("min_lat", -math.inf) and lat < bounds.get("max_lat", math.inf) and
            lon > bounds.get("min_lon", -math.inf) and lon < bounds.get("max_lon", math.inf))


def _country_splits(raw, countries, styles):
    """Ordered within-country style rules with validated coordinates and style references. Pure."""
    if not isinstance(raw, list):
        raise ValueError("regions.country_splits: expected a list")
    out = []
    for i, rule in enumerate(raw):
        where = f"regions.country_splits[{i}]"
        if not isinstance(rule, dict) or rule.keys() - {"country", "style", "min_lat", "max_lat", "min_lon", "max_lon"}:
            raise ValueError(f"{where}: expected country, style and latitude/longitude bounds")
        if "country" not in rule or "style" not in rule:
            raise ValueError(f"{where}: missing country or style")
        country, style = rule["country"], rule["style"]
        _countries([country], f"{where}.country")
        if country not in countries:
            raise ValueError(f"{where}.country: {country} has no country default")
        if not isinstance(style, str) or style not in styles:
            raise ValueError(f"{where}.style: unknown style {style}")
        bounds = _bounds({k: v for k, v in rule.items() if k not in ("country", "style")}, where)
        out.append((country, style, bounds))
    return tuple(out)


def _region_rules(raw, styles):
    """Validated country, climate and altitude assignments referring to known styles. Pure."""
    where = "regions"
    _fields(raw, {"countries", "alpine", "country_splits", "mediterranean_climate_countries",
                  "mediterranean_climate_classes", "us_zones", "climate_fallback"}, where)
    countries = raw["countries"]
    if not isinstance(countries, dict):
        raise ValueError("regions.countries: expected an object")
    for code, style in countries.items():
        _countries([code], f"regions.countries.{code}")
        if not isinstance(style, str) or style not in styles:
            raise ValueError(f"regions.countries.{code}: unknown style {style}")
    alpine = raw["alpine"]
    _fields(alpine, {"name", "countries", "min_elevation_m", "bounds"}, "regions.alpine")
    if alpine["name"] != "Alpenbogen":
        raise ValueError("regions.alpine.name: expected Alpenbogen")
    alpine_countries = _countries(alpine["countries"], "regions.alpine.countries")
    arc_bounds = _bounds(alpine["bounds"], "regions.alpine.bounds")
    if set(arc_bounds) != {"min_lat", "max_lat", "min_lon", "max_lon"}:
        raise ValueError("regions.alpine.bounds: expected south, north, west and east bounds")
    height = alpine["min_elevation_m"]
    # Above 700 m in Alpine countries, cold winters and short growing seasons favour steep chalet roofs; a high
    # plastered town such as Davos can still be misclassified without local architectural data.
    if isinstance(height, bool) or not isinstance(height, (int, float)) or not math.isfinite(height) or not 0 <= height <= 9000:
        raise ValueError("regions.alpine.min_elevation_m: expected metres from 0 to 9000")
    splits = _country_splits(raw["country_splits"], countries, styles)
    med_countries = _countries(raw["mediterranean_climate_countries"], "regions.mediterranean_climate_countries")
    med_classes = _classes(raw["mediterranean_climate_classes"], "regions.mediterranean_climate_classes")
    us = raw["us_zones"]
    _fields(us, {"countries", "west_lon", "plains_lon", "south_lat", "min_lat", "max_lat", "min_lon", "max_lon"},
            "regions.us_zones")
    us_countries = _countries(us["countries"], "regions.us_zones.countries")
    for field, low, high in (("west_lon", -180, 180), ("plains_lon", -180, 180), ("south_lat", -90, 90),
                             ("min_lat", -90, 90), ("max_lat", -90, 90), ("min_lon", -180, 180),
                             ("max_lon", -180, 180)):
        value = us[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
            raise ValueError(f"regions.us_zones.{field}: expected {low}..{high}")
    if us["west_lon"] >= us["plains_lon"] or us["min_lat"] >= us["max_lat"] or us["min_lon"] >= us["max_lon"]:
        raise ValueError("regions.us_zones: bounds must run west to east and south to north")
    fallback = raw["climate_fallback"]
    _fields(fallback, {"cool_classes", "cool_style", "default"}, "regions.climate_fallback")
    cool_classes = _classes(fallback["cool_classes"], "regions.climate_fallback.cool_classes")
    for field in ("cool_style", "default"):
        if fallback[field] not in styles:
            raise ValueError(f"regions.climate_fallback.{field}: unknown style {fallback[field]}")
    for name in ("alpine", "mediterranean", "us_east", "us_south", "us_plains", "us_west"):
        if name not in styles:
            raise ValueError(f"regions: missing referenced style {name}")
    return {"countries": countries, "alpine_countries": alpine_countries,
            "alpine_bounds": arc_bounds, "country_splits": splits,
            "alpine_height": height, "med_countries": med_countries, "med_classes": med_classes,
            "us_countries": us_countries, "us": us, "cool_classes": cool_classes,
            "cool_style": fallback["cool_style"], "default": fallback["default"]}


def _unique_pairs(pairs):
    """JSON object with no silently overwritten duplicate field. Pure."""
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate field {key}")
        out[key] = value
    return out


def load_style_data(path):
    """Validated (styles, region rules) from JSON path; invalid files fail with their field name."""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"), object_pairs_hook=_unique_pairs)
    except (OSError, ValueError) as exc:
        raise ValueError(f"{path}: {exc}") from exc
    _fields(data, {"styles", "regions"}, str(path))
    if not isinstance(data["styles"], dict):
        raise ValueError(f"{path}: styles must be an object")
    if not data["styles"]:
        raise ValueError(f"{path}: styles must not be empty")
    styles = {name: _style(name, raw) for name, raw in data["styles"].items()}
    return styles, _region_rules(data["regions"], styles)


STYLES, REGIONS = load_style_data(STYLE_FILE)


def region_style(lat, lon, elevation_m=None):
    """The Style at (lat, lon) and optional ground elevation_m; coordinates absent use the synthetic US default."""
    if lat is None or lon is None:
        return STYLES["us_east"]
    country, _state = borders.at(lat, lon)
    us = REGIONS["us"]
    if country in REGIONS["us_countries"] and us["min_lat"] <= lat <= us["max_lat"] and \
            us["min_lon"] <= lon <= us["max_lon"]:
        # These three boundaries are the earlier US/Canada style rule, retained so the four existing zones do
        # not change in this migration. They are compatibility lines, not physical climate boundaries.
        if lon < us["west_lon"]:
            return STYLES["us_west"]
        if lon <= us["plains_lon"]:
            return STYLES["us_plains"]
        return STYLES["us_east"] if lat > us["south_lat"] else STYLES["us_south"]
    if country in REGIONS["alpine_countries"] and _within_bounds(REGIONS["alpine_bounds"], lat, lon) and (
            elevation_m is not None and np.isfinite(elevation_m) and elevation_m >= REGIONS["alpine_height"]):
        # At 700 m Alpine villages have long-lasting snow and pitched roofs. The coarse Alpine arc keeps the
        # Massif Central, Pyrenees, Apennines and northern uplands out, but overlaps parts of the Swiss Jura and
        # can still include high plastered towns such as Davos; a precise mountain polygon would separate them.
        return STYLES["alpine"]
    # Germany north of 52 N has more exposed brick than the south; the line cuts mixed towns near Kassel.
    # East of 11.5 E, Berlin's plastered houses differ from Hannover's brick belt; Mecklenburg east of this
    # line still has brick villages, so the east/west split is only a coarse regional proxy.
    # France north of 45.5 N tends to pale render, stone and darker roofs; Limoges and Brive straddle a broad
    # transition, not a sharp architectural border, and western coastal towns may differ.
    # Italy north of 44 N includes the ochre Po plain; the latitude also catches Liguria's different coast.
    # Italy south of 41.5 N has more pale walls and flat roofs; Rome sits just north, while island towns vary.
    for split_country, style, bounds in REGIONS["country_splits"]:
        if country == split_country and _within_bounds(bounds, lat, lon):
            return STYLES[style]
    climate_class = climate.koppen_at(lat, lon)
    if country in REGIONS["med_countries"] and climate_class in REGIONS["med_classes"]:
        # Köppen dry-summer climates pick the tiled Mediterranean look on the same country's warm coast.
        return STYLES["mediterranean"]
    name = REGIONS["countries"].get(country)
    if name is None:                        # open sea and an unlisted country both have a climate fallback
        name = REGIONS["cool_style"] if climate_class in REGIONS["cool_classes"] else REGIONS["default"]
    return STYLES[name]


def brick_share(lat, lon, elevation_m=None):
    """The share of brick facades in a region (old East Coast / Midwest towns are mostly brick; the South and
    the West plaster, siding and stucco; region_style elsewhere). A coarse stand-in until a facade-material map."""
    if lat is None:
        return 0.4
    return region_style(lat, lon, elevation_m).brick


def roof_pitch(spec):
    """The roof pitch (degrees) of a Spec: its region's, else PITCH."""
    return spec.pitch or PITCH.get(spec.roof, PITCH["gabled"])


def shed_count(span):
    """Number of repeated roof bays across span metres. Pure."""
    # A 6 m nominal structural bay is an appearance default without mapped spacing; cap repetition for mesh cost.
    return max(2, min(8, round(span / 6.)))


def tree_line_m(lat):
    """A rough tree line (m) by latitude: ~3,600 m to 32 deg, falling ~110 m per degree (the Alps at 46 deg ~2,050 m,
    Scandinavia at 60 deg ~520 m), sea level towards 70 deg. Pure."""
    return max(0.0, 3600.0 - 110.0 * max(0.0, abs(float(lat)) - 32.0))
