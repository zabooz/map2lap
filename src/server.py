"""Local generator page: http://localhost:8800

Set points on the OpenStreetMap map, look at the route (OSRM), choose the corridor width and the name, build the
track; or an area instead of a route. "My tracks": build the tracks built before again with the current release
(mytracks), as a copy, delete them, play them. Settings (settings.py): AC folder, Play car, CPU share, map data cache
limit (mapcache), keep build files.
Only one build at a time. It runs as a process of its own (generator.py): Stop ends it with its worker processes,
and every build uses the current code (a running server would otherwise build with the code from its start).

    .venv\\Scripts\\python.exe server.py
"""
import json
import os
import shutil
import subprocess
import sys
import threading
import time
import traceback
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import generator
from app import debugapp, mapcache, mytracks, settings, version
from app.paths import ROOT, SRC

PORT = 8800
job = {"state": "idle", "log": [], "result": None, "error": None,     # state: idle running stopping stopped done error
       "progress": None, "started": None, "ended": None}              # progress: generator.PHASES {phase, done, total}
running = {"proc": None, "clearing": False}     # clearing: the map data cache is being cleared (no build)
lock, dialog_lock = threading.Lock(), threading.Lock()
# The running build {name, clean, started, pid}: if the file is still there when the server starts, the server ended
# in the middle of a build (console window closed), and tidy_interrupted tidies up
MARK = os.path.join(ROOT, "out", "build_running.json")


def log(msg):
    with lock:
        job["log"].append(str(msg))


def run_build(args, name, clean, started):
    code, result = None, None
    try:
        p = subprocess.Popen([sys.executable, "-u", os.path.join(SRC, "generator.py"), "--result", *args], cwd=ROOT,
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8",
                             errors="replace", env={**os.environ, "PYTHONIOENCODING": "utf-8"})
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
        code = p.wait()
        with lock:
            job["ended"] = time.time()
    except Exception as e:      # (show errors on the page rather than ending the server)
        log(traceback.format_exc())
        with lock:
            job.update(state="error", error=str(e), ended=time.time())
        _unmark()
        return
    finally:
        running["proc"] = None
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


def tidy_interrupted():
    """On server start: if the last server ended in the middle of a build, end that build (if it still runs) and tidy
    up (tidy); the messages then show in the page's log."""
    try:
        with open(MARK, encoding="utf-8") as f:
            m = json.load(f)
    except (OSError, ValueError):
        return
    log(f"The last build (“{m['name']}”) was cut off when Map2Lap was closed: tidying up")
    pid = str(m.get("pid") or "")
    out = subprocess.run(["tasklist", "/FI", f"PID eq {pid}", "/NH"], capture_output=True, text=True, encoding="oem",
                         errors="replace").stdout if pid else ""
    if pid and pid in out and "python" in out.lower():          # (still there: without a server nobody sees it any more)
        subprocess.run(["taskkill", "/T", "/F", "/PID", pid], capture_output=True)
        log("Its build process was still running: stopped")
    tidy(m["name"], m.get("clean", True), m.get("started", 0.0))
    _unmark()
    log("Done.")


# Windows' folder picker through PowerShell (the release's embedded Python has no tkinter); a topmost owner form puts
# it in front of the browser, UTF-8 output keeps paths with umlauts intact
BROWSE_PS = (
    "[Console]::OutputEncoding = [Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms;"
    "$d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'Assetto Corsa folder';"
    "$d.ShowNewFolderButton = $false; if (Test-Path $env:M2L_START) { $d.SelectedPath = $env:M2L_START };"
    "$o = New-Object System.Windows.Forms.Form -Property @{TopMost = $true};"
    "if ($d.ShowDialog($o) -eq [System.Windows.Forms.DialogResult]::OK) { $d.SelectedPath }")


def browse_folder(start):
    """Windows' folder picker (the page runs on the same machine); None: cancelled."""
    with dialog_lock:
        r = subprocess.run(["powershell", "-NoProfile", "-STA", "-Command", BROWSE_PS], capture_output=True,
                           text=True, encoding="utf-8", errors="replace", env={**os.environ, "M2L_START": start or ""},
                           creationflags=subprocess.CREATE_NO_WINDOW)
    path = r.stdout.strip()
    return os.path.normpath(path) if path else None


def settings_view():
    path, s = settings.ac_path(), settings.load()
    return {"ac_path": path, "ac_ok": settings.is_ac(path), "clean": s["clean"], "cores": s["cores"],
            "cache_gb": s["cache_gb"], "car": s["car"], "debug_app": s["debug_app"],
            "threads": os.cpu_count() or 2, "version": version.VERSION}


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
        if running["clearing"]:
            return 409, {"error": "The map data is being cleared, try again in a moment"}
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
    shutil.rmtree(os.path.join(ROOT, "out", "tracks", name), ignore_errors=True)
    return 200, {"ok": True}


def _documents():
    """Windows' Documents folder (also when it was moved, e.g. to OneDrive)."""
    import ctypes
    buf = ctypes.create_unicode_buffer(260)
    if ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buf) == 0:     # (CSIDL_PERSONAL)
        return buf.value
    return os.path.join(os.path.expanduser("~"), "Documents")


def _running(exe):
    # (tasklist answers in the console code page, with umlauts on German Windows: cp850 output wasn't readable as
    # Python's cp1252 and the check crashed as soon as AC wasn't running)
    out = subprocess.run(["tasklist", "/FI", f"IMAGENAME eq {exe}", "/NH"], capture_output=True, text=True,
                         encoding="oem", errors="replace").stdout or ""
    return exe.lower() in out.lower()


def _steam_user():
    """Signed-in Steam user (registry ActiveProcess\\ActiveUser, 0: Steam isn't running or is still signing in)."""
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam\ActiveProcess") as k:
            return int(winreg.QueryValueEx(k, "ActiveUser")[0])
    except OSError:
        return 0


def ensure_steam(wait_s=90.0):
    """Start Steam if it isn't running and wait until it is signed in (acs.exe without the launcher needs it and
    doesn't start Steam itself); returns True when ready."""
    if _running("steam.exe") and _steam_user():
        return True
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as k:
            exe = winreg.QueryValueEx(k, "SteamExe")[0]
    except OSError:
        exe = os.path.join(settings.STEAM_DEFAULT, "steam.exe")
    if not _running("steam.exe"):
        subprocess.Popen([exe, "-silent"], creationflags=subprocess.DETACHED_PROCESS)
    end = time.time() + wait_s
    while time.time() < end:
        if _running("steam.exe") and _steam_user():
            time.sleep(3.0)         # (signed in; a moment more until Steam also accepts games)
            return True
        time.sleep(1.0)
    return False


def race_ini():
    return os.path.join(_documents(), "Assetto Corsa", "cfg", "race.ini")


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
    (car, skin, weather, assists) but this track, Practice, no opponents and offline; then acs.exe (steam_appid.txt
    lies next to it: runs without the launcher; ensure_steam starts Steam if needed); returns (HTTP code, response)."""
    import configparser
    ac = settings.ac_path()
    if not os.path.exists(os.path.join(ac, "content", "tracks", name, name + ".kn5")):
        return 404, {"error": "This track has no track file (build it again)"}
    with lock:
        if job["state"] in ("running", "stopping"):
            return 409, {"error": "Not while a build is running"}
    if _running("acs.exe"):
        return 409, {"error": "Assetto Corsa is already running"}
    if not ensure_steam():
        return 409, {"error": "Steam did not start (or is not signed in): start it and try again"}
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.optionxform = str
    try:
        ini.read(race_ini(), encoding="utf-8")
    except (configparser.Error, UnicodeDecodeError):
        ini = None
    if ini is None or not ini.has_option("RACE", "MODEL"):
        return 409, {"error": "Drive once with Content Manager first, so Map2Lap knows your car"}
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
    subprocess.Popen([os.path.join(ac, "acs.exe")], cwd=ac, creationflags=subprocess.DETACHED_PROCESS)
    return 200, {"ok": True}


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


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _body(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            with open(os.path.join(SRC, "web", "index.html"), "rb") as f:
                self._send(200, f.read(), "text/html; charset=utf-8")
        elif self.path == "/api/status":
            with lock:
                st = dict(job)
            st["elapsed"] = ((st["ended"] or time.time()) - st["started"]) if st["started"] else None
            self._send(200, st)
        elif self.path == "/api/settings":
            self._send(200, settings_view())
        elif self.path == "/api/tracks":
            self._send(200, {"tracks": mytracks.listing(settings.ac_path()), "car": play_car()[1]})
        elif self.path == "/api/cars":
            last = last_car()
            self._send(200, {"cars": cars(), "last": car_name(last) if last else None})
        elif self.path == "/api/cache":             # (counts every file: ~2 s for 170,000)
            size, files = mapcache.usage()
            self._send(200, {"bytes": size, "files": files})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
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
            elif self.path == "/api/search":          # places for the start/finish/place fields
                self._send(200, {"places": generator.search((body.get("q") or "").strip()[:200])})
            elif self.path == "/api/settings":
                new = {}
                if "ac_path" in body:                  # (empty: look through Steam again)
                    p = os.path.normpath(body["ac_path"].strip()) if (body["ac_path"] or "").strip() else None
                    if p and not settings.is_ac(p):
                        return self._send(400, {"error": "No Assetto Corsa folder there (content\\tracks is missing)"})
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
                self._send(200, {"path": browse_folder(settings.ac_path())})
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
            elif self.path == "/api/stop":
                with lock:
                    p = running["proc"]
                    if job["state"] != "running" or p is None:
                        return self._send(409, {"error": "No build is running"})
                    job["state"] = "stopping"
                subprocess.run(["taskkill", "/T", "/F", "/PID", str(p.pid)], capture_output=True)    # (with the worker processes)
                self._send(200, {"ok": True})
            else:
                self._send(404, {"error": "not found"})
        except Exception as e:
            self._send(500, {"error": str(e)})

    def log_message(self, fmt, *args):      # (no line per status request in the terminal)
        pass


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    tidy_interrupted()
    try:                                # (AC as Settings say: also an app left from before the switch existed)
        debugapp.sync(settings.ac_path(), settings.load()["debug_app"])
    except OSError:
        pass
    print(f"Map2Lap: http://localhost:{PORT}  (stop with Ctrl+C)", flush=True)
    if "--no-browser" not in os.sys.argv:
        webbrowser.open(f"http://localhost:{PORT}")
    srv.serve_forever()
