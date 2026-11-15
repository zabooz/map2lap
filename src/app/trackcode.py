"""Track codes: a track's inputs in one line to share (M2L1 defaults, M2L2 scenery/grid options, M2L3 HD ground).

A build is a function of its inputs (the pins and corridor width, or the area), the Map2Lap version and the map data
(nothing in it is random: positions are hashed), so the code holds the inputs and the track version they were built
with: {"v": track version, "t": title, "p": [[lat, lon], ...], "w": corridor m} or {"v", "t", "a": [S, W, N, E]},
compact JSON, deflated, base64url; optional g/c/s/q hold terrain spacing, parked cars, minimum tree spacing and ground quality.
The route itself is not in it: OSRM routes the pins again (on today's map).
"""
import base64
import json
import zlib

from app import buildoptions
from app.buildoptions import terrain_cell

PREFIX = "M2L1-"
GRID_PREFIX = "M2L2-"       # older apps must refuse new build choices rather than silently ignoring them
HD_PREFIX = "M2L3-"          # source ground textures require HD-aware apps
DIGITS = 6                  # decimals of a coordinate (11 cm)
MAX_CHARS = 20000           # a pasted code longer than this is no code


class BadCode(ValueError):
    pass


def encode(info):
    """The code of a track's settings (mytracks: "points", "width", "area", "title", "track_version")."""
    d = {"v": info.get("track_version") or info.get("version"), "t": info.get("title") or ""}
    options = buildoptions.checked(info)
    grid = options["terrain_cell_m"]
    if grid != 2:              # the encoding of ordinary 2 m tracks stays compatible with old codes
        d["g"] = grid
    if not options["parked_cars"]:
        d["c"] = False
    if options["tree_spacing_m"]:
        d["s"] = options["tree_spacing_m"]
    if options["ground_quality"] == "hd":
        d["q"] = "hd"
    if info.get("area"):
        d["a"] = [round(float(v), DIGITS) for v in info["area"]]
    else:
        d["p"] = [[round(float(a), DIGITS), round(float(b), DIGITS)] for a, b in info["points"]]
        d["w"] = round(float(info.get("width") or 0), 1)
    raw = json.dumps(d, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    prefix = HD_PREFIX if options["ground_quality"] == "hd" else GRID_PREFIX if options != buildoptions.DEFAULTS else PREFIX
    return prefix + base64.urlsafe_b64encode(zlib.compress(raw, 9)).decode("ascii").rstrip("=")


def decode(code):
    """{"track_version", "title", "points", "width"} or {"track_version", "title", "area"} of a code; BadCode if it is
    none."""
    code = "".join(str(code or "").split())        # (pasted with line breaks or spaces)
    prefix = next((p for p in (PREFIX, GRID_PREFIX, HD_PREFIX) if code.startswith(p)), None)
    if prefix is None or len(code) > MAX_CHARS:
        raise BadCode("not a Map2Lap track code")
    body = code[len(prefix):]
    try:
        d = json.loads(zlib.decompress(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4))).decode("utf-8"))
        out = {"track_version": d.get("v"), "title": str(d.get("t") or ""),
               **buildoptions.checked({"terrain_cell_m": d.get("g", 2), "parked_cars": d.get("c", True),
                                       "tree_spacing_m": d.get("s", 0), "ground_quality": d.get("q", "sd")})}
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
