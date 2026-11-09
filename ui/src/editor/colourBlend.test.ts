import {expect, test} from "bun:test";
import * as THREE from "three";
import {bindSplat, materialImages} from "./colourBlend";
import {TrackView} from "./view";

test("PBR layers use retained linear detail data for tangent normals and roughness under physical lighting", () => {
  const material = new THREE.MeshStandardMaterial({map: new THREE.Texture()});
  const detail = new THREE.Texture();
  bindSplat(material, new THREE.Texture(), [new THREE.Texture()], {
    base: {name: "original"}, mask: {name: "mask"}, origin: [0, 0],
    images: [{name: "photo", scale: [128, 256 / 3], detail: {name: "data", linear: true},
      properties: {roughness: .7, normal_scale: 2}}],
  }, [detail]);
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader,
    fragmentShader: THREE.ShaderLib.standard.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.uniforms.m2lData0.value).toBe(detail);
  expect(shader.fragmentShader).toContain("roughnessFactor = m2lRoughness");
  expect(shader.fragmentShader).toContain("m2lTangentFrame(-vViewPosition, normal, vMapUv)");
  expect(shader.fragmentShader).toContain("mat3 m2lFrame = m2lTangentFrame");
  expect(shader.fragmentShader.indexOf("mat3 m2lFrame =")).toBeLessThan(shader.fragmentShader.indexOf("if (m2lContribution > 0.0)"));
  expect(shader.fragmentShader).toContain("m2lPacked0.xyz * 2.0 - 1.0");
  expect(shader.fragmentShader).toContain("m2lPacked0.a * m2lProperties0.y");
  expect(shader.uniforms.m2lProperties0.value.toArray()).toEqual([2, .7]);
});

test("variation changes imported photo sampling while the source tile and selection mask keep their original UVs", () => {
  const material = new THREE.MeshLambertMaterial({map: new THREE.Texture()});
  bindSplat(material, new THREE.Texture(), [new THREE.Texture()], {
    base: {name: "original"}, mask: {name: "mask"}, origin: [-1, 2], mask_extent: [1.125, 1.125], mask_origin: [-1, 2],
    images: [{name: "photo", scale: [128, 64], variation: true}],
  });
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
    fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.fragmentShader).toContain("m2lVary(m2lPhoto0");
  expect(shader.fragmentShader).toContain("textureGrad(");
  expect(shader.fragmentShader).toContain("texture2D(map, vMapUv).rgb * m2lWeights.a");
  expect(shader.fragmentShader).toContain("texture2D(m2lKeep, (m2lTile + m2lMaskOrigin) / m2lMaskExtent)");
  expect(shader.uniforms.m2lMaskExtent.value.toArray()).toEqual([1.125, 1.125]);
  expect(shader.uniforms.m2lMaskOrigin.value.toArray()).toEqual([-1, 2]);
  expect(shader.vertexShader).toContain("m2lWorldXZ");
  // A two-metre photograph must span several noise cells, rather than repeating ten times inside one 20 m cell.
  expect(shader.uniforms.m2lNoiseFrequency?.value * 2).toBeGreaterThan(1);
  expect(shader.fragmentShader).toContain("m2lWorldXZ * m2lNoiseFrequency");
  expect(material.map!.repeat.toArray()).toEqual([1, 1]);
});

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
    textures: [{name: "detail.dds", size: 136}, {name: "base.dds", size: 136}, {name: "keep.dds", size: 136, linear: true}]};
  const view = Object.create(TrackView.prototype) as TrackView;
  const fields = {token: 1, textures: [] as Promise<THREE.Texture | null>[], materials: [] as THREE.MeshLambertMaterial[],
    usedBytes: 0, textureBytes: new WeakMap(), displayedTextures: new Map(), renderer: {capabilities: {getMaxAnisotropy: () => 1}},
    settings: {memoryGb}, loading: new AbortController(), overLimit: false};
  Object.assign(view, fields);
  const internal = view as unknown as typeof fields & {material(name: string, data: unknown, k: number): THREE.MeshLambertMaterial};
  const cleanup = async () => {
    for (const promise of internal.textures) (await promise)?.dispose();
    for (const material of internal.materials) material?.dispose();
  };
  return {data, internal, cleanup};
}

test("loading progress includes the base and keep mask, sharing images used by several slots", () => {
  expect(materialImages({texture: "detail", dual_layer: {base: "base", mask: "keep", scale: 128}})).toEqual(["detail", "base", "keep"]);
  expect(materialImages({texture: "same", dual_layer: {base: "same", mask: "keep", scale: 1}})).toEqual(["same", "keep"]);
  expect(materialImages(undefined)).toEqual([]);
});

test("dual-layer materials load and share all images, keep mask values linear and leave UVs on shared textures unchanged", async () => {
  const {data, internal, cleanup} = fixture();
  const before = globalThis.fetch;
  let requested = 0;
  globalThis.fetch = (async () => { requested++; return new Response(dds()); }) as unknown as typeof fetch;
  try {
    const material = internal.material("test", data, 0);
    internal.material("test", data, 1);
    await Promise.all(internal.textures);
    await new Promise(r => setTimeout(r, 0));
    const [detail, base, mask] = await Promise.all(internal.textures);
    expect(requested).toBe(3);
    expect(internal.usedBytes).toBe(3 * 136 * 2);
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
  const {data, internal, cleanup} = fixture(400 / 2 ** 30);
  const before = globalThis.fetch;
  globalThis.fetch = (async () => new Response(dds())) as unknown as typeof fetch;
  try {
    const material = internal.material("test", data, 0);
    await Promise.all(internal.textures);
    await new Promise(r => setTimeout(r, 0));
    expect(internal.overLimit).toBe(true);
    expect(material.map).toBe(await internal.textures[1]);
    expect(internal.textures[0]).toBeUndefined();
    expect(internal.usedBytes).toBe(272);
  } finally { globalThis.fetch = before; await cleanup(); }
});

test("textures finishing after a track switch cannot attach to an obsolete material", async () => {
  const {data, internal, cleanup} = fixture();
  const before = globalThis.fetch;
  const pending: ((answer: Response) => void)[] = [];
  globalThis.fetch = (async () => new Promise<Response>(resolve => pending.push(resolve))) as unknown as typeof fetch;
  try {
    const material = internal.material("test", data, 0);
    await new Promise(r => setTimeout(r, 0));
    internal.token++;
    for (const answer of pending) answer(new Response(dds()));
    await Promise.all(internal.textures);
    await new Promise(r => setTimeout(r, 0));
    expect(material.map).toBeNull();
  } finally { globalThis.fetch = before; await cleanup(); }
});

test("bridge asphalt samples in world metres without changing the original UVs or allocating another image", async () => {
  const {data, internal, cleanup} = fixture();
  const before = globalThis.fetch;
  globalThis.fetch = (async () => new Response(dds())) as unknown as typeof fetch;
  try {
    const source = {...data.materials[0], shader: "ksMultilayer", dual_layer: undefined, world_scale: [.5, .5]};
    const material = internal.material("test", {...data, materials: [source]}, 0);
    await Promise.all(internal.textures);
    await new Promise(r => setTimeout(r, 0));
    const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
      fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    expect(shader.vertexShader).toContain("modelMatrix * vec4(transformed, 1.0)");
    expect(shader.fragmentShader).toContain("m2lPosition.xz * m2lScale");
    expect((shader.uniforms.m2lScale.value as THREE.Vector2).toArray()).toEqual([.5, .5]);
    expect(internal.usedBytes).toBe(272);
    expect(material.map!.repeat.toArray()).toEqual([1, 1]);
  } finally { globalThis.fetch = before; await cleanup(); }
});

test("a guarded tile samples masks and photos at its whole-tile UV and its original texture at the mesh UV", () => {
  const material = new THREE.MeshLambertMaterial({map: new THREE.Texture()});
  bindSplat(material, new THREE.Texture(), [new THREE.Texture()], {
    base: {name: "original"}, mask: {name: "mask"}, origin: [0, 0], uv_guard: 1 / 64,
    images: [{name: "photo", scale: [128, 128]}],
  });
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
    fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.uniforms.m2lGuard.value).toBe(1 / 64);
  expect(shader.fragmentShader).toContain("vec2 m2lTile = (vMapUv - vec2(m2lGuard, -m2lGuard)) / (1.0 - 2.0 * m2lGuard)");
  expect(shader.fragmentShader).toContain("texture2D(m2lKeep, (m2lTile + m2lMaskOrigin) / m2lMaskExtent)");
  expect(shader.fragmentShader).toContain("texture2D(m2lPhoto0, (m2lTile + m2lOrigin) * m2lScale0)");
  expect(shader.fragmentShader).toContain("texture2D(map, vMapUv).rgb * m2lWeights.a");
});

test("a saved tile image on its mask's ring canvas is sampled where the mask is", () => {
  const material = new THREE.MeshLambertMaterial({map: new THREE.Texture()});
  bindSplat(material, new THREE.Texture(), [], {
    base: {name: "ground_0_0.dds"}, mask: {name: "mask"}, origin: [0, 0], mask_extent: [1.125, 1.125], base_extent: [1.125, 1.125],
    images: [],
  });
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
    fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.fragmentShader).toContain("texture2D(map, (m2lTile + m2lMaskOrigin) / m2lMaskExtent).rgb * m2lWeights.a");
});
