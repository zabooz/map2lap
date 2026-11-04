# Following up a report from AC

## What a session leaves

The Track Debug app (generator page → Settings → Testing; `src/acapp/TrackDebug`, `app/debugapp.py`) shows the route metre,
coordinates, G values and the build's versions. It keeps the last 15 s of the drive at 50 Hz. **F10** (in the window: any
key or wheel button) or "Mark" saves a spot with those 15 s and the next 5 s, plus a screenshot; "Start recording" records
the whole drive.

Every session writes `Documents\Assetto Corsa\map2lap_debug\<track>_<time>\`:

| File | What |
|---|---|
| `info.txt` | the track's build, versions, track code and map data |
| `marks.csv` | route metre, offset from the line, AC and lat/lon position per mark |
| `mark_NN.csv` | the 15 s before and 5 s after a mark: G forces, suspension travel |
| `mark_NN.jpg` | a screenshot |
| `drive.csv` | the recorded drive |
| `map2lap.json`, `map2lap_route.txt` | the track's settings and route |

## Finding the cause

1. `tools\mark.py [track]` reads the newest session with a mark or a recorded drive: the passes, the hits, hanging axles,
   whether the car was beside the road, the physics under the car (1ROAD, 1GRASS, ... from `out/tracks/<track>`), and the
   `measure.py --profile` / `--surface` commands for that stretch. The profile tells deck from ground; `--surface` which
   physics lies under the line (the asphalt seen on the ground is only the terrain's texture: its object's prefix decides
   the grip).
2. `tools\from_debug.py <folder>` builds that track here with the route exactly as it was built (no OSRM) and says where
   this Map2Lap or its map data differ from the sender's (`--upto obj`: only the OBJ parts, for the measuring tools).
3. Find the spot. The route metre is the same count in `measure.py` (`--from/--to`) and `check_drive.py`. AC coordinates:
   x east, z = −north, y up; the anchor is in the track's `data/map2lap_route.txt`.
4. See what was built there. A command-line build, and one from the page with "Keep build files", keeps
   `out/tracks/<name>/` (tiles, `obj/parts/t_<tx>_<ty>.obj`; from the page also its `build.log`): the OBJ
   parts name it (materials such as `nocol_walk_sidewalk`, `nocol_rail_rail`, `nocol_bld_fac`).
5. Find out why, from the code that decided it: call the module on the map data around the spot (for example
   `roads.road_specs` for a road's class, width and sidewalks, `railways.parts` for tracks) after
   `generator._init_worker(cache)`. At a tunnel portal, start with `tools\portal.py <track> <AC x> <AC z>`.

Tools for a spot (all of them: the table in AGENTS.md): `tools\measure.py <track>` measures any built track,
`tools\heights.py <track> --from <m> --to <m>` says why the ground lies at that height (`--decks`, `--walls`, `--road`),
`tools\map_spot.py <track> --route <m>` draws the spot's roads,
`tools\check_drive.py <track> --all-roads` finds holes, jumps and terrain above the road, `tools\stretch.py` rebuilds a
stretch fast, and `--holes` on `measure.py` sorts the gaps in the ground by whether a car gets there.

## Sharing a track

A track code (`M2L1-…`, `app/trackcode.py`) holds a track's inputs: pins and corridor or area, title, track version. It
holds no route: OSRM routes the pins again. A build stores its map data's versions (`generator.data_versions`) in
`data/map2lap.json` beside the code.
