"""Optional, conservative meshoptimizer import levels in the isolated bundled converter."""
import copy
from dataclasses import replace
import json
import os
from pathlib import Path
import struct
import subprocess
import tempfile

import numpy as np
from app import modeldata, modelimport

LEVELS = (100, 75, 50, 25)
ERROR = .01  # Relative to each primitive's extent; stop before this budget, even when the triangle target is unreachable.
VERSION = 1


def level(value):
    """Validate the requested percentage of original triangles. Pure."""
    if type(value) is not int or value not in LEVELS:
        raise ValueError('Choose Original, 75%, 50% or 25% geometry')
    return value


def _locks(model, number):
    """Seam vertices and scene extrema which fix the original bounds and ground anchor. Pure."""
    part = model.primitives[number]
    locked = np.zeros(len(part.positions), bool)
    # Explicitly protect both sides of normal and UV discontinuities at exactly shared positions.
    _, group = np.unique(part.positions, axis=0, return_inverse=True)
    attributes = np.hstack([part.normals, part.uvs])
    order = np.argsort(group, kind='stable')
    for ids in np.split(order, np.flatnonzero(np.diff(group[order])) + 1):
        if len(ids) > 1 and np.any(attributes[ids] != attributes[ids[0]]):
            locked[ids] = True
    for node in model.instances:
        if number not in node.primitives:
            continue
        points = part.positions @ node.transform[:3, :3].T + node.transform[:3, 3]
        locked[np.argmin(points, axis=0)] = True
        locked[np.argmax(points, axis=0)] = True
        # modeldata's contact slice defines the anchor; its horizontal extrema must survive every level.
        foot = np.flatnonzero(points[:, 1] == model.bounds[0][1])
        if len(foot):
            locked[foot[np.argmin(points[foot], axis=0)]] = True
            locked[foot[np.argmax(points[foot], axis=0)]] = True
    return locked


def _tangents(points, normals, uv, faces):
    """Tangents and handedness from the final triangles, original normals and UV0. Pure."""
    a, b, c = faces.T
    e1, e2 = points[b] - points[a], points[c] - points[a]
    u1, u2 = uv[b] - uv[a], uv[c] - uv[a]
    det = u1[:, 0] * u2[:, 1] - u1[:, 1] * u2[:, 0]
    reciprocal = np.divide(1., det, out=np.zeros_like(det), where=np.abs(det) > 1e-20)
    s = (e1 * u2[:, 1, None] - e2 * u1[:, 1, None]) * reciprocal[:, None]
    t = (e2 * u1[:, 0, None] - e1 * u2[:, 0, None]) * reciprocal[:, None]
    tangent, bitangent = np.zeros_like(points), np.zeros_like(points)
    for corners in (a, b, c):
        np.add.at(tangent, corners, s); np.add.at(bitangent, corners, t)
    normal = normals / np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-30)
    tangent -= normal * np.sum(normal * tangent, axis=1, keepdims=True)
    zero = np.linalg.norm(tangent, axis=1) < 1e-20
    axis = np.eye(3)[np.argmin(np.abs(normal[zero]), axis=1)]
    tangent[zero] = np.cross(normal[zero], axis)
    tangent /= np.maximum(np.linalg.norm(tangent, axis=1, keepdims=True), 1e-30)
    hand = np.where(np.sum(np.cross(normal, tangent) * bitangent, axis=1) < 0, -1., 1.)
    return np.column_stack([tangent, hand]).astype('<f4')


def _encode(model, results):
    """Compact final indexed geometry and retain scene, image and material descriptions. Pure."""
    doc = copy.deepcopy(model.document)
    doc['bufferViews'], doc['accessors'] = [], []
    binary = bytearray()

    def view(data):
        binary.extend(b'\0' * (-len(binary) % 4))
        index = len(doc['bufferViews'])
        doc['bufferViews'].append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data)})
        binary.extend(data)
        return index

    def accessor(values, width, integer=False):
        array = np.asarray(values, '<u4' if integer else '<f4')
        item = {'bufferView': view(array.tobytes()), 'componentType': 5125 if integer else 5126,
                'count': array.size // width, 'type': 'SCALAR' if width == 1 else f'VEC{width}'}
        if width == 3:
            item.update(min=array.min(axis=0).tolist(), max=array.max(axis=0).tolist())
        doc['accessors'].append(item)
        return len(doc['accessors']) - 1

    primitives = [p for mesh in doc['meshes'] for p in mesh['primitives']]
    for part, entry, indices in zip(model.primitives, primitives, results):
        faces = np.asarray(indices, np.uint32).reshape(-1, 3)
        kept, remap = np.unique(faces, return_inverse=True)
        points, uv = part.positions[kept], part.uvs[kept]
        normals = part.normals[kept] if part.normals is not None else None
        faces = remap.reshape(-1, 3)
        entry['attributes'] = {'POSITION': accessor(points, 3), 'TEXCOORD_0': accessor(uv, 2)}
        if normals is not None:
            entry['attributes']['NORMAL'] = accessor(normals, 3)
            entry['attributes']['TANGENT'] = accessor(_tangents(points, normals, uv, faces), 4)
        entry['indices'] = accessor(faces.ravel(), 1, True)
    for entry, raw in zip(doc.get('images', []), model.images):
        if 'bufferView' in entry:
            entry['bufferView'] = view(raw)
    doc['buffers'] = [{'byteLength': len(binary)}]
    text = json.dumps(doc, separators=(',', ':'), allow_nan=False).encode()
    text += b' ' * (-len(text) % 4); binary.extend(b'\0' * (-len(binary) % 4))
    chunks = struct.pack('<II', len(text), 0x4e4f534a) + text + struct.pack('<II', len(binary), 0x004e4942) + binary
    return struct.pack('<4sII', b'glTF', 2, len(chunks) + 12) + chunks


def simplify(raw, percentage=100):
    """Reduce each primitive independently, preserving seams, materials and the original placement frame."""
    if level(percentage) == 100:
        return raw
    model = modeldata.load(raw)
    # The same <1-degree rounding-noise weld already used by Save: exporter corner splits are not shading seams.
    # Do this before topology analysis; genuine normal/UV seams retain separate vertices and get locked below.
    from app import modelmesh
    parts = []
    for part in model.primitives:
        if part.normals is None:
            parts.append(part)
            continue
        kept, remap = modelmesh.weld(part.positions, part.uvs, modelmesh._unit(part.normals), part.tangents)
        parts.append(replace(part, positions=part.positions[kept], uvs=part.uvs[kept], normals=part.normals[kept],
                             tangents=part.tangents[kept] if part.tangents is not None else None, indices=remap[part.indices]))
    model = replace(model, primitives=tuple(parts))
    candidates, request = [], []
    results = [p.indices.ravel().tolist() for p in model.primitives]
    for number, part in enumerate(model.primitives):
        # Missing normals mean intentionally flat faces. Their corners are shading boundaries.
        if part.normals is None or len(part.indices) <= 2:
            continue
        candidates.append(number)
        request.append({'positions': part.positions.tolist(), 'indices': results[number],
                        'attributes': np.hstack([part.normals, part.uvs]).ravel().tolist(), 'locks': _locks(model, number).tolist()})
    if not candidates:
        return raw
    with tempfile.TemporaryDirectory(prefix='map2lap_simplify_') as folder:
        source, target = Path(folder, 'input.json'), Path(folder, 'output.json')
        source.write_text(json.dumps({'level': percentage, 'error': ERROR, 'primitives': request}, allow_nan=False), encoding='utf-8')
        try:
            process = subprocess.run([str(modelimport.PROGRAM), '--simplify', str(source), str(target)],
                                     capture_output=True, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
            if process.returncode:
                raise ValueError('Could not simplify this model: ' + process.stderr.decode(errors='replace')[:300])
            simplified = json.loads(target.read_bytes())
        except (OSError, subprocess.TimeoutExpired) as error:
            raise ValueError('The model simplifier is unavailable or timed out') from error
    if len(simplified) != len(candidates):
        raise ValueError('Invalid model simplifier result')
    for number, indices in zip(candidates, simplified):
        if not indices or len(indices) % 3 or min(indices) < 0 or max(indices) >= len(model.primitives[number].positions):
            raise ValueError('Invalid simplified model indices')
        results[number] = indices
    if sum(map(len, results)) >= sum(p.indices.size for p in model.primitives):
        return raw
    result = _encode(model, results)
    checked = modeldata.load(result)
    if checked.bounds != model.bounds or checked.anchor != model.anchor:
        # Unsupported precision/contact configurations keep their original frame and geometry.
        return raw
    return result
