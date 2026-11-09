import {expect, test} from "bun:test";
import {WeightBundles} from "./weightBundle";
import {TrackView} from "./view";
import * as THREE from "three";
import type {ColourImage} from "./colourBlend";

test("one tile transfer retains exact individual bytes and releases its temporary memory", async () => {
  const before = globalThis.fetch, calls: string[] = [];
  const raw = new Uint8Array([1, 2, 3, 4, 5, 6]);
  globalThis.fetch = (async url => { calls.push(String(url)); return new Response(raw); }) as typeof fetch;
  let reserved = 0;
  const bundles = new WeightBundles(bytes => { reserved += bytes; return true; }, bytes => { reserved -= bytes; });
  const a = new AbortController(), b = new AbortController();
  const first = bundles.acquire({url: "/tile", offset: 0, size: 6}, 2, a.signal)!;
  const second = bundles.acquire({url: "/tile", offset: 2, size: 6}, 4, b.signal)!;
  try {
    expect(reserved).toBe(6);
    expect([...new Uint8Array(await first.read())]).toEqual([1, 2]);
    first.release(); expect(reserved).toBe(6);
    expect([...new Uint8Array(await second.read())]).toEqual([3, 4, 5, 6]);
    second.release(); expect(reserved).toBe(0); expect(calls).toEqual(["/tile"]);
  } finally { first.release(); second.release(); globalThis.fetch = before; }
});

test("cancelled consumers cannot cancel another material; last cancellation aborts the shared transfer", async () => {
  const before = globalThis.fetch;
  let signal!: AbortSignal, reserved = 0;
  globalThis.fetch = (async (_url, init) => { signal = init!.signal!; return new Promise(() => {}); }) as typeof fetch;
  const bundles = new WeightBundles(bytes => { reserved += bytes; return true; }, bytes => { reserved -= bytes; });
  const a = new AbortController(), b = new AbortController();
  const first = bundles.acquire({url: "/tile", offset: 0, size: 6}, 2, a.signal)!;
  const second = bundles.acquire({url: "/tile", offset: 2, size: 6}, 4, b.signal)!;
  try {
    const pending = first.read();
    a.abort(); expect(signal.aborted).toBe(false);
    b.abort(); expect(signal.aborted).toBe(true); expect(reserved).toBe(0);
    await expect(pending).rejects.toThrow();
    expect(new WeightBundles(() => false, () => {}).acquire({url: "/too-large", offset: 0, size: 6}, 2, new AbortController().signal)).toBeNull();
  } finally { first.release(); second.release(); a.abort(); b.abort(); globalThis.fetch = before; }
});

test("the View loads two regional textures from one bundle and keeps only their own bytes", async () => {
  const before = globalThis.fetch;
  const raw = new ArrayBuffer(28);
  for (let offset = 0; offset < 28; offset += 14) {
    const header = new DataView(raw, offset, 14);
    header.setUint32(0, 0x5747324d, true); header.setUint32(4, 1, true); header.setUint32(8, 1, true);
    header.setUint16(12, offset ? 0x3800 : 0x3c00, true);
  }
  let calls = 0;
  globalThis.fetch = (async () => { calls++; return new Response(raw); }) as unknown as typeof fetch;
  const view = Object.create(TrackView.prototype) as TrackView;
  const fields = {token: 1, loading: new AbortController(), usedBytes: 0, settings: {memoryGb: 1},
    renderer: {capabilities: {getMaxAnisotropy: () => 1}}, splatImages: new Map(), data: {textures: []}};
  Object.assign(view, fields);
  const state = view as unknown as typeof fields & {splatTexture: (ref: ColourImage, data: unknown, keys: Set<string>) => Promise<THREE.DataTexture>};
  try {
    const refs = [0, 14].map((offset, i) => ({name: `${i}.r16`, key: `${i}`, url: `/old/${i}`, linear: true, size: 14,
      bundle: {url: "/tile", offset, size: 28}}));
    const textures = await Promise.all(refs.map(ref => state.splatTexture(ref, fields.data, new Set())));
    expect(calls).toBe(1); expect(state.usedBytes).toBe(56);
    expect(textures.map(texture => texture.image.data![0])).toEqual([0x3c00, 0x3800]);
    expect(textures.map(texture => texture.image.data!.buffer.byteLength)).toEqual([14, 14]);
    for (const texture of textures) texture.dispose();
  } finally { fields.loading.abort(); globalThis.fetch = before; }
});
