# Circuit: design

## Intent

A third track kind on the generator page beside Route and Area: **Circuit**, a closed lap over real roads. The user sets
pins in driving direction; the lap runs through them in order and back from the last pin to the first. The first draft
is for **driving hotlaps alone**. Nothing in it may block later races against AI or other drivers (grid, pits and the
lap count stay separate from the track).

The user accepts each drivable step in Assetto Corsa before the next one starts. After each step: the track's name,
the exact test steps and the expected behaviour; then wait for feedback.

## Goals

1. **Build and drive a circuit.** "Circuit" in the generator, a closed lap in the preview with its length, the build
   using the same routing, a clear message when no drivable lap exists, and one checked start/finish line so a full
   lap is timed.
2. **Equal timing sectors by lap length.** Start/finish (`AC_TIME_0`) at the first pin; the lap is split into
   n = ⌊L / 1.25 km⌋ + 1 equal sectors measured from the actual start/finish line (no split below 1.25 km), with lines
   `AC_TIME_1` … `AC_TIME_n-1` across the driving direction on the right carriageway, at overpasses too.
3. **Session per drive** in the Play dialog: Practice or Race, with a lap count for Race.

## Non-goals

- AI line (`fast_lane.ai`), opponents, multiplayer, a pit lane.
- Reworking the track code (prefixes stay as they are; see Track code).
- Backward compatibility of codes with older apps: tracks are not shared yet.
- Visible sector markers.

## Anti-goals

- Route and Area change behaviour. Their flow stays as it is, including Route's implicit loop when the last pin lies
  within `LOOP_M` of the first (`generator.py`).
- The lap count stored in the track, `anchor.json`, My tracks or the track code.
- A sector or start/finish line that a lap crosses twice, or that sits on the wrong level at an overpass.
- A first crossing of start/finish counted as a full lap.

## Decided with the user

### What counts as a lap

- OSRM routes pins 1 … n and then pin 1 again, in **one** request. The preview (`/api/route`) and the build
  (`generator._build`) call the same function.
- **Allowed shapes:** ring, lollipop (a stem driven out and back on its two sides, turned by the loop at the top) and
  figure eight (crossing at a junction or on a bridge). The pins decide the shape.
- **Refused:** a real U-turn, turning around on the same lane. Typical cause: a pin in a dead end or beside the road.
  The message names the pin, for example "At pin 3 the car would have to turn around: put it on the through road."
- A lap from 2 pins usually is out and back with a U-turn; it is routed and then refused by that rule, not forbidden
  up front.
- **The lap is closed in the road network, not by distance.** The closing leg from the last pin to pin 1 is always in
  the OSRM request. Only when OSRM snaps the last pin and pin 1 to the same place in the network (same waypoint
  location) is the lap already closed and that leg dropped. Two pins 30 m apart can sit on different ramps or levels; a
  distance rule would join them.
- **The seam at pin 1 is checked like every pin.** OSRM's `continue_straight` acts at intermediate pins only; pin 1 is
  the request's start and end, so the turn from the lap's last edge into its first is Map2Lap's own check.
- Corridor width and everything built around the line stay as in Route.

### Detecting U-turns and twice-driven stretches (approach A, chosen)

Use the edges from OSRM's untrimmed `annotations=nodes,distance` with `continue_straight=true` and omit `steps`.

Edges, not nodes: an **edge** is a pair of consecutive OSM nodes of the lap (legs joined, the seam at pin 1 included).

- **Twice driven** = the same edge, in either direction, appears twice in the lap (a lollipop's stem). A repeated
  **node** alone is not: a figure eight over a level junction visits the crossing node twice but drives every edge once.
  Dual carriageways have their own nodes per side, so a line may sit on one side.
- **U-turn** = an edge a→b followed at once by b→a, at a pin, at the seam or anywhere else. A hairpin drives
  different edges and stays allowed.
- Pitfall: a pin snaps mid-edge, so legs can begin and end inside an edge; joining the legs must not create a false
  repeat or a false a→b→a there.
- Verified 2026-11-20 against the public server: a two-leg loop in Berlin returned `annotation.nodes` per leg and
  maneuvers with modifiers. Whether the public car profile forbids U-turns at waypoints by default
  (`continue_straight`) is from training knowledge only; check it.
- A build from a given line without OSRM (`tools/from_debug.py`) has no node data: it keeps the line positions of the
  build it came from.

### Generator page

```
 [ Route | Area | Circuit ]
 Track name  [ Ochsenkopf Runde      ]
 Circuit
   <>  M2L1-…
   S   Bischofsgrün, Hauptstraße      ×
   2   Fleckl                         ×
   3   Warmensteinach                 ×
   +   Next pin: search or click the map
   ↻   Back to S · Lap 7.4 km
   [Clear all]
```

- The map shows the lap as a closed line with small arrows in driving direction (direction matters here).
- "No drivable lap" goes where the pane says what is missing today (`selection` in `useNewTrack.ts`), not in a dialog.

### Track code and saved kind

- The code gets `"k": "circuit"` beside `"p"`. No new prefix. A code without `"k"` is a Route, as before.
- The kind and the lines as actually placed go into the installed track's `data/map2lap.json` as well as the build's
  `anchor.json`. `anchor.json` can be gone after tidying up; Rebuild (`mytracks.py`) and the debug session
  (`tools/from_debug.py`, from `map2lap.json` and `map2lap_route.txt`) rebuild from the installed files.
- **The kind decides point-to-point, not the presence of timing.** Today `generator._finish` passes
  `point_to_point=timing is not None` and `gates.build` runs for any timing; once circuits carry timing data, a circuit
  would become point-to-point with START and FINISH gates. The kind controls both.

### Timing on the track

- **Start/finish** at the first pin, with the checkered band and gantry of `scenery/gates.py`, the banner reading
  "START · FINISH". The grid stands behind the line (the lap's end leads into it, so road is always there).
- If the first pin lies on a twice-driven stretch, start/finish moves to the nearest once-driven stretch, forward.
- **Sector count (decided by the user):** n = max(2, ⌊L / 1.25 km⌋ + 1) for lap length L measured from the actual
  start/finish line. Short circuits also get an invisible split: with start/finish alone, AC can store the short
  drive from the grid to the line as a full lap. From 1.25 km on, every additional full 1.25 km adds a sector
  up to AC's limit.

  | Lap | Sectors | Lines at |
  |---|---|---|
  | 1.0 km | 2 | 0.5 km |
  | 1.25 km | 2 | 0.625 km |
  | 2.0 km | 2 | 1.0 km |
  | 2.5 km | 3 | 0.83, 1.67 km |
  | 6.0 km | 5 | 1.2, 2.4, 3.6, 4.8 km |
  | 20.8 km | 17 | every 1.22 km |

- AC with CSP recognized 401 numbered lines, enough for Map2Lap's 500 km route limit. The stock HUD may show fewer splits.
- Split lines are invisible. On a twice-driven stretch or inside a junction they move to the nearest once-driven place.
- **All lines are placed together:** moved lines keep their order around the lap and a minimum distance from each
  other and from start/finish (the builder's number, with its reason).
- **Every finished line is checked:** the segment between its `_L` and `_R` must cross the lap only at its own place.
  A line on a once-driven edge can still reach onto a neighbouring carriageway or another part of the lap; then it is
  shortened or moved.
- Lines across the driving direction, spanning the carriageway driven there.
- **Overpasses:** `obj_to_kn5.road_height` returns the **highest** road at a point, so under a bridge it would put the
  line on the deck above. Lines take the height of the lap's own road at that place.

### Play dialog

```
 Assetto Corsa · Practice              ×      ← with a lap count: "· Race"
 Play
 ┌ Drive ─────────────────────────────┐
 │ Car          [ Last driven     ▾ ] │
 │ Session      [ Practice        ▾ ] │
 │ Time of day  ───●────────  10:00   │
 └────────────────────────────────────┘
```

- Circuits offer a Session dropdown that opens on Practice each time. Race shows a separate Laps dropdown.
- Laps starts at 2 and offers 2, 4, 8, 16, 32, 64 and 128.
- Practice starts an unlimited session (`server.play`). A lap count writes a native race session
  (`SESSION_0` `TYPE=3`, `LAPS=N`), alone, without AI line. The lap count travels as its own value through
  `PlaySession` and `/api/play`, not baked into the Practice path.
- If AC does not reliably end that session after N full laps, try a small CSP game mode instead. The user decides
  after step 3's test.

## Approaches considered

- **A, chosen: OSRM's node IDs**, read as edges, for twice-driven stretches and U-turns. No thresholds, the same
  everywhere on earth ("map data first").
- **B: geometry of the line** (near itself = twice driven, 180° turn = U-turn). Rejected: a mountain-pass hairpin looks
  like a U-turn, and two carriageways 10 m apart look like one road driven twice.
- **A with B as a fallback.** Rejected: two rules that can disagree.

## Known unknowns

- Whether AC checks the direction of an `AC_TIME` line (training knowledge, unchecked). The design avoids depending on
  it: no line on a twice-driven stretch.
- The `ui_track.json` `"run"` value for a circuit (`make_track_folder.py` writes "point-to-point" or "free" today).

## Verified in AC

- A one-car Race without an AI line ended at two complete laps. AC advanced through all 17 sectors on both laps.
- In Practice on a 264 m loop, a single gate let AC count the approach as a lap. With two gates AC counted the first
  lap after the full loop. The running native Practice timer can already include time spent in the menu before Drive,
  and the first full lap can include that time too. The lap clock reset for the next lap.

## Calls made while writing (not discussed; correct them if wrong)

- **Step 1 already has a proper start/finish** (from the user's review): one checked `AC_TIME_0` line across the road
  at pin 1, on the lap's own road, with the spawn and grid before it. Today's loop timing (`AC_TIME_0` 20 m straight
  ahead of the grid, `obj_to_kn5.py:427`) can lie beside the road in a bend. The first crossing starts the clock, the
  second completes exactly one lap in the intended flow. Step 2 adds the gantry and the extra gate AC needs to count
  only full laps.
- **Test tracks:** step 1 on a short simple ring in Carinthia (≥ 1.25 km, so step 2 can reuse it); step 2's timing then
  also on a figure eight with an overpass. Once Circuit is on the page the user can draw their own.
- **Moving a sector line:** to the nearest once-driven place in either direction, so the sectors stay as equal as the
  road allows. Start/finish moves forward only (the grid needs the road behind it).
- **Shortest lap:** even below 1.25 km, a lap has one invisible split so AC times full laps. A lap too short to
  fit start/finish, its grid and a split is refused with a clear message.
- **Play from the Editor:** the lap count shows there too when the track is a circuit; the dialog learns the kind from
  the track's saved info.

## Left to the builder

- Where the lap function lives and how the anchor stores lap, start/finish and sector positions (today: `timing` with
  `start_m`/`finish_m` and `gates`).
- How "the lap's own road" height is found at a line (the route's planned heights, its road IDs, or another way).
- Line width when no band is drawn.
- The exact Circuit labels in My tracks.
- Tests for each rule (TDD per AGENTS.md); a new short circuit in `tools/test_tracks.json` once a real one exists.
