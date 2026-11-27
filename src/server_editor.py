"""Editor data HTTP endpoints; Handler supplies response, request and same-page helpers."""
from contextlib import contextmanager
import json
import os
import struct
from functools import lru_cache
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import generator
import numpy as np
from app import lanerecording, ailanejobs, mytracks, settings, trackedits, trackinspect, trackview
from track import ailinestate, aimargins, editorinfo, fastlane, route_race

IMAGE_TYPES = {".dds": "image/vnd-ms.dds", ".png": "image/png", ".jpg": "image/jpeg"}
LANE_CHANGED = "The installed AI line changed. Reopen the tool to load its current revision."
LANE_DETAILS = ("speed", "gas", "brake", "lat_g", "radius", "left", "right", "camber", "direction",
                "normal", "length", "forward", "tag", "grade")


@contextmanager
def _installed_lane(name):
    """Read one installed lane and recipe together, including across Save's folder swap."""
    ac = settings.ac_path()
    slot = ailanejobs.track(Path(ac, "content", "tracks", name, name + ".kn5"))
    with slot.condition:
        slot.condition.wait_for(lambda: not slot.writing)
        yield Path(trackview.kn5_path(ac, name))


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
    return points["pos"][:, [0, 2]], detail["speed"].copy(), _encode_lane(points, detail)


def _timed_speeds(xz, speed, markers):
    """Range in m/s between both forward gate crossings, including interpolated endpoints. Pure."""
    prefix = "AC" if all(k in markers for k in route_race.GATES) else "M2"
    indices = np.arange(len(xz))
    try:
        start = fastlane._gate(xz, indices, markers, f"{prefix}_AB_START")
        finish = fastlane._gate(xz, indices, markers, f"{prefix}_AB_FINISH", last=True)
    except (KeyError, fastlane.NoLine):
        return None      # A foreign or hand-replaced spline can miss a timing gate.
    if finish <= start:
        return None
    timed = np.r_[np.interp([start, finish], indices, speed), speed[int(np.ceil(start)):int(np.ceil(finish))]]
    return [float(timed.min()), float(timed.max())]


def _lane_data(model, revision=None, path=None):
    """Return the installed line's status, or its bytes if revision still matches the file in directory."""
    directory = model.parent
    path = path or directory / fastlane.FILE
    try:
        current = _lane_revision(path.stat())
        if revision is not None and revision != current:
            raise trackview.Unreadable(LANE_CHANGED)
        xz, speed, data = _lane_snapshot(path, current)
        closed = mytracks.is_circuit(directory) if revision is None else None
        if _lane_revision(path.stat()) != current:
            raise trackview.Unreadable(LANE_CHANGED)
        if revision is not None:
            return data
        status = {"status": "ready", "message": None, "closed": closed, "revision": current, "count": len(xz)}
        if not closed:
            try:
                markers = trackview._scan(str(model), trackview._revision(model.stat()))["points"]
            except (AssertionError, OSError, ValueError, struct.error):
                markers = {}
            status["speedRange"] = _timed_speeds(xz, speed, markers)
        return status
    except (OSError, ValueError, trackview.Unreadable) as error:
        if revision is not None:
            raise trackview.Unreadable(LANE_CHANGED) from error
        if isinstance(error, FileNotFoundError):
            status, message = "missing", "No AI line is installed for this track."
        else:
            status = "invalid"
            message = "The installed AI line could not be read." if isinstance(error, OSError) else str(error)
        return {"status": status, "message": message, "closed": None, "revision": None, "count": 0}


class _PreviewBand:
    """Reuse the reference cross-sections and mapped road facts between pointer events."""

    def __init__(self, reference, mapped, sections):
        points, _, ribbon, _, road, route = reference
        xyz = points["pos"].astype(float)
        side = fastlane._frame(xyz, route.circuit)[3]
        self.band = fastlane._band_widths(xyz[:,fastlane.XZ], side[:,fastlane.XZ], ribbon)
        self.painted = fastlane._painted_widths(xyz[:, fastlane.XZ], side[:, fastlane.XZ], ribbon.painted)
        self.mapped = mapped
        self.ribbon = ribbon
        self.areas = fastlane.obj_to_kn5._junction_geometry(mapped)[0]
        self.junctions = fastlane._in_junctions(xyz[:,fastlane.XZ], self.areas)
        self.closed = route.circuit
        if sections:
            self.reference, measured = sections[0]
            self.physical = measured[:, :2]
        else:
            self.reference = xyz
            # A diagnostic guide can have holes. Its other road widths still bound nearby junction openings.
            self.physical = np.zeros((len(xyz), 2))
            limits = fastlane._junction_limits(self.band, self.junctions, np.isfinite(ribbon.half_width), self.closed)
            for i, point in enumerate(xyz):
                try:
                    self.physical[i] = fastlane._section(road, point, side[i], ribbon.metres[i], limits=limits[i])[:2]
                except fastlane.NoLine:
                    continue


    def limits(self, xyz, indices, source, side, free):
        """Search limits at edited stations and at their adjoining junctions. Pure."""
        pts = xyz[indices]
        xz = pts[:,fastlane.XZ]
        owners = source[indices]
        route = self.ribbon
        local = route._replace(start=route.start[owners], end=route.end[owners], half_width=route.half_width[owners])
        band = self.band[source]
        band[indices] = fastlane._band_widths(xz, side[indices][:,fastlane.XZ], local)
        junctions = self.junctions[source]
        junctions[indices] = fastlane._in_junctions(xz, self.areas)
        limits = fastlane._junction_limits(band, junctions, np.isfinite(route.half_width[source]), self.closed)
        limits[indices[free]] = np.inf
        return limits, junctions

    def rows(self, xyz, indices, source, sections, yellow, side, limits, junctions, free):
        """XYZ, colour flag and banked edges of the same owned legs used during export."""
        pts = xyz[indices]
        physical = self.physical[source]
        physical[indices] = sections[:, :2]
        painted = self.painted[source]
        owners = source[indices]
        painted[indices] = fastlane._painted_widths(pts[:, fastlane.XZ], side[indices][:, fastlane.XZ],
                                                     tuple(value[owners] for value in self.ribbon.painted))
        allowed = np.zeros(len(xyz), dtype=bool)
        allowed[indices] = free
        painted = fastlane._free_paint(xyz, side[:, fastlane.XZ], allowed, self.mapped, painted, physical, self.closed)
        widths = fastlane._export_widths(physical, limits, painted, junctions, self.closed)[indices]
        transverse = side[indices] + sections[:,2,None]*fastlane.UP
        return np.column_stack((pts, yellow, pts + transverse*widths[:,0,None], pts - transverse*widths[:,1,None]))


@lru_cache(maxsize=1)
def _move_reference(model, circuit, revision, source=None):
    """Keep the automatic reference across pointer gestures on the same installed geometry."""
    if source:
        inputs, reference, measured = lanerecording.editing(model, source)
        sections, invalid = [(reference[0]["pos"], measured)], {}
    else:
        inputs = fastlane.lane_inputs(model, circuit, lambda _: None, preview=True)
        sections = []
        reference, invalid = fastlane.preview_reference(model, inputs, circuit, preview_sections=sections)
    band = _PreviewBand(reference, inputs[3], sections)
    return reference, invalid, fastlane._local_roads(inputs[2], free=True), band


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


def _ink_preview(ref, wider, item, section, band):
    """Full-width check and road/off-road colours for a pencilled replacement. Pure."""
    points, _, ribbon, _, road, route = ref
    if route.circuit and section.start < ribbon.metres[0]:
        section.start += route.length
        section.end += route.length
        section.metres += route.length
    is_tail = "tail" in item
    if is_tail and (route.circuit or abs(item["end"]["metre"]-route.length) > fastlane.GRID_XZ_TOL):
        raise ValueError(f"Invalid runout endpoint at route metre {section.end:.1f}")
    inside = (ribbon.metres >= section.start) & (ribbon.metres <= section.end)
    fixed = inside & ribbon.hard
    if is_tail:
        # The saved route may continue along the runout beyond the finish gate.
        fixed &= ribbon.metres <= ribbon.finish + fastlane.GRID_XZ_TOL
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
    # Include the adjoining chords for endpoint tangents and the rest of the lap for junction interpolation.
    before = np.flatnonzero(ribbon.metres < section.start)
    after = np.flatnonzero(ribbon.metres > section.end)
    joins, changed = fastlane.airedraw.join_approaches(
        band.reference[:,fastlane.XZ], ribbon.metres, ribbon.hard, [section],
        2*fastlane.CURVE_HALF_WINDOW, fastlane.GRID_XZ_TOL)
    outside = points["pos"].astype(float)
    for i in np.flatnonzero(changed):
        x,z = joins[i]
        levels = fastlane.obj_to_kn5.road_levels(road(x,z,0), x, z)
        y = min(levels, key=lambda h: abs(h-band.reference[i,1]), default=np.inf)
        if abs(y-band.reference[i,1]) >= fastlane.obj_to_kn5.LEVEL_GAP_M:
            raise ValueError(f"No driveable approach at route metre {ribbon.metres[i]:.1f}")
        outside[i] = [x,y,z]
    full = np.vstack((outside[before], xyz, outside[after]))
    indices = len(before) + np.arange(len(xyz))
    source = np.r_[before, fastlane.nearest_stations(ribbon.metres, section.metres), after]
    metres = np.r_[ribbon.metres[before], section.metres, ribbon.metres[after]]
    fastlane.check_splits(full, ribbon.splits, route.circuit)
    sides = fastlane._frame(full,route.circuit)[3]
    edited = np.r_[changed[before], np.ones(len(xyz),bool), changed[after]]
    fastlane.aicorrections.check_centreline(full, metres, edited, route.circuit, fastlane.obj_to_kn5.LEVEL_GAP_M)
    dirty = edited.copy()
    dirty[1:] |= edited[:-1]
    dirty[:-1] |= edited[1:]
    if route.circuit:
        dirty[[0,-1]] |= edited[[-1,0]]
    measured = np.flatnonzero(dirty)
    free = item["free"] & np.isin(measured, indices)
    limits, junctions = band.limits(full, measured, source, sides, free)
    sections, yellow = [], []
    for i in measured:
        authored = indices[0] <= i <= indices[-1]
        query = floor if authored else road
        previous = full[i-1] if i or route.circuit else full[i]
        measure = fastlane._section(query, full[i], sides[i], metres[i],
                                    limits=np.maximum(limits[i], fastlane.FILLET_CLEARANCE))
        sections.append(measure)
        if (edited[i] and (not fastlane._fits_chord(query,previous,full[i],fastlane.FILLET_CLEARANCE)
                           or min(measure[:2]) < fastlane.FILLET_CLEARANCE)):
            raise ValueError(f"Insufficient clearance at route metre {metres[i]:.1f}")
        yellow.append(authored and item["free"] and
                      not fastlane._fits_chord(road,previous,full[i],fastlane.FILLET_CLEARANCE))
    rows = band.rows(full, measured, source, np.asarray(sections), yellow, sides, limits, junctions, free)
    return rows[np.searchsorted(measured, indices)].tolist()


def _check_margin_revision(lane, revision):
    """Refuse fractions for a different spline than the one shown in the requesting editor."""
    if revision is None:
        return
    try:
        current = _lane_revision(lane.stat())
    except FileNotFoundError:
        current = None
    if revision != current:
        raise trackview.Unreadable(LANE_CHANGED)


def _margin_preview(model, body):
    """Return the draft's AI hint zones as fractions of the installed AI line."""
    margins = body.get("aiMargins") if isinstance(body, dict) else None
    if error := aimargins.problem(margins):
        raise ValueError(error)
    source, revision = body.get("source"), body.get("revision")
    folder = lanerecording.original(model.parent) if source == "original" else model.parent
    recorded = source and source != "original"
    lane = folder / fastlane.FILE
    if recorded:
        file = body.get("file")
        lane = lanerecording.prepared_path(file) if file else lanerecording.path(model, source)
    _check_margin_revision(lane, revision)
    circuit = mytracks.is_circuit(model.parent)
    if recorded:
        metres, gaps = lanerecording.route_alignment(folder, lane)
        native = None
        if file:
            ready = lanerecording.prepare(model, source, body.get("aiCorrections", []))
            if ready["file"] != file:
                raise trackview.Unreadable(LANE_CHANGED)
            native = lanerecording.editing(model, source)[1][5], ready["stations"]
        result, profile = ailinestate._render(folder, lane, circuit, margins, {}, metres, "recorded", gaps, native=native)
        if native:
            metres = native[1]
        preview = ailinestate.preview_fields(result, profile)
    else:
        preview = ailinestate.margin_preview(folder, circuit, margins)
    if preview["unplaced"]:
        # The Editor can project these guide marks for display. Only checksum-bound
        # sample metres can place a margin in the exported INI.
        route = ailinestate._route(model.parent, circuit)
        preview["guideMarks"] = {}
        for margin in margins:
            marks = preview["guideMarks"][margin["id"]] = {}
            for key in ("start", "end"):
                try:
                    if route is None:
                        raise ValueError("Saved route unavailable")
                    marks[key] = list(route.resolve(margin[key]))
                except ValueError as error:
                    marks["error"] = str(error)
    if body.get("withMetres") is True:
        # Redraw can resample the installed spline independently of the automatic editing guide.
        if not recorded:
            metres = ailinestate.lane_metres(folder, lane)
        preview["metres"] = None if metres is None else metres.tolist()
    _check_margin_revision(lane, revision)  # A hand replacement can happen outside the Save/worker lock.
    return preview


def _stored_controls(item, route):
    """Locate rejected clicks on a copy when a saved road anchor no longer resolves. Pure."""
    local = fastlane.airedraw.local_points
    origin = item["anchor"]["origin"]
    def endpoint(anchor):
        context = np.asarray(anchor["context"])
        heading = context[-1] - context[0]
        norm = np.linalg.norm(heading)
        if norm:
            heading = heading / norm
        x, z = context[1] + heading * anchor.get("along", 0) + heading[::-1] * [1, -1] * anchor.get("lateral", 0)
        return local([[x, anchor["level"], z]], anchor["origin"], route.origin)[0]
    end = local([item["tail"]], origin, route.origin)[0] if "tail" in item else endpoint(item["end"])
    return np.asarray([endpoint(item["anchor"]), *local(item["points"], origin, route.origin), end]).tolist()


def _move_preview(model, body):
    """Editor-only guide and swept-width check. Never publishes a line."""
    files = [model, model.parent / fastlane.ROUTE, *map(Path, editorinfo.archives(model))]
    revision = tuple((path.name, _lane_revision(path.stat())) for path in files)
    circuit = mytracks.is_circuit(model.parent)
    ref, errors, wider, band = _move_reference(model, circuit, revision, body.get("source"))
    points, detail, ribbon, _, road, route = ref
    if body.get("guide"):
        xyz = points["pos"].astype(float)
        side = fastlane._frame(xyz, circuit)[3]
        rows = np.column_stack((xyz, ribbon.metres, side[:, 0], side[:, 2], detail["left"], detail["right"], ribbon.hard))
        return {"rows": rows.tolist(), "path": route.path.tolist(), "key": route.key, "errors": errors,
                "origin": route.origin, "closed": circuit, "length": route.length, "tail": _runout_guide(ref,wider)}
    items = body["aiCorrections"]
    if error := fastlane.aicorrections.problem(items):
        raise ValueError(error)
    ink, centres, ends, skipped, spans, moves = {}, {}, {}, {}, [], []
    controls, to_stored = {}, {}
    for item in items:
        key = item["id"]
        try:
            if item["kind"] == "redraw":
                origin = item["anchor"]["origin"]
                if origin != route.origin:
                    # Ground hits are in the copy's frame. Send the affine map back to the
                    # recipe frame so editing one click preserves every untouched coordinate.
                    basis = fastlane.airedraw.local_points(np.vstack((np.zeros(3), np.eye(3))), route.origin, origin)
                    basis[1:] -= basis[0]
                    to_stored[key] = basis.tolist()
                try:
                    resolved = fastlane.airedraw.control_points(item, route)
                except ValueError:
                    controls[key] = _stored_controls(item, route)
                    raise
                controls[key] = np.asarray(resolved[-1]).tolist()
                part = fastlane.airedraw.resolve(item, route, fastlane.SPACING/2, resolved)
                centre = part.start - item["anchor"].get("after", 0)
                start, end = part.start, part.end
            else:
                centre, _ = route.resolve(item["anchor"])
                start,end = centre-item["range"], centre+item["range"]
            if any(start < b and end > a for a,b in spans):
                raise ValueError(f"Overlapping correction at route metre {centre:.1f}")
            if item["kind"] == "redraw":
                ink[key] = _ink_preview(ref,wider,item,part,band)
                ends[key] = end
            else:
                moves.append(item)
            spans.append((start,end))
            centres[key] = centre
        except ValueError as error:
            skipped[key] = str(error)
    measured = {}
    def preview(moved, mask, queries):
        yellow = [int(i) for i in np.flatnonzero(mask) if fastlane._query(queries,i) is wider and
                  not fastlane._fits_chord(road,moved[i-1],moved[i],fastlane.FILLET_CLEARANCE)]
        indices = np.flatnonzero(mask)
        samples = []
        if len(indices):
            sides = fastlane._frame(moved, circuit)[3]
            fastlane.aicorrections.check_centreline(moved, ribbon.metres, mask, circuit, fastlane.obj_to_kn5.LEVEL_GAP_M)
            source = np.arange(len(moved))
            free = np.array([fastlane._query(queries,i) is wider for i in indices])
            limits, junctions = band.limits(moved, indices, source, sides, free)
            rows = band.rows(moved, indices, source, np.array([measured[i] for i in indices]),
                             np.isin(indices,yellow), sides, limits, junctions, free)
            samples = np.column_stack((indices,rows)).tolist()
        return samples, yellow

    (samples, yellow), rejected = fastlane.checked_moves(ref, moves, preview, wider, measured, band.areas)
    skipped.update(rejected)
    record = ailinestate._record(model.parent)
    if record.get("skipped") and record.get("corrections") == items:
        if ailinestate.input_key(model, circuit) == record.get("inputs"):
            skipped.update(record["skipped"])
    return {"samples": samples, "ink": ink, "controls": controls, "toStored": to_stored, "yellow": yellow,
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

    def _ai_line(self, name, revision=None, source=None, prepared=False):
        """The spline accompanying the installed KN5 of track name, independent of its source and draft."""
        try:
            with _installed_lane(generator.slug(name)) as model:
                path = None
                if prepared:
                    path = lanerecording.prepared_path(source)
                elif source and source == ailinestate.recorded_key(model.parent):
                    path = model.parent / fastlane.FILE
                elif source:
                    path = (lanerecording.original(model.parent) / fastlane.FILE if source == "original"
                            else lanerecording.path(model, source))
                data = _lane_data(model, revision, path)
                if revision is None:
                    info = mytracks.load(model.parent) or {}
                    data["canCalculate"] = not bool(info.get("area"))
                    if data["canCalculate"]:
                        circuit = mytracks.is_circuit(model.parent)
                        data["hints"] = ailinestate.hints_state(model.parent, circuit)
                        try:
                            state = ailinestate.inspect(model, circuit)
                        except ailinestate.ERRORS:
                            state = ailinestate.status(model.parent, None)
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
