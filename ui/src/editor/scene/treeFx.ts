// The track's TreeFX trees (CSP's 3D trees: src/app/tracktrees.py): drawn from the models in the track's own folder, as AC shows
// them, each where the draft puts it. They have no triangles in the kn5: their ids are "trees#<number>". Trees of one model in one
// 256 m cell are one instanced mesh, drawn at the LOD of the cell's distance as CSP switches them (the model's distances), the
// farthest one out to FAR_M. What the draft leaves out shrinks to a point in its slot.
// The track's trees come once when it opens (load); after that each answer of the draft names only the trees it changed (apply):
// a tree that stays in its cell gets its slot rewritten, one that leaves or joins a cell only has those two batches built anew.
import * as THREE from "three";
import type {TreeFxChange, TreeFxTree} from "../types";
import {bindSeason, hiddenSeasonFoliage, seasonNumber} from "./seasons";
import type {Season} from "./weather";

export type {TreeFxChange, TreeFxTree};

export const CELL_M = 256;
export const FAR_M = 3600;          // overview: three times the former reach, extending only the cheapest LOD
const ALPHA_REF = 0.5;              // (obj_to_kn5.ALPHA_REF of the trees)

/** The trees as the server hands them out (trackview.treefx): flat arrays, a tree per index. */
export interface TreeFxTrees {
  revision: string;
  draft: number;
  next: number;
  ids: string[];
  models: string[];
  model: number[];
  pos: number[];                    // where the draft puts each, x, y, z
  base: number[];                   // where the list has each
  angle: number[];
  size: number[];
  width: number[];
}


/** A model as the server reads it from the track's .bin (trackview.treefx_model). */
export interface TreeFxModel {
  height: number;
  width: number;
  seasonal?: {deciduous: boolean; species: string; season: string};
  lods: {distance: number; parts: {diffuse: string | null; normal_map: string | null; indices: number[]; pos: number[]; normals: number[]; uv: number[]}[]}[];
}

/** Where the trees, their models and images come from. */
export interface TreeFxSource {
  trees(): Promise<TreeFxTrees>;
  model(name: string): Promise<TreeFxModel>;
  texture(model: string, name: string): Promise<THREE.Texture>;
}

interface Part {geometry: THREE.BufferGeometry; material: THREE.Material}
interface Model {lods: {distance: number; parts: Part[]}[]; bytes: number; height: number; width: number}
interface Batch {key: string; cell: string; model: string; members: string[]; meshes: THREE.InstancedMesh[]; lod: number}
interface Cell {centre: THREE.Vector3; radius: number; batches: Set<Batch>}

/** A tree's matrix: at its foot, turned by angle degrees counter-clockwise seen from above (as placement.py turns, east to north),
    size times its model high and size times width wide. Pure. */
export function treeMatrix(x: number, y: number, z: number, angle: number, size: number, width: number, out = new THREE.Matrix4()) {
  const a = angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), w = size * width;
  return out.set(c * w, 0, s * w, x, 0, size, 0, y, -s * w, 0, c * w, z, 0, 0, 0, 1);
}

/** A tree's matrix as the draft can say it: its foot to the mm, its turn to the degree, its size and width to a thousandth
    (tracktrees.placed rounds them so), turned and scaled upright only. What Move shows is what the server's answer will be. Pure. */
export function snapped(matrix: THREE.Matrix4, out = new THREE.Matrix4()) {
  const e = matrix.elements, size = Math.hypot(e[4], e[5], e[6]), wide = Math.hypot(e[0], e[1], e[2]);
  const round = (v: number, digits: number) => Math.round(v * 10 ** digits) / 10 ** digits;
  const angle = ((Math.round(Math.atan2(-e[2], e[0]) * 180 / Math.PI) % 360) + 360) % 360;
  return treeMatrix(round(e[12], 3), round(e[13], 3), round(e[14], 3), angle, round(size, 3), round(wide / size, 3), out);
}

/** The LOD drawn at distance m: the first whose distance is beyond it, the last out to far, -1 beyond. Pure. */
export function lodAt(distances: number[], distance: number, far = FAR_M) {
  const k = distances.findIndex(d => distance < d);
  return k >= 0 ? k : distance < far ? distances.length - 1 : -1;
}

/** A cell's key by a place. Pure. */
export function cellOf(x: number, z: number) { return `${Math.floor(x / CELL_M)},${Math.floor(z / CELL_M)}`; }

/** later's changes after earlier's, as one: a tree's last state counts, one gone and added again is there. Pure. */
export function mergeChanges(earlier: TreeFxChange | null, later: TreeFxChange): TreeFxChange {
  const trees = {...earlier?.trees}, gone = new Set(earlier?.gone);
  for (const id of later.gone) { delete trees[id]; gone.add(id); }
  for (const [id, tree] of Object.entries(later.trees)) { trees[id] = tree; gone.delete(id); }
  return {trees, gone: [...gone]};
}

function geometryOf(part: TreeFxModel["lods"][number]["parts"][number]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(part.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(part.uv, 2));
  g.setIndex(part.indices);
  g.computeBoundingSphere();
  return g;
}

const batchKey = (tree: TreeFxTree) => `${cellOf(tree.pos[0], tree.pos[2])}/${tree.model}`;
const MATRIX_BYTES = 16 * 4 * 2;        // (a slot's matrix, on the CPU and uploaded)

/** The trees drawn in a scene. load() takes the track's, apply() what the draft changed, dispose() lets them go. */
export class TreeFxDraw {
  private season = {value: 1};

  setSeason(season: Season) { this.season.value = seasonNumber(season); }
  private trees = new Map<string, TreeFxTree>();
  private models = new Map<string, Model>();
  private batches = new Map<string, Batch>();
  private cells = new Map<string, Cell>();
  private slots = new Map<string, [Batch, number]>();       // a tree's batch and slot in it
  private out = new Set<string>();                          // the trees shrunk to a point
  private moved = new Map<string, THREE.Matrix4>();         // trees Move shows elsewhere until the server's answer comes (nudge)
  private movedCells = new Set<string>();
  private movedMeshes = new Set<THREE.InstancedMesh>();
  private named: {removed: ReadonlySet<string>; sorts: ReadonlySet<string>} = {removed: new Set(), sorts: new Set()};   // (as leaveOut was told)
  private version = 0;
  private matrixBytes = 0;

  constructor(private scene: THREE.Scene, private source: TreeFxSource, private reserve: (bytes: number) => boolean = () => true) {}

  /** The trees as the server hands them out now, with the models they need; all batches built anew. Throws when they don't fit. */
  async load() {
    const version = ++this.version, answer = await this.source.trees();
    if (version !== this.version) return;
    if (!await this.needModels(answer.models.filter((_, k) => answer.model.includes(k)), version)) return;
    this.clearBatches();
    this.trees = new Map(answer.ids.map((id, k) => [id, {model: answer.models[answer.model[k]], pos: answer.pos.slice(3 * k, 3 * k + 3),
      base: answer.base.slice(3 * k, 3 * k + 3), angle: answer.angle[k], size: answer.size[k], width: answer.width[k]}]));
    this.moved.clear();
    this.out = this.outOf(this.named.removed, this.named.sorts);
    const dirty = new Set<string>();
    for (const [id, tree] of this.trees) { this.join(id, tree); dirty.add(batchKey(tree)); }
    this.rebuild(dirty);
  }

  /** What a draft answer changed: those trees rewritten in their slots, or moved to the batch of their new cell; those gone taken out.
      What Move showed of them gives way to the server's. */
  async apply(change: TreeFxChange) {
    const version = this.version;
    if (!await this.needModels([...new Set(Object.values(change.trees).map(t => t.model))], version)) return;
    const dirty = new Set<string>(), rewrite: string[] = [];
    for (const id of change.gone) {
      const slot = this.slots.get(id);
      if (slot) { this.leave(id, slot[0]); dirty.add(slot[0].key); }
      this.trees.delete(id); this.moved.delete(id); this.out.delete(id);
    }
    for (const [id, tree] of Object.entries(change.trees)) {
      const slot = this.slots.get(id), key = batchKey(tree);
      this.trees.set(id, tree); this.moved.delete(id);
      if (slot && slot[0].key === key) { rewrite.push(id); continue; }
      if (slot) { this.leave(id, slot[0]); dirty.add(slot[0].key); }
      this.join(id, tree); dirty.add(key);
    }
    this.out = this.outOf(this.named.removed, this.named.sorts);
    this.rebuild(dirty);
    this.rewrite(rewrite.filter(id => !dirty.has(this.slots.get(id)?.[0].key ?? "")));
  }

  /** The models of names loaded once each; false when the trees asked for meanwhile are newer (version). Throws when they don't fit. */
  private async needModels(names: string[], version: number) {
    for (const name of names) if (!this.models.has(name)) {
      const model = await this.makeModel(name);
      if (version !== this.version) { this.drop(model); return false; }
      if (this.models.has(name)) { this.drop(model); continue; }
      if (!this.reserve(model.bytes)) { this.drop(model); throw new Error("The 3D trees exceed the Editor memory limit"); }
      this.models.set(name, model);
    }
    return true;
  }

  /** The ids of the trees there are now. */
  get ids(): string[] { return [...this.trees.keys()]; }

  /** A tree's model, place, turn and size as drawn, null for none. */
  tree(id: string) { return this.trees.get(id) ?? null; }

  /** A library tree's live model pose, before the draft request completes; only its slot changes, not every tree's buffers. */
  transform(id: string, matrix: THREE.Matrix4) {
    const slot = this.slots.get(id), tree = this.trees.get(id);
    if (!slot || !tree) return;
    const e = matrix.elements, size = Math.hypot(e[4], e[5], e[6]);
    this.trees.set(id, {...tree, pos: [e[12], e[13], e[14]], size,
      width: Math.hypot(e[0], e[1], e[2]) / size, angle: Math.atan2(e[8], e[0]) * 180 / Math.PI});
    this.moved.set(id, matrix.clone());
    const shown = this.place(id, new THREE.Matrix4());
    for (const mesh of slot[0].meshes) { mesh.setMatrixAt(slot[1], shown); mesh.instanceMatrix.needsUpdate = true; this.movedMeshes.add(mesh); }
    this.movedCells.add(slot[0].cell);
  }

  private async makeModel(name: string): Promise<Model> {
    const data = await this.source.model(name), images = new Map<string, Promise<THREE.Texture>>();
    const image = (file: string) => { if (!images.has(file)) images.set(file, this.source.texture(name, file)); return images.get(file)!; };
    const materials = new Map<string, Promise<THREE.Material>>();
    const material = (file: string | null) => {
      if (!materials.has(file ?? "")) materials.set(file ?? "", (file ? image(file) : Promise.resolve(null))
        .then(map => {
          const m = new THREE.MeshLambertMaterial({map, alphaTest: ALPHA_REF, side: THREE.DoubleSide});
          if (data.seasonal) bindSeason(m, this.season, true, data.seasonal.deciduous, ["birch", "larch"].includes(data.seasonal.species));
          return m;
        }));
      return materials.get(file ?? "")!;
    };
    let bytes = 0;
    const lods = await Promise.all(data.lods.map(async lod => ({distance: lod.distance, parts: await Promise.all(lod.parts.map(async part => {
      bytes += 4 * (part.pos.length + part.normals.length + part.uv.length) + 2 * part.indices.length;
      return {geometry: geometryOf(part), material: await material(part.diffuse)};
    }))})));
    for (const texture of await Promise.all(images.values())) {
      const im = texture.image as {width?: number; height?: number} | undefined;
      bytes += Math.ceil((im?.width ?? 0) * (im?.height ?? 0) * 4 * 4 / 3);
    }
    return {lods, bytes, height: data.height, width: data.width};
  }

  private drop(model: Model) {
    const materials = new Set<THREE.Material>();
    for (const lod of model.lods) for (const part of lod.parts) { part.geometry.dispose(); materials.add(part.material); }
    for (const material of materials) {
      const map = (material as THREE.MeshLambertMaterial).map;
      map?.dispose();
      if (typeof ImageBitmap !== "undefined" && map?.image instanceof ImageBitmap) map.image.close();     // (its pixels go now, not with the page)
      material.dispose();
    }
  }

  /** A tree into the members of its batch, which is made when it is the first. */
  private join(id: string, tree: TreeFxTree) {
    const key = batchKey(tree);
    let batch = this.batches.get(key);
    if (!batch) {
      batch = {key, cell: cellOf(tree.pos[0], tree.pos[2]), model: tree.model, members: [], meshes: [], lod: -2};
      this.batches.set(key, batch);
    }
    batch.members.push(id);
  }

  /** A tree out of the members of its batch. */
  private leave(id: string, batch: Batch) {
    batch.members.splice(batch.members.indexOf(id), 1);
    this.slots.delete(id);
  }

  /** The batches of these keys built anew from their members, a mesh per part of their model's LOD with the most; one without
      members goes. Their cells' rooms follow. Throws when their matrices don't fit. */
  private rebuild(keys: Set<string>) {
    const delta = [...keys].reduce((n, key) => {
      const batch = this.batches.get(key);
      return n + (batch ? (batch.members.length - (batch.meshes[0]?.count ?? 0)) * MATRIX_BYTES : 0);
    }, 0);
    if (delta > 0 && !this.reserve(delta)) throw new Error("The 3D trees exceed the Editor memory limit");
    if (delta < 0) this.reserve(delta);
    this.matrixBytes += delta;
    const cells = new Set<string>(), matrix = new THREE.Matrix4();
    for (const key of keys) {
      const batch = this.batches.get(key);
      if (!batch) continue;
      for (const mesh of batch.meshes) { this.scene.remove(mesh); mesh.dispose(); }
      batch.meshes = [];
      cells.add(batch.cell);
      if (!batch.members.length) { this.batches.delete(key); this.cells.get(batch.cell)?.batches.delete(batch); continue; }
      const model = this.models.get(batch.model)!;
      const count = Math.max(...model.lods.map(lod => lod.parts.length));
      batch.meshes = Array.from({length: count}, (_, p) => {
        const part = model.lods[Math.max(0, batch.lod)]?.parts[p] ?? model.lods[0].parts[0];
        const mesh = new THREE.InstancedMesh(part.geometry, part.material, batch.members.length);
        mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; mesh.visible = false; mesh.userData.treeFx = batch.members;
        return mesh;
      });
      batch.members.forEach((id, slot) => {
        this.slots.set(id, [batch, slot]);
        this.place(id, matrix);
        for (const mesh of batch.meshes) mesh.setMatrixAt(slot, matrix);
      });
      for (const mesh of batch.meshes) { mesh.computeBoundingSphere(); this.scene.add(mesh); }
      batch.lod = -2;                   // (follow sets its LOD and shows it)
      const cell = this.cells.get(batch.cell) ?? {centre: new THREE.Vector3(), radius: 0, batches: new Set<Batch>()};
      cell.batches.add(batch); this.cells.set(batch.cell, cell);
    }
    for (const key of cells) {
      const cell = this.cells.get(key);
      if (!cell) continue;
      if (!cell.batches.size) { this.cells.delete(key); continue; }
      const box = new THREE.Box3();
      for (const batch of cell.batches) for (const id of batch.members) box.expandByPoint(new THREE.Vector3().fromArray(this.trees.get(id)!.pos));
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      cell.centre = sphere.center; cell.radius = sphere.radius;
    }
  }

  /** The slots of these trees written again as they are drawn now. */
  private rewrite(ids: Iterable<string>) {
    const matrix = new THREE.Matrix4(), touched = new Set<Batch>();
    for (const id of ids) {
      const slot = this.slots.get(id);
      if (!slot) continue;
      this.place(id, matrix);
      for (const mesh of slot[0].meshes) mesh.setMatrixAt(slot[1], matrix);
      touched.add(slot[0]);
    }
    for (const batch of touched) for (const mesh of batch.meshes) { mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); }
  }

  /** A tree's matrix as drawn: as Move shows it, shrunk to a point at its foot while it is left out. */
  private place(id: string, out: THREE.Matrix4) {
    const pos = this.trees.get(id)!.pos;
    return this.out.has(id) ? out.makeScale(0, 0, 0).setPosition(pos[0], pos[1], pos[2]) : this.matrixOf(id, out);
  }

  private matrixOf(id: string, out = new THREE.Matrix4()) {
    const moved = this.moved.get(id), t = this.trees.get(id)!;
    return moved ? out.copy(moved) : treeMatrix(t.pos[0], t.pos[1], t.pos[2], t.angle, t.size, t.width, out);
  }

  /** A tree's finest LOD as Copy's ghost shows it: each part's shared geometry and material, and the tree's matrix; null for none. */
  parts(id: string) {
    const tree = this.trees.get(id), model = tree && this.models.get(tree.model);
    if (!tree || !model) return null;
    return model.lods[0].parts.map(part => ({...part, matrix: this.matrixOf(id)}));
  }

  /** A tree's matrix as drawn now, null for none. */
  matrix(id: string) { return this.trees.has(id) ? this.matrixOf(id) : null; }

  /** A tree shown turned, raised, scaled and moved by transform around pivot from initial (its matrix when Move took it up), in the
      view only: the server's answer takes its place when it comes (apply). */
  nudge(id: string, pivot: number[], transform: THREE.Matrix4, initial: THREE.Matrix4) {
    if (!this.slots.has(id)) return;
    this.version++;                     // (trees on their way are older than this: they would set it back)
    const [x, y, z] = pivot;
    this.moved.set(id, snapped(initial.clone().premultiply(new THREE.Matrix4().makeTranslation(-x, -y, -z))
      .premultiply(transform).premultiply(new THREE.Matrix4().makeTranslation(x, y, z))));
    this.rewrite([id]);
  }

  /** What Move showed of these trees goes: the server refused it. */
  forget(ids: string[]) {
    const shown = ids.filter(id => this.moved.delete(id));
    this.rewrite(shown);
  }

  /** What the draft leaves out: the trees of these ids and of the models in sorts; those no longer named come back. Whether any changed. */
  leaveOut(removed: ReadonlySet<string>, sorts: ReadonlySet<string>) {
    this.named = {removed, sorts};
    const out = this.outOf(removed, sorts);
    const changed = [...out, ...this.out].filter(id => out.has(id) !== this.out.has(id));
    if (!changed.length) return false;
    this.out = out;
    this.rewrite(changed);
    return true;
  }

  /** The trees there are of these ids and of the models in sorts. */
  private outOf(removed: ReadonlySet<string>, sorts: ReadonlySet<string>) {
    const out = new Set<string>();
    for (const id of removed) if (this.trees.has(id)) out.add(id);
    if (sorts.size) for (const [id, tree] of this.trees) if (sorts.has(tree.model)) out.add(id);
    return out;
  }

  /** Each cell at the LOD of its distance from the camera (its nearest tree's, roughly), none beyond FAR_M. Whether any changed. */
  follow(camera: THREE.Vector3) {
    for (const key of this.movedCells) {
      const cell = this.cells.get(key);
      if (!cell) continue;
      const box = new THREE.Box3(), p = new THREE.Vector3(), matrix = new THREE.Matrix4();
      for (const batch of cell.batches) for (const id of batch.members) box.expandByPoint(p.setFromMatrixPosition(this.matrixOf(id, matrix)));
      const sphere = box.getBoundingSphere(new THREE.Sphere()); cell.centre.copy(sphere.center); cell.radius = sphere.radius;
    }
    this.movedCells.clear();
    let changed = false;
    for (const cell of this.cells.values()) {
      const distance = Math.max(0, camera.distanceTo(cell.centre) - cell.radius);
      for (const batch of cell.batches) {
        const model = this.models.get(batch.model)!, lod = lodAt(model.lods.map(l => l.distance), distance);
        if (lod === batch.lod) continue;
        batch.lod = lod; changed = true;
        batch.meshes.forEach((mesh, p) => {
          const part = lod >= 0 ? model.lods[lod].parts[p] : undefined;
          mesh.visible = !!part;
          if (part) { mesh.geometry = part.geometry; mesh.material = part.material; this.movedMeshes.add(mesh); }
        });
      }
    }
    // Several moved trees can share a cell: scan its transform buffer once, not once per moved tree.
    for (const mesh of this.movedMeshes) mesh.computeBoundingSphere();
    this.movedMeshes.clear();
    return changed;
  }

  /** Where a ray meets the trees drawn now (a left out one is a point: it meets none), nearest first; each hit's instanceId its slot. */
  intersections(picker: THREE.Raycaster) {
    const hits: THREE.Intersection[] = [];
    for (const batch of this.batches.values()) for (const mesh of batch.meshes) if (mesh.visible) picker.intersectObject(mesh, false, hits);
    return hits.filter(hit => !hiddenSeasonFoliage((hit.object as THREE.Mesh).material as THREE.Material, hit.uv))
      .sort((a, b) => a.distance - b.distance);
  }

  /** The id of the tree a hit of intersections met, null for a hit of anything else. */
  idOf(hit: THREE.Intersection) {
    const members = hit.object.userData.treeFx as string[] | undefined;
    return members && hit.instanceId !== undefined ? members[hit.instanceId] ?? null : null;
  }

  /** What the hover box says of a tree: its model, its .bin's triangles at the LOD drawn, its height and width. */
  facts(id: string, hit?: THREE.Intersection) {
    const tree = this.tree(id), model = tree && this.models.get(tree.model);
    if (!tree || !model) return null;
    const geometry = (hit?.object as THREE.Mesh | undefined)?.geometry ?? model.lods[0].parts[0].geometry;
    return {...tree, height: model.height * tree.size, width: model.width * tree.size * tree.width,
            vertices: geometry.getAttribute("position").count, triangles: (geometry.index?.count ?? 0) / 3,
            texture: (((hit?.object as THREE.Mesh | undefined)?.material ?? model.lods[0].parts[0].material) as THREE.MeshLambertMaterial)?.map?.name ?? null};
  }

  /** The room a tree takes as drawn (its model's height and width, as turned), null for none; shown: null too while it is left out. */
  bounds(id: string, shown = false) {
    if (!this.trees.has(id) || (shown && this.out.has(id))) return null;
    const model = this.models.get(this.trees.get(id)!.model);
    if (!model) return null;
    const r = model.width / 2;
    return new THREE.Box3(new THREE.Vector3(-r, 0, -r), new THREE.Vector3(r, model.height, r)).applyMatrix4(this.matrixOf(id));
  }

  /** The feet of the trees whose foot lies in the box from x0, z0 to x1, z1, where they stand as drawn (Move's too), with their
      model: what Delete's brush could take there. Those shrunk to a point count too: the brush's own stroke leaves them out while it
      runs, and takes them when it ends (the brush leaves out what the draft does). Only the batches of the cells the box touches are
      looked through. */
  feet(x0: number, z0: number, x1: number, z1: number) {
    const found: {id: string; model: string; at: [number, number, number]}[] = [], at = new THREE.Vector3();
    const [cx0, cz0, cx1, cz1] = [x0, z0, x1, z1].map(v => Math.floor(v / CELL_M));
    for (const batch of this.batches.values()) {
      const [cx, cz] = batch.cell.split(",").map(Number);
      if (cx < cx0 || cx > cx1 || cz < cz0 || cz > cz1) continue;
      for (const id of batch.members) {
        at.setFromMatrixPosition(this.matrixOf(id));
        if (at.x >= x0 && at.x <= x1 && at.z >= z0 && at.z <= z1) found.push({id, model: batch.model, at: [at.x, at.y, at.z]});
      }
    }
    return found;
  }

  /** The rooms of the trees of a model shown now. */
  boxesOf(model: string) {
    const boxes: THREE.Box3[] = [];
    for (const [id, tree] of this.trees) if (tree.model === model) { const box = this.bounds(id, true); if (box) boxes.push(box); }
    return boxes;
  }

  /** The ids of the trees of a model shown now. */
  idsOf(model?: string) {
    return [...this.trees].filter(([id, tree]) => (!model || tree.model === model) && !this.out.has(id)).map(([id]) => id);
  }

  /** How many trees of a model stay with these edits (ids and object sorts left out, as the page has them). */
  countOf(model: string, ids: ReadonlySet<string>, sorts: ReadonlySet<string>) {
    if (sorts.has(model)) return 0;
    let n = 0;
    for (const [id, tree] of this.trees) if (tree.model === model && !ids.has(id)) n++;
    return n;
  }

  /** Generated/copied trees remaining across the track; library instances are counted by the object list. */
  countTrees(ids: ReadonlySet<string>, sorts: ReadonlySet<string>) {
    let count = 0;
    for (const [id, tree] of this.trees) {
      if (id.startsWith('trees#') && !/shrub|bush/.test(tree.model) && !ids.has(id) && !sorts.has(tree.model)) count++;
    }
    return count;
  }

  /** What is drawn, for tests and the browser's tools. */
  stats() {
    let meshes = 0, shown = 0;
    for (const batch of this.batches.values()) for (const mesh of batch.meshes) { meshes++; if (mesh.visible) shown++; }
    return {trees: this.trees.size, out: this.out.size, cells: this.cells.size, batches: this.batches.size, meshes, shown, models: this.models.size};
  }

  private clearBatches() {
    for (const batch of this.batches.values()) for (const mesh of batch.meshes) { this.scene.remove(mesh); mesh.dispose(); }
    this.batches.clear(); this.cells.clear(); this.slots.clear();
    this.movedCells.clear(); this.movedMeshes.clear();
    if (this.matrixBytes) this.reserve(-this.matrixBytes);
    this.matrixBytes = 0;
  }

  dispose() {
    this.version++;
    this.clearBatches();
    for (const model of this.models.values()) { this.drop(model); this.reserve(-model.bytes); }
    this.models.clear();
    this.trees.clear(); this.out.clear(); this.moved.clear();
  }
}
