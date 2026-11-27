"""Arm the CSP spline recorder for one Play launch and freeze its output when AC exits."""
import configparser
import os
from pathlib import Path
import re
import shutil
import tempfile
import threading
import time
import uuid

from app import debugapp, lanerecording, mytracks, system
from track import fastlane, route_race
from app.paths import SRC

APP = Path("apps/lua/Map2LapRecorder")
_lock = threading.Lock()
_current = None


def _replace(path, data):
    """Replace a complete config file without changing its permissions."""
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as out:
        tmp = Path(out.name)
    try:
        tmp.write_bytes(data)
        if path.is_file():
            shutil.copymode(path, tmp)
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def _enable_ai(ac):
    """Enable AC's native developer AI recorder, retaining the prior configuration."""
    ini = Path(ac, "system/cfg/assetto_corsa.ini")
    raw = ini.read_bytes()
    section = re.search(rb"(?ims)^[ \t]*\[AC_APPS\][^\n]*\n.*?(?=^[ \t]*\[|\Z)", raw)
    if not section:
        raise ValueError("AC's [AC_APPS] configuration is missing.")
    options, count = re.subn(rb"(?im)^([ \t]*ENABLE_DEV_APPS[ \t]*=[ \t]*)[01]\b",
                             rb"\g<1>1", section[0])
    if count != 1:
        raise ValueError("AC's ENABLE_DEV_APPS setting could not be identified.")
    updated = raw[:section.start()] + options + raw[section.end():]
    if updated != raw:
        _replace(ini, updated)
        return ini, raw, updated
    return None


def prepare(ac, token, *, native=True):
    """Install and arm this practice's CSP helper."""
    app = Path(ac) / APP
    if app.exists() and not debugapp.ours(app):
        raise ValueError("The Map2LapRecorder app directory belongs to another app.")
    shutil.copytree(Path(SRC, "acapp/Map2LapRecorder"), app, dirs_exist_ok=True)
    _replace(app / "armed", token.encode("ascii"))
    return _enable_ai(ac) if native else None


class Session:
    def __init__(self, ac, model, layout, race_file):
        self.capture = lanerecording.Capture(model, layout)
        self.token = uuid.uuid4().hex
        self.race_file = Path(race_file)
        self.ac = Path(ac)
        self.result = {"status": "starting"}
        self.dev_config = None
        self.trace = None

    def disarm(self):
        """Release only the settings and token still owned by this session."""
        armed = self.ac / APP / "armed"
        if armed.exists() and armed.read_bytes() in (b"", self.token.encode("ascii")):
            armed.unlink(missing_ok=True)
        if self.trace is not None:
            self.trace.unlink(missing_ok=True)
            self.trace.with_suffix(".gates").unlink(missing_ok=True)
        if self.dev_config:
            ini, before, enabled = self.dev_config
            if ini.read_bytes() == enabled:
                _replace(ini, before)

    def watch(self):
        deadline = time.monotonic() + 120
        while True:
            with _lock:
                if self is not _current or not self.pending:
                    return
                running = system.running("acs.exe")
                if running:
                    self.result = {"status": "driving"}
                elif self.result["status"] == "driving":
                    self.finish()
                elif time.monotonic() >= deadline:
                    self.result = {"status": "empty", "message": "Assetto Corsa did not start."}
                    self.disarm()
            time.sleep(.5)

    @property
    def pending(self):
        return self.result["status"] in ("starting", "driving")

    def finish(self):
        try:
            ini = configparser.ConfigParser(interpolation=None, strict=False)
            ini.read(self.race_file, encoding="utf-8-sig")
            same_session = (ini.get("RACE", "__MAP2LAP_RECORDING", fallback="") == self.token
                            and ini.get("RACE", "TRACK", fallback=None) == self.capture.model.parent.name
                            and ini.get("RACE", "CONFIG_TRACK", fallback=None) == self.capture.layout
                            and ini.get("SESSION_0", "TYPE", fallback=None) == "1")
            key = self.capture.finish(trace=self.trace) if same_session else None
            self.result = {"status": "ready", "key": key} if key else {
                "status": "empty", "message": "This practice produced no new recording for this layout."}
        except (OSError, ValueError, configparser.Error) as error:
            self.result = {"status": "invalid", "message": str(error)}
        finally:
            self.disarm()


def launch(ac, model, layout, race_file, ini, start):
    """Arm a session immediately before the shared Play writer starts AC."""
    global _current
    with _lock:
        if _current and _current.pending:
            if _current.result["status"] == "driving" and not system.running("acs.exe"):
                _current.finish()
            else:
                raise ValueError("Another recording practice is starting.")
        session = Session(ac, model, layout, race_file)
        try:
            circuit = mytracks.is_circuit(model.parent)
            session.dev_config = prepare(ac, session.token, native=circuit)
            if not circuit:
                markers = fastlane.kn5.scan(model)["points"]
                keys = route_race.GATES if all(k in markers for k in route_race.GATES) else route_race.ALIASES.values()
                if not route_race.has_gates(markers):
                    raise ValueError("Recording requires start and finish timing gates.")
                session.trace = session.ac / APP / (session.token + ".drive")
                with session.trace.with_suffix(".gates").open("w", encoding="ascii") as stream:
                    for k in keys:
                        matrix = markers[k]
                        print(*matrix[12:15], *matrix[8:11], file=stream)
                ini["RACE"]["__MAP2LAP_STAGE"] = "1"
            ini["RACE"]["__MAP2LAP_RECORDING"] = session.token
            start()
        except (OSError, ValueError):
            session.disarm()
            raise
        _current = session
        threading.Thread(target=session.watch, daemon=True).start()
        return session.token


def result(model, token):
    """Read only the identified track's practice result."""
    with _lock:
        if not _current or _current.token != token or _current.capture.model != model:
            raise ValueError("This recording session has ended.")
        return dict(_current.result)
