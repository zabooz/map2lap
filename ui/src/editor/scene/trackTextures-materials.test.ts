import {expect, test} from "bun:test";
import * as THREE from "three";
import {fakeTextures} from "./trackTextures.fixture";
import type {TrackIndex} from "../types";

function dds() {
  const bytes = new ArrayBuffer(136), header = new Int32Array(bytes, 0, 31);
  header[0] = 0x20534444; header[1] = 124; header[2] = 0x81007;
  header[3] = header[4] = 4; header[7] = 1; header[19] = 32; header[20] = 4; header[21] = 0x31545844;
  return bytes;
}

function fixture(memoryGb = 1) {
  const source = {name: "ground_0_0", shader: "ksPerPixel_dual_layer", texture: "detail.dds", bright: 1, alpha_ref: 0, blend: false,
    dual_layer: {base: "base.dds", mask: "keep.dds", scale: 128}};
  const data = {revision: "source", materials: [source, {...source, name: "ground_1_0"}],
    textures: [{name: "detail.dds", size: 136}, {name: "base.dds", size: 136}, {name: "keep.dds", size: 136, linear: true}]} as unknown as TrackIndex;
  const {textures, view, inside} = fakeTextures({memoryGb});
  const materialOf = (name: string, data: TrackIndex, k: number) => textures.material(name, data, k) as THREE.MeshLambertMaterial;
  const cleanup = async () => {
    for (const promise of inside.pool) (await promise)?.dispose();
    for (const material of inside.materials) material?.dispose();
  };
  return {data, materialOf, view, inside, cleanup};
}

test("dual-layer materials load and share all images, keep mask values linear and leave UVs on shared textures unchanged", async () => {
  const {data, materialOf, view, inside, cleanup} = fixture();
  const before = globalThis.fetch;
  let requested = 0;
  globalThis.fetch = (async () => { requested++; return new Response(dds()); }) as unknown as typeof fetch;
  try {
    const material = materialOf("test", data, 0);
    materialOf("test", data, 1);
    await Promise.all(inside.pool);
    await new Promise(r => setTimeout(r, 0));
    const [detail, base, mask] = await Promise.all(inside.pool);
    expect(requested).toBe(3);
    expect(view.used).toBe(3 * 136 * 2);
    expect(material.map).toBe(detail);
    expect(detail!.repeat.toArray()).toEqual([1, 1]);
    expect(base!.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(mask!.colorSpace).toBe(THREE.NoColorSpace);
    const shader = {uniforms: {}, vertexShader: "", fragmentShader: "#include <map_pars_fragment>\n#include <map_fragment>"} as
      Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    expect(shader.uniforms.m2lBase.value).toBe(base);
    expect(shader.uniforms.m2lKeep.value).toBe(mask);
    expect(shader.uniforms.m2lScale.value).toBe(128);
    expect(shader.fragmentShader).toContain("vMapUv * m2lScale");
    expect(shader.fragmentShader).toContain("mix(");
  } finally { globalThis.fetch = before; await cleanup(); }
});

test("a memory-limited colour blend retains its original base instead of stretching the detail over all ground", async () => {
  const {data, materialOf, view, inside, cleanup} = fixture(400 / 2 ** 30);
  const before = globalThis.fetch;
  globalThis.fetch = (async () => new Response(dds())) as unknown as typeof fetch;
  try {
    const material = materialOf("test", data, 0);
    await Promise.all(inside.pool);
    await new Promise(r => setTimeout(r, 0));
    expect(view.overLimit).toBe(true);
    expect(material.map).toBe(await inside.pool[1]);
    expect(inside.pool[0]).toBeUndefined();
    expect(view.used).toBe(272);
  } finally { globalThis.fetch = before; await cleanup(); }
});

test("textures finishing after a track switch cannot attach to an obsolete material", async () => {
  const {data, materialOf, view, inside, cleanup} = fixture();
  const before = globalThis.fetch;
  const pending: ((answer: Response) => void)[] = [];
  globalThis.fetch = (async () => new Promise<Response>(resolve => pending.push(resolve))) as unknown as typeof fetch;
  try {
    const material = materialOf("test", data, 0);
    await new Promise(r => setTimeout(r, 0));
    view.token++;
    for (const answer of pending) answer(new Response(dds()));
    await Promise.all(inside.pool);
    await new Promise(r => setTimeout(r, 0));
    expect(material.map).toBeNull();
  } finally { globalThis.fetch = before; await cleanup(); }
});

test("bridge asphalt samples in world metres without changing the original UVs or allocating another image", async () => {
  const {data, materialOf, view, inside, cleanup} = fixture();
  const before = globalThis.fetch;
  globalThis.fetch = (async () => new Response(dds())) as unknown as typeof fetch;
  try {
    const source = {...data.materials[0], shader: "ksMultilayer", dual_layer: undefined, world_scale: [.5, .5]};
    const material = materialOf("test", {...data, materials: [source]} as unknown as TrackIndex, 0);
    await Promise.all(inside.pool);
    await new Promise(r => setTimeout(r, 0));
    const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
      fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    expect(shader.vertexShader).toContain("modelMatrix * vec4(transformed, 1.0)");
    expect(shader.fragmentShader).toContain("m2lPosition.xz * m2lScale");
    expect((shader.uniforms.m2lScale.value as THREE.Vector2).toArray()).toEqual([.5, .5]);
    expect(view.used).toBe(272);
    expect(material.map!.repeat.toArray()).toEqual([1, 1]);
  } finally { globalThis.fetch = before; await cleanup(); }
});
