// The track's TreeFX trees (CSP's 3D trees: src/app/tracktrees.py): drawn from the models in the track's own folder, as AC shows
// them, each where the draft puts it. They have no triangles in the kn5: their ids are "trees#<number>". Trees of one model in one
// 256 m cell are one instanced mesh, drawn at the LOD of the cell's distance as CSP switches them (the model's distances), the
// farthest one out to FAR_M, as far as the billboard trees show. What the draft leaves out shrinks to a point in its slot.
import * as THREE from "three";

export const CELL_M = 256;
export const FAR_M = 1200;          // (obj_to_kn5.VIEW: the billboard trees' distance, so both kinds end alike)
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
  lods: {distance: number; parts: {diffuse: string | null; normal_map: string | null; indices: number[]; pos: number[]; normals: number[]; uv: number[]}[]}[];
}

/** Where the trees, their models and images come from. */
export interface TreeFxSource {
  trees(): Promise<TreeFxTrees>;
  model(name: string): Promise<TreeFxModel>;
  texture(model: string, name: string): Promise<THREE.Texture>;
}

interface Part {geometry: THREE.BufferGeometry; material: THREE.Material}
interface Model {lods: {distance: number; parts: Part[]}[]; bytes: number}
interface Batch {model: string; members: number[]; meshes: THREE.InstancedMesh[]; lod: number}
interface Cell {centre: THREE.Vector3; radius: number; batches: Batch[]}

/** A tree's matrix: at its foot, turned by angle degrees counter-clockwise seen from above (as placement.py turns, east to north),
    size times its model high and size times width wide. Pure. */
export function treeMatrix(x: number, y: number, z: number, angle: number, size: number, width: number, out = new THREE.Matrix4()) {
  const a = angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), w = size * width;
  return out.set(c * w, 0, s * w, x, 0, size, 0, y, -s * w, 0, c * w, z, 0, 0, 0, 1);
}

/** The LOD drawn at distance m: the first whose distance is beyond it, the last out to far, -1 beyond. Pure. */
export function lodAt(distances: number[], distance: number, far = FAR_M) {
  const k = distances.findIndex(d => distance < d);
  return k >= 0 ? k : distance < far ? distances.length - 1 : -1;
}

/** A cell's key by a place. Pure. */
export function cellOf(x: number, z: number) { return `${Math.floor(x / CELL_M)},${Math.floor(z / CELL_M)}`; }

function geometryOf(part: TreeFxModel["lods"][number]["parts"][number]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(part.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(part.uv, 2));
  g.setIndex(part.indices);
  g.computeBoundingSphere();
  return g;
}

/** The trees drawn in a scene. load() takes the track's, dispose() lets them go. */
export class TreeFxDraw {
  private trees: TreeFxTrees | null = null;
  private models = new Map<string, Model>();
  private cells = new Map<string, Cell>();
  private index = new Map<string, number>();                // a tree's index by its id
  private out = new Set<number>();                          // the indexes shrunk to a point
  private named: {removed: ReadonlySet<string>; sorts: ReadonlySet<string>} = {removed: new Set(), sorts: new Set()};   // (as leaveOut was told)
  private version = 0;

  constructor(private scene: THREE.Scene, private source: TreeFxSource, private reserve: (bytes: number) => boolean = () => true) {}

  /** The trees as the server hands them out now, with the models they need; the cells built anew. Throws when they don't fit. */
  async load() {
    const version = ++this.version, trees = await this.source.trees();
    if (version !== this.version) return;
    const wanted = trees.models.filter((_, k) => trees.model.includes(k));
    for (const name of wanted) if (!this.models.has(name)) {
      const model = await this.makeModel(name);
      if (version !== this.version) { this.drop(model); return; }
      if (!this.reserve(model.bytes)) { this.drop(model); throw new Error("The 3D trees exceed the Editor memory limit"); }
      this.models.set(name, model);
    }
    this.take(trees);
  }

  /** The ids of the trees there are now, in the order of their numbers. */
  get ids(): readonly string[] { return this.trees?.ids ?? []; }

  /** A tree's model, place, turn and size as drawn, null for none. */
  tree(id: string) {
    const k = this.index.get(id), t = this.trees;
    if (k === undefined || !t) return null;
    return {model: t.models[t.model[k]], pos: t.pos.slice(3 * k, 3 * k + 3) as [number, number, number], base: t.base.slice(3 * k, 3 * k + 3),
            angle: t.angle[k], size: t.size[k], width: t.width[k]};
  }

  private async makeModel(name: string): Promise<Model> {
    const data = await this.source.model(name), images = new Map<string, Promise<THREE.Texture>>();
    const image = (file: string) => { if (!images.has(file)) images.set(file, this.source.texture(name, file)); return images.get(file)!; };
    const materials = new Map<string, THREE.Material>();
    let bytes = 0;
    const lods = await Promise.all(data.lods.map(async lod => ({distance: lod.distance, parts: await Promise.all(lod.parts.map(async part => {
      const key = part.diffuse ?? "";
      if (!materials.has(key)) {
        const map = part.diffuse ? await image(part.diffuse) : null;
        materials.set(key, new THREE.MeshLambertMaterial({map, alphaTest: ALPHA_REF, side: THREE.DoubleSide}));
      }
      bytes += 4 * (part.pos.length + part.normals.length + part.uv.length) + 2 * part.indices.length;
      return {geometry: geometryOf(part), material: materials.get(key)!};
    }))})));
    for (const texture of await Promise.all(images.values())) {
      const im = texture.image as {width?: number; height?: number} | undefined;
      bytes += Math.ceil((im?.width ?? 0) * (im?.height ?? 0) * 4 * 4 / 3);
    }
    return {lods, bytes};
  }

  private drop(model: Model) {
    const materials = new Set<THREE.Material>();
    for (const lod of model.lods) for (const part of lod.parts) { part.geometry.dispose(); materials.add(part.material); }
    for (const material of materials) { (material as THREE.MeshLambertMaterial).map?.dispose(); material.dispose(); }
  }

  /** The cells built for trees: a batch per model and cell, a mesh per part of its finest LOD, as many as the LOD with the most. */
  private take(trees: TreeFxTrees) {
    this.clearCells();
    this.trees = trees;
    this.index = new Map(trees.ids.map((id, k) => [id, k]));
    this.out = this.outOf(this.named.removed, this.named.sorts);
    const groups = new Map<string, Map<number, number[]>>();
    trees.ids.forEach((_, k) => {
      const key = cellOf(trees.pos[3 * k], trees.pos[3 * k + 2]), cell = groups.get(key) ?? new Map<number, number[]>();
      const members = cell.get(trees.model[k]) ?? [];
      members.push(k); cell.set(trees.model[k], members); groups.set(key, cell);
    });
    const bytes = trees.ids.length * 16 * 4 * 2;
    if (!this.reserve(bytes)) { this.trees = null; this.index.clear(); throw new Error("The 3D trees exceed the Editor memory limit"); }
    this.matrixBytes = bytes;
    const matrix = new THREE.Matrix4();
    for (const [key, byModel] of groups) {
      const batches: Batch[] = [], box = new THREE.Box3();
      for (const [m, members] of byModel) {
        const name = trees.models[m], model = this.models.get(name)!;
        const count = Math.max(...model.lods.map(lod => lod.parts.length));
        const meshes = Array.from({length: count}, (_, p) => {
          const part = model.lods[0].parts[p] ?? model.lods[0].parts[0];
          const mesh = new THREE.InstancedMesh(part.geometry, part.material, members.length);
          mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; mesh.visible = false; mesh.userData.treeFx = true;
          return mesh;
        });
        members.forEach((k, slot) => {
          this.place(k, matrix);
          for (const mesh of meshes) mesh.setMatrixAt(slot, matrix);
          box.expandByPoint(new THREE.Vector3(trees.pos[3 * k], trees.pos[3 * k + 1], trees.pos[3 * k + 2]));
        });
        for (const mesh of meshes) { mesh.computeBoundingSphere(); this.scene.add(mesh); }
        batches.push({model: name, members, meshes, lod: -2});
      }
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      this.cells.set(key, {centre: sphere.center, radius: sphere.radius, batches});
    }
  }

  private matrixBytes = 0;

  /** Tree k's matrix as drawn: shrunk to a point at its foot while it is left out. */
  private place(k: number, out: THREE.Matrix4) {
    const t = this.trees!, x = t.pos[3 * k], y = t.pos[3 * k + 1], z = t.pos[3 * k + 2];
    return this.out.has(k) ? out.makeScale(0, 0, 0).setPosition(x, y, z) : treeMatrix(x, y, z, t.angle[k], t.size[k], t.width[k], out);
  }

  /** What the draft leaves out: the trees of these ids and of the models in sorts; those no longer named come back. */
  leaveOut(removed: ReadonlySet<string>, sorts: ReadonlySet<string>) {
    this.named = {removed, sorts};
    if (!this.trees) return false;
    const out = this.outOf(removed, sorts);
    if (out.size === this.out.size && [...out].every(k => this.out.has(k))) return false;
    const changed = new Set([...out, ...this.out].filter(k => out.has(k) !== this.out.has(k)));
    this.out = out;
    const matrix = new THREE.Matrix4();
    for (const cell of this.cells.values()) for (const batch of cell.batches) {
      let touched = false;
      batch.members.forEach((k, slot) => {
        if (!changed.has(k)) return;
        this.place(k, matrix);
        for (const mesh of batch.meshes) mesh.setMatrixAt(slot, matrix);
        touched = true;
      });
      if (touched) for (const mesh of batch.meshes) mesh.instanceMatrix.needsUpdate = true;
    }
    return true;
  }

  /** The indexes of the trees of these ids and of the models in sorts. */
  private outOf(removed: ReadonlySet<string>, sorts: ReadonlySet<string>) {
    const t = this.trees!, out = new Set<number>();
    for (const id of removed) { const k = this.index.get(id); if (k !== undefined) out.add(k); }
    if (sorts.size) t.model.forEach((m, k) => { if (sorts.has(t.models[m])) out.add(k); });
    return out;
  }

  /** Each cell at the LOD of its distance from the camera (its nearest tree's, roughly), none beyond FAR_M. Whether any changed. */
  follow(camera: THREE.Vector3) {
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
          if (part) { mesh.geometry = part.geometry; mesh.material = part.material; }
        });
      }
    }
    return changed;
  }

  /** What is drawn, for tests and the browser's tools. */
  stats() {
    let meshes = 0, shown = 0;
    for (const cell of this.cells.values()) for (const batch of cell.batches) for (const mesh of batch.meshes) { meshes++; if (mesh.visible) shown++; }
    return {trees: this.trees?.ids.length ?? 0, out: this.out.size, cells: this.cells.size, meshes, shown, models: this.models.size};
  }

  private clearCells() {
    for (const cell of this.cells.values()) for (const batch of cell.batches) for (const mesh of batch.meshes) { this.scene.remove(mesh); mesh.dispose(); }
    this.cells.clear();
    if (this.matrixBytes) this.reserve(-this.matrixBytes);
    this.matrixBytes = 0;
  }

  dispose() {
    this.version++;
    this.clearCells();
    for (const model of this.models.values()) { this.drop(model); this.reserve(-model.bytes); }
    this.models.clear();
    this.trees = null; this.index.clear(); this.out.clear();
  }
}
