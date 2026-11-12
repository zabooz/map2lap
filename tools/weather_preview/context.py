"""Resolve versioned weather sources and the shared, untracked AC preview session."""
from pathlib import Path
import subprocess
import sys

REPO = Path(__file__).resolve().parents[2]
SOURCE = REPO / 'assets' / 'weather'
COMMON_ROOT = Path(subprocess.check_output(
    ['git', 'rev-parse', '--path-format=absolute', '--git-common-dir'],
    cwd=REPO, text=True,
).strip()).parent
RUNTIME = COMMON_ROOT / 'out' / 'weather-probe'
sys.path.insert(0, str(REPO / 'src'))
from app import settings, system

# Worktrees share the user's existing AC setting without copying personal configuration.
settings.FILE = str(COMMON_ROOT / 'settings.json')
AC = Path(settings.ac_path())
DOCS = Path(system.documents(str(AC))) / 'Assetto Corsa'
TRACK = AC / 'content' / 'tracks' / 'heiligenblut_test'
EXT = TRACK / 'extension'
SCRIPT = EXT / 'map2lap_weather_probe.lua'
MODE = EXT / 'map2lap_weather_probe_mode.txt'
STATE = RUNTIME / 'session.json'
MODES = ('off', 'rain', 'snow', 'fog', 'wind', 'direction', 'auto', 'glass', 'glassraw', 'glassoff', 'glassred', 'glasscapture', 'snowrust', 'snowlua', 'rainrust', 'rainlua')
