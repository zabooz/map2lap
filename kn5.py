"""Read and write kn5 (Assetto Corsa's model format): textures, materials, node tree with meshes.

    python kn5.py <file.kn5>        # overview + check that reading ends exactly at the end of the file
"""
import struct
import sys
from dataclasses import dataclass, field

import numpy as np

VERTEX = np.dtype([("pos", "<f4", 3), ("normal", "<f4", 3), ("uv", "<f4", 2), ("tangent", "<f4", 3)])


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
    out.append(struct.pack("<i", len(materials)))
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
