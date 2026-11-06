"""Buildings: Overture and OSM footprints extruded into walls and roofs in the style of their region.

Deterministic: a pure function of the footprints, the frame and the elevation.

The parts, each importing only the ones above it (tests/test_part_order.py):

    looks    materials, tints, signs and the OSM places behind them
    styles   a region's style: roofs, walls, heights
    mesh     Mesh and the walls, roofs, signs and details of a building
    places   what a footprint is used for and what it is called
    garages  parking structures: decks, ramps and what stands on a road's deck
    sites    what a footprint must not stand on: roads, tunnels, water, medians
    build    a building's mesh and collision, many buildings' meshes (build_parts)
    planner  plan: one footprint's storeys, roof and look
    photo    the ground photo, brick walks, a tile's footprint share, footprints per map cell, a town's districts
    tiles    tile_buildings, toll plazas, a tile's files
    doors    doors, wall signs, fences in front; a road tile's buildings
    far      a road tile's buildings as meshes (road_tile) and their centres
"""
import sys
import types

from . import looks, styles, mesh, places, garages, sites, build, planner, photo, tiles, doors, far

from .looks import (
    BAND_BRICK, BLADE_CAP_M, BRICK_WALL, CASTLE_FLOORS, CONCRETE, CORNICE_UP_M, FACADE, FLOOR_M, HALL_CLEAR_M, LETTERS,
    LOOKS, MATERIALS, METALWALL, OFFICE, PANEL, PANEL_NAME_CHARS, PLATE_TOP_M, ROOF_FLAT, ROOF_METAL, ROOF_SHINGLE,
    ROOF_SLATE, RUIN_H, SHOP, SIDING, SIGN_NAME_CHARS, SIGN_OUT, SKIRT_LITE_M, SKIRT_M, SKY_WALL, STEEL,
    STEEL_TOP_SHARE, STONE, STUCCO, _Looks, _hash01, osm_place, parse_color
)
from .styles import Spec, _area2, brick_share, clean_ring, oriented_box, region_style, tree_line_m, triangulate
from .mesh import (
    DOOR_GAP_M, Mesh, PORCH_DECK_M, PORCH_DEPTH_M, PORCH_H_M, STOOP_H, STOOP_RISE_MAX, WIN_H, WIN_SILL, _porch, _signs,
    _stoop, ground_rings
)
from .places import (
    castle_rings, church_rings, footprint_signs, footprint_uses, names_for, place_sign, place_use, places_of, sign_name,
    sign_text, signs_for
)
from .garages import (
    DECK_EDGE_M, DECK_LANE_M, DECK_SLAB_M, DECK_SLOPE, STAIR_TOWER_UP, _deck_layout, deck_plan, garage_drives, on_deck
)
from .sites import (
    PASSAGE_CLEAR, PASSAGE_H, PASSAGE_W, THROUGH_CLASSES, _covers_garage, _ml_false, _ml_steep, _on_support, _passages,
    road_across, road_lines, road_through, tunnel_lines
)
from .build import build, build_parts, collision_mesh
from .planner import plan
from .photo import DISTRICT_M, _cell_stats, brick_walks, coverage, district_coverage, fill_photo, photo_mask
from .tiles import (
    BLD_LOD_PX, G_TOLLBOOTH, OVER_ROAD_CLEAR_M, ROAD_THROUGH_M, _toll_mark, collider_boxes, garage_sound_boxes,
    tile_buildings, toll_booth_rows, write, write_objects
)
from .doors import (
    DOOR_OUT_M, FENCE_BACK_M, FENCE_CLEAR_M, FENCE_SEG_M, G_FENCE, POLES_COVERAGE, _front_fence, doors, road_tile_items
)
from .far import centres, road_tile


class _Package(types.ModuleType):
    """Setting buildings.NAME reaches every part holding NAME: a part reads its own copy of what it imported, so a switch set
    only here would change nothing and a test of it would pass without testing."""

    def __setattr__(self, name, value):
        for part in (looks, styles, mesh, places, garages, sites, build, planner, photo, tiles, doors, far,):
            if hasattr(part, name):
                setattr(part, name, value)
        super().__setattr__(name, value)


sys.modules[__name__].__class__ = _Package
