# Building geometry and facade patterns

`engine/buildings` plans the mapped building volumes and regional appearance. `native/earthfast/src/facade.rs`
owns the shared horizontal window axes and inferred entrance placement; `building_walls` in the native module
emits the facade. `src/scenery/facades.py` paints the shared texture sheets and matching night-window masks.

Mesh UVs use V up. `cdae.encode` converts to Torque's V down; `make_obj.shape_parts` restores V up for OBJ,
then `obj_to_kn5.mesh_nodes` converts to AC's V down. Omitting the middle conversion swaps residential bands and
samples the wrong number of windows. This conversion applies to every compiled shape exported through that reader.
Separate window quads use the complete panel window at pixels x=53–154, y=274–467 of the same sheet.

## Facade layout

`buildings.FacadePattern` supplies optional nominal bay width in metres, entrance preference (`auto`, `centre`,
`left`, `right`) and the half-width to leave clear around an entrance. `auto` retains the side preference of narrow
facades and the centre preference of wider ones. A preference selects the nearest axis that leaves the required
clearance from the wall ends. `left` and `right` follow the wall's stored start-to-end direction.

Without a bay override, separate window quads retain their 3.4 m nominal spacing; facade sheets use their band's
physical repeat. Both paths distribute complete bays evenly along each wall. Window axes repeat on upper floors.
Only an actual entrance suppresses ground-floor windows, on its own wall, independently of the roof shape.
An explicit entrance position already stored on the specification remains fixed during mesh emission; all bays
it overlaps are left blank. Entrance inference still uses roads, not mapped OSM entrance nodes.

Blank entrance bays and foundations sample pixels 4–12 at the left edge of the residential sheet, inside its
window-free margin. Do not sample around arbitrary bay boundaries: panel and sash shutters extend into that area.
Each blank stretch uses one quad. The foundation ends at the ground-floor datum; its depth never stretches the
ground-floor windows. This applies to both near and distant buildings.

Door thresholds and porches use the local ground estimate, interpolated on the nearest mapped footprint edge.
The entrance position comes from the drawn footprint first: a pitched roof's oriented box can reorder the edges.
Without corner elevations the fallback remains the building's supplied ground level. On a steep slope an entrance
may sit in the exposed basement; this is an inferred exterior entrance, not a model of the interior floor plan.
Corner interpolation cannot resolve a retaining wall or a small landing absent from the elevation data.

`Style.facade_pattern` applies to ordinary buildings planned with that regional style. An individual
`Spec.facade_pattern` overrides it, for example when experimenting with a building type:

```python
from buildings import FacadePattern

spec.facade_pattern = FacadePattern(bay_m=3.0, entrance="centre", door_clearance_m=0.75)
```

Set the pattern before `buildings.doors` and `buildings.build`. It controls facade layout only; mapped height,
storeys, materials and roof decisions remain inputs to their existing planners. The default styles retain their
existing bay spacing. There is no saved style-file catalogue or visual style editor yet.

`FacadePattern(attic_windows=True)` enables small 0.8 m square windows in roof wall caps, including gable ends
and the high side of a skillion roof. They follow the native facade axes, with a 0.6 m sill above the attic datum
and at least 0.25 m wall left below the roof and beside corners. Both top corners must fit under every roof plane;
low caps and explicitly windowless buildings stay blank. This is an optional appearance rule, off by default,
not an inference that every attic is inhabited. The gallery enables it on its skillion cases.

Attic quads reuse the ordinary panel-window UVs and facade material, including CSP's existing night mask.
Frames and crosses stay dark. Ordinary separate windows and attic windows pick one of four visually identical
panel bays using the building seed, wall, floor and window index. Their night masks differ, so individual windows
light up instead of whole houses; rebuilding keeps the same pattern. One of the four panel bays is lit per
material level. Each added attic window costs two triangles; varying its UVs adds no geometry or materials.
The first panel bay lights at level 1: white vertex colours clamp at 255, so their exported materials cannot
reach level 2. Tests cover the exported material selection as well as the mask pixels.

## Roof dimensions and comparison gallery

`roof_height` is the rise above the wall eaves. A valid mapped rise is used both when subtracting it from total
building height in `planner` and when emitting the roof in `mesh`. Missing or inconsistent values use the regional
pitch; inferred roofs leave room for walls. Main buildings and building parts retain their own roof dimensions.
The building-parts cache has its own layer version so old parts are refreshed with direction and material fields.

`roof_direction` is a bearing clockwise from north and takes precedence over `roof_orientation` (`along`/`across`).
The ridge changes direction while `drawn_ring` keeps the walls fixed. Oblique roof planes are clipped to the drawn
wall rectangle plus eaves, with wall caps up to those planes. This is a simple rectangular roof construction; it
does not reconstruct complex roof valleys or change the existing rectangular approximation of pitched footprints.
Ordinary roofs without direction overrides retain the direct quad emitter. Flat roofs keep their actual outline.

`skillion` has its own single sloped quad with wall caps, instead of a gabled fallback. Its mapped height is the
rise between the outer roof edges, keeping the building's maximum roof elevation at the mapped total height.
For this asymmetric roof, direction denotes downhill/runoff, following
[OSM roof:direction](https://wiki.openstreetmap.org/wiki/Key:roof:direction). Without a bearing the slope crosses
the short dimension by default; `across` switches dimensions. A missing height uses a pitch over the full span.

`dome` is an elliptical cap fitted to the existing drawn wall box, with a flat apron closing the rectangular
corners. Six height bands and 16 angular sides use 208 top triangles including the apron; the apex is emitted
as triangles, without collapsed quads. Mapped rise sets the top height, and ridge/orientation tags have no effect.
The existing pitched-footprint suitability limits and rectangular wall approximation still apply: circular
wall reconstruction and compound domes are not part of this roof emitter. Overhang undersides close the apron.

`onion` shares the radial emitter and corner apron, using seven profile intervals with a narrow base, a widening
bulb and a concave neck ending at one tip. Its maximum radius stays within the wall box. The 240 top triangles
include the apron; widening lower faces point outward/downward so the bulb is visible from below. Profile
proportions are appearance defaults; mapped roof rise still sets the exact tip height. Ridge tags have no effect.

`spherical` uses a truncated spherical profile from -60 to +90 degrees: a narrow lower support, a rounded belly
and a rounded crown, rather than the onion's concave neck. Ten profile intervals and 16 angular sides use 336
triangles including the apron. Scaling fits the wall box and mapped rise, so unequal dimensions produce an
ellipsoid, not a mathematically exact sphere. Lower faces point outward/downward. Ridge tags have no effect.

`sawtooth` repeats asymmetric bays with an 80/20 long-slope/steep-return split. Without mapped bay spacing,
the nominal repeat is 6 m, limited to 2–8 teeth to bound mesh cost. Mapped roof height is the rise of each tooth;
inferred rise uses one bay's long run. Ridge bearing/orientation select the repeated profile's axis. Exterior
walls are capped per bay so valleys remain open above the wall datum; roof faces use the existing roof material,
without invented glazing. Overhangs sample the actual local roof triangles, not the lowest extended slope plane.

`round` is an elliptical barrel with 12 angular segments (24 upper triangles before footprint clipping), including
the exact crown height. Mapped rise controls its vertical radius; without it the regional height fallback applies.
Bearing and orientation choose the barrel axis. UVs follow the accumulated slope lengths, and end walls, optional
attic openings and overhang undersides use the same segmented roof planes. The segment count is fixed to bound
geometry cost; very large roofs retain a visibly faceted silhouette.

`saltbox` has an offset ridge with equal pitch on unequal roof runs, ending at a lower and a higher eave.
Without mapped offsets/eave heights the runs use a 65/35 split. Mapped roof height is the rise from the lower
eave to the ridge; inferred height uses the longer run. Bearing/orientation select the ridge frame, with the
short side toward its positive transverse axis. This side choice is a deterministic appearance default, not a
mapped entrance/back-of-house inference. The wall caps and closed overhangs follow the asymmetric planes.

`mansard` has four steep lower slopes and a shallow hipped top. Without mapped break dimensions, the lower
slopes take 65% of the roof rise over an inset of 25% of the smaller half-span. These are appearance defaults,
not measured attic-floor dimensions. Height, bearing and orientation use the existing roof inputs; faces are
clipped to the unchanged wall rectangle and wall caps close underneath. Texture scale follows each slope's
actual surface distances. Dormers are not inferred or added.

`gambrel` shares the mansard's two-pitch construction and default break proportions, but only the two long sides
are roof slopes: upright gable walls follow the full broken profile up to the ridge. The ridge spans the full
roof length, with no hipped ends. Both forms use `_broken_roof`, including the same mapped dimensions, direction,
clipping, wall caps and optional attic windows wherever their frames fit below all roof planes.

`half_hipped` (also accepted as `half-hipped`) keeps the lower gable wall and clips its upper half with two small
hip planes. Without mapped clip dimensions, half the roof rise is the appearance default; the end run is limited
to half the ridge-axis span so even across roofs retain a ridge. Roof height, direction and orientation use the
same planes-and-wall-caps path as oblique gabled roofs. This does not model a lower hip beneath an upright upper
gable, which is a different roof construction.

`pyramidal` forms four triangles meeting at one apex above the drawn rectangle's centre, including on long
rectangles where a hipped roof would have a ridge. Roof height sets its rise; without it the regional pitch applies
to the short half-span. Direction and orientation do not rotate this ridge-free roof or change its inferred height.
Eaves extend beyond the walls and small wall caps close the gap under the slopes. Existing footprint suitability
limits still apply; this does not reconstruct pyramids over arbitrary irregular polygons.

`tools/building_gallery.py` creates **House**, a synthetic comparison pad with 58 labelled cases,
using production building geometry and textures. It needs no map downloads. All 14 roof shapes have their own
geometry paths; the gallery checks that each requested form is drawn. The footprint suitability and geometric
approximations described above still apply to real map data.
Cases 24 and 28 use 6 m square, 9 m high towers with taller roofs to expose their silhouettes: a 6 m onion roof
and a roughly 5.6 m spherical cap whose vertical radius matches the 3 m horizontal radius. These are gallery
inputs, not overrides of mapped building dimensions.
Cases 1–32 retain the roof/footprint comparisons; 33–43 show all eleven Overture facade materials and 44–57
all fourteen roof materials. Case 58 goes through the production part importer: a base inherits the parent's
stone facade, while its inset glass upper part has its own copper roof. The track id stays
`map2lap_building_gallery`, so rebuilding updates the same lab.
The label atlas grows in power-of-two rows; texture files are regenerated on every gallery build.
Default output is staged under `out/building-gallery-ac`; `--ac-root` selects an AC installation. Regenerate through
this tool, not the geographic route builder. It is an asset preview, not a geographic road regression track.

## Surface textures

`looks.FACADE_SURFACES` and `ROOF_SURFACES` map additional Overture material names to shared AC texture families.
`src/scenery/building_surfaces.py` paints periodic 512 px repeats: concrete block, clay, vinyl, timber framing,
fibre cement, vegetation, plastic roofing, photovoltaic cells, thatch, roof glass, gravel, bitumen, clay tiles
and patinated copper. Copper uses its own muted blue-green paint with irregular dark oxidation and standing seams,
so the metal palette cannot quantize it to uniform olive green. It represents weathered copper, not fresh copper.
It also paints wooden shingles separately from slate. Facade repeats cover 3 m; roofs cover 6 m.
The existing plaster, brick, stone, wood siding, metal, concrete and curtain-wall textures remain in use.
Curtain-wall glass extends to slim floor-edge profiles instead of broad opaque spandrel bands. Its night masks
cover the full lower panes too; floor profiles and mullions remain dark. Atlas bands and geometry are unchanged.
Explicit brick facades use plain brick and separate house windows, so specifying brick does not select the
legacy atlas's denser window spacing. Concrete resolves to a registered concrete look before mesh emission;
unknown look names would otherwise repeat the residential window atlas across the entire plain wall.
Mapped materials select these textures through the normal planner and export; aliases such as `tile` and `felt`
share the canonical material. Building parts select each facade/roof material independently: their own value,
otherwise the parent's value, otherwise the planner's regional/class fallback. Colours follow the same independent
inheritance. Part material selection also feeds bridge-support classification. Only the building-part layer cache
is invalidated when adding these columns; other map layers are retained.

Recognized mapped facade materials take precedence over barn, shed, hall, terminal, garage and castle appearance
guesses. Windowless uses remain windowless; a concrete hall does not acquire house windows just because it has a
mapped facade. Unknown materials keep the existing fallback. The special bridge/elevator geometry paths remain
separate from ordinary facade planning.

These are painted surface approximations: timber braces are not fitted around each window, vegetation has no
plant geometry, and roof glass/plastic are opaque tinted surfaces. Roof glass and solar textures contain no
night-window mask. Wall windows retain their separate facade quads and existing glow masks. New texture families
use bounded palettes and only used textures are exported; no additional geometry is needed for surface detail.

## Cost and validation

Near buildings close pitched-roof overhangs with a downward-facing soffit strip and a 0.12 m vertical edge.
`_roof_eaves` finds only the boundary edges of the emitted upper roof, projects their inner endpoints to the
wall box and samples the covering roof triangles there. This handles both convex roofs and repeated sawtooth
profiles, including oblique clipped faces. The strips reuse the blank facade
material, adding no material or draw call. Interior roof area is not duplicated. Far/lite buildings omit the trim.
The exported faces work with ordinary backface culling in both the Editor and AC; collision remains unchanged.

The Rust layout uses constant-time arithmetic and does not allocate a window list. Existing material atlases and
batched meshes are reused. Removing a false entrance gap adds the formerly missing window quads; a real entrance
may blank multiple bays when necessary. Collision stays the separate simplified building shell.

`test_building_facades` checks emitted window positions, roof-independent entrance clearance, regional pattern
handoff and narrow facades. `test_buildings` covers existing appearance and geometry rules. Geometry tests establish
placement, not an accepted look or AC frame rate. Check a rebuilt track in the Editor and in AC before choosing
regional defaults. Existing tracks retain their built geometry until rebuilt.

## Source facts

`overture.LAYERS` lists the selected building and building-part fields; these are not a complete OSM tag collection.
`pois` supplements selected uses such as churches, castles and named services. Toll recognition joins explicit
infrastructure to a footprint; the small cached extracts in `tollsource` supply road lane facts, not a general building
tag enrichment. Interior rings are not yet consumed by the building planner. Facade patterns do not repair or
replace that data path.
