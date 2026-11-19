import {ToolAction, ToolNumber, ToolOptions, thenView} from "./ToolOptions";
import type {TrackView} from "../scene/view";
import type {BankTool} from "./useBank";
import {MAX_BANKING, MAX_LIMIT, MIN_LIMIT, percent} from "./bank";

/** A fully banked stretch A-B, its banking and high edge, and the transitions before A and after B. */
export function BankOptions({bank, view}: {bank: BankTool; view: TrackView}) {
  const stage = bank.points.length, now = bank.way?.current;
  const note = ["Click A on the road to bank, or a highlighted banking to change it.", "Click B: A to B is banked fully, the transitions lie beyond.",
    now ? `Now ${percent(Math.abs(now.mean))} across. Ctrl + wheel sets the banking; Shift switches the high edge; Alt + wheel the transitions.`
      : "Marking the road…"][stage];
  const transitions = bank.ramps ? `Transitions about ${bank.ramps[0]} m before A, ${bank.ramps[1]} m after B${bank.fits ? "" : " (not enough road)"}` : null;
  return <ToolOptions id="edit-bank-set" title="Bank road" note={`${bank.status ?? note}${transitions ? ` ${transitions}.` : ""}`}
    options={bank.way ? {
      shift: <ToolAction id="edit-bank-side" label={bank.side === 1 ? "Left edge high" : "Right edge high"}
        hint="Which edge is high, as A runs to B; Shift switches it" onClick={bank.flip} />,
      ctrl: <ToolNumber label="Banking" unit="%" hint="Cross slope from A to B; Ctrl + wheel changes it by 0.5 percentage points"
        min={0} max={MAX_BANKING * 100} step={0.1} value={Math.round(bank.banking * 1000) / 10} onChange={value => bank.setBanking(value / 100)} />,
      alt: <ToolNumber label="Edge ramp" unit="%" hint="How steeply an edge may rise against the centreline along a transition; Alt + wheel changes it by 0.1"
        min={MIN_LIMIT * 100} max={MAX_LIMIT * 100} step={0.1} value={Math.round(bank.limit * 1000) / 10} onChange={value => bank.setLimit(value / 100)} />,
    } : []}
    actions={stage ? <>
      <ToolAction id="edit-bank-restore" label="Restore original" hint="Delete this banking: the road as it was built (X or Delete)"
        disabled={!bank.banked} onClick={() => { bank.remove(); }} />
      <ToolAction label="Mark again" hint="Keep this banking and mark another road stretch" onClick={thenView(view, bank.clear)} />
    </> : undefined} />;
}
