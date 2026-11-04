"""A tile worker process's state and jobs: the generator's pool (generator._init_worker) builds _State once per
process; its jobs are the road tiles (_roads_tile), their signs (signs_tile) and the AI road graph (navgraph). The
state keeps its own DEM reader, road plans (grading.Grader per anchor), street widths, height chunks and land-cover
reader over the shared disk caches; all of them are deterministic, so every process builds the same tile.
"""
import logging
import os
import threading
import time

import numpy as np

import dem as demmod
import furniture
import geodesy
import grading as gradingmod
import heightmap
import mapdata as mapdatamod
import netfetch
import plancache
import roadwidth as roadwidthmod
import seacarve as seacarvemod
import surface as surfacemod

log = logging.getLogger("earthd.blockworker")

_s = None       # this process's state (init)


class _State:
    def __init__(self, cache_dir, offline, roads, grading, road_widths, surface, sea=False, gas_stations=False):
        self.cache_dir = cache_dir
        import revisit
        revisit.CACHE_DIR = cache_dir
        net = netfetch.Fetcher(offline=offline)
        self.dem = demmod.Dem(os.path.join(cache_dir, "dem"), fetcher=net)
        import railways as _railways    # (coarse elevation: rail decks raised over the roads under them)
        _railways.COARSE_AT = self.dem.coarse_at
        md =mapdatamod.MapData(cache_dir, fetcher=net) if (roads or surface or sea) else None
        if md is not None:
            md.dem = self.dem       # (gradesep's ground)
        # the sea's and the lakes' floors carved in (--sea on)
        self.sea = seacarvemod.SeaCarver(md, cache_dir, dem=self.dem) if sea else None
        self.md = md if roads else None
        import fra
        self.fra = fra.Crossings(cache_dir, net) if roads else None     # (the US's level crossings' devices)
        self.grading = bool(grading) and self.md is not None
        self.widths = (roadwidthmod.RoadWidths(
            lambda key: md.cell(key, layers=("buildings",), kind="demand").layers.get("buildings"),
            roadwidthmod.store_dir(cache_dir, md)).get
            if road_widths and self.md is not None else None)
        self.surface = surfacemod.Surface(md) if surface else None
        if self.surface is not None:    # gas station forecourts painted asphalt (--gas-stations on)
            self.surface.gas_pads = bool(gas_stations)
        self.graders = {}           # anchor id -> grading.Grader
        self.chunks = {}            # anchor id -> heightmap.ChunkCache
        self.bridges = {}           # (unused since the chain stores: _chain_store)
        self.tunnels = {}           # (unused since the chain stores: _chain_store)
        self.lock = threading.Lock()
        self.want = []              # (grader, cell key) to plan, most urgent first
        self.cv = threading.Condition()

    def anchor(self, aid, lat, lon):
        """(Grader or None, ChunkCache) of an anchor; only the last few anchors are kept."""
        with self.lock:
            if aid not in self.chunks:
                frame = geodesy.EnuFrame(lat, lon)
                self.chunks[aid] = heightmap.ChunkCache()
                if self.grading and getattr(self, "plan_store", None) is None:
                    # (one store for every anchor: the plans are the planning regions', whatever the anchor)
                    self.plan_store = gradingmod.PlanStore(
                        self.md, lambda la, lo: self.dem.sample(la, lo, gradingmod.PROFILE_ZOOM), self.widths)
                    # (its tunnels' drowned question asked of the road tiles' chain store: resolved once for both)
                    self.plan_store.tunnel_store = lambda: self.__dict__.get("chain_stores", {}).get("tunnels")
                self.graders[aid] = (gradingmod.Grader(frame, self.md, self.plan_store.elev, self.widths,
                                                       store=self.plan_store)
                                     if self.grading else None)
                if self.graders[aid] is not None:
                    self.graders[aid].wet = self.sea.depth if getattr(self, "sea", None) is not None else None
                    self.graders[aid].dem = self.dem          # (its urgent lane: _plan_missing)
                    self.graders[aid].shared = plancache.for_grader(self.cache_dir, self.graders[aid], self.widths,
                                                                   self.graders[aid].wet)
                for old in sorted(self.chunks)[:-ANCHORS_KEPT]:
                    del self.chunks[old], self.graders[old]
            return self.graders[aid], self.chunks[aid]


ANCHORS_KEPT = 2
SIGNALS_MARGIN_M = 60.0         # m around a road tile its junctions' mapped traffic signals are taken from
WATER_BED_M = 0.05           # ground carved deeper than this under the water gets the bed layer (MUD)


def _warm_loop():
    while True:
        with _s.cv:
            job = None
            while job is None:
                job = next(((g, k) for g, k in _s.want if not g.planned(k)), None)
                if job is None:
                    _s.cv.wait()
        try:
            t0 = time.perf_counter()
            job[0].warm(job[1])
            log.debug("road plans ahead: %s in %.2f s", job[1], time.perf_counter() - t0)
        except Exception:
            log.exception("road plans ahead for %s", job[1])
            with _s.cv:
                _s.want = [w for w in _s.want if w[1] != job[1]]


def ground(frame, la, lo, z):
    """The DEM heights z at (la, lo) shaped before the road grading: the sea floor carved in (--sea on)."""
    if _s.sea is not None:
        z = _s.sea.carve(la, lo, z)
    return z


def _chain_store(name, cls, elev, setup=None):
    """This process's roads.ChainStore `name` (one per purpose: every anchor's tiles share it), made on first use with
    elev (the physics ground: its values are the same whatever the anchor, the plans being the planning regions')."""
    import roads as roadsmod
    with _s.lock:
        stores = _s.__dict__.setdefault("chain_stores", {})
        got = stores.get(name)
        if got is None:
            got = stores[name] = roadsmod.ChainStore(
                cls, lambda key: _s.md.cell(key, layers=("roads",), kind="demand").layers.get("roads"), elev, setup)
        elif got.elev is None and elev is not None:     # (made as another's preferred one, reading only)
            got.elev = elev
            for st in list(got.stores.values()):
                st.elev = elev
        return got


def _bridge_setup(p):
    sea = getattr(_s, "sea", None)
    p.wet = sea.depth if sea is not None else None        # (decks clear the water: roads.water_clear)
    p.infra_fn = lambda key: _s.md.cell(key, layers=("infrastructure",), kind="demand").layers.get(
        "infrastructure")                                   # (bridge:structure tags: bridgetypes)


def _bridges(aid, frame, elev):
    """The anchor's view (roads.ChainView) of this process's bridge chains (deck heights of whole chains, each solved
    once whatever the anchor: roads.ChainStore)."""
    import roads as roadsmod
    return roadsmod.ChainView(_chain_store("bridges", roadsmod.BridgeProfiles, elev, _bridge_setup), frame)


NAV_GRADED_M = 900.0        # m (Chebyshev) round the AI graph's centre where its ground is graded in full: the road tiles'
                            # reach (roads.SEND_M + a tile), whose cells they plan anyway; beyond, only planned cells


def _nav_bridges(aid, frame, elev):
    """The AI graph's view of the bridge chains: the road tiles' decks where solved (one profile per chain), else its
    own chains' (elev grades only the planned cells)."""
    import roads as roadsmod
    return roadsmod.ChainView(_chain_store("nav_bridges", roadsmod.BridgeProfiles, elev, _bridge_setup), frame,
                              prefer=_chain_store("bridges", roadsmod.BridgeProfiles, elev, _bridge_setup))


def navgraph(aid, lat, lon, zoom, x, y, out_dir, vfs_dir, serial, left_hand, mph, rules):
    """earthd.Server.build_navgraph here (a road-tile process): the AI road graph around (x, y) written to out_dir;
    returns (vfs path, nodes, edges), in a road process (in the server's interpreter it cost 13 s of its CPU in a
    4-minute drive). Past NAV_GRADED_M the ground is graded only under cells planned already."""
    import navgraph as navgraphmod
    import mapcells
    g, _ = _s.anchor(aid, lat, lon)
    frame = geodesy.EnuFrame(lat, lon)
    w = navgraphmod.WINDOW_M + 200.0
    la, lo, _ = frame.enu_to_geodetic(np.array([x - w, x + w]), np.array([y - w, y + w]), 0.0)
    keys = mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max()))
    feats = [_s.md.cell(k, layers=("roads",), kind="demand").layers.get("roads") for k in keys]

    def elev(la_, lo_):         # the physics ground, lifted under roads (as the road tiles'); past their reach
        z = ground(frame, la_, lo_, _s.dem.sample(la_, lo_, zoom))     # (NAV_GRADED_M) only under cells planned already
        if g is None:
            return z
        la_, lo_, z = np.asarray(la_, np.float64), np.asarray(lo_, np.float64), np.asarray(z, np.float64)
        e, n, _ = frame.geodetic_to_enu(la_.ravel(), lo_.ravel(), 0.0)
        near = np.maximum(np.abs(np.asarray(e) - x), np.abs(np.asarray(n) - y)).reshape(la_.shape) <= NAV_GRADED_M
        out = np.array(z, np.float64, copy=True)
        if near.any():
            out[near] = g.apply(la_[near], lo_[near], z[near], gradingmod.ROAD_LIFT)
        if (~near).any():
            out[~near] = g.apply(la_[~near], lo_[~near], z[~near], gradingmod.ROAD_LIFT, planned_only=True)
        return out
    decks = {}
    try:
        # (its own deck heights, on that ground: the road tiles' profiles plan every cell they touch, and the graph's
        # 2.2 km window planned ~50 cells, minutes of a road process on a Windows PC)
        for fid, _spec, xy, z, _lon in _nav_bridges(aid, frame, elev).parts(feats, (x - w, y - w, x + w, y + w)):
            decks.setdefault(fid, []).append((np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64)))
    except Exception as e:          # no decks: the graph follows the ground under bridges
        log.debug("navgraph decks: %s: %s", type(e).__name__, e)
    urban = _s.surface.urban if _s.surface is not None else None
    graph = navgraphmod.build(frame, feats, elev, (x, y), urban, decks=decks, widths=_s.widths, left_hand=left_hand,
                              mph=mph, signals=furniture.signals_for(_s.md, frame, keys))
    graph["rules"] = rules
    path = navgraphmod.write(out_dir, vfs_dir, aid, serial, graph)
    return path, len(graph["nodes"]), len(graph["edges"])


def signs_tile(aid, lat, lon, zoom, tx, ty, out_dir, vfs_dir, left_hand=False, mph=True, country=None):
    """signstream.build_tile here: the highway signs of a road tile the mod has, in a road
    process: its map cells are warm there. Returns (vfs path of the sign tile's JSON, number of meshes)."""
    import signstream
    g, _ = _s.anchor(aid, lat, lon)
    frame = geodesy.EnuFrame(lat, lon)

    def elev(la, lo):           # the graded ground, as the road tile's
        z = ground(frame, la, lo, _s.dem.sample(la, lo, zoom))
        return g.apply(la, lo, z, gradingmod.ROAD_LIFT) if g is not None else z
    return signstream.build_tile(_s.md, frame, aid, tx, ty, elev, out_dir, vfs_dir,
                                 _s.surface.urban if _s.surface is not None else None, _s.widths, left_hand, mph,
                                 country)


# Phase 0 of the origin-independent tiles (geotiles): a road tile's stages timed. "content" stages make what does not
# depend on the anchor but for its placement (buildings, decks, tunnels, walls, wires, rails, props, guardrails,
# parking, fuel, wells, sound); "skin" stages follow the anchor's 2 m lattice and height quantum (the draped road mesh,
# plazas, sidewalks / walk collision in write_tile); "shared" are the stores both read (grading plans, chain profiles).
TILE_STAGE_KIND = {"warm": "shared", "anchor": "shared", "profiles": "shared", "fuel": "content", "items": "content",
                   "build_tile": "content", "rails": "content", "doors_park": "content",
                   "markings": "content", "guardrails": "content", "medians": "content", "mesh": "skin",
                   "plazas": "skin", "deck_mesh": "content", "tunnel_mesh": "content", "railways": "content",
                   "bld": "content", "powerlines": "content", "write": "skin"}
_tile_stages = threading.local()


def _stage_clock():
    """(stages {name: s}, mark(name)): this thread's road tile stage timers, started now (last_tile_stages)."""
    stages = _tile_stages.last = {}
    clock = [time.perf_counter()]

    def mark(name):
        t = time.perf_counter()
        stages[name] = stages.get(name, 0.0) + t - clock[0]
        clock[0] = t
    return stages, mark


class _Parts:
    """What a road tile is built from and made of (_tile_parts): its chunks and their context, its sidewalk pieces,
    the meshes and rows of everything else."""


def _tile_parts(mark, frame, tile, zoom, g, buildings, left_hand, mph, gas_stations, buried, lamp_region, country,
                q, rkey, centre, skin_margin=0.0, walks_raw=None):
    """A road tile's parts in frame: tile (tx, ty) of an anchor, or a geotiles.GeoBox (its own frame, no anchor in
    it). g: the frame's grading.Grader view (None: no grading); q: the height quantum the sidewalks' curbs are put on
    (None: the ground as it is: a geotile's content); rkey: the railways' ground cache key; centre (lat, lon): the
    place's (the brick pavement's region). skin_margin, walks_raw: roads.build_tile's (a geotile's skin pieces)."""
    import parking as parkingmod
    import rails as railsmod
    import roadmesh as roadmeshmod
    import roads as roadsmod
    tx, ty = (tile, None) if hasattr(tile, "box") else tile
    P = _Parts()
    # everything the tile will ask for, fetched at once (one after another, a fresh place's first tile took ~1 min)
    _s.md.warm(roadsmod.tile_needs(frame, tx, ty, buildings, _s.widths is not None,
                                   1 + seacarvemod.LINE_CELLS if _s.sea is not None else 0))
    if getattr(_s, "fra", None) is not None:       # (the US's level crossings' devices, alongside)
        _s.fra.prefetch(roadsmod.cells_of_tile(frame, tx, ty))
    mark("warm")
    cells = [_s.md.cell(k, layers=("roads",), kind="demand").layers.get("roads")
             for k in roadsmod.cells_of_tile(frame, tx, ty)]
    mark("anchor")

    def elev(la, lo):           # the physics ground (lifted under roads: grading.ROAD_LIFT)
        z = ground(frame, la, lo, _s.dem.sample(la, lo, zoom))
        return g.apply(la, lo, z, gradingmod.ROAD_LIFT) if g is not None else z
    P.elev = elev
    bridges = _bridges(None, frame, elev)
    if g is not None:
        bridges.plans_at = lambda xy: g.plans(*map(np.asarray, frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)[:2]))
        bridges.cs.set_road_end(gradingmod.road_end_reader(g))
    tunnels = tunnel_profiles(None, frame, elev, g)
    P.bridges, P.tunnels = bridges, tunnels
    mark("profiles")
    walks = []
    urban = _s.surface.urban if _s.surface is not None else None
    fuel, skip, fuel_cuts, fuel_pads = [], frozenset(), [], []
    if gas_stations:                    # pumps and refuel areas; their canopy outlines left out of the buildings
        import gasstations
        fuel, skip = gasstations.tile_sites(frame, tx, ty, _s.md, elev, cuts=fuel_cuts, pads=fuel_pads)
    mark("fuel")
    props = [] if buildings else None
    lines = [] if buildings else None
    wires = [] if buildings else None
    park = [] if buildings else None
    items = town = None
    box = roadsmod.tile_bbox(tx, ty)
    side = roadsmod.tile_side(tx, ty)
    if buildings:
        import buildings as buildingsmod
        # (on the graded ground, the one the terrain is drawn with: on the raw elevation a building beside a road's
        # cutting stood over the cut; hashk014's PR #69)
        items = buildingsmod.road_tile_items(frame, tx, ty, _s.md, elev, decks=_tile_decks(bridges, cells, tx, ty),
                                             skip=skip, country=country)
        town = buildingsmod.coverage(items, side) < buildingsmod.POLES_COVERAGE
    mark("items")
    rwalls = []
    rcuts = []                          # the lines the ground is cut along at walls between two roads (roads.retaining_walls)
    rgalleries = []                     # the avalanche galleries' roofs (roads.tile_galleries)
    ctx = []
    cell_fn = lambda key: _s.md.cell(key, layers=("roads",), kind="demand").layers.get("roads")   # noqa: E731

    def drawn(la, lo):          # the block's ground: raised over the low arches as the terrain is (_make_heightmap)
        return roadsmod.block_arch_raise(tunnels, cell_fn, frame, la, lo, elev(la, lo),
                                         (box[0] - 8, box[1] - 8, box[2] + 8, box[3] + 8))
    P.drawn = drawn
    cover = []                          # the ground carriageways for the decks' parapets (roadmesh.deck ground=)
    marks = []                          # stall lines along parking aisles (parking.finish_markings adds the lot polygons')
    near_roads = []                     # the ground carriageways near the tile (the median barriers': medians.tile_rows)
    aisles = set()                      # its parking aisles (parking.through_roads: the lots' stalls clear of the others)
    chunks = roadsmod.build_tile(frame, tx, ty, cells, elev, urban, walks=walks, deck_context=ctx, bridges=bridges, widths=_s.widths,
                                 walk_cuts=fuel_cuts,    # (the stations' made-up driveways: no sidewalk across them)
                                 props=props, lines=lines, wires=wires, town=town, park=park,
                                 left_hand=left_hand, mph=mph, buried=buried, lamp_region=lamp_region, country=country,
                                 structures=buildingsmod.centres(items, tx, ty) if items else (),
                                 tunnels=tunnels, walls=rwalls, wall_cuts=rcuts, galleries=rgalleries,
                                 ground=lambda x, y: roadmeshmod.drawn_ground(frame, drawn, np.c_[x, y], q),
                                 terrain_paint=getattr(_s, "surface", None) is not None, cover_out=cover, marks=marks,
                                 roads_out=near_roads, aisles_out=aisles, skin_margin=skin_margin, walks_raw=walks_raw,
                                 signals=furniture.signals_for(_s.md, frame,
                                                               roadsmod.cells_of_tile(frame, tx, ty, SIGNALS_MARGIN_M)))
    mark("build_tile")
    chunks += railsmod.tile_chunks(frame, tx, ty, cells)     # railway and tram tracks on the ground
    mark("rails")
    x0, y0, _, _ = box
    if items is not None:               # front doors and shopfronts, driveways into the road mesh
        drives = []
        props.extend(buildingsmod.doors(items, lines, x0, y0, drives))
        props.extend(buildingsmod.toll_booth_rows(items, x0, y0))
        drives.extend(buildingsmod.garage_drives(items, lines, x0, y0))
        chunks += drives
        park = parkingmod.clear_of(park, props, drives)
        park = parkingmod.tile_lot_spots(frame, tx, ty, _s.md, elev, items, park, near_roads, aisles)
        if fuel:
            import gasstations
            park = gasstations.clear_park(park, fuel)
        buildingsmod.brick_walks(walks, items, centre[0], centre[1], side)
        if walks_raw is not None:
            buildingsmod.brick_walks(walks_raw, items, centre[0], centre[1], side)
    mark("doors_park")
    chunks += parkingmod.finish_markings(frame, tx, ty, _s.md, elev, items, marks, near_roads, aisles)
    mark("markings")
    # Share the bridge mesh's exact parapet geometry with the tile builder.
    # (the junction pads on the bridges round the tile: their decks' parapets stop at them; the tile draws its own:
    # roads.deck_pads)
    try:
        pad_parts = list(bridges.parts(cells, (box[0] - 40, box[1] - 40, box[2] + 40, box[3] + 40)))
        pads_near = roadsmod.deck_pads([(f, sp, xy, z) for f, sp, xy, z, _lon in pad_parts], near_roads, box,
                                       bridges._ground, own=False, bridges=bridges)
    except Exception as ex:
        log.warning("deck pads: tile %s_%s: %s: %s", tx, ty, type(ex).__name__, ex)
        pads_near = []
    pads = [p for p in pads_near if roadsmod.box_owns(box, float(p[1][0]), float(p[1][1]))]
    parapets = roadmeshmod.parapet_runs(chunks, ctx, ground=cover, pads=pads_near)
    import guardrails as guardrailsmod
    infra_fn = lambda key: _s.md.cell(key, layers=("infrastructure",), kind="demand").layers.get("infrastructure")
    low_parapet_decks = set()
    deck_parts = []                 # the bridges' parts near the tile (the median barriers' on joined decks too)
    try:
        deck_parts = list(bridges.parts(cells, (box[0]-10, box[1]-10, box[2]+10, box[3]+10)))
        guardrail_decks = [{"n": np.column_stack((xy, z)), "w": spec.width}
                           for _fid, spec, xy, z, _lon in deck_parts]
        guardrail_rows = guardrailsmod.forest_rows(frame, infra_fn, box, elev,
                                                   decks=guardrail_decks, parapets=parapets,
                                                   bridge_rails=roadmeshmod.BRIDGE_RAILS,
                                                   supported_decks_out=low_parapet_decks)
    except Exception as ex:
        log.warning("mapped guardrails: tile %s_%s: %s: %s", tx, ty, type(ex).__name__, ex)
        low_parapet_decks.clear()
        guardrail_rows = []
    mark("guardrails")
    guardrail_rows = guardrail_rows + _median_rows(frame, near_roads, box, elev, left_hand, country, guardrail_rows,
                                                   tx, ty, deck_parts)
    guardrail_rows = roadsmod.tilt_rows_on_decks(guardrail_rows, deck_parts, bridges)
    mark("medians")
    P.dmesh = roadmeshmod.deck(chunks, (x0, y0, 0.0), bridges.piers_in(box), ctx, bridges.beams_in(box), ground=cover,
                               parapets=parapets, low_parapet_decks=low_parapet_decks, pads=pads)
    mark("deck_mesh")
    P.tmesh = roadmeshmod.tunnel(chunks, (x0, y0, 0.0), rwalls, rgalleries)
    P.wall_cuts = rcuts
    mark("tunnel_mesh")
    import railways
    rcells = [cell_fn(k) for k in roadsmod.cells_of_tile(frame, tx, ty, railways.REACH_M)]
    rground = railways.point_ground(frame, elev, rkey)
    fra_kits = None                 # (the US: the FRA inventory's gates and lamps, else the road classes')
    if getattr(_s, "fra", None) is not None:
        try:
            fra_kits = _s.fra.kits(frame, roadsmod.cells_of_tile(frame, tx, ty))
        except Exception as e:
            log.debug("fra kits: %s: %s", type(e).__name__, e)
    rr_kits = railways.crossing_props(frame, tx, ty, rcells, rground, left_hand, fra_kits)   # level crossings
    if rr_kits:
        props = (props or []) + rr_kits
    P.rmesh = railways.tile_mesh(frame, tx, ty, rcells, rground,
                                 far_ground=railways.point_ground(
                                     frame, lambda la, lo: ground(frame, la, lo, _s.dem.sample(la, lo, zoom)),
                                     ("raw",) + tuple(rkey)))
    mark("railways")
    bld = None
    garage_sound = ()
    oil_wells = []
    if buildings:
        import buildings as buildingsmod
        import oilwells
        bld = buildingsmod.road_tile(frame, tx, ty, _s.md, elev, None, None, items)
        mark("bld")
        garage_sound = buildingsmod.garage_sound_boxes(items, *box[:2], roadsmod.SOUND_GARAGE)
        oil_wells = oilwells.tile_wells(frame, tx, ty, elev)     # (the mod's pump jacks)
        import powerlines
        # high-voltage towers and conductors, on the ground as the DEM has it: graded heights at towers up to a span
        # past the tile planned the grading of 12 more map cells per road tile (16 cells planned, 40 roads cells read
        # for one Szeged tile against 1.6.3's 4 and 16; the grading only moves ground near roads, which towers keep off)
        powerlines.tile_lines(frame, tx, ty, _s.md, lambda la, lo: ground(frame, la, lo, _s.dem.sample(la, lo, zoom)),
                              props, wires)
        import industry
        garage_sound = (garage_sound + industry.refinery_sound_rows(frame, tx, ty, _s.md, elev)
                        + industry.power_plant_sound_rows(frame, tx, ty, _s.md, elev))
        mark("powerlines")
    P.chunks, P.ctx, P.walks, P.box, P.origin = chunks, ctx, walks, box, (x0, y0, 0.0)
    P.bld, P.props, P.wires, P.park, P.fuel, P.fuel_pads = bld, props, wires, park, fuel, fuel_pads
    P.footprints = buildingsmod.ground_rings(items, *box[:2], classes=True) if buildings and items else None
    P.guardrail_rows, P.garage_sound, P.wells = guardrail_rows, garage_sound, oil_wells
    return P


def _roads_tile(aid, lat, lon, zoom, tx, ty, out_dir, vfs_dir, sidewalks, lift, buildings, left_hand, mph, q,
                gas_stations, buried=0.0, lamp_region=None, country=None):
    """An anchor's road tile (tx, ty) built and written (the anchor tiles: --geo-tiles off, an older mod)."""
    import roadmesh as roadmeshmod
    import roads as roadsmod
    _stages, mark = _stage_clock()
    frame = geodesy.EnuFrame(lat, lon)
    g, _ = _s.anchor(aid, lat, lon)
    P = _tile_parts(mark, frame, (tx, ty), zoom, g, buildings, left_hand, mph, gas_stations, buried, lamp_region,
                    country, q, (aid, lat, lon), (lat, lon))
    mesh = roadmeshmod.build(frame, P.chunks, P.elev, P.origin, lift, clip=P.box, follow=True, q=q, drawn=P.drawn,
                             context=P.ctx)
    mark("mesh")
    mesh = _with_plazas(mesh, frame, P.box, P.elev, P.origin, getattr(_s, "surface", None))
    mark("plazas")
    out = roadsmod.write_tile(out_dir, vfs_dir, aid, tx, ty, P.chunks, P.walks if sidewalks else None, mesh, P.dmesh,
                              P.bld, P.props, P.wires, P.park, tunnel_mesh=P.tmesh, fuel=P.fuel, rail_mesh=P.rmesh,
                              guardrail_rows=P.guardrail_rows, garage_sound=P.garage_sound,
                              wells=P.wells, footprints=P.footprints) + (P.fuel_pads, P.wall_cuts)
    mark("write")
    return out


# --- road geotiles (phase 1c): content once per geotile, a skin per anchor ----------------------------------------

EXACT_TOL_COL_M = 0.03      # m a colliding part placed rigidly may be off before it gets its exact variant ...
EXACT_TOL_M = 0.10          # ... and a render-only part


def _clip_mesh(mesh, origin, quad):
    """A mesh (positions relative to origin, tris, uvs, materials, tri material) cut to quad (4, 2: a geotile's, in the
    mesh's world; earthfast.clip_tris_convex), or None when nothing is left."""
    import fast
    import geotiles
    if mesh is None:
        return None
    P, T, UV, mats, M = mesh
    if not len(T):
        return None
    fast.require(geotiles.NEED_CONTENT, "clip_tris_convex")
    o = np.asarray(origin, np.float64)
    q = np.ascontiguousarray(np.asarray(quad, np.float64)[:, :2] - o[:2])
    P2, UV2, T2, src = fast._ef.clip_tris_convex(np.ascontiguousarray(np.asarray(P, np.float64)[:, :3]),
                                                 np.ascontiguousarray(np.asarray(UV, np.float64)[:, :2]),
                                                 np.ascontiguousarray(np.asarray(T, np.int64)), q)
    if not len(T2):
        return None
    used = np.unique(T2)
    remap = np.full(len(P2), -1, np.int64)
    remap[used] = np.arange(len(used))
    return P2[used], remap[T2], UV2[used], mats, np.asarray(M)[src]


def _median_rows(frame, near_roads, box, elev, left_hand, country, mapped, tx, ty, decks=()):
    """The median barriers' Forest rows of a road tile (medians.tile_rows; none where the mapped rows have one; decks:
    the bridges' parts near it), [] if they fail (logged: the tile goes on without them)."""
    import medians
    try:
        return medians.tile_rows(frame, near_roads, box, elev, left_hand, country, mapped, decks)
    except Exception as ex:
        log.warning("median barriers: tile %s_%s: %s: %s", tx, ty, type(ex).__name__, ex)
        return []


PLAZA_GEO_MARGIN_M = 12.0    # m past a geotile's quad its skin's plazas are made (then cut exactly at the quad)


def _with_plazas(mesh, frame, box, elev, origin, surface, quad=None):
    """The road mesh with the tile's squares and pedestrian areas paved (plazas.py) over box (x0, y0, x1, y1), from the
    cached land use (none when it is not cached yet: surface.Surface.lots never waits). quad (4, 2): a geotile's skin:
    the plazas made PLAZA_GEO_MARGIN_M past the box and cut exactly at the quad (as its road mesh)."""
    if surface is None or not hasattr(surface, "lots"):
        return mesh
    import plazas
    try:
        if quad is not None:
            m = PLAZA_GEO_MARGIN_M
            box = (box[0] - m, box[1] - m, box[2] + m, box[3] + m)
        la, lo, _ = frame.enu_to_geodetic(np.array([box[0], box[2]]), np.array([box[1], box[3]]), np.zeros(2))
        rings = plazas.polygons(surface.lots(la, lo))
        if not rings:
            return mesh
        cover = None
        if mesh is not None and len(mesh[1]):
            P, T = np.asarray(mesh[0], np.float64), np.asarray(mesh[1], np.int64)
            cover = (P[T][:, :, :2] + np.asarray(origin, np.float64)[:2]).reshape(-1, 6)
        pm = plazas.mesh(frame, tuple(box), rings, elev, origin, cover)
        if quad is not None:
            pm = _clip_mesh(pm, origin, quad)
        return plazas.merge(mesh, pm)
    except Exception:                   # no plazas rather than no road tile
        log.exception("plazas of the tile at %s", tuple(round(float(v), 1) for v in box[:2]))
        return mesh


def _tile_decks(bridges, cells, tx, ty):
    """[(xy (k, 2), z (k,), width m)] of the bridge decks over road tile (tx, ty) (the buildings they run through get a
    way, the ones standing on them their floor on the deck: buildings.road_tile_items), [] without bridge profiles."""
    if bridges is None:
        return []
    import roads as roadsmod
    x0, y0, x1, y1 = roadsmod.tile_bbox(tx, ty)
    try:
        return [(np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64), float(spec.width))
                for _, spec, xy, z, _ in bridges.parts(cells, (x0 - 20, y0 - 20, x1 + 20, y1 + 20))]
    except Exception as e:      # no ways cut rather than no buildings
        log.debug("tile decks: %s: %s", type(e).__name__, e)
        return []


def _open_tunnels(g, keep):
    """The tunnels' open sections over a block (grading.Grader.open_tunnels; none without a grader)."""
    if g is None:
        return []
    try:
        return g.open_tunnels(keep["lat"], keep["lon"])
    except Exception:
        log.exception("open tunnel sections")
        return []


def tunnel_profiles(aid, frame, elev, g=None):
    """The anchor's view of this process's tunnel chains (road tiles and the blocks' terrain holes share them): their
    ground read at grading.PROFILE_ZOOM (raw; ends: graded), as in every other process."""
    import roads as roadsmod
    if getattr(_s, "tunnels", None) is None:        # (a state made without it: tests)
        _s.tunnels = {}

    def setup(t):
        sea = getattr(_s, "sea", None)
        t.wet = sea.depth if sea is not None else None
        t.raw = lambda la, lo: ground(None, la, lo, _s.dem.sample(la, lo, gradingmod.PROFILE_ZOOM))  # noqa: E731
        if g is not None:
            t.ends = roadsmod.portal_ends(g, t.raw)
    return roadsmod.ChainView(_chain_store("tunnels", roadsmod.TunnelProfiles, elev, setup), frame)


# --- CPU accounting ---------------------------------------------------------------------------------------------------
# Each job's CPU seconds by kind, logged by the process every CPU_LOG_S at debug level ("worker <pid> cpu: ...").
CPU_LOG_S = 30.0
_cpu = {}
_cpu_logged = [time.monotonic()]


def _accounted(fn):
    import functools

    @functools.wraps(fn)
    def run(*a, **kw):
        c0 = time.process_time()
        try:
            return fn(*a, **kw)
        finally:
            n, t = _cpu.get(fn.__name__, (0, 0.0))
            _cpu[fn.__name__] = (n + 1, t + time.process_time() - c0)
            now = time.monotonic()
            if now - _cpu_logged[0] >= CPU_LOG_S:
                _cpu_logged[0] = now
                shared = [g.shared.stats for g in list(getattr(_s, "graders", {}).values())
                          if g is not None and g.shared is not None]
                log.debug("worker %d cpu: %s%s", os.getpid(),
                          ", ".join(f"{k} {v[0]} jobs {v[1]:.1f} s" for k, v in sorted(_cpu.items())),
                          "; shared road plans " + ", ".join(f"{k} {sum(st[k] for st in shared):.0f}"
                                                             for k in ("read", "written", "waited", "wait_s"))
                          if shared else "")
    return run


navgraph = _accounted(navgraph)
