import {useCallback, useEffect, useRef, useState} from "react";
import {post} from "../../api";
import type {TrackEdits, HeightChange} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {SurfaceSelection} from "../scene/surfaces";
import type {WheelKeys} from "../types";
import type {Pin} from "./pins";

interface Crossing {x: number; z: number; upper_y: number; gap: number}
interface Answer {height?: HeightChange; crossings?: Crossing[]; error?: string}
type BridgeKind = "road" | "rail";
const GAP_WHEEL_M = 0.1;
const MIN_GRADE = 0.5, MAX_GRADE = 50, GRADE_WHEEL = 0.5;

/** One replaceable crossing correction; adjustments use the draft without this operation. */
class SeparationSession {
  private epoch = 0;
  private owned: string[] = [];
  private joined = false;
  private key = "";
  constructor(private edits: TrackEdits, private name: string) {}
  cancel() { this.epoch++; }
  clear() { this.cancel(); this.owned = []; this.joined = false; this.key = ""; }
  adopt(ids: string[]) { this.cancel(); this.owned = [...ids]; this.joined = false; this.key = ""; }
  private requestKey(points: Pin[], gap: number, kind: BridgeKind, grade: number) {
    const owned = new Set(this.owned);
    return JSON.stringify([points, gap, kind, grade, this.edits.state().heights.filter(h => !owned.has(h.id)).map(h => h.id)]);
  }
  isCurrent(points: Pin[], gap: number, kind: BridgeKind, grade: number) { return this.requestKey(points, gap, kind, grade) === this.key; }

  async apply(points: Pin[], gap: number, kind: BridgeKind, grade: number, minimum: number): Promise<"applied" | "reset" | "undone" | "cancelled" | string> {
    if (this.owned.some(id => !this.edits.state().heights.some(h => h.id === id))) {
      this.clear(); return "undone";
    }
    const key = this.requestKey(points, gap, kind, grade);
    if (key === this.key) return "cancelled";
    const epoch = ++this.epoch;
    let result: "applied" | "reset" | "undone" | "cancelled" | string = "cancelled";
    await this.edits.inTurn(async () => {
      try {
        this.edits.saveNow();
        const revision = await this.edits.saved(), base = this.edits.boundRevision();
        if (epoch !== this.epoch) return;
        if (revision === null || !base || !this.edits.canEdit()) throw new Error("The current changes could not be kept");
        if (this.owned.some(id => !this.edits.state().heights.some(h => h.id === id))) {
          this.clear(); result = "undone"; return;
        }
        if (gap <= minimum + .001) {
          if (this.owned.length && !this.edits.replaceHeight(this.owned, null, this.joined))
            throw new Error("The crossing edits changed; mark the bridge again");
          this.owned = [];
          this.joined = true;
          this.key = this.requestKey(points, gap, kind, grade);
          this.edits.saveNow();
          if (await this.edits.saved() === null) throw new Error("The crossing edit could not be kept");
          result = "reset"; return;
        }
        const answer = await post<Answer>(`/api/editor/${encodeURIComponent(this.name)}/separate`,
          {base, revision, points, gap, kind, max_grade_percent: grade, upper_percent: 100, replace: this.owned});
        if (epoch !== this.epoch) return;
        if (answer.error || !answer.height) throw new Error(answer.error ?? "The crossing could not be separated");
        if (!this.edits.replaceHeight(this.owned, answer.height, this.joined)) throw new Error("The crossing edit changed; mark it again");
        this.owned = [answer.height.id];
        this.joined = true;
        this.key = this.requestKey(points, gap, kind, grade);
        this.edits.saveNow();
        if (await this.edits.saved() === null) throw new Error("The crossing edit could not be kept");
        result = "applied";
      } catch (error) {
        if (epoch === this.epoch) result = error instanceof Error ? error.message : "Could not separate the crossing";
      }
    });
    return result;
  }
}

/** Two bridge clicks and one target gap; the server owns all geometry and safety checks. */
export function useSeparation({name, view, edits, enabled, revision, onNote}: {name: string; view: TrackView; edits: TrackEdits;
  enabled: boolean; revision: number; onNote: (note: string | null) => void}) {
  const [session] = useState(() => new SeparationSession(edits, name));
  const [points, setPoints] = useState<Pin[]>([]);
  const [kind, setKind] = useState<BridgeKind | null>(null);
  const [crossings, setCrossings] = useState<Crossing[]>([]);
  const [gap, setGapValue] = useState(0);
  const [minGap, setMinGap] = useState(0);
  const [roadGrade, setRoadGrade] = useState(15);
  const [railGrade, setRailGrade] = useState(2);
  const grade = kind === "rail" ? railGrade : roadGrade;
  const setGradeValue = kind === "rail" ? setRailGrade : setRoadGrade;
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const generation = useRef(0);
  const clear = () => {
    generation.current++;
    session.clear(); setPoints([]); setKind(null); setCrossings([]); setReady(false);
    setGapValue(0); setMinGap(0); setArmed(false);
    setStatus(null);
    void view.setRoadRegion(null); void view.setLowerRoadRegion(null);
  };
  const measure = useCallback(async (pins: Pin[], token: number, selected: BridgeKind) => {
    const answer = await post<{crossings?: Crossing[]; min_gap?: number; replace?: string[]; max_grade_percent?: number | null;
      upper_region?: SurfaceSelection; lower_region?: SurfaceSelection; error?: string}>(`/api/editor/${encodeURIComponent(name)}/separate/way`,
      {base: edits.boundRevision(), revision, points: pins, kind: selected});
    if (token !== generation.current) return;
    if (answer.error || !answer.crossings?.length) {
      const reason = answer.error ?? "No crossing found";
      setStatus(reason); onNote(reason); setReady(false); return;
    }
    try {
      await Promise.all([view.setRoadRegion(answer.upper_region ?? null), view.setLowerRoadRegion(answer.lower_region ?? null)]);
    } catch (error) {
      if (token === generation.current) onNote(error instanceof Error ? error.message : "Could not highlight these roads");
    }
    if (token !== generation.current) return;
    session.adopt(answer.replace ?? []);
    setCrossings(answer.crossings);
    setMinGap(answer.min_gap ?? Math.min(...answer.crossings.map(c => c.gap)));
    setGapValue(Math.min(...answer.crossings.map(c => c.gap)));
    setArmed(false);
    if (answer.max_grade_percent != null) (selected === "rail" ? setRailGrade : setRoadGrade)(answer.max_grade_percent);
    setReady(true);
    const measured = `${answer.crossings.length} crossing${answer.crossings.length === 1 ? "" : "s"}: ${selected === "rail" ? "rail bed gap" : "gap"} ${answer.crossings.map(c => `${c.gap.toFixed(2)} m`).join(", ")}; original ${answer.min_gap?.toFixed(2) ?? "?"} m. Shift + wheel changes Gap; Ctrl + wheel changes maximum slope.`;
    setStatus(measured); onNote(measured);
  }, [name, edits, revision, session, onNote, view]);

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
    view.setPinned((k, x, z) => {
      session.cancel();
      const token = ++generation.current;
      const next = points.map((p, i): Pin => i === k ? [x, z, view.heightOfGround(x, z)] : p);
      setPoints(next); setReady(false); setCrossings([]); setStatus(next.length === 2 ? "Measuring the crossing…" : null);
      if (next.length === 2) void measure(next, token, kind ?? "road");
    }, k => { generation.current++; session.cancel(); setPoints(points.filter((_p, i) => i !== k)); setReady(false); setCrossings([]); setStatus(null); });
    return () => view.setPinned(() => {}, () => {});
  }, [enabled, points, kind, view, session, measure]);

  useEffect(() => {
    if (!enabled || !ready || !armed || points.length !== 2 || !kind || session.isCurrent(points, gap, kind, grade)) return;
    const timer = setTimeout(() => {
      setStatus("Calculating crossing…"); onNote("Calculating crossing…");
      void session.apply(points, gap, kind, grade, minGap).then(result => {
        if (result === "undone") clear();
        else if (result === "applied") { setStatus("Crossing adjusted. Save to write the track."); onNote("Crossing adjusted. Save to write the track."); }
        else if (result === "reset") { setStatus("Crossing back at its original gap. Save to write the track."); onNote("Crossing back at its original gap. Save to write the track."); }
        else if (result !== "cancelled") { setStatus(`Not changed: ${result}`); onNote(`Not changed: ${result}`); }
      });
    }, 100);
    return () => { clearTimeout(timer); session.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- A saved revision or new settings retries against the current draft.
  }, [enabled, ready, armed, points, gap, minGap, kind, grade, revision, session]);

  useEffect(() => () => { session.clear(); view.drawPins([]); view.drawCrossings([]);
    void view.setRoadRegion(null); void view.setLowerRoadRegion(null); }, [session, view]);
  return {points, crossings, gap, minGap, grade, kind, status, clear,
    click: (x: number, z: number, y: number, selected: BridgeKind = "road") => {
      if (points.length === 2) { onNote("A and B are set. Use Mark again to start another bridge."); return; }
      if (kind && kind !== selected) { setStatus("Mark A and B on the same road or railway line"); return; }
      const next: Pin[] = [...points, [x, z, y]];
      const token = ++generation.current;
      session.cancel(); setKind(selected); setPoints(next); setReady(false); setCrossings([]); setStatus(null);
      if (next.length === 2) { setStatus("Measuring the crossing…"); onNote("Measuring the crossing…"); void measure(next, token, selected); }
    },
    setGap: (value: number) => {
      if (Number.isFinite(value) && crossings.length) {
        setGapValue(Math.min(50, Math.max(minGap, value)));
        setArmed(true);
      }
    },
    setGrade: (value: number) => {
      if (Number.isFinite(value)) setGradeValue(Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round(value * 10) / 10)));
    },
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "shift" && crossings.length) {
        setGapValue(value => Math.min(50, Math.max(minGap, Math.round((value + by * GAP_WHEEL_M) * 1000) / 1000)));
        setArmed(true);
      }
      else if (keys === "ctrl") setGradeValue(value => Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round((value + by * GRADE_WHEEL) * 10) / 10)));
    }};
}
