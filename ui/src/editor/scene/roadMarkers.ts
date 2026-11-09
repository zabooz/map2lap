import * as THREE from "three";
import type {Place} from "../types";
import {LEFT_BUTTON, CLICK_PX} from "./pointer";

const BAND_COLOUR = "#27d3c3";
const BAND_UP_M = 0.3;              // (the band's lines over the road)
const PIN_PX = 14;                  // a band's pin on the screen, and how near the mouse has to be to take it
const MARK_M = 1.5;                 // (the cross at A, until there is a band)

/** The band's lines as flat x, y, z pairs: its two edges along line, its ends across, a little over the road. Pure. */
export function bandLines(line: Place[], width: number) {
  const out: number[] = [], half = width / 2;
  const side = (k: number) => {
    const a = line[Math.max(0, k - 1)], b = line[Math.min(line.length - 1, k + 1)], l = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1;
    return [(b[2] - a[2]) / l * half, (a[0] - b[0]) / l * half];
  };
  const left = (k: number) => { const [dx, dz] = side(k); return [line[k][0] + dx, line[k][1] + BAND_UP_M, line[k][2] + dz]; };
  const right = (k: number) => { const [dx, dz] = side(k); return [line[k][0] - dx, line[k][1] + BAND_UP_M, line[k][2] - dz]; };
  for (let k = 0; k + 1 < line.length; k++) out.push(...left(k), ...left(k + 1), ...right(k), ...right(k + 1));
  out.push(...left(0), ...right(0), ...left(line.length - 1), ...right(line.length - 1));
  return out;
}

/** A cross at a place, as flat x, y, z pairs. Pure. */
function crossLines([x, y, z]: Place) {
  const up = y + BAND_UP_M;
  return [x - MARK_M, up, z, x + MARK_M, up, z, x, up, z - MARK_M, x, up, z + MARK_M];
}

/** Owns the road tool's visible markers and their pointer interaction. */
export class RoadMarkers {
  private pins: Place[] = [];
  private pinMarks: THREE.Points | null = null;
  private pinTexture: THREE.Texture | null = null;
  private dragged: {pin: number; x: number; y: number; from: Place} | null = null;
  private onPinMoved: (pin: number, x: number, z: number) => void = () => {};
  onPinTaken: (pin: number) => void = () => {};
  private band: THREE.LineSegments | null = null;

  constructor(private readonly scene: THREE.Scene, private readonly camera: THREE.PerspectiveCamera,
    private readonly groundAt: (x: number, z: number) => number | null, private readonly changed: () => void,
    private readonly makeImage: () => THREE.Texture = makePinImage) {}

  dispose() {
    this.drawBand(null, 0);
    this.drawPins([]);
    this.pinTexture?.dispose();
    this.pinTexture = null;
  }

  /** The band along line, its width in m on the road; one place: a cross, null: none. */
  drawBand(line: Place[] | null, width: number) {
    if (this.band) {
      this.scene.remove(this.band);
      this.band.geometry.dispose();
      (this.band.material as THREE.Material).dispose();
      this.band = null;
    }
    this.changed();
    if (!line?.length) return;
    const lines = line.length === 1 ? crossLines(line[0]) : bandLines(line, width);
    this.band = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(lines, 3)),
                                       new THREE.LineBasicMaterial({color: BAND_COLOUR, depthTest: false, transparent: true}));
    this.band.renderOrder = 10;
    this.band.frustumCulled = false;
    this.scene.add(this.band);
  }

  /** The pins of a band where they are, as round marks of one size whatever the distance; each can be dragged and taken away (setPinned). None: []. */
  drawPins(pins: Place[]) {
    this.pins = pins;
    this.dragged = null;
    if (this.pinMarks) {
      this.scene.remove(this.pinMarks);
      this.pinMarks.geometry.dispose();
      (this.pinMarks.material as THREE.Material).dispose();
      this.pinMarks = null;
    }
    this.changed();
    if (!pins.length) return;
    this.pinMarks = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pins.flatMap(([x, y, z]) => [x, y + BAND_UP_M, z]), 3)),
                                     new THREE.PointsMaterial({color: BAND_COLOUR, size: PIN_PX, sizeAttenuation: false, map: this.pinImage(), alphaTest: 0.5, depthTest: false, transparent: true}));
    this.pinMarks.renderOrder = 11;
    this.pinMarks.frustumCulled = false;
    this.scene.add(this.pinMarks);
  }

  /** moved gets a pin's number and where it was dragged to, taken the number of one a right click took away. */
  setPinned(moved: (pin: number, x: number, z: number) => void, taken: (pin: number) => void) {
    this.onPinMoved = moved;
    this.onPinTaken = taken;
  }

  /** The number of the pin under the mouse, -1: none. */
  pinAt(e: MouseEvent, el: HTMLElement) {
    const r = el.getBoundingClientRect(), at = new THREE.Vector3();
    let best = -1, least = PIN_PX;
    this.pins.forEach(([x, y, z], k) => {
      at.set(x, y + BAND_UP_M, z).project(this.camera);
      const apart = Math.hypot((at.x + 1) / 2 * r.width + r.left - e.clientX, (1 - at.y) / 2 * r.height + r.top - e.clientY);
      if (at.z < 1 && apart < least) {
        least = apart;
        best = k;
      }
    });
    return best;
  }

  /** A pin held no more without a place to go: back where it was, as the page has it. */
  private dropDragged() {
    const held = this.dragged;
    this.dragged = null;
    if (!held || !this.pinMarks) return;
    this.pins[held.pin] = held.from;
    const [x, y, z] = held.from;
    (this.pinMarks.geometry.getAttribute("position") as THREE.BufferAttribute).setXYZ(held.pin, x, y + BAND_UP_M, z).needsUpdate = true;
    this.changed();
  }

  /** The left button on a pin takes it along over the ground; let go, it says where. Under the mouse the pointer says that it can. */
  attach(el: HTMLElement, brushed: () => boolean, pointAt: (event: PointerEvent) => THREE.Vector3 | null) {
    el.addEventListener("pointerdown", e => {
      if (e.button !== LEFT_BUTTON || brushed()) return;
      const pin = this.pinAt(e, el);
      if (pin < 0) return;
      this.dragged = {pin, x: e.clientX, y: e.clientY, from: this.pins[pin]};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", e => {
      if (!this.dragged) {
        if (this.pins.length) el.style.cursor = this.pinAt(e, el) >= 0 ? "grab" : "";
        return;
      }
      const at = pointAt(e);
      if (!at || !this.pinMarks) return;
      this.pins[this.dragged.pin] = [at.x, at.y, at.z];
      (this.pinMarks.geometry.getAttribute("position") as THREE.BufferAttribute).setXYZ(this.dragged.pin, at.x, at.y + BAND_UP_M, at.z).needsUpdate = true;
      this.changed();
    });
    el.addEventListener("pointerup", e => {
      const held = this.dragged;
      if (!held || e.button !== LEFT_BUTTON) return;
      if (Math.hypot(e.clientX - held.x, e.clientY - held.y) < CLICK_PX) return this.dropDragged();     // (a click with a shaky hand)
      this.dragged = null;
      this.onPinMoved(held.pin, this.pins[held.pin][0], this.pins[held.pin][2]);
    });
    el.addEventListener("pointercancel", () => this.dropDragged());
  }

  followGround(bounds: THREE.Box3) {
    if (!this.pins?.length || !this.pinMarks) return;
    const positions = this.pinMarks.geometry.getAttribute("position");
    for (const [k, pin] of this.pins.entries()) {
      if (pin[0] < bounds.min.x || pin[0] > bounds.max.x || pin[2] < bounds.min.z || pin[2] > bounds.max.z) continue;
      const height = this.groundAt(pin[0], pin[2]);
      if (height === null) continue;
      pin[1] = height;
      positions.setY(k, height + BAND_UP_M);
      positions.needsUpdate = true;
    }
  }

  /** A round mark with a light middle, made once. */
  private pinImage() {
    if (this.pinTexture) return this.pinTexture;
    this.pinTexture = this.makeImage();
    return this.pinTexture;
  }
}

function makePinImage() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(16, 16, 15, 0, 2 * Math.PI);
  c.fill();
  return new THREE.CanvasTexture(canvas);
}
