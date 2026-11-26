import * as THREE from "three";
import type {Place} from "../types";
import {displayEdges, EDGE_COLOUR, laneBand} from "./aiLine";

export const previewColour = (yellow: number) => new THREE.Color(yellow ? 0xffd23b : 0x51de94);
// Draw above the installed band and road paint, including on banked pavement.
export const PREVIEW_LIFT = .38;

/** One connected, measured stroke. Coordinates already include the road cross slope. */
export function previewBand(rows: number[][]) {
  const centres: Place[] = rows.map(p => [p[0],p[1],p[2]]);
  const edges = displayEdges(centres, rows.map(p => [
    [p[4], p[5], p[6]], [p[7], p[8], p[9]],
  ]), false);
  const ends = [0, rows.length-1].map(i => [...rows[i].slice(0,4), ...edges[i][0], ...edges[i][1]]);
  for (const pair of edges) for (const edge of pair) edge[1] += PREVIEW_LIFT;
  const fill = new THREE.Mesh(laneBand(edges, rows.map(p => previewColour(p[3]).toArray()), false),
    new THREE.MeshBasicMaterial({vertexColors:true, transparent:true, opacity:.5, depthWrite:false,
      side:THREE.DoubleSide, forceSinglePass:true, toneMapped:false}));
  const limits: number[] = [];
  for (let i=1; i<edges.length; i++)
    limits.push(...edges[i-1][0], ...edges[i][0], ...edges[i-1][1], ...edges[i][1]);
  const outline = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position",
    new THREE.Float32BufferAttribute(limits,3)),new THREE.LineBasicMaterial({color:EDGE_COLOUR, depthWrite:false}));
  fill.renderOrder=11; outline.renderOrder=12;
  fill.add(outline);
  return Object.assign(fill, {ends});
}

export function disposeStroke(root: THREE.Object3D) {
  root.removeFromParent();
  root.traverse(object => {
    if (object instanceof THREE.Line || object instanceof THREE.Mesh || object instanceof THREE.Points) {
      object.geometry.dispose(); object.material.dispose();
    }
  });
}

/** At most one preview request in flight. Pointer events replace the pending position. */
export class PreviewQueue {
  private pending?: () => Promise<void>;
  private busy = false;
  put(work: () => Promise<void>) {
    this.pending = work;
    if (!this.busy) void this.run();
  }
  clear() { this.pending = undefined; }
  private async run() {
    this.busy = true;
    try {
      while (this.pending) {
        const work = this.pending;
        this.pending = undefined;
        await work();
      }
    } finally { this.busy = false; }
  }
}
