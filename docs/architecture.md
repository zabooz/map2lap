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
     out/tracks/<name> unless "Keep build files" is on
```

A build from the command line keeps its work folder:

```powershell
.venv\Scripts\python.exe src\generator.py --name my_test --title "My Test" --width 120 <lat,lon> <lat,lon>
.venv\Scripts\python.exe src\generator.py --name area_test --title "Area Test" --area 46.655 14.620 46.665 14.640
```

Single steps run as modules from `src\`, e.g. `..\.venv\Scripts\python.exe -m track.kn5 <file.kn5>`.

## Parallel (`track/parallel.py`)

Tiles, scenery, minimap and kn5 meshes run per tile in a `ProcessPoolExecutor` (cores − 1 processes or the share set in
Settings, at most 61, at most free RAM / 1.5 GB). Processes rather than threads because BeamNG.Earth's state
(`blockworker._s`) is global: every process builds it in its initializer.

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
