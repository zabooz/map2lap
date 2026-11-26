"""Persistent route anchors and lateral moves on a sampled AI racing line."""
import hashlib
import json
from pathlib import Path

import numpy as np

# Compare the approach and departure one car length from the anchor. Longer
# probes would confuse adjacent bends. Shorter ones cannot distinguish branches.
CONTEXT = 5.0


def recipe(folder):
    """Read corrections from the saved Editor recipe, including a corrections-only rebuilt copy."""
    try:
        data = json.loads((Path(folder) / "data/map2lap.json").read_text(encoding="utf-8"))
    except FileNotFoundError:
        return []
    return (data.get("edits") or {}).get("aiCorrections", [])


def anchor_problem(anchor: dict) -> str | None:
    """Check the shape and finite coordinates of one stored route anchor. Pure."""
    try:
        if (np.shape(anchor["context"]) != (3, 2) or np.shape(anchor["origin"]) != (2,)
                or not np.isfinite([anchor["metre"], anchor["level"], anchor.get("lateral", 0), anchor.get("angle", 0),
                                    anchor.get("along", 0), anchor.get("after", 0)]).all()
                or not np.isfinite(anchor["context"]).all() or not np.isfinite(anchor["origin"]).all()):
            return "Invalid AI correction anchor"
    except (TypeError, KeyError, ValueError):
        return "Invalid AI line move"
    return None


def problem(items):
    """Return a draft schema error, leaving route-dependent validation to calculation. Pure."""
    if not isinstance(items, list):
        return "Invalid AI corrections list"
    ids = set()
    for item in items:
        try:
            anchor = item["anchor"]
            if (type(item["free"]) is not bool or not isinstance(item["id"], str)
                    or not item["id"] or item["id"] in ids):
                return "Invalid AI correction"
            anchors = [anchor]
            if item["kind"] == "move":
                if not np.isfinite([item["range"], item.get("routeOffset", item.get("offset")), item.get("routeAlong", 0)]).all() or item["range"] <= 0:
                    return "Invalid AI line move"
            elif item["kind"] == "redraw":
                anchors.append(item["end"])
                clicks = item["points"]
                if (not isinstance(clicks, list) or any(np.shape(p) != (3,) for p in clicks)
                        or not np.isfinite(clicks).all()):
                    return "Invalid AI line redraw"
                if "tail" in item and (not item["free"] or np.shape(item["tail"]) != (3,) or not np.isfinite(item["tail"]).all()):
                    return "Invalid AI runout endpoint"
            else:
                return "Unknown AI correction"
            for target in anchors:
                if error := anchor_problem(target):
                    return error
            ids.add(item["id"])
        except (TypeError, KeyError, ValueError):
            return "Invalid AI line move"
    return None


def _cross(a, b):
    """Signed X/Z area of pairs of horizontal vectors. Pure."""
    return a[..., 0]*b[..., 1] - a[..., 1]*b[..., 0]


def check_centreline(xyz, metres, changed, circuit, level_gap):
    """Reject a same-level crossing involving a corrected centre-line segment. Pure."""
    xz = xyz[:, [0, 2]].astype(float, copy=False)
    starts = np.arange(len(xyz) if circuit else len(xyz)-1)
    ends = (starts+1) % len(xyz)
    affected = starts[changed[starts] | changed[ends]]
    steps = xz[ends] - xz[starts]
    low, high = np.minimum(xz[starts], xz[ends]), np.maximum(xz[starts], xz[ends])
    for i in affected:
        near = ((low <= high[i]) & (high >= low[i])).all(axis=1)
        near &= (starts != i) & (ends != i) & (starts != ends[i])
        other = starts[near]
        if not len(other):
            continue
        denom = _cross(steps[i], steps[other])
        other, denom = other[denom != 0], denom[denom != 0]
        delta = xz[other] - xz[i]
        u, v = _cross(delta, steps[other])/denom, _cross(delta, steps[i])/denom
        y = xyz[:, 1]
        gap = y[i]+u*(y[ends[i]]-y[i]) - (y[other]+v*(y[ends[other]]-y[other]))
        if ((u >= 0) & (u <= 1) & (v >= 0) & (v <= 1) & (abs(gap) < level_gap)).any():
            raise ValueError(f"AI line crosses itself at route metre {metres[i]:.1f}")


class Route:
    """Directed horizontal metres in the saved route's coordinate frame."""
    def __init__(self, path, origin, circuit):
        self.path = np.asarray(path)
        if circuit and np.any(path[0] != path[-1]):
            self.path = np.vstack((path, path[0]))
        self.path = self.path[np.r_[True, np.any(np.diff(self.path, axis=0), axis=1)]]
        self.metres = np.r_[0, np.cumsum(np.linalg.norm(np.diff(self.path, axis=0), axis=1))]
        self.length = self.metres[-1]
        self.circuit = circuit
        self.origin = list(origin)
        self.key = hashlib.sha256(self.path.astype("<f8").tobytes()).hexdigest()

    def context(self, metre):
        stations = metre + np.array([-CONTEXT, 0, CONTEXT])
        if self.circuit:
            stations %= self.length
        return np.column_stack([np.interp(stations, self.metres, axis) for axis in self.path.T])

    def resolve(self, anchor):
        """Recover a unique directed passage, preserving the level hint across build origins."""
        metre, level = anchor["metre"], anchor["level"]
        points = np.asarray(anchor["context"], dtype=float)
        if anchor["origin"] != self.origin:
            from geodesy import EnuFrame
            source, target = EnuFrame(*anchor["origin"]), EnuFrame(*self.origin)
            local = [target.ecef_to_enu(*source.enu_to_ecef(x, -z, level)) for x, z in points]
            points = np.array([(e, -n) for e, n, _ in local])
            level = local[1][2]
        elif anchor.get("route") == self.key:
            return metre, level
        a = self.path[:-1]
        step = np.diff(self.path, axis=0)
        fraction = np.clip(np.sum((points[1]-a)*step, axis=1)/np.sum(step*step, axis=1), 0, 1)
        gaps = np.linalg.norm(a + step*fraction[:, None] - points[1], axis=1)
        # A rebuilt route may shift within one car half-width. Beyond it the
        # association needs another editor decision, especially on parallel roads.
        candidates = self.metres[:-1] + fraction*np.diff(self.metres)
        # Adjacent segments can both match at a vertex. Group contiguous
        # matching legs before testing whether this was a repeated passage.
        legs = [i for i in np.flatnonzero(gaps <= 1)
                if np.linalg.norm(self.context(candidates[i])-points, axis=1).max() <= 1]
        runs = np.split(legs, np.flatnonzero(np.diff(legs) > 1)+1) if legs else []
        if self.circuit and len(runs) > 1 and legs[0] == 0 and legs[-1] == len(step)-1:
            runs = [np.r_[runs[-1], runs[0]], *runs[1:-1]]
        if len(runs) != 1:
            raise ValueError(f"Unresolved route anchor at route metre {metre:.1f}")
        index = min(runs[0], key=lambda i: gaps[i])
        return candidates[index], level

    def moves(self, items, ribbon, xyz, sides, level_gap):
        """Moved XYZ and protected samples, using the displayed racing line as reference. Pure."""
        if error := problem(items):
            raise ValueError(error)
        result = xyz.copy()
        protected = np.zeros(len(xyz), bool)
        intervals = []
        for item in items:
            centre, level = self.resolve(item["anchor"])
            if "routeOffset" not in item:
                raise ValueError(f"Legacy move needs to be redrawn at route metre {centre:.1f}")
            extent = item["range"]
            def distance(s):
                d = abs(s-centre)
                if self.circuit:
                    d = d % self.length
                    d = np.minimum(d, self.length-d)
                return d
            if any(distance(s) < extent + radius for s, radius in intervals):
                raise ValueError(f"Overlapping correction at route metre {centre:.1f}")
            intervals.append((centre, extent))
            d = distance(ribbon.metres)
            affected = d < extent
            if not affected.any() or abs(xyz[d.argmin(), 1]-level) >= level_gap:
                raise ValueError(f"Unresolved driving level at route metre {centre:.1f}")
            if np.any(ribbon.hard & affected):
                raise ValueError(f"Fixed AI line point at route metre {ribbon.metres[ribbon.hard & affected][0]:.1f}")
            weight = (1 + np.cos(np.pi*d[affected]/extent))/2
            context = self.context(centre)
            tangent = context[2] - context[0]
            if np.linalg.norm(tangent) == 0:
                raise ValueError(f"Undefined route direction at route metre {centre:.1f}")
            tangent /= np.linalg.norm(tangent)
            target = context[1] + tangent[::-1]*[1,-1]*item["routeOffset"] + tangent*item.get("routeAlong", 0)
            # A rebuild can sample the peak between two different vertices. Normalise
            # the taper there so the interpolated anchor lands at the stored position.
            s = ribbon.metres
            at = centre
            if self.circuit:
                at = s[0] + (centre-s[0]) % self.length
                s = np.r_[s, s[0]+self.length]
            def interpolate(values):
                samples = np.r_[values, values[0]] if self.circuit else values
                return np.interp(at, s, samples)
            base = np.array([interpolate(xyz[:, axis]) for axis in (0,2)])
            weights = np.zeros(len(xyz))
            weights[affected] = weight
            result[np.ix_(affected, [0,2])] += (target-base) * (weight/interpolate(weights))[:, None]
            protected |= affected
        return result, protected
