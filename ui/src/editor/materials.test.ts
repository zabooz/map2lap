import {expect, test} from "bun:test";
import * as THREE from "three";
import {MaterialRegions} from "./materials";

test("loading finds connected material faces through duplicated vertices; separate objects and strips stay separate", () => {
  // Two triangles of one strip have duplicated vertices, as the kn5 writer may emit them; another strip lies beyond a gap.
  const position = new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,0,1, 1,0,0, 1,0,1, 0,0,1,
    4,0,0, 5,0,0, 4,0,1], 3);
  const indices = new Uint16Array([0,1,2, 3,4,5, 6,7,8]);
  const regions = new MaterialRegions(position, indices, []);
  expect(regions.faces(0)).toEqual([0, 1]);
  expect(regions.faces(2)).toEqual([2]);
  expect(regions.faces(0, true)).toEqual([0, 1, 2]);
  const owned = new MaterialRegions(position, indices, [{from: 0, end: 1, id: "house#0"}, {from: 1, end: 2, id: "house#1"}]);
  expect(owned.faces(0)).toEqual([0]);
  expect(owned.owner(1)).toBe("house#1");
});
