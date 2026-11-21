"""Save the same car and track Personal Best as the Kunos launcher after direct Play."""
import codecs
import configparser
import json
import os
from pathlib import Path
import re
import tempfile
import threading
import time

from . import system

_write_lock = threading.Lock()
_section = re.compile(r"^[ \t]*\[([^\]\r\n]+)\][^\r\n]*(?:\r?\n|$)", re.MULTILINE)
_value = re.compile(r"^[ \t]*(TIME|DATE)[ \t]*=[ \t]*(.*?)[ \t]*(?:\r?\n|$)", re.MULTILINE | re.IGNORECASE)


def _result_path(documents):
    """Path to the latest race result in AC's documents directory. Pure."""
    return documents / "out" / "race_out.json"


def fastest_by_track(documents):
    """Read AC's personalbest.ini as {track id: (fastest car id, time in ms)}."""
    ini = configparser.ConfigParser(interpolation=None, strict=False, inline_comment_prefixes=(";", "#"))
    try:
        ini.read(Path(documents) / "personalbest.ini", encoding="utf-8-sig")
    except (configparser.Error, UnicodeError, OSError):
        return {}
    fastest = {}
    for combo in ini.sections():
        car, _, track = combo.casefold().partition("@")
        try:
            elapsed = ini.getint(combo, "time", fallback=0)
        except ValueError:
            continue
        if car and track and elapsed > 0 and (track not in fastest or elapsed < fastest[track][1]):
            fastest[track] = car, elapsed
    return fastest


def _best_time(result, track, car):
    """Positive times for the local player in the given track and car. Pure."""
    if result["track"] != track or result["players"][0]["car"] != car:
        return None
    # AC can retain this extra even when its results screen has no lap rows.
    sole_car = len(result["players"]) == 1
    times = [extra["time"] for extra in result.get("extras", [])
             if extra.get("name") == "bestlap" and (extra.get("car", 0 if sole_car else None) == 0)]
    for session in result["sessions"]:
        times.extend(lap["time"] for lap in session.get("bestLaps", []) if lap.get("car") == 0)
    return min((value for value in times if type(value) is int and value > 0), default=None)


def _updated_ini(raw, combo, best, date_ms):
    """Bytes with the faster Personal Best and all other entries as they were, or None if unchanged. Pure."""
    text = raw.decode("utf-8-sig")
    newline = "\r\n" if "\r\n" in text else "\n"
    values = f"TIME={best}{newline}DATE={date_ms}{newline}"
    sections = list(_section.finditer(text))
    for index, section in enumerate(sections):
        if section[1].casefold() != combo.casefold():
            continue
        end = sections[index + 1].start() if index + 1 < len(sections) else len(text)
        body = text[section.end():end]
        for value in _value.finditer(body):
            if value[1].upper() == "TIME" and re.fullmatch(r"\d+", value[2]) and 0 < int(value[2]) <= best:
                return None
        header = text[:section.end()]
        text = header + ("" if header.endswith("\n") else newline) + values + _value.sub("", body) + text[end:]
        break
    else:
        text += (newline if text.endswith("\n") else newline * 2) if text else ""
        text += f"[{combo}]{newline}{values}"
    return (codecs.BOM_UTF8 if raw.startswith(codecs.BOM_UTF8) else b"") + text.encode("utf-8")


def import_result(documents, track, car, started_ns):
    """Import a fresh result matching the drive's track and car. Return its new best in ms, or None."""
    if not track or not car or re.search(r"[\r\n\[\]@]", track + car):
        return None
    documents = Path(documents)
    result = _result_path(documents)
    try:
        stat = result.stat()
        if stat.st_mtime_ns < started_ns:
            return None
        best = _best_time(json.loads(result.read_text(encoding="utf-8-sig")), track, car)
        if best is None or result.stat().st_mtime_ns != stat.st_mtime_ns:
            return None
    except (OSError, ValueError, KeyError, IndexError, TypeError, AttributeError):
        return None
    path = documents / "personalbest.ini"
    with _write_lock:
        try:
            raw = path.read_bytes()
        except FileNotFoundError:
            raw = b""
        updated = _updated_ini(raw, f"{car}@{track}", best, stat.st_mtime_ns // 1_000_000)
        if updated is None:
            return None
        fd, temp = tempfile.mkstemp(dir=documents, prefix=".personalbest_")
        try:
            with os.fdopen(fd, "wb") as file:
                file.write(updated)
            os.replace(temp, path)
        finally:
            if os.path.exists(temp):
                os.unlink(temp)
    return best


def watch(documents, track, car, started_ns):
    """Import after the directly launched game exits. A failed launch times out while waiting for AC to start."""
    deadline = time.monotonic() + 90
    result = _result_path(Path(documents))
    try:
        while not system.running("acs.exe") and time.monotonic() < deadline:
            try:
                if result.stat().st_mtime_ns >= started_ns:
                    break
            except FileNotFoundError:
                pass
            time.sleep(1)
        while system.running("acs.exe"):
            time.sleep(1)
        import_result(documents, track, car, started_ns)
    except (OSError, UnicodeError) as error:
        print(f"Assetto Corsa Personal Best could not be saved: {error}", flush=True)
