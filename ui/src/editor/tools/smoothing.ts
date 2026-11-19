import type {HeightChange, TrackEdits} from "../state/edits";
import type {Pin} from "./pins";
import type {SurfaceSelection} from "../scene/surfaces";
import {HeightOperation, type HeightText} from "./heightOperation";

export const INITIAL_SMOOTH_STRENGTH = 0;
export interface SmoothRequest {base: string; revision: number; points: Pin[]; blend: number; strength: number; network: true; replace?: string; strip?: number}
interface Answer {height?: HeightChange; standing?: number; error?: string; influence?: SurfaceSelection}
interface Result {state: "unchanged" | "applied" | "cancelled" | "undone" | "error"; message?: string; influence?: SurfaceSelection | null}

const TEXT: HeightText = {unsaved: "The current changes could not be kept", missing: "The road could not be smoothed",
  changed: "The smoothing operation changed; mark the road again", unkept: "The smoothing change could not be kept", failure: "Could not smooth this road"};

/** One active road range. New settings replace its height delta, always calculated from before that delta (HeightOperation);
    strength zero asks nothing and removes it. */
export class SmoothSession {
  private operation: HeightOperation;
  constructor(private edits: TrackEdits, private request: (body: SmoothRequest) => Promise<Answer>) {
    this.operation = new HeightOperation(edits);
  }

  cancel() { this.operation.cancel(); }
  reset() { this.operation.reset(); }
  async update(points: Pin[], blend: number, strength: number, strip: number | null = null): Promise<Result> {
    const state = this.edits.state();
    // (moved objects and copies change what the smoothing leaves standing: they are part of what it was asked for)
    const settings = [points, blend, strength, strip, state.placed, state.copies];
    const result = await this.operation.apply<Answer>(settings, strength === 0 ? null : (base, revision, replace) =>
      this.request({base, revision, points, blend, strength: strength / 100, network: true, replace: replace[0], strip: strip ?? undefined}), TEXT);
    switch (result.state) {
      case "same": return {state: "unchanged"};
      case "removed": return result.had ? {state: "applied", influence: null} : {state: "unchanged"};
      case "applied": return {state: "applied", influence: result.answer.influence ?? null,
        message: result.answer.standing ? `${result.answer.standing} objects at the edge stayed where they are: their places lie outside.` : undefined};
      case "error": return {state: "error", message: result.message};
      default: return {state: result.state};
    }
  }
}
