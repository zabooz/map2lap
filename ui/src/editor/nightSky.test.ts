import {expect, test} from "bun:test";
import * as THREE from "three";
import {NightSky} from "./nightSky";

const ALOFT: [number, number, number] = [0, 0.6, 0.8];

test("by day there is nothing to draw", () => {
  const sky = new NightSky();
  sky.set(ALOFT, 0);
  expect(sky.group.visible).toBe(false);
});

test("at night the stars and the moon are there, as bright as the night is deep", () => {
  const sky = new NightSky();
  sky.set(ALOFT, 0.5);
  expect(sky.group.visible).toBe(true);
  expect(sky.moon.visible).toBe(true);
  expect((sky.stars.material as THREE.PointsMaterial).opacity).toBeCloseTo(0.5, 6);
  expect((sky.moon.material as THREE.MeshBasicMaterial).opacity).toBeCloseTo(0.5, 6);
});

test("the moon stands in its direction and faces the middle of the sky", () => {
  const sky = new NightSky();
  sky.set(ALOFT, 1);
  const at = sky.moon.position.clone().normalize();
  expect(at.toArray().map(v => Math.round(v * 1000) / 1000)).toEqual(ALOFT);
  const facing = new THREE.Vector3(0, 0, 1).applyQuaternion(sky.moon.quaternion);
  expect(facing.dot(at)).toBeCloseTo(-1, 6);
});

test("a moon under the horizon isn't drawn, the stars stay", () => {
  const sky = new NightSky();
  sky.set([0, -0.2, 0.98], 1);
  expect(sky.moon.visible).toBe(false);
  expect(sky.group.visible).toBe(true);
});

test("the sky goes along with the camera, so it can't be reached", () => {
  const sky = new NightSky();
  sky.follow(new THREE.Vector3(1000, 20, -300));
  expect(sky.group.position.toArray()).toEqual([1000, 20, -300]);
});

test("stars lie on the upper half of the sky and are the same each time", () => {
  const positions = (new NightSky().stars.geometry.getAttribute("position").array as Float32Array);
  const again = (new NightSky().stars.geometry.getAttribute("position").array as Float32Array);
  expect(positions.length).toBeGreaterThan(1000);
  expect([...positions]).toEqual([...again]);
  for (let i = 1; i < positions.length; i += 3) expect(positions[i]).toBeGreaterThanOrEqual(0);
});

test("clicks go through the sky", () => {
  const sky = new NightSky();
  sky.set(ALOFT, 1);
  sky.group.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(...ALOFT));
  expect(ray.intersectObject(sky.group, true)).toEqual([]);
});

test("nothing of it is kept out of the far away view by culling", () => {
  const sky = new NightSky();
  expect(sky.stars.frustumCulled).toBe(false);
  expect(sky.moon.frustumCulled).toBe(false);
});

test("it gives up its buffers", () => {
  const sky = new NightSky();
  let freed = 0;
  sky.stars.geometry.addEventListener("dispose", () => freed++);
  sky.moon.geometry.addEventListener("dispose", () => freed++);
  sky.dispose();
  expect(freed).toBe(2);
});
