import {ToolAction, ToolChoice, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
import type {TrackView} from "../scene/view";
import type {useBand} from "./useBand";

const MIN_BLEND = 2, MAX_BLEND = 60;       // The existing terrain lattice bounds the smallest transition.

/** Smooth road's marking stage and automatically applied settings; a new range starts at zero. */
export function BandOptions({band, view}: {band: ReturnType<typeof useBand>; view: TrackView}) {
  const marked = band.points.length;
  return (
    <ToolOptions id={marked ? "edit-band" : "edit-road-hint"} title="Smooth road"
                 note={marked === 0 ? "Mark road: click the road where the stretch begins. Strength starts at 0%."
                   : marked === 1 ? "A is set: add a point on the road. Further points can add side-road arms."
                   : "Green marks the selected road. Red is above its fully smoothed profile; blue is below it. The faint green area is the terrain transition. Changes apply automatically; 0% restores this step, Ctrl+Z undoes it, Esc ends it."}
                 options={{
                   shift: <span>
                     <ToolChoice label="Road" on={band.strip === null} hint="Each mapped road smooths only its own ground (Shift switches)"
                                 onClick={thenView(view, () => band.setStrip(false))} />
                     <ToolChoice label="Free" on={band.strip !== null}
                                 hint="Smooth everything within a chosen width around the marked road, as Stitch road takes it, whichever mapped road the ground belongs to (Shift switches)"
                                 onClick={thenView(view, () => band.setStrip(true))} />
                   </span>,
                   ctrl: <ToolNumber label="Strength" unit="%" hint="Low values smooth short waves; higher values reach broad bumps (Ctrl + wheel)" min={0} max={100} step={5} value={band.strength}
                               onChange={band.setStrength} />,
                   alt: band.strip !== null ? <ToolNumber label="Width" unit="m" hint="Width around the marked road in Free (Alt + wheel by 0.5 m)" min={2} max={40} step={0.5}
                               value={band.strip} onChange={value => band.setStrip(value || 2)} /> : undefined,
                   ctrlAlt: band.line ? <ToolNumber label="Transition" unit="m" hint="Minimum soft transition into the terrain. Large changes need a wider fade automatically (Ctrl + Alt + wheel)" min={MIN_BLEND} max={MAX_BLEND} value={Math.round(band.blend)}
                               onChange={band.setBlend} /> : undefined,
                 }} actions={marked ? <ToolAction label="Mark road" hint="Keep the completed change and mark a new range, starting at 0%"
                   onClick={thenView(view, band.clear)} /> : undefined} />
  );
}
