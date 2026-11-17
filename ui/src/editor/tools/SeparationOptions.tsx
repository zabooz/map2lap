import {ToolAction, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
import type {TrackView} from "../scene/view";
import type {useSeparation} from "./useSeparation";

/** Two fixed road ends and the desired crossing clearance. */
export function SeparationOptions({separation, view}: {separation: ReturnType<typeof useSeparation>; view: TrackView}) {
  const stage = separation.points.length;
  const subject = separation.kind === "rail" ? "railway line" : "road";
  const note = ["Click A on a bridge or the ground road beneath it before the crossing.", `Click B after the crossing on the same ${subject}.`,
    `Gap starts at the measured ${separation.kind === "rail" ? "ballast-to-road" : "road-to-road"} clearance. Shift + wheel changes Gap; Ctrl + wheel changes maximum slope.`][stage];
  return <ToolOptions id="edit-separation" title="Separate crossing" note={separation.status ?? note}
    options={[
      stage === 2 ? <ToolNumber key="gap" label="Gap" unit="m" hint="Target clearance, down to the original gap; Shift + wheel changes it by 0.1 m" min={separation.minGap} max={50} step={0.001}
        value={separation.gap} onChange={separation.setGap} /> : null,
      <ToolNumber key="grade" label={stage === 2 ? separation.selectedSide === "lower" ? "Lower slope" : "Bridge slope" : "Max slope"} unit="%"
        hint="Maximum slope of the added height ramp on the marked road; Ctrl + wheel changes it by 0.5 percentage points" min={0.5} max={50} step={0.5}
        value={separation.grade} onChange={separation.setGrade} />,
    ]}
    actions={stage ? <ToolAction label="Mark again" hint="Keep this correction and mark another crossing"
      onClick={thenView(view, separation.clear)} /> : undefined} />;
}
