"""Route -> AC track: get the route from OSRM, build the tiles in the corridor (BeamNG.Earth), OBJ, the track folder
in AC and the .kn5 with our own writer (obj_to_kn5.py, start at the beginning of the route). Drivable right away.

    python src/generator.py --name test_route --width 100 46.6624,14.6345 46.6580,14.6500
"""
import argparse
import glob
import json
import math
import os
import re
import shutil
import threading
import time
import urllib.parse
import urllib.request
from concurrent.futures import as_completed

import numpy as np

from track import build_tiles     # (first: sets the asphalt mesh switches and the server path)
from app import debugapp, mapcache, mytracks, settings, version
from app.paths import ROOT
from scenery import farview, gates
from track import make_obj, make_track_folder, obj_to_kn5, parallel

blockworker = build_tiles.blockworker
roadsmod = build_tiles.roadsmod
import furniture            # noqa: E402  (from the BeamNG.Earth server, path from build_tiles)
import geodesy              # noqa: E402
import navgraph             # noqa: E402

OSRM = "https://router.project-osrm.org/route/v1/driving/"
NOMINATIM = "https://nominatim.openstreetmap.org/"
SAMPLE_M = 20.0             # m: spacing of the route points for choosing the tiles
MAX_ROUTE_M = 500000.0      # beyond ~50 km from the anchor float32 gets coarse in AC (cm)
WARN_TILES = 150
# Point-to-point timing (obj_to_kn5.ab_gates): the start line this far after the start pin (flying start), the
# finish line this far after the end pin on the same road, run-off behind it (built too). When start and finish are
# closer than LOOP_M it is a circuit: the lap line stays there.
START_LINE_M, FINISH_AFTER_M, RUNOUT_M, LOOP_M = 100.0, 50.0, 100.0, 100.0
# Progress phases (build(progress=...), shown by the generator page): route, road tiles, terrain/trees/houses
# (make_obj), distant view (farview), kn5, tidying up (map data cache, temporary data)
PHASES = ("route", "tiles", "scenery", "distant", "kn5", "clean")


def slug(name):
    s = re.sub(r"[^a-z0-9_]+", "_", name.lower()).strip("_")
    return s or "route"


def route(points):
    """OSRM route through points [(lat, lon), ...]: (coordinates [(lat, lon)], length m)."""
    coords = ";".join(f"{lon:.6f},{lat:.6f}" for lat, lon in points)
    req = urllib.request.Request(OSRM + coords + "?overview=full&geometries=geojson",
                                 headers={"User-Agent": version.USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    if data.get("code") != "Ok" or not data.get("routes"):
        raise RuntimeError(f"OSRM: {data.get('code')} {data.get('message', '')}")
    rt = data["routes"][0]
    return [(lat, lon) for lon, lat in rt["geometry"]["coordinates"]], float(rt["distance"])


def extend(pts, ahead=FINISH_AFTER_M + RUNOUT_M):
    """The route beyond the end pin on the same road: OSRM from the end to a point ahead m straight on (direction of the
    last ~30 m). Only if that stays short and doesn't turn back (else the road turns off or ends); returns the points
    beyond [(lat, lon)], [] if not."""
    la1, lo1 = pts[-1]
    m_lat, m_lon = 111320.0, 111320.0 * math.cos(math.radians(la1))
    for la0, lo0 in reversed(pts[:-1]):
        dx, dy = (lo1 - lo0) * m_lon, (la1 - la0) * m_lat
        if math.hypot(dx, dy) >= 30.0:
            break
    n = math.hypot(dx, dy)
    if n < 1.0:
        return []
    ux, uy = dx / n, dy / n
    try:
        ext, dist = route([(la1, lo1), (la1 + uy * ahead / m_lat, lo1 + ux * ahead / m_lon)])
    except Exception:
        return []
    if dist > 1.4 * ahead or len(ext) < 2:
        return []
    k = next((i for i, (la, lo) in enumerate(ext) if math.hypot((lo - lo1) * m_lon, (la - la1) * m_lat) >= 15.0),
             len(ext) - 1)
    fx, fy = (ext[k][1] - lo1) * m_lon, (ext[k][0] - la1) * m_lat
    if (fx * ux + fy * uy) / max(1e-9, math.hypot(fx, fy)) < 0.5:     # (turns back or turns sharply)
        return []
    return ext[1:]


_places, _countries, _codes, _asked, _ask_lock = {}, {}, {}, [0.0], threading.Lock()


def place(lat, lon):
    """(town, district) at (lat, lon) from Nominatim (OpenStreetMap), asked once per point and at most one request per
    second (Nominatim's usage policy); a missing one: None."""
    key = (round(lat, 3), round(lon, 3))
    with _ask_lock:
        if key not in _places:
            time.sleep(max(0.0, _asked[0] + 1.0 - time.time()))
            q = urllib.parse.urlencode({"format": "jsonv2", "lat": f"{lat:.6f}", "lon": f"{lon:.6f}", "zoom": 14})
            req = urllib.request.Request(f"{NOMINATIM}reverse?{q}", headers={"User-Agent": version.USER_AGENT})
            try:
                with urllib.request.urlopen(req, timeout=10) as r:
                    a = json.load(r).get("address", {})
            finally:
                _asked[0] = time.time()
            town = next((a[k] for k in ("city", "town", "village", "municipality", "county") if k in a), None)
            part = next((a[k] for k in ("suburb", "city_district", "quarter", "hamlet") if a.get(k, town) != town), None)
            _places[key] = (town, part)
            _countries[key] = a.get("country")
            _codes[key] = ((a.get("country_code") or "").upper() or None, a.get("ISO3166-2-lvl4"))
        return _places[key]


def road_rules(lat, lon):
    """BeamNG.Earth's road rules at the anchor from its country (ISO code from Nominatim, as place()): driving on the
    left, limits in mph, the share of low-voltage lines underground (fewer poles), the street lamps' spacing and the
    country itself (road markings, speed-limit sign faces). Unknown (Nominatim not reachable): the rules used before
    2026-10-31 (right-hand traffic, km/h)."""
    try:
        place(lat, lon)
        country, region = _codes.get((round(lat, 3), round(lon, 3)), (None, None))
    except Exception:
        country = region = None
    if country is None:
        return {"country": None, "left_hand": False, "mph": False, "buried": 0.0, "lamp_region": None}
    r = navgraph.road_rules(country)
    return {"country": country, "left_hand": bool(r["rightHandDrive"]), "mph": bool(r["mph"]),
            "buried": float(furniture.buried_share(country)), "lamp_region": furniture.lamp_region(country, region)}


def search(text):
    """Places for a search on the generator page (Nominatim, typed text sent on Enter: the usage policy forbids
    search-as-you-type): [{"name", "lat", "lon"}, ...], at most 5."""
    q = urllib.parse.urlencode({"format": "jsonv2", "q": text, "limit": 5})
    req = urllib.request.Request(f"{NOMINATIM}search?{q}", headers={"User-Agent": version.USER_AGENT})
    with _ask_lock:
        time.sleep(max(0.0, _asked[0] + 1.0 - time.time()))
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                found = json.load(r)
        finally:
            _asked[0] = time.time()
    return [{"name": f["display_name"], "lat": float(f["lat"]), "lon": float(f["lon"])} for f in found]


def where(lat, lon):
    """(town, country) at (lat, lon) for ui_track.json (Content Manager shows them); empty when Nominatim can't be
    reached."""
    try:
        town, _ = place(lat, lon)
    except Exception:
        return "", ""
    return town or "", _countries.get((round(lat, 3), round(lon, 3))) or ""


def auto_title(points=None, area=None):
    """Track name from the places: route "Start – Finish" (within one town "Town District – District"), area
    "Town District" of its centre."""
    if area:
        town, part = place((area[0] + area[2]) / 2, (area[1] + area[3]) / 2)
        return " ".join(x for x in (town, part) if x) or "Area"
    (t0, p0), (t1, p1) = place(*points[0]), place(*points[-1])
    if t0 != t1:
        return " – ".join(x for x in (t0, t1) if x) or "Route"
    if p0 and p1 and p0 != p1:
        return f"{t0} {p0} – {p1}"
    return " ".join(x for x in (t0, p0 or p1) if x) or "Route"


def resample(xy, step):
    """Polyline (n, 2) as points step apart (end included)."""
    seg = np.linalg.norm(np.diff(xy, axis=0), axis=1)
    s = np.r_[0.0, np.cumsum(seg)]
    t = np.arange(0.0, s[-1], step).tolist() + [s[-1]]
    return np.c_[np.interp(t, s, xy[:, 0]), np.interp(t, s, xy[:, 1])]


def corridor_tiles(xy, width):
    """The 256 m tiles that come close to the corridor (width m left and right), in order along the route."""
    seen, order = set(), []
    for x, y in resample(xy, SAMPLE_M):
        for t in sorted(roadsmod.tiles_near(float(x), float(y), width)):
            if t not in seen:
                seen.add(t)
                order.append(t)
    return order


def _init_worker(cache):
    """Once per worker process: BeamNG.Earth's state (global in the module blockworker)."""
    blockworker._s = blockworker._State(cache, offline=False, roads=True, grading=True, road_widths=True,
                                        surface=True)


def _tile_job(lat0, lon0, tx, ty, tiles_dir, rules):
    """A road tile (blockworker._roads_tile) and its sign tile (speed limits everywhere, guide signs, exits and mile
    markers in the US: blockworker.signs_tile) under the country's road rules (road_rules)."""
    t0 = time.perf_counter()
    res = parallel.retry_locked(lambda: blockworker._roads_tile(
        build_tiles.AID, lat0, lon0, build_tiles.DEM_ZOOM, tx, ty, tiles_dir, "tiles", sidewalks=True, lift=0.0,
        buildings=True, left_hand=rules["left_hand"], mph=rules["mph"], q=None, gas_stations=True,
        buried=rules["buried"], lamp_region=rules["lamp_region"], country=rules["country"]))
    # its gas stations' forecourts (gasstations.tile_sites pads): make_obj paints them into the ground as asphalt
    with open(os.path.join(tiles_dir, f"fuelpads_{tx}_{ty}.json"), "w", encoding="utf-8") as f:
        json.dump([[sid, [[np.asarray(la).tolist(), np.asarray(lo).tolist()] for la, lo in rings]]
                   for sid, rings in res[2]], f)
    try:                        # (optional scenery: a sign tile that fails leaves the road tile)
        parallel.retry_locked(lambda: blockworker.signs_tile(
            build_tiles.AID, lat0, lon0, build_tiles.DEM_ZOOM, tx, ty, tiles_dir, "tiles", rules["left_hand"],
            rules["mph"], rules["country"]))
    except Exception:
        pass
    return tx, ty, time.perf_counter() - t0


def clean_up(work, log=print):
    """Delete a build's temporary data: the whole work folder out/tracks/<name> (AC only needs the track folder with the
    kn5). Without this it stays for the measuring tools (measure.py and check_drive.py read obj/parts)."""
    freed = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(work) for f in fs)
    shutil.rmtree(work, ignore_errors=True)
    log(f"Temporary data deleted: {freed / 1e6:.0f} MB")


def area_tiles(x0, y0, x1, y1):
    """The 256 m tiles touching the rectangle (ENU, m), row by row."""
    t = roadsmod.TILE
    return [(tx, ty) for ty in range(math.floor(y0 / t), math.ceil(y1 / t))
            for tx in range(math.floor(x0 / t), math.ceil(x1 / t))]


def build(points, width, name, title=None, log=print, clean=False, area=None, progress=None, cache_gb=None):
    """The whole chain up to the track folder; returns a dict with paths and figures.
    progress(phase, done, total): progress for the generator page (phases: PHASES).
    clean: delete the temporary data afterwards (clean_up); the page does that while "Keep build files" is off.
    cache_gb: trim the map data cache to this limit afterwards (mapcache.trim; 0: none, None: don't tidy).
    area: (south, west, north, east) instead of route and corridor: all tiles in it, start on the road nearest the
    centre."""
    progress = progress or (lambda phase, done, total: None)
    t_start = time.perf_counter()
    name = slug(name)
    title = title or name
    work = os.path.join(ROOT, "out", "tracks", name)
    tiles_dir, obj_dir = (os.path.join(work, d) for d in ("tiles", "obj"))
    for d in (tiles_dir, obj_dir):
        if os.path.exists(d):
            shutil.rmtree(d)
        os.makedirs(d)

    if area:
        s, w, n_, e_ = (float(v) for v in area)
        lat0, lon0 = (s + n_) / 2, (w + e_) / 2                                    # anchor: centre of the area
        frame = geodesy.EnuFrame(lat0, lon0)
        ce, cn, _ = frame.geodetic_to_enu(np.array([s, n_]), np.array([w, e_]), np.zeros(2))
        size = (float(ce[1] - ce[0]), float(cn[1] - cn[0]))      # (no size limit on purpose)
        xy, length, timing = None, 0.0, None
        tiles = area_tiles(float(ce[0]), float(cn[0]), float(ce[1]), float(cn[1]))
        log(f"Area {size[0] / 1000:.2f} × {size[1] / 1000:.2f} km: {len(tiles)} tiles")
    else:
        progress("route", 0, 0)
        log("Calculating route (OSRM) ...")
        pts, length = route(points)
        if length > MAX_ROUTE_M:
            raise RuntimeError(f"Route is {length / 1000:.1f} km long, at most {MAX_ROUTE_M / 1000:.0f} km possible")
        loop = math.hypot((pts[-1][1] - pts[0][1]) * 111320.0 * math.cos(math.radians(pts[0][0])),
                          (pts[-1][0] - pts[0][0]) * 111320.0) < LOOP_M
        ext = [] if loop else extend(pts)           # (finish line and run-off behind the end pin)
        allp = pts + ext
        lats, lons = np.array([p[0] for p in allp]), np.array([p[1] for p in allp])
        lat0, lon0 = (lats.min() + lats.max()) / 2, (lons.min() + lons.max()) / 2     # anchor: centre of the route
        frame = geodesy.EnuFrame(lat0, lon0)
        e, n, _ = frame.geodetic_to_enu(lats, lons, np.zeros_like(lats))
        xy = np.c_[np.asarray(e, float), np.asarray(n, float)]
        tiles = corridor_tiles(xy, width)
        log(f"Route {length / 1000:.2f} km, corridor ±{width:.0f} m: {len(tiles)} tiles")
        timing = None
        if not loop:            # start and finish line (m along xy; obj_to_kn5.ab_gates)
            s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
            end, more = float(s[len(pts) - 1]), float(s[-1] - s[len(pts) - 1])
            finish = end + FINISH_AFTER_M if more >= FINISH_AFTER_M + 20.0 else end
            if finish - START_LINE_M >= 100.0:
                timing = {"start_m": START_LINE_M, "finish_m": finish}
                log(f"Timing: start line {START_LINE_M:.0f} m after the start, finish " +
                    (f"{FINISH_AFTER_M:.0f} m after the end pin" if finish > end else
                     "at the end pin (the road does not go on straight after it)"))
            else:
                log("No timing: the route is too short for a start and a finish line")

        head = resample(xy, 5.0)
        k = min(len(head) - 1, 6)
        heading = math.atan2(head[k, 1] - head[0, 1], head[k, 0] - head[0, 0])
    if len(tiles) > WARN_TILES:
        log(f"Note: {len(tiles)} tiles – this will be large and take a while (AC may load slowly)")

    rules = road_rules(lat0, lon0)
    log(f"Road rules: {rules['country'] or 'unknown country'}, traffic on the "
        f"{'left' if rules['left_hand'] else 'right'}, limits in {'mph' if rules['mph'] else 'km/h'}")
    n = parallel.workers(len(tiles))
    log(f"Building tiles with {n} processes ({os.cpu_count()} cores) ...")
    log("(Map data for an area not built before is downloaded first: the first tiles can take a few minutes)")
    progress("tiles", 0, len(tiles))
    t0 = time.perf_counter()
    with parallel.pool(n, _init_worker, (os.path.join(ROOT, "cache"),)) as ex:
        futs = [ex.submit(_tile_job, lat0, lon0, tx, ty, tiles_dir, rules) for tx, ty in tiles]
        for i, fut in enumerate(as_completed(futs), 1):
            tx, ty, dt = fut.result()
            progress("tiles", i, len(tiles))
            if i == len(tiles) or i % max(1, len(tiles) // 50) == 0 or len(tiles) <= 50:
                log(f"Tile {i}/{len(tiles)} ({tx},{ty}): {dt:.1f} s")
    log(f"Tiles done in {time.perf_counter() - t0:.0f} s")
    anc = {"lat": lat0, "lon": lon0, "aid": build_tiles.AID, "dem_zoom": build_tiles.DEM_ZOOM,
           "tiles": [list(t) for t in tiles], "width": width, "length_m": length, "points": points,
           "rules": rules}
    if area:                # (without route and start: obj_to_kn5.start_empties takes the road nearest the anchor)
        anc["area"] = [float(v) for v in area]
    else:
        anc.update(route=[list(xy0) for xy0 in xy.round(2).tolist()],
                   start={"x": float(xy[0, 0]), "y": float(xy[0, 1]), "heading": heading}, timing=timing)
    with open(os.path.join(tiles_dir, "anchor.json"), "w", encoding="utf-8") as f:
        json.dump(anc, f)

    log("Terrain, water, trees, buildings ...")
    n_obj, n_verts, tris, parts = make_obj.main(tiles_dir, obj_dir, log=log, progress=progress)
    gate = gates.build(tiles_dir, obj_dir, log=log)     # (start and finish made visible; decides where the lines are: anchor.json)
    far = farview.build(tiles_dir, obj_dir, log=log, progress=progress)    # (only into the kn5: not into the minimap)

    log("Writing track folder ...")
    boxes = np.array([roadsmod.tile_bbox(tx, ty) for tx, ty in tiles])        # ENU (x0, y0, x1, y1)
    bounds = (boxes[:, 0].min(), -boxes[:, 3].max(), boxes[:, 2].max(), -boxes[:, 1].min())   # AC: z = -north
    desc = (f"Area {size[0] / 1000:.1f} × {size[1] / 1000:.1f} km." if area else
            f"Route {length / 1000:.1f} km, corridor ±{width:.0f} m.")
    town, country = where(lat0, lon0)
    root = make_track_folder.make(name, title, obj=os.path.join(obj_dir, "track.obj"), preview=None, city=town,
                                  country=country, geotags=(lat0, lon0), extra_description=desc,
                                  route=None if area else xy.tolist(), log=log, parts=parts, bounds=bounds,
                                  point_to_point=timing is not None)
    # For the debug app (debugapp): the route in AC coordinates (x east, z = -north) and the anchor; an area has
    # none (the app says so), and no old one from an earlier build under the same name either
    route_txt = os.path.join(root, "data", "map2lap_route.txt")
    for old in (route_txt, os.path.join(root, "data", "ac_export_route.txt")):     # (the second: older builds)
        if os.path.exists(old):
            os.remove(old)
    if not area:
        with open(route_txt, "w", encoding="utf-8") as f:
            f.write(f"anchor {lat0:.8f} {lon0:.8f}\n" + "".join(f"{e_:.2f} {-n_:.2f}\n" for e_, n_ in xy))
    if settings.load()["debug_app"]:        # (Settings; again on every build: the app of this release)
        debugapp.sync(make_track_folder.AC, True)
    for old in glob.glob(os.path.join(root, "*.kn5")):
        os.remove(old)
    progress("kn5", 0, 0)
    log("Writing kn5 ...")              # (our own writer instead of Blender + ksEditor, see obj_to_kn5.py)
    kn5_path = obj_to_kn5.convert(os.path.join(obj_dir, "track.obj"), os.path.join(root, name + ".kn5"),
                                  os.path.join(tiles_dir, "anchor.json"), log=log,
                                  parts=parts + [p for p in (gate, far) if p])
    # the settings into the track folder: "My tracks" on the generator page rebuilds with them (mytracks)
    mytracks.save(root, {"version": version.VERSION, "track_version": version.TRACK_VERSION, "title": title, "points": [list(p) for p in points],
                         "width": None if area else width,
                         "area": [float(v) for v in area] if area else None, "length_m": length,
                         "area_m": list(size) if area else None, "tiles": len(tiles), "built": time.time(),
                         "line": None if area else mytracks.thin(pts)})
    progress("clean", 0, 0)
    if cache_gb is not None:
        mapcache.trim(cache_gb, log=log)
    if clean:
        clean_up(work, log)
    took = time.perf_counter() - t_start
    log(f"Done in {took / 60:.1f} min – track \"{title}\" is installed in AC.")
    return {"name": name, "title": title, "kn5": kn5_path, "track": root, "tiles": len(tiles), "length_m": length,
            "area_m": list(size) if area else None, "kn5_bytes": os.path.getsize(kn5_path),
            "objects": n_obj, "verts": n_verts, "tris": tris, "seconds": took}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True)
    ap.add_argument("--title")
    ap.add_argument("--width", type=float, default=100.0, help="m left and right of the route")
    ap.add_argument("--area", type=float, nargs=4, metavar=("S", "W", "N", "E"), help="area instead of a route")
    ap.add_argument("--clean", action="store_true", help="delete the temporary data afterwards")
    ap.add_argument("--result", action="store_true", help="a line RESULT <json> at the end (for server.py)")
    ap.add_argument("--cores", type=float, default=100.0, help="%% of the logical cores (at most all but one)")
    ap.add_argument("--cache-gb", type=float, help="size limit of the map data cache (default: settings.json)")
    ap.add_argument("points", nargs="*", help="lat,lon ... (at least two; none with --area)")
    a = ap.parse_args()
    pts = [tuple(map(float, p.split(","))) for p in a.points]
    parallel.SHARE = a.cores / 100.0
    progress = None
    if a.result:                # (for server.py: one line PROGRESS <json> per step, not into the log)
        def progress(phase, done, total):
            print("PROGRESS " + json.dumps({"phase": phase, "done": done, "total": total}), flush=True)
    res = build(pts, a.width, a.name, a.title, clean=a.clean, area=a.area, progress=progress,
                cache_gb=settings.load()["cache_gb"] if a.cache_gb is None else a.cache_gb)
    if a.result:
        print("RESULT " + json.dumps({k: v for k, v in res.items() if k != "tris"}, default=float), flush=True)


if __name__ == "__main__":
    main()
