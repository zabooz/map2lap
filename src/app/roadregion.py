"""Mapped road networks and painted footprints for the Editor's bounded road smoothing."""
import functools
import heapq
import base64
import io
import math
import os

import numpy as np
from PIL import Image

from track import editorinfo, surfaceindex

SNAP_M = 6.0  # A hand's aim and the terrain lattice; never snap across a whole neighbouring carriageway.
MAX_LENGTH_M = 3000.0


def _graph(features):
    """Mapped vertices/edges shared by all point sets of one source. Pure."""
    positions, numbers, edges, seen = [], {}, [], set()

    def node(level, point):
        key = level, round(float(point[0]) * 1000), round(float(point[1]) * 1000)
        if key not in numbers:
            numbers[key] = len(positions)
            positions.append(np.asarray(point, np.float64))
        return numbers[key]

    for feature in features:
        spec, tags = feature.get("spec") or {}, feature.get("tags") or {}
        if not spec:
            continue
        level = tuple(str(tags.get(key, "")) for key in ("layer", "bridge", "tunnel"))
        # Missing layer and explicit layer=0 mean the same mapped level.
        level = (level[0] or "0", *level[1:])
        for line in feature.get("geometry", []):
            for a, b in zip(line, line[1:]):
                first, last = node(level, a), node(level, b)
                identity = min(first, last), max(first, last), str(feature["id"])
                if first == last or identity in seen:
                    continue
                seen.add(identity)
                edges.append({"a": first, "b": last, "level": level, "width": float(spec.get("width", 8)),
                              "road": str(feature["id"]), "owner": int(feature.get("chain", 0))})
    if not edges:
        raise ValueError("This track has no mapped road connections; build it again")
    return positions, numbers, edges


def network(features, points):
    """A tree joining clicked road points, its arms and junctions. Pure; mapped levels never share graph nodes."""
    return _network(_graph(features), points)


def _network(data, points):
    if not isinstance(points, (list, tuple)) or not 2 <= len(points) <= 20:
        raise ValueError("Mark between 2 and 20 road points")
    pins = np.asarray(points, np.float64)
    if pins.shape != (len(points), 2) or not np.isfinite(pins).all():
        raise ValueError("Invalid road points")
    positions, numbers, edges = list(data[0]), dict(data[1]), data[2]

    def node(level, point):
        key = level, round(float(point[0]) * 1000), round(float(point[1]) * 1000)
        if key not in numbers:
            numbers[key] = len(positions)
            positions.append(np.asarray(point, np.float64))
        return numbers[key]
    xy = np.asarray(positions)
    starts, ends = xy[[e["a"] for e in edges]], xy[[e["b"] for e in edges]]
    vector = ends - starts
    square = (vector * vector).sum(axis=1)
    splits, anchors = {}, []
    for pin in pins:
        t = np.clip(((pin - starts) * vector).sum(axis=1) / square, 0, 1)
        projected = starts + t[:, None] * vector
        distance = np.linalg.norm(projected - pin, axis=1)
        k = int(np.argmin(distance))
        if distance[k] > SNAP_M:
            raise ValueError("Click on a mapped road")
        anchor = node(edges[k]["level"], projected[k])
        anchors.append(anchor)
        splits.setdefault(k, []).append((float(t[k]), anchor))
    graph = {k: {} for k in range(len(positions))}
    for k, edge in enumerate(edges):
        marks = sorted({(0.0, edge["a"]), (1.0, edge["b"]), *splits.get(k, [])})
        for (_, a), (_, b) in zip(marks, marks[1:]):
            if a != b:
                graph[a][b] = graph[b][a] = edge
    selected, reached = {}, {anchors[0]}
    for anchor in anchors[1:]:
        if anchor in reached:
            continue
        queue, cost, parent = [(0.0, anchor)], {anchor: 0.0}, {}
        found = None
        while queue:
            value, here = heapq.heappop(queue)
            if value != cost[here]:
                continue
            if here in reached:
                found = here
                break
            for other in graph[here]:
                next_cost = value + float(np.linalg.norm(positions[here] - positions[other]))
                if next_cost < cost.get(other, math.inf):
                    cost[other], parent[other] = next_cost, here
                    heapq.heappush(queue, (next_cost, other))
        if found is None:
            raise ValueError("These roads are not connected on the same mapped level")
        while found != anchor:
            other = parent[found]
            selected[min(found, other), max(found, other)] = graph[found][other]
            reached.update((found, other))
            found = other
    if not selected:
        raise ValueError("Set another point further along the road")
    neighbours = {n: set() for edge in selected for n in edge}
    segments = []
    for (a, b), edge in selected.items():
        neighbours[a].add(b)
        neighbours[b].add(a)
        segments.append({"a": positions[a].tolist(), "b": positions[b].tolist(), **{k: edge[k] for k in ("width", "road", "owner")}})
    length = sum(float(np.linalg.norm(np.asarray(e["b"]) - e["a"])) for e in segments)
    if length > MAX_LENGTH_M:
        raise ValueError("This road network is too long; smooth it in parts")
    # Split at every mapped junction, even if only two selected arms meet there: unselected arms must keep their join.
    breaks = {n for n in neighbours if len(neighbours[n]) != 2 or len(graph[n]) > 2}
    lines, widths, used = [], [], set()
    for start in sorted(breaks):
        for next_ in sorted(neighbours[start]):
            if tuple(sorted((start, next_))) in used:
                continue
            route, previous, here = [start], start, next_
            widest = graph[start][next_]["width"]
            while True:
                used.add(tuple(sorted((previous, here))))
                route.append(here)
                if here in breaks:
                    break
                previous, here = here, next(iter(neighbours[here] - {previous}))
                widest = max(widest, graph[previous][here]["width"])
            lines.append([positions[n].tolist() for n in route])
            widths.append(widest)
    low = np.min([edge["a"] for edge in segments] + [edge["b"] for edge in segments], axis=0)
    high = np.max([edge["a"] for edge in segments] + [edge["b"] for edge in segments], axis=0)
    reach = max(edge["width"] for edge in segments) + 8
    levels = {edge["level"] for edge in selected.values()}
    excluded = []
    for a, adjacent in graph.items():
        for b, edge in adjacent.items():
            if a >= b or (a, b) in selected or edge["level"] not in levels:
                continue
            if ((np.maximum(positions[a], positions[b]) >= low - reach).all()
                    and (np.minimum(positions[a], positions[b]) <= high + reach).all()):
                excluded.append({"a": positions[a].tolist(), "b": positions[b].tolist(), "width": edge["width"]})
    return {"lines": lines, "widths": widths, "segments": segments, "unselected": excluded, "length": length,
            "terminals": [positions[n].tolist() for n in sorted(neighbours) if len(neighbours[n]) == 1],
            "junctions": [positions[n].tolist() for n in sorted(neighbours) if len(neighbours[n]) > 2],
            "held_junctions": [positions[n].tolist() for n in sorted(neighbours) if len(neighbours[n]) > 1 and len(graph[n]) > len(neighbours[n])],
            "pins": [positions[n].tolist() for n in anchors]}


def footprint(net, x, z, painted, owners=None):
    """Selected mapped arms clipped by the actual painted road mask and terminal cross-sections. Pure."""
    selected = np.zeros(x.shape, bool)
    nearest = np.full(x.shape, np.inf)
    terminals = {tuple(p) for p in net["terminals"]}
    for edge in net["segments"]:
        a, b = np.asarray(edge["a"]), np.asarray(edge["b"])
        v = b - a
        t = ((x - a[0]) * v[0] + (z - a[1]) * v[1]) / float(v @ v)
        distance = (x - a[0] - np.clip(t, 0, 1) * v[0]) ** 2 + (z - a[1] - np.clip(t, 0, 1) * v[1]) ** 2
        on = distance <= (edge["width"] / 2 + 4) ** 2
        if tuple(a) in terminals:
            on &= t >= -1e-9
        if tuple(b) in terminals:
            on &= t <= 1 + 1e-9
        if owners is not None and edge["owner"]:
            on &= (owners == edge["owner"]) | (owners == 0)
        selected |= on
        nearest = np.minimum(nearest, np.where(on, distance, np.inf))
    for edge in net.get("unselected", []):
        a, b = np.asarray(edge["a"]), np.asarray(edge["b"])
        v = b - a
        t = np.clip(((x - a[0]) * v[0] + (z - a[1]) * v[1]) / (v @ v), 0, 1)
        distance = (x - a[0] - t * v[0]) ** 2 + (z - a[1] - t * v[1]) ** 2
        selected &= distance >= nearest - 1e-9
    return selected & np.asarray(painted, bool)


@functools.lru_cache(maxsize=32)
def _mapped(folder, stamp, points):
    return _network(_source_graph(folder, stamp), points)


@functools.lru_cache(maxsize=1)
def _source_graph(folder, stamp):
    _fingerprint, tile_roads, chains = surfaceindex._catalog(folder, stamp)
    features = [{**feature, "chain": chains.get(str(feature["id"]), 0)} for roads in tile_roads.values() for feature in roads]
    return _graph(features)


def mapped(path, points):
    """Read a cached source network from the build's retained map facts; the main driving route is never used."""
    folder = editorinfo._folder(path)
    manifest = editorinfo.manifest(path)
    if manifest is None:
        raise ValueError("This track needs a new build for road-area smoothing")
    stamp = editorinfo._stamp(os.path.join(folder, "manifest.json"))
    if not isinstance(points, (list, tuple)) or not 2 <= len(points) <= 20:
        raise ValueError("Mark between 2 and 20 road points")
    try:
        pins = np.asarray(points, np.float64)
    except (ValueError, TypeError) as error:
        raise ValueError("Invalid road points") from error
    if pins.shape != (len(points), 2) or not np.isfinite(pins).all():
        raise ValueError("Invalid road points")
    return _mapped(folder, stamp, tuple(tuple(p) for p in pins))


def selection(path, net):
    """A cached painted footprint for this immutable source and point set."""
    folder = editorinfo._folder(path)
    stamp = editorinfo._stamp(path), editorinfo._stamp(os.path.join(folder, "manifest.json"))
    return _selection(path, stamp, tuple(tuple(p) for p in net["pins"]))


@functools.lru_cache(maxsize=2)
def _selection(path, _stamp, points):
    """Only two compressed footprint sets remain in memory; neither decoded images nor graph copies are retained here."""
    net = mapped(path, points)
    _folder, target, available, _roads, _chains = surfaceindex._context(path)
    selected = []
    for key in available:
        tx, ty = map(int, key.split("_"))
        near = [e for e in net["segments"] if max(e["a"][0], e["b"][0]) + e["width"] >= tx * 256
                and min(e["a"][0], e["b"][0]) - e["width"] <= (tx + 1) * 256
                and max(e["a"][1], e["b"][1]) + e["width"] >= -(ty + 1) * 256
                and min(e["a"][1], e["b"][1]) - e["width"] <= -ty * 256]
        if not near:
            continue
        if not (target / (key + ".npz")).is_file():
            surfaceindex.prepare(path, [key])
        info = surfaceindex._load(target / (key + ".npz"))
        size = info["meta"]["size"]
        mask = np.zeros((size, size), np.uint8)
        for material in set(info["meta"]["materials"]) & surfaceindex.ROAD_MATERIALS:
            tile = surfaceindex._load(target / (key + ".npz"), material)
            with Image.open(io.BytesIO(tile["alpha"].tobytes())) as image:
                weight = np.asarray(image)
            owners = np.zeros((size, size), np.uint32)
            for run in tile["runs"]:
                owners[run["row"], run["start"]:run["end"]] = run["owner"]
            for edge in near:
                radius = edge["width"] / 2 + 4
                low = np.minimum(edge["a"], edge["b"]) - radius
                high = np.maximum(edge["a"], edge["b"]) + radius
                x0, x1 = max(0, int((low[0] / 256 - tx) * size)), min(size, math.ceil((high[0] / 256 - tx) * size))
                z0, z1 = max(0, int((low[1] / 256 + ty + 1) * size)), min(size, math.ceil((high[1] / 256 + ty + 1) * size))
                if x0 >= x1 or z0 >= z1:
                    continue
                x, z = np.meshgrid(tx * 256 + (np.arange(x0, x1) + .5) * 256 / size,
                                   -(ty + 1) * 256 + (np.arange(z0, z1) + .5) * 256 / size)
                # Only the source-assignment corridor uses mapped width; the visible boundary is always the paint mask.
                part = {"segments": [edge], "terminals": net["terminals"], "unselected": net.get("unselected", [])}
                on = footprint(part, x, z, weight[z0:z1, x0:x1] > 0, owners[z0:z1, x0:x1])
                mask[z0:z1, x0:x1] = np.maximum(mask[z0:z1, x0:x1], np.where(on, weight[z0:z1, x0:x1], 0))
        if mask.any():
            if len(selected) == editorinfo.MAX_TILES:
                raise ValueError("This road region reaches more than 64 tiles; choose a smaller area")
            selected.append({"tile": [tx, ty], "mask": base64.b64encode(editorinfo._png(mask)).decode("ascii")})
    if not selected:
        raise ValueError("No painted ground road was found in this region")
    return {"material": "road_region", "truncated": False, "tiles": selected}


def on_grid(selection, i0, j0, shape, step=2):
    """Sample a selected road mask on the existing terrain lattice. Pure."""
    result = np.zeros(shape, bool)
    for tile in selection["tiles"]:
        tx, ty = tile["tile"]
        with Image.open(io.BytesIO(base64.b64decode(tile["mask"]))) as image:
            mask = np.asarray(image.convert("L"))
        x0, x1 = max(0, math.ceil(tx * 256 / step) - i0), min(shape[1], math.floor((tx + 1) * 256 / step) - i0 + 1)
        z0, z1 = max(0, math.ceil(-(ty + 1) * 256 / step) - j0), min(shape[0], math.floor(-ty * 256 / step) - j0 + 1)
        if x0 >= x1 or z0 >= z1:
            continue
        cols = np.clip(((np.arange(x0, x1) + i0) * step / 256 - tx) * mask.shape[1], 0, mask.shape[1] - 1).astype(int)
        rows = np.clip(((np.arange(z0, z1) + j0) * step / 256 + ty + 1) * mask.shape[0], 0, mask.shape[0] - 1).astype(int)
        result[z0:z1, x0:x1] |= mask[rows[:, None], cols] > 0
    return result
