import {expect, test} from "bun:test";
import * as THREE from "three";
import {fakeTextures} from "./trackTextures.fixture";
import type {GroundFrame} from "./groundRender";
import type {ColourSplat, GroundMaterial, GroundPass} from "./colourBlend";

test("regional ground shows its original while replacement images are still loading", async () => {
  const material = new THREE.MeshLambertMaterial(), original = new THREE.Texture();
  let release!: (texture: THREE.Texture) => void;
  const photo = new Promise<THREE.Texture>(resolve => { release = resolve; });
  const {view, inside} = fakeTextures({data: {textures: []}});
  Object.assign(inside, {materials: [material],
    splatTexture: (ref: {name: string}) => ref.name === "base" ? Promise.resolve(original) : photo, pruneSplatImages: () => {}});
  const state = inside as typeof inside & {prepareGround: (k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) => void};
  const layers: ColourSplat = {base: {name: "base"}, mask: {name: "unused"},
    images: [{name: "photo", scale: [128, 128]}], origin: [0, 0],
    ground: {dimensions: [2048, 2048], uv_origin: [0, 0], bytes: 0, split: 0, passes: []}};
  let committed = false;
  state.prepareGround(0, material, layers, () => { committed = true; });
  const pending = state.splatPending.get(0)!.done;
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(material.map).toBe(original);
    expect(view.dirty).toBe(true);
    expect(committed).toBe(false);
  } finally {
    view.token++; release(original); await pending;
    material.dispose(); original.dispose();
  }
});

test("regional Apply uses the View budget and refuses a replacement before changing the displayed ground", async () => {
  const geometry = new THREE.PlaneGeometry(256, 256, 8, 8), sourceMaterial = new THREE.MeshLambertMaterial();
  const mesh = new THREE.Mesh(geometry, sourceMaterial); mesh.userData.info = {material: 0};
  const texture = new THREE.Texture(), failures: string[] = [];
  const {textures, view, inside} = fakeTextures({data: {textures: []}, meshes: [mesh], failed: message => failures.push(message)});
  Object.assign(inside, {materials: [sourceMaterial], splatTexture: async () => texture, pruneSplatImages: () => {}});
  const state = inside as typeof inside & {groundFrame: GroundFrame; prepareGround: (k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) => void};
  const pass: GroundPass = {image: -1, first: 0, bounds: [.25, .25, .5, .5], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}], weight: {name: "uniform", size: 0}};
  const layers: ColourSplat = {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0, passes: [pass]}};
  const first = new THREE.MeshLambertMaterial();
  let commits = 0;
  state.prepareGround(0, first, layers, () => { commits++; state.materials[0] = first; mesh.material = first; });
  await textures.ready();
  const oldLayer = state.groundLayers.get(0)!, oldScene = [...state.groundFrame.scene.children], oldMap = first.map;
  const region = ((oldScene[0] as THREE.Mesh).children[0] as THREE.Mesh).geometry;
  const bytes = 6000 + 2 * region.getIndex()!.array.byteLength;
  expect(view.used).toBe(bytes);
  view.memoryGb = (bytes + 1) / 1024 ** 3;
  state.prepareGround(0, new THREE.MeshLambertMaterial(), layers, () => { commits++; });
  await expect(textures.ready()).rejects.toThrow("memory");
  expect(commits).toBe(1); expect(failures).toHaveLength(1);
  expect(state.groundLayers.get(0)).toBe(oldLayer); expect(state.groundFrame.scene.children).toEqual(oldScene);
  expect(mesh.material).toBe(first); expect(first.map).toBe(oldMap); expect(view.used).toBe(bytes);
  oldLayer!.dispose(); state.groundFrame.dispose(); expect(view.used).toBe(0);
  expect(geometry.getAttribute("position")).toBeDefined();
});

function dds(colour: number) {
  const bytes = new ArrayBuffer(136), header = new Int32Array(bytes, 0, 31);
  header[0] = 0x20534444; header[1] = 124; header[2] = 0x81007;
  header[3] = header[4] = 4; header[7] = 1; header[19] = 32; header[20] = 4; header[21] = 0x31545844;
  new Uint8Array(bytes)[128] = colour;
  return bytes;
}

test("late texture responses cannot overwrite Undo; bound texture identity and memory remain stable", async () => {
  const old = new THREE.CompressedTexture([{data: new Uint8Array(8), width: 4, height: 4}], 4, 4, THREE.RGB_S3TC_DXT1_Format);
  const material = new THREE.MeshLambertMaterial({map: old});
  const pending = new Map<string, (r: Response) => void>();
  const before = globalThis.fetch;
  globalThis.fetch = (async input => new Promise<Response>(resolve => pending.set(String(input).split("&p=")[1] ?? "", resolve))) as typeof fetch;
  const {textures, view, inside} = fakeTextures({used: 272, data: {revision: "source", textures: [{name: "ground_0_0.dds", size: 136, source_size: 136}], paints: []},
    failed: message => { throw new Error(message); }});
  Object.assign(inside, {pool: [Promise.resolve(old)], materials: [material], textureBytes: new WeakMap([[old, 272]])});
  try {
    textures.refreshPaints([{i: 0, size: 136, version: "a"}], ["first"]);
    await new Promise(r => setTimeout(r, 0));
    textures.refreshPaints([{i: 0, size: 136, version: "b"}], ["second"]);
    await new Promise(r => setTimeout(r, 0));
    expect(pending.size).toBe(2);
    pending.get("b")!(new Response(dds(42)));
    await textures.ready();
    pending.get("a")!(new Response(dds(99)));
    await new Promise(r => setTimeout(r, 0));
    expect(material.map).toBe(old);
    expect(old.mipmaps[0].data[0]).toBe(42);
    expect(view.used).toBe(272);
    expect(inside.textureChanges.size).toBe(0);
  } finally { globalThis.fetch = before; old.dispose(); material.dispose(); }
});

test("failed downloads keep the displayed version and the same requested version can be retried", async () => {
  const old = new THREE.CompressedTexture([{data: new Uint8Array(8), width: 4, height: 4}], 4, 4, THREE.RGB_S3TC_DXT1_Format);
  const failures: string[] = [];
  const {textures, view, inside} = fakeTextures({used: 272, memoryGb: 0, failed: message => failures.push(message),
    data: {revision: "source", textures: [{name: "ground_0_0.dds", size: 136}], paints: []}});
  Object.assign(inside, {pool: [Promise.resolve(old)], textureBytes: new WeakMap([[old, 272]])});
  const before = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = (async () => { requests++; return new Response(dds(42)); }) as unknown as typeof fetch;
  try {
    textures.refreshPaints([{i: 0, size: 136, version: "a"}], ["first"]);
    await expect(textures.ready()).rejects.toThrow("memory");
    expect(textures.version(0)).toBe("");
    expect(failures.length).toBe(1);
    view.memoryGb = 1;
    textures.refreshPaints([{i: 0, size: 136, version: "a"}], ["first"]);
    await textures.ready();
    expect(requests).toBe(1);
    expect(textures.version(0)).toBe("a");
    expect(old.mipmaps[0].data[0]).toBe(42);
    expect(view.used).toBe(272);
  } finally { globalThis.fetch = before; old.dispose(); }
});

test("A to B to A can cancel two downloads and still display A", async () => {
  const old = new THREE.CompressedTexture([{data: new Uint8Array(8), width: 4, height: 4}], 4, 4, THREE.RGB_S3TC_DXT1_Format);
  const pending: {version: string; answer: (r: Response) => void}[] = [];
  const before = globalThis.fetch;
  globalThis.fetch = (async input => new Promise<Response>(answer => pending.push({version: String(input).split("&p=")[1] ?? "", answer}))) as typeof fetch;
  const {textures, view, inside} = fakeTextures({used: 272, data: {revision: "source", textures: [{name: "ground_0_0.dds", size: 136}], paints: []},
    failed: message => { throw new Error(message); }});
  Object.assign(inside, {pool: [Promise.resolve(old)], textureBytes: new WeakMap([[old, 272]])});
  try {
    for (const version of ["a", "b", "a"]) {
      textures.refreshPaints([{i: 0, size: 136, version}], [version]);
      await new Promise(r => setTimeout(r, 0));
    }
    pending[2].answer(new Response(dds(42)));
    await textures.ready();
    pending[0].answer(new Response(dds(99))); pending[1].answer(new Response(dds(11)));
    await new Promise(r => setTimeout(r, 0));
    expect(textures.version(0)).toBe("a");
    expect(old.mipmaps[0].data[0]).toBe(42);
    expect(view.used).toBe(272);
  } finally { globalThis.fetch = before; old.dispose(); }
});
