// TrackObjects, Selection and ViewBrush for tests: over a half-made view (its data, byNumber, modelDraw and usedBytes, as a test sets them).
import * as THREE from "three";
import {Selection} from "./selection";
import {ViewBrush, type BrushHost} from "./brush";
import {TrackObjects} from "./trackObjects";
import type {TrackIndex} from "../types";

/** The view's fields TrackObjects reads, as far as a test gave them. */
interface Fields {
  data?: unknown; byNumber?: Map<number, THREE.Mesh>; usedBytes?: number;
  modelDraw?: {bounds?: (id: string) => THREE.Box3 | null};
}

/** TrackObjects reading view's fields when it asks, the way TrackView's own does; belonging: what belongs to which object. */
export function objectsOf(view: object, belonging?: Map<string, string[]>) {
  const fields = view as Fields;
  const objects = new TrackObjects({
    data: () => (fields.data ?? null) as TrackIndex | null,
    mesh: i => fields.byNumber?.get(i),
    loaded: () => fields.byNumber?.values() ?? [],
    modelBounds: base => fields.modelDraw?.bounds?.(base) ?? null,
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

/** A ViewBrush for a half-made view, over its scene, objects, data and pivotOf as the test set them; host: what the test hears. */
export function brushOf(view: object, host: Partial<BrushHost> = {}) {
  const fields = view as {scene?: THREE.Scene; objects: TrackObjects; data?: unknown; pivotOf?: (id: string) => number[]};
  return new ViewBrush({
    get scene() { return fields.scene ?? new THREE.Scene(); }, get objects() { return fields.objects; },
    data: () => (fields.data ?? null) as TrackIndex | null, point: () => {}, ground: () => null, look: () => null, wheelTaken: () => false,
    pivotOf: id => fields.pivotOf!(id), showPreview: () => {}, keepPreview: () => {}, takeBackPreview: () => {}, changed: () => {}, ...host,
  });
}
