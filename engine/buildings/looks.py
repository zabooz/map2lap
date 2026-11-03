"""Materials, tints, signs and the OSM places behind them."""
import hashlib
import logging


log = logging.getLogger("earthd.buildings")
FLOOR_M = 3.0               # m per storey (residential)
GROUND_FLOOR_SHOP_M = 4.2   # m, a shop's ground floor
FOUNDATION_M = 0.6          # m the walls reach under the lowest ground of the footprint
# The walls reach this far under the lowest ground of the footprint (a skirt): beyond the physics block (+-512 m) the
# ground drawn is the far field's mesh, coarser with distance (tens of metres between vertices at 1-2 km), which on any
# slope runs metres under the heights the buildings stand on: they floated ("houses and
# buildings in many parts of the world are floating"). Under a correct ground the skirt is hidden; the floors stay
# where they were (anchored at the eaves, the rest a plain plinth). The lite mesh (far tiles, a near tile's distant
# detail) stands on the coarsest ground: the deepest skirt.
SKIRT_M = 3.0
SKIRT_LITE_M = 10.0
MIN_AREA_M2 = 12.0          # footprints smaller than this are skipped (kiosks, sheds' slivers)
MAX_VERTS = 64              # footprints with more vertices are simplified until under this
SIMPLIFY_M = 0.35           # m: vertices closer than this to the line of their neighbours are dropped
TILE_PX_M = 12.0            # m of wall per 1024 px of the window sheets (5 sash bays of 2.4 m)
ROOF_UV_M = 6.0             # m per repeat of the roof textures
SIDING_UV_M = 3.0           # m per repeat of the plain wall textures (sheds, garages)
PITCH = {"gabled": 32.0, "hipped": 26.0}     # degrees
EAVE_M = 0.35               # m a pitched roof overhangs its walls
CORNICE_OUT_M = 0.28        # a flat roof's cornice: how far it stands out, its depth below and above the eave
CORNICE_DOWN_M = 0.45
CORNICE_UP_M = 0.2
# Materials (mod/.../art/shapes/beamngEarth/buildings.materials.json): the window sheets in a few tints, the
# shop / office sheet, roofs, plain walls.
FACADE_TINTS = ("bne_bld_fac_white", "bne_bld_fac_cream", "bne_bld_fac_sand", "bne_bld_fac_grey")
PAINT_TINTS = ("bne_bld_fac_blue", "bne_bld_fac_green", "bne_bld_fac_rose", "bne_bld_fac_yellow")   # painted houses
BRICK_TINTS = ("bne_bld_fac_white", "bne_bld_fac_brickdark", "bne_bld_fac_brickwarm")   # the brick band's
SHOP = "bne_bld_shop"
OFFICE = "bne_bld_office"
ROOF_FLAT = "bne_bld_roof_flat"
ROOF_SLATE = "bne_bld_roof_slate"
ROOF_SHINGLE = "bne_bld_roof_shingle"
SIDING = "bne_bld_siding"
FACADE = "bne_bld_facade"    # the plaster window sheet, tinted per building by vertex colour
STUCCO = "bne_bld_stucco"   # plain stucco walls (windows laid over them from the sheet)
ROOF_METAL = "bne_bld_roof_metal"   # standing-seam metal (barns, sheds, farm buildings)
PANEL = "bne_bld_panel"     # precast concrete panels (big-box stores, strip malls)
METALWALL = "bne_bld_metalwall"     # corrugated metal walls (warehouses, factories)
STONE = "bne_bld_stone"     # dressed stone (old villages and towns of southern and central Europe: Gordes came out as
                            # grey plaster)
STONE_FLOORS = 4            # stone walls on buildings this low at most
BIG_BOX_M2 = 1200.0         # m2: a low commercial building this big is a big box (blank walls, one storefront)
CHURCH_CLASSES = ("church", "chapel", "cathedral")
# A footprint is the church an OSM Christian place of worship names (pois.py: its bbox; most churches are mapped as a
# building tagged building=yes, Overture gives them no class): the one its point is in, or the one whose bbox it
# covers this much of and is this much of (intersection over union; the same outline mapped once gives ~1, a church
# site drawn round the church and its yard and rectory far less)
CHURCH_IOU = 0.5
CHURCH_OVER = ("", "religious")     # Overture classes a place of worship turns into a church (none says more)
# A castle's buildings (castle_rings: those whose centre is in the box of an OSM historic=castle / fort / city_gate,
# or that hold its point): dressed stone, no shop front, its corner tower over it (_keep), merlons on a flat roof.
# A ruin (historic=ruins, building=ruins): a windowless stone block RUIN_H high with a broken top. One look for the
# world: OSM's castle_type (fortress or palace) is not in the POI file
RUIN_H = (3.0, 8.0)         # m: what is left standing of a ruin's walls (a hashed height between)
CASTLE_FLOORS = (2, 3)      # floors of a castle's building with none mapped (a hall over a vaulted ground floor)
MERLON = (0.6, 0.6, 0.8, 0.5)   # m: a merlon's length, the gap between two, its height, the wall's thickness
KEEP_SIDE = (2.5, 5.0)      # m: half the side of a castle's corner tower, from the building's width
BARN_CLASSES = {"barn", "farm_auxiliary", "stable", "cowshed"}
# The mesh's materials (vertColor: each building's colours are its vertices'); the names above are the
# looks plan() picks, each one of these with a colour (LOOKS).
MARBLE = "bne_bld_marble"   # cut white marble (the stock m_marble_cut): Baltimore's row house steps
BRICK_WALL = "bne_bld_brick"    # plain red brick (the stock brick_plain): a garage's skin
CONCRETE = "bne_bridge_concrete"  # plain concrete (tunnel.materials.json): a precast garage's skin
SKY_WALL = "bne_bld_sky"    # the skyline's walls: plain (vertex colours), their windows lit at night (_sky_mesh)
# the name signs' lettering: the guide signs' (exit.materials.json, the glyph atlas of exitsigns.lettering), light, dark
LETTERS = ("bne_guide_letters", "bne_guide_letters_black")
MATERIALS = (FACADE, SHOP, OFFICE, ROOF_FLAT, ROOF_SLATE, ROOF_SHINGLE, SIDING, STUCCO, ROOF_METAL, PANEL, METALWALL,
             STONE, MARBLE, BRICK_WALL, CONCRETE, SKY_WALL) + LETTERS
LOOKS = {
    "bne_bridge_steel": (METALWALL, (0.50, 0.52, 0.54)),
    "bne_marble": (MARBLE, (1.0, 1.0, 1.0)),
    "bne_brick_red": (BRICK_WALL, (1.0, 1.0, 1.0)), "bne_brick_dark": (BRICK_WALL, (0.78, 0.72, 0.70)),
    "bne_brick_tan": (BRICK_WALL, (1.0, 0.92, 0.80)),
    "bne_precast": (CONCRETE, (1.0, 1.0, 1.0)), "bne_precast_warm": (CONCRETE, (1.0, 0.95, 0.86)),
    "bne_bld_fac_white": (FACADE, (1.0, 1.0, 1.0)), "bne_bld_fac_cream": (FACADE, (1.0, 0.93, 0.80)),
    "bne_bld_fac_sand": (FACADE, (0.92, 0.82, 0.68)), "bne_bld_fac_grey": (FACADE, (0.80, 0.82, 0.84)),
    "bne_bld_fac_brickdark": (FACADE, (0.78, 0.72, 0.70)), "bne_bld_fac_brickwarm": (FACADE, (1.0, 0.88, 0.80)),
    "bne_bld_fac_blue": (FACADE, (0.80, 0.87, 0.96)), "bne_bld_fac_green": (FACADE, (0.84, 0.92, 0.82)),
    "bne_bld_fac_rose": (FACADE, (0.99, 0.86, 0.82)), "bne_bld_fac_yellow": (FACADE, (1.0, 0.95, 0.72)),
    SHOP: (SHOP, (1.0, 1.0, 1.0)), OFFICE: (OFFICE, (1.0, 1.0, 1.0)), SIDING: (SIDING, (0.93, 0.92, 0.88)),
}
ROOF_TINTS = {               # per roof material: the colours a building's roof takes (hashed)
    ROOF_FLAT: ((0.85, 0.85, 0.85), (0.62, 0.62, 0.64), (0.95, 0.93, 0.88), (0.45, 0.45, 0.46), (0.75, 0.70, 0.64)),
    # 4..: clay tiles (terracotta, red-brown, faded orange) and dark grey / anthracite / brown-black (regional)
    ROOF_SLATE: ((1.0, 1.0, 1.0), (0.80, 0.66, 0.56), (0.76, 0.80, 0.90), (0.62, 0.62, 0.62),
                 (0.95, 0.52, 0.36), (0.78, 0.40, 0.30), (1.0, 0.66, 0.46), (0.42, 0.43, 0.46), (0.30, 0.31, 0.33),
                 (0.48, 0.38, 0.32)),
    ROOF_SHINGLE: ((0.75, 0.72, 0.70), (0.55, 0.50, 0.48), (0.70, 0.56, 0.48), (0.62, 0.66, 0.72),
                   (0.95, 0.52, 0.36), (0.78, 0.40, 0.30), (0.42, 0.43, 0.46), (0.36, 0.42, 0.52)),
    ROOF_METAL: ((0.85, 0.86, 0.88), (0.55, 0.57, 0.60), (0.45, 0.58, 0.48), (0.62, 0.30, 0.26), (0.40, 0.42, 0.48)),
}
WALL_TINTS = {               # houses with plain walls and laid-over windows: their colours (hashed)
    SIDING: ((0.96, 0.95, 0.92), (0.90, 0.86, 0.76), (0.78, 0.84, 0.90), (0.95, 0.92, 0.74), (0.78, 0.84, 0.74),
             (0.82, 0.78, 0.72), (0.70, 0.72, 0.75), (0.62, 0.20, 0.17), (0.66, 0.24, 0.20)),   # the last: barn red
    STUCCO: ((1.0, 0.97, 0.90), (0.96, 0.88, 0.74), (0.93, 0.80, 0.68), (0.98, 0.95, 0.88), (0.88, 0.84, 0.78),
             # 5..: bright paints (Latin America, the Mediterranean, the tropics): ochre, terracotta, sky blue,
             # mint, pink, yellow
             (1.0, 0.78, 0.45), (0.92, 0.58, 0.44), (0.66, 0.82, 0.95), (0.70, 0.90, 0.78), (0.98, 0.72, 0.76),
             (1.0, 0.92, 0.52)),
    PANEL: ((0.96, 0.94, 0.89), (0.86, 0.86, 0.86), (0.92, 0.85, 0.74), (0.78, 0.80, 0.82), (0.88, 0.78, 0.68),
            (0.62, 0.62, 0.60), (0.56, 0.54, 0.50)),    # the last two: weathered concrete (parking decks)
    METALWALL: ((0.88, 0.89, 0.90), (0.72, 0.74, 0.77), (0.84, 0.80, 0.72), (0.66, 0.72, 0.78)),
    # limestone, honey, ochre and grey stone (the texture is a light ashlar: tinted down)
    STONE: ((1.0, 0.93, 0.80), (0.98, 0.86, 0.66), (0.95, 0.80, 0.60), (0.86, 0.85, 0.82), (0.92, 0.88, 0.80)),
    # curtain walls ("the skyscrapers all use the same texture and look the same colour"):
    # silver, blue, green, bronze, charcoal and steel-blue glass, the common tints of real towers
    OFFICE: ((1.0, 1.0, 1.0), (0.74, 0.84, 0.98), (0.76, 0.92, 0.86), (0.98, 0.84, 0.66), (0.56, 0.58, 0.62),
             (0.66, 0.74, 0.86), (0.88, 0.90, 0.92)),
}
for _m, _cs in list(ROOF_TINTS.items()) + list(WALL_TINTS.items()):
    for _k, _c in enumerate(_cs):
        LOOKS[f"{_m}|{_k}"] = (_m, _c)
# stained wood boards (Alpine chalets; kept apart from the siding tints' indices): larch brown, dark brown, grey-brown
WOOD_TINTS = ((0.62, 0.44, 0.30), (0.46, 0.33, 0.24), (0.58, 0.52, 0.46))
for _k, _c in enumerate(WOOD_TINTS):
    LOOKS[f"{SIDING}|w{_k}"] = (SIDING, _c)
# Shop signs (Bishop's and Moab's main streets: a painted sign band over every shopfront, each shop its own
# colour): boxes over the ground floor of a shop's street wall, a colour per shop width (hashed).
SIGN_TINTS = ((0.62, 0.16, 0.14), (0.16, 0.22, 0.42), (0.18, 0.36, 0.24), (0.95, 0.90, 0.75), (0.42, 0.30, 0.22),
              (0.85, 0.65, 0.20), (0.13, 0.13, 0.14), (0.96, 0.96, 0.96), (0.15, 0.45, 0.48))
for _k, _c in enumerate(SIGN_TINTS):
    LOOKS[f"sign|{_k}"] = (FACADE, _c)
SIGN_H = 0.9                # m, the band's height (its top 0.15 m under the ground floor's top)
SIGN_OUT = 0.18             # m out from the wall
SIGN_SHOP_M = (6.0, 11.0)   # one shop's width (hashed in this range)
for _k, _m in enumerate(LETTERS):
    LOOKS[f"letters|{_k}"] = (_m, (1.0, 1.0, 1.0))
# Name signs (names_for): a shop's name on its band, a hall's on one panel over its storefront
SIGN_CAP = 0.5              # of the band's height: the capitals' (squeezed to the band's width, never wider)
SIGN_MARGIN_M = 0.3         # m of band kept free at each end of a name
HALL_CAP_M = 1.0            # m: a hall's capitals at most (a firm's lettering readable from the road) ...
HALL_CAP_SHARE = 0.6        # ... of the wall's width at most for the whole name
HALL_CLEAR_M = 3.0          # m over a hall's floor kept free under its name (its doors, gates and shop windows)
SIGN_NAME_CHARS = 30        # a longer name is cut after its last whole word within this ...
PANEL_NAME_CHARS = 40       # ... on a shop band; a public building's or hotel's panel (scaled to the wall) takes this
SIGN_NAME_CUT = (" - ", " – ", " — ", " | ", " · ", " / ")   # a place's branch after these (Kärntner Sparkasse - Eberndorf)
# classes that are a business whatever is mapped about it: with no name, one is invented (shopnames.invented); a
# "commercial" building only as a hall (as often offices as shops)
INVENTED_CLASSES = {"retail", "supermarket", "kiosk", "shop"}
# The signs of buildings that are no shop front (signs_for, _plates): a public building's or a hotel's name on a panel
# over its entrance, the offices' plates beside the door, a hotel's upright blade, a pharmacy's symbol. The kind from
# the mapped class first, else from the places in the footprint (place_sign).
PUBLIC_KINDS = ("fire_station", "police", "town_hall", "school", "kindergarten", "hospital", "post", "library",
                "station", "public")    # (most telling first: a building with several shows the first; "public": no
                                        # word of its own, only a name)
CLASS_SIGNS = {"fire_station": "fire_station", "police": "police", "school": "school", "kindergarten": "kindergarten",
               "hospital": "hospital", "post_office": "post", "library": "library", "train_station": "station",
               "townhall": "town_hall", "government": "public", "public": "public", "civic": "public",
               "university": "public", "college": "public", "hotel": "hotel", "office": "office"}
# Overture places (basic_category, or its primary taxonomy) -> sign kind
PLACE_SIGNS = {"fire_station": "fire_station", "police_station": "police", "town_hall": "town_hall",
               "elementary_school": "school", "middle_school": "school", "high_school": "school", "school": "school",
               "private_school": "school", "preschool": "kindergarten", "kindergarten": "kindergarten",
               "hospital": "hospital", "specialty_hospital": "hospital", "post_office": "post", "library": "library",
               "train_station": "station", "government_office": "public", "government_department": "public",
               "courthouse": "public", "college_university": "public", "community_center": "public",
               "cultural_center": "public", "museum": "public", "embassy": "public",
               "hotel": "hotel", "resort": "hotel",
               # (a guest house, inn or hostel: its name over the door, no blade; a holiday flat, private_lodging, none)
               "inn": "lodging", "bed_and_breakfast": "lodging", "lodging": "lodging",
               "pharmacy": "pharmacy"}
# lodging taxonomies that are a let house or flat, no sign on it (a holiday platform's listing, lodging / cabin:
# "BELVILLA - ( AT-9141-11 ) Gemütliches Ferienhaus" would put the platform's name on a family house)
NO_SIGN_PLACES = {"cabin", "holiday_rental_home", "service_apartment", "vacation_rental", "cottage"}
# services that work behind a door rather than a shop window: a plate at the entrance (a lawyer, a doctor, a firm)
OFFICE_PLACES = {"professional_service", "financial_service", "real_estate_service", "attorney_or_law_firm",
                 "legal_service", "corporate_or_business_office", "b2b_office_and_professional_service",
                 "media_service", "design_service", "technical_service", "building_or_construction_service",
                 "b2b_service", "telecommunications_service", "security_service", "research_institute",
                 "labor_union", "political_organization", "diagnostics_imaging_or_lab_service", "dental_clinic",
                 "primary_care_or_general_clinic", "pediatric_clinic", "specialized_health_care",
                 "behavioral_or_mental_health_clinic", "physical_medicine_and_rehabilitation",
                 "vision_or_eye_care_clinic", "outpatient_care_facility"}
OFFICE_PLATES = 3           # plates beside one door at most (the rest of a block's registered firms: unreadable anyway)
PLATE_W, PLATE_H = 0.9, 0.3     # m: an office plate, ...
PLATE_TOP_M = 2.1           # ... the top one's upper edge over the floor, the others stacked under it
PANEL_H = 0.7               # m: a name panel over an entrance (between the ground floor's windows and the next ones)
PANEL_CAP = 0.5             # of its height: the capitals'
BLADE_W, BLADE_T = 0.8, 0.15    # m: a hotel's upright blade, out from the wall and thick, ...
BLADE_CAP_M = 0.4           # ... its capitals at most, one under the other
SYMBOL_M = 0.8              # m: a pharmacy's cross or "A", square
SYMBOL_IN_M = 0.3           # m from the end of the street wall: a blade or symbol at the corner, clear of the bands
# a pharmacy's symbol: the green cross is the pharmacists' sign of most of Europe and its neighbours; Germany and
# Austria show the "Apotheken-A" (drawn white on a red square: the lettering has no red); elsewhere (the US's
# drugstores, Japan) none: the name alone
PHARMACY_A = {"AT", "DE"}
PHARMACY_CROSS = {"FR", "BE", "LU", "MC", "NL", "IT", "SM", "VA", "MT", "ES", "AD", "PT", "CH", "LI", "SI", "HR", "BA",
                  "RS", "ME", "MK", "AL", "GR", "CY", "PL", "CZ", "SK", "HU", "RO", "BG", "GB", "IE", "MA", "TN", "DZ"}
PLATE_TINTS = (5, 7, 6)     # SIGN_TINTS of a plate: brass, white, black (one per building)
PANEL_TINTS = {"fire_station": 0, "police": 1}  # SIGN_TINTS by kind (red, blue); others hashed among PANEL_PLAIN
PANEL_PLAIN = (7, 3, 6, 1)
GREEN_CROSS = "sign|cross"
LOOKS[GREEN_CROSS] = (FACADE, (0.10, 0.62, 0.24))
BARN_REDS = 2               # the last siding tints are barn red (barns only)
US_WALL_TINTS = {STUCCO: 5}  # the first tints of these kinds are the US's (later ones: regional paints)
JITTER = 0.06               # a building's colour varies this much (one factor, hashed)
COLOR_NAMES = {
    "white": (0.95, 0.95, 0.95), "black": (0.12, 0.12, 0.12),
    "grey": (0.50, 0.50, 0.50), "gray": (0.50, 0.50, 0.50),
    "lightgrey": (0.75, 0.75, 0.75), "lightgray": (0.75, 0.75, 0.75),
    "darkgrey": (0.30, 0.30, 0.30), "darkgray": (0.30, 0.30, 0.30),
    "silver": (0.75, 0.75, 0.78), "charcoal": (0.20, 0.20, 0.22), "anthracite": (0.22, 0.23, 0.25),
    "red": (0.75, 0.15, 0.15), "darkred": (0.50, 0.10, 0.10), "lightred": (0.85, 0.35, 0.35),
    "maroon": (0.45, 0.10, 0.15), "burgundy": (0.45, 0.12, 0.20), "crimson": (0.70, 0.10, 0.20),
    "pink": (0.90, 0.60, 0.65), "rose": (0.90, 0.55, 0.60), "coral": (0.90, 0.45, 0.35),
    "salmon": (0.90, 0.50, 0.45), "brick": (0.65, 0.25, 0.18),
    "green": (0.18, 0.55, 0.22), "darkgreen": (0.10, 0.35, 0.12), "lightgreen": (0.45, 0.75, 0.40),
    "olive": (0.45, 0.50, 0.20), "lime": (0.55, 0.75, 0.20), "forestgreen": (0.13, 0.40, 0.15),
    "teal": (0.12, 0.45, 0.45), "mint": (0.60, 0.85, 0.70), "sage": (0.55, 0.65, 0.55), "moss": (0.35, 0.45, 0.25),
    "blue": (0.18, 0.38, 0.72), "darkblue": (0.10, 0.20, 0.45), "lightblue": (0.50, 0.70, 0.88),
    "navy": (0.08, 0.15, 0.35), "skyblue": (0.50, 0.75, 0.90), "cyan": (0.20, 0.70, 0.75),
    "azure": (0.30, 0.60, 0.85), "cobalt": (0.15, 0.30, 0.65), "turquoise": (0.25, 0.70, 0.65),
    "steel": (0.45, 0.50, 0.55), "steel_blue": (0.28, 0.45, 0.60),
    "yellow": (0.92, 0.82, 0.20), "lightyellow": (0.95, 0.92, 0.60), "gold": (0.85, 0.70, 0.18),
    "orange": (0.90, 0.48, 0.12), "darkorange": (0.80, 0.35, 0.08), "amber": (0.88, 0.60, 0.12),
    "brown": (0.45, 0.30, 0.20), "darkbrown": (0.30, 0.20, 0.12), "lightbrown": (0.60, 0.45, 0.32),
    "rust": (0.60, 0.25, 0.15), "beige": (0.90, 0.85, 0.75), "cream": (0.95, 0.92, 0.82),
    "tan": (0.82, 0.70, 0.55), "terracotta": (0.78, 0.40, 0.26), "ochre": (0.80, 0.55, 0.20),
    "sand": (0.88, 0.80, 0.65), "khaki": (0.75, 0.70, 0.50), "copper": (0.55, 0.75, 0.65),
    "bronze": (0.55, 0.42, 0.25), "purple": (0.50, 0.20, 0.55), "violet": (0.55, 0.25, 0.60),
    "magenta": (0.75, 0.15, 0.55), "indigo": (0.25, 0.10, 0.45), "lavender": (0.75, 0.70, 0.85),
    "plum": (0.45, 0.20, 0.40),
}


def parse_color(val):
    """Parse an OSM/Overture color (hex or CSS name) into an (r, g, b) float tuple in [0, 1], or None."""
    if not val or not isinstance(val, str):
        return None
    s = val.strip().lower().replace(" ", "").replace("-", "_")
    if s in COLOR_NAMES:
        return COLOR_NAMES[s]
    if s.startswith("#"):
        hex_str = s[1:]
        if len(hex_str) in (3, 4):
            try:
                return tuple(int(hex_str[i] * 2, 16) / 255.0 for i in range(3))
            except ValueError:
                return None
        elif len(hex_str) in (6, 8):
            try:
                return tuple(int(hex_str[2 * i:2 * i + 2], 16) / 255.0 for i in range(3))
            except ValueError:
                return None
    return None


def custom_look(mat, rgb):
    """A look key in LOOKS for material mat with RGB tuple in [0, 1]."""
    key = f"{mat}|c_{rgb[0]:.3f}_{rgb[1]:.3f}_{rgb[2]:.3f}"
    if key not in LOOKS:
        LOOKS[key] = (mat, rgb)
    return key


class _Looks:
    """name -> (material index, RGBA bytes) for one building (its hashed brightness jitter)."""

    def __init__(self, seed):
        self.f = 1.0 + JITTER * (2.0 * _hash01(seed, "jit") - 1.0)

    def __getitem__(self, name):
        if name in LOOKS:
            mat, c = LOOKS[name]
        elif name.startswith("custom|") or ("|c_" in name):
            mat = name.split("|")[0]
            c = (1.0, 1.0, 1.0)
        else:
            mat, c = LOOKS.get(name, (FACADE, (1.0, 1.0, 1.0)))
        return MATERIALS.index(mat), tuple(int(max(0, min(255, round(255 * v * self.f)))) for v in c) + (255,)


# The window sheets' bands, top of the image first (v in Collada convention: v = 1 at the image top).
# (sheet, band index, bays per 1024 px)
BAND_TALL = (0, 3)          # m_highrise_plaster: tall windows on plaster (3 bays of uneven width)
BAND_PANEL = (1, 4)         # square windows on panels
BAND_SASH = (2, 5, (0, 2, 3))   # sash windows on plaster (bays 1 and 4 are black "open" windows: skipped)
BAND_BRICK = (3, 5)         # sash windows on red brick
BAND_OFFICE = (0, 5)        # m_highrise_metal: curtain wall
BAND_OFFICE2 = (1, 4)
BAND_SHOP = (2, 2)          # shopfront with awnings
BANDS = 4
# Overture "bridge_structure" (OSM man_made=bridge parts with a height: the Queensboro Bridge's towers, 110 m) was a
# glass tower the decks ran through
BRIDGE_CLASSES = {"bridge_structure"}
BRIDGE_PIER_M = 12.0        # a bridge structure's height when not mapped
STEEL_MATERIALS = ("", "steel", "metal", "iron")     # a part over a bridge support of these (or none mapped): steel
MASONRY_MATERIALS = ("concrete", "stone", "brick", "masonry", "granite")
STONE_FACADES = ("stone", "sandstone", "limestone", "granite", "marble", "masonry", "tuff", "slate")
STEEL = "bne_bridge_steel"  # (a LOOKS name: the corrugated-metal material, painted steel grey)
# a bridge structure in its mapped paint (bridgetypes.PAINTS: the Golden Gate Bridge's towers, building:colour #bf4e3b,
# were steel grey beside its orange cables)
for _k, _c in __import__("bridgetypes").PAINTS.items():
    LOOKS[f"{STEEL}|{_k}"] = (METALWALL, tuple(v / 255.0 for v in _c))
STEEL_LEG_MAX = 3.0         # m: a frame's legs at most this thick (a quarter of its short side)
STEEL_BAY_M = 14.0          # m between a frame's bracing levels
STEEL_TOP_SHARE = 0.85      # cross beams over the decks only from this share of the height up
SHED_CLASSES = {"shed", "garage", "garages", "carport", "roof", "hut", "cabin", "barn", "farm_auxiliary",
                "greenhouse", "service", "storage_tank", "toilets", "kiosk", "parking", "shelter"}
# A grain elevator (the plains' small towns: Strasburg, CO by I-70 had two 8-storey brick apartment blocks with windows
# in the farmland): a tall slender footprint of no class (or a silo's) in a US small town, plain concrete
# A pyramid (Giza's: drawn as 66-140 m boxes with windows): a pyramidal roof mapped as (nearly) the whole
# height over a monument-sized footprint is a stone pyramid on a low plinth (pitched roofs are otherwise flat past 28 m)
PYRAMID_ROOF_SHARE = 0.8
PYRAMID_MIN_M2 = 500.0
PYRAMID_PLINTH_M = 1.0
ELEVATOR_CLASSES = {"", "industrial", "silo", "grain_silo", "storage_tank", "farm_auxiliary", "agricultural"}
ELEVATOR_MIN_H = 15.0       # m mapped (a height, no floors)
ELEVATOR_MAX_M2 = 1500.0
ELEVATOR_SLENDER = 0.7      # height / sqrt(area) at least (11 x 11 m, 25 m: 2.3; 28 x 31 m, 23 m: 0.78; a 15 m motel: 0.4)
GLASS_FLOORS = (20, 40)     # towers from 20 floors: glass, but for OLD_TOWER_GLASS of the old ones below 40 ...
OLD_TOWER_GLASS = 0.65      # ... (Midtown's pre-war skyscrapers are stone)
MIDRISE_GLASS_OFFICE = 0.45 # offices / hotels of 7+ floors: this share glass (modern), the rest masonry
TOWER_SHOP_FLOORS = 6       # a building this tall in a dense core: a shop / lobby ground floor whatever its class
# (shop: not an Overture class, footprint_uses' for a building with a shop or restaurant inside: its ground floor)
SHOP_CLASSES = {"retail", "commercial", "supermarket", "kiosk", "office", "hotel", "civic", "restaurant", "shop"}
BIG_BOX_CLASSES = {"retail", "commercial", "supermarket"}   # low and from BIG_BOX_M2: blank walls, one storefront
HOUSE_CLASSES = {"house", "detached", "semidetached_house", "bungalow", "residential", "farm", "static_caravan",
                 "cabin", "dormitory"}
HOUSE_MAX_M2 = 300.0        # m2: the biggest footprint drawn as a detached house
ROW_CLASSES = {"terrace"}
GARAGE_MIN_M2 = 400.0       # a "parking" building this big is a parking structure
INDUSTRIAL_CLASSES = {"industrial", "warehouse", "manufacture", "factory", "hangar"}
# The use of a footprint whose class is not mapped (a village's ~90 %, most buildings outside Europe's cities), from
# the Overture places (POIs from Meta and Microsoft: basic_category, taxonomy) inside it and the OSM land use under it
# (footprint_uses). Without either the generic rules stand, and the size alone never makes a hall (a 2,000 m² village
# building with no data came out as a windowless factory). A closed place counts too: the building outlasts its business.
SHOP_PLACES = {"shopping", "restaurant", "bar", "cafe", "coffee_shop", "casual_eatery", "fast_food_restaurant",
               "bakery", "bank_or_credit_union", "personal_or_beauty_service", "laundry_service", "travel_service",
               "food_court", "smoothie_juice_bar", "non_alcoholic_beverage_venue", "auto_dealer", "vehicle_dealer"}
# (and every basic category "..._store"); sales halls by their taxonomy (a grocery_store can be a corner shop, a
# home_improvement_store is a hall)
HALL_PLACES = {"superstore", "warehouse_club_store", "home_improvement_store", "building_supply_store", "shopping_mall",
               "department_store"}
WORKS_PLACES = {"manufacturer", "wholesaler", "storage_facility", "self_storage_facility", "sawmill"}
# Public services that take the whole building: the businesses listed in it are its own counters (a town hall's
# tourist office listed as a travel agency, a school's tuck shop), no shopfront. A police station, post office or
# kindergarten often rents a floor of a block with shops (Eisenkappel's police over Cafe Haeferl)
WHOLE_PUBLIC = ("fire_station", "town_hall", "school", "hospital", "library")
# A place a few metres outside every footprint belongs to the nearest one this close (places_of): OSM's entrance
# nodes and Overture's geocoded points sit on the pavement in front of the door (Eisenkappel's town hall: 0.1 m
# outside its wall). In a terrace a point by a party wall goes to the nearer house, the right one most of the time
PLACE_NEAR_M = 3.0
# OpenStreetMap's POIs (pois.py "places": what Overture's places miss, a village's town hall, police, cafe) as the
# Overture category the rules above know: (OSM key, value) -> category, (key, None) for any other value of the key
OSM_PLACES = {
    ("amenity", "townhall"): "town_hall", ("amenity", "police"): "police_station",
    ("amenity", "fire_station"): "fire_station", ("amenity", "school"): "school",
    ("amenity", "kindergarten"): "kindergarten", ("amenity", "childcare"): "kindergarten",
    ("amenity", "hospital"): "hospital", ("amenity", "post_office"): "post_office",
    ("amenity", "library"): "library", ("amenity", "courthouse"): "courthouse",
    ("amenity", "community_centre"): "community_center", ("amenity", "arts_centre"): "cultural_center",
    ("amenity", "college"): "college_university", ("amenity", "university"): "college_university",
    ("amenity", "pharmacy"): "pharmacy", ("amenity", "bank"): "bank_or_credit_union",
    ("amenity", "cafe"): "cafe", ("amenity", "restaurant"): "restaurant",
    ("amenity", "fast_food"): "fast_food_restaurant", ("amenity", "bar"): "bar", ("amenity", "pub"): "bar",
    ("amenity", "biergarten"): "bar", ("amenity", "ice_cream"): "cafe",
    ("amenity", "doctors"): "primary_care_or_general_clinic", ("amenity", "dentist"): "dental_clinic",
    ("amenity", "clinic"): "outpatient_care_facility", ("amenity", "veterinary"): "professional_service",
    ("tourism", "hotel"): "hotel", ("tourism", "motel"): "hotel", ("tourism", "guest_house"): "inn",
    ("tourism", "hostel"): "inn", ("tourism", "museum"): "museum",
    ("shop", "mall"): "shopping_mall", ("shop", "department_store"): "department_store",
    ("shop", "doityourself"): "home_improvement_store", ("shop", None): "shopping",
    ("office", None): "professional_service", ("healthcare", None): "primary_care_or_general_clinic",
    ("craft", None): "professional_service",
}
OSM_KEYS = ("amenity", "tourism", "shop", "office", "healthcare", "craft")   # (the first that gives a category)
OSM_KEYS_READ = ("amenity", "shop", "office", "tourism", "craft", "healthcare")     # (pois.WHAT["places"]'s order)


def osm_place(tags):
    """The Overture category (place_use, place_sign) of an OSM POI's tags (dict), or None. Pure."""
    for key in OSM_KEYS:
        v = str(tags.get(key) or "").split(";")[0].strip().lower()
        if v and v not in ("no", "vacant"):
            got = OSM_PLACES.get((key, v)) or OSM_PLACES.get((key, None))
            if got:
                return got
    return None


# land use (Overture class) -> the class of a big unclassed building on it; residential land use is often a whole
# district and says nothing, commercial (offices as often as stores) only for halls (BIG_BOX_M2)
LAND_CLASSES = {"industrial": "industrial", "works": "industrial", "retail": "retail", "commercial": "commercial"}


def _hash01(*vals):
    """A number in [0, 1) from the values (stable across runs and machines)."""
    h = hashlib.blake2b(repr(vals).encode(), digest_size=8).digest()
    return int.from_bytes(h, "little") / 2.0 ** 64
