"""The ground under roads: each road's height profile (a plan), and the graded ground from all plans around a point.

Heights in a plan are absolute (raw elevation), ENU x, y in the planning frame. Deterministic: a pure function of the
map data, the elevation and these rules.

    settings  the rules' numbers and switches
    profiles  Plan and one road's profile: smoothing, cuts, the ground under a bridge's end
    banks     a road's cross slope in curves
    snap      where roads meet: ranks, junction heights, carriageways side by side
    planner   _Planner: all plans of a region, their bridges, tunnels and junctions
    grader    PlanStore, Grader, PlanPack: plans shared and asked for heights
    points    grade_points: the heights at points from the plans in reach (earthfast)
    bridges   a bridge's ends and approaches, ramps, what a road under it needs
"""
import sys
import types

from . import settings, planner, profiles, banks, snap, grader, points, bridges

from .settings import (
    APPROACH_CAP_GRADE, APPROACH_GAP_M, APPROACH_GRADE, APPROACH_MARGIN_M, APPROACH_ON, CHAIN_ON, COARSE_EASE_ON,
    COARSE_MAX_SLOPE, COARSE_MAX_STEP_M, COARSE_REACH_M, COARSE_SIGMA_M, LONG_PART_M, MEDIAN_M, MOUTH_PLAN_M,
    PROFILE_STEP, PROFILE_ZOOM, ROAD_LIFT, SEP_ON, SHARP_ON, SHOULDER_M, SIGMA_M, SIGMA_MAJOR_M, SLOPE_RUN,
    TUNNEL_KEEP_IN_M, TUNNEL_TAG, T_MAX, T_MIN, UNDER_ANY_ON, UNDER_CLEAR_M, UNDER_FLAT_M, UNDER_GRADE,
    UNDER_MAX_DROP_M, UNDER_MAX_GRADE, UNGRADED, WALL_CUT_M, WALL_FLAT_M, WALL_T_M
)
from .planner import _Planner
from .profiles import (
    Plan, UNDER_DECK_FALL, UNDER_DECK_M, UNDER_DECK_MIN_M, WALL_MAX_H_CITY_M, WALL_MAX_H_M, _add_cuts, _plan,
    _under_deck, bend_zone, clip_polyline, median_profile, plan_roads, profile_sigma, resample, smooth_profile,
    tunnel_plan, wall_max_h
)
from .banks import BANK_DESIGN, BANK_E_MAX, BANK_ON, bank
from .snap import _nearest_on, _twin_trimmed, _with_lows, shoulder, snap_junctions
from .grader import Grader, PlanPack, PlanStore, road_id, trim_plan
from .points import grade_points
from .bridges import (
    GradedDem, _never_raised, approach_add, bridge_lifts, end_bank, fill_abutment, junction_ends, raisable_ends,
    regrade_past_ends, road_end, road_end_reader, underpass_offsets
)


class _Package(types.ModuleType):
    """Setting grading.NAME reaches every part holding NAME: a part reads its own copy of what it imported, so a switch set
    only here would change nothing and a test of it would pass without testing."""

    def __setattr__(self, name, value):
        for part in (settings, planner, profiles, banks, snap, grader, points, bridges,):
            if hasattr(part, name):
                setattr(part, name, value)
        super().__setattr__(name, value)


sys.modules[__name__].__class__ = _Package
