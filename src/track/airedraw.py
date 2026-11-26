"""Author-drawn AI segments in the directed frame of their saved route anchors."""
from dataclasses import dataclass

import numpy as np


def unit(vector):
    length = np.linalg.norm(vector)
    if length < 1e-8:
        raise ValueError("Coincident AI line points")
    return vector/length


def curve(points, entry, exit, spacing):
    """Sample a chord-length cubic through every clicked point, clamped to its joining headings. Pure."""
    xyz = np.asarray(points, dtype=float)
    step = np.diff(xyz[:, [0, 2]], axis=0)
    lengths = np.linalg.norm(step, axis=1)
    if np.any(lengths < .01):
        raise ValueError("Coincident AI line points")
    tangents = [unit(entry)]
    for a, b in zip(step, step[1:]):
        incoming, outgoing = unit(a), unit(b)
        # Limit the derivative on tight reversals. A cusp cannot be used as a tangent.
        tangents.append((incoming+outgoing)/2)
    tangents.append(unit(exit))
    result = [xyz[:1]]
    for i, length in enumerate(lengths):
        t = np.linspace(0, 1, int(np.ceil(length/spacing))+1)[1:, None]
        t2, t3 = t*t, t*t*t
        part = xyz[i] + t*(xyz[i+1]-xyz[i])
        a, b = xyz[i, [0, 2]], xyz[i+1, [0, 2]]
        part[:, [0, 2]] = ((2*t3-3*t2+1)*a + (-2*t3+3*t2)*b
                           + length*((t3-2*t2+t)*tangents[i] + (t3-t2)*tangents[i+1]))
        result.append(part)
    return np.concatenate(result)


@dataclass
class Section:
    """One resolved, forward interval and its sampled replacement on this revision."""
    item: dict
    start: float
    end: float
    entry: np.ndarray
    exit: np.ndarray
    xyz: np.ndarray
    metres: np.ndarray

    def positions(self, stations):
        return np.column_stack([np.interp(stations, self.metres, axis) for axis in self.xyz.T])


def local_points(points, source, target):
    """Transform user clicks between AC world frames, preserving their level hint. Pure."""
    if source == target:
        return np.asarray(points, dtype=float)
    from geodesy import EnuFrame
    old, new = EnuFrame(*source), EnuFrame(*target)
    result = []
    for x, y, z in points:
        e, n, u = new.ecef_to_enu(*old.enu_to_ecef(x, -z, y))
        result.append([e, u, -n])
    return np.asarray(result)


def control_points(item, route):
    """Resolve clicks and both endpoints against the current route. Pure."""
    start, start_y = route.resolve(item["anchor"])
    end, end_y = route.resolve(item["end"])
    src = item["anchor"]["origin"]
    clicks = local_points(item["points"], src, route.origin)
    def endpoint(anchor, station, y):
        context = route.context(station)
        x, z = context[1]
        heading = unit(context[-1]-context[0])
        side = heading[::-1]*[1,-1]
        x, z = np.array([x,z])+anchor.get("lateral", 0)*side + anchor.get("along", 0)*heading
        # Tangents are stored relative to the directed road, so a rebuilt entrance turns with it.
        angle = anchor.get("angle", 0)
        tangent = heading*np.cos(angle) + side*np.sin(angle)
        return [x,y,z], tangent
    a, forward = endpoint(item["anchor"], start, start_y)
    b, onward = endpoint(item["end"], end, end_y)
    if "tail" in item:
        b = local_points([item["tail"]], src, route.origin)[0]
        end += np.dot(b[[0,2]]-route.context(end)[1], onward)
    start += item["anchor"].get("after", 0)
    if "tail" not in item:
        end += item["end"].get("after", 0)
    return start, end, forward, onward, [a, *clicks, b]


def resolve(item, route, spacing, controls=None):
    """Sample the resolved control points at the requested spacing. Pure."""
    start, end, forward, onward, points = controls or control_points(item, route)
    if end <= start:
        raise ValueError(f"End precedes the start at route metre {end:.1f}")
    try:
        xyz = curve(points, forward, onward, spacing)
    except ValueError as error:
        raise ValueError(f"{error} at route metre {start:.1f}") from error
    length = np.r_[0, np.cumsum(np.linalg.norm(np.diff(xyz[:, [0,2]],axis=0),axis=1))]
    return Section(item, start, end, forward, onward, xyz, start+(end-start)*length/length[-1])

def join_approaches(xz, stations, fixed, sections, reach, tolerance):
    """Blend each outside approach into its clicked endpoint and tangent. Pure."""
    joined = xz.copy()
    changed = np.zeros(len(xz), bool)
    for i, part in enumerate(sections):
        for entering in (True, False):
            metre = part.start if entering else part.end
            end = 0 if entering else -1
            sign = -1 if entering else 1
            distance = sign * (stations - metre)
            candidates = np.flatnonzero(distance > 0)
            if not len(candidates):
                continue
            # Adjacent authors share the intervening approach. A fixed sample
            # shortens the blend to keep a nearby grid slot or gate exact.
            limit = min(reach, distance[(distance > 0) & fixed].min(initial=reach))
            if entering and i:
                limit = min(limit, (metre - sections[i-1].end)/2)
            if not entering and i+1 < len(sections):
                limit = min(limit, (sections[i+1].start - metre)/2)
            selected = candidates[distance[candidates] < limit]
            if not len(selected):
                continue
            origin = part.xyz[end, [0,2]]
            outward = -part.entry if entering else part.exit
            origin_ref = np.array([np.interp(metre, stations, axis) for axis in xz.T])
            j = candidates[np.argmin(distance[candidates])]
            beyond = j + sign
            if not 0 <= beyond < len(xz):
                continue
            derivative = (xz[beyond]-xz[j])/abs(stations[beyond]-stations[j])
            correction = origin - origin_ref
            slope = outward * np.linalg.norm(derivative) - derivative
            if np.linalg.norm(correction) + np.linalg.norm(slope)*distance[j] <= tolerance:
                continue
            t = distance[selected,None]/limit
            joined[selected] += (1+2*t)*(1-t)**2 * correction + limit*t*(1-t)**2 * slope
            changed[selected] = True
    return joined, changed
