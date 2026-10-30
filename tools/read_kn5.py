"""Print the materials of a .kn5 (shader, parameters, textures) for debugging."""
import struct
import sys

b = open(sys.argv[1], "rb").read()
i = 0


def take(fmt):
    global i
    v = struct.unpack_from(fmt, b, i)
    i += struct.calcsize(fmt)
    return v if len(v) > 1 else v[0]


def string():
    global i
    n = take("<i")
    s = b[i:i + n].decode("utf-8", "replace")
    i += n
    return s


assert b[:6] == b"sc6969", b[:6]
i = 6
version = take("<i")
if version > 5:
    take("<i")
print("Version", version)
for _ in range(take("<i")):
    take("<i")
    name = string()
    size = take("<i")
    print(f"Texture {name}: {size} bytes")
    i += size
for _ in range(take("<i")):
    name, shader = string(), string()
    blend, alphatest, depth = take("<B"), take("<B"), take("<i")
    props = []
    for _ in range(take("<i")):
        pn = string()
        a = take("<f")
        i += 8 + 12 + 16
        props.append(f"{pn}={a:g}")
    maps = []
    for _ in range(take("<i")):
        mn, slot, tex = string(), take("<i"), string()
        maps.append(f"{mn}:{tex}")
    if version >= 6:        # (shader defines / extra field of newer versions)
        pass
    print(f"Material {name} [{shader}] blend={blend} " + " ".join(props) + " | " + " ".join(maps))
