// The 3D view over the map. Loaded on the Editor tab's first visit (with three.js: most of the page's bytes).
import {useEffect, useRef, useState, type CSSProperties} from "react";
import type {Controls} from "./scene/controls";
import styles from "./EditorScene.module.css";
import {EditTools} from "./EditTools";
import type {Hovered} from "./types";
import {TrackView} from "./scene/view";

/** The track name in 3D; built: when it was built, built again it loads again (a Save leaves it: the view shows the track's
    source). title: its title, taken: the other tracks'. visible: its tab is open. controls: how it moves. fileHost, toolsHost, notesHost: where in the sidebar its buttons are drawn.
    onStatus gets what is loading; onSaved the track saved, by its name (a copy: another one). */
export default function EditorScene({name, title, taken, built, visible, controls, fileHost, savedHost, toolsHost, notesHost, onStatus, onSaved}: {
  name: string;
  title: string;
  taken: string[];
  built: number | null;
  visible: boolean;
  controls: Controls;
  fileHost: HTMLElement | null;
  savedHost: HTMLElement | null;
  toolsHost: HTMLElement | null;
  notesHost: HTMLElement | null;
  onStatus: (text: string, progress?: number | null) => void;
  onSaved: (name: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<TrackView | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [inspectorHost, setInspectorHost] = useState<HTMLDivElement | null>(null);
  const [inspectorWidth, setInspectorWidth] = useState(320);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  useEffect(() => {
    const v = new TrackView(host.current!);
    v.setHover(setHovered);
    setView(v);
    return () => { v.dispose(); setView(null); };
  }, []);

  useEffect(() => { view?.show(visible); }, [view, visible]);

  useEffect(() => { view?.setControls(controls); }, [view, controls]);

  useEffect(() => { void view?.open(name, onStatus); }, [view, name, built, onStatus]);

  return (
    <div className={styles.layout} hidden={!visible}
      style={{"--inspector-space": name && !inspectorCollapsed ? `min(${inspectorWidth + 5}px, 48%)` : "0px"} as CSSProperties}>
      <div id="scene" className={styles.scene} ref={scene}>
        <div className={styles.view} ref={host} />
      {view && name && <EditTools key={`${name} ${built}`} name={name} title={title} taken={taken} view={view} scene={scene} fileHost={fileHost} savedHost={savedHost} toolsHost={toolsHost} notesHost={notesHost} elevationSpeed={controls.elevationSpeed}
                                  inspectorHost={inspectorHost} hovered={hovered}
                                  inspectorWidth={inspectorWidth} onInspectorWidth={setInspectorWidth}
                                  inspectorCollapsed={inspectorCollapsed} onInspectorCollapsed={setInspectorCollapsed}
                                  reopen={() => void view.open(name, onStatus)} onSaved={onSaved} />}
      </div>
      <div className={styles.inspectorHost} ref={setInspectorHost} />
    </div>
  );
}
