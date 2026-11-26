import * as THREE from "three";
import type {AiAnchor, AiMargin} from "../state/edits";
import type {Place} from "../types";
import {routeAnchor, routeDistance, type MoveGuide} from "./aiGuide";
import {bandLines, laneBand, type AiLineDraw} from "./aiLine";
import {disposeStroke} from "./aiPreviewBand";

export type MarginSide = "left" | "right";
export interface MarginLocation {start?: number; end?: number; error?: string}
type Section = [number, number, number, number];
export interface MarginPreview {
  auto: [number, number, number][];
  sections: Section[];
  margins: Record<string, MarginLocation>;
  unplaced: "manual" | "recalculate" | null;
  metres?: number[] | null;
  guideMarks?: Record<string, {start?: GuideMark; end?: GuideMark; error?: string}>;
}
type GuideMark = [metre: number, level: number];
export interface MarginMark {anchor: AiAnchor; fraction: number}
export interface MarginHit {index: number; t: number}
export interface MarginRange extends MarginLocation {unapplied?: boolean; marking?: "start" | "stretch"; id: string; left: number | null; right: number | null}
export const intervals = (a: number, b: number) => a <= b ? [[a,b]] : [[a,1],[0,b]];

/** Normalized cumulative 3D distance on the installed line, including a Circuit's closing chord. Pure. */
export function laneFractions(at: Place[], closed: boolean) {
  const stations = [0];
  for (let i=1; i<at.length + Number(closed); i++) {
    const [x,y,z] = at[i%at.length], a = at[i-1];
    stations.push(stations[i-1] + Math.hypot(x-a[0], y-a[1], z-a[2]));
  }
  const total = stations.at(-1)!;
  return stations.map(s => total ? s/total : 0);
}

const mix = (a: number, b: number, t: number) => a + (b-a)*t;
const between = (a: Place, b: Place, t: number): Place => [mix(a[0],b[0],t), mix(a[1],b[1],t), mix(a[2],b[2],t)];

/** Display-only projection of a resolved guide mark onto the installed 3D polyline. Pure. */
export function projectGuideMark([metre, level]: GuideMark, guide: MoveGuide, points: Place[], stations: number[]) {
  if (!guide.rows.length || points.length < 2) return;
  const rows = guide.rows;
  let rowIndex = 0;
  for (let i=1; i<rows.length; i++) {
    if (routeDistance(rows[i][3], metre, guide) < routeDistance(rows[rowIndex][3], metre, guide)) rowIndex = i;
  }
  const row = rows[rowIndex];
  const before = rows[rowIndex-1] ?? (guide.closed ? rows.at(-1)! : row);
  const after = rows[rowIndex+1] ?? (guide.closed ? rows[0] : row);
  const heading = new THREE.Vector3(after[0]-before[0],after[1]-before[1],after[2]-before[2]).normalize();
  const target = new THREE.Vector3(row[0], level, row[2]);
  const segment = new THREE.Line3(), nearest = new THREE.Vector3();
  let best = Infinity, alignment = -Infinity, fraction = 0;
  for (let i=0; i+1<stations.length; i++) {
    segment.start.fromArray(points[i]);
    segment.end.fromArray(points[(i+1)%points.length]);
    const t = segment.distanceSq() ? segment.closestPointToPointParameter(target, true) : 0;
    const gap = segment.at(t, nearest).distanceToSquared(target);
    // At a shared carriageway the outward and return passes can coincide exactly.
    if (gap > best) continue;
    const direction = segment.delta(nearest).normalize().dot(heading);
    if (gap < best || direction > alignment) {
      best = gap;
      alignment = direction;
      fraction = mix(stations[i], stations[i+1], t);
    }
  }
  return fraction;
}

/** Snap a band hit to its guide row by route metre, or by 3D position on an older line without correspondence. Pure. */
export function guideMark(guide: MoveGuide, metres: number[] | null | undefined, index: number, t: number,
                          [x,z]: [number,number], heights: ArrayLike<number>): AiAnchor {
  const next = (index+1) % heights.length;
  const a = metres?.[index], b = metres?.[next];
  const metre = a != null && b != null ? mix(a, guide.closed && b < a ? b+guide.length : b, t) : null;
  let best = guide.rows[0], distance = Infinity, level = mix(heights[index], heights[next], t);
  for (const row of guide.rows) {
    const d = metre === null ? Math.hypot(row[0]-x, row[1]-level, row[2]-z) : routeDistance(row[3], metre, guide);
    if (d < distance) { best = row; distance = d; }
  }
  const snapped = guide.closed ? best[3] % guide.length : best[3];
  // A redraw may run on a different deck from the guide. Placement checks the installed sample nearest the snapped route metre.
  if (metres) {
    distance = Infinity;
    for (let i=0; i<metres.length; i++) {
      const d = routeDistance(metres[i], snapped, guide);
      if (d < distance) { level = heights[i]; distance = d; }
    }
  }
  return routeAnchor(guide, snapped, level);
}

/** Effective per-side values in a directed stretch, including zero between exported sections. Pure. */
export function effectiveRange(sections: Section[], side: MarginSide, start: number, end: number) {
  const values: number[] = [];
  for (const [a,b] of intervals(start,end)) {
    let cursor = a;
    for (const [from,to,left,right] of sections) {
      if (to <= a || from >= b) continue;
      if (from > cursor) values.push(0);
      values.push(side === "left" ? left : right);
      cursor = Math.min(to,b);
    }
    if (cursor < b) values.push(0);
  }
  if (!values.length) values.push(0);
  const lo = Math.min(...values), hi = Math.max(...values);
  return lo === hi ? lo.toFixed(2) : `${lo.toFixed(2)}–${hi.toFixed(2)}`;
}

/** The installed band geometry and its pickable margin stretches. The preview uses the INI's 3D fractions. */
export function editMargins(el: Pick<HTMLElement, "title" | "clientHeight" | "removeAttribute">, scene: THREE.Scene, camera: THREE.PerspectiveCamera, guide: MoveGuide | undefined,
                            lane: AiLineDraw, preview: MarginPreview, margins: MarginRange[],
                            pick: (mouse: THREE.Vector2) => number, add: (mark: MarginMark) => void, select: (id: string) => void) {
  const rows = lane.bandRows, closed = lane.isClosed;
  const marks = new THREE.Group(), stations = laneFractions(rows.map(row => row.at), closed);
  scene.add(marks);
  let selectedId: string | null = null;
  const edgesAt = (i: number, t: number): [Place, Place] => {
    const from = rows[i].edges, to = rows[(i+1)%rows.length].edges;
    return [between(from[0], to[0], t), between(from[1], to[1], t)];
  };
  const crossSection = (s: number) => {
    let lo = 0, hi = stations.length - 1;
    while (hi-lo > 1) {
      const mid = Math.floor((hi+lo)/2);
      if (stations[mid] <= s) lo = mid;
      else hi = mid;
    }
    return {i:lo, edges:edgesAt(lo, (s-stations[lo]) / (stations[hi]-stations[lo] || 1))};
  };
  const clear = () => { for (const child of [...marks.children]) disposeStroke(child); };
  const pieces = (range: MarginRange) => {
    const a = range.start ?? range.end, b = range.end ?? range.start;
    if (a == null || b == null) return [];
    return !closed && a>b ? [[b,a]] : intervals(a,b);
  };
  function draw(range: MarginRange, selected: boolean) {
    const colour = range.error ? "#ff5454" : range.unapplied ? (selected ? "#dfa6ff" : "#ac86d8") : selected ? "#ffc843" : "#f4e2a6";
    for (const [a,b] of pieces(range)) {
      const first = crossSection(a), last = crossSection(b);
      const edges = [first.edges, ...rows.slice(first.i+1,last.i+1).map(r => r.edges), last.edges];
      const outline = [...edges[0][0], ...edges[0][1], ...last.edges[0], ...last.edges[1]];
      if (a < b) {
        const fill = new THREE.Mesh(laneBand(edges, edges.map(() => [1,1,1]), false),
          new THREE.MeshBasicMaterial({color: colour, transparent:true, opacity: selected ? .38 : .22,
            side:THREE.DoubleSide, forceSinglePass:true, depthWrite:false, toneMapped:false}));
        fill.renderOrder = 11;
        marks.add(fill);
        for (let i=1; i<edges.length; i++) {
          if (range.left !== null || range.error) outline.push(...edges[i-1][0], ...edges[i][0]);
          if (range.right !== null || range.error) outline.push(...edges[i-1][1], ...edges[i][1]);
        }
      }
      marks.add(bandLines(outline, colour, selected ? 4 : 3, 12));
    }
  }
  function locate({index,t}: MarginHit) {
    const fraction = mix(stations[index], stations[index+1], t);
    const from = new THREE.Vector3(...rows[index].at), to = new THREE.Vector3(...rows[(index+1)%rows.length].at);
    const step = from.distanceTo(to);
    const depth = -from.lerp(to,t).applyMatrix4(camera.matrixWorldInverse).z;
    // A single surviving endpoint is a thin crossbar. Give it the same eight-pixel target as the centreline.
    const tolerance = step ? (stations[index+1]-stations[index])/step * 16 * depth *
      Math.tan(THREE.MathUtils.degToRad(camera.fov)/2) / Math.max(el.clientHeight,1) : 0;
    const owners = margins.filter(r => pieces(r).some(([a,b]) => a === b
      ? Math.abs(fraction-a) <= tolerance : a <= fraction && fraction <= b));
    const owner = owners.filter(r => r.error).at(-1) ?? owners.at(-1);
    return {fraction, owner};
  }
  function redraw(changed?: MarginRange) {
    clear();
    for (const range of margins) draw(changed?.id === range.id ? changed : range, range.id === selectedId);
  }
  function markAt(hit: MarginHit): MarginMark | undefined {
    if (!guide?.rows.length) return;
    const {index,t} = hit;
    const point = between(rows[index].at, rows[(index+1)%rows.length].at, t);
    return {anchor:guideMark(guide, preview.metres, index, t, [point[0],point[2]], lane.sampleHeights),
      fraction:mix(stations[index],stations[index+1],t)};
  }
  return {
    setSelected(id: string | null) { selectedId = id; redraw(); },
    handle(mouse: THREE.Vector2) {
      const range = margins.find(r => r.id === selectedId);
      if (!range || range.marking === "start" || !guide) return;
      // Pick the crossbar in screen space so perspective does not shrink the far handle.
      const scale = new THREE.Vector3(camera.aspect*el.clientHeight/2, el.clientHeight/2, 0);
      const cursor = new THREE.Vector3(mouse.x, mouse.y, 0).multiply(scale);
      let best: "start" | "end" | undefined, closest = 8;
      for (const key of ["start","end"] as const) {
        const value = range[key];
        if (value == null) continue;
        const [a,b] = crossSection(value).edges.map(p => new THREE.Vector3(...p).project(camera).multiply(scale));
        const line = new THREE.Line3(a,b);
        const gap = (line.distanceSq() ? line.closestPointToPoint(cursor,true,new THREE.Vector3()) : a).distanceTo(cursor);
        if (gap <= closest) { best = key; closest = gap; }
      }
      if (best && lane.locate(mouse, camera, pick(mouse))) return {id:range.id, key:best};
    },
    drag(mouse: THREE.Vector2, handle: {id:string; key:"start"|"end"}) {
      const range = margins.find(r => r.id === handle.id);
      const hit = lane.locate(mouse,camera,pick(mouse));
      const mark = hit && markAt(hit);
      if (range && mark) { redraw({...range, [handle.key]:mark.fraction}); return mark; }
    },
    focusPoint(id: string) {
      const range = margins.find(r => r.id === id);
      if (!range) return;
      const a = range.start ?? range.end, b = range.end ?? range.start;
      if (a == null || b == null) return;
      let middle = (a+b)/2;
      if (closed && b<a) middle = (middle+.5)%1;
      const {i,edges} = crossSection(middle);
      return {at: between(edges[0],edges[1],.5), from:rows[i].at, to:rows[(i+1)%rows.length].at};
    },
    hover(hit: MarginHit | null) {
      const place = hit && locate(hit);
      el.title = place?.owner?.error ?? (place?.owner?.unapplied ? "Not yet applied" : "");
      return place;
    },
    click(mouse: THREE.Vector2 | null) {
      const hit = mouse && lane.locate(mouse, camera, pick(mouse));
      if (!hit) return;
      const {owner} = locate(hit);
      if (owner && !owner.marking && !margins.some(m => m.marking === "start")) return select(owner.id);
      const mark = markAt(hit);
      if (mark) add(mark);
    },
    dispose() { clear(); marks.removeFromParent(); el.removeAttribute("title"); },
  };
}

export const marginRange = (m: AiMargin, location?: MarginLocation): MarginRange =>
  ({id:m.id, left:m.left, right:m.right, ...location});
