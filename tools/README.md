# Tools

Before writing a probe, look here first: a question below has its tool in `tools/`, and each tool's `--help` has its commands. A new tool gets its
line here (`engine/tests/test_tools.py`).

| The question | The tool |
|---|---|
| Preview visual rain/snow, native fog and wind on Heiligenblut in public CSP, with reversible launch and live reload | `weather_preview/run.py [--mode auto\|rain\|snow\|off]`, `weather_preview/update.py [--check]`; see `weather_preview/README.md` |
| Pass/fail checks: unit tests and a short kn5 build | `check.py [--fast | <test file>]` |
| A mark or a recorded drive from AC: what did the car feel, on what, where, on which side of the line? | `mark.py [track]`, then `docs/ac-reports.md` |
| All the data about a spot at once: map picture, roads and tags, heights, plans, decks, walls, surface, vegetation | `spot.py <track> --route <m>` |
| What grows at a spot and why it looks so: climate zone, land cover, ground painted, the map's areas, trees and bushes by sprite, the tile's cap | `plants.py <track> --route <m>` |
| The part of a long track that holds a bug, built into AC to drive it, a test track's not to be taken for | `debug_stretch.py <track> <from m> <to m>` |
| Drives like grass: which physics (1ROAD, 1GRASS) lies under the line? | `measure.py <track> --surface --from <m> --to <m>` |
| Why is the ground at a spot road or grass: the map's roads there, each painting step | `ground_paint.py <track> <AC x> <AC z>` |
| Why does the ground lie at that height: elevation, grading, water, each plan's share, the decks | `heights.py <track> --from <m> --to <m> [--plans] [--decks]` |
| Why does this one ground point lie at that height: each plan's height there, who gives way, the point without each plan | `heights.py <track> --at <AC x>,<AC z>` |
| How did a road's heights come about: elevation, its pins, each step of the planner | `heights.py <track> --from <m> --to <m> --road <name or id> --steps` |
| What does the spot look like: carriageways, names, drawn asphalt, the plans' widths (look first) | `map_spot.py <track> --route <m>`, then Read the PNG |
| Which surface is that bump: deck, junction pad or ground? At the lanes you ask for? | `measure.py <track> --profile --from <m> --to <m> [--across -8,-4,0,4,8]` |
| Which bridge part is here: does it tilt or lie level and why, what meets at its ends, is a pad paved there and why? | `heights.py <track> --from <m> --to <m> --decks` |
| A spot's G, steps, ground over a deck, against the reference | `measure.py <track> [--from <m> --to <m>]` |
| Holes in the ground, in the whole built area | `measure.py <track> --holes`, `check_drive.py` |
| Why does a wall between two roads stand there or not: each test per segment; does ground stand in front of its cut line? | `heights.py <track> --from <m> --to <m> --walls`, `measure.py <track> --walls` |
| A road beside the route: its profile, the ground across it, what it lies on | `heights.py <track> --from <m> --to <m> --road <name or id>` |
| Does the land away from the roads lie where the elevation and the map say: hillsides gone, water on land, water walls, a map area that is no water? | `surroundings.py <track>`, then Read the PNG |
| A tunnel portal's heights | `portal.py <track> <AC x> <AC z>` |
| The track of a report, built as its sender built it | `from_debug.py <session folder>` |
| A stretch built again fast, with its profile | `stretch.py` |
| Did a change leave the tracks as they were, and if not, what moved and where (AC x, z, route metre)? | `compare_parts.py` (all a build leaves up to the OBJ), `compare_kn5.py` (kn5) |
| Why is a build slow: which step, what are the workers doing? | `watch_build.py`, then start the build |
| Why did this build differ from another: which worker built a tile after which, each cell's plan, each fault? | `build_trace.py <track> [--tile x,y]` |
| Does the same code build the same, round after round (minutes a round: before a merge or a release)? | `stability.py` |
| Which code does a build really run (before deleting code)? | `coverage.py` |
| What did a build make: shapes per tile, a kn5's materials | `inspect_tiles.py`, `read_kn5.py` |
| What does a track take of the Editor's memory limit: meshes by kind, textures, how far each limit reaches | `editor_memory.py <track>` |
| Can ground render regions retain every material at soft junctions and with filtering, and what textures/draws do they need? | `ground_regions.py [--size 2048] [--materials 12] [--gpu] [--hardware]` (CPU and WebGL prototypes; actual backend reported, no AC/FPS verdict) |
| A native crash (an access violation without a stack) | `crash.py` |
| Build the Rust module, read a DLL's imports | `build_native.py`, `pe_imports.py` |
| Build the Editor's portable Rust geometry kernel for browser workers | `build_editor_geometry.py` |
| Make a release, test its update | `make_release.py`, `test_update.py` |
| The CC0 textures a clone lacks | `get_textures.py` |
| The Editor's shipped library (`assets/library`, packed by `make_release.py`): every shown CC0 object of `library/` simplified, textures as they are | `build_library.py [--level 25]` |
| Painted ground materials for `library/`: every look the build draws (land covers, roads, verge, streams, rock faces) and snow/rock/scree/grass mixtures, in the build's colours, with normal and roughness maps | `painted_ground.py --out <folder> [--import] [--only <names>]` |
| Build the bundled FBX/OBJ import converter for Windows and Linux | `build_modelconvert.py` |
