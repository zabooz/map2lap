# How a build runs

Map2Lap runs BeamNG.Earth's server code (`engine/`, developed further here) without the game and writes the
result with its own kn5 writer: no Blender, no ksEditor.

```
server.py (generator page) ─► generator.py (its own process per build)
   Route or Circuit → corridor_tiles, Area bounds → area_tiles
   → blockworker._roads_tile per tile (build_tiles.py: state, default mode)
   → make_obj.py: terrain (ground.py + water.py, groundcover.py) and tile meshes (+ trees.py, rocks.py, propsmesh.py)
     → one part OBJ per tile (obj/parts/t_<tx>_<ty>.obj), materials in obj/track.mtl
   → gates.py: start and finish gantries of point-to-point routes (obj/parts/gates.obj)
   → farview.py: distant view up to 40 km around the corridor (obj/parts/far.obj, kn5 only)
   → make_track_folder.py: surfaces.ini, ext_config.ini (+ water animation), map.png with the route, ui
   → obj_to_kn5.py: part OBJs → mesh nodes → .kn5 straight into the track folder
   → data/map2lap.json (settings for "Rebuild")
   → on Routes and Circuits: generate the AI line on the finished collision road and look for off-road DNF parking
   → tidy the map data cache (mapcache.py), delete the work folder
     out/tracks/<name> unless "Keep build files" is on (the page's default)
```

A build from the command line keeps its work folder:

```powershell
.venv\Scripts\python.exe src\generator.py --name my_test --title "My Test" --width 120 <lat,lon> <lat,lon>
.venv\Scripts\python.exe src\generator.py --name area_test --title "Area Test" --area 46.655 14.620 46.665 14.640
```

Single steps run as modules from `src\`, e.g. `..\.venv\Scripts\python.exe -m track.kn5 <file.kn5>`.

For a new Circuit, pass `--circuit` with the pins in driving order. OSRM supplies road geometry and node
annotations. `app/circuitlap.py` checks that the return leg joins the start, reports the nearest pin for a U-turn
and marks twice-driven stretches so the converter can place timing on an unambiguous crossing.

## Generator page and Editor

Explicitly mapped toll roofs crossing ground roads are built as open toll stations (`buildings/toll.py`), with closed
service rooms only outside all road corridors. Lane directions and posted speeds use small cached OSM extracts
(`tollsource.py`) when available; Overture remains the offline fallback. Barriers stay raised. The visible and collision
meshes use the same roof, room and island layout, including at bends, divided roads and branches. `layer` is not a storey
count or a height; real height/min-height attributes override the estimated roof clearance.

The page is React and TypeScript in `ui/`, built with Bun into the committed `src/web` files. `server.py` serves these
and routes `/api/` requests. Its Editor read endpoints live in `server_editor.py`, material/model/group endpoints in
`server_library.py`, and road-tool endpoints in `server_roadtools.py`; the build, settings and HTTP dispatch stay in
`server.py`. Bun is needed only for development; `bun run dev` proxies API calls to the running Map2Lap.
The Editor's three.js code loads on the first visit to its tab; camera and mesh data live outside React.

The Editor's loading, drafts, saving and tools: [editor.md](editor.md).

The generator and the Editor's Save write the same ground material, CSP's classic `ksMultilayer_objsp_nm4` straight in the
kn5 (`track/groundmaterial.py`, `classic`): a new build around its baked tile images, Save for all assignments; the browser
draws both with the classic light (`ui/src/editor/scene/classicLight.ts`: Phong at the material's ksSpecular and
ksSpecularEXP). Save emits only track-local configuration and textures, not global CSP shader files. Shader inputs and limits:
[ac-rules.md](ac-rules.md#how-the-ground-is-built).

In the browser, `scene/view.ts` coordinates the scene and `scene/trackTextures.ts` owns texture/material loading, paint
updates and their lifetime. Meshes load nearest first and remain until the track changes. The memory limit stops further
loading; moving the camera does not evict distant meshes and resume loading around its new position.

An Editor Save starts from the retained source and reapplies the draft, rather than modifying the last output in place.
Before writing, it prepares missing native masks, photos and regional geometry on a bounded pool and reuses complete
content-addressed cache entries (`app/tracknative.py`). It still writes and validates a complete replacement KN5.
Painted ground samples the build's tile image itself, with no copy of it. The source and portable paint bundle remain
necessary for subsequent edits and transfer.

## Parallel (`track/parallel.py`)

Tiles, scenery, minimap and kn5 meshes run per tile in a `ProcessPoolExecutor`. The generator page defaults to 75% of
logical cores. The CLI defaults to 100%. Both reserve one core when possible and cap the pool by available work,
free RAM (2 GB per worker when known) and the Windows limit of 61. Processes rather than threads because BeamNG.Earth's state
(`blockworker._s`) is global: every process builds it in its initializer.

- The workers share their plans: the first to plan a map cell writes it, the others read it (`plancache.one_run`, see Build caches below). Two builds of the same code that differ: `tools/build_trace.py`, round after round: `tools/stability.py`.
- OBJ faces use **relative (negative) indices**: part files can be concatenated without renumbering.
- kn5: every process writes its mesh nodes as bytes to `obj/kn5_parts/<k>.bin`, the main process writes the header, textures,
  materials and start points (`kn5.write_streamed`). All materials of the `.mtl` have fixed numbers.
- The materials and their textures (`make_obj.write_mtl`) are made in a thread beside the scenery's processes, which read
  nothing it makes.
- Windows locks a cache file for a moment while another process replaces it: `parallel.retry_locked`.
- Processes are not recycled (`max_tasks_per_child` hangs under Python 3.12, CPython gh-115634).
- Each pool worker watches its parent's process sentinel and exits if that process dies, even while waiting for work.
- On Windows they run as `Map2Lap Worker.exe`, a build as `Map2Lap Build.exe`, the generator page as `Map2Lap Server.exe`:
  named copies of python.exe (`app/named.py`), in `python/` or, with a venv, `out/python/`.

Editor work also uses bounded process pools. Selection preparation (`track/surfaceindex.py`) evaluates missing loaded tiles
from four tiles onward, using at most logical cores minus one and free RAM / 0.5 GB; the browser submits batches of at most
32 tiles. Completed selection files are reused across openings and saved copies. Apply describes missing paint views from
four tiles onward (`app/trackdetail.prepare_views`); Save prepares missing native resources from six tiles onward
(`app/tracknative.prepare`). These two use the configured core share and the build pool's RAM bound. Below their thresholds,
the work stays in the server process. Apply reads selection masks in portions of 64 tiles; that is not a selection cap.

## Imports

`server.py` and `generator.py` find the packages in `src\` because Python puts a script's folder on its path; the tools add
`src\` themselves; the Windows release's Python has it in `python314._pth` (a `._pth` adds no script folder).

## What each country gets

`generator.road_rules` takes the anchor's country (ISO code from Nominatim, like the track name) and passes BeamNG.Earth's
rules to every road tile: driving on the left (parking side, signs, signals, crossings), mph, the road markings' style,
buried low-voltage lines, street lamp spacing.

## Build caches and comparisons

### Terrain and scenery build options

`app/buildoptions.py` validates the per-track choices: terrain spacing (2 m by default, optionally 1 m), parked cars
(on by default), minimum tree spacing and ground texture quality (SD by default). The new-track form starts tree spacing at 2 m. Its slider runs from
Original (0 m) to 20 m in 0.5 m steps. The data reader still accepts saved spacings up to 100 m; missing values in old
tracks and codes mean Original. The generator page captures the choices
when starting each build and passes an isolated child environment. They are saved in the anchor and track settings;
Rebuild, Build as copy and track codes retain them. Route rebuilds and copies also accept a changed corridor width,
falling back to the track's saved width when none is supplied. Circuit rebuilds and copies reuse the installed lap
from `data/map2lap_route.txt` and place the timing lines and grid on the rebuilt road. If the saved line is missing,
the generator routes the pins again. A malformed saved line stops the rebuild. Choices beyond the legacy defaults use `M2L2-`
codes so older applications refuse them rather than silently ignoring them; HD uses `M2L3-`. SD with 2 m terrain, cars on and Original trees retains `M2L1-`.

`BNE_GROUND_QUALITY=hd` samples all terrain colour layers at 4096 px per tile instead of SD's 2048 px:
land cover, roads, paths, forecourts, stream banks and pitch lines, including procedural wear and colour variation.
The unchanged guard fraction keeps world phase and geometry identical (about 6.5 cm per colour texel instead of
12.9 cm). This costs four times the baked colour-texture memory. Selection facts retain their 2048 px budget;
HD overlay coverage is averaged into it. Standalone road asphalt retains its 512 px source rather than the SD
terrain-sized reduction. Bankett/edge decals are redrawn at 512 × 2048 instead of 128 × 512, preserving physical
size and pattern. Other standalone surfaces, such as sidewalks, kerbstones and ballast, already retain their source
resolution and continue to do so; HD does not invent detail absent from a source.

`track/groundquality.py` additionally retains the generator's 512 px meadow, forest-floor and rock images at their
original 8 m repeat, using recorded labels/alpha masks and the Editor's classic multilayer shader. The finer baked
image stays in its fourth layer, preserving road wear and other surfaces. Editor and AC use the same embedded images.
HD changes colour resolution/materials/UVs, not the terrain lattice, positions, triangles or physics, and uses no
Painted library assets. Rebuild scenery to change colour resolution: converting kept OBJ files alone only applies
the shared detail layers to the colour images already present.

`BNE_AC_GRID_M=1` selects a 1 m lattice for a command-line build; `2` explicitly selects the normal lattice.
`engine/acgrid.py` owns the terrain spacing. Collision/visible ground, water lowering and the
road mesh's draping share it; the legacy BeamNG heightmap dimensions stay unchanged. The existing native draping
kernel accepts the spacing as an argument. Road centre lines and the source elevation are unchanged.

For example, in Bash, use existing test tracks:

```bash
BNE_AC_GRID_M=1 .venv/bin/python tools/measure.py rechberg_test griffen_bruecke_test heiligenblut_test --install
```

Use the same switch with `--kn5` or a later build of the same kept files. It is included in the code key, so the two
grids do not share cached road meshes. Do not set `BNGE_PLAN_RUN` manually between variants. Build facts record
`terrain_cell_m`; `measure.py --holes` reads that spacing even without the switch.
The Editor's serialized height-change fields keep their fixed 2 m edit lattice; their interpolated offsets apply to
the vertices of either terrain spacing. Smooth road still samples that 2 m lattice, so a height feature only on an
odd-metre vertex can remain. Increasing mesh density alone does not smooth the source road or its height profile.

`BNE_PARKED_CARS=0` omits car meshes, collision and car objects while retaining parking spaces and markings.
Parking rows use the actual offset curb or aisle length at bends. Mapped parking aisles block the synthetic grid
inside a mapped lot; accepted stalls are shared with the painted lines, including across tile edges. A road tile
knows only its own buildings, so OBJ assembly checks parked cars and stall lines against the finished ground-level
footprints of neighbouring tiles before writing meshes and retained Editor source (`parking.py`,
`track/buildscenery.py`, `track/make_obj.py`).
Before writing those shared stalls and lines, the road tile also removes a spot when its car footprint meets the
actual same-level sidewalk slab. It reuses the sidewalk sweep for the parked cars, collision and saved Editor source;
a road-level spot below a bridge walkway remains available.
Scenery also checks every generated tree and bush against the accepted parking spaces in its tile and
neighbouring tiles. A plant whose foot lands inside a marked bay is omitted even when car density leaves
that bay empty, so changing the density later cannot uncover a plant beneath a car.
`tools/measure.py --build` and `--install` give test tracks the generator page's 2 m initial tree spacing when
`BNE_TREE_SPACING_M` is unset. An explicit environment value still wins; existing tracks keep their saved choice.
`BNE_TREE_SPACING_M=<metres>` applies the Editor's deterministic nested spacing rule to trees across all tile parts
after scenery generation (`track/buildscenery.py`). It removes placements from the part side files before collecting
the installed TreeFX/object lists or making an Editor source. Bushes are excluded. No reversible hidden-tree layer
is written: the Editor can thin the built subset further but cannot restore trees the build removed. Rebuilding from
the map with a lower spacing is a new generation, not restoration of retained tree data.

Compare the same routes and data in both modes before deciding on a default: build time, ground triangles, KN5 size,
`measure.py` profiles and a drive in AC. Four times as many terrain cells do not imply four times the total build cost.

### Cache ownership

The map-data limit and Settings' **Map data / Clear now** own only the build cache. Editor import preparations and
prepared preview/Save files (`cache/track-details`, `native-masks`, `native-library`, `track-textures`, `materials`,
`models` and `builtin-objects`, plus the reserved `editor` folder) are excluded from its size, scans and deletion
(`app/mapcache.py`, `EDITOR`). Existing paths and files stay usable; a build never evicts them to meet its map-data limit.
This separation sets no automatic size limit for Editor caches. Saved object lists and lossless build masks remain track
data under `data/map2lap_objects.json` and `data/map2lap_editor`, independently of both caches.

- A build's processes share their plans: `generator.build` sets `BNGE_PLAN_RUN` to a new name, the first process to plan a map
  cell writes it to `cache/plans/<name>`, the others read it, and the folder goes after the build (`plancache.one_run`). Complete
  plans also stay in the revisit cache, under the code key; a plan made while something failed is read by the whole build too, and
  marks each reader's `revisit.fault`. Set by hand, that name stays with its folder, whose path holds no code: **the same name
  after a code change gives the old plans**.
- The revisit cache (a map cell's facts and complete plans) is keyed by a hash of the engine code, `engine/buildings/styles.json`, the native module, the Python
  and numpy versions and the `BNE_*` environment variables but the cache's own three (`revisit.code_key`). `BNE_COLD=<a value not used before>` forces a fresh run, the same
  value again reads what that run kept; `BNE_REVISIT=off` neither reads nor keeps anything.
- `tools/measure.py` builds leave a trace in `out/trace/<track>` (`buildtrace.py`): the workers' tiles in order, each cell's plan
  with a hash, each fault. The same code can differ when a result hangs on what its process saw first; look there.
- To prove a refactoring changes nothing: `tools\compare_parts.py save before` (the test tracks as built), the change,
  `tools\measure.py --all --build`, `tools\compare_parts.py compare before` (0 differ, else the files, OBJ objects and what
  moved; it fails on a track not built with this engine code: `--all` leaves out the long ones, `--long` builds those).
