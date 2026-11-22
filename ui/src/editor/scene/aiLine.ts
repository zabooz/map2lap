import * as THREE from "three";
import {LineMaterial} from "three/addons/lines/LineMaterial.js";
import {LineSegments2} from "three/addons/lines/LineSegments2.js";
import {LineSegmentsGeometry} from "three/addons/lines/LineSegmentsGeometry.js";
import type {Place} from "../types";
import {speedUpRays} from "./geometry";

/** One sample from the installed-line endpoint, in AC coordinates and units. */
export interface AiLinePoint {
  position: Place;
  distance: number;
  id: number;
  speed: number;
  gas: number;
  brake: number;
  lat_g: number;
  radius: number;
  left: number;
  right: number;
  camber: number;
  direction: number;
  normal: Place;
  segment_length: number;
  forward: Place;
  tag: number;
  grade: number;
}

export interface InstalledAiLine {status: "ready"; closed: boolean; revision: string; points: AiLinePoint[]}
export type AiLineAnswer = InstalledAiLine | {status: "missing" | "invalid"; message: string};
export interface AiLineHover {point: AiLinePoint; metre: number | null}

export const SPEED_COLOURS = ["#ffd35c", "#4ee697", "#39bdff"] as const;
export const BRAKE_COLOUR = "#ff5d98", EDGE_COLOUR = "#eef8ff";
const SPEED_STOPS = SPEED_COLOURS.map(hex => new THREE.Color(hex));
const LIFT_M = 0.3;                 // As with Bank road, clear the road surface and its paint.
const LINE_PX = 2;
const HOVER_PX = 8;                 // Pointer can be a few pixels off the thin centre line.

/** The slow-to-fast colour over this line's speed range, in its native m/s. Pure. */
export function laneSpeedColour(speed: number, slow: number, fast: number) {
  const t = slow < fast ? THREE.MathUtils.clamp((speed - slow) / (fast - slow), 0, 1) * 2 : 1;
  const i = t <= 1 ? 0 : 1;
  return SPEED_STOPS[i].clone().lerp(SPEED_STOPS[i + 1], t - i);
}

export function laneSpeedRange(points: AiLinePoint[]) {
  let slow = Infinity, fast = -Infinity;
  for (const {speed} of points) { slow = Math.min(slow, speed); fast = Math.max(fast, speed); }
  return {slow, fast};
}

/** The stored widths are horizontal distances along up × forward. The road normal gives each side's height. Pure. */
export function laneEdges({position: [x, y, z], forward: [fx, , fz], normal: [nx, ny, nz], left, right}:
  Pick<AiLinePoint, "position" | "forward" | "normal" | "left" | "right">): [Place, Place] {
  const length = Math.hypot(fx, fz);
  if (!length) return [[x, y, z], [x, y, z]];
  const edge = (width: number): Place => {
    const dx = fz / length * width, dz = -fx / length * width;
    return [x + dx, y - (ny ? (nx * dx + nz * dz) / ny : 0), z + dz];
  };
  return [edge(left), edge(-right)];
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

const lifted = ([x, y, z]: Place): Place => [x, y + LIFT_M, z];

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

/** Speed band on the installed road level, with a thin centre line and pink braking marks. */
export class AiLineDraw {
  private marks: (LineSegments2 | THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>)[] = [];
  private band: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> | null = null;
  private centre: LineSegments2 | null = null;
  private locations: Place[] = [];
  private ray = new THREE.Raycaster();

  constructor(private scene: THREE.Scene) {
    this.ray.firstHitOnly = true;
    this.ray.params.Line2 = {threshold: 2 * HOVER_PX - LINE_PX};
  }

  set(lane: InstalledAiLine | null) {
    for (const mark of this.marks) {
      this.scene.remove(mark);
      mark.geometry.dispose();
      mark.material.dispose();
    }
    this.marks = [];
    this.band = null;
    this.centre = null;
    this.locations = [];
    if (!lane) return;

    const {points, closed} = lane, {slow, fast} = laneSpeedRange(points);
    this.locations = points.map(p => lifted(p.position));
    const edges = points.map((p): [Place, Place] => {
      const [left, right] = laneEdges(p);
      return [lifted(left), lifted(right)];
    });
    const colours = points.map(p => laneSpeedColour(p.speed, slow, fast).toArray());
    const centre: number[] = [], gradient: number[] = [], sides: number[] = [], brakes: number[] = [];
    for (let i = 0; i < points.length - (closed ? 0 : 1); i++) {
      const j = (i + 1) % points.length;
      centre.push(...this.locations[i], ...this.locations[j]);
      gradient.push(...colours[i], ...colours[j]);
      sides.push(...edges[i][0], ...edges[j][0], ...edges[i][1], ...edges[j][1]);
      // The recorded brake is for travel from this sample to the next one (fastlane._speed).
      if (points[i].brake > 0) brakes.push(...this.locations[i], ...this.locations[j]);
    }
    this.band = new THREE.Mesh(laneBand(edges, colours, closed), new THREE.MeshBasicMaterial({vertexColors: true,
      transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true, toneMapped: false}));
    this.band.renderOrder = 7;
    speedUpRays(this.band);     // The strip's two faces per segment keep their order for hover.
    this.centre = lines(centre, "#ffffff", LINE_PX, 10, gradient);
    this.marks = [this.band, lines(sides, EDGE_COLOUR, 1, 8), this.centre];
    if (brakes.length) this.marks.push(lines(brakes, BRAKE_COLOUR, 8, 9));
    this.scene.add(...this.marks);
  }

  pick(mouse: THREE.Vector2, camera: THREE.PerspectiveCamera, maxDistance = Infinity) {
    if (!this.band || !this.centre) return null;
    this.ray.setFromCamera(mouse, camera);
    const [hit] = this.ray.intersectObject(this.band, false);
    if (hit?.faceIndex != null && hit.distance <= maxDistance) {
      return nearestSample(this.locations, Math.floor(hit.faceIndex / 2), hit.point);
    }
    return pickLanePoint(this.locations, this.ray.intersectObject(this.centre, false), maxDistance);
  }
}
