"""Reversible thinning of editor trees; a separate layer never owns manual deletions."""
import hashlib
import math

import numpy as np

from app import placement, tracktrees

MAX_DISTANCE = 100.0  # metres, matching the planting brush's existing spacing range


def problem(value):
    """Whether the persisted spacing setting is malformed; None for the old/default state. Pure."""
    if value is None:
        return None
    if not isinstance(value, dict) or set(value) != {'distance', 'targets', 'hidden'}:
        return 'Invalid tree spacing'
    distance = value['distance']
    if type(distance) not in (int, float) or not math.isfinite(distance) or not 0 <= distance <= MAX_DISTANCE:
        return 'Tree spacing must be 0–100 metres'
    for name in ('targets', 'hidden'):
        ids = value[name]
        if name == 'targets' and ids is None:
            continue
        if not isinstance(ids, list) or len(ids) > 500_000 or not all(isinstance(i, str) for i in ids) or len(set(ids)) != len(ids):
            return 'Invalid tree spacing selection'
    if distance == 0 and value['hidden']:
        return 'Zero spacing must restore the trees'
    if value['targets'] is not None and not set(value['hidden']) <= set(value['targets']):
        return 'Tree spacing cannot hide trees outside its selection'
    return None


def hidden(edits):
    """Tree ids hidden by spacing alone, independently of manually deleted ids. Pure."""
    return (edits.get('tree_spacing') or {}).get('hidden', [])


def effective(edits):
    """An export-only view with spacing ids added to deleted; the persisted recipe stays separate. Pure."""
    deleted = {d['id']: d for d in edits['deleted']}
    for id_ in hidden(edits):
        deleted.setdefault(id_, {'id': id_, 'position': [0, 0, 0]})
    return {**edits, 'deleted': list(deleted.values())}


def candidates(section, objects, edits):
    """Tree feet at current placements, including copied/imported listed trees; bushes are excluded. Pure."""
    trees = tracktrees.now(tracktrees.trees_of(section, edits.get('trees', [])), edits.get('placed', []), [])
    out = {id_: tree['pos'] for id_, tree in trees.items() if tracktrees.kind(tree['model']) == 'tree'}
    for tile, obj in placement.list_placed(objects, edits.get('placed', [])).items():
        for i, kind in enumerate(obj['kinds']):
            if kind == 'tree' and obj['parents'][i] < 0:
                out[f'{tile}#{i}'] = obj['at'][i]
    # A model replacing a generated tree is the candidate in that position, not both of them.
    for model in edits.get('models', []):
        out.pop(model.get('replaces'), None)
    return out


def thin(points, distance):
    """Deterministic nested thinning of {id: xyz} in ground metres. Pure.

    A tree disappears if ANY higher-priority tree is closer, even when that neighbour
    is itself hidden. Thus increasing distance can only remove trees (ordinary greedy
    thinning can bring trees back). A balanced spatial tree prunes bounding boxes and
    priority ranges, avoiding a scan of every pair on large or densely clustered tracks.
    """
    if distance == 0 or len(points) < 2:
        return []
    ids = sorted(points, key=lambda key: (hashlib.blake2b(key.encode(), digest_size=8).digest(), key))
    xy = np.array([[points[key][0], points[key][2]] for key in ids], dtype=np.float64)
    nodes = []

    def build(indices):
        bounds = np.r_[xy[indices].min(axis=0), xy[indices].max(axis=0)]
        at = len(nodes)
        nodes.append((bounds, int(indices.min()), indices, None))
        if len(indices) > 16:
            axis = int(np.argmax(bounds[2:] - bounds[:2]))
            half = len(indices) // 2
            order = indices[np.argpartition(xy[indices, axis], half)]
            nodes[at] = (bounds, int(indices.min()), None, (build(order[:half]), build(order[half:])))
        return at

    build(np.arange(len(ids)))
    radius2 = distance * distance
    removed = []
    for rank, point in enumerate(xy):
        pending = [0]
        while pending:
            bounds, first, leaf, children = nodes[pending.pop()]
            if first >= rank:
                continue
            dx = max(bounds[0] - point[0], 0, point[0] - bounds[2])
            dz = max(bounds[1] - point[1], 0, point[1] - bounds[3])
            if dx * dx + dz * dz >= radius2:
                continue
            if children is not None:
                pending.extend(children)
            else:
                delta = xy[leaf[leaf < rank]] - point
                if np.any(np.einsum('ij,ij->i', delta, delta) < radius2):
                    removed.append(ids[rank])
                    break
    return sorted(removed)


def prepare(points, distance, targets):
    """Validated spacing setting for all current trees or an explicit saved selection. Pure."""
    value = {'distance': distance, 'targets': targets, 'hidden': []}
    if wrong := problem(value):
        raise ValueError(wrong)
    if targets is not None:
        if not targets or not set(targets) <= points.keys():
            raise ValueError('Select trees only')
        points = {id_: points[id_] for id_ in targets}
    value['hidden'] = thin(points, distance)
    return value
