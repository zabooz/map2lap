"""Portable UV2 records cannot override edited KN5 geometry or allocate from untrusted lengths."""
from pathlib import Path
import struct
import tempfile
import unittest
import sys
from unittest import mock
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'src'))
from app import trackuv2
from track import kn5


class SidecarTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.source, self.target = [Path(self.tmp.name, name + '.kn5') for name in ('source', 'copy')]
        vertices = np.zeros(3, kn5.VERTEX)
        vertices['pos'] = [[0, 0, 0], [1, 0, 0], [0, 0, 1]]
        vertices['normal'] = [0, 1, 0]; vertices['tangent'] = [1, 0, 0]
        self.vertices = vertices
        faces = np.array([[0, 2, 1]], '<u2')
        node = kn5.Node(2, 'nocol_foreign', 1, visible=1, renderable=1, material=0,
                        vertices=vertices, indices=faces.ravel(), bs_center=(0, 0, 0), bs_radius=2)
        material = kn5.Material('foreign', 'ksPerPixel', 0, 0, 0, [], [])
        kn5.write(self.source, [], [material], kn5.Node(1, 'root', 1, matrix=tuple(np.eye(4).ravel()), children=[node]))
        mesh = {'name': node.name, 'data': (vertices, faces), 'uv2': np.array([[0, 0], [1, 0], [0, 1]], '<f2')}
        trackuv2.write(self.source, self.source, [mesh])

    def test_foreign_uv2_matches_actual_saved_pose_and_untouched_uv2_is_byte_identical(self):
        kn5.without_faces(self.source, self.target, {}, kn5.Moved({}, {}, {}), [])
        trackuv2.write(self.source, self.target, [])
        self.assertEqual(self.source.with_suffix('.uv2').read_bytes(), self.target.with_suffix('.uv2').read_bytes())
        moved = self.vertices.copy(); moved['pos'][:, 0] += 10
        kn5.without_faces(self.source, self.target, {}, kn5.Moved({0: moved}, {}, {}), [])
        trackuv2.write(self.source, self.target, [])
        raw = trackuv2.records(self.target.with_suffix('.uv2'))['nocol_foreign']
        reader = kn5.Reader(raw); reader.string(); reader.raw(reader.take('<i') * 2)
        count = reader.take('<i')
        packed = np.frombuffer(reader.raw(count * 44), np.uint8).reshape(-1, 44)
        self.assertEqual(10, struct.unpack_from('<f', packed[0])[0])
        np.testing.assert_array_equal(moved.view(np.uint8).reshape(-1, 44)[:, :32], packed[:, :32])

    def test_declared_size_is_rejected_before_decompression_and_truncation_is_a_value_error(self):
        path = self.source.with_suffix('.uv2')
        path.write_bytes(b'\0' + struct.pack('<i', 2**30) + b'\0')
        with mock.patch.object(trackuv2, '_unpack', side_effect=AssertionError('must reject before decode')):
            with self.assertRaisesRegex(ValueError, 'UV2'):
                trackuv2.records(path)
        path.write_bytes(b'\0\1')
        with self.assertRaisesRegex(ValueError, 'UV2'):
            trackuv2.records(path)


if __name__ == '__main__': unittest.main()
