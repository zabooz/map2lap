"""Local generator page: http://localhost:8800

Set points on the OpenStreetMap map, look at the route (OSRM), choose the corridor width and the name, build the
track; or an area instead of a route. "My tracks": build the tracks built before again with the current release
(mytracks), as a copy, delete them, play them. "Editor": a built track in 3D (trackview). The page: web/, built from ui/. Settings
(settings.py): AC folder, Play car, CPU share, map data cache limit (mapcache), keep build files.
Only one build at a time. It runs as a process of its own (generator.py): Stop ends it with its worker processes,
and every build uses the current code (a running server would otherwise build with the code from its start).
Editor data, library and road-tool HTTP handlers live in server_editor.py, server_library.py and server_roadtools.py.

    .venv\\Scripts\\python.exe server.py
"""
import json
import gzip
import math
import os
import re
import secrets
import shutil
import struct
import subprocess
import sys
import threading
import time
import traceback
import webbrowser
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from app import buildoptions, circuitlap, drivername, named, personalbest

if __name__ == "__main__":      # (before the engine loads: the python.exe left waiting stays small)
    named.restart_as("server")

import generator  # noqa: E402
import numpy as np  # noqa: E402

from app import (ailanejobs, builtroad, csp, debugapp, feedback, mapcache, materiallibrary, objectlibrary, modeldata, mytracks, railbridges, roadbend, roadnet, roadregion, roadseparation, settings, sidewalkcuts, system, trackband, trackcode, trackcopy, trackedits, trackheights, trackkerbs, tracknative, trackstitch, tracksource, tracksurfaces,  # noqa: E402
                 trackdetail, trackinspect, trackpaint, trackview, updater, version, weather)
from app.paths import ROOT, SRC  # noqa: E402
from server_editor import EditorHandlers, IMAGE_TYPES  # noqa: E402
from server_library import LibraryHandlers, MATERIAL_UPLOADS  # noqa: E402
from server_roadtools import RoadToolHandlers  # noqa: E402
from track import ailinestate, dnfparking, fastlane, kn5, obj_to_kn5, route_race  # noqa: E402

PORT = 8800
job = {"state": "idle", "log": [], "result": None, "error": None,     # state: idle running stopping stopped done error
       "progress": None, "started": None, "ended": None}              # progress: generator.PHASES {phase, done, total}
running = {"proc": None, "clearing": False}     # clearing: the map data cache is being cleared (no build)
lock, dialog_lock, play_lock = threading.Lock(), threading.Lock(), threading.Lock()
# The running build {name, clean, started, pid}: if the file is still there when the server starts, the server ended
# in the middle of a build (console window closed), and tidy_interrupted tidies up
MARK = os.path.join(ROOT, "out", "build_running.json")
BUILD_LOG = "build.log"     # a build's log among its build files (out/tracks/<name>): written only while "Keep build
                            # files" is on, replaced by the next build of the track, deleted with the build files
EDITOR_PATH = re.compile(r"/api/editor/([^/]+)/(?:index|(mesh|texture)/(\d+)\?r=([\w-]+)(?:&d=\d+)?(?:&c=[a-f0-9]*)?(?:&p=[a-f0-9]{64})?)")
COPIES_PATH = re.compile(r"/api/editor/([^/]+)/copies")
GLOW_PATH = re.compile(r"/api/editor/([^/]+)/glow/(glow_(?:fac|shp|off)_[0-2]\.png)")
SURFACE_PATH = re.compile(r"/api/editor/([^/]+)/surface")
AI_LINE_PATH = re.compile(r"/api/editor/([^/]+)/ai-line(?:\?r=([\w-]+))?")
SURFACE_PREPARE_PATH = re.compile(r"/api/editor/([^/]+)/surface/prepare")
EDITS_PATH = re.compile(r"/api/editor/([^/]+)/edits")
SAVE_PATH = re.compile(r"/api/editor/([^/]+)/save")
BRUSH_PATH = re.compile(r"/api/editor/([^/]+)/brush(/preview)?")
COPY_PATH = re.compile(r"/api/editor/([^/]+)/copy")
MOVE_PATH = re.compile(r"/api/editor/([^/]+)/move")
PROGRESS_PATH = re.compile(r"/api/editor/([^/]+)/paint-progress")
painting = {}       # {track: {"phase", "done", "total"}} of the Apply running on it (trackedits.paint), for the page's bar
TREEFX_PATH = re.compile(r"/api/editor/([^/]+)/treefx(?:/([a-z0-9_]+)(?:/([A-Za-z0-9_-]+\.png))?)?")     # (its trees, a model, its images)
BAND_PATH = re.compile(r"/api/editor/([^/]+)/band(?:/(way|preview))?")
SEPARATE_PATH = re.compile(r"/api/editor/([^/]+)/separate(?:/(way))?")
BEND_PATH = re.compile(r"/api/editor/([^/]+)/bend(?:/(way))?")
BANK_PATH = re.compile(r"/api/editor/([^/]+)/bank(?:/(way))?")
RAILBRIDGE_PATH = re.compile(r"/api/editor/([^/]+)/railbridge")
SIDEWALK_PATH = re.compile(r"/api/editor/([^/]+)/(?:sidewalk|guardrail)")
KERB_PATH = re.compile(r"/api/editor/([^/]+)/kerb/way")
STITCH_PATH = re.compile(r"/api/editor/([^/]+)/stitch/way")
LOCAL_HOSTS = ("127.0.0.1", "localhost")
TITLE_MAX = 80                  # (a track's name as Save in the Editor takes it: longer ones are cut)
WEB = os.path.join(SRC, "web")      # the page as built from ui/ (bun run build)
WEB_TYPES = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
             ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml"}


def log(msg):
    with lock:
        job["log"].append(str(msg))


def build_log(name, clean):
    """The file a build's log goes into (BUILD_LOG), open for writing, or None while its files are not kept."""
    if clean:
        return None
    work = os.path.join(ROOT, "out", "tracks", name)
    os.makedirs(work, exist_ok=True)
    return open(os.path.join(work, BUILD_LOG), "w", encoding="utf-8")


def run_build(args, name, clean, started, terrain_cell_m=2, parked_cars=True, tree_spacing_m=0, ground_quality="sd"):
    model = Path(settings.ac_path(), "content", "tracks", name, name + ".kn5")
    with ailanejobs.changing(model, drain=True):
        _run_build(args, name, clean, started, terrain_cell_m, parked_cars, tree_spacing_m, ground_quality)


def _run_build(args, name, clean, started, terrain_cell_m, parked_cars, tree_spacing_m, ground_quality):
    code, result, keep = None, None, None
    try:
        keep = build_log(name, clean)
        options = {"terrain_cell_m": terrain_cell_m, "parked_cars": parked_cars, "tree_spacing_m": tree_spacing_m, "ground_quality": ground_quality}
        p = subprocess.Popen([named.exe("build"), "-u", os.path.join(SRC, "generator.py"), "--result", *args], cwd=ROOT,
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8",
                             errors="replace", env={**named.child_env(), "PYTHONIOENCODING": "utf-8",
                                                    **buildoptions.environment(options)}, **system.GROUP)
        running["proc"] = p
        os.makedirs(os.path.dirname(MARK), exist_ok=True)
        with open(MARK, "w", encoding="utf-8") as f:
            json.dump({"name": name, "clean": clean, "started": started, "pid": p.pid}, f)
        for line in p.stdout:
            if line.startswith("RESULT "):
                result = json.loads(line[len("RESULT "):])
            elif line.startswith("PROGRESS "):
                with lock:
                    job["progress"] = json.loads(line[len("PROGRESS "):])
            else:
                log(line.rstrip())
                if keep:
                    keep.write(line)
                    keep.flush()        # (to read while it runs)
        code = p.wait()
        with lock:
            job["ended"] = time.time()
    except Exception as e:      # (show errors on the page rather than ending the server)
        log(traceback.format_exc())
        if keep:
            keep.write(traceback.format_exc())
        _tidy_failed(name, clean, started)
        with lock:
            job.update(state="error", error=str(e), ended=time.time())
        _unmark()
        return
    finally:
        running["proc"] = None
        if keep:
            keep.close()
    with lock:
        stopped = job["state"] == "stopping"
    if stopped:
        log("Stopped.")
        tidy(name, clean, started)
        with lock:
            job["state"] = "stopped"
    elif code == 0 and result:
        if result.get("kn5") and result.get("kind") != "circuit" and not result.get("area_m"):
            result["ab_timing"] = _has_ab_timing(result["kn5"])
        with lock:
            job.update(state="done", result=result)
    else:
        _tidy_failed(name, clean, started)
        with lock:
            job.update(state="error", error=f"the generator ended with exit code {code} (see the log)")
    _unmark()


def _unmark():
    try:
        os.remove(MARK)
    except OSError:
        pass


def tidy(name, clean, started, say=log):
    """What an aborted build (Stop, or the server ended halfway) left behind: its temporary data (if set) and a
    half-built track in AC. Half-built: its kn5 is missing or from this build, and its settings (data/map2lap.json,
    written last by the build) are not (AC won't load such a track). An old track the build hadn't touched yet
    (Rebuild before "Writing track folder") stays."""
    work = os.path.join(ROOT, "out", "tracks", name)
    if clean and os.path.isdir(work):
        generator.clean_up(work, say)
    root = os.path.join(settings.ac_path(), "content", "tracks", name)
    info, kn5 = os.path.join(root, mytracks.FILE), os.path.join(root, name + ".kn5")
    done = os.path.exists(info) and os.path.getmtime(info) >= started
    touched = not os.path.exists(kn5) or os.path.getmtime(kn5) >= started
    if os.path.isdir(root) and touched and not done:
        shutil.rmtree(root, ignore_errors=True)
        say("Incomplete track removed from AC")


def _tidy_failed(name, clean, started):
    """A failed build leaves as little as a stopped one (a full disk: the half track and, unless kept, the work folder take the room);
    its own failing changes nothing about what the page says."""
    try:
        tidy(name, clean, started)
    except OSError as e:
        log(f"Could not tidy up: {e}")


def tidy_interrupted():
    """On server start: if the last server ended in the middle of a build, end that build (if it still runs) and tidy
    up (tidy); the messages then show in the page's log."""
    try:
        with open(MARK, encoding="utf-8") as f:
            m = json.load(f)
    except (OSError, ValueError):
        return
    log(f"The last build (“{m['name']}”) was cut off when Map2Lap was closed: tidying up")
    pid = m.get("pid")
    if pid and system.is_python(pid):          # (still there: without a server nobody sees it any more)
        system.kill_tree(pid)
        log("Its build process was still running: stopped")
    tidy(m["name"], m.get("clean", True), m.get("started", 0.0))
    _unmark()
    log("Done.")


def browse_folder(start):
    """The system's folder picker (system.browse_folder), one at a time; None: cancelled."""
    with dialog_lock:
        return system.browse_folder(start)


def settings_view():
    path, s = settings.ac_path(), settings.load()
    return {"ac_path": path, "ac_ok": settings.is_ac(path), "clean": s["clean"], "cores": s["cores"],
            "cache_gb": s["cache_gb"], "car": s["car"], "debug_app": s["debug_app"], "weather_effects": s["weather_effects"],
            "threads": os.cpu_count() or 2, "version": version.VERSION}


def saved_in_editor(name):
    """The answer (HTTP code, response) to a build that would replace the track name, saved in the Editor: its own work, which no
    build takes the place of. None for any other name. Two titles can give one name."""
    title = mytracks.saved_in_editor(settings.ac_path(), name)
    if title is None:
        return None
    return 409, {"error": f"A track saved in the Editor is called “{title}”: a build can't replace it, choose another name"}


def start_build(name, title, points, width, area, terrain_cell_m=2, parked_cars=True, tree_spacing_m=0, ground_quality="sd",
                kind="route", *, circuit_source=None, ai_source=None):
    """Start a build (new and rebuild); returns (HTTP code, response)."""
    if not settings.is_ac(settings.ac_path()):
        return 400, {"error": "Assetto Corsa folder not found: set it in Settings"}
    if not area and len(points) < 2:
        return 400, {"error": "Set a start and a finish, or draw an area"}
    try:
        options = buildoptions.checked({"terrain_cell_m": terrain_cell_m, "parked_cars": parked_cars,
                                        "tree_spacing_m": tree_spacing_m, "ground_quality": ground_quality})
    except ValueError as e:
        return 400, {"error": str(e)}
    s = settings.load()
    clean = s["clean"]
    args = ["--name", name, "--title", title, "--cores", str(s["cores"]), "--cache-gb", str(s["cache_gb"])]
    if area:
        args += ["--area", *(str(float(v)) for v in area)]
    else:                           # ("--": a point like -33.9,151.2 is not an option)
        if kind == "circuit":
            args.append("--circuit")
            if circuit_source:
                args += ["--circuit-source", circuit_source]
        if ai_source:
            args += ["--ai-source", ai_source]
        args += ["--width", str(float(width or 100)), "--", *(f"{la},{lo}" for la, lo in points)]
    if clean:
        args.insert(0, "--clean")
    with lock:
        if job["state"] in ("running", "stopping"):
            return 409, {"error": "A build is already running"}
        if csp.busy():
            return 409, {"error": "CSP is being installed: wait for it, then build"}
        if trackcopy.busy():            # (asked under the lock a Save asks about builds under: never both at once)
            return 409, {"error": "A track is being saved in the Editor: wait for it, then try again"}
        # (here too, not before the lock: a Save that ended since the request was made would be replaced)
        saved = saved_in_editor(name)
        if saved:
            return saved
        if running["clearing"]:
            return 409, {"error": "The map data is being cleared, try again in a moment"}
        if updater.state["state"] in ("downloading", "restarting"):
            return 409, {"error": "Map2Lap is installing an update"}
        job.update(state="running", log=[], result=None, error=None, progress=None, started=time.time(), ended=None)
        started = job["started"]
    threading.Thread(target=run_build, args=(args, name, clean, started, options["terrain_cell_m"],
                                           options["parked_cars"], options["tree_spacing_m"], options["ground_quality"]), daemon=True).start()
    return 200, {"ok": True}


def delete_track(name):
    """Delete one of our tracks (My tracks): its AC folder and its work folder; Map2Lap tracks only, not during a
    build. Renamed first: if AC holds the kn5 open that fails and nothing is missing (instead of half deleted);
    returns (HTTP code, response)."""
    root = os.path.join(settings.ac_path(), "content", "tracks", name)
    if not name or not os.path.exists(os.path.join(root, mytracks.FILE)):
        return 404, {"error": "That is not a Map2Lap track"}
    try:
        with trackcopy.alone():
            with lock:
                if job["state"] in ("running", "stopping"):
                    return 409, {"error": "Not while a build is running"}
            gone = root + ".deleting"
            shutil.rmtree(gone, ignore_errors=True)         # (left over from an earlier attempt)
            try:
                os.rename(root, gone)
            except OSError:
                return 409, {"error": "Could not delete it: close Assetto Corsa (or Content Manager's preview) and try again"}
            shutil.rmtree(gone, ignore_errors=True)
            trackedits.clear(name)
            tracknative.forget(name)
            shutil.rmtree(os.path.join(ROOT, "out", "tracks", name), ignore_errors=True)
            tracksource.tidy(settings.ac_path())            # (its source, if no copy names it)
    except trackcopy.Busy:
        return 409, {"error": "A track is being saved in the Editor: wait for it, then try again"}
    return 200, {"ok": True}


def race_ini():
    return os.path.join(system.documents(settings.ac_path()), "Assetto Corsa", "cfg", "race.ini")


def car_name(model):
    """A car's name from its ui_car.json (some mods: broken JSON, then the folder name)."""
    try:
        with open(os.path.join(settings.ac_path(), "content", "cars", model, "ui", "ui_car.json"),
                  encoding="utf-8-sig", errors="replace") as f:
            return str(json.loads(f.read(), strict=False).get("name") or model).strip()
    except (OSError, ValueError, AttributeError):
        return model


def cars():
    """The installed cars (with skins) by name: [{id, name}] (Settings, car for Play)."""
    root = os.path.join(settings.ac_path(), "content", "cars")
    out = [{"id": d, "name": car_name(d)} for d in (os.listdir(root) if os.path.isdir(root) else [])
           if os.path.isdir(os.path.join(root, d, "skins"))]
    return sorted(out, key=lambda c: c["name"].lower())


def last_car():
    """The car driven last from race.ini (Content Manager writes it on every start): folder or None."""
    import configparser
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.optionxform = str
    try:
        ini.read(race_ini(), encoding="utf-8")
        return ini.get("RACE", "MODEL")
    except (configparser.Error, OSError, UnicodeDecodeError):
        return None


def play_car():
    """The car for Play: the one set (if still installed), else the one driven last; (folder, name) or (None,
    None)."""
    model = settings.load()["car"]
    if not (model and os.path.isdir(os.path.join(settings.ac_path(), "content", "cars", model))):
        model = last_car()
    return (model, car_name(model)) if model else (None, None)


def sun_angle(clock):
    """race.ini's [LIGHTING] SUN_ANGLE for a local clock hour, as Content Manager writes it: 16 degrees an hour from 13:00,
    below -80 and above 80 too for the hours of the night (CSP reads them). Pure."""
    return 16.0 * (clock - 13.0)


def valid_clock(clock):
    """Whether clock is an hour of the day, 0 up to 24. Pure."""
    return isinstance(clock, (int, float)) and not isinstance(clock, bool) and 0 <= clock < 24     # (NaN compares false)


@lru_cache(maxsize=128)
def _timing_points_present(path, revision):
    """Read gate names of this installed KN5 revision. Edits and rebuilds have their own revision."""
    points = kn5.scan(path)["points"]
    return route_race.has_gates(points)


def _has_ab_timing(path):
    try:
        stat = os.stat(path)
        return _timing_points_present(path, (stat.st_ino, stat.st_size, stat.st_mtime_ns))
    except (OSError, ValueError, struct.error, AssertionError):
        return False


def _opponent_limit(track_dir):
    """Available AI grid slots from the installed default layout."""
    root = Path(track_dir)
    info = mytracks.load(root) or {}
    if info.get("area") or not ((root / fastlane.ROUTE).is_file() or (root / fastlane.FILE).is_file() or mytracks.is_circuit(root)):
        return 0
    try:
        data = json.loads((root / "ui/ui_track.json").read_text(encoding="utf-8-sig"))
        pits = data.get("pitboxes")
        if type(pits) is not int and not (isinstance(pits, str) and pits.isdecimal()):
            return 0
        return max(0, min(int(pits), obj_to_kn5.SLOTS) - 1)
    except (OSError, ValueError, AttributeError):
        return 0


def _race_ai(ai, track_dir, installed):
    """Validate a Race's opponent count, common strength, aggression and optional car."""
    # Aggression 50 by default: at 0 opponents held back from the car ahead and rarely overtook (2026-11-25).
    if ai is None:
        return 0, 95, 50, ""
    if not isinstance(ai, dict):
        raise ValueError("Invalid AI settings")
    opponents, strength, aggression, car = (ai.get(key, default) for key, default in
                                            (("opponents", 0), ("strength", 95), ("aggression", 50), ("car", "")))
    limit = _opponent_limit(track_dir)
    if type(opponents) is not int or not 0 <= opponents <= limit:
        raise ValueError(f"Choose up to {limit} AI opponents" if limit else "This track has no AI grid and line")
    # Content Manager's standard Quick Drive ranges. Per-car aggression is written as a percentage.
    if type(strength) is not int or not 70 <= strength <= 100:
        raise ValueError("AI strength must be 70–100%")
    if type(aggression) is not int or not 0 <= aggression <= 100:
        raise ValueError("AI aggression must be 0–100%")
    if not isinstance(car, str) or (car and car not in installed):
        raise ValueError("That opponent car is not installed")
    return opponents, strength, aggression, car


def _car_skins(ac, model):
    """Installed livery directories for a validated car, in a stable order."""
    return sorted(path.name for path in (Path(ac) / "content/cars" / model / "skins").iterdir() if path.is_dir())


def _write_race_grid(ini, player, ai, ac, installed):
    """Write AI entries into race.ini; the local player starts behind the opponents."""
    opponents, strength, aggression, opponent_car = ai
    if not opponents:
        return
    model = ini["RACE"]["MODEL"]
    opponent_car = opponent_car or model
    if opponent_car not in installed:
        raise ValueError("That opponent car is not installed")
    skins = _car_skins(ac, opponent_car)
    if not skins:
        raise ValueError("The opponent car has no installed skins")
    if opponent_car == model and (skin := ini[player].get("SKIN", ini["RACE"].get("SKIN"))) in skins:
        skins.remove(skin)
        skins.append(skin)
    ini["RACE"].update({"CARS": str(opponents + 1), "AI_LEVEL": "100"})
    ini["SESSION_0"]["STARTING_POSITION"] = str(opponents + 1)
    for i in range(opponents):
        ini[f"CAR_{i + 1}"] = {
            "MODEL": opponent_car, "SKIN": skins[i % len(skins)], "SETUP": "", "MODEL_CONFIG": "",
            "AI_LEVEL": str(strength), "AI_AGGRESSION": str(aggression), "DRIVER_NAME": f"AI {i + 1}",
            "BALLAST": "0", "RESTRICTOR": "0", "NATION_CODE": "", "NATIONALITY": "",
        }


def _watch_best(race_file, track, car):
    """Watch a timed session's result independently of the Play request."""
    started_ns = os.stat(race_file).st_mtime_ns
    documents = os.path.dirname(os.path.dirname(race_file))
    threading.Thread(target=personalbest.watch, args=(documents, track, car, started_ns), daemon=True).start()


def _previous_best(ac, race_file, ini, resume=False):
    """Pick up the last timed local drive if the server wasn't around when AC closed."""
    track = ini.get("RACE", "TRACK", fallback="")
    car = ini.get("RACE", "MODEL", fallback="")
    session = ini.get("SESSION_0", "TYPE", fallback="")
    if (not track or generator.slug(track) != track or not car or
            (session != "3" and ini.get("RACE", "CARS", fallback="") != "1") or
            ini.get("RACE", "CONFIG_TRACK", fallback="") or
            ini.get("REMOTE", "ACTIVE", fallback="0") != "0" or session not in ("1", "3", "4")):
        return
    directory = os.path.join(ac, "content", "tracks", track)
    if not mytracks.is_circuit(directory):
        if session == "3" and ini.get("SESSION_0", "LAPS", fallback="") != "1":
            return
        if not _has_ab_timing(os.path.join(directory, track + ".kn5")):
            return
    try:
        if resume and system.running("acs.exe"):
            _watch_best(race_file, track, car)
        else:
            documents = os.path.dirname(os.path.dirname(race_file))
            personalbest.import_result(documents, track, car, os.stat(race_file).st_mtime_ns)
    except (OSError, UnicodeError) as error:
        print(f"Assetto Corsa Personal Best could not be saved: {error}", flush=True)


def _resume_best():
    """Recheck the last timed session when the generator page starts."""
    import configparser
    ac = settings.ac_path()
    if not ac:
        return
    race_file = race_ini()
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    try:
        ini.read(race_file, encoding="utf-8-sig")
    except (configparser.Error, UnicodeError):
        return
    _previous_best(ac, race_file, ini, resume=True)


def _retire_route_layouts(ac):
    """On server startup, remove Map2Lap's old green-to-finish layouts while AC is closed."""
    if not ac or route_race.ac_running():
        return
    for config in (Path(ac) / "content/tracks").glob(f"*/{route_race.RACE}"):
        folder = config.parent
        if not (folder / mytracks.FILE).is_file() or not (folder / route_race.PRACTICE_MODEL).is_file():
            continue
        try:
            if route_race.remove_race_layout(folder / f"{folder.name}.kn5"):
                print(f"Removed old Route Race layout from {folder}", flush=True)
        except (OSError, UnicodeError) as error:
            print(f"Could not remove old Route Race layout from {folder}: {error}", flush=True)


def _play_blocker():
    """Why AC cannot start right now, while the server lock is held."""
    if job["state"] in ("running", "stopping"):
        return "Not while a build is running"
    if csp.busy():
        return "CSP is being installed: wait for it, then play"
    if system.running("acs.exe"):
        return "Assetto Corsa is already running"
    return None


def _launch_play(ac, track_file, race_file, ini, selected_weather, effects, *, timed):
    """Prepare the track and launch one AC session while status requests remain independent."""
    name = ini.get("RACE", "TRACK")
    if not play_lock.acquire(blocking=False):
        return 409, {"error": "A drive is already being prepared"}
    try:
        with lock:
            if error := _play_blocker():
                return 409, {"error": error}
        try:
            track_dir = os.path.dirname(track_file)
            weather.install_track(track_dir, weather.scenery_options(ini, selected_weather), effects=effects)
            if ini.get('LIGHTING', '__CM_WEATHER_CONTROLLER', fallback='') == 'map2lap':
                weather.install_controller(ac)
        except OSError as error:
            return 409, {"error": f"Weather could not be prepared: {error}"}
        with lock:
            if error := _play_blocker():
                return 409, {"error": error}
            if ini.getint("RACE", "CARS") > 1 and ini.getint("SESSION_0", "TYPE") == 3:
                try:
                    with trackcopy.alone():
                        if route_race.ac_running():
                            return 409, {"error": "Assetto Corsa is using the track"}
                        dnfparking.install(Path(track_file))
                except trackcopy.Busy:
                    return 409, {"error": "Wait for the current Editor save before racing"}
                except OSError as error:
                    return 409, {"error": f"Could not prepare retired AI parking: {error}"}
            with open(race_file, "w", encoding="utf-8") as f:
                ini.write(f, space_around_delimiters=False)
            system.start_ac(ac, weather_effects=effects)
            if timed:
                _watch_best(race_file, name, ini.get("RACE", "MODEL"))
    finally:
        play_lock.release()
    return 200, {"ok": True}


def play(name, clock=None, weather_options=None, car=None, *, session=None, laps=None, ai=None, grip=None):
    """Drive the track in AC (My tracks and the Editor, "Play"): race.ini the way Content Manager writes it, with the last
    settings (car, skin, weather, assists) but this track and offline; then acs.exe (system.start_ac;
    system.ensure_steam starts Steam if needed). clock: the local hour to start at (the Editor's), else the last one stays.
    car: an installed car folder for this session, empty for last driven, None for the saved setting.
    session: Practice, Hotlap or Race; laps and ai are Race options. Without a session, laps selects Race.
    Returns (HTTP code, response)."""
    import configparser
    if clock is not None and not valid_clock(clock):
        return 400, {"error": "The time of day is not an hour of the day"}
    if grip is not None and not weather.valid_grip(grip):
        return 400, {"error": "Choose a track grip preset or percentages between 0 and 100"}
    installed = {c["id"] for c in cars()} if car or ai is not None else set()
    if car is not None and (not isinstance(car, str) or (car and car not in installed)):
        return 400, {"error": "That car is not installed"}
    try:
        selected_weather = weather.parse(weather_options) if weather_options is not None else None
    except ValueError as error:
        return 400, {"error": str(error)}
    ac = settings.ac_path()
    track_dir = os.path.join(ac, "content", "tracks", name)
    track_file = os.path.join(track_dir, name + ".kn5")
    if not os.path.exists(track_file):
        return 404, {"error": "This track has no track file (build it again)"}
    circuit = mytracks.is_circuit(track_dir)
    timed_route = not circuit and _has_ab_timing(track_file)
    if session is None:
        session = "practice" if laps is None else "race"
    if session not in ("practice", "hotlap", "race"):
        return 400, {"error": "Choose Practice, Hotlap or Race"}
    if session != "race" and (laps is not None or ai is not None):
        return 400, {"error": "Laps and AI opponents are Race options"}
    if session == "hotlap" and not (circuit or timed_route):
        return 400, {"error": "Hotlap requires a Circuit or a Route with start and finish timing"}
    lane_choice = ai if isinstance(ai, dict) else {}
    if session == "race":
        if laps is None and timed_route:
            laps = 1
        # AC represents the session's lap count as a signed 32-bit integer.
        if type(laps) is not int or not 1 <= laps < 2**31:
            return 400, {"error": "Enter a whole number of laps from 1 to 2147483647"}
        if not circuit and not (timed_route and laps == 1):
            return 400, {"error": "Race requires a Circuit or one run on a Route with start and finish timing"}
        try:
            ai = _race_ai(ai, track_dir, installed)
        except ValueError as error:
            return 400, {"error": str(error)}
    with lock:
        if error := _play_blocker():
            return 409, {"error": error}
    if not system.ensure_steam():
        return 409, {"error": "Steam did not start (or is not signed in): start it and try again"}
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.optionxform = str
    race_file = race_ini()
    try:
        ini.read(race_file, encoding="utf-8-sig")
    except (configparser.Error, UnicodeDecodeError):
        ini = None
    if ini is None or not ini.has_option("RACE", "MODEL"):
        return 409, {"error": "Drive once in Assetto Corsa first, so Map2Lap knows your car"}
    _previous_best(ac, race_file, ini)
    player = next((section for section in ini.sections() if section.upper() == "CAR_0"), "CAR_0")
    model = play_car()[0] if car is None else (last_car() if car == "" else car)
    if model and model != ini.get("RACE", "MODEL"):        # (the car set, its first skin)
        skin = next(iter(_car_skins(ac, model)), "")
        for k, v in (("MODEL", model), ("MODEL_CONFIG", ""), ("SKIN", skin)):
            ini.set("RACE", k, v)
        if ini.has_section(player):
            for k, v in (("MODEL", "-"), ("MODEL_CONFIG", ""), ("SKIN", skin), ("SETUP", "")):
                ini.set(player, k, v)
    if not ini.has_section(player):
        ini[player] = {"MODEL": "-", "MODEL_CONFIG": "", "SKIN": ini.get("RACE", "SKIN", fallback=""), "SETUP": ""}
    driver_keys = [key for key in ini[player] if key.casefold() == "driver_name"]
    if not any(ini[player][key].strip() for key in driver_keys):
        ini[player][driver_keys[-1] if driver_keys else "DRIVER_NAME"] = drivername.get(os.path.dirname(os.path.dirname(race_file)))
    ini.set("RACE", "TRACK", name)
    ini.set("RACE", "CONFIG_TRACK", "")
    ini.set("RACE", "CARS", "1")
    for sec in ini.sections():
        if (sec.upper().startswith("CAR_") and sec != player) or (sec.startswith("SESSION_") and sec != "SESSION_0"):
            ini.remove_section(sec)
    for sec in ("REMOTE", "REPLAY", "BENCHMARK", "RESTART", "__PREVIEW_GENERATION"):
        if ini.has_section(sec):
            ini.set(sec, "ACTIVE", "0")
    start = {"NAME": "Practice", "TYPE": "1", "DURATION_MINUTES": "0", "SPAWN_SET": "START"}
    if session == "practice":
        if not ini.has_section("SESSION_0"):
            ini.add_section("SESSION_0")
        ini["SESSION_0"].update(start)
        for option in ("LAPS", "STARTING_POSITION", "WAIT_TIME"):
            ini.remove_option("SESSION_0", option)
        ini.remove_option("RACE", "RACE_LAPS")
    elif session == "hotlap":
        ini["SESSION_0"] = {**start, "NAME": "Hotlap", "TYPE": "4", "SPAWN_SET": "HOTLAP_START"}
        ini.remove_option("RACE", "RACE_LAPS")
    else:
        ini["SESSION_0"] = {**start, "NAME": "Race", "TYPE": "3", "LAPS": str(laps), "WAIT_TIME": "0"}
        ini["RACE"]["RACE_LAPS"] = str(laps)
        try:
            _write_race_grid(ini, player, ai, ac, installed)
        except (OSError, ValueError) as error:
            return 400, {"error": str(error)}
    if clock is not None:
        if not ini.has_section("LIGHTING"):
            ini.add_section("LIGHTING")
        ini.set("LIGHTING", "SUN_ANGLE", f"{sun_angle(clock):.2f}")
    if grip is not None:
        weather.apply_grip(ini, grip)
    if selected_weather is not None:
        weather.apply_session(ini, selected_weather)
    effects = settings.load()['weather_effects']
    if not ini.has_section('LIGHTING'):
        ini.add_section('LIGHTING')
    ini['LIGHTING']['__MAP2LAP_WEATHER_EFFECTS'] = str(int(effects))

    def launch():
        return _launch_play(ac, track_file, race_file, ini, selected_weather, effects, timed=circuit or timed_route)

    if session == "race" and ai[0]:
        return ailanejobs.race(Path(track_file), circuit, lane_choice, launch)
    return launch()


def has_build_files(name):
    """Whether the track name's build files are kept (out/tracks/<name>/tiles: what the tools set the engine up from)."""
    return os.path.isdir(os.path.join(ROOT, "out", "tracks", name, "tiles"))


def web_file(path, web=WEB):
    """The page's file for the URL path, or None (nothing outside the folder web). Pure."""
    rel = "index.html" if path == "/" else unquote(path.split("?")[0]).lstrip("/")
    file = os.path.normpath(os.path.join(web, rel))
    if not file.startswith(os.path.normpath(web) + os.sep) or not os.path.isfile(file):
        return None
    return file


def install_csp(path):
    """Explicit install for the AC folder shown by the page; captures the path before background work starts."""
    ac = settings.ac_path()
    if not isinstance(path, str) or os.path.normcase(os.path.realpath(path)) != os.path.normcase(os.path.realpath(ac)):
        return 409, {"error": "The Assetto Corsa folder changed. Check the folder and try again."}
    with lock:
        if job["state"] in ("running", "stopping") or running["clearing"] or trackcopy.busy():
            return 409, {"error": "Wait for the current build, save or cache cleanup before installing CSP."}
        if updater.state["state"] in ("downloading", "restarting"):
            return 409, {"error": "Map2Lap is installing an update"}
        try:
            return 202, csp.start(ac)
        except (ValueError, OSError) as error:
            return 409, {"error": str(error)}


def install_update():
    """Settings → "Install update": the newest release is downloaded in the background (updater), then the server ends
    for "Start Map2Lap.bat" (start.sh) to put it in and start it again; not during a build; returns (HTTP code,
    response)."""
    if not updater.possible():
        return 409, {"error": "Not a release folder: update it with git"}
    with lock:
        if csp.busy():
            return 409, {"error": "Wait for CSP installation before updating Map2Lap"}
        if job["state"] in ("running", "stopping") or running["clearing"]:
            return 409, {"error": "Not while a build is running"}
        if trackcopy.busy():
            return 409, {"error": "A track is being saved in the Editor: wait for it, then update"}
        if updater.state["state"] in ("downloading", "restarting"):
            return 409, {"error": "The update is already being installed"}
        updater.state.update(state="downloading", done=0, total=0, error=None)
    rel = version.latest(fresh=True)
    if not (rel and rel["archive"] and version.key(rel["version"]) > version.key(version.VERSION)):
        updater.state["state"] = "idle"
        return 409, {"error": "No newer release for this system on GitHub"}
    threading.Thread(target=_install, args=(rel,), daemon=True).start()
    return 200, {"ok": True, "version": rel["version"]}


def _install(rel):
    try:
        updater.download(rel)
    except Exception as e:
        updater.state.update(state="error", error=str(e))
        return
    updater.state["state"] = "restarting"
    time.sleep(2)                   # (the page's next poll sees "restarting")
    os._exit(updater.RESTART)


def clear_cache():
    """Delete the map data (Settings), not during a build; returns (HTTP code, response)."""
    with lock:
        if job["state"] in ("running", "stopping") or running["clearing"]:
            return 409, {"error": "Not while a build is running"}
        running["clearing"] = True
    try:
        freed = mapcache.clear()
        size, files = mapcache.usage()
    finally:
        with lock:
            running["clearing"] = False
    return 200, {"bytes": size, "files": files, "freed": freed}


def build_files_bytes():
    """Bytes of the build files in out/tracks: what "Keep build files" (Settings) has kept, a build's while it runs."""
    total = 0
    for folder, _dirs, files in os.walk(os.path.join(ROOT, "out", "tracks")):
        for name in files:
            try:
                total += os.path.getsize(os.path.join(folder, name))
            except OSError:         # (gone in the meantime)
                pass
    return total


def clear_build_files():
    """Delete the build files (Settings), not during a build; the tracks in AC, the map data and the settings stay;
    returns (HTTP code, response)."""
    with lock:
        if job["state"] in ("running", "stopping") or running["clearing"]:
            return 409, {"error": "Not while a build is running"}
        running["clearing"] = True
    try:
        shutil.rmtree(os.path.join(ROOT, "out", "tracks"), ignore_errors=True)
        size = build_files_bytes()
    finally:
        with lock:
            running["clearing"] = False
    return 200, {"bytes": size}


class Server(ThreadingHTTPServer):
    # (the 5 of socketserver: a burst finds the queue full, and Windows refuses the connection: the page's "Failed to fetch")
    request_queue_size = 128


class Handler(EditorHandlers, LibraryHandlers, RoadToolHandlers, BaseHTTPRequestHandler):
    # (connections kept: the Editor asks for a long track's 66,000 parts, each on a connection of its own would leave a port waiting
    # for minutes, of the 16,000 Windows has for them)
    protocol_version = "HTTP/1.1"

    def _send(self, code, body, ctype="application/json; charset=utf-8", headers=None):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        if self.command != "GET":       # (a request refused can leave its body unread: the next one would start in it)
            self.send_header("Connection", "close")
        try:
            self.end_headers()
            self.wfile.write(data)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Selection changes can cancel an in-flight reply; never send an error on that dead connection.
            self.close_connection = True

    def _send_weights(self, compressed, ctype="application/octet-stream"):
        """Let Fetch decompress lossless weights; clients declining gzip receive identical original bytes."""
        accepts = self.headers.get("Accept-Encoding", "")
        encoded = any(re.fullmatch(r"gzip(?:\s*;\s*q=(?:1(?:\.0*)?|0\.[0-9]*[1-9][0-9]*))?", part.strip(), re.I)
                      for part in accepts.split(","))
        headers = {"Vary": "Accept-Encoding", **({"Content-Encoding": "gzip"} if encoded else {})}
        self._send(200, compressed if encoded else gzip.decompress(compressed), ctype, headers)

    def _body(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def _own_page(self, content_type="application/json"):
        """Whether a request can only come from the page itself: another site can't send this type without asking first (no
        answer to that here), nor reach this server under another name."""
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0]
        return host in LOCAL_HOSTS and (self.headers.get("Content-Type") or "").split(";", 1)[0].strip() == content_type

    def _save_track(self, name):
        """Save in the Editor (trackcopy.save): the track name in its place, or (copy) as a new one; the answer comes when it is
        written."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can save a track"})
        if not trackedits.NAME.fullmatch(name):
            return self._send(404, {"error": "This track has no track file (build it again)"})
        try:
            body = self._body()
            copy, revision = bool(body.get("copy")), body.get("revision")
            title = (body.get("title") or "").strip()[:TITLE_MAX] or None
        except (ValueError, AttributeError):
            return self._send(400, {"error": "No request"})

        def may_start():
            with lock:
                if job["state"] in ("running", "stopping"):
                    raise trackcopy.Refused("A build is running: wait for it, then try again")
                if updater.state["state"] in ("downloading", "restarting"):
                    raise trackcopy.Refused("Map2Lap is installing an update: wait for it, then save")
        ac = settings.ac_path()
        if copy and (not title or title in (t["title"] for t in mytracks.listing(ac))):     # (a tab's list can be older than this)
            return self._send(409, {"error": "A new track needs a name no track has"})
        copy_to = mytracks.free_name(ac, generator.slug(title)) if copy else None
        try:
            self._send(200, trackcopy.save(ac, name, copy_to, title, revision, may_start))
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackcopy.Busy:
            self._send(409, {"error": "A track is being saved already"})
        except (trackcopy.Refused, trackedits.Invalid) as e:
            self._send(409, {"error": str(e)})
        except OSError as e:
            self._send(500, {"error": str(e)})

    def do_PUT(self):
        edits = EDITS_PATH.fullmatch(self.path)
        if not edits:
            return self._send(404, {"error": "not found"})
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can save changes"})
        try:
            size = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            size = -1
        if size < 0:
            self.close_connection = True
            return self._send(400, {"error": "No list of changes"})
        if size > trackedits.MAX_PUT_BYTES:
            self.close_connection = True    # (its body stays unread)
            return self._send(413, {"error": "Too many changes"})
        try:
            body = json.loads(self.rfile.read(size))
        except ValueError:
            return self._send(400, {"error": "No list of changes"})
        # (the draft has its own limit; the Undo steps beside it theirs, trackhistory.MAX_BYTES)
        if size > trackedits.MAX_BYTES and isinstance(body, dict) and len(json.dumps({k: v for k, v in body.items() if k != "history"})) > trackedits.MAX_BYTES:
            return self._send(413, {"error": "Too many changes"})
        self._edits_answer(lambda: trackedits.save_telling(settings.ac_path(), edits[1], body))

    def _feedback(self, route=None):
        """Serve local feedback JSON. Only this page can submit or acknowledge a ticket."""
        headers = {"Cache-Control": "no-store"}
        try:
            if self.command == "GET":
                if (self.headers.get("Host") or "").rsplit(":", 1)[0] not in LOCAL_HOSTS:
                    return self._send(403, {"error": "Only the Map2Lap page can read tickets."})
                return self._send(200, feedback.history(opened=self.path.endswith("?open=1")), headers=headers)
            if not self._own_page():
                return self._send(403, {"error": "Only the Map2Lap page can change tickets."})
            length = int(self.headers.get("Content-Length", 0))
            if not 0 <= length <= feedback.BODY_BYTES:
                return self._send(413, {"error": "The upload is too large."})
            body = self._body()
            if not isinstance(body, dict):
                raise ValueError()
            if route[2] == "seen":
                return self._send(200, feedback.mark_seen(route[1], body.get("entry")))
            return self._send(201, feedback.send(body, route[1]))
        except feedback.FeedbackError as exc:
            if "retry_after" in exc.answer:
                headers["Retry-After"] = str(exc.answer["retry_after"])
            return self._send(exc.status, exc.answer, headers=headers)
        except ValueError:
            return self._send(400, {"error": "Invalid feedback request."})
        except OSError:
            return self._send(500, {"error": "Could not read or save feedback settings."})

    def do_GET(self):
        if self.path in ("/api/feedback", "/api/feedback?open=1"):
            return self._feedback()
        lane = re.fullmatch(r"/api/editor/([a-z0-9_]+)/ai-line/progress", self.path)
        if lane:
            name = lane[1]
            model = Path(settings.ac_path(), "content", "tracks", name, name + ".kn5")
            return self._send(200, {"phase": ailanejobs.track(model).phase}, headers={"Cache-Control": "no-store"})
        progress = PROGRESS_PATH.fullmatch(self.path)
        if progress:
            return self._send(200, painting.get(generator.slug(progress[1]), {}))
        weights = re.fullmatch(r"/api/editor/([^/]+)/paint-weights/([a-f0-9]{64})", self.path)
        if weights:
            try:
                return self._send_weights(trackdetail.weight_bundle(settings.ac_path(), generator.slug(weights[1]), weights[2]))
            except trackview.Unreadable as error:
                return self._send(409, {"error": str(error)})
            except (ValueError, OSError, trackview.NotOurs) as error:
                return self._send(400, {"error": str(error)})
        region = re.fullmatch(r"/api/editor/([^/]+)/paint-region/([a-f0-9]{64})/([a-f0-9]{64})", self.path)
        if region:
            try:
                raw = trackdetail.region_image(settings.ac_path(), generator.slug(region[1]), region[2], region[3])
                return self._send(200, raw, "application/octet-stream")
            except (ValueError, OSError, trackview.Unreadable, trackview.NotOurs) as error:
                return self._send(400, {"error": str(error)})
        if self.path == "/api/csp":
            return self._send(200, csp.status(settings.ac_path()))
        if urlsplit(self.path).path.startswith("/api/library/"):
            return self._library()
        model_asset = re.fullmatch(r"/api/editor/([^/]+)/model-asset/([a-f0-9]{64})", self.path)
        if model_asset:
            try:
                from app import trackmodels
                return self._send(200, trackmodels.original(settings.ac_path(), model_asset[1], model_asset[2]), "model/gltf-binary")
            except (ValueError, OSError, trackview.NotOurs) as error:
                return self._send(404, {"error": str(error)})
        detail = re.fullmatch(r"/api/editor/([^/]+)/(paint-mask|paint-asset|paint-data|paint-preview)/([a-f0-9]{64})", self.path)
        if detail:
            try:
                ac, name = settings.ac_path(), generator.slug(detail[1])
                if detail[2] == "paint-mask":
                    return self._send_weights(trackdetail.compressed_mask(ac, name, detail[3]), "image/vnd-ms.dds")
                reader = {"paint-mask": trackdetail.mask, "paint-asset": trackdetail.image, "paint-data": trackdetail.detail_image,
                          "paint-preview": trackinspect.paint_preview}[detail[2]]
                raw = reader(ac, name, detail[3])
                return self._send(200, raw, "image/png" if detail[2] in {"paint-preview", "paint-data"} else "image/vnd-ms.dds")
            except trackview.Unreadable as error:
                return self._send(409, {"error": str(error)})
            except (ValueError, OSError, trackview.NotOurs) as error:
                return self._send(400, {"error": str(error)})
        editor, edits = EDITOR_PATH.fullmatch(self.path), EDITS_PATH.fullmatch(self.path)
        if editor:
            self._editor(editor)
        elif (ai_line := AI_LINE_PATH.fullmatch(self.path)):
            self._ai_line(*ai_line.groups())
        elif (inspection := re.fullmatch(r"/api/editor/([^/]+)/(inspect|thumbnail|appearance|statistics)", urlsplit(self.path).path)):
            self._inspect(inspection[1], inspection[2])
        elif (surface := SURFACE_PATH.fullmatch(urlsplit(self.path).path)):
            self._surface(surface[1])
        elif (preparing := SURFACE_PREPARE_PATH.fullmatch(urlsplit(self.path).path)):
            self._prepare_surface(preparing[1])
        elif (glow := GLOW_PATH.fullmatch(self.path)):
            mask = trackview.glow_bytes(settings.ac_path(), generator.slug(glow[1]), glow[2])
            self._send(200 if mask else 204, mask or b"", "image/png")     # (204: a track built before: no fault in the browser's log)
        elif (trees := TREEFX_PATH.fullmatch(self.path)):
            self._treefx(*trees.groups())
        elif (copies := COPIES_PATH.fullmatch(self.path)):
            self._edits_answer(lambda: trackview.copy_index(settings.ac_path(), generator.slug(copies[1])))
        elif edits:
            self._edits_answer(lambda: trackedits.load_with_history(settings.ac_path(), edits[1]))
        elif (saved_edits := re.fullmatch(r"/api/editor/([^/]+)/edits/saved", self.path)):
            self._edits_answer(lambda: trackedits.saved_edits(settings.ac_path(), generator.slug(saved_edits[1])))
        elif self.path == "/api/status":
            with lock:
                st = dict(job)
            st["elapsed"] = ((st["ended"] or time.time()) - st["started"]) if st["started"] else None
            self._send(200, st)
        elif self.path == "/api/settings":
            self._send(200, settings_view())
        elif self.path == "/api/tracks":
            ac = settings.ac_path()
            tracks = [{**t, "build_files": has_build_files(t["name"]), "draft": trackedits.changes(ac, t["name"])} for t in mytracks.listing(ac)]
            if tracks:
                times = personalbest.fastest_by_track(os.path.join(system.documents(ac), "Assetto Corsa"))
                for track in tracks:
                    if track["kind"] == "route" and not track.get("area_m") and track["kn5_bytes"]:
                        name = track["name"]
                        track["ab_timing"] = _has_ab_timing(os.path.join(ac, "content", "tracks", name, name + ".kn5"))
                    if (best := times.get(track["name"].casefold())) is not None:
                        model, elapsed = best
                        track["best_lap"] = {"car": car_name(model), "time_ms": elapsed}
            self._send(200, {"tracks": tracks, "car": play_car()[1]})
        elif self.path == "/api/cars":
            last = last_car()
            self._send(200, {"cars": cars(), "last": car_name(last) if last else None})
        elif urlsplit(self.path).path == "/api/play/options":
            name = generator.slug(parse_qs(urlsplit(self.path).query).get("name", [""])[0])
            track = os.path.join(settings.ac_path(), "content", "tracks", name)
            self._send(200, {"max_opponents": _opponent_limit(track), "grip": weather.grip_options(race_ini())})
        elif self.path in ("/api/update", "/api/update?fresh=1"):   # (a newer Map2Lap on GitHub: the page links it)
            rel = version.latest(fresh=self.path.endswith("fresh=1"))
            newer = bool(rel) and version.key(rel["version"]) > version.key(version.VERSION)
            self._send(200, {"newer": newer, "can_install": newer and bool(rel["archive"]) and updater.possible(),
                             **(rel or {})})
        elif self.path == "/api/update/progress":
            self._send(200, updater.state)
        elif self.path == "/api/cache":             # (counts every file: ~2 s for 170,000)
            size, files = mapcache.usage()
            self._send(200, {"bytes": size, "files": files})
        elif self.path == "/api/buildfiles":
            self._send(200, {"bytes": build_files_bytes()})
        else:
            file = web_file(self.path)
            if file is None:
                return self._send(404, {"error": "not found"})
            with open(file, "rb") as f:
                self._send(200, f.read(), WEB_TYPES.get(os.path.splitext(file)[1], "application/octet-stream"))

    def do_POST(self):
        if route := re.fullmatch(r"/api/feedback(?:/([1-9][0-9]*)/(messages|seen))?", self.path):
            return self._feedback(route)
        preview = re.fullmatch(r"/api/editor/([a-z0-9_]+)/ai-line/(move-preview|margins)", self.path)
        if preview:
            if not self._own_page():
                return self._send(403, {"error": "Only the editor can preview AI line edits"})
            try:
                from server_editor import _installed_lane, _margin_preview, _move_preview
                body = self._body()
                if preview[2] == "margins":
                    with _installed_lane(preview[1]) as model:
                        result = _margin_preview(model, body)
                else:
                    model = Path(trackview.kn5_path(settings.ac_path(), preview[1]))
                    result = _move_preview(model, body)
                return self._send(200, result)
            except trackview.Unreadable as e:
                return self._send(409, {"changed": True, "error": str(e)})
            except (trackview.NotOurs, *ailinestate.ERRORS) as e:
                return self._send(400, {"error": ailinestate.reason(e)})
        lane = re.fullmatch(r"/api/editor/([a-z0-9_]+)/ai-line/recalculate", self.path)
        if lane:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can recalculate a line"})
            ac, name = settings.ac_path(), lane[1]
            try:
                model = Path(trackview.kn5_path(ac, name))
            except trackview.NotOurs:
                return self._send(404, {"error": "Track file missing"})
            if (mytracks.load(model.parent) or {}).get("area"):
                return self._send(400, {"error": "AI lines require a Route or Circuit"})
            try:
                options = self._body()
                saved_inputs = options.get("inputs")
                retry = options.get("retry", True) is True
            except (ValueError, AttributeError):
                return self._send(400, {"error": "Invalid AI line request"})
            if saved_inputs is None and trackedits.changes(ac, name):
                return self._send(409, {"error": "Save the track first."})
            with lock:
                if error := _play_blocker():
                    return self._send(200, {"status": "deferred", "message": error})
            result = ailanejobs.ensure(model, mytracks.is_circuit(model.parent), retry=retry, saved_inputs=saved_inputs,
                                       place_margins=retry)
            if result["status"] in ("superseded", "deferred") or result.get("hints", {}).get("unplaced") == "manual":
                return self._send(200, result)
            if result["status"] != "ready":
                return self._send(409, {"error": result.get("message", "The installed AI line changed. Please retry.")})
            return self._send(200, result)
        if self.path == "/api/csp/install":
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can install CSP"})
            try:
                size = int(self.headers.get("Content-Length") or 0)
                if not 0 < size <= 4096:
                    return self._send(400, {"error": "No valid CSP installation request"})
                body = self._body()
                if not isinstance(body, dict):
                    raise ValueError("No valid CSP installation request")
                code, answer = install_csp(body.get("path"))
                return self._send(code, answer)
            except (ValueError, TypeError):
                return self._send(400, {"error": "No valid CSP installation request"})
        if urlsplit(self.path).path.startswith("/api/library/"):
            return self._library()
        density = re.fullmatch(r"/api/editor/([^/]+)/car-density", self.path)
        if density:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can edit car density"})
            if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {"error": "Select fewer cars"})
            return self._edits_answer(lambda: trackedits.car_density(settings.ac_path(), density[1], self._body()))
        spacing = re.fullmatch(r"/api/editor/([^/]+)/tree-spacing", self.path)
        if spacing:
            if not self._own_page():
                return self._send(403, {'error': 'Only the page itself can edit tree spacing'})
            if int(self.headers.get('Content-Length') or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {'error': 'Select fewer trees'})
            return self._edits_answer(lambda: trackedits.tree_spacing(settings.ac_path(), spacing[1], self._body()))
        wall = re.fullmatch(r"/api/editor/([^/]+)/wall", self.path)
        if wall:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can edit a wall"})
            if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {"error": "Select fewer walls"})
            return self._edits_answer(lambda: trackedits.wall_edit(settings.ac_path(), wall[1], self._body()))
        paint = re.fullmatch(r"/api/editor/([^/]+)/(paint|paint-settings|textures)", self.path)
        if paint:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can edit materials"})
            if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {"error": "Too many material changes"})
            def work():
                body = self._body()
                ac, name = settings.ac_path(), generator.slug(paint[1])
                if paint[2] == "paint":
                    try:
                        return trackedits.paint(ac, name, body, lambda phase, done, total: painting.update(
                            {name: {"phase": phase, "done": done, "total": total}}))
                    finally:
                        painting.pop(name, None)
                if paint[2] == "paint-settings":
                    return trackedits.restyle(ac, name, body)
                try:
                    return {"paints": body["paints"], "textures": trackpaint.descriptors(ac, name, body["base"], body["paints"])}
                except (ValueError, KeyError, TypeError) as e:
                    raise trackedits.Invalid(str(e)) from e
            return self._edits_answer(work)
        move = MOVE_PATH.fullmatch(self.path)
        if move:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can move an object"})
            if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {"error": "No objects to move"})
            return self._edits_answer(lambda: trackedits.grounded(settings.ac_path(), move[1], self._body()))
        copy = COPY_PATH.fullmatch(self.path)
        if copy:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can copy an object"})
            if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {"error": "No object to copy"})
            return self._edits_answer(lambda: trackedits.copy_template(settings.ac_path(), copy[1], self._body()))
        model = re.fullmatch(r"/api/editor/([^/]+)/model", self.path)
        if model:
            if not self._own_page():
                return self._send(403, {"error": "Only the page itself can place a model"})
            if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
                self.close_connection = True
                return self._send(413, {"error": "Too many model settings"})
            return self._edits_answer(lambda: trackedits.model(settings.ac_path(), model[1], self._body()))
        save = SAVE_PATH.fullmatch(self.path)
        if save:
            return self._save_track(save[1])
        brush = BRUSH_PATH.fullmatch(self.path)
        if brush:
            return self._brush(brush[1], bool(brush[2]))
        band = BAND_PATH.fullmatch(self.path)
        if band:
            return self._band(band[1], band[2])
        bend = BEND_PATH.fullmatch(self.path)
        if bend:
            return self._bend(bend[1], bend[2])
        bank = BANK_PATH.fullmatch(self.path)
        if bank:
            return self._bank(bank[1], bank[2])
        separate = SEPARATE_PATH.fullmatch(self.path)
        if separate:
            return self._separate(separate[1], separate[2])
        railbridge = RAILBRIDGE_PATH.fullmatch(self.path)
        if railbridge:
            return self._railbridge(railbridge[1])
        sidewalk = SIDEWALK_PATH.fullmatch(self.path)
        if sidewalk:
            return self._sidewalk(sidewalk[1])
        kerb = KERB_PATH.fullmatch(self.path)
        if kerb:
            return self._kerb_way(kerb[1])
        stitch = STITCH_PATH.fullmatch(self.path)
        if stitch:
            return self._stitch_way(stitch[1])
        try:
            body = self._body()
            if self.path == "/api/route":
                points = [tuple(p) for p in body["points"]]
                if body.get("circuit_draft") or body.get("kind") == "circuit":
                    try:
                        if body.get("circuit_draft"):
                            pts, length = generator.circuit_draft(points)
                        else:
                            lap = generator.circuit_route(points)
                            pts, length = lap.coords, lap.length_m
                    except circuitlap.NoLap as e:
                        return self._send(400, {"error": str(e)})
                else:
                    pts, length = generator.route(points)
                self._send(200, {"coords": pts, "length_m": length})
            elif self.path == "/api/name":            # suggestion for the track name (generator.auto_title)
                self._send(200, {"title": generator.auto_title([tuple(p) for p in body.get("points") or []],
                                                               body.get("area"))})
            elif self.path == "/api/place":           # name for a pin set on the map (town, district)
                town, part = generator.place(float(body["lat"]), float(body["lon"]))
                self._send(200, {"name": ", ".join(x for x in (town, part) if x) or None})
            elif self.path == "/api/code" and body.get("make"):     # the code of a new route or area
                try:
                    code = trackcode.encode({**body["make"], "track_version": version.TRACK_VERSION})
                except ValueError as e:
                    return self._send(400, {"error": str(e)})
                self._send(200, {"code": code})
            elif self.path == "/api/code":            # a pasted track code: its pins and width, or its area
                try:
                    got = trackcode.decode(body.get("code"))
                except trackcode.BadCode as e:
                    self._send(200, {"error": str(e)})
                else:
                    self._send(200, {**got, "current": version.TRACK_VERSION})
            elif self.path == "/api/search":          # places for the start/finish/place fields
                self._send(200, {"places": generator.search((body.get("q") or "").strip()[:200])})
            elif self.path == "/api/settings":
                new = {}
                if "ac_path" in body:                  # (empty: look through Steam again)
                    p = os.path.normpath(body["ac_path"].strip()) if (body["ac_path"] or "").strip() else None
                    if p and not settings.is_ac(p):
                        return self._send(400, {"error": "No Assetto Corsa folder there (content/tracks is missing)"})
                    new["ac_path"] = p
                if "clean" in body:
                    new["clean"] = bool(body["clean"])
                if "cores" in body:
                    new["cores"] = min(100, max(1, int(body["cores"])))
                if "cache_gb" in body:                 # (0: no limit)
                    new["cache_gb"] = min(10000.0, max(0.0, float(body["cache_gb"])))
                if "car" in body:                      # (empty: the one driven last)
                    car = (body["car"] or "").strip() or None
                    if car and not os.path.isdir(os.path.join(settings.ac_path(), "content", "cars", car)):
                        return self._send(400, {"error": "That car is not installed"})
                    new["car"] = car
                if "debug_app" in body:
                    new["debug_app"] = bool(body["debug_app"])
                if "weather_effects" in body:
                    if not isinstance(body['weather_effects'], bool):
                        return self._send(400, {"error": "Weather effects must be on or off"})
                    new['weather_effects'] = body['weather_effects']
                s = settings.save(new)
                if "debug_app" in new or ("ac_path" in new and s["debug_app"]):   # (into a newly set AC folder too)
                    try:
                        debugapp.sync(settings.ac_path(), s["debug_app"])
                    except OSError as e:
                        return self._send(500, {"error": f"Track Debug app: {e}"})
                self._send(200, settings_view())
            elif self.path == "/api/browse":
                try:
                    self._send(200, {"path": browse_folder(settings.ac_path())})
                except system.NoPicker as e:
                    self._send(409, {"error": str(e)})
            elif self.path == "/api/build":
                name = generator.slug(body.get("name") or "route")
                mode = {"kind": "circuit"} if body.get("kind") == "circuit" else {}
                self._send(*start_build(name, body.get("title") or name, [tuple(p) for p in body.get("points") or []],
                                        body.get("width", 100), body.get("area"), body.get("terrain_cell_m", 2),
                                        body.get("parked_cars", True), body.get("tree_spacing_m", 0),
                                        body.get("ground_quality", "sd"), **mode))
            elif self.path == "/api/rebuild":           # a track from "My tracks" with its settings,
                name = generator.slug(body.get("name") or "")      # replaced or (copy) as a new one next to it
                info = mytracks.load(os.path.join(settings.ac_path(), "content", "tracks", name))
                if info is None:
                    return self._send(404, {"error": "No saved build settings for this track"})
                title = info["title"]
                mode = {"kind": "circuit", "circuit_source": name} if info.get("kind") == "circuit" else {}
                edits = info.get("edits") or {}
                if edits.get("aiCorrections") or edits.get("aiMargins"):
                    mode["ai_source"] = name
                if body.get("copy"):
                    name, title = mytracks.copy_name(settings.ac_path(), name, title)
                self._send(*start_build(name, title, [tuple(p) for p in info["points"]], body.get("width", info.get("width")),
                                        info.get("area"), body.get("terrain_cell_m", info.get("terrain_cell_m", 2)),
                                        body.get("parked_cars", info.get("parked_cars", True)),
                                        body.get("tree_spacing_m", info.get("tree_spacing_m", 0)),
                                        body.get("ground_quality", info.get("ground_quality", "sd")), **mode))
            elif self.path == "/api/play":
                if body.get("hotlap", False) is not False:
                    self._send(400, {"error": "Choose the session with the session field"})
                else:
                    self._send(*play(generator.slug(body.get("name") or ""), body.get("clock"), body.get("weather"),
                                     body.get("car"), session=body.get("session"), laps=body.get("laps"), ai=body.get("ai"),
                                     grip=body.get("grip")))
            elif self.path == "/api/delete":
                self._send(*delete_track(generator.slug(body.get("name") or "")))
            elif self.path == "/api/cache/clear":
                self._send(*clear_cache())
            elif self.path == "/api/buildfiles/clear":
                self._send(*clear_build_files())
            elif self.path == "/api/update/install":
                self._send(*install_update())
            elif self.path == "/api/stop":
                with lock:
                    p = running["proc"]
                    if job["state"] != "running" or p is None:
                        return self._send(409, {"error": "No build is running"})
                    job["state"] = "stopping"
                system.kill_tree(p.pid)         # (with the worker processes)
                self._send(200, {"ok": True})
            else:
                self._send(404, {"error": "not found"})
        except Exception as e:
            self._send(500, {"error": str(e)})

    def log_message(self, fmt, *args):      # (no line per status request in the terminal)
        pass


if __name__ == "__main__":
    system.trust_windows_certificates()
    srv = Server(("127.0.0.1", PORT), Handler)
    tidy_interrupted()
    _retire_route_layouts(settings.ac_path())
    _resume_best()
    try:
        trackcopy.tidy(settings.ac_path() or "")
    except OSError:
        pass                            # (AC folder not reachable: the next try makes its own room)
    updater.drop_old()
    try:                                # (AC as Settings say)
        debugapp.sync(settings.ac_path(), settings.load()["debug_app"])
    except OSError:
        pass
    print(f"Map2Lap: http://localhost:{PORT}  (stop with Ctrl+C)", flush=True)
    if "--no-browser" not in os.sys.argv:
        webbrowser.open(f"http://localhost:{PORT}")
    srv.serve_forever()
