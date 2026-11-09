import {expect, test} from "bun:test";
import * as THREE from "three";
import {bindLightShares, lightShares, takesGroundLight} from "./lightShare";

/** The fragment shader a material ends up with. */
function compiled(material: THREE.MeshLambertMaterial) {
  const shader = {uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader} as
    Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
  return shader.fragmentShader;
}

test("ground stays on the ground's light, so that painting it changes no brightness", () => {
  for (const name of ["ground_0_0", "ground_-1_3", "ground_far", "gc_meadow"]) expect(takesGroundLight(name)).toBe(true);
  for (const name of ["trees", "fac_07_1", "asphalt", "foreground"]) expect(takesGroundLight(name)).toBe(false);
});

test("the ground's own split of the light changes nothing", () => {
  expect(lightShares(0.41, 0.27)).toBeNull();
});

test("two materials of the same brightness but a different split take the sun differently", () => {
  const building = lightShares(0.3225, 0.351)!, shadeLover = lightShares(0.55, 0.12)!;
  expect(building[1]).toBeGreaterThan(1);       // (more of the sun than the ground)
  expect(building[0]).toBeLessThan(1);          // (less of the sky)
  expect(shadeLover[0]).toBeGreaterThan(building[0]);
  expect(shadeLover[1]).toBeLessThan(building[1]);
});

test("a material without light values stays as it is", () => {
  expect(lightShares(0, 0)).toBeNull();
});

test("a material's shader weighs the sky's and the sun's light apart", () => {
  const material = new THREE.MeshLambertMaterial();
  bindLightShares(material, 0.3225, 0.351);
  const [ambient, direct] = lightShares(0.3225, 0.351)!;
  const fragment = compiled(material);
  expect(fragment).toContain(`reflectedLight.indirectDiffuse *= ${ambient.toFixed(3)};`);
  expect(fragment).toContain(`reflectedLight.directDiffuse *= ${direct.toFixed(3)};`);
});

test("materials of different splits do not share a compiled program", () => {
  const a = new THREE.MeshLambertMaterial(), b = new THREE.MeshLambertMaterial();
  bindLightShares(a, 0.3225, 0.351); bindLightShares(b, 0.42, 0.36);
  expect(a.customProgramCacheKey()).not.toBe(b.customProgramCacheKey());
});

test("the colour, the alpha test and the normals are not touched", () => {
  const material = new THREE.MeshLambertMaterial({color: 0x336699, alphaTest: 0.5});
  bindLightShares(material, 0.3225, 0.351);
  expect(material.color.getHex()).toBe(0x336699);
  expect(material.alphaTest).toBe(0.5);
  const fragment = compiled(material);
  expect(fragment).toContain("#include <alphatest_fragment>");
  expect(fragment).toContain("#include <normal_fragment_begin>");
});

test("the ground's split leaves a material's shader alone", () => {
  const material = new THREE.MeshLambertMaterial(), before = material.onBeforeCompile;
  bindLightShares(material, 0.41, 0.27);
  expect(material.onBeforeCompile).toBe(before);
});
