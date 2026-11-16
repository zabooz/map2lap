import {KERB_MAX_HEIGHT, KERB_MAX_WIDTH, KERB_MIN_WIDTH, type KerbEdit} from "../state/edits";
import styles from "./KerbFields.module.css";

/** Settings of the complete selected kerb range; each edit updates the draft and can be undone. */
export function KerbFields({edit, onChange}: {edit: KerbEdit;
  onChange: (patch: Partial<Pick<KerbEdit, "width" | "height" | "profile">>) => void}) {
  return <div id="inspect-kerb" className={styles.fields}>
    <label className={styles.field}><span>Width</span><input aria-label="Kerb width" type="number" min={KERB_MIN_WIDTH} max={KERB_MAX_WIDTH} step="0.05"
      value={edit.width} onChange={e => onChange({width: Math.min(KERB_MAX_WIDTH, Math.max(KERB_MIN_WIDTH, e.target.valueAsNumber || 0))})} /><span>m</span></label>
    <label className={styles.field}><span>Height</span><input aria-label="Kerb height" type="number" min="0" max={KERB_MAX_HEIGHT} step="0.01"
      value={edit.height} onChange={e => onChange({height: Math.min(KERB_MAX_HEIGHT, Math.max(0, e.target.valueAsNumber || 0))})} /><span>m</span></label>
    <label className={styles.field}><span>Profile</span><select aria-label="Kerb profile" value={edit.profile}
      onChange={e => onChange({profile: e.target.value as KerbEdit["profile"]})}>
      <option value="flat">Flat</option><option value="rounded">Rounded</option><option value="ribbed">Ribbed</option>
    </select></label>
  </div>;
}
