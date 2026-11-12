import {useState} from "react";
import type {Hovered} from "../types";
import {HoverBox} from "./HoverBox";
import styles from "./PointerInfo.module.css";

/** Pointer facts above the 3D view. Its summary takes clicks; the table lets the camera receive mouse input below it. */
export function PointerInfo({hovered, inspectorCollapsed}: {hovered: Hovered | null; inspectorCollapsed: boolean}) {
  const [expanded, setExpanded] = useState(true), [over, setOver] = useState(false);
  const [last, setLast] = useState(hovered);
  if (hovered && hovered !== last) setLast(hovered);
  const shown = hovered ?? (over ? last : null);
  return <aside id="inspect-pointer" aria-label="Under pointer" className={styles.overlay} data-collapsed-inspector={inspectorCollapsed}
    hidden={!shown} onPointerEnter={() => setOver(true)} onPointerLeave={() => setOver(false)}>
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary className={styles.toggle} aria-expanded={expanded} aria-label={expanded ? "Collapse pointer details" : "Expand pointer details"}>
        {expanded ? "Under pointer" : "Position"}
      </summary>
      {expanded && <HoverBox hovered={shown} />}
    </details>
    {!expanded && <HoverBox hovered={shown} positionOnly />}
  </aside>;
}
