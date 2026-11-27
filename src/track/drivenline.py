"""A recorded centreline as a reference for the racing line editor and AC export."""
import re

import numpy as np

from track import fastlane


def records(xyz, stations, road, mapped, raw, source_stations, circuit):
    """Measure bank and clearance along the driven path, carrying its recorded driving inputs."""
    sides = fastlane._frame(xyz, circuit)[3]
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
    widths = fastlane._export_widths(measured[:, :2], np.inf, np.nan_to_num(painted, nan=np.inf), junctions, circuit)
    points, detail = fastlane._records(xyz, stations, road, circuit, checked_sections=measured, widths=widths)
    for field in ("speed", "gas", "brake", "lat_g", "tag"):
        detail[field] = np.interp(stations, source_stations, raw[field])
    return points, detail, measured


def driven_route(points, origin, circuit=True):
    """Horizontal route and sample mask of the driven lap. Pure."""
    xyz = points["pos"].astype(float)
    # A stationary car or duplicated lap seam gives no horizontal direction.
    keep = np.any(xyz[:,fastlane.XZ] != np.roll(xyz[:,fastlane.XZ], 1, axis=0), axis=1)
    if not circuit:
        keep[0] = True
    if keep.sum() < 3:
        raise fastlane.NoLine("The recording has fewer than three distinct positions.")
    xyz = xyz[keep]
    return xyz, keep, fastlane.aicorrections.Route(xyz[:,fastlane.XZ], origin, circuit)


def reference(inputs, points, raw, circuit=True):
    """Make the driven positions the route and the reference for editing this lap."""
    _, markers, meshes, mapped, _, origin, _ = inputs
    xyz, keep, route = driven_route(points, origin, circuit)
    raw = raw[keep]
    stations = route.metres[:-1] if circuit else route.metres
    road = fastlane._local_roads(meshes)
    band, paint = fastlane._leg_bands(route.path, route.metres, (stations, xyz[:,1]), road, mapped)
    hard = np.zeros(len(xyz), bool)
    splits = []
    finish = None
    lap = np.vstack((xyz, xyz[0])) if circuit else xyz
    if not circuit:
        start, end = stage_gates(xyz, markers)
        indices = np.arange(len(xyz))
        prefix = "AC" if all(key in markers for key in fastlane.route_race.GATES) else "M2"
        finish = np.interp(end, indices, stations)
        splits.extend(((prefix+"_AB_START", markers, np.interp(start, indices, stations)),
                       (prefix+"_AB_FINISH", markers, finish)))
        hard = (indices <= np.ceil(start)) | (indices >= np.floor(end))
        # The last open sample belongs to the final road segment.
        band, paint = (tuple(np.concatenate((v, v[-1:])) for v in bounds) for bounds in (band, paint))
    for key in markers:
        if re.fullmatch(r"AC_TIME_\d+_L", key) and key[:-1]+"R" in markers:
            name = key[:-2]
            crossing, _ = fastlane._gate_crossings(lap[:,fastlane.XZ], markers, name)
            if len(crossing):
                splits.append((name, markers, stations[crossing[0]]))
                if name == "AC_TIME_0":
                    hard[crossing] = hard[(crossing+1) % len(xyz)] = True
    ribbon = fastlane.airacing.RouteRibbon(hard, *band, stations, [], hard, tuple(splits),
                                          finish=finish, painted=paint)
    points, detail, measured = records(xyz, stations, road, mapped, raw, stations, circuit)
    return (points, detail, ribbon, fastlane._distances(xyz[:,fastlane.XZ]), road, route), measured


def corrected(model, inputs, base, corrections):
    """Apply Redraw and Move to the recorded reference, preserving every untouched driving sample."""
    circuit = base[5].circuit
    ref = base
    skipped = {}
    draws = []
    for item in corrections:
        if item["kind"] != "redraw":
            continue
        try:
            candidate = fastlane._drawn_reference(model, (*inputs[:-1], [*draws, item]), circuit, None, driven=base)
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
        fastlane.aicorrections.check_centreline(xyz, ref[2].metres, mask, circuit, fastlane.obj_to_kn5.LEVEL_GAP_M)
        return records(xyz, ref[2].metres, road, inputs[3], base[1], base[2].metres, circuit)[:2]
    result, rejected = fastlane.checked_moves(ref, moves, finish, wider)
    return *result, skipped | rejected, ref[2].metres


def stage_gates(xyz, markers):
    """Fractional sample indices crossing A then B forwards on the timing gates' level. Pure."""
    prefix = "AC" if all(key in markers for key in fastlane.route_race.GATES) else "M2"
    hits = []
    for gate in ("START", "FINISH"):
        name = f"{prefix}_AB_{gate}"
        if name+"_L" not in markers or name+"_R" not in markers:
            raise fastlane.NoLine("The Route needs both timing gates.")
        indices, t = fastlane._gate_crossings(xyz[:, fastlane.XZ], markers, name)
        left, right = (np.array(markers[name+"_"+side])[12:15] for side in "LR")
        side = (right-left)[fastlane.XZ]
        for i in indices:
            p = xyz[i] + t[i]*(xyz[i+1]-xyz[i])
            across = ((p-left)[fastlane.XZ] @ side)/(side @ side)
            y = left[1] + across*(right[1]-left[1]) - fastlane.obj_to_kn5.START_LIFT
            if abs(p[1]-y) < fastlane.obj_to_kn5.LEVEL_GAP_M and (not hits or i+t[i] > hits[0]):
                hits.append(float(i+t[i]))
                break
        else:
            raise fastlane.NoLine(f"The drive did not cross {gate} in order on the timing gate's level.")
    return tuple(hits)


def stage_candidate(model, trace, destination):
    """Build a v7 Route candidate from one CSP drive and the installed grid and runout."""
    samples = np.loadtxt(trace, ndmin=2)
    if samples.shape[1] != 7 or len(samples) < 3 or not np.isfinite(samples).all():
        raise fastlane.NoLine("The A–B recording contains invalid driving samples.")
    inputs = fastlane.lane_inputs(model, False, lambda _: None, preview=True)
    route, markers, meshes = inputs[:3]
    a, b = stage_gates(samples[:, :3], markers)
    index = np.arange(len(samples))
    clipped = np.r_[a, index[(a < index) & (index < b)], b]
    timed = np.column_stack([np.interp(clipped, index, values) for values in samples.T])
    road = fastlane._local_roads(meshes)
    path, metres, rear, start, finish, height = fastlane._route_path(route, markers, fastlane._grid(markers))
    first = max(metres[0], rear-fastlane.GRID_RUN_IN)
    approach = np.unique(np.r_[np.linspace(first, start, int(np.ceil((start-first)/fastlane.SPACING))+1),
                               metres[(metres > first) & (metres < start)], rear])
    runout = fastlane._runout_stations(path, metres, finish, markers, road)

    def join(stations, gate, car, span, height):
        centre = fastlane._at(path, metres, stations)
        offset = car[fastlane.XZ] - fastlane._at(path, metres, gate)
        # Keep the rear grid and the end of the checked runout fixed. Ease the
        # lateral difference to the driver's gate crossing on the adjoining road.
        weight = np.clip(1 - abs(stations-gate)/max(span, fastlane.GRID_XZ_TOL), 0, 1)
        xz = centre + (weight*weight*(3-2*weight))[:,None]*offset
        return fastlane._surface(stations, xz, road, height, False)

    lead = join(approach[approach >= rear], start, timed[0,:3], min(start-rear, fastlane.CURVE_HALF_WINDOW), height)
    tail = join(runout, finish, timed[-1,:3], min(runout[-1]-finish, fastlane.CURVE_HALF_WINDOW), timed[-1,1])
    # Only extend behind the last grid slot if the road supports that optional run-in.
    before = approach[approach <= rear]
    try:
        run_in = fastlane._surface(before, fastlane._at(path, metres, before), road, height, False)
    except fastlane.NoLine:
        pass
    else:
        if all(fastlane._fits_chord(road, p, q, fastlane.CAR_HALF_WIDTH) for p, q in zip(run_in, run_in[1:])):
            lead = np.vstack((run_in[:-1], lead))
    for extension in (lead, tail):
        if not all(fastlane._fits_chord(road, p, q, fastlane.CAR_HALF_WIDTH)
                   for p, q in zip(extension, extension[1:])):
            raise fastlane.NoLine("The recorded crossing cannot be joined to the grid or runout on this road.")
    xyz = np.vstack((lead[:-1], timed[:,:3], tail[1:]))
    stations = fastlane._distances(xyz)
    points = np.zeros(len(xyz), fastlane.POINT)
    points["pos"], points["length"], points["id"] = xyz, stations, np.arange(len(xyz))
    detail = np.zeros(len(xyz), fastlane.DETAIL)
    for field, values in zip(("speed", "gas", "brake", "lat_g"), timed[:,3:].T):
        detail[field] = np.pad(values, (len(lead)-1,len(tail)-1), mode="edge")
    stage_gates(points["pos"].astype(float), markers)
    fastlane._write_lane(destination, points, detail)
