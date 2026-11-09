import {useCallback, useEffect, useRef, useState} from "react";
import {post} from "../../api";
import type {TrackEdits} from "../state/edits";
import type {SurfacePoint} from "../scene/surfaces";
import type {TrackView} from "../scene/view";

/** Capture the clicked selection and serialize it with Undo and Save, like a terrain stroke. */
export function usePaint(name: string, edits: TrackEdits, view: TrackView) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(false), pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const apply = useCallback((material: string, points: SurfacePoint[], variation?: boolean, tiles?: [number, number][]) => {
    if (pending.current || !points.length || !edits.canEdit()) return Promise.resolve(false);
    pending.current = true; setBusy(true); setError(null);
    let applied = false;
    return edits.inTurn(async () => {
      try {
        edits.saveNow();
        const revision = await edits.saved(), base = edits.boundRevision();
        if (!alive.current) return;
        if (revision === null || !base || !edits.canEdit()) throw new Error("The current changes could not be kept. Try again after reloading them.");
        const result = await post<{paint: string}>(`/api/editor/${encodeURIComponent(name)}/paint`, {base, revision, material, points, variation, tiles});
        if (!alive.current) return;
        if (result.error || !result.paint) throw new Error(result.error ?? "Could not apply this material");
        edits.addPaint(result.paint);
        edits.saveNow();
        if (await edits.saved() === null) throw new Error("The material change could not be kept.");
        await view.syncPaints(edits.state().paints);
        await view.texturesReady();
        applied = true;
      } catch (e) {
        if (alive.current) setError(e instanceof Error ? e.message : "Could not apply this material");
      } finally {
        pending.current = false;
        if (alive.current) setBusy(false);
      }
    }).then(() => applied);
  }, [name, edits, view]);
  return {busy, error, apply};
}
