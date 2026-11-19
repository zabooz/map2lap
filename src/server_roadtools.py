"""Editor road-tool HTTP endpoints; Handler supplies response, request and same-page helpers."""
import math
import secrets

import generator
import numpy as np

from app import (builtroad, railbridges, roadbank, roadbend, roadnet, roadregion, roadseparation, settings, sidewalkcuts,
                 trackband, trackedits, trackheights, trackkerbs, trackstitch, tracksurfaces, trackview)


class RoadToolHandlers:
    """Height, kerb, stitch, crossing and roadside selection requests."""

    def _brush(self, name, under_way=False):
        """A stroke of the Editor's brush as a height change, with all of it looked at, loaded in the view or not: {"height": what the
        page puts into its draft, "standing": objects that stay where they stand}; under_way: the mouse still held, what it changes so far
        (trackedits.preview). Nothing is kept here. 409: it can't be applied, for the reason it says."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        ac = settings.ac_path()
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True    # (its body stays unread)
            return self._send(413, {"error": "This stroke is too long: make it in parts"})
        try:
            body = self._body()
            op = trackheights.brush(body.get("samples"), body.get("radius"), body.get("soft"), body.get("mm"), body.get("speed"), secrets.token_hex(8))
            path, scan, objects = trackedits.context(ac, generator.slug(name), body.get("base"))
            if under_way:
                return self._send(200, trackedits.preview(ac, generator.slug(name), body["base"], op), "application/octet-stream")
            trackedits.remember_meshes(ac, generator.slug(name), body["base"], op)
            self._send(200, {"height": op, "standing": trackheights.standing(path, scan, objects, op)})
        except (ValueError, AttributeError) as e:
            self._send(400, {"error": str(e)})
        except trackheights.InTheWay as e:
            self._send(409, {"error": str(e)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _kerb_way(self, name):
        """A mapped road range with source heights for one editable racing kerb."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True
            return self._send(413, {"error": "No kerb range"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            base = body.get("base")
            path, scan = trackview._scan_of(ac, name, base)
            width = body.get("width", 0.45)
            if type(width) not in (int, float) or not math.isfinite(width) or not trackkerbs.MIN_WIDTH_M <= width <= trackkerbs.MAX_WIDTH_M:
                raise ValueError("Kerb width must be 0.2–2.0 m")
            if body.get("mode") == "free":
                # A kerb drawn by hand, centred on its clicked line.
                line = trackkerbs.free_line(path, scan, body.get("points"), width, trackedits.moved_without(ac, name, base, None))
                return self._send(200, {"line": line, "side": "left", "centred": True, "road_ids": []})
            net = builtroad.pick(path, scan, body.get("points"), join_near=True)
            side = trackkerbs.side_of_click(net, body["points"][0])
            width = body.get("width", 0.45)
            if type(width) not in (int, float) or not math.isfinite(width) or not trackkerbs.MIN_WIDTH_M <= width <= trackkerbs.MAX_WIDTH_M:
                raise ValueError("Kerb width must be 0.2–2.0 m")
            line = trackkerbs.prepare(path, scan, None, net, side, width, trackedits.moved_without(ac, name, base, None))
            return self._send(200, {"line": line, "side": side,
                                    "road_ids": sorted({edge["road"] for edge in net["segments"] if edge.get("road")})})
        except (ValueError, trackband.Refused) as error:
            return self._send(400, {"error": str(error)})
        except (trackview.Unreadable, trackview.NotOurs) as error:
            return self._send(409, {"error": str(error)})

    def _stitch_way(self, name):
        """One Stitch road proposal between two road clicks: its draft descriptor and what the page previews."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True
            return self._send(413, {"error": "No stitch range"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            path, scan = trackview._scan_of(ac, name, body.get("base"))
            net = builtroad.pick(path, scan, body.get("points"), join_near=True)
            width = body.get("width")
            if width is not None and not (type(width) in (int, float) and math.isfinite(width)):
                raise ValueError("Stitch width must be a number")
            existing = body.get("existing") or []
            if wrong := trackstitch.problems(existing):
                raise ValueError(wrong)
            stitch, info = trackstitch.union(path, scan, net, width, existing)
            return self._send(200, {"stitch": stitch, **info})
        except (ValueError, trackband.Refused) as error:
            return self._send(400, {"error": str(error)})
        except (trackview.Unreadable, trackview.NotOurs) as error:
            return self._send(409, {"error": str(error)})

    def _band(self, name, what):
        """The Editor's smooth tool (trackband). what: "way": where the road goes between the page's points, {"line": [[x, y, z], ...], "width"};
        "preview": what its height change changes (trackedits.preview); None: that change, as _brush answers. 409: it can't be, for the
        reason it says."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True    # (its body stays unread)
            return self._send(413, {"error": "No band"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            base = body.get("base")
            path, scan = trackview._scan_of(ac, name, base)
            if "revision" in body and body["revision"] != trackedits.load(ac, name)["revision"]:
                return self._send(409, {"error": "The road edits changed: mark the road again"})
            if body.get("network"):
                # The click heights choose the road level built there, as in Bend road and Racing kerb.
                net = builtroad.pick(path, scan, body.get("points"))
                mapped_width = max(edge["width"] for edge in net["segments"])
                strip = body.get("strip")
                if strip is not None:
                    # Strip mode: a chosen width around the marked lines, as Stitch road (roadnet._strip_owns).
                    if type(strip) not in (int, float) or not math.isfinite(strip) or not 2 <= strip <= 40:
                        raise ValueError("Strip width must be 2–40 m")
                    net = {**net, "strip": float(strip)}
                    region = roadregion.strip_selection(path, net)
                else:
                    region = roadregion.selection(path, net)
                if what == "way":
                    lines = [[[x, 0., z] for x, z in line] for line in net["lines"]]
                    answer = {"lines": lines, "region": region, "width": round(mapped_width, 1)}
                    if body.get("preview") is True:
                        try:
                            moved = trackedits.moved_without(ac, name, base, body.get("replace"))
                            ideal, _ = roadnet.change_of(path, scan, moved, net, region, body.get("blend", 6), 1,
                                                          "preview", preview=True)
                            answer["difference"] = roadnet.signed_preview(ideal, region)
                        except (ValueError, trackband.Refused) as error:
                            answer["difference_error"] = str(error)
                    return self._send(200, answer)
                moved = trackedits.moved_without(ac, name, base, body.get("replace"))
                op, influence = roadnet.change_of(path, scan, moved, net, region, body.get("blend", 6), body.get("strength"), secrets.token_hex(8))
                trackedits.remember_meshes(ac, name, base, op, body.get("replace"))
                return self._send(200, {"height": op, "influence": influence,
                                       "standing": trackheights.standing(path, scan, trackview.list_of(path), op)})
            moved = trackedits.moved_without(ac, name, base, body.get("replace"))
            road = trackband.road_cells(path, base)
            if what == "way":
                line, width = trackband.way(road, body.get("points"))
                ys = trackband.road_heights(path, scan, moved, line)
                return self._send(200, {"line": np.c_[line[:, 0], ys, line[:, 1]].round(3).tolist(), "width": round(width, 1)})
            op = trackband.change_of(path, scan, moved, road, body.get("points"), body.get("width"), body.get("strength"), secrets.token_hex(8))
            if what == "preview":
                return self._send(200, trackedits.preview(ac, name, base, op), "application/octet-stream")
            trackedits.remember_meshes(ac, name, base, op)
            self._send(200, {"height": op, "standing": trackheights.standing(path, scan, trackview.list_of(path), op)})
        except (ValueError, AttributeError, TypeError) as e:
            self._send(400, {"error": str(e)})
        except (trackband.Refused, trackheights.InTheWay) as e:
            self._send(409, {"error": str(e)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _bend(self, name, what):
        """Mark or apply one signed height bend between two road points."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True
            return self._send(413, {"error": "Road selection is too large"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            base = body.get("base")
            path, scan = trackview._scan_of(ac, name, base)
            draft = trackedits.load(ac, name)
            if body.get("revision") != draft["revision"]:
                return self._send(409, {"error": "The road edits changed: mark A and B again"})
            points = body.get("points")
            if what == "way":
                net, _line = roadbend.describe(path, scan, points)
                matching = roadbend.matching(draft["heights"], net, points)
                moved = trackedits.moved_without(ac, name, base, [op["id"] for op in matching])
                gone = tracksurfaces.going(scan, draft.get("surfaces", []))
                return self._send(200, {"region": roadregion.selection(path, net),
                                        "replace": [op["id"] for op in matching],
                                        "delta": matching[-1]["bend"]["delta"] if matching else 0,
                                        "max_grade_percent": matching[-1]["bend"].get("max_grade_percent", 15) if matching else None,
                                        "blockers": roadbend.blockers(path, scan, moved, points, gone)})
            moved = trackedits.moved_without(ac, name, base, body.get("replace"))
            op = roadbend.change_of(path, scan, moved, points, body.get("delta"), secrets.token_hex(8),
                                    tracksurfaces.going(scan, draft.get("surfaces", [])), body.get("max_grade_percent", 15))
            trackedits.remember_meshes(ac, name, base, op, body.get("replace"))
            self._send(200, {"height": op})
        except (ValueError, AttributeError, TypeError, trackband.Refused, trackheights.InTheWay) as error:
            self._send(409, {"error": str(error)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _bank(self, name, what):
        """Bank road. what "way": the marked road's region, its cross slope now ({min, mean, max} m per m, left of A->B
        up), its length, an earlier bank on it to resume and the railway or tunnel parts in reach; else one bank to the
        body's target, replacing the body's earlier ones: {"height"}. 409: refused, for the reason it says."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True
            return self._send(413, {"error": "Road selection is too large"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            base = body.get("base")
            path, scan = trackview._scan_of(ac, name, base)
            draft = trackedits.load(ac, name)
            if body.get("revision") != draft["revision"]:
                return self._send(409, {"error": "The road edits changed: mark A and B again"})
            points = body.get("points")
            gone = tracksurfaces.going(scan, draft.get("surfaces", []))
            if what == "way":
                net, line = roadbank.describe(path, scan, points)
                matching = roadbank.matching(draft["heights"], net, points)
                moved = trackedits.moved_without(ac, name, base, [op["id"] for op in matching])
                slope = roadbank.current(path, scan, moved, net, line)[:, 1]
                return self._send(200, {"region": roadregion.selection(path, net), "replace": [op["id"] for op in matching],
                                        "target": matching[-1]["bank"]["target"] if matching else None,
                                        "current": {"min": float(slope.min()), "mean": float(slope.mean()), "max": float(slope.max())},
                                        "length": float(roadseparation._stations(line)[-1]),
                                        "blockers": roadbank.blockers(path, scan, moved, net, line, gone)})
            moved = trackedits.moved_without(ac, name, base, body.get("replace"))
            op = roadbank.change_of(path, scan, moved, points, body.get("target"), secrets.token_hex(8), gone)
            trackedits.remember_meshes(ac, name, base, op, body.get("replace"))
            self._send(200, {"height": op})
        except (ValueError, AttributeError, TypeError, trackband.Refused, trackheights.InTheWay) as error:
            self._send(409, {"error": str(error)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _separate(self, name, what):
        """Measure or correct a mapped bridge and the ground road beneath it."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can change a track"})
        if int(self.headers.get("Content-Length") or 0) > trackedits.MAX_BYTES:
            self.close_connection = True
            return self._send(413, {"error": "Road selection is too large"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            base = body.get("base")
            path, scan = trackview._scan_of(ac, name, base)
            draft = trackedits.load(ac, name)
            if body.get("revision") != draft["revision"]:
                return self._send(409, {"error": "The road edits changed: mark the crossing again"})
            rail = body.get("kind") == "rail"
            if what == "way":
                moved = trackedits.moved_without(ac, name, base, None)
                describe = railbridges.describe if rail else roadseparation.describe
                upper, lower, above, below, crossings = describe(path, scan, moved, body.get("points"))
                matching = roadseparation.matching(path, scan, moved, draft["heights"], upper, crossings,
                                                    describe, "rail" if rail else "road", "lower" if lower.get("selected") else "upper")
                replace = [op["id"] for op in matching]
                baseline = trackedits.moved_without(ac, name, base, replace) if replace else moved
                base_crossings = describe(path, scan, baseline, body.get("points"))[-1] if replace else crossings
                blockers = [] if rail else roadseparation.blockers(path, scan, moved, upper, lower, above, below, crossings,
                                                                    tracksurfaces.going(scan, draft.get("surfaces", [])))
                common = {"crossings": crossings, "replace": replace,
                          "blockers": blockers,
                          "selected_side": "lower" if lower.get("selected") else "upper",
                          "min_gap": (min if len(body.get("points")) == 2 else max)(c["gap"] for c in base_crossings),
                          "max_grade_percent": matching[-1]["separation"].get("max_grade_percent", 2 if rail else 15) if matching else None}
                if rail:
                    selection, _cuts = railbridges.selection(path, scan, [crossings[0]["x"], crossings[0]["z"]])
                    return self._send(200, {**common, "upper_region": selection, "lower_region": None})
                if lower.get("selected"):
                    return self._send(200, {**common, "upper_region": None, "lower_region": roadregion.selection(path, lower)})
                return self._send(200, {**common, "upper_region": roadregion.selection(path, upper),
                                        "lower_region": roadregion.selection(path, lower) if len(body.get("points")) == 4 else None})
            moved = trackedits.moved_without(ac, name, base, body.get("replace"))
            if rail:
                op, crossings = railbridges.change_of(path, scan, moved, body.get("points"), body.get("gap"), secrets.token_hex(8),
                                                       body.get("max_grade_percent", 2))
            else:
                op, crossings = roadseparation.change_of(path, scan, moved, body.get("points"), body.get("gap"),
                                                           body.get("upper_percent", 100), secrets.token_hex(8),
                                                           tracksurfaces.going(scan, draft.get("surfaces", [])),
                                                           body.get("max_grade_percent", 15))
            trackedits.remember_meshes(ac, name, base, op, body.get("replace"))
            return self._send(200, {"height": op, "crossings": crossings})
        except (ValueError, AttributeError, TypeError, trackband.Refused, trackheights.InTheWay) as error:
            self._send(409, {"error": str(error)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _railbridge(self, name):
        """Select one mapped railway bridge, including its physical mesh faces."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can select a railway bridge"})
        if int(self.headers.get("Content-Length") or 0) > 4096:
            self.close_connection = True
            return self._send(413, {"error": "Railway bridge selection is too large"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            path, scan = trackview._scan_of(ac, name, body.get("base"))
            # Face numbers belong to the source KN5 (base), not to the changing draft revision.
            # A quick second Delete can arrive while the first one's draft PUT is being saved.
            selection, cuts = railbridges.selection(path, scan, body.get("point"))
            return self._send(200, {"selection": selection, "cuts": cuts})
        except (ValueError, AttributeError, TypeError) as error:
            self._send(409, {"error": str(error)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})

    def _sidewalk(self, name):
        """Select one sidewalk or guardrail section with its visible and collision faces."""
        if not self._own_page():
            return self._send(403, {"error": "Only the page itself can select a sidewalk"})
        if int(self.headers.get("Content-Length") or 0) > 4096:
            self.close_connection = True
            return self._send(413, {"error": "Sidewalk selection is too large"})
        ac, name = settings.ac_path(), generator.slug(name)
        try:
            body = self._body()
            path, scan = trackview._scan_of(ac, name, body.get("base"))
            selection, cuts, objects = sidewalkcuts.selection(path, scan, body.get("point"), body.get("mesh"))
            return self._send(200, {"selection": selection, "cuts": cuts, "objects": objects})
        except (ValueError, AttributeError, TypeError) as error:
            self._send(409, {"error": str(error)})
        except trackview.NotOurs:
            self._send(404, {"error": "This track has no track file (build it again)"})
        except trackview.Unreadable:
            self._send(409, {"error": "The track file is being written or has changed: try again when the build is done"})
