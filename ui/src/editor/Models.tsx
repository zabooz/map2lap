import {useCallback, useEffect, useEffectEvent, useState, type ReactNode} from "react";
import {post} from "../api";
import type {ModelInstance, TrackEdits} from "./edits";
import {ModelLibrary, type LibraryModel} from "./ModelLibrary";
import {isUnplaced, nudged, unplaced, type Placement} from "./placing";
import type {TrackView, WheelKeys} from "./view";
import {ToolNumber, ToolOptions} from "./ToolOptions";

/** Place a selected model repeatedly or exchange the selected tree's binding through the same draft queue as Move and Undo. */
export function Models({name, view, edits, replace: replaceTargets, enabled, choosing, onClose, onPlace, renderLibrary, onWheel}: {
  name: string; view: TrackView; edits: TrackEdits; replace: string[]; enabled: boolean; choosing: boolean;
  onClose: () => void; onPlace: () => void; renderLibrary?: (objects: ReactNode, busy: boolean) => ReactNode;
  onWheel: (wheel: (keys: WheelKeys, by: number) => void) => void;
}) {
  const [selected, setSelected] = useState<LibraryModel | null>(null), [fault, setFault] = useState<string | null>(null);
  const [libraryBusy, setLibraryBusy] = useState(false);
  const [pose, setPose] = useState(() => unplaced(""));
  useEffect(() => {
    if (!enabled) return;
    onWheel((keys, by) => setPose(p => nudged(p, keys === "shift" ? {turn: by * 5}
      : keys === "ctrl" ? {y: by * .1} : keys === "alt" ? {scale: 1.05 ** by} : {})));
    return () => onWheel(() => {});
  }, [enabled, onWheel]);
  const apply = useCallback((model: LibraryModel, at?: [number, number, number], replace?: string[]) => {
    const options = {...pose};
    void edits.inTurn(async () => {
      edits.saveNow();
      const revision = await edits.saved();
      if (revision === null || !edits.canEdit()) return;
      const answer = await post<{model?: ModelInstance; models?: ModelInstance[]; placed: Placement[]}>(`/api/editor/${encodeURIComponent(name)}/model`,
        {base: edits.boundRevision(), revision, model: model.id, at, replace, keep_height: !!replace});
      const models = answer.models ?? (answer.model ? [answer.model] : []);
      if (answer.error || !models.length) setFault(answer.error ?? "Could not place the model");
      else {
        const placed = !replace && !isUnplaced(options) ? [...answer.placed ?? [], {...options, id: `${models[0].id}#0`}] : answer.placed;
        edits.addModels(models, placed); setFault(null);
        if (replace) view.unpick();
      }
    });
  }, [pose, name, edits, view]);
  const place = useEffectEvent((at: [number, number, number]) => { if (selected) apply(selected, at); });
  useEffect(() => {
    if (!enabled || !selected) return;
    void view.setModelGhost(selected, at => place(at));
    return () => view.setCopy(null, null);
  }, [view, enabled, selected]);
  useEffect(() => { if (enabled) view.setCopyPose(pose); }, [view, enabled, selected, pose]);
  const library = <ModelLibrary embedded={!!renderLibrary} open={choosing} onBusy={setLibraryBusy} replace={replaceTargets.length} onClose={onClose} onChoose={(model, replace) => {
      if (replace && replaceTargets.length) apply(model, undefined, replaceTargets);
      else { setSelected(model); onPlace(); }
      onClose(); view.focus();
    }} />;
  return <>
    {renderLibrary ? renderLibrary(library, libraryBusy) : choosing && library}
    {(enabled && selected || fault) && <ToolOptions id="edit-insert-set" title="Insert" note={fault ?? `Click ground to place ${selected?.name}. Esc ends placement.`}
      options={[
        <ToolNumber label="Turn" unit="°" hint="Turn the next model (Shift + wheel)" min={-180} max={180} step={5}
          value={pose.turn} onChange={turn => setPose(p => nudged({...p, turn}, {}))} />,
        <ToolNumber label="Height" unit="cm" hint="Height over the ground (Ctrl + wheel)" min={-10000} max={10000} step={10}
          value={Math.round(pose.y * 100)} onChange={cm => setPose(p => nudged({...p, y: cm / 100}, {}))} />,
        <ToolNumber label="Size" unit="%" hint="Model size (Alt + wheel)" min={10} max={1000} step={5}
          value={Math.round(pose.scale * 100)} onChange={percent => setPose(p => nudged({...p, scale: percent / 100}, {}))} />,
      ]} />}
  </>;
}
