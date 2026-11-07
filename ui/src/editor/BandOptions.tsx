import {ToolNumber, ToolOptions} from "./ToolOptions";
import type {useBand} from "./useBand";

const MIN_WIDTH = 3, MAX_WIDTH = 60;       // (useBand, trackband: a band's)

/** What to do next while a band is being marked, and with smoothing on what Smooth can be set to. */
export function BandOptions({band, smoothing}: {band: ReturnType<typeof useBand>; smoothing: boolean}) {
  const marked = band.points.length;
  return (
    <ToolOptions id={marked ? "edit-band" : "edit-road-hint"} title={smoothing ? "Smooth" : "Mark road"}
                 note={marked === 0 ? "Click the road where the stretch begins."
                   : marked === 1 ? "A is set: click B further along the road (Esc drops it)."
                   : `${smoothing ? "Enter takes it, Esc drops it." : "Marked: choose a tool for it, Esc drops it."} A click on the road adds a pin: drag it, right-click takes it away.`}
                 options={smoothing && band.line ? [
                   <ToolNumber label="Strength" unit="%" hint="From short waves only, the hills stay, up to a calm line from A to B (Shift + wheel)" min={0} max={100} step={5} value={band.strength}
                               onChange={band.setStrength} />,
                   <ToolNumber label="Width" unit="m" hint="How wide the band is: at first the road's own (Ctrl + wheel)" min={MIN_WIDTH} max={MAX_WIDTH} value={Math.round(band.width)}
                               onChange={width => band.setWidth(width || null)} />,
                 ] : []} />
  );
}
