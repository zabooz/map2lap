// The one way input reaches the Editor's tools: the view's clicks, picks and wheel, the keyboard and modifier gestures, and taking
// a tool up or laying it down. A tool hook hands its ToolController over; what it does with an input stays in the hook.
import {useEffect, useEffectEvent, useState, type ReactNode, type RefObject} from "react";
import type {Picked, WheelKeys} from "../types";
import type {TrackView} from "../scene/view";
import {AltAlone, ShiftAlone} from "./held";
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
  /** Its bar over the view (ToolOptions). */
  options?: ReactNode;
}

export type ToolControllers = Partial<Record<Tool, ToolController>>;

/** Whether tool works now: one that changes the track only while it can be edited, Select and Road camera always. Pure. */
export const usable = (tool: Tool, editable: boolean) => editable || !!toolDef(tool).free;

/** The selection rule in force: the tool's, or a plain pick while it can't work. Pure. */
export const selectionRule = (tool: Tool, editable: boolean): SelectionRule => usable(tool, editable) ? toolDef(tool).selection : "single";

/** Whether the view gives Shift, Ctrl and Alt with the wheel to the tool on instead of the camera: while it works and says so. Pure. */
export const wheelTaken = (tool: Tool, editable: boolean, controllers: ToolControllers) => usable(tool, editable) && !!controllers[tool]?.takesWheel;

/** Where a pick goes: dropped (a road tool's left click is a point of its own), else to the shared selection. Pure. */
export const pickRoute = (tool: Tool, editable: boolean, p: Pick<Picked, "left"> | null) =>
  selectionRule(tool, editable) === "none" && p?.left ? "drop" : "select";

/** to taken up while from is on: from's clear(), then to's activate() with what was picked. The same tool again restarts it. */
export function handOver(controllers: ToolControllers, from: Tool, to: Tool, picked: Picked | null) {
  controllers[from]?.clear?.();
  controllers[to]?.activate?.({tool: from, picked});
}

const isField = (target: EventTarget | null) => target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

/** The tools' input on view. tool, setTool: the one on (EditTools' state). editable: the track can be changed now. picked: what is
    picked, handed to a tool taken up. deletable: something is picked or marked (X deletes it). onPick: the shared selection takes
    a pick under the rule in force. onGlobal: an Editor shortcut. keyHosts: where keys count (scene and sidebar hosts). paused: a
    dialog has the keys (only Ctrl+S is kept from the browser). switchTool takes a tool up: only events call it, never a render. */
export function useToolHost({view, tool, setTool, editable, picked, deletable, controllers, onPick, onGlobal, keyHosts, paused}: {
  view: TrackView; tool: Tool; setTool: (tool: Tool) => void; editable: boolean; picked: Picked | null; deletable: boolean;
  controllers: ToolControllers; onPick: (p: Picked | null, rule: SelectionRule) => void; onGlobal: (action: GlobalKey) => void;
  keyHosts: (RefObject<HTMLElement | null> | HTMLElement | null)[]; paused: boolean;
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
  useEffect(() => { view.setWheelTaken(takesWheel); }, [view, takesWheel]);
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
    if (["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key) && (e.target as HTMLElement).closest('[role="tablist"]')) return;
    if (e.key !== "Escape" && e.key !== "Enter" && isField(e.target)) return;      // Fields keep their typing and option keys.
    alt.down(e);
    const action = globalKey(e, {picked: deletable});
    if (action) onGlobal(action);
    else if (!active?.key?.(e)) return;
    e.preventDefault();
  });
  const altUp = useEffectEvent((e: KeyboardEvent) => {
    if (!alt.up(e)) return;
    e.preventDefault();      // (Firefox would open its menu bar)
    active?.altAction?.();
  });
  const shiftUp = useEffectEvent((e: KeyboardEvent) => { if (shift.up(e)) active?.toggleMode?.(); });

  useEffect(() => {
    const down = (e: KeyboardEvent) => keyDown(e), up = (e: KeyboardEvent) => altUp(e);
    const elements = keyHosts.map(host => host && "current" in host ? host.current : host);
    for (const el of elements) { el?.addEventListener("keydown", down); el?.addEventListener("keyup", up); }
    return () => { for (const el of elements) { el?.removeEventListener("keydown", down); el?.removeEventListener("keyup", up); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- The hosts are the dependency (a constant number of them).
  }, keyHosts);

  useEffect(() => {
    const down = (e: KeyboardEvent) => shift.down({key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, metaKey: e.metaKey, repeat: e.repeat,
      inField: e.target instanceof HTMLInputElement});
    const up = (e: KeyboardEvent) => shiftUp(e);
    const other = () => { alt.other(); shift.other(); };       // (a modifier with a click or the wheel, or the window left: Alt+Tab)
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    for (const type of ["pointerdown", "wheel"]) window.addEventListener(type, other, true);
    window.addEventListener("blur", other);
    return () => {
      window.removeEventListener("keydown", down); window.removeEventListener("keyup", up);
      for (const type of ["pointerdown", "wheel"]) window.removeEventListener(type, other, true);
      window.removeEventListener("blur", other);
    };
  }, [alt, shift]);

  /** Take up next: the tool on is cleared, next activated if it can work now. */
  const switchTool = (next: Tool) => {
    handOver(usable(next, editable) ? controllers : {...controllers, [next]: undefined}, tool, next, picked);
    setTool(next);
  };
  return {switchTool, options: active?.options ?? null};
}
