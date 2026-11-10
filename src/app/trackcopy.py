"""Save in the Editor: a track as its draft (trackedits) says, written from its source (tracksource), in its place or as a copy: its
whole folder, its kn5 without those objects' triangles, collision and the backs of walls too, with its objects placed anew (trackplace)
and its height changes (trackheights). No build: the geometry of everything else is the same to the byte. Its map2lap.json holds the
recipe ("edits": source, ids, sorts, height changes, placements, the kn5 written), so the Editor shows the source and whatever was changed
can come back. No build from the map replaces such a track (generator, server); a copy built from its route has none of this.
"""
import contextlib
import os
import shutil
import threading
import time
from pathlib import Path

import numpy as np

from app import mytracks, placement, trackcopies, trackdetail, trackedits, trackheights, trackpaint, trackplace, tracksource, trackvariation, trackview
from track import editorinfo, kn5, objectlist

TEMPORARY, OLD = ".map2lap_new_", ".map2lap_old_"     # (folders AC doesn't show: a new track until it is whole, an old one until replaced)
ROOM_FACTOR = 1.1               # the disk must hold the kn5 once more, and a little: the rest of a track's folder is small
OLD_KEYS = ("edited_from", "mod_of", "mod_of_title")    # (what the Rebuild of before wrote: a "modded" track)
_making = threading.Lock()      # (one at a time: the name and the disk's room are decided before the work)


class Busy(Exception):
    """A new track is being made already."""


class Refused(Exception):
    """This track can't be made now, for the reason it says."""


def _belonging(objects):
    """{id of an object: ids that go with it}: what belongs to it, and a pole's wires in any tile. Pure."""
    out = {}
    for tile, entry in objects.items():
        for k, parent in enumerate(entry["parents"]):
            if parent >= 0:
                out.setdefault(f"{tile}#{parent}", []).append(f"{tile}#{k}")
        for number, ids in entry.get("with", {}).items():
            out.setdefault(f"{tile}#{number}", []).extend(ids)
    return out


def _sorts_of(path, meshes, first_faces, atlas):
    """Per billboard mesh number (first_faces' keys) the sort of each triangle: an array of names, each billboard's triangles its
    first triangle's sort (as the view's spriteOf), by the middle of it on the atlas."""
    names = np.array(atlas["sprites"] + [""])
    out = {}
    with open(path, "rb") as f:
        for i, first in first_faces.items():
            m = meshes[i]
            vertices, faces = kn5.mesh_arrays(f, m)
            uv = vertices["uv"]
            mid = uv[faces].mean(axis=1)
            col = np.floor((mid[:, 0] - np.floor(mid[:, 0])) * atlas["cols"]).astype(np.int64)
            row = np.floor((mid[:, 1] - np.floor(mid[:, 1])) * atlas["rows"]).astype(np.int64)
            sprite = names[np.minimum(row * atlas["cols"] + col, len(names) - 1)]
            per = trackview.FACES_PER_BILLBOARD
            numbers = (first + np.arange(len(faces))) // per
            lead = np.r_[0, np.flatnonzero(numbers[1:] != numbers[:-1]) + 1]
            out[i] = np.repeat(sprite[lead], np.diff(np.r_[lead, len(faces)]))
    return out


def faces_left_out(path, scan, objects, deleted, sorts, atlas, object_sorts=()):
    """{mesh number: bool per triangle, True what goes}. deleted: ids; a listed object takes along what goes with it, a billboard's
    triangles are told by counting, over the parts of its mesh. sorts: of trees and bushes, by the atlas; object_sorts: of listed
    objects, each of them as if deleted alone: what goes is what any of them takes along."""
    first = trackview._first_faces(scan["meshes"], scan["materials"])
    parts = {}
    for i, start in first.items():
        parts.setdefault(trackview._base(scan["meshes"][i]["name"]), []).append((i, start))
    going = {}

    def mark(i, a, b):
        going.setdefault(i, np.zeros(scan["meshes"][i]["indices"] // 3, bool))[a:b] = True

    belonging, seen, queue = _belonging(objects), set(), list(deleted)
    queue += [f"{tile}#{k}" for tile, entry in objects.items() for k, kind in enumerate(entry["kinds"])
              if kind in ("tree", "bush") and objectlist.sorts_of(entry)[k] in sorts]
    if object_sorts:        # (those that are there: a saved track's own list keeps the numbers of what it left out, without triangles)
        wanted = set(object_sorts)
        queue += [f"{tile}#{k}" for tile, entry in objects.items()
                  for k, sort in enumerate(objectlist.sorts_of(entry)) if sort in wanted and entry["faces"][k]]
    while queue:
        id_ = queue.pop()
        if id_ in seen:
            continue
        seen.add(id_)
        base, number = id_.rsplit("#", 1)
        number = int(number)
        if base in objects:
            for i, a, n in objects[base]["faces"][number]:
                mark(i, a, a + n)
            queue += belonging.get(id_, ())
        else:
            per = trackview.FACES_PER_BILLBOARD
            for i, start in parts.get(base, ()):
                mark(i, max(0, number * per - start), max(0, (number + 1) * per - start))
    if sorts:
        wanted = np.array(sorts)
        for i, sprite in _sorts_of(path, scan["meshes"], first, atlas).items():
            hit = np.isin(sprite, wanted)
            if hit.any():
                going.setdefault(i, np.zeros(len(hit), bool))
                going[i] |= hit
    return going, seen


def _copy_folder(source, target, skip):
    """The track's folder but the files in skip, relative to it."""
    def ignore(folder, names):
        here = os.path.relpath(folder, source)
        return [n for n in names if os.path.normpath(os.path.join(here, n)) in skip or n.startswith(".map2lap_objects_")]
    shutil.copytree(source, target, ignore=ignore)


def _ui_title(root, title):
    """The new title for Content Manager and AC's own list."""
    path = os.path.join(root, "ui", "ui_track.json")
    try:
        with open(path, encoding="utf-8") as f:
            ui = trackedits.json.load(f)
    except (OSError, ValueError):
        return
    ui["name"] = title
    with open(path, "w", encoding="utf-8") as f:
        trackedits.json.dump(ui, f, ensure_ascii=False, indent=2)


def busy():
    """Whether a track is being saved now: a build or a deletion waits for it."""
    return _making.locked()


@contextlib.contextmanager
def alone():
    """No Save while in it (a deletion, the sources cleaned): Busy if one runs."""
    if not _making.acquire(blocking=False):
        raise Busy("")
    try:
        yield
    finally:
        _making.release()


def tidy(ac):
    """On server start: what a Map2Lap ended in the middle of saving a track left behind. A half new one goes; a track moved aside to
    be replaced comes back, if nothing took its place; sources no track names go."""
    tracks = os.path.join(ac, "content", "tracks")
    for name in os.listdir(tracks) if os.path.isdir(tracks) else []:
        path = os.path.join(tracks, name)
        if name.startswith(TEMPORARY):
            shutil.rmtree(path, ignore_errors=True)
        elif name.startswith(OLD):
            target = os.path.join(tracks, name[len(OLD):])
            if os.path.exists(target):
                shutil.rmtree(path, ignore_errors=True)
            else:
                os.rename(path, target)
    with alone():
        tracksource.tidy(ac)


def save(ac, name, copy_to=None, title=None, revision=None, may_start=lambda: None):
    """The track name as the Editor shows it, its draft applied to its source: {"name", "title", "left_out"}. In its place, or (copy_to:
    a folder name not in use) as a new track beside it, which takes the draft along (the track's own goes back to its recipe). title:
    the new one's (None: as it is). revision: the draft's revision the page saved;
    another one on disk is refused, so what is written is what the page shows. may_start: raises Refused while a build runs (the
    server's), asked with this module's lock held. Refused: nothing to do, the draft or the kn5 changed, the disk is too full, or the
    file is in use. Busy: another one is being saved. Nothing is left behind when it fails."""
    if not _making.acquire(blocking=False):
        raise Busy(name)
    try:
        may_start()
        return _save(ac, name, copy_to, title, revision)
    finally:
        _making.release()


def _replace(temporary, target):
    """temporary in the place of target. A kn5 AC has open can't be moved: then target stays as it is."""
    old = os.path.join(os.path.dirname(target), OLD + os.path.basename(target))
    shutil.rmtree(old, ignore_errors=True)      # (left over from an earlier attempt)
    try:
        os.rename(target, old)
    except OSError as e:
        raise Refused("Could not replace it: close Assetto Corsa (or Content Manager's preview) and try again") from e
    try:
        os.rename(temporary, target)
    except BaseException:
        os.rename(old, target)
        raise
    shutil.rmtree(old, ignore_errors=True)


def _disk(folder):
    """Which disk the folder lies on."""
    return os.stat(folder).st_dev


def _check_room(tracks, size, source_too, extra=0):
    """Refused unless a kn5 of size bytes fits once more in the folder tracks, and (source_too: a source is to be copied) once more
    where the sources lie: two disks when AC was moved, one that holds both then."""
    needs, at = {}, {}
    for folder, room in ((tracks, (size + extra) * ROOM_FACTOR), (mytracks.ROOT, size if source_too else 0)):
        disk = _disk(folder)
        needs[disk], at[disk] = needs.get(disk, 0) + room, folder
    if any(shutil.disk_usage(at[disk]).free < room for disk, room in needs.items()):
        raise Refused(f"Not enough room on the disk: this needs {sum(needs.values()) / 1e9:.0f} GB free")


def _save(ac, name, copy_to, title, revision):
    edits = trackedits.load(ac, name)
    if revision is not None and edits["revision"] != revision:
        raise Refused("The changes on the disk are not the ones shown: read them again")
    if edits["outdated"]:
        raise Refused("The changes belong to an earlier build of this track")
    own = trackview.kn5_path(ac, name)
    path, source = trackview.served(ac, name)
    if edits["base"] != objectlist.state_of(path):
        raise Refused("The track changed")
    changed = edits["deleted"] or edits["sorts"] or edits["object_sorts"] or edits["heights"] or edits["placed"] or edits["copies"] or edits["paints"] or edits.get("models")
    if not (changed or source or copy_to):
        raise Refused("Nothing to save: nothing is changed")
    objects = trackview.list_of(path)
    # (the first Save: the track as it is, kept before anything is written. Replaced, its file itself can stay as that; a copy leaves
    # the track in its place, which needs a source of its own)
    linked = tracksource.link(ac, name, own, objects) if source is None and not copy_to else None
    try:
        return _written(ac, name, edits, own, source or linked, objects, copy_to, title)
    except BaseException:
        if linked and linked not in tracksource.named(ac):
            tracksource.drop(linked)
        raise


def _written(ac, name, edits, own, source, objects, copy_to, title):
    """The track written as edits say, from its source, its id (None: none yet, one is copied now). What save returns."""
    folder = os.path.dirname(own)
    path = tracksource.kn5_of(source) if source else own
    source_objects = objects
    source_scan = kn5.scan(path)
    from app import trackmodels
    inherited = trackmodels.compiled(ac, name, path)
    copied_scan, objects = trackcopies.build(path, source_scan, objects, edits["copies"])
    scan, objects = trackmodels.extend(ac, name, {**copied_scan, "model_source_path": path}, objects, edits.get("models", []))
    scan = {**scan, "model_images": trackmodels.images(ac, name, scan)}
    added = scan["meshes"][len(source_scan["meshes"]):]
    # The source needs no new textures; every appended node has 53 fixed bytes, its length-prefixed name, vertices and indices.
    extra = sum(53 + len(kn5._s(m["name"])) + m["vertices"] * kn5.VERTEX.itemsize + m["indices"] * 2 for m in added)
    extra += trackmodels.save_size(ac, name, edits.get("models", []), scan) if edits.get("models") else 0
    try:
        trackpaint.validate(ac, name, edits["base"], edits["paints"])
        descriptors = trackpaint.descriptors(ac, name, edits["base"], edits["paints"])
        textures = {d["i"]: d for d in trackdetail.native_descriptors(ac, name, descriptors)}
        extra += trackdetail.save_size(textures.values(), source_scan, path) + trackpaint.bundle_size(ac, name, edits["paints"])
        extra += trackdetail.binding_size(ac, name, path, textures.values(), source_scan)
    except (ValueError, OSError) as error:
        raise Refused(str(error)) from error
    _check_room(os.path.dirname(folder), os.path.getsize(path), not (source or tracksource.exists(tracksource.id_of(name, own))), extra)
    try:                            # (before a source is made: refused, nothing is left behind)
        change = trackplace.changed(path, scan, objects, edits["heights"], edits["placed"])
        from track import groundnormals
        change = groundnormals.changed(path,change)
    except trackheights.InTheWay as e:
        raise Refused(str(e)) from e
    if source is None:
        source = tracksource.make(ac, name, own, source_objects)
        path = tracksource.kn5_of(source)
    info, new = mytracks.load(folder), copy_to or name
    title = title or info["title"]
    temporary, target = (os.path.join(os.path.dirname(folder), prefix + new) for prefix in (TEMPORARY, ""))
    if copy_to and os.path.exists(target):
        raise Refused(f"A track called {copy_to} is there already")
    shutil.rmtree(temporary, ignore_errors=True)        # (left by a Map2Lap that ended halfway)
    going, seen = faces_left_out(path, scan, objects, [d["id"] for d in edits["deleted"]], edits["sorts"],
                                 trackview._atlas(), edits["object_sorts"])
    from app import tracknative
    for i, mesh in enumerate(scan["meshes"]):
        if mesh["name"].startswith(tracknative.PREFIX):
            going[i] = np.ones(mesh["indices"] // 3, bool)
    consumed = {m["id"]: m.get("replaces") for m in inherited["models"]} if inherited else {}
    for i, mesh in enumerate(source_scan["meshes"]):
        if inherited and mesh["name"] in inherited["meshes"]:
            going[i] = np.ones(mesh["indices"] // 3, bool)
    replacements = [m["replaces"] for m in edits.get("models", [])
                    if m.get("replaces") and consumed.get(m["id"]) != m["replaces"]]
    if replacements:
        hidden, _seen = faces_left_out(path, source_scan, source_objects, replacements, [], trackview._atlas(), [])
        for i, mask in hidden.items():
            if source_scan["meshes"][i]["name"].startswith("nocol_"):
                going[i] = going.get(i, np.zeros_like(mask)) | mask
    try:
        _copy_folder(folder, temporary, {name + ".kn5", name + '.uv2', objectlist.FILE, str(trackpaint.BUNDLE)})
        new_kn5 = os.path.join(temporary, new + ".kn5")
        materials, images, change, added, native_config, drop_textures, native_files = trackdetail.saved(ac, name, edits["base"], textures.values(), scan, change, path, added)
        if edits.get("models"):
            materials = materials if materials is not None else scan["materials"]
            present = {t[0] for t in source_scan["textures"]}
            images.extend((n, raw) for n, raw in scan.get("model_images", {}).items() if n not in present)
            # (a model image of the saved kn5 no material uses any more, one an older encoder made, goes)
            used = {n for m in materials for _slot, _number, n in m.maps}
            drop_textures = {*drop_textures, *(n for n in present if n.startswith("map2lap_model_") and n not in used)}
        trackvariation.write(temporary, materials if materials is not None else scan["materials"], native_config)
        if materials is None and not images:
            moved = kn5.without_faces(path, new_kn5, going, change, added, None, renderable=native_files.get('renderable',{}))
        else:
            names, replace = [t[0] for t in source_scan["textures"]], native_files.get("replace", {})
            moved = kn5.without_faces(path, new_kn5, going, change, added, lambda i: replace.get(names[i]) if i < len(names) else None,
                                      materials=materials, textures=images, drop_textures=drop_textures, renderable=native_files.get('renderable',{}))
        from app import trackuv2
        trackuv2.write(path, new_kn5, added)
        now_at = trackheights.list_moved(placement.list_placed(objects, edits["placed"]), edits["heights"])
        objectlist.write(new_kn5, objectlist.after_filter(now_at, moved, going, seen))
        editorinfo.copy(path, new_kn5)
        trackpaint.export(ac, name, edits["paints"], temporary)
        trackmodels.export(ac, name, edits.get("models", []), temporary, new_kn5, edits, inherited)
        trackdetail.write_bindings(ac, name, path, textures.values(), scan, new_kn5)
        tracknative.write_source(ac, name, path, textures.values(), scan, new_kn5, edits["paints"])
        recipe = {"source": source, "base": edits["base"], "deleted": edits["deleted"], "sorts": edits["sorts"],
                  "object_sorts": edits["object_sorts"], "heights": edits["heights"], "placed": edits["placed"], "copies": edits["copies"], "paints": edits["paints"],
                  "models": edits.get("models", []), "detail_profile": trackdetail.PROFILE, "kn5": objectlist.state_of(new_kn5), "saved": time.time()}
        if inherited:
            recipe["model_source"] = inherited
        mytracks.save(temporary, {**{k: v for k, v in info.items() if k not in OLD_KEYS}, "title": title, "edits": recipe})
        _ui_title(temporary, title)
        # (a build started or a tab saved meanwhile: the triangles counted are no more the ones to go)
        if objectlist.state_of(path) != edits["base"] or trackedits.load(ac, name)["revision"] != edits["revision"]:
            raise Refused("The track or its changes changed meanwhile: nothing was saved")
        try:                        # (their files, copied just now, are what the ground above was made from)
            trackpaint.validate(ac, name, edits["base"], edits["paints"])
        except (ValueError, OSError) as error:
            raise Refused(str(error)) from error
        if copy_to:
            os.rename(temporary, target)
        else:
            _replace(temporary, target)
    except BaseException:
        shutil.rmtree(temporary, ignore_errors=True)
        raise
    if copy_to:                     # (the copy's list is its recipe; this track's goes back to its own, or none)
        for draft, of in ((copy_to, None), (name, edits["revision"])):
            try:
                trackedits.clear(draft, of)
            except OSError:         # (the copy is whole, so it is saved: a draft left only shows as changes not saved)
                pass
    return {"name": new, "title": title, "left_out": _counted(seen, objects) + len(edits["sorts"])}


def _counted(seen, objects):
    """How many of the ids faces_left_out took had triangles to lose: a saved track's own list keeps what it left out before, empty.
    Pure."""
    def there(id_):
        base, number = id_.rsplit("#", 1)
        return base not in objects or bool(objects[base]["faces"][int(number)])
    return sum(map(there, seen))
