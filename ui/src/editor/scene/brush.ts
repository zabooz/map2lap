// The brush of the tools that paint on the ground (Elevation, Smooth, Paint, Groups, Delete's brush): its ring on the ground under
// the mouse, a stroke while the left button is held (where the ring was and how long), the server's preview of it while it lasts,
// and for Delete the frames of what the ring would take and what a stroke under way has taken.
import * as THREE from "three";
import type {Brush as BrushChoice, Sample, TrackIndex} from "../types";
import type {Removed} from "../state/edits";
import {alongStroke} from "../tools/deleteBrush";
import {addSample} from "./strokeSamples";
import {LEFT_BUTTON} from "./pointer";
import {frameOf, removeFrame} from "./selection";
import {NOT_MOVED, type TrackObjects} from "./trackObjects";
import type {TreeFxDraw} from "./treeFx";

const SAMPLE_EVERY_MS = 50;         // where the ring is, this often while the mouse is held: finer than a hand moves it, and it counts the time where it stands
const PREVIEW_EVERY_MS = 200;       // how often a stroke under way is asked for: at most one at a time, what is newest when it is answered goes next
const RING_POINTS = 64;
const MOST_MARKS = 400;             // (a ring of 500 m over a forest: the frames stop here, the stroke still takes all)

/** What the brush needs of the view it serves. */
export interface BrushHost {
  scene: THREE.Scene;
  objects: TrackObjects;
  data(): TrackIndex | null;            // the track's index as the view has it now
  point(e: PointerEvent): void;         // the mouse is where e says
  ground(): THREE.Vector3 | null;       // the ground under the mouse if a stroke can go on it
  look(): string | null;                // the mouse and the camera as they are: a stroke stands still while this stays; null: no mouse
  wheelTaken(): boolean;                // Ctrl and Alt with the wheel are a tool's without the brush too
  pivotOf(id: string): number[];        // where a listed object stands now, as the draft moved it
  trees(): Pick<TreeFxDraw, "feet">;    // the track's TreeFX trees
  showPreview(bytes: ArrayBuffer): void;        // the meshes as the stroke so far changes them
  keepPreview(): void;                  // ... kept until the server's meshes come
  takeBackPreview(): void;              // ... back as they were
  changed(): void;                      // the view is to be drawn again
}

interface Stroke {samples: Sample[]; turned: boolean; at: number; timer: ReturnType<typeof setInterval>; asked: number; asking: boolean; look: string}

/** The brush of a view: set() chooses it, attach() lets the mouse use it. */
export class ViewBrush {
  private brush: BrushChoice | null = null;
  private ring: THREE.LineLoop | null = null;
  private stroke: Stroke | null = null;
  private onStroke: (samples: Sample[], turned: boolean) => void = () => {};
  private askPreview: (samples: Sample[], turned: boolean) => Promise<ArrayBuffer | string | null> = () => Promise.resolve(null);
  private onStrokeRefused: (why: string) => void = () => {};
  private onStrokeCancelled: () => void = () => {};
  private onRingMoved: (at: [number, number, number] | null) => void = () => {};
  private gone = new Set<string>();                     // left out by Delete's brush under way, not by the draft yet (showGone)
  private marks = new Map<string, THREE.Box3Helper>();  // framed: what Delete's brush would take where its ring stands
  private markAt: [number, number] | null = null;      // where the ring stood when the frames were last asked for; a frame later they are
  private marksDue = false;
  private host: BrushHost;

  constructor(host: BrushHost) {
    this.host = host;
  }

  /** The brush chosen, null for none: while there is one, the left button paints instead of picking. */
  get current() { return this.brush; }

  /** What Delete's brush under way has left out that the draft doesn't yet. */
  get goneNow(): ReadonlySet<string> { return this.gone; }

  /** The brush chosen, or none: none takes the ring away and drops a stroke under way; one puts its ring under the mouse. */
  set(brush: BrushChoice | null) {
    this.brush = brush;
    if (!brush || !brush.marks) { this.markAt = null; this.markBrush(); }
    if (!brush) {
      this.cancelStroke();
      if (this.ring) {
        this.host.scene.remove(this.ring);
        this.ring.geometry.dispose();
        this.ring = null;
      }
    } else this.placeRing(this.host.ground(), false);
  }

  /** onRingMoved gets where the ring stands on the ground whenever it moves while no stroke runs, null off the ground (the Groups
      brush shows there what a click would plant). */
  setRingMoved(onRingMoved: ((at: [number, number, number] | null) => void) | null) {
    this.onRingMoved = onRingMoved ?? (() => {});
  }

  /** onStroke gets a stroke when it ends: where the ring was and for how long, and whether Shift was held when it began. askPreview gets it while it lasts,
      and answers with what it changes so far (trackedits.preview), or why it can't be: then it ends there, onStrokeRefused gets that;
      null: no answer this time. */
  setStroke(onStroke: (samples: Sample[], turned: boolean) => void, askPreview: (samples: Sample[], turned: boolean) => Promise<ArrayBuffer | string | null>,
            onStrokeRefused: (why: string) => void, onCancelled: () => void = () => {}) {
    this.onStroke = onStroke;
    this.askPreview = askPreview;
    this.onStrokeRefused = onStrokeRefused;
    this.onStrokeCancelled = onCancelled;
  }

  /** The stroke under way is dropped, the meshes back as they were; whether there was one. */
  cancelStroke() {
    if (!this.stroke) return false;
    clearInterval(this.stroke.timer);
    this.stroke = null;
    this.onStrokeCancelled();
    this.host.takeBackPreview();
    return true;
  }

  /** The ring on the ground, of the brush's true size, in its colour (turned: with Shift held); hidden over what it can't paint. */
  private placeRing(at: THREE.Vector3 | null, turned: boolean) {
    if (!this.brush) return;
    if (!this.ring) {
      const points = Array.from({length: RING_POINTS}, (_, k) => {
        const angle = k / RING_POINTS * 2 * Math.PI;
        return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      });
      this.ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({depthTest: false, transparent: true}));
      this.ring.renderOrder = 10;
      this.ring.frustumCulled = false;
      this.host.scene.add(this.ring);
    }
    this.ring.visible = !!at;
    if (at) {
      this.ring.position.copy(at);
      this.ring.scale.setScalar(this.brush.radius);
      (this.ring.material as THREE.LineBasicMaterial).color.set(turned ? this.brush.turnedColour : this.brush.colour);
    }
    if (!this.stroke) this.onRingMoved(at ? [at.x, at.y, at.z] : null);
    if (this.brush.marks || this.marks.size) {
      this.markAt = at ? [at.x, at.z] : null;
      if (!this.marksDue) { this.marksDue = true; requestAnimationFrame(() => this.markBrush()); }
    }
    this.host.changed();
  }

  /** The left button on el with the brush set: pressed on the ground a stroke starts, a move adds to it, let go it ends, a click is a stamp. */
  attach(el: HTMLElement) {
    el.addEventListener("pointerdown", e => {
      if (!this.brush || e.button !== LEFT_BUTTON) return;
      this.host.point(e);
      const at = this.host.ground();
      if (!at) return;
      const now = performance.now();
      this.stroke = {samples: [[at.x, at.z, 0]], turned: e.shiftKey, at: now, asked: now, asking: false,
                     look: this.host.look() ?? "", timer: setInterval(() => this.sample(), SAMPLE_EVERY_MS)};
      el.setPointerCapture(e.pointerId);
    });
    for (const type of ["keydown", "keyup"] as const) {     // (Alt with the wheel: alone, some browsers then go to their menu)
      el.addEventListener(type, e => {
        if ((this.brush || this.host.wheelTaken()) && e.key === "Alt") e.preventDefault();
      });
    }
    el.addEventListener("pointermove", e => {
      if (!this.brush) return;
      this.host.point(e);
      if (!this.stroke) this.placeRing(this.host.ground(), e.shiftKey);       // (held: the samples move it)
    });
    el.addEventListener("pointerup", e => {
      if (!this.stroke || e.button !== LEFT_BUTTON) return;
      this.host.point(e);
      this.sample();
      const {samples, turned, timer} = this.stroke;
      clearInterval(timer);
      this.stroke = null;
      this.host.keepPreview();
      this.onStroke(samples, turned);
    });
    el.addEventListener("pointercancel", () => this.cancelStroke());
    el.addEventListener("pointerleave", () => {
      if (this.ring && !this.stroke) {
        this.ring.visible = false;
        this.host.changed();
      }
    });
  }

  /** The ring's place now noted, and if it is time the stroke asked for as it is. */
  private sample() {
    const s = this.stroke, look = this.host.look();
    if (!s || look === null) return;
    const now = performance.now(), seconds = (now - s.at) / 1000, last = s.samples.at(-1)!;
    s.at = now;
    // (the mouse and the camera still: it stands where it stood, however the ground grows up towards the camera under the ray)
    if (look === s.look) addSample(s.samples, last[0], last[1], seconds);
    else {
      const at = this.host.ground();
      s.look = look;
      this.placeRing(at, s.turned);
      if (at) addSample(s.samples, at.x, at.z, seconds);    // (off the ground it paints nothing, and its time doesn't count)
    }
    if (!s.asking && now - s.asked >= PREVIEW_EVERY_MS) {
      s.asking = true;
      s.asked = now;
      void this.askPreview(s.samples.map(x => [...x] as Sample), s.turned).then(answer => {
        s.asking = false;
        if (this.stroke !== s) return;      // (an answer about a stroke that is over says nothing about the next one)
        if (typeof answer === "string") {
          this.cancelStroke();
          this.onStrokeRefused(answer);
        } else if (answer) this.host.showPreview(answer);
      }, () => { s.asking = false; });
    }
  }

  /** What Delete's brush takes along a stroke (samples, radius in m; alongStroke): every object a click could delete whose place lies
      there, where it stands now. Listed objects (built ones, copies, imported models) at their place as the draft moved them, only those
      at the top (a house's sign goes with it) and not a span of wires (it goes with its poles); trees and bushes of the loaded billboard
      meshes at the middle of their foot, TreeFX trees at their foot as drawn. What is left out already is not taken again. */
  objectsAlong(samples: Sample[], radius: number) {
    const data = this.host.data(), objects = this.host.objects;
    if (!data || !samples.length) return [];
    const xs = samples.map(s => s[0]), zs = samples.map(s => s[1]);
    const [minX, maxX, minZ, maxZ] = [Math.min(...xs) - radius, Math.max(...xs) + radius, Math.min(...zs) - radius, Math.max(...zs) + radius];
    const near = (x: number, z: number) => x >= minX && x <= maxX && z >= minZ && z <= maxZ;
    const found: Removed[] = [];
    for (const [base, list] of Object.entries(data.objects)) list.at.forEach((_, k) => {
      const id = `${base}#${k}`;
      if (list.parents[k] >= 0 || !list.faces[k].length || NOT_MOVED.has(list.kinds[k]) || objects.removed.has(id)) return;
      const [x, y, z] = this.host.pivotOf(id) as [number, number, number];
      if (near(x, z)) found.push({id, position: [x, y, z]});
    });
    const seen = new Set<string>();
    for (const mesh of objects.billboardMeshes()) {
      const base = mesh.userData.info.base;
      for (const {k, from, at} of objects.treeFeet(mesh)) {
        const id = `${base}#${k}`;
        if (!near(at[0], at[2]) || seen.has(id) || objects.removed.has(id) || objects.sortRemoved(mesh, from)) continue;
        seen.add(id); found.push({id, position: at});
      }
    }
    for (const {id, model, at} of this.host.trees().feet(minX, minZ, maxX, maxZ)) {
      if (!objects.removed.has(id) && !objects.removedObjectSorts.has(model)) found.push({id, position: at});
    }
    return alongStroke(found, samples, radius);
  }

  /** The frames of what Delete's brush would take where the ring stands (markAt), asked for at most once a frame. */
  private markBrush() {
    this.marksDue = false;
    const ids = this.brush?.marks && this.markAt ? this.objectsAlong([[...this.markAt, 0]], this.brush.radius).slice(0, MOST_MARKS).map(o => o.id) : [];
    const keep = new Set(ids);
    for (const [id, box] of this.marks) if (!keep.has(id)) { this.unframe(box); this.marks.delete(id); }
    for (const id of ids) {
      if (this.marks.has(id)) continue;
      const bounds = this.host.objects.shownObjectBounds(id);
      if (!bounds) continue;
      const box = frameOf(this.host.scene, bounds, () => this.host.changed());
      (box.material as THREE.LineBasicMaterial).color.set(this.brush!.colour);
      this.marks.set(id, box);
    }
    performance.clearMarks("map2lap.delete.marks");
    performance.mark("map2lap.delete.marks", {detail: {framed: this.marks.size}});
  }

  private unframe(box: THREE.Box3Helper) { removeFrame(this.host.scene, box, () => this.host.changed()); }

  /** Delete's brush under way: these are left out at once, those of the last call not among them come back; null: all come back.
      What the draft leaves out stays out either way. */
  showGone(ids: string[] | null) {
    const next = new Set(ids ?? []), objects = this.host.objects;
    for (const id of this.gone) if (!next.has(id) && !objects.removed.has(id)) objects.leaveOut(id, false);
    for (const id of next) {
      if (!this.gone.has(id) && !objects.removed.has(id)) objects.leaveOut(id, true);
      const box = this.marks.get(id);
      if (box) { this.unframe(box); this.marks.delete(id); }      // (gone: no frame round nothing)
    }
    this.gone = next;
    this.host.changed();
  }

  /** The stroke's objects stay out as they are: the draft leaves them out from now on (setRemoved). */
  keepGone() {
    this.gone = new Set();
  }
}
