# AGENTS.md

Notes for AI coding agents (and people) working on Map2Lap. The full developer notes are
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md); this file is the short version: where things are, how to check a change,
and the rules a change has to follow.

Map2Lap builds Assetto Corsa tracks from real roads. It runs the server code of BeamNG.Earth (`vendor/beamng_earth`,
our own fork now) for the map data, terrain, roads, bridges and buildings, and writes the result as OBJ parts and a
kn5 with its own writer. Windows first: Python 3.12 in `.venv`, PowerShell, Assetto Corsa with CSP.

## Where things are

| Path | What |
|---|---|
| `src/server.py`, `src/web/index.html` | The generator page for end users (`Start Map2Lap.bat`) |
| `src/generator.py` | One build: route → tiles → OBJ parts → track folder → kn5 |
| `src/track/` | BeamNG.Earth tiles to OBJ (`make_obj.py`), kn5 writer, track folder, worker processes |
| `src/scenery/` | Our own terrain mesh, water, trees, rocks, street furniture, facades, distant view |
| `src/app/` | The page's state: settings, versions (`version.py`), "My tracks", map data cache |
| `src/acapp/TrackDebug/` | CSP Lua app for testing in AC (route metre, marks, drive recordings) |
| `vendor/beamng_earth/server/` | Map data and world rules: `roads.py` (road specs, sidewalks, markings), `grading.py` (ground under roads), `railways.py`, `buildings.py`, `blockworker.py` (one tile) |
| `vendor/beamng_earth/native/earthfast/` | Rust module (`earthfast.pyd`), the hot loops of grading and painting |
| `vendor/beamng_earth/server/tests/` | Unit tests (`unittest`) |
| `tools/` | Developer tools, not in the release: `measure.py`, `check_drive.py`, `stretch.py`, `make_release.py` |
| `out/`, `cache/`, `dist/`, `settings.json`, `assets/textures/` | Build output, map data, releases, local settings, downloaded textures: never committed |

`src/` is the import root (`from track import make_obj`). Tools add `src/` to the path themselves.

## Checking a change

```powershell
# unit tests: only the files your change touches, run from the tests folder
cd vendor\beamng_earth\server\tests
..\..\..\..\.venv\Scripts\python.exe -m unittest test_roads test_grading

# the test tracks (tools/test_tracks.json, short routes over bridges and junctions worth checking), built up to the
# OBJ parts and measured against their reference values
.venv\Scripts\python.exe tools\measure.py --all --build
.venv\Scripts\python.exe tools\measure.py <test track> --install      # into AC, to drive it

# a route of your own, and its drivability (holes, jumps, terrain above the road)
.venv\Scripts\python.exe src\generator.py --name my_test --title "My Test" --width 120 <lat,lon> <lat,lon>
.venv\Scripts\python.exe tools\check_drive.py my_test --all-roads
```

- Don't run the whole BeamNG.Earth test suite: `test_integration_drive.py` and the drive tool tests start BeamNG.
- pytest isn't installed; the tests are plain `unittest`.
- `measure.py` numbers are hints. Whether a road drives better or worse is decided by driving it in AC.

## Rules for a change

**Think worldwide.** Map2Lap builds any place on earth. A rule acts on every road, path and building in the built
area, not only on the route line, and must hold in other countries, other road widths and other terrain than the
test track that showed the problem.

**Use what the map states before guessing.** OpenStreetMap and Overture tags and flags (tunnel, bridge, layer,
sidewalk, width, railway=abandoned, ...) come first. Where a number stays, give it a physical reason in a comment
(a ballast bed's width, a land-cover pixel, a cycle path's usual width) and say where it would fail. No thresholds
tuned to make one place look right.

**Fix the cause, in `vendor/beamng_earth` too.** Read what the BeamNG.Earth code intends at that place before
changing it. It is our code now: change it directly, with tests. Don't merge upstream BeamNG.Earth wholesale
(`tools/update_beamng_earth.py`); port single upstream changes by hand when they are wanted.

**A rule for the driving surface** gets a comment at its place saying why, a unit test that fails without it, and a
`measure.py --all --build` before and after.

**Comments and docs say how it is now.** No history, dates, changelogs or "previously ..." in code or docs. A comment
gives the reason for the rule, with a concrete example of what goes wrong without it where that helps. Match the
style around it: short functions, docstrings that name the inputs and say "Pure." when a function has no side
effects, parenthetical asides for the less important reason.

**Versions** (`src/app/version.py`): `TRACK_VERSION` goes up only when a change alters how built tracks look or drive;
`VERSION` goes up with every release.

**The Rust module.** When a function's signature or behaviour changes, rebuild it and copy the DLL over the `.pyd`:

```bash
cd vendor/beamng_earth/native/earthfast
export PATH="$HOME/.cargo/dlltool-llvm:$HOME/.cargo/bin:$PATH"
cargo build --release
cp target/release/earthfast.dll ../../server/earthfast.pyd     # stop the generator page first: it locks the file
```

New arguments get defaults so older callers keep working, and a feature constant in the module (`m.add(...)`) that
the Python side checks before using them. No `std::env` in the Rust code. Grading results are cached by a hash of the
server code and the module (`revisit.code_key`), so a change invalidates them by itself.

**Assetto Corsa's rules** (details in DEVELOPMENT.md, "AC rules"): object name prefixes decide the physics
(`1ROAD_`, `1GRAVEL_`, `1GRASS_`, `1KERB_`, `1WALL_`, `nocol_`); never define `WALL` in `surfaces.ini`; at most
65,535 vertices per mesh; AC loads the whole track at once, so frame rate and memory are the track's job (fewer and
lighter meshes), never a matter of the player's graphics settings.

**The generator page is for end users.** Developer tools stay in `tools/` and out of the page. The page must not jump:
status and progress live in fixed places, dialogs as overlays.

## Following up a report from AC

With the Track Debug app on (generator page → Settings → Testing), every session writes a folder
`Documents\Assetto Corsa\map2lap_debug\<track>_<time>\`: `info.txt` (the track's build, versions, track code and map
data), `marks.csv` (route metre, offset from the line, AC and lat/lon position per mark), `mark_NN.csv` (the 15 s
before and 5 s after each mark at 50 Hz: G forces, suspension travel), `mark_NN.jpg` (a screenshot), and the track's
own `map2lap.json` and `map2lap_route.txt`.

- `tools\from_debug.py <folder>` builds that track here with the route exactly as it was built (no OSRM) and says
  where this Map2Lap or its map data differ from the sender's (`--upto obj`: only the OBJ parts, for the measuring
  tools).

- The route metre is the same count as in `measure.py` (`--from/--to`) and `check_drive.py`.
- AC coordinates: x east, z = −north, y up; the anchor is in the track's `data/map2lap_route.txt`.
- A command-line build keeps its work folder `out/tracks/<name>/` (tiles, `obj/parts/t_<tx>_<ty>.obj`): the OBJ parts
  name what was built at a spot (materials such as `nocol_walk_sidewalk`, `nocol_rail_rail`, `nocol_bld_fac`).
- To find out why something was built, call the module that decided it on the map data around the spot (for example
  `roads.road_specs` for a road's class, width and sidewalks, `railways.parts` for tracks) after
  `generator._init_worker(cache)`, rather than guessing from the screenshot.
