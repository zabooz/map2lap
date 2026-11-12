# Map2Lap CSP port status

Pinned upstream: https://github.com/skiselkov/librain at
`cbc42ef47bb412e522de067b1ea4000e2de97cf6`. Source copies in `src/`, `shaders/`
and `plugin/` are unmodified. Adapted code retains CDDL/copyright notices;
the license is `COPYING.txt`.

This is a front-windshield implementation under visual review, not an accepted
or complete three-pane replacement. Original experiment: `1bc90fb`; classic
depth-path and motion-recorder checkpoint: `fe8cf73`.

## Active pipeline

Only the particle path supplies rain. The classic per-pixel deposition/advection,
old CPU drop list, old RainHybrid sprites and procedural field deposition have
been removed from the active Lua source. Snow retains a separate deposit/thaw
field, its wipers, outdoor precipitation and default Rust geometry worker.

1. `tools/weather_preview/rain_worker.rs` ports `droplets.glsl` particle state
   and `droplets_data.h`: regeneration, initial velocity, static and dynamic drag,
   filtered speed/tail direction, random bumps, quantity decay, speed-dependent
   shape and 48-position history for every sixteenth droplet. The remaining
   droplets retain their short position history. Constants and their relationships
   follow upstream; the host random seed generator replaces libacfutils CRC64.
2. `weather.lua` ports the nine-triangle `droplets.vert`/`droplets.frag` shape and
   `tails.vert`/`tails.frag` depth contributions. A cached GPU atlas preserves
   the fan's centre-to-edge interpolation, with affine UI quads for heads and
   tapered quads replacing OpenGL wide lines for tails. Alpha blending builds a
   fresh FP16 depth image from persistent particle/history state each response,
   as in `rain_stage2_compute_paint()`. Actual glass triangles mask the image.
3. `rain_stage2.frag` COMPUTE_VARIANT: 0.67/0.33 first/second-neighbour depth
   differences and atan normal compression. Liquid only; ice is not ported.
4. `ws_rain.frag` COMPUTE_VARIANT: separate HDR background copy, displacement
   scaled by viewport dimensions, consistent darkening and maximum depth 1.
5. `ws_smudge.frag`: a separate copy of the refracted scene followed by its
   normalized 25-tap, depth-dependent blur. The second mesh draw restores alpha
   blending after the opaque copy. This fixes the initially black dry windshield.

Public CSP's inspected track API exposes canvases/custom pixel shaders, but no
equivalent compute dispatch/storage-buffer interface. Only particle arithmetic
and state moved to Rust; rasterization, depth processing and shading stay on the
GPU. No CPU image solver or new native plugin was introduced.

## Integration adaptations

- Positions use an isotropic chart measured in fractions of pane width. Height
  bounds use physical aspect ratio; texture UV conversion happens at drawing.
  Private glass-mesh UVs use the same rendered-car-root X/S chart. Original car
  meshes/material UVs are untouched. Camera inputs exist only in diagnostic
  projection and rendering, never in the worker protocol or forces.
- Actual sampled glass tangents replace upstream's configurable radial force
  origins. Gravity is projected through the surface metric. Vehicle airflow is
  independent of ambient wind, whose gain remains zero. Aircraft thrust is not
  a separate car force; relative vehicle airspeed uses the upstream documented
  starting normalization of 100 m/s. The initial 40 m/s car override made modest
  driving overpower gravity. Gravity now uses upstream's slant-scaled magnitude
  once, rather than multiplying by projected gravity magnitude a second time.
  The 17 by 9 derivative grid remains an integration approximation under review.
- Upstream's compute path has **no wiper implementation**. The CSP coupling uses
  classic radial limits and consumed sweep intervals. Swept heads retain their
  quantity and move just ahead of the blade; reversal or parking releases them.
  Swept streamer history is invalidated persistently, with GPU sweep clipping
  for the remaining footprint. It does not retain upstream's delayed 0.5-second
  smear, which erased fresh drops for too long, or its non-conserving x10 depth
  multiplier. This coupling is an adaptation, not an upstream compute feature.
- The depth texture is 1024 wide with aspect-correct height, rather than the
  upstream compute default of 2048 square. Droplet dimensions retain the upstream
  2048 reference scale in isotropic chart coordinates. Normal sampling uses actual
  canvas dimensions. No performance comparison has been performed.
- `AcTools.CSP.Limited.Map2Lap.Librain.v4`: protocol 4, 1,085,728 bytes, capacity
  4096 per pane. One outstanding request, no render-thread wait, exact owned AC
  process lifetime. Missing helper retains the last image; no old rain fallback.
  Front is active; side slots are reserved but inactive until front acceptance.

## Evidence and remaining work

Rust compilation and live Lua/HLSL loading passed. Same-draw HDR/depth recordings
show beads, trails and broad wiper clearing. The user still reports a fan toward
the steering wheel and slow movement/draining. These remain unresolved; neither
fixed UVs nor a plausible force calculation proves the visual result correct.

Normal water rendering is now active at the user's request. The black-windshield
regression was reproduced and corrected by restoring blend state; a subsequent
live capture shows the scene again. Material quality still needs user acceptance.
The user then reported excessive upward motion and sawtooth accumulation while
driving. The movement-only gravity/airflow correction above is deployed, pending
visual feedback. Their later screenshots show native heavy rain; density was not
changed by the correction.

Remaining: front motion/wiper/material acceptance, independent side resources and
exposure, snow/thaw transition verification in-game, and release packaging/startup
of precompiled helpers. No automated suites, FPS measurements or profiling were
run for this iteration. Do not call this a completed full librain port.

## Motion evidence

`capture_motion.py` records bounded same-draw FP16 depth, HDR view, native wiper
phase and geometry, gravity/airflow, particle identities/velocities and diagnostic
screen projections. `view_motion.py` decodes DDS frames into paired PNGs and an
animated WebP using recorded simulation timestamps. Captures do not change camera,
controls or native weather, and restore the previous glass mode.
They are motion evidence, not performance measurements.
