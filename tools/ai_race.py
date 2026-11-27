"""Measure an unattended offline AI race on its installed line. Start waits, archives and restores."""
import argparse
from collections import Counter, defaultdict
import configparser
from contextlib import contextmanager
import io
import json
import math
import os
from pathlib import Path
import re
import shutil
import signal
import statistics
import subprocess
import sys
import tempfile
import time
import uuid

from rendering_preview import ROOT, ini_bytes, prepare, restore_files, sha
from app import acplugin, csp, mytracks, settings, system
from watch_build import role

OUT = ROOT / 'out/ai-race'
LOGS = ('custom_shaders_patch.log', 'log.txt')
RECORD = re.compile(rb'M2L_(ALL|EVT|HIT|NEAR|END),([A-Za-z0-9.,:+-]+)')


def telemetry(raw):
    """Decode printable probe records embedded in binary or strings-extracted CSP bytes. Pure."""
    for m in RECORD.finditer(raw):
        yield m[1].decode(), m[2].decode().split(',')


def sample(car, sp, speed, lap, flags, x, z, t):
    """One timestamped car observation from a probe record. Pure."""
    return dict(car=int(car), spline=float(sp), kmh=float(speed), lap=int(lap),
                flags=flags, x=float(x), z=float(z), t=t)


def car_sample(field, t):
    """Decode a car from a frame, including optional height, pedals and heading. Pure."""
    values = field.split(':')
    row = sample(*values[:7], t)
    if values[7:]:
        row.update(zip(('y', 'brake', 'gas', 'look_x', 'look_z'), map(float, values[7:]), strict=True))
    if not all(math.isfinite(v) for v in row.values() if isinstance(v, float)):
        raise ValueError('non-finite car sample')
    return row


def parked(row):
    """Whether the car reports pit or retirement state. Pure."""
    return 'R' in row['flags'] or 'P' in row['flags']


def speed_change(old, row):
    """Speed loss and mean deceleration over an adjacent pair of frames. Pure."""
    dt = row['t'] - old['t']
    drop = old['kmh'] - row['kmh']
    return dict(row, from_kmh=old['kmh'], dt_s=round(dt, 3),
                drop_kmh=drop, mean_g=round(drop / (3.6 * dt * 9.81), 2))


def neighbours(row, rows):
    """Horizontal separation from the player and closest retired opponent at a stop. Pure."""
    nearby = {}
    for other in rows:
        label = 'player' if not other['car'] else 'retired' if 'R' in other['flags'] else None
        if label:
            distance = math.hypot(other['x'] - row['x'], other['z'] - row['z'])
            if label not in nearby or distance < nearby[label]['distance_xz_m']:
                nearby[label] = dict(car=other['car'], distance_xz_m=round(distance, 2))
    return nearby


class Motion:
    """Stop duration and peak loss of speed during its consecutive deceleration samples."""

    def __init__(self):
        self.stops, self.drops = [], []
        self.standing, self.peaks = {}, {}

    def observe(self, old, row, frame):
        """Measure one car between adjacent road samples, excluding gaps and teleports."""
        car, t = row['car'], row['t']
        if not old or not 0 < t - old['t'] <= 1 or parked(old) or parked(row):
            self.standing.pop(car, None)
            self.peaks.pop(car, None)
            return
        change = speed_change(old, row)
        if change['drop_kmh'] < 0:
            self.peaks.pop(car, None)
        elif change['drop_kmh'] > 0 and (car not in self.peaks or change['mean_g'] > self.peaks[car]['mean_g']):
            self.peaks[car] = change
        # At the half-second cadence 20 km/h is about 1.1 g. Retain fast impacts too.
        if change['drop_kmh'] >= 20:
            self.drops.append(change)
        if old['kmh'] >= 3 > row['kmh']:
            stop = dict(change, **neighbours(row, frame), observed_s=0., approach_peak=self.peaks.pop(car, change))
            self.standing[car] = stop
            self.stops.append(stop)
        if row['kmh'] >= 3:
            self.standing.pop(car, None)
        elif car in self.standing:
            self.standing[car]['observed_s'] = round(t - self.standing[car]['t'], 2)


def analyse(raw, ac_log, opponents=None):
    """Summarize the recorded samples and independent AC counters. Pure."""
    previous, retired, events, near = {}, {}, [], []
    motion, incomplete_frames = Motion(), 0
    speeds, hits = defaultdict(list), defaultdict(list)
    times, ended, malformed, reset = [], None, 0, False
    for kind, fields in telemetry(raw):
        try:
            t = float(fields[0])
            if kind == 'HIT':
                _, car, peer, depth, sp, kmh = fields
                pair = tuple(sorted((int(car), int(peer) - 1)))
                hits[pair].append((t, float(sp), float(kmh), float(depth)))
            elif kind == 'NEAR':
                _, car, fwd, side, kmh, gas, brake, flags = fields
                near.append(dict(t=t, car=int(car), forward=float(fwd), side=float(side),
                                 kmh=float(kmh), gas=float(gas), brake=float(brake), flags=flags))
            elif kind == 'END':
                ended = (t, int(fields[1]), fields[2] if len(fields) > 2 else 'opponents')
            elif kind == 'EVT':
                _, car, old, flags, sp, speed, lap, x, z = fields
                row = sample(car, sp, speed, lap, flags, x, z, t)
                events.append(dict(row, before=old))
                if 'R' in flags and 'R' not in old:
                    retired.setdefault(int(car), dict(car=int(car), last_active=previous.get(int(car)), parked=row))
            else:
                rows = [car_sample(field, t) for field in fields[2:]]
                if not rows:
                    raise ValueError('empty frame')
                by_car = {r['car']: r for r in rows}
                if opponents and not all(i in by_car for i in range(1, opponents + 1)):
                    incomplete_frames += 1
                if times and t <= times[-1]:
                    reset = True
                    previous.clear()
                    motion.standing.clear()
                    motion.peaks.clear()
                times.append(t)
                for row in rows:
                    car = row['car']
                    old = previous.get(car)
                    previous[car] = row
                    if not car:
                        continue
                    if 'R' in row['flags']:
                        retired.setdefault(car, dict(car=car, last_active=old, parked=row))
                    if not parked(row):
                        speeds[row['lap'], min(49, int(row['spline'] * 50))].append(row['kmh'])
                    motion.observe(old, row, rows)
        except (ValueError, TypeError, IndexError, OverflowError):
            malformed += 1
    ac_retired = Counter(int(i) for i in re.findall(rb'CAR (\d+) RETIRED\b', ac_log))
    ac_laps = [list(map(int, v)) for v in re.findall(rb'LAP VALID: (\d+) CUTS:(\d+), COUNT: (\d+)', ac_log)]
    native_lap = max((count for valid, cuts, count in ac_laps if valid), default=0)
    later_lap = native_lap > max((r['lap'] for r in previous.values()), default=0)
    missing = sorted(ac_retired.keys() - retired.keys())
    for row in motion.stops + motion.drops + [r['approach_peak'] for r in motion.stops]:
        row['contact_with'] = sorted({j for pair, hh in hits.items() if row['car'] in pair
                                      and any(row['t'] - row['dt_s'] <= h[0] <= row['t'] for h in hh)
                                      for j in pair if j != row['car']})
    truncated = b'limit exceeded' in raw.lower()
    complete = ended and times and abs(ended[0] - times[-1]) <= 1 and ended[1] == opponents
    observed = bool(times and opponents and all(i in by_car and 'R' in by_car[i]['flags']
                                              for i in range(1, opponents + 1)))
    coverage = 'end observed' if complete else 'all opponents observed retired' if observed else 'end unverified'
    if missing or later_lap or truncated or malformed or reset or incomplete_frames or not times:
        coverage = 'incomplete'
    return dict(coverage=coverage, end_reason=ended[2] if ended else None,
                last_sample_s=times[-1] if times else None, samples=len(times),
                max_sample_gap_s=round(max((b-a for a, b in zip(times, times[1:])), default=0), 3),
                malformed=malformed, clock_reset=reset, csp_truncated=truncated, incomplete_frames=incomplete_frames,
                ac_retired=dict(ac_retired), ac_only_retired=missing,
                ac_laps=ac_laps, later_native_lap=later_lap,
                clean_exit=b'CLEAN EXIT' in ac_log, no_pit_lane=b'NO PIT LANE FOUND' in ac_log,
                retirements=list(retired.values()), stops=motion.stops, speed_drops=motion.drops, events=events, near_player=near,
                last_cars=list(previous.values()),
                contacts=[dict(cars=list(pair), records=len(h), first_s=h[0][0], last_s=h[-1][0],
                               first_spline=h[0][1], first_kmh=h[0][2]) for pair, h in sorted(hits.items())],
                speed_profile=[dict(lap=lap, spline_from=b/50, samples=len(v), median_kmh=statistics.median(v))
                               for (lap, b), v in sorted(speeds.items())])


def wall_distances(model, rows):
    """Add horizontal distances to the nearest referenced active 1WALL vertex to each incident."""
    import numpy as np
    from track import kn5
    if not rows:
        return
    sites = np.array([[row['x'], row['z']] for row in rows])
    best = np.full(len(rows), np.inf)
    for_mesh = kn5.scan(str(model))['meshes']
    with model.open('rb') as stream:
        for m in for_mesh:
            if not (m['active'] and m['indices'] and m['name'].startswith('1WALL_')):
                continue
            verts, faces = kn5.mesh_arrays(stream, m)
            xz = verts['pos'][np.unique(faces)][:, [0, 2]]
            distances = np.array([np.hypot(xz[:, 0] - x, xz[:, 1] - z).min() for x, z in sites])
            for i in np.flatnonzero(distances < best):
                rows[i]['wall_vertex_xz'] = dict(mesh=m['name'], m=round(float(distances[i]), 3))
            best = np.minimum(best, distances)


# The track script only observes. The app owns disk output and the menu/quit APIs.
PROBE = """
local elapsed, clock, ended = 0, 0, false
local last, touching = {}, {}
local function emit(line)
  ac.log(line)
  ac.broadcastSharedEvent('__KEY__', line)
end
-- Optional CSP AI caution per opponent (index 1 is CAR_1), applied once on the first update.
local caution, cautionSet = {__CAUTION__}, false
local function applyCaution(elapsed)
  cautionSet = true
  for i, value in ipairs(caution) do
    local ok, err = pcall(physics.setAICaution, i, value)
    emit(string.format('M2L_CAUTION,%.2f,%d,%.3f,%s', elapsed, i, value, ok and 'ok' or tostring(err)))
  end
end
__ROLLOVER_FUNCTION__
function script.update(dt)
  local sim = ac.getSim()
  if sim.isReplayActive or sim.isOnlineRace or ended then return end
  elapsed, clock = elapsed + dt, clock + dt
  if not cautionSet then applyCaution(elapsed) end
  __ROLLOVER_UPDATE__
  local tick = clock >= 0.5
  local parts = {string.format('M2L_ALL,%.2f,%d', elapsed, sim.raceSessionType)}
  local player = ac.getCar(0)
  local finished, parked = 0, 0
  for i = 0, sim.carsCount - 1 do
    local c = ac.getCar(i)
    if c then
      local flags = (c.isRetired and 'R' or '-') .. (c.isInPit and 'P' or '-')
      local state = flags .. (c.isInPitlane and 'L' or '-') .. (c.isActive and 'A' or '-')
      if c.isRaceFinished then flags, state = flags .. 'F', state .. 'F' end
      if last[i] ~= state then
        emit(string.format('M2L_EVT,%.2f,%d,%s,%s,%.5f,%.1f,%d,%.1f,%.1f', elapsed, i, last[i] or 'start',
          state, c.splinePosition, c.speedKmh, c.lapCount, c.position.x, c.position.z))
        last[i] = state
      end
      local peer = c.collisionDepth > 0 and c.collidedWith or 0
      if peer > 0 and (peer ~= touching[i] or tick) then
        emit(string.format('M2L_HIT,%.2f,%d,%d,%.3f,%.5f,%.1f', elapsed, i, peer,
          c.collisionDepth, c.splinePosition, c.speedKmh))
      end
      touching[i] = peer
      if i > 0 and (c.isRetired or c.isRaceFinished) then finished = finished + 1 end
      if i > 0 and (c.isRetired or c.isRaceFinished or c.isInPit) then parked = parked + 1 end
      if tick then
        parts[#parts+1] = string.format('%d:%.4f:%.0f:%d:%s:%.1f:%.1f:%.2f:%.2f:%.2f:%.3f:%.3f',
          i, c.splinePosition, c.speedKmh, c.lapCount, flags, c.position.x, c.position.z,
          c.position.y, c.brake, c.gas, c.look.x, c.look.z)
        if i > 0 and player then
          local delta = c.position - player.position
          local fwd, side = delta:dot(player.look), delta:dot(player.side)
          if math.abs(fwd) < 25 and math.abs(side) < 12 then
            emit(string.format('M2L_NEAR,%.2f,%d,%.2f,%.2f,%.1f,%.2f,%.2f,%s', elapsed, i,
              fwd, side, c.speedKmh, c.gas, c.brake, state))
          end
        end
      end
    end
  end
  if tick then
    clock = 0
    emit(table.concat(parts, ','))
    local sessionOver = sim.isSessionFinished and parked == __COUNT__
    if sim.carsCount == __COUNT__ + 1 and (sessionOver or finished == __COUNT__) then
      emit(string.format('M2L_END,%.2f,%d,%s', elapsed, __COUNT__, sessionOver and 'session' or 'opponents'))
      ended = true
    end
  end
end
"""

APP = """
local folder = __FOLDER__
local eligible = ac.getTrackID() == __TRACK__ and io.fileExists(folder .. 'armed')
-- A stale app after a launcher crash cannot press Drive in a later session.
local challenge = tostring(os.time()) .. tostring({})
if eligible then io.save(folder .. 'hello', challenge) end
local trace, pending = nil, {}
local lastSample, sampleAge = -1, 0
local clock, started, approved = 0, false, false
local function record(line)
  if trace then
    trace:write(line, '\\n')
    if line:find('M2L_ALL', 1, true) then trace:flush() end
  end
  local t = line:match('^M2L_ALL,([%d.]+),')
  if t then lastSample, sampleAge = tonumber(t), 0 end
  if line:find('M2L_END', 1, true) then
    if trace then trace:flush() end
    io.save(folder .. 'finished', line)
  end
end
ac.onSharedEvent('__KEY__', function(line)
  if not eligible then return end
  if approved then record(line)
  elseif #pending < 512 then pending[#pending+1] = line end
end, true)
function script.update(dt)
  if not eligible then return end
  sampleAge = sampleAge + dt
  clock = clock + dt
  if clock < 1 then return end
  clock = 0
  if not approved then
    if io.load(folder .. 'drive') ~= challenge then return end
    approved = true
    trace = io.open(folder .. 'telemetry.txt', 'a')
    for _, line in ipairs(pending) do record(line) end
    pending = {}
  end
  if io.fileExists(folder .. 'quit') then
    io.save(folder .. 'closed', string.format('%.2f,%.2f', lastSample, sampleAge))
    ac.shutdownAssettoCorsa()
    return
  end
  if not started and io.fileExists(folder .. 'armed') then
    local sim = ac.getSim()
    if sim.isInMainMenu and not sim.isOnlineRace and not sim.isReplayActive then
      started = ac.tryToStart(true)
      ac.log('M2L_AUTOSTART tryToStart=' .. tostring(started))
      if started then io.save(folder .. 'started', 'Drive') end
    end
  end
end
"""
MANIFEST = b'[ABOUT]\nNAME = M2L Auto Start\nAUTHOR = Map2Lap\nVERSION = 1\n[CORE]\nLAZY = NONE\n'


def read_json(path):
    """Read an archived manifest or receipt from path."""
    return json.loads(path.read_text(encoding='utf-8'))


def atomic_write(path, raw):
    """Replace a complete file at path, retaining a pre-existing file's permissions."""
    path = path.resolve()
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        tmp = Path(stream.name)
        try:
            stream.write(raw)
            stream.close()
            if path.exists():
                shutil.copymode(path, tmp)
            tmp.replace(path)
        finally:
            tmp.unlink(missing_ok=True)


def save(path, data):
    """Atomically publish a JSON receipt or analysis at path."""
    atomic_write(path, json.dumps(data, indent=2).encode())


@contextmanager
def locked():
    """Serialize start, stop and recovery; OS releases the lock after a launcher crash."""
    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / 'lock').open('a+b') as stream:
        stream.seek(0)
        if system.WIN:
            import msvcrt
            msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(stream, fcntl.LOCK_EX)
        yield


def processes():
    """Process identity and launch evidence (birth time prevents PID reuse)."""
    if system.WIN:
        # start_ac with weather_effects=False spawns acs.exe directly on Windows.
        cmd = ('Get-CimInstance Win32_Process | Where-Object {$_.Name -match '
               '"^(acs[.]exe|Map2Lap |python)"} | Select-Object ProcessId,Name,CommandLine,'
               'ParentProcessId,@{n="Birth";e={$_.CreationDate.Ticks.ToString()}} | ConvertTo-Json -Compress')
        data = subprocess.check_output(['powershell', '-NoProfile', '-Command', cmd], encoding='utf-8', errors='replace')
        items = json.loads(data) if data.strip() else []
        for p in items if isinstance(items, list) else [items]:
            yield p['ProcessId'], p['Name'], p['CommandLine'], p['Birth'], p['ParentProcessId']
    else:
        for pid, name, cmd in system._processes():
            if name.lower() != 'acs.exe':
                yield pid, name, cmd, None, None
                continue
            try:
                proc = Path('/proc') / str(pid)
                born = (proc / 'stat').read_text().rsplit(')', 1)[1].split()[19]
                env = (proc / 'environ').read_bytes().split(b'\0')
                token = next((s[9:].decode() for s in env if s.startswith(b'M2L_RACE=')), None)
            except FileNotFoundError:
                continue
            yield pid, name, cmd, born, token


def active():
    """Live AC identities; refuse changes during a build or worker."""
    games = []
    for pid, name, cmd, born, owner in processes():
        # On Linux the Editor and unrelated processes also use multiprocessing.spawn.
        # A live generator identifies a Python build; Windows workers have their own name.
        if role(name, cmd) == 'build' or name.lower().startswith('map2lap worker'):
            raise RuntimeError('Map2Lap build or worker running')
        if name.lower() == 'acs.exe':
            games.append((pid, born, owner))
    return games


# race.ini [MAP2LAP_AI] keys read by map2lap.dll's spacing feature, and their argparse names.
SPACING = (('SIDE', 'side'), ('PASS', 'pass_factor'), ('PER_CAR', 'per_car'), ('TARGET', 'target'), ('APEX', 'apex'))


def race_bytes(raw, args, ac, track):
    """Prepare a race with the Play grid writer and installed track's actual slot count."""
    import server
    installed = {p.name for p in (ac / 'content/cars').iterdir() if p.is_dir()}
    ai = server._race_ai(vars(args), str(track), installed)
    if not 1 <= args.laps < 2**31 or not args.opponents:
        raise ValueError('A measured race needs at least one lap and one opponent')
    if not mytracks.is_circuit(track) and (args.laps != 1 or not server._has_ab_timing(str(track / (track.name + '.kn5')))):
        raise ValueError('A timed route supports one lap; multiple laps require a circuit')
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.optionxform = str
    ini.read_string(raw.decode('utf-8-sig'))
    for s in list(ini):
        # Play leaves its AI spacing in race.ini: a measured race is stock unless its options request the DLL.
        if (s.upper().startswith(('CAR_', 'SESSION_')) and s.upper() != 'CAR_0') or s.upper() in ('MAP2LAP_AI', 'MAP2LAP_PROBE'):
            ini.remove_section(s)
    for s in ('REMOTE', 'BENCHMARK', '__PREVIEW_GENERATION', 'RESTART', 'REPLAY'):
        ini[s] = dict(ini[s], ACTIVE='0') if s in ini else {'ACTIVE': '0'}
    skins = server._car_skins(str(ac), args.car)
    if not skins:
        raise ValueError('Car has no installed skins')
    skin = skins[0]
    ini['RACE'].update(TRACK=track.name, MODEL=args.car, MODEL_CONFIG='', CONFIG_TRACK='', SKIN=skin, RACE_LAPS=str(args.laps))
    player = next((s for s in ini if s.upper() == 'CAR_0'), 'CAR_0')
    if player not in ini:
        ini[player] = {}
    ini[player].update(MODEL='-', MODEL_CONFIG='', SKIN=skin, SETUP='')
    ini['SESSION_0'] = dict(NAME='Race', TYPE='3', WAIT_TIME='0', SPAWN_SET='START', LAPS=str(args.laps), DURATION_MINUTES='0')
    server._write_race_grid(ini, player, ai, str(ac), installed)
    for slot, strength in enumerate(args.strengths or (), start=1):
        ini[f'CAR_{slot}']['AI_LEVEL'] = str(strength)
    if getattr(args, 'dll_probe', False):
        ini['MAP2LAP_PROBE'] = {'ACTIVE': '1'}  # read by map2lap.dll's probe feature
    spacing = {key: str(getattr(args, attr, None)) for key, attr in SPACING if getattr(args, attr, None) is not None}
    if spacing:
        ini['MAP2LAP_AI'] = spacing  # read by map2lap.dll's spacing feature
    out = io.StringIO()
    ini.write(out, space_around_delimiters=False)
    return out.getvalue().encode()


def current():
    """Read the receipt for the latest race."""
    return read_json(OUT / 'session.json')


def receipt(s):
    """Publish the run-specific receipt first, then the current one."""
    save(Path(s['run']) / 'session.json', s)
    save(OUT / 'session.json', s)


def model_stat(model):
    """Local model identity used to detect replacement between race and report."""
    stat = model.stat()
    return [stat.st_size, stat.st_mtime_ns]


def backup_files(folder, writes):
    """Back up file bytes and timestamps. AC uses the race.ini mtime to associate results."""
    times = {}
    for path in writes:
        if path.is_file():
            st = path.stat()
            times[str(path)] = [st.st_atime_ns, st.st_mtime_ns]
    manifest = prepare(folder, writes)
    entries = read_json(manifest)
    for entry in entries:
        entry['times'] = times.get(entry['path'])
    save(manifest, entries)
    return manifest


def recover(manifest):
    """Restore files and recover original timestamps for unconflicted destinations."""
    conflicts = restore_files(manifest)
    for entry in read_json(Path(manifest)):
        if entry.get('times') and entry['path'] not in conflicts:
            os.utime(entry['path'], ns=tuple(entry['times']))
    return conflicts


def output_paths(docs, track=None, car=None):
    """Native AC outputs replaced by an offline race, including saved setups and locale files."""
    paths = [docs / 'logs' / name for name in (*LOGS, 'py_log.txt', 'map2lap_probe.txt')]
    paths.extend(docs / 'out' / name for name in ('race_out.json', 'laps.ini', 'warnings.json'))
    paths.extend(docs / 'cfg' / name for name in ('video.ini', 'exposure.ini', 'acos.ini', 'telemetry_user.ini',
                 'extension/state/odometers.ini', 'extension/state/lua/app/CspDebug.ini'))
    paths.append(docs / 'aim/telemetry_dump.act')
    paths.extend(sorted(set((docs / 'dblocales').glob('*.ini')) | {docs / 'dblocales/en.ini'}))
    paths.append(docs / 'dblocales/templates/template.ini')
    if track and car:
        paths.append(docs / 'savedData/driverPerformances' / Path(track).name / (car + '.ini'))
        paths.extend(docs / 'setups' / car / 'generic' / name for name in ('last.ini', 'last.sp'))
    return paths


def backup_outputs(run, docs, track=None, car=None):
    """Save previous user logs and race result before AC overwrites them."""
    return backup_files(run / 'previous-output', {path: b'' for path in output_paths(docs, track, car)})


def output_copy(s, path, before=False):
    """Archive path of a native output, preserving relative paths of auxiliary files. Pure."""
    if path.name in (*LOGS, 'race_out.json'):
        return Path(s['run']) / (('live-' if before else '') + path.name)
    return Path(s['run']) / ('live-output' if before else 'game-output') / path.relative_to(s['docs'])


def restore_outputs(s):
    """Restore a native output only when it matches the archived session or the original."""
    if 'output_manifest' not in s:
        return []
    manifest = Path(s['output_manifest'])
    entries = read_json(manifest)
    for entry in entries:
        copy = output_copy(s, Path(entry['path']))
        entry['written'] = sha(copy.read_bytes()) if copy.exists() else entry['before']
    save(manifest, entries)
    return recover(manifest)


def archive(s, before=False):
    """Snapshot native outputs before requesting exit, and again after flushing."""
    for src in output_paths(Path(s['docs']), s.get('track'), s.get('options', {}).get('car')):
        if src.is_file() and src.stat().st_mtime_ns >= s['launched_ns']:
            try:
                dest = output_copy(s, src, before)
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dest)
            except PermissionError:
                # AC can hold a Windows log open without file sharing. Retry after exit.
                if not before:
                    raise


def finish(s, stop, *, monitored=False):
    """Exit only the process carrying this launch identity, then recover the manifest."""
    if s['state'] == 'restored':
        return
    run = Path(s['run'])
    (run / 'armed').unlink(missing_ok=True)
    games = active()
    if games:
        if not stop or len(games) != 1 or not owns(s, games[0]):
            raise RuntimeError('AC is running; restore after it closes')
        archive(s, before=True)
        (run / 'quit').touch()
        for _ in range(25):
            time.sleep(1)
            if not active():
                break
        else:
            # The app may never have loaded. Revalidate ownership on the kernel handle.
            terminate(s, games[0])
            for _ in range(15):
                time.sleep(1)
                if not active():
                    break
            else:
                raise RuntimeError('Owned AC did not exit; receipt retained')
    if active():
        raise RuntimeError('AC or a build started during recovery')
    if s['state'] not in ('conflicts', 'archived') and s.get('launched_ns'):
        log = Path(s['docs']) / 'logs' / LOGS[0]
        # After a launcher crash, a later game might have overwritten the logs.
        # The unique track-script filename identifies a deferred recovery's capture.
        if games or monitored or (log.is_file() and s['token'].encode() in log.read_bytes()):
            archive(s)
        s['state'] = 'archived'
        receipt(s)
    conflicts = recover(s['manifest'])
    conflicts.extend(restore_outputs(s))
    app = Path(s['app'])
    if app.exists() and not any(app.iterdir()):
        app.rmdir()
    for folder in map(Path, s.get('new_dirs', [])):
        if folder.is_dir() and not any(folder.iterdir()):
            folder.rmdir()
    s.update(state='conflicts' if conflicts else 'restored', conflicts=conflicts)
    receipt(s)
    if conflicts:
        raise RuntimeError('Independently changed files retained: ' + ', '.join(conflicts))


def owns(s, game):
    """Match a process to this launcher and recorded process lifetime. Pure."""
    pid, birth, owner = game
    return (owner == (s['parent'] if system.WIN else s['token']) and
            ('pid' not in s or (pid, birth) == (s['pid'], s['birth'])))


def terminate(s, game):
    """Pin the kernel process before checking ownership and terminating a hung load."""
    pid = game[0]
    if system.WIN:
        # GetProcessById + Handle keeps the original process pinned throughout the birth check.
        ticks = int(game[1])
        # CIM dates are in microseconds; GetProcessTimes can retain 100 ns ticks.
        cmd = (f'$p=Get-Process -Id {int(pid)} -ErrorAction Stop; $null=$p.Handle; '
               f'if ([Math]::Abs($p.StartTime.Ticks - {ticks}) -lt 10) {{$p.Kill()}}')
        subprocess.run(['powershell', '-NoProfile', '-Command', cmd], check=True)
    else:
        handle = os.pidfd_open(pid)
        try:
            if any(g == game and owns(s, g) for g in active()):
                signal.pidfd_send_signal(handle, signal.SIGTERM)
        finally:
            os.close(handle)


def roof_observed(trace, opponent):
    """Check mirrored telemetry for the selected car's physical rollover confirmation. Pure."""
    # Up.y below -0.5 puts the roof within 60 degrees of facing the ground.
    # CSP's wheel-load samples can still be positive on a car resting on its roof.
    pattern = rb'^M2L_ROLL,state,[0-9.]+,' + str(opponent).encode() + rb',(-?\d+\.\d+),[0-4],0,0,'
    return any(float(up) < -0.5 for up in re.findall(pattern, trace, re.MULTILINE))



def probe_bytes(token, opponents, rollover_ai=None, caution=None):
    """Build the temporary telemetry script and, on request, roll one AI opponent or set AI caution."""
    script, update = '', ''
    values = caution or []
    if len(values) == 1:
        values = values * opponents
    if values and len(values) != opponents:
        raise ValueError('--caution takes one value or one per opponent')
    if rollover_ai is not None:
        if not 1 <= rollover_ai <= opponents:
            raise ValueError('--rollover-ai must select an opponent in this grid (1 through --opponents)')
        script = Path(__file__).with_name('ai_rollover.lua').read_text(encoding='utf-8')
        script = script.replace('__TARGET__', str(rollover_ai))
        update = 'rollOpponent(dt, sim, elapsed)'
    return (PROBE.replace('__KEY__', token).replace('__COUNT__', str(opponents))
            .replace('__CAUTION__', ', '.join(repr(float(v)) for v in values))
            .replace('__ROLLOVER_FUNCTION__', script).replace('__ROLLOVER_UPDATE__', update).encode())


def begin(args):
    """Prepare all backups and the durable receipt before installing temporary instrumentation."""
    if active():
        raise RuntimeError('AC is already running')
    if (OUT / 'session.json').exists() and current()['state'] != 'restored':
        raise RuntimeError('Previous race needs stop/restore')
    ac = Path(settings.ac_path())
    track = ac / 'content/tracks' / args.track
    if not re.fullmatch(r'[\w-]+', args.track) or not (track / 'ai/fast_lane.ai').is_file():
        raise ValueError('Choose an installed track with an existing fast_lane.ai')
    identity = model_stat(track / (track.name + '.kn5'))
    if not csp.inspect(str(ac))['enabled'] or (not system.WIN and not system.proton(str(ac))):
        raise RuntimeError('Enabled CSP and a direct AC launch are required')
    app = ac / 'apps/lua/M2LAutoStart'
    if app.exists():
        raise RuntimeError('M2LAutoStart already exists; its owner must remove it first')
    dll = getattr(args, 'dll_probe', False) or any(getattr(args, attr, None) is not None for _, attr in SPACING)
    if dll and not acplugin.install(str(ac)):
        raise RuntimeError('Could not install map2lap.dll while AC is running')
    docs = Path(system.documents(str(ac))) / 'Assetto Corsa'
    cfg = track / 'extension/ext_config.ini'
    race = docs / 'cfg/race.ini'
    token = uuid.uuid4().hex
    run = OUT / (time.strftime('%Y%m%d-%H%M%S-') + token[:8])
    folder = ('' if system.WIN else 'Z:') + run.as_posix() + '/'
    code = APP.replace('__FOLDER__', json.dumps(folder, ensure_ascii=False)).replace('__TRACK__', json.dumps(args.track))
    probe = 'm2l_probe_' + token + '.lua'
    writes = {race: race_bytes(race.read_bytes(), args, ac, track),
              cfg: cfg.read_bytes() + f'\n[SCRIPT_...]\nSCRIPT = {probe}\n'.encode(),
              cfg.parent / probe: probe_bytes(token, args.opponents, getattr(args, 'rollover_ai', None),
                                              getattr(args, 'caution', None)),
              app / 'manifest.ini': MANIFEST, app / 'M2LAutoStart.lua': code.replace('__KEY__', token).encode()}
    replay = race.with_name('replay.ini')
    replay_source = replay if replay.is_file() else ac / 'cfg/replay.ini'
    # AC rotates the user's race replays on exit. Keep all existing slots and skip saving this short measurement.
    writes[replay] = ini_bytes(replay_source.read_bytes() if replay_source.is_file() else b'',
                               {'AUTOSAVE': {'ENABLED': 1, 'RACE': -1, 'MIN_TIME_SECONDS': args.timeout + 120}})
    if not system.ensure_steam() or active():
        raise RuntimeError('Steam must be signed in and AC/build idle')
    run.mkdir(parents=True)
    (run / 'race.ini').write_bytes(writes[race])
    dirs = [docs / 'setups' / args.car / args.track, docs / 'savedData/driverPerformances' / args.track]
    s = dict(run=str(run), state='prepared', track=str(track), docs=str(docs), app=str(app),
             model_stat=identity, lane_sha256=sha((track / 'ai/fast_lane.ai').read_bytes()),
             parent=os.getpid(), token=token, options=vars(args), manifest=str(backup_files(run / 'backup', writes)),
             output_manifest=str(backup_outputs(run, docs, track, args.car)),
             new_dirs=[str(folder) for folder in dirs if not folder.exists()])
    receipt(s)
    try:
        app.mkdir()
        for path, raw in writes.items():
            atomic_write(path, raw)
        (run / 'armed').touch()
        if active():
            raise RuntimeError('AC started during preparation')
        s['launched_ns'] = time.time_ns()
        receipt(s)
        os.environ['M2L_RACE'] = token
        try:
            system.start_ac(str(ac), weather_effects=False)
        finally:
            os.environ.pop('M2L_RACE', None)
        for _ in range(60):
            owned = [g for g in active() if owns(s, g)]
            if len(owned) == 1:
                s.update(state='running', pid=owned[0][0], birth=owned[0][1])
                receipt(s)
                return s
            time.sleep(1)
        raise RuntimeError('Owned acs.exe did not appear')
    except BaseException:
        finish(s, True)
        raise


def start(args):
    """Supervise the owned PID through race end or timeout and restore files on exit."""
    with locked():
        s = begin(args)
    run = Path(s['run'])
    print(f'Monitoring {run} (PID {s["pid"]})', flush=True)
    deadline = time.monotonic() + args.timeout
    try:
        while time.monotonic() < deadline:
            if not any(owns(s, g) for g in active()):
                break
            hello = run / 'hello'
            if hello.exists() and not (run / 'drive').exists():
                challenge = hello.read_bytes()
                if challenge:
                    (run / 'drive').write_bytes(challenge)
            if (run / 'started').exists():
                (run / 'armed').unlink(missing_ok=True)
            if (run / 'finished').exists():
                break
            time.sleep(2)
    finally:
        with locked():
            latest = current()
            if latest['token'] == s['token']:
                finish(latest, True, monitored=True)
    result = report(run)
    if getattr(args, 'rollover_ai', None) is not None and not result.get('rollover_observed'):
        raise RuntimeError('Selected AI was not observed on its roof: ' + str(run))
    if result['coverage'] not in ('end observed', 'all opponents observed retired'):
        raise RuntimeError('Race ended without verified terminal telemetry: ' + str(run))


def incident_sites(result):
    """All car positions where the report measures the nearest wall vertex. Pure."""
    return (result['stops'] + result['speed_drops'] + [r['approach_peak'] for r in result['stops'] if 'approach_peak' in r]
            + [r['last_active'] for r in result['retirements'] if r['last_active']])


def shutdown_gap(receipt, last_sample):
    """Simulated seconds from the archived sample to the app's acknowledged quit. Pure."""
    if last_sample is None or not re.fullmatch(rb'\d+(?:\.\d+)?,\d+(?:\.\d+)?', receipt):
        return None
    last, age = map(float, receipt.split(b','))
    return round(max(0., last + age - last_sample), 2)


def report(run, csp_path=None, ac_path=None, model=None, opponents=None):
    """Write measured results for a finished session or explicitly supplied historical logs."""
    s = read_json(run / 'session.json') if (run / 'session.json').exists() else {}
    def data(path):
        return path.read_bytes() if path.is_file() else b''
    raw = data(csp_path or run / LOGS[0])
    engine = data(ac_path or run / LOGS[1])
    opponents = opponents or s.get('options', {}).get('opponents')
    result = analyse(raw, engine, opponents)
    trace = data(run / 'telemetry.txt')
    opponent = s.get('options', {}).get('rollover_ai')
    if trace and not csp_path:
        mirrored = analyse(trace, engine, opponents)
        if mirrored['samples'] and (mirrored['samples'] >= result['samples']
                                    or mirrored['end_reason'] and not result['end_reason']):
            mirrored['csp_truncated'] = result['csp_truncated']
            result = mirrored
            raw = trace
            result['telemetry_source'] = 'telemetry.txt'
    if opponent is not None:
        result['rollover_observed'] = roof_observed(trace, opponent)
    result['telemetry_sha256'] = sha(raw)
    result['seconds_missing_at_quit'] = shutdown_gap(data(run / 'closed'), result['last_sample_s'])
    if result['coverage'] == 'end unverified' and (result['seconds_missing_at_quit'] or 0) > 1:
        result['coverage'] = 'incomplete'
    if s and model is None:
        track = Path(s['track'])
        model = track / (track.name + '.kn5')
        if model.is_file() and 'model_stat' in s and s['model_stat'] != model_stat(model):
            model = None
    sites = incident_sites(result)
    if model and model.is_file():
        wall_distances(model, sites)
    elif (run / 'report.json').exists():
        prior = read_json(run / 'report.json')
        if prior.get('telemetry_sha256') == result['telemetry_sha256']:
            saved = {(r['x'], r['z']): r['wall_vertex_xz'] for r in incident_sites(prior) if 'wall_vertex_xz' in r}
            for r in sites:
                if (r['x'], r['z']) in saved:
                    r['wall_vertex_xz'] = saved[r['x'], r['z']]
    save(run / 'report.json', result)
    print(f"{result['samples']} samples through {result['last_sample_s']} s; {result['coverage']}. {run / 'report.json'}")
    return result


def cautions(value):
    """Read comma-separated CSP AI caution values (0–16). Pure."""
    try:
        values = [float(part) for part in value.split(',')]
    except ValueError:
        raise argparse.ArgumentTypeError('expected comma-separated numbers') from None
    if any(not 0 <= v <= 16 for v in values):
        raise argparse.ArgumentTypeError('each AI caution must be 0–16')
    return values


def grid_strengths(value):
    """Read comma-separated integer AI levels in grid order. Pure."""
    try:
        levels = [int(part) for part in value.split(',')]
    except ValueError:
        raise argparse.ArgumentTypeError('expected comma-separated integers') from None
    if any(not 70 <= level <= 100 for level in levels):
        raise argparse.ArgumentTypeError('each AI strength must be 70–100%')
    return levels


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    launch = sub.add_parser('start', help='Monitor until all AI retire/finish or timeout; stop works from another terminal')
    launch.add_argument('track')
    launch.add_argument('--opponents', type=int, default=18)
    launch.add_argument('--laps', type=int, default=3)
    launch.add_argument('--car', default='bmw_m3_e30_dtm')
    levels = launch.add_mutually_exclusive_group()
    levels.add_argument('--strength', type=int, default=95, help='common opponent strength (default: 95)')
    levels.add_argument('--strengths', type=grid_strengths, metavar='N,N,...',
                        help='one strength (70–100) per opponent, in CAR_1, CAR_2, … order')
    launch.add_argument('--rollover-ai', type=int, metavar='CAR', help='roll this AI opponent once after green')
    launch.add_argument('--aggression', type=int, default=50)
    launch.add_argument('--caution', type=cautions, metavar='X,X,...',
                        help='CSP AI caution: one value for all opponents or one per opponent')
    launch.add_argument('--side', type=float, metavar='F',
                        help='AI gap alongside a car in carHalfWidth units (stock 3.0, 1.8–5)')
    launch.add_argument('--pass', dest='pass_factor', type=float, metavar='F',
                        help='base of all AI passing distances in carHalfWidth units (stock 2.5, 2–5)')
    launch.add_argument('--per-car', type=float, metavar='F',
                        help='extra passing room per car ahead (stock 0.2, 0–1)')
    launch.add_argument('--target', type=float, metavar='F',
                        help='passing target and in-the-way overlap in PASS units (stock 1.5, 1–3)')
    launch.add_argument('--apex', type=float, metavar='M',
                        help='at equal speed, pass only if the next apex is farther (stock 200 m, 0–1000)')
    launch.add_argument('--dll-probe', action='store_true',
                        help='install map2lap.dll and log AI hook bytes and per-car AIDriver values')
    launch.add_argument('--timeout', type=int, default=1200, help='wall seconds including loading')
    for action in ('status', 'restore', 'stop'):
        sub.add_parser(action)
    read = sub.add_parser('report')
    read.add_argument('session', nargs='?', type=Path, help='session directory; defaults to latest')
    read.add_argument('--csp', type=Path, help='historical CSP log (binary or strings output)')
    read.add_argument('--ac-log', type=Path)
    read.add_argument('--model', type=Path)
    read.add_argument('--opponents', type=int)
    args = parser.parse_args()
    if args.action == 'start':
        if args.strengths is not None and len(args.strengths) != args.opponents:
            parser.error('--strengths requires one value per opponent')
        if args.timeout <= 0:
            parser.error('--timeout must be positive')
        start(args)
    elif args.action == 'report':
        if bool(args.csp) != bool(args.ac_log):
            parser.error('supply both historical logs')
        if args.csp and not (args.csp.is_file() and args.ac_log.is_file()):
            parser.error('historical logs must exist')
        run = args.session or Path(current()['run'])
        run.mkdir(parents=True, exist_ok=True)
        report(run, args.csp, args.ac_log, args.model, args.opponents)
    elif args.action == 'status':
        if not (OUT / 'session.json').exists():
            print('No recorded race')
        else:
            s = current()
            print(json.dumps(dict(s, owned_running=any(owns(s, g) for g in active())), indent=2))
    else:
        with locked():
            finish(current(), args.action == 'stop')


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, ValueError) as error:
        sys.exit(str(error))
