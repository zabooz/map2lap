import * as THREE from "three";
import {post} from "../../api";
import type {AiMove, AiCorrection, TrackEdits} from "../state/edits";
import {disposeStroke, previewBand, PreviewQueue} from "./aiPreviewBand";
import {Pencil} from "./aiPencil";
import {CLICK_PX, screenPoint} from "./pointer";

import {routeDistance, routeAnchor, type Checked, type MoveGuide} from "./aiGuide";

// One metre sideways per four metres forward limits the added heading on a straight
// to 14 degrees. The 15 m minimum spans about three car lengths on either side.
// Neither controls speed or the curvature already present in a hairpin: validate the actual strip.
const MIN_RANGE = 15;
const MAX_SLOPE = .25;
const moveRange = (offset: number) => Math.max(MIN_RANGE, Math.PI * offset / (2 * MAX_SLOPE));
const taper = (distance: number, range: number) => distance < range ? (1+Math.cos(Math.PI*distance/range))/2 : 0;

/** Recover the peak offset from a drop anywhere in the taper. Pure. */
function peakOffset(local: number, distance: number) {
  if (!local || !distance) return local;
  let low = local, high = Math.max(2*local, 4*MAX_SLOPE*distance/Math.PI);
  // Above this upper bound the grab point gets at least half the peak displacement.
  while (high-low > .0001) {
    const mid = (low+high)/2;
    if (mid*taper(distance, moveRange(mid)) < local) low=mid;
    else high=mid;
  }
  return high;
}

/** Store the dropped world point in the directed frame of the route at this anchor. */
function placeAt(move: AiMove, x: number, z: number) {
  const [before, centre, after] = move.anchor.context;
  const dx = after[0]-before[0], dz = after[1]-before[1], length = Math.hypot(dx,dz);
  move.routeOffset = ((x-centre[0])*dz-(z-centre[1])*dx)/length;
  move.routeAlong = ((x-centre[0])*dx+(z-centre[1])*dz)/length;
}

/** A pressed pointer owns a single move until release. Geometry stays in the view, outside React. */
export function editMoves(el: HTMLCanvasElement, scene: THREE.Scene, camera: THREE.PerspectiveCamera,
  guide: MoveGuide, url: string, corrections: AiCorrection[], showGuide: boolean,
  edits: TrackEdits, note: (why: string) => void, hint: (text: string) => void,
  redraw: () => void, groundDistance: (mouse: THREE.Vector2) => number, groundPoint: (mouse: THREE.Vector2) => THREE.Vector3 | null, previewing: (spans:number[][][]) => void, cursor: (value:string) => void,
  hintAt: (mouse:THREE.Vector2) => (() => void) | undefined) {
  let pen = false, free = true;
  let lastPointer: PointerEvent | null = null;
  const saved = corrections.filter(item => item.kind === "move");
  const stops = new AbortController(), {signal} = stops;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
  const positions = new Float32Array(guide.rows.length*3), colours = new Float32Array(positions.length);
  const geometry = new THREE.BufferGeometry()
    .setAttribute("position", new THREE.BufferAttribute(positions, 3))
    .setAttribute("color", new THREE.BufferAttribute(colours, 3));
  const mat = new THREE.LineBasicMaterial({vertexColors: true, depthWrite: false});
  const line = new THREE.LineSegments(geometry, mat);
  line.renderOrder = 11;
  scene.add(line);
  const distances = new Map(saved.map(item => [item.id, item.anchor.metre]));
  const samples = new Map<number, number[]>();
  const invalid = new Map<string, string>();
  let drag: {hint?: () => void; x:number; y:number; i: number; start: THREE.Vector3; initial: THREE.Vector3; peak: number; delta: [number,number]; move: AiMove; shift: number; error: string} | null = null;
  const liveYellow = new Set<number>();
  let busy = false, serial = 0;
  const queue = new PreviewQueue();
  const band = new THREE.Group();
  scene.add(band);
  let moveSpans: number[][][] = [];
  const setBand = (rows: Checked["samples"]) => {
    for (const part of [...band.children]) disposeStroke(part);
    moveSpans = [];
    const runs: number[][][] = [];
    let run: number[][] = [], prev = -2;
    for (const [i, ...row] of rows) {
      if (i !== prev+1) {
        if (run.length) runs.push(run);
        run = [];
      }
      run.push(row); prev = i;
    }
    if (run.length) runs.push(run);
    if (guide.closed && runs.length > 1 && rows[0][0] === 0 && prev === guide.rows.length-1)
      runs[0] = runs.pop()!.concat(runs[0]);
    for (const part of runs) if (part.length > 1) {
      const strip = previewBand(part);
      band.add(strip); moveSpans.push(strip.ends);
    }
  };
  let keptBand: Checked["samples"] = [];
  let checkedPositions = new Map<number, number[]>();
  const owner = (m: number) => saved.find(item => routeDistance(m, distances.get(item.id)!, guide) < item.range);
  const yellow = new Set<number>();
  const green = new THREE.Color(0x51de94), red = new THREE.Color(0xff3939);
  const deltas = new Map<string, [number, number]>();
  for (const move of saved) {
    if (move.routeOffset === undefined || move.anchor.route !== guide.key) continue;
    const [before, centre, after] = move.anchor.context;
    const dx = after[0]-before[0], dz = after[1]-before[1], length = Math.hypot(dx,dz);
    if (!length) continue;
    const row = guide.rows.reduce((a,b) => routeDistance(a[3],move.anchor.metre,guide) < routeDistance(b[3],move.anchor.metre,guide) ? a : b);
    const along = move.routeAlong ?? 0;
    deltas.set(move.id, [centre[0]+(dx*along+dz*move.routeOffset)/length-row[0],
                         centre[1]+(dz*along-dx*move.routeOffset)/length-row[2]]);
  }
  function draw() {
    const edges: number[] = [];
    guide.rows.forEach(([x, y, z, m], i) => {
      const baked = samples.get(i);
      if (baked) [x,y,z] = baked;
      const existing = owner(m);
      const delta = existing && deltas.get(existing.id);
      if (!baked && existing && delta) {
        const w = (1+Math.cos(Math.PI*routeDistance(m,distances.get(existing.id)!,guide)/existing.range))/2;
        x += w*delta[0]; z += w*delta[1];
      }
      let colour = guide.errors?.[i] || existing && invalid.has(existing.id) ? red : yellow.has(i) ? amber : green;
      const preview = showGuide || baked || existing || guide.errors?.[i]
        || (drag && routeDistance(m, drag.move.anchor.metre, guide) < drag.move.range);
      if (preview && (i > 0 || guide.closed) && !pencil.covers(m))
        edges.push((i+guide.rows.length-1)%guide.rows.length, i);
      if (drag) {
        const d = routeDistance(m, drag.move.anchor.metre, guide);
        if (existing?.id === drag.move.id || d < drag.move.range) {
          const weight = taper(d, drag.move.range);
          x = guide.rows[i][0] + drag.delta[0]*weight;
          z = guide.rows[i][2] + drag.delta[1]*weight;
          const checked = checkedPositions.get(i);
          if (checked) [x,y,z] = checked;
          if (drag.error) colour = red;
          else if (liveYellow.has(i)) colour = amber;
        }
      }
      positions.set([x, y+.34, z], 3*i);
      colour.toArray(colours, 3*i);
    });
    geometry.setIndex(edges);
    geometry.attributes.position.needsUpdate = geometry.attributes.color.needsUpdate = true;
    geometry.computeBoundingSphere();
    line.visible = showGuide || corrections.length > 0 || pen || !!drag;
    previewing([...moveSpans, ...pencil.bandSpans()]);
    redraw();
  }
  const amber = new THREE.Color(0xffd23b);
  const pencil = new Pencil(el, scene, camera, guide, corrections, url, groundPoint, groundDistance,
    e => pick(e), edits, note, hint, () => draw());
  draw();
  if (corrections.length) void post<Checked>(url, {aiCorrections: corrections}).then(check => {
    if (signal.aborted) return;
    if (check.error) { note(check.error); return; }
    for (const [id, why] of Object.entries(check.skipped ?? {})) invalid.set(id, why);
    for (const [id, metre] of Object.entries(check.centres ?? {})) distances.set(id, metre);
    for (const [i,x,y,z] of check.samples ?? []) samples.set(i,[x,y,z]);
    keptBand = check.samples ?? [];
    if (!drag) setBand(keptBand);
    pencil.showSaved(check);
    for (const i of check.yellow ?? []) yellow.add(i);
    note([...invalid.values()].join(" · ")); draw();
  });
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
    lastPointer = e;
    const hint = !pencil.engaged && e.button === 0 && !e.shiftKey ? hintAt(screenPoint(e,el)) : undefined;
    if (hint && pen) return; // Let the tool host select on click. A redraw already underway owns its end click.
    if (!hint && pencil.press(e)) return;
    if (busy || (e.button !== 0 && e.button !== 2)) return;
    const i = pick(e);
    if (i < 0) return;
    const row = guide.rows[i], m = guide.closed ? row[3] % guide.length : row[3];
    const existing = owner(m);
    if (e.button === 2) {
      if (existing) { e.stopImmediatePropagation(); e.preventDefault(); edits.removeAiCorrection(existing.id); }
      return;
    }
    if (row[8]) return;
    plane.constant = -row[1];
    const start = intersection(e);
    if (!start) return;
    const centre = existing ? distances.get(existing.id)! : m;
    const peak = existing ? guide.rows.reduce((best, r, j) =>
      routeDistance(r[3],centre,guide) < routeDistance(guide.rows[best][3],centre,guide) ? j : best, i) : i;
    const peakRow = guide.rows[peak];
    const move: AiMove = {id:existing?.id ?? crypto.randomUUID(), kind:"move", range:existing?.range ?? MIN_RANGE,
      free:existing?.free ?? free, anchor:routeAnchor(guide, centre, peakRow[1])};
    const initial = new THREE.Vector3().fromArray(positions, i*3);
    drag = {hint, x:e.clientX, y:e.clientY, i, start, initial, peak, delta:existing && deltas.get(existing.id) || [0,0], move, shift:0, error:""};
    cursor("grabbing");
    e.stopImmediatePropagation(); e.preventDefault(); el.setPointerCapture(e.pointerId);
  }, opts);
  function hoverCursor() {
    if (drag) { cursor("grabbing"); return; }
    const i = lastPointer ? pick(lastPointer) : -1;
    cursor(i >= 0 && guide.rows[i][8] ? "not-allowed" : pen ? "crosshair" : i >= 0 ? "grab" : "");
  }
  // Validate the gesture last so expanding an older move cannot displace a later redraw.
  // The draft keeps the original order when it replaces the accepted ID.
  const withMove = (move: AiMove) => [...corrections.filter(c => c.id !== move.id), move];
  el.addEventListener("pointerleave", () => { lastPointer = null; hoverCursor(); }, opts);
  el.addEventListener("pointermove", e => {
    lastPointer = e;
    if (busy) return;
    if (!drag) {
      hoverCursor();
      if (pencil.hover(e)) return;
      if (invalid.size || Object.keys(guide.errors ?? {}).length) {
        const i = pick(e), id = i < 0 ? undefined : owner(guide.rows[i][3])?.id;
        el.title = (id && invalid.get(id)) || guide.errors?.[i] || "";
      }
      return;
    }
    e.stopImmediatePropagation();
    if (drag.hint && Math.hypot(e.clientX-drag.x,e.clientY-drag.y) >= CLICK_PX) drag.hint = undefined;
    const p = intersection(e);
    if (!p) return;
    const r = guide.rows[drag.i], move = drag.move;
    drag.shift = (p.x-drag.start.x)*r[4] + (p.z-drag.start.z)*r[5];
    const dx = drag.initial.x-r[0]+r[4]*drag.shift, dz = drag.initial.z-r[2]+r[5]*drag.shift;
    const local = Math.hypot(dx,dz), peak = peakOffset(local, routeDistance(r[3],move.anchor.metre,guide));
    const scale = local ? peak/local : 0, base = guide.rows[drag.peak];
    drag.delta = [dx*scale,dz*scale];
    move.range = moveRange(peak);
    placeAt(move, base[0]+drag.delta[0], base[2]+drag.delta[1]);
    drag.error = "";
    liveYellow.clear();
    for (const item of saved) {
      if (item.id !== move.id && routeDistance(move.anchor.metre, distances.get(item.id)!, guide) < move.range + item.range) {
        drag.error = `Overlapping correction at route metre ${move.anchor.metre.toFixed(1)}`; break;
      }
    }
    checkedPositions.clear();
    const request = ++serial;
    const gesture = drag;
    queue.clear();
    if (!drag.error) {
      queue.put(async () => {
        const check = await post<Checked>(url, {aiCorrections: withMove(move)});
        if (signal.aborted || busy || drag !== gesture || request !== serial) return;
        // While the pointer is moving the latest measured band stays visible.
        setBand(check.samples ?? []);
        checkedPositions = new Map((check.samples ?? []).map(([i,...row]) => [i,row]));
        drag.error = check.error ?? check.skipped?.[move.id] ?? "";
        for (const i of check.yellow ?? []) liveYellow.add(i);
        el.title = drag.error;
        note(drag.error); draw();
      });
    } else setBand(keptBand);
    el.title = drag.error;
    note(drag.error); draw();
  }, opts);
  el.addEventListener("pointerup", async e => {
    if (pencil.release(e)) { e.stopImmediatePropagation(); return; }
    if (busy || !drag || e.button !== 0) return;
    e.stopImmediatePropagation();
    queue.clear(); ++serial;
    const gesture = drag, {move} = drag;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (drag.hint && Math.hypot(e.clientX-drag.x,e.clientY-drag.y) < CLICK_PX) drag.hint();
    else if (Math.abs(drag.shift) > .001) {
      busy = true;
      await edits.inTurn(async () => {
        if (signal.aborted || drag !== gesture) return;
        const check = await post<Checked>(url, {aiCorrections: withMove(move)});
        if (signal.aborted || drag !== gesture) return;
        const reason = check.error ?? check.skipped?.[move.id];
        if (reason) note(reason);
        else edits.addAiCorrection(move);
      });
      busy = false;
      if (signal.aborted || drag !== gesture) return;
    }
    drag = null; hoverCursor(); checkedPositions.clear(); setBand(keptBand); draw();
  }, opts);
  el.addEventListener("pointercancel", () => { pencil.cancelDrag(); drag = null; hoverCursor(); checkedPositions.clear(); setBand(keptBand); queue.clear(); ++serial; draw(); }, opts);
  return {
    setMode(nextPen:boolean, nextFree:boolean) {
      if (nextPen !== pen || nextFree !== free) {
        pen = nextPen; free = nextFree;
        if (drag) {
          if (lastPointer && el.hasPointerCapture(lastPointer.pointerId)) el.releasePointerCapture(lastPointer.pointerId);
          drag = null; checkedPositions.clear(); queue.clear(); ++serial; setBand(keptBand);
        }
        pencil.setMode(pen, free);
        draw();
      }
      hoverCursor();
    },
    dispose() {
      pencil.dispose(); disposeStroke(band); previewing([]); cursor(""); stops.abort(); queue.clear();
      el.title = ""; scene.remove(line); geometry.dispose(); mat.dispose(); redraw();
    },
  };
}
