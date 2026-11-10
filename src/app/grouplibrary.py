"""User-owned reusable object mixtures. Track placements retain independent immutable model snapshots."""
import json
import math
import os
from pathlib import Path
import re
import secrets
import tempfile
import threading
from app import objectlibrary, placement

KEY = re.compile(r"[a-f0-9]{32}\Z")
_gate = threading.RLock()


def _path(id):
    """A group definition under the user's library, with an opaque id. Pure."""
    if not isinstance(id, str) or not KEY.fullmatch(id):
        raise ValueError("No group with this id")
    return Path(objectlibrary.ROOT, "library", "groups", id + ".json")


def _number(value, low, high):
    return type(value) in (int, float) and math.isfinite(value) and low <= value <= high


def _checked(body, assets=False):
    """Normalise a mixture, optionally checking its current object references. Pure except for asset reads."""
    if not isinstance(body, dict) or not isinstance(body.get("name"), str) or not 1 <= len(body["name"].strip()) <= 100:
        raise ValueError("Give the group a name up to 100 characters")
    entries = body.get("entries")
    if not isinstance(entries, list) or not 1 <= len(entries) <= 32:
        raise ValueError("Choose between 1 and 32 different objects")
    seen, out = set(), []
    for e in entries:
        if (not isinstance(e, dict) or not isinstance(e.get("model"), str) or not re.fullmatch(r"[a-f0-9]{64}", e["model"])
                or e["model"] in seen or not _number(e.get("weight"), 0, 1000)
                or not _number(e.get("minScale"), placement.MIN_SCALE, placement.MAX_SCALE)
                or not _number(e.get("maxScale"), placement.MIN_SCALE, placement.MAX_SCALE)
                or e["minScale"] > e["maxScale"]):
            raise ValueError("Choose distinct objects, non-negative weights and ordered size ranges (10–1000%)")
        seen.add(e["model"])
        if assets:
            objectlibrary.get(e["model"])
        out.append({k: e[k] for k in ("model", "weight", "minScale", "maxScale")})
    if not any(e["weight"] > 0 for e in out):
        raise ValueError("At least one object needs a positive weight")
    return {"schema": 1, "name": body["name"].strip(), "entries": out}


def get(id):
    """Read a mixture even when a referenced object has since been removed."""
    try:
        with _path(id).open(encoding="utf-8") as file:
            record = json.load(file)
    except FileNotFoundError as error:
        raise ValueError("This group is no longer in the library") from error
    if record.get("schema") != 1:
        raise ValueError("Unsupported group format")
    return {**_checked(record), "id": id}


def listing():
    """List saved mixtures in display order; damaged definitions do not hide valid groups."""
    folder = Path(objectlibrary.ROOT, "library", "groups")
    items = []
    for path in folder.glob("*.json"):
        if KEY.fullmatch(path.stem):
            try:
                items.append(get(path.stem))
            except (ValueError, OSError, TypeError, AttributeError):
                continue
    return {"items": sorted(items, key=lambda g: (g["name"].casefold(), g["id"]))}


def save(body):
    """Publish a complete checked mixture atomically, preserving an older definition if writing fails."""
    record = _checked(body, assets=True)
    id = body.get("id")
    with _gate:
        if id is not None:
            get(id)
        else:
            id = secrets.token_hex(16)
        path = _path(id); path.parent.mkdir(parents=True, exist_ok=True)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, suffix=".tmp", delete=False) as file:
                temporary = Path(file.name)
                json.dump(record, file, ensure_ascii=False, allow_nan=False)
            os.replace(temporary, path)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    return {**record, "id": id}


def remove(id):
    """Remove a library definition; existing track bindings do not refer to this file."""
    with _gate:
        path = _path(id)
        if not path.is_file():
            return False
        path.unlink()
        return True
