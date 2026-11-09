// Copy (C): pick once, then place independent instances with repeated left clicks.
import {useEffect, useEffectEvent, useState} from "react";
import {post} from "../api";
import type {CopyTemplate, ObjectCopy} from "./copying";
import type {ModelInstance, TrackEdits} from "./edits";
import {nudged, unplaced, type Placement} from "./placing";
import {thenView, ToolAction, ToolNumber, ToolOptions} from "./ToolOptions";
import type {Picked, TrackView, WheelKeys} from "./view";

interface Ready {template: CopyTemplate; at: number[]; kind: string; source: string}

/** The active Copy tool, mounted anew each time it is taken up; its source stays ready after each placement. */
export function CopyTool({name, edits, view, picked, onWheel}: {name: string; edits: TrackEdits; view: TrackView; picked: Picked | null;
                                                              onWheel: (wheel: (keys: WheelKeys, by: number) => void) => void}) {
  const [ready, setReady] = useState<Ready | null>(null);
  const [fault, setFault] = useState<string | null>(null);
  const [pose, setPose] = useState(() => unplaced(""));
  useEffect(() => {
    onWheel((keys, by) => setPose(p => nudged(p, keys === "shift" ? {turn: by * 5}
      : keys === "ctrl" ? {y: by * 0.1} : keys === "alt" ? {scale: 1.05 ** by} : {})));
    return () => onWheel(() => {});
  }, [onWheel]);
  const source = picked?.id ?? null;
  useEffect(() => {
    if (ready || !source || !view.canMove(source)) return;
    let current = true;
    void edits.inTurn(async () => {
      edits.saveNow();
      const revision = await edits.saved();
      if (!current || revision === null || !edits.canEdit()) return;
      const r = await post<Omit<Ready, "source">>(`/api/editor/${encodeURIComponent(name)}/copy`,
        {base: edits.boundRevision(), revision, object: source});
      if (!current) return;
      if (r.error || !r.template || !r.at || !r.kind) setFault(r.error ?? "Could not copy this object");
      else {
        setReady({template: r.template, at: r.at, kind: r.kind, source});
        setFault(null);
        view.unpick();     // The source is now a template; X should take up Delete instead of deleting the original.
      }
    });
    return () => { current = false; };
  }, [name, source, edits, view, ready]);

  const place = useEffectEvent((at: [number, number, number]) => {
    if (!ready) return;
    const template = ready.template;
    const options = {turn: pose.turn, y: pose.y, scale: pose.scale};
    void edits.inTurn(async () => {
      if (!edits.canEdit()) return;
      edits.saveNow();
      const revision = await edits.saved();
      if (revision === null) return;
      const r = await post<{copy?: ObjectCopy; model?: ModelInstance; placed?: Placement[]}>(`/api/editor/${encodeURIComponent(name)}/copy`,
        {base: edits.boundRevision(), revision, template, at, pose: options});
      if (r.error || (!r.copy && !r.model)) setFault(r.error ?? "Could not place the copy");
      else { if (r.model) edits.addModel(r.model, r.placed); else edits.addCopy(r.copy!); setFault(null); }
    });
  });

  useEffect(() => {
    view.setCopy(ready?.source ?? null, ready ? at => place(at) : null, ready?.at);
    return () => view.setCopy(null, null);
  }, [view, ready]);

  useEffect(() => { view.setCopyPose(pose); }, [view, pose, ready]);

  const note = fault ?? (ready ? `Click to place ${ready.kind}; keep clicking for more copies. Esc ends Copy.`
    : source && !view.canMove(source) ? "A power line goes with its poles; pick an object to copy."
    : source ? "Preparing the copy …" : "Click an object to copy it, then click where to place it. Esc ends Copy.");
  return <ToolOptions id="edit-copy-set" title="Copy" note={note}
    options={[
      <ToolNumber label="Turn" unit="°" hint="Turn each copy from the source (Shift + wheel)" min={-180} max={180} step={5}
        value={pose.turn} onChange={turn => setPose(p => nudged({...p, turn}, {}))} />,
      <ToolNumber label="Height" unit="cm" hint="Raise each copy above the clicked ground (Ctrl + wheel)" min={-10000} max={10000} step={10}
        value={Math.round(pose.y * 100)} onChange={cm => setPose(p => nudged({...p, y: cm / 100}, {}))} />,
      <ToolNumber label="Size" unit="%" hint="Size of each copy against its source (Alt + wheel)" min={10} max={1000} step={5}
        value={Math.round(pose.scale * 100)} onChange={percent => setPose(p => nudged({...p, scale: percent / 100}, {}))} />,
    ]}
    actions={ready && <ToolAction label="Choose another" hint="Pick a different source object" onClick={thenView(view, () => { setReady(null); setFault(null); view.unpick(); })} />} />;
}
