# Extending Assetto Corsa

## Retired AI and A–B race finishers

AC returns a retired opponent to its pit. On Map2Lap tracks that position also belongs to the grid.
An active opponent can stop behind the retired car even after the track script hides it and disables
collisions. The race still needs to count the retired car as a DNF.

The track script waits for an AI opponent to have both `isRetired` and `isInPit` during an offline Race.
With CSP track physics enabled and the
Map2Lap parking node present, it calls `physics.teleportCarTo(i, 'TIME_ATTACK')` once per retirement.
AC resolves that spawn to `AC_TIME_ATTACK_0` and keeps `isRetired` set. Leaving the pit clears
`isInPit`. In the coordinate-based teleport experiments the cars lost their retired state and returned
to the track. The observed difference depends on the transport call. The native plugin trial used the
same spawn call from Lua. [Runtime logic](../src/track/retired_cars.lua)

On an A–B Route, classified AI opponents can block the timing gate as the field queues behind them.
During an offline Race, the same script checks for the finish gate, `isRaceFinished` and a counted lap.
It sends each finisher to its own pit once and parks its AI inputs until the session restarts. The gate
and race checks also apply on tracks without a separate DNF parking model. The player keeps driving.

A build or Editor save can add a small model called `map2lap_dnf.kn5`. On an older installation,
Map2Lap prepares it on the next Race with AI. The model list loads it alongside the main track and any
Map2Lap legacy timing model. All parked opponents share one point. The placement search samples solid
grass or bare terrain, checks the centre and corners of a six-metre square for level ground and avoids
road meshes, obstacles, grid slots and the AI line. Water, steep mountainsides and narrow bridge corridors
can leave no suitable point. In that case the existing hide-and-disable-collision behaviour still applies
on tracks with the retirement script. Custom model lists, custom retirement scripts and existing Time
Attack spawns take precedence. [Installation and placement](../src/track/dnfparking.py)

Practice, Hotlap, Race starts and returning to pits use their usual spawn nodes. A separately configured
AC **Time Attack** session on a track with the extra model can use the new off-road spawn. Map2Lap's
Play menu offers Practice, Hotlap and Race. The retirement move runs only during an offline Race.

## A native Windows plugin alongside CSP

AC loads the shipped Windows x64 `map2lap.dll` from `assettocorsa/plugins/` on Windows and under Proton.
Play installs or updates it before a Race and enables one `map2lap.dll=1` entry under `[PLUGINS]` in
`plugins/plugins.ini`. Installation preserves the other entries and skips changes while AC is running.
A plugin installation error lets Play continue. The DLL marks a recovered opponent as retired. The track Lua script and
parking model handle its placement. [Plugin installer](../src/app/acplugin.py)

| C export | Purpose |
| --- | --- |
| `bool acpGetName(wchar_t *name)` | Write a short, null-terminated name for AC's log. |
| `bool acpInit(IACPPluginHost *host)` | Set up plugin resources once. |
| `bool acpUpdate(const ACCarState *player, float dt)` | Receive player telemetry and the update interval. |
| `bool acpShutdown(void)` | Release resources when AC closes the plugin. |

Each feature registers its gate, start, stop and status with the ACP callbacks. AC logs the plugin name
before calling `acpInit`. In `Documents/Assetto Corsa/logs/log.txt`, `Map2Lap green=pending` means the
session passed the initial gate. Init checks again and reports `active` through subsequent calls to
`acpGetName` after applying each eligible feature. Each feature reports its own `off:` reason. Shutdown
restores its original instructions after verifying the current bytes.
[ACP entry points](../native/acplugin/plugin.c) · [Green clock](../native/acplugin/green_clock.h)

### A–B race time from green

The DLL reads the current user's `cfg/race.ini` in AC's Documents folder on every session load.
Activation requires all of the following conditions.

- `[RACE] TRACK` names one track folder under `content/tracks` beside the running game. Its
  `data/map2lap.json` is a readable JSON object. A Route can omit `kind` (older builds) or set it to
  `"route"`. Its top-level `area` is absent or null. Circuit, Area and malformed metadata close the gate.
- `[SESSION_0] TYPE=3`, `[REMOTE] ACTIVE=0` and `[REPLAY] ACTIVE=0` are explicit. At least one of
  `[SESSION_0] LAPS` and `[RACE] RACE_LAPS` must be present and every supplied count must be `1`.
- The loaded `acs.exe` matches the supported PE header offset, timestamp, image size and CodeView GUID
  and age. The 476-byte `TimeTransponder::step` fingerprint and the original 25 CLOCK bytes must match.

Play, Content Manager and other launchers use the same checks. CM's Quick Drive INI test mode retained
a previous custom INI key through both a Practice and a Race start. Session eligibility is therefore
determined directly from AC's settings and the selected track. [Route metadata reader](../native/acplugin/route_json.h)

**Executable and symbols.** The matching Kunos `acs.pdb` lies beside `acs.exe` in the Steam installation
(CodeView GUID `9BEE7421-88FE-47C4-B56C-15496409A8DE`, age 47). Disassembly shows that the stock clock
adds 3 ms per executed physics step. When physics falls behind, `PhysicsDriveThread::run` advances the
simulation clock past the backlog. The step counter misses that time. In a one-lap A–B Race the plugin
replaces the counter at RVA `0x29138F` with `physicsTime [rcx+0x20] − startTimeMS [rcx+0x178]`, in
milliseconds. AC retains its normal zeroing at `0x291313` and `0x2913C1`. The next step measures time
from the common green again, and gate B records the latest value.

**Measured in AC under Proton.** With the earlier step-counting prototype on Heiligenblut the official
times were 2.608–2.645 s short. The log recorded two clock resets. Telemetry estimated 27.60 s of vehicle
movement in 30.22 s elapsed. The individual reset durations were not measured. On rebuilt Drau, stock
timing placed 2 of 17 finishers correctly. CLOCK alone placed 18 of 18 correctly.

The shipped DLL was observed active in a one-lap Drau Race both through the measurement tool and through
Content Manager Quick Drive. Each classified all 18 AI in observed finish order. Maximum absolute timing
differences were 8.55 ms and 9.60 ms respectively, measured from the interpolated CSP countdown zero to
the first finish flag with one counted lap. Play also installed a missing DLL and launched an 18-opponent
Race with the correct finish order and a maximum difference of 11.51 ms. In a stock Magione Race, a
Drau Hotlap and a two-lap Drau Race,
all 476 timer bytes matched the original after initialization. The simulated host also exercises online,
replay, conflicting counts, differing image/code bytes, a failed write, rollback and shutdown.

### AI retirement on rollover recovery

In an offline Race on a Map2Lap Route or Circuit, the DLL marks an AI opponent as retired when AC
recovers it to its pit. The DLL accepts any lap count for this feature. Areas, replays, online sessions,
other session types and tracks without valid Map2Lap metadata close its gate. The clock and rollover
checks run independently. A two-lap Circuit can report `green=off: laps rollover=active`.

**Read in the matching AC symbols and executable.** After green, `RaceManager::update` calls
`resetInvalidStateCarsToPits` at RVA `0x141656`. The stock function iterates the whole field, including
the player. It accumulates time while fewer than two wheels carry load and requests the `PIT` spawn
when the individual recovery timer expires. `AUTOFLIP_RECOVERY: 1` records the setting at startup.
The stock recovery branch also logs `INVALID STATE RESET`. The ESC menu, wrong-way handler and UDP
command listener have independent PIT calls. CSP's configuration also describes stuck-AI and damage
teleports (`STOP_TELEPORTING_STUCK`, `TELEPORT_WITH_DAMAGE`). A separate stuck-only incident was
not reproduced.

**How the DLL identifies the recovery.** CSP 0.2.11 redirects the entry to the stock recovery
function. Both paths still reach `CarAvatar::goToSpawnPosition`. The plugin checks the 39 bytes
at RVA `0x0D3B34` there, the recovery call instruction and AC's own write to `Car::isRetired` in
`AIDriver::acquireControls` at RVA `0x29C1A6`. With the supported executable loaded, it checks
the PIT spawn name, the avatar's AI state and a nonzero physics car ID. Windows stack unwinding must
find the return address of the recovery call. On a match the DLL sets the same physics flag and
completes the usual PIT move. All other spawns follow their original fuel-lap and position handling.
CSP exposes the flag as `car.isRetired`. The existing track script can then move the retired car
from its pit to `AC_TIME_ATTACK_0`. [Rollover implementation](../native/acplugin/rollover.h)

**Measured under Proton with CSP 0.2.11.** In a one-lap Drau Race, the instrumented AI lay on
its roof until its recovery timer expired. At its PIT call the timer read 5.006 s against a 5.000 s
limit and the recovery return address was on the stack. With the clock-only DLL, it returned to
the race and completed a lap. With rollover enabled it arrived in the pit with R, transferred to
the parking node and completed zero laps. The five finishers matched observed finish order, with
a maximum difference of 8.37 ms from green. The retired car remained parked until the last finisher.
AC subsequently returned it to the pit during session teardown, still retired. AC's
`race_out.json` lists lap totals and classification order. It puts the retired car behind the
finishers without a literal DNF field.

In a two-lap Klagenfurt Circuit Race the rollover feature was active and all 476 clock bytes were
stock. The same AI reached the parking node and was classified with zero laps behind all five
two-lap finishers, in their observed finish order. Both races ended normally with the retired flag
still set. In a stock Magione Race both features reported `off: track`. In a Drau Hotlap both
reported `off: session`. In each control the loaded 39 spawn bytes and all 476 clock bytes matched
the executable after plugin initialization.

Run `python tools/ai_race.py start drau_bruecke_test --laps 1 --opponents 6 --rollover-ai 5` to
repeat the physical rollover. The option applies roll torque to the selected opponent in the temporary
measurement script. Telemetry records orientation, wheel loads, pit and retirement flags and position.
CSP documents that applying force can invalidate the current lap. The clock-only control demonstrated
that the recovered opponent could drive out and record a lap. The tool checks for a physical rollover
in the selected car's telemetry and restores the track configuration on exit.

### Removal

To remove the installed plugin, close AC and run `python tools/ac_plugin.py remove` from the repository
with the project Python. For an archive installation, delete the `map2lap.dll` line in the `[PLUGINS]`
section and the file `plugins/map2lap.dll` while AC is closed. The next Race launched via Play installs it
again. [Release build and receipt](release.md)

## Opponent telemetry in the parking prototype

The DNF prototype needed opponent telemetry. A CSP Lua app supplied the AI, retired, pit and finish
flags through a named shared-memory mapping. The DLL selected opponents, and the track script checked
each selected car again before requesting its move. The prototype's 32-bit selection mask covered slots
0–31. Future features supporting larger grids need a wider representation. A plugin that only consumes
telemetry can omit the optional GUI and controls exports. The shipped plugin leaves player input with AC.

## How race opponents choose their spacing

The stock Windows x64 executable and matching Kunos symbols (GUID and age above) distinguish driving
alongside a car, finding room to pass it and braking behind it. The shipped DLL registers the green
clock and rollover features. Map2Lap's Race launcher supplies strength and aggression per opponent.

| Stock executable RVA | Calculation |
| --- | --- |
| `0x26D63D` | Select the wider axle track and assign `Car::carHalfWidth`. |
| `0x29D3E0` | `AIDriver::getEngagedDesiredOffset`, the lateral target alongside another car. |
| `0x29F8D0` | `AIDriver::stepCarsAwareness2`, opponent positions, time to impact, passing and brake obstacles. |

### Alongside and passing

AC derives `Car::carHalfWidth` from half the wider of the two axle tracks plus 0.30 m. The width
assignment calls `RaceEngineer::getFrontTrack` and `getRearTrack`. For the BMW M3 E30 DTM the
suspension file gives 1.438 m front and 1.440 m rear, hence an AI half-width of 1.020 m.
The car's collider mesh measures 1.718 m across and 4.364 m long.

`AIDriver::getEngagedDesiredOffset` uses a one-sided reference separation of
`3 × carHalfWidth × (1 + 0.03 × max(0, eng_speedL, eng_speedR))`. The two speed inputs come
from signed relative motion across the car in m/s. A neighbour closing sideways increases the
reference. At zero sideways closing speed, two parallel BMWs have a reference of 3.06 m between
their origins, about 1.34 m between their collider envelopes. With engaged cars on both sides, a
separate branch aims halfway between them. Available road width also bounds the steering target.

`AIDriver::stepCarsAwareness2` separately uses `2.5 × carHalfWidth` to plan an overtake.
One branch compares the room on either side and proposes an offset from the opponent's line of
`1.5 × 2.5 × carHalfWidth` (3.825 m on this BMW). Another checks whether neighbouring cars
already occupy that space. To accept this candidate, the available room on the chosen side must
exceed `2.5 × carHalfWidth × (1 + 0.2 × nearby opponents ahead)`, with enough time for the
lane change. With one opponent ahead that is 3.06 m for this BMW. A centred opponent on a
symmetric 6 m corridor offers only 3 m per side. A change to the factor 3 alone would target
the alongside manoeuvre.
The stock code reads the passing car's width here, which matters with a mixed grid.
[Track-side passing limits and danger zones](ac-rules.md)

### Following and braking

`AIOpponentData::dist_front` is the difference in forward spline position converted to metres.
When the opponent is physically ahead and the follower is faster, the stock awareness code
calculates `tti = max(0.01 m, dist_front − 6 m) / (own speed − opponent speed)` with speeds in m/s.
For example, at 16 m separation and a 5 m/s closing speed this gives 2 s. At equal speed this
branch uses a 100 s fallback. The code also tests a distance derived from
`(8 + 0.07 × own speed in m/s) × (1 + 0.05 × nearby opponents ahead)`. The count uses a forward
spline window of `20 + 0.2 × own speed in km/h` metres. Later branches can add a power-class
adjustment and use the available passing space and time to impact to choose a response.
Two paths populate an `AIBrakeObstacle` with the opponent's speed and `dist_front − 7 m` or
`dist_front − 8 m`. These distances feed the brake planner. Actual bumper clearance depends on
the manoeuvre, car geometry and relative speed.

CSP 0.2.11 exposes `physics.setAICaution(carIndex, caution)` in a physics-enabled track script.
Its documented range is 0–16, default 1, and the SDK calls it experimental. The value has no
documented conversion to metres or seconds. The spline-offset setters move an individual car's
target laterally along the track. A change to the stock pairwise clearance belongs in the
alongside or passing calculation in the DLL. Both remain candidates for a native trial.
[CSP SDK and installed track-script definitions](https://github.com/ac-custom-shaders-patch/acc-lua-sdk)

### Drau spacing measurements

Four offline races on the same Drau AI line used 18 BMW M3 E30 DTM opponents, strength 95%,
aggression 50% and CSP 0.2.11 under Proton. A temporary track script called `setAICaution`
once per opponent and logged the successful call. Each row gives the median distance between
car origins in the qualifying telemetry samples for one race.

| Run order | Caution | Alongside, lateral | Following, longitudinal | Distinct AI pairs with recorded contact |
| --- | ---: | ---: | ---: | ---: |
| 1 | 1.0 | 3.05 m | 18.65 m | 0 |
| 2 | 0.5 | 3.07 m | 18.37 m | 2 |
| 3 | 0.5 | 3.11 m | 25.74 m | 0 |
| 4 | 1.0 | 3.10 m | 13.35 m | 0 |

Sampling targeted 8 Hz. Analysis began five seconds after the first opponent reached 5 km/h.
Both cars had to be racing at 40 km/h or more, within 8° of parallel and within 2 m vertically.
Distances were projected onto the car's horizontal heading and side axes. Alongside pairs had at
most 1 m longitudinal stagger and 5 m lateral separation. Following used the nearest eligible car
ahead within 30 m and 0.75 m lateral separation, with a speed difference of at most 5 km/h.
For parallel BMWs, subtract 4.36 m from longitudinal separation to estimate bumper clearance.
The lateral medians are close to the stock reference; Drau also starts cars in columns 3 m apart.
The two repetitions at each caution value show substantial variation in following distance.
A conversion from caution to bumper gap would need a paced leader and repeated following
on the same stretch at the same speeds.

## Measuring a change

Run `tools/ai_race.py start <track> --opponents 18 --laps 3 --car bmw_m3_e30_dtm` on a test track.
For each retired car, follow its ID from the first DNF sample through the last covered sample. Check
world position and `isRetired` after arrival, then look for active opponents crossing the cleared slot
in the same lane at speed. Use the report's coverage and the final telemetry marker to bound the claim.
A native trial also needs evidence that AC loaded the intended DLL and ran its update callback.

`--dll-probe` enables the DLL's read-only probe through a `[MAP2LAP_PROBE] ACTIVE=1` entry in `race.ini`.
It writes `Documents/Assetto Corsa/logs/map2lap_probe.txt` at Init and 0, 3, 15, 45 and 90 s after the first
update. `site` lines compare 16 live bytes at the stock AI function entries and candidate constants with the
stock executable; `DIFF` marks a hook by CSP or another mod. `car` lines follow `ACPlugin+0x68` (player car)
to `PhysicsEngine::cars` and, for each stock `AIDriver`, log CSP's byte at `AIDriver+0x384` with aggression,
target speed, offsets and the push factors. With `--caution` this shows whether `setAICaution` writes that byte.
[Probe](../native/acplugin/probe.h)
[Race measurement tool](../tools/README.md)
