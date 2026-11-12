import {expect, test} from "bun:test";
import * as THREE from "three";
import {MaterialRegions} from "./materials";
import {testKernel} from "./meshPrepare.fixture";
import {regionGroups} from "./regionsKernel";
import type {MeshInfo} from "../types";
import type {RegionPiece} from "./meshPrepare";

function prepare(position: THREE.BufferAttribute, indices: Uint16Array, pieces: RegionPiece[]) {
  const buffer = new ArrayBuffer(position.count * 44 + 4 + indices.byteLength), view = new DataView(buffer);
  for (let k = 0; k < position.count; k++) for (let axis = 0; axis < 3; axis++) view.setFloat32(k * 44 + axis * 4, position.getComponent(k, axis), true);
  view.setUint32(position.count * 44, indices.length, true);
  new Uint16Array(buffer, position.count * 44 + 4).set(indices);
  return new MaterialRegions(regionGroups(testKernel, buffer, {vertices: position.count, indices: indices.length} as MeshInfo, pieces), pieces);
}

test("loading finds connected material faces through duplicated vertices; separate objects and strips stay separate", () => {
  // Two triangles of one strip have duplicated vertices, as the kn5 writer may emit them; another strip lies beyond a gap.
  const position = new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,0,1, 1,0,0, 1,0,1, 0,0,1,
    4,0,0, 5,0,0, 4,0,1], 3);
  const indices = new Uint16Array([0,1,2, 3,4,5, 6,7,8]);
  const regions = prepare(position, indices, []);
  expect(regions.faces(0)).toEqual([0, 1]);
  expect(regions.faces(2)).toEqual([2]);
  expect(regions.faces(0, true)).toEqual([0, 1, 2]);
  const owned = prepare(position, indices, [{from: 0, end: 1, id: "house#0"}, {from: 1, end: 2, id: "house#1"}]);
  expect(owned.faces(0)).toEqual([0]);
  expect(owned.owner(1)).toBe("house#1");
});

test("Rust merges signed-zero duplicates, ignores degenerate edges and keeps prepared results after later allocations", () => {
  const positions = new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,0,1, -0,0,0, 1,0,0, 0,0,-1], 3);
  const indices = new Uint16Array([0,1,2, 3,5,4, 0,0,0]);
  const original = prepare(positions, indices, []);
  expect(original.faces(0)).toEqual([0, 1]);
  expect(original.faces(2)).toEqual([2]);
  for (let k = 0; k < 50; k++) {
    const separate = prepare(positions, indices, [{from: 0, end: 1, id: "a"}, {from: 1, end: 2, id: "b"}]);
    expect(separate.faces(0)).toEqual([0]);
    expect(separate.faces(1)).toEqual([1]);
  }
  expect(original.faces(0)).toEqual([0, 1]);
});
