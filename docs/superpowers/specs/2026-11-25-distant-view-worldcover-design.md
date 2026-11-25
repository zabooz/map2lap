# Distant view coloured from WorldCover

Status: implemented.

## Why

Beyond FADE_M[1] (2.4 km from the corridor) the distant view (`src/scenery/farview.py`) previously drew every vertex
from one shared table `far.png` by height and slope (`LAND`, `ROCK`, `STEEP`). The table's limits
were set by eye on the Großglockner test track (`heiligenblut_test`, Hohe Tauern): green up to ~2000 m, alpine meadow,
rock from ~2900 m, snow from ~3300 m. Elsewhere that is wrong (Norway and Scotland bare far lower, Rockies and Andes
forested far higher, deserts not green), and even in the Alps the low land is one uniform green and snow lies by
height instead of where the glaciers are. This breaks "map data first" and "think worldwide" (AGENTS.md).

## Goals

- Every distant-view object outside the inner ring gets its own texture coloured from ESA WorldCover, the way the
  inner ring (`_texture`) already colours its 2 km squares: class -> mean colour of its comic ground texture
  (`groundcover.CLASS_MAT`), water blue, steep slopes rock (`STEEP`), the large-scale variation `groundcover.macro`.
- No change of style or seam at 2.4 km: the inner ring's far side blends into the same WorldCover colours.
- Heiligenblut looks at least as good as now; tracks outside the Alps look like their region.

## Non-goals

- Photo imagery (approach B below); kept possible, see "Later: a photo switch".
- Overture land_use and OSM natural beyond the inner ring (40 km of it is too much data); WorldCover alone.
- A regional colour for WorldCover 60 "bare" (grey scree everywhere, also in red or sandy deserts): a separate topic
  that concerns the corridor and the inner ring as well.
- Haze or aerial perspective.
- Otto Bridge (Wyoming) shows light-green prairie because grassland uses `gc_meadow` worldwide. A follow-up for both
  the corridor and distant view is to colour dry grass, shrubland and bare ground by climate zone
  (`engine/climate.py`, as in `trees.zone()`).

## Anti-goals (a failure even if it works)

- Visible edges between objects or quadtree levels (texture density changes, tile-edge bleeding).
- More objects or draw calls than today.
- Downloads or build time that a user notices.

## Approaches

- **A: WorldCover in the distance (chosen).** Continues what the inner ring does, keeps the comic style, costs
  little: same objects (each 2 km+ piece is already its own `nocol_far_L_i_j`), ~128-160 textures of 256 px
  (~5-7 MB VRAM, 1-3 % of a track's texture folder), a few MB of download (WorldCover overviews).
- **B: Sentinel-2 photos** (`engine/imagery.py`, BeamNG.Earth's v1.3 far colour). Photo-real and worldwide, but
  the style jumps from comic to photo at 2.4 km, more data, and the global 2023 source is CC BY-NC-SA.
- **C: Shift the height table by latitude or climate.** Cheapest (no textures), but still a threshold rule: deserts,
  farmland and dry regions stay wrong.

## Design

1. **WorldCover overviews.** `Rasters.worldcover_box` reads class codes at the coarsest supported level at least as
   fine as the object's texel, using native pixels for finer texels. Levels 0–5 divide each 3° file exactly.
2. **One texture per distant object.** Outside the inner ring each square has a 256 px texture (`TEX_FAR_PX`).
   Planar UVs span the full image up to its edges, as on the inner ring.
3. **Colour per pixel.** WorldCover class -> mean colour of `CLASS_MAT[class]` (computed as today in `_init`), 80 ->
   `WATER`; no WorldCover file (open ocean) -> water where height <= 0.5 m and flat, else the height table; steep ->
   `ROCK` with `_rock_weight`; times `groundcover.macro`.
4. **Inner ring.** `_texture` keeps its 10 m colours with land_use near the corridor; its far side blends into the
   coarse WorldCover colours of step 3 instead of the table, so the ring and the objects beyond match.
5. **Fallback.** When the WorldCover read fails, an outer object uses the shared `far.png` with its height/slope UVs.
   An inner square paints local land-use and natural-ground polygons over the palette colours and writes its own texture.
   The build logs the failed read once per square.

## Constraints

- Offline tests cover class colours, overview selection, reading an overview across the date line and both fallbacks.
- `nocol_` prefix, at most 65,535 vertices per mesh: unchanged (geometry is not touched).
- `measure.py --build` leaves the distant view out: the look is judged in AC.
- `TRACK_VERSION` changes at the next release (built tracks look different).

## Verification

- `tools/check.py`.
- In AC, before and after at the same spots and time of day: `heiligenblut_test` (the table was tuned there), and
  one track outside the Alps (`otto_bridge_test`, Wyoming; `perth_tonkin_morley_test`, Western Australia).

## Left to the builder

- Snow and rock tone: the ground colours (gc_snow 230,236,244) are brighter than the table's (210,214,222), which was
  darkened for the evening sun. Start with the ground colours (one colour system); adjust after the AC comparison.
- Texture names, the DDS step (obj_to_kn5 already turns JPGs into DDS), worker split.

## Later: a photo switch (B)

The per-object texture is the slot a photo source would fill: with a switch, `imagery.render` instead of step 3
for the distant objects. Photo ground for the corridor is a separate, much larger project.
