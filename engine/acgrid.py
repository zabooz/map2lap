"""AC's terrain spacing, shared by collision ground, water and draped markings.

The developer-only BNE_AC_GRID_M=1 experiment samples the graded surface every metre: it can retain a narrow crest
between the legacy 2 m samples. It does not change heightmap's BeamNG block dimensions or the source elevation.
The ordinary build stays at 2 m. Other spacings need their own seam, portal and export checks before use.
"""
import os


def spacing(value):
    """The supported AC terrain spacing in metres from a switch's text. Pure."""
    try:
        cell = float(value)
    except (ValueError, TypeError):
        cell = 0.0
    if cell not in (1.0, 2.0):
        raise ValueError("BNE_AC_GRID_M must be 1 or 2 metres")
    return cell


CELL = spacing(os.environ.get("BNE_AC_GRID_M", "2"))
