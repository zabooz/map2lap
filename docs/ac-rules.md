# Assetto Corsa rules

What AC requires of a track and where Map2Lap follows or leaves BeamNG.Earth. BeamNG.Earth's world is the base: rebuild
it completely and hide nothing. Where AC differs (driving surfaces through mesh names, collision only through meshes, no
terrain with holes, other shaders), deviate on purpose, with a short reason in the code.

## Object names decide the physics

| Prefix | Use | `surfaces.ini` |
|---|---|---|
| `1ROAD_ground_<tx>_<ty>`, `1ROAD_deck_…` | terrain under asphalt/cobbles; bridge and tunnel road | ROAD (0.98) |
| `1GRAVEL_ground_…` | terrain with gravel/dust/rock | GRAVEL (0.75, damping, vibration) |
| `1GRASS_ground_…` | other terrain | GRASS (0.60) |
| `1KERB_walkcol_…` | kerbs/pavements, invisible collision | KERB (0.92) |
| `1KERB_racing_…` | Editor racing kerbs, visible collision and red-white paint | KERB (0.92) |
| `1WALL_` | bridges, tunnels, retaining walls, gate posts, `bldcol`/`guardrailcol` (invisible); double-sided | stays undefined |
| `nocol_` | markings, pavements, houses and rails (visible), guardrails, wires, water, foam, trees, bushes, distant view | – |

## How the ground is built

Road parts share a bounded quadratic spline (`roads.levels._curve_part`, `earthfast.road_curve`) before grading,
asphalt painting, markings, bridge decks and tunnel floors consume them. Level ranges are cut on the original map
line first; their boundaries, feature endpoints and mapped interior junctions stay fixed. Rounding stays inside
the corner's control triangle and moves at most one tenth of the carriageway width, capped at 75 cm. A single
90-degree or sharper turn stays mapped: it may be a junction or a reversal rather than a sampled road bend.
Rail geometry is unchanged. The raw feature geometry remains available for map rules and provenance.

Bridge slabs retain the planned centreline as triangle edges; changing bank must not invent a crest between
profile rows. Fixed asphalt and markings are clipped to the triangles of their own bridge part
(`roadmesh._deck_skins`, `earthfast.deck_skin`), with their existing paint lifts and interpolated UVs. Separate
owners prevent an overlapping upper roadway from attracting lower-road paint. Inferred endpoint repairs obey
mapped layers; exact mapped connections still allow ramps between layers.

Ground under junction bridges follows the same clearance rule as ground under single bridges. Terrain with
enough headroom for a separate upper road is preserved. At tunnel mouths, a neighbouring carriageway's buffer
cannot refill an opening inside the actual tunnel floor footprint; ground under the physical portal apron
is capped at that floor. These rules use mapped widths and solved floors, including offset twin portals.

Spline samples have at most 5 mm chord error. Render simplification keeps a 1 cm tolerance and ribbon sampling
retains the resulting knots; a coarse two-metre sampling lattice alone would shortcut the curve again. This
smooths horizontal survey chords, not the elevation profile or the terrain grid. Sparse sharp bends and corners
at feature endpoints still require better map geometry; smoothing does not infer a new junction layout.

Utility-pole and pylon meshes share their cable attachment dimensions with the wire layouts (`engine/poleprofile.py`).
Their model heights are estimates where map heights are unavailable. Wooden poles carry two outer insulators on the
cross-arm and the middle one on the pole head, keeping the middle wire clear of the wood. Each ceramic body uses
eight vertices and twelve triangles; painted ribs occupy the last free cell of the existing props atlas.

BeamNG.Earth (`blockworker.build`, `grading.Grader.apply`, `roads/`):
- **You drive on the terrain:** levelled to road height under roads, plus `ROAD_LIFT` 4 cm, without gaps. Surface (grip)
  per 2 m sample: `surface.classify` (land use, slope > 35° = rock), `paint_roads`, `paint_lots`.
- **Roads are painted into the terrain** (`roads.ROADS_IN_GROUND`, the default). `BNGE_ROADS_IN_GROUND=0` draws asphalt as
  a mesh of its own, with asphalt walls, zigzags and holes at seams: leave it on.
- **Collision in its game mod:** `road` (markings) and `wire` visual only; `deck` (bridges and tunnel floor), `tunnel`
  (tubes, portals, retaining walls), `rail` visible with collision; `walk`/`bld` visible, their collision is the invisible
  copy `walkcol`/`bldcol`.
- **Tunnels:** terrain holed only at the portals (`block_tunnel_holes`), raised over flat vaults (`block_arch_raise`);
  inside you drive on the floor slab from `deck`; the portal frame hides the 2 m steps.

For AC (`ground.py`, `make_obj.collision_prefix`):
- The ground's lattice is normally 2 m. The optional 1 m grid shares its spacing with water and draped
  markings, without changing source elevations or the legacy BeamNG heightmap; see [build options](architecture.md#terrain-and-scenery-build-options).
- One mesh for looks **and** physics per tile. Object name per cell by BeamNG.Earth's surface: asphalt/cobbles →
  `1ROAD_ground_…`, gravel/dust/rock → `1GRAVEL_ground_…`, else `1GRASS_ground_…` (the sample in the SW corner).
- The tunnel kernel tests a cell's corners and flags the whole cell; the ground writer drops exactly that cell. Low-arch
  mouth flags are per sample and become the cells around them first. Dropping every cell with a flagged corner made each
  full-tube cut a grid step wider to the west and south: sky beside portals facing that way. In a dropped cell, the
  ground outside the tube (its faceted vault narrowing above the wall) and outside the floor's apron is put back in
  quarter-metre patches at the cell's own heights. The apron counts only at a part's ends that are portals, as
  `roads._tunnel_chunks` draws it there (guarded without one, 4.2 m of road before Griffen's west portal stayed open).
- A tunnel part's sections (open, low arch, full tube) end at its portals as one structure: an open end shorter than
  `SECTION_MIN_M` that `portal_cover` covers takes the kind of the section behind it, and a covered run grows along
  roads over it with its own end's kind (`earthfast.tunnel_cover_roads`). As a low arch of 1.5 m, or of one sample, a
  stub took the full tube's portal at the Kollmanntunnel (A2, Griffen): no face and no apron, or a box face the full tube
  stood out over.
- Draped markings and gravel edge decals follow the drawn ground, but over a tunnel's tube (its half width,
  `TUNNEL_SHOULDER` and `LOW_PORTAL_SIDE`) a face of a road planned over the tube's vault keeps its planned height where
  that ground lies more than `LEVEL_DROP_M` (1.8 m) under it (`roadmesh.off_level`). The heights come from the road's
  own chunk, not the graded ground: at the Weblinger Gürtel's underpass (Graz) the grading there mixes the upper road
  with the tunnel's plan, and `arch_raise` lays the mouth at the floor, 6 m under the road over it.
- The soil cap of a low tunnel arch stays a `1WALL_` collision mesh but uses its tile's `ground_<tx>_<ty>` material.
  Its UVs follow world position, so the baked tile image and HD meadow, forest and rock masks continue across the arch;
  the source's 1 m repeating BeamNG grass UVs would sample the tile image at unrelated places.
- A wall between two roads cuts the cells along its cut line apart (`scenery/wallcut.py`): a step at the wall's face. A cut cell
  stays in its cell's object, by the same sample.
- Looks: one texture per tile (`ground_<tx>_<ty>.jpg`, SD 2048 px / HD 4096 px): comic ground, the roads on top in
  BeamNG.Earth's shapes and widths (`surface._road_segments`, `earthfast.paint_lines`). AC samples it repeating, so the
  SD tile fills 1984 px (12.9 cm/px) and its edge pixels repeat 32 px on each side (`ground.GUARD_PX`). Without that ring
  each tile edge mixed in the opposite edge, 256 m away: a thin green line across the roads. It protects through mip 5
  (4 m a pixel): both rings lie side by side in one 64 px gap, at a mip-6 block. The texture lies at the world's phase
  (`ground.phased`, `textures.ring_indices`): a column holds the world pixel of its column modulo 2048, and a ground UV
  is the world position in tiles times 1984/2048 (`groundmaterial.UV_SCALE`; u east, kn5 v south; marked
  `m2lUVGlobal`, `m2lUVScale`). A painted Save samples the build's image itself as one more layer at UV_SCALE a tile, with
  no copy of it. Tracks built before (`m2lUVGuard`, their ring
  at the texture's edge) are built again before painting.
- HD doubles colour sampling on each axis for every painted surface, retaining physical texture scale and all wear/masks.
  Its 64 px guard keeps the same UV scale; baked colour memory is four times SD. Shared original-resolution meadow,
  forest and rock layers are added by `track/groundquality.py`. Standalone road textures avoid the SD reduction; edge
  gravel is redrawn at four times each dimension. Already full-resolution sidewalks/kerbs/ballast stay at source size.
  This changes no collision or vertex positions.
- Tile images go into the KN5 as DDS (`obj_to_kn5.dds_texture`): BC7 on tiles with a `1ROAD_` object to preserve
  road-edge colour and markings, BC1 elsewhere to save memory. The Editor draws BC7 as BPTC
  (`ui/src/editor/scene/texture.ts`).
- Ground materials are CSP's `ksMultilayer_objsp_nm4` itself (`groundmaterial.ground`, written by
  `groundmaterial.classic`): the tile image stays in `txDiffuse` with its UVs, a shared 4 px mask selects one white layer with
  a flat normal map, so the baked colours, ksAmbient/ksDiffuse light and gloss (ksSpecular 0.02, ksSpecularEXP 10, grass)
  stay as they are. It adds no geometry or higher-resolution image.
- The material names its images by the shader's own slots and numbers, t0..t9 as CSP's compiled shader declares them
  (`groundmaterial.NM4_SLOTS`): `txDiffuse` 0, `txMask` 1, `txDetailR`..`txDetailA` 2..5, `txNormalR`..`txNormalA` 6..9; its
  values are KN5 properties: `multR`..`multA` float2, `magicMult`, `multTilingFix` and `tilingFixR`..`A`. AC loads
  the images and per-layer tiling fix from the material. Binding embedded images through `[SHADER_REPLACEMENT]`
  failed in AC, so do not move these inputs into an extension config.
- The shader samples `txDiffuse`, the mask and every layer at one mesh UV, a layer times its multiplier, with no offset; it
  multiplies `txDiffuse` by the layers mixed by the mask. Its gloss is ksSpecular times the mixed alpha
  (`txDiffuse.a` · Σ weight · layer alpha), at one ksSpecularEXP for the whole material.
- `groundmaterial.dual_layer` builds a colour-only `ksPerPixel_dual_layer` material for a square repeating image:
  `txDiffuse` samples the new image at the scaled UV, `txLayer1` retains the existing tile at its original UV,
  and the red channel of `txLayer1_Mask` mixes between them (white keeps the tile). Reflection is disabled in this
  setup. It has no normal maps; the default generator materials still use the neutral setup above.
- `groundmaterial.world_colour` fully replaces an opaque surface using a white base and the shared red mask. Its colour
  repeats in world X/Z metres, independent of the old UVs. This keeps the physical pattern size consistent on a bridge's
  slab and overlaid road strip, whose original UVs have different scales, without changing vertices or collision.
- Editor ground assignments are classic materials the same way: a white `txDiffuse`, an RGBA weight mask and four layers
  per region, colour with gloss alpha and a tangent normal map (RGB, +Y) each. A region copy's UVs are the world in tiles
  over its mask canvas's share (`tracknative._batches`), its mask rolled to the world's phase (`region_mask`), and a layer's
  float2 multiplier is its repeats a tile times that share: every layer lies at the world's phase on every region and tile,
  square and rectangular repeats alike. The tile image is one more layer at UV_SCALE a tile, the build's own (the kn5 holds
  it once); a photo a source's last Save wrote is taken the same way. Collision stays unchanged.
- Gloss: a painted region keeps its ground's ksSpecular and ksSpecularEXP. The source tile image has alpha 1;
  a photo's alpha is 1 - roughness (`tracknative._photo_colour`). A photo therefore shines at most as strongly
  as the ground (ksSpecular 0.02).
- Variation: CSP's tiling fix per layer (`tilingFix?` 1) blends two offsets of the layer, colour and gloss alpha alike, its
  normal map with the same offsets (its own blend weight). The tile image and a source's photos stay at 0: the road image
  never moves. The noise lies in world X/Z (`multTilingFix` 1 everywhere), so patches meet across region and tile borders.
- The editor's RGBA selection channels are independent weights. Their mipmaps average each channel independently and
  retain a unit total; the Editor works on them as lossless RGBA8 DDS, not BC3, whose independent colour/alpha
  quantization changes that total. Save writes them as BC7 (`textures.bc7_weights`, each lossless mip level encoded
  with linear error): a quarter of the size (27 -> 6.8 MiB for a 2304 px tile canvas), weights off by about 0.1/255 on
  average and their sum by a few 255ths at sharp edges, under 2 % brightness. Before that a tile's ring canvas is
  reduced to a texel per 50 cm (`textures.SAVED_WEIGHT_STEP`, 2304 -> 576 px: 6.8 -> 0.42 MiB): the materials keep their
  resolution, only their seams soften over about half a metre. At 1 m a painted edge on asphalt let the tile image under
  it show as a band (2026-11-11). The Editor shows its masks at the same step, and reads a saved mask of any step back at
  its own resolution (`trackdetail._source_image`). Tried in AC with CSP (2026-11-09); a
  track with painted ground needs CSP. The rare RGBA16F region mask stays as it is. The Editor takes masks as lossless
  RGBA8: the server unpacks a saved mask for it (`textures.browser_weights`), a texture in a `txMask` slot only.
- Ground needs no config: shader, images and variation are the kn5 material's own. A managed include in the track's
  `extension/ext_config.ini` holds imported models' replacements only; no global shader files are installed. Map2Lap tracks
  need CSP.
- Collision like the mod: `road`/`wire` → `nocol_`; `deck`, `tunnel`, `rail` → driving surface/wall; `walk`/`bld*` visible
  as `nocol_`, `walkcol` → `1KERB_walkcol_…`, `bldcol` → `1WALL_bldcol_…`, both **invisible** (kn5 `renderable = 0`);
  `rail` likewise with `railcol`.
- **Guardrails** (tile key `guardrails`; in game forest models with collision): comic models (`propsmesh.rails`) as
  `nocol_guardrail_…`, plus one invisible vertical wall `1WALL_guardrailcol_…` per 3 m module.
- **Smoother than BeamNG.Earth** where AC needs it (hard tyres and springs; BeamNG's soft body rolls over centimetre
  bumps): junction ends give way, abutments and the ground under a deck's ends from the lidar, decks meeting their
  approaches at their grade. Each rule's reason is in a comment at its place.

## Coordinates

- BeamNG.Earth: a local ENU frame around the anchor (x east, y north, z up). Anchor = middle of the route or area.
- OBJ and kn5: Y up, `(x, z_enu, -y_enu)`. kn5 stores UV v negated (like ksEditor).

## AI line

Build and Rebuild generate `ai/fast_lane.ai` on the finished track. Editor Save carries the installed line
when its inputs still match. A Race with opponents generates a missing line before starting. Practice,
Hotlap and solo Race skip this step. The Editor can explicitly recalculate the saved track's line.
`data/map2lap_ai.json` fingerprints collision geometry, grid and timing markers, route, mapped road and
ring facts, circuit mode, line-code version and the reserved corrections list. A separate file checksum
identifies hand-replaced lines so the driver can choose which line to use.

Tangent arcs and the sampled line need a continuous 2 m strip of
`1ROAD_` or `1GRAVEL_` on the driving level.
At tile boundaries, two ribbon ends with a shared 3D centre and matching widths can have slightly rotated
end rows. The AI counts the joint as supported only where those ends diverge by at most 2 cm.
SideLeft and SideRight end at the connected road edge or the nearest `1KERB_walkcol_` or `1WALL_` collision
within car height above it. A raised pavement can cover asphalt terrain. Bridge slabs below the deck and high
tunnel ceilings leave the lane free. Editor racing kerbs are passable over supported road.
At a staggered junction, short route links spanning at most two mapped carriageway widths can share a tangent
arc when one turn dominates a shallow reverse. The car must fit within half the junction road width of the
selected route and every chord, including the straight joins, must clear the collision corridor on the route's
level. Mapped roundabouts and circular roads, including rings recognized from the mapped road geometry,
keep their entry, circulation and exit even on a painted island. Separate fillets remain at distinct direction
changes, when matching road widths are missing, or when the replacement fails.
The racing line minimises squared horizontal curvature by moving samples across the full closed carriageway.
Each moved centre needs 1 m for the half-car plus 1.5 m tracking reserve on both sides. The reference line’s
own measured sides and the selected route legs bound the move through junctions. Grid positions, timing
crossings and circulating lanes stay pinned. Every final chord is checked on its driving level, and widths
are measured again on the resulting line. Where a move fails, the original car-width-checked line resumes
locally with a smooth transition. Curvature measured on the final line sets radius and speed.
Mapped road widths also limit broad collision strips. At intersections and local width bulges the sides interpolate
along the route, bounded by the free cross section.

An A–B Route has an open line behind the last grid slot through the finish. If the road starts at the rear slot, the line
starts there. Beyond the finish it follows the saved runout to the last continuous car-width section on its road
level. If the route ends at the gate, only the supported part of the final approach direction (up to 10 m) is used.
This moves braking into the available runout and keeps the timed line when the road ends early.
A Circuit begins at its timing line and closes without a repeated endpoint. When the path cannot be sampled on the road,
the log gives the reason and, for a surface failure, the route metre. Play keeps the Race dialog open and offers an explicit solo start or cancellation.

## Traps

- `WALL` stays undefined in `surfaces.ini`: defined, every wall turns into ground and you drive through it (Kunos:
  `07WALL006`, no WALL key). Walls are double-sided, because BeamNG winds them inconsistently.
- AC drives along **+Z** of the start point (`obj_to_kn5.empty`). Start slots move up to the first road on the route.
- Point-to-point routes get `AC_AB_START_L/R` and `AC_AB_FINISH_L/R` (acs.exe knows them; CSP's rally mode reads them) and
  `"run": "point-to-point"` in `ui_track.json`; circuits and areas keep the lap line `AC_TIME_0_L/R`.
- Point-to-point grid, pit and hotlap spawns use the actual start gate. The first spawn is 4 m before its
  timing plane, with five more slots 8 m apart behind it along the route, including at bends. New builds place
  the gate at pin 1 if the road approaching that pin holds the grid. Otherwise they search forward for the first
  drivable position with room for the grid. If the builder cannot place both gates, the build log explains why.
- Play offers Practice, Hotlap and Race for timed Routes and Circuits. A–B sessions use the default layout and
  measure from the start gate to the finish gate. Race has start lights and one run on a Route, or a lap count on
  a Circuit. A Race can use the installed AI line with up to one fewer opponent than the track has pitboxes.
  New builds have six slots. White non-colliding grid brackets follow the road faces at each Route and Circuit
  spawn. Their shared pit nodes remain usable. A track-local CSP script hides the stock sign holders there.
  The player starts behind the selected opponents and only their own best time is
  imported into AC's `personalbest.ini`.
- Circuit starts with the same grid spacing before its `AC_TIME_0_L/R` line. The converter checks the grid and line on
  a single road level over a once-driven stretch, including the approach from the end of the lap. The timing segment
  must cross the lap exactly once. The search runs up to 300 m forward from pin 1, and a placement refusal leaves an
  existing installation intact.
- Routes and Circuits target three sectors, with invisible `AC_TIME_1_L/R` and `AC_TIME_2_L/R` at one third and
  two thirds of the timed distance. A Route uses its placed start and finish gates. A Circuit measures from its actual
  start/finish line; the split lines also prevent AC from counting the drive from the grid as a full lap.
- The converter keeps split lines ordered and moves them to safe crossings of the driven road on one level. If it
  cannot place both on a Route, it logs the problem and keeps start-to-finish timing. A Circuit build requires both.
- BeamNG/Torque winds triangles clockwise → flip them (`shape_parts`), else houses turn black.
- `.cdae`: read only the **finest level of detail** per object (buildings have two; both on top of each other flicker).
- Set material values yourself (ksEditor's defaults ksSpecular 1 / ksAmbient 0: white ground, black shadows).
- Scale textures down to the target resolution before sampling them (else a blotchy pattern: asphalt like cobbles).
- Atlases keep an empty margin per image: else a cut-out's edges reach into the neighbouring image at small mip levels, or
  through the repeat into their own bottom row (floating lines).
- Trees and bushes are CSP TreeFX models (`scenery/treefx.py`), not KN5 meshes. Each card face is stored once;
  coarser LODs reuse subsets of one crown. Wood has eight height bands for wind bending. Spruce and larch needle
  triangles remain unsplit at those bands to avoid horizontal lighting lines; their cone normals follow the surface.
- Owned deciduous models share geometry across seasons. Play selects green, autumn or transparent winter foliage
  atlases; snow weather uses winter. Native CSP autumn tint stays zero so evergreen needles remain green. Library
  snapshots and object identities stay unchanged.
- CSP caches TreeFX models and atlases by filename. Runtime names contain species, format, season and content hash;
  `trees_seasonal.txt` changes references while `trees.txt` remains stable. Foreign models keep their files.
- The terrain casts shadows only at a low sun, through CSP (`CAST_SHADOWS = TERRAIN` in `ext_config.ini`): all day it shadowed
  itself, rings around the camera on the asphalt. Without CSP it casts none.
- Street lamps shine at night through CSP: the glass of each head has its own material (`lamp_glass`, meshes `nocol_props_glass_`),
  and one `LIGHT_SERIES` in `ext_config.ini` makes a light of all glass within 2 m. CSP reads the geometry as the track loads, so a
  lamp moved, copied or deleted in the Editor needs nothing more. No shadows of their own: their light goes through walls and decks.
  Library lamps mark their own glass material `m2lLamp`; Save includes those material names with the same light/emission rule
  (`scenery/lamps.py`). Native library trees are TreeFX instances with portable `.bin` LODs, not collision meshes in the KN5.
  Without CSP they stay dark. A track built before has no such glass.
- Windows light up at night through CSP: `facades.window_glow` draws a mask per look and brightness level into the track's
  `extension` folder with the same geometry as the windows, so frames and crosses stay dark. One window in five is lit. Every window
  of a wall is a piece of its own that takes a bay of its band by chance (`looks.BAND_*`, third value): in one piece per floor whole
  columns would be lit. Separate windows on plain walls and in attic caps also choose bays per window, using the
  building seed, wall, floor and window index; one of their four panel bays is lit at each brightness level.
- Unknown BeamNG materials become wall/concrete (`FALLBACK`); the build reports them → add them to `SURFACE`.
- AC has no vertex colours: `make_obj.BLD_KINDS` gives each building material a comic texture per colour of BeamNG.Earth's
  table, and `bld_split` turns the colour jitter into one of 3 brightness levels.
- Road sign lettering: its texture is flipped, because the sign meshes' v runs the other way.
- Realistic water instead of comic: `[Material_Water] Materials = water, Type = LAKE` in the track's `ext_config.ini`.

## TreeFX needle lighting

Owned trees and bushes use `SUBSCATTERING=0`, with `BRIGHTNESS`, `SPECULAR` and `REFLECTIVITY` at 1.
Rounded leaf crowns, bushes and juniper use `SPHERE=1` to soften card lighting; needle and frond models use
`SPHERE=0`. Owned trees set `AO_OPACITY=0.75` so enclosed trunks remain visible; bushes retain native AO.
Spruce/larch cone normals and fir tips follow their surfaces. Format 16 refreshes owned models before
Play, and content-based runtime names isolate CSP's baked AO and atlases.

Keep spruce and larch needle mantles' triangles and UVs intact. Splitting triangles at wood height bands creates
horizontal lighting lines in CSP even with flat normals; wood may still be subdivided for wind. CSP's exact
lighting mechanism for that line remains unresolved. Compare sun-facing and shaded crowns at fixed exposure
with `tools/rendering_gallery.py` and [the rendering workflow](../tools/rendering_preview.md), then drive a real track.

## Limits

- 65,535 vertices per mesh (16 bit indices) → objects are split (`_<k>`; split names from the front when reading).
- AC loads the whole track at start; nothing streams. A 292 km route (±100 m): 2507 tiles, a 9.9 GB kn5, ~47 GB RAM while
  loading. Beyond ~50 km from the anchor float32 gets coarse (~1–2 cm at 150–250 km).
- The ground road surface uses 2 m terrain cells by default, optionally 1 m. A denser mesh does not smooth the road's centre line or height profile.

## kn5 format (`kn5.py`)

`sc6969`, int32 version (6) + int32 0; textures (active, name, bytes); materials (name, shader, blend, alpha test, depth
mode, parameters {name, A, vec2, vec3, vec4}, texture maps); node tree: class 1 = matrix (16 floats, rows = axes, last row
the position), class 2 = mesh (shadows, visible, transparent, vertices of 44 bytes pos/normal/uv/tangent, uint16 indices,
material, layer, LOD, bounding sphere, renderable).

CSP's Lua docs, matching the installed version: `assettocorsa\extension\internal\lua-sdk\<script type>\README.md`.
