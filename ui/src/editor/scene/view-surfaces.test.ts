import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

const VERGE = "nocol_road_edge_dirt_0_0";

/** A view with one loaded verge mesh of four triangles, its own vertices each. */
function fixture() {
  const view = Object.create(TrackView.prototype) as TrackView;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12 * 3).map((_, k) => k), 3));
  geometry.setIndex(new THREE.BufferAttribute(Uint16Array.from({length: 12}, (_, k) => k), 1));
  const mesh = new THREE.Mesh(geometry);
  mesh.name = VERGE;
  mesh.userData = {info: {i: 7, name: VERGE}};
  Object.assign(view, {byNumber: new Map([[7, mesh]]), usedBytes: 0, surfacesOut: new Map(),
    data: {meshes: [{i: 7, name: VERGE}, {i: 8, name: "nocol_bld_0_0"}]}});
  return {view, index: () => Array.from(geometry.getIndex()!.array as Uint16Array)};
}

test("the verge's triangles a draft leaves out shrink to a point, and come back when it no longer does", () => {
  const {view, index} = fixture();
  view.setRemovedSurfaces([{mesh: VERGE, faces: [[1, 2]]}]);
  expect(index()).toEqual([0, 1, 2, 0, 0, 0, 0, 0, 0, 9, 10, 11]);
  view.setRemovedSurfaces([{mesh: VERGE, faces: [[3, 1]]}]);
  expect(index()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0]);
  view.setRemovedSurfaces([]);
  expect(index()).toEqual(Array.from({length: 12}, (_, k) => k));
});

test("a selection becomes cuts by the meshes' names, none when it holds more than verge", () => {
  const {view} = fixture();
  expect(view.surfaceCuts([{mesh: 7, faces: [2, 0, 1]}])).toEqual([{mesh: VERGE, faces: [[0, 3]]}]);
  expect(view.surfaceCuts([{mesh: 7, faces: [0]}, {mesh: 8, faces: [0]}])).toBeNull();
});
