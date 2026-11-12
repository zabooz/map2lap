import {expect, test} from "bun:test";
import * as THREE from "three";
import {ObjectMover, type MoverHost} from "./mover";
import {FLOATS_PER_VERTEX} from "./geometry";
import type {MeshInfo, Picked, TrackIndex} from "../types";

/** Where a ray first meets the ground groundAt describes: marched in 1 cm steps up to 2 km, then halved to a micrometre; or null.
 * Pure. */
function along(origin: THREE.Vector3, direction: THREE.Vector3, groundAt: (x: number, z: number) => number) {
  const dir = direction.clone().normalize(), at = (t: number) => origin.clone().addScaledVector(dir, t);
  const above = (t: number) => { const p = at(t); return p.y - groundAt(p.x, p.z); };
  for (let t = .01; t < 2000; t += .01) {
    if (above(t) > 0) continue;
    let low = t - .01, high = t;
    while (high - low > 1e-6) { const mid = (low + high) / 2; if (above(mid) > 0) low = mid; else high = mid; }
    return at(high);
  }
  return null;
}

/** A generated tree grabbed above its foot, without a renderer or server. */
function treeDrag(height = 6, groundAt: (x: number, z: number) => number = () => 0) {
  const camera = new THREE.PerspectiveCamera(55, 1.25, .5, 2000);
  camera.position.set(0, 10, 20);
  const hit = new THREE.Vector3(0, height, 0);
  camera.lookAt(hit); camera.updateMatrixWorld();
  const array = new Float32Array(4 * FLOATS_PER_VERTEX);
  [[-1, 0, 0], [1, 0, 0], [1, height, 0], [-1, height, 0]].forEach((p, i) => {
    array.set(p, i * FLOATS_PER_VERTEX); array[i * FLOATS_PER_VERTEX + 4] = 1;
  });
  const geometry = new THREE.BufferGeometry(), buffer = new THREE.InterleavedBuffer(array, FLOATS_PER_VERTEX);
  geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(buffer, 3, 0));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  const mesh = new THREE.Mesh(geometry);
  mesh.userData.info = {center: [0, height / 2, 0], radius: 20} as MeshInfo;
  const handlers = new Map<string, (e: PointerEvent) => void>();
  const el = {addEventListener: (name: string, fn: (e: PointerEvent) => void) => handlers.set(name, fn),
    getBoundingClientRect: () => ({left: 100, top: 50, width: 1000, height: 800}), setPointerCapture: () => {}} as unknown as HTMLElement;
  const host = {
    camera,
    objects: {piecesOf: () => [{mesh: 0, from: 0, end: 2}]},
    selection: {has: () => true, ids: () => ["tree#0"], reframe: () => {}},
    models: () => ({instance: () => null}),
    data: () => ({objects: {tree: {at: [[0, 0, 0]], kinds: ["tree"]}}} as unknown as TrackIndex),
    mesh: () => mesh,
    pick: (_e: PointerEvent, _el: HTMLElement, point?: THREE.Vector3) => { point?.copy(hit); return {id: "tree#0"} as Picked; },
    groundAt, groundAlong: (origin: THREE.Vector3, direction: THREE.Vector3) => along(origin, direction, groundAt),
    farthest: () => 2000, busy: () => false,
    meshChanged: () => {}, reloadKept: () => {}, cursorChanged: () => {}, changed: () => {},
  } as unknown as MoverHost;
  const moved: {id: string; x: number; y: number; z: number}[][] = [];
  const mover = new ObjectMover(host);
  mover.attach(el); mover.setMove(true, objects => moved.push(objects));
  const event = (name: string, x: number, y: number, buttons = 1) => handlers.get(name)!({clientX: x, clientY: y, button: 0, buttons, pointerId: 1} as PointerEvent);
  const delta = () => new THREE.Vector3(array[0] + 1, array[1], array[2]);
  const screen = (p: THREE.Vector3) => {
    const ndc = p.clone().project(camera);
    return {x: 100 + (ndc.x + 1) * 500, y: 50 + (1 - ndc.y) * 400};
  };
  return {mover, moved, event, delta, screen, hit, mesh};
}

test("Transform keeps the grabbed point of a tree under the mouse instead of dragging at its foot's depth", () => {
  const d = treeDrag(), from = d.screen(d.hit);
  d.event("pointerdown", from.x, from.y);
  d.event("pointermove", from.x + 80, from.y);
  const shown = d.screen(d.hit.clone().add(d.delta()));
  expect(shown.x).toBeCloseTo(from.x + 80, 3);
  expect(shown.y).toBeCloseTo(from.y, 3);
  d.event("pointerup", from.x + 80, from.y, 0);
  expect(d.moved).toHaveLength(1);
  expect(d.moved[0][0].x).toBeCloseTo(d.delta().x);
  d.mesh.geometry.dispose();
});

test("the first Transform drag near eye level does not send the tree under the camera", () => {
  const d = treeDrag(9.99), from = d.screen(d.hit);
  d.event("pointerdown", from.x, from.y);
  d.event("pointermove", from.x, from.y + 8);
  expect(d.delta().length()).toBeLessThan(1);
  d.mesh.geometry.dispose();
});

test("dragging by the crown still follows the terrain and keeps the tree's clearance", () => {
  const ground = (x: number, z: number) => x * .2 + z * .3;
  const d = treeDrag(6, ground), from = d.screen(d.hit);
  d.event("pointerdown", from.x, from.y);
  d.event("pointermove", from.x + 80, from.y + 20);
  const by = d.delta();
  expect(by.y).toBeCloseTo(ground(by.x, by.z), 5);
  d.event("pointerup", from.x + 80, from.y + 20, 0);
  expect(d.moved[0][0].y).toBeCloseTo(by.y, 5);
  d.mesh.geometry.dispose();
});

test("on a slope the grabbed point stays under the mouse, raised with the ground, not only on flat ground", () => {
  // (the mouse was put on a level plane at the grab's height and the tree raised after: uphill it slid away from the mouse)
  const ground = (x: number, z: number) => -z * .5 + x * .3;
  const d = treeDrag(6, ground), from = d.screen(d.hit);
  d.event("pointerdown", from.x, from.y);
  for (const [dx, dy] of [[0, -60], [90, -20], [-70, 40]]) {
    d.event("pointermove", from.x + dx, from.y + dy);
    const by = d.delta(), shown = d.screen(d.hit.clone().add(by));
    expect(by.y).toBeCloseTo(ground(by.x, by.z), 3);                // (its foot on the ground)
    expect(Math.hypot(shown.x - from.x - dx, shown.y - from.y - dy)).toBeLessThan(.5);     // (the grab under the mouse)
  }
  d.mesh.geometry.dispose();
});

test("leaving Transform during a drag restores the tree and submits no movement", () => {
  const d = treeDrag(), from = d.screen(d.hit);
  d.event("pointerdown", from.x, from.y);
  d.event("pointermove", from.x + 80, from.y);
  expect(d.delta().length()).toBeGreaterThan(0);
  d.mover.setMove(false, () => {});
  expect(d.delta().length()).toBe(0);
  d.event("pointerup", from.x + 80, from.y, 0);
  expect(d.moved).toHaveLength(0);
  d.mesh.geometry.dispose();
});
