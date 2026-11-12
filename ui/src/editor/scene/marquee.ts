import * as THREE from "three";
import {CLICK_PX, LEFT_BUTTON} from "./pointer";

export interface SelectionRectangle {x: number; y: number; width: number; height: number}

/** The camera's frustum cropped to a rectangle in view pixels. Pure. */
export function selectionVolume(camera: THREE.PerspectiveCamera, rect: SelectionRectangle, width: number, height: number) {
  const x0 = rect.x / width * 2 - 1, x1 = (rect.x + rect.width) / width * 2 - 1;
  const y0 = 1 - (rect.y + rect.height) / height * 2, y1 = 1 - rect.y / height * 2;
  const crop = new THREE.Matrix4().set(2 / (x1 - x0), 0, 0, -(x1 + x0) / (x1 - x0),
    0, 2 / (y1 - y0), 0, -(y1 + y0) / (y1 - y0), 0, 0, 1, 0, 0, 0, 0, 1);
  return new THREE.Frustum().setFromProjectionMatrix(crop.multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse));
}

/** Left-drag rectangle while Select is active. A short press stays the ordinary click handler's. */
export class Marquee {
  private events = new AbortController();
  private from: {x: number; y: number; pointer: number} | null = null;
  private rectangle: SelectionRectangle | null = null;

  constructor(el: HTMLElement, enabled: () => boolean, private show: (rect: SelectionRectangle | null) => void,
    selected: (rect: SelectionRectangle, add: boolean) => void) {
    const options = {signal: this.events.signal};
    const point = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return {x: Math.max(0, Math.min(r.width, e.clientX - r.left)), y: Math.max(0, Math.min(r.height, e.clientY - r.top))};
    };
    el.addEventListener("pointerdown", e => {
      if (e.button !== LEFT_BUTTON || !enabled()) return;
      this.from = {...point(e), pointer: e.pointerId};
      el.setPointerCapture(e.pointerId);
    }, options);
    el.addEventListener("pointermove", e => {
      if (!this.from || e.pointerId !== this.from.pointer) return;
      if (!enabled() || !(e.buttons & 1)) return this.cancel();
      const p = point(e), f = this.from;
      if (!this.rectangle && Math.hypot(p.x - f.x, p.y - f.y) < CLICK_PX) return;
      this.rectangle = {x: Math.min(f.x, p.x), y: Math.min(f.y, p.y), width: Math.max(1, Math.abs(p.x - f.x)), height: Math.max(1, Math.abs(p.y - f.y))};
      this.show(this.rectangle);
    }, options);
    el.addEventListener("pointerup", e => {
      if (e.button !== LEFT_BUTTON || e.pointerId !== this.from?.pointer) return;
      if (this.rectangle && enabled()) selected(this.rectangle, e.ctrlKey || e.metaKey);
      this.cancel();
    }, options);
    el.addEventListener("pointercancel", () => this.cancel(), options);
    el.addEventListener("lostpointercapture", () => this.cancel(), options);
    el.addEventListener("keydown", e => { if (e.key === "Escape") this.cancel(); }, options);
  }

  cancel() { this.from = null; this.rectangle = null; this.show(null); }
  dispose() { this.cancel(); this.events.abort(); }
}
