"""Validated per-track generation choices; worker environments do not change the generator page's process."""
import math
import os

DEFAULTS = {"terrain_cell_m": 2, "parked_cars": True, "tree_spacing_m": 0.0}


def terrain_cell(value=2):
    """The supported terrain spacing from a build input; old inputs use 2 m. Pure."""
    if type(value) not in (int, float) or value not in (1, 2):
        raise ValueError("Terrain grid must be 1 or 2 m")
    return int(value)


def checked(values):
    """The three build choices from saved settings or an API request, with legacy defaults. Pure."""
    grid = terrain_cell(values.get("terrain_cell_m", 2))
    cars = values.get("parked_cars", True)
    spacing = values.get("tree_spacing_m", 0.0)
    if type(cars) is not bool:
        raise ValueError("Parked cars must be on or off")
    if type(spacing) not in (int, float) or not math.isfinite(spacing) or not 0 <= spacing <= 100:
        raise ValueError("Tree spacing must be 0–100 m")
    return {"terrain_cell_m": grid, "parked_cars": cars, "tree_spacing_m": float(spacing)}


def environment(values):
    """The worker's environment entries for validated build choices. Pure."""
    options = checked(values)
    return {"BNE_AC_GRID_M": str(options["terrain_cell_m"]), "BNE_PARKED_CARS": "1" if options["parked_cars"] else "0",
            "BNE_TREE_SPACING_M": str(options["tree_spacing_m"])}


def from_environment():
    """Build choices inherited by this build and its workers."""
    cars = os.environ.get("BNE_PARKED_CARS", "1")
    if cars not in ("0", "1"):
        raise ValueError("BNE_PARKED_CARS must be 0 or 1")
    return checked({"terrain_cell_m": float(os.environ.get("BNE_AC_GRID_M", "2")), "parked_cars": cars == "1",
                    "tree_spacing_m": float(os.environ.get("BNE_TREE_SPACING_M", "0"))})
