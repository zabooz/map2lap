import {expect, test} from "bun:test";
import * as THREE from "three";
import {estimateMemoryInBytes, MeshBVH} from "three-mesh-bvh";
import {bvhBytes, reachOfBox} from "./view";

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
});
