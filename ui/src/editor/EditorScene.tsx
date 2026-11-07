// The 3D view over the map. Loaded on the Editor tab's first visit (with three.js: most of the page's bytes).
import {useEffect, useRef, useState} from "react";
import type {Controls} from "./controls";
import styles from "./EditorScene.module.css";
import {EditTools} from "./EditTools";
import {HoverBox} from "./HoverBox";
import {TrackView, type Hovered} from "./view";

/** The track name in 3D; built: when it was built, built again it loads again (a Save leaves it: the view shows the track's
    source). title: its title, taken: the other tracks'. visible: its tab is open. controls: how it moves. fileHost, toolsHost, notesHost: where in the sidebar its buttons are drawn.
    onStatus gets what is loading; onSaved the track saved, by its name (a copy: another one). */
export default function EditorScene({name, title, taken, built, visible, controls, fileHost, toolsHost, notesHost, onStatus, onSaved}: {
  name: string;
  title: string;
  taken: string[];
  built: number | null;
  visible: boolean;
  controls: Controls;
  fileHost: HTMLElement | null;
  toolsHost: HTMLElement | null;
  notesHost: HTMLElement | null;
  onStatus: (text: string) => void;
  onSaved: (name: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<TrackView | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);

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
    <div id="scene" className={styles.scene} hidden={!visible} ref={scene}>
      <div className={styles.view} ref={host} />
      {view && name && <EditTools key={`${name} ${built}`} name={name} title={title} taken={taken} view={view} scene={scene} fileHost={fileHost} toolsHost={toolsHost} notesHost={notesHost} elevationSpeed={controls.elevationSpeed}
                                  reopen={() => void view.open(name, onStatus)} onSaved={onSaved} />}
      <HoverBox hovered={hovered} />
    </div>
  );
}
