import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

test("each plant uses its actual loaded ground height and never a navigation fallback or bridge deck", () => {
  const view = Object.create(TrackView.prototype);
  const hit = {object: new THREE.Mesh(), point: new THREE.Vector3(2, 14, 3)};
  hit.object.name = "1GRASS_ground_0_0";
  Object.assign(view, {groundAlong: () => hit});
  expect(view.plantGround(2, 3)).toEqual([2, 14, 3]);
  hit.object.name = "1ROAD_deck_0"; expect(view.plantGround(2, 3)).toBeNull();
  Object.assign(view, {groundAlong: () => null}); expect(view.plantGround(2, 3)).toBeNull();
});

test("pointer cancellation also releases the tool's local stroke preview", () => {
  const view = Object.create(TrackView.prototype); let cancelled = 0;
  Object.assign(view, {stroke: {timer: setInterval(() => {}, 1000)}, takeBackPreview: () => {}});
  view.setStroke(() => {}, async () => null, () => {}, () => cancelled++);
  expect(view.cancelStroke()).toBe(true); expect(cancelled).toBe(1);
  expect(view.cancelStroke()).toBe(false); expect(cancelled).toBe(1);
});
