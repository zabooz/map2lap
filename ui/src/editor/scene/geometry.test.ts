import {expect, test} from "bun:test";
import * as THREE from "three";
import {estimateMemoryInBytes, MeshBVH} from "three-mesh-bvh";
import {bvhBytes, reachOfBox, validateMesh} from "./geometry";
import type {MeshInfo} from "../types";

test("a sphere reaches a box's farthest corner, not only the two that name it", () => {
  expect(reachOfBox([0, 0, 0], [-100, -100, 0], [100, 1, 0])).toBeCloseTo(Math.hypot(100, 100));
  expect(reachOfBox([0, 0, 0], [-1, -100, 0], [100, 1, 0])).toBeCloseTo(Math.hypot(100, 100));
  expect(reachOfBox([5, 5, 5], [5, 5, 5], [5, 5, 5])).toBe(0);
});

test("a BVH counts what it holds itself, not the geometry counted already", () => {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const tree = new MeshBVH(geometry, {indirect: true});
  const shape = geometry.getAttribute("position").array.byteLength + geometry.getIndex()!.array.byteLength;
  expect(bvhBytes(tree)).toBeGreaterThan(0);
  expect(estimateMemoryInBytes(tree)).toBeGreaterThanOrEqual(bvhBytes(tree) + shape);
  geometry.dispose();
});

test("worker input rejects truncated arrays, mismatched counts and out-of-range vertex indices", () => {
  const info = {vertices: 3, indices: 3} as MeshInfo;
  const buffer = new ArrayBuffer(3 * 44 + 4 + 6), view = new DataView(buffer);
  view.setUint32(3 * 44, 3, true);
  new Uint16Array(buffer, 3 * 44 + 4).set([0, 1, 2]);
  expect(() => validateMesh(info, buffer)).not.toThrow();
  expect(() => validateMesh(info, buffer.slice(0, -1))).toThrow("Invalid track geometry");
  view.setUint32(3 * 44, 6, true);
  expect(() => validateMesh(info, buffer)).toThrow("Invalid track triangle indices");
  view.setUint32(3 * 44, 3, true);
  view.setUint16(3 * 44 + 4, 3, true);
  expect(() => validateMesh(info, buffer)).toThrow("Invalid track triangle indices");
});
