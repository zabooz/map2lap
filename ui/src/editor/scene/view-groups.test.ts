import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

/** A view whose ground is a hit at height(x, z) on a mesh named name(x, z). */
function ground(height: (x: number, z: number) => number, name: (x: number, z: number) => string = () => "1GRASS_ground_0_0") {
  const view = Object.create(TrackView.prototype);
  Object.assign(view, {groundAlong: (origin: THREE.Vector3) => {
    const object = new THREE.Mesh(); object.name = name(origin.x, origin.z);
    return {object, point: new THREE.Vector3(origin.x, height(origin.x, origin.z), origin.z)};
  }});
  return view;
}

test("each plant uses its actual loaded ground height and never a navigation fallback or bridge deck", () => {
  expect(ground(() => 14).plantGround(2, 3)).toEqual([2, 14, 3]);
  expect(ground(() => 14, () => "1ROAD_deck_0").plantGround(2, 3)).toBeNull();
  const view = Object.create(TrackView.prototype); Object.assign(view, {groundAlong: () => null});
  expect(view.plantGround(2, 3)).toBeNull();
});

test("on a slope or a cliff edge a plant stands on the lowest ground under its foot: nothing floats", () => {
  expect(ground((x) => x).plantGround(0, 0, 1)[1]).toBeCloseTo(-1, 5);
  expect(ground((x) => x < .5 ? 0 : 6).plantGround(.4, 0, 1)[1]).toBe(0);
  expect(ground((x) => x < -.5 ? -8 : 0, (x) => x < -.5 ? "1ROAD_deck_0" : "1GRASS_ground_0_0").plantGround(0, 0, 1)[1]).toBe(0);
});

test("a refused model batch is reported once and the view still draws", () => {
  const view = Object.create(TrackView.prototype), failed: string[] = [];
  Object.assign(view, {modelDraw: {flush: () => { throw new Error("The model instances exceed the Editor memory limit"); }}, onViewFailed: (m: string) => failed.push(m)});
  expect(() => view.flushModels()).not.toThrow(); expect(() => view.flushModels()).not.toThrow();
  expect(failed).toEqual(["The model instances exceed the Editor memory limit"]);
});
