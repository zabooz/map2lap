// The placement ghost of Copy and Insert: a translucent copy of an object or library model follows the mouse on the ground with
// the tool's turn, height and size; each left click places another. What a click places shows solid at once (pending) until the
// server's instance is drawn, or a later draft no longer has it.
import * as THREE from "three";
import type {TrackIndex} from "../types";
import type {CopyPose} from "../tools/copying";
import {ModelDraw} from "./modelDraw";
import type {TreeFxDraw} from "./treeFx";
import type {TrackObjects} from "./trackObjects";

/** What the ghost needs of the view it serves. */
export interface GhostHost {
  scene: THREE.Scene;
  objects: TrackObjects;
  models(): ModelDraw;                  // the track's imported models
  trees(): Pick<TreeFxDraw, "parts">;   // the track's TreeFX trees
  mesh(i: number): THREE.Mesh | undefined;      // the loaded mesh number i
  canMove(id: string): boolean;         // whether a copy takes it along (not a span of wires)
  pivotOf(id: string): number[];        // where an object stands now
  ground(): [number, number, number] | null;    // the ground under the mouse
  look(): number[];                     // what the ghost's place depends on besides its pose: mouse, camera, ground, buttons
  shown(): boolean;                     // the view's tab is open
  held(): boolean;                      // a mouse button is held (a drag moves the view: the ghost waits)
  modelLight(): THREE.Texture;          // the models' shared lighting
  reflections(): number;                // the power of their reflections now
  reserve(bytes: number): boolean;      // takes bytes of the memory limit; false: they don't fit, nothing taken
  release(bytes: number): void;
  failed(message: string): void;        // the view shows the fault
  changed(): void;                      // the view is to be drawn again
  placingChanged(): void;               // whether the ghost places changed: the mouse pointer follows
}

/** The ghost of a view: setCopy and setModel show one, follow() keeps it under the mouse each frame. */
export class PlacementGhost {
  private ghost: THREE.Group | null = null;
  private release: (() => void) | null = null;
  private version = 0;
  private solid: THREE.Object3D | null = null;       // the ghost's model with its own materials, for a click to show at once
  private hold: (() => () => void) | null = null;    // keeps the ghost's loaded model until the returned call
  private pending = new Map<number, {root: THREE.Group; release: () => void; instance?: string; draft?: number}>();
  private pendingKey = 0;
  private foot = new THREE.Vector3();
  private pose: CopyPose = {turn: 0, y: 0, scale: 1};
  private stamp: number[] = [];
  private onPlace: ((at: [number, number, number]) => void) | null = null;
  private host: GhostHost;

  constructor(host: GhostHost) {
    this.host = host;
  }

  /** Whether a left click places now. */
  get placing() { return !!this.onPlace; }

  /** A left click: the ghost placed where the mouse is on the ground, nothing off it. */
  place() {
    const at = this.host.ground();
    if (at) this.onPlace?.(at);
  }

  /** A translucent source follows the mouse; each left click places another independent instance. */
  setCopy(source: string | null, place: ((at: [number, number, number]) => void) | null, foot?: number[]) {
    this.version++;
    if (this.ghost) {
      this.host.scene.remove(this.ghost);
      if (!this.release) for (const child of this.ghost.children as THREE.Mesh[]) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
    this.release?.(); this.release = null;
    this.ghost = null; this.solid = null; this.hold = null;
    this.stamp = [];
    this.onPlace = place;
    this.host.placingChanged();
    if (!source || !place) { this.host.changed(); return; }
    const group = new THREE.Group(), solid = new THREE.Group();
    const geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
    group.matrixAutoUpdate = false;
    const ids = [...this.host.objects.withMembers([source])].filter(id => this.host.canMove(id));
    const model = source.startsWith("instance_") ? this.host.models().instance(source.split("#")[0]) : undefined;
    const tree = this.host.trees().parts(source);
    for (const part of tree ?? []) {
      // (a TreeFX tree's ghost shares its model's geometry; only its translucent material is the ghost's own)
      const fade = part.material.clone(); fade.transparent = true; fade.opacity = .5; fade.depthWrite = false; materials.push(fade);
      for (const [into, material] of [[group, fade], [solid, part.material]] as const) {
        const mesh = new THREE.Mesh(part.geometry, material);
        mesh.matrixAutoUpdate = false; mesh.matrix.copy(part.matrix);
        into.add(mesh);
      }
    }
    if (model) {
      // Copy previews hold the same GLB geometry; only their translucent materials belong to the preview.
      const original = model.clone(true), translucent = model.clone(true);
      original.visible = translucent.visible = true;
      translucent.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        const fade = (material: THREE.Material) => {
          const copy = material.clone(); copy.transparent = true; copy.opacity *= .5; copy.depthWrite = false;
          materials.push(copy); return copy;
        };
        node.material = Array.isArray(node.material) ? node.material.map(fade) : fade(node.material);
      });
      solid.add(original); group.add(translucent);
    }
    for (const id of model || tree ? [] : ids) for (const piece of this.host.objects.piecesOf(id, false)) {
      const m = this.host.mesh(piece.mesh);
      if (!m) continue;
      const indices = m.geometry.getIndex()!.array;
      const shown: number[] = [];
      for (let k = piece.from * 3; k < piece.end * 3; k += 3) {
        if (indices[k] !== indices[k + 1] && indices[k + 1] !== indices[k + 2] && indices[k] !== indices[k + 2]) shown.push(indices[k], indices[k + 1], indices[k + 2]);
      }
      if (!shown.length) continue;
      const part = m.geometry.clone();
      part.setIndex(shown);
      const geometry = part.toNonIndexed();
      part.dispose();
      const material = (m.material as THREE.Material).clone();
      material.visible = true;
      material.transparent = true;
      material.opacity = 0.5;
      material.depthWrite = false;
      group.add(new THREE.Mesh(geometry, material));
      const opaque = (m.material as THREE.Material).clone(); opaque.visible = true;
      solid.add(new THREE.Mesh(geometry, opaque));
      geometries.push(geometry); materials.push(material, opaque);
    }
    group.updateMatrixWorld(true);      // (a tree's parts stand at their own matrix: not followed by setFromObject alone)
    const box = new THREE.Box3().setFromObject(group), pivot = this.host.pivotOf(source);
    if (box.isEmpty()) return;
    const releaseAsset = source.startsWith("instance_") ? this.host.models().hold(source.split("#")[0]) : () => {};
    let holders = 1;
    const release = () => { if (--holders === 0) { for (const g of geometries) g.dispose(); for (const m of materials) m.dispose(); releaseAsset(); } };
    this.release = release;
    this.solid = solid;
    this.hold = () => { holders++; let active = true; return () => { if (active) { active = false; release(); } }; };
    this.foot.set(foot?.[0] ?? pivot[0], foot?.[1] ?? box.min.y, foot?.[2] ?? pivot[2]);
    this.ghost = group;
    this.host.scene.add(group);
    this.follow();
  }

  /** A library preview has no draft instance yet; its decoded resources live until placement mode ends and the last model a click
      showed with them is replaced by the server's (addPending). place gets the click's ground point and that shown model's key. */
  async setModel(model: {id: string; anchor: number[]; metres_per_unit: number}, place: (at: [number, number, number], pending: number | null) => void) {
    this.setCopy(null, at => place(at, this.addPending()));
    const version = this.version, holder = new THREE.Scene();
    const draw = new ModelDraw(holder, undefined, bytes => {
      if (bytes > 0) return this.host.reserve(bytes);
      this.host.release(-bytes); return true;
    }, false);
    let holders = 1;
    const letGo = () => { if (--holders === 0) draw.dispose(); };
    const ghostMaterials: THREE.Material[] = [];
    this.release = () => { for (const m of ghostMaterials) m.dispose(); letGo(); };
    const transform = new THREE.Matrix4().makeScale(model.metres_per_unit, model.metres_per_unit, model.metres_per_unit)
      .multiply(new THREE.Matrix4().makeTranslation(-model.anchor[0], -model.anchor[1], -model.anchor[2]));
    try {
      draw.setEnvironment(this.host.modelLight(), this.host.reflections());
      await draw.sync([{id: "ghost", asset: model.id}], {[model.id]: {url: `/api/library/models/${model.id}/original`}}, {ghost: transform.toArray()});
      if (version !== this.version) { draw.dispose(); return; }
      const root = draw.instance("ghost")!, group = new THREE.Group();
      this.solid = root.clone(true);
      this.hold = () => { holders++; let held = true; return () => { if (held) { held = false; letGo(); } }; };
      // (translucent copies: the loaded materials stay solid for what a click shows; textures stay shared)
      const translucent = (original: THREE.Material) => {
        const m = original.clone(); ghostMaterials.push(m);
        m.transparent = true; m.opacity *= .5; m.depthWrite = false;
        return m;
      };
      root.traverse(node => {
        if (node instanceof THREE.Mesh) node.material = Array.isArray(node.material) ? node.material.map(translucent) : translucent(node.material);
      });
      group.matrixAutoUpdate = false; group.add(root);
      this.ghost = group; this.foot.set(0, 0, 0); this.stamp = [];
      this.host.scene.add(group); this.follow();
    } catch (error) { draw.dispose(); if (version === this.version) this.host.failed((error as Error).message); }
  }

  /** The ghost's model shown solid where the ghost stands (or at), at once, until the server's instance is drawn (settle). Its key,
      null while the ghost's model loads. */
  addPending(at?: [number, number, number]) {
    if (!this.ghost || !this.solid || !this.hold) return null;
    const root = new THREE.Group();
    root.matrixAutoUpdate = false; root.matrix.copy(this.ghost.matrix); root.matrixWorldNeedsUpdate = true; root.userData.pendingModel = true;
    if (at) this.matrixAt(root.matrix, at);
    root.add(this.solid.clone(true));
    const key = ++this.pendingKey;
    this.pending.set(key, {root, release: this.hold()});
    this.host.scene.add(root); this.host.changed();
    return key;
  }

  /** A shown model became the server's instance, added to the draft after its revision draft. */
  confirmPending(key: number, instance: string, draft: number) {
    const pending = this.pending.get(key);
    if (pending) Object.assign(pending, {instance, draft});
  }

  /** A shown model that won't become an instance: refused, or the edit could not be made. */
  dropPending(key: number) {
    const pending = this.pending.get(key);
    if (!pending) return;
    this.host.scene.remove(pending.root); pending.release(); this.pending.delete(key); this.host.changed();
  }

  /** Another track: nothing shown any more. */
  dropAll() {
    for (const key of [...this.pending.keys()]) this.dropPending(key);
  }

  /** Shown models whose instance is drawn now go (copiesDrawn: the copies' meshes are loaded), and those a later draft no longer has
      (undone). An older index keeps them. */
  settle(data: TrackIndex, copiesDrawn: boolean) {
    for (const [key, {instance, draft}] of this.pending) {
      if (instance === undefined) continue;
      const copied = instance.startsWith("copy_");
      const exists = copied ? !!data.objects[instance] : data.models?.some(m => m.id === instance);
      const drawn = copied ? copiesDrawn && exists : this.host.models().instance(instance);
      if (drawn || (data.draft ?? 0) > draft! && !exists) this.dropPending(key);
    }
  }

  /** Shown TreeFX trees whose tree is drawn now go, and those an answer says are gone (undone). */
  settleTrees(drawn: (id: string) => boolean, gone: string[]) {
    for (const [key, {instance}] of this.pending) if (instance?.startsWith("trees#") && (drawn(instance) || gone.includes(instance))) this.dropPending(key);
  }

  /** Extra turn, height over the ground and size for the next copies, around their foot. */
  setPose(pose: CopyPose) {
    this.pose = {turn: pose.turn, y: pose.y, scale: pose.scale};
    this.follow();
  }

  /** Freeze the clicked foot and current tool pose; a click can arrive before the ghost's next rendered frame. */
  private matrixAt(matrix: THREE.Matrix4, at: [number, number, number]) {
    const {turn, y, scale} = this.pose;
    matrix.makeTranslation(at[0], at[1] + y, at[2])
      .multiply(new THREE.Matrix4().makeRotationY(turn * Math.PI / 180))
      .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
      .multiply(new THREE.Matrix4().makeTranslation(-this.foot.x, -this.foot.y, -this.foot.z));
  }

  /** The ghost under the mouse as it is now; nothing done while nothing it depends on changed. */
  follow() {
    if (!this.ghost || !this.host.shown()) return;
    const stamp = [...this.host.look(), this.pose.turn, this.pose.y, this.pose.scale];
    if (stamp.length === this.stamp.length && stamp.every((v, k) => v === this.stamp[k])) return;
    this.stamp = stamp;
    const at = this.host.ground(), held = this.host.held();
    this.ghost.visible = !!at && !held;
    if (at) {
      this.matrixAt(this.ghost.matrix, at);
      this.ghost.matrixWorldNeedsUpdate = true;
      performance.clearMarks("map2lap.models.ghost");
      performance.mark("map2lap.models.ghost", {detail: {visible: this.ghost.visible,
        matrix: this.ghost.matrix.clone().multiply(this.ghost.children[0]?.matrix ?? new THREE.Matrix4()).toArray()}});
    }
    this.host.changed();
  }
}
