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
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import as_completed
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np

from track import build_tiles     # (first: sets the asphalt mesh switches and the server path)
from app import buildoptions, circuitlap, debugapp, mapcache, mytracks, settings, system, trackcode, version
from app.paths import ROOT
from scenery import dryness, farview, gates
from track import aicorrections, aihints, ailinestate, aimargins, dnfparking, fastlane, make_obj, make_track_folder, obj_to_kn5, objectlist, parallel, route_race

blockworker = build_tiles.blockworker
roadsmod = build_tiles.roadsmod
import furniture            # noqa: E402  (from the BeamNG.Earth server, path from build_tiles)
import geodesy              # noqa: E402
import borders  # noqa: E402
import navgraph             # noqa: E402
import overture             # noqa: E402
import plancache            # noqa: E402
import revisit              # noqa: E402

OSRM = "https://router.project-osrm.org/route/v1/driving/"
NOMINATIM = "https://nominatim.openstreetmap.org/"
SAMPLE_M = 20.0             # m: spacing of the route points for choosing the tiles
MAX_ROUTE_M = 500000.0      # beyond ~50 km from the anchor float32 gets coarse in AC (cm)
WARN_TILES = 150
# The finish goes beyond the end pin when the same road continues, with run-off built behind it.
FINISH_AFTER_M, RUNOUT_M = 50.0, 100.0
# Routes that return to the start still use lap timing, so an A–B finish cannot land on the start's runout.
LOOP_M = 100.0
PHASES = ("route", "tiles", "scenery", "distant", "kn5", "ai_line", "clean")
AREA_PHASES = tuple(phase for phase in PHASES if phase not in ("route", "ai_line"))


def build_progress(phase, done, total, *, area):
    """Number the current phase for a route, circuit or area build. Pure."""
    phases = AREA_PHASES if area else PHASES
    return {"phase": phase, "done": done, "total": total, "step": phases.index(phase) + 1, "steps": len(phases)}


@dataclass(frozen=True)
class SavedLine:
    """The built route, including runout, in the same ENU frame as its grid approach."""
    anchor: tuple[float, float]
    xy: np.ndarray
    end: int
    stage_timing: dict | None = None

    @classmethod
    def read(cls, path, end=None, stage_timing=None):
        """Read the anchor and AC coordinates from map2lap_route.txt."""
        with Path(path).open(encoding="utf-8") as stream:
            header, lat, lon = stream.readline().split()
            xz = np.loadtxt(stream, ndmin=2)
        anchor = float(lat), float(lon)
        end = len(xz) - 1 if end is None else end
        if (header != "anchor" or not np.isfinite(anchor).all() or not np.isfinite(xz).all()
                or xz.shape[1] != 2 or not 1 <= end < len(xz)):
            raise ValueError(f"Invalid saved route in {path}")
        return cls(anchor, xz * [1.0, -1.0], end, stage_timing)


def _saved_circuit(name):
    """Read the full installed Circuit line and its twice-driven spans for a rebuild."""
    folder = Path(make_track_folder.AC) / "content" / "tracks" / slug(name)
    try:
        line = SavedLine.read(folder / fastlane.ROUTE)
    except FileNotFoundError:
        return None, None    # An old track without a saved line can still be routed from its pins.
    except ValueError as error:
        raise RuntimeError(f"Invalid saved Circuit line for {name}") from error
    if len(line.xy) < 4 or not np.array_equal(line.xy[0], line.xy[-1]):
        raise RuntimeError(f"Invalid saved Circuit line for {name}")
    info = mytracks.load(folder)
    timing = (info or {}).get("timing") or {}
    return line, {"twice": timing.get("twice", [])}


def data_versions():
    """The map data a build reads beside the code: Overture's release (pinned in overture.RELEASE) and the OpenStreetMap
    tags file's version (its ETag, pinned in the cache for a week: osmtags.OsmTags.version; None if not fetched yet).
    Stored with the track: a build from the same inputs on other data differs where the map was edited."""
    try:
        with open(os.path.join(ROOT, "cache", "mapdata", "raw", "osmtags", "pinned"), encoding="utf-8") as f:
            osm = f.readline().strip().strip('"') or None
    except OSError:
        osm = None
    return {"overture": overture.RELEASE, "osm": osm}


def slug(name):
    s = re.sub(r"[^a-z0-9_]+", "_", name.lower()).strip("_")
    return s or "route"


def wrap_lon(lon):
    """lon in -180 .. 180 (a map dragged around the earth gives -706 for 14: OSRM answers 400). Pure."""
    return (float(lon) + 180.0) % 360.0 - 180.0


def _osrm_route(points, extra_query=""):
    """Fetch the OSRM answer for (lat, lon) points with optional additional query parameters."""
    coords = ";".join(f"{wrap_lon(lon):.6f},{lat:.6f}" for lat, lon in points)
    req = urllib.request.Request(OSRM + coords + "?overview=full&geometries=geojson" + extra_query,
                                 headers={"User-Agent": version.USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    if data.get("code") != "Ok" or not data.get("routes"):
        raise RuntimeError(f"OSRM: {data.get('code')} {data.get('message', '')}")
    return data


def route(points):
    """OSRM route through points [(lat, lon), ...]: (coordinates [(lat, lon)], length m)."""
    rt = _osrm_route(points)["routes"][0]
    return [(lat, lon) for lon, lat in rt["geometry"]["coordinates"]], float(rt["distance"])


def _circuit_refusal(error):
    """Pin advice from an OSRM HTTP error response, if OSRM refused to snap or route the pins."""
    if error.code != 400:
        return None
    try:
        answer = json.load(error)
    except (OSError, ValueError):
        return None
    if not isinstance(answer, dict):
        return None
    if answer.get("code") == "NoRoute":
        return "No drivable lap through these pins: move them onto through roads"
    if answer.get("code") == "NoSegment":
        return "A pin could not snap to a road: move the pins onto through roads"
    return None


def _circuit_answer(points, extra_query=""):
    """The ordinary OSRM route through (lat, lon) points, with edges for Circuit validation."""
    try:
        return _osrm_route(points, "&annotations=nodes,distance" + extra_query)
    except urllib.error.HTTPError as error:
        with error:
            advice = _circuit_refusal(error)
        if advice:
            raise circuitlap.NoLap(advice) from error
        raise RuntimeError(f"OSRM: {error}") from error


# Keep recent open routes so Close circuit can reuse the displayed route while pin edits keep memory bounded.
_circuit_outward = lru_cache(maxsize=16)(_circuit_answer)


def circuit_draft(points):
    """Coordinates and length of the open Circuit preview through (lat, lon) points."""
    rt = _circuit_outward(tuple(points))["routes"][0]
    return [(lat, lon) for lon, lat in rt["geometry"]["coordinates"]], float(rt["distance"])


def _arrival_bearing(answer):
    """The compass bearing (degrees from north, clockwise) of an OSRM answer's last step into its last pin, or None
    when its geometry has no length. Pure."""
    coords = answer["routes"][0]["geometry"]["coordinates"]
    lon1, lat1 = coords[-1]
    for lon0, lat0 in reversed(coords[:-1]):
        east, north = (lon1 - lon0) * math.cos(math.radians(lat1)), lat1 - lat0
        if east or north:
            return round(math.degrees(math.atan2(east, north))) % 360
    return None


def circuit_route(points: list[tuple[float, float]]) -> circuitlap.Lap:
    """Keep the open route through the pins and append one OSRM return from the last pin to the first."""
    if len(points) < 2:
        raise circuitlap.NoLap("Set at least two pins")
    outward = _circuit_outward(tuple(points))
    waypoints = outward["waypoints"]
    if waypoints[0]["location"] == waypoints[-1]["location"]:
        return circuitlap.lap(outward)
    # The return is a request of its own and knows no heading: its shortest way back could begin with a U-turn at the
    # last pin (the Pischeldorfer test circuit's pin 4, reached from the north, the return heading north again). It
    # leaves the way the car arrives, within 90 degrees either side.
    bearing = _arrival_bearing(outward)
    heading = f"&bearings={bearing},90;" if bearing is not None else ""
    return circuitlap.close(outward, _circuit_answer((points[-1], points[0]), heading))


def extend(pts, ahead=FINISH_AFTER_M + RUNOUT_M, *, incoming=False):
    """The route beyond the end pin on the same road: OSRM from the end to a point ahead m straight on (direction of the
    last ~30 m). Only if that stays short and doesn't turn back (else the road turns off or ends); returns the points
    beyond [(lat, lon)], [] if not. incoming: route toward the endpoint when extending before the start, so one-way roads
    are followed in driving direction."""
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
        ends = [(la1, lo1), (la1 + uy * ahead / m_lat, lo1 + ux * ahead / m_lon)]
        ext, dist = route(ends[::-1] if incoming else ends)
        if incoming:
            ext = ext[::-1]
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
COUNTRIES = os.path.join(ROOT, "cache", "countries.json")
OWN_RULES = {"HK": "CN", "MO": "CN", "VI": "US"}    # a territory driving on the other side than the country Nominatim names


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


def _stored_countries():
    """The countries Nominatim named so far: {"<lat>,<lon>" to 3 places: [ISO code, region]}."""
    try:
        with open(COUNTRIES, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def _store_country(key, code):
    """code stays for the next build at this spot, written whole (builds run side by side)."""
    os.makedirs(os.path.dirname(COUNTRIES), exist_ok=True)
    temporary = f"{COUNTRIES}.{os.getpid()}"
    with open(temporary, "w", encoding="utf-8") as f:
        json.dump({**_stored_countries(), key: list(code)}, f)
    os.replace(temporary, COUNTRIES)


def country_at(lat, lon):
    """(ISO code, region) at (lat, lon), for road rules that hang on it, traffic on the left or in mph. Nominatim first, once per
    spot: OpenStreetMap's borders are the finer (1 km from a border, 3 % of 150 points got other rules from the borders we carry).
    Not reached or no country named: borders.at, so a failed request never gives a track rules of no country; (None, None) only
    out at sea. Nominatim names the mother country of a territory with its own traffic rules (OWN_RULES): the borders tell."""
    key = (round(lat, 3), round(lon, 3))
    stored = _stored_countries().get(f"{key[0]},{key[1]}")
    if stored:
        return tuple(stored)
    local = borders.at(lat, lon)
    try:
        place(lat, lon)
        code = _codes.get(key, (None, None))
    except Exception:
        return local
    if not code[0]:
        return local
    if OWN_RULES.get(local[0]) == code[0]:
        code = local
    _store_country(f"{key[0]},{key[1]}", code)
    return code


def road_rules(lat, lon):
    """BeamNG.Earth's road rules at the anchor from its country (country_at): driving on the left, limits in mph, the share of
    low-voltage lines underground (fewer poles), the street lamps' spacing and the country itself (road markings, speed-limit
    sign faces). No country there: right-hand traffic, km/h."""
    country, region = country_at(lat, lon)
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
    # the lines along its walls between two roads: make_obj cuts the ground there (scenery.wallcut)
    with open(os.path.join(tiles_dir, f"wallcuts_{tx}_{ty}.json"), "w", encoding="utf-8") as f:
        json.dump([{k: np.asarray(w[k]).tolist() for k in ("base", "low", "high", "toward")} for w in res[3]], f)
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


def _refuse_saved(name):
    """RuntimeError if the track name in AC was saved in the Editor: every way a build goes into AC asks here, the tools' too."""
    title = mytracks.saved_in_editor(make_track_folder.AC, name)
    if title is not None:
        raise RuntimeError(f"{name} was saved in the Editor as “{title}”: a build would replace it. Delete it, or build under another name")


def build(points, width, name, title=None, log=print, clean=False, area=None, progress=None, cache_gb=None, upto=None,
          line=None, kind="route", circuit_timing=None, ai_corrections=None, ai_margins=None):
    """The whole chain up to the track folder; returns a dict with paths and figures.
    progress(phase, done, total): progress for the generator page (phases: PHASES).
    line: (route [(lat, lon), ...], index of the end pin in it) instead of OSRM's: an earlier build's route as it was,
    the run-off behind the end pin included, or a SavedLine in its original ENU frame.
    kind="circuit": route a closed lap. With line, circuit_timing holds the saved start/finish metre and twice-driven spans.
    clean: delete the temporary data afterwards (clean_up); the page does that while "Keep build files" is off.
    cache_gb: trim the map data cache to this limit afterwards (mapcache.trim; 0: none, None: don't tidy).
    area: (south, west, north, east) instead of route and corridor: all tiles in it, start on the road nearest the
    centre. upto="obj": stop after the OBJ parts in out/tracks/<name> (tools/stretch.py: no distant view, kn5 or
    track folder; nothing goes into AC); returns {"work": the work folder}. RuntimeError, before any work, if it would
    replace a track saved in the Editor."""
    if not upto:
        _refuse_saved(slug(name))
    with plancache.one_run(os.path.join(ROOT, "cache")):
        return _build(points, width, name, title, log, clean, area, progress, cache_gb, upto, line, kind,
                      circuit_timing, ai_corrections, ai_margins)


def _build(points, width, name, title, log, clean, area, progress, cache_gb, upto, line, kind="route", circuit_timing=None, ai_corrections=None, ai_margins=None):
    """build, its processes sharing their plans."""
    progress = progress or (lambda phase, done, total: None)
    t_start = time.perf_counter()
    options = buildoptions.from_environment()
    log(f"Ground textures: {options['ground_quality'].upper()} ({make_obj.ground.TEX_PX} px terrain tiles)")
    log(f"Terrain grid: {make_obj.CELL:g} m")
    log(f"Parked cars: {'on' if options['parked_cars'] else 'off'}")
    log(f"Tree minimum spacing: {options['tree_spacing_m']:g} m")
    points = [(lat, wrap_lon(lon)) for lat, lon in points or ()]
    kind = "area" if area else kind
    circuit = kind == "circuit"
    if area:                # (both sides by the same whole turns: an area keeps its width)
        turns = wrap_lon(area[1]) - float(area[1])
        area = (area[0], float(area[1]) + turns, area[2], float(area[3]) + turns)
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
        lap = None
        saved = line if isinstance(line, SavedLine) else None
        if saved is not None:
            log(f"Using saved {kind.capitalize()} line")
            lat0, lon0 = saved.anchor
            xy = saved.xy
            lead = np.asarray((saved.stage_timing or {}).get("approach", []), float).reshape(-1, 2)
            course = xy[:saved.end + 1]
            la, lo, _ = geodesy.EnuFrame(lat0, lon0).enu_to_geodetic(course[:, 0], course[:, 1], 0)
            pts = np.column_stack((la, lo)).tolist()
            length = float(np.linalg.norm(np.diff(course, axis=0), axis=1).sum())
        elif line is None:
            if circuit:
                log("Calculating circuit (OSRM) ...")
                lap = circuit_route(points)
                pts, length = lap.coords, lap.length_m
            else:
                log("Calculating route (OSRM) ...")
                pts, length = route(points)
        else:
            log("Circuit as given (no OSRM)" if circuit else "Route as given (no OSRM)")
            pts, given = [list(p) for p in line[0][:line[1] + 1]], [list(p) for p in line[0][line[1] + 1:]]
            ll = np.asarray(pts, float)
            lons = np.unwrap(ll[:, 1], period=360.0) if circuit else ll[:, 1]
            length = float(np.sum(np.hypot(np.diff(ll[:, 0]) * 111320.0,
                                           np.diff(lons) * 111320.0 * np.cos(np.radians(ll[:-1, 0])))))
        if length > MAX_ROUTE_M:
            raise RuntimeError(f"Route is {length / 1000:.1f} km long, at most {MAX_ROUTE_M / 1000:.0f} km possible")
        lat_gap = (pts[-1][0] - pts[0][0]) * 111320.0
        lon_gap = (pts[-1][1] - pts[0][1]) * 111320.0 * math.cos(math.radians(pts[0][0]))
        loop = circuit or math.hypot(lat_gap, lon_gap) < LOOP_M
        approach = []
        gate_approach_count = 0
        if circuit or saved is not None:
            ext = []
        elif line is not None:
            ext = given
        elif loop:
            ext = []
        else:
            ext = extend(pts)
            incoming = extend(pts[::-1], obj_to_kn5.STAGE_GRID_M, incoming=True)
            gate_approach_count = len(incoming)
            if incoming:
                # Keep the original gate approach. Continue from its actual road endpoint
                # so a rejected longer OSRM leg cannot erase the short one or move the gate.
                incoming += extend([pts[0], *incoming], obj_to_kn5.MAX_GRID_M - obj_to_kn5.STAGE_GRID_M
                                   + fastlane.GRID_RUN_IN, incoming=True)
            approach = incoming[::-1]
        if saved is None:
            lats, lons = np.asarray(pts + ext + approach, float).T
            # A lap can cross the antimeridian on a single road. Its centre follows the continuous line.
            # Extra grid tiles must share the old ENU origin: changing it shifts the
            # terrain lattice and the physical gate even when the route stays identical.
            original = pts + ext + (approach[-gate_approach_count:] if gate_approach_count else [])
            centre_lats, centre_lons = np.asarray(original).T
            if circuit:
                centre_lons = np.unwrap(centre_lons, period=360.0)
            lat0, lon0 = (centre_lats.min() + centre_lats.max()) / 2, (centre_lons.min() + centre_lons.max()) / 2
            if circuit and not -180.0 <= lon0 < 180.0:
                lon0 = wrap_lon(lon0)
            frame = geodesy.EnuFrame(lat0, lon0)
            e, n, _ = frame.geodetic_to_enu(lats, lons, np.zeros_like(lats))
            xy = np.c_[np.asarray(e, float), np.asarray(n, float)]
            lead = xy[len(pts) + len(ext):]
            xy = xy[:len(pts) + len(ext)]
        tiles = corridor_tiles(np.concatenate((lead, xy)), width)
        label = "Circuit, lap" if circuit else "Route"
        log(f"{label} {length / 1000:.2f} km, corridor ±{width:.0f} m: {len(tiles)} tiles")
        timing = None
        if circuit:
            timing = {"start_m": 0.0, "twice": []}
            if lap is not None and lap.twice:
                # Use the length of the line that the converter reads back from the anchor.
                scale = float(np.linalg.norm(np.diff(xy.round(2), axis=0), axis=1).sum()) / length
                timing["twice"] = [[lo * scale, hi * scale] for lo, hi in lap.twice]
            if circuit_timing is not None and line is not None:
                timing.update(mytracks.circuit_timing(circuit_timing))
        elif saved is not None and saved.stage_timing is not None:
            timing = saved.stage_timing
        elif not loop:          # start and finish line (m along xy; obj_to_kn5.ab_gates)
            s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
            end, more = float(s[len(pts) - 1]), float(s[-1] - s[len(pts) - 1])
            finish = end + FINISH_AFTER_M if more >= FINISH_AFTER_M + 20.0 else end
            timing = {"start_m": 0.0, "finish_m": float(finish), "approach": lead.round(2).tolist()}
            if gate_approach_count and gate_approach_count < len(lead):
                timing["gate_approach_count"] = gate_approach_count

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
        futs = [ex.submit(_tile_job, lat0, lon0, tx, ty, tiles_dir, rules)
                for tx, ty in parallel.tile_order(tiles, os.environ.get(parallel.ORDER_ENV))]
        for i, fut in enumerate(as_completed(futs), 1):
            tx, ty, dt = fut.result()
            progress("tiles", i, len(tiles))
            if i == len(tiles) or i % max(1, len(tiles) // 50) == 0 or len(tiles) <= 50:
                log(f"Tile {i}/{len(tiles)} ({tx},{ty}): {dt:.1f} s")
    log(f"Tiles done in {time.perf_counter() - t0:.0f} s")
    anc = {"kind": kind, "lat": lat0, "lon": lon0, "aid": build_tiles.AID, "dem_zoom": build_tiles.DEM_ZOOM,
           "tiles": [list(t) for t in tiles], "width": width, "length_m": length, "points": points,
           "rules": rules, "title": title, "code_key": revisit.code_key()}
    anc.update(options)
    if ai_corrections:
        anc["aiCorrections"] = ai_corrections
    if ai_margins:
        anc["aiMargins"] = ai_margins
    if area:                # (without route and start: obj_to_kn5.start_empties takes the road nearest the anchor)
        anc["area"] = [float(v) for v in area]
    else:
        anc.update(route=[list(xy0) for xy0 in xy.round(2).tolist()], line=[list(p) for p in pts],
                   start={"x": float(xy[0, 0]), "y": float(xy[0, 1]), "heading": heading}, timing=timing)
    with open(os.path.join(tiles_dir, "anchor.json"), "w", encoding="utf-8") as f:
        json.dump(anc, f)

    log("Terrain, water, trees, buildings ...")
    n_obj, n_verts, tris, parts = make_obj.main(tiles_dir, obj_dir, log=log, progress=progress)
    if upto == "obj":
        return {"work": work}
    return _finish(name, title, work, anc, xy, None if area else pts, parts, (n_obj, n_verts, tris), t_start, log, progress, clean,
                   cache_gb)


def finish_obj(name, title=None, log=print, progress=None):
    """A build that stopped at the OBJ parts (build(upto="obj"), tools/measure.py --kn5) on into AC, the tiles' parts as they
    are: distant view, gates, track folder, kn5. title: else the build's. Returns as build does. RuntimeError if it would
    replace a track saved in the Editor."""
    progress = progress or (lambda phase, done, total: None)
    name = slug(name)
    _refuse_saved(name)
    work = os.path.join(ROOT, "out", "tracks", name)
    with open(os.path.join(work, "tiles", "anchor.json"), encoding="utf-8") as f:
        anc = json.load(f)
    area = anc.get("area")
    if not area and "line" not in anc:
        raise RuntimeError(f"{name} was built before anchor.json held the route as it came: build it again")
    if anc.get("code_key") != revisit.code_key():
        log(f"NOTE: the engine changed since {name}'s OBJ parts were built: they don't show it, only a build does")
    xy = None if area else np.asarray(anc["route"], np.float64)
    pts = None if area else anc["line"]
    parts = [os.path.join(work, "obj", "parts", f"t_{tx}_{ty}.obj") for tx, ty in anc["tiles"]]
    return _finish(name, title or anc.get("title") or name, work, anc, xy, pts, parts, (None, None, None), time.perf_counter(), log, progress, False,
                   None)


def _finish(name, title, work, anc, xy, pts, parts, figures, t_start, log, progress, clean, cache_gb):
    """From the OBJ parts on: distant view, track folder, kn5. anc: the build's anchor.json; xy (n, 2): the route, pts its [lat,
    lon] up to the end pin, None with an area; figures: (objects, vertices, triangles) for the result. Returns as build does."""
    tiles_dir, obj_dir = (os.path.join(work, d) for d in ("tiles", "obj"))
    tiles = [tuple(t) for t in anc["tiles"]]
    lat0, lon0, width, length, points = anc["lat"], anc["lon"], anc["width"], anc["length_m"], anc["points"]
    area = anc.get("area")
    circuit = anc.get("kind") == "circuit"
    n_obj, n_verts, tris = figures
    size = None
    if area:
        ce, cn, _ = geodesy.EnuFrame(lat0, lon0).geodetic_to_enu(np.array(area[::2]), np.array(area[1::2]), np.zeros(2))
        size = (float(ce[1] - ce[0]), float(cn[1] - cn[0]))
    gate = gates.build(tiles_dir, obj_dir, log=log)     # (start and finish made visible; decides where the lines are: anchor.json)
    far = farview.build(tiles_dir, obj_dir, log=log, progress=progress)    # (only into the kn5: not into the minimap)

    boxes = np.array([roadsmod.tile_bbox(tx, ty) for tx, ty in tiles])        # ENU (x0, y0, x1, y1)
    bounds = (boxes[:, 0].min(), -boxes[:, 3].max(), boxes[:, 2].max(), -boxes[:, 1].min())   # AC: z = -north
    label = "Circuit, lap" if circuit else "Route"
    desc = (f"Area {size[0] / 1000:.1f} × {size[1] / 1000:.1f} km." if area else
            f"{label} {length / 1000:.1f} km, corridor ±{width:.0f} m.")
    town, country = where(lat0, lon0)
    trees = objectlist.collect_treefx(parts)
    if trees:
        log(f"TreeFX trees: {len(trees['trees']):,}")
    obj_path = os.path.join(obj_dir, "track.obj")

    def prepare_output(point_to_point, pitboxes):
        """Prepare the installed folder using the timing markers checked by the converter."""
        log("Writing track folder ...")
        root = make_track_folder.make(name, title, obj=obj_path, preview=None, city=town, country=country,
                                      geotags=(lat0, lon0), extra_description=desc, route=None if area else xy.tolist(),
                                      log=log, parts=parts, bounds=bounds,
                                      point_to_point=point_to_point, pitboxes=pitboxes,
                                      trees=trees, ground_colour_credit=dryness.SOURCE.attribution
                                      if anc.get("ground_quality", "sd") == "sd" and
                                      os.path.isfile(os.path.join(tiles_dir, "dryness.npz")) else "")
        # For the debug app: the route in AC coordinates (x east, z = -north). Areas remove the previous route, if any.
        route_txt = os.path.join(root, "data", "map2lap_route.txt")
        for old in (route_txt, os.path.join(root, "data", "ac_export_route.txt")):     # (the second: older builds)
            if os.path.exists(old):
                os.remove(old)
        if not area:
            with open(route_txt, "w", encoding="utf-8") as f:
                f.write(f"anchor {lat0:.8f} {lon0:.8f}\n" + "".join(f"{e_:.2f} {-n_:.2f}\n" for e_, n_ in xy))
        if settings.load()["debug_app"]:        # (Settings; again on every build: the app of this release)
            debugapp.sync(make_track_folder.AC, True)
        model = os.path.join(root, name + ".kn5")
        dnfparking.remove(model)
        route_race.remove_generated_files(model)
        (Path(root) / fastlane.FILE).unlink(missing_ok=True)
        (Path(root) / ailinestate.FILE).unlink(missing_ok=True)
        if not route_race.ac_running():
            aihints.install(Path(root), None)
        for old in glob.glob(os.path.join(root, "*.kn5")):
            os.remove(old)
        log("Writing kn5 ...")              # (our own writer instead of Blender + ksEditor, see obj_to_kn5.py)
        return model

    anchor_path = os.path.join(tiles_dir, "anchor.json")
    kn5_parts = parts + [p for p in (gate, far) if p]
    # A refused placement must leave the installed track intact, including during a Rebuild.
    progress("kn5", 0, 0)
    kn5_path = obj_to_kn5.convert(obj_path, None, anchor_path, log=log, parts=kn5_parts, prepare_output=prepare_output)
    root = os.path.dirname(kn5_path)
    # the settings into the track folder: "My tracks" on the generator page rebuilds with them (mytracks)
    info = {"version": version.VERSION, "track_version": version.TRACK_VERSION, "title": title,
            "points": [list(p) for p in points], "width": None if area else width,
            "area": [float(v) for v in area] if area else None, "length_m": length,
            "area_m": list(size) if area else None, "tiles": len(tiles), "built": time.time(),
            "line": None if area else mytracks.thin(pts),
            "route_end": None if area else len(pts) - 1, "data": data_versions()}
    if circuit:
        with open(anchor_path, encoding="utf-8") as f:
            info.update(kind="circuit", timing=mytracks.circuit_timing(json.load(f).get("timing")))
    elif "approach" in (anc.get("timing") or {}):
        # The debug rebuild places gates on the rebuilt road using the original approach and finish target.
        info["stage_timing"] = {key: anc["timing"][key] for key in
                                ("approach", "gate_approach_count", "start_m", "finish_m") if key in anc["timing"]}
    info.update(buildoptions.checked(anc))
    info["code"] = trackcode.encode(info)
    # The route anchors travel with the rebuilt copy, whose new meshes become its Editor source.
    ai = {key: anc[key] for key in ("aiCorrections", "aiMargins") if anc.get(key)}
    if ai:
        info["edits"] = ai
    mytracks.save(root, info)
    if not area:
        progress("ai_line", 0, 0)
        fastlane.regenerate(kn5_path, circuit=circuit, log=log)
        dnfparking.install(Path(kn5_path))
    progress("clean", 0, 0)
    if cache_gb is not None:
        mapcache.trim(cache_gb, log=log)
    if clean:
        clean_up(work, log)
    took = time.perf_counter() - t_start
    log(f"Done in {took / 60:.1f} min – track \"{title}\" is installed in AC.")
    return {"name": name, "title": title, "kn5": kn5_path, "track": root, "tiles": len(tiles), "length_m": length,
            "area_m": list(size) if area else None, "kn5_bytes": os.path.getsize(kn5_path),
            "objects": n_obj, "verts": n_verts, "tris": tris, "seconds": took,
            **({"kind": "circuit"} if circuit else {})}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True)
    ap.add_argument("--title")
    ap.add_argument("--width", type=float, default=100.0, help="m left and right of the route")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--area", type=float, nargs=4, metavar=("S", "W", "N", "E"), help="area instead of a route")
    mode.add_argument("--circuit", action="store_true", help="close the lap from the last pin back to the first")
    ap.add_argument("--ai-source", help="reuse the saved AI line corrections and hint zones from this track")
    ap.add_argument("--circuit-source", help="reuse this installed Circuit's full saved line for Rebuild")
    ap.add_argument("--clean", action="store_true", help="delete the temporary data afterwards")
    ap.add_argument("--result", action="store_true", help="a line RESULT <json> at the end (for server.py)")
    ap.add_argument("--cores", type=float, default=100.0, help="%% of the logical cores (at most all but one)")
    ap.add_argument("--cache-gb", type=float, help="size limit of the map data cache (default: settings.json)")
    ap.add_argument("points", nargs="*", help="lat,lon ... (at least two; none with --area)")
    a = ap.parse_args()
    if a.circuit_source and not a.circuit:
        ap.error("--circuit-source requires --circuit")
    system.trust_windows_certificates()
    pts = [tuple(map(float, p.split(","))) for p in a.points]
    parallel.SHARE = a.cores / 100.0
    progress = None
    if a.result:                # (for server.py: one line PROGRESS <json> per step, not into the log)
        def progress(phase, done, total):
            print("PROGRESS " + json.dumps(build_progress(phase, done, total, area=bool(a.area))), flush=True)
    line, timing = _saved_circuit(a.circuit_source) if a.circuit_source else (None, None)
    moves, margins = [], []
    if a.ai_source:
        source = Path(make_track_folder.AC) / "content" / "tracks" / slug(a.ai_source)
        moves, margins = aicorrections.recipe(source), aimargins.recipe(source)
    res = build(pts, a.width, a.name, a.title, clean=a.clean, area=a.area, progress=progress, line=line, circuit_timing=timing,
                ai_corrections=moves, ai_margins=margins,
                cache_gb=settings.load()["cache_gb"] if a.cache_gb is None else a.cache_gb,
                kind="circuit" if a.circuit else "route")
    if a.result:
        print("RESULT " + json.dumps({k: v for k, v in res.items() if k != "tris"}, default=float), flush=True)


if __name__ == "__main__":
    main()
