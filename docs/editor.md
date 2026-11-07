# Editor

The page is React and TypeScript in `ui/`, built with Bun into the committed `src/web` files. `server.py` serves these
and the `/api/` endpoints. Bun is needed only for development; `bun run dev` proxies API calls to the running Map2Lap.
The Editor's three.js code loads on the first visit to its tab; camera and mesh data live outside React.

`app/trackview.py` scans an installed Map2Lap track's kn5 with `track.kn5.scan`: offsets, sizes, materials and start points,
without loading all meshes or textures into memory. The page requests their bytes separately, with the file's revision;
a changed or partially written file returns HTTP 409. The viewer loads nearby meshes first (six at a time, twelve textures), counts
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
(`trackcopy`'s lock, asked under the server's). A saved track is its own work from then on, under Edited in My tracks: a build of its
name is refused, by the server under the same lock and by `generator.build` and `finish_obj` for the tools too (`mytracks.saved_in_editor`;
OBJ parts alone stay allowed, they don't go into AC), and Build as copy makes a new track from the map, which has none
of the edits; sources no track of their AC folder names go at the next
start, and none while that folder isn't there. Planned editing tools will use the kept build files; viewing needs only the
installed track. The page keeps build files by default, including `build.log`; Settings → Editor → Build files can
turn that off or delete them. Existing saved preferences stay in effect.

## Tools and changes

Its buttons stand in the sidebar by groups (`ui/src/editor/ToolPanel.tsx`; portals, their state stays by the view in `EditTools.tsx`): File (the track, Save, Play, Discard all), General (Undo, Redo, Select, Camera), Terrain, Objects; one tool on at a time, Esc back to Select. Discard all asks before taking back every edit, including previously saved edits, as one undoable step; Save writes the restored track. The save state stands beside the loading progress. The active tool's options stand in a bar overlaid on the view (`ToolOptions.tsx`): with every tool its options reach Shift, Ctrl, Alt and Ctrl+Alt from left to right, lit while held, numbers by that key with the wheel.
Camera (K) goes along the route by Shift and the wheel or riding by itself (`Camera.tsx`, `ride.ts`), and back to the first view (Home).
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
With Mark road or Smooth on, two clicks on the road mark a band that follows it, by the road surface and its heights alone, not over a wall (`app/trackband.py`, `ui/src/editor/useBand.ts`; further clicks are pins, `pins.ts`), for the tools that work on a stretch: Smooth so far.
Elevation (H: the round brush of `useBrush.ts`, which a tool gives what a stroke does) and those tools make a height change on the server (`app/trackheights.py`, a raster the draft holds; while it is under way, what it changes so far comes back without being kept): it moves the ground of the kn5 and what lies along it, vertex by vertex; single
objects move whole, wires go from pole to pole; water stays, and one that reaches a deck or a railway is refused. Saving the draft names the meshes that moved; the view fetches those anew from the server, which hands them out as the
draft says, so the view and Save have one reckoning and the page none of its own. A new kind of mesh is sorted there too (`engine/tests/test_trackheights.py` stops on one that isn't).
Which triangles make up an object: `track/objectlist.py`, written by the build (parked cars, houses with their signs and doors,
street furniture, signs, rocks, fences, gas stations and leisure grounds; trees and bushes by their count of triangles). Every mesh
a build adds is entered there as listed, counted or part of the track: `tools/check.py` and `tools/measure.py` stop on one that isn't.
