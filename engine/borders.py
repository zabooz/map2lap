"""Which country a place lies in, from Natural Earth's borders (countries.npz, tools/data/build_countries.py): what a build's road
rules fall back on when Nominatim can't say (generator.country_at). Natural Earth draws a coast or a border to some hundred metres
or more at this scale, so a place just outside every country counts for the nearest within COAST_M.
"""
import functools
import math
import os

import numpy as np

FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "countries.npz")
COAST_M = 5000.0            # a pier, a small island the map leaves out; further out a track lies at sea, in no country
M_PER_DEGREE = 111320.0


@functools.lru_cache(maxsize=1)
def _load():
    """(countries, states), each (codes, [ring's points (n, 2) as lon, lat], ring's code number, rings' boxes (m, 4))."""
    d = np.load(FILE)

    def part(prefix):
        points, start = d[f"{prefix}points"], d[f"{prefix}ring_start"]
        rings = [points[a:b].astype(np.float64) for a, b in zip(start[:-1], start[1:])]
        boxes = np.array([(r[:, 0].min(), r[:, 1].min(), r[:, 0].max(), r[:, 1].max()) for r in rings])
        return [str(c) for c in d[f"{prefix}codes"]], rings, d[f"{prefix}ring_code"], boxes
    return part(""), part("state_")


def _crossings(ring, lon, lat):
    """How often a line from the point eastwards crosses the ring. Pure."""
    a, b = ring[:-1], ring[1:]
    spans = (a[:, 1] > lat) != (b[:, 1] > lat)
    x = a[spans, 0] + (lat - a[spans, 1]) / (b[spans, 1] - a[spans, 1]) * (b[spans, 0] - a[spans, 0])
    return int((x > lon).sum())


def _distance_m(ring, lon, lat):
    """The point's distance from the ring in metres, on a flat earth around it (near a coast that is exact enough). Pure."""
    scale = np.array([M_PER_DEGREE * math.cos(math.radians(lat)), M_PER_DEGREE])
    p = (ring - (lon, lat)) * scale
    a, b = p[:-1], p[1:]
    ab = b - a
    t = np.clip(-(a * ab).sum(axis=1) / np.maximum((ab * ab).sum(axis=1), 1e-9), 0.0, 1.0)
    return float(np.hypot(*(a + ab * t[:, None]).T).min())


def _find(part, lon, lat):
    """The code of the area of part around the point, else of the nearest within COAST_M, else None. Pure but for its table."""
    codes, rings, ring_code, boxes = part
    inside = np.flatnonzero((boxes[:, 0] <= lon) & (boxes[:, 2] >= lon)
                            & (boxes[:, 1] <= lat) & (boxes[:, 3] >= lat))
    crossed = {}
    for k in inside:
        crossed[ring_code[k]] = crossed.get(ring_code[k], 0) + _crossings(rings[k], lon, lat)
    for code, n in crossed.items():
        if n % 2:
            return codes[code]
    margin_lat = COAST_M / M_PER_DEGREE
    margin_lon = margin_lat / max(0.01, math.cos(math.radians(lat)))
    near = np.flatnonzero((boxes[:, 0] - margin_lon <= lon) & (boxes[:, 2] + margin_lon >= lon)
                          & (boxes[:, 1] - margin_lat <= lat) & (boxes[:, 3] + margin_lat >= lat))
    best, best_m = None, COAST_M
    for k in near:
        d = _distance_m(rings[k], lon, lat)
        if d < best_m:
            best, best_m = codes[ring_code[k]], d
    return best


def at(lat, lon):
    """(ISO country code, the state's ISO 3166-2 in the US, else None) at the place; (None, None) out at sea, or on land Natural
    Earth gives no code."""
    countries, states = _load()
    country = _find(countries, lon, lat)
    return country, _find(states, lon, lat) if country == "US" else None
