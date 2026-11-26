# Side margin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An Editor tool "Side margin" (M) that overrides the automatic `DANGER_n` hints per side and per stretch,
stored as `edits.aiMargins` and applied on every path that writes `data/ai_hints.ini`, without touching `fast_lane.ai`.

**Architecture:** Margins are two directed route anchors plus `left`/`right` (`null` = Auto). The line calculation
stores the route metre of every lane sample in `data/map2lap_ai.json`, bound to the lane checksum. One pure merge in
Python turns automatic sections plus placed margins into the INI; the Editor preview calls the same merge through an
endpoint. "INI current" (bytes equal the expected INI) and "margins placeable" (`unplaced`) are separate statements.

**Tech Stack:** Python 3.14 + numpy (`src/track`, `src/app`), unittest via `tools/check.py`; React/TypeScript + three.js
in `ui/`, `bun test`, Playwright (Chrome).

**Spec:** `docs/superpowers/specs/2026-11-26-ai-side-margin-design.md` (commit 1b2603f).

## Global Constraints

- TDD: each test written and run failing before the code (AGENTS.md).
- `fast_lane.ai` bytes never change because of a margin; margins are outside `ailinestate.fingerprint` and `_record`.
- Values: `null` (Auto) or a number in [0, 1] m, a multiple of 0.05 (tolerance 1e-6); at least one side a number.
- INI: `DANGER_0…` consecutive, `LEFT`/`RIGHT` with two decimals, START/END with nine decimals, no section wraps
  (split at 0 on a Circuit), sections with both sides 0 are dropped.
- Same-side overlap: the later margin in recipe order is rejected; left/right overlap is allowed.
- No INI is replaced while AC runs (`route_race.ac_running()`); the status then reports `stale`.
- Python: `.venv/bin/python tools/check.py <test file>` on Linux (`.venv\Scripts\python.exe` on Windows).
- UI: edit `ui/`, `bun run check`, `bun run build`, commit `src/web` with it. Browser tests in Chrome only.
- Before touching `src/` or `engine/`: no Map2Lap Build/Worker process running (AGENTS.md "Build safety").
- Comments say the rule and its reason; short functions; docstrings say "Pure." where true.

## Review Focus

1. A stretch of zero length (A and B on the same metre) must be rejected with "Empty side margin", not export a
   zero-length section. → Task 1, `test_empty_stretch_is_rejected`.
2. A Circuit lane whose route metres wrap inside the samples (lane starts at the timing line, route metre 0 elsewhere)
   must place a margin at the right samples. → Task 1, `test_circuit_lane_with_wrapping_route_metres`.
3. On a Route, a margin reaching beyond the lane's first or last sample (grid, runout) is clipped to the lane; one
   entirely outside is rejected. → Task 1, `test_route_margin_is_clipped_to_the_lane`.
4. A line marked pending without new bytes (`mark_outdated`) keeps its metres, so margins still apply on the old lane.
   → Task 2, `test_outdated_record_keeps_metres_of_unchanged_lane`.
5. Recalculate with only stale hints while AC runs answers "deferred" and leaves the INI untouched.
   → Task 4, `test_stale_hints_recalculate_defers_while_ac_runs`.

---

### Task 1: Margin schema, placement and merge (pure)

**Files:**
- Create: `src/track/aimargins.py`
- Modify: `src/track/aicorrections.py` (extract the anchor check of `problem` into `anchor_problem`)
- Modify: `src/track/aihints.py` (add `merge`, `Hints`, `render`; `contents` stays for callers until Task 2)
- Test: `engine/tests/test_aimargins.py`

**Interfaces:**
- Produces:
  - `aicorrections.anchor_problem(anchor: dict) -> str | None` (the existing anchor checks, unchanged messages).
  - `aimargins.recipe(folder: Path) -> list[dict]`: `edits.aiMargins` of `data/map2lap.json`, `[]` when missing.
  - `aimargins.problem(items) -> str | None`: list, unique non-empty `id`, `start`/`end` pass `anchor_problem`,
    `left`/`right` per Global Constraints. Messages: `"Invalid side margin"`, `"Invalid side margin value"`.
  - `aimargins.place(items, route: aicorrections.Route, metres: np.ndarray, stations: np.ndarray, circuit: bool)
    -> tuple[list[Span], dict[str, str]]`, `Span = NamedTuple(id: str, start: float, end: float, left: float | None,
    right: float | None)` with `start`/`end` as INI fractions (`start > end` only for a Circuit wrap, split later).
    `metres`: route metre per lane sample; `stations`: 3D cumulative lane distance per sample, length+1 entries on a
    Circuit (closing chord), as `aihints.sections` computes them.
  - `aihints.merge(auto: list[tuple[float, float, float]], spans: list[Span]) -> list[tuple[float, float, float, float]]`
    Pure: `(start, end, left, right)`, split at every change and at 0, both-zero sections dropped.
  - `aihints.Hints = NamedTuple(data: bytes, rejected: dict[str, str], unplaced: str | None, spans: list[Span])`
  - `aihints.render(lane: Path, circuit: bool, margins: list, placement: tuple[Route, np.ndarray] | None,
    unplaced: str | None) -> Hints`: reads the lane, automatic `sections`, places and merges; with `placement=None`
    and margins present it writes the automatic INI and returns `unplaced` as given.

- [ ] **Step 1: Write the failing test** `test_right_margin_over_two_automatic_widths_keeps_left_automatic` in
  `engine/tests/test_aimargins.py`. Straight Route lane 300 m along x, widths 6.6 m for x < 150 and 7.0 m after
  (automatic 0.5 and 0.75), route = the same polyline, metres = x. One margin `start` 100 m, `end` 200 m,
  `left: None`, `right: 1.0`. Parse the rendered INI with `ConfigParser`:
  ```python
  assert sections == [[0, 1/3, .5, .5], [1/3, .5, .5, 1.], [.5, 2/3, .75, 1.], [2/3, 1, .75, .75]]
  ```
  (each START/END compared with `assertAlmostEqual(places=6)`; names `DANGER_0..3`).
- [ ] **Step 2: Run it, expect FAIL** — `.venv/bin/python tools/check.py test_aimargins` → `ModuleNotFoundError: aimargins`.
- [ ] **Step 3: Implement** `anchor_problem`, `aimargins.recipe/problem/place`, `aihints.merge/Hints/render`.
  Placement: resolve both anchors with `route.resolve` (a `ValueError` becomes the rejection reason); map route metre
  → lane station by `np.interp` over the samples' route metres, unwrapped on a Circuit by adding `route.length` where
  they decrease; station / lane length = fraction. Same-side overlap check on route metres in recipe order.
- [ ] **Step 4: Add the remaining tests, each run failing first where it adds behaviour:**
  - `test_explicit_zero_differs_from_auto`: automatic 0.5 both sides, margin `left: 0.0, right: None` →
    a section with `LEFT=0.00`, `RIGHT=0.50`; the same margin with `left: None, right: None` fails `problem`.
  - `test_without_margins_the_ini_is_the_automatic_bytes`: `render(..., margins=[])` equals the bytes the old
    `contents` wrote for the same lane.
  - `test_circuit_margin_across_start_finish_splits_at_zero`: 400 m square circuit, margin 380 m → 20 m:
    two sections `[0, .05, …]` and `[.95, 1, …]`, consecutive numbering.
  - `test_same_side_overlap_is_rejected_and_left_right_overlap_is_not`: two right margins overlapping → second id in
    `rejected` with `"Overlaps side margin at route metre"`; a left and a right margin overlapping → both applied.
  - `test_unresolved_anchor_is_rejected_and_others_apply`: one anchor 20 m off the route → its id in `rejected` with
    `"Unresolved route anchor"`, the other margin exported.
  - Review Focus 1–3 tests named above.
- [ ] **Step 5: Run** `.venv/bin/python tools/check.py test_aimargins test_aihints` → all PASS.
- [ ] **Step 6: Commit** `git add src/track/aimargins.py src/track/aicorrections.py src/track/aihints.py engine/tests/test_aimargins.py`
  `git commit -m "Place side margins on the AI line and merge them into the DANGER hints"`

### Task 2: Route metres per lane sample, and every INI write through the recipe

**Files:**
- Modify: `src/track/fastlane.py` (`calculate` returns metres; `regenerate` passes them)
- Modify: `src/track/ailinestate.py` (`record_ready`, `publish`, `mark_outdated`, `carry`; new `lane_metres`, `hints`)
- Modify: `src/app/ailanejobs.py` (`_worker` result carries `metres`; `_calculate` passes them to `publish`)
- Modify: `src/track/route_race.py` (`remove_race_layout` uses `ailinestate.sync_hints`)
- Test: `engine/tests/test_aimargins.py`, `engine/tests/test_fastlane.py`

**Interfaces:**
- Consumes: Task 1 `aimargins.recipe`, `aihints.render`, `Hints`.
- Produces:
  - `fastlane.calculate(...) -> tuple[dict, np.ndarray]` (skipped, metres; one metre per written sample).
  - `ailinestate.record_ready(folder, inputs, skipped=None, *, circuit=False, metres=None)`
  - `ailinestate.publish(folder, inputs, candidate, skipped=None, *, circuit=False, metres=None)`: the INI is rendered
    from the **candidate** lane, the **candidate's** metres and the installed folder's recipe and route.
  - Record field `metres: list[float]` (rounded to 0.01) next to `lane`.
  - `ailinestate.lane_metres(folder, lane: Path) -> np.ndarray | None`: from the raw record (not `_record`, which
    rejects on changed `aiCorrections`) when `record["lane"] == checksum(lane)` and the count equals the lane samples.
  - `ailinestate.hints(folder, circuit, *, lane=None, metres=None) -> aihints.Hints`: `lane` defaults to the installed
    one; `metres` defaults to `lane_metres`. `unplaced` when margins exist and metres are missing: `"recalculate"` when
    the record's checksum matches the lane or there is no ready record, `"manual"` when a ready record names other bytes.
  - `ailinestate.sync_hints(folder, circuit) -> aihints.Hints`: installs `hints(...).data`; replaces `aihints.sync`
    for all callers (`carry`, `route_race.remove_race_layout`, `ailanejobs.race`).
  - `ailinestate.hints_state(folder, circuit) -> dict`: `{"state": "current" | "stale", "unplaced": …, "rejected": …}`;
    `current` when the installed INI bytes equal `hints(...).data` (missing INI and empty expected data count as equal).

- [ ] **Step 1: Write the failing test** `test_calculation_returns_one_route_metre_per_written_sample` in
  `engine/tests/test_fastlane.py`, next to `test_new_build_and_editor_recalculation_replace_passing_hints`: for the
  existing fixture, with no corrections and with one move, `len(metres) == len(read_lane(lane)[0])`, metres finite.
- [ ] **Step 2: Run, expect FAIL** (calculate returns only `skipped`).
- [ ] **Step 3: Implement** the `calculate`/`regenerate`/`_worker`/`_calculate` changes and the record field.
- [ ] **Step 4: Write the failing test** `test_publish_uses_candidate_metres_not_the_installed_record`
  (Test 8 of the spec): an installed lane with metres `x` and a candidate with the **same sample count** but metres
  `x + 40`; a right margin 100–200 m. After `publish(..., metres=candidate_metres)` the INI's right section starts at
  the fraction of route metre 100 under the candidate's metres (60 m along the lane), not at 100 m.
- [ ] **Step 5: Write the failing test** `test_save_carry_renders_after_the_record_is_staged`: `carry(source, model)`
  with the same old/new pair: the staged INI uses the record that `carry` copied into the staged folder. Reorder
  `carry`: copy lane, then the record (for `ready`/`manual`), then `sync_hints(model.parent, circuit)`; while
  `route_race.ac_running()` copy the source INI unchanged instead.
- [ ] **Step 6: Implement** `lane_metres`, `hints`, `sync_hints`, `hints_state`; `publish` renders from candidate
  plus metres; `mark_outdated` keeps `lane` and `metres` when the installed lane still matches them
  (Review Focus 4 test); replace every `aihints.sync`/`contents` caller. Delete `aihints.sync`/`contents` once unused.
- [ ] **Step 7: Add tests:**
  - `test_margins_leave_fingerprint_and_lane_bytes_unchanged`: adding a margin to the recipe keeps
    `ailinestate.inspect(...)["status"] == "ready"` and `checksum(fast_lane.ai)` equal.
  - `test_legacy_record_without_metres_is_unplaced_recalculate` and
    `test_hand_replaced_lane_is_unplaced_manual_and_keeps_automatic_hints`.
  - `test_hints_state_current_and_stale`: stale after a recipe change, current after `sync_hints`.
  - Review Focus 4.
- [ ] **Step 8: Run** `.venv/bin/python tools/check.py test_aimargins test_aihints test_fastlane test_trackcopy test_ai_line_transport` → PASS.
- [ ] **Step 9: Bump `ailinestate.CODE_VERSION`?** No: line bytes are unchanged; update only the source digest in
  `LaneCodeVersionTest` if that test reports the changed source (see the comment at `CODE_VERSION`).
- [ ] **Step 10: Commit** `"Store route metres with the AI line and render hints from the recipe on every write"`

### Task 3: Recipe transport for `aiMargins`

**Files:**
- Modify: `src/app/trackedits.py` (every place listing `aiCorrections`: change summary ~113, `_count` ~123,
  validation ~143 and ~166, cold read ~173, answer ~205 and ~220, saved keys ~261, save body ~713 and ~783)
- Modify: `src/app/trackhistory.py` (`KEYED` gets `"aiMargins"`)
- Modify: `src/app/trackcopy.py` (~191 changed, ~196 built, ~333 recipe)
- Modify: `src/app/trackview.py` (~73: a cold recipe carries `aiMargins` like `aiCorrections`)
- Modify: `src/generator.py` (~566, ~681, ~729: carry `aiMargins` from `ai_source`)
- Test: `engine/tests/test_trackcopy.py`, `engine/tests/test_aimargins.py`

**Interfaces:**
- Consumes: `aimargins.problem`, `aimargins.recipe`.
- Produces: `edits.aiMargins` round-trips through draft, Save, Save as, history and rebuild; `trackedits` validates
  it with `aimargins.problem` (`Invalid` on failure).

- [ ] **Step 1: Write the failing test** `test_save_keeps_side_margins_in_the_recipe` (test_trackcopy): a draft
  with only `aiMargins` counts as a change; after Save, `aimargins.recipe(folder)` equals the draft.
- [ ] **Step 2: Run, expect FAIL** ("Nothing to save").
- [ ] **Step 3: Implement** the trackedits/trackhistory/trackcopy/trackview changes.
- [ ] **Step 4: Write the failing test** `test_rebuild_carries_side_margins_alone` (test_aimargins, patching the
  generator's recipe read): `ai_source` with only `aiMargins` → the new `map2lap.json` has them under `edits`.
- [ ] **Step 5: Implement** the generator transport (a list `ai_margins` beside `ai_corrections`).
- [ ] **Step 6: Run** `.venv/bin/python tools/check.py test_trackcopy test_aimargins test_editorbuild` → PASS.
- [ ] **Step 7: Commit** `"Carry side margins through drafts, saves, history and rebuilds"`

### Task 4: Status, Recalculate, Race and the preview endpoint

**Files:**
- Modify: `src/server_editor.py` (`_ai_line` adds `hints`; new `_margin_preview`)
- Modify: `src/server.py` (route `POST /api/editor/<t>/ai-line/margins`; recalculate handles hints)
- Modify: `src/app/ailanejobs.py` (`ensure` forces a calculation for `unplaced == "recalculate"`; `race` syncs stale hints)
- Test: `engine/tests/test_aimargins.py`

**Interfaces:**
- Consumes: Task 2 `hints`, `sync_hints`, `hints_state`.
- Produces:
  - `GET /api/editor/<t>/ai-line` adds `hints: {state, unplaced, rejected}`.
  - `POST /api/editor/<t>/ai-line/margins` body `{aiMargins: [...]}` (the draft) → `{auto: [[start, end, hint]],
    sections: [[start, end, left, right]], margins: {id: {start: float, end: float, error?: str}}, unplaced}`;
    fractions of the installed lane. 400 with `{"error"}` on a schema problem.
  - Recalculate (`saved_inputs is None`, everything saved): line ready and `unplaced == "recalculate"` → calculate
    (as `retry` does for failed); line ready and `state == "stale"` → `sync_hints`, answer the line status; AC running
    → `{"status": "deferred", "message": …}` as today.
  - `ailanejobs.race`: also `sync_hints` when `hints_state(...)["state"] == "stale"` and AC is not running. A
    `"manual"` unplaced margin never blocks or recalculates; the race uses the automatic hints.

- [ ] **Step 1: Write the failing test** `test_acceptance_right_margin_saved_while_ac_runs_reaches_the_next_race`
  (spec Test 9): ready line; recipe gains a right margin while `ac_running` is patched True → after the save path
  (`carry` into a staged folder, swap) the INI is unchanged and `hints_state` is `stale`; a fresh `hints_state` call
  (reopened Editor) is still `stale`; patch AC closed, call `race(...)` with a stub `launch` → the INI's right value
  is the margin, left automatic, `checksum(fast_lane.ai)` unchanged.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** the `race` and `ensure` changes, `_ai_line` `hints`, `_margin_preview`, the routes.
- [ ] **Step 4: Add tests:** Review Focus 5; `test_recalculate_with_unplaced_margins_calculates_once`;
  `test_margin_preview_reports_sections_and_rejections`.
- [ ] **Step 5: Run** `.venv/bin/python tools/check.py test_aimargins test_aihints test_fastlane` and `tools/check.py --fast` → PASS (or only `KNOWN`).
- [ ] **Step 6: Commit** `"Report stale and unplaced side margins and sync them on Recalculate and Race"`

### Task 5: Editor tool

**Files:**
- Modify: `ui/src/editor/tools/toolDefs.ts` (+ test): tool `"ai-margin"`, group `"ai"`, id `edit-ai-margin`,
  label `"Side margin"`, key `"M"`, `selection: "none"`, not `free`; help rows: M on/off; Click A then B on the line in
  driving order; Click a stretch to pick it; Left/Right: Auto or metres; X or Delete removes the picked one; Ctrl+Z.
- Modify: `ui/src/editor/state/edits.ts` (+ `edits.test.ts`): `AiMargin {id, start: AiAnchor, end: AiAnchor,
  left: number | null, right: number | null}`; `aiMargins` in `EditState`, `Edits`, `NONE`, both comparisons, the
  load/recipe mappings; `addAiMargin(m)`, `updateAiMargin(id, patch)` (both sides `null` removes it), `removeAiMargin(id)`.
- Modify: `ui/src/editor/scene/aiGuide.ts`: `routeAnchor(guide: MoveGuide, metre: number, level: number): AiAnchor`
  (the object built inline in `aiMoves.ts:215`); `aiMoves.ts` uses it.
- Create: `ui/src/editor/scene/aiMargins.ts`: session `editMargins(el, scene, camera, guide, lane, preview, margins,
  pick, add, select)` with `dispose()`, `setSelected(id)`: A/B clicks snap to guide rows; draws each stretch on the
  band, the overridden side's edge highlighted, rejected ones red with reason as title; returns hover fraction.
- Create: `ui/src/editor/tools/useAiMargins.tsx` (+ `.module.css`): fetches the preview (`ai-line/margins`) on draft
  change; controller with `click`, `removable`/`remove`, `clear`; bar `edit-ai-margin-set` with per side
  `ToolChoice` Auto / number field (min 0, max 1, step 0.05) and the effective value ("0.50 auto" / "0.75 set");
  hover shows effective LEFT/RIGHT; `unplaced` shows "Recalculate the AI line to place side margins" or
  "Not applied: the AI line was replaced by hand".
- Modify: `ui/src/editor/tools/useAiLine.tsx`: `AiLineMode` gains `"margin"` (shows the line, no move session);
  the Recalculate button is also enabled for `hints.state === "stale"` or `hints.unplaced === "recalculate"`.
- Modify: `ui/src/editor/EditTools.tsx`: mode for `"ai-margin"`, `useAiMargins` wired, controller registered.
- Modify: `ui/e2e/server.py`: `GET /__test/ai-hints?name=` returns the track's `data/ai_hints.ini` text ("" if none).
- Test: `ui/e2e/tools.e2e.ts` new `test("Side margin overrides one side and reaches ai_hints.ini")`.

- [ ] **Step 1: Write the failing unit tests:** toolDefs (`toolOfKey("m")?.tool === "ai-margin"`, AI group order
  `["ai-move", "ai-redraw", "ai-margin"]`); edits (`updateAiMargin` with both `null` removes; add/update/remove are
  one Undo step each).
- [ ] **Step 2: Run** `cd ui && bun test src/editor/tools/toolDefs.test.ts src/editor/state/edits.test.ts` → FAIL.
- [ ] **Step 3: Implement** toolDefs, edits, `routeAnchor`; run → PASS.
- [ ] **Step 4: Write the failing browser test:** rebuild `alpha` with `ai_moves: true`, recalculate, open Editor,
  press M, click A and B on the band (project guide rows as the existing AI tests do), set Right 0.75, Left stays
  Auto; the bar shows `0.75 set`; Ctrl+Z removes it, Ctrl+Y restores; X deletes and returns to Auto, Ctrl+Z restores;
  Recalculate AI line → `/__test/ai-hints?name=alpha` parsed: inside the stretch `RIGHT=0.75` and `LEFT` the
  automatic value, outside the automatic values on both sides; `/api/editor/alpha/ai-line` `validity` still
  `ready`.
- [ ] **Step 5: Run** `bun run build && bun --bun x playwright test e2e/tools.e2e.ts --project=chrome -g "Side margin"` → FAIL.
- [ ] **Step 6: Implement** the scene session, hook, bar, EditTools wiring, test-server endpoint.
- [ ] **Step 7: Run** `bun run check`, then the browser test again → PASS; then `bun run e2e` (only the known
  `models.e2e.ts` lighting case may differ, now fixed in cbd9b64).
- [ ] **Step 8: Commit** with `src/web`: `"Add the Side margin tool to the Editor"`

### Task 6: Docs and full check

**Files:**
- Modify: `docs/editor-tools.md` (Side margin under AI line: controls, Auto vs 0 m, overlaps, unplaced, deferred)
- Modify: `docs/ac-rules.md` (hints symmetric unless a side margin overrides a side; 0–1 m in 0.05 m steps)
- Modify: `GLOSSARY.md` (**Side margin**: one or two sentences)

- [ ] **Step 1:** Write the three doc changes (how it is now, no history).
- [ ] **Step 2: Run** `.venv/bin/python tools/check.py` → PASS (only `KNOWN`).
- [ ] **Step 3: Commit** `"Document Side margin"`
- [ ] **Step 4:** Report the file test (INI values per section) separately from any drive in AC.
