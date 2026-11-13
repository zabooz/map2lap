# Editor

The Editor reads installed KN5 tracks and retains edits separately until Save. It does not rebuild from map data.
Start here for data ownership and synchronization, then read only the relevant topic:

| Task | Reference |
|---|---|
| Selection, movement, copies, smoothing, trees and walls | [editor-tools.md](editor-tools.md) |
| Library, model/material import, portable models and Groups | [editor-library.md](editor-library.md) |
| Ground selection, paint layers, UVs, caches and native export | [editor-ground.md](editor-ground.md) |
| Clock, seasons, weather, wind and temperatures | [editor-weather.md](editor-weather.md) |
| UI conventions and required checks | [ui/AGENTS.md](../ui/AGENTS.md) |
| KN5 shaders, collision and coordinates | [ac-rules.md](ac-rules.md) |

## Source map

`server.py` serves the committed `src/web` bundle and `/api/`. React/TypeScript source lives in `ui/`; three.js loads when
the Editor first opens. Camera and mesh state stay outside React. Paths below are relative to `ui/src/editor/`.

| Owner | Responsibility |
|---|---|
| `EditorScene.tsx`, `EditTools.tsx`, `types.ts` | Scene lifetime; tool/selection/dialog wiring; shared contracts |
| `scene/view.ts` | Scene coordination |
| `scene/trackTextures.ts`, `scene/trackObjects.ts` | Texture/material lifetime and paints; object ownership and visibility |
| `scene/selection.ts`, `scene/pointing.ts` | Pinned selection/highlights; live picking/hover |
| `scene/brush.ts`, `scene/ghost.ts`, `scene/mover.ts` | Strokes; pending copies/inserts; transform preview |
| `scene/navigation.ts`, `scene/roadMarkers.ts`, `scene/geometryPreview.ts` | Camera; road pins; temporary deformation |
| `tools/`, `library/`, `inspector/`, `state/` | Tool controls; assets/imports; properties; history/draft synchronization/Save |

Unit tests and component CSS stay beside their owners. `view-*.test.ts` covers integration without WebGL; browser workflows
and rendered-image checks live in `ui/e2e/`. Experimental texture-array code in `ui/tools/ground/` is outside production.

## Loading and lifetime

`app/trackview.py` scans offsets/materials/start points without loading the whole KN5. Mesh/image requests carry its
revision; changed or partially written files return HTTP 409. Meshes load nearest first, six concurrently, textures twelve.
Up to four browser workers prepare ray-search trees and material-face regions with the portable Rust/WASM kernel.
Preparation preserves triangle numbering/ownership, and a mesh counts as loaded only after attachment.

Track changes cancel queues, terminate old workers and release resources. Meshes remain loaded until that change;
camera movement does not evict distant geometry or resume loading around the new position. The configured memory limit
estimates RAM/GPU use, excluding some browser overhead, and prevents additional meshes/textures from loading.
`tools/editor_memory.py` explains track costs. Loaded ground, decks and water remain visible beyond their KN5 draw
distance to avoid overview holes; other objects keep their distances. This changes no exported draw distances.

Loading progress counts completed mesh/texture/selection-preparation tasks, not remaining time. The initial scan and Save
use indeterminate bars. A first opening prepares reusable ground-selection data. Toasts report loading, failures and
recovery actions; build errors stay in the status/log, dialog errors inside their dialog.

Transfers allow 30 seconds without headers or a nonempty body chunk; progress resets the timer. GET connection failures
retry at most twice; HTTP refusals and cancelled work never retry. The read-only texture POST times out without repetition.
`map2lapLoading()` in the browser console reports active transfers, not synchronous geometry stalls. During loading,
resource arrivals share at most ten redraws per second; camera/tool changes draw immediately and completion flushes.

## Draft, source and Save

| Data | Meaning |
|---|---|
| `data/map2lap_objects.json` | Object triangle ownership/parents and the separate TreeFX section |
| `out/edits/<track>.json` | Whole draft bound to one served source revision (`app/trackedits.py`) |
| `out/sources/<name>_<state>` | Retained pre-Save KN5/object list (`app/tracksource.py`), shared by saved copies |
| `data/map2lap.json`, `edits` | Recipe identifying source, applied operations and written KN5 |
| `data/map2lap_editor`, `data/map2lap_paints`, `data/map2lap_models` | Portable build facts and applied asset inputs |

Changes autosave the draft; writes are refused if another tab/build changed its base. Preview deletion shrinks triangles
without renumbering others. Undo/Redo belongs to this visit. Reopening restores the draft, or a valid saved recipe when
no draft exists. Build facts, source data and asset snapshots are distinct from disposable caches.

`app/trackcopy.py` stages a complete track in a hidden folder, applies the draft to the retained source, writes/validates
the replacement KN5, object list and recipe, then swaps it into place. Placement precedes height changes. Repeated Saves
never add a deformation twice. Save refuses while AC holds the KN5; unchanged data is reused where possible.

The first in-place Save on one disk retains the old file as a hardlink, undone on failure; Save as a new track needs a true
source copy because the original remains installed. `trackview.served` uses this source while the recipe matches, allowing
deletions to be restored after Save. Without it, the installed KN5 is shown; restoration of baked source deletions is limited.
Portable model/paint inputs have their own recovery rules in the linked topics. Missing required inputs must refuse Save.

Save, build and track deletion exclude each other under `trackcopy`/server locks. Updates also wait for Save; a restart
cannot interrupt it. An Edited track cannot be rebuilt in place: server, `generator.build` and `finish_obj` enforce this.
Build as copy creates a new track from map inputs without edits; OBJ-only analysis remains allowed. Unreferenced sources
are cleaned only for their own available AC folder. Delete track asks confirmation.

Current tools use installed tracks and retained editing data, not kept generator output. Build files (including logs) are
kept by default and managed in Settings > Editor > Build files. Old tracks lacking selection/object metadata need one
rebuild to gain it. UI appearance follows system light/dark until manually chosen; it does not change 3D lighting.
