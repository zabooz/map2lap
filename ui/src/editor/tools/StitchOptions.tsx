import {ToolAction, ToolChoice, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
import type {TrackView} from "../scene/view";
import type {useStitch} from "./useStitch";

/** A and B on one road, the proposed width and what Apply replaces. */
export function StitchOptions({stitch, view}: {stitch: ReturnType<typeof useStitch>; view: TrackView}) {
  const p = stitch.proposal;
  const sides = p ? (["left", "right"] as const).filter(side => p.overlap[side] > 0.05) : [];
  const overlap = sides.length ? ` Another road's deck reaches ${sides.map(side => `${p!.overlap[side].toFixed(2)} m into the ${side} edge`).join(" and ")}: cut back to the stitch's edge; a narrower width leaves it whole.` : "";
  const note = stitch.error ?? (stitch.busy ? "Reading the road between A and B…"
    : p ? `Width ${p.stitch.width[0].toFixed(1)} → ${p.stitch.width[1].toFixed(1)} m (auto: ${p.reason}). ${p.rows} rows, ${p.deck_rows} on the deck, `
      + `largest height change ${p.change.toFixed(2)} m; ${p.marks}.${overlap}`
      + (p.replaces.length ? ` Grown over ${p.replaces.length} existing stitch${p.replaces.length > 1 ? "es" : ""}: Apply replaces ${p.replaces.length > 1 ? "them" : "it"} with this one.`
        : " Apply replaces the road surface between A and B.")
    : stitch.points.length === 1 ? "Click B on the same road (deck, tunnel floor or ground)."
    : "Click A on a road: on the ground, a bridge deck or a tunnel floor.");
  return <ToolOptions id="edit-stitch" title="Stitch road" note={note}
    options={{
      shift: <ToolNumber label="Width" unit="m" hint="Road width of the rebuilt surface (Shift + wheel by 0.1 m); Auto takes the ground road's"
        min={2} max={40} step={0.1} value={stitch.shown ?? 0} onChange={value => stitch.setWidth(value || null)} />,
      ctrl: <ToolChoice label="Auto width" on={stitch.width === null} hint="Take the width of the ground road at A and B, not a bridge's mapped width"
        onClick={thenView(view, () => stitch.setWidth(null))} />,
    }}
    actions={<>
      <ToolAction id="edit-stitch-apply" label="Apply" hint="Replace the road surface between A and B; Ctrl+Z undoes it" disabled={!p || stitch.busy}
        onClick={thenView(view, stitch.apply)} />
      {stitch.points.length > 0 && <ToolAction label="Mark again" hint="Forget A and B" onClick={thenView(view, stitch.clear)} />}
    </>} />;
}
