import {ToolAction, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
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
                   : "Orange marks the selected roads; the faint area is the terrain transition. Add or drag points for branches. Changes apply automatically; 0% restores this step, Ctrl+Z undoes it, Esc ends it."}
                 options={[
                   <ToolNumber label="Strength" unit="%" hint="From short waves only up to a calm joined surface across the selected roads (Shift + wheel)" min={0} max={100} step={5} value={band.strength}
                               onChange={band.setStrength} />,
                   ...(band.line ? [<ToolNumber key="blend" label="Transition" unit="m" hint="Minimum soft transition into the terrain. Large changes need a wider fade automatically (Ctrl + wheel)" min={MIN_BLEND} max={MAX_BLEND} value={Math.round(band.blend)}
                               onChange={band.setBlend} />] : []),
                 ]} actions={marked ? <ToolAction label="Mark road" hint="Keep the completed change and mark a new range, starting at 0%"
                   onClick={thenView(view, band.clear)} /> : undefined} />
  );
}
