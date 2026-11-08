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
asked for again. The camera moves as in a building game, level over the ground (`view.ts`), with no state kept between moves that
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

`app/trackinspect.py` reads one selected object's descriptions through the cached draft context, via `/inspect`, bound to
the served source revision. These descriptions stay out of `/index` and `/copies`. `/thumbnail` converts one source texture
to a browser-readable PNG at most 256 px wide/high and caches at most 32 encoded previews; revision validation still runs on
cache hits. Selection changes cancel detail requests and discard late results. Original build parameters describe the source;
placements and height changes remain separate. The preview of painted ground is its combined tile texture.

Its buttons stand in the sidebar by groups (`ui/src/editor/ToolPanel.tsx`; portals, their state stays by the view in `EditTools.tsx`): File (the track, Save, Play, Discard all), General (Undo, Redo, Select, Camera), Terrain, Objects; one tool on at a time, Esc back to Select. Discard all asks before taking back every edit, including previously saved edits, as one undoable step; Save writes the restored track. The save state stands beside the loading progress. The active tool's options stand in a bar overlaid on the view (`ToolOptions.tsx`): with every tool its options reach Shift, Ctrl, Alt and Ctrl+Alt from left to right, lit while held, numbers by that key with the wheel.
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
bind image content and physical repeat size. Importing that combination again reuses the existing material and name.
The layout leaves `library/objects/` for future model imports. The library is excluded from Git and both release formats;
the updater refuses an archive containing `Map2Lap/library`, so neither system's update step replaces user assets.

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
Import opens its own dialog; Apply changes the selected ground and closes the picker only after its preview succeeds.
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

`app/trackdetail.py` retains imported images as separately repeated full-resolution layers. One RGBA selection image per
edited tile assigns the original tile to A and up to three replacement materials to RGB. This is the four-slot limit of the
native `ksMultilayer_objsp` material, not a library limit. Reapplying a material to the same region replaces its old owner,
freeing that slot. Too many simultaneous replacements are refused before the draft is written. Ground colour images must
be opaque. Each layer retains independent X/Y repeat sizes; the same colour pixels at different sizes share their DDS.

Immutable layouts bind the source and ordered operations. First preparation resolves masks and publishes a small layout;
subsequent draft/index reads reuse that metadata. They do not composite colour tiles or encode DDS. The mask and shared
colour DDS endpoints encode missing cached files lazily under `cache/track-details`; cache hits bypass the encoder lock.
Prepared mask pixels are retained as a lossless PNG in disposable cache, avoiding repeated weight calculation after an
in-memory eviction or restart. A missing PNG is rebuilt from the retained operation masks. RGBA mask channels are independent
weights, not alpha-associated colour: each mip is filtered independently and its weights sum to 255. Masks use lossless
uncompressed RGBA8 DDS, avoiding BC3 colour/alpha quantization changing their brightness; photos remain BC1 DDS. A full
2048² mask including mips occupies about 22.4 MB instead of 5.6 MB for BC3. The descriptor, memory budget and Save's disk
estimate include the actual size. This preserves 12.5 cm mask resolution instead of silently downsampling road boundaries.
The renderer samples masks as linear data and colours as sRGB, blends the retained original tile with the repeating photos,
counts all images in loading progress and the memory limit, and releases unused images after Undo or replacement. Stale
downloads cannot overwrite a newer selection. Until a complete layout fits and loads, the previous appearance remains.
Reapplying the same immutable operation moves it to the end rather than creating duplicate ids. Apply can retry a failed
preview download even if the retained draft already contains that operation; success is reported only after the preview loads.

Save embeds those same mask/colour bytes, retains every original tile payload and writes the native layer material. Integer
tile origins are added to UVs so arbitrary repeat sizes remain aligned across tiles. Positions, normals, tangents, triangles
and physical surface prefixes stay unchanged. The source is retained for Undo/Discard, and the saved recipe/bundle carries
the operation masks and normalized colour snapshots. Even without the local source cache, the native material remains
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
`tilingFixR/G/B` and leaves `tilingFixA` off. Missing normal maps are filled with flat defaults. The owned include is
regenerated during Save and removed when no source/edited materials need it; unrelated effects remain. Without CSP the
track remains driveable with ordinary repetition. The browser and CSP use the same two-sample mixing rule, but CSP's
internal noise differs from the browser's deterministic field, so individual shifted patches need not occupy identical places.
The implementation adds texture samples; frame-rate cost is not inferred from unit tests.

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
