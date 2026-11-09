"""Self-made trunk and asymmetric UV-mapped cutout crown for the model workflow browser test."""
import io
import json
import struct
import sys
import zipfile

import numpy as np
from PIL import Image


def tree(default_material=False, metallic=False):
    document = {"asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
                "buffers": [], "bufferViews": [], "accessors": [], "meshes": [{"primitives": []}],
                "materials": [{"pbrMetallicRoughness": {"baseColorFactor": [.22, .08, .025, 1], "metallicFactor": 0}, "doubleSided": True},
                              {"pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0},
                               "alphaMode": "MASK", "alphaCutoff": .5, "doubleSided": True}],
                "textures": [{"source": 0}], "images": []}
    if metallic:
        for material in document['materials']:
            material['pbrMetallicRoughness'].update(metallicFactor=1, roughnessFactor=1)
    binary = bytearray()

    def view(raw):
        binary.extend(b"\0" * (-len(binary) % 4)); offset = len(binary); binary.extend(raw)
        document["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(raw)})
        return len(document["bufferViews"]) - 1

    def accessor(values, kind, dtype, component):
        values = np.array(values, dtype=dtype)
        document["accessors"].append({"bufferView": view(values.tobytes()), "componentType": component,
                                      "count": len(values), "type": kind})
        return len(document["accessors"]) - 1

    for material, positions in enumerate(([[-.18, 0, 0], [.18, 0, 0], [-.18, 2.5, 0], [.18, 2.5, 0]],
                                          [[-1.8, 1.2, .01], [1.8, 1.2, .01], [-1.8, 5, .01], [1.8, 5, .01]])):
        document["meshes"][0]["primitives"].append({"attributes": {
            "POSITION": accessor(positions, "VEC3", "<f4", 5126),
            "NORMAL": accessor([[0, 0, 1]] * 4, "VEC3", "<f4", 5126),
            "TEXCOORD_0": accessor([[0, 1], [1, 1], [0, 0], [1, 0]], "VEC2", "<f4", 5126)},
            "indices": accessor([0, 1, 2, 2, 1, 3], "SCALAR", "<u2", 5123), "material": material})
    if default_material:
        primitives = document["meshes"][0]["primitives"]
        primitives[0]["material"] = 1
        primitives[1].pop("material"); primitives[1]["attributes"].pop("NORMAL")
    image = np.zeros((32, 32, 4), np.uint8)
    yy, xx = np.mgrid[:32, :32]
    image[..., :3] = [20, 180, 45]; image[:8, :8, :3] = [220, 40, 25]
    image[..., 3] = np.where(((xx - 16) ** 2 + (yy - 16) ** 2 < 225) & ~((xx < 13) & (yy > 15) & (yy < 24)), 255, 0)
    output = io.BytesIO(); Image.fromarray(image).save(output, "PNG")
    document["images"].append({"bufferView": view(output.getvalue()), "mimeType": "image/png"})
    document["buffers"] = [{"byteLength": len(binary)}]
    encoded = json.dumps(document, separators=(",", ":")).encode(); encoded += b" " * (-len(encoded) % 4)
    binary.extend(b"\0" * (-len(binary) % 4))
    return struct.pack("<III", 0x46546c67, 2, 28 + len(encoded) + len(binary)) + struct.pack("<II", len(encoded), 0x4e4f534a) + encoded + struct.pack("<II", len(binary), 0x004e4942) + binary


def obj_bundle():
    """A self-made textured OBJ and its relative MTL/PNG companions in one uploaded ZIP. Pure."""
    image = io.BytesIO()
    Image.new('RGBA', (8, 8), (30, 160, 40, 255)).save(image, 'PNG')
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as archive:
        archive.writestr('model/panel.obj', 'mtllib panel.mtl\nusemtl leaf\nv -1 0 0\nv 1 0 0\nv 1 3 0\nv -1 3 0\nvt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\nf 1/1 2/2 3/3 4/4\n')
        archive.writestr('model/panel.mtl', 'newmtl leaf\nKd 1 1 1\nmap_Kd textures/leaf.png\n')
        archive.writestr('model/textures/leaf.png', image.getvalue())
    return stream.getvalue()


if __name__ == "__main__":
    sys.stdout.buffer.write(obj_bundle() if '--obj-zip' in sys.argv else tree("--default-material" in sys.argv, "--metallic" in sys.argv))
