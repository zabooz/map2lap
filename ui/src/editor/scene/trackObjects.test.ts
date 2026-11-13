import {expect, test} from "bun:test";
import * as THREE from "three";
import {objectsOf} from "./view.fixture";

const VERGE = "nocol_road_edge_dirt_0_0";

test("tree count covers unloaded and imported roots, excludes bushes, child parts, deletion and thinning", () => {
  const data = {objects: {tile: {kinds: ['tree', 'bush', 'tree', 'tree', 'tree'],
    sorts: ['spruce', 'shrub', 'spruce', 'oak', 'pine'], parents: [-1, -1, 0, -1, -1], faces: [[], [], [], [], []]}}};
  const objects = objectsOf({data});
  objects.index(data.objects as never);
  expect(objects.countTrees([], [])).toBe(3);
  expect(objects.countTrees(['tile#0'], ['pine'])).toBe(1);
  expect(objects.countTrees(['tile#0', 'tile#3'], ['pine'])).toBe(0);
  expect(objects.countTrees([], [])).toBe(3);
});

test("edited wall originals are hidden without hiding neighbouring objects, and Undo restores them", () => {
  const {objects, index} = fixture();
  objects.setWallHidden([[7, 1, 2]]);
  expect(index()).toEqual([0, 1, 2, 0, 0, 0, 0, 0, 0, 9, 10, 11]);
  objects.setWallHidden([]);
  expect(index()).toEqual(Array.from({length: 12}, (_, k) => k));
});

/** A mesh named name, number i, of four triangles with their own vertices each. */
function fourTriangles(i: number, name: string) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12 * 3).map((_, k) => k), 3));
  geometry.setIndex(new THREE.BufferAttribute(Uint16Array.from({length: 12}, (_, k) => k), 1));
  const mesh = new THREE.Mesh(geometry);
  mesh.name = name;
  mesh.userData = {info: {i, name, base: null}};
  return mesh;
}

/** Objects of a view with one loaded verge mesh. */
function fixture() {
  const mesh = fourTriangles(7, VERGE);
  const view = {byNumber: new Map([[7, mesh]]), usedBytes: 0, data: {meshes: [{i: 7, name: VERGE}, {i: 8, name: "nocol_bld_0_0"}]}};
  return {objects: objectsOf(view), index: () => Array.from(mesh.geometry.getIndex()!.array as Uint16Array)};
}

test("the verge's triangles a draft leaves out shrink to a point, and come back when it no longer does", () => {
  const {objects, index} = fixture();
  objects.setRemovedSurfaces([{mesh: VERGE, faces: [[1, 2]]}]);
  expect(index()).toEqual([0, 1, 2, 0, 0, 0, 0, 0, 0, 9, 10, 11]);
  objects.setRemovedSurfaces([{mesh: VERGE, faces: [[3, 1]]}]);
  expect(index()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0]);
  objects.setRemovedSurfaces([]);
  expect(index()).toEqual(Array.from({length: 12}, (_, k) => k));
});

test("a selection becomes cuts by the meshes' names, none when it holds more than verge", () => {
  const {objects} = fixture();
  expect(objects.surfaceCuts([{mesh: 7, faces: [2, 0, 1]}])).toEqual([{mesh: VERGE, faces: [[0, 3]]}]);
  expect(objects.surfaceCuts([{mesh: 7, faces: [0]}, {mesh: 8, faces: [0]}])).toBeNull();
});

test("a deleted house takes its sign along, in a mesh shown now and one that loads later, and both come back", () => {
  const shown = fourTriangles(0, "nocol_bld_0_0"), later = fourTriangles(1, "nocol_bld_1_0");
  const view = {byNumber: new Map([[0, shown]]), usedBytes: 0, data: {objects: {bld_0_0: {kinds: ["house", "sign"], parents: [-1, 0],
    at: [[0, 0, 0], [0, 0, 0]], faces: [[[0, 1, 2]], [[1, 0, 1]]]}}}};
  const objects = objectsOf(view, new Map([["bld_0_0#0", ["bld_0_0#1"]]]));
  const index = (mesh: THREE.Mesh) => Array.from(mesh.geometry.getIndex()!.array as Uint16Array);
  objects.setRemoved(["bld_0_0#0"]);
  expect(index(shown)).toEqual([0, 1, 2, 0, 0, 0, 0, 0, 0, 9, 10, 11]);
  expect(view.usedBytes).toBe(24);         // (the mesh's indices as built, kept to bring them back)
  view.byNumber.set(1, later); objects.hideIn(later);
  expect(index(later)).toEqual([0, 0, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(objects.shownObjectBounds("bld_0_0#0")).toBeNull();
  objects.setRemoved([]);
  expect(index(shown)).toEqual(Array.from({length: 12}, (_, k) => k));
  expect(index(later)).toEqual(Array.from({length: 12}, (_, k) => k));
  expect(objects.shownObjectBounds("bld_0_0#0")).not.toBeNull();
});

test("a TreeFX tree's room, its model's rooms and count come from the trees, left out by the draft as other objects", () => {
  const room = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 14, 1));
  const treeFx = {bounds: (id: string) => id === "trees#3" ? room : null, boxesOf: (model: string) => model === "spruce" ? [room] : [],
                  countOf: (model: string, ids: ReadonlySet<string>) => model === "spruce" && !ids.has("trees#3") ? 1 : 0};
  const objects = objectsOf({data: {meshes: [], objects: {}}, treeFx});
  expect(objects.boundsOf("trees#3")).toBe(room);
  expect(objects.boundsOf("trees#4").isEmpty()).toBe(true);
  expect(objects.listedOf("spruce")).toEqual([room]);
  expect([objects.countOfListed("spruce", [], []), objects.countOfListed("spruce", ["trees#3"], [])]).toEqual([1, 0]);
  expect(objects.shownObjectBounds("trees#3")).toBe(room);
  objects.setRemoved(["trees#3"]);
  expect(objects.shownObjectBounds("trees#3")).toBeNull();
});
