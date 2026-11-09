import {expect, test} from "bun:test";
import * as THREE from "three";
import {bindSplat, materialImages} from "./colourBlend";

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

test("loading progress includes the base and keep mask, sharing images used by several slots", () => {
  expect(materialImages({texture: "detail", dual_layer: {base: "base", mask: "keep", scale: 128}})).toEqual(["detail", "base", "keep"]);
  expect(materialImages({texture: "same", dual_layer: {base: "same", mask: "keep", scale: 1}})).toEqual(["same", "keep"]);
  expect(materialImages(undefined)).toEqual([]);
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
