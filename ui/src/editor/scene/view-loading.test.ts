import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {Navigation} from "./navigation";
import {GeometryPreview} from "./geometryPreview";

/** Use real scene modules for loading integration; only the WebGL renderer stays outside these tests. */
function sceneModules(view: TrackView) {
  const state = view as unknown as {camera: THREE.PerspectiveCamera; byNumber: Map<number, THREE.Mesh>};
  Object.assign(view, {
    navigation: new Navigation(state.camera, () => undefined, () => {}),
    geometryPreview: new GeometryPreview(i => state.byNumber.get(i), () => {}),
  });
}

const info = (i: number, vertices: number, copy = false) => ({i, vertices, indices: vertices, copy, name: `nocol_props_${i}`,
  material: 0, lod_in: 0, lod_out: 10000, center: copy ? [1000, 0, 0] : [0, 0, 0], radius: 1, base: null, first_face: null});
const bytes = (vertices: number) => {
  const b = new ArrayBuffer(vertices * 44 + 4 + vertices * 2), data = new DataView(b);
  data.setUint32(vertices * 44, vertices, true);
  for (let k = 0; k < vertices; k++) data.setUint16(vertices * 44 + 4 + k * 2, k, true);
  return b;
};

test("a model removed during loading refreshes its index instead of aborting on the old mesh number", async () => {
  const before = globalThis.fetch, errors: string[] = [], urls: string[] = [];
  let indexes = 0;
  globalThis.fetch = (async input => {
    const url = String(input); urls.push(url);
    if (url.endsWith("/index")) {
      indexes++;
      return Response.json({revision: "source", draft: indexes, models: [], objects: {},
        meshes: indexes === 1 ? [{...info(0, 3), model: {instance: "old", asset: "tree"}}] : []});
    }
    return Response.json({error: "The models changed"}, {status: 409});
  }) as typeof fetch;
  const view = Object.create(TrackView.prototype) as {reloadModels: () => Promise<number | null>};
  Object.assign(view, {token: 1, modelTransformVersion: 0, pendingModels: new Map(), loading: new AbortController(), trackName: "alpha", usedBytes: 0,
    settings: {memoryGb: 1}, meshes: [], removed: new Set(), picks: new Map(),
    modelDraw: {sync: async () => {}}, detachModelMeshes: () => {}, wanted: () => new Set(), noteListedOut: () => {},
    reframePicks: () => {}, onViewFailed: (message: string | null) => { if (message) errors.push(message); }});
  try {
    expect(await view.reloadModels()).toBe(0);
    expect(indexes).toBe(2);
    expect(urls.find(url => url.includes("/mesh/"))).toContain("&d=1");
    expect(errors).toEqual([]);
  } finally { globalThis.fetch = before; }
});

test("parts are ready only after the loaded ground's selection index is prepared; late preparation cannot change another track", async () => {
  let release!: () => void, arrived!: () => void;
  const gate = new Promise<void>(r => { release = r; }), preparing = new Promise<void>(r => { arrived = r; });
  const before = globalThis.fetch;
  const statuses: string[] = [];
  const progress: (number | null | undefined)[] = [];
  let phase!: () => void;
  const phaseReady = new Promise<void>(r => { phase = r; });
  globalThis.fetch = (async input => {
    const url = String(input);
    if (url.endsWith("/index")) return Response.json({revision: "source", meshes: [{...info(0, 3), name: "1ROAD_ground_0_0"}],
      surface_tiles: ["0_0"], objects: {}, materials: [], textures: [], route: [], start: null, atlas: {sprites: [], cols: 1, rows: 1}});
    if (url.includes("/surface/prepare?")) { arrived(); await gate; return Response.json({prepared: 1}); }
    return new Response(bytes(3));
  }) as typeof fetch;
  const view = Object.create(TrackView.prototype) as {load: (name: string, token: number, signal: AbortSignal, say: (s: string) => void) => Promise<void>; token: number};
  Object.assign(view, {token: 1, loading: new AbortController(), trackName: "alpha", camera: new THREE.PerspectiveCamera(), scene: new THREE.Scene(), applyLight: () => {},
    renderer: {domElement: {focus: () => {}}}, settings: {memoryGb: 8}, usedBytes: 0, heightsVersion: 0, copyVersion: 0, meshes: [], grounds: [],
    byNumber: new Map(), objectPieces: new Map(), belonging: new Map(), parts: new Map(), picks: new Map(), pendingModels: new Map(), listedOut: new Map(), billboardsOut: new Map(), textures: [],
    materialAreas: new Map(), wanted: () => new Set(), noteListedOut: () => {}, onIndexed: () => {},
    nightGlow: {bind: () => {}}, material: () => new THREE.MeshBasicMaterial(), leaveOutSorts: () => {}, reframePicks: () => {}, onViewFailed: () => {}});
  sceneModules(view as unknown as TrackView);
  try {
    const pending = view.load("alpha", 1, new AbortController().signal, (s: string, value?: number | null) => { statuses.push(s); progress.push(value); if (s.includes("Preparing selection")) phase(); });
    await Promise.race([preparing, pending.then(() => { throw new Error("parts reported ready without preparing selection"); })]);
    await phaseReady;
    expect(statuses.some(s => /^\d+ parts loaded$/.test(s))).toBe(false);
    expect(statuses.at(-1)).toContain("Preparing selection");
    expect(progress.at(-1)).toBeNumber();
    expect(progress.at(-1)).toBeGreaterThan(0);
    expect(progress.at(-1)).toBeLessThan(1);
    view.token = 2;
    const count = statuses.length;
    release(); await pending;
    expect(statuses).toHaveLength(count);
  } finally { release(); globalThis.fetch = before; }
});

for (const undo of [false, true]) test(`copy ${undo ? "undo" : "growth"} during initial loading cannot re-add obsolete queued geometry`, async () => {
  const original = Array.from({length: 6}, (_, k) => info(k, 3));
  const data = (changed: boolean) => ({revision: "source", draft: changed ? 2 : 1, copy_revision: changed ? "b" : "a",
    meshes: [...original, ...(changed && undo ? [] : [info(6, changed ? 6 : 3, true)])],
    objects: {}, materials: [], textures: [], route: [], start: null, atlas: {sprites: [], cols: 1, rows: 1}});
  let release!: () => void, ready!: () => void, indexes = 0, originals = 0;
  const gate = new Promise<void>(r => { release = r; }), started = new Promise<void>(r => { ready = r; });
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = (async input => {
    const url = String(input);
    if (url.endsWith("/index")) return Response.json(data(indexes++ > 0));
    if (url.endsWith("/copies")) return Response.json(data(true));
    const n = Number(/\/mesh\/(\d+)/.exec(url)![1]);
    if (n < 6) { if (++originals === 6) ready(); await gate; }
    if (n === 6 && undo && !url.includes("c=a")) return Response.json({error: "No mesh"}, {status: 404});
    return new Response(bytes(n === 6 && !url.includes("c=a") ? 6 : 3));
  }) as typeof fetch;
  const view = Object.create(TrackView.prototype) as {
    load: (name: string, token: number, signal: AbortSignal, say: (s: string) => void) => Promise<void>;
    syncCopies: () => Promise<void>; draft: number; meshes: THREE.Mesh[]; loading: AbortController;
  };
  Object.assign(view, {token: 1, loading: new AbortController(), trackName: "alpha", camera: new THREE.PerspectiveCamera(), scene: new THREE.Scene(), applyLight: () => {},
    renderer: {domElement: {focus: () => {}}}, settings: {memoryGb: 8}, usedBytes: 0, heightsVersion: 0, copyVersion: 0, meshes: [], grounds: [],
    byNumber: new Map(), objectPieces: new Map(), belonging: new Map(), parts: new Map(), picks: new Map(), pendingModels: new Map(), listedOut: new Map(), billboardsOut: new Map(), textures: [],
    wanted: () => new Set(), noteListedOut: () => {}, onIndexed: () => {}, material: () => new THREE.MeshBasicMaterial(),
    nightGlow: {bind: () => {}}, leaveOutSorts: () => {}, reframePicks: () => {}, onViewFailed: (s: string | null) => { if (s) throw new Error(s); }});
  sceneModules(view as unknown as TrackView);
  try {
    const loading = view.load("alpha", 1, view.loading.signal, () => {});
    await started;
    view.draft = 2;
    await view.syncCopies();
    release();
    await loading;
    const copies = view.meshes.filter(m => m.userData.info.copy);
    expect(copies).toHaveLength(undo ? 0 : 1);
    if (!undo) expect(copies[0].userData.info.vertices).toBe(6);
  } finally {
    release(); globalThis.fetch = fetchBefore;
    for (const mesh of view.meshes) { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }
  }
});
