// Stitch road (prototype): A and B on one mapped carriageway; the server proposes one continuous surface between them.
import {useEffect, useState} from "react";
import {post} from "../../api";
import type {StitchEdit, TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {Place, WheelKeys} from "../types";

type Proposal = {stitch: Omit<StitchEdit, "id">; line: Place[]; auto: [number, number]; reason: string; marks: string;
  deck_rows: number; rows: number; change: number; overlap: {left: number; right: number}; replaces: string[]};
const decimetres = (value: number) => Math.round(value * 10) / 10;

/** Two road clicks propose a rebuilt stretch; Apply adds it to the draft as one Undo step. */
export function useStitch({name, view, edits, stitches, enabled, onNote}: {name: string; view: TrackView; edits: TrackEdits;
  stitches: StitchEdit[]; enabled: boolean; onNote: (text: string | null) => void}) {
  const [points, setPoints] = useState<Place[]>([]);           // [x, z, y] clicks
  const [width, setWidthState] = useState<number | null>(null);  // null: automatic
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => { setPoints([]); setProposal(null); setError(null); onNote(null); };

  const ask = async (pins: Place[], chosen: number | null) => {
    setBusy(true); setError(null);
    const result = await post<Proposal>(`/api/editor/${encodeURIComponent(name)}/stitch/way`,
      {base: edits.boundRevision(), points: pins, width: chosen, existing: stitches});
    setBusy(false);
    if (result.error || !result.stitch) { setProposal(null); setError(result.error ?? "No road stretch found"); return; }
    setProposal(result as Proposal);
  };

  const click = (x: number, z: number, y: number) => {
    if (!enabled || busy) return;
    if (points.length !== 1) { setPoints([[x, z, y]]); setProposal(null); setError(null); return; }
    const pins: Place[] = [points[0], [x, z, y]];
    setPoints(pins);
    void ask(pins, width);
  };

  const setWidth = (value: number | null) => {
    const next = value === null ? null : Math.min(40, Math.max(2, value));
    setWidthState(next);
    if (points.length === 2) void ask(points, next);
  };

  const apply = () => {
    if (!proposal) return;
    edits.addStitch({...proposal.stitch, id: crypto.randomUUID()}, proposal.replaces);
    setPoints([]); setProposal(null);
    onNote("Road stitched. Ctrl+Z undoes it; mark A again for another stretch.");
  };

  useEffect(() => {
    if (!enabled) return;
    view.drawPins(points.map(([x, z, y]) => [x, y, z]));
    const average = proposal ? (proposal.stitch.width[0] + proposal.stitch.width[1]) / 2 : 0;
    view.drawBand(proposal ? proposal.line : null, average);
    return () => { view.drawPins([]); view.drawBand(null, 0); };
  }, [enabled, view, points, proposal]);

  const shown = width ?? (proposal ? decimetres((proposal.auto[0] + proposal.auto[1]) / 2) : null);
  return {
    points, busy, error, proposal, width, shown, clear, click, apply, setWidth,
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "shift") setWidth(decimetres((shown ?? 8) + by * 0.1));
    },
  };
}
