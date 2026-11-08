import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

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
