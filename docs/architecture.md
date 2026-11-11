# How a build runs

Map2Lap runs BeamNG.Earth's server code (`engine/`, developed further here) without the game and writes the
result with its own kn5 writer: no Blender, no ksEditor.

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
     out/tracks/<name> unless "Keep build files" is on (the page's default)
```

A build from the command line keeps its work folder:

```powershell
.venv\Scripts\python.exe src\generator.py --name my_test --title "My Test" --width 120 <lat,lon> <lat,lon>
.venv\Scripts\python.exe src\generator.py --name area_test --title "Area Test" --area 46.655 14.620 46.665 14.640
```

Single steps run as modules from `src\`, e.g. `..\.venv\Scripts\python.exe -m track.kn5 <file.kn5>`.

## Generator page and Editor

The page is React and TypeScript in `ui/`, built with Bun into the committed `src/web` files. `server.py` serves these
and the `/api/` endpoints. Bun is needed only for development; `bun run dev` proxies API calls to the running Map2Lap.
The Editor's three.js code loads on the first visit to its tab; camera and mesh data live outside React.

The Editor's loading, drafts, saving and tools: [editor.md](editor.md).

The generator and the Editor's Save write the same ground material, stock CSP `fuPBR_multilayer` straight in the kn5
(`track/groundmaterial.py`, `pbr`): a new build around its baked tile images, Save for square-repeat assignments; the
browser draws both physically. Rectangular repeats keep the legacy float2 path. Save emits only
track-local configuration and textures, not global CSP shader files. Shader inputs and limits:
[ac-rules.md](ac-rules.md#how-the-ground-is-built).

In the browser, `scene/view.ts` coordinates the scene and `scene/trackTextures.ts` owns texture/material loading, paint
updates and their lifetime. Meshes load nearest first and remain until the track changes. The memory limit stops further
loading; moving the camera does not evict distant meshes and resume loading around its new position.

An Editor Save starts from the retained source and reapplies the draft, rather than modifying the last output in place.
Before writing, it prepares missing native masks, photos and regional geometry on a bounded pool and reuses complete
content-addressed cache entries (`app/tracknative.py`). It still writes and validates a complete replacement KN5.
Regional painted ground currently retains the original tile image and an additional ring/phase-adjusted image for its shader;
PBR does not remove that copy. The source and portable paint bundle remain necessary for subsequent edits and transfer.

## Parallel (`track/parallel.py`)

Tiles, scenery, minimap and kn5 meshes run per tile in a `ProcessPoolExecutor` (cores − 1 processes or the share set in
Settings, on Windows at most 61, at most free RAM / 2 GB). Processes rather than threads because BeamNG.Earth's state
(`blockworker._s`) is global: every process builds it in its initializer.

- The workers share their plans: the first to plan a map cell writes it, the others read it (`plancache.one_run`, see Build caches below). Two builds of the same code that differ: `tools/build_trace.py`, round after round: `tools/stability.py`.
- OBJ faces use **relative (negative) indices**: part files can be concatenated without renumbering.
- kn5: every process writes its mesh nodes as bytes to `obj/kn5_parts/<k>.bin`, the main process writes the header, textures,
  materials and start points (`kn5.write_streamed`). All materials of the `.mtl` have fixed numbers.
- The materials and their textures (`make_obj.write_mtl`) are made in a thread beside the scenery's processes, which read
  nothing it makes.
- Windows locks a cache file for a moment while another process replaces it: `parallel.retry_locked`.
- Processes are not recycled (`max_tasks_per_child` hangs under Python 3.12, CPython gh-115634).
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

- A build's processes share their plans: `generator.build` sets `BNGE_PLAN_RUN` to a new name, the first process to plan a map
  cell writes it to `cache/plans/<name>`, the others read it, and the folder goes after the build (`plancache.one_run`). Complete
  plans also stay in the revisit cache, under the code key; a plan made while something failed is read by the whole build too, and
  marks each reader's `revisit.fault`. Set by hand, that name stays with its folder, whose path holds no code: **the same name
  after a code change gives the old plans**.
- The revisit cache (a map cell's facts and complete plans) is keyed by a hash of the engine code, the native module, the Python
  and numpy versions and the `BNE_*` environment variables but the cache's own three (`revisit.code_key`). `BNE_COLD=<a value not used before>` forces a fresh run, the same
  value again reads what that run kept; `BNE_REVISIT=off` neither reads nor keeps anything.
- `tools/measure.py` builds leave a trace in `out/trace/<track>` (`buildtrace.py`): the workers' tiles in order, each cell's plan
  with a hash, each fault. The same code can differ when a result hangs on what its process saw first; look there.
- To prove a refactoring changes nothing: `tools\compare_parts.py save before` (the test tracks as built), the change,
  `tools\measure.py --all --build`, `tools\compare_parts.py compare before` (0 differ, else the files, OBJ objects and what
  moved; it fails on a track not built with this engine code: `--all` leaves out the long ones, `--long` builds those).
