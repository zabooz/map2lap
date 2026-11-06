import {expect, test} from "bun:test";
import * as THREE from "three";
import {estimateMemoryInBytes, MeshBVH} from "three-mesh-bvh";
import {bvhBytes} from "./view";

test("a BVH counts what it holds itself, not the geometry counted already", () => {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const tree = new MeshBVH(geometry, {indirect: true});
  const shape = geometry.getAttribute("position").array.byteLength + geometry.getIndex()!.array.byteLength;
  expect(bvhBytes(tree)).toBeGreaterThan(0);
  expect(estimateMemoryInBytes(tree)).toBeGreaterThanOrEqual(bvhBytes(tree) + shape);
});
