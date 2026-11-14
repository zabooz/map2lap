"""Reversible percentages of listed parked cars; parking spaces and manual deletions stay independent."""
import hashlib
import math


def problem(value):
    """The problem with a persisted percentage/scope/hidden layer, or None. Pure."""
    if value is None:
        return None
    if not isinstance(value, dict) or set(value) != {'percent', 'targets', 'hidden'}:
        return 'Invalid car density'
    percent = value['percent']
    if type(percent) not in (int, float) or not math.isfinite(percent) or not 0 <= percent <= 100:
        return 'Car density must be 0–100 percent'
    for key in ('targets', 'hidden'):
        ids = value[key]
        if key == 'targets' and ids is None:
            continue
        if not isinstance(ids, list) or len(ids) > 500_000 or not all(isinstance(i, str) for i in ids) or len(set(ids)) != len(ids):
            return 'Invalid car density selection'
    if percent == 100 and value['hidden']:
        return 'Full density must restore cars hidden by density'
    if value['targets'] is not None and not set(value['hidden']) <= set(value['targets']):
        return 'Car density cannot hide cars outside its selection'
    return None


def candidates(objects):
    """Editable generated parked cars and their copies across all tiles, excluding baked-away faces. Pure."""
    return {f'{tile}#{i}' for tile, entry in objects.items() for i, kind in enumerate(entry['kinds'])
            if kind == 'car' and entry['parents'][i] < 0 and entry['faces'][i]}


def prepare(objects, percent, targets=None):
    """A stable nested subset of all listed cars, or the selected cars. Pure."""
    value = {'percent': percent, 'targets': targets, 'hidden': []}
    if wrong := problem(value):
        raise ValueError(wrong)
    ids = candidates(objects)
    if targets is not None:
        if not targets or not set(targets) <= ids:
            raise ValueError('Select parked cars only')
        ids = set(targets)
    order = sorted(ids, key=lambda key: (hashlib.blake2b(key.encode(), digest_size=8).digest(), key))
    # Whole cars only: round down the requested share. The ordering never changes with percentage.
    value['hidden'] = sorted(order[int(len(order) * percent / 100):])
    return value


def effective(edits):
    """An export-only view, leaving manual deletion and the reversible recipe separate. Pure."""
    deleted = {d['id']: d for d in edits['deleted']}
    for id_ in (edits.get('car_density') or {}).get('hidden', []):
        deleted.setdefault(id_, {'id': id_, 'position': [0, 0, 0]})
    return {**edits, 'deleted': list(deleted.values())}
