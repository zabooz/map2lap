import {expect, test} from "bun:test";
import * as THREE from "three";
import {GroundFrame, GroundLayer, groundRegionGeometry} from "./groundRender";
import type {ColourSplat, GroundPass} from "./colourBlend";

test("regional indices reserve CPU and GPU once per shared bounds, keep the old mesh on refusal and release only owned data", () => {
  let held = 0, limit = Infinity;
  const frame = new GroundFrame({} as THREE.WebGLRenderer, new THREE.Scene(), bytes => {
    if (held + bytes > limit) return false;
    held += bytes; return true;
  }, bytes => { held -= bytes; });
  const pass: GroundPass = {image: -1, first: 0, bounds: [.25, .25, .5, .5], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}], weight: {name: "uniform", size: 0}};
  const layers: ColourSplat = {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0, passes: [pass, pass]}};
  const source = new THREE.Mesh(new THREE.PlaneGeometry(256, 256, 8, 8));
  const originalPositions = source.geometry.getAttribute("position");
  const layer = new GroundLayer(frame, layers, new THREE.Texture(), [], [], [null, null], new THREE.Color());
  layer.attach(source);
  const old = frame.scene.children[0] as THREE.Mesh, oldRegion = (old.children[0] as THREE.Mesh).geometry;
  const bytes = oldRegion.getIndex()!.array.byteLength * 2;
  expect(held).toBe(bytes);
  expect((old.children[1] as THREE.Mesh).geometry).toBe(oldRegion);
  source.geometry = new THREE.PlaneGeometry(256, 256, 16, 16); limit = held;
  expect(() => layer.follow()).toThrow("memory");
  expect(frame.scene.children).toEqual([old]); expect(held).toBe(bytes);
  expect(oldRegion.getAttribute("position")).toBe(originalPositions);
  limit = Infinity; layer.follow();
  const next = frame.scene.children[0] as THREE.Mesh, nextRegion = (next.children[0] as THREE.Mesh).geometry;
  expect(next).not.toBe(old); expect(held).toBe(nextRegion.getIndex()!.array.byteLength * 2);
  layer.dispose(); expect(held).toBe(0); expect(frame.scene.children).toHaveLength(0);
  expect(source.geometry.getAttribute("position")).toBeDefined();
});

test("ground framebuffer resize accounts its allocation peak and never rebinds a disposed screen material", () => {
  let side = 10, held = 0, peak = 0, limit = 40_000;
  const renderer = {capabilities: {maxSamples: 4}, getDrawingBufferSize: (out: THREE.Vector2) => out.set(side, side)} as unknown as THREE.WebGLRenderer;
  const frame = new GroundFrame(renderer, new THREE.Scene(), bytes => {
    if (held + bytes > limit) return false;
    held += bytes; peak = Math.max(peak, held); return true;
  }, bytes => { held -= bytes; });
  const old = new THREE.MeshLambertMaterial(), active = new THREE.MeshLambertMaterial();
  frame.bind(old); frame.bind(active);
  expect(held).toBe(6000); // 100 pixels * (12 * 4 samples + 12 resolve/depth bytes).
  const original = old.map;
  old.dispose(); side = 20; frame.ensure();
  expect(held).toBe(24_000); expect(peak).toBe(30_000);
  expect(old.map).toBe(original); expect(active.map).not.toBe(original);
  const visible = active.map;
  side = 30; limit = 30_000;
  expect(() => frame.ensure()).toThrow("Not enough editor memory");
  expect(active.map).toBe(visible); expect(held).toBe(24_000);
  active.dispose(); frame.dispose(); expect(held).toBe(0);
});

test("a regional draw owns only intersecting indices and borrows unchanged source vertices", () => {
  const source = new THREE.PlaneGeometry(256, 256, 8, 8);
  const before = source.getIndex()!.array.slice();
  const geometry = groundRegionGeometry(source, [.25, .25, .5, .5], [0, 1]);
  expect(geometry.getIndex()!.count).toBeLessThan(source.getIndex()!.count / 4);
  expect(geometry.getAttribute("position")).toBe(source.getAttribute("position"));
  expect(source.getIndex()!.array).toEqual(before);
  expect(geometry.boundingSphere!.radius).toBeLessThan(source.boundingSphere?.radius ?? 181);
});

test("replacing source geometry at version zero rebuilds borrowed region attributes and preserves its world transform", () => {
  const frame = new GroundFrame({} as THREE.WebGLRenderer, new THREE.Scene(), () => true, () => {}), scene = frame.scene;
  const old = new THREE.PlaneGeometry(256, 256, 8, 8), next = new THREE.PlaneGeometry(128, 128, 2, 2);
  const source = new THREE.Mesh(old); source.position.set(17, 2, 30); source.updateMatrixWorld(true);
  const layer = new GroundLayer(frame, {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0,
      passes: [{image: -1, first: 0, bounds: [.25, .25, .5, .5], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}],
        weight: {name: "uniform", size: 0}}]}}, new THREE.Texture(), [], [], [null], new THREE.Color(1, 1, 1));
  layer.attach(source); layer.follow();
  const first = (scene.children[0].children[0] as THREE.Mesh).geometry;
  source.geometry = next; layer.follow(); scene.updateMatrixWorld(true);
  const depth = scene.children[0] as THREE.Mesh, region = (depth.children[0] as THREE.Mesh).geometry;
  expect(region).not.toBe(first);
  expect(region.getAttribute("position")).toBe(next.getAttribute("position"));
  expect(depth.matrixWorld.elements).toEqual(source.matrixWorld.elements);
  expect(old.getAttribute("position")).toBeDefined();
  layer.dispose(); expect(next.getAttribute("position")).toBeDefined();
});
