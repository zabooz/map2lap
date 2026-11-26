// The one way input reaches the Editor's tools: the view's clicks, picks and wheel, the keyboard and modifier gestures, and taking
// a tool up or laying it down. A tool hook hands its ToolController over; what it does with an input stays in the hook.
import {useEffect, useEffectEvent, useState, type ReactNode} from "react";
import type {Picked, WheelKeys} from "../types";
import type {TrackView} from "../scene/view";
import {toasts} from "../../components/toastStore";
import {editorInputBlocked, AltAlone, ShiftAlone} from "./held";
import {globalKey, toolDef, type GlobalKey, type SelectionRule, type Tool} from "./toolDefs";

/** What a tool takes while it is on; anything left out goes to the camera or to the shared selection. Called with the newest
    render's values (the host reads it through effect events), so a tool may return a new object each render. */
export interface ToolController {
  /** A left click in the view (after the pick), null for sky: points on a road, a kerb, a stitch. */
  click?(p: Picked | null): void;
  /** A notch of the wheel with Shift, Ctrl, Alt or Ctrl+Alt held: the view gives it while takesWheel or a brush is set. */
  wheel?(keys: WheelKeys, by: number): void;
  takesWheel?: boolean;
  /** A key no Editor shortcut took (globalKey comes first: Esc, Undo, Save, tool keys); true: taken. */
  key?(e: KeyboardEvent): boolean;
  /** Shift pressed and let go by itself: its two modes (One/Brush, Road/Free). */
  toggleMode?(): void;
  /** Alt pressed and let go by itself (Select: the picked ground's texture or the trees' replacement). */
  altAction?(): void;
  /** Taken up (from: the tool that was on, with what was picked then): Select→Smooth starts at the picked road. */
  activate?(from: {tool: Tool; picked: Picked | null}): void;
  /** Laid down or Esc: its marks, previews and requests on their way are dropped. */
  clear?(): void;
  /** One of the tool's own edits is picked (editRanges): it counts as picked for the Editor's keys, so X deletes it. */
  removable?: boolean;
  /** X or Delete with one of its own edits picked: removes it; true: removed (else the shared selection's turn). */
  remove?(): boolean;
  /** Its bar over the view (ToolOptions). */
  options?: ReactNode;
}

export type ToolControllers = Partial<Record<Tool, ToolController>>;

/** Whether tool works now: read-only tools work even when the track cannot be edited. Pure. */
export const usable = (tool: Tool, editable: boolean) => editable || !!toolDef(tool).free;

/** The selection rule in force: the tool's, or a plain pick while it can't work. Pure. */
export const selectionRule = (tool: Tool, editable: boolean): SelectionRule => usable(tool, editable) ? toolDef(tool).selection : "single";

/** Whether the view gives Shift, Ctrl and Alt with the wheel to the tool on instead of the camera: while it works and says so. Pure. */
export const wheelTaken = (tool: Tool, editable: boolean, controllers: ToolControllers) => usable(tool, editable) && !!controllers[tool]?.takesWheel;

/** Where a pick goes: dropped (a road tool's left click is a point of its own), else to the shared selection. Pure. */
export const pickRoute = (tool: Tool, editable: boolean, p: Pick<Picked, "left"> | null) =>
  selectionRule(tool, editable) === "none" && p?.left ? "drop" : "select";

/** to taken up while from is on: from's clear(), then to's activate() with what was picked. The same tool again restarts it. */
/** What an Editor key does: globalKey's answer, with the tool's own picked edit first for X and Delete ("removed": the tool
    removed it). deletable: the shared selection has something to delete. Calls controller.remove. */
export function editorKey(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey">, deletable: boolean,
                          controller: ToolController | undefined): GlobalKey | "removed" | null {
  const action = globalKey(e, {picked: deletable || !!controller?.removable});
  return action === "delete" && controller?.removable && controller.remove?.() ? "removed" : action;
}

export function handOver(controllers: ToolControllers, from: Tool, to: Tool, picked: Picked | null) {
  controllers[from]?.clear?.();
  controllers[to]?.activate?.({tool: from, picked});
}

/** The tools' input on view. tool, setTool: the one on (EditTools' state). editable: the track can be changed now. picked: what is
    picked, handed to a tool taken up. deletable: something is picked or marked (X deletes it). onPick: the shared selection takes
    a pick under the rule in force. onGlobal: an Editor shortcut. visible: the Editor tab owns page shortcuts. paused: a
    dialog has the keys (only Ctrl+S is kept from the browser). switchTool takes a tool up: only events call it, never a render. */
export function useToolHost({view, tool, setTool, editable, picked, deletable, controllers, onPick, onGlobal, visible, paused}: {
  view: TrackView; tool: Tool; setTool: (tool: Tool) => void; editable: boolean; picked: Picked | null; deletable: boolean;
  controllers: ToolControllers; onPick: (p: Picked | null, rule: SelectionRule) => void; onGlobal: (action: GlobalKey) => void;
  visible: boolean; paused: boolean;
}) {
  const on = usable(tool, editable), active = on ? controllers[tool] : undefined, rule = selectionRule(tool, editable);

  const pickEvent = useEffectEvent((p: Picked | null) => {
    if (pickRoute(tool, editable, p) === "drop") return view.selection.unpick();
    onPick(p, rule);
  });
  const clickEvent = useEffectEvent((p: Picked | null) => active?.click?.(p));
  const wheelEvent = useEffectEvent((keys: WheelKeys, by: number) => active?.wheel?.(keys, by));
  useEffect(() => {
    view.selection.setPick(p => pickEvent(p));
    view.setClicked(p => clickEvent(p));
    view.setToolWheel((keys, by) => wheelEvent(keys, by));
    return () => { view.selection.setPick(() => {}); view.setClicked(() => {}); view.setToolWheel(() => {}); };
  }, [view]);

  const takesWheel = wheelTaken(tool, editable, controllers);
  const takesLeftClicks = rule !== "none" || !!active?.click;
  useEffect(() => { view.setWheelTaken(takesWheel); }, [view, takesWheel]);
  useEffect(() => { view.setLeftClicks(takesLeftClicks); }, [view, takesLeftClicks]);
  useEffect(() => { view.setCursorTool(on ? tool : "select"); }, [view, tool, on]);
  useEffect(() => { view.selection.setAdding((rule === "select" || rule === "multi") && editable); }, [view, rule, editable]);

  const [alt] = useState(() => new AltAlone()), [shift] = useState(() => new ShiftAlone());
  // (an effect event: Delete pressed right after a click reaches what that click picked, not the keys' state before it)
  const keyDown = useEffectEvent((e: KeyboardEvent) => {
    const control = e.ctrlKey || e.metaKey;
    if (paused) {        // (the dialog's name field keeps its own keys; Ctrl+S isn't the browser's)
      if (control && e.key.toLowerCase() === "s") e.preventDefault();
      return;
    }
    if (["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key) && (e.target as HTMLElement).closest?.('[role="tablist"]')) return;
    if (e.defaultPrevented || editorInputBlocked(e.target)) return;
    alt.down(e);
    const action = editorKey(e, deletable, active);
    if (action) { if (action !== "removed") onGlobal(action); }     // ("removed": the tool deleted its own picked edit)
    else if (!active?.key?.(e)) return;
    e.preventDefault();
  });
  const altUp = useEffectEvent((e: KeyboardEvent) => {
    if (!alt.up(e)) return;
    e.preventDefault();      // (Firefox would open its menu bar)
    active?.altAction?.();
  });
  const modifierUp = useEffectEvent((e: KeyboardEvent) => {
    const blocked = paused || editorInputBlocked(e.target);
    if (shift.up(e) && !blocked) active?.toggleMode?.();
  });

  useEffect(() => {
    if (!visible) return;
    const down = (e: KeyboardEvent) => keyDown(e);
    const up = (e: KeyboardEvent) => altUp(e);
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    const off = toasts.onDismissed(() => {
      if (!document.querySelector('dialog[open], [aria-modal="true"]')) view.focus();
    });
    return () => { off(); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [visible, view]);

  useEffect(() => {
    if (!visible) return;
    const down = (e: KeyboardEvent) => {
      const keys = {key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
        repeat: e.repeat, inField: editorInputBlocked(e.target)};
      shift.down({...keys, inField: keys.inField || keys.altKey || keys.ctrlKey || keys.metaKey});
    };
    const up = (e: KeyboardEvent) => modifierUp(e);
    const other = () => { alt.other(); shift.other(); };       // (a modifier with a click or the wheel, or the window left: Alt+Tab)
    window.addEventListener("keydown", down, true); window.addEventListener("keyup", up);
    for (const type of ["pointerdown", "wheel"]) window.addEventListener(type, other, true);
    window.addEventListener("blur", other);
    return () => {
      window.removeEventListener("keydown", down, true); window.removeEventListener("keyup", up);
      for (const type of ["pointerdown", "wheel"]) window.removeEventListener(type, other, true);
      window.removeEventListener("blur", other); other();
    };
  }, [alt, shift, visible]);

  /** Take up next: the tool on is cleared, next activated if it can work now. */
  const switchTool = (next: Tool) => {
    handOver(usable(next, editable) ? controllers : {...controllers, [next]: undefined}, tool, next, picked);
    setTool(next);
  };
  return {switchTool, options: active?.options ?? null};
}
