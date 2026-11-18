"""Library HTTP endpoints; Handler supplies response, request and same-page helpers."""
import re
import threading
from urllib.parse import parse_qs, urlsplit

from app import materiallibrary, modeldata, objectlibrary

MATERIAL_UPLOADS = threading.BoundedSemaphore(2)  # Bound queued input buffers as well as serialized image preparation.


class LibraryHandlers:
    """Material, model and group requests from the generator page."""

    def _library(self):
        """Material summaries, small previews and bounded same-page imports; no absolute file paths enter a request."""
        path = urlsplit(self.path)
        try:
            q = parse_qs(path.query)
            if path.path == "/api/library/groups" or path.path.startswith("/api/library/groups/"):
                from app import grouplibrary
                if self.command == "GET" and path.path == "/api/library/groups":
                    return self._send(200, grouplibrary.listing())
                if not self._own_page("application/json"):
                    return self._send(403, {"error": "Only the page itself can change groups"})
                if not 0 < int(self.headers.get("Content-Length", 0)) <= 32768:
                    self.close_connection = True
                    return self._send(413, {"error": "Too many group settings"})
                body = self._body()
                if path.path == "/api/library/groups":
                    return self._send(200, {"group": grouplibrary.save(body)})
                deleting = re.fullmatch(r"/api/library/groups/([a-f0-9]{32})/delete", path.path)
                if deleting:
                    return self._send(200, {"deleted": grouplibrary.remove(deleting[1])})
                return self._send(404, {"error": "No group here"})
            if (path.path in ("/api/library/models", "/api/library/model-imports")
                    or path.path.startswith(("/api/library/models/", "/api/library/model-imports/"))):
                if self.command == "GET":
                    prepared = re.fullmatch(r"/api/library/model-imports/([a-f0-9]{64})/(preview|info)", path.path)
                    if prepared:
                        args = (prepared[1], q.get('material_colours', ['linear'])[0], q.get('material_lighting', ['model'])[0],
                                int(q.get('texture_side', ['1024'])[0]), int(q.get('simplify_level', ['100'])[0]))
                        if prepared[2] == 'info':
                            return self._send(200, objectlibrary.prepared_info(*args))
                        return self._send(200, objectlibrary.prepared_model(*args), "model/gltf-binary")
                    if path.path == "/api/library/models":
                        return self._send(200, objectlibrary.listing(q.get("q", [""])[0], q.get("category", [""])[0],
                            int(q.get("offset", ["0"])[0]), int(q.get("limit", ["40"])[0])))
                    description = re.fullmatch(r"/api/library/models/([a-f0-9]{64})", path.path)
                    if description:
                        return self._send(200, objectlibrary.get(description[1]))
                    original = re.fullmatch(r"/api/library/models/([a-f0-9]{64})/original", path.path)
                    if original:
                        return self._send(200, objectlibrary.original(original[1]), "model/gltf-binary")
                    cost = re.fullmatch(r"/api/library/models/([a-f0-9]{64})/cost", path.path)
                    if cost:
                        return self._send(200, objectlibrary.cost(cost[1]))
                    return self._send(404, {"error": "No model here"})
                if (deleting := re.fullmatch(r"/api/library/models/([a-f0-9]{64})/delete", path.path)):
                    if not self._own_page("application/json"):
                        return self._send(403, {"error": "Only the page itself can delete a model"})
                    if int(self.headers.get("Content-Length", 0)) > 4096:
                        return self._send(413, {"error": "Too many model settings"})
                    self._body()
                    return self._send(200, {"deleted": objectlibrary.remove(deleting[1])})
                upload = path.path == "/api/library/model-imports"
                if not self._own_page("application/x-map2lap-glb" if upload else "application/json"):
                    return self._send(403, {"error": "Only the page itself can import a model"})
                size = int(self.headers.get("Content-Length", 0))
                if not 0 < size <= (modeldata.MAX_BYTES if upload else 16384):
                    return self._send(413, {"error": "Choose a model up to 128 MB" if upload else "Too many model settings"})
                if upload:
                    if not MATERIAL_UPLOADS.acquire(blocking=False):
                        return self._send(429, {"error": "Another asset is being prepared"})
                    try:
                        raw = self.rfile.read(size)
                        if len(raw) != size:
                            raise ValueError("The model upload was interrupted")
                        return self._send(200, objectlibrary.prepare(q["filename"][0], raw))
                    finally:
                        MATERIAL_UPLOADS.release()
                return self._send(200, objectlibrary.add(self._body()))
            if self.command == "GET":
                if path.path == "/api/library/materials":
                    return self._send(200, materiallibrary.listing(q.get("q", [""])[0], q.get("category", [""])[0],
                                      int(q.get("offset", ["0"])[0]), int(q.get("limit", ["40"])[0])))
                preview = re.fullmatch(r"/api/library/(materials|imports)/([a-f0-9]{64})/preview", path.path)
                if preview:
                    return self._send(200, materiallibrary.preview(preview[2], preview[1] == "imports"), "image/png")
                material = re.fullmatch(r"/api/library/materials/([a-f0-9]{64})", path.path)
                if material:
                    return self._send(200, materiallibrary.get(material[1]))
            elif (deleting := re.fullmatch(r"/api/library/materials/([a-f0-9]{64})/delete", path.path)):
                if not self._own_page("application/json"):
                    return self._send(403, {"error": "Only the page itself can delete a texture"})
                if int(self.headers.get("Content-Length", 0)) > 4096:
                    return self._send(413, {"error": "Too many texture settings"})
                self._body()
                return self._send(200, {"deleted": materiallibrary.remove(deleting[1])})
            elif path.path in ("/api/library/imports", "/api/library/materials"):
                upload = path.path.endswith("/imports")
                if not self._own_page("application/x-map2lap-image" if upload else "application/json"):
                    return self._send(403, {"error": "Only the page itself can import a material"})
                size = int(self.headers.get("Content-Length", 0))
                if not 0 < size <= (materiallibrary.MAX_BYTES if upload else 16384):
                    return self._send(413, {"error": "Choose an image up to 64 MB" if upload else "Too many material settings"})
                if upload:
                    if not MATERIAL_UPLOADS.acquire(blocking=False):
                        return self._send(429, {"error": "Another image is being prepared. Try again in a moment."})
                    try:
                        raw = self.rfile.read(size)
                        if len(raw) != size:
                            raise ValueError("The image upload was interrupted")
                        return self._send(200, materiallibrary.prepare(q["filename"][0], raw, q.get("role", ["colour"])[0]))
                    finally:
                        MATERIAL_UPLOADS.release()
                return self._send(200, materiallibrary.add(self._body()))
            self._send(404, {"error": "No material here"})
        except (ValueError, KeyError, TypeError) as error:
            self._send(400, {"error": str(error)})
        except ConnectionError:
            pass
        except OSError:
            self._send(500, {"error": "Could not read or store the material. Check folder permissions and disk space."})
