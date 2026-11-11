// The objects of the track the view shows: which triangles of the loaded meshes each takes (the build's list, the trees and
// bushes of billboard meshes), what belongs to which, and which the draft leaves out. A left out one's triangles shrink to a
// point: nothing draws or hits them, the others keep their numbers.
import * as THREE from "three";
import type {MeshInfo, TrackIndex} from "../types";
import {billboardFaces, billboardOf, childrenOf, countOfSort, idsOfSorts, objectAt, objectIndex, spriteAt, takenAlong} from "./inspect";
import {cutsOf, type SurfaceCut} from "./surfaceCuts";

export const NOT_MOVED = new Set(["power line"]);      // (placement.NOT_ALONE: a span goes where its poles go)

/** The triangles of a mesh that make up an object. */
export interface Piece {
  mesh: number;
  from: number;
  end: number;
}

/** What TrackObjects needs of the view it serves. */
export interface ObjectHost {
  data(): TrackIndex | null;            // the track's index as the view has it now
  mesh(i: number): THREE.Mesh | undefined;      // the loaded mesh number i
  loaded(): Iterable<THREE.Mesh>;       // all loaded meshes
  modelBounds(base: string): THREE.Box3 | null;  // the room an imported model's instance takes, null for none
  take(bytes: number): void;            // memory a mesh's copy of its indices takes
  changed(): void;                      // what is shown changed: drawn again, what the mouse points at looked at again
  removedChanged(): void;               // what is left out changed: the frames of marked sorts too
}

/** The objects of the track a view shows and what of them is left out. clear() forgets them. */
export class TrackObjects {
  private objectPieces: ReturnType<typeof objectIndex> = new Map();    // the build's objects by mesh number
  private belonging: ReturnType<typeof childrenOf> = new Map();        // what belongs to which of them
  private parts = new Map<string, THREE.Mesh[]>();      // a tile's billboard meshes by their base name
  private surfacesOut = new Map<string, [number, number][]>();   // the verge's triangles left out, by mesh name (as setRemovedSurfaces was told)
  private removedIds = new Set<string>();               // the ids of the objects left out, those of the sorts below too
  private feet = new WeakMap<THREE.Mesh, {version: number; trees: {k: number; from: number; at: [number, number, number]}[]}>();   // billboards' feet, per mesh as its vertices are
  private removedSorts = new Set<string>();             // the sorts of trees and bushes left out
  private named: {ids: string[]; objectSorts: Set<string>} = {ids: [], objectSorts: new Set()};    // (as setRemoved was told)
  private listedOut = new Map<number, Piece[]>();       // what of the listed objects left out lies in each mesh, for one loading later
  private billboardsOut = new Map<string, string[]>();  // the trees and bushes left out by id, by the base of their meshes, the same
  private host: ObjectHost;

  constructor(host: ObjectHost) {
    this.host = host;
  }

  /** The ids of the objects left out now. */
  get removed(): ReadonlySet<string> { return this.removedIds; }

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

  /** A mesh just loaded: a billboard mesh is known by its base. */
  add(mesh: THREE.Mesh) {
    const info = mesh.userData.info as MeshInfo;
    if (info.base === null || info.base === undefined) return;
    if (!this.parts.has(info.base)) this.parts.set(info.base, []);
    this.parts.get(info.base)!.push(mesh);
  }

  /** A mesh just loaded leaves out what the draft leaves out of it. */
  hideIn(mesh: THREE.Mesh) {
    const info = mesh.userData.info as MeshInfo;
    for (const piece of this.listedOut.get(info.i) ?? []) this.leaveOutIn(mesh, piece, true);
    for (const [from, count] of this.surfacesOut.get(info.name) ?? []) this.leaveOutIn(mesh, {mesh: info.i, from, end: from + count}, true);
    if (info.base !== null && info.base !== undefined) {
      for (const id of this.billboardsOut.get(info.base) ?? []) {
        for (const piece of this.piecesOf(id)) if (piece.mesh === info.i) this.leaveOutIn(mesh, piece, true);
      }
      this.leaveOutSorts(mesh);
    }
  }

  /** Another track: all forgotten. What is left out stays named until the draft says otherwise. */
  clear() {
    this.parts.clear();
    this.objectPieces = new Map();
    this.belonging = new Map();
  }

  /** The objects with these ids ("<mesh as built>#<number>"), the trees and bushes of sorts and the listed objects of objectSorts
      are left out from now on, those not named come back. What goes is what any of them takes along: a span two poles share stays
      out while one does. */
  setRemoved(ids: string[], sorts: string[] = [], objectSorts: string[] = []) {
    this.named = {ids, objectSorts: new Set(objectSorts)};
    const wantedSorts = new Set(sorts);
    const wanted = new Set([...ids, ...idsOfSorts(this.host.data()?.objects ?? {}, new Set([...objectSorts, ...sorts]))]);
    const sortsChanged = sorts.length !== this.removedSorts.size || sorts.some(sort => !this.removedSorts.has(sort));
    let back = false;
    for (const id of this.removedIds) {
      if (!wanted.has(id)) {
        this.leaveOut(id, false);
        back = true;
      }
    }
    if (sortsChanged) {
      this.removedSorts = wantedSorts;
      for (const mesh of this.billboardMeshes()) this.restore(mesh);
      back = true;
    }
    // (what came back may have held a part of what stays out: a house back, its sign deleted by itself)
    for (const id of wanted) if (back || !this.removedIds.has(id)) this.leaveOut(id, true);
    // (the sorts of trees last: a tree brought back by its id may be of a sort that stays out)
    if (back && this.removedSorts.size) for (const mesh of this.billboardMeshes()) this.leaveOutSorts(mesh);
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
    return new Set([...named.ids, ...(data?.model_replacements ?? []), ...idsOfSorts(data?.objects ?? {}, named.objectSorts), ...idsOfSorts(data?.objects ?? {}, this.removedSorts)]);
  }

  /** listedOut and billboardsOut for what is left out now: a whole sort of a long track is thousands of objects, too many to look
      through for each mesh that loads. */
  private noteListedOut() {
    this.listedOut = new Map();
    this.billboardsOut = new Map();
    for (const id of this.removedIds) {
      const base = id.slice(0, id.lastIndexOf("#"));
      if (!this.host.data()?.objects?.[base]) {
        if (!this.billboardsOut.has(base)) this.billboardsOut.set(base, []);
        this.billboardsOut.get(base)!.push(id);
        continue;
      }
      for (const piece of this.piecesOf(id)) {
        if (!this.listedOut.has(piece.mesh)) this.listedOut.set(piece.mesh, []);
        this.listedOut.get(piece.mesh)!.push(piece);
      }
    }
  }

  /** How many objects of a listed sort the track still shows, over all of it, with these edits (the page's, as it renders: the
      view takes them only after): what the button to delete them all says. */
  countOfListed(sort: string, ids: string[], objectSorts: string[]) {
    const data = this.host.data();
    if (!data) return 0;
    return countOfSort(data.objects, sort, takenAlong(this.wanted({ids, objectSorts: new Set(objectSorts)}), this.belonging));
  }

  /** The loaded billboard meshes. */
  billboardMeshes() {
    return [...this.parts.values()].flat();
  }

  /** A mesh's indices as built, all it left out back. */
  private restore(mesh: THREE.Mesh) {
    const original = mesh.userData.indices as Uint16Array | undefined;
    if (!original) return;
    const index = mesh.geometry.getIndex()!;
    (index.array as Uint16Array).set(original);
    index.needsUpdate = true;
  }

  /** The billboards of a mesh part: [number, first triangle, end]. */
  *billboardsOf(mesh: THREE.Mesh): Generator<[number, number, number]> {
    const info = mesh.userData.info as MeshInfo, faces = info.indices / 3, first = info.first_face!;
    for (let k = billboardOf(0, first); k <= billboardOf(Math.max(0, faces - 1), first); k++) {
      const [from, end] = billboardFaces(k, first, faces);
      if (from < end) yield [k, from, end];
    }
  }

  /** The sort of the billboard whose triangles start at face in mesh, by where its first triangle lies on the atlas. */
  spriteOf(mesh: THREE.Mesh, face: number) {
    const uv = mesh.geometry.getAttribute("uv");
    const indices = (mesh.userData.indices ?? mesh.geometry.getIndex()!.array) as Uint16Array;
    const [a, b, c] = [indices[face * 3], indices[face * 3 + 1], indices[face * 3 + 2]];
    return spriteAt(this.host.data()!.atlas, (uv.getX(a) + uv.getX(b) + uv.getX(c)) / 3, (uv.getY(a) + uv.getY(b) + uv.getY(c)) / 3);
  }

  private leaveOutSorts(mesh: THREE.Mesh) {
    if (!this.removedSorts.size || !this.host.data()) return;
    const info = mesh.userData.info as MeshInfo;
    for (const [, from, end] of this.billboardsOf(mesh)) {
      const sprite = this.spriteOf(mesh, from);
      if (sprite && this.removedSorts.has(sprite)) this.leaveOutIn(mesh, {mesh: info.i, from, end}, true);
    }
  }

  /** Whether a tree or bush of the sort of the billboard at face in mesh is left out as its sort. */
  sortRemoved(mesh: THREE.Mesh, face: number) { return this.removedSorts.has(this.spriteOf(mesh, face) ?? ""); }

  /** How many trees or bushes of a sort are loaded. */
  countOf(sprite: string) {
    const seen = new Set<string>();
    for (const mesh of this.billboardMeshes()) {
      const info = mesh.userData.info as MeshInfo;
      for (const [k, from] of this.billboardsOf(mesh)) if (this.spriteOf(mesh, from) === sprite) seen.add(`${info.base}#${k}`);
    }
    for (const id of idsOfSorts(this.host.data()?.objects ?? {}, new Set([sprite]))) {
      if (!this.removedIds.has(id) && this.shownObjectBounds(id)) seen.add(id);
    }
    return seen.size;
  }

  /** All triangles of an object and what belongs to it that are known by now: a billboard's in the parts of its mesh loaded so
      far. */
  piecesOf(id: string, withChildren = true): Piece[] {
    const at = id.lastIndexOf("#"), base = id.slice(0, at), number = Number(id.slice(at + 1));
    const listed = this.host.data()?.objects?.[base]?.faces[number];
    if (listed) {
      return [...listed.map(([mesh, from, count]) => ({mesh, from, end: from + count})),
              ...(withChildren ? (this.belonging.get(id) ?? []).flatMap(child => this.piecesOf(child)) : [])];
    }
    return (this.parts.get(base) ?? []).map(part => {
      const info = part.userData.info as MeshInfo, [from, end] = billboardFaces(number, info.first_face!, info.indices / 3);
      return {mesh: info.i, from, end};
    }).filter(p => p.from < p.end);
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

  /** Each billboard of a mesh part at the middle of its foot, worked out once while its vertices stay as they are (Move changes them). */
  treeFeet(mesh: THREE.Mesh) {
    const position = mesh.geometry.getAttribute("position"), known = this.feet.get(mesh);
    const version = position instanceof THREE.InterleavedBufferAttribute ? position.data.version : position.version;     // (interleaved: its buffer's)
    if (known && known.version === version) return known.trees;
    const indices = (mesh.userData.indices ?? mesh.geometry.getIndex()!.array) as Uint16Array, corner = new THREE.Vector3(), trees = [];
    for (const [k, from, end] of this.billboardsOf(mesh)) {
      const bounds = new THREE.Box3();
      for (let i = from * 3; i < end * 3; i++) bounds.expandByPoint(corner.fromBufferAttribute(position, indices[i]));
      const middle = bounds.getCenter(corner);
      trees.push({k, from, at: [middle.x, bounds.min.y, middle.z] as [number, number, number]});
    }
    this.feet.set(mesh, {version, trees});
    return trees;
  }

  /** The room each listed object of a sort takes that is shown now, by its own triangles (a pole's frame not round its wires). */
  listedOf(sort: string) {
    const boxes: THREE.Box3[] = [];
    for (const id of idsOfSorts(this.host.data()!.objects, new Set([sort]))) {
      const box = this.shownObjectBounds(id);
      if (box) boxes.push(box);
    }
    return boxes;
  }

  /** The same for the trees or bushes of an atlas image that are loaded. */
  treesOf(sprite: string) {
    const byId = new Map<string, Piece[]>();
    for (const mesh of this.billboardMeshes()) {
      const info = mesh.userData.info as MeshInfo;
      for (const [k, from, end] of this.billboardsOf(mesh)) {
        if (this.spriteOf(mesh, from) !== sprite) continue;
        const id = `${info.base}#${k}`;
        byId.set(id, [...(byId.get(id) ?? []), {mesh: info.i, from, end}]);
      }
    }
    return [...byId.values()].map(pieces => this.shownBounds(pieces)).filter(box => box !== null).concat(this.listedOf(sprite));
  }

  /** The room an object takes that is shown now, null when it is left out or not loaded. */
  shownObjectBounds(id: string) {
    if (this.removedIds.has(id)) return null;
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
