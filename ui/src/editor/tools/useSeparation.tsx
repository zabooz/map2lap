import {useCallback, useEffect, useState} from "react";
import {post} from "../../api";
import type {TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {SurfaceSelection} from "../scene/surfaces";
import type {Picked, WheelKeys} from "../types";
import type {Pin} from "./pins";
import {SeparationSession, type BridgeKind} from "./separation";
import {Latest} from "./latest";
import {SeparationOptions} from "./SeparationOptions";
import type {ToolController} from "./toolHost";
import {RAIL_BRIDGE} from "./sections";

interface Crossing {x: number; z: number; upper_y: number; gap: number}
interface Blocker {mesh: string; kind: string; x: number; y: number; z: number}
const HEIGHT_WHEEL_M = 0.1;
const MIN_GRADE = 0.5, MAX_GRADE = 50, GRADE_WHEEL = 0.5;

interface SeparationArgs {name: string; view: TrackView; edits: TrackEdits; enabled: boolean; revision: number; onNote: (note: string | null) => void}

/** Two bridge clicks and one target gap; the server owns all geometry and safety checks. */
function useSeparationTool({name, view, edits, enabled, revision, onNote}: SeparationArgs) {
  const [session] = useState(() => new SeparationSession(edits, (path, body) => post(`/api/editor/${encodeURIComponent(name)}/${path}`, body)));
  const [points, setPoints] = useState<Pin[]>([]);
  const [kind, setKind] = useState<BridgeKind | null>(null);
  const [selectedSide, setSelectedSide] = useState<"upper" | "lower">("upper");
  const [crossings, setCrossings] = useState<Crossing[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [gap, setGapValue] = useState(0);
  const [minGap, setMinGap] = useState(0);
  const [roadGrade, setRoadGrade] = useState(15);
  const [railGrade, setRailGrade] = useState(2);
  const grade = kind === "rail" ? railGrade : roadGrade;
  const setGradeValue = kind === "rail" ? setRailGrade : setRoadGrade;
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [requests] = useState(() => new Latest());     // (a road marked or measured after Mark again, a pin moved or Esc is dropped)
  const clear = () => {
    requests.drop();
    session.clear(); setPoints([]); setKind(null); setSelectedSide("upper"); setCrossings([]); setBlockers([]); setReady(false);
    setGapValue(0); setMinGap(0); setArmed(false);
    setStatus(null);
    void view.setRoadRegion(null); void view.setLowerRoadRegion(null);
  };
  const measure = useCallback(async (pins: Pin[], token: number, selected: BridgeKind) => {
    if (selected === "road") {
      const answer = await post<{region?: SurfaceSelection; blockers?: Blocker[]; delta?: number; replace?: string[];
        max_grade_percent?: number | null; error?: string}>(`/api/editor/${encodeURIComponent(name)}/bend/way`,
        {base: edits.boundRevision(), revision, points: pins});
      if (!requests.current(token)) return;
      if (answer.error || !answer.region) {
        const reason = answer.error ?? "This road could not be marked";
        setStatus(reason); onNote(reason); setReady(false); return;
      }
      try {
        await Promise.all([view.setRoadRegion(answer.region), view.setLowerRoadRegion(null)]);
      } catch (error) {
        if (requests.current(token)) onNote(error instanceof Error ? error.message : "Could not highlight this road");
      }
      if (!requests.current(token)) return;
      session.adopt(answer.replace ?? []);
      setSelectedSide("upper"); setCrossings([]); setBlockers(answer.blockers ?? []);
      setMinGap(0); setGapValue(answer.delta ?? 0); setArmed(false);
      if (answer.max_grade_percent != null) setRoadGrade(answer.max_grade_percent);
      setReady(true);
      const warning = answer.blockers?.length ? ` In the way: ${answer.blockers[0].mesh} at x=${answer.blockers[0].x}, z=${answer.blockers[0].z}.` : "";
      const measured = `Road marked. Shift + wheel raises or lowers its middle; A and B stay fixed. Ctrl + wheel changes maximum slope.${warning}`;
      setStatus(measured); onNote(measured);
      return;
    }
    const answer = await post<{crossings?: Crossing[]; blockers?: Blocker[]; min_gap?: number; replace?: string[]; max_grade_percent?: number | null;
      selected_side?: "upper" | "lower";
      upper_region?: SurfaceSelection; lower_region?: SurfaceSelection; error?: string}>(`/api/editor/${encodeURIComponent(name)}/separate/way`,
      {base: edits.boundRevision(), revision, points: pins, kind: selected});
    if (!requests.current(token)) return;
    if (answer.error || !answer.crossings?.length) {
      const reason = answer.error ?? "No crossing found";
      setStatus(reason); onNote(reason); setReady(false); return;
    }
    try {
      await Promise.all([view.setRoadRegion(answer.upper_region ?? null), view.setLowerRoadRegion(answer.lower_region ?? null)]);
    } catch (error) {
      if (requests.current(token)) onNote(error instanceof Error ? error.message : "Could not highlight these roads");
    }
    if (!requests.current(token)) return;
    session.adopt(answer.replace ?? []);
    setSelectedSide(answer.selected_side ?? "upper");
    setCrossings(answer.crossings);
    setBlockers(answer.blockers ?? []);
    setMinGap(answer.min_gap ?? Math.min(...answer.crossings.map(c => c.gap)));
    setGapValue(Math.min(...answer.crossings.map(c => c.gap)));
    setArmed(false);
    if (answer.max_grade_percent != null) (selected === "rail" ? setRailGrade : setRoadGrade)(answer.max_grade_percent);
    setReady(true);
    const action = answer.selected_side === "lower" ? "The marked ground road moves down." : "The marked bridge moves up.";
    const warning = answer.blockers?.length ? ` In the way: ${answer.blockers.length >= 16 ? "at least " : ""}${answer.blockers.length} rail/tunnel part${answer.blockers.length === 1 ? "" : "s"}, marked red. First: ${answer.blockers[0].mesh} at x=${answer.blockers[0].x}, z=${answer.blockers[0].z}.` : "";
    const measured = `${answer.crossings.length} crossing${answer.crossings.length === 1 ? "" : "s"}: rail bed gap ${answer.crossings.map(c => `${c.gap.toFixed(2)} m`).join(", ")}; original ${answer.min_gap?.toFixed(2) ?? "?"} m. ${action}${warning} Shift + wheel changes Gap; Ctrl + wheel changes maximum slope.`;
    setStatus(measured); onNote(measured);
  }, [name, edits, revision, session, requests, onNote, view]);

  useEffect(() => {
    if (!enabled) return;
    view.drawPins(points.map(([x, z, y]) => [x, y ?? view.heightOfGround(x, z), z]));
    return () => view.drawPins([]);
  }, [enabled, points, view]);

  useEffect(() => {
    if (!enabled) return;
    view.drawCrossings(crossings.map(c => [c.x, c.upper_y, c.z]));
    return () => view.drawCrossings([]);
  }, [enabled, crossings, view]);

  useEffect(() => {
    if (!enabled) return;
    view.drawBlockers(blockers.map(b => [b.x, b.y, b.z]));
    return () => view.drawBlockers([]);
  }, [enabled, blockers, view]);

  useEffect(() => {
    if (!enabled) return;
    view.setPinned((k, x, z) => {
      session.cancel();
      const token = requests.next();
      const next = points.map((p, i): Pin => i === k ? [x, z, view.heightOfGround(x, z)] : p);
      setPoints(next); setReady(false); setCrossings([]); setBlockers([]); setStatus(next.length === 2 ? "Marking the road…" : null);
      if (next.length === 2) void measure(next, token, kind ?? "road");
    }, k => { requests.drop(); session.cancel(); setPoints(points.filter((_p, i) => i !== k)); setReady(false); setCrossings([]); setBlockers([]); setStatus(null); });
    return () => view.setPinned(() => {}, () => {});
  }, [enabled, points, kind, view, session, requests, measure]);

  useEffect(() => {
    if (!enabled || !ready || !armed || points.length !== 2 || !kind || session.isCurrent(points, gap, kind, grade)) return;
    const timer = setTimeout(() => {
      const waiting = kind === "rail" ? "Calculating crossing…" : "Bending road…";
      setStatus(waiting); onNote(waiting);
      void session.apply(points, gap, kind, grade, minGap).then(result => {
        if (result === "undone") clear();
        else if (result === "applied") { const note = kind === "rail" ? "Crossing adjusted. Save to write the track." : "Road height adjusted. Save to write the track."; setStatus(note); onNote(note); }
        else if (result === "reset") { const note = kind === "rail" ? "Crossing back at its original gap. Save to write the track." : "Road back at its original height. Save to write the track."; setStatus(note); onNote(note); }
        else if (result !== "cancelled") { setStatus(`Not changed: ${result}`); onNote(`Not changed: ${result}`); }
      });
    }, 100);
    return () => { clearTimeout(timer); session.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- A saved revision or new settings retries against the current draft.
  }, [enabled, ready, armed, points, gap, minGap, kind, grade, revision, session]);

  useEffect(() => () => { session.clear(); view.drawPins([]); view.drawCrossings([]); view.drawBlockers([]);
    void view.setRoadRegion(null); void view.setLowerRoadRegion(null); }, [session, view]);
  return {points, crossings, gap, minGap, grade, kind, selectedSide, status, clear,
    click: (x: number, z: number, y: number, selected: BridgeKind = "road") => {
      if (points.length === 2) { onNote("A and B are set. Use Mark again to start another road stretch."); return; }
      if (kind && kind !== selected) { setStatus("Mark A and B on the same road or railway line"); return; }
      const next: Pin[] = [...points, [x, z, y]];
      const token = requests.next();
      session.cancel(); setKind(selected); setPoints(next); setReady(false); setCrossings([]); setBlockers([]); setStatus(null);
      if (next.length === 2) { const note = selected === "rail" ? "Measuring the crossing…" : "Marking the road…"; setStatus(note); onNote(note); void measure(next, token, selected); }
    },
    setGap: (value: number) => {
      if (Number.isFinite(value) && ready) {
        setGapValue(kind === "rail" ? Math.min(50, Math.max(minGap, value)) : Math.min(50, Math.max(-50, value)));
        setArmed(true);
      }
    },
    setGrade: (value: number) => {
      if (Number.isFinite(value)) setGradeValue(Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round(value * 10) / 10)));
    },
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "shift" && ready) {
        setGapValue(value => Math.min(50, Math.max(kind === "rail" ? minGap : -50, Math.round((value + by * HEIGHT_WHEEL_M) * 1000) / 1000)));
        setArmed(true);
      }
      else if (keys === "ctrl") setGradeValue(value => Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round((value + by * GRADE_WHEEL) * 10) / 10)));
    }};
}

export type SeparationTool = ReturnType<typeof useSeparationTool>;

/** Bend road (J) as a tool: A and B on a road or a railway bridge, the height or gap by Shift + wheel, the slope by Ctrl + wheel. */
export function useSeparation(args: SeparationArgs) {
  const separation = useSeparationTool(args);
  const controller: ToolController = {
    click: (p: Picked | null) => {
      if (p?.road) separation.click(p.road[0], p.road[1], p.position[1]);
      else if (p?.inspection?.hovered.object && RAIL_BRIDGE.test(p.inspection.hovered.object)) separation.click(p.position[0], p.position[2], p.position[1], "rail");
    },
    wheel: separation.wheel, takesWheel: true, clear: separation.clear,
    options: <SeparationOptions separation={separation} view={args.view} />,
  };
  return {...separation, controller};
}
