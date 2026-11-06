import {expect, test} from "bun:test";
import * as THREE from "three";
import {estimateMemoryInBytes, MeshBVH} from "three-mesh-bvh";
import {addSample, bandLines, bvhBytes, reachOfBox, type Sample} from "./view";

test("a band has its two edges along the line, at its width, and its ends across", () => {
  const lines = bandLines([[0, 10, 0], [10, 10, 0], [20, 12, 0]], 4);
  const points = [];
  for (let k = 0; k < lines.length; k += 3) points.push(lines.slice(k, k + 3));
  expect(points.length).toBe(2 * 2 * 2 + 4);
  expect(points.every(p => Math.abs(p[2]) === 2)).toBe(true);        // (2 m to each side of a line along x)
  expect(points[0][1]).toBeCloseTo(10.3);                             // (a little over the road)
});

test("standing still keeps its time at its place, also at the first one and after a way", () => {
  const s: Sample[] = [[1, 2, 0]];
  addSample(s, 1, 2, 0.5);
  addSample(s, 1.1, 2, 0.5);
  expect(s).toEqual([[1, 2, 0], [1, 2, 1]]);          // (not on the press, which the server takes for no time)
  addSample(s, 11, 2, 0.5);
  expect(s).toEqual([[1, 2, 0], [1, 2, 1], [11, 2, 0.5]]);
  addSample(s, 11, 2, 2);
  addSample(s, 11, 2, 1);
  expect(s).toEqual([[1, 2, 0], [1, 2, 1], [11, 2, 0.5], [11, 2, 3]]);       // (not on the way there)
});

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
