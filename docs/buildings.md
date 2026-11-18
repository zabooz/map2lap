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
existing bay spacing. There is no visual style editor.

## Regional defaults

The building planner uses each height's map source. Microsoft ML Buildings estimates that leave less than
2.4 m of wall per occupied floor are discarded, then height and roof rise are inferred from the remaining
mapped facts. A typical door needs about 2.1 m of clearance plus a lintel; Perth contains ML estimates below
1 m that would otherwise flatten houses and put doors above their roofs. Explicit OpenStreetMap heights and
small sheds, storage buildings and open shelters keep their mapped dimensions.

`engine/buildings/styles.json` holds 22 `Style` records and their country assignments. The loader checks
required and unknown fields, shares, materials, tint indices and region references before a build starts. Mapped roof
shape and materials still take precedence over these defaults. The file is part of the revisit cache key and both
release archives; it can be edited without changing Python code. `gas_station_kit`, `us_special` and `shutters` are
explicit style data: tank-station kits, US-only plaza and grain-silo rules, and the shared plaster sheet's shutters
do not depend on the style's name. Shutters still use the style at the track anchor once per track.

The planner uses each footprint's own coordinates and mean raw ground height. `borders.at` supplies its country from
the shipped Natural Earth polygons, and `climate.koppen_at` supplies a Köppen class from the shipped raster. No
building lookup contacts Nominatim. The four existing US/Canada zones keep their previous coordinate boundaries and
extent; Hawaii and the Canadian Arctic continue to use climate fallback rather than a mainland zone. In the selected
European countries and Oceania, explicit country defaults and ordered latitude/longitude splits select the style.
The named `Alpenbogen` rule requires an Alpine country, its four-bound box and ground at least 700 m: lasting snow
favours pitched chalet roofs. The box excludes the Pyrenees, Apennines, Massif
Central and northern German ranges, but overlaps some of the Swiss Jura and the southern Black Forest (for example
Hochblauen), and can include plastered high towns such as Davos. A precise Alpine polygon would resolve those cases.
On the sea and in unlisted countries, Köppen D/E
classes use `cool`, all other classes and unknown sea pixels use `warm`.

The ten selected records from `docs/research/2026-11-16-building-styles-proposal.json` include updates to the
existing `alpine` and `mediterranean` records and eight new names. Their shares are estimates; the Graz and Auckland
samples only partly constrain them. The other proposed styles, windows, building elements and additional painted
surfaces are not enabled. Detached brick remains limited by the planner's 0.35 multiplier, including in Britain,
the Netherlands, Australia and New Zealand. A route crossing a style boundary can show the same shutters on both
sides because their texture is selected once at the anchor.

`drawn_ring` places flat-roof walls on the mapped outline and pitched-roof walls on its smallest oriented rectangle.
The rectangular roof needs these matching walls so doors, steps and porches do not float off an oblique wall or sink
into it. A style change that switches roof form can therefore move the visible ground-level wall outline and its
building collision even though the mapped footprint has not changed. The pitched-roof eligibility check requires
the mapped outline to fill at least 80% of the rectangle. The rectangle's corners can still extend beyond the mapped
outline into a sidewalk or road carriageway. This pre-existing approximation is not checked against the road surface:
in the short test tracks, 295 pitched-roof buildings' added rectangle area touches a road band, and 59 cover more than
5 m² of road band or sidewalk. The mapped outline, not a roof-style change, determines the building's source position.

`gasstations.py`, `plazas.py`, `photo.py` (`brick_share`) and `make_obj.py` call `region_style` without ground height.
They therefore see the lowland style even at a high Alpine point. Every style pair separated only by the 700 m
rule has the same tank-station kit, US special rules and shutter flag; a test guards this until those callers can
receive elevation. `brick_share` is 0.04 in `central_europe` and 0.02 in `alpine`, both below the 0.70 brick-walk
threshold, so that caller currently makes the same decision. Supplying height there is a separate change.

The planner marks detached residential houses independently of their wall material. `doors` gives them a driveway
and a matching front-fence gap when the road-facing wall is at least 7 m wide and the road is close enough. This
width leaves room beside the entrance; narrower houses may have side or rear parking that the generator cannot infer.

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

## Garages and agricultural openings

Explicit `garage`/`garages` buildings receive closed metal gate panels. `stable`/`cowshed` receive double farm
gates and small high windows; `barn`/`farm_auxiliary` receive farm gates and ventilation panels. These are inferred
details, not mapped entrance nodes. They use the road-facing wall chosen by `doors`; without a nearby eligible road,
the longest drawn wall is the fallback. Thresholds use the same local ground estimate as ordinary entrances.
Raised parts, carports and generic sheds do not receive these gates. Near geometry alone gets the details.

Each opening is one quad. Gate count is capped at eight and farm windows/vents at 24 per building; frames, shutter
seams and timber braces are painted into the shared `utl` atlas. Stable windows reuse the ordinary facade's four
window bays and night masks, preserving varied lighting in the Editor and CSP. These panels do not cut holes into
walls or change collision. Small garages without a supported mapped material fall back to plaster rather than the
regional shed wood; mapped material/colour and the existing alpine stone-shelter rule retain precedence.

## Industrial openings

Low halls (up to two floors) use class-specific openings: `warehouse` has several loading shutters and sparse rear
windows; `manufacture` has two vehicle gates and high window bands; `factory` has gates and window rows following
its floors. `hangar` has a broad sliding door and side vents; generic `industrial` has one vehicle gate and a few
rear windows. A separate personnel door is added where it fits. Mapped facade materials and supported roof shapes
still take precedence. These are inferred details, not mapped entrance positions.

`industrial.py` fits panels to the drawn wall and local entrance elevation, leaving wall piers and headroom and
rejecting overlapping openings. Raised parts receive no ground gates. Only near geometry receives these panels,
with at most six gates and 48 window/vent quads. Gates, doors and vents share the `ind` atlas; windows reuse the
facade night-mask bays. Road-facing orientation no longer requests a retail storefront from the native wall emitter
unless the building actually has a shop or belongs to the retail big-box classes.

## Small utility buildings and storage

`shed`, `hut`, `cabin`, `service`, `toilets` and `static_caravan` get one fitted personnel door, with a few small
windows where appropriate. Their road-facing wall is preferred; the longest wall is the fallback. These openings
reuse the utility/industrial atlases and the ordinary night-lit window bays. Inferred roof rises leave 2.4 m of wall
height where the supplied total height allows it; explicit roof heights and lower mapped total heights still win.
Caravans default to light cladding and a low roof. Toilets and service buildings default to plaster.

`shelter`, `roof` and `carport` draw a roof on narrow posts, with a bounded support count. The roof is visible from
below; collision uses the same open structure. `greenhouse` defaults to light glazing with a frame grid (`ghg`) and
a glass roof. This is opaque textured glazing, not a transparent interior or office curtain-wall system.

Silos and tanks default to metal walls without house windows, keeping the supplied footprint. Near-circular silo
rings receive a shallow polygonal cone when no roof is mapped; rectangular storage keeps its rectangular outline.
The House examples use 24-sided round storage footprints, rather than its earlier square test inputs. Mapped
materials, colours and supported roof forms override these class defaults. Chapels use a small inferred roof turret;
churches retain the larger bell tower. These details are approximations, not reconstructions of mapped equipment.

For a mapped church, chapel, cathedral or synagogue with building parts, the parent footprint supplies the body
where grounded parts leave at least the normal minimum building area, and below parts raised onto its roof. The
finished parent mesh and collision are clipped against mapped part volumes, so shared walls and roofs are not drawn
twice. A mapped pyramidal, onion, dome or spherical part roof supplies the tower feature; otherwise the body gets
at most one inferred steeple. A raised part starting at the mapped parent height receives a flat supporting parent
roof when that roof has no mapped shape. This cannot infer a local ridge beneath an upper part from missing roof
tags; the result still depends on the source building outlines and heights.

## Public and small business frontages

Public classes in `CIVIC_CLASSES` default to plaster, with separate classroom/office-size windows and a wide glazed
entrance. `FacadePattern` can specify window width, height and sill as well as spacing; these dimensions go through
the native wall emitter. Public window height is fitted to the supplied floor height so the top row does not disappear
under a pitched roof. Mapped materials and architecture profiles retain precedence. The profile does not infer a
campus layout, historic architectural order or additional wings from a class alone.

`frontages.py` adds the access panels and small entrance canopies; train stations use a longer canopy along the front.
Terraces get repeated inferred dwelling bays with their own doors, rather than a single house entrance. Cafes and
fast-food buildings get display windows and access; kiosks get a sales window with side access. The road-facing
wall is preferred, otherwise the longest wall is used. Raised parts get no inferred ground entrances. Windows
keep the existing varied night-mask bays, and entrances share the `ent` atlas; no building gets a unique texture.
Door/window counts are bounded, wall margins are retained, and narrow fronts omit display panes that overlap access.

Food businesses also receive a small double-sided projecting sign. Their mapped name is used on the main panel;
without a renderable name, the neutral use label is `CAFE` or `FAST FOOD`. Fire stations have a bounded row of vehicle
gates, separate personnel access and windows that leave the gates clear. Their name panel sits above the vehicle
clearance. The House lab preserves the production facade profile while enabling its attic-window demonstrations;
its hospital and fire-station examples use larger synthetic footprints to make their intended use legible.

Sign lettering uses the source opacity atlas without a vertical image flip: the KN5 exporter already negates V.
The export regression samples the actual converted glyph UVs against both production and gallery textures, so
transparent atlas space cannot silently replace the letters again.

`semidetached_house` uses paired entrances and mirrored front window axes only for an explicitly supplied
`building:flats=2` with no detected attached neighbour. A narrow facade joint marks the division; the footprint,
roof and mapped materials remain shared. Attached halves, missing/invalid counts and other dwelling counts keep
one entrance per outline. This is a conservative visual inference: the class alone does not establish whether an
outline contains the whole pair. House case 84 explicitly supplies the two-dwelling count. The tile importer retains
that field when supplied; this does not add a general OSM dwelling-count download. Raised parts get no ground access.

## Architectural-style extension point

`buildings.architecture` retains optional `building:architecture` input (or the canonical `architecture` column).
Semicolon-separated styles are trimmed, lowercased and deduplicated in source order; unknown styles are retained.
`Spec.architecture` is a tuple of these names, also recorded in the exported object's parameters. A building part
uses its own styles when present, otherwise the parent's. Missing metadata is an empty tuple.

`ArchitectureProfile` currently exposes an optional `FacadePattern`. The `PROFILES` registry is empty: no
architectural style changes the current geometry or textures. A future registered profile supplies its pattern
through `architecture_pattern`; the first implemented pattern in the ordered style list wins, otherwise the
regional pattern remains. Explicit per-building `Spec.facade_pattern` assignments can still override it afterwards.
Mapped dimensions, roof forms and materials are not overridden by this extension point.

This is an internal data contract, not a new data source. The current Overture building query has no architecture
field and the general OSM building-tag join is not implemented. A future importer must populate `architecture` and
version the affected map-layer caches when it starts doing so. No new requests or cache invalidation are needed
for this inactive extension point; existing tracks do not need rebuilding for it.

## Roof dimensions and comparison gallery

Large, non-plain flat roofs may receive inferred equipment, not mapped rooftop objects. Each unit's complete
footprint plus a 0.5 m visual maintenance margin must fit inside the drawn roof ring; boundary-segment tests reject
concave notches even when all four corners lie inside. Units also leave that gap between one another. Unsuitable
placements are omitted. The rule works on the currently drawn outer ring; courtyard holes are not yet retained.
The shared `hvu` atlas supplies vented metal side panels and a plain lid, using the same five quads per unit.
The House gallery includes rectangular and L-shaped roof-equipment examples.

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

`tools/building_gallery.py` creates **House**, a synthetic comparison pad with 128 labelled cases,
using production building geometry and textures. It needs no map downloads. All 14 roof shapes have their own
geometry paths; the gallery checks that each requested form is drawn. The footprint suitability and geometric
approximations described above still apply to real map data.
Cases 24 and 28 use 6 m square, 9 m high towers with taller roofs to expose their silhouettes: a 6 m onion roof
and a roughly 5.6 m spherical cap whose vertical radius matches the 3 m horizontal radius. These are gallery
inputs, not overrides of mapped building dimensions.
Cases 1–32 retain the roof/footprint comparisons; 33–43 show all eleven Overture facade materials and 44–57
all fourteen roof materials. Case 58 goes through the production part importer: a base inherits the parent's
stone facade, while its inset glass upper part has its own copper roof. Cases 59–60 show fitted roof equipment;
61–65 compare garage and farm openings. Cases 66–76 cover retail, commercial, supermarket, shop, kiosk, office,
hotel, restaurant, civic, cafe and fast_food; 77–81 show industrial, warehouse, manufacture, factory and hangar.
Cases 82–92 cover house, detached, semidetached_house, bungalow, residential, apartments, terrace, dormitory,
farm, cabin and static_caravan. Cases 93–95 add carport and parking/parking_garage deck examples; 96–98 add
farm_auxiliary, cowshed and agricultural; 99–105 add shed, hut, shelter, roof, greenhouse, service and toilets.
Cases 106–108 cover silo, grain_silo and storage_tank; 109–111 cover church, chapel and cathedral; 112–124 cover
public institutions from fire_station through college. Cases 125–128 compare yes, transportation, a missing
class key and an unknown class value. These show existing rules, not a promise of distinct geometry for each class.
Class examples leave facade materials and colours unset; residential examples
also use regional roof choices. Their heights and footprints are synthetic examples, not inferred dimensions.
Production name/sign selection and door placement use a synthetic street in front of each example. The normal
props exporter supplies door meshes, and sign lettering uses its production opacity atlas. Halls get wider spacing
and supermarket footprints reach the big-box threshold. The track id stays
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
