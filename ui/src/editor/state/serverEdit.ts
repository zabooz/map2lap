// One server-made change into the draft, in turn with Undo and Save. Shared only where the flow is the same: the server prepares
// a change against the kept draft and the answer is put as it is (wall settings, tree spacing and car density, Smooth road's and
// Bend road's replaceable height operations). Copy, Insert and Groups keep their own flows: their placement ghosts and rejections
// differ; texture paint waits for its textures within the turn.
import type {TrackEdits} from "./edits";

/** applied: put and kept. cancelled: no longer wanted (a newer request, Esc), nothing put. refused: nothing put, the draft is
    unchanged by this call, message says why. unkept: put, but the draft's save then failed or was refused: TrackEdits retries or
    takes it back by itself, so the draft may or may not still hold it; the caller undoes what it showed (a preview, a ghost). */
export type ServerEditResult<A> = {state: "applied"; answer: A} | {state: "cancelled"} | {state: "refused"; message: string}
  | {state: "unkept"; answer: A; message: string};

export interface ServerEditSteps<A> {
  ask: (base: string, revision: number) => Promise<A & {error?: string}>;
  /** The answer put into the draft: true. false, or why as text: nothing was put (the draft no longer fits it, the answer lacks
      what was asked for); false says `failure`. revision: the kept draft's it was asked against. */
  put: (answer: A, revision: number) => boolean | string;
  /** false once a newer request or the tool's clear() took over; checked before asking and before putting. */
  wanted?: () => boolean;
  failure: string;            // the message for a refusal without a reason
  unsaved?: string;           // the message when the changes before it could not be kept first
  unkept?: string;            // the message when the change was put but could not be kept
}

/** Within edits' turn: the changes before kept first, then ask(base, revision), then put(answer), then that change kept.
    The result is settled inside the turn (inTurn swallows errors), so the promise always resolves to it. */
export async function serverEdit<A>(edits: TrackEdits, steps: ServerEditSteps<A>): Promise<ServerEditResult<A>> {
  const {ask, put, wanted = () => true, failure} = steps;
  let result: ServerEditResult<A> = {state: "cancelled"};
  await edits.inTurn(async () => {
    try {
      result = await asked(edits, steps, ask, put, wanted, failure);
    } catch (error) {
      result = wanted() ? {state: "refused", message: error instanceof Error ? error.message : failure} : {state: "cancelled"};
    }
  });
  return result;
}

async function asked<A>(edits: TrackEdits, steps: ServerEditSteps<A>, ask: ServerEditSteps<A>["ask"], put: ServerEditSteps<A>["put"],
                        wanted: () => boolean, failure: string): Promise<ServerEditResult<A>> {
  const unsaved = steps.unsaved ?? "The current changes could not be kept.";
  if (!edits.canEdit()) return {state: "refused", message: unsaved};
  edits.saveNow();
  const revision = await edits.saved(), base = edits.boundRevision();
  if (!wanted()) return {state: "cancelled"};
  if (revision === null || !base || !edits.canEdit()) return {state: "refused", message: unsaved};
  const answer = await ask(base, revision);
  if (!wanted()) return {state: "cancelled"};
  if (answer.error) return {state: "refused", message: answer.error};
  const done = put(answer, revision);
  if (done !== true) return {state: "refused", message: done || failure};
  edits.saveNow();
  if (await edits.saved() === null) return {state: "unkept", answer, message: steps.unkept ?? edits.state().error ?? failure};
  return {state: "applied", answer};
}
