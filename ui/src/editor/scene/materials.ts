import type {RegionPiece} from "./meshPrepare";

/** Connected face roots prepared by Rust in a worker; coincident objects retain separate ownership. */
export class MaterialRegions {
  private owners: (string | null)[];
  private byGroup = new Map<number, number[]>();

  constructor(private readonly groups: Uint32Array, pieces: RegionPiece[]) {
    this.owners = Array<string | null>(groups.length).fill(null);
    for (const piece of pieces) this.owners.fill(piece.id, piece.from, Math.min(groups.length, piece.end));
    groups.forEach((group, face) => {
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
