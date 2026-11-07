import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

const info = (i: number, vertices: number, copy = false) => ({i, vertices, indices: vertices, copy, name: `nocol_props_${i}`,
  material: 0, lod_in: 0, lod_out: 10000, center: copy ? [1000, 0, 0] : [0, 0, 0], radius: 1, base: null, first_face: null});
const bytes = (vertices: number) => {
  const b = new ArrayBuffer(vertices * 44 + 4 + vertices * 2), data = new DataView(b);
  data.setUint32(vertices * 44, vertices, true);
  for (let k = 0; k < vertices; k++) data.setUint16(vertices * 44 + 4 + k * 2, k, true);
  return b;
};

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
  Object.assign(view, {token: 1, loading: new AbortController(), trackName: "alpha", camera: new THREE.PerspectiveCamera(), scene: new THREE.Scene(),
    renderer: {domElement: {focus: () => {}}}, settings: {memoryGb: 8}, usedBytes: 0, heightsVersion: 0, copyVersion: 0, meshes: [], grounds: [],
    byNumber: new Map(), objectPieces: new Map(), belonging: new Map(), parts: new Map(), picks: new Map(), listedOut: new Map(), billboardsOut: new Map(), textures: [], previewShown: new Map(),
    wanted: () => new Set(), noteListedOut: () => {}, onIndexed: () => {}, placeCamera: () => {}, material: () => new THREE.MeshBasicMaterial(),
    laidOver: () => {}, leaveOutSorts: () => {}, reframePicks: () => {}, onViewFailed: (s: string | null) => { if (s) throw new Error(s); }});
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

test("an idle Copy preview does no more ray queries or redraws until its inputs change", () => {
  const view = Object.create(TrackView.prototype) as {followCopy: () => void; dirty: boolean; mouse: THREE.Vector2; camera: THREE.PerspectiveCamera};
  let rays = 0;
  Object.assign(view, {copyGhost: new THREE.Group(), copyFoot: new THREE.Vector3(), copyPose: {turn: 0, y: 0, scale: 1}, copyStamp: [],
    camera: new THREE.PerspectiveCamera(), mouse: new THREE.Vector2(), shown: true, groundVersion: 0, held: false,
    copyAt: () => { rays++; return [1, 2, 3]; }});
  view.followCopy();
  view.dirty = false;
  for (let n = 0; n < 30; n++) view.followCopy();
  expect(rays).toBe(1);
  expect(view.dirty).toBe(false);
  view.mouse.x = 0.2; view.followCopy();
  expect(rays).toBe(2);
  view.camera.position.x = 1; view.followCopy();
  expect(rays).toBe(3);
});
