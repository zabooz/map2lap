import {expect, test} from "bun:test";
import * as THREE from "three";
import {Navigation, type NavigationTrack} from "./navigation";

const track: NavigationTrack = {
  meshes: [{name: "1ROAD_ground_0_0", center: [0, 0, 0], radius: 100}],
  start: {pos: [0, 0, 0], forward: [0, 0, 1]}, route: [[0, 0], [0, 100]],
};

function navigation(ground: number | null = 0) {
  const camera = new THREE.PerspectiveCamera();
  let changes = 0;
  const nav = new Navigation(camera, () => ground === null ? undefined : {point: new THREE.Vector3(0, ground, 0)} as THREE.Intersection,
    () => { changes++; });
  nav.placeCamera(track);
  return {nav, camera, changes: () => changes};
}

test("Home restores the start after movement and stops a route ride", () => {
  const {nav, camera, changes} = navigation();
  const start = camera.position.clone(), moving: boolean[] = [];
  nav.setRideWatch(on => moving.push(on), () => {});
  nav.setRide(10, 3);
  expect(nav.toggleRide()).toBe(true);
  nav.rideOn(1);
  nav.home();
  expect(camera.position.toArray()).toEqual(start.toArray());
  expect(moving).toEqual([true, false]);
  expect(changes()).toBeGreaterThan(0);
});

test("camera movement keeps its clearance above rising ground", () => {
  const {nav, camera} = navigation(50);
  nav.flying.add("KeyW");
  const before = camera.position.z;
  nav.fly(0.1);
  expect(camera.position.z).toBeGreaterThan(before);
  expect(camera.position.y).toBeGreaterThanOrEqual(51.5);
});

test("missing ground retains the last known height and the camera stays within its height limits", () => {
  const {nav, camera} = navigation(null);
  camera.position.y = -10;
  nav.settle();
  expect(camera.position.y).toBe(1.5);
  camera.position.y = 100000;
  nav.settle();
  expect(camera.position.y).toBe(nav.highest);
});

test("the view centre stays inside the track margin while the camera can stand outside it", () => {
  const {nav, camera} = navigation();
  camera.position.set(5000, 100, 0);
  camera.lookAt(5000, 0, 100);
  nav.settle();
  expect(camera.position.x).toBeLessThanOrEqual(1100);
  camera.position.set(0, 100, -1200);
  camera.lookAt(0, 0, -1000);
  nav.settle();
  expect(camera.position.z).toBeLessThan(-1100);
});

test("a route ride stops at its end and reports its final metre", () => {
  const {nav, camera} = navigation();
  const moving: boolean[] = [], metres: (number | null)[] = [];
  nav.setRideWatch(on => moving.push(on), at => metres.push(at));
  nav.setRide(1000, 3);
  nav.toggleRide();
  nav.rideOn(1);
  expect(camera.position.z).toBe(100);
  expect(moving).toEqual([true, false]);
  expect(metres.at(-1)).toBe(100);
});

test("an area without a route refuses riding without moving the camera", () => {
  const {nav, camera} = navigation();
  nav.placeCamera({...track, route: []});
  const before = camera.position.clone();
  expect(nav.toggleRide()).toBe(false);
  expect(nav.rideBy(20)).toBe(false);
  expect(camera.position.toArray()).toEqual(before.toArray());
});

test("zoom glides toward its target and stops at the maximum height", () => {
  const {nav, camera} = navigation();
  nav.zoomAim.set(0, 0, 0);
  nav.zoomLeft = -1;
  const before = camera.position.distanceTo(nav.zoomAim);
  nav.glideZoom(0.05);
  expect(camera.position.distanceTo(nav.zoomAim)).toBeLessThan(before);
  camera.position.y = nav.highest;
  nav.settle();
  nav.zoomLeft = 1;
  nav.glideZoom(0.05);
  expect(camera.position.y).toBe(nav.highest);
  expect(nav.zoomLeft).toBe(0);
});
