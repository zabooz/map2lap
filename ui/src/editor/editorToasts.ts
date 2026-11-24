import {get, post} from "../api";
import {BRIEF_TOAST_MS, toasts, type Posted} from "../components/toastStore";
import type {EditState} from "./state/edits";
import type {EditorLoadStatus} from "../types";

/** What can go wrong in the Editor outside any window. viewFailed: why the view is behind. copyFailed: a placement the server
    refused, also after Copy ended. saveFailed: why a Save wrote nothing. save, error, outdated: of the draft (EditState). saving: a Save is writing the track.
    waiting: Save or Play was pressed while changes are still on their way, how many, and whether AC starts after. */
export interface EditorProblems {
  viewFailed: string | null;
  copyFailed: string | null;
  groupFailed?: string | null;
  saveFailed: string | null;
  save: EditState["save"];
  error: string | null;
  outdated: number;
  saving?: boolean;
  waiting?: {changes: number; play: boolean} | null;
  refused?: {message: string; n: number} | null;
}

/** A toast with what makes it the same one: dismissed, it stays away until its text changes. */
export type EditorToast = Posted & {key: string};

/** The Editor's problems as toasts, those in dismissed (by key) left out. Pure. */
export function editorToasts(p: EditorProblems, dismissed: ReadonlySet<string>,
  actions: {reopen: () => void; readAgain: () => void; giveUp: () => void}): EditorToast[] {
  const w = p.waiting, changes = w && (w.changes === 1 ? "1 change still on its way" : `${w.changes} changes still on their way`);
  const all: (Omit<EditorToast, "key"> | false)[] = [
    // (a Save or Play waits for the strokes still being placed: the click shows at once what it waits for, in the place Saving then takes)
    !!w && {id: "edit-saving", tone: "info", title: w.play ? "Play" : "Saving track", dismissible: false, progress: {value: null, label: "Waiting"},
      message: w.play ? `Waiting for ${changes}, then the track is saved and Assetto Corsa starts …` : `Waiting for ${changes}, then the track is written …`},
    !w && !!p.saving && {id: "edit-saving", tone: "info", title: "Saving track", message: "Writing the track for Assetto Corsa …",
      progress: {value: null, label: "Saving track"}, dismissible: false},
    !!p.viewFailed && {id: "edit-view-failed", tone: "warning", title: "The view doesn't show the last change",
      message: `Your changes are kept. ${p.viewFailed}`, action: {label: "Load again", run: actions.reopen}},
    !!p.copyFailed && {id: "edit-copy-failed", tone: "error", title: "Copy failed", message: p.copyFailed},
    !!p.groupFailed && {id: "edit-group-failed", tone: "error", title: "Group placement failed", message: p.groupFailed},
    !!p.saveFailed && {id: "edit-made", tone: "error", title: "Not saved", message: p.saveFailed},
    p.save === "failed" && {id: "edit-kept", tone: "warning", title: "Changes not kept: trying again"},
    p.save === "stuck" && {id: "edit-stuck", tone: "error", title: "Changes not kept", message: `${p.error ?? ""} Reading the track's changes again …`},
    !!p.refused && {id: `edit-refused-${p.refused.n}`, tone: "error", title: "Change taken back", message: p.refused.message},
    p.outdated > 0 && {id: "edit-outdated", tone: "warning",
      title: `${p.outdated} older ${p.outdated === 1 ? "change" : "changes"} not applied`,
      message: `${p.outdated === 1 ? "It belongs" : "They belong"} to an earlier build of this track.`, action: {label: "Give up", run: actions.giveUp}},
  ];
  return all.filter(t => t !== false).map(t => ({...t, key: `${t.id}:${t.title}:${t.message ?? ""}`}))
    .filter(t => !dismissed.has(t.key));
}

/** What a track's loading shows: its bar while it loads, with why a first opening takes longer (the sections for selecting
    are computed once, then read); a failure or the memory limit stays to be read. Null when there is nothing to say. Pure. */
export function loadingToast(status: EditorLoadStatus): Posted | null {
  if (status.failed) return {id: "edit-load-failed", tone: "error", title: "Could not load this track", message: status.failed};
  if (status.limited) return {id: "edit-limited", tone: "warning", title: "Memory limit reached", message: status.text};
  if (status.progress === undefined) return null;
  return {id: "edit-loading", tone: "info", title: "Loading track", message: status.text, dismissible: false,
    progress: {value: status.progress, label: "Loading track"},
    ...(status.first ? {detail: "First opening of this track: Map2Lap computes its sections for selecting once. Next time it opens faster."} : {})};
}

/** The line update belongs to the saved folder, including while Save as opens its copy. */
const updates = new Map<string, {working: boolean; revision: number}>();
const idle = {working: false, revision: 0};
const listeners = new Set<() => void>();
export const subscribeAiUpdates = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export const aiUpdate = (name: string) => updates.get(name) ?? idle;

export function aiLineError(name: string, message: string) {
  const id = `edit-ai-line-${name}`;
  toasts.post({id, tone:"error", title:"AI line calculation failed", message, onDismiss:() => toasts.remove(id)});
}

export async function updateAiLine(name: string, retry: boolean, inputs?: string) {
  const state = {working: true, revision: aiUpdate(name).revision};
  const id = `edit-ai-line-${name}`, url = `/api/editor/${encodeURIComponent(name)}/ai-line`;
  const notify = () => listeners.forEach(listener => listener());
  const progress = (phase: string) => toasts.post({id, tone:"info", title:"Calculating AI line …",
    message: phase === "Calculating AI line …" ? undefined : phase,
    dismissible:false, progress:{value:null, label:phase}});
  updates.set(name, state);
  notify();
  progress("Checking AI line inputs …");
  let timer: ReturnType<typeof setTimeout> | undefined;
  async function poll() {
    const result = await get<{phase?: string}>(url + "/progress");
    if (updates.get(name) !== state) return;
    if (result?.phase) progress(result.phase);
    timer = setTimeout(poll, 350);
  }
  void poll();
  const result = await post<{status: string; message: string}>(url + "/recalculate", {retry, inputs});
  clearTimeout(timer);
  if (updates.get(name) !== state) return;
  updates.set(name, {working:false, revision:state.revision + 1});
  notify();
  if (result.status === "superseded") { toasts.remove(id); return; }
  if (result.error) { aiLineError(name, result.error); return; }
  const deferred = result.status === "deferred";
  toasts.post({id, tone:deferred ? "info" : "success",
    duration:deferred ? undefined : BRIEF_TOAST_MS, title:deferred ? "AI line update deferred" : "AI line updated",
    message:result.message, onDismiss:() => toasts.remove(id)});
}
