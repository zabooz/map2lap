"""Editor weather and session temperatures, with portable public-CSP visuals."""
import configparser
import math
from pathlib import Path
import re
import secrets

from app.paths import ROOT
from app import seasons

ASSETS = Path(ROOT) / 'assets' / 'weather'
SCRIPT = ASSETS / 'weather.lua'
CONTROLLER = ASSETS / 'controller.lua'
MAX_WIND = 100  # km/h; -1 chooses one random speed per Play, like the wind direction. Both start calm (0): wind is the driver's choice.
# Winter air and sun-heated tarmac need separate ranges, wider than CSP's normal input limits.
TEMPERATURE_LIMITS = {'airTemperature': (-30, 50), 'roadTemperature': (-30, 80)}
DEFAULT = {'kind': 'dry', 'intensity': 'light', 'windDirection': 0, 'windSpeed': 0, 'fog': False, 'windscreenSnow': True, 'season': 'summer',
           'airTemperature': 20, 'roadTemperature': 26}
TYPES = {'dry': (15, 17, 19), 'rain': (6, 7, 2), 'snow': (9, 10, 11)}
LEVELS = ('light', 'medium', 'heavy')
BEGIN, END = b'; MAP2LAP_WEATHER_BEGIN', b'; MAP2LAP_WEATHER_END'


# Kunos' cfg/templates/tracks.ini, in the order of GRIP_KEYS. Grip is independent
# of the visual weather. Optimum fixes starting grip for comparable timed drives.
GRIP_KEYS = ("SESSION_START", "SESSION_TRANSFER", "RANDOMNESS", "LAP_GAIN")
TRACK_GRIP = {"Dusty": (86, 50, 1, 30), "Old": (89, 80, 3, 50), "Slow": (96, 80, 1, 300),
              "Green": (95, 90, 2, 132), "Fast": (98, 80, 2, 700), "Optimum": (100, 100, 0, 1)}
GRIP_SLIDERS = {"start": "SESSION_START", "variation": "RANDOMNESS"}


def grip_options(race_file):
    """Stock AC grip choices and the last session's matching preset, including custom configurations."""
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    last = None
    current = {"start": 100, "variation": 0}
    try:
        ini.read(race_file, encoding="utf-8-sig")
        if ini.has_section("DYNAMIC_TRACK"):
            last = "Custom"
            for field, key in GRIP_SLIDERS.items():
                try:
                    value = ini.getfloat("DYNAMIC_TRACK", key)
                    if math.isfinite(value):
                        current[field] = value
                except (ValueError, configparser.NoOptionError):
                    pass
            values = tuple(ini.getfloat("DYNAMIC_TRACK", key, fallback=None) for key in GRIP_KEYS)
            last = next((name for name, preset in TRACK_GRIP.items() if preset == values), last)
    except (configparser.Error, ValueError, OSError):
        pass
    return {"presets": [{"name": name, "start": start, "variation": randomness}
                        for name, (start, _, randomness, _) in TRACK_GRIP.items()], "last": last, "current": current}


def valid_grip(choice):
    """Whether the selection names a stock preset or edits grip percentages. Pure."""
    if isinstance(choice, str):
        return choice in TRACK_GRIP
    if not isinstance(choice, dict) or choice.keys() - {*GRIP_SLIDERS, "preset"}:
        return False
    if "preset" in choice and not (isinstance(choice["preset"], str) and choice["preset"] in TRACK_GRIP):
        return False
    edits = choice.keys() & GRIP_SLIDERS.keys()
    return bool(edits) and all(type(choice[key]) is int and 0 <= choice[key] <= 100 for key in edits)


def apply_grip(ini, choice):
    """Apply a validated stock preset and any explicit slider edits to the session INI."""
    if not ini.has_section("DYNAMIC_TRACK"):
        ini.add_section("DYNAMIC_TRACK")
        for key, value in zip(GRIP_KEYS, TRACK_GRIP["Optimum"]):
            ini.set("DYNAMIC_TRACK", key, str(value))
    edits = {"preset": choice} if isinstance(choice, str) else choice
    if "preset" in edits:
        for key, value in zip(GRIP_KEYS, TRACK_GRIP[edits["preset"]]):
            ini.set("DYNAMIC_TRACK", key, str(value))
    for field, key in GRIP_SLIDERS.items():
        if field in edits:
            ini.set("DYNAMIC_TRACK", key, str(edits[field]))


def parse(value):
    """Validate a weather object, filling defaults and normalising north's 360 degrees to zero. Pure."""
    if not isinstance(value, dict) or set(value) - set(DEFAULT):
        raise ValueError('Invalid weather settings')
    out = {**DEFAULT, **value}
    if not isinstance(out['season'], str) or out['season'] not in seasons.SEASONS:
        raise ValueError('Invalid season setting')
    if (not isinstance(out['kind'], str) or out['kind'] not in TYPES or out['intensity'] not in LEVELS
            or not isinstance(out['fog'], bool) or not isinstance(out['windscreenSnow'], bool)):
        raise ValueError('Invalid weather, intensity or fog setting')
    for key in ('windDirection', 'windSpeed'):
        n = out[key]
        if isinstance(n, bool) or not isinstance(n, (int, float)) or not math.isfinite(n):
            raise ValueError('Invalid wind setting')
    direction, speed = out['windDirection'], out['windSpeed']
    if direction != -1 and not 0 <= direction <= 360 or speed != -1 and not 0 <= speed <= MAX_WIND:
        raise ValueError(f'Wind must be 0–360 degrees or random, and 0–{MAX_WIND} km/h or random')
    if direction == 360:
        out['windDirection'] = 0
    for key, (low, high) in TEMPERATURE_LIMITS.items():
        n = out[key]
        if isinstance(n, bool) or not isinstance(n, (int, float)) or not math.isfinite(n) or not low <= n <= high:
            label = 'Air temperature' if key == 'airTemperature' else 'Road temperature'
            raise ValueError(f'{label} must be {low} to {high} degrees Celsius')
    return out


def weather_type(options):
    """CSP's native type for validated weather settings: dry cloud cover, rain or snow intensity. Pure."""
    return TYPES[options['kind']][LEVELS.index(options['intensity'])]


def scenery_options(ini, options=None):
    """Use the Editor's options, or preserve My tracks' existing session season and native snow. Pure."""
    if options is not None:
        return options
    season = ini.get('LIGHTING', '__MAP2LAP_SEASON', fallback='summer')
    if season not in seasons.SEASONS:
        season = 'summer'
    native = ini.get('LIGHTING', '__CM_WEATHER_TYPE', fallback='')
    return {**DEFAULT, 'season': season, 'kind': 'snow' if native in {str(t) for t in TYPES['snow']} else 'dry'}


def apply_session(ini, options):
    """Set native CSP sky, wind, temperatures and additional fog in a race ConfigParser; preserve other settings."""
    for section in ('LIGHTING', 'WEATHER', 'WIND', 'TEMPERATURE'):
        if not ini.has_section(section):
            ini.add_section(section)
    ini['LIGHTING']['__CM_WEATHER_CONTROLLER'] = 'map2lap'
    ini['LIGHTING']['__CM_WEATHER_TYPE'] = str(weather_type(options))
    ini['LIGHTING']['__MAP2LAP_FOG'] = '1' if options['fog'] else '0'
    ini['LIGHTING']['__MAP2LAP_WINDSCREEN_SNOW'] = '1' if options['windscreenSnow'] else '0'
    ini['LIGHTING']['__MAP2LAP_SEASON'] = seasons.resolve(options)
    # This vanilla fallback also works before CSP is installed; CSP uses the explicit type above.
    ini['WEATHER']['NAME'] = '3_clear' if options['kind'] == 'dry' and options['intensity'] == 'light' else '7_heavy_clouds'
    direction = secrets.randbelow(360) if options['windDirection'] == -1 else options['windDirection']
    # AC's input is the airflow's destination bearing; the editor uses the meteorological source bearing.
    # Native 82 degrees moved particles east on Heiligenblut; wind arriving from east must move them west.
    ini['WIND']['DIRECTION_DEG'] = f'{(direction + 180) % 360:g}'
    speed = secrets.randbelow(MAX_WIND + 1) if options['windSpeed'] == -1 else options['windSpeed']
    ini['WIND']['SPEED_KMH_MIN'] = ini['WIND']['SPEED_KMH_MAX'] = f'{speed:g}'
    ini['TEMPERATURE']['AMBIENT'] = f'{options["airTemperature"]:g}'
    ini['TEMPERATURE']['ROAD'] = f'{options["roadTemperature"]:g}'


def without_config(raw):
    """Remove only our owned include blocks from ext_config bytes, preserving unrelated configuration. Pure."""
    return re.sub(rb'\r?\n?' + re.escape(BEGIN) + rb'.*?' + re.escape(END) + rb'\r?\n?', b'', raw, flags=re.S)


def _write(path, raw):
    """Write an owned asset only when its bytes differ."""
    if not path.exists() or path.read_bytes() != raw:
        path.write_bytes(raw)


def install_track(track, options=None, effects=True):
    """Ship our Lua/include; effects=False deactivates the entire script, including previously installed copies."""
    ext = Path(track) / 'extension'
    ext.mkdir(parents=True, exist_ok=True)
    _write(ext / 'map2lap_weather.lua', SCRIPT.read_bytes())
    _write(ext / 'map2lap_weather.ini', f'[SCRIPT_...]\nACTIVE={int(effects)}\nSCRIPT=map2lap_weather.lua\n'.encode())
    config = ext / 'ext_config.ini'
    before = config.read_bytes() if config.exists() else b''
    clean = without_config(before)
    seasons.install(track, seasons.resolve(options) if options is not None else 'summer')
    _write(config, clean + b'\n' + BEGIN + b'\n[INCLUDE: map2lap_weather.ini]\n[INCLUDE: map2lap_seasons.ini]\n' + END + b'\n')


def install_controller(ac):
    """Install our own static controller beside CSP's controllers, leaving their files untouched."""
    folder = Path(ac) / 'extension' / 'weather-controllers' / 'map2lap'
    folder.mkdir(parents=True, exist_ok=True)
    _write(folder / 'controller.lua', CONTROLLER.read_bytes())
    _write(folder / 'manifest.ini', b'[ABOUT]\nNAME=Map2Lap\nDESCRIPTION=Static weather and additional fog for Map2Lap\n')
