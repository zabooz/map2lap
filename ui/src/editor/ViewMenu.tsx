import styles from "./ViewMenu.module.css";
import type {MenuAt} from "./view";

const WIDTH = 230, HEIGHT = 160;    // (about the menu's size: it opens left of or above the click where it wouldn't fit)

/** What a right click on an object offers, where it was clicked, kept within the view. onSmooth: it was on a marked stretch of road, else null. mark: "Mark all …" or null
    (houses, what can't be deleted). A click beside it closes it. */
export function ViewMenu({at, mark, canDelete, onSmooth, onMark, onDelete, onClose}: {
  at: MenuAt;
  mark: string | null;
  canDelete: boolean;
  onSmooth: (() => void) | null;
  onMark: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const left = at.x + WIDTH > at.width ? Math.max(0, at.x - WIDTH) : at.x;
  const top = at.y + HEIGHT > at.height ? Math.max(0, at.y - HEIGHT) : at.y;
  const then = (action: () => void) => () => { onClose(); action(); };
  return (
    <div className={styles.back} onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}
         onContextMenu={e => e.preventDefault()}>{/* (the right click that opened it ends with this event, over the layer) */}
      <div id="view-menu" className={styles.menu} role="menu" style={{left, top}}>
        {onSmooth && <button type="button" role="menuitem" onClick={then(onSmooth)}>Smooth</button>}
        <button type="button" role="menuitem" disabled title="Comes later">Replace…</button>
        <button type="button" role="menuitem" disabled title="Comes later">Edit…</button>
        {mark && <button type="button" role="menuitem" onClick={then(onMark)}>{mark}</button>}
        <button type="button" role="menuitem" disabled={!canDelete} onClick={then(onDelete)}>Delete</button>
      </div>
    </div>
  );
}
