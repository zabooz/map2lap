// TrackObjects, Selection, ViewBrush, PlacementGhost and ObjectMover for tests: over a half-made view (its data, byNumber, modelDraw and usedBytes, as a test sets them).
import * as THREE from "three";
import {Selection} from "./selection";
import {ViewBrush, type BrushHost} from "./brush";
import {PlacementGhost, type GhostHost} from "./ghost";
import type {ModelDraw} from "./modelDraw";
import {ObjectMover, type MoverHost} from "./mover";
import {TrackObjects, type TreeRooms} from "./trackObjects";
import type {TrackIndex} from "../types";

/** The view's fields TrackObjects reads, as far as a test gave them. */
interface Fields {
  data?: unknown; byNumber?: Map<number, THREE.Mesh>; usedBytes?: number;
  modelDraw?: {bounds?: (id: string) => THREE.Box3 | null};
  treeFx?: TreeRooms;
}

/** TrackObjects reading view's fields when it asks, the way TrackView's own does; belonging: what belongs to which object. */
export function objectsOf(view: object, belonging?: Map<string, string[]>) {
  const fields = view as Fields;
  const objects = new TrackObjects({
    data: () => (fields.data ?? null) as TrackIndex | null,
    mesh: i => fields.byNumber?.get(i),
    loaded: () => fields.byNumber?.values() ?? [],
    modelBounds: base => fields.modelDraw?.bounds?.(base) ?? null,
    trees: () => fields.treeFx ?? {bounds: () => null, boxesOf: () => [], countOf: () => 0},
    take: bytes => { fields.usedBytes = (fields.usedBytes ?? 0) + bytes; },
    changed: () => {},
    removedChanged: () => {},
  });
  if (belonging) Object.assign(objects, {belonging});
  return objects;
}

/** A Selection for a half-made view, over its scene, objects and data as the test set them. */
export function selectionOf(view: object) {
  const fields = view as {scene?: THREE.Scene; objects: TrackObjects; data?: unknown};
  return new Selection({
    get scene() { return fields.scene ?? new THREE.Scene(); }, get objects() { return fields.objects; },
    data: () => (fields.data ?? null) as TrackIndex | null, moveTool: () => false, materialArea: () => false, changed: () => {},
  });
}

/** A ViewBrush for a half-made view, over its scene, objects, data and mover (or pivotOf) as the test set them; host: what the test hears. */
export function brushOf(view: object, host: Partial<BrushHost> = {}) {
  const fields = view as {scene?: THREE.Scene; objects: TrackObjects; data?: unknown; pivotOf?: (id: string) => number[]; mover?: ObjectMover};
  return new ViewBrush({
    get scene() { return fields.scene ?? new THREE.Scene(); }, get objects() { return fields.objects; },
    data: () => (fields.data ?? null) as TrackIndex | null, point: () => {}, ground: () => null, look: () => null, wheelTaken: () => false,
    pivotOf: id => fields.mover?.pivotOf(id) ?? fields.pivotOf!(id), trees: () => ({feet: () => []}), showPreview: () => {}, keepPreview: () => {}, takeBackPreview: () => {}, changed: () => {}, ...host,
  });
}

/** A PlacementGhost for a half-made view, reading its scene, objects, models, meshes, mouse and camera as the test set them, the
    way TrackView's own does; host: what the test hears. */
export function ghostOf(view: object, host: Partial<GhostHost> = {}) {
  const v = view as {scene?: THREE.Scene; objects: TrackObjects; modelDraw?: unknown; byNumber?: Map<number, THREE.Mesh>;
    mover?: ObjectMover; pivotOf?: (id: string) => number[]; copyAt?: () => [number, number, number] | null;
    mouse?: THREE.Vector2 | null; camera?: THREE.PerspectiveCamera; groundVersion?: number; held?: number; shown?: boolean; dirty?: boolean};
  return new PlacementGhost({
    get scene() { return v.scene ?? new THREE.Scene(); }, get objects() { return v.objects; },
    models: () => v.modelDraw as ModelDraw, trees: () => ({parts: () => null}), mesh: i => v.byNumber?.get(i),
    canMove: id => v.mover?.canMove(id) ?? true, pivotOf: id => v.mover?.pivotOf(id) ?? v.pivotOf!(id), ground: () => v.copyAt?.() ?? null,
    look: () => {
      const c = v.camera;
      return c ? [v.mouse?.x ?? Infinity, v.mouse?.y ?? Infinity, ...c.position.toArray(), ...c.quaternion.toArray(), c.aspect, c.fov,
        v.groundVersion ?? 0, v.held ? 1 : 0] : [];
    },
    shown: () => !!v.shown, held: () => !!v.held, modelLight: () => new THREE.Texture(), reflections: () => 1,
    reserve: () => true, release: () => {}, failed: () => {}, changed: () => { v.dirty = true; }, placingChanged: () => {}, ...host,
  });
}

/** An ObjectMover for a half-made view, reading its objects, selection, data, meshes and models as the test set them. */
export function moverOf(view: object, host: Partial<MoverHost> = {}) {
  const v = view as {camera?: THREE.PerspectiveCamera; objects: TrackObjects; selection: Selection; modelDraw?: unknown; data?: unknown;
    byNumber?: Map<number, THREE.Mesh>};
  return new ObjectMover({
    get camera() { return v.camera ?? new THREE.PerspectiveCamera(); }, get objects() { return v.objects; }, get selection() { return v.selection; },
    models: () => v.modelDraw as ModelDraw, trees: () => ({matrix: () => null, nudge: () => {}, tree: () => null}),
    data: () => (v.data ?? null) as TrackIndex | null, mesh: i => v.byNumber?.get(i),
    pick: () => null, groundAt: () => null, groundAlong: () => null, farthest: () => Infinity, busy: () => false, meshChanged: () => {}, reloadKept: () => {},
    cursorChanged: () => {}, changed: () => {}, ...host,
  });
}
