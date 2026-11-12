import {expect, test} from "bun:test";
import * as THREE from "three";
import {FAR_M, TreeFxDraw, cellOf, lodAt, mergeChanges, treeMatrix, type TreeFxModel, type TreeFxTrees} from "./treeFx";

const part = (n: number) => ({diffuse: "spruce_d.png", normal_map: "spruce_n.png", indices: Array.from({length: 3 * n}, (_, k) => k % 3),
  pos: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 1, 0, 0, 1, 0, 0, 1, 0], uv: [0, 0, 1, 0, 0, 1]});
const MODEL: TreeFxModel = {height: 14, width: 4, lods: [{distance: 200, parts: [part(3)]}, {distance: 300, parts: [part(2)]}, {distance: 500, parts: [part(1)]}]};

function trees(over: Partial<TreeFxTrees> = {}): TreeFxTrees {
  return {revision: "r", draft: 0, next: 3, ids: ["trees#0", "trees#1", "trees#2"], models: ["birch", "spruce"], model: [1, 0, 1],
    pos: [5, 0, 0, 1000, 3, 0, 7, 0, 2], base: [5, 0, 0, 1000, 3, 0, 7, 0, 2], angle: [10, 0, 350], size: [1, 0.8, 1.2], width: [1, 1.1, 0.9], ...over};
}

function draw(answer = trees(), reserve: (bytes: number) => boolean = () => true) {
  const scene = new THREE.Scene(), asked: string[] = [];
  const source = {trees: async () => answer, model: async (name: string) => { asked.push(name); return MODEL; },
                  texture: async () => new THREE.Texture()};
  return {scene, asked, draw: new TreeFxDraw(scene, source, reserve)};
}

const batches = (scene: THREE.Scene) => scene.children.filter(c => c instanceof THREE.InstancedMesh) as THREE.InstancedMesh[];

test("a tree's matrix stands it on its foot, turned counter-clockwise from above, its width apart from its height", () => {
  const m = treeMatrix(5, 1, 2, 90, 2, 0.5), x = new THREE.Vector3(1, 0, 0).applyMatrix4(m), top = new THREE.Vector3(0, 1, 0).applyMatrix4(m);
  expect([x.x, x.y, x.z].map(v => Math.round(v * 1e6) / 1e6)).toEqual([5, 1, 1]);       // (east turns to north: minus z, 1 m wide at size 2 width 0.5)
  expect(top.toArray()).toEqual([5, 3, 2]);
});

test("the LOD is the first beyond the distance, the last out to the far distance, none beyond", () => {
  expect([0, 199, 200, 450, 900, FAR_M].map(d => lodAt([200, 300, 500], d))).toEqual([0, 0, 1, 2, 2, -1]);
  expect(cellOf(-1, 300)).toBe("-1,1");
});

test("the trees of one model in one cell are one instanced mesh, each model loaded once from the track", async () => {
  const {scene, asked, draw: d} = draw();
  await d.load();
  expect(asked.sort()).toEqual(["birch", "spruce"]);
  expect(batches(scene).map(b => b.count).sort()).toEqual([1, 2]);
  expect(d.tree("trees#2")).toEqual({model: "spruce", pos: [7, 0, 2], base: [7, 0, 2], angle: 350, size: 1.2, width: 0.9});
  expect(d.stats()).toMatchObject({trees: 3, cells: 2, shown: 0});
});

test("a cell near the camera shows its finest LOD, a far one its coarsest, one beyond the far distance nothing", async () => {
  const {scene, draw: d} = draw();
  await d.load();
  expect(d.follow(new THREE.Vector3(0, 10, 0))).toBe(true);
  const near = batches(scene).find(b => b.count === 2)!, far = batches(scene).find(b => b.count === 1)!;
  expect([near.visible, near.geometry.index!.count]).toEqual([true, 9]);
  expect([far.visible, far.geometry.index!.count]).toEqual([true, 3]);     // (1 km: the last LOD)
  d.follow(new THREE.Vector3(-1000, 10, 0));
  expect([near.visible, far.visible]).toEqual([true, false]);
  expect(d.follow(new THREE.Vector3(-1000, 10, 0))).toBe(false);
});

test("a tree left out by its id or its model shrinks to a point and comes back when the draft no longer names it", async () => {
  const {scene, draw: d} = draw();
  await d.load();
  const spruces = batches(scene).find(b => b.count === 2)!, matrix = new THREE.Matrix4(), scale = new THREE.Vector3();
  const scaleAt = (slot: number) => { spruces.getMatrixAt(slot, matrix); return scale.setFromMatrixScale(matrix).length(); };
  expect(d.leaveOut(new Set(["trees#2", "t_0_0#1"]), new Set())).toBe(true);
  expect([scaleAt(0) > 0, scaleAt(1)]).toEqual([true, 0]);
  expect(d.leaveOut(new Set(["trees#2"]), new Set())).toBe(false);
  d.leaveOut(new Set(), new Set(["spruce"]));
  expect([scaleAt(0), scaleAt(1)]).toEqual([0, 0]);
  d.leaveOut(new Set(), new Set());
  expect(scaleAt(1)).toBeGreaterThan(0);
});

test("trees handed out again keep what is left out by id, though their order changed", async () => {
  let answer = trees();
  const scene = new THREE.Scene(), d = new TreeFxDraw(scene, {trees: async () => answer, model: async () => MODEL, texture: async () => new THREE.Texture()});
  await d.load();
  d.leaveOut(new Set(["trees#2"]), new Set());
  answer = trees({ids: ["trees#0", "trees#2"], model: [1, 1], pos: [5, 0, 0, 7, 0, 2], base: [5, 0, 0, 7, 0, 2], angle: [10, 350], size: [1, 1.2], width: [1, 0.9]});
  await d.load();
  expect(d.stats()).toMatchObject({trees: 2, out: 1});
});

test("trees beyond the memory limit are refused and all reserved is given back on dispose", async () => {
  let balance = 0;
  const {draw: d} = draw(trees(), bytes => { balance += bytes; return true; });
  await d.load();
  expect(balance).toBeGreaterThan(0);
  d.dispose();
  expect(balance).toBe(0);
  const refused = draw(trees(), bytes => bytes <= 0);
  expect(refused.draw.load()).rejects.toThrow("memory limit");
});

test("a ray finds the tree it meets by its id, none once that tree is left out", async () => {
  const {draw: d} = draw();
  await d.load(); d.follow(new THREE.Vector3(0, 10, 0));
  const picker = new THREE.Raycaster(new THREE.Vector3(5.1, 0.2, 50), new THREE.Vector3(0, 0, -1));
  const hits = d.intersections(picker);
  expect(hits.map(h => d.idOf(h))).toContain("trees#0");
  expect(d.facts("trees#0", hits[0])).toMatchObject({model: "spruce", height: 14, width: 4, triangles: 3});
  d.leaveOut(new Set(["trees#0"]), new Set());
  expect(d.intersections(picker).map(h => d.idOf(h))).not.toContain("trees#0");
});

test("a tree's room is its model's height and width as scaled, the rooms and the count of a model leave out what is left out", async () => {
  const {draw: d} = draw();
  await d.load();
  const box = d.bounds("trees#2")!;
  expect([box.min.toArray(), box.max.toArray()].map(v => v.map(n => Math.round(n * 100) / 100)))
    .toEqual([[4.5, 0, -0.5], [9.5, 16.8, 4.5]]);       // (4 m wide at size 1.2, width 0.9, turned 350°: 5 m across; 14 m high at 1.2)
  expect(d.boxesOf("spruce")).toHaveLength(2);
  expect(d.countOf("spruce", new Set(["trees#0"]), new Set())).toBe(1);
  expect(d.countOf("spruce", new Set(), new Set(["spruce"]))).toBe(0);
  d.leaveOut(new Set(["trees#2"]), new Set());
  expect([d.bounds("trees#2", true), d.boxesOf("spruce").length]).toEqual([null, 1]);
  expect(d.bounds("trees#2")).not.toBeNull();
  expect(d.idOf({object: new THREE.Mesh(), instanceId: 0} as unknown as THREE.Intersection)).toBeNull();
});

const SPRUCE2 = {model: "spruce", base: [7, 0, 2], angle: 350, size: 1.2, width: 0.9};

test("Move shows a tree elsewhere at once, its room with it, until the answer's tree comes, in the same mesh's slot", async () => {
  const {scene, draw: d} = draw();
  await d.load();
  const meshes = batches(scene), initial = d.matrix("trees#2")!;
  d.nudge("trees#2", [7, 0, 2], new THREE.Matrix4().makeScale(2, 2, 2).premultiply(new THREE.Matrix4().makeTranslation(3, 1, 0)), initial);
  const box = d.bounds("trees#2")!;
  expect([Math.round(box.min.y), Math.round(box.max.y), Math.round((box.min.x + box.max.x) / 2)]).toEqual([1, 35, 10]);   // (16.8 m doubled, raised 1 m, 3 m on)
  await d.apply({trees: {"trees#2": {...SPRUCE2, pos: [9, 0.5, 2], size: 2.4}}, gone: []});
  expect(batches(scene)).toEqual(meshes);
  expect(d.tree("trees#2")).toMatchObject({pos: [9, 0.5, 2], size: 2.4});
  expect(Math.round(d.bounds("trees#2")!.max.y * 10) / 10).toBe(34.1);   // (the answer's: 14 m at 2.4, from 0.5 m)
});

test("a tree into another cell, one added and one gone build only the batches they leave or join", async () => {
  const {scene, draw: d} = draw();
  await d.load();
  const birches = batches(scene).find(b => b.count === 1)!;
  await d.apply({trees: {"trees#2": {...SPRUCE2, pos: [700, 0, 2]}}, gone: []});
  expect(batches(scene)).toContain(birches);
  expect(batches(scene).map(b => b.count).sort()).toEqual([1, 1, 1]);
  expect(d.stats()).toMatchObject({trees: 3, cells: 3, batches: 3});
  await d.apply({trees: {"trees#3": {...SPRUCE2, pos: [6, 0, 1], base: [6, 0, 1]}}, gone: []});
  expect(batches(scene).map(b => b.count).sort()).toEqual([1, 1, 2]);
  await d.apply({trees: {}, gone: ["trees#3"]});
  expect(d.tree("trees#3")).toBeNull();
  expect(batches(scene)).toContain(birches);
  await d.apply({trees: {}, gone: ["trees#2"]});
  expect(d.stats()).toMatchObject({trees: 2, cells: 2, batches: 2});
});

test("answers merged: a tree's last state counts, one gone and added again is there", () => {
  const tree = (x: number) => ({...SPRUCE2, pos: [x, 0, 0]});
  expect(mergeChanges(null, {trees: {"trees#1": tree(1)}, gone: []})).toEqual({trees: {"trees#1": tree(1)}, gone: []});
  expect(mergeChanges({trees: {"trees#1": tree(1), "trees#4": tree(4)}, gone: []}, {trees: {"trees#1": tree(2)}, gone: ["trees#4"]}))
    .toEqual({trees: {"trees#1": tree(2)}, gone: ["trees#4"]});
  expect(mergeChanges({trees: {}, gone: ["trees#4"]}, {trees: {"trees#4": tree(4)}, gone: []})).toEqual({trees: {"trees#4": tree(4)}, gone: []});
});

test("trees on their way when Move shows a tree elsewhere are dropped: they would set it back", async () => {
  let release = () => {};
  const scene = new THREE.Scene(), answers = [trees(), trees({pos: [5, 0, 0, 1000, 3, 0, 8, 0, 2]})];
  let n = 0;
  const d = new TreeFxDraw(scene, {trees: () => n++ === 0 ? Promise.resolve(answers[0]) : new Promise(ok => { release = () => ok(answers[1]); }),
                                   model: async () => MODEL, texture: async () => new THREE.Texture()});
  await d.load();
  const loading = d.load();
  d.nudge("trees#2", [7, 0, 2], new THREE.Matrix4().makeTranslation(3, 0, 0), d.matrix("trees#2")!);
  release(); await loading;
  expect(new THREE.Vector3().setFromMatrixPosition(d.matrix("trees#2")!).x).toBe(10);
});
