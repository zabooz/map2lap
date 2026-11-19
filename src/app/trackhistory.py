"""The Editor's Undo and Redo steps of a track's draft (trackedits), kept beside it in out/edits/<name>.history.json, so a reload
or a server restart keeps them.

The page sends each save's change of them (problem, merged): the steps' order now ("past" oldest first, "future" with the next Redo
last) and only the steps and items the server does not hold yet. A step ("entry") is the draft at that point, each list of objects
by item keys (KEYED: a height change, a placement, a deleted object ...), the other parts as they are. An item's content is kept once
however many keys name it ("items" key -> hash, "blobs" hash -> content): a step that adds one height change costs that change, not
the draft again.

The file holds for one draft revision and one build ("revision", "base"): written just before its draft, a draft written without it
(an older page) or after a crash between the two leaves it unread (read), so Undo never brings back what belongs to another draft.
"""
import hashlib
import json
import os

from app import mytracks

SCHEMA = 1
MAX_STEPS = 100             # Undo steps kept, as many in the page (ui/src/editor/state/edits.ts HISTORY)
MAX_BYTES = 10 * 1024 * 1024    # their size: the oldest go first, the newest stays however large (one long smoothing is a few 100 kB)
MAX_KEY = 32
# The parts of a step that are lists of objects, by item key; the others (sorts, paint ids, spacing, density) are kept as they are.
KEYED = ("removed", "heights", "placed", "copies", "models", "surfaces", "trees", "walls", "kerbs", "stitches")


def path_of(name):
    """Where the history of the track name's draft lies, beside it (trackedits.path_of). Pure."""
    return os.path.join(mytracks.ROOT, "out", "edits", name + ".history.json")


def _key(value):
    return isinstance(value, str) and 0 < len(value) <= MAX_KEY


def problem(change):
    """What is wrong with a page's change of the history, None if nothing. Pure."""
    if not isinstance(change, dict):
        return "No history change"
    if not all(isinstance(change.get(k), list) and all(_key(v) for v in change[k]) for k in ("past", "future")):
        return "History steps must be named"
    entries, items = change.get("entries"), change.get("items")
    if not isinstance(entries, dict) or not isinstance(items, dict) or not all(_key(k) for k in [*entries, *items]):
        return "History steps and items must be named"
    for value in entries.values():
        if not isinstance(value, dict) or not all(isinstance(value.get(k, []), list) and all(_key(v) for v in value.get(k, []))
                                                  for k in KEYED):
            return "A history step must name its items"
    return None


def _hash(content):
    return hashlib.sha1(_json(content).encode()).hexdigest()[:24]


def _json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def _named(entry):
    """The item keys a step names. Pure."""
    return {key for part in KEYED for key in entry.get(part, [])}


def _resolved(steps, entries, items):
    """steps (oldest or farthest first) without the unknown ones and all beyond them from the draft (a step the page has but the
    server does not breaks the walk back to it); whether any was. Pure."""
    good = [entries.get(k) is not None and _named(entries[k]) <= items.keys() for k in steps]
    if all(good):
        return list(steps), False
    last_bad = max(i for i, ok in enumerate(good) if not ok)
    return list(steps[last_bad + 1:]), True


def _size(past, future, entries, items, sizes):
    """The bytes of the steps and the contents they reach. Pure."""
    steps = [*past, *future]
    reached = {items[key] for k in steps for key in _named(entries[k])}
    return sum(len(_json(entries[k])) for k in steps) + sum(sizes[h] for h in reached)


def merged(stored, change):
    """The history stored (None: none yet) with the page's change of it (problem: None): (the history now, {"past", "future": how
    many steps of each it keeps, the newest; "missing": whether the change named a step or item it does not hold, so the page sends
    them all again}). Pure."""
    stored = stored or {"past": [], "future": [], "entries": {}, "items": {}, "blobs": {}}
    blobs = dict(stored["blobs"])
    items = dict(stored["items"])
    for key, content in change["items"].items():
        h = _hash(content)
        blobs.setdefault(h, content)
        items[key] = h
    entries = {**stored["entries"], **change["entries"]}
    past, lost_past = _resolved(change["past"], entries, items)
    future, lost_future = _resolved(change["future"], entries, items)
    past, future = past[-MAX_STEPS:], future[-MAX_STEPS:]
    sizes = {h: len(_json(c)) for h, c in blobs.items()}
    while _size(past, future, entries, items, sizes) > MAX_BYTES and (len(past) > 1 or future):
        if len(past) > 1:
            past = past[1:]
        else:
            future = future[1:]
    kept = {k: entries[k] for k in [*past, *future]}
    named = {key for entry in kept.values() for key in _named(entry)}
    items = {key: h for key, h in items.items() if key in named}
    used = set(items.values())
    blobs = {h: c for h, c in blobs.items() if h in used}
    return ({"past": past, "future": future, "entries": kept, "items": items, "blobs": blobs},
            {"past": len(past), "future": len(future), "missing": lost_past or lost_future})


def page_form(stored):
    """The history as the page reads it: its steps and the content of each item key. Pure."""
    return {"past": stored["past"], "future": stored["future"], "entries": stored["entries"],
            "items": {key: stored["blobs"][h] for key, h in stored["items"].items()}}


def _well_formed(d):
    """Whether what was read is a history to its last part. Pure."""
    if not (isinstance(d, dict) and d.get("schema") == SCHEMA and isinstance(d.get("items"), dict) and isinstance(d.get("blobs"), dict)):
        return False
    change = {"past": d.get("past"), "future": d.get("future"), "entries": d.get("entries"), "items": {}}
    return (problem(change) is None and set(d["entries"]) == {*d["past"], *d["future"]}
            and all(_named(e) <= d["items"].keys() for e in d["entries"].values())
            and all(isinstance(h, str) and h in d["blobs"] for h in d["items"].values()))


def stored(name, base, revision):
    """The history of the track name's draft in that revision for that build, None if there is none for it."""
    try:
        with open(path_of(name), encoding="utf-8") as f:
            d = json.load(f)
    except (OSError, ValueError):
        return None
    if not _well_formed(d) or d.get("base") != base or d.get("revision") != revision:
        return None
    return {k: d[k] for k in ("past", "future", "entries", "items", "blobs")}


def read(name, base, revision):
    """page_form of stored, None if there is none."""
    s = stored(name, base, revision)
    return None if s is None else {**page_form(s), "revision": revision}


def write(name, history, base, revision, write_file=None):
    """history as the one of the draft in that revision for that build. write_file(path, content): whole or not at all
    (trackedits._write)."""
    if write_file is None:
        from app.trackedits import _write as write_file
    write_file(path_of(name), {"schema": SCHEMA, "base": base, "revision": revision, **history})


def remove(name):
    """The track name's history is gone (its draft is)."""
    try:
        os.remove(path_of(name))
    except FileNotFoundError:
        pass
