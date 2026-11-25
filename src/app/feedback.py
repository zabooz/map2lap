"""Installation-owned feedback tickets. Only this local client holds the service credential."""
import base64
import json
import math
import os
import secrets
import threading
import time
import urllib.error
import urllib.request

from app import csp, settings, trackcode, version

BASE_URL = "https://map2lap.couchcoding.at"
IMAGE_BYTES = 8 * 1024**2
TOTAL_BYTES = 24 * 1024**2
# Base64 expands by a third. Allow room for the track code and JSON-escaped text.
BODY_BYTES = TOTAL_BYTES * 4 // 3 + 256 * 1024
_wait_until = {}
_wait_lock = threading.Lock()


class FeedbackError(Exception):
    def __init__(self, status, message, **details):
        super().__init__(message)
        self.status = status
        self.answer = {"error": message, **details}


def _key():
    """Return the same saved key to concurrent first submissions."""
    with settings.LOCK:
        key = settings.load()["feedback_key"]
        if not key:
            key = secrets.token_urlsafe(32)
            settings.save({"feedback_key": key})
        return key


def mark_seen(ticket, entry):
    """Save the highest developer entry displayed for this ticket."""
    if type(entry) is not int or entry < 0:
        raise FeedbackError(400, "Invalid ticket entry.")
    with settings.LOCK:
        seen = settings.load()["feedback_seen"]
        if entry > seen.get(ticket, -1):
            settings.save({"feedback_seen": {**seen, ticket: entry}})
    return {}


def _multipart(fields, images):
    """Encode text fields and raw screenshots with generated filenames."""
    boundary = secrets.token_hex(24)
    body = bytearray()
    for name, value in fields.items():
        if value is not None:
            body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    for i, image in enumerate(images):
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="screenshot"; filename="image-{i+1}"\r\n'
                    'Content-Type: application/octet-stream\r\n\r\n'.encode())
        body.extend(image)
        body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())
    return bytes(body), f"multipart/form-data; boundary={boundary}"


def _call(key, suffix="", fields=None, images=()):
    """Send one request to the configured service, respecting its rate-limit window."""
    base = os.environ.get("MAP2LAP_FEEDBACK_URL", BASE_URL).rstrip("/")
    url = base + "/api/feedback" + suffix
    group = (base, "read" if fields is None else "reply" if suffix else "report")
    with _wait_lock:
        wait = math.ceil(_wait_until.get(group, 0) - time.monotonic())
    if wait > 0:
        raise FeedbackError(429, f"Please try again in {wait} seconds.", retry_after=wait)
    req = urllib.request.Request(url, headers={"User-Agent": version.USER_AGENT})
    req.add_unredirected_header("Authorization", "Bearer " + key)
    if fields is not None:
        req.data, content_type = _multipart(fields, images)
        req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        try:
            reason = json.load(exc).get("error")
        except (ValueError, OSError):
            reason = None
        if exc.code == 429:
            value = exc.headers.get("Retry-After", "")
            wait = int(value) if value.isdecimal() else 60
            with _wait_lock:
                _wait_until[group] = time.monotonic() + wait
            raise FeedbackError(429, f"{reason or 'Too many requests.'} Try again in {wait} seconds.", retry_after=wait) from exc
        raise FeedbackError(exc.code, reason or "The feedback service could not complete the request.") from exc
    except (OSError, ValueError) as exc:
        raise FeedbackError(503, "Could not reach the feedback service.") from exc


def history(opened=False):
    """Poll after the first ticket. On explicit open, also recover a lost submission response."""
    saved = settings.load()
    reports = []
    if saved["feedback_key"] and (saved["feedback_seen"] or opened):
        reports = _call(saved["feedback_key"])["reports"]
        if reports and not saved["feedback_seen"]:
            mark_seen(str(reports[0]["id"]), 0)
    return {"reports": reports, "seen": settings.load()["feedback_seen"]}


def _images(encoded):
    """Decode the page's image payload within the upload limits. Pure."""
    if not isinstance(encoded, list) or len(encoded) > 5:
        raise FeedbackError(400, "Choose up to 5 images.")
    images = []
    for item in encoded:
        if not isinstance(item, str):
            raise FeedbackError(400, "Invalid image.")
        image = base64.b64decode(item, validate=True)
        if len(image) > IMAGE_BYTES:
            raise FeedbackError(413, "Each image must be 8 MB or smaller.")
        images.append(image)
    if sum(map(len, images)) > TOTAL_BYTES:
        raise FeedbackError(413, "Images must fit within 24 MB together.")
    return images


def send(body, ticket=None):
    """Create a ticket with local metadata, or add a reply to ticket."""
    message = body.get("message")
    if not isinstance(message, str) or not 1 <= len(message.strip()) <= 5000:
        raise FeedbackError(400, "Write a message of up to 5,000 characters.")
    fields = {"message": message.strip()}
    images = _images(body.get("images", []))
    if ticket:
        key = settings.load()["feedback_key"]
        if not key:
            raise FeedbackError(404, "Ticket not found.")
        return _call(key, f"/{ticket}/messages", fields, images)
    if body.get("kind") not in ("bug", "idea"):
        raise FeedbackError(400, "Choose a ticket type.")
    code = "".join(str(body.get("track_code") or "").split())
    if code:
        try:
            fields.update(track_code=code, track_version=trackcode.decode(code)["track_version"])
        except (trackcode.BadCode, AttributeError) as exc:
            raise FeedbackError(400, "Enter a valid Map2Lap track code.", field="track_code") from exc
    fields.update(kind=body["kind"], version=version.VERSION, os="windows" if os.name == "nt" else "linux",
                  csp=csp.inspect(settings.ac_path())["version"])
    answer = _call(_key(), fields=fields, images=images)
    mark_seen(str(answer["id"]), 0)
    return answer
