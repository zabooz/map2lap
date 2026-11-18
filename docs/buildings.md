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

Microsoft ML Buildings heights leaving less than 2.4 m of wall per occupied floor are discarded; the planner
infers height and roof rise from the remaining facts. Explicit OSM heights and small sheds, storage buildings and
open shelters retain their mapped dimensions.

`engine/buildings/styles.json` holds 22 validated regional styles and is part of the revisit cache key and release
archives. Mapped roof shapes and materials take precedence. Tank-station kits, US specials and shutters are explicit
style fields; shutter textures use the style at the track anchor for the whole track.

Each footprint's coordinates and mean raw height select its style. `borders.at` uses shipped country polygons;
`climate.koppen_at` uses a shipped Köppen raster, with no Nominatim lookup. The US and Canada use four zones;
selected European and Oceanian countries use regional splits. The `Alpenbogen` rule needs an Alpine country,
its bounding box and ground at least 700 m. The box can include Jura,
Black Forest and high plastered towns. Elsewhere Köppen D/E uses `cool`, other and unknown classes `warm`.

Regional appearance shares are estimates; detached brick is limited by the planner's 0.35 multiplier even in
brick-heavy regions. A route crossing a style boundary can retain the anchor's shutter texture on both sides.

`drawn_ring` uses the mapped outline for flat roofs and its smallest oriented rectangle for pitched roofs, keeping
walls, doors and porches aligned. A pitched roof requires the outline to fill at least 80% of that rectangle.
Switching roof form can move visible walls and collision beyond the mapped footprint, even into a road or sidewalk;
the approximation does not check road clearance. Irregular or oversized roofs fall back to flat roofs.

`gasstations.py`, `plazas.py`, `photo.py` and `make_obj.py` call `region_style` without elevation and thus use the
lowland style at high Alpine points. The style pairs across this boundary currently share the affected kit and
shutter choices; tests guard that constraint.

The planner marks detached residential houses independently of their wall material. `doors` gives them a driveway
and a matching front-fence gap when the road-facing wall is at least 7 m wide and the road is close enough. This
width leaves room beside the entrance; narrower houses may have side or rear parking that the generator cannot infer.
House and open-garage driveway meshes sit 3 cm above the ungraded ground they cross. The offset clears the road
mesh's 2 cm terrain-following tolerance; these generated strips do not have mapped road plans that lift the ground.

`FacadePattern(attic_windows=True)` adds 0.8 m windows to roof caps where both corners clear every roof plane;
low caps and windowless buildings stay blank. It is off by default. Attic and separate facade windows reuse the
panel material and four deterministic UV bays with different night masks, lighting individual windows while
keeping frames dark. Vertex colours limit the first bay to brightness level 1.

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
An unclassified footprint below 40 m² also uses the shed access details, matching its shed-shaped walls rather than
leaving a plain box. This is a drawing inference; a wrong source footprint remains a building until removed or filtered.

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

`roof_direction` is clockwise from north and overrides `roof_orientation` (`along`/`across`). Roofs use the
mapped rise where valid; otherwise they use a regional pitch. Their planes are clipped to the drawn wall box,
with wall caps and closed overhangs. Flat roofs retain the mapped outline.

| Roof shape | Construction and limit |
|---|---|
| `skillion` | One slope; direction is downhill, and mapped rise spans the outer edges. |
| `dome`, `onion`, `spherical` | Radial profiles on the wall box with a closed corner apron; mapped rise sets the top. Unequal sides stretch the profile, and no compound roof is inferred. |
| `sawtooth` | Repeated 80/20 slopes, 2–8 teeth at a nominal 6 m repeat; no inferred glazing. |
| `round` | Elliptical barrel with 12 angular segments; large roofs remain visibly faceted. |
| `saltbox` | Offset ridge with equal pitch and unequal 65/35 runs by default. |
| `mansard`, `gambrel` | Shared two-pitch planes; mansard has hipped ends, gambrel upright gables. No dormers are inferred. |
| `half_hipped` | Upper half of the gable is clipped by short hip planes. |
| `pyramidal` | Four faces meet at one apex, even over a long rectangle; no irregular-polygon reconstruction. |

Direction and orientation choose the axis where a roof has one. Profile proportions are appearance defaults;
these shapes do not reconstruct unmapped valleys, glazing or interiors. `attic_windows` fits only below every roof
plane. The mapped footprint and roof suitability rules above still apply.

`tools/building_gallery.py` builds **House**, 128 synthetic labelled examples of production roofs, materials,
building classes and parts, without map downloads. It stages under `out/building-gallery-ac` by default;
`--ac-root` selects an AC installation. The examples test appearance and export, not geographic road behaviour.

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
