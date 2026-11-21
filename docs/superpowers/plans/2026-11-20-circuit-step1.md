# Circuit, step 1 (build and drive a lap) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Circuit" on the generator page: pins in driving direction, OSRM closes the lap, the preview shows it with its
length, the build makes a closed lap with one checked start/finish line `AC_TIME_0`, and the user drives one full timed lap.

**Architecture:** A pure module `app/circuitlap.py` turns OSRM's answer into a `Lap` (closed line, length, twice-driven
spans) or refuses it (`NoLap`); `generator.circuit_route` asks OSRM and calls it for the preview and the build alike. The
kind `"circuit"` travels through the track code (`"k"`), `anchor.json`, `data/map2lap.json`, the server and the page; it,
not the presence of timing, decides point-to-point. `obj_to_kn5` gets a circuit branch that places start/finish, grid and
hotlap on a once-driven, single-level stretch at pin 1 and writes the placed line back into `anchor.json`.

**Tech Stack:** Python 3.14 (`unittest`, numpy), React/TypeScript (Bun, Leaflet), Playwright for browser tests.

**Spec:** `docs/superpowers/specs/2026-11-20-circuit-design.md`

**Scope:** step 1 only. Steps 2 (sectors, gantry) and 3 (lap count in Play) get their own plans after the user has
accepted step 1 in AC: step 2 first needs AC's sector limit, step 3 builds on step 1's real track.

## Global Constraints

- Route and Area behave exactly as before, including Route's implicit loop (`LOOP_M`) and its A/B gates.
- `"k": "circuit"` in the code; no new prefix; a code without `"k"` is a Route.
- The lap count never goes into the track, `anchor.json`, `map2lap.json` or the code (step 3; nothing here adds it).
- OSRM request for a lap: pins 1 … n, then pin 1 again, `continue_straight=true`, `annotations=nodes,distance`.
- Twice driven = the same edge (pair of consecutive OSM nodes) in either direction appears twice; a repeated node alone is
  not. U-turn = edge a→b followed at once by b→a, at a pin, at the seam at pin 1 or anywhere else.
- Every kept number gets a comment with its physical reason and where it would fail (AGENTS.md).
- TDD: each test is run and seen failing before the code it tests.
- Build safety: no running Map2Lap Build/Worker while `engine/`/`src/` change; AC not running before installing.
- Edit `ui/`, never `src/web`; `bun run build` before a commit, commit both.

## Review Focus

1. **A pin snapped mid-edge** (always the case): legs begin and end inside an edge, so leg j's last edge equals leg
   j+1's first edge. That is one traversal, not a twice-driven edge. Test: `test_leg_boundary_inside_one_edge_is_one_traversal`.
2. **Last pin snapped onto pin 1** (the user clicked the start again): the closing leg has distance 0; the lap is closed
   without an extra loop. Test: `test_closing_leg_of_zero_length_is_dropped`.
3. **Pin 1 on a lollipop stem or under a bridge**: start/finish moves forward to a once-driven, single-level place; if
   none within the search distance, the build stops with the message, not with a line on the bridge deck. Tests in Task 4.
4. **A pasted circuit code and "Rebuild"** come back as Circuit, not as a Route without its closing leg.
   Tests: `test_circuit_code_round_trips`, `test_rebuild_passes_circuit` (Task 3).
5. **Switching Circuit → Route** with the same pins gives the old route request (no `kind`), so the Route preview is
   unchanged. Test: browser test step in Task 6.

---

### Task 1: The lap from OSRM's answer (`app/circuitlap.py`)

**Files:**
- Create: `src/app/circuitlap.py`
- Test: `engine/tests/test_circuitlap.py`

**Interfaces:**
- Produces:
  - `class NoLap(ValueError)`: message is the user-facing text.
  - `@dataclass(frozen=True) class Lap: coords: list[tuple[float, float]]` (lat, lon; closed: starts and ends at the
    snapped pin 1), `length_m: float`, `twice: list[tuple[float, float]]` (merged lap-metre spans from pin 1 driven twice),
    `pins_m: list[float]` (lap metre of each pin, pin 1 = 0).
  - `lap(answer: dict) -> Lap`. Pure. `answer` is OSRM's JSON for pins 1 … n, 1.

The fixture answers are small hand-written dicts in OSRM's shape: `routes[0].legs[*].annotation.{nodes, distance}`
(`len(distance) == len(nodes) - 1`, verified 2026-11-20), `routes[0].geometry.coordinates` ([lon, lat]),
`routes[0].distance`, `waypoints[*].location`. A leg's first and last entries are the edges its snapped waypoints lie on.

- [ ] **Step 1: Write the failing tests**

```python
def test_ring_has_no_twice_driven_span(self):
    lap = circuitlap.lap(ring())            # 3 legs A-B-C-A over distinct edges, 300 m each
    self.assertAlmostEqual(lap.length_m, 900)
    self.assertEqual(lap.twice, [])
    self.assertEqual(lap.pins_m, [0, 300, 600])

def test_leg_boundary_inside_one_edge_is_one_traversal(self):
    self.assertEqual(circuitlap.lap(ring(shared_edge_at_pins=True)).twice, [])

def test_lollipop_stem_is_twice_driven(self):
    lap = circuitlap.lap(lollipop(stem_m=200, loop_m=600))     # stem out a->b->c, loop, back c->b->a
    self.assertEqual(lap.twice, [(0, 200), (800, 1000)])

def test_figure_eight_crossing_node_is_not_twice_driven(self):
    self.assertEqual(circuitlap.lap(figure_eight()).twice, [])  # node X visited twice, every edge once

def test_u_turn_at_a_pin_names_the_pin(self):
    with self.assertRaisesRegex(circuitlap.NoLap, "At pin 3 the car would have to turn around"):
        circuitlap.lap(dead_end_at(pin=3))

def test_u_turn_at_the_seam_names_pin_1(self):
    with self.assertRaisesRegex(circuitlap.NoLap, "At pin 1 the car would have to turn around"):
        circuitlap.lap(out_and_back())       # 2 pins on one road: B is reached, A is left the way it was reached

def test_hairpin_is_allowed(self):
    self.assertEqual(circuitlap.lap(hairpin()).twice, [])     # a 175° bend over distinct edges

def test_closing_leg_of_zero_length_is_dropped(self):
    lap = circuitlap.lap(ring(last_pin_on_pin_1=True))        # 4 waypoints, last leg distance 0
    self.assertEqual(len(lap.pins_m), 3)
    self.assertAlmostEqual(lap.length_m, 900)
```

- [ ] **Step 2: Run to see them fail**

Run: `.venv/bin/python tools/check.py test_circuitlap`
Expected: FAIL, `ModuleNotFoundError: No module named 'app.circuitlap'`

- [ ] **Step 3: Implement `lap(answer) -> Lap` in `src/app/circuitlap.py`**

The algorithm (it decides the rules, so here it is):

```
legs  = [leg for leg in answer legs if leg.distance > 0]          # (closing leg on pin 1: dropped)
pins  = cumulative leg distances, starting at 0
trav  = per leg: (edge=(n_i, n_i+1), s0, s1) from the leg's cumulative distances, offset by its pin metre
join: for each boundary k (leg k-1 -> leg k, and the seam last leg -> leg 0):
      last edge == first edge          -> one traversal (merge spans; at the seam: the span wraps)
      last edge == reversed first edge -> NoLap(f"At pin {k + 1} the car would have to turn around: put it on the through road")
inside: consecutive traversals (a,b),(b,a) -> NoLap(f"Between pin {k} and pin {k + 1} the car would have to turn around: move a pin")
twice: traversals grouped by frozenset(edge); groups of >= 2 -> their spans, merged and sorted
coords: the geometry's coordinates as (lat, lon), closed onto the first
```

Module docstring: the rules above in two sentences, the verified OSRM shape, and the pitfall of Review Focus 1.

- [ ] **Step 4: Run to see them pass**

Run: `.venv/bin/python tools/check.py test_circuitlap`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/circuitlap.py engine/tests/test_circuitlap.py
git commit -m "Read a circuit's lap from OSRM: twice-driven edges and U-turns"
```

### Task 2: Ask OSRM for a lap; `/api/route` for circuits

**Files:**
- Modify: `src/generator.py` (beside `route()`, `generator.py:73`)
- Modify: `src/server.py:862-864` (`/api/route`)
- Modify: `ui/e2e/server.py:384` (stand-in beside `generator.route`)
- Test: `engine/tests/test_circuitlap.py` (request), `engine/tests/test_server_connections.py` or a new
  `engine/tests/test_server_circuit.py` (endpoint)

**Interfaces:**
- Consumes: `circuitlap.lap`, `circuitlap.NoLap`, `circuitlap.Lap`.
- Produces: `generator.circuit_route(points: list[tuple[float, float]]) -> circuitlap.Lap`; raises `NoLap` with
  "Set at least two pins" for fewer than 2, `RuntimeError("OSRM: …")` as `route()` does.
  `/api/route` with `{"points", "kind": "circuit"}` answers `{"coords", "length_m"}` or `{"error": NoLap text}`
  (status 400); without `kind` exactly as today.

- [ ] **Step 1: Failing tests**
  - `test_circuit_request_closes_on_pin_1_and_keeps_straight`: with `urllib.request.urlopen` patched to record the URL,
    `circuit_route([(1, 2), (3, 4)])` asks for `2.000000,1.000000;4.000000,3.000000;2.000000,1.000000` with
    `continue_straight=true` and `annotations=nodes,distance`.
  - `test_route_endpoint_answers_lap_or_refusal`: a stand-in `circuit_route` returning a `Lap` gives
    `{"coords", "length_m"}`; one raising `NoLap("At pin 3 …")` gives status 400 and that error text; a body without
    `kind` still calls `generator.route`.
- [ ] **Step 2: Run, expect FAIL** (`AttributeError: module 'generator' has no attribute 'circuit_route'`):
  `.venv/bin/python tools/check.py test_circuitlap test_server_circuit`
- [ ] **Step 3: Implement** `circuit_route` with the same `User-Agent` and timeout as `route()`, then the `/api/route`
  branch on `body.get("kind") == "circuit"`. In `ui/e2e/server.py` stub `generator.circuit_route` like `route`
  (a `Lap` over the given points plus pin 1, 1000 m per leg).
- [ ] **Step 4: Run, expect PASS** (same command)
- [ ] **Step 5: Commit** — "Route a circuit's lap for the preview"

### Task 3: The kind through code, build, saved settings and rebuild

**Files:**
- Modify: `src/app/trackcode.py` (`encode`, `decode`, module docstring)
- Modify: `src/generator.py` (`build`, `_build`, `_finish`, `main`)
- Modify: `src/scenery/gates.py:246` (no gates for a circuit)
- Modify: `src/app/mytracks.py` (docstring, `listing`, the same-track key at `mytracks.py:113`)
- Modify: `src/server.py` (`start_build`, `/api/build`, `/api/rebuild`)
- Modify: `tools/from_debug.py:87-93`, `tools/measure.py:834-837`
- Test: `engine/tests/test_trackcode.py` (create if absent), `engine/tests/test_circuit_build.py`

**Interfaces:**
- Consumes: `generator.circuit_route`.
- Produces:
  - Code: `encode({..., "kind": "circuit"})` puts `"k": "circuit"`; `decode` returns `"kind": "circuit"` for it and
    `"kind": "route"` for a points code without `"k"`; `"k"` of another value, or on an area code, is `BadCode`.
  - `generator.build(points, width, name, title=None, ..., kind="route", circuit_timing=None)`; CLI flag `--circuit`.
    `circuit_timing` (from_debug only): the saved `{"line_m", "twice"}` used with `line=` instead of OSRM's.
  - `anchor.json` of a circuit: `"kind": "circuit"`, `"route"` the closed lap in ENU from pin 1,
    `"timing": {"start_m": 0.0, "twice": [[s0, s1], …]}` (spans scaled from OSRM metres to the ENU line's length).
    Route and Area anchors get `"kind": "route"` / `"area"`.
  - `data/map2lap.json` of a circuit: `"kind": "circuit"`, `"timing": {"line_m", "twice"}` as placed (re-read from
    `anchor.json` after `obj_to_kn5.convert`, Task 4), `"route_end"`: the index of the lap's last point.
  - `mytracks.listing` entries carry `"kind"` (`"route"` when missing, `"area"` for areas).
  - `start_build(..., kind="route")`; `/api/build` reads `body["kind"]`, `/api/rebuild` reads `info["kind"]`.

- [ ] **Step 1: Failing tests**
  - `test_circuit_code_round_trips`: `decode(encode(info_with_kind_circuit))["kind"] == "circuit"`, points unchanged.
  - `test_route_code_without_k_is_a_route` and `test_unknown_k_is_refused` (`BadCode`).
  - `test_circuit_anchor_is_a_closed_lap_with_timing`: `_build(..., kind="circuit", upto="obj")` with
    `circuit_route`, `road_rules`, the tile pool and `make_obj.main` stubbed: `anchor.json` has `kind` circuit, its route
    starts and ends at the same point (±0.5 m), `timing.start_m == 0`, no `extend()` call.
  - `test_circuit_is_not_point_to_point`: `_finish` with a circuit anchor passes `point_to_point=False` to
    `make_track_folder.make` and `gates.build` returns `None`.
  - `test_rebuild_passes_circuit`: `/api/rebuild` of a saved info with `kind` circuit starts the build with `--circuit`.
- [ ] **Step 2: Run, expect FAIL**: `.venv/bin/python tools/check.py test_trackcode test_circuit_build`
- [ ] **Step 3: Implement.** In `_build`, a circuit takes `circuit_route` (or `line` + `circuit_timing`), sets
  `loop = True`, skips `extend()` and the point-to-point timing block. In `_finish`, `point_to_point = anc.get("kind")
  != "circuit" and timing is not None` (`!=`, not `== "route"`: anchors from before this change have no `kind`); the description reads `f"Circuit, lap {length / 1000:.1f} km, corridor
  ±{width:.0f} m."`. `ui_track.json` `"run"` stays `"free"` for a circuit in step 1 (the value AC expects for a
  circuit is a known unknown of the spec). `from_debug.py` and `measure.py` pass `kind`/`circuit_timing` from the
  saved info or the `tools/test_tracks.json` entry (`"kind": "circuit"`).
- [ ] **Step 4: Run, expect PASS** (same command), then `.venv/bin/python tools/check.py --fast`: no new failures.
- [ ] **Step 5: Commit** — "Circuit as a track kind in code, build and saved settings"

### Task 4: Start/finish, grid and hotlap on the lap (`obj_to_kn5`)

**Files:**
- Modify: `src/track/obj_to_kn5.py` (`start_empties` branch, new helpers beside `road_height`/`route_slots`, `convert`)
- Test: `engine/tests/test_start_positions.py` (new `CircuitStartTest` class)

**Interfaces:**
- Consumes: the circuit `anchor.json` of Task 3.
- Produces:
  - `road_levels(objs, x, z, gap=LEVEL_GAP_M) -> list[float]`: the distinct driving-surface heights at (x, z), heights
    closer than `gap` merged, ascending. Pure.
  - `crosses_once(route_xy, a, b) -> bool`: the segment a–b (ENU) crosses the closed lap exactly once. Pure.
  - `circuit_empties(objs, anchor, log=print) -> (nodes, base, line_m)`; `start_empties` returns its `(nodes, base)` for
    `anchor["kind"] == "circuit"`, and `convert` writes `line_m` to `anchor["timing"]["line_m"]` in `anchor.json`.
  - Constants with comments: `LEVEL_GAP_M = 2.5` (an overpass deck stands ≥ ~4.5 m over the road under it; meshes
    overlapping at a junction differ by centimetres; fails only for a deck lower than 2.5 m, which no road has),
    `CIRCUIT_SEARCH_M = 300.0` (how far start/finish may move forward from pin 1: about a village's main street; beyond
    that it is no longer "at pin 1", so the build stops and the user moves the pin).
  - Error text: `"No place for start/finish within 300 m after pin 1: move pin 1 onto a stretch driven once, away from bridges"`.

Placement rule (from the spec): from `timing["start_m"]` forward in 2 m steps up to `CIRCUIT_SEARCH_M`, the first metre
`d` where the window `[d - SLOTS * SLOT_GAP - STAGE_START_GAP_M - 5, d + 5]` (cyclic around the lap) overlaps no
`timing["twice"]` span, every 2 m sample in it has exactly one entry in `road_levels`, and the line
`d ± AB_HALF_M` across the driving direction `crosses_once`. With `timing["line_m"]` given (from_debug), `d` is that
metre without search. The grid uses `route_slots` on the lap's cyclic stretch before `d` (`front_m` = `d` −
`STAGE_START_GAP_M`, as for point-to-point); `AC_TIME_0_L/R` at `d`, height the one level there + `START_LIFT`;
`AC_HOTLAP_START_0` at slot 0.

- [ ] **Step 1: Failing tests** (in `CircuitStartTest`, a square ring road of 4 × 300 m on the sloping plane of `road()`)
  - `test_line_is_across_the_road_at_pin_1`: `AC_TIME_0_L/R` midpoint at lap metre 0 (±0.1 m), the L–R direction
    perpendicular to the lap there, both on the road's height + `START_LIFT`.
  - `test_grid_stands_before_the_line_across_the_seam`: `AC_START_0` 3 m before the line, `AC_START_1..3` 8 m apart
    behind it on the lap's last stretch; `AC_HOTLAP_START_0` == `AC_START_0`; no `AC_AB_*` node.
  - `test_line_moves_forward_off_a_twice_driven_span`: `timing.twice = [[0, 40]]` → line at the first metre ≥ 40 + the
    grid window.
  - `test_line_moves_forward_from_under_a_bridge`: a second road mesh 6 m higher over lap metres −20…20 → line placed
    beyond it; `road_levels` there returns two heights.
  - `test_no_place_within_search_stops_the_build`: `twice = [[0, 400]]` → `RuntimeError` with the text above.
  - `test_given_line_m_is_kept`: `timing.line_m = 120` → line at 120 without search.
  - `test_route_and_area_starts_unchanged`: the existing five tests still pass untouched.
- [ ] **Step 2: Run, expect FAIL**: `.venv/bin/python tools/check.py test_start_positions`
- [ ] **Step 3: Implement** the helpers, `circuit_empties`, the branch and the write-back in `convert`.
- [ ] **Step 4: Run, expect PASS**, then `.venv/bin/python tools/check.py` (unit tests and the kn5 build of the short
  test track): no failure outside `KNOWN`.
- [ ] **Step 5: Commit** — "Start/finish and grid of a circuit at pin 1"

### Task 5: Pick and register the step-1 test circuit

**Files:**
- Modify: `tools/test_tracks.json` (new entry)

- [ ] **Step 1:** With `generator.circuit_route` (live OSRM), find a simple ring in Carinthia: 1.25–3 km, `twice == []`,
  pin 1 on a stretch without bridge, 3–4 pins. Record the tried candidates and why each was dropped in the task notes.
- [ ] **Step 2:** Add it as `"<name>_circuit_test"` with `"kind": "circuit"`, `"title"`, `"about"` (the place and what
  it tests: a closed ring, the seam at pin 1), `"points"`, `"width": 120.0`, `"spots": []`.
- [ ] **Step 3:** Check no Map2Lap Build/Worker runs; `.venv/bin/python tools/measure.py <name>_circuit_test --build`;
  expected: build ends with "is installed", log shows `Circuit, lap … km`.
- [ ] **Step 4: Commit** — "Short circuit test track in Carinthia"

### Task 6: Circuit on the generator page

**Files:**
- Modify: `ui/src/types.ts` (`Mode`, `Track.kind?: Mode`, `CodeContent.kind?`)
- Modify: `ui/src/hooks/useNewTrack.ts` (route request, `makes`, `selection`, `applyCode`, `buildBody`)
- Modify: `ui/src/components/NewTrackPane.tsx` (+ `.module.css`)
- Modify: `ui/src/components/TrackMap.tsx` (+ `.module.css`)
- Modify: `ui/src/components/MyTracksPane.tsx` (kind shown)
- Create: `ui/src/components/lapArrows.ts`, `ui/src/components/lapArrows.test.ts`
- Test: a Circuit case in the e2e file that covers "New track" (`grep -l "Next stop" ui/e2e`)

**Interfaces:**
- Consumes: `/api/route` with `kind`, `/api/code` returning `kind`, `/api/build` reading `kind`, listing `kind`.
- Produces: `arrowsAlong(coords: LatLon[], everyM: number, max: number): {at: LatLon; deg: number}[]`. Pure; arrows
  every `everyM` along the line, at most `max`, `deg` the bearing clockwise from north.

Look and copy (decided with the user, spec "Generator page"):
- Segmented choice `Route | Area | Circuit`; the block's label "Circuit".
- Pin rows tagged `S`, `2`, `3`, …; no Finish. A last, non-input row `↻  Back to S · Lap 7.4 km` (km from the preview;
  "Back to S" alone while it is calculating). The "+" row's placeholder: "Next pin: search or click the map".
- One pin: "Now click the next pin." A refusal shows as `Circuit: <error>` where a route error shows today.
- Map: the lap as the route line is drawn today, plus small arrows from `arrowsAlong(coords, max(250, length/12), 12)`.
- Switching mode clears the pins, as today. A route request without `kind` for Route.

- [ ] **Step 1: Failing tests**
  - `lapArrows.test.ts`: on a 1 km line due east, `arrowsAlong(line, 250, 12)` gives 3 arrows at 250/500/750 m with
    `deg ≈ 90`; with `max = 2` at most 2.
  - e2e: in Circuit mode, three map clicks show `S`, `2`, `3` and "Back to S · Lap"; the build request body carries
    `"kind": "circuit"`; switching to Route and clicking two pins sends `/api/route` without `kind`.
- [ ] **Step 2: Run, expect FAIL**: `cd ui && bun run check`, then `bun run build && bun --bun x playwright test
  <file> --project=chrome -g Circuit`
- [ ] **Step 3: Implement** in the files above; CSS in the module files only.
- [ ] **Step 4: Run, expect PASS**: `bun run check`, the e2e case, then the whole `bun run e2e`.
- [ ] **Step 5: Commit** (with `src/web`) — "Circuit on the generator page"

### Task 7: Install and hand over to the user

- [ ] **Step 1:** Check AC is not running and no build runs; `.venv/bin/python tools/measure.py <name>_circuit_test --install`.
- [ ] **Step 2:** Hand over, then stop and wait for the user's feedback before step 2:
  - Track name (as in AC's list).
  - Test: Play from My tracks with "Unlimited"; drive off the grid over start/finish, one full lap, back over it.
  - Expected: no U-turn anywhere; the first crossing starts the lap clock (no lap time yet), the second shows exactly one
    lap time; the lap's length in the page matches the preview (±1 %); pasting the track's code shows Circuit with the same pins.
