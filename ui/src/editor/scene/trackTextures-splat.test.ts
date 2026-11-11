import {expect, test} from "bun:test";
import * as THREE from "three";
import {fakeTextures} from "./trackTextures.fixture";
import {materialImages, type ColourSplat} from "./colourBlend";

function dds() {
  const bytes = new ArrayBuffer(136), h = new Int32Array(bytes, 0, 31);
  h[0] = 0x20534444; h[1] = 124; h[2] = 0x81007; h[3] = h[4] = 4;
  h[7] = 1; h[19] = 32; h[20] = 4; h[21] = 0x31545844;
  return bytes;
}

function setup() {
  const base = new THREE.CompressedTexture([{data: new Uint8Array(8), width: 4, height: 4}], 4, 4, THREE.RGB_S3TC_DXT1_Format);
  const material = new THREE.MeshLambertMaterial({map: base});
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material); mesh.userData.info = {material: 0};
  const {textures, view, inside} = fakeTextures({used: 272, meshes: [mesh], data: {revision: "source", paints: [],
    textures: [{name: "ground_0_0.dds", size: 136, source_size: 136}],
    materials: [{name: "ground_0_0", shader: "ksPerPixel", texture: "ground_0_0.dds", bright: 1, alpha_ref: 0, blend: false}]}});
  Object.assign(inside, {materials: [material], pool: [Promise.resolve(base)], textureBytes: new WeakMap([[base, 272]])});
  const layer: ColourSplat = {base: {i: 0, name: "ground_0_0.dds"}, origin: [1, 0],
    mask: {name: "mask.dds", key: "mask", size: 136, url: "/mask", linear: true},
    images: [{name: "photo.dds", key: "photo", size: 136, url: "/photo", scale: [128, 256 / 3]}]};
  return {textures, view, inside, layer, base, mesh};
}

test("splat image accounting includes masks, repeated photos and the retained original tile", () => {
  const {layer} = setup();
  expect(materialImages({texture: "ignored", splat: layer})).toEqual(["ground_0_0.dds", "mask.dds", "photo.dds"]);
});

test("lossless RGBA DDS masks load as data textures with their channel weights intact", async () => {
  const {textures, inside, layer} = setup(), before = globalThis.fetch;
  const raw = new ArrayBuffer(128 + 64), h = new Int32Array(raw, 0, 31);
  h[0] = 0x20534444; h[1] = 124; h[2] = 0x2100f; h[3] = h[4] = 4; h[5] = 16; h[7] = 1;
  h[19] = 32; h[20] = 0x41; h[22] = 32; h[23] = 0xff0000; h[24] = 0xff00; h[25] = 0xff; h[26] = -16777216;
  const bytes = new Uint8Array(raw);
  for (let p = 128; p < bytes.length; p += 4) bytes[p + 2] = 255;
  layer.mask.size = raw.byteLength;
  globalThis.fetch = (async input => new Response(String(input) === "/mask" ? raw : dds())) as typeof fetch;
  try {
    textures.refreshPaints([{i: 0, size: 136, version: "paint", materials: [0], layers: layer}], ["paint"]);
    await textures.ready();
    const shader = {uniforms: {}, vertexShader: "", fragmentShader: "#include <map_pars_fragment>\n#include <map_fragment>"} as
      Parameters<THREE.MeshLambertMaterial["onBeforeCompile"]>[0];
    inside.materials[0].onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    const mask = shader.uniforms.m2lKeep.value as THREE.DataTexture;
    expect(mask.isDataTexture).toBe(true);
    expect([...(mask.mipmaps[0] as {data: Uint8Array}).data.slice(0, 4)]).toEqual([255, 0, 0, 0]);
  } finally {
    textures.refreshPaints([{i: 0, size: 136, version: "", materials: [0]}], []);
    globalThis.fetch = before;
  }
});

test("Apply can retry the same retained paint after a failed image download", async () => {
  const {textures, layer} = setup(), before = globalThis.fetch;
  let failed = true;
  globalThis.fetch = (async input => {
    if (String(input) === "/photo" && failed) return new Response("invalid material", {status: 400});
    if (String(input).endsWith("/textures")) return new Response(JSON.stringify({textures: [{i: 0, size: 136, version: "paint", materials: [0], layers: layer}]}));
    return new Response(dds());
  }) as typeof fetch;
  try {
    textures.refreshPaints([{i: 0, size: 136, version: "paint", materials: [0], layers: layer}], ["paint"]);
    await expect(textures.ready()).rejects.toThrow();
    failed = false;
    await textures.syncPaints(["paint"]);
    await textures.ready();
    expect(textures.version(0)).toBe("paint");
  } finally {
    textures.refreshPaints([{i: 0, size: 136, version: "", materials: [0]}], []);
    globalThis.fetch = before;
  }
});

test("normal Apply binds full-resolution colour and raw mask separately; Undo frees extra images and Redo restores them", async () => {
  const {textures, view, inside, layer, base, mesh} = setup();
  const before = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = (async input => { requests.push(String(input)); return new Response(dds()); }) as typeof fetch;
  try {
    const descriptor = {i: 0, size: 136, version: "paint", materials: [0], layers: layer};
    textures.refreshPaints([descriptor], ["paint"]);
    await textures.ready();
    expect(requests.sort()).toEqual(["/mask", "/photo"]);
    expect(view.used).toBe(816);
    expect(inside.materials[0].map).toBe(base);
    expect(mesh.material).toBe(inside.materials[0]);
    const shader = {uniforms: {}, vertexShader: "", fragmentShader: "#include <map_pars_fragment>\n#include <map_fragment>"} as
      Parameters<THREE.MeshLambertMaterial["onBeforeCompile"]>[0];
    inside.materials[0].onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    expect((shader.uniforms.m2lOrigin.value as THREE.Vector2).toArray()).toEqual([1, 0]);
    expect((shader.uniforms.m2lScale0.value as THREE.Vector2).toArray()).toEqual([128, 256 / 3]);
    expect((shader.uniforms.m2lKeep.value as THREE.Texture).colorSpace).toBe(THREE.NoColorSpace);
    expect(textures.version(0)).toBe("paint");
    textures.refreshPaints([{i: 0, size: 136, version: "", materials: [0]}], []);
    await textures.ready();
    expect(view.used).toBe(272);
    expect(inside.materials[0].map).toBe(base);
    expect(inside.materials[0].customProgramCacheKey()).not.toContain("splat");
    textures.refreshPaints([descriptor], ["paint"]);
    await textures.ready();
    expect(view.used).toBe(816);
    textures.refreshPaints([{i: 0, size: 136, version: "", materials: [0]}], []);
    await textures.ready();
  } finally { globalThis.fetch = before; base.dispose(); mesh.geometry.dispose(); for (const m of inside.materials) m.dispose(); }
});

test("a late mask cannot replace a newer material and obsolete allocations are released", async () => {
  const {textures, view, inside, layer, base, mesh} = setup();
  const before = globalThis.fetch;
  const pending = new Map<string, (r: Response) => void>();
  globalThis.fetch = (async input => new Promise<Response>(resolve => pending.set(String(input), resolve))) as typeof fetch;
  try {
    textures.refreshPaints([{i: 0, size: 136, version: "one", materials: [0], layers: layer}], ["one"]);
    await new Promise(r => setTimeout(r, 0));
    const newer = {...layer, mask: {...layer.mask, key: "mask2", url: "/mask2"}};
    textures.refreshPaints([{i: 0, size: 136, version: "two", materials: [0], layers: newer}], ["two"]);
    await new Promise(r => setTimeout(r, 0));
    pending.get("/photo")!(new Response(dds())); pending.get("/mask2")!(new Response(dds()));
    await textures.ready();
    pending.get("/mask")!(new Response(dds()));
    await new Promise(r => setTimeout(r, 0));
    expect(textures.version(0)).toBe("two");
    expect(view.used).toBe(816);
    textures.refreshPaints([{i: 0, size: 136, version: "", materials: [0]}], []);
    await textures.ready();
    expect(view.used).toBe(272);
  } finally { globalThis.fetch = before; base.dispose(); mesh.geometry.dispose(); for (const m of inside.materials) m.dispose(); }
});
