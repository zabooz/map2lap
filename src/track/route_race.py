"""Native A-to-B Practice and standing-start Race on a single Route model."""
from contextlib import suppress
import json
import os
from pathlib import Path
import shutil
import tempfile

from . import kn5

LAYOUT = "map2lap_race"
PRACTICE_MODEL = "map2lap_practice_timing.kn5"
RACE_MODEL = "map2lap_race_timing.kn5"
DEFAULT = "models.ini"
RACE = f"models_{LAYOUT}.ini"
UI = Path("ui", LAYOUT)
LAYOUT_DATA = (Path("data/surfaces.ini"), Path("data/map.ini"), Path("map.png"))
GATES = tuple(f"AC_AB_{gate}_{edge}" for gate in ("START", "FINISH") for edge in ("L", "R"))
ALIASES = {gate: "M2" + gate[2:] for gate in GATES}


def has_gates(points):
    """Does a KN5's points mapping contain the whole Route timing pair? Pure."""
    return all(name in points for name in GATES) or all(name in points for name in ALIASES.values())


def _models(mesh, timing):
    """AC's model list for the shared mesh and the layout's timing-only model. Pure."""
    return "\n".join(f"[MODEL_{i}]\nFILE={name}\nPOSITION=0,0,0\nROTATION=0,0,0\n"
                     for i, name in enumerate((mesh, timing)))


def _timing_model(path, points):
    """Write a KN5 with the layout's native timing markers."""
    identity = (1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
    root = kn5.Node(1, "timing", 1, matrix=identity)
    for name, matrix in points.items():
        root.children.append(kn5.Node(1, name, 1, matrix=matrix))
    kn5.write(path, [], [], root)


def _shared_model(source, target, offsets):
    """Stream a KN5 with its embedded gate names hidden from AC, keeping all byte offsets and the Editor revision."""
    stat = source.stat()
    with source.open("rb") as original, target.open("wb") as shared:
        for offset, gate in sorted((offsets[gate], gate) for gate in GATES):
            kn5._copy_bytes(original, shared, offset - original.tell())
            if original.read(len(gate)) != gate.encode("ascii"):
                raise ValueError("Route timing markers changed while preparing Race")
            shared.write(ALIASES[gate].encode("ascii"))
        shutil.copyfileobj(original, shared, 16 << 20)
    shutil.copymode(source, target)
    os.utime(target, ns=(stat.st_atime_ns, stat.st_mtime_ns))


def layout_configs(model):
    """Return the configs for a Route model, rejecting existing configs belonging to another layout."""
    model = Path(model)
    configs = {DEFAULT: _models(model.name, PRACTICE_MODEL), RACE: _models(model.name, RACE_MODEL)}
    for name, config in configs.items():
        path = model.parent / name
        if path.exists() and path.read_text(encoding="utf-8") != config:
            raise ValueError(f"{name} already belongs to a different Assetto Corsa layout")
    return configs


def prepare(model):
    """Prepare both native layouts for an installed Route while AC is closed. Repeated calls reuse the shared KN5."""
    model = Path(model)
    folder = model.parent
    configs = layout_configs(model)
    scan = kn5.scan(model, point_offsets=True)
    points = scan["points"]
    embedded = all(name in points for name in GATES)
    if not has_gates(points):
        raise ValueError("This Route is missing its start or finish timing markers")
    if embedded:
        size = model.stat().st_size
        if shutil.disk_usage(folder).free < size:
            raise OSError(f"Not enough free space for the temporary KN5 ({size:,} bytes required)")
    with tempfile.TemporaryDirectory(prefix=".route_timing_", dir=folder) as directory:
        prepared = Path(directory)
        assets = []
        for source in LAYOUT_DATA:
            if (folder / source).is_file():
                target = folder / LAYOUT / source
                staged = prepared / source.name
                shutil.copyfile(folder / source, staged)
                assets.append((staged, target))
        gates = {name: points[name if embedded else ALIASES[name]] for name in GATES}
        _timing_model(prepared / PRACTICE_MODEL, gates)
        # AC starts a Race at the lights. The layout supplies the finish; the shared model supplies any splits.
        finish = {f"AC_TIME_0_{edge}": gates[f"AC_AB_FINISH_{edge}"] for edge in ("L", "R")}
        _timing_model(prepared / RACE_MODEL, finish)
        for name, config in configs.items():
            (prepared / name).write_text(config, encoding="utf-8")
        if embedded:
            _shared_model(model, prepared / model.name, scan["point_offsets"])
        if (ui := folder / "ui/ui_track.json").is_file():
            info = json.loads(ui.read_text(encoding="utf-8-sig"))
            info.update(name=f"{info.get('name', model.stem)} (Race)", run="free")
            (prepared / "ui_track.json").write_text(json.dumps(info), encoding="utf-8")
            assets.append((prepared / "ui_track.json", folder / UI / "ui_track.json"))
        for source, target in assets:
            target.parent.mkdir(parents=True, exist_ok=True)
            os.replace(source, target)
        # Install Practice's replacement gates before removing the embedded ones.
        for name in (PRACTICE_MODEL, RACE_MODEL, DEFAULT, RACE):
            os.replace(prepared / name, folder / name)
        if embedded:
            os.replace(prepared / model.name, model)


def generated_files(model):
    """The files belonging to Map2Lap's timing layouts, relative to the installed model."""
    model = Path(model)
    configs = [name for name, timing in ((DEFAULT, PRACTICE_MODEL), (RACE, RACE_MODEL))
               if (path := model.parent / name).is_file() and path.read_text(encoding="utf-8") == _models(model.name, timing)]
    if not configs:
        return ()
    return (*configs, PRACTICE_MODEL, RACE_MODEL, str(UI / "ui_track.json"),
            *(str(Path(LAYOUT) / source) for source in LAYOUT_DATA))


def remove_generated_files(model):
    """Remove Map2Lap's layout files before a rebuild, pruning only its empty directories."""
    files = generated_files(model)
    if not files:
        return
    folder = Path(model).parent
    for relative in files:
        path = folder / relative
        if path.is_file():
            path.unlink(missing_ok=True)
    layout = folder / LAYOUT
    for directory in (folder / UI, layout / "data", layout):
        with suppress(OSError):
            directory.rmdir()
