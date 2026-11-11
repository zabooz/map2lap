import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {objectsOf, selectionOf} from "./trackObjects.fixture";
import {plainTextures} from "./trackTextures.fixture";
import {GeometryPreview} from "./geometryPreview";
import {ModelDraw} from "./modelDraw";
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
  reloadModels: () => Promise<number | null>; refresh: (i: number) => Promise<void>;
  meshes: THREE.Mesh[]; byNumber: Map<number, THREE.Mesh>; materialAreas: Map<number, unknown>; usedBytes: number; dragging: unknown;
}

/** A view of no track but its models, and a server whose index and meshes follow `served`; urls holds the meshes asked for. */
function setUp() {
  const served = {parts: [] as MeshInfo[], copies: [] as MeshInfo[], copyRevision: "", draft: 1, x: 0}, urls: string[] = [], errors: string[] = [], before = globalThis.fetch;
  globalThis.fetch = (async input => {
    const url = String(input);
    if (url.endsWith("/copies")) return Response.json({revision: "source", draft: served.draft, copy_revision: served.copyRevision, meshes: served.copies, objects: {}});
    if (url.endsWith("/index")) return Response.json({revision: "source", draft: served.draft, copy_revision: served.copyRevision, materials: [], meshes: [...served.copies, ...served.parts],
      models: served.parts.map(p => ({id: p.model!.instance, asset: p.model!.asset})), model_assets: Object.fromEntries(served.parts.map(p => [p.model!.asset, {url: p.model!.asset}])),
      model_matrices: Object.fromEntries(served.parts.map(p => [p.model!.instance, new THREE.Matrix4().makeTranslation(served.x, 0, 0).toArray()])) ,
      objects: Object.fromEntries(served.parts.map(p => [p.model!.instance, {kinds: ["model"], sorts: ["model"], at: [[0, 0, 0]], parents: [-1], faces: [[[p.i, 0, 1]]], details: [{}]}]))});
    urls.push(url);
    if (!url.includes(`&d=${served.draft}`) && !url.includes(`&c=${served.copyRevision}`)) return Response.json({error: "The models changed"}, {status: 409});
    return new Response(bytes(served.x));
  }) as typeof fetch;
  const view = Object.create(TrackView.prototype) as View;
  const scene = new THREE.Scene();
  const draw = new ModelDraw(scene, async () => {
    const root = new THREE.Group(); root.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial())); return root;
  });
  const byNumber = new Map<number, THREE.Mesh>();
  Object.assign(view, {token: 1, modelTransformVersion: 0, pendingModels: new Map(), pendingKey: 0, loading: new AbortController(), trackName: "alpha", scene, usedBytes: 0, settings: {memoryGb: 8},
    meshes: [], byNumber, grounds: [], materialAreas: new Map(), objects: objectsOf(view), selection: selectionOf(view),
    data: {revision: "source", materials: [], meshes: [], objects: {}}, loadedCopyRevision: null,
    copyVersion: 0, heightsVersion: 0, nightGlow: {bind: () => {}}, textures: plainTextures(),
    ensureModelLight: () => {},
    modelDraw: draw, refreshes: (job: () => Promise<ArrayBuffer>) => job(),
    geometryPreview: new GeometryPreview(i => byNumber.get(i), () => {}), onViewFailed: (message: string | null) => { if (message) errors.push(message); }});
  return {view, draw, served, urls, errors, done: () => { draw.dispose(); globalThis.fetch = before; }};
}

const firstX = (m: THREE.Mesh) => m.geometry.getAttribute("position").getX(0);

test("a tree copy takes a model's former mesh number without disappearing, including after Revert", async () => {
  const {view, draw, served, errors, done} = setUp();
  const copied = {...part(0, "unused"), model: undefined, copy: true, name: "nocol_props_copy_tree"};
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    const model = draw.instance("a")!;
    for (let attempt = 0; attempt < 2; attempt++) {
      served.copies = [copied]; served.copyRevision = "tree"; served.parts = [part(1, "a")]; served.draft++;
      await view.syncCopies();
      expect(errors).toEqual([]);
      expect(view.meshes.filter(m => m.userData.info.copy)).toHaveLength(1);
      expect(draw.instance("a")).toBe(model);
      expect(view.byNumber.has(1)).toBe(false);
      served.copies = []; served.copyRevision = ""; served.parts = [part(0, "a")]; served.draft++;
      await view.syncCopies();
      await view.reloadModels();
      expect(view.meshes.filter(m => m.userData.info.copy)).toHaveLength(0);
      expect(draw.instance("a")).toBe(model);
      expect(view.byNumber.has(0)).toBe(false);
    }
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("inserting or moving a model downloads no unchanged copy meshes and keeps their numbers and geometry", async () => {
  const {view, draw, served, urls, errors, done} = setUp();
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    served.copies = [{...part(0, "unused"), model: undefined, copy: true}];
    served.copyRevision = "tree"; served.parts = [part(1, "a")]; served.draft++;
    await view.syncCopies();
    const copy = view.byNumber.get(0)!, geometry = copy.geometry;
    urls.length = 0;
    served.parts.push(part(2, "b")); served.draft++;
    await view.reloadModels();
    expect(urls.filter(url => url.includes("&c="))).toEqual([]);
    expect(urls).toEqual([]);
    expect(draw.instance("b")).toBeDefined();
    urls.length = 0;
    served.draft++; served.x = 5;
    await view.syncCopies();
    await view.refresh(1);
    expect(urls.filter(url => url.includes("&c="))).toEqual([]);
    expect(draw.instance("a")!.matrix.elements[12]).toBe(5);
    expect(view.byNumber.has(1)).toBe(false);
    expect(view.byNumber.get(0)).toBe(copy);
    expect(copy.geometry).toBe(geometry);
    expect((copy.userData.info as MeshInfo).i).toBe(0);
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("a changed copy revision replaces geometry even when its mesh numbers stay the same", async () => {
  const {view, served, urls, done} = setUp();
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    served.copies = [{...part(0, "unused"), model: undefined, copy: true}];
    served.copyRevision = "first"; served.parts = [part(1, "a")]; served.draft++;
    await view.syncCopies();
    const copy = view.byNumber.get(0)!;
    urls.length = 0;
    served.copyRevision = "second"; served.x = 9; served.draft++;
    await view.syncCopies();
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("&c=second");
    expect(view.byNumber.get(0)).not.toBe(copy);
    expect(firstX(view.byNumber.get(0)!)).toBe(9);
  } finally { done(); }
});

test("the initial index's copy revision is not proof that its geometry has loaded", async () => {
  const {view, served, urls, errors, done} = setUp();
  try {
    served.copies = [{...part(0, "unused"), model: undefined, copy: true}]; served.copyRevision = "tree";
    served.parts = [part(1, "a")];
    Object.assign(view, {data: {revision: "source", copy_revision: "tree", materials: [], models: [{id: "a"}], objects: {}, meshes: [...served.copies, ...served.parts]}});
    await view.syncCopies();
    expect(urls.filter(url => url.includes("&c="))).toHaveLength(1);
    expect(view.meshes).toHaveLength(1);
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("without imported models, an unchanged copy revision keeps the loaded mesh too", async () => {
  const {view, served, urls, errors, done} = setUp();
  try {
    served.copies = [{...part(0, "unused"), model: undefined, copy: true}]; served.copyRevision = "tree";
    Object.assign(view, {data: {revision: "source", materials: [], objects: {}, meshes: []}});
    await view.syncCopies();
    const copy = view.byNumber.get(0)!;
    urls.length = 0; served.draft++;
    await view.syncCopies();
    expect(urls).toEqual([]);
    expect(view.byNumber.get(0)).toBe(copy);
    expect(errors).toEqual([]);
  } finally { done(); }
});

test("a copy download overtaken by Revert cannot mark that revision loaded or restore the copy", async () => {
  const {view, served, urls, errors, done} = setUp();
  let release!: () => void;
  const gate = new Promise<void>(ok => { release = ok; });
  try {
    served.parts = [part(0, "a")]; await view.reloadModels();
    served.copies = [{...part(0, "unused"), model: undefined, copy: true}]; served.copyRevision = "tree";
    served.parts = [part(1, "a")]; served.draft++;
    const fetch = globalThis.fetch;
    let held!: () => void;
    const started = new Promise<void>(ok => { held = ok; });
    globalThis.fetch = (async (...args) => {
      const response = await fetch(...args);
      if (String(args[0]).includes("&c=tree")) { held(); await gate; }
      return response;
    }) as typeof fetch;
    const old = view.syncCopies(); await started;
    served.copies = []; served.copyRevision = ""; served.parts = [part(0, "a")]; served.draft++;
    await view.reloadModels(); release(); await old;
    expect(view.meshes.filter(m => m.userData.info.copy)).toHaveLength(0);
    globalThis.fetch = fetch;
    urls.length = 0;
    served.copies = [{...part(0, "unused"), model: undefined, copy: true}]; served.copyRevision = "tree";
    served.parts = [part(1, "a")]; served.draft++;
    await view.syncCopies();
    expect(urls.filter(url => url.includes("&c=tree"))).toHaveLength(1);
    expect(view.meshes.filter(m => m.userData.info.copy)).toHaveLength(1);
    expect(errors).toEqual([]);
  } finally { release(); done(); }
});

test("adding, removing, reordering or replacing models holds shared roots without any numbered geometry", async () => {
  const {view, draw, served, urls, errors, done} = setUp();
  try {
    served.parts = [part(0, "a")]; await view.reloadModels();
    const a = draw.instance("a")!;
    served.parts.push(part(1, "b"), part(2, "c")); served.draft++;
    expect(await view.reloadModels()).toBe(3);
    const c = draw.instance("c")!;
    served.parts = [part(0, "c"), part(1, "a")]; served.draft++;
    await view.reloadModels();
    expect(draw.instance("a")).toBe(a); expect(draw.instance("c")).toBe(c); expect(draw.instance("b")).toBeUndefined();
    served.parts = [part(0, "a", "bush")]; served.draft++;
    await view.reloadModels();
    expect(draw.instance("a")).not.toBe(a); expect(draw.instance("c")).toBeUndefined();
    expect(urls).toEqual([]); expect(view.meshes).toHaveLength(0); expect(view.byNumber.size).toBe(0);
    expect(view.materialAreas.size).toBe(0); expect(view.usedBytes).toBe(0); expect(errors).toEqual([]);
  } finally { done(); }
});

test("the per-instance native size never reserves picking geometry; shared asset reservation still refuses overflow", async () => {
  const {view, served, urls, errors, done} = setUp();
  try {
    served.parts = [{...part(0, "a"), vertices: 1000000}];
    Object.assign(view, {settings: {memoryGb: .001}});
    expect(await view.reloadModels()).toBe(1);
    expect(urls).toEqual([]); expect(errors).toEqual([]); expect(view.usedBytes).toBe(0);
    Object.assign(view, {modelDraw: {sync: async () => { throw new Error("The models exceed the Editor memory limit"); }}});
    expect(await view.reloadModels()).toBeNull(); expect(errors.join(" ")).toContain("memory limit");
  } finally { done(); }
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
  (view as unknown as {modelDraw: object}).modelDraw = {sync: async () => {},
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


test("a second model stroke keeps only semantic metadata and downloads zero instance buffers", async () => {
  const {view, served, urls, errors, done} = setUp();
  try {
    served.parts = [part(0, "a")]; await view.reloadModels();
    urls.length = 0;
    served.parts.push(part(1, "b")); served.draft++;
    await view.reloadModels();
    expect(urls).toEqual([]);
    expect(view.meshes).toHaveLength(0); expect(view.byNumber.size).toBe(0); expect(view.usedBytes).toBe(0);
    expect(errors).toEqual([]);
  } finally { done(); }
});

interface BrushView {
  brush: unknown; markAt: [number, number] | null; brushMarks: Map<string, THREE.Box3Helper>; brushGone: Set<string>;
  placed: Map<string, unknown>; pendingPivots: Map<string, number[]>; camera: THREE.Camera;
  markBrush: () => void; showGone: (ids: string[] | null) => void; cullModels: () => void;
}

test("Delete's brush frames an imported model under its ring and hides it during the stroke, before the draft answers", async () => {
  const {view, draw, served, done} = setUp();
  const brush = view as unknown as View & BrushView;
  try {
    served.parts = [part(0, "a")];
    await view.reloadModels();
    Object.assign(brush, {brush: {radius: 5, colour: "#e5484d", turnedColour: "#e5484d", marks: true}, markAt: [0, 0], brushMarks: new Map(), brushGone: new Set(),
      placed: new Map(), pendingPivots: new Map(), camera: new THREE.PerspectiveCamera()});
    brush.markBrush();
    expect([...brush.brushMarks.keys()]).toEqual(["a#0"]);
    brush.showGone(["a#0"]);
    brush.cullModels();
    expect(draw.instance("a")!.visible).toBe(false);
    brush.showGone(null);
    brush.cullModels();
    expect(draw.instance("a")!.visible).toBe(true);
  } finally { done(); }
});
