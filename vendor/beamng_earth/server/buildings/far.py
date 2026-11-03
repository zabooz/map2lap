"""A road tile's buildings (road_tile), their footprint share and centres; the ground photo's footprint margins."""


def coverage(items, tile=256.0):
    """The share of the tile (a square of side tile m: roads.tile_side) covered by building footprints."""
    return sum(_area2(s.ring) / 2 for s, _, _ in items if (s.min_h or 0) <= 0.5) / (tile * tile)


def centres(items, tx, ty):
    """The anchor-frame (x, y) centres of a road tile's buildings (road_tile_items' rings are tile-local)."""
    import roads
    x0, y0, _, _ = roads.tile_bbox(tx, ty)
    return [(float(s.ring[:, 0].mean() + x0), float(s.ring[:, 1].mean() + y0)) for s, _, _ in items]


def road_tile(frame, tx, ty, md, ground, lines=None, props=None, items=None):
    """The buildings of road tile (tx, ty) (roads.TILE squares of the anchor frame): (mesh, collider boxes) or
    None. md: mapdata.MapData; ground(lat, lon): the physics ground without the road lift. lines (the road
    centrelines, roads.build_tile) and props (its prop rows): the houses' front doors are added to props.
    items: road_tile_items' result when the caller has it."""
    import roads
    x0, y0, x1, y1 = roads.tile_bbox(tx, ty)
    if items is None:
        items = road_tile_items(frame, tx, ty, md, ground)
    if props is not None and lines:
        props.extend(doors(items, lines, x0, y0))
    meshes = build_parts(items, with_lod=True)
    if not meshes:
        return None
    return meshes, collider_boxes(items, x0, y0), collision_mesh(items)


# ------------------------------------------------------------------------------------------- the ground photo


PHOTO_GROW_M = 1.5          # m a footprint is grown on the ground photo (edges, eaves) ...
PHOTO_LEAN = 0.12           # ... plus this share of its height (the photo's lean of tall buildings), at most
PHOTO_LEAN_MAX_M = 6.0      # ... this
PHOTO_FILL_M = 12.0         # m: the blur that fills them from the ground around


# (read inside functions only; here so that the parts can load each other)
from .build import collision_mesh  # noqa: E402
from .styles import _area2  # noqa: E402
from .mesh import build_parts  # noqa: E402
from .tiles import collider_boxes  # noqa: E402
from .doors import doors, road_tile_items  # noqa: E402
