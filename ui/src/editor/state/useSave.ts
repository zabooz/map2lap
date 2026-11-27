// Saving goes as in a word processor: the changes are kept in the background by themselves (the draft, shown only when that fails), Save writes the track at once, ▾ asks again
// (in its place or as a new track); Play saves first.
import {useCallback, useState} from "react";
import {post} from "../../api";
import {useToasts} from "../../components/toastStore";
import {aiLineError, aiLineProgress, updateAiLine} from "../editorToasts";
import {usePlay} from "../../hooks/usePlay";
import type {TimedMode} from "../../types";
import {isCurrent, type EditState, type TrackEdits} from "./edits";
import type {TrackView} from "../scene/view";

export const isChanged = (s: EditState) => s.removed.length > 0 || s.objectSorts.length > 0 || s.heights.length > 0
  || s.placed.length > 0 || s.copies.length > 0 || s.paints.length > 0 || (s.models?.length ?? 0) > 0
  || s.surfaces.length > 0 || (s.trees?.length ?? 0) > 0 || (s.walls?.length ?? 0) > 0 || (s.kerbs?.length ?? 0) > 0 || (s.stitches?.length ?? 0) > 0 || (s.aiCorrections?.length ?? 0) > 0 || (s.aiMargins?.length ?? 0) > 0
  || !!s.aiLine || !!s.treeSpacing || !!s.carDensity;
type SaveAction = "save" | "recalculate" | "play";
type SavedLine = {status: string; inputs?: string; message?: string; hints?: {state: string; unplaced: string | null}};

/** Whether this Save action still needs a lane or hint update on the written folder. Pure. */
export function needsAiUpdate(action: SaveAction, line: SavedLine) {
  return action !== "play" && (line.status === "pending" || (action === "recalculate" &&
    (line.status !== "ready" || line.hints?.state === "stale" || line.hints?.unplaced === "recalculate")));
}

/** Never saved here, nothing changed: nothing to save, as a file just opened. Pure. */
const isAsBuilt = (s: EditState) => !isChanged(s) && !s.recipe;
const clock = (at: number) => new Date(at * 1000).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

/** Saving the track name, whose edits have the state now. onSaved: the track is saved as name (a copy: another one). */
export function useSave({name, timedMode, edits, state, view, onSaved, lanePending}: {
  lanePending: boolean; name: string; timedMode?: TimedMode; edits: TrackEdits; state: EditState; view: TrackView; onSaved: (name: string) => void;
}) {
  const [asking, setAsking] = useState<"save" | "recalculate" | null>(null);
  const [saving, setSaving] = useState<{action: SaveAction | null; text: string | null}>({action: null, text: null});
  const [waiting, setWaiting] = useState<SaveAction | null>(null);
  const {starting, choose, choosing, dialog} = usePlay();
  const busy = saving.action !== null;
  const recalculatePhase = waiting === "recalculate" ? "Waiting for pending edits …"
    : asking === "recalculate" ? "Choose where to save the edited track"
    : saving.action === "recalculate" ? "Saving the track before updating the AI line …" : null;
  useToasts(recalculatePhase ? [aiLineProgress("edit-recalculate-save", recalculatePhase)] : []);
  const current = isCurrent(state), asBuilt = isAsBuilt(state);
  const canSave = edits.canEdit() && !busy && (lanePending || (!current && !asBuilt));

  /** The track written as its edits say (trackcopy.save): in its place, or (copyTitle) as a new track the Editor then goes on
      with. The name it was written as, or null. */
  const write = async (copyTitle: string | null, action: SaveAction) => {
    setAsking(null);
    setSaving({action, text: null});
    await edits.settled();
    edits.hold(true);
    edits.saveNow();
    const revision = await edits.saved();
    if (revision === null) {
      edits.hold(false);
      setSaving({action: null, text: "Not saved: the changes could not be kept. Nothing was written."});
      return null;
    }
    const r = await post<{name: string; title: string; aiLine?: SavedLine}>(`/api/editor/${encodeURIComponent(name)}/save`,
                                                       {copy: copyTitle !== null, title: copyTitle, revision});
    edits.hold(false);
    if (r.error || !r.name) {
      setSaving({action: null, text: `Not saved: ${r.error ?? "no answer"}`});
      return null;
    }
    setSaving({action: null, text: null});       // (a copy: the Editor shows it now, its name in the track field)
    if (copyTitle !== null) edits.handOver(r.name);
    else edits.markSaved();
    const line = r.aiLine;
    if (line && needsAiUpdate(action, line))
      void updateAiLine(r.name, action === "recalculate", line.inputs);
    else if (action === "save" && line?.status === "failed" && line.message) aiLineError(r.name, line.message);
    onSaved(r.name);
    return r.name;
  };

  /** Done when the changes on their way are; while there are any, waiting says so (play: AC starts after). */
  const settle = async (action: SaveAction) => {
    if (!edits.state().inTurn) return edits.settled();
    setWaiting(action);
    try { await edits.settled(); } finally { setWaiting(null); }
  };

  return {
    asking: !!asking, canSave, starting, dialog,
    waiting: waiting && waiting !== "recalculate" ? {changes: state.inTurn, play: waiting === "play"} : null,
    busy, recalculating: !!recalculatePhase,
    failed: saving.text,
    savedText: busy ? "Saving …" : current ? `Saved ${clock(state.recipe!.at)}` : asBuilt ? "" : "Not saved",
    canPlay: !starting && !choosing && !busy && !waiting && state.save !== "loading" && (current || asBuilt || canSave),
    /** ▾: it asks, in its place or a new track. */
    saveAs: () => setAsking("save"),
    /** What the Save dialog chose. */
    chosen: async (copyTitle: string | null) => {
      view.focus();
      await write(copyTitle, asking ?? "save");
    },
    cancel: useCallback(() => {
      setAsking(null);
      view.focus();
    }, [view]),
    /** Save: a track never saved here asks once (in its place, or a new track), then it writes at once. After the strokes on their way:
        what it goes by is the list with them in it. */
    save: async (retry = false) => {
      const action = retry ? "recalculate" : "save";
      await settle(action);
      const now = edits.state();
      if (busy) return;
      if (isCurrent(now) || isAsBuilt(now)) {
        if (retry || lanePending) void updateAiLine(name, retry);
        return;
      }
      if (!edits.canEdit()) return;
      if (now.recipe) void write(null, action);
      else setAsking(action);
    },
    /** Play begins writing immediately, including the first in-place Save; its dialog waits for the write before AC starts. */
    drive: async () => {
      const before = edits.state();
      const needsSave = !!before.inTurn || (!isCurrent(before) && !isAsBuilt(before));
      const prepared = needsSave ? (async () => {
        await settle("play");
        const now = edits.state();
        return isCurrent(now) || isAsBuilt(now) ? name : write(null, "play");
      })() : undefined;
      choose(name, timedMode, view.clockHours(), view.weatherOptions(), prepared);
    },
  };
}
