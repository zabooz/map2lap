import * as THREE from "three";
import {LineMaterial} from "three/addons/lines/LineMaterial.js";
import {LineSegments2} from "three/addons/lines/LineSegments2.js";
import {LineSegmentsGeometry} from "three/addons/lines/LineSegmentsGeometry.js";
import type {Place} from "../types";
import {speedUpRays} from "./geometry";
import type {InstalledAiLine} from "./aiLineData";

export const SPEED_COLOURS = ["#ffd35c", "#4ee697", "#39bdff"] as const;
export const EDGE_COLOUR = "#eef8ff";
const SPEED_STOPS = SPEED_COLOURS.map(hex => new THREE.Color(hex));
const LIFT_M = 0.3;                 // As with Bank road, clear the road surface and its paint.
const LINE_PX = 2;
// One road-car length on either side damps individual terrain cells in the overlay.
const EDGE_WINDOW_M = 5;
const HOVER_PX = 8;                 // Pointer can be a few pixels off the thin centre line.
/** The slow-to-fast colour over this line's speed range, in its native m/s. Pure. */
export function laneSpeedColour(speed: number, slow: number, fast: number) {
  const t = slow < fast ? THREE.MathUtils.clamp((speed - slow) / (fast - slow), 0, 1) * 2 : 1;
  const i = t <= 1 ? 0 : 1;
  return SPEED_STOPS[i].clone().lerp(SPEED_STOPS[i + 1], t - i);
}

/** The stored widths are horizontal distances along up × forward. The road normal gives each side's height. Pure. */
export function laneEdges([x, y, z]: Place, [fx, fz]: [number, number], [nx, ny, nz]: Place, left: number, right: number): [Place, Place] {
  const length = Math.hypot(fx, fz);
  if (!length) return [[x, y, z], [x, y, z]];
  const edge = (width: number): Place => {
    const dx = fz / length * width, dz = -fx / length * width;
    return [x + dx, y - (ny ? (nx * dx + nz * dz) / ny : 0), z + dz];
  };
  return [edge(left), edge(-right)];
}

/** Average each side's width along the road, preserving open endpoints and the circuit seam. Pure. */
function displayWidths(at: Place[], edges: [Place, Place][], closed: boolean) {
  const count = at.length;
  const widths = edges.map((pair, i) => pair.map(p => Math.hypot(p[0]-at[i][0], p[2]-at[i][2])));
  const stations = [0];
  for (let i = 0; i < count; i++) {
    const next = at[(i+1) % count];
    const step = i+1 < count || closed ? Math.hypot(next[0]-at[i][0], next[2]-at[i][2]) : 0;
    stations.push(stations[i] + step);
  }
  const length = stations[count];
  const steps = at.map((_, i) => stations[i+1] - stations[i]);
  const spans = steps.map((step, i) => step + (i ? steps[i-1] : closed ? steps[count-1] : 0));
  return widths.map(([left,right], i) => {
    const radius = closed ? Math.min(EDGE_WINDOW_M, length/2) : Math.min(EDGE_WINDOW_M, stations[i], length-stations[i]);
    // Weight by the road length represented by each sample, including on densely sampled redraws.
    let weight = 0, leftDelta = 0, rightDelta = 0;
    const add = (j:number, distance:number) => {
      const w = Math.min(spans[j], 2*radius) * (radius-distance);
      weight += w;
      leftDelta += w * (widths[j][0]-left);
      rightDelta += w * (widths[j][1]-right);
    };
    add(i, 0);
    for (const direction of [-1, 1]) {
      let distance = 0, previous = i;
      for (let j = (i+direction+count) % count; j !== i; j = (j+direction+count) % count) {
        // The open window ends at or before the endpoint in either direction.
        distance += steps[direction > 0 ? previous : j];
        if (distance >= radius) break;
        add(j, distance);
        previous = j;
      }
    }
    return weight ? [left+leftDelta/weight, right+rightDelta/weight] : [left,right];
  });
}

/** Display edges along the banked cross-sections. Pure. Signed intersections of neighbouring
    normals give their local turn centre, even with unequal spacing or a change of turn direction. */
export function displayEdges(at: Place[], measured: [Place, Place][], closed: boolean): [Place, Place][] {
  const normals = measured.map(([left,right]) => {
    const x = left[0]-right[0], z = left[2]-right[2], length = Math.hypot(x,z);
    return length ? [x/length,z/length] : [0,0];
  });
  const limits = at.map(() => [Infinity,Infinity]);
  const limit = (i:number, distance:number) => {
    const side = distance < 0 ? 1 : 0;
    limits[i][side] = Math.min(limits[i][side], Math.abs(distance));
  };
  for (let i=0; i<at.length-Number(!closed); i++) {
    const j=(i+1)%at.length;
    const [ax,az]=normals[i], [bx,bz]=normals[j], det=ax*bz-az*bx;
    if (!det) continue; // Parallel cross-sections (or a point of zero total width).
    const dx=at[j][0]-at[i][0], dz=at[j][2]-at[i][2];
    limit(i,(dx*bz-dz*bx)/det);
    limit(j,(dx*az-dz*ax)/det);
  }
  const widths = displayWidths(at, measured, closed);
  return measured.map(([left,right], i) => {
    const [x,y,z] = at[i];
    const edge = (p:Place, side:number):Place => {
      const width = Math.hypot(p[0]-x,p[2]-z);
      const visible = Math.min(widths[i][side], limits[i][side]);
      if (!width || width === visible) return p;
      const scale = visible/width;
      return [x+(p[0]-x)*scale,y+(p[1]-y)*scale,z+(p[2]-z)*scale];
    };
    return [edge(left,0),edge(right,1)];
  });
}

type LaneHit = Pick<THREE.Intersection, "faceIndex" | "pointOnLine" | "point" | "distance">;

function nearestSample(positions: Place[], start: number, point: THREE.Vector3) {
  const end = (start + 1) % positions.length;
  const apart = ([x, y, z]: Place) => (x - point.x)**2 + (y - point.y)**2 + (z - point.z)**2;
  return apart(positions[start]) <= apart(positions[end]) ? start : end;
}

/** Pick the sample at the nearer end of the closest hit inside the hover radius and in front of the scene hit. Pure. */
export function pickLanePoint(positions: Place[], hits: LaneHit[], maxDistance = Infinity): number | null {
  let sample: number | null = null, least = Infinity, depth = Infinity;
  for (const {faceIndex: start, pointOnLine, point, distance} of hits) {
    if (start == null || !pointOnLine || distance > maxDistance) continue;
    const offset = pointOnLine.distanceToSquared(point);
    if (offset > least || (offset === least && distance >= depth)) continue;
    least = offset;
    depth = distance;
    sample = nearestSample(positions, start, pointOnLine);
  }
  return sample;
}

/** A strip between the left and right edges, with each sample's colour across its width. Pure. */
export function laneBand(edges: [Place, Place][], colours: number[][], closed: boolean) {
  const indices: number[] = [], positions: number[] = [], gradient: number[] = [];
  for (const [i, [left, right]] of edges.entries()) {
    positions.push(...left, ...right);
    gradient.push(...colours[i], ...colours[i]);
    const a = 2 * i, b = 2 * ((i + 1) % edges.length);
    if (i + 1 < edges.length || closed) indices.push(a, a + 1, b, a + 1, b + 1, b);
  }
  return new THREE.BufferGeometry().setIndex(indices)
    .setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    .setAttribute("color", new THREE.Float32BufferAttribute(gradient, 3));
}

function lines(positions: number[], colour: string, width: number, renderOrder: number, colours?: number[]) {
  const geometry = new LineSegmentsGeometry().setPositions(positions);
  if (colours) geometry.setColors(colours);
  const draw = new LineSegments2(geometry, new LineMaterial({color: colour, linewidth: width, vertexColors: !!colours,
    transparent: true, depthWrite: false, toneMapped: false}));
  draw.renderOrder = renderOrder;
  return draw;
}

interface BandRow {at: Place; edges: [Place,Place]; colour: number[]}
type Ends = [BandRow, BandRow];

/** Complement of measured preview spans, stitched to the very same cross sections. Pure. */
export function remainingBand(rows: BandRow[], closed: boolean, spans: Ends[]): BandRow[][] {
  const end = closed ? rows.length : rows.length - 1;
  const lastRow = rows[end % rows.length];
  // Fractional sample indices allow two ends inside one segment of an older, coarser line.
  const station = (p: Place) => {
    let best = Infinity, station = 0;
    for (let i = 0; i < end; i++) {
      const a = rows[i].at, b = rows[(i+1) % rows.length].at;
      const dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2];
      const x = p[0]-a[0], y = p[1]-a[1], z = p[2]-a[2];
      const t = THREE.MathUtils.clamp((dx*x + dy*y + dz*z) / (dx*dx + dy*dy + dz*dz || 1), 0, 1);
      const d = (x-t*dx)**2 + (y-t*dy)**2 + (z-t*dz)**2;
      if (d < best) { best = d; station = i+t; }
    }
    return station;
  };
  const cuts = spans.flatMap(([from,to]) => {
    const a = station(from.at), b = station(to.at);
    if (closed && b < a) return [{a, b:end, from, to:lastRow}, {a:0, b, from:rows[0], to}];
    return a <= b ? [{a,b,from,to}] : [];
  }).sort((first, second) => first.a - second.a);
  const runs: BandRow[][] = [];
  let cursor = 0, left = rows[0];
  const connect = (until: number, right: BandRow) => {
    if (cursor < until)
      runs.push([left, ...rows.slice(Math.floor(cursor)+1, Math.ceil(until)), right]);
  };
  for (const cut of cuts) {
    connect(cut.a, cut.from);
    if (cut.b >= cursor) { cursor = cut.b; left = cut.to; }
  }
  connect(end, lastRow);
  return runs;
}

function bandMarks(rows: BandRow[], closed: boolean, faded: boolean) {
  const edges = rows.map(row => row.edges), colours = rows.map(row => row.colour);
  const centre: number[] = [], gradient: number[] = [], sides: number[] = [];
  for (let i=0; i<rows.length-Number(!closed); i++) {
    const j=(i+1)%rows.length;
    centre.push(...rows[i].at, ...rows[j].at);
    gradient.push(...colours[i], ...colours[j]);
    sides.push(...edges[i][0], ...edges[j][0], ...edges[i][1], ...edges[j][1]);
  }
  const fill = new THREE.Mesh(laneBand(edges, colours, closed), new THREE.MeshBasicMaterial({vertexColors:true,
    transparent:true, opacity:faded ? .2 : .5, depthWrite:false, side:THREE.DoubleSide, forceSinglePass:true, toneMapped:false}));
  fill.renderOrder=7;
  const path=lines(centre,"#ffffff",LINE_PX,8,gradient), limits=lines(sides,EDGE_COLOUR,1,10);
  if (faded) path.material.opacity = limits.material.opacity = .45;
  return [fill, limits, path] as const;
}

/** Speed band on the installed road level. Preview spans replace only their own part of the band. */
export class AiLineDraw {
  private marks: ReturnType<typeof bandMarks>[] = [];
  private pieces: ReturnType<typeof bandMarks>[] = [];
  private rows: BandRow[] = [];
  private locations: Place[] = [];
  private closed = false;
  private faded = false;
  private mask = "";
  private ray = new THREE.Raycaster();
  private shown = false;

  constructor(private scene: THREE.Scene) {
    this.ray.firstHitOnly = true;
    this.ray.params.Line2 = {threshold: 2 * HOVER_PX - LINE_PX};
  }

  show(shown: boolean) {
    this.shown = shown;
    for (const marks of this.marks) for (const mark of marks) mark.visible = shown && !this.mask;
    for (const marks of this.pieces) for (const mark of marks) mark.visible = shown;
  }

  private clear(list: ReturnType<typeof bandMarks>[]) {
    for (const marks of list.splice(0)) for (const mark of marks) {
      this.scene.remove(mark); mark.geometry.dispose(); mark.material.dispose();
    }
  }

  set(lane: InstalledAiLine | null) {
    this.clear(this.marks); this.clear(this.pieces);
    this.mask=""; this.locations=[]; this.rows=[];
    if (!lane) return;
    this.closed=lane.closed;
    this.faded=lane.validity === "pending" || lane.validity === "failed";
    this.locations=Array.from(lane.x, (x,i): Place => [x,lane.y[i]+LIFT_M,lane.z[i]]);
    this.rows=this.locations.map((at,i) => ({at, edges:laneEdges(at,[lane.forwardX[i],lane.forwardZ[i]],
      [lane.normalX[i],lane.normalY[i],lane.normalZ[i]],lane.left[i],lane.right[i]),
      colour:laneSpeedColour(lane.speed[i],lane.speeds.slow,lane.speeds.fast).toArray()}));
    const edges = displayEdges(this.locations, this.rows.map(row => row.edges), this.closed);
    this.rows.forEach((row,i) => { row.edges = edges[i]; });
    const marks=bandMarks(this.rows,this.closed,this.faded);
    speedUpRays(marks[0]);
    this.marks.push(marks); this.scene.add(...marks); this.show(this.shown);
  }

  preview(spans: number[][][], lift: number) {
    if (!this.rows.length) return;
    const key = spans.length ? JSON.stringify(spans) : "";
    if (key === this.mask) return;
    this.mask=key;
    this.clear(this.pieces);
    if (spans.length) {
      const point=(r: number[], i: number): Place => [r[i],r[i+1]+lift,r[i+2]];
      const row=(r: number[]): BandRow => ({at:point(r,0),edges:[point(r,4),point(r,7)],colour:[.2,.8,.4]});
      for (const run of remainingBand(this.rows,this.closed,spans.map(([a,b]) => [row(a),row(b)]))) {
        const marks=bandMarks(run,false,this.faded);
        this.pieces.push(marks); this.scene.add(...marks);
      }
    }
    this.show(this.shown);
  }

  pick(mouse: THREE.Vector2, camera: THREE.PerspectiveCamera, maxDistance = Infinity) {
    if (!this.shown || !this.marks.length) return null;
    const [band,,centre] = this.marks[0];
    this.ray.setFromCamera(mouse, camera);
    const [hit] = this.ray.intersectObject(band, false);
    if (hit?.faceIndex != null && hit.distance <= maxDistance) {
      return nearestSample(this.locations, Math.floor(hit.faceIndex / 2), hit.point);
    }
    return pickLanePoint(this.locations, this.ray.intersectObject(centre, false), maxDistance);
  }
}
