"""Install or remove Map2Lap's AC plugin while the game is closed."""
import codecs
import os
from pathlib import Path
import re
import tempfile

from app.paths import SRC
from track.route_race import ac_running

DLL = Path(SRC) / 'bin/map2lap.dll'

# race.ini [MAP2LAP_AI] for Play races: map2lap.dll's spacing feature (native/acplugin/spacing.h) lets opponents use
# the room that is there. Factors of Car::carHalfWidth (half track + 0.3 m, 1.02 m for the BMW M3 E30 DTM, body 1.72 m):
# SIDE 2.2 (stock 3.0) holds 0.5 m air alongside instead of 1.3 m; TARGET 1.3 (1.5) aims a pass 3.3 m beside the car
# ahead instead of 3.8 m, the one change that made them pass at all; PER_CAR 0.05 (0.2) asks less room per car ahead;
# APEX 80 (200 m) lets a pass start closer before a corner. Measured on heiligenblut_test with 12 opponents: passes
# 6-10 per lap against 2-4 stock, somewhat more contacts. A car whose body is much wider than its track keeps less air.
AI_SPACING = {'SIDE': '2.2', 'PER_CAR': '0.05', 'TARGET': '1.3', 'APEX': '80'}


def _registry(raw, enable):
    """Edit only map2lap.dll assignments in [PLUGINS], preserving other bytes. Pure."""
    bom, encoding = b'', 'latin1'  # AC also uses local ANSI. Only ASCII syntax is interpreted.
    for prefix, codec in ((codecs.BOM_UTF16_LE, 'utf-16le'), (codecs.BOM_UTF16_BE, 'utf-16be'),
                          (codecs.BOM_UTF8, 'latin1')):
        if raw.startswith(prefix):
            bom, encoding = prefix, codec
            break
    source = raw[len(bom):].decode(encoding)
    newline = re.search(r'\r\n|\n|\r', source)
    eol = newline[0] if newline else '\r\n'
    # Retain line terminators independently, including an unterminated last foreign entry.
    lines = re.findall(r'[^\r\n]*(?:\r\n|\r|\n)|[^\r\n]+$', source)
    result = []
    plugins = False
    insertion = None
    registered = False
    for line in lines:
        section = re.fullmatch(r'\s*\[([^\]]+)\]\s*(?:[;#].*)?\s*', line)
        if section:
            plugins = section[1].strip().lower() == 'plugins'
            if plugins and insertion is None:
                insertion = len(result) + 1
        key, equals, value = line.partition('=')
        if plugins and equals and key.strip().lower() == 'map2lap.dll':
            if enable and not registered:
                ending = line[len(line.rstrip('\r\n')):]
                result.append(line if value.strip() == '1' else 'map2lap.dll=1' + ending)
                registered = True
        else:
            result.append(line)
    if enable and not registered:
        if insertion is None:
            if result and not result[-1].endswith(('\n', '\r')):
                result.append(eol)
            result.append('[PLUGINS]' + eol)
            insertion = len(result)
        if not result[insertion - 1].endswith(('\n', '\r')):
            result[insertion - 1] += eol
        result.insert(insertion, 'map2lap.dll=1' + eol)
    return bom + ''.join(result).encode(encoding)


def _read(path):
    """Read an installed file or return empty bytes if it is missing."""
    try:
        return path.read_bytes()
    except FileNotFoundError:
        return b''


def _replace(path, data):
    """Publish complete bytes beside path, leaving the previous file on write failure."""
    fd, name = tempfile.mkstemp(dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
        if path.exists():
            os.chmod(name, path.stat().st_mode)
        os.replace(name, path)
    finally:
        Path(name).unlink(missing_ok=True)


def install(ac):
    """Update the shipped DLL, then enable it in this AC installation. False if AC is running."""
    if ac_running():
        return False
    folder = Path(ac) / 'plugins'
    dll, ini = folder / DLL.name, folder / 'plugins.ini'
    raw = _read(ini)
    updated = _registry(raw, True)
    shipped = DLL.read_bytes()
    folder.mkdir(exist_ok=True)
    if _read(dll) != shipped:
        _replace(dll, shipped)
    if raw != updated:
        _replace(ini, updated)
    return True


def remove(ac):
    """Disable the plugin in this AC installation before deleting its DLL. False if AC is running."""
    if ac_running():
        return False
    folder = Path(ac) / 'plugins'
    ini = folder / 'plugins.ini'
    raw = _read(ini)
    updated = _registry(raw, False)
    if raw != updated:
        _replace(ini, updated)
    (folder / DLL.name).unlink(missing_ok=True)
    return True
