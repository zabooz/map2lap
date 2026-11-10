// The ground under a brush's ring, cheaply: nine points looked up across it, the heights between them interpolated. The Groups ring's
// preview stands its plants on it, so a slope shows as one, without a look at the ground under each plant. Where it fails: a ditch or a
// kerb between two points is not seen, so a plant there floats or sinks a little until the click sets it on its own ground.

/** The 3 × 3 points as steps of the grid from the ring's middle, west to east within north to south: [u, v], each -1, 0 or 1. */
export const GRID_POINTS: [number, number][] = [-1, 0, 1].flatMap(v => [-1, 0, 1].map(u => [u, v] as [number, number]));

/** The ground's height at any x, z from heights at GRID_POINTS (null: no ground there, then fallback, the ring's own height) round
    cx, cz, step metres apart: bilinear between the four around it, the outer points' height beyond them. Pure. */
export function gridHeight(heights: (number | null)[], cx: number, cz: number, step: number, fallback: number) {
  const h = heights.map(y => y ?? fallback), at = (u: number, v: number) => h[(v + 1) * 3 + u + 1];
  return (x: number, z: number) => {
    const u = Math.max(-1, Math.min(1, (x - cx) / step)), v = Math.max(-1, Math.min(1, (z - cz) / step));
    const u0 = u < 0 ? -1 : 0, v0 = v < 0 ? -1 : 0, fu = u - u0, fv = v - v0;
    return at(u0, v0) * (1 - fu) * (1 - fv) + at(u0 + 1, v0) * fu * (1 - fv) + at(u0, v0 + 1) * (1 - fu) * fv + at(u0 + 1, v0 + 1) * fu * fv;
  };
}
