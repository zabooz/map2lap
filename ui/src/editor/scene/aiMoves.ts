import * as THREE from "three";
import {post} from "../../api";
import type {AiMove} from "../state/edits";
import {screenPoint} from "./pointer";

type Row = [number, number, number, number, number, number, number, number, number];
export interface MoveGuide {rows: Row[]; path: number[][]; key: string; origin: number[]; closed: boolean; length: number}
interface Checked {samples: [number, number, number, number][]; centres: Record<string, number>}

const at = (guide: MoveGuide, metre: number) => {
  let s = guide.closed ? ((metre % guide.length) + guide.length) % guide.length : Math.max(0, metre);
  for (let i = 1; i < guide.path.length; i++) {
    const [x, z] = guide.path[i-1], [dx, dz] = [guide.path[i][0]-x, guide.path[i][1]-z];
    const length = Math.hypot(dx, dz);
    if (s <= length && length) return [x + dx*s/length, z + dz*s/length];
    s -= length;
  }
  return guide.path[guide.path.length-1];
};

function apart(s: number, m: number, guide: MoveGuide) {
  if (!guide.closed) return Math.abs(s-m);
  const d = Math.abs(s-m) % guide.length;
  return Math.min(d, guide.length-d);
}

/** A pressed pointer owns a single move until release. Geometry stays in the view, outside React. */
export function editMoves(el: HTMLCanvasElement, scene: THREE.Scene, camera: THREE.PerspectiveCamera,
  guide: MoveGuide, url: string, saved: AiMove[], range: number, showGuide: boolean,
  add: (move: AiMove) => void, remove: (id: string) => void, note: (why: string) => void,
  redraw: () => void, groundDistance: (mouse: THREE.Vector2) => number) {
  const stops = new AbortController(), {signal} = stops;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
  const positions = new Float32Array(guide.rows.length*3), colours = new Float32Array(positions.length);
  const geometry = new THREE.BufferGeometry()
    .setAttribute("position", new THREE.BufferAttribute(positions, 3))
    .setAttribute("color", new THREE.BufferAttribute(colours, 3));
  const mat = new THREE.LineBasicMaterial({vertexColors: true, depthWrite: false});
  const line = guide.closed ? new THREE.LineLoop(geometry, mat) : new THREE.Line(geometry, mat);
  line.renderOrder = 11;
  scene.add(line);
  const distances = new Map(saved.map(item => [item.id, item.anchor.metre]));
  const samples = new Map<number, number[]>();
  const invalid = new Map<string, string>();
  let drag: {i: number; start: THREE.Vector3; move: AiMove; error: string} | null = null;
  let busy = false, serial = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const owner = (m: number) => saved.find(item => apart(m, distances.get(item.id)!, guide) < item.range);
  const green = new THREE.Color(0x51de94), red = new THREE.Color(0xff3939);
  function draw() {
    guide.rows.forEach(([x, y, z, m, dx, dz], i) => {
      const baked = samples.get(i);
      if (baked) [x,y,z] = baked;
      const existing = owner(m);
      if (!baked && existing) {
        const d = apart(m, distances.get(existing.id)!, guide);
        const shift = existing.offset*(1+Math.cos(Math.PI*d/existing.range))/2;
        x += dx*shift; z += dz*shift;
      }
      let colour = existing && invalid.has(existing.id) ? red : green;
      if (drag) {
        const d = apart(m, drag.move.anchor.metre, guide);
        if (d < range) {
          const shift = drag.move.offset * (1+Math.cos(Math.PI*d/range))/2;
          x += dx*shift; z += dz*shift;
          if (drag.error) colour = red;
        }
      }
      positions.set([x, y+.34, z], 3*i);
      colour.toArray(colours, 3*i);
    });
    geometry.attributes.position.needsUpdate = geometry.attributes.color.needsUpdate = true;
    geometry.computeBoundingSphere();
    line.visible = showGuide || saved.length > 0 || !!drag;
    redraw();
  }
  draw();
  // Resolve each correction independently so an invalid saved move can still be found and removed.
  void Promise.all(saved.map(async item => {
    const check = await post<Checked>(url, {aiCorrections: [item]});
    if (signal.aborted) return;
    if (check.error) { invalid.set(item.id, check.error); note(check.error); }
    else {
      if (check.centres) distances.set(item.id, check.centres[item.id]);
      for (const [i,x,y,z] of check.samples ?? []) samples.set(i,[x,y,z]);
    }
    draw();
  }));
  function pick(event: PointerEvent) {
    const mouse = screenPoint(event, el);
    const limit = groundDistance(mouse) + .6;
    let best = 8**2, index = -1, depth = Infinity;
    const rect = el.getBoundingClientRect(), p = new THREE.Vector3();
    let last: {x: number; y: number; distance: number; i: number} | null = null;
    for (let j = 0; j < guide.rows.length + Number(guide.closed); j++) {
      const i = j % guide.rows.length;
      p.fromArray(positions, i*3);
      const distance = camera.position.distanceTo(p);
      p.project(camera);
      if (p.z < -1 || p.z > 1) { last = null; continue; }
      const x = (p.x-mouse.x)*rect.width/2, y = (p.y-mouse.y)*rect.height/2;
      if (last) {
        const dx = x-last.x, dy = y-last.y;
        const t = Math.max(0, Math.min(1, -(last.x*dx+last.y*dy)/(dx*dx+dy*dy || 1)));
        const d = (last.x+t*dx)**2+(last.y+t*dy)**2;
        const away = last.distance+t*(distance-last.distance);
        if (away <= limit && (d < best || (d === best && away < depth))) {
          best = d; index = t < .5 ? last.i : i; depth = away;
        }
      }
      last = {x,y,i,distance};
    }
    return index;
  }
  function intersection(event: PointerEvent) {
    ray.setFromCamera(screenPoint(event, el), camera);
    return ray.ray.intersectPlane(plane, new THREE.Vector3());
  }
  const opts = {capture: true, signal};
  el.addEventListener("pointerdown", e => {
    if (busy || (e.button !== 0 && e.button !== 2)) return;
    const i = pick(e);
    if (i < 0) return;
    const row = guide.rows[i], m = guide.closed ? row[3] % guide.length : row[3];
    const existing = owner(m);
    if (e.button === 2) {
      if (existing) { e.stopImmediatePropagation(); e.preventDefault(); remove(existing.id); }
      return;
    }
    plane.constant = -row[1];
    const start = intersection(e);
    if (!start) return;
    const move: AiMove = {id: crypto.randomUUID(), kind: "move", range, offset: 0, free: false,
      anchor: {metre: m, level: row[1], route: guide.key, origin: guide.origin,
        context: [-5,0,5].map(d => at(guide, m+d))}};
    drag = {i, start, move, error: ""};
    e.stopImmediatePropagation(); e.preventDefault(); el.setPointerCapture(e.pointerId);
  }, opts);
  el.addEventListener("pointermove", e => {
    if (!drag) {
      if (invalid.size) {
        const i = pick(e), id = i < 0 ? undefined : owner(guide.rows[i][3])?.id;
        el.title = (id && invalid.get(id)) || "";
      }
      return;
    }
    e.stopImmediatePropagation();
    const p = intersection(e);
    if (!p) return;
    const r = guide.rows[drag.i], move = drag.move;
    move.offset = (p.x-drag.start.x)*r[4] + (p.z-drag.start.z)*r[5];
    drag.error = "";
    for (const item of saved) {
      if (apart(move.anchor.metre, distances.get(item.id)!, guide) < range + item.range) {
        drag.error = `Overlapping correction at route metre ${move.anchor.metre.toFixed(1)}`; break;
      }
    }
    const request = ++serial;
    clearTimeout(timer);
    if (!drag.error) {
      timer = setTimeout(async () => {
        const check = await post<Checked>(url, {aiCorrections: [...saved, move]});
        if (signal.aborted || !drag || request !== serial) return;
        drag.error = check.error ?? "";
        el.title = drag.error;
        note(drag.error); draw();
      }, 100);
    }
    el.title = drag.error;
    note(drag.error); draw();
  }, opts);
  el.addEventListener("pointerup", async e => {
    if (!drag || e.button !== 0) return;
    e.stopImmediatePropagation();
    clearTimeout(timer); ++serial;
    const {move} = drag;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (Math.abs(move.offset) > .001) {
      busy = true;
      const check = await post<Checked>(url, {aiCorrections: [...saved, move]});
      if (signal.aborted) return;
      if (check.error) note(check.error);
      else add(move);
      busy = false;
    }
    drag = null; draw();
  }, opts);
  el.addEventListener("pointercancel", () => { drag = null; clearTimeout(timer); ++serial; draw(); }, opts);
  return () => { stops.abort(); clearTimeout(timer); el.title = ""; scene.remove(line); geometry.dispose(); mat.dispose(); redraw(); };
}
