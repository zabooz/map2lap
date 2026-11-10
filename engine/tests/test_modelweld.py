"""Save joins a model's vertices that differ only by rounding noise in their normals, and keeps every modelled edge sharp."""
import unittest

import numpy as np

from test_modeldata import encode
from app import modeldata, modelmesh


def glb(positions, faces, normals=None, uvs=None):
    """A one-primitive GLB of these vertices and triangles. Pure."""
    arrays = [np.asarray(positions, "<f4"), *(np.asarray(a, "<f4") for a in (normals, uvs) if a is not None), np.asarray(faces, "<u4").ravel()]
    binary, views, offset = b"", [], 0
    for array in arrays:
        views.append({"buffer": 0, "byteOffset": offset, "byteLength": array.nbytes})
        binary += array.tobytes(); offset += array.nbytes
    points = arrays[0]
    accessors = [{"bufferView": 0, "componentType": 5126, "count": len(points), "type": "VEC3",
                  "min": points.min(axis=0).tolist(), "max": points.max(axis=0).tolist()}]
    attributes = {"POSITION": 0}
    for name, array in (("NORMAL", normals), ("TEXCOORD_0", uvs)):
        if array is not None:
            attributes[name] = len(accessors)
            accessors.append({"bufferView": len(accessors), "componentType": 5126, "count": len(points), "type": "VEC3" if name == "NORMAL" else "VEC2"})
    accessors.append({"bufferView": len(accessors), "componentType": 5125, "count": arrays[-1].size, "type": "SCALAR"})
    document = {"asset": {"version": "2.0"}, "buffers": [{"byteLength": len(binary)}], "bufferViews": views, "accessors": accessors,
                "materials": [{"pbrMetallicRoughness": {"baseColorFactor": [.5, .5, .5, 1]}}],
                "meshes": [{"primitives": [{"attributes": attributes, "indices": len(accessors) - 1, "material": 0}]}],
                "nodes": [{"mesh": 0}], "scenes": [{"nodes": [0]}], "scene": 0}
    return encode(document, binary)


def tilted(degrees):
    """The up normal turned by degrees about x. Pure."""
    a = np.radians(degrees)
    return [0, np.cos(a), np.sin(a)]


def saved(raw):
    """The one part Save makes of a GLB. Pure."""
    model = modeldata.load(raw)
    (part,) = modelmesh.geometry(model, {"anchor": model.anchor, "metres_per_unit": 1.})
    return part


class WeldTest(unittest.TestCase):
    def test_normals_within_a_degree_join_and_wider_ones_stay_apart(self):
        positions = np.zeros((4, 3)); uv = np.array([[0, 0], [0, 0], [0, 0], [.5, 0]])
        normals = np.array([tilted(0), tilted(.4), tilted(5), tilted(0)])
        kept, number = modelmesh.weld(positions, uv, normals)
        np.testing.assert_array_equal([0, 2, 3], kept)
        np.testing.assert_array_equal([0, 0, 1, 2], number)

    def test_tangents_of_the_other_handedness_stay_apart(self):
        positions, uv, normals = np.zeros((3, 3)), np.zeros((3, 2)), np.array([tilted(0)] * 3)
        tangents = np.array([[1, 0, 0, 1], [1, 0, 0, 1], [1, 0, 0, -1]])
        np.testing.assert_array_equal([0, 0, 1], modelmesh.weld(positions, uv, normals, tangents)[1])

    def test_a_vertex_without_a_normal_stays_its_own(self):
        kept, number = modelmesh.weld(np.zeros((2, 3)), np.zeros((2, 2)), np.zeros((2, 3)))
        np.testing.assert_array_equal([0, 1], number)

    def test_a_cube_keeps_its_hard_edges(self):
        positions, normals, faces = [], [], []
        for axis in range(3):
            for side in (-1, 1):
                normal = np.zeros(3); normal[axis] = side
                u, v = np.eye(3)[(axis + 1) % 3], np.eye(3)[(axis + 2) % 3]
                first = len(positions)
                positions += [normal + a * u + b * v for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
                normals += [normal] * 4
                faces += [[first, first + 1, first + 2], [first, first + 2, first + 3]]
        part = saved(glb(positions, faces, normals))
        self.assertEqual(24, len(part["vertices"]))
        self.assertEqual(0, part["primitive"], "The part still names its primitive")
        np.testing.assert_allclose(np.asarray(normals)[part["faces"]], part["vertices"]["normal"][part["faces"]], atol=1e-6)

    def test_a_scans_corners_split_by_rounding_noise_join(self):
        corners = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]
        # (each triangle brings its own copies of the shared corners, their normals 0.2° apart, as a scan exporter writes them)
        positions = corners[:3] + [corners[0], corners[2], corners[3]]
        normals = [tilted(0)] * 3 + [tilted(.2)] * 3
        part = saved(glb(positions, [[0, 2, 1], [3, 5, 4]], normals))
        self.assertEqual(4, len(part["vertices"]))
        expected, got = np.asarray(positions, float)[[0, 2, 1, 3, 5, 4]], part["vertices"]["pos"][part["faces"].ravel()]
        np.testing.assert_allclose(expected - expected.min(axis=0), got - got.min(axis=0), atol=1e-6, err_msg="The same triangles")

    def test_a_flat_shaded_quad_without_normals_shares_its_corners(self):
        part = saved(glb([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], [[0, 2, 1], [0, 3, 2]]))
        self.assertEqual(4, len(part["vertices"]))


if __name__ == "__main__": unittest.main()
