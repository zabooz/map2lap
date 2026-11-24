import * as THREE from "three";
import type {Place} from "../types";
import {EDGE_COLOUR, laneBand} from "./aiLine";

export const previewColour = (yellow: number) => new THREE.Color(yellow ? 0xffd23b : 0x51de94);
// Draw above the installed band and road paint, including on banked pavement.
export const PREVIEW_LIFT = .38;

/** One connected, measured stroke. Coordinates already include the road cross slope. */
export function previewBand(rows: number[][]) {
  const edges: [Place, Place][] = rows.map(p => [
    [p[4], p[5]+PREVIEW_LIFT, p[6]], [p[7], p[8]+PREVIEW_LIFT, p[9]],
  ]);
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
  return fill;
}

export function disposeStroke(root: THREE.Object3D) {
  root.removeFromParent();
  root.traverse(object => {
    if (object instanceof THREE.Line || object instanceof THREE.Mesh) {
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
