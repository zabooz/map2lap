"""Validity of Map2Lap AI lines in installed and staged track folders."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import tempfile

import numpy as np

from track import aicorrections, aihints, aimargins, fastlane, route_race

FILE = Path("data/map2lap_ai.json")
# When line code changes, bump this and update LaneCodeVersionTest in engine/tests/test_fastlane.py.
# For comments or refactors proven to leave the generated line unchanged, update only the test's source digest.
CODE_VERSION = 13
ERRORS = (AssertionError, IndexError, KeyError, OSError, ValueError, struct.error)


class Deferred(ValueError):
    """AC started before this update could be installed."""


def reason(error):
    """User-visible reason for a failed lane. Pure."""
    if isinstance(error, KeyError):
        return f"Missing KN5 marker {error}"
    if isinstance(error, OSError):
        return f"{Path(error.filename).name}: {error.strerror}" if error.filename else str(error)
    return str(error) or "Invalid installed KN5"


def fingerprint(inputs, circuit):
    """Hash the delimited lane inputs in driving order. Pure."""
    route, markers, meshes, mapped, rings, origin, corrections = inputs
    digest = hashlib.sha256()

    def field(raw):
        digest.update(struct.pack("<Q", len(raw)))
        digest.update(raw)

    field(struct.pack("<I?", CODE_VERSION, circuit))
    field(struct.pack("<d", getattr(meshes, "cell", fastlane.aicorridor.acgrid.CELL)))
    if mapped:
        field(struct.pack("<2d", fastlane.AI_ROAD_EDGE_M, fastlane.surface.PHOTO_ROAD_EDGE_M))
    field(json.dumps(corrections, sort_keys=True, separators=(",", ":"), allow_nan=False).encode())
    if corrections:
        field(np.asarray(origin, dtype="<f8").tobytes())
    field(route.astype("<f8", copy=False).tobytes())
    field(struct.pack("<I", len(markers)))
    for name, matrix in sorted(markers.items()):
        field(name.encode())
        field(struct.pack("<16f", *matrix))
    field(struct.pack("<I", len(meshes)))
    for key, (_, vertices, _, faces) in meshes.items():
        # The absolute KN5 mesh index also counts trees and decorations.
        field(key.rsplit("/", 1)[0].encode())
        field(vertices.astype("<f4").tobytes())
        field(faces.astype("<u2", copy=False).tobytes())
    for roads in (mapped, rings):
        entries = [(np.asarray(points, dtype="<f8").tobytes(), width) for points, width in roads]
        field(struct.pack("<I", len(entries)))
        # Ring membership is a union and its set iteration order varies by process.
        for coords, width in (sorted(entries) if roads is rings else entries):
            field(coords)
            field(struct.pack("<d", width))
    return digest.hexdigest()


def _raw_record(folder):
    """Read the lane metadata independently of later geometry and recipe edits."""
    try:
        data = json.loads((folder / FILE).read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def _record(folder):
    data = _raw_record(folder)
    if data.get("schema") == 2 and data.get("code") == CODE_VERSION and data.get("corrections") == aicorrections.recipe(folder):
        return data
    return {}


def _write(folder, inputs, status, **fields):
    path = folder / FILE
    path.parent.mkdir(parents=True, exist_ok=True)
    data = dict(schema=2, code=CODE_VERSION, corrections=aicorrections.recipe(folder), inputs=inputs, status=status, **fields)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        tmp = Path(stream.name)
    try:
        tmp.write_text(json.dumps(data), encoding="utf-8")
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def _metres(record, lane, digest):
    """Read finite recorded route metres only for the very same samples."""
    if not digest or digest != record.get("lane") or record.get("metres") is None:
        return None
    try:
        values = np.asarray(record["metres"], dtype=float)
        if values.shape == (len(fastlane.read_lane(lane)[0]),) and np.isfinite(values).all():
            return values
    except (TypeError, ValueError):
        pass
    return None


def lane_metres(folder, lane: Path) -> np.ndarray | None:
    """Recover the route correspondence bound to lane, even after its recipe has changed."""
    return _metres(_raw_record(folder), lane, checksum(lane) if lane.is_file() else None)


def _saved_margins(folder):
    """Keep usable saved entries when an older or hand-edited recipe also has a bad margin."""
    items = aimargins.recipe(folder)
    if not isinstance(items, list):
        return [], {"aiMargins": "Invalid side margin"}
    margins, rejected, seen = [], {}, set()
    for i, item in enumerate(items):
        key = item.get("id") if isinstance(item, dict) else None
        key = key if isinstance(key, str) and key else f"Margin {i + 1}"
        error = aimargins.problem([item])
        if error or key in seen:
            rejected[key] = error or "Invalid side margin"
        else:
            seen.add(key)
            margins.append(item)
    return margins, rejected


def _route(folder, circuit):
    """Read the directed route when its origin and horizontal path can resolve saved anchors."""
    try:
        path, origin = fastlane.read_route(folder)
    except (FileNotFoundError, ValueError):
        return None
    if (len(origin) != 2 or not np.isfinite(origin).all() or path.shape[1] != 2 or len(path) < 2
            or not np.isfinite(path).all() or not (path[1:] != path[0]).any()):
        return None
    return aicorrections.Route(path, origin, circuit)


def _render(folder, lane, circuit, margins, rejected, metres, unplaced):
    """Resolve margins against the recipe's route and the selected lane's own samples."""
    placement = None
    if margins and metres is not None:
        route = _route(folder, circuit)
        if route is None:
            # The surviving spline still supplies its own automatic passing widths.
            automatic, profile = aihints.render_profile(lane, circuit, [], None, None)
            for margin in margins:
                metre = margin["start"]["metre"]
                rejected[margin["id"]] = f"Unresolved route anchor at route metre {metre:.1f}: saved route unavailable"
            return automatic._replace(rejected=rejected), profile
        placement = route, metres
    result, profile = aihints.render_profile(lane, circuit, margins, placement, unplaced)
    return result._replace(rejected=rejected | result.rejected), profile


def _expected(folder, circuit, lane=None, metres=None, margins=None):
    """Return expected hints and their profile. An absent profile indicates an unreadable lane."""
    lane = folder / fastlane.FILE if lane is None else lane
    margins, rejected = _saved_margins(folder) if margins is None else (margins, {})
    unplaced = "recalculate" if margins else None
    if not lane.is_file():
        return aihints.Hints(b"", rejected, unplaced, []), None
    if margins and metres is None:
        record = _raw_record(folder)
        digest = checksum(lane)
        metres = _metres(record, lane, digest)
        if record.get("status") == "ready" and record.get("lane") and record["lane"] != digest:
            unplaced = "manual"
    try:
        return _render(folder, lane, circuit, margins, rejected, metres, unplaced)
    except fastlane.NoLine:
        return aihints.Hints(b"", rejected, unplaced, []), None


def hints(folder, circuit, *, lane=None, metres=None) -> aihints.Hints:
    """Return the expected INI and margin placement for the saved recipe."""
    return _expected(folder, circuit, lane, metres)[0]


def margin_preview(folder, circuit, margins):
    """Preview draft margins on the installed lane using the same placement and merge as the INI."""
    result, profile = _expected(folder, circuit, margins=margins)
    profile = profile or aihints.Profile([], [], {})
    locations = dict(profile.locations)
    for key, error in result.rejected.items():
        locations[key] = {**locations.get(key, {}), "error": error}
    return dict(auto=profile.auto, sections=profile.sections, margins=locations, unplaced=result.unplaced)


def sync_hints(folder, circuit, *, report_deferred=False) -> aihints.Hints:
    """Install hints from the saved recipe and lane, removing the INI for an unreadable lane."""
    result, profile = _expected(folder, circuit)
    if route_race.ac_running():
        if report_deferred:
            raise Deferred("Close Assetto Corsa before updating the AI hints.")
    else:
        aihints.install(folder, result.data if profile is not None else None)
    return result


def hints_state(folder, circuit) -> dict:
    """Check the installed INI bytes against the recipe, independently of margin placement."""
    expected = hints(folder, circuit)
    path = folder / aihints.FILE
    actual = path.read_bytes() if path.is_file() else b""
    return dict(state="current" if actual == expected.data else "stale",
                unplaced=expected.unplaced, rejected=expected.rejected)


def _ready_data(folder, lane, skipped, circuit, metres):
    """Render from the exact correspondence written to the ready record, including its precision."""
    fields = dict(lane=checksum(lane), skipped=skipped or {})
    if metres is not None:
        metres = np.round(np.asarray(metres, dtype=float), 2)
        fields["metres"] = metres.tolist()
    margins, rejected = _saved_margins(folder)
    result, _ = _render(folder, lane, circuit, margins, rejected, metres, "recalculate")
    return fields, result.data


def record_ready(folder, inputs, skipped=None, *, circuit=False, metres=None):
    """Record the generated lane, its route metres and passing hints in the build folder."""
    fields, data = _ready_data(folder, folder / fastlane.FILE, skipped, circuit, metres)
    if not route_race.ac_running():
        aihints.install(folder, data)
    _write(folder, inputs, "ready", **fields)


def publish(folder, inputs, candidate, skipped=None, *, circuit=False, metres=None):
    """Install a worker's complete candidate, restoring the original bytes on metadata failure."""
    lane = folder / fastlane.FILE
    lane.parent.mkdir(exist_ok=True)
    fields, data = _ready_data(folder, candidate, skipped, circuit, metres)
    hint_path = folder / aihints.FILE
    previous_hints = hint_path.read_bytes() if hint_path.is_file() else None
    backup = candidate.with_suffix(".previous")
    if lane.exists():
        shutil.copy2(lane, backup)
    if route_race.ac_running():
        raise Deferred("Close Assetto Corsa before replacing the AI line.")
    os.replace(candidate, lane)
    try:
        aihints.install(folder, data)
        _write(folder, inputs, "ready", **fields)
    except OSError:
        if backup.exists():
            os.replace(backup, lane)
        else:
            lane.unlink(missing_ok=True)
        aihints.install(folder, previous_hints)
        raise


def clear(folder, inputs, message=None):
    (folder / fastlane.FILE).unlink(missing_ok=True)
    mark_outdated(folder, inputs, message)


def mark_outdated(folder, inputs, message=None, *, keep=None):
    """Retain the last installed bytes for display while recording their race eligibility."""
    lane = folder / fastlane.FILE
    fields = {}
    if lane.is_file():
        if keep is None:
            record = _raw_record(folder)
            keep = record.get("lane"), record.get("metres")
        digest, metres = keep
        if metres is not None and digest == checksum(lane):
            fields.update(lane=digest, metres=np.asarray(metres).tolist())
    elif not route_race.ac_running():
        aihints.install(folder, None)
    _write(folder, inputs, "failed" if message else "pending", message=message, **fields)


def status(folder, inputs):
    """Classify installed bytes against a known input fingerprint."""
    record = _record(folder)
    if inputs == record.get("inputs") and record.get("status") == "failed" and record.get("message"):
        return {"status": "failed", "message": record["message"]}
    if inputs and inputs == record.get("inputs"):
        if record.get("status") == "ready" and record.get("lane") and (folder / fastlane.FILE).is_file():
            actual = checksum(folder / fastlane.FILE)
            return {"status": "ready" if actual == record["lane"] else "manual", "lane": actual, "inputs": inputs}
    return {"status": "pending"}


def input_key(model, circuit):
    """Fingerprint the inputs on disk for a Save, a Race or the Editor's status."""
    return fingerprint(fastlane.lane_inputs(Path(model), circuit, lambda line: None), circuit)


def inspect(model, circuit):
    """Compare the saved reference with the current model and installed line."""
    return status(Path(model).parent, input_key(model, circuit))


def carry(source, model, circuit):
    """Stage the installed preview and classify it against the finished Save inputs."""
    model, source = Path(model), Path(source)
    target = model.parent / fastlane.FILE
    if (source / fastlane.FILE).is_file():
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / fastlane.FILE, target)
    try:
        key = input_key(model, circuit)
        state = status(source, key)
    except ERRORS as error:
        key = None
        state = {"status": "failed", "message": reason(error)}
    if state["status"] in ("manual", "ready"):
        (model.parent / FILE).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / FILE, model.parent / FILE)
    else:
        record = _raw_record(source)
        mark_outdated(model.parent, key, state.get("message"), keep=(record.get("lane"), record.get("metres")))
    # Begin with the installed INI, including its absence, so a deferred Save
    # carries exactly the bytes AC last saw even when the staging folder came from an older source.
    old = source / aihints.FILE
    aihints.install(model.parent, old.read_bytes() if old.is_file() else None)
    sync_hints(model.parent, circuit)
    return {**state, "inputs": key}
