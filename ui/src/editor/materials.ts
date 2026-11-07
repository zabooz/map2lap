import type * as THREE from "three";

/** Connected faces of one loaded material mesh. Equal positions connect duplicated kn5 vertices; object ownership stays separate. */
export class MaterialRegions {
  private groups: number[];
  private owners: (string | null)[];
  private byGroup = new Map<number, number[]>();

  constructor(position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, indices: Uint16Array,
              pieces: {from: number; end: number; id: string}[]) {
    const count = Math.floor(indices.length / 3), parent = Array.from({length: count}, (_, k) => k);
    this.owners = Array<string | null>(count).fill(null);
    for (const piece of pieces) for (let f = piece.from; f < Math.min(count, piece.end); f++) this.owners[f] = piece.id;
    const vertices = new Map<string, number>(), numbers = new Int32Array(position.count);
    for (let k = 0; k < position.count; k++) {
      const key = `${position.getX(k)},${position.getY(k)},${position.getZ(k)}`;
      let number = vertices.get(key);
      if (number === undefined) { number = vertices.size; vertices.set(key, number); }
      numbers[k] = number;
    }
    const root = (i: number) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const edges = new Map<string, number>();
    for (let face = 0; face < count; face++) {
      const corner = [numbers[indices[face * 3]], numbers[indices[face * 3 + 1]], numbers[indices[face * 3 + 2]]];
      for (let k = 0; k < 3; k++) {
        const a = corner[k], b = corner[(k + 1) % 3];
        if (a === b) continue;
        const key = `${this.owners[face] ?? ""}:${Math.min(a,b)}:${Math.max(a,b)}`;
        const previous = edges.get(key);
        if (previous === undefined) edges.set(key, face);
        else parent[root(face)] = root(previous);
      }
    }
    this.groups = parent.map((_, k) => root(k));
    this.groups.forEach((group, face) => {
      if (!this.byGroup.has(group)) this.byGroup.set(group, []);
      this.byGroup.get(group)!.push(face);
    });
  }

  owner(face: number) { return this.owners[face] ?? null; }

  faces(face: number, whole = false): number[] {
    if (!whole) return this.byGroup.get(this.groups[face]) ?? [];
    const owner = this.owner(face);
    return this.owners.flatMap((id, k) => id === owner ? [k] : []);
  }

  facesOfOwner(owner: string | null) { return this.owners.flatMap((id, k) => id === owner ? [k] : []); }
}
