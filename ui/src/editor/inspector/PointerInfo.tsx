import {useState} from "react";
import type {Hovered} from "../types";
import {HoverBox} from "./HoverBox";
import styles from "./PointerInfo.module.css";

const KEY = "map2lap.pointerDetails";

/** Whether this browser last left the pointer details open; they start collapsed to the position. */
function storedOpen() {
  try { return localStorage.getItem(KEY) === "open"; } catch { return false; }
}

/** Pointer facts above the 3D view. Its summary takes clicks; the table lets the camera receive mouse input below it. */
export function PointerInfo({hovered}: {hovered: Hovered | null}) {
  const [expanded, setExpanded] = useState(storedOpen), [over, setOver] = useState(false);
  const [last, setLast] = useState(hovered);
  if (hovered && hovered !== last) setLast(hovered);
  const shown = hovered ?? (over ? last : null);
  const toggle = (open: boolean) => {
    setExpanded(open);
    try { localStorage.setItem(KEY, open ? "open" : "closed"); } catch { /* Blocked storage: keep it for this visit. */ }
  };
  return <aside id="inspect-pointer" aria-label="Under pointer" className={styles.overlay}
    hidden={!shown} onPointerEnter={() => setOver(true)} onPointerLeave={() => setOver(false)}>
    <details open={expanded} onToggle={event => toggle(event.currentTarget.open)}>
      <summary className={styles.toggle} aria-expanded={expanded} aria-label={expanded ? "Collapse pointer details" : "Expand pointer details"}>
        {expanded ? "Under pointer" : "Position"}
      </summary>
      {expanded && <HoverBox hovered={shown} />}
    </details>
    {!expanded && <HoverBox hovered={shown} positionOnly />}
  </aside>;
}
