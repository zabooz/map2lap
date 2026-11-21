// Saving goes as in a word processor: the changes are kept in the background by themselves (the draft, shown only when that fails), Save writes the track at once, ▾ asks again
// (in its place or as a new track); Play saves first.
import {useCallback, useState} from "react";
import {post} from "../../api";
import {usePlay} from "../../hooks/usePlay";
import type {TimedMode} from "../../types";
import {isCurrent, type EditState, type TrackEdits} from "./edits";
import type {TrackView} from "../scene/view";

export const isChanged = (s: EditState) => s.removed.length > 0 || s.objectSorts.length > 0 || s.heights.length > 0
  || s.placed.length > 0 || s.copies.length > 0 || s.paints.length > 0 || (s.models?.length ?? 0) > 0
  || s.surfaces.length > 0 || (s.trees?.length ?? 0) > 0 || (s.walls?.length ?? 0) > 0 || (s.kerbs?.length ?? 0) > 0 || (s.stitches?.length ?? 0) > 0
  || !!s.treeSpacing || !!s.carDensity;
/** Never saved here, nothing changed: nothing to save, as a file just opened. Pure. */
const isAsBuilt = (s: EditState) => !isChanged(s) && !s.recipe;
const clock = (at: number) => new Date(at * 1000).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

/** Saving the track name, whose edits have the state now. onSaved: the track is saved as name (a copy: another one). */
export function useSave({name, timedMode, edits, state, view, onSaved}: {
  name: string; timedMode?: TimedMode; edits: TrackEdits; state: EditState; view: TrackView; onSaved: (name: string) => void;
}) {
  const [asking, setAsking] = useState(false);
  const [saving, setSaving] = useState<{busy: boolean; text: string | null}>({busy: false, text: null});
  const [waiting, setWaiting] = useState<{play: boolean} | null>(null);   // (Save or Play pressed, changes still on their way)
  const {starting, play, choose, choosing, dialog} = usePlay();
  const current = isCurrent(state), asBuilt = isAsBuilt(state);
  const canSave = edits.canEdit() && !saving.busy && !current && !asBuilt;

  /** The track written as its edits say (trackcopy.save): in its place, or (copyTitle) as a new track the Editor then goes on
      with. The name it was written as, or null. */
  const write = async (copyTitle: string | null = null) => {
    setAsking(false);
    setSaving({busy: true, text: null});
    await edits.settled();
    edits.hold(true);
    edits.saveNow();
    const revision = await edits.saved();
    if (revision === null) {
      edits.hold(false);
      setSaving({busy: false, text: "Not saved: the changes could not be kept. Nothing was written."});
      return null;
    }
    const r = await post<{name: string; title: string}>(`/api/editor/${encodeURIComponent(name)}/save`,
                                                       {copy: copyTitle !== null, title: copyTitle, revision});
    edits.hold(false);
    if (r.error || !r.name) {
      setSaving({busy: false, text: `Not saved: ${r.error ?? "no answer"}`});
      return null;
    }
    setSaving({busy: false, text: null});       // (a copy: the Editor shows it now, its name in the track field)
    if (copyTitle !== null) edits.handOver(r.name);
    else edits.markSaved();
    onSaved(r.name);
    return r.name;
  };

  /** Done when the changes on their way are; while there are any, waiting says so (play: AC starts after). */
  const settle = async (play: boolean) => {
    if (!edits.state().inTurn) return edits.settled();
    setWaiting({play});
    try { await edits.settled(); } finally { setWaiting(null); }
  };

  return {
    asking, canSave, starting, dialog,
    waiting: waiting && {changes: state.inTurn, play: waiting.play},
    busy: saving.busy,
    failed: saving.text,
    savedText: saving.busy ? "Saving …" : current ? `Saved ${clock(state.recipe!.at)}` : asBuilt ? "" : "Not saved",
    canPlay: !starting && !choosing && !saving.busy && !waiting && state.save !== "loading" && (current || asBuilt || canSave),
    /** ▾: it asks, in its place or a new track. */
    saveAs: () => setAsking(true),
    /** What the Save dialog chose. */
    chosen: async (copyTitle: string | null) => {
      view.focus();
      await write(copyTitle);
    },
    cancel: useCallback(() => {
      setAsking(false);
      view.focus();
    }, [view]),
    /** Save: a track never saved here asks once (in its place, or a new track), then it writes at once. After the strokes on their way:
        what it goes by is the list with them in it. */
    save: async () => {
      await settle(false);
      const now = edits.state();
      if (!edits.canEdit() || saving.busy || isCurrent(now) || isAsBuilt(now)) return;
      if (now.recipe) void write();
      else setAsking(true);
    },
    /** Play begins writing immediately, including the first in-place Save; its dialog waits for the write before AC starts. */
    drive: async () => {
      const before = edits.state();
      const needsSave = !!before.inTurn || (!isCurrent(before) && !isAsBuilt(before));
      const prepared = needsSave ? (async () => {
        await settle(true);
        const now = edits.state();
        return isCurrent(now) || isAsBuilt(now) ? name : write();
      })() : undefined;
      const session = await choose(timedMode, view.clockHours(), view.weatherOptions(), prepared);
      if (!session) return;
      if (!prepared || await prepared) void play(name, session);
    },
  };
}
