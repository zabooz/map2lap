// Bank road's one replaceable height operation: each change replaces it, calculated from the draft without it; Restore
// original or X/Delete removes it. 0 % is a banking like any other (the fully banked stretch level across), not a removal.
import type {HeightChange, TrackEdits} from "../state/edits";
import type {Place} from "../types";
import type {EditRange} from "./editRanges";
import type {Pin} from "./pins";
import {HeightOperation, type HeightText} from "./heightOperation";

/** What the server keeps of a banking (roadbank.change_of): its range, values and line, stations along it. A banking of the
    first version kept only target (signed), ramp (its transitions inside the line) and its pins. */
export interface BankFacts {points: Pin[]; banking: number; side: 1 | -1; limit: number; line: [number, number][]; heights: number[];
  a: number; b: number; before: number; after: number; half: number; road_ids: string[]; target?: number; ramp?: number}
export interface BankAnswer {height?: HeightChange & {bank?: BankFacts}; error?: string}

export const MAX_BANKING = 0.2;                         // 20 % (roadbank.MAX_PERCENT)
export const MIN_LIMIT = 0.002, MAX_LIMIT = 0.03;       // the edge-ramp limit's range (roadbank.MIN_EDGE_RAMP, MAX_EDGE_RAMP)
export const DEFAULT_LIMIT = 0.005;                     // roadbank.EDGE_RAMP
const MIN_RAMP_M = 4;                                   // roadbank.MIN_RAMP_M

const UNSAVED = "The current changes could not be kept", FAILURE = "Could not bank the road";
const APPLY: HeightText = {unsaved: UNSAVED, missing: "The road could not be banked", changed: "The banking changed; mark A and B again",
  unkept: "The banking could not be kept", failure: FAILURE};
const REMOVE: HeightText = {...APPLY, changed: "The height edit changed; mark A and B again"};

/** A banking's values to change it with; a first-version one's from its signed target. Pure. */
export function bankValues(bank: BankFacts): {banking: number; side: 1 | -1; limit: number} {
  if (typeof bank.banking === "number") return {banking: bank.banking, side: bank.side, limit: bank.limit ?? DEFAULT_LIMIT};
  const target = bank.target ?? 0;
  return {banking: Math.abs(target), side: target < 0 ? -1 : 1, limit: DEFAULT_LIMIT};
}

/** The draft's bankings as ranges (editRanges): line with its heights, A, B and transitions. A first-version banking had
    its transitions inside its line and kept no heights: its pins' heights, between them along the line. Pure. */
export function bankRanges(heights: HeightChange[]): EditRange[] {
  return heights.flatMap(h => {
    const bank = (h as HeightChange & {bank?: BankFacts}).bank;
    if (!bank?.line || bank.line.length < 2) return [];
    const along = bank.line.reduce<number[]>((out, p, k) => [...out, k ? out[k - 1] + Math.hypot(p[0] - bank.line[k - 1][0], p[1] - bank.line[k - 1][1]) : 0], []);
    const length = along[along.length - 1], legacy = typeof bank.a !== "number";
    const ends = bank.points.map(p => p[2] ?? 0);
    const y = (k: number) => bank.heights?.[k] ?? ends[0] + (ends[ends.length - 1] - ends[0]) * along[k] / (length || 1);
    const ramp = bank.ramp ?? 0;
    return [{id: h.id, roads: bank.road_ids, line: bank.line.map(([x, z], k): Place => [x, y(k), z]), half: bank.half,
      ...(legacy ? {a: ramp, b: length - ramp, before: ramp, after: ramp} : {a: bank.a, b: bank.b, before: bank.before, after: bank.after})}];
  });
}

/** A cross slope in m per m as a percentage. Pure. */
export const percent = (slope: number) => `${(slope * 100).toFixed(1)} %`;
/** A banking within 0 and MAX_BANKING, to a tenth of a percent. Pure. */
export const clampBanking = (value: number) => Math.min(MAX_BANKING, Math.max(0, Math.round(value * 1000) / 1000));
/** An edge-ramp limit within its range, to a tenth of a percent. Pure. */
export const clampLimit = (value: number) => Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.round(value * 1000) / 1000));

/** The page's estimate of one transition (m) for the purple strip while the wheel turns: smoothstep's steepest slope is
    1.5 times the mean, so 1.5 x half x |target - e0| / limit; the server's check on apply replaces it. Pure. */
export const estimateRamp = (e0: number, banking: number, side: 1 | -1, half: number, limit: number) =>
  Math.max(MIN_RAMP_M, Math.ceil(1.5 * half * Math.abs(side * banking - e0) / limit - 1e-9));

/** One replaceable banking (HeightOperation). request(body) asks the server's /bank. */
export class BankSession {
  private operation: HeightOperation;
  private current: string | null = null;      // (the banking of these marks in the draft, if any)
  constructor(edits: TrackEdits, private request: (body: object) => Promise<BankAnswer>) {
    this.operation = new HeightOperation(edits);
  }
  cancel() { this.operation.cancel(); }
  clear() { this.operation.reset(); this.current = null; }
  /** A banking already in the draft, picked to be changed. */
  adopt(ids: string[]) { this.operation.adopt(ids); this.current = ids[0] ?? null; }
  /** The id of this session's banking in the draft, null if none. */
  applied() { return this.current; }
  isCurrent(points: Pin[], banking: number, side: number, limit: number) { return this.operation.isCurrent([points, banking, side, limit]); }

  /** The banking: "applied", "cancelled" (a newer one or cancel() took over), "undone" (Undo took it), or why not. */
  async apply(points: Pin[], banking: number, side: 1 | -1, limit: number) {
    const result = await this.operation.apply<BankAnswer>([points, banking, side, limit],
      (base, revision, replace) => this.request({base, revision, points, banking, side, limit, replace}), APPLY);
    if (result.state === "applied") this.current = result.answer.height?.id ?? null;
    return this.settle(result);
  }

  /** The road as it was built: the banking leaves the draft ("reset"). */
  async restore(points: Pin[]) {
    const result = await this.operation.apply<BankAnswer>([points, null], null, REMOVE);
    if (result.state === "removed") this.current = null;
    return this.settle(result);
  }

  private settle(result: Awaited<ReturnType<HeightOperation["apply"]>>): "applied" | "reset" | "undone" | "cancelled" | string {
    switch (result.state) {
      case "same": return "cancelled";
      case "removed": return "reset";
      case "undone": this.current = null; return "undone";
      case "error": return result.message;
      default: return result.state;
    }
  }
}
