import * as THREE from "three";
import type {Place} from "../types";
import {LEFT_BUTTON, CLICK_PX} from "./pointer";

const BAND_COLOUR = "#27d3c3";
const BAND_UP_M = 0.3;              // (the band's lines over the road)
const PIN_PX = 14;                  // a band's pin on the screen, and how near the mouse has to be to take it
const MARK_M = 1.5;                 // (the cross at A, until there is a band)

/** The band's lines as flat x, y, z pairs: its two edges along line, its ends across, a little over the road. Pure. */
export function bandLines(line: Place[], width: number) {
  const out: number[] = [], {left, right} = bandEdges(line, width);
  for (let k = 0; k + 1 < line.length; k++) out.push(...left(k), ...left(k + 1), ...right(k), ...right(k + 1));
  out.push(...left(0), ...right(0), ...left(line.length - 1), ...right(line.length - 1));
  return out;
}

const ARROW_STEP_M = 20;            // (Bank road's arrows along its line: one every this many m)
const ARROW_M = 2;                  // (... their length, and how far an edge arrow stands up)

/** Bank road's arrows as flat x, y, z pairs: a chevron along the line from A to B every ARROW_STEP_M, and at the same places an
    arrow pointing up at the high edge and down at the low one, each drawn from its foot to its tip. half: half the road's width;
    high: > 0 the left edge (as A runs to B) is high, < 0 the right, 0 no edge arrows. Pure. */
export function bankArrowLines(line: Place[], half: number, high: number) {
  const out: number[] = [];
  const along = line.slice(1).map((p, k) => Math.hypot(p[0] - line[k][0], p[2] - line[k][2]));
  const total = along.reduce((a, b) => a + b, 0);
  for (let s = ARROW_STEP_M / 2; s < total; s += ARROW_STEP_M) {
    let k = 0, rest = s;
    while (k < along.length - 1 && rest > along[k]) rest -= along[k++];
    const a = line[k], b = line[k + 1], l = along[k] || 1, t = rest / l;
    const tx = (b[0] - a[0]) / l, tz = (b[2] - a[2]) / l, lx = tz, lz = -tx;     // (AC: left of (tx, tz) is (tz, -tx))
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + BAND_UP_M, z = a[2] + (b[2] - a[2]) * t;
    const back = ARROW_M / 2;
    out.push(x - tx * back + lx * back, y, z - tz * back + lz * back, x, y, z, x - tx * back - lx * back, y, z - tz * back - lz * back, x, y, z);
    if (!high) continue;
    for (const side of [1, -1]) {
      const ex = x + lx * half * side, ez = z + lz * half * side, up = side * high > 0;
      const foot = up ? y : y + ARROW_M, tip = up ? y + ARROW_M : y, head = up ? tip - ARROW_M / 4 : tip + ARROW_M / 4;
      out.push(ex, foot, ez, ex, tip, ez, ex + tx * ARROW_M / 4, head, ez + tz * ARROW_M / 4, ex, tip, ez,
               ex - tx * ARROW_M / 4, head, ez - tz * ARROW_M / 4, ex, tip, ez);
    }
  }
  return out;
}

/** An edit range's colours (editRanges): its fully banked stretch, the picked one's, its transitions, transitions that do
    not fit. */
export const RANGE_COLOURS = {core: "#ff9f43", picked: "#ffd166", transition: "#a855f7", misfit: "#e5484d"};

export interface RangeDrawing {before: Place[]; core: Place[]; after: Place[]; width: number; picked: boolean; fits: boolean}

/** Each range's three parts as band lines (bandLines) with their colour. Pure. */
export function rangeSegments(ranges: RangeDrawing[]) {
  return ranges.flatMap(r => [
    {lines: r.core.length > 1 ? bandLines(r.core, r.width) : [], fill: [] as number[], colour: r.picked ? RANGE_COLOURS.picked : RANGE_COLOURS.core},
    ...[r.before, r.after].map(part => ({lines: part.length > 1 ? bandLines(part, r.width) : [],
                                         fill: part.length > 1 ? bandFill(part, r.width) : [],
                                         colour: r.fits ? RANGE_COLOURS.transition : RANGE_COLOURS.misfit}))]);
}

/** A band's edge points along line, width in m, a little over the road: left(k) and right(k) as [x, y, z]. Pure. */
function bandEdges(line: Place[], width: number) {
  const half = width / 2;
  const side = (k: number) => {
    const a = line[Math.max(0, k - 1)], b = line[Math.min(line.length - 1, k + 1)], l = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1;
    return [(b[2] - a[2]) / l * half, (a[0] - b[0]) / l * half];
  };
  return {
    left: (k: number) => { const [dx, dz] = side(k); return [line[k][0] + dx, line[k][1] + BAND_UP_M, line[k][2] + dz]; },
    right: (k: number) => { const [dx, dz] = side(k); return [line[k][0] - dx, line[k][1] + BAND_UP_M, line[k][2] - dz]; },
  };
}

/** The band's surface as triangles (flat x, y, z): two per step along line. Pure. */
export function bandFill(line: Place[], width: number) {
  const out: number[] = [], {left, right} = bandEdges(line, width);
  for (let k = 0; k + 1 < line.length; k++) out.push(...left(k), ...right(k), ...left(k + 1), ...right(k), ...right(k + 1), ...left(k + 1));
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
  overPin = false;                    // (the mouse is on a pin: the pointer says it can be taken)
  private onPinMoved: (pin: number, x: number, z: number) => void = () => {};
  onPinTaken: (pin: number) => void = () => {};
  private band: THREE.LineSegments | null = null;
  private crossings: THREE.LineSegments | null = null;
  private blockers: THREE.LineSegments | null = null;
  private bankArrows: THREE.LineSegments | null = null;
  private ranges: (THREE.LineSegments | THREE.Mesh)[] = [];

  constructor(private readonly scene: THREE.Scene, private readonly camera: THREE.PerspectiveCamera,
    private readonly groundAt: (x: number, z: number) => number | null, private readonly changed: () => void,
    private readonly makeImage: () => THREE.Texture = makePinImage) {}

  dispose() {
    this.drawBand(null, 0);
    this.drawPins([]);
    this.drawCrossings([]);
    this.drawBlockers([]);
    this.drawBankArrows(null, 0, 0);
    this.drawRanges([]);
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
    if (!pins.length) this.overPin = false;
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

  /** Crosses above mapped road intersections; they are display marks, never draggable pins. */
  drawCrossings(places: Place[]) {
    if (this.crossings) {
      this.scene.remove(this.crossings);
      this.crossings.geometry.dispose();
      (this.crossings.material as THREE.Material).dispose();
      this.crossings = null;
    }
    if (!places.length) { this.changed(); return; }
    this.crossings = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position",
      new THREE.Float32BufferAttribute(places.flatMap(crossLines), 3)),
      new THREE.LineBasicMaterial({color: "#ffe05a", depthTest: false}));
    this.crossings.renderOrder = 12;
    this.crossings.frustumCulled = false;
    this.scene.add(this.crossings);
    this.changed();
  }

  /** Red crosses at fixed rail or tunnel parts that prevent the marked road correction. */
  drawBlockers(places: Place[]) {
    if (this.blockers) {
      this.scene.remove(this.blockers);
      this.blockers.geometry.dispose();
      (this.blockers.material as THREE.Material).dispose();
      this.blockers = null;
    }
    if (!places.length) { this.changed(); return; }
    this.blockers = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position",
      new THREE.Float32BufferAttribute(places.flatMap(crossLines), 3)),
    new THREE.LineBasicMaterial({color: "#e5484d", depthTest: false}));
    this.blockers.renderOrder = 13;
    this.blockers.frustumCulled = false;
    this.scene.add(this.blockers);
    this.changed();
  }

  /** A tool's edit ranges (rangeSegments); none: []. */
  drawRanges(ranges: RangeDrawing[]) {
    for (const old of this.ranges) {
      this.scene.remove(old);
      old.geometry.dispose();
      (old.material as THREE.Material).dispose();
    }
    // (the transitions as a see-through surface under their outline: where the road tilts toward the banking)
    this.ranges = rangeSegments(ranges).filter(s => s.lines.length).flatMap(({lines, fill, colour}) => {
      const outline = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(lines, 3)),
                                             new THREE.LineBasicMaterial({color: colour, depthTest: false}));
      const made: (THREE.LineSegments | THREE.Mesh)[] = [outline];
      if (fill.length) made.push(new THREE.Mesh(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(fill, 3)),
        new THREE.MeshBasicMaterial({color: colour, transparent: true, opacity: 0.35, depthTest: false, side: THREE.DoubleSide})));
      for (const object of made) {
        object.renderOrder = 9;
        object.frustumCulled = false;
        this.scene.add(object);
      }
      return made;
    });
    this.changed();
  }

  /** Bank road's direction and high/low edge arrows along line (bankArrowLines); null: none. */
  drawBankArrows(line: Place[] | null, half: number, high: number) {
    if (this.bankArrows) {
      this.scene.remove(this.bankArrows);
      this.bankArrows.geometry.dispose();
      (this.bankArrows.material as THREE.Material).dispose();
      this.bankArrows = null;
    }
    if (!line || line.length < 2) { this.changed(); return; }
    this.bankArrows = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position",
      new THREE.Float32BufferAttribute(bankArrowLines(line, half, high), 3)),
    new THREE.LineBasicMaterial({color: "#ff9f43", depthTest: false}));
    this.bankArrows.renderOrder = 12;
    this.bankArrows.frustumCulled = false;
    this.scene.add(this.bankArrows);
    this.changed();
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

  /** The left button on a pin takes it along over the ground; let go, it says where. onPin: the mouse came onto a pin or left it (overPin). */
  attach(el: HTMLElement, brushed: () => boolean, onPin: () => void, pointAt: (event: PointerEvent) => THREE.Vector3 | null) {
    el.addEventListener("pointerdown", e => {
      if (e.button !== LEFT_BUTTON || brushed()) return;
      const pin = this.pinAt(e, el);
      if (pin < 0) return;
      this.dragged = {pin, x: e.clientX, y: e.clientY, from: this.pins[pin]};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", e => {
      if (!this.dragged) {
        const over = this.pins.length > 0 && this.pinAt(e, el) >= 0;
        if (over !== this.overPin) { this.overPin = over; onPin(); }
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
