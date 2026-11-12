"""One reversible Heiligenblut particle experiment; restore changed files after AC exits."""
import argparse
import configparser
import hashlib
import io
import json
import subprocess
import time

from context import AC, DOCS, EXT, MODE, MODES, RUNTIME, SCRIPT, SOURCE, STATE, TRACK, system

CONFIG = EXT / 'ext_config.ini'

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def ini_bytes(raw, values):
    parser = configparser.ConfigParser(interpolation=None, strict=False)
    parser.optionxform = str
    parser.read_string(raw.decode('utf-8-sig'))
    for section, entries in values.items():
        if section not in parser:
            parser.add_section(section)
        for key, value in entries.items():
            parser.set(section, key, str(value))
    for section in list(parser.sections()):
        if section.startswith('CAR_') and section != 'CAR_0' or section.startswith('SESSION_') and section != 'SESSION_0':
            parser.remove_section(section)
    stream = io.StringIO()
    parser.write(stream, space_around_delimiters=False)
    return stream.getvalue().encode('utf-8')

def active():
    return any(system.running(name) for name in ('acs.exe', 'Map2Lap Build.exe', 'Map2Lap Worker.exe'))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=MODES)
    args = parser.parse_args()
    if args.mode:
        state = json.loads(STATE.read_text())
        if state['state'] != 'running' or not system.running('acs.exe') or not SCRIPT.exists():
            raise RuntimeError('No active owned weather session')
        MODE.write_text(args.mode, encoding='utf-8')
        print('Weather:', args.mode, flush=True)
        return
    if active():
        raise RuntimeError('AC or a Map2Lap build is running')
    if SCRIPT.exists() or MODE.exists():
        raise RuntimeError('Earlier probe files exist; resolve them first')
    stamp = time.strftime('%Y%m%d-%H%M%S')
    RUNTIME.mkdir(parents=True, exist_ok=True)
    backup = RUNTIME / ('backup-' + stamp)
    backup.mkdir()
    original_config = CONFIG.read_bytes()
    race, video = DOCS / 'cfg/race.ini', DOCS / 'cfg/video.ini'
    before = {CONFIG: original_config, race: race.read_bytes(), video: video.read_bytes()}
    writes = {
        CONFIG: original_config + b'\n[SCRIPT_...]\nACTIVE=1\nSCRIPT=map2lap_weather_probe.lua\n',
        SCRIPT: (SOURCE / 'weather.lua').read_bytes(),
        MODE: b'off',
        race: ini_bytes(before[race], {
            'RACE': {'TRACK': TRACK.name, 'CONFIG_TRACK': '', 'CARS': 1},
            'SESSION_0': {'NAME': 'Practice', 'TYPE': 1, 'DURATION_MINUTES': 0, 'SPAWN_SET': 'START'},
            'REMOTE': {'ACTIVE': 0}, 'REPLAY': {'ACTIVE': 0}, 'BENCHMARK': {'ACTIVE': 0},
            'RESTART': {'ACTIVE': 0}, '__PREVIEW_GENERATION': {'ACTIVE': 0},
            'LIGHTING': {'SUN_ANGLE': -32, '__CM_WEATHER_TYPE': 15, '__CM_WEATHER_CONTROLLER': 'base',
                         '__TRACK_GEOTAG_LAT': '47.05984', '__TRACK_GEOTAG_LONG': '12.80640',
                         '__TRACK_TIMEZONE_OFFSET': 3600, '__TRACK_TIMEZONE_BASE_OFFSET': 3600, '__TRACK_TIMEZONE_DTS': 0},
            'WEATHER': {'NAME': '3_clear'},
        }),
        video: ini_bytes(before[video], {'VIDEO': {'FULLSCREEN': 0, 'WIDTH': 1600, 'HEIGHT': 900}}),
    }
    for path, raw in before.items():
        (backup / path.name).write_bytes(raw)
    manifest = {'before': {str(path): sha(raw) for path, raw in before.items()},
                'written': {str(path): sha(raw) for path, raw in writes.items()}, 'created': [str(SCRIPT), str(MODE)]}
    (backup / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    proc = None
    state = {'state': 'prepared', 'backup': str(backup), 'track': TRACK.name}
    try:
        if active():
            raise RuntimeError('AC or a build started during preparation')
        for path, raw in writes.items():
            path.write_bytes(raw)
        proc = subprocess.Popen([str(AC / 'acs.exe')], cwd=AC)
        state.update(state='running', pid=proc.pid, started=time.time())
        STATE.write_text(json.dumps(state, indent=2), encoding='utf-8')
        print(json.dumps(state), flush=True)
        state['exit_code'] = proc.wait()
    finally:
        if proc is not None and proc.poll() is None:
            proc.wait()
        conflicts = []
        for path, raw in before.items():
            try:
                current = path.read_bytes()
                if current == writes[path]:
                    path.write_bytes(raw)
                elif current != raw:
                    conflicts.append(str(path))
            except OSError:
                # A deleted/locked INI must not prevent restoring the other independent backups.
                conflicts.append(str(path))
        receipt = RUNTIME / 'updated-script.json'
        expected_script = sha(writes[SCRIPT])
        if receipt.exists():
            updated = json.loads(receipt.read_text())
            if proc is not None and updated.get('pid') == proc.pid:
                expected_script = updated['sha256']
        if SCRIPT.exists() and sha(SCRIPT.read_bytes()) == expected_script:
            SCRIPT.unlink()
        if MODE.exists() and MODE.read_text().strip() in MODES:
            MODE.unlink()
        state.update(state='exited', restored=not conflicts, conflicts=conflicts)
        STATE.write_text(json.dumps(state, indent=2), encoding='utf-8')
        print(json.dumps(state), flush=True)

if __name__ == '__main__':
    main()
