// TrackTextures for tests: a view without a renderer, its memory limit, track and meshes as given.
import * as THREE from "three";
import {fits} from "./inspect";
import {TrackTextures} from "./trackTextures";
import type {GroundFrame, GroundLayer} from "./groundRender";
import type {TrackIndex} from "../types";

/** What the tests read and set inside TrackTextures (its arrays as dense as a test fills them). */
export interface TexturesInside {
  pool: Promise<THREE.Texture | null>[];
  materials: THREE.MeshLambertMaterial[];
  textureBytes: WeakMap<THREE.Texture, number>;
  textureChanges: Map<number, unknown>;
  splatPending: Map<number, {done: Promise<void>}>;
  groundFrame: GroundFrame | null;
  groundLayers: Map<number, GroundLayer>;
}

/** TrackTextures over a fake view: data, meshes, the bytes already used and the limit in GB as given; failed(message)
    hears what the view would show (default: kept in view.failures). Returns the textures, the fake view and their inside. */
export function fakeTextures({data = null, meshes = [], used = 0, memoryGb = 1, failed}: {data?: unknown; meshes?: THREE.Mesh[];
  used?: number; memoryGb?: number; failed?: (message: string) => void} = {}) {
  const view = {token: 1, loading: new AbortController(), used, memoryGb, overLimit: false, dirty: false, failures: [] as string[], data, meshes};
  const renderer = {capabilities: {getMaxAnisotropy: () => 1, maxSamples: 4},
    getDrawingBufferSize: (out: THREE.Vector2) => out.set(10, 10)} as unknown as THREE.WebGLRenderer;
  const textures = new TrackTextures({
    renderer, scene: new THREE.Scene(),
    token: () => view.token, signal: () => view.loading.signal, trackName: () => "test",
    data: () => view.data as TrackIndex | null, meshes: () => view.meshes,
    reserve: bytes => { if (!fits(view.used, bytes, view.memoryGb)) return false; view.used += bytes; return true; },
    release: bytes => { view.used -= bytes; },
    limited: () => { view.overLimit = true; },
    forgetAlpha: () => {},
    changed: () => { view.dirty = true; },
    failed: failed ?? (message => { view.failures.push(message); }),
  });
  return {textures, view, inside: textures as unknown as TexturesInside};
}

/** The textures a loading test needs: every material a plain one, nothing painted. */
export function plainTextures() {
  return {material: () => new THREE.MeshBasicMaterial(), attach: () => {}, settled: async () => {}, setLoaded: () => {}, reconcile: () => {}};
}
