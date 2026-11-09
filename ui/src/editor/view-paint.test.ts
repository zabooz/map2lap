import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {GroundFrame, GroundLayer} from "./groundRender";
import type {ColourSplat, GroundMaterial, GroundPass} from "./colourBlend";

test("regional ground shows its original while replacement images are still loading", async () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  const material = new THREE.MeshLambertMaterial(), original = new THREE.Texture();
  let release!: (texture: THREE.Texture) => void;
  const photo = new Promise<THREE.Texture>(resolve => { release = resolve; });
  const fields = {token: 1, loading: new AbortController(), data: {textures: []}, materials: [material], dirty: false,
    splatTexture: (ref: {name: string}) => ref.name === "base" ? Promise.resolve(original) : photo,
    pruneSplatImages: () => {}, onViewFailed: () => {}};
  Object.assign(view, fields);
  const state = view as unknown as typeof fields & {
    prepareGround: (k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) => void;
    splatPending: Map<number, {done: Promise<void>}>;
  };
  const layers: ColourSplat = {base: {name: "base"}, mask: {name: "unused"},
    images: [{name: "photo", scale: [128, 128]}], origin: [0, 0],
    ground: {dimensions: [2048, 2048], uv_origin: [0, 0], bytes: 0, split: 0, passes: []}};
  let committed = false;
  state.prepareGround(0, material, layers, () => { committed = true; });
  const pending = state.splatPending.get(0)!.done;
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(material.map).toBe(original);
    expect(state.dirty).toBe(true);
    expect(committed).toBe(false);
  } finally {
    state.token++; release(original); await pending;
    material.dispose(); original.dispose();
  }
});

test("regional Apply uses the View budget and refuses a replacement before changing the displayed ground", async () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  const geometry = new THREE.PlaneGeometry(256, 256, 8, 8), sourceMaterial = new THREE.MeshLambertMaterial();
  const mesh = new THREE.Mesh(geometry, sourceMaterial); mesh.userData.info = {material: 0};
  const texture = new THREE.Texture(), failures: string[] = [];
  const fields = {token: 1, loading: new AbortController(), trackName: "test", data: {textures: []}, scene: new THREE.Scene(),
    renderer: {capabilities: {maxSamples: 4}, getDrawingBufferSize: (out: THREE.Vector2) => out.set(10, 10)},
    settings: {memoryGb: 1}, usedBytes: 0, meshes: [mesh], materials: [sourceMaterial], textureChanges: new Map(),
    splatTexture: async () => texture, pruneSplatImages: () => {}, onViewFailed: (m: string) => failures.push(m)};
  Object.assign(view, fields);
  const state = view as unknown as typeof fields & {groundFrame: GroundFrame; groundLayers: Map<number, GroundLayer>;
    prepareGround: (k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) => void};
  const pass: GroundPass = {image: -1, first: 0, bounds: [.25, .25, .5, .5], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}], weight: {name: "uniform", size: 0}};
  const layers: ColourSplat = {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0, passes: [pass]}};
  const first = new THREE.MeshLambertMaterial();
  let commits = 0;
  state.prepareGround(0, first, layers, () => { commits++; state.materials[0] = first; mesh.material = first; });
  await view.texturesReady();
  const oldLayer = state.groundLayers.get(0)!, oldScene = [...state.groundFrame.scene.children], oldMap = first.map;
  const region = ((oldScene[0] as THREE.Mesh).children[0] as THREE.Mesh).geometry;
  const bytes = 6000 + 2 * region.getIndex()!.array.byteLength;
  expect(state.usedBytes).toBe(bytes);
  state.settings.memoryGb = (bytes + 1) / 1024 ** 3;
  state.prepareGround(0, new THREE.MeshLambertMaterial(), layers, () => { commits++; });
  await expect(view.texturesReady()).rejects.toThrow("memory");
  expect(commits).toBe(1); expect(failures).toHaveLength(1);
  expect(state.groundLayers.get(0)).toBe(oldLayer); expect(state.groundFrame.scene.children).toEqual(oldScene);
  expect(mesh.material).toBe(first); expect(first.map).toBe(oldMap); expect(state.usedBytes).toBe(bytes);
  oldLayer!.dispose(); state.groundFrame.dispose(); expect(state.usedBytes).toBe(0);
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
  const view = Object.create(TrackView.prototype) as TrackView;
  const fields = {token: 1, trackName: "test", data: {revision: "source", textures: [{name: "ground_0_0.dds", size: 136, source_size: 136}], paints: []},
    textures: [Promise.resolve(old)], materials: [material], usedBytes: 272, textureBytes: new WeakMap([[old, 272]]), textureChanges: new Map(),
    loading: new AbortController(), renderer: {capabilities: {getMaxAnisotropy: () => 1}}, settings: {memoryGb: 1}, alphaOf: new Map(),
    onViewFailed: (message: string | null) => { if (message) throw new Error(message); }, paintVersion: 0};
  Object.assign(view, fields);
  try {
    view.refreshPaints([{i: 0, size: 136, version: "a"}], ["first"]);
    await new Promise(r => setTimeout(r, 0));
    view.refreshPaints([{i: 0, size: 136, version: "b"}], ["second"]);
    await new Promise(r => setTimeout(r, 0));
    expect(pending.size).toBe(2);
    pending.get("b")!(new Response(dds(42)));
    await view.texturesReady();
    pending.get("a")!(new Response(dds(99)));
    await new Promise(r => setTimeout(r, 0));
    expect(material.map).toBe(old);
    expect(old.mipmaps[0].data[0]).toBe(42);
    expect((view as unknown as typeof fields).usedBytes).toBe(272);
    expect(fields.textureChanges.size).toBe(0);
  } finally { globalThis.fetch = before; old.dispose(); material.dispose(); }
});

test("failed downloads keep the displayed version and the same requested version can be retried", async () => {
  const old = new THREE.CompressedTexture([{data: new Uint8Array(8), width: 4, height: 4}], 4, 4, THREE.RGB_S3TC_DXT1_Format);
  const failures: string[] = [];
  const view = Object.create(TrackView.prototype) as TrackView;
  const settings = {memoryGb: 0};
  Object.assign(view, {token: 1, trackName: "test", data: {revision: "source", textures: [{name: "ground_0_0.dds", size: 136}], paints: []},
    textures: [Promise.resolve(old)], materials: [], usedBytes: 272, textureBytes: new WeakMap([[old, 272]]), textureChanges: new Map(),
    loading: new AbortController(), renderer: {capabilities: {getMaxAnisotropy: () => 1}}, settings, alphaOf: new Map(),
    onViewFailed: (message: string) => failures.push(message), paintVersion: 0});
  const before = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = (async () => { requests++; return new Response(dds(42)); }) as unknown as typeof fetch;
  try {
    view.refreshPaints([{i: 0, size: 136, version: "a"}], ["first"]);
    await expect(view.texturesReady()).rejects.toThrow("memory");
    expect(view.textureVersion(0)).toBe("");
    expect(failures.length).toBe(1);
    settings.memoryGb = 1;
    view.refreshPaints([{i: 0, size: 136, version: "a"}], ["first"]);
    await view.texturesReady();
    expect(requests).toBe(1);
    expect(view.textureVersion(0)).toBe("a");
    expect(old.mipmaps[0].data[0]).toBe(42);
    expect((view as unknown as {usedBytes: number}).usedBytes).toBe(272);
  } finally { globalThis.fetch = before; old.dispose(); }
});

test("A to B to A can cancel two downloads and still display A", async () => {
  const old = new THREE.CompressedTexture([{data: new Uint8Array(8), width: 4, height: 4}], 4, 4, THREE.RGB_S3TC_DXT1_Format);
  const pending: {version: string; answer: (r: Response) => void}[] = [];
  const before = globalThis.fetch;
  globalThis.fetch = (async input => new Promise<Response>(answer => pending.push({version: String(input).split("&p=")[1] ?? "", answer}))) as typeof fetch;
  const view = Object.create(TrackView.prototype) as TrackView;
  Object.assign(view, {token: 1, trackName: "test", data: {revision: "source", textures: [{name: "ground_0_0.dds", size: 136}], paints: []},
    textures: [Promise.resolve(old)], materials: [], usedBytes: 272, textureBytes: new WeakMap([[old, 272]]), textureChanges: new Map(),
    loading: new AbortController(), renderer: {capabilities: {getMaxAnisotropy: () => 1}}, settings: {memoryGb: 1}, alphaOf: new Map(),
    onViewFailed: (message: string) => { throw new Error(message); }, paintVersion: 0});
  try {
    for (const version of ["a", "b", "a"]) {
      view.refreshPaints([{i: 0, size: 136, version}], [version]);
      await new Promise(r => setTimeout(r, 0));
    }
    pending[2].answer(new Response(dds(42)));
    await view.texturesReady();
    pending[0].answer(new Response(dds(99))); pending[1].answer(new Response(dds(11)));
    await new Promise(r => setTimeout(r, 0));
    expect(view.textureVersion(0)).toBe("a");
    expect(old.mipmaps[0].data[0]).toBe(42);
    expect((view as unknown as {usedBytes: number}).usedBytes).toBe(272);
  } finally { globalThis.fetch = before; old.dispose(); }
});
