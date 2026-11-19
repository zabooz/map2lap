import {useCallback, useEffect, useRef, useState} from "react";
import {post} from "../../api";
import type {TrackEdits, WallEdit} from "../state/edits";
import {serverEdit} from "../state/serverEdit";

/** Prepare selected walls' immutable texture or top offset, then commit the entire change as one Undo step. */
export function useWalls(name: string, edits: TrackEdits) {
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const alive = useRef(true), pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const change = useCallback((objects: string[], settings: {rise?: number; material?: string | null; reset?: boolean}) => {
    if (!objects.length || pending.current || !edits.canEdit()) return Promise.resolve(false);
    pending.current = true; setBusy(true); setError(null);
    return serverEdit(edits, {
      ask: (base, revision) => post<{walls: WallEdit[]}>(`/api/editor/${encodeURIComponent(name)}/wall`, {base, revision, objects, ...settings}),
      put: answer => { if (!answer.walls) return false; edits.setWalls(answer.walls); return true; },
      wanted: () => alive.current, failure: "Could not change the wall", unkept: "The wall change could not be kept."})
      .then(result => {
        pending.current = false;
        if (!alive.current) return false;
        setBusy(false);
        if (result.state === "refused" || result.state === "unkept") setError(result.message);
        return result.state === "applied";
      });
  }, [name, edits]);
  return {busy, error, change};
}
