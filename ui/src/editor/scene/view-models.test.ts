import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {GeometryPreview} from "./geometryPreview";
import {modelMeshKey} from "./geometry";
import type {MeshInfo} from "../types";

const part = (i: number, instance: string, asset = "tree", at = [0, 0, 0], scale = 1) => ({i, vertices: 3, indices: 3, name: `nocol_m2l_model_${instance}_0`,
  material: 0, lod_in: 0, lod_out: 1000, center: [0, 0, 0], radius: 1, base: null, first_face: null, copy: false,
  model: {instance, asset, primitive: 0, material: 0, at, scale}}) as unknown as MeshInfo;

const bytes = (x = 0) => {
  const b = new ArrayBuffer(3 * 44 + 4 + 3 * 2), data = new DataView(b);
  for (let k = 0; k < 3; k++) data.setFloat32(k * 44, x, true);
  data.setUint32(3 * 44, 3, true);
  for (let k = 0; k < 3; k++) data.setUint16(3 * 44 + 4 + k * 2, k, true);
  return b;
};

interface View {
  syncCopies: () => Promise<void>;
  reloadModels: () => Promise<number | null>; refresh: (i: number) => Promise<void>; removed: Set<string>;
  meshes: THREE.Mesh[]; byNumber: Map<number, THREE.Mesh>; materialAreas: Map<number, unknown>; usedBytes: number; dragging: unknown;
}

/** A view of no track but its models, and a server whose index and meshes follow `served`; urls holds the meshes asked for. */
function setUp() {
  const served = {parts: [] as MeshInfo[], copies: [] as MeshInfo[], draft: 1, x: 0, removed: [] as string[]}, urls: string[] = [], errors: string[] = [], before = globalThis.fetch;
  globalThis.fetch = (async input => {
    const url = String(input);
    if (url.endsWith("/copies")) return Response.json({revision: "source", draft: served.draft, copy_revision: String(served.draft), meshes: served.copies, objects: {}});
    if (url.endsWith("/index")) return Response.json({revision: "source", draft: served.draft, copy_revision: String(served.draft), materials: [], meshes: [...served.copies, ...served.parts],
      models: served.parts.map(p => ({id: p.model!.instance, asset: p.model!.asset})), model_assets: {}, model_matrices: {},
      objects: Object.fromEntries(served.parts.map(p => [p.model!.instance, {kinds: ["model"], sorts: ["model"], at: [[0, 0, 0]], parents: [-1], faces: [[[p.i, 0, 1]]], details: [{}]}]))});
    urls.push(url);
    if (!url.includes(`&d=${served.draft}`) && !url.includes(`&c=${served.draft}`)) return Response.json({error: "The models changed"}, {status: 409});
    return new Response(bytes(served.x));
  }) as typeof fetch;
  const view = Object.create(TrackView.prototype) as View;
  const byNumber = new Map<number, THREE.Mesh>();
  Object.assign(view, {token: 1, modelTransformVersion: 0, pendingModels: new Map(), pendingKey: 0, loading: new AbortController(), trackName: "alpha", scene: new THREE.Scene(), usedBytes: 0, settings: {memoryGb: 8},
    meshes: [], byNumber, parts: new Map(), grounds: [], materialAreas: new Map(), objectPieces: new Map(), belonging: new Map(), picks: new Map(),
    copyVersion: 0, heightsVersion: 0, nightGlow: {bind: () => {}}, material: () => new THREE.MeshBasicMaterial(),
    listedOut: new Map(), billboardsOut: new Map(), removed: new Set(), removedSorts: new Set(), wanted: () => new Set(served.removed), ensureModelLight: () => {}, reframePicks: () => {},
    modelDraw: {sync: async () => {}, picking: () => new THREE.MeshBasicMaterial()}, refreshes: (job: () => Promise<ArrayBuffer>) => job(),
    geometryPreview: new GeometryPreview(i => byNumber.get(i), () => {}), onViewFailed: (message: string | null) => { if (message) errors.push(message); }});
  return {view, served, urls, errors, done: () => { globalThis.fetch = before; }};
}

const firstX = (m: THREE.Mesh) => m.geometry.getAttribute("position").getX(0);

test("a tree copy takes a model's former mesh number without disappearing, including after Revert", async () => {
  const {view, served, errors, done} = setUp();
  const copied = {...part(0, "unused"), model: undefined, copy: true, name: "nocol_props_copy_tree"};
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    const model = view.byNumber.get(0)!;
    for (let attempt = 0; attempt < 2; attempt++) {
      served.copies = [copied]; served.parts = [part(1, "a")]; served.draft++;
      await view.syncCopies();
      expect(errors).toEqual([]);
      expect(view.meshes.filter(m => m.userData.info.copy)).toHaveLength(1);
      expect(view.byNumber.get(1)).toBe(model);
      served.copies = []; served.parts = [part(0, "a")]; served.draft++;
      await view.syncCopies();
      await view.reloadModels();
      expect(view.meshes.filter(m => m.userData.info.copy)).toHaveLength(0);
      expect(view.byNumber.get(0)).toBe(model);
    }
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("inserting a model downloads only the new one and keeps what is loaded", async () => {
  const {view, served, urls, errors, done} = setUp();
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    const a = view.byNumber.get(0)!;
    urls.length = 0;
    served.parts = [part(0, "a"), part(1, "b")]; served.draft = 2;
    expect(await view.reloadModels()).toBe(2);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("/mesh/1?");
    expect(view.byNumber.get(0)).toBe(a);
    expect(view.meshes).toHaveLength(2);
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("a model mesh takes no material regions: it is always picked as its object", async () => {
  const {view, served, done} = setUp();
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    expect(view.byNumber.size).toBe(1);
    expect(view.materialAreas.size).toBe(0);
  } finally { done(); }
});

test("deleting a model from the middle renumbers those after it without a download and frees its memory", async () => {
  const {view, served, urls, done} = setUp();
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    const one = view.usedBytes;
    served.parts = [part(0, "a"), part(1, "b"), part(2, "c")]; served.draft = 2;
    await view.reloadModels();
    const [a, b, c] = [0, 1, 2].map(i => view.byNumber.get(i)!);
    view.dragging = {grabbed: [{mesh: 2}]};
    urls.length = 0;
    served.parts = [part(0, "a"), part(1, "c")]; served.draft = 3;
    await view.reloadModels();
    expect(urls).toEqual([]);
    expect(view.byNumber.get(0)).toBe(a);
    expect(view.byNumber.get(1)).toBe(c);
    expect(view.byNumber.has(2)).toBe(false);
    expect((c.userData.info as MeshInfo).i).toBe(1);
    expect(view.meshes).not.toContain(b);
    expect((view.dragging as {grabbed: {mesh: number}[]}).grabbed[0].mesh).toBe(1);
    served.parts = [part(0, "a")]; served.draft = 4;
    await view.reloadModels();
    expect(view.usedBytes).toBe(one);
  } finally { done(); }
});

test("two kept models swapping numbers each land on their own", async () => {
  const {view, served, urls, done} = setUp();
  try {
    served.parts = [part(0, "a"), part(1, "b")];
    await view.reloadModels();
    const [a, b] = [view.byNumber.get(0)!, view.byNumber.get(1)!];
    urls.length = 0;
    served.parts = [part(0, "b"), part(1, "a")]; served.draft = 2;
    await view.reloadModels();
    expect(urls).toEqual([]);
    expect(view.byNumber.get(0)).toBe(b);
    expect(view.byNumber.get(1)).toBe(a);
  } finally { done(); }
});

test("another asset under the same instance id is downloaded, the old one goes", async () => {
  const {view, served, urls, done} = setUp();
  try {
    served.parts = [part(0, "a", "tree")];
    await view.reloadModels();
    const old = view.byNumber.get(0)!;
    urls.length = 0;
    served.parts = [part(0, "a", "bush")]; served.draft = 2; served.x = 7;
    await view.reloadModels();
    expect(urls).toHaveLength(1);
    expect(view.byNumber.get(0)).not.toBe(old);
    expect(view.meshes).toHaveLength(1);
    expect(firstX(view.byNumber.get(0)!)).toBe(7);
  } finally { done(); }
});

test("a kept mesh whose refresh met an older draft gets the moved vertices after all", async () => {
  const {view, served, errors, done} = setUp();
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    const a = view.byNumber.get(0)!;
    served.draft = 2; served.x = 5;
    await view.refresh(0);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(view.byNumber.get(0)).toBe(a);
    expect(firstX(a)).toBe(5);
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("a model left out stays out when it is kept, and comes back under its new number", async () => {
  const {view, served, done} = setUp();
  try {
    served.parts = [part(0, "a"), part(1, "b")];
    await view.reloadModels();
    const b = view.byNumber.get(1)!;
    served.removed = ["b#0"];
    view.removed = new Set(served.removed);
    (view as unknown as {leaveOut: (id: string, out: boolean) => void}).leaveOut("b#0", true);
    served.parts = [part(0, "b")]; served.draft = 2;
    await view.reloadModels();
    expect(view.byNumber.get(0)).toBe(b);
    expect([...b.geometry.getIndex()!.array]).toEqual([0, 0, 0]);
    served.removed = [];
    served.draft = 3;
    await view.reloadModels();
    expect([...b.geometry.getIndex()!.array]).toEqual([0, 1, 2]);
  } finally { done(); }
});

test("a mesh's key changes with what its vertices are made from, not with its number. Pure", () => {
  const key = modelMeshKey(part(0, "a"));
  expect(modelMeshKey(part(5, "a"))).toBe(key);
  expect(modelMeshKey(part(0, "b"))).not.toBe(key);
  expect(modelMeshKey(part(0, "a", "bush"))).not.toBe(key);
  expect(modelMeshKey(part(0, "a", "tree", [1, 0, 0]))).not.toBe(key);
  expect(modelMeshKey(part(0, "a", "tree", [0, 0, 0], 2))).not.toBe(key);
});

interface Pending {
  addPending: () => number | null; confirmPending: (key: number, instance: string, draft: number) => void; dropPending: (key: number) => void;
  dropAllPending: () => void; scene: THREE.Scene; copyGhost: THREE.Group | null; modelGhostSolid: THREE.Object3D | null; modelGhostHold: (() => () => void) | null;
}

/** A placement ghost at a place, its solid model and a count of who holds the ghost's loaded model. */
function ghostAt(view: View, instances: Set<string>) {
  const pending = view as unknown as Pending, held = {count: 0};
  const solid = new THREE.Group(); solid.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()));
  pending.copyGhost = new THREE.Group(); pending.copyGhost.matrix.makeTranslation(4, 5, 6);
  pending.modelGhostSolid = solid;
  pending.modelGhostHold = () => { held.count++; let done = false; return () => { if (!done) { done = true; held.count--; } }; };
  (view as unknown as {modelDraw: object}).modelDraw = {sync: async () => {}, picking: () => new THREE.MeshBasicMaterial(),
    instance: (id: string) => instances.has(id) ? new THREE.Group() : undefined};
  return {pending, held, solid};
}

const shown = (scene: THREE.Scene) => scene.children.filter(c => c.userData.pendingModel);

test("a click shows the model at once, solid, where the ghost stands, and holds its loaded model", () => {
  const {view, done} = setUp();
  try {
    const {pending, held, solid} = ghostAt(view, new Set());
    const key = pending.addPending()!;
    const [copy] = shown(pending.scene);
    expect(copy.matrix.elements[12]).toBe(4);
    expect((copy.children[0].children[0] as THREE.Mesh).material).toBe((solid.children[0] as THREE.Mesh).material);
    expect(held.count).toBe(1);
    pending.dropPending(key);
    expect(shown(pending.scene)).toHaveLength(0);
    expect(held.count).toBe(0);
  } finally { done(); }
});

test("the shown model goes when the server's instance is drawn, or when a later draft no longer has it", async () => {
  const {view, served, done} = setUp();
  try {
    const instances = new Set<string>(), {pending, held} = ghostAt(view, instances);
    const first = pending.addPending()!, second = pending.addPending()!;
    pending.confirmPending(first, "a", 1); pending.confirmPending(second, "b", 1);
    served.draft = 1;
    await view.reloadModels();
    expect(shown(pending.scene)).toHaveLength(2);        // (an index from before the insert's save: keep showing)
    instances.add("a"); served.parts = [part(0, "a")]; served.draft = 2;
    await view.reloadModels();
    expect(shown(pending.scene)).toHaveLength(0);        // (a drawn, b undone)
    expect(held.count).toBe(0);
  } finally { done(); }
});

test("another track drops what is still shown", () => {
  const {view, done} = setUp();
  try {
    const {pending, held} = ghostAt(view, new Set());
    pending.addPending(); pending.addPending();
    pending.dropAllPending();
    expect(shown(pending.scene)).toHaveLength(0);
    expect(held.count).toBe(0);
  } finally { done(); }
});

test("no ghost model loaded yet: a click shows nothing", () => {
  const {view, done} = setUp();
  try {
    expect((view as unknown as Pending).addPending()).toBeNull();
  } finally { done(); }
});
