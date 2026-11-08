"""Read and write kn5 (Assetto Corsa's model format): textures, materials, node tree with meshes.

    python -m track.kn5 <file.kn5>        # (in src/) overview + check that reading ends exactly at the end of the file
"""
import struct
import sys
from collections import namedtuple
from dataclasses import dataclass, field

import numpy as np

VERTEX = np.dtype([("pos", "<f4", 3), ("normal", "<f4", 3), ("uv", "<f4", 2), ("tangent", "<f4", 3)])
# What a Save changes of a file's meshes: vertices {mesh number: all its vertices as they are to be}, grow {mesh number: how much its
# bounding sphere needs to grow by}, points {name of a point: its matrix}.
Moved = namedtuple("Moved", "vertices grow points")


@dataclass
class Material:
    name: str
    shader: str
    blend: int
    alpha_tested: int
    depth_mode: int
    props: list         # [(name, a, (b2), (c3), (d4))]
    maps: list          # [(name, slot, texture)]


@dataclass
class Node:
    cls: int            # 1 = node with a matrix, 2 = mesh
    name: str
    active: int
    matrix: tuple = None
    cast_shadows: int = 0
    visible: int = 0
    transparent: int = 0
    vertices: np.ndarray = None
    indices: np.ndarray = None
    material: int = 0
    layer: int = 0
    lod_in: float = 0.0
    lod_out: float = 0.0
    bs_center: tuple = None
    bs_radius: float = 0.0
    renderable: int = 1
    children: list = field(default_factory=list)


class Reader:
    def __init__(self, b):
        self.b, self.i = b, 0

    def take(self, fmt):
        v = struct.unpack_from(fmt, self.b, self.i)
        self.i += struct.calcsize(fmt)
        return v if len(v) > 1 else v[0]

    def string(self):
        n = self.take("<i")
        s = self.b[self.i:self.i + n].decode("utf-8", "replace")
        self.i += n
        return s

    def raw(self, n):
        r = self.b[self.i:self.i + n]
        self.i += n
        return r


class FileReader:
    """Reader on an open file: skips the bytes it is not asked for (scan)."""

    def __init__(self, f):
        self.f = f

    def take(self, fmt):
        v = struct.unpack(fmt, self.f.read(struct.calcsize(fmt)))
        return v if len(v) > 1 else v[0]

    def string(self):
        return self.f.read(self.take("<i")).decode("utf-8", "replace")

    def skip(self, n):
        self.f.seek(n, 1)


def _materials(r):
    """The file's materials [Material], r (a Reader or FileReader) at their count."""
    materials = []
    for _ in range(r.take("<i")):
        name, shader = r.string(), r.string()
        blend, at, depth = r.take("<B"), r.take("<B"), r.take("<i")
        props = []
        for _ in range(r.take("<i")):
            props.append((r.string(), r.take("<f"), r.take("<2f"), r.take("<3f"), r.take("<4f")))
        maps = []
        for _ in range(r.take("<i")):
            maps.append((r.string(), r.take("<i"), r.string()))
        materials.append(Material(name, shader, blend, at, depth, props, maps))
    return materials


def scan(path):
    """Where everything lies in the kn5 at path, without loading its textures and meshes (a long track's kn5: 9.9 GB):
    {"textures": [(name, offset, size)], "materials": [Material], "meshes": [{name, material, offset, vertices, indices,
    lod_in, lod_out, center, radius, renderable}], "points": {name: matrix}}. A mesh's offset is its vertices', its
    index count (int32) and indices follow them. Points: the nodes with a matrix and no children (AC_START_0, ...)."""
    textures, meshes, points = [], [], {}
    with open(path, "rb") as f:
        r = FileReader(f)
        assert f.read(6) == b"sc6969", "not a kn5"
        if r.take("<i") > 5:
            r.take("<i")
        for _ in range(r.take("<i")):
            r.take("<i")
            name, size = r.string(), r.take("<i")
            textures.append((name, f.tell(), size))
            r.skip(size)
        materials = _materials(r)

        def node():
            cls, name = r.take("<i"), r.string()
            nchildren = r.take("<i")
            active = r.take("<B")
            if cls == 1:
                matrix = r.take("<16f")
                if not nchildren:
                    points[name] = matrix
            elif cls == 2:
                cast_shadows, visible, transparent = r.take("<BBB")
                nv = r.take("<i")
                offset = f.tell()
                r.skip(nv * VERTEX.itemsize)
                ni = r.take("<i")
                r.skip(ni * 2)
                material = r.take("<i")
                layer = r.take("<i")
                lod_in, lod_out = r.take("<f"), r.take("<f")
                center, radius = r.take("<3f"), r.take("<f")
                meshes.append({"name": name, "material": material, "offset": offset, "vertices": nv, "indices": ni,
                               "lod_in": lod_in, "lod_out": lod_out, "center": center, "radius": radius,
                               "renderable": r.take("<B"), "active": active, "cast_shadows": cast_shadows,
                               "visible": visible, "transparent": transparent, "layer": layer})
            else:
                raise ValueError(f"node class {cls} ({name}) not supported")
            for _ in range(nchildren):
                node()
        node()
    return {"textures": textures, "materials": materials, "meshes": meshes, "points": points}


def _copy_bytes(source, target, n):
    """n bytes on from source to target, in pieces: a long track's kn5 doesn't fit into memory."""
    while n > 0:
        piece = source.read(min(n, 16 << 20))
        if not piece:
            raise ValueError("kn5 cut off")
        target.write(piece)
        n -= len(piece)


def without_faces(path, out, going, change=None, added=(), texture_bytes=None, materials=None, textures=()):
    """A copy of the kn5 at path at out without some triangles: going {mesh number (as scan's): bool per triangle, True what goes}.
    A mesh left with none is left out. What doesn't change is copied as it stands, so the rest stays the same to the byte and a 10 GB
    file never lies in memory; a changed mesh keeps only the vertices it still uses, and its bounding sphere: a little too big does no
    harm. change: a Moved, of the file's numbers before anything goes. added: draft meshes with mesh_arrays data, numbered after
    the source meshes, subject to the same filtering and changes. texture_bytes(i): replacement bytes, or None to stream the
    original image unchanged. materials: a replacement table with the same indexes; textures: additional shared images.
    Returns {mesh number: its new number, None if left out}."""
    change = change or Moved({}, {}, {})
    scan_ = scan(path)
    textures = tuple(textures)
    if materials is not None and len(materials) != len(scan_["materials"]):
        raise ValueError("Replacement materials must keep the original material indexes")
    names = [name for name, _raw in textures]
    if len(set(names)) != len(names) or set(names).intersection(t[0] for t in scan_["textures"]):
        raise ValueError("Additional texture names must be unique")
    moved, number = {}, 0
    all_meshes = scan_["meshes"] + list(added)
    for i, m in enumerate(all_meshes):
        gone = going.get(i)
        left_out = gone is not None and len(gone) and gone.all()
        moved[i] = None if left_out else number
        number += 0 if left_out else 1
    with open(path, "rb") as f, open(out, "wb") as g:
        r = FileReader(f)
        assert f.read(6) == b"sc6969", "not a kn5"
        if r.take("<i") > 5:
            r.take("<i")
        for _ in range(r.take("<i")):
            r.take("<i")
            r.string()
            r.skip(r.take("<i"))
        _materials(r)
        head = f.tell()
        if texture_bytes is None and materials is None and not textures:
            f.seek(0)
            _copy_bytes(f, g, head)
        else:
            _copy_header(f, g, texture_bytes, materials, textures)
        cls, name = r.take("<i"), r.string()
        children = r.take("<i")
        active = r.take("<B")
        assert cls == 1, "the kn5's root is a node with a matrix"
        matrix = r.take("<16f")
        left = sum(1 for i in range(len(scan_["meshes"])) if moved[i] is None)
        extra = sum(moved[i] is not None for i in range(len(scan_["meshes"]), len(all_meshes)))
        g.write(struct.pack("<i", cls) + _s(name) + struct.pack("<iB", children - left + extra, active) + struct.pack("<16f", *matrix))
        mesh = -1
        for _ in range(children):
            mesh = _copy_child(f, g, r, mesh, moved, going, scan_, change)
        for i, info in enumerate(added, len(scan_["meshes"])):
            if moved[i] is None:
                continue
            vertices, faces = mesh_arrays(f, info)
            vertices = change.vertices.get(i, vertices)
            if i in going:
                faces = faces[~going[i]]
            used, inverse = np.unique(faces.ravel(), return_inverse=True)
            node = Node(2, info["name"], info["active"], vertices=vertices[used], indices=inverse,
                        **{k: info[k] for k in ("material", "layer", "cast_shadows", "visible", "transparent", "lod_in", "lod_out", "renderable")},
                        bs_center=info["center"], bs_radius=info["radius"] + change.grow.get(i, 0))
            g.writelines(node_bytes(node))
    return moved


def _copy_header(f, g, replacement, materials=None, textures=()):
    """Stream selected image/material changes and additional shared images, retaining material indexes and nodes."""
    f.seek(6)
    r = FileReader(f)
    if r.take("<i") > 5:
        r.take("<i")
    count = r.take("<i")
    prefix = f.tell()
    f.seek(0)
    _copy_bytes(f, g, prefix - 4)
    g.write(struct.pack("<i", count + len(textures)))
    f.seek(prefix)
    for i in range(count):
        start = f.tell()
        r.take("<i")
        r.string()
        size = r.take("<i")
        at = f.tell()
        raw = replacement(i) if replacement else None
        f.seek(start)
        if raw is None:
            _copy_bytes(f, g, at - start + size)
        else:
            _copy_bytes(f, g, at - start - 4)
            g.write(struct.pack("<i", len(raw)))
            g.write(raw)
            f.seek(at + size)
    for name, raw in textures:
        g.write(struct.pack("<i", 1) + _s(name) + struct.pack("<i", len(raw)))
        g.write(raw)
    start = f.tell()
    _materials(r)
    end = f.tell()
    f.seek(start)
    if materials is None:
        _copy_bytes(f, g, end - start)
    else:
        g.writelines(material_bytes(materials))
        f.seek(end)


def mesh_arrays(f, info):
    """Vertices (a copy to change) and triangles from an open kn5 or an added draft mesh."""
    if "data" in info:
        return info["data"][0].copy(), info["data"][1]
    f.seek(info["offset"])
    vertices = np.frombuffer(f.read(info["vertices"] * VERTEX.itemsize), dtype=VERTEX).copy()
    f.read(4)
    return vertices, np.frombuffer(f.read(info["indices"] * 2), dtype="<u2").reshape(-1, 3)


def _copy_child(f, g, r, mesh, moved, going, scan_, change):
    """The root's next child from f to g: a mesh without its triangles that go, as change moved it. Returns the number of the last mesh
    passed."""
    start = f.tell()
    cls = r.take("<i")
    name = r.string()
    assert r.take("<i") == 0, "only the root of a kn5 of ours has children"
    r.take("<B")
    if cls == 1:
        matrix_at = f.tell()
        f.seek(start)
        _copy_bytes(f, g, matrix_at - start)
        matrix = f.read(64)
        g.write(struct.pack("<16f", *change.points[name]) if name in change.points else matrix)
        return mesh
    assert cls == 2, f"node class {cls} not supported"
    mesh += 1
    r.skip(3)
    m = scan_["meshes"][mesh]
    vertices_at = f.tell()
    size = 4 + m["vertices"] * VERTEX.itemsize + 4 + m["indices"] * 2
    tail_size = 4 + 4 + 8 + 16 + 1      # (material, layer, lod in and out, centre and radius, renderable)
    gone = going.get(mesh)
    if moved[mesh] is None:
        f.seek(vertices_at + size + tail_size)
    elif gone is None and mesh not in change.vertices:
        f.seek(start)
        _copy_bytes(f, g, vertices_at - start + size + tail_size)
    else:
        f.seek(start)
        _copy_bytes(f, g, vertices_at - start)
        f.read(4)
        vertices = np.frombuffer(f.read(m["vertices"] * VERTEX.itemsize), dtype=VERTEX)
        vertices = change.vertices.get(mesh, vertices)
        f.read(4)
        faces = np.frombuffer(f.read(m["indices"] * 2), dtype=np.uint16).reshape(-1, 3)
        if gone is not None:
            faces = faces[~gone]
        used, inverse = np.unique(faces.ravel(), return_inverse=True) if gone is not None else (np.arange(len(vertices)), faces.ravel())
        g.write(struct.pack("<i", len(used)))
        g.write(vertices[used].tobytes())
        g.write(struct.pack("<i", len(inverse)))
        g.write(inverse.astype("<u2").tobytes())
        tail = bytearray(f.read(tail_size))
        if mesh in change.grow:
            struct.pack_into("<f", tail, 4 + 4 + 8 + 12, m["radius"] + change.grow[mesh])
        g.write(tail)
    return mesh


def walk_meshes(node):
    """All mesh nodes under node. Pure."""
    out = [node] if node.cls == 2 else []
    for child in node.children:
        out += walk_meshes(child)
    return out


def read(path):
    r = Reader(open(path, "rb").read())
    assert r.raw(6) == b"sc6969", "not a kn5"
    version = r.take("<i")
    extra = r.take("<i") if version > 5 else None
    textures = []
    for _ in range(r.take("<i")):
        active = r.take("<i")
        name = r.string()
        size = r.take("<i")
        textures.append((name, active, r.raw(size)))
    materials = _materials(r)

    def node():
        cls = r.take("<i")
        name = r.string()
        nchildren = r.take("<i")
        active = r.take("<B")
        n = Node(cls, name, active)
        if cls == 1:
            n.matrix = r.take("<16f")
        elif cls == 2:
            n.cast_shadows, n.visible, n.transparent = r.take("<B"), r.take("<B"), r.take("<B")
            nv = r.take("<i")
            n.vertices = np.frombuffer(r.raw(nv * VERTEX.itemsize), VERTEX)
            ni = r.take("<i")
            n.indices = np.frombuffer(r.raw(ni * 2), "<u2")
            n.material, n.layer = r.take("<i"), r.take("<i")
            n.lod_in, n.lod_out = r.take("<f"), r.take("<f")
            n.bs_center, n.bs_radius = r.take("<3f"), r.take("<f")
            n.renderable = r.take("<B")
        else:
            raise ValueError(f"node class {cls} ({name}) not supported")
        for _ in range(nchildren):
            n.children.append(node())
        return n
    root = node()
    return {"version": version, "extra": extra, "textures": textures, "materials": materials, "root": root,
            "end": r.i, "size": len(r.b)}


def _s(s):
    b = s.encode("utf-8")
    return struct.pack("<i", len(b)) + b


def header_bytes(textures, materials, version=6):
    """File header up to the node tree: signature, textures [(name, bytes)], materials [Material]."""
    out = [b"sc6969", struct.pack("<i", version)]
    if version > 5:
        out.append(struct.pack("<i", 0))
    out.append(struct.pack("<i", len(textures)))
    for name, data in textures:
        out += [struct.pack("<i", 1), _s(name), struct.pack("<i", len(data)), data]
    out.extend(material_bytes(materials))
    return out


def material_bytes(materials):
    """A KN5 material table as byte pieces, preserving list order and therefore mesh material indexes. Pure."""
    out = [struct.pack("<i", len(materials))]
    for m in materials:
        out += [_s(m.name), _s(m.shader), struct.pack("<BBi", m.blend, m.alpha_tested, m.depth_mode),
                struct.pack("<i", len(m.props))]
        for name, a, b2, c3, d4 in m.props:
            out += [_s(name), struct.pack("<f2f3f4f", a, *b2, *c3, *d4)]
        out.append(struct.pack("<i", len(m.maps)))
        for name, slot, tex in m.maps:
            out += [_s(name), struct.pack("<i", slot), _s(tex)]
    return out


def node_bytes(n, children=None):
    """A node with its children as byte pieces; children: the number of children when they are written separately
    (write_streamed), else n.children."""
    out = []

    def node(n, nchildren, recurse=True):
        out.extend([struct.pack("<i", n.cls), _s(n.name), struct.pack("<iB", nchildren, n.active)])
        if n.cls == 1:
            out.append(struct.pack("<16f", *n.matrix))
        else:
            assert len(n.vertices) <= 65535, f"{n.name}: {len(n.vertices)} vertices > 65535"
            v = np.ascontiguousarray(n.vertices, VERTEX)
            out.extend([struct.pack("<BBB", n.cast_shadows, n.visible, n.transparent), struct.pack("<i", len(v)),
                        v.tobytes(), struct.pack("<i", len(n.indices)), np.asarray(n.indices, "<u2").tobytes(),
                        struct.pack("<ii", n.material, n.layer), struct.pack("<ff", n.lod_in, n.lod_out),
                        struct.pack("<3ff", *n.bs_center, n.bs_radius), struct.pack("<B", n.renderable)])
        if recurse:
            for c in n.children:
                node(c, len(c.children))
    if children is None:
        node(n, len(n.children))
    else:
        node(n, children, recurse=False)
    return out


def write(path, textures, materials, root, version=6):
    """Counterpart of read(): textures [(name, bytes)], materials [Material], root Node (laid out like ksEditor does)."""
    with open(path, "wb") as f:
        for b in header_bytes(textures, materials, version) + node_bytes(root):
            f.write(b)


def write_streamed(path, textures, materials, root, chunk_files, n_chunk_nodes, version=6):
    """Like write(), but the first n_chunk_nodes children of root are already finished bytes in chunk_files
    (written by the worker processes) and are only appended; root.children follow after them. This way the main
    process never holds the whole track in memory (Vienna: a 9.9 GB kn5)."""
    import shutil
    with open(path, "wb") as f:
        for b in header_bytes(textures, materials, version):
            f.write(b)
        for b in node_bytes(root, children=n_chunk_nodes + len(root.children)):
            f.write(b)
        for p in chunk_files:
            with open(p, "rb") as c:
                shutil.copyfileobj(c, f, 16 << 20)
        for ch in root.children:
            for b in node_bytes(ch):
                f.write(b)


def walk(n, depth=0):
    yield n, depth
    for c in n.children:
        yield from walk(c, depth + 1)


if __name__ == "__main__":
    k = read(sys.argv[1])
    print(f"Version {k['version']} (extra {k['extra']}), {len(k['textures'])} textures, "
          f"{len(k['materials'])} materials, read up to {k['end']} of {k['size']} bytes "
          f"({'OK, exactly at the end' if k['end'] == k['size'] else 'NOT at the end'})")
    meshes = [n for n, _ in walk(k["root"]) if n.cls == 2]
    print(f"Nodes: {sum(1 for _ in walk(k['root']))}, meshes among them: {len(meshes)}, "
          f"vertices: {sum(len(m.vertices) for m in meshes)}, indices: {sum(len(m.indices) for m in meshes)}")
    for n, d in list(walk(k["root"]))[:12]:
        if n.cls == 1:
            print("  " * d + f"[{n.name}] matrix diagonal {n.matrix[0]:.3g} {n.matrix[5]:.3g} {n.matrix[10]:.3g} "
                  f"translation {n.matrix[12]:.2f} {n.matrix[13]:.2f} {n.matrix[14]:.2f}")
        else:
            m = k["materials"][n.material].name
            print("  " * d + f"{n.name}: {len(n.vertices)} vertices, mat={m}, layer={n.layer}, lod {n.lod_in}-"
                  f"{n.lod_out}, shadows={n.cast_shadows} visible={n.visible} transp={n.transparent} "
                  f"render={n.renderable} sphere={tuple(round(c, 1) for c in n.bs_center)} r={n.bs_radius:.1f}")
            v = n.vertices[0]
            print("  " * d + f"   first vertex pos={v['pos']} n={v['normal']} uv={v['uv']} t={v['tangent']}")
