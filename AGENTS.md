# AGENTS.md

Map2Lap builds Assetto Corsa tracks from real roads, anywhere on earth. Windows first: Python 3.14 in `.venv`,
PowerShell. `src/` is the import root (tools add it themselves). `engine/` (roads, grading, buildings), `native/` (the Rust
module) and `tools/data/` are our own code, based on BeamNG.Earth: change them directly and port single upstream changes
by hand.

## Read for the task

- Start with [GLOSSARY.md](GLOSSARY.md); keep project-specific definitions current.
- Before writing a probe, consult the [tool catalogue](tools/README.md); each tool has `--help`.
- Frontend changes: [ui/AGENTS.md](ui/AGENTS.md). Editor data flow and saving: [docs/editor.md](docs/editor.md).
- Physics, materials or kn5 writing: [docs/ac-rules.md](docs/ac-rules.md).
- Reports or marks from AC: [docs/ac-reports.md](docs/ac-reports.md).
- Rust: [docs/rust.md](docs/rust.md). Releases or Linux: [docs/release.md](docs/release.md).
- Build execution, caches or output comparisons: [docs/architecture.md](docs/architecture.md).

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
.venv\Scripts\python.exe tools\measure.py <test track> --kn5        # the tiles' OBJ parts of --build on into AC, not built again
```

- Failures there before are in `KNOWN` of `tools/check.py`, each with its reason; any other failure fails the check.
- Once per clone: `git config core.hooksPath .githooks`; a commit with Python changes then runs `check.py --fast`.
- Regression checks use only the tracks in `tools/test_tracks.json`. A new spot gets a new short track there.
- `measure.py` numbers point at places. Whether a road drives better or worse is decided by driving it in AC.

## Build safety

- Before changing build inputs or starting a build, check for running Map2Lap Build/Worker processes: a build reads
  source live. Keep `engine/` and `src/` unchanged while it runs. Check AC before installing a track.
- Never reuse a manually set `BNGE_PLAN_RUN` after a code change: its shared plans are not keyed by code.
  Cache controls and the comparison workflow are in [docs/architecture.md](docs/architecture.md#build-caches-and-comparisons).

## The page

Edit `ui/`, never the generated `src/web`; build before a commit and commit both. Users need no Bun.
Commands, browser-test requirements and React/CSS rules: [ui/AGENTS.md](ui/AGENTS.md).

## Rules for a change

- **Think worldwide.** A rule acts on every road, path and building in the built area and must hold in other countries,
  road widths and terrain. Before building, name the kinds of places it touches.
- **Map data first.** OpenStreetMap and Overture tags (tunnel, bridge, layer, width, ...) come before thresholds. A number
  that stays gets a comment with its physical reason and where it would fail.
- **Fix the cause,** in `engine/` and in the Rust module too. Read what the code intends at that place first.
- **Rust first.** Look for a driving-surface fault in the Rust module before Python, and fix it where it arises: a slower
  rebuild or a locked `.pyd` is no reason for a Python workaround ([docs/rust.md](docs/rust.md)).
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
(`engine/tests/test_part_order.py`). Set a switch through the package (`roads.NAME = x`): that reaches every part's copy.
