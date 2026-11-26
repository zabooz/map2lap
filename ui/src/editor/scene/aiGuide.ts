import type {AiAnchor} from "../state/edits";

export type Row = [number, number, number, number, number, number, number, number, number];
export interface MoveGuide {rows: Row[]; path: number[][]; key: string; origin: number[]; closed: boolean; length: number; tail: Row[]; errors: Record<number,string>}
export interface Checked {ends?: Record<string,number>; ink: Record<string, number[][]>; yellow: number[]; skipped: Record<string, string>; samples: [number, ...number[]][]; centres: Record<string, number>}

export const at = (guide: MoveGuide, metre: number) => {
  let s = guide.closed ? ((metre % guide.length) + guide.length) % guide.length : Math.max(0, metre);
  for (let i = 1; i < guide.path.length; i++) {
    const [x, z] = guide.path[i-1], [dx, dz] = [guide.path[i][0]-x, guide.path[i][1]-z];
    const length = Math.hypot(dx, dz);
    if (s <= length && length) return [x + dx*s/length, z + dz*s/length];
    s -= length;
  }
  return guide.path[guide.path.length-1];
};

/** Identify the road at a guide route metre and driving level, retaining its context for a rebuilt route. Pure. */
export function routeAnchor(guide: MoveGuide, metre: number, level: number): AiAnchor {
  return {metre, level, route: guide.key, origin: guide.origin, context: [-5, 0, 5].map(d => at(guide, metre + d))};
}

/** Distance between route metres s and m along the guide, across the seam on a Circuit. Pure. */
export function routeDistance(s: number, m: number, guide: MoveGuide) {
  if (!guide.closed) return Math.abs(s-m);
  const d = Math.abs(s-m) % guide.length;
  return Math.min(d, guide.length-d);
}
