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
