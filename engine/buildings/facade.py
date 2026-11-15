"""Facade patterns shared by window geometry and entrance placement."""
from dataclasses import dataclass
import math

import fast

from .looks import TILE_PX_M


HOUSE_BAY_M = 3.4           # Existing detached-house window spacing; regional patterns may override it.
DOOR_GAP_M = 0.75          # Half-clearance for a 1 m entrance and its frame; wider doors need a larger pattern value.


@dataclass(frozen=True)
class FacadePattern:
    """Facade spacing and inferred entrance preference; mapped entrances must retain their own position."""
    bay_m: float | None = None
    entrance: str = "auto"
    door_clearance_m: float = DOOR_GAP_M
    attic_windows: bool = False
    window_width_m: float | None = None
    window_height_m: float | None = None
    window_sill_m: float | None = None

    def __post_init__(self):
        if self.bay_m is not None and (not math.isfinite(self.bay_m) or self.bay_m <= 0):
            raise ValueError("Facade bay width must be positive and finite")
        if self.entrance not in ("auto", "centre", "left", "right"):
            raise ValueError("Unknown facade entrance preference")
        if not math.isfinite(self.door_clearance_m) or self.door_clearance_m <= 0:
            raise ValueError("Facade entrance clearance must be positive and finite")
        for value in (self.window_width_m, self.window_height_m, self.window_sill_m):
            if value is not None and (not math.isfinite(value) or value <= 0):
                raise ValueError('Window dimensions must be positive and finite')


DEFAULT_PATTERN = FacadePattern()


def pattern_for(spec):
    """The building's explicit pattern, otherwise the common facade defaults. Pure."""
    return spec.facade_pattern or DEFAULT_PATTERN


def bay_width(spec):
    """Nominal metres per window axis for the building's pattern and facade material. Pure."""
    return pattern_for(spec).bay_m or (HOUSE_BAY_M if spec.wall else TILE_PX_M / (spec.band or (0, 1))[1])


def require_layout():
    """Check that the native module supports facade patterns before passing pattern dimensions."""
    fast.require(120, "facade_layout")
    if getattr(fast._ef, "BUILDING_FACADE_LAYOUT", 0) < 2:
        raise fast.NativeMissing("earthfast lacks BUILDING_FACADE_LAYOUT; rebuild both native modules")


def entrance_position(spec, width, preference):
    """Snap an inferred entrance preference to the same axes the Rust wall emitter uses. Pure."""
    pattern = pattern_for(spec)
    fraction = {"centre": .5, "left": 0., "right": 1.}.get(pattern.entrance, preference)
    require_layout()
    _, door = fast._ef.facade_layout(float(width), bay_width(spec), bool(spec.wall),
                                   float(width * fraction), pattern.door_clearance_m)
    return door
