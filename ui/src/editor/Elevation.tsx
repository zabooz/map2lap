// Elevation: the brush, raising or lowering the ground where it goes (H).
import {useState} from "react";
import type {TrackEdits} from "./edits";
import {useHeld} from "./held";
import {thenView, ToolChoice, ToolNumber, ToolOptions} from "./ToolOptions";
import {MAX_RADIUS, MAX_SOFT, MIN_RADIUS, MIN_SOFT, RADIUS_STEP, stepped, useBrush} from "./useBrush";
import type {TrackView, WheelKeys} from "./view";

const CM_TO_MM = 10;
const FIRST_HEIGHT = 5;             // (cm)
const MIN_HEIGHT = 1, MAX_HEIGHT = 10000;     // (cm: trackheights, 100 m)
const RAISE_COLOUR = "#ff8a1f", LOWER_COLOUR = "#2f8bff";
const WHEEL_SOFT_STEP = 5;

/** Elevation on the track name. enabled: the tool is on. speed: in cm a second, how fast it goes on while held (Settings). onNote: what to say, null for nothing. */
export function useElevation({name, view, edits, enabled, speed, onNote}: {name: string; view: TrackView; edits: TrackEdits; enabled: boolean; speed: number;
                                                                           onNote: (text: string | null) => void}) {
  const [height, setHeight] = useState(FIRST_HEIGHT);
  const [lower, setLower] = useState(false);
  const brush = useBrush({view, edits, url: `/api/editor/${encodeURIComponent(name)}/brush`, enabled, onNote,
                          colour: lower ? LOWER_COLOUR : RAISE_COLOUR, turnedColour: lower ? RAISE_COLOUR : LOWER_COLOUR,
                          body: turned => ({mm: Math.round(height * CM_TO_MM) * (lower !== turned ? -1 : 1), speed: Math.round(speed * CM_TO_MM)})});
  return {
    ...brush, height, lower, setHeight, setLower,
    /** A notch of the wheel over the view, with those keys held: its numbers as they stand in the bar. */
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "ctrl") brush.setRadius(r => stepped(r, by, RADIUS_STEP, MIN_RADIUS, MAX_RADIUS));
      else if (keys === "alt") setHeight(h => stepped(h, by, 1, MIN_HEIGHT, MAX_HEIGHT));
      else if (keys === "ctrlAlt") brush.setSoft(s => stepped(s, by, WHEEL_SOFT_STEP, MIN_SOFT, MAX_SOFT));
    },
  };
}

/** What it can be set to. The choice follows Shift, as the ring and the strokes do. */
export function ElevationOptions({elevation: e, view}: {elevation: ReturnType<typeof useElevation>; view: TrackView}) {
  const {shift} = useHeld();
  return (
    <ToolOptions id="edit-elevation-set" title="Elevation" options={[
      <>
        <ToolChoice label="Raise" on={e.lower === shift} hint="It raises the ground (Shift: the other way)" onClick={thenView(view, () => e.setLower(false))} />
        <ToolChoice label="Lower" on={e.lower !== shift} hint="It lowers the ground (Shift: the other way)" onClick={thenView(view, () => e.setLower(true))} />
      </>,
      <ToolNumber label="Radius" unit="m" hint="How far it reaches, the ring on the ground (Ctrl + wheel)"
                  min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={e.radius} onChange={e.setRadius} />,
      <ToolNumber label="Height" unit="cm" hint="How far one click moves the ground, at its middle (Alt + wheel)" min={MIN_HEIGHT} max={MAX_HEIGHT} value={e.height} onChange={e.setHeight} />,
      <ToolNumber label="Soft edge" unit="%" hint="How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge (Ctrl + Alt + wheel)"
                  min={MIN_SOFT} max={MAX_SOFT} step={10} value={e.soft} onChange={e.setSoft} />,
    ]} />
  );
}
