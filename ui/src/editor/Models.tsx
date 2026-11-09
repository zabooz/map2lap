import {useCallback, useEffect, useState} from "react";
import {post} from "../api";
import type {ModelInstance, TrackEdits} from "./edits";
import {ModelLibrary, type LibraryModel} from "./ModelLibrary";
import type {Placement} from "./placing";
import type {Picked, TrackView} from "./view";
import {ToolOptions} from "./ToolOptions";

/** Place a selected model repeatedly or exchange the selected tree's binding through the same draft queue as Move and Undo. */
export function Models({name, view, edits, picked, enabled, choosing, onClose, onPlace}: {
  name: string; view: TrackView; edits: TrackEdits; picked: Picked | null; enabled: boolean; choosing: boolean;
  onClose: () => void; onPlace: () => void;
}) {
  const [selected, setSelected] = useState<LibraryModel | null>(null), [fault, setFault] = useState<string | null>(null);
  const apply = useCallback((model: LibraryModel, at?: [number, number, number], replace?: string) => {
    void edits.inTurn(async () => {
      edits.saveNow();
      const revision = await edits.saved();
      if (revision === null || !edits.canEdit()) return;
      const answer = await post<{model: ModelInstance; placed: Placement[]}>(`/api/editor/${encodeURIComponent(name)}/model`,
        {base: edits.boundRevision(), revision, model: model.id, at, replace});
      if (answer.error || !answer.model) setFault(answer.error ?? "Could not place the model");
      else { edits.addModel(answer.model, answer.placed); setFault(null); }
    });
  }, [name, edits]);
  useEffect(() => {
    if (!enabled || !selected) return;
    view.setCopy(null, at => apply(selected, at));
    return () => view.setCopy(null, null);
  }, [view, enabled, selected, apply]);
  return <>
    {choosing && <ModelLibrary replace={picked?.kind === "Tree" || picked?.kind === "Bush" ? picked.id : null} onClose={onClose} onChoose={(model, replace) => {
      if (replace && picked?.id) apply(model, undefined, picked.id);
      else { setSelected(model); onPlace(); }
      onClose(); view.focus();
    }} />}
    {(enabled && selected || fault) && <ToolOptions title="Models" note={fault ?? `Click ground to place ${selected?.name}. Esc ends placement.`} />}
  </>;
}
