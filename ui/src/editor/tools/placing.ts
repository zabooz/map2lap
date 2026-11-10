// A single object placed anew (src/app/placement.py): what the draft holds, what a drag or a notch of the wheel makes of it, and what that
// does to the vertices the view shows while the server's answer is on its way. Pure, no three.js.

/** Scaled and turned (degrees, counter-clockwise from above) around its place, then moved by x, y, z metres (AC: east, up, minus north). */
export interface Placement {
  id: string;
  x: number;
  y: number;
  z: number;
  turn: number;
  scale: number;
}

/** A change by hand, around where the object stands now: moved, turned by degrees, scaled by a factor. */
export interface Nudge {
  x: number;
  y: number;
  z: number;
  turn: number;
  scale: number;
}

export const STILL: Nudge = {x: 0, y: 0, z: 0, turn: 0, scale: 1};
const MAX_MOVE_M = 1000, MAX_RAISE_M = 100;      // (placement.py)
export const MIN_SCALE = 0.1, MAX_SCALE = 10;

const clamp = (v: number, least: number, most: number) => Math.min(most, Math.max(least, v));
const rounded = (v: number, digits: number) => Math.round(v * 10 ** digits) / 10 ** digits;

/** An object as it was built. */
export const unplaced = (id: string): Placement => ({id, ...STILL});

/** Whether a placement leaves its object as it was built. */
export const isUnplaced = (p: Placement) => !p.x && !p.y && !p.z && !p.turn && p.scale === 1;

/** p changed by a nudge, within what the draft can hold: the turn between -180 and 180, mm and hundredths of a degree. */
export function nudged(p: Placement, n: Partial<Nudge>): Placement {
  let x = p.x + (n.x ?? 0), z = p.z + (n.z ?? 0);
  const way = Math.hypot(x, z);
  if (way > MAX_MOVE_M) [x, z] = [x * MAX_MOVE_M / way, z * MAX_MOVE_M / way];
  let turn = (p.turn + (n.turn ?? 0)) % 360;
  if (turn > 180) turn -= 360;
  if (turn <= -180) turn += 360;
  return {id: p.id, x: rounded(x, 3), y: rounded(clamp(p.y + (n.y ?? 0), -MAX_RAISE_M, MAX_RAISE_M), 3), z: rounded(z, 3),
          turn: rounded(turn, 2), scale: rounded(clamp(p.scale * (n.scale ?? 1), MIN_SCALE, MAX_SCALE), 4)};
}

/** The nudge that takes an object placed as from to where to places it, around where it stands as from. */
export function between(from: Placement, to: Placement): Nudge {
  return {x: to.x - from.x, y: to.y - from.y, z: to.z - from.z, turn: to.turn - from.turn, scale: to.scale / from.scale};
}

/** The vertices numbers of an interleaved array (stride floats each: place at 0, normal at 3, tangent at 8, as a kn5 vertex) as nudged
    around pivot: read from was (the same vertices, stride floats each, in that order), written into out. */
export function nudgeVertices(was: Float32Array, out: Float32Array, numbers: ArrayLike<number>, stride: number, pivot: readonly number[], n: Nudge) {
  const angle = n.turn * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const [px, py, pz] = pivot;
  for (let k = 0; k < numbers.length; k++) {
    const from = k * stride, to = numbers[k] * stride;
    out.set(was.subarray(from, from + stride), to);
    const x = (was[from] - px) * n.scale, y = (was[from + 1] - py) * n.scale, z = (was[from + 2] - pz) * n.scale;
    out[to] = px + c * x + s * z + n.x;
    out[to + 1] = py + y + n.y;
    out[to + 2] = pz - s * x + c * z + n.z;
    for (const at of [3, 8]) {
      const dx = was[from + at], dz = was[from + at + 2];
      out[to + at] = c * dx + s * dz;
      out[to + at + 2] = -s * dx + c * dz;
    }
  }
}
