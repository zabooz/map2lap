"""Editor data HTTP endpoints; Handler supplies response, request and same-page helpers."""
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import generator
import numpy as np
from app import mytracks, settings, trackedits, trackinspect, trackview
from track import fastlane

IMAGE_TYPES = {".dds": "image/vnd-ms.dds", ".png": "image/png", ".jpg": "image/jpeg"}


def _lane_data(directory):
    """Read the installed AI line in directory and identify the file revision that was read."""
    path = directory / fastlane.FILE
    try:
        before = path.stat()
        points, detail, _ = fastlane.read_lane(path)
        after = path.stat()
    except FileNotFoundError:
        return {"status": "missing", "message": "No AI line is installed for this track."}
    except (OSError, ValueError):
        return {"status": "invalid", "message": "The installed AI line could not be read."}
    if (before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns):
        return {"status": "invalid", "message": "The AI line changed while loading. Reopen the tool to try again."}
    if not all(np.isfinite(records[field]).all() for records in (points, detail) for field in records.dtype.names):
        return {"status": "invalid", "message": "The installed AI line contains invalid numbers."}

    columns = {"position": points["pos"], "distance": points["length"], "id": points["id"]}
    columns.update(("segment_length" if field == "length" else field, detail[field]) for field in detail.dtype.names)
    return {"status": "ready", "closed": mytracks.is_circuit(directory), "revision": str(after.st_mtime_ns),
            "points": [dict(zip(columns, row)) for row in zip(*(column.tolist() for column in columns.values()))]}


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

    def _ai_line(self, name):
        """The spline accompanying the installed KN5 of track name, independent of its source and draft."""
        try:
            model = trackview.kn5_path(settings.ac_path(), generator.slug(name))
        except trackview.NotOurs:
            return self._send(404, {"error": "This track has no track file (build it again)"})
        self._send(200, _lane_data(Path(model).parent), headers={"Cache-Control": "no-store"})

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
