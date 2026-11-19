// Select (V) as a tool: its bar with Select all and Add (Shift and Ctrl as buttons), what can be done with the pick, and Alt alone.
import {useEffect, useState} from "react";
import type {TrackView} from "../scene/view";
import {ToolAction, ToolChoice, ToolOptions, thenView} from "./ToolOptions";
import {ACTIONS, altAction, selectActions, type SelectAction} from "./selectActions";
import {SECTION_TEXT} from "./sections";
import {toolDef} from "./toolDefs";
import type {ToolController} from "./toolHost";
import type {useSelection} from "./useSelection";

/** Select on view. on: it is the tool on. selection: the shared one. sort: the picked object's sort that Select all takes. run: what each action does
    now, null where it can't. */
export function useSelect({view, on, selection, sort, run}: {view: TrackView; on: boolean; selection: ReturnType<typeof useSelection>; sort: string | null;
  run: Record<SelectAction, (() => void) | null>}) {
  const [whole, setWhole] = useState(false), [add, setAdd] = useState(false);
  const {picked, section} = selection;
  useEffect(() => {
    view.selection.setSelectMode(on, whole, add);
    return () => view.selection.setSelectMode(false);
  }, [view, on, whole, add]);

  const offered = section ? ["delete" as const] : selectActions(picked), altOffered = altAction(offered);
  /** The bar's button of action, with the key of the tool it takes up. */
  const actionButton = (action: SelectAction) => {
    const {label, tool: keyed, hint} = ACTIONS[action], perform = run[action];
    return <ToolAction key={action} id={`edit-select-${action}`} label={label} shortcut={keyed ? toolDef(keyed).key ?? undefined : undefined} hint={hint}
                       disabled={!perform} onClick={() => perform?.()} />;
  };
  const options = (
    <ToolOptions id="edit-select-set" title="Select" note={section ? SECTION_TEXT[section.kind].bar
      : "Click to pick; left drag selects objects in a rectangle. Add or Ctrl adds to the selection."}
      options={[
        <ToolChoice label="Select all" on={whole} hint="Select every matching ground surface, including separate areas, or every object of this sort (Shift + click)" onClick={thenView(view, () => {
          setWhole(!whole);
          if (picked?.surface) selection.setSurfacePicks(previous => previous.map(s => ({...s, whole: !whole})));
          else if (sort) selection.setMarked(whole ? [] : [{sort}]);
        })} />,
        <ToolChoice label="Add" on={add} hint="Add to the selection; click a picked object again to remove it (Ctrl + click)" onClick={thenView(view, () => setAdd(!add))} />,
        ...(altOffered ? [actionButton(altOffered)] : []),
      ]} actions={offered.filter(action => action !== altOffered).map(actionButton)} />
  );
  const controller: ToolController = {
    // (Alt let go by itself: the bar's Alt place, the picked ground's texture or the picked objects' replacement)
    altAction: () => { if (altOffered) run[altOffered]?.(); },
    clear: () => { setWhole(false); setAdd(false); },
    options,
  };
  return {controller};
}

