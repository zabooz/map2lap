// Move in the view: with Move on, a press picks what is under the mouse, a drag takes all that is picked along over the ground
// keeping each one's clearance, and the wheel turns, raises and sizes them. The view shows it at once; the server's meshes take its
// place when its answer comes.
import * as THREE from "three";
import type {MeshInfo, Picked, TrackIndex} from "../types";
import {nudgeVertices, STILL, type Nudge, type Placement} from "../tools/placing";
import {FLOATS_PER_VERTEX, fitSphere} from "./geometry";
import {screenPoint, LEFT_BUTTON, LEFT_HELD, CLICK_PX} from "./pointer";
import type {ModelDraw} from "./modelDraw";
import type {TreeFxDraw} from "./treeFx";
import type {Selection} from "./selection";
import {NOT_MOVED, type TrackObjects} from "./trackObjects";

/** The vertices of an object in one mesh as they were when it was taken up: their numbers, their floats in that order. */
interface GrabbedVertices {
  id: string;
  mesh: number;
  numbers: Uint32Array;
  floats: Float32Array;
}
type Grabbed = GrabbedVertices | {id: string; modelMatrix: THREE.Matrix4} | {id: string; treeMatrix: THREE.Matrix4};

/** A nudge as a matrix: scaled, then turned around the upright, then moved. Pure. */
function transformOf(n: Nudge) {
  return new THREE.Matrix4().makeScale(n.scale, n.scale, n.scale)
    .premultiply(new THREE.Matrix4().makeRotationY(n.turn * Math.PI / 180))
    .premultiply(new THREE.Matrix4().makeTranslation(n.x, n.y, n.z));
}

interface Drag {
  ids: string[]; plane: THREE.Plane; from: THREE.Vector3; x: number; y: number; grabbed: Grabbed[]; pivots: Map<string, number[]>;
  ground: Map<string, number | null>; rises: Map<string, number>; way: THREE.Vector3;
  grip: THREE.Vector3 | null;   // the grabbed point less the ground under the picked one's pivot; null: the mouse goes on plane
  foot: THREE.Vector3;          // that ground point
}

/** What the mover needs of the view it serves. */
export interface MoverHost {
  camera: THREE.Camera;
  objects: TrackObjects;
  selection: Selection;
  models(): ModelDraw;                  // the track's imported models
  trees(): Pick<TreeFxDraw, "matrix" | "nudge" | "tree">;    // the track's TreeFX trees
  data(): TrackIndex | null;            // the track's index as the view has it now
  mesh(i: number): THREE.Mesh | undefined;      // the loaded mesh number i
  pick(e: PointerEvent, el: HTMLElement, point: THREE.Vector3): Picked | null; // what a press at e picks, its actual hit in point
  groundAt(x: number, z: number): number | null;  // the ground's height there, null off the loaded terrain
  groundAlong(origin: THREE.Vector3, direction: THREE.Vector3): THREE.Vector3 | null;    // where a ray first meets the ground
  farthest(): number;                   // how far the ground can be seen: a drag towards the horizon stops there
  busy(): boolean;                      // the left button is another's (a brush)
  meshChanged(i: number): void;         // mesh number i shows other than the server's: it is fetched again if nothing replaces it
  reloadKept(ids: string[]): void;      // the server's geometry for these back
  cursorChanged(): void;                // the mouse pointer follows
  changed(): void;                      // the view is to be drawn again
}

/** Move in a view: setMove turns it on, attach() lets the mouse use it. */
export class ObjectMover {
  private moveTool = false;             // Move is on: a press picks, a drag takes what is picked along
  private onMoved: (objects: {id: string; x: number; y: number; z: number}[]) => void = () => {};
  private placed = new Map<string, Placement>();        // how the draft places objects now (setPlaced)
  private pendingPivots = new Map<string, number[]>();   // a released drag already shown, before its canonical placement arrives
  private dragging: Drag | null = null;
  private picker = new THREE.Raycaster();
  private host: MoverHost;

  constructor(host: MoverHost) {
    this.host = host;
  }

  /** Whether Move is on. */
  get on() { return this.moveTool; }

  /** Whether a drag is moving objects now. */
  get draggingNow() { return !!this.dragging?.way.lengthSq(); }

  /** Move on or off; onMoved gets each object's displacement, including the change of ground height. Off cancels a drag. */
  setMove(on: boolean, onMoved: (objects: {id: string; x: number; y: number; z: number}[]) => void) {
    this.onMoved = onMoved;
    if (on === this.moveTool) return;
    this.moveTool = on;
    if (!on) this.dropDrag();
    this.host.cursorChanged();
  }

  /** How the draft places objects now: where each one's place is, to turn and scale it around. */
  setPlaced(placed: Placement[]) {
    this.placed = new Map(placed.map(p => [p.id, p]));
    for (const [id, at] of this.pendingPivots) {
      const split = id.lastIndexOf("#");
      const base = this.host.data()?.objects?.[id.slice(0, split)]?.at[Number(id.slice(split + 1))] ?? this.host.trees().tree(id)?.base;
      const p = this.placed.get(id);
      if (base && Math.abs(base[0] + (p?.x ?? 0) - at[0]) < 0.002 && Math.abs(base[2] + (p?.z ?? 0) - at[2]) < 0.002) this.pendingPivots.delete(id);
    }
  }

  /** A drag that could not be accepted returns to the server's kept geometry, including any drag made while it was pending. */
  rejectMove(ids: string[]) {
    for (const id of ids) this.pendingPivots.delete(id);
    if (this.dragging?.ids.some(id => ids.includes(id))) this.dropDrag();
    this.host.reloadKept(ids);
  }

  /** Another track: no released drag waits for its placement. */
  clear() {
    this.pendingPivots.clear();
  }

  /** Whether Move can take it: not a span of wires, which goes where its poles go. */
  canMove(id: string) {
    const at = id.lastIndexOf("#"), list = this.host.data()?.objects?.[id.slice(0, at)];
    return !list || !NOT_MOVED.has(list.kinds[Number(id.slice(at + 1))]);
  }

  /** Where an object stands now, what it is turned and scaled around (placement.py): a listed one's place as the draft moved it; a tree's or
      bush's the middle of its foot. */
  pivotOf(id: string) {
    const pending = this.pendingPivots.get(id);
    if (pending) return pending;
    const at = id.lastIndexOf("#"), list = this.host.data()?.objects?.[id.slice(0, at)];
    if (list) {
      const [x, y, z] = list.at[Number(id.slice(at + 1))], p = this.placed.get(id);
      return [x + (p?.x ?? 0), y + (p?.y ?? 0), z + (p?.z ?? 0)];
    }
    const box = this.host.objects.boundsOf(id), middle = box.getCenter(new THREE.Vector3());
    return [middle.x, box.min.y, middle.z];
  }

  /** The vertices the objects and what belongs to them have in the meshes loaded, as they are now. */
  private grab(ids: string[]): Grabbed[] {
    const out: Grabbed[] = [];
    for (const id of ids) {
      const modelMatrix = this.host.models().instance(id.split("#")[0])?.matrix.clone();
      if (modelMatrix) { out.push({id, modelMatrix}); continue; }
      const treeMatrix = this.host.trees().matrix(id);
      if (treeMatrix) { out.push({id, treeMatrix}); continue; }
      const byMesh = new Map<number, Set<number>>();
      for (const {mesh, from, end} of this.host.objects.piecesOf(id)) {
        const part = this.host.mesh(mesh);
        if (!part) continue;
        const indices = (part.userData.indices ?? part.geometry.getIndex()!.array) as Uint16Array;
        if (!byMesh.has(mesh)) byMesh.set(mesh, new Set());
        for (let k = from * 3; k < end * 3; k++) byMesh.get(mesh)!.add(indices[k]);
      }
      for (const [mesh, vertices] of byMesh) {
        const numbers = Uint32Array.from(vertices), array = this.vertexArray(mesh), floats = new Float32Array(numbers.length * FLOATS_PER_VERTEX);
        numbers.forEach((v, k) => floats.set(array.subarray(v * FLOATS_PER_VERTEX, (v + 1) * FLOATS_PER_VERTEX), k * FLOATS_PER_VERTEX));
        out.push({id, mesh, numbers, floats});
      }
    }
    return out;
  }

  private vertexArray(mesh: number) {
    return (this.host.mesh(mesh)!.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data.array as Float32Array;
  }

  /** The vertices grabbed as nudges (by id; none: as they were) move them around pivots, in the view only: the server's meshes take
      their place when its answer comes (refreshMeshes). */
  private nudgeGrabbed(grabbed: Grabbed[], pivots: Map<string, number[]>, nudges: (id: string) => Nudge) {
    for (const g of grabbed) {
      if ("modelMatrix" in g) {
        this.host.models().nudge(g.id.split("#")[0], pivots.get(g.id)!, transformOf(nudges(g.id)), g.modelMatrix);
      } else if ("treeMatrix" in g) {
        this.host.trees().nudge(g.id, pivots.get(g.id)!, transformOf(nudges(g.id)), g.treeMatrix);
      } else {
        nudgeVertices(g.floats, this.vertexArray(g.mesh), g.numbers, FLOATS_PER_VERTEX, pivots.get(g.id)!, nudges(g.id));
        const m = this.host.mesh(g.mesh)!;
        (m.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
        fitSphere(m.geometry, m.userData.info as MeshInfo); m.geometry.boundsTree?.refit();
        this.host.meshChanged(g.mesh);
      }
    }
    this.host.selection.reframe();
    this.host.changed();
  }

  /** The objects ids turned, raised or scaled at once, each around where it stands, until the server's meshes come: a notch of the wheel.
      While they are dragged, what was taken up is nudged too: the next move of the mouse shows them as they are now, not as they were. */
  nudge(ids: string[], n: Partial<Nudge>) {
    const nudge = {...STILL, ...n}, d = this.dragging;
    if (d && ids.every(id => d.ids.includes(id))) {
      for (const g of d.grabbed) {
        if (!ids.includes(g.id)) continue;
        if ("modelMatrix" in g) {
          const root = this.host.models().instance(g.id.split("#")[0]);
          if (root) {
            this.host.models().nudge(g.id.split("#")[0], d.pivots.get(g.id)!, transformOf(nudge), g.modelMatrix);
            g.modelMatrix = root.matrix.clone();
          }
          continue;
        }
        if ("treeMatrix" in g) {
          this.host.trees().nudge(g.id, d.pivots.get(g.id)!, transformOf(nudge), g.treeMatrix);
          g.treeMatrix = this.host.trees().matrix(g.id) ?? g.treeMatrix;
          continue;
        }
        const out = new Float32Array(g.floats.length);
        nudgeVertices(g.floats, out, Array.from(g.numbers, (_, k) => k), FLOATS_PER_VERTEX, d.pivots.get(g.id)!, nudge);
        g.floats = out;
      }
      for (const id of ids) {
        const [x, y, z] = d.pivots.get(id)!;
        d.pivots.set(id, [x + nudge.x, y + nudge.y, z + nudge.z]);
      }
      return this.dragOn(d.grabbed);
    }
    this.nudgeGrabbed(this.grab(ids), new Map(ids.map(id => [id, this.pivotOf(id)])), () => nudge);
  }

  /** Mesh number i came anew from the server: what is being dragged of it stays where the mouse has it. */
  followMesh(i: number) {
    const dragged = this.dragging?.grabbed.filter(g => "mesh" in g && g.mesh === i) ?? [];
    if (dragged.length) this.dragOn(dragged);
  }

  /** The models' matrices came anew from the server: the models being dragged stay where the mouse has them. */
  followModels() {
    if (this.dragging) this.dragOn(this.dragging.grabbed.filter(g => "modelMatrix" in g));
  }

  /** The TreeFX trees came anew from the server: the trees being dragged stay where the mouse has them. */
  followTrees() {
    if (this.dragging) this.dragOn(this.dragging.grabbed.filter(g => "treeMatrix" in g));
  }

  /** The vertices of grabbed shown as taken up and moved the way dragged so far. */
  private dragOn(grabbed: Grabbed[]) {
    const d = this.dragging!;
    for (const id of d.ids) {
      const [x, , z] = d.pivots.get(id)!, before = d.ground.get(id);
      const after = this.host.groundAt(x + d.way.x, z + d.way.z);
      d.rises.set(id, before != null && after != null ? after - before : 0);
    }
    this.nudgeGrabbed(grabbed, d.pivots, id => ({...STILL, x: d.way.x, y: d.rises.get(id) ?? 0, z: d.way.z}));
  }

  /** A drag under way goes back, nothing moved. */
  private dropDrag() {
    const d = this.dragging;
    this.dragging = null;
    if (d) this.nudgeGrabbed(d.grabbed, d.pivots, () => STILL);
  }

  /** With Move on, the left button pressed on el picks what is under the mouse (Ctrl: adds it); held and moved, it takes all that is
      picked along over the ground, keeping each one's clearance; let go, onMoved says how far. */
  attach(el: HTMLElement) {
    el.addEventListener("pointerdown", e => {
      if (!this.moveTool || this.host.busy() || e.button !== LEFT_BUTTON) return;
      const point = new THREE.Vector3(), picked = this.host.pick(e, el, point), selection = this.host.selection;
      if (!picked?.id || !selection.has(picked.id)) return;
      const ids = selection.ids().filter(id => this.canMove(id));
      if (!ids.includes(picked.id)) return;
      const pivots = new Map(ids.map(id => [id, this.pivotOf(id)]));
      this.picker.setFromCamera(screenPoint(e, el), this.host.camera);
      // Grab where the ray hit, not at the foot: a crown is nearer than the ray's ground intersection, so a foot plane
      // moves it faster than the mouse. Within about 6 degrees of horizontal, that plane amplifies motion over tenfold
      // or crosses the horizon; use a facing plane there and retain only its horizontal displacement below.
      const normal = Math.abs(this.picker.ray.direction.y) < .1
        ? this.host.camera.getWorldDirection(new THREE.Vector3()) : new THREE.Vector3(0, 1, 0);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point), from = new THREE.Vector3();
      if (!this.picker.ray.intersectPlane(plane, from) || from.distanceTo(this.host.camera.position) > this.host.farthest()) return;
      const ground = new Map(ids.map(id => { const [x, , z] = pivots.get(id)!; return [id, this.host.groundAt(x, z)]; }));
      // On a slope a level plane put the mouse at the grab's old height and the ground raised it after: uphill it slid away
      // from the mouse. Kept as the grabbed point less the ground under the pivot, the mouse's ray shifted back by it meets the
      // ground where the pivot goes, and the grabbed point, raised with the ground, stays on the ray. (Near level, where that
      // ray grazes the ground, the facing plane above.)
      const [px, , pz] = pivots.get(picked.id)!, under = ground.get(picked.id), foot = new THREE.Vector3(px, under ?? 0, pz);
      const grip = normal.y === 1 && under != null ? point.clone().sub(foot) : null;
      this.dragging = {ids, plane, from, x: e.clientX, y: e.clientY, grabbed: this.grab(ids), pivots, ground, rises: new Map(),
        way: new THREE.Vector3(), grip, foot};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", e => {
      const d = this.dragging;
      if (!d) return;
      if (!(e.buttons & LEFT_HELD)) return this.dropDrag();
      if (!d.way.lengthSq() && Math.hypot(e.clientX - d.x, e.clientY - d.y) < CLICK_PX) return;     // (a click with a shaky hand)
      this.picker.setFromCamera(screenPoint(e, el), this.host.camera);
      if (d.grip) {
        const {ray} = this.picker, foot = this.host.groundAlong(ray.origin.clone().sub(d.grip), ray.direction);
        if (!foot || foot.clone().add(d.grip).distanceTo(this.host.camera.position) > this.host.farthest()) return;    // (sky, horizon)
        d.way.set(foot.x - d.foot.x, 0, foot.z - d.foot.z);
      } else {
        const at = new THREE.Vector3();
        if (!this.picker.ray.intersectPlane(d.plane, at) || at.distanceTo(this.host.camera.position) > this.host.farthest()) return;    // (at the horizon)
        d.way.set(at.x - d.from.x, 0, at.z - d.from.z);
      }
      this.host.cursorChanged();
      this.dragOn(d.grabbed);
    });
    el.addEventListener("pointerup", e => {
      const d = this.dragging;
      if (!d || e.button !== LEFT_BUTTON) return;
      this.dragging = null;
      this.host.cursorChanged();
      if (d.way.lengthSq()) {
        for (const id of d.ids) {
          const [x, y, z] = d.pivots.get(id)!;
          this.pendingPivots.set(id, [x + d.way.x, y + (d.rises.get(id) ?? 0), z + d.way.z]);
        }
        this.onMoved(d.ids.map(id => ({id, x: d.way.x, y: d.rises.get(id) ?? 0, z: d.way.z})));
      }
    });
    el.addEventListener("pointercancel", () => this.dropDrag());
  }
}
