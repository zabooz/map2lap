import {useEffect, useEffectEvent, useMemo, useRef, useState} from "react";
import {post} from "../../api";
import type {TrackView} from "../scene/view";
import {effectiveRange, laneFractions, marginRange, projectGuideMark, type MarginLocation, type MarginMark, type MarginPreview, type MarginSide} from "../scene/aiMargins";
import type {Place} from "../types";
import type {AiMargin, TrackEdits} from "../state/edits";
import {thenView, ToolChoice, ToolOptions} from "./ToolOptions";
import type {ToolController} from "./toolHost";
import type {useAiLine} from "./useAiLine";
import styles from "./AiMargins.module.css";

type AiLine = ReturnType<typeof useAiLine>;
type Marked = {laneKey: string; id: string; a: MarginMark; b?: MarginMark};
const pendingMargin = ({id,a,b}: Marked): AiMargin => ({id, start:a.anchor, end:(b ?? a).anchor, left:null, right:null});

function SideField({side, value, effective, applied, enabled, change, view}: {
  side: MarginSide; value: number | null; effective?: string; applied: boolean; enabled: boolean; change: (value: number | null) => void; view: TrackView;
}) {
  const label = side === "left" ? "Left" : "Right";
  return <fieldset disabled={!enabled} className={styles.side} aria-label={label}>
    <span>{label}</span>
    <ToolChoice label="Auto" hint={`Use the automatic ${side} margin`} on={value === null}
      onClick={thenView(view, () => change(null))} />
    <input key={String(value)} aria-label={label} type="number" min="0" max="1" step="0.05" placeholder="m"
      defaultValue={value ?? ""} onBlur={event => {
        const field = event.currentTarget;
        if (field.validity.valid) change(field.value === "" ? null : field.valueAsNumber);
        else field.value = value?.toString() ?? "";
      }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); view.focus(); } }} />
    {effective && <span className={styles.value}>{effective} m · {applied ? value === null ? "Auto" : "set" : "current"}</span>}
  </fieldset>;
}

/** Mark, inspect and adjust stretches of the installed line. A new pair stays local until a side is set. */
export function useAiMargins(name: string, view: TrackView, edits: TrackEdits, margins: AiMargin[], enabled: boolean,
                            ai: AiLine, onNote: (text:string) => void): ToolController {
  const {guide, lane, refresh, reloadInstalled} = ai;
  const [draftMarks, setMarked] = useState<Marked | null>(null);
  const [justAdded, setJustAdded] = useState<Marked | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{fraction: number; owner?: MarginLocation} | null>(null);
  const [reply, setReply] = useState<{margins: AiMargin[]; refresh: string; revision: string; data?: MarginPreview; error?: string}>();
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
    void post<MarginPreview & {changed?: boolean}>(`/api/editor/${encodeURIComponent(name)}/ai-line/margins`, {aiMargins: margins, revision, withMetres}).then(answer => {
      if (!current) return;
      if (answer.changed) {
        setReply(undefined);
        setHover(null);
        setMarked(null);
        correspondence.current = null;
        reloadInstalled();
        return;
      }
      if (!answer.sections || !answer.margins || !answer.auto) {
        setReply({margins, refresh, revision, error: answer.error || "Side margins could not be loaded."});
        return;
      }
      const errors = new Map<string,string>();
      for (const {id} of margins) {
        const error = answer.margins[id]?.error ?? answer.guideMarks?.[id]?.error;
        if (!error) continue;
        errors.set(id,error);
        if (reported.current?.track !== name || reported.current.errors.get(id) !== error) onNote(error);
      }
      reported.current = {track:name, errors};
      if (withMetres) correspondence.current = {revision: laneKey, metres: answer.metres ?? null};
      setReply({margins, refresh, revision, data: {...answer as MarginPreview, metres: correspondence.current?.metres}});
    });
    return () => { current = false; };
  }, [enabled, revision, margins, refresh, laneKey, name, reloadInstalled, onNote]);
  // Side-value edits leave the anchors in place. Keep those bands pickable while
  // the server computes the new effective widths for this revision.
  const sameLane = reply && reply.refresh === refresh && reply.revision === revision ? reply : null;
  const current = sameLane?.margins === margins ? sameLane : null;
  const preview = sameLane?.data;
  const projection = useMemo(() => {
    if (!lane || !preview?.unplaced || !guide) return;
    const points = Array.from(lane.x, (x,i): Place => [x,lane.y[i],lane.z[i]]);
    return {points, stations:laneFractions(points, lane.closed)};
  }, [lane, preview?.unplaced, guide]);
  const ranges = useMemo(() => {
    const drawn = margins.map(m => {
      const placed = sameLane?.margins.find(saved => saved.id === m.id);
      const anchorsMatch = placed?.start === m.start && placed.end === m.end;
      const range = marginRange(m, anchorsMatch ? preview?.margins[m.id] : undefined);
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
    if (marked) drawn.push({...marginRange(pendingMargin(marked), {start: marked.a.fraction, end: (marked.b ?? marked.a).fraction}),
      unapplied: preview?.metres === null, marking: marked.b ? "stretch" : "start"});
    return drawn;
  }, [margins, marked, preview, sameLane, projection, guide, justAdded, laneKey]);
  const choose = (id: string | null) => { setSelected(id); setMarked(null); };
  const selectEvent = useEffectEvent(choose);
  const addEvent = useEffectEvent((mark: MarginMark) => {
    if (marked && !marked.b) setMarked({...marked, b: mark});
    else {
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
  // A stale merged section can still contain a value just changed back to Auto.
  // Until the reply arrives, apply the live recipe to the lane's automatic baseline.
  const drawingPreview = useMemo((): MarginPreview | undefined => preview && !current
    ? {...preview, sections:preview.auto.map(([a,b,w]) => [a,b,w,w])} : preview, [preview,current]);
  const session = useRef<ReturnType<TrackView["editAiMargins"]>>(null);
  useEffect(() => {
    if (!enabled || !lane || !drawingPreview) return;
    const drawing = view.editAiMargins(guide, drawingPreview, ranges, mark => addEvent(mark), id => selectEvent(id), setHover,
      (id,key,mark) => resizeEvent(id,key,mark));
    session.current = drawing;
    return () => { drawing?.dispose(); session.current = null; };
  }, [enabled, lane, drawingPreview, guide, ranges, view]);
  useEffect(() => { session.current?.setSelected(selected); }, [selected, enabled, lane, drawingPreview, guide, ranges, view]);

  const existing = margins.find(m => m.id === selected);
  const target = existing ?? (marked?.b ? pendingMargin(marked) : null);
  const location = ranges.find(r => r.id === selected);
  const change = (side: MarginSide, value: number | null, wheel = false) => {
    if (!target) return;
    const stored = edits.state().aiMargins.find(m => m.id === target.id);
    if ((stored ?? target)[side] === value) return;
    const wheelSide = wheel ? side : undefined;
    if (stored) edits.updateAiMargin(stored.id, {[side]: value}, wheelSide);
    else {
      setJustAdded(marked);
      edits.addAiMargin({...target, [side]: value}, wheelSide);
      choose(target.id);
    }
  };
  const values = current?.data?.sections ?? [];
  const effective = (side: MarginSide) => {
    if (!target) return;
    if (!current?.data || location?.start == null || location.end == null || location.start === location.end) return;
    const a = location.start, b = location.end;
    return lane?.closed || a < b ? effectiveRange(values, side, a, b) : effectiveRange(values, side, b, a);
  };
  const shownHover = enabled && current?.data ? hover : null;
  const section = shownHover && values.find(([a,b]) => a <= shownHover.fraction &&
    (shownHover.fraction < b || (b === 1 && shownHover.fraction === 1)));
  const message = ai.guideError || current?.error || ai.lineMessage ||
    (ai.preparing || !preview ? "Preparing the AI line for editing …" : undefined);
  const note = preview?.unplaced === "manual" ? "Not applied: the AI line was replaced by hand"
    : preview?.unplaced === "recalculate" || (marked && preview?.metres === null) ? "Not yet applied · Recalculate the AI line to place side margins" : undefined;
  return {
    click: () => session.current?.click(), activate: ai.controller.activate,
    takesWheel: !!target || margins.length > 0,
    wheel: (keys, by) => {
      if (keys === "alt" && margins.length) {
        const first = ({start,end}: MarginLocation) => lane?.closed ? start ?? Infinity : Math.min(start ?? Infinity, end ?? Infinity);
        const ordered = ranges.filter(r => !r.marking).sort((a,b) => first(a) - first(b));
        const index = ordered.findIndex(r => r.id === selected);
        const next = index < 0 ? (by > 0 ? 0 : ordered.length-1) : (index+by+ordered.length)%ordered.length;
        choose(ordered[next].id);
        session.current?.focus(ordered[next].id);
      } else if (target && (keys === "shift" || keys === "ctrl")) {
        const side = keys === "shift" ? "left" : "right";
        const latest = edits.state().aiMargins.find(m => m.id === target.id) ?? target;
        const step = (latest[side] == null ? -1 : Math.round(latest[side]*20)) + by;
        change(side, step < 0 ? null : Math.min(step,20)/20, true);
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
    options: <ToolOptions id="edit-ai-margin-set" title="Side margin" note={location?.error || note} actions={<>
      {message ? <span role="status">{message}</span> : !target && <span>{marked ? "Click B on the AI line" : "Click A on the AI line"}</span>}
      {target && <span>{Math.round(target.start.metre)}–{Math.round(target.end.metre)} m</span>}
      {(["left","right"] as const).map(side => <SideField key={side} side={side} value={target?.[side] ?? null} enabled={!!target}
        effective={effective(side)} applied={!location?.error && !preview?.unplaced} view={view} change={value => change(side, value)} />)}
      {shownHover && <span className={styles.hover}>
        Left {(section?.[2] ?? 0).toFixed(2)} m · Right {(section?.[3] ?? 0).toFixed(2)} m
      </span>}
    </>} />,
  };
}
