import {expect, test} from "bun:test";
import * as THREE from "three";
import {makeTexture} from "./texture";

function atlas(magic = 0x5747324d, width = 2, height = 1) {
  const bytes = new ArrayBuffer(16), header = new DataView(bytes);
  header.setUint32(0, magic, true); header.setUint32(4, width, true); header.setUint32(8, height, true);
  new Uint16Array(bytes, 12).set([0x3c00, 0x3800]);
  return bytes;
}

test("regional weight images retain exact half-float values and use unfiltered linear data", async () => {
  const texture = await makeTexture(atlas(), "weights.r16", 8, true) as THREE.DataTexture;
  expect(texture.image.width).toBe(2);
  expect(texture.image.height).toBe(1);
  expect(Array.from(texture.image.data!)).toEqual([0x3c00, 0x3800]);
  expect(texture.colorSpace).toBe(THREE.NoColorSpace);
  expect(texture.minFilter).toBe(THREE.NearestFilter);
  expect(texture.magFilter).toBe(THREE.NearestFilter);
  expect(texture.generateMipmaps).toBe(false);
  expect(texture.flipY).toBe(false);
  texture.dispose();
});

test("a corrupt regional image is refused before it becomes a texture", async () => {
  await expect(makeTexture(atlas(0), "weights.r16", 1, true)).rejects.toThrow("Invalid regional ground atlas");
  await expect(makeTexture(atlas(0x5747324d, 0), "weights.r16", 1, true)).rejects.toThrow("dimensions");
  await expect(makeTexture(atlas(0x5747324d, 3), "weights.r16", 1, true)).rejects.toThrow("dimensions");
});

function rgbaDds(width = 2, height = 2) {
  // (an uncompressed BGRA8 DDS with one level, as dds_weights writes a mask)
  const bytes = new ArrayBuffer(128 + width * height * 4), header = new Int32Array(bytes, 0, 32);
  header[0] = 0x20534444; header[1] = 124; header[2] = 0x1007; header[3] = height; header[4] = width;
  header[19] = 32; header[20] = 0x41; header[22] = 32;
  header[23] = 0xff0000; header[24] = 0xff00; header[25] = 0xff; header[26] = 0xff000000 | 0;
  return bytes;
}

function bc7Dds(width: number, height: number, levels: number) {
  // (a DX10 DDS of BC7_UNORM blocks, as textures.dds_mipmaps writes a tile image with roads)
  let size = 0;
  for (let k = 0, w = width, h = height; k < levels; k++, w = Math.max(1, w >> 1), h = Math.max(1, h >> 1))
    size += Math.ceil(w / 4) * Math.ceil(h / 4) * 16;
  const bytes = new ArrayBuffer(148 + size), header = new Int32Array(bytes, 0, 37);
  header[0] = 0x20534444; header[1] = 124; header[2] = 0xa1007; header[3] = height; header[4] = width; header[7] = levels;
  header[19] = 32; header[20] = 4; header[21] = 0x30315844; header[32] = 98; header[33] = 3; header[35] = 1;
  new Uint8Array(bytes, 148).fill(7);
  return bytes;
}

test("a BC7 tile image goes to the GPU as BPTC blocks with every mip level, as AC draws it", async () => {
  const texture = await makeTexture(bc7Dds(8, 4, 3), "ground_0_0.dds", 8) as THREE.CompressedTexture;
  expect(texture.format).toBe(THREE.RGBA_BPTC_Format);
  expect([texture.image.width, texture.image.height]).toEqual([8, 4]);
  expect((texture.mipmaps as ImageData[]).map(m => [m.width, m.height, m.data.length])).toEqual([[8, 4, 32], [4, 2, 16], [2, 1, 16]]);
  expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
  expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
  texture.dispose();
});

test("an uncompressed weight mask is filtered when the view comes close, as AC filters it", async () => {
  const texture = await makeTexture(rgbaDds(), "map2lap_mask_a.dds", 8, true);
  expect(texture.magFilter).toBe(THREE.LinearFilter);
  expect(texture.minFilter).toBe(THREE.LinearFilter);
  texture.dispose();
});
