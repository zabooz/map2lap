"""Session-owned AC candidates, immutable draft lines and the automatic line retained for Undo."""
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
import json
import re
import shutil
import tempfile

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

    def finish(self):
        """Freeze a complete, changed candidate from the requested layout after AC exits."""
        if stamp(self.model) != self.identity:
            raise ValueError("The installed track changed during practice.")
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
            if key == self.digest or stamp(self.file) != after:
                return None
            points, detail, _ = fastlane.read_lane(tmp)
            if not all(np.isfinite(row[k]).all() for row in (points, detail) for k in row.dtype.names):
                raise ValueError("The recording contains invalid numbers.")
            xyz = points["pos"].astype(float)
            steps = np.linalg.norm(np.diff(xyz, axis=0), axis=1)
            # A closed lap ends within a few sample intervals of its start. A stopped
            # recorder halfway around a circuit can still contain valid v7 records.
            if len(xyz) < 3 or not steps.any() or np.linalg.norm(xyz[0]-xyz[-1]) > 4*np.median(steps[steps > 0]):
                raise ValueError("The recording does not contain a closed lap.")
            tmp.replace(folder / (key + ".ai"))
            return key
        finally:
            tmp.unlink(missing_ok=True)


def _nearby_legs(reference, reach):
    """Index the reference lane segments within reach of each horizontal grid cell. Pure."""
    ends = np.roll(reference, -1, axis=0)
    step = ends - reference
    cells = defaultdict(list)
    for i, (a, b) in enumerate(zip(reference, ends)):
        low = np.floor((np.minimum(a, b)[[0, 2]] - reach)/reach).astype(int)
        high = np.floor((np.maximum(a, b)[[0, 2]] + reach)/reach).astype(int)
        for x in range(low[0], high[0]+1):
            for z in range(low[1], high[1]+1):
                cells[x, z].append(i)
    return cells, step


def _projections(xyz, reference, metres, length):
    """Project each driven sample onto a unique nearby passage at its driving level. Pure."""
    reach = MATCH_REACH
    cells, step = _nearby_legs(reference, reach)
    squared = np.sum(step*step, axis=1)
    mapped = []
    spans = (np.roll(metres, -1) - metres) % length
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
        stations = (metres[legs[near]] + t[near]*spans[legs[near]]) % length
        at = stations[np.argmin(gap[near])]
        # Adjacent legs may describe the same passage. Parallel or crossing legs
        # farther apart along the route cannot establish which section was driven.
        ambiguous = (abs((stations-at+length/2) % length-length/2) > reach*2).any()
        mapped.append(np.nan if ambiguous else at)
    return np.asarray(mapped)


def alignment(xyz, reference, metres, length):
    """Map one forward lap to route metres and identify stretches unsuitable for hints. Pure."""
    mapped = _projections(xyz, reference, metres, length)
    anchors = np.flatnonzero(np.isfinite(mapped))
    if len(anchors) < 3:
        return None, []
    stations = mapped[anchors]
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
    return estimate, _gaps(xyz, estimate, supported, length)


def _gaps(xyz, estimate, supported, length):
    """Merge unsupported route intervals, splitting them at the route seam. Pure."""
    gaps = []
    for i, dist in enumerate(np.linalg.norm(np.roll(xyz, -1, axis=0)-xyz, axis=1)):
        j = (i+1) % len(xyz)
        # A jump across a hairpin can have valid endpoints. If it covers more
        # than twice the driven chord plus one lane width, the stretch is uncertain.
        if not (supported[i] and supported[j]) or (estimate[j]-estimate[i]) % length > 2*dist+MATCH_REACH:
            gaps.extend(aimargins.intervals(estimate[i], estimate[j], length))
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
    return _alignment(folder, lane, old, (stamp(lane), stamp(old), stamp(source / ailinestate.FILE),
                                          stamp(folder / fastlane.ROUTE)))


@lru_cache(maxsize=3)
def _alignment(folder, lane, old, revisions):
    metres = ailinestate.lane_metres(original(folder), old)
    route = ailinestate._route(folder, True)
    if metres is None or route is None:
        return None, []
    return alignment(fastlane.read_lane(lane)[0]["pos"].astype(float),
                     fastlane.read_lane(old)[0]["pos"].astype(float), metres, route.length)


def prepared_path(key):
    """Locate a disposable calculated spline for the Editor's immutable binary transfer."""
    if not valid(key):
        raise ValueError("Invalid prepared line ID")
    return Path(mytracks.ROOT, "out", "ai-prepared", key + ".ai")


def _reference_key(model, source, key):
    raw = path(source, key)
    files = [raw, model, model.parent / fastlane.ROUTE, *map(Path, editorinfo.archives(model))]
    return model, raw, tuple(stamp(file) for file in files)


def editing(model, key, source=None):
    """Share one measured recording between the draft, guide and correction preview."""
    return _editing(*_reference_key(model, source or model, key))


@lru_cache(maxsize=2)
def _editing(model, raw, revisions):
    if ailinestate.checksum(raw) != raw.stem:
        raise ValueError("The selected AI recording changed.")
    points, detail, _ = fastlane.read_lane(raw)
    inputs = fastlane.lane_inputs(model, True, lambda _: None, preview=True)
    base, measured = drivenline.reference(inputs, points, detail)
    return inputs, base, measured


def prepare(model, key, corrections, source=None):
    """Calculate the recorded source with the draft's corrections without installing it."""
    if error := fastlane.aicorrections.problem(corrections):
        raise ValueError(error)
    return _prepare(*_reference_key(model, source or model, key), json.dumps(corrections, sort_keys=True))


@lru_cache(maxsize=12)
def _prepare(model, raw, revisions, edits):
    inputs, base, _ = _editing(model, raw, revisions)
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
    if key is None:
        if base == folder:
            raise ValueError("The original AI line backup is missing.")
        restored = ailinestate.carry(base, target, True)
        # A previously hand-installed spline has no automatic fingerprint. Selecting
        # it via Undo is an explicit choice of those exact bytes for the next race.
        installed = dest / fastlane.FILE
        if installed.exists() and restored.get("inputs") and restored["status"] != "ready":
            metres = ailinestate.lane_metres(base, base / fastlane.FILE)
            ailinestate.record_ready(dest, restored["inputs"], circuit=True, metres=metres)
            restored["status"] = "ready"
        elif not installed.exists():
            restored["status"] = "missing"
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
    shutil.copyfile(file, installed)
    ailinestate._write(dest, key, "ready", **fields)
    old = folder / aihints.FILE
    aihints.replace(dest, old.read_bytes() if old.is_file() else None)
    ailinestate.sync_hints(dest, True)
    return {"status": "ready", "inputs": key}
