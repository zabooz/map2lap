"""What the Editor tab changed on a built track, its draft: for now the objects it leaves out, single or all of a sort.
It lies in out/edits, so nothing of a track's folder changes until Save writes it (trackcopy), and holds for one state of the kn5 the
Editor shows (trackview.served, "base"): an object's id is its number in that file, its position only a check for later. Built again,
the list stays but is not applied: the numbers may mean other trees now, and a neighbour must never go in the place of the one that
was picked. No file: the track's recipe, what its last Save was made of, while that counts (trackview.recipe); a saved empty list stays
empty.
"""
import json
import math
import os
import re
import tempfile
import threading

from app import mytracks, trackview

SCHEMA = 1
MAX_BYTES = 16 * 1024 * 1024        # about 150,000 objects: far more than anyone clicks away, far less than fills the memory
NAME = re.compile(r"[a-z0-9_]+")    # (generator.slug's names; another name is refused, not turned into one of them)
ID = re.compile(r"([\w-]+)#(\d+)")
MAX_ID, MAX_UNANSWERED = 64, 64
_saving = threading.Lock()          # (the server answers in threads: reading the revision and writing belong together)


class Invalid(Exception):
    """What the page sent can't be a track's edits."""


class Conflict(Exception):
    """The track or its list changed since the page read them: another tab, or a build."""


def path_of(name):
    """Where the draft of the track name lies. Pure."""
    return os.path.join(mytracks.ROOT, "out", "edits", name + ".json")


def _file(ac, name):
    """The draft's path for a track of ours called name; a name that can't be one is refused, not turned into one."""
    if not NAME.fullmatch(name):
        raise trackview.NotOurs(name)
    trackview.kn5_path(ac, name)
    return path_of(name)


def clear(name, revision=None):
    """The track's draft file is gone: the track is deleted, or a copy took its changes (it is its recipe again). revision: only if
    it is still that one: a tab may have saved a newer one since."""
    if not NAME.fullmatch(name):
        return
    with _saving:
        if os.path.exists(path_of(name)) and revision in (None, _stored(path_of(name))["revision"]):
            os.remove(path_of(name))


def changes(ac, name):
    """How many changes the track's draft holds that its last Save doesn't, whichever build they are of."""
    if not NAME.fullmatch(name):
        return 0
    try:
        saved = trackview.recipe(ac, name)
    except trackview.NotOurs:
        saved = None
    s = _stored(path_of(name), saved)
    if s.get("broken"):
        return 1
    if not saved or s["base"] != saved["base"]:
        return _count(s)
    return sum(len(set(a) ^ set(b)) for a, b in zip(_parts(s), _parts(saved)))


def _parts(stored):
    """A list's ids, sorts and object sorts. Pure."""
    return [d["id"] for d in stored["deleted"]], stored.get("sorts", ()), stored.get("object_sorts", ())


def _count(stored):
    """How many changes a list holds: each object, each sort. Pure."""
    return len(stored["deleted"]) + len(stored.get("sorts", ())) + len(stored.get("object_sorts", ()))


def _names(value):
    """Whether a list's part is a list of names. Pure."""
    return isinstance(value, list) and all(isinstance(x, str) for x in value)


def _well_formed(d):
    """Whether what was read from a draft's file is one, to its last part: a file cut or edited by hand is no list to act on. Pure."""
    return (isinstance(d, dict) and d.get("schema") == SCHEMA and type(d.get("revision")) is int
            and "base" in d and isinstance(d["base"], (str, type(None))) and isinstance(d.get("deleted"), list)
            and all(isinstance(i, dict) and isinstance(i.get("id"), str) and isinstance(i.get("position"), list) for i in d["deleted"])
            and _names(d.get("sorts", [])) and _names(d.get("object_sorts", [])))


def _stored(path, saved=None):
    """The list in the file: {"base", "revision", "deleted", "sorts", "object_sorts"}. None there: the recipe saved, or an empty one.
    Not readable as a list: an empty one that says "broken", it is not overwritten without being asked."""
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        if _well_formed(d):
            return d
    except FileNotFoundError:
        if saved:
            return {"base": saved["base"], "revision": 0, "deleted": saved["deleted"], "sorts": saved["sorts"],
                    "object_sorts": saved["object_sorts"]}
        return {"base": None, "revision": 0, "deleted": []}
    except (ValueError, KeyError, TypeError):
        pass
    return {"base": None, "revision": 0, "deleted": [], "broken": True}


def _old(stored, revision):
    """How many changes in a list don't hold for the kn5 in this revision. Pure."""
    if stored.get("broken"):
        return 1
    return 0 if stored["base"] == revision else _count(stored)


def load(ac, name):
    """The list for the page: "base" the served kn5's revision now, "revision" to send back with a save, "deleted", "sorts" (of trees
    and bushes) and "object_sorts" (of listed objects) what holds for it, "outdated" how many changes don't, "saved" what the last
    Save was made of while that counts (the page tells by it whether the track is as the list: "at", the ids and sorts),
    else None."""
    path = _file(ac, name)
    revision = trackview.deletable(ac, name)[0]
    saved = trackview.recipe(ac, name)
    s = _stored(path, saved)
    same = s["base"] == revision
    return {"base": revision, "revision": s["revision"], "deleted": s["deleted"] if same else [],
            "sorts": s.get("sorts", []) if same else [], "object_sorts": s.get("object_sorts", []) if same else [],
            "outdated": _old(s, revision), "saved": saved and {
                "at": saved["saved"], "deleted": [d["id"] for d in saved["deleted"]],
                "sorts": saved["sorts"], "object_sorts": saved["object_sorts"]}}


def _checked(deleted, counts):
    """What the page sent as deleted, only in the form the file holds: each id an object that is there, once, with a position
    of three finite numbers. Pure."""
    if not isinstance(deleted, list):
        raise Invalid("deleted is no list")
    out, seen = [], set()
    for item in deleted:
        match = ID.fullmatch(item.get("id") or "") if isinstance(item, dict) and isinstance(item.get("id"), str) else None
        if not match or int(match[2]) >= counts.get(match[1], (0,))[0] or item["id"] in seen:
            raise Invalid(f"no object to delete: {str(item)[:80]}")
        at = item.get("position")
        if not (isinstance(at, list) and len(at) == 3 and all(type(v) in (int, float) and math.isfinite(v) for v in at)):
            raise Invalid(f"no position: {item['id']}")
        seen.add(item["id"])
        kind = counts[match[1]][1]
        out.append({"id": item["id"], "kind": kind[int(match[2])] if isinstance(kind, list) else kind,
                    "position": [round(v, 3) for v in at]})
    return out


def _checked_sorts(sorts, known, what):
    """What the page sent as whole sorts to leave out: names in known, each once. A rule, not a list of ids: a long track's trees
    or cars wouldn't fit one. what: of what, for the message. Pure."""
    if not isinstance(sorts, list) or not all(isinstance(s, str) and s in known for s in sorts) or len(set(sorts)) != len(sorts):
        raise Invalid(f"no sorts of {what}")
    return sorts


def _write(path, content):
    """content into the file at path, whole or not at all: a build or a crash never leaves half a list."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, temporary = tempfile.mkstemp(dir=os.path.dirname(path), prefix=".map2lap_edits_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=0)
            f.flush()
            os.fsync(f.fileno())
        os.replace(temporary, path)
    except BaseException:
        os.unlink(temporary)
        raise


def save(ac, name, body):
    """The page's list {"base", "revision", "deleted", "sorts", "object_sorts", "id", "unanswered"} instead of the one on disk, if it
    was made from that one and for this kn5 (else Conflict). "unanswered": the ids of its saves it heard nothing back from: the last save on disk being one
    of them, the page's revision is only behind by an answer lost on the way (or a page closing with a save under way). An outdated
    or broken list goes only by an empty one, asked for. Returns the new revision."""
    if not isinstance(body, dict):
        raise Invalid("no list")
    path = _file(ac, name)
    request, unanswered = body.get("id"), body.get("unanswered") or []
    if not (isinstance(request, str) and len(request) <= MAX_ID and isinstance(unanswered, list) and len(unanswered) <= MAX_UNANSWERED):
        raise Invalid("no id")
    with _saving:
        revision, counts, listed_sorts = trackview.deletable(ac, name)
        if body.get("base") != revision:        # (first: on another build its numbers may be no objects at all)
            raise Conflict(name)
        s = _stored(path, trackview.recipe(ac, name))
        known = body.get("revision") == s["revision"] or s.get("last") in unanswered
        deleted = _checked(body.get("deleted"), counts)
        sorts = _checked_sorts(body.get("sorts") or [], trackview.sprites(), "trees")
        object_sorts = _checked_sorts(body.get("object_sorts") or [], listed_sorts, "objects")
        if not known or ((deleted or sorts or object_sorts) and _old(s, revision)):
            raise Conflict(name)
        new = s["revision"] + 1
        _write(path, {"schema": SCHEMA, "base": revision, "revision": new, "last": request, "deleted": deleted, "sorts": sorts,
                      "object_sorts": object_sorts})
    return new
