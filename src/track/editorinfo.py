"""Build facts for the Editor, beside the kn5: painted layers and source features, without changing geometry.

Each tile is a ZIP of lossless masks and a small JSON description. The installed manifest belongs to one kn5 state;
the source and Save keep their own copy. Mask rows run southwards; UV v points northwards, as ground.build paints.
"""
import base64
import bisect
import collections
import functools
import io
import json
import os
import re
import shutil
import tempfile
import zipfile

import numpy as np
from PIL import Image

from track import objectlist

FOLDER = os.path.join("data", "map2lap_editor")
SCHEMA = 1
TILE_M = 256
MAX_TILES = 64       # a preview stays bounded even on a continuous meadow over a continent-sized build
TILE_KEY = re.compile(r"-?\d+_-?\d+")


def side_file(part):
    """The build facts beside an OBJ part. Pure."""
    return os.path.splitext(part)[0] + ".editor.zip"


def _png(array):
    out = io.BytesIO()
    Image.fromarray(np.asarray(array, np.uint8)).save(out, format="PNG")
    return out.getvalue()


class Paint:
    """Lossless labels and ordered alpha masks used while painting one tile; finish publishes the complete archive."""

    def __init__(self, part, tx, ty, size):
        self.path = side_file(part)
        self.temp = self.path + ".tmp"
        self.zip = zipfile.ZipFile(self.temp, "w", compression=zipfile.ZIP_DEFLATED)
        self.data = {"schema": SCHEMA, "tile": [tx, ty], "size": size, "layers": [], "features": []}

    def base(self, names, ids):
        """Material names and their raster, rows north to south, before overlays."""
        self.data["base"] = list(map(str, names))
        self.zip.writestr("base.png", _png(ids))

    def layer(self, material, alpha, **style):
        """Another painted layer, alpha in 0..255; style records its texture and repeat, without filesystem paths."""
        if not np.any(alpha):
            return
        name = f"layer_{len(self.data['layers'])}.png"
        self.zip.writestr(name, _png(alpha))
        self.data["layers"].append({"material": material, "mask": name, **style})

    def finish(self, features=(), meshes=()):
        """Publish the complete tile, with mapped features and generated mesh roles as available at build time."""
        self.data["features"].extend(features)
        self.data["meshes"] = list(meshes)
        self.zip.writestr("tile.json", json.dumps(self.data, separators=(",", ":"), allow_nan=False))
        self.zip.close()
        os.replace(self.temp, self.path)

    def feature(self, source, i, rings, **facts):
        """A source feature's geometry in AC x/z, with a small allowlist of map facts, never arbitrary source attributes."""
        tags = {}
        for key in ("class", "subtype", "osm_surface", "osm_id", "name", "names"):
            values = source.attrs.get(key)
            if values is not None and str(values[i]):
                tags[key] = str(values[i])
        raw = source.attrs.get("tags")
        if raw is not None:
            try:
                osm = json.loads(str(raw[i]))
                tags.update({k: osm[k] for k in ("surface", "bridge", "tunnel", "layer", "lanes", "width", "oneway", "highway", "natural", "landuse") if k in osm})
            except (ValueError, TypeError):
                pass
        self.data["features"].append({"id": str(source.ids[i]), "layer": source.layer, "tags": tags,
                                      "geometry": [np.c_[ring[:, 0], -ring[:, 1]].round(3).tolist() for ring in rings], **facts})

    def roads(self, frame, layers, urban, widths):
        """Road and path source lines plus the specifications used to paint them, restricted to this tile."""
        import roads
        tx, ty = self.data["tile"]
        x0, y0 = tx * TILE_M, ty * TILE_M
        seen = set()
        for source in layers:
            if source is None or not len(source):
                continue
            xy = source.xy_in(frame)
            specs = roads.road_specs(source, urban, widths)
            for i, spec in enumerate(specs):
                fid = str(source.ids[i])
                if fid in seen:
                    continue
                margin = float(spec.width) / 2 if spec is not None else 20.0
                parts = [part for part in source.parts(i, xy) if part and len(part[0]) >= 2
                         and part[0][:, 0].max() >= x0 - margin and part[0][:, 0].min() <= x0 + TILE_M + margin
                         and part[0][:, 1].max() >= y0 - margin and part[0][:, 1].min() <= y0 + TILE_M + margin]
                for part in parts:
                    self.feature(source, i, part, spec=spec._asdict() if spec is not None else None)
                if parts:
                    seen.add(fid)

    def abort(self):
        """Close a failed tile; its previous complete archive stays unchanged."""
        self.zip.close()
        if os.path.exists(self.temp):
            os.remove(self.temp)


def _folder(kn5):
    return os.path.join(os.path.dirname(kn5), FOLDER)


def _stamp(path):
    st = os.stat(path)
    return st.st_ino, st.st_mtime_ns, st.st_size


@functools.lru_cache(maxsize=4)
def _manifest(path, state, _stamp_of_manifest):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    tiles = data.get("tiles")
    if data.get("schema") != SCHEMA or data.get("kn5") != state or not isinstance(tiles, list):
        return None
    if not all(isinstance(key, str) and TILE_KEY.fullmatch(key) for key in tiles):
        return None
    return data


def manifest(kn5):
    """The installed metadata of exactly this kn5, or None on older, rebuilt or incomplete tracks."""
    path = os.path.join(_folder(kn5), "manifest.json")
    try:
        return _manifest(path, objectlist.state_of(kn5), _stamp(path))
    except (OSError, ValueError):
        return None


def _publish(kn5, files):
    folder = _folder(kn5)
    os.makedirs(os.path.dirname(folder), exist_ok=True)
    staging = tempfile.mkdtemp(prefix=".editor_", dir=os.path.dirname(folder))
    try:
        for key, source in files:
            shutil.copyfile(source, os.path.join(staging, key + ".zip"))
        with open(os.path.join(staging, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump({"schema": SCHEMA, "kn5": objectlist.state_of(kn5), "tiles": [key for key, _ in files]}, f)
        shutil.rmtree(folder, ignore_errors=True)
        os.replace(staging, folder)
    finally:
        if os.path.isdir(staging):
            shutil.rmtree(staging)


def install(kn5, parts):
    """Install the build facts beside the finished kn5; old parts without facts remain viewable."""
    files = []
    for part in parts:
        key = os.path.splitext(os.path.basename(part))[0].removeprefix("t_")
        if TILE_KEY.fullmatch(key) and os.path.exists(side_file(part)):
            files.append((key, side_file(part)))
    _publish(kn5, files)


def copy(source, target):
    """Keep valid build facts with a source or Save, bound to the target's own kn5 state."""
    data = manifest(source)
    if data is not None:
        _publish(target, [(key, os.path.join(_folder(source), key + ".zip")) for key in data["tiles"]])
    else:
        shutil.rmtree(_folder(target), ignore_errors=True)


def _image(z, name, size):
    with Image.open(io.BytesIO(z.read(name))) as img:
        if max(img.size) > 2048 or min(img.size) < 1:
            raise ValueError("Invalid ground mask size")
        return np.asarray(img.convert("L").resize((size, size), Image.Resampling.NEAREST))


def _read(folder, key):
    z = zipfile.ZipFile(os.path.join(folder, key + ".zip"))
    try:
        if len(z.infolist()) > 128 or sum(i.file_size for i in z.infolist()) > 128 * 1024 ** 2:
            raise ValueError("Ground metadata is too large")
        data = json.loads(z.read("tile.json"))
        size = data["size"]
        if data.get("schema") != SCHEMA or type(size) is not int or not 1 <= size <= 2048:
            raise ValueError("Invalid ground metadata")
        return z, data
    except BaseException:
        z.close()
        raise


def _pixel(u, v, size):
    if not all(np.isfinite(q) and -0.01 <= q <= 1.01 for q in (u, v)):
        raise ValueError("No ground at this texture point")
    return min(size - 1, max(0, int((1 - v) * size))), min(size - 1, max(0, int(u * size)))


def _material_at(folder, key, u, v):
    z, data = _read(folder, key)
    with z:
        row, col = _pixel(u, v, data["size"])
        base = data["base"][_image(z, "base.png", data["size"])[row, col]]
        weights = {base: 1.0}
        for layer in data["layers"]:
            alpha = _image(z, layer["mask"], data["size"])[row, col] / 255.0
            weights = {k: w * (1 - alpha) for k, w in weights.items()}
            name = layer["material"]
            weights[name] = weights.get(name, 0.0) + alpha
        return max(weights, key=weights.get), row, col


def _weight(folder, key, material):
    return _weight_of(folder, key, material, _stamp(os.path.join(folder, key + ".zip")))


@functools.lru_cache(maxsize=8)  # at most 32 MiB of immutable uint8 rasters, independent of track length
def _weight_of(folder, key, material, _archive_state):
    z, data = _read(folder, key)
    with z:
        size = data["size"]
        ids = _image(z, "base.png", size)
        matches = np.asarray([name == material for name in data["base"]])
        weight = matches[ids].astype(np.float32)
        for layer in data["layers"]:
            alpha = _image(z, layer["mask"], size).astype(np.float32) / 255.0
            weight *= 1 - alpha
            if layer["material"] == material:
                weight += alpha
        result = np.rint(weight * 255).astype(np.uint8)
        result.flags.writeable = False
        return result


def _component(mask, seeds):
    """Four-connected pixels reached from seeds, by horizontal runs rather than a Python visit per pixel. Pure."""
    transitions = np.diff(np.pad(mask, ((0, 0), (1, 1))), axis=1)
    rows, columns = np.nonzero(transitions)
    runs = [[] for _ in mask]
    for k in range(0, len(rows), 2):
        runs[int(rows[k])].append((int(columns[k]), int(columns[k + 1])))
    queue, seen = collections.deque(), set()

    def add(row, start, end):
        if not 0 <= row < len(runs):
            return
        line = runs[row]
        at = max(0, bisect.bisect_right(line, (start, mask.shape[1] + 1)) - 1)
        for a, b in line[at:]:
            if a >= end:
                break
            if b > start and (row, a) not in seen:
                seen.add((row, a))
                queue.append((row, a, b))

    for row, col in seeds:
        add(row, col, col + 1)
    out = np.zeros_like(mask)
    while queue:
        row, start, end = queue.popleft()
        out[row, start:end] = True
        add(row - 1, start, end)
        add(row + 1, start, end)
    return out


def select(kn5, tx, ty, u, v):
    """The connected painted surface at a tile's UV, including its soft edges and neighbouring tiles."""
    data = manifest(kn5)
    key, folder = f"{tx}_{ty}", _folder(kn5)
    if data is None or key not in data["tiles"]:
        raise ValueError("This track has no ground selection data. Build it again to select painted surfaces.")
    available = set(data["tiles"])
    material, row, col = _material_at(folder, key, u, v)
    queue = collections.deque([(tx, ty, [(row, col)])])
    selected, truncated = {}, False
    while queue:
        x, y, seeds = queue.popleft()
        key = f"{x}_{y}"
        if key not in available:
            continue
        if key not in selected and len(selected) >= MAX_TILES:
            truncated = True
            continue
        before = None
        if key in selected:
            with Image.open(io.BytesIO(selected[key])) as previous:
                before = np.asarray(previous) > 0
            size = before.shape[0]
            seeds = [(r, c) for r, c in seeds if 0 <= r < size and 0 <= c < size and not before[r, c]]
            if not seeds:
                continue
        weight = _weight(folder, key, material)
        size = weight.shape[0]
        if before is None:
            before = np.zeros_like(weight, bool)
        seed = np.zeros_like(before)
        for r, c in seeds:
            if 0 <= r < size and 0 <= c < size and not before[r, c]:
                seed[r, c] = True
        if not seed.any():
            continue
        component = _component(weight > 0, list(zip(*np.nonzero(seed))))
        added = component & ~before
        if not added.any():
            continue
        combined = component | before
        selected[key] = _png(np.where(combined, weight, 0))
        # The build's tile y points north, image row points south. Equal resolutions are guaranteed by the build.
        for nx, ny, hits, edge in ((x - 1, y, added[:, 0], "right"), (x + 1, y, added[:, -1], "left"),
                                   (x, y + 1, added[0], "bottom"), (x, y - 1, added[-1], "top")):
            indices = np.flatnonzero(hits)
            if len(indices):
                points = [(int(k), size - 1 if edge == "right" else 0) if edge in ("right", "left")
                          else (size - 1 if edge == "bottom" else 0, int(k)) for k in indices]
                queue.append((nx, ny, points))
    return {"material": material, "truncated": truncated,
            "tiles": [{"tile": list(map(int, key.split("_"))), "mask": base64.b64encode(mask).decode("ascii")}
                      for key, mask in selected.items()]}
