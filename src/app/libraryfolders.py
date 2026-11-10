"""Where library packages live: the ones a release ships in assets/library/<kind>/, the user's own imports in library/<kind>/.

An update replaces assets/ whole (the start scripts mirror the folders a release contains) and never touches library/ (a release
never contains it). A package's id is its content's hash, so one in both folders is the same package: the user's copy is read.
Deleting a shipped package only hides it, in library/<kind>/hidden.json: deleted, it would come back with the next update."""
import json
import os
from pathlib import Path
import tempfile

HIDDEN = "hidden.json"


def own(root, kind, id=""):
    """The user's folder of package id (or of all of kind): where imports are written and deleted. Pure."""
    return Path(root, "library", kind, id)


def shipped(root, kind, id=""):
    """The release's folder of package id (or of all of kind): read only. Pure."""
    return Path(root, "assets", "library", kind, id)


def found(root, kind, id):
    """The folder package id is read from: the user's, else the release's; the user's when neither has it."""
    mine, theirs = own(root, kind, id), shipped(root, kind, id)
    return theirs if not mine.is_dir() and theirs.is_dir() else mine


def hidden(root, kind):
    """The shipped packages the user deleted."""
    try:
        with open(own(root, kind, HIDDEN), encoding="utf-8") as file:
            return set(json.load(file))
    except (OSError, ValueError, TypeError):
        return set()


def hide(root, kind, id):
    """Hide shipped package id from now on; written whole, never half."""
    folder = own(root, kind)
    folder.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=folder, suffix=".tmp", delete=False) as file:
        json.dump(sorted(hidden(root, kind) | {id}), file)
    os.replace(file.name, folder / HIDDEN)


def show(root, kind, id):
    """Show shipped package id again: the user imported it once more."""
    gone = hidden(root, kind)
    if id in gone:
        folder = own(root, kind)
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=folder, suffix=".tmp", delete=False) as file:
            json.dump(sorted(gone - {id}), file)
        os.replace(file.name, folder / HIDDEN)


def names(root, kind):
    """The folder names of both places, the user's first, without hidden shipped ones: [(name, folder)]; callers check the names."""
    out, seen, gone = [], set(), hidden(root, kind)
    for base, skip in ((own(root, kind), set()), (shipped(root, kind), gone)):
        for path in sorted(base.iterdir()) if base.is_dir() else ():
            if path.name not in seen and path.name not in skip and path.is_dir():
                seen.add(path.name)
                out.append((path.name, path))
    return out


def changed(root, kind):
    """What a cached listing of kind depends on: both folders' and the hidden list's change times. Pure but for the stat calls."""
    def stamp(path):
        try:
            return path.stat().st_mtime_ns
        except OSError:
            return None
    return stamp(own(root, kind)), stamp(shipped(root, kind)), stamp(own(root, kind, HIDDEN))


def remove(root, kind, id, delete):
    """Delete the user's package id with delete(folder), or hide a shipped one: whether anything was there to go."""
    mine, theirs = own(root, kind, id), shipped(root, kind, id)
    for folder, base in ((mine, own(root, kind)), (theirs, shipped(root, kind))):
        if folder.is_symlink() or folder.is_junction() or folder.resolve().parent != base.resolve():
            raise ValueError("The package is outside the library")
    if mine.is_dir():
        delete(mine)
        return True
    if theirs.is_dir() and id not in hidden(root, kind):
        hide(root, kind, id)
        return True
    return False
