"""Roads of the map data as drawn and collided geometry.

Tiles: TILE x TILE m squares of the anchor's ENU frame. A tile is built from the cells' road data, the frame and the
elevation: pure given those.

The parts, each importing only the ones above it (tests/test_part_order.py):

    style     what a road looks like: surfaces, materials, colours
    tags      what the map says before any rule: OSM tag values, level ranges as tagged, the per-cell facts kept
    specs     a road's class, width, lanes and sidewalks
    levels    which stretches of a road are bridges and tunnels: lengthened ranges, lidar, parts by level
    tiles     tile geometry and the helpers for polylines and chunks
    walks     sidewalks, medians and markings beside a road
    decks     a bridge's height profile: end joins, curves, deck heights, what covers a road
    bridges   BridgeProfiles: the deck profiles of a tile, its crossings and piers
    chains    ChainStore, ChainView: parts chained across tiles
    deckmesh  a bridge's meshes: chunks, abutments, tilted rows, pads
    tunnels   TunnelProfiles: floors, portals and their approaches, holes in the terrain, tunnel meshes
    walls     parapets, cliffs and retaining walls
    build     one tile: build_tile, write_tile and what collides
"""
import sys
import types

from . import style, tags, specs, levels, tiles, walks, decks, bridges, chains, deckmesh, tunnels, walls, build

from .style import (
    BUILT, CENTRE, DRAIN, EDGE_DECAL, EDGE_DECAL_AT, EDGE_DECAL_GAP_M, EDGE_LINE, EDGE_LINE_CLASSES, GUTTER,
    LANE_CLASSES, LANE_W, LANE_W_DEFAULT, LINK_LANE_M, LINK_M, LOOK, MAX_NODES, MAX_SPACING, ONEWAY_STYLE, OSM_WIDTH_M,
    OVERLAP, ROADS_IN_GROUND, SEND_M, SIDEWALK, SIDEWALK_CLASSES, SIMPLIFY_Z_M, STYLE, Spec, TILE, URBAN_ARTERIAL,
    VERSION, look_of, surface_material_kind, terrain_surface
)
from .tags import _feature_length_m, _level_ranges, _osm, _rule_value, tag_level_ranges
from .specs import (
    DUAL_MIN_MEDIAN_M, EDGE_STRIP_M, MIN_PART, MOTORWAY_RURAL_M, PARKING_M, RING_EXTRA_LANE_M, RING_LANE_M, SHOULDER_M,
    _road_specs, carriageway, dual_cap, edge_margin, is_ring, motorway_shoulder, road_specs, rural_motorway,
    surface_kind, surface_token, unbuilt
)
from .levels import (
    GAP_DECK_ON, LIDAR_GAPS_ON, LIDAR_GAP_REACH_M, PORTAL_EXTEND_MAX_M, TUNNEL_PORTAL_CLEAR_M, UNDERPASS_MAX_M,
    URBAN_CLASS, _feature_boxes, _parts_by_level, _parts_by_level_new, _structure_width, bridge_parts, bridge_specs,
    gallery_parts, ground_parts, level_ranges, lidar_gap_candidates, rule_level_ranges_near, sub_polyline, tunnel_parts,
    tunnel_specs
)
from .tiles import (
    _chunk, box_gap, box_owns, cells_of_tile, lane_layout, lane_tags, split, tile_bbox, tile_distance, tile_needs,
    tile_side, tiles_near
)
from .walks import (
    MEDIAN_CURB_W, MEDIAN_SLAB_M, _arterial, _blocker_segments, _on_level, _seg_dist, centre_colour, clip_polyline,
    cut_outside, densify, extras, has_median, has_sidewalks, median_side, median_width, offset_polyline, simplify,
    walk_sides
)
from .decks import (
    AT_GRADE_M, BRIDGE_HEADROOM_MARGIN_M, CONCRETE_WALL_CLASSES, DECK_CLEAR, DECK_CLEAR_REACH_M, DECK_DESIGN_GRADE,
    DECK_GRADE, DECK_MAX_GRADE, DECK_ROAD_CLEAR, DECK_ROAD_HALF, DECK_STEEP_GRADE, END_JOIN_ON, LIFT_END_GRADE,
    MIN_BRIDGE_HEADROOM_M, TUNNEL_COVER, TUNNEL_GRADE, TUNNEL_ROAD_REACH_M, UNDER_DECK, WATER_CAUSEWAY_CLEAR,
    WATER_CLEAR_MIN, _chain_graph, _deck_stacks, _dijkstra, _end_joins, _lift_smooth, _merge_overlaps, _unpinned,
    cover_decks, cover_roads, curve_profile, deck_curve, deck_heights, deck_profile, deck_profile_once, portal_cover,
    tunnel_profile, water_clear
)
from .bridges import (
    BridgeProfiles, DECK_MIN_DEPTH, DECK_SPAN_RATIO, DECK_STEP, LIDAR_HEADROOM_M, OBS_MAX_GRADE, PIER_ROAD_M,
    TANGENT_TOL_M, _clearance_deficits, _crossings, _crossings_by, _deck_needs, _is_simple, _lift_tangent, _tilting_parts,
    deck_depth, deck_road_clear, deck_split, geom_span, pier_sites, tangent_profile
)
from .chains import ChainStore, ChainView
from .deckmesh import (
    DECK, PAD_MARGIN_M, PAD_MIN_PARTS, _abutments, _corner_look, _deck_chunks, deck_pads, pad_inside,
    tilt_rows_on_decks, under_deck_ground
)
from .tunnels import (
    APPROACH_JOIN_M, ARCH_SOIL_MIN, PORTAL_APRON_M, PORTAL_GROUND_M, TUNNEL, TUNNEL_SOIL_M, TUNNEL_WET_SHARE,
    TunnelProfiles, _line_gap, _tunnel_chunks, approach_floor, approach_heights, approach_lines, approach_reach,
    approach_samples, arch_raise, block_arch_raise, block_tunnel_holes, gallery_kinds, portal_approaches, portal_ends,
    portal_lows, portal_roads, spare_open_floors, tunnel_floor_at, tunnel_hole_mask, tunnel_sections, twin_spans,
    twin_tunnels, wet_run_inside
)
from .walls import WALL_DECK_MARGIN_M, _on_carriageways, _under_decks, _wall_runs, retaining_walls
from .build import (
    SOUND_BRIDGE, SOUND_EXTEND_M, SOUND_GARAGE, SOUND_PORTAL, SOUND_PORTAL_IN_M, SOUND_PORTAL_UP, SOUND_POWER_PLANT,
    SOUND_REFINERY, SOUND_TUNNEL, SOUND_TUNNEL_OPEN, SOUND_UNDER_M, _going_on, _on_box, build_tile, collider_boxes,
    shape_files, sound_boxes, tile_galleries, write_tile
)


class _Package(types.ModuleType):
    """Setting roads.NAME reaches every part holding NAME: a part reads its own copy of what it imported, so a switch set
    only here would change nothing and a test of it would pass without testing."""

    def __setattr__(self, name, value):
        for part in (style, tags, specs, levels, tiles, walks, decks, bridges, chains, deckmesh, tunnels, walls, build,):
            if hasattr(part, name):
                setattr(part, name, value)
        super().__setattr__(name, value)


sys.modules[__name__].__class__ = _Package
