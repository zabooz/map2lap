import {expect, test} from "bun:test";
import * as THREE from "three";
import {Marquee, selectionVolume} from "./marquee";

test("a screen rectangle selects its 3D volume and excludes objects behind the camera", () => {
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 100);
  camera.updateMatrixWorld();
  const box = (x: number, z = -10) => new THREE.Box3(new THREE.Vector3(x, -1, z - 1), new THREE.Vector3(x + 1, 1, z));
  const volume = selectionVolume(camera, {x: 40, y: 40, width: 20, height: 20}, 100, 100);
  expect(volume.intersectsBox(box(0))).toBe(true);
  expect(volume.intersectsBox(box(5))).toBe(false);
  expect(volume.intersectsBox(box(0, 10))).toBe(false);
});

test("reverse dragging normalizes the rectangle, short clicks do nothing, and Escape cancels it", () => {
  const el = Object.assign(new EventTarget(), {getBoundingClientRect: () => ({left: 0, top: 0, width: 100, height: 100}), setPointerCapture: () => {}});
  const shown: unknown[] = [], selected: unknown[] = [];
  const marquee = new Marquee(el as unknown as HTMLElement, () => true, r => shown.push(r), (r, add) => selected.push({r, add}));
  const event = (type: string, x = 0, y = 0, extra = {}) => el.dispatchEvent(Object.assign(new Event(type),
    {clientX: x, clientY: y, button: 0, buttons: 1, pointerId: 1, ctrlKey: false, metaKey: false, ...extra}));
  event("pointerdown", 60, 70); event("pointermove", 10, 20); event("pointerup", 10, 20, {ctrlKey: true});
  expect(selected).toEqual([{r: {x: 10, y: 20, width: 50, height: 50}, add: true}]);
  event("pointerdown", 10, 10); event("pointermove", 11, 11); event("pointerup", 11, 11);
  expect(selected).toHaveLength(1);
  event("pointerdown", 60, 70); event("pointermove", 10, 20); event("keydown", 0, 0, {key: "Escape"}); event("pointerup", 10, 20);
  expect(selected).toHaveLength(1); expect(shown.at(-1)).toBeNull();
  marquee.dispose();
});
