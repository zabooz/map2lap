# Weather preview

Versioned public-CSP rain/snow prototype and helpers for the existing `heiligenblut_test`
track. The shipped source `assets/weather/weather.lua` batches up to 8,192 rain/snow particles into one dynamic mesh
with custom HLSL, native weather selection and actual CSP wind. A depth-aware
distance veil and ground splash crowns complement native WeatherFX fog.
It requires no RainFX or custom DLL. The experimental windscreen overlay is kept
behind `WINDSCREEN_ENABLED = false`: no car-mesh lookup or overlay draw occurs by default.

Run these commands from the worktree root, using the main checkout's existing Python
environment if this worktree has no `.venv`:

```powershell
<python> tools/weather_preview/update.py --check  # read-only session/hash check
<python> tools/weather_preview/update.py          # hot-reload this worktree's Lua
<python> tools/weather_preview/run.py --mode auto # follow current native weather
<python> tools/weather_preview/run.py --mode rain # diagnostic particles only
<python> tools/weather_preview/run.py --mode snow
<python> tools/weather_preview/run.py --mode off
<python> tools/weather_preview/run.py             # launch only after prior cleanup
```

`run.py --help` and `update.py --help` describe the command options. The native
weather, fog and wind controls are in **CSP Debug > Weather**. The helper's `fog`,
`wind` and `direction` modes only open that app. Manual precipitation resets at the
next native weather-type change; `auto` explicitly returns to current conditions.

## Shared runtime

`context.py` finds the main checkout through Git's common directory. Source is read
from this checkout's `assets/weather/`; runtime files stay in the main checkout's ignored
`out/weather-probe/`. That includes `session.json`, backup manifests, update
receipts, screenshots and logs. The existing personal AC setting is read from the
main checkout without copying it into the worktree or committing it. The launcher enables
debug keys, mode-file polling and messages only in its temporary configuration.

All worktrees share one installed AC script and one preview session. Use one writer.
Read `session.json` and check its process before launching or updating. Keep the
original waiting launcher alive: it restores race/video/track configuration when
the game exits. Hot reload creates hidden exact-process/hash cleanup watchers.
Inspect both `session.json` and `updated-cleanup.json` after exit, preserving any
independent changes and resolving conflicts from the recorded backups.

The updater ignores receipts for other PIDs. A new launcher also recognises the
current session's updated script hash during cleanup. The original already-running
launcher remains unchanged, so its existing update watchers must finish as well.

Screenshots go to the shared runtime directory:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/weather_preview/ac_window.ps1 -Action capture -Name comparison.png
```

`capture` requires AC in foreground. `focus-capture` activates only the owned AC
window. Read the script for input actions; coordinates are window-relative and can
be stale after the user moves/resizes the window. Inspect images, not just logs.

## Baseline and iteration

Public CSP 0.2.11/build3465 was verified. Its RainFX module is unavailable; our own
particles work independently. Native `rainIntensity` stayed zero in rainy weather,
so the script derives fallback density from native weather types. Track scripts
cannot use the global weather-debug connection available to Lua apps.

Shelter uses a 7 x 7 grid of 4 m vertical columns, sampling downward from 60 m above
the camera. Two cheap collision-mesh samples update each frame; one full-track
sample updates every fourth frame. Each channel replaces its previous answer,
including misses. Columns reset across vertical bands and coordinate changes.
This finds roofs, bridge decks and tunnel covers, including stacked decks, but
remains an approximation at edges and for wind blowing in from the side. Unknown
columns initially allow particles. Covers more than 60 m overhead are outside its range.

There are no wet-road reflections, snow accumulation or vehicle-physics changes.
The disabled windscreen experiment has no refraction, wiper clearing or established
support across different cars. It is retained for later work.

`os.preciseClock()` measures CPU build/upload submission; it does not measure GPU
execution. `avg_fps` covers a five-second frame interval. Neither value substitutes
for a controlled moving-car/GPU benchmark. Extra diagnostic track rays and car-mesh
enumeration have been removed from the normal preview.

Compare `rain-visible-v3.png` and `snow-visible-v3.png` in the shared runtime with
`invisible-look-v2.png`: raw scene-linear lighting and subpixel transparent sprites
made v2 invisible despite successful shader compilation.

For this prototype the user explicitly authorises iteration commits with
`git commit --no-verify` and waives test-writing/TDD requirements. Keep commits
focused on rendering improvements. Actual AC inspection and bounded performance
comparisons remain necessary. Targeted regression tests cover weather-mode changes,
shelter/cache behaviour, finite particle geometry and reversible session files.

## Targeted checks

The optional LuaJIT runtime is installed into ignored output only; it is not an
application dependency. From the main checkout, install it with:

```powershell
<python> -m pip install --only-binary=:all: --target out/weather-lua-tests lupa==2.8
```

Set `MAP2LAP_LUA_TESTS` to that absolute directory, then run from the checkout or worktree:

```powershell
<python> tools/check.py test_weather_preview
```

Without the optional runtime, the Lua cases are explicitly skipped; the Python
session-file tests still run. The Lua cases execute the actual script in LuaJIT
with a small graphics host. They verify state and geometry, not HLSL compilation,
real raycast hits, appearance or GPU performance; those require actual AC inspection.

## Reusable CSP findings

- Track scripts can update raw vertex buffers and submit a batched `render.mesh`.
- Custom HLSL and a depth-aware `render.fullscreenPass` work on public 0.2.11.
- `ac.findNodes` can inspect car meshes/materials and redraw matching meshes.
  `PosC` in the tested mesh pass is world-oriented and camera-relative; car basis
  vectors provide local coordinates. Other passes/cars need their own verification.
- Collision-mesh rays were substantially cheaper than full-track rays on Heiligenblut.
- Track scripts, Lua apps and weather controllers have different access/IPC scopes.
- The dynamic nodes use `keepAlive=false`, so CSP removes them on script reload.

Consult the installed SDK first (`extension/internal/lua-sdk/ac_track_script/lib.lua`)
and the [official Lua SDK](https://github.com/ac-custom-shaders-patch/acc-lua-sdk).
The APIs above offer useful foundations for animated track effects and visual
diagnostics, without a custom native module.
