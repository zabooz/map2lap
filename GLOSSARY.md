# Map2Lap

Map2Lap builds Assetto Corsa tracks from real roads: map data and elevation in, a driveable track out. Its road,
grading and building code is based on BeamNG.Earth, a mod that streamed the real world into BeamNG.drive.

## Words with more than one meaning

**Generator page**:
The local web page end users build and manage tracks with (`src/server.py`).
_Avoid_: server, the page's server

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

**Terrain cell**:
One 2 m square of the terrain grid.
_Avoid_: cell, pixel

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

**Grading**:
Making the ground follow the plans: roads level and smooth, the ground around them blended in.

**Graded ground**:
The terrain after grading; what the car drives on beside bridges and tunnels.

**Road lift**:
The 4 cm the physics ground is raised under roads (`ROAD_LIFT`); it is in the mesh, not in a plan's heights.

**Deck**:
A bridge's driving surface.

**Abutment**:
The end of a bridge where it meets the ground.

**Approach**:
The ground road leading onto an abutment or into a tunnel portal, ramped to meet it.
_Avoid_: ramp, lead-in

**Portal**:
The mouth of a tunnel.

**Hull**:
A tunnel floor's height line: the lower convex hull of the ground along the tunnel and the road beyond its portals.

**Chain**:
Bridge or tunnel parts that follow on from each other, solved together once, across tiles.

## Build

**Build**:
One run of the generator: route, tiles, scenery, distant view, kn5, into a track folder in AC.

**Test track**:
A route in `tools/test_tracks.json`, short or long, with its spots and reference values; regression checks run only
there.

**Reference**:
The `measure.py` values a test track's build is compared with.

**Revisit cache**:
Built tile results kept on disk, keyed by the code key; a later build of the same place reads them back.

**Code key**:
A hash of the `engine/` code, the native module and the `BNE_*` environment variables; a new one makes the next build
cold.

**Cold build**:
A build that finds nothing for its code key in the revisit cache and computes everything (`BNE_COLD` forces one).
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
