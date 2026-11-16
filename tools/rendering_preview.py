"""Reversible AC/Proton lighting comparisons: start, capture, stop and recover interrupted sessions."""
import argparse
import configparser
import hashlib
import io
import json
import math
from pathlib import Path
import re
import shutil
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src'))
from app import debugapp, settings, system

RUNTIME = ROOT / 'out/rendering-preview'
STATE = RUNTIME / 'session.json'


def sha(raw):
    """SHA-256 of file bytes. Pure."""
    return hashlib.sha256(raw).hexdigest()


def ini_bytes(raw, changes):
    """Apply section/key changes while retaining unrelated INI values. Pure."""
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.optionxform = str
    ini.read_string(raw.decode('utf-8-sig'))
    for section, values in changes.items():
        if section not in ini:
            ini.add_section(section)
        for key, value in values.items():
            ini[section][key] = str(value)
    output = io.StringIO()
    ini.write(output, space_around_delimiters=False)
    return output.getvalue().encode()


def prepare(backup, writes):
    """Back up every destination before changing any; return the recoverable manifest."""
    backup.mkdir(parents=True)
    entries = []
    for i, (path, raw) in enumerate(writes.items()):
        original = path.read_bytes() if path.exists() else None
        saved = backup / f'{i:02d}.original'
        if original is not None:
            saved.write_bytes(original)
        entries.append({'path': str(path), 'backup': str(saved),
                        'before': sha(original) if original is not None else None, 'written': sha(raw)})
    manifest = backup / 'manifest.json'
    manifest.write_text(json.dumps(entries, indent=2), encoding='utf-8')
    return manifest


def restore_files(manifest, exposure=None):
    """Restore owned changes independently; return paths whose contents changed outside the probe."""
    conflicts = []
    for entry in json.loads(Path(manifest).read_text(encoding='utf-8')):
        path = Path(entry['path'])
        try:
            raw = path.read_bytes() if path.exists() else None
            current = sha(raw) if raw is not None else None
            if current == entry['before']:
                continue
            # The camera sets exposure to 1; AC serializes it on exit.
            saved_exposure = (path == exposure and raw is not None
                              and raw.replace(b'\r', b'') == b'[EXPOSURE]\nVALUE=1\n')
            if current != entry['written'] and not saved_exposure:
                conflicts.append(str(path))
                continue
            if entry['before'] is None:
                path.unlink(missing_ok=True)
            else:
                original = Path(entry['backup']).read_bytes()
                if sha(original) != entry['before']:
                    raise ValueError('Backup checksum mismatch')
                path.write_bytes(original)
        except (OSError, ValueError):
            conflicts.append(str(path))
    return conflicts


def camera_command(name, position, direction, fov):
    """Encode camera values and a screenshot name with fixed exposure and a fresh request ID."""
    if not re.fullmatch(r'[A-Za-z0-9_-]+', name):
        raise ValueError('Screenshot name must contain only letters, digits, underscores or hyphens')
    values = (*position, *direction, fov, 1)
    if not all(math.isfinite(v) for v in values) or sum(v*v for v in direction) == 0 or not 1 < fov < 170:
        raise ValueError('Camera needs finite coordinates, a nonzero direction and FOV between 1 and 170')
    return ' '.join(f'{v:.8f}' for v in values) + f' shot={name} nonce={time.time_ns()}'


def load_state():
    """Read the session receipt; no game/configuration changes."""
    return json.loads(STATE.read_text(encoding='utf-8'))


def save_state(state):
    """Atomically publish the receipt used by later commands and recovery."""
    temporary = STATE.with_suffix('.tmp')
    temporary.write_text(json.dumps(state, indent=2), encoding='utf-8')
    temporary.replace(STATE)


def start(args):
    """Start an installed track with backed-up settings; the receipt survives this launcher exiting."""
    if any(system.running(n) for n in ('acs.exe', 'Map2Lap Build.exe', 'Map2Lap Worker.exe')):
        raise RuntimeError('AC or a Map2Lap build is running')
    if STATE.exists() and load_state()['state'] != 'restored':
        raise RuntimeError('Previous session needs stop/restore first')
    ac = Path(args.ac_root or settings.ac_path()).resolve()
    docs = Path(system.documents(str(ac))) / 'Assetto Corsa'
    track = ac / 'content/tracks' / args.track
    if not track.is_dir() or not debugapp.ours(debugapp.folder(str(ac))):
        raise RuntimeError('Install the gallery and enable Map2Lap Track Debug before starting')
    run = RUNTIME / time.strftime('%Y%m%d-%H%M%S')
    run.mkdir(parents=True)
    command = run / 'camera.txt'
    command.write_text('', encoding='utf-8')  # Never carry a previous quit request into a new session.
    app = Path(debugapp.folder(str(ac))) / 'TrackDebug.lua'
    folder = run.as_posix() + '/'
    if not system.WIN:
        folder = 'Z:' + folder
    camera_script = Path(__file__).with_name('rendering_camera.lua').read_text(encoding='utf-8')
    camera_script = camera_script.replace('__FOLDER__', json.dumps(folder, ensure_ascii=False))
    camera_script = camera_script.replace('__TRACK__', json.dumps(args.track))
    race, video, exposure = (docs / 'cfg' / n for n in ('race.ini', 'video.ini', 'exposure.ini'))
    free_camera = ac / 'system/cfg/assetto_corsa.ini'
    writes = {
        app: app.read_bytes() + b'\n' + camera_script.encode(),
        exposure: exposure.read_bytes(),
        free_camera: ini_bytes(free_camera.read_bytes(), {'CAMERA': {'ALLOW_FREE_CAMERA': 1}}),
        race: ini_bytes(race.read_bytes(), {
            'RACE': {'TRACK': args.track, 'CONFIG_TRACK': '', 'CARS': 1},
            'SESSION_0': {'NAME': 'Practice', 'TYPE': 1, 'DURATION_MINUTES': 0, 'SPAWN_SET': 'START'},
            'REMOTE': {'ACTIVE': 0}, 'REPLAY': {'ACTIVE': 0}, 'BENCHMARK': {'ACTIVE': 0},
            'RESTART': {'ACTIVE': 0}, '__PREVIEW_GENERATION': {'ACTIVE': 0},
            'LIGHTING': {'SUN_ANGLE': -32, '__CM_WEATHER_TYPE': 15, '__CM_WEATHER_CONTROLLER': 'base'},
            'WEATHER': {'NAME': '3_clear'}, 'WIND': {'SPEED_KMH_MIN': 0, 'SPEED_KMH_MAX': 0}}),
        video: ini_bytes(video.read_bytes(), {'VIDEO': {'FULLSCREEN': 0, 'WIDTH': 1600, 'HEIGHT': 900}}),
    }
    if args.fixed:
        filter_path = ac / 'system/cfg/ppfilters/m2l_render_fixed.ini'
        if filter_path.exists():
            raise RuntimeError('Temporary filter already exists; resolve its owner first')
        writes[filter_path] = ini_bytes((filter_path.parent / 'default.ini').read_bytes(), {
            'AUTO_EXPOSURE': {'ENABLED': 0}, 'TONEMAPPING': {'EXPOSURE': args.fixed}})
        writes[video] = ini_bytes(writes[video], {'POST_PROCESS': {'FILTER': filter_path.stem}})
    state = {'state': 'prepared', 'ac': str(ac), 'docs': str(docs), 'track': str(track),
             'run': str(run), 'exposure': str(exposure), 'fixed': args.fixed,
             'manifest': str(prepare(run / 'backup', writes))}
    save_state(state)
    for path, raw in writes.items():
        path.write_bytes(raw)
    if args.dump_shaders:
        import os
        dump = run / 'shaders'; dump.mkdir()
        os.environ['DXVK_SHADER_DUMP_PATH'] = str(dump)
    system.start_ac(str(ac), weather_effects=False)
    for _ in range(30):
        found = [pid for pid, name, _ in system._processes() if name.lower() == 'acs.exe']
        if found and (run / 'ready.txt').exists():
            state.update(state='running', pid=found[0])
            save_state(state)
            print(json.dumps(state, indent=2))
            return
        time.sleep(1)
    raise RuntimeError('No camera-ready AC session within 30s. Inspect AC; the restore receipt is preserved.')


def require_owned(state):
    """Refuse input unless the recorded AC process is still running."""
    if state['state'] != 'running' or not any(pid == state['pid'] and name.lower() == 'acs.exe'
                                           for pid, name, _ in system._processes()):
        raise RuntimeError('The recorded AC session is no longer running')


def capture(args):
    """Capture from the renderer, without moving desktop focus; save settings beside the image."""
    state = load_state(); require_owned(state)
    run = Path(state['run'])
    position = args.position
    if args.variant:
        rows = json.loads((Path(state['track']) / 'data/gallery.json').read_text())
        row = next(r for r in rows if r['species'] == args.species and r['variant'] == args.variant)
        x, y, z = row['pos']
        position = (x, y + 7.5, z + 25)
    if position is None:
        raise ValueError('Specify --position or --variant')
    command = camera_command(args.name, position, args.direction, args.fov)
    shot = run / (args.name + '.png')
    if shot.exists():
        raise ValueError('Screenshot already exists; use a new comparison name')
    (run / 'camera.txt').write_text(command, encoding='utf-8')
    for _ in range(30):
        if shot.exists():
            log = Path(state['docs']) / 'logs/custom_shaders_patch.log'
            if log.exists():
                shutil.copyfile(log, shot.with_suffix('.log'))
            shot.with_suffix('.json').write_text(json.dumps({'command': command, 'session': state}, indent=2))
            print(shot)
            return
        time.sleep(1)
    raise RuntimeError('No renderer screenshot: inspect CSP log for errors/crash; do not use a stale window image')


def restore():
    """Restore a stopped session, retaining backups and reporting any independent edits."""
    if system.running('acs.exe'):
        raise RuntimeError('Close AC before restoring files')
    state = load_state()
    conflicts = restore_files(state['manifest'], exposure=Path(state['exposure']))
    state.update(state='conflicts' if conflicts else 'restored', conflicts=conflicts)
    save_state(state)
    if conflicts:
        raise RuntimeError('Independent edits retained: ' + ', '.join(conflicts))
    print('All session files restored; backups and screenshots retained in ' + state['run'])


def stop():
    """Ask the owned session to exit, then restore; a crashed game must be closed separately."""
    state = load_state()
    if system.running('acs.exe'):
        require_owned(state)
        (Path(state['run']) / 'camera.txt').write_text('quit', encoding='utf-8')
        for _ in range(30):
            if not system.running('acs.exe'):
                break
            time.sleep(1)
    restore()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_subparsers(dest='action', required=True)
    launch = actions.add_parser('start', help='Back up settings and start an installed track')
    launch.add_argument('--ac-root', type=Path)
    launch.add_argument('--track', default='map2lap_rendering_gallery')
    launch.add_argument('--fixed', type=float, metavar='EXPOSURE', help='Disable auto exposure using a temporary default PP copy (e.g. 0.28)')
    launch.add_argument('--dump-shaders', action='store_true', help='Linux/DXVK: save executed DXBC and SPIR-V under this session')
    snap = actions.add_parser('capture', help='Set a repeatable camera and save a renderer PNG')
    snap.add_argument('name')
    snap.add_argument('--variant', help='Gallery variant; reads its current position from gallery.json')
    snap.add_argument('--species', default='spruce')
    snap.add_argument('--position', nargs=3, type=float, metavar=('X', 'Y', 'Z'))
    snap.add_argument('--direction', nargs=3, type=float, default=(0., 0., -1.))
    snap.add_argument('--fov', type=float, default=40.)
    actions.add_parser('stop', help='Exit the owned AC session and restore all settings')
    actions.add_parser('restore', help='Recover after an interruption, with AC already closed')
    actions.add_parser('status', help='Read the persistent session receipt')
    args = parser.parse_args()
    if args.action == 'start':
        if args.fixed is not None and (not math.isfinite(args.fixed) or args.fixed <= 0):
            parser.error('--fixed must be positive')
        start(args)
    elif args.action == 'capture':
        capture(args)
    elif args.action == 'stop':
        stop()
    elif args.action == 'restore':
        restore()
    else:
        print(json.dumps(load_state(), indent=2))


if __name__ == '__main__':
    main()
