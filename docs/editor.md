# Editor

The page is React and TypeScript in `ui/`, built with Bun into the committed `src/web` files. `server.py` serves these
and the `/api/` endpoints. Bun is needed only for development; `bun run dev` proxies API calls to the running Map2Lap.
The Editor's three.js code loads on the first visit to its tab; camera and mesh data live outside React.
Generated ground uses a neutral `ksMultilayer` material around its existing baked image, leaving its colour unchanged.
The preview also reads colour-only `ksPerPixel_dual_layer` materials: the new image uses its UV multiplier, the original
tile and keep mask use the original UVs. A white-base, red-only `ksMultilayer` colour replacement is sampled in world X/Z
metres, including bridge road strips. These images share the existing texture pool, loading progress, memory limit and
cancellation; masks are sampled as linear data.

`app/trackview.py` scans an installed Map2Lap track's kn5 with `track.kn5.scan`: offsets, sizes, materials and start points,
without loading all meshes or textures into memory. The page requests their bytes separately, with the file's revision.
A shared progress bar covers mesh loading, required textures and selection preparation. Reading the index has an indeterminate
bar; afterwards the fraction counts completed tasks, not elapsed or remaining time. Its reserved place stays when loading ends.
A changed or partially written file returns HTTP 409. The viewer loads nearby meshes first (six at a time, twelve textures), counts
memory against its configured limit and disposes meshes and textures when the track changes. The limit estimates RAM and GPU use;
it does not include all browser overhead. Meshes and textures above it stay out of the preview; `tools/editor_memory.py` says what a
track takes. A long track is tens of thousands of requests: GETs share kept connections (HTTP/1.1), and a part cut off on its way is
asked for again. Loading manifests, mesh/image bytes and selection preparation allow 30 seconds without response headers
or another nonempty body chunk; progress resets that timer. GET connection failures retry at most twice, HTTP refusals
and leaving the track never retry, and the read-only textures POST times out without automatic repetition. In the browser
console, `map2lapLoading()` lists open transfers with their URL, attempt, received bytes, age and time since progress;
completed and cancelled entries are released. This diagnoses network waits, not synchronous geometry work on the main thread.
The camera moves as in a building game, level over the ground (`view.ts`), with no state kept between moves that
could lie far off: what it turns around or zooms towards is looked up each time. The middle of its view stays within the track's meshes plus a margin (the camera may stand beyond, to look back), it stays
below a height the distant terrain can be seen from; where no ground lies under it, the last one found counts.

The Editor views and inspects tracks and leaves out single objects: trees and bushes on any track, by their count of
triangles; what the build lists (`track/objectlist.py`: cars, houses with their signs and doors, poles with their wires, street
furniture, signs, rocks, fences, gas stations, leisure grounds) on tracks built with the list. A left out one's triangles shrink to a point,
so the others keep their numbers; the list, a draft (`app/trackedits.py`, `out/edits/<track>.json`), is saved a moment after each
change, written whole, and refused when another tab or a build changed the track since it was read. It holds for one state of
the kn5 shown. Save in the Editor (`app/trackcopy.py`) writes the track from it, in its place or as a copy: the folder copied to a
hidden temp folder, the kn5 without those triangles and with its height changes (`kn5.without_faces`, `trackheights.moved`: what doesn't
change is copied as it stands), the object list fitted to it, the recipe in its map2lap.json, then moved into place (refused while AC holds the kn5). No build. The first Save
keeps the kn5 as it was as the track's source (`app/tracksource.py`, `out/sources`): the Editor shows the source while the recipe
counts (`trackview.served`), so what was deleted can come back after any Save. In its place on one disk the old file itself becomes
the source (a hardlink until the old folder goes, taken back if the Save fails), which needs no room for a copy; a new track leaves the
original installed, so its source is a true copy. A Save, a build and a deletion never run at once
(`trackcopy`'s lock, asked under the server's). Saves and app updates also exclude each other under those locks: the update's
restart must wait until saving finishes. A saved track is its own work from then on, under Edited in My tracks: a build of its
name is refused, by the server under the same lock and by `generator.build` and `finish_obj` for the tools too (`mytracks.saved_in_editor`;
OBJ parts alone stay allowed, they don't go into AC), and Build as copy makes a new track from the map, which has none
of the edits; sources no track of their AC folder names go at the next
start, and none while that folder isn't there. Planned editing tools will use the kept build files; viewing needs only the
installed track. The page keeps build files by default, including `build.log`; Settings → Editor → Build files can
turn that off or delete them. Existing saved preferences stay in effect.

## Tools and changes

The right panel has Properties and Details tabs. Properties keeps the clicked selection independently of the pointer and
shows Appearance with a small texture preview; painted-ground selections appear there too. Details contains selected mesh
data, object details and live Under pointer information. Object details distinguish an object's own triangles
and loaded dimensions from its surrounding merged mesh, show related ids and retained original build parameters where
available, and list hidden as well as visible parts. The separate Under pointer section holds live hit and position data.
Sections collapse; the panel can be hidden or resized by dragging its divider (arrow keys on the divider also resize it).
The 3D view and its tool bar use the remaining width.
Right-clicking ground and choosing Edit uses the active ground selection, including Select all and added regions.
Without a ground selection, the right-clicked surface becomes the selection; a left click selects a new surface.

`app/trackinspect.py` reads one selected object's descriptions through the cached draft context, via `/inspect`, bound to
the served source revision. These descriptions stay out of `/index` and `/copies`. `/thumbnail` converts one source texture
to a browser-readable PNG at most 256 px wide/high and caches at most 32 encoded previews; revision validation still runs on
cache hits. Selection changes cancel detail requests and discard late results. Original build parameters describe the source;
placements and height changes remain separate. Appearance shows the dominant retained colour image at the selected point.
An unrelated tile finishing its textures never remounts that card. Simple RGBA8 masks are inspected by reading only their
header and one pixel; regional ground reads the existing level-zero atlas at that point instead of recomposing the tile.
Selection metadata appears before its highlight finishes decoding, and already encoded selection masks are merged without
decoding them unless different selections overlap on the same tile.
The highlight samples its mask in tile-local world coordinates with clamped edges; selecting a surface cannot mix the
opposite edge into a thin blue line, including on sources with global UVs.

Simple replacement masks have an extruded, world-phase-aligned border: a 2048-pixel tile uses a 2304-pixel canvas.
The 128-pixel guard on each side keeps the opposite repeated edge out of bilinear filtering through mip seven; the complete
mip chain remains, so coarser levels still average more distant areas. This adds 26.56% mask area, without enlarging the
photographs. Saved material UVs and multipliers compensate for the canvas together; the Editor exposes canonical tile UVs
again for picking and later edits. Old sources remain readable. The cache profile regenerates preview masks; saving again
writes the guarded masks into AC without a track build. Native regional masks retain the true two-source-texel halo and
extend it by at most 128 pixels per axis, capped at half that region's span. This bounds each ordinary region canvas to
four times its unpadded area; tiny regions retain the minimum halo. Large regions gain filtering room through mip seven,
while the complete cross-region far-filtering contract remains separate.
Terrain pieces meeting at exactly the same 3D point on a 256 m tile boundary share area-weighted geometric normals and
orthogonal tangents. Preview and Save apply small cached patches without modifying the retained source; new generator
outputs receive the same correction. Different heights and interior vertices stay separate. A height edit starts from
these shared normals before applying its deformation, so saving preserves the edited lighting. Existing tracks receive
the correction on their next Save, without rebuilding their geometry from map data.

Its buttons stand in the sidebar by groups (`ui/src/editor/ToolPanel.tsx`; portals, their state stays by the view in `EditTools.tsx`): File (the track, Save, Play, Discard all), General (Undo, Redo, Select, Camera), Terrain, Objects; one tool on at a time, Esc back to Select. Discard all asks before taking back changes since the last Save, as one undoable step. Previously saved edits remain; a track never saved in the Editor returns to its built state. A reopened unsaved draft reads the full saved recipe only when needed, through `/edits/saved`, so ordinary loading does not duplicate large height rasters. The save state stands beside the loading progress. The active tool's options stand in a bar overlaid on the view (`ToolOptions.tsx`): with every tool its options reach Shift, Ctrl, Alt and Ctrl+Alt from left to right, lit while held, numbers by that key with the wheel.
Road camera (K) goes along the route by Shift and the wheel or riding by itself (`Camera.tsx`, `ride.ts`), and back to the first view (Home).
Move (M, or Move in the context menu) takes what is picked along by a drag, turns, raises and sizes it by the wheel (`Move.tsx`, `placing.ts`): a placement per object
(`app/placement.py`), written into the kn5 by `app/trackplace.py` before the height changes; the view shows it at once and takes the server's
meshes when they come.
Dragging keeps each object's height above the terrain, including a height set by hand; the ground is sampled under its pivot,
without tilting the object or flattening a slope. When the terrain has height edits, `/move` subtracts their old-to-new difference
from the placement, since Save applies them afterwards. Outside loaded terrain the drag keeps its height.
Copy (C, or Duplicate in the context menu) keeps one source ready: each left click places another instance, Esc ends it.
Once its template is ready, the source is no longer selected: X switches to Delete and leaves the original intact.
Right-clicking another object keeps that template; Choose another or Duplicate explicitly takes a new source. A placement
clicked before leaving Copy still completes, as one undoable edit.
Its preview and placed copies rest their foot on the clicked ground. Turn, Height and Size in its options apply to each new copy,
by number or Shift/Ctrl/Alt + wheel, as with Move; Height is the clearance above the clicked ground, Size relative to the frozen source.
`app/trackcopies.py` keeps source member ids and frozen poses in the draft and recipe, with independent `copy_<id>#<member>` ids;
houses take their children and collision, a copied pole has no wires. Generated meshes extend the index and object list without
reloading the source meshes or moving the camera; Save appends the same geometry, bundled by tile, kind, material and mesh flags
and split before AC's vertex limit. Placements and then height changes apply to copies too; Undo, Redo and Discard include them.
The validated draft context is cached by the source, draft, recipe and object-list file states. Copy geometry has a separate
SHA-256 revision: unrelated draft changes cannot invalidate its layout. `/copies` returns only generated mesh metadata and
copied object lists; their cancellable loader is separate from the source queue and retries an obsolete manifest. Its indexes
retain the source entries. The server keeps one generated manifest (up to two million vertices); height-query cache keys hold
only its digest. The preview updates when its pointer, camera, pose or ground changes, and uses the server's complete foot
anchor, including hidden collision. Pending drags keep their displayed pivots until canonical placements arrive; a failed
drag restores the kept meshes.
Smooth road (T) includes Mark road: two clicks bound a road region; further draggable points can add side-road branches,
including a Y (`app/roadregion.py`, `ui/src/editor/useBand.ts`). The retained map graph chooses the connections and separates
mapped levels; it never uses the main driving route. The orange region follows the actual painted road mask, clips at the
terminal cross-sections and excludes neighbouring unselected road segments, including a close leg of the same hairpin.
Strength starts at 0%, so marking alone changes nothing. Strength, Transition and point changes apply automatically after a
short debounce; Enter and separate Apply/Cancel buttons are unnecessary. Mark road in the bar starts another region at 0%.
Esc cancels pending work; already committed changes remain available to Undo.
`smoothing.ts` owns one active height operation: adjustments replace it as one Undo step, and returning to 0% removes it.
The server calculates replacements using `trackedits.moved_without`, excluding that operation from the current height field;
slider changes cannot compound the same smoothing. Undo closes the active range instead of applying it again. Late answers
after Escape or a range change cannot enter the draft. Roads offer Smooth road directly in their context menu, starting at
the clicked point. `roadnet.py` retains the arm spline/crossfall calculation but uses a shared junction plane for selected
branches; an unselected arm keeps its existing join. All arms contribute to one 2 m height raster, avoiding overlapping
height additions. The terminal points remain fixed. The terrain transition is shown with a separate faint, low-resolution
orange mask; it stops at unselected roads. Transition sets its minimum width (6 m initially); large changes automatically
need a wider fade under the existing side-slope rule. New road joins beyond the existing road-grade limit are refused unless
an already steeper bump is being improved. Long gaps without editable ground, including deck/tunnel stretches, are refused.
One region has at most 20 points, 3 km of selected road, 64 painted tiles and the usual height-raster point limit. Routing and
compressed masks are cached separately; the map graph stays independent of draft revisions. Marks follow refreshed ground
heights without an idle-frame raycast. The legacy linear band API remains for its solver tests and existing callers.
Elevation (H: the round brush of `useBrush.ts`, which a tool gives what a stroke does) and those tools make a height change on the server (`app/trackheights.py`, a raster the draft holds; while it is under way, what it changes so far comes back without being kept): it moves the ground of the kn5 and what lies along it, vertex by vertex; single
objects move whole, wires go from pole to pole; water stays, and one that reaches a deck or a railway is refused. Saving the draft names the meshes that moved; the view fetches those anew from the server, which hands them out as the
draft says, so the view and Save have one reckoning and the page none of its own. A new kind of mesh is sorted there too (`engine/tests/test_trackheights.py` stops on one that isn't).
Which triangles make up an object: `track/objectlist.py`, written by the build (parked cars, houses with their signs and doors,
street furniture, signs, rocks, fences, gas stations and leisure grounds; trees and bushes by their count of triangles). Every mesh
a build adds is entered there as listed, counted or part of the track: `tools/check.py` and `tools/measure.py` stop on one that isn't.

## Material library and imports

Properties → Edit opens Textures and imports one colour image (PNG, JPG or two-dimensional BC1/BC2/BC3 DDS) through a file chooser or
drag and drop. A modal shows its preview, name, category and the physical width/height of one repeat; tags, source URL and
license are optional. Cancel prepares no permanent material. The library can be searched by name/tags, filtered by category
and browsed in pages of 40; only small previews load, never the full original maps. Keyboard input in its fields stays there.

User assets live beside the app in `library/materials/<id>/asset.json`, `original/colour.<ext>` and `preview.png`, on Windows
and Linux. The manifest contains relative paths and original file information; the original bytes are retained. Material ids
bind image content, physical repeat size, variation and material properties. Importing that combination again reuses the existing material and name.
Model packages use the parallel `library/objects/` layout described below. The library is excluded from Git and both release formats;
the updater refuses an archive containing `Map2Lap/library`, so neither system's update step replaces user assets.

Material schema 2 adds optional `normal` and `roughness` maps and shader-independent `roughness`/`normal_scale` properties.
The import API accepts role-bound uploads (`role=colour|normal|roughness`), then optional `maps` upload references when
publishing a material. Colour is sRGB; RGB tangent-space normals use +Y, roughness uses the red channel as linear data.
Each original remains unchanged under `original/`; normalized per-role PNGs are disposable. Data maps bypass ICC colour
conversion. Packed DDS normals and unapplied EXIF orientation on normals are refused. Missing maps use flat normals and
roughness 1; normal scale defaults to 1. Schema 1 packages retain their ids and remain readable.
The import dialog accepts colour and optional normal/roughness files, with independent repeat width/height and variation.
Preparation is queued across roles and dialog reopenings; pending, replaced or invalid maps cannot enter the committed material.
The Editor preview uses tangent normal and roughness maps for imported PBR materials. A shared linear texture retains
normal RGB and roughness A; photographs stay sRGB. Data and colour use the same repeat and variation offsets.
Original tile pixels and existing colour-only assignments retain Lambert lighting beside PBR fields; imported PBR uses
physical lighting. Undo, Redo and reopening use the same immutable inputs. Production AC output currently keeps the colour fallback
and the native adapter still limits one tile to three replacement materials.

Save retains versioned compiled slot provenance separately in `data/map2lap_ground_layers.json`, bound to the written KN5's
SHA256. It identifies the exact material snapshot for each native slot, including assets with identical photographs and repeat
sizes but different normal maps. This restores the Editor's PBR inputs after transfer without the original source or caches;
the paint selections and material snapshots remain the editing inputs. A stale binding is ignored and corrupt bindings are
reported. Index loading validates the provenance once and resolves each shared asset once across its tiles.

`app/materiallibrary.py` publishes complete packages atomically. Uploads are limited to 64 MiB and decoded images to 8192 px
per side/32 megapixels; two queued uploads bound the input buffers and image preparation is serialized. It applies image
orientation/embedded colour profiles, strips metadata from derived images and prepares at most 2K power-of-two colour maps.
Each axis has at least 4 pixels so BC1 uploads have a valid base block in WebGL.
Prepared library colour maps remain lossless PNGs; the unused standalone library DDS path has been removed. Applied ground
colours lazily encode one shared BC1 DDS with mipmaps down to 1 px. Transparent source images remain available in the library
for future cutouts but cannot be applied to ground. `track/textures.py`
shares Pillow's portable DDS encoder with `obj_to_kn5`; its older build profile retains the exact previous mip chain and bytes.
High-bit-depth images are refused with an 8-bit colour-image message. ICC conversion retains original colour channels until
the profile transform, including CMYK, then restores alpha. Image preparation is serialized separately from library reads;
warm colour/DDS reads do not wait for another import to decode.

Prepared colour maps, DDS and unconfirmed uploads are disposable under `cache/materials/<preparation version>/<content hash>`.
Committed originals and previews remain in the library. A missing or partially evicted cache entry is rebuilt from its retained
original, including after Settings clears the cache. Listing caches only small summaries; `/api/library/materials` pages them,
`/api/library/imports` prepares a bounded upload, and the final JSON POST imports the chosen settings. Importing a material
alone changes no track. The user-facing picker is named Textures and opens from Edit, a painted-ground Appearance image or ground Edit.
It keeps search/filter/selection state between openings, pages a scrollable thumbnail grid and shows one larger preview.
Objects uses the same library layout, search/category filters, paged asset grid, right-hand preview and footer. Its GLB
import fields open in a separate Import object dialog, matching the texture import flow. Each tab keeps its own browsing
state; only the selected object opens a live 3D preview.
Import opens its own dialog; Apply changes the selected ground and closes the picker only after its preview succeeds.
Select all previews at most 64 prepared ground tiles. An incomplete selection can apply to its highlighted part: the picker
states the tile count and labels its action accordingly. The request freezes that tile subset, and the server reads its
authoritative source masks; later loading cannot change the chosen tiles. Unscoped incomplete Select all requests remain refused.
Escape closes the picker without clearing the ground selection, including from its search field.
The selected texture's repetition variation can be changed before Apply without reimporting; this setting belongs to that
application and is retained by Undo/Redo and Save. Delete texture asks for confirmation and removes only the selected
library package. Already applied colours, retained snapshots and saved tracks remain independent of that package.

Appearance resolves the displayed texture at the selected ground point against its immutable displayed version. It shows
the retained imported name, a small preview of that photo and the metre repeat size, rather than a whole composited tile.
The original ground remains labelled as such at untouched points; soft edges indicate the dominant blended texture.
These selection requests read existing layer masks and do not bake colour tiles. Previews come from retained assets,
so they also work after library removal or on portable saved copies. A changed selection/version cancels its old request;
source mesh/material/shader diagnostics remain under Details.

## Imported models

`app/objectlibrary.py` stores immutable schema 1 model packages under `library/objects/<id>/asset.json` with unchanged
`original/model.glb`. Their ids bind the GLB content, category, metres per source unit, model-local anchor and explicit
collision choice (`none` by default, or `mesh`). These import settings are independent of future scene placements. Name,
tags, source and licence remain with the package. Prepared uploads under `cache/models` are disposable; original bytes
remain available and hash-checked after clearing that cache. No model collection is shipped.

The object importer accepts GLB, FBX and OBJ, or a ZIP containing exactly one FBX/OBJ and its companion MTL/images.
`app/modelimport.py` converts FBX/OBJ with the bundled `src/bin/modelconvert-*` ufbx reader; Blender is not required.
The unchanged input is kept as `original/upload.fbx`, `.obj` or `.zip`, with its own hash and original filename, in the
library and portable saved model snapshots. `original/model.glb` is the validated canonical representation consumed by
the preview, placement and Save; existing GLB originals remain byte-identical. Preparation tokens identify the upload,
while immutable model ids use the canonical GLB hash and semantic import settings.

The separate converter process normalizes FBX file units and axes to glTF's metre/Y-up frame; OBJ defaults to metre/Y-up
and the import scale remains adjustable. It triangulates polygons, retains node placements, hard normals and UV seams,
and converts classic material colours, cutout alpha, normal, roughness/metallic and emissive images. Legacy roughness is
an approximation from the Phong exponent when no roughness is supplied. Bump/height maps remain in the original upload;
the import dialog explains that surface relief needs a tangent-space normal map. Layered images and texture transforms
must be baked before importing. Non-white vertex colours must be baked to a colour image, matching the existing GLB path's
supported attributes. Actual animation, skinning and morph targets are refused; constant exported channels are
allowed. Saved AC shading retains the existing colour/alpha limitations described below.

Only uploaded companions can satisfy external references. ZIP members must have unambiguous relative paths, with at most
1024 entries and 128 MiB unpacked in total. The native reader opens no external files, caps temporary and result allocations
at 256 MiB each, and conversion times out after 60 seconds. The existing geometry and image limits also apply to converted
GLBs. `/api/library/model-imports/<token>/preview` returns that validated GLB before permanent publication.

`app/modeldata.py` reads self-contained static GLB 2.0 triangle meshes. Primitive arrays are shared between scene nodes;
node transformations remain separate. It reads interleaved attributes, normalized UVs and embedded PNG/JPG images
(buffer views or inline base64 data),
retaining original material descriptions including alpha modes/cutoffs and double-sided leaves. Bounds use the selected
scene's complete transforms, and the default ground anchor is the horizontal middle of the transformed foot. Geometry is
in glTF's Y-up metre frame. This core performs no shader conversion or physical surface assignment.

The importer bounds file size, JSON metadata, geometry, node references and image dimensions before publishing a package.
External resources, required extensions, skinning, animations, morph targets, sparse accessors, non-triangle topology and
additional vertex attributes are explicit import errors. Original material and image resources are never silently removed.
The Objects tool group's **INSERT** button (I) opens the shared asset library on its **OBJECTS** tab; **TEXTURES** contains
the ground picker used by Edit texture. Fields keep their typing shortcuts. Import a GLB, give it a name and metres per source unit, choose the default
collision, then add it to the library. Object cards show rendered model pictures, including cutout leaves, just as texture
cards show their images. Visible cards share one offscreen renderer; finished 512 px PNGs are cached in the browser
(64 in memory, up to 256 in persistent storage when available). Closing the library or changing pages cancels abandoned
requests. The larger static preview uses that same PNG, with no second model download or render; selecting an object
promotes its pending picture ahead of the remaining cards. Import and library pictures use reduced fill light and highlight
compression so bright foliage retains its shading; source material colours are unchanged. **Place on ground** accepts
repeated ground clicks until Esc. **Replace selected tree** accepts a picked tree or bush and preserves its current placement.
With several trees selected, the context menu's Replace opens the object library for the whole highlighted selection.
Right-clicking another member of a marked tree sort retains that selection. Replacement keeps each tree's position, terrain
clearance, turn and actual height, scaling the new model uniformly to preserve its proportions. A retained per-instance fit
precedes its editable placement; Undo/Redo treats the whole replacement as one step. Save, cold reopen and Copy retain the fit.
Before placement a translucent model follows the mouse over the ground. Its Turn, Height and Size options also affect each
new placement, including the modifier-wheel controls used by Copy. Model previews and placed GLBs share viewport reflection
lighting without altering imported metallic or roughness factors or the original terrain lighting.
An already imported instance can receive a different asset without changing its instance id or pose. The normal Move tool
provides dragging, turn, height and size; bindings and prepared source poses enter the same Undo/Redo step.
Copy and Duplicate create a new model binding to the same frozen snapshot, preserving the source turn and size while
placing its foot on the target ground. Existing source-object copies and model bindings save together.

`app/trackmodels.py` freezes a separate immutable snapshot before applying an asset. Its id covers both the original GLB hash
and the complete import description, so later library edits cannot rescale existing trees. Draft schema 2 adds ordered `models`
bindings (`id`, snapshot `asset`, initial `at`, optional source `replaces`, object `collision`); schema 1 drafts remain readable.
The existing `placed` list remains authoritative for instance movement, rotation and size. `/api/library/model-imports`,
`/api/library/models` and `/api/editor/<track>/model` provide bounded imports, browsing and prepared bindings.

Save writes actual KN5 vertices, UV0, normals, tangents, colour images and alpha materials. glTF UV0 retains its top-left
orientation; node transforms, import units and the frozen ground anchor are applied once. Missing normals produce flat face
normals and ignore supplied tangents; mirrored node transforms reverse triangle winding and use inverse-transpose normals.
Double-sided materials receive back faces. Parts split below KN5's 65,535-vertex limit. `none` creates `nocol_` render meshes;
`mesh` additionally creates invisible `1WALL_` collision. Visual source replacement removes only the selected `nocol_` faces;
source collision and unrelated vertices/indices remain unchanged.

`data/map2lap_models/` retains the verified original GLBs and snapshot descriptions once per asset in the saved track.
Its `compiled.json` is compiled provenance tied to the written KN5's SHA256, rather than a new editable geometry format.
After loss of the library, preparation cache and source cache, the semantic bindings, model deletions and poses remain editable.
Compiled source provenance distinguishes replacements already applied to that source from new replacements, so renumbered
billboards are not removed again. Regeneration strips the prior owned render regions and reuses matching owned material slots.
Inherited terrain changes apply only to regenerated models; the remaining baked source is not moved twice. Portable originals
needed by local Undo are retained before their last binding is removed.

The production browser uses `modelDraw.ts` to share each asset's real GLTF geometry, materials and textures across instances.
World-space CPU picking meshes retain the ordinary object selection and movement implementation. Removing one instance does
not dispose the remaining instance's shared render buffers. A rejected load or memory reservation keeps the previous visible
state; obsolete asynchronous loads are released. The configured memory estimate includes the shared render resources and the
ordinary picking-mesh allowance. Bounded User Timing records `map2lap.models.resources` and `map2lap.models.frame` expose
resource counts and CPU render-call duration; texture GPU bytes are estimates and software-browser timing is not hardware FPS.

Native material conversion currently implements base colour factors, OPAQUE/MASK/BLEND and double-sided geometry.
The original GLB retains its full PBR descriptions, and the browser uses its normal/roughness/metallic inputs, but equivalent
normal/roughness/metallic shading in AC is not implemented by this model exporter. Base-colour texture transforms are refused
at binding, rather than ignored; additional vertex colours and UV sets are refused at import. No game validation is implied.
Server geometry is still copied per instance, and browser/native draw counts grow with instance count. Forest-scale batching,
LOD/performance evidence and the remaining native material coverage are separate open release requirements.

## Ground texture changes

All build-recorded painted-ground materials can receive an imported colour texture, including shrubland, forest, rock and
roads. Ctrl combines selections; Shift takes all matching prepared areas, including disconnected regions. Ground Edit and
clicking the Appearance image open the same picker. Roads retain their existing driving physics when given a different image.
Separate mesh materials, including the road verge and buildings, are not handled by ground texture assignment. The client
and server enforce a union of at most 64 tiles per application. The picker explains oversized selections and refuses incomplete
Select all requests, so it cannot silently apply to only part of the requested material.

`app/trackpaint.py` captures authoritative selection masks and a material snapshot as immutable ids. Ordered `paints` in the
draft and saved recipe participate in Undo, Redo, Discard and Save. Operations and normalized source images remain under
`out/paints` and `out/paint-assets`; a saved track also retains its active operations/materials in `data/map2lap_paints`.
Removing a library entry or clearing cache does not remove a track's materials. This retained edit data is not disposable cache.
New material snapshots use asset schema 2, preserving the complete imported description, all original files and normalized
maps independently of their library entry. Save validates their digests and includes these files in its disk estimate. Older
schema 1 snapshots remain readable with their retained colour image; originals absent from those snapshots cannot be recovered.
The operation format still assigns a material id to selected areas and contains no shader channels or render-region palette.

`app/trackdetail.py` retains imported images as separately repeated full-resolution layers. Semantic operations and the
browser retain all material contributions, including soft overlaps. Native Save partitions an edited tile into spatial
regions with at most four contributors, including the original only where its weight is positive. Five or six distributed
materials can therefore share a tile. A transition whose local filter halo still needs more than four materials is explicitly
refused by Save before staging; Apply, preview and draft remain unrestricted. Dense six-way junctions and distant cross-region
filtering remain open release requirements. Ground colour images must be opaque. Each layer retains exact independent X/Y
repeat sizes; identical photos and normal maps share their DDS, without cutting geometry at photo repetitions.

Immutable layouts bind the source and ordered operations. First preparation resolves masks and publishes a small layout;
subsequent draft/index reads reuse that metadata. They do not composite colour tiles or encode DDS. The mask and shared
colour DDS endpoints encode missing cached files lazily under `cache/track-details`; cache hits bypass the encoder lock.
Prepared mask pixels are retained as a lossless PNG in disposable cache, avoiding repeated weight calculation after an
in-memory eviction or restart. A missing PNG is rebuilt from the retained operation masks. RGBA mask channels are independent
weights, not alpha-associated colour: each mip is filtered independently and its weights sum to 255. Masks use lossless
uncompressed RGBA8 DDS, avoiding BC3 colour/alpha quantization changing their brightness. The classic colour path uses BC1
photos; regional photos use BC3 with independent gloss alpha. A local FP16 mask is retained when RGBA8 exceeds the weight
error budget. A full
2048² mask including mips occupies about 22.4 MB instead of 5.6 MB for BC3. The descriptor, memory budget and Save's disk
estimate include the actual size. This preserves 12.5 cm mask resolution instead of silently downsampling road boundaries.
The renderer samples masks as linear data and colours as sRGB, blends the retained original tile with the repeating photos,
counts all images in loading progress and the memory limit, and releases unused images after Undo or replacement. Stale
downloads cannot overwrite a newer selection. Until a complete layout fits and loads, the previous appearance remains.
Reapplying the same immutable operation moves it to the end rather than creating duplicate ids. Apply can retry a failed
preview download even if the retained draft already contains that operation; success is reported only after the preview loads.

Weight transport retains the exact cached pixels and mip bytes. Simple RGBA DDS masks use cached HTTP gzip; regional
weights share one gzip bundle per tile version, with byte offsets for each unique nonconstant atlas. Fetch handles HTTP
decompression. The viewer keeps per-atlas texture identities and memory accounting, reserves the temporary uncompressed
bundle separately, and copies each atlas before releasing that bundle. Cancelling one consumer leaves others running;
cancelling the last releases the transfer. Existing individual weight endpoints remain available.

Save writes cropped RGBA region masks with filter halos and shared photos in `ksMultilayer_objsp` materials. Imported normal
maps and repetition variation use the managed CSP `ksMultilayer_objsp_nm4` replacement. Roughness is currently converted to
a specular-strength approximation in photo alpha; this is not PBR roughness. Regional render copies are `nocol_`; the edited
source is hidden for rendering while its collision vertices and indices remain byte-identical. Global UV origins and native
float2 multipliers keep physical repeats exact. Cold reopen retains the editable source; removing paints restores its render
flag on Save. The source is retained for Undo/Discard, and the saved recipe/bundle carries
the operation masks and normalized colour snapshots. Saving a transferred track also retains the material snapshots referenced
by its native source layers, so another edit or Save as copy keeps their names, physical sizes and previews. Legacy full-surface
world-space colours remain source layers when part of that ground receives a new material. Even without the local source cache, the native material remains
viewable and global UVs are normalized when selecting ground. Missing retained inputs remain openable/discardable with a
warning; Save refuses incomplete data. Saved recipes record the detail layout profile; older painted saves remain saveable
so their retained edits can be written with sharp layers without rebuilding. `paintimage.py` remains the low-resolution tile/thumbnail compatibility compositor;
the normal Apply renderer and Save use the separate detail layers.

Imported materials also retain a repetition-variation flag. Natural ground categories enable it by default; structured
patterns can disable it at import. Older natural imports use the same default. The Editor blends two translated photo
samples with explicit UV gradients and a static world-space noise field. The selected mask and original tile in A remain
unchanged. No bigger colour tile or extra photo copies are produced.

Save keeps the native `ksMultilayer_objsp` material as a regular-repeating fallback. A managed include in the saved track's
`extension/ext_config.ini` selects CSP's `ksMultilayer_objsp_nm4` for marked materials, enables only the imported layers'
`tilingFixR/G/B/A` for the applicable imported channels. Missing normal maps are filled with flat defaults. The owned include is
regenerated during Save and removed when no source/edited materials need it; unrelated effects remain. Without CSP the
track remains driveable with ordinary repetition. The browser and CSP use the same two-sample mixing rule, but CSP's
internal noise differs from the browser's deterministic field, so individual shifted patches need not occupy identical places.
The implementation adds texture samples; frame-rate cost is not inferred from unit tests. Normal orientation, specular
calibration, distant filtering and large-track performance still need native validation.

The Inspector's **Details** tab holds all edit counts, selection notes, errors and recovery actions previously below the
tools. A persistent attention button also works with the Inspector collapsed. Track statistics measure the current KN5 file
and fetch a draft size estimate on demand; an unchanged track is labelled measured. An unrepresentable native draft shows
its reason instead of inventing a size. Editing controls remain over the view.

## Render-region probes

`tools/ground_regions.py` measures spatial palette partitioning independently of the live renderer. Its inputs are unrestricted
semantic material weights, not RGBA slots. `app/groundregions.py` partitions a tile while retaining each material present in
a region's filter support. Soft junctions and coarse texture filtering can require more than three replacements even in the
smallest region. Such regions retain their full palette and are explicitly reported as overflow. Splitting stops when both
children would have the same global filter support; more draw regions cannot reduce that palette.

The tool writes reproducible, pickle-free weight archives and a JSON report under `out/analysis/ground-regions`. It records
planner time, Python/NumPy allocation, proposed mask bytes and the palette groups implied by the shader capacity.

`--gpu` additionally builds the isolated browser probe in `ui/tools/ground_array.ts`, using Bun and Playwright. It serves only
the generated fixture from a temporary local HTTP listener. `--browser` chooses Chrome, Edge, Firefox or WebKit;
`--hardware` requests the browser's default graphics backend. The report always records the actual renderer, which can
still be software. Results and images are retained under the output's `webgl/` folder. Synthetic colour/normal/roughness
maps exercise the rendering contract; these are not measurements of a complete track or full-resolution photo collection.

The WebGL2 prototype in `groundArray.ts`/`groundArrayRender.ts` samples independent texture arrays for all material weights
and maps. Each layer retains its own physical X/Y repeat, variation, normal scale and roughness factor. Array padding keeps
each original map's texels at its own resolution. Explicit repeat-aware isotropic bilinear/trilinear sampling stays within those bounds,
including devices without float-linear texture filtering. Colour mips average in linear light; normal/roughness/weights stay
data. No material is removed when too many contributors meet. Unsupported device capacity is an explicit error.

Regional weight arrays keep aligned local mip prefixes and share the complete global coarse tail. The palette expands to
every global material across the prefix/tail transition, so distant filtering cannot lose contributors from adjacent regions.
The prefix split accounts for border overhead; the full array is retained when regional allocation would be larger. Derived
weight arrays use half-float GPU storage where every positive weight remains representable, otherwise float32. Original
float fields and semantic material assignments are independent of this disposable representation.

Variation uses integer-hashed world lattice cells seeded by the semantic material id, so array, palette and region order
do not change the pattern. The CPU reduces each tile origin modulo each material's repeat before uploading its phase;
texture sampling and gradients use local coordinates to preserve texel precision far from the track anchor. Colour and lit
output encode linear light as sRGB for the canvas; normal and roughness diagnostic modes retain raw data values.

Browser tests compare dense twelve-material mixtures, individual contributions and filtered pixels with an independent
reference; exercise serialized fixture reopening; verify normal/roughness lighting, rectangular repeats and variation; and
check near, far and fractional mip transitions. Reports count actual texture allocations and draws. Completion-wall timings
include CPU/graphics synchronization, not GPU timer queries or track FPS. The lighting probe is separate from CSP.
No user track, draft or library is modified by the standalone probe. The live browser now uses unrestricted regional weights;
the AC rendering path and the complete Editor editing/save workflow are not validated by this probe.

## Build facts and painted ground selection

New builds keep `data/map2lap_editor/` beside the kn5 (`track/editorinfo.py`). Its versioned manifest belongs to exactly one
kn5 state; a stale or missing manifest is ignored. Each tile ZIP contains a base material raster, the ordered alpha masks used
by the actual ground painter, and their texture/repeat/brightness descriptions. Rock blends, paths, roads, dirt-road grass
strips, streams, sport markings and forecourts are recorded where they are painted. The baked colour image and physics are
unchanged. Masks are lossless PNGs, separate from the baked texture, and retain soft edges.

The tile also retains nearby mapped road and land-area identifiers, projected geometry and selected map facts; available
road specifications; the generated road/marking chunks and sidewalk runs; original prop, barrier and parking rows; and
generated mesh names, material roles and bounds. These are build descriptions for future tools, not a complete triangle-to-road
or triangle-to-bridge ownership index. The object list's optional `details` entries retain original prop parameters and generated
building dimensions/footprints. Copies and Save preserve these details; the picking index omits them to avoid transferring
unused model descriptions on every load. Geometry, materials and collision already in the kn5 are not duplicated here.

Loading prepares each loaded ground tile through `/surface/prepare` before reporting “parts loaded”. `track/surfaceindex.py`
evaluates the recorded paint once, retaining dominant materials, soft alpha masks, horizontal runs and linked components in
disposable content-addressed files under `out/editor-selection`. Sources and saved copies with the same metadata reuse them;
decoded lookup data is bounded to 64 MiB. Road-chain numbers use the lowest sorted source number in each chain, so cached
tiles and Smooth road agree across processes. The index version invalidates older owner assignments; loading prepares fresh
indexes without rebuilding the track or changing edits. A click queries `/surface` with the served source revision, mesh and hit UV: it looks
up prepared components without evaluating paint or flooding pixels again. Layers with the same material contribute together.
Normal road selection follows one mapped chain, stopping at branches and changes between a road and a link; same-kind degree-two
map splits join only on the same mapped level. This uses retained map topology, not visual junction guessing. Shift selects all
matching prepared material regions instead, including disconnected areas and distant tiles. Selection is bounded to 64 prepared
tiles; unprepared tiles or further matching areas are reported as incomplete, and an incomplete Select all cannot be applied.
The page highlights
the lossless mask over the loaded ground meshes, sharing their live geometry, so height edits remain aligned. Only masks for
loaded tiles are decoded, within the preview memory limit. Selection changes no draft and enables no Delete, Move or Copy
action. The shared Select bar offers Shift / Select all and Ctrl / Add; Ctrl keeps earlier regions or objects, and clicking an
already picked object with Ctrl removes it from the selection. Shift on an object selects its matching sort (trees by atlas image;
listed objects by sort, never all houses). Mixed explicit objects and sorts delete in one undo step.

Mesh loading also identifies connected material faces, keeping listed-object ownership separate and joining duplicated vertices
by their shared edges (`ui/src/editor/materials.ts`). The separate `edge_dirt` road verge can therefore be selected without paint
metadata; Shift includes its other loaded matching regions. Its highlight owns its geometry and follows live height changes.
This material information is groundwork for later texture tools; clicking a house still selects the house as an object.
Esc or another tool cancels pending surface work and releases the highlight's memory.

The source and Save keep the metadata independently of build files and bind the manifest to their own kn5. An older track
needs one new build to obtain the painted-ground data; its existing object tools remain available. Ground texture edits use these
facts. The retained descriptions refer to the original build; current edits remain in the draft and recipe.
