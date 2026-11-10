import type {Sample} from "../types";
import {MIN_SCALE, MAX_SCALE} from "./placing";

export interface GroupEntry {model: string; weight: number; minScale: number; maxScale: number}
export interface ObjectGroup {id: string; name: string; entries: GroupEntry[]}
export interface ScatterOptions {entries: GroupEntry[]; radius: number; spacing: number; density: number; seed: number}
export interface Scattered {model: string; x: number; z: number; turn: number; scale: number}
export type ScatterResult = Scattered[] & {limited?: boolean};
// A stroke stays one bounded draft request. Dense grass fields need repeated strokes, not an unbounded UI allocation.
export const MAX_SCATTER = 2000;
const MAX_ATTEMPTS = MAX_SCATTER * 10;

/** Frozen random values from a stroke seed; independent of frame rate and wall time. Pure but for its local counter. */
function random(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/** Even centres along the stroke's path; holds do not add plants and collinear event subdivisions do not change the result. Pure. */
function centres(samples: Sample[], step: number) {
  const out: [number, number][] = [[samples[0][0], samples[0][1]]];
  let carried = 0;
  for (let i = 1; i < samples.length && out.length < MAX_ATTEMPTS; i++) {
    const [ax, az] = samples[i - 1], [bx, bz] = samples[i], length = Math.hypot(bx - ax, bz - az);
    if (!length) continue;
    let d = step - carried;
    for (; d <= length && out.length < MAX_ATTEMPTS; d += step) out.push([ax + (bx - ax) * d / length, az + (bz - az) * d / length]);
    carried = length - (d - step);
  }
  return out;
}

/** Scatter a weighted mixture in ground X/Z metres, respecting earlier plants through a spatial hash. Pure. */
export function scatter(samples: Sample[], options: ScatterOptions, existing: {x: number; z: number}[] = []): ScatterResult {
  const {radius, spacing, density, entries, seed} = options;
  if (!Number.isFinite(radius) || radius < .5 || radius > 500 || !Number.isFinite(spacing) || spacing < .1 || spacing > 100
    || !Number.isFinite(density) || density <= 0 || density > 1000 || !Number.isInteger(seed)
    || !entries.length || entries.length > 32 || entries.some(e => !e.model || !Number.isFinite(e.weight) || e.weight < 0 || e.weight > 1000
      || !Number.isFinite(e.minScale) || !Number.isFinite(e.maxScale) || e.minScale < MIN_SCALE || e.maxScale > MAX_SCALE || e.minScale > e.maxScale)
    || entries.reduce((n, e) => n + e.weight, 0) <= 0) throw new Error("Choose a valid mixture, radius, density and spacing.");
  const out: ScatterResult = [];
  if (!samples.length) return out;
  if (samples.length > 5000 || samples.some(s => !Number.isFinite(s[0]) || !Number.isFinite(s[1]))) throw new Error("Invalid brush path.");
  const rng = random(seed), buckets = new Map<string, {x: number; z: number}[]>(), cells = new Set<string>();
  const cell = (x: number) => Math.floor(x / spacing), key = (x: number, z: number) => `${x},${z}`;
  const add = (p: {x: number; z: number}) => { const k = key(cell(p.x), cell(p.z)); const b = buckets.get(k) ?? []; b.push(p); buckets.set(k, b); };
  for (const p of existing) if (Number.isFinite(p.x) && Number.isFinite(p.z)) add(p);
  const total = entries.reduce((n, e) => n + e.weight, 0), path = centres(samples, Math.max(radius * .5, spacing));
  // Independent density trials on a fixed world lattice avoid painting overlaps twice. Random offsets remove the visible grid.
  const grid = Math.sqrt(100 / density), reach = Math.ceil(radius / grid);
  let attempts = 0;
  for (const [cx, cz] of path) {
    for (let ix = Math.floor(cx / grid) - reach; ix <= Math.floor(cx / grid) + reach; ix++) {
      for (let iz = Math.floor(cz / grid) - reach; iz <= Math.floor(cz / grid) + reach; iz++) {
        const k = key(ix, iz); if (cells.has(k)) continue;
        // A candidate outside this stamp may belong to a later one: remember only covered cells.
        const local = random(seed ^ Math.imul(ix, 73856093) ^ Math.imul(iz, 19349663));
        const x = (ix + local()) * grid, z = (iz + local()) * grid;
        if (Math.hypot(x - cx, z - cz) > radius) continue;
        cells.add(k);
        if (++attempts > MAX_ATTEMPTS || out.length >= MAX_SCATTER) { out.limited = true; return out; }
        let clear = true;
        for (let dx = -1; dx <= 1 && clear; dx++) for (let dz = -1; dz <= 1 && clear; dz++)
          if (buckets.get(key(cell(x) + dx, cell(z) + dz))?.some(p => Math.hypot(p.x - x, p.z - z) < spacing)) clear = false;
        if (!clear) continue;
        let choice = rng() * total, entry = entries[entries.length - 1];
        for (const e of entries) { choice -= e.weight; if (choice < 0) { entry = e; break; } }
        const p = {model: entry.model, x, z, turn: rng() * 360 - 180, scale: entry.minScale + rng() * (entry.maxScale - entry.minScale)};
        add(p); out.push(p);
      }
    }
  }
  return out;
}
