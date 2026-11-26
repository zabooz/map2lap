"""Compatibility with installed Routes whose A–B timing is in a separate model."""
from contextlib import suppress
import filecmp
from pathlib import Path

from app import system
from track import aihints

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
    """AC's model list for the main mesh and its timing model. Pure."""
    return "\n".join(f"[MODEL_{i}]\nFILE={name}\nPOSITION=0,0,0\nROTATION=0,0,0\n"
                     for i, name in enumerate((mesh, timing)))


def _owns_config(model, name, timing):
    """Check that this model configuration was written by Map2Lap."""
    path = model.parent / name
    return not path.is_symlink() and path.is_file() and path.read_text(encoding="utf-8") == _models(model.name, timing)


def _carry_ai(folder, race):
    """Keep existing default AI and move the old layout's AI when it has no default counterpart."""
    target = folder / "ai"
    source = race / "ai"
    if source.is_symlink() or target.is_symlink():
        return
    for name in ("fast_lane.ai", "pit_lane.ai"):
        old, new = source / name, target / name
        if old.is_symlink() or not old.is_file() or new.is_symlink():
            continue
        if not new.exists():
            target.mkdir(exist_ok=True)
            old.rename(new)
        elif new.is_file() and filecmp.cmp(old, new, shallow=False):
            old.unlink()


def remove_race_layout(model):
    """Retire Map2Lap's old Race layout in a closed or staged track folder. Keep the default timing and user files."""
    from track import ailinestate
    model = Path(model)
    folder = model.parent
    race, ui = folder / LAYOUT, folder / UI
    if any(path.is_symlink() for path in (race, race / "data", folder / "ui", ui)):
        return False
    if not _owns_config(model, RACE, RACE_MODEL):
        return False
    _carry_ai(folder, race)
    if not (folder / "data").is_symlink():
        ailinestate.sync_hints(folder, False)
    if not (race / "ai/fast_lane.ai").exists():
        (race / aihints.FILE).unlink(missing_ok=True)
    for path in (ui / "ui_track.json", folder / RACE_MODEL, *(race / data for data in LAYOUT_DATA)):
        path.unlink(missing_ok=True)
    for path in (ui, race / "ai", race / "data", race):
        with suppress(OSError):
            path.rmdir()
    (folder / RACE).unlink()
    return True


def ac_running():
    """Whether AC is open in a process that may be using a track."""
    return any(system.running(exe) for exe in ("acs.exe", "acs_x86.exe", "acsr.exe"))


def remove_generated_files(model):
    """Before rebuilding a track with embedded gates, remove its old generated layout files."""
    model = Path(model)
    race = _owns_config(model, RACE, RACE_MODEL)
    default = _owns_config(model, DEFAULT, PRACTICE_MODEL)
    if (race or default) and ac_running():
        raise RuntimeError("Close Assetto Corsa before replacing this Route's timing files")
    if race:
        remove_race_layout(model)
    if default:
        (model.parent / DEFAULT).unlink()
        (model.parent / PRACTICE_MODEL).unlink(missing_ok=True)


def update_copy(old_model, new_model, points):
    """In an Editor's staged copy, retire Race and retain the default model list only when it still supplies the gates."""
    old_model, new_model = Path(old_model), Path(new_model)
    remove_race_layout(old_model)
    if _owns_config(old_model, DEFAULT, PRACTICE_MODEL):
        default = new_model.parent / DEFAULT
        if all(name in points for name in ALIASES.values()):
            default.write_text(_models(new_model.name, PRACTICE_MODEL), encoding="utf-8")
        else:
            default.unlink()
            (new_model.parent / PRACTICE_MODEL).unlink(missing_ok=True)
