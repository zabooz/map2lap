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
