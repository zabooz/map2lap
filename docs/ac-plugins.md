# Extending Assetto Corsa

## Retired AI on Map2Lap tracks

AC returns a retired opponent to its pit. On Map2Lap tracks that position also belongs to the grid.
An active opponent can stop behind the retired car even after the track script hides it and disables
collisions. The race still needs to count the retired car as a DNF.

The track script waits for an AI opponent to have both `isRetired` and `isInPit` during an offline Race.
It skips replays, the player and cars that finished normally. With CSP track physics enabled and the
Map2Lap parking node present, it calls `physics.teleportCarTo(i, 'TIME_ATTACK')` once per retirement.
AC resolves that spawn to `AC_TIME_ATTACK_0` and keeps `isRetired` set. Leaving the pit clears
`isInPit`. In the coordinate-based teleport experiments the cars lost their retired state and returned
to the track. The observed difference depends on the transport call. The native plugin trial used the
same spawn call from Lua. [Runtime logic](../src/track/retired_cars.lua)

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

For a feature that needs a native component, AC has its own plugin loader. The tested arrangement places
a Windows x64 DLL in `assettocorsa/plugins/`. AC loads it from `plugins/plugins.ini`. CSP keeps its
normal installation by `acs.exe`. The track retirement feature ships as Lua and a track model.

| C export | Purpose |
| --- | --- |
| `bool acpGetName(wchar_t *name)` | Write a short, null-terminated name for AC's log. |
| `bool acpInit(IACPPluginHost *host)` | Set up plugin resources once. |
| `bool acpUpdate(const ACCarState *player, float dt)` | Receive player telemetry and the update interval. |
| `bool acpShutdown(void)` | Release resources when AC closes the plugin. |

The minimal example treats both host pointers as opaque. Save it as `Map2LapExample.c`.

```c
#include <stdbool.h>
#include <stddef.h>

#define EXPORT __declspec(dllexport)
typedef struct IACPPluginHost IACPPluginHost;
typedef struct ACCarState ACCarState;

EXPORT bool acpGetName(wchar_t *out) {
    const wchar_t *name = L"Map2Lap example";
    while ((*out++ = *name++)) {}
    return true;
}
EXPORT bool acpInit(IACPPluginHost *host) { (void)host; return true; }
EXPORT bool acpUpdate(const ACCarState *player, float dt) {
    (void)player;
    (void)dt;
    return true;
}
EXPORT bool acpShutdown(void) { return true; }
```

Build in a Visual Studio x64 Native Tools prompt and check that the four names above appear as
undecorated exports.

```bat
cl /nologo /std:c11 /O2 /LD Map2LapExample.c /link /OUT:Map2LapExample.dll
dumpbin /exports Map2LapExample.dll
```

On Linux the same freestanding example also builds with Clang and LLD.

```sh
clang --target=x86_64-pc-windows-msvc -O2 -ffreestanding -c Map2LapExample.c -o example.obj
lld-link /dll /noentry /nodefaultlib /machine:x64 /out:Map2LapExample.dll example.obj
```

With AC closed, copy the DLL to `plugins/` and add `Map2LapExample.dll=1` under the existing
`[PLUGINS]` section of `plugins/plugins.ini`. Launch AC and look for
`ACP PLUGIN: Map2Lap example` in `Documents/Assetto Corsa/logs/log.txt`. A diagnostic counter
in `acpUpdate` can confirm that the update callback runs. Close AC before removing the example DLL
and its INI entry. Distribute a compiled DLL with any future native feature and register its own
entry when installing it.

The DNF prototype needed opponent telemetry. A CSP Lua app supplied the AI, retired, pit and finish
flags through a named shared-memory mapping. The DLL selected opponents, and the track script checked
each selected car again before requesting its move. The prototype's 32-bit selection mask covered slots
0–31. Future features supporting larger grids need a wider representation. A plugin that only consumes
telemetry can omit the optional GUI and controls exports. The example leaves player input with AC.

## Measuring a change

Run `tools/ai_race.py start <track> --opponents 18 --laps 3 --car bmw_m3_e30_dtm` on a test track.
For each retired car, follow its ID from the first DNF sample through the last covered sample. Check
world position and `isRetired` after arrival, then look for active opponents crossing the cleared slot
in the same lane at speed. Use the report's coverage and the final telemetry marker to bound the claim.
A native trial also needs evidence that AC loaded the intended DLL and ran its update callback.
[Race measurement tool](../tools/README.md)
