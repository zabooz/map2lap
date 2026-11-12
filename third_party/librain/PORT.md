# Map2Lap CSP port status

Upstream: https://github.com/skiselkov/librain, revision
`cbc42ef47bb412e522de067b1ea4000e2de97cf6`. `src/`, `shaders/`, `plugin/`,
`COPYING.txt` and `README.md` are unmodified source copies. Adaptations currently
live in `assets/weather/weather.lua`. Preserve the CDDL and copyright notices.

This is an incomplete front-windshield port under live visual review. It is not
an accepted replacement yet. The original experimental implementation is saved
in checkpoint `1bc90fb`.

## Implemented foundation

- `rain_stage1.frag`, `consts.glsl`, `noise.glsl`: persistent FP16 depth ping-pong,
  centre/neighbour deposition, retained and advected depth, erosion, depth limits,
  and leading-edge depth multiplication. Liquid-only; snow remains separate.
- `rain_stage2.frag`: depth differences and atan compression. Isotropic differences
  replace aircraft thrust-dependent sampling. Ice distortion is not ported.
- `ws_rain.frag`: depth-normal background displacement and restrained darkening,
  using a separate CSP HDR scene copy.
- `ws_smudge.frag`: normalized 25-tap depth-dependent kernel. Currently fused into
  the refraction sample; upstream instead blurs a completed refracted screen image.
  The difference at lens boundaries remains to be resolved or accepted visually.
- `librain.c` vector preparation: independently weighted ambient and vehicle
  airflow, combined before speed normalization. Ambient gain defaults to zero.
  Glass-frame gravity and airflow replace the aircraft's configurable radial
  force origins. No camera inputs enter movement. These lightweight calculations
  currently run in Lua; no replacement Rust preparation worker is implemented.

The classic render-texture path fits public CSP canvases. The inspected
`droplets.glsl` compute path uses storage buffers, compute dispatch, persistent
particle histories, static/dynamic drag and streamer tails; it is not ported.
No CPU image simulation replaces that GPU path.

## Coordinates and timing

Private glass mesh UVs use the existing rendered-car-root X/S metre chart, with
V increasing down the pane. Simulation height follows physical width/height so
texels have approximately equal dimensions. The classic per-step retention and
deposition run at a fixed 60 Hz, with at most 0.1 seconds of accumulated work.
Out-of-chart samples drain rather than wrap. Actual triangle-edge masking remains
incomplete. A flat depth inset accompanies the solid-red diagnostic.

## Wipers and current review

The initial single-frame wipe port omitted upstream's delayed smear state and
missed sweeps between simulation ticks. Porting the 0.5-second smear/reversal
regions restored broad wiping, but the user observed that new drops were erased
behind the blade until the delayed region passed.

The current CSP adaptation therefore retains radial blade limits and upstream
leading-edge multiplication but clears only the angular interval actually crossed
since the last successful GPU update. The interval accumulates between ticks and
is consumed once. Newly deposited water behind a completed sweep survives.
This deliberately differs from `update_wiper()` and its delayed smear algorithm.
Leading-edge multiplication is upstream's visual accumulation, not conserved
blade-transport volume. Inner-radius/return-stroke quality still needs acceptance.

## Remaining work

- Obtain visual acceptance for front attachment, motion and wiping. Reported
  screen-centre flow remains unresolved; constant logged UV flow is not proof
  of correct rendered appearance.
- Review normal rendering after red-diagnostic acceptance; settle the blur-stage
  difference and background-copy behaviour.
- Apply independent simulation resources and exposure to side panes. Side liquid
  is temporarily disabled; legacy rain must not run alongside the port.
- Restore/verify all snow thaw transitions, remove obsolete rain code, decide and
  implement the appropriate Rust preparation role, and complete release integration.

The old RainHybrid worker is stopped and no longer automatically starts from the
preview launcher/updater. The old CPU list, procedural rain deposition and rain
field updates are disabled in the active liquid path. Their source remains for
cleanup after acceptance. Outdoor precipitation and the default snow worker are
unchanged. No automated suites or performance measurements are part of this review.
