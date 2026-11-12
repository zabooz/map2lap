"""The generator's freestanding cars, leisure objects, utilities and station kits as library templates.

Lengths/colours/heights come from the same builders and their ordinary defaults. Map-bound surfaces and continuous road,
building or fence outlines are not single models. Nothing here changes automatic map placement.
"""
import functools
import math

import numpy as np

import powerlines
from scenery import cars, leisure, propsmesh

CAR_SHAPES = ("saloon", "hatchback", "suv", "van")
CAR_COLOURS = ("white", "black", "grey", "silver", "blue", "red", "green", "beige", "burgundy", "yellow", "orange", "light_blue")
CARS = {f"car_{shape}_{colour}": (s, c, f"Parked {shape.upper() if shape == 'suv' else shape} — {colour.replace('_', ' ')}")
        for s, shape in enumerate(CAR_SHAPES) for c, colour in enumerate(CAR_COLOURS)}
UTILITY = {"pylon": ("Power pylon", propsmesh.PYLON_TOP),
           **{name: (title, powerlines.PARTS[name]) for name, title in (
               ("gantry", "Substation gantry"), ("sub_support", "Substation insulator support"),
               ("sub_breaker", "Substation breaker"), ("sub_transformer", "Substation transformer"), ("sub_mast", "Substation mast"))}}
FUEL = {"fuel_pump": ("Fuel dispenser", "pump", 0), "fuel_sign": ("Fuel price sign", "brandsign", 0),
        "fuel_bollard": ("Protective bollard", "bollard", 0), "fuel_canopy": ("Fuel station canopy and islands", "eca_gastation", 0),
        "fuel_canopy_roof": ("Fuel canopy roof", "fuel_structure_06", 4.8), "fuel_canopy_pillar": ("Fuel canopy pillar", "fuel_structure_07", 0),
        "fuel_awning": ("Fuel canopy half", "awningst", 0)}


def _flat(x, y):
    return np.zeros_like(np.asarray(x), dtype=float)


def _play(device):
    return lambda b: leisure.DEVICES[device](b, leisure._frame(0, 0, 0, 0), 0, leisure.RED)


def _mast(cls, lattice=False, tv=False):
    return lambda b: leisure._mast(b, cls, 0, 0, 0, leisure.TV_MIN_M if tv else leisure.MAST_H[cls],
                                  {"tower:construction": "lattice"} if lattice else {}, 0)


LEISURE = {
    "fountain": ("Stone fountain", "mesh", lambda b: leisure.fountain(b, None, np.zeros(2), _flat)),
    "water_trough": ("Stone water trough", "mesh", lambda b: leisure.trough(b, 0, 0, 0, 0)),
    "drinking_fountain": ("Drinking fountain", "mesh", lambda b: leisure.pedestal(b, 0, 0, 0)),
    **{name: (title, "none", _play(k)) for k, (name, title) in enumerate((
        ("swing", "Swing"), ("slide", "Slide tower"), ("climbing_frame", "Climbing frame"), ("seesaw", "Seesaw"), ("sandpit", "Sandpit")))},
    "headstone": ("Headstone", "none", lambda b: leisure._grave(b, 0, 0, 0, 0, .5)),
    "grave_cross": ("Grave cross", "none", lambda b: leisure._grave(b, 0, 0, 0, 0, .05)),
    "football_goal": ("Football goal", "none", lambda b: leisure._goal(b, 0, 0, 0, (1, 0), *leisure.SOCCER["goal"])),
    "basketball_hoop": ("Basketball hoop", "none", lambda b: leisure._hoop(b, 0, 0, 0, (1, 0), leisure.BASKET["board"], leisure.BASKET["height"])),
    "silo": ("Silo", "mesh", lambda b: leisure._tank(b, "silo", None, np.zeros(2), math.nan, _flat, {})),
    "storage_tank": ("Storage tank", "mesh", lambda b: leisure._tank(b, "storage_tank", None, np.zeros(2), math.nan, _flat, {})),
    "communication_mast": ("Communication mast", "mesh", _mast("communication_tower")),
    "lattice_communication_mast": ("Lattice communication mast", "mesh", _mast("communication_tower", lattice=True)),
    "mobile_phone_mast": ("Mobile phone mast", "mesh", _mast("mobile_phone_tower")),
    "lattice_mobile_phone_mast": ("Lattice mobile phone mast", "mesh", _mast("mobile_phone_tower", lattice=True)),
    "tv_tower": ("TV tower", "mesh", _mast("communication_tower", tv=True)),
    "floodlight": ("Floodlight mast (unlit)", "mesh", _mast("lighting")),
}


def names():
    """The additional generator templates, in family order. Pure."""
    return [*CARS, *UTILITY, *LEISURE, *FUEL]


def description(name):
    """(title, scenery source module) of one additional template. Pure."""
    if name in CARS:
        return CARS[name][2], "cars"
    if name in LEISURE:
        return LEISURE[name][0], "leisure"
    return (UTILITY[name][0] if name in UTILITY else FUEL[name][0]), "propsmesh"


@functools.lru_cache(maxsize=3)
def texture(family):
    return {"cars": cars.atlas, "propsmesh": propsmesh.atlas, "leisure": leisure.atlas}[family]()


def build(name):
    """(title, category, collision, source module, [(generator mesh, material)], atlas) of template name. Pure."""
    if name in CARS:
        shape, colour, title = CARS[name]
        return title, "vehicle", "mesh", "cars", [(cars._model(shape, colour), {"name": "cars"})], texture("cars")
    if name in LEISURE:
        title, collision, make = LEISURE[name]
        b = leisure.Builder()
        make(b)
        return title, "prop", collision, "leisure", [(b.mesh(), {"name": name, "alphaMode": "MASK", "alphaCutoff": .5})], texture("leisure")
    if name in UTILITY:
        title, height = UTILITY[name]
        solid, deco = propsmesh.pylons([name], [[0, 0, 0, 0, 0, 1, height, .5]])
    else:
        title, shape, z = FUEL[name]
        solid, deco = propsmesh.fuel([{"props": [{"shape": shape, "pos": [0, 0, z], "yaw": 0, "scale": [1, 1, 1]}]}])
    parts = [(m, {"name": name + ("_solid" if collision else "_deco"), "extras": {"map2lapCollision": collision}})
             for m, collision in ((solid, True), (deco, False)) if m is not None]
    return title, "prop", "mesh" if solid is not None else "none", "propsmesh", parts, texture("propsmesh")
