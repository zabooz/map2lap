import {useCallback, useEffect, useRef, useState} from "react";
import {get, post} from "../../api";
import type {TrackEdits} from "../state/edits";
import type {SurfacePoint} from "../scene/surfaces";
import type {TrackView} from "../scene/view";
import type {TextureLook} from "../library/textureLook";

/** How far an Apply is: its tiles' masks taken and described on the server ("masks", "preview"), then the page's textures
 *  loaded ("loading"). */
export interface PaintProgress { phase: string; done: number; total: number }

const ASK_EVERY_MS = 250;   // (how often the bar asks the server how far the Apply is)

/** Capture the clicked selection and serialize it with Undo and Save, like a terrain stroke. */
export function usePaint(name: string, edits: TrackEdits, view: TrackView) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<PaintProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(false), pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  /** One server-made texture edit into the draft: ask(base, revision) makes it, put(id) adds it as one Undo step; true once its
      preview has loaded. failure: the message when the server gives none. */
  const commit = useCallback((ask: (base: string, revision: number) => Promise<{paint?: string; error?: string}>,
    put: (id: string) => void, failure: string) => {
    if (pending.current || !edits.canEdit()) return Promise.resolve(false);
    pending.current = true; setBusy(true); setError(null);
    let applied = false;
    return edits.inTurn(async () => {
      try {
        edits.saveNow();
        const revision = await edits.saved(), base = edits.boundRevision();
        if (!alive.current) return;
        if (revision === null || !base || !edits.canEdit()) throw new Error("The current changes could not be kept. Try again after reloading them.");
        const result = await ask(base, revision);
        if (!alive.current) return;
        if (result.error || !result.paint) throw new Error(result.error ?? failure);
        put(result.paint);
        edits.saveNow();
        if (await edits.saved() === null) throw new Error("The material change could not be kept.");
        await view.textures.syncPaints(edits.state().paints);
        await view.textures.ready((done, total) => { if (alive.current) setProgress({phase: "loading", done, total}); });
        applied = true;
      } catch (e) {
        if (alive.current) setError(e instanceof Error ? e.message : failure);
      } finally {
        pending.current = false;
        if (alive.current) { setBusy(false); setProgress(null); }
      }
    }).then(() => applied);
  }, [edits, view]);
  const apply = useCallback((material: string, points: SurfacePoint[], variation?: boolean, tiles?: [number, number][], look?: TextureLook) => {
    if (!points.length) return Promise.resolve(false);
    return commit(async (base, revision) => {
      const asking = setInterval(() => void get<Partial<PaintProgress>>(`/api/editor/${encodeURIComponent(name)}/paint-progress`)
        .then(p => { if (alive.current && p?.phase) setProgress(p as PaintProgress); }), ASK_EVERY_MS);
      return post<{paint: string}>(`/api/editor/${encodeURIComponent(name)}/paint`, {base, revision, material, points, variation, tiles, look})
        .finally(() => clearInterval(asking));
    }, id => edits.addPaint(id), "Could not apply this material");
  }, [name, edits, commit]);
  /** Applied texture paint again with other settings, in its place: other applications of the texture stay as they are. */
  const restyle = useCallback((paint: string, look: TextureLook, variation?: boolean) => commit(
    (base, revision) => post<{paint: string}>(`/api/editor/${encodeURIComponent(name)}/paint-settings`, {base, revision, paint, look, variation}),
    id => edits.replacePaint(paint, id), "Could not change the texture settings"), [name, edits, commit]);
  return {busy, progress, error, apply, restyle};
}
