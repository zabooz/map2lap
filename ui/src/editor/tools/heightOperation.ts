// A tool's one replaceable height operation (Smooth road, Bend road): each adjustment asks the server against the draft without it
// and replaces it in the same Undo step; returning to nothing removes it. Banking-like tools that tune one road edit reuse this.
import type {HeightChange, TrackEdits} from "../state/edits";
import {serverEdit} from "../state/serverEdit";

/** same: settings and draft as last time, nothing asked. undone: the operation left the draft (Undo), the session starts over.
    cancelled: a newer adjustment or cancel() took over. applied: the answer's height replaced it. removed: no height is held now
    (had: one was taken out). error: nothing changed, message says why. */
export type HeightResult<A> = {state: "same" | "undone" | "cancelled"} | {state: "applied"; answer: A} | {state: "removed"; had: boolean}
  | {state: "error"; message: string};

/** What is said when the changes before could not be kept first, when the server's answer has no height, when the draft no
    longer holds the operation as it was, when the change could not be kept, and for any other failure. */
export interface HeightText {unsaved: string; missing: string; changed: string; unkept: string; failure: string}

export class HeightOperation {
  private epoch = 0;
  private owned: string[] = [];
  private joined = false;            // the next replacement joins the current Undo step (false: it makes a new one)
  private key: string | null = null;
  constructor(private edits: TrackEdits) {}

  cancel() { this.epoch++; }
  reset() { this.cancel(); this.owned = []; this.joined = false; this.key = null; }
  /** An existing operation taken over (a marked road's saved bend): the next adjustment replaces it as a new Undo step. */
  adopt(ids: string[]) { this.cancel(); this.owned = [...ids]; this.joined = false; this.key = null; }

  private lost() { return this.owned.some(id => !this.edits.state().heights.some(h => h.id === id)); }
  private keyOf(settings: unknown) {
    const owned = new Set(this.owned);
    return JSON.stringify([settings, this.edits.state().heights.filter(h => !owned.has(h.id)).map(h => h.id)]);
  }
  /** Whether settings were applied to the draft as it is. */
  isCurrent(settings: unknown) { return this.keyOf(settings) === this.key; }

  /** The operation for settings: ask(base, revision, replace) makes its height, null removes it. */
  async apply<A extends {height?: HeightChange}>(settings: unknown, ask: ((base: string, revision: number, replace: string[]) => Promise<A & {error?: string}>) | null,
                                                 text: HeightText): Promise<HeightResult<A>> {
    if (this.lost()) { this.reset(); return {state: "undone"}; }
    const key = this.keyOf(settings);
    if (key === this.key) return {state: "same"};
    const epoch = ++this.epoch, had = this.owned.length > 0;
    let undone = false;
    const result = await serverEdit<A>(this.edits, {
      wanted: () => epoch === this.epoch,
      ask: async (base, revision) => {
        // (an Undo while earlier changes were kept: the operation is gone, its replacement would bring it back)
        if (this.lost()) { this.reset(); undone = true; return {} as A; }
        return ask ? ask(base, revision, this.owned) : {} as A;
      },
      put: answer => {
        if (ask && !answer.height) return text.missing;
        if ((answer.height || this.owned.length) && !this.edits.replaceHeight(this.owned, answer.height ?? null, this.joined)) return text.changed;
        this.owned = answer.height ? [answer.height.id] : [];
        // (after a removal the next height is a new step: joining it would fold it into an earlier, unrelated change)
        this.joined = !!answer.height;
        this.key = key;
        return true;
      },
      failure: text.failure, unsaved: text.unsaved, unkept: text.unkept,
    });
    if (undone) return {state: "undone"};
    if (result.state === "cancelled") return {state: "cancelled"};
    if (result.state !== "applied") return {state: "error", message: result.message};
    return result.answer.height ? {state: "applied", answer: result.answer} : {state: "removed", had};
  }
}
