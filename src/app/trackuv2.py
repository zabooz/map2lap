"""Documented CSP UV2 sidecars for derived meshes; foreign records remain byte-identical."""
import struct
from pathlib import Path
import numpy as np
from track import kn5


def _unpack(raw, expected):
    """Decode a raw LZ4 block, including overlapping backreferences. Pure."""
    out, at = bytearray(), 0
    def length(value):
        nonlocal at
        if value == 15:
            while True:
                if at >= len(raw): raise ValueError('Truncated UV2 length')
                extra = raw[at]; at += 1; value += extra
                if extra != 255: break
        return value
    while at < len(raw):
        token = raw[at]; at += 1
        count = length(token >> 4)
        if at + count > len(raw) or len(out) + count > expected: raise ValueError('Invalid UV2 literal length')
        out += raw[at:at + count]; at += count
        if at == len(raw): break
        if at + 2 > len(raw): raise ValueError('Truncated UV2 backreference')
        distance = struct.unpack_from('<H', raw, at)[0]; at += 2
        count = length(token & 15) + 4
        if not 0 < distance <= len(out) or len(out) + count > expected: raise ValueError('Invalid UV2 backreference')
        out += (out[-distance:] * ((count + distance - 1) // distance))[:count]
    return bytes(out)


def records(path):
    """Read named opaque 44-byte vertex records without reinterpreting foreign tangents. Pure apart from file IO."""
    if not Path(path).is_file(): return {}
    path = Path(path)
    companion = path.with_suffix('.kn5')
    if not companion.is_file(): raise ValueError('UV2 needs its companion KN5 for a bounded input')
    # This editor binds UV2 to the KN5 vertex/index layout (both store44B vertices).
    # A sidecar bigger than its entire companion is not an editable matching layout.
    limit = companion.stat().st_size
    if path.stat().st_size > limit + limit // 255 + 16: raise ValueError('UV2 input exceeds its KN5 size bound')
    raw = path.read_bytes()
    if len(raw) < 5 or raw[0] != 0: raise ValueError('Unsupported or truncated UV2 sidecar')
    expected = struct.unpack_from('<i', raw, 1)[0]
    if not 0 <= expected <= limit: raise ValueError('UV2 declared size exceeds its KN5 size bound')
    payload = _unpack(raw[5:], expected)
    if len(payload) != expected: raise ValueError('Invalid UV2 payload size')
    reader, result = kn5.Reader(payload), {}
    while reader.i < len(payload):
        start = reader.i
        def count(width):
            if reader.i + 4 > len(payload): raise ValueError('Truncated UV2 mesh record')
            value = reader.take('<i')
            if value < 0 or value > (len(payload) - reader.i) // width: raise ValueError('Invalid UV2 mesh count')
            return value
        try:
            name = reader.raw(count(1)).decode('utf8')
        except UnicodeError as error:
            raise ValueError('Invalid UV2 mesh name') from error
        indices = count(2); reader.raw(indices * 2)
        vertices = count(44); reader.raw(vertices * 44)
        if vertices > 65535 or indices % 3 or name in result: raise ValueError('Invalid UV2 mesh record')
        result[name] = payload[start:reader.i]
    return result


def mesh_record(mesh):
    """Serialize the exact derived KN5 vertex/index order plus actual FP16 UV2. Pure."""
    vertices, faces = mesh['data']
    uv2 = np.asarray(mesh['uv2'], '<f2')
    name = mesh['name'].encode('utf8')
    indices = faces.astype('<u2').ravel()
    raw = bytearray(struct.pack('<i', len(name)) + name + struct.pack('<i', len(indices)) + indices.tobytes())
    raw += struct.pack('<i', len(vertices))
    for vertex, second in zip(vertices, uv2):
        tangent = np.clip(vertex['tangent'] * 127.5 + 127.5, 0, 255).astype(np.uint8)
        raw += vertex.tobytes()[:32] + tangent.tobytes() + b'\0' + second.tobytes() + bytes([255, 255, 255, 0])
    return bytes(raw)


def write(source, target, meshes):
    """Merge foreign records with current derived meshes, using the renamed KN5 basename."""
    from app import tracknative
    result = {name: raw for name, raw in records(Path(source).with_suffix('.uv2')).items()
              if not name.startswith(tracknative.PREFIX)}
    if result:
        original = {m['name']: m for m in kn5.scan(source)['meshes']}
        saved = {m['name']: m for m in kn5.scan(target)['meshes']}
        with open(source, 'rb') as before, open(target, 'rb') as after:
            for name, raw in list(result.items()):
                if name not in saved:
                    del result[name]; continue
                if name not in original: raise ValueError('UV2 mesh has no original KN5 counterpart')
                old_vertices, old_faces = kn5.mesh_arrays(before, original[name])
                vertices, faces = kn5.mesh_arrays(after, saved[name])
                if vertices.tobytes() == old_vertices.tobytes() and faces.tobytes() == old_faces.tobytes(): continue
                reader = kn5.Reader(raw); reader.string()
                count = reader.take('<i'); indices = reader.raw(count * 2)
                n_vertices = reader.take('<i')
                if n_vertices != len(old_vertices) or indices != old_faces.astype('<u2').tobytes():
                    raise ValueError('Existing UV2 override topology cannot be edited without importing its geometry')
                if len(vertices) != n_vertices or faces.tobytes() != old_faces.tobytes():
                    raise ValueError('Partial face removal on existing UV2 needs a matching topology adapter')
                output = bytearray(raw)
                packed = np.frombuffer(output, np.uint8, offset=reader.i).reshape(n_vertices, 44)
                old = old_vertices.view(np.uint8).reshape(-1, 44)
                if not np.array_equal(packed[:, :32], old[:, :32]):
                    raise ValueError('Existing UV2 geometry override cannot be transformed as the original KN5')
                packed[:, :32] = vertices.view(np.uint8).reshape(-1, 44)[:, :32]
                packed[:, 32:35] = np.clip(vertices['tangent'] * 127.5 + 127.5, 0, 255).astype(np.uint8)
                result[name] = bytes(output)
    result.update((m['name'], mesh_record(m)) for m in meshes if 'uv2' in m)
    target = Path(target).with_suffix('.uv2')
    if not result:
        target.unlink(missing_ok=True); return
    payload = b''.join(result.values())
    extra, lengths = len(payload) - 15, bytearray()
    while extra >= 255: lengths.append(255); extra -= 255
    lengths.append(extra)
    # Valid literal-only LZ4: no external runtime dependency, no compression claim.
    target.write_bytes(b'\0' + struct.pack('<i', len(payload)) + b'\xf0' + lengths + payload)
