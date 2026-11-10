// Delete's brush: what a stroke of its ring passes over goes, as one change and one Undo.
import type {Removed} from "../state/edits";
import type {Sample} from "../types";

/** How far x, z lies from the segment a to b, in metres along the ground. Pure. */
function fromSegment(x: number, z: number, [ax, az]: Sample, [bx, bz]: Sample) {
  const dx = bx - ax, dz = bz - az, length = dx * dx + dz * dz;
  const t = length ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / length)) : 0;
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
}

/** The objects whose place lies within radius of the stroke's path (samples: where the ring was, in order; a click is one place): measured
    to the line between two places, so a fast drag leaves no gap. Each object once, in the order given. Pure. */
export function alongStroke<T extends Removed>(objects: T[], samples: Sample[], radius: number) {
  if (!samples.length) return [];
  return objects.filter(({position: [x, , z]}) => samples.some((s, i) => fromSegment(x, z, samples[Math.max(0, i - 1)], s) <= radius));
}
