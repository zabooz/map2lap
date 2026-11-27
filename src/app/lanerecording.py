"""Session-owned AC candidates, immutable draft lines and the automatic line retained for Undo."""
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
import gzip
import json
import math
import re
import shutil
import tempfile
import zlib

import numpy as np

from app import mytracks
from track import aihints, ailinestate, aimargins, drivenline, editorinfo, fastlane, obj_to_kn5

BASE = Path("data/map2lap_original_line")
BUNDLE = ailinestate.RECORDINGS
CANDIDATE = Path("ai/fast_lane.ai.candidate")
# About one carriageway. More distant racing lines require review, especially on parallel roads.
MATCH_REACH = 6.


def valid(key):
    """Whether key names a content-addressed recording. Pure."""
    return isinstance(key, str) and re.fullmatch("[a-f0-9]{64}", key) is not None


def path(model, key):
    """Find the immutable recording by key, locally or in a portable saved track."""
    if not valid(key):
        raise ValueError("Invalid recording ID")
    local = Path(mytracks.ROOT, "out", "ai-recordings", key + ".ai")
    return local if local.is_file() else model.parent / BUNDLE / (key + ".ai")


def original(folder):
    """Find the pre-recording line for a draft that selects the automatic line."""
    return folder / BASE if (folder / BASE).is_dir() else folder


def stamp(file):
    """Identify an on-disk revision, including replacement at the same timestamp."""
    try:
        s = file.stat()
        return s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns
    except FileNotFoundError:
        return None


def _sample_floors(model, xyz):
    """Read the installed collision geometry at the recording's positions."""
    meshes = fastlane._roads(model, fastlane.kn5.scan(model)["meshes"], free=True)
    return drivenline.floor_columns(xyz, fastlane._local_roads(meshes, free=True))


def _write_floors(destination, key, columns):
    """Publish a complete, lane-bound height reference beside its immutable recording."""
    data = json.dumps([key, columns], separators=(",", ":"), allow_nan=False).encode()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as stream:
        temp = Path(stream.name)
    try:
        temp.write_bytes(gzip.compress(data, compresslevel=1, mtime=0))
        temp.replace(destination)
    finally:
        temp.unlink(missing_ok=True)


def _local_floors(model, key):
    """Track-local capture geometry for a raw spline shared by content hash. Pure."""
    return Path(mytracks.ROOT, "out", "ai-recordings", model.parent.name, key + ".floors.gz")


def _floors_file(model, raw):
    """Locate the capture's portable reference or measure an unedited legacy source."""
    local = _local_floors(model, raw.stem)
    packed = model.parent / BUNDLE / local.name
    for file in (packed, local):
        if file.is_file():
            return file
    info = mytracks.load(model.parent)
    edits = (info or {}).get("edits") or {}
    if info is None or any(edits.get(k) for k in ("heights", "stitches", "surfaces", "kerbs")):
        raise fastlane.NoLine("The recording has no height reference for this edited road. Record this line again.")
    if ailinestate.checksum(raw) != raw.stem:
        raise ValueError("The selected AI recording changed.")
    xyz = fastlane.read_lane(raw)[0]["pos"].astype(float)
    columns = _sample_floors(model, xyz)
    if any(drivenline._floor_shift(col, col, p[1]) is None for col, p in zip(columns, xyz)):
        raise fastlane.NoLine("The old recording cannot be matched to the installed road. Record this line again.")
    _write_floors(local, raw.stem, columns)
    return local


def _read_floors(floors, key, count):
    """Read a recording's complete, finite geometry reference or reject the export."""
    try:
        with gzip.open(floors, "rt", encoding="utf-8") as stream:
            stored, columns = json.load(stream)
        if (stored != key or not isinstance(columns, list) or len(columns) != count or
                not all(isinstance(col, dict) and all(isinstance(levels, list) and levels and
                        all(isinstance(h, (int, float)) and math.isfinite(h) for h in levels)
                        for levels in col.values()) for col in columns)):
            raise ValueError()
    except (OSError, EOFError, ValueError, TypeError, OverflowError, zlib.error) as error:
        raise ValueError("The height reference of the selected AI recording is damaged. Record this line again.") from error
    return columns


def bundle_floors(source, target, key):
    """Include the original road levels with a recorded line when publishing its track."""
    floors = _floors_file(source, path(source, key))
    packed = target.parent / BUNDLE / floors.name
    if floors != packed:
        packed.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=packed.parent) as folder:
            copy = Path(folder, packed.name)
            shutil.copyfile(floors, copy)
            copy.replace(packed)


class Capture:
    def __init__(self, model, layout):
        if layout and not re.fullmatch(r"[\w-]+", layout):
            raise ValueError("Invalid track layout")
        self.layout = layout
        self.model = model
        self.identity = stamp(model)
        self.file = model.parent / layout / CANDIDATE
        self.before = stamp(self.file)
        self.digest = ailinestate.checksum(self.file) if self.before else None

    def finish(self, *, trace=None):
        """Freeze a complete, changed candidate from the requested layout after AC exits."""
        if stamp(self.model) != self.identity:
            raise ValueError("The installed track changed during practice.")
        if trace is not None:
            if not trace.is_file():
                return None
            drivenline.stage_candidate(self.model, trace, self.file)
        after = stamp(self.file)
        if after is None or after == self.before:
            return None
        folder = Path(mytracks.ROOT, "out", "ai-recordings")
        folder.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=folder, delete=False) as stream:
            tmp = Path(stream.name)
        try:
            shutil.copyfile(self.file, tmp)
            key = ailinestate.checksum(tmp)
            if (trace is None and key == self.digest) or stamp(self.file) != after:
                return None
            points, detail, _ = fastlane.read_lane(tmp)
            if not all(np.isfinite(row[k]).all() for row in (points, detail) for k in row.dtype.names):
                raise ValueError("The recording contains invalid numbers.")
            xyz = points["pos"].astype(float)
            steps = np.linalg.norm(np.diff(xyz, axis=0), axis=1)
            # A closed lap ends within a few sample intervals of its start. A stopped
            # recorder halfway around a circuit can still contain valid v7 records.
            if len(xyz) < 3 or not steps.any():
                raise ValueError("The recording has too few distinct samples.")
            if trace is None and np.linalg.norm(xyz[0]-xyz[-1]) > 4*np.median(steps[steps > 0]):
                raise ValueError("The recording does not contain a closed lap.")
            columns = _sample_floors(self.model, xyz)
            if stamp(self.model) != self.identity:
                raise ValueError("The installed track changed during practice.")
            _write_floors(_local_floors(self.model, key), key, columns)
            tmp.replace(folder / (key + ".ai"))
            return key
        finally:
            tmp.unlink(missing_ok=True)


def _nearby_legs(reference, reach, circuit):
    """Index the reference lane segments within reach of each horizontal grid cell. Pure."""
    ends = np.roll(reference, -1, axis=0)
    if not circuit:
        reference, ends = reference[:-1], ends[:-1]
    step = ends - reference
    cells = defaultdict(list)
    for i, (a, b) in enumerate(zip(reference, ends)):
        low = np.floor((np.minimum(a, b)[[0, 2]] - reach)/reach).astype(int)
        high = np.floor((np.maximum(a, b)[[0, 2]] + reach)/reach).astype(int)
        for x in range(low[0], high[0]+1):
            for z in range(low[1], high[1]+1):
                cells[x, z].append(i)
    return cells, step


def _projections(xyz, reference, metres, length, circuit):
    """Project each driven sample onto a unique nearby passage at its driving level. Pure."""
    reach = MATCH_REACH
    cells, step = _nearby_legs(reference, reach, circuit)
    squared = np.sum(step*step, axis=1)
    mapped = []
    spans = (np.roll(metres, -1) - metres) % length if circuit else np.diff(metres)
    for p in xyz:
        legs = np.array(cells.get(tuple(np.floor(p[[0, 2]] / reach).astype(int)), []), dtype=int)
        legs = legs[squared[legs] > 0]
        t = np.clip(np.sum((p-reference[legs])*step[legs], axis=1)/squared[legs], 0, 1)
        delta = p - (reference[legs] + step[legs]*t[:, None])
        gap = np.linalg.norm(delta, axis=1)
        near = (gap <= reach) & (abs(delta[:, 1]) < obj_to_kn5.LEVEL_GAP_M)
        if not near.any():
            mapped.append(np.nan)
            continue
        stations = metres[legs[near]] + t[near]*spans[legs[near]]
        if circuit:
            stations %= length
        at = stations[np.argmin(gap[near])]
        # Adjacent legs may describe the same passage. Parallel or crossing legs
        # farther apart along the route cannot establish which section was driven.
        offset = stations - at
        if circuit:
            offset = (offset+length/2) % length-length/2
        ambiguous = (abs(offset) > reach*2).any()
        mapped.append(np.nan if ambiguous else at)
    return np.asarray(mapped)


def alignment(xyz, reference, metres, length, circuit=True):
    """Map a forward drive to route metres and identify stretches unsuitable for hints. Pure."""
    mapped = _projections(xyz, reference, metres, length, circuit)
    anchors = np.flatnonzero(np.isfinite(mapped))
    if len(anchors) < 3:
        return None, []
    stations = mapped[anchors]
    if not circuit:
        if stations[-1] <= stations[0]:
            return None, []
        ordered = np.maximum.accumulate(stations)
        estimate = np.interp(np.arange(len(xyz)), anchors, ordered)
        supported = np.isclose(mapped, estimate, atol=.001)
        gaps = _gaps(xyz, estimate, supported, length, False)
        # On a backtrack the same route metres describe multiple driven passages.
        # Exclude the whole repeated interval, including its first forward traversal.
        gaps.extend(zip(stations[stations < ordered], ordered[stations < ordered]))
        if estimate[0] > metres[0]:
            gaps.append((metres[0], estimate[0]))
        if estimate[-1] < metres[-1]:
            gaps.append((estimate[-1], metres[-1]))
        return estimate, _merged(gaps)
    advance = (np.roll(stations, -1)-stations+length/2) % length-length/2
    if not np.isclose(advance.sum(), length):
        return None, []
    # Move the seam to a known sample, then interpolate only to describe gaps.
    # Every interpolated or backwards leg is excluded from hint export.
    offsets = anchors-anchors[0]
    walked = np.r_[0., np.cumsum(advance)]
    ordered = np.maximum.accumulate(walked)
    if ordered[-1] > length + .001:
        return None, []
    estimate = np.interp(np.arange(len(mapped)), np.r_[offsets, len(mapped)], ordered)
    estimate = (np.roll(estimate, anchors[0])+stations[0]) % length
    supported = np.isfinite(mapped) & np.isclose(mapped, estimate, atol=.001)
    return estimate, _merged(_gaps(xyz, estimate, supported, length))


def _gaps(xyz, estimate, supported, length, circuit=True):
    """Unsupported intervals between consecutive samples, split at a circuit seam. Pure."""
    gaps = []
    for i, dist in enumerate(np.linalg.norm(np.roll(xyz, -1, axis=0)-xyz, axis=1)):
        if not circuit and i == len(xyz)-1:
            break
        j = (i+1) % len(xyz)
        # A jump across a hairpin can have valid endpoints. If it covers more
        # than twice the driven chord plus one lane width, the stretch is uncertain.
        advance = estimate[j]-estimate[i]
        if not (supported[i] and supported[j]) or (advance % length if circuit else advance) > 2*dist+MATCH_REACH:
            gaps.extend(aimargins.intervals(estimate[i], estimate[j], length) if circuit else [(estimate[i], estimate[j])])
    return gaps


def _merged(gaps):
    """Sorted union of uncertain route intervals. Pure."""
    merged = []
    for start, end in sorted(gaps):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([float(start), float(end)])
    return merged


def route_alignment(folder, lane):
    """Map this recording to the checksum-bound original, caching only exact file revisions."""
    source = original(folder)
    old = source / fastlane.FILE
    return _alignment(folder, lane, old, mytracks.is_circuit(folder), (stamp(lane), stamp(old), stamp(source / ailinestate.FILE),
                                          stamp(folder / fastlane.ROUTE)))


@lru_cache(maxsize=3)
def _alignment(folder, lane, old, circuit, revisions):
    metres = ailinestate.lane_metres(original(folder), old)
    route = ailinestate._route(folder, circuit)
    if metres is None or route is None:
        return None, []
    return alignment(fastlane.read_lane(lane)[0]["pos"].astype(float),
                     fastlane.read_lane(old)[0]["pos"].astype(float), metres, route.length, circuit)


def prepared_path(key):
    """Locate a disposable calculated spline for the Editor's immutable binary transfer."""
    if not valid(key):
        raise ValueError("Invalid prepared line ID")
    return Path(mytracks.ROOT, "out", "ai-prepared", key + ".ai")


def _reference_key(model, source, key):
    raw = path(source, key)
    floors = _floors_file(source, raw)
    files = [raw, floors, model, model.parent / mytracks.FILE, model.parent / fastlane.ROUTE, *map(Path, editorinfo.archives(model))]
    return model, raw, floors, tuple(stamp(file) for file in files)


def editing(model, key, source=None):
    """Share one measured recording between the draft, guide and correction preview."""
    return _editing(*_reference_key(model, source or model, key))


@lru_cache(maxsize=2)
def _editing(model, raw, floors, revisions):
    if ailinestate.checksum(raw) != raw.stem:
        raise ValueError("The selected AI recording changed.")
    points, detail, _ = fastlane.read_lane(raw)
    circuit = mytracks.is_circuit(model.parent)
    inputs = fastlane.lane_inputs(model, circuit, lambda _: None, preview=True)
    captured = _read_floors(floors, raw.stem, len(points))
    base, measured = drivenline.reference(inputs, points, detail, circuit, floors=captured)
    return inputs, base, measured


def prepare(model, key, corrections, source=None):
    """Calculate the recorded source with the draft's corrections without installing it."""
    if error := fastlane.aicorrections.problem(corrections):
        raise ValueError(error)
    return _prepare(*_reference_key(model, source or model, key), json.dumps(corrections, sort_keys=True))


@lru_cache(maxsize=12)
def _prepare(model, raw, floors, revisions, edits):
    inputs, base, _ = _editing(model, raw, floors, revisions)
    pts, detail, skipped, stations = drivenline.corrected(model, inputs, base, json.loads(edits))
    directory = prepared_path(raw.stem).parent
    directory.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=directory) as tmp:
        output = Path(tmp, "fast_lane.ai")
        fastlane._write_lane(output, pts, detail)
        digest = ailinestate.checksum(output)
        cached = prepared_path(digest)
        if not cached.exists():
            output.replace(cached)
    return {"file": digest, "skipped": skipped, "stations": stations}


def publication(target, key, source):
    """Measure the saved recipe against target geometry and bind both metre arrays to its export."""
    ready = prepare(target, key, fastlane.aicorrections.recipe(target.parent), source=source)
    file = prepared_path(ready["file"])
    metres, gaps = route_alignment(source.parent, file)
    fields = dict(lane=ready["file"], recorded=True, gaps=gaps, skipped=ready["skipped"],
                  drivenMetres=ready["stations"].tolist(), metres=None if metres is None else metres.tolist())
    return file, fields


def stage(model, target, key):
    """Stage a recorded line or restore the pre-recording source in an Editor Save."""
    folder, dest = model.parent, target.parent
    base = original(folder)
    circuit = mytracks.is_circuit(folder)
    if key is None:
        if base == folder:
            raise ValueError("The original AI line backup is missing.")
        restored = ailinestate.carry(base, target, circuit)
        installed = dest / fastlane.FILE
        # Undo explicitly selects a hand-installed spline. A tracked automatic preview
        # stays pending when its fingerprint differs from the edited road.
        if not installed.is_file():
            restored["status"] = "missing"
        elif restored.get("inputs") and (restored["status"] == "manual" or not (base / ailinestate.FILE).is_file()):
            ailinestate.record_ready(dest, restored["inputs"], circuit=circuit)
            restored["status"] = "ready"
        shutil.rmtree(dest / BASE)
        return restored
    lane = path(model, key)
    if not lane.is_file() or ailinestate.checksum(lane) != key:
        raise ValueError("The selected AI recording is missing or changed.")
    if base == folder:
        # Capture the original ready record with its matching recipe so Undo
        # can also restore the original route correspondence and race eligibility.
        for relative in (fastlane.FILE, ailinestate.FILE, Path(mytracks.FILE), fastlane.ROUTE, aihints.FILE):
            if (folder / relative).is_file():
                copy = dest / BASE / relative
                copy.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(folder / relative, copy)
    packed = dest / BUNDLE / (key + ".ai")
    packed.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(lane, packed)
    installed = dest / fastlane.FILE
    installed.parent.mkdir(exist_ok=True)
    file, fields = publication(target, key, model)
    bundle_floors(model, target, key)
    shutil.copyfile(file, installed)
    ailinestate._write(dest, key, "ready", **fields)
    old = folder / aihints.FILE
    aihints.replace(dest, old.read_bytes() if old.is_file() else None)
    ailinestate.sync_hints(dest, circuit)
    return {"status": "ready", "inputs": key}
