import type {Sample} from "../types";

const SAME_PLACE_M = 0.25;          // a sample this near the last one counts as standing there: a long hold on one spot stays one sample
const MOST_SAMPLES = 5000;          // (trackheights.MAX_STROKE_POINTS)

/** A stroke's samples with the ring at x, z for seconds more: on a way from the last place, or standing there, which goes on one sample. Pure but for samples. */
export function addSample(samples: Sample[], x: number, z: number, seconds: number) {
  const last = samples.at(-1)!, before = samples.at(-2);
  if (samples.length >= MOST_SAMPLES) last[2] += seconds;     // (minutes of moving: the rest of its time where it got to)
  else if (Math.hypot(x - last[0], z - last[1]) >= SAME_PLACE_M) samples.push([x, z, seconds]);
  else if (before && before[0] === last[0] && before[1] === last[1]) last[2] += seconds;
  else samples.push([last[0], last[1], seconds]);
}
