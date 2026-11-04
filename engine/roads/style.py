"""What a road looks like: surfaces, materials, colours."""
import logging
import os
from collections import namedtuple


# surfaces that belong to the ground layer, not to a road decal: rock and grass are rough, mask-driven terrain
# materials (gridmap v2 draws them exactly that way), so the mod paints their ground (surface.py) instead of laying
# a smooth ribbon over it
ROCKISH = frozenset({"rock", "rocky", "bedrock"})
GRASSY = frozenset({"grass", "grass_paver"})

log = logging.getLogger("earthd.roads")
VERSION = 1
TILE = 256.0            # m, tile side in the anchor frame
SEND_M = float(os.environ.get("BNE_ROADS_SEND_M", "640"))     # tiles whose square comes this close to the player
                                                                # (Euclidean, tiles_near: a disc) are sent
DROP_M = float(os.environ.get("BNE_ROADS_DROP_M", str(SEND_M + 320)))   # ... and dropped beyond this
OVERLAP = 2.0           # m a road reaches past its tile's edge (no gap at tile seams)
SIMPLIFY_M = 0.25       # RDP tolerance (Road Spline's layerMgr)
SIMPLIFY_Z_M = 0.05     # ... and the vertical one of lines drawn at their own heights (decks, tunnels: simplify ztol)
MAX_NODES = 100         # nodes per DecalRoad (Road Spline's chunk size)
MAX_SPACING = 12.0      # m between nodes at most (official maps: median 11-12 m)
BUILD_PER_POSE = 4      # tiles started per pose at most
# class -> (width m, paved by default). Classes not here (footway, path, steps, cycleway, ...) are
# left out for now.
STYLE = {
    "motorway": (11.0, True), "trunk": (9.0, True), "primary": (8.0, True), "secondary": (7.5, True),
    "tertiary": (6.5, True), "residential": (6.0, True), "living_street": (5.0, True),
    "unclassified": (5.5, True), "service": (4.0, True), "track": (3.5, False), "unknown": (5.0, True),
    # racetracks (OpenStreetMap highway=raceway, osmtags.raceways): a circuit's typical 12 m unless its
    # width is mapped; no markings, sidewalks, furniture or traffic (not in those classes' sets nor navgraph.DRIVE),
    # and graded by the terrain alone (grading.UNGRADED: an oval's banking stays)
    "raceway": (12.0, True),
}
PAVED = {"paved", "asphalt", "concrete", "metal", "wood", "tar", "bitumen"}
COBBLE = {"paving_stones", "sett", "cobblestone", "unhewn_cobblestone", "bricks",   # Overture: "paving_stones"
          "interlocking", "paver", "paver_blocks"}      # (South Asia's names)
# interlocking concrete pavers under the names the map gives them (surface_kind: a street paved with them is a
# cobble street, not a gravel track)
COBBLE_ALIASES = {"interlocking_pavers", "interlocking_stones", "pavers", "block_pavers", "paving_stone",
                  # OSM's surface=stone is mostly stone paving (flagstones, slabs), not a rock track (merge review of
                  #)
                  "stone", "stones"}
GRAVEL = {"gravel", "fine_gravel", "compacted", "pebblestone", "wbm", "laterite"}   # (water-bound macadam)
# ... and the values that do mean "no hard surface": an unrecognised one is not one of these (the class decides)
UNPAVED = {"unpaved", "ground", "dirt", "earth", "mud", "grass", "grass_paver", "sand", "soil",
           # the rock family: a rough, unpaved surface, never a marked asphalt street (gridmap v2's Rock is a
           # TerrainMaterial — a heightfield shader, not a surface a decal can carry)
           "rock", "rocky", "bedrock",
           # more of OSM's recognised unpaved values, which an unrecognised value must not outrank
           "clay", "shells", "woodchips"}
# kinds with a hard, built surface: carriageway extras (parking, strips, sidewalks) apply
BUILT = {"paved", "cobble"}
# surface kind -> DecalRoad look (stock materials, loaded by the mod from the official levels)
LOOK = {
    "paved": {"m": "road_asphalt_2lane", "tl": 11.0, "p": 20},
    # Italy's cobblestone (a mesh material with groundType COBBLESTONE): a DecalRoad stretches its
    # texture across the whole width, so cobbled roads are drawn as parallel strips of about
    # "strip" m with a square texture repeat, which keeps the stones their size
    "cobble": {"m": "italy_cobblestone", "tl": 2.5, "p": 20, "strip": 2.5},
    "gravel": {"m": "m_dirt_road", "tl": 88.0, "p": 21},
    "dirt": {"m": "m_dirt_road", "tl": 88.0, "p": 21},
}
# a `surface=concrete` street is still a paved one (markings, widths, the tyres' asphalt feel) but is drawn with
# gridmap v2's plain concrete instead of asphalt ("for concrete road surfaces")
CONCRETE = {"m": "m_gm_concrete_plain", "tl": 11.0, "p": 20}


def terrain_surface(spec):
    """'rock', 'grass' or None: a spec whose surface belongs to the ground layer (surface.py) and must not be drawn
    as a road decal. A decal is a smooth ribbon; these surfaces are not, and the terrain materials that describe them
    (gridmap v2's Rock / Grass) cannot be carried by one."""
    if spec.surf in ROCKISH:
        return "rock"
    if spec.surf in GRASSY:
        return "grass"
    return None


def surface_material_kind(spec):
    """The material the ground under a spec is painted with (surface.py): 'rock' / 'grass' for those surfaces, else
    the spec's kind (paved, cobble, gravel, dirt)."""
    return terrain_surface(spec) or spec.kind


def look_of(spec):
    """A spec's road look: gridmap v2's concrete for a `surface=concrete` street, else its kind's (LOOK)."""
    if spec.kind == "paved" and spec.surf == "concrete":
        return CONCRETE
    return LOOK[spec.kind]


Spec = namedtuple("Spec", "width kind urban cls oneway walk dir kmh gap median lanes surf link sides depth",
                  defaults=(False, 2.5, 0, None, None, None, None, None, False, None, None))   # median: m to the other carriageway's centre line
# (depth: a solved bridge part's slab and girders, m: BridgeProfiles keeps it with the part's heights; None elsewhere)
# (sides: the sidewalk sides OpenStreetMap's sidewalk tag gives (_osm_sidewalks; walk_sides' +1 left / -1 right of the
# geometry, () none), None where it has none: the class and land-cover rule, has_sidewalks)
# (lanes: OpenStreetMap's lane count, both directions on a two-way road, None unknown: osmtags.py; surf: the surface
# rule value's base token, e.g. "concrete": the look's concrete, roads.py look_of; link: a ramp / slip road, Overture's
# subclass "link", its class the road's it leads to)
# road_specs' result per feature (walk: the sidewalk width, measured from the buildings where known: roadwidth.py;
# dir: a one-way road's direction along its geometry, +1 / -1, 0 two-way; kmh: its speed limit, None unknown;
# gap: m of road per junction along it (its connectors), None unknown)
# (width = carriageway). One-way driving widths (Overture's divided roads are two one-way segments, each
# drawn before as a full two-way street: orthophoto of Broadway, 14-15 m drawn for 8-9 m)
ONEWAY_STYLE = {"primary": 6.5, "secondary": 6.5, "tertiary": 4.0, "residential": 3.5, "living_street": 3.5,
                "unclassified": 3.5, "service": 3.5, "unknown": 3.5}
# Sidewalks and markings (after the first street-view comparison of Fells Point:
# real streets have concrete sidewalks behind a curb and a double yellow centre line). Stock West
# Coast USA materials. renderPriority: lower draws on top (WCUSA: lines 2-6, the asphalt strip 20).
SIDEWALK = {"m": "sidewalk_concrete", "tl": 6.0, "p": 16, "w": 2.5}      # beyond the carriageway, city streets
# Storm drain inlets: a metal grate in the gutter (Driver Training's m_metal_grid_drain), DRAIN_IN m
# before the real end of each sidewalk run (one per corner, where real inlets sit) and every
# DRAIN_EVERY m along long runs (each is a DecalRoad: kept to ~40 per city tile)
DRAIN = {"m": "m_metal_grid_drain", "tl": 2.0, "p": 12, "w": 0.45, "len": 1.0}
DRAIN_IN, DRAIN_EVERY = 2.5, 90.0
GUTTER = {"m": "gutter1", "tl": 8.0, "p": 14, "w": 0.5}                  # at the curb line
CENTRE = {"tl": 12.0, "p": 6, "w": 0.12, "gap": 0.12}                    # a double line: two lines this far from the centre
EDGE_LINE = {"m": "line_white", "tl": 6.4, "p": 2, "w": 0.15, "inset": 0.3}
# The asphalt's edge where no curb ends it: East Coast USA's decal (a ragged opaque edge of gravel and dirt fading
# into the ground; its texture's u = 1 side lies on the asphalt, the opaque edge EDGE_DECAL_AT across it). The
# ground photo is ~2 m a pixel and the terrain's materials change on its 2 m grid: the edge was blurred and stepped
# ("the edge of the road is blurry and slightly jagged").
EDGE_DECAL = {"m": "ECA_road_edge_dirt", "tl": 6.4, "p": 1, "w": 1.6, "layer": "edge"}
EDGE_DECAL_AT = 0.95
LADDER_LINE_W = 0.30            # a ladder crosswalk's side lines (MUTCD 3C.04: 6-24 in)
EDGE_DECAL_GAP_M = 1.5          # ... none where another carriageway's edge is this near past the decal (gores, medians)
MEASURE_SKIP = {"service"}      # classes not measured between buildings (lots, alleys: far walls)
MEASURE_MAX = 3.0               # a measured carriageway at most this times the class default
SIDEWALK_CLASSES = {"residential", "tertiary", "secondary", "primary", "unclassified", "living_street"}
CENTRE_CLASSES = {"primary", "secondary", "tertiary", "trunk"}
EDGE_LINE_CLASSES = {"primary", "secondary", "tertiary", "trunk", "motorway"}
LANE_CLASSES = {"primary", "secondary", "tertiary", "trunk", "motorway"}
# urban arterials not lined by buildings (roadwidth.py measures those): 4 lanes (Moab's Main Street, US-191,
# 4 lanes + a turn lane in the photos, was drawn 9 m)
# Ramps and slip roads (Overture subclass "link", any class): one lane and its shoulders, whatever the class
# (Columbia's US-29 ramps were drawn 13 m wide, a whole motorway, photos): m paved by lanes a way.
LINK_M = {1: 6.0, 2: 9.0}
LINK_LANE_M = 3.7       # a one-lane ramp's lane between its shoulders
URBAN_ARTERIAL = {"trunk": 13.2}     # primaries in towns are often 2 lanes (Lancaster County's PA-340)
LANE_M = 3.3            # m per lane when counting the lanes a carriageway holds
# carriageways painted into the drawn ground instead of meshes (surface.photo_roads: "I dont love
# that we are applying a floating road texture over the normal terrain"; it also ended the white diamonds on the
# Stelvio's hairpins). BNGE_ROADS_IN_GROUND=0: the carriageway meshes as before
ROADS_IN_GROUND = os.environ.get("BNGE_ROADS_IN_GROUND", "1") != "0"
# m per driving lane by class when OpenStreetMap gives the lane count (osmtags.py; typical design widths)
LANE_W = {"motorway": 3.6, "trunk": 3.5, "primary": 3.3, "secondary": 3.3, "tertiary": 3.1}
LANE_W_DEFAULT = 3.0
OSM_LANES = (1, 12)     # a lane count outside this is not believed
OSM_WIDTH_M = (2.0, 40.0)
