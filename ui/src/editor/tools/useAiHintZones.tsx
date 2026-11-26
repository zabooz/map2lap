import {useEffect, useEffectEvent, useMemo, useRef, useState} from "react";
import {hintSteps} from "../aiHints";
import {post} from "../../api";
import type {TrackView} from "../scene/view";
import {effectiveRange, laneFractions, marginRange, projectGuideMark, type MarginLocation, type MarginMark, type MarginPreview, type MarginSide} from "../scene/aiMargins";
import type {Place} from "../types";
import type {AiMargin, ScalarHint, TrackEdits} from "../state/edits";
import {thenView, ToolChoice, ToolOptions} from "./ToolOptions";
import {TOOLS, toolTitle, type ToolDef} from "./toolDefs";
import type {ToolController} from "./toolHost";
import type {useAiLine} from "./useAiLine";
import styles from "./AiMargins.module.css";

type AiLine = ReturnType<typeof useAiLine>;
type Marked = {laneKey: string; id: string; a: MarginMark; b?: MarginMark};
const anchors = ({id,a,b}: Marked) => ({id, start:a.anchor, end:(b ?? a).anchor});

function SideField({side, value, effective, enabled, change, view}: {
  side: MarginSide; value: number | null; effective?: string; enabled: boolean; change: (value: number | null) => void; view: TrackView;
}) {
  const label = side === "left" ? "Left" : "Right";
  return <fieldset disabled={!enabled} className={styles.side} aria-label={label} title={`${side === "left" ? "Shift" : "Ctrl"} + wheel adjusts the ${side} reserve by 0.05 m`}>
    <span>{label}</span>
    <ToolChoice label="Off" hint={`Leave the ${side} side unset for this zone`} on={value === null}
      onClick={thenView(view, () => change(null))} />
    <input key={String(value)} aria-label={label} type="number" min="0" max="1" step="0.05" placeholder="m"
      defaultValue={value ?? ""} onBlur={event => {
        const field = event.currentTarget;
        if (field.validity.valid) change(field.value === "" ? null : field.valueAsNumber);
        else field.value = value?.toString() ?? "";
      }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); view.focus(); } }} />
    {effective && <span className={styles.value}>{effective} m</span>}
  </fieldset>;
}

function ScalarField({limit, value, enabled, change, view}: {
  limit: boolean; value?: number; enabled: boolean; change: (value: number) => void; view: TrackView;
}) {
  const label = limit ? "Limit (km/h)" : "Factor";
  const shown = value == null ? "" : !limit && Number(value.toFixed(2)) === value ? value.toFixed(2) : String(value);
  return <label className={styles.side}>{label}
    <input key={shown} type="number" step="any" disabled={!enabled} defaultValue={shown}
      placeholder={limit ? "km/h" : "1.00"} onBlur={event => {
        const field = event.currentTarget;
        if (Number.isFinite(field.valueAsNumber) && (!limit || field.valueAsNumber > 0)) change(field.valueAsNumber);
        else field.value = shown;
      }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); view.focus(); } }} />
  </label>;
}

/** Mark, inspect and adjust stretches of the installed line. The active type owns picking and the value controls. */
export function useAiHintZones(name: string, view: TrackView, edits: TrackEdits, zones: AiMargin[], tool: ToolDef, editable: boolean,
                            ai: AiLine, onNote: (text:string) => void): ToolController {
  const {guide, lane, refresh, reloadInstalled} = ai;
  const kind = tool.hintKind;
  const enabled = tool.group === "ai" && (kind ? editable : zones.length > 0);
  const margins = useMemo(() => zones.filter(m => (m.kind ?? "danger") === kind), [zones, kind]);
  const [draftMarks, setMarked] = useState<Marked | null>(null);
  const [justAdded, setJustAdded] = useState<Marked | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{fraction: number; owner?: MarginLocation} | null>(null);
  const [reply, setReply] = useState<{zones: AiMargin[]; refresh: string; revision: string; data?: MarginPreview; error?: string}>();
  const revision = lane?.revision;
  const laneKey = `${revision}:${refresh}`;
  const marked = draftMarks?.laneKey === laneKey ? draftMarks : null;
  const correspondence = useRef<{revision: string; metres: number[] | null} | null>(null);
  const reported = useRef<{track:string; errors:Map<string,string>} | null>(null);
  useEffect(() => {
    if (!enabled || !revision) return;
    let current = true;
    // One route metre per installed sample can dwarf the hint sections. Reuse it until the lane is refreshed.
    const withMetres = correspondence.current?.revision !== laneKey;
    void post<MarginPreview & {changed?: boolean}>(`/api/editor/${encodeURIComponent(name)}/ai-line/margins`, {aiMargins: zones, revision, withMetres}).then(answer => {
      if (!current) return;
      if (answer.changed) {
        setReply(undefined);
        setHover(null);
        setMarked(null);
        correspondence.current = null;
        reloadInstalled();
        return;
      }
      if (!answer.sections || !answer.margins) {
        setReply({zones, refresh, revision, error: answer.error || "AI hints could not be loaded."});
        return;
      }
      const errors = new Map<string,string>();
      for (const {id} of zones) {
        const error = answer.margins[id]?.error ?? answer.guideMarks?.[id]?.error;
        if (!error) continue;
        errors.set(id,error);
        if (reported.current?.track !== name || reported.current.errors.get(id) !== error) onNote(error);
      }
      reported.current = {track:name, errors};
      if (withMetres) correspondence.current = {revision: laneKey, metres: answer.metres ?? null};
      setReply({zones, refresh, revision, data: {...answer as MarginPreview, metres: correspondence.current?.metres}});
    });
    return () => { current = false; };
  }, [enabled, revision, zones, refresh, laneKey, name, reloadInstalled, onNote]);
  // Place all types together. Switching tools can pick its zones immediately, and
  // changing a value keeps the existing endpoints pickable during the request.
  const sameLane = reply && reply.refresh === refresh && reply.revision === revision ? reply : null;
  const current = sameLane?.zones === zones ? sameLane : null;
  const preview = sameLane?.data;
  const projection = useMemo(() => {
    if (!enabled || !lane || !preview?.unplaced || !guide) return;
    const points = Array.from(lane.x, (x,i): Place => [x,lane.y[i],lane.z[i]]);
    return {points, stations:laneFractions(points, lane.closed)};
  }, [enabled, lane, preview?.unplaced, guide]);
  const ranges = useMemo(() => {
    if (!enabled) return [];
    const saved = new Map(sameLane?.zones.map(zone => [zone.id,zone]));
    const drawn = zones.map(m => {
      const placed = saved.get(m.id);
      const anchorsMatch = placed?.start === m.start && placed.end === m.end;
      const range = marginRange(m, anchorsMatch ? preview?.margins[m.id] : undefined);
      range.active = (m.kind ?? "danger") === kind;
      if (!anchorsMatch && justAdded?.laneKey === laneKey && justAdded.id === m.id &&
          justAdded.a.anchor === m.start && justAdded.b?.anchor === m.end) {
        range.start = justAdded.a.fraction;
        range.end = justAdded.b.fraction;
        range.unapplied = preview?.metres === null;
      }
      const marks = anchorsMatch ? preview?.guideMarks?.[m.id] : undefined;
      if (projection && guide && marks) {
        range.unapplied = true;
        range.error = marks.error;
        for (const key of ["start","end"] as const) {
          if (marks[key]) range[key] = projectGuideMark(marks[key],guide,projection.points,projection.stations);
        }
      }
      return range;
    });
    if (marked) drawn.push({id:marked.id, kind:kind === "danger" ? undefined : kind, start:marked.a.fraction, end:(marked.b ?? marked.a).fraction,
      unapplied: preview?.metres === null, marking: marked.b ? "stretch" : "start"});
    return drawn;
  }, [enabled, kind, zones, marked, preview, sameLane, projection, guide, justAdded, laneKey]);
  const choose = (id: string | null) => { setSelected(id); setMarked(null); };
  const addEvent = useEffectEvent((mark: MarginMark) => {
    if (marked && !marked.b) {
      const pair = {...marked, b:mark};
      if (kind === "corner" || kind === "braking") {
        setJustAdded(pair);
        edits.addAiMargin({...anchors(pair), kind, value:1});
        choose(pair.id);
      } else setMarked(pair);
    } else {
      const id = crypto.randomUUID();
      setSelected(id);
      setMarked({laneKey, id, a:mark});
    }
  });
  const resizeEvent = useEffectEvent((id: string, key: "start"|"end", mark: MarginMark) => {
    if (marked?.id === id) {
      setMarked({...marked, [key === "start" ? "a" : "b"]:mark});
      return;
    }
    const old = edits.state().aiMargins.find(m => m.id === id)?.[key];
    if (old && (old.metre !== mark.anchor.metre || old.level !== mark.anchor.level))
      edits.updateAiMargin(id, {[key]:mark.anchor});
  });
  const session = useRef<ReturnType<TrackView["editAiMargins"]>>(null);
  useEffect(() => {
    if (!enabled || !lane || !preview) return;
    const drawing = view.editAiMargins(guide, preview, ranges, !!kind, editable, mark => addEvent(mark), setHover,
      (id,key,mark) => resizeEvent(id,key,mark));
    session.current = drawing;
    return () => { drawing?.dispose(); session.current = null; };
  }, [enabled, kind, editable, lane, preview, guide, ranges, view]);
  useEffect(() => { session.current?.setSelected(selected); }, [selected, enabled, lane, preview, guide, ranges, view]);

  const existing = margins.find(m => m.id === selected);
  const target = existing ?? (marked?.b ? anchors(marked) : null);
  const location = ranges.find(r => r.id === selected);
  const store = (values: {kind: ScalarHint; value: number} |
                         {kind?: undefined; left?: number | null; right?: number | null}, wheelField?: MarginSide | "value") => {
    if (!target) return;
    if (edits.state().aiMargins.some(m => m.id === target.id)) {
      edits.updateAiMargin(target.id, values, wheelField);
    } else if (marked?.b) {
      const zone = values.kind ? {...anchors(marked), ...values}
        : {...anchors(marked), left:values.left ?? null, right:values.right ?? null};
      setJustAdded(marked);
      edits.addAiMargin(zone, wheelField);
      choose(target.id);
    }
  };
  const change = (side: MarginSide, value: number | null, wheel = false) => {
    if (!target || kind !== "danger") return;
    const stored = edits.state().aiMargins.find(m => m.id === target.id);
    if ((stored?.[side] ?? null) === value) return;
    store({[side]:value}, wheel ? side : undefined);
  };
  const scalarSections = kind && kind !== "danger" ? current?.data?.scalars?.[kind] : undefined;
  const values = current?.data?.sections ?? [];
  const effective = (side: MarginSide) => {
    if (!target) return;
    if (!current?.data || location?.start == null || location.end == null || location.start === location.end) return;
    const a = location.start, b = location.end;
    return lane?.closed || a < b ? effectiveRange(values, side, a, b) : effectiveRange(values, side, b, a);
  };
  const shownHover = enabled && current?.data ? hover : null;
  const atHover = ([a,b]: number[]) => !!shownHover && a <= shownHover.fraction &&
    (shownHover.fraction < b || (b === 1 && shownHover.fraction === 1));
  const section = values.find(atHover);
  const scalar = scalarSections?.find(atHover);
  const message = current?.error || ai.lineMessage || (!lane && "Loading the installed AI line …");
  const note = preview?.unplaced === "manual" ? "Not applied: the AI line was replaced by hand"
    : preview?.unplaced === "recalculate" || (marked && preview?.metres === null) ? `Not yet applied · Recalculate the AI line to place ${kind === "danger" ? "danger zones" : "AI hints"}` : undefined;
  const steps = kind && kind !== "danger" ? hintSteps(kind) : null;
  const sideField = (side: MarginSide) => <SideField side={side} value={existing?.[side] ?? null} enabled={!!target}
    effective={effective(side)} view={view} change={value => change(side, value)} />;
  return {
    click: (_picked, shift, switchTool) => {
      const id = session.current?.click(shift);
      if (!id) return;
      const zone = zones.find(zone => zone.id === id);
      if (!zone) return;
      const next = TOOLS.find(def => def.hintKind === (zone.kind ?? "danger"));
      if (next && next.tool !== tool.tool) switchTool(next.tool);
      choose(id);
    },
    activate: ai.controller.activate,
    takesWheel: !!target || margins.length > 0,
    wheel: (keys, by) => {
      if (keys === "alt" && margins.length) {
        const first = ({start,end}: MarginLocation) => lane?.closed ? start ?? Infinity : Math.min(start ?? Infinity, end ?? Infinity);
        const ordered = ranges.filter(r => r.active && !r.marking).sort((a,b) => first(a) - first(b));
        const index = ordered.findIndex(r => r.id === selected);
        const next = index < 0 ? (by > 0 ? 0 : ordered.length-1) : (index+by+ordered.length)%ordered.length;
        choose(ordered[next].id);
        session.current?.focus(ordered[next].id);
      } else if (kind === "danger" && target && (keys === "shift" || keys === "ctrl")) {
        const side = keys === "shift" ? "left" : "right";
        const latest = edits.state().aiMargins.find(m => m.id === target.id)?.[side];
        const step = (latest == null ? -1 : Math.round(latest*20)) + by;
        change(side, step < 0 ? null : Math.min(step,20)/20, true);
      } else if (kind && kind !== "danger" && target && steps && (keys === "shift" || keys === "ctrl")) {
        const latest = edits.state().aiMargins.find(m => m.id === target.id)?.value ?? 0;
        const value = Number((latest + by * steps[keys]).toPrecision(15));
        if (Number.isFinite(value) && (kind !== "speedLimit" || value > 0)) store({kind, value}, "value");
      }
    },
    removable: !!existing || !!marked,
    remove: () => {
      if (!existing && !marked) return false;
      if (existing) edits.removeAiMargin(existing.id);
      // Keep its ID selected so Undo restores the same correction.
      setMarked(null);
      return true;
    },
    clear: () => { choose(null); setHover(null); ai.controller.clear?.(); },
    options: <ToolOptions wheel id={`${tool.id}-set`} title={toolTitle(tool)} note={location?.error || note} options={{
      shift: kind === "danger" ? sideField("left") : steps && <>
        <ScalarField key={selected} enabled={!!target} limit={kind === "speedLimit"} value={existing?.value} view={view}
          change={value => { if (kind) store({kind, value}); }} />
        <span title="Shift + wheel">±{steps.shift}{steps.unit}</span></>,
      ctrl: kind === "danger" ? sideField("right") : steps && <span title="Ctrl + wheel">±{steps.ctrl}{steps.unit}</span>,
      alt: <span title="Alt + wheel visits the previous or next zone of this type">Cycle zones</span>,
    }} actions={<>
      {message ? <span role="status">{message}</span> : !target && guide && preview && <span>{marked ? "Click B on the AI line" : "Click A on the AI line"}</span>}
      {target && <span>{Math.round(target.start.metre)}–{Math.round(target.end.metre)} m</span>}
      {shownHover && kind === "danger" && <span className={styles.hover}>
        Left {section?.[2] ? `${section[2].toFixed(2)} m` : "Off"} · Right {section?.[3] ? `${section[3].toFixed(2)} m` : "Off"}
      </span>}
      {scalar && <span className={styles.hover}>{kind === "speedLimit" ? `${scalar[2]} km/h` : `× ${scalar[2]}`}</span>}
    </>} />,
  };
}
