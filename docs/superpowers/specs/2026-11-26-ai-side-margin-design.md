# Side margin: hand corrections of the AI's DANGER hints

## Intent

The AI drives a bend cleanly alone, but in side-by-side traffic the outer car brushes a wall. The racing line itself is
right. The user wants more reserve on one side for one stretch, keeping the other side automatic, without touching the
line. Side margin is an Editor tool that overrides the automatic `DANGER_n` hints of `data/ai_hints.ini` per side and
per stretch, stored in the Editor recipe and applied on every path that writes the INI.

## Goals

- Mark a stretch on the shown AI line by its start and end, in driving order; on a Circuit across start/finish.
- Per side, independently: **Auto** (the automatic value) or a fixed value in metres. An explicit 0 m differs from Auto.
- The Editor shows the affected stretch, the effective values there and which side is overridden. A correction can be
  adjusted, undone and deleted.
- A manual value replaces only its side, only inside its stretch. Example: automatic 0.50 m on both sides, right set
  to 0.75 m: inside, left keeps each automatic value and right is 0.75 m; outside, both are automatic.
- Stored durably in the Editor recipe; `ai_hints.ini` is generated from the current line and the stored corrections on
  every writing path: Save, Save as, AI line recalculation, Build as copy, the restore before a Race.
- `DANGER_n` sections are unique and consecutively numbered from 0.

## Non-goals

- No change to `fast_lane.ai`: its geometry and measured side widths stay byte-identical. Changing a margin never
  recalculates the line.
- No new automatic rule. The automatic hints stay as in `aihints.sections`.
- Area builds: they have no AI line (freeroam only), so no tool there.

## Anti-goals

- The Editor says "saved" while the next Race still runs with the old hints.
- A correction silently slides to another place after a rebuild or recalculation.
- Changing a margin marks the line Outdated or starts a line calculation.

## Constraints found in the code

- Today's hints are symmetric (LEFT = RIGHT) from the sum of both side widths, in 0.25 m steps up to 1 m
  (`aihints.MAX_M`). Sections with 0 get no entry. START/END are fractions of the 3D line including a Circuit's closing
  chord; a run across start/finish is split at 0 (`aihints.sections`). Whether AC accepts START > END is unknown, so
  exported sections never wrap.
- `docs/ac-rules.md`: in side-by-side traffic AC subtracts the hints only while more than 4 m remain; free driving keeps
  the full widths. The corner factor is `1 − 0.2 × max(LEFT, RIGHT)`, at least 0.8, and can also affect the return
  from a lateral offset.
- `aiCorrections` enter the line fingerprint (`ailinestate.fingerprint`) and the record check (`ailinestate._record`):
  any change there makes the line pending. Margins must stay outside both.
- Every INI write goes through `aihints.contents`/`install`/`sync`: `ailinestate.record_ready`, `publish`, `carry`;
  `ailanejobs.race`; `route_race.remove_race_layout`; the generator and `trackcopy` remove it for areas.
- `fastlane.calculate` knows the exact route metre of every written lane sample (`ribbon.metres`; moves change positions,
  not the sample count).
- The Save path writes the recipe into a temporary folder, calls `ailinestate.carry` there (which already runs
  `aihints.sync`), then swaps folders.
- The Race path syncs the INI only for a hand-replaced line or a missing INI (`ailanejobs.race`).
- The generator carries only `aiCorrections` from `ai_source` into a rebuilt copy (`generator.py`).

## Approaches

1. **Two directed route anchors, as Move/Redraw use (chosen).** Start and end each store route metre, level, origin and
   the ±5 m direction probe; `aicorrections.Route.resolve` finds them on the current route. Lane samples map to route
   metres; the stretch becomes INI fractions. An anchor that no longer resolves uniquely is flagged in the Editor.
2. **Store INI fractions directly.** Simplest, but every recalculation changes the line length and the stretch slides
   without notice. Rejected: it contradicts the anti-goal.
3. **Route metres without the direction probe.** Cheaper, but cannot detect a wrong association after a rebuild
   (shifted route, a place passed twice). Rejected for the same reason.

The user picked 1. The merge lives in one Python function used for the Editor preview and for the export.

## Design

### Recipe

A new list `edits.aiMargins`, separate from `aiCorrections`:

```json
{"id": "m1", "start": <anchor>, "end": <anchor>, "left": null, "right": 0.75}
```

- `start`/`end`: the anchor schema of `aiCorrections` (`metre`, `level`, `context`, `origin`, optional `route`), built
  in the Editor the same way Move/Redraw build theirs.
- `left`/`right`: `null` is Auto; a number is a fixed value in metres, 0 included. At least one side is a number (a
  correction with both Auto is deleted instead).
- Range 0–1 m in 0.05 m steps: an Editor decision. 1 m is the automatic's own upper bound (`MAX_M`); above it the
  corner factor documented in `docs/ac-rules.md` would drop below what the automatic ever writes.
- Not part of the line fingerprint or the line record check.

### Lane-to-route correspondence

`fastlane.calculate` returns the route metre of each written sample (`ribbon.metres`) with its result.
`ailinestate.publish`/`record_ready` store it in `data/map2lap_ai.json` (rounded to 1 cm), bound to the lane checksum.

- A ready line whose record has no correspondence (built before this change) while the recipe has margins counts as
  pending for the margins only: the status reports `hints: "unplaced"`, Recalculate is active, and the recalculate
  request computes the line once (as `retry` does for a failed line). Tracks without margins never recalculate for
  this. The INI meanwhile keeps the automatic hints.
- A test asserts that the correspondence has exactly one metre per lane sample, with and without moves and redraws.
- A hand-replaced line (`manual`): margins cannot be placed. The Editor marks each one "not applied: the AI line was
  replaced by hand"; the INI keeps the automatic hints.

### Merge (Python, pure, in `aihints`)

`contents(lane, circuit, folder)` reads the lane, the recipe's `aiMargins` and the record's correspondence from
`folder` (the track whose recipe applies; for `publish` the installed folder while the lane is the candidate):

1. The automatic sections as today, as one profile per side over [0, 1).
2. Each margin: resolve both anchors (`Route.resolve` on the saved route) → route metres → lane fractions through the
   correspondence. On a Circuit an end before the start wraps across start/finish; on a Route it is an error
   ("End precedes the start").
3. Inside the stretch, only the side with a number takes it; an Auto side keeps the automatic profile.
4. Cut wherever either side changes, and at 0 on a Circuit. Drop sections where both sides are 0; write
   `LEFT`/`RIGHT` per section with two decimals, numbered `DANGER_0…`. A section with `LEFT=0` and `RIGHT=0.75` is
   written.

Rejections, each with route metre and reason, returned with the result for the Editor; the others still apply:
- an anchor that does not resolve uniquely;
- two margins overriding the **same side** over overlapping metres: the later one in recipe order is rejected.
  A left and a right correction may overlap.

### Deferred hints

"Hints current" means: the installed INI's bytes equal `contents(...)` for the installed lane and the saved recipe.
This needs no new stored state and survives reopening the Editor.

- `GET /api/editor/<track>/ai-line` reports `hints: "current" | "stale"` and the margin rejections.
- Recalculate AI line is enabled when the recipe has unsaved changes, the line is not ready, or the hints are stale.
  With everything saved and the line ready, it rewrites only the INI. While AC runs it reports the existing
  "AI line update deferred".
- Save path (`carry`): while AC runs, the previous INI is carried unchanged into the temporary folder. Otherwise the
  INI is generated there from the temporary folder's recipe. Either way the status above tells the truth afterwards.
- Race start (`ailanejobs.race`): also syncs when the hints are stale and AC is not running.
- Every other `sync`/`install` caller passes the folder whose recipe applies.

### Transport

- `trackcopy.save` writes `aiMargins` into the saved recipe next to `aiCorrections`.
- The generator carries `aiMargins` from `ai_source` like `aiCorrections`, also when a track has only margins.
- `ailinestate.carry` and `publish` read the recipe from the right folder (see Merge).

### Editor

- Tool **Side margin**, key **M**, a third button in the AI group (`toolDefs`), `selection: "none"`, not `free`.
  Taking it up shows the installed line (as Move line and Redraw line do).
- Click A then B on the line in driving order, like Bank road. The new correction starts with both sides Auto; the
  bar shows per side **Auto** or a metre field (0–1, step 0.05). A side with a number is overridden.
- The bar shows, for the picked correction, the effective values per side ("0.50 auto" / "0.75 set"). The stretch is
  drawn on the band, the overridden side's edge highlighted. Hovering the band shows the effective LEFT/RIGHT at that
  point.
- A click on an existing correction picks it to edit; X or Delete removes the picked one (the existing `removable`
  mechanism); Ctrl+Z undoes adding, changing and removing (`TrackEdits`, like kerbs and banking).
- A rejected correction is drawn red with its reason and route metre on hover.
- Effective values come from a server endpoint that runs the same merge on the saved and draft recipe, so preview and
  file cannot differ.

### Docs

`docs/editor-tools.md` (Side margin), `docs/ac-rules.md` (hints no longer always symmetric), `GLOSSARY.md`
(Side margin), `tools/README.md` if a probe is added.

## Tests (TDD: each written and failing first)

Python:
1. **First:** a right-only margin spanning two automatic sections of different width: left keeps both automatic
   values, right is the fixed value, both outside are automatic.
2. Explicit 0 m differs from Auto: `LEFT=0` exported where the automatic is above 0.
3. Deleting the margin returns the INI to the pure automatic bytes.
4. Circuit across start/finish: split at 0, consecutive numbering.
5. Same-side overlap rejected with route metre; left and right overlap allowed.
6. An unresolvable anchor is rejected; other margins apply.
7. Margins leave the line fingerprint and record unchanged (line stays ready); `fast_lane.ai` checksum unchanged.
8. Save writes `aiMargins`; the generator carries them alone; `publish` uses the installed folder's recipe with the
   candidate lane.
9. **Acceptance:** change only the right margin, save while AC runs (INI unchanged, status stale), reopen the Editor
   (still stale, Recalculate enabled), close AC, start a Race: the INI has the new right value, automatic left, and the
   `fast_lane.ai` checksum is unchanged.

Browser (`tools.e2e.ts`): M, A and B on the line, right 0.75, left Auto, values shown, undo, X deletes,
Recalculate, then the exported `ai_hints.ini` read back through the test server and checked value by value.

A drive in AC, if done, is reported separately from the file test.

## Left to the builder

- Where in the view the stretch and side highlight are drawn (`aiLine.ts`/`aiPreviewBand.ts`).
- The endpoint shape for effective values and rejections.
- The test server stand-ins needed for the acceptance case.
