# Map2Lap – developer notes

How Map2Lap is put together, the rules it follows, and what is still open. For using it, see the
[README](../README.md); for our changes to BeamNG.Earth, see [PATCHES.md](../PATCHES.md).

Map2Lap is built on the server code of **BeamNG.Earth** (MIT licence, © TecnaGamer), vendored under
`vendor/beamng_earth`. We call its building blocks without the game and write the result with **our own kn5 writer** –
no Blender, no ksEditor. The aim is a *reskin* of BeamNG.Earth for Assetto Corsa: their code stays complete (nothing is
removed), updates are taken over, and our AC-specific parts (looks, physics names, kn5) sit on top.

**Working rules**
- BeamNG.Earth's world is the base: rebuild it completely, hide nothing. When something is wrong, first read what
  BeamNG.Earth intends at that place (the server code *and* the mod's `mod/.../roads.lua`, which shows what collides in
  game). Don't correct by screenshots of one test track.
- Fix problems at their cause, not for one place. If the cause is in BeamNG.Earth's code: a patch ([PATCHES.md](../PATCHES.md)).
- Where **Assetto Corsa** differs (driving surfaces through mesh names, collision only through meshes, no terrain
  with holes, other shaders), we deviate **on purpose**, with a short reason in the code and here.
- Check with measurements (`tools/measure.py`, `tools/check_drive.py`) before showing a change.
- Versions (`src/app/version.py`): `VERSION` is the app and goes up with every release, even one that only changes
  the page. `TRACK_VERSION` goes up only when a change alters how built tracks look or drive; "My tracks" compares
  only that one, so page-only releases don't mark every track as old. A release that changes the tracks sets both
  to the same number.

---

## Setup

| What | Where |
|---|---|
| Python 3.12 (venv) | `.venv\Scripts\python.exe`, packages from `requirements.txt` |
| BeamNG.Earth (source, v1.7.1-beta) | `vendor\beamng_earth` (branch `upstream`, see below) |
| Assetto Corsa (with CSP, Content Manager) | found through Steam, or set in the page's Settings |
| CSP Lua docs (matching the installed version) | `assettocorsa\extension\internal\lua-sdk\<script type>\README.md` |
| CC0 textures (ambientCG, not in git) | `assets\textures\` – `python tools\get_textures.py` downloads them |
| Map data cache (not in git) | `cache\` (size limit: `src/app/mapcache.py`, 20 GB by default, trimmed after every build) |

```powershell
py -3.12 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe tools\get_textures.py
"Start Map2Lap.bat"
```

**Command line:**
```powershell
.venv\Scripts\python.exe src\generator.py --name stausee_test --title "Stausee Test" --width 120 46.6600,14.6300 46.6470,14.6230
.venv\Scripts\python.exe src\generator.py --name area_test --title "Area Test" --area 46.655 14.620 46.665 14.640
.venv\Scripts\python.exe tools\check_drive.py stausee_test --all-roads   # drivability: holes, jumps, terrain above the road
.venv\Scripts\python.exe tools\measure.py --all --build                  # rebuild the test tracks, compare with the reference
```
Builds started from the command line keep their work folder `out\tracks\<name>` (the measuring tools read it).
Single steps run as modules from `src\`, e.g. `..\.venv\Scripts\python.exe -m track.kn5 <file.kn5>`.

**Testing in AC:** the CSP app "Track Debug" (`tools\TrackDebug`, copied into AC on every build from a developer
checkout) shows the route metre (the same count as `check_drive.py`), coordinates and G values; **F10** or "Mark"
remembers a spot, "Start recording" records at 50 Hz. Files go to
`Documents\Assetto Corsa\map2lap_debug\<track>_<time>_marks.csv` / `_drive.csv`.

**Release:** `.venv\Scripts\python.exe tools\make_release.py` builds `dist\Map2Lap-<version>-win64.zip` with an
embedded Python, all packages, BeamNG.Earth and the textures.

---

## Architecture

```
server.py (generator page) ─► generator.py (its own process per build)
   route (OSRM) → corridor_tiles → blockworker._roads_tile per tile (build_tiles.py: state, default mode)
   → make_obj.py: terrain (ground.py + water.py, groundcover.py) and tile meshes (+ trees.py, rocks.py, propsmesh.py)
     → one part OBJ per tile (obj/parts/t_<tx>_<ty>.obj), materials in obj/track.mtl
   → gates.py: start and finish gantries of point-to-point routes (obj/parts/gates.obj)
   → farview.py: distant view up to 40 km around the corridor (obj/parts/far.obj, kn5 only)
   → make_track_folder.py: surfaces.ini, ext_config.ini (+ water animation), map.png with the route, ui
   → obj_to_kn5.py: part OBJs → mesh nodes → .kn5 straight into the track folder
   → data/map2lap.json (settings for "Rebuild"), tidy the map data cache (mapcache.py), delete the work folder
     out/tracks/<name> unless "Keep build files" is on
```

**Parallel (`parallel.py`):** tiles, scenery, minimap and kn5 meshes run per tile in a `ProcessPoolExecutor`
(cores − 1 processes or the share set in Settings, at most 61, at most free RAM / 1.5 GB). Processes rather than
threads because BeamNG.Earth's state (`blockworker._s`) is global: every process builds it in its initializer.
- OBJ faces with **relative (negative) indices**: part files can be concatenated without renumbering.
- kn5: every process writes its mesh nodes as bytes to `obj/kn5_parts/<k>.bin`, the main process writes the header,
  textures, materials and start points (`kn5.write_streamed`). All materials of the `.mtl` have fixed numbers.
- Windows locks a cache file for a moment while another process replaces it: `parallel.retry_locked`.
- Processes are not recycled (`max_tasks_per_child` hangs under Python 3.12, CPython gh-115634).

### Project layout

```
src/            the program
  server.py     the generator page (Start Map2Lap.bat runs it), web/index.html
  generator.py  one build (the page runs it as its own process)
  app/          the page's own state: settings, version, my tracks, map data cache, folders (paths.py)
  track/        map data -> track: BeamNG.Earth tiles, OBJ parts, kn5, track folder, worker processes
  scenery/      terrain, water, trees, rocks, street furniture, textures, gantries, distant view
tools/          developer tools (not in the release): measuring, update, release, Track Debug app
vendor/         BeamNG.Earth (branch upstream, see below)
docs/           these notes, README images
```
`src\` is the import root: the packages import each other as `from track import make_obj`. `server.py` and
`generator.py` find them because Python puts a script's folder on its path; the tools add `src\` themselves, the
release's Python has it in `python312._pth`.

| File | Purpose |
|---|---|
| `server.py`, `web/index.html` | Local generator page (Leaflet/OSM): new track (route or area), "My tracks" (rebuild, copy, delete, play), Settings, progress, stop |
| `generator.py` | Route → tiles → OBJ → track folder → kn5 |
| `app/version.py` | App version (`VERSION`, every release) and track version (`TRACK_VERSION`, only when built tracks change); both are stored in every track, "My tracks" marks older track versions |
| `app/mytracks.py` | Our tracks in the AC folder and their saved settings (`data/map2lap.json`) |
| `app/mapcache.py` | Map data cache with a size limit; "Clear now" |
| `app/settings.py` | The page's settings (`settings.json`), finds AC through Steam |
| `track/build_tiles.py` | BeamNG.Earth paths/state (default mode), single run for test areas |
| `scenery/ground.py` | Terrain per tile like BeamNG.Earth's `blockworker.build`: heights, tunnel holes, surface per 2 m cell (physics), terrain texture with painted roads (look by road class), rock faces, streams, large-scale colour variation |
| `scenery/groundcover.py` | WorldCover class per cell → comic ground material, Voronoi fields; Overture `land_use` on top; the ground textures |
| `track/make_obj.py` | Assigns the tile meshes (collision like the BeamNG mod, `collision_prefix`), facade and wall colours, water/trees/furniture, textures |
| `scenery/water.py` | Rasterises water areas, finds the level, lowers the terrain, water and foam meshes, comic textures, Lua animation |
| `scenery/trees.py` | Tree billboards from `vegetation.tile_items`, comic atlas (deciduous, birch, linden, conifer, spruce, larch from 1500 m, two bushes) |
| `scenery/rocks.py` | Boulders from BeamNG.Earth's vegetation as chunky 3D comic rocks, with collision from 1 m |
| `scenery/propsmesh.py` | Street furniture from the tiles' `props` as comic block models (4×4 atlas), guardrails (`rails`), high-voltage pylons (`pylons`) |
| `scenery/roadtex.py` | Comic textures for BeamNG.Earth's road decals and the comic road surfaces of the terrain texture |
| `scenery/facades.py` | Facade textures (tinted plaster, windows, shop fronts), tinted wall textures |
| `scenery/farview.py` | Distant view: BeamNG.Earth's far tiles (`farfield.build_tile`) chosen statically around the corridor; near squares in the comic ground's colours, further out a colour table by height/slope |
| `scenery/gates.py` | Start and finish of point-to-point routes: checkered band, gantry, banner; decides where the timing lines are |
| `track/obj_to_kn5.py`, `track/kn5.py` | Read/write kn5, OBJ → kn5, start slots, timing lines, material values, view distance and shadows per kind (`VIEW`), JPG → DDS (BC1) |
| `track/make_track_folder.py` | Track folder (everything but the kn5) |
| `track/parallel.py` | Number of worker processes, process pool |
| `tools/check_drive.py` | Drivability check: the route every 2 m (holes, jumps, terrain above the road), `--all-roads` |
| `tools/measure.py`, `tools/test_tracks.json` | Measure the driving line of built tracks (G at 100 km/h on the line and in the lanes, edges across, bridge transitions) against the test tracks' reference values |
| `tools/update_beamng_earth.py` | BeamNG.Earth update: new version onto `upstream`, merge, rebuild `earthfast`, reference build with comparison |
| `tools/` | also `make_release.py`, `get_textures.py`, `compare_kn5.py`, `read_kn5.py`, `inspect_tiles.py` |
| `tools/TrackDebug/` | CSP Lua app for testing: position on the route (`data/map2lap_route.txt` per track), F10, recording |

### BeamNG.Earth as a vendor branch

- Branch **`upstream`**: only the **unmodified** BeamNG.Earth code under `vendor/beamng_earth`, one commit per version
  (ZIP from github.com/TecnaGamer/BeamNG.Earth). Branch **`main`** merges it in. **Remove nothing from their code.**
  Adjust in our own files where possible; otherwise as a patch, recorded in [PATCHES.md](../PATCHES.md).
- **Update:** `.venv\Scripts\python.exe tools\update_beamng_earth.py` (or with the path of a ZIP): downloads, commits onto
  `upstream`, merges, builds the Stausee reference and compares with `out/reference.json` (> 5 % deviation flagged).
  Read their `CHANGELOG.md` first; not during a build. Back: `git reset --hard ORIG_HEAD`.
- **Rust module `earthfast`** (built by us for patch P1, `server/earthfast.pyd` in the repo): Rust
  `stable-x86_64-pc-windows-gnu` (no Visual Studio), `dlltool` = a copy of `llvm-ar.exe` as
  `%USERPROFILE%\.cargo\dlltool-llvm\dlltool.exe`; in `native/earthfast` `cargo build --release`,
  `target/release/earthfast.dll` → `server/earthfast.pyd` (stop the page first). The update script rebuilds it after
  the merge (`--build-native`: only that). The `.pyd` must match the Python version (3.12). The Linux `.so`
  (`earthfast.abi3.so`) stays without the patch: a build on Linux stops at the first junction with `NativeMissing`
  until it is built there (or with `BNE_JUNCTION_YIELD=off`, then without the rule). No `std::env` in the Rust code:
  reading environment variables crashed with this toolchain.

### Terrain and physics like BeamNG.Earth

**How BeamNG.Earth builds** (`blockworker.build`, `grading.Grader.apply`, `roads.py`, the mod's `roads.lua`):
- **You drive on the terrain:** levelled to road height under roads, plus `ROAD_LIFT` 4 cm; without gaps. Surface
  (grip) per 2 m sample: `surface.classify` (land use, slope > 35° = rock), `paint_roads`, `paint_lots`.
- **Roads painted into the terrain** (`roads.ROADS_IN_GROUND`, the default). `BNGE_ROADS_IN_GROUND=0` is the old mode
  with asphalt as a mesh of its own (asphalt walls, zigzags, holes at seams – don't use).
- Collision in game (the mod's `createWalk`): `road` (markings) and `wire` visual only; `deck` (bridges and tunnel
  floor), `tunnel` (tubes, portals, retaining walls), `rail` visible with collision; `walk`/`bld` visible, their
  collision is the invisible copy `walkcol`/`bldcol`.
- **Tunnels:** terrain holed only at the portals (`block_tunnel_holes`), raised over flat vaults (`block_arch_raise`);
  inside you drive on the floor slab from `deck`; the portal frame hides the 2 m steps.

**For AC** (`ground.py`, `make_obj.collision_prefix`):
- One mesh for looks **and** physics per tile. Object name per cell by BeamNG.Earth's surface: asphalt/cobbles →
  `1ROAD_ground_…`, gravel/dust/rock → `1GRAVEL_ground_…`, else `1GRASS_ground_…` (the sample in the SW corner).
- A cell goes as soon as **one** of its corners is a tunnel hole.
- Looks: one texture per tile (`ground_<tx>_<ty>.jpg`, 2048 px = 12.5 cm/px): comic ground, the roads on top in
  BeamNG.Earth's shapes and widths (`surface._road_segments`, `earthfast.paint_lines`).
- Collision like the mod: `road`/`wire` → `nocol_`; `deck`, `tunnel`, `rail` → driving surface/wall; `walk`/`bld*`
  visible as `nocol_`, `walkcol` → `1KERB_walkcol_…`, `bldcol` → `1WALL_bldcol_…`, both **invisible** (kn5
  `renderable = 0`). Since 1.7.1 `rail` likewise with `railcol`.
- **Guardrails** (since 1.7.1, tile key `guardrails`; in game forest models with collision): comic models
  (`propsmesh.rails`: steel beam, concrete barrier, cable barrier) as `nocol_guardrail_…`, plus one invisible vertical
  wall `1WALL_guardrailcol_…` per 3 m module.
- **Smoother than BeamNG.Earth** where AC needs it (hard tyres and springs; BeamNG's soft body rolls over centimetre
  bumps): see patches P1 and P5–P11.

### Coordinates
- BeamNG.Earth: a local ENU frame around the anchor (x east, y north, z up). Anchor = middle of the route or area.
- OBJ and kn5: Y up, `(x, z_enu, -y_enu)`. kn5 stores UV v negated (like ksEditor).

---

## AC rules

### Object names = physics
| Prefix | Use | `surfaces.ini` |
|---|---|---|
| `1ROAD_ground_<tx>_<ty>`, `1ROAD_deck_…` | terrain under asphalt/cobbles; bridge and tunnel road | ROAD (0.98) |
| `1GRAVEL_ground_…` | terrain with gravel/dust/rock | GRAVEL (0.75, damping, vibration) |
| `1GRASS_ground_…` | other terrain | GRASS (0.60) |
| `1KERB_walkcol_…` | kerbs/pavements, invisible collision | KERB (0.92) |
| `1WALL_` | bridges, tunnels, retaining walls, gate posts, `bldcol`/`guardrailcol` (invisible); double-sided | **don't** define! |
| `nocol_` | markings, pavements, houses and rails (visible), guardrails, wires, water, foam, trees, distant view | – |

### Don't forget
- **Don't** define `WALL` in `surfaces.ini`: every wall would turn into ground and you'd drive through it (Kunos:
  `07WALL006`, no WALL key). Walls are double-sided (BeamNG winds them inconsistently).
- AC drives along **+Z** of the start point (`obj_to_kn5.empty`). Start slots move up to the first road on the route.
- Point-to-point routes get `AC_AB_START_L/R` and `AC_AB_FINISH_L/R` (acs.exe knows them; CSP's rally mode reads them)
  and `"run": "point-to-point"` in `ui_track.json`; circuits and areas keep the lap line `AC_TIME_0_L/R`.
- BeamNG/Torque winds triangles clockwise → flip them (`shape_parts`), else houses turn black.
- `.cdae`: read only the **finest level of detail** per object (buildings have two; both on top of each other flicker).
- Set material values yourself (ksEditor's defaults ksSpecular 1 / ksAmbient 0: white ground, black shadows).
- Scale textures down to the target resolution before sampling them (else a blotchy pattern: asphalt like cobbles).
- Atlases with an empty margin per image (`trees.PAD`): else billboard edges reach into the neighbouring image at small
  mip levels, or through the repeat into their own bottom row (floating lines).
- Alpha-tested billboards with up-pointing normals shadow themselves (stripes): trees use `ksPerPixelAT_NS`.
- The terrain casts no shadows (it shadowed itself: rings around the camera on the asphalt).
- Unknown BeamNG materials become wall/concrete (`FALLBACK`); the build reports them → add them to `SURFACE`.

### Limits
- 65,535 vertices per mesh (16 bit indices) → objects are split (`_<k>`; split names from the front when reading).
- AC loads the whole track at start; nothing streams. Völkermarkt–Vienna (292 km, ±100 m): 2507 tiles, a 9.9 GB kn5,
  ~47 GB RAM while loading. Beyond ~50 km from the anchor float32 gets coarse (~1–2 cm at 150–250 km).
- The road surface is 2 m terrain triangles (like BeamNG): as even as there in tight curves, not smoother.

### kn5 format (`kn5.py`)
`sc6969`, int32 version (6) + int32 0; textures (active, name, bytes); materials (name, shader, blend, alpha test,
depth mode, parameters {name, A, vec2, vec3, vec4}, texture maps); node tree: class 1 = matrix (16 floats, rows =
axes, last row the position), class 2 = mesh (shadows, visible, transparent, vertices of 44 bytes
pos/normal/uv/tangent, uint16 indices, material, layer, LOD, bounding sphere, renderable).

---

## Content and style

- **Comic style:** trees, water, foam, ground, furniture, rocks, gates are drawn by the scripts themselves (PIL).
- **Trees:** positions/heights/kinds from Meta's canopy heights (BeamNG.Earth `vegetation.py`); two crossed
  double-sided quads per tree, `ksPerPixelAT_NS`, normals pointing up; no collision.
- **Water:** Overture water areas, level = 25th percentile of the lidar heights, terrain lowered up to 1.5 m, a 2.5 m
  foam strip at the shore; animated through CSP `[SCRIPTABLE_DISPLAY_...]` (`water_anim.lua`/`foam_anim.lua`).
  Realistic instead of comic: `[Material_Water] Materials = water, Type = LAKE` in the track's `ext_config.ini`.
- **Facades:** a house is recognised by its BeamNG vertex colour; 12 colours as tinted plaster with windows in
  BeamNG's storey grid, 3 brightness levels through ksAmbient/ksDiffuse.
- **Walls** (portals, retaining walls, bridges, tunnel tube): tinted like BeamNG.Earth (`tunnel.materials.json`): stone
  (Bricks108A) or concrete (Concrete034, structure boosted), darker inside; one of 6 tones × 3 brightness levels per
  connected part (`make_obj.WALL_KINDS`).
- **Ground:** ESA WorldCover 10 m, blurred → meadow, field variants (Voronoi plots), forest, built-up, rock, wetland;
  Overture `land_use` on top; painted into the terrain texture per tile (1 m classes), roads on top.
- **Bridge road** (`asphalt`): the same asphalt as in the terrain (`ground.ROAD_LOOKS`, scaled to 12.5 cm/px), light
  values like the terrain.

---

## Open

| Problem | State |
|---|---|
| **FPS on long tracks** | Völkermarkt–Vienna (300 km): 22 fps at the start, short tracks 90+. View distance and shadows per kind, DDS textures; not yet driven again on a long track |
| **Bridge in the valley (random)** | One parallel A2 build put the 6.8 km bridge 5 m deep into the valley; the same tile alone and the next build: right. Suspicion: a process failed to read a map cell or elevation data (BeamNG.Earth then builds on and only notes it in `revisit.fault()`). Plan: the generator reports missing data and rebuilds the tile |
| **A2 bridges** | Approaches at 11.3 and 4.3 km fixed (P5). Open: exit at 6.4 km 2.4 G at 100 km/h (`_merge_overlaps` pulls the deck away from the end); a knock at 4444 m (cause open); terrain at 532–543 m: 0.5 m over 3 m |
| **Bridges (Vienna):** the road sags into the lidar trench before motorway bridges | open; BeamNG.Earth never raises motorways (`APPROACH_SKIP`) |
| **Roadside guardrails** | BeamNG.Earth builds only mapped guardrails (OSM/Overture) and median barriers on dual motorways. Open: add them on motorways ourselves? |
| **Wires in the air** | street wires end at the corridor's edge without a pole; substations (`gantry`, `sub_*`) not built yet |
| **Asphalt physics wider than painted** (every touched 2 m cell; car parks physics only) | like in BeamNG; leave it |
| **Sharpness and memory** (one terrain texture per tile, 12.5 cm/px) | try the `ksMultilayer` shader (mask + detail textures) |
| **AI line** | no `ai/fast_lane.ai` yet: no AI cars, apps that need one (e.g. some timing apps) don't work; could be written from the route |
| **Tests** | more test places (city, mountain road with tunnel); BeamNG.Earth's `test_otto_bridge` fails 3× with P1/P2 (see PATCHES.md) |

**Later:** long routes (coarser terrain further out, fewer meshes per tile, RAM warning); fields striped along their
long axis; an invisible edge wall; traffic signs, car parks, tunnel sound; navigation (a CSP app with turn hints); AI
traffic (`navgraph.py` → CSP's traffic tool); details (tree trunks with collision; left out: lamp glass, light cones,
fences, wall signs, petrol stations, traffic lights).

**Rejected – loading physics at runtime:** `physics.addTrackSurface` (CSP) works while loading, but triggers a growing
Embree rebuild per call and **AC crashes when loading more while driving** (CSP docs: "causes a huge lag"). CSP's
"custom raycasting" (a height map instead of meshes, like BeamNG's TerrainBlock) is undocumented.
