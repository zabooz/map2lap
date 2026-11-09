import styles from "./ViewMenu.module.css";
import type {MenuAt} from "./view";

const WIDTH = 230;

/** Actions at the right-clicked object or ground. onSmooth: the click is on a smoothable road, else null. mark: "Mark all …" or null
    (houses, what can't be deleted). A click beside it closes it. */
export function ViewMenu({at, mark, object, canDelete, onEdit, onReplace, onMove, onDuplicate, onSmooth, onMark, onDelete, onClose}: {
  at: MenuAt;
  mark: string | null;
  object: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onReplace: (() => void) | null;
  onMove: (() => void) | null;
  onDuplicate: (() => void) | null;
  onSmooth: (() => void) | null;
  onMark: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const left = at.x + WIDTH > at.width ? Math.max(0, at.x - WIDTH) : at.x;
  const height = 10 + 28 * (1 + Number(!!onSmooth) + (object ? 4 + Number(!!mark) : 0)); // Padding/border and 28 px rows.
  const top = at.y + height > at.height ? Math.max(0, at.y - height) : at.y;
  const then = (action: () => void) => () => { onClose(); action(); };
  return (
    <div className={styles.back} onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}
         onContextMenu={e => e.preventDefault()}>{/* (the right click that opened it ends with this event, over the layer) */}
      <div id="view-menu" className={styles.menu} role="menu" style={{left, top}}>
        {onSmooth && <button type="button" role="menuitem" onClick={then(onSmooth)}>Smooth road</button>}
        <button type="button" role="menuitem" onClick={then(onEdit)}>Edit…</button>
        {object && <>
        <button type="button" role="menuitem" disabled={!onReplace} onClick={then(() => onReplace?.())}>Replace…</button>
        <button type="button" role="menuitem" disabled={!onMove} onClick={then(() => onMove?.())}>Move</button>
        <button type="button" role="menuitem" disabled={!onDuplicate} onClick={then(() => onDuplicate?.())}>Duplicate</button>
        {mark && <button type="button" role="menuitem" onClick={then(onMark)}>{mark}</button>}
        <button type="button" role="menuitem" disabled={!canDelete} onClick={then(onDelete)}>Delete</button>
        </>}
      </div>
    </div>
  );
}
