"""Editor weather presets and their portable public-CSP visuals; no tyre/grip changes."""
import math
from pathlib import Path
import re
import secrets

from app.paths import ROOT

ASSETS = Path(ROOT) / 'assets' / 'weather'
SCRIPT = ASSETS / 'weather.lua'
CONTROLLER = ASSETS / 'controller.lua'
MAX_WIND = 35  # km/h: public CSP's normal limit unless INCREASE_CONDITIONS_LIMITS is explicitly enabled.
DEFAULT = {'kind': 'dry', 'intensity': 'light', 'windDirection': -1, 'windSpeed': 0, 'fog': False}
TYPES = {'dry': (15, 17, 19), 'rain': (6, 7, 2), 'snow': (9, 10, 11)}
LEVELS = ('light', 'medium', 'heavy')
BEGIN, END = b'; MAP2LAP_WEATHER_BEGIN', b'; MAP2LAP_WEATHER_END'


def parse(value):
    """Validate a weather object, filling defaults and normalising north's 360 degrees to zero. Pure."""
    if not isinstance(value, dict) or set(value) - set(DEFAULT):
        raise ValueError('Invalid weather settings')
    out = {**DEFAULT, **value}
    if not isinstance(out['kind'], str) or out['kind'] not in TYPES or out['intensity'] not in LEVELS or not isinstance(out['fog'], bool):
        raise ValueError('Invalid weather, intensity or fog setting')
    for key in ('windDirection', 'windSpeed'):
        n = out[key]
        if isinstance(n, bool) or not isinstance(n, (int, float)) or not math.isfinite(n):
            raise ValueError('Invalid wind setting')
    direction, speed = out['windDirection'], out['windSpeed']
    if direction != -1 and not 0 <= direction <= 360 or not 0 <= speed <= MAX_WIND:
        raise ValueError(f'Wind must be 0–360 degrees or random, and 0–{MAX_WIND} km/h')
    if direction == 360:
        out['windDirection'] = 0
    return out


def weather_type(options):
    """CSP's native type for validated weather settings: dry cloud cover, rain or snow intensity. Pure."""
    return TYPES[options['kind']][LEVELS.index(options['intensity'])]


def apply_session(ini, options):
    """Set native CSP sky/wind and the additional-fog flag in a race ConfigParser; preserve other settings."""
    for section in ('LIGHTING', 'WEATHER', 'WIND'):
        if not ini.has_section(section):
            ini.add_section(section)
    ini['LIGHTING']['__CM_WEATHER_CONTROLLER'] = 'map2lap'
    ini['LIGHTING']['__CM_WEATHER_TYPE'] = str(weather_type(options))
    ini['LIGHTING']['__MAP2LAP_FOG'] = '1' if options['fog'] else '0'
    # This vanilla fallback also works before CSP is installed; CSP uses the explicit type above.
    ini['WEATHER']['NAME'] = '3_clear' if options['kind'] == 'dry' and options['intensity'] == 'light' else '7_heavy_clouds'
    direction = secrets.randbelow(360) if options['windDirection'] == -1 else options['windDirection']
    # AC's input is the airflow's destination bearing; the editor uses the meteorological source bearing.
    # Native 82 degrees moved particles east on Heiligenblut; wind arriving from east must move them west.
    ini['WIND']['DIRECTION_DEG'] = f'{(direction + 180) % 360:g}'
    ini['WIND']['SPEED_KMH_MIN'] = ini['WIND']['SPEED_KMH_MAX'] = f"{options['windSpeed']:g}"


def without_config(raw):
    """Remove only our owned include blocks from ext_config bytes, preserving unrelated configuration. Pure."""
    return re.sub(rb'\r?\n?' + re.escape(BEGIN) + rb'.*?' + re.escape(END) + rb'\r?\n?', b'', raw, flags=re.S)


def _write(path, raw):
    """Write an owned asset only when its bytes differ."""
    if not path.exists() or path.read_bytes() != raw:
        path.write_bytes(raw)


def install_track(track):
    """Ship our Lua and one owned include into a generated, saved or existing track folder."""
    ext = Path(track) / 'extension'
    ext.mkdir(parents=True, exist_ok=True)
    _write(ext / 'map2lap_weather.lua', SCRIPT.read_bytes())
    _write(ext / 'map2lap_weather.ini', b'[SCRIPT_...]\nACTIVE=1\nSCRIPT=map2lap_weather.lua\n')
    config = ext / 'ext_config.ini'
    before = config.read_bytes() if config.exists() else b''
    clean = without_config(before)
    _write(config, clean + b'\n' + BEGIN + b'\n[INCLUDE: map2lap_weather.ini]\n' + END + b'\n')


def install_controller(ac):
    """Install our own static controller beside CSP's controllers, leaving their files untouched."""
    folder = Path(ac) / 'extension' / 'weather-controllers' / 'map2lap'
    folder.mkdir(parents=True, exist_ok=True)
    _write(folder / 'controller.lua', CONTROLLER.read_bytes())
    _write(folder / 'manifest.ini', b'[ABOUT]\nNAME=Map2Lap\nDESCRIPTION=Static weather and additional fog for Map2Lap\n')
