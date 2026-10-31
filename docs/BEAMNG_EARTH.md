# Our changes to BeamNG.Earth's code

Since 2026-10-31 BeamNG.Earth is frozen at 1.7.2 and `vendor/beamng_earth` is our code
([DEVELOPMENT.md](DEVELOPMENT.md), "BeamNG.Earth: frozen at 1.7.2"). This file keeps the changes to its **driving
surface and driving behaviour** (heights, decks, junctions, what collides): why, the rule, and the evidence, so a
rule can be checked again later and a later upstream change can be weighed against ours. The branch `upstream` keeps
the unmodified 1.7.2. Deviations in **our own** files (looks, physics names, kn5) are in DEVELOPMENT.md.

**Rules**
- A change to the driving surface or driving behaviour is a patch here: an ID, a switch to turn it off, a test, and
  the evidence. Measured with and without it is how we know a rule works, so the switch stays.
- Other changes to their code (bug fixes, looks, logging, speed) are ordinary commits, no entry here.
- Every place of a patch is marked `(ac-export patch Pn)` in the code (ac-export is the project's former name). All
  places of one patch: `git grep -n "ac-export patch P2"`. Everything we changed against 1.7.2:
  `git diff upstream -- vendor/beamng_earth`.
- "Proven" means measured or driven on a test track, with and without the patch. A patch without evidence is checked
  and otherwise removed again.
- The Rust module's patch announces itself as `earthfast.AC_EXPORT_YIELD` (tools/update_beamng_earth.py checks it).

**Based on:** BeamNG.Earth 1.7.2-beta. With the patches, A2, Stausee and Graz measure the same as on 1.7.1 (2026-10-30;
A2's strongest bridge transition 1.68 instead of 1.66 G). Without them, 1.7.2 measured far worse (A2: 415 m over
0.5 G in the lanes instead of 51) and drove badly.

| ID | What | Files | Off with | Proven |
|---|---|---|---|---|
| P1 | Right of way at junctions | `grading.py`, `plancache.py`, `native/earthfast/src/lib.rs` (+ `server/earthfast.pyd`) | `BNE_JUNCTION_YIELD=off` | yes (Stausee, driven) |
| P2 | Underpasses only where the ground is filled in | `grading.py` | `BNE_UNDERPASS_HUMP=off` | yes (A2, Graz) |
| P3 | 4 m clearance under bridges on lidar | `roads.py` | `BNE_LIDAR_HEADROOM=0` | yes (A2) |
| ~~P4~~ | No raising over streams on lidar: **removed**, measured without effect | – | – | – |
| P5 | Bridge approach: fill the embankment at the end on lidar from 10 cm on | `grading.py` | `BNE_ABUT_FINE=off` | yes (A2, measured and driven) |
| P6 | Trim overlapping bridge decks at the middle from a 5 cm height difference (opposing ones only) | `roadmesh.py` | `BNE_TRIM_DZ=0.3` | yes (A2, measured and driven) |
| P7 | Cross slope from the lidar for motorways and their bridges | `grading.py`, `roads.py`, `roadmesh.py`, `blockworker.py` | `BNE_BANK_LIDAR=off` | yes (A2, measured and driven) |
| P8 | A bridge deck meets its approaches with their gradient (on lidar) | `roads.py` | `BNE_DECK_TANGENT=off` | yes (A2, measured and driven) |
| P9 | No junction into the parallel opposite carriageway | `grading.py` | – (`JUNCTION_PARALLEL_DEG`) | yes (A2, measured and driven) |
| P10 | The terrain continues under the bridge end with the approach's gradient (on lidar) | `grading.py` | `BNE_UNDER_DECK=off` | yes (A2 measured, Graz) |
| P11 | A short tunnel with ground above stays a tunnel, not a bridge (on lidar) | `gradesep.py` | `BNE_LIDAR_UNDERPASS_COVER=0` | yes (Graz, A2, Stausee measured; Graz driven) |
| P12 | Junction pads on bridges only where three or more carriageways meet | `roads.py` | `BNE_PAD_JUNCTIONS_ONLY=off` | yes (Rossbach measured and driven) |

Why patches at all: BeamNG drives on soft tyres and a soft-body chassis that rolls over centimetre bumps; Assetto
Corsa's tyres and springs are much harder, so steps and kinks that go unnoticed in BeamNG.drive throw an AC car off the
road. And the Austrian lidar the test tracks run on already shows cuttings and bridge decks at their real height,
where BeamNG.Earth's rules assume a coarser elevation model.

---

## Later BeamNG.Earth versions

No more merges: 1.7.2 is the last upstream version in Map2Lap (decided 2026-10-31; their releases kept bringing new
steps for AC, and every merge meant re-fitting and measuring all patches). Their releases are watched and single
changes taken by hand:

1. Read their `CHANGELOG.md` and the diff of the places in question: a fix or feature that helps AC tracks?
2. Port it by hand, only after agreeing on it; one that changes the driving surface as a patch of its own here (ID,
   switch, test, marker).
3. Tests (from the test folder, else `test_roads` is missing):
   `cd vendor\beamng_earth\server\tests` → `..\..\..\..\.venv\Scripts\python.exe -m unittest test_grading test_roadmesh test_roads test_gradesep test_otto_bridge`.
   Expected failures are listed below ("Known test failures"); every other failure is new.
4. Build the test tracks again and measure them against their reference: `.venv\Scripts\python.exe tools\measure.py --all --build`
   (data, known spots and reference values in `test_tracks.json`; "WORSE" means check it). Don't build while another
   build is running (a second build aborted twice with `BrokenProcessPool` that way).

`tools/update_beamng_earth.py` (the whole-version merge) is no longer used; `--build-native` still rebuilds
`earthfast` (a running Map2Lap server keeps `earthfast.pyd` locked: stop it first).

---

## P1 Right of way at junctions

- **Problem:** BeamNG.Earth blends the heights of both roads at a junction with equal weight. The joining road pulls
  the through road out of its profile. Stausee, route 356 m: a −10/+5 cm S-wave, 1.6 G in AC.
- **Rule:** A road end without a continuation of its own that lies on another road gives way on that road's carriageway
  (`YIELD_NEAR_M` 20 m from the end, back over `YIELD_FADE_M` 8 m beyond the road edge). Only when the end meets that
  road's height within 10 cm; from 30 cm on blended as before (`YIELD_GATE_*`).
- **Code:** `grading.py`: `YIELD_*`, `Plan.free`, `Grader._free_ends`, `_yield_strength`, `PlanPack.yl`, the call of
  `grade_points`; `plancache.py`: `Plan.free` in the cache; `lib.rs`: `grade_points(…, yl, yield_fade)`,
  `AC_EXPORT_YIELD`. The `.pyd` is built by us (docs/DEVELOPMENT.md). The Linux `.so` is without the patch.
- **Proven:** Stausee driven: junctions at 320–400 m 0.1 G instead of up to 1.6 G. Driven again with 1.7.1 using only
  their `snap_junctions`: the bumps were back, so P1 stays (both on).
- **Tests:** `test_grading.GradePointsTest` (side road on a 5 % road).
- **Rejected:** "the narrower road gives way to the wider one": when a wider road ends, the through road gives way,
  a plateau and then a drop (up to 5 G).

## P2 Underpasses only where the ground is filled in

- **Problem:** `Grader._lower_underpasses` lowers a road under a short bridge until 6 m of clearance plus the deck
  structure lie below the terrain at the lower bridge end. Assumption: the elevation model is filled in up to the deck
  under a bridge. Austrian lidar already shows the cutting, and it was dug anyway:
  - the A2 near Völkermarkt down to 5 m, one carriageway 3.4 m below the other, saw teeth on the embankment between
  - Graz, Triester Straße 4 m, a wall above the Weblinger Gürtel tunnel
- **Rule:** Digging happens only where the terrain under the deck lies ≥ `UNDER_HUMP_MIN_M` 0.5 m above the line between
  the terrain heights just before and after the bridge (`UNDER_HUMP_EDGE_M`, `UNDER_HUMP_WIN_M`), and only down to that
  line. In the coarse elevation model (`dem.coarse_at`, shows no cuttings) BeamNG.Earth's rule applies unchanged.
- **Code:** `grading.py`: `UNDER_HUMP_*`, in `_lower_underpasses` `hump_on`, `half_w`, `reach`, `humps`;
  `Grader._ground_along`, `_under_hump`, `_hump_offsets`; `hump_height`, `hump_dip`, `_arc_on`; `_cell_enu_calc` stores
  `bridge_w`.
- **Proven:** A2 (`a2_test` against a build without the rule): terrain the same as without the rule to 5 cm, the
  marked spots and saw teeth gone. Graz flat.
- **Tests:** `test_grading.UnderpassHumpTest` (a road in a cutting stays, a filled-in one is dug down to its line).
  `UnderpassTest` and `UnderpassShortfallTest` test BeamNG.Earth's rule and run with P2 off.
- **Weakness:** elevation models between lidar and coarse (e.g. Wyoming in the Otto test): where less than 0.5 m is
  filled in, nothing is dug and the clearance stays smaller (Otto Road: 3.88 m instead of 6 m).

## P3 4 m clearance under bridges on lidar

- **Problem:** `BridgeProfiles._solve` raises a bridge until 6 m of clearance plus margin plus deck structure lie
  above the road or railway below it. On lidar the deck already stands at its real height (Austrian motorway overpasses
  4–5 m). Motorways are never raised into a bridge (`APPROACH_SKIP`). A2: humps of up to 1.2 m on the bridge, steps at
  the approaches.
- **Rule:** Where the elevation model is fine (not `railways._coarse_here`), `deck_road_clear(depth, headroom)` uses
  `LIDAR_HEADROOM_M` 4 m instead of `MIN_BRIDGE_HEADROOM_M` 6 m.
- **Code:** `roads.py`: `LIDAR_HEADROOM_M`, `deck_road_clear`, `BridgeProfiles._solve` (`head`; since 1.7.2 also in
  its inner `solve()`, which their deck-end-on-deck rule calls a second time).
- **Proven:** A2: bridge at 4.3 km hump 1.14 → 0.57 m; at 3.3 and 7.8 km the step at the approach 13 → 2 cm,
  3 → 0.45 G.
- **Tests:** `test_roadmesh.BridgeProfilesTest.test_lidar_headroom` (on lidar ≥ 0.5 m lower than with 6 m, still above
  the road). `test_chain_across_cells_and_clearance` and `test_crossing_decks_stack_by_level` test BeamNG.Earth's 6 m and
  run on the coarse model for that (`railways.COARSE_AT`).

## P4 No raising over streams on lidar (removed)

- **Was:** On a fine elevation model without navigation (`nav <= 0`) no water requirement for the deck
  (`BridgeProfiles._solve`: `water = []`). Added for 4 A2 bridges with steps (6.3 / 6.8 / 11.3 / 14.7 km); the steps
  stayed the same.
- **Removed:** the A2 built without P4 (`BNE_LIDAR_WATER=off`) and measured metre by metre against `a2_test`: the
  driving line the same to the millimetre, the same bridge transitions. Stausee crosses no bridge deck, Graz no water.
  No effect proven, so it went (rule above). The code is BeamNG.Earth's again.

## P5 Bridge approach: fill the embankment at the end on lidar from 10 cm on

- **Problem:** A road's map line often ends on the embankment at a bridge; its last lidar point then lies lower than
  the road. BeamNG.Earth's `fill_abutment` fills that up, but only from 30 cm and a 15 % slope on (`ABUT_MIN_M`,
  `ABUT_STEEP`, chosen for coarse elevation models, BeamNG.Earth GitHub #38). A2 at 11.3 km: end 29 cm deep, 15.5 %; at
  4.3 km 58 cm, 14.5 %: just below, not filled. The motorway smoothing (40 m) holds the end and pulled the last ~50 m
  down by 0.26 m and 0.5 m. The deck rose from there: 3 G at 100 km/h.
- **Rule:** On a fine elevation model (`Grader._fine`: a DEM with `coarse_at` that is not coarse there)
  `ABUT_MIN_FINE_M` 0.1 m and `ABUT_STEEP_FINE` 5 % apply.
- **Code:** `grading.py`: `ABUT_FINE_ON`, `ABUT_*_FINE`, `fill_abutment(…, fine)`, `plan_roads(…, fine)`,
  `Grader._fine`, the call in the cell planning.
- **Proven:** computed with BeamNG.Earth's code: the 11.3 km approach follows the lidar right up to the bridge (490.79
  instead of 490.53), 4.3 km 454.72 instead of 454.15. Built and measured: bridge at 11.3 km 3.05 → 0.59 G, 4.3 km
  1.41 → 0.56 G. Driven: 11.3 km drivable.
- **Tests:** `test_grading.AbutmentTest.test_a_lidar_bank_is_filled_from_a_smaller_drop`.

## P6 Trim overlapping bridge decks at the middle from a 5 cm height difference

- **Problem:** BeamNG.Earth builds every carriageway of a motorway as a deck of its own; they meet at the middle
  (`MEDIAN_JOIN_M`). Where two decks overlap in plan and lie at different heights, `trim_overlaps` cuts both halfway
  between their centre lines, but only from 0.3 m on (`TRIM_DZ`). A2 at 6.4 / 6.8 / 11.3 km: the decks overlap 2–4 m
  at the middle, 0.1–0.29 m apart (each carriageway laid flat across, the lidar shows 4.5 % cross slope over both).
  The higher deck with its parapet stood in the other one's left lane: a block, hit at 220 km/h.
- **Rule:** `TRIM_DZ` from 5 cm on (`BNE_TRIM_DZ`). Below 5 cm they stay one surface (a branch that `_merge_overlaps`
  pulled together).
- **Code:** `roadmesh.py`: `TRIM_DZ` (and `import os`).
- **Proven:** A2 built: at 6.4 / 6.8 / 11.3 km no two decks lie on top of each other in the lane any more; both end at
  the middle (0.7 m beside the median barrier, on the opposite carriageway's side).
- **Tests:** `test_roadmesh.TrimOverlapsTest.test_carriageways_a_little_apart_are_trimmed`.
  `test_one_surface_or_stacked_kept` tests BeamNG.Earth's threshold and runs with 0.3 m.
- **Remains:** the step at the middle itself (under the median barrier), until the carriageways and decks have the
  lidar's cross slope (P7).
- **Opposing decks only** (`TRIM_OPPOSITE_COS`): on a junction bridge with ramps (Graz, Triester Straße over the
  Weblinger Gürtel) the 5 cm threshold cut same-direction deck pieces apart. The threshold now only applies between
  decks running in opposite directions (the two carriageways of a motorway), else 0.3 m as in BeamNG.Earth.

## P7 Cross slope from the lidar for motorways and their bridges

- **Problem:** BeamNG.Earth banks only the curves of motorways and expressways (`grading.bank`: a formula from radius
  and design speed, from 1 %, at most 8 %), returns that to flat 100 m before every bridge and always lays bridge decks
  flat across. A2 at 6.8 km: the lidar shows 4.5 % across both carriageways (a curve), the formula ~1 %, 0 before the
  bridge. Each carriageway lay flat around its own centre line, 0.3 m apart at the middle; the flat decks overlapped
  there with that step (P6 trims them, the step stayed under the median barrier).
- **Rule:** On a fine elevation model (`plan_roads(…, fine)`, like P5) motorways and expressways (the classes of
  `BANK_DESIGN`, their ramps too) take the lidar's cross slope: measured at `BANK_LIDAR_SIDE` 0.6 of the half width
  left and right of the centre line, smoothed along over `BANK_LIDAR_SIGMA_M` 10 m, at most `BANK_E_MAX` 8 %; to flat
  over `BANK_FADE_M` at a loose end, not at a bridge. A bridge deck takes the cross slope of the graded terrain of its
  approaches 2–8 m before each end (`BridgeProfiles.deck_bank`; an end over the valley, a joint, takes the other end's)
  and runs linearly in between. Tilted around the centre line: deck, girders, parapets (`roadmesh.deck`,
  `_tilt_since`), asphalt (`roadmesh.build`), markings (`roads._deck_chunks`), guardrails and the median barrier on the
  bridge (`roads.tilt_rows_on_decks`).
- **Code:** `grading.py`: `BANK_LIDAR_*`, `_lidar_banks`, `_bank_lidar`, `_plan(…, lidar_bank)`, `plan_roads` (plans
  at the end with one height call). `roads.py`: `BridgeProfiles.deck_bank`, `DECK_BANK_*`, `_deck_tilt`,
  `tilt_rows_on_decks`, `_deck_chunks(…, banks)`, `_simple_add`, `_is_simple`, `ChainView.deck_bank`. `roadmesh.py`:
  `_row_bank`, `_tilt_since`, `build`, `deck`. `blockworker.py`: the call of `tilt_rows_on_decks`.
- **Since 1.7.2:** BeamNG.Earth solves each bridge chain once in a `ChainStore` (in the frame of its
  `geotiles.CHAIN_Z` region, ~7 km) and a tile sees it through a `ChainView`. The view had no `deck_bank`, and the
  simple chains were noted by their coordinates in the solving frame, so every deck stayed level without an error
  (A2: 144 m over 0.5 G in the lanes instead of 51, the 4.3 km bridge's start 2.65 G at the edge of the lane). Now the
  simple chains are noted by their ends' lat / lon (process-wide, `_simple_add`), and the view has `deck_bank`
  (`BridgeProfiles.deck_bank` in its frame). Measured: A2 back to 1.7.1's values (26 / 51 m, 3.19 G).
- **Proven:** computed for the A2 at 6760 m: graded follows the lidar across both carriageways to ~5 cm, the step at
  the middle is gone. Driven on the A2: the first measurement across (two points) hit the embankment at the end of the
  4.3 km bridge and tipped the road by 8 % (a crash at a hard edge); since then it measures 5 points across and drops
  implausible values. After that the opposite bridge and the road there are 2–4 cm apart instead of 0.8 m.
- **Single bridges and twin bridges only** (`roads._simple_chain`: one part, or two opposing ones without a shared
  end): a junction bridge with ramps keeps BeamNG.Earth's flat decks; tilted piece by piece the Graz bridge fell apart
  into edges.
- **Tests:** `test_grading.LidarBankTest`, `test_roadmesh.DeckTiltTest`.
- **Limits:** other road classes stay flat across. Piers and poles on bridges are not tilted. At the joint of two
  bridge parts with different slopes a small offset may remain at the edge.

## P8 A bridge deck meets its approaches with their gradient

- **Problem:** BeamNG.Earth lets a deck start up to `CHORD_KINK` (2 %) off its approach's gradient, more in curves. A2
  near Völkermarkt: 1662 m −0.5 % onto +1.5 %, 3668 m +2.6 % onto +5.5 %; at 250 km/h 4–10 G, the car took off and hit
  the median barrier.
- **Rule:** On lidar a deck between two approaches is laid as a cubic curve between their end heights that has the
  approach's gradient at each end (measured `TANGENT_AT_M` 4–16 m before it). It may sink at most `TANGENT_DROP_M`
  0.3 m below BeamNG.Earth's solution, else that one stays (a clearance it needs). If the middle has to stay (a span
  over a road), only the ends are matched over `TANGENT_END_M` 15 m. Single bridges and twin bridges only
  (`_simple_chain`, like P7).
- **Code:** `roads.py`: `TANGENT_*`, `tangent_profile`, `tangent_ends`, `_simple_chain`, `_deck_key`,
  `BridgeProfiles._tangent`, the call at the end of `BridgeProfiles._solve` (since 1.7.2 before their `_observed`
  measured heights; their shortcut `return final` holds the solve from before the tangent, so it only runs without
  P8).
- **Proven:** A2 measured (with P9 and P10): 3.7 km bridge, approach 1.6 → 1.0 G, exit 0.56 → 0.32 G at 100 km/h;
  driven afterwards. Without P10, P8 hardly works (the ground under the bridge end held the deck flat).
- **Tests:** `test_roads.TangentProfileTest`.

## P9 No junction into the parallel opposite carriageway

- **Problem:** `snap_junctions` (since 1.7.1) takes a road end lying beside another road for a junction and pulls it
  to that road's height. A2 at 3.7 km: the 19 m piece of the approach behind the bridge took the height of the opposite
  carriageway 10 m beside it, 0.35 m higher on a 4.5 % cross slope, a hump 40 m behind the bridge (5 G at 250 km/h, the
  car was launched there).
- **Rule:** An end beside a road of the same class that runs parallel within `JUNCTION_PARALLEL_DEG` 25° (not at its
  ends) is no junction: it is the other carriageway of a dual road.
- **Code:** `grading.py`: `JUNCTION_PARALLEL_DEG`, `_parallel_at`, the check in `snap_junctions`.
- **Proven:** A2 measured: the hump behind the 3.7 km bridge is gone, the approach follows the lidar to ±6 cm; driven
  afterwards.
- **Tests:** `test_grading.JunctionTest.test_the_other_carriageway_beside_it_is_no_junction`.

## P10 The terrain continues under the bridge end with the approach's gradient

- **Problem:** A road's plan ends at the abutment; grading keeps the end height flat beyond it (`grade_points`).
  BeamNG.Earth's deck stays above that ground, so it ran flat away from the abutment and kinked onto the approach's
  gradient there (A2: 2–3 %, 4–10 G at 250 km/h). A deck after P8 dipped below that ground and was dropped.
- **Rule:** On lidar the plan continues `UNDER_DECK_M` 6 m under the deck, with the gradient of its last
  `UNDER_DECK_GRADE_M` 10 m and `UNDER_DECK_DROP_M` 0.1 m (plus gradient times half width) below. Only at a bridge part
  where no other part ends (`Grader._simple_abuts`): under a junction bridge the ramps' extensions crossed, and the Graz
  bridge over the Weblinger Gürtel got a 6 G kink.
- **Code:** `grading.py`: `UNDER_DECK_*`, `_under_deck`, `_plan(…, under_deck)`, `Grader._simple_abuts`, the call in
  `Grader._make_cell`.
- **Proven:** A2 measured: only with it does P8 work at all bridges (values there). Graz: 1.8 G on the bridge instead of
  6.4 G, since P10 only at simple bridge parts.
- **Tests:** `test_grading.UnderDeckTest`.

## P11 A short tunnel with ground above stays a tunnel

- **Problem:** New in 1.7.1 (`gradesep.py`, BeamNG.Earth GitHub #450): when a road is mapped in OSM as a short tunnel
  (under `SHORT_ROAD_TUNNEL_M` 80 m) with less than `UNDERPASS_COVER_M` 12 m of ground above, BeamNG.Earth builds it
  open and the road above as a bridge. Graz, Triester Straße over the Weblinger Gürtel (route ~940–985 m): 1.7.0 left
  it at 346.4 m on the ground, the Gürtel in the tunnel below. 1.7.1 makes a junction bridge out of it up to 1.3 m above
  the lidar height, with edges up to 1.5 m and concrete in the lanes. The same in the original BeamNG.Earth 1.7.1
  (checked in BeamNG.drive).
- **Why not simply off:** with `BNE_GRADESEP=off` Graz was flat, but on the A2 at 3.7 km the bridge disappeared (the
  road below is also a short tunnel, the A2 has no bridge tag) and the A2 fell 6 m into the cutting: −30 G measured,
  driven as a hole.
- **Rule:** On lidar (not `railways._coarse_here`) the limit is `LIDAR_COVER_M` 3 m instead of 12 m. The lidar removes
  bridges from the ground: under a real bridge there is hardly any ground above the tunnel (A2: 0.4 m above the
  portals), above a covered underpass there is (Graz: 6.4 m). With 3 m of ground or more it stays a tunnel.
- **Code:** `gradesep.py`: `LIDAR_COVER_M`, `_underpasses` (the loop at the end).
- **Proven:** built and measured: Graz 750–1050 m no edge from 5 cm to 1.5 m (before 329, 215 of them in the lanes);
  A2 as before P11, the 3.7 km bridge there; Stausee unchanged (no short tunnel). Driven: Graz with the underpass as a
  tunnel (good), and the A2 with `BNE_GRADESEP=off` (hole).
- **Limits:** measured at these places only; cases with 2–4 m of ground are untested. Where a lidar leaves a bridge
  standing in the ground, it becomes a tunnel (the road above stays at the right height).
- **Tests:** `test_gradesep.UnderpassTest.test_a_short_tunnel_under_lidar_ground_stays_a_tunnel` (a tunnel with
  lidar, a bridge with the coarse model). The other `test_gradesep` tests keep testing BeamNG.Earth's rule.

## P12 Junction pads only at junctions

- **Problem:** New in 1.7.2 (`roads.deck_pads`, for North Charles Street over I-83): where deck parts meet, or a ground
  road goes on from a deck's end, at more than ~14° (`PAD_STRAIGHT_COS`), the convex hull of their carriageways within
  12 m is paved, 6 cm under them (`roadmesh.PAD_DROP`), colliding, and the decks' parapets stop inside it. That also
  hits every bridge in a bend onto its own approach. Großglockner road over the Rossbach (13 m, Heiligenblut, route
  1642–1658 m): a 24 m plate under deck and road (a dark plate over the grass beside the road, overlapping surfaces)
  and no parapets on the bridge.
- **Rule:** a pad only where 3 or more carriageways meet (a junction: a ramp leaving, a street turning off). Two are one
  road going on, at any angle: no pad, as in 1.7.1. The rest of BeamNG.Earth's pad (hull, rim railings, parapets
  stopping) is unchanged.
- **Code:** `roads.py`: `PAD_JUNCTIONS_ONLY`, `deck_pads` (the parts' count).
- **Proven:** Rossbach test tracks (2026-10-31): with P12 the driving surface equals 1.7.2 with `BNE_DECK_PADS=off` and
  1.7.1, the plate is gone, the parapets are back. Driven without pads: good. The bumps left at the Rossbach bridge
  (the graded ground flattening before the deck, the hump at the deck's middle node) were already there in 1.7.1.
- **Limits:** a joint of two deck parts in a bend leaves the wedge open as in 1.7.1.
- **Tests:** `test_deckjoins.JunctionPadTest.test_bend_onto_its_own_approach_none`; the other `JunctionPadTest` tests
  (3 carriageways) keep testing BeamNG.Earth's pad.

---

## Known test failures

`test_otto_bridge` (I-80 over Otto Road, Wyoming) fails 3 times with our patches and passes without them (measured with
one patch off at a time):

| Check | With patches | Cause |
|---|---|---|
| `test_girders_clear_the_full_width_of_otto_road` | 3.88 m < 6 m | P2 (Otto Road not dug) |
| `test_real_spans_meet_approaches_without_clearance_crests` | 0.112 m > 0.10 m | P2 |
| `test_connected_lower_road_and_junctions_stay_drivable` | kink 4.2 % > 3.5 % | P1 (with P2 off: 5.7 %) |

Open: turn our patches off in the Otto test so it tests BeamNG.Earth's behaviour. (The two `test_roadmesh` failures
caused by P3 are fixed: those tests run on the coarse model, P3 has a test of its own.)

`test_deckjoins` fails 3 times (`EndJoinTest.test_branch_joins_the_viaduct`, `EndJoinTest.test_was_a_cliff_without_it`,
`GroundGapTest.test_gap_is_deck`), already on 0.4 before P12 (found 2026-10-31); which patch, if any, causes them is
not checked yet.
