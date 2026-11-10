import {useEffect, useRef, type ReactNode} from "react";
import {createPortal} from "react-dom";
import styles from "./AssetLibrary.module.css";

export type LibraryTab = "textures" | "objects" | "groups";

/** One modal library keeps both existing importers and switches their content in place. */
export function AssetLibrary({tab, onTab, onClose, busy, textures, objects, groups}: {
  tab: LibraryTab | null; onTab: (tab: LibraryTab) => void; onClose: () => void; busy: boolean;
  textures: ReactNode; objects: ReactNode; groups?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null), open = tab !== null;
  const pressedBeside = useRef(false);     // (a drag from a field out over the backdrop ends in a click on the dialog too)
  useEffect(() => {
    const element = dialog.current!;
    if (open) element.showModal();
    return () => element.close();
  }, [open]);
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-label="Asset library"
    onCancel={event => {
      // Import dialogs use portals: their cancel events also reach this React parent.
      if (event.target !== event.currentTarget) return;
      event.preventDefault(); if (!busy) onClose();
    }}
    onKeyDown={event => {
      if (event.key !== "Escape" || event.defaultPrevented || !(event.target instanceof Element)
        || event.target.closest("dialog") !== event.currentTarget) return;
      // Search inputs consume Escape themselves; closing the library keeps the search for next time.
      event.preventDefault(); if (!busy) onClose();
    }}
    // The tabs and the open tab fill the dialog: only the backdrop beside it is the dialog itself. An import's backdrop,
    // a portal of its own, reaches here only through React and is not this dialog.
    onPointerDown={event => { pressedBeside.current = event.target === event.currentTarget; }}
    onClick={event => { if (pressedBeside.current && event.target === event.currentTarget && !busy) onClose(); }}>
    <div className={styles.tabs} role="tablist" aria-label="Library category">
      <button type="button" role="tab" aria-selected={tab === "textures"} disabled={busy} onClick={() => onTab("textures")}>TEXTURES</button>
      <button type="button" role="tab" aria-selected={tab === "objects"} disabled={busy} onClick={() => onTab("objects")}>OBJECTS</button>
      <button type="button" role="tab" aria-selected={tab === "groups"} disabled={busy} onClick={() => onTab("groups")}>GROUPS</button>
    </div>
    <div role="tabpanel" aria-label="Textures" hidden={tab !== "textures"}>{textures}</div>
    <div role="tabpanel" aria-label="Objects" hidden={tab !== "objects"}>{objects}</div>
    <div role="tabpanel" aria-label="Groups" hidden={tab !== "groups"}>{groups}</div>
  </dialog>, document.body);
}
