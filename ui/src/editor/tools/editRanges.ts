// A tool's own edits that lie along a road between two marks (Bank road's bankings; Bend road can follow): shown while the
// tool is on, picked by a click, checked for overlap before a new one is made. Ranges tell road levels apart: each carries
// its mapped road IDs and its height along the line, so at an overpass a click never picks the road below from the bridge.
import {useEffect} from "react";
import type {TrackView} from "../scene/view";
import type {Place} from "../types";

/** An edit along a road: line [x, y, z] per point (its transitions included), A and B and the transitions as stations
    along it, half the road's width. */
export interface EditRange {id: string; roads: string[]; line: Place[]; a: number; b: number; before: number; after: number; half: number}

const LEVEL_M = 1;          // a click this near a range's height is on its level (builtroad.CLICK_LEVEL_M)
const SHARED_M = 1;         // two ranges on one road overlap where their lines run together over more than this (roadbank)
const AIM_M = 1;            // beyond its edge a click still means the range: a hand's aim

/** Stations of a line's points. Pure. */
function stations(line: Place[]) {
  const out = [0];
  for (let k = 1; k < line.length; k++) out.push(out[k - 1] + Math.hypot(line[k][0] - line[k - 1][0], line[k][2] - line[k - 1][2]));
  return out;
}

/** (station, distance, height of the line there, how far x, z lies past the line's ends) of the nearest point on line. Pure. */
function project(line: Place[], x: number, z: number) {
  const along = stations(line), last = line.length - 2;
  let best = {station: 0, distance: Infinity, y: line[0][1], past: 0};
  for (let k = 0; k <= last; k++) {
    const [ax, ay, az] = line[k], [bx, by, bz] = line[k + 1], vx = bx - ax, vz = bz - az, square = vx * vx + vz * vz || 1e-12;
    const raw = ((x - ax) * vx + (z - az) * vz) / square, t = Math.min(1, Math.max(0, raw)), length = Math.sqrt(square);
    const distance = Math.hypot(ax + t * vx - x, az + t * vz - z);
    const past = k === 0 && raw < 0 ? -raw * length : k === last && raw > 1 ? (raw - 1) * length : 0;
    if (distance < best.distance) best = {station: along[k] + t * (along[k + 1] - along[k]), distance, y: ay + t * (by - ay), past};
  }
  return best;
}

/** The range a click at x, y, z lies on: within its width (and a hand's aim) and on its level; the nearest, else null. Pure. */
export function rangeAt(ranges: EditRange[], x: number, y: number, z: number) {
  let best: EditRange | null = null, nearest = Infinity;
  for (const range of ranges) {
    const at = project(range.line, x, z);
    const on = at.past <= AIM_M && at.distance <= range.half + AIM_M && Math.abs(at.y - y) <= LEVEL_M;      // (not past its ends)
    if (on && at.distance < nearest) { best = range; nearest = at.distance; }
  }
  return best;
}

/** A range on the same mapped road whose line runs together with range's over more than SHARED_M, else null; ignore: ids
    being replaced. The server checks the same (roadbank.overlap); this is the page's warning before it asks. Pure. */
export function overlapping(ranges: EditRange[], range: EditRange, ignore: string[] = []) {
  const along = stations(range.line), length = along[along.length - 1];
  const places: [number, number][] = [];
  for (let s = 0.5; s < length; s += 0.5) {
    const k = Math.max(0, along.findIndex(v => v >= s) - 1), t = (s - along[k]) / ((along[k + 1] - along[k]) || 1);
    places.push([range.line[k][0] + t * (range.line[k + 1][0] - range.line[k][0]), range.line[k][2] + t * (range.line[k + 1][2] - range.line[k][2])]);
  }
  for (const other of ranges) {
    if (ignore.includes(other.id) || !other.roads.some(road => range.roads.includes(road))) continue;
    const shared = places.filter(([x, z]) => project(other.line, x, z).distance < 0.5).length * 0.5;
    if (shared > SHARED_M) return other;
  }
  return null;
}

/** The line cut at stations first and last. Pure. */
function cut(line: Place[], first: number, last: number): Place[] {
  const along = stations(line);
  const at = (s: number): Place => {
    const k = Math.min(line.length - 2, Math.max(0, along.findIndex(v => v >= s) - 1)), t = (s - along[k]) / ((along[k + 1] - along[k]) || 1);
    return [0, 1, 2].map(i => line[k][i] + t * (line[k + 1][i] - line[k][i])) as Place;
  };
  return [at(first), ...line.filter((_p, k) => along[k] > first && along[k] < last), at(last)];
}

/** A range's transition before A, its fully banked stretch and its transition after B, as lines. Pure. */
export function rangeParts(range: EditRange) {
  const along = stations(range.line), length = along[along.length - 1];
  return {before: cut(range.line, 0, range.a), core: cut(range.line, range.a, range.b), after: cut(range.line, range.b, length)};
}

/** A tool's ranges drawn while it is on (picked: the one being changed; fits: false draws its transitions red). */
export function useEditRanges({view, enabled, ranges, picked, fits = true}: {view: TrackView; enabled: boolean; ranges: EditRange[];
  picked: string | null; fits?: boolean}) {
  useEffect(() => {
    if (!enabled) return;
    view.drawRanges(ranges.map(range => ({...rangeParts(range), width: range.half * 2, picked: range.id === picked, fits: range.id !== picked || fits})));
    return () => view.drawRanges([]);
  }, [view, enabled, ranges, picked, fits]);
}
