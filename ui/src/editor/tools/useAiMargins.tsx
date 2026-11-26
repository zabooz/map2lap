import {useEffect, useEffectEvent, useMemo, useRef, useState} from "react";
import {post} from "../../api";
import type {TrackView} from "../scene/view";
import {effectiveRange, marginRange, type MarginLocation, type MarginMark, type MarginPreview, type MarginSide} from "../scene/aiMargins";
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
                            ai: AiLine): ToolController {
  const {guide, lane, refresh, reloadInstalled} = ai;
  const [draftMarks, setMarked] = useState<Marked | null>(null);
  const [markNew, setMarkNew] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{fraction: number; owner?: MarginLocation} | null>(null);
  const [reply, setReply] = useState<{margins: AiMargin[]; refresh: string; revision: string; data?: MarginPreview; error?: string}>();
  const revision = lane?.revision;
  const laneKey = `${revision}:${refresh}`;
  const marked = draftMarks?.laneKey === laneKey ? draftMarks : null;
  const correspondence = useRef<{revision: string; metres: number[] | null} | null>(null);
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
      if (withMetres) correspondence.current = {revision: laneKey, metres: answer.metres ?? null};
      setReply({margins, refresh, revision, data: {...answer as MarginPreview, metres: correspondence.current?.metres}});
    });
    return () => { current = false; };
  }, [enabled, revision, margins, refresh, laneKey, name, reloadInstalled]);
  const current = reply?.margins === margins && reply.refresh === refresh && reply.revision === revision ? reply : null;
  const preview = current?.data;
  const ranges = useMemo(() => {
    const drawn = margins.map(m => marginRange(m, preview?.margins[m.id]));
    if (marked) drawn.push({...marginRange(pendingMargin(marked), {start: marked.a.fraction, end: (marked.b ?? marked.a).fraction}),
      marking: marked.b ? "stretch" : "start"});
    return drawn;
  }, [margins, marked, preview]);
  const choose = (id: string | null) => { setSelected(id); setMarked(null); setMarkNew(false); };
  const selectEvent = useEffectEvent(choose);
  const addEvent = useEffectEvent((mark: MarginMark) => {
    setMarkNew(false);
    if (marked && !marked.b) setMarked({...marked, b: mark});
    else {
      const id = crypto.randomUUID();
      setSelected(id);
      setMarked({laneKey, id, a:mark});
    }
  });
  const session = useRef<ReturnType<TrackView["editAiMargins"]>>(null);
  useEffect(() => {
    if (!enabled || !lane || !preview) return;
    const drawing = view.editAiMargins(guide, preview, ranges, mark => addEvent(mark), id => selectEvent(id), setHover);
    session.current = drawing;
    return () => { drawing?.dispose(); session.current = null; };
  }, [enabled, lane, preview, guide, ranges, view]);
  useEffect(() => { session.current?.setSelected(selected); }, [selected, enabled, lane, preview, guide, ranges, view]);

  const existing = margins.find(m => m.id === selected);
  const target = existing ?? (marked?.b ? pendingMargin(marked) : null);
  const location = ranges.find(r => r.id === selected);
  const change = (side: MarginSide, value: number | null) => {
    if (!target || target[side] === value) return;
    if (existing) edits.updateAiMargin(existing.id, {[side]: value});
    else {
      edits.addAiMargin({...target, [side]: value});
      choose(target.id);
    }
  };
  const values = preview?.sections ?? [];
  const effective = (side: MarginSide) => {
    if (!target) return;
    if (!preview || location?.start == null || location.end == null || location.start === location.end) return;
    const a = location.start, b = location.end;
    return lane?.closed || a < b ? effectiveRange(values, side, a, b) : effectiveRange(values, side, b, a);
  };
  const shownHover = enabled && preview ? hover : null;
  const section = shownHover && values.find(([a,b]) => a <= shownHover.fraction &&
    (shownHover.fraction < b || (b === 1 && shownHover.fraction === 1)));
  const message = ai.guideError || current?.error || ai.lineMessage ||
    (ai.preparing || !preview ? "Preparing the AI line for editing …" : undefined);
  const note = preview?.unplaced === "manual" ? "Not applied: the AI line was replaced by hand"
    : preview?.unplaced === "recalculate" ? "Recalculate the AI line to place side margins" : undefined;
  return {
    click: () => session.current?.click(markNew), activate: ai.controller.activate,
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
      {margins.length > 0 && guide && preview && <ToolChoice label="New stretch" hint="Mark A and B even inside another margin" on={markNew}
        onClick={thenView(view, () => { choose(null); setMarkNew(true); })} />}
      {margins.length > 0 && <select aria-label="Side margin stretch" value={existing?.id ?? ""} onChange={event => {
        choose(event.currentTarget.value || null); view.focus();
      }}>
        <option value="">Pick a stretch</option>
        {margins.map(m => <option key={m.id} value={m.id}>
          {Math.round(m.start.metre)}–{Math.round(m.end.metre)} m{preview?.margins[m.id]?.error ? " · Not applied" : ""}
        </option>)}
      </select>}
      {(["left","right"] as const).map(side => <SideField key={side} side={side} value={target?.[side] ?? null} enabled={!!target}
        effective={effective(side)} applied={!location?.error && !preview?.unplaced} view={view} change={value => change(side, value)} />)}
      {shownHover && <span className={styles.hover} title={shownHover.owner?.error}>
        Left {(section?.[2] ?? 0).toFixed(2)} m · Right {(section?.[3] ?? 0).toFixed(2)} m
        {shownHover.owner?.error && ` · ${shownHover.owner.error}`}
      </span>}
    </>} />,
  };
}
