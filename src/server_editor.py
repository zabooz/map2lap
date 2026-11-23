"""Editor data HTTP endpoints; Handler supplies response, request and same-page helpers."""
import json
import os
from functools import lru_cache
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import generator
import numpy as np
from app import mytracks, settings, trackedits, trackinspect, trackview
from track import ailinestate, editorinfo, fastlane

IMAGE_TYPES = {".dds": "image/vnd-ms.dds", ".png": "image/png", ".jpg": "image/jpeg"}
LANE_CHANGED = "The installed AI line changed. Reopen the tool to load its current revision."
LANE_DETAILS = ("speed", "gas", "brake", "lat_g", "radius", "left", "right", "camber", "direction",
                "normal", "length", "forward", "tag", "grade")


def _lane_revision(stat):
    """Revision of the installed line at stat for version 1 of the Editor protocol. Pure."""
    return "v1-" + "-".join(f"{n:x}" for n in (stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size, stat.st_dev, stat.st_ino))


def _encode_lane(points, detail):
    """Encode point and detail records as the 23 little-endian columns in docs/editor-tools.md. Pure."""
    count = len(points)
    data = np.empty((23, count), dtype="<f4")
    data[:3], data[3] = points["pos"].T, points["length"]
    data.view("<i4")[4] = points["id"]
    index = 5
    for field in LANE_DETAILS:
        columns = detail[field].reshape(count, -1).T
        data[index:index + len(columns)] = columns
        index += len(columns)
    return data.tobytes()


@lru_cache(maxsize=2)
def _lane_snapshot(path, revision):
    """Read and encode the file once per recent revision so the status and data requests share it."""
    points, detail, _ = fastlane.read_lane(path)
    if _lane_revision(path.stat()) != revision:
        raise trackview.Unreadable(LANE_CHANGED)
    if not all(np.isfinite(records[field]).all() for records in (points, detail) for field in records.dtype.names):
        raise ValueError("The installed AI line contains invalid numbers.")
    return len(points), _encode_lane(points, detail)


def _lane_data(directory, revision=None):
    """Return the installed line's status, or its bytes if revision still matches the file in directory."""
    path = directory / fastlane.FILE
    try:
        current = _lane_revision(path.stat())
        if revision is not None and revision != current:
            raise trackview.Unreadable(LANE_CHANGED)
        count, data = _lane_snapshot(path, current)
        closed = mytracks.is_circuit(directory) if revision is None else None
        if _lane_revision(path.stat()) != current:
            raise trackview.Unreadable(LANE_CHANGED)
        if revision is not None:
            return data
        return {"status": "ready", "message": None, "closed": closed, "revision": current, "count": count}
    except (OSError, ValueError, trackview.Unreadable) as error:
        if revision is not None:
            raise trackview.Unreadable(LANE_CHANGED) from error
        if isinstance(error, FileNotFoundError):
            status, message = "missing", "No AI line is installed for this track."
        else:
            status = "invalid"
            message = "The installed AI line could not be read." if isinstance(error, OSError) else str(error)
        return {"status": status, "message": message, "closed": None, "revision": None, "count": 0}


@lru_cache(maxsize=1)
def _move_reference(model, circuit, revision):
    """Keep the automatic reference across pointer gestures on the same installed geometry."""
    inputs = fastlane.lane_inputs(model, circuit, lambda _: None, preview=True)
    reference, invalid = fastlane.preview_reference(model, inputs, circuit)
    return reference, invalid, fastlane._local_roads(inputs[2], free=True)


def _runout_guide(ref, wider):
    """Clickable extension of the finish direction up to the generator's normal runout distance."""
    points, _, _, _, _, route = ref
    if route.circuit:
        return []
    direction = fastlane._unit(route.path[-1]-route.path[-2])
    height = points["pos"][-1,1]
    tail = []
    for d in np.linspace(0, generator.RUNOUT_M, int(generator.RUNOUT_M/fastlane.SPACING)+1):
        x, z = route.path[-1] + d*direction
        levels = fastlane.obj_to_kn5.road_levels(wider(x,z,0),x,z)
        y = min(levels,key=lambda v: abs(v-height),default=height)
        tail.append([x,y,z,route.length+d,direction[1],-direction[0],0,0,0])
        height = y
    return tail


def _ink_preview(ref, wider, item, section):
    """Full-width check and road/off-road colours for a pencilled replacement. Pure."""
    points, _, ribbon, _, road, route = ref
    is_tail = "tail" in item
    if is_tail and (route.circuit or abs(item["end"]["metre"]-route.length) > fastlane.GRID_XZ_TOL):
        raise ValueError(f"Invalid runout endpoint at route metre {section.end:.1f}")
    inside = (ribbon.metres >= section.start) & (ribbon.metres <= section.end)
    fixed = inside & ribbon.fixed
    if is_tail:
        fixed &= ribbon.metres <= route.length
    if fixed.any() and np.any(np.linalg.norm(section.positions(ribbon.metres[fixed])[:,[0,2]]-
                                               points["pos"][fixed][:,[0,2]],axis=1) > fastlane.GRID_XZ_TOL):
        raise ValueError(f"Fixed AI line point at route metre {ribbon.metres[fixed][0]:.1f}")
    floor = wider if item["free"] else road
    xyz = fastlane._surface(section.metres, section.xyz[:,[0,2]],floor,section.xyz[0,1],False)
    fastlane.check_click_levels(section, xyz, route)
    if not item["free"]:
        stations = section.metres
        if route.circuit:
            stations = ribbon.metres[0] + (stations-ribbon.metres[0]) % route.length
        nearest = fastlane.nearest_stations(ribbon.metres, stations)
        fastlane.check_selected_road(xyz[:,fastlane.XZ], section.metres, ribbon, nearest,
                                     np.arange(1,len(xyz)))
    sides = fastlane._frame(xyz,False)[3]
    yellow = []
    for i in range(len(xyz)):
        previous = xyz[max(0,i-1)]
        m = section.metres[i]
        if (not fastlane._fits_chord(floor,previous,xyz[i],fastlane.FILLET_CLEARANCE)
                or min(fastlane._section(floor,xyz[i],sides[i],m)[:2]) < fastlane.FILLET_CLEARANCE):
            raise ValueError(f"Insufficient clearance at route metre {m:.1f}")
        yellow.append(item["free"] and not fastlane._fits_chord(road,previous,xyz[i],fastlane.FILLET_CLEARANCE))
    return np.column_stack((xyz,yellow)).tolist()


def _move_preview(model, body):
    """Editor-only guide and swept-width check. Never publishes a line."""
    files = [model, model.parent / fastlane.ROUTE, *map(Path, editorinfo.archives(model))]
    revision = tuple((path.name, _lane_revision(path.stat())) for path in files)
    circuit = mytracks.is_circuit(model.parent)
    ref, errors, wider = _move_reference(model, circuit, revision)
    points, detail, ribbon, _, road, route = ref
    if body.get("guide"):
        xyz = points["pos"].astype(float)
        side = fastlane._frame(xyz, circuit)[3]
        rows = np.column_stack((xyz, ribbon.metres, side[:, 0], side[:, 2], detail["left"], detail["right"], ribbon.fixed))
        return {"rows": rows.tolist(), "path": route.path.tolist(), "key": route.key, "errors": errors,
                "origin": route.origin, "closed": circuit, "length": route.length, "tail": _runout_guide(ref,wider)}
    items = body["aiCorrections"]
    if error := fastlane.aicorrections.problem(items):
        raise ValueError(error)
    ink, centres, ends, skipped, spans, moves = {}, {}, {}, {}, [], []
    for item in items:
        key = item["id"]
        try:
            centre, _ = route.resolve(item["anchor"])
            if item["kind"] == "redraw":
                part = fastlane.airedraw.resolve(item, route, fastlane.SPACING/2)
                start, end = part.start, part.end
            else:
                start,end = centre-item["range"], centre+item["range"]
            if any(start < b and end > a for a,b in spans):
                raise ValueError(f"Overlapping correction at route metre {centre:.1f}")
            if item["kind"] == "redraw":
                ink[key] = _ink_preview(ref,wider,item,part)
                ends[key] = end
            else:
                moves.append(item)
            spans.append((start,end))
            centres[key] = centre
        except ValueError as error:
            skipped[key] = str(error)
    (moved, mask, queries), rejected = fastlane.checked_moves(ref, moves, lambda *result: result, wider)
    skipped.update(rejected)
    record = ailinestate._record(model.parent)
    if record.get("skipped") and record.get("corrections") == items:
        if ailinestate.input_key(model, circuit) == record.get("inputs"):
            skipped.update(record["skipped"])
    yellow = [int(i) for i in np.flatnonzero(mask) if fastlane._query(queries,i) is wider and
              not fastlane._fits_chord(road,moved[i-1],moved[i],fastlane.FILLET_CLEARANCE)]
    return {"samples": np.column_stack((np.flatnonzero(mask), moved[mask])).tolist(), "ink": ink, "yellow": yellow,
            "skipped": skipped, "centres": centres, "ends": ends}


class EditorHandlers:
    """Track data, inspection and surface requests from the Editor."""

    def _editor(self, match):
        """The Editor tab's asking for a track's index, a mesh's or a texture's bytes (trackview)."""
        name, kind, i, revision = generator.slug(match[1]), match[2], match[3], match[4]
        ac = settings.ac_path()
        try:
            if kind == "mesh":
                moved = trackedits.moved_now(ac, name, revision)
                draft = int(self.path.split("&d=", 1)[1].split("&", 1)[0]) if "&d=" in self.path else None
                copy_revision = self.path.rsplit("&c=", 1)[1] if "&c=" in self.path else None
                self._send(200, trackview.mesh_bytes(ac, name, int(i), revision, moved, draft, copy_revision), "application/octet-stream")
            elif kind == "texture":
                paint = parse_qs(urlsplit(self.path).query).get("p", [""])[0]
                tex, data = trackview.texture_bytes(ac, name, int(i), revision, paint)
                self._send(200, data, IMAGE_TYPES.get(os.path.splitext(tex)[1].lower(), "application/octet-stream"))
            else:
                self._send(200, trackview.index(ac, name))
        except (trackview.NotOurs, IndexError):
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.ModelsChanged:
            self._send(409, {"error": "The models changed; refreshing their view"})
        except trackview.CopiesChanged:
            self._send(409, {"error": "The copied objects changed; refreshing their view"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})
        except ValueError as e:
            self._send(400, {"error": str(e)})
        except OSError as e:
            self._send(500, {"error": str(e)})
        except ConnectionError:             # (the page asked for another track meanwhile)
            pass

    def _ai_line(self, name, revision=None):
        """The spline accompanying the installed KN5 of track name, independent of its source and draft."""
        try:
            model = trackview.kn5_path(settings.ac_path(), generator.slug(name))
            data = _lane_data(Path(model).parent, revision)
            if revision is None:
                info = mytracks.load(Path(model).parent) or {}
                data["canCalculate"] = not bool(info.get("area"))
                if data["canCalculate"]:
                    try:
                        state = ailinestate.inspect(Path(model), mytracks.is_circuit(Path(model).parent))
                    except ailinestate.ERRORS:
                        state = ailinestate.status(Path(model).parent, None)
                    data["validity"] = state["status"]
                    if state.get("message"):
                        data["message"] = state["message"]
        except trackview.NotOurs:
            if revision is not None:
                return self._send(409, {"error": LANE_CHANGED})
            return self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            return self._send(409, {"error": LANE_CHANGED})
        if revision is None:
            self._send(200, data, headers={"Cache-Control": "no-store"})
        else:
            self._send(200, data, "application/octet-stream", headers={"Cache-Control": "private, max-age=31536000, immutable"})

    def _edits_answer(self, work):
        """The answer of work() on a track's edits: 200 with its result, or what went wrong."""
        try:
            self._send(200, work())
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except (trackedits.Invalid, ValueError) as e:
            self._send(400, {"error": str(e)})
        except (trackedits.Conflict, trackview.Unreadable):
            self._send(409, {"error": "The track or its changes changed: read them again"})
        except OSError as e:
            self._send(500, {"error": str(e)})

    def _treefx(self, name, model, texture):
        """A track's TreeFX trees as its draft leaves them, one of its models or an image of one, from its own folder."""
        ac, name = settings.ac_path(), generator.slug(name)
        if texture:
            try:
                return self._send(200, trackview.treefx_texture(ac, name, model, texture), "image/png")
            except trackview.NotOurs as error:
                return self._send(404, {"error": f"No such image of a tree model: {error}"})
        self._edits_answer(lambda: trackview.treefx_model(ac, name, model) if model else trackview.treefx(ac, name))

    def _surface(self, name):
        """Read-only selection of generated paint masks; source revision prevents mixing builds."""
        try:
            q = parse_qs(urlsplit(self.path).query, strict_parsing=True)
            if "points" in q:
                return self._edits_answer(lambda: trackview.surfaces(settings.ac_path(), generator.slug(name), json.loads(q["points"][0]), q["r"][0]))
            self._edits_answer(lambda: trackview.surface(settings.ac_path(), generator.slug(name), int(q["mesh"][0]),
                                                        float(q["u"][0]), float(q["v"][0]), q["r"][0], q.get("whole", ["0"])[0] == "1"))
        except (KeyError, ValueError, IndexError, TypeError) as e:
            self._send(400, {"error": str(e)})

    def _inspect(self, name, kind="inspect"):
        """Details are fetched for a selection, never included in a whole track's picking index."""
        try:
            q = parse_qs(urlsplit(self.path).query, strict_parsing=True)
            name, ac = generator.slug(name), settings.ac_path()
            if kind == "statistics":
                self._edits_answer(lambda: trackinspect.statistics(ac, name))
            elif kind == "thumbnail":
                self._send(200, trackinspect.thumbnail(ac, name, int(q["texture"][0]), q["r"][0], q.get("p", [""])[0]), "image/png")
            elif kind == "appearance":
                self._send(200, trackinspect.appearance(ac, name, int(q["mesh"][0]), float(q["u"][0]), float(q["v"][0]),
                                                      q["r"][0], q.get("p", [""])[0]))
            else:
                self._edits_answer(lambda: trackinspect.object_info(ac, name, q["id"][0], q["r"][0]))
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track changed: read it again"})
        except (KeyError, ValueError, IndexError, TypeError, OSError) as e:
            self._send(400, {"error": str(e)})

    def _prepare_surface(self, name):
        try:
            q = parse_qs(urlsplit(self.path).query, strict_parsing=True)
            meshes = [int(m) for m in q["mesh"]]
            self._edits_answer(lambda: trackview.prepare_surface(settings.ac_path(), generator.slug(name), meshes, q["r"][0]))
        except (KeyError, ValueError, IndexError) as e:
            self._send(400, {"error": str(e)})
