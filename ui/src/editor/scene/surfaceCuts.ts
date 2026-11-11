// Surfaces left out by their triangles, not as objects: the road verge (src/app/tracksurfaces.py). A draft holds them by the mesh's
// name and ranges of its triangles, numbers of the kn5 the view shows. No three.js: the edit list and the view both read it.

/** Triangles of a mesh that go: [first, count] sorted and joined. */
export interface SurfaceCut {
  mesh: string;
  faces: [number, number][];
}

const VERGE = /^nocol_road_edge_dirt_/;     // (tracksurfaces.DELETABLE: a road, a wall or the ground never go this way)

/** Whether a mesh can lose triangles by themselves. Pure. */
export const isVerge = (name: string) => VERGE.test(name);

/** Sorted ranges, touching and overlapping ones as one. Pure. */
function joined(ranges: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [a, n] of [...ranges].sort((x, y) => x[0] - y[0] || x[1] - y[1])) {
    const last = out.at(-1);
    if (last && a <= last[0] + last[1]) last[1] = Math.max(last[1], a + n - last[0]);
    else out.push([a, n]);
  }
  return out;
}

/** earlier and more, one entry per mesh in the order first named, its ranges joined. Pure. */
export function joinedCuts(earlier: SurfaceCut[], more: SurfaceCut[]): SurfaceCut[] {
  const byMesh = new Map<string, [number, number][]>();
  for (const cut of [...earlier, ...more]) byMesh.set(cut.mesh, [...(byMesh.get(cut.mesh) ?? []), ...cut.faces]);
  return [...byMesh].map(([mesh, faces]) => ({mesh, faces: joined(faces)}));
}

/** A selection's triangles (mesh number, triangle numbers) as cuts, by the meshes' names; null unless all of it is verge. Pure. */
export function cutsOf(meshes: {mesh: number; faces: number[]}[], names: Map<number, string>): SurfaceCut[] | null {
  if (!meshes.length || meshes.some(m => !isVerge(names.get(m.mesh) ?? ""))) return null;
  return joinedCuts([], meshes.map(m => ({mesh: names.get(m.mesh)!, faces: m.faces.map(f => [f, 1] as [number, number])})));
}
