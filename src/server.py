"""Local generator page: http://localhost:8800

Set points on the OpenStreetMap map, look at the route (OSRM), choose the corridor width and the name, build the
track; or an area instead of a route. "My tracks": build the tracks built before again with the current release
(mytracks), as a copy, delete them, play them. "Editor": a built track in 3D (trackview). The page: web/, built from ui/. Settings
(settings.py): AC folder, Play car, CPU share, map data cache limit (mapcache), keep build files.
Only one build at a time. It runs as a process of its own (generator.py): Stop ends it with its worker processes,
and every build uses the current code (a running server would otherwise build with the code from its start).

    .venv\\Scripts\\python.exe server.py
"""
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import threading
import time
import traceback
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlsplit

from app import named

if __name__ == "__main__":      # (before the engine loads: the python.exe left waiting stays small)
    named.restart_as("server")

import generator  # noqa: E402
import numpy as np  # noqa: E402

from app import (csp, debugapp, mapcache, materiallibrary, mytracks, roadnet, roadregion, settings, system, trackband, trackcode, trackcopy, trackedits, trackheights, tracksource,  # noqa: E402
                 trackdetail, trackinspect, trackpaint, trackview, updater, version)
from app.paths import ROOT, SRC  # noqa: E402

PORT = 8800
MATERIAL_UPLOADS = threading.BoundedSemaphore(2)  # Bound queued input buffers as well as the serialized image preparation.
job = {"state": "idle", "log": [], "result": None, "error": None,     # state: idle running stopping stopped done error
       "progress": None, "started": None, "ended": None}              # progress: generator.PHASES {phase, done, total}
running = {"proc": None, "clearing": False}     # clearing: the map data cache is being cleared (no build)
lock, dialog_lock = threading.Lock(), threading.Lock()
# The running build {name, clean, started, pid}: if the file is still there when the server starts, the server ended
# in the middle of a build (console window closed), and tidy_interrupted tidies up
MARK = os.path.join(ROOT, "out", "build_running.json")
BUILD_LOG = "build.log"     # a build's log among its build files (out/tracks/<name>): written only while "Keep build
                            # files" is on, replaced by the next build of the track, deleted with the build files
EDITOR_PATH = re.compile(r"/api/editor/([^/]+)/(?:index|(mesh|texture)/(\d+)\?r=([\w-]+)(?:&d=\d+)?(?:&c=[a-f0-9]*)?(?:&p=[a-f0-9]{64})?)")
COPIES_PATH = re.compile(r"/api/editor/([^/]+)/copies")
SURFACE_PATH = re.compile(r"/api/editor/([^/]+)/surface")
SURFACE_PREPARE_PATH = re.compile(r"/api/editor/([^/]+)/surface/prepare")
EDITS_PATH = re.compile(r"/api/editor/([^/]+)/edits")
SAVE_PATH = re.compile(r"/api/editor/([^/]+)/save")
BRUSH_PATH = re.compile(r"/api/editor/([^/]+)/brush(/preview)?")
COPY_PATH = re.compile(r"/api/editor/([^/]+)/copy")
MOVE_PATH = re.compile(r"/api/editor/([^/]+)/move")
BAND_PATH = re.compile(r"/api/editor/([^/]+)/band(?:/(way|preview))?")
LOCAL_HOSTS = ("127.0.0.1", "localhost")
TITLE_MAX = 80                  # (a track's name as Save in the Editor takes it: longer ones are cut)
IMAGE_TYPES = {".dds": "image/vnd-ms.dds", ".png": "image/png", ".jpg": "image/jpeg"}
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


def run_build(args, name, clean, started):
    code, result, keep = None, None, None
    try:
        keep = build_log(name, clean)
        p = subprocess.Popen([named.exe("build"), "-u", os.path.join(SRC, "generator.py"), "--result", *args], cwd=ROOT,
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8",
                             errors="replace", env={**named.child_env(), "PYTHONIOENCODING": "utf-8"}, **system.GROUP)
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
            "cache_gb": s["cache_gb"], "car": s["car"], "debug_app": s["debug_app"],
            "threads": os.cpu_count() or 2, "version": version.VERSION}


def saved_in_editor(name):
    """The answer (HTTP code, response) to a build that would replace the track name, saved in the Editor: its own work, which no
    build takes the place of. None for any other name. Two titles can give one name."""
    title = mytracks.saved_in_editor(settings.ac_path(), name)
    if title is None:
        return None
    return 409, {"error": f"A track saved in the Editor is called “{title}”: a build can't replace it, choose another name"}


def start_build(name, title, points, width, area):
    """Start a build (new and rebuild); returns (HTTP code, response)."""
    if not settings.is_ac(settings.ac_path()):
        return 400, {"error": "Assetto Corsa folder not found: set it in Settings"}
    if not area and len(points) < 2:
        return 400, {"error": "Set a start and a finish, or draw an area"}
    s = settings.load()
    clean = s["clean"]
    args = ["--name", name, "--title", title, "--cores", str(s["cores"]), "--cache-gb", str(s["cache_gb"])]
    if area:
        args += ["--area", *(str(float(v)) for v in area)]
    else:                           # ("--": a point like -33.9,151.2 is not an option)
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
    threading.Thread(target=run_build, args=(args, name, clean, started), daemon=True).start()
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


def play(name):
    """Drive the track in AC (My tracks, "Play"): race.ini the way Content Manager writes it, with the last settings
    (car, skin, weather, assists) but this track, Practice, no opponents and offline; then acs.exe (system.start_ac;
    system.ensure_steam starts Steam if needed); returns (HTTP code, response)."""
    import configparser
    ac = settings.ac_path()
    if not os.path.exists(os.path.join(ac, "content", "tracks", name, name + ".kn5")):
        return 404, {"error": "This track has no track file (build it again)"}
    with lock:
        if job["state"] in ("running", "stopping"):
            return 409, {"error": "Not while a build is running"}
        if csp.busy():
            return 409, {"error": "CSP is being installed: wait for it, then play"}
    if system.running("acs.exe"):
        return 409, {"error": "Assetto Corsa is already running"}
    if not system.ensure_steam():
        return 409, {"error": "Steam did not start (or is not signed in): start it and try again"}
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.optionxform = str
    try:
        ini.read(race_ini(), encoding="utf-8")
    except (configparser.Error, UnicodeDecodeError):
        ini = None
    if ini is None or not ini.has_option("RACE", "MODEL"):
        return 409, {"error": "Drive once in Assetto Corsa first, so Map2Lap knows your car"}
    model, _ = play_car()
    if model and model != ini.get("RACE", "MODEL"):        # (the car set, its first skin)
        skins = os.path.join(ac, "content", "cars", model, "skins")
        skin = next(iter(sorted(d for d in os.listdir(skins) if os.path.isdir(os.path.join(skins, d)))), "")
        for k, v in (("MODEL", model), ("MODEL_CONFIG", ""), ("SKIN", skin)):
            ini.set("RACE", k, v)
        if ini.has_section("CAR_0"):
            for k, v in (("MODEL", "-"), ("MODEL_CONFIG", ""), ("SKIN", skin), ("SETUP", "")):
                ini.set("CAR_0", k, v)
    ini.set("RACE", "TRACK", name)
    ini.set("RACE", "CONFIG_TRACK", "")
    ini.set("RACE", "CARS", "1")
    for sec in ini.sections():
        if (sec.startswith("CAR_") and sec != "CAR_0") or (sec.startswith("SESSION_") and sec != "SESSION_0"):
            ini.remove_section(sec)
    for sec in ("REMOTE", "REPLAY", "BENCHMARK", "RESTART", "__PREVIEW_GENERATION"):
        if ini.has_section(sec):
            ini.set(sec, "ACTIVE", "0")
    if not ini.has_section("SESSION_0"):
        ini.add_section("SESSION_0")
    for k, v in (("NAME", "Practice"), ("TYPE", "1"), ("DURATION_MINUTES", "0"), ("SPAWN_SET", "START")):
        ini.set("SESSION_0", k, v)
    with open(race_ini(), "w", encoding="utf-8") as f:
        ini.write(f, space_around_delimiters=False)
    with lock:
        # Steam sign-in can take a while; a requested CSP install may have started since the first check.
        if csp.busy():
            return 409, {"error": "CSP is being installed: wait for it, then play"}
        system.start_ac(ac)
    return 200, {"ok": True}


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


class Handler(BaseHTTPRequestHandler):
    # (connections kept: the Editor asks for a long track's 66,000 parts, each on a connection of its own would leave a port waiting
    # for minutes, of the 16,000 Windows has for them)
    protocol_version = "HTTP/1.1"

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        if self.command != "GET":       # (a request refused can leave its body unread: the next one would start in it)
            self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(data)

    def _body(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def _editor(self, match):
        """The Editor tab's asking for a track's index, a mesh's or a texture's bytes (trackview)."""
        name, kind, i, revision = generator.slug(match[1]), match[2], match[3], match[4]
        ac = settings.ac_path()
        try:
            if kind == "mesh":
                moved = trackedits.moved_now(ac, name, revision)
                draft = int(self.path.split("&d=", 1)[1].split("&", 1)[0]) if "&d=" in self.path else None
                copy_revision = self.path.rsplit("&c=", 1)[1] if "&c=" in self.path else None
                self._send(200, trackview.mesh_bytes(ac, name, int(i), revision, moved, draft, copy_revision), "application/octet-stream")
            elif kind == "texture":
                paint = parse_qs(urlsplit(self.path).query).get("p", [""])[0]
                tex, data = trackview.texture_bytes(ac, name, int(i), revision, paint)
                self._send(200, data, IMAGE_TYPES.get(os.path.splitext(tex)[1].lower(), "application/octet-stream"))
            else:
                self._send(200, trackview.index(ac, name))
        except (trackview.NotOurs, IndexError):
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.CopiesChanged:
            self._send(409, {"error": "The copied objects changed; refreshing their view"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})
        except ValueError as e:
            self._send(400, {"error": str(e)})
        except OSError as e:
            self._send(500, {"error": str(e)})
        except ConnectionError:             # (the page asked for another track meanwhile)
            pass

    def _edits_answer(self, work):
        """The answer of work() on a track's edits: 200 with its result, or what went wrong."""
        try:
            self._send(200, work())
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except (trackedits.Invalid, ValueError) as e:
            self._send(400, {"error": str(e)})
        except (trackedits.Conflict, trackview.Unreadable):
            self._send(409, {"error": "The track or its changes changed: read them again"})
        except OSError as e:
            self._send(500, {"error": str(e)})

    def _surface(self, name):
        """Read-only selection of generated paint masks; source revision prevents mixing builds."""
        try:
            q = parse_qs(urlsplit(self.path).query, strict_parsing=True)
            if "points" in q:
                return self._edits_answer(lambda: trackview.surfaces(settings.ac_path(), generator.slug(name), json.loads(q["points"][0]), q["r"][0]))
            self._edits_answer(lambda: trackview.surface(settings.ac_path(), generator.slug(name), int(q["mesh"][0]),
                                                        float(q["u"][0]), float(q["v"][0]), q["r"][0], q.get("whole", ["0"])[0] == "1"))
        except (KeyError, ValueError, IndexError, TypeError) as e:
            self._send(400, {"error": str(e)})

    def _inspect(self, name, kind="inspect"):
        """Details are fetched for a selection, never included in a whole track's picking index."""
        try:
            q = parse_qs(urlsplit(self.path).query, strict_parsing=True)
            name, ac = generator.slug(name), settings.ac_path()
            if kind == "thumbnail":
                self._send(200, trackinspect.thumbnail(ac, name, int(q["texture"][0]), q["r"][0], q.get("p", [""])[0]), "image/png")
            elif kind == "appearance":
                self._send(200, trackinspect.appearance(ac, name, int(q["mesh"][0]), float(q["u"][0]), float(q["v"][0]),
                                                      q["r"][0], q.get("p", [""])[0]))
            else:
                self._edits_answer(lambda: trackinspect.object_info(ac, name, q["id"][0], q["r"][0]))
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track changed: read it again"})
        except (KeyError, ValueError, IndexError, TypeError, OSError) as e:
            self._send(400, {"error": str(e)})

    def _prepare_surface(self, name):
        try:
            q = parse_qs(urlsplit(self.path).query, strict_parsing=True)
            self._edits_answer(lambda: trackview.prepare_surface(settings.ac_path(), generator.slug(name), int(q["mesh"][0]), q["r"][0]))
        except (KeyError, ValueError, IndexError) as e:
            self._send(400, {"error": str(e)})

    def _own_page(self, content_type="application/json"):
        """Whether a request can only come from the page itself: another site can't send this type without asking first (no
        answer to that here), nor reach this server under another name."""
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0]
        return host in LOCAL_HOSTS and (self.headers.get("Content-Type") or "").split(";", 1)[0].strip() == content_type

    def _library(self):
        """Material summaries, small previews and bounded same-page imports; no absolute file paths enter a request."""
        path = urlsplit(self.path)
        try:
            q = parse_qs(path.query)
            if self.command == "GET":
                if path.path == "/api/library/materials":
                    return self._send(200, materiallibrary.listing(q.get("q", [""])[0], q.get("category", [""])[0],
                                      int(q.get("offset", ["0"])[0]), int(q.get("limit", ["40"])[0])))
                preview = re.fullmatch(r"/api/library/(materials|imports)/([a-f0-9]{64})/preview", path.path)
                if preview:
                    return self._send(200, materiallibrary.preview(preview[2], preview[1] == "imports"), "image/png")
                material = re.fullmatch(r"/api/library/materials/([a-f0-9]{64})", path.path)
                if material:
                    return self._send(200, materiallibrary.get(material[1]))
            elif (deleting := re.fullmatch(r"/api/library/materials/([a-f0-9]{64})/delete", path.path)):
                if not self._own_page("application/json"):
                    return self._send(403, {"error": "Only the page itself can delete a texture"})
                if int(self.headers.get("Content-Length", 0)) > 4096:
                    return self._send(413, {"error": "Too many texture settings"})
                self._body()
                return self._send(200, {"deleted": materiallibrary.remove(deleting[1])})
            elif path.path in ("/api/library/imports", "/api/library/materials"):
                upload = path.path.endswith("/imports")
                if not self._own_page("application/x-map2lap-image" if upload else "application/json"):
                    return self._send(403, {"error": "Only the page itself can import a material"})
                size = int(self.headers.get("Content-Length", 0))
                if not 0 < size <= (materiallibrary.MAX_BYTES if upload else 16384):
                    return self._send(413, {"error": "Choose an image up to 64 MB" if upload else "Too many material settings"})
                if upload:
                    if not MATERIAL_UPLOADS.acquire(blocking=False):
                        return self._send(429, {"error": "Another image is being prepared. Try again in a moment."})
                    try:
                        raw = self.rfile.read(size)
                        if len(raw) != size:
                            raise ValueError("The image upload was interrupted")
                        return self._send(200, materiallibrary.prepare(q["filename"][0], raw))
                    finally:
                        MATERIAL_UPLOADS.release()
                return self._send(200, materiallibrary.add(self._body()))
            self._send(404, {"error": "No material here"})
        except (ValueError, KeyError, TypeError) as error:
            self._send(400, {"error": str(error)})
        except ConnectionError:
            pass
        except OSError:
            self._send(500, {"error": "Could not read or store the material. Check folder permissions and disk space."})

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

    def _brush(self, name, under_way=False):
        """A stroke of the Editor's brush as a height change, with all of it looked at, loaded in the view or not: {"height": what the
        page puts into its draft, "standing": objects that stay where they stand}; under_way: the mouse still held, what it changes so far
        (trackedits.preview). Nothing is kept here. 409: it can't be applied, for the reason it says."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        ac = settings.ac_path()
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True    # (its body stays unread)
            return self._send(413, {"error": "This stroke is too long: make it in parts"})
        try:
            body = self._body()
            op = trackheights.brush(body.get("samples"), body.get("radius"), body.get("soft"), body.get("mm"), body.get("speed"), secrets.token_hex(8))
            path, scan, objects = trackedits.context(ac, generator.slug(name), body.get("base"))
            if under_way:
                return self._send(200, trackedits.preview(ac, generator.slug(name), body["base"], op), "application/octet-stream")
            trackedits.remember_meshes(ac, generator.slug(name), body["base"], op)
            self._send(200, {"height": op, "standing": trackheights.standing(path, scan, objects, op)})
        except (ValueError, AttributeError) as e:
            self._send(400, {"error": str(e)})
        except trackheights.InTheWay as e:
            self._send(409, {"error": str(e)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _band(self, name, what):
        """The Editor's smooth tool (trackband). what: "way": where the road goes between the page's points, {"line": [[x, y, z], ...], "width"};
        "preview": what its height change changes (trackedits.preview); None: that change, as _brush answers. 409: it can't be, for the
        reason it says."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True    # (its body stays unread)
            return self._send(413, {"error": "No band"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            base = body.get("base")
            path, scan = trackview._scan_of(ac, name, base)
            if "revision" in body and body["revision"] != trackedits.load(ac, name)["revision"]:
                return self._send(409, {"error": "The road edits changed: mark the road again"})
            if body.get("network"):
                net = roadregion.mapped(path, body.get("points"))
                region = roadregion.selection(path, net)
                if what == "way":
                    lines = [[[x, 0., z] for x, z in line] for line in net["lines"]]
                    return self._send(200, {"lines": lines, "region": region})
                moved = trackedits.moved_without(ac, name, base, body.get("replace"))
                op, influence = roadnet.change_of(path, scan, moved, net, region, body.get("blend", 6), body.get("strength"), secrets.token_hex(8))
                trackedits.remember_meshes(ac, name, base, op)
                return self._send(200, {"height": op, "influence": influence,
                                       "standing": trackheights.standing(path, scan, trackview.list_of(path), op)})
            moved = trackedits.moved_without(ac, name, base, body.get("replace"))
            road = trackband.road_cells(path, base)
            if what == "way":
                line, width = trackband.way(road, body.get("points"))
                ys = trackband.road_heights(path, scan, moved, line)
                return self._send(200, {"line": np.c_[line[:, 0], ys, line[:, 1]].round(3).tolist(), "width": round(width, 1)})
            op = trackband.change_of(path, scan, moved, road, body.get("points"), body.get("width"), body.get("strength"), secrets.token_hex(8))
            if what == "preview":
                return self._send(200, trackedits.preview(ac, name, base, op), "application/octet-stream")
            trackedits.remember_meshes(ac, name, base, op)
            self._send(200, {"height": op, "standing": trackheights.standing(path, scan, trackview.list_of(path), op)})
        except (ValueError, AttributeError, TypeError) as e:
            self._send(400, {"error": str(e)})
        except (trackband.Refused, trackheights.InTheWay) as e:
            self._send(409, {"error": str(e)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

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
        if size > trackedits.MAX_BYTES:
            self.close_connection = True    # (its body stays unread)
            return self._send(413, {"error": "Too many changes"})
        try:
            body = json.loads(self.rfile.read(size))
        except ValueError:
            return self._send(400, {"error": "No list of changes"})
        self._edits_answer(lambda: trackedits.save_telling(settings.ac_path(), edits[1], body))

    def do_GET(self):
        if self.path == "/api/csp":
            return self._send(200, csp.status(settings.ac_path()))
        if urlsplit(self.path).path.startswith("/api/library/"):
            return self._library()
        detail = re.fullmatch(r"/api/editor/([^/]+)/(paint-mask|paint-asset|paint-preview)/([a-f0-9]{64})", self.path)
        if detail:
            try:
                ac, name = settings.ac_path(), generator.slug(detail[1])
                reader = {"paint-mask": trackdetail.mask, "paint-asset": trackdetail.image, "paint-preview": trackinspect.paint_preview}[detail[2]]
                raw = reader(ac, name, detail[3])
                return self._send(200, raw, "image/png" if detail[2] == "paint-preview" else "image/vnd-ms.dds")
            except trackview.Unreadable as error:
                return self._send(409, {"error": str(error)})
            except (ValueError, OSError, trackview.NotOurs) as error:
                return self._send(400, {"error": str(error)})
        editor, edits = EDITOR_PATH.fullmatch(self.path), EDITS_PATH.fullmatch(self.path)
        if editor:
            self._editor(editor)
        elif (inspection := re.fullmatch(r"/api/editor/([^/]+)/(inspect|thumbnail|appearance)", urlsplit(self.path).path)):
            self._inspect(inspection[1], inspection[2])
        elif (surface := SURFACE_PATH.fullmatch(urlsplit(self.path).path)):
            self._surface(surface[1])
        elif (preparing := SURFACE_PREPARE_PATH.fullmatch(urlsplit(self.path).path)):
            self._prepare_surface(preparing[1])
        elif (copies := COPIES_PATH.fullmatch(self.path)):
            self._edits_answer(lambda: trackview.copy_index(settings.ac_path(), generator.slug(copies[1])))
        elif edits:
            self._edits_answer(lambda: trackedits.load(settings.ac_path(), edits[1]))
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
            self._send(200, {"tracks": tracks, "car": play_car()[1]})
        elif self.path == "/api/cars":
            last = last_car()
            self._send(200, {"cars": cars(), "last": car_name(last) if last else None})
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
        paint = re.fullmatch(r"/api/editor/([^/]+)/(paint|textures)", self.path)
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
                    return trackedits.paint(ac, name, body)
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
        save = SAVE_PATH.fullmatch(self.path)
        if save:
            return self._save_track(save[1])
        brush = BRUSH_PATH.fullmatch(self.path)
        if brush:
            return self._brush(brush[1], bool(brush[2]))
        band = BAND_PATH.fullmatch(self.path)
        if band:
            return self._band(band[1], band[2])
        try:
            body = self._body()
            if self.path == "/api/route":
                pts, length = generator.route([tuple(p) for p in body["points"]])
                self._send(200, {"coords": pts, "length_m": length})
            elif self.path == "/api/name":            # suggestion for the track name (generator.auto_title)
                self._send(200, {"title": generator.auto_title([tuple(p) for p in body.get("points") or []],
                                                               body.get("area"))})
            elif self.path == "/api/place":           # name for a pin set on the map (town, district)
                town, part = generator.place(float(body["lat"]), float(body["lon"]))
                self._send(200, {"name": ", ".join(x for x in (town, part) if x) or None})
            elif self.path == "/api/code" and body.get("make"):     # the code of a new route or area
                self._send(200, {"code": trackcode.encode({**body["make"], "track_version": version.TRACK_VERSION})})
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
                self._send(*start_build(name, body.get("title") or name, [tuple(p) for p in body.get("points") or []],
                                        body.get("width", 100), body.get("area")))   # (area: [south, west, north, east])
            elif self.path == "/api/rebuild":           # a track from "My tracks" with its settings,
                name = generator.slug(body.get("name") or "")      # replaced or (copy) as a new one next to it
                info = mytracks.load(os.path.join(settings.ac_path(), "content", "tracks", name))
                if info is None:
                    return self._send(404, {"error": "No saved build settings for this track"})
                title = info["title"]
                if body.get("copy"):
                    name, title = mytracks.copy_name(settings.ac_path(), name, title)
                self._send(*start_build(name, title, [tuple(p) for p in info["points"]], info.get("width"),
                                        info.get("area")))
            elif self.path == "/api/play":
                self._send(*play(generator.slug(body.get("name") or "")))
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
