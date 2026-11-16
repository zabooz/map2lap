"""Editor race kerbs: a mapped road side, retained as a draft and rebuilt as AC collision meshes on Save."""
import hashlib
import json
import math

import numpy as np
from PIL import Image

from app import roadsurfaces, trackband
from track import kn5, obj_to_kn5
from track.textures import dds_mipmaps

TEXTURE = "map2lap_racing_kerb.dds"
MAX_LENGTH_M = 3000.0   # one selected range, as in roadregion; longer paths are marked in several passes
SAMPLE_M = 1.0          # road/terrain height and curvature: half the 2 m terrain lattice
MIN_ROW_M = 0.05        # sub-5 cm level-boundary slivers cannot define an edge normal for a metre-sampled kerb
CHUNK_ROWS = 500        # at most 2 m/row, ribbed at 12.5 cm: 40k vertices, below AC's 65,535 limit
PROFILES = {"flat", "rounded", "ribbed"}
MIN_WIDTH_M = 0.2
# Broad runoff kerbs reach 2 m; raised sausage kerbs can reach 30 cm. A wide strip can overhang an ungraded shoulder.
MAX_WIDTH_M = 2.0
MAX_HEIGHT_M = 0.30
# The build's ordinary paved junction return is 6 m (junctions.PAVE_RADIUS).
# A kerb needs at least its whole width more radius than its centreline offset,
# or the inner edge doubles back through the junction on a sharp turn.
RETURN_M = 6.0


def route(net):
    """Selected mapped centerline from first click to second, each [x,z,road width]. Pure."""
    segments = net["segments"]
    if not segments or any(e.get("structure") == "tunnel" for e in segments):
        raise ValueError("Kerbs in tunnels need a supported road height source")
    neighbours = {}
    for edge in segments:
        a, b = tuple(edge["a"]), tuple(edge["b"])
        neighbours.setdefault(a, []).append((b, float(edge["width"])))
        neighbours.setdefault(b, []).append((a, float(edge["width"])))
    ends = [p for p, adjacent in neighbours.items() if len(adjacent) == 1]
    if len(ends) != 2 or any(len(adjacent) > 2 for adjacent in neighbours.values()):
        raise ValueError("Mark one road stretch without branches")
    first = min(ends, key=lambda p: math.dist(p, net["pins"][0][:2]))
    ordered, previous, here = [], None, first
    while True:
        adjacent = neighbours[here]
        ordered.append([*here, float(np.mean([width for _next, width in adjacent]))])
        next_ = next(((p, width) for p, width in adjacent if p != previous), None)
        if next_ is None:
            break
        previous, here = here, next_[0]
    return ordered


def _kerb_route(net):
    """Mapped [x,z,width], its source edges and merged short junction links. Pure."""
    raw = np.asarray(route(net), np.float64)
    edges = {frozenset((tuple(edge["a"]), tuple(edge["b"]))): edge for edge in net["segments"]}
    on = [edges[frozenset((tuple(a[:2]), tuple(b[:2])))] for a, b in zip(raw, raw[1:])]
    joins = set()
    for i in range(len(on) - 1, -1, -1):
        if not on[i].get("connector"):
            continue
        # The mapped ends are less than 3 m apart. A separate 1-2 m centreline
        # segment would turn an edge kerb back over itself; one shared junction
        # point lets the corner return occupy the actual joined asphalt.
        middle = (raw[i] + raw[i + 1]) / 2
        raw[i] = middle
        raw = np.delete(raw, i + 1, axis=0)
        on.pop(i)
        joins.add(tuple(middle[:2]))
    for i in range(len(on) - 1, -1, -1):
        if np.linalg.norm(raw[i + 1, :2] - raw[i, :2]) >= MIN_ROW_M:
            continue
        # Bridge/ground range endpoints can be millimetres apart after map
        # coordinates are rounded. Keep one joined vertex and the two real arms.
        raw[i] = (raw[i] + raw[i + 1]) / 2
        raw = np.delete(raw, i + 1, axis=0)
        on.pop(i)
    return raw, on, joins


def side_of_click(net, click):
    """Left or right of the selected road's first segment at the first click [x,z]. Pure."""
    a, b = _kerb_route(net)[0][:2]
    cross = (b[0] - a[0]) * (click[1] - a[1]) - (b[1] - a[1]) * (click[0] - a[0])
    # The road's normal uses the same sign in prepare() and mesh(); a centreline click defaults to right.
    return "left" if cross > 0 else "right"


def curved(net):
    """Selected road [x,z,width] with the build's bounded spline; mapped joins remain fixed. Pure."""
    raw, on, joins = _kerb_route(net)
    if len(raw) < 3:
        return raw.tolist()
    junctions = {tuple(point) for kind in ("junctions", "held_junctions") for point in net.get(kind, [])} | joins
    pins = np.zeros(len(raw), np.uint8)
    for i in range(1, len(raw) - 1):
        # The road build pins mapped junctions and feature ends before smoothing.
        if (tuple(raw[i, :2]) in junctions or on[i - 1].get("road") != on[i].get("road")
                or on[i - 1].get("structure") != on[i].get("structure")):
            pins[i] = 1
    import fast
    fast.require(116, "road_curve")
    # A kerb may cross widths; the narrowest one keeps every bend inside its road's 10% bound.
    xy = np.ascontiguousarray(raw[:, :2])
    smoothed = fast._ef.road_curve(xy, pins, min(0.75, float(np.min(raw[:, 2])) * 0.1))
    source_s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    curve_s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(smoothed, axis=0), axis=1))]
    widths = np.interp(curve_s * (source_s[-1] / curve_s[-1]), source_s, raw[:, 2])
    return np.c_[smoothed, widths].tolist()


def sampled(line):
    """Road centerline [x,z,width] with at most SAMPLE_M between rows. Pure."""
    out = [line[0]]
    for a, b in zip(line, line[1:]):
        n = max(1, math.ceil(math.dist(a[:2], b[:2]) / SAMPLE_M))
        out.extend([[float(a[k] + (b[k] - a[k]) * t / n) for k in range(3)] for t in range(1, n + 1)])
    return out


def _spaced_line(line, columns):
    """Line without sub-5 cm rows, retaining its selected first and last points. Pure."""
    line = np.asarray(line, np.float64)
    kept = [line[0]]
    for row in line[1:-1]:
        if np.linalg.norm(row[columns] - kept[-1][columns]) >= MIN_ROW_M:
            kept.append(row)
    if np.linalg.norm(line[-1][columns] - kept[-1][columns]) < MIN_ROW_M:
        kept[-1] = line[-1]
    else:
        kept.append(line[-1])
    return np.asarray(kept)


def _normals(xy):
    """Left unit normals from a one-metre tangent window along [x,z]. Pure."""
    distance = np.r_[0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    before = np.c_[np.interp(np.maximum(distance - 0.5, 0), distance, xy[:, 0]),
                   np.interp(np.maximum(distance - 0.5, 0), distance, xy[:, 1])]
    after = np.c_[np.interp(np.minimum(distance + 0.5, distance[-1]), distance, xy[:, 0]),
                  np.interp(np.minimum(distance + 0.5, distance[-1]), distance, xy[:, 1])]
    tangent = after - before
    return np.c_[-tangent[:, 1], tangent[:, 0]] / np.maximum(np.linalg.norm(tangent, axis=1)[:, None], 1e-6)


def _at_distance(line, distances, at):
    """Interpolated [x,z,width] and the segment tangent at distance at. Pure."""
    i = min(max(int(np.searchsorted(distances, at, side="right") - 1), 0), len(line) - 2)
    span = distances[i + 1] - distances[i]
    fraction = (at - distances[i]) / span if span > 1e-9 else 0.0
    tangent = line[i + 1, :2] - line[i, :2]
    tangent /= max(float(np.linalg.norm(tangent)), 1e-9)
    return line[i] + fraction * (line[i + 1] - line[i]), tangent


def rounded(net, side, width):
    """Spline [x,z,width] with broad, non-folding returns at mapped sharp corners. Pure."""
    line = np.asarray(curved(net), np.float64)
    raw, _on, joins = _kerb_route(net)
    if len(line) < 3 or len(raw) < 3:
        return line.tolist()
    distances = np.r_[0, np.cumsum(np.linalg.norm(np.diff(line[:, :2], axis=0), axis=1))]
    held = {tuple(point) for point in net.get("held_junctions", [])} | joins
    corners = []
    for a, b, c in zip(raw, raw[1:], raw[2:]):
        before, after = b[:2] - a[:2], c[:2] - b[:2]
        turn = math.atan2(before[0] * after[1] - before[1] * after[0], np.dot(before, after))
        if abs(turn) < math.radians(35) and tuple(b[:2]) not in held:
            continue
        if abs(turn) < math.radians(8):
            continue
        k = int(np.argmin(np.linalg.norm(line[:, :2] - b[:2], axis=1)))
        if np.linalg.norm(line[k, :2] - b[:2]) > 0.02:
            continue   # already a rounded bend in the road's own spline
        corners.append((float(distances[k]), turn, float(b[2])))
    if not corners:
        return line.tolist()
    inserts = []
    for i, (where, turn, road_width) in enumerate(corners):
        offset = road_width / 2 - 0.15 + width
        inside = (turn > 0) == (side == "left")
        desired_radius = offset + RETURN_M if inside else max(RETURN_M, offset + 0.25)
        desired = desired_radius * math.tan(abs(turn) / 2)
        before = where - (corners[i - 1][0] if i else 0.0)
        after = (corners[i + 1][0] if i + 1 < len(corners) else float(distances[-1])) - where
        room = min(before * (0.48 if i else 0.96), after * (0.48 if i + 1 < len(corners) else 0.96))
        trim = min(desired, room)
        # Short selected arms cannot support a kerb outside their centreline's
        # offset radius. Refuse rather than draw a physical strip across traffic.
        if trim < (offset + 0.25) * math.tan(abs(turn) / 2):
            raise ValueError("Mark the kerb farther before and after this sharp junction")
        start, u = _at_distance(line, distances, where - trim)
        end, v = _at_distance(line, distances, where + trim)
        angle = math.atan2(u[0] * v[1] - u[1] * v[0], np.dot(u, v))
        if abs(angle) < math.radians(8):
            continue
        chord = float(np.linalg.norm(end[:2] - start[:2]))
        radius = chord / max(2 * math.sin(abs(angle) / 2), 1e-6)
        handle = 4 / 3 * math.tan(abs(angle) / 4) * radius
        steps = max(3, math.ceil(radius * abs(angle) / 0.5))
        arc = []
        for j in range(steps + 1):
            t = j / steps
            xy = ((1 - t) ** 3 * start[:2] + 3 * (1 - t) ** 2 * t * (start[:2] + handle * u)
                  + 3 * (1 - t) * t ** 2 * (end[:2] - handle * v) + t ** 3 * end[:2])
            arc.append([*xy, start[2] + t * (end[2] - start[2])])
        inserts.append((where - trim, where + trim, arc))
    result, last = [], -1.0
    for start, end, arc in inserts:
        result.extend(line[(distances > last) & (distances < start)].tolist())
        result.extend(arc)
        last = end
    result.extend(line[distances > last].tolist())
    return result


def _continuous_heights(edge, heights):
    """Repair isolated wrong-level road samples; refuse an implausible sustained step. Pure."""
    heights = np.asarray(heights, np.float64).copy()
    distance = np.linalg.norm(np.diff(edge, axis=0), axis=1)
    for i in range(1, len(heights) - 1):
        a, b = max(float(distance[i - 1]), 0.1), max(float(distance[i]), 0.1)
        if (abs(heights[i] - heights[i - 1]) > trackband.MAX_GRADE * a
                and abs(heights[i + 1] - heights[i]) > trackband.MAX_GRADE * b
                and abs(heights[i + 1] - heights[i - 1]) <= trackband.MAX_GRADE * (a + b)):
            heights[i] = (b * heights[i - 1] + a * heights[i + 1]) / (a + b)
    if np.any(np.abs(np.diff(heights)) > trackband.MAX_GRADE * np.maximum(distance, 0.1)):
        raise ValueError("Could not follow one road height here; mark a shorter kerb range")
    return heights


def prepare(path, scan, moved, net, side, width=0.45):
    """Mapped road range with sampled source height at the kerb's inner edge."""
    if side not in ("left", "right"):
        raise ValueError("Choose left or right")
    rows = _spaced_line(sampled(rounded(net, side, width)), [0, 1])
    normal = _normals(rows[:, :2])
    sign = 1 if side == "left" else -1
    edge = rows[:, :2] + sign * normal * (rows[:, 2:3] / 2 - 0.15)
    heights = []
    # Chunks keep a winding road's height grid bounded even if the selected path circles back.
    # On bridges the existing scoped road solver replaces ground cells with the source deck's
    # collision triangles, using the click elevations to choose the right level at crossings.
    bridge = any(edge.get("structure") == "bridge" for edge in net["segments"])
    for first in range(0, len(rows), 80):
        try:
            part = edge[first:first + 80]
            if bridge:
                grid, i0, j0 = roadsurfaces.ground(path, scan, moved, part, net, driveable_only=True)
                approximate = trackband._sampled(grid, i0, j0, part)
                heights.extend(roadsurfaces.deck_heights(path, scan, moved, part, approximate, net).tolist())
            else:
                heights.extend(trackband.road_heights(path, scan, moved, part).tolist())
        except trackband.Refused as error:
            raise ValueError(f"Could not place a kerb on this road edge: {error}") from error
    heights = _continuous_heights(edge, heights)
    return np.c_[rows[:, 0], heights, rows[:, 1], rows[:, 2]].round(3).tolist()


def problems(edits):
    """Reason an Editor kerb descriptor is invalid, or None. Pure."""
    if not isinstance(edits, list) or len(edits) > 100:
        return "Kerbs must be a list of at most 100 ranges"
    seen = set()
    for edit in edits:
        if not isinstance(edit, dict) or not isinstance(edit.get("id"), str) or len(edit["id"]) > 64 or edit["id"] in seen:
            return "Each kerb needs a unique id"
        seen.add(edit["id"])
        if edit.get("side") not in ("left", "right") or edit.get("profile") not in PROFILES:
            return "Choose a kerb side and profile"
        width, height = edit.get("width"), edit.get("height")
        if (type(width) not in (int, float) or not math.isfinite(width) or not MIN_WIDTH_M <= width <= MAX_WIDTH_M
                or type(height) not in (int, float) or not math.isfinite(height) or not 0 <= height <= MAX_HEIGHT_M):
            return "Kerb width must be 0.2–2.0 m and height 0–0.30 m"
        line = edit.get("line")
        if not isinstance(line, list) or not 2 <= len(line) <= 6000 or any(not isinstance(row, list) or len(row) != 4
                or any(type(value) not in (int, float) or not math.isfinite(value) for value in row)
                or not 2 <= row[3] <= 60 for row in line):
            return "Invalid kerb road line"
        distance = sum(math.hypot(a[0] - b[0], a[2] - b[2]) for a, b in zip(line, line[1:]))
        if distance < 1 or distance > MAX_LENGTH_M + SAMPLE_M:
            return "Kerb stretch must be between 1 m and 3 km"
        if any(math.hypot(a[0] - b[0], a[2] - b[2]) > 2 for a, b in zip(line, line[1:])):
            return "Kerb road samples must be at most 2 m apart"
    return None


def _rib_rows(line):
    """Add profile rows at 12.5 cm so a half-metre rib cannot alias against metre road samples. Pure."""
    result = [line[0]]
    for a, b in zip(line, line[1:]):
        n = max(1, math.ceil(math.hypot(b[0] - a[0], b[2] - a[2]) / 0.125))
        result.extend([a + (b - a) * t / n for t in range(1, n + 1)])
    return np.asarray(result)


def mesh(line, *, side, profile, width, height):
    """One visible and collidable AC mesh (vertices, triangles) along a road-side line. Pure."""
    line = _spaced_line(line, [0, 2])
    if profile == "ribbed":
        line = _rib_rows(line)
    normal = _normals(line[:, [0, 2]])
    sign = 1 if side == "left" else -1
    distance = np.r_[0, np.cumsum(np.linalg.norm(np.diff(line[:, [0, 2]], axis=0), axis=1))]
    across = np.linspace(0, 1, 5)
    v = np.zeros(len(line) * 5, kn5.VERTEX)
    for k, row in enumerate(line):
        rise = np.array([0, 0.75, 1, 0.75, 0]) * height
        if profile == "flat":
            rise = np.array([0, 1, 1, 1, 0]) * height
        elif profile == "ribbed":
            rise[1:4] *= 0.78 + 0.22 * math.cos(2 * math.pi * distance[k] / 0.5)
        offset = row[3] / 2 - 0.15 + width * across
        v["pos"][5*k:5*k+5, 0] = row[0] + sign * normal[k, 0] * offset
        v["pos"][5*k:5*k+5, 1] = row[1] + rise + 0.003  # 3 mm prevents z-fighting against the existing road paint
        v["pos"][5*k:5*k+5, 2] = row[2] + sign * normal[k, 1] * offset
        v["uv"][5*k:5*k+5, 0] = distance[k] / 2
        v["uv"][5*k:5*k+5, 1] = across
    tri = []
    for k in range(len(line) - 1):
        for j in range(4):
            a, b, c, d = 5*k+j, 5*k+j+1, 5*(k+1)+j, 5*(k+1)+j+1
            tri.extend(((a, c, b), (b, c, d)) if side == "right" else ((a, b, c), (b, d, c)))
    tri = np.asarray(tri, "<u2")
    p = v["pos"].astype(np.float64)
    n = np.zeros_like(p)
    face_normals = obj_to_kn5.face_normals(p, tri)
    for j in range(3):
        np.add.at(n, tri[:, j], face_normals)
    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
    v["normal"] = n
    v["tangent"] = obj_to_kn5.tangents(p, np.c_[v["uv"][:, 0], -v["uv"][:, 1]], tri, n)
    return v, tri


def _image():
    """Small tiled red-white kerb paint as an AC DDS with mipmaps."""
    image = Image.new("RGB", (64, 64))
    image.paste((205, 28, 25), (0, 0, 32, 64))
    image.paste((225, 225, 214), (32, 0, 64, 64))
    return dds_mipmaps(image, smallest=1)


def extend(scan, edits):
    """Append the kerbs as independently replaceable draft meshes. Pure except making their texture."""
    if wrong := problems(edits):
        raise ValueError(wrong)
    if not edits:
        return scan
    meshes, materials, textures = list(scan["meshes"]), list(scan["materials"]), list(scan["textures"])
    images = {}
    if TEXTURE not in {name for name, _offset, _size in textures}:
        images[TEXTURE] = _image()
        textures.append((TEXTURE, 0, len(images[TEXTURE])))
    material_name = "map2lap_racing_kerb"
    slot = next((i for i, m in enumerate(materials) if m.name == material_name), len(materials))
    if slot == len(materials):
        props = [(key, value, (0, 0), (0, 0, 0), (0, 0, 0, 0)) for key, value in
                 (("ksAmbient", 0.5), ("ksDiffuse", 0.8), ("ksSpecular", 0.05), ("ksSpecularEXP", 8))]
        materials.append(kn5.Material(material_name, "ksPerPixel", 0, 0, 0, props, [("txDiffuse", 0, TEXTURE)]))
    template = next(m for m in scan["meshes"] if m["name"].startswith("1ROAD_"))
    for edit in edits:
        line = edit["line"]
        for first in range(0, len(line) - 1, CHUNK_ROWS - 1):
            vertices, triangles = mesh(line[first:min(first + CHUNK_ROWS, len(line))], side=edit["side"],
                                       profile=edit["profile"], width=edit["width"], height=edit["height"])
            centre = (vertices["pos"].min(0).astype(float) + vertices["pos"].max(0)) / 2
            meshes.append({**template, "name": f"1KERB_racing_{len(meshes)}", "copy": True, "kerb_id": edit["id"], "vertices": len(vertices),
                           "indices": triangles.size, "data": (vertices, triangles), "material": slot,
                           "center": centre.tolist(), "radius": float(np.linalg.norm(vertices["pos"] - centre, axis=1).max()),
                           "renderable": 1})
    key = hashlib.sha256(json.dumps([scan.get("copy_key"), edits], sort_keys=True).encode()).hexdigest()
    return {**scan, "meshes": meshes, "materials": materials, "textures": textures, "kerb_images": images, "copy_key": key}
