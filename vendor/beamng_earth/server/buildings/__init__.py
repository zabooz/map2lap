"""Buildings: Overture and OSM footprints extruded into walls and roofs in the style of their region.

Deterministic: a pure function of the footprints, the frame and the elevation.

    looks    materials, tints, signs and the OSM places behind them
    styles   a region's style: roofs, walls, heights
    places   what a footprint is used for and what it is called
    planner  plan: one footprint's storeys, roof and look
    mesh     Mesh and the walls, roofs, signs and details of a building
    garages  parking structures: decks, ramps and what stands on a road's deck
    build    a building's mesh and collision
    sites    what a footprint must not stand on: roads, tunnels, water, medians
    tiles    tile_buildings, toll plazas, a tile's files
    doors    doors, wall signs, fences in front
    far      far buildings, street lamps, the skyline
    photo    the ground photo, brick walks, footprints per map cell, a town's districts
"""
import sys
import types

from . import looks, build, styles, places, planner, mesh, garages, sites, tiles, doors, far, photo

from .looks import (
    BAND_BRICK, BLADE_CAP_M, BRICK_WALL, CASTLE_FLOORS, CONCRETE, CORNICE_UP_M, FACADE, FLOOR_M, HALL_CLEAR_M,
    LETTERS, LOOKS, MATERIALS, METALWALL, OFFICE, PANEL, PANEL_NAME_CHARS, PLATE_TOP_M, ROOF_FLAT, ROOF_METAL,
    ROOF_SHINGLE, ROOF_SLATE, RUIN_H, SHOP, SIDING, SIGN_NAME_CHARS, SIGN_OUT, SKIRT_LITE_M, SKIRT_M, SKY_WALL,
    STEEL, STEEL_TOP_SHARE, STONE, STUCCO, _Looks, osm_place, parse_color
)
from .build import OVER_ROAD_CLEAR_M, ROAD_THROUGH_M, THROUGH_CLASSES, build, collision_mesh
from .styles import (
    Spec, _area2, _hash01, brick_share, clean_ring, oriented_box, region_style, tree_line_m, triangulate
)
from .places import (
    castle_rings, church_rings, footprint_signs, footprint_uses, names_for, place_sign, place_use, places_of,
    sign_name, sign_text, signs_for
)
from .planner import plan
from .mesh import (
    DOOR_GAP_M, Mesh, PORCH_DECK_M, PORCH_DEPTH_M, PORCH_H_M, WIN_H, WIN_SILL, _porch, _signs, _stoop, build_parts,
    ground_rings
)
from .garages import (
    DECK_EDGE_M, DECK_LANE_M, DECK_SLAB_M, DECK_SLOPE, STAIR_TOWER_UP, _deck_layout, deck_plan, garage_drives,
    on_deck
)
from .sites import (
    PASSAGE_CLEAR, PASSAGE_H, PASSAGE_W, _covers_garage, _ml_false, _ml_steep, _on_support, _passages, road_across,
    road_lines, road_through, tunnel_lines
)
from .tiles import (
    BLD_LOD_PX, DOOR_OUT_M, G_TOLLBOOTH, STOOP_H, STOOP_RISE_MAX, _toll_mark, collider_boxes, garage_sound_boxes,
    tile_buildings, toll_booth_rows, write
)
from .doors import (
    DISTRICT_M, FENCE_BACK_M, FENCE_CLEAR_M, FENCE_SEG_M, G_FENCE, POLES_COVERAGE, _front_fence, doors,
    road_tile_items
)
from .far import (
    FAR_LAMP_Z, _sky_mesh, bridge_slabs, centres, coverage, far_items, far_lamps, far_tile, road_tile, sky_items
)
from .photo import _cell_stats, brick_walks, district_coverage, fill_photo, photo_mask


class _Package(types.ModuleType):
    """Setting buildings.NAME reaches every part holding NAME: a part reads its own copy of what it imported, so a switch set
    only here would change nothing and a test of it would pass without testing."""

    def __setattr__(self, name, value):
        for part in (looks, build, styles, places, planner, mesh, garages, sites, tiles, doors, far, photo,):
            if hasattr(part, name):
                setattr(part, name, value)
        super().__setattr__(name, value)


sys.modules[__name__].__class__ = _Package
