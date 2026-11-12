"""The unchanged kn5 of a track edited in the Editor, its source: what the Editor shows and Save filters, so whatever was deleted can
come back after any number of saves. out/sources/<id>/track.kn5 with its object list (data/map2lap_objects.json, its TreeFX trees too;
their models stay in the track's folder); <id> is the track's
name and its kn5's state at its first Save. A track's recipe names it ("edits" in map2lap.json, trackcopy); a copy names the same one.
Not under out/tracks: "Delete build files" leaves it. Made in a folder that starts with NEW and then renamed: whole or not there.
A copy of the kn5, or for a track about to be replaced another name of its file (link): the old name then goes and it stands alone.
"""
import os
import shutil

from app import mytracks
from track import editorinfo, objectlist

NEW = ".new_"
KN5 = "track.kn5"
AC_FOLDER = "ac_folder.txt"     # (which AC folder's track it is the source of)


def root():
    """Where the sources lie."""
    return os.path.join(mytracks.ROOT, "out", "sources")


def kn5_of(source):
    """The kn5 of the source id. Pure."""
    return os.path.join(root(), source, KN5)


def exists(source):
    return bool(source) and os.path.exists(kn5_of(source))


def id_of(name, kn5_path):
    """The id of the source of the track name with its kn5 as it is now."""
    return f"{name}_{objectlist.state_of(kn5_path)}"


def _same_folder(path):
    """A folder's path as two of the same compare. Pure."""
    return os.path.normcase(os.path.abspath(path))


def _made(source, ac, objects, trees, put, facts_from):
    """The source of a track in the AC folder ac: put(path) leaves its kn5 at path, then its object list (with trees, its TreeFX
    section or None) goes beside it and it is there, whole."""
    new = os.path.join(root(), NEW + source)
    shutil.rmtree(new, ignore_errors=True)
    os.makedirs(new)
    try:
        put(os.path.join(new, KN5))
        objectlist.write(os.path.join(new, KN5), objects, trees)
        editorinfo.copy(facts_from, os.path.join(new, KN5))
        from app import tracknative
        tracknative.copy_source(facts_from, os.path.join(new, KN5))
        with open(os.path.join(new, AC_FOLDER), "w", encoding="utf-8") as f:
            f.write(_same_folder(ac))
        os.rename(new, os.path.join(root(), source))
    except BaseException:
        shutil.rmtree(new, ignore_errors=True)
        raise
    return source


def make(ac, name, kn5_path, objects, trees=None):
    """The source of the track name in the AC folder ac from its kn5 as it is now and its object list objects (track.objectlist, of that kn5)
    with trees, its TreeFX section (None for none); its id. One there already for this state of the file is taken as it is."""
    source = id_of(name, kn5_path)
    if exists(source):
        return source

    def copy(path):
        st = os.stat(kn5_path)
        shutil.copyfile(kn5_path, path)
        os.utime(path, ns=(st.st_atime_ns, st.st_mtime_ns))     # (the same state: the draft's ids, made for the track, hold for it)
    return _made(source, ac, objects, trees, copy, kn5_path)


def link(ac, name, kn5_path, objects, trees=None):
    """The same without copying: its kn5 another name of the file at kn5_path, for a track whose file is replaced right after (the
    two are one file until then: drop it if that fails). Its id, or None: one is there already, or the disk has no such names."""
    source = id_of(name, kn5_path)
    if exists(source):
        return None
    try:
        return _made(source, ac, objects, trees, lambda path: os.link(kn5_path, path), kn5_path)
    except (OSError, NotImplementedError):
        return None


def drop(source):
    """The source goes (a link: the track's own name of the file stays)."""
    shutil.rmtree(os.path.join(root(), source), ignore_errors=True)


def _of_folder(source, ac):
    """Whether the source was made for a track in the AC folder ac."""
    try:
        with open(os.path.join(root(), source, AC_FOLDER), encoding="utf-8") as f:
            return f.read() == _same_folder(ac)
    except OSError:
        return False


def named(ac):
    """The sources the tracks in the AC folder ac name in their recipes."""
    tracks = os.path.join(ac, "content", "tracks")
    out = set()
    for name in os.listdir(tracks):
        info = mytracks.load(os.path.join(tracks, name)) if os.path.exists(os.path.join(tracks, name, mytracks.FILE)) else None
        source = ((info or {}).get("edits") or {}).get("source")
        if source:
            out.add(source)
    return out


def tidy(ac):
    """The sources of the AC folder ac no track names any more go, and what a Map2Lap ended in the middle of making one left. An AC
    folder not there (its drive not plugged in, Steam moving it) says nothing about the tracks, and another one nothing about those
    of the folder used before: their sources stay. (AC moved: a source given up afterwards stays too, a few GB, no harm.) Not while a
    track is saved: trackcopy's lock."""
    if not os.path.isdir(root()):
        return
    known = os.path.isdir(os.path.join(ac, "content", "tracks"))
    keep = named(ac) if known else set()
    for source in os.listdir(root()):
        if source.startswith(NEW) or (known and source not in keep and _of_folder(source, ac)):
            drop(source)
