"""Read a closed lap from OSRM's GeoJSON route and per-leg node and distance annotations.

Driving an OSM edge again in either direction marks its intervals as twice driven. Immediately reversing an edge
refuses the lap, including at pin 1. Each leg has one annotated distance per pair of nodes, and a pin partway along
an edge can split a single traversal between two legs.
"""

from collections import Counter
from dataclasses import dataclass
from itertools import accumulate, pairwise


class NoLap(ValueError):
    """The route cannot form a lap, with a message for the user."""


@dataclass(frozen=True)
class Lap:
    coords: list[tuple[float, float]]
    length_m: float
    twice: list[tuple[float, float]]
    pins_m: list[float]


def _leg_edges(leg, start_m, end_m):
    """Directed edge fragments of an OSRM leg between its pin metres. Pure."""
    annotation = leg["annotation"]
    # A pin exactly on a node can contribute an untraversed phantom edge with distance zero.
    driven = [
        (edge, distance)
        for edge, distance in zip(pairwise(annotation["nodes"]), annotation["distance"], strict=True)
        if distance > 0
    ]
    if not driven:
        return []
    offsets = list(accumulate((distance for _, distance in driven), initial=0.0))
    # Keep travelled edges for topology even when OSRM's rounded leg total is zero.
    # Close their metre intervals exactly at the pin metres.
    scale = (end_m - start_m) / offsets[-1]
    metres = [start_m, *(start_m + offset * scale for offset in offsets[1:-1]), end_m]
    return [
        (edge, start, end)
        for (edge, _), (start, end) in zip(driven, pairwise(metres), strict=True)
    ]


def _twice_driven(legs, pin_count, same_snap):
    """Check the joins and merge spans for numbered legs, pin_count pins and exact seam snap. Pure."""
    _, last_leg = legs[-1]
    previous, _, _ = last_leg[-1]
    counts = Counter()
    fragments = []
    for leg_index, (pin, edges) in enumerate(legs):
        for i, (edge, start, end) in enumerate(edges):
            if edge != previous and edge == previous[::-1]:
                if i == 0:
                    at_pin = pin if leg_index else 1
                    raise NoLap(f"At pin {at_pin} the car would have to turn around: add a pin on the road the lap should take there")
                next_pin = pin + 1 if pin < pin_count else 1
                from_start = start - edges[0][1]
                to_end = edges[-1][2] - start
                near_pin = pin if from_start <= to_end else next_pin
                raise NoLap(f"Near pin {near_pin} the car would have to turn around: add a pin on the road the lap should take there")
            if i == 0:
                # A join is within one directed edge or at a node shared by both edges.
                if (not leg_index and not same_snap) or (previous != edge and previous[1] != edge[0]):
                    at_pin = pin if leg_index else 1
                    raise NoLap(f"At pin {at_pin} the lap does not join up: move pin {at_pin} along its road")
            key = frozenset(edge)
            # Count a pin-split traversal once, including a split at the seam. Keep both fragments on the metre line.
            if i > 0 or edge != previous:
                counts[key] += 1
            fragments.append((key, start, end))
            previous = edge

    spans = []
    for key, start, end in fragments:
        if counts[key] >= 2 and start < end:
            if spans and start <= spans[-1][1]:
                spans[-1] = (spans[-1][0], end)
            else:
                spans.append((start, end))
    return spans


def lap(answer: dict) -> Lap:
    """Read the lap through pins 1 … n, 1 in the OSRM JSON answer. Pure."""
    route = answer["routes"][0]
    legs = route["legs"]
    waypoints = answer["waypoints"]
    snapped_start = waypoints[0]["location"]

    length_m = float(route["distance"])
    metres = list(accumulate((leg["distance"] for leg in legs), initial=0.0))
    # Anchor all trailing pins with zero rounded travel to the same reported lap end.
    summed_length_m = metres[-1]
    metres = [length_m if metre == summed_length_m else metre for metre in metres]
    leg_edges = [_leg_edges(leg, start, end) for leg, (start, end) in zip(legs, pairwise(metres), strict=True)]
    if not leg_edges[-1] and waypoints[-2]["location"] == snapped_start:
        leg_edges.pop()
        metres.pop()

    traversals = [(pin, edges) for pin, edges in enumerate(leg_edges, 1) if edges]
    if not traversals:
        raise NoLap("The pins do not form a lap: move a pin")
    twice = _twice_driven(traversals, len(leg_edges), same_snap=waypoints[-1]["location"] == snapped_start)
    coords = [(lat, lon) for lon, lat in route["geometry"]["coordinates"]]
    lon, lat = snapped_start
    coords[0] = coords[-1] = (lat, lon)
    return Lap(coords, length_m, twice, metres[:-1])


def close(outward: dict, returning: dict) -> Lap:
    """Join the open OSRM answer and the answer for the last pin back to the first. Pure."""
    pins = outward["waypoints"]
    end, start = returning["waypoints"]
    if pins[-1]["location"] != end["location"]:
        raise NoLap(f"At pin {len(pins)} the lap does not join up: move pin {len(pins)} along its road")
    first, last = outward["routes"][0], returning["routes"][0]
    coords = first["geometry"]["coordinates"] + last["geometry"]["coordinates"][1:]
    return lap({"waypoints": [*pins, start], "routes": [{
        "legs": first["legs"] + last["legs"],
        "distance": first["distance"] + last["distance"],
        "geometry": {"coordinates": coords},
    }]})
