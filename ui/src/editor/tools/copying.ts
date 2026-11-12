/** One independent copy's source members and their frozen poses; geometry stays on the server. */
export interface ObjectCopy {
  id: string;
  parts: {source: string; parent: number; matrix: number[]}[];
}

export type CopyTemplate = Pick<ObjectCopy, "parts"> | {model: {asset: string; collision: "none" | "mesh"; turn: number; scale: number}}
  | {tree: {model: string; angle: number; size: number; width: number}};     // (a TreeFX tree's: tracktrees.template)

/** Extra turn, ground clearance and size applied to each new copy of the frozen source. */
export interface CopyPose {turn: number; y: number; scale: number}

/** A descriptor's entire content as a comparison key. Pure. */
export const copyKeys = (copies: ObjectCopy[]) => copies.map(c => JSON.stringify(c));
