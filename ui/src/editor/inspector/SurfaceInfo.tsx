import {useEffect, useState} from "react";
import {surfaceName, type SurfacePoint, type SurfaceSelection} from "../scene/surfaces";
import type {TrackView} from "../scene/view";

/** Inspect one clicked painted surface: its materials' names. Selection never changes the draft; unmounting cancels the request and highlight. */
export function SurfaceInfo({name, surfaces, view, onSelected}: {name: string; surfaces: SurfacePoint[]; view: TrackView;
  onSelected?: (selection: SurfaceSelection | null) => void}) {
  const [selected, setSelected] = useState<SurfaceSelection | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const ground = surfaces.filter(s => s.face === undefined);
        const regions = surfaces.filter(s => s.face !== undefined).map(s => view.materialSelection(s));
        if (ground.length) {
          const query = new URLSearchParams({r: ground[0].revision, points: JSON.stringify(ground)});
          const response = await fetch(`/api/editor/${encodeURIComponent(name)}/surface?${query}`, {signal: controller.signal});
          const result = await response.json() as SurfaceSelection & {error?: string};
          if (!response.ok) throw new Error(result.error ?? "Could not select this ground");
          regions.push(result);
        }
        if (controller.signal.aborted) return;
        const materials = [...new Set(regions.flatMap(r => r.materials ?? [r.material]))];
        const faces = new Map<number, Set<number>>();
        for (const r of regions) for (const m of r.meshes ?? []) {
          if (!faces.has(m.mesh)) faces.set(m.mesh, new Set());
          for (const face of m.faces) faces.get(m.mesh)!.add(face);
        }
        const result: SurfaceSelection = {material: materials[0], materials, truncated: regions.some(r => r.truncated),
          tiles: regions.flatMap(r => r.tiles), meshes: [...faces].map(([mesh, f]) => ({mesh, faces: [...f]}))};
        // Metadata is ready before the full-resolution highlight finishes decoding/uploading.
        setSelected(result); onSelected?.(result);
        await view.setSurface(result, message => { if (!controller.signal.aborted) setError(message); });
      } catch (e) {
        if (!controller.signal.aborted) {
          void view.setSurface(null);
          setSelected(null); onSelected?.(null);
          setError(e instanceof Error ? e.message : "Could not select this ground");
        }
      }
    })();
    return () => { controller.abort(); void view.setSurface(null); onSelected?.(null); };
  }, [name, surfaces, view, onSelected]);
  if (error) return <p id="edit-surface-error" className="small muted">{error}</p>;
  if (!selected) return <p className="small muted">Selecting ground…</p>;
  return <><strong id="edit-surface">{(selected.materials ?? [selected.material]).map(surfaceName).join(", ")}</strong>
    {selected.truncated && <p className="small muted">The surface continues beyond the highlighted area.</p>}</>;
}
