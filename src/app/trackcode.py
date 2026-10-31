"""Track codes: a track's inputs in one line to share ("M2L1-..."), built again from them on the generator page.

A build is a function of its inputs (the pins and corridor width, or the area), the Map2Lap version and the map data
(nothing in it is random: positions are hashed), so the code holds the inputs and the track version they were built
with: {"v": track version, "t": title, "p": [[lat, lon], ...], "w": corridor m} or {"v", "t", "a": [S, W, N, E]},
compact JSON, deflated, base64url. The route itself is not in it: OSRM routes the pins again (on today's map).
"""
import base64
import json
import zlib

PREFIX = "M2L1-"
DIGITS = 6                  # decimals of a coordinate (11 cm)
MAX_CHARS = 20000           # a pasted code longer than this is no code


class BadCode(ValueError):
    pass


def encode(info):
    """The code of a track's settings (mytracks: "points", "width", "area", "title", "track_version")."""
    d = {"v": info.get("track_version") or info.get("version"), "t": info.get("title") or ""}
    if info.get("area"):
        d["a"] = [round(float(v), DIGITS) for v in info["area"]]
    else:
        d["p"] = [[round(float(a), DIGITS), round(float(b), DIGITS)] for a, b in info["points"]]
        d["w"] = round(float(info.get("width") or 0), 1)
    raw = json.dumps(d, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return PREFIX + base64.urlsafe_b64encode(zlib.compress(raw, 9)).decode("ascii").rstrip("=")


def decode(code):
    """{"track_version", "title", "points", "width"} or {"track_version", "title", "area"} of a code; BadCode if it is
    none."""
    code = "".join(str(code or "").split())        # (pasted with line breaks or spaces)
    if not code.startswith(PREFIX) or len(code) > MAX_CHARS:
        raise BadCode("not a Map2Lap track code")
    body = code[len(PREFIX):]
    try:
        d = json.loads(zlib.decompress(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4))).decode("utf-8"))
        out = {"track_version": d.get("v"), "title": str(d.get("t") or "")}
        if "a" in d:
            s, w, n, e = (float(v) for v in d["a"])
            if not (-90 <= s < n <= 90 and -180 <= w < e <= 180):
                raise ValueError("area")
            out["area"] = [s, w, n, e]
        else:
            pts = [[float(a), float(b)] for a, b in d["p"]]
            if len(pts) < 2 or not all(-90 <= a <= 90 and -180 <= b <= 180 for a, b in pts):
                raise ValueError("points")
            out["points"], out["width"] = pts, float(d["w"])
        return out
    except (ValueError, TypeError, KeyError, zlib.error) as e:
        raise BadCode("the track code is damaged") from e
