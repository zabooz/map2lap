# Editor ground: selection, paint and native Save

Start with [Editor data flow and Save](editor.md). Shader slots, coordinates and physics belong to
[ac-rules.md](ac-rules.md#how-the-ground-is-built); import formats belong to [editor-library.md](editor-library.md).
Implementation names below are relative to `src/` or `ui/src/editor/`.

## Build facts and selection

`track/editorinfo.py` writes `data/map2lap_editor`: a KN5-bound manifest and per-tile archives containing lossless paint
masks, ordered material/repeat/brightness descriptions, retained map topology and original build descriptions. It records
road/land features, road and marking chunks, sidewalks, prop/barrier/parking rows and mesh roles/bounds; it is not a complete
triangle-to-road ownership index. Object-list `details` retain model/building parameters. Current edits stay in the draft.
Source and Save preserve/rebind this metadata independently of kept build files. Missing/stale manifests are ignored;
older tracks need rebuilding to gain ground-selection data, while available object tools keep working.

Loading prepares ground through `/surface/prepare` before reporting completion. `track/surfaceindex.py` caches dominant
materials, soft masks and connected runs/components under `out/editor-selection`, shared by identical sources/copies.
`/surface` queries those prepared components by source revision, mesh and hit UV without evaluating paint again.
Road-chain ids are stable across processes. Normal road selection stops at branches, road/link changes and mapped levels;
same-kind degree-two splits join. Shift selects all matching prepared regions, including disconnected and distant ones.

Unprepared tiles make selection incomplete. Apply must freeze the explicitly displayed tile subset; an incomplete
Select all without that scope is refused. There is no selection tile cap; bounded portions limit mask-processing memory.
Only loaded tiles decode highlight masks, within the view's memory budget. Highlights share live geometry, sample
tile-local clamped UVs and remain aligned after height edits. Selection itself changes no draft and grants no object actions.

`scene/materials.ts` also finds connected material faces while keeping object ownership separate. The `edge_dirt` verge
can be selected without paint metadata and deleted through `app/tracksurfaces.py` / `scene/surfaceCuts.ts`. Draft `surfaces`
stores merged triangle ranges per source mesh. Only `nocol_road_edge_dirt_` uses this deletion path: it is a noncolliding
decal, so road/ground physics stay intact. It cannot receive ground texture assignments. House clicks still select objects.

## Paint operations and settings

`app/trackpaint.py` captures authoritative masks and immutable material snapshots. Apply processes bounded portions into
a private folder and publishes only after all succeed: one Apply, one Undo, no partial operation on failure. Progress spans
mask collection, layout preparation and preview loading. Ground assignment changes appearance, never driving physics;
separate mesh materials such as buildings/verge are outside it.

Ordered draft/recipe `paints` reference `out/paints` and `out/paint-assets`; Save retains active inputs under
`data/map2lap_paints`. These are editing data, not disposable cache. Schema 2 snapshots keep all original files and
normalized maps; schema 1 remains readable but cannot recover originals it never retained. Save verifies digests and
counts retained inputs in its disk estimate. Operations describe semantic material assignments, not shader slots/palettes.

An application's optional snapshot `look` controls normal enable/strength, roughness enable/gloss and repetition variation.
Disabled maps remain retained. `trackpaint.rendered` supplies the same effective properties to preview and Save;
`trackpaint.restyle` replaces one operation with identical masks and changed settings, as one Undo step. Defaults omit
extra fields to preserve old ids/cache keys. Inspector settings target the dominant application's last covering edit at
the clicked point, not every use of the library texture. A saved native layer without its edit offers no settings.
Adopted edits remain restylable on saved copies.

Appearance resolves immutable retained inputs and names/repeat sizes without baking a composited tile. Blends show the
dominant texture; untouched ground keeps its original label. Late point/version answers are discarded, and controls keep
focus while changes synchronize. Removing a library asset does not affect these previews or saved tracks.

## Layers, phase and filtering

`app/trackdetail.py` retains full-resolution photos with independent physical X/Y repeats. Semantic operations and browser
weights keep all contributors. Native classic materials have **at most four local contributors**, including the original
where it contributes. More materials may share a tile if spatial partitioning satisfies that local limit. Save refuses a
transition/filter halo needing more than four before staging; the draft and preview remain usable. Splitting cannot fix a
palette whose full filter support is shared by both children. Dense junctions and distant cross-region filtering are limits
to test explicitly, not evidence that the unrestricted browser preview is exportable.

Generated ground uses `ksMultilayer_objsp_nm4` around its baked tile image. `scene/classicLight.ts` matches its Phong light values.
The preview also reads colour-only `ksPerPixel_dual_layer` and world-space white-base colour replacements. Masks are linear
data, photos sRGB. All use the texture pool, cancellation and memory accounting.

Build UVs are world tiles times `groundmaterial.UV_SCALE` (1984/2048), marked `m2lUVGlobal`/`m2lUVScale`. Picking, masks,
inspection and compatibility compositing normalize to tile-local coordinates (`trackview.tile_uv`, `paintimage.composite`).
Save samples the original tile image itself with its original phase/scale (`trackview.base_scale`); no second encoded tile
image is needed. Older `m2lUVGuard` sources require rebuilding before painting. Native float2 multipliers and UV origins
preserve exact rectangular repeats. Repetition variation acts per photo layer; original tile/source photos stay fixed.

Simple masks have world-phase-aligned extruded borders: 128 source pixels on each side of a 2048-px tile, protecting
through mip seven. Regional masks retain a two-source-texel halo, extended by at most 128 pixels per axis and capped at half
the region span. This bounds ordinary canvas growth while retaining the minimum halo for tiny regions. Full mip chains
remain; these borders do not establish correctness for every distant filter footprint.

Preview normally uses 50 cm mask texels, as Save does. Source dimensions must divide the required step/alignment exactly;
otherwise preview keeps source resolution (`trackdetail._preview_step`). This reduces masks only, not photo resolution.
RGBA channels are independent weights: mips filter separately and retain a unit total. Preview uses lossless RGBA8 DDS;
Save uses BC7 weights within its error budget, retaining RGBA16F where needed. Photos are BC1 in the classic preview,
BC7 with gloss alpha in native regional output. Imported normals fill `txNormal` slots; missing normals use flat maps.
Gloss is bounded by the original ground's ksSpecular, as detailed in [ac-rules.md](ac-rules.md#how-the-ground-is-built).

Coincident ground vertices at 256 m tile boundaries share area-weighted geometric normals and orthogonal tangents.
Cached preview/Save patches preserve the source; different heights/interior vertices remain separate. Height deformation
starts from these shared normals. Existing tracks receive the correction on Save without map regeneration.

## Preparation, transport and Save

Layouts bind source plus ordered paints. Preparation resolves masks and publishes small metadata; repeated index/draft
reads reuse it. View preparation uses bounded processes above its threshold and does not bake colour tiles or encode DDS.
Mask/colour endpoints create missing cache files lazily; cache hits bypass encoder locks. Lossless prepared mask PNGs
under `cache/track-details` are reconstructible from retained operations.

Simple weights use cached HTTP gzip; regional atlases share a gzip bundle with offsets. Each atlas keeps its own texture
identity/budget. Temporary decompressed bundles reserve memory, and atlas data is copied before releasing them.
Cancelling one consumer leaves the others active; cancelling the last releases the transfer. Until a complete layout loads
and fits, the previous appearance remains. Stale downloads cannot overwrite a newer state. Reapplying an immutable
operation moves it to the list's end; retrying a failed preview does not need a second operation.

`app/tracknative.py` prepares missing resources before writing a complete replacement KN5. Important cache boundaries:

| Resource | Reuse key / owner |
|---|---|
| Region masks, `cache/native-masks` | Fields within region/filter halo, palette, bounds and phase (`_mask_key`); unused masks from the track's last Save are pruned |
| Tile native description, `out/paint-views/<version>/native.json` | Source state/image, paints and native profile; unchanged tiles need no weight-field reads |
| Shared photo/normal maps, `cache/native-library` | Pixel inputs and encoder/profile (`_colour_key`, `_normals_key`); gloss invalidates colour, normal strength only normals |
| Clipped render geometry | Piece vertices/triangles, region, UV origins and geometry profile (`_copy_key`); changed geometry clips again |
| Imported-model images | All pixel inputs in the image name; reuse bytes from the last saved KN5 |

`tracknative.prepare` uses bounded workers to prepare each missing tile and unique library image; warm export reuses the
same files. Retained paint inputs are rechecked before replacement. Native estimates include actual mask/image/geometry
and portable data sizes; unsupported drafts report a reason instead of an invented size.

Regional copies are `nocol_`; the edited source loses only its render flag and retains collision vertices/indices.
Clipping cuts only between regions, never at the outer tile UV edge (`tracknative._cuts`, `groundRender.regionCut`):
rounded build UVs and raised wall steps can extend past that edge, and clipping there opens slits between tiles.
Older geometry profiles require another Save, reusing valid masks/photos. Removing paints restores source rendering.

Saved recipes record layout/ground profiles; older supported painted saves can be upgraded without a map rebuild.
`data/map2lap_ground_layers.json` binds compiled slot provenance to the KN5 SHA256, distinguishing snapshots even when
photos/repeat sizes match but normal maps differ. Transfer retains native source-layer snapshots as well as active edits.
Missing inputs permit opening with a warning but refuse Save. Hash-stale provenance is ignored; corrupt bindings are reported.
`app/paintimage.py` remains only a compatibility tile/thumbnail compositor.

The material owns its shader/embedded images; no global CSP shader files are installed. The owned track include manages
model replacements without disturbing unrelated effects. Browser preview cannot establish AC filtering, lighting or FPS.

## Render-region probes

`tools/ground_regions.py` and `ui/tools/ground/` are isolated CPU/WebGL experiments, outside the production renderer.
Use the [tool catalogue](../tools/README.md) and `--help` for flags. They retain unrestricted weights, report palette
overflow and record actual renderer, allocation, draw counts and timings. The texture-array prototype keeps independent
map resolution/repeats and a global coarse mip tail so filtering cannot discard neighbouring contributors.
Its tests compare synthetic mixtures against an independent reference. Those results do not validate AC shading, complete
Editor Save workflows or track FPS; they change no user track, draft or library.
