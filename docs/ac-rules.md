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
- A cell goes as soon as **one** of its corners is a tunnel hole.
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
- The tile images go into the kn5 as DDS (`obj_to_kn5.dds_texture`): BC7 where the tile has a `1ROAD_` object
  (`obj_to_kn5.bc7_images`), else BC1. BC1 keeps two end colours per 4×4 block (50 cm, 1 m one mip down): grey asphalt
  beside green verge and a white marking turned green in places, on every track before (seen in AC, 2026-11-11). BC7 is
  twice the size (2.7 -> 5.3 MiB a tile), hence only tiles with roads. The Editor draws BC7 as BPTC
  (`ui/src/editor/scene/texture.ts`).
- Ground materials are CSP's `ksMultilayer_objsp_nm4` itself (`groundmaterial.ground`, written by
  `groundmaterial.classic`): the tile image stays in `txDiffuse` with its UVs, a shared 4 px mask selects one white layer with
  a flat normal map, so the baked colours, ksAmbient/ksDiffuse light and gloss (ksSpecular 0.02, ksSpecularEXP 10, grass)
  stay as they are. It adds no geometry or higher-resolution image.
- The material names its images by the shader's own slots and numbers, t0..t9 as CSP's compiled shader declares them
  (`groundmaterial.NM4_SLOTS`): `txDiffuse` 0, `txMask` 1, `txDetailR`..`txDetailA` 2..5, `txNormalR`..`txNormalA` 6..9; its
  values are kn5 properties: `multR`..`multA` float2 (the second field), `magicMult`, `multTilingFix`, `tilingFixR`..`A`
  (floats). AC loads the images with the material, normal maps included, and the tiling fix acts per layer
  (`stausee_nm4_direkt`, 2026-11-11). Bound instead by a `[SHADER_REPLACEMENT]` with `RESOURCE_TEXTURE` or `RESOURCE_REF`,
  embedded images stayed unbound in AC (fuPBR: black ground mirroring the sky and road, Heiligenblut, 2026-11-11). Why is
  not known.
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
- Gloss: a painted region keeps its ground's ksSpecular and ksSpecularEXP. The tile image, sampled itself, has alpha 1, so
  the unpainted rest of a painted tile shines as the tile beside it; a photo's alpha is its gloss, 1 - roughness (its
  roughness map, else the layer's flat roughness: `tracknative._photo_colour`). A photo therefore shines at most as the
  ground, ksSpecular 0.02 (decided 2026-11-11; the alternative, gloss alpha in the tile image itself, needs rebuilt tracks
  and BC7 for tiles without roads).
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

## Traps

- `WALL` stays undefined in `surfaces.ini`: defined, every wall turns into ground and you drive through it (Kunos:
  `07WALL006`, no WALL key). Walls are double-sided, because BeamNG winds them inconsistently.
- AC drives along **+Z** of the start point (`obj_to_kn5.empty`). Start slots move up to the first road on the route.
- Point-to-point routes get `AC_AB_START_L/R` and `AC_AB_FINISH_L/R` (acs.exe knows them; CSP's rally mode reads them) and
  `"run": "point-to-point"` in `ui_track.json`; circuits and areas keep the lap line `AC_TIME_0_L/R`.
- Point-to-point grid, pit and hotlap spawns use the actual start gate: the first car's centre is 3 m before its
  timing plane, with the other slots 8 m apart behind it along the route, including at bends. The clock remains AC's
  line-crossing timer. If the whole grid cannot stand on road before the gate, the build reports that instead of
  placing cars beyond the start. Circuits and areas retain their original spawn placement.
- BeamNG/Torque winds triangles clockwise → flip them (`shape_parts`), else houses turn black.
- `.cdae`: read only the **finest level of detail** per object (buildings have two; both on top of each other flicker).
- Set material values yourself (ksEditor's defaults ksSpecular 1 / ksAmbient 0: white ground, black shadows).
- Scale textures down to the target resolution before sampling them (else a blotchy pattern: asphalt like cobbles).
- Atlases keep an empty margin per image: else a cut-out's edges reach into the neighbouring image at small mip levels, or
  through the repeat into their own bottom row (floating lines).
- Trees and bushes are CSP TreeFX trees (`scenery/treefx.py`, `extension/trees/trees.txt`), not kn5 meshes: they sway, cast
  and take shadows and switch LOD at 600/700/800 m. In a `.bin` each card face is written once (both sides at one place
  flickered far away and showed a grid; CSP draws leaves from both sides), and the coarser LODs are subsets of one crown
  (each with its own random gave another tree on switching).
  Tree wood uses eight height bands (`scenery/treewind.py`), so the trunk follows the
  wind bend instead of cutting across it as one straight face. Spruce and larch retain their original needle faces
  to avoid [horizontal lighting bands](#treefx-needle-lighting); fir and cypress retain needle subdivision.
  Spruce, larch and fir boles taper to a point over the
  last eighth of tree height. Original painted crowns are retained. Spruce/larch needle cones and the fir tip use surface-aligned normals; other foliage normals are retained. Owned tree models set
  `[BAKING] AO_OPACITY=0.75` in their own `tree.ini`, keeping at least quarter visibility in CSP's native vertex-AO bake
  so enclosed trunks do not turn fully black. Bushes keep native defaults. This does not disable shadow casting or
  shadowmap reception. Vertex AO also controls fast wind flutter, so changes need a same-wind visual check; old baked
  meshes are regenerated through the owned format version before Play.
  The upper spruce/larch skirt starts half a tier spacing plus 1.5 m lower on the 14 m model, nesting its rim inside
  the lower crowns; the additional overlap scales with model height;
  its apex and radius, all lower tiers and the painted atlas remain in place.
- Owned deciduous TreeFX models share one atlas/material and geometry across seasons. Broadleaf, birch and larch add
  permanent low-cost wood inside the original crowns; original foliage data are retained. At Play, recognized
  models get their selected atlas: original green in spring/summer, warm foliage in autumn, transparent foliage in winter.
  Baobab retains its existing branches; evergreen/tropical foliage is preserved. Native CSP season conditions provide snow
  shading on wood and needles. Native TreeFX autumn tint is zero because deciduous atlases already supply their autumn
  colours; the native global tint also colours evergreen needles. Owned Library aliases are prepared in the track folder; their immutable snapshots stay intact.
  Seasons do not alter KN5 geometry, placements or tyre grip, and snow weather always selects winter scenery.
  Added wood follows the original trunk's native clockwise face winding. Broadleaf/birch leaders share its top ring;
  the owned format version makes Play refresh older seasonal geometry even when the chosen season stays the same.
- CSP's global tree cache uses model filenames, and its texture entries use texture filenames. Before Play, owned
  trees get runtime filenames containing species, format, season and a hash of the generated archive. The separate
  `trees_seasonal.txt` changes only those file references; `trees.txt`, object-list identities and library snapshots
  remain stable. `map2lap_seasons.ini` selects that runtime list. Returning to a season retains its baked AO; another
  season or generated archive cannot inherit that model's old billboard cache. Atlas and mesh names inside the archive
  also include format and season. Foreign trees and diagnostic variants retain their supplied files.
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

All owned TreeFX trees and bushes use `SUBSCATTERING=0`, with `BRIGHTNESS`, `SPECULAR` and `REFLECTIVITY` at 1.
Rounded leaf crowns (broadleaf, birch, olive, acacia, baobab and tropical), all bushes and juniper use `SPHERE=1`
to soften per-card lighting; other models retain `SPHERE=0`. Larch has needle cones despite being deciduous; palms have fronds.
Surface-aligned spruce/larch cone normals (and the fir's conical tip) use the cone's vertical rise
as their radial component and its radius decrease as their upward component. Legacy base constructors retain the old
normals so unmarked assets can still be recognized. Geometry, texture alpha, crown overlap and wind subdivisions stay
unchanged. Format 16 refreshes owned models before Play; content-based runtime names isolate CSP's baked AO and atlases.

In the AC gallery, removing SPHERE's dome-normal contribution reduced the bright upper spruce crown against the sun;
removing subscattering as well removed the conspicuous glow while retaining illumination on the sunny side. This was
also checked with the production crown shape. Transmission remains off for every generated species.
Rounded leaf crowns and bushes retain dome smoothing after patchy lighting was observed on the real track;
the final rounded-crown adjustment still needs a visual comparison. The spruce comparison does not establish
identical results for every species, season or user weather/filter.

The captured CSP shader passes `(x, height^4, z)` into normal blending and approximate self-shadowing. Its precise
constant mapping is inferred; neither a universal 75-percent height threshold nor guaranteed absence of shadowing is
established. Changing whole-tree brightness did not resolve the upper/lower contrast.

`tools/rendering_gallery.py` keeps the original CM shading as `BASELINE`, the discarded dimmed profile as `DIMMED`,
and individual overrides. `SPHERE_SUBSCATTERING` matches the production needle profile; `SUBSCATTERING` matches
rounded leaf crowns. All columns share production geometry and normals. Grey cards and ground swatches provide references,
not fixed screen-brightness targets. Compare sun-facing and shaded sides at the same time and exposure, then real tracks.
See [the rendering workflow](../tools/rendering_preview.md) for camera, screenshot and restoration commands.

Spruce and larch needle mantles must keep their original triangles and UVs, with the surface-aligned normals described
above. Splitting their triangles at the wood's height bands introduces horizontal lighting bands in CSP; keeping the
wood subdivision still lets the trunks bend and keeps their thin leaders. The owned format migration refreshes older
models and their baked AO before Play.

The isolated surface check identifies the prominent band on the fifth needle tier from the top, with dark and light
regions on the same tier. Neutralizing only that tier's baked vertex AO removes much of the broad dark area, but a thin
line remains with constant upward normals and even with every other needle tier removed. Removing only its height cuts
removes that line. Full crowns with their original textures, normals and stored AO also lose the band without needle
subdivision. Thus neither a visible overlap boundary nor the uppermost skirt's rim explains this case.

The remaining shader mechanism is unresolved: extra vertices change where CSP samples and interpolates lighting even
when the rest surface is unchanged. Its model vertex shader loads baked AO, multiplies it by instance spherical-harmonic
occlusion and computes height-dependent lighting inputs; the pixel shader also applies shadows. The sight checks do not
isolate which remaining term produces the thin line, or prove a geometric crack. The effect is established for these
TreeFX needle models, not for ordinary KN5 materials or every CSP shader. The installed sight probes used `SPHERE=0.5`;
the generator retains `SPHERE=1.0`. The earlier SPHERE change did not visibly move or remove the band and is not the fix.

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
