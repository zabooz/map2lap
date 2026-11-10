import type {TrackCost} from "./ModelCost";
import {random, type GroupEntry, type Scattered} from "../tools/scatter";
import {MIN_SCALE, MAX_SCALE} from "../tools/placing";

/** Whether the server takes these objects for a group: 1 to 32, weights 0 to 1000 and one above 0, sizes in the Transform tool's
    range and in order. Pure. */
export function entriesValid(entries: GroupEntry[]) {
  return entries.length > 0 && entries.length <= 32 && entries.some(e => e.weight > 0)
    && entries.every(e => Number.isFinite(e.weight) && e.weight >= 0 && e.weight <= 1000
      && Number.isFinite(e.minScale) && Number.isFinite(e.maxScale) && e.minScale >= MIN_SCALE && e.maxScale <= MAX_SCALE && e.minScale <= e.maxScale);
}

/** Each entry's share of the mixture, 0 to 1, in the entries' order: its weight over all weights. Pure. */
export function groupShares(entries: GroupEntry[]) {
  const total = entries.reduce((n, e) => n + e.weight, 0);
  return entries.map(e => total > 0 ? e.weight / total : 0);
}

/** What the group as it is adds to the track: each object as often as groupCounts says (weight 2 of an oak and 6 of a flower: 8 objects), their
    count, triangles and bytes, each object's bytes with its own collision (models: by id). null until every entry's cost is measured. Pure. */
export function groupCost(entries: GroupEntry[], costs: Record<string, TrackCost>, models: Record<string, {collision: "none" | "mesh"}>) {
  if (!entries.length || !entries.every(e => costs[e.model])) return null;
  const counts = groupCounts(entries);
  return entries.reduce((sum, e, i) => ({objects: sum.objects + counts[i], triangles: sum.triangles + costs[e.model].triangles * counts[i],
    bytes: sum.bytes + costs[e.model].bytes[models[e.model]?.collision ?? "none"] * counts[i]}), {objects: 0, triangles: 0, bytes: 0});
}

// The preview's objects stand apart by their mean width, as dense as a forest's edge can be, at least 0.3 m (a grass tuft). An object not
// measured yet counts 1 m wide. Above 400 objects (a weight in the hundreds) the preview shows a smaller group of the same shares.
const GAP = 1, NARROWEST = .3, MOST = 400;
// The Vogel spiral fills a round patch evenly without rows: each point turns by the golden angle and its radius grows with the root of
// its number; a fifth of the gap's jitter keeps it from looking drawn.
const GOLDEN = Math.PI * (3 - Math.sqrt(5)), JITTER = .2;

/** How often each entry stands in the group as it is: its weight, rounded, at least once while it is above 0. Pure. */
export const groupCounts = (entries: GroupEntry[]) => entries.map(e => e.weight > 0 ? Math.max(1, Math.round(e.weight)) : 0);

/** The group as it is round 0, 0 for its preview, each object as often as groupCounts says: widths each model's width across in metres at
    size 1 (by id), randomPosition scattered round, off in rows. Each object's size and turn as the brush gives them. The same each time. Pure. */
export function patchPlants(entries: GroupEntry[], widths: Record<string, number>, randomPosition: boolean): Scattered[] {
  const counts = groupCounts(entries), total = counts.reduce((n, c) => n + c, 0), shrink = Math.min(1, MOST / Math.max(total, 1));
  const draw = random(1), list: GroupEntry[] = [];
  entries.forEach((e, i) => { for (let k = 0; k < (counts[i] ? Math.max(1, Math.round(counts[i] * shrink)) : 0); k++) list.push(e); });
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(draw() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  if (!list.length) return [];
  const width = list.reduce((n, e) => n + (widths[e.model] ?? 1) * (e.minScale + e.maxScale) / 2, 0) / list.length;
  const gap = Math.max(NARROWEST, width * GAP), columns = Math.ceil(Math.sqrt(list.length)), rows = Math.ceil(list.length / columns);
  return list.map((e, k) => {
    const turn = draw() * 360 - 180, size = draw(), jx = draw() - .5, jz = draw() - .5, random = e.random !== false;
    const angle = k * GOLDEN, reach = gap * .6 * Math.sqrt(k + .5);
    const [x, z] = randomPosition ? [Math.cos(angle) * reach + jx * gap * JITTER, Math.sin(angle) * reach + jz * gap * JITTER]
      : [(k % columns - (columns - 1) / 2) * gap, (Math.floor(k / columns) - (rows - 1) / 2) * gap];
    return {model: e.model, x, z, turn: random ? turn : 0, scale: random ? e.minScale + size * (e.maxScale - e.minScale) : e.minScale};
  });
}
