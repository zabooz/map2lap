"""Prepared paint regions: loading evaluates masks; clicks look up components and assemble their saved alpha masks.

Indexes are disposable, content-addressed files shared by a track and its saved sources. Only a bounded amount of run
data stays in RAM. Roads are divided by mapped source chains; ordinary degree-two map splits are joined.
"""
import base64
import collections
import functools
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
import threading
import zipfile

import numpy as np
from PIL import Image, ImageDraw

from track import editorinfo

CACHE_ROOT = Path(__file__).resolve().parents[2] / "out" / "editor-selection"
VERSION = 2  # Rebuild persisted owners made with process-dependent road-chain roots.
ROAD_MATERIALS = {"road_asphalt", "road_concrete", "road_cobble", "road_gravel", "road_dirt"}
RUN = np.dtype([("row", "<u2"), ("start", "<u2"), ("end", "<u2"), ("local", "<u4"), ("whole", "<u4"), ("owner", "<u4")])
_preparing = threading.Lock()
_reading = threading.RLock()
_memory = collections.OrderedDict()
_memory_bytes = 0
MEMORY_BYTES = 64 * 1024 ** 2


def _find(parent, i):
    while parent[i] != i:
        parent[i] = parent[parent[i]]
        i = parent[i]
    return i


def _join(parent, a, b):
    a, b = _find(parent, a), _find(parent, b)
    if a != b:
        parent[b] = a


def road_chains(features):
    """Stable source road chains: join only same-surface degree-two endpoints on the same mapped level. Pure."""
    roads = {str(f["id"]): f for f in features}
    names = sorted(roads)
    numbers = {name: i for i, name in enumerate(names)}
    parent = list(range(len(names)))
    nodes = collections.defaultdict(set)
    for name, road in roads.items():
        tags = road.get("tags", {})
        level = (str(tags.get("layer", "0")), str(tags.get("bridge", "")), str(tags.get("tunnel", "")))
        for line in road.get("geometry", []):
            if len(line) < 2:
                continue
            for x, z in (line[0], line[-1]):
                nodes[(round(x * 1000), round(z * 1000), level)].add(name)
    for neighbours in nodes.values():
        if len(neighbours) != 2:
            continue
        a, b = neighbours
        sa, sb = roads[a].get("spec") or {}, roads[b].get("spec") or {}
        if (sa.get("kind"), bool(sa.get("link"))) == (sb.get("kind"), bool(sb.get("link"))):
            _join(parent, numbers[a], numbers[b])
    # Union roots depend on set/feature iteration. Persist the lowest sorted source number in each chain,
    # so a later process agrees with prepared tiles (including tiles prepared in different sessions).
    canonical = {}
    for i in range(len(names)):
        canonical.setdefault(_find(parent, i), i + 1)
    return {name: canonical[_find(parent, numbers[name])] for name in names}


@functools.lru_cache(maxsize=1)
def _catalog(folder, _manifest_state):
    manifest_path = Path(folder) / "manifest.json"
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    digest = hashlib.sha256(str(VERSION).encode())
    roads, tile_roads = {}, {}
    for key in sorted(data["tiles"]):
        raw = (Path(folder) / (key + ".zip")).read_bytes()
        digest.update(key.encode())
        digest.update(hashlib.sha256(raw).digest())
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            tile = json.loads(z.read("tile.json"))
        features = [f for f in tile.get("features", []) if f.get("layer") == "roads"]
        tile_roads[key] = features
        for feature in features:
            roads.setdefault(str(feature["id"]), feature)
    return digest.hexdigest(), tile_roads, road_chains(roads.values())


def _context(kn5):
    manifest = editorinfo.manifest(kn5)
    if manifest is None:
        raise ValueError("This track has no ground selection data. Build it again to select painted surfaces.")
    folder = editorinfo._folder(kn5)
    fingerprint, roads, chains = _catalog(folder, editorinfo._stamp(os.path.join(folder, "manifest.json")))
    target = Path(CACHE_ROOT) / fingerprint
    return folder, target, manifest["tiles"], roads, chains


def _owners(key, size, roads, chains):
    """Mapped road chains covering this tile, used to divide painted asphalt at real branches. Pure."""
    tx, ty = map(int, key.split("_"))
    scale = size / editorinfo.TILE_M
    image = Image.new("I", (size, size), 0)
    draw = ImageDraw.Draw(image)
    # Narrow side roads own their mouth at a junction; the joined asphalt remains available through Whole.
    for road in sorted(roads, key=lambda r: (-float((r.get("spec") or {}).get("width", 0)), str(r["id"]))):
        spec = road.get("spec") or {}
        if not spec or str(road["id"]) not in chains:
            continue
        width = float(spec.get("width", 0))
        for line in road.get("geometry", []):
            if len(line) >= 2:
                points = [((x - tx * editorinfo.TILE_M) * scale,
                           ((ty + 1) * editorinfo.TILE_M + z) * scale) for x, z in line]
                # Include the painter's antialiased edge and junction fills. This is ownership, never a new road boundary.
                draw.line(points, fill=chains[str(road["id"])], width=max(1, round((width + 4.0) * scale)), joint="curve")
    return np.asarray(image, np.uint32)


def _runs(weight, owners):
    """Nonzero horizontal runs and their local/whole components. A road's local components keep source-chain boundaries. Pure."""
    on = weight > 0
    change = owners[:, 1:] != owners[:, :-1]
    start = on & np.c_[np.ones(len(on), bool), ~on[:, :-1] | change]
    end = on & np.c_[~on[:, 1:] | change, np.ones(len(on), bool)]
    rows, columns = np.nonzero(start)
    ends = np.nonzero(end)[1] + 1
    count = len(rows)
    runs = np.zeros(count, RUN)
    runs["row"], runs["start"], runs["end"] = rows, columns, ends
    runs["owner"] = owners[rows, columns]
    offsets = np.searchsorted(rows, np.arange(len(on) + 1))
    local, whole = list(range(count)), list(range(count))
    for row in range(len(on)):
        lo, hi = map(int, offsets[row:row + 2])
        for i in range(lo + 1, hi):
            if runs["end"][i - 1] == runs["start"][i]:
                _join(whole, i - 1, i)
                if runs["owner"][i - 1] == runs["owner"][i]:
                    _join(local, i - 1, i)
        if row == 0:
            continue
        a, a_end = map(int, offsets[row - 1:row + 1])
        for i in range(lo, hi):
            while a < a_end and runs["end"][a] <= runs["start"][i]:
                a += 1
            j = a
            while j < a_end and runs["start"][j] < runs["end"][i]:
                _join(whole, i, j)
                if runs["owner"][i] == runs["owner"][j]:
                    _join(local, i, j)
                j += 1
    runs["local"] = [_find(local, i) + 1 for i in range(count)]
    runs["whole"] = [_find(whole, i) + 1 for i in range(count)]
    edges = np.zeros((4, len(on), 3), np.uint32)  # west/east/north/south, pixel, local/whole/owner
    for run in runs:
        row, start, end = int(run["row"]), int(run["start"]), int(run["end"])
        values = [run["local"], run["whole"], run["owner"]]
        if start == 0:
            edges[0, row] = values
        if end == len(on):
            edges[1, row] = values
        if row == 0:
            edges[2, start:end] = values
        if row == len(on) - 1:
            edges[3, start:end] = values
    return runs, edges


def _build_tile(folder, target, key, roads, chains):
    """Evaluate one tile once, keeping compressed alpha and component indexes for subsequent clicks."""
    z, data = editorinfo._read(folder, key)
    with z:
        size = data["size"]
        base = editorinfo._image(z, "base.png", size)
        layers = [(layer["material"], editorinfo._image(z, layer["mask"], size)) for layer in data["layers"]]
    names = list(dict.fromkeys(data["base"] + [name for name, _ in layers]))
    owners = _owners(key, size, roads, chains)
    strongest = np.full((size, size), -1.0, np.float32)
    dominant = np.zeros((size, size), np.uint8)
    arrays = {}
    for k, name in enumerate(names):
        weight = np.asarray([b == name for b in data["base"]])[base].astype(np.float32)
        for material, alpha in layers:
            a = alpha.astype(np.float32) / 255.0
            weight *= 1 - a
            if material == name:
                weight += a
        wins = weight > strongest
        dominant[wins], strongest[wins] = k, weight[wins]
        raster = np.rint(weight * 255).astype(np.uint8)
        runs, edges = _runs(raster, owners if name in ROAD_MATERIALS else np.zeros_like(owners))
        arrays[f"r{k}"], arrays[f"e{k}"] = runs, edges
        arrays[f"w{k}"] = np.frombuffer(editorinfo._png(raster), np.uint8)
    arrays["dominant"] = dominant
    arrays["meta"] = np.frombuffer(json.dumps({"materials": names, "size": size}).encode(), np.uint8)
    target.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".preparing_", suffix=".npz", dir=target)
    try:
        with os.fdopen(fd, "wb") as f:
            np.savez_compressed(f, **arrays)
        os.replace(temporary, target / (key + ".npz"))
    finally:
        if os.path.exists(temporary):
            os.remove(temporary)


def prepare(kn5, tiles=None):
    """Prepare requested available tiles during loading. Complete files are reused across sessions and saved copies."""
    folder, target, available, roads, chains = _context(kn5)
    keys = available if tiles is None else [key for key in tiles if key in available]
    for key in keys:
        if not (target / (key + ".npz")).is_file():
            with _preparing:  # bounded scratch memory; two loading views must not compute the same archive twice
                if not (target / (key + ".npz")).is_file():
                    _build_tile(folder, target, key, roads.get(key, []), chains)
    return {"prepared": len(keys)}


def _load(path, material=None):
    global _memory_bytes
    key = (str(path), material)
    with _reading:
        if key in _memory:
            value, size = _memory.pop(key)
            _memory[key] = value, size
            return value
    with np.load(path, allow_pickle=False) as f:
        meta = json.loads(f["meta"].tobytes())
        if material is None:
            value = {"meta": meta, "dominant": f["dominant"]}
        elif material not in meta["materials"]:
            return None
        else:
            k = meta["materials"].index(material)
            value = {"meta": meta, "runs": f[f"r{k}"], "edges": f[f"e{k}"], "alpha": f[f"w{k}"]}
    size = sum(getattr(v, "nbytes", 0) for v in value.values())
    with _reading:
        while _memory and _memory_bytes + size > MEMORY_BYTES:
            _, (_, n) = _memory.popitem(last=False)
            _memory_bytes -= n
        if size <= MEMORY_BYTES and key not in _memory:
            _memory[key] = value, size
            _memory_bytes += size
    return value


def clear_memory():
    """Drop decoded indexes; prepared files remain available."""
    global _memory_bytes
    with _reading:
        _memory.clear()
        _memory_bytes = 0
    _catalog.cache_clear()


def merge(selections):
    """Union already selected masks without changing their soft-edge weights. Pure."""
    materials = list(dict.fromkeys(s["material"] for s in selections))
    masks = {}
    for selection in selections:
        for tile in selection["tiles"]:
            key = tuple(tile["tile"])
            with Image.open(io.BytesIO(base64.b64decode(tile["mask"]))) as image:
                mask = np.asarray(image)
            masks[key] = np.maximum(masks[key], mask) if key in masks else mask
    return {"material": materials[0] if materials else "", "materials": materials,
            "truncated": any(s["truncated"] for s in selections),
            "tiles": [{"tile": list(key), "mask": base64.b64encode(editorinfo._png(mask)).decode("ascii")} for key, mask in masks.items()]}


def _all_matching(target, available, material, clicked):
    """All prepared contributions of one material, including disconnected regions; keep the preview bounded."""
    tiles, truncated = [], False
    for key in [clicked, *sorted(set(available) - {clicked})]:
        path = target / (key + ".npz")
        if not path.is_file():
            truncated = True
            continue
        tile = _load(path, material)
        if tile is None or not len(tile["runs"]):
            continue
        if len(tiles) == editorinfo.MAX_TILES:
            truncated = True
            break
        tiles.append({"tile": list(map(int, key.split("_"))), "mask": base64.b64encode(tile["alpha"].tobytes()).decode("ascii")})
    return {"material": material, "truncated": truncated, "whole": True, "tiles": tiles}


def select(kn5, tx, ty, u, v, whole=False):
    """Look up the local connected region, or all matching prepared ground; never evaluate painting on a click."""
    _folder, target, available, _roads, _chains = _context(kn5)
    key = f"{tx}_{ty}"
    if key not in available:
        raise ValueError("This track has no ground selection data at this point")
    if not (target / (key + ".npz")).is_file():
        prepare(kn5, [key])  # compatible with a click arriving before its tile finishes loading
    first = _load(target / (key + ".npz"))
    size = first["meta"]["size"]
    row, col = editorinfo._pixel(u, v, size)
    material = first["meta"]["materials"][int(first["dominant"][row, col])]
    if whole:
        return _all_matching(target, available, material, key)
    tile = _load(target / (key + ".npz"), material)
    runs = tile["runs"]
    at = np.flatnonzero((runs["row"] == row) & (runs["start"] <= col) & (runs["end"] > col))
    field, column = ("whole", 1) if whole else ("local", 0)
    if not len(at):
        raise ValueError("No painted region at this point")
    queue = collections.deque([(tx, ty, {int(runs[field][at[0]])})])
    selected, truncated = {}, False
    while queue:
        x, y, wanted = queue.popleft()
        key = f"{x}_{y}"
        new = wanted - selected.get(key, set())
        if not new:
            continue
        if key not in selected and len(selected) >= editorinfo.MAX_TILES:
            truncated = True
            continue
        path = target / (key + ".npz")
        if not path.is_file():
            truncated = key in available or truncated
            continue
        tile = _load(path, material)
        if tile is None:
            continue
        selected.setdefault(key, set()).update(new)
        edges = tile["edges"]
        for side, (nx, ny) in enumerate(((x - 1, y), (x + 1, y), (x, y + 1), (x, y - 1))):
            hits = np.isin(edges[side, :, column], list(new))
            neighbour_key = f"{nx}_{ny}"
            if not hits.any() or neighbour_key not in available:
                continue
            neighbour_path = target / (neighbour_key + ".npz")
            if not neighbour_path.is_file():
                truncated = True
                continue
            neighbour = _load(neighbour_path, material)
            if neighbour is None:
                continue
            other = neighbour["edges"][side ^ 1]
            if not whole:
                hits &= other[:, 2] == edges[side, :, 2]
            components = set(map(int, other[hits, column])) - {0}
            if components:
                queue.append((nx, ny, components))
    tiles = []
    for key, components in selected.items():
        tile = _load(target / (key + ".npz"), material)
        with Image.open(io.BytesIO(tile["alpha"].tobytes())) as image:
            alpha = np.asarray(image)
        chosen = np.zeros_like(alpha, bool)
        for run in tile["runs"][np.isin(tile["runs"][field], list(components))]:
            chosen[int(run["row"]), int(run["start"]):int(run["end"])] = True
        mask = editorinfo._png(np.where(chosen, alpha, 0))
        tiles.append({"tile": list(map(int, key.split("_"))), "mask": base64.b64encode(mask).decode("ascii")})
    return {"material": material, "truncated": truncated, "whole": whole, "tiles": tiles}
