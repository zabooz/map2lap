"""The Editor on tracks whose ground tile textures lie at the world's phase (ground.phased): their mesh UVs are world tiles
times groundmaterial.UV_SCALE, while the Editor's masks cover the whole tile, so every mask lookup takes the tile's own UV;
and a painted Save samples the build's tile image itself in world X/Z, with no copy of it."""
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np
from PIL import Image

import test_trackpaint as paintfixture
from test_trackcopy import Base
from app import paintimage, trackcopy, tracknative, trackview
from track import editorinfo, groundmaterial, kn5, make_obj, obj_to_kn5
from track.textures import ring_indices

SCALE = 3 / 4           # (exaggerated: a 31/32 scale moves a click by less than one pixel of a small test mask)


def with_props(path, props, index=0):
    """The kn5 at path with props added to its material index (before the build facts bind to the kn5's state)."""
    data = kn5.read(str(path))
    m = data["materials"][index]
    data["materials"][index] = kn5.Material(m.name, m.shader, m.blend, m.alpha_tested, m.depth_mode, [*m.props, *props], m.maps)
    kn5.write(str(path), [(t[0], t[2]) for t in data["textures"]], data["materials"], data["root"])


class MarkTest(unittest.TestCase):
    def test_a_build_marks_its_ground_materials_with_world_uvs_and_their_scale_and_nothing_else(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name in ("ground_0_0", "water"):
                Image.new("RGB", (16, 16), (65, 110, 40)).save(root / (name + ".jpg"))
            (root / "t_0_0.mtl").write_text("".join(f"newmtl {n}\nmap_Kd {n}.jpg\n" for n in ("ground_0_0", "water")))
            part = root / "t_0_0.obj"
            obj = make_obj.Obj(str(part))
            for i, (mesh, material) in enumerate((("1ROAD_ground_0_0", "ground_0_0"), ("nocol_water_0_0", "water"))):
                obj.add(mesh, material, np.array([[i * 4, 0, 0], [i * 4 + 2, 0, 0], [i * 4, 2, 0]], float),
                        np.array([[0, 0], [1, 0], [0, 1]], float), np.array([[0, 1, 2]]))
            obj.close()
            obj_to_kn5.convert(str(part), str(root / "t.kn5"), parts=[str(part)], log=lambda _: None)
            materials = {m.name: m for m in kn5.read(str(root / "t.kn5"))["materials"]}
        self.assertEqual(groundmaterial.UV_SCALE, trackview._prop(materials["ground_0_0"], "m2lUVScale", 0))
        self.assertEqual(1, trackview._prop(materials["ground_0_0"], "m2lUVGlobal", 0))
        self.assertEqual(0, trackview._prop(materials["ground_0_0"], "m2lUVGuard", 0))
        self.assertEqual(0, trackview._prop(materials["water"], "m2lUVScale", 0))


class TileUvTest(unittest.TestCase):
    def test_a_phased_uv_goes_back_to_the_whole_tile(self):
        u, v = trackview.tile_uv(SCALE * 3.03, -SCALE * -1.1, SCALE, True, 3, -2)    # (kn5 stores v negated)
        self.assertAlmostEqual(0.03, u)
        self.assertAlmostEqual(-0.9, v)

    def test_unscaled_local_and_global_uvs_stay_as_they_were(self):
        self.assertEqual((0.25, -0.5), trackview.tile_uv(0.25, -0.5, 1, False, 3, 4))
        self.assertEqual((0.25, -0.5), trackview.tile_uv(3.25, -4.5, 1, True, 3, 4))

    def test_a_track_built_with_the_old_guard_is_to_be_built_again(self):
        material = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0, [("m2lUVGuard", 1 / 64, (0, 0), (0, 0, 0), (0, 0, 0, 0))], [])
        with self.assertRaisesRegex(ValueError, "built again"):
            trackview.material_uv(material, 0, 0, .5, -.5)


class PhasedSelectTest(Base):
    def setUp(self):
        super().setUp()
        part = os.path.join(self.ac, "t_0_0.obj")
        paint = editorinfo.Paint(part, 0, 0, 64)
        ids = np.ones((64, 64), np.uint8)
        ids[:, :4] = 0                              # the tile's west 4 m of 64: a road along its edge
        paint.base(["road_asphalt", "gc_meadow"], ids)
        paint.finish()
        with_props(self.kn5, groundmaterial.uv_props(SCALE))
        editorinfo.install(self.kn5, [part])

    def test_a_click_near_the_tile_edge_selects_what_lies_there(self):
        u = 0.03 * SCALE                            # the road, 0.03 of the tile in from its west edge
        revision = trackview.index(self.ac, "t")["revision"]
        self.assertEqual("road_asphalt", trackview.surface(self.ac, "t", 0, u, -0.5 * SCALE, revision)["material"])
        # 0.08 of the tile in: the meadow, though the UV is 0.06, where the road lies in a tile's own UVs
        self.assertEqual("gc_meadow", trackview.surface(self.ac, "t", 0, 0.08 * SCALE, -0.5 * SCALE, revision)["material"])


class PhasedLayoutTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    material = paintfixture.PaintTest.material
    operation = paintfixture.PaintTest.operation
    keep = paintfixture.PaintTest.keep

    def test_the_painted_preview_learns_the_scale_of_its_source_tile(self):
        with_props(self.path, groundmaterial.uv_props(SCALE))
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        trackview.prepare_surface(self.ac, self.name, 0, self.revision)
        descriptor = self.keep([self.operation(self.material((200, 30, 40)), u=.1 * SCALE, v=-.5 * SCALE)])["textures"][0]
        self.assertEqual(SCALE, descriptor["layers"]["uv_scale"])
        self.assertEqual([SCALE, SCALE], descriptor["layers"]["base_scale"])      # (the page reads a pair: ColourSplat.base_scale)


class PhasedCompositeTest(unittest.TestCase):
    def composite(self, tile):
        with tempfile.TemporaryDirectory() as tmp:
            red = Path(tmp, "red.png")
            Image.new("RGB", (4, 4), (255, 0, 0)).save(red)
            original, mask = Image.new("RGB", (64, 64), (0, 255, 0)), Image.new("L", (64, 64), 0)
            mask.paste(255, (0, 0, 8, 64))                  # the tile's west eighth (its masks cover the whole tile)
            raw = {}
            for name, image in (("original", original), ("mask", mask)):
                output = io.BytesIO()
                image.save(output, "PNG")
                raw[name] = output.getvalue()
            pixels, _touched = paintimage.composite(raw["original"], tile, [(1, "grass", raw["mask"])], {1: (str(red), (2, 2))},
                                                    scale=48 / 64)
        return np.flatnonzero(pixels[32, :, 0] > 128).tolist()

    def test_a_colour_painted_on_the_tile_lands_where_the_phased_texture_holds_it(self):
        # The texture's inside is 48 px for the tile's 64: its west eighth is 6 px, from the column of world pixel
        # 48 * tx modulo 64, after the 8 px of the ring that repeat it (the other 8 repeat the east edge).
        self.assertEqual([*range(0, 6), *range(56, 64)], self.composite((0, 0)))
        self.assertEqual(list(range(40, 54)), self.composite((1, 0)))


def wrapped(image, u, v):
    """Bilinear RGB of image (H, W, 3) at kn5 UV (u, v), repeating, as AC samples a material's detail image. Pure."""
    h, w = image.shape[:2]
    x, y = u * w - .5, v * h - .5
    x0, y0 = int(np.floor(x)), int(np.floor(y))
    fx, fy = x - x0, y - y0
    g = lambda r, c: image[r % h, c % w].astype(np.float64)  # noqa: E731
    return g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy


def layer_mult(material, channel):
    """The float2 multiplier nm4 samples a layer of channel at: the mesh UV times it. Pure."""
    return np.array(next(p[2] for p in material.props if p[0] == "mult" + channel), np.float64)


def phased(inside, tx, size=32):
    """inside (n, n, 3), a tile's image, on the size px phased texture of tile (tx, 0) (ground.phased). Pure."""
    xs, ys = ring_indices(inside.shape[1], inside.shape[0], (tx, 0), (size, size))
    return inside[ys[:, None], xs[None, :]]


class PhasedSaveTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    material = paintfixture.PaintTest.material
    operation = paintfixture.PaintTest.operation
    keep = paintfixture.PaintTest.keep
    def quad(self, native, tx, inside, scale):
        """Tile tx as one quad over the whole tile, its phased texture of scale made of inside. Pure but for native."""
        node = native["root"].children[tx]
        node.vertices = np.zeros(4, kn5.VERTEX)
        node.vertices["pos"] = [(tx * 256, 0, 0), ((tx + 1) * 256, 0, 0), (tx * 256, 0, -256), ((tx + 1) * 256, 0, -256)]
        tile = np.array([(0, 0), (1, 0), (0, -1), (1, -1)], float)
        node.vertices["uv"] = (tile + [tx, 0]) * scale
        node.vertices["normal"] = (0, 1, 0)
        node.indices = np.array([0, 2, 1, 1, 2, 3], "<u2")
        m = native["materials"][tx]
        native["materials"][tx] = kn5.Material(m.name, m.shader, m.blend, m.alpha_tested, m.depth_mode,
                                               [*m.props, *groundmaterial.uv_props(scale)], m.maps)
        return paintfixture.png(phased(inside, tx))

    def build(self, stripes=0, tiles=(0,), scale=SCALE):
        """Tiles as quads, tile 0's image red inside the west edge and blue inside the east one, tile 1's yellow inside a
        black edge, phased at scale (1: a texture of the tile alone); stripes: that many surfaces side by side, west to east,
        to paint apart."""
        native = kn5.read(str(self.path))
        n = round(32 * scale)
        own = {}
        for tx in tiles:
            inside = np.full((n, n, 3), (30, 150, 40), np.uint8)
            inside[:, 0], inside[:, -1] = (255, 0, 0), (0, 0, 255)
            if tx == 1:
                inside = np.pad(np.full((n - 2, n - 2, 3), (250, 250, 0), np.uint8), ((1, 1), (1, 1), (0, 0)))
            own[f"ground_{tx}_0.png"] = self.quad(native, tx, inside, scale)
        textures = [(n_, own.get(n_, raw)) for n_, _a, raw in native["textures"]]
        kn5.write(str(self.path), textures, native["materials"], native["root"])
        for tx in tiles if stripes else ():
            paint = editorinfo.Paint(str(self.folder / f"t_{tx}_0.obj"), tx, 0, 32)
            paint.base([f"field{k}" for k in range(stripes)], np.repeat(np.arange(32) * stripes // 32, 32).reshape(32, 32).T.astype(np.uint8))
            paint.finish()
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for mesh in tiles:
            trackview.prepare_surface(self.ac, self.name, mesh, self.revision)
        self.original = own

    def copy(self):
        trackcopy.save(self.ac, self.name, "copy", "Copy")
        return kn5.read(str(Path(self.ac, "content/tracks/copy/copy.kn5")))

    def assert_no_copy_of_the_tile_images(self, saved):
        names = [n for n, _a, _raw in saved["textures"]]
        for name, raw in self.original.items():
            self.assertEqual(1, sum(n.startswith(Path(name).stem) for n in names), names)
            self.assertEqual(raw, next(r for n, _a, r in saved["textures"] if n == name), f"{name} changed")
        masks = {name for m in saved["materials"] for slot, _i, name in m.maps if slot == "txMask"}
        ringed = [n for n, _a, raw in saved["textures"] if raw[:4] in (b"DDS ", b"\x89PNG") and n not in masks
                  and Image.open(io.BytesIO(raw)).size == (36, 36)]
        self.assertEqual([], ringed)            # (no tile image on a mask's ring canvas)

    def saved(self):
        self.build()
        self.keep([self.operation(self.material((200, 200, 200)), u=.5 * SCALE, v=-.5 * SCALE)])
        with mock.patch.object(tracknative, "_photo_colour", wraps=tracknative._photo_colour) as encode:
            saved = self.copy()
        self.assertFalse([c for c in encode.call_args_list if c.args[1].get("id") == "base"], "the tile image was encoded again")
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        self.assertEqual("ground_0_0.png", next(name for slot, _i, name in material.maps if slot == "txDetailA"))
        self.assert_no_copy_of_the_tile_images(saved)
        return saved

    def test_a_tile_saves_whole_tile_uvs_and_samples_its_own_image_at_its_mesh_uv_with_its_edges(self):
        saved = self.saved()
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        self.assertEqual(0, trackview._prop(material, "m2lUVScale", 0))     # (its mesh UVs are the mask's canvas now)
        self.assertEqual(SCALE, trackview._prop(material, "m2lBaseScale", 0))
        maps = {slot: name for slot, _i, name in material.maps}
        with Image.open(io.BytesIO(next(raw for n, _a, raw in saved["textures"] if n == maps["txDetailA"]))) as image:
            base = np.array(image.convert("RGB"))
        mult = layer_mult(material, "A")         # (nm4 samples the layer at the mesh UV times multA, float2)
        uv = saved["root"].children[0].vertices["uv"].astype(np.float64)
        for k, colour in ((0, 0), (1, 2)):          # tile u 0: red, tile u 1: blue
            sample = wrapped(base, *(uv[k] * mult))
            self.assertGreater(sample[colour], 200, f"vertex {k}: {sample}")
            self.assertLess(sample[2 - colour], 30, f"vertex {k}: {sample}")

    def test_a_saved_copy_tells_the_view_the_scale_of_its_tile_image(self):
        saved = self.saved()
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        self.assertEqual([SCALE, SCALE], trackview._material(material)["splat"]["base_scale"])

    def test_saved_masks_are_bc7(self):
        import struct
        saved = self.saved()
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        name = next(n for slot, _i, n in material.maps if slot == "txMask")
        raw = next(r for n, _a, r in saved["textures"] if n == name)
        self.assertEqual((b"DX10", 98), (raw[84:88], struct.unpack_from("<I", raw, 128)[0]))

    def test_a_track_built_with_the_old_guard_is_not_painted(self):
        from app import trackpaint
        with_props(self.path, [("m2lUVGuard", 1 / 64, (0, 0), (0, 0, 0), (0, 0, 0, 0))])
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        revision = trackview.index(self.ac, self.name)["revision"]
        with self.assertRaisesRegex(ValueError, "built again"):
            trackpaint.create(self.ac, self.name, revision, self.material((200, 30, 40)), [{"mesh": 0, "u": .1, "v": -.5, "whole": False}])

    def regional_edges(self, saved, tile_names, check):
        """check(name, position, colour sampled where nm4 samples it: the mesh UV times the layer's multiplier) for each region
        copy's vertex and triangle centre and each of its layers showing a tile image of tile_names."""
        textures = {n: raw for n, _a, raw in saved["textures"]}
        seen = 0
        for node in kn5.walk_meshes(saved["root"]):
            if "m2l_region" not in node.name:
                continue
            material = saved["materials"][node.material]
            for slot, _i, name in material.maps:
                if not slot.startswith("txDetail") or name not in tile_names:
                    continue
                with Image.open(io.BytesIO(textures[name])) as image:
                    pixels = np.array(image.convert("RGB"))
                mult = layer_mult(material, slot[8])
                self.assertEqual(0, trackview._prop(material, "tilingFix" + slot[8], 1.))      # (the tile image is held fixed)
                pos, uv = node.vertices["pos"].astype(np.float64), node.vertices["uv"].astype(np.float64)
                triangles = np.asarray(node.indices).reshape(-1, 3)
                for point, at in zip([*pos, *pos[triangles].mean(axis=1)], [*uv, *uv[triangles].mean(axis=1)]):
                    seen += check(name, point, wrapped(pixels, *(at * mult)))
        return seen

    def test_two_regional_tiles_saved_together_each_keep_their_own_tile_image(self):
        from app import trackpaint
        self.build(stripes=7, tiles=(0, 1))
        greys = [self.material((60 + 30 * k,) * 3) for k in range(5)]
        self.keep([trackpaint.create(self.ac, self.name, self.revision, asset,
                                     [{"mesh": mesh, "u": (mesh + (k + 1.5) / 7) * SCALE, "v": -.5 * SCALE, "whole": False}])
                   for mesh in (0, 1) for k, asset in enumerate(greys)])
        with mock.patch.object(tracknative, "_photo_colour", wraps=tracknative._photo_colour) as encode:
            saved = self.copy()
        self.assertFalse([c for c in encode.call_args_list if c.args[1].get("id") == "base"], "a tile image was encoded again")
        self.assert_no_copy_of_the_tile_images(saved)

        def check(name, point, sample):
            x, north = point[0], -point[2]
            if not (300 < x < 470 and 40 < north < 216):      # (inside tile 1, off its black edge)
                return 0
            self.assertEqual("ground_1_0.png", name, "tile 1 shows another tile's image")
            self.assertGreater(min(sample[0], sample[1]), 200, f"tile 1 shows another tile's image: {sample}")
            return 1
        self.assertGreater(self.regional_edges(saved, set(self.original), check), 0)

    def test_a_tile_with_more_than_three_materials_saves_regions_whose_tile_image_keeps_its_edges(self):
        self.build(stripes=7)
        greys = [self.material((60 + 30 * k,) * 3) for k in range(5)]
        # (five inner stripes painted: more than three materials; the edge stripes keep the tile image)
        self.keep([self.operation(asset, u=(k + 1.5) / 7 * SCALE, v=-.5 * SCALE) for k, asset in enumerate(greys)])
        saved = self.copy()
        self.assert_no_copy_of_the_tile_images(saved)
        edges = {0: 0, 256: 2}                      # tile u 0 (x 0): red; tile u 1 (x 256): blue
        found = set()

        def check(name, point, sample):
            x = float(point[0])
            if x in edges:
                self.assertGreater(sample[edges[x]], 200, f"{name} at x {x}: {sample}")
                self.assertLess(sample[2 - edges[x]], 30, f"{name} at x {x}: {sample}")
                found.add(x)
            return 0
        self.regional_edges(saved, {"ground_0_0.png"}, check)
        self.assertEqual({0, 256}, found)


if __name__ == "__main__":
    unittest.main()
