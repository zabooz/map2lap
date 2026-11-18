import {ToolAction, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
import type {TrackView} from "../scene/view";
import type {useSeparation} from "./useSeparation";

/** Two fixed road ends and a signed middle height change. */
export function SeparationOptions({separation, view}: {separation: ReturnType<typeof useSeparation>; view: TrackView}) {
  const stage = separation.points.length;
  const subject = separation.kind === "rail" ? "railway line" : "road";
  const note = ["Click A on the road to bend, or on a railway bridge.", `Click B on the same ${subject}; both ends stay fixed.`,
    separation.kind === "rail" ? "Shift + wheel changes the railway crossing gap." : "Positive height raises the middle; negative height lowers it. Shift + wheel changes height."][stage];
  return <ToolOptions id="edit-separation" title={separation.kind === "rail" ? "Raise railway bridge" : "Bend road"} note={separation.status ?? note}
    options={[
      stage === 2 ? <ToolNumber key="height" label={separation.kind === "rail" ? "Gap" : "Height"} unit="m"
        hint={separation.kind === "rail" ? "Rail bed clearance; Shift + wheel changes it by 0.1 m" : "Middle height relative to the source road; positive raises, negative lowers. Shift + wheel changes it by 0.1 m"}
        min={separation.kind === "rail" ? separation.minGap : -50} max={50} step={0.001}
        value={separation.gap} onChange={separation.setGap} /> : null,
      <ToolNumber key="grade" label="Max slope" unit="%"
        hint="Maximum slope of the added height ramp on the marked road; Ctrl + wheel changes it by 0.5 percentage points" min={0.5} max={50} step={0.5}
        value={separation.grade} onChange={separation.setGrade} />,
    ]}
    actions={stage ? <ToolAction label="Mark again" hint="Keep this correction and mark another road stretch"
      onClick={thenView(view, separation.clear)} /> : undefined} />;
}
