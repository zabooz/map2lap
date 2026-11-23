"""Validity of Map2Lap AI lines in installed and staged track folders."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import tempfile

import numpy as np

from track import aicorrections, fastlane

FILE = Path("data/map2lap_ai.json")
# When line code changes, bump this and update LaneCodeVersionTest in engine/tests/test_fastlane.py.
# For comment-only edits, update just the test's source digest.
CODE_VERSION = 2
ERRORS = (AssertionError, IndexError, KeyError, OSError, ValueError, struct.error)


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


def _record(folder):
    try:
        data = json.loads((folder / FILE).read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("schema") == 2 and data.get("code") == CODE_VERSION and data.get("corrections") == aicorrections.recipe(folder):
            return data
    except (OSError, ValueError):
        pass
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


def record_ready(folder, inputs):
    _write(folder, inputs, "ready", lane=checksum(folder / fastlane.FILE))


def publish(folder, inputs, candidate):
    """Install a worker's complete candidate, restoring the original bytes on metadata failure."""
    lane = folder / fastlane.FILE
    lane.parent.mkdir(exist_ok=True)
    digest = checksum(candidate)
    backup = candidate.with_suffix(".previous")
    if lane.exists():
        shutil.copy2(lane, backup)
    os.replace(candidate, lane)
    try:
        _write(folder, inputs, "ready", lane=digest)
    except OSError:
        if backup.exists():
            os.replace(backup, lane)
        else:
            lane.unlink(missing_ok=True)
        raise


def clear(folder, inputs, message=None):
    (folder / fastlane.FILE).unlink(missing_ok=True)
    _write(folder, inputs, "failed" if message else "pending", message=message)


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
    """Carry generated or hand-swapped bytes into a Save only for matching finished inputs."""
    model, source = Path(model), Path(source)
    try:
        key = input_key(model, circuit)
    except ERRORS as error:
        clear(model.parent, None, reason(error))
        return
    state = status(source, key)
    if state["status"] in ("manual", "ready"):
        target = model.parent / fastlane.FILE
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / fastlane.FILE, target)
        shutil.copy2(source / FILE, model.parent / FILE)
    else:
        clear(model.parent, key, state.get("message"))
