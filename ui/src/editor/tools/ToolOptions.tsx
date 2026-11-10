import type {ReactNode} from "react";
import {useHeld} from "./held";
import styles from "./ToolOptions.module.css";
import type {TrackView} from "../scene/view";

/** action, and the keys back to the view. */
export const thenView = (view: TrackView, action: () => void) => () => {
  action();
  view.focus();
};

const PLACES = [{keys: "Shift", held: "shift"}, {keys: "Ctrl", held: "ctrl"}, {keys: "Alt", held: "alt"}, {keys: "Ctrl+Alt", held: "ctrlAlt"}] as const;

/** One place of the bar: its key, lit while that is held, and what it changes. */
function Place({keys, held, children}: {keys: string; held: boolean; children: ReactNode}) {
  return <span className={`${styles.place}${held ? ` ${styles.held}` : ""}`}><kbd className={styles.key} aria-hidden="true">{keys}</kbd>{children}</span>;
}

/** What the tool on can be set to: a bar of its own at the bottom middle of the view. With every tool its options reach the same keys from left to right: the first Shift, the
    next Ctrl, then Alt, then Ctrl+Alt; a number by its key with the wheel (the tool's wheel, in that order too). actions: buttons of no key, behind them. id: its name for what
    asks for it. note: what to do next. */
export function ToolOptions({id, title, note, options = [], actions}: {id?: string; title: string; note?: string; options?: ReactNode[]; actions?: ReactNode}) {
  const held = useHeld();
  return (
    <div id={id} className={styles.options} data-tool-options="">
      <div className={styles.controls}>
        <b className={styles.title}>{title}</b>
        {options.map((option, k) => <Place key={PLACES[k].keys} keys={PLACES[k].keys} held={held[PLACES[k].held]}>{option}</Place>)}
        {actions}
      </div>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}

/** A value of a tool to read, changed by its key. hint: its tooltip. */
export function ToolValue({label, hint, value}: {label: string; hint: string; value: string}) {
  return <span className={styles.number} title={hint}>{label} <b className={styles.value}>{value}</b></span>;
}

/** A button of a tool that does one thing. hint: its tooltip. shortcut: the key that does it too, shown beside the label. */
export function ToolAction({id, label, hint, shortcut, disabled, onClick}: {id?: string; label: string; hint: string; shortcut?: string; disabled?: boolean;
                                                                            onClick: () => void}) {
  return <button type="button" id={id} title={hint} disabled={disabled} onClick={onClick}>
    {label}{shortcut && <kbd className={`${styles.key} ${styles.shortcut}`} aria-hidden="true">{shortcut}</kbd>}</button>;
}

/** One of a tool's either-or choices. hint: its tooltip. */
export function ToolChoice({label, on, hint, onClick}: {label: string; on: boolean; hint: string; onClick: () => void}) {
  return <button type="button" className={on ? styles.on : ""} aria-pressed={on} title={hint} onClick={onClick}>{label}</button>;
}

/** A number of a tool, with its unit. hint: its tooltip. onChange: 0 for what is no number. */
export function ToolNumber({label, unit, hint, value, min, max, step, onChange}: {label: string; unit: string; hint: string; value: number; min: number; max: number; step?: number;
                                                                                  onChange: (value: number) => void}) {
  return (
    <label className={styles.number} title={hint}>{label} <input type="number" min={min} max={max} step={step} value={value}
           onChange={e => onChange(e.target.valueAsNumber || 0)} /> {unit}</label>
  );
}
