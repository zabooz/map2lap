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
| `1WALL_` | bridges, tunnels, retaining walls, gate posts, `bldcol`/`guardrailcol` (invisible); double-sided | stays undefined |
| `nocol_` | markings, pavements, houses and rails (visible), guardrails, wires, water, foam, trees, bushes, distant view | – |

## How the ground is built

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
- One mesh for looks **and** physics per tile. Object name per cell by BeamNG.Earth's surface: asphalt/cobbles →
  `1ROAD_ground_…`, gravel/dust/rock → `1GRAVEL_ground_…`, else `1GRASS_ground_…` (the sample in the SW corner).
- A cell goes as soon as **one** of its corners is a tunnel hole.
- A wall between two roads cuts the cells along its cut line apart (`scenery/wallcut.py`): a step at the wall's face. A cut cell
  stays in its cell's object, by the same sample.
- Looks: one texture per tile (`ground_<tx>_<ty>.jpg`, 2048 px): comic ground, the roads on top in
  BeamNG.Earth's shapes and widths (`surface._road_segments`, `earthfast.paint_lines`). AC samples it repeating, so the
  tile fills the inner 1984 px (12.9 cm/px) and its edge pixels repeat 32 px around it; the ground UVs run from 32/2048
  to 2016/2048 (`ground.GUARD_PX`). Without that ring each tile edge mixed in the opposite edge, 256 m away: a thin
  green line across the roads. Tracks built before still have UVs 0..1.
- Ground materials use the standard AC `ksMultilayer` shader (`track/groundmaterial.py`): the existing tile image stays
  in `txDiffuse`, with its UVs and lighting values unchanged. A shared 4 px mask selects a shared white detail image,
  so the initial detail multiplier is exactly one. RGBA slots allow later masked detail textures without another
  material format. No separate geometry, higher-resolution base image or CSP dependency is introduced by this setup.
- `groundmaterial.dual_layer` builds a colour-only `ksPerPixel_dual_layer` material for a square repeating image:
  `txDiffuse` samples the new image at the scaled UV, `txLayer1` retains the existing tile at its original UV,
  and the red channel of `txLayer1_Mask` mixes between them (white keeps the tile). Reflection is disabled in this
  setup. It has no PBR maps; the default generator materials still use the neutral setup above.
- `groundmaterial.world_colour` fully replaces an opaque surface using a white base and the shared red mask. Its colour
  repeats in world X/Z metres, independent of the old UVs. This keeps the physical pattern size consistent on a bridge's
  slab and overlaid road strip, whose original UVs have different scales, without changing vertices or collision.
- Editor ground assignments use `ksMultilayer_objsp`: a white multiplier, an RGBA weight mask, original tile in A and up to
  three full-resolution colours in RGB. Every `multR/G/B/A` is a float2 in this shader. Integer tile origins are added to
  saved UVs to align repeats across tiles; positions, triangles and collision names stay unchanged.
- The editor's RGBA selection channels are independent weights. Their mipmaps average each channel independently and
  retain a unit total; the Editor works on them as lossless RGBA8 DDS, not BC3, whose independent colour/alpha
  quantization changes that total. Save writes them as BC7 (`textures.bc7_weights`, each lossless mip level encoded
  with linear error): a quarter of the size (27 -> 6.8 MiB for a 2304 px tile canvas), weights off by about 0.1/255 on
  average and their sum by a few 255ths at sharp edges, under 2 % brightness. Before that a tile's ring canvas is
  reduced to a texel per 50 cm (`textures.SAVED_WEIGHT_STEP`, 2304 -> 576 px: 6.8 -> 0.42 MiB): the materials keep their
  resolution, only their seams soften over about half a metre. At 1 m a painted edge on asphalt let the tile image under
  it show as a band (2026-11-11). The Editor shows its masks at the same step, and reads a saved mask of any step back at
  its own resolution (`trackdetail._source_image`). Tried in AC with CSP (2026-11-09); a
  track with painted ground needs CSP. The rare RGBA16F region mask stays as it is. The browser has no BC7 decoder:
  the server unpacks a saved mask for it (`textures.browser_weights`).
- Saved material variation uses a managed CSP replacement to `ksMultilayer_objsp_nm4`, with separate tiling-fix flags for
  imported RGB layers and no variation of the original A tile or mask. The native material remains a usable fallback
  without CSP. This native colour-only setup supplies flat normal maps; retained imported PBR maps are used independently
  by the Editor preview.
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

## Traps

- `WALL` stays undefined in `surfaces.ini`: defined, every wall turns into ground and you drive through it (Kunos:
  `07WALL006`, no WALL key). Walls are double-sided, because BeamNG winds them inconsistently.
- AC drives along **+Z** of the start point (`obj_to_kn5.empty`). Start slots move up to the first road on the route.
- Point-to-point routes get `AC_AB_START_L/R` and `AC_AB_FINISH_L/R` (acs.exe knows them; CSP's rally mode reads them) and
  `"run": "point-to-point"` in `ui_track.json`; circuits and areas keep the lap line `AC_TIME_0_L/R`.
- BeamNG/Torque winds triangles clockwise → flip them (`shape_parts`), else houses turn black.
- `.cdae`: read only the **finest level of detail** per object (buildings have two; both on top of each other flicker).
- Set material values yourself (ksEditor's defaults ksSpecular 1 / ksAmbient 0: white ground, black shadows).
- Scale textures down to the target resolution before sampling them (else a blotchy pattern: asphalt like cobbles).
- Atlases keep an empty margin per image (`trees.PAD`): else billboard edges reach into the neighbouring image at small
  mip levels, or through the repeat into their own bottom row (floating lines).
- Crossed alpha-tested billboards that both cast and receive shadows shadow each other (stripes, black wedges). Plants are
  `ksTree` in the kn5, as on the stock tracks; with CSP the track's `ext_config.ini` makes them `ksTree_ppshadows` with
  `CAST_SHADOWS = 0`: dark in the shade of houses and hills, no shadow of their own. Their normals lean 45 degrees away from
  the stem (`make_obj.away_from_stem`), else headlights, which come in almost level, leave them black at night. Bushes start
  from the ground's normal (`make_obj.ground_normals`), so they darken with a slope turned away from the sun.
- The terrain casts shadows only at a low sun, through CSP (`CAST_SHADOWS = TERRAIN` in `ext_config.ini`): all day it shadowed
  itself, rings around the camera on the asphalt. Without CSP it casts none.
- Street lamps shine at night through CSP: the glass of each head has its own material (`lamp_glass`, meshes `nocol_props_glass_`),
  and one `LIGHT_SERIES` in `ext_config.ini` makes a light of all glass within 2 m. CSP reads the geometry as the track loads, so a
  lamp moved, copied or deleted in the Editor needs nothing more. No shadows of their own: their light goes through walls and decks.
  Without CSP they stay dark. A track built before has no such glass.
- Windows light up at night through CSP: `facades.window_glow` draws a mask per look and brightness level into the track's
  `extension` folder with the same geometry as the windows, so frames and crosses stay dark. One window in five is lit. Every window
  of a wall is a piece of its own that takes a bay of its band by chance (`looks.BAND_*`, third value): in one piece per floor whole
  columns would be lit. Single windows laid on a plain wall all show one bay, so such a house is lit whole or not at all.
- Unknown BeamNG materials become wall/concrete (`FALLBACK`); the build reports them → add them to `SURFACE`.
- AC has no vertex colours: `make_obj.BLD_KINDS` gives each building material a comic texture per colour of BeamNG.Earth's
  table, and `bld_split` turns the colour jitter into one of 3 brightness levels.
- Road sign lettering: its texture is flipped, because the sign meshes' v runs the other way.
- Realistic water instead of comic: `[Material_Water] Materials = water, Type = LAKE` in the track's `ext_config.ini`.

## Limits

- 65,535 vertices per mesh (16 bit indices) → objects are split (`_<k>`; split names from the front when reading).
- AC loads the whole track at start; nothing streams. A 292 km route (±100 m): 2507 tiles, a 9.9 GB kn5, ~47 GB RAM while
  loading. Beyond ~50 km from the anchor float32 gets coarse (~1–2 cm at 150–250 km).
- The road surface is 2 m terrain triangles (like BeamNG): as even as there in tight curves, not smoother.

## kn5 format (`kn5.py`)

`sc6969`, int32 version (6) + int32 0; textures (active, name, bytes); materials (name, shader, blend, alpha test, depth
mode, parameters {name, A, vec2, vec3, vec4}, texture maps); node tree: class 1 = matrix (16 floats, rows = axes, last row
the position), class 2 = mesh (shadows, visible, transparent, vertices of 44 bytes pos/normal/uv/tangent, uint16 indices,
material, layer, LOD, bounding sphere, renderable).

CSP's Lua docs, matching the installed version: `assettocorsa\extension\internal\lua-sdk\<script type>\README.md`.
