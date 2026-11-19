// Bend road's one replaceable height operation: each adjustment replaces it, calculated from the draft without it.
import type {HeightChange, TrackEdits} from "../state/edits";
import type {Pin} from "./pins";
import {HeightOperation, type HeightText} from "./heightOperation";

export interface Answer {height?: HeightChange; error?: string}
export type BridgeKind = "road" | "rail";

const UNSAVED = "The current changes could not be kept", FAILURE = "Could not change the road height";
const APPLY: HeightText = {unsaved: UNSAVED, missing: "The road height could not be changed", changed: "The crossing edit changed; mark it again",
  unkept: "The crossing edit could not be kept", failure: FAILURE};
const REMOVE: HeightText = {unsaved: UNSAVED, missing: "The road height could not be changed", changed: "The height edit changed; mark A and B again",
  unkept: "The height edit could not be kept", failure: FAILURE};

/** One replaceable crossing correction (HeightOperation); a road at zero height or a railway at its measured gap removes it. */
export class SeparationSession {
  private operation: HeightOperation;
  constructor(edits: TrackEdits, private request: (path: "bend" | "separate", body: object) => Promise<Answer>) {
    this.operation = new HeightOperation(edits);
  }
  cancel() { this.operation.cancel(); }
  clear() { this.operation.reset(); }
  adopt(ids: string[]) { this.operation.adopt(ids); }
  isCurrent(points: Pin[], gap: number, kind: BridgeKind, grade: number) { return this.operation.isCurrent([points, gap, kind, grade]); }

  async apply(points: Pin[], gap: number, kind: BridgeKind, grade: number, minimum: number): Promise<"applied" | "reset" | "undone" | "cancelled" | string> {
    const removing = kind === "road" ? Math.abs(gap) < .0005 : gap <= minimum + .001;
    const result = await this.operation.apply<Answer>([points, gap, kind, grade], removing ? null : (base, revision, replace) => kind === "road"
      ? this.request("bend", {base, revision, points, delta: gap, max_grade_percent: grade, replace})
      : this.request("separate", {base, revision, points, gap, kind, max_grade_percent: grade, upper_percent: 100, replace}), removing ? REMOVE : APPLY);
    switch (result.state) {
      case "same": return "cancelled";
      case "removed": return "reset";
      case "error": return result.message;
      default: return result.state;
    }
  }
}
