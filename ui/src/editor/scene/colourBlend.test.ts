import {expect, test} from "bun:test";
import * as THREE from "three";
import {bindSplat, materialImages} from "./colourBlend";

const phong = () => ({uniforms: {}, vertexShader: THREE.ShaderLib.phong.vertexShader,
  fragmentShader: THREE.ShaderLib.phong.fragmentShader}) as Parameters<THREE.Material["onBeforeCompile"]>[0];

test("classic layers take tangent normals and gloss from retained linear detail data, the tile image flat at the whole gloss", () => {
  const material = new THREE.MeshPhongMaterial({map: new THREE.Texture()});
  const detail = new THREE.Texture();
  bindSplat(material, new THREE.Texture(), [new THREE.Texture()], {
    base: {name: "original"}, mask: {name: "mask"}, origin: [0, 0],
    images: [{name: "photo", scale: [128, 256 / 3], detail: {name: "data", linear: true},
      properties: {roughness: .7, normal_scale: 2}}],
  }, [detail]);
  const shader = phong();
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.uniforms.m2lData0.value).toBe(detail);
  expect(shader.fragmentShader).toContain("float specularStrength = m2lGloss");
  expect(shader.fragmentShader).toContain("m2lGloss = m2lWeights.a");          // (the tile image: the ground's own gloss)
  expect(shader.fragmentShader).toContain("m2lNormal = vec3(0.0, 0.0, m2lWeights.a)");
  expect(shader.fragmentShader).toContain("mat3 m2lFrame = m2lTangentFrame(-vViewPosition, normal, vMapUv)");
  expect(shader.fragmentShader).toContain("m2lPacked0.xyz * 2.0 - 1.0");
  expect(shader.fragmentShader).toContain("(1.0 - clamp(m2lProperties0.z + m2lPacked0.a * m2lProperties0.y, 0.0, 1.0))");
  expect(shader.uniforms.m2lProperties0.value.toArray()).toEqual([2, .7, 0]);
  expect(shader.fragmentShader).not.toContain("roughnessFactor");
  expect(shader.fragmentShader).not.toContain("m2lSourceLight");      // (one light for the tile image and the photos: no PBR beside it)
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

test("loading progress includes the base and keep mask, sharing images used by several slots", () => {
  expect(materialImages({texture: "detail", dual_layer: {base: "base", mask: "keep", scale: 128}})).toEqual(["detail", "base", "keep"]);
  expect(materialImages({texture: "same", dual_layer: {base: "same", mask: "keep", scale: 1}})).toEqual(["same", "keep"]);
  expect(materialImages(undefined)).toEqual([]);
});

test("a built tile samples masks and photos at its whole-tile UV and its own image at the mesh UV", () => {
  // A build's mesh UVs are world tiles times its scale (groundmaterial.UV_SCALE); masks and photos cover the whole tile.
  const material = new THREE.MeshLambertMaterial({map: new THREE.Texture()});
  bindSplat(material, new THREE.Texture(), [new THREE.Texture()], {
    base: {name: "original"}, mask: {name: "mask"}, origin: [0, 0], uv_scale: 31 / 32,
    images: [{name: "photo", scale: [128, 128]}],
  });
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
    fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.uniforms.m2lUVScale.value).toBe(31 / 32);
  expect(shader.fragmentShader).toContain("vec2 m2lTile = vMapUv / m2lUVScale");
  expect(shader.fragmentShader).toContain("texture2D(m2lKeep, (m2lTile + m2lMaskOrigin) / m2lMaskExtent)");
  expect(shader.fragmentShader).toContain("texture2D(m2lPhoto0, (m2lTile + m2lOrigin) * m2lScale0)");
  expect(shader.fragmentShader).toContain("texture2D(map, vMapUv).rgb * m2lWeights.a");
});

test("a saved tile, its mesh UVs on its mask's canvas, samples its build's image at the world position times its scale", () => {
  const material = new THREE.MeshLambertMaterial({map: new THREE.Texture()});
  bindSplat(material, new THREE.Texture(), [], {
    base: {name: "ground_0_0.dds"}, mask: {name: "mask"}, origin: [0, 0], mask_extent: [1.125, 1.125], base_scale: [31 / 32, 31 / 32],
    images: [],
  });
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader,
    fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.uniforms.m2lBaseScale.value.toArray()).toEqual([31 / 32, 31 / 32]);
  expect(shader.fragmentShader).toContain("texture2D(map, (m2lTile + m2lMaskOrigin) * m2lBaseScale).rgb * m2lWeights.a");
});
test("a colour-only photo shines by its flat roughness, a layer made matte by the same rule as a mapped one", () => {
  const material = new THREE.MeshPhongMaterial({map: new THREE.Texture()});
  bindSplat(material, new THREE.Texture(), [new THREE.Texture(), new THREE.Texture()], {
    base: {name: "original"}, mask: {name: "mask"}, origin: [0, 0],
    images: [{name: "photo", scale: [128, 128], detail: {name: "data", linear: true}, properties: {roughness: .5, normal_scale: 1, roughness_offset: .5}},
      {name: "flat", scale: [128, 128], properties: {roughness: .2, normal_scale: 1, roughness_offset: .4}}],
  }, [new THREE.Texture(), null]);
  const shader = phong();
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  expect(shader.uniforms.m2lProperties0.value.toArray()).toEqual([1, .5, .5]);
  expect(shader.fragmentShader).toContain("m2lGloss += 0.40000000 * m2lWeights.g");
  expect(shader.fragmentShader).toContain("m2lNormal += vec3(0.0, 0.0, m2lWeights.g)");
  expect(shader.fragmentShader).toContain("texture2D(map, vMapUv).rgb * m2lWeights.a");
  expect(shader.fragmentShader).not.toContain("m2lVary");
});

test("tiles whose flat layers differ in gloss compile apart, as their gloss is written into the shader", () => {
  const key = (roughness: number) => {
    const material = new THREE.MeshPhongMaterial({map: new THREE.Texture()});
    bindSplat(material, new THREE.Texture(), [new THREE.Texture()], {base: {name: "original"}, mask: {name: "mask"}, origin: [0, 0],
      images: [{name: "photo", scale: [128, 128], properties: {roughness, normal_scale: 1}}]});
    return material.customProgramCacheKey();
  };
  expect(key(.6)).not.toBe(key(1));
  expect(key(.6)).toBe(key(.6));
});
