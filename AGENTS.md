# AGENTS.md

Map2Lap builds Assetto Corsa tracks from real roads, anywhere on earth. Windows first: Python 3.12 in `.venv`,
PowerShell. `src/` is the import root (tools add it themselves). `engine/` (roads, grading, buildings), `native/` (the Rust
module) and `tools/data/` are our own code, based on BeamNG.Earth: change them directly and port single upstream changes
by hand.

## Check a change

```powershell
# pass or fail: the unit tests (a process per file) and a kn5 build of a short test track
.venv\Scripts\python.exe tools\check.py
.venv\Scripts\python.exe tools\check.py --fast          # the unit tests only, ~15 s
.venv\Scripts\python.exe tools\check.py test_roads      # some test files

# the test tracks, built up to the OBJ parts and measured against their references
.venv\Scripts\python.exe tools\measure.py --all --build
.venv\Scripts\python.exe tools\measure.py --long --build            # the long ones: minutes each
.venv\Scripts\python.exe tools\measure.py <test track> --install    # into AC, to drive it
```

- Failures there before are in `KNOWN` of `tools/check.py`, each with its reason; any other failure fails the check.
- Once per clone: `git config core.hooksPath .githooks`; a commit with Python changes then runs `check.py --fast`.
- Regression checks use only the tracks in `tools/test_tracks.json`. A new spot gets a new short track there.
- `measure.py` numbers point at places. Whether a road drives better or worse is decided by driving it in AC.

## Builds

- A build reads the source files live: keep `engine/` and `src/` unchanged while one runs.
- Grading results are cached by a hash of the engine code, the native module and all `BNE_*` environment variables
  (`revisit.code_key`). Set `BNE_COLD=<any value>` to force a fresh run.
- To prove a refactoring changes nothing, compare the files in `out/tracks/<name>/obj/parts/` before and after.

## Rules for a change

- **Think worldwide.** A rule acts on every road, path and building in the built area and must hold in other countries,
  road widths and terrain. Before building, name the kinds of places it touches.
- **Map data first.** OpenStreetMap and Overture tags (tunnel, bridge, layer, width, ...) come before thresholds. A number
  that stays gets a comment with its physical reason and where it would fail.
- **Fix the cause,** in `engine/` and in the Rust module too. Read what the code intends at that place first.
- **A driving-surface rule** gets a comment saying why, a test that fails without it, and `measure.py` before and after.
- **Comments and docs say how it is now:** the rule and its reason, with a concrete example where that helps.
- **Style:** short functions, docstrings that name the inputs and say "Pure." when there are no side effects.
- **Versions** (`src/app/version.py`) change only at a release: `VERSION` always, `TRACK_VERSION` when built tracks look or
  drive differently.
- **Assetto Corsa:** object name prefixes decide the physics (`1ROAD_`, `1GRAVEL_`, `1GRASS_`, `1KERB_`, `1WALL_`, `nocol_`).
  `WALL` stays undefined in `surfaces.ini`. At most 65,535 vertices per mesh. Frame rate and memory are the track's job.
- **The generator page is for end users:** developer tools stay in `tools/`, status lives in fixed places, dialogs are
  overlays, so the page never jumps.
- **Personal data stays out of the repo,** build paths in binaries included.

## Packages

`roads/`, `grading/` and `buildings/` in `engine/` are read by the package's name (`roads.portal_apron`). A name new to the
outside goes into `__init__.py`. A package's parts stand in one order, the `from . import` line of its `__init__.py`: a
part imports only parts before it, at its top, so a name two parts read lives in the earlier one
(`tests/test_part_order.py`). Set a switch through the package (`roads.NAME = x`): that reaches every part's copy.

## Read before you

- read or name a word of this repo (tile, cell, part, plan, deck, server, ...): [GLOSSARY.md](GLOSSARY.md); keep it
  current
- change physics, materials or the kn5 writer: [docs/ac-rules.md](docs/ac-rules.md)
- follow up a report or mark from AC: [docs/ac-reports.md](docs/ac-reports.md)
- change the Rust module: [docs/rust.md](docs/rust.md)
- make a release or touch Linux support: [docs/release.md](docs/release.md)
- change how a build runs: [docs/architecture.md](docs/architecture.md)
