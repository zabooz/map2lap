"""A recorded centreline as a reference for the racing line editor and AC export."""
import re

import numpy as np

from track import fastlane


def records(xyz, stations, road, mapped, raw, source_stations):
    """Measure bank and clearance along the driven path, carrying its recorded driving inputs."""
    sides = fastlane._frame(xyz, True)[3]
    areas = fastlane.obj_to_kn5._junction_geometry(mapped)[0]
    junctions = fastlane._in_junctions(xyz[:, fastlane.XZ], areas)
    painted = fastlane._containing_paint(xyz[:, fastlane.XZ], sides[:, fastlane.XZ], mapped)
    measured = np.zeros((len(xyz), 3))
    for i, (point, side) in enumerate(zip(xyz, sides)):
        query = fastlane._query(road, i)
        limits = painted[i] if np.isfinite(painted[i]).all() else None
        try:
            measured[i] = fastlane._section(query, point, side, stations[i], limits=limits)
        except fastlane.NoLine:
            # A driven wheel can touch a kerb. Preserve its measured narrow side rather
            # than assuming the clearance required by the automatic racing-line solver.
            try:
                lo, hi, _ = fastlane._span(query, point, side, stations[i], limits)
                measured[i, :2] = max(0., hi), max(0., -lo)
            except fastlane.NoLine:
                pass  # No connected floor on this level gives no passing room.
    widths = fastlane._export_widths(measured[:, :2], np.inf, np.nan_to_num(painted, nan=np.inf), junctions, True)
    points, detail = fastlane._records(xyz, stations, road, True, checked_sections=measured, widths=widths)
    for field in ("speed", "gas", "brake", "lat_g", "tag"):
        detail[field] = np.interp(stations, source_stations, raw[field])
    return points, detail, measured


def driven_route(points, origin):
    """Horizontal route and sample mask of the driven lap. Pure."""
    xyz = points["pos"].astype(float)
    # A stationary car or duplicated lap seam gives no horizontal direction.
    keep = np.any(xyz[:,fastlane.XZ] != np.roll(xyz[:,fastlane.XZ], 1, axis=0), axis=1)
    if keep.sum() < 3:
        raise fastlane.NoLine("The recording has fewer than three distinct positions.")
    xyz = xyz[keep]
    return xyz, keep, fastlane.aicorrections.Route(xyz[:,fastlane.XZ], origin, True)


def reference(inputs, points, raw):
    """Make the driven positions the route and the reference for editing this lap."""
    _, markers, meshes, mapped, _, origin, _ = inputs
    xyz, keep, route = driven_route(points, origin)
    raw = raw[keep]
    stations = route.metres[:-1]
    road = fastlane._local_roads(meshes)
    band, paint = fastlane._leg_bands(route.path, route.metres, (stations, xyz[:,1]), road, mapped)
    hard = np.zeros(len(xyz), bool)
    splits = []
    lap = np.vstack((xyz, xyz[0]))
    for key in markers:
        if re.fullmatch(r"AC_TIME_\d+_L", key) and key[:-1]+"R" in markers:
            name = key[:-2]
            crossing, _ = fastlane._gate_crossings(lap[:,fastlane.XZ], markers, name)
            if len(crossing):
                splits.append((name, markers, stations[crossing[0]]))
                if name == "AC_TIME_0":
                    hard[crossing] = hard[(crossing+1) % len(xyz)] = True
    ribbon = fastlane.airacing.RouteRibbon(hard, *band, stations, [], hard, tuple(splits),
                                     painted=paint)
    points, detail, measured = records(xyz, stations, road, mapped, raw, stations)
    return (points, detail, ribbon, fastlane._distances(xyz[:,fastlane.XZ]), road, route), measured


def corrected(model, inputs, base, corrections):
    """Apply Redraw and Move to the recorded reference, preserving every untouched driving sample."""
    ref = base
    skipped = {}
    draws = []
    for item in corrections:
        if item["kind"] != "redraw":
            continue
        try:
            candidate = fastlane._drawn_reference(model, (*inputs[:-1], [*draws, item]), True, None, driven=base)
        except ValueError as error:
            skipped[item["id"]] = str(error)
        else:
            ref = candidate
            draws.append(item)
    moves = [item for item in corrections if item["kind"] == "move"]
    wider = fastlane._local_roads(inputs[2], free=True) if moves else None
    def finish(xyz, mask, road):
        if not mask.any():
            return ref[:2]
        fastlane.aicorrections.check_centreline(xyz, ref[2].metres, mask, True, fastlane.obj_to_kn5.LEVEL_GAP_M)
        return records(xyz, ref[2].metres, road, inputs[3], base[1], base[2].metres)[:2]
    result, rejected = fastlane.checked_moves(ref, moves, finish, wider)
    return *result, skipped | rejected, ref[2].metres
