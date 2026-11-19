// Delete (X): a click deletes what is under it; its brush deletes all a stroke passes over, as one change and one Undo.
import {useEffect, useEffectEvent, useState} from "react";
import type {ToolController} from "./toolHost";
import type {TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {WheelKeys} from "../types";
import {thenView, ToolChoice, ToolNumber, ToolOptions} from "./ToolOptions";
import {MAX_RADIUS, MIN_RADIUS, RADIUS_STEP, stepped} from "./useBrush";

const RING = "#e5484d";       // (the error's red: what the ring passes over goes)
const FIRST_RADIUS = 5;       // (m)

const deletedText = (n: number) => `${n} ${n === 1 ? "object" : "objects"} deleted. Undo brings ${n === 1 ? "it" : "them"} back.`;

interface DeleteArgs {view: TrackView; edits: TrackEdits; enabled: boolean; onNote: (text: string | null) => void}

/** Delete on the view. enabled: the tool is on. onNote: what to say, null for nothing. brush: the choice. One's click is the
    shared selection's (useSelection, rule "delete"). */
function useDeleteTool({view, edits, enabled, onNote}: DeleteArgs) {
  const [brush, setBrush] = useState(false), [radius, setRadius] = useState(FIRST_RADIUS);
  const painting = enabled && brush;

  const stroked = useEffectEvent((items: ReturnType<TrackView["brush"]["objectsAlong"]>) => {
    if (!items.length) { view.brush.showGone(null); return onNote("Nothing to delete there."); }
    if (!edits.canEdit()) { view.brush.showGone(null); return onNote("This track can't be changed now."); }
    view.brush.showGone(items.map(o => o.id)); view.brush.keepGone(); edits.remove(items); onNote(deletedText(items.length));
  });

  useEffect(() => {
    if (!painting) return;
    view.setBrush({radius, colour: RING, turnedColour: RING, marks: true});
    view.brush.setStroke(samples => stroked(view.brush.objectsAlong(samples, radius)),
      samples => { view.brush.showGone(view.brush.objectsAlong(samples, radius).map(o => o.id)); return Promise.resolve(null); },
      why => onNote(why), () => view.brush.showGone(null));
    return () => { view.setBrush(null); view.brush.setStroke(() => {}, () => Promise.resolve(null), () => {}); view.brush.showGone(null); };
  }, [view, painting, radius, onNote]);

  return {
    brush, painting, radius, setBrush, setRadius,
    /** A notch of the wheel over the view with Ctrl held: the radius. */
    wheel: (keys: WheelKeys, by: number) => { if (keys === "ctrl") setRadius(r => stepped(r, by, RADIUS_STEP, MIN_RADIUS, MAX_RADIUS)); },
  };
}

type DeleteTool = ReturnType<typeof useDeleteTool>;

/** Delete (X) as a tool: One or Brush, Shift pressed and let go alone switches (Ctrl+Shift+Z or Shift with the wheel in between:
    not); Ctrl + wheel the radius. */
export function useDelete(args: DeleteArgs) {
  const remover = useDeleteTool(args);
  const controller: ToolController = {
    wheel: remover.wheel, takesWheel: true, toggleMode: () => remover.setBrush(b => !b),
    options: <DeleteOptions remove={remover} view={args.view} />,
  };
  return {...remover, controller};
}

/** Its bar: One or Brush (Shift switches), and the brush's radius. */
function DeleteOptions({remove: d, view}: {remove: DeleteTool; view: TrackView}) {
  return (
    <ToolOptions id="edit-delete-set" title="Delete"
      note={d.painting ? "Click or drag: everything framed red under the ring goes. Shift: one at a time." : "Click an object, sidewalk, guardrail, railway section, racing kerb or road verge to delete it. Shift: the brush."}
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
