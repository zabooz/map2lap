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
