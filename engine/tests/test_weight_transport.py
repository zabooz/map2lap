"""Weight transport retains the existing mip bytes and every regional contributor."""
import gzip
import io
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import trackdetail, trackpaint
import server


class WeightTransportTest(unittest.TestCase):
    def test_simple_mask_compression_keeps_every_dds_mip_byte_and_reuses_cache(self):
        raw = b"DDS " + bytes(range(256)) * 100
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[2] / "out") as folder, \
             mock.patch.object(trackpaint.mytracks, "ROOT", folder), mock.patch.object(trackdetail, "_view"), \
             mock.patch.object(trackdetail, "mask", return_value=raw) as mask:
            first = trackdetail.compressed_mask("ac", "copy", "a" * 64)
            self.assertEqual(raw, gzip.decompress(first))
            self.assertEqual(first, trackdetail.compressed_mask("ac", "copy", "a" * 64))
            mask.assert_called_once()

    def test_bundle_deduplicates_payloads_without_changing_bytes(self):
        keys = ["a" * 64, "b" * 64]
        payloads = [b"M2GW" + bytes(range(256)) * 8, b"M2GW" + b"\x00\x3c" * 400]
        layout = {"mask": {"name": "regional", "size": 0}, "images": [], "ground": {"passes": [
            {"weight": {"key": key, "name": key + ".r16", "size": len(raw)}}
            for key, raw in zip(keys + keys[:1], payloads + payloads[:1]) ]}}
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[2] / "out") as folder, mock.patch.object(trackpaint.mytracks, "ROOT", folder), \
             mock.patch.object(trackdetail, "_view"), mock.patch.object(trackdetail, "describe", return_value=layout):
            for key, raw in zip(keys, payloads):
                path = trackdetail._cache(key, "region").with_suffix(".r16")
                path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(raw)
            bound = trackdetail._with_urls("copy", "c" * 64, layout)
            refs = [p["weight"] for p in bound["ground"]["passes"]]
            self.assertEqual(refs[0]["bundle"], refs[2]["bundle"])
            compressed = trackdetail.weight_bundle("ac", "copy", "c" * 64)
            raw = gzip.decompress(compressed)
            self.assertEqual(b"".join(payloads), raw)
            for ref, expected in zip(refs, payloads + payloads[:1]):
                b = ref["bundle"]
                self.assertEqual(expected, raw[b["offset"]:b["offset"] + ref["size"]])
                self.assertEqual(len(raw), b["size"])
            self.assertLess(len(compressed), len(raw))
            with mock.patch.object(trackdetail, "_view", side_effect=ValueError("source changed")):
                with self.assertRaisesRegex(ValueError, "source changed"):
                    trackdetail.weight_bundle("ac", "copy", "c" * 64)

    def test_http_weight_replies_negotiate_lossless_encoding(self):
        raw = b"DDS " + bytes(range(256)) * 20
        for accept, encoded in [("gzip, deflate, br", True), ("gzip;q=0, br", False), ("", False)]:
            handler = object.__new__(server.Handler)
            handler.command = "GET"; handler.close_connection = False
            handler.headers = {"Accept-Encoding": accept}
            handler.send_response = mock.Mock(); handler.send_header = mock.Mock()
            handler.end_headers = mock.Mock(); handler.wfile = io.BytesIO()
            handler._send_weights(gzip.compress(raw, mtime=0), "image/vnd-ms.dds")
            body = handler.wfile.getvalue()
            self.assertEqual(raw, gzip.decompress(body) if encoded else body)
            headers = dict(handler.send_header.call_args_list[i].args for i in range(handler.send_header.call_count))
            self.assertEqual("Accept-Encoding", headers["Vary"])
            self.assertEqual("gzip" if encoded else None, headers.get("Content-Encoding"))
            self.assertEqual(str(len(body)), headers["Content-Length"])


if __name__ == "__main__":
    unittest.main()
