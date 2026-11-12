import {expect, test} from "bun:test";
import * as THREE from "three";
import {FAR_M, TreeFxDraw, cellOf, lodAt, treeMatrix, type TreeFxModel, type TreeFxTrees} from "./treeFx";

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

test("a library tree follows its editable model matrix immediately, before the server answers", async () => {
  const {scene, draw: d} = draw(trees({ids: ["instance_a#0", "trees#1", "trees#2"]}));
  await d.load();
  d.transform("instance_a#0", new THREE.Matrix4().makeRotationY(Math.PI / 2).scale(new THREE.Vector3(2, 2, 2)).setPosition(900, 3, 40));
  expect(d.tree("instance_a#0")?.pos).toEqual([900, 3, 40]);
  expect(d.tree("instance_a#0")?.size).toBe(2);
  d.follow(new THREE.Vector3(900, 3, 40));
  const matrices = batches(scene).flatMap(batch => Array.from({length: batch.count}, (_, n) => {
    const matrix = new THREE.Matrix4(); batch.getMatrixAt(n, matrix); return matrix;
  }));
  expect(matrices.some(m => new THREE.Vector3().setFromMatrixPosition(m).equals(new THREE.Vector3(900, 3, 40)))).toBe(true);
  d.dispose();
});

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
