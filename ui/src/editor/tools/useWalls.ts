import {useCallback, useEffect, useRef, useState} from "react";
import {post} from "../../api";
import type {TrackEdits, WallEdit} from "../state/edits";

/** Prepare selected walls' immutable texture or top offset, then commit the entire change as one Undo step. */
export function useWalls(name: string, edits: TrackEdits) {
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const alive = useRef(true), pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const change = useCallback((objects: string[], settings: {rise?: number; material?: string | null; reset?: boolean}) => {
    if (!objects.length || pending.current || !edits.canEdit()) return Promise.resolve(false);
    pending.current = true; setBusy(true); setError(null);
    let applied = false;
    return edits.inTurn(async () => {
      try {
        edits.saveNow();
        const revision = await edits.saved(), base = edits.boundRevision();
        if (!alive.current) return;
        if (revision === null || !base || !edits.canEdit()) throw new Error("The current changes could not be kept.");
        const answer = await post<{walls: WallEdit[]}>(`/api/editor/${encodeURIComponent(name)}/wall`, {base, revision, objects, ...settings});
        if (!alive.current) return;
        if (answer.error || !answer.walls) throw new Error(answer.error ?? "Could not change the wall");
        edits.setWalls(answer.walls); edits.saveNow();
        if (await edits.saved() === null) throw new Error("The wall change could not be kept.");
        applied = true;
      } catch (failure) {
        if (alive.current) setError(failure instanceof Error ? failure.message : "Could not change the wall");
      } finally {
        pending.current = false;
        if (alive.current) setBusy(false);
      }
    }).then(() => applied);
  }, [name, edits]);
  return {busy, error, change};
}
