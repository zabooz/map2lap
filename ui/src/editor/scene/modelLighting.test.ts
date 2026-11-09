import {expect, test} from "bun:test";
import * as THREE from "three";
import {modelEnvironment} from "./modelLighting";

test("model reflections preserve metallic material and do not affect source Lambert lighting", () => {
  const environment = new THREE.Texture(), metallic = new THREE.MeshStandardMaterial({metalness: 1, roughness: 1, color: 0xff9241});
  const original = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
  modelEnvironment([metallic, original], environment);
  expect(metallic.envMap).toBe(environment);
  expect([metallic.metalness, metallic.roughness, metallic.color.getHex()]).toEqual([1, 1, 0xff9241]);
  expect(original.envMap).toBeNull();
});

test("dimming reflections does not recompile the material", () => {
  const environment = new THREE.Texture(), material = new THREE.MeshStandardMaterial();
  modelEnvironment([material], environment);
  const version = material.version;
  modelEnvironment([material], environment, .25);
  expect(material.envMapIntensity).toBe(.25);
  expect(material.version).toBe(version);
});

test("explicit matte palette materials use scene lights without room reflections or tone mapping", () => {
  const environment = new THREE.Texture();
  const matte = new THREE.MeshStandardMaterial({color: 0x2cd8b8, metalness: 0, roughness: 1});
  matte.userData.map2lap = {lighting: "matte"};
  const normal = new THREE.MeshStandardMaterial({color: 0x2cd8b8, metalness: 0, roughness: 1});
  const before = matte.color.toArray();
  modelEnvironment([matte, normal], environment);
  expect(matte.envMap).toBeNull();
  expect(matte.envMapIntensity).toBe(0);
  expect(matte.toneMapped).toBe(false);
  expect(matte.color.toArray()).toEqual(before);
  expect(normal.envMap).toBe(environment);
  expect(normal.envMapIntensity).toBe(1);
  expect(normal.toneMapped).toBe(true);
  const version = matte.version;
  modelEnvironment([matte, normal], environment, .25);
  expect(matte.envMapIntensity).toBe(0);
  expect(matte.version).toBe(version);
  expect(normal.envMapIntensity).toBe(.25);
});
