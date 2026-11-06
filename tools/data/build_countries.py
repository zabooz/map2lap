"""build_countries.py <folder>: the world's countries and the United States' states from Natural Earth (public domain) into
engine/countries.npz, for borders.py: which country a track lies in, without asking anyone. <folder> holds the 1:10m GeoJSON files
(https://github.com/nvkelso/natural-earth-vector, geojson/):

    ne_10m_admin_0_countries.geojson        the countries (ISO_A2_EH: France's and Norway's ISO_A2 say -99)
    ne_10m_admin_1_states_provinces.geojson the states of the US only: nothing else asks for a state (furniture.lamp_region)

Saved: per ring its code's number and its first point, all points as float32 (lon, lat): about a metre of rounding. A place Natural
Earth gives no code (-99: Somaliland, Northern Cyprus ...) has no ring: borders.at finds no country there."""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "engine", "countries.npz")


def rings_of(geometry):
    """Every ring of a GeoJSON Polygon or MultiPolygon, holes too (borders.at counts crossings: a hole falls out by itself). Pure."""
    polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    return [ring for polygon in polygons for ring in polygon]


def pack(features):
    """{"codes", "ring_code", "ring_start", "points"} from [(code, geometry)]. Pure."""
    codes = sorted({code for code, _ in features})
    ring_code, ring_start, points = [], [0], []
    for code, geometry in features:
        for ring in rings_of(geometry):
            ring_code.append(codes.index(code))
            points.extend(p[:2] for p in ring)
            ring_start.append(len(points))
    return {"codes": np.array(codes), "ring_code": np.array(ring_code, np.int32), "ring_start": np.array(ring_start, np.int32),
            "points": np.array(points, np.float32)}


def main(folder):
    with open(os.path.join(folder, "ne_10m_admin_0_countries.geojson"), encoding="utf-8") as f:
        countries = [(x["properties"]["ISO_A2_EH"], x["geometry"]) for x in json.load(f)["features"]]
    countries = [(code, g) for code, g in countries if code != "-99"]
    with open(os.path.join(folder, "ne_10m_admin_1_states_provinces.geojson"), encoding="utf-8") as f:
        states = [(x["properties"]["iso_3166_2"], x["geometry"]) for x in json.load(f)["features"]
                  if x["properties"].get("iso_a2") == "US"]
    a, b = pack(countries), pack(states)
    np.savez_compressed(OUT, **a, **{f"state_{k}": v for k, v in b.items()})
    print(f"{len(a['codes'])} countries, {len(a['ring_code'])} rings, {len(a['points'])} points; {len(b['codes'])} states; "
          f"{os.path.getsize(OUT) // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1])
