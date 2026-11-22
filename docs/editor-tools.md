# Editor tools

Start with [Editor data flow and Save](editor.md). Source owners below are relative to `src/` or `ui/src/editor/`.
The authoritative tool names, keys, sidebar groups, tooltips, help and selection rules are `tools/toolDefs.ts`; ToolPanel
and Help only show them. Road tools are in the sidebar's Road group; Elevation is under Terrain.

## Tool framework

Each tool hook returns a `ToolController` (`tools/toolHost.ts`): `click`, `wheel` with `takesWheel`, `key`, `toggleMode`
(Shift pressed and released alone), `altAction` (Alt alone), `activate`, `clear` and its `options` bar. The hook keeps its
state, requests and view marks; `useToolHost` is the only place that registers the view's click, pick and wheel callbacks
and the keyboard. A new tool needs its definition, its hook called in `EditTools.tsx` and its controller in `controllers`;
a tool that changes the draft also needs its server endpoint, calculation and draft data. Give it a case in
`scene/cursor.ts` when its pointer should differ from the default. Route every tool switch through `switchTool`; a tool
hook handles its own view marks but does not register another global click, pick, wheel or keyboard handler.

- Keys: `toolDefs.globalKey` comes first (Esc, Undo/Redo, Save, Delete/X, Home, tool keys); `controller.key` only gets the
  rest, such as the free kerb's Backspace. Fields keep their typing; a dialog keeps every key except Ctrl+S.
- Switching: `switchTool` runs only in events, never during a render. It calls the old tool's `clear()`, then the new
  tool's `activate({tool, picked})`. Taking up the tool that is on again restarts it. Every tool change, including menu and
  Library actions, goes through it, so a tool's state never outlives its use. View marks belong in effects keyed on the
  hook's `enabled`.
- Selection: the definition's rule decides what a pick means (`tools/useSelection.ts`). Select: the pinned selection of objects,
  surfaces, sections and whole sorts. Camera and Transform: Ctrl adds objects. Delete: a left pick goes at once, a section with
  it. Road tools: left picks are dropped, so clicks are road points; a right click still picks for the menu.
- A tool's own edits along a road (`tools/editRanges.ts`, Bank road's bankings): each range carries its mapped road IDs
  and its height along its line, so `rangeAt` picks one only on its level and within its ends, and `overlapping` compares
  ranges only on shared road IDs. `useEditRanges` draws them while the tool is on. A picked range counts as picked for
  the Editor's keys: `editorKey` gives X and Delete to `controller.remove` first (`controller.removable`), else to the shared
  selection, and X without anything picked still takes up Delete.
- Late answers: `Latest` (`tools/latest.ts`) numbers a tool's requests, and `clear()` drops them. Check the token after
  each awaited step before changing the draft, selection or status; a kerb or stitch answered after Esc or a tool change
  therefore adds nothing.
- Draft changes: `state/serverEdit.ts` keeps the changes before, asks the server against the kept draft, puts the answer and
  keeps it, all in one `TrackEdits` turn. `unkept` means the change was put, but saving it failed, so the draft may still
  hold it. Walls, tree spacing and car density use it. So does `tools/heightOperation.ts`, the replaceable height operation of
  Smooth road and Bend road: each adjustment replaces it in the same Undo step, and after a removal the next height starts a
  new step. Copy, Insert and Groups keep their own flows for ghosts and rejections. Texture paint waits for its textures
  inside the turn.

## AI line

AI line (L) overlays the installed driving line with speed colours, side limits and braking marks, and shows the route metre and all point data on hover.
It reads `GET /api/editor/<track>/ai-line` from the `ai/fast_lane.ai` of the last Build or Save and refreshes after Save, so an unsaved draft can differ from the displayed line.
Future edits can use route-metre ranges in the draft, following Bank road's `tools/editRanges.ts`, for `fastlane.regenerate` to apply on Save.

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

## Selecting a built road

Smooth road, Bend road, Stitch road and mapped Racing kerbs select and read roads through one query (`app/builtroad.py`). Map facts give the
connections and each road's ID; the build's faces decide where that road lies. A click's height picks the road whose own
deck face (by face owner ID) or graded ground lies there, so a flat deck lying on the road it crosses (Perth, no elevation
data) still selects correctly. Heights come from the selected road's own deck faces within 0.5 m, otherwise from the
graded ground, also under another road's bridge. Map bridge ranges are not consulted for heights: a skewed deck end reaches
past them. Each tile stores the bridge/tunnel ranges it reckoned for a whole way; tiles far from a structure can disagree
with the one that built it, so the graph takes each structure's range from the tile holding its middle
(`roadregion.merged_roads`). New road tools should select and sample through this query.

## Elevation and Smooth road

Elevation (H) creates a 2 m raster of millimetre height changes (`app/trackheights.py`). Ground moves vertex by vertex,
objects move whole, wires follow their poles and water stays fixed. Changes reaching decks or railways are refused.
The server supplies preview and saved mesh deformation; the browser does not implement a second height calculation.
The Elevation brush continues to refuse decks and railways.
New mesh kinds must be classified there (`engine/tests/test_trackheights.py`).

Bend road (J) marks A and B on one mapped road, with or without an existing bridge or crossing. The marked ends stay
fixed. A signed Height raises or lowers the middle with a smooth correction; zero removes that correction. This works
independently on each road level. The server checks mapped crossing clearances and refuses a bend that would reduce the
available road clearance. A junction on the selected road inside the correction is refused if its side road cannot follow;
a junction on another level stays fixed. The road's maximum added ramp slope starts at 15%.
On a selected railway bridge the same tool still uses the measured Gap above the road below. Its slope starts at 2%.
Shift + wheel changes Height or Gap by 0.1 m; Ctrl + wheel changes the slope limit by 0.5 percentage points.
The maximum can also be typed directly; the editor retains separate road and railway values while it stays open.
Marking an already corrected road again resumes its signed Height. Returning Height to zero removes the correction in
one Undo step.
With two or more bridge spans between A and B, the marked road gets one smooth central bend. It stores source vertex
offsets for the road, bridge parts and approaches in the draft, so Undo and Save use the same geometry.
Terrain beside and beneath a bridge span stays fixed; only terrain cells within the road width at an abutment join the
raised or lowered approach.
The build retains each road and bridge face's mapped road ID through material sorting and KN5 export. Bridge slabs,
girders, parapets and piers use the generating deck or pier's ID; the road skin uses its generating ribbon's ID.
Ground road markings, gutters and drains use the mapped road's ID as well. Under pointer shows that ID for the hit
triangle of a merged road or bridge mesh; it does not make the whole tile one selectable object.
The Editor moves only faces of the marked road, even where two carriageways share one tile mesh or a concrete member
extends beneath the other road. Tracks built before these IDs need rebuilding for Bend road.
Bend road checks railway and tunnel faces that remain in the draft; railway faces deleted in the Editor no longer
block a road correction or hold its terrain down. After A and B are marked, the server checks a nominal one-metre
correction along the selected road and reports blocking rail/tunnel parts with red crosses before Height is changed.
Guardrails retain source module face spans and candidate mapped road IDs in each tile's build facts. The module's tile and
row number identify its visible and doubled collision faces together. At a crossing, the correction moves a guardrail
only when its candidate IDs belong to the selected road side; a median may have both carriageway IDs. A crossed road's
centreline alone cannot claim a guardrail because its direction differs. Ambiguous modules stop the correction rather
than moving a barrier onto the wrong level. Modules planted in the retained railway ballast stay with the railway even
when a parallel road's centreline is nearby. Older tracks derive this index from their retained rows and road features.

Bank road (U) banks a marked stretch of a road (`app/roadbank.py`, `tools/useBank.tsx`). A and B, clicked as for Bend road,
are the fully banked stretch; the transitions lie before A and after B, along the same mapped road (`roadbank.walk` on the
map graph). Ctrl + wheel sets the banking, 0 to 20 % by 0.5 percentage points; Shift alone switches the high edge, left or
right as A runs to B (in one clear curve the outside edge starts high, else the left); Alt + wheel sets how steeply an edge
may ramp against the centreline along a transition, 0.2 to 3 % by 0.1, starting at 0.5 % (a conservative road-design value,
not a worldwide limit). Purple strips show the transitions, estimated live in the page while the wheel turns, red where
the road there is too short; the server's check on apply is the answer.
The target cross slope is absolute: the server reads the road's cross slope now (five points across, fitted, smoothed
along) and the change at lateral distance d is d × w(s) × (side × banking − now), w 1 from A to B and smoothstep to 0 over
each transition. The centreline keeps its height, and a varying slope the build left (its own banked curves) becomes the
banking everywhere from A to B. Example: 8 m wide, level, 8 % at 0.5 %: the edges move ±32 cm and each transition takes
96 m. Each transition is the shortest whose resulting edges stay within the limit, except where the road already ramped
steeper by itself. A transition goes on over a junction along the mapped piece turning least (under 45°); where it does
not fit (the road's end, a junction with nothing going on straight, or a tunnel ahead) the answer says how much banking
fits there. A road joining the banked stretch or its transitions (a driveway, a fork, a lay-by) is taken along: its
mouth on the road banks with it, beside the road it fades out along it like the ground.
Marking changes nothing yet: the banking starts at 0 % and only its first change applies. 0 % is a value, the stretch
level across; X, Delete or Restore original delete a banking, the road as it was built. While the tool is on, every
banking is highlighted; a click on one picks it without changing it, and then Ctrl, Shift, Alt and dragging its A or B
change it, each as one Undo step. A new marking whose stretch or transitions meet another banking on the same mapped road
is refused with a warning; another road or level never overlaps.
The ground road's part is an ordinary height raster, so terrain, kerbs, guardrails, sidewalks and objects standing on it
move with it; beside the road it holds the edge's height and fades out over max(6 m, 15 × edge lift), and stops at another
mapped road on the same level and under the marked road's bridges. The road's own continuation beyond A and B is no
other road: the transitions lie on it. Source vertex offsets add the marked deck, tilted whole, and take the raster back
from pieces on another level: a piece whose lowest vertex in reach lies more than 0.5 m above the ground road (a bridge
over it, with its parapets). Racing kerbs, Stitch surfaces and their cut remains on the marked road follow its field
(`trackheights._kerb_bends`). Refused besides: a tunnel in A–B, a crossing inside A–B whose
clearance would shrink below the requirement at the relevant edge (a marked bridge's low edge, a marked road's high edge
under a bridge), and a lift over 5 cm where the marked edge lies within 1 m of another carriageway running beside it. Crossings under the
transitions are not checked yet.

Select on a railway bridge selects its complete connected mapped bridge span. Delete removes its visible rails, sleepers,
ballast, concrete and corresponding collision triangles together; a parallel railway bridge remains independent. The
draft's `surfaces` face ranges and Save apply that removal, and Undo restores it.
An ordinary rail section beside a bridge can be selected and deleted separately, including rails, sleepers, ballast and
collision. Select on a sidewalk takes its connected section inside the source tile, with slab, curb, collision and objects
whose feet stand on its slab (street furniture, signs, poles and trees). Delete and Undo handle these together.
Guardrail sections can be selected and deleted with their matching collision faces in the same way.

Smooth road (R) marks a road region with two terminal points and optional branches (`app/roadregion.py`, `app/roadnet.py`,
`tools/useBand.tsx`). Retained map topology and actual road paint determine the region, including levels and hairpins;
the main driving route does not constrain it. Bridge and tunnel ends join their mapped approaches even when structure/layer
changes there; interior crossings stay separate. Build facts retain the actual partial structure ranges of Overture roads;
older facts with only whole-way tags need rebuilding for a structure that occupied just part of a road. Clicks retain their
surface elevation to choose the built level ([Selecting a built road](#selecting-a-built-road)); the selected road's own
deck faces replace the terrain wherever they cover a lattice cell. Green marks the selected road, faint green the terrain
transition. Once the points are marked, red shows where the current surface is above its fully smoothed profile (smoothing
would lower it), blue where it is below (smoothing would raise it). The coloured masks come from a read-only 100% solve,
clipped to the selected road ground and its own deck faces; they do not write a draft change. Their opacity follows the
relative height difference within the marked region.
After each saved height edit, the colours are recalculated from the current road surface; an already smoothed stretch
returns to green where no further correction is needed.
Across the road, smoothing keeps the slant the road was built with plus the draft's bankings (Bank road,
`trackedits.banked`); a tilt left by a brush or another height edit is smoothed away.

Smooth road has Road and Free modes (Shift switches). Road follows each selected mapped road's own ground. Free takes a
2–40 m wide strip around the marked road lines, including ground assigned to another mapped road inside that strip; beyond
the strip, the other road keeps its ground. Free starts at the mapped width, or 8 m when none is available. Alt + wheel
changes its width by 0.5 m. Both modes keep the same pins, strength, terrain transition and replaceable draft height edit
(`app/roadnet.py`, `app/roadregion.py`, `tools/useBand.tsx`).

Bridges and tunnel floors share the same smoothing solve as their approaches (`app/roadsurfaces.py`). Two points can span a
short structure or just one transition on a longer one. Source collision triangles supply the floor height, including banking;
the material paint alone cannot describe a deck. Terrain under bridges and above tunnels retains its height. Connected source
pieces follow the chosen floor, with foundations of tall vertical supports held fixed. A separate crossing deck stays fixed.
The operation retains explicit source vertex offsets and shading gradients beside its terrain raster; preview, Undo/Redo and
Save replay them against the same source indices. Ordinary terrain-brush operations gain no permission to move decks.
Crossing floor gaps retain the generator's fine-elevation headroom plus ordinary slab/girder allowance; a tighter existing
crossing may improve but must not lose more clearance. This guards sampled road floors, not every overhanging structure.

Strength starts at zero. The road-region control uses a gentler input curve than the cubic smoothing window so small
percentages have a visible effect; it still removes short waves before broad hills. Percentage is not a literal share of
the height change: a linear share left a cross-carriageway step at intermediate strength on Rechberg. Changes to strength,
transition or points replace one active height operation after debounce;
returning to zero removes it. `trackedits.moved_without` excludes that operation while recomputing, so adjustments never
compound it. Esc cancels pending work, Undo closes the active region, and late answers cannot re-enter the draft
(`tools/smoothing.ts`). Mark road starts a new region.

In Road mode, each arm follows its own road surface (`trackband._own_road`, `roadnet.owns`); neighbouring roads on other levels stay
separate. Shared junction planes join selected branches, terminal points stay fixed, and all arms contribute to one raster.
The transition stops at unselected roads and widens for large height changes under the side-slope rule. A road joining the
marked one is taken along, as in Bank road (`roadnet.joined_roads`): the marked road runs on through the junction instead of
holding it, the side road takes the change at its mouth and fades out along its own surface, up to its next junction, and
never over a step steeper than a road is across (at Rechberg's fork the lower road stays clear of the upper road beside it).
A bridge or tunnel joining keeps its junction held. This holds in Road and Free mode. The solver rejects
new joins exceeding its grade limit unless improving an already steeper bump, forks requiring an internal wall, and long
gaps without an editable road surface. Limits: 20 points, 3 km of road, 64 painted tiles and the height-raster point limit.
Routing/masks cache independently of draft revisions. `app/trackband.py` retains the legacy linear solver/API and its tests.

## Stitch road

Stitch road (N) rebuilds one unbranched mapped carriageway between clicks A and B on ground, a bridge deck or a tunnel
floor (`app/trackstitch.py`, `tools/useStitch.tsx`). The preview shows its proposed width, height change, deck rows and
continued road markings. Auto width uses the ground road's mapped width at A and B where available; Shift + wheel or Width
sets a constant 2–40 m width. Apply adds one draft operation; Ctrl+Z undoes it. A range is 2 m to 1 km long. If it meets an
existing stitch on the same road, the proposal grows to their outer ends and Apply replaces the old stitch.

The new `1ROAD_` surface keeps the original heights across A and B, follows the road's own deck where it covers a row and
blends the intervening rows across the full width. Source road, asphalt and marking triangles inside its strip are cut and
their outside parts retained; the road beneath a bridge and terrain above a tunnel stay. Markings seen just outside the
ends continue across the new surface. The draft stores the stitch rows, heights and markings; preview and Save regenerate
its meshes from the retained source. This is a prototype: inspect the proposed cut and drive the saved result in AC before
relying on a difficult crossing.

## Racing kerbs

Racing kerb (B) takes two road clicks as the start and end of one mapped, unbranched road stretch. The first click's
position relative to the mapped centreline chooses the left or right edge in that click order. A centreline click defaults
to the right edge. The selected mapped centreline uses the road build's bounded quadratic spline before
one-metre sampling. Junctions, feature joins and selected ends stay fixed; the kerb samples source height at its edge
(`app/builtroad.py`, `app/trackkerbs.py`). A selected kerb can change width (0.2–2 m), physical height (0–30 cm) and
flat, rounded or ribbed profile. To place a kerb on the opposite edge, mark a new range there; each side samples its own road
height. The selected kerb's actual meshes are tinted amber. Clicking
any part of a kerb with Select highlights its full range; the Select bar's Racing kerb (B) action opens that range's
settings. Selection > Options has width, height and profile for the picked range.
Shift switches the Kerb tool between Road and Free. Free clicks draw a kerb centred on the clicked line anywhere a driving
surface can be sampled; it appears after the second point and each further click extends the same draft kerb. Backspace
removes the last point. The source surface nearest each click's height supplies its level, so a clicked deck can be chosen
over the road below. A free kerb needs 2–200 points and a length of 1 m to 3 km (`app/trackkerbs.py`, `tools/useKerbs.tsx`).
Its width, height, profile, deletion, Undo and Save use the same kerb edit as Road mode.

Road-mode kerbs follow the mapped road's rounded spline independently of sidewalks, including sidewalks later removed in the
Editor. Tight inside bends use round parallel edges with overlapping loops cut before meshing. Source heights are
sampled at the inner edge.
X, Delete or the Select bar's Delete action removes the picked range; Undo restores it. Ctrl + wheel changes width,
Alt + wheel changes height and Ctrl + Alt + wheel changes profile in the Kerb tool. Undo/Redo, the draft and Save keep
independent ranges.

The red-white strip is a visible `1KERB_racing_…` KN5 collision mesh with the ordinary AC KERB surface, so its height is
physical even without CSP. In Road mode it overlaps the mapped asphalt edge by 15 cm to join it; that small overlap can fail on a
road whose mapped width exceeds its actual asphalt. Road-mode heights come from the shared built-road query: the selected road's
own deck triangles with the build's 1 cm asphalt-skin lift, else the graded road ground. A kerb edge up to 0.5 m outside a
deck uses its nearest edge height, because mapped widths and deck triangulation can differ by a few decimetres. A step
steeper than a road takes (beyond 0.5 m the ground under a bridge, or an edge running onto the other carriageway at a
narrow divided end) refuses the range and names its place. Tunnels are refused until the Editor can sample their floor
edge reliably.
A 2 m Road-mode kerb can extend beyond the supported shoulder on narrow or steep roads. The road-edge decal under the kerb remains;
the raised strip renders over it. The mesh and DDS texture are regenerated from the retained source on each Save, and
remain below AC's 65,535 vertices per mesh. Elevation follows the kerb at each vertex. Bend road follows the kerb on its
mapped road, whether the kerb was placed before or after the bend; a kerb on another road at the same crossing stays put.
Existing saved kerbs retain their
stored centreline and height; marking them again applies the current spline and bridge-height sampling.

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
