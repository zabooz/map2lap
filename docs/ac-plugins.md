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
A plugin installation error lets Play continue. The retirement feature ships separately as Lua and a
track model. [Plugin installer](../src/app/acplugin.py)

| C export | Purpose |
| --- | --- |
| `bool acpGetName(wchar_t *name)` | Write a short, null-terminated name for AC's log. |
| `bool acpInit(IACPPluginHost *host)` | Set up plugin resources once. |
| `bool acpUpdate(const ACCarState *player, float dt)` | Receive player telemetry and the update interval. |
| `bool acpShutdown(void)` | Release resources when AC closes the plugin. |

Each feature registers its gate, start, stop and status with the ACP callbacks. AC logs the plugin name
before calling `acpInit`. In `Documents/Assetto Corsa/logs/log.txt`, `Map2Lap green=pending` means the
session passed the initial gate. Init checks again and reports `active` through subsequent calls to
`acpGetName` only after writing the clock. An `off:` reason identifies a failed check. Shutdown restores
the original instructions after checking the installed bytes still belong to this feature.
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

To remove the installed plugin, close AC and run `python tools/ac_plugin.py remove` from the repository
with the project Python. For an archive installation, delete the `map2lap.dll` line in the `[PLUGINS]`
section and the file `plugins/map2lap.dll` while AC is closed. The next Race launched via Play installs it
again. [Release build and receipt](release.md)

The DNF prototype needed opponent telemetry. A CSP Lua app supplied the AI, retired, pit and finish
flags through a named shared-memory mapping. The DLL selected opponents, and the track script checked
each selected car again before requesting its move. The prototype's 32-bit selection mask covered slots
0–31. Future features supporting larger grids need a wider representation. A plugin that only consumes
telemetry can omit the optional GUI and controls exports. The shipped plugin leaves player input with AC.

## Measuring a change

Run `tools/ai_race.py start <track> --opponents 18 --laps 3 --car bmw_m3_e30_dtm` on a test track.
For each retired car, follow its ID from the first DNF sample through the last covered sample. Check
world position and `isRetired` after arrival, then look for active opponents crossing the cleared slot
in the same lane at speed. Use the report's coverage and the final telemetry marker to bound the claim.
A native trial also needs evidence that AC loaded the intended DLL and ran its update callback.
[Race measurement tool](../tools/README.md)
