import {ToolAction, ToolChoice, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
import type {KerbTool} from "./useKerbs";
import type {TrackView} from "../scene/view";
import {KERB_MAX_HEIGHT, KERB_MAX_WIDTH, KERB_MIN_WIDTH} from "../state/edits";

/** Road-side kerb placement and editing of the selected range. */
export function KerbOptions({kerb, view, onDelete}: {kerb: KerbTool; view: TrackView; onDelete: () => void}) {
  return <ToolOptions id="edit-kerb-options" title="Racing kerb (B)"
    note={kerb.busy ? "Reading the selected road…"
      : kerb.mode === "free" ? (kerb.freePoints.length
        ? `${kerb.freePoints.length} point${kerb.freePoints.length > 1 ? "s" : ""}: each click extends the kerb. Backspace removes the last point.`
        : "Free kerb: click along where the kerb should run; it lies centred on your clicks and appears from the second click.")
      : kerb.start ? "Click the road where this kerb ends."
      : kerb.current ? "The selected kerb follows the road edge. Click the road to mark another range."
      : "Click near the road edge to start a kerb, or click an existing kerb to select it."}
    options={{
      shift: <span>
        <ToolChoice label="Road" on={kerb.mode === "road"} hint="Follow a mapped road's edge between two clicks (Shift switches)" onClick={thenView(view, () => kerb.setMode("road"))} />
        <ToolChoice label="Free" on={kerb.mode === "free"} hint="Draw the kerb's road-side edge point by point, anywhere (Shift switches)" onClick={thenView(view, () => kerb.setMode("free"))} />
      </span>,
      ctrl: <ToolNumber label="Width" unit="m" hint="Kerb strip width (Ctrl + wheel)" min={KERB_MIN_WIDTH} max={KERB_MAX_WIDTH} step={0.05} value={kerb.width} onChange={kerb.setWidth} />,
      alt: <ToolNumber label="Height" unit="m" hint="Physical height above the road edge (Alt + wheel)" min={0} max={KERB_MAX_HEIGHT} step={0.01} value={kerb.height} onChange={kerb.setHeight} />,
      ctrlAlt: <label>Profile <select aria-label="Kerb profile" value={kerb.profile} onChange={e => kerb.setProfile(e.target.value as typeof kerb.profile)}>
        <option value="flat">Flat</option><option value="rounded">Rounded</option><option value="ribbed">Ribbed</option>
      </select></label>,
    }}
    actions={<>
      {kerb.current && <ToolAction id="edit-kerb-delete" label="Delete" shortcut="X"
        hint="Delete the selected kerb (X or Delete); Ctrl+Z restores it" onClick={thenView(view, onDelete)} />}
    </>} />;
}
