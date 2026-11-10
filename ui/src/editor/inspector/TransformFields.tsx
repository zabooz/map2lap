import {CM, HEIGHT_STEP, PERCENT, TURN_STEP} from "../tools/Move";
import type {Placement} from "../tools/placing";
import styles from "./TransformFields.module.css";

/** What the fields read and set: Move's numbers of the picked objects (useMove). */
interface Transform {
  targets: string[];
  shown: Placement;
  setTurn: (degrees: number) => void;
  setHeight: (cm: number) => void;
  setSize: (percent: number) => void;
  reset: () => void;
}

/** One number to type, with its unit. */
function Field({label, unit, hint, value, min, max, step, onChange}: {label: string; unit: string; hint: string; value: number; min: number; max: number; step: number;
                                                                     onChange: (value: number) => void}) {
  return <label className={styles.field} title={hint}><span className={styles.label}>{label}</span>
    <input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(e.target.valueAsNumber || 0)} /><span className={styles.unit}>{unit}</span></label>;
}

/** The picked objects' turn, raise and size in the inspector, typed in as in Transform's bar (the same numbers, each change one Undo); with
    several picked they show the first and set them all. Nothing movable picked: nothing. */
export function TransformFields({move: m}: {move: Transform}) {
  if (!m.targets.length) return null;
  return <div id="inspect-transform" className={styles.fields}>
    <Field label="Turn" unit="°" hint="How far it is turned from how it was built, counter-clockwise" min={-180} max={180} step={TURN_STEP}
           value={m.shown.turn} onChange={m.setTurn} />
    <Field label="Raise" unit="cm" hint="How far it is raised from where it was built" min={-10000} max={10000} step={HEIGHT_STEP * CM}
           value={Math.round(m.shown.y * CM)} onChange={m.setHeight} />
    <Field label="Size" unit="%" hint="Its size, against how it was built" min={10} max={1000} step={5}
           value={Math.round(m.shown.scale * PERCENT)} onChange={size => m.setSize(Math.max(10, size))} />
    <button type="button" className={styles.reset} title="Back where and as it was built" onClick={m.reset}>Reset</button>
  </div>;
}
