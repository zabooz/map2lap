// The objects of the track the view shows: which triangles of the loaded meshes each takes (the build's list), what belongs to
// which, and which the draft leaves out; the TreeFX trees (treeFx.ts), which have no triangles, by their rooms. A left out
// object's triangles shrink to a point: nothing draws or hits them, the others keep their numbers.
import * as THREE from "three";
import type {MeshInfo, TrackIndex} from "../types";
import {childrenOf, countOfSort, idsOfSorts, objectAt, objectIndex, takenAlong} from "./inspect";
import {cutsOf, type SurfaceCut} from "./surfaceCuts";

export const NOT_MOVED = new Set(["power line", "retaining wall", "parapet"]); // placement.NOT_ALONE: walls stay at their terrain / road edge
const TREES = "trees#";                                 // (a TreeFX tree's id: objectlist.TREEFX)

/** The triangles of a mesh that make up an object. */
export interface Piece {
  mesh: number;
  from: number;
  end: number;
}

/** What TrackObjects asks of the TreeFX trees (treeFx.ts): they have no triangles in the kn5, their ids are "trees#<number>". */
export interface TreeRooms {
  bounds(id: string, shown?: boolean): THREE.Box3 | null;
  boxesOf(model: string): THREE.Box3[];
  countOf(model: string, ids: ReadonlySet<string>, sorts: ReadonlySet<string>): number;
  idsOf(model: string): string[];
}

/** What TrackObjects needs of the view it serves. */
export interface ObjectHost {
  data(): TrackIndex | null;            // the track's index as the view has it now
  mesh(i: number): THREE.Mesh | undefined;      // the loaded mesh number i
  loaded(): Iterable<THREE.Mesh>;       // all loaded meshes
  modelBounds(base: string): THREE.Box3 | null;  // the room an imported model's instance takes, null for none
  trees(): TreeRooms;                   // the TreeFX trees: rooms and counts by id and model
  take(bytes: number): void;            // memory a mesh's copy of its indices takes
  changed(): void;                      // what is shown changed: drawn again, what the mouse points at looked at again
  removedChanged(): void;               // what is left out changed: the frames of marked sorts too
}

/** The objects of the track a view shows and what of them is left out. clear() forgets them. */
export class TrackObjects {
  private wallHidden: [number, number, number][] = [];
  private objectPieces: ReturnType<typeof objectIndex> = new Map();    // the build's objects by mesh number
  private belonging: ReturnType<typeof childrenOf> = new Map();        // what belongs to which of them
  private surfacesOut = new Map<string, [number, number][]>();   // the verge's triangles left out, by mesh name (as setRemovedSurfaces was told)
  private removedIds = new Set<string>();               // the ids of the objects left out, those of the sorts below too
  private named: {ids: string[]; objectSorts: Set<string>} = {ids: [], objectSorts: new Set()};    // (as setRemoved was told)
  private listedOut = new Map<number, Piece[]>();       // what of the listed objects left out lies in each mesh, for one loading later
  private host: ObjectHost;

  constructor(host: ObjectHost) {
    this.host = host;
  }

  /** The ids of the objects left out now. */
  get removed(): ReadonlySet<string> { return this.removedIds; }

  /** The sorts named to leave out (the models of TreeFX trees among them: treeFx leaves those out itself). */
  get removedObjectSorts(): ReadonlySet<string> { return this.named.objectSorts; }

  /** The objects of an index, all of them (a track opened or its models reloaded); what to leave out follows with rewant. */
  index(objects: TrackIndex["objects"]) {
    this.objectPieces = objectIndex(objects);
    this.belonging = childrenOf(objects);
  }

  /** The copies' objects anew, copyObjects: only copied lists changed, the source's indexes (millions of entries) stay. */
  indexCopies(copyObjects: TrackIndex["objects"]) {
    for (const [key, pieces] of this.objectPieces) if (pieces[0]?.id.startsWith("copy_")) this.objectPieces.delete(key);
    for (const [key, value] of objectIndex(copyObjects)) this.objectPieces.set(key, value);
    for (const key of this.belonging.keys()) if (key.startsWith("copy_")) this.belonging.delete(key);
    for (const [key, value] of childrenOf(copyObjects)) this.belonging.set(key, value);
  }

  /** What to leave out worked out again for the index as it is now; show: the loaded meshes follow at once. */
  rewant(show = false) {
    const previous = this.removedIds;
    this.removedIds = this.wanted();
    this.noteListedOut();
    if (!show) return;
    for (const id of previous) if (!this.removedIds.has(id)) this.leaveOut(id, false);
    for (const id of this.removedIds) if (!previous.has(id)) this.leaveOut(id, true);
  }

  /** The ids with what belongs to them. */
  withMembers(ids: Iterable<string>) { return takenAlong(ids, this.belonging); }

  /** Whether listed objects lie in mesh number i. */
  holds(i: number) { return this.objectPieces.has(i); }

  /** Only explicit wall selections can receive a wall edit; mixed object selections need their own tools. */
  wallIds(ids: string[]) {
    const data = this.host.data();
    return ids.every(id => {
      const [tile, number] = id.split("#");
      return ["retaining wall", "parapet"].includes(data?.objects[tile]?.kinds[Number(number)] ?? "");
    }) ? ids : [];
  }

  /** The listed objects' pieces in mesh number i, by their first triangle. */
  piecesIn(i: number) { return this.objectPieces.get(i); }

  /** The id of the listed object face of mesh number i belongs to, null for none. */
  objectAt(i: number, face: number) { return objectAt(this.objectPieces.get(i), face); }

  /** The listed object at the top of what id belongs to (a house for its sign and door); id itself when it is not listed. */
  rootOf(id: string) {
    const at = id.lastIndexOf("#"), list = this.host.data()?.objects?.[id.slice(0, at)];
    let k = Number(id.slice(at + 1));
    while (list && list.parents[k] >= 0) k = list.parents[k];
    return list ? `${id.slice(0, at)}#${k}` : id;
  }

  /** A mesh just loaded leaves out what the draft leaves out of it. */
  hideIn(mesh: THREE.Mesh) {
    const info = mesh.userData.info as MeshInfo;
    for (const piece of this.listedOut.get(info.i) ?? []) this.leaveOutIn(mesh, piece, true);
    for (const [from, count] of this.surfacesOut.get(info.name) ?? []) this.leaveOutIn(mesh, {mesh: info.i, from, end: from + count}, true);
    for (const [i, from, count] of this.wallHidden) if (i === info.i) this.leaveOutIn(mesh, {mesh: i, from, end: from + count}, true);
  }

  /** Edited wall meshes replace their original face ranges. Undo restores them before applying other deletions. */
  setWallHidden(pieces: [number, number, number][]) {
    for (const [i, from, count] of this.wallHidden) {
      const mesh = this.host.mesh(i);
      if (mesh) this.leaveOutIn(mesh, {mesh: i, from, end: from + count}, false);
    }
    this.wallHidden = pieces;
    for (const mesh of this.host.loaded()) this.hideIn(mesh);
    this.host.changed();
  }

  /** Another track: all forgotten. What is left out stays named until the draft says otherwise. */
  clear() {
    this.wallHidden = [];
    this.objectPieces = new Map();
    this.belonging = new Map();
  }

  /** The objects with these ids ("<mesh as built>#<number>", "trees#<number>") and those of objectSorts (a listed sort or a tree's
      model) are left out from now on, those not named come back. What goes is what any of them takes along: a span two poles share
      stays out while one does. */
  setRemoved(ids: string[], objectSorts: string[] = []) {
    this.named = {ids, objectSorts: new Set(objectSorts)};
    const wanted = this.wanted();
    let back = false;
    for (const id of this.removedIds) {
      if (!wanted.has(id)) {
        this.leaveOut(id, false);
        back = true;
      }
    }
    // (what came back may have held a part of what stays out: a house back, its sign deleted by itself)
    for (const id of wanted) if (back || !this.removedIds.has(id)) this.leaveOut(id, true);
    this.removedIds = wanted;
    this.noteListedOut();
    this.host.removedChanged();
  }

  /** The road verge's triangles the draft leaves out (surfaceCuts), each mesh's as it loads too; those no longer named come back.
      A verge mesh holds no objects, so its triangles are only ever left out this way. */
  setRemovedSurfaces(cuts: SurfaceCut[]) {
    const before = this.surfacesOut;
    this.surfacesOut = new Map(cuts.map(cut => [cut.mesh, cut.faces]));
    for (const mesh of this.host.loaded()) {
      const info = mesh.userData.info as MeshInfo;
      if (!before.has(info.name) && !this.surfacesOut.has(info.name)) continue;
      for (const [from, count] of before.get(info.name) ?? []) this.leaveOutIn(mesh, {mesh: info.i, from, end: from + count}, false);
      for (const [from, count] of this.surfacesOut.get(info.name) ?? []) this.leaveOutIn(mesh, {mesh: info.i, from, end: from + count}, true);
    }
    this.host.changed();
  }

  /** A selection's triangles as cuts of the draft, null unless all of it is road verge. */
  surfaceCuts(meshes: {mesh: number; faces: number[]}[]) {
    return cutsOf(meshes, new Map((this.host.data()?.meshes ?? []).map(m => [m.i, m.name])));
  }

  /** The ids to leave out: those named, and the listed objects of the sorts named. */
  private wanted(named = this.named) {
    const data = this.host.data();
    return new Set([...named.ids, ...(data?.model_replacements ?? []), ...idsOfSorts(data?.objects ?? {}, named.objectSorts)]);
  }

  /** listedOut for what is left out now: a whole sort of a long track is thousands of objects, too many to look through for each
      mesh that loads. */
  private noteListedOut() {
    this.listedOut = new Map();
    for (const id of this.removedIds) {
      for (const piece of this.piecesOf(id)) {
        if (!this.listedOut.has(piece.mesh)) this.listedOut.set(piece.mesh, []);
        this.listedOut.get(piece.mesh)!.push(piece);
      }
    }
  }

  /** How many objects of a listed sort or trees of a model the track still shows, over all of it, with these edits (the page's, as
      it renders: the view takes them only after): what the button to delete them all says. */
  countOfListed(sort: string, ids: string[], objectSorts: string[]) {
    const data = this.host.data();
    if (!data) return 0;
    return countOfSort(data.objects, sort, takenAlong(this.wanted({ids, objectSorts: new Set(objectSorts)}), this.belonging))
      + this.host.trees().countOf(sort, new Set(ids), new Set(objectSorts));
  }

  /** All triangles of a listed object and what belongs to it; none for another (a TreeFX tree has none). */
  piecesOf(id: string, withChildren = true): Piece[] {
    const at = id.lastIndexOf("#"), base = id.slice(0, at), number = Number(id.slice(at + 1));
    const listed = this.host.data()?.objects?.[base]?.faces[number];
    if (!listed) return [];
    return [...listed.map(([mesh, from, count]) => ({mesh, from, end: from + count})),
            ...(withChildren ? (this.belonging.get(id) ?? []).flatMap(child => this.piecesOf(child)) : [])];
  }

  /** An object left out of, or back in the meshes loaded. */
  leaveOut(id: string, out: boolean) {
    for (const piece of this.piecesOf(id)) {
      const mesh = this.host.mesh(piece.mesh);
      if (mesh) this.leaveOutIn(mesh, piece, out);
    }
  }

  /** A piece of an object left out of, or back in its mesh. The first change of a mesh keeps a copy of its indices. */
  private leaveOutIn(mesh: THREE.Mesh, {from, end}: Piece, out: boolean) {
    const index = mesh.geometry.getIndex()!, array = index.array as Uint16Array;
    if (!mesh.userData.indices) {
      mesh.userData.indices = array.slice();
      this.host.take(array.byteLength);
    }
    if (out) array.fill(0, from * 3, end * 3);
    else array.set((mesh.userData.indices as Uint16Array).subarray(from * 3, end * 3), from * 3);
    index.needsUpdate = true;
  }

  /** The room each listed object of a sort (by its own triangles: a pole's frame not round its wires), or each tree of a model,
      takes that is shown now. */
  listedOf(sort: string) {
    const boxes: THREE.Box3[] = [];
    for (const id of idsOfSorts(this.host.data()!.objects, new Set([sort]))) {
      const box = this.shownObjectBounds(id);
      if (box) boxes.push(box);
    }
    return boxes.concat(this.host.trees().boxesOf(sort));
  }

  /** The TreeFX trees of a model shown now (Replace takes them). */
  treesOfModel(model: string) { return this.host.trees().idsOf(model); }

  /** The room an object takes that is shown now, null when it is left out or not loaded. */
  shownObjectBounds(id: string) {
    if (this.removedIds.has(id)) return null;
    if (id.startsWith(TREES)) return this.host.trees().bounds(id, true);
    return this.host.modelBounds(id.split("#")[0]) ?? this.shownBounds(this.piecesOf(id));
  }

  /** The room the pieces take that are loaded and not left out, or null. */
  shownBounds(pieces: Piece[]) {
    const box = new THREE.Box3(), corner = new THREE.Vector3();
    for (const {mesh, from, end} of pieces) {
      const part = this.host.mesh(mesh);
      const now = part?.geometry.getIndex()!.array as Uint16Array | undefined;
      if (!part || !now || from >= end || now[from * 3] === now[from * 3 + 1]) continue;     // (left out: shrunk to a point)
      const position = part.geometry.getAttribute("position");
      for (let k = from * 3; k < end * 3; k++) box.expandByPoint(corner.fromBufferAttribute(position, now[k]));
    }
    return box.isEmpty() ? null : box;
  }

  /** The room an object takes, over all its triangles that are loaded. */
  boundsOf(id: string) {
    if (id.startsWith(TREES)) return this.host.trees().bounds(id) ?? new THREE.Box3();
    const model = this.host.modelBounds(id.split("#")[0]);
    if (model) return model;
    const bounds = new THREE.Box3(), corner = new THREE.Vector3();
    for (const {mesh, from, end} of this.piecesOf(id)) {
      const part = this.host.mesh(mesh);
      if (!part) continue;
      const position = part.geometry.getAttribute("position");
      const indices = (part.userData.indices ?? part.geometry.getIndex()!.array) as Uint16Array;
      for (let k = from * 3; k < end * 3; k++) bounds.expandByPoint(corner.fromBufferAttribute(position, indices[k]));
    }
    return bounds;
  }
}
