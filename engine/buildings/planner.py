"""plan: one footprint's storeys, roof and look."""
import math

import numpy as np

from .looks import (
    BAND_BRICK, BAND_OFFICE, BAND_OFFICE2, BAND_PANEL, BAND_SASH, BAND_TALL, BARN_CLASSES, BARN_REDS, BIG_BOX_CLASSES,
    BIG_BOX_M2, BRICK_TINTS, BRICK_WALL, BRIDGE_CLASSES, BRIDGE_PIER_M, CASTLE_FLOORS, CHURCH_CLASSES,
    FACADE_SURFACES, ROOF_SURFACES, SURFACE_MATERIALS, CONCRETE, ELEVATOR_CLASSES, ELEVATOR_MAX_M2, ELEVATOR_MIN_H, ELEVATOR_SLENDER, FACADE, FACADE_TINTS, FLOOR_M,
    GARAGE_MIN_M2, GLASS_FLOORS, GROUND_FLOOR_SHOP_M, HOUSE_CLASSES, HOUSE_MAX_M2, INDUSTRIAL_CLASSES, LOOKS,
    MASONRY_MATERIALS, METALWALL, MIDRISE_GLASS_OFFICE, OFFICE, OLD_TOWER_GLASS, PAINT_TINTS, PANEL, PITCH,
    PYRAMID_MIN_M2, PYRAMID_PLINTH_M, PYRAMID_ROOF_SHARE, ROOF_FLAT, ROOF_METAL, ROOF_SHINGLE, ROOF_SLATE, ROOF_TINTS,
    ROW_CLASSES, RUIN_H, SALTBOX_OFFSET, SHED_CLASSES, SHED_LONG_SHARE, SHOP_CLASSES, SIDING, STEEL, STONE, STONE_FACADES, STONE_FLOORS, STUCCO,
    TOWER_SHOP_FLOORS, US_WALL_TINTS, WALL_TINTS, WOOD_TINTS, _hash01, custom_look, parse_color
)
from .architecture import architecture_values, architecture_pattern
from .facade import FacadePattern
from .looks import CIVIC_CLASSES
from .styles import Spec, _area2, brick_share, oriented_box, region_style, roof_box, round_storage_ring, shed_count, skillion_axis

ALPINE_HUT_M2 = 120.0        # an isolated building this small above the tree line (a summit shelter, a mountain hut) ...
GARAGE_TAG_CLASSES = {"", "yes", "commercial", "garage", "garages", "parking", "parking_garage", "carport",
                      "service", "transportation", "industrial", "retail"}     # (not the apartments on a car park podium)


WEST_TOWN_ONE_STOREY = 0.75     # share of predicted one-storey buildings there
FALSE_FRONT_M = 1.2             # m of parapet over a one-storey shop there
# A normal door needs about 2.1 m clear height, plus a lintel. Microsoft ML Buildings' estimated
# heights can be below 1 m in Perth; those cannot describe an occupied storey. Small sheds and
# open/storage structures can legitimately be lower, and explicit OSM heights retain priority.
ML_MIN_WALL_PER_FLOOR_M = 2.4


def _whole_semidetached(cls, attrs, neighbours):
    """Explicit two-dwelling semi with no attached neighbour; ambiguous or individually mapped halves stay single. Pure."""
    if cls != 'semidetached_house' or neighbours:
        return False
    try:
        return float(attrs.get('building:flats')) == 2.
    except (TypeError, ValueError):
        return False


def plan(ring, attrs, neighbours=0, lat=None, lon=None, look=None, town=False, dense=False, west_town=False,
         alpine=False, elevation_m=None):
    """The Spec of a footprint (local ring (n, 2) in metres, counter-clockwise) from its Overture attributes
    (dict: class, height, num_floors, min_height, roof_shape, roof_height; garage: a mapped multi-storey car park
    covers it, garage_rings) and the number of buildings
    sharing a wall with it. Height and roof are predicted when not given. west_town: a small town of the
    arid West (district_town): single-storey main streets and ranch houses."""
    architecture = architecture_values(attrs)
    area = _area2(ring) / 2
    c = ring.mean(0)
    # (its random choices: keyed on the map feature's id, the same from every anchor and tile; a ring without one
    # by its local centroid, as before. Keyed on the centroid in the tile's frame alone, a house changed its look
    # whenever a rebase moved the anchor: geotiles)
    sid = attrs.get("seed_id")
    seed = look if look is not None else _hash01(sid, "plan") if sid is not None else \
        _hash01(round(float(c[0]) * 2), round(float(c[1]) * 2), round(area))
    style = region_style(lat, lon, elevation_m=elevation_m)
    brick_fraction = style.brick if lat is not None else brick_share(lat, lon)
    _, _, hl, hw = oriented_box(ring)
    box_fill = area / max(4 * hl * hw, 1e-6)
    cls = (attrs.get("class") or attrs.get("use") or "").lower()   # (use: footprint_uses', when no class is mapped)
    name = str(attrs.get("name") or "").lower()
    terminal = any(w in name for w in ("terminal", "concourse"))
    church = cls in CHURCH_CLASSES or any(w in name for w in ("church", "chapel", "cathedral"))
    if "hangar" in name:
        cls = "hangar"
    # a parking structure (a small "parking" building is a carport or a booth: a shed); "parking" is also a
    # shed class, which made big garages barns in barn-red siding (Columbia)
    garage = (cls in ("parking", "parking_garage") and area >= GARAGE_MIN_M2) or "parking garage" in name or (
        "garage" in name and area > 800) or (bool(attrs.get("garage")) and cls in GARAGE_TAG_CLASSES)
    narrow = hw < 4.2 and hl > 2.2 * hw                 # a row house: ~4-8 m wide, deep
    # in a dense core small buildings are row houses even where the footprints leave gaps (Fells Point)
    row = cls in ROW_CLASSES or (not west_town and ((narrow and (neighbours >= 1 or dense)) or (
        dense and area < 260 and cls not in SHOP_CLASSES)))
    shed = (cls in SHED_CLASSES and not garage) or (area < 40 and not row)
    shop = cls in SHOP_CLASSES
    industrial = cls in INDUSTRIAL_CLASSES and not (garage or terminal)
    storage = cls in ('silo', 'grain_silo', 'storage_tank')
    round_silo = cls in ('silo', 'grain_silo') and round_storage_ring(ring)
    paired_home = _whole_semidetached(cls, attrs, neighbours)

    h = attrs.get("height")
    nf = attrs.get("num_floors")
    if terminal and (h is None or not np.isfinite(h)) and (nf is None or not np.isfinite(nf)):
        h, nf = 13.0, 2                                 # an airport terminal: two tall glass storeys
    if garage and (h is None or not np.isfinite(h)) and (nf is None or not np.isfinite(nf)):
        nf = 4 + int(seed * 2)
    if cls == "hangar" and (h is None or not np.isfinite(h)):
        h, nf = 12.0, 1
    if church and (h is None or not np.isfinite(h)) and (nf is None or not np.isfinite(nf)) and area < 2500:
        nf = 1                                          # a nave: one tall storey under a steep gable
    h = None if h is None or not np.isfinite(h) or h <= 0 else float(h)
    nf = None if nf is None or not np.isfinite(nf) or nf <= 0 else int(round(nf))
    rh = attrs.get("roof_height")
    rh = float(rh) if rh is not None and np.isfinite(rh) else None
    if ((attrs.get("roof_shape") or "").lower() == "pyramidal" and h is not None and rh is not None
            and rh >= PYRAMID_ROOF_SHARE * h and area >= PYRAMID_MIN_M2 and hw > 1.0):
        look = f"{STONE}|0"
        return Spec(architecture=architecture, ring=ring, floors=1, floor_h=PYRAMID_PLINTH_M, height=PYRAMID_PLINTH_M, roof="hipped", roof_mat=look,
                    facade=look, band=None, shop=False, plain=True, seed=seed, min_h=0.0, wall=None, windows=False,
                    steeple=False, porch=False, cls="pyramid", deck=False,
                    pitch=math.degrees(math.atan2(max(h - PYRAMID_PLINTH_M, 0.1), hw)))
    if (town and style.us_special and cls in ELEVATOR_CLASSES and h is not None and h >= ELEVATOR_MIN_H
            and nf is None and area <= ELEVATOR_MAX_M2 and h / math.sqrt(max(area, 1.0)) >= ELEVATOR_SLENDER
            and not (church or terminal or garage)):
        return Spec(architecture=architecture, ring=ring, floors=1, floor_h=h, height=h, roof="flat", roof_mat="bne_precast", facade="bne_precast",
                    band=None, shop=False, plain=True, seed=seed, min_h=0.0, wall=None, windows=False, steeple=False,
                    porch=False, cls="elevator", deck=False, pitch=None)
    if attrs.get("bridge_part"):    # a mapped part of a bridge's tower (support_rings): a plain box of painted steel
        return Spec(architecture=architecture, ring=ring, floors=1, floor_h=h or BRIDGE_PIER_M, height=h or BRIDGE_PIER_M, roof="flat",
                    roof_mat=f"{STEEL}|{attrs['bridge_part']}", facade=f"{STEEL}|{attrs['bridge_part']}", band=None,
                    shop=False, plain=True,
                    seed=seed, min_h=0.0, wall=None, windows=False, steeple=False, porch=False, cls="bridge_part",
                    deck=False, pitch=None)
    mat_ = str(attrs.get("facade_material") or "").lower()
    if attrs.get("bridge_masonry") or (cls in BRIDGE_CLASSES and mat_ in MASONRY_MATERIALS):
        # a mapped masonry pier (Tower Bridge's 9 m concrete piers under its stone towers): a solid block, not a frame
        look = f"{STONE}|0" if mat_ in ("stone", "brick") else "bne_precast"
        return Spec(architecture=architecture, ring=ring, floors=1, floor_h=h or BRIDGE_PIER_M, height=h or BRIDGE_PIER_M, roof="flat",
                    roof_mat=look, facade=look, band=None, shop=False, plain=True, seed=seed, min_h=0.0, wall=None,
                    windows=False, steeple=False, porch=False, cls="bridge_pier", deck=False, pitch=None)
    if cls in BRIDGE_CLASSES:       # a bridge's tower or pier: an open steel frame (_steel_frame), the decks through it
        import bridgetypes
        pt = bridgetypes.paint(attrs.get("facade_color"))
        return Spec(architecture=architecture, ring=ring, floors=1, floor_h=h or BRIDGE_PIER_M, height=h or BRIDGE_PIER_M, roof="flat",
                    roof_mat=ROOF_FLAT, facade=f"{STEEL}|{pt}" if pt else STEEL, band=None, shop=False, plain=True,
                    seed=seed, min_h=0.0,
                    wall=None, windows=False, steeple=False, porch=False, cls=cls, deck=False, pitch=None)
    floor_h = FLOOR_M
    if industrial:
        floor_h = 4.5
    if church:
        floor_h = 7.5
    # (a big shed is a barn; a row of garages, a carport or a canopy is not)
    barn = cls in BARN_CLASSES or (shed and area >= 150 and cls not in ("garage", "garages", "carport", "roof", "shelter"))
    if barn:
        floor_h = 5.5 if area >= 150 else 3.5          # one tall storey; the gable above it
    if h is None and nf is None:
        if shed:
            nf = 1
        elif row:
            nf = 2 if seed < 0.25 else (3 if seed < 0.85 else 4)
        elif west_town and not industrial and cls != "apartments":
            # Bishop's and Moab's photos: one-storey shops with false fronts, ranch houses
            nf = 1 if seed < WEST_TOWN_ONE_STOREY else 2
        elif cls in HOUSE_CLASSES or (area < 220 and not shop):
            nf = 1 if seed < 0.3 else 2
        elif industrial:
            nf = 2 if area > 6000 else 1
        elif cls == "apartments":
            nf = 3 + int(seed * 3)
        elif town:
            nf = 1 if seed < 0.6 else 2                 # small towns: mostly single-storey shops and offices
        elif area < 900:
            nf = 2 + int(seed * 2)
        else:
            nf = 2 + int(seed * 3)
    roof_given = (attrs.get("roof_shape") or "").lower().replace("-", "_")
    if roof_given in ("gabled", "hipped", "flat", "skillion", "pyramidal", "half_hipped", "mansard", "gambrel", "saltbox", "round", "sawtooth", "dome", "onion", "spherical"):
        roof = roof_given
    else:
        detached_house = (cls in HOUSE_CLASSES or (area < 260 and not shop)) and not industrial and not row
        if storage:
            roof = 'pyramidal' if round_silo else 'flat'
        elif cls in ('greenhouse', 'static_caravan'):
            roof = 'gabled'
        elif church and neighbours == 0:
            roof = "gabled"
        elif neighbours >= 1:
            # attached: flat in the US (a pitched roof would show its gable to the neighbour); old European towns
            # are gabled (the ridge on the long axis: a narrow deep house shows its gable to the street)
            low = (nf or (h or 0) / FLOOR_M or 3) <= 6
            roof = "gabled" if (style.attached and low and not industrial and not shop
                                and _hash01(seed, "attached roof") < style.attached) else "flat"
        elif barn:
            roof = "gabled"
        elif shed and area < 80:
            roof = "gabled" if seed > 0.4 else "flat"
        elif detached_house:
            if style.flat and _hash01(seed, "flat roof") < style.flat:
                roof = "flat"
            else:
                roof = "gabled" if seed < 1.0 - style.hipped else "hipped"
        else:
            roof = "flat"
    # pitched roofs only on near-rectangular footprints (a church's nave keeps its gable beside a tower or an apse)
    if roof != "flat" and (box_fill < (0.6 if church or round_silo else 0.8) or hw < 2.0
                           or hw > (18.0 if barn else 20.0 if church else 14.0)):
        roof = "flat"
    # a city tower's ground floor is shops or a lobby (Midtown: most towers have no class, and their
    # curtain wall came down to the pavement)
    tall = (nf or (h or 0) / FLOOR_M) >= TOWER_SHOP_FLOORS
    if dense and tall and cls not in HOUSE_CLASSES and not (shed or barn or garage or terminal or church):
        shop = True
    if church:
        shop = False                                # (no shopfronts on a church, Cluj)
    direction, orientation = attrs.get("roof_direction"), attrs.get("roof_orientation")
    if direction is not None and (not np.isfinite(direction) or not 0 <= direction < 360):
        direction = None
    elif direction is not None:
        direction = float(direction)    # (the map cells keep it as float32: the object list's JSON can't write that)
    roof_h = 0.0
    if roof != "flat":
        roof_hw = hw
        if roof == "skillion":
            _, roof_hw = skillion_axis(ring, direction, orientation)
        elif roof not in ("pyramidal", "dome", "onion", "spherical") and (direction is not None or orientation == "across"):
            _, _, _, roof_hw = roof_box(ring, direction, orientation)
        if roof == "saltbox":
            roof_hw *= 1 + SALTBOX_OFFSET  # Rise measured from the lower eave across the longer roof run.
        elif roof == "sawtooth":
            roof_hw = 2 * roof_hw / shed_count(2 * roof_hw) * SHED_LONG_SHARE
        # A negative roof, or one taller than the whole building, is not usable mapped geometry.
        mapped_roof = rh is not None and rh > 0 and (h is None or rh < h)
        roof_h = rh if mapped_roof else \
            roof_hw * math.tan(math.radians(style.pitch or PITCH[roof]))
        if not mapped_roof:
            if cls == 'static_caravan':
                roof_h = min(roof_h, .35)       # Low transportable roof; explicit mapped rises still win.
            elif round_silo:
                roof_h = min(roof_h, roof_hw * .35)
            if cls in ('shed', 'hut', 'cabin', 'toilets', 'service', 'greenhouse', 'static_caravan') and h is not None:
                roof_h = min(roof_h, max(0., h - min(2.4, h)))  # Keep usable door headroom in small structures.
        if h is not None and not mapped_roof:
            # An inferred pitch must leave room for walls: a normal 2.5 m storey, or half a very low structure.
            # Explicit consistent wall/roof heights override this fallback, including attic-heavy houses.
            roof_h = min(roof_h, max(0., h - min(2.5, h / 2)))
    if (h is not None and attrs.get("height_src") == "Microsoft ML Buildings"
            and not (shed or storage or cls in ("roof", "shelter", "carport"))
            and h - roof_h < ML_MIN_WALL_PER_FLOOR_M * (nf or 1)):
        # Replan from the remaining mapped facts. The weak height otherwise compresses walls and leaves
        # doors above the roof; without a mapped floor count it still describes at most one storey.
        # Repeating with height absent also restores the normal inferred roof rise.
        fallback = {**attrs, "height": None, "num_floors": nf or 1}
        return plan(ring, fallback, neighbours, lat, lon, look, town, dense, west_town,
                    alpine, elevation_m)
    if h is None:
        h = nf * floor_h + (GROUND_FLOOR_SHOP_M - floor_h if shop and nf > 1 else 0.0) + (0.6 if roof == "flat" else 0.2)
        if west_town and roof == "flat" and nf == 1 and area >= 80 and not (shed or barn):
            h += FALSE_FRONT_M                      # a main-street shop's tall parapet
    else:
        if roof != "flat":
            h -= roof_h
        if nf is None:
            # a church: one tall storey (Cluj's St. Michael's, 25 m, came out as three 8 m floors)
            nf = 1 if church else max(1, int(round(h / floor_h)))
    nf = max(1, min(nf, 120))
    floor_h = h / nf
    if shed or barn:
        facade, band, plain = SIDING, None, True
    else:
        # glass curtain walls on towers; the mid-rises of old city cores (and a share of the older towers) are
        # masonry with punched windows (Midtown's street photos: the theatre district's 5-15 storey
        # brick and stone buildings had all come out as glass towers)
        u_glass = _hash01(seed, "glass")
        # a building drawn as its parts: the style of the whole building on every part (NYC: a brick
        # part on a glass tower, each part decided by its own height)
        bh = attrs.get("building_height")
        snf = max(nf, int(bh / FLOOR_M)) if bh is not None and np.isfinite(bh) else nf
        modern = cls in ("office", "commercial", "hotel") and u_glass < MIDRISE_GLASS_OFFICE
        tall = snf >= GLASS_FLOORS[1] or (snf >= GLASS_FLOORS[0] and (modern or u_glass < OLD_TOWER_GLASS)) \
            or (snf >= 7 and modern)
        if snf >= 7 and not tall and not industrial:
            if _hash01(seed, "brick") < brick_fraction * 1.2:
                facade, band = BRICK_TINTS[int(seed * 7919) % len(BRICK_TINTS)], BAND_BRICK
            else:
                facade = FACADE_TINTS[int(seed * 7919) % len(FACADE_TINTS)]
                band = BAND_TALL if seed < 0.6 else BAND_SASH
        elif tall or (industrial and not shed):
            facade = f"{OFFICE}|{int(_hash01(seed, 'glass tint') * len(WALL_TINTS[OFFICE]))}" if tall \
                else FACADE_TINTS[3]
            band = (BAND_OFFICE if seed < 0.5 else BAND_OFFICE2) if tall else BAND_PANEL
        else:
            u_brick = _hash01(seed, "brick")
            detached = (cls in HOUSE_CLASSES or (area < 260 and not shop)) and not row and neighbours == 0
            brick = u_brick < brick_fraction * (1.15 if row else 0.35 if detached else 1.0)
            if brick:
                band = BAND_BRICK
                facade = BRICK_TINTS[int(seed * 7919) % len(BRICK_TINTS)]
            else:
                facade = FACADE_TINTS[int(seed * 7919) % len(FACADE_TINTS)]
                if (row or cls in HOUSE_CLASSES) and _hash01(seed, "paint") < style.paint:
                    facade = PAINT_TINTS[int(_hash01(seed, "pc") * len(PAINT_TINTS))]
                if row or cls in HOUSE_CLASSES or roof != "flat":
                    band = BAND_SASH if seed < 0.7 else BAND_PANEL
                else:
                    band = (BAND_SASH, BAND_TALL, BAND_PANEL)[int(seed * 104729) % 3]
        plain = False
    wall = None
    house = (cls in HOUSE_CLASSES or (area < 260 and not shop and not industrial)) and not row and not shed \
        and neighbours == 0 and area < HOUSE_MAX_M2     # a long "residential" block is not a house (Fells Point)
    if house and band is not BAND_BRICK and nf <= 3:
        # detached houses: siding in the East and South, stucco in the West; windows laid over the wall
        u = _hash01(seed, "wall")
        kind, acc = None, 0.0
        for k, share in style.walls:            # (the US East: siding 75 %; the West: stucco 65 %, siding 25 %)
            acc += share
            if u < acc:
                kind = k
                break
        if kind is not None:
            tints = style.wall_tints
            if style.wood and kind == SIDING:   # chalets: stained wood
                wall = f"{SIDING}|w{int(_hash01(seed, 'wc') * len(WOOD_TINTS))}"
            elif tints is not None:
                tints = [t for t in tints if t < len(WALL_TINTS[kind]) - (BARN_REDS if kind == SIDING else 0)] or [0]
                wall = f"{kind}|{tints[int(_hash01(seed, 'wc') * len(tints))]}"
            else:
                n = len(WALL_TINTS[kind]) - (BARN_REDS if kind == SIDING else 0)     # houses: not barn red
                n = min(n, US_WALL_TINTS.get(kind, n))
                wall = f"{kind}|{int(_hash01(seed, 'wc') * n)}"
            facade = wall
    # a hut above the tree line, alone: stone walls (alpine: the tile is nearly empty and high, tile_buildings)
    stone_hut = wall is None and alpine and area < ALPINE_HUT_M2 and neighbours == 0
    if stone_hut:                       # (sheds too: a summit shelter is shed-sized)
        wall = f"{STONE}|{int(_hash01(seed, 'stc') * len(WALL_TINTS[STONE]))}"
        facade = wall
    # dressed stone: a regional share of low older buildings, attached ones too (their plaster sheet otherwise)
    if wall is None and style.stone and nf <= STONE_FLOORS and band is not BAND_BRICK \
            and not (shop or industrial or terminal or garage or shed or barn or church) \
            and cls not in ("apartments", "office", "commercial", "hotel", "retail") \
            and _hash01(seed, "stone") < style.stone:
        wall = f"{STONE}|{int(_hash01(seed, 'stc') * len(WALL_TINTS[STONE]))}"
        facade = wall
    # the mapped facade material (OSM building:material, Overture facade_material) over the guesses (Tower Bridge's
    # stone towers came out as glass towers)
    fm = str(attrs.get("facade_material") or "").lower()
    mapped_facade = True
    if fm in FACADE_SURFACES:
        wall = facade = f"{SURFACE_MATERIALS[FACADE_SURFACES[fm]]}|0"
        plain = False
    elif fm in STONE_FACADES:
        wall = f"{STONE}|{int(_hash01(seed, 'stc') * len(WALL_TINTS[STONE]))}"
        facade, plain = wall, False
    elif fm == "brick":
        # A mapped wall material must not change window density to the legacy brick atlas's five bays.
        wall = facade = ("bne_brick_red", "bne_brick_dark", "bne_brick_tan")[int(seed * 7919) % 3]
        plain = False
    elif fm == "glass":
        facade = f"{OFFICE}|{int(_hash01(seed, 'glass tint') * len(WALL_TINTS[OFFICE]))}"
        band, plain, wall = BAND_OFFICE, False, None
    elif fm in ("wood", "timber", "log", "wood_boards"):
        wall = f"{SIDING}|w{int(_hash01(seed, 'wc') * len(WOOD_TINTS))}"
        facade, plain = wall, False
    elif fm in ("concrete", "cement", "precast"):
        # Concrete has named looks, not a numbered wall palette; an unknown look falls back to the window sheet.
        wall = custom_look(CONCRETE, (1., 1., 1.))
        facade, plain = wall, False
    elif fm in ("plaster", "stucco", "render"):
        wall = f"{STUCCO}|{int(_hash01(seed, 'wc') * len(WALL_TINTS[STUCCO]))}"
        facade = wall
    elif fm in ("metal", "steel", "corrugated_iron", "aluminium"):
        wall = f"{METALWALL}|{int(_hash01(seed, 'wc') * len(WALL_TINTS[METALWALL]))}"
        facade, plain = wall, False
    else:
        mapped_facade = False
    if barn or shed:
        plain = True
    # A small garage is not a timber shed by default. Mapped materials and alpine stone shelters win.
    if cls in ('garage', 'garages') and not mapped_facade and not stone_hut:
        wall = facade = f"{STUCCO}|0"
    if cls in CIVIC_CLASSES or cls in ('terrace', 'cafe', 'fast_food', 'kiosk', 'fire_station'):
        if not mapped_facade:
            wall = facade = f'{STUCCO}|0'
        plain = False
    if cls == 'semidetached_house':
        if not mapped_facade and wall is None:
            wall = facade = f'{STUCCO}|0'
        plain = False
    if not mapped_facade:
        if storage:
            wall = facade = f'{METALWALL}|0'
        elif cls == 'greenhouse':
            wall = facade = f"{SURFACE_MATERIALS['ghg']}|0"
        elif cls == 'static_caravan':
            wall = facade = f"{SURFACE_MATERIALS['vny']}|0"
        elif cls in ('toilets', 'service', 'chapel') and not stone_hut:
            wall = facade = f'{STUCCO}|0'
    fc = parse_color(attrs.get("facade_color"))
    if fc is not None and not attrs.get("bridge_part"):
        if wall is not None:
            base = LOOKS.get(wall, (wall.split("|")[0],))[0]
            wall = custom_look(base, fc)
            facade = wall
        elif fm == "brick":
            facade = custom_look(BRICK_WALL, fc)
            wall = facade
        elif fm == "glass":
            facade = custom_look(OFFICE, fc)
        else:
            facade = custom_look(FACADE, fc)
    if terminal and not mapped_facade:
        facade, band, plain = OFFICE, BAND_OFFICE, False
    elif garage and not mapped_facade:
        facade, band, plain = FACADE_TINTS[3], BAND_PANEL, False
    # Plain mapped walls use the separate-window mesh path, where `plain` alone does not suppress windows.
    windows = not (barn or shed)
    if cls in CIVIC_CLASSES:
        windows = True
    elif cls in ('terrace', 'cafe', 'fast_food', 'kiosk', 'fire_station', 'semidetached_house'):
        windows, plain, shop = False, False, False
    if storage or cls in ('greenhouse', 'static_caravan', 'shelter', 'roof', 'carport'):
        windows, plain = False, True
    # blank walls only where the data says hall (a class, or footprint_uses' places and land use)
    if not (shed or barn or row or house or terminal or garage or church) and nf <= 2 \
            and (industrial or (roof == "flat" and area >= BIG_BOX_M2 and cls in BIG_BOX_CLASSES)):
        windows = False
        if not mapped_facade:
            kind = METALWALL if industrial else PANEL
            wall = f"{kind}|{int(_hash01(seed, 'wc') * len(WALL_TINTS[kind]))}"
            facade = custom_look(kind, fc) if fc is not None else wall
            wall = facade
    rmat = str(attrs.get("roof_material") or "").lower()
    rmat = {"tile": "roof_tiles", "tiles": "roof_tiles", "clay": "roof_tiles", "terracotta": "roof_tiles",
            "bitumen": "tar_paper", "asphalt": "tar_paper", "felt": "tar_paper"}.get(rmat, rmat)
    if not rmat and cls == 'greenhouse':
        roof_mat = f"{SURFACE_MATERIALS['rgl']}|0"
    elif not rmat and (storage or cls == 'static_caravan'):
        roof_mat = f'{ROOF_METAL}|0'
    elif rmat in ROOF_SURFACES:
        roof_mat = f"{SURFACE_MATERIALS[ROOF_SURFACES[rmat]]}|0"
    elif rmat in ("metal", "tin", "steel", "zinc", "corrugated_iron", "sheet"):
        roof_mat = f"{ROOF_METAL}|{int(_hash01(seed, 'roof') * len(ROOF_TINTS[ROOF_METAL]))}"
    elif rmat in ("slate", "stone"):
        roof_mat = f"{ROOF_SLATE}|{int(_hash01(seed, 'roof') * 4)}"
    elif rmat in ("shingle", "shingles", "wood"):
        roof_mat = f"{ROOF_SHINGLE}|{int(_hash01(seed, 'roof') * len(ROOF_TINTS[ROOF_SHINGLE]))}"
    elif rmat in ("concrete", "cement"):
        roof_mat = f"{ROOF_FLAT}|{int(_hash01(seed, 'roof') * len(ROOF_TINTS[ROOF_FLAT]))}"
    elif roof == "flat" or barn or shed:
        roof_mat = ROOF_FLAT if roof == "flat" else ROOF_METAL
        roof_mat = f"{roof_mat}|{int(_hash01(seed, 'roof') * len(ROOF_TINTS[roof_mat]))}"
    else:       # the region's pitched roofs (the US: slate or shingle by the seed, their first four tints)
        mat, tints = style.roofs[min(int(seed * len(style.roofs)), len(style.roofs) - 1)]
        roof_mat = f"{mat}|{tints[int(_hash01(seed, 'roof') * len(tints))]}"
    rc = parse_color(attrs.get("roof_color"))
    if rc is not None:
        base_rmat = roof_mat.split("|")[0]
        roof_mat = custom_look(base_rmat, rc)
    # Regional barn/shed colours are fallbacks; mapped surfaces and paint already resolved above.
    if (barn or shed) and cls not in ('garage', 'garages', 'greenhouse', 'toilets', 'service', 'static_caravan', 'kiosk') \
            and not storage and not stone_hut and not mapped_facade and fc is None:
        tints = WALL_TINTS[SIDING]
        if barn and _hash01(seed, "barn") < style.barn_red:
            facade = f"{SIDING}|{len(tints) - 1 - int(_hash01(seed, 'red') * 2)}"
        elif style.wood:
            facade = f"{SIDING}|w{int(_hash01(seed, 'wc') * len(WOOD_TINTS))}"
        else:
            facade = f"{SIDING}|{int(_hash01(seed, 'sc') * (len(tints) - 2))}"
    castle = attrs.get("castle") if not (shed or garage or church or barn) else None
    if castle:                                  # (CASTLE_FLOORS, RUIN_H)
        if not mapped_facade:
            wall = facade = f"{STONE}|{int(_hash01(seed, 'stc') * len(WALL_TINTS[STONE]))}"
        shop = False
        mapped = attrs.get("height") is not None and np.isfinite(attrs.get("height")) or \
            attrs.get("num_floors") is not None and np.isfinite(attrs.get("num_floors"))
        if castle == "ruins":
            plain, windows, roof, nf = True, False, "flat", 1
            h = floor_h = RUIN_H[0] + (RUIN_H[1] - RUIN_H[0]) * _hash01(seed, "ruin")
            roof_mat = wall
        elif not mapped:
            nf = CASTLE_FLOORS[0] + int(_hash01(seed, "castle floors") * (CASTLE_FLOORS[1] - CASTLE_FLOORS[0] + 1))
            h = nf * floor_h + (0.6 if roof == "flat" else 0.2)
    # a front porch (the photos of Lancaster, Ocean City, Frederick, Moab: most houses have one): pitched-roof
    # houses, a regional share; doors() puts it on the front door's wall
    porch = (house and roof != "flat" and not barn and not shed and area < 300 and not castle
             and _hash01(seed, "porch") < style.porch)
    if porch:   # pitched roofs draw the walls on the oriented box: an L-shaped house's door wall can be inside it
        _, _, hl, hw = oriented_box(ring)
        porch = area >= 0.9 * 4 * hl * hw
    pattern = style.facade_pattern
    if cls in CIVIC_CLASSES:
        pattern = FacadePattern(bay_m=3., entrance='centre', door_clearance_m=1.3,
                                window_width_m=1.5, window_height_m=1.3, window_sill_m=.8)
    return Spec(architecture=architecture, ring=ring, floors=nf, floor_h=floor_h, height=h, roof=roof, roof_mat=roof_mat, facade=facade,
                band=band, shop=shop and not shed and nf >= 1, plain=plain, seed=seed, min_h=0.0, wall=wall, house=house,
                windows=windows, steeple=church and area < 2500 and not attrs.get("suppress_steeple")
                and roof not in ("pyramidal", "onion", "dome", "spherical"), porch=porch, cls=cls,
                deck=garage and roof == "flat", pitch=style.pitch, castle=castle,
                facade_pattern=architecture_pattern(architecture, pattern),
                roof_height=roof_h, roof_direction=direction, roof_orientation=orientation, paired_home=paired_home)
