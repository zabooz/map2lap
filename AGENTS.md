# AGENTS.md

Map2Lap builds Assetto Corsa tracks from real roads, anywhere on earth. Windows first: Python 3.14 in `.venv`,
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

## Tools

Look here first: a question below has its tool in `tools/`, and each tool's `--help` has its commands. A new tool gets its
line here (`tests/test_tools.py`).

| The question | The tool |
|---|---|
| A mark or a recorded drive from AC: what did the car feel, on what, where? | `mark.py [track]`, then `docs/ac-reports.md` |
| Drives like grass: which physics (1ROAD, 1GRASS) lies under the line? | `measure.py <track> --surface --from <m> --to <m>` |
| Why is the ground at a spot road or grass: the map's roads there, each painting step | `ground_paint.py <track> <AC x> <AC z>` |
| Which surface is that bump, deck or ground? | `measure.py <track> --profile --from <m> --to <m>` |
| A spot's G, steps, ground over a deck, against the reference | `measure.py <track> [--from <m> --to <m>]` |
| Holes in the ground, in the whole built area | `measure.py <track> --holes`, `check_drive.py` |
| A tunnel portal's heights | `portal.py <track> <AC x> <AC z>` |
| The track of a report, built as its sender built it | `from_debug.py <session folder>` |
| A stretch built again fast, with its profile | `stretch.py` |
| Did a change leave the tracks as they were? | `compare_parts.py` (OBJ), `compare_kn5.py` (kn5) |
| Why is a build slow: which step, what are the workers doing? | `watch_build.py`, then start the build |
| Which code does a build really run (before deleting code)? | `coverage.py` |
| What did a build make: shapes per tile, a kn5's materials | `inspect_tiles.py`, `read_kn5.py` |
| A native crash (an access violation without a stack) | `crash.py` |
| Build the Rust module, read a DLL's imports | `build_native.py`, `pe_imports.py` |
| Make a release, test its update | `make_release.py`, `test_update.py` |
| The CC0 textures a clone lacks | `get_textures.py` |

## Builds

- A build reads the source files live: keep `engine/` and `src/` unchanged while one runs.
- Grading results are cached by a hash of the engine code, the native module and all `BNE_*` environment variables
  (`revisit.code_key`). Set `BNE_COLD=<any value>` to force a fresh run.
- To prove a refactoring changes nothing: `tools\compare_parts.py save before` (the test tracks as built), the change,
  `tools\measure.py --all --build`, `tools\compare_parts.py compare before` (0 differ, else the files and OBJ objects).

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
