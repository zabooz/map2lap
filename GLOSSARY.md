# Map2Lap

Map2Lap builds Assetto Corsa tracks from real roads: map data and elevation in, a driveable track out. Its road,
grading and building code is based on BeamNG.Earth, a mod that streamed the real world into BeamNG.drive.

## Words with more than one meaning

**Generator page**:
The local web page end users build and manage tracks with (`src/server.py`).
_Avoid_: server, the page's server

**Editor**:
The generator page’s 3D tab for inspecting and editing an installed KN5 track. Draft edits become track files on
**Save**, without rebuilding from map data; see [editor.md](docs/editor.md).

**Object list**:
A track’s `data/map2lap_objects.json`: object ids, triangle ownership across merged meshes, and parent/child
relationships. TreeFX placements have their own section (`track/objectlist.py`).

**Tree spacing**:
The Editor's reversible thinning layer, a minimum distance between tree trunks on the ground. It applies to all trees or a
retained selection; zero restores its hidden trees. The setting survives Save and reopening, separate from manual deletion.

**Object group**:
A reusable Library mixture of models, weights, size ranges and randomization settings. The Groups brush plants
independent model instances in those proportions; a completed stroke is one Undo step. Unlike a **Sort**, it describes a
mixture to plant.

**Sort**:
The finest object category used by Select all/delete all; **kind** is the coarser category (for example street furniture
/ bench). Trees use their TreeFX model; older object lists fall back to kind.

**Save**:
Writes source plus draft into the track or a copy, with a recipe (`app/trackcopy.py`). The result appears under Edited
and cannot be rebuilt in place. _Avoid_: rebuild, modded track.

**Height change**:
An additive raster of whole-millimetre offsets on the ground’s 2 m lattice, zero at its edge (`app/trackheights.py`).
Save reapplies it to the source, so repeated Saves do not compound it.

**Placement**:
An object’s translation, upright rotation and scale about its recorded pivot (`app/placement.py`). It applies from the
source before height changes; children and attached wires follow it.

**Band**:
The legacy linear road-height solver/API (`app/trackband.py`). Its **own road** is the driveable surface belonging to
that line, excluding neighbouring roads at other levels; the Road region tool reuses its helpers.

**Road region**:
The mapped network selected by Smooth road’s terminal/branch points, clipped by actual road paint (`app/roadregion.py`).
Orange shows selected road, faint orange the terrain transition; the driving route does not constrain it.

**Object copy**:
An independent source-object instance with frozen member poses and `copy_<id>#<member>` ids (`app/trackcopies.py`).
Houses bring children/collision; copied poles have no wires.

**Brush**:
A tool’s ground ring and sampled stroke (`tools/useBrush.ts`). Its minimum 2 m radius reaches the ground lattice; the
tool determines what the stroke changes.

**Tool options**:
The active tool’s overlay controls (`tools/ToolOptions.tsx`), with Shift/Ctrl/Alt/Ctrl+Alt modifiers. Select uses Shift
for all matching and Ctrl to add/remove.

**Toast**:
A notice in the page’s top-centre stack, including Editor progress/errors (`components/toastStore.ts`). Dialogs and
build status own their errors separately.

**Inspector**:
The resizable right panel with Selection, Properties and Details tabs. Selection stays pinned; separate Under pointer
information follows the mouse.

**Material library**:
Immutable image-map packages with physical repeats and source information under `library/materials`. Original colour,
optional +Y normal and linear roughness maps are retained; preparation caches are disposable. See
[editor-library.md](docs/editor-library.md).

**Model package**:
An immutable canonical GLB plus scale, anchor, category and collision settings under `library/objects` or shipped
`assets/library/objects`. Conversion/import choices are baked into that GLB; the prior upload is not a second retained
original.

**Model snapshot and instance**:
A snapshot freezes a model package when applied; a stable instance id binds it to the track. Editable poses stay in
`placed`, and compiled provenance identifies already-written geometry after transfer.

**Built-in objects**:
Map2Lap’s own painted scenery in the Library (`app/builtinobjects.py`, `scenery/catalogue.py`). Packages are prepared on
demand; trees use native TreeFX, other objects ordinary model meshes. Deleting an entry hides it without removing placed
snapshots.

**Custom Shaders Patch (CSP)**:
The AC extension required for Map2Lap’s track rendering, installed separately in the AC folder. Settings
detects/installs it on request (`app/csp.py`); it does not run the browser preview.

**Ground texture edit**:
An immutable ground-selection mask plus material snapshot, referenced by ordered draft/recipe paint ids
(`app/trackpaint.py`). Save preserves source collision; native regions allow at most four local contributors. See
[editor-ground.md](docs/editor-ground.md).

**Texture settings**:
One applied texture’s normal strength, roughness/gloss and repetition variation (`trackpaint.LOOK`). They change that
application, leaving its library package and other applications intact. _Avoid_: material properties (the package
defaults).

**Selection index**:
Disposable prepared paint components/masks under `out/editor-selection` (`track/surfaceindex.py`). Normal roads select
by mapped chain, Shift selects all prepared matching regions; incomplete selections must identify their displayed tile
subset on Apply.

**Source**:
The unchanged pre-Save KN5/object list retained under `out/sources` and shared by saved copies. The Editor uses it while
its recipe matches, allowing baked deletions to be restored; it belongs to one AC folder.

**Edit list**:
The draft at `out/edits/<track>.json`, bound to the shown source revision (`app/trackedits.py`). It holds deletions,
placements, heights, copies, models, paints, wall edits and tree spacing; a mismatched base makes it outdated.

**Build facts**:
A track’s KN5-bound `data/map2lap_editor` manifest and tile archives: lossless paint masks, map features and original
build descriptions (`track/editorinfo.py`). Save preserves them independently of kept build files; current edits remain
separate.

**Painted ground selection**:
A connected material contribution picked from retained lossless masks, including soft edges and neighbouring tiles. Its
highlight changes no draft and grants no object-editing actions.

**Engine**:
The folder `engine/`: our roads, grading, buildings and scenery code, based on BeamNG.Earth's server folder.
_Avoid_: server, vendor code, BeamNG code

**earthd**:
BeamNG.Earth's live server that fed the game while driving; removed. Older comments mean it by "the server".
_Avoid_: the server

**Tile**:
A 256 m square of the anchor frame (`roads.TILE`); a build makes roads, terrain and scenery per tile.
_Avoid_: block, chunk, cell

**Tile image**:
A tile’s 2048 px baked ground texture: 1984 px of ground with a 32 px repeated-edge guard on each side, at world phase
(`scenery/ground.phased`). Save reuses it as a layer. _Avoid_: base copy, ring image.

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
A road's end held at the height of the stronger road it ends on, so the two meet at one height (`_Ends._pins`,
`plan_roads`' `pins`; `heights.py --road ... --steps` lists them).

**TreeFX trees**:
CSP’s instanced 3D trees/bushes, placed by `extension/trees/trees.txt` using `.bin` models (`scenery/treefx.py`). The
object list keeps stable `trees#<number>` ids; Save derives placements from source and draft, without KN5 tree geometry.

**Cheap bushes**: bushes on painted shrubland that no map measures (`scenery/bushes.py`), TreeFX trees like the others:
noise gives them groups, gaps and now and then a row.

**Debug stretch**:
The part of a track holding a bug, built into AC to drive it: `<track>_<route metre>_debug` (`tools/debug_stretch.py`).
No test track, and deleted when the fix is in.

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

**Retaining wall and parapet**:
A retaining wall supports a cut/level step; a parapet borders a falling road edge (`roads/walls.py`). The Editor changes
whole-wall texture or cap height with fixed feet, never the terrain cut (`app/trackwalls.py`).

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

**Map data cache**:
Downloaded and computed build inputs under `cache/`, bounded and cleared by `app/mapcache.py`. Its limit excludes Editor
cache folders. Removing a build input causes a later build to fetch or compute it again; the installed track keeps its own
object list and Editor build facts.

**Editor cache**:
Disposable import preparations, preview textures and prepared Save images under the Editor-owned `cache/` subfolders
listed in `app/mapcache.py:EDITOR`. Build-cache accounting, cleanup and Clear leave these files alone. Retained edit
operations, material snapshots and saved track data are separate from this cache.

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
See **Custom Shaders Patch (CSP)** above.

**Track Debug app**:
Map2Lap's CSP app in AC: shows the route metre, marks spots, records drives.

**Mark**:
A spot saved from AC by the Track Debug app, with the 20 s of driving around it and a screenshot (`tools/mark.py` reads it).

**Comic look**:
Map2Lap's drawn style: textures painted in code, not photos.
_Avoid_: toon, cartoon

**Lamp glass**:
The small box under a street lamp's head with its own material `lamp_glass` (meshes `nocol_props_glass_`). CSP finds the
lamps by it when a track loads.

**Glow mask**:
An image beside a track's `ext_config.ini` (`glow_<kind>_<level>.png`, `facades.window_glow`) that says which window
panes of a facade sheet light up at night. Frames and crosses stay dark.

**Bay**:
One window's width of a band of a facade sheet. A wall's windows each take a bay of their band by chance (`looks.BAND_*`).

## BeamNG.Earth

**BeamNG.Earth**:
The project `engine/` is based on: a BeamNG.drive mod with a live server (earthd).

**The mod, the game**:
In older comments: BeamNG.Earth's game mod and BeamNG.drive. Neither is part of Map2Lap.
