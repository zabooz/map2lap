import * as THREE from "three";
import {acceleratedRaycast, MeshBVH, type SerializedBVH} from "three-mesh-bvh";
import type {MeshInfo, TrackIndex} from "../types";

export const FLOATS_PER_VERTEX = 11;

/** What a MeshBVH holds itself (estimateMemoryInBytes walks on into its geometry, counted already: 3.2 GB too much on a 300 km track). */
export function bvhBytes(tree: MeshBVH) {
  const {roots, indirectBuffer} = MeshBVH.serialize(tree, {cloneBuffers: false});
  return roots.reduce((bytes, root) => bytes + root.byteLength, indirectBuffer?.byteLength ?? 0);
}

/** A ground mesh made quick to hit: the ground holds most of a track's triangles (Heiligenblut: 5.3 of 6.5 million), a ray
    otherwise reads all of each tile it meets. indirect: the triangles keep their order and numbers. Its bytes. */
export function speedUpRays(mesh: THREE.Mesh, prepared?: SerializedBVH) {
  const started = performance.now();
  const tree = prepared ? MeshBVH.deserialize(prepared, mesh.geometry, {setIndex: false}) : new MeshBVH(mesh.geometry, {indirect: true});
  const bytes = bvhBytes(tree);
  mesh.geometry.boundsTree = tree;
  mesh.raycast = acceleratedRaycast;
  performance.measure("map2lap.bvh", {start: started, detail: bytes});
  return bytes;
}

export const meshBytes = (m: MeshInfo) => m.vertices * FLOATS_PER_VERTEX * 4 + 4 + m.indices * 2;

/** Reject truncated geometry and invalid triangle indices before passing its arrays to Rust. Pure. */
export function validateMesh(info: MeshInfo, buffer: ArrayBuffer) {
  const {vertices, indices} = info;
  if (!Number.isInteger(vertices) || vertices < 0 || vertices > 65535 || !Number.isInteger(indices) || indices < 0 || indices % 3
      || buffer.byteLength !== meshBytes(info)) throw new Error("Invalid track geometry");
  const offset = vertices * FLOATS_PER_VERTEX * 4;
  if (new DataView(buffer).getUint32(offset, true) !== indices || new Uint16Array(buffer, offset + 4, indices).some(i => i >= vertices))
    throw new Error("Invalid track triangle indices");
}

/** Generated mesh numbers are bound to their model draft or copy layout; source mesh numbers follow the KN5. Pure. */
export function meshUrl(name: string, data: TrackIndex, info: MeshInfo) {
  return `/api/editor/${encodeURIComponent(name)}/mesh/${info.i}?r=${data.revision}`
    + (info.model ? `&d=${data.draft ?? 0}` : info.copy ? `&c=${data.copy_revision ?? ""}` : "");
}

/** How far from centre a sphere has to reach to hold a box: to its farthest corner, not only to its two named ones. Pure. */
export function reachOfBox(centre: readonly number[], low: readonly number[], high: readonly number[]) {
  return Math.hypot(...centre.map((c, axis) => Math.max(Math.abs(low[axis] - c), Math.abs(high[axis] - c))));
}

/** The geometry's sphere from its box, around the centre the file says, never smaller than the file says: a height change can move a mesh past it. */
export function fitSphere(g: THREE.BufferGeometry, info: MeshInfo) {
  g.computeBoundingBox();
  const box = g.boundingBox!;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(...info.center),
                                      Math.max(info.radius, reachOfBox(info.center, box.min.toArray(), box.max.toArray())));
}

export function makeGeometry(info: MeshInfo, buf: ArrayBuffer) {
  const g = new THREE.BufferGeometry();
  const v = new THREE.InterleavedBuffer(new Float32Array(buf, 0, info.vertices * FLOATS_PER_VERTEX), FLOATS_PER_VERTEX);
  g.setAttribute("position", new THREE.InterleavedBufferAttribute(v, 3, 0));
  g.setAttribute("normal", new THREE.InterleavedBufferAttribute(v, 3, 3));
  g.setAttribute("uv", new THREE.InterleavedBufferAttribute(v, 2, 6));
  const skip = info.vertices * FLOATS_PER_VERTEX * 4 + 4;
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, skip, info.indices), 1));
  // (a ray then skips most meshes without looking at their triangles: a ground query from about 4.5 to 2.8 ms; the sphere
  // alone lets through every tile a long ray passes near)
  fitSphere(g, info);
  return g;
}
