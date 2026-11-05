# Map2Lap

Map2Lap builds Assetto Corsa tracks from real roads: map data and elevation in, a driveable track out. Its road,
grading and building code is based on BeamNG.Earth, a mod that streamed the real world into BeamNG.drive.

## Words with more than one meaning

**Generator page**:
The local web page end users build and manage tracks with (`src/server.py`).
_Avoid_: server, the page's server

**Editor**:
The generator page's tab that shows and inspects a built track in 3D, from its kn5 (`app/trackview.py`, `ui/src/editor`).
Geometry editing is not available yet.

**Engine**:
The folder `engine/`: our roads, grading, buildings and scenery code, based on BeamNG.Earth's server folder.
_Avoid_: server, vendor code, BeamNG code

**earthd**:
BeamNG.Earth's live server that fed the game while driving; removed. Older comments mean it by "the server".
_Avoid_: the server

**Tile**:
A 256 m square of the anchor frame (`roads.TILE`); a build makes roads, terrain and scenery per tile.
_Avoid_: block, chunk, cell

**Geotile**:
A square of a global Web-Mercator grid (zoom 17, about 240 m) with its own frame; bridge and tunnel chains are solved
in it, so they come out the same whatever the anchor.
_Avoid_: tile

**Map cell**:
A zoom-14 Web-Mercator square of map data (`mapcells`), fetched and cached as one piece.
_Avoid_: cell, tile

**Cut line**:
The line just behind the face of a wall between two roads at two levels, along which the ground is cut (`scenery.wallcut`, a tile's
in `tiles/wallcuts_<tx>_<ty>.json`).

**Terrain cell**:
One 2 m square of the terrain grid.
_Avoid_: cell, pixel

**Cut cell**:
A terrain cell the cut line of a wall between two roads crosses, drawn apart (`scenery.wallcut`): the lower road's level up to
the line just behind the wall's face, the upper's behind it, an upright skirt between them, not the grid's ramp in front of the
wall.
_Avoid_: patch

**OBJ part**:
One file in `out/tracks/<name>/obj/parts/`, a tile's geometry before the kn5 (`t_<tx>_<ty>.obj`).
_Avoid_: part

**Package part**:
One module of the packages `roads/`, `grading/` or `buildings/` (for example `roads/levels.py`).
_Avoid_: part, submodule

**Ground part**:
A stretch of a road between its bridges and tunnels (`roads.ground_parts`); a bridge part and a tunnel part are the
stretches on a bridge and in a tunnel.
_Avoid_: part, segment

**Level**:
Two things: a road's `level` in the map, its layer over or under other roads (`roads/levels.py`), and a water level.
_Avoid_: level alone where both can be meant

## Place

**Anchor**:
The origin of a build's local frame: the middle of the route or area. Its id is `aid`.
_Avoid_: origin, centre

**Frame**:
The east-north-up plane around the anchor, in metres (x east, y north, z up).
_Avoid_: ENU without the anchor

**AC coordinates**:
Assetto Corsa's axes: x east, y up, z south (z = -north).

**Pin**:
A point the user sets on the map; the route runs through the pins in order.
_Avoid_: waypoint, stop

**Height pin**:
A road's end held at the height of the stronger road it ends on, so the two meet at one height (`_Ends._pins`, `plan_roads`' `pins`; `heights.py --road ... --steps` lists them).

**Cheap bushes**: billboards on painted shrubland that no map measures (`scenery/bushes.py`, objects `nocol_bush_<tx>_<ty>`): noise gives them groups, gaps and now and then a row; near only and without shadows. The bushes the canopy data finds stay `nocol_trees_bush_`.

**Debug stretch**:
The part of a track holding a bug, built into AC to drive it: `<track>_<route metre>_debug` (`tools/debug_stretch.py`). No test track, and deleted when the fix is in.

**Route**:
The road line OSRM finds through the pins, plus the run-off behind the end pin.

**Corridor**:
The width either side of the route that a build covers.

**Route metre**:
Metres along the route from its start, as the Track Debug app counts them; reports and spots use them.
_Avoid_: km mark, distance

**Spot**:
A stretch of a test track worth looking at, named by its route metres.

## Roads, bridges and tunnels

**Raw elevation**:
The ground's height from the elevation data, before grading.

**Plan**:
One road's height profile: its centre line with a target height per vertex.
_Avoid_: profile (used for bridges' and tunnels' too)

**Plan pack**:
The plans around a spot as the grading reads them (`grading.PlanPack`). The same plans come again in many packs, leaving
out a few each; what two plans give each other stays on the plan (`Plan.beside`).

**Grading**:
Making the ground follow the plans: roads level and smooth, the ground around them blended in.

**Graded ground**:
The terrain after grading; what the car drives on beside bridges and tunnels.

**Road lift**:
The 4 cm the physics ground is raised under roads (`ROAD_LIFT`); it is in the mesh, not in a plan's heights.

**Deck**:
A bridge's driving surface.

**Deck depth**:
How far a deck's slab and girders reach under its road, per bridge part (`Spec.depth`, `roads.deck_depth`): it sets the concrete's
underside, the piers' tops and the clearance the deck keeps over what it crosses.
_Avoid_: depth alone (the water's lowering is `depth` in the code too)

**Abutment**:
The end of a bridge where it meets the ground.

**Junction pad**:
A paved plate under the roads where three or more carriageways meet at a deck's end (`roads.deck_pads`): the corner of a turn
or the wedge where a ramp leaves, which the map leaves open over whatever lies below. In the OBJ it is part of the deck
object; `measure.py --profile` marks it.

**Pier**:
A support under a bridge's deck, between its abutments: about one per span (`bridges.PIER_SPAN_M`).

**Approach**:
The ground road leading onto an abutment or into a tunnel portal, ramped to meet it.
_Avoid_: ramp, lead-in

**Portal**:
The mouth of a tunnel.

**Hull**:
A tunnel floor's height line: the lower convex hull of the ground along the tunnel and the road beyond its portals.

**Chain**:
Bridge or tunnel parts that follow on from each other, solved together once per process, across tiles (`roads/chains.py`).

## Water

**Water area**:
A polygon of the map's water layer (Overture `base/water`): a lake, a river's area, the sea. `scenery/water.py` lowers the
ground under it and lays a water mesh on it.
_Avoid_: lake for all of them

**Water line**:
A stream or river the map has only as a line: painted into the ground's texture, with no water mesh and no lowering.

**Water level**:
A water area's surface height in a tile: the 25th percentile of the raw elevation inside it; on a river it runs downhill
with the bed.

**Lowering**:
How far a ground vertex goes down under a water area (`depth` in the code): past the shore a little, plus whatever of the
ground stood above the water level.
_Avoid_: depth outside the code

**Water mesh**:
The surface drawn on a water level: the objects `nocol_water_*`, and `nocol_foam_*` along the shore.

## Build

**Build**:
One run of the generator: route, tiles, scenery, distant view, kn5, into a track folder in AC.

**Distant view**:
The coarse terrain around the corridor up to 40 km (`scenery/farview.py`, the OBJ part `far.obj`). It uses the raw elevation:
no grading, no lowering. `measure.py --build` and `from_debug.py --upto obj` leave it out.
_Avoid_: horizon, far terrain

**Worker**:
One process of a build's pool (`track/parallel.py`), running tiles, scenery, minimap and kn5 meshes: on Windows `Map2Lap Worker.exe`.
_Avoid_: thread

**Plan run**:
The folder `cache/plans/<name>` a build's workers share their plans in (`plancache.one_run`, `BNGE_PLAN_RUN`); it goes after the
build.

**Fault**:
Something a build may read failed, was not there yet, or a fallback stood in for it (`revisit.fault`): that build goes on, and what
it made then stays out of the revisit cache.

**Build trace**:
What a test track's last `measure.py` build did, in `out/trace/<track>` (`buildtrace.py`): for two builds of the same code
that differ. Read with `tools/build_trace.py`.

**Kept build**:
A build's files left in `out/tracks/<name>/` (tiles and OBJ parts): what the tools in `tools/` read.

**Session**:
The folder one run of the Track Debug app writes (`Documents\Assetto Corsa\map2lap_debug\<track>_<time>\`): marks, recorded
drive, the track's settings and route. `from_debug.py` builds a track from it.

**Test track**:
A route in `tools/test_tracks.json`, short or long, with its spots and reference values; regression checks run only
there.

**Reference**:
The `measure.py` values a test track's build is compared with.

**Revisit cache**:
A map cell's facts and complete plans kept on disk, keyed by the code key; a later build of the same place reads them back.

**Code key**:
A hash of the `engine/` code, the native module, the Python and numpy versions and the `BNE_*` environment variables but
`BNE_REVISIT`, `BNE_REVISIT_MB` and `BNE_REVISIT_SKIP`; a new one makes the next build cold.

**Cold build**:
A build that finds nothing for its code key in the revisit cache and computes everything (`BNE_COLD` with a value not used
before forces one, `BNE_REVISIT=off` every time).
_Avoid_: fresh build, clean build

**Track code**:
A track's inputs in one shareable line (`M2L1-...`), built again from them on the generator page.

**Track version**:
The version of how built tracks look and drive (`TRACK_VERSION`); separate from the app's `VERSION`.

## Assetto Corsa

**kn5**:
Assetto Corsa's model file of a track; Map2Lap writes it with its own writer.

**Surface prefix**:
The start of an object's name that decides its physics in AC: `1ROAD_`, `1GRAVEL_`, `1GRASS_`, `1KERB_`, `1WALL_`,
`nocol_` (no collision).

**CSP**:
Custom Shaders Patch, the AC extension Map2Lap's tracks rely on (lights, `ext_config.ini`).

**Track Debug app**:
Map2Lap's CSP app in AC: shows the route metre, marks spots, records drives.

**Mark**:
A spot saved from AC by the Track Debug app, with the 20 s of driving around it and a screenshot (`tools/mark.py` reads it).

**Comic look**:
Map2Lap's drawn style: textures painted in code, not photos.
_Avoid_: toon, cartoon

## BeamNG.Earth

**BeamNG.Earth**:
The project `engine/` is based on: a BeamNG.drive mod with a live server (earthd).

**The mod, the game**:
In older comments: BeamNG.Earth's game mod and BeamNG.drive. Neither is part of Map2Lap.
