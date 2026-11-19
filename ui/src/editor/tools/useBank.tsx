import {useCallback, useEffect, useMemo, useState} from "react";
import {post} from "../../api";
import type {HeightChange, TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {SurfaceSelection} from "../scene/surfaces";
import type {Picked, Place, WheelKeys} from "../types";
import type {Pin} from "./pins";
import {BankSession, bankRanges, bankValues, clampBanking, clampLimit, DEFAULT_LIMIT, estimateRamp, percent, type BankAnswer, type BankFacts} from "./bank";
import {overlapping, rangeAt, useEditRanges, type EditRange} from "./editRanges";
import {Latest} from "./latest";
import {BankOptions} from "./BankOptions";
import type {ToolController} from "./toolHost";

interface Blocker {mesh: string; kind: string; x: number; y: number; z: number}
interface Way {region?: SurfaceSelection; replace?: string[]; current?: {min: number; mean: number; max: number}; length?: number;
  line?: [number, number][]; half?: number; side?: 1 | -1; e0_ends?: [number, number]; room?: {before: number; after: number};
  ahead?: [number, number][]; beyond?: [number, number][]; road_ids?: string[]; blockers?: Blocker[]; error?: string}
const BANKING_WHEEL = 0.005, LIMIT_WHEEL = 0.001;       // Ctrl + wheel: half a percentage point; Alt + wheel: a tenth
const OVERLAP = "There is banking here already; click it to change it";

interface BankArgs {name: string; view: TrackView; edits: TrackEdits; enabled: boolean; revision: number; heights: HeightChange[];
  onNote: (note: string | null) => void}

/** Stations of a polyline. Pure. */
const along = (line: [number, number][]) => line.reduce<number[]>((out, p, k) => [...out, k ? out[k - 1] + Math.hypot(p[0] - line[k - 1][0], p[1] - line[k - 1][1]) : 0], []);

/** The estimated range of a marking: A-B with the road beyond it cut to each transition's estimate (m). Pure. */
function estimated(way: Way, before: number, after: number, groundAt: (x: number, z: number) => number): EditRange | null {
  if (!way.line || way.line.length < 2) return null;
  const outward = (start: [number, number], road: [number, number][] = [], metres: number) => {
    const path = [start, ...road], s = along(path), out: [number, number][] = [];
    for (let k = 1; k < path.length && s[k - 1] < metres; k++) {
      const t = Math.min(1, (metres - s[k - 1]) / ((s[k] - s[k - 1]) || 1));
      out.push([path[k - 1][0] + t * (path[k][0] - path[k - 1][0]), path[k - 1][1] + t * (path[k][1] - path[k - 1][1])]);
    }
    return out;
  };
  const head = outward(way.line[0], way.ahead, before).reverse(), tail = outward(way.line[way.line.length - 1], way.beyond, after);
  const line = [...head, ...way.line, ...tail];
  const a = along([...head, way.line[0]]).at(-1) ?? 0, b = a + (along(way.line).at(-1) ?? 0);
  return {id: "marking", roads: way.road_ids ?? [], line: line.map(([x, z]): Place => [x, groundAt(x, z), z]), a, b,
    before: Math.min(before, a), after: Math.min(after, (along(line).at(-1) ?? 0) - b), half: way.half ?? 4};
}

/** A-B on a road (or a picked banking), its banking by Ctrl + wheel, its high edge by Shift, its edge-ramp limit by Alt +
    wheel; the server reads the road, adds the transitions beyond A and B, checks them and makes the height change. */
function useBankTool({name, view, edits, enabled, revision, heights, onNote}: BankArgs) {
  const [session] = useState(() => new BankSession(edits, body => post<BankAnswer>(`/api/editor/${encodeURIComponent(name)}/bank`, body)));
  const [points, setPoints] = useState<Pin[]>([]);
  const [way, setWay] = useState<Way | null>(null);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [banking, setBankingValue] = useState(0);
  const [side, setSide] = useState<1 | -1>(1);
  const [limit, setLimitValue] = useState(DEFAULT_LIMIT);
  const [armed, setArmed] = useState(false);       // (changes apply: the strength was set; for a picked banking any change)
  const [banked, setBanked] = useState<string | null>(null);   // (this marking's banking in the draft)
  const [status, setStatus] = useState<string | null>(null);
  const [requests] = useState(() => new Latest());   // (a road marked after Mark again, a pin moved, Esc or another tool is dropped)
  const ready = way !== null;
  const say = useCallback((text: string) => { setStatus(text); onNote(text); }, [onNote]);

  const ranges = useMemo(() => bankRanges(heights), [heights]);
  const others = useMemo(() => ranges.filter(r => r.id !== banked), [ranges, banked]);
  const ramps = way?.e0_ends && way.half
    ? [estimateRamp(way.e0_ends[0], banking, side, way.half, limit), estimateRamp(way.e0_ends[1], banking, side, way.half, limit)] : null;
  const marking = way && ramps ? estimated(way, ramps[0], ramps[1], (x, z) => view.heightOfGround(x, z)) : null;
  const crowded = marking ? overlapping(others, marking) : null;
  const fits = !!ramps && !!way?.room && ramps[0] <= way.room.before && ramps[1] <= way.room.after;
  useEditRanges({view, enabled, ranges: marking ? [...others, marking] : ranges, picked: marking ? "marking" : null, fits});

  const clear = () => {
    requests.drop(); session.clear();
    setPoints([]); setWay(null); setBlockers([]); setBankingValue(0); setArmed(false); setBanked(null); setStatus(null);
    void view.setRoadRegion(null);
  };

  /** Reads the marked road; preset: a picked banking's values (its id taken over; moved: its pins were dragged, which
      applies at once), else the marking starts at 0 %. Picking alone changes nothing. */
  const mark = useCallback(async (pins: Pin[], token: number, preset?: {id: string; bank: BankFacts; moved?: boolean}) => {
    const answer = await post<Way>(`/api/editor/${encodeURIComponent(name)}/bank/way`, {base: edits.boundRevision(), revision, points: pins});
    if (!requests.current(token)) return;
    if (answer.error || !answer.region || !answer.current) { say(answer.error ?? "This road could not be marked"); return; }
    try {
      await view.setRoadRegion(answer.region);
    } catch (error) {
      if (requests.current(token)) onNote(error instanceof Error ? error.message : "Could not highlight this road");
    }
    if (!requests.current(token)) return;
    setBlockers(answer.blockers ?? []); setWay(answer);
    if (preset) {
      session.adopt([preset.id]); setBanked(preset.id);
      const values = bankValues(preset.bank);
      setBankingValue(values.banking); setSide(values.side); setLimitValue(values.limit); setArmed(!!preset.moved);
      say(`Banking picked: ${percent(values.banking)}. Ctrl + wheel changes it, Shift the high edge, Alt + wheel the transitions; X deletes it.`);
      return;
    }
    if (overlapping(ranges, {id: "new", roads: answer.road_ids ?? [], line: (answer.line ?? []).map(([x, z]): Place => [x, 0, z]), a: 0, b: 0, before: 0, after: 0, half: answer.half ?? 4})) {
      say(OVERLAP); return;
    }
    setBankingValue(0); setSide(answer.side ?? 1); setArmed(false);
    const warning = answer.blockers?.length ? ` In the way: ${answer.blockers[0].mesh} at x=${answer.blockers[0].x}, z=${answer.blockers[0].z}.` : "";
    say(`Road marked: ${percent(Math.abs(answer.current.mean))} across now. Ctrl + wheel sets the banking between A and B; Shift switches the high edge.${warning}`);
  }, [name, edits, revision, session, requests, onNote, view, say, ranges]);

  useEffect(() => {
    if (!enabled) return;
    view.drawPins(points.map(([x, z, y]) => [x, y ?? view.heightOfGround(x, z), z]));
    return () => view.drawPins([]);
  }, [enabled, points, view]);

  useEffect(() => {
    if (!enabled || !way?.line) return;
    // (the high and low edge show from the marking on, before anything is changed: which way Ctrl + wheel will tilt it)
    view.drawBankArrows(way.line.map(([x, z]) => [x, view.heightOfGround(x, z), z]), way.half ?? 0, side);
    return () => view.drawBankArrows(null, 0, 0);
  }, [enabled, way, side, view]);

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
      setPoints(next); setWay(null); setBlockers([]); setStatus(next.length === 2 ? "Marking the road…" : null);
      const picked = banked ? {id: banked, bank: {...(heights.find(h => h.id === banked) as HeightChange & {bank: BankFacts}).bank,
        banking, side, limit}, moved: true} : undefined;
      if (next.length === 2) void mark(next, token, picked);
    }, k => { requests.drop(); session.cancel(); setPoints(points.filter((_p, i) => i !== k)); setWay(null); setBlockers([]); setStatus(null); });
    return () => view.setPinned(() => {}, () => {});
  }, [enabled, points, view, session, requests, mark, banked, heights, banking, side, limit]);

  useEffect(() => {
    if (!enabled || !ready || !armed || crowded || points.length !== 2 || session.isCurrent(points, banking, side, limit)) return;
    const timer = setTimeout(() => {
      say("Banking road…");
      void session.apply(points, banking, side, limit).then(result => {
        if (result === "undone") clear();
        else if (result === "applied") { setBanked(session.applied()); say(`Road banked to ${percent(banking)} between A and B. Save to write the track.`); }
        else if (result !== "cancelled") say(`Not changed: ${result}`);
      });
    }, 100);
    return () => { clearTimeout(timer); session.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- A saved revision or new values retry against the current draft.
  }, [enabled, ready, armed, crowded, points, banking, side, limit, revision, session]);

  useEffect(() => () => { session.clear(); view.drawPins([]); view.drawBlockers([]); view.drawBankArrows(null, 0, 0);
    void view.setRoadRegion(null); }, [session, view]);

  const remove = () => {
    if (!banked || points.length !== 2) return false;
    say("Restoring the road…");
    void session.restore(points).then(result => {
      if (result === "reset" || result === "undone") { clear(); say("Banking deleted: the road as it was built. Save to write the track."); }
      else if (result !== "cancelled") say(`Not changed: ${result}`);
    });
    return true;
  };

  return {points, way, banking, side, limit, banked, ramps, fits, clear, remove,
    /** What the bar says: an overlap of the estimated transitions first (nothing is applied then), else the last word. */
    status: crowded ? OVERLAP : status,
    /** A click on a road: a highlighted banking is picked; else A, then B of a new marking. */
    click: (x: number, z: number, y: number, at: Place) => {
      const range = rangeAt(ranges, at[0], at[1], at[2]);
      if (range && range.id !== banked) {
        const bank = (heights.find(h => h.id === range.id) as HeightChange & {bank: BankFacts}).bank;
        clear();
        const pins = bank.points.map(([px, pz, py]): Pin => [px, pz, py]);
        const token = requests.next();
        setPoints(pins); say("Reading the banking…");
        void mark(pins, token, {id: range.id, bank});
        return;
      }
      const start = points.length === 2 ? [] : points;
      if (points.length === 2) clear();
      const next: Pin[] = [...start, [x, z, y]];
      const token = requests.next();
      session.cancel(); setPoints(next); setWay(null); setBlockers([]); setStatus(null);
      if (next.length === 2) { say("Marking the road…"); void mark(next, token); }
    },
    setBanking: (value: number) => { if (Number.isFinite(value) && ready) { setBankingValue(clampBanking(value)); setArmed(true); } },
    setLimit: (value: number) => { if (Number.isFinite(value)) { setLimitValue(clampLimit(value)); if (banked) setArmed(true); } },
    flip: () => { if (ready) { setSide(value => (value === 1 ? -1 : 1)); if (banked) setArmed(true); } },
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "ctrl" && ready) { setBankingValue(value => clampBanking(value + by * BANKING_WHEEL)); setArmed(true); }
      else if (keys === "alt") { setLimitValue(value => clampLimit(value + by * LIMIT_WHEEL)); if (banked) setArmed(true); }
    }};
}

export type BankTool = ReturnType<typeof useBankTool>;

/** Bank road (U) as a tool: A-B on a road, banking by Ctrl + wheel, high edge by Shift, edge-ramp limit by Alt + wheel; a
    highlighted banking is picked by a click and X or Delete deletes it. */
export function useBank(args: BankArgs) {
  const bank = useBankTool(args);
  const controller: ToolController = {
    click: (p: Picked | null) => { if (p?.road) bank.click(p.road[0], p.road[1], p.position[1], p.position); },
    wheel: bank.wheel, takesWheel: true, toggleMode: bank.flip, clear: bank.clear,
    removable: !!bank.banked, remove: bank.remove,
    options: <BankOptions bank={bank} view={args.view} />,
  };
  return {...bank, controller};
}
