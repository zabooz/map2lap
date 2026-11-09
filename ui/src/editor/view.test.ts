import {expect, test} from "bun:test";
import * as THREE from "three";
import {estimateMemoryInBytes, MeshBVH} from "three-mesh-bvh";
import {addSample, bandLines, bvhBytes, reachOfBox, TrackView, type Picked, type Sample} from "./view";

test("right-clicking another tree of a marked sort keeps the entire existing selection for its menu", () => {
  const view = Object.create(TrackView.prototype) as Pick<TrackView, "setPick"> & {pick: (e: PointerEvent, el: HTMLElement) => Picked};
  const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 8, 1));
  const mesh = new THREE.Mesh(); mesh.userData.info = {i: 0};
  const source = {id: "trees#0", kind: "Tree", sprite: "deciduous", sort: null, position: [0, 0, 0]};
  let resets = 0;
  Object.assign(view, {data: {revision: "source", textures: [], objects: {}}, moveTool: false, adding: true,
    marked: [{tree: true, sort: "deciduous"}], picks: new Map([[source.id, {picked: source}]]),
    selectMode: {enabled: true, whole: true, add: false}, hit: () => ({object: mesh}),
    describe: () => ({...source, id: "trees#1", at: [1, 0, 0], object: "nocol_trees_0_0"}),
    boundsOf: () => bounds, frameOf: () => ({}), forgetPicks: () => { resets++; }});
  view.setPick(() => {});
  const picked = view.pick({button: 2, clientX: 10, clientY: 10} as PointerEvent,
    {getBoundingClientRect: () => ({left: 0, top: 0, width: 100, height: 100})} as HTMLElement);
  expect(picked.keeping).toBe(true);
  expect(picked.all.map(p => p.id)).toEqual(["trees#0", "trees#1"]);
  expect(resets).toBe(0);
});

test("replacement targets include every highlighted tree once and refuse a mixed object selection", () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  const mesh = new THREE.Mesh(); mesh.userData.info = {i: 0, base: "trees"};
  const selected = {id: "trees#0", kind: "Tree"};
  Object.assign(view, {data: {objects: {}}, picks: new Map([[selected.id, {picked: selected}]]),
    billboardMeshes: () => [mesh], billboardsOf: () => [[0, 0, 8], [1, 8, 16], [2, 16, 24]],
    spriteOf: (_mesh: THREE.Mesh, face: number) => face < 16 ? "deciduous" : "pine",
    piecesOf: () => [], shownBounds: () => new THREE.Box3()});
  expect(view.replacementTargets([{tree: true, sort: "deciduous"}])).toEqual(["trees#0", "trees#1"]);
  selected.kind = "Car";
  expect(view.replacementTargets([{tree: true, sort: "deciduous"}])).toBeNull();
  mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose();
});

test("the Copy preview takes every member once, excludes a pole's wires, and uses only visible triangles", () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 1, 0, 1, 1, 0, 0, 2, 0, 0, 3, 0, 1, 3, 0, 0, 4, 0, 0, -10, 0, 1, -10, 0, 0, -9, 0], 3));
  geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.userData.indices = Uint16Array.from(geometry.getIndex()!.array);
  const scene = new THREE.Scene();
  const view = Object.create(TrackView.prototype) as TrackView;
  Object.assign(view, {
    scene, byNumber: new Map([[0, mesh]]), copyFoot: new THREE.Vector3(), copyPose: {turn: 0, y: 0, scale: 1}, placed: new Map(), pendingPivots: new Map(),
    mouse: null, belonging: new Map([["t_0_0#0", ["t_0_0#1", "t_0_0#2"]]]),
    data: {objects: {t_0_0: {kinds: ["house", "door", "power line"], parents: [-1, 0, 0], at: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      faces: [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]]}}},
  });
  view.setCopy("t_0_0#0", () => {});
  const group = scene.children[0] as THREE.Group;
  expect(group.children).toHaveLength(2);
  expect(new THREE.Box3().setFromObject(group).min.y).toBe(1);
  // A deleted child's triangles are collapsed in the displayed index; the preview must not resurrect its saved index.
  geometry.getIndex()!.array.set([3, 3, 3], 3);
  view.setCopy("t_0_0#0", () => {});
  const ghost = scene.children[0] as THREE.Group;
  expect(ghost.children).toHaveLength(1);
  Object.assign(view, {shown: true, camera: new THREE.PerspectiveCamera(), mouse: new THREE.Vector2(), groundVersion: 0, copyAt: () => [0, 20, 0]});
  // The server's anchor can include lower invisible collision that was never loaded into the view.
  view.setCopy("t_0_0#0", () => {}, [0, -4, 0]);
  view.setCopyPose({turn: 90, y: 2, scale: 2});
  expect(new THREE.Box3().setFromObject(scene.children[0]).min.y).toBe(32);
  view.setCopy(null, null);
  geometry.dispose(); mesh.material.dispose();
});

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

test("whole-sort deletion omits redundant explicit members while keeping other picked objects", () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  Object.assign(view, {picks: new Map([
    ["trees#0", {picked: {id: "trees#0", sprite: "deciduous", sort: null, position: [0, 0, 0]}}],
    ["tile#0", {picked: {id: "tile#0", sprite: null, sort: "car", position: [1, 0, 0]}}],
    ["tile#1", {picked: {id: "tile#1", sprite: null, sort: "bench", position: [2, 0, 0]}}],
  ])});
  expect(view.selectedOutside([{tree: true, sort: "deciduous"}, {tree: false, sort: "bench"}])).toEqual([
    {id: "tile#0", position: [1, 0, 0]},
  ]);
});
