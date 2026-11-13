// What is picked in the view and the frames round it: a click picks what is under the mouse (Ctrl adds or takes one out), a
// marked sort gets a frame round each of its objects shown, and Replace takes the trees and bushes picked or marked.
import * as THREE from "three";
import type {Hovered, Marked, MeshInfo, Picked, TrackIndex} from "../types";
import {LEFT_BUTTON} from "./pointer";
import {groundTile, type SurfacePoint} from "./surfaces";
import {idsOfSorts, kindName, sortOf} from "./inspect";
import type {TrackObjects} from "./trackObjects";

const PICKED_COLOUR = "#ffd21f";
const MARK_EVERY_MS = 300;          // the frames of a marked sort follow meshes loading at most this often
const BOX_EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6],
                   [3, 7]];         // (a box's 12 edges by their corners' numbers: bits x 1, y 2, z 4)
// what the build lists (src/track/objectlist.py, LISTED): an older track's can't be picked yet
const IN_THE_LIST = /^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/;
export const ROAD = /^1ROAD_ground/;    // what a click marks a band on (trackband: the road is this)

/** A frame around bounds in scene, seen through what stands before it; changed hears that the view is to be drawn again. */
export function frameOf(scene: THREE.Scene, bounds: THREE.Box3, changed: () => void) {
  const box = new THREE.Box3Helper(bounds, new THREE.Color(PICKED_COLOUR));
  (box.material as THREE.LineBasicMaterial).depthTest = false;
  scene.add(box);
  changed();
  return box;
}

/** A frame of frameOf taken out of scene again. */
export function removeFrame(scene: THREE.Scene, box: THREE.Box3Helper, changed: () => void) {
  scene.remove(box);
  box.dispose();
  changed();
}

/** What Selection needs of the view it serves. */
export interface SelectionHost {
  scene: THREE.Scene;
  objects: TrackObjects;
  data(): TrackIndex | null;            // the track's index as the view has it now
  moveTool(): boolean;                  // Move is on: a click picks an object with all that belongs to it
  materialArea(i: number): boolean;     // whether mesh number i's material regions are known (a click picks a surface)
  changed(): void;                      // the view is to be drawn again
}

/** What is picked in a view, and the frames of a marked sort. clear() forgets the picks. */
export class Selection {
  private picks = new Map<string, {box: THREE.Box3Helper; picked: Picked}>();   // (by id, as they were picked, each with its frame)
  private marked: Marked | Marked[] | null = null;
  private markedLines: THREE.LineSegments | null = null;
  private markDue = false;              // (meshes loaded since the frames were drawn)
  private lastMark = 0;
  private markEvery = MARK_EVERY_MS;
  private adding = false;               // Ctrl with the left button adds to what is picked
  private selectMode = {enabled: false, whole: false, add: false};
  private onPick: (picked: Picked | null) => void = () => {};
  private host: SelectionHost;

  constructor(host: SelectionHost) {
    this.host = host;
  }

  /** onPick gets what a click picked, null when nothing or when that's over. */
  setPick(onPick: (picked: Picked | null) => void) {
    this.onPick = onPick;
  }

  /** Whether Ctrl with the left button adds to what is picked, or takes one out again; else it is a click like any. */
  setAdding(adding: boolean) {
    this.adding = adding;
  }

  setSelectMode(enabled: boolean, whole = false, add = false) { this.selectMode = {enabled, whole, add}; }

  /** What was picked is no more. */
  unpick() {
    this.forget();
    this.onPick(null);
  }

  /** Whether id is picked. */
  has(id: string) { return this.picks.has(id); }

  /** The ids picked, in the order they were. */
  ids() { return [...this.picks.keys()]; }

  /** A click (e) on hit, which the mouse found as hovered (null: nothing): what it picks, told to onPick too; null for nothing. */
  pick(e: PointerEvent, hit: THREE.Intersection | undefined, hovered: Hovered | null): Picked | null {
    const data = this.host.data();
    if (!data) return null;
    const adding = this.adding && (e.ctrlKey || e.metaKey || this.selectMode.enabled && this.selectMode.add) && e.button === LEFT_BUTTON;
    const whole = this.selectMode.enabled && (e.shiftKey || this.selectMode.whole) && e.button === LEFT_BUTTON;
    const id = hovered?.id && this.host.moveTool() ? this.host.objects.rootOf(hovered.id) : hovered?.id ?? null;     // (Move takes a house with its sign and door)
    if (hovered && id && id !== hovered.id) Object.assign(hovered, this.namesOf(data, id));
    if (!hovered) {
      if (!adding) this.unpick();
      return null;
    }
    const info = hit?.object.userData.info as MeshInfo | undefined;
    let surface: SurfacePoint | undefined;
    if (info && hit?.uv && !id && (groundTile(hovered.object) || this.host.materialArea(info.i))) {
      surface = {mesh: info.i, u: hit.uv.x, v: hit.uv.y, revision: data.revision, whole: !!whole};
      if (!groundTile(hovered.object)) { surface.face = hit.faceIndex ?? 0; surface.object = null; }
    }
    if (adding && !id && !surface) return null;
    if (adding && id && this.picks.has(id)) return this.drop(id, true);
    const groups = !this.marked ? [] : Array.isArray(this.marked) ? this.marked : [this.marked];
    const keeping = !!id && !adding && (e.button !== LEFT_BUTTON || this.host.moveTool()) && (this.picks.has(id)
      || e.button !== LEFT_BUTTON && groups.some(group => hovered.sort === group.sort));
    if (!adding && !keeping) this.forget();     // A context menu on a marked member acts on the whole selection.
    const bounds = id ? this.host.objects.boundsOf(id) : null;
    const foot = bounds?.getCenter(new THREE.Vector3()).setY(bounds.min.y);
    const picked: Picked = {id, afterBuild: !id && IN_THE_LIST.test(hovered.object), kind: hovered.kind,
                            sort: hovered.sort, position: (foot ? [foot.x, foot.y, foot.z] : hovered.at) as [number, number, number], left: e.button === LEFT_BUTTON,
                            road: hit && ROAD.test(hit.object.name) ? [hit.point.x, hit.point.z] as [number, number] : null, all: [],
                            adding: !!adding, keeping, whole: !!whole, surface,
                            inspection: {hovered, revision: data.revision,
                              texture: data.textures.findIndex(t => t.name === hovered.texture),
                              listed: !!id && !!data.objects[id.slice(0, id.lastIndexOf("#"))]}};
    if (id && bounds) this.picks.set(id, {box: this.picks.get(id)?.box ?? this.frameOf(bounds), picked});
    picked.all = this.allPicked();
    this.onPick(picked);
    return picked;
  }

  /** What listed object id of data is called, for the hover box and the notes. Pure. */
  private namesOf(data: TrackIndex, id: string) {
    const at = id.lastIndexOf("#"), list = data.objects[id.slice(0, at)], k = Number(id.slice(at + 1));
    return {id, kind: kindName(list.kinds[k]), sort: sortOf(list, k)};
  }

  /** What can be deleted of all that is picked now. */
  private allPicked() {
    return [...this.picks.values()].map(({picked}) => ({id: picked.id!, position: picked.position}));
  }

  /** Objects intersecting the dragged screen rectangle's frustum; Add unions rather than toggling. */
  inRectangle(volume: THREE.Frustum, add: boolean, describe: (id: string) => Hovered | null = () => null) {
    const data = this.host.data();
    if (!data) return;
    const adding = add || this.selectMode.add;
    if (!adding) this.forget();
    let last: Picked | null = null;
    for (const {id, bounds} of this.host.objects.selectableBounds()) {
      if (!volume.intersectsBox(bounds)) continue;
      const base = id.slice(0, id.lastIndexOf("#")), k = Number(id.slice(id.lastIndexOf("#") + 1));
      const list = data.objects[base], hovered = describe(id), centre = bounds.getCenter(new THREE.Vector3()).setY(bounds.min.y);
      last = {id, afterBuild: false, kind: hovered?.kind ?? kindName(list.kinds[k]), sort: hovered?.sort ?? sortOf(list, k),
        position: centre.toArray() as [number, number, number], left: true, road: null, all: [], adding, whole: false,
        ...(hovered ? {inspection: {hovered, revision: data.revision,
          texture: data.textures.findIndex(t => t.name === hovered.texture), listed: !!list}} : {})};
      this.picks.set(id, {box: this.picks.get(id)?.box ?? this.frameOf(bounds), picked: last});
    }
    last ??= [...this.picks.values()].at(-1)?.picked ?? null;
    if (last) last.all = this.allPicked();
    this.onPick(last);
  }

  /** Explicit picks outside the selected whole sorts; a sort's own member needs no redundant draft entry. */
  selectedOutside(groups: Marked[]) {
    return [...this.picks.values()].filter(({picked}) => !groups.some(g => picked.sort === g.sort))
      .map(({picked}) => ({id: picked.id!, position: picked.position}));
  }

  /** Snapshot every highlighted tree or bush for Replace; a mixed selection is refused as a whole. */
  replacementTargets(groups: Marked[]): string[] | null {
    const data = this.host.data(), objects = this.host.objects;
    if (!data) return null;
    const ids = new Set<string>();
    for (const [id, {picked}] of this.picks) {
      if (picked.kind !== "Tree" && picked.kind !== "Bush") return null;
      if (objects.shownObjectBounds(id)) ids.add(id);
    }
    for (const group of groups) for (const id of objects.treesOfModel(group.sort)) ids.add(id);     // (TreeFX trees of a model)
    for (const id of idsOfSorts(data.objects, new Set(groups.map(g => g.sort)))) {
      const at = id.lastIndexOf("#"), kind = data.objects[id.slice(0, at)].kinds[Number(id.slice(at + 1))];
      if (kind !== "tree" && kind !== "bush") return null;
      if (objects.shownObjectBounds(id)) ids.add(id);
    }
    return [...ids];
  }

  /** Tree-only scope from a rectangle or marked sorts; other objects in that area are untouched. */
  treeSpacingTargets(groups: Marked[]): string[] {
    const data = this.host.data(), objects = this.host.objects;
    if (!data) return [];
    const ids = new Set<string>();
    for (const [id, {picked}] of this.picks) {
      if (picked.kind === 'Tree' && objects.shownObjectBounds(id)) ids.add(id);
    }
    for (const group of groups) if (!/shrub|bush/i.test(group.sort)) {
      for (const id of objects.treesOfModel(group.sort)) if (id.startsWith('trees#') && objects.shownObjectBounds(id)) ids.add(id);
    }
    for (const id of idsOfSorts(data.objects, new Set(groups.map(g => g.sort)))) {
      const at = id.lastIndexOf('#'), kind = data.objects[id.slice(0, at)].kinds[Number(id.slice(at + 1))];
      if (kind === 'tree' && objects.shownObjectBounds(id)) ids.add(id);
    }
    return [...ids];
  }

  /** The picked one id out again: what was picked before it is what is spoken of, or nothing is left. */
  drop(id: string, adding = false) {
    const removed = this.picks.get(id)!.picked;
    this.removeFrame(this.picks.get(id)!.box);
    this.picks.delete(id);
    const last = [...this.picks.values()].at(-1)?.picked ?? null;
    if (last) last.all = this.allPicked();
    const result = last ? {...last, adding, whole: false} : adding ? {...removed, id: null, kind: "", all: [], adding, whole: false, surface: undefined} : null;
    this.onPick(result);
    return result;
  }

  /** The picks whose ids gone says are no more, out again. */
  dropGone(gone: (id: string) => boolean) {
    for (const id of [...this.picks.keys()]) if (gone(id)) this.drop(id);
  }

  /** The frames of what is picked round it as it stands now. */
  reframe() {
    for (const [id, {box}] of this.picks) {
      const bounds = this.host.objects.boundsOf(id);
      if (!bounds.isEmpty()) box.box.copy(bounds);
    }
  }

  /** Nothing is picked any more, in the view. */
  forget() {
    for (const {box} of this.picks.values()) this.removeFrame(box);
    this.picks.clear();
  }

  /** Every object of a sort the view shows gets a frame (a listed object's sort or a tree's model), null: none. */
  setMarked(marked: Marked | Marked[] | null) {
    this.marked = marked;
    this.frameMarked();
  }

  /** What is shown changed: the frames of a marked sort anew, at once. */
  reframeMarked() {
    if (this.marked) this.frameMarked();
  }

  /** Meshes loaded or changed: the frames of a marked sort anew with the next follow. */
  markLater() {
    if (this.marked) this.markDue = true;
  }

  /** Each frame drawn (now: its time): the frames of a marked sort follow what loaded, at most a quarter of the time. */
  follow(now: number) {
    if (!this.markDue || now - this.lastMark < this.markEvery) return;
    const from = performance.now();
    this.frameMarked();
    this.lastMark = now;      // (a long track's frames take long: at most a quarter of the time while meshes load)
    this.markEvery = Math.max(MARK_EVERY_MS, 4 * (performance.now() - from));
  }

  /** The frames of setMarked, anew: one line mesh for all, a long track's sort can be thousands. */
  private frameMarked() {
    this.markDue = false;
    if (this.markedLines) {
      this.host.scene.remove(this.markedLines);
      this.markedLines.geometry.dispose();
      (this.markedLines.material as THREE.Material).dispose();
      this.markedLines = null;
    }
    this.host.changed();
    if (!this.marked || !this.host.data()) return;
    const groups = Array.isArray(this.marked) ? this.marked : [this.marked];
    const boxes = groups.flatMap(group => this.host.objects.listedOf(group.sort));
    const points = new Float32Array(boxes.length * 24 * 3), corner = new THREE.Vector3();
    boxes.forEach((box, b) => {
      BOX_EDGES.forEach(([p, q], e) => {
        for (const [k, c] of [p, q].entries()) {
          corner.set(c & 1 ? box.max.x : box.min.x, c & 2 ? box.max.y : box.min.y, c & 4 ? box.max.z : box.min.z);
          corner.toArray(points, (b * 24 + e * 2 + k) * 3);
        }
      });
    });
    const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(points, 3));
    this.markedLines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: PICKED_COLOUR, depthTest: false}));
    this.markedLines.renderOrder = 1;
    this.host.scene.add(this.markedLines);
  }

  private frameOf(bounds: THREE.Box3) { return frameOf(this.host.scene, bounds, () => this.host.changed()); }

  private removeFrame(box: THREE.Box3Helper) { removeFrame(this.host.scene, box, () => this.host.changed()); }
}
