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

`app/trackview.py` scans an installed Map2Lap track's kn5 with `track.kn5.scan`: offsets, sizes, materials and start points,
without loading all meshes or textures into memory. The page requests their bytes separately, with the file's revision;
a changed or partially written file returns HTTP 409. The viewer loads nearby meshes first (six at a time, twelve textures), counts
memory against its configured limit and disposes meshes and textures when the track changes. The limit estimates RAM and GPU use;
it does not include all browser overhead. Meshes and textures above it stay out of the preview; `tools/editor_memory.py` says what a
track takes. A long track is tens of thousands of requests: GETs share kept connections (HTTP/1.1), and a part cut off on its way is
asked for again. The camera moves as in a building game, level over the ground (`view.ts`), with no state kept between moves that
could lie far off: what it turns around or zooms towards is looked up each time. The middle of its view stays within the track's meshes plus a margin (the camera may stand beyond, to look back), it stays
below a height the distant terrain can be seen from; where no ground lies under it, the last one found counts.

The Editor views and inspects tracks and leaves out single objects: trees and bushes on any track, by their count of
triangles; what the build lists (`track/objectlist.py`: cars, houses with their signs and doors, poles with their wires, street
furniture, signs, rocks, fences, gas stations, leisure grounds) on tracks built with the list. A left out one's triangles shrink to a point,
so the others keep their numbers; the list, a draft (`app/trackedits.py`, `out/edits/<track>.json`), is saved a moment after each
change, written whole, and refused when another tab or a build changed the track since it was read. It holds for one state of
the kn5 shown. Save in the Editor (`app/trackcopy.py`) writes the track from it, in its place or as a copy: the folder copied to a
hidden temp folder, the kn5 without those triangles (`kn5.without_faces`: what doesn't change is copied as it stands), the object
list fitted to it, the recipe in its map2lap.json, then moved into place (refused while AC holds the kn5). No build. The first Save
keeps the kn5 as it was as the track's source (`app/tracksource.py`, `out/sources`): the Editor shows the source while the recipe
counts (`trackview.served`), so what was deleted can come back after any Save. In its place on one disk the old file itself becomes
the source (a hardlink until the old folder goes, taken back if the Save fails), which needs no room for a copy; a new track leaves the
original installed, so its source is a true copy. A Save, a build and a deletion never run at once
(`trackcopy`'s lock, asked under the server's). Building a saved track again starts from the map and has none of it: the page
warns, and a new track from the map whose name would replace it is refused; sources no track of their AC folder names go at the next
start, and none while that folder isn't there. Planned editing tools will use the kept build files; viewing needs only the
installed track. The page keeps build files by default, including `build.log`; Settings → Editor → Build files can
turn that off or delete them. Existing saved preferences stay in effect.

## Parallel (`track/parallel.py`)

Tiles, scenery, minimap and kn5 meshes run per tile in a `ProcessPoolExecutor` (cores − 1 processes or the share set in
Settings, on Windows at most 61, at most free RAM / 1.5 GB). Processes rather than threads because BeamNG.Earth's state
(`blockworker._s`) is global: every process builds it in its initializer.

- The workers share their plans: the first to plan a map cell writes it, the others read it (`plancache.one_run`, AGENTS.md
  under Builds). Two builds of the same code that differ: `tools/build_trace.py`, round after round: `tools/stability.py`.
- OBJ faces use **relative (negative) indices**: part files can be concatenated without renumbering.
- kn5: every process writes its mesh nodes as bytes to `obj/kn5_parts/<k>.bin`, the main process writes the header, textures,
  materials and start points (`kn5.write_streamed`). All materials of the `.mtl` have fixed numbers.
- The materials and their textures (`make_obj.write_mtl`) are made in a thread beside the scenery's processes, which read
  nothing it makes.
- Windows locks a cache file for a moment while another process replaces it: `parallel.retry_locked`.
- Processes are not recycled (`max_tasks_per_child` hangs under Python 3.12, CPython gh-115634).
- On Windows they run as `Map2Lap Worker.exe`, a build as `Map2Lap Build.exe`, the generator page as `Map2Lap Server.exe`:
  named copies of python.exe (`app/named.py`), in `python/` or, with a venv, `out/python/`.

## Imports

`server.py` and `generator.py` find the packages in `src\` because Python puts a script's folder on its path; the tools add
`src\` themselves; the Windows release's Python has it in `python314._pth` (a `._pth` adds no script folder).

## What each country gets

`generator.road_rules` takes the anchor's country (ISO code from Nominatim, like the track name) and passes BeamNG.Earth's
rules to every road tile: driving on the left (parking side, signs, signals, crossings), mph, the road markings' style,
buried low-voltage lines, street lamp spacing.
