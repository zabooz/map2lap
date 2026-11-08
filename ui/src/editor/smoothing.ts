import type {HeightChange, TrackEdits} from "./edits";
import type {Pin} from "./pins";
import type {SurfaceSelection} from "./surfaces";

export const INITIAL_SMOOTH_STRENGTH = 0;
export interface SmoothRequest {base: string; revision: number; points: Pin[]; blend: number; strength: number; network: true; replace?: string}
interface Answer {height?: HeightChange; standing?: number; error?: string; influence?: SurfaceSelection}
interface Result {state: "unchanged" | "applied" | "cancelled" | "undone" | "error"; message?: string; influence?: SurfaceSelection | null}

/** One active road range. New settings replace its height delta, always calculated from before that delta. */
export class SmoothSession {
  private epoch = 0;
  private owned: string | null = null;
  private joined = false;
  private key: string | null = null;
  constructor(private edits: TrackEdits, private request: (body: SmoothRequest) => Promise<Answer>) {}

  cancel() { this.epoch++; }
  reset() { this.cancel(); this.owned = null; this.joined = false; this.key = null; }

  async update(points: Pin[], blend: number, strength: number): Promise<Result> {
    const state = this.edits.state();
    if (this.owned && !state.heights.some(h => h.id === this.owned)) {
      this.reset();
      return {state: "undone"};
    }
    const key = JSON.stringify([points, blend, strength, state.heights.filter(h => h.id !== this.owned).map(h => h.id), state.placed, state.copies]);
    if (key === this.key) return {state: "unchanged"};
    const epoch = ++this.epoch;
    let result: Result = {state: "cancelled"};
    await this.edits.inTurn(async () => {
      try {
        this.edits.saveNow();
        const revision = await this.edits.saved(), base = this.edits.boundRevision();
        if (epoch !== this.epoch) return;
        if (revision === null || !base || !this.edits.canEdit()) throw new Error("The current changes could not be kept");
        if (this.owned && !this.edits.state().heights.some(h => h.id === this.owned)) {
          this.reset(); result = {state: "undone"}; return;
        }
        if (strength === 0 && !this.owned) { this.key = key; result = {state: "unchanged"}; return; }
        const answer: Answer = strength === 0 ? {} : await this.request({base, revision, points, blend, strength: strength / 100, network: true, replace: this.owned ?? undefined});
        if (epoch !== this.epoch) return;
        if (answer.error || strength > 0 && !answer.height) throw new Error(answer.error ?? "The road could not be smoothed");
        if (!this.edits.replaceHeight(this.owned, answer.height ?? null, this.joined)) throw new Error("The smoothing operation changed; mark the road again");
        this.owned = answer.height?.id ?? null;
        this.joined = !!answer.height;
        this.key = key;
        this.edits.saveNow();
        if (await this.edits.saved() === null) throw new Error("The smoothing change could not be kept");
        result = {state: "applied", influence: answer.influence ?? null,
          message: answer.standing ? `${answer.standing} objects at the edge stayed where they are: their places lie outside.` : undefined};
      } catch (error) {
        if (epoch === this.epoch) result = {state: "error", message: error instanceof Error ? error.message : "Could not smooth this road"};
      }
    });
    return result;
  }
}
