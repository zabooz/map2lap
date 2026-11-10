// Delete (X): a click deletes what is under it; its brush deletes all a stroke passes over, as one change and one Undo.
import {useEffect, useEffectEvent, useState} from "react";
import type {TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {WheelKeys} from "../types";
import {thenView, ToolChoice, ToolNumber, ToolOptions} from "./ToolOptions";
import {MAX_RADIUS, MIN_RADIUS, RADIUS_STEP, stepped} from "./useBrush";

const RING = "#e5484d";       // (the error's red: what the ring passes over goes)
const FIRST_RADIUS = 5;       // (m)

const deletedText = (n: number) => `${n} ${n === 1 ? "object" : "objects"} deleted. Undo brings ${n === 1 ? "it" : "them"} back.`;

/** Delete on the view. enabled: the tool is on. onNote: what to say, null for nothing. brush: the choice, Shift pressed and let go
    alone switches it (Ctrl+Shift+Z or Shift with the wheel in between: not). The click of One stays EditTools' (onPicked). */
export function useDelete({view, edits, enabled, onNote}: {view: TrackView; edits: TrackEdits; enabled: boolean; onNote: (text: string | null) => void}) {
  const [brush, setBrush] = useState(false), [radius, setRadius] = useState(FIRST_RADIUS);
  const painting = enabled && brush;

  useEffect(() => {
    if (!enabled) return;
    let alone = false;
    const down = (e: KeyboardEvent) => { alone = e.key === "Shift" && (alone || !e.repeat) && !(e.target instanceof HTMLInputElement); };
    const up = (e: KeyboardEvent) => { if (e.key === "Shift" && alone) setBrush(b => !b); alone = false; };
    const other = () => { alone = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    window.addEventListener("wheel", other, {capture: true}); window.addEventListener("pointerdown", other, {capture: true});
    return () => {
      window.removeEventListener("keydown", down); window.removeEventListener("keyup", up);
      window.removeEventListener("wheel", other, {capture: true}); window.removeEventListener("pointerdown", other, {capture: true});
    };
  }, [enabled]);

  const stroked = useEffectEvent((items: ReturnType<TrackView["brushObjects"]>) => {
    if (!items.length) { view.showGone(null); return onNote("Nothing to delete there."); }
    if (!edits.canEdit()) { view.showGone(null); return onNote("This track can't be changed now."); }
    view.showGone(items.map(o => o.id)); view.keepGone(); edits.remove(items); onNote(deletedText(items.length));
  });

  useEffect(() => {
    if (!painting) return;
    view.setBrush({radius, colour: RING, turnedColour: RING, marks: true});
    view.setStroke(samples => stroked(view.brushObjects(samples, radius)),
      samples => { view.showGone(view.brushObjects(samples, radius).map(o => o.id)); return Promise.resolve(null); },
      why => onNote(why), () => view.showGone(null));
    return () => { view.setBrush(null); view.setStroke(() => {}, () => Promise.resolve(null), () => {}); view.showGone(null); };
  }, [view, painting, radius, onNote]);

  return {
    brush, painting, radius, setBrush, setRadius,
    /** A notch of the wheel over the view with Ctrl held: the radius. */
    wheel: (keys: WheelKeys, by: number) => { if (keys === "ctrl") setRadius(r => stepped(r, by, RADIUS_STEP, MIN_RADIUS, MAX_RADIUS)); },
  };
}

/** Its bar: One or Brush (Shift switches), and the brush's radius. */
export function DeleteOptions({remove: d, view}: {remove: ReturnType<typeof useDelete>; view: TrackView}) {
  return (
    <ToolOptions id="edit-delete-set" title="Delete"
      note={d.painting ? "Click or drag: everything framed red under the ring goes. Shift: one at a time." : "Click an object to delete it. Shift: the brush."}
      options={[
        <>
          <ToolChoice label="One" on={!d.painting} hint="A click deletes what is under it (Shift switches to the brush)" onClick={thenView(view, () => d.setBrush(false))} />
          <ToolChoice label="Brush" on={d.painting} hint="A click or a drag deletes everything under the ring, framed red (Shift switches to one)" onClick={thenView(view, () => d.setBrush(true))} />
        </>,
        <ToolNumber label="Radius" unit="m" hint="How far the brush reaches, the ring on the ground (Ctrl + wheel)"
                    min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={d.radius} onChange={d.setRadius} />,
      ]} />
  );
}
