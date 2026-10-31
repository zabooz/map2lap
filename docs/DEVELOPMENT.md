# Map2Lap – developer notes

How Map2Lap is put together and the rules it follows. For using it, see the
[README](../README.md).

Map2Lap is built on the server code of **BeamNG.Earth** (MIT licence, © TecnaGamer), in `vendor/beamng_earth` and
developed further here. We call its building blocks without the game and write the result with **our own kn5 writer**
– no Blender, no ksEditor. Our AC-specific parts (looks, physics names, kn5) sit on top.

**Working rules**
- BeamNG.Earth's world is the base: rebuild it completely, hide nothing. When something is wrong, first read what
  BeamNG.Earth intends at that place (the server code *and* the mod's `mod/.../roads.lua`, which shows what collides in
  game). Don't correct by screenshots of one test track.
- Fix problems at their cause, not for one place, in `vendor/beamng_earth` too. A rule for the driving surface gets a
  comment at its place saying why, a test, and a measurement before and after (`tools/measure.py --all --build`: the
  test tracks, short routes over the bridges and underpasses worth checking, `tools/test_tracks.json`).
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
| BeamNG.Earth (source, based on v1.7.2-beta) | `vendor\beamng_earth` (see below) |
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
.venv\Scripts\python.exe tools\measure.py bruecke_eisenkappel --install    # one test track into AC, to drive it
```
Builds started from the command line keep their work folder `out\tracks\<name>` (the measuring tools read it).
Single steps run as modules from `src\`, e.g. `..\.venv\Scripts\python.exe -m track.kn5 <file.kn5>`.

**Testing in AC:** the CSP app "Track Debug" (`src\acapp\TrackDebug`, in the release too) is switched on and off
under Settings → Testing (`app/debugapp.py`: into AC's `apps\lua`, again on every build, removed when off). It shows
the route metre (the same count as `check_drive.py`), coordinates and G values; **F10** or "Mark" remembers a spot,
"Start recording" records at 50 Hz. Files go to `Documents\Assetto Corsa\map2lap_debug\<track>_<time>_marks.csv` / `_drive.csv`.

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
vendor/         BeamNG.Earth (see below)
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
| `scenery/water.py` | Rasterises water areas, finds the level (lakes flat; rivers, streams, canals following the bed downhill), lowers the terrain below it, water and foam meshes one cell past the shore, comic textures, Lua animation |
| `scenery/trees.py` | Tree billboards from `vegetation.tile_items`, comic atlas (deciduous, birch, linden, conifer, spruce, larch from 1500 m, bushes; pine, stone pine, cypress, olive, acacia, baobab, palm, tropical tree, dry bush, juniper, jungle bush). The species follow the tile's climate zone (`zone()`, Köppen-Geiger from BeamNG.Earth's `climate.py`): boreal north of 55°, mediterranean, savanna, rainforest, desert, else temperate |
| `scenery/rocks.py` | Boulders from BeamNG.Earth's vegetation as chunky 3D comic rocks, with collision from 1 m |
| `scenery/propsmesh.py` | Street furniture from the tiles' `props` as comic block models (5×5 atlas): traffic lights, level crossings (St Andrew's cross / crossbuck, flashers, open gates), guardrails (`rails`), high-voltage pylons and substation yards (`pylons`: gantries, supports, breakers, transformers, lightning masts), gas stations from the tiles' `fuel` (`fuel`: canopies, pillars, pumps on islands, bollards, price sign; forecourts as asphalt in the ground from `fuelpads_*.json`) |
| `scenery/cars.py` | Parked cars (four comic shapes, traffic's colours) on BeamNG.Earth's parking spots (`park`: curbside and lot stalls), 60 % / 70 % taken (hashed), on the ground's slope, with collision |
| `scenery/fences.py` | Fences, walls and hedges from OSM (Overture `infrastructure`, subtype barrier) as comic models: kind from the tags, else the ground on both sides and the nearest road; colour, height and spacing hashed per line; 1 m off the carriageways, gaps at gates, invisible collision walls |
| `scenery/roadtex.py` | Comic textures for BeamNG.Earth's road decals and the comic road surfaces of the terrain texture |
| `scenery/facades.py` | Building textures: the window sheet with BeamNG.Earth's four bands, shop fronts, office glass, siding boards, ribbed metal, comic bricks; tinted wall textures |
| `scenery/farview.py` | Distant view: BeamNG.Earth's far tiles (`farfield.build_tile`) chosen statically around the corridor; near squares in the comic ground's colours, further out a colour table by height/slope |
| `scenery/gates.py` | Start and finish of point-to-point routes: checkered band, gantry, banner; decides where the timing lines are |
| `track/obj_to_kn5.py`, `track/kn5.py` | Read/write kn5, OBJ → kn5, start slots, timing lines, material values, view distance and shadows per kind (`VIEW`), JPG → DDS (BC1) |
| `track/make_track_folder.py` | Track folder (everything but the kn5) |
| `track/parallel.py` | Number of worker processes, process pool |
| `src/acapp/TrackDebug/` | CSP Lua app for testing (Settings → Testing, `app/debugapp.py`): position on the route (`data/map2lap_route.txt` per track), F10, recording |
| `tools/stretch.py` | A track's stretch built again fast (tiles and OBJ only, nothing into AC), the driving surface along the route measured and compared with its last run: before and after a fix |
| `tools/check_drive.py` | Drivability check: the route every 2 m (holes, jumps, terrain above the road), `--all-roads` |
| `tools/measure.py`, `tools/test_tracks.json` | The test tracks (short routes, one per bridge or underpass worth checking) built up to the OBJ parts, nothing into AC (`--build`; `--install` into AC to drive one); the driving line measured (G at 100 km/h on the line and in the lanes, edges across, the whole carriageway across (the visible asphalt or deck: one side sunk or raised), bridge transitions) against their reference values. Measures any built track too |
| `tools/update_beamng_earth.py` | Rebuild `earthfast` (`--build-native`) |
| `tools/` | also `make_release.py`, `get_textures.py`, `compare_kn5.py`, `read_kn5.py`, `inspect_tiles.py` |

### BeamNG.Earth (`vendor/beamng_earth`)

- Based on BeamNG.Earth 1.7.2-beta (github.com/TecnaGamer/BeamNG.Earth), developed further here.
- **Rust module `earthfast`** (built by us for P1, `server/earthfast.pyd` in the repo): Rust
  `stable-x86_64-pc-windows-gnu` (no Visual Studio), `dlltool` = a copy of `llvm-ar.exe` as
  `%USERPROFILE%\.cargo\dlltool-llvm\dlltool.exe`; in `native/earthfast` `cargo build --release`,
  `target/release/earthfast.dll` → `server/earthfast.pyd` (stop the page first; or
  `tools/update_beamng_earth.py --build-native`). The `.pyd` must match the Python version (3.12). No `std::env` in
  the Rust code: reading environment variables crashed with this toolchain.

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
  `renderable = 0`); `rail` likewise with `railcol`.
- **Guardrails** (tile key `guardrails`; in game forest models with collision): comic models
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
- Alpha-tested billboards with up-pointing normals shadow themselves (stripes): trees use `ksPerPixelAT_NS`. Bushes
  carry the ground's normal instead (`make_obj.ground_normals`, written as `vn` into the OBJ), so they darken with a
  slope turned away from the sun; trees keep "up".
- The terrain casts no shadows (it shadowed itself: rings around the camera on the asphalt).
- Unknown BeamNG materials become wall/concrete (`FALLBACK`); the build reports them → add them to `SURFACE`.

### Limits
- 65,535 vertices per mesh (16 bit indices) → objects are split (`_<k>`; split names from the front when reading).
- AC loads the whole track at start; nothing streams. A 292 km route (±100 m): 2507 tiles, a 9.9 GB kn5,
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
- **Road rules by country:** `generator.road_rules` takes the anchor's country (ISO code from Nominatim, like the
  track name) and passes BeamNG.Earth's rules to every road tile: driving on the left (parking side, signs, signals,
  crossings), mph, the road markings' style, buried low-voltage lines (fewer poles), street lamp spacing.
- **Road signs:** `blockworker.signs_tile` per tile (generator `_tile_job`): speed limits everywhere in the region's
  face (Vienna Convention, US MUTCD, Canada), in the US also guide signs, exits, mile markers, merge signs. `make_obj`
  reads `signs_*.json`: solid colours from `exit/merge.materials.json` (linear to sRGB), the lettering as RGBA with
  alpha test (its texture flipped: the sign meshes' v runs the other way). Visual only, as in BeamNG.
- **Parking:** the stall lines come with the road mesh (BeamNG.Earth's `parking.finish_markings` chunks); the cars are
  ours (`cars.py`).
- **Buildings:** shapes, roofs and colours are BeamNG.Earth's (`buildings.py`, 14 regions in `region_style`). It
  passes each building's colour as vertex colours (a tint from its tables `buildings.LOOKS`, times a ±6 % jitter); AC
  has none, so `make_obj.BLD_KINDS` gives each building material (window sheet, shop, office glass, siding, stucco,
  panels, metal, stone, brick, four roofs) a comic texture per colour of BeamNG.Earth's table (`BLD_PALETTES`), and
  `bld_split` takes the nearest colour and turns the jitter into one of 3 brightness levels (ksAmbient/ksDiffuse). The
  window sheet has all four of BeamNG.Earth's bands (`facades.sheet`: tall, square, sash, sash on brick); shutters
  only in the regions `SHUTTER_REGIONS` (alpine, northern Europe, Mediterranean, by the anchor).
- **Walls** (portals, retaining walls, bridges, tunnel tube): tinted like BeamNG.Earth (`tunnel.materials.json`): stone
  (Bricks108A) or concrete (Concrete034, structure boosted), darker inside; one of 6 tones × 3 brightness levels per
  connected part (`make_obj.WALL_KINDS`).
- **Ground:** ESA WorldCover 10 m, blurred → meadow, field variants (Voronoi plots), forest, built-up, rock, wetland;
  Overture `land_use` on top; painted into the terrain texture per tile (1 m classes), roads on top.
- **Bridge road** (`asphalt`): the same asphalt as in the terrain (`ground.ROAD_LOOKS`, scaled to 12.5 cm/px), light
  values like the terrain.
