"""An off-road spawn model for retired AI on Map2Lap Routes and Circuits."""
import hashlib
import os
from pathlib import Path
import re
import tempfile

import numpy as np

from app import mytracks
from track import fastlane, kn5, obj_to_kn5, route_race

MODEL = "map2lap_dnf.kn5"
ROOT = "M2L_DNF_PARKING"
SPAWN = "AC_TIME_ATTACK_0"
SCRIPT = Path(__file__).with_name("retired_cars.lua")
OLD_SCRIPT = "13a631e30b6d1c37b2d90a0c06b0d6f0918f31e2d7713fed41cee7e6f078a105"
# Leave at least 30 m between the stationary car and the racing line,
# including a hairpin returning behind the grid. Klagenfurt's tested site is 40 m away.
CLEAR = 30.
RINGS = (40., 65., 95., 125.)
IDENTITY = tuple(np.eye(4).ravel())
HEADER = b"; Map2Lap retired AI parking\n"


def _near_faces(model, meshes, origin, has_lane):
    """Read nearby active collision triangles from the final model, including edited geometry."""
    ground, obstacles = [], []
    reach = max(RINGS) + CLEAR
    with model.open("rb") as stream:
        for mesh in meshes:
            name = mesh["name"]
            if not mesh["active"] or not mesh["indices"] or not name.startswith(("1", "nocol_water_")):
                continue
            center = np.asarray(mesh["center"])[[0, 2]]
            if np.any(abs(center - origin) > reach + mesh["radius"]):
                continue
            verts, faces = kn5.mesh_arrays(stream, mesh)
            xyz = verts["pos"][faces]
            xz = xyz[:, :, [0, 2]]
            low, high = xz.min(axis=1), xz.max(axis=1)
            keep = ((low <= origin + reach) & (high >= origin - reach)).all(axis=1)
            if name.startswith("1GRASS_ground") or (has_lane and name.startswith("1GRAVEL_ground")):
                ground.append(xyz[keep])
            else:
                # Road/kerb/gravel bounds include the whole usable width. Other solids
                # and water need to clear the parked car's footprint, also below bridges.
                gap = CLEAR if not has_lane and name.startswith(("1ROAD", "1KERB", "1GRAVEL")) else 4.
                obstacles.append(np.column_stack((low[keep] - gap, high[keep] + gap)))
    return (np.concatenate(ground) if ground else np.empty((0, 3, 3)),
            np.concatenate(obstacles) if obstacles else np.empty((0, 4)))


def _position(origin, grass, blocked, lane):
    """Find a level touring-car footprint clear of roads, solids and AI segments. Pure."""
    angles = np.arange(16) * (2*np.pi/16)
    dirs = np.column_stack((np.sin(angles), -np.cos(angles)))
    lo, hi = grass[:, :, [0, 2]].min(axis=1), grass[:, :, [0, 2]].max(axis=1)
    for radius in RINGS:
        for x, z in origin + radius * dirs:
            point = np.array([x, z])
            if np.any(((blocked[:, :2] <= point) & (blocked[:, 2:] >= point)).all(axis=1)):
                continue
            if len(lane) and np.any(((lane[:, :2] <= point) & (lane[:, 2:] >= point)).all(axis=1)):
                continue
            faces = grass[((lo <= point+3) & (hi >= point-3)).all(axis=1)]
            if not len(faces):
                continue
            patch = {"grass": (None, faces.reshape(-1, 3), None, np.arange(faces.size // 3).reshape(-1, 3))}
            # Centre and corners of a 6 m square cover the parked DTM car in either
            # orientation. Reject ledges and grades with more than 30 cm height spread.
            heights = [obj_to_kn5.road_height(patch, x+dx, z+dz, ("grass",))
                       for dx, dz in ((0, 0), (-3, -3), (-3, 3), (3, -3), (3, 3))]
            if None not in heights and max(heights) - min(heights) <= .30:
                return x, heights[0] + .30, z
    return None


def location(model):
    """Choose storage on the installed collision terrain, preserving existing Time Attack markers."""
    scan = kn5.scan(model)
    grid = scan["points"].get("AC_PIT_0")
    if grid is None or SPAWN in scan["points"]:
        return None
    origin = np.array([grid[12], grid[14]])
    origins = [origin]
    bounds = []
    lane = model.parent / fastlane.FILE
    if lane.is_file():
        points = fastlane.read_lane(lane)[0]["pos"][:, [0, 2]]
        bounds = np.column_stack((np.minimum(points[:-1], points[1:])-CLEAR,
                                  np.maximum(points[:-1], points[1:])+CLEAR))
        # On steep or densely built routes the grid may have no suitable terrain.
        # Try other sections of the same installed line before leaving the car in its pit.
        origins.extend(points[np.linspace(0, len(points)-1, min(12, len(points)), dtype=int)])
    pits = np.array([np.asarray(mat)[[12, 14]] for name, mat in scan["points"].items()
                     if name.startswith(("AC_PIT_", "AC_START_"))])
    for centre in origins:
        grass, blocked = _near_faces(model, scan["meshes"], centre, len(bounds) > 0)
        blocked = np.vstack((blocked, np.column_stack((pits-CLEAR, pits+CLEAR))))
        pos = _position(centre, grass, blocked, bounds)
        if pos is not None:
            return pos
    return None


def _config(model, legacy):
    """Owned default model list, optionally including the older Route's timing model. Pure."""
    base = route_race._models(model.name, route_race.PRACTICE_MODEL).encode() if legacy else b""
    if legacy:
        text = base + f"\n[MODEL_2]\nFILE={MODEL}\nPOSITION=0,0,0\nROTATION=0,0,0\n".encode()
    else:
        text = route_race._models(model.name, MODEL).encode()
    return base, HEADER + text


def _read(path):
    return path.read_bytes() if path.is_file() else b""


def _write(path, raw):
    """Publish bytes atomically only when they changed."""
    if _read(path) == raw:
        return
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        tmp = Path(stream.name)
    try:
        with tmp.open("wb") as stream:
            stream.write(raw)
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def remove(model):
    """Detach only Map2Lap's model list before replacing or renaming the main KN5."""
    model = Path(model)
    config = model.parent / "models.ini"
    if config.is_symlink():
        return
    current = _read(config).replace(b"\r\n", b"\n")
    for legacy in (False, True):
        base, managed = _config(model, legacy)
        if current == managed:
            if base:
                _write(config, base)
            else:
                config.unlink()
            (model.parent / MODEL).unlink(missing_ok=True)
            return


def install(model):
    """Prepare a generated track for offline AI racing; publish the model list last."""
    model = Path(model)
    folder = model.parent
    config, extra = folder / "models.ini", folder / MODEL
    ext, surfaces = folder / "extension/ext_config.ini", folder / "data/surfaces.ini"
    script = ext.with_name(SCRIPT.name)
    if any(path.is_symlink() for path in (config, extra, ext.parent, surfaces.parent, ext, surfaces, script)):
        return False
    if not (folder / mytracks.FILE).is_file() or not ext.is_file() or not surfaces.is_file():
        return False
    current = _read(config).replace(b"\r\n", b"\n")
    for legacy in (False, True):
        base, managed = _config(model, legacy)
        if current in (base, managed):
            break
    else:
        return False  # An external model list can provide its own Time Attack spawn.
    old, source = _read(script).replace(b"\r\n", b"\n"), SCRIPT.read_bytes().replace(b"\r\n", b"\n")
    if old and old != source and hashlib.sha256(old).hexdigest() != OLD_SCRIPT:
        return False
    pos = location(model)
    if pos is None:
        remove(model)
        return False
    marker = obj_to_kn5.empty(SPAWN, pos, (0., 0., 1.))
    root = kn5.Node(1, ROOT, 1, matrix=IDENTITY, children=[marker])
    payload = b"".join(kn5.header_bytes([], []) + kn5.node_bytes(root))
    # A write interrupted before models.ini was published may already have left this model.
    if extra.exists() and current != managed and _read(extra) != payload:
        return False
    surface_bytes = surfaces.read_bytes()
    if not re.search(rb"(?im)^\s*\[_SCRIPTING_PHYSICS\]\s*$", surface_bytes):
        road_pitch = rb"(?im)^(\[SURFACE_0\][^\[]*?^WAV_PITCH[ \t]*=[ \t]*)0(?=[ \t]*\r?$)"
        surface_bytes = re.sub(road_pitch, rb"\g<1>extended-0", surface_bytes, count=1)
        _write(surfaces, surface_bytes + b"\n[_SCRIPTING_PHYSICS]\nALLOW_TRACK_SCRIPTS=1\n")
    _write(script, source)
    cfg = ext.read_bytes()
    if not re.search(rb"(?im)^\s*SCRIPT\s*=\s*retired_cars\.lua\s*$", cfg):
        _write(ext, cfg + b"\n[SCRIPT_...]\nSCRIPT = retired_cars.lua\n")
    _write(extra, payload)
    _write(config, managed)
    return True
