import {useEffect, useRef, type ReactNode} from "react";
import {createPortal} from "react-dom";
import styles from "./AssetLibrary.module.css";

export type LibraryTab = "textures" | "objects";

/** One modal library keeps both existing importers and switches their content in place. */
export function AssetLibrary({tab, onTab, onClose, busy, textures, objects}: {
  tab: LibraryTab | null; onTab: (tab: LibraryTab) => void; onClose: () => void; busy: boolean;
  textures: ReactNode; objects: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null), open = tab !== null;
  useEffect(() => {
    const element = dialog.current!;
    if (open) element.showModal();
    return () => element.close();
  }, [open]);
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-label="Asset library"
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className={styles.tabs} role="tablist" aria-label="Library category">
      <button type="button" role="tab" aria-selected={tab === "textures"} disabled={busy} onClick={() => onTab("textures")}>TEXTURES</button>
      <button type="button" role="tab" aria-selected={tab === "objects"} disabled={busy} onClick={() => onTab("objects")}>OBJECTS</button>
    </div>
    <div role="tabpanel" aria-label="Textures" hidden={tab !== "textures"}>{textures}</div>
    <div role="tabpanel" aria-label="Objects" hidden={tab !== "objects"}>{open && objects}</div>
  </dialog>, document.body);
}
