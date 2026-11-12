import {expect, test} from "bun:test";
import * as THREE from "three";
import {bindSeason, hiddenSeasonFoliage, refreshSeason} from "./seasons";

test("winter leaf cards stop intercepting rays while the unchanged bark and evergreen foliage remain selectable", () => {
  const state = {value: 3}, material = new THREE.MeshLambertMaterial();
  bindSeason(material, state, true, true);
  expect(hiddenSeasonFoliage(material, new THREE.Vector2(.2, .2))).toBe(true);
  expect(hiddenSeasonFoliage(material, new THREE.Vector2(.75, .75))).toBe(false);
  state.value = 1;
  expect(hiddenSeasonFoliage(material, new THREE.Vector2(.2, .2))).toBe(false);
  const evergreen = new THREE.MeshLambertMaterial();
  bindSeason(evergreen, {value: 3}, true, false);
  expect(hiddenSeasonFoliage(evergreen, new THREE.Vector2(.2, .2))).toBe(false);
});

test("a new regional-ground shader retains the same season uniform without losing its own shader hook", () => {
  const state = {value: 2}, material = new THREE.MeshPhongMaterial();
  bindSeason(material, state);
  const before = material.onBeforeCompile;
  material.onBeforeCompile = shader => { shader.fragmentShader += "\n// ground pass"; };
  refreshSeason(material);
  expect(material.onBeforeCompile).not.toBe(before);
  expect(material.customProgramCacheKey()).toContain("m2l-season");
  expect(hiddenSeasonFoliage(material, new THREE.Vector2(.2, .2))).toBe(false);
});
