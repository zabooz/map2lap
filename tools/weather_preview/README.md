# Weather preview

Versioned public-CSP rain/snow prototype and helpers for the existing `heiligenblut_test`
track. The shipped source `assets/weather/weather.lua` batches up to 14,057 rain/snow particles into one dynamic mesh
with custom HLSL, native weather selection and actual CSP wind. A depth-aware
distance veil and ground splash crowns complement native WeatherFX fog.
It requires no RainFX or custom DLL. This development branch enables the windscreen overlay,
with blade-swept rain/snow, independent side-window fields and a separate mirror precipitation pass.

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

There are no wet-road reflections, ground snow accumulation or vehicle-physics changes.
Front rain uses a custom GPU water-height layer and depth-normal refraction. Snow retains its height shading.
Support across different cars/VR remains unestablished.
`run.py --mode glassred` colours rain footprints solid red for visual diagnosis without altering movement;
`run.py --mode glass` restores the water material. Wiper water is included in the red footprint view.

## Custom front-glass water (visual prototype)

The active liquid backend is Map2Lap's own GPU simulation, replacing the librain
experiment. It deposits circular parabolic beads in a fixed metric glass chart,
retains height in FP16 ping-pong textures, and moves mobile water with bounded
upwind flux. Small beads pin; larger water patches move and leave thin trails.
Normals come from height differences in physical units. There is no CPU image
solver and no active rain worker. Lua prepares a few geometry/force uniforms.

Gravity and vehicle airflow use the rendered car-root frame. Ambient wind has
zero gain on liquid; outdoor precipitation keeps weather wind. The first model
uses a constant chart direction rather than a curved-pane radial force field.
Vehicle shear is deliberately bounded; this is an artistic car-water model,
not a fluid-aerodynamics solver. Actual glass triangles mask the simulation.

Wipers clear the swept quadrilateral and collect sampled swept water into a
3 mm leading band. Retained runoff then follows gravity. This transport uses
eight samples across each sweep, limited retained depth and drainage: it is
not exactly volume conserving. Snow's separate deposition/wiper path is unchanged.

The material copies CSP's built-in `txPreviousFrame` scene texture, with scene
distance in alpha to exclude cockpit/wiper pixels at both sample endpoints.
It applies the signed difference between refracted and original samples to the
current floating-point HDR target, in a separate pass from snow. Copying absolute
RGB also copied the earlier scene's different fog/brightness and produced pale
painted patches. Uniform backgrounds now receive only subtle edge attenuation.
Do **not** use `dynamic::hdr` as a refraction source: live paired captures showed
our water already in that image, causing feedback and black wiper/glove smears.
The built-in texture excluded our transparent passes in the tested CSP build.
Its template is embedded in `dwrite.dll` under `internal/shader-tpl/`, including
`include_textures.fx` (slot 19). Full temporal/stereo behavior is not established.

Use `glass` for the material; `glassred` shows actual height and an unprojected
inset. The first custom iteration has user confirmation of visible droplets and
no wiper smear, followed by a request to improve their painted appearance. The
signed-difference correction is under visual review. Driving motion, other cars and side liquid remain
for review; side liquid is disabled. No performance measurements have been made.

The archived librain experiment and upstream notices remain in
[`third_party/librain/PORT.md`](../../third_party/librain/PORT.md) and Git history;
none of its simulation or rendering stages runs alongside custom water.

The previous RainHybrid worker is stopped and no longer starts automatically.
`rainrust|rainlua` no longer select an active backend. The following description
documents the checkpointed experiment, not the active simulation.

## Checkpointed Rust rain experiment

`<python> tools/weather_preview/rain_rust.py` builds/starts the standalone rain helper in the owned AC preview.
Automatic rain-helper startup and `rainrust|rainlua` backend switching are disabled.
The archived worker binary is `out/rust-rain/rain-worker.exe`. `rain_rust.py --stop`
stops only this helper. No compiler is required once the development binary exists.

The Rust backend owns both small pinned beads and larger running drops: gravity, vehicle airflow,
size-dependent adhesion, swept-path pickup, volume-preserving merges, blade collection and edge drainage.
Each of the front and up to two detected side panes has 4096 slots. At capacity new water grows the nearest
existing bead. A local spatial grid limits collision work. One asynchronous shared-memory request feeds
batched height sprites; the existing GPU field/shading and separate side bindings remain in use.
Lua remains the fallback if the worker is unavailable. Snow deposits and falling precipitation are unchanged.
The car's actual glass triangles are read once into a 17 by 9 surface-derivative grid. Rust projects gravity
and vehicle airflow onto that curved surface using its local metric. Weather wind affects outdoor
precipitation and snow; rain movement on glass uses the vehicle's velocity. A wetness mask retains running
drop footprints and blade-edge water; it is a visual film approximation, not a mass-conserving fluid solver.
Rain rendering uses private glass-mesh copies with X/S-derived fixed UVs. Rust's persistent positions,
the fields and the wiper paths all use that same car-glass chart. Camera movement only changes projection;
it is not an input to the Rust worker or the UV lookup. Original car meshes/material UVs are untouched.
This is preview integration; release packaging and product startup remain pending, as for the snow helper.

## Rust falling snow

Rust is the default geometry backend when the worker is available, with automatic Lua fallback.
Build/start once with `<python> tools/weather_preview/snow_rust.py`; subsequent preview launch and hot reload
start the existing ignored `out/rust-snow/snow-worker.exe` automatically without requiring a compiler.
Use `run.py --mode snowlua` or `--mode snowrust` to switch without restarting AC, or `snow_rust.py --stop`
to stop the helper. It terminates when its exact AC process exits. The shared output is consumed asynchronously;
late frames can reuse a recent result, with Lua fallback beyond 50 ms. Glass and wiper effects are unchanged.
Release packaging and product Play startup are not yet wired; see `docs/rust.md` and `docs/release.md`.

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
