# Weather preview

Versioned public-CSP rain/snow prototype and helpers for the existing `heiligenblut_test`
track. `weather.lua` is the visible v3 baseline: track-script quads with custom HLSL,
native weather selection and actual CSP wind. It requires no RainFX or custom DLL.

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

`context.py` finds the main checkout through Git's common directory. Source stays
in this worktree; runtime files stay in the main checkout's ignored
`out/weather-probe/`. That includes `session.json`, backup manifests, update
receipts, screenshots and logs. The existing personal AC setting is read from the
main checkout without copying it into the worktree or committing it.

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

The baseline has visible rain/snow and native fog. It has no shelter detection,
windshield effects, wet surfaces, snow accumulation or vehicle-physics changes.
Neither moving-car performance nor GPU cost has been established. The existing
`os.clock()` diagnostics are too coarse for performance claims.

Compare `rain-visible-v3.png` and `snow-visible-v3.png` in the shared runtime with
`invisible-look-v2.png`: raw scene-linear lighting and subpixel transparent sprites
made v2 invisible despite successful shader compilation.

For this prototype the user explicitly authorises iteration commits with
`git commit --no-verify` and waives test-writing/TDD requirements. Keep commits
focused on rendering improvements. Actual AC inspection and bounded performance
comparisons remain necessary. Windshield droplets, streaks and wiper interaction
are a research bonus after visible progress on rain, snow and fog.
