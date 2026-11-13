# Editor library and imports

Start with [Editor data flow and Save](editor.md). Implementation names below are relative to `src/` or `ui/src/editor/`.
Ground application/rendering is in [editor-ground.md](editor-ground.md); native helper builds are in [rust.md](rust.md).

## Ownership and UI

| Data | Owner and lifetime |
|---|---|
| `library/materials`, `library/objects` | User-owned immutable packages; excluded from Git, releases and updates |
| `assets/library` | Shipped packages; replaced by updates, combined with user packages by `app/libraryfolders.py` |
| `library/<kind>/hidden.json` | Hides shipped/built-in entries without removing files; importing again unhides them |
| `library/groups` | User-owned mixtures of model ids/settings; deleting a definition leaves planted instances |
| `cache/materials`, `cache/models`, `cache/builtin-objects` | Disposable preparations; retained inputs must rebuild them |
| Track paint/model bundles | Frozen applied inputs; independent of subsequent library deletion and cache clearing |

An own package wins when both libraries have the same id. Importing the same content/settings reuses the existing id/name.
Package publication is atomic. A library import alone changes no track. Updater archive validation rejects a root
`Map2Lap/library` entry; see [release.md](release.md).

File > Library restores browsing state; a ground selection opens Textures, Insert (E) opens Objects. Tabs share searchable,
filtered, paged cards and a preview. Imports open nested dialogs, with shortcuts confined to their fields. Esc cancels only
the top dialog, preserving selection/search beneath it. Apply closes after its preview succeeds; Delete asks confirmation
and affects the library package only. Object pictures share a bounded offscreen-renderer/PNG cache; import previews are live 3D.

## Material packages

`app/materiallibrary.py` retains original colour and optional normal/roughness files, a preview and a relative-path
manifest. Ids bind content, physical X/Y repeat, variation and material properties. Schema 1 remains readable; schema 2
retains all map roles. Colour is sRGB, tangent normals are +Y linear RGB, roughness is the linear red channel. Defaults are
flat normals, roughness 1 and normal scale 1. Originals remain unchanged; role-normalized images are disposable.

Uploads accept PNG/JPG and supported 2D BC1/BC2/BC3 DDS, at most 64 MiB, 8192 px per side and 32 megapixels. Preparation
serializes image work, handles orientation/ICC for colour and preserves alpha, and creates at most 2K power-of-two maps
with at least four pixels per axis for BC blocks. Data maps bypass ICC. High-bit-depth images, packed DDS normals and
unapplied EXIF orientation on normals are refused. Replaced/pending uploads cannot enter a committed material.

Prepared colours are lossless PNG; applied DDS is encoded lazily. Transparent images can stay in the library but cannot
paint ground. Settings before Apply or in the Inspector affect one application: normal enable/strength, roughness enable,
gloss and repetition variation. Maps remain retained when disabled. Library defaults and other applications stay intact.
Application ownership, portable snapshots and native shader limits: [editor-ground.md](editor-ground.md).

## Model packages and conversion

`app/objectlibrary.py` stores a canonical self-contained `original/model.glb` plus immutable scale, anchor, category and
collision choice (`none` or `mesh`). Name/tags/source/licence stay with it. Only the chosen canonical GLB is published;
the uploaded FBX/OBJ/ZIP or unsimplified GLB is not kept as a second original. Prepared uploads are disposable.

`app/modelimport.py` accepts GLB, FBX, OBJ or a ZIP with exactly one FBX/OBJ and companions. Bundled `modelconvert` uses
ufbx; no Blender is needed. FBX units/axes become glTF metre/Y-up; OBJ starts metre/Y-up with adjustable import scale.
Node transforms, hard normals, UV seams and supported material maps survive conversion. Legacy Phong roughness is an
approximation. Bump maps need conversion to tangent normal maps outside this importer; layered images and transforms
must be baked. Non-white vertex colours must be baked into a colour image. Actual animation, skinning and morphs are
refused; constant exported channels are allowed.

The native converter opens only uploaded companions: ZIP paths must be unambiguous/relative, with at most 1024 entries
and 128 MiB unpacked. Temporary/result allocation is capped at 256 MiB each, conversion at 60 seconds. Python then validates
the GLB. `app/modeldata.py` accepts static GLB 2.0 triangles, shared primitive arrays, interleaved attributes, normalized
UVs and embedded PNG/JPG. It bounds metadata, geometry, nodes and images. External resources, required extensions,
sparse accessors, extra vertex attributes/UV sets and unsupported topology are errors, not silently discarded content.

Import choices are baked into the same canonical GLB used for preview, placement and Save:

- **Geometry:** starts at 50%, with Original/75%/25% alternatives. The bundled meshoptimizer has a 1% per-primitive error
  budget; primitives, open borders, hard edges and contact/bounds extrema remain protected. Position/UV-identical corners
  with normals within 1° weld first; UV/normal seams simplify together. Missing normals keep flat faces without
  simplification. No sloppy fallback strips leaves. The cost reports achieved reduction; Add waits for the chosen variant.
- **Texture size:** defaults to 1024 px, maximum 2048; never enlarges. Colour reduction uses linear light and alpha
  weighting, normals are renormalized, other channels stay separate. A normal image reused in another role retains its
  size. Alternative image sources are removed so the browser reads the chosen image.
- **Material colours:** As stored or explicit sRGB correction for base-colour RGB factors only. Names/brightness never
  select it automatically; alpha, textures and emissive values stay unchanged.
- **Surface:** From model or explicit Matte colour, recorded in `extras.map2lap.lighting`. Matte uses scene lights without
  reflection maps/filmic tone mapping. Regular PBR keeps its original shading. Retained legacy Kenney imports retain
  their compatibility profile; Kenney packages are not shipped in the library.

`modelmesh.track_cost` measures scene-expanded native vertices/indices, including splits and optional double-sided
collision, in decimal MB. Shared textures/headers are excluded. The 0.5 MB advisory is a size budget, not an FPS or AC
limit. Old packages are measured lazily by content/revision without rewriting their ids.

## Bindings, drawing and Save

`app/trackmodels.py` freezes a snapshot of canonical GLB plus complete import description before applying it. Ordered
draft `models` bindings hold stable instance ids, asset, anchor, optional source replacement and collision; `placed`
remains authoritative for editable poses. A tree replacement preserves position, clearance, turn and actual height with
a retained uniform fit. Batch replacement is one Undo step; copy/reopen retain the fit.

Insertion/copy uses immediate solid previews until canonical instances draw, including after Esc; failure removes the
preview/history entry. Existing instances can change asset without losing id/pose. Preview lifecycle: [editor-tools.md](editor-tools.md).

`scene/modelDraw.ts` shares actual GLB geometry/materials/textures across instances. Picking uses logical instance roots,
current matrices and alpha testing of those same triangles. Opaque/cutout parts instance by asset/material/256 m cell;
blended parts stay separate for sorting. Moves within a cell update slots; crossing cells rebuilds affected batches.
Instance capacity counts against memory. Models have no per-instance mesh downloads or persistent world-space vertex
arrays. The compatibility mesh endpoint can synthesize a part, but production drawing does not request it.

Server asset geometry/material recipes/piece topology cache separately from binding metadata. Unchanged bindings reuse
exact bounds and face ranges; snapshot revisions/hashes are verified. Active assets remain prepared beyond the recent-asset
LRU's capacity. Save materializes vertices and bundles opaque parts by final tile/prefix/flags; blends stay separate.
Object-list face ranges retain individual ownership. KN5 geometry is per instance; ordinary imported models have no automatic LOD.

Native export handles base colour, OPAQUE/MASK/BLEND and double-sided faces. It does **not** export equivalent GLB
normal/roughness/metallic shading, although the browser and retained GLB keep those inputs. Base-colour transforms are
refused at binding. Units, node transforms and anchor apply once; mirrored nodes reverse winding and use inverse-transpose
normals. Missing normals become flat faces. `none` writes `nocol_`; `mesh` adds invisible double-sided `1WALL_` collision.
Visual replacement removes only the selected source render faces, preserving its collision and unrelated geometry.

Render faces are written once; the owned CSP include supplies `CULL_MODE = NONE`. Pieces stay within 65,535 vertices;
BLEND keeps smaller chunks because AC sorts a whole transparent mesh. Invalid indices are refused. Texture recipes defer
encoding until Save: power-of-two DDS at most 2048 px, BC1 opaque/BC3 alpha, full mips. Mips use linear-light alpha-weighted
colour; MASK keeps binary coverage at each level so distant leaves do not become a screen door. Images share by all pixel
inputs; unused owned images drop from subsequent KN5s.

`data/map2lap_models` retains snapshots once per asset. `compiled.json` binds generated regions and consumed replacements
to the KN5 SHA256. Without library/preparation/source caches, retained model bindings, deletions and poses remain editable.
Regeneration strips prior owned render regions, reuses materials and never removes a consumed source replacement twice.
Inherited height edits apply only to regenerated models, not the already baked source. Originals needed by local Undo
are retained before removing their last binding.

## Built-in objects

`assets/builtin-objects.json`, `app/builtinobjects.py` and `scenery/catalogue.py` expose Map2Lap trees/bushes, rocks, parked
cars and furniture/utility objects. The generator's builders supply their geometry/artwork, with Map2Lap and BeamNG.Earth
MIT notices. Packages are prepared on demand; deleting one hides it. Continuous terrain/road/building outlines are not
freestanding models. Consult the catalogue for counts rather than copying them into documentation.

Library trees retain ordinary model bindings, including Groups/Undo, but their snapshot also freezes TreeFX `.bin` LODs.
`app/modeltrees.py` serves/draws those through TreeFX and writes `trees.txt`; shared GLB roots provide picking/bounds only.
No tree vertices or duplicated colour maps enter KN5. Preview remains until the native tree draws. The portable bundle
keeps native model, GLB, metadata and notices.

Other built-ins use ordinary native meshes, preserving solid/decorative parts. Lamp glass carries `m2lLamp`; Save's CSP
include uses the generator's `scenery/lamps.py` lighting rule. Transform/delete follows saved geometry. Lamp shadows remain
disabled; the Editor shows glass/cones, while road illumination is visible in AC.

## Object groups

The Groups tab stores mixtures of up to 32 distinct models, non-negative weights, size ranges and Random size/turn and
Random position switches. At least one weight is positive. `library/groups/<id>.json` writes atomically; missing members
remain removable from a readable definition. Settings edits a copy until Save. Deleting a group leaves placed models.
The patch/cost represents rounded weights (at least one for positive weight); the brush uses their proportions.

Paint group saves the mixture then stamps/brushes onto loaded terrain. Radius, plants per 100 m² and minimum foot spacing
control it. `tools/scatter.worker.ts` uses a frozen stroke seed and lattice-cell-derived candidates: growing a stroke
doesn't reshuffle it, holding still doesn't accumulate, and random-off produces rows without changing other random draws.
A spatial hash enforces spacing against candidates/existing imported instances. Limits are 2000 plants/20,000 candidates;
uniform thinning avoids filling only one side. Missing ground, water and decks are not planting surfaces.

The hover preview approximates local terrain from a grid; placement samples under each model's foot centre and eight
surrounding points, using the lowest ground to avoid floating on slopes. The foot uses the lowest tenth of model height.
Each completed stroke prepares bounded `/model` instances, validates every pose, freezes each unique asset once and
commits bindings/poses through `TrackEdits.addModels` as one verified Undo step. Solid local groups survive Esc until all
canonical instances draw; refusal removes the entire group and reports the error. Unfinished strokes cancel their preview.
