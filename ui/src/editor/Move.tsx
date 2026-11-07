// Move: houses, trees, street furniture taken along by dragging, turned, raised and sized by the wheel (M). The view shows it at once, the
// server's meshes take its place when they come (src/app/trackplace.py): one reckoning, the one Save uses too.
import {useEffect, useEffectEvent} from "react";
import {post} from "../api";
import type {EditState, TrackEdits} from "./edits";
import {between, nudged, unplaced, type Nudge, type Placement} from "./placing";
import {thenView, ToolAction, ToolNumber, ToolOptions} from "./ToolOptions";
import type {Picked, TrackView, WheelKeys} from "./view";

const TURN_STEP = 5, HEIGHT_STEP = 0.1, SIZE_STEP = 1.05;      // a notch of the wheel: degrees, m, a factor (5 %): fine enough to set a bench straight
const CM = 100, PERCENT = 100;

/** Move on view. enabled: the tool is on. picked: what is picked now. onNote: what to say, null for nothing. */
export function useMove({name, view, edits, state, enabled, picked, onNote}: {name: string; view: TrackView; edits: TrackEdits; state: EditState; enabled: boolean; picked: Picked | null;
                                                                         onNote: (text: string | null) => void}) {
  const ids = enabled ? (picked?.all ?? []).map(p => p.id).filter(id => view.canMove(id)) : [];
  const now = (id: string) => edits.placementOf(id) ?? unplaced(id);
  const shown = ids.length ? now(picked?.id && ids.includes(picked.id) ? picked.id : ids[0]) : unplaced("");

  /** Each of ids changed by its own placement now, at once in the view; join: the notches of the wheel that go into one step to undo. */
  const change = (to: (p: Placement) => Placement, join?: string) => {
    if (!ids.length || !edits.canEdit()) return;
    void edits.inTurn(() => {
      if (!edits.canEdit()) return;
      const placed = ids.map(id => to(now(id)));
      placed.forEach((p, k) => view.nudge([ids[k]], between(now(ids[k]), p)));
      edits.place(placed, join && `${join} ${ids.join()}`);
    });
  };

  const moved = useEffectEvent((dragged: {id: string; x: number; y: number; z: number}[]) => {
    const ids = dragged.map(p => p.id);
    if (!edits.canEdit()) return view.rejectMove(ids);
    if (!state.heights.length) {
      edits.place(dragged.map(({id, ...by}) => nudged(now(id), by)));
      onNote(null);
      return;
    }
    void edits.inTurn(async () => {
      let accepted = false;
      try {
        if (!edits.canEdit()) return;
        edits.saveNow();
        const revision = await edits.saved();
        if (revision === null || !edits.canEdit()) return;
        const placed = dragged.map(({id, ...by}) => nudged(now(id), by));
        const r = await post<{placed: Placement[]}>(`/api/editor/${encodeURIComponent(name)}/move`, {base: edits.boundRevision(), revision, placed});
        if (r.error || !r.placed) onNote(r.error ?? "Could not move the objects");
        else if (edits.canEdit()) { edits.place(r.placed); accepted = true; onNote(null); }
      } finally {
        if (!accepted) view.rejectMove(ids);
      }
    });
  });

  useEffect(() => {
    view.setMove(enabled, dragged => moved(dragged));
    return () => view.setMove(false, () => {});
  }, [view, enabled]);

  useEffect(() => { view.setPlaced(state.placed); }, [view, state.placed]);

  const by = (n: Partial<Nudge>, join: string) => change(p => nudged(p, n), join);
  const set = (field: keyof Nudge, value: number) => change(p => nudged({...p, [field]: value}, {}));
  return {
    ids, shown,
    setTurn: (degrees: number) => set("turn", degrees),
    setHeight: (cm: number) => set("y", cm / CM),
    setSize: (percent: number) => set("scale", percent / PERCENT),
    reset: () => { void edits.inTurn(() => { if (ids.length && edits.canEdit()) edits.place(ids.map(unplaced)); }); },
    /** A notch of the wheel over the view, with those keys held: its numbers as they stand in the bar. */
    wheel: (keys: WheelKeys, notch: number) => {
      if (!ids.length) return onNote("Pick an object first: click it, Shift + click adds more");
      if (keys === "shift") by({turn: notch * TURN_STEP}, "turn");
      else if (keys === "ctrl") by({y: notch * HEIGHT_STEP}, "height");
      else if (keys === "alt") by({scale: SIZE_STEP ** notch}, "size");
    },
  };
}

/** What it can be set to, of what is picked. */
export function MoveOptions({move: m, view}: {move: ReturnType<typeof useMove>; view: TrackView}) {
  const none = !m.ids.length;
  return (
    <ToolOptions id="edit-move-set" title="Move" note={none ? "Click an object to pick it, drag it to move it; Shift + click adds more." : undefined}
                 options={[
                   <ToolNumber label="Turn" unit="°" hint="How far it is turned from how it was built, counter-clockwise (Shift + wheel)" min={-180} max={180} step={TURN_STEP}
                               value={m.shown.turn} onChange={m.setTurn} />,
                   <ToolNumber label="Height" unit="cm" hint="How far it is raised from where it was built (Ctrl + wheel)" min={-10000} max={10000} step={HEIGHT_STEP * CM}
                               value={Math.round(m.shown.y * CM)} onChange={m.setHeight} />,
                   <ToolNumber label="Size" unit="%" hint="Its size, against how it was built (Alt + wheel)" min={10} max={1000} step={5}
                               value={Math.round(m.shown.scale * PERCENT)} onChange={size => m.setSize(Math.max(10, size))} />,
                 ]}
                 actions={<ToolAction id="edit-move-reset" label="Reset" hint="Back where and as it was built" onClick={thenView(view, m.reset)} />} />
  );
}
