"""The Editor on tracks whose ground tile textures have a guard ring (ground.GUARD_PX): their mesh UVs cover only the
texture's inside, while the Editor's masks cover the whole tile, so every mask lookup takes the tile's own UV."""
import io
import os
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

import test_trackpaint as paintfixture
from test_trackcopy import Base
from app import paintimage, trackcopy, trackview
from scenery import ground
from track import editorinfo, groundmaterial, kn5, make_obj, obj_to_kn5

GUARD = 1 / 8           # (exaggerated: a 1/64 guard moves a click by less than one pixel of a small test mask)


class MarkTest(unittest.TestCase):
    def test_a_build_marks_its_ground_materials_with_the_guard_and_nothing_else(self):
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
        self.assertAlmostEqual(ground.GUARD_PX / ground.TEX_PX, trackview._prop(materials["ground_0_0"], "m2lUVGuard", 0))
        self.assertEqual(0, trackview._prop(materials["water"], "m2lUVGuard", 0))


class TileUvTest(unittest.TestCase):
    def test_a_guarded_uv_goes_back_to_the_whole_tile(self):
        guarded = ground.guarded_uv(np.array([[0.03, 0.9]]), 16, 128)[0]
        u, v = trackview.tile_uv(guarded[0], -guarded[1], 16 / 128, False, 0, 0)    # (kn5 stores v negated)
        self.assertAlmostEqual(0.03, u)
        self.assertAlmostEqual(-0.9, v)

    def test_unguarded_and_global_uvs_stay_as_they_were(self):
        self.assertEqual((0.25, -0.5), trackview.tile_uv(0.25, -0.5, 0, False, 3, 4))
        self.assertEqual((0.25, -0.5), trackview.tile_uv(3.25, -4.5, 0, True, 3, 4))


class GuardedSelectTest(Base):
    def setUp(self):
        super().setUp()
        part = os.path.join(self.ac, "t_0_0.obj")
        paint = editorinfo.Paint(part, 0, 0, 64)
        ids = np.ones((64, 64), np.uint8)
        ids[:, :4] = 0                              # the tile's west 4 m of 64: a road along its edge
        paint.base(["road_asphalt", "gc_meadow"], ids)
        paint.finish()
        self.guard(GUARD)
        editorinfo.install(self.kn5, [part])

    def guard(self, fraction):
        """The ground material as a guarded build marks it (before the build facts bind to the kn5's state)."""
        data = kn5.read(self.kn5)
        m = data["materials"][0]
        data["materials"][0] = kn5.Material(m.name, m.shader, m.blend, m.alpha_tested, m.depth_mode,
                                            [*m.props, ("m2lUVGuard", fraction, (0, 0), (0, 0, 0), (0, 0, 0, 0))], m.maps)
        kn5.write(self.kn5, [(t[0], t[2]) for t in data["textures"]], data["materials"], data["root"])

    def test_a_click_near_the_tile_edge_selects_what_lies_there(self):
        u = GUARD + 0.03 * (1 - 2 * GUARD)          # the road, 0.03 of the tile in from its west edge
        revision = trackview.index(self.ac, "t")["revision"]
        self.assertEqual("road_asphalt", trackview.surface(self.ac, "t", 0, u, -0.5, revision)["material"])



class GuardedLayoutTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    material = paintfixture.PaintTest.material
    operation = paintfixture.PaintTest.operation
    keep = paintfixture.PaintTest.keep

    def test_the_painted_preview_learns_the_guard_of_its_source_tile(self):
        native = kn5.read(str(self.path))
        m = native["materials"][0]
        native["materials"][0] = kn5.Material(m.name, m.shader, m.blend, m.alpha_tested, m.depth_mode,
                                              [*m.props, groundmaterial.guard_prop(1 / 64)], m.maps)
        kn5.write(str(self.path), [(t[0], t[2]) for t in native["textures"]], native["materials"], native["root"])
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        trackview.prepare_surface(self.ac, self.name, 0, self.revision)
        descriptor = self.keep([self.operation(self.material((200, 30, 40)))])["textures"][0]
        self.assertEqual(1 / 64, descriptor["layers"]["uv_guard"])



class GuardedCompositeTest(unittest.TestCase):
    def test_a_colour_painted_on_the_tile_lands_on_the_inside_of_a_guarded_texture(self):
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
            pixels, _touched = paintimage.composite(raw["original"], (0, 0), [(1, "grass", raw["mask"])], {1: (str(red), (2, 2))},
                                                    guard=8 / 64)
        red_columns = np.flatnonzero(pixels[32, :, 0] > 128)
        # The texture's inside is 48 px for the tile's 64: its west eighth is 6 px, after the 8 px ring (the ring repeats it).
        self.assertEqual(list(range(0, 14)), red_columns.tolist())



def wrapped(image, u, v):
    """Bilinear RGB of image (H, W, 3) at kn5 UV (u, v), repeating, as AC samples a material's detail image. Pure."""
    h, w = image.shape[:2]
    x, y = u * w - .5, v * h - .5
    x0, y0 = int(np.floor(x)), int(np.floor(y))
    fx, fy = x - x0, y - y0
    g = lambda r, c: image[r % h, c % w].astype(np.float64)  # noqa: E731
    return g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy


class GuardedSaveTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    material = paintfixture.PaintTest.material
    operation = paintfixture.PaintTest.operation
    keep = paintfixture.PaintTest.keep

    def build(self, guard_px, stripes=0):
        """Tile 0 as one quad over the whole tile, its texture red inside the west edge and blue inside the east one,
        guarded by guard_px of 32 (0: a track built before the guard)."""
        native = kn5.read(str(self.path))
        g = guard_px / 32
        node = native["root"].children[0]
        node.vertices = np.zeros(4, kn5.VERTEX)
        node.vertices["pos"] = [(0, 0, 0), (256, 0, 0), (0, 0, -256), (256, 0, -256)]
        tile = np.array([(0, 0), (1, 0), (0, -1), (1, -1)], float)
        node.vertices["uv"] = np.c_[g + tile[:, 0] * (1 - 2 * g), -(g - tile[:, 1] * (1 - 2 * g))]
        node.vertices["normal"] = (0, 1, 0)
        node.indices = np.array([0, 2, 1, 1, 2, 3], "<u2")
        inside = np.full((32 - 2 * guard_px, 32 - 2 * guard_px, 3), (30, 150, 40), np.uint8)
        inside[:, 0], inside[:, -1] = (255, 0, 0), (0, 0, 255)
        image = np.pad(inside, ((guard_px, guard_px), (guard_px, guard_px), (0, 0)), mode="edge")
        textures = [(n, paintfixture.png(image) if n == "ground_0_0.png" else raw) for n, _a, raw in native["textures"]]
        m = native["materials"][0]
        if guard_px:
            native["materials"][0] = kn5.Material(m.name, m.shader, m.blend, m.alpha_tested, m.depth_mode,
                                                  [*m.props, groundmaterial.guard_prop(g)], m.maps)
        kn5.write(str(self.path), textures, native["materials"], native["root"])
        if stripes:             # (that many surfaces side by side, west to east, to paint apart)
            paint = editorinfo.Paint(str(self.folder / "t_0_0.obj"), 0, 0, 32)
            paint.base([f"field{k}" for k in range(stripes)], np.repeat(np.arange(32) * stripes // 32, 32).reshape(32, 32).T.astype(np.uint8))
            paint.finish()
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        trackview.prepare_surface(self.ac, self.name, 0, self.revision)

    def saved(self, guard_px):
        self.build(guard_px)
        self.keep([self.operation(self.material((200, 200, 200)), u=.5, v=-.5)])
        trackcopy.save(self.ac, self.name, "copy", "Copy")
        saved = kn5.read(str(Path(self.ac, "content/tracks/copy/copy.kn5")))
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        # The tile image is replaced in its place, not copied beside the original.
        self.assertEqual("ground_0_0.png", next(name for slot, _i, name in material.maps if slot == "txDetailAAlbedoAO"))
        self.assertEqual(1, sum(n.startswith("ground_0_0") for n, _a, _raw in saved["textures"]))
        return saved

    def assert_edges_keep_their_own_colour(self, saved):
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        self.assertEqual(0, trackview._prop(material, "m2lUVGuard", 0))
        maps = {slot: name for slot, _i, name in material.maps}
        with Image.open(io.BytesIO(next(raw for n, _a, raw in saved["textures"] if n == maps["txDetailAAlbedoAO"]))) as image:
            base = np.array(image.convert("RGB"))
        mult = trackview._prop(material, "multA", 0.)       # (fuPBR samples the layer at world X/Z times multA)
        pos = saved["root"].children[0].vertices["pos"]
        for k, colour in ((0, 0), (1, 2)):          # tile u 0: red, tile u 1: blue
            sample = wrapped(base, pos[k, 0] * mult, (pos[k, 2] - 0.5) * mult)
            self.assertGreater(sample[colour], 200, f"vertex {k}: {sample}")
            self.assertLess(sample[2 - colour], 30, f"vertex {k}: {sample}")

    def test_a_guarded_tile_saves_whole_tile_uvs_and_its_image_with_a_ring_in_their_place(self):
        self.assert_edges_keep_their_own_colour(self.saved(4))

    def test_a_tile_built_before_the_guard_gets_the_ring_at_its_next_save(self):
        self.assert_edges_keep_their_own_colour(self.saved(0))

    def test_two_regional_tiles_saved_together_each_keep_their_own_tile_image(self):
        from app import trackpaint
        self.build(0, stripes=7)
        native = kn5.read(str(self.path))           # (tile 1 as a quad too, its image yellow inside a black edge)
        node = native["root"].children[1]
        node.vertices = np.zeros(4, kn5.VERTEX)
        node.vertices["pos"] = [(256, 0, 0), (512, 0, 0), (256, 0, -256), (512, 0, -256)]
        node.vertices["uv"] = [(0, 0), (1, 0), (0, -1), (1, -1)]
        node.vertices["normal"] = (0, 1, 0)
        node.indices = np.array([0, 2, 1, 1, 2, 3], "<u2")
        yellow = np.pad(np.full((30, 30, 3), (250, 250, 0), np.uint8), ((1, 1), (1, 1), (0, 0)))
        textures = [(n, paintfixture.png(yellow) if n == "ground_1_0.png" else raw) for n, _a, raw in native["textures"]]
        kn5.write(str(self.path), textures, native["materials"], native["root"])
        for tx in (0, 1):
            paint = editorinfo.Paint(str(self.folder / f"t_{tx}_0.obj"), tx, 0, 32)
            paint.base([f"field{k}" for k in range(7)], np.repeat(np.arange(32) * 7 // 32, 32).reshape(32, 32).T.astype(np.uint8))
            paint.finish()
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for mesh in (0, 1):
            trackview.prepare_surface(self.ac, self.name, mesh, self.revision)
        greys = [self.material((60 + 30 * k,) * 3) for k in range(5)]
        self.keep([trackpaint.create(self.ac, self.name, self.revision, asset, [{"mesh": mesh, "u": (k + 1.5) / 7, "v": -.5, "whole": False}])
                   for mesh in (0, 1) for k, asset in enumerate(greys)])
        trackcopy.save(self.ac, self.name, "copy", "Copy")
        saved = kn5.read(str(Path(self.ac, "content/tracks/copy/copy.kn5")))
        textures = {n: raw for n, _a, raw in saved["textures"]}
        seen = 0
        for node in kn5.walk_meshes(saved["root"]):
            if "m2l_region_1_" not in node.name:            # (the copies of tile 1's ground)
                continue
            material = saved["materials"][node.material]
            for slot, _i, name in material.maps:
                with Image.open(io.BytesIO(textures[name])) as image:
                    if not slot.endswith("AlbedoAO") or image.size[0] != 36:      # (the tile image on its ring canvas)
                        continue
                    pixels = np.array(image.convert("RGB"))
                mult = trackview._prop(material, "mult" + slot[8], 0.)     # (fuPBR samples a layer at world X/Z times it)
                inside = [v for v in node.vertices if 300 < v["pos"][0] < 470 and 40 < -v["pos"][2] < 216]
                for vertex in inside:
                    sample = wrapped(pixels, vertex["pos"][0] * mult, vertex["pos"][2] * mult)
                    self.assertGreater(min(sample[0], sample[1]), 200, f"tile 1 shows another tile's image: {sample}")
                    seen += 1
        self.assertGreater(seen, 0)

    def test_saved_masks_are_bc7(self):
        import struct
        saved = self.saved(4)
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        name = next(n for slot, _i, n in material.maps if slot == "txMask")
        raw = next(r for n, _a, r in saved["textures"] if n == name)
        self.assertEqual((b"DX10", 98), (raw[84:88], struct.unpack_from("<I", raw, 128)[0]))

    def test_a_saved_copy_tells_the_view_its_tile_image_lies_on_the_mask_canvas(self):
        saved = self.saved(4)
        material = next(m for m in saved["materials"] if m.name == "ground_0_0")
        splat = trackview._material(material)["splat"]
        self.assertEqual(splat["mask_extent"], splat["base_extent"])

    def test_a_guarded_tile_with_more_than_three_materials_saves_regions_whose_tile_image_keeps_its_edges(self):
        self.build(4, stripes=7)
        greys = [self.material((60 + 30 * k,) * 3) for k in range(5)]
        # (five inner stripes painted: more than three materials; the edge stripes keep the tile image)
        self.keep([self.operation(asset, u=4 / 32 + (k + 1.5) / 7 * 24 / 32, v=-.5) for k, asset in enumerate(greys)])
        trackcopy.save(self.ac, self.name, "copy", "Copy")
        saved = kn5.read(str(Path(self.ac, "content/tracks/copy/copy.kn5")))
        textures = {n: raw for n, _a, raw in saved["textures"]}
        regions = [(node, saved["materials"][node.material]) for node in kn5.walk_meshes(saved["root"]) if "m2l_region" in node.name]
        self.assertTrue(regions)
        edges = {0: 0, 256: 2}                      # tile u 0 (x 0): red; tile u 1 (x 256): blue
        found = set()
        for node, material in regions:
            for slot, _i, name in material.maps:
                if not slot.endswith("AlbedoAO") or name not in textures:
                    continue
                with Image.open(io.BytesIO(textures[name])) as image:
                    pixels = np.array(image.convert("RGB"))
                mult = trackview._prop(material, "mult" + slot[8], 0.)     # (fuPBR samples a layer at world X/Z times it)
                for vertex in node.vertices:
                    x = float(vertex["pos"][0])
                    if x not in edges:
                        continue
                    sample = wrapped(pixels, x * mult, float(vertex["pos"][2]) * mult)
                    if sample[edges[x]] > 200 and sample[1] < 100:     # (the tile image; not white, grey or the field)
                        self.assertLess(sample[2 - edges[x]], 30, f"{name} at x {x}: {sample}")
                        found.add(x)
        self.assertEqual({0, 256}, found)


if __name__ == "__main__":
    unittest.main()
