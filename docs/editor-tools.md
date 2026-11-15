# Editor tools

Start with [Editor data flow and Save](editor.md). Source owners below are relative to `src/` or `ui/src/editor/`.
The authoritative tool names and keys are `tools/ToolPanel.tsx`; help and modifiers are in `tools/Help.tsx`.

## Selection and Inspector

The Inspector has Selection, Properties and Details tabs. Selection stays pinned while Under pointer follows the mouse.
Selection shows Appearance then Options; Properties contains time/date, conditions and vegetation; Details holds geometry,
track statistics and edit notes. Errors outside dialogs use the page's toast stack (`editorToasts.ts`); dialogs own their errors.
The panel can be resized or hidden without covering the remaining 3D viewport.

Select (V) clicks one surface/object or drags a rectangle across loaded object bounds. Ctrl adds/removes objects;
Shift selects a matching sort or all prepared regions of a ground material. Mixed objects and sorts delete in one Undo step.
Right-click Edit uses the active ground selection; without one it selects the hit surface. Ground selection and its limits:
[editor-ground.md](editor-ground.md).

`app/trackinspect.py` reads details from the cached draft context, bound to the served source revision. Object descriptions
stay out of `/index` and `/copies`. `/thumbnail` returns bounded cached PNGs and validates revisions even on cache hits.
Selection changes cancel requests and discard late results. Appearance resolves the retained texture at the clicked point;
unrelated loading must not remount the controls. Build parameters describe the source, with current edits kept separately.

## Delete, Transform and Copy

Delete (X) has One and Brush modes; Shift pressed and released alone toggles them. A brush stroke tests the line between
pointer samples so fast drags leave no gaps. It targets top-level objects at their current placements, including imported
models and TreeFX feet; children go with their parent and wires with their poles. The preview removes them immediately;
one completed stroke is one Undo step (`scene/brush.ts`, `tools/deleteBrush.ts`).

Transform (T) moves, turns, raises and scales selected objects. A selected group stays selected while dragged; the drag is
one Undo step. `app/placement.py` stores one pose per object and `app/trackplace.py` applies it before height changes.
Dragging samples terrain at each pivot and preserves its clearance, without tilting to the slope. `/move` compensates for
the old-to-new terrain deformation because Save applies height edits afterwards. Outside loaded terrain the height stays.
Pending drags keep their preview until canonical data arrives; failure restores the retained meshes.

Copy (C) freezes a template; each click places another instance until Esc. Once ready, the original is deselected, so X
switches to Delete without deleting it. Right-clicking elsewhere does not replace the template; Choose another does.
Turn/Raise/Size apply to each copy, with its foot on the clicked ground. `app/trackcopies.py` retains source member ids and
poses under independent `copy_<id>#<member>` ids. Houses carry children/collision; copied poles have no wires.

Copy and Insert show a solid local instance at the click's frozen pose immediately. Accepted clicks complete in order,
including after Esc, and remain visible until their canonical instances draw. Refusal removes the preview and its history
entry and reports an error. Save, Undo and Redo wait for accepted clicks. Shared preview resources live until the last
pending instance releases them (`scene/ghost.ts`).

Copies have a geometry revision independent of unrelated draft edits. `/copies` supplies only generated meshes and object
lists; its loader is cancellable and retries obsolete manifests. With imported models, bindings and copy layout commit
together from the full index. Models own no numbered scene meshes, so copies cannot displace them by reusing a number.
Unchanged copies and original meshes stay loaded. Save bundles copies by tile, kind, material and flags within KN5 limits.
Imported model placement and Groups use [editor-library.md](editor-library.md).

## Elevation and Smooth road

Elevation (H) creates a 2 m raster of millimetre height changes (`app/trackheights.py`). Ground moves vertex by vertex,
objects move whole, wires follow their poles and water stays fixed. Changes reaching decks or railways are refused.
The server supplies preview and saved mesh deformation; the browser does not implement a second height calculation.
The Elevation brush continues to refuse decks and railways.
New mesh kinds must be classified there (`engine/tests/test_trackheights.py`).

Smooth road (R) marks a road region with two terminal points and optional branches (`app/roadregion.py`, `app/roadnet.py`,
`tools/useBand.ts`). Retained map topology and actual road paint determine the region, including levels and hairpins;
the main driving route does not constrain it. Bridge and tunnel ends join their mapped approaches even when structure/layer
changes there; interior crossings stay separate. Build facts retain the actual partial structure ranges of Overture roads;
older facts with only whole-way tags need rebuilding for a structure that occupied just part of a road. Clicks retain their
surface elevation to choose between overlapping deck floors. Orange marks selected road, faint orange the terrain transition.

Bridges and tunnel floors share the same smoothing solve as their approaches (`app/roadsurfaces.py`). Two points can span a
short structure or just one transition on a longer one. Source collision triangles supply the floor height, including banking;
the material paint alone cannot describe a deck. Terrain under bridges and above tunnels retains its height. Connected source
pieces follow the chosen floor, with foundations of tall vertical supports held fixed. A separate crossing deck stays fixed.
The operation retains explicit source vertex offsets and shading gradients beside its terrain raster; preview, Undo/Redo and
Save replay them against the same source indices. Ordinary terrain-brush operations gain no permission to move decks.
Crossing floor gaps retain the generator's fine-elevation headroom plus ordinary slab/girder allowance; a tighter existing
crossing may improve but must not lose more clearance. This guards sampled road floors, not every overhanging structure.

Strength starts at zero. Changes to strength, transition or points replace one active height operation after debounce;
returning to zero removes it. `trackedits.moved_without` excludes that operation while recomputing, so adjustments never
compound it. Esc cancels pending work, Undo closes the active region, and late answers cannot re-enter the draft
(`tools/smoothing.ts`). Mark road starts a new region.

Each arm follows its own road surface (`trackband._own_road`, `roadnet.owns`); neighbouring roads on other levels stay
separate. Shared junction planes join selected branches, terminal points stay fixed, and all arms contribute to one raster.
The transition stops at unselected roads and widens for large height changes under the side-slope rule. The solver rejects
new joins exceeding its grade limit unless improving an already steeper bump, forks requiring an internal wall, and long
gaps without an editable road surface. Limits: 20 points, 3 km of road, 64 painted tiles and the height-raster point limit.
Routing/masks cache independently of draft revisions. `app/trackband.py` retains the legacy linear solver/API and its tests.

## Tree spacing

Build-time minimum spacing permanently removes generated tree placements before the track's source lists are saved
([build options](architecture.md#terrain-and-scenery-build-options)). The Editor's reversible layer below starts from
that built subset: resetting it cannot restore trees the build never stored.

Properties > Scenery > Trees applies reversible 0–100 m trunk spacing, excluding bushes. Generated, copied and imported
trees qualify at their current positions. The heading shows the current tree count, with `(selected)` when a selection
contains trees. Adjusting the slider uses those trees, otherwise all trees; a mixed selection affects only its trees.
Changing scope replaces the previous scope. The slider applies on release. A running toast covers calculation and
persistence, then reports the hidden count. Selected ids hidden by spacing stay adjustable until selection is cleared.

The draft/recipe's `tree_spacing` stores distance, target ids (null means all) and hidden ids, separately from manual
`deleted` and `object_sorts`. Zero restores only spacing-hidden trees. Undo, Save, copies and reopen retain the layer and
selection, including hidden targets. Restoration requires the retained editor source, like ordinary deletions.
Moving or adding trees does not silently resample; adjusting the setting recomputes it.

`app/treespacing.py` orders ids by stable hash. Any earlier neighbour within the distance hides a tree, even if that
neighbour is hidden too. Increasing distance therefore produces nested subsets; greedy packing would make trees reappear.
The spatial index avoids all-pairs arrays. This deliberately need not produce a maximally packed distribution.

## Parked car density

Properties > Scenery > Cars retains 0–100% of editable parked cars, rounded down to whole cars. The count and automatic
selection scope follow Trees: selected cars, otherwise all cars. Other selected objects and parking geometry stay intact.
Only listed generated cars and their copies qualify; a build with cars disabled and older unlisted car meshes cannot gain
editable cars through this control. Imported library models are independent placements.

`app/cardensity.py` orders ids by stable hash, so reducing the percentage produces nested subsets. The draft/recipe's
`car_density` records percentage, target ids and hidden ids independently of manual deletion. Preview, Undo/Redo,
Discard, Save, copies and reopening retain the layer. Returning to 100% restores density-hidden cars from the retained
source; manual deletions stay. Moving/adding cars does not silently resample. Both controls use `SceneryControls.tsx`.

## Generated walls

Retaining walls and parapets have separate object ownership through CDAE remapping, material splits and reversed KN5
faces. Older tracks without that ownership require rebuilding. Transform offers library colour/repeat and a cap offset
(`app/trackwalls.py`). Both feet stay fixed; a top cannot approach either foot within 1 cm. Bounds use all actual source
pieces, including mesh splits. Overlapping tile pieces receive the same edit.

Translation/rotation are unavailable because a wall meets a fixed terrain cut or road edge. Reset restores built geometry
and material. Edits participate in draft, Undo and recipe; only edited walls leave shared meshes. Retained materials travel
with saved tracks. Masonry covers the entire cap, including a retaining wall's broad back strip.

## TreeFX

Generated trees have no KN5 triangles. The object list's `treefx` section retains model, pose and never-reused
`trees#<number>` ids. `/treefx` resolves source plus draft; models/images come from the track's `extension/trees`.
Recognized Map2Lap models use canonical summer data in the Editor, so a previous winter Play cannot leave invisible leaves.
Unknown custom files remain untouched. `app/tracktrees.py` applies placement before height changes and writes the section
and `trees.txt` on Save. Model files remain available for restoration; copies retain them.

`scene/treeFx.ts` instances each model per 256 m cell, using its distance LODs and retaining the coarsest to 3600 m in the
Editor. Hidden trees keep zero-sized slots; moves within a cell update slots, crossing cells rebuilds only affected batches.
Picking respects leaf alpha. Draft replies send changed trees only; older replies cannot overwrite a pending move.
Library trees retain model bindings but use this same TreeFX renderer/export path; see [editor-library.md](editor-library.md).
